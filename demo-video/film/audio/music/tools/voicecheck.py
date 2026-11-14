#!/usr/bin/env -S uv run --quiet --script
# /// script
# requires-python = ">=3.10,<3.13"
# dependencies = ["faster-whisper>=1.1", "numpy>=1.26"]
# ///
"""voicecheck: is there a voice in a piece of music? With two controls, so the answer means something.

    HF_HUB_OFFLINE=1 uv run --quiet demo-video/film/audio/music/tools/voicecheck.py BED.wav [--line LINE.wav] [--json OUT.json]

Why this exists: a speech-to-text model asked to transcribe pure music does not answer
"nothing". It invents a sentence ("Thank you for watching" is the classic one). So a transcript
alone cannot prove that a bed has no voice. This tool asks two listeners and tests both:

  1. a voice detector (Silero VAD, the one inside faster-whisper): for every 32 ms it gives the
     chance that a person is speaking;
  2. the speech-to-text model (faster-whisper small.en), in 30 s pieces, with its own figure
     for "no speech here" per piece.

Controls, run every time:
  - NO VOICE FOR SURE: two minutes of chords and a pulse made here from sine waves. Whatever
    the listeners report on it is what they report when no voice exists.
  - A VOICE FOR SURE: the same bed with one spoken line of the film laid in, 6 dB under the
    music around it. If the listeners do not find that, they could not have found a singer.
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import numpy as np
from faster_whisper import WhisperModel
from faster_whisper.vad import get_vad_model

SR = 16000
FILM = Path(__file__).resolve().parents[3]


def load(path: str | Path) -> np.ndarray:
    raw = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", str(path), "-vn", "-ac", "1",
                          "-ar", str(SR), "-f", "f32le", "-"], check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).copy()


def synthetic(seconds: float = 120.0) -> np.ndarray:
    """Chords and a pulse from sine waves: music with no voice by construction."""
    t = np.arange(int(seconds * SR)) / SR
    x = np.zeros_like(t)
    chords = [(293.66, 369.99, 440.0), (220.0, 277.18, 329.63), (246.94, 293.66, 369.99), (196.0, 246.94, 293.66)]
    for i, ch in enumerate(chords * 15):
        m = (t >= i * 2.0) & (t < (i + 1) * 2.0)
        for hz in ch:
            x[m] += 0.08 * np.sin(2 * np.pi * hz * t[m]) * np.minimum(1, (t[m] - i * 2.0) / 0.02)
    for k in range(int(seconds * 2)):
        i0 = int(k * 0.5 * SR)
        n = np.arange(min(2400, len(x) - i0))
        x[i0:i0 + len(n)] += 0.3 * np.sin(2 * np.pi * 60 * n / SR) * np.exp(-n / 500)
    return x.astype(np.float32)


def vad(model, x: np.ndarray) -> dict:
    n = len(x) // 512 * 512
    probs = np.asarray(model(x[:n])).reshape(-1)
    over = probs > 0.5
    runs, start = [], None
    for i, o in enumerate(over.tolist() + [False]):
        if o and start is None:
            start = i
        if not o and start is not None:
            runs.append((round(start * 0.032, 2), round(i * 0.032, 2)))
            start = None
    longest = max((b - a for a, b in runs), default=0.0)
    return {"windows": int(len(probs)), "share_over_0.5": round(float(over.mean()), 4), "highest": round(float(probs.max()), 3),
            "mean": round(float(probs.mean()), 4), "longest_run_s": round(longest, 2), "runs_over_0.25_s": [r for r in runs if r[1] - r[0] >= 0.25][:12]}


def hear(model: WhisperModel, x: np.ndarray) -> list[dict]:
    out = []
    for a in range(0, len(x), 30 * SR):
        piece = x[a:a + 30 * SR]
        if len(piece) < SR:
            continue
        segments, _ = model.transcribe(piece, language="en", beam_size=5, condition_on_previous_text=False, vad_filter=False)
        segs = list(segments)
        out.append({"from_s": a // SR, "text": " ".join(s.text.strip() for s in segs),
                    "no_speech": [round(s.no_speech_prob, 2) for s in segs], "avg_logprob": [round(s.avg_logprob, 2) for s in segs]})
    return out


def main() -> int:
    args = sys.argv[1:]
    out_json = None
    if "--json" in args:
        i = args.index("--json"); out_json = args[i + 1]; del args[i:i + 2]
    line = FILM / "audio" / "lines" / "p03.wav"
    if "--line" in args:
        i = args.index("--line"); line = Path(args[i + 1]); del args[i:i + 2]
    if not args:
        print(__doc__)
        return 2
    bed = load(args[0])
    # a voice for sure: one line of the film, 6 dB under the music around it, at 40 s (and at 5 s)
    voice = load(line)
    planted = bed.copy()
    spots = []
    for at in (5.0, 40.0):
        i0 = int(at * SR)
        local = np.sqrt((bed[i0:i0 + len(voice)] ** 2).mean() + 1e-12)
        gain = local * 10 ** (-6 / 20) / np.sqrt((voice ** 2).mean() + 1e-12)
        planted[i0:i0 + len(voice)] += voice * gain
        spots.append((at, round(at + len(voice) / SR, 2)))
    cases = {"the bed": bed, "control, no voice for sure (sine chords and a pulse)": synthetic(len(bed) / SR),
             f"control, a voice for sure (the bed + '{line.stem}' 6 dB under the music at {spots})": planted}
    vmodel = get_vad_model()
    whisper = WhisperModel("small.en", device="cpu", compute_type="int8", cpu_threads=8)
    report = {}
    for name, x in cases.items():
        v = vad(vmodel, x)
        h = hear(whisper, x)
        report[name] = {"voice_detector": v, "speech_to_text": h}
        print(f"\n== {name}")
        print(f"   voice detector: {v['share_over_0.5'] * 100:.2f}% of the 32 ms windows over 0.5; highest {v['highest']}; mean {v['mean']}; "
              f"longest run {v['longest_run_s']} s; runs of 0.25 s or more: {v['runs_over_0.25_s']}")
        for p in h:
            print(f"   speech-to-text {p['from_s']:3d}-{p['from_s'] + 30:3d} s: \"{p['text']}\"   no-speech {p['no_speech']}  logprob {p['avg_logprob']}")
    if out_json:
        Path(out_json).write_text(json.dumps(report, indent=1) + "\n")
    return 0


if __name__ == "__main__":
    sys.exit(main())
