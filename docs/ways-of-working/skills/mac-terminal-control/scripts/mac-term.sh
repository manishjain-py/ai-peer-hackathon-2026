#!/bin/bash
# mac-term.sh — inspect & control macOS Terminal.app Claude Code sessions.
# Built so Claude can drive the Mac's terminals (esp. when Manish is on his
# phone via Claude Code remote control). All the AppleScript/System-Events
# gotchas are baked in here. See the skill's SKILL.md for the workflow.
set -uo pipefail

die(){ echo "ERROR: $*" >&2; exit 1; }

# "R,G,B" (0-65535 each) -> #RRGGBB
hex_from_bg(){
  local r g b; IFS=',' read -r r g b <<<"$1"
  [ -z "${b:-}" ] && { printf '#??????'; return; }
  printf "#%02X%02X%02X" $((r*255/65535)) $((g*255/65535)) $((b*255/65535))
}

# Escape text for an AppleScript double-quoted string
as_escape(){ local t="$1"; t="${t//\\/\\\\}"; t="${t//\"/\\\"}"; printf '%s' "$t"; }

keycode_for(){
  case "$1" in
    esc|escape) echo 53;; enter|return) echo 36;; up) echo 126;; down) echo 125;;
    left) echo 123;; right) echo 124;; tab) echo 48;; space) echo 49;;
    *) echo "";;
  esac
}

# Focus window <id> (guarded: aborts if it can't make that window frontmost),
# then run the given System Events statement lines.
send_keys(){
  local winid="$1"; shift
  local stmts="" s
  for s in "$@"; do stmts+="  $s"$'\n'"  delay 0.28"$'\n'; done
  osascript 2>&1 <<AS
set targetId to $winid
tell application "Terminal"
  activate
  try
    set index of window id targetId to 1
  end try
  try
    set frontId to id of front window
  on error
    return "NO_WINDOW $winid"
  end try
end tell
delay 0.4
if frontId is not targetId then return "ABORT: front window is " & frontId & ", not target " & targetId
tell application "System Events"
$stmts
end tell
return "OK"
AS
}

cmd_list(){
  local rows
  rows=$(osascript 2>/dev/null <<'AS'
set delim to tab
set nl to linefeed
set out to ""
tell application "Terminal"
  repeat with w in windows
    set wid to id of w
    repeat with t in tabs of w
      try
        set ti to ""
        try
          set ti to custom title of t
        end try
        set bgc to background color of t
        set out to out & (tty of t) & delim & wid & delim & (item 1 of bgc) & "," & (item 2 of bgc) & "," & (item 3 of bgc) & delim & ti & nl
      end try
    end repeat
  end repeat
end tell
return out
AS
)
  printf "%-11s %-7s %-9s %-16s %-28s %s\n" "TTY" "WINID" "COLOR" "REPO" "TITLE" "PROC"
  printf "%-11s %-7s %-9s %-16s %-28s %s\n" "-----------" "-------" "---------" "----------------" "----------------------------" "----------"
  local tty winid bg title
  while IFS=$'\t' read -r tty winid bg title; do
    [ -z "${tty:-}" ] && continue
    local short="${tty#/dev/}" pid cwd hex
    pid=$(ps -e -o pid=,tty=,command= | awk -v t="$short" '$2==t && /[c]laude/{print $1; exit}')
    cwd=""
    [ -n "$pid" ] && cwd=$(lsof -a -p "$pid" -d cwd -Fn 2>/dev/null | sed -n 's/^n//p' | head -1)
    hex=$(hex_from_bg "$bg")
    printf "%-11s %-7s %-9s %-16s %-28s %s\n" "$short" "$winid" "$hex" "${cwd##*/}" "${title:0:28}" "${pid:+claude $pid}"
  done <<<"$rows"
}

cmd_read(){ local id="${1:?usage: read <winid>}"; osascript -e "tell application \"Terminal\" to get contents of selected tab of window id $id" 2>&1 | grep -v '^[[:space:]]*$'; }

cmd_find(){
  local needle="${1:?usage: find \"<text>\"}" ids id
  ids=$(osascript -e 'tell application "Terminal" to get id of every window' 2>/dev/null | tr ',' '\n' | tr -d ' ')
  for id in $ids; do
    [ -z "$id" ] && continue
    if osascript -e "tell application \"Terminal\" to get contents of selected tab of window id $id" 2>/dev/null | grep -qiF -- "$needle"; then
      echo "$id"
    fi
  done
}

cmd_key(){
  local id="${1:?usage: key <winid> <name>}" name="${2:?key name}" code
  code=$(keycode_for "$name"); [ -z "$code" ] && die "unknown key: $name (use esc enter up down left right tab space)"
  send_keys "$id" "key code $code"
}

cmd_type(){ local id="${1:?usage: type <winid> <text>}"; shift; local t; t=$(as_escape "$*"); send_keys "$id" "keystroke \"$t\""; }
cmd_submit(){ local id="${1:?usage: submit <winid> <text>}"; shift; local t; t=$(as_escape "$*"); send_keys "$id" "keystroke \"$t\"" "key code 36"; }

# Paste a FILE's contents into a window via the clipboard + Cmd+V (safe for
# multi-line text — Enter does NOT fire per line). Add "submit" to press Enter after.
cmd_paste(){
  local id="${1:?usage: paste <winid> <file> [submit]}" file="${2:?paste needs a file path}" sub="${3:-}"
  [ -f "$file" ] || die "no such file: $file"
  pbcopy < "$file" || die "pbcopy failed"
  if [ "$sub" = "submit" ]; then
    send_keys "$id" "keystroke \"v\" using command down" "key code 36"
  else
    send_keys "$id" "keystroke \"v\" using command down"
  fi
}

# Ordered palette (name:R:G:B, 8-bit). Every entry is a DARK background, always
# paired with light text (#EDE7F5) below -> high contrast, readable in screenshots.
PALETTE="purple:57:26:92 teal:11:58:72 green:16:61:46 navy:18:34:75 amber:64:46:12 maroon:74:24:40 blue:20:44:92 slate:30:41:59"

_palette_names(){ local e; for e in $PALETTE; do printf '%s ' "${e%%:*}"; done; }
_hex8(){ printf '#%02X%02X%02X' "$1" "$2" "$3"; }
_rgb_for(){ local n="$1" e; for e in $PALETTE; do case "$e" in "$n":*) echo "${e#*:}" | tr ':' ' '; return;; esac; done; }

# Print a palette color NOT currently used by any open window (white windows don't
# count). Falls back to the first palette color if every color is already in use.
pick_unused_color(){
  local used usedhex="" t a b c e name r g b hx
  used=$(osascript -e 'tell application "Terminal"
    set o to ""
    repeat with w in windows
      try
        set c to background color of selected tab of w
        set o to o & (item 1 of c) & "," & (item 2 of c) & "," & (item 3 of c) & " "
      end try
    end repeat
  end tell
  return o' 2>/dev/null)
  for t in $used; do
    IFS=',' read -r a b c <<<"$t"
    [ -z "${c:-}" ] && continue
    usedhex+=" $(_hex8 $((a*255/65535)) $((b*255/65535)) $((c*255/65535)))"
  done
  for e in $PALETTE; do
    name="${e%%:*}"; read -r r g b <<<"$(echo "${e#*:}" | tr ':' ' ')"
    hx=$(_hex8 "$r" "$g" "$b")
    case " $usedhex " in *" $hx "*) ;; *) echo "$name"; return;; esac
  done
  echo "${PALETTE%%:*}"
}

# Set a window's bg + text colors to a named palette theme (dark bg + light text).
# "white"/"default" resets to black-on-white. Affects only that window.
cmd_color(){
  local id="${1:?usage: color <winid> <name>}" name="${2:?color name}" R G B TR TG TB
  if [ "$name" = white ] || [ "$name" = default ]; then
    R=255; G=255; B=255; TR=0; TG=0; TB=0
  else
    read -r R G B <<<"$(_rgb_for "$name")"
    [ -z "${R:-}" ] && die "unknown color: $name (palette: $(_palette_names)white)"
    TR=237; TG=231; TB=245
  fi
  osascript 2>&1 <<AS
tell application "Terminal"
  set t to selected tab of window id $id
  set background color of t to {$((R*257)), $((G*257)), $((B*257))}
  set normal text color of t to {$((TR*257)), $((TG*257)), $((TB*257))}
  set bold text color of t to {$((TR*257)), $((TG*257)), $((TB*257))}
  set cursor color of t to {$((TR*257)), $((TG*257)), $((TB*257))}
end tell
return "OK colored window $id => $name"
AS
}

cmd_spawn(){
  local repo="${1:?usage: spawn <repo-path> [session-name] [color]}" name="${2:-}" color="${3:-}"
  [ -d "$repo" ] || die "no such directory: $repo"
  [ -z "$name" ] && name="$(basename "$repo")-$(date +%d%b-%H%M | tr 'A-Z' 'a-z')"
  local newtty winid res
  res=$(osascript 2>&1 <<AS
tell application "Terminal"
  activate
  set t to do script "cd $repo && claude${CLAUDE_ARGS:+ $CLAUDE_ARGS}"
  delay 1
  return (tty of t) & "|" & (id of front window)
end tell
AS
)
  newtty="${res%%|*}"; winid="${res##*|}"
  case "$newtty" in /dev/*) ;; *) die "could not open window: $res";; esac
  case "$winid" in ''|*[!0-9]*) die "could not read new window id: $res";; esac
  echo "opened winid=$winid tty=${newtty#/dev/}; waiting for claude to start..."
  local ready=0 i
  for i in $(seq 1 30); do
    if cmd_read "$winid" 2>/dev/null | grep -qiE 'for shortcuts|bypass permissions'; then ready=1; break; fi
    osascript -e 'delay 1' >/dev/null 2>&1
  done
  [ "$ready" = 0 ] && echo "WARN: did not confirm claude ready in win $winid — check with: mac-term.sh read $winid"
  # /effort max opens a confirm dialog ("Change effort level?"). Any keystroke other
  # than Enter dismisses it as "No, go back" and effort stays auto; the old sequence
  # sent "/rc" straight into it (found 2026-09-05). Answer it with Enter first.
  cmd_submit "$winid" "/effort max" >/dev/null; osascript -e 'delay 1.5' >/dev/null 2>&1
  if cmd_read "$winid" 2>/dev/null | grep -q 'Change effort level'; then
    cmd_key "$winid" enter >/dev/null; osascript -e 'delay 1' >/dev/null 2>&1
  fi
  cmd_submit "$winid" "/rc" >/dev/null;        osascript -e 'delay 1.5' >/dev/null 2>&1
  cmd_submit "$winid" "session name - $name" >/dev/null
  osascript -e 'delay 2' >/dev/null 2>&1
  local scr; scr=$(cmd_read "$winid" 2>/dev/null)
  echo "$scr" | grep -q 'Set effort level to max' || echo "WARN: max effort not confirmed in win $winid — run: mac-term.sh submit $winid '/effort max' ; mac-term.sh key $winid enter"
  echo "$scr" | grep -qi 'remote' || echo "WARN: remote control not confirmed on screen in win $winid — check: mac-term.sh read $winid"
  [ -z "$color" ] && color=$(pick_unused_color)
  cmd_color "$winid" "$color" >/dev/null 2>&1
  echo "SPAWNED winid=$winid tty=${newtty#/dev/} repo=$repo name=\"$name\" color=$color"
}

cmd_close(){
  local id="${1:?usage: close <winid>}"
  osascript 2>&1 <<AS
tell application "Terminal"
  try
    close (every window whose id is $id) saving no
  on error e number n
    return "CLOSE_FAILED " & n & ": " & e
  end try
end tell
return "CLOSED $id"
AS
}

cmd_shot(){
  local out="${TMPDIR:-/tmp}/mac-term-shot.png"
  if [ -n "${1:-}" ]; then
    [ -n "${2:-}" ] && out="$2"
    osascript -e "tell application \"Terminal\"
      activate
      try
        set index of window id $1 to 1
      end try
    end tell" >/dev/null 2>&1
    osascript -e 'delay 0.5' >/dev/null 2>&1
  else
    [ -n "${2:-}" ] && out="$2"
  fi
  screencapture -x "$out" 2>/dev/null && echo "$out"
}

# Submit /context to a window, wait for it to render, echo the visible panel text.
_ctx_raw(){
  cmd_submit "$1" "/context" >/dev/null
  osascript -e 'delay 2.5' >/dev/null 2>&1
  cmd_read "$1"
}

# Parse a /context panel (passed as $1) and print the used/free headline + segment
# lines. Returns 0 if the "Free space" totals were found, 1 if not (panel taller
# than the viewport, so the totals scrolled off the top).
_ctx_print(){
  local raw="$1" win free_k free_pct
  win=$(printf '%s\n' "$raw"     | grep -oE '\([0-9]+[kKmM] context\)' | head -1 | tr -d '()' | sed 's/ context//')
  free_k=$(printf '%s\n' "$raw"  | grep -i 'free space:' | grep -oE '[0-9]+(\.[0-9]+)?[kKmM]' | head -1)
  free_pct=$(printf '%s\n' "$raw"| grep -i 'free space:' | grep -oE '[0-9]+(\.[0-9]+)?%' | head -1 | tr -d '%')
  [ -z "${free_pct:-}" ] && return 1
  # Window total: prefer the model banner ("(1M context)"), but it usually scrolls
  # off, so fall back to deriving it from free tokens ÷ free%. used% = 100 − free%.
  awk -v fp="$free_pct" -v fk="$free_k" -v win="$win" 'BEGIN{
    used = 100 - fp
    fkn = fk; have_fk = (fk != "")
    if (fk ~ /[mM]$/) { sub(/[mM]$/,"",fkn); fkn *= 1000 } else sub(/[kK]$/,"",fkn)
    totk = 0; totlabel = win
    if (win != "") { totk = win; if (win ~ /[mM]$/){sub(/[mM]$/,"",totk); totk*=1000} else sub(/[kK]$/,"",totk) }
    else if (have_fk && fp > 0) { totk = fkn/(fp/100); totlabel = sprintf("~%.0fk", totk) }
    note = ""
    if (have_fk && totk > 0) { usedk = totk-fkn; if (usedk<0) usedk=0; note = sprintf("   (~%.0fk used of %s)", usedk, totlabel) }
    printf "window %s | used ~%.1f%%   ·   free ~%.1f%%%s\n", (totlabel!=""?totlabel:"?"), used, fp, note
  }'
  echo "—— segments ——"
  printf '%s\n' "$raw" | grep -oE '[A-Z][A-Za-z ]+: [0-9.]+[kKmM]( tokens)?( \([0-9.]+%\))?'
  return 0
}

# Run /context in a session and summarize its context-window usage. Wakes the
# display first (synthetic keys are silently dropped while it's asleep). Busy
# sessions render a task tracker + suggestions that make the panel taller than the
# viewport, pushing the totals off the top — so if the first read can't find them,
# it temporarily grows the window, retries, and restores the original size.
cmd_context(){
  local id="${1:?usage: context <winid>}"
  nohup caffeinate -u -t 60 >/dev/null 2>&1 &      # wake display: keys drop while asleep
  osascript -e 'delay 2' >/dev/null 2>&1
  echo "── /context · win $id ──"
  # Don't submit if the session is mid-generation — /context would just queue
  # behind its work and pile up. "esc to interrupt" in the footer means busy.
  if cmd_read "$id" | grep -q 'esc to interrupt'; then
    echo "(session is busy generating — /context would queue; try again when it's idle)"
    return 1
  fi
  _ctx_print "$(_ctx_raw "$id")" && return 0
  # totals scrolled off — grow the window so the full panel fits, retry, restore.
  local orig L R raw
  orig=$(osascript -e "tell application \"Terminal\" to get bounds of window id $id" 2>/dev/null)
  case "$orig" in *,*,*,*) ;; *) echo "(no panel parsed — display asleep/slow; try: $0 read $id)"; return 1;; esac
  L=$(printf '%s' "$orig" | awk -F', *' '{print $1}'); R=$(printf '%s' "$orig" | awk -F', *' '{print $3}')
  osascript -e "tell application \"Terminal\" to set bounds of window id $id to {$L, 28, $R, 1100}" >/dev/null 2>&1
  osascript -e 'delay 0.5' >/dev/null 2>&1
  raw=$(_ctx_raw "$id")
  osascript -e "tell application \"Terminal\" to set bounds of window id $id to {$orig}" >/dev/null 2>&1
  _ctx_print "$raw" || echo "(no panel parsed even after resize — try: $0 read $id)"
}

# One-glance system health: RAM/cores, load vs cores, memory-pressure %, swap,
# a vm_stat breakdown, every live claude session's footprint (+ % of total RAM —
# the "are my sessions eating the Mac?" answer), and the top memory hogs.
# All read-only, no sudo. Rules of thumb printed inline.
cmd_resources(){
  local total_gb ncpu page
  total_gb=$(( $(sysctl -n hw.memsize) / 1073741824 ))
  ncpu=$(sysctl -n hw.ncpu)
  page=$(vm_stat | awk '/page size of/{print $8}'); [ -z "$page" ] && page=16384
  echo "── system resources ──"
  printf "hardware:  %s GB RAM · %s cores · %s\n" "$total_gb" "$ncpu" "$(sysctl -n hw.model)"
  printf "load:      %s   (vs %s cores; <%s = CPU has headroom)\n" \
    "$(uptime | sed 's/.*load averages*: //')" "$ncpu" "$ncpu"
  local freepct; freepct=$(memory_pressure 2>/dev/null | awk -F': ' '/free percentage/{print $2}')
  printf "mem free:  %s   (>30%% fine · 10-30%% tight · <10%% critical)\n" "${freepct:-?}"
  printf "swap:      %s   (some is normal on 8GB; near-full + low mem-free = slow)\n" "$(sysctl -n vm.swapusage)"
  vm_stat | awk -v p="$page" '
    /Pages active/{a=$3} /Pages inactive/{i=$3} /Pages wired/{w=$4}
    /Pages occupied by compressor/{c=$5} /Pages free/{f=$3}
    END{gsub(/\./,"",a);gsub(/\./,"",i);gsub(/\./,"",w);gsub(/\./,"",c);gsub(/\./,"",f); g=p/1073741824;
      printf "breakdown: app %.2fG · wired(OS) %.2fG · compressed %.2fG · free %.2fG\n",(a+i)*g,w*g,c*g,f*g}'
  echo
  echo "claude sessions (RAM each):"
  ps -Axo rss,pid,comm | awk -v tot="$total_gb" '
    NR>1 && $3 ~ /claude/ && $3 !~ /adapter/ {n++; sum+=$1; printf "  pid %-7s  %5.0f MB\n",$2,$1/1024}
    END{g=sum/1024/1024; printf "  -> %d live · %.2f GB total = %.0f%% of %sGB RAM\n", n+0, g, (tot>0?g/tot*100:0), tot}'
  echo
  echo "top memory hogs:"
  ps -Axo rss,pcpu,comm -m | awk 'NR>1 && NR<=9{printf "  %5.0f MB  %4s%% cpu  %s\n",$1/1024,$2,substr($0,index($0,$3))}' | cut -c1-72
}

case "${1:-}" in
  list)   shift; cmd_list "$@";;
  read)   shift; cmd_read "$@";;
  find)   shift; cmd_find "$@";;
  key)    shift; cmd_key "$@";;
  type)   shift; cmd_type "$@";;
  submit) shift; cmd_submit "$@";;
  paste)  shift; cmd_paste "$@";;
  color)  shift; cmd_color "$@";;
  pickcolor) shift; pick_unused_color;;
  spawn)  shift; cmd_spawn "$@";;
  close)  shift; cmd_close "$@";;
  shot)   shift; cmd_shot "$@";;
  context) shift; cmd_context "$@";;
  resources|res|mem) shift; cmd_resources "$@";;
  *) cat >&2 <<EOF
mac-term.sh — control macOS Terminal Claude Code sessions
  list                    list all sessions (tty, winid, color, repo, title, proc)
  read   <winid>          print a window's visible text
  find   "<text>"         print winid(s) whose screen currently shows <text>
  key    <winid> <name>   send one key: esc enter up down left right tab space
  type   <winid> <text>   type text (no Enter)
  submit <winid> <text>   type text + Enter
  paste  <winid> <file> [submit]  put file on clipboard, Cmd+V into window (+Enter if 'submit')
  color  <winid> <name>   recolor a window: purple teal green navy amber maroon blue slate white
  spawn  <repo> [name] [color]  new window -> claude -> /effort max -> /rc -> name -> auto-unique color
                                (CLAUDE_ARGS="--settings <file>" in the env is appended to the claude command)
  close  <winid>          close a window (KILLS its running session)
  shot   [winid] [out]    screenshot the active Space (focus winid first if given)
  context <winid>         run /context in a session, print its window used/free summary
  resources               system health: RAM/cores, load, mem-pressure, swap, per-session RAM + top hogs
EOF
    exit 1;;
esac
