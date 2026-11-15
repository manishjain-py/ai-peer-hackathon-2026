# Templates: STATE.md, worker brief, hand-off, kickoff

Fill in every `<...>`. The rules behind each part are in SKILL.md; these are only the shapes.

## STATE.md

```markdown
# <Initiative>: state

Live controller: <initiative>-controller-<n> (window <id>, <session URL>).

## Where we are (<YYYY-MM-DD HH:MM> UTC)

<The truth in one paragraph: what is done, what runs now, what comes next.>

| Session | Window | Session URL | Worktree | Branch | PR | Job |
|---|---|---|---|---|---|---|
| <name> | <id> | <url> | <path> | <branch> | #<n> | <one line> |

Still running:

| What | PID | Log | Stop command |
|---|---|---|---|
| <script, server or job> | <pid> | <path> | `<command>` |

## Packages (each line is written by its own worker only)

- <package>: <status>, PR #<n>, <proof so far>.

## Needs Manish

1. <Question>. Options: <a>, <b>. Recommended: <a>, because <why>.

## Next

1. <Step>, by <session>.

## Settled, do not re-open

- <Decision>: <why> (DESIGN section 0 #<n>, or Manish's words with their time).

## Lessons

- <What went wrong once>: <the mechanism>; <what we do now>.

## Session log

<!-- Rows the controller and a worker's PR both add at the end of this file conflict. The
controller appends here only while no open PR adds rows, and pushes nothing while a worker
merges. -->

| Date (UTC) | Session | What happened | Outcome |
|---|---|---|---|
```

## Worker brief (`HANDOFF-YYYY-MM-DD-<session>.md`, the first one for a package)

```markdown
# Brief: <session name>, <YYYY-MM-DD>

For <model>, max effort. Spawned by <controller name>. Dated, never edited; the living state is
STATE.md on the default branch.

## Manish's standing instruction
> "<his words: the merge rule, how much it may decide alone, when to stop>"
> (<date>, DESIGN section 0 #<n>)

## The job
<One line.>

## Read first, in order
1. `<repo path>`, <the sections that matter>

## Working copy
Worktree `<path>`, branch `<branch>` from `<sha>`. Re-create it with: `<commands>`.
It needs: <env files, dependencies, the database or service it runs against>.

## The contract
| What to build | Where | Done when |
|---|---|---|

## Tests and proof
<Per area: the tests, the checks, and the live run to see working: where, on what data.>

## PR and merge
<Title; body (what, why, proof naming the head commit); reviewers; the merge rule, quoted from
section 0; the deploy to watch; the Telegram line to send.>

## Stop rules
<Quote the usage and context rules with their numbers from the big-initiative skill (sections 10
and 11): a cloud worker or another agent cannot read the skill.>

## When done
<The STATE.md spots to update; the report to <controller>; the successor and how to spawn it, or
"the controller starts the next".>

## Traps known before the first line
- <Trap>: <the mechanism>; <what to do>.
```

## Hand-off (`HANDOFF-YYYY-MM-DD-<session>.md`, a session to its successor)

```markdown
# Hand-off: <from session> to <successor>, <YYYY-MM-DD HH:MM> UTC

Dated, never edited; the living state is STATE.md on the default branch.

- **Where it stands**: branch `<branch>`, PR #<n>, last commit `<sha>`, pushed.
  Done and proven: <...>. Not proven yet: <...>.
- **Next step, exactly**: <step>, with `<commands>`.
- **Still running or kept**:

  | What | Where | PID or port | How to check it | How to re-create it |
  |---|---|---|---|---|

- **Waits on Manish**: <question, options, recommendation>, or "Nothing".
- **Facts it relies on, quoted**: <...>
- **Successor launch**: `<the exact launch line, or the kickoff message>`
```

At a 95% stop, write it for a new session on another account: list every live session, window,
run, watcher, PID and port, and rest on nothing of this account (no remote-control links, no
session memory).

## Kickoff message (the first prompt, the last argument of the launch line)

A worker, or a worker's successor, on a Mac:

```text
You are <name>, working on <initiative> in this repo. The live controller is <controller name>
unless STATE.md on the default branch names a newer one. Read, in order: <STATE.md path> on
origin/<default>, then <brief path>, then <newest hand-off path, if any>. That is your job: follow
it end to end, then stop as it says.
```

A successor controller:

```text
You are <initiative>-controller-<n+1>, taking over from <initiative>-controller-<n>. Read
<STATE.md path> on origin/<default>, then <newest controller hand-off>, and work by the
big-initiative skill (the repo's own workflow skill wins where it has one). Check that every
session, run and watcher they name is alive, tell each live worker your name, re-arm the watch,
then carry on from "Next". Manish's rulings, word for word: <...>.
```

A cloud worker (a claude.ai/code session; it knows only the repo and this message):

```text
You are <name>, a cloud worker on <initiative>. Start from branch <branch>. Read <brief path> in
full: it holds everything you need, since no skills, lessons or memory from outside this repo
reach you. Follow it end to end. Commit and push every lesson to <path> before you stop.
```

The 95% line the controller sends on Attention:

```text
<repo>: weekly usage at 95%, <initiative> stopped cleanly. To go on from another account, run in
<repo path>: <the launch line for <initiative>-controller-<n+1>>
```
