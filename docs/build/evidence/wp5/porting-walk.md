# WP5 evidence: the porting walk

Written by `ai-peer-wp5-1`. Times UTC, 6 Nov 2026.

## The walk: PASSED (20:24 to 20:35)

A fresh sub-agent (general-purpose, Claude Opus 5.5, never shown this repo) added a toy adapter for an
invented company chat system, "teamchat" (one local JSON file), and got it into `port-check` with all
four verbs passing, from the porting guide alone.

- **Its folder:** a plain export of the committed branch at `40ec3ff` (`git archive` of `peer/`,
  `requirements.txt` and `docs/porting-guide.md`: 52 files; no `.git`, no `docs/build/`, no `film/`, no
  `AGENTS.md`) in this session's scratch folder under `/private/tmp`, outside `~/repos`.
- **Its fixed preamble**, word for word in its prompt: "every command starts with `cd <export path> &&
  AI_PEER_HOME=<export path>/home AI_PEER_OWNER=wp5toy ~/repos/ai-peer-wp5/.venv/bin/python -m peer ...`
  (its shell goes back to your folder on every call; with that `AI_PEER_HOME` it has no secrets, so
  nothing reaches a real system); the only `peer` command it runs is `port-check --adapter teamchat`; it
  writes only inside the export; no git, no Telegram, no messages to other sessions; it never opens
  `~/.ai-peer/` or `~/repos`." (with the real export path filled in).
- **It took** about 11 minutes, 15 tool calls, 131k tokens. `port-check` passed on its first run.
- **What it changed** (checked by me with `diff -r` against a second, untouched export): a new
  `peer/adapters/teamchat.py` (231 lines: all four verbs; acts `post_message`, `post_reply`, `dm`,
  `react`; a hard block `teamchat.blocked` that runs before the dry-run return; atomic writes; one write
  per idempotency key), one `teamchat:` entry under `adapters:` and a `teamchat:` settings block in
  `peer/defaults.yaml`, and under `home/` the toy's data (`teamchat.json`: 4 users, 3 channels, 6
  messages) and the test owner's `settings.yaml` (made by the first run). **Nothing outside the
  adapters and settings.**
- **Re-run by me** in the export at 20:37 with the same prefix (`PYTHONDONTWRITEBYTECODE=1` added),
  exit code 0:

```
adapter   caps  check    sense         search          get      act
teamchat  ok 7  ok 0.0s  ok 5 ev 0.0s  ok 3 hits 0.0s  ok 0.0s  ok post_message 0.0s

teamchat: offers get, search, sense; act: dm, post_message, post_reply, react
  check: teamchat.json: 3 channels, 6 messages
  search: query 'release'

result: 1 checked, 0 not on main yet, 0 with a FAIL
```

- `git status` in `~/repos/ai-peer-wp5` was clean afterwards. The export was deleted; the toy adapter
  never merges.

**Its rule notes, and my call.** Besides `port-check` it ran one plain Python script, in the export with
both variables, that tested its real writes on a throwaway copy of its JSON file (deleted after), and it
deleted the `__pycache__/` folders Python had written. Everything stayed inside the export, with no
secrets and no real system; I count it within the rules' intent ("it writes only inside the export").

## What it looked up outside the guide

Only `peer/defaults.yaml`, which the guide tells it to edit. No other code was opened.

## Gaps it found, and the guide fixes they led to

| # | Gap (its words, shortened) | Fix in `docs/porting-guide.md` |
|---|---|---|
| 1 | No payload keys or meaning of `target` per action; which `extra` keys the runtime reads; port-check runs only the sample, so a mismatch with what the executor sends would still pass | New subsection "A chat adapter for this runtime": each act the runtime sends (target, payload, what it reads back), the event kinds and `extra` keys, the methods it calls besides the verbs (`lookup_email`, `user_info`, `get_presence`, `get_status`, `listen` and Slack's interactive payload shape) |
| 2 | Is the merge deep? Does a new `adapters.<name>` reach an owner whose `settings.yaml` exists? A defaults entry is listed for every owner | Step 4 and the §5 trap: the merge is deep; a defaults entry reaches every owner; a trial adapter goes in one owner's `settings.yaml` |
| 3 | How code gets `AI_PEER_HOME`; the type of `st.owner_dir`; what a relative path is relative to | The `from_settings` row: `peer.settings.PEER_HOME`, `st.owner_dir` (a `Path`), `st.profile_path()` (repo root), `st.path()` (expands `~`, relative stays relative) |
| 4 | Is an empty `sense(None)` or search ok or n/a? | §4 legend: an empty list is ok (`0 ev`, `0 hits`); get is n/a when nothing gave a ref |
| 5 | "port-check writes nothing anywhere" is not quite true (the owner's `settings.yaml`, `__pycache__/`) | §4: nothing to any system; locally the owner's folder on a new owner and `__pycache__/` (`PYTHONDONTWRITEBYTECODE=1`); it prints counts, never content |
| 6 | No example `at` value | §3: `now_iso()` gives `2026-11-06T20:34:20+00:00` |
| 7 | Who drops the Peer's own posts? | §3: `sense` drops its own bot's and other bots' posts; the watcher then applies the real-person block |
| 8 | The §4 act row omits the `idempotency_key` | §4: the full call, `act(action, target, payload, "port-check:<name>:<action>", dry_run=True)` |
| 9 | Does the base `Blocked` need `blocked_by:`? | §3: no; google's entry names its own class, also called `Blocked` (PR #3 predates the base one) |
| 10 | The skeleton's `get()` raises on a malformed ref; the contract says `{}` | The skeleton returns `{}` for a ref that is not its own (re-checked: the skeleton still passes `port-check`) |
| 11 | Does the real-person block hold for a new chat system's people? | The new subsection: the block admits only ids found through `lookup_email`; `actor` must be that id; without `lookup_email` it fails closed |

Also found while reading its report: `port-check` counts a declared verb that raises `NotOffered` as a
FAIL (an undeclared one is n/a); §3 now says so.

The fixes are additive; the guide was not walked a second time (each walk costs about 130k tokens).
