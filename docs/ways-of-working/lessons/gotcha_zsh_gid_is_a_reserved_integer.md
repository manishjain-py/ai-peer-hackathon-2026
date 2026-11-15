---
name: gotcha-zsh-gid-is-a-reserved-integer
description: "In zsh `GID` (like UID, EUID, EGID) is the shell's group-id INTEGER: `GID=$(…a uuid…)` fails 'bad math expression' before the next line runs. Claude's Translate settle (WT:1207) does exactly this; Claude agents on the Mac re-run it silently, a faithful Codex worker does not"
metadata:
  node_type: memory
  type: project
  originSessionId: aa8f9afb-24e8-412b-a5b5-c1178acd551d
  modified: 2026-10-28T18:06:27.421Z
---

Found 2026-10-28 in the Codex Translate copy rehearsal (`codex-translate-g5evsncert-ch10-2026-10-28-c`): every audio
settle WT builds is `GID=$(python -c …guideline_id…)` then `audio_settle.py --guideline-id "$GID"`. Under zsh (the
shell of Claude Code's Bash tool AND of Codex workers on this Mac) the assignment is evaluated as arithmetic
("bad math expression: operator expected at `f0357fe7e8...'"), so the settle never runs, the next synth gets 409
`stage_running`, and practice/Revise audio and the board cue stamp are skipped. bash has no `GID`, so cloud (Linux)
runs never meet it. Claude's three Mac Translate runs each hit it and the agent re-ran it under bash by itself
(g1math transcript in `workflow-obs/…/transcripts/audio-settle:…:translations.jsonl`), which hid the bug.

**Why:** a Claude agent's improvisation hides a Claude-side bug that a "run exactly this" worker exposes.

**How to apply:** never name a shell variable `GID`, `UID`, `EUID` or `EGID` in a zsh command; read ids in Python (as
Explain and Visuals already do, WE:1892, WV:1565). Before calling a Codex failure Codex's own, read Claude's
transcripts for the same step. The lab maps it with a `runner/instructions.md` line (one bash re-run after a zsh error
before the script runs, `f09b324b`); the Claude-side fix waits for Manish (lab STATE.md Needs Manish 42). Related:
[[project-codex-factories-adapter]], [[gotcha_zsh_path_variable_is_PATH]].
