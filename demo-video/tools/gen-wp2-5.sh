#!/usr/bin/env bash
# Run falgen for ai-peer-video-wp2-5 (Draft 3, Phase C: the Peer's entrance and its return).
# The ledger, the cap ($25 for Phase C, by the order of V19) and the session name are fixed here, so a call cannot forget them.
#
#   demo-video/tools/gen-wp2-5.sh demo-video/look/peer-entrance/requests/<request>.json
#   demo-video/tools/gen-wp2-5.sh --dry-run <request.json>     (cost and cap check, no call)
#   demo-video/tools/gen-wp2-5.sh --summary                    (ledger totals)
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="$(cd "${here}/../.." && pwd)"
exec uv run --quiet "${here}/falgen.py" \
  --ledger "${root}/demo-video/ledger/wp2-5.csv" \
  --cap 25 \
  --session ai-peer-video-wp2-5 \
  "$@"
