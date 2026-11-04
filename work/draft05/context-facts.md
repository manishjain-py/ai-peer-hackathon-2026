# Draft 05 — factual context and story guardrails

Reviewed on 19 September 2026 by an independent factual/story reviewer.
Source: the user-supplied `manish-jain-and-risk-partner-systems.md`, prepared
19 September 2026, read in full. No linked internal system, repository, PR,
directory, or production environment was accessed for this review.

The film may use the real names and dated facts below. Its conversations,
screens, notifications, colleague commitments, local-work activity and outcomes
are authored concept scenes, not transcripts or evidence that AI Peer exists.

## Compact fact matrix

| Topic | Supported fact | Screen-friendly use | Do not imply |
|---|---|---|---|
| Person | Manish Jain; Airbnb; Senior Software Engineer, Payments; Bangalore, from an August organization snapshot | “Manish Jain / Risk Partner Systems / Payments” | A freshly verified live directory profile; exact title needs August qualification in provenance |
| Team | Risk Partner Systems, team 4982; older names include Payments Risk Tooling | “Risk Partner Systems” and `#risk-partner-systems` | The older label is the current preferred team name |
| Main service | Pennyworth: payments-risk case prioritization, routing and queue operations; recorded code ownership belongs to RPS | “Pennyworth · case routing” | Every risk system or the case platform belongs to RPS |
| Frontend | `nova-disputes`: RPS-owned package in Pineapple, providing payment-risk investigation content in Atrium/Nova | “nova-disputes · investigation UI” | RPS owns Pineapple, all Atrium/Nova, or all queue infrastructure |
| Other owned area | Compass `risktooling` action package and payments-risk UDS schema area | Optional detail only | RPS owns the complete Compass or UDS platform |
| Shared dependencies | D-REX, Cassette, Viaduct, Nova, Orders, Stays, Kyoo and Quarterback span other teams/platforms | “Works with D-REX + product owners” | These are all RPS-owned services |
| Steward | Partner Experience Foundation owns inspected Steward repository; RPS integrates/onboards | “Steward collaboration” | RPS owns Steward or production autonomous investigations exist |
| Current main project | Premium-product chargebacks: Weather Protection (WP), Synthetic Cancellation (SC), Cancel For Any Reason (CFAR) | “Premium-product chargebacks / Atrium” | “Chargebacks” is a confirmed service name |
| Manish's current scope | Disputed-product data contract, dispute-breakdown UI, SC/CFAR policy results, on-call | Personal brief and Slack/Zoom premise | All premium-policy work is complete |
| Dated project state | See status table below | Source stamp “Project handoff · 19 Sep 2026” | A current live PR refresh or production verification |
| Earlier automation work | CBQ automation prototype; shadow runs compared machine and human investigations | Opportunity card tied to CBQ experience | Autonomous production remediation |
| Real colleagues | Charan Batchu: WP policy integration/display; Neel Jain: saved manager/team sprint participant; others listed in source | Charan and Neel can be authored Slack/Zoom roles | Actual quotes, meeting participation, promises or approval from these people |
| AirChat | User describes AirChat as an AI coding agent and requests a proposed AI Peer plugin to observe chosen local/in-progress/uncommitted work | “AirChat / AI Peer plugin / Local work · not committed” | Existing installed plugin, actual local scanning, universal access, or proven implementation |

## Exact premium-chargebacks status as of the supplied 19 September handoff

| Item | Status that can be stated | Important boundary |
|---|---|---|
| D-REX disputed-product contract | Schema and producer PRs recorded as merged | “Merged” does not mean production rollout verified |
| Dispute-breakdown UI | Pineapple PR 307733 is draft | Not released/ready for broad production |
| SC/CFAR backend | Treehouse PR 1124148 is draft | Backend deployment must precede production-schema UI validation |
| SC/CFAR policy UI | Pineapple PR 308269 is draft | No claim new UI is production-ready |
| End-to-end validation | A newly populated D-REX-to-DCQ case remains unverified | Automated and browser checks are not this runtime confirmation |
| SC policy | Interim stored Order-item expiry compared with cancellation time | Applicability condition and deeper historical/reversion cases deferred |
| CFAR policy | Owner-confirmed `hostRespondedAt` purchase-date source and qualified base-policy result | Do not conclude no refund was due or paid |
| WP | Subtype identification and completed policy-outcome integration remain follow-ups | Sceptile sprint work does not prove end-to-end completion |

## Recommended story through-line

Keep the focus/attention opening and present the setup as a connected understanding
of **Manish → Risk Partner Systems → Pennyworth + nova-disputes → premium-product
chargebacks**. Remove Sourcegraph completely from Draft 05 narration, visuals,
captions and source descriptions. GitHub establishes checked-in code, ownership
and draft PR state; AirChat makes the proposed additional value concrete: chosen
local work that has not been committed yet. Keep the source labels distinct.

Use **one grounded project** for the personal brief, Slack clarification, Zoom
status and return. The question is: **what is required to validate premium-product
chargebacks in Atrium?** This replaces invented hourly feeds, aggregate/final-result
requirements, fabricated migration deadlines and invented “build ready” status.

### Suggested setup language

- “GitHub connects your code, services, and recent changes.”
- “Add the AI Peer plugin in AirChat. It can follow your in-progress work—even before you commit.”
- GitHub visible rows: `Pennyworth · routing service`; `nova-disputes · UI package`; `Premium-product chargebacks · draft PRs`.
- AirChat visible rows: `Selected projects`; `Local changes · not committed`; `Current task + next check`.
- If showing a specific AirChat local task, call it a **concept example**. The supplied profile does not establish any particular current local diff, test result, or uncommitted file.

### Suggested personal brief language

1. “First, premium chargebacks. The D-REX changes are merged, but your UI and backend are still in draft. Backend deployment comes before the real-case check.”
   - Source: “Project handoff · 19 Sep 2026.”
   - Prepared next step: “Deploy backend → validate a populated D-REX case.”
2. “Weather Protection still needs product identity and policy outcomes confirmed. I've drafted the questions for Charan and the product owners.”
   - Source: “Handoff + 15 Sep sprint.”
   - This is an authored Peer action. Do not show actual sent messages or confirmed answers.
3. “And your CBQ automation experience could become a hackathon idea. I've pulled together a starting point for you.”
   - Source: “CBQ prototype notes → idea draft.”
   - Avoid a real registration date, official event time or agent-track claim; none is supported by the file.

### Suggested Slack dialogue

Set in `#risk-partner-systems`; keep the single two-a.m. cue here.

- Charan: “Manish, should the chargeback show one total, or the amount for each product?”
- Colleague: “It's two a.m. for him.”
- AI Peer: “I'm Manish's AI Peer. Each disputed product, with its amount. Here's the D-REX contract.”
- Charan: “Got it. I'll bring a populated case for validation.”
- AI Peer: “Thanks. I'll add that to his morning brief.”

The requirement is grounded. Charan's question and promise are authored dialogue.
Do not claim that the promised case has arrived or passed validation in the return.

### Suggested Zoom dialogue

Address the visibly labelled AI Peer directly. No second overnight explanation.

- Neel: “Manish's Peer, where are we on premium chargebacks?”
- AI Peer: “The D-REX changes are merged. Our UI and backend are in draft. A real case still needs validation.”
- AI Peer: “Charan's offered to bring the case.”
- Charan: “Yes. I'll help with that check.”
- Neel: “Can we commit to Friday?”
- AI Peer: “That's Manish's call. I'll bring him the checks and the decision.”

If the first reply is too dense at the existing timing, split the source-state
summary into three clear on-screen chips and keep speech natural. Do not speed the
voice excessively to preserve a fixed duration.

### Suggested return

- Narrator: “Morning. The requirement is clear, and a case has been offered for validation.”
- AI Peer: “Next, deploy the backend, validate the new case, then decide the date. Your hackathon idea is saved.”
- Keep the final decision visibly **Manish to review**.

## Required reality cues

Use a readable persistent scene-level cue such as **“Concept demo · authored
scenario”**, plus a dated source label where status appears. “Real team context;
illustrative conversations and interfaces” is useful in the closing provenance.
This is a stronger fit than blanket “all names fictional,” because the user has
explicitly supplied and authorized actual names. Generated portraits and voices
must not be represented as actual likenesses or voice clones of real colleagues.

## Review checklist for root script and render

- No Sourcegraph in the new composition/script/captions.
- AirChat adds uncommitted/in-progress local work distinctly from GitHub.
- RPS owns Pennyworth and the nova-disputes package, not all dependencies.
- Premium-chargebacks status remains dated, draft, and unverified end to end.
- No invented confirmed deadline, rollout completion, successful case, deployment or approval. An authored question about a possible Friday commitment is fine if it remains undecided.
- Human colleagues' lines clearly belong to an authored scenario.
- Peer identifies itself as AI and defers the launch commitment to Manish.
- Voice timing supports conversational speech; draft status remains readable.
