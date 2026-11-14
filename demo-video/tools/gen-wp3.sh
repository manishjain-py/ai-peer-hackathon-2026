#!/usr/bin/env bash
# Run falgen for work package 3 (the nine AI shots with people).
# The ledger, the cap ($60) and the session name are fixed here, so a call cannot forget them.
#
#   demo-video/tools/gen-wp3.sh demo-video/shots/stills/requests/hook-1.json
#   demo-video/tools/gen-wp3.sh --dry-run <request.json>     (cost and cap check, no call)
#   demo-video/tools/gen-wp3.sh --summary                    (ledger totals)
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="$(cd "${here}/../.." && pwd)"
exec uv run --quiet "${here}/falgen.py" \
  --ledger "${root}/demo-video/ledger/wp3.csv" \
  --cap 60 \
  --session ai-peer-video-wp3 \
  "$@"
