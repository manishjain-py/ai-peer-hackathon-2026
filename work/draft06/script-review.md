# Draft 06 — independent script review before audio

Reviewed 19 September 2026. Input: all **39 lines** of
`video/public/draft06/script.json`, the full **240-second** scene schedule,
the saved feedback round and the supplied professional context. The initial
creative recommendations are in [creative-review-initial.md](creative-review-initial.md).
I have not edited the script or production components.

## Verdict

The script substantially improves clarity over Draft 05. It has distinct
full-screen chapters, a specific BOBO discovery, the user's real cross-time-zone
clarification shape, a separate Zoom status use case, and three missed-notification
examples with practical actions. The new ending's **“More room for your best work”**
connects naturally to the calmer opening and the attention problem.

**One technical-source wording correction is needed before freeze.** The other
recommendations below improve clarity and preserve continuity in the visuals.
No change to the overall four-minute structure is needed.

## Required source correction

`slack_reply` currently says **“the order's expiry timestamp.”** The source
specifies the **purchased Order item's stored expiry**, not an expiry belonging
to the entire Order. Suggested replacement:

> The purchased Order item's expiry gives the window's end. I'll share an example to verify.

Do not display an exact `expireAt`/`expiresAt` API field or query as a verified
contract. The user explicitly gave tentative field wording. A visible
“Illustrative data guidance” label remains appropriate, and the existing
implementation's deferred applicability/historical cases must not be described
as completely solved. The example should supply useful guidance, not assert
completed policy validation or release readiness.

## Recommended clarity edits

- `slack_peer`: **“Dispute agents need to see…”**, rather than “Agents need to
  see…”, avoids confusion with AI agents in a film about AI agents.
- `missed_cassette`: **keep the user's latest wording “chargeback review” and
  “dispute classification.”** Root clarified after this initial review that the
  latest requested review-queue wording must not be conflated with CBQ. The
  earlier suggestion to relabel this as chargeback prevention is withdrawn.
- Give the Zoom scene a short visible impact: **“Status shared. Manish keeps the
  decision.”** Unlike the other chapters, it currently has no explicit spoken
  payoff. An onscreen result is sufficient; do not add a rushed line.

## Feedback coverage and render conditions

| Feedback | Script result | What visuals still need to demonstrate |
|---|---|---|
| Happy arrival before overwhelm | The first line and 0–5s calm window support it | Walk in, sit, begin useful work with a smile; alerts change eyes/posture/mood only afterward |
| Clear, separate use cases | Four dedicated title scenes, 4s each | Each title must be full screen, followed by its own scene; final notification chapter clearly contains three examples |
| BOBO and missed consultation | Product purpose, missing-loop context, Peer alert and contact payoff are present | Label the launch/consultation premise user-reported; owner is a role/illustrative contact, not a fabricated verified person |
| Explain BOBO relevance | Peer connects it to chargeback handling | Show company announcement → payments-risk responsibility → review gap → owner discussion, with no claimed avoided loss |
| Synthetic Cancellation clarification | US colleague asks why; Peer explains guest-cancellation evidence while Manish sleeps | Show the Synthetic Cancellation name in the thread, the two clocks, and the source-guidance reply before the return-to-work payoff |
| Avoided cross-time-zone waiting | “Could cost another day” versus answer before morning is clear and qualified | This is a scenario comparison, not a measured 24-hour saving; a visual before/after or waiting→answered state makes it explicit |
| Natural ElevenLabs voices | Short lines and moderate overall word count allow natural delivery | Narrator warm; colleagues ordinary and restrained; Peer calm. Do not speed long performances just to force old timings |
| Distinct Zoom value | Direct question to Peer, actual dated status and launch boundary | Show status synthesis and open checks, rather than repeating the Slack field question |
| Missed items after inbox cleanup | The 150-read trigger is clear | Show the mark-read action, keeping “read” distinct from “handled”; no actual inbox mutation occurs |
| Airversary | Yash, five years, Vijay and an appreciation-board link are included | Gmail brand, actual-looking email preview, source and clear Add appreciation action; anniversary and message marked illustrative |
| Fireside invitation | Correct name and personal AI relevance; unanswered invitation is treated as a choice | Add “Creator of Claude Code”; show Accept / Decline / Ignore, then visible Manish selection and Accepted state |
| Cassette | Possible case-creation interruption, queue relevance, tag and next check | Slack announcement preview, shared-dependency relationship, original-thread action; announcement/tag/outcome remain illustrative |
| More possible use cases | Closing explicitly says these are a few possibilities | Broader possibility should not look like a catalogue of already implemented capabilities |

## Specific factual and story boundaries that pass

- BOBO purpose matches the user report. “Payments risk wasn't in the loop” is
  permitted as that user-reported premise; it is not independently verified.
  The Peer narrows its own finding to the launch discussion it could inspect.
- “Early heads-up” can mean early enough to investigate an operational risk;
  do not show that it happened before the actual already-reported launch.
- The Slack business explanation says cancellation timing **helps assess** the
  chargeback. It does not turn timing alone into an automatic policy verdict.
- Zoom preserves merged data-contract changes, draft interface/backend work,
  deployment before fresh-case validation, and Manish's commitment decision.
  Show the 19 September source date; no live status refresh was performed.
- “I'll coordinate the example case” is an authored promise, not proof of a
  received or validated case. The film must not silently upgrade that state.
- “Your invitation is still unanswered” does not assert with certainty that
  Manish missed it. It is a good reason for the Peer to offer a choice.
- Cassette's possible impact is phrased conditionally. It is not a claim of an
  actual scheduled outage or broken queues.
- Proposed integration disclosure covers setup, AirChat, conversations and
  calendar actions. No Sourcegraph appears in the script.

## Permission-UI continuity

If the setup reuses Draft 05's **“email/events · read only”** label, update it to
match the subsequent calendar RSVP action. A clear scope such as **“Calendar
responses when you choose”** fits the demonstrated behavior. The fireside scene
must show Manish choosing Accept before the Peer changes the invitation state.
Ignore should leave the RSVP unresolved, rather than silently declining it.

## Titles

The current titles are understandable and can remain. **“Keep your context in
the room”** is an optional clearer alternative to “Be there through your Peer.”
**“Spot the gaps between teams”** is an optional more specific BOBO title.
Neither is a blocker: the larger improvement is the full-screen separation and
explicit payoff in the following scene.

## Verified public name

Use **Boris Cherny**. The official
[Anthropic webinar page](https://www.anthropic.com/webinars/claude-code-for-financial-services-boris-cherny)
identifies him as Claude Code's inventor and head. That source supports the
name and short role only. The Airbnb fireside invitation, event schedule and
speaker participation remain authored examples. No private source was accessed.

## Audio and final review limits

This is a script review; no audio has been heard and no Draft 06 frames have
been inspected. Actual ElevenLabs performance durations need checking,
especially the short launch-date question and long Cassette explanation.
The revised frozen script now has **“purchased item's expiry”**, **“Dispute
agents”** and the shorter launch-date question. Root implemented scoped calendar
choices, a creator label and RSVP controls, plus an explicit Zoom payoff.
These resolve the script gate. Independent rendered-film review follows.
