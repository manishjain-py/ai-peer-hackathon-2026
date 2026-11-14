# Hand-off: ai-peer-video-controller-3 to ai-peer-video-controller-4, 2026-11-14 (time: see the commit)

Dated, never edited; the living state is `demo-video/docs/STATE.md` on `main`. Reason: the
controller's context is at 38% of 1M after 2 hours 20 minutes, with Draft 2, a worker hand-off
and a feedback round ahead; and Manish's ruling puts every new session on Opus 5.5 (V15, C13).

- **Where it stands**: branch `main` of `manishjain-py/ai-peer-hackathon-2026`, checkout
  `/Users/manishjain/repos/ai-peer-hackathon-2026` on Mac 48 GB; no PR of the controller's own.
  Done and proven: WP1 (PR 7), WP3 (the nine AI shots, PR 8), WP2 with Draft 1 (PR 9), round 3
  (PR 10: the Earth's final version, a NASA credit on the end card). Manish watched Draft 1 and
  decided: the story, the voice and the music stay (V16); the hook gets new lines and the
  employee is called Ram (V17); the music is used for the internal film (V18); one worker at a
  time, on Opus 5.5 (V15). **Being built: Draft 2**, by `ai-peer-video-wp2-3`, with all of
  V16 and V17. Not proven yet: Draft 2, the new lines and how "Ram" is spoken, the quicker
  signature shot, the Earth close in motion.
- **The first thing to watch: the worker's context.** `ai-peer-video-wp2-3` was at 37% at
  14:57 UTC (18% at 14:20 UTC) and was told: "If your context passes 40 percent before the
  renders, tell me first." Expect that message within minutes. Then agree with it on a clean
  step to stop at (work pushed on its branch `video-wp2-3-quicker-rise`, a dated hand-off file
  on `main` that lists what of the Draft 2 order is done and what is left), close its window
  after the checks, and start `ai-peer-video-wp2-4` on Opus 5.5 with the launch script at the
  end of this file. One worker at a time (C13): never two live.
- **Next step, exactly** (also `STATE.md` "Next"):
  1. Put your name, window and link in `STATE.md`'s first lines; tell `ai-peer-video-wp2-3`
     your name in one line.
  2. Start your waits (the commands are below; mine were stopped at the hand-off).
  3. When Draft 2 arrives (the worker's message, or the wait `draft2`): **never send the full
     render** `~/.ai-peer/demo-video-private/renders/draft-02.mp4` and do not look at its
     frames (it carries the sound of a live test meeting of 7 November: C8; C12 allows only a
     draft that holds nothing but the stand-ins of 6 November). Look at one small sheet of the
     slates render `demo-video/film/renders/draft-02-slates.mp4` (30 frames, 250 pixels each:
     `ffmpeg -ss 2 -i <file> -vf "fps=1/4,scale=250:-2,tile=6x5" -frames:v 1 sheet.jpg`), check
     the hook (the name Ram, the two new lines in the captions, the message cards), the quicker
     reveal, the close. Then send Manish a 720p copy of the slates render: on the Attention
     group (`demo-video/tools/tg-send-file.sh video <file> "<caption>"`; the tool refuses files
     under `~/.ai-peer/`) and in the session with `SendUserFile` (its limit is 30 MiB). Tell
     him plainly that the slates stand for the product screens, that the full film is on the
     Mac at that path, and what to listen for: the two new lines, how "Ram" is spoken, the
     quicker rise.
  4. Sum the ledgers (`demo-video/ledger/*.csv`; the worker keeps its own file) into
     `STATE.md` "Money spent". $30.63 at 13:37 UTC; Draft 2 may add up to $10. Tell Manish at
     $50 and at $80.
  5. Manish's view of Draft 2: record his words at once (a `FEEDBACK-DRAFT-2-...md` file and a
     V row in `DESIGN.md`), pass them to the worker word for word.
  6. Tuesday 17 November: his recordings from his company laptop arrive in
     `~/.ai-peer/demo-video-private/` (`PLAN.md`, "What Manish must bring"): that is WP4, one
     worker, launched with `CLAUDE_NO_IDLE_PING=1`. The film is due Thursday 19 November.
  7. Close this session's window (3973, PID 12154) after the usual checks: a script launched
     it. Window 2952 (the first controller) only when Manish says "close it".
- **Your waits** (each as its own background command of your session; `demo-video/tools/wait-for.sh`):

  ```
  cd /Users/manishjain/repos/ai-peer-hackathon-2026
  # the whole week's usage (no video session runs on Fable any more, so the first number is out of reach)
  WAIT_PIDFILE=$HOME/.ai-peer/demo-video-private/controller/usage.pid WAIT_LOG=$HOME/.ai-peer/demo-video-private/controller/waits.log demo-video/tools/wait-for.sh usage 0 300 '/Users/manishjain/repos/ai-peer-hackathon-2026/demo-video/tools/usage-check.sh 101 40 /Users/manishjain/.ai-peer/demo-video-private/controller/usage.log' 'Demo video: the whole week of Claude usage passed 40%.'
  # the worker gone silent for 25 minutes, or its process gone (stop this wait before you close its window)
  WAIT_PIDFILE=$HOME/.ai-peer/demo-video-private/controller/stall-wp2-3.pid WAIT_LOG=$HOME/.ai-peer/demo-video-private/controller/waits.log demo-video/tools/wait-for.sh stall-wp2-3 16635 60 'd=$HOME/.claude/projects/-Users-manishjain-repos-ai-peer-hackathon-2026; s=d1cb4441-b9a9-4aa3-ba40-ccfe560894d3; ! find "$d/$s.jsonl" "$d/$s" -name "*.jsonl" -mmin -25 2>/dev/null | grep -q .' 'Demo video: ai-peer-video-wp2-3 has been silent for 25 minutes.'
  # Draft 2's private render finished
  WAIT_PIDFILE=$HOME/.ai-peer/demo-video-private/controller/draft2.pid WAIT_LOG=$HOME/.ai-peer/demo-video-private/controller/waits.log demo-video/tools/wait-for.sh draft2 0 20 'f=$HOME/.ai-peer/demo-video-private/renders/draft-02.mp4; [ -f "$f" ] && [ $(( $(date +%s) - $(stat -f %m "$f") )) -ge 90 ]' 'Demo video: Draft 2 is rendered.'
  ```

- **Still running or kept**:

  | What | Where | PID | How to check it | How to re-create it |
  |---|---|---|---|---|
  | `ai-peer-video-wp2-3` (Draft 2; Opus 5.5 `claude-opus-5-5[1m]`, max effort, `CLAUDE_NO_IDLE_PING=1`) | Terminal window 3974; worktree `~/repos/ai-peer-video-wp2`, branch `video-wp2-3-quicker-rise`; transcript `d1cb4441-b9a9-4aa3-ba40-ccfe560894d3` | 16635 | `~/.claude/skills/mac-terminal-control/scripts/mac-term.sh read 3974` | A fresh session `ai-peer-video-wp2-4` from `handoffs/HANDOFF-2026-11-14-ai-peer-video-wp2-3.md`, `FEEDBACK-DRAFT-1-2026-11-14.md`, `DESIGN.md` V16 and V17, and the worker's own hand-off |
  | `ai-peer-video-controller-3` (this session, after the hand-off) | Terminal window 3973; the shared checkout; it writes nothing more there | 12154 | `mac-term.sh read 3973` | Not needed: close it after the checks |
  | `ai-peer-video-controller-1` (the first controller) | Terminal window 2952; other sessions call it `learnlikemagic-f7` | 38022 | `mac-term.sh read 2952` | Not needed. Manish opened it: close it only on his "close it" |
  | The private folder | `~/.ai-peer/demo-video-private/`: `renders/draft-01.mp4` (the full Draft 1), `controller/` (`usage.log`, `waits.log`, the waits' pid files), `product-private.json` | none | `ls` | The renders by `node demo-video/film/render.mjs --private --name draft-NN --quality delivery` |
  | Worktrees | `~/repos/ai-peer-video-wp1` (merged, kept), `~/repos/ai-peer-video-wp3` (merged; 84 unused raw takes outside git), `~/repos/ai-peer-video-wp2` (**do not clean**: five unused music takes outside git on purpose) | none | `git worktree list` | Not needed |

  No wait is running: the four of this session were stopped at the hand-off.
- **Waits on Manish**: no question is open. He knows of three small things: his recordings by
  Tuesday 17 November morning, India time (the meeting from a participant's screen in gallery
  view); a look at the fal.ai credit, which no key can read (at 14:55 UTC he said he would
  check it); the idle window 2952, closed on his "close it". Next from him: his view of Draft 2.
- **Facts it relies on, quoted**:
  - "First preference is to use Claude native capabilities. If that is not possible to fulfill
    the requirement, then we can use any tools that you think can do that." (V2)
  - "for the budget cap, let's keep $100 for now, and afterwards we will see if we can extend it
    or not." (V3)
  - "Sure. Let's go ahead with this story for the first draft and create the video and show it
    to me how it comes out end to end." (V10)
  - "Wherever you need my choice, send it to me on telegram. I ll review there and reply here"
    (V11; C12: files with captions to the Attention group, then one text line with the options
    and the recommendation; the same question in the session's reply)
  - "one worker at a time, on Opus 5.5" (V15; C13: every new session on Opus 5.5 at max effort,
    launched with `--model "claude-opus-5-5[1m]"`; a worker starts no helper without the
    controller's yes)
  - "I think the story works end to end. Let's go on with it." "the voice and music, it's good.
    Let's keep them." "it should just get up and go to the desk and start working" (V16; in
    full in `FEEDBACK-DRAFT-1-2026-11-14.md`)
  - "Sure, the proposals look good." "maybe we can use the name Ram, RAM" (V17). The lines as
    ordered: h1 "It's 2 AM for Ram... and I just got my answer." h2 "Ram's out of office... but
    his AI Peer already sent me the update I needed." h3 unchanged, "Does he ever sleep?". p01
    unchanged. p02 "I'm Ram's AI Peer." "Ram" is spoken "Raam" and written "Ram". Also ordered:
    a message card beside colleagues 1 and 2 ("Ram's AI Peer" with the AI mark), a label on the
    sleeper, the tag "Ram's AI Peer", the note "Real recordings: the builder's own AI Peer at
    work" in the proof part, the hook at about 15 s, the rise and walk in about 9 s, everything
    from 32.0 s on unchanged, paid calls up to $10.
  - "Yeah, for the music, yeah, let's go with your pick. Let's use it for the internal film. No
    worries." (V18: read the terms again before any public release)
  - The product builds the Peer's label from its owner's first name (`peer/defaults.yaml`,
    `bot_name: "{first}'s AI Peer"`), so his real recordings will say "Manish's AI Peer".
  - The film's timeline is `demo-video/film/shots.json`; its lines are
    `demo-video/film/audio/script.json`. Draft 1: hook 0 to 12 s, reveal 12 to 32, proof 32 to
    90, morning 90 to 108, close 108 to 120.
  - Usage: Fable's week went from 39% to 64% between 12:34 and 13:38 UTC with four sessions
    and their helpers, then stayed near flat once the workers were closed (66% at 14:54 UTC;
    whole week 34%). The week resets Monday 17 November 04:30 India time.
  - This Mac's ffmpeg has no `drawtext`. Inline shell is zsh. A foreground `sleep` is blocked.
- **What cost context, so you can spare yours**: 9% after the reading phase, 27% when Draft 1
  went out (one hour), 38% at the hand-off. The big items: `ListAgents` (77 rows; do not call
  it, the names are in `STATE.md`), six pictures, and edit scripts typed inline. Put every
  edit script and commit message in a file in your scratchpad and run plain commands: one long
  inline command with a heredoc and quoted words was refused by the harness's own safety check.
  Read `STATE.md` by section. What Manish must read goes in the last message of your turn.
- **Successor launch**: this script was run by ai-peer-video-controller-3 for you (a worker's
  successor is launched the same way, with its own name and kickoff, plus
  `export CLAUDE_NO_IDLE_PING=1` for a session that shows the product recordings, and "Your
  worktree already exists at ...; write nothing in the shared checkout you start in"):

  ```
  #!/bin/zsh
  cd /Users/manishjain/repos/ai-peer-hackathon-2026 || exit 1
  export ANTHROPIC_MODEL="claude-opus-5-5[1m]"
  exec claude --model "claude-opus-5-5[1m]" --effort max --name ai-peer-video-controller-4 \
    --remote-control ai-peer-video-controller-4 "You are ai-peer-video-controller-4, taking over from ai-peer-video-controller-3. ..."
  ```

  It is opened with `osascript` (`do script "zsh <file>"`), and the window that was in front
  is put back: `references/sessions.md` of the big-initiative skill has the four lines.
