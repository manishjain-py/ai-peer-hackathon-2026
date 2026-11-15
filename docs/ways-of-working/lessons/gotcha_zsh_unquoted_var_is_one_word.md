---
name: gotcha_zsh_unquoted_var_is_one_word
description: "In the Bash tool's zsh, `$var` holding 'a b c' is passed as ONE argument (no word splitting): `kill $pids`, `black $files`, `$CLI list` all fail, silently under 2>/dev/null; use ${=var}, an array, or a function"
metadata:
  type: feedback
---

Seen three times in one session (2026-09-23, WP1): `F="a.py b.py"; black $F` → "Path 'a.py b.py' does not exist";
`CLI="venv/bin/python scripts/x.py"; $CLI list` → "no such file or directory: venv/bin/python scripts/x.py";
`pids="1 2 3"; kill $pids 2>/dev/null` → nothing killed, no message.

**Why:** zsh does not word-split unquoted parameter expansions (bash does). The harness shell is zsh.

**How to apply:** `${=F}` to split, or arrays (`files=(a.py b.py); black $files`), or a shell function
(`cli() { venv/bin/python scripts/x.py "$@"; }`). The silent `kill` case is the dangerous one both ways: it once
saved the other lanes' gates from a PID list wrongly collected by pattern, and it can just as silently leave your
own stale process running. Kill by explicit PIDs after checking each PID's cwd (`lsof -a -p PID -d cwd`), never
by pattern ([[gotcha_pkill_by_pattern_kills_other_sessions_gates]]). Sibling: [[gotcha_zsh_unquoted_grep_include_glob]].
