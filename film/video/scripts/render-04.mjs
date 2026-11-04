import {bundle} from '@remotion/bundler';
import {selectComposition, renderMedia, renderStill} from '@remotion/renderer';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.resolve(root,'../renders');const work=path.resolve(root,'../work/draft04');fs.mkdirSync(work,{recursive:true});
const chrome='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const serveUrl=await bundle({entryPoint:path.join(root,'src/index.tsx'),publicDir:path.join(root,'public'),enableCaching:true});
const composition=await selectComposition({serveUrl,id:'AIPeerDraft04',browserExecutable:chrome});
const stills=process.argv.find(x=>x.startsWith('--stills'));
if(stills){const times=stills.includes('=')?stills.split('=')[1].split(',').map(Number):[.7,3,6.5,10,14,18.5,20.3,22,25.5,27,29,31,33,35,38,40,42.5,45,47.5,50.5,52,56,62,72,82,96,112,122,137,148,163,178];for(const sec of times){await renderStill({serveUrl,composition,frame:Math.round(sec*30),output:path.join(work,`frame-${String(sec).padStart(5,'0')}.png`),browserExecutable:chrome});console.log(`Still ${sec}s`);}}
else{const rangeArg=process.argv.find(x=>x.startsWith('--range='));const range=rangeArg?rangeArg.split('=')[1].split(',').map(Number):undefined;const preview=process.argv.includes('--preview');const suffix=range?`range-${range[0]}-${range[1]}`:preview?'preview-silent':'silent';let last=-1;await renderMedia({serveUrl,composition,codec:'h264',muted:true,frameRange:range,outputLocation:path.join(out,`ai-peer-draft-04-${suffix}.mp4`),browserExecutable:chrome,concurrency:4,scale:preview?.5:1,crf:preview?24:18,pixelFormat:'yuv420p',onProgress:({progress})=>{let p=Math.floor(progress*20)*5;if(p!==last){last=p;console.log(`Render ${p}%`);}}});console.log('Visual render complete.');}
