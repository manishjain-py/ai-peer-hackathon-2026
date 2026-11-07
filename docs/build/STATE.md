# AI Peer build: state

The tracker for the Airbnb laptop. Every session updates it at each milestone; the controller at least hourly
while workers run. Times UTC, from `date -u`. Decisions: [DESIGN §0](DESIGN.md). Plan: [PLAN](PLAN.md). How we
work: [ways of working](../ways-of-working.md). The first laptop's full tracker stayed with the original
repository; this one starts fresh.

## Where we are

2026-11-07. **Handed over from the first laptop** (DESIGN D17): a fresh, sanitized copy of the repo (one
commit). The generic AI Peer is built and proven on a test company: **S1 Slack cover passed live** (online and
away, on Claude and Codex), **S3 attend a meeting passed live**, **S2 daily brief passed its dry walk** (its
live walk never ran), the setup page, memory, roles, activity log, self-tuning, fresh memory and local work
were walked, and the porting guide with `port-check` exists. Every account, token and the test company stayed
behind; the test world is now the fictional Fernway. **Nothing runs on this laptop yet. The first session here
is WP6** ([START-HERE](../../START-HERE.md), "First steps").

Live sessions: none yet. The first one adds a row.

| Session | Worktree | Branch / PR | Job |
|---|---|---|---|

Still running: nothing.

## Packages

- WP0 to WP4: done on the first laptop ([PLAN](PLAN.md), "Done on the first laptop"). WP3's live S2 walk and
  WP2's live F5 check not done.
- WP5 part 1 (porting guide, `port-check`, demo script draft): done.
- WP6 set up on the new laptop: next.
- WP7 privacy fix and adapter contract: planned ([plan](next/WP7-privacy-and-contract.md)); **before any company
  data flows**.
- WP8 brain on the company harness: after WP7.
- WP9 Airbnb integrations (a) code, (b) people and ownership, (c) Slack, (d) Zoom, (e) the AirChat plugin: after
  WP7; each starts with a spike.
- WP10 demo: planned ([plan](next/WP10-demo.md)); its live steps after WP7.

## Needs Manish

The controller asks one at a time, in this order, each in plain words with a recommendation.

1. **Where does the repo live on this laptop?** (a) A repo on a remote the company allows (recommended: PRs,
   history and hand-offs survive the laptop); (b) local only (worktrees and local merges; a backup copy now and
   then).
2. **Which coding agent and login build here, and which may run the Peer's brain?** The Peer's brain needs a
   one-command-per-run mode (like `claude -p`) on a harness allowed to see company data (DESIGN §6; WP8).
3. **The Airbnb asks** in [PLAN](PLAN.md) (AirChat headless and plugins; an always-on host; a Slack app; a
   meeting bot on Zoom; data only through the company's harness; where the repo may live; the hackathon
   format). Answers go to "Airbnb notes" below.
4. **Access for WP9**, one system at a time, as each package's spike needs it.

## Next

1. **WP6** (the first session, with Manish at the laptop): START-HERE "First steps" 1 to 9.
2. **WP7**: the controller turns [its plan](next/WP7-privacy-and-contract.md) into a brief, a reviewer checks the
   brief, a worker builds it. The privacy fix first.
3. **WP8**, then **WP9** (a) to (e) in the order access arrives, with **WP10** beside them (up to 2 workers).
4. Rehearsals before 16 Nov; the hackathon is 16 to 20 Nov.

## Settled, do not re-open

- Everything in DESIGN §0 (D1 to D17), except what is marked "revisit on the new Mac", which the first sessions
  here confirm or replace with Manish.
- No unit tests, CI, code review or quality gate (D13). Do not add them.
- The upstream-break warning is an extra only (D3).
- The Peer is read-only on the company's code and never touches production systems.
- **The Peer engages only with its owner and the trial's listed colleagues** (the real-person block in code);
  everyone else is dropped unread. List only colleagues who agreed to take part.
- **Never the owner's own (cloned) voice**; stock voices only (D9).
- **No company data before WP7's privacy fix**; then only through the company's harness and auth (DESIGN §6).
- Secrets only in `~/.ai-peer/.env`; runtime data only in `~/.ai-peer/`; neither ever in git.

## Manish's answers

| Time (UTC) | Question | His words, verbatim |
|---|---|---|
| 11-07 06:21 | (on the first laptop) The move to the Airbnb laptop | In DESIGN D17, in full |

## Airbnb notes

Answers to the Airbnb asks land here, with date and source.

## Lessons

New lessons from this laptop go here first, with their mechanism; the first laptop's are in
[docs/lessons.md](../lessons.md).

## Session log

| Date | Session | What happened | Outcome |
|---|---|---|---|
| 2026-11-04 to 07 | first laptop (15 sessions: a kickoff, 4 controllers, 10 workers) | Kickoff, WP1 to WP5 part 1, the hand-over package | S1 and S3 live, S2 dry, porting guide; this copy |
