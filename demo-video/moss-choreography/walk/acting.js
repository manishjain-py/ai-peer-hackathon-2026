// V35: purposeful performances, bounded source segments and quiet holds.
// A new action dissolves over 0.12s; no state or wall clock is used.
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x));
const pose=(action,at)=>({action,actionTime:clamp(at,.04,4.8)});
function choose(t,beats){
 let i=beats.findIndex(b=>t<b[1]);if(i<0)i=beats.length-1;
 const b=beats[i],at=typeof b[3]==='function'?b[3](t):b[3]+clamp(t-b[0],0,b[4]??4.8);
 const p=pose(b[2],at);
 if(i>0&&t-b[0]<.12&&beats[i-1][2]!==b[2]){
  const a=beats[i-1],end=a[1]-.001;
  p.previousAction=a[2];p.previousTime=typeof a[3]==='function'?a[3](end):a[3]+clamp(end-a[0],0,a[4]??4.8);
  p.actionBlend=clamp((t-b[0])/.12);
 }
 return p;
}
const sourceBeats=[
 [5.5,6.75,8],[8,9.3,10.6],[10.6,12.28,13.45],[13.45,14.76,15.72],[15.72,16.98,17.92],[17.92,18.34,19.5]
];
function notebookAt(t){
 const b=sourceBeats.find(b=>t>=b[0]&&t<b[2])||sourceBeats[5];
 // Looking up with the pencil still while sources load/sign-in runs. Visible writing
 // only once the key fact highlights; one down/stroke/up cycle per revealed fact.
 if(t<b[1])return .04+Math.min(.20,(t-b[0])*.08);
 const k=clamp((t-b[1])/(b[2]-b[1]));return .45+1.75*k;
}
export function walkActing(t){return choose(t,[
 [0,2.8,'listen',.8,.8],[2.8,4,'wave',.3,1.2],[4,5.5,'listen',1.2,1.5],
 [5.5,6.75,'listen',1.25,.85],[6.75,8,'acknowledge',1.15,.95],
 [8,10.6,'notebook',notebookAt],[10.6,11.98,'listen',1.75,1],[11.98,13.45,'attentive',1.25,1.4],
 [13.45,15.72,'attentive',2.75,1.25],[15.72,17.92,'notebook',notebookAt],
 [17.92,19.5,'reassure',1.25,1.25],[19.5,21,'notebook',4.3,.4],
 [21,22.05,'attentive',2,1.05],[22.05,24.4,'present',.5,2.35],
 [24.4,27,'listen',1.1,2.6],[27,31.75,'attentive',1,3.8],
 [31.75,39.5,'present',.5,4.3],[39.5,43.02,'listen',.8,3.52],
 [43.02,45.5,'attentive',1.8,2.48],[45.5,48.62,'present',.6,3.12],
 [48.62,50,'acknowledge',1.1,1.38],[50,55,'reassure',.7,4.1],
 [55,57.5,'listen',2.1,2.5],[57.5,100,'listen',2.4,2.4]
 ]);}
export function filmActing(t){return choose(t,[
 [0,12.5,'listen',1.5,1],[12.5,15.3,'wave',.1,2.8],
 [15.3,22,'listen',.9,3.9],[22,69.4,'listen',1.5,3.3],
 [69.4,71.3,'listen',1.2,1.9],[71.3,73,'wave',.3,1.7],
 [73,77.1,'listen',.8,4],[77.1,84.7,'present',.6,4.2],
 [84.7,87,'listen',1.2,2.3],[87,87.85,'attentive',2.2,.85],
 [87.85,89.25,'reassure',1.1,1.4],[89.25,92.2,'notebook',t=>.45+(t-89.25)*1.34],
 [92.2,102.2,'listen',1.8,3],[102.2,104.3,'acknowledge',1,2.1],
 [104.3,105.6,'listen',3.2,1.3],[105.6,108.5,'present',.7,2.9],
 [108.5,109.8,'listen',2,1.3],[109.8,111,'acknowledge',t=>1+(t-109.8)*1.7],
 [111,120,'listen',3.8,1]
 ]);}
