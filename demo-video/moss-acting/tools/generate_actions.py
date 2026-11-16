from pathlib import Path
from concurrent.futures import ThreadPoolExecutor,as_completed
import json,subprocess
ROOT=Path(__file__).resolve().parents[3];HERE=ROOT/'demo-video/moss-acting'
ACTIONS={
'listen': 'Lower the raised paw smoothly within the first half second. Then keep both paws relaxed down. Listen carefully with curious attentive eyes: turn the head slightly toward the left as if following a colleague, gently tilt one ear toward them, blink once, then return the gaze forward. Stay interested and still; NO nodding agreement, NO wave, NO mouth speech, NO paw to chin. End calm and attentive.',
'reassure': 'Lower the raised paw smoothly within the first half second. With a calm thoughtful face, open one paw low and gently toward the left as if explaining a careful boundary, glance at that paw, then bring both paws softly together near the lower belly and settle. No enthusiastic yes nod or approval sign. Warm restrained reassurance, NO greeting wave, NO speech mouth movement. End with a calm neutral face and hands resting together.',
'acknowledge': 'Lower the raised paw smoothly within the first half second, then keep both paws calmly down. Look slightly left as if noticing someone finish an action, give one small warm closed-mouth smile and ONE gentle slow acknowledgment nod, then return upright and settle in a relaxed satisfied pose. No wave, no thumbs up, no big bounce, no speech mouth movement. Nod happens after the first second, not immediately.'}
def run(pair):
 i,(name,action)=pair
 if (HERE/'assets'/f'moss-{name}.webm').exists():return name+' already exists; no paid call'
 prompt=f'''The exact single hand-felted woodland companion in the reference performs this specific activity: {action} Animate actual eyes, head and hands; preserve EXACT identity, green felt wool texture, cream face and belly, curled sprout, ears, amber pendant, all proportions and scale. Feet stay planted in the same central position and size. Entire body stays inside the generous existing margins. Completely locked camera, no pan/zoom/reframing. Background perfectly uniform pure magenta #FF00FF, no floor, shadow or scenery. No new objects, text, sound or music. One continuous five-second shot.'''
 req={'endpoint':'minimax/h3-max-turbo/image-to-video','inputs':{'prompt':prompt,'image_url':'file:demo-video/mascot-exploration-v2/images/25-moss-chroma.png','duration':5,'resolution':'768P','prompt_expansion_mode':'disabled','seed':16112672+i},'expect':{'units':5,'unit':'seconds at768p','unit_price':.04,'cost_usd':.2,'basis':'Existing verified fal endpoint; conservative rate'},'output':f'demo-video/moss-acting/assets/moss-{name}-source','note':'Generic selected Moss artwork only; V35 acting, no company/product material'}
 request=HERE/'requests'/f'{name}-motion.json';request.write_text(json.dumps(req,indent=2)+'\n')
 p=subprocess.run(['uv','run','--quiet',str(ROOT/'demo-video/tools/falgen.py'),str(request),'--ledger',str(HERE/'ledger/fal.csv'),'--cap','9','--session','moss-acting-v2'],capture_output=True,text=True,cwd=ROOT)
 (HERE/'.build'/f'{name}-generation.log').write_text(p.stdout+p.stderr)
 if p.returncode:raise RuntimeError(name+' failed; safe log saved')
 filt="format=rgba,colorkey=0xFF00FF:0.30:0.12,geq=r='r(X,Y)-max(0,min(r(X,Y)-g(X,Y),b(X,Y)-g(X,Y)))':g='g(X,Y)':b='b(X,Y)-max(0,min(r(X,Y)-g(X,Y),b(X,Y)-g(X,Y)))':a='alpha(X,Y)'"
 subprocess.run(['ffmpeg','-v','error','-y','-i',str(HERE/'assets'/f'moss-{name}-source.mp4'),'-vf',filt,'-c:v','libvpx-vp9','-pix_fmt','yuva420p','-b:v','0','-crf','24','-an',str(HERE/'assets'/f'moss-{name}.webm')],check=True)
 return name
with ThreadPoolExecutor(max_workers=2) as pool:
 for f in as_completed([pool.submit(run,p) for p in enumerate(ACTIONS.items())]):print(f.result()+' ready',flush=True)
