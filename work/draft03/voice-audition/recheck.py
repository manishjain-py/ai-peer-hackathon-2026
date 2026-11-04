import json,hashlib
from faster_whisper import WhisperModel
from pathlib import Path
m=WhisperModel('small.en',device='cpu',compute_type='int8',download_root='work/audio-models',cpu_threads=4)
out=[]
for name in ['problem1','reveal','brief_intro','brief_change','brief_opportunity','slack_sarah','slack_peer','meeting_bridge','slack_reply','zoom_ask','return3']:
 p=Path('work/draft03/audio-clips')/(name+'-final.wav')
 if not p.exists():continue
 seg,_=m.transcribe(str(p),language='en',beam_size=5,word_timestamps=True,vad_filter=True,condition_on_previous_text=False,hallucination_silence_threshold=.2)
 seg=list(seg)
 r={'id':name,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'text':' '.join(s.text.strip() for s in seg),'words':[{'word':w.word,'start':w.start,'end':w.end} for s in seg for w in s.words or []]}
 out.append(r)
 print(name,r['text'],flush=True)
Path('work/draft03/audio-qa/asr-recheck-small.json').write_text(json.dumps(out,indent=2)+'\n')
