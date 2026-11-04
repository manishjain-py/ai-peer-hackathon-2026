"""Send the user-authorized final film to Manish via the configured Telegram bot.
No token is logged, copied into the repository, or placed in command arguments.
"""
from pathlib import Path
import os,json,sys
import requests
root=Path(__file__).resolve().parents[2]
video=root/'renders/ai-peer-draft-03.mp4'
receipt=root/'work/draft03/telegram-delivery.json'
if receipt.exists() and json.loads(receipt.read_text()).get('ok'):
 print('Already delivered; receipt exists. No duplicate sent.');sys.exit(0)
token=os.environ.get('TELEGRAM_BOT_TOKEN')
if not token:
 env_path=Path.home()/'.claude/channels/telegram/.env'
 if env_path.exists():
  for row in env_path.read_text().splitlines():
   if row.startswith('TELEGRAM_BOT_TOKEN='):
    token=row.split('=',1)[1].strip().strip('\"\'');break
if not token:
 print('Telegram credential unavailable.');sys.exit(2)
if not video.is_file():
 print('Final video missing. Nothing sent.');sys.exit(2)
if video.stat().st_size>49_000_000:
 print('Final video exceeds conservative Telegram upload limit. Nothing sent.');sys.exit(2)
caption='AI Peer — Draft 03 (2:46.5). A faster cut with new conversational voices, upbeat music, and a personal brief for Manish: relevant service changes, events and opportunities. Zoom now addresses the Peer directly. Ready for your review.'
try:
 with video.open('rb') as f:
  response=requests.post('https://api.telegram.org/bot'+token+'/sendVideo',data={'chat_id':'7727757663','caption':caption,'supports_streaming':'true','width':'1920','height':'1080','duration':'167'},files={'video':(video.name,f,'video/mp4')},timeout=(15,180))
 payload=response.json()
 if not payload.get('ok'):
  print(json.dumps({'ok':False,'error_code':payload.get('error_code'),'description':payload.get('description','')}));sys.exit(3)
 result=payload['result'];proof={'ok':True,'message_id':result['message_id'],'chat_id':result['chat']['id'],'date':result['date'],'video':str(video.relative_to(root)),'file_size':result.get('video',{}).get('file_size',video.stat().st_size)}
 receipt.write_text(json.dumps(proof,indent=2)+'\n');print(json.dumps(proof))
except Exception as exc:
 # Do not echo request exceptions: URLs may contain the bot credential.
 print('Telegram upload did not return a confirmed result: '+type(exc).__name__+'. Check before retrying to avoid duplicates.');sys.exit(4)
