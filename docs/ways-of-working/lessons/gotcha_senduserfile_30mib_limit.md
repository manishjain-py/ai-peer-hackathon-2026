---
name: gotcha_senduserfile_30mib_limit
description: "SendUserFile refuses a file over 30 MiB ('exceeds the 30 MiB upload limit'); a 2-minute 1080p film at 40 MB did not go through, a 720p copy of 13 MB did; Telegram bots take up to 50 MB"
metadata:
  type: reference
---

**Seen 2026-11-14 13:36 UTC**, ai-peer-hackathon-2026: `SendUserFile` on a 38.4 MiB mp4 returned
"1 file could NOT be delivered to the user: ... 38.4 MiB exceeds the 30 MiB upload limit — send a
smaller or compressed copy". The same film at 720p (12.6 MB) was delivered. The Telegram Bot API
(`sendVideo`) took the 720p copy too; its own limit is 50 MB.

**How to apply:** before sending a video to Manish, make one small copy and use it for both
places: `ffmpeg -i <in> -vf "scale=1280:-2" -c:v libx264 -preset veryfast -crf 23 -pix_fmt
yuv420p -c:a aac -b:a 160k -movflags +faststart <out>` (2:00 of 1080p film became 13 MB). Say in
the caption where the full-size file is.
