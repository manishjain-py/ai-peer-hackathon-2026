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

## 1c Slack Socket Mode: partly passed (15:02); the rest folds into the live walk

- The kickoff session set up the Slack app with Manish (`docs/build/setup/slack.md`). The bot
  user is "Manish's AI Peer" (`@manishs_ai_peer`).
- Socket Mode connected at 15:02:46 UTC. The bot DMed Manish a labelled test card with
  Send / Edit / Skip, and replied in that card's thread as "Manish's AI Peer". The listener
  heard its own posts as `message.im` events (Socket Mode delivers events).
- Hearing a person's message and receiving a person's click: no reply or click came in the
  listener's 3 hours (Manish was away). Both are part of the live S1 walk (a colleague's post;
  Send on the draft).

## 1d Recall bot on Zoom, Manish absent: PASSED (2026-11-05 01:55 to 01:59 UTC)

The meeting was on Manish's own Zoom (paid Workplace Pro), "AI Peer test", with the passcode in
the link. Manish was not in the call. Recall (Tokyo region) used its default Zoom bot: no Zoom app
of ours, no OAuth. Two bots, about 1.5 minutes each, about $0.05 in all.

| Step | Result |
|---|---|
| "Manish's AI Peer" bot joins | `in_call_not_recording` 16 s after create, then `in_call_recording` 11 s later, **with no host in the call** |
| Second bot "Ananya Rao (test)" joins and plays its line (MP3, `automatic_audio_output`) | recording at the same moment |
| Peer bot plays its intro (automatic) and an update (`POST /bot/{id}/output_audio/`, 200) | played |
| Transcript (`recallai_streaming`, read after the call from `media_shortcuts.transcript`) | arrived 8 s after the bots left |
| Peer bot's transcript | Ananya Rao (test): "Hi, this is Ananya. Quick question for the pier. Who is driving the Telugu build and when does it ship?" |
| Run 2: the colleague bot's transcript (proves the Peer is heard) | Manish's AI Peer: "Manish's AI peer and AI assistant. Manish can't join this meeting. So I'm here to take notes and share his update. Here is Manish's update. The Telugu planning documents are merged and the first build step is in review." |

What WP4 needs to know:
- "Peer" comes back as "pier": the addressed-detection must accept homophones.
- The first second of an MP3 is clipped ("Hi everyone, I'm" was lost): pad clips with about 1 s
  of silence.
- `output_audio` needs `automatic_audio_output` set when the bot is created.
- The real-time path (`realtime_endpoints`, `transcript.data`) needs a public URL (the
  `cloudflared` tunnel) and is not tested here.
- The voices came from Manish's ElevenLabs library. It holds a voice cloned from Manish ("Manish
  Jain"). The Peer must never use it: the Peer speaks as its own labelled identity (D9).
