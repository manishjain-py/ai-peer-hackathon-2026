#!/usr/bin/env python3
"""Completed-media evidence, including exact unchanged decoded picture ranges."""
from pathlib import Path
import hashlib,json,subprocess,csv,re
P=Path(__file__).resolve().parents[1];D=P.parent;B=P/'.build';C=D/'film/cuts/blended-moss-v4'
run=lambda a:subprocess.check_output(a,text=True)
def sha(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  while b:=f.read(1<<20):h.update(b)
 return h.hexdigest()
def probe(p):return json.loads(run(['ffprobe','-v','error','-count_frames','-show_entries','format=duration,size:stream=codec_type,codec_name,width,height,r_frame_rate,nb_read_frames,start_time,duration','-of','json',str(p)]))
def packets(p):
 j=json.loads(run(['ffprobe','-v','error','-select_streams','a:0','-show_packets','-show_data_hash','sha256','-show_entries','packet=pts,dts,duration,size,data_hash','-of','json',str(p)]));return{'hash':hashlib.sha256(json.dumps(j,sort_keys=True).encode()).hexdigest(),'count':len(j['packets'])}
def frames(p,out):
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(p),'-map','0:v:0','-f','framemd5',str(out)],check=True)
 return [l.split(',')[-1].strip() for l in out.read_text().splitlines() if not l.startswith('#')]
def loud(p):
 t=subprocess.run(['ffmpeg','-hide_banner','-i',str(p),'-af','ebur128=peak=true','-f','null','-'],capture_output=True,text=True,check=True).stderr;t=t[t.rfind('Summary:'):]
 return{'lufs':float(re.search(r'I:\s+(-?[\d.]+) LUFS',t)[1]),'true_peak_dbfs':float(re.search(r'Peak:\s+(-?[\d.]+) dBFS',t)[1])}
old=json.loads((D/'moss-refinement/evidence/checks.json').read_text())['predecessor_sha256'];old['blended-moss-v3.mp4']='e1dd89b0d0fbc99d544fdc69ae16539d53acf00ba83c981f567388311ec50841'
for n,h in old.items():assert sha(D/'film/renders'/n)==h,n
v3=json.loads((D/'film/cuts/blended-moss-v3/narration.json').read_text());v4=json.loads((C/'narration.json').read_text());assert [x for x in v3['lines'] if x['id']!='p02']==[x for x in v4['lines'] if x['id']!='p02v4']
shots=json.loads((C/'shots.json').read_text());by={s['id']:s for s in shots['slots']};assert 'mascot' not in by['morning-wake'] and 'mascot' not in by['morning-desk'];assert shots['narration']['p02v4']==15
assert all('n07'!=x['id'] for x in v4['lines']);assert shots['seconds']==119.6
report={'predecessor_sha256':old,'predecessors_unchanged':True,'unchanged_voice_entries':21,'new_voice':'p02v4','new_voice_start':15,'new_voice_duration':6.667,'exports':[]}
for name,size in [('blended-moss-v4.mp4',(1920,1080)),('blended-moss-v4-720p.mp4',(1280,720))]:
 p=D/'film/renders'/name;j=probe(p);v=next(s for s in j['streams'] if s['codec_type']=='video');assert(v['width'],v['height'])==size and v['nb_read_frames']=='3588' and v['r_frame_rate']=='30/1' and abs(float(v['duration'])-119.6)<.001
 subprocess.run(['ffmpeg','-v','error','-i',str(p),'-f','null','-'],check=True);lev=loud(p);assert abs(lev['lufs']+14)<.5 and lev['true_peak_dbfs']<=-1.4
 report['exports'].append({'file':str(p.relative_to(D)),'sha256':sha(p),'probe':j,'full_decode':'passed','loudness':lev,'aac_packets':packets(p)})
assert report['exports'][0]['aac_packets']==report['exports'][1]['aac_packets']
assembly=json.loads((P/'evidence/assembly.json').read_text())
if assembly.get('mode')=='full':
 report['picture_preservation']={'mode':'full','exact_frame_count':0,'note':'Optional full rebuild: compressed/decoded V3 identity is not claimed.'}
else:
 a=frames(D/'film/renders/blended-moss-v3.mp4',B/'baseline-frame-hashes.md5');b=frames(D/'film/renders/blended-moss-v4.mp4',B/'v4-frame-hashes.md5');assert len(a)==len(b)==3588
 ranges=[[0,420],[857,3000],[3409,3588]];results=[]
 for lo,hi in ranges:
  assert a[lo:hi]==b[lo:hi],f'Changed decoded frame outside patch in{lo}:{hi}'
  results.append({'frames':[lo,hi],'count':hi-lo,'sha256':hashlib.sha256('\n'.join(a[lo:hi]).encode()).hexdigest(),'exact_decoded_match':True})
 report['picture_preservation']={'mode':'gop-patch','ranges':results,'exact_frame_count':sum(x['count'] for x in results),'seconds':sum(x['count'] for x in results)/30,'gop_bridges':[[738,857],[3168,3409]],'note':'Only bridge compression changes; underlying bridge pictures are V3. Rebuild with --full does not promise binary/frame identity.'}
report['audio_preservation']=json.loads((P/'audio/pcm-preservation.json').read_text());report['new_cost_usd']=.0106;report['project_cost_usd']=51.398527
report['privacy']='New narration is invented; all pictures reuse existing fictional/generic repository sources. No unavailable private-term-list scan claimed.'
(P/'evidence/checks.json').write_text(json.dumps(report,indent=2)+'\n')
print(json.dumps({'seconds':119.6,'frames':3588,'preserved_decoded_frames':report['picture_preservation']['exact_frame_count'],'levels':[x['loudness'] for x in report['exports']],'aac':'identical betweenexports','predecessors':'unchanged'},indent=2))
