---
name: lesson-number-for-manish-needs-real-args-and-denominator
description: "A count or rate in a question for Manish is recomputed from the run's real arguments and its true denominator before sending; two wrong numbers reached him on 2026-11-03"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 9f7f52dd-abff-4b44-b6fa-f36cdf0d8973
  modified: 2026-11-03T15:47:55.093Z
---

Before a number goes into a question for Manish (a count of risky steps, how often something happens), recompute it
from the real thing: the arguments each kind of run actually passes, and the true denominator.

**Why:** on 2026-11-03 (Teacher Feedback QA, DESIGN §11 "Question 2") the inline-Python question first said "up to 17"
steps. With the factory's real arguments (telemetry off, imports off) a fix run reaches 3. A Manish-approved
bigger-change walk re-runs whole factories with imports live and reaches about 21 more. Then "bigger changes are rare
(2 of 39)" was wrong too: only 2 of the 39 feedbacks had ever run, and both were bigger changes. Each wrong number
reached him, or nearly did, before a correction followed.

**How to apply:** split the count by every run type that reaches the thing, and grep the gating flags (in learnlikemagic: `obs`,
`importMode`, mode args) per call site. A rate names what was actually measured ("2 processed, both X"), never the
whole population. Same spirit as [[lesson-time-in-a-record-from-the-clock]] and [[feedback-vet-manish-suggestions-independently]].

**Count from the agents' transcripts, not the workflows' text** (2026-11-05, the same build): the design's "3 plus
about 21" Python steps came from reading the workflows. A script over the agents' transcripts
(`~/.claude/projects/<cwd folder>/<session id>/subagents/workflows/wf_*/agent-*.jsonl`) counted about 2,330 Python
calls of their own, which put Python on the fenced runs' command list and changed the package. The script cost nothing.
