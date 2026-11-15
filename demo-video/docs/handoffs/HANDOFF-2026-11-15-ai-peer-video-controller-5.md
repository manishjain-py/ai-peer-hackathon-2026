# Hand-off: ai-peer-video-controller-5 to ai-peer-video-controller-6, 2026-11-15 (time: see the commit)

Dated, never edited; the living state is `demo-video/docs/STATE.md` on `main`.

**Why now.** The controller's context is at 30.5% of 1M (305k tokens, 16:54 UTC). The account's
week is tight: 73% at 16:52 UTC, about 3 points an hour while a worker runs, resetting on
Monday 16 November at 22:59 UTC. A fresh controller costs about a third as much per call, and
the next event (the Little Peer blend) is an hour or more away.

## Where it stands

- **The checkout.** Branch `main` of `manishjain-py/ai-peer-hackathon-2026` (private), at
  `/Users/manishjain/repos/ai-peer-hackathon-2026` on Mac 48 GB. The controller has no PR.
- **Manish's last words.** He picked Little Peer among WP6's five concepts (V23) and asked for
  two "blended videos" (V24): Draft 3's story with a product walkthrough as the main demo part,
  one with the tag mascot from a video he made on another Mac, one with Little Peer; nothing
  overwritten. Asked whether the tag video's code exists: "For now let's build from the video"
  (V26). And a repo any Mac can take over from (V25): the existing private repo, completed.
  His full words: `demo-video/docs/BRIEF-BLENDED-2026-11-15.md`.
- **Done.** Git tags `draft-01`, `draft-02`, `draft-03`, `wow-concepts-v1`. `START-HERE.md` and
  `docs/ways-of-working/` (the recipe, skills, lessons, global rules, a settings snippet),
  fixed after a stranger's test that found 15 gaps. WP6 closed at 16:32 UTC.
- **Live: WP7**, the two blended videos, by `ai-peer-video-wp7`.
  - Terminal window 5589, PID 64154, transcript `b1fb5e1a-9984-4180-84d3-3d2f7c327445`,
    https://claude.ai/code/session_01Nfn5h6qqRLyRxrh3ochTLm. Launched at 16:38 UTC with
    `CLAUDE_NO_IDLE_PING=1`, Opus 5.5 at max effort.
  - Brief: `handoffs/HANDOFF-2026-11-15-ai-peer-video-wp7.md`. Worktree
    `~/repos/ai-peer-video-wp7`, branch `video-wp7-blended` (from `c6cfe05`).
  - Its plan was approved at 16:48 UTC (STATE, "Where we are"): one skeleton of about 1:59 for
    both; Little Peer first, then the tag (rebuilt by code in `demo-video/ui-concepts/tag/`).
    Cut from Draft 3: Ram's look, the big world of information, the Earth, line p07.
  - Asked of it at 16:55 UTC, low priority: make `demo-video/film/shots.json` read the repo's
    own `demo-video/shots/manifest.json` instead of WP3's worktree (proved by an unchanged Draft
    3), or say what is missing from git.
  - Allowed: up to two builder helpers, up to $10. Context 25.1% at 16:53 UTC.
- **Not proven yet.** Everything of WP7.

## Next step, exactly

1. **Take over.** Your name, window and link in STATE.md's first lines. Tell
   `ai-peer-video-wp7` your name in one line. Start your waits (below); mine stop at this
   hand-off.
2. **WP7's events.** Read its context at each (my `ctx` method: the last `usage` record of its
   transcript, input plus cache tokens over 1M). It tells you at 40% and hands off by 45% to
   `ai-peer-video-wp7-2`; launch that one like WP7 (the script at the end, its own kickoff file
   naming its hand-off file). Grant no helper beyond its brief without a reason.
3. **When a blend arrives** (Little Peer first):
   - Look at one small sheet (16 frames at about 320 px). Check it is a public build and holds
     only made-up data: `demo-video/tools/privacy-check.sh <head sha> <base sha>` counts real
     terms from the private list in the files the branch changed (expect 0) and exact copies of
     private files (expect 0); it prints counts only.
   - Send it to Manish on the Attention group:
     `demo-video/tools/tg-send-file.sh video <file> "<caption>"`. The caption names the Draft 3
     parts that were cut (say the big world plainly: he asked for it in V20). Over about 50 MB,
     send a 720p copy (`ffmpeg -vf scale=1280:-2`).
   - Then one text line by `~/.claude/skills/notify/scripts/tg-attention.sh`: what to look at
     and the question "What do you think of this blend?". The same file and question in the
     session (`SendUserFile`, at most 30 MiB).
   - Record his answer at once: a `FEEDBACK-BLENDED-...md` file in `demo-video/docs/` and a V
     row in `DESIGN.md` section 0 (V27 is next). Pass it to the worker word for word.
4. **Usage.** The alarm rings at 85%: tell the worker to stop at its next clean step, and re-arm
   the alarm at 93%. At 93%, pause all video work and tell Manish on the Attention group: the
   work can move to another subscription or Mac (`START-HERE.md`). Read
   `tail -1 ~/.ai-peer/demo-video-private/controller/usage.log` at each event.
5. **Money.** $41.43 of the $100 cap is spent (WP6 spent $0); WP7 may add up to $10. Sum the
   ledgers (`demo-video/ledger/*.csv`) into STATE's "Money spent" at the package's end. Tell
   Manish at $50 and at $80.
6. **Close my window** (5570, PID 14002) after the usual checks: a script launched it. Close
   window 2952 (the first controller, PID 38022) only on Manish's "close it".

## Your waits

Run each as its own background command of your session.

```
cd /Users/manishjain/repos/ai-peer-hackathon-2026
# the whole week's usage (Fable's threshold 101 is out of reach; nothing runs on Fable)
WAIT_PIDFILE=$HOME/.ai-peer/demo-video-private/controller/usage.pid WAIT_LOG=$HOME/.ai-peer/demo-video-private/controller/waits.log demo-video/tools/wait-for.sh usage 0 300 '/Users/manishjain/repos/ai-peer-hackathon-2026/demo-video/tools/usage-check.sh 101 85 /Users/manishjain/.ai-peer/demo-video-private/controller/usage.log' 'Demo video: the whole week of Claude usage passed 85%.'
# the worker silent for 25 minutes, or its process gone
WAIT_PIDFILE=$HOME/.ai-peer/demo-video-private/controller/stall-wp7.pid WAIT_LOG=$HOME/.ai-peer/demo-video-private/controller/waits.log demo-video/tools/wait-for.sh stall-wp7 64154 60 'd=$HOME/.claude/projects/-Users-manishjain-repos-ai-peer-hackathon-2026; s=b1fb5e1a-9984-4180-84d3-3d2f7c327445; ! find "$d/$s.jsonl" "$d/$s" -name "*.jsonl" -mmin -25 2>/dev/null | grep -q .' 'Demo video: ai-peer-video-wp7 has been silent for 25 minutes.'
```

- **Stop the stall wait before you close the worker's window,** and while the worker waits,
  idle, for Manish (an idle worker sets off a false alarm). Re-arm it when the work resumes.

## Still running or kept

| What | Where | PID | How to check it | How to re-create it |
|---|---|---|---|---|
| `ai-peer-video-wp7` (WP7; Opus 5.5, max effort) | Terminal window 5589; worktree `~/repos/ai-peer-video-wp7` (its own) | 64154 | `~/.claude/skills/mac-terminal-control/scripts/mac-term.sh read 5589`; context: the last `usage` record of its transcript | A fresh `ai-peer-video-wp7-2` from a hand-off file and its branch |
| `ai-peer-video-controller-5` (this session, after the hand-off) | Terminal window 5570; the shared checkout; it writes nothing more there | 14002 | `mac-term.sh read 5570` | Not needed: close it after the checks |
| `ai-peer-video-controller-1` (the first controller) | Terminal window 2952 | 38022 | `mac-term.sh read 2952` | Not needed; close it only on Manish's "close it" |
| The private folder | `~/.ai-peer/demo-video-private/`: `renders/` (full Drafts 1 to 3), `controller/` (logs, pid files), `ui-wow/` (the company walkthrough, WP6's private list of real terms), `bases/` (his tag video) | none | `ls` | Not in git on purpose |
| Worktrees | `~/repos/ai-peer-video-wp1`, `-wp3` (raw takes; the WP3 manifest the film reads today), `-wp2` (**do not clean**: music and raw takes outside git), `-wp6` (merged, clean), `-wp7` (live) | none | `git worktree list` | Not needed |

No wait of mine runs after this hand-off; they are stopped in the same step.

## Waits on Manish

No question is open. Next from him: his view of each blended video as it comes.

## Facts it relies on, quoted

- "First preference is to use Claude native capabilities. If that is not possible to fulfill
  the requirement, then we can use any tools that you think can do that." (V2)
- "for the budget cap, let's keep $100 for now, and afterwards we will see if we can extend it
  or not." (V3)
- "Wherever you need my choice, send it to me on telegram. I ll review there and reply here"
  (V11; C12: the files with captions to the Attention group, then one text line; the same in
  the session).
- "one worker at a time, on Opus 5.5" (V15; C13: every new session on Opus 5.5 at max effort,
  `--model "claude-opus-5-5[1m]"`; no helper without the controller's yes).
- "the voice and music, it's good. Let's keep them." (V16)
- "definitely I don't want him to come out of the sleeping Ram, because then it looks more like
  a ghost" (V19)
- "draft 3 looks good." (V21)
- "from the videos you sent me, I liked little peer" (V23)
- "So you will be giving me two final videos - one with tag and another with little peer."
  "So let's not lose any of our important artifacts while still continuing to explore and
  experiment with different ideas." (V24)
- "For now let's build from the video" (V26)
- **Privacy (C8).** The film's private renders and the company walkthrough hold real company
  content: never look at or send the renders; nothing from the walkthrough goes into git or to
  any outside tool, Telegram included. His tag video stays out of git and is sent nowhere (one
  line of it matches a real term); WP7's rebuilt version uses the film's made-up data.

## What cost context, so you can spare yours

- Three pictures (one overview, two sheets), the reading of STATE in full at the start, and
  long edit scripts.
- Look at one small picture per event; read STATE by the parts START-HERE names.
- Put edit scripts and commit messages in scratchpad files, quote every heredoc, and pass
  values through the environment.

## Successor launch

This script was run by ai-peer-video-controller-5 for you. A worker's successor is launched
the same way, with its own name and kickoff file, plus `export CLAUDE_NO_IDLE_PING=1`.

```
#!/bin/zsh
cd /Users/manishjain/repos/ai-peer-hackathon-2026 || exit 1
export ANTHROPIC_MODEL="claude-opus-5-5[1m]"
PROMPT="$(cat <kickoff file>)"
exec claude --model "claude-opus-5-5[1m]" --effort max --name ai-peer-video-controller-6 --remote-control ai-peer-video-controller-6 "$PROMPT"
```

Open it with `osascript`: `set prev to id of front window`, `do script "zsh <file>"`,
`delay 1`, `set index of window id prev to 1`. Find the new window with `mac-term.sh list`,
and its PID and transcript in `~/.claude/sessions/<pid>.json`.
