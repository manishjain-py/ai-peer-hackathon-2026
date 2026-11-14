# WP1 report: the look, and the clone shot three ways

ai-peer-video-wp1, 2026-11-14 11:47 UTC. Spent **$6.60 of the $15 cap** (21 calls, every one in
`demo-video/ledger/wp1.csv`). Nothing was refused by a tool and no call failed.

**Watch this first:** `demo-video/look/hero-tests/hero-compare.mp4` (12 s, 1080p, the three best
takes side by side). I judged every clip from still frames 0.2 to 0.5 s apart and from
measurements. I cannot watch motion or hear sound, so Manish's eyes are the real test.

## The short answer

1. **Use route O (Gemini Omni 1.2 Flash, first and last frame) for the moment the clone rises.**
   It gave the most graceful rise, costs half of Kling and comes back in a minute.
2. **Use route K (Kling 4.0, key frames) when one take must pass through several poses**, for
   example stand, walk to the desk, sit and open the laptop.
3. **Do not use route P (two plates and code) as the hero look.** Keep its code as a finishing
   tool: it can add or strengthen the mint glow on any clip, for nothing.
4. **The stills steer everything.** Both video models followed the stills closely. A still costs
   7 cents, so the look should be settled there before any more video is made.

Would it pass in a premium advert? The pictures of the three people and the four room frames:
yes. The best takes of O and K: close, from what frames can show. Route P: no. And plainly: the
double today is "a man with a glowing outline and sparkles". It is good, but people have seen it
before. If Manish wants "next level", the place to push is the look of the double in stills F2 to
F4.

## What was made

| What | Where |
|---|---|
| Three possible employees, one labelled sheet | `demo-video/look/characters/characters.jpg` (the six pictures beside it) |
| Four frames of the night room, one labelled sheet | `demo-video/look/frames/frames.jpg`; the frames are `f1.png` to `f4.png` |
| Route K, two takes | `demo-video/look/hero-tests/k/` (best: `k-take2.mp4`; notes in `NOTES.md`) |
| Route O, three clips | `demo-video/look/hero-tests/o/` (best: `o-take1-720p.mp4`; notes in `NOTES.md`) |
| Route P, plates and composite | `demo-video/look/hero-tests/p/` (best: `p-composite.mp4`; notes in `NOTES.md`) |
| The side-by-side film | `demo-video/look/hero-tests/hero-compare.mp4` (built from `hero-compare.json`) |
| The tools | `demo-video/tools/` (start with `README.md`) |
| The ledger | `demo-video/ledger/wp1.csv` |

Every request file is beside its output in a `requests/` folder, so any take can be made again.

## The pictures

- **The three people** (`google/nano-banana-2.1` at 2K, about 6.5 cents a picture, 20 to 30 s
  each). Real-looking, the same light, plain dark T-shirt. I checked the skin tones: A and B
  medium brown, C deep brown, none lightened. The full-body pictures were made from the portraits,
  so each person matches their own portrait.
- **The room frames.** F2, F3 and F4 are edits of F1. Measured against F1 the whole-picture shift
  is 0 pixels in all three, and the picture changes only where the double is.
- **One real defect, found and fixed.** In the first try the three doubles were three different,
  lighter-skinned men: the model had invented a face for "a man made of light". The second try
  gave the model the employee's portrait and full-body picture and said that his skin and clothes
  keep their own colours and only the rim of light is mint. All three doubles are now clearly
  employee A. The first tries are kept as `f2-try1.png` to `f4-try1.png`.
- Also rejected: the first F1 candidate (`f1-try1-1.png`) showed the laptop already open.

## The clone shot, route by route

| | K: Kling 4.0, key frames | O: Gemini Omni, first and last frame | P: two plates and code |
|---|---|---|---|
| Best take | `k/k-take2.mp4` | `o/o-take1-720p.mp4` | `p/p-composite.mp4` |
| Cost of that take | $1.57 (10 s, 720p) | $0.84 (10 s, 720p) | $0.67 (two 12 s plates, 768p) |
| Time to make | 3 to 5 minutes | 1 minute | under 1 minute for the plates, then a few minutes of code (the composite takes about 75 s) |
| Spent on the route | $3.14 (2 takes) | $1.66 (3 clips) | $0.71, plus 7 cents for one extra still |
| Camera stayed locked | yes, 0 px drift | yes, 0 px drift | yes, 0 px drift in both plates |
| Sleeper stayed still, bodies never merged | yes | yes | yes, by construction |
| The double is the employee | yes at every key frame | yes at the end; not provable mid-rise | yes, it is the same man |

**K, Kling 4.0.** Take 1 does the whole action in 10 s (rise, stand, walk, sit, laptop) and hits
every key frame, but it is rushed: the double pops in within about 0.4 s and he sits and opens
the laptop in one move. Take 2 asks only for the rise, with a prompt that says "very slowly and
gradually": the double now lifts out see-through over about 1.5 s. That fixed the pop. Still there:
the seated double looks into the camera and smiles for about 1.5 s. That is my still F2, not
Kling: change F2 to change it. In take 1 the leg swing looks a little awkward (one foot high in
the air).

**O, Gemini Omni 1.2 Flash.** The best rise of the three: a faint see-through shape lifts out of
the sleeper, its mint outline forms, it turns solid, sits on the edge of the bed, stands and
lands exactly on F3. The first prompt worked at 360p, so it went straight to 720p. Weak points:
during the rise the double is in profile and in shadow, so the face cannot be told as the
employee's until it turns; he sits on the bed edge for about 2.5 s before he stands; and the
picture changes a little more than usual at 4.5, 6.5 and 7.5 s, exactly on half seconds, which
may be small regular pops or only his own movement. The optional try of Omni's edit mode on a clean clip of the sleeper
(`o/o-edit1-360p.mp4`) did add a truly see-through figure, but a faceless outline ghost: the look
the brief rules out. It also cost $0.54, not the $0.35 its listed price suggests.

**P, two plates and code.** The cheap plates are very good: the man gets up, walks, sits and
opens the laptop in one natural take for 34 cents, with a locked camera. The code then lays him
over the sleeper plate as a see-through, glowing double, and from the desk on lets him move the
real chair and open the real laptop. Its strengths are certain: the same man, bodies that cannot
merge, a sleeper that cannot change, everything tunable for nothing. But the glow is an even halo
and reads as an effect laid on top, and in the plate the man stands large and dark in front of
the bed, so he had to be brightened by code. K and O look more natural because the model lights
the double and the room together. The first matte (plain difference) also grabbed his shadow and
the chair; a free person detector on this Mac fixed that.

**Flicker and hands.** A patch of plain wall changes by under 0.1 of 255 from frame to frame in
every clip: no flicker in the background. Hands looked normal at the sizes I checked (a wide
shot); I did not check them in close-up.

## Advice for the film

1. Rise and stand: route O, drafted at 360p (29 cents), finished at 1080p (about $1.23 for 10 s).
2. Walk to the desk and sit: a second clip from F3 to F4, on O first (cheap), on K if O drifts.
   One long take is not needed: the film will cut anyway.
3. Fix the stills first. Remake F2 so the double does not look into the camera, and decide with
   Manish how far the look of the double should go beyond outline and sparkles.
4. Always give the model the employee's portrait and full-body picture, and say that skin and
   clothes keep their own colours. Without that the double becomes another man.
5. Keep route P's parts: cheap locked plates for backgrounds (`minimax/h3-max-turbo`, 34 cents for
   12 s), the free person matte, and the glow code, to add the mint signature to shots by code.
6. Skip Omni's edit mode for this shot.

## Money

| Bucket | Planned | Spent |
|---|---|---|
| Stills (14 calls, 15 pictures) | up to $3 | $1.08 |
| Route K | up to $4 | $3.14 |
| Route O | up to $4 | $1.66 |
| Route P | up to $3 | $0.71 |
| **Total** | **$15** | **$6.60** |

Prices learned today, for planning:

- A 2K picture on `google/nano-banana-2.1` costs 6 to 8.5 cents (more with extra input pictures).
- fal.ai reports what it billed on every result; the tool logs that. The two plates are logged
  at $0.3556 each though fal.ai billed $0.336 each: the tool keeps the higher figure when a
  per-second price was expected, so the ledger is 4 cents above the real bill.
- Omni's edit mode bills the input video too: about 1.6 times its listed rate for a 12 s clip.
- `minimax/h3-max-turbo` at 768P goes from $0.028 to $0.04 per second on 16 November.
- This key cannot read the fal.ai balance or usage, so the balance is still unknown.

## Routine calls I took (undo: tell the controller)

1. All stills on `google/nano-banana-2.1` at 2K. fal.ai's own guide uses it for invented people
   and same-camera edits, and the first picture was advert quality, so no other model was tried.
2. F1 is the second candidate (closed laptop, more room above the bed).
3. Kling take 2 covers only the rise (F1, F2, F3) with a slow-rise prompt, instead of repeating
   the whole action: it tests the weak point of take 1 and compares directly with route O.
4. Route P's second plate starts from an extra still, F1b (the man on top of the made bed), so
   no bedding moves when he gets up. Cost: 7 cents.
5. Route P's matte comes from a free person detector on this Mac (Ultralytics YOLO, AGPL licence:
   fine for making the film here, not for shipping inside the product), not from the paid matte
   endpoint ($1.23). Claude's own abilities first.
6. The side-by-side film is a 2 by 2 grid (three takes and a legend), so each take is 960 by 540
   and not a thin strip. K and O hold their last frame after 10 s.
7. Tools added beyond the contract: `sheet.py`, `align_check.py`, `vgrid.sh`, `person_matte.py`,
   `double_composite.py`, `compare_film.py`, and the Manrope font (open licence) for labels.
8. A message from another session said the controller had changed. I checked `STATE.md` on `main`
   (it names ai-peer-video-controller-2) before reporting there.

## Not done, not checked

- No clip was watched in motion or heard. Sound from Kling and Omni was not judged.
- The walk to the desk was made only by K take 1 and by route P, not by route O.
- Nothing was rendered at 1080p; the side-by-side film scales 720p and 768p takes up.
- Employees B and C have portraits and full-body pictures only (Manish picked A).
