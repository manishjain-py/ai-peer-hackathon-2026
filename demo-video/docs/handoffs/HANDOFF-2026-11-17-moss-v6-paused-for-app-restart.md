# Moss v6 — paused for app restart

17 November 2026 UTC. Immutable pause handoff. Manish explicitly paused so he can restart
ChatGPT and return to the same chat with “resume.” **Wait for that explicit resume.**
Do not send Telegram, merge PR23, tag V6, or continue QA while paused. V6 is not complete
and no final/user approval is claimed.

## Checkpoint and ownership

- Canonical main: `/Users/manishjain/repos/ai-peer-hackathon-2026`.
- Active retained checkout: `/Users/manishjain/.codex/worktrees/moss-acting/ai-peer-hackathon-2026`.
- Branch: `codex/moss-v6`; source/assets/latest repaired exports checkpoint **94b3311**.
  Pause documentation is on main and may also be merged onto this branch; preserve that
  later synchronization commit. Fetch and inspect the branch head when resuming.
- Draft [PR23](https://github.com/manishjain-py/ai-peer-hackathon-2026/pull/23) is attached
  to the root chat and remains open/unmerged. No `blended-moss-v6` final tag exists.
- Controller `moss_v6_controller`; sole worker `moss_v6_builder` is stopped/finished.
  Root was relay only. After an app restart, use a fresh controller and at most one worker
  if needed; do not assume an old subagent is available. No provider call is pending.
- All owned render, browser/server, encoded-proof and verification jobs have stopped.
  The worker's final runs happened to finish before the pause reached them. No new QA
  was started after the pause. Git checkpoint uploads are the only pause-save activity.

## What is finished

Read `FEEDBACK-MOSS-V5-2026-11-17.md` (V41, all12 user requirements) and
`../moss-clarity/README.md`, `ACTING-MAP.md`, `audio/README.md`, `PROVENANCE.md`,
`MANUAL-REVIEW.md` and `PAUSED.md`.

All requested source changes are implemented. The latest ocean uses the saved original
raised felt paw: exactly two natural arms, each paper corner attached to the visible paw
while Moss moves and places it. The earlier synthetic arm was rejected at full1080.
Do not reuse `ocean-third-arm-rejected-1080.jpg` or the earlier rig. The controller accepted
`paw-contact-1/2.jpg` and full1080 files `paw-contact-1080/f004.png`, `f008.png`, `f011.png`.
The learned highlight now connects to the actual matching source chip. These last two
repairs were captured only in35–42 and87⅓–100 (20 unchanged Slack bridge frames).

Native4K UI/ocean and Earth internal scene/work buffers are verified. Earth needed a
separate precise closing replacement, including camera-coordinate calibration. That
corrected Earth is retained in the latest export; all588 tail packets100–119.6 match.
Final assembly is1050+210+1360+380+588=3588 frames;2998 retained video packets match their
prior corrected-base payloads/timestamps. See `evidence/assembly-continuity.json`.

The new Chris hook voice is fluent and has matching generated motion. Matilda M1 is
trimmed after “Hi everyone. I'm Ram's AI Peer”; p05 is removed. All22 final voice cues
have no overlap. The same music has a continuous final phrase, final words before its
cadence, and the original D-major chime strengthened/aligned at116s. Actual encoded
speech transcription confirms the changes. The audio is unchanged by the last picture
repairs (same5608 AAC packets/hash).

## Exact latest files

Paths below are relative to `demo-video/` in the **active branch checkout**, not canonical
main yet. They are saved in Git/LFS by the checkpoint.

| File | Dimensions | Bytes | SHA256 |
|---|---|---:|---|
| `film/renders/blended-moss-v6.mp4` |3840×2160|219361038|`47e67e31adc0a4e745e30f4cc787d0f29ccf1d0a2a7c4ee0edf762bc4098f3fe`|
| `film/renders/blended-moss-v6-1080p.mp4` |1920×1080|47821028|`3ad6ad0e824e59d13d072cbebf98bbc0739e480c1a858d7e1d50a3a445be4ced`|

Both119.600s/3588 frames/30fps, -14.0LUFS/-1.6dBTP. Retained raster people/Moss sources
keep their original detail; do not claim all photography is native4K. The UI/canvas is
source-rendered at4K. All13 older movie hashes and the43-file pinned V5 prototype
manifest remain unchanged. V40's package/public transfer link was not reused or updated.

## What remains after explicit resume

1. Inspect the **newest encoded** evidence independently. Worker extraction/checks
   completed before pause: `evidence/film-encoded-*.jpg` (98points),
   `transitions-encoded-*.jpg` (62boundaries), `send-encoded-*.jpg` (53points), plus
   `ocean-motion-1080p.mp4` (30fps/12s). Controller had inspected the prior encoded cut,
   then requested/accepted the final real-paw/source-chip repair in source. The newest
   encoded repair has NOT yet received final controller acceptance. Review especially
   all three paw contacts, learned source-line endpoints, patched boundaries, CTA and
   full-size1080 readability. Check `checks.json` hashes against the table above.
2. If this passes, save final controller acceptance and the12-item feedback matrix.
   No more generation or broad polish is planned. Re-run a check only if needed, or if
   a file changes; existing final worker verification already passed.
3. Send the approved1080 copy to Telegram as a video and original document. Prepared
   helper `moss-clarity/tools/send_final.py` verifies destination and metadata and saves
   partial/success receipts. It has NOT been invoked. Use a receipt under canonical
   `demo-video/docs/delivery/moss-v6-film-2026-11-17.json` so final docs can go to main.
   Inspect whether a receipt exists before any attempt; never blindly resend.
4. Commit/push any acceptance/receipt updates, finish PR23 description, mark ready and
   merge after the manual walk. Then update current pointers (`START-HERE.md`, root
   README, demo-video AGENTS/STATE), write V6 delivery/acceptance/completion handoff,
   add the V6 cost row, and push annotated `blended-moss-v6` on the final main state.
5. Sync canonical main and retained Moss checkouts cleanly (moss-acting and moss-film).
   Do not archive/delete primary worktrees. Do not refresh the pinned V5 prototype
   handoff/ZIP or publicly upload V6 to its old OneDrive permissions. Return final
   canonical video/master paths, Telegram IDs, PR/merge/tag, cost and clean status.

## Resume commands and saved diagnostics

Do not run these until explicit resume. Saved-asset rebuilding needs no API credential.
Normal full rebuild, only if needed:

```sh
node demo-video/moss-clarity/audio/build_mix.mjs
node demo-video/moss-clarity/render.mjs --full
python3 demo-video/moss-clarity/tools/verify.py
python3 demo-video/moss-clarity/tools/encoded_proof.py
```

For final review, existing exports/evidence are already present; avoid an unnecessary
full rebuild. `.build/` caches remain locally, ignored. The worker's focused replacement
modes in `render.mjs` preserve closed-keyframe packet boundaries; don't use naive `-t`
stream-copy cuts (111s produced3332 frames with B-frames).

Useful local logs: `/tmp/moss-v6-final-repair.log`, `/tmp/moss-v6-verify.log`,
`/tmp/moss-v6-ending-render.log`, `/tmp/moss-v6-full-render.log` and
`/tmp/moss-v6-controller/encoded-speech.log`. Logs/caches are convenience only; committed
source/evidence/recipes contain the durable record. No listed process should be resumed.

New cost **$0.4863** (Chris$0.0063, matching motion$0.36, four conservative audio reviews
$0.12); project **$52.097127/$100**. No pending paid call. Next spend notice$80;$50 notice
was already sent. Latest usage helper reading was week2%, Fable0%, safely below limits.
No secrets or private recordings were committed or sent. No V6 Telegram message exists.
