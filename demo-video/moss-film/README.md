# Moss full blended film, version 1

Manish selected Round 2 option 25, Moss, for a complete film trial (DESIGN V34). The new
master is `../film/renders/blended-moss-v1.mp4`; its Telegram copy is
`../film/renders/blended-moss-v1-720p.mp4`. The previously approved Tag v2 master and sources
remain untouched. Moss V1 is a candidate awaiting Manish's review, not an approval record.

## What changed

The complete Tag walkthrough is rebuilt as `../ui-concepts/moss/`: landing and setup,
all six source cards and sign-in steps, learned context, the brief, Ask and rules. Its
fictional data, words, camera keys and section times are the same. Moss is slightly shorter
in the dense UI than in room scenes, and its landing position clears the page copy.
The AI identity badge rises with the character during jumps. For rules, Moss moves beside
a separate green card: the original card bounds, six rules, appearance timing and text
remain. Presentation artwork is mirrored to point toward the content; badge text stays
normal. The calm read-only sentence is separated from the badge.

Every full-film appearance uses Moss: room entrance and laptop wake/glide, small portraits,
Zoom, Slack, morning room/desk, return to phone, native morning brief, globe captions and
closing logo. The new cut `../film/cuts/blended-moss-v1/` retains all 20 shot slots and the
exact 119.6-second timeline. Six walkthrough clip spans and speeds match Tag v2.

## Character art and acting

The identity comes from the selected existing `../mascot-exploration-v2/` Moss assets:
original image/cutout, `motion/25-moss.webm` and `avatars/25-moss.png`.
Two additional genuine character-only takes use the already authorized fal MiniMax H3 Max
Turbo path: attentive eye/head movement with a paw-to-chin thought, and an open-arm
presentation/nod. Their prompts, provider response metadata, original takes and alpha
sprites are in `requests/`, `assets/` and `ledger/fal.csv`. No product screens, person or
company details, or private recordings were sent to a provider. The generic selected
Moss art is the sole uploaded reference. No new image design or voice/music was generated.

The existing imagegen skill was read; Manish's explicit Gemini/fal authorization determines
the provider route. New cost is **$0.40**, conservatively recorded at $0.20 per five-second
request; project total **$49.306079** (previous $48.906079). No other paid call is pending.
The $10 package allocation and $100 project cap are respected; the $50 milestone was not crossed.

Greeting, attentive and presentation takes are selected deliberately by scene time. These
are generated body/face/limb gestures, plus composed travel and squash from the original
scene choreography. They are not speech lip-sync. The source-reading loop uses later
attentive frames, never restarting the greeting pose. Thoughtful and presenting holds
use bounded portions of the gestures. Chroma extraction and edge despill are local
compositing operations, using the previously accepted Round 2 method.

## Rebuild

Requires Node, Chrome, ffmpeg/ffprobe, Playwright and uv/Pillow. The renderer uses the installed
Playwright package or the Codex bundled runtime (`CODEX_NODE_MODULES` can override it).
Materialize the public demo media with Git LFS. No private folder or credential is read during
rendering. Do not rerun generation merely to rebuild a movie.

```sh
git lfs checkout 'demo-video/**'
node demo-video/moss-film/render.mjs --probe
node demo-video/moss-film/render.mjs
node demo-video/moss-film/render.mjs --film --probe
node demo-video/moss-film/render.mjs --film
python3 demo-video/moss-film/tools/verify.py
```

First the renderer produces the 58-second clean source clip at
`../ui-concepts/renders/moss-clean-v1.mp4` (only 2.8–57.5 seconds are used). The film build
uses the same six in-points, durations and playback speeds as Tag v2. It then renders the
full 3588-frame cut in two ordered segments. Every image capture waits for scene video
seeks and the active alpha character clip. Encoding is asynchronous, keeping the local
media server responsive. Selected media are in Git LFS; `.build/` caches are ignored.

The final master and 720p copy **stream-copy the original AAC soundtrack** from Tag v2,
with no remix or audio re-encoding. Verification compares packet data and timing, decoded
audio hashes, frame counts, durations and source invariants. No direct listening is claimed.

See `MANUAL-REVIEW.md`, the labeled source/encoded sheets and `evidence/checks.json` for
actual visual and media validation. No unit tests or CI were added. The old private-term
list is unavailable on this Mac, so no pass of that scan is claimed; public-source provenance
and the changed files were inspected instead.
