---
name: gotcha_plan_agents_never_write_files
description: "Plan (and other read-only) subagents refuse to write ANY file, even a scratch output file the brief explicitly allows: they return the full content in their final message instead, so save it yourself"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 85fd2102-a6d2-4be6-97ec-e08b42f013d4
  modified: 2026-10-15T07:35:19.899Z
---

2026-09-29 (docs-structure pre-build review): two `Plan` subagents were told "write your full working to
<scratchpad>/review-out/<lens>.md with a Bash heredoc; that is the only file you may write". Both refused ("my
instructions for this task are strictly read-only ... that overrides the one-file exception") and put the whole
list in their final message instead.

**Why:** the Plan agent type is read-only by its own system instructions, which outrank the brief.

**How to apply:** don't ask a read-only agent for a file; ask for the full content in its final message and
save it yourself (into the repo if a later session needs it: the scratchpad does not survive a hand-off).
Budget your own context for it: two such reports cost ~25k tokens. Related: [[feedback_workflow_agent_cap]].

**General-purpose sub-agents too, for REPORT files only** (2026-10-15, ux-revamp-g12 and g12-2): they wrote
their Swift, DECISIONS.md rows, docs and a hand-off brief fine, but the harness refused each one's
`g12-work/report-*.md` ("Subagents should return findings as text, not write report files"). Brief them:
"your final message is your report"; ask for it short (under 40 lines) so reading it stays cheap.
