# WP10 plan: the demo package

A package plan from the first laptop (6 Nov 2026, the controller's map of the code), sanitized for the Airbnb
laptop on 7 Nov. The controller there turns it into a worker's brief (a dated hand-off in
`docs/build/handoffs/`), re-checks each file and function against the code, and names the base commit.

## Manish's words (quoted)

- The deliverable (D16, "Live demo + backups + film opener (Recommended)"): a live demo of S1 to S3, a backup
  recording of each scene, and a short concept-film opener; recordings made at the rehearsal.
- The checkpoints (D15): "3 checkpoints but don't restrict by date. if it gets done sooner, i will check
  sooner".
- The merge rule (D13): done = the scene seen working in a manual walk; workers merge their own PR when the
  walk passes.

## The job

Make the three scenes demo-ready on the Airbnb laptop and rehearse them: fast live meeting answers, the
follow-ups the live walks found, the demo script from real walks, the page polished, a backup recording per
scene, and the film opener. Its live steps wait for WP7's merge (the privacy fix) and run on whatever systems
WP9 has connected by then; until then it works on the fictional world in dry runs.

## Read first

`AGENTS.md`, `docs/build/STATE.md`, `demo/script.md` (the script to finish), `docs/build/PRD.md` (the scenes),
`docs/build/DESIGN.md` D7, D9, D15, D16, then the files below as you reach them.

## What to build

1. **Live-answer speed (S3).** The meeting fact pack is cut at 24,000 characters (`build()` in
   `peer/meetings/factpack.py`, `max_chars`), while the owner's project notes held about 140 KB on the first
   laptop, so the projects a question asked about fell out of the pack and the warm session read memory files
   before answering: the first live answer was heard about 21 s after the question (the spike, with a small
   pack, heard answers 7 to 8 s after). Make it answer from the pack first: build the pack around the meeting
   (its title, invite, attendees, recent threads) and put the projects most likely to come up first; tighten
   the `### answer_live` playbook in `peer/brain/skills/peer-brain/SKILL.md` to read files only when the pack
   lacks the fact. Proof: a timed S3 walk, every live answer heard within about 10 s of its question.
2. **Presence after a scripted click.** `--auto-click` taps the owner's buttons through the Peer's own browser
   profile, which opens Slack's web client as the owner; afterwards Slack showed the owner "active", so the
   Peer's auto presence read him online and S1 would draft instead of answering. Check it before each S1
   walk and make the walks robust (for example set `away`/`online` explicitly in the scenario, or keep the
   browser from counting as the owner's activity).
3. **Test meetings in memory.** A scripted test meeting's brief lands in the owner's memory
   (`meetings/<date>-<title>.md`, marked as a test). Keep test briefs out of the owner's real memory, or remove
   them before the demo.
4. **The live Peer in its own folder.** Run the live Peer from a dedicated worktree (for example
   `../ai-peer-live`, detached at `main`, never edited), so it stops moving between worker worktrees. When it
   restarts from a new folder, run `install_skill` from there first (`peer start` does not re-point the brain
   skill links; only `Memory.ensure()` does, in `peer/memory/layout.py`) and check both links with `readlink`.
5. **The demo script** (`demo/script.md`): S1 is final from its recorded walks; S2 and S3 get their lines and
   timings from their live walks on the new laptop; the names and channels become the real ones once WP9 is
   in (or stay the fictional world for a demo on a test workspace). The slot length comes from Airbnb ask 7.
6. **Web page polish** (`peer/web/`): the setup, learned, settings, activity, brief and meetings pages in the
   concept film's look; nothing that changes behaviour.
7. **Backup recordings**: one per scene (`demo/recordings/s1-online.mp4`, `s1-away.mp4`, `s2-brief.mp4`,
   `s3-meeting.mp4`); `peer scenario <name> --record` records screenshots and video through the Peer's own
   browser profile. Large media stays out of git unless the repo's home allows it: record where they are in
   STATE.
8. **The film opener**: a 30 to 45 second cut from `film/renders/ai-peer-draft-07.mp4` (4:23): the idea of a
   teammate who covers for you; slot `demo/recordings/opener.mp4`. Which cut, and whether it may be shown,
   is Manish's call: ask him once, with a recommendation.
9. **Two full rehearsals** before 16 Nov, timed, with the phone taps; note the real timings in the script.
10. The extra (the upstream-break warning, D3) only if WP7 and this package are done early, and only with
    Manish's word.

## Ownership while WP7 runs

WP10 owns `peer/meetings/factpack.py`, the `### answer_live` section of the brain skill, `demo/script.md`, and
`peer/web/` except the adapter builds in `brief_page.py` and the backend list in `app.py` (WP7's). Shared,
small and additive: `peer/meetings/live.py`, `peer/brain/warm.py`, `peer/brain/schemas.py` (append), the
skill's one-line `description:`, `peer/defaults.yaml`.

## Proof

Each scene walked live on the new laptop with its timings recorded; the recordings exist; two rehearsals
logged in STATE; the demo script matches what the walks showed. Evidence in `docs/build/evidence/wp10/`.

## Stop rules and traps

The same as WP7's plan ([WP7](WP7-privacy-and-contract.md), "Stop rules" and "Traps"), plus: one live Peer at a
time (a second Socket Mode connection splits its events); every live walk DMs the owner (a card, a brief);
`peer meeting clean` removes every bot on the meeting-bot account; ElevenLabs is Manish's own key now, still
stock voices only and within `voice.elevenlabs_budget_chars`; never the owner's cloned voice.
