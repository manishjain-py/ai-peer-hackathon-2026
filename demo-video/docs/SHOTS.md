# The AI shots with people: the shared list for WP2 and WP3

Written by ai-peer-video-controller-2 on 2026-11-14 from `STORY.md` (approved by Manish for a
first draft, `DESIGN.md` V10). It is the one place that says which shots WP3 makes, how long
they are, and how they reach WP2's film. WP2 owns the timeline; WP3 owns the clips. A change
to a slot's id, length or line is made here first, by the controller.

## The nine slots

Times are film times. "Deliver" is the least length of the clip: the film length plus a
handle, so the edit can trim. All nine show invented people; employee A is the man of
`demo-video/look/characters/a-portrait.jpg` and `a-full.jpg`.

| Slot id | Part | Film time | In the film | Deliver | What we see | Sound in the clip |
|---|---|---|---|---|---|---|
| `hook-1` | The hook | 0:00.0 to 0:03.5 | 3.5 s | 4.5 s | Daytime, a bright office. A colleague (a woman) looks up from her phone, pleasantly surprised, and says her line to someone beside the camera. | Her line (below) |
| `hook-2` | The hook | 0:03.5 to 0:06.5 | 3.0 s | 4 s | Late afternoon, another city: a small meeting room. A colleague (a man) glances at the wall screen (turned away from us) and says his line. | His line |
| `hook-3` | The hook | 0:06.5 to 0:08.5 | 2.0 s | 3 s | Evening, a third place: a home desk under a lamp. A colleague (a man) leans back from his laptop, half laughing, and asks his line. | His line |
| `hook-sleeper` | The hook | 0:08.5 to 0:12.0 | 3.5 s | 5 s | Cut to night. Employee A is fast asleep (the night room, closer than the wide frame; slow, even breathing). | None (the Peer speaks over it) |
| `reveal-rise` | The reveal | 0:12.0 to 0:21.0 | 9.0 s | 10 s | The wide night room, locked camera. The phone on the bedside table lights up. A double of him, made of mint light, rises out of him, stands, and pulls the blanket over the sleeper's shoulder. | None |
| `reveal-desk` | The reveal | 0:21.0 to 0:30.0, then WP2's push-in to 0:32.0 | 9.0 s | 9 s of action | The same frame. The double walks to the desk, sits and opens the laptop; its screen lights its face. The last 2 to 3 seconds of the window are WP2's push-in on the laptop screen, made by code from the clip's last frame. | None |
| `morning-wake` | The morning | 1:30.0 to 1:34.5 | 4.5 s | 5.5 s | The same room at sunrise, warm light through the window. He wakes rested, sits up and picks up his phone. | None |
| `morning-brief` | The morning | 1:40.5 to 1:44.5 (after WP2's product brief, 1:34.5 to 1:40.5) | 4.0 s | 5 s | Over his shoulder or from the side: he reads on his phone (the screen is a plain soft glow, never readable) and decides with one tap. | None |
| `morning-nod` | The morning | 1:44.5 to 1:48.0 | 3.5 s | 4.5 s | By the desk in daylight, the double, now faint, nods to him and fades away. | None |

The film times are WP2's, read from its message of 14 November (its `shots.json` is the truth;
cuts sit on a half-second grid for the music). Each hook line starts about 0.4 to 0.5 seconds
into its shot unless the manifest gives `line_at_s`. The tap in `morning-brief` comes right
before `morning-nod`. The total is about 44 seconds of AI footage.

## The colleagues' lines for Draft 1 (the controller's call, `DESIGN.md` C11)

The words and the voices are WP2's: `demo-video/film/audio/script.json` and the spoken files
`demo-video/film/audio/lines/h1.wav`, `h2.wav` and `h3.wav` in
`/Users/manishjain/repos/ai-peer-video-wp2` (ElevenLabs voices that the September film ended on,
so Manish's ear has passed them). Read on 2026-11-14:

| Slot | Line | Voice | Length |
|---|---|---|---|
| `hook-1` | "2 AM where he is, and I've got my answer." | a woman, British English (`h1.wav`) | 2.6 s |
| `hook-2` | "His update's already here. His Peer gave it." | a man, American English (`h2.wav`) | 2.1 s |
| `hook-3` | "Does he ever sleep?" | a man, Indian English (`h3.wav`) | 1.1 s |

Then the Peer, over `hook-sleeper` (WP2's narration): "He does. I'm the one who's up."

The colleagues speak on camera. WP3 makes each mouth follow WP2's spoken file (a lip-sync or
audio-driven model), so the words are exact and the voice is one Manish knows. WP3 reads those
files where they are and never writes there; if WP2 changes a line, WP2 tells the controller.
The film's sound for these shots is WP2's file, laid in by WP2.

If a colleague's speech does not look natural after a few takes, that shot becomes a silent
reaction (the same action, mouth closed or turned away), and WP2 lays the line over it as a
voice and a caption. WP3 says which in the manifest (`audio`).

## Rules for every clip

- 16:9. Delivered as H.264 MP4, 1920x1080, `yuv420p`, at the model's own frame rate (WP2
  conforms to 30 fps). A clip made at 720p is upscaled before delivery. A picture that is not
  exactly 16:9 is scaled to cover and cropped at the centre, never stretched; the tag track
  and the screen corners are measured on the delivered frame.
- No readable text anywhere in the picture: screens face away or are a plain glow. Labels, the
  "AI Peer" tag, captions and product screens are added by WP2 in code.
- The look is in WP3's brief and in `demo-video/look/` (the night frames F1 to F4): real-looking
  and cinematic, night in deep teal-ink `#152b31`, people lit warm, the double glowing mint
  `#b7f4cf`.
- Nothing private: no real person's photo or name and no company's name in any prompt or
  upload, and nothing from `~/.ai-peer/` goes to any tool. "AI Peer", the film's own subject,
  may be heard in a spoken line.

## How a clip reaches the film

WP3 keeps each slot's files in its own worktree and lists the current best clip per slot in
one manifest. WP2 reads the manifest whenever it renders, by absolute path on this Mac, and
copies what it uses into its own project. Neither session writes in the other's worktree.

- Clips: `demo-video/shots/<slot id>/<slot id>-<draft|final>-v<N>.mp4` in
  `/Users/manishjain/repos/ai-peer-video-wp3`.
- Manifest: `/Users/manishjain/repos/ai-peer-video-wp3/demo-video/shots/manifest.json`

```json
{
  "updated_utc": "2026-11-14T15:20:00Z",
  "slots": {
    "reveal-rise": {
      "clip": "demo-video/shots/reveal-rise/reveal-rise-final-v2.mp4",
      "grade": "final",
      "seconds": 10.0,
      "fps": 24,
      "use_from_s": 0.5,
      "audio": "none",
      "tag_track": "demo-video/shots/reveal-rise/tag-track.json",
      "note": "one line on what is weak, if anything"
    }
  }
}
```

- `clip` and `tag_track` are paths from the root of WP3's worktree. `grade` is `draft` (a cheap,
  low-resolution take, good enough to show the shot moving) or `final`.
- `use_from_s` is where the film window should start inside the clip. WP3 always writes it.
- `audio` is `lipsync` (the mouth follows WP2's spoken file; `"line_at_s"` beside it says where
  in the clip the line starts, so in the film the line starts at the window's start plus
  `line_at_s` minus `use_from_s`), `reaction` (a hook shot with no speech on camera), `ambient`
  (the model's own room sound, which WP2 may drop), or `none`.
- `tag_track` is given for the three slots that show the double (`reveal-rise`, `reveal-desk`,
  `morning-nod`): a JSON list with one entry per frame, `{"f": 0, "x": 0.41, "y": 0.37, "w": 0.06,
  "on": true}`: the middle of the double's chest and the width of its shoulders, both as
  fractions of the frame, and whether the chest is in view. WP2 places the "AI Peer" tag from it.
- `reveal-desk` also gives `"screen_quad"`: the four corners of the open laptop's screen in the
  last frame, as fractions of the frame, clockwise from the top left; and `"last_still"`: that
  last frame as a still at the highest resolution WP3 has (the key frame it was made from, or
  an upscale), so WP2's push-in stays sharp.
- A slot that is missing from the manifest shows WP2's labelled slate.
