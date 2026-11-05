<!-- DRAFT by ai-peer-controller-1, 2026-11-05. Not a hand-off yet: at the WP1 merge the live controller re-checks every cited line on the new head, has a read-only check for stale facts, sets {DATE}, saves it as HANDOFF-<date>-ai-peer-wp3-1.md and deletes this draft. -->

# Hand-off: ai-peer-wp3-1 (WP3 Google + S2 daily brief)

For: `ai-peer-wp3-1`, Claude Opus 5.5 (1M), max effort. Written {DATE} by `ai-peer-controller-2`,
which started it. Controller: `ai-peer-controller-2` (window 2048), unless STATE names a newer one;
reach it with SendMessage. Dated, never edited after it is written. The living state is
`docs/build/STATE.md` on `origin/main`.

## Manish's standing instruction (quoted from the brief)

> "this is a hackathon, so our main idea is to make it work, and not go off track in
> unimportant things like code quality, unit tests, et cetera ... we build something, we
> test it manually by running it in the browser or running through the terminal ...
> But other than that, we should try to follow all our ways of working."

Merge rule (D13): you merge your own PR as soon as the S2 walk passes. No review, CI or unit
tests.

## The job

On the merged WP1 foundation, add the `google` adapter (Gmail, Calendar, Drive/Docs) and make
**S2 daily brief and heads-ups** work end to end, in the Slack DM and on the web page.
`ai-peer-wp2-1` (setup, memory, local work) runs at the same time.

## Read first, in order (only these)

1. `AGENTS.md` (root).
2. `docs/build/STATE.md` on `origin/main`.
3. `docs/build/DESIGN.md`: §0, §2 to §5.
4. `docs/build/PRD.md`: "The world it runs in", F1 (its Docs and calendar step), S2.
5. `docs/build/PLAN.md`: "Rules for every package", WP3, "Manish's setup list" item 2.
6. `docs/build/RESEARCH-2026-11-04.md`: "Integrations", the Google and GitHub lines.
7. `peer/README.md`, then only the code you change.
8. For the brief page's look, only: `film/video/src/draft07/StoryScenes.tsx` (the morning
   brief cards), `film/video/src/draft05/PersonalBrief.tsx` (the brief page),
   `film/video/src/draft02/Shared.tsx` (colours).

## Working copy

- Worktree `~/repos/ai-peer-wp3`, branch `wp3-google-brief` from `origin/main` (the
  controller creates it). Python 3.12 venv at `~/repos/ai-peer-wp3/.venv` (gitignored), set up
  as `peer/README.md` says.
- Runtime data `~/.ai-peer/<owner>/`; secrets `~/.ai-peer/.env` (and the Google client file
  next to it) only, never in git, chat or Telegram; never echo a value.

## What to build

| Piece | Must do |
|---|---|
| Spike (first) | The Google premise on manish@learnlikemagic.com (D5): an **Internal** OAuth client (Desktop) in a Cloud project of the learnlikemagic.com Workspace, so tokens do not expire after 7 days and there is no unverified-app screen; one login; then read Gmail (`history.list`), Calendar (`syncToken`) and a Doc (Drive export as markdown). Also prove how the script makes mail and invites come from the colleagues: their addresses (ananya@, kabir@, lakshmi@, david@, rohan@learnlikemagic.com) are aliases of the **admin@learnlikemagic.com** mailbox (the colleagues' mailbox, kept apart from manish@, the Peer's inbox; STATE "Where we are"), so the script sends from admin@ as an alias (its own Google login, for the script only; check "send mail as"), and an emailed invite (.ics) from one. Results in STATE and `docs/build/evidence/wp3/`. If Internal OAuth fails, stop and ask through the controller. |
| `google` adapter | The four verbs (DESIGN §2) on polling; capabilities declared; `act` creates drafts and accepts invites only through the approval gate (D9: emails, invites and commitments always ask first). |
| Seeds | The scenario script seeds an overnight: mail waiting on Manish, invites, company announcements, from the colleagues; plus the real GitHub activity the Peer already reads (failing CI, PRs waiting on him). |
| S2 brief | Every morning (a time setting) and on "brief me" in his DM: a Slack DM and a web page. Sections: what happened while you were away (including what the Peer answered for you), email still waiting on you, events and opportunities that fit your interests, company news and changes that touch your work. Each item: why it matters and one action (open, draft a reply, accept the invite; sending or accepting asks first). |
| Heads-ups | An urgent item (a direct question, something breaking) comes at once, not in the brief. |
| Interests | Interests kept in memory and used to pick events and opportunities; the Google discovery step (Docs, calendar) added to WP2's discovery framework. |
| Look | The film's: paper `#f6f4ee`, ink `#152b31`, muted `#617272`, mint `#b7f4cf`, green `#167353`, lines `#d7dfd9`; cards `#fffef9` with border `#d7e2d7`, radius 20; Manrope. "Good morning, Manish." with short cards. The film's React code is a reference, not code to reuse. |

## Working beside WP2

- You own `peer/adapters/google.py`, the brief, its seeds and its page. WP2 owns `peer/web/`
  (layout and look), the discovery framework, roles and settings; you add the Google step and
  your page with small, additive changes to shared files (`peer/settings.py`,
  `peer/defaults.yaml`, `peer/__main__.py`, `peer/executor.py`, `peer/watcher.py`,
  `peer/web/app.py`). Whoever merges second merges `origin/main` into its branch (no rebase, no
  force-push), takes the other's layout, and re-runs its walk.
- For an interface question, message `ai-peer-wp2-1` directly (SendMessage) and mention it in
  your next report to the controller.
- WP2's interfaces (branch `wp2-setup-memory`, PR #2, from its 11:17 report on 5 Nov): the page
  frame is `peer/web/layout.py` (`page()`, and a `NAV` list your brief page appends to); discovery
  steps go in with `register_step(Step("docs", ...), replace="docs")` in `peer/memory/discovery.py`;
  every push to the owner goes through `peer/notify.py` `tell_owner()`, so the owner's mutes apply.
  Until PR #2 merges, build against them from its branch; once it merges, merge `origin/main` in.

## Manish's hands (through the controller, one ask at a time, exact steps)

- The Google Internal OAuth client: the controller wrote his steps in
  `docs/build/setup/google.md` (project `ai-peer` in the learnlikemagic.com organisation, the four
  APIs, audience Internal, a Desktop client; the file lands at `~/.ai-peer/google-client.json`).
  Check them against what your spike needs before he starts; then you run the one login.
- Anything the alias spike needs from him (for example "send mail as" in Gmail settings).

## Proof (D13)

The S2 walk: the script seeds an overnight of events; the brief carries each with a reason and
an action, in the DM and on the page; an urgent one arrives as a heads-up. Screenshots plus
activity-log excerpts in `docs/build/evidence/wp3/`. Then tell the controller S2 is ready for
Checkpoint 2 (with WP2's setup page).

## PR and merge

One PR `wp3: Google + S2 daily brief` into `main`, opened as a draft early: what works, the
walk evidence, what is not verified. Merge when the walk passes. Update STATE on `main` (fetch
first; your branch's copy is older): your package line, lessons, session log.

## Stop rules

- Measure context at every milestone from your transcript (the last usage record of
  `~/.claude/projects/<working-dir folder>/<session id>.jsonl`: input + cache-read +
  cache-creation, of 1M). At 45 to 50%: finish the step, push, write
  `docs/build/handoffs/HANDOFF-<date>-ai-peer-wp3-<n+1>.md`, update STATE, tell the controller,
  stop.
- Weekly usage (`claude -p "/usage" --output-format text`): this Mac's account also runs
  Learn Like Magic. At about 95%, finish the step, hand off, stop.

## Traps known before the first line

- **Manish's inbox and calendar are real** (Learn Like Magic business mail). The Peer reads
  them (that is the product), but no real mail or event text goes into git, chat, Telegram or
  evidence: evidence shows only seeded test items (label them, crop the rest). Ask through the
  controller before any page that may be recorded or shown on stage lists real mail.
- Seeded mail goes only from the colleague aliases (admin@) to manish@learnlikemagic.com;
  nothing is sent to anyone else, and the script labels and can remove what it seeded.
- **A real person is in the test Slack:** `preethi`. Never message, mention or DM her (STATE
  "Settled").
- No Airbnb-internal names in build files (AGENTS.md), even where the film's scenes use them.
- The Peer is read-only on LLM code and never touches LLM production.
- Brain runs already block Manish's global config (WP1 spikes): use WP1's `run_agent`.
- Your idle pings to Telegram are off: anything for Manish goes through the controller.
- Manish let the kickoff session, and the controller for the colleague setup only, drive his
  logged-in Chrome; any other use needs his word, asked through the controller. The Peer's own
  browser profile (`peer browser`, signed in to Slack as manish@ by WP1) is fine for screenshots.
- This Mac also runs Learn Like Magic sessions: never `pkill` by pattern, never touch their
  windows or worktrees.
