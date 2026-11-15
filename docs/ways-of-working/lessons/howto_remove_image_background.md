---
name: howto_remove_image_background
description: "Remove an image's flat background with no PIL or ImageMagick: a Playwright headless canvas flood-fills the near-background colour from the edges to transparent (a dark outline stops the fill), then autocrops; with tsx, pre-define __name first"
metadata:
  type: reference
---

Recorded by 2026-06-19 in mazycub (its gpt-image-1 mascot): that Mac had no PIL or ImageMagick, only
`sips`. What worked: draw the image on a canvas in a Playwright headless page, flood-fill from the
edges every pixel near the background colour to transparent (the subject's dark outline stops the
fill), then autocrop.

**Gotcha:** when the script runs under tsx (esbuild), the function passed to `page.evaluate` is
serialized with injected `__name()` calls that do not exist in the page. Define it before
evaluating: `page.addInitScript("window.__name = window.__name || ((f)=>f);")`.

**How to apply:** check what the machine has first (`python3 -c "import PIL"`, `magick -version`);
use this trick when neither is there or the script already drives Playwright. It relies on a flat
background and an outlined subject.
