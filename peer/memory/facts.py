"""What the Peer learned (F2): read memory files as facts with their source and date; let the owner
correct one. A correction edits the memory file itself (the line, plus a "Corrections from the
owner" section and the front matter), so the next brain run reads the owner's words.
"""
from __future__ import annotations

import hashlib
import re
from datetime import datetime
from pathlib import Path

import yaml

from ..activity import ActivityLog
from ..settings import Settings
from .layout import Memory, apply_corrections

SKIP_SECTIONS = {"sources", "corrections from the owner", "recent pull requests", "trackers", "related pull requests",
                 "ci on main (latest runs)"}
CORRECTED = re.compile(r"\s*\(corrected by [^)]*\)\s*$")


def _fid(rel: str, line: str) -> str:
    return hashlib.sha1(f"{rel}\n{CORRECTED.sub('', line).strip()}".encode()).hexdigest()[:10]


def split(text: str) -> tuple[dict, str]:
    if text.startswith("---\n"):
        end = text.find("\n---", 4)
        if end > 0:
            try:
                return yaml.safe_load(text[4:end]) or {}, text[end + 4:].lstrip("\n")
            except yaml.YAMLError:
                pass
    return {}, text


def file_facts(root: Path, rel: str, sections: set[str] | None = None, skip_keys: tuple[str, ...] = ()) -> dict:
    """One memory file as {title, summary, source, facts:[{id, rel, line, text, section, corrected}]}."""
    path = root / rel
    front, body = split(path.read_text(errors="replace"))
    src = (front.get("sources") or [{}])[0]
    section = ""
    facts = []
    for line in body.splitlines():
        if line.startswith("## "):
            section = line[3:].strip()
            continue
        if not line.startswith("- "):
            continue
        sec = section.lower()
        if sec in SKIP_SECTIONS or sec.startswith(("ci on ", "recent pull")):
            continue
        if sections is not None and sec not in sections:
            continue
        text = line[2:].strip()
        low = text.lower()
        if any(low.startswith(k) for k in skip_keys) or low.startswith(("link:", "email:", "default branch")) or low.endswith("is a member"):
            continue
        corrected = bool(CORRECTED.search(line))
        facts.append({"id": _fid(rel, line), "rel": rel, "line": line, "section": section,
                      "text": CORRECTED.sub("", text).strip(), "corrected": corrected})
    return {"rel": rel, "title": front.get("title") or path.stem, "summary": front.get("summary", ""),
            "kind": front.get("kind"), "source": src, "updated": front.get("updated", ""),
            "corrections": front.get("corrections") or [], "facts": facts}


def learned(st: Settings) -> dict:
    """Everything the F2 page shows, grouped."""
    root = st.owner_dir
    out: dict = {"me": None, "owns": [], "projects": [], "people": [], "channels": [], "local": [], "interests": None}
    if (root / "me.md").exists():
        out["me"] = file_facts(root, "me.md", sections={""}, skip_keys=("email",))
        out["interests"] = file_facts(root, "me.md", sections={"interests"})
        out["owns_me"] = file_facts(root, "me.md", sections={"owns"})
    for d, key in (("services", "owns"), ("projects", "projects"), ("people", "people"), ("channels", "channels"), ("local", "local")):
        for p in sorted((root / d).glob("*.md")) if (root / d).exists() else []:
            rel = str(p.relative_to(root))
            skip = ("code:", "owner:", "recent prs") if d == "services" else ("repo:", "tracker last") if d == "projects" else ()
            out[key].append(file_facts(root, rel, skip_keys=skip))
    out["owns"].sort(key=lambda f: (not f["title"].startswith("Repo"), f["title"]))
    return out


def correct(st: Settings, rel: str, fact_id: str, new_text: str, who: str) -> dict:
    """Replace one fact's line in a memory file with the owner's words (empty = remove it)."""
    root = st.owner_dir.resolve()
    path = (root / rel).resolve()
    if root not in path.parents or path.suffix != ".md" or not path.exists():
        raise ValueError("not a memory file")
    front, body = split(path.read_text(errors="replace"))
    lines = body.splitlines()
    idx = next((i for i, ln in enumerate(lines) if ln.startswith("- ") and _fid(rel, ln) == fact_id), None)
    if idx is None:
        raise KeyError("that fact changed since the page loaded; reload and try again")
    current = CORRECTED.sub("", lines[idx]).rstrip()
    label = ""
    m = re.match(r"-\s+([A-Z][\w ]{1,30}):\s", current)
    if m and not new_text.lower().startswith(m.group(1).lower() + ":"):
        label = m.group(1) + ": "          # keep "Driver: " when the owner types only the new value
    now = f"- {label}{new_text.strip()}" if new_text.strip() else ""
    corrections = list(front.get("corrections") or [])
    prior = next((c for c in corrections if (c.get("now") or "").strip() == current.strip()), None)
    date = datetime.now().strftime("%Y-%m-%d")
    if prior:                                  # correcting a correction: update it in place
        prior.update(now=now, date=date, by=who)
    else:
        corrections.append({"was": current, "now": now, "date": date, "by": who})
    lines[idx] = prior["was"] if prior else current   # apply_corrections re-applies every correction below
    front["corrections"] = corrections
    front["updated"] = datetime.now().astimezone().isoformat(timespec="seconds")
    new_body = apply_corrections("\n".join(lines), corrections)
    path.write_text("---\n" + yaml.safe_dump(front, sort_keys=False, allow_unicode=True) + "---\n\n" + new_body.strip() + "\n")
    Memory(st.owner_dir).rebuild_index()
    ActivityLog(st.log_path).add(
        "owner_correction", f"{who} corrected a fact in {front.get('title') or rel}",
        who_asked=who, where="What I learned page",
        said=f"Was: {current.lstrip('- ')}\nNow: {now.lstrip('- ') or '(removed)'}", outcome="done",
        sources=[{"title": f"memory: {rel}", "url": f"file://{path}", "date": date}],
        extra={"file": rel, "was": current, "now": now})
    return {"rel": rel, "was": current, "now": now}
