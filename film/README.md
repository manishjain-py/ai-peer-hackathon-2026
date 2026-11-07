# AI Peer — Hackathon 2026

**An AI teammate that knows your work and helps keep it moving.**

This project develops a company hackathon concept and its explanatory film.
AI Peer would learn an employee's projects, sources, collaborators and
responsibilities, keep them aware of relevant changes and opportunities, and
help colleagues obtain routine context while the employee is unavailable.
The value runs in both directions: protect the employee's focus and help
collaboration continue within delegated limits.

**Current state — documentation refreshed 4 November 2026:**
[Draft 07](renders/ai-peer-draft-07.mp4) is complete: a **4:23, 1080p concept film**
with ElevenLabs speech, original music and visible captions. It was delivered
privately on **19 September 2026**; the **1 November audit** verified unchanged
media hashes and production-manifest files. Its [caption sidecar](renders/ai-peer-draft-07.srt)
sits beside it. Manish's creative acceptance or targeted feedback is pending;
no further render, delivery, revision or prototype work is currently required.

No live AI Peer product or enterprise integration is implemented. Supplied
professional context retains its September/August source dates; conversations,
interface states and AI actions are authored scenarios. See
[current state](docs/progress/current-state.md) for verification details and
the [ownership handoff](docs/progress/session-handoff-2026-11-01.md) for context.

## What this copy holds

This folder is part of a hand-off copy of the AI Peer repository. It uses **no
Git LFS** and keeps only the latest render: [Draft 07](renders/ai-peer-draft-07.mp4)
(4:23) and its captions, [ai-peer-draft-07.srt](renders/ai-peer-draft-07.srt).
It also keeps every document, the references, the original idea, the Remotion
project (`video/src/`, `video/scripts/`, package files) and the text inputs under
`video/public/` (scripts, timing, captions, review notes).

Every other render, preview and silent picture, the stills, all audio (mixes and
stems), the Draft 07 opening photos, the Draft 02 webcam image, the `work/`
folder (selected clips, alignment caches, QA and delivery records) and the
user-supplied work-profile file — about 3.7 GB — stayed in the original repository.
Docs still mention them as history; those links do not resolve here. You can read
everything, inspect the source and run the typecheck, but re-rendering a draft or
rebuilding its audio needs the audio and stills from the original repository.

Real people's names were removed from this copy's text. Manish appears by first
name only and his city is shown as "India". Drafts 05–07 named real colleagues
and a public figure; invented names now stand in for them: Noah James, Carlos
Baker and Adam Stone (Drafts 05–06 meeting and Slack), Yuri and Vince (the
Airversary email) and Blake Carter (the fireside speaker). The Draft 07 render
file itself is unchanged, so its picture and voice still carry the original
names (and Manish's surname and city) and differ from this copy's captions,
scripts and source.

## Resume with the AI Peer skill

In a new session in this repository, type `$ai-peer` (Codex) or `/ai-peer`
(Claude Code) for a short catch-up, or add your task:

> $ai-peer Make the opening of the demo video more energetic.

The repository's [project skill](../.agents/skills/ai-peer/SKILL.md) (Claude Code
reaches it through `.claude/skills/ai-peer`) reads the root instructions and the
latest saved state, then loads the documents needed for your request. For film
work it starts from [AGENTS.md](AGENTS.md) and [current state](docs/progress/current-state.md).

## Start by what you need

| You want to… | Open |
|---|---|
| Resume work in a new session | [AGENTS.md](AGENTS.md), then [current state](docs/progress/current-state.md) |
| Understand the idea quickly | [Product overview](docs/idea/overview.md) |
| Explore the full original vision | [Original idea](source-material/ai-peer-original.txt) |
| Understand demo scenarios and boundaries | [Use cases](docs/idea/use-cases.md), [hackathon scope](docs/idea/hackathon-scope.md) |
| Understand the proposed system | [Architecture](docs/technical/architecture.md) |
| Work on the film | [Video documentation](docs/video/), [video source](video/), [renders](renders/) |
| Understand the visual references | [Reference guide](references/README.md) |
| See decisions and work history | [Decisions](docs/decisions/README.md), [session log](docs/progress/session-log.md) |

## Project map

```text
AGENTS.md                 Compact instructions and selective reading routes
source-material/          Complete original user idea (one name swapped in this copy)
docs/idea/                Product vision, scenarios, knowledge, trust, scope
docs/technical/           Proposed architecture and implementation status
docs/video/               Film-specific planning and production instructions
docs/decisions/           Accepted working choices and open questions
docs/progress/            Current handoff and append-only session history
references/               Notion/Slack study and reusable production recipe
video/                    Editable film source, text inputs and build files
renders/                  Draft 07 render and its captions (this copy)
```

`work/` (production evidence, reusable audio and intermediate files) exists only
in the original repository.

The visual direction combines the Slack Canvas reference's connected narrative
with the Notion AI reference's clear typography and focused motion. Draft 07
connects a seated photographic opening and personal setup to BOBO awareness,
cross-time-zone Slack clarification, a generic cross-team Zoom exchange, missed
notifications and a personal daily brief. The employee retains important decisions.

Draft 07 depends on earlier shared source and on selected audio under `work/`
in the original repository; the production manifest is not a portable dependency
bundle, and this copy cannot rebuild Draft 07 by itself. Build instructions are
for an authorized revision or rebuild, not a required step when resuming the project.

The broader product is intentionally documented separately from the video.
A rendered concept scene is not proof that the depicted feature exists.
