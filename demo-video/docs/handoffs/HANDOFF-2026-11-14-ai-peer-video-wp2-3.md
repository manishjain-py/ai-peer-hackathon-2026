# Hand-off: ai-peer-video-wp2-2 to ai-peer-video-wp2-3, 2026-11-14 13:32 UTC

Written by ai-peer-video-wp2-2 at 45.7% context (457,375 tokens, measured from its transcript;
13% at 12:18 UTC, so about 26% an hour with frame sheets). Dated, never edited. For the session
that takes work package 2 on from Draft 1: Manish's feedback, and the Earth's final version.
The first brief still binds you (`HANDOFF-2026-11-14-ai-peer-video-wp2.md`: the $10 cap, of
which $0.94 is spent, the stop rules, the privacy rule C8).

## Read first, in order

1. `demo-video/docs/STATE.md` on `origin/main` (the live controller is named there).
2. `demo-video/film/REPORT.md` (what Draft 1 is, what is weak, the checks, the routine calls).
3. `demo-video/film/README.md` (the files, the switches in `shots.json`, the network guard).
4. This file.

## Where things stand

- **Draft 1 is done and merged** (PR 9, merge commit `1813ac4`). The full film:
  `~/.ai-peer/demo-video-private/renders/draft-01.mp4` (this Mac only). With slates:
  `demo-video/film/renders/draft-01-slates.mp4` (in git). The controller sends it to Manish.
- The worktree `/Users/manishjain/repos/ai-peer-video-wp2` is on `video-wp2-film-build`, merged.
  For the next round make a new branch there from `origin/main` (one PR per round). It holds
  two things that are **not in git, do not lose them**: the Earth helper's working file
  `demo-video/film/src/scenes/earth.js` (modified, its development switches may be on) and five
  unused music takes under `demo-video/film/audio/music/takes/` (untracked on purpose).
- The 1.5 GB masters of both renders are in the work folders (`film/.build/work/`,
  `~/.ai-peer/demo-video-private/work/`): delete them when a later draft replaces them.

## What is left

1. **The Earth's final version.** Draft 1 is pinned to a snapshot
   (`film/src/scenes/earth-draft1.js`, named by `scene_file` in `film/shots.json`). When the
   old session writes `handoffs/HANDOFF-2026-11-14-ai-peer-video-wp2-2-helpers-earth.md`: read
   it, check that the line `const DEV = {...}` near the top of `earth.js` has every switch
   off (with `top: true` the scene covers the captions and the end card), commit
   `earth.js` and `assets/earth/SOURCE.md`, drop `scene_file`, delete the snapshot, render
   `--part close`, look at one small sheet of 1:48 to 2:00. If that report never comes, the
   snapshot stays and the report already says so.
2. **Manish's feedback on Draft 1**, through the controller. Voices, music and pacing are his
   ear's call: nobody has heard the film. `audio/music/bed-alt-1.wav` is the plainer cut of
   the bed (change `music.file` in `audio/mix.json`).
3. **The colour of six AI clips** (no colour tag; WP3 thinks BT.601 may fit them better than
   the BT.709 the browser assumes): compare `hook-1` in a render with
   `demo-video/shots/stills/hook-1.png`. Not checked.
4. **The music's licence wording** is open for Manish (four points in `REPORT.md`).
5. **Manish's real recordings** arrive by Tuesday 17 November: cut them in `film/product.json`
   (numbers only) and `~/.ai-peer/demo-video-private/product-private.json` (words, never in
   git). The meeting must be recorded from a participant's screen.

## Traps I met

- **A scene's development switch can hide half the film and the page check still passes.**
  Only frames showed that the Earth covered the captions and the end card.
- **A stand-in recording can go blank mid-shot** (Slack, one second while a thread loaded):
  only frames showed it. A beat with `"rate": 0.02` in `product.json` holds a frame.
- **Chrome cannot start inside the guard's sandbox with its own sandbox on** ("Requesting main
  frame too early"): `render.mjs` sets `HYPERFRAMES_CHROME_SANDBOX=0` there. Leave it.
- **A delivery render without the packing step is 1.5 GB** (the film grain). `--crf 22` gives
  about 115 MB, 24 about 40 MB; at 18 the grain is kept and the file is close to 1 GB.
- **A private render named `draft-NN` wakes the controller's wait** when the file appears:
  name test renders something else, and delete them after.
- **`renders/` is ignored by git:** commit a slates render with `git add -f`, by name.
- **Pictures fill the context:** one sheet of 12 to 20 frames at 320 pixels a frame settles a
  cut; crop to 640 pixels only where text must be read. Mine went from 13% to 45.7% in 75
  minutes with about 25 sheets.
- **A script edit that dies half-way lets the next command run** (a quoting slip in a Python
  heredoc; `git rm` on the next line still ran). Put dependent steps on one `&&` chain.
- `tools/pull_shots.mjs` renames side files with the slot's id; an older track or clip it no
  longer names stays in `assets/shots/` until you remove it.
