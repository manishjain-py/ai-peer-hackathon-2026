from pathlib import Path
import json
import sys

ROOT = Path(__file__).resolve().parents[2]
sys.path.insert(0, str(ROOT / "video/scripts"))
import audio_build_05 as build
from faster_whisper import WhisperModel

script = json.loads((ROOT / "video/public/draft05/script.json").read_text())
original = {r["id"]: r for r in script["lines"]}
results = []
for seed in (31, 47):
    where = ROOT / "work/draft05" / f"audio-audition-{seed}"
    where.mkdir(exist_ok=True)
    build.base.WORK = where
    build.base.QA = where
    rows = []
    for i, identity in enumerate(("brief_event", "slack_peer")):
        row = {**original[identity], "seed": seed, "start": i * 15, "limit": i * 15 + 14}
        if identity == "brief_event":
            row["direction"] = build.base.DIRECTIONS["peer"] + " Pronounce the name Charan as chuh-run, in two clear syllables."
        rows.append(row)
    trial = {**script, "duration": 30, "lines": rows}
    records = build.base.synthesize(trial)
    _, timeline = build.base.narration(trial, records)
    asr = WhisperModel("small.en", device="cpu", compute_type="int8", cpu_threads=4,
                       download_root=str(ROOT / "work/audio-models"))
    for row in timeline:
        segments, _ = asr.transcribe(str(where / f"{row['id']}-final.wav"), language="en", beam_size=5,
                                     word_timestamps=True, vad_filter=False, condition_on_previous_text=False)
        segments = list(segments)
        result = {"id": row["id"], "seed": seed, "duration": row["duration"],
                  "base": row["asr_text"], "small": " ".join(s.text.strip() for s in segments),
                  "source_path": row["source_path"], "direction": row["direction"]}
        results.append(result)
        print(json.dumps(result), flush=True)
    del asr
(ROOT / "work/draft05/audio-qa/audition-review.json").write_text(json.dumps(results, indent=2) + "\n")
