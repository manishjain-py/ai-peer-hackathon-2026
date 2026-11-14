#!/usr/bin/env bash
# Run falgen for work package 1 (look pictures and hero-shot tests).
# The ledger, the cap ($15) and the session name are fixed here, so a call cannot forget them.
#
#   demo-video/tools/gen-wp1.sh demo-video/look/characters/requests/a-portrait.json
#   demo-video/tools/gen-wp1.sh --dry-run <request.json>     (cost and cap check, no call)
#   demo-video/tools/gen-wp1.sh --summary                    (ledger totals)
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="$(cd "${here}/../.." && pwd)"
exec uv run --quiet "${here}/falgen.py" \
  --ledger "${root}/demo-video/ledger/wp1.csv" \
  --cap 15 \
  --session ai-peer-video-wp1 \
  "$@"
