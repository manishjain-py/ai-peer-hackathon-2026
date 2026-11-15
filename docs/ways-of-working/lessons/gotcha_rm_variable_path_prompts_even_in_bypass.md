---
name: gotcha_rm_variable_path_prompts_even_in_bypass
description: "A LOCAL session in bypass mode still stops on Claude Code's 'Dangerous rm operation on possibly-empty variable path' for rm -rf \"$t\"; unattended it auto-blocks after ~2 min. Brief deleting workers: literal paths, one rm per path; never answer another session's prompt by keystroke (2026-11-04)"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 8a2cded2-788a-4a74-bd9b-3c2fe5ee6cd0
  modified: 2026-11-04T03:32:49.709Z
---

On 2026-11-04 03:09 UTC `codex-factories-wp10-10` (local, bypass permissions) ran
`for d in runs .local; do t="$P1/$d"; ... rm -rf -- "$t"; done` for an approved clean-up and stopped on "Dangerous rm
operation on possibly-empty variable path" with "Claude Code will automatically block this request in 1:56, to avoid
holding up an unattended session". The controller did not press Yes in its window: it told the worker the block was
the harness's check, not Manish's no, and to re-run with literal paths
(`rm -rf -- /Users/manishjain/repos/learnlikemagic-content-lab/runs`); those ran with no prompt.

**Why:** a variable built in the same command is safe in fact, but the check cannot tell, and pressing another
session's permission prompt from a controller is a permission decision that belongs to Manish (cloud /ship-chapter
sessions are the one standing exception he gave: [[feedback_auto_approve_cloud_prompts]]).

**How to apply:** in a brief for any worker that deletes folders, require literal paths (or `"${V:?}"/…`), one rm per
path, each after its own check. If a worker sits on such a prompt, let it block and send the literal-path line.
