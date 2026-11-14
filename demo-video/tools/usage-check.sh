#!/bin/bash
# usage-check.sh: read Claude's usage without a model call and test it against two limits.
#
# Usage:
#   usage-check.sh <Fable week percent> <all-models week percent> [log file]
# Exit: 0 when either reading is at or above its limit; 1 when both are below;
#   2 when the readings could not be parsed (never taken as "met": `/usage` can print
#   no "Current week" lines while signed in).
# Every run prints one line and appends it to the log file: UTC time, week=, fable=,
#   session= (the 5-hour window, when `/usage` shows it). The log gives the hourly rate
#   at no token cost.
#
# Made for demo-video/tools/wait-for.sh, as a controller's usage alarm:
#   wait-for.sh usage 0 300 '/abs/path/usage-check.sh 60 30 /abs/path/usage.log' '<Telegram line>'
set -u
if [ "$#" -lt 2 ]; then
  echo "usage: usage-check.sh <Fable week percent> <all-models week percent> [log file]" >&2
  exit 2
fi
fable_limit="$1"; week_limit="$2"; log="${3:-}"

out="$(CLAUDE_NO_IDLE_PING=1 claude -p "/usage" --output-format text 2>/dev/null)"
pick() { printf '%s\n' "$out" | sed -n "s/^$1: \([0-9][0-9]*\)%.*/\1/p" | head -1; }
week="$(pick 'Current week (all models)')"
fable="$(pick 'Current week (Fable)')"
sess="$(pick 'Current session')"

line="$(date -u +%Y-%m-%dT%H:%M:%SZ) week=${week:-?} fable=${fable:-?} session=${sess:-?}"
echo "$line"
if [ -n "$log" ]; then echo "$line" >> "$log"; fi

if [ -z "$week" ] || [ -z "$fable" ]; then exit 2; fi
if [ "$fable" -ge "$fable_limit" ] || [ "$week" -ge "$week_limit" ]; then exit 0; fi
exit 1
