#!/usr/bin/env python3
"""Draft 05: real RPS context and proposed AirChat work-in-progress setup.

Reuses exact selected Draft 04/03 performances for unchanged dialogue. Only
new script lines are synthesized with its same authored fictional voice cast.
Build: work/draft03/audio-venv/bin/python video/scripts/audio_build_05.py --asr
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
OUT = ROOT / "video/public/draft05/audio"
WORK = ROOT / "work/draft05/audio-clips"
QA = ROOT / "work/draft05/audio-qa"
PREVIOUS = [("draft04", ROOT / "video/public/draft04/audio/timing.json"),
            ("draft03", ROOT / "video/public/draft03/audio/timing.json")]
SR, BPM = base.SR, base.BPM
common = base.common
base.OUT, base.WORK, base.QA = OUT, WORK, QA
common.OUT, common.WORK, common.QA = OUT, WORK, QA
base.VOICES = {**base.VOICES, "sarah": "Authored American English male colleague"}
base.DIRECTIONS = {**base.DIRECTIONS, "sarah":
    "A native American English male voice in his thirties. Warm middle register, "
    "lightly textured natural timbre. A relaxed colleague on a live work video call. "
    "Casual, friendly and direct, brisk conversational pace with connected phrases "
    "and very short pauses. Natural question intonation and varied inflection. "
    "No announcer voice and no dramatic emphasis."}


def previous_performances(script):
    """Reuse exact copy and voice, prioritizing the most recently chosen take."""
    reusable = {}
    for draft, timing_path in PREVIOUS:
        previous = json.loads(timing_path.read_text())
        by_id = {row["id"]: row for row in previous["lines"]}
        for row in script["lines"]:
            if row["id"] in reusable:
                continue
            old = by_id.get(row["id"])
            if not old or old["text"] != row["text"] or old["speaker"] != row["speaker"]:
                continue
            if old["voice"] != base.VOICES[row["speaker"]]:
                continue
            if "direction" in row and row["direction"] != old["direction"]:
                continue
            if "seed" in row and row["seed"] != old["seed"]:
                continue
            path = (ROOT / old["selected_clip"] if old.get("selected_clip") else
                    ROOT / "work" / draft / "audio-clips" / f"{row['id']}-final.wav")
            assert path.exists(), f"Selected {draft} performance is missing: {path}"
            reusable[row["id"]] = {"line": old, "path": path,
                                     "draft": old.get("reused_from", draft)}
    return reusable


def prepare_speech(script, only=None):
    reusable = previous_performances(script)
    new_lines = []
    for row in script["lines"]:
        if row["id"] in reusable:
            continue
        row = dict(row)
        pronunciation = []
        if "AirChat" in row["text"]:
            pronunciation.append("Pronounce AirChat as air chat.")
        if "Payments ML" in row["text"]:
            pronunciation.append("Pronounce Payments ML as payments em el.")
        if pronunciation:
            row["direction"] = row.get("direction", base.DIRECTIONS[row["speaker"]]) + " " + " ".join(pronunciation)
        new_lines.append(row)
    new_script = {**script, "lines": new_lines}
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
        selected = reusable[row["id"]]
        old, path = selected["line"], selected["path"]
        audio, rate = sf.read(path, dtype="float32")
        assert rate == SR and audio.ndim == 1
        assert abs(len(audio) / SR - old["duration"]) < .00011
        offset = row["start"] - old["start"]
        end = row["start"] + len(audio) / SR
        assert end <= row["limit"], f"Reused performance exceeds window: {row['id']}"
        mapped = {**old, **row, "end": round(end, 4),
                  "words": [{**word, "start": round(word["start"] + offset, 4),
                              "end": round(word["end"] + offset, 4)} for word in old["words"]],
                  "reused_from": selected["draft"], "selected_clip": str(path.relative_to(ROOT)),
                  "selected_clip_sha256": hashlib.sha256(path.read_bytes()).hexdigest()}
        start = round(row["start"] * SR)
        voice[start:start + len(audio)] += audio
        timeline.append(mapped)
        print(f"REUSE {row['id']}: {row['start']:.2f}–{end:.2f}; original selected performance", flush=True)
    too_fast = [{"id": r["id"], "time_stretch": r["time_stretch"],
                 "natural_duration": r["original_duration"], "start": r["start"]}
                for r in timeline if r["time_stretch"] > 1.05]
    assert not too_fast, f"Revise copy or windows to keep voices natural (max 1.05x): {too_fast}"
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


def review_audio(metadata, secondary_asr=False):
    """Audit rendered stems and reuse; recognition is not a listening review."""
    timing = metadata["lines"]
    new_ids = metadata["new_line_ids"]
    secondary = []
    if secondary_asr:
        from faster_whisper import WhisperModel
        asr = WhisperModel("small.en", device="cpu", compute_type="int8", cpu_threads=4,
                           download_root=str(ROOT / "work/audio-models"))
        for row in timing:
            if row["id"] not in new_ids:
                continue
            final = WORK / f"{row['id']}-final.wav"
            digest = hashlib.sha256(final.read_bytes()).hexdigest()
            cache = final.with_suffix(".small-asr.json")
            if cache.exists() and json.loads(cache.read_text()).get("sha256") == digest:
                item = json.loads(cache.read_text())
            else:
                segments, _ = asr.transcribe(str(final), language="en", beam_size=5,
                                             word_timestamps=True, vad_filter=False,
                                             condition_on_previous_text=False)
                segments = list(segments)
                item = {"sha256": digest, "text": " ".join(s.text.strip() for s in segments),
                        "words": [{"word": w.word, "start": w.start, "end": w.end,
                                   "probability": w.probability}
                                  for s in segments for w in s.words or []]}
                cache.write_text(json.dumps(item, indent=2) + "\n")
            secondary.append({"id": row["id"], "script": row["text"], **item})
            print(f"SECONDARY ASR {row['id']}: {item['text']}", flush=True)
        del asr
        (QA / "asr-small-new.json").write_text(json.dumps(secondary, indent=2) + "\n")
    gain = metadata["master_gain_linear"]
    voice, rate = sf.read(OUT / "narration.wav", dtype="float32")
    assert rate == SR
    errors = []
    for row in timing:
        if not row.get("reused_from"):
            continue
        selected, _ = sf.read(ROOT / row["selected_clip"], dtype="float32")
        start = round(row["start"] * SR)
        expected = selected[:, None] * gain
        error = float(np.max(np.abs(voice[start:start + len(selected)] - expected)))
        errors.append(error)
        # The final PCM_24 output has one additional quantization step.
        assert error < 2e-7, f"Reused performance changed unexpectedly: {row['id']}"
    zoom = [r for r in timing if r["id"].startswith("zoom_")]
    report = {"status": "PASS numerical and selected-performance reuse checks",
              "script_sha256": metadata["script_sha256"],
              "mix_sha256": hashlib.sha256((OUT / "mixed.wav").read_bytes()).hexdigest(),
              "duration": metadata["duration"], "bpm": BPM,
              "new_lines": len(new_ids), "reused_lines": len(errors),
              "maximum_new_time_stretch": max((r["time_stretch"] for r in timing if r["id"] in new_ids), default=1),
              "zoom_gaps_seconds": [round(b["start"] - a["end"], 4) for a, b in zip(zoom, zoom[1:])],
              "reused_normalized_clips_match_new_narration": True,
              "maximum_reuse_sample_error": max(errors, default=0),
              "secondary_recognition": {"performed": secondary_asr, "model": "Whisper small.en",
                                        "count": len(secondary),
                                        "path": "../../../../work/draft05/audio-qa/asr-small-new.json" if secondary_asr else None},
              "direct_listening_performed": False,
              "limitation": "ASR and numerical checks do not establish voice naturalness or subjective music balance. Direct listening was not performed."}
    (OUT / "audio-review.json").write_text(json.dumps(report, indent=2) + "\n")


def write_captions(timeline):
    cues = common.write_captions(timeline)
    by_id = {r["id"]: r for r in timeline}
    for cue in cues:
        row = by_id[cue["script_id"]]
        labels = {"narrator": "", "alex": "NOAH: ", "peer": "MANISH'S AI PEER: ",
                  "sarah": "CARLOS: " if row["id"].startswith("zoom_") else "D-REX PARTNER: "}
        cue["text"] = labels[row["speaker"]] + cue["plain_text"]
    blocks = [f"{i + 1}\n{common.srt_stamp(c['start'])} --> {common.srt_stamp(c['end'])}\n{c['text']}\n"
              for i, c in enumerate(cues)]
    (OUT / "captions.srt").write_text("\n".join(blocks) + "\n")
    return cues


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--script", type=Path, default=ROOT / "video/public/draft05/script.json")
    parser.add_argument("--synth-only", action="store_true")
    parser.add_argument("--only", nargs="*")
    parser.add_argument("--asr", action="store_true")
    parser.add_argument("--secondary-asr", action="store_true")
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
        "title": "AI Peer — Draft 05 illustrative concept film", "duration": script["duration"],
        "sample_rate": SR, "bpm": BPM, "beat_origin": script.get("beatOrigin", 26),
        "script_sha256": hashlib.sha256(script_bytes).hexdigest(), "voices": base.VOICES,
        "voice_engine": [base.MODEL, base.DESIGN_MODEL],
        "voice_disclosure": "Stock synthetic male speakers and text-designed fictional presenter/colleague voices. No recordings, real-person imitation or real voice cloning. The authored colleague voice is male in Draft 05.",
        "music": "Original 124 BPM electro-pop score synthesized from oscillators and filtered noise. No third-party recordings or samples.",
        "notes": "Exact selected Draft 04 and Draft 03 performances reused for unchanged lines. The narrator, Ryan and Aiden are retained. The sarah role key now uses a newly authored generic male colleague for the simulated partner/Carlos lines. ASR-assisted word alignment, not direct listening.",
        "reused_line_ids": sorted(reusable), "new_line_ids": [r["id"] for r in records],
        "master_gain_db": round(20 * math.log10(master_gain), 4),
        "master_gain_linear": master_gain,
        "scenes": script["scenes"], "lines": timeline, "effects": cues,
        "stats": {name: common.stats(data) for name, data in stems.items()},
    }
    (OUT / "timing.json").write_text(json.dumps(metadata, indent=2, ensure_ascii=False) + "\n")
    captions = write_captions(timeline)
    report = common.validate(script, timeline, captions, stems)
    report.update({"voice_engine": [base.MODEL, base.DESIGN_MODEL], "bpm": BPM,
                   "reused_performances": len(reusable), "new_performances": len(records),
                   "asr_clip_match_minimum": min(x["asr_match_ratio"] for x in timeline)})
    if args.asr:
        common.run_asr(report)
        report["asr"]["transcript"] = "../../../../work/draft05/audio-qa/asr.json"
    (OUT / "validation.json").write_text(json.dumps(report, indent=2) + "\n")
    review_audio(metadata, args.secondary_asr)
    print(json.dumps({"validation": report["validation"], "loudness": report["loudness"],
                      "duration": script["duration"], "reused": len(reusable), "new": len(records)}, indent=2), flush=True)


if __name__ == "__main__":
    main()
