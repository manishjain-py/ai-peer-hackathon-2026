---
name: lesson-ui-walk-drag-control-before-parking
description: "A UI walk's 'the drag did not scroll it' is a claim about where the walk dragged: before parking a reachability bug, drag from the gutter, a row, the words and a swipe, and push complete evidence before a reviewer reads it"
metadata:
  type: feedback
---

A simulator walk reported that a check-in's Check sat under the iPhone SE's control row and "four drags up the canvas
left it where it was", so the child was stuck; it was parked (learnlikemagic #401) and a worker session was launched to
fix it. Re-measured, the canvas scrolled Check clear on every check-in: the walk had dragged "in its gutter", the 24 pt
side margin outside the scroll view, where a drag moves nothing. A four-way control settled it in one run: from the
gutter (no move), from an option row, from plain words, a fast swipe (all scrolled; none picked an option).

**Why:** a negative UI result ("did not scroll", "not tappable") depends on the gesture's start point, speed and the
measuring cap (a six-drag cap also failed to reach the bottom of 4,000-pt content at the largest text size and read as
"not clear"). Read from logged frames alone, it looks like an app bug.

**How to apply:** before parking or fixing a reachability bug, run the drag control above and drag until the target
stops moving (no fixed cap); measure a boundary (a panel's top) from pixels, not from the first visible control's frame
(hidden placeholders keep layout). Push the evidence a PR cites only once every run is complete: a reviewer that read a
backup pushed mid-run flagged the claim as unproven (Codex on #732). Related: [[lesson_unexercised_guard]],
[[feedback_vet_manish_suggestions_independently]].
