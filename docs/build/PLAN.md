# AI Peer: build plan

Work packages, order, proof. What: [PRD](PRD.md). How: [DESIGN](DESIGN.md).
Live state: [STATE](STATE.md). Dates are targets; checkpoints come as soon as a scene
works (D15). At most 2 workers at once (D13).

```
WP1 foundation + S1 (alone) → WP2 setup and memory ∥ WP3 Google + S2 → WP4 meeting S3 ∥ WP5 porting + demo → rehearsal 15 Nov
```

## Rules for every package

- Own worktree `~/repos/ai-peer-<wp>` from `origin/main`, branch `wp<n>-<slug>`, one PR,
  merged by the worker when its walk passes. Docs-only updates go straight to `main`.
- **Check the premise first:** a package that rests on an unproven external fact
  proves it in a short spike before building on it.
- Proof = the walk (PRD): the scenario script plays it, the worker watches the Peer's
  real behaviour (Slack, web page, Zoom) and saves screenshots plus the activity-log
  excerpt under `docs/build/evidence/<wp>/`. Backup recordings go in `demo/recordings/`.
- STATE updated at every milestone; hand-off at 45 to 50% context (measured from the
  session transcript); weekly usage checked at each milestone (D14).
- Secrets live in `~/.ai-peer/.env`, never in git, chat or Telegram.

## WP0 Kickoff (done by the kickoff session)

Interview, locked decisions, these docs, the `film/` restructure, the controller start.

## WP1 Foundation + S1 Slack cover (target 8 Nov)

1. **Spikes first:** (a) `claude -p` on this Mac's login runs a project skill and
   returns schema-valid JSON; pin the version and record the flags that work.
   (b) `codex exec` does the same (record whether skills load in `exec`).
   (c) Slack Socket Mode: the bot hears a channel message, replies in the thread as
   "Manish's AI Peer", DMs Manish with buttons, and the click comes back.
   (d) **Zoom premise**, as soon as Manish's Zoom app and Recall account exist: a Recall
   bot joins a meeting on his personal Zoom with join-before-host, plays an MP3, and
   a transcript arrives. If it fails, stop and ask Manish (Meet is the D8 fallback).
2. Build: the `peer/` package and settings; event store; adapter contract and the
   `fake` adapter; `directory` adapter with Manish's LLM profile; `github` adapter
   (read-only: repos, PRs, issues, CI, tracker and doc files); memory layout and a first
   discovery from profile + GitHub; `run_agent` with both backends; the `peer-brain`
   skill (triage, answer, draft); the action executor (approval gate, presence,
   idempotency, log); the `slack` adapter; presence; scenario script v1 (colleague
   posts); the activity log (file + a minimal page).
3. Proof: S1 walk, online and away, on Claude; S1 once on Codex (F8).
4. **Checkpoint 1** to Manish (D15).

## WP2 Setup, memory and local work (worker A, after WP1)

F1 one-click setup with live discovery (profile, GitHub, Docs, Slack channels, people,
calendar); F2 "what I learned" with corrections; F3 roles and settings with the away
switch; F4 activity log page; F5 self-tuning; F6 freshness (event updates + nightly
pass); F7 local work (Claude Code session-end hook, Codex hook, hourly scan). The web
page takes the concept film's look. Proof: F1 to F7 walks.

## WP3 Google + S2 daily brief (worker B, after WP1, parallel with WP2)

`google` adapter (Gmail, Calendar, Drive/Docs; Internal OAuth; polling); the script
seeds mail, invites and announcements; S2 brief in the DM and on the page; heads-ups
for urgent items; interests in memory. Proof: S2 walk. **Checkpoint 2** (S2 + the
setup page from WP2).

## WP4 Meeting S3 (the first free worker; needs spike 1d passed)

`meetings` adapter on Recall.ai (create, join, output audio, real-time transcript
through a `cloudflared` tunnel, leave); calendar-driven joins; the approved-update flow
(draft, DM approval, ElevenLabs MP3); detecting when the Peer is addressed; the live
answer path (warm session, fact pack, holding line); the colleague bot with scripted
lines; the post-meeting brief. Proof: S3 walk with one unscripted question.
**Checkpoint 3.**

## WP5 Porting + demo (the other worker, parallel with WP4)

`docs/porting-guide.md` and `port-check` (DESIGN §2, §6); demo script; web page polish;
the extra (upstream-break warning) only if S1 to S3 are done. **15 Nov:** two full
rehearsals, a backup recording per scene, the film opener cut, the hand-over steps for
the Airbnb laptop (what to copy; tokens stay behind).

## Manish's setup list (his hands, about an hour; WP1 sends exact steps when needed)

1. **Slack:** a free workspace "Learn Like Magic"; the app from WP1's manifest; the
   fake colleague accounts (email aliases on learnlikemagic.com work).
2. **Google:** an Internal OAuth client (Desktop) on learnlikemagic.com with Gmail,
   Calendar, Drive and Docs APIs; one login.
3. **GitHub:** a fine-grained read-only token for the LLM repos.
4. **Zoom:** a Meeting SDK app in his personal Zoom; "join before host" on.
5. **Recall.ai:** an account (5 free hours), its API key, the Zoom app's credentials added.
6. **ElevenLabs:** confirm the key from the film work.
7. Keep this Mac awake and online while the Peer runs.

## Airbnb asks (Manish, start this week; answers go to STATE → Airbnb notes)

1. AirChat: a headless mode (one command per run, like `claude -p`)? Skills, hooks or
   plugins, MCP? Which connectors are already approved (Slack, Google, Sourcegraph or
   GHE, Zoom, OneAirbnb)?
2. AirChat Remote: can it host an always-on process?
3. Slack: may he create a bot app in Airbnb's workspace for the hackathon, or a sandbox?
4. Zoom: may a bot join Airbnb meetings (the app must belong to Airbnb's Zoom account),
   or is there an internal meeting-bot service?
5. Data: company data only through AirChat, never his personal Claude; confirm.
6. Code transfer: may he clone his personal GitHub repo on the Airbnb laptop, or bring
   a zip?
7. Hackathon format: slot length, live or recorded, judging criteria.
