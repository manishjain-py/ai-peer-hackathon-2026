# Draft 02 — independent encoded-film visual review

Review date: 18 September 2026.

**Verdict: ready for user review. No blocking visual or timing issue found in the inspected encoded-film samples.**

This review used the actual [preview MP4](../../renders/ai-peer-draft-02-preview.mp4), not just Remotion source renders. The file is H.264, 960×540, 30 fps, with AAC audio; both streams are exactly **224.100 seconds**. It also includes the final 1080p spot-check below.

## What was actually inspected

- Extracted **99 unique frames** from the encoded MP4, covering closely spaced temporal samples around the opening, context changes, all four Slack scrolls, source preview, Zoom gallery-to-share transformation, all seven editorial joins, morning handoff and ending.
- Viewed all eight labeled [temporal sheets](encoded-review/) and inspected eight key frames at the full encoded 960×540 resolution for message visibility, source text, continuity and final disclosure.
- Compared original and edited timing data: **all 29 spoken lines and their text are preserved**. The edited duration is 224.1 seconds.
- Checked actual edited dialogue positions against the visible captions and source states in sampled frames.

**Limits:** this is temporal visual sampling and timing/transcript comparison. It is not a claim of uninterrupted full-speed viewing or direct audio listening. Music quality, voice naturalness and audible sync still require direct listening; audio metrics alone do not establish them.

## Verified improvements

| Final output time | Result |
|---|---|
| 5.4–10.0 s | A Slack notification emerges from the opening question and travels toward the Bengaluru clock. The movement preserves a story object through the type-to-time-zone change. It gives the introduction a more deliberate advertising feel than the earlier sequence of cards. |
| 18–21 s | The waiting beat resolves into the Peer/question reveal. The large type remains readable through the transition. |
| 42–44.5 s | The updated hourly requirement appears below its source. The viewer can connect the new fact to the requirements card. |
| 49–51 s | Source setup yields to explicit delegation and approval boundaries. No text clipping or blank state after the transition settles. |
| 78.4–80.1 s | Slack scrolls before the Peer's introduction settles; its name, APP badge and explanation are visible. |
| 85.7–87 s | The useful requirement answer enters the visible message viewport. It is no longer hidden by the composer. |
| 94.9–97.5 s | The source preview is readable: "Final result for each dispute. Refresh hourly." It shows the source version, owner and update time. This materially improves the grounding demonstration. |
| 97.7–99 s | Sarah's reply enters the visible viewport after the source preview. |
| 107.1–108.5 s | The final acknowledgment becomes visible as the Peer speaks. |
| 153.7–156.1 s | Zoom participant tiles move from gallery positions into the screen-share column while the evidence page expands. This is the strongest connected transition in the film. |
| 171.6 s | Zoom cites the exact Slack channel, **#proj-chargebacks**, and quotes Sarah's hourly-source confirmation. The shared evidence and participant layout remain readable. |
| 195.1–200 s | Morning handoff enters cleanly; the sidebar says "Activity" and the summary accurately says Sarah **offered** test examples. |
| 221.1–224.1 s | Closing tagline and explicit integration disclosure are present. The final frame remains composed and readable. |

The corner concept label no longer collides with the Slack time-zone header. The Peer glyph is consistent across Slack, Zoom and the morning UI. The caption samples follow actual speech boundaries and no longer leave the conspicuous orphan fragments seen in the earlier sampled draft.

## Editorial joins and dialogue timing

Compared frames immediately before and after the seven edited joins at **136.5, 142.5, 150.1, 164.5, 171.5, 176.2 and 189.3 seconds**. The same visual state is maintained across each pair: no missing source reveal, cut-to-empty frame, displaced participant or unexpected layout jump.

The meeting now occupies about **65.1 seconds**, retaining 44.688 seconds of dialogue. This removes the earlier repeated 3–6 second gaps. The remaining pauses are generally 1.5–2.5 seconds, with the deliberate first absence pause preserved at about 2.2 seconds. That is a materially better schedule for both conversation and reading.

| Speaker sequence | Edited end → next start | Remaining pause |
|---|---|---:|
| Alex asks Manish → Sarah notices absence | 135.296 → 137.5 | 2.204 s |
| Sarah notices absence → Peer introduction | 141.82 → 143.8 | 1.980 s |
| Peer introduction → Alex asks blocker | 149.296 → 151.1 | 1.804 s |
| Build/test update → new Slack evidence | 162.972 → 165.5 | 2.528 s |
| Approval boundary → Alex response | 188.268 → 190.1 | 1.832 s |

These are verified metadata intervals; whether the complete conversation feels natural by ear remains a listening judgment.

## Story and claim review

The film communicates the intended sequence clearly:

1. Manish has relevant context but is offline in a different time zone.
2. The Peer uses selected project sources and explicit delegation.
3. A concrete Slack requirement question is answered, and Sarah supplies new source information.
4. The Zoom meeting asks for Manish, acknowledges his absence, then hears an openly identified AI Peer supply useful readiness facts.
5. The Peer carries the new Slack answer into Zoom, demonstrating continuity between conversations.
6. Launch approval remains with Manish, who receives a reviewable morning handoff.

The film does not visually claim that validation has finished or that Friday has been approved. The final footer explicitly says that the Slack and Zoom scenarios are illustrative and the integrations are not yet implemented.

## Remaining creative limitations

The human Zoom portraits are static images. The app chrome, active-speaker treatment and screen-share motion are convincing, but this should be described as an **animated interface reconstruction with fictional participant portraits**, not live webcam footage. Keeping the gallery relatively short and moving into the shared evidence reduces the distraction.

Some scene changes still use straightforward fades rather than the fully continuous object choreography of a studio advertising film. The notification carryover and Zoom screen-share transition provide two clear improvements. These are stylistic limits, not blockers for this reviewable concept film.

The source preview is readable even in the 540p preview. Small chrome labels and the final disclosure will benefit from the 1080p delivery; essential dialogue and status text are already legible at the reviewed resolution.

## Actual 1080p delivery spot-check

After [the final MP4](../../renders/ai-peer-draft-02.mp4) completed, extracted and visually inspected three frames from that actual encoded file:

- **96.0 s:** Slack answer, source attachment and exact source preview are crisp, visible and unclipped. The corner concept badge clears the time-zone header.
- **167.5 s:** Zoom shared evidence is legible, quotes Sarah, cites **#proj-chargebacks**, uses the unified Peer glyph, and shows the Peer as active speaker while its matching caption is visible.
- **223.0 s:** Closing title, tagline and explicit "Integrations not yet implemented" disclosure are clear and remain inside the frame.

These three final-file frames match the reviewed preview's content and layout. No new issue found. Full technical decoding and final export verification remain root's separate QA.

## Review outcome

Release the completed 1080p export for the user's creative review after root verifies the final file. Do not claim direct audio listening occurred in this independent review. Preserve the original Draft 01 and the editable Draft 02 materials.

## TLDR

The encoded preview resolves the reported visual issues and the major pacing concern. Slack, Zoom, evidence and the human approval boundary now read clearly. No visual blocker found; direct listening remains a separate verification step.
