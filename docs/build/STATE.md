# AI Peer build: state

The tracker. Every session updates it at each milestone; the controller at least
hourly while workers run. Times UTC. Decisions: [DESIGN §0](DESIGN.md). Plan: [PLAN](PLAN.md).

## Where we are

2026-11-04 14:43. WP1 (foundation + S1) has started: `ai-peer-wp1-1` runs in
`~/repos/ai-peer-wp1` on `wp1-foundation`, spikes 1a to 1c first. Manish's setup list
(PLAN) is open; the worker sends exact steps through the controller when it reaches
each item. Weekly usage 34% (resets 10 Nov, 04:30 IST).

| Session | Window | Worktree | Branch / PR | Job |
|---|---|---|---|---|
| kickoff (this interview) | 1661 | `~/repos/ai-peer-hackathon-2026` | `main` | Interview, docs, restructure; done, closes after its wrap-up |
| ai-peer-controller-1 | 1715 | `~/repos/ai-peer-hackathon-2026` | `main` (docs only) | Runs the build; https://claude.ai/code/session_01Nfn5h9PisnJvGpbLbRtbiB |
| ai-peer-wp1-1 | 1725 | `~/repos/ai-peer-wp1` | `wp1-foundation`, no PR yet | WP1 foundation + S1; idle pings off (`CLAUDE_NO_IDLE_PING=1`), asks go through the controller; https://claude.ai/code/session_01Nfn5h8PVD6txxjBUfab4nR |

## Needs Manish

1. The setup list in PLAN (Slack, Google, GitHub token, Zoom app, Recall.ai, ElevenLabs).
   WP1 sends exact steps for each when it reaches them.
2. The Airbnb asks in PLAN, this week.
3. Your other Mac's copy (`~/repos/Hackathon 2026`, per the `$ai-peer` skill) predates
   the `film/` move: push anything unpushed there, then pull.

## Next

1. WP1: spikes 1a to 1c, then the Slack setup ask to Manish; 1d when the Zoom and Recall accounts exist.
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
| 2026-11-04 | ai-peer-controller-1 | Read the brief; created the WP1 worktree; started `ai-peer-wp1-1` (window 1725, max effort, remote control, no trust dialog) | WP1 running |
