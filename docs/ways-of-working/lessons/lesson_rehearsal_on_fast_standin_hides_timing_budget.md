---
name: lesson-rehearsal-on-fast-standin-hides-timing-budget
description: A setup rehearsed only on a fast stand-in (a local database) hid that its fixed wait (60 tries 2 s apart) was shorter than the real start (124 s on production's database from India); its first real runs failed three times, seconds early, with no cause told
metadata:
  type: feedback
---

learnlikemagic's Teacher Feedback QA watch, 2026-11-15: its run setup (`prep.zsh`) waited for the backend with a fixed 60 tries
2 s apart, about 120 s. Every rehearsal ran on a local database, where a start takes seconds, so that budget was never tested. The
first real runs, on production's database from India, needed 124 s (the start-up schema check reads each table across the ocean):
three runs ended "failed, exit 5" seconds before the backend answered, the watch held the worktree, and the session watching it
re-copied the `.env` files, a repair that could not help, because no line named the cause.

**Why:** a timing budget sized by guess and proven only on a faster stand-in fails on the real path, often by seconds, and looks
like an unrelated fault (a `.env`, a venv, a migration).

**How to apply:**
- Before a setup goes live, time its real path once (the real database, the real network) and size each wait from that, with margin.
- Wait by the clock while the process lives, never by a count of tries.
- Make each failing exit leave its cause in fixed words where the operator hears it.
- Reproduce the failing step alone first: here, one timed start on the real port settled it (124.1 s against prep's 122.0 s).
