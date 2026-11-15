---
name: feedback_account_switch_needs_resume_outside_session
description: Manish 2026-11-05: switching a Mac's Claude account can log the running sessions out, so never ask him to reply in a session after the switch; give one resume command for any Terminal window
metadata:
  type: feedback
---

A stop at 95% ends with him switching account. Asking him to "reply switched here" fails: he pointed out that the session may be logged out by the switch.

**Why:** the session that asks may not survive the thing it asks for.

**How to apply:** before the stop, put one short command in a file on the Mac that starts the next controller, test the parts you can without starting it, and name it in the tracker and in your reply. Related: [[feedback_stop_at_95pct_weekly_usage]].
