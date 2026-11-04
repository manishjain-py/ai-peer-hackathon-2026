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
| `web/` | The activity log page. |
