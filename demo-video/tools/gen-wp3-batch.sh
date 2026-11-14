#!/usr/bin/env bash
# Run several request files through gen-wp3.sh, a few at a time (fal.ai queues the rest).
#
#   LOGDIR=<folder for one log per request> [PAR=3] demo-video/tools/gen-wp3-batch.sh A.json B.json ...
#
# Prints one line per request when it ends: its name, its exit code and the cost line of its log.
set -uo pipefail
here="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
par="${PAR:-3}"
logdir="${LOGDIR:?set LOGDIR to a folder for the logs}"
mkdir -p "${logdir}"
export here logdir
run_one() {
  local req="$1" name code
  name="$(basename "${req}" .json)"
  "${here}/gen-wp3.sh" "${req}" > "${logdir}/${name}.log" 2>&1
  code=$?
  echo "${name}: exit ${code}; $(grep -E '^(cost|REFUSED|FAILED|ERROR)' "${logdir}/${name}.log" | tail -1 | cut -c1-200)"
}
export -f run_one
printf '%s\n' "$@" | xargs -P "${par}" -I{} bash -c 'run_one "{}"'
