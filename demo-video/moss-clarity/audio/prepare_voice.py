#!/usr/bin/env -S uv run --quiet --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy>=1.26"]
# ///
"""Prepare saved V6 Chris take and shorten original Matilda greeting; offline."""
from pathlib import Path
import importlib.util,json,subprocess
import numpy as np
HERE=Path(__file__).resolve().parent
DEMO=HERE.parents[1]
spec=importlib.util.spec_from_file_location('peer_voice',DEMO/'film/tools/voice.py')
voice=importlib.util.module_from_spec(spec);spec.loader.exec_module(voice)
def decode(p):
    return np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(p),'-ar','44100','-ac','1','-f','f32le','-']),dtype=np.float32).copy()
r=json.loads((HERE/'h2-v6-source.result.json').read_text())
raw=decode(HERE/'h2-v6-source.mp3');cut,shift=voice.trim(raw)
voice.write_wav(HERE/'h2-v6.wav',cut)
caption="Ram is out of office, but the update I needed is already here."
meta={'id':'h2b','part':'hook','speaker':'colleague-2','voice':'Chris','voice_id':'iP95p4xoKVk53GoZ742B','model':'eleven_multilingual_v2','text':caption,'spoken':r['inputs_sent']['text'],'file':'../moss-clarity/audio/h2-v6.wav','seconds':round(len(cut)/voice.SR,3),'trimmed_front':shift,'raw_seconds':round(len(raw)/voice.SR,3),'peak_dbfs':round(voice.db(float(np.abs(cut).max())),2),'rms_dbfs':round(voice.db(float(np.sqrt((cut**2).mean()))),2),'words':voice.words_from(r['result']['timestamps'][0],shift,caption),'request_id':r['request_id']}
(HERE/'h2-v6.json').write_text(json.dumps(meta,indent=2)+'\n')
# The next sentence begins at 2.801s; 2.45 retains the entire first sentence and room tone.
old=decode(DEMO/'film/audio/lines/m1.wav');trim=old[:round(2.45*voice.SR)].copy()
trim[-round(.025*voice.SR):]*=np.linspace(1,0,round(.025*voice.SR))
voice.write_wav(HERE/'m1-v6.wav',trim)
source=json.loads((DEMO/'film/cuts/blended-moss-v5/narration.json').read_text())
m=next(l for l in source['lines'] if l['id']=='m1')
m.update(text="Hi everyone. I'm Ram's AI Peer.",file='../moss-clarity/audio/m1-v6.wav',seconds=2.45,words=m['words'][:6],rms_dbfs=round(voice.db(float(np.sqrt((trim**2).mean()))),2),peak_dbfs=round(voice.db(float(np.abs(trim).max())),2))
(HERE/'m1-v6.json').write_text(json.dumps(m,indent=2)+'\n')
subprocess.run(['ffmpeg','-v','error','-y','-i',str(HERE/'h2-v6.wav'),'-af','adelay=900:all=1,apad,atrim=0:6','-ar','44100',str(HERE/'h2-guide.wav')],check=True)
print(json.dumps({'h2_seconds':meta['seconds'],'m1_seconds':2.45,'h2_words':meta['words']},indent=2))
