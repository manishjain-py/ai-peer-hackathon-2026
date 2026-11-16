# Moss full blended film, 16 November 2026

Manish's selection after the generated mascot exploration (V33). Recorded at 15:11 UTC.

## His words

> Okay, let's try to use MOS and let's try to create the new blended video with MOS instead of tag. And then give me the final two minutes video. I would like to see how that comes out finally in the final video. Is the ask clear?

## Decision and scope (V34)

"MOS" refers to **Moss, Round 2 option 25**. Create a complete new blended movie with Moss
replacing the Tag everywhere. This is the full approximately two-minute film for Manish's
review, not another short audition. Keep the approved Tag v2 story, timing, camera moves,
layout, words, voice and music. Preserve that approved master and every earlier artifact.

The output is a new `blended-moss-v1` cut, preferably the same 119.6 seconds at 1920×1080,
30 fps, with a smaller 720p Telegram copy. Until Manish reviews it, Tag v2 remains the last
approved full movie; Moss is the chosen candidate for this new full-film version.

## What must be covered

- Phone-to-desk entrance and its original choreography; Moss stays a clearly labelled AI.
- **The entire product walkthrough**, rebuilt from source: landing/setup, source reading,
  learned context, brief, Ask, rules and every mascot interaction. The old baked Tag
  walkthrough must not remain in the middle of the new movie.
- All avatars, badges, small marks, speech/caption icons, meeting tile and Slack identity.
- The morning room/desk, return to the phone, paper morning brief, globe and closing logo.
- Preserve UI content and function. Where the Tag's body physically becomes a card, adapt
  that mascot-specific action sensibly for Moss while keeping the card, text and timing.

Moss's approved exploration assets are in `demo-video/mascot-exploration-v2/`:
`images/25-moss.png`, `cutouts/25-moss.png`, `motion/25-moss.webm`, its avatar and metadata.
The original second motion pilot was selected for its real wave, head tilt and closed-eye
smile. The exploration renderer already proves Moss in four original scene contexts, but
does not implement the full setup/rules walkthrough. Read its README and completion handoff.

## Working method and money

One fresh controller takes over from the completed exploration controller, whose measured
context was 46.8% before wrap-up. It owns this task end to end and may use **one** implementation
worker at a time. Use the saved repository context; the parent chat only relays progress and
the final result. One worktree, branch and PR for this package; docs-only changes go to main.

Reuse the existing generated Moss art/motion wherever suitable. Additional identity-preserving
Moss gestures may be generated through the previously authorized Gemini/fal.ai route if the
walkthrough needs them. Outside tools receive only generic mascot art/descriptions, never
product screens or private content. Check the first new gesture before batching.

Controller allocation: at most **$10 new paid generation** for this cut, inside the existing
$100 project cap. Current project cost is $48.906079. Keep a separate ledger and notify Manish
when the project crosses $50 (C5), without treating that informational milestone as a new
approval request. No subscription purchase. No private recordings are needed.

## Completion

Inspect the whole encoded cut at every scene and mascot transition, including the full
walkthrough. Verify the Tag is fully replaced, Moss is consistently labelled and readable,
and the audio/timing match the base. Save contact sheets, metadata and manual-walk evidence;
no unit tests or CI. Do not claim direct audio listening if unavailable.

Commit/push all source and selected assets; create and attach one PR, merge after the visual
walk. Save a checkpoint for `blended-moss-v1`. Send the complete small video to the established
Telegram Attention group (the continuing delivery workflow is authorized), then a concise
review message. Update STATE, delivery receipts and handoff; no new mascot approval is assumed.
