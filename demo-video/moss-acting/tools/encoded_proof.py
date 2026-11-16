#!/usr/bin/env python3
"""Extract exact encoded review frames, with additional scene-boundary checks."""
from pathlib import Path
import json,subprocess
HERE=Path(__file__).resolve().parents[1];DEMO=HERE.parent
video=DEMO/'film/renders/blended-moss-v2.mp4'
times=sorted(set(json.loads((HERE/'evidence/film-source-times.json').read_text())['times']+[25.7,26.4,28.5,28.518,32.764,34.569,55.4,57.8,87.8,89.25,89.5,90.5,91.5,109.76,109.8,109.84,110.2]))
shots=json.loads((DEMO/'film/cuts/blended-moss-v2/shots.json').read_text())['slots']
bounds=sorted({round(t+d,6) for t in [s['start'] for s in shots[1:]]+[12.5,15.3,71.3,73,77.1,84.7,87,87.85,89.25,104.3,106.4,108.5,109.8] for d in [-1/30,1/30]})
for name,points in [('film-encoded',times),('transitions-encoded',bounds)]:
 out=HERE/'.build'/name;out.mkdir(exist_ok=True)
 for i,t in enumerate(points):
  subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',str(video),'-frames:v','1',str(out/f'f{i:03}.jpg')],check=True)
 subprocess.run(['uv','run','--quiet','--with','pillow','python',str(HERE/'tools/sheets.py'),str(out),str(HERE/'evidence'/name),json.dumps(points)],check=True)
 (HERE/'evidence'/f'{name}-times.json').write_text(json.dumps({'video':str(video.relative_to(DEMO)),'times':points},indent=2)+'\n')
# Check the send copy independently at representative dense UI/alpha/ending points.
small=DEMO/'film/renders/blended-moss-v2-720p.mp4';points=[1.8,18.6,25.7,26.4,31,45.2,55.5,57.8,59,65.8,68.5,80,85.5,89.5,90.5,91.5,97.5,104.5,108.6,109.8,110.4,117.6]
out=HERE/'.build/send-encoded';out.mkdir(exist_ok=True)
for i,t in enumerate(points):subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',str(small),'-frames:v','1',str(out/f'f{i:03}.jpg')],check=True)
subprocess.run(['uv','run','--quiet','--with','pillow','python',str(HERE/'tools/sheets.py'),str(out),str(HERE/'evidence/send-encoded'),json.dumps(points)],check=True)
print(f'Encoded proof: {len(times)} scene frames, {len(bounds)} boundary frames, {len(points)} send-copy frames')
