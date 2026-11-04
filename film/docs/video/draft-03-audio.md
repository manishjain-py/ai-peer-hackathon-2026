# Draft 03 audio

Draft 03 replaces the Edge TTS cast with **locally generated Qwen3-TTS 1.7B
performances**. It also replaces the 104 BPM sparse score with an original,
upbeat **124 BPM** arrangement. Previous drafts and source masters are preserved.

## Cast and direction

| Role | Voice source | Performance direction |
|---|---|---|
| Narrator | Qwen3 VoiceDesign; fictional native American English woman | Warm, bright, brisk product-film delivery, connected phrases. |
| Sarah | Qwen3 VoiceDesign; separately authored fictional American English woman | Lower middle register, casual and direct video-call replies. |
| Alex | Qwen3 CustomVoice, stock Ryan | Curious colleague asking practical questions, not an announcer. |
| Manish's AI Peer | Qwen3 CustomVoice, stock Aiden | Warm, concise colleague; clearly identified as AI. |

No voice recordings, real-person imitations, or voice clones are used. The
model's stock speakers and text-designed voices are synthetic. The speech
performance is controlled through written directions, punctuation, and alternate
takes. A fixed seed and exact request are saved for every selected clip.

The official [Qwen model card](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-CustomVoice)
documents language/style control; [MLX Audio's generation guide](https://github.com/Blaizzy/mlx-audio/blob/main/docs/guides/voice-cloning.md)
documents CustomVoice and reference-free VoiceDesign. Models and their MLX
conversions are published under Apache 2.0. This is a different synthesis engine
from Draft 02, not a speed adjustment to its original voices.

## Music and transitions

The score is original oscillator/noise synthesis, with no third-party samples or
recordings. It has a four-on-floor kick, clap backbeat, swung hats and shaker,
syncopated octave bass, bright clipped chord voicings, and a short repeating
keyboard hook with stereo delay. Each act resets the beat grid so the interface
change lands on a downbeat. Dialogue sections use a lighter arrangement; the
reveal and closing sections add the hook and fuller percussion.

The opening uses a smaller impatient pulse and a short gap before the reveal.
Authored whooshes and musical accents land on the supplied transition times.
Message cues are original, not sampled Slack or Zoom sounds. The music ducks
around each speech clip with a 100ms attack and 240ms recovery.

## Outputs

Use [mixed.wav](../../video/public/draft03/audio/mixed.wav) once at picture time
zero. Do not add the stems underneath it.

| File | Purpose |
|---|---|
| [timing.json](../../video/public/draft03/audio/timing.json) | Actual speech starts/ends, exact script hash, word timings, voice requests and scene/effect metadata. |
| [captions.srt](../../video/public/draft03/audio/captions.srt) | Original script copy mapped to recognition timing; non-overlapping captions. |
| [narration.wav](../../video/public/draft03/audio/narration.wav) | All four roles, aligned to the picture timeline. |
| [music.wav](../../video/public/draft03/audio/music.wav) | Score after speech ducking and master gain. |
| [music-unducked.wav](../../video/public/draft03/audio/music-unducked.wav) | Score before speech ducking, for later remixing. |
| [effects.wav](../../video/public/draft03/audio/effects.wav) | Original transition and message accents. |
| [validation.json](../../video/public/draft03/audio/validation.json) | Current numeric validation and explicit listening limitation. |
| [audio-review.json](../../video/public/draft03/audio/audio-review.json) | Script/mix hashes, measured meeting gaps, secondary ASR and remaining uncertainties. |

Every WAV has the same duration, two channels, and 48 kHz / 24-bit PCM format.
The final soundtrack is **166.5 seconds** (2:46.5), with 26 spoken lines and
54 caption cues. The WAV mix measures **−16.0 LUFS / −1.7 dBTP**, with 6.6 LU
loudness range. Both the final 1080p MP4 and 540p preview were also checked:
their **AAC-LC stereo tracks measure −16.0 LUFS / −1.6 dBTP**, at 48 kHz.
Each export is exactly 166.5 seconds; picture and audio fully decode without
errors. Both contain 4,995 video frames at 30 fps, use MP4 fast start, and have
no additional subtitle stream. Their separate SRT files match the 54-cue source
byte for byte. The export measurements and SHA-256 hashes are recorded in
`work/draft03/final-technical-qa.json`.

## Verification and limits

The builder checks finite samples, clipping, equal stem lengths, additive stem
reconstruction, no overlapping speech, scene-window fit, and exact caption copy.
It trims only quiet clip-edge padding with protective handles, and refuses
speech that would need more than 1.10x pitch-preserving fitting. Twenty-five of
the selected takes fit at **1.00x**. The Slack Peer's introduction uses a small
**1.032x** adjustment. Zoom turns have **350ms gaps** between clip endpoints;
none of the Zoom voices are sped up. The AI introduction is explicitly scripted
as “I am Manish's AI Peer.”

Whisper base.en supplies word timing. Exact caption words are kept from the
script; unmatched recognition tokens use neighboring timing anchors. This is
ASR-assisted alignment, not model-provided word timing. Source takes, normalized
clips and per-clip recognition are retained in `work/draft03/audio-clips/`.
Full-mix recognition and logs are in `work/draft03/audio-qa/`.

A second pass with Whisper small.en was used on uncertain lines. It did not
reproduce base.en's spurious repeated tail words. Recognition still varies on
proper names, contractions, and homophones. Recognition and waveform checks do
not establish whether a performance sounds human or whether the music is good.
**Direct listening was not performed:** the available tool explicitly reported
that this session does not support audio input. Human listening to the final
film remains the creative check for conversational naturalness and score balance.

## Rebuild

The tested runtime is `work/draft03/audio-venv/bin/python` (Python 3.12 on Apple
Silicon). Dependencies are pinned in
[audio-requirements-03.txt](../../video/scripts/audio-requirements-03.txt).

```sh
work/draft03/audio-venv/bin/python video/scripts/audio_build_03.py --asr
```

The builder reads [script.json](../../video/public/draft03/script.json), reuses
unchanged request-addressed clips, generates altered speech locally, builds the
score/effects, writes captions and validates the result. Public model weights
are cached in the user's Hugging Face cache. No paid API key was available or
needed. For synthesis-only editorial work, use `--synth-only`; `--only` accepts
line IDs with that flag.
