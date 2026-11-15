---
name: lesson-unexercised-guard
description: "A check that has never gone red has not been tested, only unexercised — three guards stayed green through a defect they were written to catch, including one that passed vacuously"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 726213eb-808c-49c7-a5ea-667af64e7878
  modified: 2026-07-29T12:15:10.011Z
---

**A guard calibrated on a broken system certifies the breakage. A check that has
never failed has not been proven; it has only never been exercised.**

Alfred Studio, 2026-07-29. Three guards were green for the entire period the
mascot was visibly broken, and each failed in a different, reusable way:

1. **Vacuous pass.** `circle stays inside` filtered on `if (s.circ && ...)`. Once
   the circle was removed the filter matched nothing, so it printed the
   reassuring branch — confirming containment inside a circle that no longer
   existed. **An empty result set and a clean result look identical.** Always
   print the sample count: "stays inside (measured on 219/219 frames)".
2. **Never fired, therefore never tested.** `POP_POS = 16` reported 23 defects
   the instant the subject was given real movement. Calibrated afterwards against
   the APPROVED reference, four of its five scenes exceeded 16 by two to seven
   times. It was never a defect threshold — it was a stillness threshold, and it
   stayed green for exactly as long as the thing it guarded was broken.
3. **Measuring the wrong extent.** A clearance check read an SVG *layout box*,
   square because it reserves headroom for an accessory the subject was not
   wearing. It reported 57px of margin on a shape whose ink was 136px clear.
   Chasing that number made the output worse twice. The tell: the two rules it
   enforced had exactly ONE solution in common and zero slack, **which is the
   shape of a constraint that is not real.**

**How to apply:** Calibrate every threshold against a known-GOOD reference and a
known-BAD one, and record both numbers in the file next to the constant. Treat a
never-red check as unverified until you have made it go red on purpose. Prefer
context-aware tests (is this frame an outlier against its neighbours?) over flat
ceilings, because a flat ceiling cannot tell fast from discontinuous. And when a
guard's number and your eyes disagree, look first — then fix whichever is
actually wrong, which is sometimes the guard. Related:
[[lesson-metric-vs-what-user-sees]], [[gotcha-check-measures-what-you-think]],
[[feedback-adversarial-verification-pays]].

**Making it go red without `git stash`** (learnlikemagic, Teacher Feedback QA, 2026-11-03 to 11-06): prove a new
test red on the old code in a throwaway worktree, `git worktree add --detach <scratch>/redwt <base sha>`, copy the
new test in, run it, then `git worktree remove --force <scratch>/redwt`; for one file, `git show <base>:<path>` into
a temp copy. A stash misled there: a whole stash also reverted the new test (an edit to a tracked test file), so the
run proved nothing; it changes the files under a reader still reading that worktree; and its stack is shared by
every worktree of the clone, so parallel builders' stashes mix.
