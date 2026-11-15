---
name: feedback_choices_go_to_telegram_with_their_material
description: "Manish (2026-11-14): a choice he must make goes to Telegram with its material (picture, sound, clip), he reviews there and answers in the session; the notify scripts send text only, so send files with the Bot API"
metadata:
  type: feedback
---

Manish, 2026-11-14 about 12:20 UTC, in the session `ai-peer-video-controller-2` (the AI Peer demo
video, repo `ai-peer-hackathon-2026`), word for word: "Wherever you need my choice, send it to me on
telegram. I ll review there and reply here".

What had happened: the controller had asked him three things in an hour (a narrator voice from three
audio samples, a clip of three test takes, a sheet of four looks). The files went to the session with
`SendUserFile`; Telegram got only a text line that said "the files are in the session". He was on
Telegram.

**Why (the controller's reading, not his words):** he reads Telegram first, often on his phone. A
question whose material sits somewhere else makes him go and find it. He answers in the session, so
the answer lands where the work is.

**How to apply:**
- A choice that needs his eyes or ears goes to the Attention group as the files themselves, each with
  a short caption, then one text line with the options and the recommendation. The same question
  stays at the top of the session's reply and in its TLDR.
- `tg-notify.sh` and `tg-attention.sh` send text only. Files go through the Bot API: `sendPhoto`,
  `sendAudio`, `sendVideo`, `sendDocument`, with the token read as `tg-notify.sh` reads it and kept
  in a mode-600 curl config file, never in the argument list. Worked example:
  `demo-video/tools/tg-send-file.sh` in `ai-peer-hackathon-2026` (8 files sent with it on 14 November,
  all accepted; a 5 MB clip took a few seconds). Captions hold at most 1,024 characters.
- Shrink a big clip first (a 35 MB 1080p render became 3.3 MB at 720p, `-crf 27`); a bot may send at
  most 50 MB.
- Never send what a project's privacy rule keeps on the Mac (in that repo: real company recordings,
  decision C8). The example script refuses files under `~/.ai-peer/`.
- Scope: said in one initiative. Treat it as his default in any project until he says otherwise, and
  still one question at a time where the questions depend on each other.

Related: [[feedback_design_interview_format]], [[feedback_plain_language_no_codes]],
[[feedback_take_routine_calls_yourself]].
