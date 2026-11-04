# Draft 04 audio

Draft 04 rebuilds the opening around a person receiving competing demands,
followed by a quiet beat, the AI Peer reveal and a short setup sequence.
The remaining story keeps the selected Draft 03 speech performances.

## Performance and reuse

The new narration uses the same locally generated Qwen3 VoiceDesign direction
as Draft 03: a fictional American English presenter with warm, brisk, connected
phrasing. Dialogue that has not changed reuses the exact selected Draft 03
normalized clip and its word alignment, moved to the new timeline. The builder
matches both the script copy and the speaker before permitting reuse. This
preserves the chosen Sarah, Alex and AI Peer performances and avoids introducing
new differences in their voices.

These are synthetic voices. No real employee recording, imitation or voice
clone is used. See [Draft 03 audio](draft-03-audio.md) for the cast, model sources
and performance directions.

## Music and effects

The score keeps the original 124 BPM electro-pop palette: short keyboard notes,
syncopated bass, kick, clap and light percussion. The opening gradually gathers
rhythm with the notifications. Brief, pitched attention cues follow the cards'
left/right positions; these are authored sounds, not Slack or Zoom recordings.
The music drops away for half a second before the product reveal, creating room
for the person to regain focus. Setup milestones receive smaller connection
accents. The same musical palette continues into the retained daily brief,
Slack, Zoom and morning handoff.

All score and effects audio is synthesized from oscillators and filtered noise.
No third-party sample or commercial recording is used. Speech ducking follows
the actual clip timings with a short attack and recovery.

## Build and verification

Use the existing local runtime:

```sh
work/draft03/audio-venv/bin/python video/scripts/audio_build_04.py --asr
```

The [builder](../../video/scripts/audio_build_04.py) reads the Draft 04 script,
reuses matching performances and generates only new lines. Original Draft 03
source, selected clips and outputs remain unchanged. Synthesis requests and
recognition results for new speech are retained in `work/draft04/`.

The builder checks equal stem lengths, finite samples, clipping, no overlapping
speech, scene-window fit, exact caption copy and additive stem reconstruction.
Caption text remains the script copy; speech recognition supplies timing anchors.
The target is −16 LUFS with a true-peak ceiling of −1.7 dBTP.

Direct listening is not supported in this session. Numerical checks and speech
recognition cannot establish voice naturalness or subjective music balance.

## Completed soundtrack

Use [mixed.wav](../../video/public/draft04/audio/mixed.wav) once at picture time
zero; it includes voice, ducked score and effects. The soundtrack is exactly
**179.5 seconds** (2:59.5), with 35 spoken lines: 13 new narrator performances
and 22 selected Draft 03 performances. All 13 new performances fit at **1.00x**.
The original Slack introduction retains its existing 1.032x adjustment; the
Zoom lines remain at 1.00x, with **350ms** gaps between voices.

The stereo 48 kHz / 24-bit WAV measures **−16.0 LUFS / −2.8 dBTP**, with a
5.9 LU loudness range. All five WAVs have the same 8,616,000 frames and zero
at their first/last samples. No clipping, overlapping speech or scene overflow
was found. Separate captions preserve every scripted word in **60 cues**.

- [Timing and voice metadata](../../video/public/draft04/audio/timing.json)
- [Separate captions](../../video/public/draft04/audio/captions.srt)
- [Numerical validation](../../video/public/draft04/audio/validation.json)
- [Performance reuse and secondary recognition review](../../video/public/draft04/audio/audio-review.json)
- [Narration](../../video/public/draft04/audio/narration.wav),
  [ducked music](../../video/public/draft04/audio/music.wav),
  [unducked music](../../video/public/draft04/audio/music-unducked.wav) and
  [effects](../../video/public/draft04/audio/effects.wav).

Full-mix recognition used Whisper tiny.en. A separate small.en pass checked
all 13 new lines and did not reproduce the spurious tail phrases that base.en
occasionally recognized. It recovered the intended wording, including the
numeric examples, Sourcegraph and GitHub; normal differences remain in the
spelling/tokenization of AI Peer, runbook and numeric words. These are supporting
content checks, not listening approval. The 22 reused normalized performances
were also checked sample-by-sample against their placed narration segments,
allowing only final 24-bit rounding and master gain.

## Final encoded exports

The completed [1080p film](../../renders/ai-peer-draft-04.mp4) and
[540p preview](../../renders/ai-peer-draft-04-preview.mp4) were each fully
decoded, including both picture and AAC audio. Both contain **5,385 frames at
30 fps**, exactly **179.5 seconds** of picture and sound, and stereo 48 kHz
AAC-LC. The encoded AAC measures **−16.1 LUFS / −2.8 dBTP**, with a 5.9 LU
loudness range. No decoding errors were found. Both use MP4 fast start and have
no additional subtitle stream; their separate 60-cue SRT files match the source
captions byte for byte. File hashes, atom order, measured frame counts and
export details are recorded in the
[final technical QA](../../work/draft04/final-technical-qa.json).

These encoded-export checks remain technical checks; direct listening was not
performed.
