---
name: lesson-disjoint-subagents-keep-a-big-package-in-one-session
description: A big script package fits one session when 3-5 sub-agents build disjoint files from one shared brief; each cost the parent about 1% context, against 33% to read the code itself
metadata:
  type: feedback
---

On P6 (2026-11-04) reading the code cost `tfqa-p6-2` 33% of its context before its first sub-agent; six sub-agents then built about 16,000 lines for about 1% each. What made it work: one shared brief file in the scratchpad (no git writes, nothing real, absolute paths, the seams between parts written out, a 250-word report), disjoint file ownership, one shared seam moved by the parent BEFORE launch, and the parent committing by name as each finished.

**Why:** a parent that reads everything hits the 45-50% hand-off before it builds anything ([[feedback_workflow_agent_cap]] still caps it at 3-5 at once).

**How to apply:** read only the seams, write the brief, launch, and treat each report's "my calls" as claims. Their reports found real defects: a guessed data shape in an earlier commit, a printed step with no code behind it (`merge` on a QA walk). Sub-agent code still needs an independent reviewer: the parent read reports, not every line.

**Builders in one worktree** (Teacher Feedback QA P7, 2026-11-05 to 11-06): never `git stash` (one stack for every worktree of the clone; prove red as [[lesson-unexercised-guard]] says); run pytest with `-p no:cacheprovider --no-cov`, or coverage writes `htmlcov/` and `.coverage` into the shared tree; a test that hashes the live tree (learnlikemagic's change-scope contract) fails while they write and passes once they stop, so run it after the last commit.
