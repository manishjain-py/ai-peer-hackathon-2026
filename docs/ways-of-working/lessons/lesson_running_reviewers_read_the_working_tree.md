---
name: lesson-running-reviewers-read-the-working-tree
description: "Background read-only reviewers read files with Read/Grep from the live working tree, so editing while they run mixes states; tell them to read git show <sha>:<path> only"
metadata:
  node_type: memory
  type: feedback
  originSessionId: a37d26de-b15e-4f8b-bc38-dfb5bba36fb5
  modified: 2026-10-16T04:49:58.606Z
---

Read-only reviewer sub-agents launched on a commit still open files with the Read and Grep tools, which read the
live working tree, not the commit. If the lead starts editing (folding another review's findings) while they run,
a reviewer can report on a half-edited file as if it were the reviewed head (G14-4, 2026-10-16: four reviewers on
`64ea8e1c7` while the frames fixes went in).

**Why:** the reviewer's brief named the head SHA but also said "prefer the Read and Grep tools", so the SHA alone did
not pin what it read.

**How to apply:** before editing while reviewers run, SendMessage each one: "read only as committed at <sha>:
`git show <sha>:<path>`, `git diff origin/main...<sha>`, `git grep <pattern> <sha> -- <paths>`; no Read or Grep on
worktree files". Better: put that rule in the reviewer brief from the start, and hold commits until they report.
Related: [[gotcha-readonly-reviewer-writes-parent-scratchpad]].
