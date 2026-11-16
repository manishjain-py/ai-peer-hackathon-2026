# Round 2 mascot exploration: complete, 16 November 2026

Manish's V33 request is complete: **25 generated-art mascot directions**, each shown in the
approved film's original scene context. All designs, enlarged portraits, all 25 individual
previews and a 75-second quick-look reel were delivered to the established Telegram Attention
group. No new mascot has been selected; the approved full Tag film remains unchanged.

## Review the work

- [Gallery](../mascot-exploration-v2/index.html)
- [75-second quick-look](../mascot-exploration-v2/renders/quick-look-75s.mp4)
- [All 25 designs](../mascot-exploration-v2/renders/overview.jpg)
- [Report, source methods and rebuild instructions](../mascot-exploration-v2/README.md)
- [Prompts and generation requests](../mascot-exploration-v2/requests/)
- [Delivery receipts](delivery/mascot-round2-2026-11-16.json)

The controller's pick after inspecting all 25 in the film is **22 Quill**: a clear, friendly
porcelain face with folded-paper quills that fit the interface. The other strongest directions
are **03 Mallow** (the happiest personality), **25 Moss** (warmth and expressive character)
and **16 Ember** (the reassuring nighttime glow). These are recommendations, not a user decision.

## What was made

25 separate 2K images were generated through the user's authorized Gemini account, following
the API/cutout approach found by reading Learn Like Magic's image-generation code. That repo
was kept read-only. Fal.ai produced the transparent cutouts and 23 chosen character-animation
takes. Nori (05) and Dew (15) retain their generated still artwork with gentle composed motion
to preserve the glass-like material; their previews state this distinction.

Each individual preview has 23.3 seconds of picture: a three-second introduction, followed by
the same original entrance, Zoom update, paper morning brief and closing mark. The sampled
scene layouts, timing, dialogue, captions and music remain intact. All 25 introductions also
form a 75-second quick-look with the approved instrumental bed and quiet fades.

There are **52 video exports**: 25 individual previews in 720p and 1080p, plus the quick-look
in both resolutions. The gallery includes portraits, material/motion filters and players.
The full setup walkthrough and complete 119.6-second film are not replaced in this exploration;
that integration follows the user's choice.

## Proof and preservation

- All 52 exports passed full decoding, dimensions and frame-count checks. Individual previews
  have 699 picture frames; the quick-look has 2,250. All are 30 fps H.264/AAC.
- All 23 chosen alpha sprites have nonempty alpha on every decoded frame. A magenta fringe
  was corrected before final rendering; complete sections of the Sora/Manta takes keep wings
  and tails framed. Each character's motion and encoded scene sheet was inspected.
- The controller independently inspected all 25 encoded scene sheets, small-avatar framing,
  the corrected alpha sample and the complete quick-look contact sheet. Direct audio listening
  is not claimed. The gallery's desktop/mobile, filtering, players and local links were checked.
- Inputs were newly generated character art and the already-public fictional demo assets.
  No private recording or company content was sent to a generation service. The unavailable
  private-term-list check is not claimed as a pass; provenance and changed files were inspected.
- Approved Tag master SHA-256 remains
  `7756283021b7237605337f079e435babb25143c2fb1d9023e6b70204a952b039`.
  The original film sources, product and first twelve mascot options are unchanged.
- [PR 17](https://github.com/manishjain-py/ai-peer-hackathon-2026/pull/17) was squash-merged as
  `716b229480f0176b26447ed13d4e6daac6e7e681`. Checkpoint: `generated-mascots-v1`.

## Delivery and cost

The still overview and enlarged groups were delivered first. All 25 individual scene previews
were delivered by 14:48:53 UTC, the quick-look was confirmed delivered by 14:52:18 UTC, and the
final recommendation was sent at 14:52:43 UTC (Telegram message 23086). The receipt file records
the numbered video albums and returned message IDs.

New generation cost: **$6.826079**, comprising $1.566079 estimated Gemini cost from reported
usage and $5.26 conservatively logged fal.ai cost. Project total: **$48.906079 of $100**.
No paid calls remain. The $50 notification mark was not reached.

## Next

Await Manish's preferred Round 2 number or shortlist. Record his exact words as the next DESIGN
decision before applying the choice across the full film. Keep both explorations and the
approved Tag master. Completion handoff:
`handoffs/HANDOFF-2026-11-16-generated-mascots-complete.md`.
