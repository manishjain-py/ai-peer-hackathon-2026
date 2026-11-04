#!/bin/bash
set -euo pipefail
video_dir="$(cd "$(dirname "$0")/.." && pwd)"
project_dir="$(cd "$video_dir/.." && pwd)"
ffmpeg -hide_banner -y \
  -i "$project_dir/renders/ai-peer-draft-01-silent.mp4" \
  -i "$video_dir/public/audio/mixed.wav" \
  -i "$video_dir/public/audio/captions.srt" \
  -map 0:v:0 -map 1:a:0 -map 2:0 \
  -c:v copy -c:a aac -b:a 256k -c:s mov_text \
  -metadata title="AI Peer — Hackathon 2026 — Concept Draft 01" \
  -metadata:s:s:0 language=eng -disposition:s:0 0 \
  -t 120 -movflags +faststart \
  "$project_dir/renders/ai-peer-draft-01.mp4"
cp "$video_dir/public/audio/captions.srt" "$project_dir/renders/ai-peer-draft-01.srt"
