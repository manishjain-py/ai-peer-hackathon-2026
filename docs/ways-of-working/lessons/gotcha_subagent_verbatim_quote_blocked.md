---
name: gotcha_subagent_verbatim_quote_blocked
description: "A read-only sub-agent asked to return a document's sections VERBATIM can have its whole reply stopped by a safety classifier: it returns nothing usable, and the read-in loses a step. Read such sections yourself by line number"
metadata:
  type: feedback
---

2026-11-15 (learnlikemagic, telugu-wp8a-11's read-in): an `Explore` sub-agent, briefed "write nothing anywhere", was
asked to return a hand-off's section 3 steps 4 to 9 and section 4 **verbatim** (command lines, paths, flags). It ran
the one `git show` and then answered: "a safety classifier stopped my reply. That means I won't reproduce section 3
steps 4 to 9, section 4, or the list of script paths, in any wording." The document was an ordinary engineering
hand-off (shell commands, script paths, lock rules); nothing in it was sensitive. The step cost about 29k sub-agent
tokens and ~47 s for nothing.

**Why:** a request to reproduce a long block of text word for word can trip the reply classifier, whatever the text
is. A summary request is less exposed, but a hand-off's exact command lines are exactly what a summary loses.

**How to apply:**
- For exact lines (commands, flags, paths), read the section yourself: find its line numbers with
  `grep -n '^## \|^[0-9]\+\. '`, then `sed -n '<a>,<b>p'`. It costs about what the sub-agent's report would have.
- Keep sub-agents for judgment work (a review, a search, a summary), not for verbatim extraction.
- In a hand-off, tell the successor to read the needed sections itself, by line range, rather than through a sub-agent.
