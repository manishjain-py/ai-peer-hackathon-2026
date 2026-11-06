# WP4 spike: the live meeting path (PASSED, 6 Nov 2026, 18:55 to 19:15 UTC)

Run by `ai-peer-wp4-1` on test owner `wp4test`, on the test meeting "AI Peer test (Zoom)" (Manish's own
Zoom, nobody else in the call), with two Recall bots: "Manish's AI Peer" and "Ananya Rao (scripted test
bot)". Local `say` voices only (no ElevenLabs characters spent). Three short meetings, 565 bot-seconds,
about $0.10. Raw events and timings stay in `~/.ai-peer/wp4test/meetings/spike/` (not in git). Times
below come from Recall's word timestamps mapped onto the clock through each bot's `in_call_recording`
time, so a clock skew of a few tenths of a second is possible.

## Verdict

**The loop is far under the 20 s budget**: from the end of a question, the holding line is heard after
3.1 to 3.9 s and the live answer after **7.3 to 8.1 s**. The live answer path is built on this.

## (a) Real-time transcript through the tunnel

- `recording_config.transcript.provider.recallai_streaming = {"mode": "prioritize_low_latency",
  "language_code": "en"}` (Recall's docs: low latency is English only, "typically 1-3 seconds after an
  utterance is finalized"; the default `prioritize_accuracy` is "typically delayed by 3-10 minutes on
  real-time endpoints"). `realtime_endpoints`: one webhook for `transcript.data`,
  `transcript.partial_data`, `participant_events.join/leave/chat_message`.
- `cloudflared` 2026.10.7 (installed with `brew install cloudflared`) quick tunnel to a listener of its
  own (127.0.0.1:8795, a random token in the path, every other path a 404): up in 6.6 s; a POST through
  it lands in 0.5 s. 145 and 494 events in two meetings, none failed.
- **Final line (`transcript.data`) arrives 0.8 to 1.1 s after the speaker's last word** (7 lines).
  Partials (`transcript.partial_data`) trail the speech by about 0.65 s (median), the first one 0.6 to
  1.4 s after the first word. Each bot hears the other and, with `include_bot_in_recording.audio`, its
  own clips (labelled with its own name in real time, "Unknown" in the file after the meeting).
- Bots: created to `in_call_recording` in 7 to 10 s, with no host in the call. Meeting chat works
  (`send_chat_message`: the other bot got it as `participant_events.chat_message` 0.1 s later).

## (b) The warm session (D7)

One `claude -p` process per meeting, built from `_run_claude`'s isolation plus `--input-format
stream-json --include-partial-messages` (plain-text answers in a small line format: SAY, CERTAINTY,
AS_OF, FLAG, SOURCES). Primed with a 14 KB fact pack (the owner, rules, projects with the head of each
tracker's "Where we are", services, people). Opus (`claude-opus-5-5`), three questions per effort:

| Effort | Prime | Spoken answer ready (SAY complete) | Whole turn | Tools |
|---|---|---|---|---|
| low | 2.4 s | 1.8 to 3.9 s | 2.1 to 4.9 s | none |
| medium | 2.2 s | 2.2 to 3.8 s | 2.2 to 4.5 s | none |
| high | 2.2 s | 3.4 to 9.1 s | 4.1 to 9.1 s | 3 reads on the question the records lack |

All answers were honest: who drives it, the tracker's date, "no ship date in his records, so I'll flag
it for Manish", never a commitment. The live path uses **Opus at medium** (`meetings.live_effort`).

## (c) Speech and Recall's audio

- Local `say` (Samantha) plus ffmpeg, 1 s of silence in front: a 46-word answer renders in 0.86 s
  (15.1 s of audio), 23 words in 0.65 s. ElevenLabs is measured in the walk.
- `output_audio` returns in 0.6 to 1.2 s; **a clip is heard about 1.5 s after the call**, then the 1 s
  pad.
- **A second clip sent while one plays is mixed on top of it** (both play at once; HTTP 200, not
  queued, not refused): the transcript of clip A came back with B's words mixed in. So the Peer plays
  one clip at a time itself (it waits out the current clip's length).
- `DELETE /bot/{id}/output_audio/` (204) **cuts the clip within about 1 s**.

## (d) The whole loop (question, holding line, answer)

| Line (as the Peer's bot heard it) | Rule | Final after the last word | Holding line heard | Brain (SAY ready) | Answer heard |
|---|---|---|---|---|---|
| "i have a question for manish assistant who is driving the telugu build and when does its ship" | question | 0.84 s | 3.9 s | 3.4 s | **8.1 s** |
| "another one for the peer do we have a budget approved for the hyderabad school pilot" | question | 0.87 s | 3.1 s | 1.9 s | **7.3 s** |
| "does anyone know when the chapter loading work will be done" | maybe (no holding line; the brain may PASS) | 1.09 s | none | 3.0 s | **8.0 s** |
| "is manish here today what's his update" (first loop run) | update: plays the approved clip | 1.18 s | none | none | **3.6 s** (the update) |

The answers heard: "Manish owns and drives the Telugu build. As of the tracker on the sixth of
November, six work packages are merged and live ... There's no ship date in his records yet, so I'll
flag that for Manish"; "I don't have anything about a budget for the Hyderabad school pilot in
Manish's records. I'll flag it for Manish so he can confirm."

## What the build takes from this

- **"Peer" is not a reliable word to spot.** It came back as "pier" (1d), as "here" at the start of a
  line ("here who is driving ..."), as "ipa" for "AI Peer", and a leading "Peer," vanished once. The
  rules accept those homophones, treat a line-initial "here who/what/when ..." as the Peer, catch
  "Manish's assistant" and "for the Peer", and send a question about the owner or the owner's topics
  that names no one to the warm session as "maybe" (it replies PASS when the line is not for the
  Peer). The scene's lines address the Peer the way people do ("a question for Manish's assistant").
- One utterance can come as two finals ("i have a question for manish's assistant" + "who is driving
  ...") on one bot and as one on the other: the Peer merges a speaker's finals over a short window.
- The Peer drops lines spoken by itself (by participant name) and reads only its own bot's stream.
- Clips go out one at a time; a stop exists if a clip must be cut.
- The local voice says "Manish" so that the transcript reads "a niche": the walk uses ElevenLabs.
