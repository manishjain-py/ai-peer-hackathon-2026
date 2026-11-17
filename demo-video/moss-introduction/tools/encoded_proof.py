#!/usr/bin/env python3
from pathlib import Path
import subprocess,json,sys
P=Path(__file__).resolve().parents[1];D=P.parent
scenes=[13.9,14,14.8,15,15.6,16.3,16.7,17.3,18.1,18.7,19.3,19.85,20.8,21.5,21.9,22,22.2,23.2,23.54,23.9,24.3,24.59,24.6,24.633333,26.5,28.5,28.6,40.6,60.4,62.2,80,97.5,99.97,100,100.2,100.5,101.3,102.17,102.2,102.3,102.5,102.58,103.2,103.8,104.3,104.6,105,105.4,105.59,105.6,108.6,110.5,113.6,113.7,117.6,119.56]
bounds=sorted({round(t+d,6) for t in [14,22,24.6,857/30,100,102.2,105.6,3409/30] for d in [-1/30,0,1/30]})
small=[14.8,16.7,17.3,18.7,19.85,20.8,21.5,22.2,23.54,24.59,24.633333,100,100.5,102.17,102.2,102.3,102.5,102.58,103.2,104.3,104.6,105,105.59,105.6,108.6,117.6]
for label,name,pts in [('film-encoded','blended-moss-v4.mp4',scenes),('boundaries-encoded','blended-moss-v4.mp4',bounds),('send-encoded','blended-moss-v4-720p.mp4',small)]:
 if '--master-only' in sys.argv and label=='send-encoded':continue
 if '--send-only' in sys.argv and label!='send-encoded':continue
 video=D/'film/renders'/name;folder=P/'.build'/label;folder.mkdir(exist_ok=True)
 for i,t in enumerate(pts):subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',str(video),'-frames:v','1',str(folder/f'f{i:03}.jpg')],check=True)
 subprocess.run(['uv','run','--quiet','--with','pillow','python',str(P/'tools/sheets.py'),str(folder),str(P/'evidence'/label),json.dumps(pts)],check=True)
 (P/'evidence'/f'{label}-times.json').write_text(json.dumps({'video':str(video.relative_to(D)),'times':pts},indent=2)+'\n');print(label,len(pts),flush=True)
