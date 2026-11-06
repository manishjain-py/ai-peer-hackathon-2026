"""The adapter contract (DESIGN §2): one adapter per system, the same four verbs.

A company port writes new adapters; nothing else changes. Each adapter declares its
capabilities ("sense", "search", "get", and "act:<action>" per action it offers); the
executor refuses any action no adapter offers.

For port-check (WP5) an adapter also has: `from_settings(st)` (how to build it from the owner's
settings and secrets), `check()` (a cheap health check) and `dry_run_sample()` (one act it can
run in dry run). A hard block that refuses an act raises `Blocked`. Guide: docs/porting-guide.md.
"""
from __future__ import annotations

from typing import Any

from ..events import Event


class NotOffered(Exception):
    """This adapter does not offer the verb or the action (port-check: n/a)."""


class Blocked(Exception):
    """A hard block in code refused the act (port-check: "blocked (ok)"). Raise it before any write."""


class Adapter:
    name: str = "base"
    capabilities: frozenset[str] = frozenset()

    @classmethod
    def from_settings(cls, st) -> "Adapter":
        """Build the adapter for the owner in `st` (secrets come from ~/.ai-peer/.env through
        settings.secret()). Override it when the constructor needs arguments."""
        return cls()

    def sense(self, cursor: str | None) -> tuple[list[Event], str | None]:
        """New events since cursor, and the next cursor. Never calls the AI."""
        raise NotOffered(f"{self.name}.sense")

    def search(self, query: str, filters: dict | None = None) -> list[dict]:
        """Live search -> [{ref, snippet, url, title?, at?}]."""
        raise NotOffered(f"{self.name}.search")

    def get(self, ref: str) -> dict:
        """Full text of one item (message, doc, PR, transcript)."""
        raise NotOffered(f"{self.name}.get")

    def act(self, action: str, target: str, payload: dict, idempotency_key: str,
            dry_run: bool = False) -> dict:
        """Post, reply, DM, react, draft email, join meeting, speak. dry_run never touches the system."""
        raise NotOffered(f"{self.name}.act:{action}")

    def offers(self, action: str) -> bool:
        return f"act:{action}" in self.capabilities

    def check(self) -> dict[str, Any]:
        """Cheap health check for port-check: {ok, detail}."""
        return {"ok": True, "detail": ""}

    def dry_run_sample(self) -> dict | None:
        """One act port-check runs with dry_run=True: {action, target, payload}. Fixed, not picked
        from the capabilities set. None when the adapter offers no act (or the settings entry's
        `sample:` gives it instead)."""
        return None
