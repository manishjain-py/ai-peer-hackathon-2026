# Repair a reference copy that contains LFS pointers

17 November 2026. This is a media-delivery repair, not a new mascot/video version or a
change to the target prototype. The Moss v5 media hashes in `asset-manifest.json` stay fixed.

## Receiving-Mac report and source check

The receiving agent reported that the six newer WebM actions (stamp, type and four speaking
actions) and fonts contained actual bytes, but the cutout/avatar, seven older actions,
both V5 movies and frame stills were LFS pointer placeholders. It could only work from
plain-text sources. It requested hydration on the personal Mac and another transfer,
without a personal account download or installation on the company Mac.

The canonical personal-Mac checkout and retained `moss-acting` checkout both contained
all 43 manifest files with matching real bytes before repair. The requested command was
then run successfully on the canonical personal-Mac checkout:

```sh
git lfs pull --include="demo-video/**" --exclude=""
```

The original guide was wrong to classify all WebMs as ordinary Git files. Nested
`.gitattributes` in `mascot-exploration-v2`, `moss-film` and `moss-acting` put the seven
older actions in LFS. The six newer actions and fonts are ordinary Git blobs. **Verify
actual bytes and hashes; the extension or the root attributes alone is insufficient.**
The source-side check does not establish which earlier copying/export step left pointers
on the other Mac. This repair bypasses that uncertainty with a verified filesystem ZIP.

## Ready transfer bundle

On the personal Mac, the repair archive is named:

`Moss-v5-media-transfer-2026-11-17.zip` in the user's Downloads folder.

Its adjacent `.zip.sha256` and `.zip.verification.json` files record the exact archive
checksum, size and completed verification. Copy the ZIP and checksum/report using AirDrop,
a cable or the user's normal file-transfer method. The ZIP is outside Git and is not uploaded
by this workflow. No personal account, Git fetch or new installation is required on the
company Mac.

The bundle is an **overlay for the existing copied demo reference folder**. It includes:

- All 43 manifest files as actual bytes, including both V5 movies, static artwork, selected
  silent alpha actions, fixed-dialogue source provenance and fonts/licenses.
- All 46 public `.jpg`/`.json` files in `demo-video/moss-ocean/evidence/`.
- Current handoff instructions, manifest, transfer notes and standard-library helpers.
- The bounded plain source/data references used by the guide.
- `docs/prototype-moss-handoff/TRANSFER-CONTENTS.json`, listing every payload path, byte
  size and SHA256. No `.git`, `.build`, `node_modules`, old root `film/`, credentials,
  private recordings or unrelated runtime data is included.

The provider-source MP4s are included only because they belong to the 43-file provenance
manifest. The implementation guide still directs runtime use to the silent transparent
WebMs and static cutout/avatar, never their opaque/audio-bearing provider source takes.

## Apply it on the company Mac without replacing folders

Keep the actual prototype separate. Locate the **already copied demo reference root**:
that is the folder containing `demo-video/` and `docs/`. Verify the copied ZIP checksum
against its adjacent `.sha256` file with an existing checksum tool or the receiving agent's
available runtime.

Extract the archive **into that existing reference root**, merging its exact relative
paths and overwriting the corresponding placeholder files. Preserve every other file.
Do not replace/delete the entire `demo-video` or `docs` directory in Finder. With an
available unzip tool, the operation is equivalent to:

```sh
unzip -o "/path/to/Moss-v5-media-transfer-2026-11-17.zip" -d "/path/to/existing-demo-reference"
```

Every archive path has been checked for traversal, absolute paths, duplicates and symlinks.
If the receiving folder has symlinked subdirectories, use the supplied safe overlay helper
instead of extracting through those links. The helper refuses symlink destinations.
Using the receiving environment's existing Python 3.9+ (no packages), it can verify the
ZIP, safely merge the files and verify the result:

```sh
python3 /path/to/verify_media_transfer.py --zip "/path/to/Moss-v5-media-transfer-2026-11-17.zip" --extract-to "/path/to/existing-demo-reference"
```

The verifier is itself inside the ZIP under `docs/prototype-moss-handoff/`; the receiving
agent can first extract just that plain script to a temporary location. Alternatively,
after a normal merge extraction, verify the files in place:

```sh
python3 "/path/to/existing-demo-reference/docs/prototype-moss-handoff/verify_media_transfer.py" --root "/path/to/existing-demo-reference"
```

These helper paths are examples, not source-Mac paths to hard-code. An equivalent check
using an already available runtime is fine. The expected result is all indexed payload
hashes matching, **43 asset-manifest matches and zero LFS pointers**. Extra files already
present in the reference folder are intentionally preserved and are outside this repair's
hash check. The bundle is not a standalone full renderer checkout.

Once verification passes, open the actual V5 movie/frame evidence and resume the existing
prototype implementation using `README.md` and `PASTE-PROMPT.md`. Do not continue guessing
visual behavior from text alone or substitute another mascot because the earlier copy was
incomplete. This transfer does not overwrite or implement the target prototype.

## Rebuild on the personal Mac only

Hydrate there first, then build from materialized working-tree bytes. **Do not use
`git archive` as the media source**: it can export LFS pointer blobs rather than local media.
From the demo repository root:

```sh
git lfs pull --include="demo-video/**" --exclude=""
python3 docs/prototype-moss-handoff/build_media_transfer.py --output "/path/outside/repo/Moss-v5-media-transfer-2026-11-17.zip"
```

The builder refuses missing, pointer, hash-mismatched or symlinked source files. It refuses
to overwrite an existing ZIP. It streams every archive entry back through hash and pointer
checks, checks all manifest files and writes the external checksum/verification report.
The generated contents index belongs in the bundle, not Git. Preserve a completed archive
or use a new filename for a later rebuild. No provider call or media regeneration occurs.
