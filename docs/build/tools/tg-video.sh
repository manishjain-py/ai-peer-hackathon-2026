#!/bin/zsh
# Send one video to a Telegram chat with a caption. Usage: tg-video.sh <chat id> <video path> <caption>
# Reads the bot token from the notify skill's env file; never prints it.
CHAT=$1; VID=$2; CAP=$3
TOKEN=$(command grep -E '^TELEGRAM_BOT_TOKEN=' ~/.claude/channels/telegram/.env | head -1 | cut -d= -f2- | tr -d '"'"'"' ')
[[ -n "$TOKEN" ]] || { print "no token"; exit 1; }
[[ -f "$VID" ]] || { print "no file: $VID"; exit 1; }
curl -s -F "chat_id=$CHAT" -F "video=@$VID" -F "caption=$CAP" -F "supports_streaming=true" \
  "https://api.telegram.org/bot$TOKEN/sendVideo" | jq -c '{ok, id: .result.message_id, err: .description}'
