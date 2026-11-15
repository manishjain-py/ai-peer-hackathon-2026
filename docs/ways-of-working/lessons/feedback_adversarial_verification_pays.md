---
name: feedback-adversarial-verification-pays
description: "Pair every multi-agent review lens with a verifier told to REFUTE — about 60% of findings do not survive, and finding without refuting causes pointless work"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 50ce1258-aa2f-46b8-831f-1d8fc14f9b9f
  modified: 2026-07-28T14:31:09.946Z
---

When fanning out reviewers over a large artefact, always pair each finder with a
**verifier whose instruction is to refute**, defaulting to "not real" when
unconvinced. Report only what survives.

**Why:** 2026-07-28, Alfred Studio film. Twelve agents — six lenses (framing,
legibility, cuts, narrative, pacing, fidelity) over 178 stills cut from the
**encoded master**, then one adversarial verifier per lens. Roughly 60% of
findings were refuted, correctly.

What the verifiers killed, and why they were right:
- Every contrast finding. They audited the film against WCAG; the film's own
  hero wordmark measures 3.79:1, so the standard condemned the palette, not the
  label.
- "The chips are unreadable as they grey out" — that *is* the beat.
- "Payout history vs Monetary instruments is inconsistent" — a deliberate
  callback to a dead idea from Act I, and also how people and changelogs
  genuinely differ.
- One finding was a straight misread that would have deleted the only on-screen
  evidence the beat existed to show.

What survived was worth the whole exercise: two high-severity defects six lenses
each found independently, and a real contradiction (the live screen offered an
action the product had refused 30 seconds earlier).

**How to apply:**
- Give each lens a narrow, concrete brief and tell it to cite the exact file it
  saw the defect in. Ungrounded taste notes are noise.
- Sample from the **encoded output**, not the source — review what ships.
- Include the user's original complaints in the prompt so reviewers check
  whether the claimed fixes actually landed. This is how "you moved the crop
  from the frame edge to a card edge" got caught.
- Verifiers should be allowed to raise severity too, with frame evidence.

Related: [[lesson-measure-dont-remember]], [[hackathon-alfred-studio-film]]
