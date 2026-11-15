---
name: reference_transcript_usage_dedupe
description: "Claude Code subagent transcripts repeat message.usage on every content-block line; count once per message.id or you double-count tokens and cost"
metadata:
  type: reference
---

Claude Code writes a subagent transcript (`agent-*.jsonl`, or `<step_id>.jsonl` in the
learnlikemagic obs-store S3 archive) as one line per content block of an API response, and
every line of the same response repeats `message.usage`. Within one `message.id` the
input-side fields (`input_tokens`, `cache_creation_input_tokens`, `cache_read_input_tokens`)
are identical on every line; `output_tokens` is a running snapshot that reaches its final
value on the last line. Measured 2026-09-09 on 369 factory agents, no exception.

**Still true 2026-11-04:** one fresh subagent transcript had 166 assistant lines carrying `usage`
for 53 message ids (1 to 4 lines each), the input fields identical within an id. In the message
checked, `output_tokens` already read the same on every line; taking the max per id is right either way.

**Why:** learnlikemagic's `parse_transcript_metrics` (`workflow_obs_service.py`) sums every
line, so every token count and dollar figure in its obs store and admin dashboard is
×1.7 to ×2.1 high (explain Part 4, finding 0). On 2026-11-04 it still summed every line, so any
cost number quoted from the obs store is inflated until that fix ships.

**How to apply:** whenever you add up tokens or cost from transcripts, count the input side once
per message id and take the max output per id. A parser that does it:
`reviews/2026-09-04-explain/part-4-tokens/evidence/transcript-usage.py` in
`~/repos/llm-factory-review`; it works on any factory's transcripts. For the context a session
is using (not its cost), read only the last record: [[howto_measure_context_from_transcript]].
Background: llm-factory-review memory: project-factory-review-three-parts.md.
