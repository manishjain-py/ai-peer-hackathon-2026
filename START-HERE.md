# Start here: carry the AI Peer hackathon work to any Mac

Written 2026-11-15 by ai-peer-video-controller-5 at Manish's request (`demo-video/docs/DESIGN.md`
V25: "if I just clone this repo on a different Mac at any point, then from there on, if I start
Claude on that Mac, it can reliably take over the ownership and understand everything about the
project and can continue with the next steps"), then fixed after a stranger's test of it. The
repo is the only memory. Everything a new session needs is here, except secrets and private
recordings, which stay out of git by rule.

## What is where

| Need | Read |
|---|---|
| Project rules for every agent | `AGENTS.md` (Claude Code loads it through `CLAUDE.md`) |
| The live work (November 2026): the 2-minute demo video | `demo-video/AGENTS.md`, then `demo-video/docs/STATE.md` (the tracker) |
| The last approved full demo video (16 November 2026) | `demo-video/film/renders/blended-tag-v2.mp4`: the Tag version (V30, V31; Little Peer is not used) |
| Latest complete movie for review (16 November 2026) | `demo-video/film/renders/blended-moss-v1.mp4`: Moss replaces Tag throughout the full 119.600-second film (V34), including the entire rebuilt walkthrough. Telegram copy `blended-moss-v1-720p.mp4`; delivery note `demo-video/docs/MOSS-FILM-DELIVERY-2026-11-16.md`. Tag v2 remains the last approved movie. |
| Preserved mascot exploration (16 November 2026) | `demo-video/mascot-exploration-v2/index.html`: 25 generated-art directions, individual in-demo previews and a 75-second quick-look, all delivered to Telegram (V33); `demo-video/docs/GENERATED-MASCOTS-DELIVERY-2026-11-16.md`. The first twelve code-native options remain in `demo-video/mascot-options/`. |
| The demo video's decisions and Manish's words | `demo-video/docs/DESIGN.md` section 0 |
| Briefs and hand-offs between sessions, dated, never edited | `demo-video/docs/handoffs/` |
| The product, the generic AI Peer | `docs/build/STATE.md`: its build closed on this repo on 7 November and goes on, from a hand-off package, on Manish's company Mac |
| The concept film (September) | `film/AGENTS.md` |
| How we work: the controller recipe, Manish's global rules, the shared lessons, helper skills, settings | `docs/ways-of-working/` (snapshots of 2026-11-15; its `README.md`) |

For the demo video, `demo-video/AGENTS.md` and `demo-video/docs/DESIGN.md` section 0 win over
the root `AGENTS.md`: one worker at a time (V15, C13), the 85% and 93% usage marks, hand-offs in
`demo-video/docs/handoffs/`.

## Checkpoints (git tags)

| Tag | What it pins |
|---|---|
| `draft-01` | Draft 1 of the demo video (PR 9): the film in code, the slates copy |
| `draft-02` | Draft 2 (PR 11): Ram, the quicker reveal |
| `draft-03` | Draft 3 (PR 12): the approved base (V21); the Peer comes out of Ram's phone |
| `wow-concepts-v1` | The five "wow" concepts for the product's screens (PR 13); Manish liked Little Peer (V23) |
| `blended-v1` | The two blended videos, Little Peer and Tag, version 1 (PR 14) |
| `blended-tag-v2` | The Tag blended video, version 2 (PR 15): his eight changes (V27, V28) and transition C (V29); approved on 16 November (V30): the final video (V31) |
| `mascot-options-v1` | Twelve mascot alternatives inside the same Tag film scenes (PR 16), delivered to Telegram on 16 November (V32); the approved full film is unchanged and the choice is pending |
| `generated-mascots-v1` | Round 2: 25 Gemini-generated directions, 23 fal.ai character animations, 25 in-demo previews and a 75-second quick-look (PR 17), delivered 16 November (V33); Moss selected for the V34 full-film trial |
| `blended-moss-v1` | Complete 119.600-second Moss film (PR 18, `2996671`): full source walkthrough and every mascot appearance/mark replaced, original audio/timing preserved; delivered for review on 16 November (V34) |

- Go back to one: `git worktree add ../ai-peer-at-draft-03 draft-03` (a separate folder;
  `main` stays as it is).
- Mark a new milestone: `git tag -a <name> <commit> -m "<what>"`, then `git push origin <name>`,
  and add a row here.
- Nothing is overwritten: a new version of a render or concept is a new file (`-v2`).

## Set up a new Mac (once, by Manish, or by a first plain session with him)

1. **Tools.** Claude Code; `git` with `git-lfs`; `gh`, signed in as `manishjain-py`; `ffmpeg`;
   Node 22 or newer and Google Chrome (the film's renderer, `demo-video/film/README.md`);
   `python3` and `uv` (every tool in `demo-video/tools/` runs with `uv run`); `jq` (the idle
   ping). In System Settings, Privacy & Security, Automation, let the terminal app that runs
   Claude control Terminal: the session scripts open and read Terminal windows.
2. **Clone** to the same place as on the 48 GB Mac:
   `git clone https://github.com/manishjain-py/ai-peer-hackathon-2026.git ~/repos/ai-peer-hackathon-2026`,
   then in it `git lfs install && git lfs pull`. The concept film's media is skipped by
   default: `git lfs pull --include="film/**" --exclude=""`.
3. **Claude Code settings.** Merge `docs/ways-of-working/settings-snippet.json` into
   `~/.claude/settings.json`: the bypass permission mode the sessions run in, cross-session
   messages accepted, and the notify skill's idle ping. A setting takes effect in sessions
   started after the change.
4. **Skills and rules.** Manish's Macs sync `~/claude-config` by themselves (skills, lessons,
   the global `CLAUDE.md`). On a Mac without it:
   - `mkdir -p ~/.claude/skills && cp -R docs/ways-of-working/skills/* ~/.claude/skills/`;
   - copy `docs/ways-of-working/manish-global-CLAUDE.md` to `~/.claude/CLAUDE.md` and change its
     line `@~/claude-config/lessons/INDEX.md` to
     `@~/repos/ai-peer-hackathon-2026/docs/ways-of-working/lessons/INDEX.md`;
   - read any lesson path `~/claude-config/lessons/X` as `docs/ways-of-working/lessons/X`; new
     lessons go there, committed.
5. **Secrets.** Never in git, chat or Telegram; copy them by hand from the 48 GB Mac.

   | Key | Where on the 48 GB Mac | Read by | Needed for the video |
   |---|---|---|---|
   | `TELEGRAM_BOT_TOKEN` | `~/.claude/channels/telegram/.env` | the notify scripts, `demo-video/tools/tg-send-file.sh` | yes |
   | `ELEVENLABS_API_KEY` | `~/.ai-peer/.env` | the narration lines (same voice, the plan, not billed per call) | for new lines |
   | `FAL_KEY` | exported in `~/.zshrc` | `demo-video/tools/falgen.py` (paid pictures and clips, under the $100 cap) | for paid shots only |
   | `STABILITY_API_KEY` | exported in `~/.zshrc` | nothing in the video now | no |
   | `GITHUB_TOKEN`, `SLACK_*`, `SLACK_AS_*`, `RECALL_*`, `ZOOM_TEST_MEETING_URL` | `~/.ai-peer/.env` | the product (`peer/`) | no |
   | Gemini and OpenAI keys | Learn Like Magic's own set-ups | nothing | no; ask Manish before any use |

6. **Private files** (never in git, rule C8), in `~/.ai-peer/demo-video-private/`:
   - Current work needs no private file: the tag is rebuilt by code in
     `demo-video/ui-concepts/tag/`. The tag video Manish made (`bases/tag-walkthrough-2026-11-15.mp4`)
     stays on the 48 GB Mac as the reference, out of git and sent nowhere.
   - The company walkthrough recording (`ui-wow/`) and the full renders with real recordings
     (`renders/`) never leave the 48 GB Mac. Public builds and every git artifact work without
     them.
   - Then `mkdir -p ~/.ai-peer/demo-video-private/controller` (the waits write their logs there).

## Take over as the controller

1. **One Mac at a time.** Before starting here, the old Mac's controller, workers and waits must
   stop: ask Manish to close them, or tell the old controller to hand off and stop. Git and
   Telegram are the only links between Macs; messages between sessions stay on one Mac.
2. **Launch.** Your name is `ai-peer-video-controller-<n+1>`, where `n` is the controller named
   in the first lines of `demo-video/docs/STATE.md`. From the clone:
   `claude --model "claude-opus-5-5[1m]" --effort max --name <name> --remote-control <name>`
   (Opus 5.5 at max effort, V15).
3. **Read only these parts,** on `origin/main`: STATE's first lines (they name the hand-off file
   to read next), the top three notes of "Where we are", the "Still running" table, the top note
   of "Needs Manish", the top note of "Next", and "Lessons". Then that hand-off file. STATE is
   long; the rest is history.
4. **A worker that was live on the old Mac.** It pushes at every step, so its work is on its
   branch on `origin`. Start its successor, `<name>-2`, from a new worktree of that branch
   (`git fetch origin`, then `git worktree add -b <branch> ~/repos/<worktree> origin/<branch>`),
   with a short dated hand-off file on `main` that says where it stood (its STATE line, its last
   commit) and names its brief. If its branch is not on `origin`, start from its brief alone.
5. **Waits.** Run each as a background command of your session, with the numbers filled in:

   ```
   cd ~/repos/ai-peer-hackathon-2026
   C=$HOME/.ai-peer/demo-video-private/controller
   # the week's usage passes N% (Fable's threshold 101 is out of reach)
   WAIT_PIDFILE=$C/usage.pid WAIT_LOG=$C/waits.log demo-video/tools/wait-for.sh usage 0 300 "$HOME/repos/ai-peer-hackathon-2026/demo-video/tools/usage-check.sh 101 N $C/usage.log" 'Demo video: the whole week of Claude usage passed N%.'
   # a worker silent for 25 minutes, or its process gone (PID and transcript id: ~/.claude/sessions/<pid>.json)
   WAIT_PIDFILE=$C/stall-W.pid WAIT_LOG=$C/waits.log demo-video/tools/wait-for.sh stall-W PID 60 'd=$HOME/.claude/projects/-Users-'"$USER"'-repos-ai-peer-hackathon-2026; s=TRANSCRIPT; ! find "$d/$s.jsonl" "$d/$s" -name "*.jsonl" -mmin -25 2>/dev/null | grep -q .' 'Demo video: WORKER has been silent for 25 minutes.'
   ```

   Stop a stall wait while its worker waits, idle, for Manish (else it raises a false alarm),
   and before closing the worker's window.
6. **Say who you are.** Your name, window and session link in STATE's first lines; one short line
   to Manish: who you are and what happens next.
7. Carry on from the top note of "Next".

## How we work, in short

The full recipe is `docs/ways-of-working/skills/big-initiative/SKILL.md`; this repo's
`AGENTS.md` and `demo-video/AGENTS.md` win where they differ.

- **One controller** is Manish's only point of contact. It plans, writes each worker's brief (a
  dated hand-off file), launches, watches and closes workers, and keeps STATE.md current. It
  writes no product code.
- **Workers.** One per work package, each with its own worktree, branch and PR; one worker at
  a time, on Opus 5.5 at max effort (V15); helpers only with the controller's yes.
- **Hand-off at 45 to 50% context,** measured from the session's transcript (a worker tells the
  controller at 40%). Finish the step, push, write a dated hand-off (never edited afterwards),
  start the successor, close the old session.
- **Usage.** Read `/usage` at every milestone. At 85% of the week workers stop at a clean step;
  at 93% all video work pauses and Manish is told on Telegram, so the work can move to
  another subscription or Mac. Never wait for the weekly reset.
- **Manish.** Every choice goes to the Telegram Attention group with its material (videos,
  pictures) plus one text line; he answers in the session. One question at a time, plain words,
  a recommendation first, a TLDR at the end of every reply. Routine calls are the controller's:
  take them, record them, tell him in one line.
- **His words** go into the repo at once, word for word, with the time: a dated brief or
  feedback file and a row in `DESIGN.md` section 0. Locked decisions change only by his words.
- **Privacy.** Real company content never goes into git or any outside tool (C8).
- **Money.** The demo video's cap is $100 (V3); each worker keeps a ledger in
  `demo-video/ledger/`.
- **Waiting** is done by shell scripts (`demo-video/tools/wait-for.sh`), never by polling from a
  session.

## Known limits on another Mac

- Fixed on 15 November (PR 14): `demo-video/film/shots.json` reads the repo's own
  `demo-video/shots/manifest.json`, so the film builds on a fresh Mac.
- Older docs and briefs name `/Users/manishjain/...` paths: on a Mac with another user name,
  read them as `$HOME/...`.

## Outside git on Manish's 48 GB Mac (2026-11-16)

| Where | What | Why it is not in git |
|---|---|---|
| `~/.ai-peer/demo-video-private/` | The full renders with real recordings, the company walkthrough, the tag video, caches (about 6 GB) | Private by rule, or rebuilt by code |
| `~/repos/ai-peer-video-wp2` (worktree) | Unused music takes, the Earth helper's raw files, render caches (about 19 GB) | Unused takes and caches; the final music is in git |
| `~/repos/ai-peer-video-wp3` (worktree) | About 84 unused raw takes of the AI shots (about 207 MB) | Unused takes; every final shot is in git |
