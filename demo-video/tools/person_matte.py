#!/usr/bin/env -S uv run --quiet --python 3.12 --script
# /// script
# requires-python = ">=3.10,<3.13"
# dependencies = ["ultralytics>=8.3", "numpy>=1.26"]
# ///
"""person_matte: a grey matte video of the person in a clip (white is the person), made on this Mac.

    uv run --quiet --python 3.12 demo-video/tools/person_matte.py CLIP.mp4 MATTE.mp4

It runs an open segmentation model (Ultralytics YOLO, the "person" class) on every frame. Nothing
is sent anywhere and nothing is paid. A frame where the model finds nobody keeps the matte of
the frame before it; the count of such frames is printed, so a weak matte is not a surprise.
The model file (about 120 MB) is downloaded once into the folder the command is run from.
"""
from __future__ import annotations

import json
import subprocess
import sys

import numpy as np


def probe(path: str) -> tuple[int, int, float]:
    out = subprocess.run(
        ["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
         "stream=width,height,r_frame_rate", "-of", "json", path],
        capture_output=True, text=True, check=True,
    )
    s = json.loads(out.stdout)["streams"][0]
    num, den = s["r_frame_rate"].split("/")
    return int(s["width"]), int(s["height"]), float(num) / float(den)


def main() -> int:
    if len(sys.argv) < 3:
        print(__doc__)
        return 2
    clip, matte = sys.argv[1], sys.argv[2]
    model_name = sys.argv[3] if len(sys.argv) > 3 else "yolo11x-seg.pt"
    import torch
    from ultralytics import YOLO

    w, h, fps = probe(clip)
    model = YOLO(model_name)
    device = "mps" if torch.backends.mps.is_available() else "cpu"
    reader = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-i", clip, "-f", "rawvideo", "-pix_fmt", "bgr24", "-"],
        stdout=subprocess.PIPE,
    )
    writer = subprocess.Popen(
        ["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "gray", "-s", f"{w}x{h}",
         "-r", f"{fps}", "-i", "-", "-c:v", "libx264", "-crf", "12", "-pix_fmt", "yuv420p", matte],
        stdin=subprocess.PIPE,
    )
    size = w * h * 3
    last = np.zeros((h, w), dtype=np.uint8)
    n = missed = 0
    while True:
        buf = reader.stdout.read(size)
        if len(buf) < size:
            break
        frame = np.frombuffer(buf, dtype=np.uint8).reshape(h, w, 3)
        try:
            res = model.predict(frame, classes=[0], retina_masks=True, conf=0.2, imgsz=max(w, h),
                                verbose=False, device=device)[0]
        except Exception:
            if device == "cpu":
                raise
            device = "cpu"   # some Macs lack an operation on the GPU path: fall back once
            res = model.predict(frame, classes=[0], retina_masks=True, conf=0.2, imgsz=max(w, h),
                                verbose=False, device=device)[0]
        if res.masks is not None and len(res.masks.data):
            masks = res.masks.data.cpu().numpy()
            if masks.shape[1:] != (h, w):
                masks = masks[:, :h, :w]
            last = (masks.max(axis=0) > 0.5).astype(np.uint8) * 255
        else:
            missed += 1
        writer.stdin.write(last.tobytes())
        n += 1
        if n % 48 == 0:
            print(f"  {n} frames", flush=True)
    writer.stdin.close()
    writer.wait()
    print(f"wrote {matte}: {n} frames, {w}x{h}; no person found in {missed} frames (device {device})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
