"""The event shape every adapter emits (DESIGN §2)."""
from __future__ import annotations

import dataclasses
import json
from dataclasses import dataclass, field
from datetime import datetime, timezone
from typing import Any


def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="seconds")


@dataclass
class Event:
    id: str                      # globally unique, e.g. "slack:C123:1730730000.123"
    source: str                  # adapter name: slack, github, google, ...
    kind: str                    # message, dm, mention, pr, ci, tracker_change, ...
    at: str                      # ISO time (UTC)
    actor: str | None            # system id of who did it (Slack user id, GitHub login, email)
    ref: str                     # how to get() this item again
    thread_ref: str | None       # the conversation it belongs to
    text: str
    url: str | None = None
    extra: dict[str, Any] = field(default_factory=dict)   # channel, ts, thread_ts, names, ...

    def to_json(self) -> str:
        return json.dumps(dataclasses.asdict(self), ensure_ascii=False)

    @classmethod
    def from_dict(cls, d: dict) -> "Event":
        names = {f.name for f in dataclasses.fields(cls)}
        return cls(**{k: v for k, v in d.items() if k in names})
