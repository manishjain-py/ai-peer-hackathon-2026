#!/usr/bin/env python3
"""Provider alpha extraction, generic generated art only. Fal calls share the $10 ledger cap."""
from concurrent.futures import ThreadPoolExecutor,as_completed
from pathlib import Path
import json,subprocess,time,shutil
from PIL import Image
HERE=Path(__file__).resolve().parents[1];ROOT=HERE.parents[1]
cs=json.loads((HERE/'concepts.json').read_text())
shutil.copy2(HERE/'images/spike-moss.png',HERE/'images/25-moss.png')
shutil.copy2(HERE/'images/spike-moss-cutout.png',HERE/'cutouts/25-moss.png')
def run(c):
    stem=f"{c['number']:02d}-{c['id']}"
    raw=HERE/'images'/f'{stem}.png';out=HERE/'cutouts'/f'{stem}.png'
    if not out.exists():
        while not (HERE/'evidence'/f'{stem}-generation.json').exists():time.sleep(2)
        req={'endpoint':'fal-ai/birefnet','inputs':{'image_url':'file:'+str(raw.relative_to(ROOT)),'model':'General Use (Heavy)','operating_resolution':'2048x2048','output_format':'png','refine_foreground':True},'expect':{'units':1,'unit':'image','unit_price':.02,'cost_usd':.02,'basis':'Conservative compute allowance; live base $0.000575/compute second'},'output':str(out.with_suffix('').relative_to(ROOT)),'note':'Original generic generated mascot; no private input'}
        request=HERE/'requests'/f'{stem}-cutout.json';request.write_text(json.dumps(req,indent=2)+'\n')
        p=subprocess.run(['uv','run','--quiet',str(ROOT/'demo-video/tools/falgen.py'),str(request),'--ledger',str(HERE/'ledger/fal.csv'),'--cap','10','--session','generated-mascots'],capture_output=True,text=True,cwd=ROOT)
        (HERE/'.build'/f'{stem}-cutout.log').write_text(p.stdout+p.stderr)
        if p.returncode:raise RuntimeError(stem+' cutout failed')
    im=Image.open(out).convert('RGBA');a=im.getchannel('A');assert a.getextrema()==(0,255), stem+' alpha missing'
    # A clean chroma plate for image-to-video; this composition contains only generated art.
    bg=Image.new('RGBA',im.size,(255,0,255,255));bg.alpha_composite(im);bg.convert('RGB').save(HERE/'images'/f'{stem}-chroma.png')
    return stem+' alpha ready'
with ThreadPoolExecutor(max_workers=2) as pool:
    for j in as_completed([pool.submit(run,c) for c in cs]):print(j.result(),flush=True)
print('All 25 cutouts and generic chroma plates ready',flush=True)
