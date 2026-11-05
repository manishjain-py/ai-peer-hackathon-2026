"""In-memory adapter for dry runs: events are injected, actions are recorded, nothing leaves.

It offers the same acts as the chat adapter, so a whole scene can run with no accounts:
`peer scenario s1-away --dry-run`.
"""
from __future__ import annotations

import itertools
import time
from typing import Any

from ..events import Event, now_iso
from .base import Adapter

CHAT_ACTS = ("post_reply", "post_message", "dm", "update_message", "react", "open_modal")


class FakeAdapter(Adapter):
    name = "fake"
    capabilities = frozenset({"sense", "search", "get", *(f"act:{a}" for a in CHAT_ACTS)})

    def __init__(self, stands_in_for: str = "slack"):
        self.stands_in_for = stands_in_for
        self.events: list[Event] = []
        self.acts: list[dict[str, Any]] = []
        self.items: dict[str, dict] = {}
        self._seq = itertools.count(1)
        self.users: dict[str, dict] = {}
        self.presence: dict[str, str] = {}

    # test-world helpers ------------------------------------------------------
    def inject(self, *, channel: str, user: str, text: str, thread_ts: str | None = None,
               kind: str = "message") -> Event:
        ts = f"{time.time():.6f}"
        ref = f"{self.stands_in_for}:msg:{channel}:{ts}"
        thread_root = thread_ts or ts
        e = Event(id=ref, source=self.stands_in_for, kind=kind, at=now_iso(), actor=user, ref=ref,
                  thread_ref=f"{self.stands_in_for}:thread:{channel}:{thread_root}", text=text,
                  url=f"https://fake.slack/{channel}/{ts}",
                  extra={"channel": channel, "ts": ts, "thread_ts": thread_ts, "user": user,
                         "channel_name": channel, "user_name": self.users.get(user, {}).get("name", user)})
        self.events.append(e)
        self.items[ref] = {"ref": ref, "text": text, "user": user, "channel": channel, "ts": ts}
        return e

    # contract -----------------------------------------------------------------
    def sense(self, cursor: str | None) -> tuple[list[Event], str | None]:
        start = int(cursor or 0)
        return self.events[start:], str(len(self.events))

    def search(self, query: str, filters: dict | None = None) -> list[dict]:
        q = query.lower()
        return [{"ref": r, "snippet": i["text"][:200], "url": None}
                for r, i in self.items.items() if q in i["text"].lower()]

    def get(self, ref: str) -> dict:
        return self.items.get(ref, {})

    def act(self, action: str, target: str, payload: dict, idempotency_key: str,
            dry_run: bool = False) -> dict:
        ts = f"{time.time():.6f}"
        rec = {"n": next(self._seq), "action": action, "target": target, "payload": payload,
               "idempotency_key": idempotency_key, "ts": ts, "dry_run": True}
        self.acts.append(rec)
        channel = payload.get("channel") or target
        return {"ok": True, "channel": channel, "ts": ts, "permalink": f"https://fake.slack/{channel}/{ts}"}

    # chat helpers the executor and presence use --------------------------------
    def user_info(self, user_id: str) -> dict:
        return self.users.get(user_id, {"id": user_id, "name": user_id, "tz": "UTC"})

    def get_presence(self, user_id: str) -> str:
        return self.presence.get(user_id, "active")

    def get_status(self, user_id: str) -> dict:
        return {"text": "", "emoji": ""}

    def permalink(self, channel: str, ts: str) -> str:
        return f"https://fake.slack/{channel}/{ts}"
