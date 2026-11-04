# Draft 04 verification

Status: **PASS for the recorded technical and sampled visual checks.**
The [final 1080p video](../../renders/ai-peer-draft-04.mp4) is complete. Direct
audio listening was not available and is excluded from these checks.

## Source and audio

- TypeScript passes for all preserved and new film compositions.
- Final script and audio metadata match. Timeline 179.5s / 5,385 frames at 30 fps.
- 35 spoken lines: 13 new narrator clips and 22 exact selected Draft 03 clips.
- All new clips play at 1.00x. Reused clips match the corresponding Draft 03 narration
  sample-by-sample within 24-bit rounding tolerance. Zoom gaps stay 350ms.
- WAV master 179.5s, 48kHz stereo PCM24: −16.0 LUFS / −2.8 dBTP. No clipping/nonfinite samples.
- 60 caption cues fit and do not overlap. Word timing is ASR-assisted; all new
  phrases were additionally checked with Whisper small.en.
- All 32 first-pass integrated stills were reviewed. Corrected setup frames 40,
  42.5 and 49 were inspected after fixing panel-footer overflow and the mapping return.
- The fictional human visibly turns toward demands, grows concerned and relaxes
  through the connected Peer reveal. Early inbox worry was strengthened after review.

## Final export and encoded review

- Full file: 18,812,060 bytes, 1920×1080 H.264, 30 fps, 5,385 decoded frames.
- SHA-256: `1de1b9473136b84959d79c58627dd947c0cba970c7fc538d8cbe239e5db8dd80`.
- Full and preview picture/AAC streams are exactly 179.500 seconds and fully decode
  without errors. Actual pixel format is full-range 4:2:0 `yuvj420p`.
- AAC-LC 48kHz stereo: −16.1 LUFS / −2.8 dBTP, 5.9 LU loudness range.
- Faststart verified. No extra subtitle stream; both 60-cue sidecars are byte-equal
  to the source, within timeline bounds and non-overlapping.
- Independent creative review sampled 141 encoded preview frames: 108 across the
  opening at half-second intervals and 33 later states/cuts. Final 1080p spotchecks
  at 6.5, 25.5, 40, 49 and 178 seconds confirm concern, relief, corrected code, contained
  panel chips, access boundary and final disclosure. No blocker found.
- A separate reviewer sampled 62 encoded frames across 24.5–55 seconds, independently
  reviewing root-authored setup. Final 40/49 second checks confirm corrected code and
  layout. Root also inspected actual final frames 6.5/25.5/49.
- The final's early inbox expression includes the refined flatter mouth; the preview
  may contain the earlier, milder version. Final spotchecks resolve this difference.

[Final technical QA](../../work/draft04/final-technical-qa.json),
[final creative review](../../work/draft04/final-film-review.md),
[independent setup review](../../work/draft04/setup-review.md).

## Delivery

Telegram confirmed delivery of the completed 1080p film: message **4870**,
18,812,060 bytes. [Receipt](../../work/draft04/telegram-delivery.json). This continues
the user-authorized private delivery workflow; nothing was publicly published.

## Evidence and limits

[Audio review](../../video/public/draft04/audio/audio-review.json),
[WAV validation](../../video/public/draft04/audio/validation.json),
[independent visual review](../../work/draft04/independent-visual-review.md),
[setup review](../../work/draft04/setup-review.md).

**Direct listening was not performed.** The available tools do not support audio
input. Numeric checks and ASR do not certify subjective voice or musical quality.
Visual samples must not be described as uninterrupted full-speed viewing.

All people, messages, profiles, projects, code and source screens are illustrative.
The OneAirbnb profile is authored, not fetched. No live connector/product behavior
has been implemented or demonstrated by the film. The user retains consequential
decisions; all synthetic voices are fictional and no voice was cloned.
