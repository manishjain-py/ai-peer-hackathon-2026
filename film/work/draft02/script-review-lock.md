# Draft 02 root script — independent lock review

18 September 2026. Reviewed `story-proposal.md` against user requirements and Draft 01. Decision: **proceed with 228 seconds**, with the following focused corrections. The root structure is stronger than a longer alternate cut; preserve it.

## Four corrections before voice generation

1. Change "integration complete" to **"dashboard build complete; data checks pending."** Otherwise the film says the integration is complete before the team has determined the authoritative data source. The claim must match both source card and dialogue.
2. Sarah must explicitly confirm the cadence. **"Use Dispute Events. It refreshes hourly. The daily summary would be too late. I'll send the field mapping."** Then the Zoom Peer has a genuine, traceable new fact to carry forward.
3. Explain the two tests in everyday language. Peer: **"The dashboard is built. Two checks remain: the same event arriving twice, and an outcome changing later."** Small source labels may read "Duplicate events" and "Late reversals," but the voice cannot assume those terms are familiar.
4. Let the question hang. Leave **one second of stillness and near-silence** after the absence becomes clear. The film needs to feel the wait before it supplies the answer. Do not animate every second of the cold open.

## Recommended timed lines

Times below are shot windows, not a demand to stretch synthesized speech. Place finished clips at natural cadence within them and use the remaining room for reading and human pauses. Never accelerate a voice clip merely to fill the window.

| Window | Speaker | Final line or action |
|---|---|---|
| 0–5 | Visual | "Quick question, Manish." transforms into a believable Slack message. Let the app become recognizable immediately. |
| 5–18 | Narrator | "A quick question. The right person. The wrong time. When the context lives with one person, everyone else waits." |
| 18–24 | Visual | Clocks lock: SF 1:30 PM / Bengaluru 2:00 AM, next day. A 1-second still hold. "What if the context could stay?" |
| 24–34 | Narrator | "Meet AI Peer. A personal AI teammate that understands your work, and helps the conversation continue when you're away." |
| 34–49 | Narrator | "It learns from the context you choose, keeps up with the latest sources, and works within the boundaries you set." |
| 49–53 | Visual | Hold explicit permission: Slack routine context; Chargebacks sync; date commitments need Manish. |
| 53–64 | Visual | Establish actual Slack layout, clock and Manish's earlier question. Sarah's question enters. |
| 64–72 | Sarah | "Quick question, Manish—daily totals, or the final result for each dispute?" |
| 72–77 | Alex | "It's two a.m. for him. We may have to wait." |
| 78–94 | Peer | "I'm Manish's AI Peer. He's offline. We need the final won-or-lost result for each dispute, refreshed hourly. It feeds the reconciliation dashboard." |
| 94–105 | Sarah | "Use Dispute Events. It refreshes hourly. The daily summary would be too late. I'll send the field mapping." |
| 106–112 | Peer | "Thanks, Sarah. I'll include that in Manish's handoff." |
| 112–118 | Narrator | "A useful answer. Before another day slips by." |
| 118–130 | Visual | Same source/message becomes meeting agenda; clock advances ten minutes; delegated Zoom join. No extra narration needed. |
| 130–137 | Alex | "Hey Manish, where are we on Chargebacks? Are we ready for Friday?" |
| 138–145 | Sarah | "I don't think Manish is here. It's past two in the morning for him." |
| 146–155 | Peer | "Hi, I'm Manish's AI Peer. He couldn't join, so he asked me to cover this update." |
| 156–160 | Alex | "Great. What's still blocking us?" |
| 160–178 | Peer | "The dashboard is built. Two checks remain: the same event arriving twice, and an outcome changing later. Sarah just confirmed the hourly source in Slack, so the data question is answered." |
| 178–182 | Sarah | "I can provide both test examples today." |
| 183–187 | Alex | "Can we confirm Friday, then?" |
| 187–196 | Peer | "That needs Manish's approval. I'll take back the test plan and ask him to confirm the date." |
| 196–200 | Alex | "Perfect. We can keep validation moving." |
| 200–205 | Visual | Morning transition and 9:00 AM Bengaluru clock. |
| 205–217 | Narrator | "You return to answers, evidence, and the decisions that still need you. Less catching up. More moving forward." |
| 217–220 | Visual | Hold launch-date review item, explicitly pending. |
| 220–228 | Narrator | "Your work has a timezone. Your Peer doesn't. AI Peer." |

Some voices may require 1–2 seconds more in the Zoom sequence. Recover these by shortening the visual-only 118–130 calendar transition or extend the film to 234 seconds. Preserve the pause after "Manish" and the holds after the useful answer; those create the scene.

## Source copy to keep identical

- Requirements v3: **Final won-or-lost result for each dispute · Refreshed hourly.**
- Superseded requirement: **Nightly refresh.** New requirement: **Hourly update.**
- Manish's handoff: **Dashboard build complete. Two data checks pending: duplicate events and late reversals.**
- Release plan: **Friday target · Not approved.**
- Sarah Slack: **Dispute Events · Hourly refresh · Field mapping to follow.**
- Morning: **Data source clarified / Sarah offered test examples / Needs you: confirm Friday after validation.**

## Production warnings that should change the shots

- Three realistic human webcam stills plus audio will look fake if treated as moving video. Either use credible subtle actual video loops or camera-off profile tiles. If only still images are possible, make the mode unmistakably profile imagery and let active-speaker outlines, waveforms and shared evidence carry the conversation.
- The Peer must be visible as a participant *before* speaking, or clearly join before speaking. Do not make it materialize solely as a dramatic effect without a Zoom join state.
- Calendar “Manish declined” and a separate, enabled “Peer delegated” state are both necessary; otherwise viewers may infer the Peer attends meetings merely because it sees an invitation.
- At least once open the source to the actual supporting sentence. Decorative document titles do not demonstrate grounding.
- Keep scene headings small after the reveal. Full Slack and Zoom application views should dominate the frame.
- “Realistic screenshots” means authentic application geometry and text density. An oversized chat message in a purple rounded window is insufficient. It needs Slack's recognisable navigation, channel header, message hierarchy and composer; Zoom needs real gallery spacing, toolbar anatomy, names and speaker behavior.

## Review result

The proposal addresses all requested story beats: realistic Slack, unmistakable local time, actual back-and-forth; Zoom ask/absence/AI-identification/value; credible boundaries; a reviewable morning handoff. The principal remaining risk is execution quality, especially webcam realism, conversational pacing, and a full-frame application rather than a card pretending to be an application.

## Final locked script check

Reviewed `../../video/public/draft02/script.json` after root extended the timeline to 240 seconds. **Creative/meaning continuity passes.** All four requested corrections are present. The shared project stays coherent across requirements, Slack, Zoom and morning. The AI identifies itself separately in both channels, adds useful context, incorporates Sarah's new evidence, and leaves launch approval with Manish.

One evidence distinction must survive the visual execution: Sarah **offered** two test examples; she has not yet delivered or run them. Morning UI should say "Sarah offered two test examples" or "Test follow-up agreed." Do not visualize completed tests or an already delivered test artifact. The spoken "test plan from Zoom" is the agreement to provide those examples.

Next gate: inspect representative frames, every transition, dialogue sync and pacing from the actual exported film. This script approval is not a video-quality approval.
