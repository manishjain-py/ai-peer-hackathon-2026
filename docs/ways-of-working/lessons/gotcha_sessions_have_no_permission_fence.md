---
name: gotcha-sessions-have-no-permission-fence
description: "A Claude session started the ordinary way on these Macs has NO permission fence (user bypass default, tracked settings.local.json allows bare Bash); a \"run under an allowlist\" needs its own launch flags, proved live"
metadata:
  node_type: memory
  type: project
  originSessionId: c103b8d0-8b0e-44a4-86ef-9dadf40efb55
  modified: 2026-11-04T14:14:11.398Z
---

On this Mac a session started the ordinary way has no fence. `~/claude-config/settings.json` sets
`defaultMode: bypassPermissions`, learnlikemagic's `ux-feedback-controller/scripts/spawn.zsh` names no mode, and its tracked
`.claude/settings.local.json` allows bare `Bash`, `Write`, `Workflow`, `Agent` in every checkout (cloud runs need it,
so it stays). Found 2026-11-04 by the read-only check of P7's brief, each point read in the files.

**Why:** Teacher Feedback QA's design rests on "a run starts under a command allowlist, not bypass mode" (DESIGN §4 d, e).
Started the ordinary way, `qa-word` and any planted command would run unprompted, and nothing would say so.

**How to apply:** any design saying a session is limited to a list needs its launch to name its own settings and mode so
those sources do not apply; a checker suggested `--setting-sources project --settings <file> --permission-mode <a
prompting mode>`. Proved live on 2026-11-05: [[howto_fence_a_session_with_a_hook]]. Related:
[[gotcha-idle-hook-sends-last-reply-to-telegram]], [[gotcha_rm_variable_path_prompts_even_in_bypass]].
