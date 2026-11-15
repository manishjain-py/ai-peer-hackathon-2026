---
name: gotcha-zsh-history-modifier-after-variable
description: In zsh `$H:llm-backend` is read as the `:l` modifier on $H, so `git show $H:path` breaks; write `${H}:path`
metadata:
  type: feedback
---

`H=abc; git show $H:llm-backend/x.py` runs with `abc` lowercased and `lm-backend/x.py` after it: "fatal: ambiguous argument". `$H:$P/x` is fine; a path starting with a modifier letter (l, u, h, t, r, e) is not.

**Why:** zsh applies history modifiers to parameters.
**How to apply:** always `${H}:path` in shell commands (seen 2026-11-04, tfqa-p5-2). Also `--include=*.py` fails unquoted ("no matches found"): quote it, or use `git grep` with quoted pathspecs.
