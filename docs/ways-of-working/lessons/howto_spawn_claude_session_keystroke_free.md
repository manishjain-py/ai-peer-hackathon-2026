---
name: howto-spawn-claude-session-keystroke-free
description: Spawn a fully configured Claude Code session (model, max effort, name, remote control, first prompt) with ZERO keystrokes via Terminal `do script` + launch flags — works while the Mac screen is LOCKED, when mac-terminal-control's spawn silently fails
metadata:
  type: reference
---

**Verified 2026-09-10 (Claude Code 2.1.267, screen LOCKED — `CGSSessionScreenIsLocked"=Yes`).** The
mac-terminal-control `spawn` drives the session with synthetic keystrokes, which a locked screen swallows
silently ([[mac-terminal-control-display-sleep]]). Apple Events still reach Terminal, and every setup step
has a launch flag now, so no keystroke is needed:

```
cat > /tmp/launch.sh <<'EOF2'
#!/bin/zsh
cd /Users/manishjain/repos/<repo> || exit 1
exec claude --model fable --effort max --name <name> --remote-control <name> \
  "Read /abs/path/HANDOFF.md in full — that is your job. …first prompt…"
EOF2
osascript -e 'tell application "Terminal" to do script "zsh /tmp/launch.sh"' \
         -e 'delay 1.5' -e 'tell application "Terminal" to id of front window'   # prints the winid
```
Then `~/.claude/skills/mac-terminal-control/scripts/mac-term.sh read <winid>` (reads the buffer; works
while locked) — look for the `/remote-control is active · … claude.ai/code/session_…` line and
`thinking with max effort`. The first prompt is submitted automatically as the CLI argument.

**Why this beats the keystroke spawn even when unlocked:** `--effort max` skips the confirm dialog that
used to swallow `/rc`; `--model fable` overrides the machine's `ANTHROPIC_MODEL=opus[1m]` env var (which
otherwise wins over settings.json's `"model": "fable"` for new sessions); `--remote-control <name>` avoids
the silent `/rc` no-op; `--name` replaces the fake `session name - x` command that burned a turn. Put the
command in a script file — quoting a long prompt inside AppleScript inside bash is where it breaks.

**How to apply:** default to this launch for any spawn; fall back to the keystroke helper only for
driving an EXISTING session (keys/submit), which still needs an unlocked screen. Related:
[[mac-terminal-control-spawn-effort-drop]], [[controller-session-workflow]].

**Focus trap (2026-11-04, codex-factories-controller-50):** `do script` makes the new window Terminal's front
window. Manish was dictating to the controller by voice; the second half of his message landed in the new
worker's input (window 1696) and was sent there. Note the front window first and put it back after the spawn
(verified: the front window read 1689 again after `set index of window id prev to 1`):

```zsh
osascript -e 'tell application "Terminal"
set prev to id of front window
do script "zsh <launch script>"
delay 1
set index of window id prev to 1
end tell'
```
Don't `return (r as text)` the `do script` result inside that block: AppleScript cannot coerce the tab to text
(error -1700, after the window is already made). Read the new window id from `mac-term.sh list` instead.
