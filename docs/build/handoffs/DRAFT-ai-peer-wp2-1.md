<!-- DRAFT by ai-peer-controller-1, 2026-11-05. Not a hand-off yet: at the WP1 merge the live controller re-checks every cited line on the new head, has a read-only check for stale facts, sets {DATE}, saves it as HANDOFF-<date>-ai-peer-wp2-1.md and deletes this draft. -->

# Hand-off: ai-peer-wp2-1 (WP2 setup, memory and local work)

For: `ai-peer-wp2-1`, Claude Opus 5.5 (1M), max effort. Written {DATE} by `ai-peer-controller-2`,
which started it. Controller: `ai-peer-controller-2` (window 2048), unless STATE names a newer one;
reach it with SendMessage. Dated, never edited after it is written. The living state is
`docs/build/STATE.md` on `origin/main`.

## Manish's standing instruction (quoted from the brief)

> "this is a hackathon, so our main idea is to make it work, and not go off track in
> unimportant things like code quality, unit tests, et cetera ... we build something, we
> test it manually by running it in the browser or running through the terminal ...
> But other than that, we should try to follow all our ways of working."

Merge rule (D13): you merge your own PR as soon as the F1 to F7 walks pass. No review, CI or
unit tests.

## The job

On the merged WP1 foundation, make the owner's side work end to end: one-click setup with
live discovery (F1), "what I learned" with corrections (F2), roles and settings (F3), the
activity log page (F4), self-tuning (F5), fresh memory (F6) and local work (F7), in the
concept film's look. `ai-peer-wp3-1` (Google + S2 daily brief) runs at the same time.

## Read first, in order (only these)

1. `AGENTS.md` (root).
2. `docs/build/STATE.md` on `origin/main`.
3. `docs/build/DESIGN.md`: §0, §2, §4, §5.
4. `docs/build/PRD.md`: "The world it runs in", "Features that come with every scene".
5. `docs/build/PLAN.md`: "Rules for every package", WP2.
6. `peer/README.md`, then only the code you change.
7. For the look, only: `film/video/src/draft02/Shared.tsx` (colours, logo),
   `film/video/src/draft07/SetupScene.tsx` (start, progress, learning panel, switches,
   ready), `film/video/src/draft05/PersonalBrief.tsx` (an app page with a sidebar),
   `film/work/draft04/creative-direction.md` (wording).

## Working copy

- Worktree `~/repos/ai-peer-wp2`, branch `wp2-setup-memory` from `origin/main` (the
  controller creates it). Python 3.12 venv at `~/repos/ai-peer-wp2/.venv` (gitignored), set up
  as `peer/README.md` says.
- Runtime data `~/.ai-peer/<owner>/`; secrets `~/.ai-peer/.env` only, never in git, chat or
  Telegram; never echo a value.

## What to build

| Piece | Must do (PRD "Done when" is the bar) |
|---|---|
| F1 one-click setup | The profile page (the company-directory stand-in, from the `directory` adapter) with "Create my AI Peer". Discovery runs live with visible progress, one step per source: profile, team, owned repos and services, Slack channels, people; Docs and calendar come from WP3's `google` adapter, shown as "not connected yet" until it lands. Ends on "Your Peer is ready". From an empty owner folder in a few minutes. |
| F2 what I learned | Role, team, owned services, projects and status, people, interests; every fact with source and date; a correction on the page edits the memory file and the next answer uses it. |
| F3 roles and settings | Switches: Watch my work, Stand in when I'm away, Find opportunities, Cover meetings, Daily brief; scope in plain English; the away switch (the same one WP1's presence uses). A role turned off stops that behaviour in the next walk. |
| F4 activity log | Grow WP1's minimal page: every action with who asked, what the Peer said or did, sources, outcome; "needs your review" items first. |
| F5 self-tuning | In his DM, "less of this" or a reaction: the Peer edits `rules.md` and confirms in one line. After "stop telling me about CI failures on drafts", the next such event is not pushed. |
| F6 fresh memory | New events update the affected memory files; a nightly pass re-reads key docs; facts keep source and date. A tracker change in an LLM repo shows up in the next answer (the change is Manish's or an existing recent one; the Peer only reads). |
| F7 local work | A Claude Code session-end hook, the Codex equivalent (spike first: which Codex hook or `notify` setting fires at the end, on codex-cli 0.153.4) and an hourly scan of chosen folders: repo, branch, unpushed changes and a short summary, never code, into memory `local/`. "What is Manish working on?" mentions today's unpushed branch. |
| Look | The film's: paper `#f6f4ee`, ink `#152b31`, muted `#617272`, mint `#b7f4cf`, green `#167353`, lines `#d7dfd9`; cards `#fffef9` with border `#d7e2d7`, radius 20; Manrope; small uppercase green labels. Copy short, warm, to "you" ("You choose the access. You keep the decisions."); it always says it is AI. The film's React code (fixed 1920x1080 frames, inline styles, timeline animation) is a reference for the look, not code to reuse. |

## Working beside WP3

- You own `peer/web/` (layout, look, pages), the discovery framework in `peer/memory/`, roles
  and settings, tuning and local work. WP3 owns `peer/adapters/google.py`, the brief, its seeds
  and its page, and adds the Google discovery step to your framework.
- Shared files (`peer/settings.py`, `peer/defaults.yaml`, `peer/__main__.py`,
  `peer/executor.py`, `peer/watcher.py`, `peer/web/app.py`): small, additive changes only.
  Whoever merges second rebases on `main`, takes the other's layout, and re-runs its walks.
- For an interface question, message `ai-peer-wp3-1` directly (SendMessage) and mention it in
  your next report to the controller.

## Manish's hands (through the controller, one ask at a time, exact steps)

- **F7 hooks change his own settings.** `~/.claude/settings.json` syncs to his other Macs
  through `~/claude-config`, so the hook must exit 0 and do nothing where its script is
  missing, and must never slow or break a session; Codex's `~/.codex/config.toml` likewise.
  Write the exact change and the undo, and ask him before you make it.
- Which folders the hourly scan reads (recommend `~/repos`, read-only, summaries only).

## Proof (D13)

The F1 to F7 walks, each against its PRD "Done when", seen working on the real page, Slack and
memory. Screenshots plus activity-log excerpts in `docs/build/evidence/wp2/`. Then tell the
controller the setup page is ready for Checkpoint 2 (with WP3's S2).

## PR and merge

One PR `wp2: setup, memory and local work` into `main`, opened as a draft early: what works,
the walk evidence, what is not verified. Merge when the walks pass. Update STATE on `main`
(fetch first; your branch's copy is older): your package line, lessons, session log.

## Stop rules

- Measure context at every milestone from your transcript (the last usage record of
  `~/.claude/projects/<working-dir folder>/<session id>.jsonl`: input + cache-read +
  cache-creation, of 1M). At 45 to 50%: finish the step, push, write
  `docs/build/handoffs/HANDOFF-<date>-ai-peer-wp2-<n+1>.md`, update STATE, tell the controller,
  stop.
- Weekly usage (`claude -p "/usage" --output-format text`): this Mac's account also runs
  Learn Like Magic. At about 95%, finish the step, hand off, stop.

## Traps known before the first line

- **A real person is in the test Slack:** `preethi`. Never message, mention or DM her; tests
  run only in channels she is not in (STATE "Settled").
- **No Airbnb-internal names in build files** (AGENTS.md): the film's setup screens say
  "OneAirbnb" and "AirChat"; the product says "company directory" and Learn Like Magic.
- F1's "empty folder" walk runs on a separate test owner or after a backup: never wipe
  Manish's live memory under `~/.ai-peer/manish/` or `~/.ai-peer/.env`.
- The Peer is read-only on LLM code and never touches LLM production.
- Brain runs already block Manish's global config (WP1 spikes): use WP1's `run_agent`.
- **Discovery is costly:** WP1's first discovery at max effort used about 15 points of the
  account's weekly usage. Run the F1 walks on a small test owner at `summary_effort: high`; re-run
  Manish's own discovery only when needed. Brain answers run at effort high (max took 113 to
  139 s per answer, too slow for live replies).
- Your idle pings to Telegram are off: anything for Manish goes through the controller.
- Manish let the kickoff session, and the controller for the colleague setup only, drive his
  logged-in Chrome; any other use needs his word, asked through the controller. The Peer's own
  browser profile (`peer browser`, signed in to Slack as manish@ by WP1) is fine for screenshots.
- This Mac also runs Learn Like Magic sessions: never `pkill` by pattern, never touch their
  windows or worktrees.
