# Audio evidence and production implications

## What was actually analyzed

Local WAV captures from the browser: Slack 86.64 seconds; Notion 56.64 seconds. Both are 24 kHz mono, 16-bit PCM. Analysis used faster-whisper `base.en`, CPU/int8, English, beam size 5, Silero VAD, and word timestamps; NumPy/SciPy for a 50 ms RMS envelope; librosa for exploratory beat estimation. I did not directly listen through an audio-perception interface. Accordingly, descriptions below distinguish ASR/measurements from production suggestions.

All times are relative to the captured audio. The captures are slightly shorter than the nominal 87/57-second YouTube runtimes; allow roughly half a second of tolerance when aligning to video observations. Browser recording gain may affect absolute levels. No claim about original master LUFS, stereo width, instruments, musical genre, or exact sound-effect identities is supported by this analysis.

## Narration findings

**Slack has narration:** ASR recovered 23 coherent segments containing 190 words, with mean word confidence 0.959. The last narrated phrase ends around 83.85 seconds. That implies approximately **136 words per minute across the narrated timeline including pauses**. The detected text coheres with the product shown, supporting a high-confidence speech finding. Speech-segment durations total 60.7 seconds; these include within-phrase pauses, so this is not a precise phonation measure.

**Notion appears to have no narration:** VAD retained 0 seconds and ASR returned zero segments/words. This is strong automated support for an instrumental/non-narrated edit; VAD absence alone cannot conclusively prove there are no vocals anywhere. The waveform is active, so this is not an empty/silent capture.

## Slack narration beat sheet (paraphrased)

| Capture time | Meaning of narrated passage | Editing implication |
|---|---|---|
| 0.00–8.92 | Establishes flexible communication across Slack's existing formats | Reuse familiar interfaces to orient the viewer |
| 9.76–13.40 | Introduces collecting information together | Pivot from familiar context to new capability |
| 15.14–16.32 | Names Canvas | A compact product reveal with surrounding breathing room |
| 16.96–22.92 | Defines gathering, organizing, and sharing inside the existing workspace | Make the core promise concrete before listing features |
| 23.74–37.74 | Channel canvas, tasks, approvals, resources, and people | Short feature clauses support a sequence of focused visual examples |
| 40.02–43.62 | Discussing details through threads | Demonstrate a single interaction, then hold the result |
| 45.93–56.97 | Rich media, context, and links between canvases | Increase visual richness while keeping the narrative on one theme |
| 57.93–66.83 | Working with teammates and outside partners | Widen from individual utility to team value |
| 68.13–75.17 | Finding content and accelerating work | Translate feature coverage into a useful outcome |
| 76.49–80.75 | Adoption invitation with a small closing joke | Keep space for the final visual payoff |
| 81.95–83.85 | Brand signoff | Finish with a deliberate logo/brand hold |

This is a paraphrased analytical map, not a publishable verbatim transcript. Full local ASR data is in `slack-audio-analysis.json` for timestamp alignment only.

## Measurable soundtrack differences

| Measurement on captured mix | Notion | Slack |
|---|---:|---:|
| Whole-track RMS | −16.21 dBFS | −18.72 dBFS |
| Median 50 ms RMS | −17.03 dBFS | −21.28 dBFS |
| Middle 50% envelope range | 5.58 dB | 11.69 dB |
| Windows below −40 dBFS | 1.77% | 3.98% |

The Notion capture maintains a denser, more consistent energy envelope; the Slack capture has larger short-term level changes, consistent with a speech-led mix. These measurements cannot isolate music from speech or sound effects, and they do not establish mix ducking. Absolute values are analysis evidence, **not export targets**.

Notion's average 50 ms envelope is fairly steady through 5–30 seconds, softer around 30–40 seconds, then stronger again for much of 40–55 seconds. Useful candidate moments for visual/audio alignment inspection include energy peaks near 6.9, 9.2, 18.35, 24.35, 38.9, 44.9, 49.45, and 51.75 seconds. A peak alone does not identify a whoosh, click, drum, or cut.

Automatic beat tracking gave nominal estimates of about 144 BPM for Notion and 99 BPM for Slack, but local estimates vary widely (Notion ~103–144, Slack ~96–144 across the central 80% range). **These are not reliable enough to state the reference songs' tempos.** Speech, effects, syncopation, and half/double-time ambiguity can bias beat tracking. Prefer hand-confirmed music markers when editing the new film.

## Practical implications for the planned two-minute demo

These are recommendations derived from the findings, not claims about unobserved studio techniques:

1. Use Slack's narration-led structure for clarity and reserve Notion-like music-led sequences for the opening, product reveal, and visual payoffs. Combining both allows explanation without giving up pace.
2. At Slack's measured overall speaking pace, two minutes could carry about 270 words. Aim nearer **210–240 words** initially to leave room for an unfamiliar hackathon idea, interactions, music-only moments, and an ending hold. Final timing should come from recorded narration.
3. Build the animatic around the spoken clauses first. Keep the meaningful outcome visible after each interaction; use beat-synced motion in the gaps and at section changes.
4. Keep narration, music, and sound effects on separate tracks. Reduce music while explaining, restore it during unvoiced reveals, and add selective interaction accents. This is a proposed production method; the reference capture does not prove how its stems were mixed.
5. Do not claim the exact reference music or its instrumentation has been identified. Choose an appropriately licensed new track with an editable ending and clear rhythmic accents, then mark beats in the actual track.

## Local analysis artifacts

- `slack-audio-analysis.json`: ASR segments/words, confidence, RMS envelope, metrics.
- `notion-audio-analysis.json`: zero-segment ASR result, RMS envelope, metrics.
- `slack-beats.json`, `notion-beats.json`: exploratory automatic beat data; low confidence.
- `analyze_audio.py`, `analyze_beats.py`: reproducible analysis scripts.
