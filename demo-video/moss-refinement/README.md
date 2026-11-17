# Moss blended refinement v3

V36 addresses Manish's 17 November feedback. This is a new preserved cut built beside
Moss v2, v1 and the approved Tag v2. Runtime remains 119.600 seconds, 3588 frames at30fps.

The phone reveal zooms directly into Moss and the setup home. A real generated stamping
action puts a large circular HIGH CONFIDENCE seal on the answer; the value is the existing
answer's stated confidence. The removed information/instructions sentence is absent from
voice, captions and shown rules. Zoom uses three genuine audio-driven speaking takes from
the original voice files. Slack gets10.6 seconds: tagging/waiting, Moss reading and thinking,
actual keyboard/paw typing and text appearing, then a large labelled reply with sources.
A projected happy Moss greets Ram on the morning laptop; the room and screen follow the
same camera push before the brief. The original music is retained around its key scenes;
the thin-bar cues move with Zoom/Slack, and the ending uses the original take's own cadence.

## Rebuild

Use the existing node/Chrome/ffmpeg/uv tools. No private files, credentials or generation
are needed to render saved assets. `git lfs pull --include="demo-video/**" --exclude=""`.

```sh
# Rebuild new music bed and mix (existing voice takes only).
uv run --quiet demo-video/moss-refinement/audio/build_bed.py
node demo-video/moss-refinement/audio/build_mix.mjs
# Inspect source under captions before committing a long encode.
node demo-video/moss-refinement/render.mjs --film --live-walk-probe --probe
# Encode the complete clean walkthrough, then full movie and720p copy.
node demo-video/moss-refinement/render.mjs
node demo-video/moss-refinement/render.mjs --film
```

`--times=14,16.3,61,94.5,104.6 --label=focused` selects specific proof frames. Captures use
software compositing: Chrome GPU left a stale moving-video ghost inside the live iframe
proof; `--disable-gpu` resolves it. Every visible actor seek is awaited. Actual finalfilm
uses the encoded clean walkthrough, not the proof iframe. VP9 alpha decoding through
ffmpeg needs `-c:v libvpx-vp9` before `-i`.

Source: `../ui-concepts/moss-v3/`, cut: `../film/cuts/blended-moss-v3/`. Final outputs:
`../film/renders/blended-moss-v3.mp4` and `blended-moss-v3-720p.mp4`. Caption timing and
morning/globe/end landmarks are maintained; Zoom moves2.8seconds earlier after sentence
removal to give Slack its readable final hold. All original movie files remain untouched.

## New assets and source provenance

One identity-preserving Gemini stamp keyframe and five fal H3 Max Turbo clips: stamp,
keyboard typing, and the three Zoom lines m1/m2/m4b. User-approved Gemini/fal workflow;
imagegen prompting guidance read. Generic Moss art and the pre-existing fictional voice
lines are the sole provider inputs. No UI, company data or private recording uploaded.
Prompts/requests, provider results, selected source videos, alpha videos and ledgers saved.
Alpha removes the generated stamp's tiny illegible mark below the feet; readable ink is
composited from the actual High confidence value. No new voice generation.

Intermediate source checkpoint: focused visual proof accepted, long film encoding next.
Final media acceptance and delivery are recorded by the controller after render/review.
Audio methodology/measurements are in `audio/README.md`; no direct listening claim.
