> DRAFT by ai-peer-video-controller-2, not yet a brief. The section marked @@VERDICT@@ waits on WP1's report; a helper is checking the facts. The final file will be `HANDOFF-2026-11-14-ai-peer-video-wp3.md`, and this draft is then deleted. The launch script is at the end.

# Brief: ai-peer-video-wp3, 2026-11-14

For Fable 5.2 (`claude-fable-5-2`), max effort. Spawned by ai-peer-video-controller-2. Dated,
never edited; the living state is `demo-video/docs/STATE.md` on `main`.

## Manish's standing instructions

> "Sure. Let's go ahead with this story for the first draft and create the video and show it to
> me how it comes out end to end." (2026-11-14, V10)

> "First preference is to use Claude native capabilities. If that is not possible to fulfill
> the requirement, then we can use any tools that you think can do that." (V2)

> "for the budget cap, let's keep $100 for now, and afterwards we will see if we can extend it
> or not." (V3) This package may spend **at most $60** of it.

> "an AI clone comes out of the employee that looks exactly like the employee and goes and
> attends the meeting" ... "I want the visual to be just absolutely next level" (the brief, B3)

The employee is an invented person, character A, never Manish (V4, V7). There is no student or
magic-school opening (V9). The video is the whole entry and judges watch it alone (V5). It is
due Thursday 19 November (V1). His taste, from the September film: "polished advertising
quality"; he rejected "the walking/sitting cartoon" as "childish/unprofessional".

You decide routine calls yourself and note them in your report. You stop and report to the
controller only for: money past $60, a fal.ai balance that is empty, or a tool that refuses
the content.

## The job

Make the nine AI shots with people that the film needs (`demo-video/docs/SHOTS.md`): first as
cheap drafts, so Draft 1 shows every shot moving, then as finals, and hand each one to WP2
through your manifest.

## Read first, in order

1. `demo-video/docs/STATE.md` on `origin/main`.
2. `demo-video/docs/SHOTS.md`: the nine slots, their lengths, the colleagues' lines, the rules
   for every clip, the manifest. It is your contract with WP2.
3. `demo-video/docs/STORY.md` (the film) and `demo-video/docs/DESIGN.md` section 0 (C5, C7, C8
   and C11 matter most to you).
4. `demo-video/look/REPORT.md`: WP1's test of the clone shot three ways, its defects and its
   advice. Then look at `demo-video/look/frames/frames.jpg` and
   `demo-video/look/characters/characters.jpg`.
5. The header of `demo-video/tools/falgen.py`: the generation tool with the cost ledger. Every
   paid call goes through it. WP1's other tools are beside it (`sheet.py`, `vgrid.sh`,
   `double_composite.py`, `person_matte.py`): read a header when you need the tool.

Do not read the research notes (WP1 tested what they claim), `film/` or `docs/build/`.

## Working copy

- Your session starts in `/Users/manishjain/repos/ai-peer-hackathon-2026` (the shared checkout,
  on `main`). **Write nothing there.** The controller commits docs there.
- Your worktree is `/Users/manishjain/repos/ai-peer-video-wp3`, branch `video-wp3-ai-shots`,
  made by the controller from `origin/main` after WP1's merge, upstream unset. Work only there,
  by absolute path and `git -C /Users/manishjain/repos/ai-peer-video-wp3`. Re-create it with:
  `git -C /Users/manishjain/repos/ai-peer-hackathon-2026 fetch origin` then
  `git -C /Users/manishjain/repos/ai-peer-hackathon-2026 worktree add /Users/manishjain/repos/ai-peer-video-wp3 video-wp3-ai-shots`.
- It needs: `FAL_KEY` in the shell environment (never print it, never commit it); ffmpeg 8
  (this build has **no `drawtext` filter**), Node 23, Python 3 and `uv` (all installed).
- Two other worktrees are **read-only** for you. WP1's,
  `/Users/manishjain/repos/ai-peer-video-wp1`: its session is closed, and any picture or clip
  that did not reach `main` through Git LFS is still there. WP2's,
  `/Users/manishjain/repos/ai-peer-video-wp2`: the film; you read the colleagues' spoken lines
  from `demo-video/film/audio/lines/h1.wav`, `h2.wav` and `h3.wav` there.
- Your ledger is `demo-video/ledger/wp3.csv`; give `falgen.py` the cap `60` and the session
  name `ai-peer-video-wp3`.
- Scratch files go in your session's scratchpad, never in `/tmp`.

## The look (the controller's direction)

- Real-looking and cinematic, like a premium advert. Never a cartoon or a 3D-animation look.
- One colour system for the whole film: night scenes in deep teal-ink (`#152b31`), people lit
  warm, the Peer glowing mint (`#b7f4cf`). The mint glow is the Peer's signature everywhere.
- The double is the same man in the same clothes, made of light, as in WP1's frames F2 to F4:
  a mint rim of back-light and a fine shimmer; partly see-through at the moment it separates,
  more solid once it stands. Calm, friendly, capable. Never a flat transparent ghost, never
  scary, never a sticker with a hard outline.
- **The double never looks at the camera and never grins.** It looks at the sleeper, or at
  where it is going. (In WP1's key frame F2 it smiles into the lens; make a new F2 for the film.)
- The night room is WP1's: a bed on the left, a small desk with a laptop on the right, a
  window with cool moonlight, one locked wide camera. The morning uses the same room and
  camera in warm sunrise light. Make new frames of the room by editing `look/frames/f1.png`,
  so the room and the camera stay identical.
- The three colleagues are three different invented people in three different places and
  lights (a bright office by day; a small meeting room in late afternoon; a home desk under an
  evening lamp), so one cut says "other time zones". Ordinary, likeable working people, not
  models. Skin tones true to each person.
- No readable text inside any picture or clip. Screens face away from us or are a plain glow.

## What WP1 found, and the route for the double

@@VERDICT@@

## The contract

| # | What to make | Where (in the worktree) | Done when |
|---|---|---|---|
| 1 | **The stills, first.** One still per slot before any video of it: the three colleagues in their places; the sleeper, closer than the wide frame; the new key frames of the night room that the two reveal shots need (the phone lit on the bedside table; the double half-risen and looking at the sleeper; the double pulling the blanket over his shoulder; the double standing; the double seated at the open laptop); the room at sunrise with him waking; him with the phone; the faint double by the desk in daylight. | `demo-video/shots/stills/`, with one labelled sheet `stills.jpg` (about 2400 px wide) | The sheet is committed and pushed, and you have looked at it as Manish would. Go on without waiting for anyone. |
| 2 | **Milestone 1, fast: a draft of every slot.** A cheap, low-resolution moving take of each of the nine (a draft tier or a cheap model; the lip-sync may be missing), upscaled to 1920x1080 by ffmpeg, listed in the manifest with `"grade": "draft"`. | `demo-video/shots/<slot id>/` and `demo-video/shots/manifest.json` (`SHOTS.md` gives the fields) | All nine slots are in the manifest. Tell the controller at once (see "When done", milestone 1): Draft 1 of the film can then show every shot moving. |
| 3 | **The finals**, in this order: `reveal-rise`, `reveal-desk`, `hook-sleeper`, `hook-1`, `hook-2`, `hook-3`, `morning-wake`, `morning-brief`, `morning-nod`. Each replaces its draft in the manifest as soon as it is good (`"grade": "final"`). `reveal-rise` is the film's signature picture: it gets the most takes and the most care. | the same | Each final holds up when you step through its frames: the same man in every shot, the double as "The look" says, hands and faces whole, no flicker, no merged or extra bodies, no cut inside the clip. |
| 4 | For the three slots that show the double: the chest track for the "AI Peer" tag (`tag_track`). For `reveal-desk` also the laptop's screen corners in the last frame (`screen_quad`) and that frame as a sharp still (`last_still`). | beside each clip; fields in `SHOTS.md` | Drawn back over a few frames of the clip as a check, the track sits on the chest. |
| 5 | The colleagues speak on camera (`SHOTS.md`, "The colleagues' lines"): each mouth follows WP2's spoken file. Try the cheapest way first on `hook-3` (a 1.1 second line). A shot that does not look natural after a few takes becomes a silent reaction; say which in the manifest. | the three `hook-` slots | Each of the three is either in sync when you step through the frames against the sound, or marked `reaction`. |
| 6 | A sheet per final (6 to 8 frames across the clip) and one sheet of all nine slots. | `demo-video/shots/<slot id>/<slot id>-sheet.jpg`, `demo-video/shots/all-shots.jpg` | You looked at each sheet. |
| 7 | A short report: per slot the route, the takes, the cost, what is still weak; the routine calls you took; the spend total. | `demo-video/shots/REPORT.md` | Honest, with paths to every file. |

Planned spend, as a guide: stills up to $4; the nine drafts up to $8; finals for the two
reveal shots up to $20, for the hook's four up to $12, for the morning's three up to $9;
upscales and mattes up to $4; reserve $3. Stop a slot that needs more than its share, keep its
best take, and say so in the report.

Prices WP1 really paid on 14 November (`demo-video/ledger/wp1.csv`): a still or an edit with
`google/nano-banana-2.1` about $0.07; `minimax/h3-max-turbo/image-to-video` 12 s at 768P $0.36;
`google/gemini-omni-flash/v1.2/image-to-video` 10 s at 360p $0.29 and at 720p $0.84;
`kling/v4/image-to-video` 10 s at 720p $1.57.

## Proof

No tests and no review in this repo: done means seen. Look at your own outputs: pull frames
with ffmpeg and read them (downscale to about 1280 px wide first; an image costs context, so
read sheets, not every picture). Judge them as Manish would: would this pass in a premium
advert? Say plainly where it would not. A take that looks wrong is not delivered as a final
because the money for its slot is spent: it stays a draft, and the report says so.

## PR and merge

One PR from `video-wp3-ai-shots`, titled "video WP3: the AI shots with people". Open it as a
draft at milestone 1 and push early and often (the branch is the backup). Body: what was made,
the spend total from the ledger, the paths, the head commit. You merge it yourself once the
contract is met (the repo's rule: "the worker merges it when its walk passes"). Before merging:
`git fetch`, and merge `origin/main` into your branch if it moved. Pictures and clips go
through Git LFS (`*.png`, `*.jpg`, `*.mp4` are already tracked). If an LFS push is refused,
keep the media in the worktree, push the text files, and list the media paths in the report.

## Stop rules

- Money: $60 for this package. Before any call, check the endpoint's price for the resolution
  and length you ask for (`GET https://api.fal.ai/v1/models/pricing?endpoint_id=<id>` with the
  header `Authorization: Key $FAL_KEY`, or the model's page): a resolution or a mode can
  multiply a base price, and Kling with a video input bills input plus output seconds.
- Context: measure it after the reading phase and at each milestone from your own transcript
  (`~/.claude/projects/-Users-manishjain-repos-ai-peer-hackathon-2026/<your session id>.jsonl`;
  your session id is in your scratchpad path). Context in use is `input_tokens +
  cache_read_input_tokens + cache_creation_input_tokens` of the last usage record, over
  1,000,000. At 45 to 50%: finish the step, commit, push, write
  `demo-video/docs/handoffs/HANDOFF-2026-11-14-ai-peer-video-wp3-2.md` on `main` (from a
  throwaway worktree of `origin/main`), and tell the controller, which starts your successor.
- Usage: read it at each milestone with `claude -p "/usage" --output-format text`. Week at 93%:
  start nothing long. Week at 95%: finish the step, push, hand off, stop. 5-hour window at 80%:
  start no sub-agent.
- Sub-agents: at most 3 at once, on disjoint slots, from one shared brief; brief a read-only
  one "write nothing anywhere". Their reports are claims: look at their output yourself.
- Processes: never `pkill` by pattern; stop only a PID you started and wrote down.

## When done

The live controller is named in the first lines of `demo-video/docs/STATE.md` on `main` (at
launch: ai-peer-video-controller-2, which answers to that name). Read it before each message.

- **Milestone 1** (a draft of every slot in the manifest): commit and push, then send the
  controller one message with the absolute paths of the manifest and of `all-shots.jpg`. Go on
  with the finals without waiting.
- **Each final of the two reveal shots:** one message to the controller with the clip's path
  and its sheet's path. The controller looks at it and shows Manish.
- **At the end:** merge the PR; on `main`, set your line under "Packages" in
  `demo-video/docs/STATE.md` and add one session-log row (take the time from `date -u`; write
  from a throwaway worktree of `origin/main`, fetch right before the push); send the controller
  one message with the paths of the manifest, `all-shots.jpg` and `REPORT.md`; send one routine
  Telegram line with `bash ~/.claude/skills/notify/scripts/tg-notify.sh "..."`. Then stop. Do
  not delete the worktree: WP2 reads the clips from it. The controller closes your session.

## Traps known before the first line

- **Manish is waiting to see the film end to end.** The nine drafts come first and fast; do
  not polish one shot while eight slots are still slates.
- **The fal.ai balance is unknown** (the key cannot read it). If a call fails for lack of
  balance, stop spending, report it to the controller as "needs Manish", and go on with what
  needs no money (the code work on clips you already have).
- **Prices move:** the MiniMax H3 discount ends on 15 November. Read the live price before a
  call; `falgen.py` prints it.
- **A new fal.ai account may run only 2 jobs at once** (a researcher's claim): queue, do not
  flood.
- **Models merge or duplicate bodies.** Say it in the prompt: "Only two figures: one solid and
  asleep, one glowing. The sleeper stays still under the blanket." For an edit endpoint use one
  short sentence that names only the change, ending "Keep everything else the same".
- **Pictures beat words** in a key-frame model: a look that is wrong in a still comes out wrong
  in the clip. Fix the still, then make the clip.
- **One man, every shot.** Give every call that shows employee A the same reference pictures
  (`look/characters/a-portrait.jpg`, `a-full.jpg`), and start a shot that continues another
  from the real last frame of the earlier clip.
- **Lip-sync endpoints are untested here.** fal.ai lists, among others,
  `minimax/h3-max/lip-sync/image-to-video` and `bytedance/omnihuman/v2` (prices in
  `demo-video/research/fal-catalogue-2026-11-14.md`, read on 14 November). Read an endpoint's
  inputs and live price before you rely on it.
- **A locked camera lets code do a lot:** with the same frame and no camera move, a clean
  still of the room is a background plate. A figure can be made see-through by mixing the plate
  back in under its matte, and a fade is a cross-fade to the plate.
- **No real people and no brands:** never upload a photo of a real person; no person's or
  company's name in any prompt; no film or franchise names. Nothing from `~/.ai-peer/` goes to
  any tool.
- **Seedance refuses real-looking faces** on upload: do not plan on it.
- **zsh:** write scripts for bash or Python; never name a shell variable `path`; quote globs.
- **The shared checkout:** your shell starts in it after every command. Use absolute paths.
- **This Mac's global instructions** ask for a `## TLDR` at the end of each reply and plain
  words: follow them in what you write to people.

## Launch (run by the controller after WP1 merges)

```
git -C /Users/manishjain/repos/ai-peer-hackathon-2026 fetch origin
git -C /Users/manishjain/repos/ai-peer-hackathon-2026 worktree add /Users/manishjain/repos/ai-peer-video-wp3 -b video-wp3-ai-shots origin/main
git -C /Users/manishjain/repos/ai-peer-video-wp3 branch --unset-upstream
```

Then this script, opened in a new Terminal window with `osascript` (`do script`), and the window that was in front put back:

```
#!/bin/zsh
# Launches the worker session ai-peer-video-wp3 (no keystrokes needed).
cd /Users/manishjain/repos/ai-peer-hackathon-2026 || exit 1
export ANTHROPIC_MODEL="claude-fable-5-2"
exec claude --model "claude-fable-5-2" --effort max --name ai-peer-video-wp3 --remote-control ai-peer-video-wp3 \
  "You are ai-peer-video-wp3, a worker on the AI Peer demo video in this repo. The live controller is ai-peer-video-controller-2 unless demo-video/docs/STATE.md on the default branch names a newer one. Read, in order: demo-video/docs/STATE.md on origin/main, then demo-video/docs/handoffs/HANDOFF-2026-11-14-ai-peer-video-wp3.md. That brief is your job: follow it end to end, then stop as it says. Your worktree already exists at /Users/manishjain/repos/ai-peer-video-wp3 (branch video-wp3-ai-shots); write nothing in the shared checkout you start in."
```
