import {fileURLToPath} from "node:url";
import {bundle} from '../../../video/node_modules/@remotion/bundler/dist/index.js';
import {selectComposition,renderStill} from '../../../video/node_modules/@remotion/renderer/dist/index.js';
const serveUrl=await bundle({entryPoint:fileURLToPath(new URL('./entry.tsx',import.meta.url)),enableCaching:true});
const browserExecutable='/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const composition=await selectComposition({serveUrl,id:'OverloadProof',browserExecutable});
for(const t of [0.7,3,6.5,10.5,14,18.5,22,25.5]){await renderStill({serveUrl,composition,browserExecutable,frame:t*30,output:fileURLToPath(new URL(`./${t}.png`,import.meta.url))});console.log(t)}
