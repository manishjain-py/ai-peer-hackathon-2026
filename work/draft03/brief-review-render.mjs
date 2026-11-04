import {createRequire} from 'node:module';
import path from 'node:path';
const require=createRequire(path.resolve('video/package.json'));
const {bundle}=require('@remotion/bundler');
const {selectComposition,renderStill}=require('@remotion/renderer');
const browserExecutable='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const serveUrl=await bundle({entryPoint:path.resolve('work/draft03/brief-review-entry.tsx'),publicDir:path.resolve('video/public')});
const composition=await selectComposition({serveUrl,id:'BriefQA',browserExecutable});
for(const t of [9,19,29,34]){await renderStill({serveUrl,composition,frame:Math.round(t*30),output:path.resolve(`work/draft03/brief-${t}.png`),browserExecutable});console.log(`Rendered ${t}s`);}

const returned=await selectComposition({serveUrl,id:"ReturnQA",browserExecutable});
await renderStill({serveUrl,composition:returned,frame:360,output:path.resolve("work/draft03/brief-return-12.png"),browserExecutable});
console.log("Rendered return 12s");
