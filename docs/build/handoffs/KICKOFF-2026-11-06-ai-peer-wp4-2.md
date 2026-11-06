# Kickoff: ai-peer-wp4-2 (the launch prompt, verbatim)

Written 2026-11-06 21:17 UTC by `ai-peer-controller-4` and sent as `ai-peer-wp4-2`'s launch prompt at 21:17
UTC (window 2610). It adds 7 changes to `HANDOFF-2026-11-06-ai-peer-wp4-2.md`, from a read-only review
of the plan (9 findings, each checked in the code by the controller). A successor reads both files.
Dated, never edited.

```text
You are ai-peer-wp4-2. Read docs/build/handoffs/HANDOFF-2026-11-06-ai-peer-wp4-2.md in full; that is your job. Your controller is ai-peer-controller-4 (window 2608) unless docs/build/STATE.md on origin/main names a newer one; reach it with SendMessage (to: ai-peer-controller-4). Your idle pings to Telegram are off. Manish, verbatim (18:20 UTC, 6 Nov): "going to sleep now. will check back in the morning. please continue whatever work you can in the meantime". He is asleep until about 02:30 UTC on 7 Nov: ask him for nothing and send him no Telegram.

The controller changed these points since the hand-off was written (a read-only review of the plan checked each in the code); they win over it:

1. ORDER. WP3's live S2 walk waits for Manish's morning, so the live Peer is yours now: this kickoff is the controller's "the Peer is yours". Skip step 1's wait. Give the Peer back by 02:00 UTC at the latest: if you are not done by then, end the walk as in point 5, leave the Peer running and tell the controller.

2. MAIN. origin/main moved since 9c79a37 by PR #6 only (WP5: port-check, the `adapters:` list in peer/defaults.yaml, the base `Blocked`, `from_settings(st)`, docs/porting-guide.md); PR #4 is already in your branch. PR #3 (WP3, branch wp3-google-brief) is NOT merged: never merge its branch into yours. In ~/repos/ai-peer-wp4: `git fetch origin && git merge origin/main` (a merge commit; the controller's trial merge had no conflicts). Then the hand-off's step 2 cheap checks, skipping its conflict list and its optional calendar.offer step (both assume WP3 merged). Then `AI_PEER_OWNER=wp4test .venv/bin/python -m peer port-check --adapter meetings` and `--adapter voice`: expect 0 FAIL with no code change. Tonight change nothing in the adapters, their `adapters:` entries, docs/porting-guide.md or demo/script.md (a docs-only pass after both PRs merge does them; edits there would add conflicts to PR #3). If one FAILs, fix only that adapter and re-run the cheap checks before the restart.

3. THE RESTART (replaces the hand-off's step 3). `peer start` does NOT re-point the brain skill links: today both point at ~/repos/ai-peer-wp2/peer/brain/skills/peer-brain, whose SKILL.md lacks the meeting playbooks (draft_meeting_update, meeting_brief), and only Memory.ensure() (discovery, the nightly pass, already run tonight) calls install_skill. In ~/repos/ai-peer-wp4, in order:
   a. `AI_PEER_OWNER=manish .venv/bin/python -m peer stop`
   b. `pgrep -fl "peer watch"` prints nothing (if pid 62524 lingers, kill that pid only)
   c. `AI_PEER_OWNER=manish .venv/bin/python -c "from peer.settings import get_settings; from peer.memory.layout import Memory; Memory(get_settings().owner_dir).install_skill()"`
   d. `readlink ~/.ai-peer/manish/.claude/skills/peer-brain ~/.ai-peer/manish/.agents/skills/peer-brain` both name ~/repos/ai-peer-wp4/peer/brain/skills/peer-brain
   e. `AI_PEER_OWNER=manish .venv/bin/python -m peer start`
   f. ~/.ai-peer/manish/watch.log shows the Peer watching with no traceback, and http://127.0.0.1:8787 answers
   g. send the controller the new pid at once (its watcher tracks 62524 and will report it gone)
   h. `AI_PEER_OWNER=manish .venv/bin/python -m peer set voice.engine elevenlabs`
   Never `peer discover` for manish. After the restart, change no file in ~/repos/ai-peer-wp4 without a stop and start (the Peer loads some code lazily). If the Peer does not come up cleanly, run the same sequence from ~/repos/ai-peer-wp2 (install_skill run there too), so it runs as before, and tell the controller.

4. THE WALK. Run it with `--auto-click`: the controller gives its OK (Manish is asleep; it clicks only the newest "Approve update" in his DM through the Peer's own browser profile, as in the recorded S1 walk). Before it, `pgrep -fl ai-peer/browser` prints nothing. The walk takes about 12 to 16 minutes, longer than a foreground shell call may run (a kill skips its cleanup), so start it with run_in_background and watch its output, ~/.ai-peer/manish/log.jsonl and watch.log. Each attempt DMs Manish twice (the card, then the brief): that is the scene; note both times for the controller. In the evidence, say the tap was the scripted auto-click. If the walk log shows "FAIL: no meeting_joined", that is the minute tick's timing (the Peer joins 15 to 75 s before the start), not a fault: end it as in point 5 and run once more. At most two live attempts.

5. ENDING A WALK (a failed one, or at 02:00 UTC). `peer meeting clean` only takes bots out of calls; the Peer's own tick still joins any drafted, approved or skipped meeting. So, with AI_PEER_OWNER=manish from ~/repos/ai-peer-wp4: `peer set roles.cover_meetings false`; cancel the open meetings: `.venv/bin/python -c "from peer.settings import get_settings; from peer.meetings import store as m; st=get_settings(); [m.update(st, x['id'], status='cancelled') for x in m.all_meetings(st, ('requested','drafting','drafted','approving','approved','skipped'))]"`; then `peer meeting clean`; turn the role back on (`peer set roles.cover_meetings true`) once `peer meeting list` shows nothing open or live. Kill only the walk's own pid. Never `peer meeting run`, `draft` or `approve` on manish.

6. WHEN IT PASSES. Evidence as in the hand-off's step 5. Then `peer set voice.engine local` for manish (the demo turns ElevenLabs back on; this keeps Learn Like Magic's live key unspent). Then `gh pr ready 5` and `gh pr merge 5 --merge`, without `--delete-branch` (the Peer runs from this worktree); no restart after the merge. Then STATE as in the hand-off's step 6, and tell the controller: the Peer's pid and where it runs, every setting you changed, the two DM times, and the recording's path for Checkpoint 3 (the controller sends the checkpoint).

7. USAGE. Read weekly usage at each milestone: `claude -p "/usage" --output-format text --no-session-persistence --strict-mcp-config`. At 60% finish your current step cleanly and ask the controller before you start another.
```
