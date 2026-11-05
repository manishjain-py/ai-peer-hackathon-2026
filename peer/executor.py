"""Action executor: the approval gate (D9), presence check, idempotency, activity log.

The AI proposes, the program acts. For a colleague's question (S1):
- owner online -> DM the owner a draft with Send / Edit / Skip; nothing posts until he clicks.
- owner away   -> reply in the thread as the labelled Peer (who it is, that the owner is away
                  and his local time, the answer, sources, certainty and date), then keep one DM
                  summary per thread up to date.
Emails, invites and commitments always ask first. Safety: no @-mentions or @channel in what
the Peer posts, only people the Peer may engage with, never speaking as the owner.
"""
from __future__ import annotations

import json
import logging
import re
import threading
from datetime import datetime
from typing import Any

from .activity import ActivityLog
from .events import Event
from .settings import Settings
from .store import Store

log = logging.getLogger("peer.executor")

MENTION = re.compile(r"<@([UW][A-Z0-9]+)(?:\|[^>]*)?>")
BROADCAST = re.compile(r"<!(channel|here|everyone|subteam\^[A-Z0-9]+)(\|[^>]*)?>")


def fmt_date(s: str | None) -> str:
    if not s:
        return "an unknown date"
    m = re.search(r"(\d{4})-(\d{2})-(\d{2})", s)
    if not m:
        return s
    d = datetime(int(m.group(1)), int(m.group(2)), int(m.group(3)))
    return f"{d.day} {d.strftime('%b %Y')}"


def fmt_sources(sources: list[dict]) -> str:
    parts = []
    for s in sources[:4]:
        url, title = (s.get("url") or "").strip(), (s.get("title") or "source").strip()
        date = fmt_date(s.get("date")) if s.get("date") else ""
        if url.startswith("http"):
            parts.append(f"<{url}|{title}>" + (f" ({date})" if date else ""))
        else:
            parts.append(title + (f" ({date})" if date else ""))
    return " · ".join(parts) if parts else "none found in my records"


class Executor:
    def __init__(self, st: Settings, store: Store, activity: ActivityLog, chat, presence,
                 owner: dict, people_by_chat_id: dict[str, dict], dry_run: bool = False):
        self.st, self.store, self.activity, self.chat = st, store, activity, chat
        self.presence = presence
        self.owner = owner                         # {name, first, chat_id}
        self.people = people_by_chat_id            # chat id -> {name, title, ...}
        self.dry_run = dry_run
        self._lock = threading.Lock()

    # -- helpers ---------------------------------------------------------------------
    def person(self, chat_id: str | None) -> dict:
        if chat_id and chat_id in self.people:
            return self.people[chat_id]
        info = self.chat.user_info(chat_id) if chat_id else {}
        return {"name": info.get("real_name") or info.get("name") or "someone", "title": info.get("title") or ""}

    def sanitize(self, text: str) -> str:
        """No @-mentions (names instead) and no broadcasts in anything the Peer posts."""
        text = MENTION.sub(lambda m: self.person(m.group(1)).get("name", "someone"), text or "")
        text = BROADCAST.sub("", text)
        return text.strip()

    def _act(self, action: str, target: str, payload: dict, key: str) -> dict:
        if not self.chat.offers(action):
            raise RuntimeError(f"no adapter offers {action}")
        return self.chat.act(action, target, payload, key, dry_run=self.dry_run)

    def compose_reply(self, result: dict, mode: str, asker_first: str, pres: dict, text: str | None = None) -> str:
        owner_first = self.owner["first"]
        body = self.sanitize(text if text is not None else result.get("reply", ""))
        meta = (f"Sources: {fmt_sources(result.get('sources', []))}. "
                f"Certainty: {result.get('certainty', 'medium')}, as of {fmt_date(result.get('as_of'))}.")
        if mode == "away_first":
            head = (f":robot_face: Hi {asker_first}, I'm *{owner_first}'s AI Peer*, an AI assistant that covers for "
                    f"{owner_first}. {owner_first} is offline right now (it's {pres['local_time']} in {pres['where']}), "
                    f"so here is what {owner_first}'s work records say:")
            tail = f"_{meta} I can't make commitments on {owner_first}'s behalf; this thread will be waiting when {owner_first} is back._"
            return f"{head}\n\n{body}\n\n{tail}"
        if mode == "followup":
            return f"{body}\n\n_{owner_first}'s AI Peer (AI) · {meta}_"
        who = f"{owner_first} edited and approved this answer" if mode == "approved_edited" else f"{owner_first} reviewed this answer"
        return f":robot_face: *{owner_first}'s AI Peer* here, an AI assistant. {who}:\n\n{body}\n\n_{meta}_"

    # -- the policy -------------------------------------------------------------------------
    def handle_answer(self, e: Event, result: dict, pres: dict, peer_in_thread: bool) -> dict:
        asker = self.person(e.actor)
        where = f"#{e.extra.get('channel_name')}"
        if not result.get("relevant"):
            self.activity.add("noticed", f"Saw {asker['name']} in {where}; not for {self.owner['first']}",
                              who_asked=asker["name"], where=where, said=None, outcome="ignored",
                              ref=e.id, url=e.url, extra={"reason": result.get("relevance_reason")})
            self.store.set_event_status(e.id, "ignored")
            return {"did": "nothing"}
        stand_in = bool(self.st.get("roles.stand_in_when_away", True))
        if pres["status"] == "away" and stand_in:
            mode = "followup" if peer_in_thread else "away_first"
            r = self.post_reply(e, result, mode, pres)
            self.update_dm_summary(e, result, pres, r)
            return {"did": "answered_in_thread", **r}
        return self.send_draft(e, result, pres)

    def send_draft(self, e: Event, result: dict, pres: dict) -> dict:
        key = f"draft:{e.id}"
        if self.store.action(key):
            return {"did": "already_drafted"}
        asker = self.person(e.actor)
        ch = e.extra.get("channel_name")
        reply = self.sanitize(result.get("reply", ""))
        question = self.sanitize(e.text)[:600]
        blocks = [
            {"type": "section", "text": {"type": "mrkdwn", "text":
                f":speech_balloon: *{asker['name']}* ({asker.get('title') or 'colleague'}) asked in *#{ch}* "
                f"(<{e.url}|open the thread>):\n>{question.replace(chr(10), chr(10) + '>')}"}},
            {"type": "section", "text": {"type": "mrkdwn", "text": f"*Why it matters:* {result.get('why_it_matters', '')}"}},
            {"type": "section", "text": {"type": "mrkdwn", "text":
                f"*Draft reply* (certainty {result.get('certainty')}, as of {fmt_date(result.get('as_of'))}):\n{reply}"}},
            {"type": "context", "elements": [{"type": "mrkdwn", "text": "Sources: " + fmt_sources(result.get("sources", []))}]},
        ]
        if result.get("needs_owner") and result.get("owner_note"):
            blocks.append({"type": "section", "text": {"type": "mrkdwn", "text": f":raised_hand: *Needs you:* {result['owner_note']}"}})
        blocks.append({"type": "actions", "block_id": "peer_draft", "elements": [
            {"type": "button", "action_id": "peer_send", "style": "primary", "value": key, "text": {"type": "plain_text", "text": "Send"}},
            {"type": "button", "action_id": "peer_edit", "value": key, "text": {"type": "plain_text", "text": "Edit"}},
            {"type": "button", "action_id": "peer_skip", "value": key, "text": {"type": "plain_text", "text": "Skip"}}]})
        fallback = f"{asker['name']} asked in #{ch}: draft reply ready (Send / Edit / Skip)"
        r = self._act("dm", self.owner["chat_id"], {"text": fallback, "blocks": blocks}, key)
        self.store.put_action(key, "draft", e.thread_ref or "", {
            "event": json.loads(e.to_json()), "result": result, "dm_channel": r.get("channel"), "dm_ts": r.get("ts"),
            "blocks": blocks, "presence": pres}, "pending_approval", event_id=e.id, result=r)
        self.store.mark_thread(e.thread_ref, e.extra.get("channel"), e.extra.get("thread_ts") or e.extra.get("ts"), "drafted", e.id)
        self.activity.add("drafted_for_owner", f"Drafted a reply to {asker['name']} in #{ch} for {self.owner['first']} to approve",
                          who_asked=asker["name"], where=f"#{ch}", said=reply, sources=result.get("sources", []),
                          outcome="pending_approval", needs_review=True, ref=key, url=e.url,
                          extra={"question": e.text, "certainty": result.get("certainty"), "presence": pres.get("reason")})
        return {"did": "drafted", "dm_ts": r.get("ts")}

    def post_reply(self, e: Event, result: dict, mode: str, pres: dict, text: str | None = None,
                   approval_key: str | None = None) -> dict:
        key = f"reply:{e.id}"
        done = self.store.action(key)
        if done and done["status"] == "done":
            return done["result"] or {}
        asker = self.person(e.actor)
        first = asker["name"].split()[0]
        body = self.compose_reply(result, mode, first, pres, text)
        thread_ts = e.extra.get("thread_ts") or e.extra.get("ts")
        r = self._act("post_reply", e.extra.get("channel"), {"channel": e.extra.get("channel"), "thread_ts": thread_ts, "text": body}, key)
        self.store.put_action(key, "post_reply", e.thread_ref or "", {"text": body, "mode": mode}, "done", event_id=e.id, result=r)
        self.store.mark_thread(e.thread_ref, e.extra.get("channel"), thread_ts, "answered", e.id)
        kind = {"away_first": "answered_in_thread", "followup": "answered_follow_up"}.get(mode, "sent_after_approval")
        summary = {"away_first": f"Answered {asker['name']} in #{e.extra.get('channel_name')} while {self.owner['first']} was away",
                   "followup": f"Answered a follow-up from {asker['name']} in #{e.extra.get('channel_name')}",
                   "approved": f"Posted the reply {self.owner['first']} approved in #{e.extra.get('channel_name')}",
                   "approved_edited": f"Posted {self.owner['first']}'s edited reply in #{e.extra.get('channel_name')}"}[mode]
        self.activity.add(kind, summary, who_asked=asker["name"], where=f"#{e.extra.get('channel_name')}", said=body,
                          sources=result.get("sources", []), outcome="dry_run" if self.dry_run else "done",
                          needs_review=mode in ("away_first", "followup") and bool(result.get("needs_owner")),
                          ref=approval_key or key, url=r.get("permalink") or e.url,
                          extra={"question": e.text, "certainty": result.get("certainty"), "as_of": result.get("as_of"),
                                 "presence": pres.get("reason"), "owner_note": result.get("owner_note")})
        return r

    def update_dm_summary(self, e: Event, result: dict, pres: dict, posted: dict) -> None:
        kv_key = f"dmsum:{e.thread_ref}"
        cur = self.store.get_kv(kv_key) or {"lines": []}
        asker = self.person(e.actor)
        q = self.sanitize(e.text).replace("\n", " ")
        q = q[:140] + ("…" if len(q) > 140 else "")
        line = f"• {pres['local_time']}: *{asker['name']}* asked “{q}” → I answered (certainty {result.get('certainty')})."
        if result.get("needs_owner") and result.get("owner_note"):
            line += f"\n   :raised_hand: *Needs you:* {result['owner_note']}"
        cur["lines"].append(line)
        link = posted.get("permalink") or e.url
        text = (f":robot_face: *While you were away* I covered a thread in *#{e.extra.get('channel_name')}* "
                f"(<{link}|open it>):\n" + "\n".join(cur["lines"]) +
                "\n_Everything I said is in the thread and the activity log. Reply here to tell me what to do differently._")
        if cur.get("ts") and cur.get("channel"):
            self._act("update_message", cur["channel"], {"channel": cur["channel"], "ts": cur["ts"], "text": text}, kv_key + ":upd")
        else:
            r = self._act("dm", self.owner["chat_id"], {"text": text}, kv_key)
            cur.update(channel=r.get("channel"), ts=r.get("ts"))
        self.store.set_kv(kv_key, cur)

    # -- the owner's clicks (Send / Edit / Skip) ------------------------------------------------
    def on_interactive(self, payload: dict) -> dict | None:
        user = (payload.get("user") or {}).get("id")
        if user != self.owner["chat_id"]:
            log.warning("ignored a click from %s (not the owner)", user)
            return None
        if payload.get("type") == "block_actions":
            act = (payload.get("actions") or [{}])[0]
            key, aid = act.get("value"), act.get("action_id")
            if str(aid or "").startswith("brief_"):   # WP3 S2: the brief's buttons (Draft reply, Accept, Send email, Discard)
                from .brief import on_click
                threading.Thread(target=on_click, args=(self, payload), daemon=True).start()
                return None
            pending = self.store.action(key) if key else None
            if not pending or pending["status"] != "pending_approval":
                return None
            if aid == "peer_edit":
                draft = self.sanitize(pending["payload"]["result"].get("reply", ""))
                self._act("open_modal", "", {"trigger_id": payload["trigger_id"], "view": {
                    "type": "modal", "callback_id": "peer_edit", "private_metadata": key,
                    "title": {"type": "plain_text", "text": "Edit the reply"},
                    "submit": {"type": "plain_text", "text": "Send"}, "close": {"type": "plain_text", "text": "Cancel"},
                    "blocks": [{"type": "input", "block_id": "draft", "label": {"type": "plain_text", "text": "Reply to post in the thread"},
                                "element": {"type": "plain_text_input", "action_id": "text", "multiline": True,
                                            "initial_value": draft[:2900]}}]}}, key + ":modal")
                return None
            if aid in ("peer_send", "peer_skip"):
                threading.Thread(target=self._finish, args=(key, aid, None), daemon=True).start()
            return None
        if payload.get("type") == "view_submission" and (payload.get("view") or {}).get("callback_id") == "peer_edit":
            key = payload["view"].get("private_metadata")
            text = payload["view"]["state"]["values"]["draft"]["text"]["value"]
            threading.Thread(target=self._finish, args=(key, "peer_send", text), daemon=True).start()
            return None
        return None

    def _finish(self, key: str, aid: str, edited: str | None) -> None:
        if not self.store.claim_action(key, "pending_approval", "working"):
            return  # a double click, or already handled
        pending = self.store.action(key)
        p = pending["payload"]
        e = Event.from_dict(p["event"])
        result = p["result"]
        dm_ch, dm_ts = p.get("dm_channel"), p.get("dm_ts")
        try:
            if aid == "peer_skip":
                self.store.put_action(key, "draft", pending["target"], p, "skipped", event_id=e.id)
                note = f":fast_forward: Skipped. I won't reply to {self.person(e.actor)['name']} in this thread."
                self.activity.add("skipped_by_owner", f"{self.owner['first']} skipped the draft for #{e.extra.get('channel_name')}",
                                  who_asked=self.person(e.actor)["name"], where=f"#{e.extra.get('channel_name')}",
                                  outcome="skipped", ref=key, url=e.url)
            else:
                pres = self.presence.state()
                mode = "approved_edited" if edited is not None else "approved"
                r = self.post_reply(e, result, mode, pres, text=edited, approval_key=key)
                self.store.put_action(key, "draft", pending["target"], p, "sent", event_id=e.id, result=r)
                note = f":white_check_mark: Sent in the thread{' (your edit)' if edited is not None else ''}: <{r.get('permalink') or e.url}|open it>."
            blocks = [b for b in p.get("blocks", []) if b.get("type") != "actions"]
            blocks.append({"type": "context", "elements": [{"type": "mrkdwn", "text": note}]})
            if dm_ch and dm_ts:
                self._act("update_message", dm_ch, {"channel": dm_ch, "ts": dm_ts, "text": note, "blocks": blocks}, key + ":done")
        except Exception as ex:  # noqa: BLE001
            log.exception("finishing %s failed", key)
            self.store.put_action(key, "draft", pending["target"], p, "pending_approval", event_id=e.id)
            self.activity.add("failed", f"Could not finish the draft action: {ex}", outcome="failed", ref=key)
