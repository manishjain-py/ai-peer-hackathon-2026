# AI Peer: the live demo script (D16)

The hackathon demo: a short film opener, then S1, S2 and S3 live on this Mac, with a backup
recording ready for each scene. Rehearsed twice on 15 Nov; the backups are recorded then.

- **S1 is final**: Checkpoint 1's recorded walks 4 and 5 (6 Nov; `docs/build/evidence/wp1/s1-walks.md`).
- **S2 and S3: until its live walk.** Their lines and timings come from their dry walks (PR #3:
  `docs/build/evidence/wp3/walks.md`; PR #5: `docs/build/evidence/wp4/s3-walks.md`) and their planned
  live steps. A docs-only pass updates this file after each live walk and merge.
- Times are from the walks (UTC is irrelevant here: the presenter's clock). The slot length is not
  known yet (PLAN, Airbnb ask 7); the full run is about 13 minutes, the short cut about 7.

## Order and timings

| # | Part | Length | Short cut |
|---|---|---|---|
| 0 | Film opener | 0:45 | 0:30 |
| 1 | S1 Slack cover: online (draft, Send), then away (answer in the thread, follow-up, DM summary) | 4:00 | away only, 2:00 |
| 2 | S2 daily brief and heads-ups | 3:00 | the brief only, 1:30 |
| 3 | S3 attend a meeting | 5:00 | the update and one live answer, 2:30 |
| 4 | Close: what it never does; the porting guide | 0:45 | 0:30 |

## Before the demo (30 minutes before)

1. The Peer runs (owner `manish`, from the main checkout): `.venv/bin/python -m peer status` shows the
   owner found in Slack, presence `auto`, the brain `claude`. Do not restart it during the demo.
2. Screens, in this order on the shared display: Slack (Manish's DM with the AI Peer; #content;
   #schools), the Peer's page `http://127.0.0.1:8787` (Activity, Brief, Meetings), a terminal at the
   repo root, Zoom (the test meeting, for S3), and the backup recordings in `demo/recordings/` open in a
   player, one per scene.
3. Phone: Slack signed in as Manish (for the taps), notifications on.
4. Clean slate: `peer auto` (presence), no thread left open from a rehearsal in #content or #schools
   (start each scene in a fresh thread: the scenario posts a new message), `peer seed clean` (S2),
   `peer meeting clean` (S3: every bot out of the call).
5. Weekly usage under 90% (each brain answer is a short Opus run at effort high).

Every command below runs from the repo root as `AI_PEER_OWNER=manish .venv/bin/python -m peer <command>`.

## 0. Film opener (0:45)

A short cut from the concept film (`film/`, see `film/AGENTS.md`): the idea of a teammate that covers
for you. Cut at the 15 Nov rehearsal. Slot: `demo/recordings/opener.mp4`. Last line on screen, said by
the presenter: "This is the AI Peer, built for real this week."

## 1. S1 Slack cover (4:00)

**Online (2:00).** Say: "I'm online. A colleague asks about my work in a channel, without tagging me."

| Do | Exactly | The audience sees | When |
|---|---|---|---|
| Set online | DM the AI Peer `online` (the scenario sets the switch too, and puts it back after) | The Peer replies "OK: I'll treat you as online and show you a draft first for everything." | at once |
| Ananya asks | `peer scenario s1-online` | In #content, Ananya Rao (her own account, no app badge): "Does anyone know who's driving Telugu and whether it ships this month? I need to plan the Telugu content reviews." | t = 6 s |
| The draft | (wait; talk over it: "plain code saw it; one short AI run drafts from my real repo") | In the DM: who asked and where, *Why it matters*, the *Draft reply* with certainty and date, *Sources*, *Needs you*, and **Send / Edit / Skip** | about 37 s after the post (walk 4; limit 120 s) |
| Send | Tap **Send** on the phone (fallback: the scenario's `--auto-click`) | In Ananya's thread: ":robot_face: *Manish's AI Peer* here, an AI assistant. Manish reviewed this answer: …" with sources and certainty; the card turns into "Sent in the thread" | about 3 s after the tap |

**Away (2:00).** Say: "Now I'm away. It's late in India."

| Do | Exactly | The audience sees | When |
|---|---|---|---|
| Set away | DM `away` (the scenario sets it too) | "Got it: you're away. I'll answer what I can in threads about your work, and tell you here. Say *back* when you return." | at once |
| Lakshmi asks | `peer scenario s1-away` | In #schools, Lakshmi Reddy: "Hi team, quick one: who is driving Telugu, and is it shipping this month? Two Telugu-medium schools in Hyderabad asked me today." | t = 6 s |
| The answer | (wait; talk: "it says who it is, that I'm offline and my local time, how sure it is, as of when, the sources, and no promises") | In her thread: ":robot_face: Hi Lakshmi, I'm *Manish's AI Peer*, an AI assistant that covers for Manish. Manish is offline right now (it's … in India), so here is what Manish's work records say: …", sources with dates, certainty, "I can't make commitments on Manish's behalf" | about 37 s after the post (walk 5; limit 180 s) |
| Follow-up | (the scenario posts it) | Lakshmi in the thread: "Thanks, that helps! Will it cover Practice and Revise too, or only Learn at first? And will it be on the iPhone app?" and the Peer's answer ("*Practice and Revise:* yes, they're in the plan. …"; the iPhone: "hasn't been decided yet") | about 40 s after the follow-up |
| My DM | (show the DM) | One "While you were away" message with both questions and a "Needs you" line each | about 3 s after the second answer |
| Back | DM `back` (or `peer auto`) | "Welcome back. …" | at once |

Optional, 0:30 (F5): in the DM, `stop telling me about CI failures on drafts`; within about 30 s the Peer
confirms in one line and adds the rule to "## From your feedback" in `rules.md` (`undo` reverses it).

**Fallback:** if the draft or the answer has not come by its limit, play `demo/recordings/s1-online.mp4`
or `s1-away.mp4` and go on. Until the 15 Nov recordings exist, walks 4 and 5's videos are the backup:
`~/.ai-peer/manish/walks/s1-online-20261106T181840Z/walk.mp4` (77 s) and
`~/.ai-peer/manish/walks/s1-away-20261106T182028Z/walk.mp4` (124 s), on this Mac only.

## 2. S2 daily brief and heads-ups (3:00), until its live walk

Say: "Overnight, mail and invites came in. One is urgent." (The overnight is seeded test mail from the
invented colleagues to manish@ only; real mail stays hidden: the seeded-only view.)

| Do | Exactly | The audience sees | When |
|---|---|---|---|
| The overnight | `peer seed s2-overnight` (before the slot, so the poll has seen it) | 11 test mails and invites from the colleague aliases | about 3 minutes before |
| The heads-up | (show the DM) | ":robot_face: *Heads-up* · Rohan Gupta: Urgent: App Store rejected iOS 2.4, can you answer the reviewer today?" with why: he asked directly and it can't wait | within about 3 minutes of the seeds (dry walk: at the first poll) |
| Brief me | `brief me` (DM), or `peer brief --post` | "On it", then the brief in the DM: a first line on what is most urgent, then *While you were away*, *Email still waiting on you*, *Events and opportunities for you*, company news, each item with why it matters and one action button | about 22 s (dry walk: 21.9 s) |
| The page | open `http://127.0.0.1:8787/brief` | The same brief on the page | at once |
| Draft reply | tap **Draft reply** on Ananya's mail (page or DM) | A Gmail draft in Manish's voice, grounded in the repo, with placeholders for his decisions and "Drafted by Manish's AI Peer; Manish read it before sending." | about 20 to 40 s (one brain run) |
| Send email | tap **Send email** | "Sent"; the buttons go; logged `email_sent` | a few seconds |
| Accept | tap **Accept** on Kabir's "Language picker design review" invite | "Accepted; the organizer gets your reply"; logged `invite_accepted` | a few seconds |

Say over the waits: "Sending and accepting always ask me first. Until I lift a switch, it can only act
on these test items, never my real mail."

**Fallback:** `demo/recordings/s2-brief.mp4` (made on 15 Nov). **After:** `peer seed clean`.

## 3. S3 attend a meeting (5:00), until its live walk

Say: "I can't make the weekly product sync at 2 AM. I hand it to my Peer."

| Do | Exactly | The audience sees | When |
|---|---|---|---|
| Hand it over | `peer scenario s3-meeting --question "<a question from the audience>"` (ask the room for one question about the work first; type it in) | The Peer takes the test meeting 6 minutes out | at once |
| The update | (show the DM) | A card: "Your update for Weekly product sync is ready", the update text from memory with sources, **Approve update / Edit / Skip** | about 40 s (dry walk: 40.7 s) |
| Approve | tap **Approve update** on the phone (fallback: `--auto-click`) | "Approved. I'll play it when someone asks for you." | the clip renders in seconds |
| It joins | (switch to Zoom) | A colleague bot ("Learn Like Magic team (scripted test bot)") opens the meeting; "Manish's AI Peer" joins and says: "Hi everyone, I'm Manish's AI Peer, an AI assistant. Manish can't join this meeting, so I'm here to take notes and share Manish's update. …" | the bot joins about 75 s before the start |
| Asked for Manish | (the colleague bot, as Ananya: "Is Manish here today? What's his update this week?") | The Peer plays the approved update | at once |
| A live answer | (as David: "Who is driving the Telugu build, and when does it ship?") | A holding line, then the answer with its date and certainty; "I'll flag that for Manish" for the ship date | holding line about 3 to 4 s, answer about 7 to 8 s after the question (spike) |
| The audience's question | (as Kabir, the question typed in) | A live answer from memory, or "I'll flag that for Manish" when it has nothing solid | the same |
| A decision | (as Ananya: "We move the Hyderabad pilot review to next Thursday, and Lakshmi owns the school list.") | The Peer notes it (it does not commit Manish) | |
| The brief | (the bots leave; show the DM and the Meetings page) | *Meeting brief*: *Decisions*, *Questions for you* (each flagged), *What I said*, *Follow-ups*; "nothing it said committed you" | about 20 s after it leaves (dry walk) |

**Fallback:** `demo/recordings/s3-meeting.mp4` (made on 15 Nov). If the bot has not joined by the start
time, play it and go on. **After:** `peer meeting clean`.

## 4. Close (0:45)

Say: "It always says it's an AI, how sure it is and as of when; it never commits me; it acts only on my
word. And it is built to move: the porting guide and `port-check` take it to a company's own systems."
Show `docs/porting-guide.md` and one `peer port-check` table.

## Rehearsal (15 Nov) checklist

- Two full runs, timed, with the phone taps.
- Record each scene's backup (`demo/recordings/s1-online.mp4`, `s1-away.mp4`, `s2-brief.mp4`,
  `s3-meeting.mp4`), and cut the opener (`opener.mp4`); media goes in Git LFS.
- Note the real timings here and drop "until its live walk" where it no longer applies.
