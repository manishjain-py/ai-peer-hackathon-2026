# The film, in code

The two-minute AI Peer demo video ("He's asleep. I'm not.", `../docs/STORY.md`), built as one
web page whose picture is a pure function of the film time, captured frame by frame.

## Render it

Needs Node 22 or newer, ffmpeg, Chrome, and the repo's LFS files (`git lfs pull`). The first
run downloads the pinned renderer (`hyperframes@0.9.45`, Apache-2.0) through `npx`.

```bash
node demo-video/film/render.mjs                  # the whole film -> renders/film-slates.mp4
node demo-video/film/render.mjs --part reveal    # one part: hook, reveal, proof, morning, close
node demo-video/film/render.mjs --from 30 --to 40
node demo-video/film/render.mjs --private        # with the product recordings (see below)
```

Options: `--name NAME`, `--quality draft|looks|delivery`, `--workers N`, `--no-check`.
The whole film (3,600 frames, 1920x1080, 30 fps) takes about a minute on this Mac.

## How it fits together

| File | What it is |
|---|---|
| `shots.json` | Every slot: id, part, start, length, what it shows, the clip or `null`. A slot with no clip shows a labelled slate, so the film always plays. Also where each spoken line starts. |
| `audio/script.json` | The spoken script and the voices. |
| `audio/narration.json`, `audio/lines/` | Made by `tools/voice.py`: one WAV per line with word timings. |
| `audio/mix.json` | The music bed and the sound effects, and where they sit. |
| `product.json` | How each product recording is cut: which seconds, where the zoom goes, the labels. |
| `build.mjs` | Checks that the timeline holds (parts and slots tile, no two lines touch) and writes a self-contained project folder. |
| `render.mjs` | Build, check the page, capture the picture, mix the sound, join, measure. |
| `src/film.js` | The page: one scene per slot, overlays, captions. `src/scenes/`, `src/overlays/`. |
| `tools/mix.mjs` | The sound mix by ffmpeg: voice, scene sound, music pushed down under speech, effects, -14 LUFS. |
| `tools/stt_check.py` | Speech-to-text on this Mac: the ear no session has. |

Rules of the page: nothing keeps state between frames, uses a timer or reads the clock. The
renderer seeks each frame on its own (`hf-seek`), often out of order.

## The private render (DESIGN C8)

Product recordings never enter git. `--private` builds under
`~/.ai-peer/demo-video-private/` (the project copy, the frame cache, the temp folder, the
sound work, the render), and the public build refuses to read a recording. Speech-to-text runs
on this Mac, so a private mix can be checked without leaving it.

## Checks

- `render.mjs` stops if the page throws or a file fails to load. This matters: the renderer
  itself exits 0 on a dead page (seen in the trial: a missing file gave a full-length render
  of nothing).
- It then probes the file (length, size, frame rate) and measures loudness.
- `uv run --quiet demo-video/film/tools/stt_check.py lines` checks each spoken line;
  `... film TRACK.wav` checks a whole mix against the script.
