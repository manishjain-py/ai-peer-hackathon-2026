#!/usr/bin/env -S uv run --quiet --python 3.12 --script
# /// script
# requires-python = ">=3.10,<3.13"
# dependencies = ["ultralytics>=8.3", "numpy>=1.26", "pillow>=10"]
# ///
r"""chest_track: where the double's chest is in every frame of a clip, for the "AI Peer" tag.

    cd <a scratch folder> && uv run --quiet --python 3.12 <repo>/demo-video/tools/chest_track.py \
        CLIP.mp4 OUT.json [--check CHECK.jpg] [--table]

OUT.json is a list with one entry per frame, exactly
    {"f": 0, "x": 0.41, "y": 0.37, "w": 0.06, "on": true}
x, y  the middle of the double's chest as the body is seen: half-way between the two shoulder
      joints, a quarter of the way down to the hip line. Fractions of the frame's width and
      height (0,0 is the picture's top left corner). It is the middle of the seen torso, not
      the breastbone: on a body turned three-quarters the glowing core sits to one side of it;
w     the width of its shoulders as seen (the distance between the two shoulder points), as a
      fraction of the frame's WIDTH: it shrinks when the body turns;
on    true when a tag on the chest would be seen: the double is there, solid enough, and its
      front is towards the camera. False when it is not there yet, has faded, shows its back,
      or is so side-on that the chest is hidden.
When `on` is false x, y and w are only a place holder (the track while the body is still found,
else the nearest known place), so a tag that fades out stays put. Never draw from them alone.

How it works (all on this Mac, nothing sent, nothing paid):
 1. A pose model (Ultralytics YOLO pose; AGPL, fine for making the film) finds every person and
    their shoulders and hips in every frame. The model file (about 115 MB) is downloaded once
    into the folder the command is run from, so run it from a scratch folder.
 2. People who stay put for half the clip or more and do not glow mint (the sleeper, the dark
    foreground man) are set aside. Of what is left, one path through the clip is chosen: the
    finds that are sure, mint in the chest, and do not jump from frame to frame.
 3. Frames where the model lost the double are filled in if the gap is short (--gap, 6 frames);
    a longer gap is left empty and `on` is false there.
 4. The track is smoothed over time (no lag: it looks both ways), so a tag sits still.
 5. `on` needs five things, and changes only when the new state lasts --hold frames (4), so it
    cannot flicker:
    - the chest turned to the camera: the seen shoulder width as a share of the full-front
      shoulder width, which is judged from the lengths of the torso, arms and legs (1 is full
      front, 0 side-on, negative from behind). `on` lasts for a stretch where this stays over
      --turn-off (0.40) and reaches --turn-on (0.45) at least once;
    - the double apart from every person who stays put (--apart 1.25: that many of its own
      shoulder widths between the two shoulder middles), so a tag never sits on the sleeper
      while the double is still rising out of him;
    - the model sure of it (--sure 0.5, its confidence averaged over half a second);
    - the body seen down to the hips, so the turn is measured and not guessed: a double that is
      still coming up through the bedding stays off until its torso is out. (For a figure whose
      hips are hidden behind a desk, --hidden-ok drops this.)
    - the double solid: if it fades away (or in) while standing still, `on` goes false where
      it is half gone (--fade-cut 0.5), and the frames where it is 90%, half and 10% solid are
      printed, so the tag can be faded with it.

  --check CHECK.jpg  one picture: 8 frames spread over the clip (--frames N for more), each with
                     the chest point and the shoulder width drawn: a mint box when on, a red
                     cross when off (with the reason: not there, on a person who stays put,
                     half hidden, faded, unsure, turned away)
  --table            print the per-frame working (found, turn, strength, on) to standard error
  --finds FILE       keep what the pose model found in FILE; if FILE exists it is read instead
                     of running the model again (to try other settings in a second)
  --model NAME       the pose model (yolo11x-pose.pt); --imgsz 1280; --device mps|cpu
"""
from __future__ import annotations

import argparse
import json
import math
import os
import subprocess
import sys
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

INK_DEEP = (12, 26, 30)
PAPER = (246, 244, 238)
MINT = (183, 244, 207)
RED = (255, 77, 77)
FONT_FILE = Path(__file__).resolve().parent / "fonts" / "Manrope[wght].ttf"
FALLBACKS = ["/System/Library/Fonts/Helvetica.ttc", "/System/Library/Fonts/Supplemental/Arial.ttf"]

L_SHOULDER, R_SHOULDER, L_HIP, R_HIP, NOSE = 5, 6, 11, 12, 0
# Limbs that tell the body's size whatever way it is turned: (point, point, the limb's usual length
# as a multiple of the full-front shoulder width).
LIMBS = [(5, 11, 1.45), (6, 12, 1.45), (5, 7, 0.80), (6, 8, 0.80), (7, 9, 0.70), (8, 10, 0.70),
         (11, 13, 1.20), (12, 14, 1.20), (13, 15, 1.15), (14, 16, 1.15)]
KP_SURE = 0.5          # a shoulder or hip point counts from this confidence
CHEST_DROP = 0.25      # the chest's middle: this share of the way from the shoulder line to the hip line
STAY_SHARE = 0.5       # "stays put": found in the same place in this share of the frames
MINT_FLOOR = 12.0      # green minus red in the chest (0..255); the double is well above, real men below


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


def probe(clip: str) -> tuple[int, int, float]:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
         "stream=width,height,r_frame_rate", "-of", "json", clip],
        capture_output=True, text=True, check=True)
    s = json.loads(out.stdout)["streams"][0]
    num, den = s["r_frame_rate"].split("/")
    return int(s["width"]), int(s["height"]), float(num) / float(den)


def read_frames(clip: str, w: int, h: int):
    """Every frame of the clip in order, as a height x width x 3 array (blue, green, red)."""
    reader = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-i", clip, "-f", "rawvideo", "-pix_fmt", "bgr24", "-"],
        stdout=subprocess.PIPE)
    size = w * h * 3
    try:
        while True:
            buf = reader.stdout.read(size)
            if len(buf) < size:
                break
            yield np.frombuffer(buf, dtype=np.uint8).reshape(h, w, 3)
    finally:
        reader.stdout.close()
        reader.wait()


# ---------------------------------------------------------------- 1. what the pose model finds

def body_of(kp: np.ndarray, box: list[float]) -> dict:
    """Shoulder line, torso line and a body size from one person's key points."""
    ls, rs, lh, rh = kp[L_SHOULDER], kp[R_SHOULDER], kp[L_HIP], kp[R_HIP]
    across = ls[:2] - rs[:2]                         # from the person's right shoulder to the left
    mid = 0.5 * (ls[:2] + rs[:2])
    sw = float(np.hypot(*across))
    hips = bool(min(lh[2], rh[2]) >= KP_SURE)
    box_h, box_w = box[3] - box[1], box[2] - box[0]
    if hips:
        down = 0.5 * (lh[:2] + rh[:2]) - mid         # from the shoulder line to the hip line
    else:                                            # hips hidden: square to the shoulders, away from the head
        perp = np.array([-across[1], across[0]]) / max(sw, 1e-6)
        away = mid - kp[NOSE][:2] if kp[NOSE][2] >= 0.3 else np.array([0.0, 1.0])
        if float(perp @ away) < 0:
            perp = -perp
        down = perp * max(1.3 * sw, 0.3 * max(box_h, box_w))
    size = max(sw, 0.55 * float(np.hypot(*down)), 0.12 * max(box_h, box_w))
    # The shoulder width this body would show full front: the two longest limbs, each divided by
    # its usual share (a limb pointing at the camera looks short, so the longest are the truest).
    cues = sorted(float(np.hypot(*(kp[i][:2] - kp[j][:2]))) / share for i, j, share in LIMBS
                  if len(kp) > max(i, j) and min(kp[i][2], kp[j][2]) >= KP_SURE)
    full = 0.5 * (cues[-1] + cues[-2]) if len(cues) >= 2 else float("nan")
    return {"mid": mid, "across": across, "down": down, "hips": hips, "sw": sw, "size": size, "full": full}


def chest_colour(frame: np.ndarray, centre: np.ndarray, radius: float) -> list[float]:
    """Mean red, green, blue inside a disc on the chest."""
    h, w = frame.shape[:2]
    r = max(4, int(round(radius)))
    cx, cy = int(round(centre[0])), int(round(centre[1]))
    x0, x1, y0, y1 = max(0, cx - r), min(w, cx + r + 1), max(0, cy - r), min(h, cy + r + 1)
    if x1 <= x0 or y1 <= y0:
        return [0.0, 0.0, 0.0]
    yy, xx = np.mgrid[y0:y1, x0:x1]
    inside = (xx - cx) ** 2 + (yy - cy) ** 2 <= r * r
    px = frame[y0:y1, x0:x1][inside].astype(np.float64)
    if len(px) == 0:
        return [0.0, 0.0, 0.0]
    b, g, rr = px.mean(axis=0)
    return [round(float(rr), 1), round(float(g), 1), round(float(b), 1)]


def find_people(clip: str, model_name: str, imgsz: int, device: str) -> dict:
    """Run the pose model on every frame; keep every person with key points and chest colour."""
    import torch
    import ultralytics
    from ultralytics import YOLO

    w, h, fps = probe(clip)
    model = YOLO(model_name)
    if device == "auto":
        device = "mps" if torch.backends.mps.is_available() else "cpu"
    frames = []
    for n, frame in enumerate(read_frames(clip, w, h)):
        try:
            res = model.predict(frame, conf=0.05, imgsz=imgsz, verbose=False, device=device)[0]
        except Exception:
            if device == "cpu":
                raise
            device = "cpu"       # some Macs lack an operation on the GPU path: fall back once
            res = model.predict(frame, conf=0.05, imgsz=imgsz, verbose=False, device=device)[0]
        people = []
        if res.boxes is not None and len(res.boxes) and res.keypoints is not None:
            boxes = res.boxes.xyxy.cpu().numpy()
            confs = res.boxes.conf.cpu().numpy()
            kps = res.keypoints.data.cpu().numpy()
            for box, conf, kp in zip(boxes, confs, kps):
                if kp.shape[0] < 13 or kp.shape[1] < 3:
                    continue
                box = [float(v) for v in box]
                b = body_of(kp, box)
                rgb = chest_colour(frame, b["mid"] + CHEST_DROP * b["down"], 0.22 * b["size"])
                people.append({"box": [round(v, 2) for v in box], "conf": round(float(conf), 4),
                               "kp": [[round(float(x), 2), round(float(y), 2), round(float(c), 3)]
                                      for x, y, c in kp], "rgb": rgb})
        frames.append(people)
        if (n + 1) % 48 == 0:
            say(f"  {n + 1} frames")
    return {"clip": os.path.abspath(clip), "bytes": os.path.getsize(clip), "w": w, "h": h, "fps": fps,
            "model": model_name, "imgsz": imgsz, "device": device, "ultralytics": ultralytics.__version__,
            "frames": frames}


def load_or_find(a: argparse.Namespace) -> dict:
    if a.finds and Path(a.finds).exists():
        raw = json.loads(Path(a.finds).read_text())
        same = (raw.get("clip") == os.path.abspath(a.clip) and raw.get("bytes") == os.path.getsize(a.clip)
                and raw.get("model") == a.model and raw.get("imgsz") == a.imgsz)
        if same:
            say(f"read the pose model's finds from {a.finds} (the model was not run again)")
            return raw
        say(f"{a.finds} is for another clip or setting: running the model again")
    say(f"running {a.model} on {a.clip} (image size {a.imgsz})")
    raw = find_people(a.clip, a.model, a.imgsz, a.device)
    if a.finds:
        Path(a.finds).parent.mkdir(parents=True, exist_ok=True)
        Path(a.finds).write_text(json.dumps(raw))
    return raw


# ---------------------------------------------------------------- 2. which person is the double

def prepare(raw: dict) -> list[list[dict]]:
    """Per frame, every found person with the measures the choice needs."""
    out = []
    for people in raw["frames"]:
        row = []
        for p in people:
            kp = np.array(p["kp"], dtype=np.float64)
            b = body_of(kp, p["box"])
            r, g, _ = p["rgb"]
            b.update({"conf": p["conf"], "kp": kp, "mint": g - r,
                      "sure": bool(min(kp[L_SHOULDER][2], kp[R_SHOULDER][2]) >= KP_SURE),
                      "seen": bool(min(kp[L_SHOULDER][2], kp[R_SHOULDER][2]) >= 0.2),
                      "ls": kp[L_SHOULDER][:2], "rs": kp[R_SHOULDER][:2]})
            row.append(b)
        out.append(row)
    return out


def people_who_stay(frames: list[list[dict]]) -> list[dict]:
    """People found in the same place for half the clip or more whose chest is not mint."""
    n = len(frames)
    groups: list[dict] = []
    for _ in range(2):                                # second round: against the groups' middles
        for g in groups:
            g["frames"], g["ls_all"], g["rs_all"], g["mint_all"] = set(), [], [], []
        for t, row in enumerate(frames):
            for p in row:
                if not p["seen"]:
                    continue
                home = None
                for g in groups:
                    tol = 0.3 * g["sw"] + 6
                    if np.hypot(*(p["ls"] - g["ls"])) < tol and np.hypot(*(p["rs"] - g["rs"])) < tol:
                        home = g
                        break
                if home is None:
                    home = {"ls": p["ls"].copy(), "rs": p["rs"].copy(), "sw": max(p["sw"], 20.0),
                            "frames": set(), "ls_all": [], "rs_all": [], "mint_all": []}
                    groups.append(home)
                home["frames"].add(t)
                home["ls_all"].append(p["ls"])
                home["rs_all"].append(p["rs"])
                home["mint_all"].append(p["mint"])
        groups = [g for g in groups if g["frames"]]
        for g in groups:
            g["ls"] = np.median(np.array(g["ls_all"]), axis=0)
            g["rs"] = np.median(np.array(g["rs_all"]), axis=0)
            g["sw"] = max(float(np.hypot(*(g["ls"] - g["rs"]))), 20.0)
    stay = []
    for g in groups:
        share = len(g["frames"]) / max(n, 1)
        mint = float(np.median(g["mint_all"]))
        if share >= STAY_SHARE and mint < MINT_FLOOR:
            stay.append({"ls": g["ls"], "rs": g["rs"], "sw": g["sw"], "share": share, "mint": mint,
                         "count": len(g["frames"])})
    return stay


def is_stayer(p: dict, stay: list[dict]) -> bool:
    for g in stay:
        tol = 0.3 * g["sw"] + 6
        if np.hypot(*(p["ls"] - g["ls"])) < tol and np.hypot(*(p["rs"] - g["rs"])) < tol:
            return True
    return False


def choose_path(frames: list[list[dict]], stay: list[dict]) -> tuple[list[dict | None], list[str]]:
    """One find per frame (or none): sure, mint in the chest, and not jumping between frames."""
    notes: list[str] = []
    n = len(frames)
    cands: list[list[dict]] = []
    for row in frames:
        keep = []
        for p in row:
            if not p["sure"] or is_stayer(p, stay):
                continue
            mint = min(1.0, max(0.0, (p["mint"] - 8.0) / 18.0))
            p["worth"] = p["conf"] * (0.35 + 0.65 * mint)
            keep.append(p)
        cands.append(keep)
    start_cost, reach = 1.5, 24
    best: dict[tuple[int, int], tuple[float, tuple[int, int] | None, bool]] = {}
    lead: list[tuple[float, tuple[int, int] | None]] = []     # best total over all frames before t
    top: tuple[float, tuple[int, int] | None] = (0.0, None)
    for t in range(n):
        lead.append(top)
        for i, c in enumerate(cands[t]):
            score, prev, fresh = lead[t][0] + c["worth"] - start_cost, lead[t][1], True
            for s in range(max(0, t - reach), t):
                for j, d in enumerate(cands[s]):
                    dt = t - s
                    jump = float(np.hypot(*(c["mid"] - d["mid"]))) / (0.5 * (c["size"] + d["size"]))
                    over = max(0.0, jump - 0.08 * dt - 0.05)
                    grow = max(0.0, abs(math.log(c["size"] / d["size"])) - 0.15 - 0.03 * dt)
                    cost = 6.0 * over * over + 2.0 * grow * grow + 0.04 * (dt - 1)
                    v = best[(s, j)][0] + c["worth"] - cost
                    if v > score:
                        score, prev, fresh = v, (s, j), False
            best[(t, i)] = (score, prev, fresh)
        for i in range(len(cands[t])):
            if best[(t, i)][0] > top[0]:
                top = (best[(t, i)][0], (t, i))
    chosen: list[dict | None] = [None] * n
    runs: list[list[int]] = [[]]
    node = top[1]
    while node is not None:
        t, i = node
        chosen[t] = cands[t][i]
        runs[-1].append(t)
        _, node, fresh = best[(t, i)]
        if fresh:
            runs.append([])
    for run in runs:                                  # a run whose chest is never mint is not the double
        if not run:
            continue
        mint = float(np.percentile([chosen[t]["mint"] for t in run], 75))
        if mint < MINT_FLOOR + 3:
            notes.append(f"dropped a run of {len(run)} frames ({min(run)} to {max(run)}): "
                         f"its chest is not mint (green minus red {mint:+.0f})")
            for t in run:
                chosen[t] = None
    return chosen, notes


# ---------------------------------------------------------------- 3 and 4. gaps and smoothing

def runs_of(flags: np.ndarray) -> list[tuple[int, int, bool]]:
    """(start, end inclusive, value) for each stretch of equal values."""
    out = []
    start = 0
    for i in range(1, len(flags) + 1):
        if i == len(flags) or flags[i] != flags[start]:
            out.append((start, i - 1, bool(flags[start])))
            start = i
    return out


def fill_short_gaps(series: np.ndarray, max_gap: int) -> np.ndarray:
    """Fill runs of missing values no longer than max_gap that have a value on both sides."""
    out = series.copy()
    known = ~np.isnan(series)
    for start, end, value in runs_of(known):
        if value or start == 0 or end == len(series) - 1 or end - start + 1 > max_gap:
            continue
        a, b = series[start - 1], series[end + 1]
        for t in range(start, end + 1):
            f = (t - start + 1) / (end - start + 2)
            out[t] = a + f * (b - a)
    return out


def tame_spikes(series: np.ndarray, floor: float) -> np.ndarray:
    """Pull a value that sits far from its neighbours' middle back to that middle."""
    out = series.copy()
    n = len(series)
    for t in range(n):
        lo, hi = max(0, t - 3), min(n, t + 4)
        win = series[lo:hi]
        med = float(np.median(win))
        mad = 1.4826 * float(np.median(np.abs(win - med)))
        if abs(series[t] - med) > max(4.0 * mad, floor):
            out[t] = med
    return out


def smooth(series: np.ndarray, sigma: float) -> np.ndarray:
    """Local curve fit with bell-shaped weights, looking both ways: no lag, and true at the ends."""
    n = len(series)
    if n < 4:
        return series.copy()
    out = np.empty(n)
    idx = np.arange(n, dtype=np.float64)
    half = int(math.ceil(3 * sigma))
    for t in range(n):
        lo, hi = max(0, t - half), min(n, t + half + 1)
        x = idx[lo:hi] - t
        wgt = np.exp(-0.5 * (x / sigma) ** 2)
        order = 2 if hi - lo >= 7 else 1
        coef = np.polyfit(x, series[lo:hi], order, w=np.sqrt(wgt))
        out[t] = coef[-1]
    return out


def hold_ends(series: np.ndarray) -> np.ndarray:
    """Fill what is still missing: straight between known values, the nearest value at the ends."""
    known = ~np.isnan(series)
    if not known.any():
        return series
    idx = np.arange(len(series))
    return np.interp(idx, idx[known], series[known])


# ---------------------------------------------------------------- 5. is the chest in view

def with_hysteresis(value: np.ndarray, go_on: float, go_off: float, ok: np.ndarray) -> np.ndarray:
    """True where value is over go_off in a stretch that somewhere reaches go_on (looks both ways)."""
    above = ok & (value >= go_off)
    out = np.zeros(len(value), dtype=bool)
    for start, end, flag in runs_of(above):
        if flag and (value[start:end + 1] >= go_on).any():
            out[start:end + 1] = True
    return out


def no_flicker(on: np.ndarray, hold: int, can_be_on: np.ndarray) -> np.ndarray:
    """A change counts only if the new state lasts `hold` frames."""
    out = on.copy()
    for start, end, flag in runs_of(out):             # short "off" inside "on": stay on, if the place is known
        if (not flag and end - start + 1 < hold and start > 0 and end < len(out) - 1
                and can_be_on[start:end + 1].all()):
            out[start:end + 1] = True
    for start, end, flag in runs_of(out):             # short "on": drop it
        if flag and end - start + 1 < hold:
            out[start:end + 1] = False
    return out


def fade_in_place(clip: str, w: int, h: int, chosen: list[dict | None], present: np.ndarray,
                  chest: np.ndarray, cut: float) -> tuple[np.ndarray, list[str]]:
    """How solid the double is (1 solid, 0 gone) where it fades away or in while standing still.

    Compares each frame's torso with the same place just after it vanished (or before it came)
    and with the place while it was solid. Frames that cannot be judged stay at 1. The value only
    falls towards the end it vanishes at, so a pulsing glow on a solid body does not count.
    """
    n = len(chosen)
    strength = np.ones(n)
    notes: list[str] = []
    jobs = []
    for start, end, flag in runs_of(present):
        if not flag or end - start + 1 < 12:
            continue
        for tail in (True, False):
            if tail and end + 6 >= n:                 # the clip ends with it: nothing to compare with
                continue
            if not tail and start - 6 < 0:
                continue
            edge = end if tail else start
            order = range(end, start - 1, -1) if tail else range(start, end + 1)
            ref = next((chosen[t] for t in order if chosen[t] is not None), None)
            if ref is None:
                continue
            still = []
            for t in order:                           # the stretch where it stands where it vanished
                if np.hypot(*(chest[t] - chest[edge])) > 0.25 * ref["size"]:
                    break
                still.append(t)
            if len(still) < 12:
                continue
            quads = np.array([[c["kp"][k][:2] for k in (L_SHOULDER, R_SHOULDER, R_HIP, L_HIP)]
                              for c in (chosen[t] for t in still) if c is not None and c["hips"]])
            if len(quads) < 6:
                continue
            quad = np.median(quads, axis=0)
            empty = list(range(end + 3, min(n, end + 11))) if tail else list(range(max(0, start - 10), start - 2))
            solid = still[-8:]                        # the far end of the still stretch: the most solid
            jobs.append({"quad": quad, "still": still, "empty": empty, "solid": solid, "tail": tail})
    if not jobs:
        return strength, notes
    need = {}
    for k, job in enumerate(jobs):
        x0, y0 = np.floor(job["quad"].min(axis=0)).astype(int)
        x1, y1 = np.ceil(job["quad"].max(axis=0)).astype(int) + 1
        job["box"] = (max(0, x0), max(0, y0), min(w, x1), min(h, y1))
        job["crops"] = {}
        for t in set(job["still"]) | set(job["empty"]):
            need.setdefault(t, []).append(k)
    for t, frame in enumerate(read_frames(clip, w, h)):
        for k in need.get(t, []):
            x0, y0, x1, y1 = jobs[k]["box"]
            jobs[k]["crops"][t] = frame[y0:y1, x0:x1].astype(np.float32)
    for job in jobs:
        x0, y0, x1, y1 = job["box"]
        yy, xx = np.mgrid[y0:y1, x0:x1]
        q = job["quad"]
        inside = np.ones(xx.shape, dtype=bool)
        sign = 0.0
        for i in range(4):                            # inside the four-sided torso (corners in order)
            ax, ay = q[i]
            bx, by = q[(i + 1) % 4]
            cross = (bx - ax) * (yy - ay) - (by - ay) * (xx - ax)
            if sign == 0.0:
                sign = 1.0 if np.median(cross) >= 0 else -1.0
            inside &= (cross * sign) >= 0
        back = np.median(np.array([job["crops"][t] for t in job["empty"] if t in job["crops"]]), axis=0)
        full = np.median(np.array([job["crops"][t] for t in job["solid"] if t in job["crops"]]), axis=0)
        diff = full - back
        power = (diff * diff).sum(axis=2)
        use = inside & (power > 3 * 12.0 ** 2)        # only where the solid double differs from the room
        if use.sum() < max(40, 0.15 * inside.sum()):
            notes.append("a fade could not be measured: the double hardly differs from what is behind it")
            continue
        vals = {}
        for t in job["still"]:
            a = ((job["crops"][t] - back) * diff).sum(axis=2)[use] / power[use]
            vals[t] = float(np.clip(np.median(a), 0.0, 1.2))
        ts = sorted(vals)
        v = np.array([vals[t] for t in ts])
        if len(v) >= 5:                               # a light smoothing, so one odd frame cannot flip it
            v = np.convolve(np.pad(v, 2, mode="edge"), np.ones(5) / 5, mode="valid")
        # only the last going (or the first coming) counts: a glow that pulses on a solid body is not a fade
        v = np.maximum.accumulate(v[::-1])[::-1] if job["tail"] else np.maximum.accumulate(v)
        if float(v.min()) >= cut:                     # never under the cut: not a fade that matters
            continue
        for t, a in zip(ts, v):
            strength[t] = min(strength[t], float(a))
        if job["tail"]:
            marks = [next((t for t, a in zip(ts, v) if a < level), None) for level in (0.9, 0.5, 0.1)]
            parts = [f"{name} from frame {m}" for name, m in zip(("under 90% solid", "under half", "under 10%"), marks)
                     if m is not None]
            notes.append(f"fades away standing still: {', '.join(parts)} (last found in frame {ts[-1]})")
        else:
            marks = [next((t for t, a in zip(ts, v) if a >= level), None) for level in (0.1, 0.5, 0.9)]
            parts = [f"{name} from frame {m}" for name, m in zip(("over 10% solid", "over half", "over 90%"), marks)
                     if m is not None]
            notes.append(f"fades in standing still: {', '.join(parts)} (first found in frame {ts[0]})")
    return strength, notes


# ---------------------------------------------------------------- the check picture

def check_picture(clip: str, w: int, h: int, fps: float, entries: list[dict], why: list[str], out: str,
                  count: int) -> None:
    n = len(entries)
    count = max(1, min(count, n))
    picks = [min(n - 1, int((i + 0.5) * n / count)) for i in range(count)]
    cols = 4 if count >= 4 else count
    rows = int(math.ceil(count / cols))
    cw = 640
    ch = int(round(cw * h / w))
    pad, head = 6, 44
    sheet = Image.new("RGB", (pad + cols * (cw + pad), head + rows * (ch + pad)), INK_DEEP)
    d = ImageDraw.Draw(sheet)
    on_frames = [e["f"] for e in entries if e["on"]]
    span = f"on in {len(on_frames)} of {n} frames" + (f" (first {on_frames[0]}, last {on_frames[-1]})" if on_frames else "")
    d.text((pad + 2, 8), f"chest_track: {Path(clip).name}   {span}   mint box = on, red cross = off",
           font=font(22, 700), fill=PAPER)
    want = {f: k for k, f in enumerate(picks)}
    f_lab = font(20)
    for t, frame in enumerate(read_frames(clip, w, h)):
        if t not in want:
            continue
        k = want[t]
        cell = Image.fromarray(np.ascontiguousarray(frame[:, :, ::-1])).resize((cw, ch), Image.LANCZOS)
        cd = ImageDraw.Draw(cell)
        e = entries[t]
        x, y, half = e["x"] * cw, e["y"] * ch, 0.5 * e["w"] * cw
        if e["on"]:
            tall = 0.45 * half                         # a box as wide as the shoulders, the shape of a tag
            cd.rectangle([x - half, y - tall, x + half, y + tall], outline=MINT, width=2)
            cd.ellipse([x - 3, y - 3, x + 3, y + 3], fill=MINT)
        else:
            r = 11
            cd.line([x - r, y - r, x + r, y + r], fill=RED, width=3)
            cd.line([x - r, y + r, x + r, y - r], fill=RED, width=3)
        label = f"frame {t}  {t / fps:.2f} s  {'on' if e['on'] else 'off: ' + why[t]}"
        box = cd.textbbox((8, 6), label, font=f_lab)
        cd.rectangle([box[0] - 5, box[1] - 4, box[2] + 5, box[3] + 4], fill=INK_DEEP)
        cd.text((8, 6), label, font=f_lab, fill=MINT if e["on"] else RED)
        sheet.paste(cell, (pad + (k % cols) * (cw + pad), head + (k // cols) * (ch + pad)))
    Path(out).parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out, quality=90)


# ---------------------------------------------------------------- main

def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("clip")
    ap.add_argument("out")
    ap.add_argument("--check")
    ap.add_argument("--frames", type=int, default=8, help="how many frames the check picture shows")
    ap.add_argument("--table", action="store_true")
    ap.add_argument("--finds")
    ap.add_argument("--model", default="yolo11x-pose.pt")
    ap.add_argument("--imgsz", type=int, default=1280)
    ap.add_argument("--device", default="auto")
    ap.add_argument("--gap", type=int, default=6, help="longest gap, in frames, that is filled in")
    ap.add_argument("--hold", type=int, default=4, help="frames a new on/off state must last")
    ap.add_argument("--turn-on", type=float, default=0.45)
    ap.add_argument("--turn-off", type=float, default=0.40)
    ap.add_argument("--apart", type=float, default=1.25, help="shoulder widths between the double and a person who stays put")
    ap.add_argument("--sure", type=float, default=0.5, help="the model's confidence, averaged over half a second")
    ap.add_argument("--hidden-ok", action="store_true", help="count the chest as in view even when the hips are hidden")
    ap.add_argument("--fade-cut", type=float, default=0.5, help="on goes false under this solidity")
    ap.add_argument("--smooth", type=float, default=3.0, help="smoothing of the place, in frames")
    a = ap.parse_args()

    raw = load_or_find(a)
    w, h, fps = raw["w"], raw["h"], raw["fps"]
    frames = prepare(raw)
    n = len(frames)
    if n == 0:
        raise SystemExit(f"no frame could be read from {a.clip}")

    stay = people_who_stay(frames)
    for g in stay:
        mid = 0.5 * (g["ls"] + g["rs"])
        say(f"set aside, stays put and is not mint: a person with shoulders around {mid[0] / w:.3f},{mid[1] / h:.3f} "
            f"(found in {g['count']} of {n} frames, chest green minus red {g['mint']:+.0f})")
    chosen, notes = choose_path(frames, stay)
    for note in notes:
        say(note)

    found = np.array([c is not None for c in chosen])
    if not found.any():
        say("WARNING: the double was not found in any frame: every entry is off")
        entries = [{"f": t, "x": 0.5, "y": 0.5, "w": 0.0, "on": False} for t in range(n)]
        why = ["not there"] * n
    else:
        first, last = int(np.argmax(found)), int(n - 1 - np.argmax(found[::-1]))
        missed = int((~found[first:last + 1]).sum())
        gaps = [(s, e) for s, e, flag in runs_of(found[first:last + 1]) if not flag]
        long_gaps = [(s + first, e + first) for s, e in gaps if e - s + 1 > a.gap]
        say(f"the double: found in {int(found.sum())} of {n} frames, first in frame {first}, last in frame {last}; "
            f"the pose model missed it in {missed} frames in between "
            f"({len(gaps)} gaps, longest {max((e - s + 1 for s, e in gaps), default=0)} frames)")
        if long_gaps:
            say(f"  gaps longer than {a.gap} frames are left empty (on is false there): {long_gaps}")

        nan = float("nan")
        cols = {k: np.full(n, nan) for k in ("mx", "my", "ax", "ay", "dx", "dy", "full", "conf")}
        for t, c in enumerate(chosen):
            if c is None:
                continue
            cols["mx"][t], cols["my"][t] = c["mid"]
            cols["ax"][t], cols["ay"][t] = c["across"]
            cols["full"][t], cols["conf"][t] = c["full"], c["conf"]
            if c["hips"]:
                cols["dx"][t], cols["dy"][t] = c["down"]
        if np.isnan(cols["dx"]).all():                # hips never seen: use the guessed torso lines
            say("WARNING: the double's hips were never found: the torso line is a guess, check the picture")
            for t, c in enumerate(chosen):
                if c is not None:
                    cols["dx"][t], cols["dy"][t] = c["down"]
        for k in ("mx", "my", "ax", "ay"):
            cols[k] = fill_short_gaps(cols[k], a.gap)
        present = ~np.isnan(cols["mx"])               # found, or inside a short gap that was filled
        for start, end, flag in runs_of(present):
            if not flag:
                continue
            seg = slice(start, end + 1)
            for k in ("dx", "dy", "full"):            # bridge frames where the hips or the limbs hid
                part = cols[k][seg]
                cols[k][seg] = hold_ends(part) if not np.isnan(part).all() else part
            for k, sigma, floor in (("mx", a.smooth, 6.0), ("my", a.smooth, 6.0), ("ax", 2 * a.smooth, 8.0),
                                    ("ay", 2 * a.smooth, 8.0), ("dx", 2 * a.smooth, 12.0), ("dy", 2 * a.smooth, 12.0),
                                    ("full", 4 * a.smooth, 10.0)):
                part = cols[k][seg]
                if np.isnan(part).any():
                    continue
                cols[k][seg] = smooth(tame_spikes(part, floor), sigma)
        for k in ("dx", "dy"):                        # a stretch with no hips at all borrows from its neighbours
            cols[k] = np.where(present, hold_ends(cols[k]), nan)
        torso = np.hypot(cols["dx"], cols["dy"])
        if np.isnan(cols["full"]).all():              # no limb ever sure: fall back on the torso alone
            cols["full"] = torso / 1.45
        cols["full"] = np.where(present, hold_ends(cols["full"]), nan)

        chest = np.stack([cols["mx"] + CHEST_DROP * cols["dx"], cols["my"] + CHEST_DROP * cols["dy"]], axis=1)
        width = np.hypot(cols["ax"], cols["ay"])
        with np.errstate(invalid="ignore", divide="ignore"):
            # the shoulder line measured square to the torso, signed (front +, back -), over the full-front width
            turn = (cols["ax"] * cols["dy"] - cols["ay"] * cols["dx"]) / (torso * cols["full"])
        turn = np.where(present, turn, -9.0)

        apart = np.ones(n, dtype=bool)                # not on top of a person who stays put
        for g in stay:
            gm = 0.5 * (g["ls"] + g["rs"])
            with np.errstate(invalid="ignore"):
                far = np.hypot(cols["mx"] - gm[0], cols["my"] - gm[1]) >= a.apart * cols["full"]
            apart &= np.where(present, far, True)
        # the turn is measured, not borrowed: hips and two limbs found in that frame (short gaps bridged)
        seen = np.array([1.0 if c is not None and c["hips"] and not math.isnan(c["full"]) else float("nan")
                         for c in chosen])
        whole = ~np.isnan(fill_short_gaps(seen, a.gap)) | bool(a.hidden_ok)
        conf = np.where(np.isnan(cols["conf"]), 0.0, cols["conf"])
        got = (~np.isnan(cols["conf"])).astype(float)
        box = np.ones(2 * max(1, int(round(fps / 4))) + 1)        # about half a second
        sure = np.convolve(conf, box, mode="same") / np.maximum(np.convolve(got, box, mode="same"), 1.0) >= a.sure

        strength, fade_notes = fade_in_place(a.clip, w, h, chosen, present, np.nan_to_num(chest), a.fade_cut)
        for note in fade_notes:
            say("  " + note)
        solid = strength >= a.fade_cut
        facing = with_hysteresis(turn, a.turn_on, a.turn_off, present)
        fine = present & solid & apart & sure & whole
        on = no_flicker(facing & fine, a.hold, fine)

        why = ["" if on[t] else "not there" if not present[t] else "on a person who stays put" if not apart[t]
               else "half hidden" if not whole[t] else "faded" if not solid[t] else "unsure" if not sure[t]
               else "turned away" if not facing[t] else "too short a moment" for t in range(n)]
        px, py, pw = hold_ends(chest[:, 0]), hold_ends(chest[:, 1]), hold_ends(width)
        entries = [{"f": t, "x": round(float((px[t] + 0.5) / w), 5), "y": round(float((py[t] + 0.5) / h), 5),
                    "w": round(float(pw[t] / w), 5), "on": bool(on[t])} for t in range(n)]
        spans = [(s, e) for s, e, flag in runs_of(on) if flag]
        say("on: " + (", ".join(f"frames {s} to {e} ({s / fps:.2f} to {e / fps:.2f} s)" for s, e in spans) or "never"))
        if a.table:
            say("frame found conf  x      y      w      turn  solid apart sure whole on")
            for t in range(n):
                c = chosen[t]
                say(f"{t:5d} {'yes' if c else ' . '}  {c['conf'] if c else 0:.2f} {entries[t]['x']:.4f} {entries[t]['y']:.4f} "
                    f"{entries[t]['w']:.4f} {turn[t] if present[t] else float('nan'):+.2f} {strength[t]:.2f}  "
                    f"{'y' if apart[t] else 'n'}     {'y' if sure[t] else 'n'}    {'y' if whole[t] else 'n'}     "
                    f"{'ON' if on[t] else '- ' + why[t]}")

    Path(a.out).parent.mkdir(parents=True, exist_ok=True)
    Path(a.out).write_text("[\n" + ",\n".join(json.dumps(e) for e in entries) + "\n]\n")
    say(f"wrote {a.out}: {n} entries")
    if a.check:
        check_picture(a.clip, w, h, fps, entries, why, a.check, a.frames)
        say(f"wrote {a.check}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
