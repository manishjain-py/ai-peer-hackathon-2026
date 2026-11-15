---
name: howto_fence_a_session_with_a_hook
description: Limiting a Claude Code session to a command list, proved live on 2.1.318: the launch flags, why permission rules alone cannot hold, a PreToolUse hook as the list, and a headless pty to drive the proof on a locked screen
metadata:
  type: reference
---

**Proved 2026-11-05** (learnlikemagic, Teacher Feedback QA P7; evidence `P7-FENCE-PROOF.md` until close-out, then `docs/technical/teacher-feedback-qa.md`).

**Launch, flags in this order:** `claude --model M --effort max --name N --remote-control N --setting-sources project --settings <file> --strict-mcp-config --mcp-config '{"mcpServers":{}}' --permission-mode manual '<prompt>'`.
`--setting-sources project` drops the user's bypass default, hooks and plugins, and a tracked `.claude/settings.local.json`, though the trust dialog still warns about that file. `manual` is `default`'s new name. `--mcp-config` takes several values: it swallows a prompt placed after it. The settings file needs `disableAutoMode: "disable"` (top level and in `permissions`), or every prompt offers "switch to auto mode".

**What holds:**
- Inside a Workflow, default-type agents inherit the list. An agent's off-list command shows a real prompt on the main session's screen, `from the "<name>" workflow`, held until answered; on "No" the agent gets a denial and goes on. A `Workflow` allow rule in manual mode starts one with no consent stop.
- An `ask` rule with wildcards catches a command behind `cd ... &&` and an assignment. A `deny` rule prompts nothing.

**What does not:**
- Any shell variable, loop or assignment in front forces a prompt, even when a rule names that exact text. On one project 22% of workflow agents' commands had one, so rules alone cannot finish unattended work.
- `Write(path)` rules do not match the Write tool; `Edit(path)` rules do.

**The fix: a PreToolUse hook is the list.** Matcher `Bash|Monitor`, in the `--settings` file. It fires inside agents (`agent_type: workflow-subagent`). `allow` clears the variable stop; no output leaves the normal prompt; `ask` and `deny` work. A hook's `allow` does not pass an `ask` or `deny` rule, but it does pass `rm`, so the list must not hold it.

**Driving a proof on a locked screen:** a Python pty with `pyte` renders the screen to a file, and bytes to a FIFO are keys, so trust dialogs and prompts need no unlock. GNU `screen` here (4.00.03) renders nothing detached. A first start in a new folder stops at the trust dialog (default "No, exit"), then a Chrome dialog; a second start shows neither. Related: [[gotcha_sessions_have_no_permission_fence]], [[howto_answer_prompt_on_locked_screen]], [[howto_isolate_headless_claude_and_codex_runs]].

**The deny text is the agent's guide** (P7, 2026-11-06 to 11-07): a rehearsal fix's picture step was refused twice
(`xxd` off the list; a `curl` whose path sat inside `$( )`, which the hook cannot read), and its point went to Manish.
The fold: a refusal of form (a name inside `$( )` or backticks, a relative program path) gives one plain retry line
that says what to change and ends "If it is refused again, stop and say so in your result."; an off-list program gets
one fixed refusal word. **Test the hook on raw commands** replayed from the agents' transcripts: a processed corpus
whose 279 heredoc rows had lost their closing line proved nothing.
