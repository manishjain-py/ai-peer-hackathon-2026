# Hand-off: ai-peer-video-wp2-5 to ai-peer-video-wp2-6, 2026-11-15 04:21 UTC

Written by ai-peer-video-wp2-5 at about 42% context (measured from its transcript). Dated, never
edited. For the session that finishes Draft 3. The first brief still binds you
(`HANDOFF-2026-11-14-ai-peer-video-wp2.md`: the stop rules, the privacy rule C8). So do the order
for Draft 3 (`../FEEDBACK-DRAFT-2-2026-11-14.md`, Phases C and D) and Manish's pick with its order
(`../FEEDBACK-PHASE-A-2026-11-15.md`, V20). One worker at a time, on Opus 5.5. Never look at or
send the private render.

## Read first, in order

1. `demo-video/docs/STATE.md` on `origin/main`: "Where we are" and the WP2 line (the live
   controller is named at the top).
2. `demo-video/docs/FEEDBACK-PHASE-A-2026-11-15.md`: Manish's pick (A) and the order.
3. This file. Then only what your step needs (`demo-video/film/REPORT.md`, last sections).

## Where things stand

- **Branch `video-wp2-4-draft3`** in `/Users/manishjain/repos/ai-peer-video-wp2` (pushed at
  `1a510e0`, upstream unset, not merged). Carry on there; Draft 3 is one PR at Phase D. Not in
  git on purpose, keep them: five music takes under `demo-video/film/audio/music/takes/` and
  `demo-video/shots/hook-1/hook-1-raw-r1.mp4`, `hook-2/hook-2-raw-r1.mp4`.
- **Money:** `demo-video/ledger/wp2-5.csv`, $3.7367 (12 calls), through `tools/gen-wp2-5.sh` (cap 25).
  Phase C's $25 covers the entrance, the return and the Zoom movement (the controller): make your
  own `tools/gen-wp2-6.sh` with `--cap 21.26` and `ledger/wp2-6.csv`, and give your ledger total
  in every message. The controller tells Manish at $50 and $80 overall.
- **Done (all on the branch, check renders in lane wp25, git-ignored):**
  - Phase B fixes: the push-in lands on the lit Zoom window (`windowContent`, `windowDim` in
    `src/scenes/screens.js`; no black frame); the brief's phone clears the captions.
  - Zoom tiles: Amara, Daniel and Vikram are webcam stills (`shots/meeting-amara/`,
    `shots/meeting-tiles/`); Amara says m3 in a lip-synced clip (`assets/screens/amara-m3.mp4`,
    `screens.json` "clips", 46.65 to 51.65 s), passed by the controller.
  - The entrance with A (`shots/reveal-a/`): `reveal-phone` 15.0 (the phone's ribbon, he is
    formed by 18.0, before p02), `reveal-walk` 20.0 (to the chair), then Draft 2's desk clip from
    4.2 s only (its first 4.2 s show threads to the sleeper): sit 23.0, work 26.5, push-in 30.0.
    The desk clip is borrowed through `"sources"` in `shots.json` (`build.mjs`: `from_shot` may
    name a source), which keeps WP3's tag track, last still and screen corners for the push-in.
    Key frames e0, e1, e2 were made on that clip's own room and tone-matched, so the sleeper
    matches. Lid click 26.05 s.
  - The return with A (`shots/return-a/`): `morning-return` (104.5 to 108.0) replaces
    `morning-nod`: he smiles, flows as a ribbon into the phone in Ram's hand, the phone glows.
    A quieter shimmer under it (`audio/mix.json` "return").
  - The face: `assets/screens/peer-face.png` is Ram's portrait with the mark as a badge; the
    hook's cards and the tag use it through `names.peer_face` (`shots.json`); Zoom and Slack did.
  - Tags: three tracks made here from hand-set keys (`tools/tag_track.py`, `assets/tags/`).
  - Music: unchanged on purpose. Its quiet bars 12 to 16 s sit on the sleeper; its reveal music
    enters at 16.0 as the ribbon streams; the new cuts (18.0, 20.0, 26.05, 30.0) sit on its bar
    lines. Nobody has heard it.
  - The big world of information (`proof-change`): built by a builder helper (the controller's yes) in `src/scenes/world.js`, `src/world.css` and `world.json`, reviewed on its last sheet and switched on (`"ready": true`). 72.0 to 90.0: the chapter card (now "News from the company and the web"); a deep flood of emails, Slack, tickets, code, docs, meetings and the web outside, with seven running counters; the Peer (Ram's face) listens and draws it in; the one change (Brazil's fraud-score threshold, 0.82 to 0.74 on Thursday) opens with why it matters and drops into "Your morning brief", the rest left out; it ends warm for the cut to the sunrise room. Labels and every timing are in `world.json` ("beats"). Its last render: `demo-video/film/.build/lanes/wp25w/renders/world-5-71.5-90.5.mp4`.

## What is left, in order

1. **Make the phone the clear source of the ribbon** (the controller, 2026-11-15 04:1x UTC). In
   the wide shot the ribbon starts at the far left, right beside Ram's head, so it may read as
   coming out of him. Ideas, your judgment:
   - The phone on the nightstand lights up by code in the sleeper close-up (`hook-sleeper`,
     about 14.0 to 15.0 s, the phone is at the bottom left of that frame), with the "phone" buzz
     (`audio/mix.json`, now 15.1) moved to it.
   - In `reveal-phone` the phone is lit from the first frame. WP3's
     `demo-video/tools/phone_lightup.py` darkens a lit phone until `--on` and lets it light up:
     it needs a still of the same room with the phone off (one edit of
     `shots/reveal-a/keys/e0-tm.png`, about 8 cents). Then check, frame by frame at full size,
     that the ribbon visibly leaves the phone's screen in the first second. If it leaves the
     pillow, re-make `k-entrance` with a middle key frame of the ribbon just leaving the phone.
2. **The Zoom colleagues move for the whole meeting (V20):** listening, blinking, small nods
   while the Peer speaks; nobody frozen. Recipe: MiniMax H3
   (`minimax/h3-max-turbo/image-to-video`; inputs `image_url`, `end_image_url`, `duration`,
   `resolution` 480P/768P/1080P, `prompt_expansion_mode`, `seed`; no `target_audio_url`), with
   the tile still as both first and last frame so every clip loops with no jump; 768P is plenty
   for a 556 px tile (WP3 paid about $0.17 a 5 s take at 768P; dry-run for the live price). Two
   or three takes per person cover 32 to 54 s; Amara's talking clip slots between hers. Code:
   `screens.json` "clips" holds one clip per person now (`who`, `file`, `line`, `line_at`,
   `length`); give it clips with their own start times (for example `at` in slot seconds), make
   `build.mjs` write one `<video>` per clip and the zoom builder show the clip that covers the
   time (fade 0.12 s in, 0.3 s out, as Amara's). The push-in's copy of the window skips clips.
3. **The big world scene:** it is in. Two checks: (a) the invented outside names (The Ledger Lantern, Quayside Courier, The Morning Abacus, Harbourline Travel Wire, Banco Pitanga, Brisamar Bank, Lumeira Pay, Nova Terra Payments Authority, Coastal Union Trade Office): search each, and swap any that is real in `world.json`; (b) the helper's weak points: the flood reads as grey noise in small previews (fine at full size), the web layer is subtle (a few larger web pages drifting in from the edges would make it louder), and from about 83.0 to 83.6 s the open card covers the top of the brief panel before it slides in.
4. **Phase D, Draft 3.** `node demo-video/film/render.mjs --name draft-03 --quality delivery`
   (public; no real recording in it, so it can go to Manish in full). One sheet of 16 to 20
   frames at 320 px; the numbers (2:00.0, -14 LUFS, every line at least 15 dB above the music);
   `uv run --quiet demo-video/film/tools/stt_check.py film <mix.wav>`; copy to
   `demo-video/film/renders/draft-03.mp4`; one PR from `video-wp2-4-draft3`, merge (fetch and
   merge `origin/main` first); your STATE spots (the WP2 line and a session-log row, on `main`);
   report to the controller with the paths. Never send anything to Manish yourself.

## Weak points I know of

- The walk (20.0 to 23.0) has a small step toward the camera before he turns to the chair.
- The entrance's ribbon swirls back over the bed into the phone at about 18.5 to 20 s, near
  Ram's head (item 1).
- The tag is small on the wide shots; its face is Ram's portrait at about 30 px.
- Amara's syllables follow loosely (H3's lips); Daniel's and Vikram's tiles are still stills.
- Vikram's name in his tile is partly under the Zoom caption bar while the Peer speaks.

## Traps I met

- **Slot times must sit on the 30 fps grid** (the build refuses 26.45; use 26.5).
- **WP3's pulled data is laid over a slot by its id:** a new clip under an old slot id picks up
  WP3's `use_from_s` and track. Give new clips new slot ids and `"own_clip": true`;
  `tools/tag_track.py` reads `use_from_s` from `shots.pulled.json` by slot id.
- **A `<video>` can live in one place only:** a second copy of a screen (the push-in's) must skip
  the clips (`opts.copy`).
- **Image edits lift the tone about 4 levels each:** tone-match key frames to the clip they must
  join (`demo-video/shots/morning-wake/tone_match.py`).
- **Kling 4.0 at 1080p bills $0.235 a second** (1.5 times 720p); durations 3 to 30 s, up to 8
  middle key frames. It lands on the end key frame closely: a 0.15 s dissolve hides the rest.
- **A shell edit that rewrites a JSON file reformats it:** edit `shots.json`, `screens.json` and
  `mix.json` as text, asserting each anchor once.
