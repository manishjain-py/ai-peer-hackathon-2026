# Moss v3 controller completion handoff

17 November 2026 UTC. Immutable. V36 is complete and delivered; nothing runs.
Read `../MOSS-V3-DELIVERY-2026-11-17.md`, `../MOSS-V3-ACCEPTANCE-2026-11-17.md` and
`HANDOFF-2026-11-17-moss-v3-worker-complete.md`. The repository is the memory.

Latest review: `demo-video/film/renders/blended-moss-v3.mp4` (1080p, 389,574,799 bytes)
and `blended-moss-v3-720p.mp4` (720p, 20,126,236 bytes). Both:119.600s/3,588 frames/30fps.
Master SHA256: `e1dd89b0d0fbc99d544fdc69ae16539d53acf00ba83c981f567388311ec50841`.
Send-copy SHA256: `7d9d44c6fc3bb861b97e6dcd71b7a2f4cc21fb8ab3ce1e40a6b06f75e077b293`.

All V36 feedback areas are implemented: direct entrance, visible confidence stamping,
removed information/instructions line, speaking mouth motion, active readable Slack,
morning screen greeting/push-in, and a resolved ending from the same music. Original music
PCM is preserved 0–65.9 and 99.9–113.9. Both exports measure -14.1 LUFS/-2.1 dBTP and share
all 5,608 AAC packet payloads/timings. Original 22 voice sources and predecessor film hashes
are unchanged. Controller accepted 84 scene frames, 62 boundaries and 31 720p frames.
Direct listening is not claimed; soundtrack proof combines source, measurements and local STT.

Source and full reproducible recipes live in `demo-video/moss-refinement/`, the UI in
`ui-concepts/moss-v3/`, the cut in `film/cuts/blended-moss-v3/`. The worker's five new generic
motion takes cover three speaking turns, stamping and keyboard typing; one Gemini still
supplies the stamp. The controller built the audio in parallel. One worker was active;
no helper or old Terminal controller was started. Weekly usage was20% at final rendering.

Chrome GPU compositing could leave a stale foreignObject actor after a large seek; use the
saved renderer's software compositing. The actual encoded stamp scene has one actor.
Morning projection must move the room/laptop with the screen; a floating-panel attempt was
fixed before export. Slack's composer must clear the film caption lane. The confidence seal
is held through the words; do not retime from old overlong word-alignment metadata alone.

Telegram video23106 at03:21:32UTC and review23107 at03:21:33UTC are confirmed, with correct
1280×720/120-rounded metadata. Receipt: `docs/delivery/moss-v3-film-2026-11-17.json`.
Do not resend. PR20 merged as `c612624c97ff4c2ca69f5723311e91698f2b5c00`; checkpoint
`blended-moss-v3` pushed. Final worker head: `1996844153fa42d3e3e7ec8e2169228b4a472107`.
Shared current pointers, receipts and this handoff are saved in the controller's completion
commit on main. Canonical main and retained Moss checkouts synchronize to that push.

New cost $1.222778; project $51.387927/$100. No pending paid call. $50 milestone was already
sent; next notice $80. Private recordings and product code remain untouched. The unavailable
source-Mac private-term list was not claimed as a scan. Earlier films/assets are preserved.

Next: Manish's review of Moss v3. Tag v2 remains the last explicitly approved full film;
completion of this revision is not user approval. No implementation work remains.
