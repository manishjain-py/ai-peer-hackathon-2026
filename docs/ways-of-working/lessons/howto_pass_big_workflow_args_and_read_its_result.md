---
name: howto-pass-big-workflow-args-and-read-its-result
description: "Workflow args over ~50 KB: embed them in a copy of the script (one line changed, checked by a line diff), never paste them inline; the full return is in tasks/<task id>.output under \"result\", and journal.jsonl holds every agent's result for a rebuild"
metadata:
  type: feedback
---

The Workflow tool takes `args` only inline, so 300 KB of args (a ledger's known behaviours, a diff's
file list, a rulings doc) would have to be read into context and typed back out: ~90k tokens each
way, and a retyped blob can drift. `telugu-parity-1` (learnlikemagic, 2026-11-10, a /parity-check run
with 334 KB of args) instead wrote the args to a JSON file and had a script copy the skill's workflow
with its one args line (`const A = (typeof args === 'string') ? ...`) replaced by
`const A = <json.dumps(args, ensure_ascii=True)>`. It asserted that exactly that one line differed,
checked syntax with `node --check` on the body wrapped in an async function, and ran the copy with
`scriptPath`. Nothing passed through context.

**Reading the result:** the completion notice truncates the return value. The full one is JSON in
`<session tasks dir>/<task id>.output` under `"result"` (plus `logs`, `totalTokens`). Load it with a
script, never by reading the file. `journal.jsonl` in the run's transcript dir has one `started`
(key, label) and one `result` line per agent, so a script can rebuild the return value, or a partial
one while the run is still going, with no model involved. Re-derive any keys the script computed
(e.g. hash-based batch keys), then diff the rebuild against the real result.

**Why:** a big paste costs context twice and risks a silent edit. The truncated notice looks complete
until you count.

**How to apply:** for args over about 50 KB, generate the copy and say so in the report ("main's
script, args embedded, only line N differs"). Start any merge work from the output file or the
journal. Related: [[gotcha_resume_caches_a_preflight_failure]], [[feedback_workflow_agent_cap]].

**Notices echo their args** (Teacher Feedback QA P6, 2026-11-04): each Workflow notification repeats its whole
`args`, 6,000 to 15,000 tokens a time, and one session stood at 39% of its context after 40 minutes. Keep `args`
small; embed big ones as above.
