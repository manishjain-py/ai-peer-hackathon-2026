#!/usr/bin/env python3
"""shots_manifest: set one slot of demo-video/shots/manifest.json (the hand-over to WP2, see SHOTS.md).

    python3 demo-video/tools/shots_manifest.py SLOT clip=PATH grade=draft|final audio=none [key=value ...]
    python3 demo-video/tools/shots_manifest.py --show

seconds and fps are read from the clip. A value that parses as JSON (a number, true, a list) is
stored as that; anything else as text. key= (empty) removes a key. The time stamp is the clock's.
"""
import datetime as dt
import json
import subprocess
import sys
from pathlib import Path

ROOT = Path(subprocess.run(["git", "-C", str(Path(__file__).resolve().parent), "rev-parse", "--show-toplevel"],
                           capture_output=True, text=True, check=True).stdout.strip())
MANIFEST = ROOT / "demo-video/shots/manifest.json"
ORDER = ["hook-1", "hook-2", "hook-3", "hook-sleeper", "reveal-rise", "reveal-desk",
         "morning-wake", "morning-brief", "morning-nod"]


def probe(clip: Path) -> tuple[float, float]:
    out = subprocess.run(["ffprobe", "-v", "error", "-select_streams", "v:0", "-show_entries",
                          "stream=r_frame_rate,duration", "-of", "json", str(clip)],
                         capture_output=True, text=True, check=True)
    s = json.loads(out.stdout)["streams"][0]
    num, den = s["r_frame_rate"].split("/")
    return round(float(s["duration"]), 3), round(float(num) / float(den), 3)


def main() -> int:
    data = json.loads(MANIFEST.read_text()) if MANIFEST.exists() else {"updated_utc": "", "slots": {}}
    if len(sys.argv) > 1 and sys.argv[1] == "--show":
        for slot in ORDER:
            s = data["slots"].get(slot)
            print(f"{slot:13s} " + (f"{s['grade']:5s} {s['seconds']:>6}s {s['audio']:8s} {s['clip']}" if s else "MISSING"))
        return 0
    slot, pairs = sys.argv[1], sys.argv[2:]
    if slot not in ORDER:
        print(f"unknown slot {slot}; the slots are {ORDER}")
        return 2
    entry = data["slots"].get(slot, {})
    for pair in pairs:
        key, _, value = pair.partition("=")
        if value == "":
            entry.pop(key, None)
            continue
        try:
            entry[key] = json.loads(value)
        except json.JSONDecodeError:
            entry[key] = value
    clip = ROOT / entry["clip"]
    if not clip.exists():
        print(f"clip not found: {clip}")
        return 2
    entry["seconds"], fps = probe(clip)
    entry["fps"] = int(fps) if fps == int(fps) else fps
    entry.setdefault("use_from_s", 0.0)
    for need in ("grade", "audio"):
        if need not in entry:
            print(f"{slot}: {need}= is needed")
            return 2
    first = ["clip", "grade", "seconds", "fps", "use_from_s", "audio"]
    entry = {**{k: entry[k] for k in first}, **{k: v for k, v in entry.items() if k not in first}}
    data["slots"][slot] = entry
    data["slots"] = {s: data["slots"][s] for s in ORDER if s in data["slots"]}
    data["updated_utc"] = dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    MANIFEST.write_text(json.dumps(data, indent=2) + "\n")
    print(f"{slot}: {entry['grade']}, {entry['seconds']} s at {entry['fps']} fps, audio {entry['audio']} -> {entry['clip']}")
    return 0


if __name__ == "__main__":
    sys.exit(main())
