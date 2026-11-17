# Moss v5 soundtrack

V39 adds one Matilda line at 90.4–97.9 seconds:
“Thousands of company updates. I find what matters to Ram's role, goals and interests,
and bring it into his morning brief.” It uses the same ElevenLabs Multilingual v2 voice
and settings as V4, through the authorized fal.ai route. Direct ElevenLabs credentials
remain unavailable. Only invented narration was submitted. Official endpoint/schema:
https://fal.ai/models/fal-ai/elevenlabs/tts/multilingual-v2/api . Price was checked live:
$0.10 per 1,000 characters. The 123-character call cost $0.0123; request, result, source,
prepared WAV, word timings and ledger are saved. Normal rebuild makes no paid call.

All 22 existing voice recordings are retained. Setup/learned/brief/ask/rules narration
moves into the selectively shortened walkthrough. Meeting voices move 7.4 seconds earlier;
Slack narration starts at 83.2. The introduction at 15, morning at 100 and closing times
are unchanged. Local transcription of the complete changed middle recovers every line;
`changed-speech-check.json` times are relative to film 24.6 seconds. In particular, “I'll”
in the notebook promise is at film 79.10, and the reply ends around 81.8. The older m4b
provider word metadata overestimates its final word; the actual retained WAV is 4.21 seconds.

The composition is the same saved Lyria b2 take. `bed-moss-v5.edl.json` makes deliberate
bar-aligned joins: the thin bars at 58 and 82 support Zoom at 59.2 and Slack at 82. An
unbroken eight-bar source phrase runs from 84–100, carrying Slack into the information
ocean. Its level opens at 90, settles at the relevance selection around 94, then lifts
after narration at 98. The original speech ducking remains. The morning change at 100,
globe rise and resolved final cadence at 116 retain their exact V3/V4 samples.

`bed-verification.json` proves unchanged decoded music from 0–57.9 and 99.9–119.6.
`pcm-preservation.json` proves the actual completed V4 mix is unchanged from 0–24.6 and
99.9–119.6, including the whole new introduction and resolved ending. The new middle
joins those samples with 50ms blends. `mix-report.json` measures the completed WAV and
speech/music separation. Encoded exports are checked separately. These are source,
timing, transcription and measurement checks; direct human listening is not claimed.

Rebuild from the repository root with Node, ffmpeg, Python and uv:

```sh
uv run --quiet demo-video/moss-ocean/audio/prepare_voice.py
node demo-video/moss-ocean/audio/build_mix.mjs
```

Intermediate candidate/stems are in ignored `.build/audio/`. Saved recipes, selected
voice, bed and complete mix are retained in git/LFS. Earlier audio and movies are untouched.
