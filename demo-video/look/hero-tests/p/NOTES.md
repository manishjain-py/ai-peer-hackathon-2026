# Route P: two cheap plates, the double laid in by code

Plates from `minimax/h3-max-turbo/image-to-video`, 12 s at 768P, $0.028 per second: $0.34 each,
made in 14 s and 18 s. The composite is code on this Mac: free, about 75 s.

- **Best take: `p-composite.mp4`**. Rebuild it with `make-composite.sh`.
- `p-plate1.mp4` (request `requests/p-plate1.json`): the sleeper barely moving, from F1.
- `p-plate2.mp4` (request `requests/p-plate2.json`): from the extra still `frames/f1b-try1.png`
  (the same man on top of the made bed, so no bedding moves), he sits up, stands, walks to the
  desk, sits and opens the laptop. One take, and the motion is natural.
- `p-matte.mp4`: the man lifted out of plate 2 by a free person detector on this Mac
  (`tools/person_matte.py`); he was found in all 294 frames.

What the code does (`tools/double_composite.py`): lays the man of plate 2 over plate 1, see-through
at first and more solid later, brightened, with a mint glow, a light spill on the room and a fine
shimmer. From 6.1 s the desk area follows plate 2, so the real chair moves and the real laptop
opens and lights up.

What worked: the double is the same man by construction, the two bodies can never merge, the
sleeper cannot change, and every part can be tuned and re-run for nothing.

Defects seen: the glow is an even halo, so it reads as an effect laid on top; routes K and O look
more natural because the model lights the double and the room together. In plate 2 the man gets
up on the camera side and stands large in front of the bed, a dark back-lit shape that had to be
brightened by code. At the start the lying double sits a little beside the sleeper. The two plates
are not exposed alike (plate 2 is about 1.45 times brighter at the desk; plate 1 drifts darker over
its first 5 s), which the code now matches at the desk. One frame of 294 has stray specks in the
matte. The first try, a plain difference matte, also grabbed his shadow, the chair and the laptop.
