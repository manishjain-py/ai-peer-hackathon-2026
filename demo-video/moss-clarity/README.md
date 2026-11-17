# Moss v6: clarity, physical selection and a direct call to action

V41 rebuilds the public fictional-data film from editable source at 3840×2160, 30 fps.
The logical 1920px composition is captured at 2× device density; the world canvas and
Earth renderer also use 2× backing resolution. The setup walkthrough runs live from
`ui-concepts/moss-v6`, never by magnifying a compressed walkthrough movie. UI grain
and all spoken subtitle overlays are absent. Original human footage retains its true
native limits; this does not claim that every shot was photographed/generated at 4K.

The learned and brief sections are one continuous, full-width vertical document with
larger, darker text. Camera/Moss focus moves down as the brief begins. Ask retains the
physical confidence stamp and source citations. The full-width green board retains
three trust rules in large text. One “Ram’s AI Peer” identity remains; redundant AI pills
are removed, including the cached setup crossfade and morning footer.

Zoom ends at 79, Slack runs 79–88 and the information ocean 88–100. Slack has 2.25 seconds
of actual typing, a separate reply arrival, and a shorter readable final focus. Each
of three paper cards is attached to a short felt paw during its own reach, grasp,
carry, place and release; Moss’s body travels with it. The quiet source stream stays
behind the physical foreground. No new paid visual generation was needed.

The wake excerpt is source 0.8–1.5 s: Ram rises, then the film cuts at 100.7 directly to
the laptop. The source-action sheet proves that turn/reach/pick-up starts later and is
not included. Greeting projects into the laptop and enters the populated brief, whose
original human decision and acknowledgment remain. The ending reads exactly “Create
your AI Peer today” and “ai-peer.sandcastle.musta.ch”. Imagery provenance lives off-screen
in source documentation, delivery records and exported MP4 metadata.

## Rebuild

Node, Chrome, Playwright, ffmpeg/ffprobe and uv/Pillow are required. All selected assets
are saved; an ordinary rebuild does not call any generation provider or use private data.

```sh
node demo-video/moss-clarity/audio/build_mix.mjs
node demo-video/moss-clarity/render.mjs --probe
node demo-video/moss-clarity/render.mjs --full
python3 demo-video/moss-clarity/tools/verify.py
```

Use `--times=24.55,43,54.14,76.1,91.2,100.4,117.4 --label=detail --probe` for selected
native source frames. `--range=88,100` produces a 1080p motion review. `--setup-frame`
rebuilds the 4K setup crossfade still from the same live source; it requires the saved
crossfade to exist already and is only needed after editing that setup source.

Final master: `../film/renders/blended-moss-v6.mp4`. Delivery:
`../film/renders/blended-moss-v6-1080p.mp4`. The 4K source capture uses JPEG 99 and H.264
CRF 16, muxed without a second picture generation. The 1080p download uses a two-pass
3 Mbps average with 6.5 Mbps motion allowance and 192 kbps AAC, targeting under 50 MB.

The controller owns voice repair, clean Zoom introduction, music and delivery. Its
`audio/README.md` describes the soundtrack and receipts. Visual source acceptance is
in `MANUAL-REVIEW.md`; final encoded checks are added after the full capture completes.
