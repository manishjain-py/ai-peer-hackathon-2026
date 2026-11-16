#!/usr/bin/env python3
"""Extract exact encoded review frames, with additional scene-boundary checks."""
from pathlib import Path
import json,subprocess
HERE=Path(__file__).resolve().parents[1];DEMO=HERE.parent
video=DEMO/'film/renders/blended-moss-v1.mp4'
times=json.loads((HERE/'evidence/film-source-times.json').read_text())['times']
shots=json.loads((DEMO/'film/cuts/blended-moss-v1/shots.json').read_text())['slots']
bounds=sorted({round(t+d,6) for t in [s['start'] for s in shots[1:]]+[104.3,106.4] for d in [-1/30,1/30]})
for name,points in [('film-encoded',times),('transitions-encoded',bounds)]:
 out=HERE/'.build'/name;out.mkdir(exist_ok=True)
 for i,t in enumerate(points):
  subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',str(video),'-frames:v','1',str(out/f'f{i:03}.jpg')],check=True)
 subprocess.run(['uv','run','--quiet','--with','pillow','python',str(HERE/'tools/sheets.py'),str(out),str(HERE/'evidence'/name),json.dumps(points)],check=True)
 (HERE/'evidence'/f'{name}-times.json').write_text(json.dumps({'video':str(video.relative_to(DEMO)),'times':points},indent=2)+'\n')
# Check the send copy independently at representative dense UI/alpha/ending points.
small=DEMO/'film/renders/blended-moss-v1-720p.mp4';points=[1.8,18.6,31,45.2,59,65.8,68.5,80,97.5,104.5,108.6,117.6]
out=HERE/'.build/send-encoded';out.mkdir(exist_ok=True)
for i,t in enumerate(points):subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',str(small),'-frames:v','1',str(out/f'f{i:03}.jpg')],check=True)
subprocess.run(['uv','run','--quiet','--with','pillow','python',str(HERE/'tools/sheets.py'),str(out),str(HERE/'evidence/send-encoded'),json.dumps(points)],check=True)
print(f'Encoded proof: {len(times)} scene frames, {len(bounds)} boundary frames, {len(points)} send-copy frames')
