"""The compact fact pack a meeting's warm session is primed with (D7), built just before the meeting.

Plain code, no AI: the owner, the owner's rules, each project's note plus the head of its tracker's
"Where we are" section (the freshest status), services, people, recent threads, decisions and meeting
briefs, and the meeting itself with the approved update. Every fact keeps its source and date.
"""
from __future__ import annotations

import re
from pathlib import Path

from ..memory.layout import Memory
from ..settings import Settings


def _body(path: Path) -> str:
    text = path.read_text(errors="replace")
    if text.startswith("---\n"):
        end = text.find("\n---", 4)
        if end > 0:
            text = text[end + 4:]
    return text.strip()


def _tracker_head(root: Path, front: dict, limit: int) -> str:
    """The start of the tracker copy's 'Where we are' section (else its first lines)."""
    rel = front.get("tracker")
    repo = (front.get("repo") or "").split("/")[-1]
    if not rel or not repo:
        return ""
    p = root / "sources" / "github" / repo / rel
    if not p.exists():
        return ""
    text = re.sub(r"<!--.*?-->", "", p.read_text(errors="replace"), flags=re.S)
    m = re.search(r"^##+\s*Where we are.*$", text, flags=re.M | re.I)
    start = m.start() if m else 0
    head = text[start:start + limit].strip()
    return head + (" …" if len(text) - start > limit else "")


def _sources(front: dict) -> str:
    out = []
    for s in (front.get("sources") or [])[:3]:
        out.append(f"{s.get('title', 'source')} <{s.get('url', '')}> ({s.get('date', '')})")
    return "; ".join(out)


def build(st: Settings, meeting: dict | None = None, *, tracker_chars: int = 1800, max_chars: int = 24000) -> str:
    root = st.owner_dir
    mem = Memory(root)
    parts: list[str] = []
    me = root / "me.md"
    if me.exists():
        parts.append("## The owner\n" + _body(me))
    rules = root / "rules.md"
    if rules.exists():
        parts.append("## The owner's rules\n" + _body(rules))
    if meeting:
        lines = [f"- Title: {meeting.get('title')}", f"- When: {meeting.get('start')} to {meeting.get('end') or '?'}",
                 f"- Organizer: {meeting.get('organizer') or 'unknown'}"]
        if meeting.get("update_text"):
            lines.append(f"- The owner's approved update (already played or to be played as a clip): {meeting['update_text']}")
        parts.append("## This meeting\n" + "\n".join(lines))
    for p in sorted((root / "projects").glob("*.md")):
        fm = mem.read_front(p)
        block = f"## Project: {fm.get('title') or p.stem}\nSources: {_sources(fm)}\n" + _body(p)
        head = _tracker_head(root, fm, tracker_chars)
        if head:
            block += f"\n\nTracker, newest status (as of {str(fm.get('tracker_date') or '')[:10]}):\n{head}"
        parts.append(block)
    svc = [f"- {mem.read_front(p).get('title') or p.stem}: {mem.read_front(p).get('summary', '')}"
           for p in sorted((root / "services").glob("*.md"))]
    if svc:
        parts.append("## Services the owner owns\n" + "\n".join(svc))
    ppl = []
    for p in sorted((root / "people").glob("*.md")):
        fm = mem.read_front(p)
        about = next((ln[len("- About: "):] for ln in _body(p).splitlines() if ln.startswith("- About: ")), "")
        ppl.append(f"- {fm.get('title') or p.stem} ({fm.get('summary', '')}): {about}")
    if ppl:
        parts.append("## People\n" + "\n".join(ppl))
    for sub, label, n in (("decisions", "Decisions", 6), ("threads", "Recent Slack threads the Peer answered", 5),
                          ("meetings", "Earlier meeting briefs", 2)):
        files = sorted((root / sub).glob("*.md"), key=lambda q: q.stat().st_mtime, reverse=True)[:n]
        if files:
            parts.append(f"## {label}\n" + "\n\n".join(_body(f)[:900] for f in files))
    pack = "\n\n".join(parts)
    return pack[:max_chars]
