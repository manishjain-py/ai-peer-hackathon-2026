#!/usr/bin/env -S uv run --quiet --python 3.12 --script
# /// script
# requires-python = ">=3.10,<3.13"
# dependencies = ["numpy>=1.26", "opencv-python-headless>=4.9", "pillow>=10"]
# ///
r"""phone_lightup: the phone on the bedside table is dark at first, then lights up.

    uv run --quiet --python 3.12 demo-video/tools/phone_lightup.py CLIP.mp4 OUT.mp4 --on 0.9 \
        [--ramp 0.25] [--check CHECK.jpg] [--prove] [--lit STILL.png] [--dark STILL.png] [--crf 16]

The night clip was made from the still with the phone lit, so its phone glows from the first
frame. A second still shows the same room with the phone off. This tool takes the light away
by adding (dark still minus lit still) to the clip's own frames, so the clip's grain and colour
stay, and lets the light come back:

  before --on seconds          the phone and its glow are off;
  from --on, over --ramp s     the light comes up smoothly (an eased blend);
  after that                   every frame is the clip's own picture, untouched.

Steps, all on this Mac (nothing sent, nothing paid):
 1. Register the lit still to the clip's first frame. The clip is the still scaled and cropped
    (the model's canvas, then the delivery crop), so a scale and an offset per axis are found:
    first from matched picture features, then refined on the whole picture. The error is
    printed in pixels, measured on a grid of patches.
 2. The change: dark minus lit, brought to the clip's frame. The two stills also differ a
    little everywhere (an even brightness shift from the edit that made the dark one); that
    even shift is taken out, so only the phone and its glow change.
 3. The mask: the area joined to the phone where the stills differ by more than --low levels
    (of 255), with a soft edge. Outside it nothing is touched.
 4. The frames are changed in the clip's own YUV numbers (no detour through RGB), so a pixel
    outside the mask, and every frame after the ramp, goes to the encoder bit for bit as it
    came out of the input. The count of changed samples there is printed (it must be 0).
 5. Encoded like deliver.sh: H.264, yuv420p, preset slow, crf 16, faststart, the clip's frame
    rate, no sound. That encode is lossy, so the FILE differs from the input by the encoder's
    loss everywhere; --prove measures it against a control (the untouched input encoded the
    same way) to show the edit adds nothing outside the mask or after the ramp.

  --check CHECK.jpg  the bedside table enlarged, before, during and after the light comes up
                     (top row: the new clip; bottom row: the same frames of the input)
  --prove            decode the result and print the difference measures with the control
  --lit / --dark     the two stills (default: demo-video/shots/stills/night-phone-lit.png and
                     night-phone-dark.png); they must be the same size and pixel-aligned
  --nudge DX,DY      slide the change by a fraction of a pixel, if the printed fit round the
                     phone says the clip's phone sits a little off the still's
If the still does not show what the clip's first frame shows, the tool stops and writes nothing.
"""
from __future__ import annotations

import argparse
import json
import math
import subprocess
import sys
import tempfile
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

TOOLS = Path(__file__).resolve().parent
STILLS = TOOLS.parent / "shots" / "stills"
INK_DEEP = (12, 26, 30)
PAPER = (246, 244, 238)
MINT = (183, 244, 207)
FONT_FILE = TOOLS / "fonts" / "Manrope[wght].ttf"
FALLBACKS = ["/System/Library/Fonts/Helvetica.ttc", "/System/Library/Fonts/Supplemental/Arial.ttf"]
# How the clip's Y, U, V numbers stand for red, green and blue. A clip with no colour tags is read as
# BT.601 in video range (ffmpeg's own assumption; the drafts fit that better than BT.709 against
# their stills). A clip tagged bt709 or full range is read that way, and its tags are passed on.
COLOUR = {"kr": 0.299, "kb": 0.114, "full": False}


def luma_full(y: np.ndarray) -> np.ndarray:
    """The Y plane as brightness 0..255."""
    return y if COLOUR["full"] else (y - 16.0) * 255.0 / 219.0


def say(*parts: object) -> None:
    print(*parts, flush=True)


def font(size: int, weight: int = 600) -> ImageFont.FreeTypeFont:
    if FONT_FILE.exists():
        f = ImageFont.truetype(str(FONT_FILE), size)
        try:
            f.set_variation_by_axes([weight])
        except (OSError, AttributeError):
            pass
        return f
    for fallback in FALLBACKS:
        if Path(fallback).exists():
            return ImageFont.truetype(fallback, size)
    return ImageFont.load_default(size)


def probe(clip: str) -> dict:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
         "stream=width,height,r_frame_rate,pix_fmt,color_space,color_range,color_transfer,color_primaries",
         "-of", "json", clip],
        capture_output=True, text=True, check=True)
    s = json.loads(out.stdout)["streams"][0]
    num, den = s["r_frame_rate"].split("/")
    tags = {k: s.get(k, "unknown") for k in ("color_space", "color_range", "color_transfer", "color_primaries")}
    return {"w": int(s["width"]), "h": int(s["height"]), "rate": s["r_frame_rate"],
            "fps": float(num) / float(den), "pix_fmt": s.get("pix_fmt", ""), "tags": tags}


def read_yuv(clip: str, w: int, h: int, count: int | None = None):
    """Every frame (or the first `count`) as its three planes (Y full size, U and V half size), exactly as decoded."""
    limit = ["-frames:v", str(count)] if count else []
    reader = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-i", clip, *limit, "-f", "rawvideo", "-pix_fmt", "yuv420p", "-"],
        stdout=subprocess.PIPE)
    cw, ch = w // 2, h // 2
    size = w * h + 2 * cw * ch
    try:
        while True:
            buf = reader.stdout.read(size)
            if len(buf) < size:
                break
            y = np.frombuffer(buf, np.uint8, w * h, 0).reshape(h, w)
            u = np.frombuffer(buf, np.uint8, cw * ch, w * h).reshape(ch, cw)
            v = np.frombuffer(buf, np.uint8, cw * ch, w * h + cw * ch).reshape(ch, cw)
            yield y, u, v
    finally:
        reader.stdout.close()
        reader.wait()


def read_rgb(clip: str, w: int, h: int, wanted: list[int]) -> dict[int, np.ndarray]:
    """The wanted frames as RGB pictures."""
    last = max(wanted)
    reader = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-i", clip, "-frames:v", str(last + 1), "-f", "rawvideo", "-pix_fmt", "rgb24", "-"],
        stdout=subprocess.PIPE)
    out, size = {}, w * h * 3
    for t in range(last + 1):
        buf = reader.stdout.read(size)
        if len(buf) < size:
            break
        if t in wanted:
            out[t] = np.frombuffer(buf, np.uint8).reshape(h, w, 3).copy()
    reader.stdout.close()
    reader.wait()
    return out


# ---------------------------------------------------------------- 1. register the still to the clip

def to_clip(img: np.ndarray, reg: tuple[float, float, float, float], w: int, h: int) -> np.ndarray:
    """A still brought to the clip's frame: x' = sx x + tx, y' = sy y + ty (pixel middles)."""
    sx, sy, tx, ty = reg
    shrink = min(sx, sy)
    if shrink < 0.95:                      # scaling down: soften first so fine detail does not alias
        img = cv2.GaussianBlur(img, (0, 0), 0.4 / shrink)
    m = np.float32([[sx, 0, tx], [0, sy, ty]])
    return cv2.warpAffine(img, m, (w, h), flags=cv2.INTER_CUBIC, borderMode=cv2.BORDER_REPLICATE)


def line_fit(a: np.ndarray, b: np.ndarray) -> tuple[float, float, np.ndarray]:
    """b = k a + c, throwing out points far off the line. Returns k, c and which points were kept."""
    keep = np.ones(len(a), dtype=bool)
    k = c = 0.0
    for _ in range(10):
        m = np.stack([a[keep], np.ones(int(keep.sum()))], axis=1)
        (k, c), *_ = np.linalg.lstsq(m, b[keep], rcond=None)
        res = b - (k * a + c)
        sigma = 1.4826 * float(np.median(np.abs(res[keep] - np.median(res[keep]))))
        new = np.abs(res) < max(3 * sigma, 0.5)
        if new.sum() < 8 or (new == keep).all():
            break
        keep = new
    return float(k), float(c), keep


def fine_detail(img: np.ndarray, unit: float) -> np.ndarray:
    """The picture without its slow light and shade: only what is finer than a few pixels."""
    soft = cv2.GaussianBlur(img, (0, 0), 0.8 * unit)
    return soft - cv2.GaussianBlur(soft, (0, 0), 8.0 * unit)


def likeness(still: np.ndarray, frame: np.ndarray, unit: float) -> float:
    """How alike the fine detail of two pictures is: 1 the same picture, 0 nothing in common."""
    a, b = fine_detail(still, unit), fine_detail(frame, unit)
    return float((a * b).sum() / math.sqrt(float((a * a).sum()) * float((b * b).sum()) + 1e-9))


def patch_shifts(still: np.ndarray, frame: np.ndarray, unit: float) -> np.ndarray:
    """Leftover shift of the frame against the registered still on a grid of patches: rows of (x, y, dx, dy).

    Only patches with real detail in both pictures and one clear answer count (a bare wall, or
    curtain folds that look the same when slid along, say nothing about position).
    """
    h, w = frame.shape
    size = max(64, int(round(w / 15 / 16)) * 16)
    win = cv2.createHanningWindow((size, size), cv2.CV_32F)
    a_img, b_img = fine_detail(still, unit), fine_detail(frame, unit)
    out = []
    for y0 in range(0, h - size + 1, size * 3 // 4):
        for x0 in range(0, w - size + 1, size * 3 // 4):
            a = np.array(a_img[y0:y0 + size, x0:x0 + size])     # copies: phaseCorrelate writes into what it is given
            b = np.array(b_img[y0:y0 + size, x0:x0 + size])
            if min(float(a.std()), float(b.std())) < 3.0:
                continue
            a -= a.mean()
            b -= b.mean()
            (dx, dy), peak = cv2.phaseCorrelate(a, b, win)
            if peak >= 0.4 and abs(dx) < size / 4 and abs(dy) < size / 4:
                out.append((x0 + size / 2, y0 + size / 2, dx, dy))
    return np.array(out, dtype=np.float64).reshape(-1, 4)


def best_nudge(still: np.ndarray, frame_y: np.ndarray, box: tuple[int, int, int, int],
               blur: float) -> tuple[float, float, float, float]:
    """Slide the registered still by up to 1 px each way round the phone: where does it fit frame 0 best?

    Returns (dx, dy, misfit there, misfit as registered), the misfit in brightness levels (rms).
    """
    h, w = frame_y.shape
    pad = 6
    x0, y0, x1, y1 = max(pad, box[0]), max(pad, box[1]), min(w - pad, box[2]), min(h - pad, box[3])
    frame = luma_full(frame_y[y0:y1, x0:x1]).ravel().astype(np.float64)
    part = still[y0 - pad:y1 + pad, x0 - pad:x1 + pad]
    if blur > 0:
        part = cv2.GaussianBlur(part, (0, 0), blur)
    best = (0.0, 0.0, float("inf"))
    now = float("inf")
    for dy in np.arange(-10, 11) / 10.0:
        for dx in np.arange(-10, 11) / 10.0:
            m = np.float32([[1, 0, dx], [0, 1, dy]])
            moved = cv2.warpAffine(part, m, (part.shape[1], part.shape[0]), flags=cv2.INTER_CUBIC,
                                   borderMode=cv2.BORDER_REPLICATE)[pad:-pad, pad:-pad].ravel().astype(np.float64)
            k, c = np.polyfit(moved, frame, 1)
            miss = float(np.sqrt(((frame - (k * moved + c)) ** 2).mean()))
            if dx == 0 and dy == 0:
                now = miss
            if miss < best[2]:
                best = (float(dx), float(dy), miss)
    return best[0], best[1], best[2], now


def register(lit_grey: np.ndarray, frame_y: np.ndarray) -> tuple[tuple[float, float, float, float], dict]:
    """Scale and offset per axis that lay the lit still on the clip's first frame."""
    h, w = frame_y.shape
    sh, sw = lit_grey.shape
    cover = max(w / sw, h / sh)
    guess = (cover, cover, cover * 0.5 - 0.5 + (w - sw * cover) / 2, cover * 0.5 - 0.5 + (h - sh * cover) / 2)
    info = {"guess": guess}
    # a. matched features, on the still shrunk to about the clip's scale
    small = cv2.resize(lit_grey, (int(round(sw * cover)), int(round(sh * cover))), interpolation=cv2.INTER_AREA)
    sift = cv2.SIFT_create(nfeatures=8000)
    k1, d1 = sift.detectAndCompute(np.clip(small, 0, 255).astype(np.uint8), None)
    k2, d2 = sift.detectAndCompute(np.clip(frame_y, 0, 255).astype(np.uint8), None)
    reg = guess
    info["matches"] = 0
    if d1 is not None and d2 is not None and len(k1) >= 20 and len(k2) >= 20:
        pairs = cv2.BFMatcher(cv2.NORM_L2).knnMatch(d1, d2, k=2)
        good = [p[0] for p in pairs if len(p) == 2 and p[0].distance < 0.7 * p[1].distance]
        if len(good) >= 20:
            fx, fy = sw / small.shape[1], sh / small.shape[0]
            p = np.array([[(k1[m.queryIdx].pt[0] + 0.5) * fx - 0.5, (k1[m.queryIdx].pt[1] + 0.5) * fy - 0.5] for m in good])
            q = np.array([k2[m.trainIdx].pt for m in good])
            sx, tx, kx = line_fit(p[:, 0], q[:, 0])
            sy, ty, ky = line_fit(p[:, 1], q[:, 1])
            keep = kx & ky
            if keep.sum() >= 12:
                res = np.hypot(q[keep, 0] - (sx * p[keep, 0] + tx), q[keep, 1] - (sy * p[keep, 1] + ty))
                reg = (sx, sy, tx, ty)
                info.update({"matches": int(keep.sum()), "match_rms": float(np.sqrt((res ** 2).mean()))})
    info["from_features"] = reg
    # b. refine on the whole picture: move the four numbers until the pictures agree best
    fb = cv2.GaussianBlur(frame_y, (0, 0), 1.5)
    ys, xs = np.mgrid[0:h, 0:w]
    edge = 12
    for _ in range(25):
        sx, sy, tx, ty = reg
        jb = cv2.GaussianBlur(to_clip(lit_grey, reg, w, h), (0, 0), 1.5)
        gx = cv2.Sobel(jb, cv2.CV_32F, 1, 0, ksize=3) / 8.0
        gy = cv2.Sobel(jb, cv2.CV_32F, 0, 1, ksize=3) / 8.0
        sel = np.zeros((h, w), dtype=bool)
        sel[edge:h - edge:2, edge:w - edge:2] = True
        j, f = jb[sel].astype(np.float64), fb[sel].astype(np.float64)
        gain, bias = np.polyfit(j, f, 1)
        r = f - (gain * j + bias)
        ok = np.abs(r) < 3 * max(float(np.std(r)), 1e-6)       # leave out what differs for other reasons
        x_still = (xs[sel] - tx) / sx
        y_still = (ys[sel] - ty) / sy
        a = np.stack([-gain * gx[sel], -gain * gx[sel] * x_still, -gain * gy[sel], -gain * gy[sel] * y_still], axis=1)
        step, *_ = np.linalg.lstsq(a[ok], r[ok], rcond=None)
        dtx, dsx, dty, dsy = (float(v) for v in step)
        reg = (sx + dsx, sy + dsy, tx + dtx, ty + dty)
        moved = max(abs(dtx) + abs(dsx) * sw, abs(dty) + abs(dsy) * sh)
        if moved < 0.003:
            break
    info["refine_last_move"] = moved
    unit = w / 1920.0
    still_clip = to_clip(lit_grey, reg, w, h)
    info["likeness"] = likeness(still_clip, frame_y, unit)
    shifts = patch_shifts(still_clip, frame_y, unit)
    info["patches"] = len(shifts)
    if len(shifts):
        mag = np.hypot(shifts[:, 2], shifts[:, 3])
        info.update({"err_median": float(np.median(mag)), "err_p90": float(np.percentile(mag, 90)),
                     "err_mean": [float(np.median(shifts[:, 2])), float(np.median(shifts[:, 3]))]})
        # control: the same measure with the still pushed 1 px sideways must read about 1 px
        pushed = patch_shifts(to_clip(lit_grey, (reg[0], reg[1], reg[2] + 1.0, reg[3]), w, h), frame_y, unit)
        info["control"] = float(abs(np.median(pushed[:, 2]))) if len(pushed) else float("nan")
    return reg, info


# ---------------------------------------------------------------- 2 and 3. the change and its mask

def build_change(lit: np.ndarray, dark: np.ndarray, reg: tuple[float, float, float, float], frame_y: np.ndarray,
                 low: float, high: float) -> tuple[np.ndarray, np.ndarray, dict]:
    """(dark - lit) in the clip's frame, inside a soft mask around the phone. Returns change (BGR), mask, facts."""
    h, w = frame_y.shape
    lit_c, dark_c = to_clip(lit, reg, w, h), to_clip(dark, reg, w, h)
    change = dark_c - lit_c
    even = np.median(change.reshape(-1, 3), axis=0)           # the even shift over the whole picture
    change = change - even
    unit = w / 1920.0
    size = np.abs(cv2.GaussianBlur(change, (0, 0), 5 * unit)).max(axis=2)
    if float(size.max()) < high:
        raise SystemExit(f"the two stills differ by at most {size.max():.1f} levels after smoothing: no lit phone found")
    n, labels = cv2.connectedComponents((size > low).astype(np.uint8), connectivity=8)
    seeds = np.unique(labels[size > high])
    area = np.isin(labels, seeds[seeds > 0]).astype(np.uint8)
    k = max(3, int(round(25 * unit)) | 1)
    area = cv2.morphologyEx(area, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k)))
    ring = cv2.copyMakeBorder(area, 1, 1, 1, 1, cv2.BORDER_CONSTANT, value=0)      # fill the holes: what the
    cv2.floodFill(ring, None, (0, 0), 2)                                           # outside cannot reach is inside
    area = (ring[1:-1, 1:-1] != 2).astype(np.uint8)
    k = max(3, int(round(31 * unit)) | 1)
    area = cv2.dilate(area, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (k, k)))
    mask = cv2.GaussianBlur(area.astype(np.float32), (0, 0), 12 * unit)
    mask = np.clip((mask - 0.03) / 0.94, 0.0, 1.0)            # exactly 0 outside, exactly 1 well inside
    # the clip is a little softer than the still: use the blur that makes the lit still fit frame 1 best
    kr, kb = COLOUR["kr"], COLOUR["kb"]
    grey_lit = lit_c @ np.array([kb, 1 - kr - kb, kr], dtype=np.float32)
    frame_full = luma_full(frame_y)
    hard = mask > 0.5
    best = (float("inf"), 0.0)
    for sigma in (0.0, 0.4, 0.7, 1.0, 1.4, 1.9, 2.5):
        g = cv2.GaussianBlur(grey_lit, (0, 0), sigma) if sigma > 0 else grey_lit
        d = (frame_full - g)[hard]
        rms = float(np.sqrt(((d - d.mean()) ** 2).mean()))
        if rms < best[0]:
            best = (rms, sigma)
    if best[1] > 0:
        change = cv2.GaussianBlur(change, (0, 0), best[1])
    ys, xs = np.nonzero(mask > 0)
    peak = np.unravel_index(int(np.argmax(size)), size.shape)
    sy_, sx_ = np.nonzero(size > high)                         # the phone itself and its brightest glow
    grow = int(round(12 * unit))
    phone_box = (int(sx_.min()) - grow, int(sy_.min()) - grow, int(sx_.max()) + 1 + grow, int(sy_.max()) + 1 + grow)
    facts = {"even": [float(v) for v in even[::-1]], "blur": best[1], "fit_rms": best[0],
             "share": float((mask > 0).mean()), "box": (int(xs.min()), int(ys.min()), int(xs.max()) + 1, int(ys.max()) + 1),
             "peak": (int(peak[1]), int(peak[0])), "strongest": float(np.abs(change).max()), "phone_box": phone_box}
    return change * mask[:, :, None], mask, facts


def to_yuv_change(change: np.ndarray) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """A change in blue, green, red (0..255) as a change in the clip's Y, U, V numbers."""
    kr, kb = COLOUR["kr"], COLOUR["kb"]
    b, g, r = change[:, :, 0], change[:, :, 1], change[:, :, 2]
    luma = kr * r + (1 - kr - kb) * g + kb * b
    y_span, c_span = (1.0, 1.0) if COLOUR["full"] else (219.0 / 255.0, 224.0 / 255.0)
    dy = luma * y_span
    du = (b - luma) / (2 * (1 - kb)) * c_span
    dv = (r - luma) / (2 * (1 - kr)) * c_span
    h, w = luma.shape
    half = (w // 2, h // 2)
    return dy, cv2.resize(du, half, interpolation=cv2.INTER_AREA), cv2.resize(dv, half, interpolation=cv2.INTER_AREA)


def level(t: float, on: float, ramp: float) -> float:
    """How much of the light is still taken away at time t: 1 before --on, eased down to 0 over --ramp."""
    if t <= on:
        return 1.0
    if ramp <= 0 or t >= on + ramp:
        return 0.0
    u = (t - on) / ramp
    return 1.0 - u * u * (3 - 2 * u)


def encoder(out: str, w: int, h: int, rate: str, crf: int, tags: dict) -> subprocess.Popen:
    """The same video settings as deliver.sh, no sound. Colour tags the input carries are passed on."""
    keep = []
    for flag, key in (("-colorspace", "color_space"), ("-color_range", "color_range"),
                      ("-color_trc", "color_transfer"), ("-color_primaries", "color_primaries")):
        if tags.get(key, "unknown") not in ("unknown", "", None):
            keep += [flag, tags[key]]
    return subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "yuv420p", "-s", f"{w}x{h}", "-r", rate,
         "-i", "-", "-an", "-vf", "setsar=1", "-c:v", "libx264", "-preset", "slow", "-crf", str(crf),
         "-pix_fmt", "yuv420p", *keep, "-movflags", "+faststart", out], stdin=subprocess.PIPE)


def psnr(sq_sum: float, count: float) -> float:
    return 99.0 if sq_sum <= 0 else 10 * math.log10(255.0 ** 2 * count / sq_sum)


# ---------------------------------------------------------------- the check picture

def check_picture(clip_in: str, clip_out: str, w: int, h: int, fps: float, on: float, ramp: float,
                  centre: tuple[int, int], out: str) -> None:
    times = [max(0.0, on - 0.3), on + 0.4 * ramp, on + ramp + 0.25]
    picks = [int(round(t * fps)) for t in times]
    cw, ch = min(w, int(round(480 * w / 1920))), min(h, int(round(360 * w / 1920)))
    x0 = int(min(max(0, centre[0] - cw // 3), w - cw))
    y0 = int(min(max(0, centre[1] - ch * 2 // 3), h - ch))
    new, old = read_rgb(clip_out, w, h, picks), read_rgb(clip_in, w, h, picks)
    zoom = 2 if cw * 2 * 3 <= 3000 else 1
    pw, ph = cw * zoom, ch * zoom
    pad, head, label_h = 8, 46, 30
    sheet = Image.new("RGB", (pad + 3 * (pw + pad), head + 2 * (ph + label_h + pad)), INK_DEEP)
    d = ImageDraw.Draw(sheet)
    d.text((pad, 10), f"phone_lightup: {Path(clip_out).name}   the light comes on at {on:.2f} s over {ramp:.2f} s   "
                      f"(the bedside table, x{zoom})", font=font(22, 700), fill=PAPER)
    for row, (frames, name) in enumerate(((new, "new clip"), (old, "the input, same frame"))):
        for col, (t, f) in enumerate(zip(times, picks)):
            if f not in frames:
                continue
            crop = Image.fromarray(frames[f][y0:y0 + ch, x0:x0 + cw]).resize((pw, ph), Image.LANCZOS)
            x, y = pad + col * (pw + pad), head + row * (ph + label_h + pad)
            sheet.paste(crop, (x, y + label_h))
            share = 1.0 - level(f / fps, on, ramp)
            state = "light off" if share == 0 else "the clip's own picture" if share == 1 else f"light {share:.0%} up"
            text = f"{name}: {f / fps:.2f} s (frame {f})" + (f", {state}" if row == 0 else "")
            d.text((x + 2, y + 3), text, font=font(19), fill=MINT if row == 0 else PAPER)
    Path(out).parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out, quality=92)


# ---------------------------------------------------------------- main

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("clip")
    ap.add_argument("out")
    ap.add_argument("--on", type=float, required=True, help="seconds into the clip where the light starts to come up")
    ap.add_argument("--ramp", type=float, default=0.25, help="seconds the light takes to come up")
    ap.add_argument("--lit", default=str(STILLS / "night-phone-lit.png"))
    ap.add_argument("--dark", default=str(STILLS / "night-phone-dark.png"))
    ap.add_argument("--check")
    ap.add_argument("--prove", action="store_true")
    ap.add_argument("--crf", type=int, default=16)
    ap.add_argument("--low", type=float, default=3.0, help="the mask reaches as far as the stills differ by this (0..255)")
    ap.add_argument("--high", type=float, default=25.0, help="the phone itself: the stills differ by at least this")
    ap.add_argument("--nudge", default="0,0", help="dx,dy in clip pixels: slide the change, if the tool says the phone sits off")
    a = ap.parse_args()
    try:
        a.nudge = tuple(float(v) for v in a.nudge.split(","))
        assert len(a.nudge) == 2
    except (ValueError, AssertionError):
        raise SystemExit("--nudge wants dx,dy, for example --nudge 0.3,-0.2")
    if a.on < 0 or a.ramp < 0:
        raise SystemExit("--on and --ramp must not be negative")
    if Path(a.out).resolve() == Path(a.clip).resolve():
        raise SystemExit("the output must not be the input")

    info = probe(a.clip)
    w, h, fps = info["w"], info["h"], info["fps"]
    if w % 2 or h % 2:
        raise SystemExit("the clip's width and height must be even")
    if info["tags"]["color_space"] == "bt709":
        COLOUR.update({"kr": 0.2126, "kb": 0.0722})
    COLOUR["full"] = info["tags"]["color_range"] in ("pc", "jpeg")
    lit, dark = cv2.imread(a.lit), cv2.imread(a.dark)
    if lit is None or dark is None:
        raise SystemExit("a still could not be read")
    if lit.shape != dark.shape:
        raise SystemExit(f"the two stills differ in size: {lit.shape[1]}x{lit.shape[0]} and {dark.shape[1]}x{dark.shape[0]}")
    lit, dark = lit.astype(np.float32), dark.astype(np.float32)

    first = next(iter(list(read_yuv(a.clip, w, h, count=1))), None)
    if first is None:
        raise SystemExit(f"no frame could be read from {a.clip}")
    frame_y = first[0].astype(np.float32)
    reg, ri = register(cv2.cvtColor(lit, cv2.COLOR_BGR2GRAY), frame_y)
    sx, sy, tx, ty = reg
    if a.nudge != (0.0, 0.0):
        reg = (sx, sy, tx + a.nudge[0], ty + a.nudge[1])
    say(f"{a.clip}: {w}x{h}, {info['rate']} fps; stills {lit.shape[1]}x{lit.shape[0]}; colour read as "
        f"{'BT.709' if COLOUR['kr'] < 0.25 else 'BT.601'}, {'full' if COLOUR['full'] else 'video'} range "
        f"(the clip's tag: {info['tags']['color_space']})")
    say("registration of the lit still to frame 0 (clip x = scale x still x + offset, pixel middles):")
    say(f"  scale {sx:.6f} across, {sy:.6f} down; offset {tx:+.3f}, {ty:+.3f} px  "
        f"(from {ri['matches']} matched features, off by {ri.get('match_rms', float('nan')):.2f} px rms, then refined)")
    g = ri["guess"]
    say(f"  (for comparison, the still simply scaled to cover the frame: scale {g[0]:.6f}, offset {g[2]:+.3f}, {g[3]:+.3f})")
    say(f"  likeness of the fine detail, still on frame 0: {ri['likeness']:.2f} (1 is the same picture, 0 nothing in common)")
    if ri["likeness"] < 0.3:
        raise SystemExit("the lit still does not show what the clip's first frame shows: wrong still or wrong clip. Nothing written.")
    if ri["patches"]:
        say(f"  error: over {ri['patches']} patches with detail, the frame sits {ri['err_median']:.2f} px (median) from the still, "
            f"90% under {ri['err_p90']:.2f} px; as a whole it is off by {ri['err_mean'][0]:+.2f}, {ri['err_mean'][1]:+.2f} px "
            f"(the rest is the clip's own small local wobble)")
        say(f"  control: the same measure with the still pushed 1 px sideways reads {ri['control']:.2f} px")
        if ri["err_median"] > 0.75:
            say("  WARNING: the still does not sit well on the clip (over 0.75 px): look at the check picture")
    else:
        say("  WARNING: the error could not be measured (no patch with enough detail)")

    change, mask, facts = build_change(lit, dark, reg, frame_y, a.low, a.high)
    bx0, by0, bx1, by1 = facts["box"]
    say(f"the change: an even shift of {facts['even'][0]:+.1f}, {facts['even'][1]:+.1f}, {facts['even'][2]:+.1f} "
        f"(red, green, blue; dark still against lit) taken out; softened by {facts['blur']:.1f} px to match the clip")
    say(f"the mask: {facts['share']:.1%} of the frame, inside x {bx0}..{bx1}, y {by0}..{by1}; "
        f"the phone is at {facts['peak'][0]},{facts['peak'][1]}; strongest change {facts['strongest']:.0f} levels")
    ndx, ndy, fit_best, fit_now = best_nudge(to_clip(cv2.cvtColor(lit, cv2.COLOR_BGR2GRAY), reg, w, h), frame_y,
                                             facts["phone_box"], facts["blur"])
    say(f"  round the phone itself the still fits frame 0 best when slid by {ndx:+.1f}, {ndy:+.1f} px "
        f"(misfit {fit_best:.2f} levels there, {fit_now:.2f} as it is)")
    if max(abs(ndx), abs(ndy)) >= 0.3 and fit_best < 0.95 * fit_now:
        say(f"  that is a real gain: try again with --nudge {ndx + a.nudge[0]:+.1f},{ndy + a.nudge[1]:+.1f}")
    dy, du, dv = to_yuv_change(change)
    my = mask > 0
    mc = cv2.resize(my.astype(np.uint8), (w // 2, h // 2), interpolation=cv2.INTER_AREA) > 0   # any of the four pixels
    mc = cv2.dilate(mc.astype(np.uint8), np.ones((3, 3), np.uint8)) > 0
    du, dv = np.where(mc, du, 0.0), np.where(mc, dv, 0.0)
    dy = np.where(my, dy, 0.0)

    ramp_end = a.on + a.ramp
    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    enc = encoder(a.out, w, h, info["rate"], a.crf, info["tags"])
    n = changed_frames = 0
    outside_changed = after_changed = 0
    moved = moved_phone = 0.0
    y0f = first[0][by0:by1, bx0:bx1].astype(np.int16)
    near = np.zeros((h, w), dtype=bool)                       # a box round the phone, inside the mask
    reach_x, reach_y = int(round(110 * w / 1920)), int(round(45 * w / 1920))
    near[max(0, facts["peak"][1] - reach_y):facts["peak"][1] + reach_y, max(0, facts["peak"][0] - reach_x):facts["peak"][0] + reach_x] = True
    near = (near & my)[by0:by1, bx0:bx1]
    for t, (y, u, v) in enumerate(read_yuv(a.clip, w, h)):
        k = level(t / fps, a.on, a.ramp)
        if k > 0:
            ny = np.clip(np.rint(y + k * dy), 0, 255).astype(np.uint8)
            nu = np.clip(np.rint(u + k * du), 0, 255).astype(np.uint8)
            nv = np.clip(np.rint(v + k * dv), 0, 255).astype(np.uint8)
            changed_frames += 1
            outside_changed += int((ny != y)[~my].sum()) + int((nu != u)[~mc].sum()) + int((nv != v)[~mc].sum())
            drift = np.abs(y[by0:by1, bx0:bx1].astype(np.int16) - y0f)
            moved = max(moved, float(drift[my[by0:by1, bx0:bx1]].mean()))
            moved_phone = max(moved_phone, float(drift[near].mean()) if near.any() else 0.0)
        else:
            ny, nu, nv = y, u, v
            after_changed += int((ny != y).sum()) + int((nu != u).sum()) + int((nv != v).sum())
        enc.stdin.write(ny.tobytes())
        enc.stdin.write(nu.tobytes())
        enc.stdin.write(nv.tobytes())
        n += 1
    enc.stdin.close()
    if enc.wait() != 0:
        raise SystemExit("ffmpeg could not write the output")
    first_own = next((t for t in range(n) if level(t / fps, a.on, a.ramp) == 0), n)
    say(f"frames: {n}; light off in frames 0 to {int(math.floor(a.on * fps + 1e-9))}, coming up until frame {first_own - 1}, "
        f"the clip's own picture from frame {first_own} ({first_own / fps:.3f} s); {changed_frames} frames changed")
    say(f"before the encode (exact): samples changed outside the mask in the changed frames: {outside_changed}; "
        f"samples changed in the {n - changed_frames} frames after the ramp: {after_changed}")
    say(f"while the change is on, the clip's own picture drifts from frame 0 by up to {moved:.1f} levels (mean) inside "
        f"the mask and {moved_phone:.1f} round the phone (the change was measured on a still picture: small is good)")
    say(f"wrote {a.out}")

    if a.prove:
        with tempfile.TemporaryDirectory() as tmp:
            control = str(Path(tmp) / "control.mp4")
            enc = encoder(control, w, h, info["rate"], a.crf, info["tags"])
            for y, u, v in read_yuv(a.clip, w, h):
                enc.stdin.write(y.tobytes())
                enc.stdin.write(u.tobytes())
                enc.stdin.write(v.tobytes())
            enc.stdin.close()
            enc.wait()
            rows = {}
            for name, path in (("new clip", a.out), ("control", control)):
                acc = {"out": [0.0, 0.0, 0], "after": [0.0, 0.0, 0]}
                for t, ((y, _, _), (oy, _, _)) in enumerate(zip(read_yuv(a.clip, w, h), read_yuv(path, w, h))):
                    d = oy.astype(np.int16) - y.astype(np.int16)
                    if t < first_own:
                        part, key = d[~my], "out"
                    else:
                        part, key = d.ravel(), "after"
                    acc[key][0] += float((part.astype(np.float64) ** 2).sum())
                    acc[key][1] += float(part.size)
                    acc[key][2] = max(acc[key][2], int(np.abs(part).max()))
                rows[name] = acc
        say("after the encode (brightness plane, against the input; the control is the untouched input encoded the same way):")
        for key, label in (("out", f"outside the mask, frames 0 to {first_own - 1}"), ("after", f"whole picture, frames {first_own} to {n - 1}")):
            new, con = rows["new clip"][key], rows["control"][key]
            say(f"  {label}: new clip PSNR {psnr(new[0], new[1]):.2f} dB (worst sample off by {new[2]}); "
                f"control PSNR {psnr(con[0], con[1]):.2f} dB (worst {con[2]})")

    if a.check:
        check_picture(a.clip, a.out, w, h, fps, a.on, a.ramp, facts["peak"], a.check)
        say(f"wrote {a.check}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
