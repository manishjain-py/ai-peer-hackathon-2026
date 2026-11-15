---
name: gotcha_git_grep_e_has_no_word_boundary
description: "`git grep -E` has no `\\b`: a pattern with it matches nothing and the empty result reads as \"absent\"; use `git grep -w`, and run a control search before reporting absence"
metadata:
  type: reference
---

`git grep -nE '\b8023\b' <ref> -- <file>` printed nothing although the file held 8023 twice; the
same search without `\b`, or `git grep -nwE '8023'`, found both (git 2.51.0, macOS, 2026-11-05,
ux-feedback-controller-29 checking another initiative's PR for port numbers). The empty result
went to that PR's session as "the PR names neither port", a wrong fact taken back one message later.

**Why:** `git grep -E` uses POSIX extended regex, which has no `\b`; it fails silently, no error.

**How to apply:** whole words with `git grep -w`; before reporting that something is absent, run a
control search (the same pattern on a file known to hold a match). Related: [[gotcha_grep_is_ugrep]].
