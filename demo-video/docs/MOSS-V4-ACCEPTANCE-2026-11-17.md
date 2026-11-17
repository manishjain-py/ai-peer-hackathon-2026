# Moss v4 controller acceptance

17 November 2026, V37/V38. **Final encoded exports accepted and delivered.** PR 21 merged
as `033fb44`; checkpoint `blended-moss-v4` pushed. Telegram video 23108 / review 23109
are confirmed. This records controller acceptance; no final approval by Manish is inferred.

## Requested changes

The controller `/root` accepted 24 source points covering the new setup-home definition,
benefit timing, larger presenting Moss, long-caption clearance, setup button, continuous
home at 22 seconds and landing on the retained setup flow at 24.6. The same-Matilda
18-word introduction starts at 15.0 and ends at 21.667, before the existing 22.2 setup line.
Local speech recognition matches the new sentence; selected narration and word timing are saved.

Morning framing excludes both physical phones and removes both external mascot overlays.
Only the laptop's Moss greeting remains. The room and projected screen follow the same
camera path, preserving the push-in and 105.6-second brief landing. The p08 caption's last
word and hold move 320 pixels left from 102.2, leaving the greeting unobstructed without
cutting speech. A newly visible video's stale first frame was resolved by waiting two
animation frames after seeks. Software compositing retains V3's earlier ghost fix.

## Final movie and preservation proof

The controller inspected and accepted 56 encoded master scene frames, 24 join/boundary
frames and 26 independently decoded 720p frames, including both patch seams and the V3
picture bridges. The final technical report was also reviewed. Both exports fully decode
at 119.600 seconds / 3,588 frames / 30 fps, with correct 1080p and 720p dimensions.
Both measure -14.0 LUFS / -2.1 dBTP; all 5,608 AAC payloads and timestamps match.

A baseline split/rejoin spike first proved all 3,588 V3 decoded frames identical. New scene
capture covers 486 frames at 14–24.6 and 100–105.6 seconds. The delivered assembly re-encodes
the complete GOP spans 14–28.566667 and 100–113.633333; bridges after 24.6 and 105.6 use
actual V3 pictures with only compression changes. Outside those spans, 2,742 decoded frames
(91.4 seconds) match V3 exactly. The optional full-render route is documented without
claiming exact frame identity. All Tag v2 and Moss v1/v2/v3 master hashes remain unchanged.

All 21 other voice entries remain exact; only p02 is replaced by p02v4. The complete V3
music bed is reused, including the resolved ending. Actual V3 mixed PCM is exact at
0–14 and 24.6–119.6 seconds. Audio source, local speech check, measurements and preservation
hashes are saved. Direct human listening is not claimed.

Evidence: `../moss-introduction/MANUAL-REVIEW.md`, `evidence/checks.json`,
`evidence/assembly.json` and `audio/pcm-preservation.json` in that package. Rebuild:
`../moss-introduction/README.md`. The retained `../ui-concepts/moss-v3/` supplies the
walkthrough after 24.6 seconds; v4's new introduction is in its own film layer.

## Cost and closure

The direct ElevenLabs credential was absent; the first local attempt stopped before HTTP.
The authorized fal.ai route supplied the same Matilda voice/Multilingual v2 model for
$0.0106 (106 fictional characters), taking project spending to $51.398527 of $100.
No new art or paid motion was generated. Only invented narration text went to the provider;
no private input or production access occurred. An unavailable private-term-list scan is
not claimed. Final weekly usage was 22%.

Implementation worker `moss_v3_builder` finished; no provider, renderer or server job
remains. `/root` performed the creative/media review and delivery; successor controller
`moss_v4_closeout` completed shared records and current pointers. Full delivery details,
hashes and receipts are in `MOSS-V4-DELIVERY-2026-11-17.md`.
