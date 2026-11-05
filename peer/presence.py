"""Is the owner online or away? (DESIGN defaults: Slack presence and status, working hours, a manual switch.)

Order: the manual switch wins; then a Slack status that means away; then Slack presence;
then working hours in the owner's time zone.
"""
from __future__ import annotations

import time
from datetime import datetime
from zoneinfo import ZoneInfo

from .settings import Settings

CITY = {"Asia/Kolkata": "India", "America/Los_Angeles": "California", "Europe/London": "London"}


class Presence:
    def __init__(self, st: Settings, chat, owner_chat_id: str | None, profile: dict):
        self.st = st
        self.chat = chat
        self.owner_chat_id = owner_chat_id
        self.profile = profile
        self._cache: tuple[float, dict] | None = None

    def local_time(self) -> dict:
        tz = self.profile.get("tz", "UTC")
        now = datetime.now(ZoneInfo(tz))
        return {"tz": tz, "where": CITY.get(tz, tz), "hhmm": now.strftime("%H:%M"),
                "label": now.strftime("%-I:%M %p"), "weekday": now.strftime("%a"), "dt": now}

    def in_working_hours(self, now: datetime) -> bool:
        wh = self.profile.get("working_hours") or {}
        if not wh:
            return True
        if now.strftime("%a") not in wh.get("days", []):
            return False
        return wh.get("start", "00:00") <= now.strftime("%H:%M") < wh.get("end", "23:59")

    def state(self, fresh: bool = False) -> dict:
        if self._cache and not fresh and time.time() - self._cache[0] < 20:
            return self._cache[1]
        lt = self.local_time()
        out = {"local_time": lt["label"], "where": lt["where"], "tz": lt["tz"]}
        manual = str(self.st.get("presence.manual", "auto")).lower()
        if manual in ("away", "online"):
            out.update(status=manual, reason=f"manual switch: {manual}")
        else:
            status_text, emoji, presence = "", "", None
            if self.chat and self.owner_chat_id:
                try:
                    s = self.chat.get_status(self.owner_chat_id)
                    status_text, emoji = (s.get("text") or "").lower(), s.get("emoji") or ""
                    presence = self.chat.get_presence(self.owner_chat_id)
                except Exception:  # noqa: BLE001
                    presence = None
            words = [w.lower() for w in self.st.get("presence.away_status_words", [])]
            if (status_text and any(w in status_text for w in words)) or emoji in self.st.get("presence.away_status_emoji", []):
                out.update(status="away", reason=f"Slack status '{status_text or emoji}'")
            elif presence == "active":
                out.update(status="online", reason="Slack presence active")
            elif presence == "away":
                out.update(status="away", reason="Slack presence away")
            elif self.in_working_hours(lt["dt"]):
                out.update(status="online", reason="inside working hours")
            else:
                out.update(status="away", reason="outside working hours")
        self._cache = (time.time(), out)
        return out
