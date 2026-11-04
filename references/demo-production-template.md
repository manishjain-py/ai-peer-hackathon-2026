# Reusable production template for the hackathon demo

Research date: 18 September 2026. This is an implementation recommendation, not an assertion about how the reference videos were made. The companion video-reference-study.html supplies direct visual observations. Exact software and source-project workflows cannot be established from the finished pixels alone.

## Recommended approach

Use **React + TypeScript + Remotion**, with SVG artwork and carefully reconstructed product UI. Put narration, music and effects on the same frame timeline. This is especially practical for an agent-assisted project: text, colors, scene timing and interface states remain editable in code; re-rendering gives repeatable results. Remotion renders React components from a frame number, with explicit dimensions, frame rate and duration. [Remotion fundamentals](https://www.remotion.dev/docs/the-fundamentals)

Working baseline: **1920 × 1080, 30 fps, 120 seconds / 3,600 frames**, H.264 MP4 delivery. Choose 60 fps only if motion tests show that it materially helps; it increases the number of rendered frames. Design at the final aspect ratio from the start. These are production recommendations, not measurements of the reference files.

Build the video around one credible end-to-end task, ideally with three decisive product actions. A polished demo usually needs designed UI states rather than a literal recording of every loading delay, scroll and mouse hesitation. Reuse real product components or screenshots where useful; rebuild the key shot as vector/HTML layers when it needs resizing, reflow, independent movement or exaggerated focus. Any aspirational feature should be presented honestly as a concept.

## Tool roles and boundaries

| Tool | Useful role | What to keep in mind |
|---|---|---|
| Remotion | Complete timeline, exact UI/text animation, scene transitions, audio, repeatable MP4 export | Every visual must derive from video time; loading and randomness need to be controlled. |
| SVG + CSS inside React | Icons, underlines, masks, paths, cards, diagrams, simple mascots | Native shapes and text stay crisp through zooms. A screenshot only preserves its source detail. |
| Rive | Optional character rig or reusable animated illustration | Runtime interactivity and a fixed movie are different deliverables. Keep video animation explicitly timed. |
| After Effects | Optional artist-driven character animation, complex shape morphs, compositing and motion polish | Excellent for hand-tuned keyframes; adds a separate desktop authoring workflow. Not required for our code-first route. |
| GSAP | Optional complex staggered timelines | The current official `@remotion/gsap` adapter pauses and seeks GSAP to the Remotion frame for deterministic output. Default wall-clock playback is unsuitable for arbitrary video-frame rendering. [Adapter docs](https://www.remotion.dev/docs/gsap/) |

**Rive specifics:** its runtime is built for interactive animation. Its paid editor export supports H.264, WebM and PNG/SVG sequences. Remotion's `RemotionRiveCanvas` can synchronize a named linear Rive animation with the video timeline. The documented component is not a general state-machine recording system; do a small integration test before relying on interactive Rive logic. Simple blink/bob/wave mascot animation can be authored directly in SVG without adding Rive. [Rive exports](https://rive.app/docs/editor/exporting/exporting-for-video-and-static-design), [Remotion Rive component](https://www.remotion.dev/docs/rive/remotionrivecanvas)

**After Effects equivalents:** shape layers for cards/icons, Trim Paths for drawing lines, animated masks for text reveals, parenting/precompositions for coordinated zooms, the Graph Editor for custom acceleration, and selective motion blur on quick movement. These are available techniques, not evidence that a reference producer used them. [Shape operations](https://helpx.adobe.com/after-effects/desktop/drawing-painting-and-paths/shapes-and-shape-attributes/shape-attributes-paint-operations-path.html), [Graph Editor](https://helpx.adobe.com/after-effects/desktop/animate-in-after-effects/speed-between-keyframes/speed.html), [Motion-blur controls](https://helpx.adobe.com/after-effects/desktop/work-with-compositions/composition-settings/composition-basics.html)

## Animation recipes

The values below are starting points to tune by eye at 30 fps, not timings measured from the videos. Maintain one focal action at a time, and leave a readable hold after each reveal.

| Effect | How to build it | Initial timing |
|---|---|---|
| Kinetic headline | Each word in a clipped wrapper; translate it vertically and fade it in. Use small word offsets rather than animating all letters constantly. | 12–18 frames per arrival, 2–4 frames stagger; hold 1.5–3 s. |
| Crisp card entrance | Translate 24–48 px, scale about 0.96 → 1, fade 0 → 1; use strong deceleration or a restrained spring. | 12–20 frames; related cards offset 3–5 frames. |
| Hero UI reveal | Reveal a panel through a mask while the surrounding frame moves into position; animate the content slightly later. | 18–30 frames, content delayed 4–6 frames. |
| Camera push into a detail | Put UI inside one parent container. Animate its scale and translation around the destination detail. Keep text readable at the final framing. | 18–30 frames; hold the close-up 2–4 s. |
| Cursor-led explanation | Animate a separate pointer along a curved path. Pause on the target, apply a brief press/ripple, then show the response. | Travel 12–24 frames; pause 5–8; press 3–5. |
| Text generation | Reveal prepared content by words/lines; accompany only some events with subtle typing sound. | 1–2 s for the useful result, followed by a reading hold. |
| Line draws / connectors | Animate SVG stroke-dashoffset along a known path, then reveal the destination node. | 12–24 frames per connection. |
| Match transition | Preserve one object between scenes: a card grows into the next workspace, or a selected item moves to the next view. Animate its geometry and content separately. | 15–24 frames; avoid a cut that changes its position unexpectedly. |
| Lively mascot | Separate eyes, hands, body and shadow; small squash/stretch, anticipation and delayed hand motion. | 4–6 frame anticipation, 10–16 action, 8–12 settle. |
| Outcome / payoff | Stop moving the UI; reveal one result or comparison. Give the audience time to understand it. | 2–4 s stable hold, more for multiple figures. |

Use smooth ease-out on entrances and ease-in/out on camera repositioning. A spring is useful when it conveys a soft, playful material; avoid bouncing everything. Motion blur is an accent for quick translation or zooming, not a persistent blur on readable UI. Remotion offers `interpolate`, `spring`, scene transitions and motion-blur components. [Animating properties](https://www.remotion.dev/docs/animating-properties), [Spring](https://www.remotion.dev/docs/spring), [Transitions](https://www.remotion.dev/docs/transitions/), [Motion blur](https://www.remotion.dev/docs/motion-blur/)

One implementation trap: Remotion transitions overlap adjacent scenes and reduce total running time; an overlay at a cut does not. Budget the final movie to 3,600 frames after transition overlap, not by adding scene durations alone. [Transition timing rules](https://www.remotion.dev/docs/transitions/transitionseries)

## Sound and narration

1. Write a voiceover draft of roughly **210–240 words** for two minutes, allowing pauses for the UI to land. This is a planning range, not a rule: record a scratch read and time it.
2. Make a rough animatic with plain cards, scratch narration and temporary music. Adjust the story before polishing animation. Once the final voice is recorded, place emphasis and scene changes on the actual spoken phrases.
3. Choose instrumental music with a clear pulse, restrained arrangement and a usable ending. As a first exploration, try 95–115 BPM; the reference's exact tempo needs listening or measurement. Place large scene changes on musical phrases where they fit the narration; do not force every click onto a beat.
4. Keep three separate stems: voice, music, effects. Start music roughly 15–22 dB below speech and adjust by ear; source loudness varies, so a fixed volume slider is not a reliable mix target. Duck music during dense speech, lift it during silent reveals, and listen at low volume on laptop speakers.
5. Use a small sound vocabulary: gentle click for action, short whoosh for travel, soft impact for arrival, sparse tonal cue for success. Match sounds to meaningful events; constant clicking or swooshing quickly becomes tiring.
6. Leave a short music-only opening or closing when helpful. End with a musical resolution and a readable final card, rather than an arbitrary fade halfway through a phrase. Use original or appropriately licensed audio instead of extracting music from the references.

Current Remotion audio documentation recommends `Audio` from `@remotion/media`. It supports frame-positioned clips, trimming and frame-by-frame volume curves, so fades and ducking can be encoded precisely. The older `Audio` from `remotion` is now called `Html5Audio`. [Audio documentation](https://www.remotion.dev/docs/media/audio)

## Reusable two-minute story skeleton

| Time | Purpose | What the audience sees |
|---|---|---|
| 0–12 s | Recognizable problem | One concrete messy workflow, with a short punchy headline. |
| 12–25 s | Promise and product reveal | Name + one-sentence value; the central UI enters. |
| 25–48 s | Action 1 | Input/context arrives; show the specific user's starting point. |
| 48–73 s | Action 2 | The distinctive capability does useful work; zoom in on the key change. |
| 73–95 s | Action 3 | Result moves into a usable workflow or reaches the next person. |
| 95–110 s | Proof of value | Before/after or a believable measured result; explain why it matters. |
| 110–120 s | Memorable close | One benefit, product name, final sentence and musical ending. |

The final script should change this allocation to fit the idea; a feature list should not dictate the edit.

## Production order and quality checks

Idea → one-sentence promise → script → storyboard → narrated rough animatic → 2–3 fully styled test shots → complete animation → sound mix → full viewing and corrections → final export.

Build reusable scene components such as `Headline`, `ProductWindow`, `Cursor`, `Callout`, `Camera`, `Connector`, `Mascot` and `EndCard`. Store scene copy, durations, cursor targets, highlights and audio cues in a simple scene manifest. That gives us a reusable template without locking the future idea into the reference brands.

Check full playback as well as sampled stills: no clipped text, missing fonts, illegible microcopy, unexplained jumps, silent gaps, overly fast reading or narration masked by music. Review the main UI shots at presentation size and with audio off. The audience should still understand the core story. Check that the exported MP4—not only the browser preview—has the correct duration, sync and final card.

The hard work is art direction, explanation and timing. A rendering framework makes precise revisions possible; it does not make a two-minute film polished automatically. Hand-drawn frame animation and elaborate character performances take additional art effort. AI-generated background art can be useful, but exact product text and changing interface states should stay authored and editable.

## Reference-specific decisions

Use Slack Canvas as the narrative model: keep one task and one document/result through the middle. Borrow Notion AI’s short benefit cards, focused UI camera moves, restrained colour changes and crisp typography. Avoid filling 120 seconds with disconnected feature cards.

Audio was reviewed using extracted soundtracks, local speech recognition and signal analysis, not direct listening. Slack yielded approximately 190 words, with narration ending around 83.85 seconds; Notion had an active soundtrack with no speech detected. Exact music, instruments and beat synchronisation remain unverified. Use 210–240 words as a first draft budget, then time a scratch read.

Confirmed production evidence: BUCK documents cel animation and Rive for Notion’s product character (https://buck.co/work/notion-ai). Greyduck documents motion design, voiceover, sound design and mixing for a Canvas launch film (https://www.greyduck.tv/case-studies/slack-canvas), but the exact version match with the supplied YouTube cut is unverified. Neither source confirms the complete reference film’s editing application.

## Shot manifest fields

For each shot, record: identifier; start/end frame; story purpose; voiceover; on-screen headline; input UI state; cursor/action cue; result UI state; camera target; transition anchor; asset paths; music/effect cues; minimum readable hold. Keep the voice, music and effects as separate tracks.

The seven story beats are not necessarily seven shots: a beat may contain a headline, a context view and a close-up. Budget the total duration after transition overlaps.

## TLDR

Build one clear user story, with editable UI layers and a frame-based timeline. Establish the voice and rough timing first; then refine motion, sound and final export. The next input is Manish’s idea and its strongest visible outcome.
