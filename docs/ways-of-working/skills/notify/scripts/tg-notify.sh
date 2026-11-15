#!/usr/bin/env bash
# tg-notify.sh — send Manish an outbound Telegram ping.
#
# VENDORED COPY for /ship-chapter. The canonical local copy lives in
# ~/claude-config/skills/notify/scripts/tg-notify.sh (synced between Manish's
# machines); every factory's report step calls that exact path. On a cloud
# sandbox bootstrap.sh installs THIS file at that path, so the factories'
# hardcoded command works unchanged. Keep the two copies identical.
#
# Usage:
#   tg-notify.sh "Done: ch5 explain deck imported."
#   echo "multi-line message" | tg-notify.sh
#
# Token: TELEGRAM_BOT_TOKEN env var first (the cloud path), else the telegram
# plugin's .env file (the local-machine path).
set -euo pipefail

CHAT_ID="${CHAT_ID:-7727757663}"
ENV_FILE="${TELEGRAM_ENV_FILE:-$HOME/.claude/channels/telegram/.env}"

if [ -z "${TELEGRAM_BOT_TOKEN:-}" ] && [ -f "$ENV_FILE" ]; then
  TELEGRAM_BOT_TOKEN="$(grep -E '^TELEGRAM_BOT_TOKEN=' "$ENV_FILE" | head -1 | cut -d= -f2- | tr -d '\r\n')"
fi
if [ -z "${TELEGRAM_BOT_TOKEN:-}" ]; then
  echo "tg-notify: TELEGRAM_BOT_TOKEN not set and not found in $ENV_FILE" >&2
  exit 1
fi

# Message from args, else from stdin.
if [ "$#" -gt 0 ]; then
  MSG="$*"
else
  MSG="$(cat)"
fi
if [ -z "${MSG//[[:space:]]/}" ]; then
  echo "tg-notify: empty message" >&2
  exit 1
fi

# Hand the text to curl through a FILE, never through the argument list. On Git
# Bash the shell layer mangles non-ASCII bytes on their way into a native curl
# argument, and Telegram rejects the result with 400 "strings must be encoded in
# UTF-8" — so emoji used to be impossible from Windows. Via a file the bytes are
# untouched. curl there is a mingw build that cannot read POSIX paths, hence the
# cygpath conversion (a no-op elsewhere, where cygpath does not exist).
MSG_FILE="$(mktemp)"
trap 'rm -f "$MSG_FILE"' EXIT
printf '%s' "$MSG" > "$MSG_FILE"
if command -v cygpath >/dev/null 2>&1; then
  MSG_PATH="$(cygpath -w "$MSG_FILE")"
else
  MSG_PATH="$MSG_FILE"
fi

# The URL carries the bot token, so it must not reach curl's ARGUMENT list:
# anything running as this user can read argv from `ps` while the call is in
# flight and then post as the bot. A mode-600 config file keeps it out of argv.
# Every factory report goes through here, so this runs constantly.
CFG_FILE="$(mktemp "${TMPDIR:-/tmp}/tg-notify-cfg.XXXXXX")"
chmod 600 "$CFG_FILE"
trap 'rm -f "$MSG_FILE" "$CFG_FILE"' EXIT
printf 'url = "https://api.telegram.org/bot%s/sendMessage"\n' "$TELEGRAM_BOT_TOKEN" > "$CFG_FILE"
if command -v cygpath >/dev/null 2>&1; then
  CFG_PATH="$(cygpath -w "$CFG_FILE")"
else
  CFG_PATH="$CFG_FILE"
fi

resp="$(curl -sS -m 20 --config "$CFG_PATH" \
  --data-urlencode "chat_id=${CHAT_ID}" \
  --data-urlencode "text@${MSG_PATH}" \
  --data "disable_web_page_preview=true")"

if printf '%s' "$resp" | grep -q '"ok":true'; then
  echo "tg-notify: sent ✓"
else
  echo "tg-notify: FAILED -> $resp" >&2
  exit 1
fi
