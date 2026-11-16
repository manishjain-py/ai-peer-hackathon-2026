# Hand-off: generated mascot assets to audition renderer

16 November 2026, 14:13 UTC. Dated, never edited. The source worker finishes this clean asset step and stops; the controller starts one fresh renderer worker. No model helpers or other workers are running.

## Read first

1. `demo-video/docs/BRIEF-GENERATED-MASCOTS-2026-11-16.md` and DESIGN V33: Manish wants substantially more creative, happy and attractive mascots than the first code-only set. He explicitly authorizes his Gemini image account and/or fal.ai and asks us to inspect the image-generation method in Learn Like Magic.
2. `demo-video/mascot-exploration-v2/README.md`, `PROVIDER-RESEARCH.md`, `concepts.json`, `motion-manifest.json`, `asset-metadata.json`, `ledger/summary.json`.
3. The approved `demo-video/film/renders/blended-tag-v2.mp4` remains the base. Keep all story, scenes, timing, layout, voices and music. The previous twelve options also remain intact.

Worktree: `/Users/manishjain/.codex/worktrees/generated-mascots/ai-peer-hackathon-2026`.
Branch: `codex/generated-mascots`. Continue this branch, not another work package. The assets and this note are pushed. **No PR yet**: one PR will cover this entire round after the final audition videos are ready and visually accepted. Parent controller handles Telegram and shared STATE. Do not send messages externally yourself.

## What is done

- **25 separately generated 2048×2048 character masters**, using the direct Gemini API and the user's authorized local Gemini credential. HTTP200 on all; original prompts and safe token metadata retained. One pilot (Moss) plus the controller's24 directions. The source worker never imported or ran the other app, called its production APIs or changed its files.
- **25 true-alpha provider cutouts**, fal BiRefNet, all validated as RGBA with alpha0–255. Every input was newly generated generic character art. No real name, company name, product screen or private media was uploaded.
- **23 actual character-animation takes**, fal H3 Max Turbo, five seconds at768p, different gestures per character. Nori05 and Dew15 use their provider-alpha stills to preserve translucent material detail; describe their future movement honestly. Moss25 uses the second pilot, with a proper paw wave, closed-eye smile and head tilt. All other motions likewise contain real generated movement inside the character.
- **23 VP9-alpha WebM sprites**, with chroma removal **and final despill applied**. Parent approved the despill demonstration on dark green; it removes magenta fringe without eroding fur. All23 clips fully decoded without errors and carry alpha_mode1. See `evidence/asset-checks.json`.
- A5×5 overview and five larger groups in `renders/overview.jpg` and `renders/group-1.jpg` … `group-5.jpg`. Worker and parent inspected all25 still/cutout designs: strong varied material/silhouette, coherent warm theme, complete framing.
- `asset-metadata.json` holds each original size, alpha bounds, bottom-centre anchor and suggested scene height. Source tools/requests/ledgers make this portable.

No in-demo audition reels have been rendered yet. Do not report the work as fully delivered.

## Assets and methods

For `NN-name` (names/numbers in `concepts.json`):

- `images/NN-name.png`: original generated master.
- `cutouts/NN-name.png`: provider alpha cutout.
- `images/NN-name-chroma.png`: generated character composited on magenta, the only image sent for animation.
- `motion/NN-name-source.mp4`: generated take, except Moss source is `images/spike-moss-motion-v2.mp4`.
- `motion/NN-name.webm`: chosen alpha/despilled sprite. Absent only for Nori05/Dew15, intentionally.
- Each generated response/request is preserved. `images/spike-moss-motion.mp4` is the weaker first pilot, retained as evidence; use v2.

**Alpha inspection:** when ffmpeg reads VP9 alpha, put `-c:v libvpx-vp9` BEFORE `-i`; its default decoder can discard alpha. Chrome's normal video element handles WebM alpha. These clips are silent; use original film audio for audition excerpts.

`tools/rematte.py` is the accepted final filter. `tools/animate_all.py` does only the initial key, so run rematte after any replacement generation. The final filter removes `min(red-green, blue-green)` spill from red/blue where positive and retains the alpha plane. This corrected the earlier pink edge seen at feet/outer fur. Do not erode the fuzzy silhouette. Still cutouts have a subtle pale fringe at full scale; inspect on both cream and dark backgrounds during compositing.

The source worker inspected the Moss animation pilots. **Other takes still need per-candidate motion/in-demo review** (no claim of a full motion visual walk yet). Metadata/decode checks passed for all23.

## Recommended next implementation

Reuse the successful source-scene approach from `demo-video/mascot-options/render.mjs` as a reference, but create new renderer/art adapter in `demo-video/mascot-exploration-v2/`. Do not overwrite that old set.

The earlier renderer calls `film/build.mjs` with `cut: blended-tag-v2` into an ignored cache, then overrides ONLY the mascot module, avatars and mark in that disposable build. It captures the existing source scene functions and video frames, preserving context. The sampled slots avoid the baked setup walkthrough and use the native paper morning-brief scene for the UI comparison. It updates `window.__mascotTime` and waits for video seeks.

Create a raster `buildTag()` pose adapter that respects the original x/y/s/rotation/opacity/anchor choreography. A generated alpha video inside an SVG foreignObject or HTML layer is a possible route; a true-alpha still image is the fallback for Nori/Dew. Preserve the fullbody shape for room and UI, add a tasteful separate **Ram's AI Peer · AI** identity label. The existing title/Zoom/Slack surfaces already carry identity too. Do not simply overlay it on the old tag; replace the source mascot as before.

Use the alpha bounding boxes to scale and anchor each subject consistently rather than using the whole2048-square margins. **Avatars/logos need a deliberate head/upper-body crop**, especially Bram's wings/tail and Nori's gills, so the face reads at48–64px. Keep whole-body silhouettes for hero, room and UI. Inspect the first completed candidate on dark and cream before batching all25.

Suggested identical audition structure (already worked in Round1):

| Reel | Original source time |
|---|---|
|0–3s|New ROUND2 number/name character introduction, genuine motion where available|
|3–9s|14–20s phone-to-desk entrance|
|9–14s|76.5–81.5s Zoom|
|14–19.4s|105.6–111s paper morning brief|
|19.4–23.3s|115.7–119.6s closing mark|

Same original audio excerpts. Parent is happy with this short reel format; no25full-length films needed. The first3s should clearly show the new richer character and name. This is where fringe removal matters most. Parent has promised a quick-look reel: concatenate the25intro segments into75s, so Manish can shortlist before the in-context previews. This inexpensive assembly is part of the remaining delivery.

Make compact720p send copies, sensible1080p masters (~7MB in the earlier round atCRF25), per-option encoded-frame sheets, a local gallery and final evidence/report. Avoid hundreds of MB of grain per short export; high-rate intermediates stay ignored. `*.webm` is LFS-scoped by this folder's `.gitattributes`.

### Runtime facts

- Node `/opt/homebrew/bin/node`; ffmpeg/ffprobe installed; Chrome at `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome`.
- Bundled Playwright package directory `/Users/manishjain/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules`.
- Python with Pillow `/Users/manishjain/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3`.
- This new worktree initially has LFS pointers for older public video assets; run `git lfs checkout 'demo-video/**'` before building. The shared local objects are present from prior work. Do not fetch/private-inspect the old concept film.

## Spend and privacy

Current completed round cost **$6.826079**: Gemini$1.566079 estimate from token usage × official rates; fal$5.26 conservative ledger amounts. Project total **$48.906079**, prior total$42.08. Round hard cap$15; **$8.173921 remains**. No paid request is still running. Gemini cap5 + fal cap10 prevent combined round overrun. Check the ledgers before any new paid call. The$50 project notification has **not** yet been needed; parent must notify if new spend crosses it.

Official current model/price links are in PROVIDER-RESEARCH. Credential access, if required again: the user's authorized local Gemini key is `GEMINI_API_KEY` in the other app's `llm-backend/.env`; use the key loader without printing content. `FAL_KEY` is already in the shell environment. Never print or save either. No OpenAI API key is needed or authorized here.

The old private-term list is absent on this Mac. Do not claim that scan passed. Public-input/new-art provenance, changed-file inspection and visual checks are the evidence. Do not open private recordings or private folders.

## Controller and delivery status

Parent already sent Moss's original raster pilot toTelegram (13:56UTC), the early six-material sheet, and the complete25overview successfully at14:10UTC. Do not resend these yourself. Final25audition clips and five large groups are **not** yet delivered. The user has not selected a mascot.

Parent's current visual shortlist is open: Moss25, Miso01, Mallow03, Ember16, Quill22, pending motion/readability in the film. These are recommendations, not a decision.

When auditions pass their manual walk: commit/push source/media/evidence, create and attach one PR, ask parent for visual-walk acceptance, then merge on its instruction. Parent handles delivery receipts, finalSTATE and cleanup. Preserve the approved Tag master SHA256 `7756283021b7237605337f079e435babb25143c2fb1d9023e6b70204a952b039`.
