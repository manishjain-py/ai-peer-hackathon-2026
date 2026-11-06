# WP5 evidence: port-check

Written by `ai-peer-wp5-1`. Times UTC.

## The table on this build's adapters (2026-11-06 20:25, test owner `wp5test`)

`AI_PEER_OWNER=wp5test .venv/bin/python -m peer port-check` on branch `wp5-porting`, exit code 0.
Real Slack and GitHub, read-only calls only (Slack's `sense` polls history over the Web API; no Socket
Mode); every `act` in dry run, each adapter's dry-run path read in its code first (Slack's `act` returns
before any call; GitHub and the directory offer no act; the fake records in memory).

```
port-check: owner wp5test, 7 adapters listed in /Users/manishjain/.ai-peer/wp5test/settings.yaml

adapter    caps  check    sense          search           get                   act
directory  ok 3  ok 0.0s  ok 1 ev 0.0s   ok 2 hits 0.0s   ok 0.0s               n/a (no act)
slack      ok 9  ok 0.3s  ok 7 ev 2.5s   ok 20 hits 0.5s  ok 0.6s               ok post_reply 0.0s
github     ok 3  ok 0.5s  ok 17 ev 1.2s  ok 10 hits 0.6s  ok 0.3s               n/a (no act)
fake       ok 9  ok 0.0s  ok 0 ev 0.0s   ok 0 hits 0.0s   n/a (nothing to get)  ok post_reply 0.0s
google     not on main yet (PR #3)
meetings   not on main yet (PR #5)
voice      not on main yet (PR #5)

directory: offers get, search, sense
  search: query 'Telugu'
slack: offers get, search, sense; act: dm, open_modal, post_message, post_reply, react, update_message
  check: bot U0CEP58CTPD in https://learnlikemagic.slack.com/; user token ok
  search: query 'Telugu'
github: offers get, search, sense
  check: rate 4532/5000
  search: query 'Telugu'
fake: offers get, search, sense; act: dm, open_modal, post_message, post_reply, react, update_message
  search: query 'Manish'

result: 4 checked, 3 not on main yet, 0 with a FAIL
```

Pass (the brief's proof): every listed adapter is in the table; every verb is ok, n/a or blocked; no
FAIL. google (PR #3), meetings and voice (PR #5) show "not on main yet": their entries and dry-run
samples are already in `peer/defaults.yaml`, so after those PRs merge only a re-run and docs change.

## Its FAIL paths, proven (6 Nov, about 20:20)

A check that never failed is unproven, so port-check ran once on deliberately broken adapters in a
scratch folder (never in the repo). Each was reported as it should be, and the run exited 1:

| Broken adapter | port-check said |
|---|---|
| a capability `"bogus cap"` | caps FAIL: not a capability |
| `sense` declared but raises `NotOffered` | sense FAIL: declared in capabilities but raised NotOffered |
| a search hit with no `ref` | search FAIL: every hit needs a string `ref` |
| `act` declared but raises `NotOffered` | act FAIL: declared but raised NotOffered |
| `sense` returns a list of strings and an int cursor | sense FAIL: next_cursor must be a string or None |
| `act` raises `Blocked` | act **blocked (ok)** (not a FAIL) |
| acts but has no dry-run sample | act FAIL: no dry-run sample |
| `from_settings` raises (a missing token) | FAIL: cannot start |
| a class that is not an `Adapter` | FAIL: must subclass peer.adapters.base.Adapter |
| a module that does not exist | FAIL: no module (with `pending:` it shows "not on main yet" instead) |
| `enabled: false` | off |
| `--adapter nosuch` | "no adapter 'nosuch' under `adapters:`", exit 1 |

The guide's skeleton adapter (`docs/porting-guide.md`, section 3), copied out of the guide into a
scratch module, passes port-check with no FAIL.
