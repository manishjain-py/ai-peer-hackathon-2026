# Draft 06 audio

Draft 06 replaces every previous speech performance with newly generated
ElevenLabs speech. Manish asked for natural, restrained voices suited to each
role. The original upbeat score remains, adapted to the new four-minute story.

## Casting and performance

The current ElevenLabs account catalog was inspected on 19 September 2026.
The selected cast is:

| Role | Catalog voice | Intended delivery |
|---|---|---|
| Narrator | Sarah | Clear, warm American English; restrained explanation |
| Manish's AI Peer | Aarav J | Relaxed Indian English; practical, conversational replies |
| Neel / team colleague | Karthik | Balanced Indian English; ordinary workplace questions |
| Data owner / Charan | Chris | Direct American English; grounded conversational replies |

These are licensed catalog performances. They are not imitations or recordings
of Manish, Neel, Charan or other people depicted in the authored scenarios.
The internal `alex` and `sarah` keys remain script roles, not the displayed names.

The starting engine is **Eleven Multilingual v2**. ElevenLabs describes it as
appropriate for consistent professional speech and long-form content; this fits
the restrained voice direction. Each request uses native speed **1.0**, style
exaggeration **0**, similarity **0.75** and moderate stability. Immediate
same-speaker neighboring text supplies continuity context.
See the official [model guide](https://elevenlabs.io/docs/overview/models) and
[voice settings guide](https://elevenlabs.io/docs/eleven-creative/playground/text-to-speech).

The API returns PCM audio and character timing. Those supplied timestamps are
mapped to the exact script words for captions; independent speech recognition
is a content check rather than the caption clock.
See [speech with timing](https://elevenlabs.io/docs/api-reference/text-to-speech/convert-with-timestamps).

## Credential and request handling

The existing ElevenLabs credential is read in memory from Like Magic's external
environment file. Its value is never copied into this project or printed.
Read-only account checks confirmed an active subscription with sufficient
remaining generation allowance. Only filtered non-secret account/catalog
metadata is retained in `work/draft06/audio-catalog/`.

Each generated clip is cached by its exact request. Script timing changes reuse
the same performance. Requests, selected audio and timing responses are retained
without authentication headers. An uncertain network request is marked pending
and is not automatically repeated, avoiding accidental duplicate generation.

## Build

```sh
work/draft03/audio-venv/bin/python video/scripts/audio_build_06.py --provisional
work/draft03/audio-venv/bin/python video/scripts/audio_build_06.py --asr
```

The [builder](../../video/scripts/audio_build_06.py) creates a clearly labelled
provisional timing file for early visual work. The complete build generates all
speech, maps vendor-supplied timing, checks natural-duration scene fit, and mixes
speech with the original 124 BPM score and authored effects. There is no speed
fitting. If a line is too long, its copy or picture window must be revised.

## Review limits and current status

The audio input path was tested using an existing catalog preview. The tool
explicitly reported that audio input is unsupported in this session. Direct
listening and a perceptual judgment of voice naturalness cannot be claimed.
Available checks cover source provenance, exact wording, supplied timing,
speech recognition, clipping, loudness, overlap and encoded playback integrity.

All 39 performances have been generated. Amara was the first narrator candidate.
A four-line comparison with Sarah used the same script, settings and two local
recognizers. Both recognizers recovered the key names “AI Peer” and “AirChat”
more clearly from Sarah's takes. Sarah was therefore selected for the complete
narration. This is a content-clarity check, not a listening judgment. The Peer
and colleague voices remain Aarav J, Karthik and Chris.

## Completed soundtrack

The finished soundtrack is **240 seconds (4:00)**. Every one of its **39 spoken
lines** is a new ElevenLabs performance at **native speed 1.00x**: 26 narrator
lines, eight Peer replies, three data-owner/Charan lines and two Neel lines.
No previous Qwen or Edge speech remains. Server-supplied character timestamps
map to every exact scripted word, with a 1.0 alignment match for all lines.
There are **79 non-overlapping caption cues**, preserving the complete script.

The stereo 48 kHz / 24-bit WAV mix measures **−16.0 LUFS / −2.8 dBTP**, with an
8.1 LU loudness range. Every stem contains exactly **11,520,000 frames** and
begins and ends at zero. The mix passes clipping, finite-sample, stem-sum,
duration, speech-window and overlap checks. Native speech windows were adjusted
slightly for three lines; no speech was accelerated or cut to fit.

The original score and authored accents follow the reveal at 24 seconds and
chapter cards at 64, 96, 136 and 166 seconds. The invitation action has a small
connection accent at 203.5 seconds. Music remains under speech with additional
ducking, while the invitation response has room to breathe.

- [Complete mixed soundtrack](../../video/public/draft06/audio/mixed.wav)
- [Actual word timing and voice provenance](../../video/public/draft06/audio/timing.json)
- [Separate captions](../../video/public/draft06/audio/captions.srt)
- [Numerical validation](../../video/public/draft06/audio/validation.json)
- [Casting comparison and recognition review](../../video/public/draft06/audio/audio-review.json)

Small.en recognition was inspected for all 39 selected lines. It recovers the
important narrator product names and the scenario wording. Remaining recognition
normalization includes Peer/Pier, Yash/Yasha, Airversary/anniversary and the spelling
of Boris Cherny. Small.en omitted the opening of the backend-first Zoom line;
a separate base.en check recovered that instruction, with “backend” transcribed
as “back and.” These are documented recognition limitations. **Direct listening
was not performed.**

The script SHA-256 begins `66cb480c15183c81`; the mixed WAV SHA-256 begins
`6e3c33fee0dc72ed`. Complete hashes are retained in the JSON reports.

## Final encoded exports

The completed [1080p film](../../renders/ai-peer-draft-06.mp4) and
[540p preview](../../renders/ai-peer-draft-06-preview.mp4) each fully decoded
without errors: **7,200 frames at 30 fps**, exactly **240 seconds** of picture
and stereo 48 kHz AAC-LC audio. Both AAC tracks measure **−16.0 LUFS / −2.7 dBTP**,
with 8.1 LU loudness range. Their 79-cue sidecars match the source byte for byte.
Both MP4s use fast start and have no additional subtitle stream.

The full film is **23,378,607 bytes**, with SHA-256 beginning `f14372ae65973568`.
The preview is **10,130,883 bytes**, with SHA-256 beginning `f4419fe1d7652af5`.
Full hashes, decoded frame counts, AAC measurements, caption checks and atom
order are recorded in the [combined technical QA](../../work/draft06/final-technical-qa.json).
The [full-film audit](../../work/draft06/full-technical-qa.json) and
[preview audit](../../work/draft06/preview-technical-qa.json) are also retained
separately. Both file and sidecar hashes were rechecked when combining them.

These are technical export checks. Direct listening was not performed.
