"""The calendar link (S3, WP4): a meeting on the owner's calendar that he cannot make -> a "Cover for me" offer
in his DM -> one tap -> a cover request, the same request as the CLI and the DM line (cover.request).

Events arrive in the shape of WP3's make_calendar_event (peer/adapters/google.py): source
"google", kind "invite" or "event", ref "google:event:<id>", extra {summary, start, end, organizer,
organizer_name, response, ical_uid, event_id, location, description (its first 600 characters), seeded,
seed}. This module reads only that shape: it never calls the Calendar API, and covering a meeting never
accepts or declines its invite.

Gates, in order: roles.cover_meetings and meetings.offer_cover; WP3's seeded-only view (until
google.show_real_items is on, only seeded events); not declined; a Zoom link; a start in the future; not
handed over or offered already; and the owner cannot make it (its local start is outside his working hours,
or the away switch is on). After his tap, cover.request() still refuses real meetings while
meetings.join_real_meetings is off.

The Zoom link is a secret (meeting id and passcode): it stays in the owner's database (kv
"mtgoffer:<key>", then the meetings table). The DM, the log and the page show the title and the label.
The clicks (action ids peer_mtg_cover / peer_mtg_nocover, value = the short key) go to on_offer_click().
"""
from __future__ import annotations

import hashlib
import html
import json
import logging
import re
import uuid
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from ..activity import ActivityLog
from ..adapters.meetings import MeetingsAdapter
from ..events import Event, now_iso
from ..notify import send_meeting_dm
from ..presence import Presence
from ..settings import Settings
from ..store import Store
from . import store as mstore

log = logging.getLogger("peer.meetings.calendar")

# A Zoom join link: any zoom.us subdomain, /j/<9-12 digit id>, and its ?pwd=... (it stops at spaces, quotes,
# HTML and Slack's <url|label> wrappers; trailing punctuation is stripped after).
ZOOM_LINK = re.compile(r"https?://(?:[a-z0-9-]+\.)*zoom\.us/j/\d{9,12}(?!\d)(?:\?[^\s<>|\"'`]*)?", re.I)
TRAILING = ".,;:!?)]}*'\""
OFFER_BUTTONS = (("peer_mtg_cover", "Cover for me", "primary"), ("peer_mtg_nocover", "No thanks", None))


def zoom_link(ev: Event) -> str | None:
    """The first Zoom join link in the event's description, else its location."""
    x = ev.extra or {}
    for field in ("description", "location"):
        m = ZOOM_LINK.search(html.unescape(str(x.get(field) or "")))
        if m:
            return m.group(0).rstrip(TRAILING)
    return None


def request_fields(ev: Event) -> dict | None:
    """The cover request this event would make (cover.request's arguments), or None without a Zoom link."""
    url = zoom_link(ev)
    if not url:
        return None
    x = ev.extra or {}
    return {"title": x.get("summary") or "(no title)", "start": x.get("start"), "end": x.get("end"), "zoom_url": url,
            "organizer": x.get("organizer") or None, "source": "calendar", "source_ref": ev.ref, "seeded": bool(x.get("seeded"))}


def offer_key(ev: Event) -> str:
    """The short key on the buttons (the kv row holds the fields, the link included)."""
    return hashlib.sha1(ev.ref.encode()).hexdigest()[:12]


def _profile(st: Settings) -> dict:
    return json.loads(st.profile_path().read_text())


def _start(iso: str | None, tz: str) -> datetime | None:
    if not iso or "T" not in str(iso):
        return None   # an all-day event has a date and no time
    try:
        d = datetime.fromisoformat(str(iso).replace("Z", "+00:00"))
    except ValueError:
        return None
    return d if d.tzinfo else d.replace(tzinfo=ZoneInfo(tz))


def should_offer(st: Settings, ev: Event) -> tuple[bool, str]:
    """(offer?, why): only for a meeting he cannot make, with a Zoom link, not handed over or offered yet."""
    x = ev.extra or {}
    if not st.get("roles.cover_meetings", True):
        return False, "Cover meetings is off in your roles"
    if not st.get("meetings.offer_cover", True):
        return False, "offers to cover are off (meetings.offer_cover)"
    if st.get("google.show_real_items") is not True and not x.get("seeded"):
        return False, "not a seeded test event (the seeded-only view: google.show_real_items is off)"
    if x.get("response") == "declined":
        return False, "you declined it"
    f = request_fields(ev)
    if not f:
        return False, "no Zoom link in the event"
    prof = _profile(st)
    tz = prof.get("tz", "UTC")
    start = _start(f["start"], tz)
    if not start:
        return False, "no start time (an all-day event)"
    if start <= datetime.now(timezone.utc):
        return False, "it has already started"
    if any(m.get("source_ref") == ev.ref and m.get("status") != "cancelled" for m in mstore.all_meetings(st)):
        return False, "already handed to me"
    if Store(st.db_path).action(f"mtgoffer:{ev.ref}"):
        return False, "already offered"
    if str(st.get("presence.manual", "auto")).lower() == "away":
        return True, "you're away (the away switch is on)"
    if Presence(st, None, None, prof).in_working_hours(start.astimezone(ZoneInfo(tz))):
        return False, "inside your working hours: you can make it"
    return True, "outside your working hours"


def _md(s: str) -> str:
    """Slack mrkdwn needs &, < and > escaped."""
    return str(s).replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def offer(st: Settings, chat, owner_chat_id: str | None, ev: Event, dry_run: bool = False) -> dict:
    """DM the owner "Cover for me" / "No thanks" for a meeting he cannot make. Returns {did, ...}."""
    ok, why = should_offer(st, ev)
    if not ok:
        return {"did": "not_offered", "why": why}
    from .cover import local_time
    f = request_fields(ev)
    key = offer_key(ev)
    label = MeetingsAdapter.label(f["zoom_url"], f["title"])
    when = local_time(st, _start(f["start"], _profile(st).get("tz", "UTC")).isoformat())
    reason = "while you're away" if why.startswith("you're away") else "outside your working hours"
    where = f" ({label})" if label != f["title"] else ""
    tail = (f" at {when}, {reason}. Want me to cover it? I'd join as your labelled AI Peer, play an update you approve, "
            f"and brief you after.")
    text = f"You have {f['title']}{where}{tail}"
    md = f":calendar: You have *{_md(f['title'])}*{_md(where)}{tail}"
    store = Store(st.db_path)
    store.set_kv(f"mtgoffer:{key}", {**f, "offer_text": md})   # before the DM, so an instant tap finds it
    blocks = [{"type": "section", "text": {"type": "mrkdwn", "text": md}},
              {"type": "actions", "block_id": "peer_mtg_offer", "elements": [
                  {"type": "button", "action_id": aid, "value": key, "text": {"type": "plain_text", "text": lbl},
                   **({"style": style} if style else {})} for aid, lbl, style in OFFER_BUTTONS]}]
    r = send_meeting_dm(st, chat, owner_chat_id, text, blocks, f"mtgoffer:{ev.ref}", kind="meeting_offered",
                        summary=f"Offered to cover {f['title']} ({label}) at {when}, {reason}", dry_run=dry_run, store=store,
                        sources=[{"title": f"Calendar: {f['title']}", "url": ev.url or "", "date": str(f["start"])[:10]}])
    return {**r, "key": key}


def _close(ex, channel: str | None, ts: str | None, offer_md: str | None, note: str, key: str) -> None:
    """Replace the offer's buttons with the outcome."""
    if not (channel and ts):
        return
    blocks = ([{"type": "section", "text": {"type": "mrkdwn", "text": offer_md}}] if offer_md else []) + \
        [{"type": "context", "elements": [{"type": "mrkdwn", "text": note}]}]
    ex._act("update_message", channel, {"channel": channel, "ts": ts, "text": note, "blocks": blocks}, f"mtgoffer:{key}:done")


def on_offer_click(ex, payload: dict) -> None:
    """The owner's tap on an offer (the caller has checked it is the owner). Cover for me -> cover.request();
    No thanks -> nothing. Either way the offer's buttons give way to the outcome. Never touches the invite."""
    st = ex.st
    act = (payload.get("actions") or [{}])[0]
    aid, key = act.get("action_id", ""), str(act.get("value") or "")
    if aid not in ("peer_mtg_cover", "peer_mtg_nocover") or not key:
        return None
    cont = payload.get("container") or {}
    channel = cont.get("channel_id") or (payload.get("channel") or {}).get("id")
    ts = cont.get("message_ts") or (payload.get("message") or {}).get("ts")
    store = Store(st.db_path)
    f = store.get_kv(f"mtgoffer:{key}")
    if not f:
        _close(ex, channel, ts, None, "I no longer have this offer's details. Hand me the meeting here instead: "
                                      "*cover meeting <Zoom link> at 20:30 title Weekly sync*.", key)
        return None
    idem = f"mtgoffer:{f['source_ref']}"
    if store.action(idem) and not store.claim_action(idem, "done", "answered"):
        return None   # a double tap, or already answered
    from .cover import first_name, local_time, request
    first = first_name(st)
    try:
        if aid == "peer_mtg_cover":
            r = request(st, f["zoom_url"], at=f["start"], title=f["title"], end=f["end"], organizer=f["organizer"],
                        source="calendar", source_ref=f["source_ref"], seeded=f["seeded"])
            if r.get("ok"):
                m = r["meeting"]
                note = (f":white_check_mark: I'll cover *{_md(m['title'])}* ({_md(m['label'])}) at {local_time(st, m['start'])}. "
                        f"I'll draft your update and send it here for one tap first. Your calendar answer stays yours.")
            else:
                note = f":no_entry: I can't cover this one: {_md(r.get('why') or 'it is not allowed')}."
            store.set_kv(f"mtgoffer:{key}", {**f, "answer": "cover", "ok": bool(r.get("ok")), "answered_at": now_iso()})
        else:
            note = "OK, I won't cover it."
            store.set_kv(f"mtgoffer:{key}", {**f, "answer": "nocover", "answered_at": now_iso()})
            ActivityLog(st.log_path).add("meeting_offer_declined", f"{first} said no thanks to covering {f['title']}",
                                         who_asked=first, where="DM", outcome="skipped", ref=idem)
        _close(ex, channel, ts, f.get("offer_text"), note, key)
    except Exception as e:  # noqa: BLE001
        log.exception("the offer tap failed")
        store.claim_action(idem, "answered", "done")   # let him tap again
        ActivityLog(st.log_path).add("failed", f"Could not act on the offer for {f['title']}: {e}", outcome="failed", ref=idem)
    return None


def make_test_event(title: str, start_iso: str, end_iso: str, zoom_url: str, *, seeded: bool = True, kind: str = "invite",
                    organizer: str = "alex@example.com", event_id: str | None = None) -> Event:
    """A calendar event in WP3's shape (make_calendar_event) for walks and tests, with the Zoom link first in the
    description (WP3 keeps only its first 600 characters). Nothing is sent or stored."""
    eid = event_id or "wp4" + uuid.uuid4().hex[:12]
    org = organizer.lower()
    return Event(id=f"google:event:{eid}:{now_iso()}", source="google", kind=kind, at=now_iso(), actor=org,
                 ref=f"google:event:{eid}", thread_ref=None, text=f"{title} · {start_iso}", url=None,
                 extra={"summary": title, "start": start_iso, "end": end_iso, "organizer": org,
                        "organizer_name": org.split("@")[0].replace(".", " ").title(),
                        "response": "needsAction" if kind == "invite" else "accepted", "ical_uid": f"{eid}@ai-peer.test",
                        "event_id": eid, "location": "Zoom",
                        "description": f"{zoom_url}\n\nJoin the Zoom meeting above. {title}.\n"[:600],
                        "seeded": bool(seeded), "seed": f"wp4:{eid}" if seeded else None})
