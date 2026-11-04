import {bundle} from '@remotion/bundler';
import {selectComposition, renderMedia, renderStill} from '@remotion/renderer';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import fs from 'node:fs';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const out=path.resolve(root,'../renders');const work=path.resolve(root,'../work/draft06');fs.mkdirSync(work,{recursive:true});
const chrome='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const serveUrl=await bundle({entryPoint:path.join(root,'src/index.tsx'),publicDir:path.join(root,'public'),enableCaching:true});
const composition=await selectComposition({serveUrl,id:'AIPeerDraft06',browserExecutable:chrome});
const stills=process.argv.find(x=>x.startsWith('--stills'));
if(stills){const times=stills.includes('=')?stills.split('=')[1].split(',').map(Number):[1.2,3.5,5.1,6.5,10,13.5,17,21,25.5,29,32,37,43,48,52,56,59.8,63,66,71,79,86,94,98,103,107,112,118,123,129,134,138,142,147,153,160,164,168,172,174,179,185,191,200,203.4,204.4,208,216,220,223,229,237];for(const sec of times){await renderStill({serveUrl,composition,frame:Math.round(sec*30),output:path.join(work,`frame-${String(sec).padStart(5,'0')}.png`),browserExecutable:chrome});console.log(`Still ${sec}s`);}}
else{const rangeArg=process.argv.find(x=>x.startsWith('--range='));const range=rangeArg?rangeArg.split('=')[1].split(',').map(Number):undefined;const preview=process.argv.includes('--preview');const suffix=range?`range-${range[0]}-${range[1]}`:preview?'preview-silent':'silent';let last=-1;await renderMedia({serveUrl,composition,codec:'h264',muted:true,frameRange:range,outputLocation:path.join(out,`ai-peer-draft-06-${suffix}.mp4`),browserExecutable:chrome,concurrency:4,scale:preview?.5:1,crf:preview?24:18,pixelFormat:'yuv420p',onProgress:({progress})=>{let p=Math.floor(progress*20)*5;if(p!==last){last=p;console.log(`Render ${p}%`);}}});console.log('Visual render complete.');}
