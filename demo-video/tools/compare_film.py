#!/usr/bin/env -S uv run --quiet --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["pillow>=10"]
# ///
"""compare_film: put up to three takes side by side in one 1080p film, each with a label.

    uv run --quiet demo-video/tools/compare_film.py demo-video/look/hero-tests/hero-compare.json

The picture is a 2 x 2 grid of 960 x 540 cells: the takes fill the first cells and the last
cell holds the legend. A take shorter than the film holds its last frame. No sound.
Labels are drawn with Pillow and laid over the video (this Mac's ffmpeg has no text filter).

Spec (paths from the repo root):
  {"out": "...mp4", "seconds": 12.25, "title": "...",
   "panels": [{"clip": "...mp4", "label": "K", "text": "Kling 4.0, key frames", "cost": "$1.57 per take"}],
   "legend": ["one line", "another line"]}
"""
from __future__ import annotations

import json
import subprocess
import sys
import tempfile
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

INK_DEEP = (12, 26, 30)
PAPER = (246, 244, 238)
MINT = (183, 244, 207)
MUTED = (150, 170, 172)
FONT_FILE = Path(__file__).resolve().parent / "fonts" / "Manrope[wght].ttf"
W, H, CW, CH = 1920, 1080, 960, 540


def font(size: int, weight: int = 500):
    if FONT_FILE.exists():
        f = ImageFont.truetype(str(FONT_FILE), size)
        try:
            f.set_variation_by_axes([weight])
        except (OSError, AttributeError):
            pass
        return f
    return ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", size)


def labels(spec: dict) -> Image.Image:
    layer = Image.new("RGBA", (W, H), (0, 0, 0, 0))
    draw = ImageDraw.Draw(layer)
    cells = [(0, 0), (CW, 0), (0, CH), (CW, CH)]
    for (x, y), panel in zip(cells, spec["panels"]):
        draw.rectangle([x, y, x + CW, y + 58], fill=(*INK_DEEP, 205))
        draw.text((x + 22, y + 6), panel["label"], font=font(36, 800), fill=MINT)
        tx = x + 22 + draw.textlength(panel["label"], font=font(36, 800)) + 16
        draw.text((tx, y + 16), panel["text"], font=font(24, 600), fill=PAPER)
        cost_w = draw.textlength(panel["cost"], font=font(24, 700))
        draw.text((x + CW - 22 - cost_w, y + 16), panel["cost"], font=font(24, 700), fill=MINT)
    # Thin lines between the cells.
    draw.line([(CW, 0), (CW, H)], fill=(*INK_DEEP, 255), width=4)
    draw.line([(0, CH), (W, CH)], fill=(*INK_DEEP, 255), width=4)
    x, y = cells[len(spec["panels"])] if len(spec["panels"]) < 4 else (None, None)
    if x is not None:
        draw.text((x + 48, y + 44), spec.get("title", ""), font=font(40, 800), fill=PAPER)
        ty = y + 118
        for line in spec.get("legend", []):
            if not line:
                ty += 16
                continue
            head, _, rest = line.partition("|")
            if rest:
                draw.text((x + 48, ty), head.strip(), font=font(25, 800), fill=MINT)
                draw.text((x + 48 + 44, ty), rest.strip(), font=font(25, 500), fill=PAPER)
            else:
                draw.text((x + 48, ty), head.strip(), font=font(23, 500), fill=MUTED)
            ty += 40
    return layer


def main() -> int:
    if len(sys.argv) != 2:
        print(__doc__)
        return 2
    root = Path(subprocess.run(
        ["git", "-C", str(Path(__file__).resolve().parent), "rev-parse", "--show-toplevel"],
        capture_output=True, text=True, check=True).stdout.strip())
    spec = json.loads(Path(sys.argv[1]).read_text())
    seconds = float(spec["seconds"])
    panels = spec["panels"]
    with tempfile.TemporaryDirectory() as tmp:
        overlay = Path(tmp) / "labels.png"
        labels(spec).save(overlay)
        cmd = ["ffmpeg", "-v", "error", "-y"]
        for panel in panels:
            cmd += ["-i", str(root / panel["clip"])]
        cmd += ["-loop", "1", "-i", str(overlay)]
        parts, names = [], []
        for i in range(len(panels)):
            parts.append(
                f"[{i}:v]fps=24,scale={CW}:{CH}:force_original_aspect_ratio=decrease:flags=lanczos,"
                f"pad={CW}:{CH}:(ow-iw)/2:(oh-ih)/2:color=0x0c1a1e,setsar=1,"
                f"tpad=stop_mode=clone:stop_duration={seconds}[v{i}]"
            )
            names.append(f"[v{i}]")
        for i in range(len(panels), 4):
            parts.append(f"color=c=0x0c1a1e:s={CW}x{CH}:r=24[v{i}]")
            names.append(f"[v{i}]")
        parts.append("".join(names) + f"xstack=inputs=4:layout=0_0|{CW}_0|0_{CH}|{CW}_{CH}[grid]")
        parts.append(f"[grid][{len(panels)}:v]overlay=0:0[out]")
        out = root / spec["out"]
        cmd += ["-filter_complex", ";".join(parts), "-map", "[out]", "-t", f"{seconds}", "-r", "24",
                "-c:v", "libx264", "-crf", "17", "-preset", "slow", "-pix_fmt", "yuv420p",
                "-movflags", "+faststart", "-an", str(out)]
        subprocess.run(cmd, check=True)
    print(f"wrote {out.relative_to(root)} ({out.stat().st_size:,} bytes)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
