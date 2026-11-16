#!/usr/bin/env python3
"""Remove magenta edge spill from generated character-only clips without shrinking alpha."""
from concurrent.futures import ThreadPoolExecutor,as_completed
from pathlib import Path
import json,subprocess
HERE=Path(__file__).resolve().parents[1]
FILTER="format=rgba,colorkey=0xFF00FF:0.30:0.12,geq=r='r(X,Y)-max(0,min(r(X,Y)-g(X,Y),b(X,Y)-g(X,Y)))':g='g(X,Y)':b='b(X,Y)-max(0,min(r(X,Y)-g(X,Y),b(X,Y)-g(X,Y)))':a='alpha(X,Y)'"
cs=json.loads((HERE/'concepts.json').read_text())
def run(c):
    if c['id'] in ('nori','dew'):return
    stem=f"{c['number']:02d}-{c['id']}"
    src=HERE/'images/spike-moss-motion-v2.mp4' if c['id']=='moss' else HERE/'motion'/f'{stem}-source.mp4'
    out=HERE/'motion'/f'{stem}.webm'
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-nostdin','-y','-i',str(src),'-vf',FILTER,'-c:v','libvpx-vp9','-pix_fmt','yuva420p','-b:v','0','-crf','24','-an',str(out)],check=True)
    return stem
with ThreadPoolExecutor(max_workers=2) as pool:
    for j in as_completed([pool.submit(run,c) for c in cs]):
        if j.result():print(j.result()+' despilled',flush=True)
print('All23 alpha clips despilled',flush=True)
