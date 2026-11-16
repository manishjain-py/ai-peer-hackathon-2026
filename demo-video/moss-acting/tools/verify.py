#!/usr/bin/env python3
"""Media and source evidence for the actual rendered cut, not a unit-test suite."""
from pathlib import Path
import subprocess,json,hashlib,sys
HERE=Path(__file__).resolve().parents[1];DEMO=HERE.parent
base=DEMO/'film/renders/blended-tag-v2.mp4'
files=[DEMO/'film/renders/blended-moss-v2.mp4',DEMO/'film/renders/blended-moss-v2-720p.mp4']
def run(args):return subprocess.check_output(args,text=True)
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def packets(p):
 a=json.loads(run(['ffprobe','-v','error','-select_streams','a:0','-show_packets','-show_data_hash','sha256','-show_entries','packet=pts,dts,duration,size,data_hash','-of','json',str(p)]))
 return hashlib.sha256(json.dumps(a,sort_keys=True).encode()).hexdigest(),len(a['packets'])
def pcm(p):return run(['ffmpeg','-v','error','-i',str(p),'-map','0:a:0','-f','hash','-hash','sha256','-']).strip()
v1=DEMO/'film/renders/blended-moss-v1.mp4'
assert sha(v1)=='c6672bd1b42b09b5c66c4dbd55bdb2f37ef5dbac6e79594f061f3fc5cb4f2941'
baseline=sha(base);assert baseline=='7756283021b7237605337f079e435babb25143c2fb1d9023e6b70204a952b039'
ba,bn=packets(base);bp=pcm(base)
result={'base_sha256':baseline,'base_audio_packet_hash':ba,'base_audio_packet_count':bn,'base_decoded_audio_hash':bp,'files':[]}
for f,size in zip(files,[(1920,1080),(1280,720)]):
 data=json.loads(run(['ffprobe','-v','error','-count_frames','-show_entries','format=duration,size:stream=index,codec_name,codec_type,width,height,r_frame_rate,nb_read_frames,start_time,duration','-of','json',str(f)]))
 v=next(s for s in data['streams'] if s['codec_type']=='video');assert(v['width'],v['height'])==size;assert int(v['nb_read_frames'])==3588;assert v['r_frame_rate']=='30/1';assert abs(float(v['duration'])-119.6)<.001
 ap,an=packets(f);pc=pcm(f);assert ap==ba and an==bn and pc==bp
 subprocess.run(['ffmpeg','-v','error','-i',str(f),'-f','null','-'],check=True)
 result['files'].append({'file':str(f.relative_to(DEMO)),'sha256':sha(f),'probe':data,'audio_packet_hash':ap,'audio_packet_count':an,'decoded_audio_hash':pc,'full_decode':'passed'})
old=json.loads((DEMO/'film/cuts/blended-tag-v2/shots.json').read_text());new=json.loads((DEMO/'film/cuts/blended-moss-v2/shots.json').read_text())
assert len(old['slots'])==len(new['slots'])==20
for a,b in zip(old['slots'],new['slots']):
 aa={k:v for k,v in a.items() if k not in ['clip','clip_seconds','shows']}
 bb={k:v for k,v in b.items() if k not in ['clip','clip_seconds','shows']}
 assert aa==bb,a['id']
 if b['id'].startswith('walk-'):assert b['clip']=='../ui-concepts/renders/moss-clean-v2.mp4'
for f in ['script.json','mix.json','narration.json']:
 assert (DEMO/'film/cuts/blended-tag-v2'/f).read_bytes()==(DEMO/'film/cuts/blended-moss-v2'/f).read_bytes()
for f in ['paper.js','room.js','style.css','tl.js','u.js','data-extra.js']:
 assert (DEMO/'ui-concepts/tag'/f).read_bytes()==(DEMO/'ui-concepts/moss-v2'/f).read_bytes(),f
assert (DEMO/'film/cuts/blended-moss-v1/screens.json').read_bytes()==(DEMO/'film/cuts/blended-moss-v2/screens.json').read_bytes()
for f in ['scene.js','concept.json']:
 assert (DEMO/'ui-concepts/moss'/f).read_bytes()==(DEMO/'ui-concepts/moss-v2'/f).read_bytes(),f
result['v1_master_unchanged']=True
result['invariants']={'slot_count':20,'all_slot_times_camera_keys':True,'all_six_walk_spans':True,'original_audio_configuration':True,'walk_data_layout_style_timeline':True,'base_master_unchanged':True}
result['privacy']='Only existing public fictional sources and generic generated Moss artwork. No private-term-list scan claimed.'
result['new_cost_usd']=0.859070;result['project_cost_usd']=50.165149
(HERE/'evidence/checks.json').write_text(json.dumps(result,indent=2)+'\n');print(json.dumps({'exports':len(files),'frames':3588,'seconds':119.6,'audio':'packet and decoded hashes identical','base':'unchanged'},indent=2))
