// Catchable pieces and background pieces are drawn by the same field. Each selected
// item has a stable lane and column. It leaves that lane only when the paw meets it.
import {el} from '../lib.js';
import {buildTag} from '../mascot/tag/mascot.js';
const ns='http://www.w3.org/2000/svg';
const clamp=x=>Math.min(1,Math.max(0,x));
const progress=(t,a,b)=>clamp((t-a)/(b-a));
const smooth=x=>x*x*(3-2*x);
const mix=(a,b,k)=>a+(b-a)*k;
const wrap=(x,n)=>((x%n)+n)%n;
const W=105,H=33;
const catches=[
 {time:2.05,lane:2,col:5,atX:422,tag:'ROLE · Payments engineer',title:'Brazil fraud threshold drops Thursday',why:'New holds could look like payout retry failures.'},
 {time:4.53,lane:4,col:7,atX:715,tag:'GOAL · Launch retry in Brazil',title:'Brazil launch review at 9:00 AM',why:'Ram’s go/no-go decision is on the agenda.'},
 {time:6.94,lane:7,col:3,atX:355,tag:'INTEREST · Applied AI',title:'Hands-on AI workshop on Friday',why:'A chance to try new models with other engineers.'}
];
const gap=153,cols=16,period=gap*cols;
const velocity=l=>(l%3===1?-1:1)*(65+(l%4)*18);
const shift=l=>{
 const pick=catches.find(p=>p.lane===l);
 return pick?pick.atX+185-pick.col*gap-velocity(l)*pick.time:l*167.5;
};
function fieldPosition(l,c,t){
 const x=wrap(c*gap+shift(l)+velocity(l)*t,period)-185;
 return [x,216+l*84+Math.sin(x/318+l*1.44+t*.28)*59+Math.sin(x/185+l*.3)*14];
}
const slotY=i=>298+i*173;
function cardPosition(i,t){
 const p=catches[i],captured=fieldPosition(p.lane,p.col,p.time);
 if(t<p.time)return fieldPosition(p.lane,p.col,t);
 const k=smooth(progress(t,p.time+.11,p.time+.73));
 return [mix(captured[0],1090,k),mix(captured[1],slotY(i)+55,k)-78*4*k*(1-k)];
}
const svg=(name,attrs,parent)=>{const node=document.createElementNS(ns,name);for(const [k,v] of Object.entries(attrs))node.setAttribute(k,v);parent?.append(node);return node;};
const ink=['#8ecac6','#9eafde','#a9c5ab','#c5acbc','#a6c3db'];
const symbols=['MAIL','CHAT','DOC','PR','ISSUE','CAL'];
const cache=new Map();
function tile(l,c){
 const kind=(l*2+c)%ink.length,source=(l+c*3)%symbols.length,key=l+','+c;
 if(cache.has(key))return cache.get(key);
 const surface=document.createElement('canvas');surface.width=W*2+8;surface.height=H*2+8;
 const g=surface.getContext('2d');g.scale(2,2);g.translate(2,2);
 g.fillStyle=fill[kind];g.strokeStyle=ink[kind];g.lineWidth=1.3;
 g.beginPath();g.roundRect(0,0,W,H,6);g.fill();g.stroke();
 g.lineWidth=1.8;g.lineJoin='round';g.lineCap='round';
 const paths=['M7 10H24V23H7Z M7 11L15.5 17L24 11','M8 8H23Q25 8 25 11V18Q25 20 22 20H15L10 25V20H8Q6 20 6 17V11Q6 8 8 8Z','M9 7H18L23 12V25H9Z M17 7V13H23 M12 17H19 M12 21H18','M11 9V24 M21 9V15Q21 19 12 19 M8 9A3 3 0 1 0 14 9A3 3 0 1 0 8 9 M18 9A3 3 0 1 0 24 9A3 3 0 1 0 18 9','M6 11H25V15Q21 16 25 19V23H6V19Q10 17 6 15Z M16 13V15 M16 18V20','M7 10H24V24H7Z M7 15H24 M11 7V12 M20 7V12'];
 g.stroke(new Path2D(paths[source]));
 g.fillStyle='#e2eae3';g.font='650 11px Manrope';g.fillText(symbols[source],31,14);
 g.fillStyle=ink[kind];g.font='9px monospace';
 const serial=137+l*223+c*41;
 g.fillText('#'+serial,31,25);
 g.fillRect(82,10,13,2);g.fillRect(82,16,8+(c%3)*2,2);g.fillRect(82,22,4,2);
 cache.set(key,surface);return surface;
}
const fill=['#243c43','#28394a','#29413e','#373a49','#233c48'];
export async function create(slot){
 const node=el('div.scene.v7-ocean');
 node.append(el('style',{text:`
 .v7-ocean{position:absolute;inset:0;overflow:hidden;background:radial-gradient(ellipse at 24% 58%,#1b3f48 0%,#102731 48%,#08181f 92%);color:#f0f5e6;font-family:Manrope,sans-serif}
 .v7-ocean canvas,.v7-ocean svg{position:absolute;inset:0;width:1920px;height:1080px}.v7-ocean canvas{opacity:.97}
 .v7-header-shade{position:absolute;inset:0 0 auto;height:214px;background:linear-gradient(#10252ee8 0 52%,#10252eaa 72%,transparent)}
 .v7-heading{position:absolute;left:82px;top:56px;font-size:53px;font-weight:750;line-height:1.16;letter-spacing:-1.5px;text-shadow:0 2px 12px #061218}
 .v7-sub{position:absolute;left:85px;top:128px;font-size:25px;color:#c2dacf}
 .v7-panel{position:absolute;left:1018px;top:205px;width:815px;height:639px;border:2px solid #81a996;border-radius:26px;box-sizing:border-box;background:#193c34;box-shadow:0 15px 60px #00180e88}
 .v7-panel h2{margin:27px 32px 0;font:750 26px Manrope;letter-spacing:.8px}
 .v7-slot{position:absolute;left:31px;right:31px;height:153px;border-radius:15px;border:2px dashed #80ac9388;box-sizing:border-box}
 .v7-slot>span{position:absolute;left:24px;top:19px;font:650 23px Manrope;color:#b5d4bf}
 .v7-result{position:absolute;left:1051px;width:747px;height:149px;box-sizing:border-box;border:2px solid #c8dcc3;border-radius:14px;overflow:hidden;background:#f6f5e9;color:#17332a;transform-origin:44px 70px}
 .v7-result small{display:block;background:#ddebd9;padding:9px 23px;font:750 21px Manrope;letter-spacing:.5px}
 .v7-result b{display:block;padding:12px 23px 0;font:750 30px/1.15 Manrope;letter-spacing:-.5px}
 .v7-result p{margin:8px 23px;font:550 22px Manrope;color:#3b5747}
 .v7-count{position:absolute;left:1050px;top:883px;font:650 28px Manrope;color:#e5eedb}
 .v7-identity{position:absolute;left:84px;bottom:57px;color:#deece4;font:600 23px Manrope;background:#10282bdb;border-radius:9px;padding:4px 11px}
 `}));
 const canvas=el('canvas');canvas.width=3840;canvas.height=2160;
 const ctx=canvas.getContext('2d');ctx.scale(2,2);
 const heading=el('div.v7-heading',{text:'Thousands of updates. Three that matter.'});
 const sub=el('div.v7-sub',{text:'Email · Slack · Code · Tickets · Documents · Meetings'});
 const panel=el('div.v7-panel',{},el('h2',{text:'RAM’S MORNING BRIEF'}));
 const slotLabels=['Role','Goal','Interest'].map(text=>el('span',{text}));
 const papers=catches.map((c,i)=>{
   panel.append(el('div.v7-slot',{style:{top:(slotY(i)-205)+'px'}},slotLabels[i]));
   return el('div.v7-result',{style:{top:(slotY(i)+2)+'px'}},el('small',{text:c.tag}),el('b',{text:c.title}),el('p',{text:c.why}));
 });
 // Draw captured tokens on a second transparent canvas to fly over the edge of the brief.
 const top=el('canvas');top.width=3840;top.height=2160;const front=top.getContext('2d');front.scale(2,2);
 const stage=svg('svg',{viewBox:'0 0 1920 1080'});const moss=buildTag(stage,{height:242});
 const count=el('div.v7-count',{text:'3 useful updates. Ready when he wakes.'});
 node.append(canvas,el('div.v7-header-shade'),heading,sub,panel,...papers,top,stage,count,el('div.v7-identity',{text:'Ram’s AI Peer'}));
 function slip(g,l,c,x,y,lit=0){
   g.drawImage(tile(l,c),x-2,y-2,W+4,H+4);
   if(lit){g.strokeStyle='#f6dea5';g.lineWidth=2.4;g.beginPath();g.roundRect(x,y,W,H,6);g.stroke();}

 }
 const rest=[732,845];
 function actor(u){
   let previous=rest;
   for(let i=0;i<catches.length;i++){
     const c=catches[i],a=c.time,age=u-a,arrive=cardPosition(i,a);
     // Mirroring the whole performance puts the original raised paw at +85,-123 from the feet.
     const feet=([x,y])=>[x-84,y+H/2+123];
     if(age<-.6)return {xy:previous,grip:false};
     if(age<0){const k=smooth(progress(age,-.6,0)),target=feet(arrive);
       return {xy:[mix(previous[0],target[0],k),mix(previous[1],target[1],k)-34*4*k*(1-k)],grip:k>.5};}
     if(age<.75)return {xy:feet(cardPosition(i,u)),grip:true};
     const dropped=feet(cardPosition(i,a+.75));
     const watch=[825,Math.max(470,slotY(i)+165)];
     if(age<1.15){const k=smooth(progress(age,.75,1.15));return {xy:[mix(dropped[0],watch[0],k),mix(dropped[1],watch[1],k)],grip:k<.85};}
     previous=watch;
   }
   const k=smooth(progress(u,8.4,9.15));
   return {xy:[mix(previous[0],817,k),mix(previous[1],831,k)],grip:false};
 }
 return {el:node,render(t){
   const u=t-slot.start;
   ctx.clearRect(0,0,1920,1080);front.clearRect(0,0,1920,1080);
   // Fainter light points travel more slowly than the documents, with short exposure trails.
   ctx.lineCap='round';
   for(let n=0;n<210;n++){
     const x=wrap(n*821.37 + u*(16+(n%11)*2.4),2050)-50;
     const y=156+wrap(n*647.22 + 40*Math.sin(x/320+n*.11),893);
     const strength=.12+.24*(.5+.5*Math.sin(n*.54+u*.33));
     ctx.globalAlpha=strength;ctx.lineWidth=.7+(n%4)*.28;ctx.strokeStyle=n%4===0?'#a0c5b1':'#79acb9';
     ctx.beginPath();ctx.moveTo(x-5-(n%7)*2,y+1.8);ctx.lineTo(x,y);ctx.stroke();
     ctx.fillStyle='#bcdbd3';ctx.fillRect(x,y,1.5,1.5);
   }
   for(let l=0;l<10;l++){
     ctx.globalAlpha=.19;ctx.strokeStyle=ink[l%5];ctx.lineWidth=1;ctx.beginPath();
     for(let x=-100;x<=2000;x+=18){const y=216+l*84+Math.sin(x/318+l*1.44+u*.28)*59+Math.sin(x/185+l*.3)*14+H/2; if(x===-100)ctx.moveTo(x,y);else ctx.lineTo(x,y);}ctx.stroke();
     for(let c=0;c<cols;c++){
       const pick=catches.find(p=>p.lane===l&&p.col===c);if(pick&&u>=pick.time)continue;
       const [x,y]=fieldPosition(l,c,u);if(x<-W||x>1920)continue;
       ctx.globalAlpha=(.64+.10*(l%3))*(1-.34*smooth(progress(u,8,9.3)));
       slip(ctx,l,c,x,y);
     }
   }
   const reveal=smooth(progress(u,.45,1.18));panel.style.opacity=reveal;
   papers.forEach((paper,i)=>{
     const c=catches[i],age=u-c.time,k=smooth(progress(age,.74,1.15));
     slotLabels[i].style.opacity=1-smooth(progress(age,.72,.82));
     for(const text of paper.children)text.style.opacity=smooth(progress(age,.93,1.15));
     paper.style.opacity=smooth(progress(age,.76,.96));paper.style.transform='scale('+mix(.15,1,k)+','+mix(.22,1,k)+')';
     if(age>=0&&age<1.15){const [x,y]=cardPosition(i,u);front.globalAlpha=1-smooth(progress(age,.75,.88));slip(front,c.lane,c.col,x,y,1);}
   });
   const p=actor(u);
   moss.draw({x:p.xy[0],y:p.xy[1],s:1,sx:-1,label:false,shadow:.2,alpha:smooth(progress(u,.12,.64)),action:p.grip?'present':u>8.65?'acknowledge':'attentive',actionTime:p.grip?2:u>8.65?1+Math.min(2.3,(u-8.65)*.8):1.65+.36*Math.sin(u)});
   count.style.opacity=smooth(progress(u,8.45,9.05));
   heading.textContent=u>8.65?'Ready for Ram’s morning brief':'Thousands of updates. Three that matter.';
 }};
}
