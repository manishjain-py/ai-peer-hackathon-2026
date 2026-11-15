---
name: gotcha_zsh_colon_modifier_after_variable
description: "In zsh, `$H:llm-…` applies the `:l` (lowercase) modifier to $H and eats the colon: write `${H}:path` (e.g. `git show ${SHA}:llm-backend/…`)"
metadata:
  node_type: memory
  type: feedback
  originSessionId: 91f9a2df-cc34-4bde-8d17-75d744eae744
  modified: 2026-11-01T09:36:58.395Z
---

`H=69383812f; git show $H:llm-content-factory/x.mjs` failed with "ambiguous argument '69383812flm-content-factory/…'" (2026-11-01, PR #684): zsh read `:l` as the lowercase history modifier on `$H` (others: `:h` head, `:t` tail, `:r` root, `:e` extension, `:a` absolute, `:u` upper). Any `$VAR:<letter>…` is at risk.

**How to apply:** brace the name whenever a colon follows it: `git show ${SHA}:path`, `${HOST}:${PORT}`.
