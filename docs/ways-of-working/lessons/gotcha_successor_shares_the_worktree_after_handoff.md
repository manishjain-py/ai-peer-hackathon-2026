---
name: gotcha-successor-shares-the-worktree-after-handoff
description: "Once a worker hands off, its successor can be editing the SAME worktree within minutes: never switch branches, stash or commit there afterwards; send late results by message, or push an addendum from a separate worktree"
metadata:
  type: feedback
---

When a worker hands off, a controller can launch the successor into the **same worktree** within about ten
minutes, and the successor starts editing at once. Anything the old session then does in that worktree
(`git switch --detach` to add an addendum commit, a stash, a commit, a test run that rewrites files) lands on
the successor's work in progress.

**Why:** `telugu-wp4b-1` (2026-11-10) handed off at 49% context, then wanted to add a late walk result to its
hand-off on the backup branch. Its script was going to `git switch --detach` the shared worktree to the backup
commit. Only its first guard, `test -z "$(git status --porcelain)"`, stopped it: `telugu-wp4b-2` was already
editing five test files there.

**How to apply:**
- After the hand-off commit is pushed, treat the worktree as the successor's. Check `ListAgents` for the successor.
- Send any late result (a sub-agent's report, a walk) to the successor and the controller by `SendMessage`, and
  point them at the output files.
- If the record must be in the repo, push the addendum from a separate temporary worktree, never the shared one.
- Put a clean-tree guard first in every script that moves `HEAD`.

Related: [[feedback_maintain_planner_and_handover]], [[gotcha_cross_session_message_held_between_permission_modes]].
