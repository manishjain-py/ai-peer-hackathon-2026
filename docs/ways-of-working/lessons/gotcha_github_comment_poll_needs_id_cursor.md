---
name: gotcha_github_comment_poll_needs_id_cursor
description: "Polling a GitHub issue's or PR's comments: a plain list read gives the OLDEST 30; use since= (inclusive, a day back) with --paginate, and keep your place by comment id, never by a time"
metadata:
  type: reference
---

Seen on learnlikemagic PR #745, 2026-11-15 (a controller's background poll of PR #626's 677 comments; checked live
and on offline fixtures, and Codex's review found the same-second loss).

- `gh api repos/<owner>/<repo>/issues/<n>/comments` with no query lists the OLDEST 30 (on #626: 30 of 677, the first
  three days). A poll built on it never sees a new comment and never fails, so nothing tells you.
- `?since=<T>` keeps comments UPDATED at `<T>` or later: it includes `<T>`'s own second, and edits count.
  `--paginate` reads past the first page (`per_page=100` at most).
- Times are whole seconds, so "after the newest listed time" drops a comment posted in that second after your read.
  And GitHub's times can be wrong: on 2026-11-01, the US clock-change Sunday, it stamped some an hour ahead, so on
  #626 a higher id carries an earlier time (6555585736 at 09:33:38Z, then 6555984327 at 09:15:19Z). Ids rose in
  GitHub's order across all 677.

**How to apply:** keep your place as the newest comment id you listed, `<N>`, and list `select(.id > N)`; read
`?since=<T>&per_page=100` with `--paginate`, `<T>` a day before that comment's time, only to keep the read short.
Re-arm from `<N>`; filter your own comments out by their first line (with `gh` acting as one person, every comment
has the same author). It gives up edits to older comments. Related: [[lesson_big_context_makes_polling_expensive]].
