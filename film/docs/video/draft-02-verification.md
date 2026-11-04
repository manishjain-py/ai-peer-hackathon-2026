# Draft 02 verification

Status: **PASS for the recorded technical and sampled visual checks**. The final
[1080p MP4](../../renders/ai-peer-draft-02.mp4) is complete and ready for creative review.
Direct audio listening remains outside the performed checks.

## Completed source and audio checks

- TypeScript check passes for both preserved Draft 01 and new Draft 02.
- More than 30 representative scene frames were rendered at 1920×1080 and inspected.
- Independent script review corrected status continuity, hourly-source specificity,
  technical jargon and the distinction between a promised test follow-up and completed tests.
- Two independent visual reviews inspected actual rendered images. Changes corrected
  message scrolling, source visibility, caption timing, Peer mark consistency,
  channel naming and handoff navigation wrapping.
- Source timeline: 240 seconds. Editorial map: seven speech-free cuts totaling
  15.9 seconds. Final target: 224.1 seconds / 6,723 frames at 30 fps.
- All 29 lines / 368 words remain intact. Every source speech start maps exactly to
  the edited speech start. No speech overlaps or cut syllables.
- Every removed audio interval and its 12ms join-fade region contains zero narration.
  Retained narration samples are unchanged from the source master.
- Edited 48kHz stereo PCM24 master: −16.0 LUFS integrated, −3.7 dBTP; no clipping.
- Source ASR recovers the complete script except ordinary “won”/“one” homophone
  normalization. Some isolated identity phrases recognize “Manish’s” imperfectly;
  the full mix recognizes the name. This is not a direct listening review.
- Burned-in captions use measured source word boundaries, with the same source-time
  mapping as picture. The standalone SRT uses the edited audio timeline.

## Final exported artifact

- Final file: `renders/ai-peer-draft-02.mp4`, 19,602,927 bytes.
- SHA-256: `b363321d55c3f9f4359410f872cad1de7c56538e3ccc15901bdebb2fd200e58d`.
- H.264, 1920×1080, 30 fps, 6,723 encoded and decoded frames.
- Exact video and audio duration: 224.100 seconds. Faststart confirmed.
- Actual color encoding is full-range `yuvj420p`; this is recorded rather than
  claiming limited-range `yuv420p` from the requested render option.
- AAC-LC, 48kHz stereo, 192kb/s target; −16.0 LUFS integrated / −3.7 dBTP / 9.9 LU LRA.
- Full picture and AAC decoding completed with exit code 0 and no errors.
- No duplicate embedded subtitle stream. The film includes authored visible
  captions; the 69-cue standalone SRT matches the edited master exactly.
- Independent encoded-film review inspected 99 preview frames across key motion
  intervals and all seven edit joins. A second reviewer inspected 132 frames
  across 11 non-Zoom transition intervals. No blockers found in these samples.
- Independent final-file spot-checks at 96.0, 167.5 and 223.0 seconds confirm source
  visibility, Zoom evidence, matching captions, and the closing disclosure. Root
  also inspected final-file frames at 104.0, 167.5 and 222.5 seconds.

## Review boundaries

All UI, messages, employee names, sources and outcomes are illustrative. Slack
and Zoom are authored reconstructions. Webcam participants are generated still
images with small framing changes, not lip-synced video or actual employees.
The film does not demonstrate working integrations.

Visual inspection and speech recognition do not substitute for hearing the mix.
**Direct listening was not performed.** No statement of audio-listening approval
should be inferred from the numerical or ASR results.

## Evidence

- [Final export QA](../../work/draft02/final-technical-qa.json)
- [Encoded-film creative review](../../work/draft02/final-film-review.md)
- [Audio QA](../../video/public/draft02/audio/validation.json)
- [Edited audio QA](../../video/public/draft02/audio/edited-validation.json)
- [Script review](../../work/draft02/script-review-lock.md)
- [First visual review](../../work/draft02/visual-review-01.md)
- [Second design review](../../work/draft02/independent-design-review.md)
