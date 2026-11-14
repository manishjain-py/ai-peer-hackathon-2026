#!/usr/bin/env -S uv run --quiet --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy>=1.26", "scipy>=1.11"]
# ///
"""make_bed: cut one take of music to the film, on bar lines, and write the bed.

    uv run --quiet demo-video/film/audio/music/tools/make_bed.py demo-video/film/audio/music/bed.edl.json

The edit list (JSON) says which bars of the take play at which film bars. One bar is 2.0 s
(120 BPM, 4/4), and film bar 1 starts at film time 0. Fields:

  source       {file, bpm, first_bar_s}: the take, its measured tempo and the time of its first
               bar line (both from beatfit.py). The take is resampled by 120/bpm, so its beats
               become exactly 0.5 s apart; for a take already within 0.5% of 120 BPM the change
               of pitch is under 9 cents and no time-stretcher is needed.
  segments     [{film_bar, src_bar, bars, note}]: film bars [film_bar, film_bar + bars) play the
               take's bars [src_bar, src_bar + bars). Where two segments that are not neighbours
               in the take meet, the join is a short equal-power crossfade (crossfade_ms, 40 if
               not given) that ends 5 ms before the bar line (guard_ms on the incoming segment
               changes the 5), so the first beat of the new bar is whole.
  layers       [{film_s, src_bar, src_beats, gain_db, fade_in_ms, fade_out_ms, note}]: extra
               pieces of the take laid on top.
  gain         [[film_s, dB], ...]: the level ride, straight lines between the points.
  eq           {highpass_hz, low_shelf: [hz, dB], high_shelf: [hz, dB]}: one gentle tone setting,
               run forward and backward so it shifts no phase.
  limit        {reduce_peaks_db, attack_ms, release_ms}: a look-ahead limiter that takes that many
               dB off the highest peaks (the tone setting and the level ride raise a mastered
               take's peaks; this brings its peak-to-average back to about what the take had).
  end          {silent_by_s, fade_s}: fade so that the bed is digital silence from silent_by_s.
  peak_dbfs    the bed is scaled as a whole so its sample peak sits here.
  out, seconds where to write, and how long the file is.

It prints what it did and writes <out>.report.json beside the bed.
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

from fractions import Fraction

import numpy as np
from scipy import ndimage, signal

SR = 48000
BAR = 2.0
XFADE = 0.040
GUARD = 0.005


def repo_root() -> Path:
    return Path(__file__).resolve().parents[5]


def decode(path: Path) -> tuple[np.ndarray, int]:
    probe = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "a:0", "-show_entries", "stream=sample_rate",
                            "-of", "csv=p=0", str(path)], check=True, capture_output=True, text=True).stdout.strip()
    sr = int(probe.split(",")[0])
    raw = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", str(path), "-vn", "-ac", "2",
                          "-f", "f32le", "-"], check=True, capture_output=True).stdout
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).astype(np.float64), sr


def to_grid(x: np.ndarray, sr: int, bpm: float) -> tuple[np.ndarray, float]:
    """Resample so that the take plays at exactly 120 BPM at 48 kHz. Returns (audio, time factor)."""
    factor = bpm / 120.0                      # new duration = old duration * factor
    # new length / old length as a small fraction (the rounding is under 1 part in 10 million)
    frac = Fraction(SR * factor / sr).limit_denominator(8000)
    up, down = frac.numerator, frac.denominator
    y = signal.resample_poly(x, up, down, axis=0, window=("kaiser", 12.0))
    return y, (up / down) * sr / SR


def shelf(kind: str, hz: float, gain_db: float) -> np.ndarray:
    """RBJ shelf biquad, as one second-order section."""
    a = 10 ** (gain_db / 40)
    w0 = 2 * np.pi * hz / SR
    alpha = np.sin(w0) / 2 * np.sqrt(2)       # slope 1
    cosw = np.cos(w0)
    if kind == "low":
        b0 = a * ((a + 1) - (a - 1) * cosw + 2 * np.sqrt(a) * alpha)
        b1 = 2 * a * ((a - 1) - (a + 1) * cosw)
        b2 = a * ((a + 1) - (a - 1) * cosw - 2 * np.sqrt(a) * alpha)
        a0 = (a + 1) + (a - 1) * cosw + 2 * np.sqrt(a) * alpha
        a1 = -2 * ((a - 1) + (a + 1) * cosw)
        a2 = (a + 1) + (a - 1) * cosw - 2 * np.sqrt(a) * alpha
    else:
        b0 = a * ((a + 1) + (a - 1) * cosw + 2 * np.sqrt(a) * alpha)
        b1 = -2 * a * ((a - 1) + (a + 1) * cosw)
        b2 = a * ((a + 1) + (a - 1) * cosw - 2 * np.sqrt(a) * alpha)
        a0 = (a + 1) - (a - 1) * cosw + 2 * np.sqrt(a) * alpha
        a1 = 2 * ((a - 1) - (a + 1) * cosw)
        a2 = (a + 1) - (a - 1) * cosw - 2 * np.sqrt(a) * alpha
    return np.array([[b0 / a0, b1 / a0, b2 / a0, 1.0, a1 / a0, a2 / a0]])


def limiter(x: np.ndarray, thr: float, attack_ms: float, release_ms: float) -> tuple[np.ndarray, dict]:
    """A look-ahead peak limiter: no sample leaves above thr. Returns the audio and what it did."""
    peak = np.abs(x).max(axis=1)
    need = np.minimum(1.0, thr / np.maximum(peak, 1e-12))
    la = max(2, int(attack_ms / 1000 * SR))
    held = ndimage.minimum_filter1d(need, size=2 * la + 1, mode="nearest")   # the gain is down before the peak comes
    c = float(np.exp(-1.0 / (release_ms / 1000 * SR)))
    g = np.empty_like(held)
    prev = 1.0
    for n, h in enumerate(held.tolist()):                                    # and comes back slowly after it
        rec = 1.0 - (1.0 - prev) * c
        prev = h if h < rec else rec
        g[n] = prev
    g = ndimage.uniform_filter1d(g, size=la, mode="nearest")
    red = -20 * np.log10(np.maximum(g, 1e-9))
    info = {"threshold_dbfs_before_scaling": round(float(20 * np.log10(thr)), 2), "largest_reduction_db": round(float(red.max()), 2),
            "share_of_time_reduced_by_1db_or_more": round(float((red >= 1.0).mean()), 4),
            "share_of_time_reduced_by_3db_or_more": round(float((red >= 3.0).mean()), 4)}
    return x * g[:, None], info


def write_wav(path: Path, x: np.ndarray) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2",
                    "-i", "-", "-c:a", "pcm_s24le", str(path)], input=x.astype(np.float32).tobytes(), check=True)


def main() -> int:
    if len(sys.argv) < 2:
        print(__doc__)
        return 2
    edl_path = Path(sys.argv[1]).resolve()
    edl = json.loads(edl_path.read_text())
    root = repo_root()
    src_cfg = edl["source"]
    raw, sr = decode(root / src_cfg["file"])
    src, factor = to_grid(raw, sr, src_cfg["bpm"])
    t0 = src_cfg["first_bar_s"] * factor
    print(f"source {src_cfg['file']}: {len(raw) / sr:.3f} s at {sr} Hz, {src_cfg['bpm']} BPM -> x{factor:.7f} "
          f"({1200 * np.log2(1 / factor):+.2f} cents), first bar line at {t0:.4f} s, {int((len(src) / SR - t0) // BAR)} whole bars")

    total = int(round(edl.get("seconds", 121.0) * SR))
    out = np.zeros((total, 2))

    def src_at(bar: float) -> int:
        return int(round((t0 + (bar - 1) * BAR) * SR))

    def film_at(bar: float) -> int:
        return int(round((bar - 1) * BAR * SR))

    def take(a: int, b: int) -> np.ndarray:
        """The take's samples [a, b), with silence outside it."""
        seg = np.zeros((b - a, 2))
        lo, hi = max(a, 0), min(b, len(src))
        if hi > lo:
            seg[lo - a:hi - a] = src[lo:hi]
        return seg

    segs = sorted(edl["segments"], key=lambda s: s["film_bar"])
    nx = int(edl.get("crossfade_ms", XFADE * 1000) / 1000 * SR)

    def guard(seg) -> int:
        """Samples before a segment's first bar line at which it is already playing in full."""
        return int(seg.get("guard_ms", GUARD * 1000) / 1000 * SR)
    joins = []
    for i, s in enumerate(segs):
        prev = segs[i - 1] if i else None
        nxt = segs[i + 1] if i + 1 < len(segs) else None
        if prev and prev["film_bar"] + prev["bars"] != s["film_bar"]:
            raise SystemExit(f"segments leave a gap or overlap at film bar {s['film_bar']}")
        joined_before = bool(prev) and prev["src_bar"] + prev["bars"] == s["src_bar"]
        joined_after = bool(nxt) and s["src_bar"] + s["bars"] == nxt["src_bar"]
        fa, fb = film_at(s["film_bar"]), film_at(s["film_bar"] + s["bars"])
        sa = src_at(s["src_bar"])
        n = fb - fa
        g_in = guard(s) if prev else 0            # this segment starts g_in before its bar line
        g_out = guard(nxt) if nxt else 0          # and hands over g_out before the next one
        lead = g_in + (nx if (prev and not joined_before) else 0)
        a = fa - lead
        piece = take(sa - lead, sa + n - g_out)
        env = np.ones(len(piece))
        if prev and not joined_before:
            env[:nx] = np.sin(np.linspace(0, np.pi / 2, nx))            # fade in over the crossfade
        if nxt and not joined_after:
            env[len(piece) - nx:] = np.cos(np.linspace(0, np.pi / 2, nx))   # fade out over the same span
        if not prev:
            fi = int(0.004 * SR)
            env[:fi] *= np.linspace(0, 1, fi)
        lo = max(a, 0)
        hi = min(a + len(piece), total)
        out[lo:hi] += (piece * env[:, None])[lo - a:hi - a]
        if prev and not joined_before:
            joins.append({"film_s": (s["film_bar"] - 1) * BAR, "from_src_bar": prev["src_bar"] + prev["bars"] - 1,
                          "to_src_bar": s["src_bar"], "crossfade_ms_before_bar_line": [round((g_in + nx) / SR * 1000), round(g_in / SR * 1000)]})
        print(f"  film {((s['film_bar'] - 1) * BAR):6.1f}-{((s['film_bar'] + s['bars'] - 1) * BAR):6.1f} s  <- take bars {s['src_bar']}-{s['src_bar'] + s['bars'] - 1}"
              f"{'' if joined_before or not prev else '   (join)'}   {s.get('note', '')}")

    for l in edl.get("layers", []):
        a = int(round(l["film_s"] * SR))
        sa = src_at(l["src_bar"]) + int(round(l.get("src_beat_offset", 0) * 0.5 * SR))
        n = int(round(l["src_beats"] * 0.5 * SR))
        piece = take(sa, sa + n) * 10 ** (l.get("gain_db", 0) / 20)
        fi, fo = int(l.get("fade_in_ms", 4) / 1000 * SR), int(l.get("fade_out_ms", 80) / 1000 * SR)
        env = np.ones(n)
        env[:fi] = np.linspace(0, 1, fi)
        env[n - fo:] *= np.cos(np.linspace(0, np.pi / 2, fo)) ** 2
        hi = min(a + n, total)
        out[a:hi] += (piece * env[:, None])[:hi - a]
        print(f"  layer at {l['film_s']:6.1f} s  <- take bar {l['src_bar']} for {l['src_beats']} beats at {l.get('gain_db', 0):+.1f} dB   {l.get('note', '')}")

    eq = edl.get("eq") or {}
    sos = []
    # The tone setting runs forward and backward (zero phase): each pass does half the change, so
    # the shape of the waves, and with it the take's own peak level, is disturbed as little as can be.
    if eq.get("highpass_hz"):
        sos.append(signal.butter(1, eq["highpass_hz"], "highpass", fs=SR, output="sos"))
    if eq.get("low_shelf"):
        sos.append(shelf("low", eq["low_shelf"][0], eq["low_shelf"][1] / 2))
    if eq.get("high_shelf"):
        sos.append(shelf("high", eq["high_shelf"][0], eq["high_shelf"][1] / 2))
    if sos:
        out = signal.sosfiltfilt(np.vstack(sos), out, axis=0)

    pts = sorted(edl.get("gain", []))
    if pts:
        t = np.arange(total) / SR
        ride = np.interp(t, [p[0] for p in pts], [p[1] for p in pts])
        out *= (10 ** (ride / 20))[:, None]

    lim = edl.get("limit") or {}
    limited = None
    if lim.get("reduce_peaks_db"):
        before_peak = float(np.abs(out).max())
        thr = before_peak * 10 ** (-lim["reduce_peaks_db"] / 20)
        out, limited = limiter(out, thr, lim.get("attack_ms", 1.5), lim.get("release_ms", 80))

    end = edl.get("end") or {}
    silent = end.get("silent_by_s", 120.0)
    fade = end.get("fade_s", 1.0)
    i1, i0 = int(silent * SR), int((silent - fade) * SR)
    out[i0:i1] *= (np.cos(np.linspace(0, np.pi / 2, i1 - i0)) ** 2)[:, None]
    out[i1:] = 0

    peak = np.abs(out).max()
    target = 10 ** (edl.get("peak_dbfs", -1.5) / 20)
    scale = target / peak
    out *= scale
    out_path = root / edl["out"]
    write_wav(out_path, out)
    report = {"edl": str(edl_path.relative_to(root)), "out": edl["out"], "seconds": total / SR,
              "source_time_factor": factor, "pitch_change_cents": round(float(1200 * np.log2(1 / factor)), 3),
              "first_bar_line_in_take_s": round(t0, 4), "joins": joins,
              "limiter": limited, "scaled_by_db": round(float(20 * np.log10(scale)), 2), "peak_dbfs": edl.get("peak_dbfs", -1.5)}
    Path(str(out_path) + ".report.json").write_text(json.dumps(report, indent=1) + "\n")
    print(f"joins at film s: {[j['film_s'] for j in joins]}")
    if limited:
        print(f"limiter: {limited}")
    print(f"scaled by {report['scaled_by_db']:+.2f} dB to a sample peak of {edl.get('peak_dbfs', -1.5)} dBFS -> {edl['out']} ({total / SR:.1f} s)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
