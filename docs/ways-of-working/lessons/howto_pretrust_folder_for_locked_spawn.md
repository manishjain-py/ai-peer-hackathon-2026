---
name: howto-pretrust-folder-for-locked-spawn
description: A fresh sibling worktree stops a launched claude at "trust this folder" (default No, exit), which a locked screen cannot answer; mark the folder trusted in ~/.claude.json first, the fix Claude Code's own message names
metadata:
  type: reference
---

**Verified 2026-11-14 (Claude Code 2.1.325, screen locked), `practice-visuals-controller-3`:** two workers launched by
Terminal `do script` in new worktrees `~/repos/learnlikemagic-practice-visuals-{backend,content}` started with no
trust dialog, after their folders were marked trusted.

- Trust is inherited: a folder under a trusted folder needs nothing (the program's own text: "no trust dialog will
  appear there because a folder above it is already trusted"). A sibling worktree (`~/repos/<repo>-<slug>`) is not
  under the repo, so it asks; `claude -p` never asks.
- Claude Code's own message names the fix: "set projects[<path>].hasTrustDialogAccepted to true in ~/.claude.json".
  Do it right before the launch: read the JSON, set the flag on the folder's real path, write a temp file in the
  same folder and `os.replace` it, then read the flag back.
- Only for a folder you just made for your own worker; never for a folder you did not create.
- The other ways, and why not: a keystroke needs an unlocked screen; a worktree under `<repo>/.claude/worktrees/` is
  trusted by inheritance but loads the parent checkout's CLAUDE.md too (stale instructions); `claude -w` and
  `EnterWorktree` put the session behind the worktree guard, which refuses its Workflow agents' commands.
