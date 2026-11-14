#!/usr/bin/env -S uv run --quiet
# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy"]
# ///
"""tag_track: a frame-by-frame track of the double's chest, for the "AI Peer" tag.

  uv run --quiet demo-video/film/tools/tag_track.py            every slot that has tag_keys
  uv run --quiet demo-video/film/tools/tag_track.py reveal-rise

WP3 gives a track with each final clip (SHOTS.md, "tag_track"). Until it does, the tag is
placed from a few keys set by hand in shots.json ("tag_keys": where the chest is at some
moments of the slot). Between keys a hand can only guess, so this tool follows the chest light
itself: near each guessed place it finds the centre of the mint glow, frame by frame. A key
with "fix": true is trusted as it is (the chest light is not in view there). The result is
written in WP3's own format, one entry per clip frame, so the film reads both the same way:

  assets/tags/<clip name>.tag.json   [{"f": 0, "x": 0.41, "y": 0.37, "w": 0.06, "on": true}, ...]

x, y: the middle of the chest; w: the width of the shoulders; all fractions of the frame.
"""
import json
import subprocess
import sys
from pathlib import Path

import numpy as np

FILM = Path(__file__).resolve().parent.parent
W, H = 960, 540          # the size the frames are read at
REACH = 0.042            # how far from the guess the glow is looked for (fraction of the width)


def interp(keys, t):
    """The guessed chest at a slot time: straight lines between keys, held outside them."""
    if t <= keys[0]["t"]:
        return keys[0], keys[0]
    if t >= keys[-1]["t"]:
        return keys[-1], keys[-1]
    i = 0
    while keys[i + 1]["t"] <= t:
        i += 1
    a, b = keys[i], keys[i + 1]
    k = (t - a["t"]) / (b["t"] - a["t"])
    return {n: a[n] + (b[n] - a[n]) * k for n in ("x", "y", "w")}, (a if k < 0.5 else b)


def glow_centre(frame, x, y):
    """The centre of the mint glow near (x, y), or None when there is too little of it."""
    rgb = frame.astype(np.float32)
    r, g, b = rgb[..., 0], rgb[..., 1], rgb[..., 2]
    lum = (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255.0
    mint = np.clip(g - 0.5 * (r + b) - 5.0, 0, None) ** 2 * lum      # green above red and blue, and bright
    yy, xx = np.mgrid[0:H, 0:W]
    cx, cy = x * W, y * H
    radius = REACH * W
    total = 0.0
    for _ in range(5):
        mask = (xx - cx) ** 2 + (yy - cy) ** 2 <= radius ** 2
        weight = mint * mask
        total = float(weight.sum())
        if total < 40.0:
            return None
        cx, cy = float((weight * xx).sum() / total), float((weight * yy).sum() / total)
    return cx / W, cy / H


def track(slot, pulled):
    keys_spec = slot["tag_keys"]
    clip = FILM / slot["clip"]
    if clip.name != keys_spec["for"]:
        print(f"{slot['id']}: the keys are for {keys_spec['for']}, the clip is {clip.name}: skipped")
        return
    info = json.loads(subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                                      "stream=nb_frames,r_frame_rate", "-of", "json", str(clip)],
                                     capture_output=True, text=True, check=True).stdout)["streams"][0]
    num, den = (int(v) for v in info["r_frame_rate"].split("/"))
    fps, count = num / den, int(info["nb_frames"])
    use_from = pulled.get(slot["id"], {}).get("use_from_s", 0)
    keys = sorted(keys_spec["keys"], key=lambda k: k["t"])
    off = keys_spec.get("off", [])
    proc = subprocess.Popen(["ffmpeg", "-hide_banner", "-loglevel", "error", "-nostdin", "-i", str(clip),
                             "-vf", f"scale={W}:{H}:flags=area", "-pix_fmt", "rgb24", "-f", "rawvideo", "-"],
                            stdout=subprocess.PIPE)
    out, followed, kept = [], 0, 0
    for f in range(count):
        raw = proc.stdout.read(W * H * 3)
        if len(raw) < W * H * 3:
            break
        local = f / fps - use_from
        guess, near = interp(keys, local)
        on = not any(a <= local < b for a, b in off)
        x, y = guess["x"], guess["y"]
        if on and not near.get("fix"):
            found = glow_centre(np.frombuffer(raw, np.uint8).reshape(H, W, 3), x, y)
            if found and abs(found[0] - x) < 0.05 and abs(found[1] - y) < 0.07:
                x, y = found
                followed += 1
            else:
                kept += 1
        out.append({"f": f, "x": round(x, 4), "y": round(y, 4), "w": round(guess["w"], 4), "on": on})
    proc.stdout.close()
    proc.wait()
    dest = FILM / "assets" / "tags" / (clip.stem + ".tag.json")
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text("[\n" + ",\n".join(json.dumps(e) for e in out) + "\n]\n")
    shown = sum(1 for e in out if e["on"])
    print(f"{slot['id']}: {len(out)} frames, chest in view on {shown}; the glow was followed on {followed}, the hand's guess kept on {kept} -> {dest.relative_to(FILM)}")


def main():
    shots = json.loads((FILM / "shots.json").read_text())
    pulled_path = FILM / "shots.pulled.json"
    pulled = json.loads(pulled_path.read_text())["slots"] if pulled_path.exists() else {}
    want = set(sys.argv[1:])
    for slot in shots["slots"]:
        if slot.get("tag_keys") and slot.get("clip") and (not want or slot["id"] in want):
            track(slot, pulled)


if __name__ == "__main__":
    main()
