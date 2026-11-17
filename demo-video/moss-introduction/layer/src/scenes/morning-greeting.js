// The greeting is projected into the actual laptop, then the same surface fills the frame.
import {el,ramp,ease,lerp} from '../lib.js';
import {buildTag} from '../mascot/tag/mascot.js';
import {create as createBrief} from './tagbrief.js';
function onto(q,w,h){const[[x0,y0],[x1,y1],[x2,y2],[x3,y3]]=q,dx1=x1-x2,dx2=x3-x2,sx=x0-x1+x2-x3,dy1=y1-y2,dy2=y3-y2,sy=y0-y1+y2-y3,den=dx1*dy2-dx2*dy1,g=(sx*dy2-dx2*sy)/den,k=(dx1*sy-sx*dy1)/den,a=x1-x0+g*x1,b=x3-x0+k*x3,d=y1-y0+g*y1,e=y3-y0+k*y3;return`matrix3d(${a/w},${d/w},0,${g/w},${b/h},${e/h},0,${k/h},0,0,1,0,${x0},${y0},0,1)`;}
export async function decorateMorning(node,slot,film){
 const roomLayers=[...node.children];
 const page=el('div',{style:{position:'absolute',left:'0',top:'0',width:'1920px',height:'1080px',background:'#f4f3eb',transformOrigin:'0 0',overflow:'hidden'}});
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 1920 1080');Object.assign(svg.style,{position:'absolute',inset:'0',width:'1920px',height:'1080px'});const moss=buildTag(svg,{height:690});
 page.append(svg,el('div',{text:'Good morning, Ram.',style:{position:'absolute',left:'70px',right:'70px',top:'810px',font:'700 112px Manrope',textAlign:'center',color:'#1f5b43',whiteSpace:'nowrap'}}),el('div',{text:"Ram’s AI Peer · AI",style:{position:'absolute',left:'0',right:'0',top:'978px',font:'600 37px Manrope',textAlign:'center',color:'#60735b'}}));
 const briefSlot=film.slots.find(s=>s.id==='morning-laptop'),brief=await createBrief(briefSlot,film);
 const bg=el('div',{style:{position:'absolute',inset:'0',background:'#f4f3eb'}});node.append(bg,page,brief.el);
 return(t)=>{const u=t-slot.start;const k=ease.inOut(ramp(u,1.4,3.05)),fade=ease.inOut(ramp(u,2.85,3.38));
  // Corner track matches the stationary generated laptop opening throughout this shot.
  const q=[[1338,539],[1592,558],[1526,798],[1280,732]],target=[[0,0],[1920,0],[1920,1080],[0,1080]];
  const z=1.3+4.7*k,tx=lerp(-509,960-6*1434,k),ty=k*(540-6*667),turn=ease.inOut(ramp(u,2.25,3.05));
  for(const n of roomLayers){n.style.transformOrigin='0 0';n.style.transform=`translate(${tx}px,${ty}px) scale(${z})`;}
  const qq=q.map((p,i)=>[lerp(p[0]*z+tx,target[i][0],turn),lerp(p[1]*z+ty,target[i][1],turn)]);page.style.transform=onto(qq,1920,1080);page.style.opacity=1-fade;bg.style.opacity=ease.inOut(ramp(u,2.1,2.9));
  moss.draw({x:960,y:755,s:1,label:false,shadow:0,action:'wave',actionTime:Math.min(4.7,.5+u)});
  brief.el.style.display='block';brief.el.style.opacity=fade;brief.render(briefSlot.start);
 };
}
