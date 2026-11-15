# Brief: ai-peer-video-wp6, wow concepts for the AI Peer's own screens (2026-11-15)

Written by ai-peer-video-controller-4 for the worker of WP6. Dated, never edited; the living
state is `demo-video/docs/STATE.md` on `main`. Your controller is the one named at the top of
STATE.md; message it by that name.

## Manish's standing instruction (V22, in full in `../BRIEF-UI-WOW-2026-11-15.md`)

> "how do we make it super attractive? How do we make it visually very, very appealing, that people just look at it and they say: wow, this looks super, super cool?" "Feel free to use any advanced motions, 3D motion, graphics, whatever you want." "without bringing any change to the functionality. Unless you think that you can make it wow visually but you might need to make some changes to the functionality: that is also okay." "for all such scenarios, think of a super cool visual or physical representation of that scenario" "Same functionality, a different visual idea. Create a video of that idea" "come up with your four to five best ideas that you can possibly come up with. Give it your best shot."

Also binding: "First preference is to use Claude native capabilities. If that is not possible
to fulfill the requirement, then we can use any tools that you think can do that." (V2), and
"one worker at a time, on Opus 5.5" (V15).

## The job, in one line

Study the walkthrough recording and the product, then design Manish's 4 to 5 best "wow"
visual concepts for the AI Peer's screens. Each concept keeps the same functionality and is
shown as its own end-to-end walkthrough video, made by code, for his review.

## Read first (part by part; reading in full filled one worker to 37%)

1. `demo-video/docs/STATE.md` on `origin/main`: the first lines and "Where we are".
2. `demo-video/docs/BRIEF-UI-WOW-2026-11-15.md`: his words, the recording's privacy rules, and
   what the product does today (generic).
3. The recording: `~/.ai-peer/demo-video-private/ui-wow/walkthrough-2026-11-15.mp4`. It is
   81 s and silent, with captions. Look at it frame by frame where you need detail.
4. The product's screens in code: `peer/` (find the web page that draws Set up, What I
   learned, Your brief, Ask your Peer and How it works). `docs/build/PRD.md`, "Scenes", has
   the bigger scenes (meetings, Slack, the night watch, the brief).
5. `demo-video/film/README.md`: the film's renderer, which turns an HTML page into frames and
   an mp4. Reuse it, or copy what you need.

## Your working copy

Make a worktree at `/Users/manishjain/repos/ai-peer-video-wp6` with a new branch
`video-wp6-wow-concepts` from `origin/main`, upstream unset. Write nothing in the shared checkout
you start in, except the worktree creation itself. Put the concepts in `demo-video/ui-concepts/`:
one folder per concept, plus `README.md` and `REPORT.md`.

## The privacy rules (C8; they bind every helper too)

- The recording shows real company content. You may look at it: Manish asked for that.
- Its frames, its words and any detail from it (names, roles, projects, channels, links) never
  go into git or any file of the worktree. They never go to any outside tool or service:
  fal.ai, ElevenLabs, Gemini, OpenAI, Telegram, or the web.
- Notes that hold such details stay in `~/.ai-peer/demo-video-private/ui-wow/`, and so do
  frames you extract.
- The concept videos use only made-up data. Use the film's Ram and its made-up Airbnb payments
  story (`demo-video/film/screens.json`, `world.json`), with invented names only. Use generic
  source names ("Company directory", "Documents", "Slack", "Mail", "Code", "Tickets"); a
  made-up "company portal" stands in for any intranet.

## What a concept is

- **The idea.** A different visual or physical picture of the same flow, end to end: the setup
  (the four steps, the sources one by one), "What I learned", "Your brief", "Ask your Peer"
  and the rules. Manish's own example, for the setup: a mascot appears, pulls information from
  a company-portal widget and a mail widget, and visibly writes its notes. Go beyond it: motion,
  3D, physical metaphors, a character or none.
- **Function.** If a concept needs a change in function to reach the wow, it may, but say which
  change.
- **The pitch**, in `README.md`, three to five plain lines: what you see; why it is wow; what it
  would take to build into the product; what it changes, if anything.
- **The walkthrough video.**
  - 30 to 75 s, 1920x1080, 30 fps, with short plain captions that say what happens.
  - No sound needed.
  - Made by code first (HTML, CSS, JavaScript; three.js or similar for 3D, vendored locally
    rather than loaded from the web at render time), rendered frame by frame.
- **Research.** Find out how the best products show an AI at work: setup and onboarding moments,
  sources being read, notes being written, answers with sources, assistants as a character or
  as light. One research helper with web search may do it, read-only. Save its findings with
  links in `demo-video/research/ui-wow-inspiration-2026-11-15.md`, generic only.

## Helpers (C13: the controller's yes is given here)

- **What is allowed.** One research helper (above). Up to three builder helpers at once, each
  on its own concept folder, built from one shared brief that you write. At most four agents at
  once.
- **Fences for every helper.**
  - The privacy rules above.
  - No paid call; nothing sent anywhere.
  - Nothing written outside its own folder and its scratchpad.
  - Plain shell; a report in its final message.
  - Its own render lane.
  - Look-checks on small sheets only: 16 to 20 frames at 320 px, a few at most.
- **Your part.** You look at each concept's final sheet before you deliver it.

## Money

- Pictures or clips made by a paid tool only where code cannot reach the look, for example a
  mascot's design.
- Up to $10, made-up content only, never the recording.
- Your own wrapper and ledger (`gen-wp6.sh`, `demo-video/ledger/wp6.csv`).
- Your ledger total in every message. The film has spent $41.43 of the $100 cap.

## Delivery, PR and merge

1. Send the controller, by message:
   - for each concept, the video's path, one line, and your order of preference;
   - one overview picture of all the concepts.
2. The controller looks, then sends them to Manish.
3. Open one PR with `demo-video/ui-concepts/` and the research note, made-up data only. Merge
   it once the videos are delivered (fetch and merge `origin/main` first).
4. Update your STATE spots: a WP6 line under "Packages" and a session-log row.

## Stop rules

- Tell the controller at 40% context (measured from your transcript), and hand off at a clean
  step by 45%. The hand-off is a dated file on `main`, `HANDOFF-2026-11-15-ai-peer-video-wp6-2.md`.
- **Usage.** The whole week was at 63% at 13:13 UTC on 15 November and resets on Monday
  16 November at 22:59 UTC. The account's other sessions add about 1.4 points an hour. If the
  week passes 85%, the controller may ask you to stop at your next clean step; at 93% all video
  work pauses. Push your work at every step.

## Known traps

- Pictures fill a context fast: one sheet of 16 to 20 frames at 320 px settles a check.
- Shell edits:
  - put edit scripts and commit messages in scratchpad files and run plain commands;
  - quote heredocs (`<<'EOF'`): an unquoted one runs every backtick in it;
  - in zsh, `echo =====` fails, and a glob with no match fails the line.
- The film's lessons: `demo-video/film/REPORT.md`, "Traps" sections, and the hand-offs of
  wp2-4 to wp2-6.
