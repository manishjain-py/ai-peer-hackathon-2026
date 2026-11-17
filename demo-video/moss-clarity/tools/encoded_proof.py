#!/usr/bin/env python3
"""Extract decoded master, boundary and actual1080-delivery frames for visual inspection."""
from pathlib import Path
import subprocess,json,sys
P=Path(__file__).resolve().parents[1];D=P.parent
master=D/'film/renders/blended-moss-v6.mp4';delivery=D/'film/renders/blended-moss-v6-1080p.mp4'
scene=[1.8,4.1,5.6,6.6,9.1,12.3,13.9,14.6,15.3,16.3,18.8,21.9,23.8,24.55,25.4,26.5,27.4,28.2,29.5,30.7,31.7,32.7,33.5,34.7,35.5,36.5,37.4,39.1,41.55,41.8,43.3,44.5,46.8,47.6,49.5,51.5,52.9,53.7,54.14,54.3,55.2,56.5,57.5,59.3,60.8,62.5,64.2,68,71.7,74.8,76.1,76.5,77,77.5,78.3,79.3,80.3,81.5,82.7,83.8,84.5,85.1,86,87.7,88.1,89.7,90.1,90.6,91.2,91.8,92.7,93.3,94,94.7,95.5,96.1,96.8,97.4,98.3,99.5,100.05,100.4,100.68,100.73,102.5,104.6,105.55,106.2,107.2,108.6,109.84,110.6,111.1,113.5,115.8,116.3,117.8,119.5]
shots=json.loads((D/'film/cuts/blended-moss-v6/shots.json').read_text())['slots']
bounds=sorted({round(t+d,6) for t in [s['start'] for s in shots[1:]]+[16.3,24.3,54.14,60.7,74.65,76.05,84.9,90.4,91.8,94.7,97.4,104.3,109.8] for d in [-1/30,1/30]})
send=[1.8,5.6,13.9,18.8,24.55,25.4,28.2,30.7,33.5,35.5,37.4,41.8,43.3,46.8,49.5,54.14,54.3,56.5,58.8,61.5,68,74.8,76.1,77.5,78.3,80.3,82.7,83.8,84.5,85.1,86,87.7,88.1,90.1,90.6,91.2,91.8,93.3,94,94.7,96.1,96.8,97.4,99.5,100.4,100.73,104.6,106.2,108.6,109.84,113.5,117.8,119.5]
for label,video,points in [('film-encoded',master,scene),('transitions-encoded',master,bounds),('send-encoded',delivery,send)]:
 if '--master-only' in sys.argv and label=='send-encoded':continue
 if '--send-only' in sys.argv and label!='send-encoded':continue
 folder=P/'.build'/label;folder.mkdir(exist_ok=True)
 for i,t in enumerate(points):subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',str(video),'-frames:v','1','-q:v','2',str(folder/f'f{i:03}.jpg')],check=True)
 subprocess.run(['uv','run','--quiet','--with','pillow','python',str(P/'tools/sheets.py'),str(folder),str(P/'evidence'/label),json.dumps(points)],check=True)
 (P/'evidence'/f'{label}-times.json').write_text(json.dumps({'video':str(video.relative_to(D)),'times':points},indent=2)+'\n')
 print(label,len(points),flush=True)
