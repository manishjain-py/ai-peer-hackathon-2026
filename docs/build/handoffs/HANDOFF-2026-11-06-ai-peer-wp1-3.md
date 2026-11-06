# Hand-off: ai-peer-wp1-3 (WP1's last job: recorded walks and Checkpoint 1)

For: `ai-peer-wp1-3`, a fresh session on the **new** subscription, on this Mac. Written 2026-11-06
17:25 UTC by `ai-peer-wp1-2` at 19.3% context, on the controller's word (weekly usage 94% on the
old account). Dated, never edited after it is written. The living state is `docs/build/STATE.md` on
`origin/main`. Controller: `ai-peer-controller-2` unless STATE names a newer one. Reach it with
SendMessage. Anything for Manish goes through it, one ask at a time, with exact steps.

## Read first, in order (only these)

1. `AGENTS.md`, then `docs/build/STATE.md` on `origin/main`.
2. This file.
3. `docs/build/evidence/wp1/s1-walks.md`: walks 1 to 3 (all passed live) and "Not yet".
4. `peer/README.md` (how to run). Open code only where a step needs it.

## Where things are

- **WP1 is merged** (PR #1, merge commit 183fabe, 5 Nov 15:31 UTC). S1 passes live: away on Claude
  and on Codex, and online with Manish's own tap on Send. What is left is this job: the screenshots,
  the two walk videos, and Checkpoint 1.
- Your worktree: `~/repos/ai-peer-wp1`, branch `wp1-foundation`, Python venv `.venv`. Run
  `.venv/bin/python -m peer <cmd>` from it.
- **The live Peer runs from `~/repos/ai-peer-wp2` on main's code** (the controller's arrangement).
  Its pid is in `~/.ai-peer/manish/watch.pid`, its log is `~/.ai-peer/manish/watch.log`, and its
  page is http://127.0.0.1:8787. Don't stop, start or restart it, and never `pkill`. If it seems
  down, tell the controller.
- **Never run `peer discover` from `~/repos/ai-peer-wp1`.** It re-points the live Peer's brain
  skill links (`~/.ai-peer/manish/.claude/skills/peer-brain` and `.agents/skills/peer-brain`) into
  your worktree. `peer scenario` and `peer browser` don't touch them.
- The Peer's own browser profile is `~/.ai-peer/browser/manish`. It is **not signed in to Slack**.
  Only one process can use it at a time, so run one `peer browser` or `--record` command at a time.
- Secrets are in `~/.ai-peer/.env`. Never print them.
- **preethi (U0CEX3SP9FB) is a real person**: never message, mention or DM her.

## The job, in order

0. **Take over the Peer.** Ask the controller to confirm two things: the live Peer is running, and
   no other worker is walking on it. Then fast-forward your worktree to main's code (your branch
   is an ancestor of main):
   `git -C ~/repos/ai-peer-wp1 fetch origin && git -C ~/repos/ai-peer-wp1 merge --ff-only origin/main`
1. **Sign-in, on the controller's "open window".** Manish must be at the Mac itself, not on his
   phone, for about 2 minutes. Run `.venv/bin/python -m peer browser login` in the background.
   It opens a Chrome window (the Peer's own profile) showing "Sign in to learnlikemagic". Send
   these steps for Manish through the controller:
   1. type manish@learnlikemagic.com
   2. tick "I'm not a robot", and solve any picture puzzle
   3. click "Sign In With Email"
   4. type the code from manish@learnlikemagic.com's Gmail into that same window
   5. if Chrome asks to open the Slack app, click Cancel

   The window follows "use Slack in your browser" by itself and closes once he is in. It waits up
   to 15 minutes. **Pass:** it prints "Signed in: the Peer can take screenshots now.", and
   `~/.ai-peer/manish/walks/login-2-after-code.png` shows the Slack client.
   - Don't use `peer browser login-headless`: on 5 Nov Slack showed it the robot check, so no code
     was sent.
   - Never have a script tick the robot box. A person does it.
2. **Recorded online walk.** Run
   `.venv/bin/python -m peer scenario s1-online --record --auto-click` (about 3 minutes). Ananya
   asks in #content, the Peer DMs Manish a draft, and the Peer's browser (signed in as Manish)
   clicks Send. **Pass**, in its output:
   - `PASS owner_dm` with `"buttons": true`, within 120 s
   - `owner's Send clicked in the Peer's browser profile` with `"ok": true`
   - `PASS thread_reply`, within 300 s
   - `video` with a `walk.mp4` path, then `done`

   Files land in `~/.ai-peer/manish/walks/s1-online-<UTC time>/`: numbered PNGs (`owner-dm` is the
   draft card, `thread` is the reply after Send, `channel`, `owner-dm-end`, where the card reads
   "Sent in the thread") and `walk.mp4`.
   - If the click shows `ok: false`, the walk still waits for a Send. Ask the controller to have
     Manish tap Send on his phone; that is how walk 3 passed.
   - **Read the screenshots.** Does Slack show Ananya's post with an "APP" badge or "via LLM
     Scenario"? If so, tell the controller: avoiding that badge is why Manish chose real accounts.
3. **Recorded away walk.** Run `.venv/bin/python -m peer scenario s1-away --record` (about 3
   minutes). **Pass:**
   - `PASS thread_reply` twice: the answer, then Lakshmi's follow-up, each within about 2 minutes
   - `PASS owner_dm`: the "While you were away" summary
   - the screenshots, and `walk.mp4` in `~/.ai-peer/manish/walks/s1-away-<UTC time>/`
4. **Evidence, on `main`.** Evidence is docs only, so it goes straight to main, from a throwaway
   worktree. Fetch and count before you push.
   - Copy four screenshots into `docs/build/evidence/wp1/`: the draft card, the reply after Send,
     the away thread, and the away DM summary.
   - Add "Walk 4: S1-online recorded" and "Walk 5: S1-away recorded" to `s1-walks.md`: the PASS
     lines, the screenshot links, and the APP-badge finding. Update its "Not yet".
   - The videos stay in `~/.ai-peer`. Their paths go in the checkpoint message.
5. **Checkpoint 1, to the controller.** Send:
   - the two `walk.mp4` paths, for Manish's Telegram
   - how he tries it himself: DM the AI Peer `away`, `back`, `online` or `status`; run
     `peer scenario s1-away` or `peer scenario s1-online`, where he taps Send in his own DM; and
     the activity page http://127.0.0.1:8787
6. **Close.** On `main`, update STATE:
   - the Checkpoint 1 row: done, with the time
   - your sessions row and a session-log line
   - any new lesson

   Then tell the controller WP1 is complete, and stop. Leave `~/repos/ai-peer-wp1` in place and the
   Peer running.

## Rules that still hold

- No unit tests, CI or code review (D13).
- Any code fix, such as a Slack selector in `peer/browser.py`, goes in a small PR from a branch off
  main. Merge it yourself with a merge commit (`gh pr merge <n> --merge`) once the walk passes.
- Docs go straight to main.
- Measure context at each milestone. At 45 to 50%, hand off. At about 95% weekly usage, stop and
  hand off.
