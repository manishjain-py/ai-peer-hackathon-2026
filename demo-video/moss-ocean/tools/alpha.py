from pathlib import Path
import subprocess
P=Path(__file__).resolve().parents[1]
for name in ['speak-write']:
 src=P/'assets'/f'moss-{name}-source.mp4';out=P/'assets'/f'moss-{name}.webm'
 if not src.exists() or out.exists():continue
 filt="format=rgba,colorkey=0xFF00FF:0.30:0.12,geq=r='r(X,Y)-max(0,min(r(X,Y)-g(X,Y),b(X,Y)-g(X,Y)))':g='g(X,Y)':b='b(X,Y)-max(0,min(r(X,Y)-g(X,Y),b(X,Y)-g(X,Y)))':a='alpha(X,Y)'"
 if name=='stamp':filt+=",drawbox=x=0:y=710:w=iw:h=ih-710:color=black@0:t=fill:replace=1"
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(src),'-vf',filt,'-c:v','libvpx-vp9','-pix_fmt','yuva420p','-b:v','0','-crf','24','-an',str(out)],check=True)
 print(name,flush=True)
