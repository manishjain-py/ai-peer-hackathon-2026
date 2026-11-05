# WP3 evidence: Google + S2 daily brief and heads-ups

Written by `ai-peer-wp3-1`. Times UTC. No real mail, event or Doc title or text appears here:
the items are the seeded test world (invented colleagues) plus real GitHub facts from the LLM
repo, as in WP1's evidence.

## Walk 1: S2 dry run (5 Nov, 16:58 to 17:00)

`AI_PEER_OWNER=wp3test .venv/bin/python -m peer scenario s2-brief --dry-run`: test owner `wp3test`
(small profile, memory from `discover --no-ai`), fake Slack, fake Google, the real brain (Claude,
Opus, effort high). Transcript: `~/.ai-peer/wp3test/walks/s2-brief-dryrun-20261105T165959Z.json`.

| Step | What happened | Pass |
|---|---|---|
| Seed | The overnight from `s2-overnight.yaml` into the fake Google: 11 items (3 waiting, 1 urgent, 2 announcements, 3 events, 2 invites) | yes |
| Poll | 11 events, all seeded; **1 heads-up at once**: "Rohan Gupta: Urgent: App Store rejected iOS 2.4, can you answer the reviewer today?" with "asked you directly, and it can't wait. I'm telling you now instead of waiting for your next brief." | yes |
| "brief me" in the DM | "On it" reply, then the brief in **21.9 s** (brain 19.8 s): 10 items in 4 sections, each with a reason and one action; the urgent mail is not in the sections (it shows under "While you were away" as the heads-up sent); the ads webinar left out ("doesn't fit Manish's work or interests") | yes |
| Draft reply (Ananya) | A Gmail draft in Manish's voice, grounded in the repo (PR #713 still a draft, Telugu not yet in the app), with bracketed placeholders for his three decisions and the line "Drafted by Manish's AI Peer; Manish read it before sending."; the brief DM updated, the draft posted in its thread with Send email / Discard; logged `email_drafted` (needs review) | yes |
| Send email | Sent after the second tap; the draft message lost its buttons; logged `email_sent` | yes |
| Accept (Kabir's invite) | Accepted; "the organizer gets your reply"; logged `invite_accepted` | yes |
| Hard block | `google.show_real_items` on for one check, a real-looking (not seeded) mail arrives, a brief without AI lists it, Draft reply is **refused**: "Not done: the test guard allows this only on seeded test items"; logged `blocked`; the setting back off | yes |

The brief in the DM (Slack text, the first lines):

```
:sunrise: *Good evening, Manish.* The iOS 2.4 App Store rejection is most urgent tonight; three emails also wait on your reply.
*While you were away*
*1.* App Store rejected iOS 2.4: Rohan needs a reviewer reply today
_Heads-up sent_ · Rohan asked you directly to answer Apple's reviewer today; the iOS 2.4 release is blocked until someone replies. I already sent you a heads-up.
*Email still waiting on you*
*2.* Ananya asks: start Telugu Class 6 science teacher review Monday?        [Draft reply]
_Email · Ananya Rao_ · Ananya wants a yes before Monday to start two pilot-school teachers on three chapters each; the Telugu review waits on you.
...
*Events and opportunities for you*
*5.* Language picker design review, Fri 6 Nov, 11 AM                          [Accept]
_Invite · Kabir Mehta_ · Tomorrow morning: Kabir walks through the Hindi and Telugu picker before it ships in the student app.
```

The page after the taps: [s2-dry-brief-page.png](s2-dry-brief-page.png) (`/brief?dry=1&id=b20261105T165857Z` on port 8789).

Activity log (`~/.ai-peer/wp3test/dryrun/log.jsonl`):

```
16:58:57 told_owner        dry_run          Told you: Rohan Gupta: Urgent: App Store rejected iOS 2.4, can you answer the reviewer today?
16:58:57 owner_instruction done             Manish said “brief me”
16:59:19 brief_sent        dry_run          Sent your brief: The iOS 2.4 App Store rejection is most urgent tonight; three emails also wait on your reply.
16:59:57 email_drafted     pending_approval Drafted a reply to Ananya Rao for Manish to check
16:59:57 email_sent        done             Sent Manish's reply to Ananya Rao after Manish's OK
16:59:57 invite_accepted   done             Accepted “Language picker design review, Fri 6 Nov, 11 AM” for Manish after Manish's OK
16:59:59 brief_sent        dry_run          Sent your brief: 4 things need you; 10 items in all.
16:59:59 blocked           skipped          Did not draft reply on “Re: your talk next month, can you confirm?”: not a seeded test item (the test guard)
```

Found and fixed after this walk: the draft's quote marks were escaped in Slack (no blockquote);
the no-AI fallback reasons used raw message text; `brief.max_items` raised from 10 to 12 so real
GitHub items are not squeezed out.
