---
name: gotcha-workflow-agents-pick-their-own-python
description: A Workflow's agents run python however they like; a checkout with no venv is not a fence, they find another checkout's venv
metadata:
  type: feedback
---
In a Workflow told to use a read-only wrapper (`python: <wrapper>`) from a checkout with no venv and no `.env`
(learnlikemagic's Telugu off run, 2026-11-12, 74 agents), 501 python calls ran outside the wrapper. The verify agents ran
the factory's validator with the SHARED checkout's venv (`~/repos/learnlikemagic/llm-backend/venv/bin/python`) after
`venv/bin/python` failed; others used `/usr/bin/python3` or Homebrew's `python3` for JSON reads; one `cd`'d into the
shared checkout for `git ls-remote`. The agents start in the session's start folder (their transcripts' `cwd`) and
write helper scripts into the session's scratchpad root.

**Why:** the workflow's prompts name `${PY}` only for its own commands; agents improvise every other call.

**How to apply:** treat "no venv here" as a tripwire, not a fence. Fence with a PreToolUse hook that refuses any
interpreter but the wrapper ([[howto-fence-a-session-with-a-hook]]), or name `${PY}` in every agent prompt; launch from
a folder holding no production `.env`; scan the agents' transcripts by script mid-run and at the end, each rule tested on
a control transcript that must flag (mine first missed `probe-python.zsh`-style names and `env … python`, and misread
`2>&1` and `>` inside heredocs) ([[lesson-unexercised-guard]]).
