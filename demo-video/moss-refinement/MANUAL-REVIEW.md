# Moss v3 manual scene walk

The source and final media are reviewed visually, following this repository's manual-walk
workflow. No unit-test/CI gate was introduced. Source proof and audio acceptance belong to
controller `/root`; this package is built by the sole worker `moss_v3_builder`.

## Source review

- Generated speech pilot:24 frames across the six-second m1 take. Controller accepted
  actual mouth articulation and retained felt identity. m2 and m4b use the same controlled
  identity/audio route. Listening remains closed-mouth during Amara's question.
- Stamp keyframe and16-frame motion pilot: same face/sprout/pendant, wooden-handled stamp,
  a visible lift/downward press/release. Generated tiny unreadable ink below the feet is
  removed by the saved alpha conversion; the film adds the designed HIGH CONFIDENCE seal.
- Typing pilot: actual alternating paw/keyboard contact, beginning after the source's first
  second. No provider receives Slack UI or text. The film's typed composer is drawn locally.
-37 focused caption-aware composition points (`scene-review-*`): phone emergence and
  direct approach, setup landing, stamp approach/contact/hold, shortened rules, Zoom speech,
  Slack question/read/think/type/send/closeup, laptop greeting and matching push-in.
- Found and fixed during this walk: redundant welcome label over the home copy; Slack's
  original question clipping over its header during focus; composer hidden by narration;
  greeting moving as a detached plane over a static room. Final layouts remove the label,
  hide the old question during focus, lift typing above captions, and move the room/laptop
  in lockstep with its projected screen.
- Chrome's GPU left one stale earlier actor in the live iframe proof when jumping to60.4s.
  Standalone source had one actor. Software compositing removes the ghost; four-point
  `ghost-fixed-*` proof and `encoded-stamp-single.jpg` verify the actual clean movie has one.
- Entrance endpoint matches the clean source's actor height/position/action before22s.
  Morning uses the exact brief's first-frame composition for its105.6s landing.

## Audio review

No direct listening is claimed. Controller rebuilt the original voice/music sources and
checked the edited mix. Same original PCM music samples are retained0–65.9 and99.9–113.9s;
Zoom/Slack thin bars move to66/88; the source's own last cadence arrives116.0 after the
115.7 endcard, followed by its natural decay. Extra116.5 introductory-bar restart removed.
The existing entrance whoosh ends16.3, the upbeat20–22 musical rise remains. WAV measurements:
-14.0LUFS,-2.0dBTP, weakest voice/music separation15.2dB. Local speech recognition finds all
22 retained lines in order and no deleted sentence. See saved `audio/` evidence.

## Final encoded review

Full film and720p delivery copy are being encoded. `tools/verify.py` and
`tools/encoded_proof.py` will record completion and produce exact decoded scene/boundary/
720p frames. The controller owns final acceptance and Telegram delivery. No final approval
from Manish is implied by this build or controller's technical review.
