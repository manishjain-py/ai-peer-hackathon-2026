"""The adapter contract (DESIGN §2): one adapter per system, the same four verbs.

A company port writes new adapters; nothing else changes. Each adapter declares its
capabilities ("sense", "search", "get", and "act:<action>" per action it offers); the
executor refuses any action no adapter offers.
"""
from __future__ import annotations

from typing import Any

from ..events import Event


class NotOffered(Exception):
    pass


class Adapter:
    name: str = "base"
    capabilities: frozenset[str] = frozenset()

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
