---
name: lesson-tightened-rule-flips-controls-and-masks-red-tests
description: "Before tightening a validation rule, run the old suite on old and new code side by side: list every passing control that flips, and every red test the new rule now refuses for a different reason"
metadata:
  type: feedback
---

Tightening a rule (a validator, a refusal check, a parser) changes two kinds of existing tests, and only one of them
fails loudly:

1. **Flipped controls:** a test that asserts some input passes now fails. That is loud, but it is an approved
   behaviour being taken away, so the owner of the rule rules on it before the test changes.
2. **Masked red tests:** a test that asserts some input is refused still passes, but now the new rule refuses it for
   another reason. It no longer tests what its name says, and nothing fails to tell you.

**Why:** telugu-wp8a-12, 2026-11-15 (learnlikemagic PR #744, fold 6). The new rule required the stem's stop before
the options. Two approved controls flipped. A sign test that left the stop out stayed green, but only because the
missing stop now refused it; with the sign check broken it would still have passed. The controller wanted the flips
named before any test changed, and fixing the masked one took one word (say the stop) once it was found.

**How to apply:**
- Build the new rule in a scratch copy first. Run the whole affected suite on the old copy and on the new one, and
  diff the per-test outcomes (`pytest -rA`, parse `PASSED`/`FAILED <nodeid>`). That diff is the flip list: send it
  before you change a test.
- For each red test whose input the new rule touches, check that it still fails for its own reason. Put the same
  input with the tested difference taken out through the new rule: if it is still refused, the test is masked. Fix it
  by making the input satisfy the new rule (here, add the stop), then confirm it is refused by its own difference alone.
- A diff-based "weakened test" check (assert lines removed vs added) sees neither kind: an input edited inside a
  tuple counts as zero asserts changed.

Related: [[lesson-unexercised-guard]], [[feedback-ab-needs-a-control]].
