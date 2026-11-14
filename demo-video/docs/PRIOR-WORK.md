# What the old film and the build teach the new video

Read on 2026-11-14 from `film/` and `docs/build/` by a read-only helper of
ai-peer-video-controller-1. The film docs paraphrase Manish; his word-for-word quotes are only
in `docs/build/`. The film docs say "no live product": they were written before the build of
4 to 7 November.

## Manish's taste (his feedback on Drafts 01 to 06 of the September film)

Source: `film/docs/decisions/0002` to `0007`, `film/docs/video/feedback-round-after-draft-05.md`,
`film/docs/progress/session-handoff-2026-11-01.md`.

- Wants: "polished advertising quality"; a strong advertising-style opening; realistic,
  recognisable Slack and Zoom; smooth animation; fast pacing; upbeat music in step with the
  transitions; a clear problem and product reveal; each impact clear, with a before and after.
- Voices: "natural restrained voices". He "did not like" voices that "sound artificial" or
  "have excessive excitement". Meeting voices in Draft 02 were "unnatural".
- Rejected: slow pacing (Draft 02); "the walking/sitting cartoon" as "childish/unprofessional"
  (Draft 06); "unexplained technical dialogue".
- His own opening idea then: a seated person at the centre of a circle that fills with daily
  demands.
- Draft 07 (4:23): no reaction recorded.
- His words on the idea (`docs/build/BRIEF-2026-11-04.md`): "giving AI the power that it needs
  to be proactive and to discover things on its own, not just respond"; "both ways it is
  filling the gap between the employee and the company"; "the name can still be changed".

## Rules already set that bind a video

- "The Peer always speaks as its own labelled identity, 'Manish's AI Peer'." (root `AGENTS.md`)
- "Never Manish's cloned voice." (`docs/build/STATE.md`)
- "No Airbnb-internal details in new build files". (root `AGENTS.md`)
- "It must not present a simulated conversation as footage from a functioning integration."
  (`film/docs/idea/hackathon-scope.md`)
- "Do not publish externally without explicit user instruction." (`film/AGENTS.md`)
- "Do not reuse the references' music, logos, character, or entire scenes". (`film/AGENTS.md`)
- The Peer "never commits him to a decision or a date". (`docs/build/DESIGN.md`)

## What the real product did on this Mac (test world: Learn Like Magic, invented colleagues)

Source: `docs/build/STATE.md`, `docs/build/evidence/`, `demo/script.md`.

| Scene | Seen working | How the Peer shows itself |
|---|---|---|
| Slack cover | Yes, live, 5 and 6 November, recorded | A Slack bot with the APP badge: "I'm Manish's AI Peer, an AI assistant that covers for Manish. Manish is offline right now", then its sources, how sure it is, and "I can't make commitments on Manish's behalf". When he is online: a draft card in his DM with Send, Edit, Skip. |
| Daily brief | Dry run only | A Slack DM and a web page, with Draft reply, Send email, Accept buttons. |
| Meeting | Yes, live once, 6 November, on a test Zoom | Joins as "Manish's AI Peer" and speaks in a stock voice: "Hi everyone, I'm Manish's AI Peer, an AI assistant. Manish can't join this meeting". Plays his approved update, answers 3 live questions (first answer after about 24 s), sends him a brief after. |
| Setup page | Walked on a test owner | "Create my AI Peer" to "Your Peer is ready" in 54 s, in the film's look. |

The kickoff research (`docs/build/RESEARCH-2026-11-04.md`) rated "a labelled AI speaking in a
live meeting" as the rarest thing judges will have seen; morning briefs and note-taker bots are
"common now".

On 7 November the build moved to Manish's other laptop as a sanitized zip (a fictional test
company, Fernway). Work done there since is not in this repo.

## Identity that exists

- Name "AI Peer" (working name, never approved as final). Lines used so far: "More room for
  your best work."; "Meet AI Peer. A teammate who makes room for your best work."
- Mark: a mint rounded square with two arches and two dots, as SVG in code
  (`film/video/src/draft02/Shared.tsx`, `peer/web/layout.py`). Colours: ink `#152b31`, paper
  `#f6f4ee`, mint `#b7f4cf`, green `#167353`. Font: Manrope.
- Voices (ElevenLabs): the product's Peer is Matilda `XrExE9yKIg1WjnnlVkGX`; the film used
  Sarah `EXAVITQu4vr4xnSDxMaL` as narrator and Aarav J `jpdt2U2ncF4tVZvy35oY` as the Peer.
- "Peer" is heard as "pier" by speech tools: check every spoken line.

## Media on this Mac (outside git unless said)

- Draft 07, 1080p: `/Users/manishjain/Desktop/ai-peer-handoff/ai-peer/film/renders/ai-peer-draft-07.mp4`;
  a 540p preview in the repo at `film/renders/ai-peer-draft-07-preview.mp4`. It shows Manish's
  full name, his city and some first names.
- Product recordings: `~/.ai-peer/manish/walks/s1-online-20261106T181840Z/walk.mp4` (77 s),
  `~/.ai-peer/manish/walks/s1-away-20261106T182028Z/walk.mp4` (124 s),
  `~/.ai-peer/manish/meeting-runs/m2db7aebe/recording.mp4` (the meeting, about 4 minutes).
- Product screenshots: PNGs under `docs/build/evidence/`.
- The rest of `film/` media are Git LFS pointers (3.7 GB to fetch).

## Traps from the old work

- No session could hear the audio; only Manish judged the voices, after delivery, and they were
  replaced twice. Get his ear early, on a short sample.
- Length crept from 2:00 to 4:23 as each round added use cases. Hold the length.
- A note of his ("arriving, sitting down") was built literally as a walking cartoon, which he
  rejected. Show him a look before building on it.
- Draft 02 was slow: gaps of 1.8 to 2.5 s between speakers.
- The last review of Draft 07 was sampled frames, never a full watch.

## Still unanswered (for the interview)

- The hackathon's format: recorded or live, slot length, judging criteria, date.
- Which world the video may show: his real company context (as Draft 07 did), the Learn Like
  Magic test world, or the fictional Fernway.
- Whether "AI Peer" and its tagline are final.
