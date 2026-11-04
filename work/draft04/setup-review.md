# Draft 04 — independent setup review

Reviewed 2026-09-18. Reviewer did not build SetupScene. Review used rendered 1920×1080 PNGs before consulting any source code; no SetupScene source was needed. This is a sampled visual/content review, not uninterrupted playback or direct audio listening.

## Samples

Inspected `frame-00027.png`, `frame-00029.png`, `frame-00031.png`, `frame-00033.png`, `frame-00035.png`, `frame-00038.png`, `frame-00040.png`, `frame-042.5.png`, `frame-00045.png`, `frame-047.5.png`, `frame-050.5.png` and `frame-00052.png` in this directory.

## Verdict

The setup story is clear and visually coherent. Two small polish fixes are recommended before final export. No essential heading, main message, caption, or source panel was cut off in the inspected samples.

## What works

- **One-button start:** 27–29s presents one prominent “Create my AI Peer” button. The pointer moves onto it, and the next samples show understanding beginning. This communicates an easy start without making the user read a configuration form.
- **Personal context:** 31–35s shows the OneAirbnb profile, then team and project, with the same facts accumulating in the persistent right-hand understanding panel. “Work & ownership” and the saved handoff idea establish context useful to the later brief.
- **Code context:** 38–40s keeps the project/team visible while Sourcegraph finds `event-mapper.ts` and service ownership. The 42.5s GitHub sample adds merged/draft/open recent work, demonstrating more than a set of connected source logos.
- **Specific access choices:** 45/47.5s distinguishes Slack read/reply access in selected project channels from Zoom meetings explicitly delegated to the Peer. The Zoom copy identifies it as AI. Approved email and company events are marked read only. “You keep the decisions” supports the boundary in plain language.
- **Completion:** 50.5–52s gives a clean ready state and three concrete outcomes: personal brief, project conversations, and delegated meetings.
- **Truthfulness:** The concept-film/illustrative-data badge remains visible. The simulated source windows are labeled illustrative setup.

## Recommended fixes

1. **Right-panel footer chips cross the panel edge.** At 42.5, 45 and 47.5s, “Open checks” and “Saved handoff idea” occupy about y850–888 while the enclosing green panel ends near y882. Move the chips up or tighten the stack so they have comfortable bottom padding. The chip text itself remains readable.
2. **Use a functioning code example.** At 38–40s, `export function mapDispute(event) { outcome: event.outcome }` places a JavaScript label inside the function and returns nothing. A clear `return { outcome: event.outcome };` demonstrates the intended mapping and avoids distracting an engineering audience. Preserve the highlighted outcome field.

## Optional, nonblocking refinement

The access descriptions are smaller than their product labels. They are readable in the full-resolution samples, but a modest size increase would help phone playback. The Zoom tile currently uses a generic message outline; a camera icon would better match the meeting context.

## Follow-up

The scene owner reports both recommended fixes applied: tighter vertical spacing keeps footer chips inside the panel, and the highlighted Sourcegraph example now uses a valid return mapping. Corrected rendered evidence remains to be checked.

## Encoded preview and final verification

Reviewed the actual encoded `renders/ai-peer-draft-04-preview.mp4` after the fixes, using **62 decoded frames at 0.5-second intervals from 24.5–55 seconds**. Contact sheets and selected full-size decoded frames are retained in `setup-encoded-review/`. This temporal sampling includes the previous relief scene, the complete setup sequence, and the start of the personal brief. It is not an uninterrupted playback or an audio-listening review.

**Pass — no blocking visual or content finding.**

- The relaxed person and Peer lead into a single obvious creation action. The pointer moves toward the button; the click emphasis and subsequent profile view make the cause and effect understandable.
- Profile facts build in a readable order: the employee, their team, their project, then work ownership and the saved idea. The persistent right-hand panel accumulates the same understanding instead of resetting between tools.
- Sourcegraph follows naturally from project ownership. GitHub then adds recent work and open checks. The viewer can understand why these sources matter, beyond their brand names.
- Slack and Zoom are enabled one after the other with visible pointer/toggle changes. The permission descriptions remain on screen, and the final yellow “Ask me before commitments or changes” bar gives the decision boundary a clear hold.
- The ready state has sufficient visual separation from configuration. Its personal-brief promise transitions directly into the actual “Good morning, Manish” brief around 53 seconds, preserving the story.
- No unexplained blank frame, caption collision, essential-content overflow, or incorrect source ordering appeared in the sampled encoded sequence.

Then inspected **actual final 1920×1080 MP4 frames at 40s and 49s**, retained as `setup-encoded-review/final-40.png` and `final-49.png`:

- At **40s**, the Sourcegraph example visibly returns `{ outcome: event.outcome }`; the project, ownership and persistent context panel remain clear.
- At **49s**, both Slack/Zoom toggles are enabled, their explicit boundaries remain legible, the approval bar is visible, and the right-panel footer chips are fully contained with bottom padding.

Both original recommended fixes are therefore verified in the delivered-resolution encoded output. No further source changes are requested by this review.

## TLDR

The setup clearly communicates create → learn your context → understand your code → choose access → ready. The code and layout fixes are verified in the final encoded 1080p film. No blocking issue remains in this sampled review.
