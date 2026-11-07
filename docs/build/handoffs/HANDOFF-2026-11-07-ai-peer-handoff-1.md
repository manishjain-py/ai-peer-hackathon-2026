# Hand-off: ai-peer-handoff-1 (the sanitized hand-off package for Manish's Airbnb Mac)

For: `ai-peer-handoff-1`, Claude Opus 5.5 (1M), max effort, on this Mac. Written 2026-11-07 06:22 UTC by
`ai-peer-controller-4` (window 2608), your controller unless STATE on `origin/main` names a newer one; reach it
with SendMessage. Dated, never edited after it is written.

## Manish's words (verbatim, 7 Nov, 06:21 UTC; also in STATE "Manish's answers")

"Now what I want to do is, wherever we are, whatever we have done so far, I would like to wrap things up, and I
would like to now move this project over to an Airbnb laptop. We are handing it off from my personal laptop to an
Airbnb laptop, where we will do all the Airbnb-specific integrations and also make any further enhancements into
this initiative. Airbnb integrations like how it will read the code base using the Airbnb-specific GitHub and
Sourcegraph MCP, or the One Airbnb, where it can read about or understand the employee details or their team and
the tools and services that they own. Airbnb-specific Zoom, Slack account and also AirChat plugin. All those
integrations will be done by the Airbnb Mac. Let's get this repo ready for that handoff and moving it over to that
other Mac. We'll not continue any further work on this Mac. And also remove any mentions of Learn Like Magic, any
internal account details that we have, any sensitive information like that, remove everything. Okay to use my
eleven labs api key though. And still, let's treat the repo as the source of truth around what ways of working we
have on the controller session or the worker session, forty-five to fifty percent of context window handoff,
everything. It should be present within the repo itself. Initiatives, context, what is done so far, what are the
next steps, what are the learnings, et cetera, everything. And also clear instructions should be there on how the
coding agent who is working on it should go about reading and understanding everything. And once all this is done,
give me the final repo as a zip file, which I can just take to my Airbnb Mac and unzip, and that one handoff line,
which might be pointing to a file which has clear instructions on how to start working on this. Maybe put
everything in that file and give me that one-liner that I can just directly paste in the new AirChat coding
session in the Airbnb-specific Mac. Is the ask clear?"

## The job

Build one zip that Manish carries to his Airbnb Mac: a **fresh, sanitized copy of this repo** (new git history,
one commit) that a coding agent there (an "AirChat coding session", maybe not Claude Code) can pick up from the
repo alone, plus his ElevenLabs key in a separate file. Then report to the controller, which checks it and gives
Manish the zip and the one-line prompt. Nothing here touches Learn Like Magic's systems, the live Peer, or
Manish's accounts.

## Read first (only these, then the files you change)

1. `AGENTS.md`; `docs/build/STATE.md` on `origin/main` ("Where we are", "Needs Manish", "Next", "Settled",
   "Lessons", "Checkpoints").
2. `docs/build/DESIGN.md` (section 0 decisions, section 2 the adapter contract, section 6), `docs/build/PLAN.md`,
   `docs/build/PRD.md`, `docs/porting-guide.md`, `demo/script.md`, `README.md`, `peer/README.md`.
3. `docs/build/handoffs/HANDOFF-2026-11-06-ai-peer-wp5-2.md` (the next code package, written for this Mac) and
   STATE "Next" 3b and 3c (the demo package): both become next steps in the package.
4. The ways of working, from this Mac's user files (they do not travel; you vendor them):
   `~/.claude/skills/big-initiative/SKILL.md`, its `references/templates.md` and `references/sessions.md`, and
   `~/claude-config/lessons/INDEX.md` with the lesson files it names that apply to running a multi-session build.

## Working copy

- After `ai-peer-wp3-2` merges PR #3 (the controller's kickoff names the merge commit): a worktree
  `~/repos/ai-peer-handoff` on a new branch `handoff-airbnb` from that commit, no upstream:
  `git -C ~/repos/ai-peer-hackathon-2026 fetch origin && git -C ~/repos/ai-peer-hackathon-2026 worktree add --no-track -b handoff-airbnb ~/repos/ai-peer-handoff origin/main`.
  Do the sanitizing there as commits (they may be pushed to this repo's GitHub as a record: `git push -u origin
  handoff-airbnb`; that repo already holds everything you remove). Never merge it into `main`.
- The output, outside `~/repos`: `~/Desktop/ai-peer-handoff/` holding `ai-peer/` (the fresh repo) and
  `ai-peer-secrets/elevenlabs.env`, zipped as `~/Desktop/ai-peer-handoff-2026-11-07.zip`.

## What the package contains

1. **`START-HERE.md`** at the repo root: the single entry point, written for a capable agent that knows nothing.
   What the AI Peer is (one paragraph), the story so far (what was built and proven, plainly, with no personal or
   company names), the read order (short), how we work (a summary pointing to the ways-of-working doc), the
   decisions in force, the first steps on the new Mac in order (set up, the brain backend, the integrations he
   named, the rest), what needs Manish, and how to hand off. It must stand alone: the stranger test below.
2. **`docs/ways-of-working.md`**: the controller and worker model as practised here, tool-agnostic, from the
   big-initiative skill and its references: a controller plans, spawns, briefs, watches and closes worker
   sessions (one per work package: own worktree, branch and PR); the repo is the only memory (STATE, DESIGN, PLAN,
   dated hand-offs, never edited); hand off at 45 to 50% context, measured, never by feel; read-only reviewers
   attack each brief and each risky plan before a spawn, and each finding is checked in the code; usage limits
   (weekly and 5-hour; start nothing new near the limit; hand off at about 95%); merging (draft PR early; the
   worker merges when its walk passes); asking Manish (one question at a time, plain words, a recommendation;
   decide routine calls yourself, record them, tell him how to undo); waiting with a script, not by polling; times
   from the clock. Where a step uses a Claude Code feature (SendMessage, spawning Terminal windows, remote
   control, `/usage`, Telegram scripts), say what it achieves and the fallback for an agent without it (for
   example: one session at a time, hand-offs through files, asking in the chat).
3. **`docs/lessons.md`**: the lessons that still apply, each with its mechanism, sanitized: STATE "Lessons", and
   the general ones from `~/claude-config/lessons/` that matter for this build (headless brain isolation and the
   `CLAUDE_CODE_DISABLE_CLAUDE_MDS=1` finding, never pkill by pattern, a pattern also matches a session's launch
   prompt, guides walked by a stranger, a check that never failed is unproven, reviewers find real issues, times
   from the clock, exact-text edits, the owner settings copy rule, `peer start` does not re-point the brain skill
   links, Recall's recording and transcript traps, Slack's bot_id trap, headless Slack sign-in needs a person,
   and the rest you judge useful). Drop the ones only about this Mac, its Terminal, Telegram or Chrome.
4. **`docs/build/STATE.md`, reset**: a short tracker for the new Mac: where we are (what is done and proven,
   what is not), the next steps in order, what needs Manish, settled decisions, an empty session log that starts
   on the new Mac. The old one stays only in this Mac's repo.
5. **The build docs, sanitized:** DESIGN (keep decisions with their reasons; mark the ones tied to this Mac or the
   test company as "revisit on the new Mac"; Manish's quoted words may stay where they hold no company or account
   detail), PLAN (rewritten as the plan from here: the packages done, the packages next), PRD, the porting guide
   (generic; add a section "The Airbnb port" that lists the targets he named: code through GitHub and Sourcegraph
   MCP, people, teams and ownership through One Airbnb, Zoom, Slack, the AirChat plugin; as next steps, with no
   detail beyond his words), the demo script, the README files, AGENTS.md (keep the agent guide; on the new Mac
   company details may live in the repo but secrets never; the rule about Learn Like Magic production becomes
   "never touch production systems"; keep the 45 to 50% hand-off and "the repo is the only memory").
6. **Next steps as briefs:** a sanitized plan for the next code package (from the wp5-2 brief: the registry, the
   role methods, settings instead of code edits, **the privacy flaw first**: a failing backend that is not claude
   falls back to the personal Claude login, and live meeting answers always use the Claude warm session; on a
   company Mac this must be fixed before any company data flows), and for the demo package (the fact pack cut at
   24,000 characters, the demo script, page polish, recordings, the film opener). Line numbers may go; keep file
   and function names.
7. **The code, sanitized and still working:** keep every adapter, scene, `port-check`, the web page and the
   brain. Replace test-company content with a clearly fictional company (your choice of name, `example.com`
   addresses, invented projects and people): `peer/scenarios/`, `peer/world/`, profiles, seeds, fixtures,
   defaults, labels such as the test bot's name, playbook examples. Remove the hard-coded real person's name from
   the hard block and keep the block as a generic list read from settings. Keep behaviour and safety defaults.
8. **The film:** keep `film/` text (docs, scripts, the idea) sanitized like the rest, and only the latest render,
   `film/renders/ai-peer-draft-07.mp4` (23 MB): fetch just it with `git lfs pull --include="film/renders/ai-peer-draft-07.mp4" --exclude=""`.
   Drop the other LFS media (3.7 GB of drafts stay in this repo's LFS). The fresh repo uses no LFS: drop the LFS
   rules and `.lfsconfig`, and keep that one mp4 as a plain file.
9. **Drop:** `docs/build/handoffs/` (every old session hand-off), `docs/build/evidence/` (screenshots and
   transcripts of real data), account set-up records (`docs/build/setup/accounts.md`), the research and brief
   files if they cannot be sanitized without losing their point (keep what is useful, sanitized), and any file
   whose only content is about this Mac's sessions. Keep generic set-up steps (how to make a Slack app for the
   Peer, how to make a Google client) with every workspace, app, project and account id removed.
10. **`ai-peer-secrets/elevenlabs.env`**, outside the repo folder: only the line `ELEVENLABS_API_KEY=...`, copied
    with `command grep '^ELEVENLABS_API_KEY=' ~/.ai-peer/.env > <path>` (never print it, never open `.env`
    otherwise); `chmod 600`. START-HERE says to move it into `~/.ai-peer/.env` on the new Mac. No other secret
    travels.
11. **The fresh repo:** `git archive handoff-airbnb` into `~/Desktop/ai-peer-handoff/ai-peer/`, then
    `git init -b main` there and one commit with a neutral author (`git -c user.name="AI Peer" -c
    user.email="ai-peer@example.com" commit -m "..."`): never this Mac's git identity. No remote.

## Remove (the leak list; case-insensitive; every file, text and code)

Learn Like Magic in every spelling (`learnlikemagic`, `learn like magic`, `LLM` as its short name), its products
and projects (for example Telugu, Hyderabad, Portable Practice, Teacher Feedback QA, schools, chapters, the
learning-language work), every real or test-company person and alias (preethi, Ananya, Kabir, Lakshmi, David,
Rohan, and the rest you find), every email address except `example.com`, Manish's addresses, every Slack id
(team `T…`, app `A…`, user `U…`, channel `C…`/`D…`), every app, workspace, project, bot and channel name of the
test company, Google project details, Recall region, key names and bot ids, Zoom meeting ids, links and the test
meeting's name, Telegram chat ids, `claude.ai/code/session_…` links, this Mac's name and paths under the user's
home where they name accounts, the GitHub owner `manishjain-py` and repo names of the test company, personal
details (his personal Zoom, personal Gmail, time zone remarks may stay generic), budget and spend figures tied to
those accounts. Keep: Manish's first name, the product name, the AI Peer's own label ("Manish's AI Peer" may stay
or become generic: your call), Airbnb as the destination, the decisions and lessons.

## Proof (before you report)

1. **Leak scan** on `~/Desktop/ai-peer-handoff/` (the unzipped layout): `command grep -r -i -I -n -E` for every
   term class above, plus regexes for emails (`[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[a-z]{2,}` other than
   `example.com`), Slack ids (`\b[TAUCDG]0[A-Z0-9]{8,}\b`), tokens (`xox[abprs]-`, `sk-`, `ghp_`, `AIza`), and
   `session_`. Zero hits, or each hit explained as generic. List binaries (`file`) and keep none but the mp4.
2. **The code still runs:** in a scratch venv from the fresh repo (`uv venv --python 3.12 .venv && uv pip install
   --python .venv/bin/python -r requirements.txt`), `python -c` imports of every `peer` module; with
   `AI_PEER_HOME=<scratch>/home` and a test owner, `port-check --adapter fake` and the dry-run scenarios that need
   no real account; say which need accounts. Never run anything against owner `manish` or the real `~/.ai-peer`.
3. **Stranger walk:** a fresh sub-agent (write nothing outside a scratch folder) gets only the unzipped copy and
   the one-line prompt below, reads START-HERE as instructed, and reports: what the project is, what is done, the
   next three steps, how to hand off at 45 to 50%, and every gap or question. Fold the gaps; walk again if you
   changed much.
4. **Size and layout:** the zip's size, its top-level layout, the file count, and `git log` of the fresh repo.

The one-line prompt (put the same in START-HERE's first lines and report it): `Read START-HERE.md in this folder in
full and follow it: it holds the whole AI Peer project, how we work, what is done and what comes next.`

## Rules and stop

- Never: the live Peer (no `peer start`, `stop`, `scenario` without `--dry-run`, `browser`, `AI_PEER_OWNER=manish`,
  or a `peer` command without a scratch `AI_PEER_HOME`); Slack, Google, Recall or ElevenLabs calls (port-check of
  the real adapters included); writes under `~/.ai-peer`; Learn Like Magic repos; Manish's Chrome; Telegram.
- Never `pkill` by pattern; stop only PIDs you started. Exact-text edits, never `sed -i` at a searched line
  number. Times from `date -u`.
- Context: measure at each milestone from your transcript's last usage record (input + cache-read +
  cache-creation, of 1M). At 45 to 50%: finish the step, push the branch, write
  `docs/build/handoffs/HANDOFF-<date>-ai-peer-handoff-2.md` on `main` (in this repo), tell the controller, stop.
- Weekly usage at each milestone: `claude -p "/usage" --output-format text --no-session-persistence
  --strict-mcp-config`. At 90% tell the controller; at 93% finish the step and stop.
- When done: tell the controller the zip's path and size, the leak scan's result, what the code checks ran, the
  stranger walk's gaps and how you folded them, and anything you were unsure about. Ask Manish nothing directly.
