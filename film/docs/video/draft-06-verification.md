# Draft 06 verification

The four-minute exports passed technical verification on **2026-09-19**.
Independent visual-review details are recorded separately below.

## Actual exported files

| Property | Full film | Review copy |
|---|---|---|
| File | [ai-peer-draft-06.mp4](../../renders/ai-peer-draft-06.mp4) | [ai-peer-draft-06-preview.mp4](../../renders/ai-peer-draft-06-preview.mp4) |
| Dimensions | 1920×1080 | 960×540 |
| Duration | 240.000 seconds | 240.000 seconds |
| Picture | H.264, 30 fps, 7,200 frames | H.264, 30 fps, 7,200 frames |
| Audio | AAC-LC, stereo, 48 kHz | AAC-LC, stereo, 48 kHz |
| Encoded loudness / true peak | −16.0 LUFS / −2.7 dBTP | −16.0 LUFS / −2.7 dBTP |
| File bytes | 23,378,607 | 10,130,883 |
| Full decode | Pass, no errors | Pass, no errors |
| Fast start | Pass | Pass |
| Separate captions | 79 exact source-matching cues | 79 exact source-matching cues |

The picture contains visible captions. There is no additional embedded subtitle
stream that would duplicate them. Both SRT files are non-overlapping and fit
within the film. All 39 spoken lines use newly generated ElevenLabs performances
at native speed, with exact script words mapped from vendor character timings.

[Combined technical audit](../../work/draft06/final-technical-qa.json),
[full-file audit](../../work/draft06/full-technical-qa.json), and
[preview audit](../../work/draft06/preview-technical-qa.json) retain the checks.

## Review and corrections

TypeScript passed. Thirty-nine integrated 1080p proof states were rendered with
final caption timing. Independent script and design reviews corrected the
purchased-item expiry wording, the BOBO owner action, Gmail read-state wording,
comparison-card opacity, click coordinates and invitation accepted-state copy.
All identified issues were resolved before final encoding.

The opening received a separate 45-frame encoded review of arrival, sitting,
work, mounting anxiety and relief. An independent design reviewer inspected
25 integrated stills and 42 temporal samples from the encoded preview; no blocker
remained. The full-film reviewer inspected 145 encoded preview samples and seven final
1080p spots, covering all scenes, chapter boundaries and dense action timing. No
blocking issue remained. Final 1080p spot frames are retained in
`work/draft06/final-spots/`.

- [Creative direction](../../work/draft06/creative-review-initial.md)
- [Script review](../../work/draft06/script-review.md)
- [Source and opening review](../../work/draft06/independent-visual-review.md)
- [Independent design review](../../work/draft06/independent-design-review.md)
- [Final film review](../../work/draft06/final-film-review.md)
- [Audio casting, alignment and checks](draft-06-audio.md)

These are sampled visual reviews and programmatic full-file decoding, not
uninterrupted human playback. **Direct audio listening was unavailable.**
Speech-recognition checks assessed wording and helped select the clearer
narrator; they do not establish subjective naturalness or musical taste.

## Integrity

Full MP4 SHA-256:
`f14372ae6597356800e0651852c6c249adaddd03c8a913538c6b421d2e42f7a3`

Preview MP4 SHA-256:
`f4419fe1d7652af56772692b3172ccda3c3bc92a487b0f76e56f20f944b6ecf4`

Script SHA-256:
`66cb480c15183c8109d50445a58a9e551a553ecf59a2ff770cbff5c39fecdb52`

The [frozen source manifest](../../work/draft06/source-manifest.json) covers
12 production files. Their hashes still matched after both exports completed.
Earlier drafts and the original supplied source remain preserved.

## Reality and delivery

The film is an authored concept. User-supplied work facts and reported experiences
are separate from simulated dialogue, invitations, announcements, interfaces and
outcomes. No live product or AirChat integration was built, no company message
was sent and no calendar invitation was actually answered.

Private Telegram delivery succeeded under the existing review workflow: message
**4911**, 23,378,607 bytes. [Confirmed receipt](../../work/draft06/telegram-delivery.json).
There was no public publication. The app file-opening request returned queued.
