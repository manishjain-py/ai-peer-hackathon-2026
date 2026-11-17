#!/usr/bin/env python3
"""Extract actual encoded scene and cut-boundary frames for controller inspection."""
from pathlib import Path
import subprocess,json,sys
P=Path(__file__).resolve().parents[1];D=P.parent
master=D/'film/renders/blended-moss-v5.mp4';small=D/'film/renders/blended-moss-v5-720p.mp4'
scene=[1.8,5.6,9.1,12.3,13.9,14.6,15.3,16.3,18.8,21.9,23.8,24.6,25.4,26.5,27.4,28.2,29.5,30.1,30.7,31.7,32.7,33.5,34.1,34.7,35.5,36.5,37.1,38.5,39.8,41.5,42.1,43.3,44.5,45.5,46.8,47.6,48.5,49.5,50.3,51.2,52.1,53.3,54.3,55.2,55.7,56.5,57.5,58.8,59.3,61.2,62.5,66.9,70,74.6,76.2,77.65,78.2,79.1,79.5,79.9,80.3,80.7,81.1,81.5,81.8,82.3,82.8,83.3,84,84.7,85.3,86,87.3,89.8,90.1,90.8,91.7,92.7,93.3,94,94.6,95.2,96.2,97.2,98.2,99.5,100.3,102.3,103.4,104.6,105.59,105.6,106.8,108.6,109.77,109.84,110.6,111.1,113.5,115.8,117.8,119.56]
shots=json.loads((D/'film/cuts/blended-moss-v5/shots.json').read_text())['slots']
bounds=sorted({round(t+d,6) for t in [s['start'] for s in shots[1:]]+[12.5,16.3,55.0,77.65,79.1,85.1,93.3,94.5,98,104.3,105.25,109.8] for d in [-1/30,1/30]})
send=[15.3,18.8,25.4,28.2,30.7,33.5,34.7,38.5,44.5,49.5,54.3,55.2,58.8,62.5,70,76.2,78.2,79.1,79.9,80.7,81.5,83.3,84.7,86,89.8,90.8,92.7,93.3,94.6,95.2,96.2,97.2,98.2,99.5,102.3,104.6,108.6,109.84,117.8,119.56]
for label,video,points in [('film-encoded',master,scene),('transitions-encoded',master,bounds),('send-encoded',small,send)]:
 if '--master-only' in sys.argv and label=='send-encoded':continue
 if '--send-only' in sys.argv and label!='send-encoded':continue
 folder=P/'.build'/label;folder.mkdir(exist_ok=True)
 for i,t in enumerate(points):subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',str(video),'-frames:v','1',str(folder/f'f{i:03}.jpg')],check=True)
 subprocess.run(['uv','run','--quiet','--with','pillow','python',str(P/'tools/sheets.py'),str(folder),str(P/'evidence'/label),json.dumps(points)],check=True)
 (P/'evidence'/f'{label}-times.json').write_text(json.dumps({'video':str(video.relative_to(D)),'times':points},indent=2)+'\n');print(label,len(points),flush=True)
