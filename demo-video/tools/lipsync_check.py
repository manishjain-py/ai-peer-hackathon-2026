#!/usr/bin/env -S uv run --quiet --script
# /// script
# requires-python = ">=3.10,<3.13"
# dependencies = ["mediapipe==0.10.21", "numpy<2", "matplotlib>=3.8", "pillow>=10"]
# ///
"""lipsync_check: does the mouth in a clip move with the sound?

Run it from a scratch folder (it keeps a small font cache in the folder it is run from):

    cd <scratch folder> && uv run --quiet --python 3.12 <repo>/demo-video/tools/lipsync_check.py CLIP.mp4 \
        [--audio LINE.wav] [--audio-at 0.0] [--words h3.json] [--line-at 0.9] \
        [--out chart.png] [--crops crops.jpg] [--csv frames.csv] [--json numbers.json]

What it does, per frame of the clip:
  1. finds the face with MediaPipe FaceMesh (free, runs on this Mac, the model is inside the
     package) and measures how far the mouth is open: the gap between the inner lips divided
     by the length of the nose (so a nearer or farther face gives the same number);
  2. measures how loud the sound is around that frame (the clip's own sound, or --audio);
  3. compares the two series: the correlation frame by frame, and the same with the mouth
     series slid a few frames either way, to find the lag that fits best.

Lag: NEGATIVE means the mouth moves BEFORE the sound, positive means after it.

Four numbers are printed, because one alone can mislead on a short line:
  whole clip    mouth opening against loudness over every frame. A smile that holds the lips
                apart before or after the line spoils this one.
  in the line   the same, only over the frames of the line (needs --words).
  quick moves   each series minus its own half-second average, over the line: the syllables.
                The lower chart shows this one. Sharp on a line with clear open-and-shut
                syllables, near zero on others even when the sync is right.
  movement      how much the mouth is moving (not how open it is) against loudness: does the
                mouth move while there is sound and rest while there is none?
With --words it also checks the one thing that does not depend on loudness: at every word that
starts or ends with m, b or p the lips must be shut ("lips at m,b,p").

How to read them (learned on the hook shots, 14 November 2026): a loud syllable is not always
an open mouth, so the size of r and the best lag depend on the words of the line. A model made
for lip-sync (Kling AI Avatar) scored only whole 0.52, in the line 0.38, quick moves -0.10 and
movement 0.53 on a two-second line laid at its true place. So do not ask for a fixed number.
The firm signs of a mouth that follows the file are: "movement" best at or next to lag 0, shut
lips at every m, b and p, a wrong line laid at the same place scoring clearly worse, and the
close-ups (--crops) agreeing with the words. --scan finds where a line fits a take best.
A control is printed under "quick moves": the same sound turned round in time inside its loud
part (as loud, as long, in the same place, the syllables in the wrong order). If the control
scores about as well as the real sound, the numbers prove only that the mouth is busy while
there is sound, which is all they can prove on a line of about a second: then judge the
close-ups (--crops) against the word times. Another control worth running by hand: the clip
against a different line laid at the same place (--audio).

It writes a chart (PNG): mouth opening and loudness against time, each as a share of its own
peak, with the word boundaries if --words is given, and below it the correlation against lag.
--crops writes a strip of mouth close-ups, one per frame of the line, with the time, the word
being said and a bar for the measured opening: the check that the number is the mouth.

  --audio WAV      compare against this sound file instead of the clip's own sound
  --audio-at S     where the sound's start sits in the clip, in seconds (default 0). With the
                   clip's own sound, 0.5 delays it by half a second: the self-test of the tool
                   (the best lag must move by -0.5 s, 12 frames at 24 fps)
  --words JSON     word times of the line: {"words": [{"w": "Does", "s": 0.0, "e": 0.235}, ...]}
  --line-at S      where the line (time 0 of the words file) starts in the clip (default 0)
  --roi x0,y0,x1,y1  look for the face only in this part of the frame (fractions), if a
                   wrong face is picked or none is found
  --scan A,B[,STEP]  with --audio (the bare line, not a padded copy): lay the line at every
                   place from A to B seconds (STEP defaults to half a frame) and print how well
                   each fits at lag 0, to find the line_at_s of a take

The words file and the sound file are only read.
"""
from __future__ import annotations

import argparse
import json
import os
import subprocess
import sys
from pathlib import Path

os.environ.setdefault("MPLCONFIGDIR", str(Path.cwd() / ".lipsync_check_cache"))
os.environ.setdefault("TF_CPP_MIN_LOG_LEVEL", "2")
os.environ.setdefault("GLOG_minloglevel", "2")

import numpy as np  # noqa: E402

SR = 16000                      # sound is read as mono at this rate
SURFACE, INK, INK2, MUTED = "#fcfcfb", "#0b0b0b", "#52514e", "#898781"
GRID, AXIS = "#e1e0d9", "#c3c2b7"
C_MOUTH, C_SOUND = "#2a78d6", "#eb6834"      # checked with the dataviz palette validator
FONT_FILE = Path(__file__).resolve().parent / "fonts" / "Manrope[wght].ttf"

# FaceMesh points: inner lips (upper, lower) at three places across the mouth; the nose from
# between the eyes (168) to its base (2), which does not move when the jaw does.
LIP_PAIRS = ((13, 14), (82, 87), (312, 317))
NOSE_TOP, NOSE_BASE = 168, 2
MOUTH_LEFT, MOUTH_RIGHT = 61, 291
EYE_A, EYE_B = 33, 263


def probe(clip: Path) -> dict:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-show_entries",
         "stream=codec_type,width,height,r_frame_rate,nb_frames", "-of", "json", str(clip)],
        capture_output=True, text=True, check=True)
    info = {"audio": False}
    for st in json.loads(out.stdout)["streams"]:
        if st["codec_type"] == "video" and "width" not in info:
            num, den = st["r_frame_rate"].split("/")
            info.update(width=int(st["width"]), height=int(st["height"]), fps=float(num) / float(den))
        elif st["codec_type"] == "audio":
            info["audio"] = True
    if "width" not in info:
        sys.exit(f"no video stream in {clip}")
    return info


def frames(clip: Path, width: int, height: int):
    """Every frame of the clip as an RGB array, in order."""
    proc = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-i", str(clip), "-map", "0:v:0", "-fps_mode", "passthrough",
         "-f", "rawvideo", "-pix_fmt", "rgb24", "-"], stdout=subprocess.PIPE)
    size = width * height * 3
    while True:
        buf = proc.stdout.read(size)
        if len(buf) < size:
            break
        yield np.frombuffer(buf, np.uint8).reshape(height, width, 3)
    proc.stdout.close()
    proc.wait()


def sound(source: Path) -> np.ndarray:
    out = subprocess.run(
        ["ffmpeg", "-v", "error", "-i", str(source), "-vn", "-ac", "1", "-ar", str(SR),
         "-f", "f32le", "-"], capture_output=True, check=True)
    return np.frombuffer(out.stdout, np.float32).astype(np.float64)


def loudness_per_frame(samples: np.ndarray, n_frames: int, fps: float, at_s: float) -> np.ndarray:
    """RMS of the sound around the middle of each frame (a window two frames wide)."""
    shift = int(round(at_s * SR))
    samples = np.concatenate([np.zeros(shift), samples]) if shift >= 0 else samples[-shift:]
    half = int(round(SR / fps))
    window = np.hanning(2 * half + 1)
    padded = np.concatenate([np.zeros(half), samples, np.zeros(half + int(SR * (n_frames + 2) / fps))])
    out = np.zeros(n_frames)
    for i in range(n_frames):
        mid = int(round((i + 0.5) / fps * SR)) + half
        seg = padded[mid - half: mid + half + 1]
        out[i] = np.sqrt(np.sum(window * seg * seg) / np.sum(window))
    return out


def sound_offset(own: np.ndarray, given: np.ndarray, reach_s: float = 1.5):
    """Where the given sound sits inside the clip's own sound: (offset in seconds, r).

    Both are turned into loudness every 5 ms; the given one is slid over the other.
    """
    hop = SR // 200

    def envelope(x):
        k = len(x) // hop
        return np.sqrt(np.mean(x[:k * hop].reshape(k, hop) ** 2, axis=1)) if k else np.zeros(1)

    a, b = envelope(own), envelope(given)
    best = (0.0, float("nan"))
    for shift in range(-int(reach_s * 200), int(reach_s * 200) + 1):
        lo, hi = max(shift, 0), min(len(a), len(b) + shift)
        if hi - lo < 40:
            continue
        r = pearson(a[lo:hi], b[lo - shift:hi - shift])
        if not np.isnan(r) and (np.isnan(best[1]) or r > best[1]):
            best = (shift / 200.0, r)
    return best


def largest_face(result, shape, off_x: float, off_y: float, scale: float):
    """The points of the largest face in a FaceMesh result, in pixels of the full frame."""
    best = None
    for face in result.multi_face_landmarks or []:
        pts = np.array([(p.x * shape[1] / scale + off_x, p.y * shape[0] / scale + off_y)
                        for p in face.landmark])
        eye = np.linalg.norm(pts[EYE_A] - pts[EYE_B])
        if best is None or eye > best[0]:
            best = (eye, pts)
    return None if best is None else best[1]


def find_faces(clip: Path, info: dict, roi):
    """The face's points per frame (None where it was not found), and how many the first look found.

    The first look takes the whole frame (or --roi). A small or turned face is missed there in
    some frames, so a second look takes a square cut closely round the place where the face
    was found (for the frames in between: where it must be), enlarged if it is small.
    """
    import cv2
    import mediapipe as mp

    width, height = info["width"], info["height"]
    px0, py0, px1, py1 = (int(roi[0] * width), int(roi[1] * height), int(roi[2] * width), int(roi[3] * height))

    def mesh():
        return mp.solutions.face_mesh.FaceMesh(static_image_mode=True, max_num_faces=4,
                                               refine_landmarks=True, min_detection_confidence=0.4)

    first = []
    with mesh() as m:
        for frame in frames(clip, width, height):
            part = np.ascontiguousarray(frame[py0:py1, px0:px1])
            first.append(largest_face(m.process(part), part.shape, px0, py0, 1.0))
    found = [i for i, pts in enumerate(first) if pts is not None]
    if not found or len(found) == len(first):
        return first, len(found)
    idx = np.arange(len(first))
    mid = np.array([first[i].mean(axis=0) for i in found])
    size = np.array([np.ptp(first[i], axis=0).max() for i in found])
    cx, cy, sz = (np.interp(idx, found, v) for v in (mid[:, 0], mid[:, 1], size))
    second = []
    with mesh() as m:
        for i, frame in enumerate(frames(clip, width, height)):
            half = 1.3 * sz[i]
            x0, y0 = int(max(cx[i] - half, 0)), int(max(cy[i] - half, 0))
            x1, y1 = int(min(cx[i] + half, width)), int(min(cy[i] + half, height))
            part = np.ascontiguousarray(frame[y0:y1, x0:x1])
            scale = max(1.0, 512.0 / max(part.shape[0], 1))
            if scale > 1.0:
                part = cv2.resize(part, None, fx=scale, fy=scale, interpolation=cv2.INTER_CUBIC)
            pts = largest_face(m.process(part), part.shape, x0, y0, scale)
            second.append(pts if pts is not None else first[i])
    return second, len(found)


def mouth_opening(faces: list) -> np.ndarray:
    """Inner-lip gap divided by the nose length, per frame (NaN where no face was found)."""
    out = []
    for pts in faces:
        if pts is None:
            out.append(np.nan)
            continue
        nose = np.linalg.norm(pts[NOSE_TOP] - pts[NOSE_BASE])
        gap = np.mean([np.linalg.norm(pts[a] - pts[b]) for a, b in LIP_PAIRS])
        out.append(gap / nose if nose > 1 else np.nan)
    return np.array(out)


def mouth_crops(clip: Path, info: dict, faces: list, wanted: set[int], cell: int) -> dict:
    """A square close-up of the mouth for the frames asked for.

    Where the face was not found, the place is carried over from the nearest frames that have it.
    """
    from PIL import Image

    found = [i for i, pts in enumerate(faces) if pts is not None]
    if not found or not wanted:
        return {}
    idx = np.arange(len(faces))
    mid = np.array([np.mean(faces[i][[13, 14, MOUTH_LEFT, MOUTH_RIGHT]], axis=0) for i in found])
    nose = np.array([np.linalg.norm(faces[i][NOSE_TOP] - faces[i][NOSE_BASE]) for i in found])
    cx, cy, side = (np.interp(idx, found, v) for v in (mid[:, 0], mid[:, 1], np.maximum(2.0 * nose, 24)))
    crops = {}
    for i, frame in enumerate(frames(clip, info["width"], info["height"])):
        if i in wanted and i < len(faces):
            box = (int(cx[i] - side[i] / 2), int(cy[i] - side[i] / 2),
                   int(cx[i] + side[i] / 2), int(cy[i] + side[i] / 2))
            crops[i] = Image.fromarray(frame).crop(box).resize((cell, cell), Image.LANCZOS)
    return crops


BILABIALS = "pbm"          # for these sounds the lips must be shut


def closures(words: list, opening: np.ndarray, fps: float) -> list[dict]:
    """A check that does not depend on loudness: are the lips shut at each m, b and p?

    From the spelling only: a word that starts with m, b or p needs shut lips just before it
    starts; a word that ends with one needs them near its end.
    """
    if not words or np.all(np.isnan(opening)):
        return []
    n = len(opening)
    a_line, b_line = max(int(words[0][1] * fps), 0), min(int(np.ceil(words[-1][2] * fps)) + 1, n)
    line = opening[a_line:b_line]
    peak = np.nanmax(line) if line.size and np.any(~np.isnan(line)) else np.nanmax(opening)
    limit = max(0.035, 0.12 * peak)
    out = []
    for word, start, end in words:
        letters = "".join(ch for ch in word.lower() if ch.isalpha())
        spans = []
        if letters[:1] and letters[0] in BILABIALS:
            spans.append((f"starts with {letters[0]}", start - 0.10, start + 0.06))
        if letters[:1] and letters[-1] in BILABIALS:
            spans.append((f"ends with {letters[-1]}", start + 0.6 * (end - start), end + 0.04))
        for why, a, b in spans:
            i0, i1 = max(int(np.floor(a * fps)), 0), min(int(np.ceil(b * fps)) + 1, n)
            seg = opening[i0:i1]
            item = {"word": word, "why": why, "from_s": a, "to_s": b, "shut": None}
            if seg.size and np.any(~np.isnan(seg)):
                k = int(np.nanargmin(seg))
                item.update(shut=bool(seg[k] <= limit), at_s=(i0 + k) / fps, opening=float(seg[k]),
                            share_of_peak=float(seg[k] / peak) if peak > 0 else 0.0)
            out.append(item)
    return out


def fill_gaps(series: np.ndarray) -> np.ndarray:
    good = ~np.isnan(series)
    if good.sum() < 2:
        return np.zeros_like(series)
    idx = np.arange(len(series))
    return np.interp(idx, idx[good], series[good])


def pearson(x: np.ndarray, y: np.ndarray) -> float:
    if len(x) < 5:
        return float("nan")
    x, y = x - x.mean(), y - y.mean()
    den = np.sqrt(np.sum(x * x) * np.sum(y * y))
    return float(np.sum(x * y) / den) if den > 0 else float("nan")


def lag_curve(mouth: np.ndarray, loud: np.ndarray, max_lag: int, lo: int = 0, hi: int | None = None):
    """r between loudness at frame i and the mouth at frame i + lag, for every lag."""
    n = len(mouth)
    hi = n if hi is None else hi
    lags = np.arange(-max_lag, max_lag + 1)
    values = []
    for lag in lags:
        i = np.arange(max(lo, -lag, 0), min(hi, n - lag, n))
        values.append(pearson(mouth[i + lag], loud[i]) if len(i) else float("nan"))
    return lags, np.array(values)


def quick(series: np.ndarray, fps: float) -> np.ndarray:
    """The quick ups and downs of a series: the series minus its own half-second average.

    A smile holds the lips apart for seconds; this drops such slow parts and keeps the syllables.
    """
    win = max(int(round(0.5 * fps)) | 1, 3)
    padded = np.pad(series, win // 2, mode="edge")
    return series - np.convolve(padded, np.ones(win) / win, mode="valid")


def best_of(lags, values):
    if np.all(np.isnan(values)):
        return 0, float("nan")
    k = int(np.nanargmax(values))
    return int(lags[k]), float(values[k])


def span(active: np.ndarray, fps: float):
    idx = np.flatnonzero(active)
    return (float(idx[0] / fps), float((idx[-1] + 1) / fps)) if len(idx) else None


def scan_places(samples, raw_words, opening, mouth, move, fps: float, start: float, stop: float, step: float):
    """Lay the sound at each place in turn and print how well it fits the mouth at lag 0."""
    n = len(mouth)
    rows = []
    at = start
    while at <= stop + 1e-9:
        loud = loudness_per_frame(samples, n, fps, at)
        words = [(w, at + s, at + e) for w, s, e in raw_words]
        if words:
            lo = max(int(np.floor((words[0][1] - 0.2) * fps)), 0)
            hi = min(int(np.ceil((words[-1][2] + 0.2) * fps)), n)
        else:
            lo, hi = 0, n
        shut = closures(words, opening, fps)
        rows.append((at, pearson(mouth, loud), pearson(mouth[lo:hi], loud[lo:hi]),
                     pearson(quick(mouth, fps)[lo:hi], quick(loud, fps)[lo:hi]), pearson(move, loud),
                     "; ".join(f"{c['word']} {'shut' if c['shut'] else 'OPEN'}" for c in shut if c["shut"] is not None)))
        at += step
    key = 2 if raw_words else 1
    best = max(rows, key=lambda r: -9 if np.isnan(r[key]) else r[key])
    print("scan      line at   whole clip   in the line   quick moves   movement   lips at m,b,p    (r at lag 0)")
    for row in rows:
        mark = "  <- best in the line" if row is best and raw_words else ("  <- best" if row is best else "")
        print(f"          {row[0]:7.3f}   {row[1]:+10.2f}   {row[2]:+11.2f}   {row[3]:+11.2f}   {row[4]:+8.2f}   {row[5]}{mark}")
    return best[0]


def lag_words(lag: int, fps: float) -> str:
    if lag == 0:
        return "lag 0"
    side = "the mouth moves before the sound" if lag < 0 else "the mouth moves after the sound"
    return f"lag {lag:+d} frames ({lag / fps * 1000:+.0f} ms: {side})"


def draw_chart(out: Path, title: str, subtitle: str, t, mouth_raw, loud, words, lags, curve, best, fps, what,
               shut=()):
    import matplotlib
    matplotlib.use("Agg")
    import matplotlib.pyplot as plt

    plt.rcParams.update({"font.size": 10, "axes.edgecolor": AXIS, "axes.labelcolor": INK2,
                         "xtick.color": MUTED, "ytick.color": MUTED, "text.color": INK,
                         "xtick.labelcolor": INK2, "ytick.labelcolor": INK2})
    fig, (ax, ax2) = plt.subplots(2, 1, figsize=(11, 7.8), dpi=130, facecolor=SURFACE,
                                  gridspec_kw={"height_ratios": [3, 1.25], "hspace": 0.42})
    peak_m = np.nanmax(mouth_raw) if np.any(~np.isnan(mouth_raw)) else 1.0
    peak_l = loud.max() if loud.max() > 0 else 1.0
    for a in (ax, ax2):
        a.set_facecolor(SURFACE)
        a.grid(True, color=GRID, linewidth=0.8)
        a.set_axisbelow(True)
        for side in ("top", "right"):
            a.spines[side].set_visible(False)
    ax.plot(t, loud / peak_l, color=C_SOUND, linewidth=2, solid_capstyle="round",
            solid_joinstyle="round", label="Loudness of the sound")
    ax.plot(t, mouth_raw / (peak_m or 1.0), color=C_MOUTH, linewidth=2, solid_capstyle="round",
            solid_joinstyle="round", label="Mouth opening")
    ax.set_xlim(0, t[-1] + 0.5 / fps)
    ax.set_ylim(-0.06, 1.05)
    ax.set_yticks([0, 0.25, 0.5, 0.75, 1.0])
    ax.set_ylabel("share of its own peak")
    ax.set_xlabel("time in the clip (seconds)")
    ax.xaxis.set_major_locator(plt.MultipleLocator(0.5))
    for k, (word, start, end) in enumerate(words):
        ax.axvline(start, color=MUTED, linewidth=0.8)
        ax.text((start + end) / 2, 1.02 + 0.065 * (k % 2), word, ha="center", va="bottom",
                fontsize=9, color=INK2, transform=ax.get_xaxis_transform(), clip_on=False)
    if words:
        ax.axvline(words[-1][2], color=MUTED, linewidth=0.8)
    for k, item in enumerate(shut):                # where the lips must be shut: a bar under the zero line
        ax.plot([item["from_s"], item["to_s"]], [-0.035, -0.035], color=INK2, linewidth=3,
                solid_capstyle="butt", label="Lips must be shut here (m, b, p)" if k == 0 else None)
    legend = fig.legend(*ax.get_legend_handles_labels(), loc="upper left", frameon=False, fontsize=9.5,
                        ncol=3, bbox_to_anchor=(0.055, 0.845), handlelength=1.6, borderaxespad=0)
    for text in legend.get_texts():
        text.set_color(INK2)
    fig.suptitle(title, x=0.065, y=0.985, ha="left", fontsize=13, fontweight="bold", color=INK)
    fig.text(0.065, 0.95, subtitle, ha="left", va="top", fontsize=9.2, color=INK2, linespacing=1.45)

    ax2.axvline(0, color=AXIS, linewidth=1)
    ax2.axhline(0, color=AXIS, linewidth=1)
    ax2.plot(lags, curve, color=INK2, linewidth=2, solid_capstyle="round", solid_joinstyle="round")
    if not np.isnan(best[1]):
        ax2.plot([best[0]], [best[1]], "o", color=INK2, markersize=8, markeredgecolor=SURFACE,
                 markeredgewidth=2)
        left = best[0] > lags[-1] * 0.4
        ax2.annotate(f"best fit: {best[0]:+d} frames, r {best[1]:.2f}", (best[0], best[1]),
                     xytext=(-10 if left else 10, 4), textcoords="offset points",
                     ha="right" if left else "left", fontsize=9, color=INK)
    ax2.set_xlim(lags[0], lags[-1])
    low = np.nanmin(curve) if not np.all(np.isnan(curve)) else -1
    ax2.set_ylim(min(-0.25, low - 0.08), 1.05)
    ax2.set_ylabel("correlation r")
    ax2.set_title(f"How well the two fit when the mouth series is slid in time ({what})", loc="left",
                  fontsize=9.5, color=INK2, pad=6)
    ax2.set_xlabel("lag in frames  (negative: the mouth moves before the sound; positive: after it)")
    fig.subplots_adjust(left=0.065, right=0.975, top=0.72 if words else 0.78, bottom=0.075)
    out.parent.mkdir(parents=True, exist_ok=True)
    fig.savefig(out, facecolor=SURFACE)
    plt.close(fig)


def draw_crops(out: Path, crops: dict, order: list[int], opening, fps, words, cell: int, columns: int):
    from PIL import Image, ImageDraw, ImageFont

    def font(size):
        try:
            return ImageFont.truetype(str(FONT_FILE), size)
        except OSError:
            return ImageFont.load_default(size)

    label_h, pad = 30, 4
    rows = (len(order) + columns - 1) // columns
    sheet = Image.new("RGB", (columns * (cell + pad) + pad, rows * (cell + label_h + pad) + pad),
                      (252, 252, 251))
    draw = ImageDraw.Draw(sheet)
    small, peak = font(12), np.nanmax(opening) if np.any(~np.isnan(opening)) else 1.0
    for k, i in enumerate(order):
        x = pad + (k % columns) * (cell + pad)
        y = pad + (k // columns) * (cell + label_h + pad)
        if i in crops:
            sheet.paste(crops[i], (x, y))
        else:
            draw.rectangle([x, y, x + cell, y + cell], fill=(225, 224, 217))
        t = (i + 0.5) / fps
        word = next((w for w, s, e in words if s <= t < e), "")
        draw.text((x + 2, y + cell + 1), f"{i / fps:.2f}s", font=small, fill=(82, 81, 78))
        draw.text((x + 2, y + cell + 14), word, font=small, fill=(11, 11, 11))
        if not np.isnan(opening[i]) and peak > 0:      # the measured opening, as a bar
            bar = int((cell - 50) * min(opening[i] / peak, 1.0))
            draw.rectangle([x + 46, y + cell + 6, x + 46 + max(bar, 1), y + cell + 10], fill=(42, 120, 214))
        else:
            draw.text((x + 46, y + cell + 1), "no face", font=small, fill=(137, 135, 129))
    out.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out, quality=88)


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("clip")
    ap.add_argument("--audio", help="a sound file to compare against (default: the clip's own sound)")
    ap.add_argument("--audio-at", type=float, default=0.0, help="where the sound's start sits in the clip (s)")
    ap.add_argument("--words", help="JSON with the word times of the line")
    ap.add_argument("--line-at", type=float, default=0.0, help="where the line starts in the clip (s)")
    ap.add_argument("--out", help="the chart (PNG); default: <clip name>-lipsync.png in this folder")
    ap.add_argument("--crops", help="write mouth close-ups of the line's frames to this JPEG")
    ap.add_argument("--crops-from", type=float, help="first second of the close-ups (default: the line, or 0)")
    ap.add_argument("--crops-to", type=float, help="last second of the close-ups (default: the line's end)")
    ap.add_argument("--crops-step", type=int, default=1, help="one close-up every N frames")
    ap.add_argument("--crops-columns", type=int, default=12)
    ap.add_argument("--cell", type=int, default=120, help="size of one close-up in pixels")
    ap.add_argument("--csv", help="write the per-frame numbers to this CSV")
    ap.add_argument("--json", help="write the result numbers to this JSON")
    ap.add_argument("--max-lag", type=int, help="largest lag tried, in frames (default: 0.75 s)")
    ap.add_argument("--roi", default="0,0,1,1", help="x0,y0,x1,y1 as fractions of the frame")
    ap.add_argument("--title", help="chart title (default: the clip's file name)")
    ap.add_argument("--scan", help="A,B[,STEP]: lay --audio at every place from A to B seconds and print the fit")
    args = ap.parse_args()

    clip = Path(args.clip)
    info = probe(clip)
    fps = info["fps"]
    roi = tuple(float(v) for v in args.roi.split(","))
    raw_words = []
    if args.words:
        raw_words = [(w["w"], float(w["s"]), float(w["e"])) for w in json.loads(Path(args.words).read_text())["words"]]
    words = [(w, args.line_at + s, args.line_at + e) for w, s, e in raw_words]

    c_from = args.crops_from if args.crops_from is not None else (words[0][1] - 0.25 if words else 0.0)
    c_to = args.crops_to if args.crops_to is not None else (words[-1][2] + 0.25 if words else 1e9)
    crop_frames = set()
    if args.crops:
        crop_frames = set(range(max(int(round(c_from * fps)), 0), int(round(c_to * fps)) + 1, max(args.crops_step, 1)))

    faces, found_first = find_faces(clip, info, roi)
    opening = mouth_opening(faces)
    n = len(opening)
    if n == 0:
        sys.exit("no frames could be read")
    found = int(np.sum(~np.isnan(opening)))
    mouth = fill_gaps(opening)
    crops = mouth_crops(clip, info, faces, crop_frames, args.cell)
    shut = closures(words, opening, fps)

    source = Path(args.audio) if args.audio else clip
    if not args.audio and not info["audio"]:
        sys.exit("the clip has no sound: give --audio")
    samples = sound(source)
    loud = loudness_per_frame(samples, n, fps, args.audio_at)
    own_vs_given = sound_offset(sound(clip), samples, max(1.5, n / fps)) if args.audio and info["audio"] else None

    max_lag = args.max_lag if args.max_lag is not None else int(round(0.75 * fps))
    lags, curve = lag_curve(mouth, loud, max_lag)
    r0 = float(curve[max_lag])
    best = best_of(lags, curve)
    move = np.abs(np.diff(mouth, prepend=mouth[0]))
    move = np.convolve(move, np.ones(3) / 3, mode="same")          # how much the mouth is moving
    lags_m, curve_m = lag_curve(move, loud, max_lag)
    best_m = best_of(lags_m, curve_m)

    if args.scan:
        if not args.audio:
            sys.exit("--scan needs --audio: the bare line, not a padded copy")
        parts = [float(v) for v in args.scan.split(",")]
        fit = scan_places(samples, raw_words, opening, mouth, move, fps, parts[0], parts[1],
                          parts[2] if len(parts) > 2 else 0.5 / fps)
        print(f"          best place for the line: {fit:.3f} s. The report below is for --audio-at {args.audio_at:g}.")

    loud_span = span(loud > 0.1 * loud.max(), fps) if loud.max() > 0 else None
    line = None
    if words:                                   # the frames of the line, a little wider
        lo = max(int(np.floor((words[0][1] - 0.2) * fps)), 0)
        hi = min(int(np.ceil((words[-1][2] + 0.2) * fps)), n)
        lags_l, curve_l = lag_curve(mouth, loud, max_lag, lo, hi)
        line = {"from_s": lo / fps, "to_s": hi / fps, "frames": hi - lo,
                "r_at_lag_0": float(curve_l[max_lag]), "best": best_of(lags_l, curve_l)}
    elif loud_span:                             # no word times: the loud part of the sound
        lo = max(int(np.floor((loud_span[0] - 0.2) * fps)), 0)
        hi = min(int(np.ceil((loud_span[1] + 0.2) * fps)), n)
    else:
        lo, hi = 0, n
    lags_q, curve_q = lag_curve(quick(mouth, fps), quick(loud, fps), max_lag, lo, hi)
    best_q = best_of(lags_q, curve_q)
    rq0 = float(curve_q[max_lag])
    # The built-in control: the same sound turned round in time inside its loud part. It is
    # as loud, as long and in the same place, but its syllables are in the wrong order.
    control = None
    if loud_span:
        a, b = int(round(loud_span[0] * fps)), int(round(loud_span[1] * fps))
        turned = loud.copy()
        turned[a:b] = loud[a:b][::-1]
        control = best_of(*lag_curve(quick(mouth, fps), quick(turned, fps), max_lag, lo, hi))
    move_span = span(move > 0.25 * move.max(), fps) if move.max() > 0 else None
    t = (np.arange(n) + 0.5) / fps

    print(f"clip      {clip.name}: {n} frames at {fps:g} fps ({n / fps:.2f} s), {info['width']}x{info['height']}")
    print(f"face      found in {found} of {n} frames (the first look at the whole frame found {found_first}); "
          f"mouth opening {np.nanmin(opening):.3f} to {np.nanmax(opening):.3f} (inner-lip gap / nose length)"
          if found else "face      NOT FOUND in any frame")
    name = f"{source.name} placed at {args.audio_at:+.2f} s" if args.audio else (
        "the clip's own sound" + (f", delayed by {args.audio_at:+.2f} s" if args.audio_at else ""))
    print(f"sound     {name}" + (f"; loud from {loud_span[0]:.2f} s to {loud_span[1]:.2f} s" if loud_span else "; silent"))
    if own_vs_given and own_vs_given[1] >= 0.8:
        print(f"          the clip's own sound holds this file starting at {own_vs_given[0]:+.3f} s "
              f"(loudness match r = {own_vs_given[1]:.2f})")
    elif own_vs_given:
        print(f"          the clip's own sound does NOT hold this file (best loudness match r = {own_vs_given[1]:.2f})")
    if move_span:
        print(f"mouth     moving from about {move_span[0]:.2f} s to {move_span[1]:.2f} s")
    print(f"whole clip    r = {r0:+.2f} at lag 0; best r = {best[1]:+.2f} at {lag_words(best[0], fps)}")
    if line:
        print(f"in the line   r = {line['r_at_lag_0']:+.2f} at lag 0; best r = {line['best'][1]:+.2f} at "
              f"{lag_words(line['best'][0], fps)}  [{line['from_s']:.2f} s to {line['to_s']:.2f} s, {line['frames']} frames]")
    print(f"quick moves   r = {rq0:+.2f} at lag 0; best r = {best_q[1]:+.2f} at {lag_words(best_q[0], fps)}  "
          f"(each series minus its half-second average, {lo / fps:.2f} s to {hi / fps:.2f} s: the syllables)")
    if control:
        print(f"  control     best r = {control[1]:+.2f} at lag {control[0]:+d} for the quick moves against the same sound "
              f"turned round in time (a real fit beats this clearly)")
    print(f"movement      best r = {best_m[1]:+.2f} at {lag_words(best_m[0], fps)}  (how much the mouth moves, against loudness)")

    for item in shut:
        if item["shut"] is None:
            verdict = "no face there"
        else:
            verdict = (f"{'shut' if item['shut'] else 'NOT shut'} at {item['at_s']:.2f} s "
                       f"(opening {item['share_of_peak'] * 100:.0f}% of the line's peak)")
        print(f"lips at m,b,p \"{item['word']}\" {item['why']}: {verdict}")
    out = Path(args.out) if args.out else Path.cwd() / f"{clip.stem}-lipsync.png"
    checked = [item for item in shut if item["shut"] is not None]
    subtitle = (f"Sound: {name}.  Face found in {found} of {n} frames.\n"
                f"Mouth opening against loudness, whole clip: r {r0:+.2f} at lag 0, best r {best[1]:+.2f} at {best[0]:+d} frames"
                + (f";  in the line: best r {line['best'][1]:+.2f} at {line['best'][0]:+d} frames" if line else "")
                + f".\nQuick moves (the syllables): best r {best_q[1]:+.2f} at {best_q[0]:+d} frames"
                + (f";  control, the sound turned round in time: {control[1]:+.2f} at {control[0]:+d}" if control else "")
                + f".\nMouth movement against loudness: best r {best_m[1]:+.2f} at {best_m[0]:+d} frames."
                + (f"  Lips shut at m, b, p: {sum(i['shut'] for i in checked)} of {len(checked)}." if checked else ""))
    draw_chart(out, args.title or clip.name, subtitle, t, opening, loud, words, lags_q, curve_q, best_q, fps,
               f"quick moves from {lo / fps:.2f} s to {hi / fps:.2f} s", shut)
    print(f"chart     {out}")
    if args.crops:
        order = [i for i in sorted(crop_frames) if i < n]
        draw_crops(Path(args.crops), crops, order, opening, fps, words, args.cell, args.crops_columns)
        print(f"crops     {args.crops} ({len(order)} frames from {order[0] / fps:.2f} s to {order[-1] / fps:.2f} s)")
    if args.csv:
        with open(args.csv, "w") as fh:
            fh.write("frame,time_s,mouth_opening,loudness_rms,word\n")
            for i in range(n):
                word = next((w for w, s, e in words if s <= t[i] < e), "")
                fh.write(f"{i},{i / fps:.4f},{opening[i]:.4f},{loud[i]:.6f},{word}\n")
        print(f"csv       {args.csv}")
    if args.json:
        Path(args.json).write_text(json.dumps({
            "clip": str(clip), "sound": str(source), "audio_at_s": args.audio_at, "line_at_s": args.line_at,
            "frames": n, "fps": fps, "face_found_frames": found, "face_found_first_look": found_first,
            "whole_clip": {"r_at_lag_0": r0, "best_lag_frames": best[0], "best_r": best[1]},
            "in_the_line": line and {"from_s": line["from_s"], "to_s": line["to_s"],
                                     "r_at_lag_0": line["r_at_lag_0"],
                                     "best_lag_frames": line["best"][0], "best_r": line["best"][1]},
            "quick_moves": {"from_s": lo / fps, "to_s": hi / fps, "r_at_lag_0": rq0,
                            "best_lag_frames": best_q[0], "best_r": best_q[1]},
            "quick_moves_control_sound_reversed": control and {"best_lag_frames": control[0], "best_r": control[1]},
            "movement": {"best_lag_frames": best_m[0], "best_r": best_m[1]},
            "lips_shut_at_m_b_p": shut,
            "sound_loud_span_s": loud_span, "mouth_moving_span_s": move_span,
            "given_sound_inside_own_sound": own_vs_given and {"at_s": own_vs_given[0], "r": own_vs_given[1]},
            "lags": lags.tolist(),
            "r_by_lag_whole_clip": [None if np.isnan(v) else round(float(v), 4) for v in curve],
            "r_by_lag_quick_moves": [None if np.isnan(v) else round(float(v), 4) for v in curve_q],
        }, indent=1))
        print(f"json      {args.json}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
