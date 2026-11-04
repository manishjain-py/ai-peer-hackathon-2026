# Hand-off: ai-peer-wp1-1 (WP1 foundation + S1 Slack cover)

For: `ai-peer-wp1-1`, Claude Opus 5.5 (1M), max effort. Written 2026-11-04 by the kickoff
session; started by `ai-peer-controller-1`. Dated, never edited after it is written.
The living state is `docs/build/STATE.md` on `origin/main`.

## Manish's standing instruction (quoted from the brief)

> "this is a hackathon, so our main idea is to make it work, and not go off track in
> unimportant things like code quality, unit tests, et cetera ... we build something, we
> test it manually by running it in the browser or running through the terminal ...
> But other than that, we should try to follow all our ways of working."

Merge rule (D13): you merge your own PR as soon as the S1 walk passes. No review, CI or
unit tests. Stop rules below.

## The job

Build the shared foundation and make **S1 Slack cover** work end to end, Manish online
and away, on the Claude backend, and once on Codex.

## Read first, in order (only these)

1. `AGENTS.md` (root).
2. `docs/build/STATE.md` on `origin/main`.
3. `docs/build/DESIGN.md`: §0, §1 to §5.
4. `docs/build/PRD.md`: "The world it runs in", F8, S1.
5. `docs/build/PLAN.md`: "Rules for every package", WP1, "Manish's setup list".
6. `docs/build/RESEARCH-2026-11-04.md`: the Runtime and Slack sections only.

## Working copy

- Worktree `~/repos/ai-peer-wp1`, branch `wp1-foundation` from `origin/main` (the
  controller creates it). Python 3.12 venv at `~/repos/ai-peer-wp1/.venv` (gitignored).
- Peer runtime data: `~/.ai-peer/` (create it). Secrets: `~/.ai-peer/.env`, never in git,
  chat or Telegram; never echo a token in a reply (the idle-ping hook sends reply text
  to Telegram).

## What to build

| Piece | Must do |
|---|---|
| Spikes (first) | 1a `claude -p` runs a skill from the Peer's own folder and returns schema-valid JSON on this Mac's login; record the version and the exact flags. 1b the same with `codex exec` (record whether skills load in `exec`). 1c Slack Socket Mode: hear a channel message, reply in its thread as "Manish's AI Peer", DM Manish with Send / Edit / Skip buttons, receive the click. 1d (when Manish has the Zoom app and Recall account) a Recall bot joins a meeting on his personal Zoom with join-before-host, plays an MP3, a transcript arrives; if it fails, stop and ask him (Meet is the D8 fallback). Results into STATE and `docs/build/evidence/wp1/`. |
| `peer/` package | Settings; event store (SQLite in `~/.ai-peer/<owner>/peer.db`); the adapter contract (DESIGN §2) with `fake`, `directory`, `github`, `slack` adapters; memory layout (DESIGN §4) and a first discovery from the profile plus GitHub (LLM repos, owned services, tracker files such as `docs/feature-development/*/STATE.md`, recent PRs and CI); `run_agent(prompt, schema)` with Claude and Codex backends; the `peer-brain` skill (triage a batch, answer, draft); the action executor (approval gate per D9, presence, idempotency, activity log); presence (Slack presence and status, IST working hours, a manual away switch); a CLI (`watch`, `scenario <name>`, a `port-check` stub). |
| Test world | Manish's LLM profile for the `directory` adapter (founder and engineer, IST, the LLM repos he owns). `peer/scenarios/world.yaml`: 4 to 6 fake colleagues (invented names, roles, time zones) and channels. S1 scenarios: `s1-online`, `s1-away`. |
| Activity log | Append-only file plus a minimal web page listing entries with sources. |

## Manish's hands (relay through the controller, one ask at a time, with exact steps)

- **Slack first:** you write the app manifest (bot posting as "Manish's AI Peer", Socket
  Mode, interactivity for buttons, the events and scopes S1 needs) and a short numbered
  list for him: create the free workspace "Learn Like Magic", create the app from the
  manifest, install it, put the tokens in `~/.ai-peer/.env`.
- **Fake colleagues in Slack** need one question to Manish: real member accounts (email
  aliases on learnlikemagic.com, each authorizes once so the script can post as them;
  realistic, about 20 minutes) or a second "scenario" app posting with custom names
  (fast, but shows an APP badge on stage). Recommend real members.
- GitHub read-only token, then Zoom app + Recall (for spike 1d) when you reach them.

## Proof (D13)

S1 walk, both variants, from the scenario script: online, the DM with the draft and
buttons, then the thread reply after Send; away, the thread reply on its own with who
it is, Manish's local time, the answer with sources and dates, a follow-up handled, and
the DM summary. Answers come from the real LLM repo. Screenshots and the activity-log
excerpt in `docs/build/evidence/wp1/`. Then one S1 run on the Codex backend. Then tell
the controller: Checkpoint 1 is ready (a short screen recording for Manish's Telegram,
and how he can try it himself).

## PR and merge

One PR `wp1: foundation + S1 Slack cover` into `main`: what works, the walk evidence,
what is not verified. Merge when the walk passes; update STATE (checkpoint 1, lessons,
session log).

## Stop rules

- Measure context at every milestone from your transcript (the last usage record of
  `~/.claude/projects/<working-dir folder>/<session id>.jsonl`: input + cache-read +
  cache-creation, of 1M). At 45 to 50%: finish the step, push, write
  `docs/build/handoffs/HANDOFF-<date>-ai-peer-wp1-<n+1>.md`, update STATE, tell the
  controller, stop.
- Weekly usage: this Mac's account also runs Learn Like Magic. At about 95%, finish the
  step, hand off, stop.

## Traps known before the first line

- **Global config leaks into brain runs.** `claude -p` loads the user's
  `~/.claude/CLAUDE.md` (its rules, such as "end every reply with a TLDR", would end up
  in Slack replies) and the user's hooks (an idle hook posts reply text to Telegram).
  Run the brain from the Peer's own folder, prove what it loads, block what leaks (for
  example `CLAUDE_NO_IDLE_PING=1`, `--setting-sources`, an explicit tool allowlist).
  Check Codex's global config the same way.
- Since Claude Code v2.1.302 a `-p` run starts in Manual permission mode unless a mode is
  set; this Mac's user default is `bypassPermissions`. Give brain runs an explicit
  read-only allowlist.
- A planned change may make `--bare` the `-p` default, and bare mode ignores
  subscription logins: record the working version; if runs start failing on auth, that
  is the first suspect, and Codex is the fallback.
- The Peer is read-only on LLM code and never touches LLM production.
- Slack free plan shows only 90 days of history and allows 10 apps.
- Zoom: since 2 Mar 2026 a bot joining another account's meeting needs the authorizing
  user in the call; the app and the meetings must both live in Manish's personal Zoom.
- This Mac also runs Learn Like Magic sessions: never `pkill` by pattern, never touch
  their windows or worktrees.
