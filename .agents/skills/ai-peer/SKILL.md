---
name: ai-peer
description: Resume Manish's AI Peer / Hackathon 2026 project with its latest saved context, either the product build (the generic AI Peer) or the concept film. Use when the user invokes $ai-peer or /ai-peer, or asks to continue this project, its build, its demo, or its film.
---

# AI Peer

Load this project's current context and carry out the user's task without making
them repeat the brief. The repo's documents are the source of truth; do not store a
copy of their changing status in this skill.

## Find the project

The canonical skill lives at `.agents/skills/ai-peer/` inside the project (Claude Code
reaches it through the `.claude/skills/ai-peer` link). Resolve this skill's real path
first if it was loaded through a link; the project root is the folder that holds
`.agents/`. On Mac-48-GB it is `~/repos/ai-peer-hackathon-2026`.

## Resume selectively

0. A new Mac or a take-over: `START-HERE.md` first. The live work since 14 November is the
   demo video: `demo-video/AGENTS.md`, then `demo-video/docs/STATE.md`; a session started as
   its controller carries on from that file's "Next". The product build closed on this repo
   on 7 November (`docs/build/STATE.md`).
1. Read root `AGENTS.md`, then `docs/build/STATE.md` (the build's live state).
2. Film work instead (the concept film, its video source or renders): read
   `film/AGENTS.md`, then `film/docs/progress/current-state.md`.
3. Load only the documents the task needs, following the routing table in `AGENTS.md`.
   Inspect the actual code or artifact before relying on a recorded status.
4. If the user supplied a task, do it. If they only invoked the skill, give a short
   orientation: where the build is, what is next, what waits on Manish. Then ask what
   to work on; do not start a package or a render merely because it is listed as next.
5. After substantive work, update `docs/build/STATE.md` (or the film's current-state
   for film work) as `AGENTS.md` describes.
