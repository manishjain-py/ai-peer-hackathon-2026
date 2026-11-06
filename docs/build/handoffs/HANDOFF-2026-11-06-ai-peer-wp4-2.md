# Hand-off: ai-peer-wp4-2 (WP4 Meeting S3: the live walk and the merge)

For: `ai-peer-wp4-2`, Claude Opus 5.5 (1M), max effort. Written 2026-11-06 19:55 UTC by `ai-peer-wp4-1`
(context 42%, handing off before the live slot, which waits on the controller). Controller:
`ai-peer-controller-3` (window 2408), unless STATE on `origin/main` names a newer one; reach it with
SendMessage. Dated, never edited. Living state: `docs/build/STATE.md` on `origin/main`.

## Manish's words (quoted)

From the brief: "this is a hackathon, so our main idea is to make it work, and not go off track in
unimportant things like code quality, unit tests, et cetera ... we build something, we test it manually".
6 Nov, 18:20 UTC: "going to sleep now. will check back in the morning. please continue whatever work you
can in the meantime". Merge rule (D13): you merge PR #5 when the live S3 walk passes.

## Read first, in order (only these)

1. `AGENTS.md`; `docs/build/STATE.md` on `origin/main`.
2. **My brief, in full: `docs/build/handoffs/HANDOFF-2026-11-06-ai-peer-wp4-1.md`.** Every hard block,
   trap and rule in it still holds (the test meeting only, the link is a secret, never Manish's cloned
   voice, the ElevenLabs budget, the Recall credit, the live Peer is the controller's, preethi, no "Send"
   label, never Fable).
3. The evidence on branch `wp4-meeting`: `docs/build/evidence/wp4/spike.md` and `s3-walks.md`.
4. `peer/README.md`, then the code: `peer/meetings/` (cover, live, after, walk, addressed, factpack,
   listener, store, calendar), `peer/adapters/meetings.py`, `peer/adapters/voice.py`, `peer/brain/warm.py`.

## Where it stands

- Worktree `~/repos/ai-peer-wp4`, branch `wp4-meeting` at 9c79a37, pushed; **draft PR #5**. Venv is set up.
- **Spike passed** (19:15): from the end of a question, holding line heard after 3.1 to 3.9 s, answer
  after 7.3 to 8.1 s (local voices).
- **S3 dry walk passed** (19:42 to 19:47, `wp4test`, fake Slack, real Recall/Zoom/brain, local voices):
  before (card with Approve update / Edit / Skip, tap renders the clip), during (intro by voice and chat,
  the update on "what's his update", the scripted and the unscripted question answered live with
  certainty, date and flags, the decision as notes, "please ask Manish ..." as a follow-up), after (the
  brief in the DM, the memory file, the Meetings page, transcript and recording kept, every step logged).
  Also checked: the DM line `cover meeting test at 23:30 title ...`, a real Zoom link refused (CLI and
  DM), "cover for me" still the away switch, Cover meetings off refuses.
- **ElevenLabs checked**: stock voices pass, the clone and "professional" voices are refused; the walk's
  fixed lines and six scripted colleague lines are rendered and cached (`~/.ai-peer/voice-cache/`); a
  live answer on `eleven_flash_v2_5` took 2.6 s. Ledger 1,100 of 20,000 characters.
- **Spend**: Recall 2,197 bot-seconds this week in all (about 1,930 WP4's, about $0.35; stop and tell the
  controller at about $3). All 16 bots done. Weekly usage 38% at 18:53.

## Your job

1. Tell the controller you are up; wait for its "the Peer is yours" (WP3's live S2 walk goes first). Work
   on nothing that needs the live Peer before that.
2. If `origin/main` moved (WP3 merges): `git fetch origin && git merge origin/main` in `~/repos/ai-peer-wp4`
   (a merge commit, no rebase). Expect additive conflicts in `peer/notify.py`, `executor.py`, `watcher.py`,
   `jobs.py`, `__main__.py`, `defaults.yaml`, `web/app.py`, `web/layout.py`, `brain/schemas.py`,
   `SKILL.md`: keep both sides. Re-run the cheap checks: `.venv/bin/python -c "import peer.meetings.live,
   peer.meetings.walk, peer.web.app"`; `AI_PEER_OWNER=wp4test .venv/bin/python -m peer meeting cover --link
   https://zoom.us/j/81234567890 --title x` must be refused. Optional after WP3's merge: call
   `peer.meetings.calendar.offer(st, chat, owner_chat_id, ev)` for the calendar events WP3's seeded-only view
   lets through (`visible()` in WP3's `peer/brief.py`); never call the Calendar API from meetings code.
3. With the controller's word: the live Peer runs WP4's code. Stop it where it runs (`peer stop` with
   `AI_PEER_OWNER=manish` from its worktree; pid in `~/.ai-peer/manish/watch.pid`), then from
   `~/repos/ai-peer-wp4`: `AI_PEER_OWNER=manish .venv/bin/python -m peer start` (this re-points the brain
   skill links at this worktree, which now has the meeting playbooks). Check `~/.ai-peer/manish/watch.log`.
   Then `AI_PEER_OWNER=manish .venv/bin/python -m peer set voice.engine elevenlabs`. Nothing else changes;
   `meetings.join_real_meetings` stays off.
4. The live walk: `AI_PEER_OWNER=manish .venv/bin/python -m peer scenario s3-meeting --question "<an
   unscripted question you choose at walk time>"`. It hands the running Peer the test meeting 6 minutes
   out; within about a minute the Peer drafts the update and DMs Manish the card. **The tap**: Manish taps
   "Approve update" on his phone (ask through the controller, one ask, exact steps), or with the
   controller's OK, `--auto-click` clicks it in the Peer's browser profile (it belongs to the live Peer).
   The colleague bot opens the meeting about 100 s before the start; the Peer's tick joins about 75 s
   before. Then the scene plays as in the dry walk, with ElevenLabs voices.
5. Evidence into `docs/build/evidence/wp4/s3-walks.md` (test content only; never the link, meeting id or
   passcode): the numbers, a transcript excerpt (`~/.ai-peer/manish/meeting-runs/<id>/timeline.json`), the
   live DM text through the Slack API (the owner's DM history), the activity-log excerpt (that meeting's
   entries), a page screenshot of `http://127.0.0.1:8787/meetings` in a throwaway headless context (never
   tunnel the owner pages). Send the controller the recording's path
   (`~/.ai-peer/manish/meeting-runs/<id>/recording.mp4`, Recall's mixed recording; keep it out of git) for
   Checkpoint 3.
6. Merge PR #5 with a merge commit when the walk passes; STATE on `main` from a throwaway worktree (your
   row, lessons, session log); tell the controller; hand the live Peer back as it says.

## Traps found here (also in the evidence)

- **Recall bots record only after another participant joins** unless `start_recording_on: call_join`
  (set on every bot now): a bot alone in the call times out ("no one joined").
- **Spoken "Peer" is unreliable** in the low-latency transcript ("pier", "here", "ipa", dropped), and the
  local voices mangle "Manish" ("mainesh", "manny", "a niche"). The rules accept homophones, any "<name>'s
  assistant" or "the assistant", a line-initial "here who/what/...", and send an unaddressed question about
  his projects to the warm session as "maybe" (it may PASS). A lead-in ("I have a question for Manish's
  assistant") waits up to 4 s for the question, which comes as its own final. Watch the first live
  minute: ElevenLabs voices may be heard differently.
- **Recall mixes a second clip on top of one playing**: the Peer plays one clip at a time
  (`MeetingSession.play`); `DELETE output_audio` cuts within about 1 s.
- **Silence rule**: a bot leaves after `silence_detection.timeout` (420 s now) of no one else speaking.
- The webhook listener uses port 8795 (`meetings.listener_port`); the tunnel stops with the session.
- Two meetings with the same title on one day share a memory file name (`meetings/<date>-<slug>.md`): the
  later brief replaces the earlier one in memory; the page keeps both.
- The warm session is Claude-only; a Codex owner would get no live answers (not needed for the walk).
- `peer meeting clean` takes every bot out of the call; run it after any failed walk.
