#!/usr/bin/env python3
"""Build V6 cue/finale arrangement and retain all unrelated original bed samples."""
from pathlib import Path
import subprocess,json,hashlib
import numpy as np
HERE=Path(__file__).resolve().parent
ROOT=HERE.parents[2];SR=48000;D=119.6
def decode(p):
 return np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(p),'-ar',str(SR),'-ac','2','-f','f32le','-']),dtype=np.float32).reshape(-1,2).copy()
subprocess.run(['uv','run','--quiet',str(ROOT/'demo-video/film/audio/music/tools/make_bed.py'),str(HERE/'bed-moss-v6.edl.json')],check=True)
old=decode(ROOT/'demo-video/moss-ocean/audio/bed-moss-v5.wav');new=decode(HERE.parent/'.build/audio/bed-candidate.wav')
out=old.copy();spans=[(57.9,99.9),(109.9,D)]
for a,b in spans:
 lo,hi=round(a*SR),round(b*SR);r=np.ones(hi-lo,dtype=np.float32);n=round(.05*SR);r[:n]=np.linspace(0,1,n)
 if b<D:r[-n:]=np.linspace(1,0,n)
 out[lo:hi]=old[lo:hi]*(1-r[:,None])+new[lo:hi]*r[:,None]
dest=HERE/'bed-moss-v6.wav'
subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac','2','-i','-','-c:a','pcm_s24le',str(dest)],input=out.tobytes(),check=True)
final=decode(dest);pres=[]
for a,b in [(0,57.9),(99.9,109.9)]:
 lo,hi=round(a*SR),round(b*SR);assert np.array_equal(old[lo:hi],final[lo:hi]);pres.append({'from':a,'to':b,'decoded_samples_identical':True})
(HERE/'bed-verification.json').write_text(json.dumps({'seconds':D,'changed_spans':spans,'preserved_spans':pres,'final_cadence_s':116,'natural_tail_s':3.55,'source':'same Lyria b2'},indent=2)+'\n')
