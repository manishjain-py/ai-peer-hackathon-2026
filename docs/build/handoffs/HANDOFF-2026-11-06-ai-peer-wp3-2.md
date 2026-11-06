# Hand-off: ai-peer-wp3-2 (WP3 Google + S2, the live part)

For: `ai-peer-wp3-2`, a fresh session on the **new** Claude account on this Mac, which has only
the repo. Written 2026-11-06 17:27 UTC by `ai-peer-wp3-1`, at the request of `ai-peer-controller-2`
(the old account's weekly usage was 94%). Controller: `ai-peer-controller-2` unless STATE on
`origin/main` names a newer one; reach it with SendMessage. Dated, never edited after it is written.
The living state is `docs/build/STATE.md` on `origin/main`.

Resume from any Terminal (the controller starts it; no session was spawned):

```
cd ~/repos/ai-peer-wp3 && claude --effort max "Read docs/build/handoffs/HANDOFF-2026-11-06-ai-peer-wp3-2.md on origin/main in full; that is your job. Follow it end to end, then stop as it says."
```

## Read first, in order

1. `AGENTS.md`, then `docs/build/STATE.md` on `origin/main`.
2. The original brief, `docs/build/handoffs/HANDOFF-2026-11-05-ai-peer-wp3-1.md`: the job, the rules
   (the live Peer, test owners, no Slack posts from a test owner, preethi) and the traps all still apply.
3. PR #3's body and `docs/build/evidence/wp3/walks.md` (on the branch). `docs/build/setup/google.md`.
4. The code you will drive: `peer/adapters/google.py`, `peer/seeds.py`, `peer/google_spike.py`,
   `peer/brief.py`, `peer/web/brief_page.py` (the README lists the rest).

## Where it stands

- Worktree `~/repos/ai-peer-wp3`, branch `wp3-google-brief`, pushed at 79ee537; **draft PR #3**
  "wp3: Google + S2 daily brief". The venv `.venv` is set up.
- **Passes: the S2 dry walk** (5 Nov 16:58 to 17:00): `AI_PEER_OWNER=wp3test .venv/bin/python -m peer
  scenario s2-brief --dry-run` (fake Slack, fake Google, the real brain). The urgent seeded mail is a
  heads-up at once; "brief me" gives the brief in 22 s (4 sections, a reason and one action each; the
  off-interest webinar left out); Draft reply, Send email and Accept work on seeded items; a real mail
  is refused by the hard block. Evidence: `docs/build/evidence/wp3/walks.md` plus a page screenshot.
- **Not verified:** anything on real Google (the OAuth client does not exist yet) and the live walk.
- Test owner `wp3test`: profile `test-small.json`, `web.port 8789`, memory from `discover --no-ai`,
  dry-run state in `~/.ai-peer/wp3test/dryrun/` (page: `AI_PEER_OWNER=wp3test .venv/bin/python -m
  peer web --port 8789`, then `/brief?dry=1`).

## The defaults (keep them; each is one setting or file)

- `google.act_on_real_items: false`: the hard block. Drafts, sends and invite answers run only on seeded items.
- `google.show_real_items: false`: the seeded-only view. Real Google items are only counted anywhere:
  brief, heads-ups, memory, setup lines. Nothing real reaches the DM, the page or a recording.
- The seed ledger `~/.ai-peer/google-seeds.jsonl`: each seed's random token (the `X-AI-Peer-Seed`
  header or the invite's UID). It labels the seeds, and the hard block checks against it.
- `peer seed clean`: deletes the seeded calendar events and the Peer's drafts to the colleagues,
  closes the ledger entries, and prints the Gmail search for the seeded mail. The Peer cannot
  delete mail, on purpose.

## Next steps, in order

1. **The Google client.** `AI_PEER_OWNER=wp3test .venv/bin/python -m peer google status` shows
   `client_file: false` until Manish makes it from `setup/google.md` steps 1 to 5, through the
   controller. The file lands at `~/.ai-peer/google-client.json`.
2. **The two logins**, on the controller's "go login" (Manish at the Mac):
   `AI_PEER_OWNER=wp3test .venv/bin/python -m peer google login peer` (manish@: `gmail.readonly
   gmail.compose calendar.events drive.readonly` plus `openid email`), then `... google login seed`
   (admin@: `gmail.send` plus `openid email`). Each opens the consent page in his default browser on
   this Mac; the URL is also in `~/.ai-peer/google-login-url.txt`. He checks the account and clicks
   Continue. The command checks the signed-in account and the scopes, then saves
   `~/.ai-peer/google-token-<account>.json` (600). If Internal OAuth fails, stop and ask through the controller.
3. **The spike:** `AI_PEER_OWNER=wp3test .venv/bin/python -m peer google spike`. It prints counts,
   ids and yes/no only. It reads Gmail (history.list), Calendar (a sync token) and one Doc (markdown
   export), then sends one alias mail (ananya@) and one .ics invite (kabir@) to manish@ only.
   - `alias_from_kept: false`: tell the controller ("Send mail as" in admin@'s Gmail; it handles it).
   - `invite_in_calendar: false`: check manish@'s Calendar setting "Automatically add invitations".
   Write the results to `docs/build/evidence/wp3/spike.md` and STATE.
4. **The live Peer**, only on the controller's "the Peer is yours", after `ai-peer-wp1-2` has recorded
   S1. Stop it through its pid file (`AI_PEER_OWNER=manish .venv/bin/python -m peer stop`). Check
   that no other `peer watch` runs (`pgrep -fl "peer watch"`, read only). Then re-point the brain
   skill links here, because the build_brief and draft_email playbooks exist only on this branch:
   `AI_PEER_OWNER=manish .venv/bin/python -c "from peer.settings import get_settings; from peer.memory.layout import Memory; Memory(get_settings().owner_dir).install_skill()"`.
   Then `AI_PEER_OWNER=manish .venv/bin/python -m peer start`. **Seed only after its first Google
   poll has set the cursors**: `sqlite3 ~/.ai-peer/manish/peer.db "select adapter from cursors"`
   lists `google`. Mail sent before that is never seen, because there is no backlog by design.
5. **The live S2 walk:** `AI_PEER_OWNER=manish .venv/bin/python -m peer seed s2-overnight` (11 mails
   and invites from the aliases, to manish@ only). Within about 3 minutes Rohan's urgent mail is a
   heads-up in his DM. Then "brief me": Manish types it in his DM if he is there, otherwise
   `AI_PEER_OWNER=manish .venv/bin/python -m peer brief --post`. The brief appears in the DM and at
   http://127.0.0.1:8787/brief. On the page, tap Draft reply (Ananya), then Send email, then Accept
   (Kabir's invite). The brief is one brain run and each draft is one more; do no repeated full walks.
6. **Evidence** (seeded-only view; never a real title or text):
   - page screenshots from a throwaway headless Chrome context (not the Peer's profile);
   - the DM's text through the Slack API (`conversations.history` with the bot token), saved as text;
   - an activity-log excerpt from `~/.ai-peer/manish/log.jsonl`;
   - all of it as "Walk 2" in `walks.md`.
   Run `peer seed clean` (owner `manish`) if the controller wants the seeds gone, and tell the
   controller when you hand the Peer back.
7. **Merge:** update PR #3's body (what works, the evidence, what is not verified), then
   `gh pr ready 3` and `gh pr merge 3 --merge` (a merge commit). If `main` moved, merge `origin/main`
   in first (no rebase) and re-run the cheap checks.
8. **STATE** from a throwaway worktree (your row, the session log, lessons). Tell the controller "S2 is
   ready for Checkpoint 2, with WP2's setup page". Stop.

## Stop rules

Measure context at each milestone (the last usage record of your transcript, of 1M); at 45 to 50%
finish the step, push, hand off as `ai-peer-wp3-3`, tell the controller, and stop. Weekly usage at
milestones: at about 95%, finish the step, hand off, and stop.
