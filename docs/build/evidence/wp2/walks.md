# WP2 walks (F1 to F7)

By `ai-peer-wp2-1`, 2026-11-05 (UTC). Before WP1's merge every walk runs on a **test owner**
(`wp2test`: Manish with one repo, `peer/world/profiles/test-small.json`, summaries at effort
high), the page on port 8788, screenshots from a throwaway headless browser (never the Peer's own
profile), and Slack walks as dry runs (fake Slack, the real brain on Claude Opus at effort high,
real GitHub, real memory files). The live Peer on owner `manish` was never touched. Transcripts:
`walks/`. Scripts: `scripts/`.

| Walk | PRD "Done when" | Result |
|---|---|---|
| F1 | From an empty owner folder, one click builds the memory in a few minutes, progress visible | **Pass**: 54 s from the click to "Your Peer is ready" |
| F2 | A correction on the page changes the memory file and the next answer uses it | **Pass** |
| F3 | Turning a role off stops that behaviour in the next walk | **Pass** |
| F4 | Every scene's actions appear with sources | **Pass** (see the activity screenshot) |
| F5 | After "stop telling me about CI failures on drafts", the next such event is not pushed | **Pass in a dry run**; the live DM walk waits for the merge |
| F6 | A tracker change in an LLM repo shows up in the Peer's next answer | **Pass** (a real commit from today) |
| F7 | "What is Manish working on?" mentions today's unpushed branch | see F7 below |

## F1 one-click setup (11:05 to 11:06)

`~/.ai-peer/wp2test/` held only `settings.yaml`. The walk script opened `/setup` (the company
directory profile with "Create my AI Peer", `f1-1-profile.png`) and clicked the button. Progress
(the page polls `/api/setup/progress` every second):

```
[  2.5s] clicked Create my AI Peer
[  4.5s] profile:done team:done github:running ...
[ 18.1s] ... github:done projects:running ...        (the brain reads 3 trackers)
[ 47.8s] ... projects:done slack:running ...
[ 53.8s] ... slack:done people:done docs:not_connected calendar:not_connected finish:done
[ 53.8s] state done
```

Memory: `me.md`, 6 service and repo notes, 3 projects with an AI status in brief, 7 Slack channel
notes (only the owner and the five test colleagues recorded, never other members), 5 people, the
index. Docs and calendar show "not connected yet" until WP3's `google` adapter registers its step.
Screenshots: `f1-2-learning-*.png` (live steps and "Your Peer is learning"), `f1-3-ready.png`,
`f1-4-learned.png`. Activity log: one `setup` entry with each step's result.

## F2 correction (11:07)

Lakshmi asks in #schools (dry run) "who is driving the Telugu work day to day?":

- Before: "*Manish is driving the Telugu work day to day.* Manish makes the decisions and approv…"
- On the page, the Telugu card's "Driver" fact, ✎ Correct, typed "Ananya Rao (Content Lead) drives
  the Telugu work day to day; Manish makes the decisions and approves merges", Save
  (`f2-1-before.png`, `f2-2-editing.png`, `f2-3-after.png`). `projects/telugu.md` now has the line
  with "(corrected by Manish on 2026-11-05)", a `corrections:` entry in its front matter and a
  "Corrections from the owner" section; the activity log has `owner_correction` with was/now.
- After, same question: "*Ananya Rao (Content Lead) drives the Telugu work day to day.* Manish
  makes the decis…"

Corrections survive rewrites: discovery and the freshness pass re-apply them (`Memory.write_note`).

## F3 roles (11:08)

Owner away, Lakshmi asks in #schools "Is Telugu going to be on the iPhone app too?" (dry run):

| Switch (flipped on `/settings` by the walk script) | What the Peer did |
|---|---|
| all on | 👀 reaction, answered in the thread as the labelled Peer, "While you were away" DM |
| Stand in when I'm away: **off** (`f3-1-stand-in-off.png`) | no thread reply; a draft DM to the owner with Send / Edit / Skip |
| Watch my work: **off** (`f3-2-watch-off.png`) | nothing at all |

Each flip is a `settings_changed` entry in the activity log, and `rules.md` gets a "Scope you
set" section (role on/off plus the owner's plain-English scope) that every brain run reads.

## F5 self-tuning (11:09, dry run)

```
GitHub event: CI failed on telugu-wp2b in learnlikemagic (draft PR, walk sample) -> told
  Peer DM: "Heads-up · CI failed on telugu-wp2b ... Reply *less of this* (or react :no_bell:) and I'll tune it."
owner DMs the Peer: "stop telling me about CI failures on drafts"
  Peer reply (3.5 s): "Got it: I won't tell you about CI failures on draft PRs any more. Say *undo* to reverse it."
GitHub event: CI failed on telugu-wp2c ... (draft PR, walk sample) -> held_back
  rule: "Don't tell me about CI failures on draft pull requests; they can wait for the brief."
GitHub event: CI failed on main in learnlikemagic (walk sample) -> told
```

`rules.md` gained "## From your feedback" with the rule, the owner's words, date and id;
`tuning.json` holds the filter `{source: github, kind: ci, conclusion: failure, draft: true}`,
checked by plain code before every push (no AI per event). The GitHub events were samples
injected into the dry run; the live poller (`peer/jobs.py`) builds the same items from real CI
runs. Still to walk after the merge: the same sentence typed in Manish's real DM on the live Peer,
and a 🔕 reaction (needs the `reaction_added` bot event in the Slack app).

## F6 fresh memory (11:10 to 11:12)

A real tracker change from today: `docs/feature-development/teacher-feedback-qa/STATE.md`, commit
3a05116 (09:28 UTC) to 03f3535 (10:15 UTC). `peer refresh --rewind teacher-feedback-qa` put the
memory back at 3a05116 (as if built before the change). Rohan asks in #engineering (dry run)
"where is it right now, and did the latest full quality gate pass?":

- One commit behind: "On the gate: *P6's final full quality gate hasn't run yet.* …"
- `peer refresh` (what the Peer's 15-minute poll runs): the newer commit found, the tracker
  re-copied, the status in brief re-written; activity `memory_updated` with the tracker and
  commit 03f3535 as sources.
- Next answer: "*Gate: yes, the latest full gate passed.* `make quality-full` passed on P6's head
  `a406689a1` (score 88.13). … Earlier today I said the gate hadn't run yet. That was based on an
  older version of the tracker."

The nightly pass (`peer refresh --nightly`, and inside the Peer at `memory.nightly_at`) re-reads
the profile, every repo note and every tracker.

## F7 local work

Spike (11:12): Claude Code 2.1.318 fires a `SessionEnd` hook given per run with `--settings`
(nothing global changed): the record landed in `~/.ai-peer/spool/session-end/` with
`session_id`, `transcript_path`, `cwd`, `hook_event_name: SessionEnd`, `reason`; the run took 3 s.

Codex 0.153.4 has a `SessionEnd` hook event (`hooks.json`, `[features].hooks`), but in `codex exec`
none of five variants fired it: `-c hooks.SessionEnd=...` with and without `bypass_hook_trust`
and `features.hooks`, and a `hooks.json` in a private `CODEX_HOME`. Exec may not run session
hooks; Manish's interactive Codex already runs his `~/.codex/hooks.json` hooks. (A `codex exec`
in a fresh `CODEX_HOME` hangs unless stdin is `/dev/null`.)

Walk (11:14 to 11:16), test owner's chosen folder `~/repos/ai-peer-wp2` only (this worktree; the
scan of `~/repos` waits for Manish's word). A headless Claude Code session ended inside the
worktree (the hook given with `--settings`), and a local commit was made and not pushed. `peer
local scan` wrote `local/ai-peer-hackathon-2026.md` (`walks/f7-local-note.md`): branch
`wp2-setup-memory`, 1 unpushed commit with its subject, the Claude Code session that ended at
16:44 IST. Kabir asks in #product (dry run) "What is Manish working on today?":

> … • Local work: 1 unpushed commit on branch `wp2-setup-memory` in the ai-peer-hackathon-2026
> repo ("wp2: walks F1, F2, F3, F5 (dry run), F6 pass…"). That coding session ended at 4:44 PM.

The answer also lists the Telugu and Teacher Feedback QA work from the trackers, with sources.
**Pass** for the hook path and the scan. Not yet live: the hook in Manish's global Claude Code
and Codex settings (his OK first), and the hourly scan of the folders he chooses.

## F4 activity log (11:16)

`f4-1-activity.png` (the test owner's own log: setup, the correction, setting changes, memory
updates, local work) and `f4-2-activity-walks.png` (`/activity?dry=1`, the dry-run walks' log):
"Needs your review" first (an open draft and answers that flag something for Manish), then the
history with filters; every entry has who asked, the question, what the Peer said or did, its
sources with dates and the outcome.
