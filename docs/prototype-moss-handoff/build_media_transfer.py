#!/usr/bin/env python3
"""Build a verified, materialized overlay from the personal Mac's filesystem. No network."""
from pathlib import Path
import argparse, datetime, hashlib, json, zipfile
from verify_media_transfer import GROUPS, CONTENTS, digest, safe_path, verify_zip

EXTRA_REFERENCES = ['demo-video/docs/MOSS-V5-DELIVERY-2026-11-17.md', 'demo-video/docs/MOSS-V5-ACCEPTANCE-2026-11-17.md', 'demo-video/moss-ocean/README.md', 'demo-video/moss-ocean/ACTING-MAP.md', 'demo-video/moss-ocean/MANUAL-REVIEW.md', 'demo-video/moss-ocean/audio/README.md', 'demo-video/ui-concepts/shared/kit.js', 'demo-video/ui-concepts/shared/data.js', 'demo-video/moss-introduction/layer/src/scenes/mossentrance.js', 'demo-video/moss-introduction/layer/src/scenes/morning-greeting.js', 'demo-video/moss-introduction/layer/src/scenes/clip.js', 'demo-video/moss-ocean/layer/src/scenes/screens.js', 'demo-video/moss-ocean/layer/src/scenes/ocean.js', 'demo-video/moss-ocean/layer/src/mascot/tag/mascot.js', 'demo-video/film/src/scenes/world.js', 'demo-video/film/world.json', 'demo-video/film/cuts/_blend/layer-tag-v2/src/scenes/tagbrief.js', 'demo-video/film/cuts/blended-moss-v5/cut.json', 'demo-video/film/cuts/blended-moss-v5/mix.json', 'demo-video/film/cuts/blended-moss-v5/narration.json', 'demo-video/film/cuts/blended-moss-v5/screens.json', 'demo-video/film/cuts/blended-moss-v5/script.json', 'demo-video/film/cuts/blended-moss-v5/shots.json', 'demo-video/ui-concepts/moss-v3/acting.js', 'demo-video/ui-concepts/moss-v3/concept.json', 'demo-video/ui-concepts/moss-v3/data-extra.js', 'demo-video/ui-concepts/moss-v3/mascot.js', 'demo-video/ui-concepts/moss-v3/motion.js', 'demo-video/ui-concepts/moss-v3/paper.js', 'demo-video/ui-concepts/moss-v3/room.js', 'demo-video/ui-concepts/moss-v3/scene.js', 'demo-video/ui-concepts/moss-v3/style.css', 'demo-video/ui-concepts/moss-v3/tl.js', 'demo-video/ui-concepts/moss-v3/u.js']
HANDOFF = 'docs/prototype-moss-handoff'
DOC_FILES = ('README.md', 'REQUEST-2026-11-17.md', 'PASTE-PROMPT.md', 'asset-manifest.json',
             'MEDIA-TRANSFER.md', 'build_media_transfer.py', 'verify_media_transfer.py')

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('--repo', type=Path, default=Path(__file__).resolve().parents[2])
    parser.add_argument('--output', type=Path, required=True)
    args = parser.parse_args(); root = args.repo.resolve(); output = args.output.resolve()
    if output.is_relative_to(root): raise ValueError('ZIP must be outside the Git repository')
    if output.exists(): raise ValueError('Output exists; preserve it or choose a new filename')
    manifest = json.loads((root / HANDOFF / 'asset-manifest.json').read_text())
    selected = {a['path']: a for group in GROUPS for a in manifest[group]}
    paths = set(selected) | set(EXTRA_REFERENCES) | {HANDOFF + '/' + name for name in DOC_FILES}
    evidence = root / 'demo-video/moss-ocean/evidence'
    evidence_paths = []
    for p in sorted(evidence.iterdir()):
        if p.is_symlink() or not p.is_file() or p.suffix not in ('.jpg', '.json'):
            raise ValueError('Unexpected evidence entry; review before adding: ' + str(p))
        evidence_paths.append(p.relative_to(root).as_posix())
    paths.update(evidence_paths)
    entries = []
    for name in sorted(paths):
        safe_path(name); p = root / name
        if p.is_symlink() or not p.is_file() or not p.resolve().is_relative_to(root):
            raise ValueError('Missing/nonregular/escaped source: ' + name)
        for parent in p.parents:
            if parent == root: break
            if parent.is_symlink(): raise ValueError('Symlinked source: ' + name)
        with p.open('rb') as f: size, sha = digest(f)
        if name in selected and (size, sha) != (selected[name]['bytes'], selected[name]['sha256']):
            raise ValueError('Restore this asset before building: ' + name)
        entries.append({'path': name, 'bytes': size, 'sha256': sha})
    index = {'schema_version': 1, 'kind': 'materialized reference-folder overlay',
             'built_utc': datetime.datetime.now(datetime.timezone.utc).isoformat(),
             'media_reference_commit': manifest['base_commit'], 'asset_manifest_files': len(selected),
             'evidence_files': len(evidence_paths), 'paths_relative_to': 'existing demo reference repository root',
             'files': entries, 'note': 'Merge entries into reference root; preserve unrelated files. Source is real filesystem bytes, not git archive.'}
    output.parent.mkdir(parents=True, exist_ok=True)
    try:
        with zipfile.ZipFile(output, 'x', allowZip64=True) as z:
            for e in entries:
                p = root / e['path']; info = zipfile.ZipInfo(e['path'])
                info.external_attr = 0o100644 << 16
                info.compress_type = zipfile.ZIP_DEFLATED if p.suffix in ('.md', '.json', '.py', '.txt', '.js', '.css') else zipfile.ZIP_STORED
                with p.open('rb') as source, z.open(info, 'w', force_zip64=True) as dest:
                    while block := source.read(1048576): dest.write(block)
            info = zipfile.ZipInfo(CONTENTS); info.external_attr = 0o100644 << 16; info.compress_type = zipfile.ZIP_DEFLATED
            z.writestr(info, json.dumps(index, indent=2, ensure_ascii=False) + '\n')
        report = verify_zip(output)
    except Exception:
        output.unlink(missing_ok=True)
        raise
    with output.open('rb') as f: size, sha = digest(f)
    report.update(archive=str(output), archive_bytes=size, archive_sha256=sha,
                  media_reference_commit=manifest['base_commit'], evidence_files=len(evidence_paths),
                  excluded=['.git', '.build', 'node_modules', 'private recordings', 'credentials', 'old film/'])
    output.with_suffix(output.suffix + '.sha256').write_text(sha + '  ' + output.name + '\n')
    output.with_suffix(output.suffix + '.verification.json').write_text(json.dumps(report, indent=2) + '\n')
    print(json.dumps(report, indent=2))

if __name__ == '__main__': main()
