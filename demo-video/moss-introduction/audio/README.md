# Moss v4 introduction audio

Selected line: “I'm Ram's AI Peer, his proactive AI teammate, keeping him informed and
covering for him around the clock.” It starts at15.0 seconds and lasts6.667 seconds,
including its natural tail, before the existing setup line at22.2. `intro-v4.json` holds
the word timings. Local speech recognition in `intro-speech-check.json` recovers the full
line; “Rahm” is the established spoken spelling for the fictional Ram.

The direct ElevenLabs credential listed in START-HERE is absent on this Mac. The first
local attempt stopped before any HTTP request and cost nothing. The selected take uses
the same Matilda voice and Eleven Multilingual v2 model through the already authorized
fal.ai account. This avoids changing voice/model or requesting another credential.
Official [model](https://fal.ai/models/fal-ai/elevenlabs/tts/multilingual-v2) and
[schema](https://fal.ai/models/fal-ai/elevenlabs/tts/multilingual-v2/api) were checked on
17 November2026. Stability0.6, similarity0.75, style0 and speed1.0 match the previous
settings supported by this endpoint; neighbouring fictional lines are supplied as context.

The saved request is `../requests/intro-v4.json`; source MP3, result, prepared WAV and
metadata are retained. Price checked live: $0.10/1,000 characters. The106-character call
cost **$0.0106**, recorded in `../ledger/fal.csv`, taking the project to **$51.398527**.
Only invented narration text was submitted; no picture, private recording or company data.
No further provider call is pending. Regeneration is optional; normal rebuild is offline:

```sh
uv run --quiet demo-video/moss-introduction/audio/prepare_voice.py
node demo-video/moss-introduction/audio/build_mix.mjs
```

The mix uses the entire unchanged V3 music bed and all21 other original voice recordings.
`splice_mix.py` replaces only14–24.6 seconds, with50ms joins. `pcm-preservation.json`
proves actual V3 mixed samples remain identical from0–14 and24.6–119.6, including all
meeting, Slack, morning, globe and ending audio. `mix-report.json` records-13.9LUFS,
-2.0dBTP and19dB voice/music separation for the new introduction. The final AAC exports
are checked separately. No direct listening claim is made. Rebuildable stems are ignored
under `.build/audio`; earlier movie and audio files remain untouched.
