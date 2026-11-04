# AI Peer build: state

The tracker. Every session updates it at each milestone; the controller at least
hourly while workers run. Times UTC. Decisions: [DESIGN §0](DESIGN.md). Plan: [PLAN](PLAN.md).

## Where we are

2026-11-04 15:05. WP1 (foundation + S1) is running: `ai-peer-wp1-1` in
`~/repos/ai-peer-wp1` on `wp1-foundation`.

- Spikes 1a and 1b passed: `claude -p` 2.1.318 with `--setting-sources project`, empty
  MCP and a read-only tool list loads none of Manish's global config; `codex exec`
  0.153.4 loads skills, but needs its own `CODEX_HOME` and `HOME` under `~/.ai-peer`
  (`--ignore-user-config` still leaks the global AGENTS.md and user skills).
- Spike 1c nearly passed (15:02): the bot posts as "Manish's AI Peer" over Socket Mode,
  a labelled test card with Send / Edit / Skip sits in Manish's DM, the bot replied in
  its thread. Hearing a message and receiving a click remain (a listener runs to
  about 18:00; otherwise folded into the colleague steps).
- Slack set up by the kickoff session with Manish (he let it drive his Chrome):
  workspace "learnlikemagic" (team T0CEDQU5X0X), app "AI Peer" (A0CEE0554HM), bot
  `@manishs_ai_peer`, steps in `docs/build/setup/slack.md`.
- In `~/.ai-peer/.env`, each checked: the Slack app, bot and user tokens;
  `ELEVENLABS_API_KEY`; `GITHUB_TOKEN` (his `gh` login, full repo scope, so the Peer
  makes read calls only; PLAN's fine-grained read-only token would be safer, optional).
- Meetings: Zoom is his paid Workplace Pro account (personal Gmail login); Recall.ai
  account on manish@learnlikemagic.com, **Tokyo region**, $5 credit (keep test meetings
  short). The kickoff session is adding the Recall API key and the Zoom connection.
- Weekly usage 34% (resets 10 Nov, 04:30 IST).

| Session | Window | Worktree | Branch / PR | Job |
|---|---|---|---|---|
| kickoff, registry name `learnlikemagic-27` | 1661 | `~/repos/ai-peer-hackathon-2026` | `main` | Interview, docs, restructure done; now walking Manish through the Slack app setup |
| ai-peer-controller-1 | 1715 | `~/repos/ai-peer-hackathon-2026` | `main` (docs only) | Runs the build; https://claude.ai/code/session_01Nfn5h9PisnJvGpbLbRtbiB |
| ai-peer-wp1-1 | 1725 | `~/repos/ai-peer-wp1` | `wp1-foundation`, no PR yet | WP1 foundation + S1; idle pings off (`CLAUDE_NO_IDLE_PING=1`), asks go through the controller; https://claude.ai/code/session_01Nfn5h8PVD6txxjBUfab4nR |

## Needs Manish

1. **Asked 15:03 (Telegram Attention + controller reply), waiting:** fake colleagues in
   Slack, A) real member accounts from 5 email aliases (about 20 to 25 minutes, look
   real on stage; recommended) or B) one scenario bot with custom names (about 3 minutes,
   APP badge on every message). The worker sends the exact steps for his pick.
2. Queued, after that: one command for the Peer's own Codex login (today it uses a copy
   of his token, good until about 7 Nov).
3. Rest of the setup list (PLAN): Google OAuth client; Zoom app and Recall key (kickoff
   session doing these now). WP1 sends exact steps through the controller when needed.
4. The Airbnb asks in PLAN, this week.
5. His other Mac's copy (`~/repos/Hackathon 2026`, per the `$ai-peer` skill) predates
   the `film/` move: push anything unpushed there, then pull.

## Next

1. WP1: finish 1c (hear + click), the colleague setup after Manish's pick, then the
   build; 1d once the Recall key and the Zoom connection are in.
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
- **A real person is in the test Slack.** `preethi` in the learnlikemagic workspace is a
  real person (Manish confirmed 14:55 UTC). The Peer and the scenario script never
  message, DM, mention or reply to her: the Peer engages only with Manish and the
  invented colleagues (hard block in code), and the scene channels are created without
  her.

## Airbnb notes

Answers to the Airbnb asks land here, with date and source.

## Lessons

What went wrong once, with its mechanism.

## Session log

| Date | Session | What happened | Outcome |
|---|---|---|---|
| 2026-11-04 | kickoff | Read the film repo and film; three research passes; 14-question interview; restructure; docs | D1 to D16 locked; docs on `main` |
| 2026-11-04 | ai-peer-controller-1 | Read the brief; created the WP1 worktree; started `ai-peer-wp1-1` (window 1725, max effort, remote control, no trust dialog) | WP1 running |
