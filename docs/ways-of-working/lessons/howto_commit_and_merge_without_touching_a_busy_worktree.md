---
name: howto-commit-and-merge-without-touching-a-busy-worktree
description: While a long run (a test regression, a gate) builds from a worktree, make commits and even merges through a temporary git index, so the next fold, its reviewer and its push need not wait for the run.
metadata:
  type: reference
---

A long run that builds from a worktree (a 2-hour iOS regression, a 40-minute gate) forbids any edit there until it
ends. The next commit does not have to wait: git can build it without touching the worktree's files or its index.

- **A commit:** write the edited files outside the worktree, then
  `export GIT_INDEX_FILE=<scratch>/tmp.index; git read-tree HEAD`,
  `git update-index --cacheinfo "100644,$(git hash-object -w --path=<repo path> <scratch file>),<repo path>"`,
  `TREE=$(git write-tree); unset GIT_INDEX_FILE; C=$(git commit-tree $TREE -p HEAD -F <msg file>)`, and keep it on a
  local backup ref (`git update-ref refs/heads/backup/<name> $C`).
- **A merge:** `git merge-tree --write-tree --name-only <ours> <theirs>` (git 2.38+, exit 1 on a conflict) prints the
  merged tree and the conflicted paths; read a conflicted file with `git show <tree>:<path>`, resolve it in scratch,
  `git read-tree <tree>` into the temporary index, update the resolved file, `git write-tree`, then
  `git commit-tree <tree> -p <ours> -p <theirs>`. Check the result equals git's own merge outside the files you resolved
  (`git diff <merge-tree's tree> <commit>`).
- A fresh reviewer can read the commit (`git show <sha>:<path>`) and it can be pushed by explicit refspec
  (`git push origin <sha>:refs/heads/<branch>`, a fast-forward) while the run goes on; when the run ends,
  `git merge --ff-only <sha>` brings the worktree to it.
- Traps: a push script that refuses a dirty tree also refuses the run's own temporary edit; conflict-marker labels
  follow the names you pass (`origin/main` vs a sha), so compare files with markers removed; a shared `git fetch` by
  another session can fail "incorrect old value provided": retry.

- With `git -C <checkout>`, `hash-object -w <file>` reads a relative path against `<checkout>`, not your shell's folder:
  give absolute paths, and count the commit's files (`git diff-tree --no-commit-id --name-only -r <sha> | wc -l`)
  before you push. Otherwise every hash fails, and `commit-tree` still makes an empty commit that pushes fine
  (2026-11-14, a walk's evidence branch).

Proven 2026-11-08/09 in learnlikemagic (#723): a docs fold and a merge of `main` were built, read and pushed while the
iOS regression ran, so the CodeRabbit hour was not lost.
