#!/usr/bin/env python3
"""Recorded media integrity and delivery measurements for the manually reviewed V6 film."""
from pathlib import Path
import csv,hashlib,json,re,subprocess
P=Path(__file__).resolve().parents[1];D=P.parent;C=D/'film/cuts/blended-moss-v6'
def sha(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  while b:=f.read(1<<20):h.update(b)
 return h.hexdigest()
def out(args):return subprocess.check_output(args,text=True)
def probe(p):return json.loads(out(['ffprobe','-v','error','-count_frames','-show_entries','format=duration,size:format_tags=comment:stream=codec_type,codec_name,width,height,r_frame_rate,nb_read_frames,start_time,duration','-of','json',str(p)]))
def packets(p):
 j=json.loads(out(['ffprobe','-v','error','-select_streams','a:0','-show_packets','-show_data_hash','sha256','-show_entries','packet=pts,dts,duration,size,data_hash','-of','json',str(p)]))
 return {'sha256':hashlib.sha256(json.dumps(j,sort_keys=True).encode()).hexdigest(),'count':len(j['packets'])}
def loud(p):
 t=subprocess.run(['ffmpeg','-hide_banner','-i',str(p),'-af','ebur128=peak=true','-f','null','-'],capture_output=True,text=True,check=True).stderr;t=t[t.rfind('Summary:'):]
 return {'lufs':float(re.search(r'I:\s+(-?[\d.]+) LUFS',t)[1]),'true_peak_dbfs':float(re.search(r'Peak:\s+(-?[\d.]+) dBFS',t)[1])}
baseline=json.loads((P/'evidence/predecessor-hashes.json').read_text())
old={Path(n).name:m['sha256'] for n,m in baseline.items()}
for n,m in baseline.items():assert sha(D.parent/n)==m['sha256'],n
previous={x['id']:x for x in json.loads((D/'film/cuts/blended-moss-v5/narration.json').read_text())['lines']}
lines={x['id']:x for x in json.loads((C/'narration.json').read_text())['lines']}
retained=[k for k,v in lines.items() if k in previous and v==previous[k]]
assert 'p05' not in lines and 'n07' not in lines
assert 'here for' not in lines['m1']['text'].lower()
assert len(lines)==22 and len(retained)==20
script=json.loads((C/'script.json').read_text());assert all(l['caption']=='none' for l in script['lines'])
assert "I'm an AI" not in next(l for l in script['lines'] if l['id']=='m1')['spoken']
shots=json.loads((C/'shots.json').read_text());by={s['id']:s for s in shots['slots']}
assert by['proof-meeting']['start']==59.2 and by['proof-meeting']['length']==19.8
assert by['proof-slack']['start']==79 and by['proof-slack']['length']==9
assert by['information-ocean']['start']==88 and by['information-ocean']['length']==12
assert by['morning-wake']['start']==100 and by['morning-wake']['in_s']==.8 and by['morning-wake']['length']==.7
assert by['morning-desk']['start']==100.7 and by['close-endcard']['start']==115.7
assert shots['seconds']==119.6 and 'Your update' not in by['hook-2']['card']['text']
report={'predecessor_sha256':old,'predecessors_unchanged':True,'unchanged_voice_entries':retained,'timeline':{'zoom':59.2,'slack':79,'ocean':88,'wake':100,'laptop':100.7,'globe':111,'endcard':115.7},'exports':[]}
for name,size in [('blended-moss-v6.mp4',(3840,2160)),('blended-moss-v6-1080p.mp4',(1920,1080))]:
 p=D/'film/renders'/name;j=probe(p);v=next(s for s in j['streams'] if s['codec_type']=='video')
 assert (v['width'],v['height'])==size and v['nb_read_frames']=='3588' and v['r_frame_rate']=='30/1' and abs(float(v['duration'])-119.6)<.001
 if '1080p' in name:assert p.stat().st_size<49_000_000
 assert 'NASA Earth Observatory' in j['format']['tags']['comment']
 subprocess.run(['ffmpeg','-v','error','-i',str(p),'-f','null','-'],check=True)
 level=loud(p);assert abs(level['lufs']+14)<.5 and level['true_peak_dbfs']<=-1.4
 report['exports'].append({'file':str(p.relative_to(D)),'sha256':sha(p),'probe':j,'full_decode':'passed','loudness':level,'aac_packets':packets(p)})
assert report['exports'][0]['aac_packets']==report['exports'][1]['aac_packets']
report['preserved_movie_files']=len(baseline)
report['audio_preservation']=json.loads((P/'audio/pcm-preservation.json').read_text())
report['cue_audit']=json.loads((P/'audio/cue-audit.json').read_text())
report['native_capture']={'ui':'HTML/SVG at2x browser device density; source-generated setup crossfade; no compressed walkthrough used for visible picture','canvas':'World and Earth backing at2x; source logical1920x1080','capture':'3840x2160 JPEG99 → H.264 CRF16, muxed without another master picture encode','source_limit':'Retained generated people and Moss art retain their original raster resolution; not all footage is native4K'}
report['privacy']='Only repository fictional data, generic invented people/Moss and authorized narration. No private recordings or actual company screens.'
cost=sum(float(r['cost_usd']) for f in (P/'ledger').glob('*.csv') for r in csv.DictReader(f.open()))
report['new_cost_usd']=round(cost,6);report['project_cost_usd']=round(51.610827+cost,6)
(P/'evidence/checks.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'predecessors_unchanged':True,'unchanged_voice_entries':len(retained),'exports':[{'file':e['file'],'bytes':e['probe']['format']['size'],'loudness':e['loudness']} for e in report['exports']]},indent=2))
