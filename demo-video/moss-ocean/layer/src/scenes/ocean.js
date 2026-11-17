// V39 restores the original deterministic company-information space. Its depth, rivers,
// mail/Slack/tool sprites and incoming-light machinery come directly from the base world.
import {world} from './world.js';
import {el,ramp,ease,lerp} from '../lib.js';
import {buildTag} from '../mascot/tag/mascot.js';
export async function create(slot,film){
 const S=await (await fetch('assets/ocean-world.json')).json();
 S.peer_face='assets/screens/peer-face-moss.png';S.chapter=null;S.labels=[];
 S.beats={lit:1,listen:2.1,pull:[3.8,7.2],pick:6.4,open:[4.1,4.8],brief:[12.8,14.4],fade:[8,16],warm:[12.8,16]};
 const flood=world(S,film,slot);flood.node.classList.add('ocean-world');
 // Keep the original world's complete canvas engine; V39 owns the explanatory foreground.
 [...flood.node.children].filter(n=>n.tagName!=='CANVAS').forEach(n=>n.style.visibility='hidden');
 const style=el('style',{text:`.ocean{position:absolute;inset:0;overflow:hidden}.ocean-title{position:absolute;left:104px;top:70px;color:#f8f6eb;font:750 54px/1.12 Manrope;letter-spacing:-1.7px}.ocean-sub{position:absolute;left:108px;top:144px;color:#bdd6cd;font:600 25px Manrope}.ocean-sources{position:absolute;left:108px;top:199px;display:flex;gap:13px;color:#ddede7;font:650 18px Manrope}.ocean-sources span{border:1px solid #b7f4cf44;border-radius:20px;background:#10272f88;padding:8px 14px}.ocean-profile{position:absolute;left:830px;top:205px;color:#e0efe8;font:650 24px Manrope}.ocean-briefbox{position:absolute;left:800px;top:190px;width:990px;height:610px;border:2px solid #bae2cc88;border-radius:26px;background:#143e3899;box-shadow:0 25px 90px #0004}.ocean-card{position:absolute;left:830px;width:930px;height:164px;box-sizing:border-box;border:1px solid #bde9d276;border-radius:18px;background:#142d33bb;overflow:hidden;box-shadow:0 12px 30px #0003}.ocean-match{position:absolute;left:0;right:0;top:0;height:48px;padding:9px 22px;font:750 24px Manrope;letter-spacing:1.2px;color:#c6ead9;background:#24574699}.ocean-detail{position:absolute;left:0;right:0;top:48px;bottom:0;padding:17px 22px;background:#f4f3e8;color:#18382d}.ocean-detail b{display:block;font:750 31px/1.15 Manrope;letter-spacing:-.6px}.ocean-detail span{display:block;font:550 22px/1.3 Manrope;color:#496156;margin-top:9px}.ocean-result{position:absolute;left:114px;top:710px;color:#d2eadc;font:650 27px/1.4 Manrope;max-width:575px}.ocean-count{font:800 54px Manrope;color:#eff6e7}.ocean-lines{position:absolute;inset:0;pointer-events:none}.ocean-mask{position:absolute;inset:0;background:linear-gradient(180deg,#061117ef 0px,#061117c9 190px,transparent 310px),linear-gradient(0deg,#0e282c99,transparent 35%)}`});
 const title=el('div.ocean-title'),sub=el('div.ocean-sub');
 const sources=el('div.ocean-sources',{},['Email','Slack','Code','Tickets','Docs','Meetings','Web'].map(x=>el('span',{text:x})));
 const briefbox=el('div.ocean-briefbox');const profile=el('div.ocean-profile');
 const defs=[
 ['ROLE · Payments engineer','Brazil fraud threshold changes Thursday','More payout holds may look like retry failures.',4.0],
 ['GOAL · Reliable Brazil launch','Brazil launch review · 9:00 AM','Your go/no-go decision is needed.',5.0],
 ['INTERESTS · Retry reliability','Retry recovery · 92% within 6 hours','The bank outage is traced. Retry logic is ruled out.',6.0]
 ];
 const cards=defs.map((d,i)=>{const label=el('div.ocean-match',{text:d[0]});const detail=el('div.ocean-detail',{},el('b',{text:d[1]}),el('span',{text:d[2]}));const node=el('div.ocean-card',{style:{top:`${252+i*177}px`}},label,detail);return{node,label,detail,i,at:d[3]};});
 const result=el('div.ocean-result');
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 1920 1080');svg.classList.add('ocean-lines');
 const paths=cards.map(()=>{const p=document.createElementNS('http://www.w3.org/2000/svg','path');p.setAttribute('fill','none');p.setAttribute('stroke','#c4f2d7');p.setAttribute('stroke-width','3');svg.append(p);return p;});
 const moss=buildTag(svg,{height:360});
 const node=el('div.scene.ocean',{},style,flood.node,el('div.ocean-mask'),briefbox,title,sub,sources,svg,profile,...cards.map(x=>x.node),result);
 return{el:node,render(t){
  const u=t-slot.start,select=ease.inOut(ramp(u,3.5,4.1)),brief=ease.inOut(ramp(u,7.65,8.35));flood.render(u*1.6);
  title.textContent=brief>.5?'Ready for Ram’s morning brief':select>.5?'What matters to Ram':'Across the company, all night';
  sub.textContent=select>.5?'Matched to his role, goals and interests':'Thousands of updates. One AI teammate making sense of them.';
  sources.style.opacity=1-select;sources.style.transform=`translateY(${-12*select}px)`;
  const loc=flood.node.querySelector('.wpeer').style.transform.match(/translate\(([-.\d]+)px, ([-.\d]+)px\) scale\(([-.\d]+)\)/);
  const x=loc?Number(loc[1]):960,k=loc?Number(loc[3]):1,y=(loc?Number(loc[2]):500)+155;
  const awake=ease.out(ramp(u,.85,1.45));
  moss.draw({x,y,s:lerp(.78,1,select),alpha:awake,label:true,action:u<3.9?'attentive':'present',actionTime:u<3.9?Math.min(4.5,.8+u*.7):Math.min(4.8,.6+(u-3.9)*.7)});
  profile.textContent=brief>.5?'YOUR MORNING BRIEF · 3 RELEVANT UPDATES':'RAM’S WORK · THE RELEVANCE FILTER';profile.style.opacity=ease.out(ramp(u,2.7,3.3));
  briefbox.style.opacity=brief;
  cards.forEach((c,i)=>{const rail=ease.out(ramp(u,2.75+i*.12,3.3+i*.12)),found=ease.out(ramp(u,c.at,c.at+.5));c.node.style.opacity=rail;c.node.style.transform=`translateX(${(1-rail)*90}px)`;c.detail.style.transform=`translateY(${(1-found)*120}px)`;c.detail.style.opacity=found;c.node.style.borderColor=found>.5?'#bde9d2':'#bde9d244';c.node.style.boxShadow=`0 12px 30px #0003,0 0 ${20*Math.sin(Math.PI*ramp(u,c.at,c.at+.75))}px #c8ffdd66`;const yy=252+i*177+75;paths[i].setAttribute('d',`M${x+95},${y-150} Q${x+230},${yy-40} 830,${yy}`);paths[i].setAttribute('opacity',String(ease.out(ramp(u,c.at-.25,c.at+.2))*(1-brief*.65)*.65));});
  result.style.opacity=ease.out(ramp(u,6.5,7.2));result.innerHTML=brief>.5?'<span class="ocean-count">Ready when he wakes.</span>': '<span class="ocean-count">3 useful updates.</span><br>The rest stays in the background.';
 }};
}
