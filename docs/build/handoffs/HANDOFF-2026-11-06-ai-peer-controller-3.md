# Hand-off: ai-peer-controller-3

For: `ai-peer-controller-3`, Claude Opus 5.5 (1M), max effort, remote control on, running on a
**new subscription**. Manish switched this Mac's Claude login because the old account reached 94%
of its weekly usage (17:22 UTC, 6 Nov; it resets 10 Nov 04:30 IST). Written 2026-11-06 17:24 UTC by
`ai-peer-controller-2` (window 2048, pid 52453) at 37.5% context. Dated, never edited after it is
written. The living state is `docs/build/STATE.md` on `origin/main`. This file stands alone: it
relies on nothing in the old account's sessions, links or memory.

## Manish's words (quoted)

Standing, from the brief:

> "a big initiative is controlled through controller sessions that control other
> individual worker sessions, and they provide handoff around forty-five to fifty
> percent of context ... this is a hackathon, so our main idea is to make it work"

> "3 checkpoints but don't restrict by date. if it gets done sooner, i will check sooner"

The ask behind this hand-off (6 Nov, about 17:20 UTC, to controller-2):

> "I think the usage now is above 90%, so we might have to switch the subscription and continue
> working in a new session with the different subscription. So as we generally do, please
> prepare that handoff and give me the steps that I need to do, like generally how you give me
> that one command that I need to run after switching the subscription, that reliably carries
> over the ownership to that new session in the different subscription."

His other rulings are in STATE "Manish's answers", verbatim. The one that still limits you:
"can you do all the other steps needed yourself. i logged into the google admin account in
browser - you can use that. i authorise you." (02:05 UTC, 5 Nov; Chrome use for the colleague
setup only; any other use of his Chrome needs his word). His global rule since 5 Nov: decide
routine calls yourself, record them, tell him in one line how to undo; ask him only where his
own judgment is needed, one question at a time, with your recommendation.

## The job

Run the AI Peer build to D2's target (the generic system and the porting guide by 15 Nov): the
same job as `HANDOFF-2026-11-04-ai-peer-controller-1.md` (duties table, spawn recipe, Telegram,
traps) and `HANDOFF-2026-11-05-ai-peer-controller-2.md`. You write no product code, never edit a
worker's worktree, never type into a worker's conversation, and keep STATE current.

## Read first, in order

1. `AGENTS.md`. 2. `docs/build/STATE.md` on `origin/main`. 3. This file.
4. `docs/build/handoffs/HANDOFF-2026-11-04-ai-peer-controller-1.md` (duties, spawn recipe).
5. The `big-initiative` user skill (Manish's global CLAUDE.md asks controllers to load it).
   Then PLAN, PRD and DESIGN §0 only as a step needs them.

## Take over, in order

1. `git -C ~/repos/ai-peer-hackathon-2026 fetch origin`; read STATE on `origin/main`. Read usage
   with `claude -p "/usage" --output-format text --no-session-persistence --strict-mcp-config`
   (about 10 s, no model call): the week should now read low. Record it in STATE.
2. Close the old sessions so nothing runs twice, each only if it is idle (`✳` in
   `~/.claude/skills/mac-terminal-control/scripts/mac-term.sh list`, and no child processes:
   `ps -A -o pid,ppid,command | awk '$2==<pid>'`): `ai-peer-controller-2` (window 2048, pid
   52453), `ai-peer-wp1-2` (window 2049, pid 54508), `ai-peer-wp3-1` (window 2216, pid 68738).
   `mac-term.sh close <window>`. Leave every Learn Like Magic window alone. The live Peer is a
   separate detached process (parent pid 1): closing windows does not stop it.
3. Start the two successors with the spawn recipe (below), in their existing worktrees, which are
   already trusted (no trust dialog):
   - `ai-peer-wp1-3` in `~/repos/ai-peer-wp1`, brief
     `docs/build/handoffs/HANDOFF-2026-11-06-ai-peer-wp1-3.md`. One job: the Peer's browser
     sign-in at the Mac, the two recorded S1 walks, the screenshots, Checkpoint 1.
   - `ai-peer-wp3-2` in `~/repos/ai-peer-wp3`, brief
     `docs/build/handoffs/HANDOFF-2026-11-06-ai-peer-wp3-2.md`. WP3: the Google spike and the
     live S2 walk, then the merge of draft PR #3.
   If a named brief is missing on `origin/main`, its worker did not finish its hand-off: start the
   successor from the worker's previous brief plus STATE, and say so in its kickoff.
4. Record both in STATE (window, pid, session URL from `Claude-Session:` in its transcript under
   `~/.claude/projects/<folder>/`), re-arm the watcher (Tools), and tell Manish in one line.
5. When Manish is at the Mac, take him through his sitting (below), one step at a time.

## Where things stand (17:24 UTC, 6 Nov)

- **WP1 merged** (PR #1, merge commit 183fabe). S1 passes live: away on Claude and on Codex, and
  online with Manish's own tap on Send (15:28 UTC, 5 Nov). Left: Checkpoint 1's recordings
  (`ai-peer-wp1-3`).
- **WP2 merged** (PR #2, merge commit 88ac13e): F1 to F7 walked; F7 is live on this Mac (a
  session-end hook in `~/claude-config/settings.json`, which syncs to his other Macs, and in
  `~/.codex/hooks.json`; backups in `~/.ai-peer/backups/`; the hourly scan reads `~/repos`).
  Left: the live F5 check, exact steps in STATE "Next" item 2 (he types one sentence in his DM).
- **WP3**: dry S2 walk passes (5 Nov 17:00); draft PR #3; the Google client
  `~/.ai-peer/google-client.json` does not exist yet. Defaults that keep his real Google data
  safe: `google.act_on_real_items` and `google.show_real_items` both off.
- **The live Peer** (owner `manish`): the only `peer watch`, pid in `~/.ai-peer/manish/watch.pid`
  (62524 since 16:18 UTC, 5 Nov), detached, running from `~/repos/ai-peer-wp2` on main's code,
  page http://127.0.0.1:8787. Nobody holds it. You hand it to one worker at a time: first
  `ai-peer-wp1-3` (to record S1, no restart needed), then `ai-peer-wp3-2` (it restarts the Peer
  from `~/repos/ai-peer-wp3`). Never remove the worktree it runs from. Its brain runs use this
  Mac's Claude login, so after the switch they bill the new account (fallback: Codex).
- Worktrees: `~/repos/ai-peer-wp1` (`wp1-foundation`, merged), `~/repos/ai-peer-wp2`
  (`wp2-setup-memory`, merged; the Peer runs from it), `~/repos/ai-peer-wp3`
  (`wp3-google-brief`, PR #3).
- Checkpoints (D15): 1 waits on the recordings; 2 is S2 plus WP2's setup page; 3 is S3 (WP4).
- Not started: WP4 (meeting, S3) and WP5 (porting guide and demo). No briefs yet. When
  `ai-peer-wp1-3` closes, a worker slot is free (D13: at most 2): write WP4's brief from PLAN, PRD
  and the merged code (STATE "Next" holds spike 1d's notes for it; never Manish's cloned voice),
  have a read-only sub-agent check it, and start it.

## Manish's next Mac sitting (about 10 minutes; one step at a time, in this order)

1. "open window" for `ai-peer-wp1-3`: a Chrome window in the Peer's own profile; he types
   manish@learnlikemagic.com, ticks "I'm not a robot", clicks "Sign In With Email", types the code
   from manish@'s Gmail. Slack's robot check stops a scripted sign-in: a person does it.
2. The Google client: `docs/build/setup/google.md` steps 1 to 5 (about 5 minutes).
3. "go login" for `ai-peer-wp3-2`: two Google consent pages on the Mac (manish@ for the Peer,
   admin@ for the test script); he checks the account shown, then allows.
4. **The Peer's own Codex login, deadline 8 Nov 02:25 UTC** (its copy of his login ends 9 Nov
   02:25 and the runner refuses it in the last 24 h):
   `! CODEX_HOME=~/.ai-peer/codex-home codex login`.
5. When convenient: untick View > Developer > "Allow JavaScript from Apple Events" in his Work
   Chrome window (only a person's click changes it).

From his phone at any time: the live F5 check (type `stop telling me about CI failures on drafts`
in his Slack DM with the AI Peer). Still queued in STATE "Needs Manish": the optional
`reaction_added` Slack setting, the Airbnb asks in PLAN, his other Mac's copy, the unused Recall key.

## Launch line (what Manish runs after switching)

```zsh
cd ~/repos/ai-peer-hackathon-2026 && git pull -q --ff-only && claude --model "claude-opus-5-5[1m]" --effort max --name ai-peer-controller-3 --remote-control ai-peer-controller-3 "You are ai-peer-controller-3, on a new subscription. Run git fetch, read docs/build/STATE.md on origin/main, then docs/build/handoffs/HANDOFF-2026-11-06-ai-peer-controller-3.md in full: that is your job, starting with its Take over steps. ai-peer-controller-2 handed off because the old account reached 94% weekly usage; you are the live controller unless docs/build/STATE.md on origin/main names a newer one. Manish, verbatim: switch the subscription and continue working in a new session with the different subscription. You write no product code."
```

## Tools

- **Spawn recipe** (controller-1's brief): a launch script in your scratchpad, run with
  `osascript` `do script` and the front window put back, then `mac-term.sh list` for the new
  window id. Worker launch:
  `cd <worktree> && CLAUDE_NO_IDLE_PING=1 exec claude --model "claude-opus-5-5[1m]" --effort max --name <name> --remote-control <name> "Read docs/build/handoffs/<brief> in full; that is your job. Follow it end to end, then stop as it says. Your controller is ai-peer-controller-3 unless docs/build/STATE.md on origin/main names a newer one. Reach it with SendMessage (to: ai-peer-controller-3). Your idle pings to Telegram are off, so anything that needs Manish goes through the controller, one ask at a time, with exact steps."`
- **Watcher** (no AI; rebuild it in your scratchpad as `watch2.zsh`): it takes the alarm % and then
  `<pid>:<~/.claude/projects folder name>` pairs, checks every 60 s, and exits with one line on the
  first change: the `.env` key names (names only, never values), the PR list
  (`gh pr list --repo manishjain-py/ai-peer-hackathon-2026 --state all`), a worker pid gone, a
  worker's context (last usage record in its newest transcript: input + cache-read +
  cache-creation, of 1M) at or above the alarm, or after `MAX=3300` s. Run it with
  `run_in_background` and re-arm it after each wake; stop it when nothing is in flight.
- Context: the same sum from your own transcript. Usage: the `/usage` line above.
- Telegram: the `notify` skill (`tg-attention.sh` for asks and blockers, `tg-notify.sh` for news).

## Traps learned by controller-2

- **One live Peer.** Its brain skill links point into the worktree it runs from, and memory set-up
  for owner `manish` from another worktree re-points them. Without `AI_PEER_OWNER=<test id>` in
  the same command, every `peer` command acts on `manish`, whose settings the live Peer re-reads at
  once. A second Socket Mode connection splits Slack's events. Hand the Peer to one worker at a time.
- `~/.codex/config.toml` already has a `notify` line; a second one breaks Codex.
- A read-only review of each new brief found 8 to 9 real risks (WP2, WP3): keep doing it, but
  each costs about 200k tokens.
- Usage: a busy worker uses about 4 to 7 weekly points an hour; the old account went from 72% to
  94% overnight from other sessions. Read `/usage` at every milestone; at 93% start nothing that
  cannot finish cleanly; at 95% hand off.
- Stop the watcher when nothing is in flight: an hourly wake at a large context costs usage, and
  the user's message or a worker's wakes you anyway.
- Every ask to Manish goes to Telegram Attention yourself (the idle hook misses asks); on quiet
  turns end with the same TLDR line so the hook does not ping him each hour.
- `preethi` in the test Slack is a real person; never Manish's cloned voice (STATE "Settled").
