# Feedback round after Draft 05

Captured: **2026-09-19**. Status: **incorporated in Draft 06 and delivered**.

[Completed film](../../renders/ai-peer-draft-06.mp4) · [Storyboard](draft-06-storyboard.md)

Manish initially asked to collect points without changes. After point 5 below,
he explicitly said this was the final feedback and to incorporate the round.
The collection-only directions preserved below describe the earlier holding
period; they no longer block implementation.

## 1. Make each impact clear; show proactive discovery through BOBO

- Present each featured use case and its impact carefully and clearly. Later,
  explain that these are a few examples among countless other use cases AI Peer
  could unlock.
- Manish reports a real Airbnb launch: **BOBO — Booking on Behalf Of**, allowing
  someone to book on behalf of a guest. He says the payments risk team was not
  consulted about chargeback handling for this product before it launched.
- Proposed AI Peer behavior: follow major company projects and launches, connect
  them to Manish's payments-risk responsibilities, and spot relevant work where
  he or his team may not have been included.
- Illustrative alert: this launch may affect chargebacks; it looks like you may
  not be in the loop. Contact the relevant product owner to check whether payments
  risk needs to be involved.
- Manish suggested a contact such as “Alex from the guest and host team” as an
  example. This is a placeholder, not a verified name, team or product owner.
- Intended impact: surface a missed cross-team dependency in time for Manish to
  investigate and act, helping prevent a real operational problem. The story
  should make the connection from company event → relevance to his work → gap
  detected → timely alert and concrete next step easy to understand.
- Source boundary: the launch and missing consultation are user-reported facts,
  not independently verified here. AI Peer detecting or preventing this issue is
  a proposed scenario, not something that actually happened. Do not invent a
  realized chargeback loss or a measured saving.

## 2. Resolve clarification across time zones; introduce use cases with title cards

- Manish reports a real premium-chargebacks collaboration problem: he needed
  guidance from US-based data-owning teams on fetching the synthetic cancellation
  window time for the dispute classification queue.
- His initial message asked how to fetch that data. A data-team engineer replied
  during US working hours, asking what the use case was. Manish was asleep and
  could only respond the next day, when the US engineer was offline. A simple
  clarification therefore required another cross-time-zone exchange.
- The needed explanation: dispute agents need to see whether a guest canceled
  within or outside the flexibility window, helping them make an informed
  assessment of the chargeback. Preserve this clear business reason; the timing
  information supports the agent's decision rather than deciding the case alone.
- Proposed AI Peer scenario: while Manish sleeps, his Peer answers the engineer's
  use-case question using his project context. The engineer can investigate and
  return useful data-access guidance during the same working period, without
  waiting for Manish to wake up and explain.
- Manish's example response was to query an “expire at” date from the order
  service, “something like that.” Treat that field/service mapping as illustrative,
  not a confirmed technical contract. The exact spelling and source remain open.
- Intended impact: make the avoided back-and-forth obvious and understandable:
  question → overnight clarification request → Peer explains the business need →
  data owner supplies guidance. Show faster collaboration across time zones, with
  a clear before/after comparison rather than unexplained technical dialogue.
- Source boundary: the collaboration problem is user-reported real experience.
  AI Peer's participation and the accelerated outcome are the proposed demo
  scenario, not evidence of an implemented Peer or measured time savings.
- Presentation direction applies to **every featured use case**: show them one
  at a time in distinct sections. Introduce each with a dedicated full-screen
  title card, then demonstrate that use case, then introduce the next title.
  Titles should be neat, concise and immediately explain the use case. Create
  and refine those titles only when Manish asks to incorporate this round.
- Keep the explanation clean and simple enough that viewers unfamiliar with
  premium chargebacks understand both the question and the collaboration win.

## 3. Use ElevenLabs; cast natural voices to suit each role

- Manish did not like the current voices: some sound artificial, and some have
  excessive excitement for the situation. Replace them with more natural,
  human-like performances using **ElevenLabs** when this round is incorporated.
- He expects an ElevenLabs API key to already be stored on this machine, used
  by the **Like Magic** repository for audio generation. When implementation is
  authorized, inspect that repository's existing audio setup to locate and reuse
  the credential securely. Its presence and location have not been checked yet.
- Choose voices deliberately for each use: clear explanatory narration,
  believable team-member dialogue, and the Peer role. Match tone, energy and
  delivery to the scene and speaker, rather than applying an excited advertising
  delivery to ordinary workplace conversations.
- Assess the available ElevenLabs voices and select suitable performances;
  Manish has not specified particular voice IDs or asked to imitate colleagues.
- Collection-only mode still applies: do not search for credentials, select
  voices, call the API or regenerate audio until he explicitly asks to
  incorporate this feedback round. Do not record secret values in project docs.

## 4. Recover missed notifications and offer useful next actions

- This use case is about important notifications being missed across Gmail,
  Slack, invitations and personal work milestones. Example trigger: Manish
  marks roughly 150 emails as read to clean up his inbox, inadvertently missing
  an important upcoming fireside chat. A message being marked read should not
  automatically mean its relevance or required action has been handled.
- AI Peer should surface overlooked items based on Manish's interests,
  responsibilities and relationships, explain why each matters, show its source
  and make it easy to act. Preserve the distinction between these examples and
  the BOBO launch/consultation-gap example; both support proactive awareness.

### Airversary appreciation

- Illustrative reminder: Yash's **five-year Airversary** is coming up. Vijay
  shared a group appreciation message where Manish can add his appreciation.
- Show a compact **Gmail-branded widget** with a short summary, preview of the
  original email/message and a direct link to add appreciation.
- “Airversary” is the Airbnb work-anniversary term supplied by Manish. The
  anniversary, year count and message are proposed examples, not verified events.

### A relevant fireside chat that slipped through

- Illustrative event: a fireside chat for Airbnb with the creator of Claude Code.
  Manish supplied the speaker name as “Boris Jerny”; check the exact spelling
  when incorporating rather than silently treating the transcript as verified.
- Peer explains the personal relevance: because of Manish's interest in AI,
  this looks like something he would enjoy. It notices that the invitation has
  neither been accepted nor rejected, and asks whether he may have missed it.
- Provide clear options to **accept**, **reject/decline**, or **ignore** the
  invitation, then show the Peer carrying out Manish's chosen action. Pending
  response is a reason to check, not proof that he missed the invitation.
- The event and invitation are illustrative; no real event schedule, invitation
  or speaker participation has been verified during feedback collection.

### A missed Slack request or platform change

- A lightweight example could be a request to complete a survey posted in a
  Slack group three days earlier that Manish overlooked.
- The stronger operational example concerns **Cassette**. Manish says this is
  the platform used to create cases for the **chargeback review queue** and the
  **dispute classification queue**.
- An upcoming change or downtime announcement in the Cassette channel could
  affect those queues. The announcing team may not know the relevant points of
  contact. Peer connects that platform announcement to Manish's work, surfaces
  the possible impact and points him to the original thread.
- Suggested demo behavior/message: “I've tagged you there and am flagging this
  because it could affect your queues; you may want to check the thread.” Keep
  the tagging as part of the proposed scenario; do not send or tag anyone now.
- Cassette's relationship to the queues is user-supplied context. The specific
  announcement, downtime, missed survey, tagging and resulting impact are
  illustrative, not actual observed activity.

## 5. Give the opening employee a natural emotional arc

- Start with the man arriving happily and energetically, sitting down in his
  chair and beginning his work.
- As notifications accumulate, evolve his expression and body language from
  happy to subdued, worried and anxious. Show the change progressively so the
  audience feels the cost of fragmented attention.
- Manish marked this as the final feedback and explicitly authorized
  incorporating the complete round. Preserve Draft 05; develop Draft 06.
