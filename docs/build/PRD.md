# AI Peer: what it must do

The generic AI Peer, working end to end in a test world (the fictional company Fernway, on
test accounts; DESIGN D4), plus a porting guide, by 15 Nov 2026. How: [DESIGN](DESIGN.md).
Each scene and feature is done when its **walk** passes: the scenario script plays it
and a person sees the Peer behave as written (D13).

## The world it runs in

- **Owner:** Manish, Engineering Lead at Fernway (team "Notes app"), India time (IST).
- **What he owns:** the Fernway Notes repos (API backend, web app, admin tool, iOS app,
  sync service) with their docs, trackers, PRs and CI, read through GitHub, read-only.
  The test world's repos do not exist; at a real company these are its own repos.
- **Colleagues:** 4 to 6 fake teammates in a test Slack workspace (for example a product
  lead, a design lead, a partnerships lead, a US-based advisor), played by the scenario
  script; their mail and invites come from addresses the script controls.
- **Accounts (the kinds needed):** a Slack workspace and one app (plus a test-only
  scenario app for the colleagues); a mail and calendar account (Google Workspace: Gmail,
  Calendar, Drive/Docs); a code-host token (GitHub, read-only); a meeting-bot service
  (Recall.ai) with a Zoom account that hosts the scene meetings; a voice service
  (ElevenLabs: voices for fake colleagues and the holding line).

## Features that come with every scene

| # | Feature | Done when |
|---|---|---|
| F1 | **One-click setup.** A profile page (the company-directory stand-in) with "Create my AI Peer". Discovery runs live and shows progress: profile, team, owned repos and services, docs, Slack channels, people, calendar. Ends on "Your Peer is ready". | From an empty `~/.ai-peer/`, one click builds the memory in a few minutes, with the progress visible. |
| F2 | **What I learned about you.** A page with role, team, owned services, projects and their status, people, interests; every fact with source and date; Manish can correct a fact. | A correction on the page changes the memory file and the next answer uses it. |
| F3 | **Roles and settings.** Switches: Watch my work, Stand in when I'm away, Find opportunities, Cover meetings, Daily brief; scope in plain English; the away switch. | Turning a role off stops that behaviour in the next walk. |
| F4 | **Activity log.** Every action: who asked, what the Peer said or did, sources, outcome; "needs your review" items first. | Every scene's actions appear with sources. |
| F5 | **Self-tuning.** Manish says "less of this" or reacts in his DM; the Peer edits `rules.md` and confirms in one line. | After "stop telling me about CI failures on drafts", the next such event is not pushed. |
| F6 | **Fresh memory.** New events update the affected memory files; a nightly pass re-reads key docs; facts carry source and date. | A tracker change in one of his repos shows up in the Peer's next answer. |
| F7 | **Local work.** Session-end hooks (Claude Code, Codex) and an hourly scan of chosen folders record repo, branch, unpushed changes and a short summary. | "What is Manish working on?" mentions today's unpushed branch. |
| F8 | **Swappable brain.** One setting runs the brain on Claude Code or Codex. | S1 passes on both backends. |

## Scenes

### S1 Slack cover (first)

- A fake colleague asks in a channel about one of Manish's projects, without tagging
  him (for example "who is driving offline mode, and is it shipping this month?").
- **Manish online:** within about a minute the Peer DMs him: why this thread matters,
  a draft reply, Send / Edit / Skip. Send posts it in the thread as "Manish's AI Peer".
- **Manish away:** within about two minutes it replies in the thread itself: who it is,
  that Manish is offline (and his local time), the answer with sources and dates. It
  handles follow-up questions in that thread. Manish finds it in his DM and the brief.
- Walk: both variants from the scenario script; replies grounded in his own work
  records (repos and memory).

### S2 Daily brief and heads-ups (second)

- Every morning, and on "brief me": a Slack DM and a web page. Sections: what happened
  while you were away (including what the Peer answered for you), email still waiting
  on you, events and opportunities that fit your interests, company news and changes
  that touch your work (real GitHub activity such as failing CI or PRs waiting on you,
  plus seeded announcements). Each item: why it matters, one action (open, draft a
  reply, accept the invite; sending or accepting asks first).
- **Heads-ups:** an urgent item (a direct question, something breaking) comes at once,
  not in the brief.
- Walk: the script seeds an overnight of events; the brief carries each with a reason
  and an action; an urgent one arrives as a heads-up.

### S3 Attend a meeting (third)

- A Zoom meeting on Manish's calendar, hosted on a Zoom account he controls (D8), at a
  time he cannot make (for example 2 AM IST); he marks "cover for me", or the Peer
  offers to.
- **Before:** the Peer drafts his update; he approves it in his DM with one tap.
- **During:** the bot joins as "Manish's AI Peer" and introduces itself; plays the
  approved update when someone asks for Manish; answers other questions live (holding
  line, then the answer; "I'll flag that for Manish" when it has nothing solid); notes
  decisions, questions for Manish and owners. Fake colleagues are a second bot speaking
  scripted lines in ElevenLabs voices.
- **After:** a brief in his DM and on the page: decisions, questions for him, what the
  Peer said, follow-ups.
- Walk: the scripted meeting, including one unscripted question answered live.

## Porting deliverable

- `docs/porting-guide.md`, written for an AI coding agent on a company machine: the
  adapter contract, the test world's adapters as worked examples, a checklist per
  system, the Airbnb notes in DESIGN §6.
- `port-check`: lists the adapters, exercises each verb (act in dry-run), prints a table.

## Demo deliverable (D16)

Live demo of S1 to S3; a backup screen recording of each scene; a short opener cut
from the concept film. Rehearsed twice before the hackathon.

## Not in scope

Unit tests, CI, code-quality work, multi-user, production hardening, a mobile app,
Peer-to-Peer, real Airbnb integrations (Manish, hack week), the upstream-break warning
(extra only, DESIGN D3).
