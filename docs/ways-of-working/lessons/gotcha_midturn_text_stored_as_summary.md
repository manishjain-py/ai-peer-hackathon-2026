---
name: gotcha_midturn_text_stored_as_summary
description: "A long text block written in the middle of a turn can be missing from the session's transcript: the record holds a one-sentence thinking summary instead (thinkingDisplay 'updates'), so a word-for-word question checked from the transcript must be the turn's final message"
metadata:
  type: feedback
---

On 2026-11-15 (learnlikemagic, `codex-factories-controller-89`, session `14577d59-...`) the controller restated
Manish's open question word for word as a text block in the middle of its first turn (about 09:26:46 UTC), between
two tool calls. Its transcript has no text record of it: at that point there is only a `thinking` record with
`thinkingDisplay: "updates"` holding a one-sentence paraphrase ("The update is ready apart from one open
question ..."). The seven short status lines written mid-turn in the same session were all recorded as text, and the
predecessor's mid-turn restatement (06:43:08, 1,645 characters) was too, so the cause is not known; the same
question repeated as the turn's final message was recorded as text (09:33:42, 1,372 characters).

**Why it matters:** a script that records the person's answer by checking the question's words in the transcript
(here `c89_ans113.py`) fails, and it is not known whether the person saw the first copy on screen.

**How to apply:** put a word-for-word question in the turn's final message. Before relying on it, find it in your
own transcript as an `assistant` record whose content has a `text` item holding it; if it is missing, say it again
as the final message.
