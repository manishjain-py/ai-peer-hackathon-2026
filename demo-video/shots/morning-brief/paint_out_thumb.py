#!/usr/bin/env -S uv run --quiet --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy>=1.26", "pillow>=10"]
# ///
"""paint_out_thumb: remove the small early thumb lift from the upscaled morning-brief take.

    uv run --quiet demo-video/shots/morning-brief/paint_out_thumb.py IN.mp4 OUT.mp4 [--first 64] [--last 77] [--check PICTURE.jpg]

The take (morning-brief-raw-f3.mp4, 2016x1152) has one real tap (the thumb comes into view at
frame 90 and presses at frame 97) and, about a second earlier (frames 67 to 74), a smaller lift:
the thumb rises beside the phone's edge to about half the height of the tap and sinks again.
The shot must show ONE tap, so that earlier lift is painted out. Only frames --first to --last
are looked at, and only those where the thumb stands above its resting place are changed. The
tip of the thumb that rests beside the fingertip in every frame (rows 146 and below in the
window) is left alone, and so is the slight swell of that tip in frames 78 to 85, when the
whole hand dips. The tap and everything after it are left as they were (the whole clip is
encoded once more, at a quality that loses nothing visible).

How, per frame, inside a window of 240 x 260 px at (700, 600):
  1. the phone's right edge is found row by row (the last run of dark pixels before the wall)
     and a straight line is fitted through it;
  2. the wall's colour is read per row, 50 to 80 px right of the edge, where nothing ever moves;
  3. a row holds thumb when, past the phone's bright rim (7.5 px and more right of the edge),
     pixels are clearly brighter and warmer than that wall;
  4. from the top of the thumb down to row 188, everything from the edge to 48 px right of it
     is rebuilt: the row's own wall colour plus the phone's rim, whose cross-section is measured
     in the same frame on the rows above the thumb. One part is kept as it is: a small rounded
     cap hugging the rim (15 px wide, from row 140 down), which is where the thumb's tip rests
     in every other frame, so the tip does not vanish while the lift is removed.
Nothing is copied from other frames, so the phone may drift freely; the wall is out of focus
and the camera is locked, so the patch has nothing to give it away. The frames are read and
written as the clip's own YUV 4:2:0 values (no colour conversion): nothing else shifts in tone.
With --check it writes a picture of the window in eight frames, before (top) and after (bottom).
"""
from __future__ import annotations

import subprocess
import sys

import numpy as np
from PIL import Image

X0, Y0, WW, HH = 700, 600, 240, 260      # the window in the 2016 x 1152 frame (all even numbers)
XS, XE, YS, YE = 30, 170, 8, 192         # the part of the window where the phone's edge is measured
REST = 146                               # from this row down the thumb's tip rests in every frame
CAP_D, CAP_Y, CAP_H = 15.0, 170, 30      # the resting tip that is kept: 15 px wide, rounded off between rows 140 and 170
LOW = 188                                # the rebuild ends here (below it the next finger crosses the edge)
REACH = 48                               # px right of the edge that are rebuilt in a thumb row
PAST_RIM = 7.5                           # the rim is bright to about 6 px right of the edge
MIN_ROWS = 4                             # fewer thumb rows than this: the frame is left alone
SHOW = (64, 66, 67, 68, 70, 72, 74, 76)


def probe(clip: str) -> tuple[int, int, str, str]:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
         "stream=width,height,r_frame_rate,pix_fmt", "-of", "default=nw=1", clip],
        capture_output=True, text=True, check=True,
    ).stdout
    got = dict(line.split("=", 1) for line in out.strip().splitlines())  # ffprobe picks the order itself
    return int(got["width"]), int(got["height"]), got["r_frame_rate"], got["pix_fmt"]


def split(buf: bytes, w: int, h: int):
    """One yuv420p frame as three planes (copies, so they can be changed)."""
    a = np.frombuffer(buf, dtype=np.uint8)
    y = a[: w * h].reshape(h, w).copy()
    u = a[w * h: w * h + (w // 2) * (h // 2)].reshape(h // 2, w // 2).copy()
    v = a[w * h + (w // 2) * (h // 2):].reshape(h // 2, w // 2).copy()
    return y, u, v


def window(y, u, v) -> np.ndarray:
    """The window as floats, shape (HH, WW, 3) = Y, U, V, the colour planes repeated to full size."""
    wy = y[Y0:Y0 + HH, X0:X0 + WW].astype(np.float32)
    wu = u[Y0 // 2:(Y0 + HH) // 2, X0 // 2:(X0 + WW) // 2].astype(np.float32)
    wv = v[Y0 // 2:(Y0 + HH) // 2, X0 // 2:(X0 + WW) // 2].astype(np.float32)
    return np.stack([wy, np.repeat(np.repeat(wu, 2, 0), 2, 1), np.repeat(np.repeat(wv, 2, 0), 2, 1)], axis=-1)


def rgb(yuv: np.ndarray) -> np.ndarray:
    c = 1.164 * (yuv[..., 0] - 16.0)
    u, v = yuv[..., 1] - 128.0, yuv[..., 2] - 128.0
    return np.stack([c + 1.596 * v, c - 0.813 * v - 0.391 * u, c + 2.018 * u], axis=-1)


def repair(win: np.ndarray):
    """Rebuild the thumb rows of one window. Returns (new window, alpha, thumb rows, thumb pixels) or None."""
    col = rgb(win)
    weights = np.array([0.299, 0.587, 0.114], dtype=np.float32)
    luma = col @ weights
    rows = np.arange(YS, YE)

    # 1. the phone's edge: per row the last run of four dark pixels, then a straight line through them
    raw = np.full(len(rows), np.nan)
    for i, y in enumerate(rows):
        dark = luma[y, XS:XE] < 50
        run = dark[3:] & dark[2:-1] & dark[1:-2] & dark[:-3]
        hit = np.where(run)[0]
        if len(hit):
            raw[i] = XS + hit.max() + 3
    ok = ~np.isnan(raw)
    if ok.sum() < 40:
        return None
    for _ in range(3):
        a, b = np.polyfit(rows[ok], raw[ok], 1)
        ok = ~np.isnan(raw) & (np.abs(raw - (a * rows + b)) < 2.0)
        if ok.sum() < 40:
            return None
    edge = a * np.arange(HH) + b                     # the last dark pixel of the phone, per row

    # 2. the wall's colour per row, read 50 to 80 px right of the edge, smoothed down the rows
    wall = np.zeros((HH, 3), dtype=np.float32)
    for y in range(HH):
        x1 = int(min(max(edge[y] + 50, 0), WW - 12))
        x2 = int(min(edge[y] + 80, WW - 2, 172))
        wall[y] = np.median(win[y, x1:max(x2, x1 + 8)], axis=0)
    pad = np.pad(wall, ((7, 7), (0, 0)), mode="edge")
    wall = np.stack([np.convolve(pad[:, c], np.ones(15, dtype=np.float32) / 15, mode="valid") for c in range(3)], axis=-1)
    wall_rgb = rgb(wall)
    wall_luma = wall_rgb @ weights
    wall_warm = wall_rgb[:, 0] - wall_rgb[:, 2]

    # 3. thumb: past the rim, clearly brighter and warmer than the wall of its row
    dist = np.arange(WW)[None, :] - edge[:, None]    # px right of the edge
    zone = (dist > PAST_RIM) & (dist <= REACH - 8)
    zone[:YS] = False
    zone[YE:] = False
    bright = (luma - wall_luma[:, None]) > 20
    warm = ((col[..., 0] - col[..., 2]) - wall_warm[:, None]) > 10
    thumb = zone & bright & warm
    thumb[REST:] = False                             # the resting tip is not ours to remove
    thumb_rows = thumb.sum(axis=1) >= 2
    if thumb_rows.sum() < MIN_ROWS:
        return None
    top = int(np.where(thumb_rows)[0].min())

    # 4. the rim's cross-section (its excess over the wall) from the rows the thumb does not reach,
    #    out to REACH, so the wall's own slight slope toward the phone is carried along too
    clean = (zone & bright).sum(axis=1) == 0
    clean[:YS] = False
    clean[max(top - 12, 0):] = False                 # only rows well above the thumb
    if clean.sum() < 12:
        return None
    bins = np.arange(0.0, REACH + 0.01, 0.5)
    centres = (bins[:-1] + bins[1:]) / 2
    prof = np.zeros((len(centres), 3), dtype=np.float32)
    d = dist[clean]
    excess = win[clean] - wall[clean][:, None, :]
    for k in range(len(centres)):
        sel = (d > bins[k]) & (d <= bins[k + 1])
        if sel.sum() >= 4:
            prof[k] = excess[sel].mean(axis=0)
    far = centres > 8.0                               # beyond the rim only wall is left: smooth it
    smooth = np.stack([np.convolve(np.pad(prof[:, c], 6, mode="edge"), np.ones(13) / 13, mode="valid")
                       for c in range(3)], axis=-1)
    prof[far] = smooth[far]

    # 5. rebuild the thumb rows: wall plus rim, soft at the top, the bottom and the far side
    fade = 6
    row_alpha = np.zeros(HH, dtype=np.float32)
    row_alpha[top:LOW] = 1.0                          # from the thumb's top down to the next finger
    for k in range(1, fade + 1):
        if top - k >= YS:
            row_alpha[top - k] = 1.0 - k / (fade + 1)
        row_alpha[LOW - 1 + k] = 1.0 - k / (fade + 1)
    # the resting tip, kept: a rounded cap against the rim (soft-edged)
    yy = np.arange(HH, dtype=np.float32)[:, None]
    radius = np.sqrt((np.clip(dist, 0, None) / CAP_D) ** 2 + (np.clip(CAP_Y - yy, 0, None) / CAP_H) ** 2)
    kept = np.clip((1.0 - radius) / 0.18 + 0.5, 0.0, 1.0)
    new = win.copy()
    alpha = np.zeros((HH, WW), dtype=np.float32)
    for y in range(YS, min(LOW + fade, HH)):
        if row_alpha[y] <= 0:
            continue
        sel = (dist[y] > 0.5) & (dist[y] <= REACH)
        dd = dist[y, sel]
        new[y, sel] = wall[y] + np.stack([np.interp(dd, centres, prof[:, c]) for c in range(3)], axis=-1)
        alpha[y, sel] = row_alpha[y] * np.clip((REACH - dd) / 8.0, 0.0, 1.0) * (1.0 - kept[y, sel])
    return new, alpha, int(thumb_rows.sum()), int(thumb.sum())


def main() -> int:
    args = sys.argv[1:]
    first, last, check = 64, 77, None
    if "--first" in args:
        i = args.index("--first"); first = int(args[i + 1]); del args[i:i + 2]
    if "--last" in args:
        i = args.index("--last"); last = int(args[i + 1]); del args[i:i + 2]
    if "--check" in args:
        i = args.index("--check"); check = args[i + 1]; del args[i:i + 2]
    src, dst = args[0], args[1]
    w, h, rate, pix = probe(src)
    if pix != "yuv420p":
        print(f"expected a yuv420p clip, got {pix}")
        return 2
    size = w * h * 3 // 2
    reader = subprocess.Popen(["ffmpeg", "-v", "error", "-i", src, "-f", "rawvideo", "-pix_fmt", "yuv420p", "-"],
                              stdout=subprocess.PIPE)
    writer = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "yuv420p", "-s", f"{w}x{h}", "-r", rate,
         "-i", "-", "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "6", "-pix_fmt", "yuv420p",
         "-movflags", "+faststart", dst], stdin=subprocess.PIPE)
    keep, touched = {}, []
    n = 0
    while True:
        buf = reader.stdout.read(size)
        if len(buf) < size:
            break
        if first <= n <= last or n in SHOW:
            y, u, v = split(buf, w, h)
            win = window(y, u, v)
            fixed = repair(win) if first <= n <= last else None
            after = win
            if fixed is not None:
                new, alpha, n_rows, n_px = fixed
                after = win * (1 - alpha[..., None]) + new * alpha[..., None]
                a2 = alpha.reshape(HH // 2, 2, WW // 2, 2).mean(axis=(1, 3))
                y[Y0:Y0 + HH, X0:X0 + WW] = np.clip(np.rint(after[..., 0]), 0, 255).astype(np.uint8)
                for plane, c in ((u, 1), (v, 2)):
                    old = plane[Y0 // 2:(Y0 + HH) // 2, X0 // 2:(X0 + WW) // 2].astype(np.float32)
                    rebuilt = new[..., c].reshape(HH // 2, 2, WW // 2, 2).mean(axis=(1, 3))
                    plane[Y0 // 2:(Y0 + HH) // 2, X0 // 2:(X0 + WW) // 2] = np.clip(
                        np.rint(old * (1 - a2) + rebuilt * a2), 0, 255).astype(np.uint8)
                buf = y.tobytes() + u.tobytes() + v.tobytes()
                touched.append((n, n_rows, n_px))
            if n in SHOW:
                keep[n] = (np.clip(rgb(win), 0, 255).astype(np.uint8), np.clip(rgb(after), 0, 255).astype(np.uint8))
        writer.stdin.write(buf)
        n += 1
    writer.stdin.close()
    writer.wait()
    reader.wait()
    print(f"{n} frames written to {dst}")
    print(f"{len(touched)} frames changed (frame: thumb rows / thumb pixels): "
          + " ".join(f"f{a}:{r}/{c}" for a, r, c in touched))
    if check and keep:
        order = sorted(keep)
        sheet = np.concatenate([np.concatenate([keep[k][0] for k in order], axis=1),
                                np.concatenate([keep[k][1] for k in order], axis=1)], axis=0)
        Image.fromarray(sheet).resize((sheet.shape[1] * 3 // 2, sheet.shape[0] * 3 // 2), Image.LANCZOS).save(check, quality=92)
        print(f"wrote {check}: frames {order}, before (top) and after (bottom)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
