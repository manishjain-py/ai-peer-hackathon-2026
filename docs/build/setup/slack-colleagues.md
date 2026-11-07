# Slack test world: the invented colleagues

Test-world plumbing, not the product. The colleagues (`peer/scenarios/world.yaml`: Alex
Rivera, Taylor Brooks, Sam Moreno, Jordan Ellis and Riley Chen of the fictional company
Fernway) are real member accounts in a test Slack workspace, each on an email address you
control, so on stage they look like people (names, photos, no APP badge). The scenario
script posts as them through a small test-only app, **Peer Scenario (test)**, which each
colleague authorizes once (user scope `chat:write` and a few profile and channel scopes).
The Peer's own app never gets a colleague's token, and no real member of the workspace is
ever added or messaged.

## Manifest: Peer Scenario (test) (`peer world manifest` prints it)

```yaml
display_information:
  name: Peer Scenario (test)
  description: Test only. Lets the AI Peer's scenario script post as the invented Fernway colleagues.
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

If this copy and `peer world manifest` differ, use what the command prints.

## Steps (the owner, about 20 to 25 minutes)

1. **Email addresses** (3 min): every address in the test world is an `@example.com`
   placeholder: the colleagues' and the seed account's (`mail.seed_account`) in
   `world.yaml`, and the owner's `email` and `slack_email` in his profile
   (`peer/world/profiles/manish.json`). Replace them with addresses you control; the
   colleagues' must land in one mailbox you can read. For example, on a Google Workspace
   domain you run: admin.google.com → Directory → Users → the seed account → User
   information → Alternate email addresses → add `alex`, `taylor`, `sam`, `jordan`,
   `riley` → Save. As aliases of the seed account they also send S2's seed mail
   ([google.md](google.md)).
2. **Test app** (3 min): https://api.slack.com/apps?new_app=1 → From a manifest → your
   test workspace → YAML → paste the manifest above → Next → Create. On **Basic
   Information** copy the Client ID and Client Secret, run `open -e ~/.ai-peer/.env`, add
   `SLACK_SCENARIO_CLIENT_ID=…` and `SLACK_SCENARIO_CLIENT_SECRET=…`, save. (No install.)
3. **Invite** (2 min): Slack → Invite people → the five addresses → Send.
4. **Each colleague, one at a time** (5 × 3 min): first start `peer world auth` in a
   terminal and leave it running (it writes the authorize link to
   `~/.ai-peer/world-auth-link.txt` and waits, up to 90 minutes, until every colleague has
   allowed). Then for each colleague: open a new Incognito window (Cmd+Shift+N); in it,
   open the Slack invite to that address from the mailbox, Join, and sign up with the full
   name (Alex Rivera, Taylor Brooks, Sam Moreno, Jordan Ellis, Riley Chen). In the same
   window open the authorize link and click **Allow**. If Chrome warns about localhost,
   click Advanced → Proceed; the page says "Done: <name>". Close every Incognito window
   before the next colleague (they share one login).
5. Run `peer world setup`: it creates the world's channels from `world.yaml` (`#product`,
   `#design`, `#partners`, `#engineering`; `#general` is the workspace's own) with only the
   colleagues, you and the Peer, and sets each colleague's title.

Fallback if the localhost page never loads: copy the address the browser landed on (it holds
`?code=…`) and run `peer world code '<address>'` within ten minutes.
