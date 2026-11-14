#!/usr/bin/env -S uv run --quiet --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow>=10"]
# ///
"""sheet: build one labelled contact sheet (JPEG) from a small JSON spec.

    uv run --quiet demo-video/tools/sheet.py demo-video/look/characters/characters.sheet.json

Spec (paths are from the repo root):
  {
    "out": "demo-video/look/characters/characters.jpg",
    "width": 2400,
    "columns": 3,
    "title": "Three possible employees",
    "subtitle": "all invented, all AI-made",
    "cells": [
      {"image": "demo-video/look/characters/a-portrait.jpg", "label": "A", "text": "what it shows"},
      {"image": "demo-video/look/characters/a-full.jpg"}
    ]
  }

Cells fill the grid row by row. Every picture is scaled to the column width; a row is as tall
as its tallest picture. A cell with a "label" or "text" gets a heading above its picture.
Colours and font are the product's identity: ink, paper, mint, Manrope.
"""
from __future__ import annotations

import json
import subprocess
import sys
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

INK = (21, 43, 49)        # #152b31
INK_DEEP = (12, 26, 30)
PAPER = (246, 244, 238)   # #f6f4ee
MINT = (183, 244, 207)    # #b7f4cf
MUTED = (150, 170, 172)
FONT_FILE = Path(__file__).resolve().parent / "fonts" / "Manrope[wght].ttf"
FALLBACKS = ["/System/Library/Fonts/Helvetica.ttc", "/System/Library/Fonts/Supplemental/Arial.ttf"]


def font(size: int, weight: int = 500) -> ImageFont.FreeTypeFont:
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


def repo_root() -> Path:
    out = subprocess.run(
        ["git", "-C", str(Path(__file__).resolve().parent), "rev-parse", "--show-toplevel"],
        capture_output=True, text=True,
    )
    return Path(out.stdout.strip()) if out.returncode == 0 else Path(__file__).resolve().parents[2]


def build(spec: dict, root: Path) -> Path:
    width = int(spec.get("width", 2400))
    cols = int(spec["columns"])
    scale = width / 2400
    margin, gap = round(48 * scale), round(24 * scale)
    cell_w = (width - 2 * margin - (cols - 1) * gap) // cols
    title_font, sub_font = font(round(54 * scale), 700), font(round(28 * scale), 500)
    label_font, text_font = font(round(44 * scale), 800), font(round(25 * scale), 500)
    head_h = round(72 * scale)

    cells = spec["cells"]
    rows = [cells[i:i + cols] for i in range(0, len(cells), cols)]
    laid = []
    for row in rows:
        images = []
        for cell in row:
            im = Image.open(root / cell["image"]).convert("RGB")
            h = round(im.height * cell_w / im.width)
            images.append(im.resize((cell_w, h), Image.LANCZOS))
        has_head = any(c.get("label") or c.get("text") for c in row)
        laid.append((row, images, has_head, max(i.height for i in images)))

    top = margin
    if spec.get("title"):
        top += round(64 * scale)
    if spec.get("subtitle"):
        top += round(44 * scale)
    if spec.get("title") or spec.get("subtitle"):
        top += round(22 * scale)
    height = top + sum((head_h if hh else 0) + rh + gap for _, _, hh, rh in laid) - gap + margin

    sheet = Image.new("RGB", (width, height), INK_DEEP)
    draw = ImageDraw.Draw(sheet)
    y = margin
    if spec.get("title"):
        draw.text((margin, y), spec["title"], font=title_font, fill=PAPER)
        y += round(64 * scale)
    if spec.get("subtitle"):
        draw.text((margin, y + round(6 * scale)), spec["subtitle"], font=sub_font, fill=MUTED)

    y = top
    for row, images, has_head, row_h in laid:
        for i, (cell, im) in enumerate(zip(row, images)):
            x = margin + i * (cell_w + gap)
            if has_head:
                tx = x
                if cell.get("label"):
                    draw.text((tx, y + round(4 * scale)), cell["label"], font=label_font, fill=MINT)
                    tx += round(draw.textlength(cell["label"], font=label_font)) + round(18 * scale)
                if cell.get("text"):
                    draw.text((tx, y + round(24 * scale)), cell["text"], font=text_font, fill=PAPER)
            sheet.paste(im, (x, y + (head_h if has_head else 0)))
        y += (head_h if has_head else 0) + row_h + gap

    out = root / spec["out"]
    out.parent.mkdir(parents=True, exist_ok=True)
    sheet.save(out, quality=int(spec.get("quality", 90)), optimize=True)
    return out


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__)
        return 2
    root = repo_root()
    spec = json.loads(Path(sys.argv[1]).read_text())
    out = build(spec, root)
    with Image.open(out) as im:
        print(f"wrote {out.relative_to(root)} {im.width}x{im.height} ({out.stat().st_size:,} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
