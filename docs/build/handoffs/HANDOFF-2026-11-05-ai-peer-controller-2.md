# Hand-off: ai-peer-controller-2

For: `ai-peer-controller-2`, Claude Opus 5.5 (1M), max effort, remote control on. Written
2026-11-05 about 03:00 UTC by `ai-peer-controller-1` (window 1715, pid 95944) at 42% context.
Dated, never edited after it is written. The living state is `docs/build/STATE.md` on
`origin/main`.

## Manish's standing instructions (quoted)

> "a big initiative is controlled through controller sessions that control other
> individual worker sessions, and they provide handoff around forty-five to fifty
> percent of context ... this is a hackathon, so our main idea is to make it work"

> "3 checkpoints but don't restrict by date. if it gets done sooner, i will check sooner"

His rulings since then are in STATE "Manish's answers", verbatim, the latest:
"can you do all the other steps needed yourself. i logged into the google admin account in
browser - you can use that. i authorise you." (02:05 UTC, 5 Nov, for the colleague setup only.)

## The job

The same job as controller-1's: read `HANDOFF-2026-11-04-ai-peer-controller-1.md` in full (the
duties table, the spawn recipe, Telegram, traps). This file adds where things stand. You write
no product code and never touch a worker's worktree or type into its conversation.

## Read first, in order

1. `AGENTS.md`. 2. `docs/build/STATE.md` on `origin/main`. 3.
   `docs/build/handoffs/HANDOFF-2026-11-04-ai-peer-controller-1.md`. 4. This file.
5. The `big-initiative` user skill (Manish's global CLAUDE.md asks controllers to load it; the
   repo's AGENTS.md and the briefs win where they differ). PLAN and DESIGN §0 only as needed.

## Where things stand (02:55 UTC, 5 Nov)

- **WP1** runs in `ai-peer-wp1-1`: window 1725, pid 97726, worktree `~/repos/ai-peer-wp1`,
  branch `wp1-foundation`, draft PR #1, context 43.5% (it hands off soon). Spikes 1a to 1d all
  passed; S1 passes in dry runs on Claude and Codex; the five colleague accounts and the four
  channels exist; the Peer runs live (pid in `~/.ai-peer/manish/watch.pid`). The first live
  S1-away walk failed on a filter bug, fixed at 02:53; the rerun was under way. Left in WP1:
  the live walks (away, online, once on Codex), evidence, merge, Checkpoint 1.
- **When the worker hands off** (its brief: hand-off file, STATE, tell the controller, stop):
  start `ai-peer-wp1-2` with the spawn recipe in the same worktree and branch (no new
  worktree; already trusted), kickoff naming its hand-off file, and you as its controller.
- **Waiting on Manish, asked 02:47 (controller-1's reply + Telegram Attention):** "ready" for
  the Peer's own Slack sign-in (the worker's step 5). On "ready": SendMessage
  `ai-peer-wp1-1` (or its successor) "go login". Slack mails "Slack confirmation code: XXX-XXX"
  to manish@learnlikemagic.com; no Chrome profile we can drive has that inbox (the Work
  profile has admin@ only, the Slack profile his personal Gmail), so Manish reads it. If he
  sends the code in chat, write it at once with `printf '<code>' > ~/.ai-peer/slack-login-code.txt`
  and never repeat it; the worker waits up to 15 minutes. His answer may land in
  controller-1's session; tell him to answer in yours.
- **Then, one at a time:** (1) untick View > Developer > "Allow JavaScript from Apple Events"
  in his Work Chrome window (Chrome ignores scripted changes to it, on and off); (2) the
  Peer's own Codex login before about 7 Nov: `! CODEX_HOME=~/.ai-peer/codex-home codex login`;
  (3) the Google Internal OAuth client (WP3 writes the steps); (4) the Airbnb asks in PLAN;
  (5) his other Mac's copy; (6) optional: delete the unused Recall key "ai-peer".
- **Usage:** weekly 54% at 02:55 UTC (35% at 15:22 on 4 Nov), about 1.5 points an hour, mostly
  from the Learn Like Magic sessions. At that pace 95% comes around 06:00 to 07:00 UTC on 6 Nov;
  the reset is 10 Nov, 04:29 IST. D14: at about 95% every session finishes its step, hands off
  and stops; Codex is the backup builder. Read it at every milestone:
  `claude -p "/usage" --output-format text`.

## Next, in order

1. Fetch, read STATE, check `ai-peer-wp1-1` is alive (`mac-term.sh list`, `read 1725`), and
   SendMessage it that you are its controller.
2. Start a watcher that wakes you on change (Tools). Relay "ready" as above.
3. When the worker reports Checkpoint 1 ready: read its evidence in `docs/build/evidence/wp1/`
   yourself, then send Manish a short screen recording on Telegram and how to try it (D15);
   mark Checkpoint 1 in STATE.
4. When WP1 is merged and its worker closed: finalise `docs/build/handoffs/DRAFT-ai-peer-wp2-1.md`
   and `DRAFT-ai-peer-wp3-1.md` (re-check every cited line on the new head, a read-only
   sub-agent checks for stale facts and production writes, set the date, save as
   `HANDOFF-<date>-ai-peer-wp{2,3}-1.md`, delete the drafts), create `~/repos/ai-peer-wp2`
   (`wp2-setup-memory`) and `~/repos/ai-peer-wp3` (`wp3-google-brief`), spawn both.
5. WP4's brief (later) carries STATE's spike 1d notes and "never Manish's cloned voice".

## Tools on this Mac (controller-1's scratchpad; copy what you need)

`/private/tmp/claude-501/-Users-manishjain-repos-ai-peer-hackathon-2026/ce734d56-18c2-403f-826e-b980254d3571/scratchpad/`

- `watch.zsh <worker pid> <worker ~/.claude/projects folder> [alarm %]`: no AI; prints one
  line and exits on the first change (`.env` key names, a PR, worker context at the alarm, the
  worker's pid gone) or after 55 minutes. Run it with `run_in_background` and re-arm after each
  wake. Keep the 55-minute cap: an hourly wake inside the one-hour cache costs less than one
  cold wake later. If the folder is gone, rebuild it from this description.
- `check.zsh`: one-shot status (worker screens, context, PRs, `origin/main`).
- Chrome bridge (only with Manish's word): `js.applescript` and `go.applescript` (window matched
  by id as text), `getcode.zsh`, `colleague.zsh`. See STATE Lessons first.

## Traps learned by controller-1

- The idle hook misses asks (worker messages wake you within its 60 s): send every ask to the
  Attention group yourself with `tg-attention.sh`.
- On quiet hourly turns end with the exact same TLDR line ("Watching the build. The open ask
  hasn't changed.") so the hook de-dupes and does not ping his phone each hour.
- Browser automation fills a controller's context fast (the colleague setup took about 20% of
  1M): give the next such job to a sub-agent or a fresh session.
- `preethi` is a real person; never Manish's cloned voice (STATE "Settled").
- The kickoff session's window 1661 stays open until Manish closes it.
- Running and not yours: the Peer (`watch.pid`), the worker's waiters (until about 18:05 UTC
  on 5 Nov) and its sign-in helper on `localhost:8765`.
