// Moss 25: selected generated wool art, with separate genuine greeting, attentive and
// presentation takes. Position/camera timing remains owned by the approved scene code.
const NS='http://www.w3.org/2000/svg';
const asset=name=>new URL('./moss-assets/'+name,import.meta.url).href;
export const W=260,H=78,LEG=50,STRIDE=48;
export const colors={body:'#24664c',bodyTop:'#34775a',bodyLow:'#123f30',edge:'#122c25',pill:'#f6f0df'};
export function defs(){}
export function iconSvg(_kind,size=96){return `<img src="${asset('avatar.png')}" width="${size}" height="${size}" style="display:block;border-radius:${size*.27}px;object-fit:cover" alt="Moss, AI Peer"/>`;}
import {filmActing} from './acting.js';
export function buildTag(svg,{label="Ram's AI Peer",height=180}={}){
 const root=document.createElementNS(NS,'g');root.classList.add('moss-actor');svg.appendChild(root);
 const k=height/644,w=768*k;
 root.innerHTML=`<ellipse cx="0" cy="3" rx="56" ry="7" fill="#173d30" opacity=".15"/><image class="dormant" href="${asset('avatar.png')}" x="-44" y="-88" width="88" height="88"/><g class="art"><foreignObject x="${-363*k}" y="${-702*k}" width="${w}" height="${w}" style="overflow:visible"><div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%;position:relative">${['wave','attentive','present','notebook','listen','reassure','acknowledge','type','stamp','speak-m1','speak-m2','speak-m4b','speak-write'].map(name=>`<video data-moss="${name}" src="${asset(name+'.webm')}" muted playsinline preload="auto" style="position:absolute;display:none;width:100%;height:100%"></video>`).join('')}</div></foreignObject></g><g class="identity" transform="translate(0 16)"><rect x="-79" y="-13" width="158" height="24" rx="12" fill="#173f30" stroke="#e8eedb" stroke-opacity=".5"/><text x="0" y="3" text-anchor="middle" fill="#fff9e9" style="font:700 11.6px Manrope,Inter,Arial,sans-serif">${label} · AI</text></g>`;
 const dormant=root.querySelector('.dormant'),art=root.querySelector('.art'),shadow=root.querySelector('ellipse'),identity=root.querySelector('.identity');
 const videos=[...root.querySelectorAll('video')];
 return {root,draw(p={}){
 const time=window.__mascotTime||0,s=p.s??1,alpha=p.alpha??1;
 root.setAttribute('transform',`translate(${p.x??0} ${p.y??0}) rotate(${p.rot||0}) scale(${s*(p.sx??1)} ${s*(p.sy??1)})`);
 root.setAttribute('opacity',alpha);root.style.display=alpha>.002?'':'none';
 const awake=Math.max(0,Math.min(1,p.eyes??1));
 art.setAttribute('opacity',awake);dormant.setAttribute('opacity',1-awake);dormant.style.display=awake>=1?'none':'';
 
 shadow.setAttribute('opacity',String((p.shadow??1)*.15));identity.style.display=p.label===false?'none':'';
 identity.setAttribute('transform',`translate(0 ${16-(p.lift||0)})`);
 const act=p.action?p:filmActing(time);
 art.setAttribute('transform',`translate(0 ${-(p.lift||0)})`);
 for(const v of videos){const active=v.dataset.moss===act.action,previous=act.previousAction===v.dataset.moss;v.style.display=active||previous?'block':'none';v.style.opacity=String(active?(act.actionBlend??1):previous?1-(act.actionBlend??1):0);v.style.transform=v.dataset.moss==='present'?'scaleX(-1)':'';if(active||previous)v.dataset.at=String(Math.max(.04,Math.min(v.dataset.moss.startsWith("speak")?14.8:4.8,active?act.actionTime:act.previousTime)));}
 }};
}
