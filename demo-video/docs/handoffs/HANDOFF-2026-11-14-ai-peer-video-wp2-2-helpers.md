# Helpers' reports for ai-peer-video-wp2-2, part 1: music and sound effects

Written by ai-peer-video-wp2 on 2026-11-14 12:50 UTC, after its hand-off. Dated, never edited.
Part 2 (the Earth close) follows as `HANDOFF-2026-11-14-ai-peer-video-wp2-2-helpers-earth.md`
when that helper ends. The helper's own words are in
`/Users/manishjain/repos/ai-peer-video-wp2/demo-video/film/audio/SOURCES.md` and
`.../audio/music/measurements/`; this is its report, with what I checked myself marked.

## What is there (all uncommitted in the worktree: commit by path)

Under `/Users/manishjain/repos/ai-peer-video-wp2/demo-video/`:

| Path | What |
|---|---|
| `film/audio/music/bed.wav` | The music bed, 121.0 s, 48 kHz stereo (35 MB). Film time 0 is file time 0. |
| `film/audio/music/bed-alt-1.wav` | The plainer cut of the same take: one join instead of five, the take's own ending. |
| `film/audio/music/bed.edl.json`, `bed-alt-1.edl.json` | How each is cut. |
| `film/audio/music/tools/`, `measurements/`, `requests/`, `listen/` | The tools, every table of numbers, the request files. |
| `film/audio/music/takes/` | 59 MB of takes. Only `lyria35-b2` is used: keep that one, the other four may be deleted before the commit. |
| `film/audio/sfx/` | Nine effects (WAV), `make_sfx.py`, `sfx.json`. All made by code. |
| `film/audio/mix.json` | Where the bed and the effects sit. **Every render already mixes it.** |
| `film/audio/SOURCES.md` | The model, the terms relied on, the open points. |
| `ledger/wp2.csv` | Eight calls, **$0.9352** in total (the helper thinks about $0.73 was really billed). |

ElevenLabs was not used for the effects. The Gemini and OpenAI keys were not used.

## The numbers (the helper's render `film/.build/lanes/sound/renders/sound-0-120.mp4`)

| Check | Value | Checked by me |
|---|---|---|
| Loudness of the film file | -14.1 LUFS, true peak -1.7 dBFS | Yes, read from the render's report |
| Voice above the music, per line | 15.0 dB at the lowest (p11), 22.8 at the highest | Yes, same report |
| Speech check on the full mix | 15 of 15 lines | Yes, my own run of `stt_check.py film` |
| Tempo of the bed | 120.0023 BPM; beats within 3.3 ms of every cut time | No (the helper's beat detection, tested on click tracks) |
| No voice in the bed | A voice detector finds nothing; the speech model invents one stock sentence on music, also on a sine wave | No |
| Files, lengths, ledger total | as in the table above | Yes |

The helper saw one extra word ("never.") after "I cover." at 25.2 s in a full-length
transcript. In my own transcript of 21.5 to 29.0 s, the mix and the voice stem both read "So
when work needs him and he can't be there, I cover. Not as him, as me." So it is the speech
model's slip on a long file, not a sound in the mix. An ear should still pass 25 s once.

Two settings in `mix.json` differ from the mixer's defaults on purpose: `master.ceiling` -2.5
(the limiter holds sample peaks; the true peak comes out about 1 dB higher) and `duck_release`
900 ms (at 420 the music came back inside the pauses of a line). Keep both.

## The terms (Manish's call: this is licence wording)

The bed is one take of Google's Lyria 3.5 through fal.ai (`google/lyria-3.5`, $0.10 a take).
Read on 2026-11-14:

- fal.ai Terms of Service (updated 8 September 2026), https://fal.ai/legal/terms-of-service,
  section 4: "Company grants you a limited, non-exclusive, non-transferable, revocable right to
  access and use the Sites and the Services in accordance with these Terms and applicable
  Documentation for your own personal or internal business use."
- fal.ai FAQ, https://fal.ai/docs/documentation/model-apis/faq.md: "Each model has its own
  license. Most models on fal are available for commercial use and are marked with a
  `Commercial use` badge on the model page." The model page
  https://fal.ai/models/google/lyria-3.5 carries that badge.
- Gemini API Additional Terms (effective 23 March 2026), https://ai.google.dev/gemini-api/terms:
  "Some of our Services allow you to generate original content. Google won't claim ownership
  over that content." (Read through a fetch tool: check it by eye.)

The helper's reading, and mine: good enough for a film shown inside the company. Four points
the published words do not settle:

1. No sentence says the customer owns the music; fal.ai "does not represent, warrant, or
   covenant that any Output Content will be original".
2. The right is for "your own" internal business use: the fal.ai account is Manish's, the
   film is shown inside his employer.
3. fal.ai does not say which of Google's terms reach its customers.
4. A public release would need a fresh look.

A bed made fully by code would have none of these questions and would sound plainer. It was
not made.

## What only an ear can judge

- The whole bed: nobody has heard it. A listening model called it "a modern premium technology
  advert", but its times and tempo were wrong, so that is an opinion only.
- The joins at 54, 72, 74 and 90 s, and the end accent at 116 s (the take's opening bar laid
  over the ring-out: the helper's riskiest edit). `bed-alt-1.wav` avoids the end accent and
  the thin bars at 54 and 72; to use it, change only `music.file` in `mix.json` (its weakest
  line stands 14.6 dB above the music, speech check 15 of 15).
- The hook's pulse is a sparse plucked motif, not drums; the first kick is at 32.0.
- The morning (90 to 106) reuses the reveal's music (16 to 32).
- The effects are synthetic: the phone buzz and the laptop click may sound artificial.
- The source take is a 192 kbit/s MP3, the only format the endpoint gives.

## For the successor

- The effect times were set before WP3's clips existed: the laptop click (27.6) and the tap
  (102.6) are guesses. Find the real frame in `reveal-desk` and `morning-brief` and move them:
  `at = event_s - sync_s` (see `sfx_note` in `mix.json`).
- If a cut moves, the bed's joins sit on bar lines at 54, 72, 74, 90 and 106 s.
- Put the ledger total in your report; the controller sums it into `STATE.md`.
- Tell the controller that the terms question is open for Manish, with the four points above.
