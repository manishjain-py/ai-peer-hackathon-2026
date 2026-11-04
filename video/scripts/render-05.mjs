import {bundle} from '@remotion/bundler';
import {selectComposition, renderMedia, renderStill} from '@remotion/renderer';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.resolve(root,'../renders');const work=path.resolve(root,'../work/draft05');fs.mkdirSync(work,{recursive:true});
const chrome='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const serveUrl=await bundle({entryPoint:path.join(root,'src/index.tsx'),publicDir:path.join(root,'public'),enableCaching:true});
const composition=await selectComposition({serveUrl,id:'AIPeerDraft05',browserExecutable:chrome});
const stills=process.argv.find(x=>x.startsWith('--stills'));
if(stills){const times=stills.includes('=')?stills.split('=')[1].split(',').map(Number):[3,18.5,25.5,29,33,38,42,44,47,51,54,57.5,60.5,65,70,80,91,99,105,111,116,122,126,131,134,139,145,150,155,160,166,172,180,194];for(const sec of times){await renderStill({serveUrl,composition,frame:Math.round(sec*30),output:path.join(work,`frame-${String(sec).padStart(5,'0')}.png`),browserExecutable:chrome});console.log(`Still ${sec}s`);}}
else{const rangeArg=process.argv.find(x=>x.startsWith('--range='));const range=rangeArg?rangeArg.split('=')[1].split(',').map(Number):undefined;const preview=process.argv.includes('--preview');const suffix=range?`range-${range[0]}-${range[1]}`:preview?'preview-silent':'silent';let last=-1;await renderMedia({serveUrl,composition,codec:'h264',muted:true,frameRange:range,outputLocation:path.join(out,`ai-peer-draft-05-${suffix}.mp4`),browserExecutable:chrome,concurrency:4,scale:preview?.5:1,crf:preview?24:18,pixelFormat:'yuv420p',onProgress:({progress})=>{let p=Math.floor(progress*20)*5;if(p!==last){last=p;console.log(`Render ${p}%`);}}});console.log('Visual render complete.');}
