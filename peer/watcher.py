"""The always-on watcher (D6): plain code, no AI, until a new relevant item arrives.

Intake -> event store -> cheap relevance rules -> per-thread debounce -> one short brain run
(answer_thread) -> the executor (approval gate, presence, idempotency, log). The owner's DM to
the bot is the only place instructions come from.
"""
from __future__ import annotations

import json
import logging
import re
import threading
import time
from concurrent.futures import ThreadPoolExecutor
from typing import Any

from .activity import ActivityLog
from .adapters.directory import DirectoryAdapter
from .brain.runner import run_agent
from .brain.schemas import ANSWER_THREAD
from .events import Event
from .executor import Executor
from .memory.discovery import load_world
from .presence import Presence
from .settings import Settings
from .store import Store

log = logging.getLogger("peer.watch")

QUESTION = re.compile(r"\?|^\s*(who|what|when|where|why|how|is|are|can|could|does|do|will|should|any)\b", re.I | re.M)


class Watcher:
    def __init__(self, st: Settings, chat, dry_run: bool = False, synchronous: bool = False):
        self.st = st
        self.chat = chat
        self.dry_run = dry_run
        self.synchronous = synchronous
        self.store = Store(st.db_path)
        self.activity = ActivityLog(st.log_path)
        self.world = load_world()
        self.directory = DirectoryAdapter(st.profile_path(), extra_people=self.world.get("colleagues", []))
        self.profile = self.directory.profile()
        self.owner_chat_id = self._resolve_owner()
        self.people = self._resolve_people()
        first = self.profile.get("preferred_name") or self.profile["name"].split()[0]
        self.owner = {"name": self.profile["name"], "first": first, "chat_id": self.owner_chat_id}
        self.presence = Presence(st, chat, self.owner_chat_id, self.profile)
        self.executor = Executor(st, self.store, self.activity, chat, self.presence, self.owner, self.people, dry_run)
        self.keywords = self._load_keywords()
        self._timers: dict[str, threading.Timer] = {}
        self._busy: set[str] = set()
        self._again: set[str] = set()
        self._lock = threading.Lock()
        self.pool = ThreadPoolExecutor(max_workers=3)

    # -- setup ---------------------------------------------------------------------------
    def _resolve_owner(self) -> str | None:
        email = self.profile.get("slack_email") or self.profile.get("email")
        cached = self.store.get_kv("owner_chat_id")
        if cached and not hasattr(self.chat, "inject"):
            return cached
        if hasattr(self.chat, "lookup_email"):
            u = self.chat.lookup_email(email)
            if u:
                self.store.set_kv("owner_chat_id", u["id"])
                self.store.upsert_person(self.profile["person_id"], slack_id=u["id"])
                return u["id"]
        return getattr(self.chat, "owner_id", None)

    def _resolve_people(self) -> dict[str, dict]:
        out: dict[str, dict] = {}
        for c in self.world.get("colleagues", []):
            cid = None
            if hasattr(self.chat, "lookup_email"):
                u = self.chat.lookup_email(c["email"])
                cid = u["id"] if u else None
            elif hasattr(self.chat, "users"):
                cid = next((k for k, v in self.chat.users.items() if v.get("person_id") == c["person_id"]), None)
            if cid:
                out[cid] = {**c, "chat_id": cid}
                self.store.upsert_person(c["person_id"], slack_id=cid)
        return out

    def _load_keywords(self) -> list[re.Pattern]:
        path = self.st.owner_dir / "keywords.json"
        words = json.loads(path.read_text()) if path.exists() else []
        pats = []
        for w in words:
            if len(w.split()) <= 4 and len(w) <= 40:
                pats.append(re.compile(r"(?<![\w-])" + re.escape(w) + r"(?![\w-])", re.I))
        return pats

    def engageable(self, chat_id: str | None) -> bool:
        if not chat_id or chat_id in set(self.st.get("slack.never_engage", []) or []):
            return False
        if chat_id == self.owner_chat_id:
            return True
        if self.st.get("slack.engage_only_world", True):
            return chat_id in self.people
        return True

    # -- intake ------------------------------------------------------------------------
    def on_event(self, e: Event) -> None:
        if not self.engageable(e.actor):
            return  # never store or think about people outside the test world (e.g. real members)
        if not self.store.add_event(e):
            return  # duplicate (message + app_mention arrive twice)
        if e.kind == "reaction":   # WP2 F5: the owner's 🔕/👎 on a Peer DM means "less of this"
            if e.actor == self.owner_chat_id:
                self.owner_reaction(e)
            return
        if e.kind == "dm":
            if e.actor == self.owner_chat_id:
                self.owner_command(e)
            return
        if e.actor == self.owner_chat_id:
            th = self.store.thread(e.thread_ref) if e.thread_ref else None
            if th and th["peer_role"] in ("answered", "drafted"):
                self.store.mark_thread(e.thread_ref, th["channel"], th["thread_ts"], "owner_took_over", e.id)
                self.activity.add("stood_down", f"{self.owner['first']} replied in #{e.extra.get('channel_name')}; the Peer stands down there",
                                  where=f"#{e.extra.get('channel_name')}", outcome="done", ref=e.thread_ref, url=e.url)
            return
        ok, reason = self.cheap_relevance(e)
        if not ok:
            self.store.set_event_status(e.id, "skipped")
            return
        e.extra["cheap_reason"] = reason
        self.store.set_event_status(e.id, "queued")
        self.schedule(e.thread_ref)

    def cheap_relevance(self, e: Event) -> tuple[bool, str]:
        th = self.store.thread(e.thread_ref) if e.thread_ref else None
        if th and th["peer_role"] == "owner_took_over":
            return False, "owner took over this thread"
        if th and th["peer_role"] in ("answered", "drafted"):
            return True, "follow-up in a thread the Peer is in"
        if not self.st.get("roles.watch_my_work", True):
            return False, "watch my work is off"
        text = e.text or ""
        if self.owner_chat_id and f"<@{self.owner_chat_id}>" in text:
            return True, "mentions the owner"
        if e.kind == "mention":
            return True, "mentions the Peer"
        hits = [p.pattern for p in self.keywords if p.search(text)]
        if hits and QUESTION.search(text):
            return True, "a question about the owner's work"
        if hits:
            return True, "about the owner's work"
        return False, "no topic match"

    def schedule(self, thread_ref: str) -> None:
        if self.synchronous:
            self.process(thread_ref)
            return
        with self._lock:
            t = self._timers.pop(thread_ref, None)
            if t:
                t.cancel()
            t = threading.Timer(float(self.st.get("slack.debounce_s", 6)), lambda: self.pool.submit(self.process, thread_ref))
            t.daemon = True
            self._timers[thread_ref] = t
            t.start()

    # -- thinking ----------------------------------------------------------------------------
    def thread_context(self, thread_ref: str) -> list[dict]:
        items = []
        for ev in self.store.thread_events(thread_ref):
            who = self.owner["name"] if ev.actor == self.owner_chat_id else self.executor.person(ev.actor)["name"]
            role = self.profile["title"] if ev.actor == self.owner_chat_id else self.executor.person(ev.actor).get("title", "")
            tz = self.profile["tz"] if ev.actor == self.owner_chat_id else self.executor.person(ev.actor).get("tz", "")
            items.append({"at": ev.at, "who": who, "role": role, "tz": tz, "text": self.executor.sanitize(ev.text), "event_id": ev.id})
        rows = self.store.conn().execute(
            "SELECT payload, created_at FROM actions WHERE action='post_reply' AND target=? AND status='done'", (thread_ref,)).fetchall()
        for r in rows:
            items.append({"at": r["created_at"], "who": f"{self.owner['first']}'s AI Peer (you)", "role": "AI Peer", "tz": "",
                          "text": json.loads(r["payload"])["text"]})
        return sorted(items, key=lambda x: x["at"])

    def process(self, thread_ref: str) -> None:
        with self._lock:
            if thread_ref in self._busy:
                self._again.add(thread_ref)
                return
            self._busy.add(thread_ref)
        try:
            queued = [ev for ev in self.store.thread_events(thread_ref) if self.store.conn().execute(
                "SELECT status FROM events WHERE id=?", (ev.id,)).fetchone()["status"] == "queued"]
            if not queued:
                return
            newest = queued[-1]
            for ev in queued[:-1]:
                self.store.set_event_status(ev.id, "folded")
            self.think_and_act(newest)
        except Exception:  # noqa: BLE001
            log.exception("processing %s failed", thread_ref)
        finally:
            with self._lock:
                self._busy.discard(thread_ref)
                again = thread_ref in self._again
                self._again.discard(thread_ref)
            if again:
                self.schedule(thread_ref)

    def think_and_act(self, e: Event) -> dict:
        pres = self.presence.state(fresh=True)
        th = self.store.thread(e.thread_ref) if e.thread_ref else None
        peer_in = bool(th and th["peer_role"] in ("answered",))
        if pres["status"] == "away" and self.st.get("roles.stand_in_when_away", True):
            try:
                self.chat.act("react", e.extra.get("channel"), {"channel": e.extra.get("channel"), "ts": e.extra.get("ts"),
                                                                 "name": "eyes"}, f"react:{e.id}", dry_run=self.dry_run)
            except Exception:  # noqa: BLE001
                pass
        asker = self.executor.person(e.actor)
        request = {
            "playbook": "answer_thread", "from_owner": False,
            "owner": {"name": self.owner["name"], "first": self.owner["first"], "presence": pres["status"],
                      "local_time": pres["local_time"], "where": pres["where"]},
            "channel": f"#{e.extra.get('channel_name')}", "peer_in_thread": peer_in,
            "thread": self.thread_context(e.thread_ref),
            "newest": {"who": asker["name"], "role": asker.get("title", ""), "tz": asker.get("tz", ""),
                       "text": self.executor.sanitize(e.text), "at": e.at},
            "cheap_rule": e.extra.get("cheap_reason"),
        }
        t0 = time.time()
        res = run_agent("answer_thread " + json.dumps(request, ensure_ascii=False), ANSWER_THREAD, label=f"answer:{e.id}")
        if not res.ok:
            self.store.set_event_status(e.id, "failed")
            self.activity.add("failed", f"Could not think about {asker['name']}'s message in #{e.extra.get('channel_name')}: {res.error}",
                              who_asked=asker["name"], where=f"#{e.extra.get('channel_name')}", outcome="failed", ref=e.id, url=e.url)
            return {"did": "failed", "error": res.error}
        out = self.executor.handle_answer(e, res.output, pres, peer_in)
        self.store.set_event_status(e.id, "handled")
        try:   # WP2 F6: the thread becomes a memory file
            from .fresh import note_thread
            note_thread(self.st, e, res.output, out)
        except Exception:  # noqa: BLE001
            log.exception("thread note failed")
        log.info("handled %s in %.0fs via %s: %s", e.id, time.time() - t0, res.backend, out.get("did"))
        out.update(backend=res.backend, brain_s=round(res.duration_s, 1), result=res.output)
        return out

    # -- the owner's DM: the only instruction channel ---------------------------------------------
    def owner_command(self, e: Event) -> None:
        text = re.sub(r"<@[A-Z0-9]+>", "", e.text or "").strip().lower().rstrip(".!")
        reply = None
        if text in ("away", "i'm away", "im away", "i am away", "cover for me"):
            self.st.set("presence.manual", "away")
            reply = "Got it: you're away. I'll answer what I can in threads about your work, and tell you here. Say *back* when you return."
        elif text in ("back", "i'm back", "im back", "i am back", "auto"):
            self.st.set("presence.manual", "auto")
            reply = "Welcome back. I'll go by your Slack presence and working hours again, and show you drafts first while you're online."
        elif text in ("online", "i'm online"):
            self.st.set("presence.manual", "online")
            reply = "OK: I'll treat you as online and show you a draft first for everything."
        elif text in ("status", "help", "?"):
            p = self.presence.state(fresh=True)
            roles = ", ".join(k.replace("_", " ") for k, v in (self.st.get("roles") or {}).items() if v)
            reply = (f"You are *{p['status']}* ({p['reason']}; {p['local_time']} in {p['where']}). Roles on: {roles}. "
                     f"Brain: {self.st.get('brain.backend')}.\nSay *away*, *back*, *online* or *brief me*.")
        elif text in ("undo", "undo that", "undo the last rule"):
            from .tuning import undo
            r = undo(self.st, who=self.owner["first"])
            reply = f"Undone: {r}" if r else "There's no rule of yours to undo."
        if reply is None and text.rstrip("?") in ("brief me", "brief", "my brief", "daily brief", "morning brief", "brief me now"):
            from .brief import brief_me   # WP3 S2: the brief on request, matched before F5's feedback fallthrough
            if self.synchronous:
                brief_me(self, e)
            else:
                self.pool.submit(brief_me, self, e)
            return
        if reply is None and text.startswith("cover") and "meeting" in text:   # WP4 (S3): "cover meeting <link> at 20:30"
            from .meetings.cover import from_dm
            reply = from_dm(self.st, re.sub(r"<@[A-Z0-9]+>", "", e.text or "").strip())
        if reply is None and text:   # WP2 F5: anything else may be feedback ("less of this")
            if self.synchronous:
                self.tune(e)
            else:
                self.pool.submit(self.tune, e)
            return
        if reply:
            self.activity.add("owner_instruction", f"{self.owner['first']} said “{text}”", who_asked=self.owner["first"],
                              where="DM", said=reply, outcome="done", ref=e.id)
            self.chat.act("post_reply", e.extra["channel"], {"channel": e.extra["channel"], "thread_ts": None, "text": reply},
                          f"cmd:{e.id}", dry_run=self.dry_run)

    # -- WP2 F5: self-tuning from the owner's DM -------------------------------------------------------
    def tune(self, e: Event, about: dict | None = None, said: str | None = None) -> dict:
        from .tuning import apply_feedback
        text = said or re.sub(r"<@[A-Z0-9]+>", "", e.text or "").strip()
        if about is None:
            th = e.extra.get("thread_ts")
            about = (self.store.get_kv(f"dm_item:{th}") if th else None) or self.store.get_kv("last_told_item")
        out = apply_feedback(self.st, text, about, self.owner["first"], via="DM")
        reply = out.get("confirm") or ("Noted." if out.get("is_feedback") else
                                       "I take instructions here: *away*, *back*, *online*, *status*, *brief me*, or tell me what to do less or more of.")
        self.chat.act("post_reply", e.extra["channel"], {"channel": e.extra["channel"], "thread_ts": e.extra.get("thread_ts"),
                                                         "text": reply}, f"tune:{e.id}", dry_run=self.dry_run)
        if not out.get("is_feedback"):
            self.activity.add("owner_instruction", f"{self.owner['first']} said “{text[:80]}”", who_asked=self.owner["first"],
                              where="DM", said=reply, outcome="done", ref=e.id)
        return out

    def owner_reaction(self, e: Event) -> None:
        from .tuning import NEGATIVE_REACTIONS
        if e.extra.get("reaction") not in NEGATIVE_REACTIONS or not str(e.extra.get("channel", "")).startswith("D"):
            return
        item = self.store.get_kv(f"dm_item:{e.extra.get('ts')}")
        if not item:
            return
        e.extra["thread_ts"] = e.extra.get("ts")   # confirm in the thread of the DM reacted to
        if self.synchronous:
            self.tune(e, about=item, said=f"less of this (reacted :{e.extra.get('reaction')}:)")
        else:
            self.pool.submit(self.tune, e, item, f"less of this (reacted :{e.extra.get('reaction')}:)")

    # -- run ----------------------------------------------------------------------------------
    def join_world_channels(self) -> list[str]:
        names = {c["name"] for c in self.world.get("channels", [])} - {"general"}
        joined = []
        if not hasattr(self.chat, "bot"):
            return joined
        cursor = None
        while True:
            r = self.chat.bot.conversations_list(types="public_channel", exclude_archived=True, limit=200, cursor=cursor)
            for ch in r.get("channels", []):
                if ch["name"] in names and not ch.get("is_member"):
                    self.chat.bot.conversations_join(channel=ch["id"])
                    joined.append(ch["name"])
            cursor = r.get("response_metadata", {}).get("next_cursor")
            if not cursor:
                break
        return joined

    def run_forever(self) -> None:
        joined = self.join_world_channels()
        log.info("owner %s; %d colleagues in Slack; joined %s; presence %s", self.owner_chat_id, len(self.people),
                 joined or "nothing new", self.presence.state(fresh=True))
        self.chat.listen(self.on_event, self.executor.on_interactive)
        from .jobs import Jobs   # WP2: GitHub poll (F5/F6), local work (F7), nightly re-read (F6)
        Jobs(self).start()
        self.activity.add("started", "The Peer started watching", outcome="done",
                          extra={"backend": self.st.get("brain.backend"), "colleagues": len(self.people)})
        while True:
            time.sleep(30)
