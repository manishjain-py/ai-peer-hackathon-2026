---
name: gotcha_log_tail_progress_bars_and_buffered_python
description: "Two traps when reading a background job's log: tail -n prints a whole carriage-return progress bar as one giant line (about 10,000 tokens once), and a Python script's output to a file is block-buffered, so the log looks empty until it exits"
metadata:
  type: feedback
---

**Seen 2026-11-14** (AI Peer demo video, worker ai-peer-video-wp1).

1. A log captured from a tool that draws a download progress bar (here Ultralytics fetching a
   120 MB model file under `uv run`) holds the whole history of the bar on ONE line, redrawn with
   carriage returns. `tail -n 5 log` printed all of it: about 10,000 tokens of
   "Downloading ... 43% ━━━" into the session's context.
2. A Python script started in the background with `> log 2>&1` showed an empty log for four and a
   half minutes while it worked fine (a paid video call): Python block-buffers its output when it is
   not writing to a terminal.

**Why:** `tail -n` counts newlines, and a carriage-return bar has none. Buffering hides progress
exactly when you want to check on a long call.

**How to apply:** read such a log with `command grep -a -E "<the lines you need>" log | cut -c1-300`,
never plain `tail` or `cat`; or translate first: `tr '\r' '\n' < log | tail -n 5`. In a script whose
output will be logged, call `sys.stdout.reconfigure(line_buffering=True)` at the start (or run
`python -u`), so each line shows at once. Related:
[[gotcha_background_pipe_held_by_started_daemon]], [[lesson_big_context_makes_polling_expensive]].
