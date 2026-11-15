---
name: gotcha_zsh_unquoted_grep_include_glob
description: "In zsh, an unquoted grep --include=*.swift dies before grep runs; the empty output reads as \"zero hits\" and becomes false proof of absence"
metadata: 
  node_type: memory
  type: feedback
  originSessionId: accb65b9-1425-486a-8d67-6ee0a19ba90d
  modified: 2026-10-24T07:17:19.865Z
---

`grep -rn "thing" ios --include=*.swift` **never runs grep** in zsh. zsh expands the
unquoted glob first, finds no match in the CWD, and aborts with
`zsh: no matches found: --include=*.swift` (exit 1, no stdout). Quote it:
`--include="*.swift"`.

**Why:** the failure looks exactly like a successful search that found nothing. If you are
grepping to prove a symbol is dead, an aborted command is indistinguishable from real
absence — so it becomes evidence for a deletion that should never have happened.

**How to apply:** always quote `--include`/`--exclude`. When a grep returns nothing and you
are about to conclude "no callers, safe to delete", re-run it and confirm you saw a real
exit 0 with no `no matches found` line. Prefer a positive control first: grep for something
you know exists with the same flags.

Bit us twice in one session (2026-08-26 `/update-all-docs`): I hit it myself, and a bundle
agent used it as the sole evidence to delete the iOS `is_stale` legacy annotation from
`docs/technical/mobile-apps.md`. The correctly-quoted command returns three hits
(`ios/LearnLikeMagic/Core/API/APIModels.swift:543` plus two tests). The adversarial refuter
caught it and the deletion was reversed. Related: [[lesson_unexercised_guard]],
[[gotcha_check_measures_what_you_think]], [[feedback_adversarial_verification_pays]].

**Second zsh shape, same false-absence failure (2026-09-04, factory review):** an unquoted
variable holding a FILE LIST does not word-split in zsh. `D="a.md b.md c.md"` then
`grep -l "$pat" $D` passes ONE argument named `a.md b.md c.md`, matches no file, and prints
nothing — again indistinguishable from "searched them, found nothing". It made a
prior-art sweep across nine review documents return NONE for every probe, including topics
I could see in those files by hand. Use an array: `D=(a.md b.md); grep -l "$pat" "${D[@]}"`.
Same positive-control rule applies: probe for a string you know is there before believing a
zero.

**Third shape (2026-10-24, brand-logo-v2-3 close-out):** one unmatched glob aborts the WHOLE
command, hiding the other globs' matches. `ls "$TMPDIR"/ship-rundir-*.pid /tmp/ship-rundir-*.pid`
printed only `no matches found: /tmp/ship-rundir-*.pid`, while `$TMPDIR` held a live factory
run's pid file. Check each location in its own command (or add the `(N)` glob qualifier).
