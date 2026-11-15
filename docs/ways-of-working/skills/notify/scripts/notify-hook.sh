#!/usr/bin/env bash
# notify-hook.sh — Claude Code "Notification" hook.
#
# Wired in ~/.claude/settings.json under hooks.Notification. Claude Code runs it
# on notifications and passes a JSON payload on stdin. We act when Claude is
# waiting on Manish and he has stepped away:
#   - "idle_prompt" / "agent_needs_input": Claude finished and nobody answered;
#   - "permission_prompt", only when the pending call is an AskUserQuestion
#     dialog (a question for him). Tool approvals stay silent, as before.
# The ping carries the reply's "## TLDR" (or, with none, the start of the reply).
#
# Two destinations (see ../SKILL.md):
#   - the Attention group, when the reply asks him something or says it is
#     blocked: "❓ Needs you — <repo>";
#   - the mj_claude chat otherwise: "🔔 Your turn — <repo>".
#
# NOTIFY_HOOK_DRY_RUN=1 prints the decision and the message instead of sending.
# Never fails the session — always exits 0.

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SEND="$DIR/tg-notify.sh"
ATTENTION="$DIR/tg-attention.sh"

payload="$(cat)"

# Marketing daily sessions (learnlikemagic-marketing, R22) wait on Mukul all day;
# their launcher sets this so Manish is not pinged on every pause.
[ "${CLAUDE_NO_IDLE_PING:-0}" = "1" ] && exit 0

# jq is required to parse the payload/transcript; if missing, do nothing.
command -v jq >/dev/null 2>&1 || exit 0

ntype="$(printf '%s' "$payload" | jq -r '.notification_type // empty' 2>/dev/null)"
case "$ntype" in
  idle_prompt|agent_needs_input|permission_prompt) ;;
  *) exit 0 ;;
esac

transcript="$(printf '%s' "$payload" | jq -r '.transcript_path // empty' 2>/dev/null)"
cwd="$(printf '%s' "$payload" | jq -r '.cwd // empty' 2>/dev/null)"
session="$(printf '%s' "$payload" | jq -r '.session_id // empty' 2>/dev/null)"
repo="$(basename "${cwd:-$PWD}")"

# From the end of the transcript (a long session's file is far too big to load
# whole): Claude's last text, and the question of an AskUserQuestion dialog when
# that call is the last thing Claude did.
text=""
question=""
if [ -n "$transcript" ] && [ -f "$transcript" ]; then
  last="$(tail -n 400 "$transcript" 2>/dev/null | jq -cRs '
    [ split("\n")[] | select(length > 0) | (try fromjson catch empty)
      | select(.type == "assistant") | .message.content[]? ] as $blocks
    | ($blocks | last // {}) as $final
    | {
        text: ([ $blocks[] | select(.type == "text") | .text ] | last // ""),
        question: (
          if $final.type == "tool_use" and $final.name == "AskUserQuestion"
          then ([ $final.input.questions[]? | .question ] | join(" / "))
          else "" end
        )
      }' 2>/dev/null)"
  text="$(printf '%s' "$last" | jq -r '.text // empty' 2>/dev/null)"
  question="$(printf '%s' "$last" | jq -r '.question // empty' 2>/dev/null)"
fi

# A tool approval is not a question for him: stay silent, as before.
if [ "$ntype" = "permission_prompt" ] && [ -z "$question" ]; then
  exit 0
fi

needs=0
if [ -n "$question" ]; then
  body="$question"
  needs=1
else
  # The reply's TLDR when it has one: it holds what he must decide or do next.
  tldr="$(printf '%s\n' "$text" | awk 'found { print } /^#+[[:space:]]*TLDR[[:space:]]*$/ { found = 1 }')"
  if [ -n "${tldr//[[:space:]]/}" ]; then
    body="$tldr"
    probe="$tldr"
  else
    body="$text"
    # No TLDR: a question sits at the start (the house rule) or at the very end.
    probe="$(printf '%s' "$text" | cut -c1-400) $(printf '%s' "$text" | tail -c 400)"
  fi
  if printf '%s' "$probe" | grep -Eiq \
    '\?([[:space:]"”)]|$)|needs? your|needs? you to|needs you|your (call|decision|approval|go-ahead|input|word)|waiting (on|for) you|please (confirm|decide|choose|approve)|(am|is|are) blocked|blocked on|blocker|(cannot|can.t) (proceed|continue|go on)|which do you|do you want|should i '; then
    needs=1
  fi
fi

# Strip markdown emphasis/backticks and heading marks, turn bullets into dots,
# drop blank lines, trim.
summary="$(printf '%s\n' "$body" \
  | sed -E 's/[`*]//g; s/^#+[[:space:]]*//; s/^[[:space:]]*[-•][[:space:]]+/• /; s/[[:space:]]+$//' \
  | awk 'NF' )"

# Fallback to the generic notification message if we couldn't extract a summary.
if [ -z "$summary" ]; then
  summary="$(printf '%s' "$payload" | jq -r '.message // "Claude is waiting for your input."' 2>/dev/null)"
fi

# Truncate to keep it phone-glanceable.
max=500
if [ "${#summary}" -gt "$max" ]; then
  summary="$(printf '%s' "$summary" | cut -c1-"$max")…"
fi

# De-dupe: skip if we already pinged this exact summary for this session.
state_dir="${TMPDIR:-/tmp}/claude-tg-notify"
mkdir -p "$state_dir" 2>/dev/null
state_file="$state_dir/${session:-nosession}.last"
hash="$(printf '%s' "$summary" | cksum | awk '{print $1}')"
if [ "${NOTIFY_HOOK_DRY_RUN:-0}" != "1" ] && [ -f "$state_file" ] \
  && [ "$(cat "$state_file" 2>/dev/null)" = "$hash" ]; then
  exit 0
fi

if [ "$needs" = "1" ] && [ -x "$ATTENTION" ]; then
  sender="$ATTENTION"
  destination="attention"
  msg="❓ Needs you — ${repo}
${summary}"
else
  sender="$SEND"
  destination="mj_claude"
  msg="🔔 Your turn — ${repo}
${summary}"
fi

if [ "${NOTIFY_HOOK_DRY_RUN:-0}" = "1" ]; then
  printf 'destination=%s\n%s\n' "$destination" "$msg"
  exit 0
fi

if [ -x "$sender" ]; then
  printf '%s' "$msg" | "$sender" >/dev/null 2>&1 && printf '%s' "$hash" > "$state_file"
fi
exit 0
