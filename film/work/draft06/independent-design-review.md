# Draft 06 — independent design review

Reviewed 19 September 2026 by the opening-scene agent.

## Scope and result

Reviewed the root-authored Draft 06 story scenes, chapter cards, setup/Zoom
adaptations and closing treatment. The Draft 06 opening authored by this reviewer
is excluded. Setup and Zoom retain components this reviewer originally worked
on in Draft 05, so those portions are integration QA; the new story-scene review
is independent of their implementation.

**No blocking layout issue found.** Two small items seen in older stills were
reported to the root agent and are already addressed in the current source.
The new sequence is materially clearer about the value of each use case.

## Frames inspected

Twenty-five integrated 1920×1080 PNGs in `work/draft06/` were opened and inspected:

- Setup: 37, 48, 59.8.
- BOBO title and demonstration: 66, 79, 86, 94.
- Slack: 107, 112, 123, 129.
- Zoom title and demonstration: 138, 153, 164.
- Inbox and missed notifications: 172, 174, 179, 191, 200, 203.6, 204.4, 216.
- Daily brief and close: 220.9, 223, 237.

`StoryScenes.tsx`, `SetupScene.tsx`, `ZoomScene.tsx` and the Draft 06 script were
read to understand the planned cue structure. The 129-second caption was known
to be provisional and stale; it is excluded from final caption validation.

## Older-frame findings, addressed in current source

### 1. Inbox cleanup headline

At 174 seconds the headline reads **“An empty inbox isn’t the whole story.”**
The UI shows conversations being marked read, with those conversations still
present in the inbox. Calling it empty conflates two different actions.

Recommended replacement: **“All read. Not all handled.”** This also makes the
use-case impact immediate without changing the scene.

**Current-source verification:** `MissedScene` now retains **“Read doesn’t
always mean handled.”** for the entire inbox segment. This is accurate. The
174-second frame used above predates that correction and is stale.

### 2. Crispness of the overnight-wait card

In the supplied 112-second still, faint original Slack message text remains
visible through the **WITHOUT A PEER** panel. The high-level comparison is
readable, but the ghosted lettering competes with the otherwise clean card.

Check a fresh render because the screenshots and source were being updated
concurrently. If it reproduces, give the panel a fully opaque background and
explicit stacking order. This is a polish issue, not a story blocker.

**Current-source verification:** the panel now uses the opaque six-digit color
`#fffcf5`. Its opacity cue settles to 1 for the comparison hold. The root agent
confirmed the supplied 112-second frame predates that correction. A fresh
112-second sample remains an encoded-review check, not an unresolved blocker.

## What works

- Full-screen chapter titles are brief, large and specific. They provide an
  understandable reset between demonstrations and a stronger commercial rhythm.
- BOBO shows the sequence clearly: a company launch, a possible missing risk
  connection, and a path to the discussion/product owner. The user-reported
  experience and illustrative post are identified. The final outcome line does
  not invent a measured loss prevented or quantified saving.
- Slack explains the business purpose in plain language. The overnight-wait
  comparison makes the collaboration problem understandable before the Peer
  supplies context. Active messages fit during the inspected scroll states;
  only older material is cropped by the viewport. The source mapping remains
  visibly illustrative and subject to verification.
- Zoom keeps draft work separate from merged contracts, preserves the fresh-case
  validation prerequisite, and ends on Manish's launch decision. The added
  impact line is readable above captions.
- The appreciation example provides an original-email preview and direct next
  action. The fireside example shows why it is relevant, an unanswered invitation,
  and three clear choices. The revised 203.6/204.4 states visibly confirm the
  click, accepted response and calendar addition within the proposed scenario.
- Cassette connects an original announcement to both named queues and a concrete
  action. The source, Peer note and thread button fit without overlap.
- The final daily brief preserves distinct states: appreciation remains an action
  to take, the invitation is accepted in the scenario, and queue impact remains
  something to check. The close has clear hierarchy and readable disclosure.

## Limits and next check

This is sampled still-frame and source review. It does not establish uninterrupted
motion smoothness, naturalness of voices, final synchronization or complete
caption accuracy. Direct audio listening was not performed. After the small
corrections and final audio timing are settled, review encoded samples around
the Slack comparison/scroll, invitation click, Cassette-to-brief transition and
chapter boundaries.

## Encoded-preview addendum

Source inspected: `renders/ai-peer-draft-06-preview.mp4` on 19 September 2026.
**Pass: no blocking issue found in 42 extracted temporal samples.** The opening
remains excluded from this independent pass.

Sample groups:

| Area | Global seconds | Count |
| --- | --- | ---: |
| Four chapter cards | 64.8, 67.5, 96.8, 99.4, 136.8, 139.4, 166.8, 169.4 | 8 |
| BOBO introduction, connection, contact and impact | 69, 77.5, 81, 86, 91, 95 | 6 |
| Slack question, before/after and guidance | 101, 107, 112, 114.8, 118, 123, 129, 132.8, 135 | 9 |
| Inbox cleanup and appreciation | 171, 172.7, 174, 177, 181, 186 | 6 |
| Fireside relevance, choices and acceptance | 189, 194, 199, 202.6, 203.4, 203.6, 204.4 | 7 |
| Cassette and daily brief | 206, 211, 216, 219.6, 222, 225 | 6 |

All 42 were inspected through labeled contact sheets. Four key samples—112,
129, 203.6 and 216—were additionally opened individually at the preview's native
960×540 size. Evidence is retained in [encoded-design-review](encoded-design-review/).

The two earlier corrections are verified in the encoded preview: the overnight
comparison card is opaque at 112 seconds, and the inbox retains “Read doesn’t
always mean handled.” at 174. The final 129-second caption now uses the
purchased-item expiry wording that matches the on-screen reply.

The chapter title holds are legible. BOBO develops from launch to relevant
question to contact/action, then lands the impact line. Slack removes the
overnight-wait card before the Peer responds and keeps each active response
visible as the thread scrolls. The eventual outcome is guidance and an offered
example to verify, not completed production validation.

The Gmail pointer reaches the mark-as-read control before the inbox changes.
The fireside pointer reaches Accept; the sampled transition from 203.4 to 203.6
changes to Accepted, updates the response text and shows calendar confirmation.
That state remains settled at 204.4 before the next scenario. Cassette's original
announcement, tagged-thread example and next action remain separate and clear.
The brief preserves the difference between accepted invitation, appreciation
still to add, and queue impact still to check.

Confidence is high for the sampled layout/readability and state ordering, and
moderate for overall temporal continuity because this was sampled review rather
than uninterrupted playback. It does not establish every-frame smoothness or
complete caption/audio synchronization. No direct audio listening was performed.
Final 1080p verification is handled separately by the root workflow.
