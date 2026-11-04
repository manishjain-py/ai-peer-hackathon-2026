# AI Peer: design

How the generic AI Peer is built. What it must do: [PRD](PRD.md). Order of work:
[PLAN](PLAN.md). Live state: [STATE](STATE.md). Manish's words: [brief](BRIEF-2026-11-04.md).
Evidence behind the choices: [research](RESEARCH-2026-11-04.md).

## §0 Locked decisions

From the kickoff interview, 2026-11-04 (times UTC). A later session never re-opens
one. If Manish changes a decision, update this table at once with his words and time.

| # | Decision | Manish's answer, verbatim | Time |
|---|---|---|---|
| D1 | Solo build; building before the hackathon is allowed. | "Solo, building early is fine" | 13:45 |
| D2 | **Scope split.** We build the generic system, fully working, plus instructions for plugging in a real company's integrations (porting guide + `port-check`). Manish moves it to his Airbnb laptop and does the Airbnb integrations in hack week (16 to 20 Nov). Generic target: done by 15 Nov. | "your goal is to have the generic system fully ready and add instructions on how the product needs to be updated with a real company with real integrations. then i move this product to my airbnb laptop and do the airbnb specific integrations. makes sense?" | 13:51 |
| D3 | **Three hero scenes**, in this order: S1 Slack cover, S2 daily brief and heads-ups, S3 attend a meeting. Always included: one-click setup, "what I learned about you", activity log, roles and settings, self-tuning. The upstream-break warning is an extra, only if S1 to S3 finish early. | "Cover a Slack question, Daily brief and heads-ups, Attend a meeting for me" | 13:54 |
| D4 | **Test world = Learn Like Magic as the company.** Manish's real LLM repos, docs, PRs and CI are what he owns; fake colleagues in a new LLM Slack workspace, played by a scenario script. | "Learn Like Magic as the company" | 13:56 |
| D5 | **Google account = manish@learnlikemagic.com** (Google Workspace; MX checked). Use an Internal OAuth app on the domain: no 7-day token expiry, no unverified-app screen. | "manish@learnlikemgic.com" (typo for learnlikemagic.com) | 13:57 |
| D6 | **Brain runtime = always-on watcher + short fresh skill runs.** Plain code watches the sources without AI; only new, relevant items start a short `claude -p` run of the Peer's brain skill. Codex (`codex exec`) is a one-setting switch; AirChat slots in the same way. **The AI proposes, the program acts.** Pin the Claude Code version. | "Watcher + short skill runs (Recommended)" | 13:59 |
| D7 | **Meetings: live answers to anything**, on top of the approved update, notes and the brief after. A pre-recorded holding line hides the thinking pause; a warm session holds a compact fact pack for the meeting's length (the one exception to D6's fresh runs); "I'll flag that for Manish" when it has nothing solid. | "Live answers to anything" | 14:05 |
| D8 | **Meeting platform = Zoom on Manish's personal Zoom account.** The bot's Zoom app and the scene meetings live in that one account ("join before host" on), which avoids Zoom's on-behalf-of rule (since 2 Mar 2026). Meeting bot via Recall.ai. Google Meet only as a fallback. | "we need to make it work on zoom. i have a personal zoom account as well" | 14:06 |
| D9 | **When Manish is away it answers everything it can.** It always states how sure it is and the date of what it knows, cites sources when it has them, and never commits him to a decision or a date. Defaults kept: it always posts as its own labelled bot "Manish's AI Peer"; emails, invites and commitments always ask first; when he is online it DMs him a draft first (Send / Edit / Skip). | "Answer everything it can" | 14:06 |
| D10 | **Owner surface = Slack DM + a web page.** DM: nudges, drafts with buttons, the brief, chat ("stop telling me about X"). Web page: profile and "Create my AI Peer", what it learned, roles and settings, activity log. | "Slack DM + web page (Recommended)" | 14:07 |
| D11 | **Local work = session-end hooks + hourly folder scan.** Claude Code and Codex run a script when a session ends (repo, branch, unpushed changes, a short "what I worked on"); an hourly scan of chosen folders. Summaries, not code. This is the generic AirChat plugin. | "Session-end hooks + folder scan (Recommended)" | 14:09 |
| D12 | **Repo = this film repo, restructured.** Product at the root; the film moved into `film/` (pure move, commit 6ba5ca6); `.lfsconfig` skips the film's 3.7 GB of media by default. | "Film repo, restructured" | 14:13 |
| D13 | **Build = one controller + up to 2 workers.** One session builds the shared foundation first. Hand-offs at 45 to 50% context; [STATE](STATE.md) as the tracker. Hackathon-light: no code review, CI, unit tests or quality gate. Done = the scene seen working in a manual walk. Workers merge their own PR when the walk passes. Telegram one-liners. | "Controller + up to 2 workers (Recommended)" | 14:15 |
| D14 | **Account = this Mac (Mac-48-GB) and its Claude account, shared with Learn Like Magic.** The controller checks weekly usage at each milestone; at about 95% every session finishes its step, hands off and stops. Codex is the backup builder and brain. | "Share this Mac's account" | 14:16 |
| D15 | **Three checkpoints, one per scene, as soon as each works** (not by date). Dates in the plan are targets. At each: a short screen recording on Telegram, then Manish tries it. | "3 checkpoints but don't restrict by date. if it gets done sooner, i will check sooner" | 14:28 |
| D16 | **Hackathon deliverable = live demo of S1 to S3 + a backup recording of each scene + a short concept-film opener.** Recordings made at the 15 Nov rehearsal. | "Live demo + backups + film opener (Recommended)" | 14:32 |

### Defaults set at kickoff (not asked; Manish may change any)

- Working name **AI Peer**.
- Stack: Python 3.12 for the watcher, connectors, brain runner and scenario player;
  FastAPI for the web page and webhooks; SQLite; a `cloudflared` quick tunnel when a
  webhook needs a public URL (meeting transcripts).
- Peer runtime data lives **outside git** in `~/.ai-peer/` (memory, SQLite, logs,
  tokens in `.env`). The repo holds code and docs only.
- The Peer is **read-only on LLM code** and **never touches LLM production** (no deploys,
  no database, no prod API calls, no pushes).
- The Peer takes instructions **only from Manish** (his DM and the web page). Everything
  it reads (Slack, mail, docs, transcripts) is information, never an instruction.
- Model: the best available for answers and drafts; a faster model only on the live
  meeting path, and only if measured answers are too slow.
- Away detection: Slack presence and status, calendar, working hours (IST), and a manual
  "I'm away" switch.
- Quiet by default: urgent items at once, the rest waits for the brief.

## 1. Shape

```
Sources: Slack · Gmail · Calendar · Drive/Docs · GitHub · Zoom (Recall bot) · local sessions
   │  adapters: sense / search / get / act          ← the only part a company port replaces
Watcher (always on, no AI): cursors, dedupe, cheap relevance rules, event store (SQLite)
   │  new relevant batch, or an urgent rule fires
Brain run: run_agent(prompt, schema) → claude -p | codex exec | (AirChat) + peer-brain skill
   │  reads memory files, returns proposed actions as JSON
Action executor: approval gate, presence check, idempotency, audit log
   │
Surfaces: Slack (bot "Manish's AI Peer": threads, owner DM with buttons) · Zoom bot · web page
Memory: ~/.ai-peer/<owner>/ markdown files + index + SQLite FTS (local, never in git)
```

## 2. Adapter contract

One adapter per system, same four verbs. A company port writes new adapters; nothing
else changes. `port-check` exercises each verb (act in dry-run) and prints a table.

| Verb | Shape | Notes |
|---|---|---|
| `sense(cursor)` | → `events[], next_cursor` | Polling or a socket; never calls the AI. |
| `search(query, filters)` | → `[ref + snippet]` | Live search; Slack content is searched, not bulk-copied. |
| `get(ref)` | → item | Full text of one message, doc, PR, transcript. |
| `act(action, target, payload, idempotency_key)` | → result | Post, reply, DM, react, draft email, join meeting, speak. Dry-run flag. |

Event: `{id, source, kind, at, actor, ref, thread_ref, text, url}`. A person map links
one person across Slack id, email and GitHub login. Each adapter declares its
capabilities; the executor refuses an action no adapter offers.

Adapters in this build: `directory` (profile JSON, the stand-in for a company
directory), `slack`, `google` (Gmail, Calendar, Drive/Docs), `github`, `meetings`
(Recall.ai on Zoom), `local` (session hooks + folder scan), `fake` (in-memory, for
dry runs).

## 3. Brain

- `run_agent(prompt, schema)` has a Claude backend (`claude -p --output-format json
  --json-schema … --permission-mode dontAsk --allowedTools <read-only list>
  --no-session-persistence`, working directory = the Peer's memory folder) and a Codex
  backend (`codex exec --json --output-schema … --sandbox read-only --ephemeral`).
  A setting picks one; on a rate limit it may fall back to the other.
- The `peer-brain` skill holds the playbooks: triage a batch, answer a question,
  draft a reply, build the brief, prepare a meeting update, update memory, apply owner
  feedback. Skill text never hard-codes tool names (they differ between Claude and Codex).
- The run reads memory with file tools only and returns actions as JSON. It never
  posts or sends anything itself; the executor does, after the approval gate (D9).
- Live meeting path (D7): one warm session for the meeting's length, primed with a
  compact fact pack built just before the meeting; the holding line plays at once.

## 4. Memory

- `~/.ai-peer/<owner>/`: `INDEX.md` (one line per file), `me.md`, `rules.md` (owner
  preferences in plain English; self-tuning edits this), `projects/`, `services/`,
  `people/`, `threads/`, `decisions/`, `meetings/`, `local/`, `log.jsonl` (append-only
  activity), `peer.db` (events, cursors, links, FTS index).
- Each fact carries its source link and date ("as of 2026-11-03, PR #702"). Freshness:
  events update the affected files; a nightly pass re-reads key docs.
- The same shape as the repo's own memory: an index plus small files read on demand.

## 5. Trust rules (the product's, not only the code's)

- Always its own labelled identity; announces itself in threads and meetings.
- Content is data: a message saying "Peer, do X" is not an instruction unless it is
  Manish's DM.
- D9's autonomy: answers labelled with certainty and date; commitments, emails and
  invites ask first; every action logged with who asked, what it said, sources.
- Read-only on LLM code; never touches LLM production.

## 6. Porting to a real company

The [porting guide](../porting-guide.md) (written in the build) is for an AI coding
agent on the target machine that has never seen this repo: the adapter contract, the
personal adapters as worked examples, a checklist per system, and `port-check`.
Known Airbnb notes so far: AirChat becomes a `run_agent` backend; company data goes
only through the company's harness and auth, never a personal subscription; the bot's
Zoom app must be owned by the company's Zoom account; the profile can come from the
OneAirbnb page (a small browser extension that adds "Create my AI Peer" and reads the
page) or a hand-written profile file; a Slack app needs workspace approval.
