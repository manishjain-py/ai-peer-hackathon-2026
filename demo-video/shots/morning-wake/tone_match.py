#!/usr/bin/env -S uv run --quiet --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow>=10", "numpy>=1.26"]
# ///
"""tone_match: give one still the tone of another still of the same room and camera.

    uv run --quiet tone_match.py SOURCE.png REFERENCE.png OUT.png [x:y:w:h ...]

Every edit of a still by the image model lifts the room's tone a little (about 4 levels of red
per edit, measured on the morning-wake stills). A first frame that was edited twice then no
longer matches a last frame that was edited once, and the video drifts in colour between them.

This fits, per colour channel, one gain and one offset that take SOURCE to REFERENCE on the
pixels both stills share (everything outside the boxes given, which are in fractions of the
frame and mark where the pictures really differ, such as the man), and applies them to the
whole of SOURCE. Nothing is moved or repainted: it is a colour correction only.
"""
from __future__ import annotations

import sys

import numpy as np
from PIL import Image


def main() -> int:
    if len(sys.argv) < 4:
        print(__doc__)
        return 2
    src_path, ref_path, out_path, boxes = sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4:]
    src = np.asarray(Image.open(src_path).convert("RGB"), dtype=np.float64)
    ref = np.asarray(Image.open(ref_path).convert("RGB"), dtype=np.float64)
    if src.shape != ref.shape:
        print(f"sizes differ: {src.shape} vs {ref.shape}")
        return 2
    h, w = src.shape[:2]
    use = np.ones((h, w), dtype=bool)
    for box in boxes:
        x, y, bw, bh = (float(v) for v in box.split(":"))
        use[int(y * h):int((y + bh) * h), int(x * w):int((x + bw) * w)] = False
    # leave out pixels that differ a lot (an object that changed outside the boxes)
    use &= np.abs(src - ref).max(axis=2) < 40
    out = np.empty_like(src)
    for c in range(3):
        s, r = src[..., c][use], ref[..., c][use]
        gain, offset = np.polyfit(s, r, 1)
        out[..., c] = src[..., c] * gain + offset
        before = float(np.abs(s - r).mean())
        after = float(np.abs(s * gain + offset - r).mean())
        print(f"channel {'RGB'[c]}: gain {gain:.4f} offset {offset:+.2f}; mean difference on shared pixels {before:.2f} -> {after:.2f}")
    Image.fromarray(np.clip(np.rint(out), 0, 255).astype(np.uint8)).save(out_path)
    print(f"wrote {out_path} ({use.mean():.0%} of the picture used for the fit)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
