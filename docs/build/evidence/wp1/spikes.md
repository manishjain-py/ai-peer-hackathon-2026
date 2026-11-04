# WP1 spikes: results

Run by `ai-peer-wp1-1` on 2026-11-04 (UTC), Mac-48-GB. Raw outputs trimmed of paths and ids.

## 1a `claude -p` runs a skill from the Peer's own folder: PASSED (14:47)

- Version **Claude Code 2.1.318** (native install). The Peer pins a copy of that binary
  (setting `brain.claude_bin`); the global install keeps auto-updating for Manish.
- Skill at `<peer folder>/.claude/skills/<name>`, a **symlink** into the repo: it loads
  (Claude follows the link). Invoked as `/<skill-name> <request>` at the start of the prompt.
- Working flags (cwd = the Peer's folder, stdin = /dev/null, env `CLAUDE_NO_IDLE_PING=1`):

```
claude -p "/peer-brain …" --output-format json --json-schema '<schema>'
  --setting-sources project --settings '{"autoMemoryEnabled":false,"disableAllHooks":true}'
  --strict-mcp-config --mcp-config '{"mcpServers":{}}'
  --tools "Read,Grep,Glob,Skill" --allowedTools "Read,Grep,Glob,Skill"
  --permission-mode dontAsk --model opus --no-session-persistence
```

- The answer is in the result's `structured_output` (schema-valid). About 6 s, `apiKeySource: none`
  (the subscription login). Init event: [spike-1a-init.json](spike-1a-init.json): tools Glob, Grep,
  Read, Skill, StructuredOutput; `mcp_servers: []`; only built-in plugins; none of Manish's skills.
- **What leaks, and the block** (canary: "does your context tell you to end replies with a TLDR,
  and which instruction files were shown to you?"):

| Run | TLDR rule | Instruction files | Manish named |
|---|---|---|---|
| `--setting-sources project` (the Peer's flags) | no | none | no |
| control: `--setting-sources user,project` (hooks and plugins off) | **yes** | `~/.claude/CLAUDE.md` | yes |

  So `--setting-sources project` keeps out his CLAUDE.md, hooks (SessionStart pull, Stop push,
  the Telegram idle ping), plugins (Telegram), user skills, and his `bypassPermissions` default.
  `--settings '{"autoMemoryEnabled":false}'` removes the auto-memory folder (init shows none).
- Each run's stream reports weekly usage (`rate_limit_event`, seven_day utilization 0.34 at 14:47).

## 1b `codex exec` runs the same skill: PASSED (14:53)

- **codex-cli 0.153.4**, model **gpt-6-astra** (the default on his ChatGPT login; `gpt-6.1-sol`
  is refused by this CLI on a ChatGPT account), reasoning effort high.
- **Skills load in `exec`**: `<peer folder>/.agents/skills/<name>` (a symlink; the folder is not a
  git repo), invoked with `$<skill-name>` in the prompt. Output matches `--output-schema`;
  `-o <file>` holds the final JSON.
- **Leak found:** even with `--ignore-user-config`, `codex exec` loads his global
  `~/.codex/AGENTS.md` (controller working agreements) and about 25 user skills from
  `~/.agents/skills` and `~/.codex/skills` (`notify`, `mac-terminal-control`, …). Hooks did not
  run (no new line in the sync log).
- **Block:** the Peer's own Codex home, `~/.ai-peer/codex-home` (a two-line `config.toml`, its own
  `auth.json`), and `HOME=~/.ai-peer/codex-home/home` for the run. Canary then: no AGENTS.md, no
  user skills (only Codex's five built-in ones plus the Peer's skill). Control: a project
  `AGENTS.md` with a canary line is reported, so the canary works on Codex too.
- Working command:

```
HOME=~/.ai-peer/codex-home/home CODEX_HOME=~/.ai-peer/codex-home \
codex exec "\$peer-brain …" --output-schema <file> --sandbox read-only --ephemeral \
  --skip-git-repo-check -C <peer folder> -o <out file>   < /dev/null
```

- **Auth:** the Peer's `auth.json` is a copy of his ChatGPT login; its access token is valid to
  2026-11-09 02:25 UTC. A refresh from the copy could rotate his main login, so the Peer refuses
  to run Codex on the copy within 24 h of expiry, and the Peer gets its own login
  (`CODEX_HOME=~/.ai-peer/codex-home codex login`, Manish's hands) before then.

## 1c Slack Socket Mode: pending

Slack app set up by the kickoff session with Manish (`docs/build/setup/slack.md` on `main`).

## 1d Recall bot on Zoom: pending

Needs the Zoom app and the Recall account. Manish's Zoom is a paid Workplace Pro account.
