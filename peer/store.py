"""Event store: SQLite in ~/.ai-peer/<owner>/peer.db.

Holds events, adapter cursors, actions (idempotency + approval state), threads the Peer
takes part in, the person map, and a small key-value table. Thread-safe enough for one
process (one connection per thread, WAL mode).
"""
from __future__ import annotations

import json
import sqlite3
import threading
import time
from pathlib import Path
from typing import Any, Iterable

from .events import Event, now_iso

SCHEMA = """
CREATE TABLE IF NOT EXISTS events (
  id TEXT PRIMARY KEY, source TEXT, kind TEXT, at TEXT, actor TEXT, ref TEXT,
  thread_ref TEXT, text TEXT, url TEXT, extra TEXT, seen_at TEXT, status TEXT DEFAULT 'new'
);
CREATE INDEX IF NOT EXISTS events_thread ON events(thread_ref);
CREATE VIRTUAL TABLE IF NOT EXISTS events_fts USING fts5(id UNINDEXED, text);
CREATE TABLE IF NOT EXISTS cursors (adapter TEXT PRIMARY KEY, cursor TEXT, updated_at TEXT);
CREATE TABLE IF NOT EXISTS actions (
  idem_key TEXT PRIMARY KEY, action TEXT, target TEXT, payload TEXT, status TEXT,
  result TEXT, event_id TEXT, created_at TEXT, updated_at TEXT
);
CREATE TABLE IF NOT EXISTS threads (
  thread_ref TEXT PRIMARY KEY, channel TEXT, thread_ts TEXT, peer_role TEXT,
  last_event_id TEXT, updated_at TEXT
);
CREATE TABLE IF NOT EXISTS people (
  person_id TEXT PRIMARY KEY, name TEXT, email TEXT, slack_id TEXT, github TEXT,
  tz TEXT, role TEXT, extra TEXT
);
CREATE TABLE IF NOT EXISTS kv (key TEXT PRIMARY KEY, value TEXT, updated_at TEXT);
"""


class Store:
    def __init__(self, path: Path):
        self.path = Path(path)
        self.path.parent.mkdir(parents=True, exist_ok=True)
        self._local = threading.local()
        with self.conn() as c:
            c.executescript(SCHEMA)

    def conn(self) -> sqlite3.Connection:
        c = getattr(self._local, "c", None)
        if c is None:
            c = sqlite3.connect(self.path, timeout=30, isolation_level=None)
            c.row_factory = sqlite3.Row
            c.execute("PRAGMA journal_mode=WAL")
            self._local.c = c
        return c

    # -- events ---------------------------------------------------------------
    def add_event(self, e: Event) -> bool:
        """Insert; False if we already had it (dedupe)."""
        c = self.conn()
        try:
            c.execute(
                "INSERT INTO events (id, source, kind, at, actor, ref, thread_ref, text, url, extra, seen_at)"
                " VALUES (?,?,?,?,?,?,?,?,?,?,?)",
                (e.id, e.source, e.kind, e.at, e.actor, e.ref, e.thread_ref, e.text, e.url,
                 json.dumps(e.extra, ensure_ascii=False), now_iso()),
            )
            c.execute("INSERT INTO events_fts (id, text) VALUES (?,?)", (e.id, e.text or ""))
            return True
        except sqlite3.IntegrityError:
            return False

    def get_event(self, event_id: str) -> Event | None:
        r = self.conn().execute("SELECT * FROM events WHERE id=?", (event_id,)).fetchone()
        return self._row_event(r) if r else None

    def thread_events(self, thread_ref: str) -> list[Event]:
        rows = self.conn().execute(
            "SELECT * FROM events WHERE thread_ref=? ORDER BY at, id", (thread_ref,)).fetchall()
        return [self._row_event(r) for r in rows]

    def set_event_status(self, event_id: str, status: str) -> None:
        self.conn().execute("UPDATE events SET status=? WHERE id=?", (status, event_id))

    def search_events(self, query: str, limit: int = 20) -> list[Event]:
        rows = self.conn().execute(
            "SELECT e.* FROM events_fts f JOIN events e ON e.id=f.id WHERE events_fts MATCH ? LIMIT ?",
            (query, limit)).fetchall()
        return [self._row_event(r) for r in rows]

    @staticmethod
    def _row_event(r: sqlite3.Row) -> Event:
        d = dict(r)
        d["extra"] = json.loads(d.get("extra") or "{}")
        return Event.from_dict(d)

    # -- cursors --------------------------------------------------------------
    def cursor(self, adapter: str) -> str | None:
        r = self.conn().execute("SELECT cursor FROM cursors WHERE adapter=?", (adapter,)).fetchone()
        return r["cursor"] if r else None

    def set_cursor(self, adapter: str, cursor: str | None) -> None:
        self.conn().execute(
            "INSERT INTO cursors (adapter, cursor, updated_at) VALUES (?,?,?)"
            " ON CONFLICT(adapter) DO UPDATE SET cursor=excluded.cursor, updated_at=excluded.updated_at",
            (adapter, cursor, now_iso()))

    # -- actions (idempotency + approvals) ------------------------------------
    def action(self, idem_key: str) -> dict | None:
        r = self.conn().execute("SELECT * FROM actions WHERE idem_key=?", (idem_key,)).fetchone()
        if not r:
            return None
        d = dict(r)
        d["payload"] = json.loads(d["payload"] or "{}")
        d["result"] = json.loads(d["result"] or "null")
        return d

    def put_action(self, idem_key: str, action: str, target: str, payload: dict, status: str,
                   event_id: str | None = None, result: Any = None) -> None:
        now = now_iso()
        self.conn().execute(
            "INSERT INTO actions (idem_key, action, target, payload, status, result, event_id, created_at, updated_at)"
            " VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(idem_key) DO UPDATE SET status=excluded.status,"
            " payload=excluded.payload, result=excluded.result, updated_at=excluded.updated_at",
            (idem_key, action, target, json.dumps(payload, ensure_ascii=False), status,
             json.dumps(result, ensure_ascii=False), event_id, now, now))

    def claim_action(self, idem_key: str, from_status: str, to_status: str) -> bool:
        """Atomic status change; False if someone else already moved it (double click)."""
        cur = self.conn().execute(
            "UPDATE actions SET status=?, updated_at=? WHERE idem_key=? AND status=?",
            (to_status, now_iso(), idem_key, from_status))
        return cur.rowcount == 1

    def actions_by_status(self, status: str) -> list[dict]:
        rows = self.conn().execute("SELECT idem_key FROM actions WHERE status=? ORDER BY created_at",
                                   (status,)).fetchall()
        return [self.action(r["idem_key"]) for r in rows]

    # -- threads the Peer takes part in ---------------------------------------
    def mark_thread(self, thread_ref: str, channel: str, thread_ts: str, role: str,
                    last_event_id: str | None = None) -> None:
        self.conn().execute(
            "INSERT INTO threads (thread_ref, channel, thread_ts, peer_role, last_event_id, updated_at)"
            " VALUES (?,?,?,?,?,?) ON CONFLICT(thread_ref) DO UPDATE SET peer_role=excluded.peer_role,"
            " last_event_id=COALESCE(excluded.last_event_id, threads.last_event_id), updated_at=excluded.updated_at",
            (thread_ref, channel, thread_ts, role, last_event_id, now_iso()))

    def thread(self, thread_ref: str) -> dict | None:
        r = self.conn().execute("SELECT * FROM threads WHERE thread_ref=?", (thread_ref,)).fetchone()
        return dict(r) if r else None

    # -- person map -----------------------------------------------------------
    def upsert_person(self, person_id: str, **fields: Any) -> None:
        cols = ["name", "email", "slack_id", "github", "tz", "role", "extra"]
        vals = {k: fields.get(k) for k in cols}
        if isinstance(vals["extra"], (dict, list)):
            vals["extra"] = json.dumps(vals["extra"], ensure_ascii=False)
        sets = ", ".join(f"{k}=COALESCE(excluded.{k}, people.{k})" for k in cols)
        self.conn().execute(
            f"INSERT INTO people (person_id, {', '.join(cols)}) VALUES (?{',?' * len(cols)})"
            f" ON CONFLICT(person_id) DO UPDATE SET {sets}",
            (person_id, *[vals[k] for k in cols]))

    def person_by(self, field: str, value: str) -> dict | None:
        if field not in ("person_id", "email", "slack_id", "github"):
            raise ValueError(field)
        r = self.conn().execute(f"SELECT * FROM people WHERE {field}=?", (value,)).fetchone()
        return dict(r) if r else None

    def people(self) -> list[dict]:
        return [dict(r) for r in self.conn().execute("SELECT * FROM people ORDER BY name").fetchall()]

    # -- kv -------------------------------------------------------------------
    def get_kv(self, key: str, default: Any = None) -> Any:
        r = self.conn().execute("SELECT value FROM kv WHERE key=?", (key,)).fetchone()
        return json.loads(r["value"]) if r else default

    def set_kv(self, key: str, value: Any) -> None:
        self.conn().execute(
            "INSERT INTO kv (key, value, updated_at) VALUES (?,?,?) ON CONFLICT(key) DO UPDATE SET"
            " value=excluded.value, updated_at=excluded.updated_at",
            (key, json.dumps(value, ensure_ascii=False), now_iso()))
