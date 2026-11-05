"""Activity log (F4): append-only ~/.ai-peer/<owner>/log.jsonl.

Every action: who asked, what the Peer said or did, sources, outcome. Entries that need
the owner's review carry needs_review=true; the page lists those first.
"""
from __future__ import annotations

import json
import threading
import uuid
from pathlib import Path
from typing import Any

from .events import now_iso

_lock = threading.Lock()


class ActivityLog:
    def __init__(self, path: Path):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)

    def add(self, kind: str, summary: str, *, who_asked: str | None = None, where: str | None = None,
            said: str | None = None, sources: list[dict] | None = None, outcome: str = "done",
            needs_review: bool = False, ref: str | None = None, url: str | None = None,
            extra: dict[str, Any] | None = None) -> dict:
        entry = {
            "id": uuid.uuid4().hex[:12],
            "at": now_iso(),
            "kind": kind,               # answered_in_thread, drafted_for_owner, sent_after_approval, ...
            "summary": summary,
            "who_asked": who_asked,
            "where": where,
            "said": said,
            "sources": sources or [],
            "outcome": outcome,         # done, pending_approval, skipped, failed, dry_run, ignored
            "needs_review": needs_review,
            "ref": ref,
            "url": url,
            "extra": extra or {},
        }
        with _lock, self.path.open("a") as f:
            f.write(json.dumps(entry, ensure_ascii=False) + "\n")
        return entry

    def entries(self, limit: int = 500) -> list[dict]:
        if not self.path.exists():
            return []
        lines = self.path.read_text().splitlines()[-limit:]
        out = []
        for line in lines:
            try:
                out.append(json.loads(line))
            except json.JSONDecodeError:
                continue
        return out

    def resolve(self, ref: str, outcome: str, note: str | None = None) -> dict:
        """Append a follow-up entry that closes a pending item (the log stays append-only)."""
        return self.add("resolved", note or outcome, outcome=outcome, ref=ref)
