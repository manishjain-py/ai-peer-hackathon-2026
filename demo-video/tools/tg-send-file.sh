#!/usr/bin/env bash
# tg-send-file.sh: send Manish one file on Telegram, with a caption.
#
# Manish, 2026-11-14: "Wherever you need my choice, send it to me on telegram. I ll review
# there and reply here". The notify skill's scripts send text only; this sends the picture,
# sound or clip that the choice is about. Default chat: the Attention group (asks for him).
#
# Usage:
#   tg-send-file.sh photo|audio|video|document <file> "<caption, at most 1024 characters>"
# Optional environment: CHAT_ID (default: the Attention group).
#
# NEVER send a real company recording, a frame of one, or a cut that contains one
# (demo-video/docs/DESIGN.md, decision C8). Invented people, test clips and stand-ins only.
#
# The bot token is read like tg-notify.sh reads it and is kept out of the argument list.
set -euo pipefail

kind="${1:?photo|audio|video|document}"
file="${2:?file to send}"
caption="${3:-}"
CHAT_ID="${CHAT_ID:--5506416790}"
ENV_FILE="${TELEGRAM_ENV_FILE:-$HOME/.claude/channels/telegram/.env}"

case "$kind" in
  photo) method=sendPhoto ;;
  audio) method=sendAudio ;;
  video) method=sendVideo ;;
  document) method=sendDocument ;;
  *) echo "tg-send-file: unknown kind: $kind" >&2; exit 2 ;;
esac
[ -f "$file" ] || { echo "tg-send-file: no such file: $file" >&2; exit 2; }
case "$file" in
  "$HOME"/.ai-peer/*) echo "tg-send-file: refusing a file under ~/.ai-peer (decision C8): copy a checked preview elsewhere first" >&2; exit 3 ;;
esac

if [ -z "${TELEGRAM_BOT_TOKEN:-}" ] && [ -f "$ENV_FILE" ]; then
  TELEGRAM_BOT_TOKEN="$(grep -E '^TELEGRAM_BOT_TOKEN=' "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '\r\n')"
fi
[ -n "${TELEGRAM_BOT_TOKEN:-}" ] || { echo "tg-send-file: no bot token" >&2; exit 1; }

CFG_FILE="$(mktemp "${TMPDIR:-/tmp}/tg-send-cfg.XXXXXX")"
chmod 600 "$CFG_FILE"
trap 'rm -f "$CFG_FILE"' EXIT
printf 'url = "https://api.telegram.org/bot%s/%s"\n' "$TELEGRAM_BOT_TOKEN" "$method" > "$CFG_FILE"

args=(-sS -m 300 --config "$CFG_FILE" --form-string "chat_id=${CHAT_ID}" -F "${kind}=@${file}")
if [ -n "$caption" ]; then args+=(--form-string "caption=${caption}"); fi
if [ "$kind" = video ]; then args+=(--form-string "supports_streaming=true"); fi

resp="$(curl "${args[@]}")"
if printf '%s' "$resp" | grep -q '"ok":true'; then
  echo "tg-send-file: sent ✓ ($kind, $(basename "$file"))"
else
  # The response never holds the token; print it so a failure can be read.
  echo "tg-send-file: FAILED -> $resp" >&2
  exit 1
fi
