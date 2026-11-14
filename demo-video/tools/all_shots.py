#!/usr/bin/env python3
"""all_shots: one labelled sheet of every slot in demo-video/shots/manifest.json.

    python3 demo-video/tools/all_shots.py            (writes demo-video/shots/all-shots.jpg)

For each slot it pulls five frames spread over the clip (a strip, kept beside the clip as
<slot>-strip.jpg) and stacks the strips with the slot's grade, length and note as the label.
"""
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(subprocess.run(["git", "-C", str(Path(__file__).resolve().parent), "rev-parse", "--show-toplevel"],
                           capture_output=True, text=True, check=True).stdout.strip())
SHOTS = ROOT / "demo-video/shots"


def strip(clip: Path, out: Path, frames: int = 5, cell: int = 480) -> None:
    dur = float(subprocess.run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0",
                                str(clip)], capture_output=True, text=True, check=True).stdout.strip())
    rate = frames / max(dur - 0.15, 0.1)
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", str(clip), "-vf",
                    f"fps={rate},scale={cell}:-2,tile={frames}x1:padding=4:color=0x0c1a1e",
                    "-frames:v", "1", "-q:v", "3", str(out)], check=True)


def main() -> int:
    manifest = json.loads((SHOTS / "manifest.json").read_text())
    cells = []
    for slot, s in manifest["slots"].items():
        clip = ROOT / s["clip"]
        out = clip.parent / f"{slot}-strip.jpg"
        strip(clip, out)
        text = f"{s['grade']}, {s['seconds']} s, sound: {s['audio']}"
        if s.get("note"):
            text += " | " + s["note"][:110]
        cells.append({"image": str(out.relative_to(ROOT)), "label": slot, "text": text})
    grades = [s["grade"] for s in manifest["slots"].values()]
    spec = {"out": "demo-video/shots/all-shots.jpg", "width": 2400, "columns": 1,
            "title": "The nine AI shots",
            "subtitle": f"{grades.count('final')} final, {grades.count('draft')} draft. Five frames across each clip. "
                        f"Manifest of {manifest['updated_utc']}.",
            "cells": cells}
    spec_file = SHOTS / "all-shots.sheet.json"
    spec_file.write_text(json.dumps(spec, indent=2) + "\n")
    return subprocess.run(["uv", "run", "--quiet", str(ROOT / "demo-video/tools/sheet.py"), str(spec_file)]).returncode


if __name__ == "__main__":
    sys.exit(main())
