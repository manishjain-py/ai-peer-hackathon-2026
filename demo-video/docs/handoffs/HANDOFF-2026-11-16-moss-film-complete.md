# Moss full film: implementation complete

16 November 2026, 16:17 UTC. Immutable completion handoff from the sole Codex worker
`moss_film_builder` to `moss_film_controller`. No implementation, generation, renderer or
local server is running. All final visual/media checks have passed and the controller
accepted them. The controller owns merge/checkpoint/shared state and delivery records.

Worktree: `/Users/manishjain/.codex/worktrees/moss-film/ai-peer-hackathon-2026`.
Branch: `codex/blended-moss`. Package head before this handoff: `47cfa31810cf81a6206bc01941db4cfe52724757`.
PR: https://github.com/manishjain-py/ai-peer-hackathon-2026/pull/18 (open and attached).
Latest main merged into the package: `28b7225390b8dc130650168a6d479151f4efd2d1`.

## Deliverables

- `demo-video/film/renders/blended-moss-v1.mp4`: 355,832,892 bytes, 1920×1080.
- `demo-video/film/renders/blended-moss-v1-720p.mp4`: 20,516,672 bytes, 1280×720.
- Both are exactly 119.600 seconds, 3,588 video frames, 30 fps, H.264 with the original AAC.
- Full source walkthrough: `demo-video/ui-concepts/moss/`; clean 58-second source clip in
  `demo-video/ui-concepts/renders/moss-clean-v1.mp4`, using the original six film spans.
- New cut: `demo-video/film/cuts/blended-moss-v1/`; reproducible renderer, selected gestures,
  prompts, ledger, manual review and evidence: `demo-video/moss-film/`.

Moss replaces every mascot surface, including the baked walkthrough. It uses the chosen
Round 2 identity, existing wave/portrait and two new generated character-only gestures.
Reading/writing/landing/rules poses clear the original captions. UI data, text, source
reveals and timing remain unchanged. The rules retain their full green card and six rules.
Dormant/wake/fold keys use the same Moss avatar before opening into its body. The original
Tag v2 film and all previous sources/assets remain unchanged. Moss remains a candidate for
Manish's review; his approval has not been assumed.

## Acceptance and evidence

The controller accepted all 173 caption-aware source points, then all 73 encoded scene
frames, 42 scene/patch boundary frames and 12 send-copy frames. Files are in `moss-film/evidence/`:
`caption-review-*`, `film-encoded-*`, `transitions-encoded-*`, `send-encoded-1.jpg` and
`checks.json`. Both exports fully decode. All 5,608 AAC packet payloads/timestamps/durations
and decoded audio hashes match Tag v2 exactly. All 20 shot settings, six walkthrough spans,
script/narration/music configuration and original UI data/style/timeline pass comparison.
No direct audio listening is claimed. The private-term-list scan is unavailable on this Mac;
only public fictional sources and generic Moss art were used.

Final SHA256:

- 1080p: `c6672bd1b42b09b5c66c4dbd55bdb2f37ef5dbac6e79594f061f3fc5cb4f2941`
- 720p: `0348b89c4c99b315cc0a7b4221db71823b01572796b7c97b3ae8b4ab2fab0651`
- Approved Tag v2 still: `7756283021b7237605337f079e435babb25143c2fb1d9023e6b70204a952b039`

The source walkthrough proof must initialize visibly before measuring its UI; a hidden
iframe caused zero dimensions in a temporary proof, caught and corrected before acceptance.
The finished film uses its normal baked source clip. Full render is the default rebuild;
bounded fixes were assembled at exact decoded frame boundaries with a lossless intermediate.
Raw caches are ignored and not part of the PR. No unit tests or CI were added.

## Delivery, money and next

Controller confirmed Telegram video 23091 and text 23092; do not resend. Receipt:
`demo-video/docs/delivery/moss-film-2026-11-16.json`, already on main.
New generation cost: $0.40, project total $49.306079. No pending paid call. The $50 notice
threshold was not crossed. Last measured worker context was 37.3%; weekly usage 16%.

Controller next: merge PR 18 after this handoff commit is pushed, create `blended-moss-v1`
checkpoint, update shared STATE/README/START-HERE and final delivery note, then sync this
primary worktree to latest main. Keep the primary worktree; do not try to archive it.
No product work is reopened here. Further film changes await Manish's feedback.
