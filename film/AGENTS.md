# Hackathon 2026 — AI Peer

> Moved under `film/` on 2026-11-04. The repo root now hosts the AI Peer product build
> (see `../AGENTS.md`). Paths below are relative to this `film/` folder.

## Purpose
Create a polished company hackathon concept film. Draft 07 is 4:23, with a seated
photographic employee, clear use-case chapters, generic cross-team Zoom participants,
real RPS context and ElevenLabs speech. The live product remains proposed.
Working name: **AI Peer**. Aim for a clear, memorable story with confident
UI animation, connected transitions, narration, music, and selective effects.

AI Peer is a proposed personal work agent: it learns an employee's context,
stays current, and helps continue routine collaboration when they are offline.
The value is two-way: keep the employee aware of relevant changes and
opportunities, and help colleagues obtain useful context across time zones.

## Start here; load selectively
1. Read [current state](docs/progress/current-state.md) at session start.
2. Read only the relevant route below. Do not load the entire repository.
3. Inspect the actual files before assuming a render or feature is complete.

| Task | Read next |
|---|---|
| Understand the product | [Overview](docs/idea/overview.md) |
| Refine scenarios or narrative | [Use cases](docs/idea/use-cases.md), [scope](docs/idea/hackathon-scope.md) |
| Knowledge, relevance, current facts | [Knowledge and freshness](docs/idea/knowledge-and-freshness.md) |
| Permissions, representation, escalation | [Trust and autonomy](docs/idea/trust-and-autonomy.md) |
| Build the eventual prototype | [Architecture](docs/technical/architecture.md), [implementation status](docs/technical/implementation-status.md) |
| Film, animation, audio, rendering | [Video docs](docs/video/README.md), [video source](video/), [reference guide](references/README.md) |
| Review choices or change direction | [Decisions](docs/decisions/README.md) |
| Resume or hand off work | [Current state](docs/progress/current-state.md), [session log](docs/progress/session-log.md) |

## Source of truth
- Preserve [the complete original idea](source-material/ai-peer-original.txt).
  Do not rewrite, shorten, or replace it. Put interpretation in docs/idea/.
- The original source is a vision, not evidence of implemented capability.
- Product, technical, and narrative docs are working interpretations.
  Record meaningful changes in docs/decisions/ and docs/progress/.
- Working name stays AI Peer until the user chooses another name.

## Status and claims
- Read current-state.md for the film’s latest verified status. The live product is not implemented.
- Draft 07 uses the supplied professional context file and user-reported experiences.
  Preserve its dated/scoped facts separately from authored dialogue, local-work
  examples and UI. Real names do not establish real conversations or live access.
- Do not imply Slack replies, meeting attendance, continuous learning, source
  access, code changes, or other integrations already work.
- Keep vision, proposed prototype, rendered demo, and implemented behavior distinct.
- Treat time saved and dependency resolution as scenario outcomes, not measured results.
- Clearly identify the Peer as AI; keep consequential decisions with the employee.

## Creative direction
- Use Slack's connected explanatory narrative and Notion's visual clarity.
- Tell one story: learn context → personal relevance and priorities → go offline → continue a conversation →
  represent the employee transparently → return to a reviewable handoff.
- Keep an unfamiliar idea understandable; animation should guide attention.
- Use original visuals and appropriately licensed audio. Do not reuse the
  references' music, logos, character, or entire scenes as project assets.
- Confirmed reference fact: Notion's mascot used cel animation and Rive.
  The full reference films' editing applications are unknown.

## Workspace conventions
- docs/idea/: product vision and intended behavior.
- docs/technical/: proposed architecture and implementation evidence.
- docs/video/ and video/: film planning, source, assets, and build instructions.
- renders/: reviewable video exports; work/: retained production dependencies,
  intermediate files, review evidence and delivery records.
- references/: original style research; source-material/: unedited user source.
- Use relative links in project documentation so this folder remains portable.
- Do not publish externally without explicit user instruction.

## Source control
- Private repository: `manishjain-py/ai-peer-hackathon-2026`; default branch `main`.
- Source control was introduced on 4 November 2026; older handoffs describe the
  pre-Git workspace. Follow current state for the latest synchronization status.
- Media is stored with Git LFS. Keep earlier drafts and required `work/` assets
  tracked; ignore only installed dependencies, caches and local credentials.
- See [repository and restoration guide](docs/technical/repository.md).

## Before handoff
- Update current-state.md with what exists, what was verified, and the next step.
- Append a dated session-log entry; preserve previous history.
- Record meaningful choices and unresolved decisions in docs/decisions/.
- Validate changed documentation links and inspect relevant outputs.
- Keep this file compact; move detail into the routed documents.
