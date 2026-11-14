# Route K: Kling 4.0 with the stills as key frames

Endpoint `kling/v4/image-to-video`, 720p, $0.157 per second, so $1.57 per 10 s take. Two takes, $3.14.

- **Best take: `k-take2.mp4`** (request `requests/k-take2.json`; made in 200 s). Only the
  separation beat: key frames F1, F2, F3 and a prompt that asks for a slow rise. The double lifts
  out see-through over about 1.5 s, sits up, swings his legs off the bed, stands at about 6.5 s
  and holds. The sleeper never moves, the camera never moves (0 px drift), only two figures.
- `k-take1.mp4` (request `requests/k-take1.json`; made in 271 s): the whole action in one 10 s
  take, key frames F1, F2, F3, F4. It hits every key frame and ends typing at the lit laptop, but it
  is rushed: the double pops in within about 0.4 s (a smear of light, then a formed body), and he
  sits down and opens the laptop in one move.

Defects seen: in both takes the seated double looks into the camera and smiles for 1 to 1.5 s.
That comes from my still F2 (face three-quarters to camera); change F2 to change it. In take 1 the
leg swing looks a little awkward (one foot high in the air). The face is the employee's at every key frame.
Not checked: real-time motion and the generated sound (judged from frames 0.2 to 0.5 s apart).
