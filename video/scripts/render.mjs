import {bundle} from '@remotion/bundler';
import {selectComposition, renderMedia, renderStill} from '@remotion/renderer';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import fs from 'node:fs';

const here=path.dirname(fileURLToPath(import.meta.url));
const root=path.resolve(here,'..');
const output=path.resolve(root,'../renders');
fs.mkdirSync(output,{recursive:true});
const chrome='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const executable=fs.existsSync(chrome)?chrome:undefined;
console.log('Bundling visual source...');
const serveUrl=await bundle({entryPoint:path.join(root,'src/index.tsx'),publicDir:path.join(root,'public'),enableCaching:false,onProgress:(progress)=>console.log(`Bundle ${progress}%`)});
console.log(`Bundle ready: ${serveUrl}`);
const composition=await selectComposition({serveUrl,id:'AIPeerDraft01',browserExecutable:executable});
if(process.argv.includes('--stills')){
 const seconds=[5,13,25,37,48,56,68,82,91,98,110,117];
 for(const sec of seconds){
  await renderStill({serveUrl,composition,output:path.join(output,`frame-${String(sec).padStart(3,'0')}.png`),frame:sec*30,browserExecutable:executable});
  console.log(`Still ${sec}s`);
 }
}else{
 let last=-1;
 const rangeArg=process.argv.find(v=>v.startsWith('--range='));
 const range=rangeArg?rangeArg.slice(8).split(',').map(Number):undefined;
 const suffix=range?`range-${range[0]}-${range[1]}`:'silent';
 await renderMedia({serveUrl,composition,codec:'h264',muted:true,frameRange:range,outputLocation:path.join(output,`ai-peer-draft-01-${suffix}.mp4`),browserExecutable:executable,concurrency:range?2:4,crf:18,pixelFormat:'yuv420p',onProgress:({progress})=>{const p=Math.floor(progress*20)*5;if(p!==last){last=p;console.log(`Render ${p}%`)}}});
 console.log('Visual render complete. Mix audio with scripts/finalize.sh.');
}
