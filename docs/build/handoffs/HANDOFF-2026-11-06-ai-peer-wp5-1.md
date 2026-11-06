# Hand-off: ai-peer-wp5-1 (WP5 porting guide, port-check, demo script)

For: `ai-peer-wp5-1`, Claude Opus 5.5 (1M), max effort. Written 2026-11-06 20:09 UTC by
`ai-peer-controller-3`, which starts it. Controller: `ai-peer-controller-3` (window 2408), unless
STATE names a newer one; reach it with SendMessage. Dated, never edited after it is written. The
living state is `docs/build/STATE.md` on `origin/main`.

## Manish's words (quoted)

The goal (DESIGN D2): "your goal is to have the generic system fully ready and add instructions on
how the product needs to be updated with a real company with real integrations. then i move this
product to my airbnb laptop and do the airbnb specific integrations."

From the brief: "this is a hackathon, so our main idea is to make it work, and not go off track in
unimportant things like code quality, unit tests, et cetera".

Tonight, to the controller (6 Nov, 18:20 UTC): "going to sleep now. will check back in the
morning. please continue whatever work you can in the meantime". He is asleep until about 02:30
UTC; nothing in this brief needs him.

Merge rule (D13): you merge your own PR as soon as its walk passes. No review, CI or unit tests.

## The job

WP5's first part, alone tonight: the porting guide (`docs/porting-guide.md`), a finished
`port-check`, a porting walk that proves the guide works, and a first demo script. The two other
packages are open PRs: WP3 (Google + S2, draft PR #3, `ai-peer-wp3-2` waits for Manish's Google
client in his morning) and WP4 (meetings + S3, draft PR #5, dry walk passed; its live walk comes
after WP3's). Not tonight: the web page polish, the film opener cut, the 15 Nov rehearsals, the
extra (the upstream-break warning).

## Read first, in order (only these)

1. `AGENTS.md` (root): above all "Integrations only through the adapter contract (DESIGN §2): a
   company port must not need changes outside the adapters and settings."
2. `docs/build/STATE.md` on `origin/main`.
3. `docs/build/DESIGN.md`: §0, §1 to §6 (§6 is the porting section and its known company notes).
4. `docs/build/PRD.md`: "Porting deliverable", "Demo deliverable (D16)", the scenes S1 to S3.
5. `docs/build/PLAN.md`: "Rules for every package", WP5.
6. `peer/README.md`, `peer/adapters/` (the contract in `base.py`; `directory`, `slack`, `github`,
   `fake`), `peer/localwork.py`, `peer/portcheck.py`, `peer/settings.py`, `peer/defaults.yaml`,
   `peer/brain/runner.py`. The open packages' adapters, read from their branches without checking
   them out: `git show origin/wp3-google-brief:peer/adapters/google.py`,
   `git show origin/wp4-meeting:peer/adapters/<its meetings and voice files>` (list them with
   `git ls-tree -r --name-only origin/wp4-meeting peer/adapters`).
7. For the demo script only: `docs/build/evidence/wp1/s1-walks.md` (walks 4 and 5),
   `git show origin/wp3-google-brief:docs/build/evidence/wp3/walks.md`,
   `git show origin/wp4-meeting:docs/build/evidence/wp4/` files.

## Working copy

- Worktree `~/repos/ai-peer-wp5`, branch `wp5-porting` from `origin/main` at the time of your
  start, created by the controller, upstream unset (push with `git push -u origin wp5-porting`).
  Python 3.12 venv at `~/repos/ai-peer-wp5/.venv` (gitignored), set up as `peer/README.md` says.
- Runtime data `~/.ai-peer/<owner>/`; secrets in `~/.ai-peer/.env` only. The guide names keys,
  never values; never echo a value.

## What to build

| Piece | Must do |
|---|---|
| Porting guide | `docs/porting-guide.md`, for an AI coding agent on a company machine that has never seen this repo (DESIGN §6). What the Peer is (one paragraph); the shape (§1); the adapter contract (§2: the four verbs, the event, the person map, capabilities, `dry_run`, `NotOffered`, the health check `check()` in `peer/adapters/base.py`); settings and secrets (`peer/defaults.yaml`, `~/.ai-peer/<owner>/settings.yaml`, `peer set`, `~/.ai-peer/.env`, `AI_PEER_HOME` and `AI_PEER_OWNER`); the brain (`run_agent` and its backends; a company harness such as AirChat becomes one more backend, §6); memory (§4); local work, which is the D11 plug-in (session-end hooks and the folder scan in `peer/localwork.py`), not an adapter; the trust rules (§5). **Each hard block in code**, by its key and file, with how it is lifted, only on the owner's own words: the real-person block (`slack.engage_only_world`, on in code, whose allow-list is the invented colleagues in `peer/scenarios/world.yaml`, plus `slack.never_engage`), `google.act_on_real_items` and `google.show_real_items`, `meetings.join_real_meetings`, the voice block. A port keeps every block on through `port-check` and its first trials. Each adapter as a worked example: on main `directory`, `slack`, `github`, `fake`; `google` from PR #3, `meetings` and `voice` (text to speech) from PR #5, each marked "on PR #3 / #5 until it merges". **What a port also edits today**, honestly: the runtime picks some adapters itself and calls chat methods outside the four verbs (`_slack()` in `peer/__main__.py`; `lookup_email`, `listen` and `conversations_join` in `peer/watcher.py`; `peer/presence.py`; Slack Block Kit payloads in `peer/executor.py`; GitHub built directly in `peer/jobs.py`, `peer/fresh.py` and `peer/memory/discovery.py`; the brain backends in `peer/brain/runner.py`). List each spot; changing that code is a later step, after PRs #3 and #5 merge, so note the gap in STATE "Next". A checklist per system (chat, mail, calendar, docs, code host, meetings, voice, people directory, local work, brain harness): what to replace, what stays, what to ask the company's admins; the known company notes in §6, and only those. A last section, "Moving to another laptop": what to copy (the repo); what stays behind (every token and key); and what to re-create that is not a secret but lives in `~/.ai-peer/`: the pinned Claude binary (`brain.claude_bin`, `~/.ai-peer/bin/claude-2.1.318`; the runner falls back without a word to whatever `claude` is installed), `brain.codex_home`, the session-end hook script (`~/.ai-peer/bin/session-end`), the Google client file (PR #3); then the set-up steps from scratch. |
| `port-check` | Finish the stub `peer/portcheck.py`. Nothing in settings lists the adapters today (the stub hard-codes them), so build that list: an `adapters:` block near the top of `peer/defaults.yaml`, right after `owner:` (WP3 and WP4 add their own blocks lower down), each entry naming an adapter's module and class, with `google`, `meetings` and `voice` listed already and shown as "not on main yet" until their PRs merge, so that after the merges only docs change. `port-check` checks every listed adapter: its capabilities, its `check()`, each of the four verbs (`act` in dry run) with ok, n/a, blocked or FAIL and the time each took; a clear table; a non-zero exit on any FAIL; `--adapter <name>` to check one. `NotOffered` from a verb counts as n/a. Each adapter supplies its own dry-run sample for `act` (not one shared fake payload, and not the first item of a set, which changes from run to run), and a refusal by a hard block counts as "blocked (ok)". Before it calls an adapter's `act`, read that adapter's code and make sure `dry_run` really sends nothing. Slack's `sense` polls channel history through the Web API (read-only); never open a Socket Mode connection (it would split the live Peer's events). Local work is not in the table: wrapping it would run `ingest_spool` (which deletes the shared spool files) or the scan (which writes memory). |
| Porting walk (the proof) | A fresh sub-agent of yours adds a toy adapter for an invented company system ("teamchat", which reads and writes one local JSON file) and gets it into `port-check` with all four verbs passing, from the guide alone. **Its folder:** a plain export of your committed branch (`git archive` of `peer/`, `requirements.txt` and `docs/porting-guide.md`, nothing else: no `.git`, no `docs/build/`, no `film/`, no `AGENTS.md`) into a scratch folder outside `~/repos` (the live Peer's hourly scan reads `~/repos`). **Its fixed preamble**, word for word in its prompt: every command starts with `cd <export path> && AI_PEER_HOME=<export path>/home AI_PEER_OWNER=wp5toy ~/repos/ai-peer-wp5/.venv/bin/python -m peer ...` (its shell goes back to your folder on every call; with that `AI_PEER_HOME` it has no secrets, so nothing reaches a real system); the only `peer` command it runs is `port-check --adapter teamchat`; it writes only inside the export; no git, no Telegram, no messages to other sessions; it never opens `~/.ai-peer/` or `~/repos`. Pass: it changed nothing outside the adapters and settings (AGENTS.md), and `port-check` lists teamchat with every verb ok. Count anything it had to look up outside the guide as a gap in the guide. Afterwards check that `git status` in `~/repos/ai-peer-wp5` is clean, read its diff, fix the guide where it was unclear or wrong, record the result in `docs/build/evidence/wp5/porting-walk.md`, and delete the export: the toy adapter never merges. |
| Demo script | `demo/script.md`: the live demo of S1 to S3 (D16): the order, timings, the exact commands and DM lines, what the audience sees, the fallback recording per scene (`demo/recordings/`, made at the 15 Nov rehearsal), and the slot for the film opener. S1 is final (Checkpoint 1's recorded walks); S2 and S3 come from their dry walks and are marked "until its live walk". |

## The live Peer and the owner's data

- **There is one live Peer** (owner `manish`), run from `~/repos/ai-peer-wp2`; only the controller
  decides who runs it, and you never need it. Never run `peer start`, `peer stop`, `peer watch`,
  a live `peer scenario` or `peer browser`. Also never, with any owner: `peer sample-heads-up`
  (a real DM: `test-small.json` carries Manish's real Slack address), `peer world ...` (it
  creates, invites, joins and sets profiles in the real Slack), `peer local install` (it
  overwrites the shared hook script `~/.ai-peer/bin/session-end` that his Claude Code and Codex
  run), and `peer discover` without the prefix (it re-points the live Peer's brain skill links).
- **A test owner fences only `~/.ai-peer/<owner>/`.** Slack, GitHub and every other account are the
  real ones whatever the owner: read-only calls and dry runs only.
- **Commands that read settings run on a test owner:** `AI_PEER_OWNER=wp5test .venv/bin/python -m
  peer <cmd>`, in the same command every time (an `export` does not survive between shell
  calls). Without it a command acts on `manish`, whose `settings.yaml` the live Peer re-reads at
  once. Set it up first, each line with the prefix: `peer set owner.profile
  peer/world/profiles/test-small.json`, `peer set brain.summary_effort high`; never run a
  discovery at max (one once cost about 15 weekly-usage points). The sub-agent's toy walk uses
  its own test owner too.

## Proof (D13)

`port-check` prints its table for every listed adapter, all verbs ok, n/a or blocked, no FAIL; the
porting walk passes; the guide reads clearly to a stranger. Evidence in `docs/build/evidence/wp5/`:
the `port-check` table, the walk's result and the guide fixes it led to.

## PR and merge

One PR `wp5: porting guide, port-check, demo script` into `main`, opened as a draft early: what
works, the evidence, what is not verified. Merge it with a merge commit when the walk passes. If
`main` moved, merge `origin/main` in first (no rebase, no force-push). After PRs #3 and #5 merge,
the guide's `google` and `meetings` sections and the demo script get a docs-only update straight
to `main` (a later session; note it in STATE "Next"). Update STATE on `main` from a throwaway
worktree (`git fetch origin`, `git worktree add --detach <scratch dir> origin/main`, edit,
commit, `git push origin HEAD:main`, `git worktree remove <scratch dir>`), never from the
controller's checkout: your session row, lessons, session log.

## Stop rules

- Measure context at every milestone from your transcript (the last usage record of
  `~/.claude/projects/<working-dir folder>/<session id>.jsonl`: input + cache-read +
  cache-creation, of 1M). At 45 to 50%: finish the step, push, write
  `docs/build/handoffs/HANDOFF-<date>-ai-peer-wp5-<n+1>.md`, update STATE, tell the controller,
  stop.
- Weekly usage (`claude -p "/usage" --output-format text`): the account also runs Learn Like
  Magic, and it read 41% at 19:52 UTC on 6 Nov (reset 11 Nov 07:00 UTC). **Tonight, at 60%:**
  finish the step, push, hand off, stop (the controller's pacing, so tomorrow's live walks of S2
  and S3 have room). At about 95%, always.

## Traps known before the first line

- **No company-internal details in build files** (AGENTS.md). The guide uses only DESIGN §6's
  company notes; `film/` holds some company details: never copy from it.
- `port-check` and the walk never write to a real system: every `act` in dry run, checked in
  the adapter's code first; no Slack Socket Mode; no posts, mail, invites or bots.
- PRs #3 and #5 are still open and their files may change: read them with `git show
  origin/<branch>:<path>` at the time, and do not copy their code into your branch.
- Shared files (`peer/__main__.py` for the `port-check` command, `peer/adapters/base.py`,
  `peer/settings.py`, `peer/defaults.yaml`): small, additive changes; WP3 and WP4 edit some of
  them too.
- **A real person is in the test Slack:** `preethi`. Never message, mention or DM her.
- The Peer is read-only on LLM code and never touches LLM production; the toy walk never reads
  or writes outside its throwaway worktree and test owner folder.
- Your idle pings to Telegram are off: anything for Manish goes through the controller.
- Manish's logged-in Chrome is off limits without his word.
- This Mac also runs Learn Like Magic sessions: never `pkill` by pattern, stop only PIDs you
  started, never touch their windows or worktrees.
