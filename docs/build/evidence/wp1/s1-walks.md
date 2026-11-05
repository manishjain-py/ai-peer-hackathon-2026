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

- S1-online live (draft DM with Send / Edit / Skip, then the thread reply after Send).
- Screenshots and the Checkpoint 1 video: they need the Peer's own browser profile signed in to Slack
  (`peer browser login-headless`, the code relayed by the controller), then
  `peer scenario s1-online --record --auto-click` and `peer scenario s1-away --record`.
