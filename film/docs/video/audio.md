# AI Peer concept demo — audio

Completed 18 September 2026. All spoken material describes fictional concept fixtures. References to project sources describe proposed grounding, not connected production systems.

## Files and integration

Use `video/public/audio/mixed.wav` as the only audio track at video time zero. It already includes the voice, ducked music and effects. The current Remotion Studio preview uses `Html5Audio` with `staticFile('audio/mixed.wav')`. The visual export is rendered muted, then `scripts/finalize.sh` adds this mix with FFmpeg exactly once.

Do not also add the stems under the mix: that would double their volume.

| File in `video/public/audio/` | Purpose |
|---|---|
| `mixed.wav` | Complete 120-second master; ready for the video. |
| `narration.wav` | Narrator and AI Peer, positioned on the full timeline. |
| `music.wav` | Original instrumental, with speech ducking already applied. |
| `effects.wav` | Sparse transition, click, connection and success sounds. |
| `music-unducked.wav` | Optional music-only source for a different mix. |
| `timing.json` | Full script, measured clip durations, speaker identities, word boundaries, sound cues and numerical statistics. |
| `captions.srt` | 37 captions, preserving punctuation and labeling AI Peer speech. |
| `validation.json` | Numerical checks and loudness measurement results. |

All WAV files are stereo, 48 kHz, 24-bit PCM, and exactly 120 seconds. The main stems sum to the master, within PCM rounding. Final narration ends at approximately 119.27 seconds; the music resolves and fades to silence at 120 seconds.

## Voices and disclosure

Both voices are standard synthetic English voices generated using `edge-tts`; there is no voice cloning and no paid API or private credential was used.

- Narrator: `en-US-AriaNeural`, +5% speaking rate.
- AI Peer: `en-US-GuyNeural`, +2% for the longer reply, +12% for the short meeting reply.
- The AI Peer identifies itself at the start of both spoken appearances. The on-screen AI identity should remain visible during these scenes.

The supplied narration wording is preserved in full. Where needed, gentle pitch-preserving `atempo` processing fits the spoken clips into the fixed scene windows. The largest additional speed change is 1.161× on the seven-second offline scene. Word timestamps derive from TTS word boundaries adjusted for that speed; clip start/end times come from decoded audio lengths. These are not forced-aligned human-reviewed timings.

| Scene | Voice starts | Audio ends | Additional speed adjustment |
|---|---:|---:|---:|
| Problem | 1.00 | 6.54 | 1.000× |
| Product reveal | 10.00 | 16.46 | 1.000× |
| Creation and graph | 18.00 | 29.18 | 1.000× |
| Blocker query | 32.00 | 40.93 | 1.000× |
| Freshness | 43.00 | 51.35 | 1.000× |
| Offline | 53.00 | 59.68 | 1.161× |
| AI reply | 61.00 | 75.38 | 1.053× |
| Human result | 77.00 | 85.40 | 1.000× |
| Meeting setup | 88.00 | 94.68 | 1.085× |
| AI meeting reply | 95.20 | 103.68 | 1.101× |
| Handoff | 105.00 | 113.68 | 1.117× |
| Close | 115.00 | 119.27 | 1.000× |

## Original score and effects

The music is an original procedural composition at 116 BPM in a D-major/B-minor palette. It uses a Dmaj9 → Bm7 → Gmaj9 → Asus4/A progression, synthesized soft pads and bass, sparse upper-register plucks, a light kick and brushed-noise percussion. It has a two-second introduction fade, a gentle build, reduced energy in the offline section, and a final tonic resolution. It contains no samples or extracted third-party recordings.

The effects are also synthesized from oscillators and filtered noise. Transitions use quiet filtered swells; clicks are brief and soft; successful connections use restrained notes. The music lowers before each utterance and returns gradually afterward. The mix prioritizes speech rather than constant effects.

## Verification

- Exact duration: 120.000 seconds / 5,760,000 frames per stem.
- Integrated loudness: **−16.5 LUFS**.
- True peak: approximately **−1.5 dBFS**, measured by FFmpeg `ebur128`.
- Sample peak: **−1.556 dBFS**.
- Loudness range: **6.4 LU**.
- No clipped or non-finite samples.
- Start and end samples are zero; fades provide smooth boundaries.
- Every voice clip fits its assigned scene window; no speech clips overlap.
- All 37 SRT cues fit the video and do not overlap.
- Local `faster-whisper tiny.en` ASR recovered all script content from the master. Minor recognition differences included “sink” for “sync” and the possessive name rendered as “Manisha’s”; these are not treated as proof of incorrect synthesis. Listen specifically to the name and meeting phrase during human review.

Validation here was numerical and ASR-based. **Direct listening was not performed.** ASR segment timestamps are approximate and should not replace `timing.json` or `captions.srt`.

## Rebuilding

Runtime: Python 3.12, FFmpeg, and the packages pinned in `video/scripts/audio-requirements.txt`. The working environment used for this build was a local Python virtual environment in the original working folder (not part of this repository).

From the project root, with those dependencies available:

```sh
python video/scripts/audio_build.py
python video/scripts/audio_validate.py
```

For optional local speech recognition, install `faster-whisper` and use `python video/scripts/audio_validate.py --asr`. The small model downloads into `work/audio-models/`; ASR and FFmpeg details are saved in `work/audio-qa/`.

Intermediate TTS clips and metadata are cached in `work/audio-clips/`. To change narration, edit `LINES` in `audio_build.py`; the cache compares the text, voice and rate and regenerates changed requests. Exact clips are retained because cloud TTS service output can change over time. Music and effects use fixed random seeds for repeatable synthesis.
