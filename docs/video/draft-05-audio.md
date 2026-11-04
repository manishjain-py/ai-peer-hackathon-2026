# Draft 05 audio

Draft 05 adds Manish's Risk Partner Systems context and the proposed AI Peer
plugin for AirChat. GitHub supplies the checked-in work context; the AirChat
sequence explains local work in progress. Sourcegraph is removed from this draft.
The earlier draft soundtracks remain preserved.

## Cast and performance

Unchanged copy reuses the exact selected Draft 04 or Draft 03 performance,
matched by line ID, script text, speaker and any explicit direction/seed.
Changed lines retain the local Qwen3 narrator, Ryan and Aiden. The simulated
partner/Charan dialogue uses a newly authored generic male VoiceDesign
performance, replacing the earlier Sarah voice. It is not an imitation of
Charan or any real colleague. The internal `sarah` role key is retained only for
compatibility with the existing script and UI timing.
See [Draft 03 audio](draft-03-audio.md) for the voice models, cast, provenance
and synthetic-voice disclosure.

The voices are fictional synthetic performances, not recordings or clones of
Manish or his colleagues. The new builder rejects speech fitting above 1.05x;
the aim is to keep new performances at natural speed and place picture around
their actual duration. Source takes, requests and normalized selected clips
remain available in `work/draft05/audio-clips/`.

## Music and effects

The original 124 BPM score retains Draft 04's pressure opening, spatial
notification cues and brief pause before the Peer reveal. Setup accents follow
the new milestones. Later musical changes follow the script's scene boundaries.
The score and effects use authored oscillators and filtered noise, with no
third-party samples or commercial recordings. Music ducks around the actual
speech windows.

## Build and verification

```sh
work/draft03/audio-venv/bin/python video/scripts/audio_build_05.py --asr --secondary-asr
```

The [builder](../../video/scripts/audio_build_05.py) reads
`video/public/draft05/script.json`. It preserves previous selected clips,
generates changed speech, aligns the exact caption copy to recognition anchors,
and builds a single mixed soundtrack plus separate stems.

Checks cover finite samples, clipping, equal stem lengths, reconstruction of
the mix, speech overlap, window fit and exact caption text. It measures the
rendered WAV loudness and checks the placed reused performances sample by
sample. Whisper base.en supplies caption anchors; tiny.en checks the complete
mix, and the optional small.en pass provides a second check of every new line.

Use `video/public/draft05/audio/mixed.wav` once at picture time zero. It already
contains speech, ducked music and effects. Do not add stems underneath it.

Numerical checks and speech recognition cannot establish voice naturalness or
subjective music quality. Direct listening is not supported in this session;
it must not be reported as completed.

## Completed soundtrack

The soundtrack is **196 seconds (3:16)**, with 35 spoken lines: **20 new
performances and 15 exact selected performances** from Draft 04/03. Every line
fits at **1.00x**. Slack and Zoom are placed around the actual clip durations;
each Zoom turn has a **350ms** endpoint gap. Separate captions retain every
scripted word in **65 non-overlapping cues**, with the current speaker labels:
Neel, D-REX partner, Charan, and Manish's AI Peer.

The stereo 48 kHz / 24-bit WAV mix measures **−16.0 LUFS / −2.3 dBTP**, with a
6.5 LU loudness range. All five WAVs contain exactly 9,408,000 frames, begin and
end at zero, and pass the numerical checks. The 15 reused selected clips match
their placed narration sample by sample, allowing only final 24-bit rounding
and the master gain.

- [Mixed soundtrack](../../video/public/draft05/audio/mixed.wav)
- [Timing and voice metadata](../../video/public/draft05/audio/timing.json)
- [Separate captions](../../video/public/draft05/audio/captions.srt)
- [Numerical validation](../../video/public/draft05/audio/validation.json)
- [Performance reuse and recognition review](../../video/public/draft05/audio/audio-review.json)

Two same-copy alternate sets were generated for the Weather Protection and Slack
Peer lines. The selected Slack take improves recognition of the full explanation
of disputed amounts. The selected Weather Protection take includes explicit
Charan pronunciation direction. Small.en recovers the new setup and project
status wording and does not reproduce base.en's occasional extra tail phrases.
Recognition remains uncertain on proper names such as Charan and Manish, and on
“backend” versus “backing.” This is documented rather than treated as listening
approval. The full-mix tiny.en transcript has omissions and shifted segment times;
it supplies a supporting content check only and is not used for caption alignment.

The locked-script SHA-256 starts `9dc577f8fe366687`; the mix SHA-256 starts
`27d397e3b1addcce`. Full hashes are in the review and timing JSON files.

## Final encoded exports

The completed [1080p film](../../renders/ai-peer-draft-05.mp4) and
[540p preview](../../renders/ai-peer-draft-05-preview.mp4) both fully decode
without errors. Each contains **5,880 frames at 30 fps** and exactly
**196 seconds** of picture and sound. Both encoded stereo 48 kHz AAC-LC tracks
measure **−16.1 LUFS / −2.3 dBTP**, with a 6.5 LU loudness range.

Both MP4s use fast start and have no additional subtitle stream. Their separate
65-cue SRT files match the source byte for byte. The full film is 20,734,356 bytes;
the preview is 8,783,305 bytes. Full hashes, decoded frame counts, AAC measurements,
caption checks and MP4 atom order are recorded in the
[final technical QA](../../work/draft05/final-technical-qa.json).

These are technical export checks. Direct listening was not performed.
