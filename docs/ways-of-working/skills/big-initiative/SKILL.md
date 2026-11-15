---
name: big-initiative
description: Manish's recipe for a big or multi-session initiative or feature in any repo. A long-lived controller session, named <initiative>-controller-<n>, plans the work, spawns, briefs, watches and closes worker sessions (one per work package, each with its own worktree, branch and PR), keeps every fact in the repo (BRIEF, DESIGN, PLAN, STATE.md, dated hand-offs) and hands off to a fresh controller when its context fills. Use it when planning, starting or running a big or multi-session initiative or feature; when you are, or are starting, a controller session; when spawning, briefing or closing worker sessions; when handing off (context near 45 to 50%, weekly usage near 95%, end of day); when resuming from a hand-off; and when closing out an initiative. In a repo with its own workflow skill (learnlikemagic: dev-workflow), that skill leads and this one fills its gaps.
---

# Big initiative: many sessions, one memory in the repo

A controller tends worker sessions, the repo holds every fact, and a fresh session takes over when
one fills up or stops, on any Mac or subscription.

## 1. Which rules win

Read the repo's `AGENTS.md` or `CLAUDE.md` first: its rules beat this skill. If the repo has its own
workflow skill for this, follow it and use this one only for its gaps (in learnlikemagic,
`dev-workflow` wins). A personal skill beats a project skill of the same name: hence this new name.

## 2. Size the work

- **Small** (one session, one PR): the repo's normal flow; the branch and PR body are the state.
- **Multi-session** (outlives a session or PR, one session at a time): the premise test (section 3),
  then sections 4, 6 and 9 to 14.
- **Big** (decisions to lock with Manish, several packages, parallel sessions): every section.
- Unsure: pick the bigger. Small work that outgrows its session becomes multi-session.

## 3. Start: test the ask, then interview

- Test the ask against evidence first (the code, the logs, the data, read-only). If the evidence
  disagrees with it, stop and tell Manish.
- Map the code, then interview him one question at a time, first the one that could flip the plan.
  Each gets a short, simple explanation with the measured facts, and your recommended option first.
  When it helps, first show him your understanding (a mockup, a short video). If his answer is a
  new question or idea, settle that, then go on. Snapshot anything he likes before the next edit.
- Each answer becomes a numbered decision in `DESIGN.md` section 0, with his words and the date,
  including what may merge without him and the model the sessions run on. No later session
  re-opens one; when he changes one, section 0 changes at once.
- Lesson: `~/claude-config/lessons/feedback_design_interview_format.md`

## 4. Working docs live in the repo

One folder per initiative, where the repo's docs convention puts it, else `docs/initiatives/<name>/`
(learnlikemagic example: `docs/feature-development/<feature>/`):
- `BRIEF-YYYY-MM-DD.md` (written once): the ask in Manish's words and the evidence that tested it.
- `DESIGN.md`: what and how; section 0 holds the locked decisions. A long "what" may get a `PRD.md`.
- `PLAN.md` (until kickoff): the work packages, their order, the proof each must pass, and how
  unfinished work stays off for users until launch.
- `STATE.md`: the tracker (section 6). `HANDOFF-YYYY-MM-DD-<session>.md`: one brief per session
  start (section 10).

Push them to the default branch before any session needs them, as docs-only commits under the
repo's rule for skipping CI or deploys (learnlikemagic example: `[skip ci]`). The repo is the only
memory: a fresh session on another Mac, another subscription or in the cloud resumes from it alone.
Nothing lives only in a transcript, `~/.claude`, `~/claude-config`, the scratchpad, `/tmp` or
uncommitted work. Commit and push at every milestone.

## 5. Reviewers attack the docs

Before any code, 3 to 5 read-only sub-agents attack BRIEF, DESIGN and PLAN, each with its own lens
(for example the premise, the user, the code, failure, cost), plus the repo's own reviewers where
it has them (learnlikemagic example: CodeRabbit and Codex). Brief each, like any read-only
sub-agent, "write nothing anywhere" and to read at a fixed commit (`git show <sha>:<path>`); give
it the docs and the code, never your conclusion or Manish's reasons, which come back as evidence.
Check each finding against the code before folding it. What needs Manish goes to him in the same
round, then into section 0, as does any change to a doc that only he may change.

## 6. STATE.md: the tracker (template: `references/templates.md`)

- **Where we are** (dated, UTC): the truth in one paragraph; the live sessions (name, window id,
  session URL, worktree, branch, PR, job); what is still running, with PID, log and stop command.
- **Needs Manish**: each question with its options and a recommendation. **Next**, in order.
- **Settled, do not re-open**: decisions a later session might helpfully undo.
- **Lessons**: what went wrong once, with its mechanism, not only the symptom.
- **Session log**: one row per session: date, name, what happened, outcome.

Every session writes it at every milestone and repair, the controller at least hourly, so a stop at
any moment loses nothing. Manish's word goes in at once, verbatim, with its time (a relayed word
says who heard it, and where). Never type a time: take it from `date -u` in the same command, or
from the event's own record. Each worker gets its own spots (its package line, its log rows) that
the controller never edits. Read it on the default branch (a branch copy is older), by section.
Lesson: `~/claude-config/lessons/feedback_maintain_planner_and_handover.md`

## 7. The controller

- Its job: plan, spawn and brief sessions, watch and repair them (`references/sessions.md`), close
  them, keep STATE.md. It writes no product code, and never edits a worker's worktree or pushes to
  a live worker's branch.
- Its name is `<initiative>-controller-<n>`, set at launch, each successor `n+1` (for example
  `codex-factories-controller-50`). It runs on a Mac: it needs `osascript` and the user skills
  mac-terminal-control and notify.
- It says which session it is: each message to Manish names its sender and any session it speaks
  of (name, window id, remote link). Workers do the same.
- A package with one successor starts it itself; where several must finish first, only the
  controller starts the next, so nothing starts twice or not at all. A stalled or dead session is
  replaced by a fresh one, never taken over. Start the next session in the same turn that records
  what it waits for: once a turn ended between the two, and nothing ran for four and a half hours.
- It checks PRs, deploys and sessions itself and goes on alone, stopping only for section 13's
  list. It relays a worker's evidence only after reading it, and corrects an untrue claim of its
  own at once, in STATE.md, on Telegram and in the chat.
- It closes each session as soon as it is fully done, without waiting for Manish; never one with
  work still running. Long reads go to a read-only sub-agent: reading fills its context fastest.

## 8. Workers

- One session per work package, with its own worktree, branch and one PR, branched from the latest
  default branch with its upstream unset, so a bare push never reaches the default branch.
- Spawn it with no keystrokes and give focus back (`references/sessions.md`). Name it
  `<initiative>-<package>`, a successor `-2`, `-3` (learnlikemagic example: `tfqa-p4-2`).
- Run it on section 0's model (the best available, max effort); if its allowance runs out, use the
  next best instead of waiting.
- Its brief is a dated hand-off file on the default branch (template: `references/templates.md`):
  a header; Manish's standing instruction, quoted; the job in one line; read first (a few repo
  paths: one worker's read-in took 37% of its context); the working copy; the contract; tests and
  proof; PR and merge; stop rules; when done; known traps.
- The brief quotes every fact it relies on or names a repo doc that holds it, never `~/.claude`,
  `~/claude-config` or a transcript: cloud workers, other agents and an unsynced Mac cannot read
  them. Naming a user skill to a laptop worker is fine.
- Before the spawn, re-read every line the brief cites on the current head, and have a read-only
  sub-agent check it for stale facts, a wrong risk and writes to production, against the path the
  worker will really run (a brief's "as written" can name what a later package builds). Start that
  check on the previous package's near-final head, before its merge, and run it again after each
  change to the brief: one took 24 minutes and found more than any other step that day; another
  caught a controller's own ruling that dropped a promised line.
- When done, it updates its STATE.md spots and reports to the controller, which closes it.
- A cloud worker (a claude.ai/code session) gets only the repo and its kickoff message (secrets: the
  account's environment settings), with no user skills, lessons or memory. Vendor into the repo
  what it needs from a laptop (a user skill's script); it commits every lesson before it ends.

## 9. Waiting

- Wait with a shell script, never by checking from the session (no `/loop`, no scheduled checks).
  A big session pays its whole context on every call: at 727k tokens one check cost about 0.2% of
  the weekly limit, about 7% a day. A longer interval does not help: past the one-hour cache life,
  each wake-up re-reads everything.
- Run it under Monitor (one line per change; re-arm it when it expires) or in the background (its
  end re-invokes the session). It sends one Telegram line when the condition is met
  (learnlikemagic example: dev-workflow's `chain-watch.zsh`). Put it in STATE.md's "still running"
  list; stop it once nothing is in flight.
- Past about 150k tokens of context, hand the follow-up to a new, small session through STATE.md.
- Lesson: `~/claude-config/lessons/lesson_big_context_makes_polling_expensive.md`

## 10. Hand-offs

Hand off when context reaches 45 to 50%, when weekly usage nears 95% (section 11), or when the day
ends. Measure context from this session's own transcript right after the reading phase and at every
milestone, never by feel (`references/sessions.md`). The controller reads each live worker's context
at every event it handles and tells one past 45% to hand off at its next clean step.
- Finish the current step first (tests green, work committed and pushed). Then write a dated
  `HANDOFF-YYYY-MM-DD-<session>.md` (small work: a PR comment), push it and never edit it again; the
  living state is STATE.md. Never push a hand-off to a gated PR's branch: it moves the head the
  reviews ran on (use the default branch or a side branch). Template: `references/templates.md`;
  resuming: `references/sessions.md`.
- The stranger test: someone holding only `git clone` and this text carries on. It names the
  branch, PR, last commit and the exact next step with its commands; all that still runs or is
  kept, and how to check or re-create it; what waits on Manish. It quotes every fact it needs.
- Then start the successor (a controller's is `<initiative>-controller-<n+1>`, and it tells each
  live worker its name). Its kickoff names STATE.md on the default branch, then the brief, then the
  newest hand-off, and the live controller "unless STATE.md names a newer one"; it repeats any
  ruling of Manish word for word.

## 11. Usage limits

Read them at every milestone with `claude -p "/usage" --output-format text` (local, about 10 s): the
week (all models), the 5-hour window ("Current session", with its reset time) and each model's week.
- **Week at 93%**: start nothing that cannot finish cleanly before 95% (a long workflow, a full test
  run, a merge whose deploy you must watch).
- **Week at 95%**: every session finishes its step, pushes, hands off and stops, starting no
  successor. The controller hands off and sends Manish the new controller's launch line on
  Attention; he moves the initiative to another subscription. Never wait for the weekly reset.
- **5-hour window at 80%**: start no sub-agent (the limit can cut a turn off with nobody to restart
  it). Before a stretch that may cross it, start a background `sleep` that ends just after the
  reset: its end re-invokes the session.
- **One model's week used up**: every session on that model stops at a keystroke dialog at once.
  Before an overnight chain, check it, and put workers on another model when it is short.
- An initiative at work burns about 2 to 5% of the week an hour, more with other sessions on the
  account; a cloud session spends the account's cloud credit first (only claude.ai Settings > Usage
  shows it). One subscription per unit of heavy work: more parallel work needs more subscriptions.
- At most 3 to 5 sub-agents or workflow agents at once in any session. Batch items per agent (by
  lens, file or area), never one agent per item; do small checks inline. A big package can stay in
  one session when sub-agents build disjoint files from one shared brief; their reports are
  claims, and an independent reviewer still reads the code.
- Lessons, in `~/claude-config/lessons/`: `feedback_stop_at_95pct_weekly_usage.md`,
  `howto_survive_5h_usage_window_stall.md`, `gotcha_weekly_fable_limit_stops_every_session.md`,
  `feedback_workflow_agent_cap.md`, `lesson_disjoint_subagents_keep_a_big_package_in_one_session.md`

## 12. Merging

- Open each PR as a draft, early, and mark it ready once its reviews are folded.
- Plan merges, the review allowance and other builds' PRs as one queue. CodeRabbit gives about one
  review an hour across all of Manish's PRs, so open the next PR in a quiet hour ahead. Another
  build's PR can take the slot, edit the same files, or take the same number in a shared list (two
  PRs both took one parked number): read open PRs' diffs of such a list before taking a number.
- Fold a review point only when it changes a real outcome on a path that is used (a regression, a
  wrong result, a broken run); answer the rest in one line and go on. Make wording folds before the
  final checks. A real defect still gets its whole class fixed. A fold that mostly deletes code
  still gets its fresh reader (one found two Majors).
- Merges are not questions (Manish, 2026-11-05): the moment the PR is green (CI, the review, your
  own proof of it working), merge it, quote that rule or DESIGN section 0 in the PR body, and tell
  him in one line how to undo it. Wait only for an area section 0 keeps for him. Check the statuses
  yourself; never end a turn "waiting for green" (section 9).
- Right before merging, fetch: if code merged on the default branch since your checks, merge it in
  and run them again. After the merge, watch any deploy and send Manish one routine Telegram line.
- Lesson: `~/claude-config/lessons/feedback_dont_loop_on_minor_review_points.md`

## 13. Telling Manish

- Asks and blockers go to the Attention group through the notify skill (`tg-attention.sh`) before
  the turn ends, in one or two lines: the need, the options, your recommendation, the session to
  return to. Routine news goes to `tg-notify.sh`, never to both.
- Ask him only where his own judgment is needed: his ear or eyes (a voice, a content sample,
  something going live), money beyond the plan, opening something to children or users, legal or
  privacy wording, a principle edit, a store submission, a production data change outside a normal
  deploy, a locked decision that cannot be built, a big new decision, a real blocker, or where his
  stated view differs from your recommendation. Every other call with a clear recommendation and
  the proof in is yours: take it, note it in STATE.md, tell him in one line, go on. Lesson:
  `~/claude-config/lessons/feedback_take_routine_calls_yourself.md`
- Always one question at a time, in plain words. While a worker is live, never use `AskUserQuestion`
  (workers' messages queue behind it, once for 3.5 hours): ask in a plain reply and on Attention.
- Read a "yes to all" against what you asked: an item added after the ask is asked apart, and a yes
  to an either-or takes your stated recommendation; tell him so.
- End every reply with a TLDR. Put a question first, and again in the TLDR: the idle ping sends the
  TLDR (or the reply's start) to his phone. For a "where are we" brief, use catch-me-up.

## 14. Close-out

1. Every package merged and deployed or released; name the release that carries each.
2. Tell Manish (Attention and the session) what shipped, where it is documented and what is parked.
3. Lasting facts, and each decision still in force with its reason, to their owner docs; each open
   item to the repo's parked list or a named follow-up.
4. Sort STATE.md's Lessons. One that helps any project: one file in `~/claude-config/lessons/` plus
   one line in its `INDEX.md`. One that changes this recipe: into this skill, at
   `~/claude-config/skills/big-initiative/`. One for this project only: into that repo.
5. `git grep` the folder's path and each file's name; repoint every link to the doc that now holds
   the fact. Then one close-out PR deletes the folder; git history keeps it.
6. Clean up: close finished sessions; delete merged branches, origin and local; remove worktrees
   (`git worktree remove`, then `prune`) unless a run in flight still reads one (`lsof +D <path>`);
   stop watchers and servers by PID; drop test databases; trim or delete the project's memory entry.
