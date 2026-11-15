---
name: gotcha_sibling_worktree_push_moves_origin_main
description: "Worktrees share refs, so a controller's push to main from its own worktree moves your local origin/main mid-merge; re-check before every push"
metadata:
  node_type: memory
  type: project
  originSessionId: e33bddf0-7fce-4d85-8e48-45542eb61102
  modified: 2026-10-22T15:03:39.120Z
---

All worktrees of `~/repos/learnlikemagic` share one ref store: when the controller pushes `STATE.md` to `main` from
`~/repos/learnlikemagic-ux-ctl`, `refs/remotes/origin/main` moves in every worktree at once, with no fetch. On
2026-10-16 G14-5's `git merge origin/main` finished on an old `origin/main` while a newer one had landed (the diff
against `origin/main` showed main's newest paragraph missing), and the PR showed as conflicting (DIRTY) between merges.

**Why:** a PR branch one controller commit behind conflicts on `STATE.md` and blocks CI, the gate and the merge.

**How to apply:** just before every push run `git fetch origin` and `git rev-list --left-right --count
HEAD...origin/main`; if the right number is not 0, merge again (keep main's `STATE.md` rows, append the branch's
after them) and check `git diff origin/main -- <tracker> | grep -c '^-[^-]'` is 0 (in learnlikemagic: `docs/feature-development/<feature>/STATE.md`).
Related: [[gotcha_shared_checkout_concurrent_sessions]].
