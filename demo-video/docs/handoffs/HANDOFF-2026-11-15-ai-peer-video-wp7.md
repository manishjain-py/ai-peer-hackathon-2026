# Brief: ai-peer-video-wp7, the two blended videos (2026-11-15)

Written by ai-peer-video-controller-5 for the worker of WP7. Dated, never edited; the living
state is `demo-video/docs/STATE.md` on `main`. Your controller is the one named at the top of
STATE.md; message it by that name.

## Manish's words (V23, V24, V26; in full in `../BRIEF-BLENDED-2026-11-15.md`)

> "from the videos you sent me, I liked little peer." "So I would like you to really go through these two video in depth, understand in detail, like the full design, how it's working, everything. And then let's take these two video as two bases. Let's just, for the time being, think that these are the two versions of our final product." "let's see how we can blend this entire thing into the existing video (draft 3 i guess) that we have, so that the full demo contains the product walkthrough as well, as the main demo part. While we can still use our original things, we still want to show the initial pitch of the product, multiple people talking, and still the peer joining the Zoom meeting. Still we want to show the Slack update that it provides. But along with all of that, we also want to show this really cool visual walkthrough of the actual product. How can someone set it up?" "So you take your best judgment call on how much time you want to give to each portion." "So you will be giving me two final videos - one with tag and another with little peer." "So we might no longer be able to show the real Ram coming out of the phone. Based on these mascots, we might have to show this kind of a mascot coming out of the phone." "We can call it "blended video"." "So let's not lose any of our important artifacts while still continuing to explore and experiment with different ideas."

And, asked whether the code behind the tag video exists: "For now let's build from the video" (V26).

Also binding (`DESIGN.md` section 0): V2, Claude's own abilities first; V6, under 2:00, 1080p,
about half the time on the real product working; V15, "one worker at a time, on Opus 5.5";
V16, "the voice and music, it's good. Let's keep them."; V19, never out of the sleeping Ram.

## The job, in one line

Make two "blended videos", each Draft 3's story with a product walkthrough as its main demo
part: one with the tag mascot (rebuilt by code from his video), one with Little Peer. Draft 3
and every other artifact stay as they are.

## Read first (part by part; reading in full filled one worker to 37%)

1. `demo-video/docs/STATE.md` on `origin/main`: the first lines and the top of "Where we are".
2. `demo-video/docs/BRIEF-BLENDED-2026-11-15.md`: his words and what the controller checked.
3. `demo-video/film/README.md`, then `demo-video/film/REPORT.md`'s three Draft 3 sections: how
   the film is built and rendered. Public builds only (no `--private`).
4. `demo-video/ui-concepts/README.md` and `REPORT.md`, and the folder `little-peer/` (WP6's
   notes below).
5. His tag video: `~/.ai-peer/demo-video-private/bases/tag-walkthrough-2026-11-15.mp4` (88.7 s,
   848x528, 30 fps, silent, with captions). Study it frame by frame where you need detail: its
   look, its mascot (a walking green name tag labelled "Maya's AI Peer" with an AI badge), its
   motion and each product step (the four setup steps; What I learned; the brief; Ask; the
   trust note; the return).
6. Draft 3: `demo-video/film/renders/draft-03.mp4` (public; in Git LFS). Small sheets only.

WP6's notes on Little Peer, word for word: "the mascot is drawn in
demo-video/ui-concepts/little-peer/peer.js (SVG, draw(pose) per frame); how it moves is
motion-core.js (hops, squash, eyes, trails) and motion.js (poseAt(t), its choreography); every
beat time and place is in tl.js (T = 70) and must match "seconds" in concept.json. A part only:
node demo-video/ui-concepts/render.mjs little-peer --from 5 --to 28 --quality draft --sheet 16
(the setup); a new length means moving the beats in tl.js; for a film without the series title
and end cards, add "framing": false to concept.json (runtime switch, used by _overview/). Its
text comes from shared/data.js (made-up, privacy-checked); a still of the mascot can be grabbed
with ffmpeg -ss <t> from renders/little-peer.mp4 (for example 19.7 s); stalls of a few seconds
per render are normal."

## Your working copy

- A worktree at `/Users/manishjain/repos/ai-peer-video-wp7`, new branch `video-wp7-blended`
  from `origin/main`, upstream unset. Write nothing in the shared checkout you start in, except
  the worktree creation itself.
- **Nothing is overwritten.** The tag `draft-03` pins Draft 3; keep Draft 3's own render command
  producing Draft 3 (add the blends as new cuts or new config files, not edits of Draft 3's).
  Never replace an existing render, concept or take: a new version is a new file (`-v2`).
- The new films: `demo-video/film/renders/blended-little-peer-v1.mp4` and
  `demo-video/film/renders/blended-tag-v1.mp4`, public builds.
- The tag concept, rebuilt by code: a new folder `demo-video/ui-concepts/tag/` in WP6's kit.

## The blend (the controller's starting plan; your judgment inside it)

- **Length.** Under 2:00, 1920x1080, 30 fps; about half on the product walkthrough, the main
  demo part.
- **Kept from Draft 3.** The pitch and hook with the colleagues talking (shorter); the Peer
  joining the Zoom meeting as a labelled AI; its Slack update; the morning brief; the voice and
  the music. New narration lines are allowed where the walkthrough needs words, in the same
  ElevenLabs voice (the plan, not billed per call), with captions as now.
- **The walkthrough.** How someone sets it up (the setup steps), then what it learned, the
  brief, asking, the trust note. Little Peer: WP6's render, re-timed (`"framing": false`, moved
  beats). Tag: rebuilt by code at 1080p in the kit, as close to his video's design, motion and
  steps as you can. Never upscale his 848x528 video into the film.
- **One story.** Ram everywhere, with the film's made-up Airbnb payments data
  (`demo-video/ui-concepts/shared/data.js`): the tag reads "Ram's AI Peer", not Maya's. Never
  use the job title "Senior Software Engineer": it matches the real person's (WP6 made Ram a
  staff engineer).
- **The mascot is the Peer.** In each blend the version's mascot replaces Ram's look: it comes
  out of Ram's phone at night (never out of the sleeping Ram, V19) and goes back into it in the
  morning; it is the Peer's face on the Zoom tile, in Slack and on the cards. By code first,
  drawn over the film's plates; a paid shot only where code cannot reach the look.
- **Starting timeline** (change it freely and say why): 0:00 to 0:12 the hook; 0:12 to 0:22 the
  entrance from the phone; 0:22 to 1:20 the walkthrough; 1:20 to 1:38 Zoom; 1:38 to 1:46 Slack;
  1:46 to 1:56 the morning brief and the return; 1:56 to 2:00 the end card.

## The privacy rules (C8; they bind every helper too)

- His tag video stays outside git and is sent nowhere (no Telegram, fal.ai, ElevenLabs, Gemini,
  OpenAI or the web): its data looks made up, but one line matches a real term. Your rebuilt
  version, with the film's made-up data, may go everywhere.
- The walkthrough recording of his company (`~/.ai-peer/demo-video-private/ui-wow/`) is not
  needed: do not open it. Never look at or send the film's private renders.

## Helpers (C13: the controller's yes is given here)

- Up to two builder helpers at once, each on its own files (for example one rebuilds the tag
  concept in `demo-video/ui-concepts/tag/`, one draws the mascot's entrance and return over the
  plates), from one shared brief that you write. The week is tight: fewer is better.
- Fences for every helper: the privacy rules; no paid call; nothing sent anywhere; nothing
  written outside its own folder and its scratchpad; plain shell; a report in its final
  message; its own render lane; look-checks on small sheets only (16 to 20 frames at 320 px).

## Money

- Up to $10, made-up content only, only where code cannot reach the look.
- Your own wrapper and ledger (`gen-wp7.sh`, `demo-video/ledger/wp7.csv`); your total in every
  message. The film has spent $41.43 of the $100 cap.

## Delivery, PR and merge

1. **Plan first.** After the read-in, send the controller each blend's timeline in a few lines
   (parts, seconds, what is new, what is cut). Build once it says yes; it answers at once.
2. **Little Peer first** (its base exists at 1080p), then the tag blend. Send each when ready:
   the path, the length, one line on what to look for, one small sheet (16 frames). The
   controller looks, then sends it to Manish.
3. One PR with both, made-up data only. Merge it once both are delivered (fetch and merge
   `origin/main` first). Update your STATE spots: a WP7 line under "Packages" and session-log
   rows.

## Stop rules

- Tell the controller at 40% context (measured from your transcript); hand off at a clean step
  by 45%, with a dated file on `main`, `HANDOFF-2026-11-15-ai-peer-video-wp7-2.md`.
- **Usage.** The whole week was at 71% at 16:32 UTC on 15 November and resets on Monday
  16 November at 22:59 UTC; about 3 points an hour while video work runs. At 85% stop at your
  next clean step; at 93% all video work pauses. Push your work at every step, so another Mac
  can carry on.

## Known traps

- Pictures fill a context fast: one sheet of 16 to 20 frames at 320 px settles a check.
- Render a part, not the whole film, while you work.
- Shell edits: put edit scripts and commit messages in scratchpad files and run plain
  commands; quote heredocs (`<<'EOF'`); in zsh, `echo =====` fails, and a glob with no match
  fails the line.
- The film's lessons: `demo-video/film/REPORT.md`, "Traps" sections; WP6's in
  `demo-video/ui-concepts/REPORT.md`.
