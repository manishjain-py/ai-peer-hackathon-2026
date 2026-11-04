#!/bin/bash
# Add the completed Draft 05 mix once. Picture already contains visible captions.
set -euo pipefail

video_dir="$(cd "$(dirname "$0")/.." && pwd)"
project_dir="$(cd "$video_dir/.." && pwd)"
suffix=""
case "${1:-}" in
  "") ;;
  --preview) suffix="-preview" ;;
  -h|--help)
    echo "Usage: bash video/scripts/finalize-02.sh [--preview]"
    echo "Default: ai-peer-draft-05-silent.mp4 -> ai-peer-draft-05.mp4"
    echo "Preview: ai-peer-draft-05-preview-silent.mp4 -> ai-peer-draft-05-preview.mp4"
    exit 0
    ;;
  *) echo "Unknown option: $1" >&2; exit 2 ;;
esac
if [[ $# -gt 1 ]]; then
  echo "Expected at most one option: --preview" >&2
  exit 2
fi

silent="$project_dir/renders/ai-peer-draft-05${suffix}-silent.mp4"
mixed="$video_dir/public/draft05/audio/mixed.wav"
captions="$video_dir/public/draft05/audio/captions.srt"
output="$project_dir/renders/ai-peer-draft-05${suffix}.mp4"
temporary="$project_dir/renders/.ai-peer-draft-05${suffix}-finalizing.mp4"

for required in "$silent" "$mixed" "$captions"; do
  if [[ ! -s "$required" ]]; then
    echo "Required input is missing or empty: $required" >&2
    exit 1
  fi
done

audio_duration="$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$mixed")"
video_duration="$(ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "$silent")"
if ! awk -v a="$audio_duration" -v v="$video_duration" 'BEGIN { d=a-v; if (d<0) d=-d; exit !(a>0 && v>0 && d<=0.05) }'; then
  echo "Picture and mix lengths differ: video=${video_duration}s; audio=${audio_duration}s" >&2
  echo "Render picture and audio from the same script revision before finalizing." >&2
  exit 1
fi

trap 'rm -f "$temporary"' EXIT
ffmpeg -hide_banner -y \
  -i "$silent" \
  -i "$mixed" \
  -map 0:v:0 -map 1:a:0 -sn -dn -map_metadata -1 \
  -c:v copy -c:a aac -b:a 192k -ar 48000 -ac 2 \
  -disposition:a:0 default \
  -metadata title="AI Peer — Hackathon 2026 — Concept Draft 05" \
  -metadata comment="Real context supplied by user; authored dialogue and UI. AI Peer and AirChat plugin integrations are proposed. Four fictional synthetic voice performances; original music and effects." \
  -t "$audio_duration" -movflags +faststart \
  "$temporary"
mv -f "$temporary" "$output"
cp "$captions" "$project_dir/renders/ai-peer-draft-05${suffix}.srt"
echo "Finalized: $output"
echo "Captions: $project_dir/renders/ai-peer-draft-05${suffix}.srt"
