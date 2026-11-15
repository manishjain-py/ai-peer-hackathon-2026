---
name: lesson_big_context_makes_polling_expensive
description: "A session with a huge context pays its whole context on EVERY tool call, so a 'cheap' scheduled check is not cheap: at 727k tokens one 2-call check cost ~0.2% of the weekly Fable limit, ~7% a day. Poll with a shell script, not with the session"
metadata:
  node_type: memory
  type: feedback
  originSessionId: aef1a1c8-c025-445b-beda-9e17106e5166
  modified: 2026-10-02T20:57:37.320Z
---

On 2026-10-03 the CI cost build session (context 727k tokens after a long night) was polling every 40
minutes for a Codex chapter run to end. Measured from the transcript: each model call read about 727k
cached tokens, a check was two calls, and the weekly Fable usage had gone from 55% to 75% in 3.5 hours
of work (about 170 tool calls plus three reviewer sub-agents). Polling alone would have used about 7% of
the weekly limit per day.

**Why:** cached input is cheap per token, not free, and every tool round re-reads the whole context. Cost
scales with context size times number of calls, so a one-line answer from a big session is still big.
A longer interval does not help: past the 1-hour cache TTL each wake-up re-reads everything uncached.

**How to apply:**
- Before leaving a recurring check (CronCreate, a /loop) running for hours, measure the context
  ([[howto_measure_context_from_transcript]]). Above about 150k tokens, do not poll with the session.
- Wait with a detached shell script that reads the condition itself and sends one Telegram message
  (`tg-attention.sh`) when it is met; record its pid, log and stop command in the tracker.
- Hand the follow-up work to a NEW session (small context) through the repo tracker, not back to the big one.
- In a big session, batch shell work into few calls and skip nice-to-have reads.
- Related: [[feedback_stop_at_95pct_weekly_usage]], [[feedback_maintain_planner_and_handover]] (hand off at
  45 to 50% context: this session was far past it).

**A waiting script must not end at once** (Teacher Feedback QA, 2026-11-05 to 11-07): a loop waiting for a file left
by an earlier run ended at once and cut a proof short (remove the old file first, or key the wait on something new
since it started, such as the next run number), and a waiter on one run's status file missed the gap between two runs
in one worktree. macOS has no `timeout`; wait for a server with
`curl --retry 60 --retry-delay 2 --retry-connrefused <url>`.
