// Adapter for generated artwork. The film still owns all position/scale/entrance keys.
import metadata from './render-data.js';
const NS='http://www.w3.org/2000/svg';
export const W=260,H=78,LEG=50,STRIDE=48;
export const colors={body:'#24664c',bodyTop:'#34775a',bodyLow:'#123f30',edge:'#122c25',pill:'#f6f0df'};
export function defs(){}
const choice=()=>new URLSearchParams(location.search).get('mascot')||'moss';
export function iconSvg(kind=choice(),size=96){
 const c=metadata[kind];
 return `<img src="/art/avatars/${c.stem}.png" width="${size}" height="${size}" style="display:block;border-radius:${size*.27}px;object-fit:cover" alt="${c.name}, AI Peer"/>`;
}
export function buildTag(svg,{label="Ram’s AI Peer · AI"}={}){
 const c=metadata[choice()], [l,t,r,b]=c.bounds, k=180/(b-t), w=c.dimension*k;
 const root=document.createElementNS(NS,'g');svg.appendChild(root);
 root.innerHTML=`<ellipse cx="0" cy="3" rx="56" ry="7" fill="#173d30" opacity=".15"/><g class="art"><foreignObject x="${-(l+r)/2*k}" y="${-b*k}" width="${w}" height="${w}" style="overflow:visible"><div xmlns="http://www.w3.org/1999/xhtml" style="width:100%;height:100%">${c.motion?`<video data-mascot="${c.id||choice()}" data-motion-start="${c.motion_range?.[0]||0}" data-motion-end="${c.motion_range?.[1]||4.9}" src="/art/motion/${c.stem}.webm" muted playsinline preload="auto" style="display:block;width:100%;height:100%"></video>`:`<img src="/art/cutouts/${c.stem}.png" style="display:block;width:100%;height:100%"/>`}</div></foreignObject></g><g class="identity" transform="translate(0 16)"><rect x="-79" y="-13" width="158" height="24" rx="12" fill="#173f30" stroke="#e8eedb" stroke-opacity=".5"/><text x="0" y="3" text-anchor="middle" fill="#fff9e9" style="font:700 11.6px Manrope,Arial,sans-serif">Ram’s AI Peer · AI</text></g>`;
 const art=root.querySelector('.art'),shadow=root.querySelector('ellipse'),identity=root.querySelector('.identity');
 return {root,draw(p={}){
 const time=window.__mascotTime||0, s=p.s??1, alpha=p.alpha??1;
 root.setAttribute('transform',`translate(${p.x??0} ${p.y??0}) rotate(${p.rot||0}) scale(${s*(p.sx??1)} ${s*(p.sy??1)})`);
 root.setAttribute('opacity',alpha);root.style.display=alpha>.002?'':'none';
 const composed=!c.motion?Math.sin(time*1.6)*1.8:0;
 art.setAttribute('transform',`translate(0 ${composed-(p.lift||0)})`);
 shadow.setAttribute('opacity',String((p.shadow??1)*.15));
 identity.style.display=p.label===false?'none':'';
 }};
}
