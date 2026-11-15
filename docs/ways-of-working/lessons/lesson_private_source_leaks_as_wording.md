---
name: lesson-private-source-leaks-as-wording
description: "After viewing a private recording, 'made-up' data written from memory reused its exact UI copy and a role matching the real person; a grep of new files against a private term list (names, IDs and its sentences) caught it before delivery"
metadata:
  type: feedback
---

ai-peer-video-wp6 (2026-11-15) looked at a private product walkthrough (real company content, kept
out of git), then wrote the "generic" made-up data for five concept videos. The data held no names
or links, but it reused the walkthrough's own wording: the four step names, the rule sentences,
three captions, a "found, newest" format, and a job title that matched the real person's. The
controller asked for a grep against a private list of the walkthrough's terms; the list (people,
roles, projects, channels, IDs, links, and the product's own sentences) caught all of it. The
wording was rewritten and four videos re-rendered before anything reached the owner.

**Why:** a privacy rule like "its frames, its words and any detail never go into git" covers the
source's plain sentences too, and memory of a source leaks phrasing even when you mean to write
generic copy.

**How to apply:** right after viewing private material, write its distinctive terms AND its
sentences, one per line, into a file in the private folder; write made-up copy from the generic
brief in your own words, not from memory; before every delivery run
`grep -r -i -F -l -f <list>` on the new files (or `git grep` at the head, compared with the branch
base so older files' hits are told apart), and report the head sha and the result.
