#!/usr/bin/env python3
"""Draft 04: the attention orbit, quiet reveal, and personal-context setup.

Reuses the exact selected Draft 03 performances for unchanged dialogue. Only
new script lines are synthesized with its same authored fictional voice cast.
Build: work/draft03/audio-venv/bin/python video/scripts/audio_build_04.py --asr
"""
from __future__ import annotations

import argparse
import hashlib
import json
import math
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy import signal

import audio_build_03 as base

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "video/public/draft04/audio"
WORK = ROOT / "work/draft04/audio-clips"
QA = ROOT / "work/draft04/audio-qa"
PREVIOUS = ROOT / "video/public/draft03/audio/timing.json"
SR, BPM = base.SR, base.BPM
common = base.common
base.OUT, base.WORK, base.QA = OUT, WORK, QA
common.OUT, common.WORK, common.QA = OUT, WORK, QA


def previous_performances(script):
    """Match exact copy and voice; timeline placement may change freely."""
    previous = json.loads(PREVIOUS.read_text())
    by_id = {row["id"]: row for row in previous["lines"]}
    reusable = {}
    for row in script["lines"]:
        old = by_id.get(row["id"])
        if not old or old["text"] != row["text"] or old["speaker"] != row["speaker"]:
            continue
        if "direction" in row and row["direction"] != old["direction"]:
            continue
        if "seed" in row and row["seed"] != old["seed"]:
            continue
        path = ROOT / "work/draft03/audio-clips" / f"{row['id']}-final.wav"
        assert path.exists(), f"Selected Draft 03 performance is missing: {path}"
        reusable[row["id"]] = old
    return reusable


def prepare_speech(script, only=None):
    reusable = previous_performances(script)
    new_script = {**script, "lines": [row for row in script["lines"] if row["id"] not in reusable]}
    records = base.synthesize(new_script, only)
    return records, reusable, new_script


def narration(script, records, reusable, new_script):
    if records:
        voice, timeline = base.narration(new_script, records)
    else:
        voice = np.zeros(round(script["duration"] * SR), dtype=np.float32)
        timeline = []
    for row in script["lines"]:
        if row["id"] not in reusable:
            continue
        old = reusable[row["id"]]
        path = ROOT / "work/draft03/audio-clips" / f"{row['id']}-final.wav"
        audio, rate = sf.read(path, dtype="float32")
        assert rate == SR and audio.ndim == 1
        assert abs(len(audio) / SR - old["duration"]) < .00011
        offset = row["start"] - old["start"]
        end = row["start"] + len(audio) / SR
        assert end <= row["limit"], f"Reused performance exceeds window: {row['id']}"
        mapped = {**old, **row, "end": round(end, 4),
                  "words": [{**word, "start": round(word["start"] + offset, 4),
                              "end": round(word["end"] + offset, 4)} for word in old["words"]],
                  "reused_from": "draft03", "selected_clip": str(path.relative_to(ROOT)),
                  "selected_clip_sha256": hashlib.sha256(path.read_bytes()).hexdigest()}
        start = round(row["start"] * SR)
        voice[start:start + len(audio)] += audio
        timeline.append(mapped)
        print(f"REUSE {row['id']}: {row['start']:.2f}–{end:.2f}; original selected performance", flush=True)
    timeline.sort(key=lambda row: row["start"])
    assert all(a["end"] < b["start"] for a, b in zip(timeline, timeline[1:])), "Speech overlap"
    assert len(timeline) == len(script["lines"])
    (QA / "speech-fitting.json").write_text(json.dumps(timeline, indent=2) + "\n")
    return voice, timeline


def make_music(script):
    """Keep the 124 BPM sound palette, then shape a deliberate pre-reveal breath."""
    aliases = {"overload": "problem", "relief": "reveal", "setup": "context"}
    score_script = {**script, "scenes": [{**scene, "id": aliases.get(scene["id"], scene["id"])}
                                         for scene in script["scenes"]]}
    music = base.make_music(score_script)
    origin = script.get("beatOrigin", 20)
    # New opening accumulates gentle rhythm, not loud alert noise. The last
    # half-second is clear space so the new peer feels like a release.
    times = np.arange(len(music), dtype=np.float32) / SR
    shape = np.interp(times, [0, 5, 15, origin - 1.0, origin - .52, origin - .50,
                              origin - .005, origin, script["duration"]],
                             [.72, .8, 1.12, 1.15, .8, 0, 0, 1, 1]).astype(np.float32)
    music *= shape[:, None]
    return music


def make_effects(script):
    ordinary = {**script, "effects": [cue for cue in script.get("effects", [])
                                      if cue["kind"] not in ("attention", "intake", "settle")]}
    effects, _ = base.make_effects(ordinary)
    rng = np.random.default_rng(2026091804)
    for cue in script.get("effects", []):
        kind, at = cue["kind"], cue["time"]
        pan = float(cue.get("pan", 0))
        if kind == "attention":
            # Position follows each orbit card; pitches stay in the score's
            # key. These are authored tones, not sampled Slack/Zoom alerts.
            pitch = int(cue.get("pitch", 76))
            base.stereo_add(effects, base.tone(pitch, .26, "keys"), at,
                            float(cue.get("gain", .024)), pan)
        elif kind == "intake":
            duration = .28
            t = np.arange(round(duration * SR)) / SR
            noise = rng.normal(0, 1, len(t))
            a = signal.sosfilt(signal.butter(2, [450, 2600], btype="bandpass", fs=SR, output="sos"), noise)
            a *= np.sin(np.pi * t / duration) ** 2
            base.stereo_add(effects, a.astype(np.float32), at, .013, pan)
        elif kind == "settle":
            for j, pitch in enumerate([64, 69, 73, 76]):
                base.stereo_add(effects, base.tone(pitch, .7, "keys"), at + j * .045,
                                .022, (j - 1.5) * .24)
    effects *= base.env(len(effects), .01, .4)[:, None]
    return effects, script.get("effects", [])


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--script", type=Path, default=ROOT / "video/public/draft04/script.json")
    parser.add_argument("--synth-only", action="store_true")
    parser.add_argument("--only", nargs="*")
    parser.add_argument("--asr", action="store_true")
    args = parser.parse_args()
    for path in (OUT, WORK, QA):
        path.mkdir(parents=True, exist_ok=True)
    script_bytes = args.script.read_bytes()
    script = json.loads(script_bytes)
    records, reusable, new_script = prepare_speech(script, args.only)
    if args.synth_only:
        return
    assert args.only is None, "--only requires --synth-only"
    voice, timeline = narration(script, records, reusable, new_script)
    music = make_music(script)
    effects, cues = make_effects(script)
    gain = np.full(len(voice), .54, dtype=np.float32)
    for row in timeline:
        s = round(max(0, row["start"] - .10) * SR)
        a, b = round(row["start"] * SR), round(row["end"] * SR)
        e = min(len(gain), b + round(.24 * SR))
        low = .17 if row["speaker"] == "narrator" else .14
        gain[s:a] = np.minimum(gain[s:a], np.linspace(.54, low, a - s))
        gain[a:b] = np.minimum(gain[a:b], low)
        gain[b:e] = np.minimum(gain[b:e], np.linspace(low, .54, e - b))
    ducked = music * gain[:, None]
    stereo_voice = np.column_stack([voice, voice])
    mixed = stereo_voice + ducked + effects
    temp = QA / "premaster.wav"
    sf.write(temp, mixed, SR, subtype="FLOAT")
    measured = common.loudness(temp, "premaster-loudness.txt")
    master_gain = min(10 ** ((-16 - measured["integrated_lufs"]) / 20),
                      10 ** ((-1.7 - measured["true_peak_dbfs"]) / 20))
    stems = {"narration": stereo_voice * master_gain, "music": ducked * master_gain,
             "effects": effects * master_gain, "mixed": mixed * master_gain}
    for name, data in stems.items():
        sf.write(OUT / f"{name}.wav", data, SR, subtype="PCM_24")
    sf.write(OUT / "music-unducked.wav", music * master_gain, SR, subtype="PCM_24")
    metadata = {
        "title": "AI Peer — Draft 04 illustrative concept film", "duration": script["duration"],
        "sample_rate": SR, "bpm": BPM, "beat_origin": script.get("beatOrigin", 26),
        "script_sha256": hashlib.sha256(script_bytes).hexdigest(), "voices": base.VOICES,
        "voice_engine": [base.MODEL, base.DESIGN_MODEL],
        "voice_disclosure": "Stock synthetic male speakers and text-designed fictional female voices. No recordings or real voice cloning.",
        "music": "Original 124 BPM electro-pop score synthesized from oscillators and filtered noise. No third-party recordings or samples.",
        "notes": "Exact selected Draft 03 performances reused for unchanged lines. New narration uses the same voice directions. ASR-assisted word alignment, not direct listening.",
        "reused_line_ids": sorted(reusable), "new_line_ids": [r["id"] for r in records],
        "master_gain_db": round(20 * math.log10(master_gain), 4),
        "scenes": script["scenes"], "lines": timeline, "effects": cues,
        "stats": {name: common.stats(data) for name, data in stems.items()},
    }
    (OUT / "timing.json").write_text(json.dumps(metadata, indent=2, ensure_ascii=False) + "\n")
    captions = common.write_captions(timeline)
    report = common.validate(script, timeline, captions, stems)
    report.update({"voice_engine": [base.MODEL, base.DESIGN_MODEL], "bpm": BPM,
                   "reused_performances": len(reusable), "new_performances": len(records),
                   "asr_clip_match_minimum": min(x["asr_match_ratio"] for x in timeline)})
    if args.asr:
        common.run_asr(report)
        report["asr"]["transcript"] = "../../../../work/draft04/audio-qa/asr.json"
    (OUT / "validation.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({"validation": report["validation"], "loudness": report["loudness"],
                      "duration": script["duration"], "reused": len(reusable), "new": len(records)}, indent=2), flush=True)


if __name__ == "__main__":
    main()
