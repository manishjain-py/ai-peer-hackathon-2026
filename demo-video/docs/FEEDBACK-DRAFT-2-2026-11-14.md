# Manish's feedback on Draft 2 (2026-11-14, 19:14 UTC)

Word for word, as he typed it in the session of ai-peer-video-controller-4 (window 3977). He had
received the 720p slates copy of Draft 2 at 15:10 UTC, on the Attention group and in the
session. Recorded in `DESIGN.md` section 0 as V19. Dated, never edited. The controller's order
for the next round follows his words.

## His words

> Now that I'm thinking about it, one problem is that this exact same person coming out of Ram who looks just like Ram, it looks a bit creepy. So instead of coming out of Ram, can it instead be a mascot? I'm still trying to see different ways to do it. One is: it looks exactly like Ram with an AI tag, how it currently appears. But instead of coming out of Ram, it should come maybe from a phone or somewhere else. We need to think about where it comes from, because definitely I don't want him to come out of the sleeping Ram, because then it looks more like a ghost. So I don't want to give that feeling. So maybe one option is it looks like Ram, but it comes out of a phone or laptop or somewhere else. The other option is it's a different mascot, like an animal or something, or some other avatar, generic avatars, that comes out of, again, I don't know where, but they don't look like Ram anymore. So that's one piece of feedback.
>
> Another piece of feedback is that wherever there are empty places, let's try to fill them with actual data. Let that data be some dummy Airbnb data. Just make up some data for Airbnb payments use case. And just fill the screens based on that. For example, we have to record one entire Zoom thing. In one place, we have to fill in the Slack use case, and in another one we have to fill the morning brief. Everywhere, let's not keep it empty. Let's just fill it with the actual screenshots. Zoom is very generic. It's a global product, so you know what a Zoom meeting looks like. So get those, place those actual Zoom screens, Zoom recordings into the video. Also same for Slack. You know what the Slack UI looks like. So fill those placeholder pieces with actual data. Let that data be dummy for now, so that I can get a real feel of what the final video will end up looking like.
>
> And also at the end, when Ram gives a smile and goes back, that's also something we need to think about. I like that piece, but it needs to go to the same place where it came from. So see what we can do about it.
>
> Again, be creative. Explore different ideas. If someone similar in the market has done something, we can take inspiration from them. How do they showcase this? How some of the best products have done something similar. I don't know. So maybe try learning from them and then see how we can do something similar, and give me those suggestions. Maybe create some of those actual samples and send it over to me for review, and then I can review and let you know. And then fill in the placeholder pieces from the video, and then give me one final version which has the actual content, actual Zoom plugged in, actual Slack recording plugged in, how it's helping, everything.

## What it decides (the controller's reading)

1. **The Peer no longer comes out of the sleeping Ram**, because that feels like a ghost. There
   are two directions, and he chooses after seeing samples: (a) it keeps Ram's look with the AI
   tag, as now, but comes out of the phone, the laptop or somewhere else; (b) it is a different
   mascot or a generic avatar (an animal, for example) that does not look like Ram. This
   replaces the rise from his body (V13's shot). V14's look still applies, but only under (a).
2. **The slates are filled with made-up screens, "for now"**: a whole Zoom meeting, the Slack
   case, the change from elsewhere and the morning brief. They hold invented data for an
   Airbnb payments use case and look like real Zoom and Slack. The story, the voice and the
   music stay (V16).
3. **The ending stays** (the Peer smiles and leaves), **but the Peer goes back to the place it
   came from.**
4. **Order of work:** first, suggestions and samples for his review, informed by how similar
   products show this. Then the screens. Then one final version with everything in.

## The order for Draft 3 (to ai-peer-video-wp2-4 and its successors)

The job is Draft 3: the whole film, with a new entrance and return for the Peer and made-up
product screens. Manish sees samples first. Plan it as several sessions in a row (one worker
at a time, V15). Tell the controller at 40% context, and hand off at a clean step by 45% (a
dated hand-off file on `main`). The first brief still binds you
(`handoffs/HANDOFF-2026-11-14-ai-peer-video-wp2.md`: its stop rules, and C8).

**Phase A, first (for Manish's eyes): where the Peer comes from and what it looks like.**
- **Research.** Find out how the best products show an AI helper on screen and in their launch
  films, and how people received it. Cover meeting assistants that join as a labelled tile, AI
  teammates in Slack, assistants drawn as light or as a character, product mascots, and
  "digital twins" of a person. You may run one research helper with web search (the
  controller's yes under C13). It is read-only, writes nothing, and reports in its final
  message. Save its findings, with their links, in
  `demo-video/research/peer-entrance-2026-11-14.md`, and check every fact you rely on against
  its link.
- **Concepts.** Propose 3 to 4, each in one line: where the Peer comes from, what it looks like,
  and how it goes back at the end. Cover both of his directions: (a) Ram's look with the tag,
  coming out of the phone, the laptop or another place; (b) a mascot or a generic avatar that
  does not look like Ram. Every concept must follow these rules:
  - never out of the sleeping Ram's body, and nothing ghostly;
  - always labelled "Ram's AI Peer";
  - one face for the Peer everywhere it appears (the hook's message cards, the tag, the Zoom
    tile, the Slack avatar, the morning brief);
  - at the end it goes back where it came from.
- **Samples.**
  - For each concept, one board of three stills: it appears, it works at the desk, it goes
    back. Build them on WP3's room and props where you can (`demo-video/shots/stills/`).
  - A motion test of about 5 seconds for each of the two strongest concepts.
  - Paid calls up to $8 for Phase A.
- **Hand-over.** Send the controller the file paths and one line per concept, with your
  recommendation first. The controller sends them to Manish (C12) and passes his pick back to
  you. Go on with Phase B in the meantime.

**Phase B (while Manish chooses): the four product screens, with made-up data, built by code.**
- **What to replace.** The slates of `proof-meeting`, `proof-slack`, `proof-change` and
  `morning-product-brief` become screens drawn by code in the film's renderer. The Zoom and
  Slack screens should be easy to recognise as Zoom and Slack; the brief looks like the
  product's own morning brief.
  1. **The meeting**, a Zoom gallery view, at night for Ram. The Peer joins as a labelled AI
     tile, says it is an AI, gives Ram's update, answers a question, and takes back what needs
     Ram's judgment.
  2. **Slack at night.** A colleague's question, answered with sources, with no promise made
     for Ram.
  3. **One change elsewhere** in the company that touches Ram's project, caught and brought to
     him.
  4. **The morning brief**: what the Peer did, what it learned, and the one thing that needs
     Ram.

  Follow what each slate says now, and fit the screens to the narration lines already
  recorded (the lines stay, V16).
- **The data.** Invent it for an Airbnb payments use case (for example, Ram owns a piece of host
  payouts). Make up every name, team, channel, number and link; use nothing internal (AGENTS.md
  hard rule).
- **People and the Peer's face.**
  - The colleagues in the meeting and in Slack are the hook's invented colleagues (WP3's
    stills), for continuity.
  - For this draft, stills with gentle movement and an active-speaker frame are enough.
  - No paid call in Phase B without the controller's word.
  - Draw the Peer's face as one swappable picture, so the face Manish picks in Phase A drops
    in everywhere.
- **Labels and renders.**
  - Put a small note, "Made-up data", on these screens. V17's "Real recordings" note no longer
    applies to them. Manish may drop the new note.
  - These screens hold no real recording, so Draft 3 is one public render that can go to Manish
    in full.
  - Leave the private switch and `film/product.json` untouched, for a later swap to his real
    recordings (V8, and V19's "dummy for now").

**Phase C (after Manish's pick): the entrance and the return.**
- Make the new entrance and the return to the same place as AI shots, by WP3's routes: stills
  first, then a cheap draft, then the final.
- If the Peer's look changes, remake every shot where it appears. The hook's cards and the tag
  take the chosen face.
- Re-time the music before 32 s for the new entrance (wp2-3's hand-off, item 2).
- Paid calls up to $25 for Phase C; anything more needs the controller's word.

**Phase D: Draft 3.**
- Render the film and look at one sheet of frames.
- Check the numbers: 2:00.0, the loudness, every line above the music.
- Open the PR and merge it, then update your STATE spots.
- Report to the controller, with the paths. Never send anything to Manish yourself.

**Money.** $31.25 of the $100 cap is spent (STATE, "Money spent"). This round may add up to $33
($8 in Phase A, $25 in Phase C). Give your ledger total in every message.
