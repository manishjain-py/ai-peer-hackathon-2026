---
name: gotcha-zsh-path-variable-is-path
description: "In a zsh script, assigning to a variable named `path` replaces PATH, so the next command is \"not found\""
metadata:
  node_type: memory
  type: feedback
  originSessionId: 3cbb0aef-91a4-45ab-a616-715281b95dd1
  modified: 2026-10-06T04:35:54.864Z
---

In zsh, `path` is an array tied to `PATH`. A script line such as `path="$2"` (a repo path, a file
path) silently replaces the command search path, and the next external command fails with
`command not found: mktemp` (or `git`, `tar`, …), which reads like a missing tool.

**Why:** hit on 2026-10-06 in a scratch script of the content-factory rehearsal: `commit="$1"; path="$2"`
then `mktemp` was "not found". The same holds for `cdpath`, `fpath`, `manpath`, `mailpath`.

**How to apply:** in any zsh script (this Mac's default shell, and what the worktree shell guard
makes me write for anything with a variable), never name a variable `path`: use `relpath`,
`file`, `target`. When a zsh script reports a core tool as not found, look for such an assignment
first. Related: [[gotcha-zsh-unquoted-var-is-one-word]].
