#!/usr/bin/env bash
# Rebuild route P's take from its two plates. Free: everything here runs on this Mac.
#   1. p-matte.mp4 is the person lifted out of plate 2 (made once with person_matte.py; kept in the repo).
#   2. double_composite.py lays that person over plate 1 as a double made of light.
# Run from anywhere:  demo-video/look/hero-tests/p/make-composite.sh [output.mp4]
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
tools="$(cd "${here}/../../../tools" && pwd)"
out="${1:-${here}/p-composite.mp4}"
# To remake the matte (downloads a 120 MB model into the current folder the first time):
#   uv run --quiet --python 3.12 "${tools}/person_matte.py" "${here}/p-plate2.mp4" "${here}/p-matte.mp4"
uv run --quiet "${tools}/double_composite.py" \
  --base "${here}/p-plate1.mp4" --figure "${here}/p-plate2.mp4" --matte "${here}/p-matte.mp4" --refine \
  --gain 2.6 --tint 0.3 --lift 0.3 --rim 0.3 --inner-rim 1.5 --halo 0.9 --spill 0.7 \
  --opacity "0:0,0.5:0,1.3:0.5,3.5:0.7,5:0.88" \
  --world "840,300,1344,768,6.1,0.4" \
  --out "${out}" "${@:2}"
