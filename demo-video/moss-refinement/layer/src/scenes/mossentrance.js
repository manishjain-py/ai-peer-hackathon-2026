// V36: one continuous camera approach from the notification to Moss, then the setup home.
import {el,clamp,ramp,ease,lerp} from '../lib.js';
import {buildTag} from '../mascot/tag/mascot.js';
const NS='http://www.w3.org/2000/svg';
export async function create(slot,film){
 const home=el('img',{attrs:{src:'assets/screens/home.jpg'},style:{position:'absolute',inset:'0',width:'1920px',height:'1080px'}});
 const room=el('img',{attrs:{src:'assets/screens/phone-last.jpg'},style:{position:'absolute',inset:'0',width:'1920px',height:'1080px',transformOrigin:'0 0'}});
 await Promise.all([home.decode(),room.decode()]);
 const svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 1920 1080');Object.assign(svg.style,{position:'absolute',inset:'0',width:'1920px',height:'1080px'});const moss=buildTag(svg,{height:150});
 const intro=el('div',{text:'Your personal AI teammate',style:{position:'absolute',left:'1100px',top:'455px',width:'660px',font:'600 31px Manrope',color:'#235740',textAlign:'center'}});
 const reveal=el('div',{style:{position:'absolute',left:'390px',top:'255px',width:'1100px',height:'525px',background:'#f4f3eb'}});
 const halo=el('div',{style:{position:'absolute',left:'970px',top:'475px',width:'550px',height:'400px',borderRadius:'50%',background:'radial-gradient(ellipse,rgba(181,211,157,.28),transparent 70%)'}});
 const node=el('div.scene',{style:{background:'#f4f3eb'}},home,reveal,room,halo,svg,intro);
 return{el:node,render(t){const u=t-slot.start;const z=ease.inOut(ramp(u,0,1.6)),d=ease.inOut(ramp(u,1.25,2.3));
  const s=lerp(1,7.5,z),cx=360,cy=923;room.style.transform=`translate(${cx*(1-s)+600*z}px,${cy*(1-s)-380*z}px) scale(${s})`;room.style.opacity=1-d;
  // The very same actor grows with the camera, then takes its position beside Set up.
  const x=lerp(360+600*z,1150,d),y=lerp(1005-380*z,835,d),ms=lerp(.684*(1+3.3*z),1.15,d);
  moss.draw({x,y,s:ms,shadow:.3,label:true,action:u>=7.6?'wave':u<3.7?'wave':'listen',actionTime:u>=7.6?.3:u<3.7?Math.min(4.6,u+2.1):Math.min(4.5,.8+u-3.7),previousAction:u>=7.6?'listen':undefined,previousTime:4.5,actionBlend:u>=7.6?ramp(u,7.6,8):1});
  home.style.opacity=d;halo.style.opacity=d;reveal.style.opacity=0;
  intro.style.opacity=0;
 }};
}
