#!/usr/bin/env node
// Public-only Moss full film. Frame capture explicitly waits for every scene and alpha-video
// seek. The original soundtrack is stream-copied; paid providers are never invoked here.
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
const MASTER=path.join(FILM,'renders/blended-tag-v2.mp4');
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
let PW;try{PW=createRequire(import.meta.url)('playwright');}catch{PW=createRequire(path.join(process.env.CODEX_NODE_MODULES||path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules'),'package.json'))('playwright');}
for(const p of [CACHE,EVIDENCE,path.join(UI,'renders'),path.join(FILM,'renders')])fs.mkdirSync(p,{recursive:true});
const args=process.argv.slice(2),isFilm=args.includes('--film'),probeOnly=args.includes('--probe');
const project=path.join(CACHE,isFilm?'film':'walk');
function assets(to){fs.mkdirSync(to,{recursive:true});for(const [name,file] of [['wave.webm',path.join(DEMO,'mascot-exploration-v2/motion/25-moss.webm')],['avatar.png',path.join(DEMO,'mascot-exploration-v2/avatars/25-moss.png')],['attentive.webm',path.join(HERE,'assets/moss-attentive.webm')],['present.webm',path.join(HERE,'assets/moss-present.webm')]])fs.copyFileSync(file,path.join(to,name));}
function prepare(){
 if(isFilm){build({cut:'blended-moss-v1',out:project});return;}
 fs.mkdirSync(project,{recursive:true});fs.cpSync(path.join(UI,'shared'),path.join(project,'shared'),{recursive:true});fs.cpSync(path.join(UI,'moss'),path.join(project,'scene'),{recursive:true});assets(path.join(project,'scene/moss-assets'));
 const meta=JSON.parse(fs.readFileSync(path.join(UI,'moss/concept.json'),'utf8'));meta.framing=false;
 fs.writeFileSync(path.join(project,'concept-meta.js'),'export default '+JSON.stringify(meta)+';\n');
 fs.writeFileSync(path.join(project,'index.html'),fs.readFileSync(path.join(UI,'shared/index.template.html'),'utf8').replaceAll('{{TITLE}}','Moss walkthrough').replace('{{SECONDS}}',String(meta.seconds)).replace('{{SCENE_CSS}}','<link rel="stylesheet" href="scene/style.css"/>'));
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
async function init(browser,url){const page=await browser.newPage({viewport:{width:1920,height:1080},deviceScaleFactor:1});page.errors=[];page.on('pageerror',e=>page.errors.push(e.message));page.on('console',m=>{if(m.type()==='error')page.errors.push(m.text());});await page.goto(url,{waitUntil:'load'});await page.waitForFunction(mode=>mode?window.__film:window.__concept,isFilm,{timeout:60000});return page;}
async function seek(page,t){await page.evaluate(async ({t,isFilm})=>{
 window.__mascotTime=t;if(isFilm)window.__film.renderAt(t);else await window.__concept.renderAt(t);
 const seekVideo=async(v,at)=>{if(v.readyState<1)await new Promise((ok,fail)=>{v.addEventListener('loadedmetadata',ok,{once:true});v.addEventListener('error',()=>fail(new Error('Video load '+v.src)),{once:true});v.load();});at=Math.max(0,Math.min(v.duration-.01,at));if(Math.abs(v.currentTime-at)>0.00001)await new Promise((ok,fail)=>{const timeout=setTimeout(()=>fail(new Error('Video seek timeout '+v.src)),15000);v.addEventListener('seeked',()=>{clearTimeout(timeout);ok();},{once:true});v.currentTime=at;});};
 const clips=[...document.querySelectorAll('video[data-start]')].filter(v=>t>=+v.dataset.start&&t<+v.dataset.start+(+v.dataset.duration));
 await Promise.all(clips.map(v=>seekVideo(v,Number(v.dataset.mediaStart)+(t-Number(v.dataset.start))*Number(v.dataset.playbackRate||1))));
 const actors=[...document.querySelectorAll('video[data-moss]')].filter(v=>v.checkVisibility({checkOpacity:true,checkVisibilityCSS:true}));
 await Promise.all(actors.map(v=>seekVideo(v,+v.dataset.at||.04)));
 },{t,isFilm});if(page.errors.length)throw new Error(page.errors.join('\n'));}
const walkTimes=[2.8,4.3,5.8,6.9,8.9,10.9,11.5,12.4,13.9,14.9,16.2,17.1,18.5,19.7,20.8,22.5,23.9,25.7,28,30.6,33.5,36.5,39.9,41.8,43.7,45.7,47.4,48.6,50.35,50.9,51.4,51.9,53.5,54.9,55.4,56.3,57.45];
const filmTimes=[1.8,5.6,9.1,12.8,13.6,14.2,15.6,16.8,17.2,18.6,19.7,20.3,21.7,22.2,23.8,25.3,27,29,31,33,35,37,39.4,40.7,42.2,45.2,47.6,50.2,53.5,54.6,56.8,59,60.8,62.2,63.5,64.2,64.7,65.8,67,67.7,68.5,69.3,70,73,76.5,80,85,90,94.8,97.5,100.2,101.5,102.9,103.3,103.9,104.5,104.8,105.1,105.5,105.7,106.3,107.2,108.6,110.5,111.1,113.4,115.8,117.6,119.4];
async function board(page){const times=isFilm?filmTimes:walkTimes,dir=path.join(CACHE,isFilm?'film-probes':'walk-probes');fs.mkdirSync(dir,{recursive:true});for(let i=0;i<times.length;i++){await seek(page,times[i]);await page.screenshot({path:path.join(dir,`f${String(i).padStart(3,'0')}.jpg`),type:'jpeg',quality:92});}
 const data={kind:isFilm?'film-source':'walk-source',times,files:times.map((t,i)=>`f${String(i).padStart(3,'0')}.jpg`)};fs.writeFileSync(path.join(EVIDENCE,isFilm?'film-source-times.json':'walk-source-times.json'),JSON.stringify(data,null,2)+'\n');
 await execAsync('uv',['run','--quiet','--with','pillow','python',path.join(HERE,'tools/sheets.py'),dir,path.join(EVIDENCE,isFilm?'film-source':'walk-source'),JSON.stringify(times)]);}
async function encodeSegment(browser,url,start,end,out){const page=await init(browser,url);const writer=spawn('ffmpeg',['-hide_banner','-loglevel','error','-nostdin','-y','-f','image2pipe','-framerate',String(FPS),'-vcodec','mjpeg','-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',out],{stdio:['pipe','ignore','pipe']});let err='';writer.stderr.on('data',x=>err+=x);const finished=once(writer,'close');for(let i=start;i<end;i++){await seek(page,i/FPS);const buf=await page.screenshot({type:'jpeg',quality:96});if(!writer.stdin.write(buf))await once(writer.stdin,'drain');if(i%300===0)console.log(`${isFilm?'film':'walk'} frame ${i}/${end}`);}writer.stdin.end();const[code]=await finished;if(code!==0)throw new Error(err);await page.close();}
async function main(){prepare();const{srv,url}=await serve();const browser=await PW.chromium.launch({executablePath:CHROME,headless:true,args:['--disable-background-networking','--disable-component-update','--no-first-run','--hide-scrollbars']});try{const link=url+`/${isFilm?'film':'walk'}/index.html`;const p=await init(browser,link);await board(p);await p.close();console.log('source probes ready');if(probeOnly)return;
 const patch=args.includes('--patch-dormant');
 const frames=isFilm?3588:1740,mid=Math.floor(frames/2);const parts=[path.join(CACHE,(isFilm?'film':'walk')+'-part1.mp4'),path.join(CACHE,(isFilm?'film':'walk')+'-part2.mp4')];
 const raw=path.join(CACHE,(isFilm?'film':'walk')+'-picture.mp4');
 if(patch){
  if(!isFilm||!fs.existsSync(raw))throw new Error('--patch-dormant requires an existing full film picture');
  // Only p.eyes<1 changes pixels. These ranges completely cover all such film states.
  const spans=[[318,420],[3129,3192]],patches=spans.map((_,i)=>path.join(CACHE,'dormant-'+i+'.mp4'));
  await Promise.all(spans.map(([a,b],i)=>encodeSegment(browser,link,a,b,patches[i])));
  const changed=path.join(CACHE,'film-picture-patched.mp4');
  const fc='[0:v]trim=start_frame=0:end_frame=318,setpts=PTS-STARTPTS[v0];[1:v]setpts=PTS-STARTPTS[v1];[0:v]trim=start_frame=420:end_frame=3129,setpts=PTS-STARTPTS[v2];[2:v]setpts=PTS-STARTPTS[v3];[0:v]trim=start_frame=3192:end_frame=3588,setpts=PTS-STARTPTS[v4];[v0][v1][v2][v3][v4]concat=n=5:v=1:a=0[v]';
  await execAsync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',raw,'-i',patches[0],'-i',patches[1],'-filter_complex',fc,'-map','[v]','-c:v','libx264','-preset','fast','-crf','0','-pix_fmt','yuv420p','-r','30','-an',changed]);
  fs.renameSync(raw,path.join(CACHE,'film-picture-before-dormant.mp4'));fs.renameSync(changed,raw);
  fs.writeFileSync(path.join(EVIDENCE,'dormant-patch.json'),JSON.stringify({frame_ranges:spans,reason:'Respect original eye/wake/fold state keys with the same Moss avatar; body unchanged wherever eyes>=1',assembly:'Lossless intermediate; unaffected captured frames retained; full fresh render remains the default'},null,2)+'\n');
 }else{
  await Promise.all([args.includes('--reuse-first')&&fs.existsSync(parts[0])?Promise.resolve():encodeSegment(browser,link,0,mid,parts[0]),encodeSegment(browser,link,mid,frames,parts[1])]);
  const list=path.join(CACHE,(isFilm?'film':'walk')+'-concat.txt');fs.writeFileSync(list,parts.map(p=>`file '${p}'`).join('\n')+'\n');await execAsync('ffmpeg',['-hide_banner','-loglevel','error','-y','-f','concat','-safe','0','-i',list,'-c','copy',raw]);
 }

 if(isFilm){const master=path.join(FILM,'renders/blended-moss-v1.mp4');await execAsync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',raw,'-i',MASTER,'-map','0:v:0','-map','1:a:0','-c:v','libx264','-preset','slow','-crf','22','-c:a','copy','-movflags','+faststart',master]);await execAsync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',master,'-vf','scale=1280:720','-c:v','libx264','-preset','slow','-crf','23','-c:a','copy','-movflags','+faststart',path.join(FILM,'renders/blended-moss-v1-720p.mp4')]);}
 else{const walk=path.join(UI,'renders/moss-clean-v1.mp4');fs.copyFileSync(raw,walk);await execAsync('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss','2.8','-to','57.5','-i',walk,'-vf','scale=1280:720','-c:v','libx264','-crf','23','-an','-movflags','+faststart',path.join(EVIDENCE,'moss-walkthrough-preview.mp4')]);}
 console.log(isFilm?'full film exports ready':'full walkthrough ready');
 }finally{await browser.close();srv.close();}}
main().catch(e=>{console.error(e);process.exitCode=1;});
