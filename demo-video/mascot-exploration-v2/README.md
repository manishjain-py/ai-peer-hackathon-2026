# Round 2: 25 generated mascot directions

Requested by Manish on 16 November 2026 (DESIGN V33). The first twelve code-drawn options were too constrained. This round uses original AI-generated raster character design, then generated character acting where suitable. The approved Tag v2 film remains the base; no full-film replacement has been chosen.

**Asset phase complete; in-demo audition render phase remains.** `renders/overview.jpg` and `renders/group-1.jpg` through `group-5.jpg` show all 25 options. `concepts.json` contains names, personalities and individual art directions. Master art is in `images/NN-name.png`, true-alpha cutouts in `cutouts/NN-name.png`. `asset-metadata.json` records their bounds and anchors.

## Generation method

Read-only inspection of Learn Like Magic found its image-generation service uses Gemini's direct `generateContent` API, while its standalone sticker workflow generates an image and then extracts an alpha cutout. This package uses that same request pattern in an independent tool; it does not import or run that application's code, call production services, or write to its repository.

The user's Gemini credential was loaded into memory from the authorized local configuration and sent only in the `x-goog-api-key` header. No key is in a URL, request file, output, log or repository file. The user also expressly authorized fal.ai. Only generic character prompts and newly generated original characters were sent to these providers—no person name, company name, product screen or private recording.

The image-generation skill was read. The explicit Gemini/fal provider request governs this round. The provider calls below do not use the OpenAI CLI fallback or any OpenAI API credential.

### Models and official references checked on 16 November

- **Gemini Nano Banana 2.1** (`gemini-nano-banana-2.1`): direct account/model probe returned HTTP200 with `generateContent` supported. Each of the 25 images is a separate 2K request. Google's current documentation recommends this successor to the 3.1 Flash Image model used in the inspected app. [Image API](https://ai.google.dev/gemini-api/docs/image-generation), [pricing](https://ai.google.dev/gemini-api/docs/pricing).
- **fal BiRefNet**, General Use (Heavy), 2048 resolution, PNG, foreground refinement: extracts true alpha from each original image. [API](https://fal.ai/models/fal-ai/birefnet/api).
- **fal MiniMax H3 Max Turbo**: character-only five-second takes, 768P, individual gestures, fixed camera. Public standard pricing changed on 16 November to $0.04/s at768p; the account's live base quote was lower, so the ledger keeps the conservative public-rate estimate. [API](https://fal.ai/models/minimax/h3-max-turbo/image-to-video/api), [pricing information](https://fal.ai/models/minimax/h3-max-turbo/image-to-video).

There are **23 generated motion takes**. Nori05 and Dew15 retain their provider-alpha still artwork to preserve translucent material detail; their later composed movement must be described accurately. All other options have real generated eye/head/limb/wing/tail/fabric movement, rather than only a rigid whole-sprite bob. `motion-manifest.json` names each method. Moss25 uses the second pilot, which has a clearer wave, closed-eye smile and head tilt; the subdued first take is preserved as experiment evidence.

## Motion and alpha

`motion/NN-name-source.mp4` holds the provider take. Moss's selected source is `images/spike-moss-motion-v2.mp4`. `motion/NN-name.webm` holds its VP9 alpha sprite. The generic generated character is placed on a magenta plate before the video call. Local chroma extraction removes the plate; an edge despill removes residual magenta without shrinking the wool silhouette. These are compositing operations, not replacement character drawing.

`tools/rematte.py` holds the accepted extraction and despill filter. The controller inspected `evidence/moss-despill-sheet.png` on dark green and approved the result. Other takes still need per-option in-demo/motion inspection in the render phase. When inspecting a VP9-alpha clip with ffmpeg, select `-c:v libvpx-vp9` **before** `-i`; the default decoder can discard alpha. Chrome's WebM player handles the alpha directly.

## Cost and guardrails

At asset handoff: **$6.826079** for this round, conservatively recorded; **$48.906079** project total including the prior $42.08. Gemini: $1.566079 from provider token usage × published rates, not an invoice. Fal: $5.26 conservative ledger amounts. There were 25 Gemini image calls and 49 fal calls (25 cutouts, two Moss animation pilots,22 other animation takes). No paid call is still pending.

The round cap is **$15 total**. Gemini's runner enforces a $5 cap; fal's existing tool enforces $10 including in-flight reservations. These subcaps sum to the round cap. No subscription was bought. The $50 project milestone has not yet been reached; the controller must notify Manish if subsequent work passes it. See `ledger/summary.json`, `gemini.jsonl`, `fal.csv` and request/response metadata.

## Asset inspection and reproducibility

All 25 stills and their cutout overview were inspected by the worker and controller for material variety, coherent palette, warmth, silhouette, and complete framing. Moss's motion pilots were inspected as frame sheets. The second pilot and despill were accepted. This is **not** a claim that all final in-film auditions are finished or motion-reviewed.

- `tools/gemini_images.py`: one credential-safe request, cap reservation and token-cost reconciliation; no auto-retry of uncertain paid calls.
- `tools/generate_all.py`: bounded concurrency3 for the 24 directions; Moss is the retained pilot/bonus25.
- `tools/cutouts.py`: bounded concurrency2, existing fal budget guard, alpha validation and magenta plate composition.
- `tools/animate_all.py`: bounded concurrency2, individual generated gestures and explicit translucent exceptions.
- `tools/rematte.py`: the final despill pass on all23 clips (run after `animate_all.py`; that script's first matte does not apply the final despill).
- `tools/make_boards.py`: overview, five larger groups and alpha-bound metadata.

No application test suite or CI was added. Generation validation uses actual output images, alpha channels, metadata and visual inspection. The approved source film and previous twelve options are untouched. The renderer successor's instructions are in `docs/handoffs/HANDOFF-2026-11-16-generated-mascots-render.md` relative to `demo-video/`.
