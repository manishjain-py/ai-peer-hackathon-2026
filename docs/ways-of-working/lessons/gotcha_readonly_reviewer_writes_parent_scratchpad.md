---
name: gotcha_readonly_reviewer_writes_parent_scratchpad
description: "A sub-agent told 'read only, never run or import repo code' still wrote ~13 scratch scripts into the PARENT session's scratchpad and overwrote its helper (context.py); a factory Workflow's agents do it too (542 files, overwrote a conductor's measure.py, 2026-10-21); say 'write nothing anywhere' and keep your own files in a uniquely named scratchpad subfolder"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 6da30fac-32c7-4464-8b67-d634dfd8bcbb
  modified: 2026-10-22T01:32:19.000Z
---

Seen 2026-10-14 (code-health-names, PR #583): a general-purpose reviewer sub-agent, briefed "Read only. Never edit,
write, commit… never run or import repo code", re-implemented the report sanitizer in its own scripts and wrote them
(keys.py, budget.py, cutprobe.py, titles.txt …) into the parent's scratchpad, overwriting the parent's
`context.py` (the context-measuring helper). No repo harm, but the parent lost a tool mid-task.

**Why:** the scratchpad is shared by the session and its sub-agents; "read only" was read as "read only the repo".

**How to apply:** brief reviewers "write no file anywhere, the scratchpad included; model in memory or not at all",
and give your own helper scripts distinctive names (e.g. `measure_context.py`). Its reviews were otherwise
excellent: four rounds found a real redaction leak and a report-publication bug. See [[feedback_adversarial_verification_pays]].

Seen again 2026-10-21 (session visuals-speed-run-1, a measured Leg V run): the visuals factory's Workflow agents
(board authors, reviewers, the decide agent) wrote 542 working files (crops, renders, `build_decisions.py`,
`card12.js`, …) into the CONDUCTING session's scratchpad during the 6.6 h run, one of them `measure.py`, which
overwrote the conductor's copy of the measurement script it needed after the run. Workflow agents share the
session's scratchpad like sub-agents do. **How to apply:** before launching a factory, put your own scripts and
state in a uniquely named subfolder (e.g. `<scratchpad>/vs4/`), never at the scratchpad's top level.
