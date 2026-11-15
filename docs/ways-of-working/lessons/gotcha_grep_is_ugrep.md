---
name: gotcha_grep_is_ugrep
description: "In Claude Code's Bash tool `grep` is a ugrep wrapper: a long context pattern like `.{0,160}` fails with \"exceeds complexity limits\", and `grep -r` from a repo root silently skips git-ignored files; `command grep` avoids both"
metadata:
  type: reference
---

`grep` in the Bash tool is not the system grep. Claude Code's shell snapshot defines a `grep`
function that runs the `claude` binary as ugrep with `-G --ignore-files --hidden -I
--exclude-dir=.git …` (seen 2026-09-26 in docs-cleanup; read in the snapshot and rechecked
2026-11-04 on Mac-48-GB: `grep --version` prints ugrep 7.8.4).

**Trap 1, long patterns.** A pattern with a long bounded repeat around a match (e.g.
`grep -o '.\{0,160\}word.\{0,160\}'`) aborts with "error at position N ... exceeds complexity
limits" (exit 2) and prints nothing useful. `command grep` (macOS BSD grep) ran the same pattern
fine on 2026-11-04.

**Trap 2, ignored files (found 2026-11-04).** `--ignore-files` makes a recursive search skip what
`.gitignore` lists. From the learnlikemagic root, `grep -rl "avatar-g7mathematics-ch2-2026-09-08" .
--include="*.json"` found 0 files, while `command grep` found them under the git-ignored
`llm-content-factory/workflows/results/`. Naming the ignored folder itself as the search root does
search it. `-I` also skips binary files (5,946 against 13,128 files in that folder).

**How to apply:** for "show N characters of context around a match", use `command grep` or a short
Python snippet (`re.finditer` + slicing). To search git-ignored places (run results, `.env`, logs),
use `command grep -r` or start the search inside the ignored folder; an empty `grep -r` from a repo
root proves nothing about them. Plain `grep -n`, and `grep -o` with short patterns, work fine.
Related: learnlikemagic memory: gotcha_git_grep_e_no_backslash_classes.md (`git grep -E` is not
ugrep: `\s` and `\b` find nothing there).
