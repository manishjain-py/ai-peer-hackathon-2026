---
name: gotcha_usage_read_can_lack_weekly_lines
description: "A `claude -p \"/usage\"` read can come back with no \"Current week\" lines while the sign-in is fine; a login guard keyed on that line alone sent Manish a false 'sign-in lapsed' alarm"
metadata:
  type: feedback
---

On 2026-11-13 near 23:30 UTC, `claude -p "/usage"` on Manish's Mac printed "You are currently using your
subscription to power your Claude Code usage" and its local "What's contributing to your usage?" section, but no
"Current week" lines, three reads in a row. A controller's login guard counted each as a failed read and sent the
Attention group "sign-in looks lapsed, type /login" at 23:51:52. It was false: the next read at 04:35 printed the
weekly lines again (91%) and the controller's turns ran throughout.

**Why:** the weekly lines come from the usage service; when it does not answer, /usage still prints its other parts.
A check that greps only "Current week" reads a service hiccup as a lapsed sign-in. Any 95% watcher keyed on the same
line goes blind at the same time (it simply skips; it must not read a missing line as 0%).

**How to apply:** a login guard counts a read as signed in when it holds "Current week" or "using your subscription"
(the local "contributing" section is not a sign-in signal); a usage watcher skips a read without the weekly line and
never treats it as a number. If a false alarm went out, correct it on the same channel at once, in one line. Related:
[[gotcha_lapsed_login_silences_every_session]], [[feedback_stop_at_95pct_weekly_usage]].
