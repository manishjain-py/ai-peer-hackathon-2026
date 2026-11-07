#!/usr/bin/env python3
"""Draft06: all-new ElevenLabs speech, supplied timing, original 124 BPM score.

The key comes from ELEVENLABS_API_KEY in the environment, else from an
ELEVENLABS_API_KEY=... line in ~/.ai-peer/.env. It is read in memory only and is
never printed, copied, or written into this project. No time stretching is used.
"""
from __future__ import annotations

import argparse
import base64
from concurrent.futures import ThreadPoolExecutor
import hashlib
import json
import math
import os
from pathlib import Path
import re
import urllib.error
import urllib.request

import numpy as np
import soundfile as sf
from scipy import signal

import audio_build_05 as previous

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "video/public/draft06/audio"
WORK = ROOT / "work/draft06/audio-clips"
QA = ROOT / "work/draft06/audio-qa"
KEY_FILE = Path.home() / ".ai-peer" / ".env"
SR, BPM = 48000, 124
MODEL = "eleven_multilingual_v2"
FORMAT = "pcm_44100"
common = previous.common
common.OUT, common.WORK, common.QA = OUT, WORK, QA
CAST = {
    "narrator": {"voice_id": "EXAVITQu4vr4xnSDxMaL", "name": "Sarah - Mature, Reassuring, Confident",
                 "role": "Calm, clear explanatory narrator", "stability": .60},
    "peer": {"voice_id": "jpdt2U2ncF4tVZvy35oY", "name": "Aarav J - Cool Wise Friend",
             "role": "Relaxed, practical Indian-English AI Peer", "stability": .55},
    "alex": {"voice_id": "oaz5NvoRIhcJystOASAA", "name": "Karthik | Indian AI Voice",
             "role": "Balanced, conversational Indian-English colleague", "stability": .55},
    "sarah": {"voice_id": "iP95p4xoKVk53GoZ742B", "name": "Chris - Charming, Down-to-Earth",
              "role": "Matter-of-fact American-English data owner/colleague", "stability": .55},
}


def read_key():
    value = os.environ.get("ELEVENLABS_API_KEY")
    if value:
        return value
    lines = KEY_FILE.read_text().splitlines() if KEY_FILE.is_file() else []
    for line in lines:
        match = re.match(r"^\s*(?:export\s+)?ELEVENLABS_API_KEY\s*=\s*(.*)$", line)
        if match:
            value = match[1].strip().strip("\"'")
            if value:
                return value
    raise RuntimeError("No ElevenLabs credential: set ELEVENLABS_API_KEY or add it to ~/.ai-peer/.env; "
                       "no secret values logged.")


def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()


def label(row):
    return {"narrator": "", "peer": "MANISH'S AI PEER: ", "alex": "NOAH: ",
            "sarah": "CARLOS: " if row["id"].startswith("zoom_") else "DATA ENGINEER: "}[row["speaker"]]


def write_captions(timeline):
    cues = common.write_captions(timeline)
    by_id = {row["id"]: row for row in timeline}
    for cue in cues:
        cue["text"] = label(by_id[cue["script_id"]]) + cue["plain_text"]
    blocks = [f"{i + 1}\n{common.srt_stamp(c['start'])} --> {common.srt_stamp(c['end'])}\n{c['text']}\n"
              for i, c in enumerate(cues)]
    (OUT / "captions.srt").write_text("\n".join(blocks) + "\n")
    return cues


def provisional(script, script_bytes):
    lines = []
    for row in script["lines"]:
        end = row["limit"] - .08
        tokens = row["text"].split()
        span = (end - row["start"]) / len(tokens)
        words = [{"text": token, "start": round(row["start"] + i * span, 4),
                  "end": round(row["start"] + (i + 1) * span, 4)} for i, token in enumerate(tokens)]
        lines.append({**row, "end": end, "duration": round(end - row["start"], 4),
                      "words": words, "time_stretch": 1, "provisional": True})
    data = {"title": "AI Peer — Draft06 PROVISIONAL VISUAL TIMING ONLY", "duration": script["duration"],
            "provisional": True, "audio_generated": False,
            "notes": "Estimated word placement from planned windows. Not audio alignment or a verified soundtrack.",
            "script_sha256": hashlib.sha256(script_bytes).hexdigest(), "scenes": script["scenes"],
            "voices": CAST, "voice_engine": "ElevenLabs planned", "lines": lines}
    (OUT / "timing.json").write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n")
    print(f"PROVISIONAL: {len(lines)} estimated line timings; no speech generated.", flush=True)


def request_for(script, index):
    row = script["lines"][index]
    voice = CAST[row["speaker"]]
    settings = {"stability": voice["stability"], "similarity_boost": .75,
                "style": 0, "speed": 1.0, "use_speaker_boost": True}
    body = {"text": row.get("spoken_text", row["text"]), "model_id": MODEL,
            "voice_settings": settings, "seed": row.get("seed", 19092026)}
    # Only immediate same-speaker neighbors guide phrase continuity. They are
    # context for the requested line, not additional generated spoken words.
    for delta, key in ((-1, "previous_text"), (1, "next_text")):
        other_index = index + delta
        if 0 <= other_index < len(script["lines"]):
            other = script["lines"][other_index]
            if other["speaker"] == row["speaker"] and abs(other["start"] - row["start"]) < 15:
                body[key] = other.get("spoken_text", other["text"])
    return {"voice_id": voice["voice_id"], "output_format": FORMAT, "body": body}


def generate_one(row, request, api_key):
    digest = hashlib.sha256(json.dumps(request, sort_keys=True).encode()).hexdigest()[:20]
    stem = WORK / f"{row['id']}-{digest}"
    wav, alignment_path = stem.with_suffix(".wav"), stem.with_suffix(".alignment.json")
    pending = stem.with_suffix(".pending.json")
    if not (wav.exists() and alignment_path.exists()):
        if pending.exists():
            raise RuntimeError(f"Uncertain previous request for {row['id']}; inspect its receipt before retrying.")
        pending.write_text(json.dumps(request, indent=2) + "\n")
        url = "https://api.elevenlabs.io/v1/text-to-speech/" + request["voice_id"] + "/with-timestamps?output_format=" + FORMAT
        req = urllib.request.Request(url, data=json.dumps(request["body"]).encode(),
                                     headers={"xi-api-key": api_key, "Content-Type": "application/json"}, method="POST")
        try:
            with urllib.request.urlopen(req, timeout=150) as response:
                result = json.load(response)
                receipt = {"request_id": response.headers.get("request-id"),
                           "character_cost": response.headers.get("character-cost")}
        except urllib.error.HTTPError as error:
            # Do not print exception representations, bodies, URLs or headers.
            raise RuntimeError(f"ElevenLabs request failed for {row['id']}: HTTP {error.code}. No automatic retry.") from None
        except Exception:
            raise RuntimeError(f"ElevenLabs request outcome uncertain for {row['id']}; no automatic retry.") from None
        raw = base64.b64decode(result.pop("audio_base64"))
        samples = np.frombuffer(raw, dtype="<i2").astype(np.float32) / 32768
        assert len(samples) > 4410 and np.isfinite(samples).all()
        sf.write(wav, samples, 44100, subtype="PCM_16")
        alignment_path.write_text(json.dumps({**result, **receipt}, indent=2, ensure_ascii=False) + "\n")
        stem.with_suffix(".request.json").write_text(json.dumps(request, indent=2, ensure_ascii=False) + "\n")
        pending.unlink()
    info = sf.info(wav)
    print(f"ELEVENLABS {row['id']}: {info.duration:.3f}s; {CAST[row['speaker']]['name']}", flush=True)
    return {**row, "source_path": str(wav.relative_to(ROOT)),
            "alignment_path": str(alignment_path.relative_to(ROOT)), "source_sha256": sha(wav),
            "source_duration": info.duration, "voice": CAST[row["speaker"]]["name"],
            "voice_id": request["voice_id"], "voice_engine": MODEL, "request": request["body"]}


def synthesize(script, only=None):
    jobs = [(row, request_for(script, i)) for i, row in enumerate(script["lines"])
            if not only or row["id"] in only]
    api_key = read_key()
    with ThreadPoolExecutor(max_workers=3) as pool:
        records = list(pool.map(lambda pair: generate_one(pair[0], pair[1], api_key), jobs))
    (QA / "source-clips.json").write_text(json.dumps(records, indent=2, ensure_ascii=False) + "\n")
    return records


def supplied_words(data):
    alignment = data.get("alignment") or data["normalized_alignment"]
    words, chars = [], []
    begin, end = 0, 0
    for char, start, stop in zip(alignment["characters"], alignment["character_start_times_seconds"],
                                 alignment["character_end_times_seconds"]):
        if char.isspace():
            if chars:
                words.append({"word": "".join(chars), "start": begin, "end": end})
                chars = []
        else:
            if not chars:
                begin = start
            chars.append(char)
            end = stop
    if chars:
        words.append({"word": "".join(chars), "start": begin, "end": end})
    return words


def narration(script, records):
    voice = np.zeros(round(script["duration"] * SR), dtype=np.float32)
    timeline, failures = [], []
    for row in records:
        source, rate = sf.read(ROOT / row["source_path"], dtype="float32")
        audio = signal.resample_poly(source, 160, 147).astype(np.float32)
        assert rate == 44100
        active = np.flatnonzero(np.abs(audio) > .0018)
        trim_start = max(0, int(active[0]) - round(.08 * SR)) if active.size else 0
        trim_end = min(len(audio), int(active[-1]) + round(.14 * SR)) if active.size else len(audio)
        audio = audio[trim_start:trim_end]
        duration = len(audio) / SR
        end = row["start"] + duration
        recognition = supplied_words(json.loads((ROOT / row["alignment_path"]).read_text()))
        words, match = previous.base.align_original(row["text"], recognition, row["source_duration"])
        for word in words:
            word["start"] = round(row["start"] + max(0, word["start"] - trim_start / SR), 4)
            word["end"] = round(min(end, row["start"] + max(0, word["end"] - trim_start / SR)), 4)
        audio *= common.env(len(audio), .004, .012)
        voiced = audio[np.abs(audio) > .012]
        rms = float(np.sqrt(np.mean(voiced * voiced))) if len(voiced) else .1
        audio *= min(.13 / max(rms, 1e-6), .68 / max(float(np.max(np.abs(audio))), 1e-6))
        audio = (.82 * np.tanh(audio / .82)).astype(np.float32)
        sf.write(WORK / f"{row['id']}-final.wav", audio, SR, subtype="PCM_24")
        result = {**row, "end": round(end, 4), "duration": round(duration, 4),
                  "original_duration": duration, "time_stretch": 1.0, "tts_rate": "native speed 1.0",
                  "edge_silence_trim_seconds": [trim_start / SR, (round(len(source) * SR / rate) - trim_end) / SR],
                  "words": words, "alignment_source": "ElevenLabs supplied character timestamps mapped to exact script words",
                  "alignment_match_ratio": round(match, 4), "fit": end <= row["limit"], "provisional": False}
        timeline.append(result)
        if end > row["limit"]:
            failures.append({"id": row["id"], "duration": duration, "window": row["limit"] - row["start"],
                             "needed_limit": round(end + .08, 4)})
        else:
            start = round(row["start"] * SR)
            voice[start:start + len(audio)] += audio
        print(f"FIT {row['id']}: {row['start']:.3f}–{end:.3f}; natural 1.00x; fit={end <= row['limit']}", flush=True)
    (QA / "speech-fitting.json").write_text(json.dumps(timeline, indent=2, ensure_ascii=False) + "\n")
    (QA / "fit-failures.json").write_text(json.dumps(failures, indent=2) + "\n")
    if failures:
        raise RuntimeError("Natural speech needs revised windows or copy; no speech accelerated: " + json.dumps(failures))
    assert all(a["end"] < b["start"] for a, b in zip(timeline, timeline[1:])), "Speech overlap"
    return voice, timeline


def supporting_asr(timeline):
    from faster_whisper import WhisperModel
    model = WhisperModel("small.en", device="cpu", compute_type="int8", cpu_threads=4,
                         download_root=str(ROOT / "work/audio-models"))
    reviews = []
    for row in timeline:
        wav = WORK / f"{row['id']}-final.wav"
        cache = wav.with_suffix(".asr.json")
        if cache.exists() and json.loads(cache.read_text()).get("sha256") == sha(wav):
            item = json.loads(cache.read_text())
        else:
            segments, _ = model.transcribe(str(wav), language="en", beam_size=5, vad_filter=False,
                                           condition_on_previous_text=False)
            item = {"sha256": sha(wav), "recognized": " ".join(s.text.strip() for s in segments)}
            cache.write_text(json.dumps(item, indent=2) + "\n")
        reviews.append({"id": row["id"], "script": row["text"], **item})
        print(f"ASR {row['id']}: {item['recognized']}", flush=True)
    (QA / "asr-small.json").write_text(json.dumps(reviews, indent=2, ensure_ascii=False) + "\n")
    return {"model": "Whisper small.en", "count": len(reviews),
            "path": "../../../../work/draft06/audio-qa/asr-small.json",
            "note": "Supporting content recognition, not listening or voice-naturalness approval."}


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--script", type=Path, default=ROOT / "video/public/draft06/script.json")
    parser.add_argument("--provisional", action="store_true")
    parser.add_argument("--synth-only", action="store_true")
    parser.add_argument("--only", nargs="*")
    parser.add_argument("--asr", action="store_true")
    args = parser.parse_args()
    for path in (OUT, WORK, QA):
        path.mkdir(parents=True, exist_ok=True)
    script_bytes = args.script.read_bytes()
    script = json.loads(script_bytes)
    if args.provisional:
        provisional(script, script_bytes)
        return
    records = synthesize(script, args.only)
    if args.synth_only:
        return
    assert args.only is None, "--only requires --synth-only"
    voice, timeline = narration(script, records)
    music = previous.make_music(script)
    effects, cues = previous.make_effects(script)
    gain = np.full(len(voice), .48, dtype=np.float32)
    for row in timeline:
        a, b = round(row["start"] * SR), round(row["end"] * SR)
        start, finish = max(0, a - round(.1 * SR)), min(len(gain), b + round(.26 * SR))
        low = .145 if row["speaker"] == "narrator" else .12
        gain[start:a] = np.minimum(gain[start:a], np.linspace(.48, low, a - start))
        gain[a:b] = np.minimum(gain[a:b], low)
        gain[b:finish] = np.minimum(gain[b:finish], np.linspace(low, .48, finish - b))
    ducked = music * gain[:, None]
    stereo_voice = np.column_stack([voice, voice])
    mix = stereo_voice + ducked + effects
    sf.write(QA / "premaster.wav", mix, SR, subtype="FLOAT")
    levels = common.loudness(QA / "premaster.wav", "premaster-loudness.txt")
    master = min(10 ** ((-16 - levels["integrated_lufs"]) / 20),
                 10 ** ((-1.7 - levels["true_peak_dbfs"]) / 20))
    stems = {"narration": stereo_voice * master, "music": ducked * master,
             "effects": effects * master, "mixed": mix * master}
    for name, data in stems.items():
        sf.write(OUT / f"{name}.wav", data, SR, subtype="PCM_24")
    sf.write(OUT / "music-unducked.wav", music * master, SR, subtype="PCM_24")
    metadata = {"title": "AI Peer — Draft06 concept film", "duration": script["duration"],
                "provisional": False, "audio_generated": True, "sample_rate": SR, "bpm": BPM,
                "beat_origin": script.get("beatOrigin", 24), "script_sha256": hashlib.sha256(script_bytes).hexdigest(),
                "voices": CAST, "voice_engine": MODEL, "voice_provider": "ElevenLabs",
                "voice_disclosure": "Licensed stock/professional synthetic voices. No imitation or voice cloning of Manish or colleagues. All speech newly generated for Draft06.",
                "music": "Original 124 BPM oscillator/noise score, adapted from Draft05. No commercial recordings or samples.",
                "master_gain_db": round(20 * math.log10(master), 4), "master_gain_linear": master,
                "scenes": script["scenes"], "lines": timeline, "effects": cues,
                "notes": "Native-speed ElevenLabs speech; supplied character alignment maps exact captions. No time stretching. Direct audio listening unsupported in this session."}
    (OUT / "timing.json").write_text(json.dumps(metadata, indent=2, ensure_ascii=False) + "\n")
    captions = write_captions(timeline)
    report = common.validate(script, timeline, captions, stems)
    report.update({"voice_provider": "ElevenLabs", "voice_engine": MODEL, "all_speech_new": True,
                   "script_sha256": metadata["script_sha256"], "mix_sha256": sha(OUT / "mixed.wav"),
                   "word_alignment": "ElevenLabs supplied character timing", "direct_listening_performed": False})
    if args.asr:
        report["supporting_asr"] = supporting_asr(timeline)
    (OUT / "validation.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({"validation": report["validation"], "duration": script["duration"],
                      "loudness": report["loudness"], "lines": len(timeline), "captions": len(captions)}, indent=2), flush=True)


if __name__ == "__main__":
    main()
