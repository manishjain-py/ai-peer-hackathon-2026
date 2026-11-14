# WP2 report: the film in code, and Draft 1

Written 2026-11-14 by ai-peer-video-wp2-2 for the controller and Manish. Work package 2 of the
demo video (brief: `../docs/handoffs/HANDOFF-2026-11-14-ai-peer-video-wp2.md`), built by
ai-peer-video-wp2 until 12:20 UTC and by ai-peer-video-wp2-2 after it.

## Draft 1

| Render | Where | What it is |
|---|---|---|
| The full film | `~/.ai-peer/demo-video-private/renders/draft-01.mp4`, on this Mac only | 2:00.0 (3,600 frames), 1920x1080, 30 fps, 114.5 MB. All five parts, voice, captions, music and sound effects. The product screens come from the stand-in recordings of 5 to 7 November (demo data). |
| The same film with slates | `demo-video/film/renders/draft-01-slates.mp4`, in git | 2:00.0, the same size and rate, 40.2 MB (packed a little harder, `--crf 24`). The four product screens are labelled slates; everything else is the same. |

Make them again: `node demo-video/film/tools/pull_shots.mjs`, then
`node demo-video/film/render.mjs --name draft-01-slates --quality delivery --crf 24` and
`node demo-video/film/render.mjs --private --name draft-01 --quality delivery` (about
three minutes each). How the project fits together: `README.md`.

Nobody has heard this film. Every voice, the music and the effects were checked by measurement
and by speech-to-text only. Nobody has watched it move either: the picture was checked as
still frames. **Manish's eyes and ears are the first real test.**

## What is in the two minutes

| Time | Part | Draft 1 shows | Made by |
|---|---|---|---|
| 0:00 to 0:12 | The hook | Three colleagues, one line each, then the sleeper | WP3's final shots; the voices are ElevenLabs, laid in here at the times WP3's manifest gives for each mouth |
| 0:12 to 0:30 | The reveal | The double rises, tucks the blanket, walks to the desk, opens the laptop. The "AI Peer" tag lands on its chest as the Peer says "AI Peer" | WP3's finals (the desk shot dissolves in over 6 frames, as WP3 asked); the tag by code, on WP3's chest tracks |
| 0:30 to 0:32 | The push-in | The camera pushes to the laptop, the screen turns to face us and becomes the product's window | Code, from WP3's 4K still of the desk shot's last frame and its screen corners |
| 0:32 to 1:30 | The proof | 2 AM the meeting (the Peer as a call tile moved by the real sound of a test meeting, then the product's Meetings page); 4 AM Slack; 6 AM the brief's "company news" part. A night clock runs through it | Code over the stand-ins (slates in the public render) |
| 1:30 to 1:48 | The morning | He wakes, the brief page with one tap on "Accept", he reads his phone, the double nods and fades with its tag | WP3's finals; the brief by code |
| 1:48 to 2:00 | The close | Out of one lit window, over the city, up to the Earth from space; warm city lights on the night side turn mint; the planet settles low as a lit horizon. Then the end card: the mark, "More room for your best work.", "Built for real this week" | Code only |

## The contract, item by item

| # | Item | State |
|---|---|---|
| 1 | One command renders the film | Done. `render.mjs` (whole film, one part, any window, `--private`); proven from a fresh clone by ai-peer-video-wp2. |
| 2 | The voice | Done. 15 lines in voice 1 (Matilda, the product's own Peer voice; Manish confirmed it, `DESIGN.md` V12), three samples. |
| 3a | The Earth close | **In Draft 1 as a snapshot.** The helper of ai-peer-video-wp2 was still improving the opening window when Draft 1 was rendered, so the film is pinned to its file as it stood at 13:17 UTC with the development switches off (`src/scenes/earth-draft1.js`, named by `scene_file` in `shots.json`). Textures: NASA Black Marble 2016 and Blue Marble Next Generation, in `assets/earth/` (the scene names `assets/earth/SOURCE.md` for their source and licence: its maker has not written that file yet). Its own report follows on `main` (`../docs/handoffs/HANDOFF-2026-11-14-ai-peer-video-wp2-2-helpers-earth.md`); then drop `scene_file`, delete the snapshot, look at 1:48 to 2:00 again. |
| 3b, 3c | The night clock, the proof cards | Done (`src/overlays/chips.js`). |
| 3d | Captions | Done, word by word (`src/overlays/captions.js`). |
| 3e | The end card | Done (`src/scenes/endcard.js`); it sits over the Earth. |
| 3f | The "AI Peer" tag | Done (`src/overlays/tag.js`), on all three shots of the double, on WP3's chest tracks. `tools/tag_track.py` makes a track from a few hand-set keys for a clip that comes without one (it carried the drafts). |
| 4 | Product screens | Done for Draft 1 from the stand-ins (`src/scenes/product.js`, `product.json`). |
| 5 | Music and sound | Done by the helper of ai-peer-video-wp2 and checked with this session's own renders. The bed is one take of Google's Lyria 3.5 through fal.ai, cut on the film's bar lines (`audio/music/bed.wav`; a plainer cut is `bed-alt-1.wav`). Nine effects are made by code (`audio/sfx/`). The mix is ffmpeg (`tools/mix.mjs`, settings in `audio/mix.json`). The terms relied on are in `audio/SOURCES.md`; **the licence wording is open for Manish** (below). |
| 6 | Draft 1, two renders | Done (above). |
| 7 | This report | Done. |

Added beyond the contract: a network guard around every private render (below), and a final
packing step so a delivery render is 40 to 115 MB instead of 1.5 GB.

## What is weak, plainly

1. **The nine AI shots are WP3's finals, and this session judged them only as small frames
   inside the film.** What is weak in each is in WP3's own report
   (`../shots/REPORT.md`). One point is open and was not checked here: six of the nine files
   carry no colour tag, and WP3 found they may fit BT.601 better than the BT.709 a browser
   assumes for 1080p, so those six may look slightly off in the render. Compare one of them
   (for example `hook-1`) with its still before the final cut.
2. **The meeting has no real picture.** The stand-in recording shows only the other side's
   name on black, so the Peer is a call tile drawn by code and moved by the real sound, marked
   "Real sound from a live test meeting". **Manish's real recording must be made from a
   participant's screen, so the Peer's tile and its label are in the picture.**
3. **The product screens are small and soft.** The stand-ins are 1280 pixels wide; the Slack
   thread is enlarged 3.5 times, and the brief page's text is small at 1080p. Real recordings
   should be full screen on a Retina display.
4. **"The other direction" and the morning brief are a screenshot,** not a recording: the
   product's brief page from a dry run (it says "Good evening"; the views avoid that).
5. **The tag on the seated double is a choice, not a measurement.** WP3's tracks call the chest
   out of view once he sits side-on at the desk; the tag is shown there anyway (0:26 to 0:30,
   while the Peer says "Not as him. As me."), on the place where the track follows his upper
   body. In the morning it fades by a timed fade, as WP3 asked, because the track there only
   says on or off.
6. **The push-in is made from one still** (WP3's 4K still of the last frame). It zooms about
   twelve times; blur and the screen's bloom carry the middle of the move. In the public
   render it opens onto a slate, which is plainer than the product window the full film lands
   in.
7. **The AI clips are 24 frames a second in a 30 frames film:** slow moves can stutter a
   little. Fine for a draft; the finals may need a proper frame-rate conversion.
8. **Captions of speech inside recordings** are spread evenly over the words, not timed word
   by word.
9. **The Earth's opening is the least finished second of the close.** The pull-out starts on a
   lit window in a wall, then a fast streak of city lights; the window was being rebuilt by
   its maker when Draft 1 was rendered, and the streak is a blur of lights, not a city one can
   read. From 1:50 the planet, the lights turning mint and the end card over the horizon hold
   up in frames.
10. **Nobody has heard the music or the effects.** The bed has joins at 54, 72, 74 and 90 s and
    an end accent at 116 s that its maker calls the riskiest edit; the morning reuses the
    reveal's music; the hook has no drums (the first kick is at 0:32); the source take is a
    192 kbit/s MP3; the phone buzz and the lid click are synthetic and may sound artificial.
    The tap on the phone is timed to about 0.3 s, because the tap is weak in WP3's draft. If a
    join sounds wrong, `bed-alt-1.wav` avoids three of them: change `music.file` in
    `audio/mix.json`.

## Checks made (numbers from the Draft 1 renders)

| Check | Slates render | Full render |
|---|---|---|
| Length, frames, size, rate | 120.0 s, 3,600, 1920x1080, 30 fps | the same |
| Loudness of the file | -14.1 LUFS, true peak -1.8 dBFS | -14.1 LUFS, true peak -1.8 dBFS |
| Voice above the music, per line | 15.0 dB at the lowest, 22.8 at the highest | the same |
| Speech-to-text on the finished mix | 15 of 15 script lines | 15 of 15 script lines |
| The page before the render | no errors | no errors |
| Network guard | not needed (no recording in it) | held (proved before the render) |

- **A frame at every cut**, as one sheet for each render: 20 frames of the slates render (every
  slot start, the tag's landing, the push-in, the Earth, the end card) and 12 frames of the
  product parts of the full render (each title card, each change of picture). Every cut shows
  what it should. Earlier sheets checked the push-in frame by frame, the tag at full size, the
  morning and the close.
- **Two things only the frames showed, both fixed:** the Slack stand-in went blank for about a
  second while a thread loaded; and the Earth scene's development switches hid the captions
  and the end card.
- The speech model once heard a stray "never." after "I cover." in a full-length transcript.
  The old session checked 21.5 to 29.0 s on the mix and on the voice alone: both read
  correctly, so it is the model's slip on a long file. An ear should still pass 0:25 once.
- Both renders used the same Earth snapshot (the same file checksum in both builds).
- Not checked: anything in motion, anything by ear, the colour of the six untagged AI clips,
  the lip sync (WP3 measured it with its own tool).

## The network guard of the private render

Real company recordings arrive on Tuesday (`DESIGN.md` C8), so a private render now runs the
renderer and its browser inside a macOS sandbox that refuses every connection except to this
Mac. `render.mjs` proves the guard before each private render and stops if it does not hold.
Proof with a control, run once by hand on a copy of the public build: a page that fetches an
outside site reached it without the sandbox and was refused inside it
(`net::ERR_ACCESS_DENIED`). Behind the guard Chrome runs without its own inner sandbox, which
cannot start inside another one; the page it draws is this film's own local page.

## Routine calls taken (undo: tell the controller)

By ai-peer-video-wp2-2:

- The tag lands at 0:15.7, on the words "AI Peer", not when the double first appears; it
  leaves when he turns his back and returns when he sits. It is a dark glass pill with a mint
  edge, about 125 pixels wide.
- The push-in ends on the product's window, dark, with the Peer's mark glowing on it for a
  moment; the proof's first title card then comes up on that window.
- When the tag shows is set in `shots.json` and follows the narration, so it holds when a clip
  is replaced; where the chest is comes from WP3's track. Hand-set screen corners and tag keys
  belong to one clip file: with a new clip and no track the build leaves the tag off and says
  so, instead of drawing it in the wrong place.
- The replaced draft clips and the tracks made by hand for them were removed from the project.
- Sound effects were moved to the finals' frames: the phone buzz 12.1 s, the rise shimmer
  12.6 s, the lid click 27.5 s (in the pause between "him." and "As"), the phone tap 103.54 s
  (WP3's `tap_at_s`).
- The Slack stand-in goes blank for about a second while a thread loads: the cut holds the
  last full frame over it (`product.json`).
- Draft 1 was not held back for the Earth's last polish: it carries a snapshot (above).
- A delivery render is packed at `--crf 22`: the film grain is given up in the packed file
  (kept, it costs about 1 GB); the dark gradients stay smooth. The 1.5 GB master stays in the
  work folder.
- No helper was started by this session (Claude usage was short).

By ai-peer-video-wp2 (from its hand-off): HyperFrames 0.9.45 with no GSAP; the three colleague
voices are the ones the September film ended on; `eleven_multilingual_v2`, as the product
uses; narration at 3.3 to 3.6 words a second; product screens stay slates in the public render
even though two of the stand-in pictures are already in git; the morning runs wake, brief,
tap, nod; cuts sit on a half-second grid for 120 BPM music.

## Spend

**$0.94 of the $10 cap** (`demo-video/ledger/wp2.csv`: eight calls, all for music: six takes on
fal.ai, one of them free, a listening model, and one call that failed at no cost; the helper
thinks about $0.73 was really billed). ElevenLabs: 691 characters of the plan Manish already
pays for, which is not new spending. The Gemini and OpenAI keys were not used. This session
(ai-peer-video-wp2-2) made no paid call.

## Open for Manish: the music's terms

Licence wording is his call. The bed is made with Google's Lyria 3.5 through fal.ai. The words
relied on are quoted in `audio/SOURCES.md` and in
`../docs/handoffs/HANDOFF-2026-11-14-ai-peer-video-wp2-2-helpers.md`: fal.ai gives a right to use
its services "for your own personal or internal business use", and the model's page carries its
"Commercial use" badge. Read as: good enough for a film shown inside the company. Four points
the published words do not settle: no sentence says the customer owns the music; "your own"
internal use is Manish's fal.ai account, while the film is shown inside his employer; fal.ai
does not say which of Google's terms reach its customers; a public release would need a fresh
look. This session did not read the terms pages again. A bed made fully by code would have
none of these questions and would sound plainer.

## For the next round

- **The Earth's final version** (its maker's report follows on `main`): drop `scene_file`,
  delete `src/scenes/earth-draft1.js`, commit `src/scenes/earth.js` and `assets/earth/` with
  the textures' source and licence, look at 1:48 to 2:00.
- **A new clip from WP3:** `tools/pull_shots.mjs` brings it in with its track, corners and
  still; then check `tag_keys.show` in `shots.json` and the effect times in `audio/mix.json`.
- **Manish's recordings** (by Tuesday 17 November): the meeting from a participant's screen;
  full screen on a Retina display; they go into `~/.ai-peer/demo-video-private/` and are cut
  in `product.json` (numbers only) and `product-private.json` (the words, never in git).
- **His feedback on Draft 1** comes back through the controller.
