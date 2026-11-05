# peer: the generic AI Peer

A personal AI teammate that watches its owner's work sources, brings what matters, and
covers for the owner when away, always labelled as AI. Design: `docs/build/DESIGN.md`.

## Run it (this Mac)

```bash
cd ~/repos/ai-peer-wp1            # or the main checkout after merge
uv venv --python 3.12 .venv && uv pip install --python .venv/bin/python -r requirements.txt
.venv/bin/python -m peer discover          # memory from the profile + GitHub (about 3 min)
.venv/bin/python -m peer watch             # the Peer on Slack + the page at http://127.0.0.1:8787
```

Setup from the page: open http://127.0.0.1:8787/setup and click "Create my AI Peer" (a test owner:
`AI_PEER_OWNER=<id> .venv/bin/python -m peer web --port 8788`). More: `peer refresh [--nightly]`, `peer local
scan|install|hook-config`, `peer tune "<feedback>"`, `peer scenario f2-correction|f3-roles|f5-tuning|f6-fresh|f7-local --dry-run`.

Secrets: `~/.ai-peer/.env` only. Runtime data (memory, events, log): `~/.ai-peer/<owner>/`.

## Try S1 (Slack cover)

- Away: in Slack, DM the AI Peer `away` (or run `peer away`), then a colleague asks in a
  channel about your work ("who is driving Telugu, and is it shipping this month?"). Within
  about two minutes the Peer answers in the thread, with sources and dates, and tells you in
  your DM. DM `back` when you return.
- Online: DM `online` (or `peer online`). The Peer DMs you a draft with Send / Edit / Skip;
  Send posts it in the thread as "Manish's AI Peer".
- Scripted: `peer scenario s1-away` / `peer scenario s1-online` (the Peer must be running);
  `--dry-run` plays it on a fake Slack with the real brain.

## Pieces

| Path | What |
|---|---|
| `adapters/` | The contract (`sense`, `search`, `get`, `act`) and the `fake`, `directory`, `github` (read-only), `slack` adapters. A company port replaces these. |
| `watcher.py` | Always on, no AI: intake, cheap relevance rules, per-thread debounce. |
| `brain/` | `run_agent(prompt, schema)` on Claude Code or Codex (`peer set brain.backend codex`); the `peer-brain` skill. |
| `executor.py` | Approval gate (online: draft first; away: answer), idempotency, safety, activity log. |
| `presence.py` | Manual switch, Slack status and presence, working hours. |
| `memory/` | Layout and the first discovery. |
| `scenarios/` | The test world (`world.yaml`), scenes, the player, the colleague setup. |
| `web/` | The owner's page in the film's look: `/setup` (one-click setup, F1), `/learned` (what it learned, with corrections, F2), `/settings` (roles, scope, the away switch, F3), `/activity` (F4). `layout.py`: the frame and nav other packages add to. |
| `memory/discovery.py` | Discovery as steps (profile, team, GitHub, projects, Slack, people, docs, calendar) with live progress; `register_step()` for new sources. `memory/facts.py`: facts with source and date, corrections. |
| `fresh.py`, `jobs.py` | Fresh memory (F6): tracker changes re-copied on the 15-minute poll (no AI), nightly re-read; the background jobs inside the Peer. |
| `tuning.py`, `notify.py` | Self-tuning (F5): owner feedback becomes a rule in `rules.md` plus a mute; every push to the owner goes through `notify.tell_owner()`. |
| `localwork.py`, `local_hook.sh` | Local work (F7): session-end hooks spool to `~/.ai-peer/spool/`; the hourly read-only scan of `local.folders`. |
