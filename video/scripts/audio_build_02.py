#!/usr/bin/env python3
"""Produce Draft 02's cast, original score, mix, captions and measured QA.

Input: video/public/draft02/script.json; no Draft 01 files are changed.
Stock synthetic voices only. Cached requests make editorial revisions cheap.
"""
from __future__ import annotations

import argparse
import asyncio
import hashlib
import json
import math
import re
import subprocess
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy import signal

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "video/public/draft02/audio"
WORK = ROOT / "work/draft02/audio-clips"
QA = ROOT / "work/draft02/audio-qa"
SR = 48000
BPM = 104
VOICES = {
    "narrator": "en-US-AvaNeural",
    "sarah": "en-US-EmmaNeural",
    "alex": "en-US-BrianNeural",
    "peer": "en-US-AndrewNeural",
}
RATES = {"narrator": "+0%", "sarah": "+0%", "alex": "+0%", "peer": "+0%"}
LABELS = {"narrator": "", "sarah": "SARAH: ", "alex": "ALEX: ", "peer": "MANISH'S AI PEER: "}


def command(args):
    return subprocess.run(args, check=True, capture_output=True, text=True)


def read_mono(path):
    a, sr = sf.read(path, dtype="float32")
    assert sr == SR
    return a.mean(axis=1) if a.ndim > 1 else a


def env(n, attack=.02, release=.2):
    a = min(n // 2, round(attack * SR))
    r = min(n // 2, round(release * SR))
    result = np.ones(n, dtype=np.float32)
    if a:
        result[:a] = np.sin(np.linspace(0, np.pi / 2, a)) ** 2
    if r:
        result[-r:] = np.cos(np.linspace(0, np.pi / 2, r)) ** 2
    return result


def stereo_add(dest, a, start, gain=1., pan=0.):
    s = round(start * SR)
    if s >= len(dest):
        return
    if s < 0:
        a = a[-s:]
        s = 0
    a = a[:len(dest) - s]
    angle = (pan + 1) * np.pi / 4
    dest[s:s + len(a), 0] += a * gain * np.cos(angle)
    dest[s:s + len(a), 1] += a * gain * np.sin(angle)


def note(number, duration, kind="pad"):
    t = np.arange(round(duration * SR), dtype=np.float32) / SR
    f = 440 * 2 ** ((number - 69) / 12)
    if kind == "pad":
        a = (np.sin(2 * np.pi * f * t) + .21 * np.sin(2 * np.pi * f * 1.0015 * t)
             + .11 * np.sin(2 * np.pi * f * 2 * t))
        a *= env(len(t), .65, min(1.5, duration * .4))
    elif kind == "felt":
        a = (np.sin(2 * np.pi * f * t) * np.exp(-t * 1.9)
             + .27 * np.sin(2 * np.pi * f * 2 * t) * np.exp(-t * 3.1)
             + .08 * np.sin(2 * np.pi * f * 3 * t) * np.exp(-t * 5.2))
        a *= env(len(t), .008, .45)
    elif kind == "bell":
        a = (np.sin(2 * np.pi * f * t) * np.exp(-t * 2.4)
             + .19 * np.sin(2 * np.pi * f * 2.002 * t) * np.exp(-t * 4.2))
        a *= env(len(t), .008, .28)
    else:
        a = (np.sin(2 * np.pi * f * t) + .14 * np.sin(2 * np.pi * 2 * f * t))
        a *= env(len(t), .025, .2)
    return a.astype(np.float32)


def caption_words(text, boundaries, start, speed, audio_end):
    """Keep original punctuation and every scripted word, with TTS timing anchors."""
    original = text.split()
    usable = [b for b in boundaries if b.get("type") == "WordBoundary" or "text" in b]
    if not usable:
        raise RuntimeError("Synthesis returned no word timing metadata")
    if len(original) == len(usable):
        return [{"text": text, "start": round(start + b["offset"] / 1e7 / speed, 4),
                 "end": round(min(audio_end, start + (b["offset"] + b["duration"]) / 1e7 / speed), 4)}
                for text, b in zip(original, usable)]
    # Tokenization differs for terms such as a.m. and won-or-lost. Match positions
    # along normalized character lengths, retaining the original display copy.
    source_lengths = np.array([max(1, len(re.sub(r"\W", "", w))) for w in original])
    target_lengths = np.array([max(1, len(re.sub(r"\W", "", b["text"]))) for b in usable])
    source_pos = np.r_[0, np.cumsum(source_lengths)] / sum(source_lengths)
    target_pos = np.r_[0, np.cumsum(target_lengths)] / sum(target_lengths)
    target_times = [start + usable[0]["offset"] / 1e7 / speed]
    target_times += [start + (b["offset"] + b["duration"]) / 1e7 / speed for b in usable]
    times = np.interp(source_pos, target_pos, target_times)
    return [{"text": w, "start": round(float(times[i]), 4),
             "end": round(min(audio_end, float(times[i + 1])), 4)} for i, w in enumerate(original)]


async def synthesize_one(row, semaphore):
    import edge_tts
    async with semaphore:
        speaker = row["speaker"]
        stem = WORK / str(row["id"])
        mp3 = stem.with_suffix(".mp3")
        metadata = stem.with_suffix(".jsonl")
        request_file = stem.with_suffix(".request.json")
        raw = stem.with_suffix(".wav")
        voice = VOICES[speaker]
        rate = RATES[speaker]
        request = json.dumps({"text": row["text"], "voice": voice, "rate": rate}, ensure_ascii=False, sort_keys=True)
        if not (mp3.exists() and metadata.exists() and request_file.exists() and request_file.read_text() == request):
            for attempt in range(3):
                try:
                    await edge_tts.Communicate(row["text"], voice, rate=rate, boundary="WordBoundary").save(mp3, metadata)
                    request_file.write_text(request)
                    break
                except Exception:
                    if attempt == 2:
                        raise
                    await asyncio.sleep(1 + attempt)
        command(["ffmpeg", "-y", "-v", "error", "-i", str(mp3), "-ac", "1", "-ar", str(SR), str(raw)])
        a = read_mono(raw)
        original_duration = len(a) / SR
        available = row["limit"] - row["start"]
        # Leave 25 ms for atempo's endpoint rounding. No voiced samples are cut.
        speed = max(1., (original_duration + .025) / available)
        if speed > 1.10:
            print(f"NEEDS EDIT {row['id']}: {original_duration:.3f}s in {available:.3f}s; requires {speed:.3f}x", flush=True)
            return {**row, "fit": False, "original_duration": original_duration,
                    "speed_needed": speed, "suggested_limit": round(row["start"] + original_duration + .05, 2)}, None
        if speed > 1:
            fit = stem.with_name(stem.name + "-fit.wav")
            command(["ffmpeg", "-y", "-v", "error", "-i", str(raw), "-af", f"atempo={speed:.8f}",
                     "-ar", str(SR), str(fit)])
            a = read_mono(fit)
        if len(a) / SR > available:
            raise RuntimeError(f"{row['id']} overflows by {len(a) / SR - available:.4f}s; adjust window, no truncation allowed")
        # Light fade on silent clip edges; normalize each voice to consistent RMS.
        a *= env(len(a), .008, .02)
        rms = math.sqrt(float(np.mean(a * a)))
        a *= min(.116 / max(rms, 1e-6), .72 / max(float(np.max(np.abs(a))), 1e-6))
        # Gentle saturation catches isolated TTS peaks without flattening phrases.
        a = (.78 * np.tanh(a / .78)).astype(np.float32)
        end = row["start"] + len(a) / SR
        boundaries = [json.loads(x) for x in metadata.read_text().splitlines() if x]
        result = {**row, "end": round(end, 4), "duration": round(len(a) / SR, 4), "voice": voice,
                  "scene_limit": row["limit"], "tts_rate": rate, "time_stretch": round(speed, 6),
                  "original_duration": round(original_duration, 4), "fit": True,
                  "words": caption_words(row["text"], boundaries, row["start"], speed, end)}
        sf.write(stem.with_name(stem.name + "-final.wav"), a, SR, subtype="PCM_24")
        print(f"{row['id']}: {row['start']:.2f}–{end:.2f}, {speaker}, {speed:.3f}x", flush=True)
        return result, a


async def narration(script):
    semaphore = asyncio.Semaphore(3)
    results = await asyncio.gather(*(synthesize_one(row, semaphore) for row in script["lines"]))
    report = [row for row, _ in results]
    (QA / "speech-fitting.json").write_text(json.dumps(report, indent=2, ensure_ascii=False) + "\n")
    failures = [row for row in report if not row["fit"]]
    if failures:
        raise RuntimeError("Copy/window edits needed: " + ", ".join(str(x["id"]) for x in failures))
    voice = np.zeros(round(script["duration"] * SR), dtype=np.float32)
    for row, a in results:
        s = round(row["start"] * SR)
        voice[s:s + len(a)] += a
    for a, b in zip(report, report[1:]):
        assert a["end"] < b["start"], f"Speech overlaps: {a['id']} / {b['id']}"
    return voice, report


def make_music(script):
    """Through-composed act structure, a recurring motif, and deliberate silence."""
    duration = script["duration"]
    music = np.zeros((round(duration * SR), 2), dtype=np.float32)
    rng = np.random.default_rng(2026091802)
    scene = {x["id"]: x for x in script["scenes"]}
    beat = 60 / BPM
    bar = beat * 4
    # All sounds are oscillators and filtered procedural noise, with no samples.
    chords = [([50, 57, 61, 64, 66], 38), ([47, 54, 57, 62, 66], 35),
              ([43, 50, 54, 57, 62], 31), ([45, 52, 57, 61, 64], 33)]

    def chord_at(start, index, strength=.7, length=None, felt=False):
        notes, root = chords[index % 4]
        length = length or bar * 2 + .7
        for j, pitch in enumerate(notes):
            stereo_add(music, note(pitch, length, "felt" if felt else "pad"), start + (j * .032 if felt else 0),
                       .042 * strength, (j - 2) * .29)
        return notes, root

    def motif(start, strength=.6, variant=0, wide=False):
        pitches = ([74, 78, 81, 78] if variant % 2 == 0 else [74, 76, 81, 78])
        offsets = [0, .75 * beat, 2 * beat, 3.25 * beat]
        for i, (pitch, offset) in enumerate(zip(pitches, offsets)):
            a = note(pitch, 1.8, "felt")
            pan = (-.45 if i % 2 == 0 else .45) if wide else (-.16 if i % 2 == 0 else .16)
            stereo_add(music, a, start + offset, .065 * strength, pan)
            stereo_add(music, a, start + offset + .75 * beat, .014 * strength, -pan)

    def percussion(at, strength=1., hats=True):
        for k in (0, 2):
            t = np.arange(round(.24 * SR)) / SR
            phase = 2 * np.pi * (48 * t + 48 * .026 * (1 - np.exp(-t / .026)))
            kick = (np.sin(phase) * np.exp(-t * 18) * env(len(t), .004, .04)).astype(np.float32)
            stereo_add(music, kick, at + k * beat, .11 * strength)
        for k in (1, 3):
            n = rng.normal(0, 1, round(.15 * SR))
            n = signal.sosfilt(signal.butter(2, [900, 4300], btype="bandpass", fs=SR, output="sos"), n)
            n *= np.exp(-np.arange(len(n)) / SR * 30) * env(len(n), .009, .04)
            stereo_add(music, n.astype(np.float32), at + k * beat, .050 * strength, .16)
        if hats:
            for k in (1, 3, 5, 7):
                n = rng.normal(0, 1, round(.05 * SR))
                n = signal.sosfilt(signal.butter(2, [4800, 8500], btype="bandpass", fs=SR, output="sos"), n)
                n *= env(len(n), .005, .035)
                stereo_add(music, n.astype(np.float32), at + k * beat / 2, .014 * strength, -.45 if k % 3 else .45)

    # Opening: unanswered fragments, space, a subtle pulse that disappears for
    # the question. The early tension resolves only when the product appears.
    chord_at(0, 1, .19, length=8)
    for i, at in enumerate([.2, 3.2, 6.2, 9.2, 12.2, 15.2]):
        stereo_add(music, note(74 if i % 2 == 0 else 76, .7, "bell"), at, .025, (-1) ** i * .32)
    chord_at(10, 2, .17, length=7.5)
    # 18–23.5s is intentionally near silent, then one lift into the reveal.
    stereo_add(music, note(69, 2.6, "pad"), scene["context"]["start"] - 1.5, .038)

    # Reveal and context: a new rounded bass/groove, motif evolves across bars.
    start, end = scene["context"]["start"], scene["context"]["end"]
    b = 0
    while start + b * bar < end:
        at = start + b * bar
        if b % 2 == 0:
            notes, root = chord_at(at, b // 2, .92)
        else:
            notes, root = chords[(b // 2) % 4]
        stereo_add(music, note(root, beat * 1.7, "bass"), at, .095)
        stereo_add(music, note(root + (12 if b % 4 == 3 else 0), beat * 1.2, "bass"), at + 2.5 * beat, .060)
        if b % 4 in (0, 2):
            motif(at + .5 * beat, .75, b, True)
        if b >= 2:
            percussion(at, .75 + .08 * (b % 3), hats=b % 4 != 3)
        b += 1

    # Slack: musical call-and-response, not an unbroken beat beneath text.
    start, end = scene["slack"]["start"], scene["slack"]["end"]
    at = start
    i = 0
    while at < end - 3:
        notes, root = chord_at(at, (i + 1) % 4, .43 if at < 79 else .63, length=7.8)
        if i % 2 == 0:
            for j, pitch in enumerate(notes[-3:]):
                stereo_add(music, note(pitch + 12, 1.8, "felt"), at + .6 + j * beat, .028, (j - 1) * .4)
        if 79 < at < 111:
            stereo_add(music, note(root, beat * 1.7, "bass"), at, .050)
            percussion(at + bar, .35, hats=False)
        at += 8 * beat
        i += 1
    motif(112.5, .7, 0, True)

    # Bridge: motif carried between tools then room tone under the meeting.
    bridge = scene["bridge"]["start"]
    chord_at(bridge, 2, .78, length=6)
    motif(bridge + .1, .85, 1, True)
    chord_at(bridge + 5.5, 3, .48, length=5.4)

    # Zoom: spacious low-register harmony and long intentional rests. No beat
    # during the absent-person exchange or the approval boundary.
    zoom = scene["zoom"]["start"]
    for at, index, strength, length in [
        (zoom, 1, .16, 5), (148, 0, .27, 7), (160.5, 2, .25, 11),
        (175, 0, .25, 8), (185, 2, .22, 5), (205, 0, .42, 6),
    ]:
        chord_at(at, index, strength, length=length)
    motif(205.8, .35, 1)

    # Morning: fresh voicing, warmer felt-piano motif and a slower harmonic
    # rhythm. Resolution is newly composed instead of looping the opening.
    morning = scene["handoff"]["start"]
    for i, at in enumerate([morning, morning + 5, morning + 10, morning + 15]):
        chord_at(at, [2, 0, 1, 3][i], .8, length=5.7, felt=True)
        chord_at(at, [2, 0, 1, 3][i], .42, length=5.7)
        if i % 2 == 0:
            motif(at + .5, .66, i, True)
    close = scene["close"]["start"]
    chord_at(close, 0, .92, length=duration - close)
    for j, pitch in enumerate([62, 69, 74, 78, 81]):
        stereo_add(music, note(pitch, min(5., duration - close - j * .15), "felt"), close + j * .15, .075, (j - 2) * .25)
    stereo_add(music, note(74, 3.2, "bell"), duration - 3.3, .032)

    # A score-wide envelope and filtering leave smooth scene joins and silence
    # at the end. Silence before identity and approval lines is deliberate.
    shape = np.interp(np.arange(len(music)) / SR,
                      [0, 1.2, 17.5, 18.4, 22.4, 24, 55, 56, 118, 120, 129.5, 131,
                       145, 147, 189, 190, 203.5, 205, 211, duration - 2.7, duration],
                      [0, 1, 1, .02, .02, 1, 1, .8, .85, 1, .3, .16,
                       .12, .6, .45, .035, .035, .6, 1, .8, 0]).astype(np.float32)
    music *= shape[:, None]
    music = signal.sosfilt(signal.butter(2, 9800, fs=SR, output="sos"), music, axis=0).astype(np.float32)
    music *= .30 / max(float(np.max(np.abs(music))), 1e-6)
    return music


def make_effects(script):
    effects = np.zeros((round(script["duration"] * SR), 2), dtype=np.float32)
    rng = np.random.default_rng(42009)
    cues = [(0, "clock"), (8.4, "clock"), (18, "drop"), (24, "reveal"),
            (34, "connect"), (37, "connect"), (44, "connect"), (49, "soft"),
            (56, "transition"), (63.5, "message"), (71.5, "message"), (78.5, "message"),
            (97.5, "message"), (107, "message"), (112.8, "success"),
            (119, "transition"), (129.5, "join"), (146.5, "soft"),
            (174.5, "connect"), (210.8, "transition"), (216, "connect"),
            (221, "connect"), (231, "reveal")]
    for at, kind in cues:
        if kind in ("transition", "reveal"):
            duration = .55 if kind == "transition" else .85
            t = np.arange(round(duration * SR)) / SR
            n = rng.normal(0, 1, len(t))
            a = signal.sosfilt(signal.butter(2, [300, 2100], btype="bandpass", fs=SR, output="sos"), n)
            a *= np.sin(np.pi * t / duration) ** 2
            stereo_add(effects, a.astype(np.float32), at - .22, .027)
            if kind == "reveal":
                for i, pitch in enumerate([62, 74, 81]):
                    stereo_add(effects, note(pitch, 1.2, "bell"), at + i * .07, .042 - i * .006, (i - 1) * .3)
        elif kind == "clock":
            for j in range(3):
                t = np.arange(round(.06 * SR)) / SR
                a = (np.sin(2 * np.pi * 920 * t) * np.exp(-t * 130) * env(len(t), .003, .01)).astype(np.float32)
                stereo_add(effects, a, at + .4 + j, .029, -.25 + j * .25)
        elif kind in ("message", "join"):
            # An original soft cue, not sampled Slack or Zoom brand audio.
            for j, pitch in enumerate([74, 78] if kind == "join" else [78, 74]):
                stereo_add(effects, note(pitch, .42, "bell"), at + j * .075, .028, -.12 + .24 * j)
        elif kind == "success":
            for j, pitch in enumerate([69, 74, 78]):
                stereo_add(effects, note(pitch, .9, "felt"), at + j * .12, .037, (j - 1) * .25)
        elif kind != "drop":
            stereo_add(effects, note(74 if kind == "connect" else 62, .8, "felt"), at, .023)
    effects *= env(len(effects), .04, 1.)[:, None]
    return effects, [{"time": t, "kind": k} for t, k in cues]


def srt_stamp(t):
    ms = round(t * 1000)
    h, ms = divmod(ms, 3600000)
    m, ms = divmod(ms, 60000)
    s, ms = divmod(ms, 1000)
    return f"{h:02}:{m:02}:{s:02},{ms:03}"


def write_captions(timeline, filename="captions.srt"):
    cues = []
    for row in timeline:
        chunk = []
        for i, w in enumerate(row["words"]):
            chunk.append(w)
            final = i == len(row["words"]) - 1
            terminal = w["text"].endswith((".", "?", "!")) and w["text"].lower() not in ("a.m.", "p.m.")
            upcoming = row["words"][i + 1:i + 3]
            short_tail = any(x["text"].endswith((".", "?", "!")) for x in upcoming)
            if (len(chunk) >= 8 and not short_tail) or terminal or final:
                text = " ".join(x["text"] for x in chunk)
                cues.append({"start": max(row["start"], chunk[0]["start"] - .03),
                             "end": min(row["end"], chunk[-1]["end"] + .10),
                             "text": LABELS[row["speaker"]] + text, "script_id": row["id"], "plain_text": text})
                chunk = []
    for i in range(len(cues) - 1):
        cues[i]["end"] = min(cues[i]["end"], cues[i + 1]["start"] - .012)
    blocks = [f"{i + 1}\n{srt_stamp(c['start'])} --> {srt_stamp(c['end'])}\n{c['text']}\n" for i, c in enumerate(cues)]
    (OUT / filename).write_text("\n".join(blocks) + "\n")
    return cues


def stats(a):
    peak = float(np.max(np.abs(a)))
    rms = float(np.sqrt(np.mean(a.astype(np.float64) ** 2)))
    return {"duration": len(a) / SR, "sample_rate": SR, "channels": 2,
            "peak_dbfs": round(20 * np.log10(max(peak, 1e-12)), 3),
            "rms_dbfs": round(20 * np.log10(max(rms, 1e-12)), 3),
            "clipped_samples": int(np.sum(np.abs(a) >= 1))}


def loudness(path, filename):
    proc = command(["ffmpeg", "-hide_banner", "-i", str(path), "-af",
                    "ebur128=peak=true:framelog=verbose", "-f", "null", "-"])
    (QA / filename).write_text(proc.stderr)
    summary = proc.stderr.split("Summary:")[-1].split("[out#")[0].strip()
    integrated = float(re.search(r"I:\s*(-?[\d.]+) LUFS", summary)[1])
    peak = float(re.search(r"Peak:\s*(-?[\d.]+) dBFS", summary)[1])
    lra = float(re.search(r"LRA:\s*([\d.]+) LU", summary)[1])
    return {"integrated_lufs": integrated, "true_peak_dbfs": peak, "loudness_range_lu": lra, "summary": summary}


def validate(script, timeline, cues, stems):
    duration = script["duration"]
    checks = {}
    for name in (*stems.keys(), "music-unducked"):
        a, sr = sf.read(OUT / f"{name}.wav", dtype="float32")
        assert sr == SR and a.shape == (round(duration * SR), 2), name
        assert np.isfinite(a).all() and np.max(np.abs(a)) < 1, name
        checks[name] = {"frames": len(a), "duration": len(a) / sr, "channels": 2,
                        "first_sample": a[0].tolist(), "last_sample": a[-1].tolist()}
    mixed, _ = sf.read(OUT / "mixed.wav", dtype="float32")
    total = np.zeros_like(mixed)
    for name in ("narration", "music", "effects"):
        a, _ = sf.read(OUT / f"{name}.wav", dtype="float32")
        total += a
    additive_error = float(np.max(np.abs(total - mixed)))
    assert additive_error < 1e-6
    assert all(row["start"] < row["end"] <= row["limit"] and row["time_stretch"] <= 1.10 for row in timeline)
    assert all(a["end"] < b["start"] for a, b in zip(timeline, timeline[1:]))
    assert all(0 <= c["start"] < c["end"] <= duration for c in cues)
    assert all(a["end"] <= b["start"] for a, b in zip(cues, cues[1:]))
    for row in timeline:
        reconstructed = " ".join(c["plain_text"] for c in cues if c["script_id"] == row["id"])
        assert reconstructed == row["text"], f"Caption text differs for {row['id']}"
    measurement = loudness(OUT / "mixed.wav", "loudness.txt")
    report = {"validation": "PASS", "checks": checks, "loudness": measurement,
              "all_clips_within_scene_windows": True, "speech_overlap": False,
              "maximum_time_stretch": max(x["time_stretch"] for x in timeline),
              "stems_sum_to_mix": True, "stem_rounding_error": additive_error,
              "captions": {"count": len(cues), "non_overlapping": True, "within_video": True, "all_script_text_preserved": True},
              "direct_listening_performed": False,
              "direct_listening_limitation": "No audio-listening input tool was available; numerical and ASR QA do not replace human listening."}
    (OUT / "validation.json").write_text(json.dumps(report, indent=2) + "\n")
    return report


def run_asr(report):
    from faster_whisper import WhisperModel
    model = WhisperModel("tiny.en", device="cpu", compute_type="int8", cpu_threads=4,
                         download_root=str(ROOT / "work/audio-models"))
    segments, _ = model.transcribe(str(OUT / "mixed.wav"), language="en", beam_size=5, vad_filter=True)
    trans = [{"start": s.start, "end": s.end, "text": s.text} for s in segments]
    (QA / "asr.json").write_text(json.dumps(trans, indent=2) + "\n")
    report["asr"] = {"model": "faster-whisper tiny.en", "segments": len(trans),
                     "transcript": "../../../../work/draft02/audio-qa/asr.json",
                     "note": "Supporting content check only. Transcript requires inspection and is not direct listening."}
    (OUT / "validation.json").write_text(json.dumps(report, indent=2) + "\n")
    print("\n".join(f"{x['start']:.1f}–{x['end']:.1f} {x['text']}" for x in trans), flush=True)


def apply_editorial_edit(edit_path):
    """Remove only verified silent speech gaps; preserve all original masters."""
    edit_bytes = edit_path.read_bytes()
    edit = json.loads(edit_bytes)
    original = json.loads((OUT / "timing.json").read_text())
    cuts = edit["cuts"]
    source_frames = round(edit["sourceDuration"] * SR)
    final_frames = round(edit["duration"] * SR)
    assert original["duration"] == edit["sourceDuration"]
    assert all(0 <= a < b <= edit["sourceDuration"] for a, b in cuts)
    assert all(b <= c for (_, b), (c, _) in zip(cuts, cuts[1:]))
    cut_frames = [(round(a * SR), round(b * SR)) for a, b in cuts]
    assert source_frames - sum(b - a for a, b in cut_frames) == final_frames
    segments = []
    last = 0
    for a, b in cut_frames:
        segments.append((last, a))
        last = b
    segments.append((last, source_frames))
    fade = round(.012 * SR)
    fade_in = np.sin(np.linspace(0, np.pi / 2, fade, dtype=np.float32)) ** 2
    fade_out = fade_in[::-1]
    voice, sr = sf.read(OUT / "narration.wav", dtype="float32")
    assert sr == SR
    cut_checks = []
    for (a, b), (sa, sb) in zip(cuts, cut_frames):
        affected = voice[max(0, sa - fade):min(len(voice), sb + fade)]
        peak = float(np.max(np.abs(affected)))
        overlaps = [x["id"] for x in original["lines"] if x["start"] < b + .012 and x["end"] > a - .012]
        assert not overlaps and peak == 0, f"Cut touches speech: {a}–{b}; {overlaps}; peak={peak}"
        cut_checks.append({"source_start": a, "source_end": b, "removed_seconds": round(b - a, 4),
                           "speech_peak_in_cut_and_fades": peak, "speech_overlap": False})
    checks = {}
    for name in ("narration", "music", "effects", "mixed", "music-unducked"):
        data, sr = sf.read(OUT / f"{name}.wav", dtype="float32")
        assert sr == SR and data.shape == (source_frames, 2)
        result = np.empty((final_frames, 2), dtype=np.float32)
        dest = 0
        for i, (a, b) in enumerate(segments):
            chunk = data[a:b].copy()
            if i:
                chunk[:fade] *= fade_in[:, None]
            if i < len(segments) - 1:
                chunk[-fade:] *= fade_out[:, None]
            result[dest:dest + len(chunk)] = chunk
            dest += len(chunk)
        assert dest == final_frames and np.isfinite(result).all() and np.max(np.abs(result)) < 1
        if name == "narration":
            untouched = np.concatenate([data[a:b] for a, b in segments])
            assert np.array_equal(untouched, result), "Edit fades altered nonzero speech samples"
        sf.write(OUT / f"edited-{name}.wav", result, SR, subtype="PCM_24")
        checks[name] = {**stats(result), "frames": len(result),
                        "first_sample": result[0].tolist(), "last_sample": result[-1].tolist()}
        print(f"Edited {name}: {len(result) / SR:.3f}s", flush=True)

    def remap(t):
        return round(t - sum(max(0., min(t, b) - a) for a, b in cuts), 4)

    edited = json.loads(json.dumps(original))
    edited["source_duration"] = original["duration"]
    edited["duration"] = edit["duration"]
    edited["edit_sha256"] = hashlib.sha256(edit_bytes).hexdigest()
    edited["edit"] = edit
    edited["edit_note"] = "Seven speech-free cuts; 12ms fade-out and fade-in at each join without changing duration. Source masters preserved."
    for row in edited["lines"]:
        row["source_start"], row["source_end"] = row["start"], row["end"]
        for key in ("start", "end", "limit", "scene_limit"):
            row[key] = remap(row[key])
        row["duration"] = round(row["end"] - row["start"], 4)
        for word in row["words"]:
            word["start"], word["end"] = remap(word["start"]), remap(word["end"])
    for scene in edited["scenes"]:
        scene["start"], scene["end"] = remap(scene["start"]), remap(scene["end"])
    edited["effects"] = [{**cue, "time": remap(cue["time"])} for cue in original["effects"]
                         if not any(a <= cue["time"] < b for a, b in cuts)]
    edited["stats"] = checks
    (OUT / "edited-timing.json").write_text(json.dumps(edited, indent=2, ensure_ascii=False) + "\n")
    cues = write_captions(edited["lines"], "edited-captions.srt")
    assert all(0 <= cue["start"] < cue["end"] <= edit["duration"] for cue in cues)
    assert all(a["end"] <= b["start"] for a, b in zip(cues, cues[1:]))
    assert all(a["end"] < b["start"] for a, b in zip(edited["lines"], edited["lines"][1:]))
    for row in edited["lines"]:
        assert " ".join(c["plain_text"] for c in cues if c["script_id"] == row["id"]) == row["text"]
    mixed, _ = sf.read(OUT / "edited-mixed.wav", dtype="float32")
    stem_sum = np.zeros_like(mixed)
    for name in ("narration", "music", "effects"):
        data, _ = sf.read(OUT / f"edited-{name}.wav", dtype="float32")
        stem_sum += data
    error = float(np.max(np.abs(stem_sum - mixed)))
    assert error < 1e-6
    report = {"validation": "PASS", "source_duration": edit["sourceDuration"], "duration": edit["duration"],
              "removed_seconds": round(edit["sourceDuration"] - edit["duration"], 4),
              "edit_sha256": edited["edit_sha256"], "cuts": cut_checks, "checks": checks,
              "join_fade_out_ms": 12, "join_fade_in_ms": 12, "duration_lost_to_fades": 0,
              "all_remaining_narration_samples_bit_identical": True,
              "all_scripted_words_preserved": True, "speech_overlap": False,
              "stems_sum_to_mix": True, "stem_rounding_error": error,
              "captions": {"count": len(cues), "non_overlapping": True, "within_video": True},
              "loudness": loudness(OUT / "edited-mixed.wav", "edited-loudness.txt"),
              "direct_listening_performed": False,
              "direct_listening_limitation": "No audio-listening input tool was available. Original full-mix ASR reviewed; edited narration samples are unchanged."}
    (OUT / "edited-validation.json").write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({"edit_validation": report["validation"], "duration": report["duration"],
                      "loudness": report["loudness"], "speech_preserved": True}, indent=2), flush=True)


async def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--script", type=Path, default=ROOT / "video/public/draft02/script.json")
    parser.add_argument("--asr", action="store_true")
    parser.add_argument("--edit", type=Path, default=ROOT / "video/public/draft02/edit.json")
    parser.add_argument("--edit-only", action="store_true", help="Apply edit.json to existing original masters without resynthesizing")
    args = parser.parse_args()
    for path in (OUT, WORK, QA):
        path.mkdir(parents=True, exist_ok=True)
    if args.edit_only:
        apply_editorial_edit(args.edit)
        return
    script_bytes = args.script.read_bytes()
    script = json.loads(script_bytes)
    assert all(x["speaker"] in VOICES and 0 <= x["start"] < x["limit"] <= script["duration"] for x in script["lines"])
    voice, timeline = await narration(script)
    music = make_music(script)
    effects, cues_sfx = make_effects(script)
    gain = np.ones(len(voice), dtype=np.float32) * .52
    for row in timeline:
        s = round(max(0, row["start"] - .22) * SR)
        a = round(row["start"] * SR)
        b = round(row["end"] * SR)
        e = min(len(gain), b + round(.5 * SR))
        low = .15 if row["speaker"] == "narrator" else .12
        gain[s:a] = np.minimum(gain[s:a], np.linspace(.52, low, a - s))
        gain[a:b] = np.minimum(gain[a:b], low)
        gain[b:e] = np.minimum(gain[b:e], np.linspace(low, .52, e - b))
    music_ducked = music * gain[:, None]
    stereo_voice = np.column_stack([voice, voice])
    mixed = stereo_voice + music_ducked + effects
    temp = QA / "premaster.wav"
    sf.write(temp, mixed, SR, subtype="FLOAT")
    measured = loudness(temp, "premaster-loudness.txt")
    desired_gain = 10 ** ((-16.0 - measured["integrated_lufs"]) / 20)
    peak_gain = 10 ** ((-1.6 - measured["true_peak_dbfs"]) / 20)
    master_gain = min(desired_gain, peak_gain)
    stems = {"narration": stereo_voice * master_gain, "music": music_ducked * master_gain,
             "effects": effects * master_gain, "mixed": mixed * master_gain}
    for name, data in stems.items():
        sf.write(OUT / f"{name}.wav", data, SR, subtype="PCM_24")
    sf.write(OUT / "music-unducked.wav", music * master_gain, SR, subtype="PCM_24")
    metadata = {"title": "AI Peer — Draft 02 illustrative concept film", "duration": script["duration"],
                "sample_rate": SR, "bpm": BPM, "script_sha256": hashlib.sha256(script_bytes).hexdigest(),
                "voices": VOICES, "voice_disclosure": "Four standard synthetic voices; no voice cloning or imitation of real people.",
                "music": "Original oscillator and noise synthesis, composed separately for each story act; no third-party recording or samples.",
                "score_structure": "Sparse unanswered opening; reveal groove; Slack call-and-response; near-silent Zoom dialogue and approval moment; warm morning felt piano and tonic resolution.",
                "notes": "Every scripted word preserved. Pitch-preserving atempo is capped at 1.10. No voiced audio is trimmed to fit. SRT timing is based on TTS boundaries, not forced alignment.",
                "master_gain_db": round(20 * math.log10(master_gain), 4), "scenes": script["scenes"],
                "lines": timeline, "effects": cues_sfx, "stats": {name: stats(data) for name, data in stems.items()}}
    (OUT / "timing.json").write_text(json.dumps(metadata, indent=2, ensure_ascii=False) + "\n")
    cues = write_captions(timeline)
    report = validate(script, timeline, cues, stems)
    print(json.dumps(report, indent=2), flush=True)
    if args.asr:
        run_asr(report)
    if args.edit.exists():
        apply_editorial_edit(args.edit)


if __name__ == "__main__":
    asyncio.run(main())
