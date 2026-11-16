# Round 2 manual visual walk

16 November 2026. This review covers short audition scenes and sampled generated motion;
it does not claim that a new character has replaced the mascot throughout the 119.6-second film.
The approved master and all twelve previous options remain unchanged.

## What was inspected

The 25 still designs and cutouts were inspected in the earlier asset phase. In this render
phase, every one of the 23 generated motion takes was sampled at 0.1, 1.1, 2.1, 3.1 and
4.5 seconds on both cream and dark forest. The frame sheets are `evidence/NN-name-motion.jpg`.
Those sheets retain the source gestures, including the two frame-edge issues addressed below.
All 25 avatars were inspected at 96, 64 and 48 pixels in `evidence/avatar-framing.jpg`.

Each final audition has an eight-frame sheet sampled **from its encoded 720p file** at
0.8, 2.4, 4.6, 7.6, 11.5, 17, 21.3 and 23 seconds. The first two frames check internal acting;
the remaining frames cover room entrance/desk, meeting avatar, paper brief and closing mark.
The sheets are `renders/NN-name-encoded.jpg`. The renderer also saves five source-scene probe
frames as `NN-name-sheet.png`; encoded sheets are the final delivery evidence.

Full media decode, exact frame counts and per-frame nonempty-alpha checks for the generated sprites are recorded separately in `evidence/render-checks.json`.
The audition's video is 699 frames at 30 fps, exactly 23.3 seconds. AAC packet padding can make
container duration read approximately 23.317 seconds. The quick-look video is 2250 frames,
exactly 75 seconds.

## Framing and source selection

- The source mascot module is replaced inside an ignored copy of the public Tag v2 scene build.
  Generated raster art is not placed on top of the old mascot. Source timing, moves, scale keys,
  rotations, entrance/exit effects, layout, captions and dialogue remain controlled by the film.
- The generated body is fitted by its alpha bounds to a consistent 180-pixel nominal height,
  anchored at the bottom centre. Larger tails, wings and ribbons remain part of the full body.
- App icons, meeting portraits and caption portraits use deliberate face/upper-body crops from
  the original provider-alpha stills, with a mint backing. These surfaces are intentionally still;
  real generated body acting appears in the introduction, room and paper-brief companion.
- Body movement replays the generated five-second take in alternating directions to avoid a
  discontinuous end-to-start jump. Sora uses 2.9–4.9 seconds and Manta uses 0.05–1.65 seconds:
  their widest original gestures briefly touch a provider frame edge. These complete sections
  retain real wing/tail/face movement without adding paid generations or hiding a clipped edge.
- Short generated acting takes are reused across excerpt contexts. Speech lip sync and per-line
  character acting have not been authored; the original body-position choreography is retained.
- Nori05 and Dew15 preserve the provider-alpha still and use a small composed float plus the
  film's existing choreography. The intro and gallery label that method explicitly.
- The edge despill preserves wool, paper and silk detail. No visible magenta plate remains in
  the checked dark/cream frames. Very fine pale outlines are possible at magnification, especially
  on reflective and translucent materials; the auditions are the practical viewing reference.

## Character observations

| No. | Character | Observed acting and small-scale character |
|---|---|---|
| 01 | Miso | Paw wave and closed-eye smile; friendly felt face remains clear in a tight icon. |
| 02 | Tavi | Happy open-mouth smile, blink and paw movement; broad snout reads especially well. |
| 03 | Mallow | Knitted mitten wave, eyes and broad smile; the compact cloud silhouette is very cheerful. |
| 04 | Pipkin | Paw lift, smile and blink; large ears and curled tail stay complete in full-body scenes. |
| 05 | Nori | Composed float only; the opal body, gills and translucent tail are preserved. |
| 06 | Bram | Subtle wooden paw, head, blink and wing movement; the avatar prioritizes his face. |
| 07 | Pogo | Felt paw/face acting with a soft tail sway; warm apricot details balance the green. |
| 08 | Clover | Leaf-hand greeting and broad smile; the crest gives a distinct full-body silhouette. |
| 09 | Lumi | Ceramic face/hand acting and paper-wing movement; the lantern remains warmly visible. |
| 10 | Fable | Paper ears, paw and expressive eyes; the folds remain coherent during the gesture. |
| 11 | Sora | Safe closing section retains head/tail/wing movement; widest clipped wing gesture is excluded. |
| 12 | Peeko | Woven hand wave and smiling eyes; more slender/darker than the rounded companions. |
| 13 | Wisp | Fin greeting, blink and tail motion; face crop makes the long whale body work as an icon. |
| 14 | Orbit | Ceramic ring-arm greeting and blink; pearly body is compact and calm. |
| 15 | Dew | Composed float only; the transparent material and inner amber seed remain intact. |
| 16 | Ember | Small wave and contented smile; hood and amber belly create a reassuring warm focal point. |
| 17 | Pebble | Blink, warm laugh and hand greeting; textured moss remains intact on dark and cream. |
| 18 | Bento | Clear snout/face and foreleg greeting; the full bamboo shell stays visible in wide body scenes. |
| 19 | Manta | Safe opening section contains fabric/wing and face movement; clipped tail sweep is excluded. |
| 20 | Tess | Woven hand/eye acting; the small face is more subtle inside the elaborate knot silhouette. |
| 21 | Pollen | Joyful eyes, raised paws and wing motion; a strong playful felt option. |
| 22 | Quill | Open-arm greeting and blink; ceramic face reads well against the leaf-quill crown. |
| 23 | Fenn | Head dip, blink and small hoof movement; elegant narrow legs remain fully framed. |
| 24 | Noodle | Paw wave and a broad smile; curled tail and cloth details remain coherent. |
| 25 | Moss | Clear paw wave, closed-eye smile and head tilt; soft green/ivory material fits the existing film palette. |

Moss25 and Nori05 were rendered first and visually accepted by the controller before the batch.
The controller accepted each numbered group as its encoded sheets became available. Telegram
receipts and final delivery are recorded in the controller’s separate final delivery note, linked
from `demo-video/docs/STATE.md`, rather than inferred here.

## Local gallery walk

`index.html` was inspected at 1440-pixel desktop and 390-pixel phone widths. The gallery showed
25 cards, the translucent filter showed exactly two, a saved selection appeared in the shortlist,
and Moss's local preview loaded at 1280×720 with the expected duration. No page errors or phone
horizontal overflow were observed. The final quick-look loaded at exactly75seconds and1280×720,
and all200linked per-character artwork/media files existed. The quick-look’s25decoded intro
frames were inspected for correct order, complete framing and readable names. Screenshots and the recorded observations are in
`evidence/gallery-*.png` and `evidence/gallery-checks.json`.

The shortlist is saved only in the current browser; it is not a final mascot selection or a
message to another service. All original artwork, provider metadata and costs remain in this
package. No private footage or company media was used for this work.


## Final encoded media results

All52exports passed full decode: 25auditions in two resolutions and the quick-look in two
resolutions. Each audition is699video frames/23.3seconds. The quick-look is2250frames/75seconds.
The720p auditions range from4.13–4.66MB and their1080p masters from7.49–8.49MB (decimalMB).
The quick-look is5,280,184bytes at720p and10,205,045bytes at1080p. Every decoded frame in
all23generated alpha sprites has nonzero character coverage. The original approved master’s
SHA256 remains `7756283021b7237605337f079e435babb25143c2fb1d9023e6b70204a952b039`.

Round cost remains **$6.826079**; project total **$48.906079**. Rendering, gallery, compositing
and verification added no paid generation. No private input was read or uploaded by the renderer.
