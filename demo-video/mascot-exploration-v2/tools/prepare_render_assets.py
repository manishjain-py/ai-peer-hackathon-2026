"""Local framing only: generated art remains the source; no paid calls or private inputs."""
import json, subprocess, io
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont
ROOT=Path(__file__).resolve().parents[1]
meta=json.loads((ROOT/'asset-metadata.json').read_text())
# Face centre relative to each alpha bounding box, square side in units of its height.
faces={'miso':(.53,.23,.59),'tavi':(.44,.27,.63),'mallow':(.52,.47,.78),'pipkin':(.48,.31,.68),'nori':(.45,.29,.60),'bram':(.61,.21,.57),'pogo':(.52,.30,.68),'clover':(.45,.43,.60),'lumi':(.50,.31,.58),'fable':(.55,.29,.64),'sora':(.25,.37,.69),'peeko':(.50,.30,.58),'wisp':(.36,.46,.88),'orbit':(.38,.27,.64),'dew':(.43,.39,.67),'ember':(.44,.35,.65),'pebble':(.58,.36,.69),'bento':(.75,.52,.85),'manta':(.52,.23,.55),'tess':(.51,.46,.72),'pollen':(.53,.37,.69),'quill':(.45,.45,.67),'fenn':(.53,.23,.55),'noodle':(.61,.22,.55),'moss':(.52,.34,.67)}
font=ImageFont.truetype('/System/Library/Fonts/Supplemental/Arial.ttf',19)
config={}; avatar_sheet=Image.new('RGB',(1250,800),'#f3f0e4'); ad=ImageDraw.Draw(avatar_sheet)
for idx,m in enumerate(meta):
 stem=f"{m['number']:02d}-{m['id']}"; src=Image.open(ROOT/m['cutout']).convert('RGBA'); l,t,r,b=m['alpha_bbox']; fx,fy,sz=faces[m['id']]; side=(b-t)*sz; cx=l+(r-l)*fx;cy=t+(b-t)*fy
 crop=[round(cx-side/2),round(cy-side/2),round(cx+side/2),round(cy+side/2)]
 av=Image.new('RGBA',(512,512),'#c5e6ce'); av.alpha_composite(src.crop(crop).resize((512,512),Image.Resampling.LANCZOS)); av.convert('RGB').save(ROOT/'avatars'/f'{stem}.png')
 x=(idx%5)*250;y=(idx//5)*160;ad.text((x+8,y+7),f"{m['number']:02d} {m['name']}",font=font,fill='#163f30'); avatar_sheet.paste(av.resize((96,96)),(x+10,y+43)); avatar_sheet.paste(av.resize((64,64)),(x+118,y+50));avatar_sheet.paste(av.resize((48,48)),(x+192,y+57))
 motion=ROOT/'motion'/f'{stem}.webm'; bounds=m['alpha_bbox']; dim=2048
 frames=[]
 if motion.exists():
  boxes=[]
  for sec in [.1,1.1,2.1,3.1,4.5]:
   raw=subprocess.check_output(['ffmpeg','-hide_banner','-loglevel','error','-c:v','libvpx-vp9','-ss',str(sec),'-i',str(motion),'-frames:v','1','-f','image2pipe','-vcodec','png','-'])
   fr=Image.open(io.BytesIO(raw)).convert('RGBA'); box=fr.getchannel('A').point(lambda v:255 if v>12 else 0).getbbox();boxes.append(box);dim=fr.width;frames.append(fr)
  bounds=[min(z[0] for z in boxes),min(z[1] for z in boxes),max(z[2] for z in boxes),max(z[3] for z in boxes)]
  sheet=Image.new('RGB',(1500,650),'#f3f0e4');d=ImageDraw.Draw(sheet);d.text((20,10),f"Round 2 · {m['number']:02d} {m['name']} · generated motion at 0.1, 1.1, 2.1, 3.1, 4.5 s",font=font,fill='#163f30')
  for j,fr in enumerate(frames):
   for row,col in [(0,'#f3f0e4'),(1,'#173d30')]:
    tile=Image.new('RGBA',(300,300),col);tile.alpha_composite(fr.resize((300,300),Image.Resampling.LANCZOS));sheet.paste(tile,(j*300,45+row*300))
  sheet.save(ROOT/'evidence'/f'{stem}-motion.jpg',quality=90)
 config[m['id']]={'number':m['number'],'name':m['name'],'stem':stem,'motion':motion.exists(),'bounds':bounds,'dimension':dim,'avatar_crop':crop,'face':faces[m['id']]}
 print(stem,flush=True)
avatar_sheet.save(ROOT/'evidence'/'avatar-framing.jpg',quality=95)
(ROOT/'render-metadata.json').write_text(json.dumps(config,indent=2)+'\n')
# Keep only complete provider frames when a large generated gesture touches a source edge.
for ident,(start,end) in {'sora':(2.9,4.9),'manta':(.05,1.65)}.items():
 c=config[ident]; c['motion_range']=[start,end]; boxes=[]
 for j in range(11):
  sec=start+(end-start)*j/10
  raw=subprocess.check_output(['ffmpeg','-hide_banner','-loglevel','error','-c:v','libvpx-vp9','-ss',str(sec),'-i',str(ROOT/'motion'/f"{c['stem']}.webm"),'-frames:v','1','-f','image2pipe','-vcodec','png','-'])
  frame=Image.open(io.BytesIO(raw));boxes.append(frame.getchannel('A').point(lambda v:255 if v>12 else 0).getbbox())
 c['bounds']=[min(z[0] for z in boxes),min(z[1] for z in boxes),max(z[2] for z in boxes),max(z[3] for z in boxes)]
(ROOT/'render-metadata.json').write_text(json.dumps(config,indent=2)+'\n')
