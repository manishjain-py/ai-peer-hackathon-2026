# Start here: carry the AI Peer hackathon work to any Mac

Written 2026-11-15 by ai-peer-video-controller-5 at Manish's request (`demo-video/docs/DESIGN.md`
V25: "if I just clone this repo on a different Mac at any point, then from there on, if I start
Claude on that Mac, it can reliably take over the ownership and understand everything about the
project and can continue with the next steps"). The repo is the only memory. Everything a new
session needs is here, except secrets and private recordings, which stay out of git by rule.

## What is where

| Need | Read |
|---|---|
| Project rules for every agent | `AGENTS.md` (Claude Code loads it through `CLAUDE.md`) |
| The product, the generic AI Peer: state, design, plan | `docs/build/STATE.md`, then `docs/build/` |
| The 2-minute demo video (the live work in November 2026) | `demo-video/AGENTS.md`, then `demo-video/docs/STATE.md` (the tracker: who runs, what needs Manish, next) |
| The demo video's decisions, Manish's words | `demo-video/docs/DESIGN.md` section 0 |
| Hand-offs between sessions, dated, never edited | `demo-video/docs/handoffs/`, `docs/build/handoffs/` |
| The concept film (September) | `film/AGENTS.md` |
| How we work: the controller recipe, Manish's global rules, the shared lessons, helper skills | `docs/ways-of-working/` (snapshots of 2026-11-15; see its `README.md`) |

## Checkpoints (git tags)

| Tag | What it pins |
|---|---|
| `draft-01` | Draft 1 of the demo video (PR 9): the film in code, the slates copy |
| `draft-02` | Draft 2 (PR 11): Ram, the quicker reveal |
| `draft-03` | Draft 3 (PR 12): the approved base (V21); the Peer comes out of Ram's phone |
| `wow-concepts-v1` | The five "wow" concepts for the product's screens (PR 13); Manish liked Little Peer (V23) |

- Go back to one: `git worktree add ../ai-peer-at-draft-03 draft-03` (a separate folder;
  `main` stays as it is).
- Mark a new milestone: `git tag -a <name> <commit> -m "<what>"`, then `git push origin <name>`,
  and add a row here.
- Nothing is overwritten: a new version of a render or concept is a new file (`-v2`).

## Set up a new Mac (once)

1. **Tools.** Claude Code, `git` with `git-lfs`, `gh` (signed in as `manishjain-py`), `ffmpeg`,
   `node` and `python3` (the film's renderer: `demo-video/film/README.md`).
2. **Clone.**
   `git clone https://github.com/manishjain-py/ai-peer-hackathon-2026.git ~/repos/ai-peer-hackathon-2026`,
   then in it `git lfs install && git lfs pull`. The concept film's media is skipped by
   default: `git lfs pull --include="film/**" --exclude=""`.
3. **Skills and rules.** Manish's Macs sync `~/claude-config` by themselves, which holds the
   skills, the lessons and the global `CLAUDE.md`. On a Mac without it, install the snapshots:
   `mkdir -p ~/.claude/skills && cp -R docs/ways-of-working/skills/* ~/.claude/skills/`, and
   use `docs/ways-of-working/manish-global-CLAUDE.md` as `~/.claude/CLAUDE.md`, with its
   `@~/claude-config/lessons/INDEX.md` line changed to the repo's
   `docs/ways-of-working/lessons/INDEX.md`.
4. **Secrets** (never in git; copy them by hand from the old Mac):
   - `~/.ai-peer/.env`: `ELEVENLABS_API_KEY`, `GITHUB_TOKEN`, the `SLACK_*` and `RECALL_*`
     keys, `ZOOM_TEST_MEETING_URL`.
   - `FAL_KEY` and `STABILITY_API_KEY`, exported in `~/.zshrc`.
   - Telegram: `TELEGRAM_BOT_TOKEN` in `~/.claude/channels/telegram/.env` (read by the notify
     scripts and `demo-video/tools/tg-send-file.sh`).
5. **Private files** (never in git, by rule C8): `~/.ai-peer/demo-video-private/`. It holds the
   full renders with real company recordings, the walkthrough recording of the product at his
   company, the tag video he made on another Mac (private for now), and caches. Public builds
   and every git artifact work without it; copy it by AirDrop only if a task needs it.

## Take over as the controller

1. Your name is `ai-peer-video-controller-<n+1>`, where `n` is the controller named in the first
   lines of `demo-video/docs/STATE.md`. Launch on Opus 5.5 at max effort (V15):
   `claude --model "claude-opus-5-5[1m]" --effort max --name <name> --remote-control <name>`.
2. Read `demo-video/docs/STATE.md` on `origin/main` by section: the first lines, "Where we
   are", "Needs Manish", "Next", "Lessons" (the session log only if needed). Then the newest
   hand-off in `demo-video/docs/handoffs/`.
3. Check every session and wait that STATE names. On a different Mac they are not there: a
   worker that was live is re-launched from its own hand-off file as `<name>-2`; waits are
   started again with the commands in the newest controller hand-off ("Your waits").
4. Put your name, window and session link in STATE's first lines; tell any live worker your
   name; tell Manish in one short line who you are and what happens next.
5. Carry on from "Next".

## How we work, in short

The full recipe is `docs/ways-of-working/skills/big-initiative/SKILL.md`; this repo's
`AGENTS.md` and `demo-video/AGENTS.md` win where they differ.

- **One controller** is Manish's only point of contact. It plans, writes each worker's brief (a
  dated hand-off file), launches, watches and closes workers, and keeps STATE.md current. It
  writes no product code.
- **Workers.** One per work package, each with its own worktree, branch and PR; one worker at
  a time, on Opus 5.5 at max effort (V15); helpers only with the controller's yes.
- **Hand-off at 45 to 50% context,** measured from the session's transcript (a worker tells the
  controller at 40%). Finish the step, push, write a dated hand-off (never edited afterwards),
  start the successor, close the old session.
- **Usage.** Read `/usage` at every milestone. At 85% of the week workers stop at a clean step;
  at 93% all video work pauses and Manish is told on Telegram, so the work can move to
  another subscription or Mac. Never wait for the weekly reset.
- **Manish.** Every choice goes to the Telegram Attention group with its material (videos,
  pictures) plus one text line; he answers in the session. One question at a time, plain words,
  a recommendation first, a TLDR at the end of every reply. Routine calls are the controller's:
  take them, record them, tell him in one line.
- **His words** go into the repo at once, word for word, with the time: a dated brief or
  feedback file and a row in `DESIGN.md` section 0. Locked decisions change only by his words.
- **Privacy.** Real company content never goes into git or any outside tool (C8).
- **Money.** The demo video's cap is $100 (V3); each worker keeps a ledger in
  `demo-video/ledger/`.
- **Waiting** is done by shell scripts (`demo-video/tools/wait-for.sh`), never by polling from a
  session.

## Outside git on Manish's 48 GB Mac (2026-11-15)

| Where | What | Why it is not in git |
|---|---|---|
| `~/.ai-peer/demo-video-private/` | The full renders with real recordings, the company walkthrough, the tag video, caches (about 6 GB) | Private by rule, or rebuilt by code |
| `~/repos/ai-peer-video-wp2` (worktree) | Unused music takes, the Earth helper's raw files, render caches (about 19 GB) | Unused takes and caches; the final music is in git |
| `~/repos/ai-peer-video-wp3` (worktree) | About 89 unused raw takes of the AI shots (about 207 MB) | Unused; every final shot is in git |
