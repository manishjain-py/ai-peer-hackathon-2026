# Hand-off: ai-peer-video-wp2-3 to ai-peer-video-wp2-4, 2026-11-14 15:10 UTC

Written by ai-peer-video-wp2-3 at 43% context (measured from its transcript). Dated, never edited.
For the session that takes work package 2 (the film in code) on from Draft 2. The first brief
still binds you (`HANDOFF-2026-11-14-ai-peer-video-wp2.md`: the stop rules, the privacy rule C8).
Money now needs the controller's word for each round (wp2-3 had up to $10 for Draft 2 and spent
$0.616).

## Read first, in order

1. `demo-video/docs/STATE.md` on `origin/main` (the live controller is named there).
2. `demo-video/film/REPORT.md`: Draft 1 at the top, then "Round 3" and "Draft 2" at the end.
3. `demo-video/film/README.md` (the files, the switches in `shots.json`, the network guard).
4. This file.

## Where things stand

- **Draft 2 is done and merged** (PR 11, merge commit `5a7970f`). The controller's whole order
  for Draft 2 (Manish's V16 and V17) is done: the quicker reveal, Ram named in h1, h2 and p02, two
  new takes, the message cards, the sleeper's label, the tag "Ram's AI Peer", the proof's note,
  the hook at 15.0 s and the reveal from 15.0 to 32.0, both renders, the PR, the merge.
- The worktree `/Users/manishjain/repos/ai-peer-video-wp2` is on `video-wp2-3-quicker-rise`
  (merged). Make a new branch there from `origin/main` for the next round, upstream unset. Not in
  git on purpose, keep them: five music takes under `demo-video/film/audio/music/takes/` and the
  two raw takes `demo-video/shots/hook-1/hook-1-raw-r1.mp4` and `hook-2/hook-2-raw-r1.mp4`.
- Work folders: the 1.5 GB masters of Draft 1 and Draft 2 are in `demo-video/film/.build/work/`
  and `~/.ai-peer/demo-video-private/work/`; delete Draft 1's when nothing needs them.
  `demo-video/film/.build/lanes/wp23/` holds wp2-3's check renders (git-ignored, deletable).

## What is left (nothing started)

1. **Manish's view of Draft 2**, through the controller.
2. **The music before 32 s.** The bed was cut for a 12 s hook; it is the same file under a 15 s
   hook, so whatever it does at 12 s now falls in the sleeper shot, three seconds before the cut
   to the reveal. Nobody has heard it. The bed's maker's notes:
   `handoffs/HANDOFF-2026-11-14-ai-peer-video-wp2-2-helpers.md`; the settings: `audio/mix.json`.
3. **REPORT "Draft 2", still weak:** the 0.3 s dissolve past the blanket, the walk at 1.5x, the
   2 s working loop, the new takes' lips (timed by WP3's rule, not measured:
   `demo-video/tools/lipsync_check.py`), the card texts (placeholders).
4. **The Earth's polish list** (REPORT "Round 3" and the helper's report).
5. **The music's licence wording** (Manish's call).
6. **Manish's real recordings** (by Tuesday 17 November): `film/product.json` (numbers) and
   `~/.ai-peer/demo-video-private/product-private.json` (words, never in git). They say
   "Manish's AI Peer"; the note on the product screens says they are the builder's own Peer.

## Traps I met

- **ffmpeg 8's `amix` can hang for good** at full CPU when delayed inputs end at different times
  (the sound step of a render then never ends, its stems stop growing). `tools/mix.mjs` now pads
  each delayed input first. If it happens again, stop only your own render's PIDs.
- **WP3's data overrides `shots.json`:** `shots.pulled.json` is laid over each slot of WP3's, except
  `in_s` and `line_in_s` (applied after) and slots marked `own_clip` (the two new hook takes).
  `tools/pull_shots.mjs` keeps `own_clip` slots.
- **The frame grid is exact:** slot starts and lengths must be whole frames at 30 fps to one part in
  a million; use tenths of a second.
- **Moving the reveal:** the note on `reveal-rise` in `shots.json` says what moves with it
  (the slots, the effects phone, rise and laptop, `reveal-work`'s length, the lines p02 to p05).
- **ElevenLabs:** changing one line re-makes its neighbours of the same speaker in the same part
  (they are sent as context). The voices are told "Rahm"; speech-to-text hears "Rahm", which is
  the wanted long a, and flags h2 as different only for the spelling.
- **Waiting on a render:** a grep for "error" matches "no errors on the page"; wait for `done:`.
- **Never look at or send the private render** (the controller's rule): read its numbers only.
- Pictures fill the context: one sheet of 16 to 20 frames at 320 pixels settles a cut.
