#!/usr/bin/env python3
"""Manual-export evidence for V39; saved media integrity, not a test suite."""
from pathlib import Path
import hashlib,json,subprocess,csv,re
P=Path(__file__).resolve().parents[1];D=P.parent;C=D/'film/cuts/blended-moss-v5'
def run(a):return subprocess.check_output(a,text=True)
def sha(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  while b:=f.read(1<<20):h.update(b)
 return h.hexdigest()
def probe(p):return json.loads(run(['ffprobe','-v','error','-count_frames','-show_entries','format=duration,size:stream=codec_type,codec_name,width,height,r_frame_rate,nb_read_frames,start_time,duration','-of','json',str(p)]))
def packets(p):
 j=json.loads(run(['ffprobe','-v','error','-select_streams','a:0','-show_packets','-show_data_hash','sha256','-show_entries','packet=pts,dts,duration,size,data_hash','-of','json',str(p)]));return{'hash':hashlib.sha256(json.dumps(j,sort_keys=True).encode()).hexdigest(),'count':len(j['packets'])}
def loud(p):
 t=subprocess.run(['ffmpeg','-hide_banner','-i',str(p),'-af','ebur128=peak=true','-f','null','-'],capture_output=True,text=True,check=True).stderr;t=t[t.rfind('Summary:'):]
 return{'lufs':float(re.search(r'I:\s+(-?[\d.]+) LUFS',t)[1]),'true_peak_dbfs':float(re.search(r'Peak:\s+(-?[\d.]+) dBFS',t)[1])}
prior=json.loads((D/'moss-introduction/evidence/checks.json').read_text());old=prior['predecessor_sha256'];old['blended-moss-v4.mp4']=prior['exports'][0]['sha256']
for n,h in old.items():assert sha(D/'film/renders'/n)==h,n
v4=json.loads((D/'film/cuts/blended-moss-v4/narration.json').read_text());v5=json.loads((C/'narration.json').read_text());assert v4['lines']==[x for x in v5['lines'] if x['id']!='p07v5']
shots=json.loads((C/'shots.json').read_text());by={s['id']:s for s in shots['slots']};assert 'mascot' not in by['morning-wake'] and 'mascot' not in by['morning-desk'];assert shots['narration']['p02v4']==15
assert by['proof-meeting']['start']==59.2 and by['proof-slack']['start']==82 and by['proof-slack']['length']==8
assert by['information-ocean']['start']==90 and by['information-ocean']['length']==10
assert by['morning-wake']['start']==100 and by['close-earth']['start']==111 and by['close-endcard']['start']==115.7
assert all('n07'!=x['id'] for x in v5['lines']);assert shots['seconds']==119.6
report={'predecessor_sha256':old,'predecessors_unchanged':True,'unchanged_voice_entries':22,'new_voice':'p07v5','new_voice_start':90.4,'new_voice_duration':7.5,'timeline':{'zoom':59.2,'slack':82,'ocean':90,'morning':100,'globe':111,'endcard':115.7},'exports':[]}
for name,size in [('blended-moss-v5.mp4',(1920,1080)),('blended-moss-v5-720p.mp4',(1280,720))]:
 p=D/'film/renders'/name;j=probe(p);v=next(s for s in j['streams'] if s['codec_type']=='video');assert(v['width'],v['height'])==size and v['nb_read_frames']=='3588' and v['r_frame_rate']=='30/1' and abs(float(v['duration'])-119.6)<.001
 subprocess.run(['ffmpeg','-v','error','-i',str(p),'-f','null','-'],check=True);lev=loud(p);assert abs(lev['lufs']+14)<.5 and lev['true_peak_dbfs']<=-1.4
 report['exports'].append({'file':str(p.relative_to(D)),'sha256':sha(p),'probe':j,'full_decode':'passed','loudness':lev,'aac_packets':packets(p)})
assert report['exports'][0]['aac_packets']==report['exports'][1]['aac_packets']
report['picture_preservation']={'mode':'full','note':'Fresh deterministic full render; prior movie files unchanged. No decoded-frame identity claim.'}
report['audio_preservation']=json.loads((P/'audio/pcm-preservation.json').read_text())
cost=sum(sum(float(r['cost_usd']) for r in csv.DictReader(f.open())) for f in (P/'ledger').glob('*.csv'))
report['new_cost_usd']=round(cost,6);report['project_cost_usd']=round(51.398527+cost,6)
report['privacy']='Only fictional/public repository data, existing generic Moss art, invented voice. No private recording or real company content.'
(P/'evidence/checks.json').write_text(json.dumps(report,indent=2)+'\n');print(json.dumps({k:report[k] for k in ['predecessors_unchanged','unchanged_voice_entries','timeline','new_cost_usd','project_cost_usd']},indent=2));print([x['loudness'] for x in report['exports']])
