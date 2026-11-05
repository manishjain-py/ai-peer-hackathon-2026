# Slack test world: the invented colleagues

Test-world plumbing, not the product. The colleagues (`peer/scenarios/world.yaml`) are
real member accounts on email aliases of learnlikemagic.com, so on stage they look like
people (names, photos, no APP badge). The scenario script posts as them through a small
test-only app, **LLM Scenario**, which each colleague authorizes once (user scope
`chat:write` and a few profile and channel scopes). The Peer's own app never gets a
colleague's token, and no real member (such as preethi) is ever added or messaged.

## Manifest: LLM Scenario (`peer world manifest` prints it)

```yaml
display_information:
  name: LLM Scenario
  description: Test only. Lets the AI Peer's scenario script post as the invented Learn Like Magic colleagues.
  background_color: "#6b746f"
oauth_config:
  redirect_urls:
    - https://localhost:8765/slack/oauth/callback
  scopes:
    user:
      - chat:write
      - channels:write
      - channels:read
      - users.profile:write
      - users:read
      - users:read.email
settings:
  org_deploy_enabled: false
  socket_mode_enabled: false
  token_rotation_enabled: false
```

## Steps (Manish, about 20 to 25 minutes)

1. **Email aliases** (3 min): admin.google.com → Directory → Users → Manish Jain → User
   information → Alternate email addresses → add `ananya`, `kabir`, `lakshmi`, `david`,
   `rohan` (@learnlikemagic.com) → Save. Mail to them lands in your inbox.
2. **Test app** (3 min): https://api.slack.com/apps?new_app=1 → From a manifest →
   learnlikemagic → YAML → paste the manifest above → Next → Create. On **Basic
   Information** copy the Client ID and Client Secret, run `open -e ~/.ai-peer/.env`, add
   `SLACK_SCENARIO_CLIENT_ID=…` and `SLACK_SCENARIO_CLIENT_SECRET=…`, save. (No install.)
3. **Invite** (2 min): Slack → Invite people → the five aliases → Send.
4. **Each colleague, one at a time** (5 × 3 min): open a new Incognito window
   (Cmd+Shift+N); in it, open the Slack invite to that alias from your Gmail, Join, and sign
   up with the full name (Ananya Rao, Kabir Mehta, Lakshmi Reddy, David Okafor, Rohan Gupta).
   In the same window open the link in `~/.ai-peer/world-auth-link.txt` and click **Allow**.
   If Chrome warns about localhost, click Advanced → Proceed; the page says "Done: <name>".
   Close every Incognito window before the next colleague (they share one login).
5. Tell the controller. The build then runs `peer world setup`: it creates `#product`,
   `#content`, `#schools`, `#engineering` with only the colleagues, you and the Peer, and sets
   each colleague's title.

Fallback if the localhost page never loads: copy the address the browser landed on (it holds
`?code=…`) and run `peer world code '<address>'` within ten minutes.
