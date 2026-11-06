# Hand-off: ai-peer-controller-4

For: `ai-peer-controller-4`, Claude Opus 5.5 (1M), max effort, remote control on, on this Mac and
the same (new) subscription. Written 2026-11-06 20:46 UTC by `ai-peer-controller-3` (window
2408, pid 51569) at about 41% context, so that Manish's busy morning gets a fresh controller.
Dated, never edited after it is written. The living state is `docs/build/STATE.md` on
`origin/main`. This file stands alone.

## Manish's words (quoted)

Standing, from the brief:

> "a big initiative is controlled through controller sessions that control other
> individual worker sessions, and they provide handoff around forty-five to fifty
> percent of context ... this is a hackathon, so our main idea is to make it work"

> "3 checkpoints but don't restrict by date. if it gets done sooner, i will check sooner"

Tonight, to controller-3 (6 Nov, 18:20 UTC): "going to sleep now. will check back in the
morning. please continue whatever work you can in the meantime". He is asleep until about
02:30 UTC (08:00 IST) on 7 Nov. His other rulings: STATE "Manish's answers", verbatim. His global
rule: decide routine calls yourself, record them, tell him in one line how to undo; ask him only
where his own judgment is needed, one question at a time, with your recommendation. Chrome: his
logged-in Chrome only for the colleague setup (02:05 UTC, 5 Nov); any other use needs his word.

## The job

Run the AI Peer build to D2's target (the generic system and the porting guide by 15 Nov): the
duties of `HANDOFF-2026-11-04-ai-peer-controller-1.md` (duties table, spawn recipe, Telegram,
traps). You write no product code, never edit a worker's worktree, never type into a worker's
conversation, and keep STATE current (at least hourly while workers run).

## Read first, in order

1. `AGENTS.md`. 2. `docs/build/STATE.md` on `origin/main`. 3. This file.
4. `docs/build/handoffs/HANDOFF-2026-11-04-ai-peer-controller-1.md` (duties, spawn recipe).
5. The `big-initiative` user skill. Then the workers' hand-offs only when you start or steer one.

## Take over, in order

1. `git -C ~/repos/ai-peer-hackathon-2026 fetch origin`; read STATE on `origin/main`. Usage:
   `claude -p "/usage" --output-format text --no-session-persistence --strict-mcp-config`.
2. Close `ai-peer-controller-3` (window 2408, pid 51569) if it is idle: no `esc to interrupt` in
   `~/.claude/skills/mac-terminal-control/scripts/mac-term.sh read 2408`, and no child processes
   but helpers (`ps -A -o pid,ppid,command | awk '$2==51569'`). Its watcher is stopped before it
   starts you. `mac-term.sh close 2408`. Leave every Learn Like Magic window alone.
3. Tell `ai-peer-wp3-2` (window 2445) in one line that you are its controller now (SendMessage).
4. Re-arm the watcher (Tools) on `ai-peer-wp3-2` and the live Peer, and record yourself in STATE
   (window, pid, session URL from `Claude-Session:` in your transcript).
5. When Manish is up, take him through his morning, one step at a time (below).

## Where things stand (20:46 UTC, 6 Nov)

- **WP1 done** (PRs #1, #4). **Checkpoint 1 sent** (18:26:57, Telegram Attention: the two recorded
  S1 walks' videos and how to try it). The Peer's own browser profile is signed in to Slack (18:18).
- **WP2 done** (PR #2). Left: the live F5 check, from his phone (STATE "Next" item 2).
- **WP3** (`ai-peer-wp3-2`, window 2445, pid 53664, draft PR #3): dry S2 walk passed; waits for the
  Google client. At 20:46 it had merged `origin/main` in (fa2f947: PRs #4 and #6, no conflicts)
  and fitted its Google adapter to WP5's contract (acc1d9b: the base `Blocked`, `from_settings(st)`,
  the guide's Google notes); its no-AI checks pass and PR #3 is mergeable. `port-check --adapter
  google` fails with "not signed in (peer google login)" until the morning login: expected.
- **WP4** (draft PR #5): spike passed (answer heard 7.3 to 8.1 s after a question), dry S3 walk
  passed (19:42 to 19:47). `ai-peer-wp4-1` handed off at 42% and is closed. **`ai-peer-wp4-2` is not
  started**: its hand-off `docs/build/handoffs/HANDOFF-2026-11-06-ai-peer-wp4-2.md` is on main. Start
  it when the live Peer is free after WP3's S2 walk and merge. Its live walk restarts the Peer from
  `~/repos/ai-peer-wp4` and needs one tap from Manish on "Approve update" in his DM, or your OK for
  `--auto-click` (the Peer's browser clicks it, as in the recorded S1 walk). Recommend: his own
  tap if he is at hand, otherwise `--auto-click` (routine; it only simulates his tap).
- **WP5 first part done** (PR #6, merge commit b877a87): `docs/porting-guide.md`, `port-check` with
  an `adapters:` list in `peer/defaults.yaml`, `demo/script.md`, evidence `docs/build/evidence/wp5/`.
  The porting walk passed: a fresh sub-agent added a toy adapter from the guide alone, with no
  change outside the adapters and settings. Left for after PRs #3 and #5 merge: `port-check` for
  `google`, `meetings` and `voice`, a docs-only pass on the guide and the demo script; later, the
  runtime spots that still pick adapters themselves (the guide lists each).
- **The live Peer** (owner `manish`): pid 62524, detached, from `~/repos/ai-peer-wp2` on main's code
  of 5 Nov (before WP5); page http://127.0.0.1:8787. Nobody holds it. Hand it to one worker at a
  time: `ai-peer-wp3-2` (S2 walk; it restarts the Peer from `~/repos/ai-peer-wp3`), then
  `ai-peer-wp4-2` (S3 walk; from `~/repos/ai-peer-wp4`). Never remove the worktree it runs from.
- Worktrees: `~/repos/ai-peer-wp1` and `~/repos/ai-peer-wp5` (done; remove at close-out),
  `~/repos/ai-peer-wp2` (the Peer runs from it), `~/repos/ai-peer-wp3` (PR #3), `~/repos/ai-peer-wp4`
  (PR #5).
- **Usage** (new account; shared with Learn Like Magic, whose sessions run on it too): 33% at
  17:56, 41% at 19:52, 42% at 20:40 on 6 Nov; resets 11 Nov 07:00 UTC. The old account (94%)
  resets 9 Nov 23:00 UTC. Tonight's pacing: start nothing new past 60%. At 93% start nothing that
  cannot finish cleanly; at 95% every session hands off and you send Manish the next launch line.

## Manish's morning (one step at a time, in this order; each ask also to Telegram Attention)

1. **The Google client** (about 5 minutes, in his Work Chrome, signed in as manish@): steps 1 to 5
   of `docs/build/setup/google.md` (the project `ai-peer` in the learnlikemagic.com organisation,
   the four APIs, audience Internal, a Desktop client, "Download JSON"). He types "downloaded";
   you move the file: `ls ~/Downloads/client_secret_*.json` (names only; exactly one), then
   `mv ~/Downloads/client_secret_*.json ~/.ai-peer/google-client.json && chmod 600 ~/.ai-peer/google-client.json`.
   Never open or print it. Tell `ai-peer-wp3-2` "Google client done".
2. **"go login"** for `ai-peer-wp3-2`: two Google consent pages on the Mac, first manish@ (the Peer),
   then admin@ (the test script); he checks the account on each page and clicks Continue. If a page
   opens in a Chrome profile without that account, he copies the link from
   `~/.ai-peer/google-login-url.txt` into the window where it is signed in. A script's browser
   window may open off his screen: check `onscreen` in CGWindowList before telling him it is up.
3. **The Peer's own Codex login, deadline 8 Nov 02:25 UTC:** he types
   `! CODEX_HOME=~/.ai-peer/codex-home codex login` in your session.
4. From his phone, any time: the live F5 check (STATE "Next" item 2).
5. When convenient: untick View > Developer > "Allow JavaScript from Apple Events" in his Work
   Chrome (only a person's click changes it).

Then, in order: `ai-peer-wp3-2` runs its spike; you hand it the live Peer ("the Peer is yours");
its live S2 walk, evidence and merge of PR #3; **Checkpoint 2** (S2 plus WP2's setup page: a short
recording on Telegram Attention and how to try it). Then start `ai-peer-wp4-2` (spawn recipe); its
live S3 walk and merge of PR #5; **Checkpoint 3** (Recall's mixed recording of the passing walk).
Then WP5's second part (a brief, reviewed first) and the rest of PLAN's WP5 (web page polish, the
film opener cut, the 15 Nov rehearsals).

## Tools

- **Spawn recipe** (controller-1's hand-off): a launch script in your scratchpad, `osascript` `do
  script`, the front window put back, `mac-term.sh list` for the new window. Worker launch:
  `cd <worktree> && CLAUDE_NO_IDLE_PING=1 exec claude --model "claude-opus-5-5[1m]" --effort max --name <name> --remote-control <name> "<kickoff>"`,
  the kickoff in a quoted heredoc. Worktrees of this repo launched with no trust dialog on 6 Nov
  (wp1, wp3, wp4, wp5), though the new login's project list did not name them.
- **Watcher** `docs/build/tools/watch2.zsh` (no AI): `zsh <path> 45 <name>:<pid>:<transcript> ...`
  (use `-` for a process with no transcript, such as the Peer) with `run_in_background`. It exits
  with one line on the first change: a pid gone, a worker at the alarm % of context, the PR list,
  the `.env` key names, the Google client file appearing, or after 55 minutes. Re-arm it after each
  wake; `TaskStop` it before you close a window it watches.
- **Telegram:** the `notify` skill (`tg-attention.sh` for asks, blockers and checkpoints,
  `tg-notify.sh` for news); `docs/build/tools/tg-video.sh <chat id> <mp4> <caption>` sends a
  checkpoint video (Attention is `-5506416790`). In controller-3's session the Telegram plugin did
  not connect, so Manish answered in the session itself: ask him to answer there.
- Context: the last usage record of your own transcript (input + cache-read + cache-creation, of 1M).

## Traps learned by controller-3

- **Read each worker's brief with a read-only reviewer before the spawn:** tonight's WP4 review
  found 18 issues (the worst: Recall's default transcription delays live events 3 to 10 minutes;
  the ElevenLabs key is Learn Like Magic's live one) and WP5's found 8 (a sub-agent with no fence;
  no adapter list in settings). Check each finding in the code before you fold it.
- A person-facing window from a script may open off screen (CGWindowList `onscreen` false); System
  Events cannot tell two Chrome instances apart by pid. Ask the worker that owns the window to
  reopen it in front.
- Every time in a record comes from `date -u` or the event's own record, never typed.
- One live Peer; `preethi` is a real person; never Manish's cloned voice; the Peer joins only the
  test Zoom meeting; Learn Like Magic's ElevenLabs key is capped (STATE "Settled" and the briefs).
- On quiet turns end with the same TLDR line, so the idle hook does not ping him each hour.
