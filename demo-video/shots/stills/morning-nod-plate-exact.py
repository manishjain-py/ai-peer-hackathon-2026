#!/usr/bin/env -S uv run --quiet --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow>=10", "numpy>=1.26"]
# ///
"""morning-nod-plate-exact: a background plate that equals the base still everywhere except
where the double stood.

    uv run --quiet demo-video/shots/stills/morning-nod-plate-exact.py \
        BASE.png PLATE.png OUT.png OUT_MASK.png [left limit of the search, in px, default 1500]

Why: the image model's edit that removed the double (PLATE) also repainted the rest of the
picture a little: a few levels of tone and fresh grain everywhere, and hairline changes on
edges. A fade made by code from BASE to PLATE would then shift the whole room, not only the
double. This keeps BASE's own pixels wherever the double was not.

How:
  1. PLATE is tone-matched to BASE (one gain and one offset per colour channel, fitted on the
     pixels that barely differ);
  2. the place where the two still differ by more than 6 levels after a light blur is the
     double with his glow and the tint he cast on the desk; only the part right of the left
     limit is taken (the man in the foreground is left of it);
  3. that place is grown by about 48 px and feathered over about 50 px: this is the mask;
  4. OUT = PLATE (tone-matched) inside the mask, BASE outside it.
It prints how much of the picture the mask covers and what is left just outside it.
"""
from __future__ import annotations

import sys

import numpy as np
from PIL import Image, ImageFilter

Q = 4  # the mask is worked out at a quarter of the size (fast), then scaled back up


def main() -> int:
    if len(sys.argv) < 5:
        print(__doc__)
        return 2
    base_path, plate_path, out_path, mask_path = sys.argv[1:5]
    left_limit = int(sys.argv[5]) if len(sys.argv) > 5 else 1500
    base8 = np.asarray(Image.open(base_path).convert("RGB"))
    base = base8.astype(np.float64)
    plate = np.asarray(Image.open(plate_path).convert("RGB"), dtype=np.float64)
    if base.shape != plate.shape:
        print(f"sizes differ: {base.shape} vs {plate.shape}")
        return 2
    h, w = base.shape[:2]

    # 1. tone match on the pixels that barely differ
    near = np.abs(plate - base).max(axis=2) < 20
    matched = np.empty_like(plate)
    for c in range(3):
        gain, offset = np.polyfit(plate[..., c][near][::5], base[..., c][near][::5], 1)
        matched[..., c] = plate[..., c] * gain + offset
        print(f"channel {'RGB'[c]}: gain {gain:.4f} offset {offset:+.2f}")
    before = float(np.abs(plate - base)[near].mean())
    after = float(np.abs(matched - base)[near].mean())
    print(f"mean difference on the shared pixels: {before:.2f} -> {after:.2f} levels")

    # 2. where they still differ: the double, his glow, his tint on the desk (quarter size)
    hq, wq = h // Q, w // Q
    diff_full = np.abs(matched - base).mean(axis=2)
    diff = diff_full[: hq * Q, : wq * Q].reshape(hq, Q, wq, Q).mean(axis=(1, 3))  # box blur by 4
    diff_im = Image.fromarray(np.clip(diff * 8, 0, 255).astype(np.uint8)).filter(ImageFilter.GaussianBlur(1.5))
    diff = np.asarray(diff_im, dtype=np.float64) / 8
    core = diff > 6
    core[:, : left_limit // Q] = False

    # 3. grow by about 48 px and feather
    core_im = Image.fromarray((core * 255).astype(np.uint8))
    grown = core_im.filter(ImageFilter.MaxFilter(25))  # 12 px at quarter size = 48 px
    soft = grown.filter(ImageFilter.GaussianBlur(4))  # about 16 px at full size on each side
    alpha_q = np.maximum(np.asarray(soft, dtype=np.float64) / 255.0, core.astype(np.float64))
    alpha_im = Image.fromarray(np.clip(alpha_q * 255, 0, 255).astype(np.uint8)).resize((w, h), Image.BICUBIC)
    alpha = np.asarray(alpha_im.filter(ImageFilter.GaussianBlur(3)), dtype=np.float64) / 255.0
    alpha[alpha < 0.004] = 0.0

    # 4. composite
    out = matched * alpha[..., None] + base * (1 - alpha[..., None])
    out8 = np.clip(np.rint(out), 0, 255).astype(np.uint8)
    Image.fromarray(out8).save(out_path)
    Image.fromarray(np.clip(np.rint(alpha * 255), 0, 255).astype(np.uint8)).save(mask_path)

    ys, xs = np.where(alpha > 0)
    print(f"mask: {(alpha > 0).mean():.1%} of the picture, box x {xs.min()}..{xs.max()}, y {ys.min()}..{ys.max()}")
    outside = alpha == 0
    print(f"outside the mask the plate equals the base pixel for pixel: {np.array_equal(out8[outside], base8[outside])}")
    # what is left of the double just outside the mask: the difference in a ring of about 60 px
    ring_q = np.asarray(grown.filter(ImageFilter.MaxFilter(31)), dtype=np.float64) > 0
    outside_q = np.asarray(Image.fromarray((outside * 255).astype(np.uint8)).resize((wq, hq), Image.NEAREST)) > 0
    ring_q &= outside_q
    ring_q[:, : left_limit // Q] = False
    rest_q = outside_q.copy()
    rest_q[:, : left_limit // Q] = False
    if ring_q.any():
        print(f"ring of about 60 px round the mask: mean difference {diff[ring_q].mean():.2f}, "
              f"largest {diff[ring_q].max():.2f} levels; all of the picture outside the mask, right of the "
              f"limit: mean {diff[rest_q].mean():.2f}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
