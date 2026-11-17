# Moss v4: introduction and laptop-only morning

V37 fills the existing introduction with a clear product definition, in the same Matilda
voice and on the setup home: a proactive AI teammate,24/7. The two visible benefits arrive
with the voice: keeping Ram informed, and covering when he is away. Moss presents them;
the setup button remains, with one continuous home through the22s slot boundary and a
transition into the existing setup at24.6.

V38 removes the external Moss figures from the morning wake and desk shots. Careful camera
reframing keeps both physical phones out of view while preserving Ram, the laptop greeting
and the attached push into its screen. The final word/hold of the morning caption moves left
at102.2, clear of the laptop. No speech is hidden. The greeting is the only morning Moss.

V3 and all older sources/exports remain preserved. Total duration stays119.600s/3588frames.
No new mascot art was generated; existing selected takes are reused. Root/controller owns
voice/audio, documented in `audio/README.md`. New paid voice cost$0.0106; total$51.398527.

## Rebuild

No private source or credential is needed for rendering saved media. Requirements: Node,
Google Chrome, Playwright, ffmpeg/ffprobe, Python3,uv/Pillow. The renderer can use Codex's
bundled Playwright runtime; override with`CODEX_NODE_MODULES` when needed.

```sh
node demo-video/moss-introduction/audio/build_mix.mjs
node demo-video/moss-introduction/render.mjs --probe
# Default: preserve original V3 picture outside the changed GOP spans.
node demo-video/moss-introduction/render.mjs
# Optional full deterministic rebuild of all scenes:
node demo-video/moss-introduction/render.mjs --full
python3 demo-video/moss-introduction/tools/verify.py
python3 demo-video/moss-introduction/tools/encoded_proof.py
```

`--times=15,18.8,24.6,102.2 --label=detail` captures selected source frames. Frame capture
awaits video seeks and two animation frames, with software compositing to avoid stale video
surfaces. New code lives in`layer/`; cut in`../film/cuts/blended-moss-v4/`. Full rebuild uses
all saved sources, including the unchanged V3 clean walkthrough from24.6 onward.

## Precise patch assembly

New scene capture covers frames420–737(14–24.6s) and3000–3167(100–105.6s). V3 has safe IDR
boundaries at14,28.566667,100,113.633333. `tools/assemble_patch.py` therefore encodes those
two complete GOP spans with normal H.264 High profile. The bridges24.6–28.566667 and
105.6–113.633333 use actual decoded V3 pictures; only their compression changes. Every
other GOP is stream-copied. A baseline split/rejoin spike proved all3588 decoded frames
identical with unchanged119.6s timing before building on this method.

Final verification compares decoded frame hashes outside these declared GOP spans. The720p
copy derives from the assembled master and stream-copies its AAC. The V3 mixed PCM remains
exact outside14–24.6, including its original music cues and resolved ending; controller's
`audio/pcm-preservation.json` records that proof. No direct listening claim is made.

Source proof is complete; final exports and encoded checks follow before delivery. Controller
owns final acceptance/Telegram receipts, shared docs and creative-review status.
