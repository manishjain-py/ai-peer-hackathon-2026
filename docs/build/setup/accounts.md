# Accounts and secrets (names only; values live in ~/.ai-peer/.env)

Set up 2026-11-04 by the kickoff session with Manish's go-ahead, mostly through his
logged-in Chrome (AppleScript `execute javascript`; see the LLM repo's
`.claude/skills/ship-chapter-monitor/scripts/eval.applescript`). Every value was
checked against its API and none was printed.

| What | `.env` names | State | Notes |
|---|---|---|---|
| Slack app "AI Peer" | `SLACK_APP_ID` (A0CEE0554HM), `SLACK_TEAM_ID` (T0CEDQU5X0X), `SLACK_APP_TOKEN`, `SLACK_BOT_TOKEN`, `SLACK_USER_TOKEN` | Installed; auth.test ok; Socket Mode ok | Bot user `@manishs_ai_peer`, shown as "Manish's AI Peer". Manifest: [slack.md](slack.md). User token is `search:read` only. |
| ElevenLabs | `ELEVENLABS_API_KEY` | ok (HTTP 200) | Same key as Learn Like Magic (`llm-backend/.env`). |
| GitHub | `GITHUB_TOKEN` | ok (HTTP 200) | Manish's `gh` CLI login: full `repo` scope, so the Peer makes read calls only. |
| Recall.ai | `RECALL_BASE_URL` (https://ap-northeast-1.recall.ai), `RECALL_API_KEY` | ok (HTTP 200) | Workspace Learnlikemagic, Tokyo region, $5 credit, owner manish@learnlikemagic.com. Key "ai-peer-runtime". An unused key "ai-peer" (never displayed) can be deleted in the dashboard. Recall says its bots join Zoom with no Zoom app; spike 1d checks that against the OBF rule. |
| Zoom | (none yet) | Paid Workplace Pro, manishjain.py@gmail.com | No 40-minute cap. A test meeting (join before host on, waiting room off) is still needed for spike 1d. |
| Google | (none yet) | Workspace account manish@learnlikemagic.com | Internal OAuth client still to create (WP3). |

People: `preethi` in the Slack workspace is a **real person**. The Peer never
messages, mentions or DMs her; tests run in channels she is not in.
