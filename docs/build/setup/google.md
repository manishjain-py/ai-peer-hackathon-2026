# Google: the Peer's Internal OAuth client (the owner's hands, about 5 minutes)

For S2, the daily brief (mail, calendar, docs). It makes one OAuth client of type
**Desktop app**, marked **Internal** to your Google Workspace organisation, so the Peer's
sign-in does not expire after 7 days and shows no "unverified app" screen (D5). Nothing
here reads any mail; the sign-ins come after (step 6). These steps were written and checked
but never run: the build's client was never made, so S2's live walk is still to do. At a
company, use only the mail and calendar access it allows ([the porting guide](../../porting-guide.md)).

Use a browser signed in to an account of that organisation, not a personal Gmail account (a
personal account has no organisation, so "Internal" is not offered).

1. Open https://console.cloud.google.com/projectcreate
   - Project name: `ai-peer`
   - Organisation and location: **your organisation** (not "No organisation": without it,
     "Internal" is not offered in step 3)
   - Create, then make sure the project picker at the top shows `ai-peer`.
2. Turn on four APIs. Open each link with `ai-peer` selected and click **Enable**:
   - https://console.cloud.google.com/apis/library/gmail.googleapis.com
   - https://console.cloud.google.com/apis/library/calendar-json.googleapis.com
   - https://console.cloud.google.com/apis/library/drive.googleapis.com
   - https://console.cloud.google.com/apis/library/docs.googleapis.com
3. Open https://console.cloud.google.com/auth/overview (called "Google Auth Platform"; older
   screens say "OAuth consent screen") and click **Get started**:
   - App name `AI Peer`, user support email: the signed-in account's address (the list offers
     only that one)
   - Audience: **Internal**
   - Contact email: the same address. Agree, then **Create**.
4. Open https://console.cloud.google.com/auth/clients and click **Create client**:
   - Application type: **Desktop app**, name `AI Peer desktop`, then **Create**
   - In the dialog that follows, click **Download JSON** at once (Google may not show the
     secret again later).
5. Move the downloaded file to `~/.ai-peer/google-client.json`, for example in Terminal:
   `mv ~/Downloads/client_secret_*.json ~/.ai-peer/google-client.json`
   Never paste its contents into a chat, git or Telegram.
6. Run the two sign-ins on this client: `peer google login peer`, then `peer google login seed`.
   Each opens a Google consent page for "AI Peer" in a browser window on the laptop; check the
   account shown before clicking Allow:
   - **The owner's account** (the `email` in the owner's profile), for the Peer: read mail,
     make drafts, answer invites, read Docs (`gmail.readonly`, `gmail.compose`,
     `calendar.events`, `drive.readonly`).
   - **The seed account** (`mail.seed_account` in `peer/scenarios/world.yaml`), for the test
     script only: send the seeded test mail from the colleague addresses to the owner
     (`gmail.send`).

   Both sign-ins also ask `openid email`, so each page lists one more line, "See your primary
   Google Account email address": the script checks which account signed in (the seed
   account's `gmail.send` alone cannot read its own address).

If "Internal" is greyed out, the project is not in your organisation: make a new one in
step 1 with the organisation set.
