#!/usr/bin/env python3
"""Numerical QA; optional --asr runs a small local model for content checking."""
from pathlib import Path
import argparse,json,re,subprocess
import numpy as np
import soundfile as sf

ROOT=Path(__file__).resolve().parents[2]
OUT=ROOT/'video/public/audio'
WORK=ROOT/'work/audio-qa'
WORK.mkdir(parents=True,exist_ok=True)
parser=argparse.ArgumentParser()
parser.add_argument('--asr',action='store_true')
args=parser.parse_args()
d=json.loads((OUT/'timing.json').read_text())
checks={}
stems={}
for name in ('narration','music','effects','mixed'):
    a,sr=sf.read(OUT/f'{name}.wav',dtype='float32')
    assert sr==48000 and a.shape==(5760000,2)
    assert np.isfinite(a).all() and np.max(np.abs(a))<1
    stems[name]=a
    checks[name]={'frames':len(a),'channels':2,'sample_rate':sr,'duration':len(a)/sr,
                  'first_sample':a[0].tolist(),'last_sample':a[-1].tolist()}
assert np.max(np.abs(stems['mixed']-stems['narration']-stems['music']-stems['effects']))<1e-6
assert all(r['end']<=r['scene_limit'] and r['start']<r['end'] for r in d['lines'])
assert all(d['lines'][i]['end']<d['lines'][i+1]['start'] for i in range(len(d['lines'])-1))
def seconds(t):
    h,m,s,ms=map(int,re.split('[:,]',t));return h*3600+m*60+s+ms/1000
cues=re.findall(r'(\d{2}:\d{2}:\d{2},\d{3}) --> (\d{2}:\d{2}:\d{2},\d{3})',(OUT/'captions.srt').read_text())
cts=[tuple(map(seconds,x)) for x in cues]
assert all(0<=s<e<=120 for s,e in cts)
assert all(cts[i][1]<=cts[i+1][0] for i in range(len(cts)-1))
result=subprocess.run(['ffmpeg','-hide_banner','-i',str(OUT/'mixed.wav'),'-af','ebur128=peak=true:framelog=verbose','-f','null','-'],capture_output=True,text=True,check=True)
(WORK/'loudness.txt').write_text(result.stderr)
summary=result.stderr.split('Summary:')[-1].split('[out#')[0].strip()
report={'validation':'PASS','checks':checks,'captions':{'count':len(cts),'non_overlapping':True,'within_video':True},'all_clips_within_scene_windows':True,'stems_sum_to_mix':True,'loudness_summary':summary,'direct_listening_performed':False}
if args.asr:
    from faster_whisper import WhisperModel
    model=WhisperModel('tiny.en',device='cpu',compute_type='int8',cpu_threads=4,download_root=str(ROOT/'work/audio-models'))
    segments,info=model.transcribe(str(OUT/'mixed.wav'),language='en',beam_size=5,vad_filter=True)
    trans=[{'start':s.start,'end':s.end,'text':s.text} for s in segments]
    (WORK/'asr.json').write_text(json.dumps(trans,indent=2)+'\n')
    report['asr_model']='faster-whisper tiny.en; supporting content check, not a listening substitute'
    print('\n'.join(f"{x['start']:.1f}–{x['end']:.1f} {x['text']}" for x in trans))
(OUT/'validation.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps(report,indent=2))
