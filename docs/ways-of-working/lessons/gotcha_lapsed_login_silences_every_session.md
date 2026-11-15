---
name: gotcha_lapsed_login_silences_every_session
description: "A lapsed Claude Code sign-in stops every session on the Mac silently for hours: no turn runs, so a session cannot act on its own alarms; only a shell loop that sends Telegram itself can warn Manish"
metadata:
  type: feedback
---

On 2026-11-07 about 16:50 UTC Claude Code's sign-in on Manish's Mac lapsed. The UX Feedback controller
(ux-feedback-controller-29) could run no turn from 17:10 UTC until Manish typed `/login` in its window at
02:16:56 UTC (about 9 hours); Remote Control dropped at 19:27 UTC ("OAuth token unavailable"). Its
background usage loop (`claude -p "/usage"` every 10 minutes) exited after three failed reads, but the
session could not act on that exit, so nobody was told. Its zsh page watcher kept running; had the team
written, the line would have waited unread.

**Why:** every session on the Mac shares the one sign-in; with it gone, no model turn runs, so alarms that
need the session to act on them stay silent.

**How to apply:** a long-running controller keeps one background shell loop whose failure branch sends
Telegram itself (`tg-attention.sh`, which needs no Claude sign-in): after three failed `claude -p "/usage"`
reads, an Attention line saying to type `/login` in the controller's window. After a `/login`, check the
watchers still run and re-arm the loops. Related: [[feedback_account_switch_needs_resume_outside_session]],
[[feedback_stop_at_95pct_weekly_usage]].
