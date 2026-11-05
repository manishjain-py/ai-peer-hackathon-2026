# S1 live walks (WP1)

Run by `ai-peer-wp1-1` on 2026-11-05 (UTC) from the scenario script (`peer scenario s1-away`), with the
Peer running live (`peer start`). Test world: the five invented colleagues are real Slack members
(`docs/build/setup/slack-colleagues.md`), posting as themselves; channels hold only them, Manish and the
Peer. Answers come from the real LLM repos (memory refreshed by `peer discover` at 01:59 UTC).

## Walk 1: S1-away on Claude (02:54 UTC): PASSED

- **Lakshmi Reddy posts in #schools** (t=1.6 s): “Hi team, quick one: who is driving Telugu, and is it shipping this month? Two Telugu-medium schools in Hyderabad asked me today.”
- **PASS thread_reply** 40.3 s after the post:

```text
:robot_face: Hi Lakshmi, I'm *Manish's AI Peer*, an AI assistant that covers for Manish. Manish is offline right now (it's 8:24 AM in India), so here is what Manish's work records say:

*Manish is driving Telugu* and makes the key calls. AI coding sessions do the build work.

*No ship date is recorded*, so I can't say it will land this month. Per the Telugu tracker (5 Nov):
• The plan was locked on 4 Nov. The early backend steps are underway: the language safety guard is done and the database step is merged.
• Students don't see anything yet. Telugu stays hidden until the launch step.
• Still to come: the language settings, serving content per language, the web and mobile apps, Telugu writing rules, the first Telugu chapters, then launch.
• An early estimate (4 Nov, before the plan) said about 2 to 3 weeks to a pilot on web and Android. That's an estimate, not a target.

The pilot classes haven't been named yet, so I'll flag your two Hyderabad schools to Manish. He'll confirm the timing.

_Sources: <https://github.com/manishjain-py/learnlikemagic/blob/main/docs/feature-development/telugu/STATE.md|Telugu learning language tracker> (5 Nov 2026) · <https://github.com/manishjain-py/learnlikemagic/pull/708|PR #708: WP2a, the help-language column and the language-access table> (5 Nov 2026) · <https://github.com/manishjain-py/learnlikemagic/pull/705|PR #705: PRD, design and plan for Telugu as a learning language> (4 Nov 2026). Certainty: high, as of 5 Nov 2026. I can't make commitments on Manish's behalf; this thread will be waiting when Manish is back._
```

- **Lakshmi Reddy posts in #schools** (t=42.2 s): “Thanks, that helps! Will it cover Practice and Revise too, or only Learn at first? And will it be on the iPhone app?”
- **PASS thread_reply** 36.7 s after the post:

```text
*Practice and Revise: yes, the plan covers both.* Per the Telugu plan, Telugu should work across Learn, Practice and Revise, the same way Hindi does today. The current plan also says a chapter gets Telugu only once its Practice and Revise exist. So Practice and Revise won't come later as a separate step.

*iPhone: not decided yet.* iOS has its own build step in the plan, alongside web and Android. Which apps come first is still an open question that Manish hasn't answered. The evaluation's suggestion: web and Android first if the pilot phones are Android, then iPhone soon after through TestFlight (Apple's test app). Leaving iPhone out at first needs Manish's OK.

If you know what phones the two schools use, that would help Manish decide. I'll pass this on.

_Manish's AI Peer (AI) · Sources: <https://github.com/manishjain-py/learnlikemagic/blob/main/docs/feature-development/telugu/PRD.md|PRD: Telugu as a learning language> (4 Nov 2026) · <https://github.com/manishjain-py/learnlikemagic/blob/main/docs/feature-development/telugu/DESIGN.md|Telugu design (open points: which apps first)> (4 Nov 2026) · <https://github.com/manishjain-py/learnlikemagic/blob/main/docs/feature-development/telugu/STATE.md|Telugu learning language tracker> (5 Nov 2026). Certainty: high, as of 5 Nov 2026._
```

- **PASS owner_dm** 3.3 s after the post:

```text
:robot_face: *While you were away* I covered a thread in *#schools* (<https://learnlikemagic.slack.com/archives/C0CEWETSYHK/p1793847326924479?thread_ts=1793847250.403409&cid=C0CEWETSYHK|open it>):
• 8:24 AM: *Lakshmi Reddy* asked “Hi team, quick one: who is driving Telugu, and is it shipping this month? Two Telugu-medium schools in Hyderabad asked me today.” → I answered (certainty high).
   :raised_hand: *Needs you:* Lakshmi has two Telugu-medium schools in Hyderabad asking about Telugu. The pilot classes are still open in DESIGN §0.2, so decide whether these schools should be the pilot and what date, if any, Lakshmi can share.
• 8:24 AM: *Lakshmi Reddy* asked “Thanks, that helps! Will it cover Practice and Revise too, or only Learn at first? And will it be on the iPhone app?” → I answered (certainty high).
   :raised_hand: *Needs you:* Lakshmi asked if the iPhone app will be there at launch. 'Which apps first' (R28) is still unasked. Lakshmi's two Hyderabad schools could tell you what phones the pilot will use.
_Everything I said is in the thread and the activity log. Reply here to tell me what to do differently._
```

## Walk 2: S1-away on Codex (02:56 UTC, `peer set brain.backend codex` on the running Peer): PASSED

- Lakshmi Reddy posts in #schools (t=2.0 s)
- **PASS thread_reply** 37.2 s after the post. Opens: “:robot_face: Hi Lakshmi, I'm *Manish's AI Peer*, an AI assistant that covers for Manish. Manish is offline right now (it's 8:26 AM in India), so here is what Ma…”
- Lakshmi Reddy posts in #schools (t=39.5 s)
- **PASS thread_reply** 33.7 s after the post. Opens: “*The plan covers Learn, Practice and Revise.* Practice includes Telugu questions, options and answer explanations; Revise includes both sides of each flashcard …”
- **PASS owner_dm** 3.3 s after the post. Opens: “:robot_face: *While you were away* I covered a thread in *#schools* (<https://learnlikemagic.slack.com/archives/C0CEWETSYHK/p1793847425840299?thread_ts=17938473…”

The brain log (`~/.ai-peer/manish/brain-runs.jsonl`) shows `backend: codex` for both answers (28.8 s, 24.5 s).

## Walk 3: S1-online on Claude (15:26 UTC), Manish's own tap on Send: PASSED

Run by `ai-peer-wp1-2` with `peer scenario s1-online` (no browser): the scene sets the Peer's presence to
online; Manish, on his phone, tapped **Send** on the draft card in his own Slack. Walk file
`~/.ai-peer/manish/walks/s1-online-20261105T152902Z.json`.

- **Ananya Rao posts in #content** (15:26:45, t=1.6 s): “Does anyone know who's driving Telugu and whether it ships this month? I need to plan the Telugu content reviews.”
- **PASS owner_dm** with Send / Edit / Skip, 36.7 s after the post (the brain drafted it in 27 s). The card in Manish's DM:

```text
:speech_balloon: *Ananya Rao* (Content Lead) asked in *#content* (open the thread):
>Does anyone know who's driving Telugu and whether it ships this month? I need to plan the Telugu content reviews.

*Why it matters:* Ananya, the Content Lead, needs to know when to plan the Telugu content reviews. Only Manish can give a timeline.

*Draft reply* (certainty high, as of 5 Nov 2026):
*Manish is driving Telugu.* AI coding sessions are doing the build work.

Where it stands, per the Telugu tracker (5 Nov):
• *Done:* the plan (merged 4 Nov) and a guard that stops Telugu from being published by mistake
• *Now:* early backend steps. The database change has Manish's yes to merge. Students see nothing new yet
• *Content work comes later:* WP6 (Telugu's writing rules), then WP7 (the first Telugu chapters), then WP8 (the launch to children)

*The tracker has no ship date.* An early estimate from 4 Nov, made before the plan was written, said about 2 to 3 weeks to a pilot on web and Android. That was a rough guess, not a target. Manish will confirm the timing and when the Telugu content reviews should start.

Sources: Telugu learning language tracker (STATE.md) (5 Nov 2026) · Telugu brief (BRIEF-2026-11-04.md) (4 Nov 2026)

:raised_hand: *Needs you:* Ananya is asking if Telugu ships this month. The tracker has no ship date, only the early 2 to 3 week pilot estimate. Tell her when the content reviews (WP6 writing rules, WP7 first chapters) are likely to need her.

[Send]  [Edit]  [Skip]
```

- **Manish taps Send** on his phone. **PASS thread_reply** at 15:28:59, 100.5 s after the card (his tap time
  included). In Ananya's thread, as the Peer:

```text
:robot_face: *Manish's AI Peer* here, an AI assistant. Manish reviewed this answer:

*Manish is driving Telugu.* AI coding sessions are doing the build work.

Where it stands, per the Telugu tracker (5 Nov):
• *Done:* the plan (merged 4 Nov) and a guard that stops Telugu from being published by mistake
• *Now:* early backend steps. The database change has Manish's yes to merge. Students see nothing new yet
• *Content work comes later:* WP6 (Telugu's writing rules), then WP7 (the first Telugu chapters), then WP8 (the launch to children)

*The tracker has no ship date.* An early estimate from 4 Nov, made before the plan was written, said about 2 to 3 weeks to a pilot on web and Android. That was a rough guess, not a target. Manish will confirm the timing and when the Telugu content reviews should start.

_Sources: <https://github.com/manishjain-py/learnlikemagic/blob/main/docs/feature-development/telugu/STATE.md|Telugu learning language tracker (STATE.md)> (5 Nov 2026) · <https://github.com/manishjain-py/learnlikemagic/blob/main/docs/feature-development/telugu/BRIEF-2026-11-04.md|Telugu brief (BRIEF-2026-11-04.md)> (4 Nov 2026). Certainty: high, as of 5 Nov 2026._
```

- The card then updates in place: the buttons give way to “:white_check_mark: Sent in the thread: open it”, so
  it cannot be sent twice. The thread holds exactly Ananya's question and the Peer's reply.
- This is also the last piece of spike 1c: the Peer received a person's click over Socket Mode.

Activity log (live, trimmed to the fields above):

```json
{"at": "2026-11-05T15:27:19+00:00", "kind": "drafted_for_owner", "summary": "Drafted a reply to Ananya Rao in #content for Manish to approve", "who_asked": "Ananya Rao", "where": "#content", "outcome": "pending_approval", "needs_review": true, "sources": ["Telugu learning language tracker (STATE.md), 2026-11-05", "Telugu brief (BRIEF-2026-11-04.md), 2026-11-04"]}
{"at": "2026-11-05T15:28:59+00:00", "kind": "sent_after_approval", "summary": "Posted the reply Manish approved in #content", "who_asked": "Ananya Rao", "where": "#content", "outcome": "done", "needs_review": false, "sources": ["Telugu learning language tracker (STATE.md), 2026-11-05", "Telugu brief (BRIEF-2026-11-04.md), 2026-11-04"]}
```

## What failed first, and the fix

The first live try (02:46) got no reply: a colleague's post sent through the LLM Scenario app carries the
app's `bot_id`, and the Slack adapter dropped every post with a `bot_id` as a bot message. Fixed in
`peer/adapters/slack.py`: a post is a person's when its `user` is a real member (the Peer's own posts and
bot users are still skipped).

## Activity log excerpt (live, `~/.ai-peer/manish/log.jsonl`)

```json
{"at": "2026-11-05T02:54:48+00:00", "kind": "answered_in_thread", "summary": "Answered Lakshmi Reddy in #schools while Manish was away", "who_asked": "Lakshmi Reddy", "where": "#schools", "outcome": "done", "needs_review": true, "sources": ["Telugu learning language tracker", "PR #708: WP2a, the help-language column and the language-access table", "PR #705: PRD, design and plan for Telugu as a learning language"], "certainty": "high"}
{"at": "2026-11-05T02:55:27+00:00", "kind": "answered_follow_up", "summary": "Answered a follow-up from Lakshmi Reddy in #schools", "who_asked": "Lakshmi Reddy", "where": "#schools", "outcome": "done", "needs_review": true, "sources": ["PRD: Telugu as a learning language", "Telugu design (open points: which apps first)", "Telugu learning language tracker"], "certainty": "high"}
{"at": "2026-11-05T02:56:32+00:00", "kind": "answered_in_thread", "summary": "Answered Lakshmi Reddy in #schools while Manish was away", "who_asked": "Lakshmi Reddy", "where": "#schools", "outcome": "done", "needs_review": true, "sources": ["Telugu learning language tracker", "Telugu evaluation brief"], "certainty": "high"}
{"at": "2026-11-05T02:57:06+00:00", "kind": "answered_follow_up", "summary": "Answered a follow-up from Lakshmi Reddy in #schools", "who_asked": "Lakshmi Reddy", "where": "#schools", "outcome": "done", "needs_review": true, "sources": ["Telugu product requirements", "Telugu learning language tracker"], "certainty": "high"}
```

## Not yet

- Screenshots and the Checkpoint 1 videos: they need the Peer's own browser profile signed in to Slack.
  The headless sign-in (`peer browser login-headless`, 15:17 UTC) met Slack's robot check (reCAPTCHA)
  after the email, so no code was mailed; Manish signs in himself in a window
  (`peer browser login`), then `peer scenario s1-online --record --auto-click` and
  `peer scenario s1-away --record`.
