# Repository and restoration

Source control was introduced on **4 November 2026** at Manish's request.
The [private GitHub repository](https://github.com/manishjain-py/ai-peer-hackathon-2026)
uses `main`. See [current state](../progress/current-state.md) for the verified
synchronization outcome. The dated 1 November handoff describes the pre-Git folder.

## What is preserved

Git tracks project documentation, the unedited source material, every draft's
source and scripts, public assets, completed exports, intermediate pictures,
review stills, and retained `work/` production files. In particular, Draft 07
depends on older source modules and Draft 06 selected audio. Keep selected WAVs,
alignment JSON, provenance, manifests, QA reports and Telegram receipts.

Binary media uses [Git LFS attributes](../../.gitattributes), keeping full media
content in LFS and small pointers in Git. A source checkout without LFS content
is not a complete production checkout. The source manifest covers only 15 frozen
Draft 07 inputs; it is not the full dependency inventory.

The [ignore rules](../../.gitignore) exclude installed `video/node_modules`,
Remotion/build caches, root `.cache`, Python bytecode, the existing audio virtual
environment, downloaded model caches and machine-local environment credentials.
Those local files are retained on this Mac. The repository does not replace a
machine backup, and a clean clone still requires runtime installation.

## Restore on another machine

Install Git and Git LFS, authenticate to the private repository, then run:

```sh
git clone https://github.com/manishjain-py/ai-peer-hackathon-2026.git
cd ai-peer-hackathon-2026
git lfs install --local
git lfs pull
git switch main
git pull --ff-only
git lfs fsck
npm --prefix video ci
npm --prefix video run typecheck
```

Film rendering also needs FFmpeg and a compatible Chromium browser. The saved
render scripts use Google Chrome's macOS application path. Check the
[production guide](../video/README.md) before adapting another machine. There is
no need to rebuild a delivered film merely to restore or resume the project.

Existing mixed WAVs are sufficient for ordinary visual work. For authorized
audio work, the original environment is Python 3.12 at
`work/draft03/audio-venv/bin/python`. Its installed package snapshot is retained
with the [repository-import evidence](../../work/repository-import-2026-11-04/).
This is a record of the original Mac environment, not a tested cross-platform
lockfile. Some packages/models require platform-specific installation. Older
local-voice drafts also need their separately downloadable model caches.

Provide any ElevenLabs credential separately through the environment. Do not
commit tokens or copy the external Like Magic `.env`. Telegram helpers likewise
use machine-local credentials. A different machine needs its own credentials
and local helper setup; repository access does not provide live company access.

## Continue work

Start from [current state](../progress/current-state.md) and [AGENTS.md](../../AGENTS.md).
Preserve Draft 07 and use new versioned paths for any authorized revision.
Fetch before comparing local and remote `main`; never force-push to resolve a
divergence without investigating it. Private repository storage is distinct from
public publication, which still needs an explicit request.
