---
name: gotcha-stale-checkout-loads-old-repo-skills
description: A session loads `.claude/skills/` from the folder it starts in; a shared checkout behind main gives a worker old skill files and scripts, and a skill that writes into its repo root then writes into that checkout and may push nothing
metadata:
  type: feedback
---

A Claude Code session loads the repo's `.claude/skills/` from the folder it starts in. Workers are often started in a
shared checkout only because it is a trusted folder, and that checkout can sit far behind `main` (learnlikemagic's was
612 commits behind on 2026-11-10). A worker that runs a repo skill from there follows the old `SKILL.md` and its old
scripts: the parity check's `detect-workflow.js` still pointed an agent at a renamed file. Some skills also write into
their repo root: `/parity-check` writes its merged ledger into `$R` and then copies only files that still match `main`,
so a stale root both writes into the shared checkout and pushes nothing.

**Why:** a skill may read current code through a fresh worktree of its own, but its instructions and scripts come from
where the session started, and its "repo root" defaults to that folder too.

**How to apply:** before launching a worker that runs a repo skill, compare the start folder with `main`
(`git -C <checkout> diff --stat HEAD origin/main -- .claude/skills/<skill>`). If they differ, brief the worker to make
its own worktree at `origin/main`, use it as the skill's root, and read the skill and its scripts from there, reaching
it by absolute paths and `git -C`, without `EnterWorktree` (see [[gotcha-worktree-guard-refuses-workflow-agents-silently]]).
Related: [[gotcha-long-lived-docs-branch-is-stale-repo]] (a stale worktree injects its old CLAUDE.md).
