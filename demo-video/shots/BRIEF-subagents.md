# Brief for the helpers of ai-peer-video-wp3 (14 November 2026)

You are a helper (sub-agent) of the session `ai-peer-video-wp3`. Your own task and slots are in
the message that started you. This file is the shared part: read it fully first.

## The job in one paragraph

We are making a 2-minute demo film for "AI Peer" (a personal AI teammate that covers for an
employee while he sleeps, always labelled as AI). Nine short AI-generated shots with invented
people go into the film. A cheap moving draft of all nine exists. Now each shot gets its
**final**: a take that would pass in a premium advert. The film's owner, Manish, has taste for
"polished advertising quality" and rejects anything cartoonish, fake or childish.

## Where things are (work only here)

- The worktree: `/Users/manishjain/repos/ai-peer-video-wp3` (branch `video-wp3-ai-shots`).
  **Write only inside it**, and only in the folders named for you. Use absolute paths in every
  command (your shell starts elsewhere, in a shared checkout: write nothing there).
- The slots, their lengths and rules: `demo-video/docs/SHOTS.md` (read it).
- Live fal.ai prices and model facts: `demo-video/research/fal-facts-2026-11-14.md` (read it).
- The stills, one per slot: `demo-video/shots/stills/` (sheet: `stills.jpg`). Request files
  with the prompts that made them: `demo-video/shots/stills/requests/`.
- The drafts: `demo-video/shots/<slot>/<slot>-draft-v1.mp4`, the raw model output beside it
  (`<slot>-raw-d1*.mp4`) and the request that made it in `<slot>/requests/`.
- The employee ("employee A", an invented man): `demo-video/look/characters/a-portrait.jpg`
  and `a-full.jpg`. Give both to every still call that shows him.
- Tools: `demo-video/tools/README.md`. Scratch files: a folder of your own under
  `/private/tmp/claude-501/-Users-manishjain-repos-ai-peer-hackathon-2026/1c97ea6b-c294-42be-ae5e-8c9d772564bf/scratchpad/<your name>/`
  (make it), never `/tmp`.

## Money (hard rules)

- Every paid call goes through `demo-video/tools/gen-wp3.sh <request.json>` (it logs the cost
  in `demo-video/ledger/wp3.csv` and refuses past the cap). Never call fal.ai any other way and
  never use any other key or service. `--dry-run` shows the cost first. Never print `FAL_KEY`.
- Your budget is in your task message. Stop at it, keep your best take, and say so.
- Before a call on an endpoint that is new to you, read its inputs and price by resolution:
  `curl -s https://fal.ai/models/<endpoint id>/llms.txt` (free, no key). **Always set
  `resolution`** (defaults are often the dear tier).
- A request file: copy one from a `requests/` folder. `expect.units x expect.unit_price` must
  equal `expect.cost_usd`. For MiniMax H3 Max Turbo the units are exactly the seconds asked.
  Local inputs are written `"file:<path from the repo root>"`.
- Several calls at once are fine: `LOGDIR=<your scratch>/logs PAR=4 demo-video/tools/gen-wp3-batch.sh a.json b.json`.

## What was learned today (use it)

- Stills: `google/nano-banana-2.1` (new picture) and `google/nano-banana-2.1/edit` (edit, or a
  new angle from reference pictures), 2K, 16:9, about 8 cents, 30 to 50 s. For an edit, name
  only the change and end with "Keep everything else in the picture exactly the same."
- Video, cheapest good route: `minimax/h3-max-turbo/image-to-video` (first frame, optional
  last frame, `target_audio_url` to pin a sound file): $0.028 a second at 768P and $0.056 at
  1080P until 15 November; 15 to 20 s to make. It made every draft. It follows a prompt that
  lists the actions in order.
- `google/gemini-omni-flash/v1.2/image-to-video` (first and last frame): 360p $0.0273, 720p
  $0.0819, 1080p $0.1229 a second. `kling/v4/image-to-video` (key frames): 720p $0.157, 1080p
  $0.235 a second. Neither takes a seed.
- Upscale a 720p or 768P winner to 1080p: `openimaginglab/flashvsr-plus` (about $0.25 for
  10 s) or `google/gemini-omni-flash/v1.2/upscale`. Read the endpoint's page first.
- Models add people and things that were never asked for (a shoulder walked into the hook-1
  draft because the prompt named "a colleague"). Say "He is the only person in the picture"
  where true, and never name a person who should stay out of the frame.
- Every model returns its own sound. A slot whose sound is "none" is delivered without sound.

## The rules for every final

- Delivered file: `demo-video/shots/<slot>/<slot>-final-v<N>.mp4`, made with
  `demo-video/tools/deliver.sh RAW.mp4 OUT.mp4` (H.264, 1920x1080, yuv420p, the model's frame
  rate; it scales to cover and crops, never stretches). Keep the raw model output beside it
  as `<slot>-raw-f<N>.mp4`, and every request file in `<slot>/requests/`.
- Length: at least the "Deliver" length of the slot in `SHOTS.md`.
- No readable text anywhere in the picture; no brand marks; screens face away or are a plain
  glow. No real person's name or photo and no company name in any prompt or upload. Nothing
  from `~/.ai-peer/` goes to any tool.
- The camera is locked unless your task says otherwise. One continuous shot, no cut inside.
- A final holds up when you step through its frames: the same person from first frame to
  last, faces and hands whole (count fingers on the frames where a hand is large), no flicker,
  no extra or merged bodies, nothing popping in or out.
- **Look at your own output.** Pull frames with ffmpeg and read them as pictures. An image
  costs context, so read grids, not every frame: `demo-video/tools/vgrid.sh CLIP OUT.jpg 4 2 480`
  gives 8 frames in one picture; crop to the face or the hand when you need detail. Judge as
  Manish would: would this pass in a premium advert? If not, say plainly why.
- A take that looks wrong is not a final because the budget is spent: it stays a draft.
- Make the sheet of each final: `demo-video/tools/vgrid.sh <final>.mp4 demo-video/shots/<slot>/<slot>-sheet.jpg 4 2 600`.

## What you must not do

- Do not edit `demo-video/shots/manifest.json`, `demo-video/shots/all-shots.jpg`, the docs, or
  another helper's slot folders. Do not `git add`, commit or push: the parent does that.
- Do not write outside the worktree and your scratch folder. `/Users/manishjain/repos/ai-peer-video-wp2`
  is another session's worktree: read the three sound files named in your task if you need
  them, never write there.
- Never `pkill` by pattern; stop only a process whose PID you started and wrote down.
- Write scripts for bash or Python (the shell is zsh: never name a variable `path`, quote
  globs, no `echo ===`). Keep shell commands plain. A tool that downloads a model (for example
  `person_matte.py`, about 120 MB) must be run with `cd <your scratch folder> && ...` in the
  same command.
- Do not start helpers of your own.

## Your report (your final message, plain words, no files of its own)

Per slot: the delivered file's absolute path; the route (model, resolution, takes made); what
it cost; `use_from_s` you recommend (where the film window should start inside the clip) and,
for a speaking shot, `line_at_s` (where the spoken line starts in the clip) and whether the
mouth is in sync, with the evidence; what is still weak, honestly. Then the total you spent
(sum your rows in the ledger) and anything the parent must decide.
