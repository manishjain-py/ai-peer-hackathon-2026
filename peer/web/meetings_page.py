"""The Meetings page (S3, WP4): the meetings the owner handed his Peer, the update it will play for him, and
the brief after each one. Read-only, in the film's look (layout.py's frame and CSS).

app.py serves it at GET /meetings; importing this module adds "Meetings" to the sidebar (NAV, additive).
The Zoom link never reaches the page: the store's all_meetings() leaves it out, cards show the meeting's
label ("AI Peer test (Zoom)"), and a Zoom link inside any text is replaced. Local file paths (the clip, the
recording) are never shown either: only whether the recording was kept.
"""
from __future__ import annotations

import html
import logging
import re
from datetime import datetime, timezone
from zoneinfo import ZoneInfo

from ..meetings import store as mstore
from ..settings import get_settings
from .layout import NAV, page, profile

log = logging.getLogger("peer.web.meetings")

if not any(n[0] == "/meetings" for n in NAV):
    NAV.append(("/meetings", "Meetings", "message"))

UPCOMING = ("requested", "drafting", "drafted", "approving", "approved", "skipped", "live")
STATUS = {   # status -> (pill text, pill style)
    "requested": ("Drafting your update", "grey"),
    "drafting": ("Drafting your update", "grey"),
    "drafted": ("Waiting for your tap in Slack", "amber"),
    "approving": ("Saving your choice", "grey"),
    "approved": ("Update approved", ""),
    "skipped": ("No update: notes only", "grey"),
    "live": ("In the meeting now", "live"),
    "ended": ("Ended", "grey"),
    "briefed": ("Brief ready", ""),
    "failed": ("Something went wrong", "amber"),
    "missed": ("Missed", "amber"),
    "refused": ("Not joined", "amber"),
    "cancelled": ("Cancelled", "grey"),
}
SOURCE = {"cli": "handed over from the command line", "dm": "handed over in your Slack DM", "calendar": "from your calendar"}
NO_BRIEF = {   # a past meeting without a brief: what happened, in plain words
    "ended": "The meeting ended, but I could not write the brief. The activity log has the details.",
    "failed": "Something went wrong with this meeting. The activity log has the details.",
    "missed": "It ended before I could join (the Peer was not running at its start).",
    "refused": "I did not join: this link is not allowed. Until you lift the block, I join only the test meeting.",
    "cancelled": "I did not join: Cover meetings was off when it started.",
}
ZOOM = re.compile(r"https?://\S*zoom\.us\S*", re.I)

CSS = """
.mhead{display:flex;gap:14px;align-items:flex-start}.mhead .mt{flex:1;min-width:0}
.mtitle{font-size:19px;font-weight:800;letter-spacing:-.3px}
.mmeta{color:var(--muted);font-size:14px;margin-top:2px}
.mpills{display:flex;gap:6px;flex-wrap:wrap;justify-content:flex-end;max-width:48%}.mpills .pill{white-space:nowrap}
.pill.live{background:var(--mint);color:#173c33}
.pill.live::before{content:"";width:7px;height:7px;border-radius:4px;background:var(--green);animation:mpulse 1.4s infinite}
@keyframes mpulse{50%{opacity:.25}}
.ulabel,.bh{font-size:11px;letter-spacing:1.5px;font-weight:750;color:#668a73;text-transform:uppercase}
.ulabel{margin:16px 0 6px}.bh{margin-bottom:4px}
.upd{margin:0;padding:12px 16px;background:var(--soft);border-left:3px solid var(--green);border-radius:4px 12px 12px 4px;font-size:16px}
.msrc{font-size:13px;color:var(--muted);margin-top:8px}.msrc a{color:var(--muted)}
.mnote{margin:12px 0 0;color:var(--muted)}
.bsum{margin:14px 0 2px;font-size:16px}
.bgrid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 28px;margin-top:14px}
.blist{margin:0;padding-left:18px}.blist li{margin:4px 0}.bwho{color:var(--muted);font-size:13px}
.mfoot{display:flex;gap:6px 18px;flex-wrap:wrap;margin-top:16px;padding-top:10px;border-top:1px solid #eef2ec;font-size:13px;color:var(--muted)}
@media (max-width:820px){.bgrid{grid-template-columns:1fr}.mhead{flex-direction:column}.mpills{max-width:none;justify-content:flex-start}}
"""


def T(s) -> str:
    """Escaped text, with any Zoom link replaced (the link is a secret: its meeting id and passcode)."""
    return html.escape(ZOOM.sub("[Zoom link]", "" if s is None else str(s)))


def _dt(iso) -> datetime | None:
    try:
        d = datetime.fromisoformat(str(iso).replace("Z", "+00:00"))
    except (TypeError, ValueError):
        return None
    return d if d.tzinfo else d.replace(tzinfo=timezone.utc)


def _zone(tz: str):
    try:
        return ZoneInfo(tz)
    except Exception:  # noqa: BLE001
        return timezone.utc


def when(m: dict, tz: str) -> str:
    """'Sun 8 Nov, 2:00 AM to 2:30 AM IST', in the owner's time zone."""
    s, e = _dt(m.get("start")), _dt(m.get("end"))
    if not s:
        return "time unknown"
    z = _zone(tz)
    s = s.astimezone(z)
    out = s.strftime("%a %-d %b, %-I:%M %p")
    if e:
        e = e.astimezone(z)
        out += " to " + (e.strftime("%-I:%M %p") if e.date() == s.date() else e.strftime("%a %-d %b, %-I:%M %p"))
    return f"{out} {s.strftime('%Z')}".strip()


def short(iso, tz: str) -> str:
    d = _dt(iso)
    return d.astimezone(_zone(tz)).strftime("%-d %b, %-I:%M %p") if d else ""


def until(iso, now: datetime) -> str:
    s = _dt(iso)
    if not s:
        return ""
    mins = int((s - now).total_seconds() // 60)
    if mins < 0:
        return f"started {-mins} min ago" if -mins < 120 else ""
    if mins < 60:
        return f"in {mins} min" if mins else "starting now"
    return f"in {mins // 60} h" if mins < 48 * 60 else f"in {mins // 1440} days"


def nice_date(s) -> str:
    m = re.search(r"(\d{4})-(\d{2})-(\d{2})", str(s or ""))
    if not m:
        return str(s or "")
    return datetime(int(m.group(1)), int(m.group(2)), int(m.group(3))).strftime("%-d %b %Y")


def sources(srcs) -> str:
    out = []
    for s in (srcs or [])[:4]:
        title, url = T(s.get("title") or "source"), str(s.get("url") or "")
        link = (f'<a href="{html.escape(url)}" target="_blank" rel="noopener">{title}</a>'
                if url.startswith(("http://", "https://")) and not ZOOM.search(url) else title)
        out.append(link + (f" ({T(nice_date(s['date']))})" if s.get("date") else ""))
    return " · ".join(out) or "none found in my records"


def pill(status: str) -> str:
    text, cls = STATUS.get(status, (status.replace("_", " ").capitalize(), "grey"))
    return f'<span class="pill {cls}">{T(text)}</span>'


def head(m: dict, tz: str, now: datetime, upcoming: bool) -> str:
    time_txt = when(m, tz)
    rel = until(m.get("start"), now) if upcoming and m["status"] != "live" else ""
    meta = [T(time_txt + (f" ({rel})" if rel else ""))]
    label = m.get("label") or ""
    meta.append(T(label) if label and label != m.get("title") else "Zoom")
    if SOURCE.get(m.get("source")):
        meta.append(SOURCE[m["source"]])
    if m.get("organizer"):
        meta.append("organized by " + T(m["organizer"]))
    pills = pill(m["status"])
    end = _dt(m.get("end"))
    if upcoming and m["status"] != "live" and end and end < now:
        pills += '<span class="pill amber">Its time has passed</span>'
    return (f'<div class="mhead"><div class="mt"><div class="mtitle">{T(m.get("title") or "Meeting")}</div>'
            f'<div class="mmeta">{" · ".join(meta)}</div></div><div class="mpills">{pills}</div></div>')


def update_block(m: dict, tz: str) -> str:
    d = m.get("data") or {}
    upd = d.get("update") or {}
    if m["status"] == "skipped" or (m["status"] == "live" and d.get("skipped_at") and not d.get("approved_at")):
        return '<p class="mnote">You skipped the update: I attend without one, take notes, answer what I can and brief you after.</p>'
    if not upd.get("update"):
        return '<p class="mnote">I am drafting your update. It comes to your Slack DM for one tap before the meeting.</p>'
    lab = ("The update you approved · I play it when someone asks for you" if d.get("approved_at")
           else "My draft of your update · it plays only after your tap")
    bits = ["Sources: " + sources(upd.get("sources"))]
    if upd.get("as_of"):
        bits.append("as of " + T(nice_date(upd["as_of"])))
    if upd.get("edited"):
        bits.append("your edit")
    if d.get("approved_at"):
        bits.append("approved " + T(short(d["approved_at"], tz)))
    if d.get("update_clip_s"):
        bits.append(f"clip ready ({round(float(d['update_clip_s']))} s"
                    + (f", {T(d['update_engine'])} voice)" if d.get("update_engine") else ")"))
    return (f'<div class="ulabel">{T(lab)}</div><blockquote class="upd">{T(upd["update"]).replace(chr(10), "<br>")}</blockquote>'
            f'<div class="msrc">{" · ".join(bits)}</div>')


def _items(xs) -> str:
    if not xs:
        return '<div class="muted small">None</div>'
    rows = []
    for x in xs:
        if isinstance(x, dict):
            meta = " · ".join(T(v) for v in (x.get("who"), x.get("when")) if v)
            rows.append(f"<li>{T(x.get('what'))}" + (f'<div class="bwho">{meta}</div>' if meta else "") + "</li>")
        else:
            rows.append(f"<li>{T(x)}</li>")
    return '<ul class="blist">' + "".join(rows) + "</ul>"


def brief_block(m: dict) -> str:
    d = m.get("data") or {}
    b = d.get("brief") or {}
    if not b:
        why = NO_BRIEF.get(m["status"], "")
        if m["status"] == "ended" and not d.get("brief_error"):
            why = "The meeting ended. I am writing the brief now: it lands here and in your Slack DM."
        return f'<p class="mnote">{T(why)}</p>' if why else ""
    cols = (("Decisions", b.get("decisions")), ("Questions for you", b.get("questions_for_owner")),
            ("What I said", b.get("peer_said")), ("Follow-ups", b.get("follow_ups")))
    grid = "".join(f'<div><div class="bh">{h}</div>{_items(xs)}</div>' for h, xs in cols)
    return f'<p class="bsum">{T(b.get("summary"))}</p><div class="bgrid">{grid}</div>'


def foot(m: dict, tz: str) -> str:
    d = m.get("data") or {}
    media = d.get("media") or {}
    if m["status"] not in ("ended", "briefed", "failed") and not media:
        return ""
    bits = ["Recording kept" if media.get("recording") else "No recording kept"]
    if isinstance(media.get("transcript_lines"), int):
        bits.append(f"Transcript: {media['transcript_lines']} lines")
    if isinstance(d.get("answers"), int):
        bits.append(f"{d['answers']} live answer{'' if d['answers'] == 1 else 's'}")
    if d.get("brief_file"):
        bits.append("Saved to your memory: " + T(d["brief_file"]))
    if d.get("briefed_at"):
        sent = (d.get("brief_dm") or {}).get("did") == "sent"
        bits.append(("Brief sent to your Slack DM " if sent else "Brief written ") + T(short(d["briefed_at"], tz)))
    return '<div class="mfoot">' + "".join(f"<span>{b}</span>" for b in bits) + "</div>"


def card(m: dict, tz: str, now: datetime, upcoming: bool) -> str:
    try:
        body = update_block(m, tz) if upcoming else brief_block(m) + foot(m, tz)
        return f'<div class="card">{head(m, tz, now, upcoming)}{body}</div>'
    except Exception:  # noqa: BLE001  (one odd row must not break the page)
        log.exception("could not show meeting %s", m.get("id"))
        return f'<div class="card"><div class="mtitle">{T(m.get("title"))}</div><p class="mnote">I could not show this meeting.</p></div>'


def render() -> str:
    st = get_settings()
    tz = profile().get("tz", "UTC")
    now = datetime.now(timezone.utc)
    meetings = mstore.all_meetings(st)   # ordered by start; never carries the Zoom link
    upcoming = [m for m in meetings if m["status"] in UPCOMING]
    past = sorted((m for m in meetings if m["status"] not in UPCOMING), key=lambda m: m.get("start") or "", reverse=True)
    parts = ['<div class="label">Meetings</div><h1>Meetings I cover for you.</h1>'
             '<p class="lead">Meetings you handed me. I join as your labelled AI Peer, play only the update you approved, '
             'and brief you after.</p>']
    if not st.get("roles.cover_meetings", True):
        parts.append('<div class="note">Cover meetings is off in <a href="/settings">Roles and settings</a>, so I offer to '
                     'cover nothing and join no meeting. Turn it on there when you want me to.</div>')
    parts.append("<h2>Meetings I'll cover</h2>" + ("".join(card(m, tz, now, True) for m in upcoming) or
                 '<div class="card muted">No meetings to cover yet. Hand me one in your Slack DM: <b>cover meeting '
                 '&lt;Zoom link&gt; at 20:30 title Weekly sync</b>. When a meeting on your calendar falls outside your '
                 'working hours, I offer there to cover it: one tap on <b>Cover for me</b>.</div>'))
    parts.append("<h2>Past meetings</h2>" + ("".join(card(m, tz, now, False) for m in past) or
                 '<div class="card muted">No past meetings yet. After each one, its brief shows here and in your Slack DM: '
                 'decisions, questions for you, what I said, follow-ups.</div>'))
    return page("Meetings", f"<style>{CSS}</style>" + "".join(parts), active="/meetings", refresh=30)
