---
name: feedback-dont-loop-on-minor-review-points
description: "Manish 2026-10-22: never get stuck in review-and-fix loops on minor or unimportant reviewer points; judge relevance, answer the rest in a line, merge"
metadata:
  node_type: memory
  type: feedback
  originSessionId: d8236160-b97b-4586-a8b6-48c7a721cb0c
  modified: 2026-10-22T18:51:57.858Z
---

Fold a reviewer's point (CodeRabbit, Codex, a sub-agent) only when it changes a real outcome on a path that is actually
used: a regression, a wrong result, a broken run. A Minor about an input no caller sends, a leftover file nothing reads,
wording, or style: answer it in one line on the PR (a named follow-up if it is worth doing at all) and go ahead.

**Why:** Manish, 2026-10-22, during PR #618's merge: "let's not get stuck in the loop of review and fixes on minor or
unimportant points. This is a problem that we have faced in the past. So yeah, if there's something is not very
relevant, let's just ignore and go ahead." That PR ran three fold rounds in one afternoon, each costing a full gate
(about 35 minutes), a CodeRabbit hour and a Codex re-review, and every PR comment restarts Codex.

**How to apply:** before folding, ask "does any real run hit this, and what goes wrong for a student or a run?" If
nothing concrete, do not fold. Do not wait on a reviewer's routine re-run of a head it already cleared. Balance with
[[lesson_fix_the_class_not_the_instance]]: a real defect still gets its whole class fixed.

2026-11-03 (PR #697, P2 of Teacher Feedback QA): wording-only folds made BEFORE the gate and the push cost only
reviewer runs, so batch them there; after the gate, answer them (a re-gate a later code merge forces anyway is the
free moment to fold them). A docstring that paraphrases code drew a new wording point in each of three reviewer
rounds; write such a docstring once, as each return with its exact condition, read from the code.
