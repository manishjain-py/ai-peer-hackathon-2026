---
name: three_machine_setup
description: Manish works across THREE laptops — 48GB Mac (main), 16GB MacBook Air, and a Windows laptop (from 2026-07-24)
metadata:
  node_type: memory
  type: user
  originSessionId: 7835ed32-9dfa-4986-af5b-ab2a525cbc98
---

Manish uses **three** laptops for work, all three active — not one primary + spares. Assume any session could be on any of them; check `hostname` / `uname` before assuming Mac-only tools exist.

| # | Machine | Role | OS |
|---|---------|------|-----|
| 1 | 48 GB Mac (`ManishMacMain`) | main dev; iOS/Xcode; runs the scheduled jobs if any are re-enabled | macOS |
| 2 | MacBook Air 16 GB (M4, 2026) | second Max account, concurrent/background work | macOS |
| 3 | Windows laptop | arrived 2026-07-24; third Claude subscription | Windows 10/11 **native, NO WSL** |

**Machine 3 is deliberately native Windows, no WSL** — Manish's reason: he does not want an extra Linux layer to think about. Do not propose WSL as a fix; work within native Windows + Git Bash instead.

**All three share one Claude brain.** Same `~/claude-config` repo → same global `CLAUDE.md`, `settings.json`, user `commands/`, user `skills/`, and `memory/`. Shared memory across all three is a **hard requirement** Manish stated explicitly. See [[two_machine_claude_sync]] for the sync architecture and its failure modes, and [[windows_machine_setup]] for how Windows joins it.

**What the Windows machine cannot do** (never promise these on machine 3): iOS/Xcode builds, anything via `osascript` (Mail.app email reports, the `mac-terminal-control` skill), Docker Desktop without WSL2. Telegram notify works everywhere; use it instead of email.

Each machine logs into its **own** Claude account — logins live in the OS credential store and are deliberately not synced.

**2026-10-04: a fourth Mac appeared, a 36 GB MacBook M3 Pro (`Manish-Macbook-36-GB`, macOS 26.6.2),** set up
that morning with Migration Assistant (the Codex factories handoff recorded a pause "for Mac Migration
Assistant" at 08:44 IST). It carries `ANTHROPIC_MODEL=opus[1m]` (which resolves to Opus 5.5 there), the repos,
venvs, Homebrew, `~/.aws` and `~/claude-config`. Not yet recorded: which machine it replaces, and whether
it takes over the 48 GB Mac's role. Ask before assuming. Its first factory run was g4evs ch9 the same day
([[gotcha-migrated-mac-loses-playwright-browsers]]).
