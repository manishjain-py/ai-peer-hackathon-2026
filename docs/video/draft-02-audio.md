# Draft 02 audio

Built and checked on 18 September 2026 against the 240-second [Draft 02 source script](../../video/public/draft02/script.json), then shortened to **224.100 seconds** using the seven speech-free cuts in [edit.json](../../video/public/draft02/edit.json). The film and all conversations are illustrative concept material. The live product is not implemented.

## Integration

Use [edited-mixed.wav](../../video/public/draft02/audio/edited-mixed.wav) once at film time zero. It already includes the entire cast, ducked music, and effects. Do not layer its stems under the mix. The original 240-second `mixed.wav` is preserved for editorial work and must not be used with the shortened picture.

The picture renders silently with visible captions authored into the film. [finalize-02.sh](../../video/scripts/finalize-02.sh) copies the rendered H.264 picture and adds the mix as 192 kb/s stereo AAC. It creates a separate SRT and deliberately adds no subtitle stream, avoiding duplicate visible captions. It refuses to finalize if picture and audio lengths differ by more than 50 milliseconds.

From the project root:

```sh
bash video/scripts/finalize-02.sh --preview
bash video/scripts/finalize-02.sh
```

Preview expects `renders/ai-peer-draft-02-preview-silent.mp4` and writes `renders/ai-peer-draft-02-preview.mp4`. Full export expects `renders/ai-peer-draft-02-silent.mp4` and writes `renders/ai-peer-draft-02.mp4`. Run these only after the corresponding complete silent render exists.

## Source files

All files below are in [video/public/draft02/audio/](../../video/public/draft02/audio/).

| File | Purpose |
|---|---|
| `edited-mixed.wav` | Complete 224.100-second soundtrack for the final silent picture. |
| `edited-narration.wav` | All four cast voices on the shortened timeline. |
| `edited-music.wav` | Edited original score with speech ducking already applied. |
| `edited-effects.wav` | Edited original transition, connection, clock, and message cues. |
| `edited-music-unducked.wav` | Edited music source without speech ducking. |
| `edited-timing.json` | Script and voice timings remapped to final film time. |
| `edited-captions.srt` | 69 nonoverlapping final-time cues preserving every scripted word. |
| `edited-validation.json` | Final WAV duration, levels, cut checks, and speech-preservation proof. |
| Same filenames without `edited-` | Preserved 240-second source masters, captions, timings, and validation. |
| `audio-review.json` | Script-hash check and inspected ASR comparison results. |

Every WAV is stereo, 48 kHz, 24-bit PCM. Edited WAVs are exactly 224.100 seconds; original source WAVs remain exactly 240.000 seconds. Draft 01 assets are preserved.

The film source maps final film time back to source time for its visual animation and visible captions. It therefore intentionally retains `timing.json` for visual timing. Use `edited-timing.json` and `edited-captions.srt` when working directly in the shortened timeline.

## Cast and speech

The cast uses four standard synthetic voices from `edge-tts`. No real person's voice was cloned, and no paid API or private credential was used.

| Role | Stock voice |
|---|---|
| Narrator | `en-US-AvaNeural` |
| Sarah | `en-US-EmmaNeural` |
| Alex | `en-US-BrianNeural` |
| Manish's AI Peer | `en-US-AndrewNeural` |

The current script has 29 lines and 368 words. All fit at their natural synthesis speed with a `+0%` rate: no additional time stretching was needed. All speech fits its assigned window and no clips overlap. The complete clips occupy 144.576 seconds, leaving space for visual actions, reading, reactions, and transitions. The final line ends at 222.41 seconds in the shortened film, corresponding to 238.31 seconds in the source.

The pipeline preserves all scripted text and never cuts voiced samples to meet a window. If a future edit requires more than 1.10× additional speed, the builder stops and reports that the copy or window needs adjustment. Captions use measured TTS word boundaries; differences in tokenization are mapped back to the original wording. These are not human-reviewed forced alignments.

The on-screen AI identity and spoken introductions remain essential. The stock Peer voice is a fictional AI voice, not Manish's voice.

## Score and effects

The original procedural score is composed at 104 BPM using oscillators and filtered noise. It contains no external recordings or samples. It follows separate sections rather than extending the first draft's short loop. Times below refer to the preserved source timeline; the final edit shortens only Zoom gaps:

- **Opening, 0–24 s:** unanswered note fragments and sparse clock cues, with near silence before the product question.
- **Context, 24–56 s:** rounded bass, a fuller groove, and an evolving four-note motif.
- **Slack, 56–119 s:** lighter musical responses and occasional percussion, leaving room for the written exchange.
- **Bridge, 119–130 s:** a short lift carries the motif between tools.
- **Zoom, 130–211 s:** low, spacious harmony, long rests, and no beat beneath the absent-person exchange or the launch-approval boundary.
- **Morning and close, 211–240 s:** warmer felt-piano synthesis, wider harmony, and a newly composed tonic resolution.

Effects are restrained and synthesized for this film. Message and meeting cues are original, not sampled Slack or Zoom notification sounds. Speech triggers a gentle music reduction before each utterance and a gradual return afterward. One global mastering gain preserves stem additivity.

## Conversation pacing edit

Independent creative review identified excessive pauses in the Zoom conversation. Seven cuts remove 15.900 seconds without touching speech: source times 136.5–138.0, 144.0–145.7, 153.3–156.0, 170.4–174.0, 181.0–183.0, 187.7–189.2, and 202.3–205.2 seconds.

Each removed region, plus its surrounding 12-millisecond fade zones, was checked against the narration waveform and measured as exactly zero. A 12-millisecond fade-out and fade-in smooth each music/effects join without crossfading or losing any additional time. All remaining narration samples are bit-identical to the corresponding source samples. No spoken word or natural speech pause within a line was changed.

## Verification performed

The **edited 224.100-second WAV master** passes the following measured checks:

- Exact length: **224.100 seconds / 10,756,800 stereo frames** per stem.
- Integrated loudness: **−16.0 LUFS**.
- True peak: **−3.7 dBFS**, measured with FFmpeg `ebur128`.
- Loudness range: **9.9 LU**, including intentional quiet sections and rests.
- No clipped or non-finite samples; first and last samples are zero.
- The three stems sum to the master within 24-bit PCM rounding.
- Every clip fits its window; every caption fits the film and avoids overlap.
- Caption text reconstructs all original scripted text exactly.
- The audio timing metadata matches the current script's SHA-256 hash.

Local `faster-whisper tiny.en` transcribed the full 240-second source soundtrack. After normalizing punctuation, capitalization, “2am,” and “time zone,” the only remaining full-script difference was the homophone **“won” transcribed as “one.”** No omitted scripted content was found. Targeted recognition also recovered the data checks, hourly-source confirmation, and launch-approval boundary correctly. The edited version preserves every remaining narration sample exactly; its ASR content is supported by that source review and the waveform comparison.

Isolated Peer introductions sometimes transcribe “I'm Manish's” as “I'm Anisha's,” while the complete soundtrack recognizes Manish correctly. This is a specific listening-review item, not proof that the synthesis is wrong. ASR timestamps are approximate and must not replace `timing.json` for film animation.

**Direct listening was not performed:** no audio-listening input tool was available. Numerical checks and ASR do not establish conversational naturalness or musical quality. Review the Peer introductions, turn-taking, and score balance by ear in the completed film.

Both the 960×540 preview and the **1920×1080 final export** passed complete picture-and-AAC decodes with no errors. The final AAC measures **−16.0 LUFS, −3.7 dBFS true peak, and 9.9 LU loudness range**. Both final streams are exactly 224.100 seconds; all **6,723 frames at 30 fps** were decoded and counted. The MP4 has no subtitle stream, its 69-cue sidecar matches the edited master, and the `moov` atom precedes `mdat` for fast playback start. The AAC encoder target was 192 kb/s; the resulting average stream bitrate is approximately 170.5 kb/s.

The actual H.264 pixel format is full-range `yuvj420p`, recorded explicitly rather than assumed to be limited-range `yuv420p`. Results, artifact SHA-256, stream details, and decode logs are recorded in [final-technical-qa.json](../../work/draft02/final-technical-qa.json) and [preview-technical-qa.json](../../work/draft02/preview-technical-qa.json). Direct listening remains unperformed; successful decode and measured loudness do not replace it.

## Rebuilding

Run [audio_build_02.py](../../video/scripts/audio_build_02.py) with Python and the dependencies already used by Draft 01. It reads `video/public/draft02/script.json`, synthesizes changed requests only, builds the score and effects, writes the original mix and captions, and validates the result. The optional `--asr` flag also transcribes the full source mix. If `edit.json` exists, the builder then applies it and writes the edited outputs without replacing source masters.

```sh
python video/scripts/audio_build_02.py --asr
```

To apply the current edit to existing source masters without resynthesizing or rebuilding music:

```sh
python video/scripts/audio_build_02.py --edit-only
```

This build used the existing environment at `/Users/manishjain/Documents/Codex/2026-09-18/do-a-deep-analysis-of-this/work/audio-venv/bin/python`. Cached clips live in `work/draft02/audio-clips/`; ASR transcripts, loudness logs, and fitting details live in `work/draft02/audio-qa/`. The source request text, voice, and rate are checked against the cache before reuse.

The inspected `audio-review.json` records the script hash it reviewed. If the script changes, repeat the comparison and update that review alongside a new build.
