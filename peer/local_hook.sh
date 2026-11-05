#!/bin/bash
# AI Peer session-end hook (F7). Claude Code and Codex run it when a session ends:
#   session-end claude|codex   (the hook's JSON arrives on stdin)
# It only saves that JSON for the Peer and exits 0 at once: it never slows or breaks a session.
# The Peer reads ~/.ai-peer/spool/session-end/ and records repo, branch and unpushed changes
# (summaries, never code). Installed by `peer local install` into ~/.ai-peer/bin/session-end.
d="$HOME/.ai-peer/spool/session-end"
mkdir -p "$d" 2>/dev/null || exit 0
f="$d/$(date +%s)-$$-${1:-unknown}.json"
if [ -t 0 ]; then payload='{}'; else payload="$(head -c 65536 2>/dev/null)"; fi
[ -n "$payload" ] || payload='{}'
printf '{"tool":"%s","at":"%s","payload":%s}\n' "${1:-unknown}" "$(date -u +%Y-%m-%dT%H:%M:%SZ)" "$payload" > "$f.tmp" 2>/dev/null \
  && mv "$f.tmp" "$f" 2>/dev/null
exit 0
