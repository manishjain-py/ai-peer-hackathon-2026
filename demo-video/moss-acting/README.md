# Moss acting pass, version 2

**Preserved V35 version.** Latest: [Moss v4](../film/renders/blended-moss-v4.mp4), with
[rebuild guide](../moss-introduction/README.md) and [V37/V38 delivery](../docs/MOSS-V4-DELIVERY-2026-11-17.md).
The original timing/audio claims below describe v2.

V35 makes Moss act on the context of each moment while preserving the full film's story,
UI, camera keys, caption/narration timing and original music/voice. V1 and Tag v2 are retained.
The exact performance decisions are in `ACTING-MAP.md` and deterministic schedules in
`../ui-concepts/moss-v2/acting.js`.

## New performance

Moss holds a small blank notebook while reading each source, scans toward its card and
makes short real pencil strokes once the key fact is revealed. It reviews what it learned,
presents the brief, listens during question entry, thinks after submission, and guides
attention to the sourced answer. Rules use restrained reassurance. The meeting tile shows
Moss's body so listening, update, thought and notebook activity can actually be seen. The
notebook returns only after “I'll put it in his morning brief”; no commitment is implied.
The morning brief waits for Ram's actual click, then acknowledges it with one small nod.
Small brand marks stay still, and the phone origin/return timing is preserved.

The original greeting, attentive/thinking and presenting takes are reused where appropriate.
Four new character-only video takes add notebook activity, listening, reassurance and a
single acknowledgment. A single Gemini identity-preserving keyframe adds the notebook and
pencil. All preserve the chosen felt Moss, curled sage sprout, cream face/belly and amber
pendant. No product UI, company content, person or private recording went to the providers.
Requests, prompts, results, original takes, selected alpha videos and ledger are saved here.
The existing imagegen guidance informed prompts; the user's explicit Gemini/fal authorization
sets this workflow. No new audio, voice, music or lip-sync is used.

## Rebuild

Node, Chrome, ffmpeg/ffprobe, Playwright and uv/Pillow are required. Only public repository
media is read; generation does not run during rendering. `git lfs pull --include="demo-video/**" --exclude=""`
materializes all needed sources. If Playwright is not installed locally, the renderer uses
Codex's bundled runtime; `CODEX_NODE_MODULES` can override that path.

```sh
# Before source encoding: live V2 source inside the unchanged full-film captions.
node demo-video/moss-acting/render.mjs --film --live-walk-probe --acting-proof
node demo-video/moss-acting/render.mjs --film --live-walk-probe --probe
# Encode the clean 58s source, then the full movie with its original AAC stream.
node demo-video/moss-acting/render.mjs
node demo-video/moss-acting/render.mjs --film
python3 demo-video/moss-acting/tools/verify.py
python3 demo-video/moss-acting/tools/encoded_proof.py
```

Before the clean V2 source exists, the live proof uses V1 only as the hidden baked-video
reference in an ignored temporary cut configuration; visible walkthrough pixels come from
the V2 source iframe. No V1 copy is written as a V2 deliverable. The actual movie build always
requires `moss-clean-v2.mp4`, including its landing still for the laptop push-in.

The complete 119.600s movie is `../film/renders/blended-moss-v2.mp4`; the send copy is
`../film/renders/blended-moss-v2-720p.mp4`. Encoding is asynchronous so the local media server
stays responsive. Frame capture waits for every visible actor/video seek. VP9 alpha must be
decoded using `-c:v libvpx-vp9` before `-i` when extracting via ffmpeg. Build caches, provider
locks and upload caches are ignored; selected media use LFS.

## Cost and limitations

New cost: $0.859070 ($0.059070 Gemini token estimate, $0.80 conservative fal ledger), taking
project spend from $49.306079 to $50.165149. No pending call or further generation planned.
Controller sent the required $50 notification; receipt is in the shared delivery records.
No direct audio listening or unavailable private-term-list scan is claimed. Existing
fictional sources and generic art are the sole inputs. All audio is stream-copied and
compared by packet/timing and decoded hashes. See `MANUAL-REVIEW.md` and `evidence/checks.json`
for the completed visual/media acceptance. The controller accepted 86 final scene frames,
64 scene/action boundaries and 22 send-copy frames; both exports fully decode and exactly
preserve all 5,608 original AAC packets/timing and the decoded audio hash.
