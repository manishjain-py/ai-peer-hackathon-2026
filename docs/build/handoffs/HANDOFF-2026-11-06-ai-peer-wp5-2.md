# Hand-off: ai-peer-wp5-2 (WP5 part 2: the adapter contract everywhere, the porting guide finished)

For: `ai-peer-wp5-2`, Claude Opus 5.5 (1M), max effort. Written 2026-11-06 22:35 UTC by `ai-peer-controller-4`
from a read-only map of the code at 37cb0c4 (PR #3's head, which holds main with PR #5), each new finding checked
by the controller in the code, then reviewed read-only. The controller starts it once PR #3 has merged into
`main`; its kickoff names the base commit and repeats any ruling of Manish's made since. Controller:
`ai-peer-controller-4` (window 2608) unless STATE on `origin/main` names a newer one; reach it with SendMessage.
Dated, never edited after it is written. The living state is `docs/build/STATE.md` on `origin/main`.

## Manish's words (quoted)

The goal (DESIGN D2, 4 Nov): "your goal is to have the generic system fully ready and add instructions on how the
product needs to be updated with a real company with real integrations. then i move this product to my airbnb
laptop and do the airbnb specific integrations. makes sense?"

From the brief (`docs/build/BRIEF-2026-11-04.md`): "this is a hackathon, so our main idea is to make it work, and
not go off track in unimportant things like code quality, unit tests, et cetera".

The rule this package makes true (AGENTS.md, hard rules): "Integrations only through the adapter contract
(DESIGN §2): a company port must not need changes outside the adapters and settings." DESIGN §6: company data
goes only through the company's harness and auth, never a personal subscription.

Merge rule (DESIGN D13, his answer "Controller + up to 2 workers (Recommended)"): "Done = the scene seen working
in a manual walk. Workers merge their own PR when the walk passes." No review, CI or unit tests.

Nothing here needs Manish; anything for him goes through the controller.

## The job

Make every runtime pick of a system, and every call to one, go through the adapter contract and settings; stop
company data from ever falling back to a personal Claude login; finish the porting guide. Proven by port-check,
the dry walks of S1 to S3, a stranger's porting walk and a hand-over rehearsal on a clean clone. Not this
package: the demo script, web page polish, live-answer speed, recordings, the film opener, the extra (a later
demo package does those; it may run at the same time).

## Read first, in order (only these)

1. `AGENTS.md`.
2. `docs/build/STATE.md` on `origin/main`: "Where we are" (top entries), "Next" 3b and 3c (3c: the demo
   package that may run beside you), "Lessons".
3. `docs/porting-guide.md`, in full: your main product. §3 "A chat adapter for this runtime" and "What a port
   also edits today" are the map of the code work.
4. `docs/build/DESIGN.md` §2 and §6; `docs/build/PRD.md` "Porting deliverable".
5. `peer/adapters/base.py`, `peer/portcheck.py`, `peer/defaults.yaml`, `peer/settings.py`,
   `peer/brain/runner.py`; then each spot below as you reach it.
6. `docs/build/evidence/wp5/porting-walk.md` (the stranger-walk recipe and its 11 gaps) and `port-check.md`.

## Working copy

- Worktree `~/repos/ai-peer-wp5b`, branch `wp5-contract`, from `origin/main` at PR #3's merge commit (the kickoff
  names it), made by the controller with no upstream:
  `git -C ~/repos/ai-peer-hackathon-2026 fetch origin && git -C ~/repos/ai-peer-hackathon-2026 worktree add --no-track -b wp5-contract ~/repos/ai-peer-wp5b origin/main`.
  Push with `git push -u origin wp5-contract`.
- Venv (gitignored): `cd ~/repos/ai-peer-wp5b && uv venv --python 3.12 .venv && uv pip install --python .venv/bin/python -r requirements.txt`.
- Test owner `wp5btest`, every command with the prefix `AI_PEER_OWNER=wp5btest .venv/bin/python -m peer`:
  `set owner.profile peer/world/profiles/test-small.json`, `set brain.summary_effort high` (a discovery at max
  once cost about 15 weekly points), `set web.port 8791`, `set meetings.listener_port 8796`; then
  `discover --no-ai`. An owner's `settings.yaml` is a full copy of the defaults made by its first command: new
  default keys reach it, changed ones never do (STATE lesson). After you change `peer/defaults.yaml`, use a
  fresh test owner for the final checks.
- Secrets only in `~/.ai-peer/.env`: name keys, never print a value. The Google tokens are
  `~/.ai-peer/google-token-<account>.json` (outside any owner folder): never print or copy them.

## What to build

Behaviour must not change, except items 5 and 7(b): move code behind the contract, do not rewrite it. Line
numbers are from 37cb0c4; re-find each on your base.

1. **The after-the-merges docs pass, first, straight to `main`** (docs only, from a throwaway worktree, so the
   guide is right even if the code step stalls). In `docs/porting-guide.md`, every "until it merges", "not on
   main yet", "(PR #3)" and "(PR #5)" (about lines 254-271, 296-298, 337, 347, 399-402, 418-420, 426-440,
   454-459, 483, 498) and §4's "result on this build's own adapters". §6's isolation paragraph (about line 320)
   gains `CLAUDE_CODE_DISABLE_CLAUDE_MDS=1`: `peer/brain/runner.py` and `peer/brain/warm.py` set it since
   51e260c, because `--setting-sources project` stopped keeping out the owner's `~/.claude/CLAUDE.md`. Add
   "re-run the canary after any change, even on a pinned binary" (method: `docs/build/evidence/wp4/s3-walks.md`,
   "Finding"). A new table in `docs/build/evidence/wp5/port-check.md`. Drop the `pending: "PR #5"` lines and
   their comments in `peer/defaults.yaml` (about lines 11 and 23-32) in your PR, not in this docs commit.
   Done when: `port-check` on the test owner shows directory, slack, github, fake, google, meetings and voice
   each ok, n/a or blocked (ok), exit 0. Google needs the Peer's Google login (WP3's, done in Manish's morning);
   its dry-run act reads the newest inbox mail and shows blocked (ok) unless that mail is a seeded test item.
   Then `git merge origin/main` into `wp5-contract` before you edit the guide there.

2. **One registry for every system the runtime uses.** A new module (for example `peer/adapters/registry.py`)
   and a map in `peer/defaults.yaml` from role to an `adapters:` key (chat, code, mail, calendar, docs,
   meetings, voice, directory; name it yourself). It builds each adapter with `from_settings(st)`, once per
   process (SlackAdapter's constructor calls Slack's `auth.test`). `MeetingsAdapter` and `VoiceAdapter` get
   `from_settings`. A role whose login is missing stays "not connected" as today (for example
   `brief.get_google` returns None). Call sites:
   - `peer/__main__.py`: `_slack()` at 37-40 (watch, status, sample-heads-up, brief --post, meeting draft and
     run), plus 356 and 364
   - `peer/watcher.py:42`
   - `peer/fresh.py`: 116, 140, 157, 194
   - `peer/jobs.py:103`
   - `peer/memory/discovery.py`: 159, 237, 447-451
   - `peer/memory/google_steps.py:23-26`
   - `peer/brief.py`: 84-92 (keep the dry-run fake override) and 311
   - `peer/web/brief_page.py:179-180`
   - `peer/meetings/cover.py`: 85, 157
   - `peer/meetings/live.py`: 51-52
   Test tooling may keep its direct builds (`peer/scenarios/`, `peer/meetings/walk.py`, `peer/seeds.py`,
   `peer/google_spike.py`, the `peer google` and `peer world` commands, the fakes for dry runs); the guide says
   so. Done when: a `git grep -n -E` for `SlackAdapter\(`, `GitHubAdapter\(`, `GoogleAdapter\(`,
   `MeetingsAdapter\(`, `VoiceAdapter\(` and `DirectoryAdapter\(` over `peer` outside `peer/adapters` lists
   only test tooling, and `git grep -n -E 'MeetingsAdapter\.|VoiceAdapter\.|GoogleAdapter\.|from \.+adapters\.(slack|github|google|meetings|voice|directory) import'`
   over `peer` outside `peer/adapters` lists only test tooling, the registry and the exception classes
   (`MeetingRefused`, `Blocked`).

3. **Role methods for the calls the runtime makes besides the four verbs**, declared in `peer/adapters/base.py`
   with the shapes the runtime reads back.
   - Chat: `lookup_email`, `user_info`, `get_presence`, `get_status`, `listen`, `permalink` (the guide's §3 chat
     subsection), plus what is raw Slack today: joining the trial's channels (`peer/watcher.py:319-330`); the
     owner's channels with members for discovery (`peer/memory/discovery.py:469-484`); whether an event is a DM
     (`peer/watcher.py:307` tests Slack's `D` prefix); which ids an event mentions, and its plain text (`<@…>`
     markup at `peer/watcher.py:141, 246, 275, 291`). The fake (`peer/adapters/fake.py`) answers the same.
     `SlackAdapter.join_public_channels()` (`peer/adapters/slack.py:278`, unused) joins every public channel:
     replace it with one that joins only named channels.
   - Code host: `repo`, `list_dir`, `file_text`, `last_commit`, `pulls`, `runs`, `blob_url`
     (`peer/adapters/github.py:85-121`) and the commits-of-a-path call `peer/fresh.py:141` makes raw, each with
     the GitHub fields the runtime reads (a pull's `head.ref` in `jobs.py`; a run's `name`, `status`,
     `conclusion` in `brief.py`).
   - The card and text format stays Slack's: write down, as part of the chat role, the exact subset the runtime
     builds: Block Kit section, context, divider, actions, section accessory buttons (some with a `url`), button
     `style` (`peer/brief.py:480`, `peer/executor.py:135`) and the input modal, plus mrkdwn and Slack's click payload, built in `peer/executor.py`, `peer/meetings/cover.py`,
     `peer/meetings/calendar.py`, `peer/notify.py` and `peer/brief.py`. PR #3 also sends `post_reply` with
     `blocks`. A chat adapter for another system translates it. Do not move card building.
   - Mail, calendar and docs (google today), meetings and voice: declare in `base.py` the methods the runtime
     calls besides the four verbs, with their shapes: google `guard`, `recent_docs`, `upcoming`, and a doc-text
     method that replaces the raw Drive export at `peer/memory/google_steps.py:47`; meetings `allowed`, `label`
     (a classmethod, called at `peer/meetings/cover.py:81` and `peer/meetings/calendar.py:133`), `bot`,
     `wait_status`, `transcript_lines`, `media`, `download`; voice `render` and the clip length. The helpers
     `connected`, `ledger` and `owner_email` (`peer/brief.py:33`) go behind the mail role.
   - The watcher tells the fake from Slack with `hasattr` checks on `inject`, `lookup_email`, `users` and `bot`
     (`peer/watcher.py:61-79, 322`). Methods declared on the base class make those true for every adapter, so
     replace the checks with role calls the fake answers (ids as `peer/scenarios/player.py:58-63` sets them).
   Done when: `port-check` checks the role methods of the adapter in each role (calls the read-only ones; for
   chat, dry-runs the acts the runtime sends with its real payload shapes). **port-check never calls `listen`
   (a second Socket Mode connection splits the live Peer's events) or the join method (a real Slack write); it
   only checks that they exist and can be called.** Role checks use the owner's own id and print ok, FAIL and
   counts only: never a name, email, status text, channel member or message (the evidence goes into git, and
   `preethi` is a real person). No test calls the join method on real Slack; prove it on the fake. A read-only
   `sense` on real Slack history (Web API, as port-check does) shows the new event fields set right (print kinds
   and keys only, never text). The S1 dry walks pass.

4. **Settings instead of code edits:** `github.api_base` and `github.web_base` (the API at
   `peer/adapters/github.py:20`; web links at `peer/adapters/github.py:120`, `peer/fresh.py:89, 96` and
   `peer/memory/discovery.py:254, 386`, built through the code role; GitHub Enterprise needs its own); the trial's
   people and channels file (`load_world()` hard-codes
   `peer/scenarios/world.yaml` at `peer/memory/discovery.py:49-50`, and the guide's hard-block table tells a
   port to edit that file); a brain backend added by settings (a `module:function` beside `BACKENDS` at
   `peer/brain/runner.py:198`), so a company harness needs no edit to `runner.py`; the settings page then
   accepts any registered backend (`peer/web/app.py:380` accepts only claude and codex). Done when: the
   defaults keep today's port-check and dry-walk results; a stub backend named in settings runs one
   `run_agent` on a test owner, and the settings page accepts it.

5. **Company data never reaches a personal login (DESIGN §6).** Checked by the controller at 37cb0c4:
   - `peer/brain/runner.py` (about line 212) falls back from any backend that is not claude to claude
     (`other = "codex" if primary == "claude" else "claude"`), and `brain.fallback` is on by default
     (`peer/defaults.yaml`, about line 59). Fall back only between claude and codex; a settings-added backend
     never falls back. The guide says: at a company, set `brain.fallback: false`.
   - `peer/meetings/live.py` (about line 243) always starts the Claude warm session (`peer/brain/warm.py`)
     whatever `brain.backend` says; the guide's §6 and warm.py's docstring claim fresh runs for other backends,
     but no such code exists. Use the warm session only when the backend is claude; otherwise answer each line
     with a fresh `run_agent` run of the `answer_live` playbook (a small schema for SAY, CERTAINTY, AS_OF, FLAG,
     SOURCES).
   Done when: (a) a stub backend added through item 4's setting (a module in a scratch folder on `PYTHONPATH`,
   outside the repo) that returns ok false makes `run_agent` record one failed stub run and no fallback; (b)
   with `brain.backend codex` and `brain.fallback false` on the test owner, an S3 dry walk answers through fresh
   runs, and the owner's `brain-runs.jsonl` shows no claude run and no `warm:` run. The fresh path uses a new
   playbook section (for example `### answer_live_once`, returning SAY, CERTAINTY, AS_OF, FLAG and SOURCES
   through a schema appended to `peer/brain/schemas.py`, with the fact pack in the prompt) and a run timeout
   under the 45 s the answer thread waits (`peer/meetings/live.py:197-201` waits 50 s; `run_agent` defaults to
   240 s). Never edit `### answer_live` (the demo package owns it). Codex is usable when the runner does not
   refuse it (`_codex_auth_ok`; the Peer's copied login is accepted until 8 Nov 02:25 UTC, and Manish renews it
   in his morning of 7 Nov: STATE "Needs Manish" item 4); never open `auth.json`. If codex is refused, run (b)
   on the stub and say so.

6. **The guide rewritten for the new contract.** The registry and roles (§2, §3), the role methods and the card
   format (§3's chat subsection), the new settings (§5), the backend and fallback rules (§6), port-check's role
   checks (§4). "What a port also edits today" reduced to what is left (the card format for a non-Slack chat;
   the walk tooling; anything item 3 did not cover, by file and line); it misses today `peer/brief.py:311`, `peer/web/brief_page.py:180`, the Directory builds
   (`peer/watcher.py:42`, `peer/fresh.py:194`, `peer/memory/discovery.py:159`), `load_world`'s fixed file,
   `peer/fresh.py:141`, `cmd_brief`'s `_slack()` plus `lookup_email` (`peer/__main__.py:321`) and
   `peer/web/app.py:380`. §13 fixed from proof 4. Only DESIGN §6's company notes. Send the controller one line
   for DESIGN §2 on the roles; it records it.

7. **Optional, if context allows:** (a) meetings and voice get `dry_run_sample()` and raise the base `Blocked`
   for their hard blocks, so their `sample:` and `blocked_by:` entries can go. `MeetingRefused`
   (`peer/adapters/meetings.py:42`) is also raised for HTTP and missing-key errors and is caught by name at
   `peer/meetings/live.py:279`, so keep that name (for example a block-only subclass of both). Google keeps
   `sample:` (it needs a live mail) and drops `blocked_by:`. (b) Brain runs inherit the starting process's
   `CLAUDE_CODE_*` variables when the Peer starts from a Claude Code session (STATE lesson): strip them in
   `runner.py` and `warm.py` except the ones set there, and re-run the canary.

## Proof and walks (D13)

On a new test owner `wp5btest2`, set up as `wp5btest` after the defaults changed, from `~/repos/ai-peer-wp5b`,
every command with its prefix. Evidence in a new `docs/build/evidence/wp5/contract-walks.md`.

1. `port-check` with the role checks: no FAIL, exit 0; one FAIL path per role (a missing method, a wrong shape),
   on a broken toy in a scratch folder, never in the repo.
2. Dry walks, each passing as its evidence says:
   - `scenario s1-online --dry-run` and `scenario s1-away --dry-run`. Pass: S1-away dry, a `post_reply` in the
     thread for each of Lakshmi's two posts, then one `dm` to the owner; S1-online dry, a `dm` card with Send,
     Edit and Skip, then a `post_reply` after the scripted click (`docs/build/evidence/wp1/s1-walks.md` holds
     the live walks)
   - `scenario s2-brief --dry-run` (`docs/build/evidence/wp3/walks.md`)
   - `scenario s3-meeting --dry-run --question "<yours>"` (`docs/build/evidence/wp4/s3-walks.md`, "Dry walk
     1"). It uses real Recall on the test meeting and local voices, about $0.07. It outlasts a 10-minute shell
     call, so run it in the background. Wait for `meeting_brief_sent` in the test owner's `log.jsonl`, not the
     walk's "ended". At most two attempts per S3 walk and four Recall runs in all, each after the controller's
     OK (it checks no other session runs a meeting).
   - `scenario f6-fresh --dry-run` (`docs/build/evidence/wp2/walks.md`, F6); `jobs --once`, run twice (the
     first run only sets the GitHub cursor), keeping its `FakeAdapter` (`peer/__main__.py:239`: its pushes go
     nowhere; never give it the registry's chat, or a CI heads-up DMs Manish for real); and `status`, the one
     command here on the real Slack adapter through the registry (Web API reads only)
   - item 5's S3 walk on a backend that is not claude
3. **Stranger's porting walk**, WP5-1's recipe (`docs/build/evidence/wp5/porting-walk.md`) with three preamble
   changes: the venv is `~/repos/ai-peer-wp5b/.venv/bin/python`; its only `peer` commands are
   `port-check --adapter teamcode`, `port-check --adapter teamchat` and `discover --no-ai` (a full `port-check`
   FAILs slack, google and meetings there: no secrets); and "nothing reaches a real system" becomes "GitHub still
   answers through this Mac's `gh` login, so switch the code role before `discover`". Export `peer/`,
   `requirements.txt` and `docs/porting-guide.md` of your pushed branch into a scratch folder outside `~/repos`,
   with `AI_PEER_HOME=<export>/home` and owner `wp5toy`. A fresh sub-agent adds a toy code host ("teamcode": a
   local folder as a repo with one tracker file) and a toy chat ("teamchat": one JSON file), and switches the
   roles to them through settings only. Pass: nothing changed outside `peer/adapters/` and settings, except data
   files under `<export>/home/` that its settings point to; both port-checks pass; `discover --no-ai` builds a
   project from teamcode. Count each lookup outside the guide as a gap and fold it in. Delete the export.
4. **Hand-over rehearsal:** after item 6 is pushed, `GIT_LFS_SKIP_SMUDGE=1 git clone --branch wp5-contract
   <origin url> <scratch>/repo` (outside `~/repos`). Follow §13 "Set up from scratch" steps 1 to 7 with
   `AI_PEER_HOME=<scratch>/home` on every command, and read every `~/.ai-peer` in the guide as `<scratch>/home`.
   **Never create, chmod or write anything under the real `~/.ai-peer`: the live Peer re-reads its `.env` on
   every call** (`peer/settings.py:43`). Write no `.env`. Skip the "Re-create" list (the pinned binary, the Codex
   login, the hook script and the coding-tool hooks are shared on this Mac). Run step 6 as `discover --no-ai`.
   Even without secrets, two real systems answer: GitHub through this Mac's `gh` login (read-only,
   `peer/adapters/github.py:23-30`), and step 7's brain through the personal Claude login (`brain.claude_bin`
   expands `~` to the real home). Write both into §13, with the FAILs a machine without secrets shows. Delete
   `<scratch>`.

**The live Peer: this package needs nothing from it.** After your merge, the controller (or the demo package,
which holds the Peer next) restarts it on merged main from `~/repos/ai-peer-live` (STATE "Next" 3c) and runs one
live S1-away walk: the proof of the Socket Mode path you cannot walk on a test owner. If the controller hands you
that job, its message is your only permission for `AI_PEER_OWNER=manish`, `peer stop` and `peer start`. Use
`docs/build/handoffs/KICKOFF-2026-11-06-ai-peer-wp4-2.md` point 3 steps a, c, d, e, f and g only, from
`~/repos/ai-peer-live` (never `~/repos/ai-peer-wp5b`). Check the old pid with `ps -p <pid>` instead of step b,
and never run step h: `voice.engine` stays `local`.

## PR and merge

- One PR, `wp5: the adapter contract everywhere, porting guide finished`, into `main`, opened as a draft early:
  what works, the evidence, what is not verified, the head commit.
- Merge with a merge commit (`gh pr ready <n>`, then `gh pr merge <n> --merge`) when proofs 1 to 4 pass. If
  `main` moved, merge `origin/main` in first (no rebase, no force-push) and re-run port-check and the S1 dry
  walks.
- Undo: revert the merge commit (the live Peer keeps its old code until someone restarts it).
- Update STATE on `main` from a throwaway worktree (`git fetch origin`, `git worktree add --detach <scratch>
  origin/main`, edit, commit, `git push origin HEAD:main`, `git worktree remove <scratch>`), never from the
  controller's checkout: your row, "Next" 3b (mark what you closed), lessons, session log.

## Stop rules

- Context: measure at every milestone from your own session's transcript (the last usage record: input +
  cache-read + cache-creation, of 1M). At 45 to 50%: finish the step, push, write
  `docs/build/handoffs/HANDOFF-<date>-ai-peer-wp5-3.md`, update STATE, tell the controller, stop. Plan one
  hand-off: if context is over 35% when proof 2 passes and the PR is pushed, hand off there; the successor does
  item 6, proofs 3 and 4 and the merge.
- Weekly usage at each milestone: `claude -p "/usage" --output-format text --no-session-persistence
  --strict-mcp-config`. The account also runs Learn Like Magic; it read 45% at 21:47 UTC on 6 Nov and resets
  11 Nov 07:00 UTC. At 80%: finish the step and ask the controller before starting another. At 93%: start
  nothing that cannot finish cleanly. At about 95%: finish the step, push, hand off, stop.
- 5-hour window at 80%: start no sub-agent.

## When done

STATE as above. Tell the controller: the PR number and merge commit, the evidence file, port-check's result
line, the new settings keys (the live owner `manish` gets new default keys when the Peer restarts on the new
code), and what the live smoke test needs. The controller closes you; start no successor unless you hand off
for context.

## Traps known before the first line

- **Your only `peer` commands**, each with your prefix: `set`, `discover --no-ai`, `port-check`, `status`,
  `jobs --once`, `scenario <name> --dry-run` (S3 only after the controller's OK), `meeting list`, and, after your
  own failed S3 walk, the cancel line and `meeting clean` below. Anything else asks the controller first.
  `google spike` sends real mail; `google login` opens a consent page in Manish's Chrome; `meeting draft` and
  `run` without `--dry-run` DM Manish (and `run` joins a real bot); `local ingest` deletes the live Peer's spool
  files; `meeting voices` calls ElevenLabs on Learn Like Magic's key.
- **The Google token is shared:** `peer/world/profiles/test-small.json` carries manish@ (lines 8-9), so a test
  owner uses the live Peer's own token `~/.ai-peer/google-token-manish.json`, and a refresh rewrites that shared
  file (`peer/adapters/google.py:78-79, 82-88, 211-224`): reads only, no loops.
- **One live Peer** (owner `manish`); only the controller hands it out. Never: `peer start`, `stop` or `watch`,
  a live `peer scenario`, `peer browser`. Never, with any owner: `peer sample-heads-up` (a real DM),
  `peer world ...` (real Slack writes), `peer local install` (overwrites the shared hook script),
  `peer brief --post`, `peer seed ...` (real mail from the colleague aliases to manish@). Never
  `AI_PEER_OWNER=manish`, and never a `peer` command without the prefix: it acts on `manish`, whose settings the
  live Peer re-reads at once. A second Socket Mode connection splits the Peer's events.
- **`peer meeting clean` removes every bot on the Recall account**, the live Peer's too. Use it only after your
  own failed S3 walk, after cancelling your test owner's open meeting rows (the command in
  `KICKOFF-2026-11-06-ai-peer-wp4-2.md` point 5, with your prefix), and never while another session runs a
  meeting.
- A test owner fences only `~/.ai-peer/<owner>/`: Slack, GitHub, Google, Recall and ElevenLabs are real.
  Read-only calls and dry runs only. Never `voice.engine elevenlabs` on any owner (Learn Like Magic's live key).
  Keep `google.act_on_real_items` and `google.show_real_items` off.
- `peer discover` re-points the brain skill links of its owner: only with your test owner's prefix.
- Check a process by its pid (`ps -p <pid>`), never by a `pgrep -f` pattern: a pattern also matches Claude
  sessions whose launch prompt holds the text.
- `preethi` in the test Slack is a real person: never message, mention or DM her. The Peer is read-only on LLM
  code and never touches LLM production.
- No company-internal details in build files: the guide uses only DESIGN §6's notes; never copy from `film/`.
- In this Mac's shell, `grep` is ugrep and skips git-ignored files: use `git grep` or `command grep`. Never
  `sed -i` at a line number from a search that may find nothing (it once doubled STATE): use exact-text edits.
  Times in records come from `date -u`.
- Idle Telegram pings are off; anything for Manish goes through the controller; his logged-in Chrome is off
  limits.
- This Mac also runs Learn Like Magic: never `pkill` by pattern; stop only PIDs you started; never touch other
  worktrees (the live Peer runs from one; STATE says which).
- The demo package may run at the same time. It owns `peer/meetings/factpack.py`, the `### answer_live` section
  of `peer/brain/skills/peer-brain/SKILL.md`, `demo/script.md`, and `peer/web/` apart from the two lines below:
  never edit them (call `factpack.build` as it is). Shared, small and additive edits only:
  `peer/meetings/live.py`, `peer/brain/warm.py`, `peer/brain/schemas.py` (append), SKILL.md (a new section and
  the one-line `description:`), `peer/web/brief_page.py:179-180`, `peer/web/app.py:380`, `peer/defaults.yaml`.
  Merge `origin/main` before your merge; if that merge touched `peer/meetings/`, `peer/brain/` or SKILL.md,
  re-run item 5's S3 walk.
