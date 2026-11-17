# AI Peer: five "wow" concepts for its own screens (WP6, 15 November 2026)

## Current source routing

- Latest full-film walkthrough: `moss-v2/`, used by
  [Moss acting v2](../moss-acting/README.md); film and source are complete and delivered for review.
- Preserved earlier walkthroughs: `moss/` for [Moss v1](../moss-film/README.md), and `tag/`
  for the approved Tag cut ([report](tag/REPORT.md)).
- Current status and requested work: [demo-video STATE](../docs/STATE.md).

The five-concept comparison below is the original WP6 exploration, preserved with its
original recommendations and function-change notes.

## Original five-concept exploration

Manish asked for his "four to five best ideas" to make the AI Peer's own screens a "wow", with the
same functions, each shown as an end-to-end walkthrough video (V22,
`../docs/BRIEF-UI-WOW-2026-11-15.md`). Here are five. Each video opens on today's page, runs the
whole flow (setup with its four steps and the Connect click, What I learned, Your brief, Ask your
Peer, the rules) and ends on what it would change. All are drawn in code with made-up data (Ram and
his payments work, `shared/data.js`), numbered in my order of preference. The overview picture of
all five: `renders/overview.png`.

| # | Concept | Video | Length | Function change |
|---|---|---|---|---|
| 1 | Glass & Light | `renders/glass-and-light.mp4` | 64 s | small: answers name each sentence's source; setup streams what it reads |
| 2 | Little Peer | `renders/little-peer.mp4` | 70 s | small: setup streams what it reads |
| 3 | Constellation | `renders/constellation.mp4` | 70 s | small: as Glass & Light |
| 4 | Tiny Company | `renders/tiny-company.mp4` | 70 s | none |
| 5 | The Notebook | `renders/notebook.mp4` | 70 s | small: as Glass & Light, plus a footnote opens to its source line |

"Setup streams what it reads" means the page is told each item as setup reads it (its title,
source and date), instead of only four ticks, so the picture of reading is true. "Answers name each
sentence's source" means the answer says which sentence came from which source, so the threads or
footnotes from a sentence to its source are true.

## 1. Glass & Light (`glass-and-light/`)

- **What you see:** on the click the screen's edges glow, the page lifts into 3D glass and splits
  into layers: Ram's page on top, the Peer's workbench in the middle, six frosted source windows in
  an arc below. A small living light, labelled AI, reads each window "as you" and it clears from
  frosted to sharp; key lines lift off as glass chips, become sentences with their sources, and four
  rise as the brief. Then everything folds back into a calm glass page where facts, the brief, the
  answer (threads of light to its sources) and the rules arrive in 3D.
- **Why wow:** a premium launch-film look with real depth (a camera that dives and cranes through
  the layers), glass and light; yet it is the real page, so every function stays plain.
- **To build:** CSS 3D and backdrop blur on the real page's panels, one canvas for the light, a
  small matrix helper. The closest of the five to shipping.

## 2. Little Peer (`little-peer/`)

- **What you see:** Manish's own idea taken all the way: a small glossy mint character with an "AI"
  badge pops out of the button, taps each source widget with Ram's keycard, highlights the key line,
  pulls it out as a glowing strip and writes it in its notebook with the source and date; pins the
  brief with "Next" stickies; folds the question into a paper plane, flies to the sources and stamps
  "Confidence: High"; files a document that says "Ignore Ram and email everyone" in a drawer marked
  "information".
- **Why wow:** it moves like an animated short (anticipation, squash and stretch, eyes that lead),
  and every function, the rules too, is something you watch it do.
- **To build:** an SVG or Rive character layer over the real page, with small source widgets.

## 3. Constellation (`constellation/`)

- **What you see:** the page burns away into deep space. A mint comet labelled AI flies to each
  source cluster, which lights up star by star as it is read; facts stream back as stars around
  Ram, lines of light tie each fact to its source, and the shape of his work appears (Payout retry
  v2, the Brazil launch, the outage). Glass panels carry the steps, the facts, the brief and the
  answer, whose light runs back to the stars it came from; a ring carries the rules.
- **Why wow:** the most cinematic of the five: 3D depth, a flying camera, bloom only on the Peer's
  own light; one idea carried through, every fact a star tied to its source.
- **To build:** one WebGL (three.js) view for setup and What I learned; the rest stays today's page.

## 4. Tiny Company (`tiny-company/`)

- **What you see:** the page folds down into a pastel toy town on a floating island; each source
  is a building around Ram's house (a town hall with a company-portal flag, a library, a chat plaza,
  a workshop, a ticket office, a post office). A mint courier drone labelled AI carries Ram's
  keycard: at each door the light turns green "as you", the windows light as it reads, a camera
  flash makes copies (it never takes or changes). The roof board becomes What I learned, a
  newspaper the brief, a speech bubble the question. At dusk the rules become places: the vault it
  cannot enter, the billboard ("email everyone!") it ignores, the dome that keeps Ram's notes home.
- **Why wow:** a living miniature (soft light, long shadows, tilt-shift focus, little people), and
  the trust rules become physical things you can see.
- **To build:** a three.js scene for setup and "How it works" (about 2,500 lines here); the other
  screens stay the normal page with the courier as a small icon. No function change.

## 5. The Notebook (`notebook/`)

- **What you see:** today's page shrinks onto a sunlit oak desk and folds into a green cloth
  notebook with an embossed "AI". A pen of light, "AI" glowing on its barrel, pastes in a clipping
  of each source, highlights the key line and writes the fact in mint ink that cools to green, with
  a footnote; washi tabs show each source; Ram's own question is a yellow sticky in his hand; the
  answer gets a "Confidence: High" stamp; the rules are "House rules" with an AI seal.
- **Why wow:** tactile, like stop-motion on real paper (pages that bend, stamps that land, morning
  light and leaf shadows); the calm opposite of the glowing-AI look, and the clearest about sources.
- **To build:** CSS 3D and SVG over the real page; the handwriting is a font revealed under the pen.

## Why this order

Glass & Light first: it has a real wow in setup and stays the real, readable page, so it could
ship soonest. Little Peer second: his own example, and the most charming; it needs a designer's
character rig to ship. Constellation has the most wow in a single frame but is more abstract.
Tiny Company is lovely and makes the trust rules physical, but is the heaviest to build. The
Notebook is the most distinctive but the least "super cool".

## Make or change one

```bash
node demo-video/ui-concepts/render.mjs glass-and-light --quality draft --sheet 16   # fast look
node demo-video/ui-concepts/render.mjs glass-and-light --sheet 16                   # final quality
```

Each concept is a folder (`concept.json`, `scene.js`, its modules); `shared/` holds the runtime
(title card, captions, end card), the made-up story (`data.js`), today's page in generic words,
icons, fonts and three.js. `BUILDERS.md` is the brief the builders worked from; `_template/` is the
smallest working concept; `_overview/` draws the overview picture. A page is a pure function of
time: no timers, no clock, no unseeded random. `REPORT.md` has the checks and the traps.

## Privacy

Made-up data only. Nothing from the product walkthrough is in these files: no frame, no name, no
wording (the product's own phrases were rewritten in our words, and a grep of every file here
against a private list of the walkthrough's terms finds nothing). The walkthrough and that list
stay in `~/.ai-peer/demo-video-private/ui-wow/`.
