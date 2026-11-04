# Hackathon scope and future vision

**Current deliverable: the AI Peer concept film. Draft 07 is a 4:23 cut with a seated photographic opening and a clearer cross-team Zoom scene, four use-case chapters, new ElevenLabs speech, real RPS context and proposed AirChat local-work setup.**
No live product, connector, meeting bot, or representation agent is implemented.

## Three different scopes

| Scope | Purpose | Status |
|---|---|---|
| Concept film | Make the intended experience clear and memorable | Drafts 01–06 preserved; Draft 07 rendered with illustrative UI and authored scenario content; see [current state](../progress/current-state.md) |
| Bounded hackathon prototype | Validate a small source-grounded conversation flow | Proposed; implementation decisions remain open |
| Enterprise product | Continuously current personal context and controlled representation across systems | Longer-term vision |

## Film priorities

- Establish the employee’s attention problem and the team’s need for their context.
- Give the personal daily brief a central role: relevant changes, events and opportunities, with sources and next steps.
- Show a Peer learning a small, understandable set of employee context.
- Demonstrate one useful offline clarification with visible evidence.
- Include a transparent meeting appearance as the visual high point.
- Return to a reviewable morning handoff and a human decision boundary.

The final film should be explicit in its surrounding presentation or unobtrusive
in-film label that it is a concept demo with illustrative data. It must not present
a simulated conversation as footage from a functioning integration.

## A possible minimum prototype

A later implementation could focus on one employee, one project, a few approved
documents and messages, one clarification thread, and a read-only activity feed.
It could retrieve evidence, draft a response, apply a simple permission/approval
gate, and record what happened. Keep the graph small and inspectable.

Slack posting and meeting participation would be separate integration tasks,
with their own authorization, identity, access, and runtime requirements. A
scripted meeting scene does not require shipping a live meeting bot.

## Beyond the initial scope

Organization-wide discovery, continuous multi-source synchronization, scalable
permission propagation, calibrated confidence, full conflict resolution,
autonomous code changes, live voice participation, and Peer-to-Peer negotiation
belong to the broader roadmap. They should not be implied by the first render.

## What success would mean

For the film: a viewer understands who the Peer helps, why personal context
matters, how the offline conversation moves forward, and where human control
remains. No business metric is claimed as measured.

For a later prototype: test whether a bounded grounded answer is useful,
appropriately disclosed, current enough, and correctly escalated when necessary.
Define evidence and acceptance criteria before calling a capability implemented.
