# Manish Jain and Risk Partner Systems

Prepared on **19 September 2026** from team documentation, September sprint notes, local repository ownership files, and the premium-chargebacks project handoff.

This document describes Manish's professional context, the team's responsibilities, its software, current projects, and partner dependencies. Project status is dated: a sprint assignment records planned work, while a merged change, a deployment, and a production rollout are separate milestones.

## 1. About Manish

| Detail | Profile |
| --- | --- |
| Name | **Manish Jain** |
| Company | **Airbnb** |
| Team | **Risk Partner Systems**, within the Payments engineering area |
| Role | **Senior Software Engineer, Payments**, as recorded in the saved August 2026 organization snapshot |
| Location | **Bangalore**, according to that organization snapshot |
| At Airbnb since | **4 October 2021**, according to that organization snapshot |
| Work email | `m.jain@airbnb.com`, also confirmed by the September sprint document |
| GitHub Enterprise handle | `m-jain`, recorded in the team's research notes |
| Manager | **Neel Jain**, according to the August organization snapshot; he also appears in the September team sprint notes |

Manish works on the systems that help Payments Risk Operations investigate suspicious payments, reservations, accounts, and disputes. His work connects the analyst experience in Atrium with backend case data, payment information, product policies, and the services that carry out decisions.

His documented responsibilities include chargeback-prevention workflows, investigation-tooling improvements, coordination with partner engineering and Operations teams, and exploration of automated investigations. The September sprint notes specifically assign him the SC/CFAR policy-result work for premium-product chargebacks and on-call responsibilities. Earlier work includes the CBQ automation prototype and Atrium post-launch improvements.

The premium-chargebacks project illustrates his role particularly well: he coordinates the data contract with D-REX, works with product owners to establish the correct policy fields, implements the frontend and backend integration, and verifies that the result gives an investigator useful evidence without claiming more than the underlying data supports.

Manish prefers concise, plain explanations that lead with status, decisions, blockers, and next steps. He values deeper technical detail when it changes a decision, and distinguishes his own manual verification from automated checks or another person's findings.

**Sources:** [September 15 sprint][sprint-sep15], [September 1 sprint][sprint-sep1], [saved organization profile][org-notes], and [premium-chargebacks handoff][premium-handoff]. Personal title, location, tenure, and reporting details above retain their August source date; they were not independently refreshed from a live employee directory for this document.

## 2. The team and its mission

The team's current name is **Risk Partner Systems**, abbreviated here as **RPS**. Older documents and code also use **Payments Risk Tooling**, **Risk Tooling**, and **Risk Partner Experiences**.

The team's catalog ID is **4982**. Its internal Slack channel is `#risk-partner-systems`, its operational intake channel is `#payments-risk-partner-goalie`, and its group email is `risk-partner-sys@airbnb.com`.

RPS builds and maintains the tools that payments risk analysts use to investigate risks identified by Airbnb's detection systems. Its catalog description includes chargeback and dispute handling, transaction monitoring, distinguishing fraud from false positives, and supporting investigation of emerging fraud patterns and rings.

The team's main responsibilities are:

- **Case lifecycle and routing:** keep investigation work available, organize it into queues, prioritize it, and assign it to authorized analysts.
- **Investigation experience:** give analysts the reservation, account, payment, dispute, and risk context they need in Atrium.
- **Decision workflows:** support structured investigations and connect the analyst's decision to the relevant policy and action systems.
- **Operational visibility:** expose queue health, case metrics, and useful investigation activity data.
- **Investigation intelligence:** improve access to fraud trends and support evaluation of AI-assisted or automated review.

RPS owns substantial parts of the investigation process. Transaction Risk and D-REX generally own the risk detection, enqueue policies, and remediation policies that determine why a case exists and which actions a particular risk decision should produce.

**Source:** [Risk Partner Systems service catalog][team-catalog] and [team orientation][orientation].

## 3. The investigation workflows we support

| Workflow | Meaning | Why it exists |
| --- | --- | --- |
| **CBQ** | Chargeback Prevention Queue | Review suspicious bookings while there is still an opportunity to prevent a future chargeback loss. Investigations can involve guest fraud, account takeover, host–guest collusion, and suspicious inventory. |
| **DCQ** | Dispute Classification Queue | Investigate chargebacks and relevant pre-dispute reports, classify fraud versus non-fraud, and establish the reason and responsible parties. |
| **PDQ** | Payout Review Queue | Investigate high-risk host payouts before the money is released. One payout can cover multiple reservations. |
| **Pre-Arb** | Pre-Arbitration | Support review of disputes at the pre-arbitration stage, where processor deadlines affect the remaining opportunity to contest a dispute. |
| **UAT** | Unauthorized Transactions | Handle reports that a payment was unauthorized, including transfer from Customer Support to Payments Risk Operations. UAT is implemented as a DCQ sub-queue. |
| **PROSS** | Payments Risk Ops Suspended State | Support the operational review workflow for suspended-state cases. |
| **PNR** | Payout Not Released | Give Operations a dedicated workflow for investigating payouts that have not been released. |
| **IUE** | Internal Urgent Escalations | Handle urgent cases escalated internally to Payments Risk Operations. |
| **OSLO** | Online SIMI Labeling Operations | Produce human risk labels. The documented migration represents this work as CBQ cases with labeling-only behavior, which suppresses remediation. |

These are workflows and queue configurations across shared platforms; they are not nine separate backend services.

One useful distinction is **IHR**, or **In-House Representment**. It refers to dispute representment associated with the D-REX/Suez/Naha systems, rather than another RPS inbox queue.

**Sources:** [team orientation][orientation] and [team master document][team-master].

## 4. Tools, services, and code areas the team owns

Ownership has several forms here: an independently operated service, a package within a shared application, a data model, or a business workflow that spans other teams' systems. The table below names the concrete owned areas without treating the entire surrounding platform as RPS-owned.

| Area | What it is | Ownership evidence |
| --- | --- | --- |
| **Pennyworth** | The main Payments Risk Tooling backend service | Its local `project.yml` names team **4982**, and its `OWNERS` names `airbnb/payments-risk-tooling`. |
| **Fraud-trend matching in Pennyworth** | An investigation-support capability within Pennyworth | Implemented under Pennyworth, with Atrium and Steward integrations. It is a feature of the service rather than a separate service. |
| **`nova-disputes`** | The investigation and dispute UI package in Pineapple | Its local `OWNERS` names `airbnb/payments-risk-tooling`. Its broader project metadata still names Community Partner Engineering, so package approval ownership and catalog metadata are not identical. |
| **Compass `risktooling` actions** | Payments-risk actions inside the shared Compass service | Both the implementation and test package `OWNERS` name `airbnb/payments-risk-tooling`. |
| **Payments-risk UDS schema area** | Data models supporting the tooling | The schema directory `OWNERS` names `airbnb/payments-risk-tooling`; the `PaymentsRiskCase` model explicitly names team **4982**. |

These ownership files were read from the local checkouts on **19 September 2026**. They establish the recorded code approval boundaries; they are not a complete audit of production operational responsibility.

### Pennyworth: prioritization, routing, and queue operations

Pennyworth answers a practical question: **which case should this analyst work on next?**

It maintains a compact index of payment-risk cases in UDS, computes their priority, and supplies the claim and queue-metrics APIs used by the analyst experience. The case record itself is accessed through Cassette; Pennyworth's index provides the efficient queries needed for routing.

Its responsibilities include:

- Consuming case lifecycle events and updating the routing index.
- Applying queue-specific prioritization rules, including booking timing for CBQ and dispute deadlines for Pre-Arb.
- Checking which queues an analyst can access.
- Finding eligible cases and coordinating claims so that simultaneous analysts do not both acquire the same case.
- Providing queue information such as claimed and unclaimed work, backlog age, and relevant SLA counts.
- Connecting case events to investigation-support features.

For example, when an analyst presses **Get a case**, the frontend calls through Viaduct to the routing path. Pennyworth finds an eligible case using its index, rechecks the case through Cassette, and coordinates the assignment. This combines fast queue selection with a check against the authoritative case state.

Pennyworth is primarily Kotlin. Its API and event-consumer deployments share application code, so identifying which deployment handles a particular operation matters during debugging.

### Fraud-trend matching: finding known schemes relevant to a case

Payments Risk Operations maintains a catalog of known fraud trends. Pennyworth's matching capability helps an investigator find catalog entries that resemble the case under review.

The documented implementation ingests curated trend descriptions, extracts structured characteristics, creates embeddings, gathers comparable case characteristics from partner services, and ranks relevant trends. It returns a shortlist with supporting comparisons and links back to the source material.

An analyst might use this to investigate whether a suspicious booking resembles a known pattern involving particular payment characteristics, locations, account relationships, or booking behavior. The shortlist supports the investigation; a similarity score alone does not establish that the case is fraudulent.

The integrations include the Atrium **Fraud Trend Match** view and a Steward observation agent. September sprint notes record further work to agree the direction of fraud-trend matching, so the existing capability should be distinguished from the follow-up proof of concept and roadmap discussions.

### `nova-disputes`: the analyst's investigation view

`nova-disputes` is a TypeScript/React package in the Pineapple frontend monorepo. It provides payment-risk investigation content within the broader Nova/Atrium workspace.

This is where work such as clearer dispute details, reservation and payment context, investigation signals, and premium-product chargeback information becomes visible to an analyst. The current dispute-breakdown and SC/CFAR policy-result work is an example of extending that experience.

The package sits inside a larger system. The Nova/Atrium shell, shared case components, queue configuration, and guide runtime have their own owners. Consequently, a change to the analyst experience can require both an RPS package change and work or review from a shared-platform team.

### Compass risk-tooling actions: steps inside an investigation

Compass supports actions performed during a workflow. RPS owns the `risktooling` package within it, rather than the whole Compass service.

Examples in that package include selecting payments queue configuration, searching for a reported transaction, checking transaction status, updating or closing a case, transferring a case back to Customer Support, and sending a configured macro email.

These actions are especially relevant to UAT and case-transfer workflows. They help turn an investigator's next step into a consistent operation across transaction lookup, case state, and communication.

### Payments-risk data models: the routing record

The most directly relevant model is **`PaymentsRiskCase`**. It includes the case number, type, subtype, priority score, optional assignee, lifecycle timestamps, and a soft-delete marker used by the routing index.

Its indexes support queries such as finding open unassigned cases of a particular subtype in priority order. That is what allows Pennyworth to select work efficiently without reconstructing every case's complete investigation data on each request.

This model represents the routing view of a case. It should not be treated as the complete case history or as ownership of the UDS platform. Other models under a shared schema directory can retain different model-level ownership annotations.

**Sources:** [Pennyworth reference][pennyworth-notes], [frontend reference][frontend-notes], [decision-path reference][decision-notes], [fraud-trend implementation notes][trend-notes], and the [ownership files](#10-source-record-and-freshness).

## 5. How the systems work together

A typical guided investigation follows these stages, with variations by queue:

1. **A partner system identifies work for review.** Risk or dispute logic determines that a booking, payment, payout, or dispute needs investigation.
2. **A case is created through the case platform.** Cassette provides the API boundary around the case store. The documented architecture uses Salesforce for the active case record.
3. **Pennyworth organizes and routes the work.** Case events update its UDS index, and an authorized analyst claims a case.
4. **The analyst investigates in Atrium.** RPS investigation components, shared Nova components, and partner data provide the evidence. Guided workflows use Nova Guides where appropriate.
5. **The decision reaches the policy systems.** Kanoe translates supported guide answers into typed decisions, and Kyoo evaluates the applicable policies.
6. **The action systems perform the resulting work.** Quarterback executes the applicable remediation actions through downstream services. Inline workflow actions may instead use Compass.

For example, CBQ can combine a suspicious-booking case, a payout hold, investigation of guest and host behavior, and a decision that leads to reservation or account actions. RPS supplies the routing and investigation experience, while the detection policies, action execution, and underlying payment or account systems span partner teams.

The complete business workflow therefore crosses several ownership boundaries. A successful submission in the UI and completion of an asynchronous downstream action are separate events.

## 6. Shared tools and services we depend on

| System | What it does | RPS relationship |
| --- | --- | --- |
| **Atrium / Nova** | The agent workspace containing queues, case views, context panels, and investigation workflows | RPS builds payment-risk experiences inside it. Shared workspace and queue infrastructure belong to the relevant Nova and Trust platform teams. |
| **Nova Guides / Guide Designer** | Structured questions and branching investigation workflows, authored and published as runtime content | RPS integrates the answers and queue behavior. Workflow and Policy owns the guide platform. |
| **Cassette / Salesforce / AirCase** | Case APIs, persistent case records, transfers, ownership, and case-platform evolution | RPS relies on the Case Platform organization for core case operations and shared data contracts. |
| **Viaduct** | GraphQL access to case, reservation, payment, order, and other domain information | RPS writes or integrates relevant fields and consumes them from the frontend, working with the owning data domains. |
| **Kanoe / Trapperkeeper** | Translate guide submissions into typed decisions and define/validate their answer contracts | RPS changes payment-risk integrations with the appropriate Trust and payments policy owners. Trapperkeeper is a library/schema contract, not a standalone service. |
| **Kyoo** | Evaluate risk rules and policies to determine actions | Transaction Risk and D-REX own the principal payment-risk policies. RPS integrates investigator decisions and owns specific tooling behavior where explicitly assigned. |
| **Quarterback** | Execute and retry downstream actions selected by policies | A Trust Platform dependency; RPS does not own the whole service. |
| **Moneytrail** | Legacy payments/compliance case and workflow functionality, including remaining integration paths | A Payments Compliance engineering dependency; it is not an RPS-owned service. |
| **Suez / Dupin / Naha** | Dispute processing, chargeback data and related pipelines, and in-house representment functions | D-REX-side dependencies that provide dispute context and downstream dispute capabilities. |
| **Steward** | Automated investigation workflows, typed investigation signals, and comparison with human decisions | Owned by Partner Experience Foundation in the inspected repository. RPS contributes integrations and investigation capabilities and is onboarding to its workflows. |
| **UDS, Omnes/Kafka, Redis, Delorean** | Data storage, event delivery, claim coordination, and background work | Shared infrastructure used by Pennyworth and the surrounding workflow. |
| **Gandalf / Himeji and agent provisioning systems** | Permissions, authorization, and access to operational tools | Required to make the right cases and actions available to authorized analysts. |

An additional related service is **`state-consistency`**, described in its metadata as detecting inter-domain inconsistencies in payment workflows. Older local notes call it a second team service, but the inspected `project.yml` assigns it to **team 4983**, not RPS's **4982**. This document therefore does not include it in the confirmed RPS-owned service list.

## 7. Current and recent projects

### Premium-product chargeback handling: WP, SC, and CFAR

**Purpose:** help an analyst understand what product a chargeback concerns, how the disputed amount is divided across products, and the relevant product-policy evidence.

The products are **Weather Protection (WP)**, **Synthetic Cancellation (SC)**, and **Cancel For Any Reason (CFAR)**. These create investigation needs beyond an ordinary accommodation-only chargeback: the analyst may need the exact purchased product, its allocation of the disputed amount, and product-specific policy context.

Manish's current work includes the dispute-data contract, dispute-breakdown UI, and SC/CFAR policy results. The September 15 sprint assigns Charan related WP integration and display work.

**Status recorded in the September 19 handoff:**

- The D-REX contract carries chargeback-scoped disputed products, product identifiers, optional subtype, and disputed amounts. The schema and producer PRs are recorded as merged; that alone does not establish production rollout.
- The dispute-breakdown UI is in draft [Pineapple PR 307733](https://git.musta.ch/airbnb/pineapple/pull/307733).
- The SC/CFAR backend fields are in draft [Treehouse PR 1124148](https://git.musta.ch/airbnb/treehouse/pull/1124148), with policy UI in draft [Pineapple PR 308269](https://git.musta.ch/airbnb/pineapple/pull/308269).
- The SC implementation uses the purchased Order item's stored expiry and compares it with cancellation time. Manish authorized an interim implementation while deferring the reservation-policy applicability condition and deeper historical/reversion cases.
- The CFAR implementation uses the owner-confirmed reservation `hostRespondedAt` field as the purchase date and displays a qualified base-policy result. It does not claim that no refund was due or paid.
- Backend deployment must precede validation of the new UI selections against the production schema. Automated and browser evidence is recorded, but a newly populated D-REX-to-DCQ case remains unverified.
- WP subtype identification and completed policy-outcome integration remain follow-ups in the handoff. The September sprint records Sceptile integration work, but does not establish a completed end-to-end implementation.

Key dependencies include D-REX for the disputed-product payload, Insurance/Weather Protection for authoritative WP identity and outcomes, SC/CFAR product owners for policy semantics, Orders and Stays for the selected fields, and PRO/design partners for the investigator experience.

**Sources:** [current handoff][premium-handoff], [SC/CFAR alignment][policy-alignment], and [September 15 sprint][sprint-sep15]. Relevant decision and evidence qualifications are preserved in [MANUALLY-VERIFIED][manual-evidence], particularly **P35/P37** for WP, **P38** for SC, **P39** for CFAR, and **P31/P33/P34** for deferred allocation and missing-product risks. Those proposed-verification entries are not Manish's personal runtime confirmations.

### UAT stabilization and investigation improvements

**Purpose:** make unauthorized-transaction reports transfer cleanly from Customer Support to the right Payments Risk investigation and associate the report with the correct reservation or transactions.

September work includes multiple-reservation search, reservation updates, dedicated UAT subtype handling, correction of mismatched or stale cases, guide changes, and launch bug fixes. The September 1 retrospective describes progress through launch and highlights transaction-matching and access problems; the September 15 plan continues testing and fixes.

The recorded team includes **Chirag, Yash, and Ansh**, with Customer Support and guide/platform partners involved. This is a good example of a workflow whose quality depends on the frontend, transaction search, case metadata, permissions, and transfer guidance all agreeing.

### PROSS post-launch improvements

**Purpose:** give Operations a working suspended-state review experience in Atrium and improve its visibility and escalation handling.

The September 1 retrospective explicitly discusses PROSS **after launch** and reports no major issues at that point. Subsequent sprint work includes analytics, case metrics, and handling mis-escalations. The earlier August description of PROSS as an upcoming pilot is therefore historical.

The documented implementation work includes **Charan, Ansh, and Chirag**. PRO supplies the operational workflow requirements, while shared case and authorization systems remain dependencies.

### PNR and Internal Urgent Escalations in Atrium

**Purpose:** move these risk inbox workflows into the shared investigator workspace and provide the transfer, enqueue, and case-handling functions Operations needs.

The September 15 plan includes a Customer Support transfer guide, transfer handling for mis-escalations, user acceptance testing, manual enqueue from a user profile, and documentation. **Abhishek** is assigned the principal work, with **Yash** supporting it.

The September 1 retrospective reports that agents could perform basic claim, close, and messaging operations in acceptance testing, while the Customer Support transfer-guide dependency delayed PNR launch. The available notes do not establish a completed broad production rollout.

### CBQ decision automation and Steward onboarding

**Purpose:** investigate how much of a manual risk review can be assisted or automated while measuring the quality of the resulting decisions.

Manish's earlier CBQ prototype work in `airbnb/ergo` includes starting an AI investigation when an analyst freshly picks up a case and adding per-run reporting. The documented prototype used shadow runs to compare machine and human investigations without changing production decisions.

The September 1 sprint describes the **Decision Automation for Manual Review Queues: CBQ Pilot** as a technical project driven by **Payments ML**, with RPS supporting workflow understanding and access to case data. It separately lists learning the DCQ implementation in **Steward**. September 15 retains a Steward spike for **Ansh**.

The sources establish active collaboration and exploration; they do not establish autonomous production CBQ remediation or a transfer of Steward ownership to RPS.

### Investigation signals, fraud-trend direction, and analytics

**Purpose:** help analysts find useful evidence faster and help the team understand how its tools are used.

September work includes bank-holder name and enqueue-reason visibility, listing-price context, workflow links, clearer hotel-reservation information, payout information, and agreement on the next direction for fraud-trend matching. These appear under **Prateek's** investigation-experience work in the sprint notes.

The September 15 plan also lists **PROSS, UAT, and CBQ data and dashboards**, PROSS case metrics, and UI click logging for Atrium cases, with **Ansh** assigned data-analytics work. These are recorded sprint goals rather than a claim that every item has shipped.

**Sources for the projects above:** [September 1 sprint][sprint-sep1], [September 15 sprint][sprint-sep15], and [historical roadmap][roadmap-notes] for the earlier CBQ prototype only.

## 8. Examples of partner-team dependencies

| Partner | What RPS depends on | Concrete example |
| --- | --- | --- |
| **Payments Risk Operations (PRO)** | Investigation requirements, analyst feedback, workflow acceptance, and operating policies | Agree what evidence belongs on a premium-chargeback case and test PNR/IUE workflows with actual analysts. |
| **Transaction Risk (T-Risk)** | Detection and pre-transaction risk policies, CBQ/PDQ enqueue and remediation policy behavior | Explain why a booking entered CBQ and determine which policy should apply after an investigator's decision. |
| **D-REX / Post Transaction Risk** | Chargeback events, disputed-product allocation, dispute policies, and representment systems | Supply product-level disputed amounts to the DCQ UI and coordinate producer rollout. |
| **Insurance / Weather Protection** | Authoritative purchased-product identity and WP policy outcome data | Distinguish Weather Protection from generic travel insurance and supply the relevant outcome. |
| **SC/CFAR product engineering, Orders, and Stays** | Product-policy meaning and authoritative purchase, expiry, and reservation fields | Confirm the SC expiry source and CFAR purchase-date field used by Manish's policy UI. |
| **Case Platform / AirCase / Resolution** | Case storage, transfer behavior, case schemas, and platform migrations | Support case ownership/status consistency and the interfaces used by Pennyworth and Atrium. |
| **Trust Tools, Trust Platform, and Nova platform teams** | Shared case UI, queue configuration, decision submission, and action execution | Review shared queue changes and support Kanoe/Kyoo/Quarterback integration. |
| **Workflow and Policy / Customer Support / BPI** | Guide authoring, transfer workflows, and support-side readiness | Complete the transfer guide needed for PNR and Internal Urgent Escalations. |
| **Partner Experience Foundation** | Steward's workflow platform and its existing investigation capabilities | Support onboarding and integration of payment-risk investigations and fraud-trend observations. |
| **Payments ML** | The technical direction of the current CBQ decision-automation pilot | RPS provides domain workflow knowledge and helps identify the case data the pilot needs. |
| **Payments Compliance engineering / Payments Partner Systems** | Adjacent legacy tooling and compliance workflows | Coordinate work involving Moneytrail or compliance-specific tools without assuming they belong to RPS. |

These dependencies explain why a seemingly small UI change can require a backend contract, a product-owner decision, an access change, shared-platform review, and an Operations acceptance step.

## 9. Team members and engineering environment

The September sprint document names the following working team. These assignments describe that sprint, rather than permanent exclusive ownership.

| Person | Examples of work recorded for September |
| --- | --- |
| **Manish Jain** | Premium-chargeback contract and UI; SC/CFAR policy results; on-call |
| **Charan Batchu** | WP policy integration and display; premium-product policy support; recent PROSS work |
| **Abhishek Kumar Singh** | PNR/IUE transfer guide, acceptance testing, manual enqueue, and documentation |
| **Ansh Sharma** | Atrium analytics, UAT/PROSS improvements, on-call, and Steward exploration |
| **Chirag Patni** | UAT guide and reservation-update improvements, testing, and bug fixes |
| **Prateek Ojha** | Investigation signals, payout visibility, and fraud-trend matching direction |
| **Yash Gulani** | UAT bug fixes, PNR/IUE support, and launch coordination |
| **Neel Jain** | Manager in the saved organization profile and a participant in team sprint planning/retrospectives |

The main engineering work spans:

- **Pineapple:** the TypeScript/React frontend monorepo, including `frontend/nova-disputes` and integrations with the shared Nova packages.
- **Treehouse:** backend services, Viaduct integrations, action implementations, schemas, and data models. Relevant code uses Kotlin, Java, and Scala.
- **`airbnb/ergo`:** the documented location of Manish's earlier CBQ automation prototype work.
- **Yarn, Bazel, and Yak:** repository development, build, and verification tooling.
- **Niobe and Viaduct:** frontend GraphQL integration and backend data access.
- **Jest, Playwright, and Storybook:** automated and visual verification of applicable changes.
- **AirDev:** development environments and integration checks across the frontend and backend.
- **GitHub Enterprise, Jira, team documents, and Slack:** code review, work tracking, design/source alignment, and operational coordination.

These are tools the team uses; the list is not an ownership claim over the shared development platforms.

## 10. Source record and freshness

The strongest current project sources used here are the **September 1 and September 15 sprint tabs**, read from Google Docs, and the **September 19 premium-chargebacks handoff**. The service catalog was retrieved on September 19. The detailed architecture knowledge base was initially researched in August, with some subsequent corrections.

Repository ownership checks used the existing local Pineapple and Treehouse checkouts. No upstream refresh, production flag audit, or live PR-status refresh was performed for this profile.

### Primary team and project references

1. [Risk Partner Systems catalog entry][team-catalog] — team identity and mission.
2. [Risk Partner Systems master document][team-master] — architecture and workflow references; some embedded migration summaries are historical.
3. [September 15 sprint][sprint-sep15] — current assignments and project goals.
4. [September 1 sprint][sprint-sep1] — recent launch observations, blockers, and automation collaboration.
5. [Premium-chargebacks handoff][premium-handoff] — project state recorded September 19.
6. [Manual verification and evidence distinctions][manual-evidence] and [SC/CFAR source alignment][policy-alignment] — authority and limitations of the premium-policy claims.

### Local ownership evidence inspected

- [Pennyworth OWNERS](/Users/manishjain/airlab/repos/treehouse/projects/payments/pennyworth/OWNERS) and [project metadata](/Users/manishjain/airlab/repos/treehouse/projects/payments/pennyworth/_infra/project.yml).
- [`nova-disputes` OWNERS](/Users/manishjain/airlab/repos/pineapple/frontend/nova-disputes/OWNERS) and [project metadata](/Users/manishjain/airlab/repos/pineapple/frontend/nova-disputes/_infra/project.yml).
- [Compass risk-tooling OWNERS](/Users/manishjain/airlab/repos/treehouse/projects/compass/src/main/java/com/airbnb/compass/actions/risktooling/OWNERS) and its [test-package OWNERS](/Users/manishjain/airlab/repos/treehouse/projects/compass/src/test/java/com/airbnb/compass/actions/risktooling/OWNERS).
- [Payments-risk schema OWNERS](/Users/manishjain/airlab/repos/treehouse/uds-schemas/schemas/payments/risk/OWNERS) and [`PaymentsRiskCase` model](/Users/manishjain/airlab/repos/treehouse/uds-schemas/schemas/payments/risk/pennyworth/payments_risk_case.air).
- [Steward OWNERS](/Users/manishjain/airlab/repos/treehouse/projects/payments/steward/OWNERS) and [project metadata](/Users/manishjain/airlab/repos/treehouse/projects/payments/steward/_infra/project.yml), identifying Partner Experience Foundation.
- [`state-consistency` project metadata](/Users/manishjain/airlab/repos/treehouse/projects/payments/state-consistency/_infra/project.yml), identifying team 4983.

### Supporting architecture notes

The [RPS knowledge-base index][knowledge-index] links the deeper references on queues, lifecycle, routing, decisions, storage, frontend, AI features, organization, and historical roadmap. Current code and newer primary project records should take precedence when those notes disagree.

[team-catalog]: https://developers.a.musta.ch/catalog/default/group/4982
[team-master]: https://docs.google.com/document/d/1UaMok0hvDJpJ0PEaHazB6V2QJQrpsi8DyZ9x02ddnZ8/edit
[sprint-sep15]: https://docs.google.com/document/d/1wYnZZocFG4FSSQac7SvoxUV_AoGdyR_TmmBdvaLWxuw/edit?tab=t.4xeu7kqsa0x0
[sprint-sep1]: https://docs.google.com/document/d/1wYnZZocFG4FSSQac7SvoxUV_AoGdyR_TmmBdvaLWxuw/edit?tab=t.ywwo97oy8nev
[knowledge-index]: /Users/manishjain/.claude/airbnb/rps/INDEX.md
[orientation]: /Users/manishjain/.claude/airbnb/rps/01-orientation.md
[org-notes]: /Users/manishjain/.claude/airbnb/rps/16-org.md
[pennyworth-notes]: /Users/manishjain/.claude/airbnb/rps/06-pennyworth.md
[frontend-notes]: /Users/manishjain/.claude/airbnb/rps/09-frontend.md
[decision-notes]: /Users/manishjain/.claude/airbnb/rps/07-decision-path.md
[trend-notes]: /Users/manishjain/.claude/airbnb/rps/_raw/fraud-trend-matching.md
[roadmap-notes]: /Users/manishjain/.claude/airbnb/rps/17-roadmap.md
[premium-handoff]: /Users/manishjain/.claude/airbnb/projects/premium-chargebacks/HANDOFF.md
[manual-evidence]: /Users/manishjain/.claude/airbnb/projects/premium-chargebacks/MANUALLY-VERIFIED.md
[policy-alignment]: /Users/manishjain/.claude/airbnb/projects/premium-chargebacks/reference/sc-cfar-policy-alignment.md
