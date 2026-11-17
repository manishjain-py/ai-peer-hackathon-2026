// Each card and grasping paw share a trajectory until placement, then fingers release.
import {world} from './world.js';
import {el,ramp,ease,lerp} from '../lib.js';
import {buildTag} from '../mascot/tag/mascot.js';
const NS='http://www.w3.org/2000/svg';
const S=(name,attrs,parent)=>{const n=document.createElementNS(NS,name);for(const[k,v]of Object.entries(attrs))n.setAttribute(k,v);parent?.append(n);return n;};
const seq=(u,a,b)=>ease.inOut(ramp(u,a,b));
export async function create(slot,film){
 const data=await(await fetch('assets/ocean-world.json')).json();data.peer_face='assets/screens/peer-face-moss.png';data.chapter=null;data.labels=[];
 data.beats={lit:1,listen:2.1,pull:[3.8,7.2],pick:6.4,open:[4.1,4.8],brief:[12.8,14.4],fade:[8,20],warm:[12.8,20]};
 const flood=world(data,film,slot);[...flood.node.children].filter(n=>n.tagName!=='CANVAS').forEach(n=>n.style.visibility='hidden');
 const style=el('style',{text:`.ocean{position:absolute;inset:0;overflow:hidden}.oc-shade{position:absolute;inset:0;background:linear-gradient(#06151cdd,transparent 36%,#092a2588)}.oc-title{position:absolute;left:90px;top:55px;color:#f4f8e9;font:750 52px/1.12 Manrope;letter-spacing:-1.5px}.oc-sub{position:absolute;left:94px;top:125px;color:#d0e7d9;font:600 26px Manrope}.oc-box{position:absolute;left:1060px;top:220px;width:790px;height:640px;background:#173d36e8;border:2px solid #acddbe;border-radius:25px}.oc-boxhead{padding:24px 28px;font:750 25px Manrope;letter-spacing:1px;color:#e5f4e6}.oc-slot{position:absolute;left:27px;width:732px;height:156px;border:2px dashed #9ec7aa88;border-radius:17px;padding:20px 24px;box-sizing:border-box;font:650 23px Manrope;color:#abcbb7}.oc-paper{position:absolute;left:0;top:0;width:730px;height:154px;border:2px solid #b7d6b9;border-radius:15px;background:#f6f6e9;box-sizing:border-box;box-shadow:0 16px 25px #0004;transform-origin:0 0;overflow:hidden}.oc-paper small{display:block;background:#dce9d4;color:#23523b;padding:10px 22px;font:750 21px Manrope;letter-spacing:.5px}.oc-paper b{display:block;font:750 30px/1.15 Manrope;letter-spacing:-.5px;padding:13px 22px 0;color:#1a3528}.oc-paper span{display:block;font:550 21px Manrope;color:#48604b;padding:8px 22px}.oc-footer{position:absolute;left:1075px;top:900px;font:700 29px Manrope;color:#ecf4de}.oc-identity{position:absolute;left:80px;top:940px;font:650 25px Manrope;color:#d5ead7}.oc-svg{position:absolute;inset:0;width:1920px;height:1080px;pointer-events:none}`});
 const title=el('div.oc-title',{text:'Thousands of updates. Three that matter.'}),sub=el('div.oc-sub',{text:'Email · Slack · Code · Tickets · Documents · Meetings'});
 const box=el('div.oc-box',{},el('div.oc-boxhead',{text:'RAM’S MORNING BRIEF'}));
 const entries=[['ROLE · Payments engineer','Brazil fraud threshold drops Thursday','More payout holds may look like retry failures.'],['GOAL · Reliable Brazil launch','Launch review · 9:00 AM','Your go/no-go decision is needed.'],['INTEREST · Retry reliability','Retry recovery · 92% within 6 hours','The outage is traced. Retry logic is ruled out.']];
 entries.forEach((d,i)=>box.append(el('div.oc-slot',{text:d[0],style:{top:`${85+i*177}px`}})));
 const back=S('svg',{viewBox:'0 0 1920 1080',class:'oc-svg'}),front=S('svg',{viewBox:'0 0 1920 1080',class:'oc-svg'});
 const moss=buildTag(back,{height:340});
 const arm=S('path',{fill:'none',stroke:'#67804b','stroke-width':29,'stroke-linecap':'round'},front);
 const armLight=S('path',{fill:'none',stroke:'#a0b777','stroke-width':17,'stroke-linecap':'round'},front);
 const palm=S('ellipse',{rx:28,ry:23,fill:'#80965a',stroke:'#536b3b','stroke-width':3},front);
 const fingers=[0,1,2].map(i=>S('path',{fill:'none',stroke:i===0?'#b0c18b':'#95ab70','stroke-width':10,'stroke-linecap':'round'},front));
 const cards=entries.map(d=>el('div.oc-paper',{},el('small',{text:d[0]}),el('b',{text:d[1]}),el('span',{text:d[2]})));
 const footer=el('div.oc-footer',{text:'3 useful updates. Ready when he wakes.'});
 const node=el('div.scene.ocean',{},style,flood.node,el('div.oc-shade'),title,sub,box,...cards,back,front,footer,el('div.oc-identity',{text:'Ram’s AI Peer'}));
 const starts=[1.8,4.6,7.4],sources=[[110,335],[170,510],[120,690]],dest=entries.map((_,i)=>[1088,307+177*i]);
 return{el:node,render(t){
  const u=t-slot.start;flood.render(u*1.4);const reveal=seq(u,.5,1.4);box.style.opacity=reveal;
  const active=starts.findIndex(a=>u>=a&&u<a+2.8);const idx=active<0?(u<starts[0]?0:2):active,a=starts[idx],q=u-a;
  // Reach, pinch, carry, place, release, return: all contacts are locally composed.
  const grab=seq(q,.35,.65),carry=seq(q,.75,2.05),release=seq(q,2.24,2.48),returning=seq(q,2.45,2.8);
  const src=sources[idx],to=dest[idx],scale=lerp(.7,1,carry),cx=lerp(src[0],to[0],carry),cy=lerp(src[1],to[1],carry)-105*Math.sin(Math.PI*carry);
  const follow=seq(q,0,.6)*(1-returning);const bodyX=lerp(700,cx+730*scale-95,follow),bodyY=lerp(925,cy+154*scale+224,follow);
  moss.draw({x:bodyX,y:bodyY,s:1,label:false,alpha:seq(u,.1,.7),action:'attentive',actionTime:2.0});
  cards.forEach((c,i)=>{const age=u-starts[i],carr=seq(age,.75,2.05),sc=lerp(.7,1,carr),x=lerp(sources[i][0],dest[i][0],carr),y=lerp(sources[i][1],dest[i][1],carr)-105*Math.sin(Math.PI*carr);c.style.opacity=seq(u,.25+i*.2,.9+i*.2);c.style.transform=`translate(${x}px,${y}px) rotate(0deg) scale(${sc})`;c.style.boxShadow=age>2.24?'0 2px 10px #0002':'0 18px 30px #0005';});
  const held=active>=0&&q<2.48;front.style.opacity=held?seq(q,0,.22):0;
  const home=[bodyX-105,bodyY-115],contact=[cx+730*scale-18,cy+154*scale-26],hand=[lerp(home[0],contact[0],grab*(1-release)),lerp(home[1],contact[1],grab*(1-release))];
  const shoulder=[bodyX+66,bodyY-160],d=`M ${shoulder[0]} ${shoulder[1]} Q ${bodyX+155} ${hand[1]+80} ${hand[0]} ${hand[1]}`;arm.setAttribute('d',d);armLight.setAttribute('d',d);palm.setAttribute('cx',hand[0]);palm.setAttribute('cy',hand[1]);
  fingers.forEach((f,i)=>f.setAttribute('d',`M ${hand[0]+16-i*9} ${hand[1]+8} q ${-8-8*release} ${-14-8*release} ${-3-7*release} ${-30-i*3}`));
  footer.style.opacity=seq(u,10,10.7);title.textContent=u>10.1?'Ready for Ram’s morning brief':'Thousands of updates. Three that matter.';
 }};
}
