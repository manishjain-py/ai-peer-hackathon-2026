---
name: howto-survive-5h-usage-window-stall
description: "The 5-hour usage window (not the weekly one) can cut a turn off mid-work at night; read \"Current session\" in /usage before starting sub-agents, and a background sleep that ends after the reset re-invokes the session by itself"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 89b897ec-7e7e-4187-9d50-6811fbbfc255
  modified: 2026-10-05T20:57:03.515Z
---

On 2026-10-05 (content-factory alignment session, Manish asleep) the 5-hour window stood at 87% when
two sub-agents were started; the limit hit 30 minutes later and the turn was cut off. A background
Bash `sleep 2880; echo done` (`run_in_background: true`), started earlier and sized to end just after
the reset, finished at the right moment: its completion notification re-invoked the session, which
carried on unattended.

**Why:** the weekly stop rule (95%) does not see the 5-hour window, and a turn it cuts off at night
has nobody to restart it. Sub-agents draw on the same window and get no warning.

**How to apply:** at every milestone read both lines of `claude -p "/usage" --output-format text`:
"Current session" is the 5-hour window, shown with its reset time. Above about 80%, start no
sub-agent: do cheap local work or wait. Before any stretch that may cross the limit, start a
background `sleep` that ends a few minutes after the reset. A foreground `sleep` is blocked by the
harness; the background one is not. Related: [[lesson_big_context_makes_polling_expensive]],
[[feedback_stop_at_95pct_weekly_usage]].
