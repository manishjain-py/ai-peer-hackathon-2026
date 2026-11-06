# AI Peer build: state

The tracker. Every session updates it at each milestone; the controller at least
hourly while workers run. Times UTC. Decisions: [DESIGN §0](DESIGN.md). Plan: [PLAN](PLAN.md).

## Where we are

2026-11-06 21:37. **WP4's live S3 walk passed on its first attempt** (21:23 to 21:33, meeting m2db7aebe on the
test meeting, ElevenLabs stock voices; the tap was the scripted `--auto-click`; `ai-peer-wp4-2`'s report, its
evidence to follow on the branch): the update card reached Manish's DM 21:24:50 (approved 21:25:07); the Peer
joined 21:29:08, played the 41 s update 1.0 s after the ask, answered 3 questions live (21.1, 11.7 and 7.1 s
after each question, a holding line after about 1 s), noted the decision, flagged 2 items, left 21:33:10; the
brief reached his DM 21:33:33. Recall 562 bot-seconds (about $0.50 this week in all). The mixed recording, for
Checkpoint 3, is `~/.ai-peer/manish/meeting-runs/m2db7aebe/recording.mp4` (out of git); the controller sends it
when Manish wakes. **Found in the walk: the Peer's brain loads Manish's global `~/.claude/CLAUDE.md`** despite
`--setting-sources project` (its canary on claude 2.1.318, with the Peer's exact flags: his CLAUDE.md, the TLDR
rule, his name); the 3 live answers ended in a "## TLDR" that landed in the sources' date field on the activity
page (nothing extra was spoken; S1's Slack answers in the log are clean). Fix, approved by the controller: one
commit on PR #5 adds `CLAUDE_CODE_DISABLE_CLAUDE_MDS=1` to the brain's env (`peer/brain/runner.py`,
`peer/brain/warm.py`; PR #3 touches neither; the Peer has no CLAUDE.md of its own), a restart, a canary through
the Peer's code; then the merge. Undo: revert that commit and restart. The shared lesson
`howto_isolate_headless_claude_and_codex_runs.md` gets corrected (it said those flags block his CLAUDE.md).

2026-11-06 21:18. **WP4's live S3 walk runs tonight, before WP3's** (`ai-peer-controller-4`'s call, under
Manish's "please continue whatever work you can in the meantime"): WP3 cannot move until his Google client in
the morning and the live Peer sat idle, so `ai-peer-wp4-2` (window 2610, pid 15886) started 21:17 with the Peer.
It merges main (PR #6) into PR #5, re-points the brain skill links and restarts the Peer from
`~/repos/ai-peer-wp4`, walks S3 live with `--auto-click` (the Peer's browser taps "Approve update" for him, as in
the recorded S1 walk), sets `voice.engine` back to `local`, merges PR #5 and gives the Peer back by 02:00 UTC.
A read-only review of the plan found 9 points, each checked in the code and folded; the worst three: `peer start`
does not re-point the skill links (they point at wp2, which lacks the meeting playbooks), the walk outlasts a
10-minute shell call, and a failed walk must cancel its meeting row or the Peer joins alone. The launch prompt:
[KICKOFF-2026-11-06-ai-peer-wp4-2.md](handoffs/KICKOFF-2026-11-06-ai-peer-wp4-2.md). Each attempt DMs Manish
twice at night (the card, then the brief). **After PR #5 merges, `ai-peer-wp3-2` merges main into PR #3 (7 files
conflict; "Next" 3) before its S2 walk, so S2 is walked on the merged code.** Undo: stop `ai-peer-wp4-2` and
end its walk (kickoff point 5); WP3 then goes first as before.

2026-11-06 20:49. **`ai-peer-controller-4` is the live controller** (window 2608, pid 53460, context 10%
at 20:49; https://claude.ai/code/session_01NAqLMkV1MMXncDoCgmaRDc). It closed `ai-peer-controller-3`
(window 2408, idle, only a `caffeinate` helper; pid 51569 gone at 20:49), told `ai-peer-wp3-2` (it
answered: idle until "Google client done", PR #3 clean at acc1d9b; context 26%) and re-armed the
watcher (pid 61507: `ai-peer-wp3-2` pid 53664, the Peer pid 62524). Weekly usage 42% at 20:48.

Earlier, 20:47. **Controller hand-off:** `ai-peer-controller-3` (40.6% context) hands off to
`ai-peer-controller-4`, which it starts now, so Manish's morning gets a fresh controller
([hand-off](handoffs/HANDOFF-2026-11-06-ai-peer-controller-4.md)). `ai-peer-wp3-2` merged main into
PR #3 (20:46, no conflicts; mergeable) and waits for the Google client; `ai-peer-wp4-2` starts after
WP3's S2 walk. His morning list is "Needs Manish" item 0.

Earlier, 20:40. **WP5's first part merged** ([PR #6](https://github.com/manishjain-py/ai-peer-hackathon-2026/pull/6), merge commit b877a87, 20:39): `port-check` (0 FAIL on
directory, slack, github and fake; google, meetings and voice "not on main yet" until PRs #3 and #5 merge),
[the porting guide](../porting-guide.md), the porting walk passed (a fresh sub-agent ported a toy "teamchat"
adapter from the guide alone; its 11 gaps folded into the guide) and [the demo script](../../demo/script.md)
(S1 final; S2 and S3 until their live walks). Evidence: [evidence/wp5/](evidence/wp5/). `ai-peer-wp5-1`
stopped (context 36%, weekly 42% at 20:40).

Earlier, 20:11. **WP4's dry S3 walk passed** (19:42 to 19:47; `ai-peer-wp4-1` handed off at 42% and was closed 19:52; `ai-peer-wp4-2` starts when the live Peer is free after WP3's S2 walk). **WP5 started 20:10**: `ai-peer-wp5-1` (window 2607), the porting guide, `port-check`, the porting walk and a demo script, stopping tonight at 60% weekly usage. 19:17: **WP4's spike passed** (19:15: on the test meeting the holding line is heard 3.1 to 3.9 s and the live answer 7.3 to 8.1 s after a question; draft [PR #5](https://github.com/manishjain-py/ai-peer-hackathon-2026/pull/5); `ai-peer-wp4-1` now builds before, during and after). 18:55: **WP1 complete and Checkpoint 1 sent** (18:26:57, Telegram Attention, both recorded
walks' videos; `ai-peer-wp1-3` closed 18:29). **WP4 started 18:52**: `ai-peer-wp4-1` (window 2595) in
`~/repos/ai-peer-wp4` on `wp4-meeting`, from [its brief](handoffs/HANDOFF-2026-11-06-ai-peer-wp4-1.md)
(a read-only review found 18 issues, all folded; the worst: Recall's default transcription delays live
events 3 to 10 minutes, and the ElevenLabs key is Learn Like Magic's live one). It works alone tonight:
spike, build, dry walk on test owner `wp4test`. **Manish is asleep until his morning** (18:20: "please
continue whatever work you can in the meantime"); `ai-peer-wp3-2` stays idle until his Google client.
His morning list is "Needs Manish" item 0.

Earlier, 18:25. **The Peer's Slack sign-in passed at 18:18** (Manish at the Mac); the recorded S1 walks
4 and 5 passed 18:18 to 18:22.

Earlier, 18:05. **On the new subscription** (weekly 33% at 17:56, Fable 0%, resets 11 Nov 12:30 IST).
Live controller: `ai-peer-controller-3` (window 2408), since 17:56. It closed the old account's idle
worker windows (2049, 2216) and at 18:00 started `ai-peer-wp1-3` (window 2442: the Peer's Slack
sign-in, the two recorded S1 walks, Checkpoint 1; ready 18:05, waiting for Manish's "open window",
asked on Attention 18:03) and `ai-peer-wp3-2` (window 2445: the Google client, the two logins, the
spike, the live S2 walk, the merge of draft PR #3). **WP1 and WP2 merged** ([PR #1](https://github.com/manishjain-py/ai-peer-hackathon-2026/pull/1)
183fabe, [PR #2](https://github.com/manishjain-py/ai-peer-hackathon-2026/pull/2) 88ac13e); **WP3**'s dry S2 walk passed. Next
needs Manish at the Mac: "open window", then the Google client ([setup/google.md](setup/google.md)).

- **Subscription switch** (6 Nov, 17:22 to 17:56): the old account reached 94% weekly usage;
  `ai-peer-controller-2` and both workers handed off (the three `HANDOFF-2026-11-06-*` files);
  Manish switched this Mac's Claude login and launched `ai-peer-controller-3`.

- **WP2 started before the WP1 merge** (controller-2's call, 10:31 to 10:45): WP1's code is built and
  S1-away passes live; only its last walk and the merge wait on Manish's sign-in code (asked
  02:47, no answer by 10:29). D13 allows 2 workers. `ai-peer-wp2-1` branches from
  `wp1-foundation` at 4fb4869 and, until PR #1 merges, works as a test owner (`AI_PEER_OWNER` on
  every command), runs its page on 8788, makes no Slack writes, opens no Socket Mode connection,
  uses no `peer browser` and never writes under `~/.ai-peer/manish/`; afterwards it merges
  `origin/main` in. `ai-peer-wp1-2` agreed to merge PR #1 with a merge commit and to leave its
  worktree and the live Peer in place. A read-only review of the brief found 9 risks; each was
  checked in the code and folded. WP3 starts when WP1 merges.
- Spikes 1a and 1b passed: `claude -p` 2.1.318 with `--setting-sources project`, empty
  MCP and a read-only tool list loads none of Manish's global config; `codex exec`
  0.153.4 loads skills, but needs its own `CODEX_HOME` and `HOME` under `~/.ai-peer`
  (`--ignore-user-config` still leaks the global AGENTS.md and user skills).
- Spike 1c nearly passed (15:02): the bot posts as "Manish's AI Peer" over Socket Mode,
  a labelled test card with Send / Edit / Skip sits in Manish's DM, the bot replied in
  its thread. Hearing a message and receiving a click fold into the live walk (the
  listener ended 18:02 with no reply).
- **Spike 1d passed** (01:55 to 01:59 UTC on 5 Nov; evidence `docs/build/evidence/wp1/spikes.md`
  on the branch, 4777515, read by the controller): on Manish's own Zoom with him **not** in
  the call, Recall's default bot joined and recorded (no host, no Zoom app of ours, no OAuth),
  played its MP3 on demand, and the transcript arrived 8 s after it left; a second bot heard
  the Peer word for word. About $0.05. D8's Zoom path stands for S3; PLAN's Zoom Meeting SDK
  app is not needed.
- **Colleague accounts done** (02:47 on 5 Nov, by the controller in Manish's Chrome at his
  request): aliases ananya@, kabir@, lakshmi@, david@, rohan@learnlikemagic.com on the
  **admin@learnlikemagic.com** user (the colleagues' mailbox, kept apart from manish@, the
  Peer's inbox); test app "LLM Scenario" (A0CEL8M225D) with its client id and secret in
  `.env`; the five invited, signed up as Ananya Rao, Kabir Mehta, Lakshmi Reddy, David Okafor
  and Rohan Gupta, and each authorised it (`SLACK_AS_<NAME>` in `.env`).
- **S1-online passes live** (15:26 to 15:29 on 5 Nov, checked by the controller in the Peer's
  log): Ananya asked in #content; the draft card with Send / Edit / Skip reached Manish's DM 36.7 s
  later; **he tapped Send on his phone** at 15:28:59 and the Peer posted the reply in her thread,
  labelled, with sources and certainty (`drafted_for_owner`, then `sent_after_approval`). Spike
  1c is fully passed. Both S1 walks now pass live, so PR #1 merged (merge commit 183fabe, 15:31:54);
  the screenshots, the two videos and Checkpoint 1 wait for the browser sign-in at the Mac.
  Evidence: `docs/build/evidence/wp1/s1-walks.md` (walk 3).
- **S1-away passes live** (worker's report, 02:58 on 5 Nov) in #schools from the scenario
  script: on Claude (02:54) the Peer answered Lakshmi in the thread in 40 s (who it is,
  "Manish is offline (8:24 AM in India)", the answer from today's real tracker with sources
  PR #708, PR #705, certainty and date, no commitments), her follow-up in 37 s, and one
  "While you were away" DM updated in place; on Codex (02:56, one setting) the same walk in
  37 s and 34 s, so **F8 is done**; spike 1c is complete. Left in WP1: S1-online (draft DM and
  the Send click) and the screenshots and video, which wait on the Peer's browser sign-in.
- **Live S1 started** (02:46 on 5 Nov): channels #product, #content, #schools and
  #engineering hold exactly the five colleagues, Manish and the Peer (preethi in none,
  checked). The Peer runs live (pid in `~/.ai-peer/manish/watch.pid`; where it runs from: "The live Peer" below).
  The first live S1-away walk failed: posts through LLM Scenario carry the app's `bot_id`
  and the filter dropped them as bot messages; fixed (a post is a person's when its user is a
  real member), restarted 02:53, rerun under way at 02:54.
- **S1 passes in dry runs** (15:22; fake Slack, real brain, real memory), on Claude
  and on Codex. Away: a labelled thread answer in 17 to 25 s with sources, dates and
  certainty, the follow-up, one DM summary updated in place. Online: a draft DM with
  Send / Edit / Skip, the thread reply after Send. Live Slack pieces work: Socket Mode,
  owner lookup, presence, `port-check`. Draft [PR #1](https://github.com/manishjain-py/ai-peer-hackathon-2026/pull/1).
  The live walk needs the colleague accounts.
- Brain answers run on Opus at effort "high": 21 to 27 s, measured; "max" took 113 to
  139 s, too slow for S1's one-to-two-minute limits. Opus rather than Fable, so the Peer
  cannot use up the account-wide Fable allowance (the worker's measurement, reported with the 18:02 listener news).
- First discovery works (15:08): profile + GitHub (read-only) gave 15 project files
  from the trackers in 4 LLM repos, each with an AI "status in brief", plus 5 services
  and 5 people, under `~/.ai-peer/manish/`. S1 can answer from the real repo.
- Slack set up by the kickoff session with Manish (he let it drive his Chrome):
  workspace "learnlikemagic" (team T0CEDQU5X0X), app "AI Peer" (A0CEE0554HM), bot
  `@manishs_ai_peer`, steps in `docs/build/setup/slack.md`.
- In `~/.ai-peer/.env`, each checked: the Slack app, bot and user tokens;
  `ELEVENLABS_API_KEY`; `GITHUB_TOKEN` (his `gh` login, full repo scope, so the Peer
  makes read calls only; PLAN's fine-grained read-only token would be safer, optional).
- Recall.ai: key `ai-peer-runtime` in `.env` and working; Tokyo region
  (`RECALL_BASE_URL`), $5 credit, so keep test meetings short. Recall says its bots join
  Zoom with no Zoom app of ours; spike 1d checks that against Zoom's on-behalf-of rule,
  with Manish not in the call. Zoom: his paid Workplace Pro account (personal Gmail).
- All accounts and `.env` names: [setup/accounts.md](setup/accounts.md).
- **The live Peer** (owner `manish`) **runs from `~/repos/ai-peer-wp4` since 21:21:24 on 6 Nov**, restarted
  21:45:27 on the CLAUDE.md fix (pid 10924 in `~/.ai-peer/manish/watch.pid`, the only `peer watch`;
  `wp4-meeting` at 2aec10e, which is WP4 plus main plus the fix; both brain skill links point into
  `~/repos/ai-peer-wp4`; the page answers; checked by the controller 21:45). The first run there was pid 18558
  (21:21:24 to 21:45:23). `ai-peer-wp4-2` holds it until its merge and gives it back by 02:00 UTC. Keep
  `~/repos/ai-peer-wp4` while the Peer runs from it. Before that it ran from `~/repos/ai-peer-wp2` (pid 62524,
  16:18 on 5 Nov to 21:21:16 on 6 Nov, on main's code of 5 Nov); the controller hands it out.
  On "open window" it goes to `ai-peer-wp1-2` to record S1; WP3's live S2 walk asks for it later. F7 is live: the session-end hook is in `~/claude-config/settings.json` (synced) and
  `~/.codex/hooks.json` (backups in `~/.ai-peer/backups/`; both checked to parse), and the hourly
  scan reads `~/repos`.
- Still running (21:46 on 6 Nov): the live Peer (pid 10924, above), `ai-peer-wp4-2` (pid 15886) and
  `ai-peer-controller-4`'s watcher `docs/build/tools/watch2.zsh` (pid 11708, no AI; it tracks `ai-peer-wp3-2`
  pid 53664, `ai-peer-wp4-2` pid 15886 and the Peer pid 10924; exits with one line on a change or after 55
  minutes; the controller re-arms it; stop: `kill 11708`).
  At 20:47 `ai-peer-controller-3` had stopped its own watcher at the hand-off.
  Before that (18:55): the live Peer and `ai-peer-controller-3`'s watcher
  `watch2.zsh` (pid 74123, no AI, in the controller's scratchpad; it exits with one line on a change:
  a worker or the Peer gone, a worker at 45% context, the PR list, the `.env` key names, the Google
  client file, or after 55 minutes; the controller re-arms it; stop: `kill 74123`). It tracks
  `ai-peer-wp5-1` (pid 71998), `ai-peer-wp3-2` (pid 53664) and the Peer (pid 62524). Worktrees:
  `~/repos/ai-peer-wp1` (done), `~/repos/ai-peer-wp2` (the Peer runs from it), `~/repos/ai-peer-wp3`,
  `~/repos/ai-peer-wp4`. Controller-3 context 8% at 17:57, 27% at 18:28.
- **New account, from 17:56 on 6 Nov: weekly 33% (all models) and Fable 0% at 17:56; resets 11 Nov
  12:30 IST.** At 93% start nothing that cannot finish cleanly; at 95% hand off.
- **Old account: weekly usage 94% at 17:22 on 6 Nov** (72% at 17:57 on 5 Nov; 70% at 17:01; 68% at 16:33; 64% at 16:16; 59% at 11:18; 55% at 07:41; 54% at 02:59):
  about 9 points since 11:18, from WP2's live walks, WP1's walks and two brief reviews (about
  200k tokens each); about 1 point in the 4.7 h before 07:41, while the build waited. A busy
  worker uses about 7 points an hour, so 95% could come within hours of WP3's busiest work. The reset is 10 Nov, 04:30 IST; per D14 Codex is the backup builder at about 95%.
  `ai-peer-wp1-2` read in, context 10% at 14:47, waiting for "go login" (it also fixed the Peer
  browser's old Chrome version, which Slack would stop supporting on 9 Nov).

| Session | Window | Worktree | Branch / PR | Job |
|---|---|---|---|---|
| kickoff, registry name `learnlikemagic-27` | 1661 | `~/repos/ai-peer-hackathon-2026` | `main` | Interview, docs, restructure, Slack, Recall, ElevenLabs, GitHub set up; handed off at 46% (about 15:07); its window stays open until Manish closes it (it told him he may). The controller owns every ask to Manish |
| ai-peer-controller-1 | 1715 (closed 03:01 by controller-2) | `~/repos/ai-peer-hackathon-2026` | `main` (docs only) | Handed off at 42% (02:57 on 5 Nov) to ai-peer-controller-2; stopped; https://claude.ai/code/session_01Nfn5h9PisnJvGpbLbRtbiB |
| ai-peer-controller-2 | 2048 (gone by 17:57 on 6 Nov, before controller-3's checks; pid 52453 gone) | `~/repos/ai-peer-hackathon-2026` | `main` (docs only) | Handed off at 94% weekly usage (6 Nov) to ai-peer-controller-3; stopped; https://claude.ai/code/session_01Nfn5h8mSoWxqjYkbP3JnvB |
| ai-peer-controller-3 | 2408 (pid 51569; closed 20:49 on 6 Nov by ai-peer-controller-4: idle, only a `caffeinate` helper) | `~/repos/ai-peer-hackathon-2026` | `main` (docs only) | Live 17:56 to 20:47 on 6 Nov, on the new subscription, from [its hand-off](handoffs/HANDOFF-2026-11-06-ai-peer-controller-3.md); **handed off at 40.6% context** to `ai-peer-controller-4` ([hand-off](handoffs/HANDOFF-2026-11-06-ai-peer-controller-4.md)), so the morning gets a fresh controller; https://claude.ai/code/session_01NAqLMnV6cKswAd8t7TNx8g |
| **ai-peer-controller-4** (live controller) | 2608 (pid 53460; started by controller-3 at 20:47 on 6 Nov; https://claude.ai/code/session_01NAqLMkV1MMXncDoCgmaRDc) | `~/repos/ai-peer-hackathon-2026` | `main` (docs only) | Runs the build from [its hand-off](handoffs/HANDOFF-2026-11-06-ai-peer-controller-4.md): closes controller-3, re-arms the watcher, takes Manish through his morning, hands the live Peer to `ai-peer-wp3-2`, then starts `ai-peer-wp4-2` |
| ai-peer-wp1-3 | 2442 (closed 18:29 on 6 Nov by controller-3: idle, only a caffeinate helper left) | `~/repos/ai-peer-wp1` | `wp1-login-window`, [PR #4](https://github.com/manishjain-py/ai-peer-hackathon-2026/pull/4) merged 18:26 (006b4b6) | **WP1 complete.** Started 18:00 on 6 Nov ([hand-off](handoffs/HANDOFF-2026-11-06-ai-peer-wp1-3.md)). The Peer's Slack sign-in passed 18:18; recorded walks 4 (S1-online, Send clicked in the Peer's browser) and 5 (S1-away) passed 18:18 to 18:22; evidence on `main` (3358906); Checkpoint 1 to the controller 18:25; the live Peer released at 18:25 (never restarted; presence back on auto). PR #4: `peer browser login` waits 30 minutes. Worktree kept; spawned no successor; stopped; https://claude.ai/code/session_01NAqLMnsPK5F9m9cVsQKQHv |
| **ai-peer-wp3-2** | 2445 (pid 53664) | `~/repos/ai-peer-wp3` | `wp3-google-brief`, draft [PR #3](https://github.com/manishjain-py/ai-peer-hackathon-2026/pull/3) | Started 18:00 on 6 Nov ([hand-off](handoffs/HANDOFF-2026-11-06-ai-peer-wp3-2.md)): the Google client (Manish), the two logins, the spike, then the live S2 walk once the controller says "the Peer is yours", then the merge; https://claude.ai/code/session_01NAqLMjvu4kLmGgH7L1kkkA |
| ai-peer-wp4-1 | 2595 (closed 19:52 on 6 Nov by controller-3: idle, no child processes, no tunnel or listener, its sub-agent done) | `~/repos/ai-peer-wp4` | `wp4-meeting` at 9c79a37, draft [PR #5](https://github.com/manishjain-py/ai-peer-hackathon-2026/pull/5) | Started 18:52 on 6 Nov ([brief](handoffs/HANDOFF-2026-11-06-ai-peer-wp4-1.md)): WP4, the `meetings` adapter on Recall.ai and S3. Spike first (low-latency live transcript through a `cloudflared` tunnel, a warm session, speech, the whole loop), then the build and a dry walk on test owner `wp4test`; its live walk waits for the live Peer after WP3. Never the cloned voice; joins only the test meeting; Learn Like Magic's ElevenLabs key capped at 20,000 characters; Recall spend stops at about $3; https://claude.ai/code/session_01NAqLMmLGX1pk6L2qLS3zAy **Spike passed 19:15 on 6 Nov** ([evidence](https://github.com/manishjain-py/ai-peer-hackathon-2026/blob/wp4-meeting/docs/build/evidence/wp4/spike.md) on the branch, b17d4f8): on the test meeting with two bots and local voices, from the end of a question the holding line is heard after 3.1 to 3.9 s and the live answer after 7.3 to 8.1 s (final transcript line 0.8 to 1.1 s after the last word; warm Opus session at effort medium: spoken answer ready in 2 to 4 s). `cloudflared` 2026.10.7 installed (`brew install cloudflared`). Recall: 565 bot-seconds (about $0.10) for the spike; 832 this week in all. ElevenLabs: 0 characters spent (account 16.6% used). Context 30% at 19:15; weekly 38% at 18:53 **S3 dry walk passed 19:42 to 19:47** ([evidence](https://github.com/manishjain-py/ai-peer-hackathon-2026/blob/wp4-meeting/docs/build/evidence/wp4/s3-walks.md) on the branch): the update card and tap, the Peer's intro, the update on request, two live answers (one unscripted) with certainty, dates and flags, the decision as notes, the brief in the (fake) DM and on the new Meetings page, every step logged. ElevenLabs checked for the live walk (stock voices; 1,100 of 20,000 characters). Recall about 1,930 bot-seconds in all for WP4 (about $0.35). **Handed off 19:55 at 42% context** to `ai-peer-wp4-2`, not spawned: [hand-off](handoffs/HANDOFF-2026-11-06-ai-peer-wp4-2.md) (the live walk on the live Peer with ElevenLabs voices, which needs the controller's slot and Manish's tap, then the merge). Nothing of its own running; stopped |
| **ai-peer-wp4-2** | 2610 (pid 15886) | `~/repos/ai-peer-wp4` | `wp4-meeting`, draft [PR #5](https://github.com/manishjain-py/ai-peer-hackathon-2026/pull/5) | Started 21:17 on 6 Nov by `ai-peer-controller-4` from [its hand-off](handoffs/HANDOFF-2026-11-06-ai-peer-wp4-2.md) plus a kickoff of 7 changes (in "Where we are", 21:18): the live S3 walk tonight with `--auto-click`, then the merge of PR #5; gives the Peer back by 02:00 UTC; https://claude.ai/code/session_01NAqLMn2cQZBxXoA71y8dKj |
| ai-peer-wp5-1 | 2607 (closed 20:42 on 6 Nov by controller-3: idle, its sub-agent done) | `~/repos/ai-peer-wp5` | `wp5-porting`, [PR #6](https://github.com/manishjain-py/ai-peer-hackathon-2026/pull/6) merged 20:39 (b877a87) | **WP5's first part done.** Started 20:10 on 6 Nov ([brief](handoffs/HANDOFF-2026-11-06-ai-peer-wp5-1.md)). `port-check` with an `adapters:` list in settings (0 FAIL at 20:25 on test owner `wp5test`; its FAIL paths proven on broken adapters), [the porting guide](../porting-guide.md), the porting walk passed 20:24 to 20:35 (11 gaps folded), [the demo script](../../demo/script.md); evidence in [evidence/wp5/](evidence/wp5/). Context 36%, weekly 42% at 20:40. Nothing of its own running (test owner `~/.ai-peer/wp5test/` kept); worktree kept; spawned no successor; stopped; https://claude.ai/code/session_01NAqLMiWg1M3rHNkMHb3SMa |
| ai-peer-wp1-1 | 1725 (closed 03:01 by controller-2) | `~/repos/ai-peer-wp1` | `wp1-foundation`, draft PR #1 | WP1 foundation + S1. Handed off at 44.2% (2026-11-05 03:02 UTC) to `ai-peer-wp1-2` ([hand-off](handoffs/HANDOFF-2026-11-05-ai-peer-wp1-2.md)); stopped. The Peer it started keeps running (`peer stop`/`peer start`, pid file); https://claude.ai/code/session_01Nfn5h8PVD6txxjBUfab4nR |
| ai-peer-wp1-2 | 2049 (closed 17:57 on 6 Nov by controller-3: idle, no child processes) | `~/repos/ai-peer-wp1` | `wp1-foundation`, PR #1 merged 15:31 (183fabe) | Done: S1-online live with Manish's tap, the merge, a recorder smoke test. Handed off at 19.3% (2026-11-06 17:25 UTC, weekly usage 94% on the old account) to `ai-peer-wp1-3` on the new account ([hand-off](handoffs/HANDOFF-2026-11-06-ai-peer-wp1-3.md): the "open window" sign-in, the two recorded walks, evidence, Checkpoint 1); spawned no successor; stopped; https://claude.ai/code/session_01Nfn5h9oCzikhfgVU9KBwCz |
| ai-peer-wp2-1 | 2129 (closed 16:21 by controller-2: idle, nothing running; the live Peer kept running) | `~/repos/ai-peer-wp2` | `wp2-setup-memory`, [PR #2](https://github.com/manishjain-py/ai-peer-hackathon-2026/pull/2) **merged 16:19 as 88ac13e** | WP2 done: F1 to F7 walked (evidence `docs/build/evidence/wp2/walks.md`); the away switch walked live 15:39; the live F5 DM check is in Next. **Changed at Manish's "Yes to all" (15:33):** `~/claude-config/settings.json` (what `~/.claude/settings.json` links to) gained `hooks.SessionEnd` running `~/.ai-peer/bin/session-end claude` behind `test -x` (undo: delete the `SessionEnd` key); `~/.codex/hooks.json` gained the same with `codex` (undo: delete its `SessionEnd` key); owner `manish` settings `local.folders: ["~/repos"]` (undo: `[]`); backups in `~/.ai-peer/backups/`. **The live Peer runs from this worktree** (pid 62524, started 16:18, skill links point here): keep the worktree until the Peer moves. Stopped; https://claude.ai/code/session_01Nfn5h6apXjAgQuN9wUq54K |
| ai-peer-wp3-1 | 2216 (closed 17:57 on 6 Nov by controller-3: idle, no child processes) | `~/repos/ai-peer-wp3` | `wp3-google-brief` at 79ee537, **draft [PR #3](https://github.com/manishjain-py/ai-peer-hackathon-2026/pull/3)** | S2 dry walk passed 17:00 on 5 Nov (evidence `docs/build/evidence/wp3/walks.md` on the branch). **Handed off 17:27 on 6 Nov** at the controller's request (the old account's weekly usage 94%; context 39%) to `ai-peer-wp3-2`, not spawned: [hand-off](handoffs/HANDOFF-2026-11-06-ai-peer-wp3-2.md) (the Google client, the two logins, the spike, the live S2 walk, merge). Defaults kept: `google.act_on_real_items` and `google.show_real_items` off, the seed ledger, `peer seed clean`. Nothing of its own running; https://claude.ai/code/session_01Nfn5h7CXNKkUk7N614bzgr |

## Needs Manish

The controller asks one at a time, in this order.

0. **His morning (7 Nov), in order, one at a time:** (a) the Google client, [setup/google.md](setup/google.md)
   steps 1 to 5 in his Work Chrome (asked 18:18 on 6 Nov; he types "downloaded" and the controller
   moves the file to `~/.ai-peer/google-client.json`); (b) "go login" for `ai-peer-wp3-2`: two Google
   consent pages (manish@, then admin@); (c) **the Peer's own Codex login, deadline 8 Nov 02:25 UTC**
   (item 4); (d) from his phone, the live F5 check ("Next" item 2); (e) untick "Allow JavaScript
   from Apple Events" in his Work Chrome. Done 17:56 on 6 Nov: the subscription switch. (The recorded
   S1-online walk passed 18:18 to 18:20 with the scripted Send click, so no tap is needed.)
1. **Done 18:18 on 6 Nov: the Peer's Slack sign-in** (his "open window" at 18:06; the first window opened
   hidden off screen, so `ai-peer-wp1-3` reopened it in front at 18:15; he signed in with Slack's emailed
   sign-in link; `login-2-after-code.png` shows the client as manish). Asked again 18:03 on 6 Nov. **Changed 15:26: the headless sign-in hit Slack's "I'm not a robot" check (no code sent); a person must do it, so it waits for Manish at the Mac ("open window": a Chrome window in the Peer's own profile, he types the email, ticks the box, types the code). Meanwhile S1-online runs live with his own tap on Send.** Earlier: waiting, the build's only blocker (asked 02:47 on 5 Nov; again 02:59, and reminders at 04:53 and 12:56, by ai-peer-controller-2 on Attention):**
   step 5, the Peer's own Slack sign-in. The worker types
   manish@learnlikemagic.com on Slack's sign-in page; Manish reads the code Slack mails to
   manish@ (no Chrome profile the controller can drive has that inbox) and it goes into
   `~/.ai-peer/slack-login-code.txt`. The controller sends the worker "go login" when he is
   ready. Then, when convenient: untick View > Developer > "Allow JavaScript from Apple
   Events" in his Work Chrome window (Chrome ignores scripted changes to it, both ways).
2. **Done 15:33: "Yes to all"** (relayed to `ai-peer-wp2-1`, which makes the edits). **F7 local work** (from `ai-peer-wp2-1`, 11:17), one yes or no for three small changes;
   recommend yes to all three. (a) Claude Code: add to `~/.claude/settings.json` (a link into
   `~/claude-config`, so it syncs to his other Macs), under "hooks":
   `"SessionEnd": [{"hooks": [{"type": "command", "command": "test -x \"$HOME/.ai-peer/bin/session-end\" && \"$HOME/.ai-peer/bin/session-end\" claude || true", "timeout": 5}]}]`.
   It saves only the session's folder, id and end reason to `~/.ai-peer/spool/`, exits at once,
   and does nothing on a Mac without the script. Undo: delete that key. (b) Codex: the same entry
   with `codex` in `~/.codex/hooks.json` (unproven: `codex exec` never fires it; his next
   interactive Codex session will tell; Codex may ask him once to trust it). Undo: delete it.
   (c) The hourly scan reads `~/repos`: read-only (`git --no-optional-locks`, never fetch or
   write), summaries only (repo, branch, unpushed commit subjects, number of changed files),
   inside the Peer, not cron or launchd. WP2 makes the edits on his yes and checks that a
   session end lands in the spool.
3. Optional, F5's reaction path (the typed "less of this" works without it): api.slack.com >
   AI Peer app > Event Subscriptions > Subscribe to bot events > add `reaction_added` > Save
   (`reactions:read` is granted already, so no reinstall). Or he lets the controller do it.
4. The Peer's own Codex login, before 8 Nov 02:25 UTC (its copy of his login ends 9 Nov 02:25 and
   the runner refuses it in the last 24 h): `! CODEX_HOME=~/.ai-peer/codex-home codex login`.
5. The Google Internal OAuth client, at the Mac, about 5 minutes: steps in
   [setup/google.md](setup/google.md) (written by the controller, so he can do it before WP3 starts).
6. The Airbnb asks in PLAN, this week.
7. His other Mac's copy (`~/repos/Hackathon 2026`, per the `$ai-peer` skill) predates
   the `film/` move: push anything unpushed there, then pull.
8. Optional housekeeping: delete the unused Recall key "ai-peer" in the Recall dashboard.
9. Optional: the Peer uses Learn Like Magic's own ElevenLabs key (`docs/build/setup/accounts.md`), shared with its live product. WP4 caps itself at 20,000 characters, one request at a time, no voice changes. A separate ElevenLabs key for the Peer would keep them apart (his money and his account; recommend: only if the demo needs much more speech).

Chrome: Manish let the kickoff session do setup steps in his logged-in Chrome. At 02:05 on
5 Nov he authorised the controller to do the remaining colleague setup steps the same way
(quote in "Manish's answers"). Any other new use still needs his word.

## Next

1. WP1: **complete** (`ai-peer-wp1-3`, 6 Nov): the Peer's Slack sign-in (18:18), recorded walks 4 and 5
   ([evidence](evidence/wp1/s1-walks.md)), Checkpoint 1 sent to the controller at 18:25. Nothing left.
2. WP2 merged (88ac13e). Left: **the live F5 check**, by any session once Manish types (the live
   Peer runs from `~/repos/ai-peer-wp2`). (a) He types in his Slack DM with the AI Peer, as a new
   message: `stop telling me about CI failures on drafts`. Pass: within about 30 s a one-line reply
   ("Got it: I won't tell you about CI failures on draft PRs any more…"); `~/.ai-peer/manish/log.jsonl`
   gets a `tuned` entry; `rules.md` gets "## From your feedback" with the rule; `tuning.json` a filter
   `{source: github, kind: ci, conclusion: failure, draft: true}`. (b) In `~/repos/ai-peer-wp2`:
   `AI_PEER_OWNER=manish .venv/bin/python -m peer sample-heads-up --draft --branch telugu-wp2c-sample`
   prints `"did": "held_back"`, nothing new in his DM, a `held_back` entry in the log. (c)
   `AI_PEER_OWNER=manish .venv/bin/python -m peer sample-heads-up` prints `"did": "told"` and a
   "CI failed on main … (walk sample)" heads-up lands in his DM. (d) Add the result to
   `docs/build/evidence/wp2/walks.md` on `main`. He may say `undo` in the DM afterwards.
3. WP3 (`ai-peer-wp3-2`, since 18:00 on 6 Nov): spike first; needs Manish at the Mac for the Google client
   ([setup/google.md](setup/google.md), about 5 minutes) and two consent clicks (manish@, admin@).
   Its live S2 walk needs the live Peer from the controller, after `ai-peer-wp1-3`'s recordings
   (done 18:22 on 6 Nov: the Peer is free; the controller hands it over once the Google client,
   the logins and the spike pass). **Changed 21:18 on 6 Nov: WP4 merges first (PR #5, tonight).** Then
   `ai-peer-wp3-2` merges `origin/main` into PR #3 before its walk (a merge commit; a trial merge of
   acc1d9b and 9c79a37 conflicts in 7 files, all additive: keep both sides). Three need care (the
   review's notes): `peer/brain/schemas.py` (both append at the end and share the closing lines: close
   WP3's last dict, then add `MEETING_UPDATE`, `_ITEM`, `MEETING_BRIEF`); `peer/brain/skills/peer-brain/SKILL.md`
   (the one-line `description:` lists all eight playbooks; keep all five new sections); `peer/__main__.py`
   (two hunks: WP3's google, seed and brief usage lines plus WP4's meeting line, and both sets of
   commands). Keep both in `executor.py` (the `brief_` and `peer_mtg_` checks, before the S1 check),
   `notify.py` (`send_brief`, `send_meeting_dm`), `watcher.py` ("brief me" and "cover meeting", before the
   feedback fallthrough) and `web/app.py` (`brief_page`, `meetings_page` and `/meetings`). Then its own
   cheap checks and WP4's (`.venv/bin/python -c "import peer.meetings.live, peer.meetings.walk, peer.web.app"`;
   a real Zoom link refused on a test owner), `port-check --adapter google`, `meetings` and `voice` on a test
   owner, and **when it restarts the Peer from `~/repos/ai-peer-wp3`, run `install_skill` there** (`peer start`
   does not re-point the brain skill links; kickoff point 3 in
   [KICKOFF-2026-11-06-ai-peer-wp4-2.md](handoffs/KICKOFF-2026-11-06-ai-peer-wp4-2.md) has the sequence).
3b. WP4: the dry S3 walk passed (19:42 to 19:47 on 6 Nov). Its live walk and the merge of PR #5 go to
   `ai-peer-wp4-2` ([hand-off](handoffs/HANDOFF-2026-11-06-ai-peer-wp4-2.md)), started when the live Peer is free after
   WP3's S2 walk and merge; then Checkpoint 3. WP5's first part merged 20:39 (PR #6). **After PRs #3 and
   #5 merge** (a later session, docs only, straight to `main`): re-run `port-check` on a test owner for
   `google`, `meetings` and `voice` (their `adapters:` entries and dry-run samples were written from reading
   the PRs; google's sample tries `draft_reply` in dry run on the newest inbox mail, so it needs the Google
   login), then drop "until it merges" in the guide's google, meetings and voice parts and update the demo
   script's S2 and S3 from their live walks. A later code step: route the runtime spots that still pick
   adapters or call Slack and GitHub methods directly through the contract (the guide's "What a port also
   edits today" lists each). Optional: PR #3 and #5's adapters raise `peer.adapters.base.Blocked` and add
   `dry_run_sample()`; then their `sample:` and `blocked_by:` entries can go. Left in WP5: the web page
   polish, the 15 Nov rehearsals with the backup recordings (`demo/recordings/`), the film opener cut, the
   hand-over to the Airbnb laptop (the guide's last section).
4. Manish's next Mac sitting, in order: the Google client (5 minutes), the two Google consents, the
   Peer's Codex login (before 8 Nov 02:25). Done: "open window" (the Slack sign-in, 18:18 on 6 Nov).

For WP4 (from spike 1d): "Peer" transcribes as "pier", so addressed-detection accepts
homophones; pad each clip with about 1 s of silence (the first second is clipped);
`output_audio` needs `automatic_audio_output` set when the bot is created; the real-time path
(`realtime_endpoints`) needs the `cloudflared` tunnel and is untested. The test meeting "AI Peer
test" stays for WP4 unless Manish deletes it.

## Checkpoints (D15)

| # | Scene | Status |
|---|---|---|
| 1 | S1 Slack cover | **Done 18:25 on 6 Nov**: the checkpoint message (the two recorded walks' videos, how to try it) went to the controller for Manish's Telegram; **sent to him at 18:26:57** (Attention group, the text and both videos, by controller-3). Recorded walks 4 (online, Send clicked in the Peer's browser, 18:18 to 18:20) and 5 (away, 18:20 to 18:22) passed ([evidence](evidence/wp1/s1-walks.md)). Earlier: away on Claude and Codex (02:54, 02:56 on 5 Nov), online with Manish's tap (15:26 to 15:29); PR #1 merged 15:31 on 5 Nov |
| 2 | S2 daily brief + setup page | not started |
| 3 | S3 meeting | **Live walk passed 21:23 to 21:33 on 6 Nov** (`ai-peer-wp4-2`, `--auto-click`, ElevenLabs voices); the checkpoint (the mixed recording `~/.ai-peer/manish/meeting-runs/m2db7aebe/recording.mp4` and how to try it) goes to Manish's Telegram Attention when he wakes (about 02:30 UTC on 7 Nov), so it does not wake him |

## Settled, do not re-open

- Everything in DESIGN §0 (D1 to D16).
- No unit tests, CI, code review or quality gate (D13). Do not add them.
- The upstream-break warning is an extra only (D3).
- The Peer never touches LLM production and is read-only on LLM code.
- **A real person is in the test Slack.** `preethi` in the learnlikemagic workspace is a
  real person (Manish confirmed 14:55 UTC). The Peer and the scenario script never
  message, DM, mention or reply to her: the Peer engages only with Manish and the
  invented colleagues (hard block in code), and the scene channels are created without
  her.
- **Never Manish's cloned voice.** His ElevenLabs library holds a voice cloned from him
  ("Manish Jain"). The Peer never uses it: it speaks only as its own labelled identity (D9).

## Manish's answers

| Time (UTC) | Question | His words, verbatim |
|---|---|---|
| 15:20 | Fake colleagues: A) real member accounts (recommended) or B) one scenario bot | "A (real accounts, recommended) - sure" |
| 11-05 01:50 | (after the morning catch-up) Say "go" and I resend the Zoom steps | "go" |
| 11-05 01:54 | (Zoom steps; he sent a screenshot of the saved meeting and its invite link) | "can you do step 5 yourself." |
| 11-05 02:05 | (colleague steps; screenshot of the Google Admin console signed in as admin@learnlikemagic.com) | "can you do all the other steps needed yourself. i logged into the google admin account in browser - you can use that. i authorise you." |
| 11-05 15:17 | (to ai-peer-controller-2, after "Anything needs me?": the Peer's Slack sign-in, step 5) | "Ready" |
| 11-05 15:26 | (Slack's "I'm not a robot" check stopped the headless sign-in; a person must do it, so the sign-in waits for him at the Mac, "open window"; meanwhile the S1-online walk with his own tap on Send) | "Online walk" |
| 11-05 15:33 | (WP2's three F7 changes: the Claude Code session-end hook in his synced settings, the same hook in Codex, the hourly read-only scan of `~/repos`; recommended yes to all) | "Yes to all" |
| 11-06 about 17:20 | (to ai-peer-controller-2; usage read 94% at 17:22) | "I think the usage now is above 90%, so we might have to switch the subscription and continue working in a new session with the different subscription. So as we generally do, please prepare that handoff and give me the steps that I need to do, like generally how you give me that one command that I need to run after switching the subscription, that reliably carries over the ownership to that new session in the different subscription." |
| 11-06 18:06 | (to ai-peer-controller-3, typed in its session, after the 18:03 Attention ask for the Peer's Slack sign-in; relayed to `ai-peer-wp1-3` at once) | "open window" |
| 11-06 18:20 | (to ai-peer-controller-3, after the sign-in passed and the Google client steps were sent) | "going to sleep now. will check back in the morning. please continue whatever work you can in the meantime" |

## Airbnb notes

Answers to the Airbnb asks land here, with date and source.

## Lessons

What went wrong once, with its mechanism.

- From `ai-peer-controller-3` (6 Nov): `sed -i "${L}i ..."` with an empty `L` (an anchor grep that
  found nothing) inserts the text before every line; it doubled STATE locally (caught by `git diff
  --stat` before any commit; restored with `git checkout`). Guard line-number edits (`[ -n "$L" ]`) or
  use an exact-text edit. Also: after the account switch, the new login's Claude Code project list
  did not name the worker worktrees, yet worktrees of this repo launched with no trust dialog; and
  System Events cannot tell two Chrome instances apart by pid (it returned Manish's own Chrome).

- The live Peer runs from a worktree: its brain skill links (`~/.ai-peer/manish/.claude/skills/peer-brain`,
  `.agents/skills/peer-brain`) point into it, and any memory set-up for owner `manish` from another
  worktree re-points them (`install_skill` in `peer/memory/layout.py`). **But `peer start` alone does not**
  (found by `ai-peer-controller-4`'s review, 6 Nov): only `Memory.ensure()` (discovery, the nightly pass) calls
  `install_skill`, so a Peer restarted from a new worktree keeps the old worktree's playbooks. Before the
  restart, run `install_skill` from the new worktree and check both links with `readlink`. Without `AI_PEER_OWNER`
  every `peer` command acts on `manish`, whose `settings.yaml` the live Peer re-reads at once. A
  second Socket Mode connection splits the app's events. So: one live Peer, one worker at a time.
- `~/.codex/config.toml` already has a `notify` line (Codex Computer Use); a second one is invalid
  TOML and Codex will not start.

- Chrome's View > Developer > "Allow JavaScript from Apple Events" is per profile and ignores
  every scripted change (a System Events click, opened menus, the keyboard), on and off; only
  a person's click works. His Work profile had it off; Default and Profile 2 had it on.
- Chrome window ids exceed AppleScript's integer range, so `window id <n>` from an argument
  fails: match `(id of w) as text` instead.
- Slack's join form ignores a JS click; `form.requestSubmit()` works, sometimes only on a retry
  a few seconds after load. Slack confirmation codes are XXX-XXX letters and digits.
- Gmail treats all of an account's aliases as "you": a `to:<alias>` search matches every
  alias's mail, so read each message's own To.
- Slack's manifest editor is CodeMirror: `insertText` lands at the cursor among the template;
  a real Cmd+A, Cmd+V replaces it; verify from lines outside `.CodeMirror-measure`.
- Browser automation in the controller cost about 20% of its 1M context (the colleague
  setup): give such jobs to a sub-agent or a fresh session.

- Driving Chrome by AppleScript (`execute javascript`, bridge in the LLM repo's
  `.claude/skills/ship-chapter-monitor/scripts/eval.applescript`): the script runs in an
  isolated world, so page JS objects are invisible; text inputs need
  `document.execCommand("insertText")`; a value the page only offers by clipboard needs
  a main-world script tag that overrides `navigator.clipboard.writeText` (works on
  Recall, blocked on api.slack.com). From the kickoff session, 2026-11-04.
- The idle hook misses the controller's asks: worker messages wake the controller within
  the hook's 60 seconds, so no ping fires (the 15:20 Zoom ask reached Telegram only by
  hand, at 15:23). Every ask to Manish goes to the Attention group explicitly
  (`tg-attention.sh`); the hook's pings are only a bonus.

- From WP1 (`ai-peer-wp1-1` and `-2`, 5 Nov):
  - A person's Slack post sent through an app (a user token) carries the app's `bot_id`; filter
    bots by the user (`users.info` `is_bot`), not by `bot_id`.
  - `codex exec --ignore-user-config` still loads `~/.codex/AGENTS.md` and the user's skills;
    isolate with the run's own `CODEX_HOME` and `HOME` (also in `~/claude-config/lessons/`).
  - Brain effort is a latency choice: S1 answers at max took 113 to 139 s, at high 21 to 27 s.
  - Slack's free plan accepts a profile title through the API and keeps it empty.
  - Discovery at max effort cost about 15 weekly-usage points (53% at 02:55, "allowed_warning").
    Re-run discovery only when needed, or at `summary_effort: high`.
  - Slack's sign-in page showed a headless Playwright Chrome an "I'm not a robot" check
    (reCAPTCHA) after the email, so no code was mailed, and the script still printed "code
    requested" because it never looked. A person signs in through a window
    (`peer browser login`); a script never ticks that box. Check the page before reporting a step.
  - The Peer's browser sets its own UA (headless Chrome says "HeadlessChrome"). A stale Chrome
    version in it (142, with 156 installed) made Slack warn it stops supporting that browser on
    9 Nov 2026; the UA now takes the installed version.
  - (`ai-peer-wp1-3`, 6 Nov) The first `peer browser login` window (18:06) was not on Manish's screen at
    18:12 (CGWindowList: none of its windows on screen). At 18:14 it was in front, but on Google's
    "unusual traffic" puzzle after a "slack login" search typed into its address bar (Google flags the
    automated Chrome too). Reopened at 18:15, it came up in front, and he was in by 18:18. So check the
    window yourself, read-only, before saying "window up": CGWindowList for the Chrome pid (`onscreen`),
    and `screencapture -l <window id>` shows the page he sees without touching the profile. Tell him it
    is its own Chrome window and to type only into the Slack page. It now waits 30 minutes (PR #4):
    15 ran short with the steps relayed through the controller.

- Hooks can be tested without touching global settings: `claude -p ... --setting-sources project --settings '{"hooks":{"SessionEnd":[...]}}'` fires the SessionEnd hook (2.1.318; payload has session_id, transcript_path, cwd, reason). Codex 0.153.4 has a SessionEnd event, but `codex exec` fired no hook in five variants (`-c hooks.*`, `features.hooks`, `bypass_hook_trust`, a private `CODEX_HOME/hooks.json`); a `codex exec` in a fresh `CODEX_HOME` hangs until stdin is `/dev/null`. (ai-peer-wp2-1, 5 Nov)
- (`ai-peer-wp4-1`, 6 Nov) Spoken "Peer" is not a reliable word to spot in Recall's low-latency transcript: it came back as "pier", as "here" at the start of a line, as "ipa" for "AI Peer", and once vanished. A second `output_audio` clip sent while one plays is mixed on top of it (not queued or refused); a `DELETE` on it cuts within about 1 s. Evidence: `docs/build/evidence/wp4/spike.md` on `wp4-meeting`.
- (`ai-peer-wp4-1`, 6 Nov) A Recall bot records only after another participant joins (`start_recording_on` defaults to `participant_join`): a bot alone in the call sits in `in_call_not_recording` and leaves on `noone_joined_timeout`. Set `start_recording_on: call_join`. Its silence rule (`silence_detection`) counts only the others' speech.
- (`ai-peer-wp5-1`, 6 Nov) An owner's `settings.yaml` is a full copy of `peer/defaults.yaml`, made by that owner's
  first command, and merged deep with the live file winning key by key: a new default reaches existing owners, a
  changed one never does. Change it with `peer set` or in the owner's file.
- (`ai-peer-wp5-1`, 6 Nov) A passing check is not a complete guide: the porting walk's toy adapter passed `port-check`
  on its first run, yet the fresh sub-agent listed 11 gaps; the biggest, `port-check` runs only the adapter's own
  sample, so it cannot see whether a chat adapter takes what the executor sends. Walk a guide with a stranger on a
  plain `git archive` export and ask for its gaps, not only a pass.

## Session log

| Date | Session | What happened | Outcome |
|---|---|---|---|
| 2026-11-04 | kickoff | Read the film repo and film; three research passes; 14-question interview; restructure; docs | D1 to D16 locked; docs on `main` |
| 2026-11-04 | ai-peer-controller-1 | Read the brief; created the WP1 worktree; started `ai-peer-wp1-1` (window 1725, max effort, remote control, no trust dialog) | WP1 running |
| 2026-11-05 | ai-peer-controller-1 | Relayed WP1's asks (colleagues: A; the Zoom test meeting); did the colleague setup in Manish's Chrome at his word; watched spikes 1c and 1d pass; drafted the WP2 and WP3 briefs; handed off at 42% | Live S1 walks running; asks queued in "Needs Manish" |
| 2026-11-05 | ai-peer-wp1-1 | Spikes 1a, 1b, 1d passed (1c all but the click); built `peer/` (adapters, store, memory and discovery, brain on Claude and Codex, executor, watcher, presence, scenarios, page, CLI); S1 dry runs; colleague tooling and channels; S1-away live on Claude and Codex; handed off at 44.2% | Draft PR #1; S1-online, screenshots, Checkpoint 1 and the merge go to `ai-peer-wp1-2` |
| 2026-11-05 | ai-peer-controller-2 | Took over at 02:58 (context 8.5%); told ai-peer-wp1-1; re-sent the sign-in ask on Attention; closed windows 1715 and 1725 (both idle, no child processes; the Peer detached, still running); started `ai-peer-wp1-2` (window 2049) at 03:01 | Waiting on Manish's "ready"; at 10:45 started `ai-peer-wp2-1` early (window 2129) after a read-only review of its brief; relayed "Ready", the robot check, "Online walk" and "Yes to all"; WP1 merged 15:31, WP2 merged 16:19 and closed; started `ai-peer-wp3-1` at 16:34 after a review of its brief |
| 2026-11-06 | ai-peer-controller-2 | Usage read 94% at 17:22 (old account); at Manish's word both workers handed off (`HANDOFF-2026-11-06-ai-peer-wp1-3.md`, `HANDOFF-2026-11-06-ai-peer-wp3-2.md`) and it wrote `HANDOFF-2026-11-06-ai-peer-controller-3.md` with the launch line; handed off at 37.5% context, 17:26 | Manish switches the subscription and starts ai-peer-controller-3 |
| 2026-11-05 | ai-peer-wp1-2 | Read in; made the Peer's browser report the installed Chrome (Slack's 9 Nov cut-off); the headless Slack sign-in met a robot check (no code sent), so it now says so and a person signs in through a window; S1-online live with Manish's own tap on Send (spike 1c complete); evidence; PR #1 body updated, merged with a merge commit | WP1 merged 15:31 (183fabe); the recorded walks, screenshots and Checkpoint 1 wait for "open window" |
| 2026-11-05 | ai-peer-wp2-1 | Read in; built F1 to F7 on WP1's branch (setup page with live discovery, what I learned with corrections, roles and settings, activity log in the film's look; fresh memory, self-tuning, local work); walked all seven on test owner `wp2test`; draft PR #2 | Live walks wait for PR #1; asks queued with the controller |
| 2026-11-05 | ai-peer-wp2-1 | After WP1's merge: merged main in, cheap re-walks; installed the F7 hooks and the `~/repos` scan at Manish's word (a real session end landed in the spool); ran the live Peer from its worktree; walked the away switch live; added cost guards (no AI on the poll; nightly only in its window); merged PR #2 (88ac13e) | Live F5 DM check left in Next; stopped |
| 2026-11-05/06 | ai-peer-wp3-1 | Read in; Google setup steps checked (step 6 gained `openid email`); built the google adapter, seeds, S2 brief (DM + `/brief`), heads-ups, Draft reply / Send email / Accept behind a hard block, the morning schedule and "brief me", the Docs and Calendar steps; the S2 dry walk passed; draft PR #3 | Handed off 17:27 on 6 Nov (account switch) to `ai-peer-wp3-2`: the Google client, logins, spike and live walk wait on Manish at the Mac |
| 2026-11-06 | ai-peer-wp1-2 | Checked the walk recorder (video, screenshots, mp4) in a throwaway profile; handed off at 19.3% on the controller's word (weekly usage 94%) | [HANDOFF-2026-11-06-ai-peer-wp1-3.md](handoffs/HANDOFF-2026-11-06-ai-peer-wp1-3.md); no successor spawned |
| 2026-11-06 | ai-peer-controller-3 | Took over at 17:56 on the new subscription (weekly 33%, context 8%); window 2048 was already gone; closed 2049 and 2216 (idle, no child processes, hand-offs pushed); started `ai-peer-wp1-3` (2442) and `ai-peer-wp3-2` (2445) at 18:00 in their worktrees (no trust dialog); re-armed the watcher; asked Manish for "open window" on Attention (18:03) | Both workers live; then: relayed "open window" (18:06) and found the hidden sign-in window with `ai-peer-wp1-3` (sign-in 18:18); sent Checkpoint 1 (18:26:57); closed `ai-peer-wp1-3` (18:29); wrote WP4's brief, had it reviewed (18 findings, all folded), started `ai-peer-wp4-1` (window 2595, 18:52); closed it after its dry walk and hand-off (19:52); wrote WP5's brief, had it reviewed (8 findings, all folded), started `ai-peer-wp5-1` (window 2607, 20:10); `ai-peer-wp4-2` waits for the live Peer; closed `ai-peer-wp5-1` after WP5's first part merged (20:42); had `ai-peer-wp3-2` merge main into PR #3 (20:46, clean); handed off at 40.6% to `ai-peer-controller-4` (20:47) |
| 2026-11-06 | ai-peer-wp1-3 | Read in (context 9%); took over the live Peer (no restart) and fast-forwarded to main; on "open window" (18:06) opened the sign-in window, which was off his screen and then on a Google puzzle, so reopened it in front with 30 minutes (18:15); Manish signed in 18:18; recorded walks 4 (S1-online, Send clicked in the Peer's browser) and 5 (S1-away) passed 18:18 to 18:22; evidence on `main`; Checkpoint 1 to the controller 18:25; PR #4 (the login waits 30 minutes) merged | WP1 complete; worktree kept; the live Peer released to the controller |
| 2026-11-06 | ai-peer-wp4-1 | Read in (context 14%); venv, `cloudflared`; test owner `wp4test`; the spike on the test meeting (three short meetings, two bots, local voices): real-time transcript, the warm session, speech, the whole loop; draft PR #5 | Spike passed 19:15: the answer is heard 7.3 to 8.1 s after a question; the build goes on |
| 2026-11-06 | ai-peer-wp4-1 | Built S3 on the spike: the update card (Approve update / Edit / Skip), the meeting session, the brief, the colleague bot and walk, the Meetings page and calendar link (a sub-agent); two dry runs failed and were fixed (recording on call join; the assistant rule); dry walk 3 passed 19:47; ElevenLabs checked | Handed off 19:55 at 42% to `ai-peer-wp4-2` for the live walk and the merge |
| 2026-11-06 | ai-peer-wp5-1 | Read in (context 21%); venv; test owner `wp5test`; `port-check` with an `adapters:` list in settings, its FAIL paths proven on broken adapters; the porting guide; the porting walk (a fresh sub-agent on an export of the branch, the toy "teamchat" from the guide alone) passed, its 11 gaps folded; the demo script; PR #6 merged 20:39 (b877a87) | WP5's first part done; stopped at context 36%, weekly 42% |
| 2026-11-06 | ai-peer-controller-4 | Took over at 20:49 (context 10%, weekly 42%); closed window 2408 (idle); told `ai-peer-wp3-2`; re-armed the watcher; moved WP4's live walk ahead of WP3's (WP3 waits for the Google client); a read-only review of the plan found 9 points, each checked in the code and folded into a kickoff (saved as `KICKOFF-2026-11-06-ai-peer-wp4-2.md`); started `ai-peer-wp4-2` (window 2610) at 21:17 | WP4's live walk under way; WP3 merges main after PR #5 |
