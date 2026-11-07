# Slack setup (the AI Peer app)

Any Slack workspace where you may add an app (the build used a free-plan test workspace).
One app, "AI Peer", whose bot speaks as **Manish's AI Peer** (D9; for another owner,
"<Owner>'s AI Peer"). Socket Mode, so no public URL. The test world's fake colleagues post
through a separate small scenario app ([slack-colleagues.md](slack-colleagues.md)), never
through this one.

Least privilege: the bot reads channels it joins and DMs with it, posts as itself,
reacts. The **user token is `search:read` only**, so the Peer can never post as Manish.
If a later package needs more, edit the manifest here, then update the app (Slack:
App Manifest → paste → Save, then reinstall when asked).

## Manifest (YAML)

```yaml
display_information:
  name: AI Peer
  description: Manish's AI teammate. Clearly labelled as AI; answers with sources.
  background_color: "#1f5f46"
features:
  app_home:
    home_tab_enabled: false
    messages_tab_enabled: true
    messages_tab_read_only_enabled: false
  bot_user:
    display_name: "Manish's AI Peer"
    always_online: true
oauth_config:
  scopes:
    bot:
      - app_mentions:read
      - channels:history
      - channels:join
      - channels:read
      - chat:write
      - groups:history
      - groups:read
      - im:history
      - im:read
      - im:write
      - reactions:read
      - reactions:write
      - team:read
      - users:read
      - users:read.email
      - users.profile:read
    user:
      - search:read
settings:
  event_subscriptions:
    bot_events:
      - app_mention
      - member_joined_channel
      - message.channels
      - message.groups
      - message.im
  interactivity:
    is_enabled: true
  org_deploy_enabled: false
  socket_mode_enabled: true
  token_rotation_enabled: false
```

## Steps (the owner)

1. Open https://api.slack.com/apps?new_app=1, choose **From a manifest**, pick your
   workspace, Next.
2. YAML tab: replace the text with the manifest above, Next, **Create**. (If Slack
   rejects the bot name, use `Manish AI Peer`.)
3. **Basic Information** → App-Level Tokens → **Generate Token and Scopes**: name
   `socket`, scope `connections:write`, Generate. Copy the token (it starts with `xapp`).
4. **Install App** → Install to your workspace → Allow. Copy the **Bot User OAuth
   Token** (it starts with `xoxb`) and the **User OAuth Token** (it starts with `xoxp`).
5. Put them in `~/.ai-peer/.env` (`code ~/.ai-peer/.env`): `SLACK_APP_TOKEN`,
   `SLACK_BOT_TOKEN`, `SLACK_USER_TOKEN`. Never paste tokens into a chat or Telegram.

Check (prints no secret): `auth.test` with the bot and user tokens returns `ok: true`.
