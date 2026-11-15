---
name: feedback_ab_needs_a_control
description: "Every prompt A/B needs a same-prompt control and replicates; a 2-0 from one draft per cell is what identical prompts do"
metadata:
  type: feedback
---

A blind A/B on **one draft per cell cannot tell two prompts apart**. Measured 2026-09-08 in the
writer series of the LearnLikeMagic factory review (repo `~/repos/llm-factory-review`): judging the
shipped `writer_continuous.md` against **its own earlier draft** (same prompt, same pinned inputs,
blind and order-swapped) produced a decisive 2–0 on a chapter and won 3 of 4 calls, with a mean
score gap of **0.44** between two drafts of one prompt against **0.53** between two *different*
prompts. The prose lenses were no better: the same prompt's `major` finding rate went 0.83 → 1.60
per 1,000 words between its two runs.

So: **every A/B carries a same-prompt control, read before the verdict; replicates are not
optional (3 per arm per guideline was the floor for a verdict in that series); and lead with a
measurement that has no model in it.** In that series the script-counted sentence length separated
the arms by 4–20× the run-to-run spread and held across runs — the judge verdicts and the lens
counts cleared nothing.

Also: **measure a metric's run-to-run spread before trusting it.** Word count held to ±5 % and
long-sentence share held its band; paragraph count (271 → 188 for one prompt) and lens counts
did not.

**Why:** without the control, an experiment reports noise as a result — this one did, and the
first report had to be corrected. Manish makes prompt decisions off these reports, so a verdict
that cannot survive its own control is worse than no verdict.

**How to apply:** in any prompt experiment, add the control as an extra arm (the same prompt run
again, or an earlier run's drafts) and report it first. In llm-factory-review: declare it in
`lib/ab-prompt/` with `draft_from` pointing at an earlier run's drafts (no writer calls) and add it
to `pairs`; the rule is written into that repo's `docs/review-protocol.md` ("Experiments") and
`lib/ab-prompt/README.md`. When a later run overturns an earlier conclusion, **add a correction
note to the old report and never rewrite it**. Background: llm-factory-review memory:
project-factory-review-three-parts.md, user-targets-not-hard-numbers.md.
