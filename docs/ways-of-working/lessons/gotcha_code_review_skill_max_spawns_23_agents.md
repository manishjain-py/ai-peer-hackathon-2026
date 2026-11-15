---
name: gotcha-code-review-skill-max-spawns-23-agents
description: "/code-review at `max` forks and fans out 10 finder agents, then one verifier per candidate (13 more) and a sweep: 23 agents for one PR, far over Manish's 3-5 agent cap; use `high` or review by hand, and never SendMessage a 'completed' fork to ask for its report (it resumes and spawns the next wave)"
metadata:
  type: feedback
---

Hit 2026-10-14 reviewing PR #581 (51 files): `Skill(code-review, "581 max")` ran as a background fork whose
recipe reads "max effort → 5+5 angles × 8 candidates → 1-vote verify → sweep → ≤15 findings". It spawned 10
finder agents (7-12 min each), showed "completed" with no report delivered to the parent, and when I messaged it
to report it resumed and launched 13 verifier/sweep agents. Manish asked "Why are there so many running tasks?";
I stopped all of them (TaskStop by id), getting nothing back for the spend.

**Why:** his standing cap is 3-5 agents for multi-agent work ([[feedback_workflow_agent_cap]]) and usage is
rationed ([[feedback_stop_at_95pct_weekly_usage]]); a review fan-out counts against both.

**How to apply:** for a PR review do the reading yourself (one session, a scratch worktree, `gh api` for
comments); if the skill is wanted, pass `high` at most and say the agent count before launching. A fork that
shows "completed" without a notification is still waiting on children: do not SendMessage it, read its
`tasks/<id>.output` transcript for the candidate list instead. Related: [[gotcha_plan_agents_never_write_files]].
