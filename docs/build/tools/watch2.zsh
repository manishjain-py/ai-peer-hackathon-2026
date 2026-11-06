#!/bin/zsh
# Controller watcher (no AI). Usage: watch2.zsh <alarm %> <name>:<pid>:<transcript or -> ...
# Every 60 s it checks: each pid alive, each transcript's context (last usage record, of 1M),
# the .env key names (names only, never values), the build's PR list, and whether the Google
# client file exists. It prints one line and exits on the first change, or after MAX seconds.
ALARM=$1; shift
MAX=${MAX:-3300}
REPO=manishjain-py/ai-peer-hackathon-2026
ENVF=$HOME/.ai-peer/.env
GCF=$HOME/.ai-peer/google-client.json

envkeys() { command grep -oE '^[A-Za-z_][A-Za-z0-9_]*=' "$ENVF" 2>/dev/null | tr -d '=' | sort | tr '\n' ' ' }
prs() { gh pr list --repo "$REPO" --state all --json number,state,isDraft --jq 'map("#\(.number) \(.state)\(if .isDraft then " draft" else "" end)") | join(", ")' 2>/dev/null }
gcl() { [[ -f "$GCF" ]] && print yes || print no }
ctx() { tail -n 400 "$1" 2>/dev/null | jq -r 'select(.type=="assistant" and .message.usage != null) | .message.usage | ((.input_tokens // 0) + (.cache_read_input_tokens // 0) + (.cache_creation_input_tokens // 0))' 2>/dev/null | tail -n 1 }
now() { date -u +%H:%M }

E0=$(envkeys); P0=$(prs); G0=$(gcl)
start=$(date +%s)
print "watching from $(now): alarm ${ALARM}%, PRs: $P0, google client: $G0"
while true; do
  sleep 60
  for item in "$@"; do
    name=${item%%:*}; rest=${item#*:}; wpid=${rest%%:*}; tfile=${rest#*:}
    if ! kill -0 "$wpid" 2>/dev/null; then print "GONE $name (pid $wpid) at $(now)"; exit 0; fi
    if [[ "$tfile" != "-" ]]; then
      t=$(ctx "$tfile")
      if [[ -n "$t" ]] && (( t * 100 >= ALARM * 1000000 )); then
        print "CONTEXT $name at $(( t / 10000 ))% ($t tokens) at $(now)"; exit 0
      fi
    fi
  done
  E1=$(envkeys)
  if [[ "$E1" != "$E0" ]]; then
    a0=(${=E0}); a1=(${=E1}); added=(${a1:|a0}); removed=(${a0:|a1})
    print "ENV key names changed at $(now): added [${added}] removed [${removed}]"; exit 0
  fi
  P1=$(prs)
  if [[ -n "$P1" && "$P1" != "$P0" ]]; then print "PRS changed at $(now): $P0 -> $P1"; exit 0; fi
  G1=$(gcl)
  if [[ "$G1" != "$G0" ]]; then print "GOOGLE client file $G0 -> $G1 at $(now)"; exit 0; fi
  if (( $(date +%s) - start >= MAX )); then print "TIMEOUT after $MAX s at $(now); nothing changed"; exit 0; fi
done
