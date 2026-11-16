#!/usr/bin/env python3
"""Labeled inspection sheets from actual local images; no generative edits."""
from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
import sys,json
folder,base=map(Path,sys.argv[1:3]);times=json.loads(sys.argv[3])
font=ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc',18)
for group in range((len(times)+11)//12):
 chunk=times[group*12:(group+1)*12];out=Image.new('RGB',(1440,4*294),(238,235,224));d=ImageDraw.Draw(out)
 for j,t in enumerate(chunk):
  i=group*12+j;im=Image.open(folder/f'f{i:03}.jpg').convert('RGB');im.thumbnail((476,268));x=(j%3)*480;y=(j//3)*294;out.paste(im,(x,y));d.text((x+8,y+270),f'{t:.2f} s',font=font,fill=(30,60,45))
 out.save(str(base)+f'-{group+1}.jpg',quality=93)
