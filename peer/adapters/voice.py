"""The voice adapter: text -> a short MP3 clip the meeting bot plays. A company port swaps it.

Two engines, every voice id in settings (`voice.voices.<role>.<engine>`, roles: peer, holding,
and one per colleague), so the owner can choose by ear:
- `local`: the Mac's `say` voices, converted with ffmpeg. Free; every spike and development clip.
- `elevenlabs`: the walk's clips and the Peer's fixed lines only. The key is shared with a live
  product, so: stock voices only (category `premade`, checked by id against the voices API), never
  a voice whose name contains the owner's name (a professional clone is labelled `professional`, not
  `cloned`), one request at a time, the account's quota read first (`/v1/user/subscription`), a
  character budget for this package (`voice.elevenlabs_budget_chars`, 20,000) kept in a ledger, and
  no request when the account has under 20% of its limit left. It never adds, edits or deletes a voice
  or changes a setting: it only reads the voice list and the quota, and renders speech.
Every clip is cached by engine, voice and text, and starts with about 1 s of silence (spike 1d: Recall
clips the first second).
"""
from __future__ import annotations

import fcntl
import hashlib
import json
import logging
import shutil
import subprocess
import tempfile
import threading
import time
from pathlib import Path

import httpx

from ..events import now_iso
from ..settings import PEER_HOME, get_settings, secret
from .base import Adapter

log = logging.getLogger("peer.voice")

CACHE = PEER_HOME / "voice-cache"
LEDGER = CACHE / "elevenlabs-ledger.json"
EL_BASE = "https://api.elevenlabs.io"
_one_at_a_time = threading.Lock()


class VoiceRefused(Exception):
    pass


def duration_s(path: Path) -> float:
    out = subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", str(path)],
                         capture_output=True, text=True, timeout=20)
    try:
        return float(out.stdout.strip())
    except ValueError:
        return 0.0


def _pad_to_mp3(src: Path, dst: Path, pad_ms: int) -> None:
    """Mono MP3 with pad_ms of silence in front (the first second of a clip is lost in the meeting)."""
    tmp = dst.with_suffix(".tmp.mp3")
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", "-i", str(src), "-af", f"adelay={pad_ms}:all=1",
                    "-ac", "1", "-ar", "24000", "-b:a", "64k", str(tmp)], check=True, timeout=60)
    tmp.replace(dst)


class VoiceAdapter(Adapter):
    name = "voice"
    capabilities = frozenset({"act:render"})

    def __init__(self, st=None, engine: str | None = None):
        self.st = st or get_settings()
        self.engine = engine or self.st.get("voice.engine", "local")
        self._checked: dict[str, dict] = {}

    # -- settings ----------------------------------------------------------------------------------
    def voice_id(self, role: str, engine: str | None = None) -> str:
        engine = engine or self.engine
        voices = self.st.get("voice.voices") or {}
        v = (voices.get(role) or voices.get("peer") or {}).get(engine)
        if not v:
            raise VoiceRefused(f"no {engine} voice set for '{role}' (voice.voices.{role}.{engine})")
        return str(v)

    # -- the contract --------------------------------------------------------------------------------
    def act(self, action: str, target: str, payload: dict, idempotency_key: str, dry_run: bool = False) -> dict:
        if action != "render":
            return super().act(action, target, payload, idempotency_key, dry_run)
        path = self.render(payload["text"], target or "peer", dry_run=dry_run)
        return {"ok": True, "path": str(path), "duration_s": duration_s(path) if path.exists() else 0.0}

    def check(self) -> dict:
        engines = {"local": bool(shutil.which("say") and shutil.which("ffmpeg")),
                   "elevenlabs": bool(secret("ELEVENLABS_API_KEY"))}
        return {"ok": engines.get(self.engine, False), "detail": f"engine {self.engine}; available: {engines}"}

    # -- rendering ------------------------------------------------------------------------------------
    def model(self, live: bool = False) -> str:
        return str(self.st.get("voice.elevenlabs_live_model" if live else "voice.elevenlabs_model", "eleven_multilingual_v2"))

    def cache_path(self, text: str, role: str, engine: str | None = None, live: bool = False) -> Path:
        engine = engine or self.engine
        vid = self.voice_id(role, engine)
        model = self.model(live) if engine == "elevenlabs" else "say"
        h = hashlib.sha256(f"{engine}|{vid}|{model}|{self.st.get('voice.pad_ms', 1000)}|{text}".encode()).hexdigest()[:20]
        return CACHE / engine / f"{h}.mp3"

    def render(self, text: str, role: str = "peer", *, dry_run: bool = False, engine: str | None = None,
               live: bool = False) -> Path:
        engine = engine or self.engine
        text = " ".join((text or "").split())
        if not text:
            raise VoiceRefused("nothing to say")
        out = self.cache_path(text, role, engine, live)
        if out.exists() and out.stat().st_size > 0:
            return out
        if dry_run and engine == "elevenlabs":
            return out    # a dry run never spends characters
        out.parent.mkdir(parents=True, exist_ok=True)
        pad = int(self.st.get("voice.pad_ms", 1000))
        t0 = time.time()
        if engine == "local":
            self._render_local(text, self.voice_id(role, "local"), out, pad)
        elif engine == "elevenlabs":
            self._render_elevenlabs(text, self.voice_id(role, "elevenlabs"), out, pad, role, self.model(live))
        else:
            raise VoiceRefused(f"unknown voice engine {engine}")
        log.info("rendered %d chars (%s, %s) in %.2fs", len(text), engine, role, time.time() - t0)
        return out

    def _render_local(self, text: str, voice: str, out: Path, pad: int) -> None:
        with tempfile.TemporaryDirectory(prefix="peer-say-") as d:
            aiff = Path(d) / "say.aiff"
            subprocess.run(["say", "-v", voice, "-o", str(aiff), text], check=True, timeout=60)
            _pad_to_mp3(aiff, out, pad)

    # -- ElevenLabs, behind the hard blocks -----------------------------------------------------------
    def _el(self) -> httpx.Client:
        key = secret("ELEVENLABS_API_KEY", required=True)
        return httpx.Client(base_url=EL_BASE, headers={"xi-api-key": key}, timeout=60)

    def check_voice(self, voice_id: str) -> dict:
        """Refuse anything but a stock voice, and any voice named after the owner (the clone)."""
        if voice_id in self._checked:
            return self._checked[voice_id]
        with self._el() as c:
            r = c.get(f"/v1/voices/{voice_id}")
        if r.status_code != 200:
            raise VoiceRefused(f"voice {voice_id}: HTTP {r.status_code}")
        v = r.json()
        name, category = str(v.get("name") or ""), str(v.get("category") or "")
        owner_names = {"manish"} | {w.lower() for w in str(self.st.get("voice.refuse_names_with") or "").split(",") if w.strip()}
        if any(n in name.lower() for n in owner_names):
            raise VoiceRefused(f"voice '{name}' carries the owner's name: never the owner's voice")
        if category != "premade":
            raise VoiceRefused(f"voice '{name}' is '{category}', not a stock (premade) voice")
        self._checked[voice_id] = {"name": name, "category": category}
        return self._checked[voice_id]

    def quota(self) -> dict:
        with self._el() as c:
            r = c.get("/v1/user/subscription")
        r.raise_for_status()
        d = r.json()
        return {"used": int(d.get("character_count") or 0), "limit": int(d.get("character_limit") or 0)}

    @staticmethod
    def ledger() -> dict:
        if LEDGER.exists():
            return json.loads(LEDGER.read_text())
        return {"spent": 0, "requests": []}

    def _render_elevenlabs(self, text: str, voice_id: str, out: Path, pad: int, role: str, model: str) -> None:
        budget = int(self.st.get("voice.elevenlabs_budget_chars", 20000))
        self.check_voice(voice_id)
        CACHE.mkdir(parents=True, exist_ok=True)
        with _one_at_a_time, open(CACHE / ".elevenlabs.lock", "w") as lock:
            fcntl.flock(lock, fcntl.LOCK_EX)        # one request at a time, across processes too
            led = self.ledger()
            if led["spent"] + len(text) > budget:
                raise VoiceRefused(f"ElevenLabs budget: {led['spent']} + {len(text)} would pass {budget} characters")
            q = self.quota()
            if q["limit"] and (q["limit"] - q["used"]) < 0.2 * q["limit"]:
                raise VoiceRefused(f"ElevenLabs account has under 20% left ({q['used']} of {q['limit']})")
            body = {"text": text, "model_id": model}
            t0 = time.time()
            with self._el() as c:
                r = c.post(f"/v1/text-to-speech/{voice_id}", params={"output_format": "mp3_44100_64"}, json=body,
                           headers={"accept": "audio/mpeg"})
            if r.status_code != 200:
                raise VoiceRefused(f"ElevenLabs HTTP {r.status_code}: {r.text[:160]}")
            led["spent"] += len(text)
            led["requests"].append({"at": now_iso(), "chars": len(text), "role": role, "voice": voice_id,
                                    "s": round(time.time() - t0, 2), "model": model, "account_used_before": q["used"],
                                    "limit": q["limit"]})
            LEDGER.write_text(json.dumps(led, indent=1))
        with tempfile.TemporaryDirectory(prefix="peer-el-") as d:
            raw = Path(d) / "el.mp3"
            raw.write_bytes(r.content)
            _pad_to_mp3(raw, out, pad)
