#!/usr/bin/env -S uv run --quiet --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy>=1.26", "scipy>=1.11"]
# ///
"""joincheck: does a join in the bed stand out from the bar lines that are not joins?

    uv run --quiet demo-video/film/audio/music/tools/joincheck.py BED.wav 54,72,74,90,106 [--layers 116]

For every bar line of the bed (every 2.0 s) it measures two things with the onset curve of
beatfit.py: the strongest new sound in the 60 ms BEFORE the bar line (where a join's crossfade
sits; an ordinary bar line has little there), and the level step across the bar line. A join is
reported with its rank among all bar lines: a join that ranks in the middle is one the numbers
cannot tell from the music's own bar lines. It also looks for a click: the largest jump between
two neighbouring samples near each join, against the largest such jump in the whole bed.
"""
import sys
from pathlib import Path

import numpy as np

sys.path.insert(0, str(Path(__file__).resolve().parent))
import beatfit as bf  # noqa: E402

bf.LEAD_S = bf.CALIBRATED_LEAD_S


def main() -> int:
    path = sys.argv[1]
    joins = [float(v) for v in sys.argv[2].split(",")]
    x = bf.load(path)
    env = bf.onset_curve(x)
    fs = bf.ENV_FS
    dur = len(x) / bf.SR
    lines = np.arange(2.0, min(dur, 118.0) + 1e-6, 2.0)

    def before(t):       # strongest rise 60..4 ms before the bar line
        a, b = int((t + bf.LEAD_S - 0.060) * fs), int((t + bf.LEAD_S - 0.004) * fs)
        return float(env[a:b].max())

    def step(t):         # level 100 ms after against 100 ms before, dB
        n = int(0.1 * bf.SR)
        i = int(t * bf.SR)
        pre = np.sqrt((x[i - n:i] ** 2).mean() + 1e-12)
        post = np.sqrt((x[i:i + n] ** 2).mean() + 1e-12)
        return float(20 * np.log10(post / pre))
    floor = float(np.median(env)) + 1e-9
    pre_all = np.array([before(t) for t in lines]) / floor
    d = np.abs(np.diff(x))
    worst = float(d.max())
    print(f"{path}: {len(lines)} bar lines; the strongest new sound in the 60 ms before a bar line, as a multiple of the bed's median onset level:")
    print(f"  all bar lines: median {np.median(pre_all):.1f}, 90th percentile {np.percentile(pre_all, 90):.1f}, largest {pre_all.max():.1f} (at {lines[int(np.argmax(pre_all))]:.0f} s)")
    for j in joins:
        k = int(np.argmin(np.abs(lines - j)))
        rank = int((pre_all > pre_all[k]).sum()) + 1
        i = int(j * bf.SR)
        jump = float(d[i - int(0.09 * bf.SR): i + int(0.01 * bf.SR)].max())
        print(f"  join at {j:6.1f} s: before the bar line {pre_all[k]:5.1f}x (rank {rank} of {len(lines)}), level step {step(j):+5.1f} dB, "
              f"largest sample jump {jump:.4f} (the bed's largest anywhere: {worst:.4f})")
    return 0


if __name__ == "__main__":
    sys.exit(main())
