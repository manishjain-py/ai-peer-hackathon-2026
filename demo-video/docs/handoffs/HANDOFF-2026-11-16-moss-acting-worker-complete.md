# Moss acting v2: implementation complete

16 November 2026, 18:51 UTC. Immutable completion handoff from sole Codex worker
`moss_acting_builder` to `moss_acting_controller`. All implementation, generation,
rendering and verification are finished; no renderer, generation call or local server runs.

Worktree: `/Users/manishjain/.codex/worktrees/moss-acting/ai-peer-hackathon-2026`.
Branch: `codex/moss-acting-v2`. Package head before this handoff:
`de994c8067d16ed81e1fd5a129646d9f619ad25b` (latest main `6987579` merged).
PR: https://github.com/manishjain-py/ai-peer-hackathon-2026/pull/19 (open, attached).
Controller owns the final merge/checkpoint/shared docs and retained-worktree sync.

## Delivered artifacts

- `demo-video/film/renders/blended-moss-v2.mp4`: 1920×1080, 356,838,362 bytes.
  SHA256 `acf0d9aa68f86f085c24a698f095e5606cf86b23b29db1f83965d6029aaac2b4`.
- `demo-video/film/renders/blended-moss-v2-720p.mp4`: 1280×720, 20,719,169 bytes.
  SHA256 `5100a99eac405bc9e91c6f770fd938e66e6267e4e6a4ec0a89ece17ed2a885f3`.
- Both: exactly 119.600 seconds, 3,588 video frames, 30fps, H.264 plus original AAC.
- Complete clean source `demo-video/ui-concepts/renders/moss-clean-v2.mp4`:
  58 seconds, 1,740 frames. Code in `demo-video/ui-concepts/moss-v2/`.
- Cut `demo-video/film/cuts/blended-moss-v2/`; reproducible renderer, chosen assets,
  prompts/requests, ledger, exact-time acting map and evidence in `demo-video/moss-acting/`.
- Accepted 14.700s silent performance preview: `moss-acting/evidence/acting-in-context.mp4`.

The new acting follows context: notebook/pen scanning and writing at revealed source facts,
review/thought during consolidation, brief presentation, listening during typing, searching
before a sourced answer, calm rules reassurance, meeting listening/update/question/boundary,
then note-taking on “I'll put it in his morning brief.” The meeting body/prop stays inside
its original tile and above the two-line caption. Morning acknowledgment follows Ram's real
109.8s click. Four new character-only motions and one notebook keyframe preserve Moss's felt
identity, cream face/belly, curled sprout and amber charm. Small brand marks remain still.
No new dialogue, product action, voice/music or lip-sync was added.

## Verification and acceptance

Controller accepted the map/keyframe, all action/matte pilots, 30 context composition
frames, 32 encoded context frames and all 173 caption-aware source points. Before long
encoding, a notebook/caption overlap in the meeting was caught and fixed by raising only
Moss 43px within the tile; the notebook and sprout both have clearance.

Final controller acceptance: all eight film sheets (86 encoded scene frames), six boundary
sheets (64 scene/action boundaries) and two send-copy sheets (22 frames). Both complete
exports fully decode. All 5,608 original AAC payloads, packet timestamps/durations and the
decoded audio hash match Tag v2 exactly. All 20 shot settings, six source spans and original
UI data/layout/style/timeline, caption/script/narration/music configuration remain unchanged.
Original Tag v2 hash remains `7756283021b7237605337f079e435babb25143c2fb1d9023e6b70204a952b039`;
Moss v1 remains `c6672bd1b42b09b5c66c4dbd55bdb2f37ef5dbac6e79594f061f3fc5cb4f2941`.
`moss-acting/evidence/checks.json` has machine evidence; `MANUAL-REVIEW.md` has the visual walk.

No direct audio listening or unavailable private-term-list scan is claimed. The only outside
inputs were generic selected Moss art/descriptions; no UI, private recordings or company
content went to providers. Learn Like Magic/product/production were untouched. No unit tests,
CI or review gates were introduced. Selected media are in LFS; caches/locks are ignored.

## Delivery, cost and completion

Controller confirmed Telegram full movie **23099** at **18:48:56 UTC**, with correct
1280×720 / rounded 120s / supports-streaming metadata, and review text **23100** at
**18:49:13 UTC**. Do not resend. Receipt: `docs/delivery/moss-acting-film-2026-11-16.json`.
The earlier silent preview and $50 notification receipts are also saved by the controller.

New generation: **$0.859070** ($0.059070 Gemini token estimate, $0.80 conservative fal
ledger). Project: **$50.165149** of $100. The $50 cost notification was sent as 23097.
No further paid call is planned or pending. Last worker checks: Codex weekly usage 18%,
context 31.7%; no usage handoff threshold is close.

After this handoff is pushed, controller merges PR19 at its final head, creates checkpoint
`blended-moss-v2`, updates shared delivery/STATE/README/START-HERE and syncs the retained
worktree to final main. Keep the primary checkout; do not try to archive it. V2 is for
Manish's review; Tag v2 remains the last approved movie until his words change that.
No implementation work remains. Product work remains closed on this Mac.
