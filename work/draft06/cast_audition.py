from pathlib import Path
import json
import sys

sys.path.insert(0, "video/scripts")
import audio_build_06 as build
from faster_whisper import WhisperModel

script = json.loads(Path("video/public/draft06/script.json").read_text())
where = Path("work/draft06/audio-cast-sarah").resolve()
where.mkdir(exist_ok=True)
build.WORK = where
build.QA = where
build.CAST["narrator"] = {"voice_id": "EXAVITQu4vr4xnSDxMaL", "name": "Sarah - Mature, Reassuring, Confident",
                            "role": "Calm, clear explanatory narrator", "stability": .60}
chosen = ["intro_relief", "intro_airchat", "slack_intro", "close"]
records = build.synthesize(script, chosen)
trial = {**script, "lines": [{**row, "limit": row["start"] + 15} for row in script["lines"] if row["id"] in chosen]}
by_id = {row["id"]: row for row in trial["lines"]}
records = [{**row, "limit": by_id[row["id"]]["limit"]} for row in records]
_, timeline = build.narration(trial, records)
build.supporting_asr(timeline)
model = WhisperModel("base.en", device="cpu", compute_type="int8", cpu_threads=4,
                     download_root=str(build.ROOT / "work/audio-models"))
checks = []
for name in chosen + ["zoom_source"]:
    for cast, directory in [("original", build.ROOT / "work/draft06/audio-clips"), ("sarah", where)]:
        if name == "zoom_source" and cast == "sarah":
            continue
        segments, _ = model.transcribe(str(directory / f"{name}-final.wav"), language="en", beam_size=5,
                                       vad_filter=False, condition_on_previous_text=False)
        item = {"line": name, "cast": cast, "base_en": " ".join(x.text.strip() for x in segments)}
        checks.append(item)
        print(json.dumps(item), flush=True)
(where / "comparison-base.json").write_text(json.dumps(checks, indent=2) + "\n")
