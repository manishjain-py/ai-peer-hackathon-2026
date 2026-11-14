# AI Peer demo video: state

Live controller: ai-peer-video-controller-2 (Terminal window 3964 on Mac 48 GB, PID 49247,
https://claude.ai/code/session_01Nfn5h7PShJsTBPY7urCJaZ). Other sessions message it by that
name. It took over from ai-peer-video-controller-1 on 2026-11-14 (the hand-off is
`handoffs/HANDOFF-2026-11-14-ai-peer-video-controller-1.md`).

## Where we are (2026-11-14 11:54 UTC)

Day one. Manish asked for a 2-minute "wow" demo video (`BRIEF-2026-11-14.md`). The interview is
done (`DESIGN.md` section 0, V1 to V10): due Thursday 19 November, an invented employee
(character A), Claude's own abilities first, a $100 cap, real company screens on this Mac only.
The story is `STORY.md` ("He's asleep. I'm not."), approved by Manish for a first draft; the
plan is `PLAN.md`; the nine AI shots and their hand-over are in `SHOTS.md`. WP1 (the look, and
the clone shot three ways) is done and merged (PR 7, $6.60); its session is closed. WP2 (the
film in code and Draft 1) has the whole narration recorded and is building the film. WP3 (the
nine AI shots with people, cap $60) started at 11:53 UTC: stills first, then a cheap draft of
every shot, then the finals. No film exists yet. The controller waits with background scripts
(the "Still running" table), at no token cost.

Read at 11:47 UTC: context in use, WP2 26%, the controller 27%; Claude usage at 11:33 UTC, 10%
of the week (Fable 19%); the week resets 17 November, 04:29 India time.

Keys checked with free, read-only calls (values never printed): fal.ai valid (its balance
cannot be read with this key); ElevenLabs valid (plan `growing_business`, about 97% of the
character quota free, instant and professional voice cloning allowed); the Gemini API key lists
`gemini-omni-1.2-flash` (video), `lyria-3.5` (music) and `nano-banana-pro-preview` (images);
the OpenAI key lists `gpt-image-2.6-*` and no Sora model; Stability has 17 credits. fal.ai's own
catalogue and prices for the leading video models are in
`research/fal-catalogue-2026-11-14.md`. The Gemini and OpenAI keys belong to Learn Like Magic
set-ups: ask Manish before spending on them.

| Session | Window | Session URL | Worktree | Branch | PR | Job |
|---|---|---|---|---|---|---|
| ai-peer-video-controller-2 | 3964 | https://claude.ai/code/session_01Nfn5h7PShJsTBPY7urCJaZ | `~/repos/ai-peer-hackathon-2026` (docs only) | main | none | The live controller; Fable 5.2, max effort, PID 49247 |
| ai-peer-video-controller-1 | 2952 | https://claude.ai/code/session_01Nfn5h5eNL9YLJMnBQpKKMf | the same checkout | main | none | Handed off at 11:30 UTC; nothing of its own still runs. Its second-by-second watch of the September film is `DRAFT07-WATCH.md` (committed by controller-2). Other sessions message it as `learnlikemagic-f7`; PID 38022. Manish opened its window himself: ask him before closing it. |
| ai-peer-video-wp2 | 3963 | https://claude.ai/code/session_01Nfn5h95MaF4HSLH6cbpUbu | `~/repos/ai-peer-video-wp2` (launched in the shared checkout, with `CLAUDE_NO_IDLE_PING=1`) | video-wp2-film-build | none yet | WP2, handed off at 44.8% context (its message of 12:16 UTC). It stays open only until its two helpers report (the Earth close; music and sound effects, up to $5), writes their reports to `handoffs/HANDOFF-2026-11-14-ai-peer-video-wp2-2-helpers.md` on `main` and tells the controller: close its window only after that file is on `main`. PID 48241 |
| ai-peer-video-wp2-2 | 3972 | https://claude.ai/code/session_01Nfn5h9VhYd7zMX2hQUt663 | `~/repos/ai-peer-video-wp2` (the same worktree; launched in the shared checkout, with `CLAUDE_NO_IDLE_PING=1`) | video-wp2-film-build | none yet | WP2's successor: the push-in, the "AI Peer" tag, Draft 1 in two renders, the report, the PR; brief `handoffs/HANDOFF-2026-11-14-ai-peer-video-wp2-2.md`; Fable 5.2, max effort, PID 88331 |
| ai-peer-video-wp3 | 3968 | https://claude.ai/code/session_01Nfn5h7gdJoQpiC45zksGMJ | `~/repos/ai-peer-video-wp3` (launched in the shared checkout) | video-wp3-ai-shots | none yet | WP3: the nine AI shots with people (`SHOTS.md`); cap $60; Fable 5.2, max effort, PID 64734 |

Closed: ai-peer-video-wp1 (window 3962, PID 41753), by the controller at 11:52 UTC after its
report, with its screen idle, no child process, no sub-agent and a clean, merged worktree
(`~/repos/ai-peer-video-wp1`, kept).

Still running:

| What | PID | Log | Stop command |
|---|---|---|---|
| Wait `wp2-draft-1`: ends when `~/.ai-peer/demo-video-private/renders/draft-01.mp4` exists (unchanged for 90 s), or when PID 88331 is gone; sends one routine Telegram line | 88834 | `wp2-draft-1b.log` | `kill 88834` |
| Wait `wp3-end`: ends when `~/repos/ai-peer-video-wp3/demo-video/shots/REPORT.md` exists (unchanged for 90 s), or when PID 64734 is gone | 87279 | `wp3-end.log` | `kill 87279` |
| Wait `worker-stall`: ends when the transcript of WP2-2 or WP3 (and its sub-agents') has been silent for 25 minutes | 88881 | `worker-stall-3.log` | `kill 88881` |
| Two helpers of the old ai-peer-video-wp2 session, writing only their own files in `~/repos/ai-peer-video-wp2`: the Earth close (`src/scenes/earth.js`, `assets/earth/`) and music with sound effects (`audio/music/`, `audio/sfx/`, `audio/mix.json`, `audio/SOURCES.md`, `demo-video/ledger/wp2.csv`) | inside window 3963 | none | They end by themselves |

The waits are runs of `demo-video/tools/wait-for.sh` (its header shows the usage) in the
background of ai-peer-video-controller-2: each one's end wakes that session, and they end with
it. Their logs and PID files are in
`/private/tmp/claude-501/-Users-manishjain-repos-ai-peer-hackathon-2026/7cff79c0-397e-4114-8fb5-e987355dc176/scratchpad/waits/`.
A successor starts its own from the tests written in the table.

## Packages (each line is written by its own worker only)

- WP1, look pictures and hero-shot tests (`ai-peer-video-wp1`, brief
  `handoffs/HANDOFF-2026-11-14-ai-peer-video-wp1.md`, cap $15): **done**, merged as PR 7 on
  2026-11-14 11:49 UTC. Spent $6.60 (21 calls, `demo-video/ledger/wp1.csv`). Read
  `demo-video/look/REPORT.md`; watch `demo-video/look/hero-tests/hero-compare.mp4`. Its advice:
  route O (Gemini Omni 1.2 Flash, first and last frame) for the moment the clone rises, route K
  (Kling 4.0 key frames) for one take through several poses, route P's code only as a finishing
  tool; settle the look of the double in the stills first.
- WP2, the film in code and Draft 1 (`ai-peer-video-wp2`, brief
  `handoffs/HANDOFF-2026-11-14-ai-peer-video-wp2.md`, cap $10): launched 2026-11-14 11:30 UTC.
  Handed off at 44.8% context on 2026-11-14 12:20 UTC to `ai-peer-video-wp2-2`
  (`handoffs/HANDOFF-2026-11-14-ai-peer-video-wp2-2.md`); branch `video-wp2-film-build` at
  `a51c934`, no PR yet. Done: the one-command render (proven from a fresh clone), the voice
  (milestone 1), captions, the night clock and proof cards, the end card, the product screens
  for Draft 1, WP3's nine drafts pulled in. Running as helpers of the old session: the Earth
  close, and music with sound effects (up to $5). Left: the push-in, the tag on the double,
  Draft 1 (two renders), the report, the PR. Money spent by WP2 itself: $0.
- WP3, the nine AI shots with people (`ai-peer-video-wp3`, brief
  `handoffs/HANDOFF-2026-11-14-ai-peer-video-wp3.md`, cap $60): launched 2026-11-14 11:53 UTC.

## Money spent

| Date (UTC) | Tool | What for | Amount |
|---|---|---|---|
| 2026-11-14 | fal.ai (WP1, finished) | Pictures of three possible employees, the night-room frames, and the clone shot by three routes (Kling 4.0, Gemini Omni Flash, two plates and code) | $6.60 (21 rows of `demo-video/ledger/wp1.csv`; about 4 cents above fal.ai's own bill, its report says) |
| 2026-11-14 | fal.ai (WP3, running) | Stills for the nine shots, four looks for the double, a cheap moving draft of all nine | $3.74 so far (31 calls, its message of 12:14 UTC; `demo-video/ledger/wp3.csv` on its branch) |
| | **Total of the $100 cap** | | **$10.34** |

## Needs Manish

Nothing blocks the build.

1. **Asked** (recorded 2026-11-14 11:44 UTC; in the session with the three audio files, and on the
   Attention group): which voice narrates as the Peer? 1 Matilda, the product's own voice (recommended:
   the real product speaks with it in the meeting, so the Peer stays one character); 2 River,
   relaxed and neutral; 3 Brian, deep and warm. Draft 1 is built with voice 1 meanwhile.
2. **Asked** (recorded 2026-11-14 11:54 UTC; in the session with WP1's side-by-side clip, and on
   the Attention group): which rise of the clone does he like best, K (Kling), O (Gemini Omni)
   or P (two plates and code), and is the double's look (a mint outline with sparkles) bold
   enough? WP1 recommends O; the controller's frames say K shows his face most clearly. WP3
   makes the signature shot both ways and tries bolder looks in stills meanwhile.
3. **Asked** (recorded 2026-11-14 12:09 UTC; in the session with WP3's sheet
   `demo-video/shots/stills/double-looks.jpg`, and on the Attention group): which look for the
   double? A lit from inside the chest, B threads of light still joining him to the sleeper, C
   frosted glass, D woven lines of light. The controller's pick: B while he rises, settling
   into A once he stands (the chest light is where the "AI Peer" tag sits). WP3 chose the same
   by itself (B with a mint core in the chest, no outline, no sparkles) and made it in the
   film's frames (`shots/stills/night-rise.png`, `night-stand.png`): both pictures went to
   Manish, with "the film is built with it unless you say otherwise". WP3 makes the six shots
   without the double first, so the dearest shots can wait for his eyes.
4. Still to come, one at a time: (a) may the old controller's window (2952) be closed; (b) a
   look at the fal.ai credit, which no key can read: WP3 may spend up to $60 (told to him at
   the take-over); (c) the recordings from his company laptop by Tuesday 17 November morning,
   India time, into `~/.ai-peer/demo-video-private/` (the list is in `PLAN.md`; told to him
   2026-11-14 11:28 UTC); (d) Draft 1.

## Next

1. WP3 goes on: tag tracks and screen corners for the three double drafts, then finals of the
   six shots without the double, then `reveal-rise`, `reveal-desk`, `morning-nod`. Each final
   of the two reveal shots: look, show Manish. Pass on Manish's answers about the rise (K, O
   or P) and the double's look as soon as they come. Watch the money: WP3 reports its ledger
   total in each message and on passing $30. Its hook mouths are driven by WP2's sound but
   the sync is not yet checked frame by frame.
   When ai-peer-video-wp2 says its helpers' report is on `main`: check the file, then close its
   window 3963 after the usual checks. WP3 was at 24% context after 15 minutes: it will hand
   off too (its successor is `ai-peer-video-wp3-2`, launched the way WP2-2 was).
2. Manish's voice pick: pass it to ai-peer-video-wp2-2 if it is not voice 1.
   The controller hands off at 45 to 50% context (35% at 12:15 UTC): the successor is
   ai-peer-video-controller-3.
3. Draft 1 from ai-peer-video-wp2-2: look at a frame at every cut, then send it to Manish.
4. Sum the ledgers (`demo-video/ledger/*.csv`) into "Money spent" at each package's end; tell
   Manish at $50 and at $80.
5. ai-peer-video-controller-1 has nothing left. Manish opened its window (2952) himself: ask him
   before closing it.

## Settled, do not re-open

- See `DESIGN.md` section 0.

## Lessons

- (none yet)

## Session log

| Date (UTC) | Session | What happened | Outcome |
|---|---|---|---|
| 2026-11-14 10:18 | ai-peer-video-controller-1 | Set-up: read the old film and build, checked tools and keys on Mac 48 GB, wrote BRIEF, DESIGN and STATE, started the tools research and the interview. | In progress |
| 2026-11-14 10:26 | ai-peer-video-controller-1 | The reader of the old docs reported: saved as `PRIOR-WORK.md`. Keys checked with free calls; fal.ai's catalogue and prices saved. | Waiting on question 1 and on four researchers |
| 2026-11-14 10:39 | ai-peer-video-controller-1 | Three of four researchers reported; notes committed. Manish answered question 1: due Thursday 19 November. Working dates set (`DESIGN.md` C4). Question 2 (the budget) asked. | Waiting on question 2 and on the last researcher |
| 2026-11-14 10:43 | ai-peer-video-controller-1 | The last researcher reported; the report writer started. Manish answered question 2: Claude's own abilities first (V2), a $100 cap for now (V3). Question 3 (who is the employee in the film) asked. | Waiting on question 3 and on the report |
| 2026-11-14 10:49 | ai-peer-video-controller-1 | Manish answered question 3: C, an invented employee (V4). Question 4 (how the video is shown) asked. The controller starts the brief for the first worker: look pictures and test shots of the clone. | Waiting on question 4 and on the report |
| 2026-11-14 10:54 | ai-peer-video-controller-1 | Wrote the brief for WP1 (three possible employees, the night frames, the clone shot three ways, cap $15) from the research notes read first-hand and fal.ai's own prices. The repo is hackathon-light, so the brief was self-checked against the catalogue, with no reviewer pass. | WP1 worker being launched |
| 2026-11-14 10:55 | ai-peer-video-controller-1 | Launched ai-peer-video-wp1 (window 3962, PID 41753, Fable 5.2 at max effort) in the shared checkout with its worktree at `~/repos/ai-peer-video-wp1`; a watcher waits for its character sheet. | Worker reading its brief |
| 2026-11-14 11:00 | ai-peer-video-controller-1 | The tools report landed: `research/reports/AI video toolkit for demo film.md`. It was briefed before V2, V3 and V4, so it assumes Manish's own face and about $165 to $335; the controller read its first half and sent it to Manish with that caveat. Its open points for him: a Remotion licence ($25 a month if this is company work) or a free tool instead; the hackathon's rules and the company's policy on AI tools and brand; the fal.ai balance. | Sent to Manish |
| 2026-11-14 11:01 | ai-peer-video-controller-1 | Manish answered question 4: A, the video is the whole entry and judges watch it alone (V5). Question 5 (the hackathon's rules and scoring) asked. | Waiting on question 5 and on WP1's first pictures |
| 2026-11-14 11:07 | ai-peer-video-controller-1 | Manish answered question 5: no written rules (V6). Question 6 (what the product screens show and where they may go) asked. | Superseded by the next row: the pictures arrived first |
| 2026-11-14 11:08 | ai-peer-video-controller-1 | WP1 reported milestone 1 (its message, and the watcher): the sheet of three invented employees, made with `google/nano-banana-2.1`, $0.39 spent so far by its ledger. The controller looked at the sheet (real-looking, even light, skin tones true) and sent it to Manish as question 6, in place of the product-screens question, which moves to question 7. WP1 goes on with character A. | Waiting on question 6 and on WP1's frames and hero tests |
| 2026-11-14 11:09 | ai-peer-video-controller-1 | Manish picked employee A (V7); WP1 already uses A, so no message was sent to it. Question 7 (what the product screens show and where they may go) asked. | Waiting on question 7 and on WP1's frames and hero tests |
| 2026-11-14 11:12 | ai-peer-video-controller-1 | Manish answered question 7: B, real company content on this Mac only (V8); the rule for every session is C8 and in `demo-video/AGENTS.md`. Question 8 (the outline of the film) asked. | Waiting on question 8 and on WP1's frames and hero tests |
| 2026-11-14 11:22 | ai-peer-video-controller-1 | Manish asked whether the September film is here (yes: Draft 07, 4:23, on this Mac), then dropped the student opening (V9) and asked for a better two-minute story after a frame-by-frame watch. The controller read the film's full captions and 48 frames across it; a helper watches every second inside a scratch folder. The proposed story is saved as `STORY.md`. | The story went to Manish before the helper's watch ended |
| 2026-11-14 11:28 | ai-peer-video-controller-1 | Manish approved the story for a first draft (V10). The controller wrote `PLAN.md` and WP2's brief, chose a licence-free build (C9) and the Draft 1 voice and money split (C10). | WP2 being launched |
| 2026-11-14 11:30 | ai-peer-video-controller-1 | Launched ai-peer-video-wp2 (window 3963, PID 48241). Context at 43%: wrote `handoffs/HANDOFF-2026-11-14-ai-peer-video-controller-1.md` and started ai-peer-video-controller-2 in this repo. WP1's ledger stood at $5.03 at 11:25 UTC. | Handed off; controller-1 only waits for its film-watch helper |
| 2026-11-14 11:35 | ai-peer-video-controller-2 | Took over from ai-peer-video-controller-1. Checked by the screen and the system: both workers and the old controller are alive and working; WP1's ledger sums to $6.60. Started four background waits (`demo-video/tools/wait-for.sh`): WP1's end, WP2's voice samples, WP2's Draft 1, and a worker silent for 25 minutes. Told both workers its name. | Waiting on WP1's end and on WP2's voice samples |
| 2026-11-14 11:44 | ai-peer-video-controller-2 | WP2's three voice samples appeared at 11:41 UTC (the wait ended): measured (2.4 to 2.8 s each, about -21 LUFS), sent to Manish in the session with the question on the Attention group. Wrote `SHOTS.md`, the shared list of the nine AI shots and the hand-over from WP3 to WP2, in step with WP2's script (the colleagues' words and voices are WP2's; decision C11), and told WP2. Committed `DRAFT07-WATCH.md` for ai-peer-video-controller-1 and passed its six lessons to WP2. Looked at eight frames of WP1's side-by-side clip. | Waiting on WP1's report, on Manish's voice pick and on WP2's Draft 1 |
| 2026-11-14 11:49 | ai-peer-video-wp1 | WP1 done: the sheet of three employees, four night-room frames, the clone shot by three routes (Kling 4.0, Gemini Omni 1.2 Flash, two plates and code), the side-by-side film and the report. PR 7 merged (merge commit 15d2770). $6.60 of the $15 cap spent. | Done. No clip was watched in motion or heard, so Manish's view of `hero-compare.mp4` is the real test |
| 2026-11-14 11:54 | ai-peer-video-controller-2 | Read WP1's report (its wait ended at 11:49 UTC) and sent its side-by-side clip to Manish with one question (which rise, and is the look bold enough). Closed WP1's window 3962 at 11:52 UTC after the checks. Wrote WP3's brief from WP1's verdict (drafts first; the signature shot both ways, O and K; bolder looks for the double tried in stills), made its worktree and launched ai-peer-video-wp3 at 11:53 UTC (window 3968, PID 64734, seen working at max effort). Re-armed the waits (WP3's nine drafts; a silent worker). The brief's facts are being checked by a read-only helper after the launch, not before it, to save time: its findings go to WP3 by message. | Waiting on WP3's stills and drafts, WP2's Draft 1, and Manish's two answers |
| 2026-11-14 11:58 | ai-peer-video-controller-2 | WP2 reported milestone 1 by message: the narration (15 lines, checked by speech-to-text), the three voice samples, and a 2:00 animatic with 16 labelled slates (`demo-video/film/renders/animatic-01.mp4` in its worktree, branch commit c8effb0), built on HyperFrames. The controller looked at a 15-frame sheet of it (slates only, nothing private) and sent Manish a 720p copy as an optional listen for the voice question. `SHOTS.md` now carries WP2's film windows. | WP2 goes on to the parts made by code, the product screens, music and Draft 1 |
| 2026-11-14 12:09 | ai-peer-video-controller-2 | The helper's check of WP3's brief reported (20 minutes, free calls only): the brief's paths, prices paid, slots, money split and privacy rule hold; twelve corrections (always set the resolution: Kling defaults to 1080p at $0.235 a second; the named lip-sync endpoints need 4 to 5 s of sound; stills are not exactly 16:9; no seed on Kling or Omni; the order of the finals) are in `research/fal-facts-2026-11-14.md` with live price tables, and went to WP3 by message; the controller re-read three of them itself. `SHOTS.md` gained the rule for where a spoken line starts. WP3 had spent $1.53 at 12:06 UTC (17 rows) and made its sheet of four looks for the double; the controller looked at it and sent it to Manish with its pick. | Waiting on WP3's drafts, WP2's Draft 1 and Manish's three answers |
| 2026-11-14 12:15 | ai-peer-video-controller-2 | WP3 reported milestone 1 by message (and its wait ended): a moving draft of all nine slots in its manifest, $3.74 spent, draft PR 8. The controller looked at `all-shots.jpg` (nine coherent shots: three colleagues in three places, the sleeper, the rise with threads of light, the desk, the morning) and told WP2 to use the manifest in Draft 1. WP3 chose look B for the double by itself; its two key frames went to Manish. | WP3 on tag tracks, then finals; WP2 on the code parts and Draft 1 |
| 2026-11-14 12:16 | ai-peer-video-wp2 | Handed off at 44.8% context. Since milestone 1: product screens by code (window, camera, cursor, mint outline; the meeting shown as a call tile moved by its real sound, because the stand-in recording's picture is only a name on black), the night clock, proof cards and labels in one text lane, the end card, WP3's nine drafts pulled into the film, film grain. Two helpers still run (the Earth close; music and sound effects). | Successor `ai-peer-video-wp2-2` to be started by the controller; brief `handoffs/HANDOFF-2026-11-14-ai-peer-video-wp2-2.md` |
| 2026-11-14 12:18 | ai-peer-video-controller-2 | ai-peer-video-wp2 handed off at 44.8% context (branch pushed at a51c934; the one-command render, voice, captions, clock, end card and product screens built; WP3's nine drafts pulled in; no money spent). The controller read its hand-off brief and launched ai-peer-video-wp2-2 at 12:17 UTC (window 3972, PID 88331, seen working), told to commit by path only while the old session's two helpers still write. Waits re-armed on the new PID. WP2's note for Manish's recordings went into `PLAN.md`. | WP2-2 reading in; the old WP2 window stays until its helpers report |
