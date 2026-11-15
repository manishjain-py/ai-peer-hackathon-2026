---
name: lesson_walk_a_guide_with_a_stranger_subagent
description: "Test a guide written for other agents by having a fresh sub-agent follow it on a plain export of only the code and the guide, and ask it for every gap; a pass alone hid 11 gaps"
metadata:
  type: feedback
---

**Seen 2026-11-06** (AI Peer build, WP5's porting walk; evidence `docs/build/evidence/wp5/porting-walk.md`
in the `ai-peer-hackathon-2026` repo). A fresh general-purpose sub-agent was asked to add a toy adapter
from the porting guide alone. Its check (`port-check`) passed on the first run, yet it listed 11 gaps.
The biggest: the check exercised only the adapter's own sample, so it could not see whether the adapter
accepts what the rest of the runtime sends.

**How to apply:**
- Give the stranger a plain export, not the repo: `git archive HEAD <code dirs> <guide> | tar -x -C <scratch>`,
  in a scratch folder outside any folder a running service scans. That means no `.git`, no build docs
  and no AGENTS.md, so it cannot learn the answer elsewhere.
- Use a fresh sub-agent, never a fork: a fork inherits your context and proves nothing.
- Write a fixed preamble that fences it. Every command starts with `cd <export> &&`, plus the env vars
  that point the app's home and owner into the export, so it holds no secrets. Name the only app
  command it may run, and say it writes only inside the export.
- Name any skeleton in the guide differently from the walk's toy system, so the walk cannot be
  copy-paste.
- Ask for the gaps in its final message: every file it opened beyond the guide, every guess, and
  everything unclear, each with a suggested fix.
- Afterwards, `diff -r` against a second untouched export, re-run its check yourself, fold the gaps
  into the guide, then delete the export.
- Cost: about 11 minutes and 130k sub-agent tokens.
