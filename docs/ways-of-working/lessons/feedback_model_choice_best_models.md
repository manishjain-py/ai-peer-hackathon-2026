---
name: feedback-model-choice-best-models
description: Manish's explicit call (2026-08-18) — always the best models, Opus 5 / Fable at MAX effort; never propose downgrading model or effort to save tokens
metadata:
  type: feedback
---

During the 2026-08-18 Claude Code setup review, the doc-backed recommendation "default to Sonnet 5 + default effort to stretch the weekly limit" was **explicitly declined**: *"model defaults i prefer as best - opus 5 and fable at max efforts."*

**Why:** Output quality is the product. Manish accepts the token/quota cost; efficiency must come from setup hygiene (startup context, dead memory, background jobs), never from weaker models or lower effort.

**How to apply:**
- Defaults stay: `ANTHROPIC_MODEL=opus[1m]` / settings `model: "opus[1m]"` (the `opus` alias resolves to Opus 5) and `effortLevel: "max"` (set 2026-08-18, synced to all machines). Spawned sessions get max via mac-terminal-control; Fable is chosen per session when wanted.
- Never re-propose Sonnet/Haiku or reduced effort as a savings measure. Only mention a smaller model if he asks for savings himself.
- Cache discipline instead: pick model + effort at session start and keep them — a mid-session `/model` or `/effort` flip rewrites the ~55k cached prefix each time.
- Related: [[model_per_machine_env_var]], [[feedback_claude_code_provider]]

**Which of the two for which phase (Manish, 2026-10-05, the content-factory build):** *"Fable 5.1 is only till freezing the design and approach for execution we will use Opus 5.5"*. So on a big build: the interview, design and review sessions run on Fable at max effort; once the design is frozen, the controller and every implementation session run on Opus 5.5 at max effort (`--model "claude-opus-5-5[1m]" --effort max`). Stated for that build; ask before assuming it for another. See [[project_llm_content_factories]].
