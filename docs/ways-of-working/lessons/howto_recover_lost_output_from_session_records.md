---
name: howto-recover-lost-output-from-session-records
description: "A finished run's output can outlive its worktree and scratchpad: a session's saved tool output and sub-agent records under ~/.claude/projects keep what its commands printed and wrote; find it by grep, copy it by script, cite where it came from"
metadata:
  type: feedback
---

When a run's folder is gone (worktree removed, scratchpad emptied at reboot), its text often survives in the
session records under `~/.claude/projects/<project dir>/`:

- `<session id>/tool-results/<id>.txt`: a command's full output when it was too long to show inline.
- `<session id>/subagents/agent-*.jsonl`: each sub-agent's tool calls (a `Write`'s full content) and results.
- `<session id>/subagents/workflows/<workflow id>/agent-*.jsonl`: a Workflow's agents, with their inputs.
- `<session id>.jsonl`: the main transcript.

Find the text with `command grep -l -r '<a distinctive string>' <project dir>` (plain `grep` is ugrep and can skip
files), then pair each tool result with its tool call by `tool_use_id` in a small script, so you know exactly which
command on which file printed it. Copy the text out by script, never by retyping (non-Latin script especially), and
say in the deliverable where it came from.

**Why:** `telugu-wp7a-1` (learnlikemagic, 2026-11-12) needed real lines from a factory dry run whose worktree and
scratchpads were gone. The final lines survived word for word in the WP6 session's `tool-results/` file (a script's
printout of the final pack) and in a sub-agent's record. That made the voice sample real content instead of a re-run
or invented text.

**How to apply:** before re-running a costly job or writing stand-in content, search the session records of the
session that ran it. Records hold what was printed or written, not files that were never shown, so check that the
command behind the text ran on the final output (its path and time) before trusting it.
