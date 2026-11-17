#!/usr/bin/env python3
"""Verify or safely overlay the materialized Moss reference bundle. Standard library only."""
from pathlib import Path, PurePosixPath
import argparse, hashlib, json, shutil, stat, zipfile

CONTENTS = 'docs/prototype-moss-handoff/TRANSFER-CONTENTS.json'
POINTER = b'version https://git-lfs.github.com/spec/v1'
GROUPS = ('reference_images', 'selected_action_sprites', 'provider_source_takes', 'reference_videos', 'font_files')

def safe_path(name):
    p = PurePosixPath(name)
    if not name or '\\' in name or ':' in name or p.is_absolute() or p.as_posix() != name or any(x in ('', '.', '..', '.git', '.build', 'node_modules', '__pycache__') for x in p.parts):
        raise ValueError('Unsafe archive path: ' + name)
    if p.parts[0] not in ('demo-video', 'docs'):
        raise ValueError('Unexpected archive root: ' + name)
    return p

def digest(stream):
    first = stream.read(1048576)
    if first.startswith(POINTER):
        raise ValueError('LFS pointer found instead of materialized bytes')
    h = hashlib.sha256(first); size = len(first)
    while True:
        block = stream.read(1048576)
        if not block: break
        h.update(block); size += len(block)
    return size, h.hexdigest()

def check_materialized_manifest(read_bytes, entries):
    manifest = json.loads(read_bytes('docs/prototype-moss-handoff/asset-manifest.json'))
    count = 0
    for group in GROUPS:
        for asset in manifest[group]:
            expected = entries[asset['path']]
            if expected['bytes'] != asset['bytes'] or expected['sha256'] != asset['sha256']:
                raise ValueError('Asset manifest mismatch: ' + asset['path'])
            count += 1
    return count

def verify_zip(path):
    with zipfile.ZipFile(path) as z:
        infos = z.infolist(); names = [i.filename for i in infos]
        if len(names) != len(set(names)) or len(names) != len({n.casefold() for n in names}):
            raise ValueError('Duplicate or case-colliding ZIP paths')
        for info in infos:
            safe_path(info.filename)
            if info.is_dir() or stat.S_ISLNK(info.external_attr >> 16):
                raise ValueError('ZIP must contain regular files only')
        index = json.loads(z.read(CONTENTS))
        entries = {e['path']: e for e in index['files']}
        if len(entries) != len(index['files']) or set(names) != set(entries) | {CONTENTS}:
            raise ValueError('ZIP entries differ from transfer contents')
        # Include the generated contents index in the pointer scan too.
        with z.open(CONTENTS) as f: digest(f)
        for name, item in entries.items():
            with z.open(name) as f: size, sha = digest(f)
            if (size, sha) != (item['bytes'], item['sha256']):
                raise ValueError('Transfer hash mismatch: ' + name)
        count = check_materialized_manifest(z.read, entries)
        return {'archive_entries': len(names), 'hashed_payload_files': len(entries), 'asset_manifest_matches': count,
                'lfs_pointers': 0, 'unsafe_paths': 0, 'symlinks': 0, 'crc_and_hashes': 'passed'}

def destination(root, name):
    p = safe_path(name); dest = root.joinpath(*p.parts)
    current = root
    for part in p.parts:
        current = current / part
        if current.is_symlink(): raise ValueError('Refusing existing symlink in destination: ' + str(current))
    if not dest.resolve().is_relative_to(root): raise ValueError('Destination escaped reference root')
    return dest

def verify_root(root):
    root = root.resolve(); index = json.loads((root / CONTENTS).read_text()); entries = {e['path']: e for e in index['files']}
    for name, item in entries.items():
        p = destination(root, name)
        with p.open('rb') as f: size, sha = digest(f)
        if (size, sha) != (item['bytes'], item['sha256']): raise ValueError('Extracted file mismatch: ' + name)
    with (root / CONTENTS).open('rb') as f: digest(f)
    count = check_materialized_manifest(lambda name: destination(root, name).read_bytes(), entries)
    return {'verified_extracted_files': len(entries) + 1, 'asset_manifest_matches': count, 'lfs_pointers': 0, 'result': 'passed'}

def overlay(archive, root):
    root = root.resolve()
    if not root.is_dir(): raise ValueError('Choose the existing copied demo reference directory')
    verify_zip(archive)
    with zipfile.ZipFile(archive) as z:
        paths = [(info, destination(root, info.filename)) for info in z.infolist()]
        for info, dest in paths:
            dest.parent.mkdir(parents=True, exist_ok=True)
            with z.open(info) as source, dest.open('wb') as target: shutil.copyfileobj(source, target, 1048576)
    return verify_root(root)

def main():
    p = argparse.ArgumentParser(description=__doc__)
    group = p.add_mutually_exclusive_group(required=True)
    group.add_argument('--zip', type=Path); group.add_argument('--root', type=Path)
    p.add_argument('--extract-to', type=Path, help='With --zip: verify, merge files into existing reference, then verify extraction')
    args = p.parse_args()
    if args.extract_to and not args.zip: p.error('--extract-to requires --zip')
    result = overlay(args.zip, args.extract_to) if args.extract_to else verify_zip(args.zip) if args.zip else verify_root(args.root)
    print(json.dumps(result, indent=2))

if __name__ == '__main__': main()
