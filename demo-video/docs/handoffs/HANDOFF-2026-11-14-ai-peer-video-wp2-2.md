# Hand-off: ai-peer-video-wp2 to ai-peer-video-wp2-2, 2026-11-14 12:20 UTC

For Fable 5.2 (`claude-fable-5-2`), max effort. Written by ai-peer-video-wp2 at 44.8% context
(447,841 tokens, measured from its transcript). Dated, never edited. You finish work package 2:
the film in code and **Draft 1**. The first brief still binds you, with its money cap, stop
rules and privacy rule: `HANDOFF-2026-11-14-ai-peer-video-wp2.md`.

## Read first, in order

1. `demo-video/docs/STATE.md` on `origin/main` (the live controller is named there).
2. `demo-video/docs/handoffs/HANDOFF-2026-11-14-ai-peer-video-wp2.md` (the contract, 7 items).
3. This file.
4. `demo-video/docs/SHOTS.md` (how WP3's clips reach the film) and `demo-video/film/README.md`.
5. `demo-video/docs/handoffs/HANDOFF-2026-11-14-ai-peer-video-wp2-2-helpers.md` if it exists:
   the reports of the two helpers named below, written when they end.

## Working copy

- Worktree `/Users/manishjain/repos/ai-peer-video-wp2`, branch `video-wp2-film-build`, pushed at
  `a51c934`. No PR yet: open it ("video WP2: the film in code and Draft 1") and merge it
  yourself when Draft 1 plays.
- I do not touch that worktree again. Two helpers of my session still write in it, each only in
  its own files (below). Do not start a second Earth or music helper.
- `STATE.md` lines are written from a throwaway worktree of `origin/main`, never in the shared
  checkout.

## Where the contract stands

| # | Item | State |
|---|---|---|
| 1 | The film project, one command | **Done.** `node demo-video/film/render.mjs` (whole film), `--part reveal`, `--from A --to B`, `--private`. Proven from a fresh clone (47 s). |
| 2 | The voice (milestone 1) | **Done**, reported 11:58 UTC. 15 lines, 3 samples, speech-to-text 18 of 18. Manish's voice pick is pending with the controller; if it is not voice 1, change `voices.peer` in `audio/script.json` and run `tools/voice.py lines`, then `tools/stt_check.py lines`. |
| 3a | The Earth close | **Helper running.** Writes `src/scenes/earth.js`, `assets/earth/`. |
| 3b | The night clock | **Done** (`src/overlays/chips.js`): runs 2 AM, 4 AM, 6 AM, one minute a second. |
| 3c | Title chips for the proofs | **Done** (the card at each proof's start, same file). |
| 3d | Captions | **Done** (`src/overlays/captions.js`), word by word, measured line breaks. |
| 3e | The end card | **Done** (`src/scenes/endcard.js`). It goes see-through over the Earth by itself once `earth` is ready: look at 115.5 to 120 then. |
| 3f | The "AI Peer" tag on the double | **Not started.** See "What is left". |
| 4 | Product screens | **Done for Draft 1** (`src/scenes/product.js`, cut list `product.json`). Seen in frames; the morning brief slot (94.5 to 100.5) was built but its frames were not looked at yet. |
| 5 | Music and sound | **Helper running.** Writes `audio/music/`, `audio/sfx/`, `audio/mix.json`, `audio/SOURCES.md`, `demo-video/ledger/wp2.csv`. The mixer is done (`tools/mix.mjs`). |
| 6 | Draft 1, two renders | **Not started.** |
| 7 | `REPORT.md` | **Not started.** Notes for it are at the end of this file. |

Money: nothing spent by me. The music helper may spend up to $5 of the $10 (its ledger is
`demo-video/ledger/wp2.csv`). ElevenLabs: 691 characters of the existing plan.

## How the film is built (read `demo-video/film/README.md` for the table of files)

- One page whose picture is a pure function of film time; HyperFrames 0.9.45 (pinned, Apache-2.0)
  seeks each frame (`hf-seek`) and captures it. No GSAP. Its trial took 6 minutes and passed.
- `shots.json`: 16 slots, the nine AI ids of `SHOTS.md`, cuts on a half-second grid (120 BPM).
  `scenes_ready` and `overlays_ready` list what is switched on: now `endcard` and `chips`.
  `--with earth` switches a scene on for one run; `--lane NAME` gives a run its own folders
  under `.build/lanes/NAME/` so renders can run side by side.
- `tools/pull_shots.mjs` copies WP3's current clips from its manifest into `assets/shots/`,
  sets each slot's `clip` in `shots.json` and writes the rest to `shots.pulled.json`. All nine
  drafts are in (pulled 12:13 UTC). **Run it again before every Draft 1 render**: WP3 adds tag
  tracks, the laptop's screen corners and finals under the same ids.
- A lip-synced hook line starts at slot start + `line_at_s` - `use_from_s` (the build does it).
- One text at a time: labels and title cards share the caption lane, and the build refuses a
  label that is up while a line is spoken. Keep it (the controller's lesson 3).
- Public build: product slots are slates. Private build (`--private`): everything it writes
  stays under `~/.ai-peer/demo-video-private/` (build, cache, tmp, work, renders); the words
  spoken in recordings are in `~/.ai-peer/demo-video-private/product-private.json`, never in git.

## What is left, in order

1. **Read the helpers' reports** (file 5 above, or wait for it; ask the controller if it is
   late). Their reports are claims: look at the Earth's frames yourself, read the music's
   measurements and its `SOURCES.md` terms yourself.
   - Earth: `node demo-video/film/render.mjs --lane earth2 --with earth --part close --no-sound --name earth`,
     pull frames, look. If good, add `"earth"` to `scenes_ready`.
   - Music: with `audio/mix.json` present every render mixes it. Read the render's report:
     about -14 LUFS, true peak at or under -1.5 dBFS, `voice_over_music_db` 12 dB or more per
     line. Then `HF_HUB_OFFLINE=1 uv run --quiet demo-video/film/tools/stt_check.py film <sound_work>/mix.wav`
     must find 15 of 15.
2. **The push-in** (`reveal-pushin`, 30.0 to 32.0): `src/scenes/pushin.js`, then add `"pushin"`
   to `scenes_ready`. From the last frame of `reveal-desk` (its window ends on the clip's last
   frame): zoom into the laptop screen and land in the first product window. WP3 will give
   `last_still` and `screen_quad` (four corners, fractions of the frame) in `shots.pulled.json`;
   until then take the frame with ffmpeg from the clip in the build step and aim at a hand-set
   quad.
3. **The tag** (contract 3f): `src/overlays/tag.js`, then add `"tag"` to `overlays_ready`. For
   slots with `"tag": true` (`reveal-rise`, `reveal-desk`, `morning-nod`) read the slot's
   `tag_track` (one entry per clip frame: `f, x, y, w, on`, fractions of the frame): clip time
   is `use_from_s + (t - slot.start)`, frame is that times `clip_fps`. Draw a small pill (the
   mark plus "AI Peer", mint glow) on the chest light, smoothed over a few frames. The look of
   the double is now "threads of light" with a mint core in the chest. No track yet means no
   tag: say so in the report.
4. **Look at the morning** in a private render (`--private --part morning`): the brief page
   from 94.5, the tap on "Accept" at about 100.0.
5. **The private render's network guard** (not built; your call): the renderer gets a scrubbed
   environment already (no keys, telemetry off). A stronger guard is `sandbox-exec` with
   outbound network denied except localhost around the `npx hyperframes` call for `--private`;
   prove it with a control (a curl inside the sandbox must fail). Real company recordings
   arrive Tuesday, so this is worth an hour before then. Never use `hyperframes snapshot
   --describe`: it sends frames to an outside model.
6. **Draft 1**: `node demo-video/film/tools/pull_shots.mjs`, then
   - `node demo-video/film/render.mjs --name draft-01-slates --quality delivery` gives
     `demo-video/film/renders/draft-01-slates.mp4`; commit it with `git add -f` (the folder is
     ignored so a private render can never slip in);
   - `node demo-video/film/render.mjs --private --name draft-01 --quality delivery` gives
     `~/.ai-peer/demo-video-private/renders/draft-01.mp4`.
   Then a frame at every cut (the slot starts, and the picture changes inside product slots) as
   one sheet, looked at; speech-to-text on both mixes (it runs on this Mac, so the private mix
   is allowed).
7. `demo-video/film/REPORT.md`, the PR, merge (`git fetch`, merge `origin/main` in first), your
   line under "Packages" in `STATE.md` and a session-log row, then the message to the
   controller with the two render paths and the report. Then wait for the controller.

## Traps I met

- **A render that exits 0 can be a film of nothing.** The renderer does not fail on a dead
  page; `render.mjs` runs the page check first and stops on any error. Proven by a control
  (one script removed: exit 1, two errors). Do not pass `--no-check` for a real render.
- **Look at frames, at full size where text matters.** Three product views cut through text at
  the left edge and one showed Slack's thread still loading; only the frames showed it.
- **`git add demo-video/film` sweeps in the helpers' half-done files** (it did, in `8aa02ab`:
  harmless, but add by path while a helper works).
- **Check a commit for keys before it runs, not after.** My first commit chained past the check.
- three.js r171 needs both `three.module.min.js` and `three.core.min.js` (both are vendored).
- faster-whisper's own audio reader breaks with the new PyAV: `stt_check.py` decodes with
  ffmpeg instead. The small model is cached (`HF_HUB_OFFLINE=1`).
- Images cost context: one sheet of 16 frames is enough for a layout check.

## Notes for REPORT.md (things that are weak or were my calls)

- The stand-in meeting recording has **no useful picture** (the other side's name on black).
  Draft 1 shows the Peer as a call tile drawn by code, moved by the real sound, marked "Real
  sound from a live test meeting", then the product's own Meetings page (a real screenshot from
  `docs/build/evidence/`). **Manish's real recording must be made from a participant's screen,
  so the Peer's tile and its label are in the picture.** Told to the controller on hand-off.
- "The other direction" and the morning brief had no recording, so Draft 1 uses a real
  screenshot of the product's brief page (its "Company news and changes to your work" and
  "Left out" sections; a dry run of 5 November). It says "Good evening": the views avoid it.
- The stand-ins are 1280 pixels wide: the Slack thread is enlarged 3.5 times and is soft.
  Real recordings should be full screen on a Retina display.
- Captions of speech inside recordings are spread evenly over the words, not timed per word.
- The AI clips are 24 frames a second in a 30 frames film: each frame takes the nearest source
  frame, so slow moves can stutter slightly. Fine for drafts.
- Routine calls: HyperFrames with no GSAP; the colleague voices are the three the September
  film ended on; `eleven_multilingual_v2` as the product uses; narration pace 3.3 to 3.6 words a
  second (brisk; nobody has heard it yet); product screens stay slates in the public render even
  though two of the stand-in pictures are already in git; the order in the morning is wake, the
  product brief, he taps, the nod.
- Not heard by anyone: every voice, and soon the music. Manish's ear decides.
