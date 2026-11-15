---
name: lesson-only-claim-needs-every-reader
description: "Before Manish approves a privacy or data sentence that says a field is 'read only to X', grep every reader of that field; a PR reviewer found two more uses of an approved line and he had to be asked twice"
metadata:
  type: feedback
---

On learnlikemagic (practice-visuals, 2026-11-15), Manish approved a children's-privacy changelog line saying two new columns are "read only to open the child's own start sheet on the last pick and to show Easy beside the child's own scores". The launch PR's fresh reviewer found two more readers of the same column (the runner draws an Easy set from it; "Practice again" starts at it). The sentence was incomplete, the PR merged without it, and the wording went back to him as a second question.

**Why:** an "only", "never" or "just" sentence about data is a claim about every reader, and the person who drafts it usually knows the one screen they built. Privacy and legal wording is his to approve, so every redo costs his attention.

**How to apply:** before sending privacy or data-use wording for approval, grep the field's name across every package and platform (backend serializers, website, iOS, Android, scripts, analytics) and name each use in the sentence, or phrase it by purpose ("read only for the child's own practice: ..."). Have the drafter's reviewer check the "only" against the code before the ask, not after. It happened twice the same day: the corrected sentence, asked the same way, still left out a use the asker had just found ("Practice again") and kept two older imprecisions, and a fresh read-only reviewer of the exact text found all four in 11 minutes. So run that fresh reviewer on the exact text first, then ask once. Related: [[lesson-invariant-claim-needs-every-writer]] (the same for writers).
