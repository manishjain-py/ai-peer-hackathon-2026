// Twelve original, code-drawn characters. All geometry is deterministic in film time.
// Same anchor/pose interface as the approved tag. No source image is altered.
const C={ink:'#123f30',green:'#24664c',mint:'#bde6ca',cream:'#f6f0df',paper:'#fff9e9',amber:'#d8a64d',dark:'#122c25'};
const clamp=(v,a=0,b=1)=>Math.max(a,Math.min(b,v));
const f=v=>Number(v).toFixed(3);
const P=(d,fill,extra='')=>`<path d="${d}" fill="${fill}" ${extra}/>`;
const L=(d,stroke=C.ink,w=2,extra='')=>`<path d="${d}" fill="none" stroke="${stroke}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" ${extra}/>`;
const E=(x,y,rx,ry,fill,extra='')=>`<ellipse cx="${x}" cy="${y}" rx="${rx}" ry="${ry}" fill="${fill}" ${extra}/>`;
const G=(body,tf='',extra='')=>`<g transform="${tf}" ${extra}>${body}</g>`;
export const W=260,H=78,LEG=50,STRIDE=48;
export const colors={body:C.green,bodyTop:'#34775a',bodyLow:C.ink,edge:C.dark,pill:C.cream};
export function defs(){return null;}
function gradientDefs(id){return `<defs>
 <linearGradient id="${id}green" x1=".08" y1="0" x2=".85" y2="1"><stop stop-color="#4d9471"/><stop offset=".42" stop-color="#28694f"/><stop offset="1" stop-color="#123f30"/></linearGradient>
 <linearGradient id="${id}paper" x1=".1" y1="0" x2=".9" y2="1"><stop stop-color="#fffdf2"/><stop offset=".6" stop-color="#f3eddc"/><stop offset="1" stop-color="#c8c9ad"/></linearGradient>
 <linearGradient id="${id}mint" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#e3f4dd"/><stop offset="1" stop-color="#81ba9a"/></linearGradient>
 <linearGradient id="${id}gold" x1="0" y1="0" x2="1" y2="1"><stop stop-color="#f8d68a"/><stop offset=".4" stop-color="#dbb060"/><stop offset="1" stop-color="#9b773a"/></linearGradient>
 <radialGradient id="${id}light" cx=".42" cy=".34" r=".7"><stop stop-color="#fff8d8"/><stop offset=".5" stop-color="#f1cc75"/><stop offset="1" stop-color="#cb9039"/></radialGradient>
 <radialGradient id="${id}stone" cx=".3" cy=".2" r=".9"><stop stop-color="#87ad8f"/><stop offset=".42" stop-color="#416e56"/><stop offset="1" stop-color="#183e30"/></radialGradient>
 <radialGradient id="${id}shadow"><stop stop-color="#123626" stop-opacity=".27"/><stop offset="1" stop-color="#123626" stop-opacity="0"/></radialGradient>
 <filter id="${id}soft" x="-35%" y="-35%" width="170%" height="180%"><feDropShadow dx="0" dy="4" stdDeviation="3" flood-color="#153c2d" flood-opacity=".15"/></filter>
 </defs>`;}
function eyes(x,y,space,size,p,{dark=false,oval=1}={}){
 const b=clamp(p.blink||0),h=clamp(p.happy||0),look=p.look||[0,0];
 return [-1,1].map(sd=>{
  const xx=x+sd*space, yy=y;
  if(b>.86)return L(`M ${xx-size*.58} ${yy+1} Q ${xx} ${yy-2.3-h*2} ${xx+size*.58} ${yy+1}`,dark?C.paper:C.dark,2.6);
  const sy=Math.max(.04,1-b*.95);
  return G(E(xx,yy,size,size*oval,dark?C.ink:C.paper)+E(xx+look[0]*size*.3,yy+look[1]*size*.22,size*.40,size*.49,dark?C.paper:C.dark)+E(xx+look[0]*size*.3-size*.12,yy+look[1]*size*.22-size*.20,size*.12,size*.12,dark?C.mint:'#fff'),`translate(0 ${f(yy)}) scale(1 ${f(sy)}) translate(0 ${f(-yy)})`);
 }).join('');
}
function smile(x,y,width=8,col=C.ink){return L(`M ${x-width} ${y} Q ${x} ${y+5} ${x+width} ${y}`,col,2.3);}
function ai(x,y,id,scale=1){return G(`<rect x="-17" y="-9" width="34" height="18" rx="9" fill="${C.cream}" stroke="${C.green}" stroke-opacity=".14"/><text x="0" y="4.2" text-anchor="middle" fill="${C.ink}" style="font:800 11px Manrope,Arial,sans-serif;letter-spacing:.8px">AI</text>`,`translate(${x} ${y}) scale(${scale})`);}
function feet(t,p,x=30){const walk=(p.stride||0)*Math.sin((p.walk||0)*Math.PI);return [-1,1].map(sd=>G(P(`M ${-10} -5 Q 0 -15 16 -7 L 20 -2 Q 18 4 2 3 Q -12 3 -10 -5`,C.ink),`translate(${sd*x} ${-8+Math.min(0,sd*walk*7)}) rotate(${sd*walk*12})`)).join('');}
const artists={
 folio(t,p,id){const g=`url(#${id}green)`,paper=`url(#${id}paper)`;const flap=Math.sin(t*2.4)*3;
 return G(P('M -65 -156 Q -65 -168 -52 -168 L 38 -168 L 67 -136 L 67 -45 Q 67 -31 53 -31 L -52 -31 Q -65 -31 -65 -45 Z',g)+
 G(P('M -53 -163 L 35 -163 L 61 -135 L 61 -44 Q 61 -38 52 -38 L -53 -38 Z',paper)+P('M 35 -163 L 35 -137 Q 35 -130 43 -132 L 61 -135 Z','#d5dfc5')+L('M 35 -163 L 35 -137 L 61 -135','#b6c5aa',1.7),`rotate(${flap} -56 -104)`)+
 P('M -65 -145 L -78 -130 L -78 -54 Q -76 -42 -65 -42 Z','#174b37')+L('M -59 -153 L -59 -48','#8cb49b',2)+
 eyes(3,-103,18,10.8,p,{dark:true})+smile(3,-83)+L('M -30 -64 H 14',C.green,3)+L('M -30 -55 H 2','#9aaf91',2)+ai(37,-56,id,.8)+
 G(P('M -71 -74 Q -108 -60 -103 -44 Q -99 -37 -88 -48 L -63 -58 Z',g),`rotate(${-8+Math.sin(t*2.7)*5} -65 -73)`)+
 G(P('M 64 -76 Q 92 -92 96 -75 Q 98 -65 68 -59 Z',g),`rotate(${Math.sin(t*2.7)*5} 65 -73)`)+feet(t,p,37));},
 swift(t,p,id){const wing=Math.sin(t*3)*9;
 return G(G(P('M -20 -91 L -114 -159 L -93 -86 L -35 -66 Z',`url(#${id}paper)`)+P('M -114 -159 L -55 -93 L -93 -86 Z','#d8e1cc')+L('M -108 -153 L -35 -75','#a7c1a5',1.5),`rotate(${-wing} -20 -88)`)+
 G(P('M 5 -92 L 102 -171 L 73 -72 L 31 -61 Z',`url(#${id}green)`)+P('M 102 -171 L 28 -76 L 73 -72 Z','#4f8e6a')+L('M 92 -153 L 31 -79','#9ec6a1',1.5),`rotate(${wing} 10 -91)`)+
 P('M -22 -97 Q 0 -120 28 -106 L 61 -76 L 28 -71 Q 4 -30 -31 -48 L -69 -30 L -51 -60 Q -64 -84 -22 -97 Z',`url(#${id}paper)`)+
 P('M -31 -48 L -69 -30 L -51 -60 L -17 -73 Z',C.green)+P('M 45 -82 L 69 -76 L 47 -68 Z',`url(#${id}gold)`)+
 eyes(9,-82,12,8,p,{dark:true})+ai(-6,-49,id,.7)+L('M -23 -92 Q 0 -99 22 -96','#fffef5',2));},
 sable(t,p,id){const ear=Math.sin(t*1.8)*3;
 return G(G(P('M -42 -54 Q -103 -53 -110 -91 Q -116 -121 -83 -132 Q -85 -95 -47 -94 Z',`url(#${id}green)`)+P('M -109 -91 Q -116 -121 -83 -132 Q -83 -114 -81 -104 Z',`url(#${id}paper)`),`rotate(${Math.sin(t*2)*5} -44 -57)`)+
 P('M -48 -105 Q -59 -53 -33 -22 Q 0 -11 42 -25 Q 56 -55 43 -102 Z',`url(#${id}green)`)+
 G(P('M -54 -114 L -63 -178 L -18 -145 Z',C.ink)+P('M -49 -127 L -53 -162 L -27 -142 Z',`url(#${id}paper)`),`rotate(${ear} -36 -125)`)+
 G(P('M 22 -144 L 65 -179 L 54 -111 Z',C.green)+P('M 31 -143 L 55 -163 L 48 -125 Z',`url(#${id}paper)`),`rotate(${-ear} 38 -126)`)+
 P('M -54 -137 Q 0 -166 54 -137 L 58 -104 L 0 -58 L -58 -104 Z',`url(#${id}green)`)+
 P('M -58 -104 L -40 -128 L 0 -101 L 40 -128 L 58 -104 L 0 -58 Z',`url(#${id}paper)`)+
 eyes(0,-108,23,8,p,{dark:true})+P('M -8 -80 Q 0 -88 8 -80 L 0 -73 Z',C.dark)+L('M 0 -74 L 0 -67',C.ink,1.5)+ai(2,-34,id,.9)+feet(t,p,29));},
 nox(t,p,id){const flap=Math.sin(t*2.2)*3;
 return G(P('M -56 -122 Q -65 -162 -31 -171 Q 0 -158 31 -171 Q 65 -162 56 -122 L 65 -67 Q 57 -22 0 -21 Q -57 -22 -65 -67 Z',`url(#${id}green)`)+
 G(P('M -53 -119 Q -89 -107 -76 -59 Q -66 -46 -50 -53 L -36 -92 Z',C.ink)+L('M -67 -98 Q -67 -75 -56 -66','#63977b',2),`rotate(${-flap} -49 -117)`)+
 G(P('M 53 -119 Q 89 -107 76 -59 Q 66 -46 50 -53 L 36 -92 Z',C.green)+L('M 67 -98 Q 67 -75 56 -66','#63977b',2),`rotate(${flap} 49 -117)`)+
 P('M 0 -131 Q -53 -163 -51 -111 Q -47 -77 0 -72 Q 47 -77 51 -111 Q 53 -163 0 -131 Z',`url(#${id}paper)`)+
 eyes(0,-115,23,15.5,p,{dark:true})+P('M -6 -98 L 6 -98 L 0 -86 Z',`url(#${id}gold)`)+
 L('M -22 -63 L -18 -59 M -2 -63 L 2 -59 M 18 -63 L 22 -59','#99b7a0',2)+ai(0,-41,id,.9)+feet(t,p,28));},
 loop(t,p,id){const b=Math.sin(t*1.8)*3;const a=`rotate(${b} 0 -95)`;
 return G(G(L('M -11 -67 C -127 -16 -126 -166 -44 -161 C 12 -158 8 -70 45 -50 C 105 -14 135 -131 65 -145 C 17 -159 6 -90 -17 -62',`url(#${id}green)`,29)+
 L('M -18 -70 C -112 -26 -114 -152 -44 -151 C 2 -147 8 -68 49 -48 C 99 -25 119 -120 65 -133',`url(#${id}mint)`,7)+
 P('M -38 -118 Q 0 -138 39 -117 L 31 -72 Q 0 -51 -31 -73 Z',`url(#${id}paper)`)+eyes(0,-101,15,9,p,{dark:true})+smile(0,-82)+ai(0,-47,id,.7),a)+
 E(-75+Math.cos(t*2.2)*16,-100+Math.sin(t*2.2)*28,5,5,C.amber)+L('M -7 -139 Q 3 -150 12 -143',C.paper,2));},
 pip(t,p,id){const leaf=Math.sin(t*2.3)*6;
 return G(L('M 0 -115 Q -8 -140 1 -158',C.ink,6)+
 G(P('M -2 -143 C -51 -190 -75 -170 -51 -143 Q -32 -125 -2 -143 Z',`url(#${id}green)`)+L('M -49 -158 L -5 -143','#a7cfab',1.7),`rotate(${-leaf} -2 -142)`)+
 G(P('M 1 -152 C 19 -199 65 -183 48 -152 Q 32 -133 1 -152 Z',`url(#${id}mint)`)+L('M 3 -152 L 41 -173','#3b7757',1.7),`rotate(${leaf} 1 -152)`)+
 P('M -52 -119 C -83 -82 -61 -24 -4 -20 C 53 -19 79 -70 49 -113 Q 15 -148 -52 -119 Z',`url(#${id}paper)`)+
 P('M -54 -109 Q -73 -73 -47 -42 Q -31 -25 -4 -20 Q -49 -22 -62 -56 Q -72 -90 -54 -109 Z','#c5d0b3')+
 eyes(0,-87,22,10,p,{dark:true})+smile(0,-66,7)+ai(8,-38,id,.86)+E(-34,-107,13,6,'#fffef6','opacity=".65"')+feet(t,p,25));},
 cairn(t,p,id){const ang=Math.sin(t*1.6)*3;
 return G(G(P('M -72 -75 C -83 -115 -36 -155 16 -154 C 58 -152 88 -114 74 -68 C 61 -25 7 -16 -41 -31 Q -69 -44 -72 -75 Z',`url(#${id}stone)`)+
 P('M -42 -120 C -65 -95 -47 -54 -7 -54 C 27 -52 54 -76 47 -102 Q 17 -140 -42 -120 Z',`url(#${id}paper)`)+
 eyes(0,-94,19,10,p,{dark:true})+smile(0,-73)+L('M 28 -148 L 19 -132 L 30 -119 L 23 -106',`url(#${id}gold)`,2.8)+
 ai(-7,-37,id,.8)+E(-27,-137,20,5,'#bbd1af','opacity=".35"'),`rotate(${ang} 0 -25)`)+
 G(P('M -14 -12 Q -22 -31 -6 -36 Q 15 -40 20 -22 Q 17 -7 -14 -12 Z',`url(#${id}paper)`),`translate(${84+Math.cos(t*1.1)*7} ${-92+Math.sin(t*1.1)*13}) rotate(${Math.sin(t)*12})`));},
 luma(t,p,id){const flutter=Math.sin(t*7)*7;
 return G(G(P('M -31 -112 C -97 -173 -114 -118 -80 -88 Q -58 -72 -31 -84 Z',`url(#${id}paper)`)+L('M -88 -126 L -36 -94','#b4c7ac',1.4),`rotate(${-flutter} -30 -96)`)+
 G(P('M 31 -112 C 97 -173 114 -118 80 -88 Q 58 -72 31 -84 Z',`url(#${id}paper)`)+L('M 88 -126 L 36 -94','#b4c7ac',1.4),`rotate(${flutter} 30 -96)`)+
 L('M -20 -140 C -20 -172 20 -172 20 -140',`url(#${id}gold)`,7)+
 P('M -36 -134 Q 0 -148 36 -134 L 48 -62 Q 39 -35 0 -33 Q -39 -35 -48 -62 Z',`url(#${id}light)`)+
 P('M -36 -134 Q 0 -148 36 -134 L 42 -120 Q 0 -113 -42 -120 Z',`url(#${id}green)`)+
 L('M -36 -125 L -29 -61 Q 0 -48 29 -61 L 36 -125',C.green,4)+P('M -44 -62 Q 0 -49 44 -62 L 35 -37 Q 0 -28 -35 -37 Z',`url(#${id}green)`)+
 eyes(0,-94,17,9,p,{dark:true})+smile(0,-75,6)+ai(0,-45,id,.7)+E(-18,-112,6,13,'#fff6d2','opacity=".5"'));},
 north(t,p,id){const angle=Math.sin(t*1.5)*12;
 return G(L('M -20 -147 Q -19 -174 0 -174 Q 19 -174 20 -147',`url(#${id}gold)`,7)+
 E(0,-92,72,72,`url(#${id}gold)`)+E(0,-92,64,64,C.ink)+E(0,-92,57,57,`url(#${id}paper)`)+
 Array.from({length:12},(_,i)=>G(L('M 0 -153 L 0 -147',i%3? '#96ac8e':C.green,i%3?1.4:2.5),`rotate(${i*30} 0 -92)`)).join('')+
 G(P('M 0 -142 L 12 -96 L 0 -43 L -12 -96 Z',`url(#${id}green)`)+P('M 0 -142 L 0 -92 L -12 -96 Z','#8bb69a')+E(0,-92,17,17,`url(#${id}paper)`),`rotate(${angle} 0 -92)`)+
 eyes(0,-97,18,8,p,{dark:true})+smile(0,-77,6)+ai(0,-40,id,.8)+L('M -48 -133 Q -64 -113 -59 -90','#fff0b4',2));},
 manta(t,p,id){const wing=Math.sin(t*2.4)*7;
 return G(G(P('M -7 -105 Q -51 -138 -126 -119 Q -116 -74 -43 -55 L -10 -66 Z',`url(#${id}paper)`)+P('M -126 -119 L -43 -55 L -63 -91 Z','#a9c6aa')+L('M -118 -117 L -22 -80','#c5d3b7',1.7),`rotate(${-wing} -8 -94)`)+
 G(P('M 7 -105 Q 51 -138 126 -119 Q 116 -74 43 -55 L 10 -66 Z',`url(#${id}paper)`)+P('M 126 -119 L 43 -55 L 63 -91 Z','#a9c6aa')+L('M 118 -117 L 22 -80','#c5d3b7',1.7),`rotate(${wing} 8 -94)`)+
 L(`M 4 -62 Q 16 -28 ${-18+Math.sin(t*2)*12} -8 Q -33 5 -43 -2`,C.green,5)+
 P('M -27 -111 Q 0 -142 27 -111 L 34 -74 Q 0 -45 -34 -74 Z',`url(#${id}green)`)+eyes(0,-95,14,9,p)+
 smile(0,-77,5,C.cream)+ai(0,-57,id,.66));},
 tandem(t,p,id){const rot=Math.sin(t*1.8)*7;
 return G(G(L('M 13 -152 C -61 -193 -102 -85 -44 -53 C -10 -35 10 -62 16 -81',`url(#${id}green)`,30)+L('M 13 -149 C -49 -181 -83 -96 -48 -68',`url(#${id}mint)`,5),`rotate(${rot} 0 -99)`)+
 G(L('M -13 -46 C 61 -5 102 -113 44 -145 C 10 -163 -10 -136 -16 -117',`url(#${id}paper)`,30)+L('M -12 -47 C 50 -16 83 -99 48 -130','#c1cbb0',4),`rotate(${-rot} 0 -99)`)+
 P('M -32 -116 Q 0 -135 32 -116 L 32 -86 Q 0 -65 -32 -86 Z',C.green)+eyes(0,-104,14,8.5,p)+smile(0,-87,5,C.paper)+ai(0,-32,id,.8));},
 post(t,p,id){const flap=Math.sin(t*1.9)*3;
 return G(P('M -76 -130 Q -79 -139 -66 -143 L 63 -143 Q 77 -142 77 -129 L 77 -50 Q 76 -36 64 -36 L -64 -36 Q -77 -38 -77 -50 Z',`url(#${id}green)`)+
 P('M -69 -132 L 67 -132 L 67 -49 Q 67 -43 61 -43 L -62 -43 Q -69 -43 -69 -49 Z',`url(#${id}paper)`)+
 G(P('M -69 -132 L 0 -76 L 67 -132 Z',`url(#${id}green)`)+P('M -69 -132 L 0 -90 L 67 -132 L 0 -111 Z','#44876a')+L('M -61 -129 L 0 -82 L 60 -129','#90b69b',1.4),`rotate(${flap} 0 -129)`)+
 L('M -68 -47 L -20 -88 M 68 -47 L 20 -88','#b5c5a7',2)+eyes(0,-100,19,9,p)+
 E(0,-69,13,13,`url(#${id}gold)`)+P('M -4 -73 L 2 -73 L -1 -65 L -7 -65 Z',C.paper)+ai(44,-53,id,.65)+feet(t,p,43));}
};
export function characterMarkup(kind='folio',time=0,pose={},prefix='mc'){
 const p={look:[0,0],happy:.4,...pose};
 const geometry=artists[kind]||artists.folio;
 const alpha=p.alpha??1, x=p.x??0,y=p.y??0,s=p.s??1;
 const stride=p.stride??0, walk=p.walk??0;
 const lift=p.lift??0;
 const bob=stride*Math.abs(Math.sin(walk*Math.PI))*2;
 const idle=Math.sin(time*1.6)*1.3;
 const ground=(p.shadow??1);
 const logo=p.logo||false;
 const label=p.label===false||logo?'':`<g transform="translate(0 13)"><rect x="-66" y="-13" width="132" height="24" rx="12" fill="${C.ink}" stroke="#e8eedb" stroke-width="1" stroke-opacity=".42"/><text x="0" y="3" text-anchor="middle" fill="${C.paper}" style="font:700 12.2px Manrope,Arial,sans-serif;letter-spacing:-.1px">Ram’s AI Peer</text></g>`;
 // Different characters keep the same film anchor and nominal occupied area.
 const factors={folio:.88,swift:.92,sable:.87,nox:.86,loop:.92,pip:.88,cairn:.96,luma:.9,north:.88,manta:.94,tandem:.9,post:.93};
 const k=(factors[kind]||1)*(p.size||1);
 return gradientDefs(prefix)+G(
  (!logo?E(0,4,93,10,`url(#${prefix}shadow)`,`opacity="${f(ground*.8)}"`):'')+
  G(geometry(time,p,prefix),`translate(0 ${f(-lift-bob+idle)}) scale(${f(k)})`,`filter="url(#${prefix}soft)"`)+label,
  `translate(${f(x)} ${f(y)}) rotate(${f(p.rot||0)}) scale(${f(s*(p.sx??1))} ${f(s*(p.sy??1))})`,`opacity="${f(clamp(alpha))}"`);
}
export function iconSvg(kind,size=96,prefix='icon'){
 return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 100 100"><rect x="1" y="1" width="98" height="98" rx="29" fill="#bde7ca"/>${characterMarkup(kind,0,{x:50,y:87,s:.45,shadow:0,label:false,logo:true,look:[.15,-.1]},prefix)}</svg>`;
}
let counter=0;
export function buildTag(svg,{label="Ram's AI Peer"}={}){
 const root=document.createElementNS('http://www.w3.org/2000/svg','g');
 svg.appendChild(root);const prefix=`mc${++counter}`;
 const kind=new URLSearchParams(location.search).get('mascot')||window.__mascotChoice||'folio';
 return {root,draw(p={}){root.innerHTML=characterMarkup(kind,window.__mascotTime||0,{...p,label:true},prefix);}};
}
