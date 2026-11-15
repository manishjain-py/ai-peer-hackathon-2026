---
name: lesson-remeasure-cites-by-sentence
description: When a change moves code that docs cite by line number, re-measure each cite by what its sentence says, not by mapping the old number; mapping double-shifts cites already re-measured and keeps cites that were already wrong
metadata:
  type: feedback
---

A reviewer flags one stale `file:line` cite and you fold "the class". Mapping each old line number to its new place
(diff alignment) looks exact but fails three ways (learnlikemagic #723, 2026-11-08: two fresh readers found about 25
misses in a 50-cite fold):
- a doc line the same PR already re-measured gets shifted a second time;
- a cite that was already off before the change stays off, now with your name on it;
- a scanner keyed on one cite format misses the rest (comma lists `:39,127-128,186`, `(:183)`, `184 to 192`, a number
  ending a sentence, sizes like "624 lines").

**Why:** a cite's truth is what its sentence claims about the code, not where an old number used to point.

**How to apply:** skip doc lines the change itself wrote (`git blame` against its commits); for every other cite into a
changed file, read the sentence and find the lines that hold it (a read-only sub-agent can build the old→new table);
apply the table with a script that refuses any old text not found exactly once on its line; have a fresh reader check
each edit at both ends with `git show`; and word the commit message to claim only what was swept. Related:
[[feedback-adversarial-verification-pays]].
