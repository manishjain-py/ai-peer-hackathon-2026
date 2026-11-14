# Brief: ai-peer-video-wp1, 2026-11-14

For Fable 5.2 (`claude-fable-5-2`), max effort. Spawned by ai-peer-video-controller-1. Dated,
never edited; the living state is `demo-video/docs/STATE.md` on `main`.

## Manish's standing instructions

> "First preference is to use Claude native capabilities. If that is not possible to fulfill
> the requirement, then we can use any tools that you think can do that." (2026-11-14, V2)

> "for the budget cap, let's keep $100 for now, and afterwards we will see if we can extend it
> or not." (2026-11-14, V3) This package may spend **at most $15** of it.

> "an AI clone comes out of the employee that looks exactly like the employee and goes and
> attends the meeting" ... "I want the visual to be just absolutely next level" (the brief, B3)

The employee is an invented person, never Manish (V4, his answer "C"). The video is due
Thursday 19 November (V1). His taste, from the September film: "polished advertising quality";
he rejected "the walking/sitting cartoon" as "childish/unprofessional".

You decide routine calls yourself and note them in your report. You stop and report to the
controller only for: money past $15, a fal.ai balance that is empty, or a tool that refuses the
content.

## The job

Prove the look and the hero shot for at most $15: pictures of three possible invented
employees, the key still frames of the night scene, and the "clone rises out of the sleeping
employee" shot made three ways, side by side.

## Read first, in order

1. `demo-video/docs/STATE.md` on `origin/main`.
2. `demo-video/docs/DESIGN.md` section 0 (decisions B1 to B7, V1 to V4, C1 to C7).
3. `demo-video/docs/PRIOR-WORK.md` (his taste, the rules, the identity colours).
4. `demo-video/research/research_notes/AI video toolkit for demo film/video_generation_models.md`:
   only section 3 (the hero effect), section 4 (ids and prices) and section 8 (picks per shot).
   Find them with `command grep -n "^## " <file>`. They are a researcher's claims, not tested.
5. `demo-video/research/fal-catalogue-2026-11-14.md` (fal.ai's own ids and base prices).

Do not read the other research notes or anything under `film/` or `docs/build/`.

## Working copy

- Your session starts in `/Users/manishjain/repos/ai-peer-hackathon-2026` (the shared checkout,
  on `main`). **Write nothing there.** The controller commits docs there.
- Your worktree is `/Users/manishjain/repos/ai-peer-video-wp1`, branch `video-wp1-look-test`,
  made by the controller from `origin/main`, upstream unset. Work only there, by absolute path
  and `git -C /Users/manishjain/repos/ai-peer-video-wp1`. Re-create it with:
  `git -C /Users/manishjain/repos/ai-peer-hackathon-2026 fetch origin` then
  `git -C /Users/manishjain/repos/ai-peer-hackathon-2026 worktree add /Users/manishjain/repos/ai-peer-video-wp1 video-wp1-look-test`.
- It needs: `FAL_KEY` in the shell environment (set in `~/.zshrc`; never print it, never commit
  it); ffmpeg 8, Node 23, Python 3 and `uv` (all installed). `fal-client` is not installed:
  use `uv run --with fal-client` or plain HTTPS.
- Scratch files go in your session's scratchpad, never in `/tmp`.

## The look to aim for (the controller's direction)

- Real-looking and cinematic, like a premium advert. Never a cartoon or a 3D-animation look.
- One colour system for the whole film, from the product's identity: night scenes in deep
  teal-ink (`#152b31`), the human lit warm, the Peer glowing mint (`#b7f4cf`). The mint glow is
  the Peer's signature everywhere.
- The double is the same person in the same clothes, made of light: a mint rim of back-light
  and a fine shimmer; partly see-through at the moment it separates, more solid once it stands.
  Calm, friendly, capable. Never a flat transparent ghost, never scary.
- A locked camera, a wide shot, slow and deliberate motion.
- One room holds the whole action: a bed on the left, a small desk with a closed laptop on the
  right, a window with cool moonlight. So one locked frame can show: asleep, the double rises,
  stands, walks to the desk, sits, opens the laptop.
- No readable text inside any generated picture or clip (labels are added later by code).

## The contract

| # | What to make | Where (in the worktree) | Done when |
|---|---|---|---|
| 1 | A small generation tool: one command runs a fal.ai endpoint from a request file (JSON: endpoint, inputs, the price you expect), waits, downloads the outputs, and appends a row to the ledger. It prints the expected cost before a paid call and refuses a call that would take the ledger past the cap it is given. | `demo-video/tools/` and `demo-video/ledger/wp1.csv` (UTC time from the clock, session, endpoint, units, unit price, cost in USD, request file, output file, note) | One real still was made through it and its ledger row is right. Every request file is committed, so any take can be made again. |
| 2 | **Milestone 1, first and fast:** three invented employees, each as a portrait and a full-body picture in plain sleepwear (a dark T-shirt), same style and light. A: a South Asian man in his early thirties, short dark hair, trimmed beard. B: a South Asian woman in her early thirties, shoulder-length dark hair. C: a Black woman in her early thirties, short natural curls. Skin tones true to each person: check that the model did not lighten them. | `demo-video/look/characters/` with one labelled sheet `characters.jpg` (about 2400 px wide) | The sheet is committed and pushed on your branch, and the controller is told (see "When done", milestone 1). Then go on at once with character A, unless the controller has sent another pick. |
| 3 | Four still frames of the night room with one locked camera, the same room in each: F1 the employee asleep in bed; F2 the mint double half-risen out of the body; F3 the double standing by the bed, looking at the sleeper; F4 the double seated at the desk, laptop open and lighting its face, the sleeper still in bed. Make F2 to F4 by editing F1, so the room and camera stay identical. | `demo-video/look/frames/` with a labelled sheet `frames.jpg` | The four frames match in room, camera and person. |
| 4 | The hero shot three ways, from those stills. **K:** Kling 4.0 (`kling/v4/image-to-video` or `kling/v4/reference-to-video`) with the stills as keyframes, one take of about 10 s at 720p, at most 2 takes. **O:** Gemini Omni 1.2 Flash (`google/gemini-omni-flash/v1.2/image-to-video`, first frame F1 and end frame F3), drafts at 360p, then the best prompt at 720p; one try of its `edit` endpoint on a clean clip of the sleeper is optional. **P:** two plates and code: plate 1 the sleeper barely moving; plate 2 from the same first frame, the person sits up, stands, walks to the desk and sits (a cheap model such as `minimax/h3-max-turbo/image-to-video` or `alibaba/wan-3.0/image-to-video`); then lay the moving figure of plate 2 over plate 1 **by code** (ffmpeg or a small script: a difference or screen blend with a mint tint and bloom; `lightricks/ltx-2.5/alpha-gen` for a clean matte only if needed). | `demo-video/look/hero-tests/k/`, `o/`, `p/` | Each route has its best take as MP4, with its request files and a few lines of notes. |
| 5 | One side-by-side film of the three best takes, 1080p, each labelled with its route and its cost per take. | `demo-video/look/hero-tests/hero-compare.mp4` | It plays; you have looked at frames from it yourself. |
| 6 | A short report: per route what worked, the defects you saw (merged bodies, a face that changes between sleeper and double, hands, flicker), cost, time per take, and your ranked advice for the film. Also the routine calls you took. | `demo-video/look/REPORT.md` | Honest, with paths to every file. |

Planned spend: stills up to $3, route K up to $4, route O up to $4, route P up to $3, reserve
$1. Stop a route that needs more and say so in the report.

## Proof

No tests and no review in this repo: done means seen. Look at your own outputs: pull frames
with ffmpeg and read them (downscale to about 1280 px wide first; an image costs context, so
read sheets, not every picture). Judge them as Manish would: would this pass in a premium
advert? Say plainly where it would not.

## PR and merge

One PR from `video-wp1-look-test`, titled "video WP1: look pictures and hero-shot tests". Body:
what was made, the spend total from the ledger, the paths, the head commit. You merge it
yourself once the contract is met (the repo's rule: "the worker merges it when its walk
passes"). Before merging: `git fetch`, and merge `origin/main` into your branch if it moved.
Pictures and clips go through Git LFS (`*.png`, `*.jpg`, `*.mp4` are already tracked). If an
LFS push is refused, keep the media in the worktree, push the text files, and list the media
paths in the report.

## Stop rules

- Money: $15 for this package. Before any call, check the endpoint's price for the resolution
  you ask for (`GET https://api.fal.ai/v1/models/pricing?endpoint_id=<id>` with the header
  `Authorization: Key $FAL_KEY`, or the model's page): "a resolution or mode can multiply" a
  base price, and Kling with a video input bills input plus output seconds.
- Context: measure it after the reading phase and at each milestone from your own transcript
  (`~/.claude/projects/-Users-manishjain-repos-ai-peer-hackathon-2026/<your session id>.jsonl`;
  your session id is in your scratchpad path). Context in use is `input_tokens +
  cache_read_input_tokens + cache_creation_input_tokens` of the last usage record, over
  1,000,000. At 45 to 50%: finish the step, commit, push, write
  `demo-video/docs/handoffs/HANDOFF-2026-11-14-ai-peer-video-wp1-2.md` on `main`, and tell the
  controller, which starts your successor.
- Usage: read it at each milestone with `claude -p "/usage" --output-format text`. Week at 93%:
  start nothing long. Week at 95%: finish the step, push, hand off, stop. 5-hour window at 80%:
  start no sub-agent.
- Sub-agents: at most 3 at once; brief a read-only one "write nothing anywhere".
- Processes: never `pkill` by pattern; stop only a PID you started and wrote down.

## When done

- **Milestone 1** (the character sheet): commit and push it on your branch, then send one
  message to the controller with the sheet's absolute path. The controller's session answers to
  the name `learnlikemagic-f7` (it calls itself ai-peer-video-controller-1). It also watches for
  the file itself, so go on without waiting for a reply.
- **At the end:** merge the PR; on `main`, set your line under "Packages" in
  `demo-video/docs/STATE.md` and add one session-log row (take the time from `date -u`); send
  the controller one message with the paths of `hero-compare.mp4` and `REPORT.md`; send one
  routine Telegram line with `bash ~/.claude/skills/notify/scripts/tg-notify.sh "..."`. Then
  stop. The controller starts the next package and closes your session.

## Traps known before the first line

- **The fal.ai balance is unknown** (the key cannot read it). If a call fails for lack of
  balance, stop spending, report it to the controller as "needs Manish", and go on with what
  needs no money (the tool, the code composite on any clips you already have).
- **Prices move:** MiniMax H3 Max is 30% off until 15 November; base prices read on 14 November
  are in `demo-video/research/fal-catalogue-2026-11-14.md`.
- **A new fal.ai account may run only 2 jobs at once** (a researcher's claim): queue, do not
  flood.
- **Models merge or duplicate bodies.** Say it in the prompt: "Only two figures: one solid and
  asleep, one glowing and see-through. The sleeper stays still under the blanket." For Omni's
  edit endpoint use one short sentence that names only the change, ending "Keep everything else
  the same".
- **No real people and no brands:** never upload a photo of a real person; no person's,
  company's or product's name in any prompt; no film or franchise names.
- **Seedance refuses real-looking faces** on upload: it is not part of this package.
- **zsh:** write scripts for bash or Python; never name a shell variable `path`; quote globs.
- **The shared checkout:** your shell starts in it after every command. Use absolute paths.
- **This Mac's global instructions** ask for a `## TLDR` at the end of each reply and plain
  words: follow them in what you write to people.
