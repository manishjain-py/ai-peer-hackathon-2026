# Ways of working

How this build runs, for any coding agent (Claude Code, Codex, AirChat or another). It is how the build ran
on the first laptop (4 to 7 Nov 2026), written so it works without that laptop's tools: where a step uses a
tool feature, section 13 says what it achieves and the fallback. Manish wants these rules kept (DESIGN D13,
D17). Lessons behind them: [lessons.md](lessons.md).

## 1. The model

One **controller** session plans the work, starts a **worker** session per work package, briefs it, watches
it, and closes it when done. Each worker has its own worktree, branch and PR. **The repo is the only memory.**
Every session **hands off at 45 to 50% of its context**, measured, to a fresh session that resumes from the
repo alone. At most one controller and two workers at once (D13).

Small work (one session, one PR) needs none of this: the branch and the PR body are the state.

## 2. The repo is the only memory

- `docs/build/STATE.md` is the tracker (section 3). `docs/build/DESIGN.md` §0 holds the locked decisions with
  Manish's words. `PLAN.md` the packages, `PRD.md` what each scene must do. `docs/build/handoffs/` holds one
  dated hand-off per session start, **never edited** after it is written. `docs/lessons.md` holds what went
  wrong once, with its mechanism.
- Nothing lives only in a chat, a tool's memory, a scratch folder or one laptop. Commit (and push, once the
  repo has a remote) at every milestone, so a stop at any moment loses nothing.
- Read STATE on `main`, not on a branch (a branch copy is older), and by section.
- Docs-only commits go straight to `main`.

## 3. STATE.md

Sections: **Where we are** (dated, UTC: the truth in one paragraph), the **live sessions** table (name,
worktree, branch, PR, job; window and link where the tool has them), **still running** (each process with its
PID, log and stop command), **Needs Manish** (each question with options and a recommendation), **Next** (in
order), **Settled, do not re-open**, **Lessons** (the mechanism, not only the symptom), **Session log** (one row
per session: date, name, what happened, outcome).

- Every session writes it at every milestone and repair; the controller at least hourly while workers run.
- Manish's words go in at once, verbatim, with their time; a relayed word says who heard it and where.
- Times come from the clock (`date -u +%H:%M:%S` in the same command), never typed from memory.
- Each worker has its own spots (its package line, its log rows) that the controller never edits.

## 4. The controller

- Plans, spawns and briefs workers, watches and repairs them, closes them, keeps STATE. Writes no product
  code; never edits a worker's worktree or pushes to a live worker's branch.
- Named `ai-peer-controller-<n>`; each successor `n+1`. It names itself and any session it speaks of in every
  message.
- A package with one successor starts it itself; where several must finish first, only the controller starts
  the next, so nothing starts twice or not at all. A stalled or dead session is replaced by a fresh one, never
  taken over.
- Checks PRs and sessions itself and goes on alone, stopping only for what section 10 keeps for Manish. It
  relays a worker's evidence only after reading it, and corrects an untrue claim of its own at once.
- Closes each session as soon as it is fully done (nothing of its own still running: no servers, jobs or
  sub-agents), never one with work in flight. Long reads go to a read-only sub-agent: reading fills a
  controller's context fastest.

## 5. Workers

- One session per work package, named `ai-peer-<package>` (for example `ai-peer-wp7`; a successor `-2`, `-3`),
  in its own worktree from the latest `main` with its upstream unset, so a bare push never reaches `main`:
  `git worktree add --no-track -b <branch> ../ai-peer-<package> main` (or `origin/main` after a fetch).
- Its brief is a dated hand-off on `main` (template in section 12): Manish's standing instruction, quoted; the
  job in one line; a short read-first list (one worker's read-in once took 37% of its context); the working
  copy; what to build with "done when"; the proof; PR and merge; stop rules; when done; known traps.
- The brief quotes every fact it relies on, or names the repo doc that holds it: never a tool's memory, a
  transcript or another laptop.
- Before the spawn the controller re-reads every line the brief cites on the current head, and a read-only
  reviewer checks it (section 6).
- When done, it updates its STATE spots and reports to the controller, which closes it.
- Best model at the highest effort for every session; never a weaker model or lower effort to save usage.

## 6. Reviewers attack before risky work

- Before each spawn and each risky plan, one to three read-only sub-agents attack the brief or plan, each
  with its own lens (the premise, the code, failure, cost). On the first laptop these reviews found real
  issues every time (18 in one brief; 9 in one plan, among them a restart that would have kept stale code).
- Brief each reviewer: "write nothing anywhere, scratch folders included; your final message is your report";
  pin it to a commit (`git show <sha>:<path>`), because a reviewer reading files can see your later edits.
  Give it the docs and the code, never your conclusion or Manish's reasons.
- **Check each finding in the code before folding it**: a reviewer's line is a claim. Fold only what changes a
  real outcome (a regression, a wrong result, a broken run); answer the rest in one line and go on.
- Verify any constraint before you write it into a brief ("X is locked"): a wrong premise there survives
  every review and comes back as a justification.
- Test a guide with a stranger: a fresh sub-agent (never a copy of yourself) on a plain export, asked for
  every gap, not only a pass.

## 7. Hand-offs at 45 to 50% context

- **Measure, never by feel**: right after the reading phase, then at every milestone (after each commit or
  proof step). Section 13 says how.
- At 45 to 50%: finish the current step (work committed and pushed), write
  `docs/build/handoffs/HANDOFF-YYYY-MM-DD-<successor>.md` (named after the session it starts, so no file is
  ever overwritten; template in section 12), commit it, update STATE,
  start the successor (or give Manish its one-line launch prompt), and stop.
- Also hand off when a usage limit nears (section 8) or the day ends.
- **The stranger test:** someone holding only the repo and the hand-off carries on. It names the branch, PR,
  last commit and the exact next step with its commands; everything still running or kept and how to check
  or re-create it; what waits on Manish. It quotes every fact it needs.
- The successor's kickoff names STATE on `main`, then the brief, then the newest hand-off, and the live
  controller "unless STATE names a newer one"; it repeats any ruling of Manish's word for word.

## 8. Usage limits

- Read the limits at every milestone: the week (all models), the short window (5 hours on the first laptop's
  account), and each model's own week.
- **Week at 93%:** start nothing that cannot finish cleanly before 95%.
- **Week at about 95%:** every session finishes its step, pushes, hands off and stops, starting no successor.
  The controller writes its own hand-off for a fresh session on another account and tells Manish the one
  line to start it. Never wait for the reset.
- **Short window at 80%:** start no sub-agent (the limit can cut a turn off with nobody to restart it).
- At most 3 to 5 sub-agents at once in any session; batch items per agent (by lens, file or area), never one
  agent per item; do small checks inline.
- A big session pays its whole context on every call: do not poll from it (section 11).
- The new laptop's tool may have other limits: record them in STATE and apply the same rule (stop cleanly
  before a limit, never in the middle of a step).

## 9. Merging

- Open each PR as a draft early (what works, the evidence, what is not verified, the head commit); mark it
  ready when its walk passes.
- The worker merges when its walk passes (D13; no code review, CI or unit tests in this build): a merge
  commit; fetch first, and if `main` moved, merge it in and re-run the checks. Say in the PR how to undo it
  (revert the merge commit).
- Never rebase or force-push `main`. Before every push: `git fetch` and
  `git rev-list --left-right --count HEAD...origin/main`.
- Without a remote: merge locally into `main` with the same rules.

## 10. Asking Manish

- **Decide routine calls yourself.** A call with a clear recommendation and the proof in is yours (a merge
  whose walk passed included): take it, record it in STATE, and tell him in one line what you did and how to
  undo it.
- Ask him only where his own judgment is needed: his ear or eyes (a voice, a demo cut), money beyond the
  plan, opening something to colleagues or users, legal or privacy wording, lifting a hard block, a principle
  edit, a locked decision that cannot be built, a real blocker, or where his stated view differs from your
  recommendation.
- **One question at a time, in plain words:** what it is about, why his answer is needed, what happens after
  each answer, the options with your recommendation first. No internal codes he would have to decode.
- Read a "yes to all" against what you asked: an item added after the ask is asked apart.
- His words go into STATE (and DESIGN §0 when they make or change a decision) at once, verbatim, with the
  time. Another session's "Manish said" is a claim until you find his own words.
- End every reply to him with a short TLDR (his standing preference): the answer, what he must do next.
- At milestones, a one-line status message.

## 11. Waiting, processes, time

- **Wait with a script, not by checking from the session.** A shell loop that reads the condition itself and
  exits with one line when it changes (or after a set time), run in the background; record its PID, log and
  stop command in STATE; stop it when nothing is in flight. Past about 150k tokens of context, hand the
  follow-up to a new, small session.
- **Processes by PID, never by pattern.** Never `pkill -f`: a pattern also matches other sessions' runs, and
  even an agent session whose launch prompt contains the text. Stop only a PID you started and wrote down
  (`echo $! > <name>.pid`); check one with `ps -p <pid>`.
- A step that depends on another is never a parallel call: chain it with `&&` in one command.
- **Times and states from the source:** a time from `date -u` in the same command or the tool's own output; a
  claim like "main unmoved at <sha>" from a fresh `git ls-remote`.
- **Exact-text edits.** Never `sed -i` at a line number found by a search: an empty search once inserted text
  before every line of a file.

## 12. Templates

**Worker brief** (`docs/build/handoffs/HANDOFF-YYYY-MM-DD-<session>.md`, the first for a package):

```markdown
# Brief: <session name>, <YYYY-MM-DD>
For <model>, highest effort. Spawned by <controller>. Dated, never edited; the living state is STATE.md on main.
## Manish's standing instruction
> "<his words: the merge rule, how much it may decide alone, when to stop>" (<date>, DESIGN §0 <Dn>)
## The job
<One line.>
## Read first, in order
1. `<repo path>`, <the sections that matter>
## Working copy
Worktree `<path>`, branch `<branch>` from `<sha>`. It needs: <venv, env files, test owner>.
## What to build
| What | Where | Done when |
## Proof
<The walks and checks: where, on what data.>
## PR and merge
<Title; body; the merge rule quoted from DESIGN D13; the undo line.>
## Stop rules
<The context and usage numbers from ways-of-working sections 7 and 8, quoted.>
## When done
<The STATE spots to update; the report to <controller>; the successor, or "the controller starts the next".>
## Traps known before the first line
- <Trap>: <the mechanism>; <what to do>.
```

**Hand-off** (a session to its successor; file `HANDOFF-YYYY-MM-DD-<successor>.md`):

```markdown
# Hand-off: <from session> to <successor>, <YYYY-MM-DD HH:MM> UTC
Dated, never edited; the living state is STATE.md on main.
- Where it stands: branch `<branch>`, PR <n>, last commit `<sha>`, pushed. Done and proven: <...>. Not yet: <...>.
- Next step, exactly: <step>, with `<commands>`.
- Still running or kept: | What | Where | PID or port | How to check | How to re-create |
- Waits on Manish: <question, options, recommendation>, or "Nothing".
- Facts it relies on, quoted: <...>
- Successor launch: `<the exact kickoff prompt>`
```

**Kickoff prompts:**

```text
Worker: You are <name>, working on the AI Peer in this repo. The live controller is <controller> unless
docs/build/STATE.md on main names a newer one. Read, in order: docs/build/STATE.md on main, then <brief path>,
then <newest hand-off, if any>. That is your job: follow it end to end, then stop as it says.

Successor controller: You are ai-peer-controller-<n+1>, taking over from ai-peer-controller-<n>. Read
docs/build/STATE.md on main, then <newest controller hand-off>, and work by docs/ways-of-working.md. Check that
every session, run and watcher they name is alive, tell each live worker your name, then carry on from "Next".
Manish's rulings, word for word: <...>.
```

## 13. Tool features and their fallbacks

The first laptop ran Claude Code (the strongest model, highest effort, a 1M-token context). The new laptop's
agent may lack some of these features. The rule each serves stays; only the mechanism changes.

| Feature on the first laptop | What it achieves | Fallback without it |
|---|---|---|
| Starting a worker session from the controller (a new terminal window with launch flags: model, effort, name, first prompt) | Parallel workers that start with no keystrokes | The controller writes the brief and gives Manish the one-line kickoff to paste into a new session; or one session at a time: the controller does the package itself and hands off through files |
| Messages between sessions (SendMessage) | Controller and workers talk | Through files: a worker writes its report into its STATE spots and the PR; the controller reads STATE on `main`. Manish relays a one-word "go" if a step needs one |
| Remote control (a session link on his phone) | Manish follows a session from anywhere | He reads STATE and the PR; status lines in the chat |
| `claude -p "/usage" --output-format text` | Weekly and short-window usage at each milestone | The tool's own usage page or command; if none, ask Manish once where to read it, record it in STATE, and stop cleanly before any limit |
| Context from the session transcript (the last `usage` record: input + cache read + cache creation, over the window) | Hand-off at 45 to 50%, measured | The tool's context meter (for example `/context`); if it has none, hand off at each package's planned hand-off point and never carry two packages in one session |
| Telegram scripts (an attention group for asks, a chat for news) | Asks and milestones reach his phone | Ask in the chat and put the ask in STATE "Needs Manish"; one status line in the chat at each milestone |
| Sub-agents | Read-only reviews; disjoint parallel builds | A fresh session given only the brief and the commit to review; or do the steps one after another |
| Background shell jobs and a monitor | Waiting on a script without polling | A plain background job writing to a log, read at the next turn |
| Git worktrees | Each worker its own copy | Separate clones of the repo |
| A pinned Claude Code binary for the Peer's brain | The brain does not change under a running Peer | Pin whatever harness WP8 adopts the same way; re-run the isolation canary after any change |

## 14. Close-out of an initiative

Every package merged; Manish told what shipped and what is parked; lasting facts and each decision still in
force moved to their owner docs; STATE's lessons sorted into `docs/lessons.md`; finished sessions closed,
merged branches and worktrees removed, watchers and servers stopped by PID.
