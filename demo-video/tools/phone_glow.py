#!/usr/bin/env -S uv run --quiet --python 3.12 --script
# /// script
# requires-python = ">=3.10,<3.13"
# dependencies = ["numpy>=1.26", "opencv-python-headless>=4.9"]
# ///
r"""phone_glow: the dark phone on the bedside table of the sleeper close-up lights up, by code.

    uv run --quiet --python 3.12 demo-video/tools/phone_glow.py CLIP.mp4 OUT.mp4 --on 3.5 \
        [--ramp 0.15] [--ref 3.3] [--preview DIR --at 3.4,3.6,4.0]

Draft 3 (V20, concept A): the Peer streams out of Ram's phone, so the phone must read as the
source. In the close-up (hook-sleeper) the phone is dark and out of focus, and the camera drifts
in slowly. This tool, on this Mac (nothing sent, nothing paid):
 1. finds the phone in a reference frame (--ref, clip seconds): the largest dark shape on the
    table (luma under 45);
 2. follows the camera from that frame to each later frame with an affine fit of the area round
    the phone (OpenCV's ECC), and moves the phone's shape with it;
 3. from --on, over --ramp seconds, lights the phone's top face (its screen, seen at a low angle)
    mint-white, softened like the lens softens the phone, and adds a bloom round it and a soft
    mint light on the table and the pillow's edge (screen blend, so nothing clips);
 4. writes the whole clip again (H.264, yuv420p, crf 16, preset slow, faststart, its own frame
    rate, no sound). Frames before --on are the clip's own pictures, re-encoded.
--preview writes full-size crops round the phone and whole frames at the --at times.
"""
from __future__ import annotations

import argparse
import subprocess
from pathlib import Path

import cv2
import numpy as np

ROI = (40, 760, 820, 1080)          # x0, y0, x1, y1: the area round the phone that the fit uses
SCREEN_BGR = np.array([240, 255, 214], np.float32)   # mint-white light of the screen
MINT_BGR = np.array([207, 244, 183], np.float32)     # the product's mint (#b7f4cf)


def ease(k: float) -> float:
    k = min(1.0, max(0.0, k))
    return k * k * (3 - 2 * k)


def phone_mask(frame: np.ndarray) -> tuple[np.ndarray, tuple[int, int, int, int]]:
    x0, y0, x1, y1 = ROI
    g = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)[y0:y1, x0:x1]
    m = (g < 45).astype(np.uint8)
    n, lab, st, _ = cv2.connectedComponentsWithStats(m)
    best = max(range(1, n), key=lambda i: st[i, cv2.CC_STAT_AREA])
    x, y, w, h, a = st[best]
    if a < 8000:
        raise SystemExit(f"no phone found in the reference frame (largest dark shape {a} px)")
    full = np.zeros(frame.shape[:2], np.float32)
    full[y0:y1, x0:x1] = (lab == best).astype(np.float32)
    return full, (x + x0, y + y0, w, h)


def screen_layers(mask: np.ndarray, box: tuple[int, int, int, int], shape) -> tuple[np.ndarray, np.ndarray]:
    """The screen (where the phone's top face emits) and the light round it, in the reference frame."""
    x, y, w, h = box
    # the top face: the phone's shape, holes closed, without its rim and its front edge (the lowest
    # fifth of it: a pixel is kept only if the pixel that far below it is phone too)
    shut = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (25, 25)))
    core = cv2.erode(shut, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (9, 9)))
    k = max(1, int(h * 0.2))
    below = np.zeros_like(core)
    below[:-k] = core[k:]
    face = core * below
    face = cv2.GaussianBlur(face, (0, 0), 5.0)       # the lens softens it as it softens the phone
    # brighter in the middle of the screen, a little dimmer to its ends
    xs = np.arange(shape[1], dtype=np.float32)
    along = np.clip(1 - ((xs - (x + w / 2)) / (w * 0.75)) ** 2, 0.8, 1.0)[None, :]
    screen = np.clip(face * along, 0, 1)
    # the light it throws: a halo and a wide soft pool on the table and the pillow's edge
    yy, xx = np.mgrid[0: shape[0], 0: shape[1]].astype(np.float32)
    cx, cy = x + w * 0.5, y + h * 0.15
    halo = np.exp(-(((xx - cx) / (w * 0.48)) ** 2 + ((yy - cy) / (h * 1.2)) ** 2))
    pool = np.exp(-(((xx - cx) / (w * 1.2)) ** 2 + ((yy - (cy - h * 1.0)) / (h * 3.0)) ** 2))
    light = 0.45 * halo + 0.30 * pool
    bloom = cv2.GaussianBlur(screen, (0, 0), 10) * 0.9 + cv2.GaussianBlur(screen, (0, 0), 35) * 0.7 + cv2.GaussianBlur(screen, (0, 0), 90) * 0.5
    return screen, np.clip(light + bloom, 0, 1)


def follow(ref_gray: np.ndarray, gray: np.ndarray, warp: np.ndarray) -> np.ndarray:
    x0, y0, x1, y1 = ROI
    crit = (cv2.TERM_CRITERIA_EPS | cv2.TERM_CRITERIA_COUNT, 200, 1e-6)
    _, warp = cv2.findTransformECC(ref_gray[y0:y1, x0:x1], gray[y0:y1, x0:x1], warp, cv2.MOTION_AFFINE, crit, None, 5)
    return warp


def to_frame(layer: np.ndarray, warp: np.ndarray, shape) -> np.ndarray:
    """Move a layer drawn in the reference frame to a later frame (the warp is in ROI coordinates)."""
    x0, y0 = ROI[0], ROI[1]
    t1 = np.array([[1, 0, -x0], [0, 1, -y0], [0, 0, 1]], np.float32)
    t2 = np.array([[1, 0, x0], [0, 1, y0], [0, 0, 1]], np.float32)
    w3 = np.vstack([warp, [0, 0, 1]]).astype(np.float32)
    full = (t2 @ w3 @ t1)[:2]
    return cv2.warpAffine(layer, full, (shape[1], shape[0]), flags=cv2.INTER_LINEAR, borderValue=0)


def light(frame: np.ndarray, screen: np.ndarray, glow: np.ndarray, k: float) -> np.ndarray:
    f = frame.astype(np.float32) / 255.0
    s = (screen * k)[..., None]
    g = (glow * k)[..., None]
    out = f * (1 - s) + (SCREEN_BGR / 255.0) * s                  # the screen emits: it replaces the dark glass
    out = 1 - (1 - out) * (1 - g * (MINT_BGR / 255.0))            # its light: a screen blend, nothing clips
    return np.clip(out * 255.0 + 0.5, 0, 255).astype(np.uint8)


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("clip"); ap.add_argument("out")
    ap.add_argument("--on", type=float, required=True, help="clip seconds where the light starts")
    ap.add_argument("--ramp", type=float, default=0.15)
    ap.add_argument("--ref", type=float, default=3.3, help="clip seconds of the reference frame")
    ap.add_argument("--preview"); ap.add_argument("--at", default="")
    a = ap.parse_args()
    cap = cv2.VideoCapture(a.clip)
    fps = cap.get(cv2.CAP_PROP_FPS)
    frames = []
    while True:
        ok, im = cap.read()
        if not ok:
            break
        frames.append(im)
    h, w = frames[0].shape[:2]
    ref_i = round(a.ref * fps)
    ref = frames[ref_i]
    mask, box = phone_mask(ref)
    print(f"phone in the reference frame {ref_i}: x {box[0]}..{box[0]+box[2]}, y {box[1]}..{box[1]+box[3]}")
    screen0, glow0 = screen_layers(mask, box, (h, w))
    grays = [cv2.cvtColor(f, cv2.COLOR_BGR2GRAY).astype(np.float32) for f in frames]
    on_i = int(np.floor(a.on * fps))
    warps = {ref_i: np.eye(2, 3, dtype=np.float32)}
    for i in range(ref_i + 1, len(frames)):          # forward from the reference, each fit seeded by the last
        warps[i] = follow(grays[ref_i], grays[i], warps[i - 1].copy())
    for i in range(ref_i - 1, max(0, on_i - 2) - 1, -1):
        warps[i] = follow(grays[ref_i], grays[i], warps[i + 1].copy())
    last = warps[len(frames) - 1]
    print(f"camera from frame {ref_i} to the last: shift {last[0,2]:.1f}, {last[1,2]:.1f} px, scale {last[0,0]:.4f}")
    out_frames = []
    for i, f in enumerate(frames):
        t = i / fps
        k = ease((t - a.on) / a.ramp) if t >= a.on else 0.0
        if k <= 0:
            out_frames.append(f); continue
        s = to_frame(screen0, warps[i], (h, w)); g = to_frame(glow0, warps[i], (h, w))
        out_frames.append(light(f, s, g, k))
    if a.preview:
        pv = Path(a.preview); pv.mkdir(parents=True, exist_ok=True)
        for t in [float(x) for x in a.at.split(",") if x]:
            i = min(len(frames) - 1, round(t * fps))
            cv2.imwrite(str(pv / f"crop-{t:.2f}.png"), out_frames[i][700:1080, 0:900])
            cv2.imwrite(str(pv / f"frame-{t:.2f}.png"), cv2.resize(out_frames[i], (640, 360), interpolation=cv2.INTER_AREA))
    cmd = ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "bgr24", "-s", f"{w}x{h}", "-r", f"{fps}",
           "-i", "-", "-c:v", "libx264", "-preset", "slow", "-crf", "16", "-pix_fmt", "yuv420p",
           "-movflags", "+faststart", "-an", a.out]
    p = subprocess.Popen(cmd, stdin=subprocess.PIPE)
    for f in out_frames:
        p.stdin.write(f.tobytes())
    p.stdin.close()
    if p.wait() != 0:
        raise SystemExit("ffmpeg failed")
    print(f"wrote {a.out}: {len(out_frames)} frames at {fps} fps, light from {a.on} s")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
