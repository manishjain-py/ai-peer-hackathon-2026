---
name: lesson-time-in-a-record-from-the-clock
description: "Every time written into a message, STATE.md or a PR comes from `date -u` read right before writing it, never from the last time you saw"
metadata:
  node_type: memory
  type: feedback
  originSessionId: b96c9f50-d1bc-4502-9ccd-49d8b9da9d34
  modified: 2026-11-01T08:17:41.924Z
---

A clock time in anything others read (a controller message, a `STATE.md` paragraph, a PR body) is read with
`date -u +%H:%M:%S` immediately before it is written, or taken from a tool's own output (a push line, a run's
`createdAt`). Never estimate it.

**Why:** 2026-10-07, `content-factory-p8-2` (P8 of the content-factory build). It wrote "13:47 UTC" to the controller
when the clock said about 13:36, and headed its `STATE.md` paragraph "14:30 UTC" for a push made at 14:26:43, which
cost a correction message and a second `[skip ci]` commit to `main`. The same build's controller had already pushed
"the controller's typed times corrected from its transcript". In these builds times are evidence: hand-offs, merges
and deploys are ordered by them.

**How to apply:** put `date -u +%H:%M:%S` in the same command that does the thing (merge, push, comment), and copy
the printed time. For a paragraph written before its push, write the time after the push prints, or leave the
heading time out. Related: [[lesson-measure-dont-remember]].

A tool's own time can be wrong too: on 2026-11-01 (the US clock change's Sunday) GitHub stamped objects made
between 08:00 and 09:00 UTC an hour ahead (PR #685's mergedAt read 09:16:10Z for a merge `date -u` put at 08:16:10),
while its `Date` header matched the Mac. Likely the repeated 1 to 2 AM Pacific hour, so expect it on the first Sunday
of each November; when a GitHub time and `date -u` disagree, `date -u` wins.

**A state claim is the same as a time** (board-font-3, PR #690 hand-off, 2026-11-02): the text said "`origin/main`
b92132a3d, unmoved at 11:27 UTC", checked at 11:25:34; PR #691 merged at 11:25:59 and the posting command's own
`ls-remote` printed b3ea9bc28 a second before the post, so the comment had to be edited. Make the posting script
compare `git ls-remote origin refs/heads/main` (and the lock, the head) with the sha the text names, and stop before
`gh pr comment` if they differ.

**A rule read in every hand-off is not kept** (Teacher Feedback QA, 2026-11-07 to 11-12): six controllers still
typed times ("16:50" into a worker's prompt at 16:44; "about 05:20" into a record at 05:18, which took a second
push). Let the editing script stamp the time (`datetime.now(timezone.utc)` inside it, or a `{NOW}` placeholder it
fills), in a prompt or a brief too.

**An event you notice late takes its time from the transcript, not from "about"** (telugu-wp8a-12, 2026-11-15):
twice it wrote a background sub-agent's start or finish as "about 10:21:20" and "10:47", and twice it had to send
a correction. The session's own transcript (`~/.claude/projects/<cwd folder>/<session id>.jsonl`) stamps every
record: a sub-agent's finish is the `queue-operation` record carrying its id and "finished", read with a short
Python scan of the `timestamp` field (never the whole file); a launch with no record of its own is "between
<the date -u before> and <the date -u after>".
