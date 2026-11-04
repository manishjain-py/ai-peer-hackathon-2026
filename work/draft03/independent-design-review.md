# Draft 03 — independent review of the root-built scenes

Reviewed 18 September 2026 by the product/use-case agent. This review deliberately
excludes PersonalBrief and UpdatedBrief, which this agent implemented. No film
source was edited during this independent review.

## Review scope and method

Inspected 20 actual 1920×1080 source renders under `work/draft03/`:
`frame-00003`, `00010`, `00016`, `018.5`, `00022`, `00032`, `00038`, `00083`,
`00089`, `00095`, `00099`, `00104`, `00109`, `00114`, `00119`, `00125`,
`00130`, `00138`, `00167`, and `00172` (all `.png`).

These samples cover opening, reveal, source setup, offline transition, Slack,
meeting bridge, Zoom and closing. They are samples from the earlier timeline.
Root is shortening the meeting and end section; the final 166.5-second timeline
must be sampled again at its new times. This was not an uninterrupted viewing,
not a playback-pacing judgment, and not an audio/voice listening review.

## Judgment

The Slack and Zoom scenes are readable and their useful outcomes are clear.
The camera-off Zoom treatment is coherent and avoids the frozen-speaking-face
problem of Draft 02. Directly addressing the Peer works immediately, without
another absence explanation. Source evidence and the human decision boundary
remain visible. No blocking layout problem was found in the inspected context,
offline, meeting-share, or closing states.

Two small opening corrections and one premature Slack status were reported to
root. The Slack correction is already present in source; refreshed images are
needed to close the visual checks. Root had independently identified and fixed
the early reveal overlap; its revised frame had not yet been inspected here.

## Findings sent to root

### Fix before export: do not call an offered mapping received

At old global 104 seconds, Sarah's message says “I'll send the new field mapping”
and the file attachment is absent, but the bottom status says **Field mapping
received**. That is premature. Use **Hourly source confirmed** until the attachment
appears, then use **Field mapping received**.

**Current state:** Read-only inspection of `SlackScene.tsx` after the message shows
this already corrected: “received” and attachment both start at local 19.7;
“Hourly source confirmed” is the intermediate state. Refreshed 104/109 frames
remain the visual confirmation.

### Fix opening spacing

At old global 10 and 16 seconds, the two closing questions visually run together:
**“What needs you?Who's waiting on you?”** Add an actual gap or place them on two
lines. The content is good; the missing separation looks accidental.

### Keep the hackathon timing consistent

The opening card says **“Hackathon applications open”**, while the substantive
brief says they open Friday. **“Hackathon opens Friday”** makes that continuity
unambiguous and introduces the deadline mentioned in the narration.

### Reveal overlap — already known to root

The inspected old 18.5-second frame has the large icon overlapping the AI Peer
wordmark. The 22-second settled state is clean. Root reported the entrance was
fixed before this review and is rerendering 18.5/19/22 seconds. Do not count the
old sample as evidence that the correction succeeded; inspect the revised ones.

## Slack framing notes

- 89s: The incoming question is fully readable, @Manish is obvious, and the
  original request supplies enough context. Sidebar and composer establish Slack.
- 95s: AI identity and APP badge are visible. Earlier history scrolls upward;
  no current message is hidden by the header or composer.
- 99s: The requirements source preview is large enough to read and does not
  cover the active Peer answer. It covers part of older history, which is fine.
- 104s: The recommendation and promised mapping are clear. Only the premature
  received status needed correction.
- 109s: File attachment and acknowledgment are visible, so “received” and
  “added to brief” are earned by the authored scenario at this point.

There is ordinary partial clipping of older messages under the pinned channel
header during scrolling. This reads like a chat viewport, not clipped active
content. It is not a blocker.

## Zoom and source setup notes

- 119s: Alex's subtitle directly addresses **Manish's Peer**. The active speaker
  border belongs to Alex; the Peer is visibly AI and delegated. Other people have
  explicit camera-off states. No lip-synced footage is implied.
- 125s: Build readiness is distinguished from two open data checks. The simple
  explanations beneath “Duplicate events” and “Late reversals” help nonexperts.
- 130s: The Slack answer travels into the meeting as visible evidence. This makes
  the continuity between the two use cases concrete.
- 138s: Friday remains Manish's decision; Sarah has *offered* examples, not
  completed validation. This is accurate and easy to follow.
- 32/38s: Permitted sources connect to a project, open questions and a saved
  personal idea. The visual prepares both halves of the expanded product promise.
- 83s: Bengaluru 2 a.m. versus San Francisco 1:30 p.m. is understandable. The
  meeting does not repeat that explanation.

## Final-pass requirements for the root editor

1. Inspect refreshed reveal entrance and opening text after the corrections.
2. Inspect the mapping-status transition alongside attachment arrival.
3. Sample the shortened final meeting and closing timings; verify captions and
   closing disclosure still get adequate time after the packing changes.
4. Judge human voice realism, music balance, and uninterrupted pacing through
   playback or a separate listening workflow; this image review cannot verify them.

## Follow-up: revised 166.5-second timeline samples

Inspected the refreshed 18.5, 19, 104, 109, 128, 135 and 165-second images.
The reveal no longer overlaps the wordmark. At 104 seconds the intermediate
status correctly reads **Hourly source confirmed**; at 109 seconds the attachment
is present and the acknowledgment/brief status is earned. The packed Zoom source
and pending-decision states remain legible at 128 and 135 seconds. The final
165-second card still includes the explicit concept/integration disclosure.

The reported mapping-status and reveal-entrance blockers are therefore closed
by inspected rendered evidence. Root reports the opening wording/position fixes
are also in source; its new 10-second image and the encoded-preview review remain
next checks. No source edits were made by this reviewer.

## Encoded-film review — final 166.5-second edit

**Verdict: no blocking visual issue found in the inspected encoded sequences.**

Reviewed the actual `renders/ai-peer-draft-03-preview.mp4`, verified by ffprobe as
960×540 H.264 at 30 fps with AAC and exactly 166.500 seconds. Extracted and visually
inspected 124 temporal samples from these root-built sequences:

| Encoded interval | Sampling | Frames inspected |
|---|---:|---:|
| 16.0–19.3s: intro collapse and product reveal | 6 fps | 20 |
| 28.0–40.0s: context/source setup | 1 fps | 12 |
| 93.0–109.5s: Slack answer, scrolling, source, attachment | 2 fps | 33 |
| 117.0–138.5s: Zoom direct address, gallery/share transition, sources, boundary | 2 fps | 43 |
| 158.5–166.5s: final brand and disclosure | 2 fps | 16 |

Contact sheets and extraction script are retained in `encoded-review/`. Each
sheet reads left to right, top to bottom. Black unused cells at the ends of some
sheets are contact-sheet padding, not black frames in the film.

The following observations are based on the encoded images:

- The shrinking opening cards lead into the Peer mark without a text collision.
  The opening questions are now visibly separated; the small source card says
  the hackathon opens Friday. The reveal mark and wordmark settle cleanly.
- Source permissions, personal anchors and the final boundaries appear in a
  coherent sequence during the context setup. No unreadable flash was observed
  in the sampled transitions.
- Slack's current answer, source and attachment stay within the message viewport
  as earlier history scrolls away. The mapping's arrival precedes the final brief
  acknowledgment. The required source is on screen while its caption refers to
  the requirement.
- The Zoom gallery establishes camera-off participants and the identified AI
  delegate. The direct-address caption appears while Alex has the speaker border.
  Participants move into the side strip during the screen-share transition and
  settle without obscuring the steady evidence view.
- The data checks, Slack confirmation, Sarah's offered examples and Manish's
  approval boundary arrive in the same order as their visible caption sequence.
  The source evidence remains distinct from completed validation.
- The shortened close has time for the brand line to settle before the explicit
  concept disclosure appears. No unexpected black frame or cut-off title was
  observed in these samples.

Then extracted and inspected three frames directly from the final full-resolution
`renders/ai-peer-draft-03.mp4`: 109s (Slack attachment/acknowledgment), 128s (Zoom
source evidence), and 165s (closing). They are retained as
`encoded-review/final-109.png`, `final-128.png`, and `final-165.png`.

The final 128s frame correctly quotes **“It updates hourly.”** The earlier preview
had “refreshes hourly”; the exact-word correction is verified in the delivered
1080p artifact. The 165s frame contains the integration disclaimer.

These checks assess rendered appearance and sampled visual continuity. They are
not uninterrupted real-time viewing, a hearing/listening review, or proof of
subjective voice realism or music quality. No audio-quality claims are made by
this reviewer. The independently implemented personal brief is excluded here and
is covered by the separate creative review.
