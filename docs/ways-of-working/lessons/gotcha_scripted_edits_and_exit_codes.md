---
name: gotcha_scripted_edits_and_exit_codes
description: "A scripted docs edit or a chained command trusted an exit status and did the wrong thing: half an edit committed to main, two sections cut, two lines glued, a commit silently skipped. set -e, exact anchors asserted once, no % formatting; know what decides each exit code"
metadata:
  type: feedback
---

Seen in learnlikemagic's Teacher Feedback QA build, 2026-11-03 to 11-06:

- **A docs edit by script died half-way and its commit still ran.** Python's `%` formatting read "75% of" as a
  format spec, the script died after the first of its two files, and with no `set -e` the next line committed:
  `1bf9f0cee` holds the plan file's half alone.
- **A Python slice edit of `STATE.md` cut two whole sections.**
- **A regex that read each space as `\s+`** also matched the newline before an old text that began with spaces,
  and its swap glued two lines of `check.py` (the tests' collection error caught it).
- **`grep -c` exits 1 when it counts 0**, so `grep -c ... && git commit ...` silently skipped a commit.
- Also misleading: a trailing `ls` of absent paths makes the whole Bash call read exit 1; a background server
  stopped with `kill <PID>` reports exit 143 (its own SIGTERM, expected); pytest given one wrong path prints
  "collected 0 items" with no error in its last lines.

**How to apply:** start a scripted edit with `set -e` and commit in a separate step, after checking the result
(`git diff --stat`, the doc's headings listed). Replace between exact anchor strings and assert each matched
exactly once; build strings by joining, never `%`; match a wrapped phrase from a word or as the exact string,
never `\s+` across lines. Never chain `&&` after a count: test the printed number. Read a test run's collected
count, not only its tail. Related: [[gotcha_grep_is_ugrep]], [[lesson-unexercised-guard]].
