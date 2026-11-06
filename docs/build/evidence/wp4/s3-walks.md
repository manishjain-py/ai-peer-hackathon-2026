# WP4 S3 walks

## Dry walk 1: PASSED (6 Nov 2026, 19:42 to 19:47 UTC)

`AI_PEER_OWNER=wp4test .venv/bin/python -m peer scenario s3-meeting --dry-run --question "Is the iOS app release blocked on anything this week?"`
(the unscripted question chosen at walk time). Fake Slack (it records the DM and the tap); real Recall, Zoom (the test
meeting "AI Peer test (Zoom)", nobody else in it) and brain (Opus: the update and the brief at effort high, the warm
session at medium); local `say` voices. Two bots, 415 bot-seconds (about $0.07). Two earlier dry runs failed and were fixed (below).

### Before: the update and the one tap

- The Peer drafted Manish's update from memory in 40.7 s and DMed the card: "Your update for Weekly product sync is ready (Approve update / Edit / Skip)", buttons Approve update / Edit / Skip.
- The tap on Approve update (fake Slack) rendered the clip (32.32 s with the 1 s pad) and updated the card: "Approved. I'll play it when someone asks for you."
- The update as approved: "Here is Manish's update. Telugu, which Manish is driving: the first six build steps are merged and live, the latest on the sixth of November. The next step, the content factory's workflows per language, is running its checks now, and nothing waits on Manish. No launch date is recorded. Teacher Feedback QA: the review page is built but not open yet. The background watch is in review, with a small audio fix to follow it. The records show nothing about an iOS release this week. Manish will follow up on anything that needs him."

### During: what was said (the Peer's own record; the colleague bot speaks as Ananya, David and Kabir)

- **Peer**: Hi everyone, I'm Manish's AI Peer, an AI assistant. Manish can't join this meeting, so I'm here to take notes and share Manish's update. If you have a question for Manish, ask me, and I'll answer what I can or flag it for Manish.
- colleague bot: hi everyone and anya here
- colleague bot: let's start the weekly product sync
- colleague bot: is manish here today what's his update this week
- **Peer**: Here is Manish's update. Telugu, which Manish is driving: the first six build steps are merged and live, the latest on the sixth of November. The next step, the content factory's workflows per language, is running its checks now, and nothing waits on Manish. No launch date is recorded. Teacher Feedback QA: the review page is built but not open yet. The background watch is in review, with a small a
- colleague bot: david here i have a question for maines's assistant
- colleague bot: who is driving the telugu build and when does it ship
- **Peer**: Manish is driving the Telugu build. As of the tracker on the sixth of November, the first six build steps are merged and live, and the next step is running its checks now. No ship date is recorded, so I'll flag that for Manish to confirm.
- colleague bot: kabir here another question for manny's assistant is the ios app release blocked on anything this week
- **Peer**: I don't have anything in Manish's records about an iOS release this week, so I can't say whether it's blocked. The only related note, from the chapter loading tracker on the fourteenth of October, says store releases belong to the UX revamp. I'll flag this for Manish.
- colleague bot: okay let's decide we move the hyderabad pilot review to next thursday and lakshmi owns the school list everyone agree
- colleague bot: d
- colleague bot: add one more for manish's assistant
- colleague bot: please ask menish to confirm that the lubu ship date by friday
- **Peer**: Sure, I'll pass that to Manish: please confirm the Telugu ship date by Friday. As of the tracker on the sixth of November, no ship date is recorded, so Manish will confirm it himself.
- colleague bot: great thanks everyone
- colleague bot: see you next week

Live answers (from the end of the question's final transcript line to the answer clip's call; the clip is heard about 1.5 s after it, then the 1 s pad):

- "david here i have a question for maines's assistant who is driving the telugu build and when does it ship": brain 2.01 s, final to answer call 5.08 s, certainty high, flagged True, sources: Telugu learning language tracker, PR #715 feat(telugu): WP3a, the factory backend per language
- "kabir here another question for manny's assistant is the ios app release blocked on anything this week": brain 2.26 s, final to answer call 5.08 s, certainty low, flagged True, sources: Chapter Loading tracker
- "d add one more for manish's assistant please ask menish to confirm that the lubu ship date by friday": brain 2.52 s, final to answer call 5.09 s, certainty high, flagged True, sources: Telugu learning language tracker

### After: the brief

- The brief file `meetings/2026-11-06-weekly-product-sync.md` in the test owner's memory, with its source and date; the transcript (10 lines) and Recall's mixed recording kept in `~/.ai-peer/wp4test/meeting-runs/m3efc4c1a/` (not in git).
- The DM (fake Slack's record):

```
:robot_face: *Meeting brief* · Weekly product sync (AI Peer test (Zoom)), 1:12 AM on Sat 7 Nov
The weekly product sync was short, about 15 minutes, and ran well. The Peer gave Manish's update on Telugu and Teacher Feedback QA, then answered three questions. Two were about the Telugu ship date and one was about the iOS release, and all three were flagged for Manish. The group also proposed moving the Hyderabad pilot review to next Thursday, with Lakshmi owning the school list.

*Decisions*
• Move the Hyderabad pilot review to next Thursday, and Lakshmi owns the school list. The decision rests on these words: "okay let's decide we move the hyderabad pilot review to next thursday and lakshmi owns the school list everyone agree". The only reply was "d", so the transcript does not clearly show that everyone agreed. (The team (the person who said it is not named), Said on 2026-11-06. The review moves to next Thursday, probably 2026-11-12.)

*Questions for you*
• Please confirm the Telugu ship date by Friday. Flagged. The words heard were "lubu ship date", which the Peer took to mean Telugu. The records show no ship date. (The team, in the meeting)
• Who is driving the Telugu build, and when does it ship? Flagged. The Peer confirmed that Manish is driving it and said no ship date is recorded. (David)
• Is the iOS app release blocked on anything this week? Flagged. Manish's records say nothing about an iOS release this week. (Kabir)

*What I said*
• Intro: said it is Manish's AI Peer, an AI assistant, there to take notes, share Manish's update and flag questions.
• Update (played): the first six Telugu build steps are merged and live, the latest on 6 November. The next step, the content factory's workflows per language, is running its checks. No launch date is recorded. In Teacher Feedback QA, the review page is built but not open yet, and the background watch is in review with a small audio fix to follow. The records say nothing about an iOS release this week.
• Answer to David: Manish is driving Telugu, and no ship date is recorded. Flagged for Manish. Certainty high, as of 2026-11-06.
• Answer to Kabir: there is nothing in Manish's records about an iOS release this week. The only related note, in the chapter loading tracker, says store releases belong to the UX revamp. Flagged for Manish. Certainty low, as of 2026-10-14.
• Answer to the ship-date request: said it would pass to Manish the request to confirm the Telugu ship date by Friday, and that no date is recorded. Flagged for Manish. Certainty high, as of 2026-11-06.

*Follow-ups*
• Confirm the Telugu ship date to the team. This was the team's request. The Peer made no commitment.: Manish, By Friday, probably 2026-11-13
• Tell Kabir whether the iOS app release is blocked on anything this week: Manish, No date said
• Own the school list for the Hyderabad pilot: Lakshmi, Before the pilot review next Thursday, probably 2026-11-12
• Hold the Hyderabad pilot review on its new date: The team, Next Thursday, probably 2026-11-12

_Your AI Peer took these notes; nothing it said committed you. Every step is in the activity log._
```

### Activity log (F4), this meeting's entries

- 19:41:32 `meeting_requested`: Will cover Weekly product sync (AI Peer test (Zoom)) at 1:12 AM on Sat 7 Nov
- 19:42:13 `meeting_update_drafted`: Drafted Manish's update for Weekly product sync to approve (sources: Telugu learning language tracker, Teacher Feedback QA tracker, PR #715 feat(telugu): WP3a, the factory backend per language, PR #711 feat(teacher-feedback-qa): P7 the watch)
- 19:42:13 `meeting_update_approved`: Manish approved the update for Weekly product sync (sources: Telugu learning language tracker, Teacher Feedback QA tracker, PR #715 feat(telugu): WP3a, the factory backend per language, PR #711 feat(teacher-feedback-qa): P7 the watch)
- 19:42:33 `meeting_joining`: Joining Weekly product sync as Manish's AI Peer
- 19:42:39 `meeting_joined`: Joined Weekly product sync as Manish's AI Peer and introduced itself
- 19:43:12 `meeting_update_played`: Played Manish's approved update in Weekly product sync (sources: Telugu learning language tracker, Teacher Feedback QA tracker, PR #715 feat(telugu): WP3a, the factory backend per language, PR #711 feat(teacher-feedback-qa): P7 the watch)
- 19:44:04 `meeting_answered`: Answered Learn Like Magic team (scripted test bot) in Weekly product sync and flagged it for Manish (sources: Telugu learning language tracker, PR #715 feat(telugu): WP3a, the factory backend per language)
- 19:44:04 `meeting_flagged`: Flagged for Manish: david here i have a question for maines's assistant who is driving the telugu build and when does it ship
- 19:44:37 `meeting_answered`: Answered Learn Like Magic team (scripted test bot) in Weekly product sync and flagged it for Manish (sources: Chapter Loading tracker)
- 19:44:37 `meeting_flagged`: Flagged for Manish: kabir here another question for manny's assistant is the ios app release blocked on anything this week
- 19:45:24 `meeting_answered`: Answered Learn Like Magic team (scripted test bot) in Weekly product sync and flagged it for Manish (sources: Telugu learning language tracker)
- 19:45:24 `meeting_flagged`: Flagged for Manish: d add one more for manish's assistant please ask menish to confirm that the lubu ship date by friday
- 19:45:56 `meeting_left`: Left Weekly product sync
- 19:46:18 `meeting_brief_sent`: Sent the brief for Weekly product sync (sources: AI Peer test (Zoom) transcript)

### Two dry runs that failed first, and the fixes

- 19:25: Recall starts recording only when another participant joins (`start_recording_on` defaults to `participant_join`): the colleague bot, alone in the call, timed out ("no one joined") and so did the Peer. Fix: `start_recording_on: call_join` on every bot.
- 19:31: the local voices say "Manish" so that the transcript read "mainesh's assistant" and "manny's assistant", so no question matched, the Peer stayed quiet, and the colleague bot left on Recall's silence rule (240 s, ours). Fixes: any "<name>'s assistant" or "the assistant" addresses the Peer (it is the only assistant in the call); a lead-in ("I have a question for Manish's assistant") waits up to 4 s for the question, which comes as its own final; the silence limit is 420 s.

### Screenshots

- `s3-dry-meetings-page.png`: the Meetings page (the test owner's; the passing walk's brief on top; the two earlier runs below it).
- `s3-dry-activity.png`: the activity page's Meetings filter.

### ElevenLabs, checked for the live walk (6 Nov, 19:55 UTC)

The walk's fixed lines (intro, holding line, flag, no update) and its six scripted colleague lines, rendered once
with the stock voices in settings and cached in `~/.ai-peer/voice-cache/elevenlabs/` (the live walk reuses them):
2.4 to 4.0 s per clip with `eleven_multilingual_v2` (each request reads the quota first); a 182-character live
answer took 2.6 s with `eleven_flash_v2_5`. WP4's ledger: 1,100 of its 20,000 characters; the account read
16.6% used before and after. The voice checks refused Manish's clone ("Manish Jain") and a library
("professional") voice, as they must.
