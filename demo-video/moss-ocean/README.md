# Moss v5: the information ocean and simultaneous note-taking

V39 restores the base film’s deep company-information space at 90–100 seconds. The original
world renderer supplies the seeded rivers of email, Slack, code, tickets, documents, meetings
and web updates. Moss makes sense of them; three foreground cards explicitly match Ram’s
role, goal and interests, then settle into his morning brief. All data is invented.

The setup uses a selective time map: source connection and reading steps stay in order,
while the notebook-to-summary camera travel is shorter. The source/confidence proof remains.
Zoom moves to 59.2 seconds and retains its entire 22.8-second dialogue. Slack lasts eight
seconds, with tagging, reading, checking, typing and a readable final reply. Morning stays at
100, the globe at 111 and the end card at 115.7. Total is 119.600 seconds / 3,588 frames.
The V4 introduction and laptop-only morning composition are retained.

Moss holds the notebook throughout its final Zoom reply. A new audio-driven take shows real
mouth shapes and pencil/paw strokes together during “I’ll put it in his morning brief” and
the rest of that sentence (about 79.1–81.8 seconds). It uses the existing generic notebook
reference and original invented m4b voice. The larger 250-pixel actor keeps the notebook
above the call captions. The take, request, result, alpha conversion and $0.20 cost are saved.

Controller owns the new Matilda narration and music edit, described in `audio/README.md`.
The same Lyria composition has bar-aligned joins and distinct ocean/focus cues, with the V4
introduction and resolved ending retained exactly in mixed PCM. New voice $0.0123; motion
$0.20; total new $0.2123, project $51.610827 of $100. No private inputs were used.

## Offline rebuild

Saved-asset rendering requires no provider credential or private source. Use Node, Google
Chrome, Playwright, ffmpeg/ffprobe, Python and uv/Pillow. `CODEX_NODE_MODULES` can override
the renderer’s Codex runtime dependency location.

```sh
node demo-video/moss-ocean/audio/build_mix.mjs
node demo-video/moss-ocean/render.mjs --probe
node demo-video/moss-ocean/render.mjs --full
python3 demo-video/moss-ocean/tools/verify.py
python3 demo-video/moss-ocean/tools/encoded_proof.py
```

`--times=79.1,80.3,94.6,96.2,99.5 --label=detail` creates a focused source proof.
`--range=77.65,100` renders a short review clip. Captures await every visible video seek
and two animation frames, with software compositing to avoid stale actor surfaces.
`shots.json` carries the setup’s `source_warp`; this package’s renderer applies it when
seeking the saved clean walkthrough. The original source clips and earlier cuts stay intact.

Cut: `../film/cuts/blended-moss-v5/`. Outputs: `../film/renders/blended-moss-v5.mp4` and
`blended-moss-v5-720p.mp4`. Source acceptance is recorded in `MANUAL-REVIEW.md`; final
encoded acceptance, delivery and merge status are recorded in shared controller docs.

Both final exports are controller-accepted:119.600s/3588frames,full decode,−14.0LUFS/
−1.7dBTP,matching5608 AAC packets. Accepted final evidence covers102 master scene points,
60 boundaries and39 independent720p frames. `evidence/checks.json` records all prior movie
hashes unchanged and22 retained voice entries. Delivery/merge details belong to the
shared controller delivery record; Tagv2 remains the last explicitly user-approved movie.
