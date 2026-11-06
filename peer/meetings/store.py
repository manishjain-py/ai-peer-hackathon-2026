"""Meetings the owner handed the Peer, in a table of its own in ~/.ai-peer/<owner>/peer.db.

One shape whatever the source (the CLI, a DM line, a calendar event): title, start, end, the Zoom link,
organizer, source ref, seeded or not. The link is a secret (its meeting id and passcode): it lives only
here, in the owner's runtime data; everything shown or logged uses `label`.

Status: requested -> drafted (the update card is in the DM) -> approved | skipped -> live -> ended
-> briefed; or refused, cancelled, failed.
"""
from __future__ import annotations

import json
import sqlite3
import uuid
from typing import Any

from ..events import Event, now_iso
from ..settings import Settings
from ..store import Store

SCHEMA = """
CREATE TABLE IF NOT EXISTS meetings (
  id TEXT PRIMARY KEY, title TEXT, start TEXT, end_at TEXT, zoom_url TEXT, label TEXT, organizer TEXT,
  source TEXT, source_ref TEXT, seeded INTEGER, status TEXT, data TEXT, created_at TEXT, updated_at TEXT
);
CREATE INDEX IF NOT EXISTS meetings_start ON meetings(start);
"""

PUBLIC = ("id", "title", "start", "end", "label", "organizer", "source", "source_ref", "seeded", "status", "data",
          "created_at", "updated_at")


def _db(st: Settings) -> sqlite3.Connection:
    c = Store(st.db_path).conn()
    c.executescript(SCHEMA)
    return c


def _row(r: sqlite3.Row | None, with_link: bool = False) -> dict | None:
    if not r:
        return None
    d = dict(r)
    d["end"] = d.pop("end_at")
    d["data"] = json.loads(d.get("data") or "{}")
    d["seeded"] = bool(d.get("seeded"))
    if not with_link:
        d.pop("zoom_url", None)
    return d


def add(st: Settings, *, title: str, start: str, end: str | None, zoom_url: str, label: str, organizer: str | None = None,
        source: str = "cli", source_ref: str | None = None, seeded: bool = False, status: str = "requested",
        data: dict | None = None) -> dict:
    c = _db(st)
    if source_ref:
        r = c.execute("SELECT * FROM meetings WHERE source_ref=? AND status NOT IN ('cancelled','refused')", (source_ref,)).fetchone()
        if r:
            return _row(r)
    mid = "m" + uuid.uuid4().hex[:8]
    now = now_iso()
    c.execute("INSERT INTO meetings (id, title, start, end_at, zoom_url, label, organizer, source, source_ref, seeded, status,"
              " data, created_at, updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?)",
              (mid, title, start, end, zoom_url, label, organizer, source, source_ref, int(seeded), status,
               json.dumps(data or {}, ensure_ascii=False), now, now))
    return get(st, mid)


def get(st: Settings, mid: str, with_link: bool = False) -> dict | None:
    return _row(_db(st).execute("SELECT * FROM meetings WHERE id=?", (mid,)).fetchone(), with_link)


def link(st: Settings, mid: str) -> str | None:
    r = _db(st).execute("SELECT zoom_url FROM meetings WHERE id=?", (mid,)).fetchone()
    return r["zoom_url"] if r else None


def update(st: Settings, mid: str, *, status: str | None = None, **data: Any) -> dict | None:
    c = _db(st)
    cur = get(st, mid)
    if not cur:
        return None
    merged = {**cur["data"], **data}
    c.execute("UPDATE meetings SET status=?, data=?, updated_at=? WHERE id=?",
              (status or cur["status"], json.dumps(merged, ensure_ascii=False, default=str), now_iso(), mid))
    return get(st, mid)


def claim(st: Settings, mid: str, frm: tuple[str, ...], to: str) -> bool:
    """Move a meeting from one of `frm` to `to` once (a double click, or two jobs, does nothing)."""
    c = _db(st)
    q = f"UPDATE meetings SET status=?, updated_at=? WHERE id=? AND status IN ({','.join('?' * len(frm))})"
    return c.execute(q, (to, now_iso(), mid, *frm)).rowcount == 1


def all_meetings(st: Settings, statuses: tuple[str, ...] | None = None) -> list[dict]:
    c = _db(st)
    if statuses:
        rows = c.execute(f"SELECT * FROM meetings WHERE status IN ({','.join('?' * len(statuses))}) ORDER BY start",
                         statuses).fetchall()
    else:
        rows = c.execute("SELECT * FROM meetings ORDER BY start").fetchall()
    return [_row(r) for r in rows]


def events_since(st: Settings, cursor: str | None) -> tuple[list[Event], str | None]:
    """sense(): one event per meeting status change since the cursor (an updated_at time)."""
    c = _db(st)
    rows = c.execute("SELECT * FROM meetings WHERE updated_at > ? ORDER BY updated_at", (cursor or "",)).fetchall()
    evs = [Event(id=f"meetings:{r['id']}:{r['status']}:{r['updated_at']}", source="meetings", kind=f"meeting_{r['status']}",
                 at=r["updated_at"], actor=None, ref=f"meetings:meeting:{r['id']}", thread_ref=None,
                 text=f"{r['title']} ({r['label']}) · {r['start']} · {r['status']}", url=None) for r in rows]
    return evs, (rows[-1]["updated_at"] if rows else cursor)
