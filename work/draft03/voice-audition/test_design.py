import time
from pathlib import Path
import numpy as np
import soundfile as sf
import mlx.core as mx
from mlx_audio.tts.utils import load_model
m=load_model('mlx-community/Qwen3-TTS-12Hz-1.7B-VoiceDesign-4bit')
for key,text,direction in [('narrator', 'Start your day with a brief built around you.', 'A native American English female voice in her early thirties. Warm midrange pitch, clear smooth timbre, lively and confident. Natural conversational delivery with crisp diction and quick connected phrasing, like an engaging premium product commercial. Speak briskly with short pauses.'),('sarah',"Manish, daily totals or each dispute's final result?",'A female native American English speaker in her thirties with a lower middle register, warm slightly textured voice. Conversational office video call, casual and direct. Natural question intonation, quick connected phrasing with short pauses. Pronounce Manish as muh-NEESH.')]:
 mx.random.seed(43)
 t=time.monotonic()
 r=list(m.generate_voice_design(text=text,language='English',instruct=direction,max_tokens=512,temperature=.7))
 a=np.concatenate([np.array(x.audio) for x in r])
 sf.write(Path('work/draft03/voice-audition')/('design-'+key+'.wav'),a,r[0].sample_rate)
 print(key,len(a)/r[0].sample_rate,time.monotonic()-t,flush=True)
