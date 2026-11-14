#!/usr/bin/env -S uv run --quiet --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy>=1.26", "scipy>=1.11"]
# ///
"""make_sfx: the film's sound effects, made by code (no service, no sample, no licence).

    uv run --quiet demo-video/film/audio/sfx/make_sfx.py            # writes the nine WAVs here
    uv run --quiet demo-video/film/audio/sfx/make_sfx.py --table    # and prints their measurements

Every effect is built from sine tones and filtered noise with a fixed random seed, so a run
gives the same files again. Each file is 48 kHz stereo, 24 bit, trimmed, faded at both ends,
and scaled so its sample peak is -6 dBFS: the level in the film is set in ../mix.json.
`sync_s` is the moment inside the file that belongs on the film event (the peak of a whoosh,
the first sample of a click), so `at` in mix.json is the event time less sync_s.

Tonal effects (rise, lights, end) use notes of D major, the key of the music bed.
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

import numpy as np
from scipy import signal

SR = 48000
HERE = Path(__file__).resolve().parent
PEAK_DBFS = -6.0

# D major pentatonic, the bed's key: D E F# A B
D5, A5 = 587.33, 880.00
SPARKLE = [1174.66, 1318.51, 1479.98, 1760.00, 1975.53, 2349.32, 2637.02, 2959.96, 3520.00]


def t_axis(seconds: float) -> np.ndarray:
    return np.arange(int(round(seconds * SR))) / SR


def band_noise(rng, n: int, lo: float, hi: float, order: int = 4) -> np.ndarray:
    sos = signal.butter(order, [lo, hi], "bandpass", fs=SR, output="sos")
    return signal.sosfilt(sos, rng.standard_normal(n))


def lowpass(x: np.ndarray, hz: float, order: int = 2) -> np.ndarray:
    return signal.sosfilt(signal.butter(order, hz, "lowpass", fs=SR, output="sos"), x, axis=0)


def highpass(x: np.ndarray, hz: float, order: int = 2) -> np.ndarray:
    return signal.sosfilt(signal.butter(order, hz, "highpass", fs=SR, output="sos"), x, axis=0)


def fades(x: np.ndarray, fade_in: float, fade_out: float) -> np.ndarray:
    x = x.copy()
    a, b = int(fade_in * SR), int(fade_out * SR)
    if a > 0:
        x[:a] *= (np.sin(np.linspace(0, np.pi / 2, a)) ** 2)[:, None]
    if b > 0:
        x[-b:] *= (np.cos(np.linspace(0, np.pi / 2, b)) ** 2)[:, None]
    return x


def stereo(left: np.ndarray, right: np.ndarray | None = None) -> np.ndarray:
    return np.stack([left, left if right is None else right], axis=1)


def pan(mono: np.ndarray, where: float) -> np.ndarray:
    """where: -1 left .. +1 right, equal power."""
    a = (where + 1) * np.pi / 4
    return np.stack([mono * np.cos(a), mono * np.sin(a)], axis=1)


def swept_noise(rng, seconds: float, centre, octaves: float) -> np.ndarray:
    """Stereo noise through a band whose centre (Hz) moves over time: centre is a function of t."""
    n = int(round(seconds * SR))
    out = []
    for _ in range(2):
        f, tt, z = signal.stft(rng.standard_normal(n), fs=SR, nperseg=1024, noverlap=768)
        fc = np.array([centre(x) for x in tt])
        with np.errstate(divide="ignore"):
            dist = np.log2(np.maximum(f[:, None], 1.0) / fc[None, :])
        mask = np.exp(-0.5 * (dist / (octaves / 2)) ** 2)
        _, y = signal.istft(z * mask, fs=SR, nperseg=1024, noverlap=768)
        out.append(y[:n])
    return np.stack(out, axis=1)


def mode(t: np.ndarray, hz: float, tau: float, amp: float = 1.0, phase: float = 0.0) -> np.ndarray:
    """One ringing mode: a sine that dies away."""
    return amp * np.exp(-t / tau) * np.sin(2 * np.pi * hz * t + phase)


# ------------------------------------------------------------------------------------ the effects

def phone(rng) -> tuple[np.ndarray, dict]:
    """A phone on a wooden bedside table: two short buzzes of its motor, soft."""
    def buzz(seconds: float) -> np.ndarray:
        t = t_axis(seconds)
        # the motor spins up, holds near 172 Hz with a little wobble, and spins down
        f = 172 * (1 - 0.26 * np.exp(-t / 0.018)) * (1 - 0.22 * np.exp(-(seconds - t) / 0.022))
        f *= 1 + 0.006 * np.sin(2 * np.pi * 7.3 * t)
        ph = 2 * np.pi * np.cumsum(f) / SR
        hum = sum(a * np.sin(k * ph + 0.4 * k) for k, a in enumerate([1.0, 0.55, 0.34, 0.2, 0.12, 0.07], start=1))
        # the case tapping the wood once per turn: short noise ticks at the motor's rate
        tick = np.maximum(0, np.sin(ph)) ** 6
        rattle_l = band_noise(rng, len(t), 320, 2400, order=2) * tick
        rattle_r = band_noise(rng, len(t), 320, 2400, order=2) * tick
        env = np.minimum(1, t / 0.028) * np.minimum(1, (seconds - t) / 0.075)
        env = np.clip(env, 0, 1) ** 1.3
        body = hum * 0.22
        return stereo((body + 1.6 * rattle_l) * env, (body + 1.6 * rattle_r) * env)
    gap = np.zeros((int(0.16 * SR), 2))
    x = np.vstack([buzz(0.36), gap, buzz(0.36), np.zeros((int(0.05 * SR), 2))])
    # the table: two soft resonances, and nothing sharp on top
    for hz, q, g in ((188, 3.0, 5.0), (430, 2.5, 3.0)):
        b, a = signal.iirpeak(hz, q, fs=SR)
        x = x + (10 ** (g / 20) - 1) * signal.lfilter(b, a, x, axis=0)
    x = lowpass(highpass(x, 110), 3200)
    return fades(x, 0.004, 0.04), {"sync_s": 0.0, "what": "two soft buzzes of a phone's motor on wood (0.36 s, 0.16 s apart)"}


def shimmer(rng, seconds: float, env, grains: int, air_band: tuple[float, float], air: float, glow: float,
            tau: tuple[float, float]) -> np.ndarray:
    t = t_axis(seconds)
    e = env(t)
    n = len(t)
    x = np.zeros((n, 2))
    # air: soft band of noise that breathes with the swell
    x += air * np.stack([band_noise(rng, n, *air_band, order=2), band_noise(rng, n, *air_band, order=2)], axis=1) * e[:, None]
    # sparkles: short bell-like notes of the key, more of them as it swells
    cdf = np.cumsum(e) / e.sum()
    for _ in range(grains):
        t0 = t[int(np.searchsorted(cdf, rng.uniform(0.01, 0.99)))] + rng.normal(0, 0.05)
        t0 = float(np.clip(t0, 0.0, seconds - 0.15))
        hz = rng.choice(SPARKLE) * (1 + rng.normal(0, 0.0012))
        i0 = int(t0 * SR)
        tg = t[: n - i0]
        note = np.minimum(1, tg / 0.008) * mode(tg, hz, rng.uniform(*tau), amp=rng.uniform(0.35, 1.0) * (0.25 + 0.75 * e[i0]))
        x[i0:] += pan(note, rng.uniform(-0.9, 0.9))
    # glow: a faint held D and A under it, slowly beating
    for hz, a in ((D5, 1.0), (A5, 0.7), (D5 * 2, 0.35)):
        x += glow * a * np.stack([np.sin(2 * np.pi * (hz - 0.4) * t), np.sin(2 * np.pi * (hz + 0.4) * t + 1.0)], axis=1) * (e ** 1.5)[:, None]
    return x


def rise(rng) -> tuple[np.ndarray, dict]:
    """An airy shimmer that swells for 2.5 s and is gone 2 s later."""
    def env(t):
        # the notes ring on after they start, so the curve that places them peaks a little early
        up = np.clip(t / 2.15, 0, 1) ** 2.2
        down = np.cos(np.clip((t - 2.15) / 1.75, 0, 1) * np.pi / 2) ** 2
        return np.where(t < 2.15, up, down)
    x = shimmer(rng, 4.4, env, grains=90, air_band=(3200, 9500), air=0.10, glow=0.05, tau=(0.2, 0.45))
    return fades(x, 0.02, 0.3), {"sync_s": 0.0, "peak_at_s": 2.5, "what": "airy shimmer in D major: swells to about 2.5 s, gone by 4.4 s"}


def lights(rng) -> tuple[np.ndarray, dict]:
    """Lights coming on across the planet: a wide, gentle spread of sparkles."""
    def env(t):
        up = np.clip(t / 1.0, 0, 1) ** 1.6
        down = np.cos(np.clip((t - 1.0) / 2.1, 0, 1) * np.pi / 2) ** 2
        return np.where(t < 1.0, up, down)
    x = shimmer(rng, 3.2, env, grains=120, air_band=(4500, 11000), air=0.05, glow=0.03, tau=(0.15, 0.4))
    return fades(x, 0.02, 0.2), {"sync_s": 0.0, "peak_at_s": 1.0, "what": "wide shimmer of short high notes in D major: swells to 1.0 s, gone by 3.2 s"}


def laptop(rng) -> tuple[np.ndarray, dict]:
    """A laptop lid let go of its latch: one soft plastic click with a small body, then a fainter one."""
    t = t_axis(0.17)

    def click(at: float, level: float, modes) -> np.ndarray:
        i0 = int(at * SR)
        tg = t[: len(t) - i0]
        y = np.zeros(len(t))
        burst = band_noise(rng, len(tg), 900, 5200, order=2) * np.exp(-tg / 0.0014)
        ring = sum(mode(tg, hz, tau, a, ph) for hz, tau, a, ph in modes)
        y[i0:] = level * (0.5 * burst / (np.abs(burst).max() + 1e-9) + ring)
        return y
    a = click(0.0, 1.0, [(1900, 0.009, 0.6, 0.3), (3400, 0.006, 0.35, 1.1), (240, 0.022, 0.55, 0.0), (480, 0.012, 0.2, 0.7)])
    b = click(0.085, 0.32, [(1400, 0.010, 0.6, 0.9), (2600, 0.007, 0.3, 0.2), (210, 0.02, 0.4, 0.0)])
    x = pan(a, -0.08) + pan(b, 0.12)
    x = lowpass(x, 6000)
    return fades(x, 0.0003, 0.03), {"sync_s": 0.0, "what": "one soft plastic click with a low body, a fainter second one 85 ms later"}


def push(rng) -> tuple[np.ndarray, dict]:
    """A whoosh that rises for two seconds and stops on the cut."""
    seconds = 2.0
    x = swept_noise(rng, seconds + 0.05, lambda s: 240 * (6000 / 240) ** (min(s, seconds) / seconds) ** 1.25, octaves=1.5)
    t = t_axis(seconds + 0.05)
    env = (np.clip(t / seconds, 0, 1) ** 2.4) * (t <= seconds)
    stop = int(0.022 * SR)                      # the last 22 ms before the cut close it without a click
    i = int(seconds * SR)
    env[i - stop:i] *= np.cos(np.linspace(0, np.pi / 2, stop)) ** 2
    x = x[: i] * env[: i, None]
    return fades(highpass(x, 120), 0.05, 0.0), {"sync_s": 2.0, "what": "noise whoosh rising from low to bright over 2.0 s; it stops at its end, which belongs on the cut"}


def change(rng, bright: float) -> tuple[np.ndarray, dict]:
    """A short soft swish with a tiny tick at its middle."""
    seconds, mid = 0.42, 0.15
    def centre(s):
        d = abs(s - mid) / 0.2
        return 1150 * bright * (3.4 ** max(0.0, 1 - d))
    x = swept_noise(rng, seconds, centre, octaves=1.3)
    t = t_axis(seconds)
    env = np.exp(-0.5 * ((t - mid) / np.where(t < mid, 0.055, 0.075)) ** 2)
    x = x[: len(t)] * env[:, None]
    x /= np.abs(x).max() + 1e-9
    i0 = int(mid * SR)
    tg = t[: len(t) - i0]
    tick = np.zeros(len(t))
    tick[i0:] = mode(tg, 4300 * bright, 0.007, 0.22) + 0.1 * band_noise(rng, len(tg), 2500, 8000, order=2) * np.exp(-tg / 0.002)
    x = x + pan(tick, 0.0)
    return fades(x, 0.02, 0.06), {"sync_s": mid, "what": f"soft swish (0.42 s) peaking at 0.15 s with a faint tick there; brightness x{bright}"}


def tap(rng) -> tuple[np.ndarray, dict]:
    """One fingertip on a phone's glass."""
    t = t_axis(0.11)
    y = mode(t, 205, 0.013, 0.42) + mode(t, 410, 0.008, 0.22, 0.5) + mode(t, 1650, 0.014, 0.30, 0.2) + mode(t, 2900, 0.008, 0.16, 1.0)
    y += 0.55 * band_noise(rng, len(t), 1200, 5200, order=2) * np.exp(-t / 0.0035) * np.minimum(1, t / 0.0004)
    y *= np.minimum(1, t / 0.0012)
    x = lowpass(pan(y, 0.05), 6000)
    return fades(x, 0.0, 0.03), {"sync_s": 0.0, "what": "one soft fingertip tap: a low thump, a faint touch of glass"}


def end(rng) -> tuple[np.ndarray, dict]:
    """One warm, soft chime on D."""
    seconds = 3.8
    t = t_axis(seconds)
    parts = [  # (Hz, seconds to fall by 1/e, level)
        (D5 / 2, 1.30, 0.42), (D5, 1.15, 1.00), (D5 * 2, 0.80, 0.34), (1479.98, 0.60, 0.11),
        (1760.00, 0.50, 0.10), (D5 * 2.76, 0.28, 0.05),
    ]
    left = sum(mode(t, hz - 0.35, tau, a, 0.0) for hz, tau, a in parts)
    right = sum(mode(t, hz + 0.35, tau, a, 0.6) for hz, tau, a in parts)
    strike = lowpass(rng.standard_normal(len(t)) * np.exp(-t / 0.006), 900) * 0.5
    att = np.minimum(1, t / 0.004)
    x = stereo((left + strike) * att, (right + strike) * att)
    x = lowpass(x, 7000)
    return fades(x, 0.0, 0.6), {"sync_s": 0.0, "what": "one warm chime on D (D4, D5, D6 with a little F#6 and A6), ringing about 3 s"}


EFFECTS = {
    "phone": phone, "rise": rise, "laptop": laptop, "push": push,
    "change-1": lambda rng: change(rng, 1.0), "change-2": lambda rng: change(rng, 1.25),
    "tap": tap, "lights": lights, "end": end,
}


def measure(x: np.ndarray) -> dict:
    m = x.mean(axis=1)
    n = int(0.1 * SR)
    frames = max(1, len(m) // (n // 4) - 3)
    st = [np.sqrt((x[i * n // 4: i * n // 4 + n] ** 2).mean() + 1e-12) for i in range(frames)]
    spec = np.abs(np.fft.rfft(m * np.hanning(len(m)))) ** 2
    f = np.fft.rfftfreq(len(m), 1 / SR)
    centroid = float((spec * f).sum() / (spec.sum() + 1e-20))
    cum = np.cumsum(spec) / (spec.sum() + 1e-20)
    lo, hi = f[int(np.searchsorted(cum, 0.05))], f[int(np.searchsorted(cum, 0.95))]
    env = np.abs(x).max(axis=1)
    w = int(0.3 * SR)
    if len(m) > 2 * w:
        power = np.convolve((x ** 2).mean(axis=1), np.ones(w) / w, mode="valid")
        swell_at = round(float((np.argmax(power) + w / 2) / SR), 2)
    else:
        swell_at = None
    return {"seconds": round(len(x) / SR, 3), "loudest_300ms_centred_at_s": swell_at, "peak_dbfs": round(float(20 * np.log10(np.abs(x).max() + 1e-12)), 1),
            "rms_dbfs": round(float(10 * np.log10((x ** 2).mean() + 1e-12)), 1),
            "loudest_100ms_rms_dbfs": round(float(20 * np.log10(max(st))), 1),
            "peak_at_s": round(float(np.argmax(env) / SR), 3),
            "centroid_hz": int(centroid), "band_5_95_hz": [int(lo), int(hi)],
            "first_5ms_peak_dbfs": round(float(20 * np.log10(np.abs(x[: int(0.005 * SR)]).max() + 1e-12)), 1),
            "last_5ms_peak_dbfs": round(float(20 * np.log10(np.abs(x[-int(0.005 * SR):]).max() + 1e-12)), 1)}


def write_wav(path: Path, x: np.ndarray) -> None:
    subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-y", "-f", "f32le", "-ar", str(SR), "-ac", "2",
                    "-i", "-", "-c:a", "pcm_s24le", str(path)], input=x.astype(np.float32).tobytes(), check=True)


def main() -> int:
    table = {}
    for k, (name, make) in enumerate(EFFECTS.items()):
        rng = np.random.default_rng(20261114 + k)
        x, info = make(rng)
        x = x * (10 ** (PEAK_DBFS / 20) / (np.abs(x).max() + 1e-12))
        write_wav(HERE / f"{name}.wav", x)
        table[name] = {**info, **measure(x)}
    (HERE / "sfx.json").write_text(json.dumps({"about": "Made by make_sfx.py: what each effect is and how it measures. sync_s is the moment in the file that belongs on the film event.",
                                              "effects": table}, indent=1) + "\n")
    if "--table" in sys.argv:
        print(f"{'effect':<10} {'s':>5} {'peak':>6} {'rms':>6} {'100ms':>6} {'peak at':>7} {'centroid':>8}  band 5-95%    first/last 5 ms  sync  loudest 300 ms at")
        for name, r in table.items():
            print(f"{name:<10} {r['seconds']:5.2f} {r['peak_dbfs']:6.1f} {r['rms_dbfs']:6.1f} {r['loudest_100ms_rms_dbfs']:6.1f} {r['peak_at_s']:7.3f} "
                  f"{r['centroid_hz']:8d}  {r['band_5_95_hz'][0]:5d}-{r['band_5_95_hz'][1]:<6d} {r['first_5ms_peak_dbfs']:6.1f}/{r['last_5ms_peak_dbfs']:6.1f}   {r['sync_s']}   {r['loudest_300ms_centred_at_s']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
