#!/usr/bin/env -S uv run --quiet --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow>=10", "numpy>=1.26"]
# ///
"""align_check: do edited frames still share the base frame's room and camera?

    uv run --quiet demo-video/tools/align_check.py BASE.png EDIT.png [EDIT.png ...]

For each edit it prints:
  shift   the whole-picture offset against the base, in pixels at full size (phase correlation
          on a half-size grey copy); 0,0 means the camera did not move;
  same    the share of the picture where the edit is within 6% of the base's brightness
          (an edit that only adds a figure should keep most of the picture);
  grid    a 4 x 8 map of the mean difference per tile (0 to 9; 0 is identical), to see where
          the picture changed.
"""
from __future__ import annotations

import sys

import numpy as np
from PIL import Image


def grey(path: str, size: tuple[int, int] | None = None) -> np.ndarray:
    im = Image.open(path).convert("L")
    if size:
        im = im.resize(size, Image.LANCZOS)
    return np.asarray(im, dtype=np.float32) / 255.0


def shift(a: np.ndarray, b: np.ndarray) -> tuple[int, int, float]:
    """Offset of b against a by phase correlation. Returns (dx, dy, peak strength)."""
    window = np.outer(np.hanning(a.shape[0]), np.hanning(a.shape[1]))
    fa, fb = np.fft.fft2((a - a.mean()) * window), np.fft.fft2((b - b.mean()) * window)
    cross = fa * np.conj(fb)
    corr = np.fft.ifft2(cross / (np.abs(cross) + 1e-9)).real
    peak = np.unravel_index(np.argmax(corr), corr.shape)
    dy = peak[0] if peak[0] <= a.shape[0] // 2 else peak[0] - a.shape[0]
    dx = peak[1] if peak[1] <= a.shape[1] // 2 else peak[1] - a.shape[1]
    return int(-dx), int(-dy), float(corr.max())


def main() -> int:
    if len(sys.argv) < 3:
        print(__doc__)
        return 2
    base_path, edits = sys.argv[1], sys.argv[2:]
    with Image.open(base_path) as im:
        full = im.size
    half = (full[0] // 2, full[1] // 2)
    base = grey(base_path, half)
    for path in edits:
        with Image.open(path) as im:
            size_note = "" if im.size == full else f"  SIZE DIFFERS {im.size} vs {full}"
        edit = grey(path, half)
        dx, dy, peak = shift(base, edit)
        diff = np.abs(edit - base)
        same = float((diff < 0.06).mean())
        rows, cols = 4, 8
        th, tw = diff.shape[0] // rows, diff.shape[1] // cols
        print(f"{path}{size_note}")
        print(f"  shift {dx * 2:+d},{dy * 2:+d} px (peak {peak:.2f})   same {same:.1%}")
        for r in range(rows):
            tiles = [diff[r * th:(r + 1) * th, c * tw:(c + 1) * tw].mean() for c in range(cols)]
            print("  grid  " + " ".join(str(min(9, int(t * 60))) for t in tiles))
    return 0


if __name__ == "__main__":
    sys.exit(main())
