"""Memory layout (DESIGN §4): ~/.ai-peer/<owner>/ markdown files + INDEX.md, never in git.

INDEX.md (one line per file), me.md, rules.md (owner preferences in plain English),
projects/, services/, people/, threads/, decisions/, meetings/, local/, sources/ (verbatim
copies of key docs the brain may quote), log.jsonl (activity), peer.db (events etc.).
Each fact carries its source link and date.
"""
from __future__ import annotations

import os
import re
from pathlib import Path
from typing import Any

import yaml

from ..events import now_iso
from ..settings import PKG

DIRS = ["projects", "services", "channels", "people", "threads", "decisions", "meetings", "local", "docs", "sources"]   # docs: WP3
SKILL_SRC = PKG / "brain" / "skills" / "peer-brain"

DEFAULT_RULES = """# Rules: how {name} wants the Peer to behave

Plain English. The owner edits this (or tells the Peer in a DM); self-tuning (F5) edits it too.

- Quiet by default: urgent items at once, the rest waits for the daily brief.
- When I'm online, show me a draft first (Send / Edit / Skip). When I'm away, answer what you can.
- Never commit me to a decision, a date or a meeting. Say I will confirm.
- Always say how sure you are and the date of what you know; link the sources.
- Keep replies short and friendly. No headings in Slack.
"""


def apply_corrections(body: str, corrections: list[dict]) -> str:
    """Re-apply the owner's corrections: a corrected line is replaced; the rest are listed at the end."""
    if not corrections:
        return body
    lines = body.splitlines()
    for c in corrections:
        was, now = (c.get("was") or "").strip(), (c.get("now") or "").strip()
        mark = f"(corrected by {c.get('by', 'the owner')} on {c.get('date', '')})"
        for i, ln in enumerate(lines):
            if ln.strip() == was:
                lines[i] = ln[:len(ln) - len(ln.lstrip())] + (f"{now} {mark}" if now else f"- (removed: {was.lstrip('- ')}) {mark}")
                break
    text = "\n".join(lines)
    text = re.sub(r"\n## Corrections from the owner\n[\s\S]*$", "", text)
    text += "\n\n## Corrections from the owner\n\nThe owner's own words; they win over every other source.\n\n"
    text += "\n".join(f"- {c.get('date', '')}: \"{(c.get('was') or '').lstrip('- ')}\" is now \"{(c.get('now') or 'removed').lstrip('- ')}\""
                      for c in corrections)
    return text


def slug(text: str) -> str:
    return re.sub(r"[^a-z0-9]+", "-", text.lower()).strip("-")[:60] or "item"


class Memory:
    def __init__(self, root: Path):
        self.root = Path(root)

    def ensure(self, owner_name: str = "the owner") -> None:
        self.root.mkdir(parents=True, exist_ok=True)
        for d in DIRS:
            (self.root / d).mkdir(exist_ok=True)
        rules = self.root / "rules.md"
        if not rules.exists():
            rules.write_text(DEFAULT_RULES.format(name=owner_name))
        self.install_skill()
        if not (self.root / "INDEX.md").exists():
            self.rebuild_index()

    def install_skill(self) -> None:
        """Link the repo's peer-brain skill where Claude (.claude/skills) and Codex (.agents/skills) find it."""
        for base in (".claude/skills", ".agents/skills"):
            d = self.root / base
            d.mkdir(parents=True, exist_ok=True)
            link = d / "peer-brain"
            if link.is_symlink() or link.exists():
                if link.is_symlink() and Path(os.readlink(link)) == SKILL_SRC:
                    continue
                link.unlink()
            link.symlink_to(SKILL_SRC)

    # -- notes --------------------------------------------------------------------
    def write_note(self, rel: str, title: str, body: str, *, kind: str, summary: str,
                   sources: list[dict] | None = None, meta: dict[str, Any] | None = None) -> Path:
        path = self.root / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        front = {"title": title, "kind": kind, "summary": summary, "updated": now_iso(),
                 "sources": sources or [], **(meta or {})}
        # The owner's corrections (F2) survive every rewrite (discovery, freshness): kept in the front
        # matter and re-applied to the body, so the brain always reads the corrected fact.
        old = self.read_front(path) if path.exists() else {}
        if old.get("corrections") and "corrections" not in (meta or {}):
            front["corrections"] = old["corrections"]
        body = apply_corrections(body, front.get("corrections") or [])
        path.write_text("---\n" + yaml.safe_dump(front, sort_keys=False, allow_unicode=True) + "---\n\n" + body.strip() + "\n")
        return path

    def read_front(self, path: Path) -> dict:
        text = path.read_text(errors="replace")
        if text.startswith("---\n"):
            end = text.find("\n---", 4)
            if end > 0:
                try:
                    return yaml.safe_load(text[4:end]) or {}
                except yaml.YAMLError:
                    return {}
        return {}

    def write_source(self, rel: str, text: str, header: dict[str, Any]) -> Path:
        """A verbatim copy of a document, with where it came from on top."""
        path = self.root / "sources" / rel
        path.parent.mkdir(parents=True, exist_ok=True)
        head = "\n".join(f"<!-- {k}: {v} -->" for k, v in header.items())
        path.write_text(head + "\n\n" + text)
        return path

    def rebuild_index(self) -> Path:
        lines = ["# Memory index", "",
                 "One line per file. Open only what you need. `sources/` holds verbatim copies of key docs.", ""]
        for sub in ["me.md", "rules.md"]:
            p = self.root / sub
            if p.exists():
                fm = self.read_front(p)
                lines.append(f"- [{sub}]({sub}): {fm.get('summary') or ('owner preferences' if sub == 'rules.md' else 'who the owner is')}")
        for d in DIRS:
            if d == "sources":
                continue
            files = sorted((self.root / d).glob("**/*.md"))
            if not files:
                continue
            lines += ["", f"## {d}/", ""]
            for p in files:
                fm = self.read_front(p)
                rel = p.relative_to(self.root)
                lines.append(f"- [{fm.get('title') or p.stem}]({rel}): {fm.get('summary', '')}".rstrip())
        src = sorted((self.root / "sources").glob("**/*.md"))
        if src:
            lines += ["", "## sources/ (verbatim copies)", ""]
            lines += [f"- {p.relative_to(self.root)}" for p in src]
        out = self.root / "INDEX.md"
        out.write_text("\n".join(lines) + "\n")
        return out
