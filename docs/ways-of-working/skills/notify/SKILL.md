---
name: notify
description: >-
  Send Manish a Telegram message. Two destinations. The ATTENTION group
  ("Attention Learnlikemagic", tg-attention.sh) is only for what needs him or
  that he must not miss: a question for him, an input or decision needed, a
  blocker, a major update such as an initiative finished. Send those there
  yourself, in one or two lines, before you end the turn. Everything else goes
  to the mj_claude chat (tg-notify.sh), which is also where the automatic
  "Your turn" ping lands when a session sits idle waiting on him. Use this skill
  when he says ping / text / message / notify / let me know on Telegram, when
  you need his answer and he may be away, when you are blocked, or when a big
  piece of work is done.
---

# Notify Manish (Telegram)

Manish kicks off work and walks away. Two Telegram destinations reach him; the bot
is `mj_claude_bot` in both.

| Destination | Chat id | Script | What goes there |
|---|---|---|---|
| **Attention Learnlikemagic** (group) | `-5506416790` | `tg-attention.sh` | A question for him; an input or decision needed; a blocker (the work cannot go on without him); a major update (an initiative finished, something shipped, something broke) |
| **mj_claude** (his chat with the bot) | `7727757663` | `tg-notify.sh` | Everything else: routine progress, a step done, FYI, factory reports, and the automatic idle ping |

He reads the Attention group first, so it must stay quiet: when unsure, it is
routine. Never send the same message to both.

## Send it yourself (explicit)

```
bash ~/.claude/skills/notify/scripts/tg-attention.sh "❓ learnlikemagic: merge the policy PR now, or wait for the chapter run? I recommend waiting. Session ci-cost."
bash ~/.claude/skills/notify/scripts/tg-notify.sh "ch5 explain deck imported (112 cards)."
```

Multi-line is fine (quote it, or pipe via stdin). Both read the bot token from
`~/.claude/channels/telegram/.env` and post to the Telegram Bot API, so they work
in any session, with or without the Telegram plugin.

Send to Attention, before you end the turn, when:

- you ask him something or need a decision, an approval or an input from him;
- you are blocked and cannot go on without him;
- a major piece of work is finished (an initiative, a build, a release), or
  something he relies on broke.

## Automatic (no action needed)

A `Notification` hook in `~/.claude/settings.json` (`hooks.Notification` →
`notify-hook.sh`) fires when a session has sat idle about 60 seconds waiting for
him (`notification_type: idle_prompt`). It sends the reply's `## TLDR` (or, with
no TLDR, the start of the reply):

- to **Attention**, as `❓ Needs you — <repo>`, when the reply asks him something
  or says it is blocked (a question mark in that text, or words such as "need
  your", "your call", "blocked", "cannot proceed");
- otherwise to **mj_claude**, as `🔔 Your turn — <repo>`.

A question dialog (`AskUserQuestion`) still waiting for him also goes to
Attention, with the question as the text, when Claude Code raises a notification
for it (built and dry-run tested; not yet seen live, so when you ask through
that dialog and he may be away, send the question to Attention yourself too).

It de-dupes per session, never fails a session (always exits 0; a silent no-op
without the token or `jq`), and does nothing when `CLAUDE_NO_IDLE_PING=1`.
`NOTIFY_HOOK_DRY_RUN=1` makes it print its decision instead of sending. The
hook cannot tell a major update from a routine one: send those to Attention
yourself.

## What to say

Phone-glanceable, one or two lines: `❓ / ⚠️ / ✅` + what you need or what
happened + which repo, branch or session to return to. For a question, give the
options and your recommendation, so he can answer in a word.

> ⚠️ learnlikemagic: #537 is green but I am holding the merge, your overnight
> chapter run is in flight and a deploy would break it. Nothing needed now.

Not a wall of logs; not "task complete" with no where or what.

To **attach a file** (report, screenshot) use the plugin tool when its channel is
connected in the session: `mcp__plugin_telegram_telegram__reply` with `chat_id`,
`text`, `files: ["/abs/path"]`. Otherwise the Bot API by curl (`sendDocument`,
`sendPhoto`).

## Setup facts (reference / recovery)

- `7727757663` is Manish's paired id (`allowFrom[0]` in
  `~/.claude/channels/telegram/access.json`). `-5506416790` is the group
  "Attention Learnlikemagic"; the bot was made an admin there on 2026-10-01 and
  posting was tested that day. `ATTENTION_CHAT_ID` overrides it.
- Bot token: `~/.claude/channels/telegram/.env` (`TELEGRAM_BOT_TOKEN=`), machine-LOCAL
  (not synced). `settings.json` and this skill sync through `~/claude-config`, so
  the hook reaches the other Macs; each needs its own Telegram plugin configured
  for pings to send from it.
- `tg-notify.sh` has a copy in the learnlikemagic repo
  (`.claude/skills/ship-chapter/scripts/tg-notify.sh`) that the factories call:
  keep the two identical. `tg-attention.sh` only wraps it, so it needs no copy.
- The hook takes effect in sessions started AFTER a change to `settings.json`;
  a change to the hook script itself applies at once.
- Do NOT edit `access.json` or approve pairings here: access is owned by the
  `/telegram:access` skill, run by Manish himself.
