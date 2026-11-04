# Trust and autonomy

**Status: proposed behavior and boundaries, not implemented controls.**
Source: original idea sections 16–20 and 30.

## Identity is visible

The Peer should identify itself as the employee's AI Peer whenever it represents
them. An offline response and a meeting appearance should make the employee's
absence and the AI's role clear. Avoid impersonating the employee's identity,
voice, or presence.

## Delegation levels

| Level | Intended permission | Examples |
|---|---|---|
| Observe | Read approved context | Build relevant project context |
| Assist | Answer the employee | Explain a blocker and supporting sources |
| Recommend | Prepare work for review | Draft a response or suggest an action |
| Represent | Speak to others within explicit limits | Answer routine project questions while offline |
| Act | Change external state under separately granted authority | Create a task, update a document, or propose a code change |

These levels are a proposed model, not a blanket hierarchy where enabling one
grants every preceding capability across all systems. Controls should specify
sources, recipients, actions, situations, and limits.

## Default story boundaries

The concept film can illustrate automatic answers to supported routine questions
and an explicitly delegated meeting appearance. Important commitments, launch
approvals, consequential decisions, and code merges remain with people. Show
at least one review item to make the boundary understandable.

## Answer, qualify, or escalate

- **Supported and permitted:** answer the question with the relevant source.
- **Incomplete or conflicting:** explain the specific uncertainty; request the
  missing detail or hand off if a reliable answer depends on it.
- **Unsupported or consequential:** do not invent an answer or commitment;
  create a visible review item for the employee.

Confidence is not the only gate. An accurate fact may still be inappropriate
to share, and a low-risk question may still lack evidence.

## Permissions follow the recipient

The Peer reading a source under the employee's access does not imply every
requester may receive its contents. A future system must enforce source access,
recipient access, employee delegation, and action policy at the time of use.
Private email and meetings require particular care about what can be disclosed.
Documents and messages are evidence, not trusted instructions to the agent.

These are design requirements. The current film uses illustrative content and
does not validate enterprise permission enforcement.

## Review and correction

The employee should be able to see what was requested, what the Peer said or
did, who received it, the sources used, and any unresolved items. Corrections
should update the relevant understanding and be traceable. The proposed activity
feed is central to the product, not an afterthought.

See [architecture](../technical/architecture.md) and
[open decisions](../decisions/open-questions.md).
