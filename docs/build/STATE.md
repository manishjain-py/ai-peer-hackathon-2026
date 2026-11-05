# AI Peer build: state

The tracker. Every session updates it at each milestone; the controller at least
hourly while workers run. Times UTC. Decisions: [DESIGN §0](DESIGN.md). Plan: [PLAN](PLAN.md).

## Where we are

2026-11-04 18:03. WP1 (foundation + S1) is running: `ai-peer-wp1-1` in
`~/repos/ai-peer-wp1` on `wp1-foundation`.

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
- Still running: the controller's watcher (background task of `ai-peer-controller-1`,
  started 16:12; ends with that session). It wakes the controller when a `.env` key name
  appears, a PR changes, the worker passes 45% context or exits, else hourly. The worker's two
  waiters run until about 18:05 on 5 Nov: spike 1d starts by itself 60 s after
  `ZOOM_TEST_MEETING_URL` appears in `.env`; the colleague sign-in helper starts when
  `SLACK_SCENARIO_CLIENT_ID` and `_SECRET` appear (it writes
  `~/.ai-peer/world-auth-link.txt` for his step 4). Controller context 17.5% at 16:12.
- **Weekly usage 51% at 01:48 on 5 Nov** (35% at 15:22 on 4 Nov): about 1.5 points an hour,
  almost all from the Learn Like Magic sessions on this account while this build sat idle.
  At that pace 95% comes around 07:00 UTC on 6 Nov; the reset is 10 Nov, 04:29 IST. Told
  Manish 01:50 on 5 Nov; per D14 Codex is the backup builder. Worker context 37% at 18:03 (idle, waiting on the setup steps).

| Session | Window | Worktree | Branch / PR | Job |
|---|---|---|---|---|
| kickoff, registry name `learnlikemagic-27` | 1661 | `~/repos/ai-peer-hackathon-2026` | `main` | Interview, docs, restructure, Slack, Recall, ElevenLabs, GitHub set up; handed off at 46% (about 15:07); its window stays open until Manish closes it (it told him he may). The controller owns every ask to Manish |
| ai-peer-controller-1 | 1715 | `~/repos/ai-peer-hackathon-2026` | `main` (docs only) | Runs the build; https://claude.ai/code/session_01Nfn5h9PisnJvGpbLbRtbiB |
| ai-peer-wp1-1 | 1725 | `~/repos/ai-peer-wp1` | `wp1-foundation`, draft PR #1 | WP1 foundation + S1; idle pings off (`CLAUDE_NO_IDLE_PING=1`), asks go through the controller; https://claude.ai/code/session_01Nfn5h8PVD6txxjBUfab4nR |

## Needs Manish

The controller asks one at a time, in this order.

1. **Sent 01:54 on 5 Nov, waiting:** the colleague accounts (his pick A), about 25 minutes at
   the Mac, steps in `docs/build/setup/slack-colleagues.md` on the branch; its last step is
   one Slack sign-in in the Peer's own Chrome profile (`peer browser login`) for screenshots,
   the walk's Send click and the Checkpoint 1 recording.
2. Done 01:54 on 5 Nov: the Zoom test meeting "AI Peer test" (he made it; the controller
   wrote its link to `.env` at his request, value never echoed). Spike 1d starts by itself.
3. One command for the Peer's own Codex login (today it uses a copy of his token, good
   until about 7 Nov).
4. The Google Internal OAuth client (WP3).
5. The Airbnb asks in PLAN, this week.
6. His other Mac's copy (`~/repos/Hackathon 2026`, per the `$ai-peer` skill) predates
   the `film/` move: push anything unpushed there, then pull.
7. Optional housekeeping: delete the unused Recall key "ai-peer" in the Recall dashboard.

Chrome: Manish let the kickoff session do setup steps in his logged-in Chrome. At 02:05 on
5 Nov he authorised the controller to do the remaining colleague setup steps the same way
(quote in "Manish's answers"). Any other new use still needs his word.

## Next

1. WP1: finish 1c (hear + click), the colleague setup after Manish's pick, then the
   build; 1d once the Recall key and the Zoom connection are in.
2. WP1 done → Checkpoint 1 → WP2 and WP3 in parallel. Their brief drafts (17:16) sit in
   the controller's scratchpad,
   `/private/tmp/claude-501/-Users-manishjain-repos-ai-peer-hackathon-2026/ce734d56-18c2-403f-826e-b980254d3571/scratchpad/draft-HANDOFF-ai-peer-wp{2,3}-1.md`;
   at the merge: re-check every cited line on the new head, a read-only check for stale
   facts, then push them as the dated briefs and spawn. The film's look for both: colours in
   `film/video/src/draft02/Shared.tsx`, screens in `film/video/src/draft07/SetupScene.tsx`,
   `StoryScenes.tsx` and `film/video/src/draft05/PersonalBrief.tsx` (the film's screens say
   "OneAirbnb" and "AirChat": not in build files).

For WP4 (from spike 1d): "Peer" transcribes as "pier", so addressed-detection accepts
homophones; pad each clip with about 1 s of silence (the first second is clipped);
`output_audio` needs `automatic_audio_output` set when the bot is created; the real-time path
(`realtime_endpoints`) needs the `cloudflared` tunnel and is untested. The test meeting "AI Peer
test" stays for WP4 unless Manish deletes it.

## Checkpoints (D15)

| # | Scene | Status |
|---|---|---|
| 1 | S1 Slack cover | not started |
| 2 | S2 daily brief + setup page | not started |
| 3 | S3 meeting | not started |

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

## Airbnb notes

Answers to the Airbnb asks land here, with date and source.

## Lessons

What went wrong once, with its mechanism.

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

## Session log

| Date | Session | What happened | Outcome |
|---|---|---|---|
| 2026-11-04 | kickoff | Read the film repo and film; three research passes; 14-question interview; restructure; docs | D1 to D16 locked; docs on `main` |
| 2026-11-04 | ai-peer-controller-1 | Read the brief; created the WP1 worktree; started `ai-peer-wp1-1` (window 1725, max effort, remote control, no trust dialog) | WP1 running |
