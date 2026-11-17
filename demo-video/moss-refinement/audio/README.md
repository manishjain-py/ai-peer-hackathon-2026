# Moss v3 soundtrack

The same saved Lyria b2 music and original voice recordings are used. No music or
voice was regenerated. The removed line is absent from the v3 script, narration and
mix plan. Zoom's four voice lines move 2.8 seconds earlier; Slack narration starts
at 90.6. Morning, globe and closing narration keep their original times.

Run `node demo-video/moss-refinement/audio/build_mix.mjs` from the repository. This
rebuilds `mix.wav` without the picture renderer or any private source. Requirements:
Node, ffmpeg, uv; the music tool declares numpy/scipy. Paid providers are never called.
Guide files `m1-guide.wav`, `m2-guide.wav`, `m4b-guide.wav` are preserved inputs for the
generic Moss speaking animation and are not extra voices in the film.

`bed-moss-v3.edl.json` shifts the existing thin musical bars to 66 and 88 seconds,
supporting the earlier Zoom and Slack scenes. It removes the late introductory-bar
overlay, and moves the source's own final downbeat to 116 seconds, just after the
115.7 end card. The final phrase now decays naturally through the last words and logo.
The original D-major card chime is quieter by 3 dB. The existing entrance whoosh ends
with the direct zoom at 16.3; the upbeat 20–22 music still anticipates the setup click.

`build_bed.py` preserves the original bed's actual decoded samples from 0–65.9 and
99.9–113.9, including the entrance, walkthrough, morning and globe cues. The revised
regions use 50 ms boundary blends. `bed-verification.json` checks sample identity and
records the final decay. The mix retains the existing speech ducking and level settings.
`mix-report.json` records -14.0 LUFS, -2.0 dBTP and at least 15.2 dB speech-over-music
separation in the completed WAV. Final encoded video loudness is checked separately.

All claims here concern saved source, timing and measurements. Direct human listening
is not claimed; Manish's review judges the artistic result. Intermediate candidate and
stems are rebuildable under ignored `.build/audio/`; only the bed, mix, guides, recipes
and reports are retained in git/LFS. V2's bed and all earlier films remain unchanged.
