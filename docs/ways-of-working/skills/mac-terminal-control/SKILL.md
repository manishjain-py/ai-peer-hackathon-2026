---
name: mac-terminal-control
description: >-
  Open, close, inspect, and drive macOS Terminal.app windows running Claude Code.
  Spawn a new session (cd to a repo, launch claude, set max effort + remote control
  + a session name); close a specific window (including one identified from a phone
  screenshot); list running sessions with their colors/repos/titles; or send
  keystrokes (Escape/Enter/arrow navigation) to answer a prompt. Use whenever Manish
  asks to open/start/spawn a terminal or claude session, close/kill a terminal, list
  what sessions are running, or press keys in a session — especially while he is
  driving the Mac from his phone via Claude Code remote control.
---

# Mac Terminal Control

Drive the other Claude Code sessions on Manish's Mac. Built for remote/phone use:
Manish is often controlling this Mac from his phone and will ask things like
"open a claude session in learnlikemagic", "close that terminal" (with a photo), or
"press escape and enter in the green one".

All the fiddly AppleScript / System-Events / permission logic is wrapped in one helper.

**Helper:** `~/.claude/skills/mac-terminal-control/scripts/mac-term.sh`
(set `SK=~/.claude/skills/mac-terminal-control/scripts/mac-term.sh` for brevity).

| Command | What it does |
|---|---|
| `$SK list` | All sessions: `TTY  WINID  COLOR  REPO  TITLE  PROC` |
| `$SK read <winid>` | Print a window's current visible text |
| `$SK find "<text>"` | Print winid(s) whose screen currently shows `<text>` |
| `$SK key <winid> <name>` | Send one key: `esc enter up down left right tab space` |
| `$SK type <winid> <text>` | Type text (no Enter) |
| `$SK submit <winid> <text>` | Type text + Enter |
| `$SK spawn <repo> [name]` | New window → `claude` → `/effort max` (+ Enter on its confirm dialog) → `/rc` → `session name - <name>`; warns if max effort or remote control did not confirm |
| `$SK close <winid>` | Close a window (KILLS its running session) |
| `$SK shot [winid] [out.png]` | Screenshot active Space (focus `winid` first if given) |
| `$SK context <winid>` | Run `/context` in a session; print its window size + used/free summary |
| `$SK resources` | System health: RAM/cores, load, memory-pressure %, swap, each live session's RAM (+ % of total), top memory hogs |

`WINID` is the stable handle for everything. Get it from `list` (or `find`).

## Workflow: spawn a Claude session

Manish: "open a terminal, cd to learnlikemagic, run claude with max effort + remote control."

```
$SK spawn /Users/manishjain/repos/learnlikemagic
```
This opens a new Terminal window, launches `claude`, waits for it to be ready, then
types `/effort max`, `/rc`, and `session name - <name>` — exactly the sequence Manish
does by hand. It prints `SPAWNED winid=… tty=… name="…"`.

- **Name:** omit it for an auto name `<repo>-<ddmon>-<HHMM>` (e.g. `aos-26jun-1947`), or
  pass one: `$SK spawn <repo> "learnlikemagic-26jun-2"`. If a session for that repo is
  already open, pick a distinct name so titles don't collide (check `$SK list` first).
- **Verify** after: `$SK read <winid> | tail -20` — confirm `Set effort level to max`,
  remote control, and the session-name line. `spawn` prints a `WARN:` line for either
  one it could not confirm. Report the remote-control link if Manish wants it.
- **The `/effort max` catch (found 2026-09-05, Claude Code 2.1.261):** `/effort max`
  opens a confirm dialog — `Change effort level? … 1. Yes, switch to max / 2. No, go
  back`. Only Enter accepts it; **any other keystroke dismisses it** ("Kept effort level
  as auto") and swallows itself. Before the fix, `spawn` typed `/rc` straight into that
  dialog, so every spawned session silently ran at `auto`. `spawn` now reads the screen
  and presses Enter for you. If you send `/effort max` yourself with `submit`, do
  **not** send anything else until you have run `read` and pressed `key <winid> enter`
  on the dialog — otherwise your next message loses its first characters to the dialog
  and effort stays where it was. The spinner shows `thinking with max effort` once it
  took.
- Common repos: `/Users/manishjain/repos/{learnlikemagic,aos,mazycub}`.

## Workflow: close a terminal (often from a phone screenshot)

Manish sends a photo of a session and says "close this one." **Never guess — confirm the
exact window first**, because `close` kills a running session.

1. **Read the photo** (Read the attached image path) and pull out *distinctive, currently
   on-screen* text — a window title, a unique command, an error string, a file path. Avoid
   generic words.
2. **Match it:** `$SK find "<distinctive text>"` → candidate winid(s). Cross-check with
   `$SK list` (the photo's repo/title/color) and `$SK read <winid>` (does the visible text
   match the photo?).
3. **Confirm** to Manish which window you'll close — state **repo + title + winid** — then:
   `$SK close <winid>`.

Caveats for matching:
- `find` only sees **currently visible** text; if the photo shows scrolled-away content,
  identify via `list` (title/repo) instead.
- `find` will often **also return this controlling session** (your own commands echo the
  search term into it). Ignore the mazycub/self window; never close the session you're
  running in.
- If two windows could match, ask Manish which, rather than closing the wrong one.

## Workflow: answer / navigate a prompt in a session

To act on an AskUserQuestion or any prompt in another session (e.g. the one on Manish's
phone): identify the winid (`find`/`list`), then send keys.
- Dismiss a question: `$SK key <winid> esc`
- Pick option 2 then confirm: `$SK key <winid> down` then `$SK key <winid> enter`
- Submit a typed answer: `$SK submit <winid> "your text"`

Always `read` the window first to see the current state, and again after, to confirm the
keystroke landed. Heads-up: a session can have **pre-typed text hidden behind a prompt** —
read before pressing Enter so you don't submit something unintended.

## Workflow: check a session's context size

Manish: "how full is the context in the green one?" / "check context size of that session."

```
$SK context <winid>
```
This wakes the display, submits `/context` to that window, waits for the panel to render,
then prints a headline like `used ~3.7%   ·   free ~96.3%  (~37k used of 1M)` plus the raw
segment lines (system prompt, memory, messages, skills…). It self-wakes because `/context`
needs a keystroke and those drop while the display is asleep.

- The `/context` panel's top (the exact `Xk/YYYk tokens` header) usually scrolls off screen,
  so the headline is derived from the model banner (window size, e.g. `1M`) and the on-screen
  `Free space:` line. `used% = 100 − free%`.
- On a **busy** session the panel is taller than the viewport (a task tracker + suggestions
  push the `Free space` total off the top). The command auto-handles this: if the first read
  misses the totals, it briefly grows the window, re-reads, and restores the original size.
- If it still prints `no panel parsed`, the keystroke didn't land (display waking / slow
  render) — just run it again, or `$SK read <winid>` to see the panel raw.

## Workflow: check system resources (CPU / memory / are my sessions eating the Mac?)

Manish: "how much CPU/RAM is being used?" / "am I running too many claude sessions?" /
"are my sessions going to 90% of capacity?"

```
$SK resources
```
One read-only snapshot (no sudo, no keystrokes — safe anytime). Prints:
- **hardware** — total RAM, core count, model.
- **load** — 1/5/15-min averages. Compare to core count: load `< cores` means CPU has
  headroom. This Mac has 8 cores, so load ~2 is nothing.
- **mem free** — the memory-pressure percentage, the number that actually matters on macOS
  (not "free RAM", which is always ~0 because macOS caches aggressively). `>30%` = fine,
  `10–30%` = getting tight, `<10%` / "critical" = stop opening things.
- **swap** — some swap is normal on an 8GB Mac. Only worry when swap is near-full **and**
  mem-free is low — that combo is what makes the machine beachball/sluggish.
- **breakdown** — app vs wired(OS) vs compressed vs free, from `vm_stat`.
- **claude sessions** — every live session's RAM, and the total as a **% of RAM**. This is
  the direct answer to "are my sessions eating the Mac?".
- **top memory hogs** — the 8 biggest processes right now.

**The headline finding (measured on this 8GB M3):** each Claude session is only **~0.25–0.35 GB**.
So even 6–8 sessions ≈ 2–3 GB — nowhere near 90%. Claude sessions are **not** what fills the
RAM; Chrome + background apps (e.g. `openclaw-gateway` ~0.7 GB) + the OS are. The practical
limit isn't a crash — it's the Mac going sluggish from swap once *everything combined* exceeds
8 GB. Rule of thumb: **~6–8 concurrent sessions is comfortable**; watch `mem free` dropping
below ~15% or swap pinned near full as the "close a few" signal, not the session count itself.
(Note: idle/closed sessions drop off — macOS under memory pressure can also kill background
sessions on its own, so the live count may be lower than what you spawned.)

## Notes & troubleshooting

- **Sending keys focuses the target window** (brings it to front, switching macOS Spaces if
  needed) and aborts if it can't — so it never types into the wrong session. This is why a
  send briefly pulls that window forward on screen.
- **Permission:** keystrokes need Automation → System Events enabled for Terminal (already
  granted on this Mac). If a send returns an error mentioning a consent dialog, that dialog
  must be approved physically — it can't be clicked programmatically (TCC blocks that).
- **`-1712` / "AppleEvent timed out":** System Events is wedged → `killall "System Events"`
  (it auto-relaunches), then retry.
- **`ABORT: front window is …`:** couldn't make the target frontmost; re-check the winid
  with `list` and retry.
- **`spawn` prints `WARN: max effort not confirmed`:** the `/effort max` dialog was
  missed (slow render). Fix by hand: `$SK submit <winid> "/effort max"`, then `$SK read
  <winid>` to see the dialog, then `$SK key <winid> enter`. Never type anything else in
  between.
- **`spawn` prints `WARN: did not confirm claude ready`:** claude was slow, or a first-run
  "trust this folder?" prompt appeared. `read` the window and handle it, then re-issue the
  `submit` steps manually if needed.
- **Colors:** `COLOR` is the Terminal profile background. A session in bypass-permissions
  mode paints its own pink/magenta tint on screen that overrides this — so the on-screen
  color can differ from what `list` reports.

Background on the underlying technique lives in the `computer-use-terminal-control` memory.
