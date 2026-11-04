# Draft 07 audio

Draft 07 replaces the Zoom chapter with a cross-team conversation and preserves
the exact selected Draft 06 speech everywhere else. The meeting includes a
missing Risk Partner Systems representative, the Peer's AI introduction and
delegated attendance, a status update, a useful question, partner responses and
a reviewable handoff. Other story sections keep their previous performances.

## Cast and reuse

| Role | ElevenLabs catalog voice |
|---|---|
| Narrator | Sarah |
| Manish's AI Peer | Aarav J |
| Maya, Product host | Alice |
| Alex, D-REX participant | Karthik |
| Jordan, Case Platform participant | Chris |
| Unchanged Slack data partner | Chris |

Maya, Alex and Jordan are generic authored participants. These are licensed
catalog performances, not recordings or imitations of real colleagues. Alice
adds a separate, clear female meeting voice while the previous cast is retained.
Caption names follow the script's `speaker_labels` map.

The soundtrack contains **41 lines: 32 exact selected Draft 06 performances and
nine newly generated ElevenLabs lines**. The new lines are the Zoom chapter title
and eight meeting turns. Reuse matches text, role, voice ID, spoken text and any
explicit seed. A change in neighboring dialogue does not regenerate an unchanged
performance. Later unchanged lines move forward 23 seconds, with the same word
timing offsets applied to their captions.

All new speech uses Eleven Multilingual v2 with speed **1.0**, style exaggeration
**0**, similarity **0.75** and moderate stability. There is no speed fitting.
See [Draft 06 audio](draft-06-audio.md) for the provider documentation, secure
credential handling, casting background and listening limitation.

## Soundtrack and verification

The completed mix is **263 seconds (4:23)**. Its stereo 48 kHz / 24-bit WAVs each
contain **12,624,000 frames**, begin and end at zero, and pass finite-sample,
clipping, stem-sum and duration checks. The mix measures **−16.0 LUFS / −2.8 dBTP**,
with an 8.1 LU loudness range. All 41 lines run at **native 1.00x** and fit their
scene windows without overlap.

The 32 selected reused clips were compared sample by sample with their placement
in the final narration stem. The largest error is approximately `1.19e-7`, within
the final PCM rounding allowance. The common master gain is accounted for; the
performances are not resynthesized, retimed or renormalized.

Supplied ElevenLabs character timing maps every scripted word with a **1.0 match**.
All **85 caption cues** preserve the script and remain non-overlapping. The new
meeting's natural durations required a tiny status-window margin and an earlier
Alex reply; the 263-second scene plan remains intact.

The original 124 BPM score and authored effects extend through the longer meeting.
Later chapter/action cues move with the picture, including the missed-notification
title at 189 seconds and invitation action at 226.5 seconds.

Small.en recognition was inspected for all nine new lines. It recovered the
meeting's content, but misrecognized the possessive name in the Peer's introduction.
A second base.en pass recovered the intended Manish/AI identity, delegated
attendance and late-hour explanation. Unchanged clips retain their earlier
recognition evidence. **Direct listening was not performed:** recognition and
numerical checks do not establish subjective naturalness or musical balance.

- [Complete mixed soundtrack](../../video/public/draft07/audio/mixed.wav)
- [Actual word timing and selected clip provenance](../../video/public/draft07/audio/timing.json)
- [Separate captions](../../video/public/draft07/audio/captions.srt)
- [Numerical and sample-reuse checks](../../video/public/draft07/audio/validation.json)
- [Recognition and performance review](../../video/public/draft07/audio/audio-review.json)

The locked script SHA-256 begins `a8e55e9d1be756f6`; the mix SHA-256 begins
`f5103068e28c9905`. Full hashes are retained in the reports.

## Build and final exports

```sh
work/draft03/audio-venv/bin/python video/scripts/audio_build_07.py --provisional
work/draft03/audio-venv/bin/python video/scripts/audio_build_07.py --asr
```

The [builder](../../video/scripts/audio_build_07.py) provides clearly provisional
timing for early visual work, then replaces it with actual source timing during
the complete build. Use only `public/draft07/audio/mixed.wav` at picture time zero;
it already contains speech, music and effects.

The [540p preview](../../renders/ai-peer-draft-07-preview.mp4) fully decoded
without errors: **263 seconds / 7,890 frames at 30 fps**. Its stereo 48 kHz
AAC-LC audio measures **−16.0 LUFS / −2.7 dBTP**, with an 8.1 LU loudness range.
All 85 sidecar cues match the source byte for byte. The MP4 has fast start and
no additional subtitle stream. It is 10,484,008 bytes, with SHA-256 beginning
`1b7f5b4613ccbe0b`. See the [preview audit](../../work/draft07/preview-technical-qa.json).

The full-resolution export audit is complete; see the final check below.
Earlier draft files remain preserved. Direct listening was not performed.

## Final export check

Root completed the final1080p audit after reviewer usage limits:263 s,7,890 frames,
AAC −16.0 LUFS/−2.7 dBTP,85 matching sidecar cues,zero decode errors and faststart.
See [combined technical QA](../../work/draft07/final-technical-qa.json).
