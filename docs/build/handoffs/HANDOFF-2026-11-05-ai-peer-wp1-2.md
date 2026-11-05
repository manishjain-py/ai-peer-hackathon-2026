# Hand-off: ai-peer-wp1-2 (WP1, finish S1 and Checkpoint 1)

For: `ai-peer-wp1-2`, Claude Opus 5.5 (1M), max effort. Written 2026-11-05 02:58 UTC by
`ai-peer-wp1-1` at 44.2% context (measured from its transcript). Dated, never edited after it
is written. The living state is `docs/build/STATE.md` on `origin/main`. Controller:
`ai-peer-controller-2` (window 2048), unless STATE names a newer one. Reach it with SendMessage; anything
for Manish goes through it, one ask at a time, with exact steps.

## Manish's standing instruction (quoted from the brief)

> "this is a hackathon, so our main idea is to make it work, and not go off track in
> unimportant things like code quality, unit tests, et cetera ... we build something, we
> test it manually by running it in the browser or running through the terminal ...
> But other than that, we should try to follow all our ways of working."

Merge rule (D13): you merge your own PR as soon as the S1 walk passes. No review, CI or unit
tests. The stop rules of the first hand-off apply unchanged (45 to 50% context, about 95%
weekly usage).

## Read first, in order (only these)

1. `AGENTS.md`, then `docs/build/STATE.md` on `origin/main`.
2. `docs/build/handoffs/HANDOFF-2026-11-04-ai-peer-wp1-1.md`: the job (what WP1 must prove).
3. This file.
4. `docs/build/evidence/wp1/spikes.md` and `docs/build/evidence/wp1/s1-walks.md`.
5. `peer/README.md` (how to run). Open code only where a step needs it.

## Where things are

- Worktree `~/repos/ai-peer-wp1`, branch `wp1-foundation`, draft
  [PR #1](https://github.com/manishjain-py/ai-peer-hackathon-2026/pull/1). Python venv `.venv`
  (3.12); run everything as `.venv/bin/python -m peer <cmd>` from the worktree.
- **The Peer is running live** since 02:53 UTC, detached: `peer start` / `peer stop` (pid in
  `~/.ai-peer/manish/watch.pid`, log `~/.ai-peer/manish/watch.log`; never `pkill`). Activity page
  http://127.0.0.1:8787. It re-reads `~/.ai-peer/manish/settings.yaml` live (`peer set …`).
- Runtime data: `~/.ai-peer/manish/` (memory, `peer.db`, `log.jsonl`, `brain-runs.jsonl`, `walks/`).
  Secrets: `~/.ai-peer/.env` (Slack app + bot + user tokens, `SLACK_AS_<COLLEAGUE>` x5, the LLM
  Scenario client id/secret, GitHub, ElevenLabs, Recall, the Zoom test link). Never print them.
- Brain: Claude Code pinned copy `~/.ai-peer/bin/claude-2.1.318`, model opus, effort **high**
  (measured: max took 113 to 139 s per answer and breaks S1's limits). Codex in its own home
  `~/.ai-peer/codex-home` (a copy of Manish's login, valid to 2026-11-09 02:25 UTC; the runner
  refuses within 24 h of that; the ask for its own login is queued at the controller).
- Test world in Slack: workspace learnlikemagic; colleagues Ananya, Kabir, Lakshmi, David, Rohan
  (real member accounts on aliases of admin@learnlikemagic.com, posting through the test-only app
  LLM Scenario); channels `#product`, `#content`, `#schools`, `#engineering` (only them, Manish,
  the Peer). **preethi (U0CEX3SP9FB) is a real person: never message, mention or DM her**; the
  Peer engages only the owner and the world's colleagues (`slack.engage_only_world`).

## Done (all pushed)

- Spikes 1a, 1b, 1d passed; 1c passed except the click, which the S1-online walk proves.
- `peer/` package, discovery (15 projects from the LLM trackers), the S1 pipeline.
- **S1-away passes live** on Claude (40 s, then 37 s for the follow-up) and on Codex (37 s,
  34 s): `docs/build/evidence/wp1/s1-walks.md`.

## Next, in order

1. **Sign the Peer's browser profile in to Slack.** Wait for the controller's "go login" (Manish
   must read one code from manish@learnlikemagic.com's Gmail). Then run, in the background,
   `.venv/bin/python -m peer browser login-headless`: it enters his email; the controller writes
   only the code (XXX-XXX) to `~/.ai-peer/slack-login-code.txt`; it types it and prints
   "Signed in." Check `~/.ai-peer/manish/walks/login-2-after-code.png`. If Slack's code page
   differs, adjust the selectors in `peer/browser.py` `login_headless`; last resort,
   `peer browser login` (a window Manish signs in to himself).
2. `peer scenario s1-online --record --auto-click`: expect PASS `owner_dm` with buttons, the
   Send click, PASS `thread_reply`. Screenshots and `walk.mp4` land in
   `~/.ai-peer/manish/walks/s1-online-<time>/`. Read the screenshots: the draft card, the reply
   after Send, and **whether Slack shows the colleagues' posts with an APP badge or "via LLM
   Scenario"** (the reason Manish chose real accounts). If it does, tell the controller.
3. `peer scenario s1-away --record` for the away screenshots and video.
4. Evidence: copy the best screenshots into `docs/build/evidence/wp1/`, add the online walk and
   the activity-log excerpt to `s1-walks.md`.
5. **Checkpoint 1** to the controller: the two `walk.mp4` paths (for Manish's Telegram) and how
   he tries it himself: DM the AI Peer `away`, `back`, `online` or `status`;
   `peer scenario s1-away` or `peer scenario s1-online` (he clicks Send in his own DM); the page.
6. PR #1: update the body (what works, evidence, what is not verified), mark it ready, merge.
   Then on `main` update STATE: Checkpoint 1 row, the lessons below, the session log.

## Lessons to record in STATE (from this session)

- A person's Slack post sent through an app (a user token) carries the app's `bot_id`; filter
  bots by the user (`users.info` `is_bot`), not by `bot_id`.
- `codex exec --ignore-user-config` still loads `~/.codex/AGENTS.md` and the user's skills;
  isolate with the run's own `CODEX_HOME` and `HOME` (also in `~/claude-config/lessons/`).
- Brain effort is a latency choice: S1 answers at max took 113 to 139 s, at high 21 to 27 s.
- Slack's free plan accepts a profile title through the API and keeps it empty.
- Weekly usage was 53% at 02:55 UTC ("allowed_warning"); discovery at max effort cost about
  15 points. Re-run discovery only when needed, or at `summary_effort: high`.
