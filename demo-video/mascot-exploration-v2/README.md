# Round 2: 25 generated mascot directions

Requested by Manish on 16 November 2026 (DESIGN V33). The first twelve code-drawn options were too constrained. This preserved collection uses original AI-generated raster character design, then generated character acting where suitable, with Tag v2 as its base. Manish selected Moss (25) for the full V34 trial; the latest complete review movie is now [Moss v3](../film/renders/blended-moss-v3.mp4), refined under V36. See the [current delivery record](../docs/MOSS-V3-DELIVERY-2026-11-17.md) and [v3 source](../moss-refinement/README.md). Moss v1 is retained as the original full trial; Tag v2 remains the last explicitly approved full movie.

**The collection is complete:** 25 comparable 23.3-second in-demo auditions, 720p send copies and 1080p masters, a 75-second quick-look reel, and a local shortlist gallery. Open `index.html`. `renders/overview.jpg` and `renders/group-1.jpg` through `group-5.jpg` show all 25 options. `concepts.json` contains names, personalities and individual art directions. Master art is in `images/NN-name.png`, true-alpha cutouts in `cutouts/NN-name.png`. `asset-metadata.json` records their bounds and anchors.

## Generation method

Read-only inspection of Learn Like Magic found its image-generation service uses Gemini's direct `generateContent` API, while its standalone sticker workflow generates an image and then extracts an alpha cutout. This package uses that same request pattern in an independent tool; it does not import or run that application's code, call production services, or write to its repository.

The user's Gemini credential was loaded into memory from the authorized local configuration and sent only in the `x-goog-api-key` header. No key is in a URL, request file, output, log or repository file. The user also expressly authorized fal.ai. Only generic character prompts and newly generated original characters were sent to these providers—no person name, company name, product screen or private recording.

The image-generation skill was read. The explicit Gemini/fal provider request governs this round. The provider calls below do not use the OpenAI CLI fallback or any OpenAI API credential.

### Models and official references checked on 16 November

- **Gemini Nano Banana 2.1** (`gemini-nano-banana-2.1`): direct account/model probe returned HTTP 200 with `generateContent` supported. Each of the 25 images is a separate 2K request. Google's current documentation recommends this successor to the 3.1 Flash Image model used in the inspected app. [Image API](https://ai.google.dev/gemini-api/docs/image-generation), [pricing](https://ai.google.dev/gemini-api/docs/pricing).
- **fal BiRefNet**, General Use (Heavy), 2048 resolution, PNG, foreground refinement: extracts true alpha from each original image. [API](https://fal.ai/models/fal-ai/birefnet/api).
- **fal MiniMax H3 Max Turbo**: character-only five-second takes, 768P, individual gestures, fixed camera. Public standard pricing changed on 16 November to $0.04/s at 768p; the account's live base quote was lower, so the ledger keeps the conservative public-rate estimate. [API](https://fal.ai/models/minimax/h3-max-turbo/image-to-video/api), [pricing information](https://fal.ai/models/minimax/h3-max-turbo/image-to-video).

There are **23 generated motion takes**. Nori (05) and Dew (15) retain their provider-alpha still artwork to preserve translucent material detail; their later composed movement must be described accurately. All other options have real generated eye/head/limb/wing/tail/fabric movement, rather than only a rigid whole-sprite bob. `motion-manifest.json` names each method. Moss (25) uses the second pilot, which has a clearer wave, closed-eye smile and head tilt; the subdued first take is preserved as experiment evidence.

## Motion and alpha

`motion/NN-name-source.mp4` holds the provider take. Moss's selected source is `images/spike-moss-motion-v2.mp4`. `motion/NN-name.webm` holds its VP9 alpha sprite. The generic generated character is placed on a magenta plate before the video call. Local chroma extraction removes the plate; an edge despill removes residual magenta without shrinking the wool silhouette. These are compositing operations, not replacement character drawing.

`tools/rematte.py` holds the accepted extraction and despill filter. The controller inspected `evidence/moss-despill-sheet.png` on dark green and approved the result. All 23 takes were inspected as five-time frame sheets on cream and forest backgrounds, then each final encoded audition was checked in the film contexts. Sora and Manta use complete safe sections of their takes to exclude provider-edge clipping. See `MANUAL-REVIEW.md`. When inspecting a VP9-alpha clip with ffmpeg, select `-c:v libvpx-vp9` **before** `-i`; the default decoder can discard alpha. Chrome's WebM player handles the alpha directly.

## Cost and guardrails

At completion (rendering added no paid calls): **$6.826079** for this round, conservatively recorded; **$48.906079** project total including the prior $42.08. Gemini: $1.566079 from provider token usage × published rates, not an invoice. Fal: $5.26 conservative ledger amounts. There were 25 Gemini image calls and 49 fal calls (25 cutouts, two Moss animation pilots, 22 other animation takes). No paid call is still pending.

This round's cap was **$15 total**. Gemini's runner enforces a $5 cap; fal's existing tool enforces $10 including in-flight reservations. These subcaps sum to the round cap. No subscription was bought. The project was below $50 at this round's completion; later Moss acting work crossed it and the notice was sent (Telegram 23097). Use [STATE](../docs/STATE.md) for the current total and notification status. This round's unchanged accounting remains in `ledger/summary.json`, `ledger/gemini.jsonl`, `ledger/fal.csv` and request/response metadata.

## Asset inspection and reproducibility

All 25 stills and their cutout overview were inspected by the worker and controller for material variety, coherent palette, warmth, silhouette, and complete framing. The renderer worker inspected all 23 motion sheets, all 25 small-face crops, and every final encoded audition sheet. The controller accepted the Moss/Nori pilots before the rest of the batch. `MANUAL-REVIEW.md` records the visual walk, source-window choices and limitations; `evidence/render-checks.json` records full decodes, exact frame counts, file sizes and the unchanged approved-master hash.

- `tools/gemini_images.py`: one credential-safe request, cap reservation and token-cost reconciliation; no auto-retry of uncertain paid calls.
- `tools/generate_all.py`: bounded concurrency 3 for the 24 directions; Moss is the retained pilot/bonus 25.
- `tools/cutouts.py`: bounded concurrency 2, existing fal budget guard, alpha validation and magenta plate composition.
- `tools/animate_all.py`: bounded concurrency 2, individual generated gestures and explicit translucent exceptions.
- `tools/rematte.py`: the final despill pass on all 23 clips (run after `animate_all.py`; that script's first matte does not apply the final despill).
- `tools/make_boards.py`: overview, five larger groups and alpha-bound metadata.

No application test suite or CI was added. Generation validation uses actual output images, alpha channels, metadata and visual inspection. The approved source film and previous twelve options are untouched. The original asset-to-render handoff remains in `docs/handoffs/HANDOFF-2026-11-16-generated-mascots-render.md` relative to `demo-video/`. The controller's final delivery note is linked from `demo-video/docs/STATE.md`.


## Watch and compare

- `index.html`: portable local gallery, video player, original-art links and browser-local shortlist.
- `renders/quick-look-75s.mp4`: all 25 introductions in number order, three seconds each. The 1080p version is `quick-look-75s-1080p.mp4`. A quiet excerpt of the existing approved instrumental bed has opening and closing fades; no new audio was generated.
- `renders/NN-name.mp4`: compact 720p audition. `NN-name-1080p.mp4` is the corresponding master.
- `renders/NN-name-encoded.jpg`: eight decoded frames from the final send copy; `NN-name-sheet.png` is the separate source-scene probe sheet.
- `evidence/avatar-framing.jpg`: all 25 face crops at 96, 64 and 48 pixels.

Every audition uses the same timeline: 3s character introduction, source 14–20s phone/desk entrance,
76.5–81.5s meeting, 105.6–111s paper morning brief, 115.7–119.6s closing card. The source excerpts
keep their original audio. Room and UI companions use full-body generated art; avatars, caption
portraits and closing marks use deliberate still face crops. The body carries a separate AI identity
label. Nori (05) and Dew (15) use provider-alpha still artwork with composed movement, stated in their
intro and gallery. The other 23 have internal generated character acting.

These auditions cover four representative contexts. They are not 25 full-length replacement films,
and they do not claim that a new character is integrated into every setup/walkthrough recording.
No final mascot selection is implied by the gallery's local shortlist.

## Rebuild the local previews

Requirements: Node 22+, Chrome, ffmpeg/ffprobe, Python with Pillow, and Playwright. The renderer
uses installed Playwright or the Codex bundled runtime (override `CODEX_NODE_MODULES` if needed).
All rendering inputs are public repository assets. No credential or private folder is required.

```sh
git lfs checkout 'demo-video/**'
python3 demo-video/mascot-exploration-v2/tools/prepare_render_assets.py
node demo-video/mascot-exploration-v2/render.mjs --all --jobs=2
python3 demo-video/mascot-exploration-v2/tools/finish_reels.py
python3 demo-video/mascot-exploration-v2/tools/make_gallery.py
node demo-video/mascot-exploration-v2/tools/check_gallery.mjs
```

For a single candidate, replace `--all` with its lower-case ID, such as `moss`. `--probe` captures
still scene checks without encoding a video. `--skip-existing` resumes after a completed batch;
final media verification must still pass. Two local render slots are supported without blocking
the local asset server during encoding. No unit tests or CI were added.

The ignored `.build/` folder holds public source copies, intermediate video and the intro assembly.
Rendering never invokes the paid-generation tools. Original prompts, provider results and
ledgers are retained so any separately authorized future regeneration remains auditable.
