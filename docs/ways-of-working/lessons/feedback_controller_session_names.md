---
name: feedback-controller-session-names
description: "A build's controller session is NAMED as one: `<feature>-controller-<n>` (e.g. ux-feedback-controller-4), set at launch with --name and --remote-control, so Manish can spot it among many sessions"
metadata:
  type: feedback
---

Manish, 2026-10-20 (session `ux-feedback-3`): "If you are the controller, can you name yourself accordingly so that it
is easier for me to look at multiple sessions and be able to recognize you? And same thing goes for any future
controller that you hand off to."

**Why:** he watches many Terminal windows and claude.ai remote-control sessions at once; `ux-feedback-3` did not say
"controller" (the UX revamp's `ux-revamp-controller-<n>` did).

**How to apply:** launch every controller, and every controller successor, as `<feature>-controller-<n>`
(`--name` and `--remote-control` both). A running session cannot be renamed: its launch name drives the Terminal
title (an AppleScript custom title is overridden), the remote-control name and the name workers `SendMessage`
to; so a misnamed controller keeps its name and its successor gets the right one. Related:
[[controller-session-workflow]], [[feedback_maintain_planner_and_handover]].
