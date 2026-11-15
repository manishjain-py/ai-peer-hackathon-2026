---
name: gotcha-zsh-test-has-no-string-less-than
description: "zsh's `[` has no `\\<` string comparison: a `while [ \"$(date -u +%H%M%S)\" \\< \"202230\" ]` wait loop ends at once, so a timed push or ask goes out early; compare epoch seconds with -lt"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 179c4ead-a6e0-4974-b2ef-96f49f455ab5
  modified: 2026-11-03T20:53:57.362Z
---

A wait loop written as `while [ "$(date -u +%H%M%S)" \< "202230" ]; do sleep 10; done; git push ...` in the Bash
tool (zsh) does not wait: the `[` test errors on `\<`, the loop ends at once, and the push runs immediately.
On 2026-11-03 (tfqa-p3-8, PR #698) it pushed 6 minutes before CodeRabbit's hourly slot freed, so the head was rate
limited and missed the slot ([[project-coderabbit-limits-and-cost-2026-10]]).

**Why:** the timed action was the whole point; a silent early exit looks exactly like a successful wait.

**How to apply:** wait on epoch seconds:
`T=$(date -u -j -f "%Y-%m-%d %H:%M:%S" "2026-11-03 21:23:30" +%s); while [ "$(date -u +%s)" -lt "$T" ]; do sleep 20; done`
(BSD `date -j -f` on macOS). Print `date -u` right before the action so the log shows when it really ran.
Related: [[gotcha-zsh-unquoted-var-is-one-word]].
