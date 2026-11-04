# Draft 03 — independent product and creative strategy

Updated 18 September 2026 after the user's expanded direction: AI Peer is equally
**for the employee** and **for people who depend on that employee**. It tracks
permitted work sources, relates changes and opportunities to the person's work,
helps them prepare, and represents them transparently within delegated limits.

Read: AGENTS, current state, product overview, use cases, original idea, Draft 02
source dialogue/storyboard, and root's forwarded new user feedback. All examples
below are illustrative concept content. No live integrations are implemented.

## Main recommendation

Build the film around **two sides of work**:

- What is coming at me: relevant changes, meetings, deadlines, opportunities.
- Who is depending on me: teammates needing my knowledge or a decision.

AI Peer connects both sides through its knowledge of the person. A daily brief
must be a main proof scene, not a short montage after the offline demo. It should
show relevant facts becoming useful next actions. Then Slack and Zoom prove the
same personal understanding is useful to colleagues.

A 2:45–2:55 cut can fit a 40-second personal brief, 25–30 seconds of Slack, and
30–35 seconds of Zoom. Keep one project as the connective tissue. Use the last
brief item to widen from today's tasks to a worthwhile opportunity.

## Personal brief: concrete 40-second scene

### Setup and interface

Manish's morning screen: **“What deserves my attention?”** The product label is
**“For you”**, and the heading is **“Three things worth your time.”** Above it,
show **“New since your last check”**, so it reads as an up-to-date view into ongoing
monitoring rather than a fixed morning newsletter.

A few recognizable source events flow into the Peer: a Slack service notice,
a calendar agenda, and a company email. They connect to **Chargebacks**,
**an unresolved design question**, and **Manish's saved agent idea** respectively.
Do not fill the scene with unreadably fast email prose. Readable source chips
stay attached to each resulting card.

### Card 1 — Act: a change that affects his service

- **Source event:** Data Platform announces that the dispute API's old `outcome`
  field will be retired Friday in favor of `final_outcome`.
- **Why Manish:** His Chargebacks mapper still references the old field. The Peer
  connects the announcement to the specific service he owns and the source code
  in its permitted context.
- **On-screen headline:** **“Your dispute mapper needs an update.”**
- **Supporting line:** “API field changes Friday · your service uses the old field.”
- **Prepared action:** An impact packet with the migration guide, affected file,
  and relevant test. Button: **“Review impact.”**
- **Source chips:** “#data-platform · 9:12” and “Chargebacks / field-map.ts”.
- **What it proves:** Relevant early warning and targeted engineering preparation,
  not a generic digest and not a claim the code was automatically fixed.

Suggested voice:

> “First, the dispute API changes Friday. Your Chargebacks service still uses
> the old field. Here's the affected code and migration guide.”

### Card 2 — Attend: connect an event to an open problem

- **Source event:** Today's Data Platform office hours include reopened disputes.
- **Why Manish:** His Chargebacks design still has an unanswered question about
  what happens when a dispute result changes later.
- **On-screen headline:** **“Today's office hours cover your open question.”**
- **Supporting line:** “Reopened disputes · Data Platform · 3:00 PM”.
- **Prepared action:** A specific draft question: “Does a reopened dispute emit
  a new event with the previous outcome?” Button: **“Review question.”**
- **Source chips:** “Office hours agenda” and “Your design · open question”.
- **What it proves:** The Peer finds useful people and moments to advance the
  employee's work. It does not merely report another meeting on a calendar.

Suggested voice:

> “Data Platform's office hours cover reopened disputes—the question in your
> design. I've prepared what to ask.”

### Card 3 — Grow: a relevant opportunity, with a head start

- **Source event:** Internal AI hackathon sign-ups open; the brief has an agent
  track.
- **Why Manish:** He has already saved an idea about better project handoffs. The
  Peer connects his actual idea to the event, rather than guessing his interests.
- **On-screen headline:** **“Your handoff idea fits the AI hackathon.”**
- **Supporting line:** “Agent track · sign-ups now open”.
- **Prepared action:** The brief beside a three-sentence draft pitch that he can
  edit. Button: **“Review pitch.”**
- **Source chips:** “Company events email” and “Your saved idea”.
- **What it proves:** Personal opportunity discovery and useful preparation,
  extending the Peer beyond routine productivity. No registration or submission
  occurs automatically.

Suggested voice:

> “And the AI hackathon just opened. Your handoff idea fits the agent track.
> Here's the brief—and a first draft of your pitch.”

The three voice passages total roughly 85 words, approximately 34 seconds at a
natural 150 words/minute. Allow 5–6 seconds for Manish's prompt, a small reveal
pause, and a final click. The completed scene should land around 40 seconds.

### End the scene with a human choice

Manish opens **“Review impact”** or pins that task as **“First today”**. The film
has now shown the Peer helping him make a better next move. A small relevant
signal can update behind the view, reinforcing ongoing awareness. Avoid a
permanent animated wall of notifications; the product's benefit is selectivity.

## What the ongoing-awareness setup must communicate

- Sources are permitted, connected sources, not all company information.
- The Peer follows Manish's services, projects, unresolved questions, and interests.
- A source change gets related to those personal anchors before it is surfaced.
- Not everything becomes an alert. Only material relevance earns his attention.
- Newer evidence can change the brief, and the source timestamp stays visible.

Suggested single narration line during setup:

> “With access you choose, your Peer follows your projects, conversations and
> company updates—then brings you what matters to you.”

This is specific without reading a connector list. The scenario cards demonstrate
what “matters” means. Do not claim unsourced knowledge of private thoughts.

## Slack and Zoom with the new central promise

### Slack: help the team while Manish is offline

Keep the 2 a.m. signal here only. Sarah asks whether the project needs daily
summary or individual dispute results. The Peer supplies the requirement and
its source. Sarah can then recommend the appropriate API/source. Trim redundant
introductions and gratitude loops.

A roughly 25–30 second dialogue:

> Sarah: “Manish, do you need daily totals, or each dispute?”
>
> Peer: “I'm Manish's AI Peer. He's offline. The dashboard needs each dispute's
> final result, updated hourly. Here's the requirement.”
>
> Sarah: “Use Dispute Events, then. I'll share the mapping.”

One source receipt and one useful next action are enough. No narrator should
repeat everything the audience just heard.

### Zoom: represent within clear limits

User explicitly rejected another “it's 2 a.m.” exchange. Address the visible AI
participant directly. Show the delegated meeting invitation in the transition.

A roughly 30–35 second dialogue:

> Alex: “Manish couldn't make it, but I see his Peer. Hey, what's left before launch?”
>
> Peer: “The dashboard's built. Sarah confirmed the data source. We still need
> checks for duplicate events and a result changing later.”
>
> Sarah: “I can send both examples today.”
>
> Alex: “Are we on for Friday?”
>
> Peer: “I'll ask Manish to confirm after those checks.”

Visible participant label: **“Manish's AI Peer · AI”**. No second long identity
speech. Keep Friday as pending human confirmation; offered test examples are not
completed tests.

### Return: give the person one useful next move

The handoff is another **“For you”** view, completing the two-way story. Show
**“Source mapping received”**, **“Test examples promised”**, and **“Launch decision
needs you.”** The incoming updates refine his original morning plan. The daily
brief and team representation belong to one system, not two disconnected apps.

## New-use-case candidates after this user steering

| Rank | Use case | Include in this film? | Reason |
|---|---|---|---|
| 1 | Relevant service change + prepared impact review | Yes, full personal-brief card | Tangible proactive value while the employee is present. |
| 2 | Useful event tied to an unresolved question | Yes, personal-brief card | The Peer connects people/events to specific work, not generic calendar assistance. |
| 3 | Growth/hackathon opportunity tied to a saved idea | Yes, personal-brief card | Broadens the promise to personal opportunity and preparation. |
| 4 | Design history preventing rework | Only if another scene is removed | Powerful, but could overload the cut after the expanded brief. |
| 5 | PTO coverage | No separate scene | Repeats Slack/Zoom availability value. |
| 6 | Peer-to-Peer or automatic code changes | No | Needs a larger explanation and a different authority story. |

The previous recommendation for a separate 18-second design-history scene is
superseded by the richer personal brief. Preserve its idea for later, not as an
extra feature squeeze.

## Tagline recommendations, revised

Root floated “On your side. In your corner.” Both halves express support, so the
second does not add meaning. Prefer one personal support phrase plus a broader
work phrase, or a short single line.

| Rank | Line | Why it works | Watch-out |
|---|---|---|---|
| 1 | **AI Peer. In your corner. Across your work.** | Support for the person plus reach into their work; covers relevance, preparation, and delegation. | Slightly longer; use as two deliberate title beats. |
| 2 | **AI Peer. Your work. A step ahead.** | Short, forward-looking, works with proactive relevance and prepared next steps. | Needs the film to make “ahead” concrete. |
| 3 | **AI Peer. Always in your corner.** | Human, memorable, broad enough for growth and protection of attention. | “Always” is aspirational concept wording, not measured availability. |
| 4 | **AI Peer. More clarity. More possibility.** | Covers daily work and opportunity; pairs well with a lively close. | Less specific to a personal work agent. |
| 5 | **AI Peer. Your expertise. Multiplied.** | Strong for the representation half and memory. | Understates discovery/growth; no longer my first choice after the new direction. |

**Recommended explanatory line after the reveal:**

> “A personal AI teammate that knows your work, finds what matters, and helps
> you take the next step.”

Later, introduce the other half:

> “And when your team needs your context, your Peer can help there too.”

Avoid an opening that defines the product solely by “when you're offline”; that
would force the audience to relearn what it is during the personal brief.

## Problem opening and revised structure

Open with both pressure directions, in a compact 18-second visual sequence:

1. A source change notice, a meeting agenda, and a company opportunity pass through
   a busy inbox. Highlight the relevant lines, then let them disappear into the
   noise. A good opportunity can be missed as easily as an important update.
2. Slack questions and a meeting request converge on Manish from colleagues.
3. The screen quiets. The Peer connects incoming signals to his actual work and
   gives each side a useful next step.

Possible opening narration:

> “Your work keeps changing. Messages. Meetings. Decisions. Opportunities.
> Some need your attention. Some need your knowledge. You can't be everywhere.
> But you can have a Peer.”

Do not make Manish appear incapable or inattentive. The problem is a high volume
of scattered information plus human time, not personal failure.

| Approximate time | Beat | Viewer takeaway |
|---|---|---|
| 0:00–0:18 | Both sides of the problem | Important things come at me; others depend on what I know. |
| 0:18–0:36 | Reveal + permissioned personal understanding | A Peer knows my work and can follow relevant changes. |
| 0:36–1:17 | Three-item personal brief | A service change, the right conversation, a relevant opportunity—each with a next step. |
| 1:17–1:47 | Slack | My team gets the clarification while I am offline. |
| 1:47–2:23 | Zoom | My Peer contributes directly, with human decisions clearly retained. |
| 2:23–2:40 | Return and review | New information comes back into my plan, ready for my judgment. |
| 2:40–2:52 | Close | The same Peer supports me and the people working with me. |

Use this as an editorial budget, not a locked script. A brisk film earns pace by
removing duplicate explanation and dead air, not by making natural speech rush.

## Creative review tests

- Can a viewer name a useful thing the Peer did **for Manish** before he went offline?
- Is every brief item connected to a real project, question, or saved interest?
- Does each item end in a useful reviewable action, not just an informational card?
- Is continuous relevance visible beyond one timestamped daily digest?
- Does the opening include missed opportunity, not only overdue tasks?
- Do the Slack and Zoom scenes now feel like an extension of a personal Peer
  rather than the entire product?
- Does the closing show the two directions joining back together?
- Can viewers distinguish recommendation, prepared draft, colleague commitment,
  completed validation, and human approval? If not, revise the wording.
