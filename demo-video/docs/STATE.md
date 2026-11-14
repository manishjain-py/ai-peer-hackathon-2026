# AI Peer demo video: state

Live controller: ai-peer-video-controller-3 (Terminal window 3973 on Mac 48 GB, PID 12154,
https://claude.ai/code/session_01Nfn5h8g3cWzARgY2jkzyPF). Other sessions message it by that
name. It took over from ai-peer-video-controller-2 on 2026-11-14 at 12:36 UTC (the hand-off is
`handoffs/HANDOFF-2026-11-14-ai-peer-video-controller-2.md`); by 12:44 UTC it had read in, found
every session alive, told the workers its name and started its waits.

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

**Usage alarm (read 12:34 UTC):** week (all models) 20%, week (Fable) 39%; one hour earlier 10%
and 19%; 0% at 10:10 UTC. The video burns about 10% of the whole week and 20% of Fable's week
an hour. The week resets Monday 17 November 04:30 India time. At this pace Fable ends at about
15:30 UTC and the whole week at about 20:30 UTC today, which would also stop Learn Like Magic's
sessions. Manish was asked (Needs Manish 1). Context at 12:34 UTC: the controller 40%, WP2-2
25%, WP3 33%.

**Read again by ai-peer-video-controller-3:** 12:37 UTC week 20%, Fable 40%; 12:40 UTC week
22%, Fable 42%. A usage alarm now runs (the "Still running" table): it reads `/usage` every 5
minutes at no token cost and writes one line each time to
`~/.ai-peer/demo-video-private/controller/usage.log`; read the hourly rate from there (its
last line now: `2026-11-14T12:41:07Z week=22 fable=44 session=?`). Context at 12:44 UTC, from the transcripts: controller-3
14%, WP2-2 32%, WP3 38%, the old WP2 46%. When
Fable's week runs out, every Fable session stops at its next request at a dialog that needs a
key press ("Switch to Opus 5.5 and continue", or "Continue with Fable" on credits). `DESIGN.md`
C6 already says Opus 5.5 at max effort when Fable runs short, so every session launched from
now on runs on Opus 5.5 (the controller's call under C6; to undo it, launch with
`--model claude-fable-5-2`).

**The usage log at 12:54 UTC:** `2026-11-14T12:51:24Z week=25 fable=49 session=?`. From 12:34 to 12:46 UTC the week went from 20%
to 24% and Fable's from 39% to 47%: twice the earlier pace, over 12 minutes that hold
controller-3's read-in and controller-2's hand-off. If it stayed there, Fable's week would end
at about 14:05 UTC and the whole week at about 16:30 UTC (rough: the readings are whole
percents). A seventh wait, `fable-cap`, sends Manish an Attention line when Fable's week
reaches 96%, because a session stopped at the dialog cannot.

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
| ai-peer-video-controller-3 | 3973 | https://claude.ai/code/session_01Nfn5h8g3cWzARgY2jkzyPF | `~/repos/ai-peer-hackathon-2026` (docs only) | main | none | The live controller; Fable 5.2, max effort, PID 12154 |
| ai-peer-video-controller-2 | 3964 | https://claude.ai/code/session_01Nfn5h7PShJsTBPY7urCJaZ | the same checkout | main | none | Handed off at 12:36 UTC; nothing of its own still runs (no child process, its one helper ended); PID 49247. Manish was asked the usage question in this window too, so it stays open until he has answered; then the controller closes it after the usual checks (a script launched it, not Manish). |
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
| One helper still runs (the Earth close; the music and sound helper ended, its report is on `main` at `86c32f7`) of the two helpers of the old ai-peer-video-wp2 session, which write only their own files in `~/repos/ai-peer-video-wp2`: the Earth close (`src/scenes/earth.js`, `assets/earth/`) and music with sound effects (`audio/music/`, `audio/sfx/`, `audio/mix.json`, `audio/SOURCES.md`, `demo-video/ledger/wp2.csv`) | inside window 3963 | none | They end by themselves |
| Wait `draft1`: Draft 1's file `~/.ai-peer/demo-video-private/renders/draft-01.mp4` unchanged for 90 s, or PID 88331 (WP2-2) gone | 22594 | `~/.ai-peer/demo-video-private/controller/waits.log` | `kill 22594` |
| Wait `wp3-report`: `demo-video/shots/REPORT.md` in `~/repos/ai-peer-video-wp3` unchanged for 90 s, or PID 64734 (WP3) gone | 22607 | the same log | `kill 22607` |
| Wait `stall-wp2-2`: the transcript of WP2-2 (`3b59da85-1a19-4cc4-9875-244a8d19e09d`) and its sub-agents silent for 25 minutes | 22623 | the same log | `kill 22623` |
| Wait `stall-wp3`: the same for WP3 (`1c97ea6b-c294-42be-ae5e-8c9d772564bf`) | 22665 | the same log | `kill 22665` |
| Wait `stall-wp2`: the same for the old WP2 and its two helpers (`c5e26ecb-e51c-4042-9605-b280dbe83c04`) | 22682 | the same log | `kill 22682` |
| Wait `usage`, the usage alarm: `demo-video/tools/usage-check.sh 55 28` every 5 minutes; it ends when Fable's week reaches 55% or the whole week 28%, and the controller then starts it again at the next mark | 22693 | the same log; the readings in `~/.ai-peer/demo-video-private/controller/usage.log` | `kill 22693` |
| Wait `fable-cap`: `usage-check.sh 96 200` every 10 minutes; when Fable's week reaches 96% it sends Manish an Attention line (press Enter on the dialog in windows 3972, 3968, 3963, 3973) and ends | 38756 | the same log | `kill 38756` |

The seven waits are runs of `demo-video/tools/wait-for.sh` (its header shows the usage) in the
background of ai-peer-video-controller-3, started at 12:40 UTC: the end of one wakes that
session, and each sends one routine Telegram line. Their PIDs are also in
`~/.ai-peer/demo-video-private/controller/<label>.pid`. A successor stops them and starts its
own. The usage alarm's test is `demo-video/tools/usage-check.sh` (its header shows the usage).

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
| 2026-11-14 | fal.ai (WP3, running) | Stills for the nine shots, four looks for the double, a cheap moving draft of all nine | $19.04 so far (85 rows of `demo-video/ledger/wp3.csv` in its worktree, summed by the controller at 12:54 UTC; $7.90 at 12:34 UTC) |
| 2026-11-14 | fal.ai (WP2's music and sound helper, finished) | The music bed (one take of Google's Lyria 3.5) and nine sound effects | $0.94 (8 rows of `demo-video/ledger/wp2.csv`, in WP2's worktree until ai-peer-video-wp2-2 commits it) |
| | **Total of the $100 cap** | | **$26.57** (the three ledgers summed at 12:54 UTC; WP1's 21 rows give $6.60) |

## Needs Manish

Nothing blocks the build. **His standing word (2026-11-14 12:23 UTC, in the controller's session): "Wherever
you need my choice, send it to me on telegram. I ll review there and reply here"** (`DESIGN.md`
V11, C12). So every choice goes to the Attention group with its files
(`demo-video/tools/tg-send-file.sh`), and he answers in the session. The three choices below
were sent there again with their material at that time: the three voice samples and the
animatic, WP1's side-by-side clip, the sheet of four looks and WP3's two key frames.

1. **Asked 2026-11-14 12:36 UTC** (Telegram Attention group and the session): usage. The video uses
   about 10% of the week's Claude allowance an hour (20% of Fable's). A (recommended): finish
   Draft 1 tonight with what runs now, then pause the workers; new sessions on Opus 5.5 from
   now; one worker at a time after Draft 1. B: keep full speed and move the video to another
   subscription when this one runs out. C: stop now and go on after Monday's reset. He answers
   in the session of ai-peer-video-controller-3 (window 3973), which repeated the question to
   him in its first reply and, with its session link, on the Attention group. Not answered at 12:44 UTC.
   The line "Let's go with A" in the input box of window 3964 is Claude Code's own suggested
   prompt, not his answer: that transcript holds no `user` record after the question.
1a. **Answered 2026-11-14 12:33 UTC**, in the controller's session: "Let's go with your
   recommendations". So: voice 1, Matilda (V12); the rise by route O (V13, with the controller's
   reading that the shot-maker may fall back to a route that holds his face and the threads);
   the look B, threads of light (V14). WP3 was told by message; nothing changes for WP2-2
   (voice 1 is what the film already uses).
2. Still to come, one at a time, each sent to Telegram with its material (V11): (a) may the old controller's window (2952) be closed; (b) a
   look at the fal.ai credit, which no key can read: WP3 may spend up to $60 (told to him at
   the take-over); (c) the recordings from his company laptop by Tuesday 17 November morning,
   India time, into `~/.ai-peer/demo-video-private/` (the list is in `PLAN.md`; told to him
   2026-11-14 11:28 UTC); (d) Draft 1; (e) **the music's licence wording** (raised by
   ai-peer-video-wp2, read by the controller at 12:54 UTC in
   `handoffs/HANDOFF-2026-11-14-ai-peer-video-wp2-2-helpers.md`, "The terms"): the music bed is
   one take of Google's Lyria 3.5 bought through fal.ai. fal.ai marks the model "Commercial use"
   and grants use "for your own personal or internal business use". The published words do not
   say that the customer owns the music, whether "your own" use covers a film shown inside his
   employer from his own fal.ai account, or which of Google's terms reach fal.ai's customers.
   Recommended: use it for the internal hackathon film and look again before any public
   release. The other choice: a bed made fully by code, with no licence question and a plainer
   sound (not made yet). It does not block Draft 1; it is asked after the usage answer; (f) his
   ear on the music when Draft 1 comes (nobody has heard it): the joins at 54, 72, 74 and 90
   seconds and the end accent at 116; a plainer cut, `bed-alt-1.wav`, is ready as a fallback.

## Next

0. **Usage first.** Until Manish answers (Needs Manish 1): start no helper that Draft 1 does
   not need, and read the usage log at every event. New sessions run on Opus 5.5 (C6). Before
   Fable's week runs out (at about 85%), move what still runs off Fable, so that no window
   stops at the dialog with nobody to press a key: each session finishes its step and hands
   off to an Opus 5.5 successor, the controller too. Whole week at 93%: start nothing long; at
   95%: every session finishes its step, hands off and stops.
1. WP3 goes on: tag tracks and screen corners for the three double drafts, then finals of the
   six shots without the double, then `reveal-rise`, `reveal-desk`, `morning-nod`. Each final
   of the two reveal shots: look, show Manish. Pass on Manish's answers about the rise (K, O
   or P) and the double's look as soon as they come. Watch the money: WP3 reports its ledger
   total in each message and on passing $30. Its hook mouths are driven by WP2's sound but
   the sync is not yet checked frame by frame.
   ai-peer-video-wp2's music and sound helper has ended; its report is on `main` (commit
   `86c32f7`, checked by the controller at 12:54 UTC). Its Earth helper still runs, and that
   report follows as `handoffs/HANDOFF-2026-11-14-ai-peer-video-wp2-2-helpers-earth.md`. When
   ai-peer-video-wp2 says that file is on `main`: check it, then close window 3963 after the
   usual checks. WP3 was at 38% context at 12:44 UTC: it hands off at 45 to 50% and tells the
   controller. Its successor `ai-peer-video-wp3-2` is not needed for Draft 1, so it is launched
   (on Opus 5.5, the way WP2-2 was) only after Manish's answer on usage.
2. Manish's three answers are in (`DESIGN.md` V12 to V14) and passed on. Show him the final of
   `reveal-rise` when WP3 has it (Telegram, V11).
   ai-peer-video-controller-3 hands off at 45 to 50% context (see "Where we are" for its last
   reading): its successor is ai-peer-video-controller-4.
3. Draft 1 from ai-peer-video-wp2-2: look at a frame at every cut, then send it to Manish.
4. Sum the ledgers (`demo-video/ledger/*.csv`) into "Money spent" at each package's end; tell
   Manish at $50 and at $80.
5. ai-peer-video-controller-1 has nothing left. Manish opened its window (2952) himself: ask him
   before closing it. ai-peer-video-controller-2 (window 3964) has nothing left either: close
   it after the usual checks once Manish has answered the usage question.

## Settled, do not re-open

- See `DESIGN.md` section 0.

## Lessons

- **Usage: four or five max-effort sessions that read pictures burn about 10% of the week an
  hour** (measured 10:10 to 12:34 UTC on 14 November: 0% to 20%, Fable 39%), twice to five
  times the usual. Mechanism: every picture, every long read and every helper is paid again on
  each later call of that session, and a 300k-token helper counts in full. Read `/usage` at
  every event, not only at milestones, and say the hourly rate in the hand-off.
- **A session's context fills in about an hour here** (controller-2: 9% to 40% in 65 minutes;
  WP2: 13% to 45% in 45 minutes; WP3: 24% after 15 minutes). Mechanism: full-size pictures and
  long thinking inside one turn. Look at one small sheet per event and plan each package as two
  or three sessions from the start.
- **Text on Telegram is not the material.** The first three choices went to Manish as files in
  the session and one text line on Telegram; he asked for the choice itself on Telegram (V11).
  The notify scripts send text only: `demo-video/tools/tg-send-file.sh` sends the file.
- **A worker's script and a controller's shared doc can disagree within minutes.** `SHOTS.md`
  was written with its own lines for the colleagues while WP2 had already recorded different
  ones. Mechanism: the controller wrote from the story, not from the worker's files. Read the
  live worker's files before fixing an interface in a doc.
- **A brief can be checked after the launch when minutes matter:** the helper's twelve
  corrections reached WP3 twelve minutes into its work, as one message plus a facts file
  (`research/fal-facts-2026-11-14.md`), before its first dear call. The check found a default
  (Kling renders 1080p at one and a half times the price) that the pricing API hides.

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
| 2026-11-14 12:23 | ai-peer-video-controller-2 | Manish, in the session: "Wherever you need my choice, send it to me on telegram. I ll review there and reply here" (V11). The notify scripts send text only, so the controller wrote `demo-video/tools/tg-send-file.sh` (the Bot API's file calls, token kept out of the argument list, files under `~/.ai-peer/` refused) and sent all three open choices to the Attention group with their material: 3 voice samples, the animatic, the clone clip, 3 pictures of the double's look; 8 files, all accepted by Telegram. | Waiting on his three answers, in the session |
| 2026-11-14 12:33 | ai-peer-video-controller-2 | Manish answered the three choices in the session: "Let's go with your recommendations" (V12 voice 1; V13 the rise by route O; V14 the look B, threads of light). The controller told him how it reads the answer on the rise (O first, a fall-back if O loses his face or the threads) and passed the answers to WP3 by message. | The look, the voice and the route are settled |
| 2026-11-14 12:36 | ai-peer-video-controller-2 | Usage read at 12:34 UTC: week 20%, Fable 39% (10% and 19% an hour earlier): asked Manish what to do, with a recommendation. Context at 40%: wrote `handoffs/HANDOFF-2026-11-14-ai-peer-video-controller-2.md`, stopped its three waits, started ai-peer-video-controller-3 in this repo. WP3's ledger stood at $7.90 (52 rows). | Handed off; this session only passes on anything Manish writes in it |
| 2026-11-14 12:44 | ai-peer-video-controller-3 | Took over from ai-peer-video-controller-2: read STATE and the hand-off (context 14% at this row's time); found all five sessions alive (PIDs 88331, 64734, 48241, 49247, 38022); told WP2-2, WP3 and the old WP2 its name; started six waits (Draft 1, WP3's report, three stall watches, and a usage alarm with the new `demo-video/tools/usage-check.sh`). Usage: 12:37 UTC week 20%, Fable 40%; 12:40 UTC week 22%, Fable 42%. Repeated the usage question to Manish in its first reply. Its call under C6: sessions launched from now on run on Opus 5.5. | Live controller; waits armed; the usage answer is open |
| 2026-11-14 12:54 | ai-peer-video-controller-3 | ai-peer-video-wp2 reported its music and sound helper done: the report is on `main` (`86c32f7`, checked), the Earth helper still runs, so window 3963 stays open. Read the report's licence part: one more question for Manish, queued behind usage (Needs Manish 2e). Summed the three ledgers: $26.57 of $100 (WP1 $6.60, WP3 $19.04 in 85 rows, WP2 $0.94). Usage log: `2026-11-14T12:51:24Z week=25 fable=49 session=?`. Armed a seventh wait, `fable-cap`. | Recorded; the usage answer is still open |
