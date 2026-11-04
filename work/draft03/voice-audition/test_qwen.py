import time
from pathlib import Path
import numpy as np
import soundfile as sf
import mlx.core as mx
from mlx_audio.tts.utils import load_model
start=time.monotonic()
model=load_model('mlx-community/Qwen3-TTS-12Hz-1.7B-CustomVoice-4bit')
print('MODEL LOADED',time.monotonic()-start,flush=True)
for voice,text,instruct in [('Ryan',"Manish's peer, quick one. Is the dashboard ready for Friday?",'Speak naturally in fluent American English, like a colleague asking a quick question on a video call. Casual, direct, friendly, brisk. Conversational rising intonation on the question, not an announcer.'),('Aiden',"The build is done. Two data checks are still open. Sarah, can you share the failed rows?",'Natural fluent American English, practical colleague on a video call. Warm and clear, calm confidence, brisk pace and short natural pauses. Not a narrator or announcer.'),('Serena',"Yep, I'll put them in the thread. That should unblock the test.",'Fluent American English. Casual female colleague in a real video meeting. Warm, engaged, speaking briskly with natural small inflections. Not a formal narration.')]:
 mx.random.seed(43)
 t=time.monotonic()
 results=list(model.generate_custom_voice(text=text,speaker=voice,language='English',instruct=instruct,max_tokens=500,temperature=.7))
 a=np.concatenate([np.array(x.audio) for x in results])
 rate=results[0].sample_rate
 sf.write(Path('work/draft03/voice-audition')/(voice+'.wav'),a,rate)
 print('DONE',voice,len(a)/rate,'in',time.monotonic()-t,flush=True)
