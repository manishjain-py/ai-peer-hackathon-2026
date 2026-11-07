# Repository and restoration

Source control was introduced on **4 November 2026** at Manish's request. The film
project was imported into a private GitHub repository on `main`, with all 1,666
unique media objects (about 3.7 GB) in Git LFS; remote download availability was
verified. See [current state](../progress/current-state.md) for the latest status.
The dated 1 November handoff describes the pre-Git folder.

## What this copy holds

This is a hand-off copy of the AI Peer repository, with the film under `film/`.
It uses **no Git LFS**. It keeps the documentation, the references, the original
idea, every draft's source and scripts, the text inputs under `video/public/`
(scripts, timing, captions, review notes) and one render:
`renders/ai-peer-draft-07.mp4` (Draft 07, 4:23) with its captions
`renders/ai-peer-draft-07.srt`.

Every other render, preview and silent picture, the stills, all audio (mixed WAVs
and stems), the Draft 07 opening photos, the Draft 02 webcam image, the `work/`
folder (selected clips, alignment caches, provenance, manifests, QA reports and
delivery receipts) and the user-supplied work-profile file stayed in the original
repository. Older docs still link to them as history. Draft 07 depends on older
source modules and on Draft 06 selected audio, so re-rendering a draft or
rebuilding its audio needs those files from the original repository first.

## What the original repository preserves

There, Git tracks project documentation, the source material, every draft's
source and scripts, public assets, completed exports, intermediate pictures,
review stills and the retained `work/` production files, with binary media in
Git LFS. A checkout without LFS content is not a complete production checkout.
The source manifest covers only 15 frozen Draft 07 inputs; it is not the full
dependency inventory.

Ignore rules exclude installed `video/node_modules`, Remotion/build caches, Python
bytecode, the audio virtual environment, downloaded model caches and local
credentials. A repository is not a machine backup, and a clean clone still
requires runtime installation.

## Set up on another machine

From `film/`:

```sh
npm --prefix video ci
npm --prefix video run typecheck
```

Film rendering also needs FFmpeg and a compatible Chromium browser. The saved
render scripts use Google Chrome's macOS application path. Check the
[production guide](../video/README.md) before adapting another machine. There is
no need to rebuild a delivered film merely to restore or resume the project.

For authorized audio work, the original environment was Python 3.12 at
`work/draft03/audio-venv/bin/python` in the original repository, whose import
evidence keeps its package snapshot. Pinned requirements are in
`video/scripts/audio-requirements.txt` and `audio-requirements-03.txt`. This is a
record of the original Mac environment, not a tested cross-platform lockfile.
Some packages/models require platform-specific installation. Older local-voice
drafts also need their separately downloadable model caches.

## Credentials

The ElevenLabs builders (`audio_build_06.py`, `audio_build_07.py`) read
`ELEVENLABS_API_KEY` from the environment, or else from an `ELEVENLABS_API_KEY=...`
line in `~/.ai-peer/.env`. They hold the key in memory only and never print it.
Do not commit tokens. A different machine needs its own credentials; repository
access does not provide live company access.

## Continue work

Start from [current state](../progress/current-state.md) and [AGENTS.md](../../AGENTS.md).
Preserve Draft 07 and use new versioned paths for any authorized revision.
Fetch before comparing local and remote `main`; never force-push to resolve a
divergence without investigating it. Private repository storage is distinct from
public publication, which still needs an explicit request.
