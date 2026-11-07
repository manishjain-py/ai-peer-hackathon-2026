---
name: ai-peer
description: Resume Manish's AI Peer hackathon project with its latest saved context, either the product build (the generic AI Peer and its Airbnb integrations) or the concept film. Use when the user invokes $ai-peer or /ai-peer, or asks to continue this project, its build, its demo, or its film.
---

# AI Peer

Load this project's current context and carry out the user's task without making them repeat the brief. The
repo's documents are the source of truth; do not store a copy of their changing status in this skill.

## Find the project

The canonical skill lives at `.agents/skills/ai-peer/` inside the project (Claude Code reaches it through the
`.claude/skills/ai-peer` link). Resolve this skill's real path first if it was loaded through a link; the
project root is the folder that holds `.agents/`.

## Resume selectively

1. New to the project: read `START-HERE.md` in full. Otherwise read root `AGENTS.md`, then
   `docs/build/STATE.md` (the build's live state).
2. Film work instead (the concept film, its video source or its render): read `film/AGENTS.md`, then
   `film/docs/progress/current-state.md`.
3. Load only the documents the task needs, following the routing table in `AGENTS.md`. Inspect the actual
   code or artifact before relying on a recorded status.
4. If the user supplied a task, do it. If they only invoked the skill, give a short orientation: where the
   build is, what is next, what waits on Manish. Then ask what to work on; do not start a package merely
   because it is listed as next.
5. After substantive work, update `docs/build/STATE.md` (or the film's current state for film work) as
   `docs/ways-of-working.md` describes.
