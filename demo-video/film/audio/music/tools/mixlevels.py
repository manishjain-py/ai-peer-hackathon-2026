#!/usr/bin/env -S uv run --quiet --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy>=1.26"]
# ///
"""mixlevels: after a render, how loud the music and each effect sit against the voice.

    uv run --quiet demo-video/film/audio/music/tools/mixlevels.py <sound_work folder of a render>

Reads the stems the mix wrote (voice.wav, music.wav, sfx.wav, mix.wav), ../../mix.json,
../../narration.json + ../../../shots.json (where the lines are) and ../../sfx/sfx.json.
Prints (1) the loudness of the finished mix while a line is spoken and in the passages with no
speech, so "the music rises toward the voice between lines" is a number; (2) for each effect,
its loudest 100 ms and its peak in the mix, against the voice.
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

SR = 48000
AUDIO = Path(__file__).resolve().parents[2]


def load(p):
    raw = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", str(p), "-vn", "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"],
                         check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2)


def lufs(p, a, b):
    out = subprocess.run(["ffmpeg", "-hide_banner", "-nostdin", "-ss", str(a), "-t", str(b - a), "-i", str(p), "-af", "ebur128", "-f", "null", "-"],
                         capture_output=True, text=True).stderr
    for line in out[out.rfind("Summary:"):].splitlines():
        if line.strip().startswith("I:"):
            v = line.split()[1]
            return None if v == "-inf" else float(v)
    return None


def rms(x, a, b):
    seg = x[int(a * SR):int(b * SR)]
    return float(10 * np.log10((seg ** 2).mean() + 1e-12))


def loudest(x, a, b, w=0.1):
    seg = x[int(a * SR):int(b * SR)]
    n = int(w * SR)
    if len(seg) < n:
        return -120.0
    return float(max(10 * np.log10((seg[i:i + n] ** 2).mean() + 1e-12) for i in range(0, len(seg) - n + 1, n // 4)))


def main() -> int:
    d = Path(sys.argv[1])
    mixj = json.loads((AUDIO / "mix.json").read_text())
    sfxj = json.loads((AUDIO / "sfx" / "sfx.json").read_text())["effects"]
    nar = {l["id"]: l for l in json.loads((AUDIO / "narration.json").read_text())["lines"]}
    starts = json.loads((AUDIO.parent / "shots.json").read_text())["narration"]
    lines = sorted(((i, starts[i], starts[i] + nar[i]["seconds"]) for i in nar if isinstance(starts.get(i), (int, float))), key=lambda r: r[1])
    voice, music, sfx = load(d / "voice.wav"), load(d / "music.wav"), load(d / "sfx.wav")
    mixf = d / "mix.wav"
    print(f"{d}")
    spoken = [lufs(mixf, a, b) for _, a, b in lines if b - a >= 1.5]
    vref = float(np.median([v for v in spoken if v is not None]))
    print(f"finished mix while a line is spoken (lines of 1.5 s or more): median {vref:.1f} LUFS, from {min(spoken):.1f} to {max(spoken):.1f}")
    print("passages with no speech (the gaps between lines of 1.2 s or more), finished mix:")
    edges = [(0.0, lines[0][1])] + [(lines[i][2], lines[i + 1][1]) for i in range(len(lines) - 1)] + [(lines[-1][2], 120.0)]
    for a, b in edges:
        if b - a < 1.2:
            continue
        a2 = a + 0.9 if a > 0 else a       # after the music has come back up (the duck's release)
        if b - a2 < 0.5:
            continue
        v = lufs(mixf, a2, b)
        print(f"  {a2:6.1f}-{b:6.1f} s   music stem {rms(music, a2, b):6.1f} dB RMS   mix {('%.1f' % v) if v is not None else '   -'} LUFS"
              f"   ({(v - vref):+.1f} LU against the spoken lines)" if v is not None else f"  {a2:6.1f}-{b:6.1f} s   too short for LUFS; music stem {rms(music, a2, b):6.1f} dB RMS")
    vr = float(np.median([rms(voice, a, b) for _, a, b in lines]))
    print(f"\neffects in the mix before the master gain (voice stem while speaking: median {vr:.1f} dB RMS, loudest 100 ms {loudest(voice, 0, 120):.1f} dB)")
    print("  effect      at s   loudest 100 ms dB  (under the voice's RMS by)   peak dBFS   music stem's loudest 100 ms there   a line is spoken there")
    for e in mixj["sfx"]:
        a = e["at"]
        b = a + sfxj[e["id"]]["seconds"]
        pk = float(20 * np.log10(np.abs(sfx[int(a * SR):int(b * SR)]).max() + 1e-12))
        l100 = loudest(sfx, a, b)
        said = [i for i, la, lb in lines if la < b and lb > a]
        print(f"  {e['id']:<10} {a:7.2f}   {l100:7.1f}            ({vr - l100:5.1f} dB)             {pk:7.1f}    {loudest(music, a, b):7.1f}                             {', '.join(said) or '-'}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
