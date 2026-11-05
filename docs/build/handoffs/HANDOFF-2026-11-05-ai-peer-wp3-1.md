# Hand-off: ai-peer-wp3-1 (WP3 Google + S2 daily brief)

For: `ai-peer-wp3-1`, Claude Opus 5.5 (1M), max effort. Written 2026-11-05 16:20 UTC by `ai-peer-controller-2`,
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

On `main` (WP1 and WP2 are merged: PRs #1 and #2), add the `google` adapter (Gmail, Calendar,
Drive/Docs) and make **S2 daily brief and heads-ups** work end to end, in the Slack DM and on
the web page. The other live worker is `ai-peer-wp1-2`: it only waits to record WP1's S1 walks
once Manish signs the Peer's browser in to Slack.

## Read first, in order (only these)

1. `AGENTS.md` (root).
2. `docs/build/STATE.md` on `origin/main`.
3. `docs/build/DESIGN.md`: §0, §2 to §5.
4. `docs/build/PRD.md`: "The world it runs in", F1 (its Docs and calendar step), S2.
5. `docs/build/PLAN.md`: "Rules for every package", WP3.
   `docs/build/setup/google.md`: Manish's steps for the OAuth client (already written).
6. `docs/build/RESEARCH-2026-11-04.md`: "Integrations", the Google and GitHub lines.
7. `peer/README.md`, then only the code you change.
8. For the brief page's look, only: `film/video/src/draft07/StoryScenes.tsx` (the morning
   brief cards), `film/video/src/draft05/PersonalBrief.tsx` (the brief page),
   `film/video/src/draft02/Shared.tsx` (colours).

## Working copy

- Worktree `~/repos/ai-peer-wp3`, branch `wp3-google-brief` from `origin/main` at the time of
  your start, created by the controller, upstream unset (push with
  `git push -u origin wp3-google-brief`). Python 3.12 venv at `~/repos/ai-peer-wp3/.venv` (gitignored), set up
  as `peer/README.md` says.
- Runtime data `~/.ai-peer/<owner>/`; secrets `~/.ai-peer/.env` (and the Google client file
  next to it) only, never in git, chat or Telegram; never echo a value.

## What to build

| Piece | Must do |
|---|---|
| Spike (first) | The Google premise on manish@learnlikemagic.com (D5): an **Internal** OAuth client (Desktop) in a Cloud project of the learnlikemagic.com Workspace, so tokens do not expire after 7 days and there is no unverified-app screen. Manish makes it from `docs/build/setup/google.md` (file `~/.ai-peer/google-client.json`); first check those steps fit your spike and tell the controller any change. Then one login as manish@ in a browser window on the Mac (he clicks Allow; ask through the controller); then read Gmail (`history.list`), Calendar (`syncToken`) and a Doc (Drive export as markdown). Two logins on the same client, with `login_hint`, and after each a check of the account (Gmail `getProfile`): **manish@** for the Peer with `gmail.readonly`, `gmail.compose`, `calendar.events`, `drive.readonly`; **admin@** for the seed script with `gmail.send` only, and the script checks every recipient is manish@. Never full-mail or admin scopes. Tokens in `~/.ai-peer/google-token-<account>.json` (chmod 600), never in a repo or an owner folder; add `*token*.json` and `client_secret*.json` to `.gitignore`. The spike prints counts and ids only, never subjects or text. Also prove how the script makes mail and invites come from the colleagues: their addresses (ananya@, kabir@, lakshmi@, david@, rohan@learnlikemagic.com) are aliases of the **admin@learnlikemagic.com** mailbox (the colleagues' mailbox, kept apart from manish@, the Peer's inbox; STATE "Where we are"), so the script sends from admin@ as an alias (its own Google login, for the script only; check "send mail as"), and an emailed invite (.ics) from one. Results in STATE and `docs/build/evidence/wp3/`. If Internal OAuth fails, stop and ask through the controller. |
| `google` adapter | The four verbs (DESIGN §2) on polling; capabilities declared; `act` creates drafts and accepts invites only through the approval gate (D9: emails, invites and commitments always ask first). **Hard block in code** (like preethi's): until Manish lifts it (a setting, default off), `act` runs only on seeded items (a marker the seed script sets), never on his real mail or invites. A scripted click (`peer/browser.py` `click_latest()` presses the newest button with that label in his DM) counts as his tap, so this block is what keeps a test from sending real mail. |
| Seeds | The scenario script seeds an overnight: mail waiting on Manish, invites, company announcements, from the colleagues; plus the real GitHub activity the Peer already reads (failing CI, PRs waiting on him). |
| S2 brief | Every morning (a time setting) and on "brief me" in his DM: a Slack DM and a web page. Sections: what happened while you were away (including what the Peer answered for you), email still waiting on you, events and opportunities that fit your interests, company news and changes that touch your work. Each item: why it matters and one action (open, draft a reply, accept the invite; sending or accepting asks first). |
| Heads-ups | An urgent item (a direct question, something breaking) comes at once, not in the brief. |
| Interests | Interests kept in memory and used to pick events and opportunities; the Google discovery step (Docs, calendar) added to WP2's discovery framework. |
| Look | The film's: paper `#f6f4ee`, ink `#152b31`, muted `#617272`, mint `#b7f4cf`, green `#167353`, lines `#d7dfd9`; cards `#fffef9` with border `#d7e2d7`, radius 20; Manrope. "Good morning, Manish." with short cards. The film's React code is a reference, not code to reuse. |

## Building on WP2

- WP2 is merged. Use its interfaces: the page frame `peer/web/layout.py` (`page()`, and the
  `NAV` list your brief page appends to); discovery steps via
  `register_step(Step("docs", ...), replace="docs")` in `peer/memory/discovery.py` (and the same
  for "calendar"); every push to the owner through `peer/notify.py` `tell_owner()`, so the
  owner's mutes apply. WP2's notes: `docs/build/evidence/wp2/walks.md`.
- Shared files (`peer/settings.py`, `peer/defaults.yaml`, `peer/__main__.py`,
  `peer/executor.py`, `peer/watcher.py`, `peer/web/app.py`): small, additive changes. If `main`
  moves, merge `origin/main` into your branch (no rebase, no force-push) and re-run your walk.

## The live Peer and the owner's data

- **There is one live Peer** (owner `manish`), and only the controller decides who runs it.
  Today it runs from `~/repos/ai-peer-wp2` (pid in `~/.ai-peer/manish/watch.pid`), and the
  controller may hand it to `ai-peer-wp1-2` for its recordings. Never run `peer start`,
  `peer stop`, `peer watch`, a live `peer scenario` or `peer browser` until the controller says
  the Peer is yours, and never open a second Slack Socket Mode connection with the app (it
  splits Slack's events). When your live S2 walk is ready, ask the controller.
- **Build and dry-run on a test owner:** `AI_PEER_OWNER=<test id> .venv/bin/python -m peer <cmd>`,
  in the same command every time (an `export` does not survive between shell calls). Without it a
  command acts on `manish`: the live Peer re-reads `~/.ai-peer/manish/settings.yaml` at once, and
  memory set-up re-points its brain skill links at your worktree (`install_skill` in
  `peer/memory/layout.py`). Your page: `... peer web --port 8789` (8787 is the live Peer's).
  The test owner may read manish@'s real Google data (that is the product), but it writes only
  to its own folder.
- **No Slack posts from a test owner:** dry runs use the fake Slack. The live Peer answers in the
  four test channels and `ai-peer-wp1-2`'s recorder clicks the newest "Send" in Manish's DM, so
  live S2 walks run on the live Peer itself (owner `manish`) in the slot the controller gives.
  Label your buttons other than "Send" (for example "Draft reply", "Accept"). No
  `join_public_channels()` (it joins #general, where the real member preethi is).
- The test owner: the small profile `peer/world/profiles/test-small.json` (as WP2 did), and
  `... peer set web.port 8789` for it (else its DM links open the live page).
- DM screenshots need the Peer's own browser profile, which is not signed in to Slack yet and
  belongs to the live Peer: plan the DM evidence through the controller.

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
walk evidence, what is not verified. Merge it with a merge commit when the walk passes. Update
STATE on `main` from a throwaway worktree (`git fetch origin`, `git worktree add --detach <scratch dir> origin/main`,
edit, commit, `git push origin HEAD:main`, `git worktree remove <scratch dir>`), never from the
controller's checkout: your session row, lessons, session log.

## Stop rules

- Measure context at every milestone from your transcript (the last usage record of
  `~/.claude/projects/<working-dir folder>/<session id>.jsonl`: input + cache-read +
  cache-creation, of 1M). At 45 to 50%: finish the step, push, write
  `docs/build/handoffs/HANDOFF-<date>-ai-peer-wp3-<n+1>.md`, update STATE, tell the controller,
  stop.
- Weekly usage (`claude -p "/usage" --output-format text`): this Mac's account also runs
  Learn Like Magic. At about 95%, finish the step, hand off, stop.

## Traps known before the first line

- **Manish's inbox, calendar and Docs are real** (Learn Like Magic business). The Peer reads
  them (that is the product), but no real mail, event or Doc title or text goes into git, chat,
  Telegram, evidence, screenshots or recordings, including the setup page's discovery lines and
  `setup.json`: evidence and the Checkpoint 2 recording use a seeded-only view; delete uncropped
  originals. Ask through the controller before any page that may be recorded or shown on stage
  lists real items.
- **Neither you nor your script writes to the LLM repos:** no pushes, PRs, reviews, comments or
  CI re-runs (`GITHUB_TOKEN` has full repo scope). Seed GitHub items with labelled samples
  (`peer sample-heads-up`).
- In the watcher's DM handler (`peer/watcher.py`) any unmatched text falls through to WP2's
  tuning (F5), so match "brief me" before it. `tell_owner()` checks only `roles.watch_my_work`:
  S2 also needs `roles.daily_brief` (and `roles.find_opportunities` for events).
- RESEARCH's Google line predates D5 (an External app with 7-day tokens); D5's Internal client
  wins.
- Seeded mail goes only from the colleague aliases (admin@) to manish@learnlikemagic.com;
  nothing is sent to anyone else, and the script labels and can remove what it seeded.
- **A real person is in the test Slack:** `preethi`. Never message, mention or DM her (STATE
  "Settled").
- No Airbnb-internal names in build files (AGENTS.md): copy no names, repos, teams or projects
  from the film's screens.
- The Peer is read-only on LLM code and never touches LLM production.
- Brain runs already block Manish's global config (WP1 spikes): use WP1's `run_agent`.
- **Usage:** the account's weekly usage was 64% at 16:16 UTC on 5 Nov (reset 9 Nov 23:00 UTC),
  and WP2's 35-minute build used about 4 points. Brain runs at effort high (max took 113 to 139 s
  per answer); summaries at `brain.summary_effort` high on a test owner; no AI per event where
  plain code will do. At about 93% start nothing that cannot finish cleanly.
- Your idle pings to Telegram are off: anything for Manish goes through the controller.
- Manish let the kickoff session, and the controller for the colleague setup only, drive his
  logged-in Chrome; any other use needs his word, asked through the controller. The Peer's own
  browser profile is the live Peer's (above); for page screenshots use a throwaway headless
  browser context of your own. Never script past a robot check ("I'm not a robot"): a person
  does it.
- This Mac also runs Learn Like Magic sessions: never `pkill` by pattern, never touch their
  windows or worktrees.
