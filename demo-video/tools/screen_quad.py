#!/usr/bin/env -S uv run --quiet --python 3.12 --script
# /// script
# requires-python = ">=3.10,<3.13"
# dependencies = ["numpy>=1.26", "opencv-python-headless>=4.9", "pillow>=10"]
# ///
r"""screen_quad: the four corners of the open laptop's lit screen in the LAST frame of a clip.

    uv run --quiet --python 3.12 demo-video/tools/screen_quad.py CLIP.mp4 \
        [--still OUT.png] [--check CHECK.jpg] [--roi x0,y0,x1,y1] > screen-quad.json

It prints one JSON list, `[[x,y],[x,y],[x,y],[x,y]]`: the corners of the plain white glowing
screen, clockwise from the top left, as fractions of the frame (0,0 is the top left corner of
the picture, 1,1 the bottom right corner; a pixel's middle is half a pixel in). Only the list
goes to standard output; everything else (what it found, how well the edges fit) goes to
standard error, so the output can be sent straight into a file.

  --still OUT.png   save that last frame as a PNG (the clip's own size, nothing drawn on it)
  --check CHECK.jpg one picture to judge the corners by eye: the whole frame with the outline,
                    the screen enlarged with the outline, and the screen stretched flat with a
                    margin (right corners give a straight white rectangle that fills the ticks)
  --roi x0,y0,x1,y1 look only inside this part of the frame (fractions), if it picks the wrong
                    bright thing (a window, a lamp)

How: the screen is the bright near-white patch whose shape is closest to a four-sided figure.
Its corners are then placed finer than a pixel: along each side the picture's brightness is read
across the edge, the place where it falls half-way from screen to surround is taken as the edge,
a straight line is fitted through those places (points hidden by a hand are thrown out), and
the corners are where neighbouring lines cross. Nothing is sent anywhere and nothing is paid.

It always answers with the best bright four-sided patch it can find. If the last frame has no
lit screen it will outline something else (a lit phone, a window pane) and print a WARNING:
read the standard error and look at the check picture.
"""
from __future__ import annotations

import argparse
import json
import math
import subprocess
import sys
from pathlib import Path

import cv2
import numpy as np
from PIL import Image, ImageDraw, ImageFont

INK_DEEP = (12, 26, 30)
PAPER = (246, 244, 238)
MINT = (183, 244, 207)
RED = (255, 77, 77)
FONT_FILE = Path(__file__).resolve().parent / "fonts" / "Manrope[wght].ttf"
FALLBACKS = ["/System/Library/Fonts/Helvetica.ttc", "/System/Library/Fonts/Supplemental/Arial.ttf"]


def say(*parts: object) -> None:
    print(*parts, file=sys.stderr, flush=True)


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


def probe(clip: str) -> tuple[int, int]:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height",
         "-of", "json", clip], capture_output=True, text=True, check=True)
    s = json.loads(out.stdout)["streams"][0]
    return int(s["width"]), int(s["height"])


def last_frame(clip: str) -> tuple[np.ndarray, int]:
    """Decode the whole clip and keep its last frame (sure to be the last, whatever the file says)."""
    w, h = probe(clip)
    reader = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-i", clip, "-f", "rawvideo", "-pix_fmt", "bgr24", "-"],
        stdout=subprocess.PIPE)
    size = w * h * 3
    last, n = None, 0
    while True:
        buf = reader.stdout.read(size)
        if len(buf) < size:
            break
        last, n = buf, n + 1
    reader.stdout.close()
    reader.wait()
    if last is None:
        raise SystemExit(f"no frame could be read from {clip}")
    return np.frombuffer(last, dtype=np.uint8).reshape(h, w, 3).copy(), n


def approx_quad(hull: np.ndarray) -> np.ndarray | None:
    """The convex outline boiled down to four corners, or None if it will not go to four."""
    peri = cv2.arcLength(hull, True)
    for k in np.linspace(0.01, 0.15, 29):
        ap = cv2.approxPolyDP(hull, float(k) * peri, True)
        if len(ap) == 4:
            return ap.reshape(4, 2).astype(np.float64)
        if len(ap) < 4:
            break
    return None


def clockwise_from_top_left(quad: np.ndarray) -> np.ndarray:
    """Order four corners clockwise as seen on the picture, starting with the upper left one."""
    c = quad.mean(axis=0)
    ang = np.arctan2(quad[:, 1] - c[1], quad[:, 0] - c[0])   # y runs down: rising angle is clockwise
    q = quad[np.argsort(ang)]
    upper = np.argsort(q[:, 1])[:2]                         # the two highest corners
    start = int(upper[np.argmin(q[upper, 0])])              # of those, the left one
    return np.roll(q, -start, axis=0)


def find_screen(bgr: np.ndarray, roi: tuple[float, float, float, float]) -> tuple[np.ndarray, dict]:
    """The bright near-white patch that looks most like a four-sided figure: its rough corners."""
    h, w = bgr.shape[:2]
    x0, y0 = int(round(roi[0] * w)), int(round(roi[1] * h))
    x1, y1 = int(round(roi[2] * w)), int(round(roi[3] * h))
    white = bgr.min(axis=2)[y0:y1, x0:x1]          # high only where red, green and blue are all high
    grey = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY)[y0:y1, x0:x1]
    top = float(np.percentile(white, 99.9))
    min_area = max(60, int(0.00015 * w * h))
    found: list[dict] = []
    for share in (0.8, 0.7, 0.9):                  # the cut between "screen" and "not", as a share of the top
        thr = max(120.0, share * top)
        mask = (white >= thr).astype(np.uint8)
        mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((3, 3), np.uint8))
        n, labels, stats, _ = cv2.connectedComponentsWithStats(mask, connectivity=8)
        for i in range(1, n):
            bx, by, bw, bh, area = (int(v) for v in stats[i])
            if area < min_area:
                continue
            comp = (labels[by:by + bh, bx:bx + bw] == i).astype(np.uint8)
            cnts, _ = cv2.findContours(comp, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_NONE)
            cnt = max(cnts, key=cv2.contourArea)
            quad = approx_quad(cv2.convexHull(cnt))
            if quad is None:
                continue
            qm = np.zeros_like(comp)
            cv2.fillConvexPoly(qm, np.round(quad).astype(np.int32), 1)
            both = int((qm & comp).sum())
            either = int((qm | comp).sum())
            fit = both / max(either, 1)             # 1.0: the patch is exactly its four-sided outline
            inside = comp > 0
            level = float(white[by:by + bh, bx:bx + bw][inside].mean())
            spread = float(grey[by:by + bh, bx:bx + bw][inside].std())
            edge = bx == 0 or by == 0 or bx + bw >= (x1 - x0) or by + bh >= (y1 - y0)
            score = (fit ** 6) * math.sqrt(area) * (level / 255.0) / (1.0 + spread / 12.0)
            if edge:
                score *= 0.25                       # a patch cut by the frame is rarely the screen
            found.append({"quad": quad + np.array([bx + x0, by + y0], dtype=np.float64), "area": area,
                          "fit": fit, "level": level, "spread": spread, "score": score, "thr": thr})
        if any(f["fit"] >= 0.85 for f in found):
            break
    if not found:
        raise SystemExit("no bright near-white patch found: is the screen lit in the last frame? try --roi")
    found.sort(key=lambda f: -f["score"])
    say(f"bright near-white patches (cut at {found[0]['thr']:.0f} of 255), best first:")
    for f in found[:6]:
        c = f["quad"].mean(axis=0)
        say(f"  middle {c[0] / w:.3f},{c[1] / h:.3f}  area {f['area']} px  four-sided fit {f['fit']:.2f}  "
            f"white level {f['level']:.0f}  unevenness {f['spread']:.1f}  score {f['score']:.1f}")
    best = found[0]
    if best["fit"] < 0.9:
        say(f"WARNING: the best patch is not a clean four-sided figure (fit {best['fit']:.2f}): is the screen lit "
            f"and in view? check the picture")
    return clockwise_from_top_left(best["quad"]), best


def sample(grey: np.ndarray, pts: np.ndarray) -> np.ndarray:
    """Brightness at fractional pixel places (x, y), by bilinear interpolation."""
    mx = pts[:, 0].astype(np.float32).reshape(-1, 1)
    my = pts[:, 1].astype(np.float32).reshape(-1, 1)
    return cv2.remap(grey, mx, my, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REPLICATE).ravel()


def edge_points(grey: np.ndarray, a: np.ndarray, b: np.ndarray, reach: float,
                min_contrast: float) -> np.ndarray:
    """Places along the side a->b where the brightness falls half-way from screen to surround."""
    d = b - a
    length = float(np.hypot(d[0], d[1]))
    t = d / length
    n = np.array([t[1], -t[0]])                     # points out of the screen (corners run clockwise)
    us = np.arange(0.12 * length, 0.88 * length + 1e-6, 1.0)
    step = 0.25
    ss = np.arange(-reach, reach + 1e-6, step)
    grid = a[None, None, :] + us[:, None, None] * t[None, None, :] + ss[None, :, None] * n[None, None, :]
    vals = sample(grey, grid.reshape(-1, 2)).reshape(len(us), len(ss))
    k = max(2, len(ss) // 4)
    inner = vals[:, :k].mean(axis=1)
    outer = vals[:, -k:].mean(axis=1)
    pts = []
    for i in range(len(us)):
        if inner[i] - outer[i] < min_contrast:
            continue                                 # no clear edge here (a hand, a reflection)
        mid = 0.5 * (inner[i] + outer[i])
        row = vals[i]
        cross = np.nonzero((row[:-1] >= mid) & (row[1:] < mid))[0]
        if len(cross) != 1:
            continue                                 # not one clean fall: skip
        j = int(cross[0])
        s = ss[j] + step * (row[j] - mid) / max(row[j] - row[j + 1], 1e-6)
        pts.append(a + us[i] * t + s * n)
    return np.array(pts, dtype=np.float64).reshape(-1, 2)


def fit_line(pts: np.ndarray) -> tuple[np.ndarray, np.ndarray, float, int]:
    """A straight line through the points, throwing out the ones that sit off it. (point, direction, rms, kept)."""
    keep = np.ones(len(pts), dtype=bool)
    c = pts.mean(axis=0)
    direction = np.array([1.0, 0.0])
    res = np.zeros(len(pts))
    for _ in range(6):
        c = pts[keep].mean(axis=0)
        _, _, vt = np.linalg.svd(pts[keep] - c)
        direction, normal = vt[0], vt[1]
        res = (pts - c) @ normal
        sigma = 1.4826 * float(np.median(np.abs(res[keep] - np.median(res[keep]))))
        new = np.abs(res) <= max(2.5 * sigma, 0.35)
        if new.sum() < 4 or (new == keep).all():
            break
        keep = new
    rms = float(np.sqrt(np.mean(res[keep] ** 2)))
    return c, direction, rms, int(keep.sum())


def cross_point(p1: np.ndarray, d1: np.ndarray, p2: np.ndarray, d2: np.ndarray) -> np.ndarray:
    m = np.array([[d1[0], -d2[0]], [d1[1], -d2[1]]])
    lam = np.linalg.solve(m, p2 - p1)
    return p1 + lam[0] * d1


def refine(grey: np.ndarray, quad: np.ndarray, level_in: float) -> tuple[np.ndarray, list[dict]]:
    """Move the rough corners onto the true edges, finer than a pixel."""
    report: list[dict] = []
    for turn, reach in enumerate((8.0, 6.0, 5.0)):
        sides = [float(np.hypot(*(quad[(i + 1) % 4] - quad[i]))) for i in range(4)]
        reach = min(reach, max(3.0, 0.3 * min(sides)))
        lines = []
        report = []
        for i in range(4):
            a, b = quad[i], quad[(i + 1) % 4]
            pts = edge_points(grey, a, b, reach, min_contrast=0.2 * level_in)
            if len(pts) < 5:
                if turn == 2:
                    say(f"WARNING: side {i + 1} has too few clear edge points ({len(pts)}): its rough line is kept")
                d = (b - a) / np.hypot(*(b - a))
                lines.append((a, d))
                report.append({"side": i + 1, "points": len(pts), "kept": 0, "rms": float("nan")})
                continue
            c, d, rms, kept = fit_line(pts)
            lines.append((c, d))
            report.append({"side": i + 1, "points": len(pts), "kept": kept, "rms": rms})
        quad = np.array([cross_point(*lines[(i - 1) % 4], *lines[i]) for i in range(4)])
    return quad, report


def draw_poly(draw: ImageDraw.ImageDraw, pts: list[tuple[float, float]], colour: tuple[int, int, int],
              width: int) -> None:
    for i in range(len(pts)):
        draw.line([pts[i], pts[(i + 1) % len(pts)]], fill=colour, width=width)


def check_picture(bgr: np.ndarray, quad: np.ndarray, out: str, title: str) -> None:
    """Whole frame with the outline, the screen enlarged with the outline, and the screen stretched flat."""
    h, w = bgr.shape[:2]
    rgb = np.ascontiguousarray(bgr[:, :, ::-1])
    pad, head, panel_h = 16, 54, 620
    # 1: the whole frame
    aw = int(round(panel_h * w / h))
    whole = Image.fromarray(rgb).resize((aw, panel_h), Image.LANCZOS)
    s = aw / w
    d = ImageDraw.Draw(whole)
    draw_poly(d, [((x + 0.5) * s - 0.5, (y + 0.5) * s - 0.5) for x, y in quad], RED, 2)
    # 2: the screen enlarged
    qx0, qy0 = quad.min(axis=0)
    qx1, qy1 = quad.max(axis=0)
    mx, my = 0.22 * (qx1 - qx0) + 6, 0.22 * (qy1 - qy0) + 6
    cx0, cy0 = max(0, int(math.floor(qx0 - mx))), max(0, int(math.floor(qy0 - my)))
    cx1, cy1 = min(w, int(math.ceil(qx1 + mx)) + 1), min(h, int(math.ceil(qy1 + my)) + 1)
    z = max(2, min(int(panel_h // (cy1 - cy0)), int(900 // (cx1 - cx0))))
    crop = Image.fromarray(rgb[cy0:cy1, cx0:cx1]).resize(((cx1 - cx0) * z, (cy1 - cy0) * z), Image.LANCZOS)
    d = ImageDraw.Draw(crop)
    zq = [((x + 0.5 - cx0) * z - 0.5, (y + 0.5 - cy0) * z - 0.5) for x, y in quad]
    draw_poly(d, zq, RED, 1)
    f_small = font(20)
    for i, (x, y) in enumerate(zq):
        d.ellipse([x - 4, y - 4, x + 4, y + 4], outline=MINT, width=1)
        ox = -20 if i in (0, 3) else 10
        oy = -26 if i in (0, 1) else 6
        d.text((x + ox, y + oy), str(i + 1), font=f_small, fill=MINT)
    # 3: the screen stretched flat, with a margin all round (16:10 assumed, only for the eye)
    fw, fh = 400, 250
    m = 50
    dst = np.array([[m, m], [m + fw, m], [m + fw, m + fh], [m, m + fh]], dtype=np.float32) - 0.5
    hom = cv2.getPerspectiveTransform(quad.astype(np.float32), dst)
    flat = cv2.warpPerspective(rgb, hom, (fw + 2 * m, fh + 2 * m), flags=cv2.INTER_LANCZOS4,
                               borderMode=cv2.BORDER_REPLICATE)
    flat_im = Image.fromarray(flat)
    d = ImageDraw.Draw(flat_im)
    for (x, y), (dx, dy) in zip([(m, m), (m + fw, m), (m + fw, m + fh), (m, m + fh)],
                                [(-1, -1), (1, -1), (1, 1), (-1, 1)]):
        d.line([(x + dx * 4, y), (x + dx * 26, y)], fill=RED, width=1)     # ticks point away from the screen
        d.line([(x, y + dy * 4), (x, y + dy * 26)], fill=RED, width=1)
    total_w = pad + whole.width + pad + crop.width + pad + flat_im.width + pad
    sheet = Image.new("RGB", (total_w, head + panel_h + pad + 34), INK_DEEP)
    d = ImageDraw.Draw(sheet)
    d.text((pad, 12), title, font=font(24, 700), fill=PAPER)
    x = pad
    sheet.paste(whole, (x, head))
    d.text((x, head + panel_h + 8), "the last frame, the screen outlined", font=font(18), fill=MINT)
    x += whole.width + pad
    sheet.paste(crop, (x, head))
    d.text((x, head + panel_h + 8), f"the screen x{z}: corners 1 to 4", font=font(18), fill=MINT)
    x += crop.width + pad
    sheet.paste(flat_im, (x, head))
    d.text((x, head + flat_im.height + 8), "stretched flat: the white should", font=font(18), fill=MINT)
    d.text((x, head + flat_im.height + 32), "end exactly at the red ticks", font=font(18), fill=MINT)
    Path(out).parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out, quality=92)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("clip")
    ap.add_argument("--still", help="save the last frame as a PNG")
    ap.add_argument("--check", help="write a picture with the corners and the outline drawn")
    ap.add_argument("--roi", default="0,0,1,1", help="x0,y0,x1,y1 as fractions: look only here")
    a = ap.parse_args()
    roi = tuple(float(v) for v in a.roi.split(","))
    if len(roi) != 4 or not (0 <= roi[0] < roi[2] <= 1 and 0 <= roi[1] < roi[3] <= 1):
        raise SystemExit("--roi wants x0,y0,x1,y1 as fractions, with x0 < x1 and y0 < y1")

    bgr, n = last_frame(a.clip)
    h, w = bgr.shape[:2]
    say(f"{a.clip}: {n} frames, {w}x{h}; working on frame {n - 1} (the last)")
    if a.still:
        Path(a.still).parent.mkdir(parents=True, exist_ok=True)
        cv2.imwrite(a.still, bgr)
        say(f"wrote {a.still}")

    rough, best = find_screen(bgr, roi)
    grey = cv2.cvtColor(bgr, cv2.COLOR_BGR2GRAY).astype(np.float32)
    quad, report = refine(grey, rough, best["level"])
    quad = clockwise_from_top_left(quad)
    moved = float(np.abs(quad - rough).max())
    for r in report:
        say(f"  side {r['side']}: {r['kept']} of {r['points']} edge points kept, "
            f"they sit {r['rms']:.2f} px (rms) off the fitted line")
    say(f"  corners moved by at most {moved:.1f} px from the rough outline")
    if moved > 10:
        say("WARNING: the fine corners sit far from the rough ones: check the picture")
    inside = np.zeros((h, w), dtype=np.uint8)
    cv2.fillConvexPoly(inside, np.round(quad).astype(np.int32), 1)
    lum = grey[inside > 0]
    say(f"  inside the outline: {int(inside.sum())} px, brightness {lum.mean():.0f} of 255 "
        f"(darkest 1%: {np.percentile(lum, 1):.0f})")
    say("  corners in pixels (the frame's top left corner is 0,0): "
        + "  ".join(f"{x + 0.5:.2f},{y + 0.5:.2f}" for x, y in quad))

    out = [[round((float(x) + 0.5) / w, 5), round((float(y) + 0.5) / h, 5)] for x, y in quad]
    if a.check:
        check_picture(bgr, quad, a.check, f"screen_quad: {Path(a.clip).name}, frame {n - 1} (the last)")
        say(f"wrote {a.check}")
    print(json.dumps(out))
    return 0


if __name__ == "__main__":
    sys.exit(main())
