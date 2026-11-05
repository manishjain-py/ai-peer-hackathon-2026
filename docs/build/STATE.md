# AI Peer build: state

The tracker. Every session updates it at each milestone; the controller at least
hourly while workers run. Times UTC. Decisions: [DESIGN §0](DESIGN.md). Plan: [PLAN](PLAN.md).

## Where we are

2026-11-05 13:52. WP1 (foundation + S1) is running: `ai-peer-wp1-2` in `~/repos/ai-peer-wp1` on
`wp1-foundation`. S1-away passes live; S1-online and the evidence wait on the Peer's Slack
sign-in (Manish's "ready"). **WP2 started early** (10:45): `ai-peer-wp2-1` in `~/repos/ai-peer-wp2`
on `wp2-setup-memory`. Live controller: `ai-peer-controller-2`.

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
- **S1-away passes live** (worker's report, 02:58 on 5 Nov) in #schools from the scenario
  script: on Claude (02:54) the Peer answered Lakshmi in the thread in 40 s (who it is,
  "Manish is offline (8:24 AM in India)", the answer from today's real tracker with sources
  PR #708, PR #705, certainty and date, no commitments), her follow-up in 37 s, and one
  "While you were away" DM updated in place; on Codex (02:56, one setting) the same walk in
  37 s and 34 s, so **F8 is done**; spike 1c is complete. Left in WP1: S1-online (draft DM and
  the Send click) and the screenshots and video, which wait on the Peer's browser sign-in.
- **Live S1 started** (02:46 on 5 Nov): channels #product, #content, #schools and
  #engineering hold exactly the five colleagues, Manish and the Peer (preethi in none,
  checked). The Peer runs live (pid in `~/.ai-peer/manish/watch.pid`; the worker's process).
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
- Still running: the controller's watcher (background task of `ai-peer-controller-2`,
  `watch2.zsh`, re-armed 10:45 on 5 Nov for `ai-peer-wp1-2` and `ai-peer-wp2-1`; ends with that
  session). It wakes the controller when a `.env` key name appears, a PR changes, a worker passes
  45% context or exits, else after 55 minutes. The live Peer (pid in `~/.ai-peer/manish/watch.pid`, detached,
  page http://127.0.0.1:8787) is the WP1 worker's. Earlier note, from before 02:58: the worker's two
  waiters run until about 18:05 on 5 Nov: spike 1d starts by itself 60 s after
  `ZOOM_TEST_MEETING_URL` appears in `.env`; the colleague sign-in helper starts when
  `SLACK_SCENARIO_CLIENT_ID` and `_SECRET` appear (it writes
  `~/.ai-peer/world-auth-link.txt` for his step 4). Controller-2 context 8.5% at 02:59.
- **Weekly usage 59% at 11:18 on 5 Nov** (55% at 07:41; 54% at 02:59; 35% at 15:22 on 4 Nov):
  about 4 points from WP2's 35-minute build and its brief's review; about 1 point in the 4.7 h
  before, while the build waited. The reset is 10 Nov, 04:30 IST; per D14 Codex is the backup builder at about 95%.
  `ai-peer-wp1-2` read in, context 10% at 13:52, waiting for "go login" (it also fixed the Peer
  browser's old Chrome version, which Slack would stop supporting on 9 Nov).

| Session | Window | Worktree | Branch / PR | Job |
|---|---|---|---|---|
| kickoff, registry name `learnlikemagic-27` | 1661 | `~/repos/ai-peer-hackathon-2026` | `main` | Interview, docs, restructure, Slack, Recall, ElevenLabs, GitHub set up; handed off at 46% (about 15:07); its window stays open until Manish closes it (it told him he may). The controller owns every ask to Manish |
| ai-peer-controller-1 | 1715 (closed 03:01 by controller-2) | `~/repos/ai-peer-hackathon-2026` | `main` (docs only) | Handed off at 42% (02:57 on 5 Nov) to ai-peer-controller-2; stopped; https://claude.ai/code/session_01Nfn5h9PisnJvGpbLbRtbiB |
| **ai-peer-controller-2** (live controller) | 2048 (pid 52453) | `~/repos/ai-peer-hackathon-2026` | `main` (docs only) | Runs the build from `handoffs/HANDOFF-2026-11-05-ai-peer-controller-2.md`; https://claude.ai/code/session_01Nfn5h8mSoWxqjYkbP3JnvB |
| ai-peer-wp1-1 | 1725 (closed 03:01 by controller-2) | `~/repos/ai-peer-wp1` | `wp1-foundation`, draft PR #1 | WP1 foundation + S1. Handed off at 44.2% (2026-11-05 03:02 UTC) to `ai-peer-wp1-2` ([hand-off](handoffs/HANDOFF-2026-11-05-ai-peer-wp1-2.md)); stopped. The Peer it started keeps running (`peer stop`/`peer start`, pid file); https://claude.ai/code/session_01Nfn5h8PVD6txxjBUfab4nR |
| **ai-peer-wp1-2** | 2049 (pid 54508) | `~/repos/ai-peer-wp1` | `wp1-foundation`, draft PR #1 | Started 03:01 by controller-2 from [its hand-off](handoffs/HANDOFF-2026-11-05-ai-peer-wp1-2.md): the Peer's Slack sign-in (on "go login"), S1-online, screenshots and video, Checkpoint 1, the merge; idle pings off; https://claude.ai/code/session_01Nfn5h9oCzikhfgVU9KBwCz |
| **ai-peer-wp2-1** | (Terminal, started by controller-2) | `~/repos/ai-peer-wp2` | `wp2-setup-memory`, draft [PR #2](https://github.com/manishjain-py/ai-peer-hackathon-2026/pull/2) | WP2 (F1 to F7) from [its hand-off](handoffs/HANDOFF-2026-11-05-ai-peer-wp2-1.md). 11:17: all seven walked on test owner `wp2test` (dry runs, page on 8788; evidence `docs/build/evidence/wp2/walks.md` on the branch); live walks wait for PR #1; 4 asks for Manish sent to the controller (Claude hook, scan folders, Codex hook, Slack `reaction_added`); context 33%; https://claude.ai/code/session_01Nfn5h6apXjAgQuN9wUq54K |
| **ai-peer-wp2-1** | 2129 (pid 43454) | `~/repos/ai-peer-wp2` | `wp2-setup-memory` (from `wp1-foundation` 4fb4869), no PR yet | Started 10:45 by controller-2 from [its brief](handoffs/HANDOFF-2026-11-05-ai-peer-wp2-1.md): F1 to F7, the setup page; pre-merge rules keep it off the live Peer; idle pings off; https://claude.ai/code/session_01Nfn5h6apXjAgQuN9wUq54K |

## Needs Manish

The controller asks one at a time, in this order.

1. **Waiting, the build's only blocker (asked 02:47 on 5 Nov; again 02:59, and reminders at 04:53 and 12:56, by ai-peer-controller-2 on Attention):**
   step 5, the Peer's own Slack sign-in. The worker types
   manish@learnlikemagic.com on Slack's sign-in page; Manish reads the code Slack mails to
   manish@ (no Chrome profile the controller can drive has that inbox) and it goes into
   `~/.ai-peer/slack-login-code.txt`. The controller sends the worker "go login" when he is
   ready. Then, when convenient: untick View > Developer > "Allow JavaScript from Apple
   Events" in his Work Chrome window (Chrome ignores scripted changes to it, both ways).
2. **F7 local work** (from `ai-peer-wp2-1`, 11:17), one yes or no for three small changes;
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
5. The Google Internal OAuth client (WP3 writes the steps when it starts).
6. The Airbnb asks in PLAN, this week.
7. His other Mac's copy (`~/repos/Hackathon 2026`, per the `$ai-peer` skill) predates
   the `film/` move: push anything unpushed there, then pull.
8. Optional housekeeping: delete the unused Recall key "ai-peer" in the Recall dashboard.

Chrome: Manish let the kickoff session do setup steps in his logged-in Chrome. At 02:05 on
5 Nov he authorised the controller to do the remaining colleague setup steps the same way
(quote in "Manish's answers"). Any other new use still needs his word.

## Next

1. WP1 (`ai-peer-wp1-2`): on Manish's "ready", the controller sends "go login"; then S1-online,
   the away and online recordings, evidence, Checkpoint 1, merge PR #1 **with a merge commit**.
2. WP2 (`ai-peer-wp2-1`, since 10:45): builds F1 to F7 under its pre-merge rules; at the WP1 merge
   the controller tells it to merge `origin/main` in. After the merge there is one live Peer
   (owner `manish`); the controller hands it to one worker at a time for live walks.
3. At the WP1 merge: finalise `docs/build/handoffs/DRAFT-ai-peer-wp3-1.md` (re-check its cited
   lines on the new head, a read-only check for stale facts and risks to the live Peer, the same
   pre-merge lessons as WP2's brief), create `~/repos/ai-peer-wp3` (`wp3-google-brief`), spawn.
   Never remove `~/repos/ai-peer-wp1` while the live Peer runs from it.

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

- The live Peer runs from a worktree: its brain skill links (`~/.ai-peer/manish/.claude/skills/peer-brain`,
  `.agents/skills/peer-brain`) point into it, and any memory set-up for owner `manish` from another
  worktree re-points them (`install_skill` in `peer/memory/layout.py`). Without `AI_PEER_OWNER`
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

- Hooks can be tested without touching global settings: `claude -p ... --setting-sources project --settings '{"hooks":{"SessionEnd":[...]}}'` fires the SessionEnd hook (2.1.318; payload has session_id, transcript_path, cwd, reason). Codex 0.153.4 has a SessionEnd event, but `codex exec` fired no hook in five variants (`-c hooks.*`, `features.hooks`, `bypass_hook_trust`, a private `CODEX_HOME/hooks.json`); a `codex exec` in a fresh `CODEX_HOME` hangs until stdin is `/dev/null`. (ai-peer-wp2-1, 5 Nov)

## Session log

| Date | Session | What happened | Outcome |
|---|---|---|---|
| 2026-11-04 | kickoff | Read the film repo and film; three research passes; 14-question interview; restructure; docs | D1 to D16 locked; docs on `main` |
| 2026-11-04 | ai-peer-controller-1 | Read the brief; created the WP1 worktree; started `ai-peer-wp1-1` (window 1725, max effort, remote control, no trust dialog) | WP1 running |
| 2026-11-05 | ai-peer-controller-1 | Relayed WP1's asks (colleagues: A; the Zoom test meeting); did the colleague setup in Manish's Chrome at his word; watched spikes 1c and 1d pass; drafted the WP2 and WP3 briefs; handed off at 42% | Live S1 walks running; asks queued in "Needs Manish" |
| 2026-11-05 | ai-peer-wp1-1 | Spikes 1a, 1b, 1d passed (1c all but the click); built `peer/` (adapters, store, memory and discovery, brain on Claude and Codex, executor, watcher, presence, scenarios, page, CLI); S1 dry runs; colleague tooling and channels; S1-away live on Claude and Codex; handed off at 44.2% | Draft PR #1; S1-online, screenshots, Checkpoint 1 and the merge go to `ai-peer-wp1-2` |
| 2026-11-05 | ai-peer-controller-2 | Took over at 02:58 (context 8.5%); told ai-peer-wp1-1; re-sent the sign-in ask on Attention; closed windows 1715 and 1725 (both idle, no child processes; the Peer detached, still running); started `ai-peer-wp1-2` (window 2049) at 03:01 | Waiting on Manish's "ready"; at 10:45 started `ai-peer-wp2-1` early (window 2129) after a read-only review of its brief |
| 2026-11-05 | ai-peer-wp2-1 | Read in; built F1 to F7 on WP1's branch (setup page with live discovery, what I learned with corrections, roles and settings, activity log in the film's look; fresh memory, self-tuning, local work); walked all seven on test owner `wp2test`; draft PR #2 | Live walks wait for PR #1; asks queued with the controller |
