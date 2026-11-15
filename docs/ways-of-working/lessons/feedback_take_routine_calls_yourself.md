---
name: feedback_take_routine_calls_yourself
description: "Manish (2026-11-05): take routine calls yourself on the recommended option and move on; ask him only when you need his real opinion"
metadata:
  type: feedback
---

Manish, 2026-11-05 14:15:58 UTC, answering a merge question in the Telugu build's controller session
(`codex-factories-controller-54`), word for word: "And please feel free to take such calls yourself, right? Unless
you have a real opinion that you need from me, then only reach out to me. Otherwise, just take your call and move
forward autonomously."

The call he meant: a merge where every test, review and proof had passed and the recommendation was clear.

**Why:** he was being asked to rubber-stamp calls whose answer was already obvious (all green, one recommended
option). Each question costs him a context switch and stalls the build until he replies.

**How to apply:**
- When a choice has a clear recommendation and the evidence is in, take it yourself. Record it where the project
  keeps decisions, and tell him in one line what you decided and how to undo it. He can still object.
- Still ask him (one at a time, short, with a recommendation, [[feedback_design_interview_format]]) when the call
  needs his own judgment: his ear or eyes (a voice, a content sample, a chapter going live), money beyond the plan,
  opening a feature to children or users, legal or privacy wording, anything where his own stated view differs from
  your recommendation, and a principle edit.
- **Merges are not questions**, High risk included. A house rule that a High-risk merge needs his word naming the area
  is met by this standing rule: never send him an approval question for a merge whose proof is in. Record the
  decision, give the merge word, tell him in a line. He pushed back the one time a controller asked anyway
  (2026-11-05 16:31:35 UTC, after a reviewer flagged the house rule, word for word): "I thought we discussed that you
  will not be asking me all these small questions and only ask me where you really need my opinion on something,
  isn't it? Am I missing something?"
- In learnlikemagic the Telugu build records its reading of this rule in
  `docs/feature-development/telugu/DESIGN.md` §0.1 (answer 97).
