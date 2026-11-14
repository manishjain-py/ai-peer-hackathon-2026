#!/usr/bin/env -S uv run --quiet --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy>=1.26", "scipy>=1.11"]
# ///
"""profile: what a piece of music does over time, in numbers (nobody here can hear it).

    uv run --quiet demo-video/film/audio/music/tools/profile.py TAKE.mp3 --bar 1.951 --from 0.054 [--bars 4]
    uv run --quiet demo-video/film/audio/music/tools/profile.py BED.wav --film          # by film part

Per row (one bar, or --bars N bars): the level (RMS, dBFS), the level in five bands (dB under
the row's own total, so the balance shows), where the weight of the spectrum sits (centroid),
how many onsets start per second, the stereo width (side against mid, dB) and the key the notes
point to. `--film` prints the same per part of the film and per music-only passage, plus the
loudness (LUFS) of each.
"""
from __future__ import annotations

import subprocess
import sys

import numpy as np

SR = 48000
BANDS = [("sub", 20, 80), ("bass", 80, 250), ("lowmid", 250, 1000), ("mid", 1000, 4000), ("high", 4000, 20000)]
NOTES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
MAJ = np.array([6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88])
MIN = np.array([6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17])

FILM_PARTS = [("hook", 0, 12), ("reveal", 12, 32), ("proof-meeting", 32, 54), ("proof-slack", 54, 72),
              ("proof-change", 72, 90), ("morning", 90, 108), ("planet", 108, 116), ("end card", 116, 120)]
FILM_EXTRA = [("rise 14.5-20", 14.5, 20), ("lift 30-32", 30, 32), ("music only 104-108", 104, 108),
              ("swell 112-114", 112, 114), ("accent 116-117", 116, 117), ("tail 119-120", 119, 120)]


def load(path: str) -> np.ndarray:
    cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", path, "-vn", "-ac", "2", "-ar", str(SR), "-f", "f32le", "-"]
    return np.frombuffer(subprocess.run(cmd, check=True, capture_output=True).stdout, dtype=np.float32).reshape(-1, 2)


def lufs(path: str, a: float, b: float) -> float | None:
    out = subprocess.run(["ffmpeg", "-hide_banner", "-nostdin", "-ss", str(a), "-t", str(b - a), "-i", path, "-vn",
                          "-af", "ebur128", "-f", "null", "-"], capture_output=True, text=True).stderr
    tail = out[out.rfind("Summary:"):]
    for line in tail.splitlines():
        if line.strip().startswith("I:"):
            v = line.split()[1]
            return None if v == "-inf" else float(v)
    return None


def db(x: float) -> float:
    return 10 * np.log10(max(x, 1e-12))


def onset_rate(m: np.ndarray) -> float:
    hop, n_fft = 480, 1024
    n = 1 + (len(m) - n_fft) // hop
    if n < 4:
        return 0.0
    idx = (np.arange(n)[:, None] * hop) + np.arange(n_fft)[None, :]
    logm = np.log1p(200 * np.abs(np.fft.rfft(m[idx] * np.hanning(n_fft), axis=1)))
    d = np.diff(logm, axis=0)
    d[d < 0] = 0
    e = d.sum(axis=1)
    thr = np.median(e) + 1.5 * e.std()
    peaks = (e[1:-1] > e[:-2]) & (e[1:-1] >= e[2:]) & (e[1:-1] > thr)
    return float(peaks.sum() / (len(m) / SR))


def row(x: np.ndarray) -> dict:
    m = x.mean(axis=1)
    s = (x[:, 0] - x[:, 1]) / 2
    spec = np.abs(np.fft.rfft(m * np.hanning(len(m)))) ** 2
    freqs = np.fft.rfftfreq(len(m), 1 / SR)
    total = spec[(freqs >= 20)].sum() + 1e-20
    bands = {name: round(db(spec[(freqs >= lo) & (freqs < hi)].sum() / total), 1) for name, lo, hi in BANDS}
    centroid = float((spec * freqs)[freqs >= 20].sum() / total)
    ok = (freqs >= 55) & (freqs < 2000)
    pc = np.round(12 * np.log2(np.maximum(freqs, 1e-6) / 440.0) + 9).astype(int) % 12   # 0 = C
    chroma = np.array([np.sqrt(spec[ok & (pc == k)]).sum() for k in range(12)])
    best = (-2, "")
    for k in range(12):
        for prof, name in ((MAJ, "maj"), (MIN, "min")):
            c = np.corrcoef(np.roll(prof, k), chroma)[0, 1]
            if c > best[0]:
                best = (c, f"{NOTES[k]} {name}")
    return {"rms_db": round(db((m ** 2).mean()), 1), **bands, "centroid_hz": int(centroid),
            "onsets_per_s": round(onset_rate(m), 1),
            "width_db": round(db((s ** 2).mean()) - db((m ** 2).mean()), 1),
            "peak_db": round(20 * np.log10(np.abs(x).max() + 1e-9), 1), "key": best[1], "key_r": round(float(best[0]), 2)}


def show(label: str, r: dict, extra: str = "") -> None:
    print(f"{label:<22} {r['rms_db']:6.1f}  {r['sub']:6.1f} {r['bass']:6.1f} {r['lowmid']:6.1f} {r['mid']:6.1f} {r['high']:6.1f}"
          f"  {r['centroid_hz']:6d}  {r['onsets_per_s']:5.1f}  {r['width_db']:6.1f}  {r['peak_db']:6.1f}  {r['key']:<7}{r['key_r']:5.2f} {extra}")


HEAD = f"{'':<22} {'rms dB':>6}  {'sub':>6} {'bass':>6} {'lowmid':>6} {'mid':>6} {'high':>6}  {'centr.':>6}  {'ons/s':>5}  {'width':>6}  {'peak':>6}  key"


def main() -> int:
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        return 2
    path = args[0]

    def opt(name, default=None):
        if name in args:
            return args[args.index(name) + 1]
        return default
    x = load(path)
    dur = len(x) / SR
    print(f"{path}: {dur:.3f} s")
    print(HEAD)
    if "--film" in args:
        whole = row(x[: int(120 * SR)])
        show("whole (0-120)", whole, f"LUFS {lufs(path, 0, 120)}")
        for name, a, b in FILM_PARTS + FILM_EXTRA:
            seg = x[int(a * SR): int(b * SR)]
            if len(seg) < 2048:
                continue
            show(f"{name} {a:g}-{b:g}" if name in dict((n, 0) for n, _, _ in FILM_PARTS) else name, row(seg), f"LUFS {lufs(path, a, b)}")
        return 0
    bar = float(opt("--bar", 2.0))
    t0 = float(opt("--from", 0.0))
    step = int(opt("--bars", 1))
    k = 0
    while t0 + (k + step) * bar <= dur + 1e-6:
        a, b = t0 + k * bar, t0 + (k + step) * bar
        seg = x[int(a * SR): int(b * SR)]
        show(f"bar {k + 1:3d} at {a:7.2f} s", row(seg))
        k += step
    return 0


if __name__ == "__main__":
    sys.exit(main())
