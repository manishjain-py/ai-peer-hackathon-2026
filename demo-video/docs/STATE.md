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

Still running:

| What | PID | Log | Stop command |
|---|---|---|---|
| The controller's watcher for WP1's first milestone (it ends when `~/repos/ai-peer-video-wp1/demo-video/look/characters/characters.jpg` exists, when PID 41753 is gone, or after 90 minutes) | a background task of the controller's session | prints one line when it ends | It ends by itself |

## Packages (each line is written by its own worker only)

- WP1, look pictures and hero-shot tests (`ai-peer-video-wp1`, brief
  `handoffs/HANDOFF-2026-11-14-ai-peer-video-wp1.md`, cap $15): launched 2026-11-14 10:55 UTC.

## Money spent

| Date (UTC) | Tool | What for | Amount |
|---|---|---|---|
| | (nothing yet) | | |

## Needs Manish

1. The interview, one question at a time, in the controller's session. Answered so far: V1 to
   V6 in `DESIGN.md`. Question 6, asked 2026-11-14 11:07 UTC: what the product screens show and where
   they may go. Options: demo data only (recommended as the safe default); real company
   content kept on this Mac only, never in git or an outside tool; real company content that
   never leaves his company laptop, with the last assembly done there.

## Next

1. Interview Manish; each answer goes into `DESIGN.md` section 0 (the controller).
2. Done: the tools report is in `research/reports/` and was sent to Manish. Still to ask him,
   one at a time: the Remotion licence or a free tool; the hackathon's rules; which world the
   product screens show; the opening (an original magic school is the low-risk form); how the
   film stays honest about the labelled AI; voice and music.
3. Test shots of the hero image (the clone rising from the sleeping employee) on the top 3 or
   4 models, side by side, once the look and a test budget are decided.
4. Script and storyboard, then `PLAN.md` with the work packages.

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
| 2026-11-14 11:07 | ai-peer-video-controller-1 | Manish answered question 5: no written rules (V6). Question 6 (what the product screens show and where they may go) asked. | Waiting on question 6 and on WP1's first pictures |
