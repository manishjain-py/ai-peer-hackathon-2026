"""WP3: the Google discovery steps (F1), Docs and Calendar, added to WP2's framework with
register_step(). Read-only.

Seeded-only view (google.show_real_items off, the default): real Docs and meetings are counted,
never named, copied into memory or shown in the setup lines and setup.json; seeded test
invitations are listed. With it on: recent Docs become memory notes (title, link, owner, date, the
opening lines) with a verbatim markdown copy under sources/docs/, and the next two weeks of meetings
a calendar note. Interests stay in me.md (from the directory, correctable on the What I learned
page); the brief reads them to pick events and opportunities.
"""
from __future__ import annotations

from datetime import datetime
from zoneinfo import ZoneInfo

from ..adapters.google import DRIVE, GoogleAdapter, connected
from .discovery import Ctx, NotConnected, Step, register_step, today
from .layout import slug

MAX_DOC_BYTES = 60_000


def _google(c: Ctx) -> GoogleAdapter:
    if not connected():
        raise NotConnected("Docs and calendar come from Google; not connected yet")
    return GoogleAdapter(st=c.st)


def _local(iso: str | None, tz: str) -> str:
    try:
        return datetime.fromisoformat(str(iso).replace("Z", "+00:00")).astimezone(ZoneInfo(tz)).strftime("%a %-d %b, %-I:%M %p")
    except ValueError:
        return str(iso or "")


def step_docs(c: Ctx) -> str:
    g = _google(c)
    files = g.recent_docs(days=90, n=25)
    shared = sum(1 for f in files if f.get("shared"))
    if not c.st.get("google.show_real_items", False):
        c.line(f"{len(files)} Docs changed in the last 90 days, {shared} of them shared (titles hidden: seeded-only view)")
        c.run.learned("Docs", f"{len(files)} recent Docs", "counted only (seeded-only view)", "Google Drive")
        return f"{len(files)} recent Docs, counted only (seeded-only view)"
    n = 0
    for f in files[:15]:
        try:
            text = g.api.call("GET", f"{DRIVE}/files/{f['id']}/export", params={"mimeType": "text/markdown"})
        except Exception as e:  # noqa: BLE001
            c.line(f"{f['name']}: could not export ({str(e)[:60]})")
            continue
        text = text if isinstance(text, str) else ""
        s, date = slug(f["name"]), (f.get("modifiedTime") or "")[:10]
        owner = ((f.get("owners") or [{}])[0]).get("displayName", "")
        c.mem.write_source(f"docs/{s}.md", text[:MAX_DOC_BYTES],
                           {"url": f.get("webViewLink"), "modified": f.get("modifiedTime"), "title": f["name"]})
        c.mem.write_note(f"docs/{s}.md", f["name"],
                         f"# {f['name']}\n\n- Link: {f.get('webViewLink')}\n- Owner: {owner}\n- Last changed: {date}\n"
                         f"- Shared: {'yes' if f.get('shared') else 'no'}\n- Verbatim copy: sources/docs/{s}.md\n"
                         f"- Opening: {' '.join(text.split()[:60])}",
                         kind="doc", summary=f"Google Doc, changed {date}",
                         sources=[{"title": f["name"], "url": f.get("webViewLink") or "", "date": date}])
        c.line(f"{f['name']} (changed {date})")
        n += 1
    c.run.learned("Docs", f"{n} Docs read", ", ".join(f["name"] for f in files[:3]), "Google Drive")
    return f"{n} Docs read into memory"


def step_calendar(c: Ctx) -> str:
    g = _google(c)
    tz = c.profile.get("tz", "UTC")
    evs = g.upcoming(days=14)
    invites = [e for e in evs if e.kind == "invite"]
    seeded = [e for e in evs if e.extra.get("seeded")]
    show = bool(c.st.get("google.show_real_items", False))
    keep = evs if show else seeded
    rows = [f"- {_local(e.extra.get('start'), tz)}: {e.extra.get('summary')} (organizer {e.extra.get('organizer_name')}; "
            f"{c.first}: {e.extra.get('response') or 'organizer'}){' [test item]' if e.extra.get('seeded') else ''}" for e in keep]
    body = (f"# Calendar: the next two weeks\n\n- {len(evs)} meetings; {len(invites)} invitations waiting on {c.first}\n"
            + ("" if show else "- Seeded-only view: real meetings are counted here, not named\n")
            + "\n## Meetings\n\n" + "\n".join(rows or ["- none listed"]))
    c.mem.write_note("meetings/calendar.md", "Calendar: the next two weeks", body, kind="calendar",
                     summary=f"{len(evs)} meetings in the next two weeks, {len(invites)} invitations waiting",
                     sources=[{"title": "Google Calendar", "url": "https://calendar.google.com/", "date": today()}])
    c.line(f"{len(evs)} meetings in the next two weeks; {len(invites)} invitations waiting on you"
           + ("" if show else " (real ones counted only)"))
    for e in seeded[:5]:
        c.line(f"Test invitation: {e.extra.get('summary')} ({_local(e.extra.get('start'), tz)})")
    c.run.learned("Calendar", f"{len(evs)} meetings in two weeks", f"{len(invites)} invitations waiting", "Google Calendar")
    return f"{len(evs)} meetings, {len(invites)} invitations waiting"


register_step(Step("docs", "Docs", step_docs), replace="docs")
register_step(Step("calendar", "Calendar", step_calendar), replace="calendar")
