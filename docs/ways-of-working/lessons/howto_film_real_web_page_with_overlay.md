---
name: howto-film-real-web-page-with-overlay
description: "A narrated walkthrough film of a REAL web page (not a mock): Playwright drives the live page, an init-script overlay draws captions, pointer, highlights and picture scenes, ElevenLabs clips laid at logged line times; crisp 1080p from a 1280x720 viewport; the overlay's z-order trap"
metadata:
  type: reference
---

Proven 2026-11-12 (learnlikemagic Teacher Feedback QA walkthrough, 4:58, sent as message 21460; scripts kept in
`~/.teacher-feedback-qa/walkthrough/`, README there). Builds on the HTML-mock film recipe
(project memory `howto_narrated_demo_film_from_html.md`).

- **Crisp 1080p:** viewport 1280x720, Chromium launched with `--force-device-scale-factor=1.5`, `recordVideo` size
  1920x1080: full frames, no padding (a 4-second probe take confirms it before the real one).
- **Overlay by init script** (`context.addInitScript({content})`), appended to `<body>` outside the app's root, so SPA
  navigation keeps it: a blackout removed at time zero, the caption band, an SVG pointer moved by CSS transition plus
  a click ripple before each real `locator.click()`, a highlight ring placed from `boundingBox()`, full-screen picture
  scenes (title, a chat mock, a phone, the end card). Each line logs `performance.now()`; ffmpeg lays its clip there.
- **Trap: z-order.** The scene layer sat above the caption band, so every picture scene lost its captions; a rehearsal
  screenshot sheet showed it, and a take went to waste. Captions must be the top layer below the pointer.
- **Rehearse first:** `--preview` with short lines and a screenshot per line; view them as 640x360 tiles, 12 a sheet.
  A ring caught mid-transition in a short preview line is not a bug.
- **Check the film:** caption-band scene changes (`crop` + `select='gt(scene,0.01)'`) and speech starts
  (`silencedetect`) against the logged line times (both within 55 ms here); speech-to-text of every clip; size under
  50 MB for a Telegram bot upload.
- **Data the page writes during the take** (a press, a run's post) means a reset before every take: the record script
  calls the seed's `reset` itself.
