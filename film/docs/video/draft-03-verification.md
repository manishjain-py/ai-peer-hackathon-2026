# Draft 03 verification

Status: **PASS for recorded technical and sampled visual checks.**
[Final Draft 03](../../renders/ai-peer-draft-03.mp4) is complete. Direct listening
was not available and is explicitly excluded from this verification.

## Completed checks

- TypeScript passes. All prior film versions remain registered and preserved.
- Script has 26 lines with a 166.5-second timeline; the audio metadata's SHA-256
  matches the exact final script. At 30 fps, the picture requires 4,995 frames.
- Independent use-case strategy and complete-script review were performed before
  production. Fit trims were rechecked for preserved meaning and claim boundaries.
- Initial 29 full-film 1080p stills and targeted corrected frames were rendered.
  An independent creative reviewer inspected the complete story; another reviewer
  inspected root-authored scenes independently of the personal brief they built.
- Corrected early reveal overlap, hackathon date consistency, premature mapping
  receipt status, source-copy consistency and the personal brief's affected-code label.
- New voices use Qwen3 CustomVoice and authored VoiceDesign performances. No
  reference recordings or voice clones are used. All Zoom clips remain at 1.00x;
  only the Slack identity clip uses a 1.032x pitch-preserving fit.
- Zoom clip gaps are exactly 350ms. The packed scene lasts 21.5 seconds. Closing
  holds for eight seconds, rather than the earlier eleven.
- The original 124 BPM score resets at scene transitions and ducks for speech.
- WAV master: 166.5 seconds, 48kHz stereo PCM24, −16.0 LUFS / −1.7 dBTP. No clipping
  or non-finite samples. All 54 SRT cues fit without overlap.
- Base.en supplies word timing; small.en cross-checks uncertain clips. This is
  ASR-assisted alignment. Proper-name and homophone recognition remains imperfect.

## Final export checks

- Final full-resolution artifact: 15,372,513 bytes, 1920×1080 H.264, 30 fps.
- SHA-256: `30bf165802e7722a27660ba6a2c47459a77048a7f0d999af8d1d4d25c2a56bc2`.
- Both the final and 960×540 preview fully decoded picture and AAC with no errors.
- Both contain exactly 4,995 decoded frames, with 166.500-second video and audio.
- Final AAC-LC, 48kHz stereo: −16.0 LUFS / −1.6 dBTP, 6.6 LU loudness range.
- Actual video uses full-range 4:2:0 `yuvj420p`; faststart confirmed by MP4 atom order.
- No embedded subtitle stream duplicates the visible authored captions. Both
  54-cue SRT sidecars exactly match the source and fit the timeline without overlaps.
- Independent creative review inspected 168 temporal preview samples across 14
  intervals, plus final 1080p frames at 49, 128 and 165 seconds. Another reviewer
  inspected 124 samples and final frames at 109, 128 and 165 seconds. No blocking
  visual issue was found in those samples.
- Final 128-second frame confirms the source quote exactly matches Slack:
  “It updates hourly.” This wording was corrected after the preview render; the
  preview's semantically equivalent “refreshes” is not the final text.

[Final technical evidence](../../work/draft03/final-technical-qa.json),
[encoded-film creative review](../../work/draft03/final-film-review.md).

## Delivery

Telegram confirmed the requested video delivery: message **4857**, file size
15,372,513 bytes. The [receipt](../../work/draft03/telegram-delivery.json) is retained.
Only the completed film was sent; nothing was publicly published.

## Evidence and limits

[Audio review](../../video/public/draft03/audio/audio-review.json),
[WAV validation](../../video/public/draft03/audio/validation.json),
[script review](../../work/draft03/script-review.md),
[independent design review](../../work/draft03/independent-design-review.md).

**Direct listening was not performed.** The session's audio tool explicitly did
not support input. ASR, waveform checks and numerical levels cannot establish
that a voice sounds human or that the musical balance is subjectively right.
Do not describe sampled visual review as uninterrupted full-speed viewing.

The video is an illustrative concept film. Email, Slack, code, company events
and all employee/project facts are authored examples. Continuous monitoring,
retrieval and live integrations are not implemented. Zoom uses camera-off
initial avatars; Slack reuses fictional generated profile images from Draft 02.
