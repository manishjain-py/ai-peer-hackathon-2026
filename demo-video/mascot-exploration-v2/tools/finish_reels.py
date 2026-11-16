"""Assemble the 75-second introduction reel and verify delivered encoded media."""
import json, subprocess, hashlib, datetime
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1];CACHE=ROOT/'.build';OUT=ROOT/'renders'
concepts=json.loads((ROOT/'concepts.json').read_text())
def run(args): return subprocess.run(args,check=True,capture_output=True)
def probe(file): return json.loads(run(['ffprobe','-v','error','-count_frames','-show_entries','format=duration,size:stream=codec_type,width,height,nb_read_frames,duration,avg_frame_rate','-of','json',str(file)]).stdout)
parts=[]
for c in concepts:
 stem=f"{c['number']:02d}-{c['id']}";dest=CACHE/f'{stem}-intro.mp4'
 if not dest.exists() or dest.stat().st_mtime<(OUT/f'{stem}-1080p.mp4').stat().st_mtime:
  run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(OUT/f'{stem}-1080p.mp4'),'-t','3','-an','-c:v','libx264','-preset','fast','-crf','20','-pix_fmt','yuv420p',str(dest)])
 parts.append(f"file '{dest}'")
(CACHE/'intros.txt').write_text('\n'.join(parts)+'\n')
bed=ROOT.parent/'film/audio/music/bed-blended-v2.wav'
master=OUT/'quick-look-75s-1080p.mp4'
run(['ffmpeg','-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',str(CACHE/'intros.txt'),'-i',str(bed),'-map','0:v','-map','1:a','-t','75','-c:v','copy','-af','volume=-11dB,afade=t=in:st=0:d=1.5,afade=t=out:st=72:d=3','-c:a','aac','-b:a','160k','-movflags','+faststart',str(master)])
run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(master),'-vf','scale=1280:720','-c:v','libx264','-preset','fast','-crf','23','-c:a','copy','-movflags','+faststart',str(OUT/'quick-look-75s.mp4')])
run(['ffmpeg','-hide_banner','-loglevel','error','-y','-i',str(OUT/'quick-look-75s.mp4'),'-vf',"select='eq(mod(n,90),30)',scale=384:216,tile=5x5:padding=5:color=0xf3f0e4",'-frames:v','1',str(OUT/'quick-look-encoded.jpg')])
records=[]
for c in concepts:
 stem=f"{c['number']:02d}-{c['id']}"
 for suffix in ['', '-1080p']:
  file=OUT/f'{stem}{suffix}.mp4';run(['ffmpeg','-hide_banner','-loglevel','error','-i',str(file),'-f','null','-'])
  info=probe(file);v=next(x for x in info['streams'] if x['codec_type']=='video');assert int(v['nb_read_frames'])==699,(file,v);assert abs(float(v['duration'])-23.3)<.001
  assert suffix or file.stat().st_size<10_000_000
  records.append({'file':str(file.relative_to(ROOT)),'full_decode':'pass','sha256':hashlib.sha256(file.read_bytes()).hexdigest(),**info})
for file in [master,OUT/'quick-look-75s.mp4']:
 run(['ffmpeg','-hide_banner','-loglevel','error','-i',str(file),'-f','null','-']);info=probe(file);v=next(x for x in info['streams'] if x['codec_type']=='video');assert int(v['nb_read_frames'])==2250
 records.append({'file':str(file.relative_to(ROOT)),'full_decode':'pass','sha256':hashlib.sha256(file.read_bytes()).hexdigest(),**info})
original=ROOT.parent/'film/renders/blended-tag-v2.mp4';original_hash=hashlib.sha256(original.read_bytes()).hexdigest();assert original_hash=='7756283021b7237605337f079e435babb25143c2fb1d9023e6b70204a952b039'
motion_alpha=[]
meta=json.loads((ROOT/'render-metadata.json').read_text())
for c in concepts:
 m=meta[c['id']]
 if not m['motion']:continue
 file=ROOT/'motion'/f"{m['stem']}.webm"
 raw=run(['ffmpeg','-hide_banner','-loglevel','error','-c:v','libvpx-vp9','-i',str(file),'-vf','alphaextract,scale=64:64','-pix_fmt','gray','-f','rawvideo','-']).stdout
 values=[sum(raw[i:i+4096])/4096 for i in range(0,len(raw),4096)]
 assert min(values)>4,(file,min(values))
 motion_alpha.append({'id':c['id'],'frames':len(values),'minimum_mean_alpha':round(min(values),4),'empty_frames':0})
report={'checked_at':datetime.datetime.now(datetime.timezone.utc).isoformat(),'auditions':25,'exports':50,'frames_per_audition':699,'audition_video_seconds':23.3,'quick_look_frames':2250,'quick_look_seconds':75,'original_master_unchanged_sha256':original_hash,'records':records,'motion_alpha_checks':motion_alpha}
(ROOT/'evidence'/'render-checks.json').write_text(json.dumps(report,indent=2)+'\n');print('All 50 audition exports and both quick-look exports fully decode; frame counts, duration, compact copy sizes and original master hash pass.')
