# WP6 report: the five wow concepts (15 November 2026)

By ai-peer-video-wp6 (Opus 5.5), 13:19 to about 16:30 UTC, from the brief
`../docs/handoffs/HANDOFF-2026-11-15-ai-peer-video-wp6.md`. The pitches and the order are in
`README.md`; this is how they were made, what was checked, and what to know next.

## How

1. **The recording** was looked at once, as one sheet of 20 frames, kept in the private folder.
   It gave the product's shape (one white page, a left rail, four ticked steps, cards); nothing
   from it went into a file here.
2. **The kit** (`render.mjs`, `shared/`): one page per concept whose picture is a pure function of
   the time, rendered frame by frame by the film's pinned renderer (`hyperframes@0.9.45`), checked
   for page errors first, packed to H.264, with small sheets for looking. A 12 s test rendered in
   8 s; each 64 to 70 s concept renders in 45 to 80 s.
3. **Research** by one read-only helper with web search: how the best products show an AI at
   work, motion and 3D that make people say wow, and how to render it frame by frame
   (`../research/ui-wow-inspiration-2026-11-15.md`, 54 links).
4. **Five builder helpers**, at most three at once, each on its own folder from one shared brief
   (`BUILDERS.md`), each told never to open the recording. The worker looked at every final sheet
   (16 frames at 320 px) and at one sheet of the moments where the wording changed.

## Checks

| Concept | Length | Size | Sheet checked | Function change named |
|---|---|---|---|---|
| Glass & Light | 64.0 s | 18 MB | yes | answers name each sentence's source; setup streams what it reads |
| Little Peer | 70.0 s | 18 MB | yes | setup streams what it reads |
| Constellation | 70.0 s | 28 MB | yes | as Glass & Light |
| Tiny Company | 70.0 s | 22 MB | yes | none |
| The Notebook | 70.0 s | 26 MB | yes | as Glass & Light, plus footnotes open to their source line |

All are 1920x1080 at 30 fps, silent, with captions, a title card and an end card that names the
function change. Four run 70 s rather than the planned 64 (the brief allowed up to 75) to give
the rules or the three Connect clicks time.

**Privacy.** The first draft of the shared data used some of the product's own wording as seen in
the walkthrough (the four step names, the rule sentences, three captions, and a role that matched
the real person's). No names, projects, channels or links, but still its words: all were rewritten
in our own words (Ram became a staff engineer; "Certainty" became "Confidence"), the four finished
concepts were re-rendered and their sheets remade. A grep of every file here against a private list
of 67 terms from the walkthrough (`~/.ai-peer/demo-video-private/ui-wow/real-terms.txt`) finds
nothing. No picture here comes from the recording.

## Weak points (from the builders, seen on the sheets)

- **Glass & Light:** the workbench rows are seen at an angle and read squashed (17 to 21 s); Code,
  Tickets and Mail go by fast and small; the brief's 3D stack shows for about a second.
- **Little Peer:** the board in step 4 is too small to read (it reads fully from 36 s); half a second
  is busy as the widgets fold into the sources line; it shakes its head before filing, not after.
- **Constellation:** only two or three of the six rules light as they pass the front; the light
  into the answer is flat 2D.
- **Tiny Company:** the courier is small in the wide shots; the billboard's own text is small.
- **The Notebook:** steps 3 and 4 appear as a fast cascade rather than pen strokes; the riffle is
  three pages; a few clipping details are 15 to 16 px.

## Money and time

$0.00 of the $10 cap: everything was drawn in code (no paid picture or clip). The film has spent
$41.43 of $100. About three hours from read-in to delivery.

## Traps (for anyone who builds another concept)

- WebGL is drawn in software in this renderer: multisampling costs about 175 ms a frame; use FXAA
  and half-resolution blur passes.
- Call `updateWorldMatrix()` before `localToWorld()` or any projection of 3D points for labels;
  otherwise a frame depends on the one before, which breaks out-of-order rendering.
- CSS backdrop blur under moving 3D transforms rendered cleanly here (tested: identical frames on
  two renders), but blur nested inside a transformed parent blurs only that parent's own content:
  give each glass panel its own element and transform.
- In CSS 3D, `overflow: hidden`, `opacity` or `filter` on a container flattens everything in it.
- Sort 3D cards by depth with an offset for big panels, or small cards near a panel's edge vanish.
- Labels placed from 3D points drift under fixed panels: check overlaps and safe areas with a
  numbers-only script (load the build on localhost, read element boxes) instead of pictures.
- Namespace class names: an ink class named `card` collided with a card element's class.
- This Mac's ffmpeg has no `drawtext`; label sheets another way. An `rm -rf` on a variable path is
  refused by the safety check: use literal paths or let ffmpeg overwrite.

## If Manish picks one

1. Setup streams each item it reads to the page (its title, source and date): needed by four of
   the five, and useful on its own.
2. Answers return which sentence came from which source: needed by three.
3. Then the visual layer on the real page, starting with setup and "How it works", where the wow
   matters most; the other screens can keep today's layout with the concept's look.
