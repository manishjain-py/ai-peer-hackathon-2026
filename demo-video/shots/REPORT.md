# WP3 report: the nine AI shots with people

ai-peer-video-wp3, 2026-11-14 13:16 UTC. Spent **$23.10 of the $60 cap** (95 calls, every one in
`demo-video/ledger/wp3.csv`; no call failed, no tool refused the content).

**All nine slots are final in `demo-video/shots/manifest.json`.** Look first at
`demo-video/shots/all-shots.jpg` (five frames of each), then at each slot's own sheet.

I judged every clip from frames 0.2 to 0.5 s apart, from measurements, and from sheets. Nobody
has watched a clip in motion or heard it: Manish's eyes and ears are the real test.

## The nine finals

Paths are under `demo-video/shots/`. "From" is `use_from_s`, where the film window should start.

| Slot | Final | Route | Cost of the slot | From | What is still weak |
|---|---|---|---|---|---|
| `hook-1` | `hook-1/hook-1-final-v1.mp4` | H3 Max Turbo 1080P, WP2's line pinned as the sound (3 takes) | $0.90 | 0.46, line at 0.86 | lively eyebrows; she looks to the right of the camera, not just past it |
| `hook-2` | `hook-2/hook-2-final-v2.mp4` | the same (9 calls) | $2.28 | 0.44, line at 0.84 | his lips part 0.15 s before the voice |
| `hook-3` | `hook-3/hook-3-final-v1.mp4` | the same (7 calls) | $1.04 | 0.80, line at 1.20 | the lean-back is modest; two clear mouth moves for five syllables |
| `hook-sleeper` | `hook-sleeper/hook-sleeper-final-v1.mp4` | H3 Max Turbo 1080P (3 takes) | $1.00 | 0.8 | the breathing is real but small |
| `reveal-rise` | `reveal-rise/reveal-rise-final-v2.mp4` | Kling 4.0, four key frames, take 3; FlashVSR+ to 1080p; phone light-up by code | $7.19 | 0.2 | the tag is off for half a second while he bends to stand; a little shimmer on the window glass from the upscale |
| `reveal-desk` | `reveal-desk/reveal-desk-final-v1.mp4` | Kling 4.0 from the rise's real last frame, take 1; FlashVSR+ | $2.43 | 1.04 | blurred and pale for a few frames as he sits; the screen is small in the wide frame |
| `morning-wake` | `morning-wake/morning-wake-final-v3.mp4` | H3 Max Turbo 768P, FlashVSR+ (11 takes, 1 upscale) | $2.49 | 0.6 | he sits up in about one second; the phone hand blurs for 3 or 4 frames |
| `morning-brief` | `morning-brief/morning-brief-final-v4.mp4` | H3 Max Turbo 768P, FlashVSR+, 8 frames retouched by code (9 takes) | $2.23 | 1.0, tap at 4.04 | the tap is small and quick |
| `morning-nod` | `morning-nod/morning-nod-final-v1.mp4` | Kling 4.0, first frame to the empty room; FlashVSR+ | $1.47 | 1.0 | the nod is small; he is more solid than "faint" before he fades |

The stills cost $2.06 (26 pictures: `stills/stills.jpg`, `stills/double-looks.jpg`).

Would they pass in a premium advert? The stills: yes. The two reveal shots and the nod: close,
from what frames can show. The hook shots: the pictures yes; the speech is acceptable, not
perfect. `morning-brief`'s tap is the weakest beat: it happens, but small.

## The double

- **The look is B, threads of light** (Manish, decision V14): the same man in his own colours,
  a soft mint light inside his chest, no drawn outline and no sparkles, joined to the sleeper by
  hair-thin threads while he separates. The threads let go on the walk to the desk.
- **Key frames** (all edits of one frame, 0 pixels of shift): `stills/night-phone-lit.png`,
  `night-rise.png`, `night-tuck-c.png`, `night-stand.png`, `night-desk.png`. Plates for code:
  `night-phone-dark.png`, `night-tucked.png`, `morning-nod-plate-exact.png`.
- **The order in the rise** is rise, tuck, stand. He pulls the blanket up from where he sat up.
  With the first tuck key frame (`night-tuck.png`, on the bed's edge) two Kling takes had him
  crawl over the sleeper for half a second; a prompt did not fix it, the new key frame did.

## Why route K for the rise (decision V13 asked for O first)

Three routes were made from the same new stills:

- **O** (Gemini Omni, first and last frame, `reveal-rise/reveal-rise-raw-f1-o.mp4`): smooth, and
  a clean still first second. But from about 2 to 4 s the double is another, lighter-skinned man,
  and the threads hardly show before he stands. It has no key frames to hold him.
- **H3 Max Turbo** at 1080P (`reveal-rise-raw-f1-h.mp4`): draws a bright white outline.
- **K** (Kling 4.0, key frames): he is the employee in every frame, see-through with the threads
  as he separates. Chosen. On the walk to the desk K also kept the glow; Omni's draft lost it.

## What was learned

- `minimax/h3-max-turbo/image-to-video` is the cheap workhorse: $0.028 a second at 768P until
  15 November, 15 s to make, takes a first and a last frame and a pinned sound file. It made
  every draft and six finals. With the same seed and prompt expansion off it repeats a take.
- **Lips do follow a pinned sound file on H3**, loosely. The mouth runs 1 to 2.5 frames early,
  and action before the line pushes the mouth late, so each final has its own `line_at_s`.
  `tools/lipsync_check.py` measures it. `veed/lipsync` billed $0.40 for one clip and blurred the
  mouth; `creatify/boreal` moved the camera and added a figure; Kling AI Avatar has the most
  exact lips but a soft, static picture.
- **768P plus FlashVSR+ beat native 1080P on H3** for the morning shots: native 1080P enlarged
  small movements and came out softer. `openimaginglab/flashvsr-plus` at 1.5 times costs 12 to
  25 cents a clip and keeps the face.
- Every image edit lifts the picture's tone by about 4 levels: match the tone before using a
  twice-edited still beside a once-edited one (`morning-wake/tone_match.py`).

## Tools added (`demo-video/tools/`)

`gen-wp3.sh`, `gen-wp3-batch.sh`, `deliver.sh`, `shots_manifest.py`, `all_shots.py`,
`lipsync_check.py`, `chest_track.py`, `screen_quad.py`, `phone_lightup.py`.

## Routine calls I took (undo: tell the controller)

1. Three helpers (sub-agents) made the six shots without the double and the three tools, from
   one shared brief (`shots/BRIEF-subagents.md`). I checked their finals on the sheets.
2. The tuck happens before the stand, seated in the bed (`SHOTS.md` says stand, then blanket).
3. The phone glows mint, the Peer's colour, and lights up by code at 0.35 s of the clip.
4. `morning-nod` is seen past the shoulder of the man in bed, a closer angle than the wide room.
5. `reveal-rise` has a 0.6 s still lead-in (the first frame held) to give the phone its beat.
6. `reveal-desk` gives a 3840x2160 `last_still` (the last frames upscaled 3 times, 4 cents).
7. Unused raw takes (about 98 files) stay in the worktree and are not committed.

## Not done, not checked

- No clip was watched in motion or heard. The sound of the three speaking finals is WP2's own
  recording at `line_at_s`; nothing else carries sound.
- The join from `reveal-rise` to `reveal-desk` is a match on the standing pose, not frame-exact
  (about 2.4 s of standing still is skipped): a 6-frame dissolve hides it.
- `reveal-desk`'s tag is on only for the first 3 s (after that he is side-on).
- The fal.ai balance is still unknown; no call was refused for it.

## Money

| Bucket | Planned | Spent |
|---|---|---|
| Stills | up to $4 | $2.06 |
| The two reveal shots (drafts and finals: 4 Kling takes, 3 Omni, 3 H3, 4 upscales) | up to $20 | $9.62 |
| The hook's four | up to $12 | $5.23 |
| The morning's three | up to $9 | $6.19 |
| **Total** | **$60** | **$23.10** |

(The drafts, $2.25 for 12 clips, and the 7 upscales, $1.28, are counted inside their slots.)
