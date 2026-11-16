# Hand-off: ai-peer-video-controller-6 to ai-peer-video-controller-7, 2026-11-16 (time: see the commit)

Dated, never edited; the living state is `demo-video/docs/STATE.md` on `main`.

**Why now.** Manish at 12:15 UTC on 16 November: "Yes, please do the handoff note, hand off to a
new session and close yourself too." The work is at a stop: the final video is approved, in git
and pushed, and nothing runs. Controller-6's context is 32%.

## Where it stands

- **The checkout.** Branch `main` of `manishjain-py/ai-peer-hackathon-2026` (private, on GitHub),
  at `/Users/manishjain/repos/ai-peer-hackathon-2026` on Mac 48 GB. No PR is open; no branch of
  this work is left on `origin`.
- **The final video (V30, V31).** `demo-video/film/renders/blended-tag-v2.mp4` (Git LFS, checked
  stored on GitHub; 119.6 s, 1920x1080, -14.1 LUFS; PR 15, `f6c21b4`, tag `blended-tag-v2`): the
  Tag version, with his eight changes (V27, V28) and transition C (V29). Little Peer is not used
  (V31). A 720p copy for sending (about 16 MB): `ffmpeg -i <file> -vf scale=1280:-2 -c:v libx264
  -crf 23 -pix_fmt yuv420p -c:a aac -b:a 160k -movflags +faststart <out>`.
- **Checkpoints (git tags).** `draft-01`, `draft-02`, `draft-03`, `wow-concepts-v1`, `blended-v1`
  (both blends' version 1, PR 14), `blended-tag-v2` (the final video, PR 15).
- **His words of 15 and 16 November,** word for word in `demo-video/docs/`:
  `FEEDBACK-BLENDED-2026-11-15.md` (V27), `FEEDBACK-BLENDED-TAG-2026-11-15.md` (V28),
  `FEEDBACK-TAG-TRANSITION-2026-11-15.md` (V29), `FEEDBACK-TAG-V2-2026-11-16.md` (V30),
  `FEEDBACK-FINAL-CHOICE-2026-11-16.md` (V31).
- **Money.** $42.08 of the $100 cap (V3), by STATE's "Money spent" (the ledger rows in
  `demo-video/ledger/*.csv` sum to $42.06; the 2 cents are rounding).
- **Usage.** The week (all models) was 81% at 12:16 UTC on 16 November (Fable 66%); it resets on
  Monday 16 November at 22:59 UTC. Workers stop at 85%; all video work pauses at 93%.
- **Sessions.** Closed in controller-6's time: ai-peer-video-controller-5 (16:58 UTC, 15 November),
  ai-peer-video-wp7 (17:43 UTC), ai-peer-video-wp7-2 (18:47 UTC), ai-peer-video-wp7-3 (02:31 UTC,
  16 November), and the first controller's window 2952 (12:03 UTC, 16 November, on his question).
  ai-peer-video-controller-6 (Terminal window 5591, PID 79572) launches you, then closes its own
  window about a minute after its last message.

## Next step, exactly

1. **Take over.** Your name, window and link in STATE.md's first lines, in place of the hand-off
   sentence. Check that controller-6 is gone: `ps -p 79572`. If it still runs, read its screen
   (`~/.claude/skills/mac-terminal-control/scripts/mac-term.sh read 5591`) and, once it is idle,
   close it (`mac-term.sh close 5591`).
2. **Greet Manish** in one short reply, as the last message of your first turn: who you are, that
   no question is open, and that nothing runs until his next word.
3. **Then wait for his word.** Nothing is pending. For new video work: one fresh worker on Opus
   5.5 at max effort, its own worktree from `origin/main`, a dated brief in
   `demo-video/docs/handoffs/`, its stall wait and the usage wait (`START-HERE.md`, "Take over as
   the controller", step 5; the launch script below). Before anything goes to Manish: one small
   sheet; `demo-video/tools/privacy-check.sh <head> <base>` (expect 0 and 0); a 720p copy;
   `demo-video/tools/tg-send-file.sh video <file> "<caption>"` to the Attention group, then one
   text line by `~/.claude/skills/notify/scripts/tg-attention.sh`, and the same file in the session
   (`SendUserFile`). Record his words at once: a feedback file and the next V row (V32).

## Still running or kept

| What | Where | How to check |
|---|---|---|
| Nothing runs: no wait, render or helper | | `ps -axo command \| grep wait-for.sh` |
| The private folder (never in git, C8) | `~/.ai-peer/demo-video-private/`: full renders with real recordings, the company walkthrough and its private list of real terms, his tag video, caches, the controller's logs | `ls` |
| Worktrees | `~/repos/ai-peer-video-wp1`; `-wp2` (unused music and raw takes outside git: do not clean); `-wp3` (84 unused raw takes outside git); `-wp6` (merged); `-wp7` (detached at `f6c21b4`, clean) | `git worktree list` |

## Waits on Manish

No question is open. Little Peer is not used (V31).

## Facts it relies on, quoted

- "First preference is to use Claude native capabilities. If that is not possible to fulfill the
  requirement, then we can use any tools that you think can do that." (V2)
- "for the budget cap, let's keep $100 for now, and afterwards we will see if we can extend it or
  not." (V3)
- "Wherever you need my choice, send it to me on telegram. I ll review there and reply here" (V11)
- "one worker at a time, on Opus 5.5" (V15)
- "definitely I don't want him to come out of the sleeping Ram, because then it looks more like a
  ghost" (V19)
- "So let's not lose any of our important artifacts while still continuing to explore and
  experiment with different ideas." (V24)
- "Yeah, looks very good. Let's commit and push all the changes." (V30, of the Tag's version 2)
- "And also, one decision that I made was that we are not going with the little peer version, we
  will go with the tag version." (V31)
- **Privacy (C8).** Never look at or send the film's private renders; nothing from the company
  walkthrough goes into git or to any outside tool; his tag video stays out of git and is sent
  nowhere. The rebuilt tag in git uses made-up data and made-up labels only.

## What cost context

Five pictures (one 16-frame sheet per delivery) and the read-in; edit scripts in scratchpad files
kept the rest small. Read STATE by its parts; look at one small sheet per event.

## Launch script (a worker; a controller drops `CLAUDE_NO_IDLE_PING`)

```
#!/bin/zsh
cd /Users/manishjain/repos/ai-peer-hackathon-2026 || exit 1
export ANTHROPIC_MODEL="claude-opus-5-5[1m]"
export CLAUDE_NO_IDLE_PING=1
PROMPT="$(cat <kickoff file>)"
exec claude --model "claude-opus-5-5[1m]" --effort max --name <name> --remote-control <name> "$PROMPT"
```

Open it with `osascript`: `set prev to id of front window`, `do script "zsh <file>"`, `delay 1`,
`set index of window id prev to 1`. Find the new window with `mac-term.sh list`, and its PID and
transcript in `~/.claude/sessions/<pid>.json`.
