from pathlib import Path
import subprocess, concurrent.futures
root=Path.cwd()
video=root/'renders/ai-peer-draft-03-preview.mp4'
out=root/'work/draft03/encoded-review'
sections=[('reveal',16,3.3,6),('context',28,12,1),('slack',93,16.5,2),('zoom',117,21.5,2),('close',158.5,8,2)]
def make(s):
 name,start,duration,fps=s
 filt=f'fps={fps},scale=640:360,tile=3x4:padding=4:margin=4:color=black'
 subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-ss',str(start),'-t',str(duration),'-i',str(video),'-vf',filt,'-fps_mode','vfr',str(out/f'{name}-%02d.png')],check=True)
 return name
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool:
 for name in pool.map(make,sections): print(name,'complete',flush=True)
