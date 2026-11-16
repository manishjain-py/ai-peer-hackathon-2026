#!/usr/bin/env python3
"""Review layouts of original generated assets. Does not alter the character artwork."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import json
HERE=Path(__file__).resolve().parents[1]
cs=json.loads((HERE/'concepts.json').read_text())
FONT='/System/Library/Fonts/Supplemental/Arial.ttf'
BG='#f5f1e7';INK='#194633'
metadata=[]
def art(c):
    stem=f"{c['number']:02d}-{c['id']}";im=Image.open(HERE/'cutouts'/f'{stem}.png').convert('RGBA');alpha=im.getchannel('A');box=alpha.point(lambda x:255 if x>12 else 0).getbbox();return im,box
for c in cs:
    im,box=art(c);metadata.append({'id':c['id'],'number':c['number'],'name':c['name'],'image':f"images/{c['number']:02d}-{c['id']}.png",'cutout':f"cutouts/{c['number']:02d}-{c['id']}.png",'dimensions':list(im.size),'alpha_bbox':list(box),'anchor_original_pixels':[(box[0]+box[2])/2,box[3]],'recommended_scene_height':180,'avatar_note':'Crop face/upper body deliberately for48–64px; full body stays in hero/room/UI companion.'})
(HERE/'asset-metadata.json').write_text(json.dumps(metadata,indent=2)+'\n')
def board(items,cols,tilew,tileh,title,out):
    rows=(len(items)+cols-1)//cols;sheet=Image.new('RGB',(cols*tilew+60,rows*tileh+145),BG);d=ImageDraw.Draw(sheet)
    head=ImageFont.truetype(FONT,44);name=ImageFont.truetype(FONT,27)
    d.text((34,28),title,font=head,fill=INK)
    for n,c in enumerate(items):
        x=30+(n%cols)*tilew;y=110+(n//cols)*tileh
        d.rounded_rectangle((x+4,y+4,x+tilew-10,y+tileh-10),radius=18,fill='#fffcf4',outline='#dce0ce',width=2)
        im,box=art(c);im=im.crop(box);im.thumbnail((tilew-65,tileh-100),Image.Resampling.LANCZOS)
        sheet.paste(im,(x+(tilew-im.width)//2,y+20+(tileh-105-im.height)//2),im)
        d.text((x+25,y+tileh-62),f"{c['number']:02d}  {c['name']}",font=name,fill=INK)
    sheet.save(HERE/'renders'/out,quality=95)
board(cs,5,430,460,'ROUND 2 · Twenty-five ways to be your Peer','overview.jpg')
for n in range(5):board(cs[n*5:n*5+5],5,450,540,f'ROUND 2 · Options {n*5+1:02d}–{n*5+5:02d}',f'group-{n+1}.jpg')
print('Overview, five groups and asset metadata ready')
