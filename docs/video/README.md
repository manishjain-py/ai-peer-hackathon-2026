# Video production index

Load this file when the task concerns the film. Product changes belong in [idea docs](../idea/overview.md); the latest verified export belongs in [current state](../progress/current-state.md).

Documentation refreshed **4 November 2026**. Draft 07 was completed and privately
delivered on **19 September 2026**. The **1 November audit** verified unchanged
media and production-manifest hashes. Creative acceptance or targeted feedback
remains pending; no new render or delivery is needed to resume this project.
The commands below rebuild existing versions. Use new versioned paths for an
authorized revision and preserve every delivered draft.

## Draft 07

Draft 07 targets the opening and Zoom: a seated photographic employee with
changing expressions, and a clearly staged cross-team premium-chargebacks sync
with generic participant names. Runtime: 263 seconds (4:23). Other scenes retain
their content. See [storyboard](draft-07-storyboard.md), [audio](draft-07-audio.md),
[verification](draft-07-verification.md) and
[decision](../decisions/0007-seated-photo-and-cross-team-sync.md).

From `video/`:

```sh
npm run typecheck
npm run stills:07
npm run preview:07
bash scripts/finalize-07.sh --preview
npm run render:07
npm run finalize:07
```

Output: `renders/ai-peer-draft-07.mp4`. Use its own script, actual word timing and
`public/draft07/audio/mixed.wav`; the mix is muxed only once. Latest verified
completion and delivery are in [current state](../progress/current-state.md).

Draft 07 imports earlier shared source and audio modules and reuses selected
Draft 06 WAVs. Preserve older assets, timing, `work/draft06/audio-clips/` and the
audio environment under `work/draft03/`. The 15-file production manifest is not
a portable dependency bundle; do not delete `work/` as disposable scratch.

## Draft 06

Draft 06 incorporates the completed five-point feedback round: a happy-to-stressed
employee opening; separate BOBO, Slack, Zoom and missed-notification chapters;
new ElevenLabs speech; and concrete source previews and actions. Runtime:
240 seconds (4:00). See the [storyboard](draft-06-storyboard.md) and
[decision](../decisions/0006-clear-use-cases-and-natural-voices.md).

From `video/`:

```sh
npm run typecheck
npm run stills:06
npm run preview:06
bash scripts/finalize-06.sh --preview
npm run render:06
npm run finalize:06
```

Only `public/draft06/audio/mixed.wav` is muxed. `script.json` sets scene timing;
`audio/timing.json` supplies the selected ElevenLabs clip/word timings. The final
artifact is `renders/ai-peer-draft-06.mp4`, with a separate SRT. Preview and final
must be regenerated after any caption/timing change. Latest verified completion
and delivery remain in [current state](../progress/current-state.md).

## Draft 05

Draft 05 uses real Risk Partner Systems context from the user-supplied file and
adds the proposed AirChat AI Peer plugin for local/uncommitted work. Runtime:
196 seconds (3:16). See [storyboard](draft-05-storyboard.md),
[audio](draft-05-audio.md) and [verification](draft-05-verification.md).

From `video/`:

```sh
npm run typecheck
npm run stills:05
npm run render:05
npm run finalize:05
```

A smaller review copy uses `npm run preview:05` followed by
`bash scripts/finalize-05.sh --preview`. The final output is
`renders/ai-peer-draft-05.mp4`. The script, actual word timing and mixed soundtrack
are in `public/draft05/`; no Sourcegraph scene or voice remains in this version.
Real context, authored interactions and proposed integration are distinct.

## Draft 04

Draft 04 is 179.5 seconds (2:59.5). It adds the seated-person attention-circle
opening and explicit personal setup, then preserves Draft 03’s brief and
conversations. See [storyboard](draft-04-storyboard.md),
[audio](draft-04-audio.md) and [verification](draft-04-verification.md).

From `video/`:

```sh
npm run typecheck
npm run stills:04
npm run render:04
npm run finalize:04
```

For a smaller review copy, run `npm run preview:04` and
`bash scripts/finalize-04.sh --preview`. Output: `renders/ai-peer-draft-04.mp4`.
The composition uses `public/draft04/script.json` and only its `audio/mixed.wav`.
Source screens are authored illustrative reconstructions; no live data fetches occur.

## Draft 03

Draft 03 is 166.5 seconds and centers personal awareness alongside Slack
and Zoom collaboration. See [storyboard](draft-03-storyboard.md),
[audio](draft-03-audio.md), and [verification](draft-03-verification.md).

From `video/`:

```sh
npm run typecheck
npm run stills:03
npm run render:03
npm run finalize:03
```

`npm run preview:03` and `bash scripts/finalize-03.sh --preview` produce a smaller
review copy. The final artifact is `renders/ai-peer-draft-03.mp4`. Scene boundaries
and duration come directly from `public/draft03/script.json`; no post-render trim
map is needed. Use only `public/draft03/audio/mixed.wav`. The 26-line cast is newly
generated with local Qwen3, with exact selected clips and recognition timing
retained. Rebuild details and model provenance are in the audio notes.

## Draft 02

Draft 02 expands the story into realistic Slack and Zoom conversations.
Its editorial target is 224.1 seconds (3:44.1). See [storyboard](draft-02-storyboard.md),
[audio](draft-02-audio.md) and [verification](draft-02-verification.md).

From `video/`:

```sh
npm run typecheck
npm run stills:02
npm run render:02
npm run finalize:02
```

`npm run preview:02` followed by `bash scripts/finalize-02.sh --preview` makes
a 960×540 review copy. The full output is `renders/ai-peer-draft-02.mp4`.
The source script is 240 seconds; `public/draft02/edit.json` maps it to the shorter
final timeline. Rebuild audio with `audio_build_02.py`; `--edit-only` reapplies
the cut map without regenerating voices. Draft 02 has visible captions and a
separate SRT. Use only its edited mix, never the original mix or overlapping stems.

Draft 01 remains preserved below.

## Draft 01 reading routes (historical)

- Story and scene order: [draft-01-storyboard.md](draft-01-storyboard.md)
- Voice, music, effects and timing: [audio.md](audio.md)
- Final export and checks: [draft-01-verification.md](draft-01-verification.md)
- Original illustration assets: [illustration-notes.md](illustration-notes.md)
- Visual reference analysis: [reference index](../../references/README.md)
- Timeline implementation: [Film.tsx](../../video/src/Film.tsx)
- Actual narration and word timings: [timing.json](../../video/public/audio/timing.json)
- Root setup: [video package](../../video/package.json), [render script](../../video/scripts/render.mjs)

## Rebuild Draft 01 (historical)

Requirements: Node.js, npm, FFmpeg, and a compatible Chromium browser. The render script uses Google Chrome on this Mac if available. Dependencies are pinned in package-lock.json. Manrope is bundled locally from the open font package; no remote fonts are fetched during rendering.

From the project root:

```sh
cd video
npm ci
npm run typecheck
npm run stills
npm run render
bash scripts/finalize.sh
```

The visual export is silent so FFmpeg can combine the already-mixed soundtrack and optional English captions without re-encoding the picture. The final artifact is `renders/ai-peer-draft-01.mp4`.

`npm run studio` opens the editable timeline. The final MP4 is the authoritative sound-and-picture review artifact. See [audio.md](audio.md) before regenerating voices; the existing WAV assets are sufficient for ordinary visual edits.

## Draft 01 output contract (historical)

- 120 seconds / 3,600 frames at 30 fps
- 1920×1080, H.264, yuv420p
- AAC stereo soundtrack; separate voice/music/effects retained
- Soft English captions in MP4 and a separate SRT
- All UI content is authored and illustrative

## Review practice

Check the rendered stills for clipping and hierarchy. Check full scene timing against narration, transitions and music. Inspect the final MP4's duration, streams and audio levels. Record checks actually performed; do not call numerical audio checks a listening review. Preserve earlier drafts when the creative direction changes.
