#!/usr/bin/env python3
"""Exact frame extraction from completed encoded deliverables."""
from pathlib import Path
import subprocess,json,sys
P=Path(__file__).resolve().parents[1];D=P.parent
master=D/'film/renders/blended-moss-v3.mp4';small=D/'film/renders/blended-moss-v3-720p.mp4'
scene=[1.8,5.6,9.1,12.3,12.8,13.9,14.6,15.3,16.3,18.8,21.9,22.1,24,26.5,30.5,35,38,43,49,55,57.3,59.5,60.4,61,61.3,61.6,62,62.6,64.5,65.8,66.8,68.5,68.8,69.3,70.2,73.7,74.3,74.8,76,78.2,81.9,82.3,83.3,84.5,85.05,85.5,86.2,87.5,88.8,89.3,89.6,90.4,91.3,92.3,92.8,93.3,93.7,94.5,97.5,99.7,100.3,102.4,103.2,103.8,104,104.3,104.6,104.9,105.3,105.59,105.6,106.6,108.6,109.76,109.8,109.84,110.4,111.1,113.4,115.7,116.1,117.8,119.3,119.56]
shots=json.loads((D/'film/cuts/blended-moss-v3/shots.json').read_text())['slots']
bounds=sorted({round(t+d,6) for t in [s['start'] for s in shots[1:]]+[12.5,16.3,60.8,61.0,61.6,68.5,74.3,81.9,85.05,93.7,94.6,104.3,105.25,109.8] for d in [-1/30,1/30]})
send=[14.6,16.3,18.8,26.5,49,60.4,61,61.3,62,62.6,65.8,69.3,76,82.3,86.2,90.4,91.3,92.8,93.3,93.7,94.5,97.5,99.7,102.4,104.3,104.6,105.59,108.6,109.84,117.8,119.56]
for label,video,points in [('film-encoded',master,scene),('transitions-encoded',master,bounds),('send-encoded',small,send)]:
 if '--master-only' in sys.argv and label=='send-encoded':continue
 if '--send-only' in sys.argv and label!='send-encoded':continue
 folder=P/'.build'/label;folder.mkdir(exist_ok=True)
 for i,t in enumerate(points):subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',str(video),'-frames:v','1',str(folder/f'f{i:03}.jpg')],check=True)
 subprocess.run(['uv','run','--quiet','--with','pillow','python',str(P/'tools/sheets.py'),str(folder),str(P/'evidence'/label),json.dumps(points)],check=True)
 (P/'evidence'/f'{label}-times.json').write_text(json.dumps({'video':str(video.relative_to(D)),'times':points},indent=2)+'\n')
 print(label,len(points),flush=True)
