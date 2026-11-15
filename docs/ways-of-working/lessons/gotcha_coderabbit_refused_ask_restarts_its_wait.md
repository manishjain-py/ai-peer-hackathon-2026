---
name: gotcha_coderabbit_refused_ask_restarts_its_wait
description: "CodeRabbit's org-wide cap (about 1 review an hour, Nov 2026): an @coderabbitai review sent while limited is refused and restarts the ~59-minute wait; an empty-body CodeRabbit review on your head is a thread reply, not a review"
metadata:
  type: reference
---

Seen on learnlikemagic PR #707, 2026-11-04 to 11-05. The cap is the organization's, so every repo
of Manish's shares it, and every session's pushes and asks draw on it.

- The limit notice (an issue comment CodeRabbit edits in place) says "Next included review available
  in N minutes". An `@coderabbitai review` sent before then gets "Action not completed: Review rate
  limited", and the notice resets to about 59 minutes. Asks at 19:31, 20:20 and 21:19 UTC were each
  refused this way, while no other open PR got a review in that hour; the review came only with the
  next push, the next day.
- Every push is one review attempt, and the allowance shrinks with attempts ("Your 112 included PR
  review attempts over the past 7 days set your current allowance at 1 review per hour").
- A CodeRabbit review object with an EMPTY body on your head is its reply in a thread, not a review
  of that head. The real marks: a review body (often "Reviewing files that changed from the base of
  the PR and between X and Y"), or the walkthrough comment's "No actionable comments were generated
  in the recent review", with the check run's "Review completed".

**How to apply:** after one refused ask, do not ask again inside the wait: let a push you need anyway,
or a quiet hour, carry the review, and let a build's PR take a slot before a small docs PR. Judge
"reviewed" by the marks above, never by `commit_id` alone. Related, in learnlikemagic memory:
gotcha_coderabbit_findings_hide_in_body.md, project_coderabbit_limits_and_cost_2026_10.md.

More signals (Teacher Feedback QA, 2026-11-03 to 11-08): a green CodeRabbit status that says "Review rate limited"
is no review, so read its text, never its colour; the next hour counts from the last review's start, so read the
head's `check-runs` before you push; a per-repo slot script cannot see the organization's cap (#719's 20:04 push was
refused although that repo's last review began at 19:03), and that refused push spent nothing.

**Its handle in backticks still calls it (learnlikemagic PR #626, 2026-11-15):** a controller record that named the
command as `` `@coderabbitai review` `` drew a CodeRabbit chat reply on that PR 35 s later (12:44:40 to 12:45:15
UTC). A record or comment that names the command drops the `@` ("the coderabbitai review command"): a real command
there could spend the organization's one hourly review on the wrong PR.
