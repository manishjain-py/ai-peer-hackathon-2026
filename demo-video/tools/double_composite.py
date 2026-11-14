#!/usr/bin/env -S uv run --quiet --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy>=1.26", "scipy>=1.11"]
# ///
"""double_composite: lay the moving figure of one plate over another plate as a double made of light.

    uv run --quiet demo-video/tools/double_composite.py \
        --base p-plate1.mp4 --figure p-plate2.mp4 --out p-composite.mp4 \
        --opacity "0:0,1.2:0.45,4:0.9"

Two clips of the same room from the same locked camera:
  --base    what the audience sees as real: the sleeper, who stays in bed;
  --figure  the same room where the person gets up and walks. Only the person is taken from it.

How the person is lifted out of the figure plate (the matte):
  default      by difference: the room without the person is rebuilt from the figure plate itself
               (the per-pixel median over time), and whatever differs from it is the person.
               Seen on the first test: this also picks up his shadow and anything he moves;
  --matte F    a grey matte video made elsewhere (white is the person), same length as --figure,
               for example from person_matte.py;
  --refine     with --matte: keep the person matte's choice of WHAT is the person, and take the
               exact edge from the difference where the two agree.

The look, all by code: the figure keeps its own colours and is lit a little from within, gets a
thin mint rim, a soft mint halo, a light spill on the room near it, and a fine shimmer of drifting
light points. --opacity sets how solid it is over time ("seconds:opacity" pairs, straight lines
between them), so it can be see-through as it separates and more solid once it stands.

--world "x0,y0,x1,y1,t,fade" lets the double change the real room: from second t (over fade
seconds) that box of the picture is taken from the figure plate, except where the person is.
Use it where he moves a chair or opens a laptop, so the real chair moves and the real screen
lights up. --debug-matte FILE also writes the matte as a video, to check it.
"""
from __future__ import annotations

import argparse
import json
import subprocess
import sys

import numpy as np
from scipy import ndimage as ndi

MINT = np.array([183, 244, 207], dtype=np.float32) / 255.0   # #b7f4cf
LUMA = np.array([0.2126, 0.7152, 0.0722], dtype=np.float32)


def probe(path: str) -> dict:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
         "stream=width,height,r_frame_rate,nb_frames,duration", "-of", "json", path],
        capture_output=True, text=True, check=True,
    )
    s = json.loads(out.stdout)["streams"][0]
    num, den = s["r_frame_rate"].split("/")
    return {"w": int(s["width"]), "h": int(s["height"]), "fps": float(num) / float(den),
            "duration": float(s.get("duration") or 0)}


def frames(path: str, w: int, h: int, fps: float, grey: bool = False):
    """Yield the clip's frames as float32 arrays in 0..1, resampled to w x h at fps."""
    pix, ch = ("gray", 1) if grey else ("rgb24", 3)
    proc = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-i", path, "-vf", f"fps={fps},scale={w}:{h}:flags=lanczos",
         "-f", "rawvideo", "-pix_fmt", pix, "-"],
        stdout=subprocess.PIPE,
    )
    size = w * h * ch
    while True:
        buf = proc.stdout.read(size)
        if len(buf) < size:
            break
        arr = np.frombuffer(buf, dtype=np.uint8).astype(np.float32) / 255.0
        yield arr.reshape(h, w) if grey else arr.reshape(h, w, 3)
    proc.stdout.close()
    proc.wait()


def writer(path: str, w: int, h: int, fps: float, grey: bool = False):
    return subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "gray" if grey else "rgb24",
         "-s", f"{w}x{h}", "-r", f"{fps}", "-i", "-", "-c:v", "libx264", "-crf", "15",
         "-preset", "slow", "-pix_fmt", "yuv420p", "-movflags", "+faststart", path],
        stdin=subprocess.PIPE,
    )


def disk(radius: int) -> np.ndarray:
    y, x = np.ogrid[-radius:radius + 1, -radius:radius + 1]
    return (x * x + y * y) <= radius * radius


def smoothstep(lo: float, hi: float, x: np.ndarray) -> np.ndarray:
    t = np.clip((x - lo) / (hi - lo), 0.0, 1.0)
    return t * t * (3.0 - 2.0 * t)


def wide_blur(img: np.ndarray, sigma: float, factor: int = 4) -> np.ndarray:
    """A large Gaussian blur done on a small copy (fast), returned at full size."""
    small = img[::factor, ::factor]
    small = ndi.gaussian_filter(small, sigma / factor)
    up = np.repeat(np.repeat(small, factor, axis=0), factor, axis=1)[: img.shape[0], : img.shape[1]]
    if up.shape != img.shape:
        up = np.pad(up, ((0, img.shape[0] - up.shape[0]), (0, img.shape[1] - up.shape[1])), mode="edge")
    return ndi.gaussian_filter(up, factor * 0.6)


def keyframes(spec: str):
    pairs = sorted((float(a), float(b)) for a, b in (p.split(":") for p in spec.split(",")))
    times, values = [p[0] for p in pairs], [p[1] for p in pairs]
    return lambda t: float(np.interp(t, times, values))


def clean_plate(path: str, w: int, h: int, fps: float, samples: int = 60) -> np.ndarray:
    """The room without the person: the per-pixel median of frames spread over the clip."""
    every = max(1, int(round(probe(path)["duration"] * fps / samples)))
    picked = [f for i, f in enumerate(frames(path, w, h, fps)) if i % every == 0]
    return np.median(np.stack(picked), axis=0).astype(np.float32)


def difference_matte(frame: np.ndarray, clean: np.ndarray, lo: float, hi: float, keep: float) -> np.ndarray:
    """A solid silhouette of whatever differs from the clean plate, as a boolean mask."""
    # Compare in a gamma-lifted space, so a dark figure against a dark room still registers.
    d = np.abs(np.sqrt(frame) - np.sqrt(clean)).max(axis=2)
    soft = ndi.gaussian_filter(smoothstep(lo, hi, d), 1.2)
    mask = soft > 0.5
    mask = ndi.binary_closing(mask, structure=disk(6), iterations=1)
    mask = ndi.binary_fill_holes(mask)
    mask = ndi.binary_opening(mask, structure=disk(2))
    labels, count = ndi.label(mask)
    if count == 0:
        return mask
    areas = ndi.sum_labels(mask, labels, index=np.arange(1, count + 1))
    good = np.flatnonzero(areas >= max(keep * areas.max(), 150.0)) + 1
    return np.isin(labels, good)


class Shimmer:
    """Fine points of light that are born near the figure's edge, drift up a little and fade."""

    def __init__(self, h: int, w: int, fps: float, seed: int = 7):
        self.h, self.w, self.fps = h, w, fps
        self.rng = np.random.default_rng(seed)
        self.p = np.zeros((0, 6), dtype=np.float32)   # x, y, vx, vy, age, life

    def step(self, zone: np.ndarray, births: int) -> np.ndarray:
        ys, xs = np.nonzero(zone)
        if len(ys) and births:
            pick = self.rng.integers(0, len(ys), size=births)
            new = np.zeros((births, 6), dtype=np.float32)
            new[:, 0], new[:, 1] = xs[pick], ys[pick]
            new[:, 2] = self.rng.normal(0, 3.0, births)
            new[:, 3] = -self.rng.uniform(4.0, 14.0, births)
            new[:, 5] = self.rng.uniform(0.5, 1.4, births)
            self.p = np.concatenate([self.p, new])
        dt = 1.0 / self.fps
        self.p[:, 0] += self.p[:, 2] * dt
        self.p[:, 1] += self.p[:, 3] * dt
        self.p[:, 4] += dt
        alive = (self.p[:, 4] < self.p[:, 5]) & (self.p[:, 0] >= 0) & (self.p[:, 0] < self.w - 1) \
            & (self.p[:, 1] >= 0) & (self.p[:, 1] < self.h - 1)
        self.p = self.p[alive]
        layer = np.zeros((self.h, self.w), dtype=np.float32)
        if len(self.p):
            phase = self.p[:, 4] / self.p[:, 5]
            bright = np.sin(np.pi * phase) * (0.6 + 0.4 * np.sin(self.p[:, 4] * 23.0 + self.p[:, 0]))
            np.add.at(layer, (self.p[:, 1].astype(int), self.p[:, 0].astype(int)), np.clip(bright, 0, 1))
        return ndi.gaussian_filter(layer, 0.8) * 3.2 + ndi.gaussian_filter(layer, 2.6) * 5.0


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("--base", required=True)
    ap.add_argument("--figure", required=True)
    ap.add_argument("--out", required=True)
    ap.add_argument("--matte", help="a grey matte video made elsewhere (white is the person)")
    ap.add_argument("--debug-matte", help="also write the matte as a video")
    ap.add_argument("--opacity", default="0:0,1.2:0.45,4:0.9", help='"seconds:opacity" pairs')
    ap.add_argument("--glow", default="0:0,0.8:1", help='"seconds:strength" pairs for rim, halo and shimmer')
    ap.add_argument("--figure-offset", type=float, default=0.0, help="seconds of the figure plate to skip")
    ap.add_argument("--lo", type=float, default=0.035, help="difference where the matte starts")
    ap.add_argument("--hi", type=float, default=0.085, help="difference where the matte is full")
    ap.add_argument("--keep", type=float, default=0.12, help="keep blobs at least this share of the largest")
    ap.add_argument("--refine", action="store_true", help="with --matte: sharpen its edge by difference")
    ap.add_argument("--gain", type=float, default=1.0, help="exposure of the figure (a dark figure needs 2 or more)")
    ap.add_argument("--tint", type=float, default=0.25, help="how far the figure's colours lean to mint")
    ap.add_argument("--lift", type=float, default=0.22, help="how much the figure is lit from within")
    ap.add_argument("--rim", type=float, default=1.0)
    ap.add_argument("--inner-rim", type=float, default=0.8, help="the band of light just inside the outline")
    ap.add_argument("--halo", type=float, default=0.55)
    ap.add_argument("--spill", type=float, default=0.5)
    ap.add_argument("--shimmer", type=float, default=1.0)
    ap.add_argument("--world", help='"x0,y0,x1,y1,t,fade": from second t this box follows the figure plate')
    ap.add_argument("--max-seconds", type=float, default=0.0, help="stop after this long (0: whole clip)")
    args = ap.parse_args()

    info = probe(args.base)
    w, h, fps = info["w"], info["h"], info["fps"]
    opacity, glow_at = keyframes(args.opacity), keyframes(args.glow)
    clean = clean_plate(args.figure, w, h, fps) if (args.refine or not args.matte) else None

    base_frames = frames(args.base, w, h, fps)
    fig_frames = frames(args.figure, w, h, fps)
    matte_frames = frames(args.matte, w, h, fps, grey=True) if args.matte else None
    for _ in range(int(round(args.figure_offset * fps))):
        next(fig_frames, None)
        if matte_frames:
            next(matte_frames, None)

    world = world_match = None
    if args.world:
        x0, y0, x1, y1, world_t, world_fade = (float(v) for v in args.world.split(","))
        box = np.zeros((h, w), dtype=np.float32)
        box[int(y0):int(y1), int(x0):int(x1)] = 1.0
        world = ndi.gaussian_filter(box, 14.0)             # a soft-edged box
    out = writer(args.out, w, h, fps)
    dbg = writer(args.debug_matte, w, h, fps, grey=True) if args.debug_matte else None
    shimmer = Shimmer(h, w, fps)
    prev_soft = None
    n = 0
    for base, fig in zip(base_frames, fig_frames):
        t = n / fps
        if args.max_seconds and t >= args.max_seconds:
            break
        if matte_frames:
            m = next(matte_frames, None)
            if m is None:
                break
            mask = m > 0.5
            if args.refine:
                by_diff = difference_matte(fig, clean, args.lo, args.hi, 0.0)
                mask = (ndi.binary_dilation(mask, structure=disk(5)) & by_diff) \
                    | ndi.binary_erosion(mask, structure=disk(3))
                mask = ndi.binary_fill_holes(mask)
                labels, count = ndi.label(mask)                 # drop stray specks beside the person
                if count > 1:
                    areas = ndi.sum_labels(mask, labels, index=np.arange(1, count + 1))
                    mask = np.isin(labels, np.flatnonzero(areas >= 0.08 * areas.max()) + 1)
            soft = ndi.gaussian_filter(mask.astype(np.float32), 1.3)
        else:
            mask = difference_matte(fig, clean, args.lo, args.hi, args.keep)
            soft = ndi.gaussian_filter(mask.astype(np.float32), 1.3)
        if prev_soft is not None:
            soft = 0.7 * soft + 0.3 * prev_soft            # a little memory against flicker
        prev_soft = soft

        if world is not None and t >= world_t:
            # The room inside the box now follows the figure plate (a moved chair, an open laptop),
            # but not where the person stands: there the double is laid over the base as before.
            near = np.clip(ndi.gaussian_filter(ndi.binary_dilation(mask, structure=disk(3)).astype(np.float32), 2.0), 0, 1)
            if world_match is None:
                # The two plates are not exposed alike (seen: the figure plate 1.45 times brighter
                # at the desk). Measure both once, away from the person, and from now on bring the
                # figure plate's box to the base's brightness and contrast, per colour channel.
                sel = (world > 0.9) & ~ndi.binary_dilation(mask, structure=disk(15))
                mf, sf = fig[sel].mean(axis=0), fig[sel].std(axis=0) + 1e-4
                mb, sb = base[sel].mean(axis=0), base[sel].std(axis=0) + 1e-4
                world_match = (mf, sb / sf, mb)
            mf, ratio, mb = world_match
            matched = np.clip((fig - mf) * ratio + mb, 0, 1)
            # Under the person the base stays the first plate at first (so he is see-through), then
            # over 1.5 s it follows the figure plate there too: he turns solid as he settles, and the
            # chair he moved is not seen twice through him.
            enter = float(smoothstep(world_t, world_t + world_fade, np.float32(t)))
            solid = float(smoothstep(world_t + world_fade, world_t + world_fade + 1.5, np.float32(t)))
            k = (world * enter * (1.0 - near * (1.0 - solid)))[..., None]
            base = base * (1.0 - k) + matched * k
        op, glow = opacity(t), glow_at(t)
        # The figure keeps its own colours, exposed up if it was filmed dark, leaning to mint,
        # and lifted a little more, as if lit from within.
        lit = fig if args.gain == 1.0 else 1.0 - np.exp(-fig * args.gain)
        luma = lit @ LUMA
        lit = lit * (1.0 - args.tint) + luma[..., None] * (MINT / MINT.max()) * args.tint * 1.15
        body = np.clip(lit * (1.0 + args.lift) + MINT * (0.04 + 0.16 * luma[..., None]) * args.lift * 3.0, 0, 1)
        alpha = (soft * op)[..., None]
        frame = base * (1.0 - alpha) + body * alpha

        inner = ndi.binary_erosion(mask, structure=disk(2))
        rim = ndi.gaussian_filter(np.clip(soft - inner.astype(np.float32), 0, 1), 1.0)
        core = ndi.gaussian_filter(ndi.binary_erosion(mask, structure=disk(5)).astype(np.float32), 2.5)
        rim_in = np.clip(soft - core, 0, 1)                # a wider band just inside the outline
        halo = wide_blur(soft, 20.0) * (1.0 - soft)
        spill = wide_blur(soft, 70.0, factor=8)
        zone = (ndi.gaussian_filter(soft, 9.0) > 0.06) & (soft < 0.85)
        sparks = shimmer.step(zone, births=int(round(10 * args.shimmer * glow))) if args.shimmer else 0.0

        light = (rim * 0.9 * args.rim + rim_in * 0.45 * args.inner_rim + halo * args.halo + sparks * 0.5) \
            * glow * min(1.0, op * 2.2)
        frame = frame + base * MINT * (spill * args.spill * 1.6 * glow * op)[..., None]   # lights the room
        frame = 1.0 - (1.0 - np.clip(frame, 0, 1)) * (1.0 - np.clip(light[..., None] * MINT, 0, 1))  # screen

        out.stdin.write((np.clip(frame, 0, 1) * 255.0 + 0.5).astype(np.uint8).tobytes())
        if dbg:
            dbg.stdin.write((np.clip(soft, 0, 1) * 255.0 + 0.5).astype(np.uint8).tobytes())
        n += 1
        if n % 48 == 0:
            print(f"  {n} frames ({t:.1f}s)", flush=True)
    out.stdin.close()
    out.wait()
    if dbg:
        dbg.stdin.close()
        dbg.wait()
    print(f"wrote {args.out}: {n} frames, {w}x{h} at {fps:g} fps")
    return 0


if __name__ == "__main__":
    sys.exit(main())
