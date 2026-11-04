# Draft 02 — independent visual and pacing review 01

Reviewed 18 September 2026. Materials: all 26 actual `frame-*.png` images from 4 through 235 seconds, locked script and actual voice timings in `../../video/public/draft02/audio/timing.json`. Supplemental source inspection clarified existing motion behavior. **This is a still-frame and timing review, not full playback or direct audio listening.**

## Verdict

This is a substantial improvement over Draft 01. Slack is unmistakably Slack; Zoom is unmistakably Zoom. The human/AI meeting hierarchy reads at a glance. Large text is crisp, the color progression has intention, and the same project remains identifiable from source setup to morning handoff.

It is not yet an advertising-quality film simply because these individual frames look clean. The opening still has the grammar of presentation slides, and the actual audio schedule leaves too much empty space between meeting lines. Both can be improved now without changing the story or resynthesizing voices.

The four user-requested Zoom beats are all clearly staged: ask Manish, notice absence, Peer identifies itself, Peer supplies useful status. The active speaker outline and source sharing make the value much clearer than Draft 01. The handoff correctly distinguishes promised test examples from completed tests.

## Required fixes already identified by root

These are visible in the reviewed frames and should be treated as release blockers until new frames verify them:

- Slack 83 seconds: the Peer speaks while its message is entirely below the viewport.
- Slack 93 seconds: the useful answer is cut off by the composer.
- Slack 104 seconds: Sarah speaks while only her name is visible.
- Slack 111 seconds: the Peer's acknowledgment is not visible while it speaks.
- Top-right concept badge overlaps the Slack time label.
- Captions use guessed timing and leave orphan fragments such as "one." in the sampled version. Root is replacing these with true TTS boundaries.
- Zoom uses a different Peer glyph. Root/Zoom agent is unifying it.
- Morning sidebar wraps "While you were / away" with excessive line spacing. Root has changed it to "Activity."

## Additional actionable findings

### 1. Make the source name match across applications

At 178 seconds, Zoom cites **#chargebacks**. The actual Slack channel is **#proj-chargebacks**. Change the Zoom source label to **#proj-chargebacks**. This is small but directly affects the credibility of the evidence chain.

### 2. Open an actual source at least once

At 104 and 111 seconds the Slack source attachment is only a title and timestamp. The earlier context scene displayed a requirements summary, but there is no visual action linking the answer to a supporting sentence.

Use the **94.8–97.8 second voice gap** to briefly open Requirements v3 as a source preview, with this exact short excerpt:

> Final result for each dispute. Refresh hourly.

Keep "Updated 6:10 PM IST" and a shared-project marker. Anchor the preview to the source attachment, use a cursor press and a clean expanding motion, and close before Sarah's reply at 98 seconds. Three seconds is enough for the short excerpt. This gives the citation a visible purpose.

### 3. Improve the opening through one meaningful transformation

The 4-second typography is confident and readable. The clock comparison at 14 seconds is clear. But these are three separate title/clock/title states; the faint wave does not create narrative continuity by itself.

Use **5.2–8.5 seconds** (after the first voice line, before the next) to shrink "Quick question, Manish" into a small recognizable Slack notification. Let it travel toward the Bengaluru clock and stop when "Notifications paused" appears. Preserve the one-second still hold at 18 seconds.

At 19 seconds, the waiting dots can become the Peer mark, or the notification can become the context line. The action should say **the conversation hit an absence; context can cross it**. Do not add decorative motion unrelated to that idea.

### 4. Trim conversational silence

The Zoom scene is 81 seconds long, but contains only **44.688 seconds of spoken dialogue**. Several gaps are 3–6 seconds. Some reading time is useful, but these repeated gaps risk sounding like independently generated lines instead of a meeting.

Preserve the awkward pause after Alex first asks Manish. After the Peer appears, replies should become more immediate. A useful target is about **65 seconds for the Zoom scene**, taking the whole film to around **3:44**. This remains within the user's requested range.

If changing every scene cue is expensive, trim these silent windows from the complete rendered picture and sound together, then re-time external captions. These are candidates with speech-safe margins, not blindly approved edit points; inspect motion at each cut first:

| Original cut window | Remove | Why |
|---|---:|---|
| 135.50–137.20 | 1.70 s | Retains roughly 2 seconds of awkward pause before Sarah. |
| 143.55–145.30 | 1.75 s | Keeps the absence acknowledgment without a second long wait. |
| 152.75–155.45 | 2.70 s | Alex should reply naturally after the Peer's introduction. |
| 169.20–172.70 | 3.50 s | Still leaves time to read the two checks before Slack confirmation. |
| 180.35–182.50 | 2.15 s | Sarah can volunteer examples promptly after the new fact. |
| 187.25–188.55 | 1.30 s | Keeps "Can we confirm Friday?" connected to her offer. |
| 201.55–204.60 | 3.05 s | Avoids a long silent wait before Alex's "Perfect." |
| **Total** | **16.15 s** | Final duration approximately **223.85 seconds**. |

Do not speed up speech to achieve this. Shorten the gaps.

### 5. Be deliberate about screenshot realism

The portraits, room backgrounds and Zoom controls look credible in a still frame. Across the samples, the human faces are completely unchanged. That is acceptable for a stylized screenshot reconstruction; it will not convincingly read as live webcams if held full size for 30 seconds under spoken dialogue.

Do not fake lip motion with a cheap mouth transform. The current best path is to keep gallery establishment short, push toward the active speaker/Peer, and move to the shared source brief promptly. The active-speaker border should stop when actual speech ends; subtle camera motion does not count as facial animation. If a candid limitation is documented, call these **animated interface reconstructions with fictional participant portraits**, not live meeting footage.

### 6. Complete the concept disclosure on the final card

The repeated corner label is good but small. Add a readable final footer beneath the tagline:

**Illustrative Slack and Zoom scenarios · Integrations not yet implemented**

It can appear at 237 seconds in the untrimmed master and stay to the end. No narration change needed.

## Keep these choices

- 38–45 seconds: requirements, owner handoff and release plan are concrete and use the exact facts later spoken. The changed hourly requirement is a meaningful update, not vague "learning."
- 52 seconds: allowed Slack context, delegated Zoom attendance, and human date approval are explicit.
- 124 seconds: Manish declined outside working hours; Peer is delegated. This makes meeting representation intentional.
- 151 seconds: the Peer looks clearly different from human attendees and visibly says AI.
- 166–186 seconds: the shared screen separates completed build, open checks, and new Slack evidence.
- 198 seconds: "Friday is a target. Not a commitment" makes the important boundary understandable.
- 217–226 seconds: "Test follow-up agreed / Sarah offered examples" is accurate. Keep those exact distinctions.
- 235 seconds: dark green closing card has good hierarchy and an appropriately calm ending.

## What the actual full-video review still must decide

1. Does the initial question-to-clock transition feel like one continuous thought?
2. Are Slack scrolls timed early enough that a viewer can read the message as it is spoken?
3. Do meeting responses sound human in timing, especially after the Peer introduces itself?
4. Does the large portrait gallery overstay its welcome or reveal the still-image illusion?
5. Does the source preview read at ordinary playback speed?
6. Are the known layout/caption/glyph fixes present in the exported movie, not only source code?
7. Is the music emotionally shaped and quiet under the conversation, verified by direct listening?

## TLDR

The concept and application realism are much stronger. Fix the known visibility issues, shorten repeated meeting pauses, give the opening one meaningful moving object, and show one source being opened. Then verify the actual film in motion.
