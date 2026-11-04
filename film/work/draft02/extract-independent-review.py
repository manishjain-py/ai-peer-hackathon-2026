from pathlib import Path
import subprocess
from concurrent.futures import ThreadPoolExecutor
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[2]
MOVIE = ROOT / 'renders/ai-peer-draft-02-preview.mp4'
DEST = ROOT / 'work/draft02/encoded-review'
DEST.mkdir(exist_ok=True)
GROUPS = {
    'opening': [4.8,5.4,5.7,6.1,6.5,7,7.5,8,8.5,9,10,12,14,18,19.5,21],
    'context': [41.7,42.1,42.5,43,44.5,48.8,49.1,49.5,50,51],
    'slack-scroll-1': [78.4,78.7,79,79.4,80.1,83,85.7,86,86.4,87,90,93],
    'source': [94.6,94.9,95.2,95.6,96.2,96.7,97.2,97.5,97.8],
    'slack-scroll-2': [97.7,98,98.4,99,104,107.1,107.5,107.9,108.5,111,117,118.8],
    'zoom-share': [153.3,153.7,154.1,154.5,154.9,155.3,155.7,156.1,157,159,160,162],
    'edit-joins': [136.4,136.6,142.4,142.6,150,150.2,164.4,164.6,171.4,171.6,176.1,176.3,189.2,189.4],
    'ending': [194.9,195.2,195.6,196.2,197,200,207,212,215.2,218,221.1,222,223,224],
}

all_times=sorted({t for values in GROUPS.values() for t in values})
def extract(t):
    path=DEST/f'frame-{t:07.2f}.png'
    subprocess.run(['ffmpeg','-v','error','-y','-ss',str(t),'-i',str(MOVIE),'-frames:v','1',str(path)],check=True)
    return t,path

paths=dict(ThreadPoolExecutor(max_workers=4).map(extract,all_times))
for name,times in GROUPS.items():
    cols=3 if name=='source' else 4
    width=640 if cols==3 else 480
    height=round(width*9/16)
    tile_h=height+30
    rows=(len(times)+cols-1)//cols
    sheet=Image.new('RGB',(width*cols,tile_h*rows),'#dfdfd9')
    draw=ImageDraw.Draw(sheet)
    for i,t in enumerate(times):
        img=Image.open(paths[t]).convert('RGB').resize((width,height),Image.Resampling.LANCZOS)
        x=(i%cols)*width;y=(i//cols)*tile_h
        sheet.paste(img,(x,y));draw.text((x+10,y+height+8),f'{t:.2f} seconds',fill='black')
    sheet.save(DEST/f'{name}.jpg',quality=92)
    print(name,len(times))
