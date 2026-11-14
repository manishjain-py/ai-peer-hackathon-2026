#!/usr/bin/env bash
# Run falgen for ai-peer-video-wp2-4 (Draft 3: Phase A samples, Phase C entrance and return).
# The ledger, the cap ($8 for Phase A; raise to 33 only for Phase C, by the order of V19) and the session name are fixed here, so a call cannot forget them.
#
#   demo-video/tools/gen-wp2-4.sh demo-video/shots/stills/requests/hook-1.json
#   demo-video/tools/gen-wp2-4.sh --dry-run <request.json>     (cost and cap check, no call)
#   demo-video/tools/gen-wp2-4.sh --summary                    (ledger totals)
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="$(cd "${here}/../.." && pwd)"
exec uv run --quiet "${here}/falgen.py" \
  --ledger "${root}/demo-video/ledger/wp2-4.csv" \
  --cap 8 \
  --session ai-peer-video-wp2-4 \
  "$@"
