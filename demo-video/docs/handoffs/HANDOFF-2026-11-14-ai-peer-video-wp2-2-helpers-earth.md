# Helpers' reports, part 2: the Earth close (for ai-peer-video-wp2-3)

Written by ai-peer-video-wp2 on 2026-11-14 13:45 UTC. Dated, never edited. The Earth helper was
stopped on the controller's word (usage is short) after its last proven version. Part 1 (music)
is `HANDOFF-2026-11-14-ai-peer-video-wp2-2-helpers.md`.

## Where it is

Worktree `/Users/manishjain/repos/ai-peer-video-wp2`, under `demo-video/film/`:

| Path | State |
|---|---|
| `src/scenes/earth.js` | The helper's **final** version (1,912 lines). **Modified, not committed.** Every development switch is off (line 18: `DEV = { show: "", top: false, debug: false }`). |
| `src/scenes/earth-draft1.js` | The older snapshot that Draft 1 used. |
| `assets/earth/` | Four NASA JPEGs (2.5 MB together) and `SOURCE.md`. **`SOURCE.md` is not in git yet.** |
| `.build/lanes/earth/renders/earth-final.mp4` | The final version rendered: 12.0 s, 360 frames, 1920x1080, 149 MB. Git-ignored. |
| `.build/lanes/earth/frames/q1/sheetA.png`, `sheetB.png` | Twelve frames each, 108.0 to 112.0 and 112.7 to 119.9. |

**The film still draws the old snapshot.** `shots.json` pins slot `close-earth` to
`"scene_file": "src/scenes/earth-draft1.js"`. To switch the final on: remove `"scene_file"`
from that slot, delete `earth-draft1.js`, render `--part close`, look at the frames, then
commit `earth.js` and `assets/earth/SOURCE.md`. (`"earth"` is already in `scenes_ready`.)

## What the shot shows (film seconds; the helper's words, checked by me on the two sheets)

- 108.0 to 108.4: one warm window in a dark wall, seen a little from above: curtains, a lamp,
  a desk with a laptop. It reads as a window at once and does not look like a cartoon.
- 108.4 to 109.1: the facade with his the only lit window, his building from above, the
  street grid as lines of lamps.
- 109.1 to 110.5: a carpet of warm lamp points shrinking to the city's real outline, South
  India, India, then the whole globe.
- 110.5 to 112.4: the night side, dim warm city lights, a thin dawn edge, faint stars, slow drift.
- 112.4 to 114.4: mint lights spread from his city across India, the Gulf, China, Europe,
  under "Now someone's still there."
- 114.4 to 120.0: the camera falls toward the planet; a horizon arc with mint lights sits
  across the lower third and the end card reads cleanly above it.

Checked by me: the files, the pin, the switches, the final render's length and size, and both
sheets by eye. Not checked by anyone: flicker between neighbouring frames at full size, banding
after the delivery encode, and the last end-framing in motion.

## A choice to know about

The pull-out starts in **Bengaluru**: the city cut-out and the first mint light are there. The
film's employee is invented and his city was never fixed. If he should live elsewhere, the city
tile (`lights_city_500m.jpg`) and the start point change.

## The textures and the credit

All from `https://assets.science.nasa.gov/content/dam/science/esd/eo/images/` (Black Marble 2016
grey maps, and Blue Marble Next Generation, August), fetched 2026-11-14, resized or cut only;
`SOURCE.md` lists each file with its URL. NASA's words, from
https://www.nasa.gov/nasa-brand-center/images-and-media/ : its images "generally are not
subject to copyright in the United States", "NASA should be acknowledged as the source of the
material", and commercial use "must not explicitly or implicitly convey NASA's endorsement".
So **the film needs a credit line** (for example "Earth imagery: NASA Earth Observatory");
`SOURCE.md` suggests the wording. It is not on screen yet.

## What is weak, in the order to fix it

1. **Render time.** 0.2 to 0.5 s a frame (measured on a busy Mac), about 8 s to start each
   page; the 12 seconds took 63 s with five workers. The brief asked for under 0.1 s. Measure on
   a quiet Mac, then cut the motion-blur samples and the first bloom step.
2. **Grain makes the file huge:** 149 MB for 12 s. Halve the grain in the scene's last shader
   (`FS_FINAL`). The film-wide grain layer I added (`#grain` in `src/film.css`, opacity 0.055)
   does the same to the whole film: lower it too, then check dark gradients for banding at
   delivery quality.
3. **108.7 to 108.9, the blocks from above, look like plain boxes.** Darken the neighbours, add
   roof detail and a few lit windows. This is the weakest picture of the shot.
4. The lit room is simple: flat walls, box furniture, no glass reflection.
5. Near 109.1 a faint rounded square shows where the street grid hands over to the lamp carpet.
6. The mint glow is crisp rather than glowing and the wave has no visible front edge: raise the
   bloom in the globe phase or enlarge the mint points.
7. Stars are faint and smear into dashes while the camera falls.

Money: none. The helper made no paid call.
