"""Before the meeting: a cover request, the owner's update, his one-tap approval (S3 "Before").

A meeting reaches the Peer as one request from the CLI (`peer meeting cover test --at ... --title ...`),
a DM line ("cover meeting <link> at 20:30"), or a calendar event he hands it (calendar.py). The Peer
drafts his update from memory (never committing him, D9) and DMs it with Approve update / Edit / Skip
through the meetings door (notify.send_meeting_dm). On approval the clip is rendered and kept with the
meeting. Skip: it attends without an update and takes notes. "Cover meetings" off: no offers, no joins.
"""
from __future__ import annotations

import json
import logging
import re
import threading
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from ..activity import ActivityLog
from ..adapters.meetings import MeetingRefused, MeetingsAdapter
from ..brain.runner import run_agent
from ..brain.schemas import MEETING_UPDATE
from ..events import now_iso
from ..executor import fmt_date, fmt_sources
from ..notify import MEETING_BUTTONS, send_meeting_dm
from ..settings import Settings, secret
from . import store as mstore

log = logging.getLogger("peer.meetings.cover")
PREFIX = "peer_mtg_"


def profile(st: Settings) -> dict:
    return json.loads(st.profile_path().read_text())


def first_name(st: Settings) -> str:
    p = profile(st)
    return p.get("preferred_name") or p["name"].split()[0]


def parse_when(text: str | None, tz: str = "Asia/Kolkata") -> str:
    """ISO, 'now', '+5m' / 'in 5 min', or HH:MM in the owner's time zone (the next one) -> ISO UTC."""
    now = datetime.now(timezone.utc)
    s = (text or "now").strip().lower()
    if s == "now":
        return now.isoformat(timespec="seconds")
    m = re.match(r"^(?:\+|in )\s*(\d+)\s*(?:m|min|mins|minutes?)?$", s)
    if m:
        return (now + timedelta(minutes=int(m.group(1)))).isoformat(timespec="seconds")
    m = re.match(r"^(\d{1,2}):(\d{2})\s*(am|pm)?$", s) or re.match(r"^(\d{1,2})()\s*(am|pm)$", s)
    if m:
        h, mi = int(m.group(1)), int(m.group(2) or 0)
        if m.group(3) == "pm" and h < 12:
            h += 12
        if m.group(3) == "am" and h == 12:
            h = 0
        local = now.astimezone(ZoneInfo(tz))
        cand = local.replace(hour=h, minute=mi, second=0, microsecond=0)
        if cand < local - timedelta(minutes=5):
            cand += timedelta(days=1)
        return cand.astimezone(timezone.utc).isoformat(timespec="seconds")
    d = datetime.fromisoformat(text.strip().replace("Z", "+00:00"))
    if d.tzinfo is None:
        d = d.replace(tzinfo=ZoneInfo(tz))
    return d.astimezone(timezone.utc).isoformat(timespec="seconds")


def local_time(st: Settings, iso: str | None) -> str:
    if not iso:
        return "an unknown time"
    d = datetime.fromisoformat(iso.replace("Z", "+00:00")).astimezone(ZoneInfo(profile(st).get("tz", "Asia/Kolkata")))
    return d.strftime("%-I:%M %p on %a %-d %b")


# -- the request ----------------------------------------------------------------------------------------
def request(st: Settings, link: str, *, at: str | None, title: str, end: str | None = None, organizer: str | None = None,
            source: str = "cli", source_ref: str | None = None, seeded: bool = False, minutes: int = 30) -> dict:
    """One request, whatever its source. Refuses (and logs) when the role is off or the link is not allowed."""
    act = ActivityLog(st.log_path)
    url = secret("ZOOM_TEST_MEETING_URL") if link.strip().lower() == "test" else link.strip().strip("<>").split("|")[0]
    label = MeetingsAdapter.label(url, title)
    if not st.get("roles.cover_meetings", True):
        act.add("held_back", f"Did not take {title} (Cover meetings is off)", where=label, outcome="skipped")
        return {"ok": False, "why": "Cover meetings is off in your roles"}
    ok, why = MeetingsAdapter(st).allowed(url)
    if not ok:
        act.add("refused", f"Would not cover {title}: {why}", where=label, outcome="skipped")
        return {"ok": False, "why": why}
    start = parse_when(at, profile(st).get("tz", "Asia/Kolkata"))
    end = parse_when(end) if end else (datetime.fromisoformat(start) + timedelta(minutes=minutes)).isoformat(timespec="seconds")
    m = mstore.add(st, title=title, start=start, end=end, zoom_url=url, label=label, organizer=organizer, source=source,
                   source_ref=source_ref, seeded=seeded)
    act.add("meeting_requested", f"Will cover {title} ({label}) at {local_time(st, start)}", where=label, outcome="done",
            ref=f"meeting:{m['id']}", extra={"meeting_id": m["id"], "source": source, "seeded": seeded})
    return {"ok": True, "meeting": m}


# -- the update -------------------------------------------------------------------------------------------
def draft_update(st: Settings, mid: str) -> dict:
    m = mstore.get(st, mid)
    p = profile(st)
    req = {"playbook": "draft_meeting_update", "from_owner": False,
           "meeting": {"title": m["title"], "start": m["start"], "end": m["end"], "organizer": m.get("organizer")},
           "owner": {"name": p["name"], "first": first_name(st)}}
    res = run_agent("draft_meeting_update " + json.dumps(req, ensure_ascii=False), MEETING_UPDATE, label=f"meeting-update:{mid}",
                    effort=st.get("brain.claude_effort", "high"))
    if not res.ok:
        ActivityLog(st.log_path).add("failed", f"Could not draft the update for {m['title']}: {res.error}", outcome="failed",
                                     ref=f"meeting:{mid}")
        return {"ok": False, "error": res.error}
    out = {**res.output, "drafted_at": now_iso(), "brain_s": round(res.duration_s, 1)}
    mstore.update(st, mid, update=out)
    return {"ok": True, "update": out}


def card_blocks(st: Settings, m: dict, upd: dict, note: str | None = None) -> list:
    first = first_name(st)
    blocks = [
        {"type": "section", "text": {"type": "mrkdwn", "text":
            f":calendar: *{m['title']}* · {local_time(st, m['start'])} ({m['label']})\n"
            f"You handed me this meeting. Here is the update I'd play for you when someone asks "
            f"(as of {fmt_date(upd.get('as_of'))}):"}},
        {"type": "section", "text": {"type": "mrkdwn", "text": ">" + upd.get("update", "").replace("\n", "\n>")}},
        {"type": "context", "elements": [{"type": "mrkdwn", "text": "Sources: " + fmt_sources(upd.get("sources", []))}]},
        {"type": "context", "elements": [{"type": "mrkdwn", "text":
            f"I join as *{first}'s AI Peer* and say I'm your AI assistant; I answer other questions with how sure I am and "
            f"flag what needs you. I never commit you to anything."}]},
    ]
    if note:
        blocks.append({"type": "context", "elements": [{"type": "mrkdwn", "text": note}]})
    else:
        blocks.append({"type": "actions", "block_id": "peer_mtg", "elements": [
            {"type": "button", "action_id": aid, "value": m["id"], "text": {"type": "plain_text", "text": label},
             **({"style": style} if style else {})} for aid, label, style in MEETING_BUTTONS]})
    return blocks


def send_card(st: Settings, chat, owner_chat_id: str | None, mid: str, *, dry_run: bool = False) -> dict:
    m = mstore.get(st, mid)
    upd = m["data"].get("update") or {}
    r = send_meeting_dm(st, chat, owner_chat_id, f"Your update for {m['title']} is ready (Approve update / Edit / Skip)",
                        card_blocks(st, m, upd), f"mtgcard:{mid}", kind="meeting_update_drafted",
                        summary=f"Drafted {first_name(st)}'s update for {m['title']} to approve", dry_run=dry_run,
                        sources=upd.get("sources"), needs_review=True, meeting_id=mid, said=upd.get("update"))
    if r.get("did") == "sent":
        mstore.update(st, mid, status="drafted", card={"channel": r.get("channel"), "ts": r.get("ts")})
    return r


def approve(st: Settings, mid: str, text: str | None = None, *, by: str = "owner") -> dict:
    """The owner's tap (or edit): render the clip with ~1 s of silence in front, keep it with the meeting."""
    from ..adapters.voice import VoiceAdapter, duration_s
    m = mstore.get(st, mid)
    upd = dict(m["data"].get("update") or {})
    if text is not None:
        upd["update"], upd["edited"] = text.strip(), True
    v = VoiceAdapter(st)
    clip = v.render(upd["update"], "peer")
    mstore.update(st, mid, status="approved", update=upd, update_clip=str(clip), update_clip_s=round(duration_s(clip), 2),
                  update_engine=v.engine, approved_at=now_iso(), approved_by=by)
    ActivityLog(st.log_path).add("meeting_update_approved", f"{first_name(st)} {'edited and approved' if text is not None else 'approved'} "
                                 f"the update for {m['title']}", who_asked=first_name(st), where="DM", said=upd["update"],
                                 sources=upd.get("sources"), outcome="done", ref=f"mtgcard:{mid}", extra={"meeting_id": mid})
    ActivityLog(st.log_path).resolve(f"mtgcard:{mid}", "done", "Update approved")
    return {"ok": True, "clip": str(clip)}


def skip(st: Settings, mid: str) -> dict:
    m = mstore.get(st, mid)
    mstore.update(st, mid, status="skipped", skipped_at=now_iso())
    ActivityLog(st.log_path).add("meeting_update_skipped", f"{first_name(st)} skipped the update for {m['title']}; the Peer "
                                 f"attends without one and takes notes", where="DM", outcome="skipped", ref=f"mtgcard:{mid}",
                                 extra={"meeting_id": mid})
    ActivityLog(st.log_path).resolve(f"mtgcard:{mid}", "skipped", "Update skipped")
    return {"ok": True}


# -- the owner's taps on the card (routed here by the executor, before S1's draft check) --------------------------
def on_click(ex, payload: dict) -> None:
    st = ex.st
    if payload.get("type") == "view_submission":
        mid = payload["view"].get("private_metadata")
        text = payload["view"]["state"]["values"]["update"]["text"]["value"]
        threading.Thread(target=_finish, args=(ex, mid, "approve", text), daemon=True).start()
        return None
    act = (payload.get("actions") or [{}])[0]
    aid, mid = act.get("action_id", ""), act.get("value")
    if aid in (PREFIX + "cover", PREFIX + "nocover"):   # the calendar's "Cover for me" offer
        from .calendar import on_offer_click
        return on_offer_click(ex, payload)
    m = mstore.get(st, mid) if mid else None
    if not m:
        return None
    if aid == PREFIX + "edit":
        ex._act("open_modal", "", {"trigger_id": payload.get("trigger_id"), "view": {
            "type": "modal", "callback_id": PREFIX + "edit", "private_metadata": mid,
            "title": {"type": "plain_text", "text": "Edit your update"},
            "submit": {"type": "plain_text", "text": "Approve update"}, "close": {"type": "plain_text", "text": "Cancel"},
            "blocks": [{"type": "input", "block_id": "update", "label": {"type": "plain_text", "text": "What the Peer will say"},
                        "element": {"type": "plain_text_input", "action_id": "text", "multiline": True,
                                    "initial_value": (m["data"].get("update") or {}).get("update", "")[:2900]}}]}},
            f"mtgcard:{mid}:modal")
        return None
    if aid in (PREFIX + "approve", PREFIX + "skip"):
        threading.Thread(target=_finish, args=(ex, mid, aid[len(PREFIX):], None), daemon=True).start()
    return None


def _finish(ex, mid: str, what: str, text: str | None) -> None:
    st = ex.st
    if not mstore.claim(st, mid, ("drafted", "requested"), "approving"):
        return   # a double tap, or already decided
    try:
        if what == "approve":
            approve(st, mid, text)
            note = f":white_check_mark: Approved{' (your edit)' if text is not None else ''}. I'll play it when someone asks for you."
        else:
            skip(st, mid)
            note = ":fast_forward: Skipped. I'll attend without an update, take notes and answer what I can."
        m = mstore.get(st, mid)
        card = m["data"].get("card") or {}
        if card.get("channel") and card.get("ts"):
            ex._act("update_message", card["channel"], {"channel": card["channel"], "ts": card["ts"], "text": note,
                                                        "blocks": card_blocks(st, m, m["data"].get("update") or {}, note)},
                    f"mtgcard:{mid}:done")
    except Exception as e:  # noqa: BLE001
        log.exception("finishing the meeting card failed")
        mstore.update(st, mid, status="drafted")
        ActivityLog(st.log_path).add("failed", f"Could not finish the update card: {e}", outcome="failed", ref=f"mtgcard:{mid}")


# -- the DM line: "cover meeting <link|test> [at <when>] [title <text>]" -----------------------------------------
DM_LINE = re.compile(r"^\s*cover (?:this |the |my )?meeting\b(.*)$", re.I | re.S)


def from_dm(st: Settings, raw: str) -> str | None:
    """The owner's own words in his DM -> a request; returns the reply line (None if not a cover line)."""
    m = DM_LINE.match(raw or "")
    if not m:
        return None
    rest = m.group(1).strip()
    lm = re.search(r"<?(https?://[^\s>|]+)(?:\|[^>]*)?>?", rest)
    link = lm.group(1) if lm else ("test" if re.search(r"\btest\b", rest, re.I) else None)
    if not link:
        return "Send me the meeting's Zoom link: *cover meeting <link> at 20:30 title Weekly sync*."
    at = (re.search(r"\bat\s+([0-9:]+\s*(?:am|pm)?|now|\S+T\S+)", rest, re.I) or [None, "+3m"])[1]
    title = (re.search(r"\btitle\s+(.+)$", rest, re.I) or [None, "Meeting"])[1].strip()
    r = request(st, link, at=at, title=title, source="dm")
    if not r["ok"]:
        return f"I can't take that one: {r['why']}."
    mt = r["meeting"]
    return (f"Got it: I'll cover *{mt['title']}* ({mt['label']}) at {local_time(st, mt['start'])}. "
            f"I'll draft your update and send it here for one tap first.")


# -- the minute tick (inside the running Peer: jobs.py) --------------------------------------------------------
_running: dict[str, threading.Thread] = {}


def tick(watcher) -> None:
    st = watcher.st
    if not st.get("roles.cover_meetings", True):
        return
    now = datetime.now(timezone.utc)
    for m in mstore.all_meetings(st, ("requested",)):
        if mstore.claim(st, m["id"], ("requested",), "drafting"):
            r = draft_update(st, m["id"])
            if r.get("ok"):
                mstore.update(st, m["id"], status="requested")
                send_card(st, watcher.chat, watcher.owner_chat_id, m["id"], dry_run=watcher.dry_run)
            else:
                mstore.update(st, m["id"], status="failed")
    for m in mstore.all_meetings(st, ("drafted", "approved", "skipped")):
        start = datetime.fromisoformat(m["start"])
        end = datetime.fromisoformat(m["end"]) if m.get("end") else start + timedelta(minutes=30)
        if now > end:
            mstore.update(st, m["id"], status="missed")
            continue
        if start - now <= timedelta(seconds=75) and m["id"] not in _running:
            from .live import MeetingSession
            sess = MeetingSession(st, m["id"], chat=watcher.chat, owner_chat_id=watcher.owner_chat_id, dry_run=watcher.dry_run)
            t = threading.Thread(target=sess.run, daemon=True, name=f"meeting-{m['id']}")
            _running[m["id"]] = t
            t.start()
