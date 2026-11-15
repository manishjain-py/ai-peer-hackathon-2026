# Ways of working (snapshots of 2026-11-15)

Copied into the repo at Manish's request (V25 in `demo-video/docs/DESIGN.md`) so that a Mac
without his synced `~/claude-config` can still run this project the same way. The living
originals are in `~/claude-config` on his Macs; refresh these copies when they change.

| Here | Original | What it is |
|---|---|---|
| `skills/big-initiative/` | `~/claude-config/skills/big-initiative/` | The controller recipe: one controller, workers per package, STATE.md, hand-offs at 45 to 50% context, usage limits, merging, telling Manish |
| `skills/mac-terminal-control/` | `~/.claude/skills/mac-terminal-control/` | Opening, reading and closing Terminal windows that run Claude sessions (`scripts/mac-term.sh`) |
| `skills/notify/` | `~/.claude/skills/notify/` | Telegram lines to Manish: `tg-attention.sh` (asks and blockers), `tg-notify.sh` (routine); the token stays outside git |
| `lessons/` | `~/claude-config/lessons/` | The shared lessons; `INDEX.md` lists them in one line each |
| `settings-snippet.json` | `~/.claude/settings.json` (a part) | The bypass permission mode the sessions run in, cross-session messages accepted, the idle ping to Telegram; merge it into `~/.claude/settings.json` on a new Mac |
| `manish-global-CLAUDE.md` | `~/.claude/CLAUDE.md` | Manish's global instructions for every session (plain language, a TLDR at the end, routine calls taken by the session) |

Install on a new Mac: `mkdir -p ~/.claude/skills && cp -R skills/* ~/.claude/skills/` from this
folder. A personal skill beats a project skill of the same name, so a Mac that already has them
keeps its own.
