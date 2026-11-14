#!/bin/bash
# wait-for.sh: a controller's wait that costs no tokens.
#
# It ends when a shell test passes, or when a watched process is gone. Run it in the
# background of a Claude Code session: its end wakes the session. It prints one line per
# change and can send one routine Telegram line when the test passes.
#
# Usage:
#   wait-for.sh <label> <pid to watch, or 0> <seconds between checks> '<bash test>' ['<Telegram line>']
# Optional environment: WAIT_PIDFILE (this script's PID is written there),
#   WAIT_LOG (every line is also appended there).
# Exit: 0 the test passed; 3 the watched process ended and the test still fails.
#
# Example (ends when a report exists and has not changed for 90 seconds):
#   wait-for.sh wp1-end 41753 20 'f=/path/REPORT.md; [ -f "$f" ] && [ $(( $(date +%s) - $(stat -f %m "$f") )) -ge 90 ]'
set -u
if [ "$#" -lt 4 ]; then
  echo "usage: wait-for.sh <label> <pid or 0> <seconds> '<bash test>' ['<Telegram line>']" >&2
  exit 2
fi
label="$1"; watch_pid="$2"; every="$3"; cond="$4"; tg="${5:-}"
notify_sh="$HOME/.claude/skills/notify/scripts/tg-notify.sh"

if [ -n "${WAIT_PIDFILE:-}" ]; then echo "$$" > "$WAIT_PIDFILE"; fi

log() {
  line="$(date -u +%Y-%m-%dT%H:%M:%SZ) $label: $1"
  echo "$line"
  if [ -n "${WAIT_LOG:-}" ]; then echo "$line" >> "$WAIT_LOG"; fi
}
notify() {
  if [ -n "$1" ] && [ -x "$notify_sh" ]; then bash "$notify_sh" "$1" >/dev/null 2>&1; fi
  return 0
}
passes() { bash -c "$cond" >/dev/null 2>&1; }

log "waiting (pid $watch_pid, every ${every}s)"
while :; do
  if passes; then log "MET"; notify "$tg"; exit 0; fi
  if [ "$watch_pid" != "0" ] && ! kill -0 "$watch_pid" 2>/dev/null; then
    # One last look: the work may have landed between the two checks.
    if passes; then log "MET"; notify "$tg"; exit 0; fi
    log "GONE: process $watch_pid ended and the test still fails"
    notify "$label: the session it watched (pid $watch_pid) ended before its work was seen. The controller is looking into it."
    exit 3
  fi
  sleep "$every"
done
