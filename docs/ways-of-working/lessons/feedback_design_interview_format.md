---
name: feedback_design_interview_format
description: "Manish wants questions ONE AT A TIME with a short plain-language explanation before each — for design/UX reviews and for any decision point"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: bcb58700-d2bf-476e-a323-abbbb8671212
  modified: 2026-08-16T17:11:02.673Z
---

**Generalised 2026-08-16: this is not just for design work.** ANY time you need his
input on more than one thing, ask **one question at a time**, each preceded by a
**short, plain-language explanation** of what the choice is and why it matters.
Never batch several decisions into one AskUserQuestion call, and never dump the
decisions as a bullet list at the end of a long reply. He said it plainly: *"ask me
one by one wherever you need my input after explaining in easy manner and short."*

For design / UI / UX / behavior decisions, Manish prefers an **interview**: ask ONE question at a time (AskUserQuestion), each with context + where to check in the running prototype + a recommendation; when his answer needs something visual, **build it live, rebuild the prototype, and let him check on his phone before answering** (e.g. the wall-theme pills and white-board toggle during the learning-screen interview, 2026-07-08). He may answer with a counter-question or a brand-new idea via Other — treat that as a sub-loop, resolve it, then continue.

**Why:** he decides fastest against a live artifact, one decision at a time; batch questions get shallow answers and he loses track while checking the app.

**How to apply:** plan the question sequence top-of-screen → down, then behaviors, then big/content calls, then rollout; recommendations first, marked "(Recommended)"; log every decision into the feature's DESIGN doc as a numbered locked-decisions table (in learnlikemagic, see `docs/feature-development/learning-screen-ux/DESIGN.md` §0); update prototype + docs + commit at the end. Related: [[project_learning_screen_ux]], [[feedback_experimentation_mode]].

**Order of questions (added 2026-10-05, the content-factory interview):** ask the question that can flip the whole plan FIRST, and only once the code map is in hand. There, five answers were collected for a separate repo before the "how do the two repos share the database layer and the renderer" question made Manish drop the separate repo; that one question replaced three earlier answers. He also reverses a decision when shown its real footprint (the Codex retirement), so put the measured facts in the explanation above the question, not after his answer.

**When he answers with his own design (2026-11-05, Telugu question 94):** lock his own words as the answer and ask only the one new choice, in two or three short lines. A confirm that restated his idea plus two tweaks as three bullets with context drew "in questions that need my input in simplified manner and in short."

**Ask while he is at the Mac** (Teacher Feedback QA, 2026-11-09 to 11-11): he answered six questions within minutes each time he was present, and was silent for hours between. Have the next question's facts checked before he arrives; when he is seen working (another build's sign-in), one reminder is enough.
