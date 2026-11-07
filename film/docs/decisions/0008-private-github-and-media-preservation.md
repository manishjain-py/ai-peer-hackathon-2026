# 0008 — Private GitHub repository and media preservation

Date: **2026-11-04**.

## Context

Manish requested that all local changes be pushed to GitHub, incorporated into
`main`, with the local checkout on the latest `main` and documentation current.
The project had no Git history or remote. The connected GitHub account had no
matching AI Peer/Hackathon repository.

## Decision

- Create a private GitHub repository for the project, initialize
  this existing directory on `main`, and import its complete project content.
  There are no earlier branches or pull requests to merge.
- Use Git LFS for binary media, including all previous drafts and retained review
  artifacts. Preserve file bytes; no video or audio is regenerated.
- Replace the blanket `work/` ignore with specific installed-runtime, model,
  build-cache and credential exclusions. Production dependencies, selected audio,
  alignments, provenance, QA and receipts must be versioned.
- Keep the installed local environments/caches on disk and record the audio
  environment for restoration. Git is not a backup of installed runtimes.
- Refresh current-facing documents while keeping the original idea, supplied
  professional context and historical records intact.

The repository is private because it includes the supplied professional context
and production records. This import does not publish a public site or film.
Draft 07 remains complete and awaiting Manish's creative acceptance. No new
revision or live-product implementation is part of this request.

## Verification and continuation

The actual import outcome and checks belong in
[current state](../progress/current-state.md) and the
[session log](../progress/session-log.md). See the
[repository guide](../technical/repository.md) for contents and restoration.

## This copy

A later hand-off copy (7 November 2026) uses no Git LFS. It keeps only the latest
render, `renders/ai-peer-draft-07.mp4`, and its captions; every other render,
still, audio file and the `work/` folder (about 3.7 GB) stayed in the original
repository, so re-rendering needs the audio and stills from there. See
[what this copy holds](../../README.md#what-this-copy-holds).
