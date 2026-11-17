#!/usr/bin/env python3
"""Explicit final V6 Telegram delivery; never invoked by the offline renderer."""
from pathlib import Path
from datetime import datetime,timezone
import csv,hashlib,json,math,os,subprocess,sys,tempfile

movie=Path(sys.argv[1]).resolve();receipt=Path(sys.argv[2]).resolve()
assert movie.name=='blended-moss-v6-1080p.mp4'
assert not movie.is_relative_to(Path.home()/'.ai-peer')
assert movie.stat().st_size<49_000_000
assert not receipt.exists(),'A delivery receipt exists. Inspect it before any resend.'
probe=json.loads(subprocess.check_output(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(movie)]))
v=next(s for s in probe['streams'] if s['codec_type']=='video');duration=float(probe['format']['duration'])
assert (v['width'],v['height'])==(1920,1080) and duration<120
assert int(v['nb_frames'])==3588
token=os.environ.get('TELEGRAM_BOT_TOKEN')
if not token:
 for line in (Path.home()/'.claude/channels/telegram/.env').read_text().splitlines():
  if line.startswith('TELEGRAM_BOT_TOKEN='):token=line.split('=',1)[1].strip().strip('"').strip("'");break
assert token and '\n' not in token
chat=-5506416790
def request(method,fields,file_kind=None):
 with tempfile.NamedTemporaryFile(mode='w',prefix='moss-v6-tg-',delete=False) as f:
  os.chmod(f.name,0o600);f.write('url = "https://api.telegram.org/bot'+token+'/'+method+'"\n');cfg=f.name
 try:
  args=['curl','-sS','-m','300','--config',cfg]
  for k,val in fields.items():args+=['--form-string',f'{k}={val}']
  if file_kind:args+=['-F',file_kind+'=@'+str(movie)]
  r=subprocess.run(args,capture_output=True,text=True)
  if r.returncode:raise RuntimeError('Telegram transport uncertain; inspect delivery before retry.')
  out=json.loads(r.stdout)
  if not out.get('ok'):raise RuntimeError('Telegram rejected request: '+out.get('description','unknown'))
  return out['result']
 finally:Path(cfg).unlink(missing_ok=True)
dest=request('getChat',{'chat_id':chat});assert dest['id']==chat and dest.get('title')=='Attention Learnlikemagic'
cost=sum(float(r['cost_usd']) for f in (Path(__file__).resolve().parents[1]/'ledger').glob('*.csv') for r in csv.DictReader(f.open()))
data={'version':'blended-moss-v6','status':'partial','actual_movie_seconds':duration,'frames':int(v['nb_frames']),'file':'film/renders/'+movie.name,'sha256':hashlib.sha256(movie.read_bytes()).hexdigest(),'local_bytes':movie.stat().st_size,'new_cost_usd':round(cost,6),'project_cost_usd':round(51.610827+cost,6),'controller_acceptance':'passed','approved_as_final_by_user':False}
receipt.parent.mkdir(parents=True,exist_ok=True)
caption='Moss v6 — final 1:59.6 revision in crisp 1080p. All twelve feedback areas addressed: no subtitles; clearer, vertically stacked content; clean colleague voice; shorter Zoom intro; more Slack typing; Moss physically picks and places three relevant updates; direct wake-to-laptop cut; stronger musical finish; your exact product link. A 4K source-rendered master is saved locally. Earth imagery: NASA Earth Observatory (Black Marble2016; Blue Marble: Next Generation).'
result=request('sendVideo',{'chat_id':chat,'caption':caption,'supports_streaming':'true','width':v['width'],'height':v['height'],'duration':math.ceil(duration)},'video')
mv=result['video'];data['video']={'confirmed':True,'message_id':result['message_id'],'chat_id':chat,'date_utc':datetime.fromtimestamp(result['date'],timezone.utc).isoformat(),'caption':caption,'file_size':mv['file_size'],'width':mv['width'],'height':mv['height'],'telegram_duration':mv['duration'],'supports_streaming_requested':True}
receipt.write_text(json.dumps(data,indent=2)+'\n')
caption='Moss v6 — original 1080p file for downloading at full quality. Same complete movie as above; earlier versions remain preserved. Earth imagery: NASA Earth Observatory (Black Marble2016; Blue Marble: Next Generation).'
result=request('sendDocument',{'chat_id':chat,'caption':caption,'disable_content_type_detection':'true'},'document')
data['document']={'confirmed':True,'message_id':result['message_id'],'chat_id':chat,'date_utc':datetime.fromtimestamp(result['date'],timezone.utc).isoformat(),'caption':caption,'file_size':result['document']['file_size'],'file_name':result['document']['file_name']}
data['status']='delivered';receipt.write_text(json.dumps(data,indent=2)+'\n')
print(json.dumps({'video':data['video']['message_id'],'document':data['document']['message_id'],'receipt':str(receipt)}))
