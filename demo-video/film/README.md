# The film, in code

The two-minute AI Peer demo video ("He's asleep. I'm not.", `../docs/STORY.md`), built as one
web page whose picture is a pure function of the film time, captured frame by frame.

## Latest delivered movie

[Moss v7 in 4K](renders/blended-moss-v7.mp4) and its [1080p Telegram edition](renders/blended-moss-v7-1080p.mp4) run **119.600 seconds** at 30 fps. Moss slides into Ask, picks messages directly out of the company stream and guides Ram to his morning decision. See the [release record](../docs/MOSS-V7-DELIVERY-2026-11-17.md) and [source guide](../moss-choreography/README.md).

## Base/Draft 3 renderer

The commands and 3,600-frame description below refer to the retained base film, not the
latest Moss cut. `--cut NAME` selects a version under `cuts/`; for Moss use its dedicated
guide above. The original no-argument output name `film-slates.mp4` is retained for compatibility;
public Draft 3 builds now draw the made-up product screens described below.

Needs Node 22 or newer, ffmpeg, Chrome, and the repo's LFS files (`git lfs pull`). The first
run downloads the pinned renderer (`hyperframes@0.9.45`, Apache-2.0) through `npx`.

```bash
node demo-video/film/render.mjs                  # the whole film -> renders/film-slates.mp4
node demo-video/film/render.mjs --part reveal    # one part: hook, reveal, proof, morning, close
node demo-video/film/render.mjs --from 30 --to 40
node demo-video/film/render.mjs --private        # with the product recordings (see below)
```

Options: `--cut NAME`, `--name NAME`, `--quality draft|looks|delivery`, `--crf N`, `--workers N`, `--no-check`,
`--no-sound`, `--lane NAME` (a run with its own folders under `.build/lanes/`, beside other
renders), `--with a,b` (use a scene or overlay that `shots.json` does not list as ready yet).
The whole film (3,600 frames, 1920x1080, 30 fps) takes about two minutes on this Mac.

`--quality delivery` packs the result once more (`--crf`, default 22: about 60 to 80 MB for
the film; at 18 the film grain is kept and the file is close to 1 GB). The renderer's own file is close to lossless and, with the film grain, about 1.5 GB
for the two minutes: it stays in the work folder as the master.

Before a draft render, bring WP3's newest clips in: `node demo-video/film/tools/pull_shots.mjs`.

## How it fits together

| File | What it is |
|---|---|
| `shots.json` | Every slot: id, part, start, length, what it shows, the clip or `null`. A slot with no clip shows a labelled slate, so the film always plays. Also where each spoken line starts. |
| `audio/script.json` | The spoken script and the voices. |
| `audio/narration.json`, `audio/lines/` | Made by `tools/voice.py`: one WAV per line with word timings. |
| `audio/mix.json` | The music bed and the sound effects, and where they sit. |
| `product.json` | How each product recording is cut: which seconds, where the zoom goes, the labels. |
| `screens.json`, `src/scenes/screens.js`, `src/screens.css` | Draft 3 (V19): the four product screens of the public film drawn by code with made-up data (a Zoom meeting, Slack, one change from across the company, the morning brief on Ram's phone). A public build draws them in place of the slates; a private build still uses `product.json` and the recordings. The Peer's face on them is one file, `assets/screens/peer-face.png`. Lines said inside a screen carry `"caption": "screen"` in `audio/script.json`: the screen captions them, and the mix gives them a light call sound. |
| `build.mjs` | Checks that the timeline holds (parts and slots tile, no two lines touch) and writes a self-contained project folder. |
| `render.mjs` | Build, check the page, capture the picture, mix the sound, join, measure. |
| `src/film.js` | The page: one scene per slot, overlays, captions. `src/scenes/`, `src/overlays/`. |
| `src/scenes/pushin.js` | The push-in: from the last frame of the shot before it, through the laptop's screen, into the product's window. On the public film the laptop already shows the Zoom screen drawn by code (`screens.js`, `windowContent`): it comes up through the screen's light as the screen turns, and the push lands on it lit. Needs the screen's four corners: WP3's `screen_quad`, or `hand_quads` in `shots.json`. |
| `src/overlays/tag.js` | The "AI Peer" tag on the double's chest. It follows WP3's `tag_track`, or a track made here. |
| `tools/tag_track.py` | Makes that track from a few hand-set keys in `shots.json` (`tag_keys`) by following the chest light, into `assets/tags/`. Run it again when the keys or the clip change. |
| `tools/pull_shots.mjs` | Copies WP3's current clips (and tag tracks, stills, screen corners) from its manifest. |
| `tools/mix.mjs` | The sound mix by ffmpeg: voice, scene sound, music pushed down under speech, effects, -14 LUFS. |
| `tools/stt_check.py` | Speech-to-text on this Mac: the ear no session has. |

Small switches in `shots.json`, per slot: `dissolve_in` (seconds: this shot fades in over the
tail of the one before, which plays on under it), `tag_keys.show` (when the tag is on screen;
`force` shows it where the track calls the chest out of view), `hand_quads` (screen corners by
hand for one clip), `scene_file` (draw a code scene with another file, to pin a render to a
snapshot). For cutting AI shots: `in_s` (where in the clip the slot starts, in place of WP3's
`use_from_s`), `rate` (how fast the clip plays), `from_shot` (play a stretch of another slot's
clip, with WP3's track, stills and screen corners), `pingpong` (`[from, to]` seconds of the clip,
played back and forth from `in_s` for as long as the slot lasts, as a clip the build makes into
`.build/cache/clips/`), `camera` (`{"to_scale": 1.3}`: the shot moves in, on the line of the
push-in that follows, which carries on from there at the same speed; `src/camera.js`).

Rules of the page: nothing keeps state between frames, uses a timer or reads the clock. The
renderer seeks each frame on its own (`hf-seek`), often out of order.

## The private render (DESIGN C8)

Product recordings never enter git. `--private` builds under
`~/.ai-peer/demo-video-private/` (the project copy, the frame cache, the temp folder, the
sound work, the render), and the public build refuses to read a recording. Speech-to-text runs
on this Mac, so a private mix can be checked without leaving it.

**The network guard.** A private render runs the renderer and its browser inside a macOS
sandbox (`sandbox-exec`) that refuses every connection except to this Mac itself. `render.mjs`
proves the guard before each private render and stops if it does not hold;
`node demo-video/film/render.mjs --prove-guard` runs the proof alone. Behind the guard `npx`
works from its cache only (so render the public film once first on a new Mac), and Chrome runs
without its own inner sandbox, which cannot start inside another one. Never use
`hyperframes snapshot --describe`: it sends frames to an outside model.

A tag set by hand and a push-in's screen corners belong to one clip file. When WP3 delivers a
new clip without a track or corners, the build says so in a note and leaves the tag off (or
the push-in a slate) instead of drawing them in the wrong place.

## Checks

- `render.mjs` stops if the page throws or a file fails to load. This matters: the renderer
  itself exits 0 on a dead page (seen in the trial: a missing file gave a full-length render
  of nothing).
- It then probes the file (length, size, frame rate) and measures loudness.
- `uv run --quiet demo-video/film/tools/stt_check.py lines` checks each spoken line;
  `... film TRACK.wav` checks a whole mix against the script.
