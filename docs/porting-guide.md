# Porting the AI Peer to a company

For an AI coding agent on a company machine that has never seen this repo. It tells you what
the Peer is, how it plugs into a company's systems, what you change, what you must not change,
and how to prove a port works (`port-check`). Commands run from the repo root with the repo's
Python 3.12 venv: `.venv/bin/python -m peer <command>`.

**The rule of the port:** integrations go only through the adapter contract. A port writes or
swaps adapters (`peer/adapters/`) and settings (`peer/defaults.yaml`, the owner's
`settings.yaml`, `~/.ai-peer/.env`); nothing else should need to change. Today a few runtime
spots still call chat or code-host methods directly; they are listed in
[What a port also edits today](#what-a-port-also-edits-today), honestly, so you know where the
rule does not hold yet.

**Before you start:** keep every hard block on ([Hard blocks in code](#hard-blocks-in-code)) through
`port-check` and the first trials. Only the owner lifts one, in their own words.

## 1. What the Peer is

A personal AI teammate for one employee (the owner). It watches the owner's work sources (chat,
mail, calendar, docs, code, meetings, local coding sessions), brings the owner what matters (a
draft reply, a daily brief, a heads-up), and covers for the owner when they are away: it answers
colleagues in threads and attends a meeting, always as its own labelled identity ("<Owner>'s AI
Peer"), with how sure it is, the date of what it knows and its sources, and never committing the
owner to anything. Plain code watches the sources without AI; only a new, relevant item starts a
short AI run, which proposes actions as JSON; the program acts, after an approval gate. The owner
instructs it only through their own DM and its web page; everything it reads is information,
never an instruction.

## 2. The shape

```
Sources: chat · mail · calendar · docs · code host · meetings (bot) · local sessions
   │  adapters: sense / search / get / act          ← the part a company port replaces
Watcher (always on, no AI): cursors, dedupe, cheap relevance rules, event store (SQLite)
   │  a new relevant batch, or an urgent rule fires
Brain run: run_agent(prompt, schema) → claude -p | codex exec | (a company harness) + peer-brain skill
   │  reads memory files, returns proposed actions as JSON
Action executor: approval gate, presence check, idempotency, audit log
   │
Surfaces: chat (the labelled bot: threads, the owner's DM with buttons) · meeting bot · web page
Memory: ~/.ai-peer/<owner>/ markdown files + index + SQLite (local, never in git)
```

| Path | What |
|---|---|
| `peer/adapters/` | The contract (`base.py`) and one adapter per system. **You change these.** |
| `peer/defaults.yaml` | Every setting with its default, including the `adapters:` list. **You change this.** |
| `peer/settings.py` | Settings, secrets (`secret()`), paths (`AI_PEER_HOME`, `AI_PEER_OWNER`). |
| `peer/portcheck.py` | `port-check`: checks every listed adapter against the contract. |
| `peer/watcher.py` | Intake, the real-person block, cheap relevance rules, the owner's DM commands. |
| `peer/executor.py` | The approval gate (online: a draft first; away: answer), idempotency, safety, the log. |
| `peer/presence.py` | Online or away: the manual switch, chat status and presence, working hours. |
| `peer/brain/` | `run_agent` on Claude Code or Codex (`runner.py`), schemas, the `peer-brain` skill. |
| `peer/memory/` | The memory layout and discovery (building the memory from the sources). |
| `peer/fresh.py`, `peer/jobs.py` | Fresh memory and the background jobs inside the running Peer. |
| `peer/localwork.py`, `peer/local_hook.sh` | Local work: session-end hooks and the folder scan (a plug-in, not an adapter). |
| `peer/notify.py`, `peer/tuning.py` | Pushes to the owner (one door, the owner's mutes apply); self-tuning from feedback. |
| `peer/web/` | The owner's page (setup, what it learned, settings, activity log). |
| `peer/scenarios/` | The test world (`world.yaml`: invented colleagues) and the scripted walks. |
| `peer/world/profiles/` | Directory records (the stand-in for a company directory). |

## 3. The adapter contract

One adapter per system, the same four verbs (`peer/adapters/base.py`, class `Adapter`):

| Verb | Signature | Returns | Rules |
|---|---|---|---|
| sense | `sense(cursor: str \| None)` | `(events: list[Event], next_cursor: str \| None)` | New events since the cursor. Never calls the AI. `None` = first run (start from now or a short look-back; no big backlog). The cursor is a string you design (a timestamp, JSON, a count). |
| search | `search(query: str, filters: dict \| None = None)` | `[{"ref", "snippet", "url", "title"?, "at"?}]` | Live search; content is searched, not bulk-copied. Every hit has a `ref` that `get()` accepts. |
| get | `get(ref: str)` | `dict` | The full item (message, doc, PR, transcript). `{}` when there is nothing. |
| act | `act(action, target, payload, idempotency_key, dry_run=False)` | `{"ok": True, ...}` | One action (post, reply, DM, react, draft email, join a meeting, speak). With `dry_run=True` it must never touch the system. |

**Event** (`peer/events.py`, a dataclass): `id` (globally unique, e.g. `slack:msg:C123:1730730000.123`),
`source` (the adapter's name), `kind` (`message`, `dm`, `mention`, `reaction`, `pr`, `ci`, `email`,
`invite`, ...), `at` (ISO 8601, UTC), `actor` (that system's id of who did it: a chat user id, a
code-host login, an email), `ref` (what `get()` takes to fetch it again), `thread_ref` (the
conversation it belongs to, or `None`), `text`, `url` (or `None`), `extra` (a dict: channel, ts,
names, anything the runtime needs). Use `peer.events.now_iso()` for "now". Refs follow
`<adapter>:<kind>:<id>`; each adapter parses its own refs in `get()`.

**Capabilities:** `capabilities` is a `frozenset` of `"sense"`, `"search"`, `"get"` and
`"act:<action>"`, one per action offered (`act:post_reply`, `act:dm`, ...). `offers(action)` reads it.
The executor refuses an action the adapter does not declare.

**`NotOffered`** (`peer.adapters.base`): the base class raises it for any verb you do not
implement. Do not declare a verb you do not offer.

**`Blocked`** (`peer.adapters.base`): raise it when a hard block in your adapter refuses an act.
Run the block **before** the dry-run return, so `port-check` proves the block holds (it shows
"blocked (ok)"). An adapter that has its own exception class lists its name under `blocked_by:`
in its `adapters:` entry instead.

**`dry_run`:** with `dry_run=True`, validate the action, run the hard blocks (read-only lookups
are fine), and return `{"ok": True, "dry_run": True, ...}` before any write, post, send, join or
spend. Read your own `act()` and check this line by line; `port-check` calls it.

**Three more methods** (defaults in the base class):

| Method | Default | Override when |
|---|---|---|
| `from_settings(cls, st)` (classmethod) | `cls()` | The constructor needs arguments. `st` is the owner's `Settings` (`st.get("dotted.key", default)`, `st.profile_path()`, `st.owner_dir`). Secrets: `peer.settings.secret("NAME")`. |
| `check(self)` | `{"ok": True, "detail": ""}` | Always: one cheap, read-only call that proves the login works. Never put a secret in `detail`. |
| `dry_run_sample(self)` | `None` | The adapter declares any `act:`: return the one act `port-check` runs in dry run, `{"action": ..., "target": ..., "payload": {...}}`. Fixed, not picked from the capabilities set (a set's order changes from run to run). |

**The person map:** one person across systems (chat id, email, code-host login) is one row in
the `people` table of `~/.ai-peer/<owner>/peer.db` (`person_id, name, email, slack_id, github, tz,
role, extra`), written with `Store.upsert_person(person_id, **fields)` (`peer/store.py`) by
discovery and the watcher, read with `Store.person_by(field, value)`. A new system's ids go in
`extra` (or a new column, which is a change outside the adapters: note it).

### Write a new adapter, step by step

1. Create `peer/adapters/<name>.py` with a subclass of `Adapter`. Set `name` (the same as its
   `adapters:` key) and `capabilities`.
2. Implement the verbs you declare, with the shapes above. Secrets come from
   `secret("<NAME>")` (never a literal, never printed); paths and options from settings
   (`st.get("<name>.<option>")`), with defaults in a `<name>:` block in `peer/defaults.yaml`.
3. Add `from_settings`, `check` and (if it acts) `dry_run_sample`.
4. List it under `adapters:` in `peer/defaults.yaml` (or in the owner's `settings.yaml`):
   `<name>: {module: peer.adapters.<name>, class: <ClassName>, query: <a word your data contains>}`.
5. Run `AI_PEER_HOME=<home> AI_PEER_OWNER=<owner> .venv/bin/python -m peer port-check --adapter <name>`
   until every cell is ok, n/a or blocked (ok), and the exit code is 0.

A skeleton (an invented chat system "examplechat" reached by a token; replace the bodies with the
real API calls, and the names with your system's):

```python
"""examplechat adapter: <the system>. Read-only except act; act honours dry_run."""
from __future__ import annotations

from ..events import Event, now_iso
from ..settings import secret
from .base import Adapter, Blocked

ACTS = ("post_reply", "dm")


class ExampleChatAdapter(Adapter):
    name = "examplechat"
    capabilities = frozenset({"sense", "search", "get", *(f"act:{a}" for a in ACTS)})

    def __init__(self, token: str, base_url: str, blocked: list[str] | None = None):
        self.token, self.base_url, self.blocked = token, base_url, set(blocked or [])

    @classmethod
    def from_settings(cls, st) -> "ExampleChatAdapter":
        return cls(secret("EXAMPLECHAT_TOKEN", required=True), st.get("examplechat.base_url", "https://chat.example"),
                   st.get("examplechat.blocked_channels", []))

    def sense(self, cursor):
        msgs = []                     # call the API: messages after `cursor`, oldest first
        events = [Event(id=f"examplechat:msg:{m['channel']}:{m['ts']}", source=self.name, kind="message", at=m["at"],
                        actor=m["user"], ref=f"examplechat:msg:{m['channel']}:{m['ts']}",
                        thread_ref=f"examplechat:thread:{m['channel']}:{m.get('thread_ts') or m['ts']}",
                        text=m["text"], url=m.get("url"), extra={"channel": m["channel"], "ts": m["ts"]})
                  for m in msgs]
        return events, (msgs[-1]["ts"] if msgs else cursor)

    def search(self, query, filters=None):
        return []                     # [{"ref": ..., "snippet": ..., "url": ...}]

    def get(self, ref):
        _, kind, rest = ref.split(":", 2)
        return {}                     # the full item for this ref

    def act(self, action, target, payload, idempotency_key, dry_run=False):
        if not self.offers(action):
            raise ValueError(f"examplechat does not offer {action}")
        if target in self.blocked:    # hard blocks run before the dry-run return
            raise Blocked(f"{action} refused: {target} is blocked")
        if dry_run:
            return {"ok": True, "dry_run": True, "action": action, "target": target}
        return {"ok": True}           # the real write, keyed by idempotency_key

    def check(self):
        return {"ok": bool(self.token), "detail": f"api {self.base_url}"}

    def dry_run_sample(self):
        return {"action": "post_reply", "target": "general",
                "payload": {"channel": "general", "thread_ts": None, "text": "port-check"}}
```

## 4. port-check

```bash
AI_PEER_OWNER=<owner> .venv/bin/python -m peer port-check              # every adapter listed under adapters:
AI_PEER_OWNER=<owner> .venv/bin/python -m peer port-check --adapter X  # one
```

It reads the `adapters:` block of the owner's settings. Per adapter: it imports `module`, takes
`class`, builds it with `from_settings(st)`, then fills one row:

| Column | What it does | ok when |
|---|---|---|
| caps | reads `capabilities` | every entry is `sense`, `search`, `get` or `act:<action>` |
| check | calls `check()` | `{"ok": true}` |
| sense | `sense(None)` | a list of `Event` with `id, source, kind, at, ref` and a string `text`; a string or `None` cursor |
| search | `search(<query>)` | a list of dicts, each with a string `ref` |
| get | `get(<ref>)` on the first search hit, else the first sensed event | a dict (`(empty)` if `{}`) |
| act | `act(**sample, dry_run=True)` | `{"ok": true}`, or a hard block refused it: **blocked (ok)** |

Each cell: `ok`, `n/a` (the verb is not declared, or there was nothing to get or act on),
`blocked (ok)`, or `FAIL`, with the seconds it took; the reasons print under the table. A verb
that is declared but raises `NotOffered` is a FAIL; an adapter that acts but has no sample is a
FAIL. The exit code is 1 on any FAIL. An entry with `pending: "PR #n"` whose module is not there
yet shows "not on main yet"; `enabled: false` shows "off".

An `adapters:` entry: `module`, `class` (required); `query` (the search word; default the owner's
first name); `sample` (the dry-run act when the class has no `dry_run_sample()`: `action`,
`target`, `payload`, or `target_from_search: <query>` plus `target_prefix:` to act on the first
matching hit of a fixed search); `blocked_by` (exception class names that mean a hard block
refused); `pending`; `enabled`.

`port-check` writes nothing anywhere: sense, search and get are read-only by contract; act runs in
dry run only. On Slack it polls history over the Web API and never opens a Socket Mode
connection (a second connection would split a running Peer's events). Local work is not in the
table (its intake deletes shared spool files; its scan writes memory).

The result on this build's own adapters (6 Nov 2026): directory, slack, github and fake all ok
or n/a, google, meetings and voice "not on main yet" (`docs/build/evidence/wp5/port-check.md`).

## 5. Settings and secrets

| What | Where | Notes |
|---|---|---|
| Defaults | `peer/defaults.yaml` (in the repo) | Every key with its default and a comment. |
| The owner's live settings | `~/.ai-peer/<owner>/settings.yaml` | Made as a **full copy** of `defaults.yaml` the first time any command runs for that owner, then merged over the defaults key by key: the live file wins. The running Peer re-reads it when it changes. |
| Change one setting | `AI_PEER_OWNER=<owner> .venv/bin/python -m peer set <dotted.key> <value>` | The value is YAML: `true`, `42`, `[a, b]`, `{k: v}`. |
| Secrets | `~/.ai-peer/.env` only | `KEY=VALUE` lines (an `export ` prefix and quotes are fine; no shell expansion). Read with `peer.settings.secret("KEY")`, which falls back to the process environment; `secret("KEY", required=True)` raises "KEY is missing". Never in git, chat, logs or settings files. |
| Where everything lives | `AI_PEER_HOME` (default `~/.ai-peer`) | The `.env`, every owner folder, `bin/`, the spool. |
| Which owner | `AI_PEER_OWNER` (default `owner.id` in `defaults.yaml`) | The folder `~/.ai-peer/<owner>/`. Without it, a command acts on the default owner. |

Put `AI_PEER_HOME` and `AI_PEER_OWNER` on every command line (`AI_PEER_OWNER=test1 .venv/bin/python
-m peer ...`): an `export` may not survive between an agent's shell calls, and the wrong owner
means the wrong memory and settings. Use a test owner for every trial.

**Trap:** after you edit `peer/defaults.yaml`, an existing owner gets the keys that are new, but
keeps their old value of any key already in their copy. Change it with `peer set`, or edit (or
delete and re-make) the owner's `settings.yaml`.

Secret names this build uses (names only; values only ever in `.env`): `SLACK_BOT_TOKEN` (the
labelled bot), `SLACK_APP_TOKEN` (Socket Mode), `SLACK_USER_TOKEN` (search only; the Peer never
posts as the owner), `GITHUB_TOKEN` (used read-only; falls back to the `gh` CLI's login),
`RECALL_API_KEY` and `RECALL_BASE_URL` (the meeting bot), `ZOOM_TEST_MEETING_URL` (the one meeting
a bot may join, PR #5), `ELEVENLABS_API_KEY` (voices, PR #5). The test world only:
`SLACK_SCENARIO_CLIENT_ID`, `SLACK_SCENARIO_CLIENT_SECRET`, `SLACK_SCENARIO_BOT_TOKEN`,
`SLACK_TEAM_ID`, `SLACK_AS_<PERSON_ID>` (the invented colleagues' logins). Google (PR #3) keeps
its OAuth client in `~/.ai-peer/google-client.json` and one token per account in
`~/.ai-peer/google-token-<account>.json` (mode 600), not in `.env`.

## 6. The brain

`peer/brain/runner.py`: `run_agent(prompt, schema, *, backend=None, label="", timeout=None,
fallback=None, effort=None) -> AgentResult(ok, output, backend, duration_s, error, usage)`. One
short, fresh run per call: it runs the `peer-brain` skill on the prompt, in the owner's memory
folder, with read-only file tools, and returns JSON that matches `schema` (`peer/brain/schemas.py`).
It never posts or sends anything; the executor does, after the approval gate. Each run is logged in
`~/.ai-peer/<owner>/brain-runs.jsonl`.

| Setting | Meaning |
|---|---|
| `brain.backend` | `claude` or `codex` (a key of `BACKENDS` in `runner.py`) |
| `brain.fallback` | on a failure, try the other backend once |
| `brain.timeout_s` | per run |
| `brain.claude_bin` | the pinned Claude Code binary (`~/.ai-peer/bin/claude-<version>`); **if the file is missing the runner falls back, without a word, to whatever `claude` is on PATH** |
| `brain.claude_model`, `brain.claude_effort`, `brain.summary_effort`, `brain.refresh_effort` | model and effort per kind of run (effort is a latency choice: answers at `high`, not `max`) |
| `brain.codex_bin`, `brain.codex_model`, `brain.codex_home` | Codex runs in its own `CODEX_HOME` and `HOME` under `~/.ai-peer` (its own `config.toml` and its own login) |

Each backend isolates the run from the user's own setup: Claude runs `claude -p "/peer-brain
<prompt>"` with `--setting-sources project`, hooks and auto-memory off, no MCP servers, the tools
`Read,Grep,Glob,Skill`, `--permission-mode dontAsk`, `--json-schema`, `--no-session-persistence`,
stdin from `/dev/null`; Codex runs `codex exec "$peer-brain <prompt>"` with `--sandbox read-only
--ephemeral --output-schema`. The skill (`peer/brain/skills/peer-brain/SKILL.md`) is linked into the
owner's folder at `.claude/skills/peer-brain` and `.agents/skills/peer-brain` by
`Memory.install_skill()` (`peer/memory/layout.py`); its text never names tools (they differ
between harnesses).

**A company harness is one more backend:** write `_run_<harness>(prompt, schema, timeout, effort)
-> AgentResult` in `runner.py`, add it to `BACKENDS`, and set `brain.backend: <harness>`. It must
run one prompt non-interactively, load the `peer-brain` skill from the owner's folder (link it
where that harness looks for skills), use read-only file tools only, return JSON for the schema,
load none of the user's personal setup, and send company data only through the company's harness
and auth. Prove it with one run before switching the setting. (`runner.py` is outside the
adapters: this is an expected edit; see the list below.)

The live meeting path (PR #5, `peer/brain/warm.py`, until it merges): one warm Claude process for a
meeting's length, primed with a compact fact pack, answers one question at a time; with any other
backend, live answers use fresh runs (slower). A company harness needs its own warm mode for fast
answers.

## 7. Memory

`~/.ai-peer/<owner>/` (never in git; at a company it holds company data and stays on that
machine): `INDEX.md` (one line per file), `me.md`, `rules.md` (the owner's preferences in plain
English; self-tuning edits it), `projects/`, `services/`, `channels/`, `people/`, `threads/`,
`decisions/`, `meetings/`, `local/`, `sources/` (verbatim copies), `docs/` (PR #3), `log.jsonl`
(the activity log, append-only), `peer.db` (events, cursors, actions, threads, people, kv),
`settings.yaml`, `keywords.json`, `brain-runs.jsonl`. Each file has front matter with its
sources and dates; the owner's corrections survive every rewrite.

Discovery (`peer discover`, or "Create my AI Peer" on the setup page) builds it in steps
(`peer/memory/discovery.py`: profile, team, repos and services, projects, chat channels, people,
docs, calendar); a new source adds a step with `register_step(Step(key, label, fn), replace=...)`.
`peer/fresh.py` and `peer/jobs.py` keep it fresh. A discovery at effort `max` is expensive; run
the first one at `brain.summary_effort: high`.

## 8. Local work (a plug-in, not an adapter)

What the owner is coding right now, from their own machine; summaries, never code
(`peer/localwork.py`):

- **Session-end hooks.** A coding tool runs `~/.ai-peer/bin/session-end <tool>` when a session
  ends, with the hook's JSON (it must carry `cwd`) on stdin. The script (`peer/local_hook.sh`,
  installed by `peer local install`) only saves that JSON to `~/.ai-peer/spool/session-end/` and
  exits 0 at once; where it is missing the hook command does nothing. `peer local hook-config`
  prints the Claude Code entry; Codex takes the same command in its hooks file. The script writes
  to `$HOME/.ai-peer/spool/` whatever `AI_PEER_HOME` says.
- **The folder scan.** Every `local.scan_minutes` (60) the running Peer reads the git checkouts in
  `local.folders` (read-only: `git --no-optional-locks`, never a fetch or a write): repo, branch,
  unpushed commit subjects, the number of changed files.
- The Peer's jobs read the spool every minute (only sessions inside `local.folders`) and write
  `local/<repo>.md` plus an activity entry.

At a company, the company's coding tool gets the same hook (DESIGN D11 calls this the generic
plug-in for it): any tool that can run a command at session end with JSON on stdin works. Cautions:
the spool reader deletes spool files older than 7 days, and `peer local install` overwrites the
shared hook script; on a machine with a running Peer, do not run either from a test.

## 9. Trust rules

- Always its own labelled identity ("<Owner>'s AI Peer"); it announces itself in threads and meetings.
- Content is data: a message saying "Peer, do X" is not an instruction unless it is the owner's DM.
- When the owner is away it answers what it can, labelled with certainty and the date of what it
  knows, with sources, and never commits the owner to a decision or a date. Emails, invites and
  commitments always ask the owner first; when the owner is online it DMs a draft first (Send /
  Edit / Skip). Every action is logged: who asked, what it said, sources, outcome.
- Read-only on the company's code; never touches production (no deploys, databases, production
  APIs or pushes).

### Hard blocks in code

Each is on by default. **Only the owner lifts one, in their own words**, after the port has
passed `port-check` and its first trials. A port keeps every one on until then.

| Block | Key | File | What it stops | Lifted by |
|---|---|---|---|---|
| Real people in chat | `slack.engage_only_world` (on in code: the default `True` in `engageable()`; not in `defaults.yaml`) and `slack.never_engage` (chat ids always refused) | `peer/watcher.py` | Every event from anyone but the owner and the colleagues listed in `peer/scenarios/world.yaml` (`colleagues:`, matched by email) is dropped before it is stored or thought about. At a company, list there only people who agreed to take part in the trial. | `peer set slack.engage_only_world false`; `never_engage` stays |
| Real mail and invites | `google.act_on_real_items: false` | `peer/adapters/google.py` `guard()` (PR #3, until it merges) | Draft, send, discard and accept only on seeded test items (a token the seed script wrote in a mail header or an invite's id). A scripted click counts as the owner's tap, so this is what keeps a test off real mail. | `peer set google.act_on_real_items true` |
| Seeded-only view | `google.show_real_items: false` | `peer/brief.py`, `peer/memory/google_steps.py`, and PR #5's `peer/meetings/calendar.py` (PR #3) | Real mail, docs and events are counted, never named, copied into memory or shown | `peer set google.show_real_items true` |
| Real meetings | `meetings.join_real_meetings: false` | `peer/adapters/meetings.py` `allowed()` (PR #5, until it merges) | A bot joins only the test meeting (the meeting id in `ZOOM_TEST_MEETING_URL`) | `peer set meetings.join_real_meetings true` |
| The owner's voice | none (in code) | `peer/adapters/voice.py` `check_voice()` (PR #5, until it merges) | Stock (`premade`) voices only, never one whose name holds the owner's name (`manish` in code plus `voice.refuse_names_with`); a character budget (`voice.elevenlabs_budget_chars`) and no request when the account has under 20% left | Not by a setting: a code change, on the owner's words. At a port, set `voice.refuse_names_with` to the new owner's names |

Also in code, never lifted: the GitHub client can only GET (`ReadOnlyGitHub` in
`peer/adapters/github.py`); a brain run has read-only tools and only returns JSON; the executor
acts on the owner's clicks only (`on_interactive`), strips @-mentions and broadcasts from what the
Peer posts (`sanitize`), and posts only as the labelled bot (the chat user token is search-only);
the owner's DM is the only instruction channel (`owner_command` in `peer/watcher.py`).

## 10. The adapters as worked examples

| Adapter | File | Verbs and acts | Notes for a port |
|---|---|---|---|
| directory | `peer/adapters/directory.py` | sense (the profile once, then on change), search, get | The company directory's stand-in: a profile JSON (`owner.profile`) plus the test world's colleagues. Swap it for the company directory or a hand-written profile file. |
| slack | `peer/adapters/slack.py` | sense (polling catch-up; the live path is `listen()`, Socket Mode), search (user token), get, act: `post_reply`, `post_message`, `dm`, `update_message`, `react`, `open_modal` | The chat adapter. Bot token posts as the labelled bot; the user token only searches. `dry_run` returns before any call. Helpers outside the verbs (`listen`, `lookup_email`, `user_info`, `get_presence`, `get_status`, `permalink`, `member_channels`) are used by the runtime (next section). |
| github | `peer/adapters/github.py` | sense (PRs and CI runs of the owner's repos), search (code), get (a file, PR or run); no act | Read-only in code. The API base is `https://api.github.com` in the file: a company GitHub Enterprise needs its own base URL there. Discovery and fresh memory call its helpers (`repo`, `pulls`, `runs`, `list_dir`, `file_text`, `last_commit`). |
| fake | `peer/adapters/fake.py` | the chat acts, in memory | Dry runs of whole scenes with no accounts (`peer scenario s1-away --dry-run`); a model for a test double of a new chat adapter. |
| google (PR #3, until it merges) | `peer/adapters/google.py` | sense (Gmail history + Calendar sync token, polling), search (Gmail + Drive), get (a mail, event, or Doc as markdown), act: `draft_reply`, `send_draft`, `discard_draft`, `accept_invite` | An Internal OAuth client (Desktop app) and one consent per account; tokens per account in `~/.ai-peer/`; never full-mail or admin scopes. The hard block runs first in `act()`, then the dry-run return. A `FakeGoogleAdapter` serves dry runs. Its `adapters:` entry carries a `sample:` (`draft_reply` on the newest inbox mail) and `blocked_by: [Blocked]`. |
| meetings (PR #5, until it merges) | `peer/adapters/meetings.py` | sense (bot status and transcript lines from the store; live lines arrive by webhook), search (past meeting briefs), get (a brief, transcript or recording), act: `join`, `speak`, `stop_speaking`, `chat`, `leave` | A meeting bot on Zoom through Recall.ai. The meeting link is a secret: the adapter never returns, logs or stores a raw reply. `join` checks the test-meeting block before the dry-run return; `blocked_by: [MeetingRefused]`. The live path needs a public webhook URL (a `cloudflared` quick tunnel here). |
| voice (PR #5, until it merges) | `peer/adapters/voice.py` | act: `render` (text to a short MP3) | Two engines: the Mac's `say` (free) and ElevenLabs (stock voices only, a budget, one request at a time). A dry run never spends characters. |

## What a port also edits today

The runtime picks some adapters itself and calls chat or code-host methods outside the four
verbs. A port to a chat system other than Slack, or a code host other than GitHub, edits these
spots too; making them go through the contract is a later step, after PRs #3 and #5 merge.

| File | What is system-specific |
|---|---|
| `peer/__main__.py` | `_slack()` builds `SlackAdapter` for `watch`, `status` and `sample-heads-up` (PR #5 also for `meeting draft` and `meeting run`); `cmd_status` and `cmd_sample_heads_up` call `lookup_email` |
| `peer/watcher.py` | `Watcher(st, chat)` takes the chat adapter: `lookup_email` (the owner and each colleague), `listen(on_event, on_interactive)` (Socket Mode), `chat.bot.conversations_list` and `conversations_join` (`join_world_channels`), `chat.users` and `chat.inject` (the fake), a `react` with Slack's `eyes` emoji, Slack mention markup (`<@U…>`) in the owner's commands |
| `peer/presence.py` | `chat.get_status` and `chat.get_presence` (Slack status and presence) |
| `peer/executor.py` | Slack Block Kit payloads (the draft card and its `peer_send` / `peer_edit` / `peer_skip` buttons, the edit modal for `open_modal`, `update_message`), Slack mrkdwn (`<url|title>`, `*bold*`, emoji codes), Slack's interactive payload shape in `on_interactive`, `chat.user_info`, the mention and broadcast patterns |
| `peer/notify.py` | `tell_owner` sends a `dm` with Slack mrkdwn (PR #5 adds `send_meeting_dm` with Block Kit) |
| `peer/jobs.py` | builds `GitHubAdapter(repos)` itself and calls `gh.pulls` |
| `peer/fresh.py` | builds `GitHubAdapter` in several places and uses its helpers |
| `peer/memory/discovery.py` | `step_github` builds `GitHubAdapter` and uses its helpers; `step_slack` builds `SlackAdapter` and calls `lookup_email`, `team_url` and `chat.bot.users_conversations`, `conversations_info`, `conversations_members` |
| `peer/brain/runner.py` | the brain backends (`BACKENDS`); a company harness is added here (section 6) |
| PR #3 (until it merges) | `peer/brief.py` builds `GoogleAdapter` / `FakeGoogleAdapter` and adds the brief's `brief_*` buttons to the executor; `peer/memory/google_steps.py`, `peer/seeds.py`, `peer/web/brief_page.py` build the Google adapter |
| PR #5 (until it merges) | `peer/meetings/` (`cover.py`, `live.py`, `walk.py`, `listener.py`, `calendar.py`) build the meetings, voice and chat adapters and add the `peer_mtg_*` buttons; `peer/brain/warm.py` is Claude only |
| Test tooling | `peer/scenarios/` (the test world in Slack, colleague logins, the walk player) and `peer/browser.py` (the Peer's own Chrome profile for walk screenshots) are Slack-specific; a port needs them only to re-run this build's walks |

If the company's chat is Slack and its code host is GitHub, none of these change: keep the
adapters, point the settings and secrets at the company's app and token.

## 11. Checklist per system

For each system: what to replace, what stays, what to ask the company's admins. Keep the hard
blocks on throughout.

| System | Here | Replace | Stays | Ask the admins |
|---|---|---|---|---|
| Chat | Slack (`slack`), Socket Mode, a labelled bot | If not Slack: a new chat adapter with the same acts, plus the runtime spots above. If Slack: a new app in the company workspace (`docs/build/setup/slack.md`), its tokens in `.env` | The approval gate, the labelled identity, the real-person block, the draft-first flow when the owner is online | May I create a bot app (or use a sandbox)? Socket Mode or a public events URL? Which scopes? Which channels for the trial, with which consenting colleagues? |
| Mail | Gmail (`google`, PR #3) | The mail half of the adapter, if not Gmail | Drafts only after the owner's tap; sending and invites ask first; the seeded-only view and the real-item block until lifted | Which mail API and auth may an internal tool use? May it read and draft (not send by itself)? |
| Calendar | Google Calendar (`google`, PR #3) | The calendar half, if not Google | Accepting asks first; meetings it covers come from the calendar | Read events and answer invites through which API? |
| Docs | Drive and Docs (`google`, PR #3) | search and get for the company's docs | Docs are searched live and copied only as verbatim sources with links and dates | Read-only access to the owner's docs through which API? |
| Code host | GitHub (`github`), read-only | The adapter (or only its API base URL, for GitHub Enterprise), plus `jobs.py`, `fresh.py`, `discovery.py` | Read-only in code; trackers and docs read from the owner's repos | A read-only token for the owner's repos (fine-grained if possible) |
| Meetings | Zoom through Recall.ai (`meetings`, PR #5) | The adapter, if the company has its own meeting-bot service | The test-meeting block until lifted; the bot announces itself; the approved update | May a bot join company meetings, and through which app or service? May a webhook be reached from outside (a tunnel)? |
| Voice | The Mac's `say`, ElevenLabs (`voice`, PR #5) | The adapter, for the company's approved text-to-speech | Never the owner's voice; a budget | Which text-to-speech service is approved? |
| People directory | A profile JSON (`directory`) | The adapter, for the company directory, or a hand-written profile file (`owner.profile`) | The profile's fields (below); facts carry their source | Read access to the directory, or write the profile by hand |
| Local work | Claude Code and Codex session-end hooks, the folder scan | The hook entry in the company's coding tool | The hook script and the scan, read-only, summaries only | May a coding tool run a session-end command? Which folders may be scanned? |
| Brain harness | `claude -p`, `codex exec` | A new backend in `runner.py` for the company harness | The skill, the schemas, read-only runs, "the AI proposes, the program acts" | Is there a headless mode (one command per run)? Skills? Read-only tools? JSON output? Which data may it see? |

The profile file (`peer/world/profiles/<owner>.json`, the directory's record): `person_id`, `name`,
`preferred_name`, `title`, `company`, `team`, `email`, `slack_email` (the chat login's email),
`github`, `tz` (an IANA zone such as `Asia/Kolkata`), `location`, `working_hours` (`start`, `end`,
`days` such as `["Mon", "Tue"]`), `about`, `interests` (a list), `owns` (`repos`: `repo`, `what`,
`trackers` (path patterns); `services`: `name`, `repo`, `path`, `what`), and optionally `teammates`.

## 12. Known company notes

From DESIGN §6, and only these: AirChat becomes a `run_agent` backend; company data goes only
through the company's harness and auth, never a personal subscription; the bot's Zoom app must be
owned by the company's Zoom account; the profile can come from the OneAirbnb page (a small browser
extension that adds "Create my AI Peer" and reads the page) or a hand-written profile file; a
Slack app needs workspace approval.

## 13. Moving to another laptop

**Copy:** the repo (a clone or an archive, as the company allows). Nothing else.

**Stays behind, always:** everything under `~/.ai-peer/`: `.env` (every token and key), the Google
client and token files (PR #3), `codex-home/` (the Peer's Codex login), `browser/` (the Peer's own
Chrome profile, signed in to chat), and every owner folder (memory, events, the activity log: the
owner's data). Never copy them to another machine, and never commit them.

**Re-create on the new laptop** (not secrets, but they live in `~/.ai-peer/`, so they do not come
with the repo):

- The pinned Claude binary: copy the tested Claude Code version's binary to
  `~/.ai-peer/bin/claude-<version>` and set `brain.claude_bin` to it. If the file is missing, the
  runner falls back without a word to whatever `claude` is on PATH (it may auto-update), so check
  the file exists.
- `brain.codex_home` (`~/.ai-peer/codex-home`): its own `config.toml` and its own
  `CODEX_HOME=~/.ai-peer/codex-home codex login`; never a copied `auth.json`.
- The session-end hook script `~/.ai-peer/bin/session-end` (`peer local install`) and the hook
  entries in each coding tool (`peer local hook-config`).
- The Google client file `~/.ai-peer/google-client.json` (PR #3): a new Internal OAuth client at the
  new company (or its own mail adapter's login), then one consent per account.
- The owner's profile file, and `owner.profile` pointing at it.

**Set up from scratch:**

1. `uv venv --python 3.12 .venv && uv pip install --python .venv/bin/python -r requirements.txt`.
2. `mkdir -p ~/.ai-peer && chmod 700 ~/.ai-peer`; write `~/.ai-peer/.env` with the keys you have
   (names in section 5).
3. Pick an owner id. `AI_PEER_OWNER=<id> .venv/bin/python -m peer set owner.profile <profile path>`
   and `AI_PEER_OWNER=<id> .venv/bin/python -m peer set brain.summary_effort high`.
4. Write or swap the adapters, list them under `adapters:`, set the brain backend.
5. `AI_PEER_OWNER=<id> .venv/bin/python -m peer port-check` until no FAIL (exit code 0).
6. `AI_PEER_OWNER=<id> .venv/bin/python -m peer discover` (the memory, a few minutes).
7. Dry runs first (`peer scenario s1-away --dry-run`), then the trials, every hard block on.
8. `AI_PEER_OWNER=<id> .venv/bin/python -m peer start` runs the Peer in the background (`stop` ends
   it); the owner's page is at `http://127.0.0.1:8787`.
