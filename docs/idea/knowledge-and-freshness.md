# Knowledge, relevance, and freshness

**Status: proposed product requirements.** No discovery or synchronization service
has been implemented. Source: original sections 4–6 and 22–25.

## Start from the employee

The proposal begins with a company profile and expands through permitted,
relevant links: employee → team → projects → repositories/documents/channels →
collaborators → dependencies. It should not indiscriminately ingest the company.
The original mentions OneAirbnb as a possible profile source; this is not a
confirmed API, integration, or access grant.

Useful relevance signals could include ownership, authorship, current project
membership, recent contributions, recurring collaboration, and explicit employee
selection. Relevance affects discovery/ranking; it never grants access.

## Local work before it reaches GitHub

Manish’s 19 September clarification adds a proposed **AI Peer plugin for AirChat**.
It would observe selected local projects, the current task/state and uncommitted
changes, keeping the Peer aware of work that has not yet been committed or pushed.
This complements GitHub’s versioned code, reviews and draft PRs; checked-in does
not mean finished, and local draft does not mean deployed.

Keep local context attributed to its workspace/session and timestamp. The Peer
should distinguish an intended change, a working-tree edit, a draft PR, a merge,
a deployment and a validated production result. Local examples introduced in
Draft 05 and retained in Draft 07 are simulated; the plugin is not implemented
or installed by this project. The user describes AirChat as the coding-agent
environment; its internal backend choices
are not needed to explain the film’s product benefit.

## Personal relevance and daily briefs

The employee should receive useful awareness, not every company update. Link
a permitted new signal to a specific owned service, active project, unresolved
question, upcoming commitment or explicitly saved interest. Show that connection
so the employee can understand or correct the ranking. Do not infer sensitive
personal traits to manufacture relevance.

A brief should distinguish action needed, a useful event, and an optional
opportunity. It can prepare an affected-code review, a question for office hours
or a draft pitch. Attending, registering, sending and committing are separate
actions with their own authority. Urgent alerts and a daily summary should have
user-controlled preferences; continuous awareness need not mean constant interruption.

This is intended behavior. The current film simulates sources and timestamps
and does not establish working continuous monitoring.

## Recovering overlooked items

A read email is not necessarily handled; an unanswered invitation is not proof
that it was missed. Surface important items with a source preview, a reason for
relevance, and a concrete next action. Respect an explicit dismiss/ignore choice
and distinguish response status from message read state.

Company-launch and platform-change awareness should connect the source to an
owned responsibility or downstream dependency. If the Peer cannot find the
employee in a discussion, frame missing involvement as a gap to check, not proof
that no consultation happened. The BOBO experience and Cassette examples
introduced in Draft 06 and retained in Draft 07 illustrate the intended behavior;
they do not establish live monitoring. Supplied professional context keeps its
September/August 2026 source dates; the later handoff and documentation updates
do not make those facts current or establish a live company refresh.

## Proposed knowledge representation

Use explicit relationships alongside searchable text and source metadata.
Possible entities include people, teams, projects, services, documents, decisions,
conversations, tasks, incidents, and dependencies. Example relationships include
works_on, owns, depends_on, documented_in, discussed_in, and supersedes.

A graph makes relationships inspectable; semantic retrieval helps locate
supporting passages. Neither is sufficient to guarantee understanding or factual
accuracy. A bounded prototype can use structured records and a small set of
searchable sources without operating a full graph database.

## Evidence attached to a claim

An important fact should retain its source identifier/link, supporting excerpt
or location, source author/owner where available, source modification time,
retrieval time, access scope, and any superseding or conflicting evidence.
Distinguish “source updated yesterday” from “checked a moment ago.” A fresh
retrieval does not make an old fact current.

For example, a proposed launch date should show the plan it came from and
whether an authorized later decision changed it. A recent informal message
does not automatically outrank an approved plan; authority depends on the question.

## Staying current

A future implementation could combine source events/webhooks with scheduled
reconciliation. Updates should refresh affected facts and relationships, not
simply append another embedding. Deletions and revoked access must invalidate
stored content and future disclosures as well.

When evidence conflicts, retain the conflict and request clarification if the
answer depends on it. When the source is unavailable or stale, tell the requester
what is known and what cannot be confirmed. Avoid invented precision such as a
confidence percentage without a calibrated basis.

## What the concept film may demonstrate

The film can visualize a small graph, source chips, a last-updated label, and
an update flowing into a relevant project. These are authored demo states.
They demonstrate the intended experience; they do not prove that discovery,
continuous synchronization, permission propagation, or conflict resolution works.

See [proposed architecture](../technical/architecture.md) for components and
[trust and autonomy](trust-and-autonomy.md) for answer/disclosure rules.
