---
name: gotcha_scrolled_session_window_stale_screen
description: "A Claude Code window scrolled up ('N new messages (click) ↓') gives mac-term.sh read STALE lines: no status bar, no question dialog. Read the session's transcript or subscribe to its idle notice; never send keys to un-scroll"
metadata:
  node_type: memory
  type: project
  originSessionId: ad984287-adf6-4818-b803-697dbaaa97a8
  modified: 2026-10-23T16:43:09.753Z
---

On 2026-10-23 a UX Feedback run's window (`uxf-run-2`) showed "32 new messages (click) ↓": `mac-term.sh read` returned
lines from an hour earlier, with no status bar and no sign of the `AskUserQuestion` it had just opened for Manish. A
screen-reading watcher took that frozen view for an idle session.

**Why:** the fullscreen view stays where it was scrolled while new output arrives below; the read shows only the visible
rows.

**How to apply:** when that line shows, read the session's transcript instead (the newest `.jsonl` whose `customTitle`
is the session's name): a last `tool_use` `AskUserQuestion` with no `tool_result` after it means it waits on Manish; a
last assistant record that is text alone means its turn ended. Or `SendMessage` with `notify_when_idle: true` and no
message: one notice when its turn ends or it exits, scrolled or not. Never send keys to un-scroll: a dialog may be
open (Enter answers it, Esc cancels it). A watcher that reads screens counts that line as "cannot see", not idle
(`~/.address-ux-feedback/autowatch/parked.zsh` does). Related: [[feedback_controller_closes_finished_sessions]],
[[controller_session_workflow]].
