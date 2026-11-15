---
name: feedback-maintain-planner-and-handover
description: "Manish wants a planner/tracker/learnings stock maintained across sessions, handover notes at session end, and (2026-09-15) a HAND-OFF whenever context passes 45–50%: stop at the next clean point, write the brief, spin up a NEW session (Fable, max effort, RC on) and paste it"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 50ce1258-aa2f-46b8-831f-1d8fc14f9b9f
  modified: 2026-10-24T14:44:39.034Z
---

On long multi-session builds, maintain **one planner/tracker doc** and update it
every session. It must answer four things: what is done, where we are, what is
next, and what we already got wrong once.

At the end of a session, also write **handover notes** the user can paste into a
fresh session — self-sufficient, with file paths, the exact open work item, and
the commands to run.

**Context rule (2026-09-15, said mid-session on the visual-first work):** *"whenever
the context window grows beyond 45 to 50%, let's pause the work at the next best
opportunity where it can be handed off and spin off a new session … Fable, max
effort, RC on … paste the handoff notes and it can continue the work."* So: watch
`/context`; past ~45 %, finish the current bounded step (tests green, commit
pushed), write the dated `HANDOFF-*.md` (living state stays in the planner and
tracker), update the learnings file and memory, then start the new session
(keystroke-free spawn per [[howto_spawn_claude_session_keystroke_free]], or tell
him it is ready to paste). The work is expected to span many sessions; the
planner, tracker and learnings stock are the memory between them.

**Why:** stated 2026-07-28 on the Alfred Studio film — *"lets maintain a planner
and tracker doc from here on so that we keep capturing what's done, where we
are, what's next and learn from every session and not do same mistakes again and
again."* The driver is repeated mistakes across sessions, not status reporting.

**How to apply:**
- Include a **Lessons** section of things that went wrong once, with the
  mechanism, not just the symptom. That is the part that earns its keep.
- Include a **settled, do not re-litigate** section so a later session cannot
  helpfully undo hard-won decisions.
- **Snapshot whatever the user says they like, immediately**, before the next
  edit. On the film this meant copying the approved master and its source to
  `APPROVED-v3-*` at the project root.
- Log each session in one row: date, what happened, outcome.

First instance: `~/Downloads/AlfredStudio/PLANNER.md` and `HANDOVER.md`.
Related: [[hackathon-alfred-studio-film]]

- 2026-10-24: a UX feedback build run (UX-0007, one issue end to end) reached 77% context at its follow-up PR without a hand-off, because it never measured its context; Manish asked why. In any build run (in learnlikemagic: an `/address-ux-feedback` build), measure context at each milestone (after the first pass, after the PR opens, before each long wait: the iPhone regression, the gate, CI) and hand off on the PR at 45 to 50%. A controller tending such runs measures each live run's context at every event it handles (the last `usage` in the run's transcript) and tells a run past 45% to hand off at its next clean step; the auto-watch's launch prompt (`~/.address-ux-feedback/autowatch/launch-run.zsh`) carries the rule since 2026-10-24.
