---
name: gotcha-handoff-file-list-misses-late-files
description: A hand-off branch built from an explicit file list silently leaves out files written after the list; check every path the hand-off text names is on the branch before sending it
metadata:
  type: feedback
---

A worker pushed its hand-off as a branch built from an explicit list of script paths (a temporary index, `git
update-index --add` per listed file). The hand-off text then named two files the worker wrote later, an eighth
reader's probe and the controller's rulings on it: neither was in the list, so neither was on the branch. The
successor found them only by reading the stopped worker's scratchpad, which a reboot or cleanup would have erased (the
repo is the only memory).

**Why:** the list is frozen when the push script is written; files written after it (a late probe, a rulings file)
are left out with no error.

**How to apply:** before sending a hand-off, check every path its text names is on the branch:
`git cat-file -e origin/<branch>:<path>` for each one, or a loop over the hand-off's backticked paths. Prefer adding a
folder's whole listing (minus logs) over naming files one by one. A successor who finds a named file missing should
copy it read-only from the predecessor's scratchpad (`/private/tmp/claude-501/<project>/<session id>/scratchpad/`),
say so in its first report, and push it with its own first backup. Related: [[gotcha-successor-shares-the-worktree-after-handoff]].
