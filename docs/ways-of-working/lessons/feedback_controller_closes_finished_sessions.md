---
name: feedback_controller_closes_finished_sessions
description: "Manish 2026-09-24: the controller of a multi-session build closes each worker/predecessor session as soon as it is FULLY done, without waiting for his word; never one that still has work running (workflows, lease heartbeats)"
metadata:
  type: feedback
---

The controller closes every session that is fully done (idle, its work merged or handed off, nothing of its own still running) as soon as it is done. This replaces the earlier rule "close finished sessions only on Manish's word". In learnlikemagic: principle `docs/principles/dev-workflow.md` §15 (renamed from building-major-features.md 2026-09-28, PR #510).

**Why:** finished windows piled up (twelve closed in batches on 2026-09-24) and each waited on him for no reason.

**How to apply:** per window: no `esc to interrupt` on screen; `pgrep -P <pid>` shows only Playwright/Chrome/Telegram helpers; its local servers detached (parent 1) or stopped; no in-flight workflow or lease heartbeat of its own (a session that handed off may keep workflows running: ask its successor, e.g. atf-wp9b's three workflows); then `mac-term.sh close <winid>`, verify its pid is gone and the live sessions' pids are not. Record the closures in the tracker. Related: [[feedback_stop_at_95pct_weekly_usage]], [[controller_session_workflow]].
