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

### The controller's own routine calls (undo: tell the controller)

| # | Call | Why |
|---|---|---|
| C1 | The work lives in `demo-video/` of `manishjain-py/ai-peer-hackathon-2026`; docs go straight to `main`. | The repo already holds the old film, the build and their lessons; its rule sends docs-only commits to `main`. |
| C2 | The tools research (notes and report) lives in `demo-video/research/`. | The repo is the only memory. |
| C3 | No money is spent before a budget is written in this section. | Money is Manish's call. |
| C5 | How V2 and V3 are applied: each shot is first tried by code; a paid tool is used only for what code cannot make (for example real-looking people and places that nobody filmed, voices, music). The $100 counts new spending (pay-per-use generation, any new subscription); plans Manish already pays for (ElevenLabs) are used inside their quota. Every paid call is logged in `STATE.md` (Money spent); one round of test shots costs at most $15; Manish is told at $50 and at $80. | His two answers of 14 November. |
| C6 | Worker sessions run on Fable 5.2 at max effort, like the controller; if Fable's weekly allowance runs short, Opus 5.5 at max effort. | Manish set this session to Fable 5.2 at max effort on 14 November; his standing rule is the best model at max effort. |
| C7 | Because of V4 and V3: generated shots with people are kept few (about 6 to 8 in the film) and each is planned as a still frame first; the clone's glow and see-through look are made by code over the generated footage wherever that works. Manish picks the invented employee's look from pictures before any video is made of them. | Stills cost cents, video costs dollars; his eyes decide a look. |
| C4 | Working dates from V1: look and script fixed by Sunday 15 November night (India time), first full cut Tuesday 17, final Wednesday 18 night, Thursday 19 morning as buffer. The new product screens are needed by Tuesday 17 morning. | Five days; a cut needs a day of his feedback and a day of fixes. |

## 1. The film

Filled after the interview: story, scenes, look, voice, music.

## 2. The tool stack

Filled after the research and the test shots.
