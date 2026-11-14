# Hand-off: ai-peer-video-controller-2 to ai-peer-video-controller-3, 2026-11-14 (time: see the commit)

Dated, never edited; the living state is `demo-video/docs/STATE.md` on `main`. Reason: the
controller's context reached 40% of 1M after 65 minutes, with several heavy events ahead (the
rule is to hand off at 45 to 50%).

- **Where it stands**: branch `main` of `manishjain-py/ai-peer-hackathon-2026`, checkout
  `/Users/manishjain/repos/ai-peer-hackathon-2026` on Mac 48 GB; no PR of the controller's own.
  Done and proven: WP1 (the look and the clone shot three ways; merged as PR 7, $6.60, its
  session closed). WP2's first half (the film project with a one-command render, the whole
  narration, captions, the night clock, the end card, the product screens for Draft 1; a 2:00
  animatic seen by the controller). WP3's milestone 1 (stills, the look of the double, a moving
  draft of all nine AI shots in its manifest; seen by the controller as a sheet). Manish's
  answers V11 to V14. Not proven yet: Draft 1, any final shot, any lip-sync, the music, the
  Earth close.
- **The urgent thing: usage.** Read at 12:34 UTC with `claude -p "/usage" --output-format text`:
  week (all models) **20%**, week (Fable) **39%**; at 11:33 UTC they were 10% and 19%, and 0% at
  10:10 UTC. The video burns about 10% of the whole week and 20% of Fable's week an hour, with
  four or five sessions at max effort that read many pictures. The week resets Monday 17
  November 04:30 India time. At this pace Fable ends at about 15:30 UTC and the whole week at
  about 20:30 UTC today, which would also stop Learn Like Magic's sessions on this account.
  Manish was asked what to do (see "Waits on Manish"). Until he answers: start no new helper
  that is not needed for Draft 1, read usage at every event, and follow the repo's rule (week
  at 93%: start nothing long; 95%: every session finishes its step, hands off and stops).
- **Next step, exactly** (also `STATE.md` "Next"):
  1. Put your name, window and link in `STATE.md`'s first lines; tell `ai-peer-video-wp2-2` and
     `ai-peer-video-wp3` your name (one line each; a message costs the receiver a turn).
  2. Start your own waits from the "Still running" table in `STATE.md` (runs of
     `demo-video/tools/wait-for.sh`; its header shows the usage). Mine were stopped at the
     hand-off. The three tests: Draft 1's file `~/.ai-peer/demo-video-private/renders/draft-01.mp4`
     unchanged for 90 s, or PID 88331 gone; WP3's `demo-video/shots/REPORT.md` in
     `~/repos/ai-peer-video-wp3`, or PID 64734 gone; the transcript of WP2-2
     (`3b59da85-1a19-4cc4-9875-244a8d19e09d`) or WP3 (`1c97ea6b-c294-42be-ae5e-8c9d772564bf`)
     and its sub-agents silent for 25 minutes (both transcripts are in
     `~/.claude/projects/-Users-manishjain-repos-ai-peer-hackathon-2026/`).
  3. Manish's answer on usage: apply it at once (it may mean new sessions on Opus 5.5, one worker
     at a time, or a move to another subscription), record it in `DESIGN.md` section 0.
  4. When `ai-peer-video-wp2` (window 3963, PID 48241) says its helpers' reports are on `main`
     as `handoffs/HANDOFF-2026-11-14-ai-peer-video-wp2-2-helpers.md`: check the file is there,
     then close window 3963 by the checks in the big-initiative skill's `references/sessions.md`.
  5. WP3 was at 33% context at 12:34 UTC and hands off at 45 to 50%: start `ai-peer-video-wp3-2`
     the way WP2-2 was started (the launch script at the end of this file, with the names
     changed, no `CLAUDE_NO_IDLE_PING`), then close window 3968 after the checks.
  6. Each final of `reveal-rise` and `reveal-desk` from WP3: look at its sheet, then send the
     clip to Manish on Telegram (`demo-video/tools/tg-send-file.sh video <file> "<caption>"`).
  7. Draft 1 from `ai-peer-video-wp2-2`: look at a frame at every cut (one sheet of small frames;
     an image costs context). Then send it to Manish: in the session with `SendUserFile` and on
     Telegram as a checked copy made outside `~/.ai-peer/` and shrunk to 720p (it holds only
     demo-data stand-ins, which C8 and C12 allow; a cut with his real recordings is never sent).
  8. Sum the ledgers (`demo-video/ledger/*.csv` on the workers' branches) into `STATE.md` "Money
     spent" at each package's end. Tell Manish at $50 and at $80. At 12:34 UTC: WP1 $6.60, WP3
     $7.90 (52 rows), WP2 unknown (its music helper may spend up to $5): about $14.50.
- **Still running or kept**:

  | What | Where | PID or port | How to check it | How to re-create it |
  |---|---|---|---|---|
  | `ai-peer-video-wp2-2` (finishes WP2: the push-in, the tag, Draft 1, report, PR; cap $10 for the package) | Terminal window 3972; worktree `~/repos/ai-peer-video-wp2`, branch `video-wp2-film-build`; https://claude.ai/code/session_01Nfn5h9VhYd7zMX2hQUt663 | 88331 | `~/.claude/skills/mac-terminal-control/scripts/mac-term.sh read 3972` | A fresh session from `handoffs/HANDOFF-2026-11-14-ai-peer-video-wp2-2.md` |
  | `ai-peer-video-wp3` (the nine AI shots; cap $60) | Terminal window 3968; worktree `~/repos/ai-peer-video-wp3`, branch `video-wp3-ai-shots`, draft PR 8; https://claude.ai/code/session_01Nfn5h7gdJoQpiC45zksGMJ | 64734 | `mac-term.sh read 3968` | A fresh session from `handoffs/HANDOFF-2026-11-14-ai-peer-video-wp3.md` plus `research/fal-facts-2026-11-14.md` |
  | `ai-peer-video-wp2` (handed off; waits only for its two helpers: the Earth close, and music with sound effects) | Terminal window 3963; https://claude.ai/code/session_01Nfn5h95MaF4HSLH6cbpUbu | 48241 | `mac-term.sh read 3963` | Not needed: WP2-2 holds its work |
  | `ai-peer-video-controller-2` (this session, after the hand-off) | Terminal window 3964; it shares the checkout and writes nothing there any more | 49247 | `mac-term.sh read 3964` | Not needed. It has no job left; close it after the checks (it was launched by a script, not by Manish). If Manish answers there, it passes his words on by message. |
  | `ai-peer-video-controller-1` (the first controller) | Terminal window 2952; other sessions message it as `learnlikemagic-f7` | 38022 | `mac-term.sh read 2952` | Not needed. Manish opened that window himself: ask him before closing it. |
  | The private folder | `~/.ai-peer/demo-video-private/` (WP2's private builds and renders) | none | `ls` | `mkdir -p` |
  | WP1's worktree | `~/repos/ai-peer-video-wp1` (merged, clean; kept) | none | `git worktree list` | Not needed |

- **Waits on Manish**:
  1. **Usage** (asked at the hand-off, on Telegram and in the session): the video uses about
     10% of the week's Claude allowance an hour. A (recommended): finish Draft 1 tonight with
     what runs now, then pause the workers; new sessions on Opus 5.5 from now; one worker at a
     time after Draft 1. B: keep full speed and move the video to another subscription when
     this one runs out. C: stop now and go on after Monday's reset.
  2. May the first controller's window (2952) be closed.
  3. A look at the fal.ai credit, which no key can read (WP3 may spend up to $60).
  4. His recordings from the company laptop by Tuesday 17 November morning, India time (the
     list and how to record the meeting are in `PLAN.md`; told to him again at 12:19 UTC).
  5. Draft 1, when it exists.
- **Facts it relies on, quoted**:
  - "First preference is to use Claude native capabilities. If that is not possible to fulfill
    the requirement, then we can use any tools that you think can do that." (V2)
  - "for the budget cap, let's keep $100 for now, and afterwards we will see if we can extend it
    or not." (V3)
  - "Sure. Let's go ahead with this story for the first draft and create the video and show it
    to me how it comes out end to end." (V10)
  - "Wherever you need my choice, send it to me on telegram. I ll review there and reply here"
    (V11; applied by C12: files with captions to the Attention group through
    `demo-video/tools/tg-send-file.sh`, then one text line with the options and the
    recommendation; the same question in the session's reply).
  - "Let's go with your recommendations" (V12 voice 1, Matilda; V13 the rise by route O, with a
    fall-back if O loses his face or the threads; V14 the look B, threads of light).
  - The shared list of the nine AI shots and the hand-over between WP3 and WP2 is `SHOTS.md`.
    Live fal.ai prices and twelve corrections to WP3's brief are in
    `research/fal-facts-2026-11-14.md`. Six lessons from the September film are at the top of
    `DRAFT07-WATCH.md` (passed to WP2).
  - Asks go to him one at a time where they depend on each other, in plain words, with a
    recommendation; while a worker is live, ask in a plain reply, never with the question dialog.
  - Keys on this Mac: `FAL_KEY` (shell environment), `ELEVENLABS_API_KEY` in `~/.ai-peer/.env`.
    The Gemini, OpenAI and Stability keys belong to Learn Like Magic set-ups: never spend on
    them without Manish's word.
  - This Mac's ffmpeg has no `drawtext` filter. Inline shell here is zsh: a glob with no match
    aborts the whole command line (use `find`), and a variable must not be named `path`.
- **What cost context, so you can spare yours**: 9% after the reading phase, 40% an hour later.
  The big items were two long reads of the research note (do not read it; WP1 tested what it
  claims), eight full-size pictures, and long thinking inside one turn. Look at one small sheet
  per event (1,500 pixels wide at most), give long reads to a read-only helper only when a
  decision needs them, and edit `STATE.md` with a short script (exact anchors, the time from
  `date -u` in the same command) instead of reading it whole.
- **Successor launch**: the script below was run by controller-2 (with the model line as Manish's
  standing rule has it; change the model only on his word or when Fable's allowance has run out,
  `DESIGN.md` C6).

  ```
  cd /Users/manishjain/repos/ai-peer-hackathon-2026 && ANTHROPIC_MODEL="claude-fable-5-2" \
    claude --model "claude-fable-5-2" --effort max --name ai-peer-video-controller-3 \
    --remote-control ai-peer-video-controller-3 "You are ai-peer-video-controller-3, taking over from ai-peer-video-controller-2. Read demo-video/docs/STATE.md on origin/main (its sections from the top down to Next; its session log only if you need it), then demo-video/docs/handoffs/HANDOFF-2026-11-14-ai-peer-video-controller-2.md, and work by the big-initiative skill (this repo's AGENTS.md and demo-video/AGENTS.md win where they differ). ..."
  ```

  A worker's successor is launched the same way from a script file opened with `osascript`
  (`do script`), with the window that was in front put back, as this file's author did for
  `ai-peer-video-wp2-2`:

  ```
  #!/bin/zsh
  cd /Users/manishjain/repos/ai-peer-hackathon-2026 || exit 1
  export ANTHROPIC_MODEL="claude-fable-5-2"
  export CLAUDE_NO_IDLE_PING=1   # only for a session that shows the product recordings
  exec claude --model "claude-fable-5-2" --effort max --name <name> --remote-control <name> \
    "You are <name>, a worker on the AI Peer demo video in this repo, the successor of <old name>. The live controller is <controller> unless demo-video/docs/STATE.md on the default branch names a newer one. Read, in order: demo-video/docs/STATE.md on origin/main, then <the first brief>, then <the hand-off>. ... Your worktree already exists at <path> (branch <branch>); write nothing in the shared checkout you start in."
  ```
