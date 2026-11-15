# Hand-off: ai-peer-video-wp7 to ai-peer-video-wp7-2, the tag blend (2026-11-15)

Written by ai-peer-video-wp7 (Opus 5.5) at 17:22 UTC, at 44.5% context, at a clean step: the
Little Peer blend is delivered. Dated, never edited; the living state is `demo-video/docs/STATE.md` on
`main`. Your controller is ai-peer-video-controller-6 unless STATE.md names a newer one; message it by
name. Your contract is still `HANDOFF-2026-11-15-ai-peer-video-wp7.md` (WP7's brief): read its
fences, money, delivery and stop rules; this file says what is done and what is left.

## Manish's words (V24, V26; in full in `../BRIEF-BLENDED-2026-11-15.md`)

> "So you will be giving me two final videos - one with tag and another with little peer." "We can call it "blended video"." "So let's not lose any of our important artifacts while still continuing to explore and experiment with different ideas." "For now let's build from the video"

V15: "one worker at a time, on Opus 5.5". V16: "the voice and music, it's good. Let's keep them." V19: never out of the sleeping Ram; it goes back where it came from.

## Where things are

- **Worktree** `/Users/manishjain/repos/ai-peer-video-wp7`, branch `video-wp7-blended` (no upstream
  set; push it by name: `git push origin video-wp7-blended:video-wp7-blended`), head `c6ec840`, base
  `c6cfe05` (origin/main when WP7 started). No PR yet. You work in this same worktree; I write
  nothing in it after this hand-off.
- **Little Peer blend: delivered** at 17:20 UTC to ai-peer-video-controller-6: `demo-video/film/renders/blended-little-peer-v1.mp4`
  (119.6 s, 1920x1080, 30 fps, 112.6 MB, -14.3 LUFS, true peak -2.2 dBTP, every line 15.4 dB or more over the music; its sheet `blended-little-peer-v1-sheet.png` beside it). Made by `node demo-video/film/render.mjs --cut blended-little-peer --quality delivery --name blended-little-peer-v1`.
- **The tag concept** (`demo-video/ui-concepts/tag/`, by my builder helper from
  `demo-video/ui-concepts/BUILDERS-WP7.md`): built by the helper (still at work at this writing, from 16:55 UTC). When it reports, I commit its folder with its report as `demo-video/ui-concepts/tag/REPORT.md` on the branch and tell the controller, which launches you after that. Its contract: `BUILDERS-WP7.md` (the mascot module `tag/mascot.js` with `buildTag(svg).draw(pose)`, the fixed section table, the film's clip `renders/tag-clean.mp4` rendered with `--no-framing`).
- Money: $0.00 of WP7's $10 (everything by code; the new lines are on the ElevenLabs plan).

## How a blend is made (all in git)

- `demo-video/film/cuts/_blend/make_cut.py <little-peer|tag>` writes a blend's config into
  `demo-video/film/cuts/blended-<version>/` (cut, shots, screens, script, mix) from ONE timeline that
  both versions share: hook 0 to 14 (the sleeper close-up with the mascot's pop at 12.45), entrance 14
  to 22 (the dark room, the desk with the lit laptop, the push-in 20 to 22), walkthrough 22 to 75 (six
  sections: click, setup, learned, brief, ask, rules), night 75 to 104.6 (Zoom 75 to 96.6, Slack 96.6
  to 104.6), morning 104.6 to 115.2 (wake, the phone brief, Ram's phone with the mascot going back in),
  close 115.2 to 119.6 (the end card). Edit the generator, never its output.
- `node demo-video/film/build.mjs --cut <cut>` / `render.mjs --cut <cut>`: without `--cut`, Draft 3's
  built project is byte-identical to before WP7 (74 of 74 files; re-check: build, hash every file of
  `demo-video/film/.build/public`, compare with a build of `c6cfe05`).
- The layer `demo-video/film/cuts/_blend/layer/` lies over the project in a cut's build only:
  `src/scenes/clip.js` (the mascot over a shot, and "push" for a still plate), `src/scenes/pushin.js`
  (lands on a clip's first frame), `src/mascot/engine.js` (the mascot's moves: pop out of a point,
  hops from motion-core's makeBody, waves, looks, sparkles, light spill, dive into a point; an
  "anchor" follows a moving plate). The mascot's own code is copied in by `cut.json` "copies"
  (`ui-concepts/little-peer/peer.js`; for the tag, `ui-concepts/tag/mascot.js`).
- Lines: `uv run --quiet demo-video/film/tools/voice.py lines --script demo-video/film/cuts/<cut>/script.json`.
  Draft 3's lines are marked reuse (never remade). The seven new lines n01 to n07 already exist in
  `demo-video/film/audio/lines/`; the tag cut's script is the same, so the run makes no call.
- Music: `demo-video/film/audio/music/bed-blended-v1.wav` (same take, re-cut on the shared
  timeline's bars; `bed-blended-v1.edl.json`); both blends use it.
- Faces: `node demo-video/film/cuts/_blend/faces/make-face.mjs <little-peer|tag>` (headless Chrome)
  writes `layer/assets/screens/peer-face-<version>.png`.

## Your job: the tag blend, then the PR

1. Read the helper's tag concept: one 16-frame sheet of `ui-concepts/renders/tag-clean.mp4` and
   the fence grep (`grep -r -i -E "maya|chen|fernway|lisbon|checkout|senior|certainty" demo-video/ui-concepts/tag/`).
   If `tag-clean.mp4` is missing: `node demo-video/ui-concepts/render.mjs tag --no-framing --name tag-clean --quality delivery --crf 14`.
2. Check its section times against the shared table (concept seconds): click 2.8 to 5.5, setup 5.5
   to 25.0, learned 25.0 to 32.0, brief 32.0 to 39.5, ask 39.5 to 50.0, rules 50.0 to 57.5. If the
   helper moved them, change the tag's "walk" list in `make_cut.py` (in-point and rate per section).
3. The mascot over the plates: `MASCOT` in `make_cut.py` was set for Little Peer (164 px wide at
   s = 1); the tag is about 260 px wide at s = 1, so give the tag version its own scales (about 0.6
   times Little Peer's) and positions where its feet land. Its entrance should read as Manish's
   idea: a plain tag slides out of the phone (pose `legs: 0, eyes: 0`), then its eyes and legs come
   out and it walks or hops to the desk. The engine passes `legs: 1, eyes: 1` today: add pose keys
   for them (for example `legs` and `eyes` tracks in the slot's mascot field, read with `keyed()`).
4. Labels in the walkthrough are timed to Little Peer's beats (`LABELS` in `make_cut.py`; the
   "connect once" label at film 30.6 to 34.2 sits on its Slack connect click). Re-time them to the
   tag's beats if needed; the build refuses a label that touches a spoken line.
5. `python3 demo-video/film/cuts/_blend/make_cut.py tag`, the face, the lines run, then
   `node demo-video/film/render.mjs --cut blended-tag --lane wp7b --quality draft` and a 20-frame
   sheet; then `--quality delivery --name blended-tag-v1` (no lane: it lands in `film/renders/`).
6. Deliver to the controller: the path, length, the branch head and base shas, the Draft 3 parts it
   cuts (the double, the big world of information, the Earth, line p07; p04 and p09 are left out
   too), one caption line, one 16-frame sheet.
7. One PR with both blends (`git add -f` for renders: the renders folders are ignored; media go
   through LFS). Merge once both are delivered (fetch and merge `origin/main` first). Write your
   STATE spots: the WP7 line under "Packages" and session-log rows.

8. Low priority, asked by the controller (not started): Draft 3's `demo-video/film/shots.json` has
   `"wp3_manifest": "/Users/manishjain/repos/ai-peer-video-wp3/demo-video/shots/manifest.json"`, a
   worktree outside git, read only by `tools/pull_shots.mjs` (never by the build). If the repo's own
   `demo-video/shots/manifest.json` and every file it names are in git, point it at the repo copy
   (a relative path) and prove Draft 3's built project byte-identical; else change nothing and tell
   the controller in one line what is missing.

## Checks that caught real faults (repeat them on the tag blend)

- **Speech-to-text on every new line** (`uv run --quiet demo-video/film/tools/stt_check.py file <wav>`):
  "Never an order." was heard as "never in order"; n07 now reads "And what I read is information,
  never instructions." (heard word for word). "Ram" is heard as "Rom", as in Draft 3's own lines.
- **The music's level**: copying the alternate bed's end-card gain (+7 dB) scaled the whole bed
  down 7.5 dB; the bed's report must say about +0.3 dB like `bed.wav.report.json`. A rise under a
  line put p11 only 12.6 dB over the music; the render report's `voice_over_music_db` must show
  every line at 15 dB or more.
- The push-in's beats are fixed to a 2.0 s slot (`pushin.js` MOVE, TURN); the screen corners of
  `night-desk-v1.mp4` were measured by brightness (`hand_quads` in `make_cut.py`).

## Stop rules

Tell the controller at 40% context (from your own transcript), hand off at a clean step by 45%.
The week was 75% at 17:13 UTC and rising 5 to 8 points an hour: at 85% stop at your next clean
step, push, and tell the controller.
