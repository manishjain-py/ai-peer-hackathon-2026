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

## Live walk 1: PASSED (6 Nov 2026, 21:23 to 21:33 UTC)

Run by `ai-peer-wp4-2` on the live Peer (owner `manish`, pid 18558, restarted from `~/repos/ai-peer-wp4` at b29068e with its
brain skill links re-pointed there), from the same worktree:
`AI_PEER_OWNER=manish .venv/bin/python -m peer scenario s3-meeting --auto-click --question "Where is Portable Practice now, and has a next step been picked?"`
(the unscripted question chosen at walk time: not in the scene, the update, the code or the dry walk). Real Slack (Manish's DM
with the Peer), real Recall and Zoom (the test meeting "AI Peer test (Zoom)", nobody else in it), the real brain (Opus: the update
and the brief at effort high, the warm session at medium), ElevenLabs stock voices (the Peer: Matilda; the colleagues: Lily,
Eric and Chris). **The tap on "Approve update" was the scripted `--auto-click`** (the walk clicks the newest button with that
label in Manish's DM through the Peer's own browser profile; Manish was asleep, the controller gave its OK), not Manish's own
tap. Two bots, 562 bot-seconds (about $0.10). First attempt; nothing failed.

### The numbers

| Step | UTC | Detail |
|---|---|---|
| The walk hands the running Peer the meeting | 21:23:25 | start 21:29:25 (the scene's `+6m`), seeded test meeting |
| **DM 1: the update card** | **21:24:50** | the Peer's minute tick drafted it (brain 44.9 s), buttons Approve update / Edit / Skip |
| Approve update clicked (scripted) | 21:25:04 | headless, the Peer's own browser profile |
| Approved; the clip rendered | 21:25:07 | ElevenLabs, 616 characters in 2.6 s, 41.0 s of audio with the 1 s pad; the card edited to "Approved" |
| The colleague bot opens the meeting | 21:27:45 | in the call (recording) at 21:27:49 |
| The Peer's tick starts the session | 21:28:53 | listener, tunnel, warm session primed in 2.4 s |
| The Peer's bot joins | 21:29:00 | in the call at 21:29:05; intro by voice and in the meeting chat at 21:29:08, **17 s before the start** |
| "is manish here today what's his update this week" | 21:29:41.0 | the final line's arrival; **the update played 1.0 s later** (21:29:42.1; heard about 1.5 s after that) |
| David's scripted question | 21:30:36.1 | holding line 1.0 s later; **answer 21.1 s** after the final (brain 16.7 s, 4 file reads; speech 0.9 s) |
| Kabir's unscripted question | 21:31:35.6 | holding line 1.0 s later; **answer 11.7 s** after the final (brain 8.1 s, 2 file reads; speech 0.8 s) |
| David's request for Manish | 21:32:28.6 | holding line 1.0 s later; **answer 7.1 s** after the final (brain 1.9 s, no reads; speech 0.6 s) |
| The colleague bot leaves | 21:32:58 | the Peer's bot ends at 21:33:06 (everyone left); `meeting_left` 21:33:10 |
| **DM 2: the meeting brief** | **21:33:33** | transcript (10 lines) and the mixed recording fetched first; brain 19.9 s |

The ElevenLabs voices were transcribed as said ("manish's assistant" each time; the local voices had given "maines's" and
"manny's"); only "sync" came back as "sink". **The live answers were slower than in the dry walk** (5.1 s from the final line
to the answer's call) and than the spike at medium (the spoken answer ready in 2 to 4 s, no tools): this time the warm session
read memory files (Grep and Read) before the first two answers, and the check after the fix (below) read 2 files on the same
question again, so the reads are the model's own choice, not the leak. The holding line covered each wait. Counted from the
question's last word (the final line arrives about 1 s after it; a clip plays about 1.5 s after its call, then its 1 s pad), the
first answer was heard after about 24 s, over the ~20 s the brief set; the second after about 15 s, the third after about 11 s.
A tuning for later is in STATE: answer from the fact pack first and read a file only when the pack lacks the answer.

### During: what was said (the Peer's own record; the colleague bot speaks as Ananya, David and Kabir)

- **Peer**: Hi everyone, I'm Manish's AI Peer, an AI assistant. Manish can't join this meeting, so I'm here to take notes and share Manish's update. If you have a question for Manish, ask me, and I'll answer what I can or flag it for Manish.
- colleague bot: hi everyone ananya here let's start the weekly product sink
- colleague bot: is manish here today what's his update this week
- **Peer**: Here is Manish's update. On Telugu as a third learning language, the groundwork, serving content per language and the factory backend are merged and deployed. The next piece, the factory workflows, is in review. No student can see Telugu yet and no ship date is recorded. An early estimate of two to three weeks to a web and Android pilot is only an estimate, not a target. On Teacher Feedback QA, six of the eight build steps are done. The seventh, the watch, is in final review. Launch comes after that, and Manish runs it himself. Nothing is visible to users yet. Manish will follow up on anything that needs him.
- colleague bot: david here
- colleague bot: i have a question for manish's assistant who is driving the telugu build and when does it ship
- **Peer**: Manish is driving the Telugu work. As of his update for this meeting on the sixth of November, the groundwork is merged and deployed and the factory workflows are in review. No ship date is recorded. There's an early guess of two to three weeks to a web and Android pilot, but that's an estimate, not a target, and Manish will confirm. _(certainty medium, not flagged; sources: Manish's approved update, Weekly product sync, Telugu tracker)_
- colleague bot: kabir here another question for manish's assistant
- colleague bot: where is portable practice now
- colleague bot: and has a next step been picked
- **Peer**: As of the tracker on the thirteenth of September, Portable Practice finished its pilot on Mac. A Grade 6 maths chapter went from sixty to a hundred and twenty questions. No next step has been picked. That record is almost two months old, so I'll flag it for Manish to confirm. _(certainty medium, flagged for Manish; sources: Portable Practice tracker)_
- colleague bot: okay let's decide we move the hyderabad pilot review to next thursday and lakshmi owns the school list everyone agree
- colleague bot: agreed and one more from manish's assistant please ask manish to confirm the telugu ship date by friday
- **Peer**: Sure, I'll pass that to Manish and ask him to confirm a Telugu ship date by Friday. As of his update on the sixth of November, no ship date is recorded. I can't commit him to one, so he'll reply himself. _(certainty high, flagged for Manish; sources: Manish's approved update, Weekly product sync)_
- colleague bot: great thanks everyone see you next week

### Before and after: the live DM (Slack API, the owner's DM history)

DM 1, posted 21:24:50 with the buttons Approve update / Edit / Skip, edited by the Peer at 21:25:07 after the tap:

```
[section] :calendar: *Weekly product sync* · 2:59 AM on Sat 7 Nov (AI Peer test (Zoom))
          You handed me this meeting. Here is the update I'd play for you when someone asks (as of 6 Nov 2026):
[section] >Here is Manish's update. On Telugu as a third learning language, the groundwork, serving content per language and the factory backend are merged and deployed. The next piece, the factory workflows, is in review. No student can see Telugu yet and no ship date is recorded. An early estimate of two to three weeks to a web and Android pilot is only an estimate, not a target. On Teacher Feedback QA, six of the eight build steps are done. The seventh, the watch, is in final review. Launch comes after that, and Manish runs it himself. Nothing is visible to users yet. Manish will follow up on anything that needs him.
[context] Sources: Telugu learning language tracker (6 Nov 2026) · PR #717 feat(telugu): WP3b, the workflows, ship-chapter and the lab mirror (6 Nov 2026) · Teacher Feedback QA tracker (6 Nov 2026) · PR #711 feat(teacher-feedback-qa): P7 the watch (6 Nov 2026)
[context] I join as *Manish's AI Peer* and say I'm your AI assistant; I answer other questions with how sure I am and flag what needs you. I never commit you to anything.
[context] :white_check_mark: Approved. I'll play it when someone asks for you.
```

DM 2, 21:33:33:

```
:robot_face: *Meeting brief* · Weekly product sync (AI Peer test (Zoom)), 2:59 AM on Sat 7 Nov
This was the weekly product sync on 6 November, about 15 minutes, run by Ananya. The Peer played Manish's update on Telugu and Teacher Feedback QA, then answered questions from David (Telugu) and Kabir (Portable Practice). The group agreed to move the Hyderabad pilot review to next Thursday and asked Manish to confirm a Telugu ship date by Friday. It was a scripted test meeting, so every team line came from one test bot and names are only as people stated them.

*Decisions*
• Move the Hyderabad pilot review to next Thursday. Words: "let's decide we move the hyderabad pilot review to next thursday ... everyone agree", answered with "agreed". (The group. The speaker who proposed it and the one who agreed did not give their names., Next Thursday (likely 12 November; the date itself was not said))
• Lakshmi owns the school list (for the Hyderabad pilot). Words: "and lakshmi owns the school list everyone agree", answered with "agreed". (The group. The speaker was not named., No date given)

*Questions for you*
• Please confirm the Telugu ship date. The records show no ship date, only an early estimate of 2 to 3 weeks to a web and Android pilot. The Peer passed this on and did not commit Manish to a date (flagged). (Asked by a team member who did not give a name, right after the Hyderabad decision)
• Where is Portable Practice now, and has a next step been picked? The Peer answered from the 13 September tracker (pilot done on Mac, a Grade 6 maths chapter went from 60 to 120 questions, no next step picked) and flagged it because that record is almost two months old. (Kabir)
• Who is driving the Telugu build and when does it ship? The Peer said Manish is driving it and no ship date is recorded. Not flagged on its own, but it ties to the ship-date request above. (David)

*What I said*
• Intro: said it is Manish's AI Peer, an AI assistant, there to take notes, share Manish's update and flag questions.
• Played the update: Telugu groundwork, per-language content serving and factory backend are merged and deployed. Factory workflows are in review. No student can see Telugu yet and no ship date is recorded. The 2 to 3 week pilot estimate is only an estimate. Teacher Feedback QA: 6 of 8 build steps done, step 7 (the watch) in final review, then launch run by Manish. Nothing is visible to users yet.
• Answered David: Manish is driving Telugu, as of 6 November. No ship date is recorded, the 2 to 3 week estimate is not a target, and Manish will confirm. Certainty medium, not flagged.
• Answered Kabir: as of the 13 September tracker, the Portable Practice pilot on Mac is done (Grade 6 maths chapter went from 60 to 120 questions) and no next step has been picked. Certainty medium, flagged because the record is old.
• Took the request to ask Manish to confirm a Telugu ship date by Friday. Said it can't commit him and that he will reply himself. Certainty high, flagged.

*Follow-ups*
• Confirm a Telugu ship date, or say plainly that there isn't one yet, and reply to the team: Manish, By Friday (likely 13 November)
• Confirm the current Portable Practice status and whether a next step has been picked (the Peer's record is from 13 September): Manish, No date given
• Own the school list for the Hyderabad pilot: Lakshmi, No date given
• Hold the Hyderabad pilot review on its new date: The team (no owner named), Next Thursday (likely 12 November)

_Your AI Peer took these notes; nothing it said committed you. Every step is in the activity log._
```

### Activity log (F4), this meeting's entries

- 21:23:25 `meeting_requested`: Will cover Weekly product sync (AI Peer test (Zoom)) at 2:59 AM on Sat 7 Nov
- 21:24:50 `meeting_update_drafted`: Drafted Manish's update for Weekly product sync to approve (sources: Telugu learning language tracker, PR #717 feat(telugu): WP3b, the workflows, ship-chapter and the lab mirror, Teacher Feedback QA tracker, PR #711 feat(teacher-feedback-qa): P7 the watch)
- 21:25:07 `meeting_update_approved`: Manish approved the update for Weekly product sync (sources: Telugu learning language tracker, PR #717 feat(telugu): WP3b, the workflows, ship-chapter and the lab mirror, Teacher Feedback QA tracker, PR #711 feat(teacher-feedback-qa): P7 the watch)
- 21:29:00 `meeting_joining`: Joining Weekly product sync as Manish's AI Peer
- 21:29:08 `meeting_joined`: Joined Weekly product sync as Manish's AI Peer and introduced itself
- 21:29:43 `meeting_update_played`: Played Manish's approved update in Weekly product sync (sources: Telugu learning language tracker, PR #717 feat(telugu): WP3b, the workflows, ship-chapter and the lab mirror, Teacher Feedback QA tracker, PR #711 feat(teacher-feedback-qa): P7 the watch)
- 21:30:58 `meeting_answered`: Answered Learn Like Magic team (scripted test bot) in Weekly product sync (sources: Manish's approved update, Weekly product sync, Telugu tracker)
- 21:31:48 `meeting_answered`: Answered Learn Like Magic team (scripted test bot) in Weekly product sync and flagged it for Manish (sources: Portable Practice tracker)
- 21:31:48 `meeting_flagged`: Flagged for Manish: kabir here another question for manish's assistant where is portable practice now and has a next step been picked
- 21:32:36 `meeting_answered`: Answered Learn Like Magic team (scripted test bot) in Weekly product sync and flagged it for Manish (sources: Manish's approved update, Weekly product sync)
- 21:32:36 `meeting_flagged`: Flagged for Manish: agreed and one more from manish's assistant please ask manish to confirm the telugu ship date by friday
- 21:33:10 `meeting_left`: Left Weekly product sync
- 21:33:33 `meeting_brief_sent`: Sent the brief for Weekly product sync (sources: AI Peer test (Zoom) transcript)

### After: memory, page, files

- The brief file `meetings/2026-11-06-weekly-product-sync.md` in Manish's memory, with its source (the test meeting's transcript)
  and date, and its line in `INDEX.md`. The brief says it was a scripted test meeting.
- The run folder `~/.ai-peer/manish/meeting-runs/<the Peer's meeting record>/` (not in git): `timeline.json`, `transcript.json`
  (10 lines), `session.json`, the raw events, and **Recall's mixed recording `recording.mp4`** (3.4 MB), kept for Checkpoint 3.
- The tunnel and the webhook listener stopped with the session (port 8795 free); the warm session closed; both bots `done`.
- `s3-live-meetings-page.png`: the Meetings page (http://127.0.0.1:8787/meetings, a throwaway headless browser, no tunnel): the
  brief, "Recording kept · Transcript: 10 lines · 3 live answers", only the label "AI Peer test (Zoom)", never the link.
- `s3-live-activity.png`: the activity page with the Meetings filter (the flagged items on top, every step below). It also shows
  the finding below: each live answer's last source ends with a "## TLDR".

### Spend

- Recall: 562 bot-seconds for this walk; 2,759 this week in all (about $0.50 at about $0.65 a bot-hour).
- ElevenLabs: 1,547 characters for this walk (the update 616 on `eleven_multilingual_v2`, Kabir's line 117, the three live
  answers 814 on `eleven_flash_v2_5`); the fixed lines and six colleague lines came from the cache. WP4's ledger 2,647 of 20,000;
  the account 16.7% used before and after.

### Finding: the brain loaded the owner's global CLAUDE.md (fixed in 51e260c)

All three live answers ended with a "## TLDR" section: the rule in Manish's own `~/.claude/CLAUDE.md` ("End EVERY response with
a `## TLDR` section"). It came after the answer's SOURCES line, so the parser put it into the last source's date, where the
activity page shows it (`s3-live-activity.png`). Nothing extra was spoken (the SAY part ends at CERTAINTY), and the brief and the
other one-shot runs (JSON schema) were clean. Tonight's three `meeting_answered` entries are the only log entries with it (S1's
Slack answers are clean).

The canary (the shared lesson's method: "a TLDR rule in your context? which instruction files? is Manish named?"), on the pinned
`claude-2.1.318` with the Peer's exact flags (`--setting-sources project`, hooks and auto-memory off, the empty MCP config,
read-only tools, `dontAsk`):

| Run | TLDR rule | Instruction files | Manish named |
|---|---|---|---|
| cwd `~/.ai-peer/manish`, the env the Peer passes on | yes | `~/.claude/CLAUDE.md` | yes |
| the same, a clean env (`env -i`) | yes | `~/.claude/CLAUDE.md` | yes |
| cwd `~/.ai-peer/wp4test`, a clean env | yes | `~/.claude/CLAUDE.md` | yes |
| cwd `~/.ai-peer/manish`, the Peer's env plus `CLAUDE_CODE_DISABLE_CLAUDE_MDS=1` | no | none | no (only the account email and the paths the harness attaches) |

WP1's canary on 4 Nov (`docs/build/evidence/wp1/spikes.md`) with the same flags was clean, so the block stopped working with no
change to the binary. `--bare` also skips CLAUDE.md, but it refuses the subscription login (API key only), so it is not used.

**The fix** (one commit): `CLAUDE_CODE_DISABLE_CLAUDE_MDS=1` in the brain's environment, in `peer/brain/runner.py` (the one-shot
runs: S1 answers, the update, the brief) and `peer/brain/warm.py` (the meeting's warm session). Checked through the Peer's own
code before the restart: the warm session's canary saw no instruction file and no TLDR rule; the runner's canary (JSON schema)
saw no TLDR rule and only the Peer's own `peer-brain` skill; one real meeting question on Manish's fact pack ("where is Portable
Practice now ...") came back clean, every field parsed, no TLDR, its source dated 2026-09-13 (8.5 s, 2 file reads). The
subscription login and the skill still work. The live Peer was restarted on the fix right after these commits (pid in STATE).
No re-walk: the fix only takes the owner's personal file out of the brain's context, and the walk's recording is clean.
