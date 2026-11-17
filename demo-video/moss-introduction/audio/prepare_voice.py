#!/usr/bin/env -S uv run --quiet --script
# /// script
# requires-python = ">=3.10"
# dependencies = ["numpy>=1.26"]
# ///
"""Prepare the saved Matilda take; no network or paid call occurs here."""
from pathlib import Path
import importlib.util
import json
import subprocess
import numpy as np

HERE=Path(__file__).resolve().parent
DEMO=HERE.parents[1]
spec=importlib.util.spec_from_file_location('peer_voice', DEMO/'film/tools/voice.py')
voice=importlib.util.module_from_spec(spec);spec.loader.exec_module(voice)
result=json.loads((HERE/'intro-v4-source.result.json').read_text())
raw=np.frombuffer(subprocess.check_output(['ffmpeg','-v','error','-i',str(HERE/'intro-v4-source.mp3'),
    '-ar','44100','-ac','1','-f','f32le','-']),dtype=np.float32)
cut,shift=voice.trim(raw)
voice.write_wav(HERE/'intro-v4.wav',cut)
caption="I'm Ram's AI Peer, his proactive AI teammate, keeping him informed and covering for him around the clock."
alignment=result['result']['timestamps'][0]
meta={'id':'p02v4','voice':'Matilda','voice_id':'XrExE9yKIg1WjnnlVkGX','model':'eleven_multilingual_v2',
      'provider':'ElevenLabs Multilingual v2 through fal.ai','text':caption,
      'spoken':result['inputs_sent']['text'],'request_id':result['request_id'],
      'file':'intro-v4.wav','seconds':round(len(cut)/voice.SR,3),'trimmed_front':shift,
      'raw_seconds':round(len(raw)/voice.SR,3),
      'peak_dbfs':round(voice.db(float(np.abs(cut).max())),2),
      'rms_dbfs':round(voice.db(float(np.sqrt((cut**2).mean()))),2),
      'words':voice.words_from(alignment,shift,caption)}
(HERE/'intro-v4.json').write_text(json.dumps(meta,indent=2)+'\n')
print(json.dumps({k:meta[k] for k in ['seconds','trimmed_front','rms_dbfs','words']},indent=2))
