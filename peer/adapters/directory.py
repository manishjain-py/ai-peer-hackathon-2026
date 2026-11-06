"""Directory adapter: the stand-in for a company directory (a profile JSON file).

At a real company this becomes the HR directory / org chart (at Airbnb: the OneAirbnb page
or a hand-written profile). Verbs: sense (the profile once, then on change), search, get.
"""
from __future__ import annotations

import hashlib
import json
from pathlib import Path

from ..events import Event, now_iso
from .base import Adapter


class DirectoryAdapter(Adapter):
    name = "directory"
    capabilities = frozenset({"sense", "search", "get"})

    def __init__(self, profile_path: Path, extra_people: list[dict] | None = None):
        self.profile_path = Path(profile_path)
        self.extra_people = extra_people or []

    @classmethod
    def from_settings(cls, st) -> "DirectoryAdapter":
        from ..memory.discovery import load_world   # the test world's invented colleagues
        return cls(st.profile_path(), load_world().get("colleagues", []))

    def profile(self) -> dict:
        return json.loads(self.profile_path.read_text())

    def people(self) -> list[dict]:
        p = self.profile()
        owner = {k: p.get(k) for k in ("person_id", "name", "preferred_name", "title", "email", "tz", "github")}
        owner["is_owner"] = True
        return [owner, *p.get("teammates", []), *self.extra_people]

    def sense(self, cursor: str | None) -> tuple[list[Event], str | None]:
        raw = self.profile_path.read_bytes()
        digest = hashlib.sha1(raw).hexdigest()[:12]
        if digest == cursor:
            return [], cursor
        p = json.loads(raw)
        e = Event(id=f"directory:profile:{p['person_id']}:{digest}", source="directory", kind="profile",
                  at=now_iso(), actor=None, ref=f"directory:person:{p['person_id']}", thread_ref=None,
                  text=f"{p.get('name')}: {p.get('title')} ({p.get('company')})", url=None,
                  extra={"profile": p})
        return [e], digest

    def search(self, query: str, filters: dict | None = None) -> list[dict]:
        q = query.lower()
        out = []
        for person in self.people():
            blob = json.dumps(person, ensure_ascii=False).lower()
            if q in blob:
                out.append({"ref": f"directory:person:{person.get('person_id')}",
                            "snippet": f"{person.get('name')}: {person.get('title') or person.get('role')}",
                            "url": None})
        return out

    def get(self, ref: str) -> dict:
        pid = ref.rsplit(":", 1)[-1]
        p = self.profile()
        if pid == p.get("person_id"):
            return p
        for person in self.people():
            if person.get("person_id") == pid:
                return person
        return {}
