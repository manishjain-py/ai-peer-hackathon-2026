# Hand-off: ai-peer-video-wp7-2 to ai-peer-video-wp7-3, the Tag blend v2 (2026-11-15)

Written by ai-peer-video-wp7-2 (Opus 5.5) at 18:46 UTC, at 33% context, at a clean step: five
transition ideas for the Tag are with Manish (the controller sent them at 18:44 UTC, with its own
pick told to him: F, runner-up A). Dated, never edited; the living state is
`demo-video/docs/STATE.md` on `main`. Your controller is ai-peer-video-controller-6 unless STATE.md
names a newer one; message it by name. Your contract is still WP7's brief,
`HANDOFF-2026-11-15-ai-peer-video-wp7.md` (fences, money, delivery, stop rules); how a blend is made
is in `HANDOFF-2026-11-15-ai-peer-video-wp7-2.md`, "How a blend is made". This file says what is
done and what is left.

## Manish's words

- V27, word for word in `../FEEDBACK-BLENDED-2026-11-15.md` ("His words", given about Little Peer), with
  the controller's reading under it.
- V28, 18:31 UTC: "All Same feedback for tag blended video. And lets only work on tag for now. Not on
  little peer." Little Peer pauses: build and send nothing of it.
- Still in force: V6 (under 2:00), V16 (the voice and music), V19 (never out of the sleeping Ram; it
  goes back where it came from), V24 (new files; v1 stays).

## Where things are

- **Worktree** `/Users/manishjain/repos/ai-peer-video-wp7`, branch `video-wp7-v2` (from origin/main
  `bbc1ae8`; push it by name: `git push origin video-wp7-v2:video-wp7-v2`), head `5c34cdb`, pushed, no
  PR. I write nothing in it after this hand-off.
- **On main** (PR #14, squash `83906fd`): `blended-little-peer-v1.mp4` and `blended-tag-v1.mp4` with
  their sheets, `make_cut.py` for both versions, the tag concept (`demo-video/ui-concepts/tag/`).
- **The ideas** (on the branch): `demo-video/film/cuts/_blend/ideas.py` holds a, b, c, e and f;
  `python3 demo-video/film/cuts/_blend/make_cut.py tag --idea <x>` writes `cuts/idea-tag-<x>/`. Review
  copies (720p) and one sheet: `demo-video/film/renders/ideas/`. A full render:
  `uv run --quiet demo-video/film/tools/voice.py lines --script demo-video/film/cuts/idea-tag-<x>/script.json`
  (writes `narration.json`; makes no call), then
  `node demo-video/film/render.mjs --cut idea-tag-<x> --from 13.3 --to 22.4 --lane idea-<x>`.
- **The engine's new keys** (opt-in; a slot without them draws as before, and both v1 configs are
  unchanged): in `layer/src/mascot/engine.js`, `fade`, `clip` (a screen polygon), `ribbon`, `wake` (a
  screen lights up), `msg` (the glowing message, idea d, built but never rendered), `legs` and `eyes`
  keys, and a glide's `step: false`; a walking tag's steps follow its distance. In
  `layer/src/scenes/clip.js`, `view` keys (a following camera). In `layer/src/scenes/pushin.js`, a
  push-in slot may carry a mascot that stays in the room.

## Your job: blended-tag-v2

Build everything that does not depend on Manish's pick first; the controller passes his pick to you
word for word. Then the cut takes the pick in one place: `ideas.make()` returns the hook's mascot, the
hook slot's extras, the entrance slots and p02's time. New files: cut `blended-tag-v2`
(`make_cut.py`), `demo-video/film/renders/blended-tag-v2.mp4`; v1 stays.

The eight changes, read for the Tag:

1. **The hook line.** h2 reads "Ram's out of office... but his AI Peer already sent me the update I
   needed." It must not name the AI Peer: the first reveal is p01, "He does. I'm the one who's up." Write
   a plain new line (for example "Ram's out of office... but the update I needed is already here."), make
   it on the ElevenLabs plan in that colleague's voice, check it by speech-to-text, and give the
   colleague on camera (hook-2, 3.5 to 8.0) one new lip-sync take: up to $3 on fal.ai, through your own
   wrapper and ledger as WP7's brief says; ask the controller before spending more. First find how
   hook-2's picture and mouth were made (`demo-video/film/shots.json`, `SHOTS.md`, the shots manifest).
2. **The transition.** His pick of a, b, c, e or f.
3. **The home page.** The Tag's own "Set up my AI Peer" page stays; check it against the tag's theme.
4. **The tag is the logo** wherever the film shows a product mark: the end card, the Zoom tile's face,
   the product screens.
5. **The Zoom line.** m4 reads "That's Ram's call, so it's at the top of his morning brief." Make it plain
   that the Peer puts it in Ram's morning brief and Ram gets back to them ("That's Ram's call. I'll put it
   in his morning brief, and he'll get back to you.", or close); ElevenLabs, checked by speech-to-text;
   change any words on the Zoom screen that show the old line.
6. **Slack** (proof-slack, 96.6 to 104.6): zoomed in on the message, less empty space.
7. **The morning.** Ram reads the brief on the laptop, not the phone, and the laptop's screen shows the
   brief with the walkthrough's wow visuals in the tag's theme (today's morning slots, 104.6 to 115.2:
   morning-wake, morning-product-brief, morning-brief).
8. **The ending.** Draft 3's globe comes back (its slot `close-earth`, scene `earth`, 108.0 to 116.0 in
   `demo-video/film/shots.json`) with p11, "It's always night for someone on your team.", then the close
   on the tag as the logo; every screen in the tag's theme.

Time: under 2:00. Idea E is about 3 s shorter than the others; the globe and the laptop brief need
time. Re-time the shared timeline (`PARTS`, `SECTIONS`, `NARRATION` in `make_cut.py`) and the music
bed's edit (`demo-video/film/audio/music/bed-blended-v1.edl.json`) together, and keep every line 15 dB
or more over the music (the render report's `voice_over_music_db`).

Deliver as WP7 did: the path, the length, the branch head and base, one caption line, one 16-frame
sheet, and `demo-video/tools/privacy-check.sh <head> origin/main` (expect 0 and 0). One PR at the end,
a squash merge with your own subject and body (`gh pr merge <n> --squash --subject ... --body-file ...`),
then delete the branch.

## Traps found this session

- A new cut needs its `narration.json`: run `voice.py lines` on its script before `render.mjs` (no call
  when the lines exist).
- A window render (`--from`, `--to`) is about 100 Mbit/s: keep 720p copies in git, as
  `renders/ideas/` does.
- The push-in starts at the desk shot's camera scale: a desk slot with a `view` and no `camera` must end
  its view at scale 1.0.
- `grep -r` over `demo-video/ui-concepts` hangs on the renders: use `git grep` (tracked files only).
- A squash merge's default message lists every commit's message: pass your own subject and body.
- `cuts/<cut>/` folders are written by `make_cut.py`: edit the generator, never its output.

## Money

$0.00 spent by WP7 so far (everything by code; the lines on the ElevenLabs plan). For v2: up to $3 for
one lip-sync take.

## Stop rules

Tell the controller at 40% context (measured from your own transcript); hand off at a clean step by
45% to ai-peer-video-wp7-4. The week was 77% at 18:40 UTC, rising about 4 points an hour: at 85% stop
at your next clean step, push, and tell the controller; at 93% all video work pauses.
