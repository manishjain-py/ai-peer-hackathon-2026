---
name: gotcha_idle_input_line_shows_prompt_suggestion
description: "A worker window's input line showing text like 'continue and merge when green' is Claude Code's SUGGESTED next prompt (unsent), not Manish typing; the controller misread it twice on 2026-09-22 and wrote it into STATE"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 8a2cded2-788a-4a74-bd9b-3c2fe5ee6cd0
  modified: 2026-11-04T03:32:55.158Z
---

On 2026-09-22 (learning-language chain, controller session `ll-controller`) the watch script's idle event quoted
the worker's input line: `❯ continue`, then `❯ proceed autonomously, merge when green and spawn WP6`, then
`❯ carry on, merge when green`, then `❯ continue and merge when green`. I reported it to Manish as him typing into
the window and wrote "Manish typed ... so WP3 takes the WP6 spawn" into STATE. Wrong: no sent user turn ever
appeared in the transcript, the worker's replies followed its own monitor events, and the text changed on every
read. It is Claude Code's context-aware prompt suggestion shown in the idle input box, never submitted.

**Why:** four different "mid-typing" catches in a row is not plausible; a fact about who instructed a session must
come from the transcript (a `❯ <text>` line ABOVE the prompt, followed by the session's reply), not from the
input line.

It can also mimic an answer to a question pending with Manish: on 2026-09-26 (docs-cleanup, controller 3) two idle
workers showed `❯ Q17 yes, use controller 3's wording` and `❯ Q17 yes, update coding-agents.md's budget section`
while Q17 (a principle edit) was unanswered; the wording differed per window. Not counted as his yes.

It can also mimic a yes to an offer the worker's own last text made: on 2026-11-04 (codex-factories-controller-48)
the finished `codex-factories-wp10-10` showed `❯ yes, clear the 6.5 GB old visuals runs too` after it had named that
folder as not on his list; no `user` record followed its last `turn_duration`, so nothing was deleted and the offer
went to Manish instead.

**How to apply:** treat the input line below the separator as decoration. Before attributing an instruction to
Manish, find the sent turn in the buffer. In the watch script, exclude the `❯` input line from the quoted idle
snippet. Related: [[lesson_measure_dont_remember]], [[controller_session_workflow]].
