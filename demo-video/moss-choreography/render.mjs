#!/usr/bin/env node
// Versioned native 4K patch renderer, based on the delivered Moss v6 master.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
import {once} from 'node:events';
import {build} from '../film/build.mjs';
const HERE=path.dirname(fileURLToPath(import.meta.url)),DEMO=path.dirname(HERE),CACHE=path.join(HERE,'.build',process.env.MOSS_V7_LANE||'.'),EVIDENCE=path.join(HERE,'evidence');
const FILM=path.join(DEMO,'film'),UI=path.join(DEMO,'ui-concepts'),FPS=30;
const MASTER=path.join(FILM,'renders/blended-moss-v6.mp4');
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
let PW;try{PW=createRequire(import.meta.url)('playwright');}catch{PW=createRequire(path.join(process.env.CODEX_NODE_MODULES||path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'),'package.json'))('playwright');}
for(const p of [CACHE,EVIDENCE,path.join(UI,'renders'),path.join(FILM,'renders')])fs.mkdirSync(p,{recursive:true});
const args=process.argv.slice(2),isFilm=true,liveWalk=true;
const project=path.join(CACHE,isFilm?'film':'walk');
function prepare(){build({cut:'blended-moss-v7',out:project});prepareWalk(path.join(CACHE,'walk'));}
function prepareWalk(out){
 fs.mkdirSync(out,{recursive:true});fs.cpSync(path.join(UI,'shared'),path.join(out,'shared'),{recursive:true});fs.cpSync(path.join(UI,'moss-v6'),path.join(out,'scene'),{recursive:true});
 fs.cpSync(path.join(HERE,'walk'),path.join(out,'scene'),{recursive:true});
 const c=JSON.parse(fs.readFileSync(path.join(FILM,'cuts/blended-moss-v7/cut.json')));const to=path.join(out,'scene/moss-assets');fs.mkdirSync(to,{recursive:true});for(const x of c.copies)if(x.to.includes('moss-assets/'))fs.copyFileSync(path.resolve(FILM,'cuts/blended-moss-v7',x.from),path.join(to,path.basename(x.to)));
 const meta=JSON.parse(fs.readFileSync(path.join(UI,'moss-v6/concept.json')));meta.framing=false;fs.writeFileSync(path.join(out,'concept-meta.js'),'export default '+JSON.stringify(meta)+';\n');
 fs.writeFileSync(path.join(out,'index.html'),fs.readFileSync(path.join(UI,'shared/index.template.html'),'utf8').replaceAll('{{TITLE}}','Moss V7 native source').replace('{{SECONDS}}',String(meta.seconds)).replace('{{SCENE_CSS}}','<link rel="stylesheet" href="scene/style.css"/>'));
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
 if(liveWalk){const slots=JSON.parse(fs.readFileSync(path.join(FILM,'cuts/blended-moss-v7/shots.json'),'utf8')).slots.filter(s=>s.id.startsWith('walk-')&&s.kind==='ai');await page.evaluate(({url,slots})=>{const f=document.createElement('iframe');f.src=url;f.style.cssText='position:absolute;inset:0;width:1920px;height:1080px;border:0;background:#f4f3eb;display:block';document.getElementById('shots').appendChild(f);window.__liveWalk={frame:f,slots};},{url:new URL('../walk/index.html',url).href,slots});await page.waitForFunction(()=>window.__liveWalk.frame.contentWindow.__concept,{timeout:60000});await page.evaluate(()=>window.__liveWalk.frame.style.display='none');}
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
async function board(page){const custom=args.find(a=>a.startsWith('--times='));const times=custom?custom.slice(8).split(',').map(Number):[1.8,5.6,9.1,13.5,16.8,20.5,24,25.5,28.5,31.5,34.4,35.5,37.4,39.5,41.8,43,45.2,48.2,51.7,54.5,56.5,58.5,60.5,61.5,66.5,72.5,76.8,79.8,82.5,83.8,85,86.5,88.3,89.4,90.5,91.2,92.5,93.3,94.3,95.2,96.1,97.5,99,100.4,100.8,102.3,104.8,106.4,109.9,113.7,116.8,118.5];
 const label=args.find(a=>a.startsWith('--label='))?.slice(8)||'film-source',dir=path.join(CACHE,label);fs.mkdirSync(dir,{recursive:true});for(let i=0;i<times.length;i++){await seek(page,times[i]);await page.screenshot({path:path.join(dir,`f${String(i).padStart(3,'0')}.jpg`),type:'jpeg',quality:96});}
 fs.writeFileSync(path.join(EVIDENCE,label+'-times.json'),JSON.stringify({kind:'native-source',dimensions:[3840,2160],times,files:times.map((t,i)=>`f${String(i).padStart(3,'0')}.jpg`)},null,2)+'\n');
 await execAsync('uv',['run','--quiet','--with','pillow','python',path.join(DEMO,'moss-clarity/tools/sheets.py'),dir,path.join(EVIDENCE,label),JSON.stringify(times)]);}
async function encodeSegment(browser,url,start,end,out){const page=await init(browser,url);const writer=spawn('ffmpeg',['-hide_banner','-loglevel','error','-nostdin','-y','-f','image2pipe','-framerate',String(FPS),'-vcodec','mjpeg','-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','16','-pix_fmt','yuv420p','-movflags','+faststart',out],{stdio:['pipe','ignore','pipe']});let err='';writer.stderr.on('data',x=>err+=x);const finished=once(writer,'close');for(let i=start;i<end;i++){await seek(page,i/FPS);const buf=await page.screenshot({type:'jpeg',quality:99});if(!writer.stdin.write(buf))await once(writer.stdin,'drain');if(i%120===0)console.log(`${isFilm?'film':'walk'} frame ${i}/${end}`);}writer.stdin.end();const[code]=await finished;if(code!==0)throw new Error(err);await page.close();}
async function finalExports(raw){
 const master=path.join(FILM,'renders/blended-moss-v7.mp4');await execAsync('ffmpeg',['-v','error','-y','-i',raw,'-i',MASTER,'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','copy','-movflags','+faststart','-metadata','comment=Earth imagery: NASA Earth Observatory (Black Marble 2016; Blue Marble: Next Generation). No endorsement implied.',master]);const delivery=path.join(FILM,'renders/blended-moss-v7-1080p.mp4'),pass=path.join(CACHE,'telegram-pass');
  const enc=['-vf','scale=1920:1080:flags=lanczos','-c:v','libx264','-preset','slow','-b:v','3000k','-maxrate','6500k','-bufsize','13000k','-pix_fmt','yuv420p','-passlogfile',pass];
  console.log('4K master complete; encoding 1080p delivery in two passes');
  await execAsync('ffmpeg',['-v','error','-y','-i',master,...enc,'-pass','1','-an','-f','mp4','/dev/null']);
  await execAsync('ffmpeg',['-v','error','-y','-i',master,...enc,'-pass','2','-c:a','copy','-movflags','+faststart','-metadata','comment=Earth imagery: NASA Earth Observatory (Black Marble 2016; Blue Marble: Next Generation). No endorsement implied.',delivery]);
}

// Frame boundaries are existing V6 IDRs. Intermediate divisions let independent
// source viewports capture shorter spans without additional lossy movie encodes.
const ranges=[[694,1260],[1260,1779],[2620,3000],[3000,3330]];
const part=([a,b])=>path.join(HERE,'.build',`v7-${a}-${b}.mp4`);
async function assemble(){
 const pattern=path.join(CACHE,'v6-%01d.mp4');
 await execAsync('ffmpeg',['-v','error','-y','-i',MASTER,'-an','-c:v','copy','-avoid_negative_ts','disabled','-f','segment','-segment_times','23.133333,59.3,87.333333,111','-reset_timestamps','1','-segment_format_options','movflags=+faststart:avoid_negative_ts=disabled',pattern]);
 const base=i=>pattern.replace('%01d',String(i));
 const pieces=[[base(0),694],[part(ranges[0]),566],[part(ranges[1]),519],[base(2),841],[part(ranges[2]),380],[part(ranges[3]),330],[base(4),258]];
 for(const [file,n] of pieces){const frames=Number(execFileSync('ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=nb_frames','-of','default=nw=1:nk=1',file]));if(frames!==n)throw new Error(file+' has '+frames+' frames; expected '+n);}
 const list=path.join(CACHE,'assembly.txt');fs.writeFileSync(list,pieces.map(([f,n])=>`file '${f}'\nduration ${n/FPS}\n`).join(''));
 const raw=path.join(CACHE,'v7-picture.mp4');await execAsync('ffmpeg',['-v','error','-y','-f','concat','-safe','0','-i',list,'-c:v','copy',raw]);await finalExports(raw);
}
async function main(){
 if(args.includes('--assemble'))return assemble();
 prepare();const {srv,url}=await serve();const browser=await PW.chromium.launch({executablePath:CHROME,headless:true,args:['--disable-background-networking','--disable-component-update','--no-first-run','--hide-scrollbars','--disable-gpu']});
 try{
  const link=url+'/film/index.html';
  if(args.includes('--probe')){const page=await init(browser,link);await board(page);return;}
  const selected=args.find(s=>s.startsWith('--parts='));
  const queue=selected?selected.slice(8).split(',').map(i=>ranges[Number(i)]):ranges.slice();
  for(let i=0;i<queue.length;i+=2)await Promise.all(queue.slice(i,i+2).map(r=>encodeSegment(browser,link,...r,part(r))));
  if(!selected)await assemble();
 }finally{await browser.close();srv.close();}
}
main().catch(e=>{console.error(e);process.exitCode=1;});
