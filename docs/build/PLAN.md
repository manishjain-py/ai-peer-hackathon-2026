# AI Peer: plan from here

Work packages, order, proof. What: [PRD](PRD.md). How: [DESIGN](DESIGN.md). Live state: [STATE](STATE.md).
How we work: [ways of working](../ways-of-working.md). Dates are targets; a checkpoint comes as soon as a scene
works (D15). At most 2 workers at once (D13).

```
Done on the first laptop (4 to 7 Nov 2026):
  WP0 kickoff → WP1 foundation + S1 → WP2 setup and memory ∥ WP3 mail + S2 → WP4 meeting S3 ∥ WP5 porting guide
Next on the Airbnb laptop:
  WP6 set up → WP7 privacy fix + adapter contract → WP8 brain on the company harness
             → WP9 Airbnb integrations (a to e) ∥ WP10 demo → rehearsals → hackathon 16 to 20 Nov
```

## Rules for every package

- Own worktree from the latest `main` (for example `../ai-peer-wp7`), branch `wp<n>-<slug>`, one PR if the
  repo has a remote (a local merge into `main` until it has one), merged by the worker when its walk passes.
  Docs-only updates go straight to `main`.
- **Check the premise first:** a package that rests on an unproven outside fact (an API, a login, a flag, a
  permission) proves it in a short spike before building on it.
- **No company data before WP7's privacy fix is in** (DESIGN §3, §6), and only through the company's harness
  and auth after it.
- Proof = the walk (PRD): the scenario script or Manish plays it, the worker watches the Peer's real
  behaviour (Slack, web page, meeting) and saves what it saw under `docs/build/evidence/<wp>/`: no secrets,
  and no more company data than the walk needs. Backup recordings go in `demo/recordings/` (large media
  stays out of git unless the repo's home allows it).
- STATE updated at every milestone; hand-off at 45 to 50% context (measured); usage limits checked at each
  milestone ([ways of working](../ways-of-working.md)).
- Secrets live in `~/.ai-peer/.env`, never in git, chat or messages.

## Done on the first laptop

| WP | What | Outcome |
|---|---|---|
| WP0 | Kickoff: interview, decisions D1 to D16, the docs, the film moved into `film/` | Done |
| WP1 | Foundation (`peer/`: adapters, event store, memory and discovery, brain on Claude and Codex, executor, watcher, presence, scenario player, web page, CLI) and **S1 Slack cover** | **Done.** S1 passed in dry runs on Claude and Codex, then live: away (a labelled thread answer in about 40 s with sources, the follow-up, one DM summary) and online (the draft card in the owner's DM about 37 s after the post, Send posts it in the thread). Two recorded walks; checkpoint 1 sent. F8 (Codex as the brain) passed |
| WP2 | F1 one-click setup with live discovery, F2 what I learned with corrections, F3 roles and settings with the away switch, F4 activity log, F5 self-tuning, F6 fresh memory, F7 local work (session-end hooks and an hourly folder scan) | **Done.** F1 to F7 walked on a test owner; the away switch walked live. Not done: the live F5 check in the owner's DM |
| WP3 | Mail, calendar and docs (`google` adapter: Gmail, Calendar, Drive/Docs, Internal OAuth, polling), seeded test mail and invites, **S2 daily brief** (DM and page), heads-ups, Draft reply / Send email / Accept behind a hard block, the morning schedule and "brief me" | **Built and merged; S2's dry walk passed** (the brief about 22 s after "brief me"). Not done: the OAuth client, the logins and S2's live walk |
| WP4 | **S3 attend a meeting**: `meetings` adapter on Recall.ai (join, speak, live transcript through a `cloudflared` tunnel, leave), calendar-driven joins, the approved update, addressed detection, live answers (warm session, fact pack, holding line), the colleague bot, the brief after, the Meetings page; `voice` adapter | **Done.** Spike, dry walk and live walk passed: the Peer joined, played the approved update about 1 s after the ask, answered 3 live questions (heard about 21, 12 and 7 s after each), flagged 2 items, and the brief reached the DM about 23 s after it left. Checkpoint 3 sent |
| WP5 (part 1) | `port-check` (checks every adapter in settings against the contract), [the porting guide](../porting-guide.md), the porting walk (a fresh agent ported a toy chat adapter from the guide alone; its 11 gaps folded in), [the demo script](../../demo/script.md) draft | **Done.** WP5's rest is split into WP7 (the contract everywhere) and WP10 (the demo) |

Also found and fixed on 6 Nov: the brain was loading the owner's global `CLAUDE.md` despite its isolation
flags; `CLAUDE_CODE_DISABLE_CLAUDE_MDS=1` in the brain's env keeps it out ([lessons](../lessons.md)).
Checkpoint 2 (S2 plus the setup page) was never sent.

## Next on the Airbnb laptop

### WP6 Set up on the new laptop (the first session, with Manish)

[START-HERE.md](../../START-HERE.md) "First steps" in order: check the copy, decide where the repo lives,
the Python venv, the ElevenLabs key into `~/.ai-peer/.env`, a test owner, every module imports, `port-check
--adapter fake`, what the coding agent there can do (sub-agents, sessions, context and usage readings; the
fallbacks in [ways of working](../ways-of-working.md) cover what it cannot), and the Airbnb asks below.
Proof: the checks pass and STATE records the answers. No company data yet.

### WP7 Privacy fix and the adapter contract everywhere (code)

Brief: [next/WP7-privacy-and-contract.md](next/WP7-privacy-and-contract.md). **The privacy fix first:** a
failing backend that is not claude must never fall back to a personal Claude login, and live meeting answers
must use the configured backend, not always the Claude warm session. Then one registry that builds every
adapter from settings, role methods for the calls the runtime makes besides the four verbs, settings instead
of code edits (code-host base URLs, the trial's people file, a brain backend added by settings), and the
porting guide finished. Proof: `port-check` with role checks, the dry walks, a stub-backend test, a stranger's
porting walk and a hand-over rehearsal on a clean copy. **Must land before any company data flows.**

### WP8 The brain on the company harness

A `run_agent` backend for the harness Airbnb approves (AirChat if it has a headless mode, or the company's
own Claude Code or Codex login), added through WP7's settings hook: one prompt per run, the `peer-brain`
skill loaded from the owner's folder, read-only tools, JSON out, none of the user's personal setup loaded
(prove it with a canary), company data only through it. Then the live meeting path for it (a warm mode, or
fresh runs inside the meeting's time limit). Proof: S1's dry walk on the new backend, the canary, a timed
live-answer run. Needs the answers to Airbnb asks 1, 2 and 5.

### WP9 The Airbnb integrations (Manish's list, 7 Nov)

What Manish named, and nothing more is known yet: each starts with a spike that proves access and the API,
then an adapter or settings, `port-check`, and a walk on Manish's own work with every hard block on.
Details: [porting guide, "The Airbnb port"](../porting-guide.md#the-airbnb-port).

- (a) **Code:** read the code base through Airbnb's GitHub and the Sourcegraph MCP.
- (b) **People, teams and ownership:** One Airbnb: the employee's details, their team, and the tools and
  services they own.
- (c) **Slack:** Airbnb's Slack, the Peer's own labelled app.
- (d) **Zoom:** Airbnb's Zoom for the meeting bot.
- (e) **The AirChat plugin:** the Peer inside AirChat (local work, D11; the brain, WP8).

Also on the list from the first laptop: S2's live walk against whatever mail and calendar Airbnb allows,
and the live F5 check.

### WP10 Demo package

Brief: [next/WP10-demo.md](next/WP10-demo.md). The live-answer speed (the meeting fact pack), the presence and
test-meeting-memory follow-ups, the demo script from the live walks, web page polish, backup recordings,
the film opener; two full rehearsals before 16 Nov. Its live steps wait for WP7.

## Manish's setup list on the new laptop

1. Unzip the package; move the ElevenLabs key line into `~/.ai-peer/.env` ([START-HERE](../../START-HERE.md)).
2. Where the repo lives (a remote the company allows, or local only).
3. The coding agent and its login (the harness for building; WP8's harness for the Peer's brain).
4. Slack, Zoom, GitHub and Sourcegraph, One Airbnb: the access WP9's spikes need, one at a time as each
   package asks.
5. Keep the laptop awake and online while the Peer runs.

## Airbnb asks (Manish; answers go to STATE → Airbnb notes)

1. AirChat: a headless mode (one command per run, like `claude -p`)? Skills, hooks or plugins, MCP? Which
   connectors are already approved (Slack, Google, Sourcegraph or GHE, Zoom, OneAirbnb)?
2. AirChat Remote: can it host an always-on process?
3. Slack: may he create a bot app in Airbnb's workspace for the hackathon, or a sandbox?
4. Zoom: may a bot join Airbnb meetings (the app must belong to Airbnb's Zoom account), or is there an
   internal meeting-bot service?
5. Data: company data only through AirChat (or the company's harness), never his personal Claude; confirm.
6. Code transfer: is a zip of this repo fine on the Airbnb laptop, and where may the repo live (a remote)?
7. Hackathon format: slot length, live or recorded, judging criteria.
