---
name: two_machine_claude_sync
description: "How the machines keep Claude config, memory and skills in sync through ~/claude-config; how the sync gets stuck (4 times so far, last 2026-08-24 to 10-01), the repair recipe, and the 10-01 hardening (union merge for memory, a Telegram alert when stuck)"
metadata: 
  node_type: memory
  type: project
  originSessionId: 49501f31-485e-41f8-a0da-3dafd7c3b651
---

> **Now THREE machines, not two** (2026-07-23): a native-Windows laptop joined. The architecture below is unchanged and still correct; Windows differs only in using junctions instead of symlinks. See [[three_machine_setup]] and [[windows_machine_setup]]. The hooks were hardened the same day for 3-way conflicts (see the bottom of this file).

Two Claude Max accounts, one per Mac, run CONCURRENTLY (machine A = burn/background jobs, machine B = interactive) to beat usage limits. Set up 2026-07-01.

**Full operational runbook: `~/claude-config/RUNBOOK.md`** (versioned, auto-syncs) — problem, architecture, first-time setup, regular-sync ops, verification, troubleshooting. Point any Claude at it to bring a machine into sync.

**Config sync — `~/claude-config`** (private GitHub `manishjain-py/claude-config`):
- Holds user-level Claude state that isn't in the app repo: global `CLAUDE.md`, `settings.json`, user `commands/`, user `skills/`, and the `memory/` dir.
- These live in the repo; the real `~/.claude` paths are **symlinks** into it (`~/.claude/CLAUDE.md`, `settings.json`, `commands`, `skills`, and `.../memory`).
- Auto-syncs via two hooks in `settings.json`: **SessionStart → `hooks/pull.sh`** (heal de-linked file symlinks + `git pull --rebase --autostash`); **Stop → `hooks/push.sh`** (commit locally, push in background, fast-exit when unchanged). `sync-now.sh` = manual fallback.
- Project-level Claude state (custom commands, skills, **workflows**, `.mcp.json`) is NOT here — already travels in the app repo's `.claude/` via git.
- New machine: `git clone … ~/claude-config && bash ~/claude-config/install.sh` (creates the symlinks, backs up originals).

**Secrets — `~/claude-secrets`** (local only, NEVER committed/pushed; dir 700, files 600):
- All API keys/tokens/creds that must NOT go to GitHub: image-gen `.env`, telegram token+`access.json`, codex `auth.json`/`config.toml`, app repo `.env`s (`llm-backend/.env` = OpenAI/Anthropic/Gemini/Google-TTS/ElevenLabs/DATABASE_URL/Cognito/CCAPI; root/frontend/e2e), `~/.aws/`.
- `apply.sh` drops each into its correct path on machine 2 (run AFTER `install.sh`). `pack.sh`/`unpack.sh` = AES-256 encrypted single-file transfer. Re-run when a key rotates.
- In `~/claude-config/.gitignore`: `**/.env`, `memory/.telegram_*_offset`, keys — so secrets in the working tree never get pushed.

**Two disciplines that must hold on both Macs:**
1. Same macOS username (`manishjain`) + same absolute paths (`~/claude-config`, app repo at `~/repos/learnlikemagic`) — the memory dir name is derived from the app repo's absolute path.
2. Commit/push app-repo WIP before switching machines — uncommitted work doesn't travel (that's git, not this kit).

**NOT synced (per machine, on purpose):** Claude Code login (macOS Keychain — log into the other account with `/login`); launchd scheduled jobs ([[scheduled_docs_update_job]], competitive-intel, research-agent) must run on ONE machine only or you get double commits/emails (currently paused per [[agents_paused_quota_2026_06_29]]).

**HOOKS HARDENED 2026-07-23** (because a 3rd machine makes conflicts likelier). `pull.sh` now aborts a stale rebase before starting, and if it finds a detached HEAD it parks those commits on a `rescue-<host>-<timestamp>` branch and returns to `main` instead of losing them. `push.sh` refuses to commit while mid-rebase, with unmerged paths, or with conflict markers in the tree. Both append to `~/claude-config/.sync.log` (git-ignored) — **read that log first when sync looks wrong**. A `rescue-*` branch means real work from some machine: merge it, never delete it. Both guards were negative-tested on ManishMacMain.

**⚠ IT RECURRED — 8-day divergence, fixed 2026-08-14.** Air had 16 unpushed sync
commits, MacMain had pushed 21; merge-base was 2026-08-06. **The 07-23 hardening
made the hook fail SAFELY but never RECOVER:** `pull.sh` line 63 runs `git pull
--rebase --autostash`, and on conflict it aborts and logs "pull failed - retry
next session" — then retries the *same doomed rebase* every session forever.
Nothing escalates, so the only symptom is a quiet line in `.sync.log`. It needs a
human `git merge origin/main` to clear (rebase can never resolve it, because each
side's sync commits legitimately touch the same index). A one-off
"could not fetch ... from promisor remote / repo corruption" error also appeared —
that was transient (the repo is a `blob:none` partial clone); a plain `git fetch`
succeeded afterwards and `fsck --connectivity-only` was clean. **Recovery that
worked: back up `memory/` first, `git merge origin/main`, resolve the 3 conflicts
(MEMORY.md + whichever topic files both machines touched) as a per-entry union
newest-wins, then verify no markers / no dupe links / no missing link targets /
no orphan files / file count only GREW (190 → 205), then push.** Durable fix, not
yet applied: make `pull.sh` fall back to `git merge origin/main` when the rebase
fails, or drop `--rebase` for this repo entirely. Ask Manish before changing it.

**IT RECURRED AGAIN THE NEXT DAY — 2026-08-15, 3rd occurrence.** Divergence was
tiny (2 local commits vs 1 from the Air, disjoint topic files, 1 conflict hunk in
MEMORY.md where both machines appended under the same heading) — proof that
**size doesn't matter: ANY concurrent-day sync deadlocks the rebase**, and it
self-heals never. Recovery took 5 minutes and was exactly the 08-14 recipe
(back up `memory/` → `git merge origin/main` → union the hunk → verify markers /
missing link targets / dupe links / count only grew, 207 → 210 → push). Expect it
on every day two machines both write memory. ~~The durable `pull.sh` fix is now
overdue.~~ **DECLINED by Manish 2026-08-19 — do NOT re-pitch it.** He was offered
all three (merge fallback / drop `--rebase` / Telegram alarm on failure) and
chose to leave the hooks alone. So this deadlock is **accepted, recurring
maintenance**: when sync looks stale, read `.sync.log`, then hand-recover with
the recipe below. Just fix it and move on — don't reopen the design.

**4th occurrence — 2026-08-15 → 08-19, the WORST yet (recovered 08-19 on the
Air).** The same rebase (`b292d4f`, an Air sync commit) failed identically on
**every session for 4 days**; `.sync.log` shows the same 6-line error repeating
and nothing else. Divergence reached **20 local vs 33 origin commits** before a
human looked. Confirms the 08-15 reading: it never self-heals, and nobody
notices, because the only symptom is one quiet log line — the session still
starts fine. Recovery was again the 08-14 recipe, ~15 min, and this time the
union was NOT mechanical: **both machines had independently re-compacted the
whole index**, so nearly every line differed in wording while meaning the same
thing, and 3 entries had genuinely conflicting *content*. Two traps worth
repeating: (1) **a blind union keeps stale decisions** — the Air still said Demo
Moon was "THROWAWAY, delete overdue" while MacMain had recorded Manish's 08-18
"keep it permanently"; always diff a contested line against its TOPIC FILE,
which auto-merges and is therefore authoritative; (2) **"missing from the other
side" ≠ "lost"** — 12 of 20 Air-only pointers had been deliberately moved to
`archive_index.md` by MacMain, so check the archive before re-adding. Verify by
proving *reachability*, not line count: every pre-merge link must resolve from
MEMORY.md **or** archive_index.md (241 files / 241 reachable here).

**KNOWN FAILURE — stuck rebase → 2-day divergence (hit + recovered 2026-07-18):** `pull.sh`'s `git pull --rebase --autostash` can STALL (a replayed local commit goes empty/conflicts) and leave a half-finished rebase. `main` then FREEZES at the pre-rebase SHA while every later session's `push.sh` commits onto the **detached HEAD**, building a hidden "bubble" line. Meanwhile the OTHER machine keeps pushing to origin. Result: both machines diverge for days, neither pulling the other. **Detect:** in `~/claude-config`, `git status` says "rebasing"/"editing a commit", `git branch --show-current` is empty, `main` is far "behind N". **Recover (memory is additive — UNION, never reset-away a side):** (1) back up `memory/` + `settings.json` to scratch FIRST; (2) `git rebase --abort`; (3) find each machine's real head — this machine's is the detached bubble tip from `git reflog`, not the frozen `main`; (4) `git merge` the two heads; only `MEMORY.md` (the index) conflicts — resolve as a per-entry union, **newest-wins** (whichever machine did the work has the fresher line; take origin for its topics, HEAD for yours); topic files auto-merge fine; (5) verify no leaked conflict markers, no orphan/dup index links, take-origin topic FILES carry newest content; (6) point `main` at the merge, confirm `origin/main` is its ancestor (FF push), push. ⚠ `settings.json` **`model`** flip-flops (this Mac wants `opus[1m]`, mac8gb wants `claude-fable-5`) — each sync clobbers the other; genuinely per-machine, so it keeps fighting. Kept opus[1m] here; real fix = un-sync `model` (per-machine override) — ask Manish.

**GitHub push credential is per-machine too.** On the mac8gb Mac the stored HTTPS token was **read-only** — clone/fetch/pull worked but every `git push` 403'd ("Write access to repository not granted"), so this Mac's config commits silently never reached origin (all pushed history was from ManishMacMain). No SSH key here either. Fix (2026-07-02): `gh auth login` (device flow, browser) → token with `repo` scope → `gh auth setup-git` (sets github.com to use `gh auth git-credential`, overriding the read-only osxkeychain entry) → push worked. This also repairs **app-repo** (`~/repos/learnlikemagic`) pushes, same credential. Re-check on any new/re-imaged machine.

**5th occurrence — 10-day divergence, recovered 2026-08-31 on the Air.** Split at
`a3bd594` (08-20); **23 local vs 57 origin** commits, the same rebase failing every
session, same single quiet `.sync.log` line. Confirms it again: the hook never
recovers, and *nobody notices*, because the only visible symptom is the SessionStart
line "CONFLICT (content): Merge conflict in memory/MEMORY.md" scrolling past. Manish's
08-19 decision stands — accepted recurring maintenance, don't re-pitch the fix.

**The recovery got much faster (~10 min) with two moves worth reusing:**
1. **Prove disjointness BEFORE resolving anything.** `git diff --name-status $(git
   merge-base HEAD origin/main) HEAD` vs the same against `origin/main` showed only
   **MEMORY.md and settings.json** changed on both sides — every topic file was
   disjoint (16 new here, 17 new there). settings.json turned out identical on both
   (same `model: opus[1m]` blob), so the whole recovery collapsed to one file. This
   one command tells you up front whether you face a 1-file or an n-file merge.
2. **Resolve the index by MEASURING coverage, not by reading hunks.** Both machines
   had independently re-compacted the whole index again (theirs 99 lines, ours 169),
   so hunk-level union is hopeless. Instead: regex every `(name.md)` out of base/ours/
   theirs, diff those sets against the actual `memory/*.md` on disk, and the answer
   falls out — theirs lacked exactly our 16 new files, ours lacked exactly their 17,
   neither had dead links. Resolution = **take the newer compacted side wholesale,
   fold in the other side's N missing pointers**, then re-run the same measurement as
   the proof: 224/280 indexed (56 archived), 0 entries lost from either side, 0 dead
   links. Cheap, mechanical, and it *proves* nothing was dropped.

⚠ Still hand-work in step 2: a few lines carry conflicting FACTS, and the newer
*file* wins over the newer *index line*. Here the Air's g3-EVS entry knew ch2 shipped
08-26 (after their last commit) while MacMain's index still said only "ch1 practice
gate HELD"; conversely MacMain's launchd entry ("all 7 disabled, **verified 08-23**,
hourly-fire warning RESOLVED") correctly superseded the Air's stale ⚠. Diff every
contested line against its topic file, which auto-merged and is authoritative.

**Bonus: the merge fixed a silent truncation.** The Air's index had grown to 26,021
chars against a ~24,986 limit, so sessions were loading a *partial* MEMORY.md with a
size warning. The merged union lands at 23,674 — under the limit, fully loading again.

**4th and longest occurrence — stuck 2026-08-24 to 2026-10-01 on ManishMacMain, repaired 10-01 on
Manish's word ("please fix it").** This time the autostash pop conflicted in `MEMORY.md` and left
`UU memory/MEMORY.md` in the index, so every push was skipped ("unmerged paths") and every pull
refused: five weeks, 839 new files and 27 edits unsynced here, 57 commits from the other machines
unread. Found only because a new skill script would not have synced.

Repair that kept everything and never put a conflict marker in the live tree (so `settings.json`,
a symlink target, stayed valid throughout):
1. `tar czf ~/claude-config-backup-<date>.tgz claude-config`.
2. In the live repo: `git add -A && git commit` (this alone clears the unmerged state).
3. In a scratch clone of it: `git merge` the fetched `origin/main`, resolve there (index = this
   Mac's + a pointer per note the others added; notes edited on both sides keep both; `settings.json`
   differed only in the default `model`, newest wins; `skills/synced` per account bucket, the side
   with the newer `manifest.json`), commit.
4. Live repo: `git fetch <scratch> main && git merge --ff-only FETCH_HEAD && git push`.

**Durable changes made the same day (in the repo, so they reach every machine):**
- `.gitattributes`: `memory/*.md merge=union` (and `memory-*/*.md`). Git keeps both sides' lines, so
  concurrent edits of the index or a note no longer conflict, in a rebase or an autostash pop.
- `hooks/alert.sh`: one Telegram message to the Attention group ([[telegram_notify_skill]]), at most
  once a day per machine, when `push.sh` skips (mid-rebase, unmerged paths, markers), when commits
  here are over a day unpushed, or when `pull.sh` has failed for over a day. Stamps:
  `.git/sync-alert.last`, `.git/pull-failing-since`.

**`skills/synced/` left the repo the same day (commit `4cf7425`, on Manish's word: "Sure then let's
remove it").** It is the Claude app's own cache of account skills (one folder per account, refreshed
every 30 minutes while a session of that account runs) and caused 42 of the 47 conflicts in the
repair. Now untracked and in `.gitignore`. Checked on this Mac: with a bucket moved away, the next
Claude process start re-created it whole (225 files), so a machine whose copy is deleted by the pull
gets it back by itself.

What the hooks do about it (all tried in a sandbox: a bare remote plus clones run with `HOME`
pointed at them):
- `hooks/heal-synced.sh`: when EVERY unmerged path is under `skills/synced/`, keep the files and
  drop the folder from the index. `pull.sh` runs it before and after pulling, `push.sh` before its
  broken-tree checks. An old-hook machine with its own uncommitted change there conflicts on the
  pull that brings the removal, and its next Stop hook (already the new `push.sh`) clears it.
- `pull.sh`: if the rebase fails and GitHub answers, it tries `git merge --autostash origin/main`,
  heals, and commits. That is the "fall back to a merge" this note asked for, limited to the one
  conflict that is safe to clear.
- `push.sh`: pushes earlier unpushed commits even when a run has nothing new to commit.

**Known limit:** a machine still on the OLD hooks with an UNPUSHED commit that touches
`skills/synced` cannot rebase past the removal; its old `pull.sh` aborts and retries forever, and
it never receives the new hooks. Nothing is lost there, but it is stuck until someone runs, on that
machine: `cd ~/claude-config && git fetch origin && git merge origin/main`, then for each conflict
under `skills/synced/` `git rm --cached <path>`, `git commit --no-edit`, `git push`. To check any
machine: `cd ~/claude-config && git status --short | head -3; git fetch origin && git rev-list
--left-right --count HEAD...origin/main; tail -3 .sync.log` (healthy: no status lines, `0 0`).
