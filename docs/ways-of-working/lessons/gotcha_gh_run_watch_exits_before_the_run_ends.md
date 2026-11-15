---
name: gotcha-gh-run-watch-exits-before-the-run-ends
description: "`gh run watch <id> --exit-status` can exit 1 while the run is still in_progress (learnlikemagic run 42966680911, 2026-11-11: exit about 7 minutes into a 25-minute CI run that then passed); a watch's exit code is not the run's result: poll `gh run view --json status,conclusion` until completed"
metadata:
  type: feedback
---

Hit 2026-11-11 in learnlikemagic (PR #730's CI gate): a background
`gh run watch 42966680911 --interval 60 --exit-status` returned 1 at 05:41:58 UTC; the `gh run view` read right after
it showed the run still `in_progress`, and the run passed at 05:59:53 UTC. Its stderr was discarded, so why it quit
(a transient API error is likely) is not known.

**Why:** a session that reads only the watch's exit code would report a CI failure that never happened, or act on
a run that has not finished (a merge line, a hand-off, a word to Manish).

**How to apply:** wait on a run with a loop that reads `gh run view <id> --json status,conclusion` every 60 s until
`status` is `completed` (with a time cap), then report `conclusion`. If you use `gh run watch`, keep its stderr and
read `gh run view` after it before believing its exit code.
