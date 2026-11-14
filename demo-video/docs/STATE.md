# AI Peer demo video: state

Live controller: ai-peer-video-controller-1 (Terminal window 2952 on Mac 48 GB,
https://claude.ai/code/session_01Nfn5h5eNL9YLJMnBQpKKMf). It was launched unnamed from the
Learn Like Magic folder, so its window title may not carry the name; its successor is launched
by name from this repo.

## Where we are (2026-11-14 10:26 UTC)

Day one. Manish asked for a 2-minute "wow" demo video (`BRIEF-2026-11-14.md`). The controller
read the old film and the build (`PRIOR-WORK.md`), checked this Mac's tools and keys, and
started the tools research (four web researchers inside the controller's own session; three
have reported, one still runs; the report is written after the last). The interview is under
way: the video is due Thursday 19 November (`DESIGN.md` V1), with the controller's working
dates in C4. Nothing has been generated and no money has been spent.

Keys checked with free, read-only calls (values never printed): fal.ai valid (its balance
cannot be read with this key); ElevenLabs valid (plan `growing_business`, about 97% of the
character quota free, instant and professional voice cloning allowed); the Gemini API key lists
`gemini-omni-1.2-flash` (video), `lyria-3.5` (music) and `nano-banana-pro-preview` (images);
the OpenAI key lists `gpt-image-2.6-*` and no Sora model; Stability has 17 credits. fal.ai's own
catalogue and prices for the leading video models are in
`research/fal-catalogue-2026-11-14.md`. The Gemini and OpenAI keys belong to Learn Like Magic
set-ups: ask Manish before spending on them.

| Session | Window | Session URL | Worktree | Branch | PR | Job |
|---|---|---|---|---|---|---|
| ai-peer-video-controller-1 | 2952 | https://claude.ai/code/session_01Nfn5h5eNL9YLJMnBQpKKMf | `~/repos/ai-peer-hackathon-2026` (docs only) | main | none | Controller: the interview and the research |
| ai-peer-video-wp1 | 3962 | https://claude.ai/code/session_01Nfn5h7gC1ucD3V5X1FSeSk | `~/repos/ai-peer-video-wp1` (launched in the shared checkout) | video-wp1-look-test | none yet | WP1: three possible employees, the night frames, the clone shot three ways; cap $15; Fable 5.2, max effort, PID 41753 |
| ai-peer-video-wp2 | 3963 | on its window's first lines | `~/repos/ai-peer-video-wp2` (launched in the shared checkout, with `CLAUDE_NO_IDLE_PING=1`) | video-wp2-film-build | none yet | WP2: the film in code and Draft 1; cap $10; Fable 5.2, max effort, PID 48241 |

Still running:

| What | PID | Log | Stop command |
|---|---|---|---|
| A helper of controller-1 watching the September film second by second (its report becomes `demo-video/docs/DRAFT07-WATCH.md`) | inside controller-1's session (window 2952) | none | It ends by itself |

## Packages (each line is written by its own worker only)

- WP1, look pictures and hero-shot tests (`ai-peer-video-wp1`, brief
  `handoffs/HANDOFF-2026-11-14-ai-peer-video-wp1.md`, cap $15): launched 2026-11-14 10:55 UTC.
- WP2, the film in code and Draft 1 (`ai-peer-video-wp2`, brief
  `handoffs/HANDOFF-2026-11-14-ai-peer-video-wp2.md`, cap $10): launched 2026-11-14 11:30 UTC.

## Money spent

| Date (UTC) | Tool | What for | Amount |
|---|---|---|---|
| | (nothing yet) | | |

## Needs Manish

1. Nothing blocks the build. Open for him, in this order: (a) recordings from his company
   laptop by Tuesday 17 November morning, India time, into `~/.ai-peer/demo-video-private/`
   (the list is in `PLAN.md`; told to him 2026-11-14 11:28 UTC); (b) his pick among three voice
   samples, when WP2 has them; (c) his view of WP1's side-by-side clone clip; (d) Draft 1.

## Next

1. WP1 ends: read its `demo-video/look/REPORT.md` (in `~/repos/ai-peer-video-wp1` until it
   merges), look at `hero-compare.mp4` by frames, send the clip to Manish, write WP3's brief
   from the verdict (`PLAN.md`), close WP1's window, start `ai-peer-video-wp3`.
2. WP2's first milestone: send Manish the three voice samples, ask him to pick.
3. Draft 1 from WP2: look at a frame at every cut, then send it to Manish.
4. Sum the ledgers (`demo-video/ledger/*.csv`) into "Money spent" at each package's end; tell
   Manish at $50 and at $80.

## Settled, do not re-open

- See `DESIGN.md` section 0.

## Lessons

- (none yet)

## Session log

| Date (UTC) | Session | What happened | Outcome |
|---|---|---|---|
| 2026-11-14 10:18 | ai-peer-video-controller-1 | Set-up: read the old film and build, checked tools and keys on Mac 48 GB, wrote BRIEF, DESIGN and STATE, started the tools research and the interview. | In progress |
| 2026-11-14 10:26 | ai-peer-video-controller-1 | The reader of the old docs reported: saved as `PRIOR-WORK.md`. Keys checked with free calls; fal.ai's catalogue and prices saved. | Waiting on question 1 and on four researchers |
| 2026-11-14 10:39 | ai-peer-video-controller-1 | Three of four researchers reported; notes committed. Manish answered question 1: due Thursday 19 November. Working dates set (`DESIGN.md` C4). Question 2 (the budget) asked. | Waiting on question 2 and on the last researcher |
| 2026-11-14 10:43 | ai-peer-video-controller-1 | The last researcher reported; the report writer started. Manish answered question 2: Claude's own abilities first (V2), a $100 cap for now (V3). Question 3 (who is the employee in the film) asked. | Waiting on question 3 and on the report |
| 2026-11-14 10:49 | ai-peer-video-controller-1 | Manish answered question 3: C, an invented employee (V4). Question 4 (how the video is shown) asked. The controller starts the brief for the first worker: look pictures and test shots of the clone. | Waiting on question 4 and on the report |
| 2026-11-14 10:54 | ai-peer-video-controller-1 | Wrote the brief for WP1 (three possible employees, the night frames, the clone shot three ways, cap $15) from the research notes read first-hand and fal.ai's own prices. The repo is hackathon-light, so the brief was self-checked against the catalogue, with no reviewer pass. | WP1 worker being launched |
| 2026-11-14 10:55 | ai-peer-video-controller-1 | Launched ai-peer-video-wp1 (window 3962, PID 41753, Fable 5.2 at max effort) in the shared checkout with its worktree at `~/repos/ai-peer-video-wp1`; a watcher waits for its character sheet. | Worker reading its brief |
| 2026-11-14 11:00 | ai-peer-video-controller-1 | The tools report landed: `research/reports/AI video toolkit for demo film.md`. It was briefed before V2, V3 and V4, so it assumes Manish's own face and about $165 to $335; the controller read its first half and sent it to Manish with that caveat. Its open points for him: a Remotion licence ($25 a month if this is company work) or a free tool instead; the hackathon's rules and the company's policy on AI tools and brand; the fal.ai balance. | Sent to Manish |
| 2026-11-14 11:01 | ai-peer-video-controller-1 | Manish answered question 4: A, the video is the whole entry and judges watch it alone (V5). Question 5 (the hackathon's rules and scoring) asked. | Waiting on question 5 and on WP1's first pictures |
| 2026-11-14 11:07 | ai-peer-video-controller-1 | Manish answered question 5: no written rules (V6). Question 6 (what the product screens show and where they may go) asked. | Superseded by the next row: the pictures arrived first |
| 2026-11-14 11:08 | ai-peer-video-controller-1 | WP1 reported milestone 1 (its message, and the watcher): the sheet of three invented employees, made with `google/nano-banana-2.1`, $0.39 spent so far by its ledger. The controller looked at the sheet (real-looking, even light, skin tones true) and sent it to Manish as question 6, in place of the product-screens question, which moves to question 7. WP1 goes on with character A. | Waiting on question 6 and on WP1's frames and hero tests |
| 2026-11-14 11:09 | ai-peer-video-controller-1 | Manish picked employee A (V7); WP1 already uses A, so no message was sent to it. Question 7 (what the product screens show and where they may go) asked. | Waiting on question 7 and on WP1's frames and hero tests |
| 2026-11-14 11:12 | ai-peer-video-controller-1 | Manish answered question 7: B, real company content on this Mac only (V8); the rule for every session is C8 and in `demo-video/AGENTS.md`. Question 8 (the outline of the film) asked. | Waiting on question 8 and on WP1's frames and hero tests |
| 2026-11-14 11:22 | ai-peer-video-controller-1 | Manish asked whether the September film is here (yes: Draft 07, 4:23, on this Mac), then dropped the student opening (V9) and asked for a better two-minute story after a frame-by-frame watch. The controller read the film's full captions and 48 frames across it; a helper watches every second inside a scratch folder. The proposed story is saved as `STORY.md`. | The story went to Manish before the helper's watch ended |
| 2026-11-14 11:28 | ai-peer-video-controller-1 | Manish approved the story for a first draft (V10). The controller wrote `PLAN.md` and WP2's brief, chose a licence-free build (C9) and the Draft 1 voice and money split (C10). | WP2 being launched |
| 2026-11-14 11:30 | ai-peer-video-controller-1 | Launched ai-peer-video-wp2 (window 3963, PID 48241). Context at 43%: wrote `handoffs/HANDOFF-2026-11-14-ai-peer-video-controller-1.md` and started ai-peer-video-controller-2 in this repo. WP1's ledger stood at $5.03 at 11:25 UTC. | Handed off; controller-1 only waits for its film-watch helper |
