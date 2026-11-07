# WP7 plan: the privacy fix, then the adapter contract everywhere

A package plan written on the first laptop (6 Nov 2026, from a read-only map of the code; each finding was
checked in the code, then the plan was reviewed read-only), sanitized for the Airbnb laptop on 7 Nov. It is
not yet a worker's brief: the controller on the new laptop turns it into one (a dated hand-off in
`docs/build/handoffs/`), re-checks every file and function it names against the code at that time, and
names the base commit. Line numbers were dropped on purpose: find each spot by its file and function name.

## Manish's words (quoted)

- The goal (DESIGN D2): "your goal is to have the generic system fully ready and add instructions on how the
  product needs to be updated with a real company with real integrations. then i move this product to my
  airbnb laptop and do the airbnb specific integrations. makes sense?"
- The build style (his first brief): "this is a hackathon, so our main idea is to make it work, and not go off
  track in unimportant things like code quality, unit tests, et cetera".
- The merge rule (D13, "Controller + up to 2 workers (Recommended)"): done = the scene seen working in a
  manual walk; workers merge their own PR when the walk passes. No review, CI or unit tests.
- The rule this package makes true (AGENTS.md): integrations only through the adapter contract (DESIGN §2): a
  company port must not need changes outside the adapters and settings. DESIGN §6: company data goes only
  through the company's harness and auth, never a personal subscription.

## The job

First stop company data from ever reaching a personal login. Then make every runtime pick of a system, and
every call to one, go through the adapter contract and settings, and finish the porting guide. Proven by
`port-check`, the dry walks, a stranger's porting walk and a hand-over rehearsal on a clean copy. Not this
package: the demo script, web page polish, live-answer speed, recordings, the film opener (WP10 does those and
may run at the same time).

## Read first, in order (only these)

1. `AGENTS.md`, then `docs/build/STATE.md` ("Where we are", "Next", "Lessons").
2. `docs/porting-guide.md`, in full: section 3's "A chat adapter for this runtime" and "What a port also
   edits today" are the map of the code work.
3. `docs/build/DESIGN.md` §2, §3 and §6; `docs/build/PRD.md` "Porting deliverable".
4. `peer/adapters/base.py`, `peer/portcheck.py`, `peer/defaults.yaml`, `peer/settings.py`,
   `peer/brain/runner.py`; then each spot below as you reach it.

## Working copy

- A worktree from the latest `main`, branch `wp7-contract` (one PR if the repo has a remote; else a local
  merge). A Python 3.12 venv: `uv venv --python 3.12 .venv && uv pip install --python .venv/bin/python -r
  requirements.txt` (or `python3.12 -m venv .venv && .venv/bin/pip install -r requirements.txt`).
- A test owner on every command: `AI_PEER_OWNER=wp7test .venv/bin/python -m peer ...`; plus
  `AI_PEER_HOME=<a scratch folder>` for everything that needs no secret. First commands:
  `set brain.summary_effort high` (a discovery at `max` is expensive), `set web.port 8791`,
  `set meetings.listener_port 8796`, then `discover --no-ai`. An owner's `settings.yaml` is a full copy of the
  defaults made by its first command: new default keys reach it, changed ones never do ([lessons](../../lessons.md)).
  After you change `peer/defaults.yaml`, use a fresh test owner for the final checks.
- The test world is the fictional Fernway (`peer/scenarios/world.yaml`); its repos do not exist, so discovery
  finds no projects and dry-walk answers flag questions for Manish. A pass here is the mechanics (the right
  acts in the right order), not the content.
- Secrets only in `~/.ai-peer/.env`: name keys, never print a value.

## What to build, in this order

Behaviour must not change except in item 1. Move code behind the contract; do not rewrite it.

1. **The privacy fix (first).**
   - `peer/brain/runner.py`, `run_agent`: on a failure it falls back from any backend that is not claude to
     claude (`other = "codex" if primary == "claude" else "claude"`), and `brain.fallback` is on by default in
     `peer/defaults.yaml`. Fall back only between claude and codex, never from a backend added by settings,
     and make the default `brain.fallback: false` (the Peer now runs on a company laptop).
   - A brain backend added by settings: a `module:function` entry beside `BACKENDS` in `runner.py`, so a
     company harness needs no edit there (item 4 uses the same hook). The settings page then accepts any
     registered backend (`peer/web/app.py` accepts only claude and codex today).
   - `peer/meetings/live.py` always starts the Claude warm session (`WarmSession` from `peer/brain/warm.py`)
     whatever `brain.backend` says, though the guide and `warm.py`'s docstring claim fresh runs for other
     backends: no such code exists. Use the warm session only when the backend is claude; otherwise answer
     each line with a fresh `run_agent` run of a new playbook section `### answer_live_once` (SAY, CERTAINTY,
     AS_OF, FLAG, SOURCES through a schema appended to `peer/brain/schemas.py`, the fact pack in the prompt)
     and a run timeout under the time the answer thread waits (about 50 s in `live.py`; `run_agent` defaults
     to 240 s). Never edit `### answer_live` (WP10 owns it).
   - Done when: (a) a stub backend added through settings (a module in a scratch folder on `PYTHONPATH`,
     outside the repo) that returns `ok: false` makes `run_agent` record one failed stub run and no fallback;
     (b) with a backend that is not claude (codex, or the stub) and `brain.fallback: false`, an S3 dry walk
     answers through fresh runs, and the owner's `brain-runs.jsonl` shows no claude run and no `warm:` run.
     If no meeting service is allowed yet, prove (b) by calling the live-answer function directly with a
     recorded transcript line, and say so.

2. **One registry for every system the runtime uses.** A new module (for example
   `peer/adapters/registry.py`) and a map in `peer/defaults.yaml` from role to an `adapters:` key (chat, code,
   mail, calendar, docs, meetings, voice, directory). It builds each adapter with `from_settings(st)`, once per
   process (`SlackAdapter`'s constructor calls Slack's `auth.test`). `MeetingsAdapter` and `VoiceAdapter` get
   `from_settings`. A role whose login is missing stays "not connected" as today (for example
   `brief.get_google` returns None). Call sites: `peer/__main__.py` (`_slack()`, used by watch, status,
   sample-heads-up, `brief --post`, `meeting draft` and `run`, and the meeting command's other builds),
   `peer/watcher.py` (the directory build), `peer/fresh.py` (its GitHub and directory builds),
   `peer/jobs.py`, `peer/memory/discovery.py` (`step_github`, `step_slack` and the directory build),
   `peer/memory/google_steps.py`, `peer/brief.py` (`get_google`, keep the dry-run fake override, and the
   brief's other build), `peer/web/brief_page.py`, `peer/meetings/cover.py`, `peer/meetings/live.py`. Test
   tooling may keep its direct builds (`peer/scenarios/`, `peer/meetings/walk.py`, `peer/seeds.py`,
   `peer/google_spike.py`, the `peer google` and `peer world` commands, the fakes for dry runs); the guide
   says so. Done when: `git grep -n -E 'SlackAdapter\(|GitHubAdapter\(|GoogleAdapter\(|MeetingsAdapter\(|VoiceAdapter\(|DirectoryAdapter\(' -- peer ':!peer/adapters'`
   lists only test tooling, and the same for imports of those classes, except the registry and the
   exception classes (`MeetingRefused`, `Blocked`).

3. **Role methods for the calls the runtime makes besides the four verbs**, declared in
   `peer/adapters/base.py` with the shapes the runtime reads back.
   - Chat: `lookup_email`, `user_info`, `get_presence`, `get_status`, `listen`, `permalink` (the guide's
     section 3 chat subsection), plus what is raw Slack today: joining the trial's channels
     (`join_world_channels` in `peer/watcher.py`); the owner's channels with members for discovery
     (`step_slack`); whether an event is a DM (the watcher tests Slack's `D` channel prefix); which ids an event
     mentions and its plain text (Slack's `<@…>` markup in the watcher). The fake (`peer/adapters/fake.py`)
     answers the same. `SlackAdapter.join_public_channels()` (unused) joins every public channel: replace it
     with one that joins only named channels.
   - Code host: `repo`, `list_dir`, `file_text`, `last_commit`, `pulls`, `runs`, `blob_url`
     (`peer/adapters/github.py`) and the commits-of-a-path call `peer/fresh.py` makes raw, each with the
     fields the runtime reads (a pull's `head.ref` in `jobs.py`; a run's `name`, `status`, `conclusion` in
     `brief.py`).
   - The card and text format stays Slack's: write down, as part of the chat role, the exact subset the
     runtime builds (Block Kit section, context, divider, actions, section accessory buttons, some with a
     `url`, button `style`, the input modal, mrkdwn, Slack's click payload), built in `peer/executor.py`,
     `peer/meetings/cover.py`, `peer/meetings/calendar.py`, `peer/notify.py` and `peer/brief.py`. A chat
     adapter for another system translates it. Do not move card building.
   - Mail, calendar and docs (google today), meetings and voice: declare the methods the runtime calls
     besides the four verbs: google `guard`, `recent_docs`, `upcoming`, and a doc-text method replacing the
     raw Drive export in `peer/memory/google_steps.py`; meetings `allowed`, `label` (a static method called
     from `cover.py` and `calendar.py`), `bot`, `wait_status`, `transcript_lines`, `media`, `download`;
     voice `render` and the clip length. The module helpers `connected`, `ledger` and `owner_email`
     (`peer/adapters/google.py`) go behind the mail role.
   - The watcher tells the fake from Slack with `hasattr` checks (`inject`, `lookup_email`, `users`, `bot`).
     Methods declared on the base class make those true for every adapter, so replace the checks with role
     calls the fake answers (ids as `peer/scenarios/player.py` sets them).
   - Done when: `port-check` checks the role methods of the adapter in each role (calls the read-only ones;
     for chat, dry-runs the acts the runtime sends, with their real payload shapes). **`port-check` never calls
     `listen` (a second Socket Mode connection splits a running Peer's events) or the join method (a real
     Slack write): it only checks they exist.** Role checks print ok, FAIL and counts only, never a name,
     email, status text, channel member or message. Prove the join method on the fake, never on real Slack.
     The S1 dry walks pass.

4. **Settings instead of code edits:** `github.api_base` and `github.web_base` (`API` in
   `peer/adapters/github.py`; web links built in `github.py`, `peer/fresh.py` and
   `peer/memory/discovery.py`, all through the code role; GitHub Enterprise needs its own); the trial's people
   and channels file (`load_world()` in `peer/memory/discovery.py` hard-codes `peer/scenarios/world.yaml`, and
   the guide's hard-block table tells a port to edit that file); the brain backend from item 1. Done when: the
   defaults keep today's `port-check` and dry-walk results, and a stub backend named in settings runs one
   `run_agent` on a test owner and the settings page accepts it.

5. **The guide rewritten for the new contract**: the registry and roles (sections 2 and 3), the role methods
   and the card format (section 3's chat subsection), the new settings (section 5), the backend and fallback
   rules (section 6), `port-check`'s role checks (section 4), and "What a port also edits today" cut down to
   what is left (the card format for a non-Slack chat; the walk tooling; anything item 3 did not cover, by
   file and function). Section 13 fixed from proof 5 below. Keep "The Airbnb port" section in step with what
   changed. Send the controller one line for DESIGN §2 on the roles; it records it.

6. **Optional, if context allows:** (a) meetings and voice get `dry_run_sample()` and raise the base `Blocked`
   for their hard blocks, so their `sample:` and `blocked_by:` entries can go (`MeetingRefused` in
   `peer/adapters/meetings.py` is also raised for HTTP and missing-key errors and is caught by name in
   `peer/meetings/live.py`, so keep that name, for example as a block-only subclass of both). (b) A brain run
   inherits the starting process's `CLAUDE_CODE_*` variables when the Peer starts from a Claude Code session:
   strip them in `runner.py` and `warm.py`, except the ones set there, and re-run the canary.

## Proof and walks (D13)

On a fresh test owner after the defaults changed. Evidence in `docs/build/evidence/wp7/contract-walks.md`.

1. `port-check` with the role checks: no FAIL, exit 0; one FAIL path per role (a missing method, a wrong
   shape) on a broken toy in a scratch folder, never in the repo.
2. Dry walks: `scenario s1-online --dry-run` and `scenario s1-away --dry-run` (S1-away: a `post_reply` in the
   thread for each of the two colleague posts, then one `dm` to the owner; S1-online: a `dm` card with Send,
   Edit and Skip, then a `post_reply` after the scripted click); `scenario s2-brief --dry-run`;
   `scenario s3-meeting --dry-run --question "<yours>"` only where a meeting service and a test meeting are
   allowed (it joins a real bot; it outlasts a 10-minute shell call, so run it in the background and wait for
   `meeting_brief_sent` in the test owner's `log.jsonl`, not the walk's "ended"; at most two attempts);
   `jobs --once` twice (the first run only sets the code-host cursor), keeping its `FakeAdapter` (never give
   it the registry's chat, or a CI heads-up DMs the owner for real); `status` (Web API reads only).
3. Item 1's walk on a backend that is not claude.
4. A stranger's porting walk ([lessons](../../lessons.md), "Walk a guide with a stranger"): export `peer/`,
   `requirements.txt` and `docs/porting-guide.md` into a scratch folder; a fresh sub-agent adds a toy code
   host (a local folder as a repo with one tracker file) and a toy chat (one JSON file) and switches the roles
   to them through settings only. Pass: nothing changed outside `peer/adapters/` and settings (data files
   under the export's home excepted); both `port-check`s pass; `discover --no-ai` builds a project from the
   toy code host. Each lookup outside the guide is a gap: fold it in.
5. Hand-over rehearsal: a clean copy of the branch in a scratch folder, the guide's "Set up from scratch"
   steps with `AI_PEER_HOME=<scratch>/home` on every command and no `.env`. Write into section 13 the FAILs a
   machine without secrets shows, and which real systems still answer (for example a code host through a CLI
   login, the brain through a personal login).

## PR and merge

One PR (or local merge), "wp7: privacy fix and the adapter contract everywhere", opened as a draft early:
what works, the evidence, what is not verified, the head commit. Merge with a merge commit when proofs 1 to 5
pass; if `main` moved, merge it in first (no rebase, no force-push) and re-run `port-check` and the S1 dry
walks. Undo: revert the merge commit (a running Peer keeps its old code until restarted). Then STATE: the
package line, "Next", lessons, the session log.

## Stop rules

- Context: measure at every milestone from the session's own record of token use (input + cache read +
  cache creation of the last turn, over the window size). At 45 to 50%: finish the step, push, write a dated
  hand-off in `docs/build/handoffs/`, update STATE, tell the controller, stop. Plan one hand-off: if context is
  over 35% when proof 2 passes and the PR is pushed, hand off there; the successor does item 5, proofs 4 and
  5 and the merge.
- Usage: the limits in [ways of working](../../ways-of-working.md) ("Usage limits").

## Traps known before the first line

- **Allowed `peer` commands**, each with the test owner: `set`, `discover --no-ai`, `port-check`, `status`,
  `jobs --once`, `scenario <name> --dry-run`, `meeting list`. Anything else asks the controller first:
  `google spike` sends real mail; `google login` opens a consent page; `meeting draft` and `run` without
  `--dry-run` DM the owner (and `run` joins a real bot); `local ingest` deletes spool files; `meeting voices`
  calls ElevenLabs; `sample-heads-up` DMs the owner; `world ...` writes to Slack; `local install` overwrites the
  shared hook script; `brief --post` DMs; `seed ...` sends real mail.
- **Never a `peer` command without `AI_PEER_OWNER`**: it acts on the default owner, whose `settings.yaml` a
  running Peer re-reads at once. A second Socket Mode connection splits a running Peer's events: one live Peer.
- `peer meeting clean` removes every bot on the meeting-bot account, a live Peer's too: only after your own
  failed walk, after cancelling your test owner's open meeting rows, and never while another session runs a
  meeting.
- A test owner fences only `~/.ai-peer/<owner>/`: Slack, the code host, mail, the meeting bot and ElevenLabs
  are real. Read-only calls and dry runs only. Keep `voice.engine: local` and every hard block on.
- `peer discover` re-points the brain skill links of its owner: run it only with your test owner.
- Check a process by its PID (`ps -p <pid>`), never by a `pgrep -f` pattern: a pattern also matches agent
  sessions whose launch prompt holds the text.
- Exact-text edits, never `sed -i` at a line number from a search (an empty search once doubled a whole file).
  Times in records come from `date -u`.
- WP10 may run at the same time. It owns `peer/meetings/factpack.py`, the `### answer_live` section of
  `peer/brain/skills/peer-brain/SKILL.md`, `demo/script.md`, and `peer/web/` apart from the adapter builds in
  `brief_page.py` and the backend list in `app.py`: never edit them. Shared, small and additive edits only:
  `peer/meetings/live.py`, `peer/brain/warm.py`, `peer/brain/schemas.py` (append), SKILL.md (a new section and
  the one-line `description:`), `peer/defaults.yaml`. Merge `main` before your merge; if that merge touched
  `peer/meetings/`, `peer/brain/` or SKILL.md, re-run item 1's walk.
