---
name: gotcha-pkill-by-pattern-kills-other-sessions-gates
description: "NEVER pkill -f 'make quality-fast' / 'code_health.py run' on this Mac: several Claude sessions run the gate in parallel worktrees and a pattern kill takes THEIR run down (done by mistake 2026-09-20); kill only the PID you recorded, and start dependent steps sequentially, never as parallel tool calls"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: 3aad2b59-3667-4ac5-bd25-457dc00325d8
  modified: 2026-09-20T04:16:33.597Z
---

Hit 2026-09-20 ~09:55 IST in the sticker-no-outline session. I saw one `code_health.py run` process,
assumed it was my own stray gate, ran `pkill -f "make quality-fast"; pkill -f "code_health.py run"`, and
killed the `learnlikemagic-import-truth` session's gate (its wrapper wrote `GATE_EXIT=143` into its own
scratchpad log). My gate had never started: its guard (`test -z "$(git status --short)"`) had refused a
dirty tree, correctly.

Two mechanisms:
1. **This Mac runs several Claude sessions, each with its own worktree and its own gate.** `pgrep -fl`
   output names the worktree in the command line (the scratchpad path, the `cd`): read it before touching
   anything. Kill only a PID you started and wrote to a file (`echo $! > gate.pid`).
2. **A step that depends on another must not be a parallel tool call.** I issued "split the commits" and
   "start the gate" as two calls in one message; the first failed (zsh does not word-split `$VAR`, so
   `git add $PATHS` saw one giant path), the second ran anyway 20 s later. Chain dependent steps with
   `&&` in ONE command, or wait for the first result. And in zsh use `xargs git add -- < list` or
   `$(cat list)`, never a space-joined variable.

**How to apply:** before any `kill`/`pkill`, list the process and confirm its worktree; prefer the PID
file. Sequence commit → clean-tree check → gate start in one command. See
[[gotcha_local_quality_gate_venv_312]] (a mutating tree invalidates a gate) and
[[gotcha_shared_checkout_concurrent_sessions]].

**A pattern also matches a Claude session whose launch prompt contains it** (2026-11-06, ai-peer-controller-4):
a kickoff told `ai-peer-wp4-2` to check that `pgrep -fl "peer watch"` prints nothing, but the worker's own
`claude` process carries the whole kickoff in its command line, so `pgrep -f` always listed the worker itself
(pid 15886) next to the real `peer watch`. No harm (it killed only the recorded pid), but a "prints nothing"
check by pattern can never pass there, and a `pkill -f` would have killed the worker. In a brief, check by the
recorded PID (`ps -p <pid>`) or anchor the pattern to the binary (`pgrep -f '^[^ ]*python -m peer watch'`).
