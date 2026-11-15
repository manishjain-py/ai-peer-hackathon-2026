---
name: gotcha_playwright_install_deletes_shared_browsers
description: "`playwright install` on a shared Mac first deletes every browser build in ~/Library/Caches/ms-playwright that no registered Playwright install still uses; put PLAYWRIGHT_SKIP_BROWSER_GC=1 in front so it only adds"
metadata:
  type: reference
---

Every Playwright on a Mac (each venv's Python package, each `node_modules`, `npx`) shares one browser
cache, `~/Library/Caches/ms-playwright/`, and registers itself in its `.links/` folder. Before it
downloads anything, `playwright install` runs a clean-up: it reads every `.links` entry, forgets the
ones whose package folder is gone (a removed worktree's `node_modules`), and deletes every browser
folder that no remaining entry uses (read in Playwright 1.62's `coreBundle.js`, `_validateInstallationCache`
and `_deleteStaleBrowsers`, on 2026-11-14). A session in another project then finds its browser gone
mid-run ("Executable doesn't exist at …").

The clean-up is skipped when `PLAYWRIGHT_SKIP_BROWSER_GC` is set. On 2026-11-14 the learnlikemagic
board harness (`~/narrated-scene-proof/venv`, Playwright 1.62, Chromium build 1234) could not launch
on MacBook 64 GB, whose cache held only 1248 and two 1228 links to it;
`PLAYWRIGHT_SKIP_BROWSER_GC=1 ~/narrated-scene-proof/venv/bin/python -m playwright install chromium`
added 1234 and ffmpeg-1011 and kept the rest.

**How to apply:** on any shared Mac, always put `PLAYWRIGHT_SKIP_BROWSER_GC=1` in front of
`playwright install`. Before installing, list the cache and `.links` (each entry is a package path;
its `browsers.json` names the builds it wants). Prove the result with a real launch, not a file check.
A symlink from the wanted build to another one (someone made 1228 -> 1248 on 30 Oct) gives
Playwright a browser it was not built for: install the wanted build instead.
