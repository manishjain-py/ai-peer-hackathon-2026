# Draft 01 — export and verification

Date: 2026-09-18. Artifact: [ai-peer-draft-01.mp4](../../renders/ai-peer-draft-01.mp4).

## Export

| Property | Verified value |
|---|---|
| Duration | 120.000 seconds |
| Picture | 1920×1080, 30 fps, 3,600 frames |
| Video codec | H.264, yuv420p |
| Sound | AAC, stereo, 48 kHz, 120 seconds |
| Captions | Optional English mov_text track and [separate SRT](../../renders/ai-peer-draft-01.srt) |
| Size | 11,341,316 bytes |
| Final AAC loudness | −16.5 LUFS integrated; −1.5 dBFS true peak; 6.4 LU range |

## Checks performed

- `npm run typecheck` passed after the final source edits.
- Eleven representative full-resolution scene stills were visually inspected by two agents.
- Eighteen transition samples covered starts, intermediate wipes and settled frames at six scene boundaries.
- Transition review caught a meeting-introduction text wrap. A width constraint fixed the source. Frames 2,610–3,134 were rendered again and replaced in the silent export; the combined picture was encoded to H.264 before final audio/caption muxing.
- The corrected meeting screen at 91 seconds and the handoff boundary at 104.5 seconds were inspected from the corrected export.
- The entire final picture and sound decoded with FFmpeg without errors.
- FFprobe verified duration, frame count, codecs, resolution and audio streams.
- FFmpeg measured final AAC loudness and true peak. The source WAVs also passed sample, duration, speech-window and stem-sum checks.
- All 37 subtitle cues fit within the video and do not overlap.
- ASR provided a supporting content check for the mixed soundtrack.

The current source includes every correction. A normal full rebuild requires no
patching step; follow the [build instructions](README.md).

## Review limits

This is a first creative draft. Visual review used stills and transition samples;
it was not a continuous human playback review. Audio validation used signal
analysis and speech recognition; **direct listening was not performed**. Human
review should assess voice delivery, music taste and overall pacing, including
the pronunciation of Manish and the meeting phrase “Risk Platform sync.”

The concept badge remains visible. UI, source facts, messages and meeting answers
are authored examples. No live enterprise integration is demonstrated.

Temporary diagnostic files are under `work/`: `final-decode.log`,
`final-audio-levels.log`, `meeting-91-final.png`, `handoff-104-5-final.png`, and
transition/still contact sheets. The [audio notes](audio.md) document the original
score, voice generation, timing and reproducibility.
