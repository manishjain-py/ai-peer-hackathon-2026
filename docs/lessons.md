# Lessons

What went wrong once on the first laptop (4 to 7 Nov 2026), with its mechanism and what we do now. Read the
section your task touches. New lessons go in STATE "Lessons" first; at a close-out they move here.

## The brain and its harness

- **The brain must not load the user's own setup.** `claude -p` by default loads the user's global
  `CLAUDE.md`, hooks, plugins, user skills and permission defaults. The Peer's run uses `--setting-sources
  project`, `--settings '{"autoMemoryEnabled":false,"disableAllHooks":true}'`, `--strict-mcp-config
  --mcp-config '{"mcpServers":{}}'`, `--tools` and `--allowedTools "Read,Grep,Glob,Skill"`, `--permission-mode
  dontAsk`, `--no-session-persistence`, stdin from `/dev/null` (else "no stdin data received in 3s").
- **Those flags alone stopped keeping the global `CLAUDE.md` out** (6 Nov, same pinned Claude Code version
  that passed on 4 Nov). The brain's live answers grew the owner's personal reply format; JSON-schema runs
  hid it. `CLAUDE_CODE_DISABLE_CLAUDE_MDS=1` in the run's env keeps it out (set in `peer/brain/runner.py` and
  `peer/brain/warm.py`); `--bare` also does but refuses a subscription login. **Prove the block with a
  canary** (a run asked "which instruction files did you load? is the owner named?") and a control run that
  does load them; **re-run the canary after any change, even on a pinned binary.**
- **Codex isolation:** `codex exec --ignore-user-config` still loads the global `AGENTS.md` and user skills.
  Give each run its own `CODEX_HOME` (a small `config.toml`) and `HOME` (an empty folder), and give that home
  its own `codex login`: a copied `auth.json` is a time bomb (a token refresh rotates the main login). A
  `codex exec` in a fresh `CODEX_HOME` hangs until stdin is `/dev/null`. A second `notify` line in Codex's
  `config.toml` is invalid TOML and Codex will not start.
- **A process started from an agent session inherits its variables** (Claude Code's `CLAUDE_CODE_*`: session
  id, messaging socket, child-session flag), and they reach every brain run. WP7 strips them.
- **Effort is a latency choice.** S1 answers at `max` took 113 to 139 s, at `high` 21 to 27 s (the scene
  allows one to two minutes). A first discovery at `max` cost about 15 points of the weekly usage: run
  discovery at `brain.summary_effort: high`.
- **Live answers need the facts in the pack.** A warm session at effort medium readies a spoken answer in 2 to
  4 s; when the asked-about project had fallen out of the 24,000-character fact pack, it read memory files
  first and the answer came about 21 s after the question (WP10 fixes it).

## Running the Peer

- **An owner's `settings.yaml` is a full copy of `peer/defaults.yaml`**, made by that owner's first command
  and merged deep with the live file winning key by key: a new default reaches existing owners, a changed one
  never does. Change a value with `peer set` or in the owner's file.
- **`peer start` does not re-point the brain skill links.** The live Peer's brain reads its playbooks through
  links in the owner's folder (`.claude/skills/peer-brain`, `.agents/skills/peer-brain`) that point into the
  checkout it was set up from. Only `Memory.ensure()` (discovery, the nightly pass) calls `install_skill`
  (`peer/memory/layout.py`), so a Peer restarted from a new folder keeps the old folder's playbooks. Before
  the restart, run `install_skill` from the new folder and check both links with `readlink`.
- **Every `peer` command without `AI_PEER_OWNER` acts on the default owner**, whose settings a running Peer
  re-reads at once; put `AI_PEER_OWNER` (and `AI_PEER_HOME` for tests) on every command line, since an
  `export` may not survive between an agent's shell calls.
- **A second Socket Mode connection splits the app's events**: one live Peer, and one session working on it at
  a time. `port-check` reads Slack over the Web API and never opens Socket Mode.
- **A test owner fences only `~/.ai-peer/<owner>/`**: Slack, the code host, mail, the meeting bot and the voice
  service are real. Read-only calls and dry runs only.
- **The real-person block fails closed.** The watcher admits an event only from the owner and the colleagues
  listed in the trial's world file (matched by email through the chat adapter's `lookup_email`); anyone else
  is dropped before it is stored or thought about. A real person was in the old test workspace; the block kept
  the Peer away from them. At a company, list only colleagues who agreed to take part.
- **Session-end hooks can be tested without touching global settings:** `claude -p ... --setting-sources
  project --settings '{"hooks":{"SessionEnd":[...]}}'` fires the hook (its payload has `session_id`,
  `transcript_path`, `cwd`, `reason`). `codex exec` fires no hook.

## Slack

- **A person's post sent through an app carries the app's `bot_id`.** The first live S1 walk failed: posts the
  scenario script made with colleagues' user tokens were dropped as bot messages. Tell bots by the user
  (`users.info` `is_bot`), not by `bot_id`.
- **Headless Slack sign-in meets a robot check** (reCAPTCHA) after the email, so no code is mailed, and a
  script that never looked printed "code requested". A person signs in through a window (`peer browser
  login`, which waits 30 minutes). Check the page before reporting a step.
- **A window a script opens for a person may not be on their screen** (the first one opened hidden, then landed
  on a search engine's "unusual traffic" puzzle). Check it is visible before saying "window up", and tell the
  person to type only into the sign-in page.
- **A scripted click opens Slack as the owner**, and Slack then showed the owner "active" while the laptop sat
  idle, so the Peer's auto presence read him online (S1 would draft instead of answering). Check presence
  before each S1 walk (WP10).
- The Peer's browser sets its own user agent; a stale browser version in it made Slack warn it would stop
  supporting that browser, so the user agent now takes the installed version.
- Slack's free plan accepts a profile title through the API and keeps it empty. Slack's join form ignores a
  scripted click; `form.requestSubmit()` works, sometimes only on a retry a few seconds after load. Its app
  manifest editor replaces the template only on a real select-all and paste.

## Meetings and voice

- **A Recall bot records only after another participant joins** (`start_recording_on` defaults to
  `participant_join`): a bot alone sits in `in_call_not_recording` and leaves on `noone_joined_timeout`. Set
  `start_recording_on: call_join`. Its silence rule counts only the others' speech.
- **Recall's default transcription delays live events 3 to 10 minutes.** Live answers use its low-latency
  real-time transcript sent to a public webhook (a `cloudflared` quick tunnel to the listener port); the last
  word reaches the Peer about 1 s after it is spoken.
- **Spoken "Peer" is not a reliable word to spot**: it came back as "pier", "here", "ipa" for "AI Peer", and once
  vanished. Addressed detection accepts homophones and phrases ("a question for Manish's assistant").
- **Audio clips:** pad each with about 1 s of silence (the first second is lost); `output_audio` needs
  `automatic_audio_output` set when the bot is created; a second clip sent while one plays is mixed on top
  (not queued), and a `DELETE` cuts it within about 1 s.
- **Zoom:** a Recall bot joined a meeting on an account we controlled, host absent ("join before host"), with
  no Zoom app of ours. Zoom's on-behalf-of rule (since 2 Mar 2026) is why a company needs the bot's app owned
  by its own Zoom account.
- **A live S3 walk** outlasts a 10-minute shell call (run it in the background); it reaches the meeting's
  "ended" status before the brief is sent (wait for `meeting_brief_sent` in `log.jsonl`); a failed walk must
  cancel its meeting row, or the Peer later joins alone. `peer meeting clean` removes every bot on the
  account, a live Peer's too.
- **Never the owner's own voice:** stock (premade) voices only, never a voice whose name holds the owner's
  name, a character budget, and no request when the account has under 20% left.

## Mail and calendar

- Gmail treats every alias of an account as "you": a `to:<alias>` search matches mail to every alias; read
  each message's own To.
- An Internal OAuth client on a Workspace domain avoids the 7-day token expiry and the unverified-app screen;
  the consent needs `openid email` among its scopes. Seeded test items carry a token in a header so the hard
  block can tell them from real mail.

## Sessions, reviews and checks

- **Measure context, never by feel, and right after reading.** A build session that read a plan, a design and
  a package's modules in full first measured at 72%, far past the 45 to 50% hand-off.
- **A passing check is not a complete guide.** The porting walk's toy adapter passed `port-check` on its first
  run, yet the fresh agent listed 11 gaps; the biggest: `port-check` ran only the adapter's own sample, so it
  could not see whether a chat adapter takes what the runtime sends. **Walk a guide with a stranger:** a fresh
  sub-agent (never a copy of yourself) on a plain export (`git archive <commit> <dirs> | tar -x -C <scratch>`,
  so no build docs or agent guide to learn from), a fixed preamble that fences it (every command with the
  export's home and a test owner, the only commands it may run), a skeleton named differently from the walk's
  toy, and its gaps in its final message: every file it opened beyond the guide, every guess. Then `diff -r`
  against a clean export, re-run its check yourself, fold the gaps, delete the export.
- **A check that never failed is unproven.** Make each guard go red on purpose once (the `port-check` FAIL
  paths were proven on broken adapters), and print the sample count: an empty result and a clean one look
  the same.
- **Reviewers find real issues; check each in the code.** Read-only reviews of briefs and plans found 18, 13
  and 9 points; the worst included a restart that would have kept stale playbooks, a walk longer than a
  10-minute shell call, and a test that could write to the live Peer's home. A reviewer's line is a claim:
  open the source and count what it touches before ruling.
- **Reviewers and sub-agents write into the shared scratch folder.** Brief them "write no file anywhere"; keep
  your own scripts in a subfolder with distinctive names. Read-only agents refuse to write report files: ask
  for the report in their final message, short.
- **A reviewer reading files sees your later edits:** pin it to a commit (`git show <sha>:<path>`).
- **Never kill by pattern.** `pkill -f` once killed another session's run; and a check like `pgrep -fl "peer
  watch"` "prints nothing" can never pass where an agent session's own launch prompt holds that text. Kill only
  a recorded PID; check with `ps -p <pid>`.
- **Times from the clock, states from the source.** A typed time was off by 11 minutes and needed a
  correction commit; a "main unmoved at <sha>" was stale a second later. `date -u` in the same command;
  `git ls-remote` for a ref.
- **Exact-text edits.** `sed -i "${L}i ..."` with an empty `L` (an anchor search that found nothing) inserted
  the text before every line and doubled a whole file; caught by `git diff --stat` before commit.
- **Fetch and count before every push:** worktrees of one clone share `origin/main`, and any session's push
  moves it.
- **Browser automation is expensive in a controller** (about 20% of its context for one setup job): give it to
  a sub-agent or a fresh session.
- **A big session pays its whole context on every call**: polling from it burns usage fast. Wait with a script
  and hand follow-ups to a small session.
- **Between sessions, hand off through files.** On the first laptop a message between two sessions in
  different permission modes was held for a person and then dropped; files in the repo always arrive.
