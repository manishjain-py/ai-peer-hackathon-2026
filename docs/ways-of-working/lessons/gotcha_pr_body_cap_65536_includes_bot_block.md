---
name: gotcha-pr-body-cap-65536-includes-bot-block
description: A GitHub PR body holds at most 65,536 characters, a bot's appended block (CodeRabbit's release notes) included; a long-running PR body must move old sections to a PR comment, word for word
metadata:
  type: feedback
---

A GitHub PR description is capped at 65,536 characters. On learnlikemagic PR #711 (2026-11-06) the body, kept as the PR's record through
nine fold rounds, reached 67,052 characters with its pending additions; CodeRabbit also rewrites its own release-notes block (about 1,000
characters) into the body after each review, so the cap is shared with the bot.

**Why:** an edit over the cap fails, and a bot's later append can fail or be cut, so the record stops updating at the worst moment (a push).

**How to apply:** keep a long-lived PR body under about 60,000 characters. When it grows past that, move the oldest settled sections word for
word into one PR comment (titled so the body can point to it), post it in the same burst as the body edit and the push, and leave a
one-line pointer in the body; GitHub's edit history keeps the old text too. Diff the live body's bot block before your edit.
