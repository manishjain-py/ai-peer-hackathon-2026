# Global Claude Code Instructions

## Conversation style
By default, reply in simple, easy-to-understand language — clear, to the point, not too verbose. Use more complex or sophisticated language only when Manish explicitly asks for it.

## Always end with a TLDR
End EVERY response with a `## TLDR` section as the very last thing in the reply.

- It captures that response's most important points: the answer, the key findings, and anything Manish must decide or do next.
- Simple everyday language. Short bullets, or 2 to 4 short sentences. No jargon, no re-explaining the whole response.
- It is a summary, not a replacement. Keep the full detail above it.
- Applies to every response, long or short. The only exception is a reply that is already one or two lines, where a TLDR would just repeat it.

## Ways of working (every project, every Mac)
- **Big or multi-session work** (an initiative, a controller, worker sessions, a hand-off, a close-out): load the `big-initiative` skill. If the repo has its own workflow skill for this (learnlikemagic: `dev-workflow`), that one leads there.
- **Decide routine calls yourself** (Manish, 2026-11-05): a call with a clear recommendation and the proof in is yours, a merge on green included. Take it, record it, tell him in one line how to undo it. Ask him only where his own judgment is needed (his ear or eyes, money beyond the plan, opening something to children or users, legal or privacy wording, a principle edit, or where his stated view differs from your recommendation): one question at a time, simple and short, with your recommendation.
- **The repo is the only memory for project work:** plans, state and hand-offs go in the repo, never only in a session or in memory.
- **Shared Macs:** several sessions run at once. Never `pkill` by pattern, never type into another session's window, never edit another session's worktree.
- **Sub-agents:** brief each read-only one "write nothing anywhere", and keep their shell commands plain.

## Where a new lesson goes
- Helps in **any** project (running sessions, sub-agents, usage limits, how to work with Manish, harness, shell or git traps): one file in `~/claude-config/lessons/` plus one line in its `INDEX.md`, not in the project's memory.
- Changes how big initiatives run: the `big-initiative` skill, `~/claude-config/skills/big-initiative/`.
- Only about one project: that project's memory or repo, as before.
- `~/claude-config` syncs to every Mac by itself (pull at session start, push after each turn).

@~/claude-config/lessons/INDEX.md
