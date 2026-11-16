from pathlib import Path
import subprocess
from PIL import Image,ImageDraw,ImageFont
P=Path(__file__).resolve().parents[1];font=ImageFont.truetype('/System/Library/Fonts/Helvetica.ttc',18)
for name in ['notebook','listen','reassure','acknowledge']:
 out=P/'.build'/f'{name}-proof';out.mkdir(parents=True,exist_ok=True)
 subprocess.run(['ffmpeg','-v','error','-y','-c:v','libvpx-vp9','-i',str(P/'assets'/f'moss-{name}.webm'),'-vf','fps=2',str(out/'f%02d.png')],check=True)
 for bg,label in [('#173f30','dark'),('#f4f3eb','light')]:
  board=Image.new('RGB',(1800,720),bg);d=ImageDraw.Draw(board)
  for i,f in enumerate(sorted(out.glob('*.png'))):
   im=Image.open(f).convert('RGBA');im.thumbnail((350,335));x=(i%5)*360;y=(i//5)*360;board.paste(im,(x,y),im);d.text((x+10,y+338),f'{name} {i/2:.1f}s',font=font,fill='white' if label=='dark' else '#173f30')
  board.save(P/'evidence'/f'{name}-{label}.jpg',quality=95)
print('Action and matte evidence ready')
