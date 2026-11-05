# Google: the Peer's Internal OAuth client (Manish's hands, about 5 minutes)

Written 2026-11-05 by `ai-peer-controller-2` for WP3 (Google + S2 daily brief). It makes one
OAuth client of type **Desktop app**, marked **Internal** to the learnlikemagic.com Workspace,
so the Peer's sign-in never expires after 7 days and shows no "unverified app" screen (D5).
Nothing here reads any mail yet; WP3 runs the one sign-in afterwards.

Use Chrome signed in to any learnlikemagic.com account (manish@ or admin@). Not his personal Gmail.

1. Open https://console.cloud.google.com/projectcreate
   - Project name: `ai-peer`
   - Organisation and location: **learnlikemagic.com** (not "No organisation": without it,
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
6. Tell the controller "Google client done". WP3 then runs two sign-ins on this client, each a
   Google consent page for "AI Peer" in a browser window on the Mac; check the account shown
   before clicking Allow:
   - **manish@learnlikemagic.com**, for the Peer: read mail, make drafts, answer invites, read
     Docs (`gmail.readonly`, `gmail.compose`, `calendar.events`, `drive.readonly`).
   - **admin@learnlikemagic.com**, for the test script only: send the seeded test mail from the
     colleague addresses to manish@ (`gmail.send`).

If "Internal" is greyed out, the project is not in the learnlikemagic.com organisation:
make a new one in step 1 with the organisation set.
