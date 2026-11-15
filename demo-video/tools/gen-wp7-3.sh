#!/usr/bin/env bash
# Run falgen for WP7 v2 (the Tag blend v2: the hook-2 lip-sync take and the morning desk shot).
# The ledger, the cap ($3.50, the controller's yes, 15 November about 18:55 UTC) and the session name are fixed here, so a call cannot forget them.
#
#   demo-video/tools/gen-wp7-3.sh demo-video/shots/stills/requests/hook-1.json
#   demo-video/tools/gen-wp7-3.sh --dry-run <request.json>     (cost and cap check, no call)
#   demo-video/tools/gen-wp7-3.sh --summary                    (ledger totals)
set -euo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
root="$(cd "${here}/../.." && pwd)"
exec uv run --quiet "${here}/falgen.py" \
  --ledger "${root}/demo-video/ledger/wp7-3.csv" \
  --cap 3.5 \
  --session ai-peer-video-wp7-3 \
  "$@"
