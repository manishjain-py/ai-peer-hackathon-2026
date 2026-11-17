#!/usr/bin/env python3
"""Evidence for completed V36 media and preserved predecessors; not a unit-test suite."""
from pathlib import Path
import hashlib,json,subprocess,csv,re
P=Path(__file__).resolve().parents[1];D=P.parent
run=lambda a:subprocess.check_output(a,text=True)
def sha(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  while b:=f.read(1<<20):h.update(b)
 return h.hexdigest()
def packets(p):
 j=json.loads(run(['ffprobe','-v','error','-select_streams','a:0','-show_packets','-show_data_hash','sha256','-show_entries','packet=pts,dts,duration,size,data_hash','-of','json',str(p)]))
 return {'hash':hashlib.sha256(json.dumps(j,sort_keys=True).encode()).hexdigest(),'count':len(j['packets'])}
def probe(p):return json.loads(run(['ffprobe','-v','error','-count_frames','-show_entries','format=duration,size:stream=codec_type,codec_name,width,height,r_frame_rate,nb_read_frames,start_time,duration','-of','json',str(p)]))
def loud(p):
 j=subprocess.run(['ffmpeg','-hide_banner','-i',str(p),'-af','ebur128=peak=true','-f','null','-'],capture_output=True,text=True,check=True).stderr
 t=j[j.rfind('Summary:'):];return {'lufs':float(re.search(r'I:\s+(-?[\d.]+) LUFS',t)[1]),'true_peak_dbfs':float(re.search(r'Peak:\s+(-?[\d.]+) dBFS',t)[1])}
old={'blended-tag-v2.mp4':'7756283021b7237605337f079e435babb25143c2fb1d9023e6b70204a952b039','blended-moss-v1.mp4':'c6672bd1b42b09b5c66c4dbd55bdb2f37ef5dbac6e79594f061f3fc5cb4f2941','blended-moss-v2.mp4':'acf0d9aa68f86f085c24a698f095e5606cf86b23b29db1f83965d6029aaac2b4'}
for name,expected in old.items():assert sha(D/'film/renders'/name)==expected,name
C=D/'film/cuts/blended-moss-v3';shots=json.loads((C/'shots.json').read_text());script=json.loads((C/'script.json').read_text());narr=json.loads((C/'narration.json').read_text());before=json.loads((D/'film/cuts/blended-moss-v2/narration.json').read_text())
assert narr['lines']==[l for l in before['lines'] if l['id']!='n07']
assert 'n07' not in shots['narration'];assert all(l['id']!='n07' for l in script['lines'])
assert not any('information, never instructions' in l['text'] for l in script['lines'])
by={s['id']:s for s in shots['slots']};assert by['proof-meeting']['start']==66.6 and by['proof-slack']['start']==89.4 and by['proof-slack']['length']==10.6
assert by['morning-wake']['start']==100 and by['close-earth']['start']==111 and by['close-endcard']['start']==115.7
assert not any(n in by for n in ['entrance-room','entrance-desk','entrance-pushin'])
assert by['entrance-direct']['scene']=='mossentrance'
report={'predecessor_sha256':old,'predecessors_unchanged':True,'retained_voice_lines':len(narr['lines']),'retained_voice_metadata_exact':True,'removed_line':'n07','new_timing':{'zoom':66.6,'slack':89.4,'morning':100,'globe':111,'endcard':115.7},'exports':[]}
for name,size in [('blended-moss-v3.mp4',(1920,1080)),('blended-moss-v3-720p.mp4',(1280,720))]:
 p=D/'film/renders'/name;j=probe(p);v=next(s for s in j['streams'] if s['codec_type']=='video');assert (v['width'],v['height'])==size;assert v['nb_read_frames']=='3588' and v['r_frame_rate']=='30/1' and abs(float(v['duration'])-119.6)<.001
 subprocess.run(['ffmpeg','-v','error','-i',str(p),'-f','null','-'],check=True)
 levels=loud(p);assert levels['true_peak_dbfs']<=-1.4 and abs(levels['lufs']+14)<.5
 report['exports'].append({'file':str(p.relative_to(D)),'sha256':sha(p),'probe':j,'full_decode':'passed','loudness':levels,'aac_packets':packets(p)})
assert report['exports'][0]['aac_packets']==report['exports'][1]['aac_packets']
p=D/'ui-concepts/renders/moss-clean-v3.mp4';j=probe(p);v=j['streams'][0];assert v['nb_read_frames']=='1740' and v['duration']=='58.000000';report['source_walkthrough']={'file':str(p.relative_to(D)),'sha256':sha(p),'probe':j}
fal=sum(float(r['cost_usd']) for r in csv.DictReader((P/'ledger/fal.csv').open()));gem=sum(json.loads(l)['cost_usd'] for l in (P/'ledger/gemini.jsonl').read_text().splitlines());report['new_cost_usd']=round(fal+gem,6);report['project_cost_usd']=round(50.165149+fal+gem,6)
report['privacy']='Only repository fictional source and generic Moss art; no unavailable private-term-list scan claimed.'
report['audio']='New V36 mix; original PCM music regions verified in audio/bed-verification.json; 720p AAC exactly stream-copied from1080p.'
(P/'evidence/checks.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'frames':3588,'seconds':119.6,'predecessors':'unchanged','aac':'identical between exports','levels':[x['loudness'] for x in report['exports']],'new_cost_usd':report['new_cost_usd'],'project_cost_usd':report['project_cost_usd']},indent=2))
