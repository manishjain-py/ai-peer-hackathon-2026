---
name: feedback_prompt_render_first
description: "For every prompt-file review, Manish wants a printable HTML render of the prompt (verbatim, pretty, line-numbered) before any findings"
metadata:
  type: feedback
---

Manish, 2026-09-07: "whenever we do the review of a prompt file, first give me an html file
for that prompt where I can read the prompt and understand what's currently there taking a
printout — the html file should be nice and pretty and easy to read on the eyes but it should
not modify the actual prompt content."

**Why:** He reads the prompt himself, on paper or on his phone, in parallel with the
reviewers, and forms his own view before hearing findings. A raw `.md` is hard on the eyes; a
reworded rendering would mislead the review.

**Extends to the shipped result (2026-09-08):** after a file's PR merges, render the shipped
prompt at the merge commit (`<stem>.shipped.prompt.html` + PDF), send it, and let him review and
give inputs BEFORE the next file's review starts.

**How to apply:** in any repo, before launching reviewers on a prompt file, render it to HTML
with the content unchanged (line-numbered, easy on the eyes), print it to PDF with headless Chrome,
and send him both. In `~/repos/llm-factory-review` the tool is `node lib/render-prompt.mjs <prompt
file> --cycle <cycle> --sha <commit> --keys <task-message keys>`; it writes
`part-3-prompts/<stem>.prompt.html` (verbatim, line-numbered, markers kept and dimmed) and refuses
a file that differs from the recorded commit. That review sent the files with SendUserFile and
recorded the rule in its `docs/part-3-prompt-review.md` §1 and its review-factory skill.
