#!/usr/bin/env python3
"""Genuine character-only idle takes; 2 simultaneous fal calls, shared $10 cap.
Translucent Nori/Dew keep their provider-alpha still art to preserve fine material detail.
"""
from concurrent.futures import ThreadPoolExecutor,as_completed
from pathlib import Path
import json,subprocess,time,shutil
HERE=Path(__file__).resolve().parents[1];ROOT=HERE.parents[1]
cs=json.loads((HERE/'concepts.json').read_text())
actions={
'miso':'gives two clearly visible relaxed paw waves, closes its eyes in a delighted blink, tilts its head toward the viewer, then smiles and settles',
'tavi':'opens its clasped paws as if warmly welcoming a colleague, gives a small pleased nod and a slow blink, then brings the paws together and settles',
'mallow':'its knitted lobes gently bounce with a soft breath, it gives a lively mitten wave and a delighted closed-eye smile, then settles',
'pipkin':'its large ears twitch independently, it leans its head curiously toward the viewer, gives a small happy hand wave and a blink, then settles',
'bram':'its folded paper wings lift and settle once, its curled tail gently flexes, it waves a little wooden paw and nods with a warm smile',
'pogo':'its plush striped tail gently swishes, it waves a soft paw twice, tips its head curiously and gives a bright closed-eye smile, then settles',
'clover':'its leaf crest perks up and softly sways, it waves a little leaf hand, makes a delighted blink and a curious head tilt, then settles',
'lumi':'its sculpted paper wings softly flutter twice, its antennae bend with the movement, its warm inner light breathes, it offers a happy small hand wave',
'fable':'its folded ears perk independently, its paper tail flexes gently, it lifts one folded paw in greeting and gives a warm blink and nod',
'sora':'it gently spreads and folds its small wings, tilts its head inquisitively, gives a happy blink and a tiny tail-feather flourish',
'peeko':'its woven ribbon body flexes softly within its place, its curled top tips like an attentive head, one tiny hand waves twice and its eyes close in a warm smile',
'wisp':'it gives two graceful small fin waves, smiles and blinks, its tail softly curls and returns, its whole body breathes gently without moving position',
'orbit':'its green ring arms rotate gently to make a warm greeting, one ring tip waves, it nods its bean-shaped head and blinks happily, then settles',
'ember':'its little protective hood moves softly as it tilts its head, it waves a small ceramic hand, closes its eyes in a warm smile, its inner light breathes gently',
'pebble':'its tiny fern softly uncurls and relaxes, it gives a thoughtful friendly nod and a small stone-hand wave, with a delighted warm blink',
'bento':'its bamboo shell segments flex subtly with breathing, it tilts its snout curiously, gives a cheerful blink and a small front-paw greeting, then settles',
'manta':'a graceful soft wave passes through its silk wings, it lifts one wing in greeting, gives a delighted blink and its ribbon tail gently curls and returns',
'tess':'the woven knot flexes gently, one loose ribbon end waves like a hand, the face gives a warm closed-eye smile and a small curious tilt, then settles',
'pollen':'its delicate paper wings flutter, its antennae bob, it gives two visible little paw waves and a joyful closed-eye smile, then settles',
'quill':'its folded-paper leaf crest softly rustles, it gives two little ceramic-paw waves, tilts its head toward the viewer and blinks with a cheerful smile',
'fenn':'its leaf ears perk independently, it gives a graceful small head bow and a slow happy blink, lifts its front hoof slightly in greeting, then settles',
'noodle':'its long cloth tail gently curls and relaxes, one soft hand gives two visible waves, it tilts its head inquisitively and gives a delighted blink'
}
keyfilter='format=rgba,colorkey=0xFF00FF:0.30:0.12'
def alpha(src,dst):
    subprocess.run(['ffmpeg','-hide_banner','-loglevel','error','-nostdin','-y','-i',str(src),'-vf',keyfilter,'-c:v','libvpx-vp9','-pix_fmt','yuva420p','-b:v','0','-crf','24','-an',str(dst)],check=True)
def run(c):
    stem=f"{c['number']:02d}-{c['id']}"
    if c['id'] in ('nori','dew'):
        c['motion_method']='provider-alpha still; subtle composed movement to preserve translucent material'
        return c
    out=HERE/'motion'/f'{stem}.webm'
    if c['id']=='moss':
        alpha(HERE/'images/spike-moss-motion-v2.mp4',out)
        c['motion_method']='generated character video (Moss pilot v2), alpha keyed';return c
    if not out.exists():
        plate=HERE/'images'/f'{stem}-chroma.png'
        while not plate.exists():time.sleep(2)
        prompt=f"""A single original friendly character {actions[c['id']]}. Clearly visible expressive animation WITHIN the character: actual eyes, face, head and limbs move, not just sliding the whole still. Preserve the beautiful original identity, colours, material and every design feature. The body remains in exactly the same central position and same size; feet stay planted or hovering at the original height. Entire character, wings, tail and crest stay inside the existing generous margins. Completely locked camera: no zoom, pan, camera shake or reframing. Background remains perfectly uniform solid pure magenta #FF00FF throughout, no gradients, no floor, no cast shadows or scenery. No new objects, no text, no sound or music. Friendly thoughtful acting, mature and reassuring rather than frantic. One continuous five-second shot, returning close to the original relaxed pose at the end."""
        req={'endpoint':'minimax/h3-max-turbo/image-to-video','inputs':{'prompt':prompt,'image_url':'file:'+str(plate.relative_to(ROOT)),'duration':5,'resolution':'768P','prompt_expansion_mode':'disabled','seed':16112600+c['number']},'expect':{'units':5,'unit':'seconds at768p','unit_price':.04,'cost_usd':.2,'basis':'Official fal standard rates2026-11-16; conservative vs accountlivebase'},'output':str((HERE/'motion'/f'{stem}-source').relative_to(ROOT)),'note':'Generic generated character-only video; no company/product scene uploaded'}
        request=HERE/'requests'/f'{stem}-motion.json';request.write_text(json.dumps(req,indent=2)+'\n')
        r=subprocess.run(['uv','run','--quiet',str(ROOT/'demo-video/tools/falgen.py'),str(request),'--ledger',str(HERE/'ledger/fal.csv'),'--cap','10','--session','generated-mascots'],capture_output=True,text=True,cwd=ROOT)
        (HERE/'.build'/f'{stem}-motion.log').write_text(r.stdout+r.stderr)
        if r.returncode:raise RuntimeError(stem+' video generation failed')
        alpha(HERE/'motion'/f'{stem}-source.mp4',out)
    c['motion_method']='generated character video, alpha keyed'
    return c
out=[]
with ThreadPoolExecutor(max_workers=2) as pool:
    for j in as_completed([pool.submit(run,c) for c in cs]):
        c=j.result();out.append(c);print(f"{c['number']:02d}-{c['id']} motion ready: {c['motion_method']}",flush=True)
(HERE/'motion-manifest.json').write_text(json.dumps(sorted(out,key=lambda c:c['number']),indent=2)+'\n')
print('23 generated alpha takes + 2 translucent still assets ready',flush=True)
