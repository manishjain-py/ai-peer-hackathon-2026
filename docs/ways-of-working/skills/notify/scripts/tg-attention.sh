#!/usr/bin/env bash
# tg-attention.sh — send Manish a message in the "Attention Learnlikemagic" group.
#
# Only for what needs him or that he must not miss:
#   - a question for him, or an input or decision needed from him;
#   - a blocker: the work cannot go on without him;
#   - a major update: an initiative finished, something shipped or broke.
# Everything else (routine progress, "step done", FYI) goes through tg-notify.sh
# to the mj_claude chat, which stays the busy one.
#
# Usage, same as tg-notify.sh:
#   tg-attention.sh "❓ learnlikemagic: merge the policy PR now, or wait for the chapter run?"
#   echo "multi-line message" | tg-attention.sh
#
# The group's chat id is not a secret; the bot (mj_claude_bot) is an admin there.
set -euo pipefail

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CHAT_ID="${ATTENTION_CHAT_ID:--5506416790}" exec "$DIR/tg-notify.sh" "$@"
