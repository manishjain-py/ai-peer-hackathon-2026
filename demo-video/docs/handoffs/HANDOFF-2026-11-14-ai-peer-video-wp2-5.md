# Hand-off: ai-peer-video-wp2-4 to ai-peer-video-wp2-5, 2026-11-14 20:10 UTC

Written by ai-peer-video-wp2-4 at about 40% context (measured from its transcript). Dated, never
edited. For the session that takes Draft 3 on from Phase B. The first brief still binds you
(`HANDOFF-2026-11-14-ai-peer-video-wp2.md`: the stop rules, the privacy rule C8), and so does the
order for Draft 3 (`../FEEDBACK-DRAFT-2-2026-11-14.md`, "The order for Draft 3": Phases C and D
are yours). One worker at a time, on Opus 5.5 (V15). Never look at or send the private render.

## Read first, in order

1. `demo-video/docs/STATE.md` on `origin/main`: "Where we are" and the WP2 line (the live
   controller is named at the top).
2. `demo-video/docs/FEEDBACK-DRAFT-2-2026-11-14.md`: Manish's words (V19) and the order.
3. `demo-video/film/REPORT.md`, the last section, "Draft 3, Phase A and B".
4. This file. Then only what your step needs.

## Where things stand

- **Branch `video-wp2-4-draft3`** in `/Users/manishjain/repos/ai-peer-video-wp2` (pushed at
  `538edf2`, upstream unset, not merged). Carry on on it; Draft 3 is one PR at Phase D. Not in git
  on purpose, keep them: five music takes under `demo-video/film/audio/music/takes/` and
  `demo-video/shots/hook-1/hook-1-raw-r1.mp4`, `hook-2/hook-2-raw-r1.mp4`.
- **Phase A is done and with Manish since 19:44 UTC** (the controller sent the four boards and the
  motion clip, D recommended). His pick comes back through the controller, word for word.
  - Research: `demo-video/research/peer-entrance-2026-11-14.md` (facts marked [checked] were
    fetched and found on their pages).
  - Concepts: `demo-video/look/peer-entrance/boards/` (`d-little-peer.jpg`, `a-ram-phone.jpg`,
    `b-ram-laptop.jpg`, `c-night-owl.jpg`), made by `look/peer-entrance/make_boards.py` from
    `boards.json`. Stills and their request files: `look/peer-entrance/` and `requests/`.
  - Motion tests (Kling 4.0 image-to-video, 5 s, 720p, start/middle/end key frames, $0.785 each):
    `look/peer-entrance/motion/motion-d-laptop.mp4` (key frames `d-desk-empty.png`,
    `d-desk-half.png`, `d-desk-out.png`) and `motion-a-phone.mp4` (`night-phone-lit.png`,
    `a-phone-1-appears.png`, `a-phone-1b-formed.png`). Both read at the first try on a 16-frame sheet.
- **Phase B is done.** The public build draws the four product slots by code with made-up data
  (`demo-video/film/screens.json`, `src/scenes/screens.js`, `src/screens.css`; README row). The
  private build and `product.json` are untouched. A public build now has 0 slates.
- **Four meeting lines** m1 to m4 (the controller's yes): in `audio/script.json` at the end, part
  "proof", `"caption": "screen"` (the Zoom screen captions them; the film's captions skip them; the
  mix gives them a light call filter, `tools/mix.mjs`). Starts in `shots.json` "narration": 34.25,
  40.05, 47.65, 50.8.
- **A preview with sound** (lane wp24, not in git, nobody has watched it play):
  `demo-video/film/.build/lanes/wp24/renders/preview-screens.mp4`. 2:00.0, 3,600 frames,
  -14.1 LUFS, every line 15.0 to 25.6 dB above the music (m1 to m4: 17.0, 15.3, 18.5, 18.6).
  Speech-to-text of the whole mix: 18 of 19 script lines heard, m1 to m4 with no error; h3 ("Does
  he ever sleep?", an old line nobody changed) was heard as "Does he have a sleep?".
- **Money:** `demo-video/ledger/wp2-4.csv`, $3.01 (19 calls), through `tools/gen-wp2-4.sh` (cap 8).
  For Phase C (cap $25 by the order) make your own wrapper and ledger (`gen-wp2-5.sh`,
  `ledger/wp2-5.csv`, `--cap 25`) and give your ledger total in every message. ElevenLabs used
  about 620 characters of the plan for m1 to m4 (no per-call bill).

## What is left

1. **Phase C, after Manish's pick: the entrance and the return.**
   - Stills first, then a cheap draft, then the final, by WP3's routes (`demo-video/shots/REPORT.md`).
     The motion tests above are the starting point for D and A: same route, same key frames, longer.
   - **If D (the little Peer):** the laptop wakes and it climbs out (motion test D), it works at the
     laptop (`d-desk-crop.png` is its pose; the push-in at 30.0 still goes into the screen), and in
     the morning it waves and dives back into the laptop (`d-desk-morning-dive.png`). Its face is the
     mark, which the hook's cards (`src/overlays/notes.js`) and the tag (`src/overlays/tag.js`)
     already draw, and `film/assets/screens/peer-face.png` is the mark: no face swap needed. Decide
     whether the tag "Ram's AI Peer" floats above it (it has no chest to sit on).
   - **If A or B (Ram's look):** the tag and the double's look stay (V14); only the entrance and the
     return change. The face is Ram's portrait with the mark as a badge (`make_boards.py`,
     `face_image`): put it in `assets/screens/peer-face.png` and make the cards and the tag use it.
   - **If C (the owl):** its face is `look/peer-entrance/c-owl-face.png`; flag the Duolingo and Harry
     Potter risks again only if Manish did not answer them.
   - **The return:** `morning-nod` (104.5 to 108.0) becomes the return to the same place.
   - Re-time the reveal in `shots.json` (the note on `reveal-rise` says what moves with it) and the
     music before 32 s (wp2-3's hand-off, item 2; `audio/mix.json`).
2. **Phase D: Draft 3.** `node demo-video/film/render.mjs --name draft-03 --quality delivery` (the
   public film now holds no real recording, so it is the one render that can go to Manish in full);
   one sheet of 16 to 20 frames at 320 px; the numbers (2:00.0, loudness, every line 15 dB above the
   music); `uv run --quiet demo-video/film/tools/stt_check.py film <mix.wav>`; copy to
   `demo-video/film/renders/draft-03.mp4`; one PR from `video-wp2-4-draft3`, merge; your STATE spots
   (the WP2 line and a session-log row, on `main`); report to the controller with the paths.

## Weak points I know of (Phase B)

- The push-in lands on a bright mint screen with the mark at its centre (about 31.6 s), then the
  dark Zoom window comes up under the chapter card: a jump from light to dark. `src/scenes/pushin.js`
  draws the landing; the Peer's tile is at the lower right of the gallery, not the centre.
- The colleagues' Zoom tiles are WP3's hook stills (cinematic, not webcam framing) with a slow
  drift; their lips do not move when Amara speaks m3 (the active-speaker frame shows who talks).
- The screens' text is 15 to 17 px in a 1360 px window (the camera moves in on Slack and the
  change); it reads on a full-size frame, small on a phone.
- The brief's phone and the film's captions sit close at the bottom (about 99 s).
- Emoji and fonts render with this Mac's Chrome (Manrope everywhere, the Slack reaction is an emoji).

## Traps I met

- **Neighbouring lines are context for ElevenLabs** (same speaker, same part, by position in the
  script): new lines go at the end of `audio/script.json`, or an old line's request changes and it
  is made again. A changed `spoken` of m1 re-made m2 too.
- **"an AI" is heard as "and AI"** by speech-to-text (twice); "I'm an AI" is heard right.
- **One text at a time** (the build's check): a label or chapter card may not share the screen with
  any spoken line, the meeting lines included. The Zoom scene has no labels for that reason.
- **A shell edit that rewrites a JSON file** (`json.dump`) reformats it all: insert text instead.
- **zsh:** `echo =====` fails (a word starting with `=`), and a glob with no match fails the line.
- Pictures fill the context: one sheet of 16 to 20 frames at 320 px settles a cut.
