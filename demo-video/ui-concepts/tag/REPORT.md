# The tag concept: report (WP7, 15 November 2026)

Rebuilt by code from Manish's tag walkthrough (848x528, kept private in
`~/.ai-peer/demo-video-private/bases/`), by ai-peer-video-wp7's builder helper from
`../BUILDERS-WP7.md`, 16:55 to about 17:45 UTC. Written down by ai-peer-video-wp7 from the helper's
final report (its words, shortened). No frame of his video is in git; it was studied only in
`~/.ai-peer/demo-video-private/wp7/tag-study/`.

## Files

`concept.json` (with `kicker`), `mascot.js` (the tag: `defs(svg)`, `buildTag(svg, { label }).draw(pose)`;
also exports `W`, `H`, `LEG`, `STRIDE`, `colors`), `tl.js` (every time and place), `scene.js`, `paper.js`
(rail, landing, page, Ask), `room.js` (the setup room), `motion.js` (the tag's choreography), `u.js`,
`data-extra.js` (every invented word), `style.css`.

## Section times as built (concept seconds; the brief's table holds)

| Seconds | Section | Beats |
|---|---|---|
| 3.0 to 5.5 | the landing (his paper design, not the shared `todayPage`) | the click at 4.4 |
| 5.5 to 8.0 | setup step 1 | the directory |
| 8.0 to 19.0 | setup step 2 | Docs from 8.0; Slack from 10.0 (its Connect click 11.02); Code 12.9 (13.74); Tickets 15.2 (15.98); Mail 17.4 |
| 19.0 to 22.0 | setup step 3 | |
| 22.0 to 25.0 | setup step 4 | the room turns into the page over 24.4 to 25.25 |
| 25.0 to 32.0 | What I learned | |
| 32.0 to 39.5 | the brief | |
| 39.5 to 50.0 | Ask your Peer | typing 41.1, "Thinking" 43.0, the answer 45.5, the stamp 48.4 |
| 50.0 to 57.5 | the rules | a calm frame from 55.8 |
| 57.5 to 67.5 | the return (standalone only) | refresh 61.85, forget 64.06, a plain label by 66.1 |

In the film (`make_cut.py tag`), walk-setup maps concept c to film 24.7 + (c - 5.5) / 1.043: the
Connect clicks land at film 30.0, 32.6 and 34.75, under the "connect once" label (30.6 to 34.2).

## Renders (`../renders/`)

`tag.mp4` (71.0 s, 9.5 MB, final quality, with title, captions and end card), `tag-sheet.png`,
`tag-clean.mp4` (71.0 s, 20.4 MB, `--no-framing`, delivery, crf 14: the film's clip).

## Mascot pose fields

The briefed ones (`x y s alpha rot sx sy walk legs lift look blink eyes happy glow shadow`), plus
`stride`, `dir`, `bob`, `idea` (an amber bulb), `zz` (sleep Zs), `wide`, `squint`, `wink`, `card` (the
body grows into the rules card) and `back` (the label hidden). With `legs: 0, eyes: 0` it is a plain
name tag.

## Weak points (seen by the helper on its sheets)

- Step 2's pans are fast (five sources in 11 s): the tag scurries at 7.5 steps a second and its feet
  slide on the floor.
- Some text is small: the step times (11.5 px) and the skipped-item chips (12.5 px).
- The turn into the rules card is a flat flip, not 3D.
- His three project cards and his Slack "posts by agents left out" are not drawn (no room).
- Standalone only: during the brief's zoom the runtime's corner tag sits over the Mail chip.

## Invented visible words (all in `data-extra.js`; check them before anything leaves this repo)

Setup: "out reading as ram", "always labelled as AI · it only reads", "Reading as ram · read-only",
"Source N of 6 · read-only", "reading…", "needs sign-in", "read", "Reading as Ram…", "Notes", "it only
reads · nothing is changed", "1 entry · read as Ram", "Needs your sign-in", "Connect Slack/Code/Tickets",
"read-only · private to you", "and N more", "not shared with Ram", "3 skipped, never opened",
"in 14 days", Role/Team/Org/City/Manager. Page, Ask and rules: "Hello, Ram.", "Updated Nov 15 · kept in
your browser", "Refresh brief", "Set up again", "Forget my Peer", "Your brief · Nov 15", "Next", "Type a
question about your work", "Ask", "Thinking…", "Reading your sources again, as Ram", "Ram's AI Peer ·
AI", "Confidence", "High", "Sources", "Ram's AI Peer · how it works". Next day: "Mon, Nov 16 · 8:40 AM",
"Updated Nov 16, 8:41 AM · kept in your browser", "Your brief · Nov 16 · refreshed", "Erased from this
browser. Set it up again any time." Captions: "The next day, your Peer is still here, kept in this
browser", "Refresh brief reads your sources again, as you", "Forget my Peer erases it, and the tag is a
plain label again" ("It suggests, and you choose" is `data.js`'s own). Caption kickers: Start, Setup
k/4, What I learned, Your brief, Ask your Peer, How it works, Next day. Some of these echo the product
wording his video showed (for example "Refresh brief", "Forget my Peer"): ai-peer-video-wp7-2 runs the
controller's `privacy-check.sh` on them before the PR.

## Privacy grep

`grep -r -i -E "maya|chen|fernway|lisbon|checkout|senior|certainty" demo-video/ui-concepts/tag/`
finds nothing (the helper's run).
