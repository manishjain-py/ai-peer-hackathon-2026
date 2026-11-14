#!/usr/bin/env -S uv run --quiet --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy>=1.26", "scipy>=1.11"]
# ///
"""beatfit: measure the tempo, the beat grid and the bar line of a piece of music.

    uv run --quiet demo-video/film/audio/music/tools/beatfit.py fit TAKE.mp3 [--json OUT.json]
    uv run --quiet demo-video/film/audio/music/tools/beatfit.py cuts BED.wav [--at 0,3.5,6.5,...]
    uv run --quiet demo-video/film/audio/music/tools/beatfit.py selftest

No session can hear, so the beat is measured. How:
  1. an onset curve: how much new sound starts in every 2 ms (rise of the log spectrum);
  2. the beat length that makes the onsets pile up sharpest when the curve is folded on
     itself (searched from 86 to 150 BPM, then refined to about 0.001 BPM);
  3. the place of the beat inside that length (the phase), and how it wanders over the
     piece (a fit per 8 s window): a steady piece wanders a few ms;
  4. the bar line: which of the four beats carries the chord changes and the bass notes.

`fit` is for a take from a music model (any tempo near 120). `cuts` is for a finished bed
that must sit on the film's half-second grid: for each cut time it prints how far the nearest
beat of the music is from that time. `selftest` runs both on click tracks whose answers are
known, which is the proof that the ruler itself is right.
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import numpy as np

SR = 48000
HOP = 96            # 2 ms
NFFT = 1024         # 21 ms window
ENV_FS = SR / HOP   # 500 frames a second


def load(path: str | Path, sr: int = SR, mono: bool = True) -> np.ndarray:
    cmd = ["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", str(path), "-vn",
           "-ac", "1" if mono else "2", "-ar", str(sr), "-f", "f32le", "-"]
    raw = subprocess.run(cmd, check=True, capture_output=True).stdout
    x = np.frombuffer(raw, dtype=np.float32)
    return x if mono else x.reshape(-1, 2)


def onset_curve(x: np.ndarray, band: tuple[float, float] | None = None) -> np.ndarray:
    """Rise of the log spectrum per 2 ms frame. Frame k is centred at (NFFT/2 + k*HOP)/SR;
    the returned curve is shifted so that index i means time i/ENV_FS (see CENTRE)."""
    win = np.hanning(NFFT).astype(np.float32)
    n = 1 + (len(x) - NFFT) // HOP
    freqs = np.fft.rfftfreq(NFFT, 1 / SR)
    keep = np.ones_like(freqs, dtype=bool) if band is None else (freqs >= band[0]) & (freqs < band[1])
    out = np.zeros(n, dtype=np.float64)
    prev = None
    block = 4000
    for a in range(0, n, block):
        b = min(n, a + block)
        idx = (np.arange(a, b)[:, None] * HOP) + np.arange(NFFT)[None, :]
        mag = np.abs(np.fft.rfft(x[idx] * win, axis=1))[:, keep]
        logm = np.log1p(200.0 * mag)
        full = logm if prev is None else np.vstack([prev, logm])
        d = np.diff(full, axis=0)
        d[d < 0] = 0
        rise = d.sum(axis=1)
        if prev is None:
            out[a + 1:b] = rise
        else:
            out[a:b] = rise
        prev = logm[-1:]
    return out


# A frame's window is centred NFFT/2 samples after its start, and a click is seen as a rise
# when the window first reaches it. `selftest` measures this lead on a click track and the
# constant below removes it, so reported times are the times of the sound itself.
LEAD_S = 0.0


def fold(env: np.ndarray, period: float, t0: float = 0.0, t1: float | None = None, bins: int = 250):
    """Fold the onset curve on a beat length: the mean of the curve at each place in the beat."""
    a = max(0, int(t0 * ENV_FS))
    b = len(env) if t1 is None else min(len(env), int(t1 * ENV_FS))
    t = np.arange(a, b) / ENV_FS
    ph = (t % period) / period
    idx = np.minimum((ph * bins).astype(int), bins - 1)
    s = np.bincount(idx, weights=env[a:b], minlength=bins)
    c = np.bincount(idx, minlength=bins)
    prof = s / np.maximum(c, 1)
    return prof


def smooth_circ(p: np.ndarray, sigma_bins: float) -> np.ndarray:
    n = len(p)
    k = np.arange(n)
    k = np.minimum(k, n - k)
    g = np.exp(-0.5 * (k / sigma_bins) ** 2)
    g /= g.sum()
    return np.real(np.fft.ifft(np.fft.fft(p) * np.fft.fft(g)))


def peak_of(prof: np.ndarray, near: float | None = None, reach: float = 0.5) -> tuple[float, float]:
    """Place (0..1 of the beat) and height of the profile's peak, to a fraction of a bin.
    `near` limits the search to that place +- `reach` of a beat."""
    n = len(prof)
    if near is None:
        i = int(np.argmax(prof))
    else:
        k = np.arange(n)
        dist = np.abs(((k + 0.5) / n - near + 0.5) % 1.0 - 0.5)
        masked = np.where(dist <= reach, prof, -np.inf)
        i = int(np.argmax(masked))
    y0, y1, y2 = prof[(i - 1) % n], prof[i], prof[(i + 1) % n]
    den = y0 - 2 * y1 + y2
    off = 0.0 if den == 0 else 0.5 * (y0 - y2) / den
    off = float(np.clip(off, -0.5, 0.5))
    return ((i + 0.5 + off) / n) % 1.0, float(y1)


def sharpness(env: np.ndarray, period: float, t0=0.0, t1=None) -> float:
    prof = smooth_circ(fold(env, period, t0, t1), 1.5)
    return float(prof.max() - np.median(prof))


def find_period(env: np.ndarray, lo: float = 0.40, hi: float = 0.70) -> tuple[float, list]:
    """The beat length (s) whose fold is sharpest. Coarse, then two finer passes."""
    best = None
    table = []
    for step, span in ((2e-4, None), (2e-5, 6e-4), (2e-6, 5e-5)):
        if span is None:
            grid = np.arange(lo, hi, step)
        else:
            grid = np.arange(best - span, best + span, step)
        scores = np.array([sharpness(env, p) for p in grid])
        if span is None:
            order = np.argsort(scores)[::-1]
            seen = []
            for j in order:
                if all(abs(grid[j] - s) > 0.01 for s, _ in seen):
                    seen.append((float(grid[j]), float(scores[j])))
                if len(seen) == 5:
                    break
            table = seen
        best = float(grid[int(np.argmax(scores))])
    return best, table


def local_phases(env: np.ndarray, period: float, phase: float, win: float = 8.0, hop: float = 2.0):
    """How far the beat sits from the global grid in each window (ms), with a confidence."""
    out = []
    dur = len(env) / ENV_FS
    t = 0.0
    while t + win <= dur + 1e-6:
        prof = smooth_circ(fold(env, period, t, t + win), 1.5)
        ph, height = peak_of(prof, near=phase, reach=0.2)
        dev = ((ph - phase + 0.5) % 1.0 - 0.5) * period
        conf = (height - np.median(prof)) / (np.median(prof) + 1e-9)
        out.append({"t": round(t + win / 2, 2), "dev_ms": round(dev * 1000, 2), "conf": round(float(conf), 2)})
        t += hop
    return out


def refine(env: np.ndarray, period: float):
    """Refine the beat length by the slope of the local phases, and return the final fit."""
    phase = None
    loc = []
    for _ in range(4):
        prof = smooth_circ(fold(env, period), 1.5)
        phase, _ = peak_of(prof)
        loc = local_phases(env, period, phase)
        good = [w for w in loc if w["conf"] >= 0.5]
        if len(good) < 6:
            break
        tt = np.array([w["t"] for w in good])
        dd = np.array([w["dev_ms"] for w in good]) / 1000
        slope, _ = np.polyfit(tt, dd, 1)          # seconds of drift per second
        if abs(slope) < 2e-6:
            break
        period = period * (1 + slope)
    return period, phase, loc


def chroma_bar_phase(x: np.ndarray, period: float, beat0: float):
    """Which beat of four is the bar line: the one where the harmony and the bass change most."""
    n_fft, hop = 8192, 2048
    win = np.hanning(n_fft).astype(np.float32)
    n = 1 + (len(x) - n_fft) // hop
    freqs = np.fft.rfftfreq(n_fft, 1 / SR)
    spec = np.zeros((n, len(freqs)), dtype=np.float32)
    for a in range(0, n, 500):
        b = min(n, a + 500)
        idx = (np.arange(a, b)[:, None] * hop) + np.arange(n_fft)[None, :]
        spec[a:b] = np.abs(np.fft.rfft(x[idx] * win, axis=1))
    times = (np.arange(n) * hop + n_fft / 2) / SR
    ok = (freqs >= 55) & (freqs < 2000)
    pitch = np.round(12 * np.log2(np.maximum(freqs, 1e-6) / 440.0)).astype(int) % 12
    chroma = np.zeros((n, 12), dtype=np.float32)
    bass = np.zeros((n, 12), dtype=np.float32)
    lowmask = (freqs >= 40) & (freqs < 220)
    for pc in range(12):
        chroma[:, pc] = spec[:, ok & (pitch == pc)].sum(axis=1)
        bass[:, pc] = spec[:, lowmask & (pitch == pc)].sum(axis=1)
    low = (spec[:, (freqs >= 35) & (freqs < 120)] ** 2).sum(axis=1)
    nbeats = int((len(x) / SR - beat0) / period) - 1
    cb = np.zeros((nbeats, 12)); bb = np.zeros((nbeats, 12)); lb = np.zeros(nbeats)
    for k in range(nbeats):
        a, b = beat0 + k * period, beat0 + (k + 1) * period
        m = (times >= a) & (times < b)
        if m.any():
            cb[k] = chroma[m].mean(axis=0); bb[k] = bass[m].mean(axis=0)
        m2 = (times >= a - 0.03) & (times < a + 0.12)
        lb[k] = low[m2].mean() if m2.any() else 0

    def nov(v):
        v = v / (np.linalg.norm(v, axis=1, keepdims=True) + 1e-9)
        return np.concatenate([[0], 1 - (v[1:] * v[:-1]).sum(axis=1)])
    nc, nb_ = nov(cb), nov(bb)
    rows = []
    for ph in range(4):
        sel = np.arange(ph, nbeats, 4)
        rows.append({"beat_mod_4": ph, "harmony_change": round(float(nc[sel].mean()), 4),
                     "bass_change": round(float(nb_[sel].mean()), 4),
                     "low_energy": round(float(10 * np.log10(lb[sel].mean() + 1e-12)), 1)})
    score = [r["harmony_change"] / (max(x_["harmony_change"] for x_ in rows) + 1e-9)
             + r["bass_change"] / (max(x_["bass_change"] for x_ in rows) + 1e-9) for r in rows]
    return int(np.argmax(score)), rows, [round(float(s), 3) for s in score]


def first_sound(x: np.ndarray, floor_db: float = -45.0) -> float:
    """Time at which the level first passes floor_db under the piece's loudest 50 ms."""
    n = int(0.005 * SR)
    frames = len(x) // n
    e = np.sqrt((x[:frames * n].reshape(frames, n) ** 2).mean(axis=1) + 1e-12)
    ref = np.sort(e)[-max(1, frames // 100)]
    thr = ref * 10 ** (floor_db / 20)
    i = int(np.argmax(e > thr))
    return i * n / SR


def fit(path: str, lo=0.40, hi=0.70) -> dict:
    x = load(path)
    env = onset_curve(x)
    period, table = find_period(env, lo, hi)
    # A fold is as sharp at twice or half the true beat: bring it to the octave nearest 120 BPM.
    while period > 0.70:
        period /= 2
    while period < 0.36:
        period *= 2
    period, phase, loc = refine(env, period)
    beat0 = (phase * period - LEAD_S) % period
    good = [w for w in loc if w["conf"] >= 0.5]
    devs = np.array([w["dev_ms"] for w in good]) if good else np.array([0.0])
    bar_phase, rows, score = chroma_bar_phase(x, period, beat0)
    return {
        "file": str(path), "seconds": round(len(x) / SR, 3),
        "bpm": round(60 / period, 4), "beat_s": round(period, 6),
        "first_beat_s": round(float(beat0), 4),
        "first_sound_s": round(first_sound(x), 3),
        "other_tempo_candidates_bpm": [(round(60 / p, 2), round(s, 3)) for p, s in table],
        "wander_ms": {"windows": len(loc), "confident": len(good),
                      "max_abs": round(float(np.abs(devs).max()), 1), "rms": round(float(np.sqrt((devs ** 2).mean())), 1)},
        "bar_line_beat_mod_4": bar_phase, "bar_line_scores": score, "bar_line_table": rows,
        "first_bar_line_s": round(float(beat0 + bar_phase * period), 4),
        "local": loc,
    }


FILM_CUTS = [0, 3.5, 6.5, 8.5, 12, 21, 30, 32, 54, 72, 90, 94.5, 100.5, 104.5, 108, 116]


def cuts(path: str, at: list[float], period: float = 0.5) -> dict:
    """For a bed that should sit on the film's grid: the beat error at each cut time."""
    x = load(path)
    env = onset_curve(x)
    low = onset_curve(x, (30, 160))
    prof = smooth_circ(fold(env, period), 1.5)
    ph, _ = peak_of(prof)
    whole = (((ph * period - LEAD_S) + period / 2) % period - period / 2) * 1000
    rows = []
    for t in at:
        # the grid of the 8 s around the cut (16 beats): where the beats sit against the film's grid
        a, b = max(0.0, t - 4), min(len(env) / ENV_FS, t + 4)
        p = smooth_circ(fold(env, period, a, b), 1.5)
        lph, h = peak_of(p, near=0.0, reach=0.25)
        conf = (h - np.median(p)) / (np.median(p) + 1e-9)
        grid_err = (((lph * period - LEAD_S) + period / 2) % period - period / 2) * 1000
        # the onset on the cut itself: the strongest rise within 60 ms of it, if one stands out
        near_ms, strength, low_ms = None, 0.0, None
        i0 = int(max(0.0, t + LEAD_S - 0.06) * ENV_FS)
        i1 = int(min(len(env) / ENV_FS, t + LEAD_S + 0.06) * ENV_FS)
        floor = np.median(env[max(0, i0 - 2000):i1 + 2000]) + 1e-9
        seg = env[i0:i1]
        if len(seg) > 3 and seg.max() >= 2.0 * floor:
            j = int(np.argmax(seg))
            near_ms = ((i0 + j) / ENV_FS - LEAD_S - t) * 1000
            strength = seg.max() / floor
        segl = low[i0:i1]
        floorl = np.median(low[max(0, i0 - 2000):i1 + 2000]) + 1e-9
        if len(segl) > 3 and segl.max() >= 4.0 * floorl:
            low_ms = ((i0 + int(np.argmax(segl))) / ENV_FS - LEAD_S - t) * 1000
        if t == 0:
            near_ms, strength = first_sound(x) * 1000, float("nan")
        rows.append({"cut_s": t, "grid_error_ms": round(float(grid_err), 1), "grid_conf": round(float(conf), 2),
                     "nearest_onset_ms": None if near_ms is None else round(float(near_ms), 1),
                     "onset_strength": round(float(strength), 1),
                     "nearest_low_onset_ms": None if low_ms is None else round(float(low_ms), 1)})
    # the best-fitting beat length of the whole bed, as a check that it is 120 BPM
    best, _ = find_period(env, 0.49, 0.51)
    best, _, loc = refine(env, best)
    return {"file": str(path), "seconds": round(len(x) / SR, 3), "whole_bed_grid_error_ms": round(float(whole), 1),
            "measured_bpm": round(60 / best, 4), "cuts": rows}


def clicks(bpm: float, start: float, seconds: float = 60.0, accent_every: int = 4) -> np.ndarray:
    x = np.zeros(int(seconds * SR), dtype=np.float32)
    rng = np.random.default_rng(1)
    k = 0
    while True:
        t = start + k * 60 / bpm
        i = int(round(t * SR))
        if i + 2400 >= len(x):
            break
        n = np.arange(2400)
        # one note per bar (it changes on the bar line, as chords do), the first beat louder
        root = (110.0, 146.83, 164.81, 130.81)[(k // accent_every) % 4]
        tone = np.sin(2 * np.pi * root * n / SR) * np.exp(-n / 900)
        amp = 0.7 if k % accent_every == 0 else 0.45
        x[i:i + 2400] += (amp * tone + 0.1 * rng.standard_normal(2400) * np.exp(-n / 120)).astype(np.float32)
        k += 1
    return x


def selftest() -> int:
    global LEAD_S
    import tempfile, wave
    ok = True
    LEAD_S = 0.0
    with tempfile.TemporaryDirectory() as d:
        def write(name, x):
            p = Path(d) / name
            with wave.open(str(p), "wb") as w:
                w.setnchannels(1); w.setsampwidth(2); w.setframerate(SR)
                w.writeframes((np.clip(x, -1, 1) * 32767).astype("<i2").tobytes())
            return str(p)
        # 1. the lead of the ruler itself: clicks exactly on the half second
        a = write("a.wav", clicks(120, 1.0))
        r = fit(a)
        lead = ((r["first_beat_s"] + 0.25) % 0.5) - 0.25
        print(f"click track, 120 BPM, clicks on the half second: measured {r['bpm']} BPM, raw place {lead * 1000:+.2f} ms")
        LEAD_S = lead
        # 2. another tempo and another start: both must come back
        for bpm, start in ((119.37, 0.137), (121.9, 0.301), (120.0, 0.25)):
            p = write("b.wav", clicks(bpm, start))
            r = fit(p)
            want = start % (60 / bpm)
            err = ((r["first_beat_s"] - want + 0.25) % (60 / bpm)) - 0.25
            good = abs(r["bpm"] - bpm) < 0.01 and abs(err) < 0.002 and r["bar_line_beat_mod_4"] == 0
            ok &= good
            print(f"{'ok  ' if good else 'FAIL'} clicks at {bpm} BPM from {start} s: measured {r['bpm']} BPM, "
                  f"first beat off by {err * 1000:+.2f} ms, bar line on beat {r['bar_line_beat_mod_4']} (want 0), wander {r['wander_ms']['max_abs']} ms")
        # 3. a bed that is late by 30 ms must be reported as +30 ms at every cut
        p = write("c.wav", clicks(120, 0.030, seconds=30))
        c = cuts(p, [0, 3.5, 12, 21])
        errs = [row["grid_error_ms"] for row in c["cuts"]]
        good = all(abs(e - 30) < 2 for e in errs)
        ok &= good
        print(f"{'ok  ' if good else 'FAIL'} a click track 30 ms late: cut errors {errs} ms (want +30), nearest onsets "
              f"{[row['nearest_onset_ms'] for row in c['cuts']]}")
    print(f"lead of the ruler to remove: {LEAD_S * 1000:.2f} ms  (set LEAD_S to {LEAD_S:.5f})")
    print("selftest passed" if ok else "selftest FAILED")
    return 0 if ok else 1


def main() -> int:
    global LEAD_S
    args = sys.argv[1:]
    if not args:
        print(__doc__)
        return 2
    out_json = None
    if "--json" in args:
        i = args.index("--json"); out_json = args[i + 1]; del args[i:i + 2]
    at = FILM_CUTS
    if "--at" in args:
        i = args.index("--at"); at = [float(v) for v in args[i + 1].split(",")]; del args[i:i + 2]
    mode = args[0]
    if mode == "selftest":
        return selftest()
    LEAD_S = CALIBRATED_LEAD_S
    if mode == "fit":
        for p in args[1:]:
            r = fit(p)
            loc = r.pop("local")
            print(json.dumps(r, indent=1))
            print("  wander by window (t s: ms @conf): " + "  ".join(f"{w['t']:.0f}:{w['dev_ms']:+.0f}@{w['conf']:.1f}" for w in loc))
            r["local"] = loc
            if out_json:
                Path(out_json).write_text(json.dumps(r, indent=1) + "\n")
    elif mode == "cuts":
        r = cuts(args[1], at)
        print(f"{r['file']}: {r['seconds']} s, measured {r['measured_bpm']} BPM, whole-bed grid error {r['whole_bed_grid_error_ms']:+.1f} ms")
        print("  grid error: where the beats of the 8 s around the cut sit against the film's half-second grid (+ is late).")
        print("  onset on the cut: the strongest new sound within 60 ms of the cut, and how far it stands above the passage; blank = a held note or a rest there.")
        print("  cut s   grid error ms (conf)   onset on the cut ms (x floor)")
        for c in r["cuts"]:
            print(f"  {c['cut_s']:6.1f}   {c['grid_error_ms']:+6.1f} ({c['grid_conf']:.1f})          "
                  f"{'' if c['nearest_onset_ms'] is None else format(c['nearest_onset_ms'], '+.1f'):>7} ({c['onset_strength']:.1f})")
        worst = max(r["cuts"], key=lambda c: abs(c["grid_error_ms"]))
        print(f"  largest grid error: {worst['grid_error_ms']:+.1f} ms at {worst['cut_s']} s")
        if out_json:
            Path(out_json).write_text(json.dumps(r, indent=1) + "\n")
    else:
        print(__doc__)
        return 2
    return 0


# Measured by `selftest` (clicks placed exactly on the half second): see its last line.
CALIBRATED_LEAD_S = -0.0187

if __name__ == "__main__":
    sys.exit(main())
