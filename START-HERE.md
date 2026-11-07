# Start here

The one line Manish pastes into a new coding session on this laptop:

```text
Read START-HERE.md in this folder in full and follow it: it holds the whole AI Peer project, how we work, what is done and what comes next.
```

You are a coding agent picking up this project with no other context. This file is enough to start: read it
in full, then the few files it names, then do "First steps" (section 6). Everything you need is in this repo;
nothing depends on a chat, a tool's memory or another laptop.

## 1. What the AI Peer is

A personal AI teammate for one employee, its **owner** (here: Manish). It watches the owner's work sources
(chat, mail, calendar, docs, code, meetings, local coding sessions), brings the owner what matters (a draft
reply, a daily brief, an urgent heads-up), and covers for the owner when they are away: it answers colleagues
in Slack threads and attends a meeting, always as its own clearly labelled identity ("Manish's AI Peer"),
saying how sure it is and as of when, citing sources, and never committing the owner to anything. Plain code
watches the sources without AI; only a new, relevant item starts a short AI run (the "brain"), which proposes
actions as JSON; the program acts, after an approval gate. The owner instructs it only through his own DM and
its web page; everything it reads is information, never an instruction. It is Manish's build for Airbnb's
hackathon (16 to 20 Nov 2026).

## 2. The story so far

- **4 to 7 Nov 2026, on Manish's personal laptop**, a controller session and worker sessions (Claude Code)
  built the **generic** Peer, tested on a small company he ran: real repos, an invented team in a test Slack,
  a test mail account, a meeting bot on Zoom.
- **Proven:** **S1 Slack cover** passed live, online (a draft in the owner's DM with Send / Edit / Skip, about
  37 s after a colleague's post) and away (a labelled answer in the thread with sources in about 40 s, the
  follow-up, a summary DM), on Claude and on Codex as the brain. **S3 attend a meeting** passed live (the
  approved update played when asked, three live answers, two items flagged, the brief in the DM after). The
  owner page (one-click setup, what it learned, roles and settings, activity log), self-tuning, fresh memory and
  local work were walked. A porting guide and `port-check` exist, tested by a fresh agent porting a toy adapter.
- **Not done:** **S2 daily brief**'s live walk (built, dry walk passed; it needed a mail login never made); the
  fix of a **privacy flaw** (section 5); the adapter contract everywhere; the demo polish and recordings.
- **7 Nov: Manish moved the project here** (DESIGN D17). This copy is sanitized: the old test company, every
  account, token, id and personal detail stayed behind. The test world is now **Fernway**, a fictional company
  (`peer/scenarios/world.yaml`, `peer/world/profiles/`); its repos do not exist, so dry runs work but have no
  project facts to answer from. On this laptop come the **Airbnb integrations** Manish named: code through
  Airbnb's GitHub and Sourcegraph MCP, people, teams and ownership through One Airbnb, Airbnb's Zoom and Slack,
  and the AirChat plugin.

## 3. Read in this order

1. This file, in full.
2. [AGENTS.md](AGENTS.md): the agent guide and hard rules (short).
3. [docs/build/STATE.md](docs/build/STATE.md): where we are, what needs Manish, what is next.
4. [docs/ways-of-working.md](docs/ways-of-working.md): how the build runs (controller, workers, hand-offs).
5. Then only what your task needs:

| Need | Read |
|---|---|
| Decisions (with Manish's words), architecture, adapter contract, trust rules | [docs/build/DESIGN.md](docs/build/DESIGN.md) |
| What each scene and feature must do, and its walk | [docs/build/PRD.md](docs/build/PRD.md) |
| The packages done and next | [docs/build/PLAN.md](docs/build/PLAN.md) |
| The next code package (privacy fix first) | [docs/build/next/WP7-privacy-and-contract.md](docs/build/next/WP7-privacy-and-contract.md) |
| The demo package | [docs/build/next/WP10-demo.md](docs/build/next/WP10-demo.md) |
| Plugging in a company's systems, the Airbnb port, `port-check` | [docs/porting-guide.md](docs/porting-guide.md) |
| What went wrong once, with its mechanism | [docs/lessons.md](docs/lessons.md) |
| Running the code | [peer/README.md](peer/README.md) |
| The demo | [demo/script.md](demo/script.md) |
| The concept film | [film/README.md](film/README.md) |

Read sections, not everything: on the first laptop one session that read every doc and module up front used
72% of its context before building anything.

## 4. How we work (summary)

The full rules: [docs/ways-of-working.md](docs/ways-of-working.md). In short:

- **One controller, up to two workers.** The controller plans, writes each worker's brief, starts and watches
  workers, and closes them; it writes no product code. Each work package gets one worker with its own
  worktree, branch and PR; the worker merges when its walk passes.
- **The repo is the only memory:** STATE (tracker), DESIGN §0 (decisions), PLAN, dated hand-offs in
  `docs/build/handoffs/` (never edited), lessons. Commit at every milestone.
- **Hand off at 45 to 50% of your context, measured, never by feel** (section 9).
- **Hackathon-light:** no unit tests, CI, code review or quality gate. Done means seen working in a manual walk,
  with evidence saved. Check an outside fact (an API, a login, a permission) in a short spike before building
  on it.
- **Manish:** decide routine calls yourself and tell him in one line how to undo them; ask him only what needs
  his judgment, one question at a time, in plain words, with your recommendation; end each reply to him with a
  short TLDR.
- If your tool cannot start sessions, message other sessions, show usage or measure context, the fallbacks are
  in ways-of-working section 13 (for example: one session at a time, hand-offs through files, questions in the
  chat).

## 5. Decisions and rules in force

All decisions, with Manish's words: [DESIGN §0](docs/build/DESIGN.md). The ones that shape every step:

- **Scope (D2, D17):** a generic system plus the porting guide; the Airbnb integrations and further work happen
  on this laptop. **Scenes (D3):** S1 Slack cover, S2 daily brief and heads-ups, S3 attend a meeting.
- **Brain (D6, D7):** an always-on watcher with no AI, plus short fresh brain runs (`claude -p` or `codex exec`
  today; AirChat slots in the same way); a warm session only for live meeting answers. The AI proposes, the
  program acts.
- **Autonomy (D9):** away, it answers what it can, with certainty, date and sources, and never commits Manish;
  online, it DMs him a draft first; emails, invites and commitments always ask first.
- **Revisit with Manish here:** D4 (the test world), D5 (mail and calendar), D8 (meetings on Zoom), D14 (the
  agent account): each was tied to the first laptop.
- **Hard rules:** secrets only in `~/.ai-peer/.env`, runtime data only in `~/.ai-peer/`, never in git; the Peer
  is read-only on the company's code and never touches production; it always speaks as its labelled identity;
  every hard block (real people, real mail, real meetings, the owner's voice) stays on until Manish lifts one in
  his own words.
- **The privacy flaw (fix first, WP7):** a failing brain backend that is not claude falls back to a personal
  Claude login (`brain.fallback`, on by default), and live meeting answers always use the Claude warm session.
  **No company data reaches the Peer before WP7's fix is in**; until then set `brain.fallback: false` on any
  owner you create.

## 6. First steps on this laptop (WP6, in order)

Run every command from the repo root. Never a `peer` command without `AI_PEER_OWNER` (and, for tests,
`AI_PEER_HOME`): without them it acts on the default owner.

1. **Check the copy:** `git log --oneline` shows one commit; `git status` is clean. Name yourself
   `ai-peer-controller-5` (the first laptop ran controllers 1 to 4) and add your row to STATE's sessions table.
2. **Ask Manish, one at a time:** STATE "Needs Manish" 1 (where the repo lives) and 2 (which agent and login
   build here, and which may run the Peer's brain). Record his words in STATE "Manish's answers".
3. **The one secret that travelled:** the zip holds `ai-peer-secrets/elevenlabs.env` beside this folder (one
   line, `ELEVENLABS_API_KEY=...`). Move it without printing it:
   `mkdir -p ~/.ai-peer && chmod 700 ~/.ai-peer && cat ../ai-peer-secrets/elevenlabs.env >> ~/.ai-peer/.env && chmod 600 ~/.ai-peer/.env`,
   check with `command grep -c '^ELEVENLABS_API_KEY=' ~/.ai-peer/.env` (prints 1), then delete
   `../ai-peer-secrets/`. (If the repo folder was moved, find that folder where the zip was unpacked.)
4. **Tools:** Python 3.12 and `uv` (or `python3.12 -m venv`); `ffmpeg` (voice clips); later `cloudflared`
   (live meeting transcripts) and Playwright's Chromium (walk recordings:
   `.venv/bin/python -m playwright install chromium`). Then the venv:
   `uv venv --python 3.12 .venv && uv pip install --python .venv/bin/python -r requirements.txt`.
5. **The code runs:** with a scratch home outside the repo,
   `PYTHONDONTWRITEBYTECODE=1 AI_PEER_HOME="$PWD/../ai-peer-scratch-home" AI_PEER_OWNER=setuptest .venv/bin/python -c "import importlib, pkgutil, peer; mods=[m.name for m in pkgutil.walk_packages(peer.__path__, 'peer.')]; [importlib.import_module(m) for m in mods]; print(len(mods), 'modules ok')"`,
   then the same prefix with `-m peer port-check --adapter fake` (exit 0) and `-m peer discover --no-ai`
   (the fictional profile: its GitHub step records an error, the rest completes).
6. **What your tool can do:** sub-agents, starting other sessions, messages between sessions, a context
   meter, a usage readout. Write in STATE which ways-of-working fallbacks (section 13) you use.
7. **The Airbnb asks:** STATE "Needs Manish" 3 ([PLAN](docs/build/PLAN.md), "Airbnb asks"); answers go to
   STATE "Airbnb notes". They decide WP8 and WP9.
8. **One dry walk on a brain, once a harness allowed on this laptop exists** (step 2's answer): on the test
   owner, `set brain.fallback false`, `set brain.summary_effort high`, then `scenario s1-away --dry-run`
   (fake Slack, the real brain, the fictional world: the answers flag the questions for Manish, since the
   fictional repos hold no facts; a pass is a thread reply for each colleague post and one DM to the owner).
   Dry runs of `s1-online`, `s2-brief` and the `f*` scenes also need only a brain; `s3-meeting` needs a meeting
   bot account and a test meeting; `f6-fresh` needs a real code host.
9. **Update STATE** ("Where we are", your session row, the answers), commit, and go on to "Next": WP7.

## 7. What comes next

[PLAN](docs/build/PLAN.md) has the detail. In order:

1. **WP7, the privacy fix, then the adapter contract everywhere** ([plan](docs/build/next/WP7-privacy-and-contract.md)).
   Must land before any company data flows.
2. **WP8, the brain on the company harness:** AirChat (or the harness Airbnb approves) as a brain backend,
   added by settings; isolation proven with a canary.
3. **WP9, the Airbnb integrations,** each with a spike first: (a) code through Airbnb's GitHub and the
   Sourcegraph MCP; (b) people, teams and ownership through One Airbnb; (c) Airbnb's Slack; (d) Airbnb's
   Zoom; (e) the AirChat plugin. Then S2's live walk on whatever mail and calendar Airbnb allows.
4. **WP10, the demo** ([plan](docs/build/next/WP10-demo.md)), beside WP9: fast live meeting answers, the
   demo script, page polish, backup recordings, the film opener, two rehearsals before 16 Nov.

## 8. What needs Manish

STATE "Needs Manish", asked one at a time, each explained in plain words with your recommendation. Never ask
him to paste a secret into a chat: secrets go straight into `~/.ai-peer/.env`.

## 9. How to hand off

- Measure your context right after reading and at every milestone: your tool's meter, or (Claude Code) the
  last `usage` record in your session transcript: input + cache read + cache creation, over the window
  ([ways of working](docs/ways-of-working.md) sections 7 and 13).
- **At 45 to 50%:** finish the current step, commit (and push), write
  `docs/build/handoffs/HANDOFF-<YYYY-MM-DD>-<your session name>.md` from the template in ways-of-working
  section 12, update STATE, give Manish (or start) the successor's one-line kickoff, and stop.
- **Usage:** at 93% of the weekly limit start nothing that cannot finish cleanly; at about 95% every session
  finishes its step, hands off and stops.

## 10. What is where

```text
START-HERE.md  AGENTS.md  CLAUDE.md  README.md  requirements.txt
docs/ways-of-working.md  docs/lessons.md  docs/porting-guide.md
docs/build/       STATE, DESIGN, PRD, PLAN, BRIEF and RESEARCH (sanitized), setup/ (generic how-tos),
                  next/ (package plans), handoffs/ (empty: yours start here), evidence/ (empty)
peer/             the product code (Python 3.12); peer/README.md runs it
demo/script.md    the live demo script
film/             the concept film: docs, video source, and the latest render (draft 07)
.agents/skills/ai-peer/   a resume skill for agents that load skills (.claude/skills/ai-peer links to it)
```

Not in this copy (they stayed with the original repository on the first laptop, and nothing here needs them):
every account and token, the old Peer's memory and logs, its browser profile, the evidence screenshots and walk
records, the old session hand-offs, older film drafts and media.
