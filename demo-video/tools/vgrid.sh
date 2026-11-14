#!/usr/bin/env bash
# vgrid: one picture of a clip, as a grid of frames spread evenly over its length (to review a take).
#
#   demo-video/tools/vgrid.sh CLIP.mp4 OUT.jpg [columns=4] [rows=2] [cell width=320]
set -euo pipefail
clip="$1"; out="$2"; cols="${3:-4}"; rows="${4:-2}"; cellw="${5:-320}"
count=$((cols * rows))
duration="$(ffprobe -v error -show_entries format=duration -of csv=p=0 "${clip}")"
# One frame per (duration / count) seconds, starting a little in, so the last cell is near the end.
rate="$(python3 -c "print(${count} / max(float('${duration}') - 0.15, 0.1))")"
ffmpeg -v error -y -i "${clip}" -vf "fps=${rate},scale=${cellw}:-2,tile=${cols}x${rows}:padding=4:color=0x0c1a1e" \
  -frames:v 1 -q:v 3 "${out}"
echo "wrote ${out} (${count} frames of ${duration}s)"
