---
name: lesson-invariant-claim-needs-every-writer
description: "Before answering a reviewer with 'X can never happen because the data is always Y', find EVERY writer of that data and check each; telugu-wp4b-5 checked two writers, missed a third, and Codex refuted the answer with a test"
metadata:
  type: feedback
---

On learnlikemagic PR #729 (2026-11-10), CodeRabbit warned that a stored audio clip shared by two lines could silence one of them. `telugu-wp4b-5` answered "not folded: every clip address names its own line", citing the lesson factory's per-line keys and the repair engine's own-line check. Codex's next pass showed a third writer, the translation re-import, which copies one clip onto every line with the same words. The invariant was false, the controller's ruling rested on it, and the fold came an hour later than it could have.

**Why:** a claimed invariant is only as strong as the writer you did not check, and a reviewer that runs code will find it.

**How to apply:** before an answer of the form "this cannot happen because the data always looks like this", list every code path that writes that field (grep the field name across every package, the importers and re-importers included, not only the main producer) and cite each one. If you cannot list them all, say "unreachable today because <the condition that holds now>" instead of claiming the invariant. Related: [[feedback_adversarial_verification_pays]], [[lesson_read_the_primary_note_not_the_summary]].
