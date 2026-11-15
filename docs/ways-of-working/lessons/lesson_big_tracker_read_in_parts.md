---
name: lesson-big-tracker-read-in-parts
description: A long-running initiative's STATE.md grows past 200 KB; a successor told to read it whole spends ~30% of a 1M context before any work. Hand-offs name the parts to read.
metadata:
  type: feedback
---

A controller told "read STATE.md in full" on a 240 KB tracker (Teacher Feedback QA, 2026-11-08) reached 37% of its 1M context
before its first ruling, and had to hand off at 40% after one afternoon's work. Its worker hit the same wall earlier (74.6%).

**Why:** the "Where we are" log keeps every day's history, Settled keeps every ruling, and the session log every session; the
file only grows, and every successor pays for all of it.

**How to apply:** a hand-off (and its launch prompt) names the parts a successor reads: the newest "Where we are" paragraphs
from a named anchor, the sessions table, the open Needs-the-founder items, the newest Settled entries by author, Lessons;
older history only when a question needs it, found by `grep -n` and read by line range. When a tracker passes ~150 KB,
move closed history to a dated log file beside it in the same PR as a milestone. Related: [[lesson-big-context-makes-polling-expensive]].
