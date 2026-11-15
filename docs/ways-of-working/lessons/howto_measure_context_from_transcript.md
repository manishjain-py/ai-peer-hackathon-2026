---
name: howto-measure-context-from-transcript
description: "The 45-50% hand-off rule needs a number: read the session transcript's last usage record (cache_read + cache_creation + input tokens) at every milestone; WP4 overshot to 68% by never measuring"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 95332993-9c27-4229-9ce1-59798667ecf4
  modified: 2026-10-30T13:34:33.149Z
---

The `<total_tokens>` counter in system reminders is not the context in use. The real figure is the last
`usage` record in the session transcript:
`~/.claude/projects/<project dir of the cwd>/<session id>.jsonl` (a worktree session writes under the
worktree's own project dir, e.g. `-Users-manishjain-repos-learnlikemagic-admin-wp4`). Context in use =
`input_tokens + cache_read_input_tokens + cache_creation_input_tokens` of the last record; divide by
1,000,000 for the 1M models (Fable 5.2, `claude-fable-5-2`, is one: `claude -p --model claude-fable-5-2 "/context"` printed `/ 1m` on 2026-11-14). Parse it with a small script file (the worktree guard refuses inline
programs).

**Why:** admin-wp4 (2026-09-29) built a whole package with heavy thinking inside one long turn (every
thinking block stays in context during a tool loop) and only measured at 68%, well past Manish's 45 to
50% hand-off rule ([[feedback_maintain_planner_and_handover]]).

**How to apply:** measure at every milestone (after each commit or proof step), not only when it feels
long; hand off at the first milestone past 45%. Name the file by THIS session's id (the scratchpad path
carries it), never "the newest .jsonl" (`ls -t | head -1`): with several sessions in one project dir the
newest is often a peer's (uxf-run-50, 2026-10-30, read 21.9% from a peer's file when its own was 35.0%).

**ExitWorktree moves the transcript.** A session launched in the shared checkout that entered a worktree by `EnterWorktree` writes under the worktree's project dir; right after `ExitWorktree` its file sits under the launch folder's (`-Users-manishjain-repos-learnlikemagic/<id>.jsonl`), so a measuring script with the worktree's path fails `FileNotFoundError` (`telugu-wp2c-4`, 2026-11-05, before removing its worktree at clean-up). Look the file up by session id in both dirs.

**Measure right after the reading phase, not at the third milestone.** `tfqa-p4-1` (2026-11-04) read a plan, a design, a PRD and a package's modules in full at max effort, first measured with the code built, and stood at 72%, well past the 45 to 50% hand-off mark. Read the sections your step names, and measure once before the first test runs.
