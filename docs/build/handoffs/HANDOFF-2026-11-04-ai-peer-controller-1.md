# Hand-off: ai-peer-controller-1

For: `ai-peer-controller-1`, Claude Opus 5.5 (1M), max effort, remote control on.
Written 2026-11-04 by the kickoff session (window 1661, "AI peer hackathon project").
Dated, never edited after it is written. The living state is `docs/build/STATE.md` on
`origin/main`.

## Manish's standing instructions (quoted from the brief and the interview)

> "a big initiative is controlled through controller sessions that control other
> individual worker sessions, and they provide handoff around forty-five to fifty
> percent of context ... this is a hackathon, so our main idea is to make it work"

> "3 checkpoints but don't restrict by date. if it gets done sooner, i will check sooner"

## The job

Run the AI Peer build to D2's target (generic system + porting guide by 15 Nov):
start and watch the workers in PLAN order (at most 2 at once), keep STATE current,
relay what needs Manish one question at a time, send the three checkpoints. You write
no product code and never touch a worker's worktree or type into its conversation
(except the trust-dialog keystroke below).

## Read first, in order

1. `AGENTS.md`. 2. `docs/build/STATE.md`. 3. `docs/build/PLAN.md`. 4. `docs/build/DESIGN.md` §0.
5. `docs/build/handoffs/HANDOFF-2026-11-04-ai-peer-wp1-1.md` (the first worker's brief).

## Working copy

`~/repos/ai-peer-hackathon-2026` on `main`, docs-only commits (STATE, briefs). Fetch
before every push. Workers live in `~/repos/ai-peer-<wp>` worktrees.

## Duties

| When | Do |
|---|---|
| Now | Create the WP1 worktree and start `ai-peer-wp1-1` with its brief (recipe below). Record its window id and session URL in STATE. |
| A worker asks for Manish | Relay one ask at a time in plain words, with the exact steps it wrote; never `AskUserQuestion` while a worker is live (its messages would queue behind the dialog). Use a plain reply plus the Telegram Attention group. Record his words in STATE at once, verbatim, with the time. |
| Every event, at least hourly | Read each live worker's window (`mac-term.sh read <winid>`) and its context (last usage record in its transcript); a worker past 45% that has not handed off gets told to hand off at its next clean step. Check the build's PRs (`gh pr list --repo manishjain-py/ai-peer-hackathon-2026`). Update STATE. |
| A scene's walk passes | Checkpoint (D15): send Manish a short screen recording on Telegram plus how to try it; mark it in STATE. |
| WP1 merged | Write the WP2 and WP3 briefs from PLAN, PRD and the merged code (same shape as WP1's brief), start both; after them, WP4 and WP5. |
| Every milestone | Check the weekly usage of this Mac's Claude account (shared with Learn Like Magic). At about 95%: every session finishes its step and hands off; tell Manish. |
| Your own context at 45 to 50% | Write `HANDOFF-<date>-ai-peer-controller-2.md`, update STATE, start the successor with the next number, tell live workers its name. |

Each build session's launch prompt names its controller "unless `docs/build/STATE.md`
on `origin/main` names a newer one".

## Spawn recipe (no keystrokes needed except the trust dialog)

```zsh
git -C ~/repos/ai-peer-hackathon-2026 fetch origin main
git -C ~/repos/ai-peer-hackathon-2026 worktree add ~/repos/ai-peer-wp1 -b wp1-foundation origin/main
git -C ~/repos/ai-peer-wp1 branch --unset-upstream
# launch script in your scratchpad:
#!/bin/zsh
cd ~/repos/ai-peer-wp1 || exit 1
exec claude --model "claude-opus-5-5[1m]" --effort max --name ai-peer-wp1-1 --remote-control ai-peer-wp1-1 "Read docs/build/handoffs/HANDOFF-2026-11-04-ai-peer-wp1-1.md in full; that is your job. Follow it end to end, then stop as it says. Your controller is ai-peer-controller-1 unless docs/build/STATE.md on origin/main names a newer one."
```

Start it without stealing Manish's focus (a spawn once took his dictation):

```zsh
osascript -e 'tell application "Terminal"
set prev to id of front window
do script "zsh <launch script path>"
delay 1
set index of window id prev to 1
end tell'
```

Then `~/.claude/skills/mac-terminal-control/scripts/mac-term.sh list` for the new
window id and `read <winid>`. A never-seen folder stops `claude` at "trust this
folder": answer it with `mac-term.sh key <winid> ...` (screen must be unlocked; check
with `ioreg -n Root -d1 | grep IOConsoleLocked`). Confirm the remote-control line and
"max effort" in the window.

## Telegram

The user-level `notify` skill: the Attention group for questions, inputs and blockers;
the mj_claude chat for everything else. One or two lines each. Never put a secret or
private message text in a Telegram line.

## Traps

- This Mac also runs Learn Like Magic sessions (several controllers and workers): never
  `pkill` by pattern; never touch their windows or worktrees.
- An idle session's last reply goes to Telegram through the user's idle hook: where a
  session shows private words, launch it with `CLAUDE_NO_IDLE_PING=1`.
- New worktree paths always hit the trust dialog.
