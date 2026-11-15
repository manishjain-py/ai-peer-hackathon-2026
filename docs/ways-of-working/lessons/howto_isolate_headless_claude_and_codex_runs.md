---
name: howto_isolate_headless_claude_and_codex_runs
description: "A script's headless claude -p or codex exec run loads Manish's global setup (CLAUDE.md, hooks, Telegram plugin, user skills, Codex's global AGENTS.md) unless blocked; the canary-proven flags for each (since 7 Nov Claude also needs CLAUDE_CODE_DISABLE_CLAUDE_MDS=1), and how to test a block"
metadata:
  type: reference
---

**Seen 2026-11-04** (AI Peer build, spikes 1a/1b; evidence in the `ai-peer-hackathon-2026` repo,
`docs/build/evidence/wp1/spikes.md`). Claude Code 2.1.318, codex-cli 0.153.4.

**Claude `-p`** by default loads `~/.claude/CLAUDE.md` (the TLDR rule ends up in the output), the
user hooks (SessionStart pull, Stop push, the Telegram idle ping), plugins (the Telegram MCP
server), user skills and the `bypassPermissions` default. On 4 Nov the flags below blocked all of
it and kept the subscription login (`apiKeySource: none`).

**Since 7 Nov the flags alone let `~/.claude/CLAUDE.md` in** (same pinned 2.1.318, nothing else
changed; canary from two folders, inherited and clean env: the file, its TLDR rule, Manish named).
`CLAUDE_CODE_DISABLE_CLAUDE_MDS=1` in the run's env keeps it out again (canary clean; the login and
project skills still work). `--bare` also skips it but refuses OAuth (API key only). A JSON-schema
run hides the leak; a plain-text run shows his "## TLDR" at the end.

```
CLAUDE_CODE_DISABLE_CLAUDE_MDS=1 claude -p "/<skill> …" --setting-sources project \
  --settings '{"autoMemoryEnabled":false,"disableAllHooks":true}' \
  --strict-mcp-config --mcp-config '{"mcpServers":{}}' \
  --tools "Read,Grep,Glob,Skill" --allowedTools "Read,Grep,Glob,Skill" \
  --permission-mode dontAsk --no-session-persistence --output-format json --json-schema '<schema>'
```

Run it with stdin `</dev/null` (else "no stdin data received in 3s") and `CLAUDE_NO_IDLE_PING=1`.
Project skills in `<cwd>/.claude/skills/` load through a symlink. Effort sets the speed: one
answer run was 113-139 s at `--effort max` and 21-27 s at `high`; pick by the latency budget.

**Codex `exec`:** `--ignore-user-config` is not enough. It still loads `~/.codex/AGENTS.md` (the
controller agreements) and about 25 skills from `~/.agents/skills` and `~/.codex/skills` (`notify`
among them). Isolate with the run's own `CODEX_HOME` (a two-line `config.toml` plus `auth.json`)
and `HOME` (an empty folder). Skills in `<cwd>/.agents/skills/` then load in `exec` (`$skill` in
the prompt; add `--skip-git-repo-check` outside a repo). A copied `auth.json` is a time bomb: a
token refresh rotates the main login, so give the isolated home its own `codex login`.
`gpt-6.1-sol` is refused on a ChatGPT login by this CLI; the default (`gpt-6-astra`) works.

**Prove the block:** a canary prompt on the hardened run ("audit your context: a TLDR rule? which
instruction files? is Manish named?") must come back empty, and a control run that loads the
same config must report it (else the canary itself is unproven). Re-run it after any change, even
on a pinned binary: a block that passed once can stop holding. [[lesson_unexercised_guard]]
