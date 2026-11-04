#!/usr/bin/env python3
"""Fully decode final Draft07 exports; audit picture, AAC, captions and atoms."""
import argparse
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
from pathlib import Path
import re
import struct
import subprocess

ROOT = Path(__file__).resolve().parents[2]
WORK = ROOT / "work/draft07"
SCRIPT = ROOT / "video/public/draft07/script.json"
CAPTIONS = ROOT / "video/public/draft07/audio/captions.srt"


def digest(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def seconds(stamp):
    h, m, s, ms = map(int, re.split(r"[:,]", stamp))
    return h * 3600 + m * 60 + s + ms / 1000


def check(path, duration):
    path = path.resolve()
    assert path.is_file(), path
    info = json.loads(subprocess.run(["ffprobe", "-v", "error", "-show_streams", "-show_format",
                                      "-of", "json", str(path)], check=True, capture_output=True, text=True).stdout)
    video = [s for s in info["streams"] if s["codec_type"] == "video"]
    audio = [s for s in info["streams"] if s["codec_type"] == "audio"]
    assert len(video) == len(audio) == 1
    v, a = video[0], audio[0]
    num, den = map(int, v["avg_frame_rate"].split("/"))
    fps = num / den
    assert fps == 30 and int(v["nb_frames"]) == round(duration * fps)
    assert v["codec_name"] == "h264" and v["pix_fmt"] in ("yuv420p", "yuvj420p")
    assert (v["width"], v["height"]) == ((960, 540) if "preview" in path.name else (1920, 1080))
    assert a["codec_name"] == "aac" and a["profile"] == "LC"
    assert int(a["sample_rate"]) == 48000 and a["channels"] == 2
    assert abs(float(v["duration"]) - duration) < .001
    assert abs(float(a["duration"]) - duration) < .001
    assert not [s for s in info["streams"] if s["codec_type"] == "subtitle"]
    proc = subprocess.run(["ffmpeg", "-hide_banner", "-nostats", "-xerror", "-i", str(path),
                           "-map", "0:v:0", "-map", "0:a:0", "-af", "ebur128=peak=true:framelog=verbose",
                           "-progress", "pipe:1", "-f", "null", "-"], capture_output=True, text=True)
    log = WORK / f"{path.stem}-decode-loudness.log"
    log.write_text(proc.stderr)
    assert proc.returncode == 0, log
    frames = int(re.findall(r"^frame=(\d+)$", proc.stdout, re.M)[-1])
    assert frames == round(duration * fps)
    summary = proc.stderr.split("Summary:")[-1]
    lufs = float(re.search(r"I:\s*(-?[\d.]+) LUFS", summary)[1])
    peak = float(re.search(r"Peak:\s*(-?[\d.]+) dBFS", summary)[1])
    lra = float(re.search(r"LRA:\s*([\d.]+) LU", summary)[1])
    assert -17 <= lufs <= -15 and peak < -1.0
    srt = path.with_suffix(".srt")
    assert srt.read_bytes() == CAPTIONS.read_bytes()
    cues = [(seconds(s), seconds(e)) for s, e in re.findall(
        r"(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})", srt.read_text())]
    assert cues and all(0 <= s < e <= duration for s, e in cues)
    assert all(first[1] <= second[0] for first, second in zip(cues, cues[1:]))
    atoms = []
    with path.open("rb") as file:
        offset = 0
        while offset < path.stat().st_size:
            file.seek(offset)
            size, kind = struct.unpack(">I4s", file.read(8))
            if size == 1:
                size = struct.unpack(">Q", file.read(8))[0]
            if size == 0:
                size = path.stat().st_size - offset
            assert size >= 8
            atoms.append({"type": kind.decode("ascii"), "offset": offset, "bytes": size})
            offset += size
    order = [x["type"] for x in atoms]
    assert order.index("moov") < order.index("mdat")
    result = {"path": str(path.relative_to(ROOT)), "bytes": path.stat().st_size, "sha256": digest(path),
              "video": {"codec": v["codec_name"], "width": v["width"], "height": v["height"], "fps": fps,
                        "metadata_frames": int(v["nb_frames"]), "decoded_frames": frames,
                        "duration": float(v["duration"]), "pixel_format": v["pix_fmt"]},
              "audio": {"codec": a["codec_name"], "profile": a["profile"], "sample_rate": 48000,
                        "channels": 2, "channel_layout": a["channel_layout"], "duration": float(a["duration"]),
                        "bit_rate": int(a["bit_rate"]), "integrated_lufs": lufs, "true_peak_dbfs": peak,
                        "loudness_range_lu": lra},
              "full_decode": {"result": "PASS", "actual_video_frames": frames, "errors": 0,
                              "log": str(log.relative_to(ROOT))}, "subtitle_streams": 0,
              "no_additional_subtitle_stream": True, "fast_start": True, "top_level_atoms": atoms,
              "captions": {"count": len(cues), "non_overlapping": True, "within_video": True,
                           "matches_source_bytes": True, "first_start": cues[0][0], "last_end": cues[-1][1],
                           "sha256": digest(srt)}}
    print(f"PASS {path.name}: {frames} frames; {duration}s; {lufs} LUFS / {peak} dBTP", flush=True)
    return result


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("paths", nargs="*", type=Path)
    parser.add_argument("--report", type=Path, default=WORK / "final-technical-qa.json")
    args = parser.parse_args()
    duration = json.loads(SCRIPT.read_text())["duration"]
    paths = args.paths or [ROOT / "renders/ai-peer-draft-07.mp4", ROOT / "renders/ai-peer-draft-07-preview.mp4"]
    with ThreadPoolExecutor(max_workers=2) as pool:
        exports = list(pool.map(lambda p: check(p, duration), paths))
    report = {"status": "PASS", "duration_seconds": duration, "expected_frames": round(duration * 30),
              "script_sha256": digest(SCRIPT), "exports": exports, "direct_listening_performed": False,
              "visual_review_scope": "Performed separately by root and independent creative reviewer; this report covers technical export integrity."}
    args.report.write_text(json.dumps(report, indent=2) + "\n")
