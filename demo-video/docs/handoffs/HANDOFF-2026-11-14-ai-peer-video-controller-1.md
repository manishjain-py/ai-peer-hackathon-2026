# Hand-off: ai-peer-video-controller-1 to ai-peer-video-controller-2, 2026-11-14 (time: see the commit)

Dated, never edited; the living state is `demo-video/docs/STATE.md` on `main`. Reason: the
controller's context reached 43% of 1M (the rule is to hand off at 45 to 50%).

- **Where it stands**: branch `main` of `manishjain-py/ai-peer-hackathon-2026`, checkout
  `/Users/manishjain/repos/ai-peer-hackathon-2026` on Mac 48 GB; no PR of the controller's own.
  Done and proven: the interview (decisions V1 to V10 in `DESIGN.md` section 0), the tools
  research (`demo-video/research/`), the story (`STORY.md`, approved by Manish for a first
  draft), the plan (`PLAN.md`), two workers launched and seen working. Not proven yet: any
  video. WP1's clone tests were still running at the hand-off.
- **Next step, exactly** (also `STATE.md` "Next"):
  1. Start a background wait for WP1's end: it ends when
     `/Users/manishjain/repos/ai-peer-video-wp1/demo-video/look/REPORT.md` and
     `/Users/manishjain/repos/ai-peer-video-wp1/demo-video/look/hero-tests/hero-compare.mp4`
     both exist, or when PID 41753 is gone. Then read the report, look at the clip by frames
     (pull them with ffmpeg; downscale before reading), send the clip to Manish with
     `SendUserFile`, write WP3's brief (`PLAN.md` row WP3; copy the shape of
     `HANDOFF-2026-11-14-ai-peer-video-wp1.md`; the nine shots are listed in `STORY.md` under
     "What it costs"), close WP1's window by the checks in the big-initiative skill's
     `references/sessions.md`, and start `ai-peer-video-wp3` the same way WP2 was started (a
     launch script, `osascript` `do script`, then put the front window back).
  2. Start a background wait for WP2's first milestone:
     `/Users/manishjain/repos/ai-peer-video-wp2/demo-video/film/audio/samples/` holding three
     audio files. Send them to Manish and ask which voice he wants (his ear decides).
  3. When WP2 reports Draft 1: look at a frame at every cut, then send
     `~/.ai-peer/demo-video-private/renders/draft-01.mp4` to Manish with `SendUserFile` (it holds
     only demo-data stand-ins, which C8 allows in a preview for him; it never goes to git).
  4. Sum `demo-video/ledger/*.csv` on the workers' branches into `STATE.md` "Money spent" at each
     package's end. Tell Manish at $50 and at $80. WP1's ledger stood at $5.03 at 11:25 UTC.
- **Still running or kept**:

  | What | Where | PID or port | How to check it | How to re-create it |
  |---|---|---|---|---|
  | `ai-peer-video-wp1` (WP1, cap $15) | Terminal window 3962; worktree `~/repos/ai-peer-video-wp1`, branch `video-wp1-look-test`; https://claude.ai/code/session_01Nfn5h7gC1ucD3V5X1FSeSk | 41753 | `~/.claude/skills/mac-terminal-control/scripts/mac-term.sh read 3962` | A fresh session from its brief, `handoffs/HANDOFF-2026-11-14-ai-peer-video-wp1.md` |
  | `ai-peer-video-wp2` (WP2, cap $10, started with `CLAUDE_NO_IDLE_PING=1`) | Terminal window 3963; worktree `~/repos/ai-peer-video-wp2`, branch `video-wp2-film-build`; its session link is on its window's first lines | 48241 | `mac-term.sh read 3963` | A fresh session from `handoffs/HANDOFF-2026-11-14-ai-peer-video-wp2.md` |
  | ai-peer-video-controller-1 (the old controller) | Terminal window 2952, started in the Learn Like Magic folder; other sessions message it as `learnlikemagic-f7` | 38022 | `mac-term.sh read 2952` | Not needed. It has one helper still running (a second-by-second watch of the September film) and will save that as `demo-video/docs/DRAFT07-WATCH.md` on `main`. After that file is pushed it has nothing left; Manish opened that window himself, so ask him before closing it. |
  | The private folder | `~/.ai-peer/demo-video-private/` (empty until Manish brings recordings; WP2 writes stand-ins and renders there) | none | `ls` | `mkdir -p` |

- **Waits on Manish**: nothing blocks the build. He was asked on 14 November to bring the
  recordings listed in `PLAN.md` by Tuesday 17 November morning (India time). He will be asked
  to pick a voice, to look at the clone clip, and to watch Draft 1.
- **Facts it relies on, quoted**:
  - "First preference is to use Claude native capabilities. If that is not possible to fulfill
    the requirement, then we can use any tools that you think can do that." (V2)
  - "for the budget cap, let's keep $100 for now, and afterwards we will see if we can extend it
    or not." (V3)
  - "Sure. Let's go ahead with this story for the first draft and create the video and show it
    to me how it comes out end to end." (V10)
  - Real company recordings: his answer "B" to "real Airbnb content, on this Mac only ... out
    of GitHub, never sent to an outside tool, polished by code only" (V8, applied by C8).
  - The employee is invented, character A (V4, V7). No student or magic-school opening (V9).
    The video is the whole entry and judges watch it alone (V5). No written rules (V6). Due
    Thursday 19 November (V1).
  - Asks go to him one at a time, in plain words, with a recommendation; while a worker is
    live, ask in a plain reply, not with the question dialog. A question for him also goes to
    the Attention group: `bash ~/.claude/skills/notify/scripts/tg-attention.sh "..."`.
  - Workers were told the live controller is named in `STATE.md`: put your own name, window and
    session link in its first lines at once, and message each worker your name.
  - Keys on this Mac, checked on 14 November with free calls: `FAL_KEY` (shell environment,
    valid, balance unreadable), `ELEVENLABS_API_KEY` in `~/.ai-peer/.env` (valid, about 97% of
    the quota free). The Gemini and OpenAI keys belong to Learn Like Magic set-ups: ask Manish
    before spending on them. fal.ai's own list and prices: `research/fal-catalogue-2026-11-14.md`;
    the live calls are `GET https://api.fal.ai/v1/models?category=<c>&limit=100` and
    `GET https://api.fal.ai/v1/models/pricing?endpoint_id=<id>`, header
    `Authorization: Key $FAL_KEY`.
  - This Mac's ffmpeg has no `drawtext` filter.
  - Claude usage was 0% of the week at 10:10 UTC on 14 November; the week resets 17 November,
    04:30 India time. Read it with `claude -p "/usage" --output-format text`.
- **Successor launch**: see the launch script below; it was run by controller-1.

  ```
  cd /Users/manishjain/repos/ai-peer-hackathon-2026 && ANTHROPIC_MODEL="claude-fable-5-2" \
    claude --model "claude-fable-5-2" --effort max --name ai-peer-video-controller-2 \
    --remote-control ai-peer-video-controller-2 "You are ai-peer-video-controller-2, taking over from ai-peer-video-controller-1. Read demo-video/docs/STATE.md on origin/main, then demo-video/docs/handoffs/HANDOFF-2026-11-14-ai-peer-video-controller-1.md, and work by the big-initiative skill (this repo's AGENTS.md and demo-video/AGENTS.md win where they differ). Check that every session, run and watcher they name is alive, put your name in STATE.md, tell each live worker your name, start the waits, then carry on from Next."
  ```
