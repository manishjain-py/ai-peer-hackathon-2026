Demo reference folder: <DEMO_REPO_PATH>

Read `docs/prototype-moss-handoff/README.md` inside that folder and use its pinned Moss v5 movie, source map and verified asset manifest to update the actual prototype in your current workspace. Moss v5 is the chosen implementation reference for this task; older Tag approval notes do not change that.

First verify that the reference movies and assets contain actual bytes. If this copy has LFS placeholders, apply the local repair ZIP using `docs/prototype-moss-handoff/MEDIA-TRANSFER.md`, merging into the reference folder without replacing whole directories. Verify its hashes before visual work; no personal account download or installation on this Mac is needed.

Inspect the target repository's instructions, current UI/backend and real workflows first. Implement the applicable design, Moss mascot, expressions, activities and flows in its own code, including necessary state hooks and feasible small backend gaps. Preserve existing functionality, integrations, permissions and human decision boundaries. Drive behavior from real application events and actual speech, sources and confidence—not film timers, canned Ram data or prerecorded dialogue.

Copy selected assets into the target's own asset pipeline so it runs independently of the reference folder. Do not replace the target with this demo repo's stale `peer/` code. Complete implementation, run the target's required checks and authorized end-to-end manual walks, fix observed issues and document any real remaining gaps. Follow its existing commit/PR/deployment rules. Do not stop at a plan. Ask for the target path only if inspection cannot identify it; continue independent work while resolving genuine blockers.
