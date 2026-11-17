---
name: ai-peer
description: "Resume Manish's AI Peer / Hackathon 2026 project from its saved context: the product build, concept film or demo video. Use when the user invokes $ai-peer or /ai-peer, or asks to continue this project, its build, demo or film."
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

0. A new Mac or a take-over: `START-HERE.md` first. It identifies the current work and
   restoration steps; do not infer active work from an old session's launch instructions.
1. Read root `AGENTS.md`, then choose the requested area's instructions and tracker:
   - Demo video and mascot work: `demo-video/AGENTS.md`, then `demo-video/docs/STATE.md`.
   - Product build: `docs/build/STATE.md`.
   - Original concept film: `film/AGENTS.md`, then `film/docs/progress/current-state.md`.
2. Read the latest handoff named by that tracker. If the user did not name an area,
   follow the current-work pointer in `START-HERE.md`; do not load all three histories.
3. Load only the documents the task needs, following the routing table in `AGENTS.md`.
   Inspect the actual code or artifact before relying on a recorded status.
4. If the user supplied a task, do it. If they only invoked the skill, give a short
   orientation: where the build is, what is next, what waits on Manish. Then ask what
   to work on; do not start a package or a render merely because it is listed as next.
5. After substantive work, update the selected area's tracker (`demo-video/docs/STATE.md`,
   `docs/build/STATE.md` or the concept film's current-state) as its agent guide describes.
