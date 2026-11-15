---
name: gotcha_subagent_zsh_expansion_flag_prompt
description: "A sub-agent's Bash call using a zsh expansion flag (${(f)\"$(...)\"}) froze it on a permission prompt even in bypass mode (\"Dangerous rm operation not ruled out\"): brief every sub-agent to keep shell commands plain"
metadata:
  type: feedback
---

On 2026-10-29 (uxf-run-39, PR #660) the fresh read-only reviewer ran a read-only `git diff` over a list split with
`${(f)"$(git show --name-only ...)"}`. The safety checker could not parse it ("Dangerous rm operation not ruled out
-- the shell may read this command differently than it was parsed") and raised a permission prompt in the parent's
window, even in bypass mode. The agent sat there about 10 minutes until the controller noticed; the parent stopped it
and restarted the review.

**Why:** a background sub-agent cannot answer a prompt, and the person may be away, so one unparseable command stalls
the whole step silently.

**How to apply:** in every sub-agent brief, add: no zsh parameter-expansion flags (`${(f)...}`, `${(s:..:)...}`,
`${=var}`), no `eval`, no `rm` on a variable; pass lists with `xargs` or put complex logic in a script file and run it;
if a command prompts or is refused, rephrase it simply. Related: [[gotcha_readonly_reviewer_writes_parent_scratchpad]].
