#!/usr/bin/env -S uv run --quiet --script
# /// script
# requires-python = ">=3.10,<3.13"
# dependencies = ["faster-whisper>=1.1", "numpy>=1.26"]
# ///
"""stt_check: listen to speech with a speech-to-text model on this Mac and compare the words.

    uv run --quiet demo-video/film/tools/stt_check.py lines            # every narration line and sample
    uv run --quiet demo-video/film/tools/stt_check.py file A.wav ...   # print what is heard in any file
    uv run --quiet demo-video/film/tools/stt_check.py film TRACK.wav   # a whole mix against the script

No session can hear, so this is the ear. It runs fully on this Mac (faster-whisper), which is
why it may also be pointed at a mix that contains the private product recordings.

"Peer" and "pier" sound the same, so the model often writes "pier": both count as the same
word here, and the raw transcript is always printed so a real slip is still visible.
Options: --model small.en (default) | medium.en | large-v3   --json OUT.json
"""
from __future__ import annotations

import json
import re
import subprocess
import sys
from pathlib import Path

import numpy as np
from faster_whisper import WhisperModel

FILM = Path(__file__).resolve().parents[1]
AUDIO = FILM / "audio"

NUMBERS = {"zero": "0", "one": "1", "two": "2", "three": "3", "four": "4", "five": "5", "six": "6",
           "seven": "7", "eight": "8", "nine": "9", "ten": "10"}
SAME = {"pier": "peer", "piers": "peers", "pierre": "peer", "peers": "peer's", "ai": "ai", "a.i.": "ai"}


def norm(text: str) -> list[str]:
    t = text.lower().replace("’", "'")
    t = re.sub(r"\ba\.?\s?m\.?(?=\W|$)", "am", t)
    t = re.sub(r"\bp\.?\s?m\.?(?=\W|$)", "pm", t)
    t = re.sub(r"\ba\.\s?i\.?", "ai", t)
    t = re.sub(r"(\d)\s*(am|pm)\b", r"\1 \2", t)
    t = re.sub(r"[^a-z0-9' ]+", " ", t)
    out = []
    for w in t.split():
        w = w.strip("'")
        w = NUMBERS.get(w, w)
        w = SAME.get(w, w)
        if w:
            out.append(w)
    return out


def distance(a: list[str], b: list[str]) -> int:
    """Word-level edit distance."""
    prev = list(range(len(b) + 1))
    for i, x in enumerate(a, 1):
        cur = [i]
        for j, y in enumerate(b, 1):
            cur.append(min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (x != y)))
        prev = cur
    return prev[-1]


def hear(model: WhisperModel, path: Path, prompt: str | None = None) -> tuple[str, list[dict]]:
    # Decode with ffmpeg: the model then never depends on its own audio reader.
    raw = subprocess.run(["ffmpeg", "-hide_banner", "-loglevel", "error", "-i", str(path), "-vn", "-ac", "1",
                          "-ar", "16000", "-f", "f32le", "-"], check=True, capture_output=True).stdout
    audio = np.frombuffer(raw, dtype=np.float32)
    segments, _ = model.transcribe(audio, language="en", beam_size=5, word_timestamps=True,
                                   condition_on_previous_text=False, initial_prompt=prompt, vad_filter=False)
    text, words = [], []
    for s in segments:
        text.append(s.text.strip())
        for w in s.words or []:
            words.append({"w": w.word.strip(), "s": round(w.start, 2), "e": round(w.end, 2)})
    return " ".join(text), words


def main() -> None:
    args = sys.argv[1:]
    model_name, out_json = "small.en", None
    while "--model" in args:
        i = args.index("--model")
        model_name = args[i + 1]
        del args[i:i + 2]
    while "--json" in args:
        i = args.index("--json")
        out_json = Path(args[i + 1])
        del args[i:i + 2]
    mode = args[0] if args else "lines"
    model = WhisperModel(model_name, device="cpu", compute_type="int8", cpu_threads=8)
    report = {"model": f"faster-whisper {model_name}", "mode": mode, "items": []}

    if mode == "lines":
        script = json.loads((AUDIO / "script.json").read_text())
        todo = [(x["id"], AUDIO / "lines" / f"{x['id']}.wav", x["text"]) for x in script["lines"]]
        todo += [(v["file"], AUDIO / "samples" / f"{v['file']}.wav", script["samples"]["text"]) for v in script["samples"]["voices"]]
        bad = 0
        for name, path, want in todo:
            heard, _ = hear(model, path)
            d = distance(norm(want), norm(heard))
            bad += d > 0
            report["items"].append({"id": name, "want": want, "heard": heard, "word_errors": d})
            print(f"{'ok  ' if d == 0 else 'DIFF'} {name:<40} heard: {heard}")
            if d:
                print(f"     {'':<40} want:  {want}")
        print(f"{len(todo) - bad} of {len(todo)} match the script word for word ({report['model']})")
    elif mode == "file":
        for p in args[1:]:
            heard, words = hear(model, Path(p))
            report["items"].append({"file": p, "heard": heard, "words": words})
            print(f"{p}\n  {heard}")
    elif mode == "film":
        track = Path(args[1])
        script = json.loads((AUDIO / "script.json").read_text())
        heard, words = hear(model, track)
        hw = norm(heard)
        found = 0
        for line in script["lines"]:
            want = norm(line["text"])
            best = min((distance(want, hw[i:i + len(want)]) for i in range(max(1, len(hw) - len(want) + 1))), default=len(want))
            ok = best <= max(1, len(want) // 6)
            found += ok
            report["items"].append({"id": line["id"], "want": line["text"], "word_errors": best, "found": ok})
            print(f"{'ok  ' if ok else 'MISS'} {line['id']:<4} errors {best}  {line['text']}")
        report["heard"] = heard
        report["words"] = words
        print(f"{found} of {len(script['lines'])} script lines are heard in the track ({report['model']})")
        print("heard:", heard)
    else:
        raise SystemExit(__doc__)
    if out_json:
        out_json.write_text(json.dumps(report, indent=1, ensure_ascii=False) + "\n")


if __name__ == "__main__":
    main()
