// Source-clock coordinates of Moss's feet. The paper moves underneath this frame.
const clamp = x => Math.max(0, Math.min(1, x));
const fraction = (time,start,end) => clamp((time-start)/(end-start));
const smooth = x => x*x*(3-2*x);
const mix = (a,b,k) => a+(b-a)*k;
const left = [195,955,.88];
const cue = [235,850,.82];
const ask = [1670,183,.58];
const check = [1743,931,.80];
const stampExit = [1780,923,.65];
const rules = [236,927,.90];

function move(t,start,end,from,to,arc,lean=0) {
  const k=smooth(fraction(t,start,end));
  const flight=4*k*(1-k);
  return {x:mix(from[0],to[0],k), y:mix(from[1],to[1],k)-arc*flight,
    s:mix(from[2],to[2],k),rot:lean*flight,shadow:.32*(1-flight)};
}
function acting(t, beats) {
  let i=beats.findIndex(b=>t<b[1]);
  if(i<0)i=beats.length-1;
  const at=(b,time)=>clamp((time-b[0])*b[4]/4.65+b[3]/4.65)*4.65;
  const b=beats[i],pose={action:b[2],actionTime:at(b,t)};
  if(i && t-b[0]<.11 && b[2]!==beats[i-1][2]){
    pose.previousAction=beats[i-1][2];pose.previousTime=at(beats[i-1],b[0]);
    pose.actionBlend=fraction(t,b[0],b[0]+.11);
  }
  return pose;
}
const beats=[
 [22,23.75,'attentive',1.1,.5],[23.75,26.2,'notebook',.65,.8],
 [26.2,28.5,'present',1.6,.35],[28.5,31.55,'listen',1.35,.48],
 [31.55,33.15,'attentive',1.1,.55],[33.15,35,'notebook',1.65,.5],
 [35,38.45,'reassure',.8,.54],[38.45,40.65,'attentive',1.35,.4],
 [40.65,43.0,'listen',1.3,.68],[43,46.4,'attentive',2.6,.48],
 [46.4,49.22,'stamp',.04,1.6667],[49.22,51.9,'attentive',1.25,.46],
 [51.9,55,'reassure',.95,.52],[55,62,'listen',1.65,.38]
];
export function walkPose(t,r) {
  const hit=[r.left+r.width/2+15,r.top+r.height/2,150*1.22/255];
  let pose;
  if(t<23.7)pose=move(t,22,23.7,[1800,810,.68],left,100,-7);
  else if(t<31.55)pose=move(t,23.7,24,left,left,0);
  else if(t<38.65)pose=move(t,31.55,33.15,left,cue,93,-5);
  else if(t<42.7)pose=move(t,38.65,40.82,cue,ask,125,8);
  else if(t<46.4)pose=move(t,42.7,44.2,ask,check,42,-5);
  else if(t<48.55)pose=move(t,46.4,47.32,check,hit,38,-4);
  else if(t<49.22)pose=move(t,48.55,49.22,hit,stampExit,32,3);
  else pose=move(t,49.22,51.15,stampExit,rules,48,-8);
  pose.label=t<38.65||t>=51.15;
  return {...pose,...acting(t,beats)};
}
