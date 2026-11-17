# Moss v6 soundtrack

V41 keeps the established composition and all unchanged narration takes. Changes are:

- Colleague2: a new fluent Chris / ElevenLabs Multilingual v2 take, “Ram is out of
  office, but the update I needed is already here.” The same authorized fal.ai route
  generated the 2.73-second take for $0.0063. Its matching generic fictional-person
  motion cost $0.36. The saved guide is placed at 0.9 seconds inside that clip; the film
  uses in-point0.4, so the voice still starts at film4.0.
- Original Matilda M1 ends after “Hi everyone. I'm Ram's AI Peer.” The 2.45-second
  trim preserves the first phrase and its matching animation. M1 starts60.7; M2/M3/M4b
  move three seconds earlier to63.9/71.5/74.65. The morning-brief promise remains intact.
- p05 (“Not as him. As me.”) is removed. The enlarged rules board gets a musical hold.
- Slack narration starts80.2, and the original ocean narration starts88.4. The final
  sentence starts114.4 and finishes115.74, just before the CTA and final musical arrival.

`prepare_voice.py` operates only on saved source files. Provider requests/results and
the generation ledger preserve provenance and the exact settings. All22 final voice
cues have no overlaps; local whole-mix transcription recovers the intended speech and
confirms the removed dialogue is absent. The original “Does he ever sleep?” is still
the original take; local STT's “have a sleep” is a recognition error, not a rewritten line.

The new colleague's 158-frame face track and77 mouth closeups were inspected. Movement
aligns best at zero lag; syllable correlation0.49 exceeds the reversed-audio control0.20.
Lips close at the final m of “Ram” and b of “but.” The provider's own audio matches the
clean guide at exactly0.900 seconds (envelope correlation1.00). That provider track is
not used in the film: the clean Chris WAV is mixed locally.

## Closing arrangement

The same Lyria b2 source is cut on its measured120BPM grid. A thin bar supports the
new Slack entrance, and a continuous phrase carries typing into the physical ocean.
The closing five source bars53–57 now play continuously at110–120, resolving at116.
The final line ends before that downbeat. The original D-major chime lands at116 at
a stronger level, and the ending music recovers from speech with180ms release; the
earlier bed retains its established900ms release. A3.55-second tail fades smoothly.

Two arrangements were compared. The first continuous arrangement still sounded too
ambient to the auxiliary listening model; the selected revision adds the clearer
chime/downbeat and quicker recovery. The final provider review reports a positive
arrival, smooth decay and no masked speech or edit fault. These model opinions are
supporting evidence, not a human listening claim: earlier reviews misestimated
excerpt duration, and the final review misidentified the narrator's gender. Objective
cue/sample/peak checks and visual synchronization are recorded separately.

`bed-verification.json` proves the bed is unchanged from0–57.9 and99.9–109.9.
`pcm-preservation.json` proves the actual mixed V5 samples are unchanged at0–3.9 and
7.2–55.7. The final WAV measures119.6seconds, -14.0LUFS and -1.6dBTP. Encoded export
measurements are recorded in the delivery evidence. The four audio-review calls cost
$0.12 in the conservative ledger; total V6 generation/review cost is$0.4863 before any
additional visual calls, project$52.097127/$100. Only generic soundtrack/fictional inputs
were submitted, never private recordings or product data.

## Offline rebuild

```sh
uv run --quiet demo-video/moss-clarity/audio/prepare_voice.py
node demo-video/moss-clarity/audio/build_mix.mjs
```

The selected WAV, edit list, source takes, word timings, scripts, provider receipts,
measurement reports and transcription are committed. Intermediate stems are ignored.
