# AI Peer demo video: plan for the first draft

The story is `STORY.md` ("He's asleep. I'm not."), approved by Manish for a first draft on
2026-11-14 (`DESIGN.md` V10). He wants to see it end to end. At most two workers at once (the
repo's rule), plus the controller.

## Packages

| Package | Session | What | Money cap | Needs first |
|---|---|---|---|---|
| WP1 | `ai-peer-video-wp1` (running) | The look: employee A, the night-room frames, the clone shot three ways, a verdict on the best way. | $15 | nothing |
| WP2 | `ai-peer-video-wp2` | The film in code: the timeline, the parts made by code (the Earth close, the night clock, title chips, captions, the end card, the tag on the double), the polish of the product screens, voices, music, sound, the mix, and the assembly of Draft 1. | $10 | nothing |
| WP3 | `ai-peer-video-wp3` (after WP1 ends) | The AI shots with people, about nine: three colleagues for the hook, the sleeper, the rise, the walk and sit, the wake, the brief, the nod. Stills first, cheap drafts, then finals. Made the way WP1's verdict says. | $60 | WP1's `REPORT.md` |
| WP4 | later | The real company recordings into the cut (private folder, `DESIGN.md` C8), once Manish brings them; then his changes after he sees Draft 1. | $0 | Manish's recordings, his feedback |

Reserve: $15 of the $100.

## Order

1. Now: WP2 starts beside WP1. Its first milestone is voice samples for Manish's ear and a
   full-length animatic with labelled slates where shots are missing.
2. When WP1 reports: the controller reads its `REPORT.md`, shows Manish the side-by-side clone
   clip, writes WP3's brief from the verdict, closes WP1 and starts WP3.
3. WP3 hands each finished shot to WP2 through its manifest. `SHOTS.md` is the shared list: the
   nine slot ids, their lengths, the colleagues' lines, and the manifest's path and fields.
4. Draft 1 is done when WP2's render plays end to end with every part present. The controller
   looks at a frame at every cut, then sends it to Manish.

## Proof for Draft 1

- It plays end to end, 1080p, at most 2:00, with the Peer's voice, captions and music.
- All five parts of `STORY.md` are there. A missing shot shows a labelled slate, never a gap.
- The product part uses the stand-in recordings of 6 November (demo data) until the real ones
  arrive; nothing from `~/.ai-peer/` is committed.
- Each spoken line was checked by speech-to-text ("Peer" is often heard as "pier").

## What Manish must bring (asked on 2026-11-14)

Recordings from his company laptop, by Tuesday 17 November morning (India time), into
`~/.ai-peer/demo-video-private/` on this Mac: the meeting (the Peer joins, says it is an AI,
gives his update, answers one question, brings a decision back to him), with its sound; Slack
at night (a colleague's question, the Peer's answer with sources and no promise); the other
direction (a change elsewhere caught for him); the morning brief with the one thing that needs
him. Full screen, no other notifications, slow mouse.
