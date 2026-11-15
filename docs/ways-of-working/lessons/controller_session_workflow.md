---
name: controller-session-workflow
description: "Manish runs some Claude Code sessions as a \"controller\" to spawn/drive/manage other Claude Code sessions in separate Terminal windows on this Mac"
metadata: 
  node_type: memory
  type: user
  originSessionId: e7287459-ee1e-43e2-af4f-832749c5ef24
---

Manish sometimes designates a Claude Code session (announced explicitly, e.g. "I'll be using you to control different claude sessions on this machine") as a **controller**: its job is to open, spawn, drive, read, and close *other* Claude Code sessions running in separate Terminal.app windows, rather than editing code itself. He often does this while driving the Mac remotely from his phone via Claude Code's remote-control feature, so the controller may need to act fully on his behalf without him at the keyboard.

**Why:** lets him fan out work across multiple parallel Claude Code sessions (different repos, branches, or tasks) from one point of control, including hands-off from his phone.

**How to apply:** in a controller session, default to the **mac-terminal-control** skill for spawning/listing/closing/reading/typing-into other sessions instead of trying to shell out manually — it already handles session naming, effort level, and remote-control setup on spawn. Before sending keystrokes to another session, watch for the display-sleep gotcha: [[mac-terminal-control-display-sleep]].
