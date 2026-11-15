---
name: gotcha-zsh-word-starting-with-equals
description: "In zsh an unquoted word that starts with `=` is a command-path lookup (EQUALS): `echo ===` fails 'no such file' / '=== not found' and the rest of that && chain never runs"
metadata:
  type: feedback
---

Found 2026-11-08 (`tfqa-fixaudio-4`): a section separator `echo ===` between two `git show` reads in one Bash call printed
`(eval):1: === not found` and the second read never ran. zsh's EQUALS option expands `=name` to the path of the command
`name` (`=python` becomes `/usr/bin/python`), so any unquoted word starting with `=` is looked up as a command.

**Why:** the harness runs Bash calls through zsh, so a bash habit (`echo ===`, `echo =====`) silently drops the commands
after it in a `&&` or `;` list.

**How to apply:** quote such words (`echo '==='`) or use a separator that does not start with `=` (`echo ---`).
