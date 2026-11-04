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
media hashes and production-manifest files. A [smaller preview](renders/ai-peer-draft-07-preview.mp4)
and [caption sidecar](renders/ai-peer-draft-07.srt) are available. Drafts 01–06
remain preserved. Manish's creative acceptance or targeted feedback is pending;
no further render, delivery, revision or prototype work is currently required.

No live AI Peer product or enterprise integration is implemented. Supplied
professional context retains its September/August source dates; conversations,
interface states and AI actions are authored scenarios. See
[current state](docs/progress/current-state.md) for verification details and
the [ownership handoff](docs/progress/session-handoff-2026-11-01.md) for context.

Source control lives in the private
[AI Peer GitHub repository](https://github.com/manishjain-py/ai-peer-hackathon-2026)
on `main`. Media uses Git LFS. Follow the
[repository and restoration guide](docs/technical/repository.md) when cloning
or moving to another machine; the dated handoff predates Git setup.

## Resume with the AI Peer skill

In a new local Codex session, type `$ai-peer` for a short catch-up, or add your task:

> $ai-peer Make the opening of the demo video more energetic.

The [project skill](.agents/skills/ai-peer/SKILL.md) reads the root instructions and
latest saved state, then loads the documents needed for your request. On this Mac,
`~/.codex/skills/ai-peer` links to this project skill so it can be discovered from
other workspaces too. If the skill does not appear in a new session, restart Codex.
If the project folder moves again, update that global link.

## Start by what you need

| You want to… | Open |
|---|---|
| Resume work in a new session | [AGENTS.md](AGENTS.md), then [current state](docs/progress/current-state.md) |
| Understand the idea quickly | [Product overview](docs/idea/overview.md) |
| Explore the full original vision | [Unedited source](source-material/ai-peer-original.txt) |
| Understand demo scenarios and boundaries | [Use cases](docs/idea/use-cases.md), [hackathon scope](docs/idea/hackathon-scope.md) |
| Understand the proposed system | [Architecture](docs/technical/architecture.md) |
| Work on the film | [Video documentation](docs/video/), [video source](video/), [renders](renders/) |
| Understand the visual references | [Reference guide](references/README.md) |
| See decisions and work history | [Decisions](docs/decisions/README.md), [session log](docs/progress/session-log.md) |

## Project map

```text
AGENTS.md                 Compact instructions and selective reading routes
source-material/          Complete original user idea, preserved unchanged
docs/idea/                Product vision, scenarios, knowledge, trust, scope
docs/technical/           Proposed architecture and implementation status
docs/video/               Film-specific planning and production instructions
docs/decisions/           Accepted working choices and open questions
docs/progress/            Current handoff and append-only session history
references/               Notion/Slack study and reusable production recipe
video/                    Editable film source, assets, and build files
renders/                  Reviewable video exports
work/                     Production evidence, reusable audio and intermediate files
```

The visual direction combines the Slack Canvas reference's connected narrative
with the Notion AI reference's clear typography and focused motion. Draft 07
connects a seated photographic opening and personal setup to BOBO awareness,
cross-time-zone Slack clarification, a generic cross-team Zoom exchange, missed
notifications and a personal daily brief. The employee retains important decisions.

Preserve the complete workspace. Draft 07 depends on earlier shared source and
selected audio under `work/`; the production manifest is not a portable dependency
bundle. Build instructions are for an authorized revision or rebuild, not a
required step when resuming the project.

The broader product is intentionally documented separately from the video.
A rendered concept scene is not proof that the depicted feature exists.
