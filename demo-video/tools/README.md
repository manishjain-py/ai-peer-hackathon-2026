# Tools for the demo video

All run with `uv run --quiet <tool>` (each file names its own Python packages) or `bash`.

| Tool | What it does |
|---|---|
| `falgen.py` | Runs one fal.ai endpoint from a request file (JSON), prints the expected cost, **refuses a call that would pass the cap**, waits, downloads the outputs, appends a row to the ledger. `--dry-run` shows cost and cap only; `--summary` prints the ledger totals. Reads `FAL_KEY` from the environment. |
| `gen-wp1.sh` | `falgen.py` with work package 1's ledger (`demo-video/ledger/wp1.csv`), cap ($15) and session name fixed. Copy it for a new package. |
| `sheet.py` | A labelled contact sheet (JPEG) from a small JSON spec. |
| `align_check.py` | Do edited stills still share the base still's room and camera? Prints the pixel shift and where the picture changed. |
| `vgrid.sh` | One picture of a clip: a grid of frames spread over its length, to review a take. |
| `person_matte.py` | A matte video of the person in a clip, made on this Mac with an open person detector (free). |
| `double_composite.py` | Lays the person of one plate over another plate as a double made of light (mint glow, see-through, shimmer); can let the double move real things. |
| `compare_film.py` | Up to three takes side by side in one labelled 1080p film. |

A request file holds the endpoint, the inputs, the price you expect and the output path. A local
input is written `"file:<path from the repo root>"` and is uploaded for the call. Every request
file is kept beside its output (`requests/`), so any take can be made again:
`demo-video/tools/gen-wp1.sh --force <request.json>`.

Notes: this Mac's ffmpeg has no text filter, so labels are drawn with Pillow. `person_matte.py`
uses Ultralytics YOLO (AGPL licence): fine for making the film here, not for shipping inside the
product. The font is Manrope (SIL Open Font License, `fonts/OFL.txt`).
