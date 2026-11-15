---
name: gotcha-gh-pr-merge-transient-failure
description: gh pr merge can fail with a GraphQL "Something went wrong" or a 502 while githubstatus reads green; nothing merged
metadata:
  type: feedback
---
`gh pr merge <n> --merge --match-head-commit <sha>` failed twice in a row (learnlikemagic #735, 2026-11-12 22:17 UTC:
"GraphQL: Something went wrong while executing your query", then "502 Bad Gateway"), while githubstatus.com read "All
Systems Operational". The PR stayed OPEN, MERGEABLE CLEAN, on the same head; main was unchanged. Five minutes later the
same call merged.

**How to apply:** read the PR state first (a 502 can still land a merge: if MERGED, take its sha and go on), re-check
the merge conditions, then one retry with the same head match. Never switch to a squash or rebase merge or an admin
override; a further failure waits for GitHub and goes to whoever gave the merge word.
