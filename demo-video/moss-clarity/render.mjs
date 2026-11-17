#!/usr/bin/env node
// Public-only Moss full film. Frame capture explicitly waits for every scene and alpha-video
// seek. V39 uses the retimed local mix; paid providers are never invoked here.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
import {once} from 'node:events';
import {build} from '../film/build.mjs';
const HERE=path.dirname(fileURLToPath(import.meta.url)),DEMO=path.dirname(HERE),CACHE=path.join(HERE,'.build'),EVIDENCE=path.join(HERE,'evidence');
const FILM=path.join(DEMO,'film'),UI=path.join(DEMO,'ui-concepts'),FPS=30;
const MASTER=path.join(HERE,'audio/mix.wav');
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
let PW;try{PW=createRequire(import.meta.url)('playwright');}catch{PW=createRequire(path.join(process.env.CODEX_NODE_MODULES||path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'),'package.json'))('playwright');}
for(const p of [CACHE,EVIDENCE,path.join(UI,'renders'),path.join(FILM,'renders')])fs.mkdirSync(p,{recursive:true});
const args=process.argv.slice(2),isFilm=true,probeOnly=args.includes('--probe'),liveWalk=true,actingProof=args.includes('--acting-proof');
const project=path.join(CACHE,isFilm?'film':'walk');
function prepare(){build({cut:'blended-moss-v6',out:project});prepareWalk(path.join(CACHE,'walk'));}
function prepareWalk(out){
 fs.mkdirSync(out,{recursive:true});fs.cpSync(path.join(UI,'shared'),path.join(out,'shared'),{recursive:true});fs.cpSync(path.join(UI,'moss-v6'),path.join(out,'scene'),{recursive:true});
 const c=JSON.parse(fs.readFileSync(path.join(FILM,'cuts/blended-moss-v6/cut.json')));const to=path.join(out,'scene/moss-assets');fs.mkdirSync(to,{recursive:true});for(const x of c.copies)if(x.to.includes('moss-assets/'))fs.copyFileSync(path.resolve(FILM,'cuts/blended-moss-v6',x.from),path.join(to,path.basename(x.to)));
 const meta=JSON.parse(fs.readFileSync(path.join(UI,'moss-v6/concept.json')));meta.framing=false;fs.writeFileSync(path.join(out,'concept-meta.js'),'export default '+JSON.stringify(meta)+';\n');
 fs.writeFileSync(path.join(out,'index.html'),fs.readFileSync(path.join(UI,'shared/index.template.html'),'utf8').replaceAll('{{TITLE}}','Moss V6 native source').replace('{{SECONDS}}',String(meta.seconds)).replace('{{SCENE_CSS}}','<link rel="stylesheet" href="scene/style.css"/>'));
}

function serve(){return new Promise(resolve=>{const srv=http.createServer((req,res)=>{
 if(req.url==='/favicon.ico'){res.writeHead(204).end();return;}
 let decoded;try{decoded=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
 const file=path.resolve(CACHE,'.'+decoded);if(!file.startsWith(CACHE+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
 const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.png':'image/png','.jpg':'image/jpeg','.svg':'image/svg+xml','.mp4':'video/mp4','.webm':'video/webm','.ttf':'font/ttf'};
 const size=fs.statSync(file).size;res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.setHeader('Accept-Ranges','bytes');
 const m=req.headers.range?.match(/bytes=(\d+)-(\d*)/);if(m){const start=+m[1],end=m[2]?Math.min(size-1,+m[2]):size-1;res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':end-start+1});fs.createReadStream(file,{start,end}).pipe(res);}else{res.setHeader('Content-Length',size);fs.createReadStream(file).pipe(res);}
 });srv.listen(0,'127.0.0.1',()=>resolve({srv,url:`http://127.0.0.1:${srv.address().port}`}));});}
async function execAsync(command,args){const child=spawn(command,args,{stdio:['ignore','ignore','pipe']});let err='';child.stderr.on('data',x=>err+=x);const [code]=await once(child,'close');if(code!==0)throw new Error(command+' failed: '+err);}
async function init(browser,url){const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:2});page.errors=[];page.on('pageerror',e=>page.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')page.errors.push(m.text());});await page.goto(url,{waitUntil:'load'});await page.waitForFunction(mode=>mode?window.__film:window.__concept,isFilm,{timeout:15000}).catch(async e=>{throw new Error(page.errors.join('\n')+'\n'+await page.locator('body').innerText());});
 if(liveWalk){const slots=JSON.parse(fs.readFileSync(path.join(FILM,'cuts/blended-moss-v6/shots.json'),'utf8')).slots.filter(s=>s.id.startsWith('walk-')&&s.kind==='ai');await page.evaluate(({url,slots})=>{const f=document.createElement('iframe');f.src=url;f.style.cssText='position:absolute;inset:0;width:1920px;height:1080px;border:0;background:#f4f3eb;display:block';document.getElementById('shots').appendChild(f);window.__liveWalk={frame:f,slots};},{url:new URL('../walk/index.html',url).href,slots});await page.waitForFunction(()=>window.__liveWalk.frame.contentWindow.__concept,{timeout:60000});await page.evaluate(()=>window.__liveWalk.frame.style.display='none');}
 return page;}
async function seek(page,t){await page.evaluate(async ({t,isFilm})=>{
 window.__mascotTime=t;if(isFilm)window.__film.renderAt(t);else await window.__concept.renderAt(t);
 let actorDoc=document;const live=window.__liveWalk;if(live){const slot=live.slots.find(s=>t>=s.start&&t<s.start+s.length);live.frame.style.display=slot?'block':'none';for(const n of document.getElementById('shots').children)if(n!==live.frame){n.style.visibility=slot?'hidden':'';if(slot)n.style.display='none';}if(slot){let st=slot.in_s+(t-slot.start)*slot.rate;if(slot.source_warp){const w=slot.source_warp;let i=1;while(i<w.length-1&&t>w[i][0])i++;const[a,b]=[w[i-1],w[i]];st=a[1]+(b[1]-a[1])*(t-a[0])/(b[0]-a[0]);}await live.frame.contentWindow.__concept.renderAt(st);actorDoc=live.frame.contentDocument;}}
 const seekVideo=async(v,at)=>{if(v.readyState<1)await new Promise((ok,fail)=>{v.addEventListener('loadedmetadata',ok,{once:true});v.addEventListener('error',()=>fail(new Error('Video load '+v.src)),{once:true});v.load();});at=Math.max(0,Math.min(v.duration-.01,at));if(Math.abs(v.currentTime-at)>0.00001)await new Promise((ok,fail)=>{const timeout=setTimeout(()=>fail(new Error('Video seek timeout '+v.src)),15000);v.addEventListener('seeked',()=>{clearTimeout(timeout);ok();},{once:true});v.currentTime=at;});};
 const clips=[...document.querySelectorAll('video[data-start]')].filter(v=>t>=+v.dataset.start&&t<+v.dataset.start+(+v.dataset.duration));
 await Promise.all(clips.map(v=>seekVideo(v,(()=>{const slot=window.__film.film.slots.find(s=>s.video?.id===v.id);const w=slot?.source_warp;if(!w)return Number(v.dataset.mediaStart)+(t-Number(v.dataset.start))*Number(v.dataset.playbackRate||1);let i=1;while(i<w.length-1&&t>w[i][0])i++;const[a,b]=[w[i-1],w[i]];return a[1]+(b[1]-a[1])*(t-a[0])/(b[0]-a[0]);})())));
 const actors=[...actorDoc.querySelectorAll('video[data-moss]')].filter(v=>v.checkVisibility({checkOpacity:true,checkVisibilityCSS:true}));
 await Promise.all(actors.map(v=>seekVideo(v,+v.dataset.at||.04)));
 await new Promise(ok=>requestAnimationFrame(()=>requestAnimationFrame(ok)));
 },{t,isFilm});if(page.errors.length)throw new Error(page.errors.join('\n'));}
const walkTimes=[2.8,4.3,5.8,6.9,8.9,10.9,11.5,12.4,13.9,14.9,16.2,17.1,18.5,19.7,20.8,22.5,23.9,25.7,28,30.6,33.5,36.5,39.9,41.8,43.7,45.7,47.4,48.6,50.35,50.9,51.4,51.9,53.5,54.9,55.4,56.3,57.45];
const oldFilmTimes=[1.8,5.6,9.1,12.8,13.6,14.2,15.6,16.8,17.2,18.6,19.7,20.3,21.7,22.2,23.8,25.3,27,29,31,33,35,37,39.4,40.7,42.2,45.2,47.6,50.2,53.5,54.6,56.8,59,60.8,62.2,63.5,64.2,64.7,65.8,67,67.7,68.5,69.3,70,73,76.5,80,85,90,94.8,97.5,100.2,101.5,102.9,103.3,103.9,104.5,104.8,105.1,105.5,105.7,106.3,107.2,108.6,110.5,111.1,113.4,115.8,117.6,119.4];
const filmTimes=[13.9,14,14.8,15.8,16.3,16.8,17.5,18.2,19,19.7,20.4,21.2,21.9,22,22.4,23.2,23.54,23.9,24.3,24.59,24.6,28.5,60.4,62.2,80,97.5,99.97,100,100.5,101.3,102.17,102.2,102.5,103.2,103.8,104.3,104.6,105,105.4,105.59,105.6,108.6,110.5,113.7,117.6,119.5];
// Every caption/label arrival (including LEAD), middle and HOLD exit, plus source pans.
const intervals=[[22.2,24.01],[24.9,28.08],[29.65,32.75],[33.07,37.07],[37.2,39.1],[39.2,40.6],[41.1,43.54],[47.5,50.66],[54.2,56.29],[59.45,62.48],[63.5,65.17],[65.4,68.173]];
const denseWalkTimes=[...new Set([...Array.from({length:95},(_,i)=>22+i*.5),...intervals.flatMap(([a,b])=>[a-.12,a+.05,(a+b)/2,b-.05,b+.2,b+.33]),...[8.325,10.275,13.15,15.45,17.65].map(x=>24.6+(x-5.5)/1.21875),40.7,47.6,50.2,69.35].filter(t=>t>=22&&t<69.4).map(t=>Math.round(t*1000)/1000))].sort((a,b)=>a-b);
async function board(page){const custom=args.find(a=>a.startsWith('--times='));const times=custom?custom.slice(8).split(',').map(Number):[1.8,5.6,9.1,13.5,16.8,20.5,24,25.5,28.5,31.5,34.4,35.5,37.4,39.5,41.8,43,45.2,48.2,51.7,54.5,56.5,58.5,60.5,61.5,66.5,72.5,76.8,79.8,82.5,83.8,85,86.5,88.3,89.4,90.5,91.2,92.5,93.3,94.3,95.2,96.1,97.5,99,100.4,100.8,102.3,104.8,106.4,109.9,113.7,116.8,118.5];
 const label=args.find(a=>a.startsWith('--label='))?.slice(8)||'film-source',dir=path.join(CACHE,label);fs.mkdirSync(dir,{recursive:true});for(let i=0;i<times.length;i++){await seek(page,times[i]);await page.screenshot({path:path.join(dir,`f${String(i).padStart(3,'0')}.jpg`),type:'jpeg',quality:96});}
 fs.writeFileSync(path.join(EVIDENCE,label+'-times.json'),JSON.stringify({kind:'native-source',dimensions:[3840,2160],times,files:times.map((t,i)=>`f${String(i).padStart(3,'0')}.jpg`)},null,2)+'\n');
 await execAsync('uv',['run','--quiet','--with','pillow','python',path.join(HERE,'tools/sheets.py'),dir,path.join(EVIDENCE,label),JSON.stringify(times)]);}
async function encodeSegment(browser,url,start,end,out){const page=await init(browser,url);const writer=spawn('ffmpeg',['-hide_banner','-loglevel','error','-nostdin','-y','-f','image2pipe','-framerate',String(FPS),'-vcodec','mjpeg','-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','16','-pix_fmt','yuv420p','-movflags','+faststart',out],{stdio:['pipe','ignore','pipe']});let err='';writer.stderr.on('data',x=>err+=x);const finished=once(writer,'close');for(let i=start;i<end;i++){await seek(page,i/FPS);const buf=await page.screenshot({type:'jpeg',quality:99});if(!writer.stdin.write(buf))await once(writer.stdin,'drain');if(i%120===0)console.log(`${isFilm?'film':'walk'} frame ${i}/${end}`);}writer.stdin.end();const[code]=await finished;if(code!==0)throw new Error(err);await page.close();}
async function finalExports(raw){
 const master=path.join(FILM,'renders/blended-moss-v6.mp4');await execAsync('ffmpeg',['-v','error','-y','-i',raw,'-i',MASTER,'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-movflags','+faststart','-metadata','comment=Earth imagery: NASA Earth Observatory (Black Marble 2016; Blue Marble: Next Generation). No endorsement implied.',master]);const delivery=path.join(FILM,'renders/blended-moss-v6-1080p.mp4'),pass=path.join(CACHE,'telegram-pass');
  const enc=['-vf','scale=1920:1080:flags=lanczos','-c:v','libx264','-preset','slow','-b:v','3000k','-maxrate','6500k','-bufsize','13000k','-pix_fmt','yuv420p','-passlogfile',pass];
  console.log('4K master complete; encoding 1080p delivery in two passes');
  await execAsync('ffmpeg',['-v','error','-y','-i',master,...enc,'-pass','1','-an','-f','mp4','/dev/null']);
  await execAsync('ffmpeg',['-v','error','-y','-i',master,...enc,'-pass','2','-c:a','copy','-movflags','+faststart','-metadata','comment=Earth imagery: NASA Earth Observatory (Black Marble 2016; Blue Marble: Next Generation). No endorsement implied.',delivery]);
}
async function main(){
 prepare();const{srv,url}=await serve();const browser=await PW.chromium.launch({executablePath:CHROME,headless:true,args:['--disable-background-networking','--disable-component-update','--no-first-run','--hide-scrollbars','--disable-gpu']});
 try{const link=url+'/film/index.html';const p=await init(browser,link);if(args.includes('--setup-frame')){await seek(p,24.6);await p.locator('iframe').screenshot({path:path.join(HERE,'assets/setup-first-v6.png')});console.log('Native V6 setup crossfade saved');await p.close();return;}await board(p);await p.close();console.log('V6 source probes ready');if(probeOnly)return;
 if(args.includes('--repair-slack')){
  // Replace the whole Slack keyframe interval so the repaired frames can be joined losslessly.
  const parts=['slack-base-0.mp4','slack-send-repair.mp4','slack-base-2.mp4'].map(name=>path.join(CACHE,name));
  const counts=[2370,250,968];
  await encodeSegment(browser,link,2370,2620,parts[1]);
  const base=path.join(CACHE,'full-picture-final-v6.mp4');
  await execAsync('ffmpeg',['-v','error','-y','-i',base,'-an','-c:v','copy','-avoid_negative_ts','disabled','-f','segment','-segment_times','79,87.333333','-reset_timestamps','1','-segment_format_options','movflags=+faststart:avoid_negative_ts=disabled',path.join(CACHE,'slack-base-%01d.mp4')]);
  for(let index=0;index<parts.length;index++){
   const frames=Number(execFileSync('ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=nb_frames','-of','default=nw=1:nk=1',parts[index]],{encoding:'utf8'}));
   if(frames!==counts[index])throw new Error(`Slack repair section ${index} has ${frames} frames. Expected ${counts[index]}.`);
  }
  const list=path.join(CACHE,'slack-repair-concat.txt');
  fs.writeFileSync(list,parts.map((file,index)=>`file '${file}'\nduration ${counts[index]/FPS}\n`).join(''));
  const raw=path.join(CACHE,'full-picture-slack-repair.mp4');
  await execAsync('ffmpeg',['-v','error','-y','-f','concat','-safe','0','-i',list,'-c','copy',raw]);
  await finalExports(raw);
  return;
 }
 if(args.includes('--repair-final')){
  const learned=path.join(CACHE,'repair-learned-v6.mp4'),ocean=path.join(CACHE,'repair-ocean-v6.mp4');
  await Promise.all([encodeSegment(browser,link,1050,1260,learned),encodeSegment(browser,link,2620,3000,ocean)]);
  const base=path.join(CACHE,'full-picture-native4k.mp4'),pattern=path.join(CACHE,'final-base-%01d.mp4');
  await execAsync('ffmpeg',['-v','error','-y','-i',base,'-an','-c:v','copy','-avoid_negative_ts','disabled','-f','segment','-segment_times','35,42,87.333333,100','-reset_timestamps','1','-segment_format_options','movflags=+faststart:avoid_negative_ts=disabled',pattern]);
  const parts=[path.join(CACHE,'final-base-0.mp4'),learned,path.join(CACHE,'final-base-2.mp4'),ocean,path.join(CACHE,'final-base-4.mp4')],counts=[1050,210,1360,380,588];
  for(let i=0;i<parts.length;i++){const n=Number(execFileSync('ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=nb_frames','-of','default=nw=1:nk=1',parts[i]],{encoding:'utf8'}));if(n!==counts[i])throw new Error('Repair segment count '+n+' != '+counts[i]);}
  const list=path.join(CACHE,'final-repair-concat.txt');fs.writeFileSync(list,parts.map((p,i)=>`file '${p}'\nduration ${counts[i]/30}`).join('\n')+'\n');
  const raw=path.join(CACHE,'full-picture-final-v6.mp4');await execAsync('ffmpeg',['-v','error','-y','-f','concat','-safe','0','-i',list,'-c','copy',raw]);await finalExports(raw);
  fs.writeFileSync(path.join(EVIDENCE,'assembly.json'),JSON.stringify({mode:'native4K with two accepted visual repairs',frames:3588,seconds:119.6,segments:parts.map((p,i)=>({file:path.basename(p),frames:counts[i]})),retainedFrames:2998,recapturedLearned:210,recapturedSlackBridgeAndOcean:380,note:'Only35–42 and87⅓–100 recaptured; all other compressed picture retained, including native4K Earth. Actual original felt paw; no extra limb.'},null,2)+'\n');console.log('Final two-repair exports complete');return;
 }
 if(args.includes('--replace-ending')){
  const ending=path.join(CACHE,'ending-native4k-corrected.mp4');await encodeSegment(browser,link,3250,3588,ending);
  const prior=path.join(CACHE,'full-picture.mp4'),prefix=path.join(CACHE,'exact-prefix-0.mp4');
  await execAsync('ffmpeg',['-v','error','-y','-i',prior,'-an','-c:v','copy','-avoid_negative_ts','disabled','-f','segment','-segment_times','108.333333','-reset_timestamps','1','-segment_format_options','movflags=+faststart:avoid_negative_ts=disabled',path.join(CACHE,'exact-prefix-%01d.mp4')]);
  let count=Number(execFileSync('ffprobe',['-v','error','-select_streams','v:0','-count_frames','-show_entries','stream=nb_read_frames','-of','default=nw=1:nk=1',prefix],{encoding:'utf8'}));
  if(count!==3250)throw new Error('Exact closed-GOP prefix expected3250 frames; got'+count);
  const list=path.join(CACHE,'native-ending-concat.txt');fs.writeFileSync(list,`file '${prefix}'\nduration 108.333333333333\nfile '${ending}'\n`);
  const raw=path.join(CACHE,'full-picture-native4k.mp4');await execAsync('ffmpeg',['-v','error','-y','-f','concat','-safe','0','-i',list,'-c','copy',raw]);await finalExports(raw);
  fs.writeFileSync(path.join(EVIDENCE,'assembly.json'),JSON.stringify({mode:'full with native4K Earth segment recapture',frames:3588,seconds:119.6,prefixFrames:3250,bridgeFrames:80,endingFrames:258,note:'Earlier movies intact; corrected Earth has3840×2160 internal scene/work targets as well as canvas backing.'},null,2)+'\n');console.log('Corrected native4K ending exports complete');return;
 }
 const rangeArg=args.find(x=>x.startsWith('--range='));
 if(rangeArg){const [a,b]=rangeArg.slice(8).split(',').map(Number),raw=path.join(CACHE,'preview-picture.mp4');await encodeSegment(browser,link,Math.round(a*FPS),Math.round(b*FPS),raw);await execAsync('ffmpeg',['-v','error','-y','-i',raw,'-ss',String(a),'-t',String(b-a),'-i',MASTER,'-map','0:v:0','-map','1:a:0','-vf','scale=1920:1080:flags=lanczos','-c:v','libx264','-preset','fast','-crf','20','-c:a','aac','-b:a','192k','-movflags','+faststart',path.join(EVIDENCE,`preview-${a}-${b}.mp4`)]);return;}
 {
  const parts=[path.join(CACHE,'full-first.mp4'),path.join(CACHE,'full-second.mp4')];await Promise.all([encodeSegment(browser,link,0,1794,parts[0]),encodeSegment(browser,link,1794,3588,parts[1])]);
  const list=path.join(CACHE,'full-concat.txt');fs.writeFileSync(list,parts.map(p=>`file '${p}'`).join('\n')+'\n');const raw=path.join(CACHE,'full-picture.mp4');await execAsync('ffmpeg',['-v','error','-y','-f','concat','-safe','0','-i',list,'-c','copy',raw]);
  await finalExports(raw);
  fs.writeFileSync(path.join(EVIDENCE,'assembly.json'),JSON.stringify({mode:'full',frames:3588,seconds:119.6,note:'V6 deterministic full render. Earlier movie files remain intact; exact compressed/decoded picture identity is not claimed.'},null,2)+'\n');
 }
 console.log('V6 complete exports ready');
 }finally{await browser.close();srv.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
