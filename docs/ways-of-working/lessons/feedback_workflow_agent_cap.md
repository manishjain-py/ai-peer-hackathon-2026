---
name: feedback-workflow-agent-cap
description: Manish's rule (2026-09-04) - any dynamic Workflow in this repo runs 3-5 agents max; batch items per agent, never one agent per item
metadata:
  type: feedback
---

Any Workflow (dynamic multi-agent orchestration) runs **3 to 5 agents at most**. Never one agent per item
(per finding, per file, per question). Said on 2026-09-04 when a blind-review workflow spawned one
refuter per finding: 67 agents.

**Why:** Every agent pays the same setup cost (reading the brief, the evidence, orienting in the code),
so per-item fan-out multiplies that cost by the item count; the 67-agent pass hit the account's Fable
usage limit and had to be salvaged. Manish considers the fan-out itself wasteful, not just the quota hit.

**How to apply:** Batch items per agent (group by lens, file or subsystem, balance batch sizes). Split a
bigger job into sequential workflows of at most 5 agents, reading each result before the next. Prefer
doing small checks inline over spawning agents at all. Open question, never answered: the content
factories themselves fan out to 20+ parallel slot authors per chapter; whether the cap applies to them
is Manish's call, so ask before "fixing" a factory to comply. The initiative where the rule was first
recorded was later scrapped ([[project-factory-review-series-scrapped]]); the rule itself stands.
