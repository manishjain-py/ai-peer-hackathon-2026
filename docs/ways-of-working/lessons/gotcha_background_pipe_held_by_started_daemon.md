---
name: gotcha-background-pipe-held-by-started-daemon
description: A background Bash task that pipes a script which starts a daemon into `tail` never finishes, and you never see the script's output
metadata:
  type: feedback
---

**Never pipe a script that starts a long-lived server into `tail` (or any reader).** Redirect it to a file instead:
`bash setup.sh > <scratch>/setup.log 2>&1; echo "exit $?"; tail -40 <scratch>/setup.log`.

Hit 2026-11-12 (learnlikemagic `/ship-chapter`, `bootstrap.sh | tail -60` as a background task). The script started uvicorn with
`( cd X && nohup python -m uvicorn … > log 2>&1 & )`. The redirect covers only the server. The `&&` list's own subshell
keeps the ORIGINAL stdout, which is the pipe into `tail`, and lives as long as the server does. So the script exited after 90 s,
but `tail` never saw EOF and printed nothing. The task sat "running" for 30 min, with the script's error held inside `tail`.

**Why:** a pipe stays open while ANY process holds its write end, and a backgrounded subshell inherits it even when its child
redirects its own output.

**How to apply:**
- Run setup scripts that start daemons with stdout and stderr sent to a file, never a pipe.
- If you are already stuck: `ps -o pid,ppid,pgid,command` shows the orphaned subshell (PPID 1) holding the pipe. Kill only the
  recorded `tail` PID (never the process group, which also holds the server). The task then ends with exit 143, and the server lives on.
