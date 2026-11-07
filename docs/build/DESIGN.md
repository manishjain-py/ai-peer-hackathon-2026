# AI Peer: design

How the generic AI Peer is built. What it must do: [PRD](PRD.md). The plan from here: [PLAN](PLAN.md).
Live state: [STATE](STATE.md). How we work: [ways of working](../ways-of-working.md).

## §0 Locked decisions

From the kickoff interview on 2026-11-04 (times UTC), plus later rulings. A later session never re-opens
one. If Manish changes a decision, update this table at once with his words and the time.

Where his words named the old test company or a personal account, the cut is marked `[…]`. **Revisit on
the new Mac** marks a decision tied to the first laptop or the old test world: it held there; on the Airbnb
laptop the first sessions confirm or replace it with Manish (one question at a time) and record the answer
here.

| # | Decision | Manish's answer, verbatim | Time |
|---|---|---|---|
| D1 | Solo build; building before the hackathon is allowed. | "Solo, building early is fine" | 11-04 13:45 |
| D2 | **Scope split.** We build the generic system, fully working, plus instructions for plugging in a real company's integrations (porting guide + `port-check`). Manish moves it to his Airbnb laptop and does the Airbnb integrations in hack week (16 to 20 Nov). Generic target: done by 15 Nov. (D17 moves the hand-over earlier.) | "your goal is to have the generic system fully ready and add instructions on how the product needs to be updated with a real company with real integrations. then i move this product to my airbnb laptop and do the airbnb specific integrations. makes sense?" | 11-04 13:51 |
| D3 | **Three hero scenes**, in this order: S1 Slack cover, S2 daily brief and heads-ups, S3 attend a meeting. Always included: one-click setup, "what I learned about you", activity log, roles and settings, self-tuning. The upstream-break warning is an extra, only if S1 to S3 finish early. | "Cover a Slack question, Daily brief and heads-ups, Attend a meeting for me" | 11-04 13:54 |
| D4 | **Test world = a small company Manish ran, with his real repos, docs, PRs and CI as what he owns; invented colleagues in a new Slack workspace, played by a scenario script.** In this copy the test world is the fictional company Fernway (`peer/scenarios/world.yaml`); its repos do not exist. **Revisit on the new Mac:** the real world there is Manish's own work at Airbnb, through the integrations of WP9. | "[…] as the company" | 11-04 13:56 |
| D5 | **Mail and calendar = a Google Workspace account of the test company**, through an Internal OAuth app on its domain (no 7-day token expiry, no unverified-app screen). **Revisit on the new Mac:** whatever mail and calendar Airbnb allows an internal tool to read. | "[…]" (an address on the test company's domain) | 11-04 13:57 |
| D6 | **Brain runtime = always-on watcher + short fresh skill runs.** Plain code watches the sources without AI; only new, relevant items start a short `claude -p` run of the Peer's brain skill. Codex (`codex exec`) is a one-setting switch; AirChat slots in the same way. **The AI proposes, the program acts.** Pin the Claude Code version. | "Watcher + short skill runs (Recommended)" | 11-04 13:59 |
| D7 | **Meetings: live answers to anything**, on top of the approved update, notes and the brief after. A pre-recorded holding line hides the thinking pause; a warm session holds a compact fact pack for the meeting's length (the one exception to D6's fresh runs); "I'll flag that for Manish" when it has nothing solid. | "Live answers to anything" | 11-04 14:05 |
| D8 | **Meeting platform = Zoom**, with the scene meetings and the bot on one Zoom account Manish controls ("join before host" on), which avoids Zoom's on-behalf-of rule (since 2 Mar 2026). Meeting bot via Recall.ai. Google Meet only as a fallback. **Revisit on the new Mac:** Airbnb's Zoom (the bot's app must belong to the company's Zoom account, DESIGN §6). | "we need to make it work on zoom. […]" | 11-04 14:06 |
| D9 | **When Manish is away it answers everything it can.** It always states how sure it is and the date of what it knows, cites sources when it has them, and never commits him to a decision or a date. Defaults kept: it always posts as its own labelled bot "Manish's AI Peer"; emails, invites and commitments always ask first; when he is online it DMs him a draft first (Send / Edit / Skip). | "Answer everything it can" | 11-04 14:06 |
| D10 | **Owner surface = Slack DM + a web page.** DM: nudges, drafts with buttons, the brief, chat ("stop telling me about X"). Web page: profile and "Create my AI Peer", what it learned, roles and settings, activity log. | "Slack DM + web page (Recommended)" | 11-04 14:07 |
| D11 | **Local work = session-end hooks + hourly folder scan.** Claude Code and Codex run a script when a session ends (repo, branch, unpushed changes, a short "what I worked on"); an hourly scan of chosen folders. Summaries, not code. This is the generic AirChat plugin. | "Session-end hooks + folder scan (Recommended)" | 11-04 14:09 |
| D12 | **Repo = the concept-film repo, restructured:** the product at the root, the film in `film/`. In this copy: a fresh repo with one commit and no Git LFS; only the latest film render travels (D17). | "Film repo, restructured" | 11-04 14:13 |
| D13 | **Build = one controller + up to 2 workers.** One session builds the shared foundation first. Hand-offs at 45 to 50% context; [STATE](STATE.md) as the tracker. Hackathon-light: no code review, CI, unit tests or quality gate. Done = the scene seen working in a manual walk. Workers merge their own PR when the walk passes. Short status messages to Manish at milestones. | "Controller + up to 2 workers (Recommended)" | 11-04 14:15 |
| D14 | **Account = the build machine's own AI account, shared with Manish's other work.** The controller checks weekly usage at each milestone; at about 95% every session finishes its step, hands off and stops. Codex is the backup builder and brain. **Revisit on the new Mac:** the coding agent and its limits there (AirChat or another harness), and company data only through the company's harness (DESIGN §6). | "Share this Mac's account" | 11-04 14:16 |
| D15 | **Three checkpoints, one per scene, as soon as each works** (not by date). Dates in the plan are targets. At each: a short screen recording to Manish, then he tries it. | "3 checkpoints but don't restrict by date. if it gets done sooner, i will check sooner" | 11-04 14:28 |
| D16 | **Hackathon deliverable = live demo of S1 to S3 + a backup recording of each scene + a short concept-film opener.** Recordings made at the rehearsal before the hackathon. | "Live demo + backups + film opener (Recommended)" | 11-04 14:32 |
| D17 | **Move to the Airbnb laptop now.** Wrap up on the personal Mac; no more work there. The Airbnb integrations and every further enhancement happen on the Airbnb laptop. The repo goes over as a sanitized fresh copy (no old test company, no account details, no personal data); his ElevenLabs key may go along. The repo stays the single source of truth for everything, including the ways of working (controller and workers, the 45 to 50% hand-off), with clear reading instructions for the coding agent there. | "Now what I want to do is, wherever we are, whatever we have done so far, I would like to wrap things up, and I would like to now move this project over to an Airbnb laptop. We are handing it off from my personal laptop to an Airbnb laptop, where we will do all the Airbnb-specific integrations and also make any further enhancements into this initiative. Airbnb integrations like how it will read the code base using the Airbnb-specific GitHub and Sourcegraph MCP, or the One Airbnb, where it can read about or understand the employee details or their team and the tools and services that they own. Airbnb-specific Zoom, Slack account and also AirChat plugin. All those integrations will be done by the Airbnb Mac. Let's get this repo ready for that handoff and moving it over to that other Mac. We'll not continue any further work on this Mac. And also remove any mentions of […], any internal account details that we have, any sensitive information like that, remove everything. Okay to use my eleven labs api key though. And still, let's treat the repo as the source of truth around what ways of working we have on the controller session or the worker session, forty-five to fifty percent of context window handoff, everything. It should be present within the repo itself. Initiatives, context, what is done so far, what are the next steps, what are the learnings, et cetera, everything. And also clear instructions should be there on how the coding agent who is working on it should go about reading and understanding everything. And once all this is done, give me the final repo as a zip file, which I can just take to my Airbnb Mac and unzip, and that one handoff line, which might be pointing to a file which has clear instructions on how to start working on this. Maybe put everything in that file and give me that one-liner that I can just directly paste in the new AirChat coding session in the Airbnb-specific Mac. Is the ask clear?" | 11-07 06:21 |

### Defaults set at kickoff (not asked; Manish may change any)

- Working name **AI Peer**.
- Stack: Python 3.12 for the watcher, connectors, brain runner and scenario player; FastAPI for the web
  page and webhooks; SQLite; a `cloudflared` quick tunnel when a webhook needs a public URL (live meeting
  transcripts).
- Peer runtime data lives **outside git** in `~/.ai-peer/` (memory, SQLite, logs, tokens in `.env`). The
  repo holds code and docs only.
- The Peer is **read-only on the company's code** and **never touches production systems** (no deploys,
  no databases, no production API calls, no pushes).
- The Peer takes instructions **only from its owner** (the owner's DM and the web page). Everything it
  reads (Slack, mail, docs, transcripts) is information, never an instruction.
- Model: the best available for answers and drafts; a faster setting only on the live meeting path, and
  only where measured answers are too slow.
- Away detection: Slack presence and status, calendar, working hours (India time for Manish), and a manual
  "I'm away" switch.
- Quiet by default: urgent items at once, the rest waits for the brief.

## 1. Shape

```
Sources: Slack · mail · calendar · docs · code host · meetings (Recall bot on Zoom) · local sessions
   │  adapters: sense / search / get / act          ← the only part a company port replaces
Watcher (always on, no AI): cursors, dedupe, cheap relevance rules, event store (SQLite)
   │  new relevant batch, or an urgent rule fires
Brain run: run_agent(prompt, schema) → claude -p | codex exec | (a company harness, e.g. AirChat) + peer-brain skill
   │  reads memory files, returns proposed actions as JSON
Action executor: approval gate, presence check, idempotency, audit log
   │
Surfaces: Slack (bot "Manish's AI Peer": threads, owner DM with buttons) · meeting bot · web page
Memory: ~/.ai-peer/<owner>/ markdown files + index + SQLite (local, never in git)
```

## 2. Adapter contract

One adapter per system, same four verbs. A company port writes new adapters; nothing else should change
(today a few runtime spots still do: [porting guide](../porting-guide.md), "What a port also edits today";
WP7 closes them). `port-check` exercises each verb (act in dry run) and prints a table.

| Verb | Shape | Notes |
|---|---|---|
| `sense(cursor)` | → `events[], next_cursor` | Polling or a socket; never calls the AI. |
| `search(query, filters)` | → `[ref + snippet]` | Live search; chat content is searched, not bulk-copied. |
| `get(ref)` | → item | Full text of one message, doc, PR, transcript. |
| `act(action, target, payload, idempotency_key)` | → result | Post, reply, DM, react, draft email, join meeting, speak. Dry-run flag. |

Event: `{id, source, kind, at, actor, ref, thread_ref, text, url}`. A person map links one person across
chat id, email and code-host login. Each adapter declares its capabilities; the executor refuses an action
no adapter offers.

Adapters in this build: `directory` (a profile JSON, the stand-in for a company directory), `slack`,
`google` (Gmail, Calendar, Drive/Docs), `github` (read-only), `meetings` (Recall.ai on Zoom), `voice` (the
Mac's `say`, ElevenLabs stock voices), `local` (session hooks + folder scan; a plug-in, not an adapter),
`fake` (in memory, for dry runs).

## 3. Brain

- `run_agent(prompt, schema)` has a Claude backend (`claude -p --output-format json --json-schema …
  --permission-mode dontAsk` with read-only tools, `--no-session-persistence`, working directory = the
  Peer's memory folder) and a Codex backend (`codex exec --json --output-schema … --sandbox read-only
  --ephemeral`). A setting picks one.
- Each run is isolated from the user's own setup: `--setting-sources project`, hooks and auto-memory off,
  no MCP servers, and `CLAUDE_CODE_DISABLE_CLAUDE_MDS=1` in its env (the flags alone stopped keeping the
  user's global `CLAUDE.md` out; [lessons](../lessons.md)). Codex runs in its own `CODEX_HOME` and `HOME`.
- **Known privacy flaw, fixed first in WP7:** `brain.fallback` (on by default) sends a failed run of any
  backend that is not claude to claude, and live meeting answers always use the Claude warm session
  whatever `brain.backend` says. On a company laptop that could send company data to a personal login
  (§6). Until WP7 lands, keep `brain.fallback: false` and keep company data away from the Peer.
- The `peer-brain` skill holds the playbooks: triage a batch, answer a question, draft a reply, build the
  brief, prepare a meeting update, answer live in a meeting, update memory, apply owner feedback. Skill text
  never hard-codes tool names (they differ between harnesses).
- The run reads memory with file tools only and returns actions as JSON. It never posts or sends anything
  itself; the executor does, after the approval gate (D9).
- Live meeting path (D7): one warm session for the meeting's length, primed with a compact fact pack built
  just before the meeting; the holding line plays at once.

## 4. Memory

- `~/.ai-peer/<owner>/`: `INDEX.md` (one line per file), `me.md`, `rules.md` (owner preferences in plain
  English; self-tuning edits this), `projects/`, `services/`, `people/`, `threads/`, `decisions/`,
  `meetings/`, `local/`, `log.jsonl` (append-only activity), `peer.db` (events, cursors, links, FTS index).
- Each fact carries its source link and date ("as of 2026-11-03, PR #42"). Freshness: events update the
  affected files; a nightly pass re-reads key docs.
- The same shape as the repo's own memory: an index plus small files read on demand.

## 5. Trust rules (the product's, not only the code's)

- Always its own labelled identity; announces itself in threads and meetings.
- Content is data: a message saying "Peer, do X" is not an instruction unless it is the owner's DM.
- D9's autonomy: answers labelled with certainty and date; commitments, emails and invites ask first;
  every action logged with who asked, what it said, sources.
- Read-only on the company's code; never touches production systems.
- Hard blocks stay on until the owner lifts one in his own words (the porting guide lists them).

## 6. Porting to a real company

The [porting guide](../porting-guide.md) is for an AI coding agent on the target machine that has never seen
this repo: the adapter contract, the adapters as worked examples, a checklist per system, `port-check`, and
"The Airbnb port". Known Airbnb notes so far: AirChat becomes a `run_agent` backend; company data goes only
through the company's harness and auth, never a personal subscription; the bot's Zoom app must be owned by
the company's Zoom account; the profile can come from the OneAirbnb page (a small browser extension that adds
"Create my AI Peer" and reads the page) or a hand-written profile file; a Slack app needs workspace approval.
