"""Extract frames from the assembled movie, including both sides of each edited seam."""
import json
import subprocess
import sys
from pathlib import Path

PKG = Path(__file__).resolve().parents[1]
DEMO = PKG.parent
edition = sys.argv[1]
assert edition in ("master", "delivery")
filename = "blended-moss-v7" + ("-1080p" if edition == "delivery" else "") + ".mp4"
movie = DEMO / "film/renders" / filename
samples = [1.8,5.6,9.1,13.9,16.5,20.2,23,24.55,25.7,27.2,28.2,30.8,32.6,34.96,35.35,
           35.95,37.5,40.4,41.6,42.2,44.5,46.6,47.12,47.5,47.82,48.25,49.4,50.4,
           51.6,53.8,54.14,54.8,55.3,55.8,56.5,58.5,61.5,68,74.8,76.4,78.6,80.3,
           83.8,84.5,87.7,88.9,89.97,90.05,90.42,90.76,90.98,91.24,92.5,92.8,93.28,
           93.48,93.8,94.96,95.28,95.7,95.91,96.2,97.85,99.85,100.2,100.8,101.2,101.65,
           101.77,102.4,104.1,105.57,105.9,106.25,106.52,106.82,107.15,107.55,107.92,108.4,
           109.35,109.84,110.55,113.6,116.2,119.5]
frames = sorted(set(round(t*30) for t in samples) | {f+d for f in (694,1260,1779,2620,3000,3330) for d in (-1,0)})
label = "encoded-" + edition
folder = PKG / ".build" / label
folder.mkdir(parents=True,exist_ok=True)
for i,frame in enumerate(frames):
    t = str(frame/30)
    subprocess.run(["ffmpeg","-nostdin","-v","error","-y","-ss",t,"-i",str(movie),
                    "-frames:v","1","-q:v","2",str(folder/f"f{i:03}.jpg")],check=True)
times=[round(f/30,4) for f in frames]
subprocess.run(["uv","run","--quiet","--with","pillow","python",str(DEMO/"moss-clarity/tools/sheets.py"),
                str(folder),str(PKG/"evidence"/label),json.dumps(times)],check=True)
(PKG/"evidence"/(label+"-times.json")).write_text(json.dumps(dict(movie=filename,frames=frames,times=times),indent=2)+"\n")
print(label,len(frames),flush=True)
