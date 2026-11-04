import {bundle} from '@remotion/bundler';
import {selectComposition, renderMedia, renderStill} from '@remotion/renderer';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.resolve(root,'../renders');const work=path.resolve(root,'../work/draft02');fs.mkdirSync(work,{recursive:true});
const chrome='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const serveUrl=await bundle({entryPoint:path.join(root,'src/index.tsx'),publicDir:path.join(root,'public'),enableCaching:true});
const composition=await selectComposition({serveUrl,id:'AIPeerDraft02',browserExecutable:chrome});
const stills=process.argv.find(x=>x.startsWith('--stills'));
if(stills){const times=stills.includes('=')?stills.split('=')[1].split(',').map(Number):[4,7.5,11,18,21,28,38,45,52,60,68,75,83,93,96,104,111,124,133,140.5,147.8,160.1,167.5,172.8,185,191.1,201.1,210.1,219.1];for(const sec of times){await renderStill({serveUrl,composition,frame:Math.round(sec*30),output:path.join(work,`frame-${String(sec).padStart(5,'0')}.png`),browserExecutable:chrome});console.log(`Still ${sec}s`);}}
else{const rangeArg=process.argv.find(x=>x.startsWith('--range='));const range=rangeArg?rangeArg.split('=')[1].split(',').map(Number):undefined;const preview=process.argv.includes('--preview');const suffix=range?`range-${range[0]}-${range[1]}`:preview?'preview-silent':'silent';let last=-1;await renderMedia({serveUrl,composition,codec:'h264',muted:true,frameRange:range,outputLocation:path.join(out,`ai-peer-draft-02-${suffix}.mp4`),browserExecutable:chrome,concurrency:4,scale:preview?.5:1,crf:preview?24:18,pixelFormat:'yuv420p',onProgress:({progress})=>{let p=Math.floor(progress*20)*5;if(p!==last){last=p;console.log(`Render ${p}%`);}}});console.log('Visual render complete.');}
