---
name: gotcha-running-session-ignores-settings-file-edit
description: A running Claude Code session does not reload the file passed with --settings; an edit to it took no effect (the next cross-session message was still held), and a launcher that writes that file at each start overwrites a live edit, so change the generator and restart
metadata:
  type: feedback
---

learnlikemagic, 2026-11-15: teacher-feedback-watch-1 runs as `claude --permission-mode manual --setting-sources project
--settings ~/.teacher-feedback-state/settings-teacher-feedback-watch-1.json`. To let a bypass session message it, that file
got `"crossSessionInbound": "accept"` and `SendMessage` moved from deny to allow. The next message from the bypass session
was still held at the watch's screen and expired. No managed settings exist on that Mac and no project file sets the key, so
the edited `--settings` file was the only source, and the running session had not reloaded it. (Claude Code's docs say
settings files are watched and reloaded, naming user, project, local and managed settings, not a `--settings` file.)

**Why:** a session reads its `--settings` file at start; the file's later edits wait for its next start.

**How to apply:**
- To change a running `--settings` session's permissions or inbound messages, change the file and restart the session; a
  live edit alone does nothing.
- If a launcher writes that file at each start (the watch's `start-watch.zsh` through `run_settings.py`), a live edit is
  overwritten at the restart: change the generator, merge it, then restart.
- Prove a setting change by its effect (a message that arrives, a command that runs), never by the file's contents.

Related: [[gotcha_cross_session_message_held_between_permission_modes]].
