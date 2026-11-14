# Brief: ai-peer-video-wp2, 2026-11-14

For Fable 5.2 (`claude-fable-5-2`), max effort. Spawned by ai-peer-video-controller-1. Dated,
never edited; the living state is `demo-video/docs/STATE.md` on `main`.

## Manish's standing instructions

> "Sure. Let's go ahead with this story for the first draft and create the video and show it to
> me how it comes out end to end." (2026-11-14, V10)

> "First preference is to use Claude native capabilities. If that is not possible to fulfill
> the requirement, then we can use any tools that you think can do that." (V2)

> "for the budget cap, let's keep $100 for now" (V3). This package may spend **at most $10**.

His taste, from the September film: "polished advertising quality", "natural restrained
voices" (he disliked voices that "sound artificial" or "have excessive excitement"), upbeat
music in step with the cuts, fast pacing. He rejected a cartoon look as
"childish/unprofessional". You take routine calls yourself and note them in your report.

## The job

Build the film in code and assemble Draft 1 end to end, so Manish can watch the whole two
minutes: voice, captions, music, every part present, a labelled slate wherever a shot is still
missing.

## Read first, in order

1. `demo-video/docs/STATE.md` on `origin/main`.
2. `demo-video/docs/DESIGN.md` section 0 (all of it; C8 is the privacy rule).
3. `demo-video/docs/STORY.md` (the film) and `demo-video/docs/PLAN.md` (who makes what).
4. `demo-video/docs/PRIOR-WORK.md` (identity colours, the mark, voices, traps).
5. Only if needed: in `demo-video/research/research_notes/AI video toolkit for demo film/agent_production_stack.md`,
   the sections on code-driven motion graphics, screen recordings and audio (find them with
   `command grep -n "^## "`). They are a researcher's claims.

## Working copy

- Your session starts in `/Users/manishjain/repos/ai-peer-hackathon-2026` (the shared checkout,
  on `main`). **Write nothing there.**
- Your worktree: `/Users/manishjain/repos/ai-peer-video-wp2`, branch `video-wp2-film-build`,
  made by the controller from `origin/main`, upstream unset. Work only there, by absolute path.
- It needs: ffmpeg 8 (this build has **no `drawtext` filter**), Node 23, Python 3, `uv`,
  Chrome; `ELEVENLABS_API_KEY` in `~/.ai-peer/.env` (a paid plan with a large free quota: using
  it is not new spending); `FAL_KEY` in the shell environment. Never print or commit a key.
- WP1's generation tool and ledger format are on its branch until it merges: read them at
  `/Users/manishjain/repos/ai-peer-video-wp1/demo-video/tools/`. Your ledger is
  `demo-video/ledger/wp2.csv`.

## Decisions already taken for you

- **No Remotion.** It asks for a paid company licence. Use a licence-free route: first a short
  trial (at most 45 minutes) of HyperFrames (`heygen-com/hyperframes`, Apache-2.0, HTML to
  video): render 5 seconds at 1080p, 30 fps, with text, an embedded MP4 clip and a WebGL
  canvas. If it fails or fights you, build a plain pipeline instead: one HTML page whose state
  is a pure function of the frame number, captured frame by frame with Playwright, joined and
  mixed with ffmpeg. The September film's Remotion code under `film/video/src/` may be read for
  the mark and colours only.
- **The narrator is the Peer, in the first person.** For Draft 1 use the product's own Peer
  voice, ElevenLabs `XrExE9yKIg1WjnnlVkGX`, calm and natural, never excited. It is never
  Manish's cloned voice.
- **Look:** real-looking and cinematic. Night in deep teal-ink `#152b31`, people lit warm, the
  Peer glowing mint `#b7f4cf`; paper `#f6f4ee`, green `#167353`; type Manrope. The mint glow is
  the Peer's signature in every part, also in titles and on the product screens.

## The contract

| # | What to make | Where (in the worktree) | Done when |
|---|---|---|---|
| 1 | The film project: one command renders the whole film to MP4 (1920x1080, 30 fps), another renders one part. The timeline follows `STORY.md`'s five parts and timings. `shots.json` lists every slot (id, part, start, length, what it shows, the clip's path or `null`). A slot with no clip renders a labelled slate, so the film always plays. | `demo-video/film/` | A full-length animatic renders from a clean checkout with one command. |
| 2 | **Milestone 1, first:** the voice. The whole narration from `STORY.md` in the Peer's voice, line by line, with timings; plus one line ("I cover. Not as him. As me.") in two other calm, natural voices as samples for Manish's ear. Check every line with speech-to-text (the word "Peer" is often heard as "pier") and fix what is wrong. | `demo-video/film/audio/` and `demo-video/film/audio/samples/` | The animatic plays with the narration and captions; the three samples exist. Tell the controller (see "When done"). |
| 3 | The parts made by code. (a) The close: a 3D Earth seen from space, the night side toward us, mint lights coming on across the dark cities, starting as a pull-out from one lit window; public-domain NASA textures (write the source and licence beside them). (b) The night clock for the proof part: 2 AM, 4 AM, 6 AM. (c) Title chips for the three proofs. (d) Captions for every spoken line. (e) The end card: the AI Peer mark, "More room for your best work.", "Built for real this week". (f) The small "AI Peer" tag that sits on the double's chest, placed by keyframes. | `demo-video/film/` | Each looks like a premium advert, not a slide. Look at your own frames and say plainly where it falls short. |
| 4 | The product screens, polished by code: a rounded window on a soft background, a slow zoom to where the action is, a clear cursor, captions that name what happens ("Joins as a labelled AI", "Gives his update", "Brings decisions back to him"). For Draft 1 use the stand-in recordings of 6 November (demo data): `~/.ai-peer/manish/walks/s1-away-20261106T182028Z/walk.mp4` (Slack at night) and `~/.ai-peer/manish/meeting-runs/m2db7aebe/recording.mp4` (the meeting, with its own sound: keep the Peer's real spoken introduction). There is no recording yet of "the other direction" or of the morning brief: use slates. | Code in `demo-video/film/`; the recordings and every render that contains them only under `~/.ai-peer/demo-video-private/` | The three proofs fit their time in `STORY.md` and read at a glance. |
| 5 | Music and sound. An upbeat, light, modern bed that builds with the film and is cut to the edit; a few soft sound effects (the phone, the rise, the laptop). Music from a source whose terms allow use in a company's internal film: look in fal.ai's catalogue or use Google's Lyria; **not** ElevenLabs Music (its self-serve terms are for individuals and small firms). Write down the terms you relied on. Sound effects: ElevenLabs' sound-effects endpoint on the existing plan, or code. Mix with ffmpeg: the voice always clear, the music ducked under it, about -14 LUFS overall. | `demo-video/film/audio/` | No session can hear: check the mix by measurement (loudness, the voice's level against the music) and by speech-to-text on the final track. |
| 6 | **Draft 1.** At most 2:00, all five parts, voice, captions, music. AI shots come from WP3 through `shots.json` as they are finished (ask the controller where they are); until then, slates. Render it twice: a full one with the stand-in recordings into `~/.ai-peer/demo-video-private/renders/draft-01.mp4`, and a slate-only one that may be committed. | as said | It plays end to end. You pulled a frame at every cut and looked at them as one sheet. |
| 7 | A short report: what was built, what looks weak, the routine calls you took, the spend, the paths. | `demo-video/film/REPORT.md` | Honest. |

## The privacy rule (DESIGN C8), in short

The stand-in recordings are demo data and may appear in a preview for Manish, but never in git.
Later Manish brings real recordings from his company laptop into
`~/.ai-peer/demo-video-private/`: those, any frame of them and any render that contains them
never go to git, to an outside service, to Telegram or into a reply, a commit or a prompt.
Nothing they show is quoted anywhere. Your session was started with `CLAUDE_NO_IDLE_PING=1` for
this reason.

## PR and merge

One PR from `video-wp2-film-build`, titled "video WP2: the film in code and Draft 1". Push
early and often (the branch is the backup). You merge it yourself when Draft 1 plays; before
merging, `git fetch` and merge `origin/main` in if it moved. Media through Git LFS (already
tracked). If an LFS push is refused, keep the media in the worktree and list the paths.

## Stop rules

- Money: $10. Check a price before a paid call
  (`GET https://api.fal.ai/v1/models/pricing?endpoint_id=<id>`, header
  `Authorization: Key $FAL_KEY`); log each call in your ledger.
- Context: measure after the reading phase and at each milestone from your own transcript
  (`~/.claude/projects/-Users-manishjain-repos-ai-peer-hackathon-2026/<your session id>.jsonl`;
  context in use is `input_tokens + cache_read_input_tokens + cache_creation_input_tokens` of
  the last usage record, over 1,000,000). At 45 to 50%: finish the step, commit, push, write
  `demo-video/docs/handoffs/HANDOFF-2026-11-14-ai-peer-video-wp2-2.md` on `main`, tell the
  controller, which starts your successor.
- Usage: `claude -p "/usage" --output-format text` at each milestone. Week at 93%: start
  nothing long. Week at 95%: finish the step, push, hand off, stop. 5-hour window at 80%: start
  no sub-agent.
- Sub-agents: at most 3 at once, on disjoint files, from one shared brief; brief a read-only one
  "write nothing anywhere". Their reports are claims: look at their output yourself.
- Processes: never `pkill` by pattern; stop only a PID you started and wrote down.

## When done

- **Milestone 1** (the narration, the samples, the animatic): commit and push, then send the
  controller one message with the absolute paths. The live controller is named in `STATE.md` on
  `main` (at launch: ai-peer-video-controller-1, whose session answers to `learnlikemagic-f7`;
  a successor `ai-peer-video-controller-2` may take over: read `STATE.md` before each message).
  Go on without waiting.
- **Draft 1:** message the controller with the two render paths and `REPORT.md`; set your line
  under "Packages" in `STATE.md` on `main` and add a session-log row (time from `date -u`). Then
  wait for the controller: Manish's feedback comes back to you through it.

## Traps known before the first line

- **Nobody can hear.** In September no session listened, and the voices were replaced twice.
  Measure, transcribe, and get the samples to Manish early.
- **"Peer" is heard as "pier"** by speech tools: this affects checks, and sometimes the
  voice's own pronunciation of a sentence. Listen by transcript.
- **Length creeps.** The September film grew from 2:00 to 4:23. The limit is 2:00.
- **Slow pacing was rejected** (gaps of 1.8 to 2.5 s between lines in an old draft): keep gaps
  short.
- **This ffmpeg has no `drawtext`.** Draw text in the HTML layer.
- **A real person's name may appear in the stand-in Slack recording.** Do not zoom on it, and
  never copy names from the recordings into files.
- **zsh:** write scripts for bash, Node or Python; never name a shell variable `path`.
- **This Mac's global instructions** ask for plain words and a `## TLDR` at the end of each
  reply: follow them in what you write to people.
