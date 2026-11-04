# AI Peer build: state

The tracker. Every session updates it at each milestone; the controller at least
hourly while workers run. Times UTC. Decisions: [DESIGN §0](DESIGN.md). Plan: [PLAN](PLAN.md).

## Where we are

2026-11-04 14:37. Kickoff done: interview locked as D1 to D16, the film moved into
`film/`, build docs written. Next: the controller `ai-peer-controller-1` starts WP1
(foundation + S1) in its own worktree. Manish's setup list (PLAN) is open; WP1 can
start on the parts that need no accounts.

| Session | Window | Worktree | Branch / PR | Job |
|---|---|---|---|---|
| kickoff (this interview) | | `~/repos/ai-peer-hackathon-2026` | `main` | Interview, docs, restructure; ends after the controller starts |

## Needs Manish

1. The setup list in PLAN (Slack, Google, GitHub token, Zoom app, Recall.ai, ElevenLabs).
   WP1 sends exact steps for each when it reaches them.
2. The Airbnb asks in PLAN, this week.
3. Your other Mac's copy (`~/repos/Hackathon 2026`, per the `$ai-peer` skill) predates
   the `film/` move: push anything unpushed there, then pull.

## Next

1. Controller starts WP1 (spikes 1a to 1c first; 1d when the Zoom and Recall accounts exist).
2. WP1 done → Checkpoint 1 → WP2 and WP3 in parallel.

## Checkpoints (D15)

| # | Scene | Status |
|---|---|---|
| 1 | S1 Slack cover | not started |
| 2 | S2 daily brief + setup page | not started |
| 3 | S3 meeting | not started |

## Settled, do not re-open

- Everything in DESIGN §0 (D1 to D16).
- No unit tests, CI, code review or quality gate (D13). Do not add them.
- The upstream-break warning is an extra only (D3).
- The Peer never touches LLM production and is read-only on LLM code.

## Airbnb notes

Answers to the Airbnb asks land here, with date and source.

## Lessons

What went wrong once, with its mechanism.

## Session log

| Date | Session | What happened | Outcome |
|---|---|---|---|
| 2026-11-04 | kickoff | Read the film repo and film; three research passes; 14-question interview; restructure; docs | D1 to D16 locked; docs on `main` |
