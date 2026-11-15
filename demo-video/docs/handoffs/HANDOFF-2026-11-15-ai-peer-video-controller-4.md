# Hand-off: ai-peer-video-controller-4 to ai-peer-video-controller-5, 2026-11-15 (time: see the commit)

Dated, never edited; the living state is `demo-video/docs/STATE.md` on `main`.

**Why now.** The controller's context is at 36% of 1M (364k tokens). The big-initiative skill
hands a waiting controller's follow-up to a small session past about 150k tokens. The
account's week is also tight: 63% at 13:13 UTC, about 1.4 points an hour, resetting on Monday
16 November at 22:59 UTC. A fresh controller costs about a third as much per call.

## Where it stands

- **The checkout.** Branch `main` of `manishjain-py/ai-peer-hackathon-2026`, checked out at
  `/Users/manishjain/repos/ai-peer-hackathon-2026` on Mac 48 GB. The controller has no PR of
  its own.
- **Done and approved.** Draft 3 (PR 12, `bb81fc5`, `demo-video/film/renders/draft-03.mp4`),
  the public build with made-up screens. Manish: "draft 3 looks good." (V21). The film waits
  for its next round: his real recordings, or the made-up screens kept. That is his call,
  later.
- **Live: WP6** (V22), wow concepts for the AI Peer's own screens, by `ai-peer-video-wp6`.
  - Terminal window 5567, PID 11478, transcript `fe5edd36-f7f3-42c4-b2e1-c1e44643bb08`,
    https://claude.ai/code/session_01Nfn5h6rbZhFxCgZXTT1Tc4.
  - Launched at 13:19 UTC, with `CLAUDE_NO_IDLE_PING=1`.
  - Brief: `handoffs/HANDOFF-2026-11-15-ai-peer-video-wp6.md`. Manish's words:
    `BRIEF-UI-WOW-2026-11-15.md`.
  - It makes its own worktree `~/repos/ai-peer-video-wp6` on branch `video-wp6-wow-concepts`.
  - Already allowed: one research helper and up to three builder helpers; up to $10.
- **Not proven yet.** Everything of WP6: nothing has been made yet.

## Next step, exactly

1. **Take over.** Put your name, window and link in STATE.md's first lines. Tell
   `ai-peer-video-wp6` your name in one line. Start your waits (below); mine stop at this
   hand-off.
2. **WP6's events.** Read its context at each event: it tells you at 40% and hands off by 45%
   to `ai-peer-video-wp6-2`. Launch that successor like it, with the launch script at the end of
   this file, a new kickoff file, and its own hand-off. Grant no helper beyond its brief
   without a reason.
3. **When WP6 delivers its concepts.**
   - Look at its overview picture (one picture).
   - Check that the concepts hold only made-up data: no name, role, project, channel or link
     from the walkthrough recording, and no frame of it.
   - Send them to Manish on the Attention group: each video with a caption, by
     `demo-video/tools/tg-send-file.sh video <file> "<caption>"`. A file over about 50 MB
     needs a 720p copy first, which `ffmpeg -vf scale=1280:-2` makes.
   - Then send one text line, by `~/.claude/skills/notify/scripts/tg-attention.sh`, with the
     question "Which ideas do you like?" and the worker's order.
   - Send the same files and question in the session (`SendUserFile`, which takes at most
     30 MiB a file).
   - Record his answer at once: a `FEEDBACK-WOW-...md` file and V23 in `DESIGN.md`. Pass it
     to the worker word for word.
4. **Usage.**
   - The alarm rings at 70%; re-arm it at 85%.
   - At 85%, ask the worker to stop at its next clean step. At 93%, pause all video work and
     tell Manish on the Attention group: he may move the work to another subscription.
   - Read `tail -1 ~/.ai-peer/demo-video-private/controller/usage.log` at each event.
   - The week resets Tuesday 17 November 04:29 India time (Monday 16 November 22:59 UTC), by
     `/usage`'s own line.
5. **Money.** $41.43 of the $100 cap is spent; WP6 may add up to $10. Sum the ledgers
   (`demo-video/ledger/*.csv`) into STATE's "Money spent" at each package's end. Tell Manish
   at $50 and at $80.
6. **Close my window** (3977, PID 35776) after the usual checks: a script launched it. Close
   window 2952 (the first controller) only on Manish's "close it".

## Your waits

Run each as its own background command of your session.

```
cd /Users/manishjain/repos/ai-peer-hackathon-2026
# the whole week's usage (Fable's threshold 101 is out of reach; nothing runs on Fable)
WAIT_PIDFILE=$HOME/.ai-peer/demo-video-private/controller/usage.pid WAIT_LOG=$HOME/.ai-peer/demo-video-private/controller/waits.log demo-video/tools/wait-for.sh usage 0 300 '/Users/manishjain/repos/ai-peer-hackathon-2026/demo-video/tools/usage-check.sh 101 70 /Users/manishjain/.ai-peer/demo-video-private/controller/usage.log' 'Demo video: the whole week of Claude usage passed 70%.'
# the worker silent for 25 minutes, or its process gone
WAIT_PIDFILE=$HOME/.ai-peer/demo-video-private/controller/stall-wp6.pid WAIT_LOG=$HOME/.ai-peer/demo-video-private/controller/waits.log demo-video/tools/wait-for.sh stall-wp6 11478 60 'd=$HOME/.claude/projects/-Users-manishjain-repos-ai-peer-hackathon-2026; s=fe5edd36-f7f3-42c4-b2e1-c1e44643bb08; ! find "$d/$s.jsonl" "$d/$s" -name "*.jsonl" -mmin -25 2>/dev/null | grep -q .' 'Demo video: ai-peer-video-wp6 has been silent for 25 minutes.'
```

Two rules about the stall wait:
- **Stop it before you close the worker's window.**
- **Stop it while the worker waits, idle, for Manish:** an idle worker sets off a false
  "silent" alarm. Re-arm it when the work resumes.

## Still running or kept

| What | Where | PID | How to check it | How to re-create it |
|---|---|---|---|---|
| `ai-peer-video-wp6` (WP6; Opus 5.5, max effort) | Terminal window 5567; worktree `~/repos/ai-peer-video-wp6` (its own) | 11478 | `~/.claude/skills/mac-terminal-control/scripts/mac-term.sh read 5567`; context: the last `usage` record of its transcript | A fresh `ai-peer-video-wp6-2` from its hand-off file |
| `ai-peer-video-controller-4` (this session, after the hand-off) | Terminal window 3977; the shared checkout; it writes nothing more there | 35776 | `mac-term.sh read 3977` | Not needed: close it after the checks |
| `ai-peer-video-controller-1` (the first controller) | Terminal window 2952 | 38022 | `mac-term.sh read 2952` | Not needed; close it only on Manish's "close it" |
| The private folder | `~/.ai-peer/demo-video-private/`: `renders/` (the full Drafts 1 to 3), `controller/` (`usage.log`, `waits.log`, the pid files), `ui-wow/walkthrough-2026-11-15.mp4` (real company content) | none | `ls` | Not in git on purpose |
| Worktrees | `~/repos/ai-peer-video-wp1`, `-wp3` (merged; raw takes outside git), `-wp2` (**do not clean**: music and raw takes outside git), `-wp6` (live) | none | `git worktree list` | Not needed |

No wait of mine runs after this hand-off; they are stopped in the same step.

## Waits on Manish

No question is open. Next from him: his review of WP6's concepts. Later: whether his real
recordings (planned for Tuesday 17 November) replace the film's made-up screens.

## Facts it relies on, quoted

- "First preference is to use Claude native capabilities. If that is not possible to fulfill
  the requirement, then we can use any tools that you think can do that." (V2)
- "for the budget cap, let's keep $100 for now, and afterwards we will see if we can extend it
  or not." (V3)
- "Wherever you need my choice, send it to me on telegram. I ll review there and reply here"
  (V11; C12: the files with captions to the Attention group, then one text line with the
  options and the recommendation; the same in the session).
- "one worker at a time, on Opus 5.5" (V15; C13: every new session on Opus 5.5 at max effort,
  `--model "claude-opus-5-5[1m]"`; no helper without the controller's yes).
- "the voice and music, it's good. Let's keep them." (V16)
- "definitely I don't want him to come out of the sleeping Ram, because then it looks more like
  a ghost" "Let that data be dummy for now, so that I can get a real feel of what the final
  video will end up looking like." (V19)
- "Let's go with Ram's look from the phone." (V20)
- "draft 3 looks good." (V21)
- "how do we make it super attractive? How do we make it visually very, very appealing, that
  people just look at it and they say: wow, this looks super, super cool?" "Same
  functionality, a different visual idea. Create a video of that idea" "come up with your
  four to five best ideas" "I want you to see this recording yourself" (V22)
- **Privacy (C8, V22).** The film's private render and the walkthrough recording hold real
  company content.
  - Never send the private render, and never look at its frames.
  - The walkthrough may be looked at (his request), but nothing from it goes into git or to any
    outside tool, Telegram included.
  - The concept videos use made-up data only.

## What cost context, so you can spare yours

- About 10 pictures (sheets) over 22 hours, and long STATE edits.
- Look at one small picture per event.
- Put edit scripts and commit messages in scratchpad files, quote every heredoc (`<<'EOF'`),
  and pass values through the environment. An unquoted heredoc ran backticks and blanked two
  commit ids once.
- Read STATE.md by section.

## Successor launch

This script was run by ai-peer-video-controller-4 for you. A worker's successor is launched
the same way, with its own name and kickoff file, plus `export CLAUDE_NO_IDLE_PING=1`.

```
#!/bin/zsh
cd /Users/manishjain/repos/ai-peer-hackathon-2026 || exit 1
export ANTHROPIC_MODEL="claude-opus-5-5[1m]"
PROMPT="$(cat <kickoff file>)"
exec claude --model "claude-opus-5-5[1m]" --effort max --name ai-peer-video-controller-5 --remote-control ai-peer-video-controller-5 "$PROMPT"
```

Open it with `osascript`: `do script "zsh <file>"`, then put the front window back (the four
lines are in the big-initiative skill's `references/sessions.md`). Find the new window with
`mac-term.sh list`, and its PID and transcript in `~/.claude/sessions/<pid>.json`.
