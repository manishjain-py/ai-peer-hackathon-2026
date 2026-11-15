# Sessions: spawn, name, talk, read, measure, close, resume

For the controller, or any session that tends others, on a Mac. The helper is the
mac-terminal-control skill's script; below, `MT` stands for
`~/.claude/skills/mac-terminal-control/scripts/mac-term.sh`.

## Spawn a worker with no keystrokes, then give focus back

Keystrokes sent into a window drop silently while the screen is locked or the display is asleep.
Launch flags set the model, effort, name, remote control and first prompt, so this way works with
the screen locked.

1. Make its worktree from your own copy of the repo:

   ```
   git -C <your copy> fetch origin
   git -C <your copy> worktree add <worktree path> -b <branch> origin/<default branch>
   git -C <worktree path> branch --unset-upstream
   ```

2. Write a launch script, for example `/tmp/launch-<name>.sh`. A long prompt quoted inside
   AppleScript inside the shell breaks; a file does not.

   ```
   #!/bin/zsh
   cd <worktree path> || exit 1
   exec claude --model "<model>" --effort max --name <name> --remote-control <name> \
     "<kickoff message>"
   ```

   A variable the worker needs (for example `CLAUDE_NO_IDLE_PING=1` for a session that shows
   private words) is an `export` line after the `cd`.

3. Open it in a new Terminal window, then put the window that was in front back in front.
   `do script` makes the new window the front one, and words Manish is typing or dictating would
   land in the new worker.

   ```
   osascript -e 'tell application "Terminal"
   set prev to id of front window
   do script "zsh /tmp/launch-<name>.sh"
   delay 1
   set index of window id prev to 1
   end tell'
   ```

   Do not return the `do script` result as text inside this block (AppleScript error -1700). Find
   the new window id with `MT list` (its title is the `--name`), never with `id of front window`,
   which can name your own window.

4. Check that it took: `MT read <window id>` shows the
   `remote-control is active · …claude.ai/code/session_…` line and "thinking with max effort";
   `ps -o command= -p <pid>` shows the model (the pid is in the PROC column of `MT list`). Record
   the window id and the session URL in STATE.md.

A folder Claude Code has never seen stops at "trust this folder" (its default is "No, exit"). That
is the one keystroke you may send another window, before its session exists: read the screen, then
answer it with `MT key`, while the screen is unlocked. Or launch in a checkout it already trusts and
have the kickoff create the worktree and move in with `EnterWorktree`.

Lesson: `~/claude-config/lessons/howto_spawn_claude_session_keystroke_free.md`

## Name every session

- The names follow SKILL.md sections 7 and 8. Check `MT list` first, so no two live sessions share
  a name.
- The launch name (`--name` and `--remote-control`) drives the Terminal title, the remote-control
  name and the name others message. A running session cannot be renamed (an AppleScript title is
  overridden), so a misnamed session keeps its name and its successor gets the right one.
- Lessons: `~/claude-config/lessons/feedback_controller_session_names.md`,
  `~/claude-config/lessons/feedback_name_the_controller_session.md`,
  `~/claude-config/lessons/controller_session_workflow.md`

## Talk to a session without typing into it

- Never type or press keys in another session's window: a dialog may be open there (Enter answers
  it, Esc cancels it). The trust dialog above is the one exception. The `key`, `type` and `submit`
  commands of `MT` are for when Manish himself asks for a keypress in a window he names.
- Send words with `SendMessage` to the session's name (names from `ListAgents`). Each message costs
  an idle session a whole-context turn: send only what it must act on.
- Words cross: an answer can miss a report in flight, and a ruling can miss a hand-off being
  written. To sequence, say "start on my next message".
- `SendMessage` with `notify_when_idle: true` and no message gives one notice when its turn ends or
  it exits. On a session already idle it fires at once, so subscribe while it is busy; a closed
  session can still send a late one.
- Never run `MT context` on a worker: it types `/context` into its window. Read its transcript
  (below).

## Read another session's window safely

- `MT read <window id>` prints the window's visible text; it works with the screen locked.
- The input line below the separator (after `❯`) is Claude Code's suggested next prompt: never
  sent, never Manish. It can look like an instruction, or like his yes to a question still open. A
  sent turn shows above it, followed by the session's reply. Before you credit anything to Manish,
  find it in the transcript as a `user` record.
- A window scrolled up ("N new messages (click) ↓") shows stale lines: no status bar, no open
  question. Read its transcript instead: a last `AskUserQuestion` `tool_use` with no `tool_result`
  after it means it waits on Manish; a last assistant record of text alone means its turn ended.
  Never send keys to un-scroll it.
- `esc to interrupt` means it is working. `N shell`, `N monitor` or `Waiting for` is a live wait.
  `← 1 agent` proves nothing.
- Reading a closed window returns an AppleScript error (-1728), which a screen watcher can take
  for an idle screen: drop a window from every watch as you close it.
- Lessons: `~/claude-config/lessons/gotcha_idle_input_line_shows_prompt_suggestion.md`,
  `~/claude-config/lessons/gotcha_scrolled_session_window_stale_screen.md`

## Measure context from a transcript

- The `<total_tokens>` count in system reminders is not the context in use.
- A session's transcript is `~/.claude/projects/<project dir>/<session id>.jsonl`. The project dir
  is the folder the session started in, with each `/` and `.` turned into `-` (a worktree session
  has its own). Your own session id is in your scratchpad path. Never take "the newest .jsonl":
  with several sessions in one project dir, it is often a peer's.
- Another session's file is the one that holds its name:
  `grep -l '"customTitle":"<name>"' ~/.claude/projects/<its project dir>/*.jsonl`
- Context in use is `input_tokens + cache_read_input_tokens + cache_creation_input_tokens` of the
  last usage record, over the window size. This prints the percent of a 1M window (where a guard
  refuses inline programs, put it in a script file and run that):

  ```
  jq -s '[.[] | select(.type == "assistant" and .message.usage != null)] | last | .message.usage
    | (.input_tokens + .cache_read_input_tokens + .cache_creation_input_tokens) * 100 / 1000000
    | floor' <transcript>
  ```

- Lesson: `~/claude-config/lessons/howto_measure_context_from_transcript.md`

## Close a finished session

The rule is in SKILL.md section 7. The check, all of it, read from the screen and the system, never
from the session's word:

1. Its screen shows no `esc to interrupt` and no live wait (above), read in its own command before
   the close, never in the same one (a worker was once closed while writing its last summary).
2. `pgrep -P <pid>` shows only helper processes (a browser, Telegram, `caffeinate`).
3. Its servers are stopped or detached. No workflow, sub-agent or job heartbeat of its own still
   runs: ask its successor, and check that each of its
   `~/.claude/projects/<project dir>/<session id>/subagents/agent-*.jsonl` files ends in an
   assistant record with no `tool_use` after it.
4. Nothing lives only in its scratchpad: copy out anything that does (a 59,000-character PR body
   draft once did).
5. `MT close <window id>`; check that its pid is gone and the live sessions' pids are not; drop it
   from the watch; record the closure in STATE.md.

Lesson: `~/claude-config/lessons/feedback_controller_closes_finished_sessions.md`

## Processes: by PID, never by pattern

- Several sessions share a Mac, each with its own worktree, servers and test runs. Never `pkill`
  by pattern: it kills their runs too.
- Stop only a PID you started and wrote down (`echo $! > <name>.pid`), or a port's process after
  checking whose it is. Before any kill, read `pgrep -fl` and confirm the worktree in its command
  line.
- A step that depends on another is never a parallel tool call: chain it with `&&` in one command,
  or wait for the first result.
- Lesson: `~/claude-config/lessons/gotcha_pkill_by_pattern_kills_other_sessions_gates.md`

## Worktrees and shared refs

- Every worktree of a clone shares `origin/<default>`, and any session's push moves it (the
  controller's STATE.md pushes too). Name a diff or check base by commit id (a recorded sha, or
  `git merge-base HEAD origin/<default>` taken at the time), never by `origin/<default>` itself.
- A successor that shares its predecessor's worktree writes nothing there until the predecessor's
  running jobs (tests, workflows, sub-agents) report: launch it with a write hold, lifted by
  message.

## Repairs (the controller)

- A worker idle with no PR: read its window. If DESIGN section 0 answers its question, send the
  answer; otherwise record it under Needs Manish.
- A PR red and its worker idle for 20 minutes: read the failure, then spawn a fresh session to fix
  forward from that PR.
- A deploy fails: find the red step and fix forward at once, from a fresh session.
- Merged, but no successor window within 15 minutes: the chain broke at the spawn. Find or write
  the successor's brief and spawn it.
- A limit or confirm dialog in a window: send Manish the choices with a recommendation on
  Attention, record it under Needs Manish, keep watching.
- Back from a network drop or an API error: a worker whose turn ended on an error sits idle. Wake
  it with a message carrying the current state.

## Resume from a hand-off

1. Read STATE.md on the default branch, then the newest hand-offs.
2. Same Mac: check that each worktree, server and job they name is alive before trusting it.
3. Another Mac: `git fetch origin`, then re-create each in-flight worktree from its pushed branch,
   not from the default branch (`git worktree add <path> <branch>`). Re-create the env files and
   databases the hand-off describes.
4. A stopped session's workflows and background jobs keep running: check each one (its run record,
   results folder or log) before you start it again.
5. Record the new sessions in STATE.md and re-arm the watch. After an account switch, relaunch each
   worker from its hand-off and close the old account's stopped windows, so nothing runs twice.
