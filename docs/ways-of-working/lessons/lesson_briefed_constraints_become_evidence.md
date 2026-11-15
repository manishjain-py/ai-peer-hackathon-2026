---
name: lesson-briefed-constraints-become-evidence
description: "A constraint you put in a subagent brief comes back as justification — nobody re-checks the orchestrator's premises, so verify every \"this is locked\" before you write it"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: ba616222-f12a-4221-a684-e3d9cae0856a
  modified: 2026-07-29T10:01:35.558Z
---

When you fence something off in a brief — "do not change X, it is locked" —
that fence stops being your assumption and becomes a **fact** downstream. The
agent honours it, works around it, and then writes the workaround up citing your
constraint as the reason. If the workaround has a cost, you will later read that
cost justified by your own instruction and find it convincing.

**It happened on the Alfred Studio mascot (2026-07-29).** I told a subagent that
a timing (50.55) was locked to the score and must not move. It obeyed, could not
clear a spec rule as a result, and a waiver was written saying "forced by the
50.55 beat, which is locked to the score". I then read that waiver and accepted
it. An independent auditor checked the score: chord changes at
45.00/49.00/52.20/58.60, accents at 49.10 and 52.20 only, and the string "50.5"
did not occur in the score at all. I had invented the constraint, and then
accepted a violation citing my own instruction as the evidence.

**Why:** Verification effort flows downhill. Reviewers check the work; almost
nobody checks the brief. The orchestrator is the one node in the system whose
claims are never adversarially tested — so a wrong premise there survives every
review and gets laundered into a justification on the way back.

**How to apply:**
- Before writing "X is fixed / locked / cannot move" into a brief, **verify it**
  the same way you would verify a finding. One grep is usually enough.
- Mark unverified constraints as what they are: "I believe X is locked — check
  before working around it, and tell me if it isn't."
- Give at least one reviewer the brief itself as an audit target, not just the
  output. The one that caught this was explicitly asked to prove scope was
  exceeded, and instead found the scope was wrong.
- When a waiver's reasoning traces back to something you said, that is the
  weakest waiver in the set, not the strongest. Re-derive it from the source.
- Keep the withdrawn waiver visible with why, rather than silently deleting it.

Related: [[lesson-measure-dont-remember]],
[[gotcha-check-measures-what-you-think]],
[[feedback-adversarial-verification-pays]], [[hackathon-alfred-studio-film]]
