"""Retain unchanged V5 mix samples outside revised speech/cues/finale."""
from pathlib import Path
import subprocess,json,hashlib
import numpy as np
HERE=Path(__file__).resolve().parent;SR=48000
def decode(p):
 return np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(p),'-ar',str(SR),'-ac','2','-f','f32le','-']),dtype=np.float32).reshape(-1,2).copy()
old=decode(HERE.parents[1]/'moss-ocean/audio/mix.wav');new=decode(HERE.parent/'.build/audio/stems/mix.wav');assert old.shape==new.shape
finale=decode(HERE.parent/'.build/audio/finale/mix.wav')
lo=round(109.9*SR);n=round(.05*SR);r=np.ones(len(new)-lo,dtype=np.float32);r[:n]=np.linspace(0,1,n)
new[lo:]=new[lo:]*(1-r[:,None])+finale[lo:]*r[:,None]
spans=[(3.9,7.2),(55.7,119.6)];out=old.copy()
for a,b in spans:
 lo,hi=round(a*SR),round(b*SR);r=np.ones(hi-lo,dtype=np.float32);n=round(.05*SR);r[:n]=np.linspace(0,1,n)
 if b<119.6:r[-n:]=np.linspace(1,0,n)
 out[lo:hi]=old[lo:hi]*(1-r[:,None])+new[lo:hi]*r[:,None]
subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac','2','-i','-','-c:a','pcm_s24le',str(HERE/'mix.wav')],input=out.tobytes(),check=True)
final=decode(HERE/'mix.wav');pres=[]
for a,b in [(0,3.9),(7.2,55.7)]:
 lo,hi=round(a*SR),round(b*SR);assert np.array_equal(old[lo:hi],final[lo:hi]);pres.append({'from':a,'to':b,'decoded_samples_identical':True,'sha256':hashlib.sha256(final[lo:hi].tobytes()).hexdigest()})
(HERE/'pcm-preservation.json').write_text(json.dumps({'seconds':len(final)/SR,'changed_spans':spans,'preserved_v5_mix_spans':pres,'boundary_fade_ms':50},indent=2)+'\n')
