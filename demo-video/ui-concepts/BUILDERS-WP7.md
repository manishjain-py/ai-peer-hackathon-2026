# Builder's brief: the tag concept, rebuilt by code (WP7, 2026-11-15)

Written by ai-peer-video-wp7 for its builder helper. You work in the worktree
`/Users/manishjain/repos/ai-peer-video-wp7` (branch `video-wp7-blended`). Report to the worker in
your final message; do not commit or push (the worker reviews and commits).

## Why

Manish made a walkthrough video of the AI Peer on his other Mac and likes it: a calm paper-style
product page whose mascot is a walking green name tag. He asked for a "blended video": the demo
film's story with this walkthrough as its main demo part. His file is 848x528 and silent, too small
for the 1080p film, and its code is not here ("For now let's build from the video"). So you rebuild
it by code, at 1920x1080, as a concept in WP6's kit, as close to his video's design, motion and
steps as you can, but with the film's made-up story (Ram) and our own words.

## The fences (they bind you)

1. **His video stays on this Mac.** `~/.ai-peer/demo-video-private/bases/tag-walkthrough-2026-11-15.mp4`
   (88.7 s, 848x528, 30 fps, silent). Never send it, a frame of it, or a crop of it anywhere: no web,
   no upload, no outside tool or model. Put every frame or sheet you extract in
   `~/.ai-peer/demo-video-private/wp7/tag-study/` (outside git), never in the repo or a scratchpad.
   No pixel of it goes into a file of the repo: everything you make is drawn by code.
2. **Its words stay out.** Its people, company, place, team, IDs and on-screen phrases may echo a real
   product. Use only the made-up story in `shared/data.js` (Ram, Staff Engineer, Host Payouts,
   Payments, Dublin, Amara Johnson, Daniel Weiss, Vikram Rao, PR #4182, INC-20431, PAY-4821, Payout
   retry v2, the Brazil launch) and WP6's own wording there (`page`, `steps`, `captionWords`,
   `learned`, `brief`, `ask`, `rules`). Never write: Maya, Chen, Fernway, Lisbon, Checkout, the job
   title "Senior Software Engineer" (or "Senior"), "Certainty" (say "Confidence"), any PR, ticket or
   channel name you read in his video. Where his video shows a phrase we have no word for, write a
   new plain phrase of your own; never copy his sentence. If you need more made-up content than
   `data.js` has, put it in your own `tag/data-extra.js`, consistent with `data.js`.
3. Do not open `~/.ai-peer/demo-video-private/ui-wow/` (a recording of a real product: not needed)
   and never look at the film's private renders.
4. Write only in `demo-video/ui-concepts/tag/` (yours), your scratchpad, and the private study folder
   above. Never edit `shared/`, another concept or the film. No paid call of any kind; nothing sent
   anywhere. Plain shell commands (no zsh tricks); never `rm -rf` a variable path.
5. Look at pictures on small sheets only: 16 to 20 frames at 320 px a frame, or a single crop when
   you need a detail. Pictures fill your context fast.

## Read first (in this order, by part)

1. `demo-video/ui-concepts/README.md` ("Make or change one") and `REPORT.md` ("Traps").
2. `demo-video/ui-concepts/BUILDERS.md`: sections "The kit (already built and proven)" and "How to
   work" (WP6's builders' brief: the kit's API, pure function of time, no timers, no random).
3. `shared/runtime.js`, `shared/kit.js`, `shared/page.js` (today's page and the pointer),
   `shared/data.js` (the story and words), `shared/icons.js`, `shared/base.css` (fonts).
4. `little-peer/`: a 2D SVG character concept in the same kit; copy its patterns (`tl.js` holds
   every time and place; `peer.js` draws the character with `draw(pose)`; the camera).
5. His video, studied frame by frame (fence 1): first one sheet of 20 frames over the whole 88.7 s,
   then sheets of each part, and crops of the mascot at full size to get its shape, colours and
   walk right.

## What his video shows (seen on one sheet; check every detail yourself)

A cream "paper" page, serif headlines, white cards with thin warm borders and soft shadows, a left
rail, small caption pills at the bottom ("SETUP 1/4 ...", "WHAT I LEARNED ...", "ASK ...",
"TRUST ...", "RETURN ..."). The mascot: a dark green rounded name tag with the person's
"<name>'s AI Peer" in white and a light "AI" pill, two big googly eyes standing on its top edge, two
short legs with feet, a soft shadow; it walks (legs stepping), it carries things, and it holds up a
card. Its parts, in order:

1. **The landing**: "Hello, <name>." with a line about the Peer and a "Set up my AI Peer" button;
   the tag stands by the button.
2. **Setup, four steps** ("Step k of 4 · ..." at the top; a "Notes" panel on the left that fills as
   it goes): step 1 reads the directory entry (a card "Directory · Your entry", the tag walks to it
   with a line from it to the card); step 2 searches as the person: one source card after another
   (documents with a count found and a list, Slack conversations, code pull requests with one
   highlighted, tickets), the tag walking from one to the next; step 3 writes what it learned (the
   cards shrink into a row, a "What I learned" panel rises, every fact with a source and date pill,
   lines join facts to their source cards); step 4 builds the first brief.
3. **What I learned** on the product page: the facts, each fact's line back to its source and date.
4. **The brief** card on the right: what needs the person today, each item with a next step.
5. **Ask your Peer**: an input, example questions, a typed question, "Thinking..." for a moment,
   then the answer with a confidence bar, an "as of" date and its sources.
6. **The trust note**: the tag holds up a big dark green card listing its rules; a close-up of the
   tag with "always labelled · read-only" under it.
7. **The return**: a later visit (the Peer is remembered in this browser), "refresh brief" reads the
   sources again, and "forget my Peer" turns it back into a plain label in the rail.

## The concept you build: `demo-video/ui-concepts/tag/`

- `concept.json`: `{ "number": 6, "of": 6, "title": "Tag", "line": "A walking name tag does the
  work on a calm paper page", "change": null, "seconds": 71, "kicker": "AI Peer · base for the
  blended video" }` (the worker adds `kicker` support to the runtime; until then the title card says
  "wow concept 6 of 6", which is fine for your checks).
- `scene.js`, `tl.js` (every time and place), `mascot.js`, `style.css`, and any modules you need.
- Ram's story, WP6's words; captions in `scene.js` from `captionWords` (and new ones in our words for
  the trust and return parts), so a standalone render reads like his video. In the film the worker
  renders it with the framing and captions off, so nothing important may live only in a caption.
- **The film's timeline is fixed** (concept seconds; the film plays 3.0 to 57.5 as its walkthrough,
  and lays its own narration on these sections, so keep each section's start and end):

| Concept s | Section | Must show |
|---|---|---|
| 0 to 3.0 | title card (runtime) | today's page under it |
| 3.0 to 5.5 | the landing | "Hello, Ram.", the tag by the button; the pointer clicks "Set up my AI Peer" at 4.4 |
| 5.5 to 8.0 | setup step 1 | the directory card, the tag walks to it, Ram's entry is read |
| 8.0 to 19.0 | setup step 2 | documents, Slack, code, tickets, mail, one after another, read as Ram; Slack, Code and Tickets each "connect once" with Ram's own sign-in (a small sheet), as in `data.js` |
| 19.0 to 22.0 | setup step 3 | it writes what it learned, each fact with a source and date |
| 22.0 to 25.0 | setup step 4 | the first brief is drafted |
| 25.0 to 32.0 | What I learned | the page; facts thread back to source and date |
| 32.0 to 39.5 | the brief | today's items, each with a next step (`brief` in `data.js`) |
| 39.5 to 50.0 | Ask your Peer | "Where does the Brazil launch stand?" typed, "Thinking...", the answer with sources, Confidence: High, as of Nov 15, 7:02 AM |
| 50.0 to 57.5 | the trust note | the tag holds up the rules card (`rules` in `data.js`, six rules); end on a calm frame |
| 57.5 to 67.5 | the return | a later visit, refresh, forget my Peer: the tag goes back to a plain label |
| 67.5 to 71.0 | end card (runtime) | |

- **Order of work** (the week's usage is tight): (1) `mascot.js` and one still of it; (2) the film's
  stretch, 3.0 to 57.5, rendered and checked; (3) the return; (4) one full render at final quality.

## The mascot module, `tag/mascot.js` (the film imports it too)

Self-contained like `little-peer/peer.js`: no imports, plain SVG, ids prefixed `tg`. Exports:

```js
export function defs(svg)                       // gradients, clip paths, filters into <defs>
export function buildTag(svg, { label = "Ram's AI Peer" } = {})  // -> { root, draw(pose) }
```

`draw(pose)` sets every moving attribute on every frame (pure: the same pose gives the same picture).
The origin is the point between its feet on the ground; at `s = 1` the tag is about 260 px wide.
Pose fields (all optional, defaults in brackets): `x`, `y` [0, 0] in px; `s` scale [1]; `alpha` [1];
`rot` degrees about the feet [0]; `sx`, `sy` squash and stretch [1, 1]; `walk` the step phase in
steps, legs swing from it [0]; `legs` how far the legs are out, 0 tucked in (a plain flat tag) to 1
[1]; `lift` px the body rises off the ground for a hop [0]; `look` [dx, dy] pupils, each -1 to 1
[0, 0]; `blink` 0 open to 1 shut [0]; `eyes` 0 hidden (a plain tag) to 1 [1]; `happy` 0 to 1 [0];
`glow` the AI pill's glow 0 to 1 [0]; `shadow` 0 to 1 [1]; and anything else you need for your
scenes (say what in your report). With `legs: 0, eyes: 0` it must read as an ordinary name tag: the
film slides it out of a phone that way, then it stands up.

## How to work

```bash
node demo-video/ui-concepts/render.mjs tag --from 3 --to 57.5 --quality draft --sheet 16   # the film's stretch
node demo-video/ui-concepts/render.mjs tag --quality draft --sheet 16                       # all of it, fast
node demo-video/ui-concepts/render.mjs tag --sheet 16                                       # final quality
```

Renders go to `renders/` (the worker commits them). A page error stops the render: fix it, never
skip the check. Compare your sheets with sheets of his video at the same moments.

## Your report (your final message)

The files you made; the section times as built; the render paths, lengths and sizes; the sheets you
checked; the weak points you saw; the mascot's pose fields; a list of every visible word or phrase
you invented that is not in `data.js`; the result of
`grep -r -i -E "maya|chen|fernway|lisbon|checkout|senior|certainty" demo-video/ui-concepts/tag/`
(expected: nothing).
