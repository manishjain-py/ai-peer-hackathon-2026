"""Assemble the retimed middle and otherwise preserve actual V4 soundtrack samples."""
from pathlib import Path
import subprocess,json,hashlib
import numpy as np
HERE=Path(__file__).resolve().parent
SR=48000
def decode(p):
 raw=subprocess.check_output(['ffmpeg','-v','error','-i',str(p),'-ar',str(SR),'-ac','2','-f','f32le','-'])
 return np.frombuffer(raw,dtype=np.float32).reshape(-1,2).copy()
old=decode(HERE.parents[1]/'moss-introduction/audio/mix.wav')
new=decode(HERE.parent/'.build/audio/stems/mix.wav')
assert old.shape==new.shape
out=old.copy();a,b=round(24.6*SR),round(99.9*SR);n=round(.05*SR)
blend=np.ones(b-a,dtype=np.float32);blend[:n]=np.linspace(0,1,n);blend[-n:]=np.linspace(1,0,n)
out[a:b]=old[a:b]*(1-blend[:,None])+new[a:b]*blend[:,None]
subprocess.run(['ffmpeg','-v','error','-y','-f','f32le','-ar',str(SR),'-ac','2','-i','-',
 '-c:a','pcm_s24le',str(HERE/'mix.wav')],input=out.tobytes(),check=True)
final=decode(HERE/'mix.wav');spans=[]
for start,end in [(0,24.6),(99.9,119.6)]:
 lo,hi=round(start*SR),round(end*SR);assert np.array_equal(old[lo:hi],final[lo:hi])
 spans.append({'from':start,'to':end,'decoded_samples_identical':True,'sha256':hashlib.sha256(final[lo:hi].tobytes()).hexdigest()})
report={'seconds':len(final)/SR,'sample_rate':SR,'changed_span':[24.6,99.9],'boundary_fade_ms':50,
 'preserved_v4_mix_spans':spans,'music_source':'same Lyria b2; bar edits documented separately'}
(HERE/'pcm-preservation.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
