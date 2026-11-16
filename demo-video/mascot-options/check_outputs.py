#!/usr/bin/env python3
"""Inspect delivered artifacts; no model or external service is called."""
from pathlib import Path
from datetime import datetime, timezone
import hashlib, json, subprocess
ROOT=Path(__file__).resolve().parents[2]
HERE=Path(__file__).resolve().parent
MASTER=ROOT/'demo-video/film/renders/blended-tag-v2.mp4'
EXPECTED='7756283021b7237605337f079e435babb25143c2fb1d9023e6b70204a952b039'
def sha(p):
    h=hashlib.sha256()
    with p.open('rb') as f:
        for chunk in iter(lambda:f.read(1024*1024),b''): h.update(chunk)
    return h.hexdigest()
assert sha(MASTER)==EXPECTED, 'Approved master changed'
concepts=json.loads((HERE/'concepts.json').read_text())
rows=[]
for c in concepts:
    stem=f"{c['number']:02d}-{c['id']}"
    for version,size in [('',(1280,720)),('-1080p',(1920,1080))]:
        p=HERE/'renders'/f'{stem}{version}.mp4'
        probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_entries','format=duration,size:stream=codec_name,width,height,r_frame_rate,nb_frames','-of','json',str(p)]))
        video=next(s for s in probe['streams'] if s['codec_name']=='h264')
        audio=next(s for s in probe['streams'] if s['codec_name']=='aac')
        assert (video['width'],video['height'])==size
        assert video['r_frame_rate']=='30/1'
        assert int(video['nb_frames'])==699
        assert abs(float(probe['format']['duration'])-23.3)<.05
        assert p.stat().st_size<20_000_000
        run=subprocess.run(['ffmpeg','-v','error','-nostdin','-i',str(p),'-f','null','-'],capture_output=True,text=True)
        assert run.returncode==0 and not run.stderr, run.stderr
        rows.append({'file':str(p.relative_to(HERE)),'bytes':p.stat().st_size,'sha256':sha(p),'duration_seconds':float(probe['format']['duration']),'picture_frames':699,'fps':30,'width':size[0],'height':size[1],'video':'h264','audio':'aac','full_decode':'pass'})
    for suffix in ('portrait','sheet'):
        assert (HERE/'renders'/f'{stem}-{suffix}.png').is_file()
    print(stem,'pass',flush=True)
result={'checked_at':datetime.now(timezone.utc).isoformat(),'approved_master_sha256':EXPECTED,'approved_master_unchanged':True,'source_cut':'blended-tag-v2','new_paid_generation_spend_usd':0,'external_generation_calls':0,'private_inputs_used':False,'privacy_list_scan':'Unavailable on this Mac; not claimed. Public-source provenance and changed-file inspection instead.','visual_review':'Each character overview and five source-scene frames inspected by implementation worker; controller independently reviewed source/encoded sheets before Telegram delivery.','direct_audio_listening':False,'browser_page_errors':0,'picture_seconds':23.3,'source_spans':[{'reel_start':0,'seconds':3,'source':'new silent identification card'},{'reel_start':3,'seconds':6,'source_start':14},{'reel_start':9,'seconds':5,'source_start':76.5},{'reel_start':14,'seconds':5.4,'source_start':105.6},{'reel_start':19.4,'seconds':3.9,'source_start':115.7}],'outputs':rows}
(HERE/'evidence.json').write_text(json.dumps(result,indent=2)+'\n')
print('All 24 files pass; approved master unchanged',flush=True)
