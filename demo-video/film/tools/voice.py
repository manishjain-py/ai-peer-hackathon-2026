#!/usr/bin/env -S uv run --quiet --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy>=1.26"]
# ///
"""voice: turn audio/script.json into spoken lines, with word timings.

    uv run --quiet demo-video/film/tools/voice.py lines      # every line of the script
    uv run --quiet demo-video/film/tools/voice.py samples    # the sample line in three voices
    uv run --quiet demo-video/film/tools/voice.py index      # rebuild audio/narration.json only

What it does:
  1. builds one ElevenLabs request per line (the voice, the model and the seed from the script;
     the neighbouring lines of the same speaker in the same part are sent as context, so the
     sentence melody carries across the cut);
  2. skips a line whose request is unchanged and whose audio exists (a re-run costs nothing);
  3. saves the audio as WAV (44.1 kHz, mono, 16 bit) with the silence at both ends trimmed,
     and the character timings ElevenLabs returns, shifted by the trim;
  4. writes audio/narration.json: per line its file, length, loudness and word timings;
  5. appends one row per call to audio/elevenlabs-usage.csv (characters, no money: the plan
     is already paid, DESIGN C5).

The key is read from ELEVENLABS_API_KEY or ~/.ai-peer/.env and is never printed.
"""
from __future__ import annotations

import base64
import csv
import datetime as dt
import hashlib
import json
import math
import os
import re
import subprocess
import sys
import urllib.error
import urllib.request
import wave
from pathlib import Path

import numpy as np

FILM = Path(__file__).resolve().parents[1]
AUDIO = FILM / "audio"
LINES = AUDIO / "lines"
SAMPLES = AUDIO / "samples"
SCRIPT = AUDIO / "script.json"
USAGE = AUDIO / "elevenlabs-usage.csv"
SR = 44100
API = "https://api.elevenlabs.io"


def api_key() -> str:
    value = os.environ.get("ELEVENLABS_API_KEY")
    if value:
        return value
    env = Path.home() / ".ai-peer/.env"
    for line in env.read_text().splitlines():
        m = re.match(r"^\s*(?:export\s+)?ELEVENLABS_API_KEY\s*=\s*(.*)$", line)
        if m:
            return m.group(1).strip().strip('"').strip("'")
    raise SystemExit("ELEVENLABS_API_KEY is not set and not in ~/.ai-peer/.env")


def now() -> str:
    return dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%d %H:%M:%S")


def db(x: float) -> float:
    return 20 * math.log10(max(x, 1e-9))


def trim(samples: np.ndarray) -> tuple[np.ndarray, float]:
    """Cut the silence at both ends. Returns the cut samples and the seconds removed in front."""
    win = SR // 100                                    # 10 ms
    n = len(samples) // win
    if n < 5:
        return samples, 0.0
    rms = np.sqrt((samples[: n * win].reshape(n, win) ** 2).mean(axis=1))
    loud = np.nonzero(rms > 10 ** (-48 / 20))[0]
    if len(loud) == 0:
        return samples, 0.0
    first = max(0, loud[0] * win - int(0.03 * SR))     # 30 ms of air before the first sound
    last = min(len(samples), (loud[-1] + 1) * win + int(0.14 * SR))   # 140 ms for the tail
    out = samples[first:last].copy()
    fade = int(0.006 * SR)
    ramp = np.linspace(0, 1, fade, dtype=np.float32)
    out[:fade] *= ramp
    out[-fade:] *= ramp[::-1]
    return out, first / SR


def write_wav(path: Path, samples: np.ndarray) -> None:
    pcm = np.clip(np.round(samples * 32767), -32768, 32767).astype("<i2")
    with wave.open(str(path), "wb") as w:
        w.setnchannels(1)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(pcm.tobytes())


def words_from(alignment: dict, shift: float, caption: str) -> list[dict]:
    """Group the character timings into words; relabel them with the caption's own words."""
    chars = alignment["characters"]
    starts = alignment["character_start_times_seconds"]
    ends = alignment["character_end_times_seconds"]
    spoken, cur = [], None
    for ch, s, e in zip(chars, starts, ends):
        if ch.isspace():
            if cur:
                spoken.append(cur)
                cur = None
            continue
        if cur is None:
            cur = {"w": ch, "s": s, "e": e}
        else:
            cur["w"] += ch
            cur["e"] = e
    if cur:
        spoken.append(cur)
    for w in spoken:
        w["s"] = round(max(0.0, w["s"] - shift), 3)
        w["e"] = round(max(0.0, w["e"] - shift), 3)
    shown = caption.split()
    if len(shown) == len(spoken):
        return [{"w": t, "s": w["s"], "e": w["e"]} for t, w in zip(shown, spoken)]
    # The caption has another word count than the spoken text: spread it evenly over the line.
    t0, t1 = spoken[0]["s"], spoken[-1]["e"]
    step = (t1 - t0) / max(1, len(shown))
    return [{"w": t, "s": round(t0 + i * step, 3), "e": round(t0 + (i + 1) * step, 3)} for i, t in enumerate(shown)]


def call(voice_id: str, body: dict, fmt: str) -> tuple[dict, dict]:
    url = f"{API}/v1/text-to-speech/{voice_id}/with-timestamps?output_format={fmt}"
    req = urllib.request.Request(url, data=json.dumps(body).encode(),
                                 headers={"xi-api-key": api_key(), "Content-Type": "application/json"}, method="POST")
    try:
        with urllib.request.urlopen(req, timeout=180) as r:
            result = json.load(r)
            receipt = {"request_id": r.headers.get("request-id"), "character_cost": r.headers.get("character-cost")}
    except urllib.error.HTTPError as e:
        # Never print the request, its headers or the body of the error.
        raise SystemExit(f"ElevenLabs refused the call: HTTP {e.code}") from None
    return result, receipt


def log_usage(row: dict) -> None:
    new = not USAGE.exists()
    with USAGE.open("a", newline="") as f:
        w = csv.DictWriter(f, fieldnames=["time_utc", "what", "voice", "model", "characters", "character_cost", "request_id"])
        if new:
            w.writeheader()
        w.writerow(row)


def make(stem: Path, what: str, voice: dict, text: str, caption: str, script: dict, context: dict) -> dict:
    """Generate one piece of speech unless it is already there unchanged. Returns its record."""
    body = {"text": text, "model_id": script["model"], "voice_settings": voice["settings"], "seed": script["seed"], **context}
    digest = hashlib.sha256(json.dumps({"voice": voice["voice_id"], "body": body}, sort_keys=True).encode()).hexdigest()[:16]
    wav, meta_path = stem.with_suffix(".wav"), stem.with_suffix(".json")
    if wav.exists() and meta_path.exists():
        meta = json.loads(meta_path.read_text())
        if meta.get("request_sha") == digest:
            return meta
    pending = stem.with_suffix(".pending")
    if pending.exists():
        raise SystemExit(f"{stem.name}: an earlier call may have gone through. Check the usage log, then delete {pending}.")
    pending.write_text(digest)
    result, receipt = call(voice["voice_id"], body, script["format"])
    raw = np.frombuffer(base64.b64decode(result["audio_base64"]), dtype="<i2").astype(np.float32) / 32768
    cut, shift = trim(raw)
    write_wav(wav, cut)
    meta = {
        "what": what, "voice_id": voice["voice_id"], "voice": voice["name"], "model": script["model"],
        "text": caption, "spoken": text, "request_sha": digest, "request": body, **receipt,
        "generated_utc": now(), "file": wav.name, "seconds": round(len(cut) / SR, 3),
        "raw_seconds": round(len(raw) / SR, 3), "trimmed_front": round(shift, 3),
        "peak_dbfs": round(db(float(np.abs(cut).max())), 2),
        "rms_dbfs": round(db(float(np.sqrt((cut ** 2).mean()))), 2),
        "words": words_from(result["alignment"], shift, caption),
    }
    meta_path.write_text(json.dumps(meta, indent=1, ensure_ascii=False) + "\n")
    pending.unlink()
    log_usage({"time_utc": meta["generated_utc"], "what": what, "voice": voice["name"], "model": script["model"],
               "characters": len(text), "character_cost": receipt["character_cost"], "request_id": receipt["request_id"]})
    print(f"  made {what:<10} {voice['name']:<8} {meta['seconds']:.2f}s  peak {meta['peak_dbfs']} dBFS", flush=True)
    return meta


def context_for(lines: list[dict], i: int) -> dict:
    """The previous and the next line of the same speaker in the same part, as context only."""
    ctx = {}
    for delta, key in ((-1, "previous_text"), (1, "next_text")):
        j = i + delta
        if 0 <= j < len(lines) and lines[j]["speaker"] == lines[i]["speaker"] and lines[j]["part"] == lines[i]["part"]:
            ctx[key] = lines[j].get("spoken", lines[j]["text"])
    return ctx


def do_lines(script: dict) -> None:
    LINES.mkdir(parents=True, exist_ok=True)
    lines = script["lines"]
    for i, line in enumerate(lines):
        voice = script["voices"][line["speaker"]]
        make(LINES / line["id"], line["id"], voice, line.get("spoken", line["text"]), line["text"], script, context_for(lines, i))
    do_index(script)


def do_index(script: dict) -> None:
    out = []
    for line in script["lines"]:
        meta = json.loads((LINES / f"{line['id']}.json").read_text())
        words = meta["words"]
        speech = words[-1]["e"] - words[0]["s"]
        out.append({
            "id": line["id"], "part": line["part"], "speaker": line["speaker"], "voice": meta["voice"],
            "text": line["text"], "file": f"audio/lines/{meta['file']}", "seconds": meta["seconds"],
            "words_per_second": round(len(words) / speech, 2) if speech > 0 else None,
            "peak_dbfs": meta["peak_dbfs"], "rms_dbfs": meta["rms_dbfs"], "words": words,
        })
    index = {"about": "Made by tools/voice.py from audio/script.json. Do not edit by hand.",
             "model": script["model"], "total_seconds": round(sum(x["seconds"] for x in out), 2), "lines": out}
    (AUDIO / "narration.json").write_text(json.dumps(index, indent=1, ensure_ascii=False) + "\n")
    print(f"audio/narration.json: {len(out)} lines, {index['total_seconds']} s of speech")
    for x in out:
        print(f"  {x['id']:<4} {x['voice']:<8} {x['seconds']:>5.2f}s  {x['words_per_second']} w/s  {x['text']}")


def do_samples(script: dict) -> None:
    SAMPLES.mkdir(parents=True, exist_ok=True)
    s = script["samples"]
    for v in s["voices"]:
        stem = SAMPLES / v["file"]
        make(stem, "sample", v, s["text"], s["text"], script, {})
        mp3 = stem.with_suffix(".mp3")
        subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-i", str(stem.with_suffix(".wav")),
                        "-af", "adelay=250:all=1,apad=pad_dur=0.35,loudnorm=I=-16:TP=-1.5:LRA=11",
                        "-ar", "44100", "-c:a", "libmp3lame", "-b:a", "192k", str(mp3)], check=True)
        print(f"  {mp3.relative_to(FILM)}")


def main() -> None:
    script = json.loads(SCRIPT.read_text())
    mode = sys.argv[1] if len(sys.argv) > 1 else "lines"
    {"lines": do_lines, "samples": do_samples, "index": do_index}[mode](script)


if __name__ == "__main__":
    main()
