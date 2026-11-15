---
name: gotcha_zsh_colon_after_variable_is_a_modifier
description: "In zsh, \"$c:AGENTS.md\" applies the :A modifier (absolute path), so a git rev:path spec or host:port built from a bare variable silently breaks; brace it: \"${c}:path\""
metadata:
  node_type: memory
  type: feedback
  originSessionId: eeecc1fb-808c-4839-a73c-b18738e8f274
  modified: 2026-10-06T19:01:39.288Z
---

In zsh, a colon right after a bare variable starts a modifier when the next letter is one
(`:A`/`:a` absolute path, `:h` head, `:t` tail, `:r` root, `:e` extension, `:l` lower, `:u`
upper, ...), even inside double quotes. Seen 2026-10-06: `git cat-file -s "$c:AGENTS.md"` ran as
`<cwd>/<sha>GENTS.md` and `"$c:llm-backend/AGENTS.md"` as `<sha>lm-backend/...`; git only said
"Not a valid object name" and the byte counts came out 0.

**Why:** the failure is silent or misleading, and the script keeps going with wrong numbers.

**How to apply:** in every zsh script, brace a variable that a colon follows: `"${c}:path"`,
`"${C}:refs/heads/main"`, `"${host}:${port}"`. Related zsh traps: [[gotcha_zsh_unquoted_var_is_one_word]],
[[gotcha_zsh_path_variable_is_PATH]].
