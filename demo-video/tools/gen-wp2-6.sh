#!/usr/bin/env bash
# Run falgen for ai-peer-video-wp2-6 (Draft 3, Phase C: the phone as the source, the Zoom colleagues moving).
# The ledger, the cap ($21.26 left of Phase C's $25 after wp2-5's $3.74, by the controller) and the session name are fixed here, so a call cannot forget them.
#
#   demo-video/tools/gen-wp2-6.sh demo-video/look/peer-entrance/requests/<request>.json
#   demo-video/tools/gen-wp2-6.sh --dry-run <request.json>     (cost and cap check, no call)
#   demo-video/tools/gen-wp2-6.sh --summary                    (ledger totals)
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="$(cd "${here}/../.." && pwd)"
exec uv run --quiet "${here}/falgen.py" \
  --ledger "${root}/demo-video/ledger/wp2-6.csv" \
  --cap 21.26 \
  --session ai-peer-video-wp2-6 \
  "$@"
