# AI Peer demo video: state

Live controller: ai-peer-video-controller-3 (Terminal window 3973 on Mac 48 GB, PID 12154,
https://claude.ai/code/session_01Nfn5h8g3cWzARgY2jkzyPF). Other sessions message it by that
name. It took over from ai-peer-video-controller-2 on 2026-11-14 at 12:36 UTC (the hand-off is
`handoffs/HANDOFF-2026-11-14-ai-peer-video-controller-2.md`); by 12:44 UTC it had read in, found
every session alive, told the workers its name and started its waits.

## Where we are (2026-11-14 14:51 UTC)

**Draft 2 is being built.** Manish watched Draft 1 (his words, 14:15 UTC:
`FEEDBACK-DRAFT-1-2026-11-14.md`; V16): the story, the voice and the music stay. At 14:49 UTC he
approved the controller's proposal for the hook with two changes (V17): the employee is called
Ram, and colleague 2 says he is out of office. ai-peer-video-wp2-3 (window 3974, Opus 5.5) has
the whole order by message: the new lines and the name, the message cards, the hook at about
15 seconds, the quicker signature shot, a note on the real recordings, paid calls up to $10
for three re-recorded lines and two new lip-sync clips, then Draft 2 in both renders. Its
round 3 is merged (PR 10, `974b9db`): the Earth's final version, a NASA credit on the end
card, and the colour check, which changed nothing.

**Draft 1 exists and is with Manish.** WP1, WP2 and WP3 are done and merged (PRs 7, 9 and 8).
The film is built by code in `demo-video/film/` (one command renders it; read
`demo-video/film/REPORT.md`), with all nine AI shots in their final versions. Draft 1 has two
renders, each 2:00.0 at 1920x1080: (1) the full film, on this Mac only,
`~/.ai-peer/demo-video-private/renders/draft-01.mp4`; its product screens come from the
stand-in recordings of 5 to 7 November and it carries the sound of a live test meeting, so no
session sends it anywhere (C8; C12 allows only a draft that holds nothing but the demo-data
stand-ins of 6 November, and `product.json` names a meeting recording of 7 November); (2) the
same film with slates in place of the four product screens, in git,
`demo-video/film/renders/draft-01-slates.mp4`. The controller looked at one sheet of the
slates copy (30 frames, every 4 s) and sent that copy to Manish at 13:36 UTC: the Attention
group and the session, each as a 720p copy (the 1080p file is over the session's 30 MiB limit).
About half of that copy is slates (the proof part, 0:30 to 1:30, and the morning brief), so he
was told to watch the full film on this Mac or to tell the controller to send it. Nobody has
watched the film move or heard it. Sessions: the controller and, since 14:07 UTC, one worker,
ai-peer-video-wp2-3, on Opus 5.5 (Manish's answer on usage, V15: "one worker at a time, on
Opus 5.5"). It does the Earth's final version and the colour check, then stops and reports;
Draft 2 is rendered after his feedback on Draft 1. The old ai-peer-video-wp2 was closed at
13:42 UTC, once its Earth helper's report was on `main`. What comes
next is Manish's: his view of Draft 1 and his answer on usage. His feedback round, the Earth's
final version, the colour check and the final cut go to a new session, ai-peer-video-wp2-3
(brief `handoffs/HANDOFF-2026-11-14-ai-peer-video-wp2-3.md`), on Opus 5.5.

Earlier (written 11:54 UTC, kept for the story so far): day one. Manish asked for a 2-minute "wow" demo video (`BRIEF-2026-11-14.md`). The interview is
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

**The usage log at 13:07 UTC:** `2026-11-14T13:07:41Z week=29 fable=58 session=?`. From 12:51 to 13:06 UTC the week rose 4 points
and Fable's 8: about 16% and 32% an hour. At that pace Fable's week ends at about 14:25 UTC
and the whole week reaches 93% at about 17:05 UTC. Outlook: Draft 1 should come first.
ai-peer-video-wp2-2 already has WP3's two reveal finals in the film and waits only for the
Earth helper's report before its two Draft 1 renders (its screen, 13:07 UTC). WP3 (45%
context) and the old WP2 (48%) are about to hand off and be closed, and no successor starts
before Manish's answer, so after Draft 1 only the controller is left and the burn stops by
itself. If Draft 1 is not rendered when Fable's week reaches 75% (the alarm), the controller
decides then between a hand-off of WP2-2 to an Opus 5.5 successor and Manish's key press.

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
| ai-peer-video-wp2-3 | 3974 | not read yet: find it by its name in the Claude app | `~/repos/ai-peer-video-wp2` (launched in the shared checkout, with `CLAUDE_NO_IDLE_PING=1`) | a new branch from `origin/main`, made by the worker | none yet | WP2, round 2: the Earth's final version with a NASA credit line, the colour check of six AI clips, then stop and report; Manish's feedback on Draft 1 reaches it by message; brief `handoffs/HANDOFF-2026-11-14-ai-peer-video-wp2-3.md` plus the Earth report; Opus 5.5 (`claude-opus-5-5[1m]`), max effort, PID 16635, transcript `d1cb4441-b9a9-4aa3-ba40-ccfe560894d3`. No helper without the controller's yes (C13). |
| ai-peer-video-controller-1 | 2952 | https://claude.ai/code/session_01Nfn5h5eNL9YLJMnBQpKKMf | the same checkout | main | none | Handed off at 11:30 UTC; nothing of its own still runs. Its second-by-second watch of the September film is `DRAFT07-WATCH.md` (committed by controller-2). Other sessions message it as `learnlikemagic-f7`; PID 38022. Manish opened its window himself: ask him before closing it. |

Closed: ai-peer-video-wp1 (window 3962, PID 41753), by the controller at 11:52 UTC after its
report, with its screen idle, no child process, no sub-agent and a clean, merged worktree
(`~/repos/ai-peer-video-wp1`, kept). ai-peer-video-wp3 (window 3968, PID 64734), by
ai-peer-video-controller-3 at 13:23 UTC after its closing message: PR 8 merged (`839a455`,
13:20 UTC), its screen idle, its only child `caffeinate`, its three sub-agents ended. Its
worktree `~/repos/ai-peer-video-wp3` is kept for WP2 (84 uncommitted paths: unused raw takes).
Its scratchpad (678 files, 481 MB of working frames, sheets and tool tests) was left where it
is, under `/private/tmp/claude-501/`, until the Mac clears it. ai-peer-video-wp2-2 (window 3972,
PID 88331), by ai-peer-video-controller-3 at 13:36 UTC after its report: PR 9 merged
(`1813ac4`), its screen idle, no child process, no sub-agent, its successor's brief on `main`.
The worktree `~/repos/ai-peer-video-wp2` is kept and must not be cleaned: it holds, outside
git on purpose, the Earth helper's working `earth.js` and five unused music takes, and the
old WP2's Earth helper wrote there until it was stopped. Its scratchpad (97 files, 38 MB) was
left in place. ai-peer-video-wp2 (window 3963, PID 48241), by ai-peer-video-controller-3 at
13:42 UTC after its message: the Earth helper's report on `main` (`b0003cd`), its screen
idle, its only child `caffeinate`, both sub-agents ended; its scratchpad (3,035 files, 325 MB)
left in place. ai-peer-video-controller-2 (window 3964, PID 49247), by
ai-peer-video-controller-3 at 14:06 UTC, once Manish had answered the usage question in
controller-3's session: its screen idle since its hand-off, no child process, its one
sub-agent ended, no `user` record after its question.

Still running:

| What | PID | Log | Stop command |
|---|---|---|---|
| Wait `usage`, the usage alarm: `demo-video/tools/usage-check.sh 75 40` every 5 minutes; it ends when Fable's week reaches 75% or the whole week 40%, and the controller then starts it again at the next mark | 54452 | `~/.ai-peer/demo-video-private/controller/waits.log`; the readings in `~/.ai-peer/demo-video-private/controller/usage.log` | `kill 54452` |
| Wait `fable-cap`: `usage-check.sh 96 200` every 10 minutes; when Fable's week reaches 96% it sends Manish an Attention line (press Enter on the dialog in window 3973, the controller's) and ends | 10957 | `~/.ai-peer/demo-video-private/controller/waits.log` | `kill 10957` |
| Wait `stall-wp2-3`: the transcript of ai-peer-video-wp2-3 (`d1cb4441-b9a9-4aa3-ba40-ccfe560894d3`) and its sub-agents silent for 25 minutes, or PID 16635 gone | 16989 | `~/.ai-peer/demo-video-private/controller/waits.log` | `kill 16989` (stop it before closing that worker's window) |
| Wait `draft2`: Draft 2's file `~/.ai-peer/demo-video-private/renders/draft-02.mp4` unchanged for 90 s | 32385 | `~/.ai-peer/demo-video-private/controller/waits.log` | `kill 32385` |

The four waits (`usage`, `fable-cap`, `stall-wp2-3`, `draft2`) are runs of `demo-video/tools/wait-for.sh` (its header shows the usage) in the
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
- WP2, the film in code and Draft 1 (`ai-peer-video-wp2`, then `ai-peer-video-wp2-2`, now
  `ai-peer-video-wp2-3`; briefs `handoffs/HANDOFF-2026-11-14-ai-peer-video-wp2.md`, cap $10, and
  `handoffs/HANDOFF-2026-11-14-ai-peer-video-wp2-3.md`): **Draft 1 done**, merged as PR 9
  on 2026-11-14 13:31 UTC (merge commit 1813ac4). Spent $0.94 (8 calls, all music,
  `demo-video/ledger/wp2.csv`). The full film: `~/.ai-peer/demo-video-private/renders/draft-01.mp4`
  (this Mac only; 2:00.0, 114.5 MB). The same with slates for the product screens:
  `demo-video/film/renders/draft-01-slates.mp4` (in git, 40.2 MB). Read
  `demo-video/film/REPORT.md`. Both: -14.1 LUFS, each line at least 15 dB above the music,
  speech-to-text 15 of 15, a frame at every cut looked at; nobody has heard it or watched it
  move. All nine AI shots are WP3's finals. **Round 3 done** (ai-peer-video-wp2-3), merged as
  PR 10 on 2026-11-14 14:19 UTC (merge commit 974b9db), no money spent: the Earth close is its
  final version (`film/src/scenes/earth.js`; the snapshot deleted, `scene_file` dropped,
  `film/assets/earth/SOURCE.md` in git); the end card names NASA as the source of the Earth
  imagery (a small line from 1:58.0); seen in a render of the close part and one sheet of 1:48
  to 2:00. The colour check: no change (all nine clips are untagged and the film reads them all
  one way; the two possible readings differ by a mean delta E of 1.1 to 1.8, visible only side
  by side, and the pixels cannot show which is right; the numbers and a one-line fix are in
  `REPORT.md`, "Round 3"). Draft 1's two renders still carry the snapshot: the next full render
  brings the final close in. **Open:** (1) Manish's feedback on Draft 1, then Draft 2; (2) the
  music's licence wording, for Manish (the four points are in the report); (3) the Earth's
  polish list (the report's "Round 3" and the helper's report), first the plain boxes at 1:48.7
  and the fast streak at 1:49.0 to 1:49.7, which may shimmer in motion. `ai-peer-video-wp2-3`
  waits for the controller with Manish's feedback (context 18% at 14:19 UTC).
- WP3, the nine AI shots with people (`ai-peer-video-wp3`, brief
  `handoffs/HANDOFF-2026-11-14-ai-peer-video-wp3.md`, cap $60): **done**, merged as PR 8 on
  2026-11-14 13:20 UTC (merge commit 839a455). Spent $23.10 (95 calls, `demo-video/ledger/wp3.csv`).
  All nine slots are final in `demo-video/shots/manifest.json` (WP2 reads the copy in
  `/Users/manishjain/repos/ai-peer-video-wp3`, which stays). Read `demo-video/shots/REPORT.md`; look at
  `demo-video/shots/all-shots.jpg`. The double is look B, threads of light. The two reveal shots and
  the nod are on route K (Kling, key frames; route O lost his face mid-rise), the other six on
  MiniMax H3 Max Turbo, with the colleagues' mouths following WP2's recordings. Open for the
  controller: no clip was watched in motion or heard; the delivered files carry no colour tag (the
  report says what to check); the tap in `morning-brief` and the nod are small.

## Money spent

| Date (UTC) | Tool | What for | Amount |
|---|---|---|---|
| 2026-11-14 | fal.ai (WP1, finished) | Pictures of three possible employees, the night-room frames, and the clone shot by three routes (Kling 4.0, Gemini Omni Flash, two plates and code) | $6.60 (21 rows of `demo-video/ledger/wp1.csv`; about 4 cents above fal.ai's own bill, its report says) |
| 2026-11-14 | fal.ai (WP3, finished) | Stills, the look of the double, a moving draft and the final of each of the nine AI shots, with upscaling and lip-sync | $23.10 (95 rows of `demo-video/ledger/wp3.csv`, on `main` since PR 8) |
| 2026-11-14 | fal.ai (WP2, finished: only its music and sound helper spent) | The music bed (one take of Google's Lyria 3.5) and nine sound effects | $0.94 (8 rows of `demo-video/ledger/wp2.csv`, on `main` since PR 9) |
| | **Total of the $100 cap** | | **$30.63** (the three ledgers on `main`, summed at 13:37 UTC: WP1 $6.60, WP3 $23.10, WP2 $0.94) |

## Needs Manish

**Answered 2026-11-14 14:49 UTC: the new hook (V17).** "Sure, the proposals look good", with the
name Ram instead of John and "out of office" in colleague 2's line; the order went to
ai-peer-video-wp2-3 at once.

**Asked at 14:51 UTC (the session and the Attention group): the music's licence wording**
(item 2e below has the quoted terms). The music stays (V16), so: A (recommended), use it for the
internal hackathon film and look again before any public release; B, replace it with a bed
made fully by code, with no licence question and a plainer sound. He had asked "Is there
anything else you need from me?" and was also told, as reminders with no answer needed: his
recordings by Tuesday 17 November morning (the meeting from a participant's screen in gallery
view); a look at the fal.ai credit, which no key can read ($30.63 spent, about $10 more for
Draft 2); and that the first controller's idle window 2952 can be closed when he says so.
If he ever says "send the full film", that is his word on C8 and C12: record it in `DESIGN.md`
section 0 before sending.

Nothing blocks the build. **His standing word (2026-11-14 12:23 UTC, in the controller's session): "Wherever
you need my choice, send it to me on telegram. I ll review there and reply here"** (`DESIGN.md`
V11, C12). So every choice goes to the Attention group with its files
(`demo-video/tools/tg-send-file.sh`), and he answers in the session. The three choices below
were sent there again with their material at that time: the three voice samples and the
animatic, WP1's side-by-side clip, the sheet of four looks and WP3's two key frames.

1. **Answered 2026-11-14 14:01 UTC, in the session of ai-peer-video-controller-3: "one worker at a time, on Opus 5.5"** (option A; `DESIGN.md` V15 and C13). The question, asked 2026-11-14 12:36 UTC (Telegram Attention group and the session): usage. The video uses
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

**Now (14:51 UTC):** one worker runs, ai-peer-video-wp2-3 (window 3974, Opus 5.5), on
Draft 2 (the order is in "Where we are" and in V17). (i) When its message or the wait `draft2`
comes: look at one small sheet of the slates render (`draft-02-slates.mp4`), check the hook
(the name, the two new lines, the cards), the quicker reveal and the close, then send the
slates copy to Manish (Attention group and session, 720p) and say what to listen for: the two
new lines, how "Ram" is spoken, the quicker rise. (ii) Sum its ledger into "Money spent".
(iii) Record his answer on the music's licence when it comes. (iv) One worker at a time (C13):
start no other session while 3974 is live; if it reports 40% context before the renders, plan
its successor (ai-peer-video-wp2-4, Opus 5.5) with it. The numbered items below are older and
mostly done; 0, 4, 5, 6 and 7 still hold.

0. **Usage (V15, C13).** One worker at a time, on Opus 5.5; a worker starts no helper unless
   the controller agrees; read the usage log at every event. The controller (Fable 5.2) hands
   off to an Opus 5.5 successor at 45 to 50% context, or sooner if Fable's week nears its end
   (the wait `fable-cap` warns Manish at 96%). Whole week at 93%: start nothing long; at 95%:
   every session finishes its step, hands off and stops.
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
   usual checks. WP3 reported (read at 13:19 UTC) that all nine slots are final in its manifest and
   pushed (branch head `ec45cad`, draft PR 8 open and mergeable), and that it finishes at 48%
   context without a successor: its tools helper's last report, the merge of PR 8, its line
   here, a closing message. The controller saw the sheet of all nine (`all-shots.jpg`, one
   picture at 1000 pixels) and the nine final files named in the manifest, and passed WP3's
   notes to ai-peer-video-wp2-2 (each colleague's `line_at_s` and `use_from_s`, `tap_at_s`
   4.04 for `morning-brief`, `reveal-rise` v2 with the phone lighting up by code). **WP3 is done:** PR 8
   merged (`839a455`), its window closed by the controller (see "Closed"). By WP3, what Manish's eyes should judge
   first: the tap in `morning-brief` is small and quick, the nod is small, the eyebrows in
   `hook-1` are lively, and nobody has watched a clip in motion or heard it.
2. Manish's three answers are in (`DESIGN.md` V12 to V14) and passed on. Show him the final of
   `reveal-rise` when WP3 has it (Telegram, V11).
   **Shown at 12:55 UTC** (the Attention group, two clips; the final also in the session):
   `reveal-rise-final-v1.mp4` in `~/repos/ai-peer-video-wp3/demo-video/shots/reveal-rise/`,
   made by route K, which is V13's fall-back: WP3 reports that the route O take turns the
   double into a different-looking man between 2 and 4 s with the threads hardly showing, and
   the controller saw that on one small sheet (the final's eight frames above three frames of
   the O take). The O take went along for comparison. He was told that no answer is needed
   and that silence keeps the take. Still weak, by WP3: the phone is lit from the first frame
   (a v2 with the light-up by code is coming); the tag is off while he bends to stand (7.3 to
   7.8 s); judged from frames, not in motion. WP3 goes on to `reveal-desk` from this clip's
   last frame.
   **`reveal-desk` shown at 13:01 UTC** (the Attention group and the session):
   `reveal-desk-final-v1.mp4` in `~/repos/ai-peer-video-wp3/demo-video/shots/reveal-desk/`,
   route K, first take, from the rise's real last frame; the controller looked at its sheet
   (the threads let go, he walks to the desk, sits, opens the laptop, the glow holds). No
   answer needed; silence keeps the take. Still weak, by WP3: blurred and pale for a few
   frames as he sits (about 5.5 s) with a dark shadow on the wall; the laptop screen is small
   in the wide frame, so the push-in leans on the 4K still in the manifest. WP3's notes for
   WP2 (use_from_s 1.04, the screen quad, the tag on for the first 3 s only, a 6-frame
   dissolve at the join) were passed to ai-peer-video-wp2-2 by message.
   ai-peer-video-controller-3 hands off at 45 to 50% context (see "Where we are" for its last
   reading): its successor is ai-peer-video-controller-4.
3. Draft 1 from ai-peer-video-wp2-2: look at a frame at every cut, then send it to Manish.
4. Sum the ledgers (`demo-video/ledger/*.csv`) into "Money spent" at each package's end; tell
   Manish at $50 and at $80.
5. ai-peer-video-controller-1 has nothing left. Manish opened its window (2952) himself: ask him
   before closing it. ai-peer-video-controller-2 (window 3964) has nothing left either: close
   it after the usual checks once Manish has answered the usage question.
6. Open points from WP3's closing message (none blocks Draft 1; they belong to the final cut):
   (a) colour: none of the nine delivered files carries a colour tag; Kling's raw files are
   BT.709, MiniMax's and the upscaler's are untagged and the MiniMax drafts fitted BT.601
   better, so a browser may show the six MiniMax shots slightly off: compare one in the render
   with its still (`hook-1` against `demo-video/shots/stills/hook-1.png`); passed to
   ai-peer-video-wp2-2. (b) The join from `reveal-rise` to `reveal-desk` is a match on the
   standing pose: a 6-frame dissolve hides it. (c) `reveal-rise`'s tag track is now
   `tag-track-final-v2.json` (on at 1.67 s); in `morning-nod` the tag fades out with the double
   between 3.3 and 4.3 s; passed to ai-peer-video-wp2-2. (d) About 98 unused raw takes sit
   uncommitted in WP3's worktree.
7. The Earth close, from the old ai-peer-video-wp2's last message (its report is on `main`,
   `b0003cd`), for ai-peer-video-wp2-3: (a) the helper's final scene is
   `demo-video/film/src/scenes/earth.js` in `~/repos/ai-peer-video-wp2`, modified and not
   committed, every development switch off; the film still draws the older snapshot because
   `shots.json` pins the slot `close-earth` to `src/scenes/earth-draft1.js`. To switch the
   final on: remove that field, delete `earth-draft1.js`, render `--part close`, look, commit
   `earth.js`. (b) `demo-video/film/assets/earth/SOURCE.md` (the NASA sources) is not in git,
   and NASA asks to be named: the film needs a credit line, none is on screen yet. (c) Left to
   polish, in order: render time (0.2 to 0.5 s a frame against a 0.1 s aim), the grain that
   makes files huge (149 MB for the 12 s), the plain boxes at 108.7 to 108.9, the room, a
   faint square at 109.1, the mint glow, the stars; not checked by anyone: flicker at full
   size, banding after the delivery encode. (d) The pull-out starts in Bengaluru, the helper's
   pick; the employee's city was never fixed. The controller's call: keep Bengaluru as the default
   (nothing in the film names his city; correction: an earlier wording gave a reason the
   controller had not checked); Manish was told, and another city is one setting to change.

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
| 2026-11-14 12:55 | ai-peer-video-controller-3 | WP3 reported the final of `reveal-rise` (route K, V13's fall-back; its ledger $18.86, 84 calls). Looked at one small sheet, then sent the final and the route O take to Manish on the Attention group and the final in the session: no answer needed, silence keeps the take. Context: controller-3 17%, WP2-2 37%, WP3 41% at 12:54 UTC. | Shown; WP3 goes on to `reveal-desk` |
| 2026-11-14 13:01 | ai-peer-video-controller-3 | WP3 reported the final of `reveal-desk` (route K; its context 43%, it hands off at about 45% once its three helpers have reported). Looked at its sheet, sent the clip to Manish (Attention group and the session) at 13:01 UTC, passed WP3's notes for the push-in to ai-peer-video-wp2-2. Ledgers summed: $29.27 of $100 (WP3 $21.74 in 91 rows). Usage log: `2026-11-14T12:56:29Z week=26 fable=52 session=?`. | Shown; the usage answer is still open |
| 2026-11-14 13:07 | ai-peer-video-controller-3 | The usage alarm fired: `2026-11-14T13:07:41Z week=29 fable=58 session=?`. Re-armed it at Fable 75% or week 40%. Read WP2-2's screen: the two reveal finals are in the film with tag, push-in and sound; it waits for the Earth helper, then renders Draft 1 twice. Contexts at 13:07 UTC: controller-3 19%, WP2-2 41%, WP3 45%, the old WP2 48%. Manish has not answered the usage question. | Waiting for Draft 1 |
| 2026-11-14 13:19 | ai-peer-video-controller-3 | WP3 reported all nine AI shots final and pushed, no successor needed. Looked at the sheet of all nine, checked the manifest (nine final files) and PR 8 (open, draft, mergeable, `ec45cad`), told ai-peer-video-wp2-2 to use them in Draft 1 if it fits its context line. The wait `wp3-report` ended by itself at 13:18 UTC (correction: an earlier wording said the controller stopped it). Ledgers summed: $30.63 of $100 (WP3 $23.10 in 95 rows). Usage log: `2026-11-14T13:17:56Z week=31 fable=61 session=?`. | WP3 is finishing; Draft 1 awaited |
| 2026-11-14 13:20 | ai-peer-video-wp3 | WP3 done: one still per slot, four looks for the double (B chosen), a draft of all nine, then nine finals with tag tracks, screen corners, a 4K last still and the phone light-up by code; three helpers made the six plain shots and the tools. PR 8 merged (merge commit 839a455). $23.10 of the $60 cap spent. | Done. Nobody watched a clip in motion or heard one, so Manish's eyes and ears are the real test |
| 2026-11-14 13:23 | ai-peer-video-controller-3 | WP3's closing message: done, PR 8 merged (`839a455`), final ledger $23.10 (95 rows). Checked the merge, its screen, its child process and its three sub-agents, then closed window 3968 and stopped the wait `stall-wp3`. Passed its last notes for WP2 to ai-peer-video-wp2-2. Money at the package's end: $30.63 of $100. Usage log: `2026-11-14T13:23:01Z week=31 fable=62 session=?`. | WP3 closed; Draft 1 awaited |
| 2026-11-14 13:31 | ai-peer-video-wp2-2 | Draft 1 done and merged (PR 9, `1813ac4`). Built since the hand-off: the push-in through the laptop screen, the "AI Peer" tag on the double, a proven network guard around every private render, a final packing step (40 to 115 MB instead of 1.5 GB); WP3's nine finals pulled in with their tracks, corners and times; the music helper's bed and effects checked and committed, four effects moved to the finals' frames; one blank second in the Slack stand-in covered. The Earth close is a snapshot of the helper's unfinished scene with its development switches off. Two renders, each 2:00.0, -14.1 LUFS, speech-to-text 15 of 15; a frame at every cut looked at. No helper started; no money spent by this session. | Draft 1 with the controller; open: the Earth's final version, the music's terms (Manish), the colour tag of six AI clips |
| 2026-11-14 13:37 | ai-peer-video-controller-3 | ai-peer-video-wp2-2 reported Draft 1 done and merged (PR 9, `1813ac4`): two renders, the full film (this Mac only) and a slates copy (in git). Checked what the full film holds (`product.json` names a walk of 6 November and a meeting recording of 7 November; the report says the sound of a live test meeting): not sent, and the controller's own unopened copy and frame sheet of it were deleted. Looked at one sheet of the slates copy, sent it to Manish at 13:36 UTC (Attention group and session, 720p). Asked the old ai-peer-video-wp2 to wrap up its Earth helper (1h34m, 710k tokens). Closed window 3972 after the checks and stopped the wait `stall-wp2-2`. Money: $30.63 of $100. Usage log: `2026-11-14T13:33:13Z week=32 fable=63 session=?`. | Draft 1 is with Manish; his view and the usage answer are open |
| 2026-11-14 13:42 | ai-peer-video-controller-3 | The old ai-peer-video-wp2 reported its Earth helper stopped and the report on `main` (`b0003cd`). Checked the file, the worktree (the final `earth.js` is there, uncommitted), its screen, child and sub-agents; closed window 3963 at 13:42 UTC; stopped the wait `stall-wp2`; started `fable-cap` again naming only window 3973. Took one call: the Earth pull-out stays in Bengaluru. Usage log: `2026-11-14T13:38:21Z week=33 fable=64 session=?`. | Only the controller is left; Manish's view of Draft 1 and his usage answer are open |
| 2026-11-14 14:08 | ai-peer-video-controller-3 | Manish answered the usage question at 14:01 UTC: "one worker at a time, on Opus 5.5" (recorded as V15 and C13, commit `57f8299`). Closed the old controller's window 3964 at 14:06 UTC after the checks. Launched ai-peer-video-wp2-3 at 14:07 UTC (window 3974, PID 16635, `claude-opus-5-5[1m]`, max effort): the Earth's final version and the colour check, no helper without a yes. Armed the wait `stall-wp2-3`. Usage log: `2026-11-14T14:03:42Z week=33 fable=65 session=?`. | One worker live; Manish's view of Draft 1 is awaited |
| 2026-11-14 14:20 | ai-peer-video-wp2-3 | Round 3 done and merged (PR 10, `974b9db`): the Earth's final version switched on (the snapshot deleted, `SOURCE.md` in git), a NASA credit line on the end card, the close rendered and looked at (one sheet of 1:48 to 2:00, the credit at full size, a strip of the fast streak). The colour check of the AI clips: all nine are untagged; the renderer reads them as BT.709, ffmpeg as BT.601; the readings differ by a mean delta E of 1.1 to 1.8; neither the stills nor the raw Kling takes show which is right, so no change. No paid call, no helper. | Waits for Manish's feedback through the controller; context 18%. |
| 2026-11-14 14:20 | ai-peer-video-controller-3 | Manish's feedback on Draft 1 came at 14:15 UTC (in full in `FEEDBACK-DRAFT-1-2026-11-14.md`; V16): the story, the voice and the music stay; the signature shot quicker; the hook clearer, with a name for the employee. Read the film's timeline and lines (the hook is 12 s, the three colleagues speak in 8.5 s) and the product's label setting, wrote a proposal for the hook and sent it to him (session and Attention group). Told ai-peer-video-wp2-3 what is settled and what is coming. Usage log: `2026-11-14T14:18:57Z week=33 fable=65 session=?`. | His answer on the hook is open |
| 2026-11-14 14:51 | ai-peer-video-controller-3 | Manish answered the hook proposal at 14:49 UTC: yes, with the name Ram and "out of office" in colleague 2's line (V17). Sent ai-peer-video-wp2-3 the whole order for Draft 2 (lines, name, cards, timings, the note on the real recordings, paid calls up to $10). Its round 3 was merged at 14:19 UTC (PR 10: the Earth's final version, the NASA credit, the colour check). Armed the wait `draft2`. Asked Manish the music's licence wording. Usage log: `2026-11-14T14:49:26Z week=34 fable=66 session=?`. | Draft 2 is being built; the licence answer is open |
