# AI Peer demo video: state

Live controller: ai-peer-video-controller-2 (Terminal window 3964 on Mac 48 GB, PID 49247,
https://claude.ai/code/session_01Nfn5h7PShJsTBPY7urCJaZ). Other sessions message it by that
name. It took over from ai-peer-video-controller-1 on 2026-11-14 (the hand-off is
`handoffs/HANDOFF-2026-11-14-ai-peer-video-controller-1.md`).

## Where we are (2026-11-14 11:35 UTC)

Day one. Manish asked for a 2-minute "wow" demo video (`BRIEF-2026-11-14.md`). The interview is
done (`DESIGN.md` section 0, V1 to V10): due Thursday 19 November, an invented employee
(character A), Claude's own abilities first, a $100 cap, real company screens on this Mac only.
The story is `STORY.md` ("He's asleep. I'm not."), approved by Manish for a first draft; the
plan is `PLAN.md`. Two workers are building. WP1 (the look, and the clone shot three ways) has
its stills and all three routes generated and is on the code composite, the side-by-side clip
and its report. WP2 (the film in code and Draft 1) started at 11:30 UTC and is in its
HyperFrames trial, with the voice work alongside. No film exists yet. The controller waits on
both with background scripts (the "Still running" table), at no token cost.

Checked by ai-peer-video-controller-2 at the take-over: both workers alive and working (context
in use: WP1 34%, WP2 13%, the controller 9%); Claude usage 10% of the week (Fable 19%); the week
resets 17 November, 04:29 India time.

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
| ai-peer-video-wp1 | 3962 | https://claude.ai/code/session_01Nfn5h7gC1ucD3V5X1FSeSk | `~/repos/ai-peer-video-wp1` (launched in the shared checkout) | video-wp1-look-test | none yet | WP1: three possible employees, the night frames, the clone shot three ways; cap $15; Fable 5.2, max effort, PID 41753 |
| ai-peer-video-wp2 | 3963 | https://claude.ai/code/session_01Nfn5h95MaF4HSLH6cbpUbu | `~/repos/ai-peer-video-wp2` (launched in the shared checkout, with `CLAUDE_NO_IDLE_PING=1`) | video-wp2-film-build | none yet | WP2: the film in code and Draft 1; cap $10; Fable 5.2, max effort, PID 48241 |

Still running:

| What | PID | Log | Stop command |
|---|---|---|---|
| Wait `wp1-end`: ends when WP1's `demo-video/look/REPORT.md` (unchanged for 90 s) and `look/hero-tests/hero-compare.mp4` both exist in `~/repos/ai-peer-video-wp1`, or when PID 41753 is gone | 51860 | `wp1-end.log` | `kill 51860` |
| Wait `wp2-draft-1`: ends when `~/.ai-peer/demo-video-private/renders/draft-01.mp4` exists (unchanged for 90 s), or when PID 48241 is gone; sends one routine Telegram line | 51880 | `wp2-draft-1.log` | `kill 51880` |
| Wait `worker-stall`: ends when a live worker's transcript (and its sub-agents') has been silent for 25 minutes | 51892 | `worker-stall.log` | `kill 51892` |

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

## Money spent

| Date (UTC) | Tool | What for | Amount |
|---|---|---|---|
| 2026-11-14 | fal.ai (WP1, still running) | Pictures of three possible employees, the night-room frames, and the clone shot by three routes (Kling 4.0, Gemini Omni Flash, two plates and code) | $6.60 so far (21 rows of its ledger; the last at 11:30 UTC) |

## Needs Manish

Nothing blocks the build.

1. **Asked** (recorded 2026-11-14 11:44 UTC; in the session with the three audio files, and on the
   Attention group): which voice narrates as the Peer? 1 Matilda, the product's own voice (recommended:
   the real product speaks with it in the meeting, so the Peer stays one character); 2 River,
   relaxed and neutral; 3 Brian, deep and warm. Draft 1 is built with voice 1 meanwhile.
2. Still to come, one at a time: (a) his view of WP1's side-by-side clone clip, when WP1's
   report is in; (b) may the old controller's window (2952) be closed; (c) a look at the fal.ai
   credit, which no key can read: WP3 needs up to $60 more; (d) the recordings from his company
   laptop by Tuesday 17 November morning, India time, into `~/.ai-peer/demo-video-private/`
   (the list is in `PLAN.md`; told to him 2026-11-14 11:28 UTC); (e) Draft 1.

## Next

1. WP1 ends: read its `demo-video/look/REPORT.md` (in `~/repos/ai-peer-video-wp1` until it
   merges), send `hero-compare.mp4` to Manish (the controller has looked at eight frames of
   it: the Kling route holds the man's face and the glow best; Omni changes his face in the
   middle; the two-plate composite reaches the desk but its cut-out is rough), finish WP3's
   brief from the verdict (the draft, with its launch lines, is
   `handoffs/DRAFT-HANDOFF-ai-peer-video-wp3.md`; a read-only helper of the controller is
   checking its facts and fal.ai's live prices), close WP1's window, start `ai-peer-video-wp3`.
2. Manish's voice pick: pass it to WP2 if it is not voice 1.
3. Draft 1 from WP2: look at a frame at every cut, then send it to Manish.
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
