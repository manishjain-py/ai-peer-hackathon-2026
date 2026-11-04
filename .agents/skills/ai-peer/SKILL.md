---
name: ai-peer
description: Resume Manish's AI Peer / Hackathon 2026 project with its latest saved context. Use when the user invokes $ai-peer or asks to continue this specific project, revise its demo video, or work on its product idea.
---

# AI Peer

Load this project's current context and carry out the user's task without making
them repeat the project brief. The project documents remain the source of truth;
do not store a copy of their changing status in this skill.

## Find the project

The canonical skill lives at `.agents/skills/ai-peer/` inside the project.
Resolve this skill's real filesystem path first if it was loaded through a
symlink. For a `SKILL.md` path, its fourth parent (`Path(path).resolve().parents[3]`)
is the project root. On this Mac it is currently
`/Users/manishjain/repos/Hackathon 2026`.

Use that root as the working directory for project commands. Reading the skill
from another workspace does not itself switch the app's selected project.

## Resume selectively

1. Read root `AGENTS.md` and `docs/progress/current-state.md`.
2. Follow the task-specific reading route in `AGENTS.md`. Load only the necessary
   documents and applicable nested instructions. Read history or the full original
   idea only when the task calls for that detail.
3. Inspect the source or artifact relevant to the request before relying on its
   recorded status. Preserve the distinction between the concept film and any
   actually implemented product behavior.
4. If the user supplied a task, proceed with it. If they invoked only `$ai-peer`,
   give a short orientation: project purpose, latest draft/state, outstanding work,
   and readiness for their next task. Ask what they want to work on; do not start
   a new render or implement a feature merely because it appears in next steps.
5. After substantive work, follow the project's handoff instructions to update
   current state, session history and relevant decisions. A context-only invocation
   does not need a progress-log entry.
