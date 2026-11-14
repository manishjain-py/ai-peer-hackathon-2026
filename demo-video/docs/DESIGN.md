# AI Peer demo video: design

## 0. Decisions (locked; a change needs Manish's words, recorded here at once)

### From the brief (Manish, 2026-11-14; his full words are in `BRIEF-2026-11-14.md`)

| # | Decision | His words |
|---|---|---|
| B1 | A demo video of about 2 minutes with a "super wow effect", at the highest standards. | "a very nice 2 minutes demo video, which gives a super wow effect" |
| B2 | Opening idea: a Hermione-style setup (someone in several places at once), answered by the Peer. How the homage is done is open (interview). | "Hey, I'm using AI peer that covers for me when I'm not there." |
| B3 | Hero visuals: a clone that looks exactly like the employee comes out of the employee: at night for a meeting, for Slack, and at setup. | "an AI clone comes out of the employee that looks exactly like the employee and goes and attends the meeting" |
| B4 | The real product is shown too: he records its screens on his other laptop and brings them here to embed. | "I will be bringing back to you the actual screens that we can then embed inside your video" |
| B5 | Tools: research first; he pays for what is needed and gives access. | "Even if I have to pay for them, I will pay" |
| B6 | Way of working: one controller as his single contact, worker sessions, hand-off at 45 to 50% context, an interview one question at a time. | "one controller that becomes my single point of contact, and it drives the entire initiative" |
| B7 | Be creative beyond his outline. | "I would like you to be creative and think out of the box" |

### From the interview (one row per answer)

| # | Question | Decision | His words, date (UTC) |
|---|---|---|---|
| V1 | When must the finished video be ready? | Thursday 19 November 2026. | "Thursday 19 november" (2026-11-14 10:38 UTC) |
| V2 | Which tools? | Claude's own abilities first (video made by code: motion graphics, 3D, compositing, the edit). An outside tool only where they cannot meet the requirement; the controller picks it. | "First preference is to use Claude native capabilities. If that is not possible to fulfill the requirement, then we can use any tools that you think can do that." (2026-11-14 10:42 UTC) |
| V3 | How much may be spent? | A cap of $100 for now. Raising it is his call, later. | "for the budget cap, let's keep $100 for now, and afterwards we will see if we can extend it or not." (2026-11-14 10:42 UTC) |

| V4 | Who is the employee in the film? Asked as: A, Manish filmed on his phone (recommended); B, Manish from photos only, AI-generated; C, an invented employee, all AI-made, paid from the $100. | C: an invented employee. No filming of Manish and no photos of him. | "C" (2026-11-14 10:48 UTC) |
| V5 | How is the video shown at the hackathon? Asked as: A, it is the whole entry and judges watch it alone; B, it plays inside his live pitch; C, both or not sure. | A: the video is the whole entry; judges watch it on their own. So it must explain the product by itself and show it working. | "A" (2026-11-14 11:01 UTC) |
| V6 | What do the hackathon's rules say about the video, and how do judges score? Asked with: if there are no written rules, say "none", and the controller builds for under 2:00, 1080p, about half the time on the real product working. | No written rules. Build for under 2:00, 1080p, about half the time on the real product working. | "none" (2026-11-14 11:07 UTC) |
| V7 | Which invented employee? Asked with WP1's sheet of three (`demo-video/look/characters/characters.jpg` on branch `video-wp1-look-test`): A, a man in his early thirties, short dark hair, trimmed beard (recommended); B, a woman, shoulder-length dark hair; C, a woman, short natural curls. | A: the man with the trimmed beard. | "A" (2026-11-14 11:09 UTC) |
| V8 | What do the product screens show, and where may they go? Asked as: A, demo data only (recommended as the safe default); B, real Airbnb content, on this Mac only: he records on the company laptop and brings the files here, they stay out of GitHub, are never sent to an outside tool, and are polished by code only; C, real content never leaves the company laptop. | B: real company content, on this Mac only, out of GitHub, never sent to an outside tool, polished by code only. | "B" (2026-11-14 11:11 UTC) |
| V9 | The opening. The controller's outline had an original magic-school student in place of Hermione. | No student and no magic school at all. The controller watches the September film frame by frame, then proposes a better two-minute story of its own. This replaces B2. | "if we can't use Hermione, then let's not use any student for that matter. It's not creating that impact." ... "let's come up with a story that you think is even better" ... "something that can fit in 2 minutes, and then tell me what that story is according to you." (2026-11-14 11:19 UTC) |
| V10 | Is the story in `STORY.md` ("He's asleep. I'm not.") the film? | Yes, for the first draft: build the video and show it to him end to end. | "Sure. Let's go ahead with this story for the first draft and create the video and show it to me how it comes out end to end." (2026-11-14 11:25 UTC) |

### The controller's own routine calls (undo: tell the controller)

| # | Call | Why |
|---|---|---|
| C1 | The work lives in `demo-video/` of `manishjain-py/ai-peer-hackathon-2026`; docs go straight to `main`. | The repo already holds the old film, the build and their lessons; its rule sends docs-only commits to `main`. |
| C2 | The tools research (notes and report) lives in `demo-video/research/`. | The repo is the only memory. |
| C3 | No money is spent before a budget is written in this section. | Money is Manish's call. |
| C5 | How V2 and V3 are applied: each shot is first tried by code; a paid tool is used only for what code cannot make (for example real-looking people and places that nobody filmed, voices, music). The $100 counts new spending (pay-per-use generation, any new subscription); plans Manish already pays for (ElevenLabs) are used inside their quota. Every paid call is logged in `STATE.md` (Money spent); one round of test shots costs at most $15; Manish is told at $50 and at $80. | His two answers of 14 November. |
| C6 | Worker sessions run on Fable 5.2 at max effort, like the controller; if Fable's weekly allowance runs short, Opus 5.5 at max effort. | Manish set this session to Fable 5.2 at max effort on 14 November; his standing rule is the best model at max effort. |
| C7 | Because of V4 and V3: generated shots with people are kept few (about 6 to 8 in the film) and each is planned as a still frame first; the clone's glow and see-through look are made by code over the generated footage wherever that works. Manish picks the invented employee's look from pictures before any video is made of them. | Stills cost cents, video costs dollars; his eyes decide a look. |
| C8 | How V8 is applied. The recordings from his company laptop live only in `~/.ai-peer/demo-video-private/` on this Mac, outside every git checkout. No session sends them, a frame of them, or a cut that contains them to any outside service: no generation or review tool, not GitHub, not Telegram, not an artifact page, not a file sent through the Claude app. They are polished by code on this Mac; the sessions that cut them look at their frames, and nothing else does. Nothing they show is quoted in docs, commits, replies or prompts. The repo, and any preview sent to Manish, carry a stand-in in their place (the demo-data recordings of 6 November, or a plain slate). The full film is rendered into the private folder and Manish copies it off this Mac himself. A session that works on them is launched with `CLAUDE_NO_IDLE_PING=1`. | His answer B, read strictly. |
| C9 | The film is built without Remotion: first HyperFrames (Apache-2.0), else a plain page captured frame by frame with Playwright and joined with ffmpeg. | Remotion asks for a paid licence when a film is company work; a free route avoids both the cost and the question. Undo: buy one Remotion seat ($25 a month). |
| C10 | For Draft 1 the Peer narrates in the product's own voice (ElevenLabs `XrExE9yKIg1WjnnlVkGX`); Manish gets two other calm voices as samples. Music comes from a source whose terms allow a company's internal film, not ElevenLabs Music. Money: WP1 $15, WP2 $10, WP3 $60, reserve $15 (`PLAN.md`). | His ear decides voices; licences written for small firms are avoided. |
| C11 | For Draft 1 the three colleagues in the hook speak on camera, one short line each: the words and ElevenLabs voices are WP2's, and WP3 makes each mouth follow that spoken file (the lines are in `SHOTS.md`). A shot whose speech does not look and read natural becomes a silent reaction, with the line as WP2's voice and caption. The shared list of the nine AI shots, their lengths and the hand-over between WP3 and WP2 is `SHOTS.md`. | `STORY.md` left open whether the colleagues speak on camera; Manish asked to see the first draft end to end, so the controller picks and his eyes and ears judge the result. Undo: tell the controller "reactions only". |
| C4 | Working dates from V1: look and script fixed by Sunday 15 November night (India time), first full cut Tuesday 17, final Wednesday 18 night, Thursday 19 morning as buffer. The new product screens are needed by Tuesday 17 morning. | Five days; a cut needs a day of his feedback and a day of fixes. |

## 1. The film

Filled after the interview: story, scenes, look, voice, music.

## 2. The tool stack

Filled after the research and the test shots.
