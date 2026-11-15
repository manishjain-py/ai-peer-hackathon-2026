---
name: howto_answer_prompt_on_locked_screen
description: A Claude Code session stuck at a permission prompt can be answered while the Mac's screen is locked, by Terminal's do script, not by System Events keys
metadata:
  type: reference
---

`mac-term.sh key` and `type` use System Events, which do nothing while the screen is locked. Terminal's own AppleScript still works:

```zsh
osascript -e 'tell application "Terminal" to do script "" in window id <winid>'
```

It writes the text and a Return to that tab's terminal, so `""` presses Enter on the highlighted choice (proved 2026-11-05 on a worker stuck at a "Dangerous rm operation" prompt, screen locked, the prompt cleared in seconds). A digit in the string should pick that choice; not yet proved.

Read the exact command first: from the session's transcript when the screen cuts it off. Lock state: `ioreg -n Root -d1 -a | grep -A1 CGSSessionScreenIsLocked`. Only ever in a window you started or control: [[feedback_controller_closes_finished_sessions]].

More (Teacher Feedback QA, 2026-11-05 to 11-06): `do script "<text>"` can leave the text unsent in a Claude Code
input; a second `do script ""` sends the Enter. `do script "exit"` in a stopped session's window leaves it open at
"[Process completed]"; `close window id <id>` then closes it.
