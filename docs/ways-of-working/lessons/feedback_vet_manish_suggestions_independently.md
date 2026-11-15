---
name: feedback-vet-manish-suggestions-independently
description: "Manish wants his OWN factory suggestions adversarially vetted with independent subagents — test the premise, never hand a subagent his rationale as a given"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: ea08740d-0c81-4c0b-ae0f-4ab49858d0b7
  modified: 2026-08-17T15:28:01.533Z
---

During the factory-architecture collaboration (started 2026-08-17), Manish asked
that **every suggestion he sends be carefully vetted and validated with
independent subagents** before I act on it. His idea is the audit target, not
just its implementation.

**Why:** the learnlikemagic codebase is full of beliefs that are confidently held and false —
three prompts enforce a "hard ceiling 15 cards (server truncates beyond it)"
that does not exist anywhere in `explain_validate.py`; `chapter_refiner.md` and
`lens_structure.md` both assert "both gate judges hard-fail" an out-of-band
section count, but `chapter_judge.md` has no `pass` field at all. A suggestion
resting on one of those premises needs the premise killed, not the change
implemented. Agreeing quickly is the failure mode here, not disagreeing.

**How to apply:**
- **Test the premise first**, before feasibility. If the belief behind the
  suggestion is wrong, that IS the answer — say so and stop.
- **Never put his rationale into the subagent brief.** Give the claim, withhold
  the reasoning, and let the agent derive its own verdict. Otherwise the brief
  launders his premise back as evidence — see
  [[lesson-briefed-constraints-become-evidence]].
- Fan out with **different jobs, not the same job N times**: one builds the
  strongest case for, one is told to refute, one traces blast radius. Same-prompt
  duplicates are one opinion sampled twice (the exact defect in the Explain
  factory's "dual" gate, which calls `gateJudgePrompt()` with identical args).
- **Blast radius is usually the real finding.** The recurring failure in these
  factories is a rule reaching one prompt of several. A one-prompt change is
  almost always wrong; check every consumer.
- Check cost/size claims against measured numbers, not the audit docs — both
  token audits are stale in the wrong direction, and both measurement tools are
  themselves wrong (see [[project-factory-architecture-review]]).
- Give a plain verdict: agree / disagree / agree-with-modification, with
  file:line. Say so directly when he is wrong.

Related: [[feedback-adversarial-verification-pays]],
[[lesson-briefed-constraints-become-evidence]],
[[project-factory-architecture-review]], [[feedback-soft-prompt-guidance]]
