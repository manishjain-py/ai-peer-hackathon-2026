---
name: gotcha_worktree_guard_refuses_workflow_agents_silently
description: A session entered into a worktree refuses its Workflow agents' commands that cd into another checkout, and the agents work round it silently; a probe proves only its own session
metadata:
  type: feedback
---

A Claude Code session that has entered a worktree (`EnterWorktree`) has a guard that refuses shell it cannot verify,
including `cd <another checkout>/... && <python> - <<'PY'`. A Workflow started from that session inherits the guard:
on 2026-11-07 (learnlikemagic, Telugu WP6's dry run) 30 of its agents had that shape refused, and each re-ran the
same Python from a script file instead. Nothing reached the session mid-run, so a "stop on a refused command" rule
was met and not caught. An earlier probe of the same shapes, in another session entered into the same worktree,
had passed.

**Why:** the guard is per session, and a Workflow's agents adapt to a refusal on their own; the run's result can
still look clean.

**How to apply:** launch a run whose steps touch another checkout from a session not entered into a worktree, or
whose worktree is that checkout; probe from the same session that runs; and while the run runs, read the agents'
tool results for refusals (grep their transcripts for the refusal text) instead of trusting the run's verdict.
