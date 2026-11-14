#!/usr/bin/env bash
# deliver: turn a raw generated clip into the delivery format of demo-video/docs/SHOTS.md:
# H.264 MP4, 1920x1080, yuv420p, the clip's own frame rate. The picture is scaled up to cover
# 1920x1080 and the few extra pixels are cropped (never stretched). Sound, if any, is kept as AAC.
#
#   demo-video/tools/deliver.sh RAW.mp4 OUT.mp4 [crf=16] [extra video filters, placed before the scale]
set -euo pipefail
raw="$1"; out="$2"; crf="${3:-16}"; pre="${4:-}"
vf="scale=1920:1080:force_original_aspect_ratio=increase:flags=lanczos,crop=1920:1080,setsar=1,format=yuv420p"
if [ -n "${pre}" ]; then vf="${pre},${vf}"; fi
ffmpeg -v error -y -i "${raw}" -vf "${vf}" -c:v libx264 -preset slow -crf "${crf}" -pix_fmt yuv420p \
  -movflags +faststart -c:a aac -b:a 192k "${out}"
ffprobe -v error -select_streams v:0 -show_entries stream=width,height,r_frame_rate,pix_fmt,nb_frames,duration \
  -of csv=p=0 "${out}" | sed "s|^|$(basename "${out}"): |"
