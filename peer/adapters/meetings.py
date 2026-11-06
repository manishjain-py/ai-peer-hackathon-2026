"""The meetings adapter on Recall.ai (DESIGN §2): a meeting bot on Zoom. A company port swaps it.

sense: bot status changes and transcript lines (the live lines arrive by webhook, see
       peer/meetings/listener.py; sense reads what the store holds).
search: past meeting transcripts (the memory's meeting briefs).
get:   a transcript or a recording of one bot (signed storage links, fetched right after the meeting:
       they expire).
act:   join, speak (a prepared clip), stop_speaking, chat, leave. dry_run never touches Recall.

Hard blocks, in code and on by default:
- `meetings.join_real_meetings: false`: a bot joins only the test meeting (the Zoom meeting id in
  ZOOM_TEST_MEETING_URL); "seeded" is only a flag the test code sets and proves nothing.
- The meeting link is a secret: Recall's replies carry the meeting id and passcode, so this module
  never returns, logs or stores a raw reply. Callers get `safe_bot()` and redacted errors only; logs
  and pages show the meeting's label ("AI Peer test (Zoom)").
- API calls go only to RECALL_BASE_URL; every bot gets automatic_leave limits (Recall's defaults keep
  two bots in a call together for an hour or more).
"""
from __future__ import annotations

import base64
import logging
import re
import time
from pathlib import Path
from typing import Any
from urllib.parse import parse_qs, urlparse

import httpx

from ..events import Event, now_iso
from ..settings import get_settings, secret
from .base import Adapter

log = logging.getLogger("peer.meetings")

TEST_LABEL = "AI Peer test (Zoom)"
ACTS = ("join", "speak", "stop_speaking", "chat", "leave")
SILENT_MP3_SECONDS = 1


class MeetingRefused(Exception):
    pass


def zoom_meeting_id(url: str | None) -> str | None:
    """The numeric Zoom meeting id in a join link (zoom.us/j/<id>, /wc/<id>/join, /s/<id>, ?confno=<id>)."""
    if not url:
        return None
    u = urlparse(url.strip())
    if not (u.hostname or "").endswith("zoom.us"):
        return None
    m = re.search(r"/(?:j|s|wc|w)/(\d{9,12})", u.path)
    if m:
        return m.group(1)
    q = parse_qs(u.query)
    for k in ("confno", "meetingId"):
        if q.get(k) and q[k][0].isdigit():
            return q[k][0]
    return None


def redact(text: str) -> str:
    """No meeting ids, passcodes or join links in anything we keep or print."""
    text = re.sub(r"https?://\S*zoom\.us\S*", "<zoom link>", str(text))
    text = re.sub(r"(?i)(pwd|passcode|password|meeting_password)[\"'=: ]+[^\s,\"'}]+", r"\1=<redacted>", text)
    return re.sub(r"\b\d{9,12}\b", "<id>", text)


def safe_bot(b: dict) -> dict:
    """The parts of a Recall bot we may keep: never meeting_url (id + passcode) or anything derived."""
    rec = (b.get("recordings") or [{}])[0] if b.get("recordings") else {}
    shortcuts = rec.get("media_shortcuts") or {}
    changes = [{"code": c.get("code"), "sub_code": c.get("sub_code"), "at": c.get("created_at")}
               for c in (b.get("status_changes") or [])]
    return {"id": b.get("id"), "bot_name": b.get("bot_name"), "status": changes[-1]["code"] if changes else None,
            "sub_code": changes[-1]["sub_code"] if changes else None, "status_changes": changes,
            "join_at": b.get("join_at"), "recording_id": rec.get("id"),
            "has": {k: bool((v or {}).get("data", {}).get("download_url")) for k, v in shortcuts.items() if isinstance(v, dict)}}


def silent_mp3_b64() -> str:
    """Recall needs automatic_audio_output at create time for output_audio to work; a short silence plays."""
    import subprocess
    import tempfile
    with tempfile.TemporaryDirectory() as d:
        p = Path(d) / "silence.mp3"
        subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-f", "lavfi", "-i", "anullsrc=r=24000:cl=mono",
                        "-t", str(SILENT_MP3_SECONDS), "-b:a", "32k", str(p)], check=True, timeout=30)
        return base64.b64encode(p.read_bytes()).decode()


class MeetingsAdapter(Adapter):
    name = "meetings"
    capabilities = frozenset({"sense", "search", "get", *(f"act:{a}" for a in ACTS)})

    def __init__(self, st=None):
        self.st = st or get_settings()
        self.base = (secret("RECALL_BASE_URL") or "").rstrip("/")
        self._key = secret("RECALL_API_KEY")

    # -- http ----------------------------------------------------------------------------------------
    def _client(self) -> httpx.Client:
        if not self.base or not self._key:
            raise MeetingRefused("RECALL_BASE_URL and RECALL_API_KEY are needed in ~/.ai-peer/.env")
        return httpx.Client(base_url=self.base, headers={"Authorization": f"Token {self._key}"}, timeout=30)

    def _call(self, method: str, path: str, **kw) -> httpx.Response:
        with self._client() as c:
            for attempt in range(8):
                r = c.request(method, path, **kw)
                if r.status_code == 507 and method == "POST" and path == "/api/v1/bot/":
                    log.warning("Recall's ready pool is empty (507); retrying in 30 s")
                    time.sleep(30)
                    continue
                if r.status_code == 429:
                    time.sleep(2 + attempt)
                    continue
                return r
        return r

    @staticmethod
    def _err(r: httpx.Response) -> str:
        return f"HTTP {r.status_code}: {redact(r.text[:300])}"

    # -- the test-meeting hard block -------------------------------------------------------------------
    def is_test_meeting(self, url: str | None) -> bool:
        mid = zoom_meeting_id(url)
        return bool(mid) and mid == zoom_meeting_id(secret("ZOOM_TEST_MEETING_URL"))

    def allowed(self, url: str | None) -> tuple[bool, str]:
        if not zoom_meeting_id(url):
            return False, "not a Zoom join link"
        if self.is_test_meeting(url):
            return True, "the test meeting"
        if self.st.get("meetings.join_real_meetings", False) is True:
            return True, "real meetings allowed by the owner"
        return False, "real meetings are blocked (meetings.join_real_meetings is off): only the test meeting"

    @staticmethod
    def label(url: str | None, title: str | None = None) -> str:
        return TEST_LABEL if url and zoom_meeting_id(url) == zoom_meeting_id(secret("ZOOM_TEST_MEETING_URL")) else (title or "a Zoom meeting")

    # -- bots ------------------------------------------------------------------------------------------
    def create_bot(self, meeting_url: str, bot_name: str, *, realtime_url: str | None = None, transcript: bool = True,
                   audio_b64: str | None = None, join_at: str | None = None, metadata: dict | None = None,
                   include_bot_audio: bool = True, max_minutes: int | None = None) -> dict:
        ok, why = self.allowed(meeting_url)
        if not ok:
            raise MeetingRefused(why)
        max_s = 60 * int(max_minutes or self.st.get("meetings.max_minutes", 10))
        rc: dict[str, Any] = {"include_bot_in_recording": {"audio": include_bot_audio}}
        if transcript:
            rc["transcript"] = {"provider": {"recallai_streaming": {"mode": "prioritize_low_latency", "language_code": "en"}}}
        if realtime_url:
            rc["realtime_endpoints"] = [{"type": "webhook", "url": realtime_url,
                                         "events": ["transcript.data", "transcript.partial_data",
                                                    "participant_events.join", "participant_events.leave",
                                                    "participant_events.chat_message"]}]
        body: dict[str, Any] = {
            "meeting_url": meeting_url, "bot_name": bot_name[:100], "recording_config": rc,
            "automatic_audio_output": {"in_call_recording": {"data": {"kind": "mp3", "b64_data": audio_b64 or silent_mp3_b64()}}},
            "automatic_leave": {"waiting_room_timeout": 60, "noone_joined_timeout": 120,
                                "everyone_left_timeout": {"timeout": 5}, "in_call_not_recording_timeout": 120,
                                "in_call_recording_timeout": max_s, "recording_permission_denied_timeout": 30,
                                "silence_detection": {"timeout": 240, "activate_after": 60}},
            "metadata": {k: str(v)[:500] for k, v in (metadata or {}).items()},
        }
        if join_at:
            body["join_at"] = join_at
        r = self._call("POST", "/api/v1/bot/", json=body)
        if r.status_code not in (200, 201):
            raise MeetingRefused("Recall would not create the bot: " + self._err(r))
        b = safe_bot(r.json())
        log.info("bot %s created (%s)", b["id"], bot_name)
        return b

    def bot(self, bot_id: str) -> dict:
        r = self._call("GET", f"/api/v1/bot/{bot_id}/")
        if r.status_code != 200:
            raise MeetingRefused(self._err(r))
        return safe_bot(r.json())

    def _raw_bot(self, bot_id: str) -> dict:
        """For media links only; never returned to a caller or logged."""
        r = self._call("GET", f"/api/v1/bot/{bot_id}/")
        r.raise_for_status()
        return r.json()

    def wait_status(self, bot_id: str, codes: set[str], timeout: float = 120, every: float = 2) -> dict:
        deadline = time.time() + timeout
        b = self.bot(bot_id)
        while time.time() < deadline:
            if b["status"] in codes or b["status"] in ("fatal", "done", "call_ended"):
                return b
            time.sleep(every)
            b = self.bot(bot_id)
        return b

    def leave(self, bot_id: str) -> dict:
        r = self._call("POST", f"/api/v1/bot/{bot_id}/leave_call/")
        return {"ok": r.status_code in (200, 201, 202), "status": r.status_code}

    def remove_scheduled(self, bot_id: str) -> dict:
        r = self._call("DELETE", f"/api/v1/bot/{bot_id}/")
        return {"ok": r.status_code in (200, 202, 204), "status": r.status_code}

    def output_audio(self, bot_id: str, mp3: Path) -> dict:
        b64 = base64.b64encode(Path(mp3).read_bytes()).decode()
        t0 = time.time()
        r = self._call("POST", f"/api/v1/bot/{bot_id}/output_audio/", json={"kind": "mp3", "b64_data": b64})
        return {"ok": r.status_code in (200, 201), "status": r.status_code, "api_s": round(time.time() - t0, 2),
                "error": None if r.status_code in (200, 201) else self._err(r)}

    def stop_audio(self, bot_id: str) -> dict:
        r = self._call("DELETE", f"/api/v1/bot/{bot_id}/output_audio/")
        return {"ok": r.status_code in (200, 202, 204), "status": r.status_code,
                "error": None if r.status_code in (200, 202, 204) else self._err(r)}

    def send_chat(self, bot_id: str, text: str) -> dict:
        r = self._call("POST", f"/api/v1/bot/{bot_id}/send_chat_message/", json={"to": "everyone", "message": text[:4000]})
        return {"ok": r.status_code in (200, 201), "status": r.status_code,
                "error": None if r.status_code in (200, 201) else self._err(r)}

    def list_bots(self, **params) -> list[dict]:
        out, path = [], "/api/v1/bot/"
        q = {"page_size": 50, **params}
        for _ in range(10):
            r = self._call("GET", path, params=q)
            if r.status_code != 200:
                raise MeetingRefused(self._err(r))
            d = r.json()
            out += [safe_bot(b) for b in d.get("results", [])]
            nxt = d.get("next")
            if not nxt:
                break
            u = urlparse(nxt)
            path, q = u.path, {k: v[0] for k, v in parse_qs(u.query).items()}
        return out

    def usage(self, start: str, end: str) -> dict:
        r = self._call("GET", "/api/v1/billing/usage/", params={"start": start, "end": end})
        if r.status_code != 200:
            return {"ok": False, "error": self._err(r)}
        return {"ok": True, **r.json()}

    def media(self, bot_id: str, kind: str = "transcript") -> tuple[str | None, dict]:
        """(signed download link, safe info) for media_shortcuts.<kind>: transcript, video_mixed, ..."""
        b = self._raw_bot(bot_id)
        rec = (b.get("recordings") or [{}])[0] if b.get("recordings") else {}
        sc = ((rec.get("media_shortcuts") or {}).get(kind) or {})
        return ((sc.get("data") or {}).get("download_url"), {"status": (sc.get("status") or {}).get("code"), "id": sc.get("id")})

    def download(self, url: str, dest: Path) -> Path:
        """Signed storage links are not RECALL_BASE_URL and need no key: plain GET, right after the meeting."""
        dest.parent.mkdir(parents=True, exist_ok=True)
        with httpx.stream("GET", url, timeout=120, follow_redirects=True) as r:
            r.raise_for_status()
            with dest.open("wb") as f:
                for chunk in r.iter_bytes():
                    f.write(chunk)
        return dest

    def transcript_lines(self, bot_id: str, timeout: float = 90) -> list[dict]:
        """The bot's full transcript after it left: [{speaker, text, start, end}] (spike 1d: about 8 s after leaving)."""
        deadline = time.time() + timeout
        while time.time() < deadline:
            url, info = self.media(bot_id, "transcript")
            if url:
                r = httpx.get(url, timeout=60, follow_redirects=True)
                r.raise_for_status()
                lines = []
                for seg in r.json():
                    words = seg.get("words") or []
                    lines.append({"speaker": (seg.get("participant") or {}).get("name") or "unknown",
                                  "text": " ".join(w.get("text", "") for w in words).strip(),
                                  "start": (words[0].get("start_timestamp") or {}).get("relative") if words else None,
                                  "end": (words[-1].get("end_timestamp") or {}).get("relative") if words else None})
                return lines
            time.sleep(4)
        return []

    # -- the contract --------------------------------------------------------------------------------
    def sense(self, cursor: str | None) -> tuple[list[Event], str | None]:
        from ..meetings import store as mstore
        return mstore.events_since(self.st, cursor)

    def search(self, query: str, filters: dict | None = None) -> list[dict]:
        q = query.lower()
        out = []
        for p in sorted((self.st.owner_dir / "meetings").glob("*.md")):
            text = p.read_text(errors="replace")
            if q in text.lower():
                i = text.lower().index(q)
                out.append({"ref": f"meetings:brief:{p.stem}", "snippet": text[max(0, i - 80):i + 120].replace("\n", " "),
                            "url": None, "title": p.stem})
        return out

    def get(self, ref: str) -> dict:
        kind, _, rest = ref.partition(":")[2].partition(":")
        if kind == "brief":
            p = self.st.owner_dir / "meetings" / f"{rest}.md"
            return {"ref": ref, "text": p.read_text()} if p.exists() else {}
        if kind == "transcript":
            return {"ref": ref, "lines": self.transcript_lines(rest)}
        if kind == "recording":
            url, info = self.media(rest, "video_mixed")
            return {"ref": ref, "available": bool(url), **info}
        return {}

    def act(self, action: str, target: str, payload: dict, idempotency_key: str, dry_run: bool = False) -> dict:
        if action not in ACTS:
            return super().act(action, target, payload, idempotency_key, dry_run)
        if action == "join":
            ok, why = self.allowed(payload.get("meeting_url"))
            if not ok:
                raise MeetingRefused(why)
            if dry_run:
                return {"ok": True, "dry_run": True, "id": f"dry-{idempotency_key}", "label": self.label(payload.get("meeting_url"))}
            return self.create_bot(payload["meeting_url"], payload["bot_name"], realtime_url=payload.get("realtime_url"),
                                   audio_b64=payload.get("audio_b64"), join_at=payload.get("join_at"),
                                   metadata=payload.get("metadata"))
        if dry_run:
            return {"ok": True, "dry_run": True, "action": action, "at": now_iso()}
        if action == "speak":
            return self.output_audio(target, Path(payload["clip"]))
        if action == "stop_speaking":
            return self.stop_audio(target)
        if action == "chat":
            return self.send_chat(target, payload["text"])
        return self.leave(target)

    def check(self) -> dict:
        try:
            r = self._call("GET", "/api/v1/bot/", params={"page_size": 1})
            return {"ok": r.status_code == 200, "detail": f"Recall HTTP {r.status_code}"}
        except Exception as e:  # noqa: BLE001
            return {"ok": False, "detail": redact(str(e))[:120]}
