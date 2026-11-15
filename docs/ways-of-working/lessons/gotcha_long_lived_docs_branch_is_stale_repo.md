---
name: gotcha-long-lived-docs-branch-is-stale-repo
description: "RESOLVED 2026-08-27 for agent-nav (docs are on main now; branch deleted, tip tagged). The MECHANISM still bites any worktree on a stale branch: the harness auto-injects THAT worktree's CLAUDE.md/AGENTS.md as authoritative project instructions. Never park living docs on a branch that never merges."
metadata: 
  node_type: memory
  type: project
  modified: 2026-08-27T06:40:00.000Z
  originSessionId: d0ce1a49-f28b-4f8e-adfd-2deaf81925ea
---

## ✅ RESOLVED for this initiative (2026-08-27, PR #391)

`TRACKER.md`, `PLAN.md` and the three P3 design docs now live on **main** at
`docs/feature-development/agent-navigable-codebase/`. Branch `docs/agent-navigable-codebase`
is **deleted**, worktree `.claude/worktrees/agent-nav-plan` is **removed**, PR #341 is
**closed unmerged**, and the old tip `671a854c` is preserved as tag
`archive/agent-navigable-codebase-docs-branch`. There is no longer a stale worktree to
guard against for [[project-agent-navigable-codebase]] — read and update those docs in the
same worktree as the code.

**Importing them needed a gate fix first**, which is the reusable part: the anti-gaming scan
ran `SUPPRESSION_PATTERN` over every added line with no path guard, so **any prose file that
quoted a suppression directive failed the gate as a new broad suppression.** Fixed in #391
via `is_suppressible_path` in `scripts/code_health_core.py`. If you ever import a design doc
that quotes linter directives, this is why it now passes. Note `mask_quoted_literals` blanks
**backticks** too, so only directives in *fenced code blocks* ever tripped it — 2 lines of
the 6 the handoff predicted.

## The MECHANISM still applies to any worktree on a stale branch

This is the part that is not resolved and never will be, because it is how the harness works.

**The harness auto-injects `CLAUDE.md` and `AGENTS.md` from whatever worktree you are
working in.** `cd` into a worktree on an old branch and its stale `CLAUDE.md` lands in your
context as authoritative project instructions, silently contradicting main. It arrives as a
mid-turn `<system-reminder>`, which reads exactly like current project context. **Nothing
labels it as coming from a non-main branch.**

The old branch was 125 commits behind with 261 files differing — almost none of them tracker
files. Its `CLAUDE.md` still said `tutor/agents/` and `tutor/orchestration/` "are empty",
months after that clause was removed from main. Reading it while auditing ghost paths would
have "found" a defect main does not have.

**Still live in learnlikemagic:** the main checkout often sits on a `docs/*` branch, and
`.claude/worktrees/principle-doc` sits on `docs/agent-navigable-principle`. Same exposure.

Before believing anything from such a worktree, measure the drift:

```bash
git rev-list --count <branch>..origin/main                                   # commits behind
git diff --name-only <branch> origin/main -- . ':!<the-doc-folder>' | wc -l  # unrelated files
```

If the second number is not ~0, it is a stale repo snapshot, not a docs branch.

**Why:** a handoff doc exists to be trusted by a session with no context. If reading it also
injects stale project instructions, the doc actively misleads the exact reader it was
written for.

**How to apply:** **do not park living documents on a branch that never merges** — that was
the root cause, and putting them on main dissolved it. Trackers belong on main;
learnlikemagic's `docs/feature-development/AGENTS.md` already said so. If a doc genuinely must live off-main,
put the drift warning *inside the doc, above everything else* and repeat it in the resume
prompt, because the reader cannot discover it any other way — but prefer main. Sibling of
[[gotcha-stale-main-checkout-invalidates-factory-runs]] and
[[gotcha-shared-checkout-concurrent-sessions]].
