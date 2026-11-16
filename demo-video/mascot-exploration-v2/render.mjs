#!/usr/bin/env node
// Additive mascot study. Rebuilds PUBLIC Tag v2 source in a disposable cache, changes only
// the three mascot surfaces (rig, avatar, mark), and captures the same timed source scenes.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import os from 'node:os';
import {fileURLToPath} from 'node:url';
import {createRequire} from 'node:module';
import {spawn,execFileSync} from 'node:child_process';
import {once} from 'node:events';
import {build} from '../film/build.mjs';

const HERE=path.dirname(fileURLToPath(import.meta.url));
const ROOT=path.resolve(HERE,'../..');
const FILM=path.resolve(HERE,'../film');
const CACHE=path.join(HERE,'.build');
const PROJECT=path.join(CACHE,'film');
const OUT=path.join(HERE,'renders');
const CHROME='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const metadata=JSON.parse(fs.readFileSync(path.join(HERE,'render-metadata.json'),'utf8'));
const concepts=JSON.parse(fs.readFileSync(path.join(HERE,'concepts.json'),'utf8'));
// 23.3 s, same samples for each option. Time is in the approved movie, never retimed.
export const spans=[{name:'Character',kind:'intro',from:0,length:3},
 {name:'Out of the phone',kind:'film',from:14,length:6},
 {name:'In the meeting',kind:'film',from:76.5,length:5},
 {name:'Your morning brief',kind:'film',from:105.6,length:5.4},
 {name:'The closing mark',kind:'film',from:115.7,length:3.9}];
const seconds=spans.reduce((s,x)=>s+x.length,0),FPS=30;
fs.mkdirSync(OUT,{recursive:true});fs.mkdirSync(CACHE,{recursive:true});
let PW;
try{PW=createRequire(import.meta.url)('playwright');}catch{
 const base=process.env.CODEX_NODE_MODULES||path.join(os.homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
 PW=createRequire(path.join(base,'package.json'))('playwright');
}
function prepare(){
 if(!fs.existsSync(path.join(PROJECT,'index.html')))build({cut:'blended-tag-v2',out:PROJECT});
 fs.copyFileSync(path.join(HERE,'mascots.js'),path.join(PROJECT,'src/mascot/tag/mascot.js'));
 const data=`export default ${JSON.stringify(metadata)};`;
 fs.writeFileSync(path.join(PROJECT,'src/mascot/tag/render-data.js'),data);
 fs.writeFileSync(path.join(CACHE,'render-data.js'),data);
 fs.copyFileSync(path.join(HERE,'mascots.js'),path.join(CACHE,'mascots.js'));
 fs.writeFileSync(path.join(PROJECT,'src/mark.js'),`import {iconSvg} from './mascot/tag/mascot.js';export function markSvg({size=96}={}){return iconSvg(undefined,size);}`);
 const dataPath=path.join(PROJECT,'film-data.js');
 let dataText=fs.readFileSync(dataPath,'utf8');
 if(!dataText.includes('// generated mascot variant')){
  dataText=dataText.replace('export default ','const data = ')+`\n// generated mascot variant\nconst names=${JSON.stringify(metadata)};const c=names[new URLSearchParams(location.search).get('mascot')||'moss'];function replace(v){if(typeof v==='string')return v.replaceAll('assets/screens/peer-face-tag.png','/art/avatars/'+c.stem+'.png');if(Array.isArray(v))return v.map(replace);if(v&&typeof v==='object')return Object.fromEntries(Object.entries(v).map(([k,x])=>[k,replace(x)]));return v;}export default replace(data);\n`;
  fs.writeFileSync(dataPath,dataText);
 }
 fs.mkdirSync(path.join(CACHE,'art'),{recursive:true});
 for(const dir of ['avatars','cutouts','motion']){const target=path.join(CACHE,'art',dir);if(!fs.existsSync(target))fs.symlinkSync(path.join(HERE,dir),target,'dir');}
 fs.copyFileSync(path.join(FILM,'assets/fonts/Manrope.ttf'),path.join(CACHE,'Manrope.ttf'));
 fs.writeFileSync(path.join(CACHE,'beauty.html'),`<!doctype html><meta charset="utf-8"><style>@font-face{font-family:Manrope;src:url(Manrope.ttf);font-weight:200 800}*{box-sizing:border-box}html,body{margin:0;width:1920px;height:1080px;overflow:hidden;font-family:Manrope,Arial,sans-serif;color:#173f30;background:#f3f0e4}body{background:radial-gradient(ellipse at 72% 43%,#fffdf3 0,#f1efdf 58%,#e3e7d5 100%)}.bar{position:absolute;left:100px;right:100px;top:72px;display:flex;justify-content:space-between;font-size:18px;font-weight:700;letter-spacing:3px;text-transform:uppercase;color:#65816a}.copy{position:absolute;left:120px;top:285px;width:710px}.num{font-size:25px;color:#6b8b70;letter-spacing:3px;font-weight:600}.name{font-family:Georgia,serif;font-weight:400;font-size:112px;letter-spacing:-4px;margin:18px 0 30px;line-height:1}.line{font-size:33px;line-height:1.4;max-width:650px;font-weight:500}.idea{font-size:20px;line-height:1.65;color:#5f7260;max-width:590px;margin-top:25px}.foot{position:absolute;left:120px;bottom:83px;font-size:19px;color:#5f7260}.mark{position:absolute;right:154px;bottom:80px;display:flex;align-items:center;gap:18px;color:#42654f;font-size:17px}.oval{position:absolute;left:985px;top:180px;width:700px;height:670px;border:1px solid #bbc9ac;border-radius:50%;opacity:.55}</style><div class="bar"><span>ROUND 2 · AI Peer</span><span>Generated character exploration</span></div><div class="oval"></div><div class="copy"><div class="num" id="num"></div><h1 class="name" id="name"></h1><div class="line" id="line"></div><div class="idea" id="idea"></div></div><svg id="hero" width="1920" height="1080"></svg><div class="foot">The same story. A new companion.</div><div class="mark" id="mark"></div><script type="module">import{buildTag,iconSvg}from './mascots.js';const concepts=${JSON.stringify(concepts)};const meta=${JSON.stringify(metadata)};const id=new URLSearchParams(location.search).get('mascot')||'moss';const c=concepts.find(x=>x.id===id);num.textContent=String(c.number).padStart(2,'0')+' / 25';document.getElementById('name').textContent=c.name;line.textContent=c.line;idea.textContent=meta[id].motion?'Original Gemini artwork · Generated character acting':'Original Gemini artwork · Gentle composed movement';mark.innerHTML=iconSvg(id,64)+'<span>AI Peer · App icon</span>';const actor=buildTag(hero);await document.fonts.ready;window.draw=t=>{window.__mascotTime=t;actor.draw({x:1335,y:813,s:3.24,label:false,shadow:.6})};window.draw(0);window.ready=true;</script>`);
}
function server(){return new Promise(resolve=>{const srv=http.createServer((req,res)=>{if(req.url==='/favicon.ico'){res.writeHead(204).end();return;}
 let decoded;try{decoded=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
 const file=path.resolve(CACHE,'.'+decoded);if(!file.startsWith(CACHE+path.sep)){res.writeHead(403).end();return;}
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404).end();return;}
 const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.mp4':'video/mp4','.webm':'video/webm','.ttf':'font/ttf'};
 const size=fs.statSync(file).size,range=req.headers.range;res.setHeader('Content-Type',types[path.extname(file)]||'application/octet-stream');res.setHeader('Cache-Control','no-store');res.setHeader('Accept-Ranges','bytes');
 if(range){const m=range.match(/bytes=(\d+)-(\d*)/);if(!m){res.writeHead(416).end();return;}const start=Number(m[1]),end=m[2]?Math.min(size-1,Number(m[2])):size-1;res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':end-start+1});fs.createReadStream(file,{start,end}).pipe(res);}else{res.setHeader('Content-Length',size);fs.createReadStream(file).pipe(res);}
 });srv.listen(0,'127.0.0.1',()=>resolve({srv,url:`http://127.0.0.1:${srv.address().port}`}));});}
async function initPage(browser,url,viewport={width:1920,height:1080}){
 const page=await browser.newPage({viewport,deviceScaleFactor:1});const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',msg=>{if(msg.type()==='error')errors.push(msg.text());});page.__errors=errors;
 await page.goto(url,{waitUntil:'load'});return page;
}
async function seekMascots(page,t){await page.evaluate(async t=>{
 const all=[...document.querySelectorAll('video[data-mascot]')];
 await Promise.all(all.filter(v=>v.checkVisibility({checkOpacity:true,checkVisibilityCSS:true})).map(async v=>{
 if(v.readyState<1)await new Promise((ok,fail)=>{v.addEventListener('loadedmetadata',ok,{once:true});v.addEventListener('error',()=>fail(new Error('Sprite load failed '+v.src)),{once:true});v.load();});
 const start=Number(v.dataset.motionStart||0),end=Math.min(v.duration-.05,Number(v.dataset.motionEnd||4.9)),length=end-start,phase=t%(2*length),at=start+(phase<=length?phase:2*length-phase);
 if(Math.abs(v.currentTime-at)>.00001)await new Promise((ok,fail)=>{const timer=setTimeout(()=>fail(new Error('Sprite seek timeout '+v.src)),15000);v.addEventListener('seeked',()=>{clearTimeout(timer);ok();},{once:true});v.currentTime=at;});
 }));
 },t);}
async function seekFilm(page,t){await page.evaluate(async t=>{
 window.__mascotTime=t;window.__film.renderAt(t);
 const clips=[...document.querySelectorAll('video[data-start]')].filter(v=>t>=Number(v.dataset.start)&&t<Number(v.dataset.start)+Number(v.dataset.duration));
 await Promise.all(clips.map(async v=>{
 if(v.readyState<1)await new Promise((ok,fail)=>{v.addEventListener('loadedmetadata',ok,{once:true});v.addEventListener('error',()=>fail(new Error('Video cannot load '+v.src)),{once:true});v.load();});
 const at=Math.max(0,Math.min(v.duration-.001,Number(v.dataset.mediaStart)+(t-Number(v.dataset.start))*Number(v.dataset.playbackRate||1)));
 if(Math.abs(v.currentTime-at)>.00001)await new Promise((ok,fail)=>{const timer=setTimeout(()=>fail(new Error('Video seek timeout '+v.src+' at '+at)),15000);v.addEventListener('seeked',()=>{clearTimeout(timer);ok();},{once:true});v.currentTime=at;});
 }));
 },t);await seekMascots(page,t);}
function checkPage(page){if(page.__errors.length)throw new Error(page.__errors.join('\n'));}
async function execAsync(command,args){
 const child=spawn(command,args,{stdio:['ignore','ignore','pipe']});let error='';child.stderr.on('data',x=>error+=x);const [code]=await once(child,'close');if(code!==0)throw new Error(command+' failed: '+error);
}
async function muxAudio(video,out){
 const a=path.join(FILM,'renders/blended-tag-v2.mp4');
 const parts=spans.map((s,i)=>s.kind==='intro'?`anullsrc=r=48000:cl=stereo,atrim=duration=${s.length},asetpts=PTS-STARTPTS[a${i}]`:`[1:a]atrim=start=${s.from}:duration=${s.length},asetpts=PTS-STARTPTS[a${i}]`);
 const filter=parts.join(';')+';'+spans.map((_,i)=>`[a${i}]`).join('')+`concat=n=${spans.length}:v=0:a=1[a]`;
 await execAsync('ffmpeg',['-hide_banner','-loglevel','error','-nostdin','-y','-i',video,'-i',a,'-filter_complex',filter,'-map','0:v','-map','[a]','-c:v','libx264','-preset','slow','-crf','25','-pix_fmt','yuv420p','-c:a','aac','-b:a','192k','-movflags','+faststart',out]);
}
async function run(){
 prepare();const {srv,url}=await server();const browser=await PW.chromium.launch({executablePath:CHROME,headless:true,args:['--disable-background-networking','--disable-component-update','--no-first-run','--hide-scrollbars']});
 try{
 const args=process.argv.slice(2);
 const ids=(args.includes('--all')?concepts.map(c=>c.id):args.filter(x=>!x.startsWith('--'))).filter(id=>!args.includes('--skip-existing')||!fs.existsSync(path.join(OUT,metadata[id].stem+'.mp4')));
 async function renderOne(id){const c=concepts.find(c=>c.id===id);if(!c)throw new Error('unknown '+id);console.log('begin '+id);
 const film=await initPage(browser,url+`/film/index.html?mascot=${id}`);await film.waitForFunction(()=>window.__film,{timeout:60000});
 const intro=await initPage(browser,url+`/beauty.html?mascot=${id}`);await intro.waitForFunction(()=>window.ready);
 const basename=String(c.number).padStart(2,'0')+'-'+c.id;
 await intro.evaluate(()=>window.draw(.8));await seekMascots(intro,.8);await intro.screenshot({path:path.join(OUT,basename+'-portrait.png')});
 const probeTimes=[15.6,18.6,80,108.6,117.6];
 for(let j=0;j<probeTimes.length;j++){await seekFilm(film,probeTimes[j]);await film.screenshot({path:path.join(CACHE,basename+`-frame${j}.png`)});}
 await execAsync('ffmpeg',['-hide_banner','-loglevel','error','-nostdin','-y','-framerate','1','-i',path.join(CACHE,basename+'-frame%d.png'),'-vf','scale=480:-2,tile=3x2:padding=5:color=0xf1f0e4','-frames:v','1',path.join(OUT,basename+'-sheet.png')]);
 if(!args.includes('--probe')){
 const temp=path.join(CACHE,basename+'.mp4');let segment=-1;
 const writer=spawn('ffmpeg',['-hide_banner','-loglevel','error','-nostdin','-y','-f','image2pipe','-framerate',String(FPS),'-vcodec','mjpeg','-i','pipe:0','-an','-c:v','libx264','-preset','fast','-crf','18','-pix_fmt','yuv420p','-movflags','+faststart',temp],{stdio:['pipe','ignore','pipe']});let err='';writer.stderr.on('data',x=>err+=x);const finished=once(writer,'close');
 for(const span of spans){segment++;console.log(id+' '+span.name);for(let i=0;i<Math.round(span.length*FPS);i++){
 let p;if(span.kind==='intro'){p=intro;await p.evaluate(t=>window.draw(t),i/FPS);await seekMascots(p,i/FPS);}else{p=film;await seekFilm(p,span.from+i/FPS);}
 const buf=await p.screenshot({type:'jpeg',quality:96});if(!writer.stdin.write(buf))await once(writer.stdin,'drain');}}
 writer.stdin.end();const [exit]=await finished;if(exit!==0)throw new Error(err);checkPage(film);checkPage(intro);
 const master=path.join(OUT,basename+'-1080p.mp4');await muxAudio(temp,master);
 await execAsync('ffmpeg',['-hide_banner','-loglevel','error','-nostdin','-y','-i',master,'-vf','scale=1280:720','-c:v','libx264','-preset','fast','-crf','22','-c:a','aac','-b:a','160k','-movflags','+faststart',path.join(OUT,basename+'.mp4')]);
 await execAsync('ffmpeg',['-hide_banner','-loglevel','error','-y','-i',path.join(OUT,basename+'.mp4'),'-vf',"select='eq(n,24)+eq(n,72)+eq(n,138)+eq(n,228)+eq(n,345)+eq(n,510)+eq(n,639)+eq(n,690)',scale=480:270,tile=4x2:padding=6:color=0xf3f0e4",'-frames:v','1',path.join(OUT,basename+'-encoded.jpg')]);
 for(const file of [master,path.join(OUT,basename+'.mp4')])await execAsync('ffmpeg',['-hide_banner','-loglevel','error','-i',file,'-f','null','-']);
 }
 checkPage(film);checkPage(intro);await film.close();await intro.close();console.log('done '+id);
 }
 const jobs=Number((args.find(x=>x.startsWith('--jobs='))||'--jobs=1').split('=')[1]);
 const queue=[...ids];await Promise.all(Array.from({length:Math.max(1,Math.min(3,jobs))},async()=>{while(queue.length)await renderOne(queue.shift());}));
 }finally{await browser.close();srv.close();}
}
run().catch(e=>{console.error(e);process.exit(1);});
