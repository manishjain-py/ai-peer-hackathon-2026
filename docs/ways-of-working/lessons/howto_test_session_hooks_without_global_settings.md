# Test a session hook without touching global settings

Proven 2026-11-05 (ai-peer-wp2-1, Claude Code 2.1.318, codex-cli 0.153.4).

- **Claude Code:** pass the hook for one run only:
  `claude -p "Reply ok" --model haiku --setting-sources project --settings '{"hooks":{"SessionEnd":[{"hooks":[{"type":"command","command":"<script>","timeout":5}]}]}}' --strict-mcp-config --mcp-config '{"mcpServers":{}}' --no-session-persistence`.
  The SessionEnd hook fires; its stdin JSON has session_id, transcript_path, cwd, hook_event_name, reason.
  Nothing in ~/.claude/settings.json (a link into ~/claude-config, synced to every Mac) changes.
- **Codex:** `codex exec` fired no hook in five tries (`-c hooks.SessionEnd=...`, `-c features.hooks=true`,
  `-c bypass_hook_trust=true`, a `hooks.json` in a private `CODEX_HOME`). Exec may skip session hooks; prove a
  Codex hook in an interactive session instead.
- `codex exec` in a fresh `CODEX_HOME` hangs reading stdin: always give it `< /dev/null`.
- A global hook command must do nothing where its script is missing (other Macs):
  `test -x "$HOME/<script>" && "$HOME/<script>" || true`.
