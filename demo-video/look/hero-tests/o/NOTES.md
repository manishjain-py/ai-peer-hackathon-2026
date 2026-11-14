# Route O: Gemini Omni 1.2 Flash, first frame and last frame

Endpoint `google/gemini-omni-flash/v1.2/image-to-video`, first frame F1, last frame F3, 10 s.
$0.0273 per second at 360p, $0.0819 at 720p. Three calls, $1.66.

- **Best take: `o-take1-720p.mp4`** (request `requests/o-take1-720p.json`; $0.84; made in 60 s).
  The most graceful separation of the three routes: from 1.0 s a faint see-through shape lifts out
  of the sleeper, its mint outline forms by 2 s, it is solid by about 3 s, sits on the edge of the
  bed, stands at about 6 s and lands exactly on F3. The sleeper and the camera never move.
- `o-draft1.mp4` (request `requests/o-draft1.json`; $0.29; made in 29 s): the same prompt at 360p.
  The draft already showed the whole beat, so the first prompt went straight to 720p.
- `o-edit1-360p.mp4` (request `requests/o-edit1-360p.json`; $0.54; made in 118 s): the optional
  try of the `edit` endpoint on the clean sleeper clip. It does add a truly see-through figure
  that rises and stands, and it leaves the room alone. But the figure is a faceless outline, the
  flat transparent ghost the brief rules out, and it does not look like the employee. It also cost
  more than its page price suggests: 19.8 billed units for a 12.25 s clip, because the input
  video is billed as tokens.

Defects seen in the best take: during the rise the double is in profile and in shadow, so its
face cannot be told as the employee's until it turns (only the last frame pins the face). He sits
on the bed edge for about 2.5 s before he stands. The whole-picture change peaks at 4.5, 6.5 and
7.5 s, exactly on half seconds: possibly small regular pops, or only his own movement; I could
not watch it in motion.
