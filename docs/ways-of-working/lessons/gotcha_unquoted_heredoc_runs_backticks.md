---
name: gotcha-unquoted-heredoc-runs-backticks
description: "A heredoc left unquoted to expand one $VAR also runs every `...` in it as a command: Markdown code spans in a scripted doc edit vanished (commit ids became empty) with only a 'command not found' on stderr"
metadata:
  type: feedback
---

ai-peer-video-controller-4 (2026-11-15) wrote a Python edit script with `cat > f <<PYEOF` (unquoted, so
that `$P`, a PID, would expand). The Markdown it inserted held code spans like `` `1744557` ``: the shell
ran each as a command substitution, printed `(eval):1: command not found: 1744557`, put an empty string in
its place, and the script still ran, committed and pushed `(; branch at )` into STATE.md.

**Why:** in an unquoted heredoc, `$var`, `$(...)` and backticks all expand; escaping only some backticks
(`\``) is easy to get wrong in a long text.

**How to apply:** always quote the heredoc (`<<'EOF'`) and pass values in another way: as arguments
(`python3 edit.py "$P"`, read `sys.argv`), through the environment (`P=$P python3 edit.py`, read
`os.environ`), or by a placeholder replaced after writing. Grep the edited file for the empty traces (`()`,
`( ;`) before the commit, and read stderr of the edit run: "command not found" there means text was lost.
