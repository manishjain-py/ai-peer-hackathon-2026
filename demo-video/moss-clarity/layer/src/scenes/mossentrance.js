// V37: the phone approach resolves into a real explanation of the proactive AI teammate.
// Both entrance and setup-click slots share absolute time, so their22s boundary is seamless.
import {el,clamp,ramp,ease,lerp} from '../lib.js';
import {buildTag} from '../mascot/tag/mascot.js';
const NS='http://www.w3.org/2000/svg';
const ICON_NOTE='<svg viewBox="0 0 48 48" width="42" height="42" fill="none" stroke="currentColor" stroke-width="2.5"><rect x="11" y="8" width="29" height="34" rx="5"/><path d="M7 14h8M7 23h8M7 32h8M21 18h12M21 25h12M21 32h8"/></svg>';
const ICON_CHAT='<svg viewBox="0 0 48 48" width="42" height="42" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M8 10h32v23H25L14 41v-8H8z"/><path d="M16 19h16M16 25h11"/></svg>';
export async function create(slot,film){
 const home=el('div',{style:{position:'absolute',inset:'0',background:'#f4f3eb',fontFamily:'Manrope'}});
 home.append(el('div',{style:{position:'absolute',left:'0',top:'0',width:'330px',height:'1080px',background:'#eeebdf',borderRight:'1px solid #dedbcd'}}));
 home.append(el('div',{text:'AI Peer',style:{position:'absolute',left:'40px',top:'40px',font:'800 34px Manrope',color:'#1e5940'}}),el('div',{text:'HOST PAYOUTS',style:{position:'absolute',left:'42px',top:'91px',font:'500 14px monospace',letterSpacing:'3px',color:'#7a7c72'}}));
 ['✧  Set up','▱  What I learned','⌂  Your brief','▢  Ask your Peer','◇  How it works'].forEach((v,i)=>home.append(el('div',{text:v,style:{position:'absolute',left:'26px',top:`${160+i*58}px`,width:'278px',height:'54px',borderRadius:'14px',padding:'13px 18px',font:`${i?500:700} 21px Manrope`,background:i?'transparent':'#e3dfcc',color:'#333b31'}})));
 const kicker=el('div',{text:'HELLO, RAM.',style:{position:'absolute',left:'450px',top:'240px',font:'600 20px Manrope',letterSpacing:'3px',color:'#687568'}});
 const headline=el('div',{html:'Your proactive AI teammate. <span style="color:#246749">24/7.</span>',style:{position:'absolute',left:'446px',top:'292px',width:'1370px',font:'700 58px/1.13 Manrope',letterSpacing:'-2px',color:'#1e2f23',whiteSpace:'nowrap'}});
 const subtitle=el('div',{text:'For your work. Even when you’re away.',style:{position:'absolute',left:'450px',top:'389px',font:'400 31px Manrope',color:'#667061'}});
 const card=(x,icon,title,text)=>el('div',{style:{position:'absolute',left:`${x}px`,top:'490px',width:'390px',height:'195px',padding:'24px',background:'#fbfcf6',border:'2px solid #d2dec9',borderRadius:'22px',boxShadow:'0 14px 30px #294c3310',color:'#245b40'}},el('div',{html:icon,style:{marginBottom:'12px'}}),el('div',{text:title,style:{font:'700 27px Manrope',color:'#224631'}}),el('div',{text,style:{font:'400 21px/1.3 Manrope',color:'#66715e',marginTop:'8px'}}));
 const informed=card(450,ICON_NOTE,'Keeps you informed','Brings you the updates that matter.');
 const coverage=card(865,ICON_CHAT,'Covers when you’re away','Answers as your clearly labelled AI.');
 const button=el('div',{text:'Set up my AI Peer  →',style:{position:'absolute',left:'450px',top:'725px',width:'380px',height:'86px',borderRadius:'44px',background:'#205f46',color:'#fff',font:'700 28px Manrope',display:'grid',placeItems:'center',boxShadow:'0 12px 22px #23563c2b'}});
 const privacy=el('div',{text:'Your sources. Your choices.',style:{position:'absolute',left:'450px',top:'825px',font:'500 19px Manrope',color:'#6b7464'}});
 const halo=el('div',{style:{position:'absolute',left:'1300px',top:'420px',width:'560px',height:'490px',borderRadius:'50%',background:'radial-gradient(ellipse,rgba(181,211,157,.32),transparent 70%)'}});
 home.append(kicker,headline,subtitle,informed,coverage,button,privacy,halo);
 const room=el('img',{attrs:{src:'assets/screens/phone-last.jpg'},style:{position:'absolute',inset:'0',width:'1920px',height:'1080px',transformOrigin:'0 0'}});
 const next=el('img',{attrs:{src:'assets/screens/setup-first.png'},style:{position:'absolute',inset:'0',width:'1920px',height:'1080px'}});await Promise.all([room.decode(),next.decode()]);
 const svg=document.createElementNS(NS,'svg');svg.setAttribute('viewBox','0 0 1920 1080');Object.assign(svg.style,{position:'absolute',inset:'0',width:'1920px',height:'1080px'});const moss=buildTag(svg,{height:150});
 const pointer=el('div',{html:'<svg viewBox="0 0 24 24" width="42" height="42"><path d="M5 3l14 9-6 1 4 7-3 1-4-7-5 5z" fill="#15251b" stroke="white" stroke-width="1.5"/></svg>',style:{position:'absolute',left:'0',top:'0'}});
 const ripple=el('div',{style:{position:'absolute',left:'625px',top:'763px',width:'20px',height:'20px',border:'3px solid #bfd5a6',borderRadius:'50%'}});
 const node=el('div.scene',{style:{background:'#f4f3eb'}},home,room,svg,ripple,pointer,next);
 const reveal=(n,t,a,b)=>{const k=ease.out(ramp(t,a,b));n.style.opacity=k;n.style.transform=`translateY(${18*(1-k)}px)`;};
 return{el:node,render(t){const u=t-14,z=ease.inOut(ramp(u,0,1.6)),d=ease.inOut(ramp(u,1.25,2.3));const s=lerp(1,7.5,z),cx=360,cy=923;
  room.style.transform=`translate(${cx*(1-s)+600*z}px,${cy*(1-s)-380*z}px) scale(${s})`;room.style.opacity=1-d;home.style.opacity=d;
  const x=lerp(360+600*z,1580,d),y=lerp(1005-380*z,760,d),ms=lerp(.684*(1+3.3*z),2.1,d);
  const presenting=t>=16.6&&t<21.9;const act=presenting?{action:'present',actionTime:Math.min(4.7,.5+(t-16.6)*.78)}:{action:t<16.6?'wave':'listen',actionTime:t<16.6?Math.min(4.6,u+2.1):Math.min(4.5,1+t-21.9)};
  const out=ease.inOut(ramp(t,23.75,24.6));moss.draw({x,y,s:ms,alpha:1-out,shadow:.3,label:true,...act});
  reveal(kicker,t,15.8,16.2);reveal(headline,t,16.6,17.1);reveal(subtitle,t,16.6,17.1);reveal(informed,t,18.3,18.7);reveal(coverage,t,19.45,19.85);reveal(button,t,20.4,20.8);reveal(privacy,t,20.8,21.1);
  const p=ease.inOut(ramp(t,22.35,23.35));pointer.style.opacity=ease.out(ramp(t,22.35,22.55))*(1-out);pointer.style.transform=`translate(${lerp(1780,643,p)}px,${lerp(883,769,p)}px) scale(${1-.12*Math.sin(Math.PI*ramp(t,23.48,23.65))})`;
  const hit=ramp(t,23.54,23.95);ripple.style.opacity=t>=23.54?(1-hit)*.8:0;ripple.style.transform=`scale(${1+7*hit})`;
  const press=Math.sin(Math.PI*ramp(t,23.49,23.72));button.style.transform=`scale(${1-.025*press})`;
  next.style.opacity=out;next.style.transform=`scale(${1+.035*(1-out)})`;home.style.opacity=d*(1-out);
 }};
}
