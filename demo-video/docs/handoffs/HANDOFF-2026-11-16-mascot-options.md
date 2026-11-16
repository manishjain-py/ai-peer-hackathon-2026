# Worker brief: mascot alternatives, 16 November 2026

Read `../BRIEF-MASCOT-OPTIONS-2026-11-16.md` for the exact request and scope (V32).
This brief is dated; progress and results belong in STATE and the exploration's report.

## Deliverable

Twelve distinct, polished, code-native mascot designs, each shown in a short comparison reel
inside the approved `blended-tag-v2` scenes. Use a common selection of moments so each option
can be judged fairly: phone-to-desk entrance, the paper product UI, meeting identity and logo.
An opening close-up may introduce the number/name and show subtle personality. Preserve the
original story and layout. No old mascot showing through behind a new one. The approved master
and its sources are unchanged; all exploration is additive under `demo-video/mascot-options/`.

Each candidate has a clear silhouette at small size, restrained expressive movement, and a
visible AI label. Explore different ideas, not twelve colours or minor variations of one rig.
Suggested families: folded paper creatures, a living bookmark, a ribbon knot, a seed/sprout,
a river pebble, lantern/firefly, compass, kite/ray, linked orbits, envelope courier.

## Implementation and proof

- Reuse `ui-concepts/tag/mascot.js`'s pose contract and existing public film sources where useful.
- Existing renderers: `ui-concepts/render.mjs`, `film/render.mjs`, HyperFrames and ffmpeg;
  local Playwright capture is a fallback. Frame rendering must be deterministic.
- Short sample reels only; twelve full two-minute films are not needed for this review.
- Deliver playable H.264 MP4s with faststart, preferably 1080p masters plus small 720p copies,
  a numbered overview, per-option contact sheets, reproducible source and a short report.
- Inspect rendered frames for missing content, collisions, old mascot remnants and readability;
  inspect media metadata. No unit tests or CI. Do not claim direct audio listening.
- No paid calls, new narration, private folders or recordings. Every input must be traceable to
  the public approved base or newly authored code. The original private privacy-check list is
  unavailable here; do not claim its check passed.

## Coordination

One worker, no helpers. Send the controller the concept list/build strategy, an early rendered
sample, and delivery milestones. Worktree: `/Users/manishjain/.codex/worktrees/mascot-options/ai-peer-hackathon-2026`.
Branch `codex/mascot-options`, one PR. Fetch before pushing; merge main's documentation updates.
The controller reviews the visual walk before the worker merges. The controller sends the files
to Telegram and records receipts. No message sending from the worker.
