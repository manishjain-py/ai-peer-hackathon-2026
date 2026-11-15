---
name: gotcha_weekly_fable_limit_stops_every_session
description: "The plan's WEEKLY Fable allowance is account-wide: when it runs out, every running Fable session stops at a keystroke dialog (Switch to Opus 5.5 / Continue with Fable on credits) at its next request; an autonomous chain of several Fable sessions all stall at once, at night, with nobody at the keyboard"
metadata:
  type: project
---

**Seen 2026-09-23 23:10 UTC (04:40 IST)**, address-teacher-feedback chain: WP5 and WP6 (both Fable, max effort, spawned 22:14 UTC) stopped after ~55 minutes
each at "You've reached your Fable limit. You've used your included Fable usage for this week. Continuing on Fable 5.1 uses usage credits — you have $29.37
in credits" with the choices "Switch to Opus 5.5 (1M context) and continue" (highlighted) / "Continue with Fable 5.1", "Enter to confirm · Esc to cancel"
(Claude Code 2.1.281). The controller session (also Fable) was still answering, but any request can hit the same dialog. Four Fable workers plus a controller
ran that day; the allowance went in one day.

**Why it matters:** the chain's rules forbid typing into a live session, and a successor spawned on the same account meets the same dialog, so the only
repairs are a human keystroke (Enter per window) or the weekly reset. Nothing is lost: each lane's uncommitted work stays in its worktree.

**How to apply:**
- Before an overnight chain of several Fable sessions, check the week's remaining allowance (`/usage` in a session) and prefer Opus 5.5 for the workers
  (`--model opus` in the launch script) when it is short; keep Fable for the controller or the review-heavy links. [[feedback_model_choice_best_models]]
  [[claude-code-fleet]]: one subscription per unit of heavy work.
- A controller that sees the dialog in a worker window: Telegram Manish at once with the two options and a recommendation, record it under "Needs Manish"
  in the tracker, keep the watch armed; the lanes resume by themselves when the dialogs are answered.
- A worker window showing "1% until auto-compact" is not this: that one compacts and continues on its own.
- A session stopped at the dialog keeps its BACKGROUND work running: WP5's Explain dry run (a Workflow) finished about 30 minutes after its session stopped, and the unanswered dialog later timed out ("nothing was sent"). A successor checks the run's record (in learnlikemagic: `workflow_runs`, status, `script_sha256` against the branch) and the results folder before re-running; `atf-wp5b` stopped its own duplicate after 3 agents (about 800,000 tokens saved).
