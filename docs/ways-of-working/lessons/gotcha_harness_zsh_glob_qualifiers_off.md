---
name: gotcha_harness_zsh_glob_qualifiers_off
description: "Inline Bash-tool commands run zsh with NO_BARE_GLOB_QUAL, so `dir/*(N)` fails at once (\"no matches found\", exit 1); a background waiter written that way dies seconds after launch"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 1df52b01-c96a-4c43-8d2e-3748ad6eadb8
  modified: 2026-10-30T07:43:31.262Z
---

The Bash tool wraps each inline command in a zsh that sets `NO_EXTENDED_GLOB NO_BARE_GLOB_QUAL`, so a glob qualifier such as `(N)` is not a qualifier there: `for d in runs/codex-*(N); do ...` aborts with `no matches found: .../codex-*(N)`, exit 1, before the loop runs. Controller-26 (2026-10-30) armed a background waiter for a test's run folder this way; it "completed" with exit 1 within seconds.

A script run as `zsh file.zsh` gets zsh's default options, so `(N)` works inside it (the controller helpers `window_check.sh` and `watch-worker.zsh` use it fine). But there `ls pat(N)` with no match runs a bare `ls`, which lists the current folder and reads as found files: a pre-merge check printed the repo root under "run-dir pid files" (`telugu-wp2c-4`, 2026-11-05). Count into an array instead: `files=(pat(N)); print ${#files}`.

**Why:** a waiter that dies at once can be misread as its event firing, and the real event then goes unwatched.

**How to apply:** in inline Bash-tool commands, list with `ls dir | grep pattern` or `find`, never glob qualifiers; put qualifier-using loops in a `.zsh` file run with `zsh`. Read a background command's output when it ends unexpectedly fast. Brief sub-agents: "keep shell commands plain (no zsh glob qualifiers or `${(f)...}`)". Related: [[gotcha_zsh_unquoted_grep_include_glob]], [[gotcha_subagent_zsh_expansion_flag_prompt]].
