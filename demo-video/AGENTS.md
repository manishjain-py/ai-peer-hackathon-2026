# AI Peer demo video: agent guide

A new 2-minute "wow" demo video for the AI Peer hackathon project, started 2026-11-14.
It is a new film, separate from the September concept film in `../film/`.

The last approved full video (16 November 2026): `film/renders/blended-tag-v2.mp4`, the Tag version, tag
`blended-tag-v2` (V30, V31; Little Peer is not used). Earlier cuts and every checkpoint:
`../START-HERE.md`, "Checkpoints".

Latest delivered cut (V42), `film/renders/blended-moss-v7.mp4`, runs 119.600 seconds. The [delivery record](docs/MOSS-V7-DELIVERY-2026-11-17.md) links the 4K master and 1080p Telegram download. See the [source guide](moss-choreography/README.md) for the film and the [tracker](docs/STATE.md) for current status.

V40 (17 November): for implementing this design in the actual prototype on another Mac,
use `../docs/prototype-moss-handoff/README.md`. Moss v5 is the designated implementation
reference for that task, regardless of historical Tag approval. The receiving agent updates
its own current prototype; the demo folder is a read-only reference. No new film is requested.

## Start here

1. `docs/STATE.md`: where we are, live sessions, money spent, what needs Manish, next.
2. Your hand-off brief in `docs/handoffs/`, if you were started with one.
3. `docs/DESIGN.md` section 0: the locked decisions. Never re-open one.
4. `docs/BRIEF-2026-11-14.md`: Manish's ask, word for word, and the evidence that tested it.
5. `research/reports/`: the tools research. `research/research_notes/` holds its sources.

## Rules

- The repo is the only memory. Commit and push docs, prompts, settings and chosen takes as you go.
- One controller, `ai-peer-video-controller-<n>`, is Manish's single contact. Workers report to it.
- Manish: one question at a time, plain words, options and a recommendation.
- Secrets stay in the shell environment or `~/.ai-peer/.env`: never in git, chat or Telegram.
- Never send a person's name, the company's name or product screens to an outside tool unless
  `docs/DESIGN.md` section 0 allows it.
- **The real product recordings are private** (`docs/DESIGN.md` V8 and C8): they live only in
  `~/.ai-peer/demo-video-private/`, never in git, never in any outside service, never quoted.
  Previews and the repo use a stand-in.
- Money: log every paid generation in `docs/STATE.md` (Money spent) and stay inside the budget
  in `docs/DESIGN.md` section 0. No budget there yet means: spend nothing.
- The root `AGENTS.md` rules also apply: no Airbnb-internal details in new files, and the Peer
  is always shown as a labelled AI.
