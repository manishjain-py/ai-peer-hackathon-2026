import React from 'react';

const clamp=(x:number)=>Math.max(0,Math.min(1,x));
const blend=(t:number,a:number,b:number)=>{const u=clamp((t-a)/(b-a));return u*u*u*(u*(u*6-15)+10);};
const mix=(a:number,b:number,u:number)=>a+(b-a)*u;
const bump=(t:number,a:number,b:number)=>Math.sin(Math.PI*blend(t,a,b));
const skin='#d99b78',ink='#273e39',hair='#303735',sleeve='#d9936f';

/** Original employee, with planted steps, articulated sitting and delayed gaze. Not a likeness. */
export function Employee06({t,relief=0,lookX,lookY}:{t:number;relief?:number;lookX?:number;lookY?:number}){
 const seated=blend(t,2.85,4.08);
 const walkLeft=420+230*blend(t,.12,.72)+280*blend(t,1.43,2.03);
 const walkRight=480+320*blend(t,.78,1.38)+210*blend(t,2.09,2.69);
 const walkLiftL=30*(bump(t,.12,.72)+bump(t,1.43,2.03));
 const walkLiftR=30*(bump(t,.78,1.38)+bump(t,2.09,2.69));
 const center=mix((walkLeft+walkRight)/2,966,blend(t,2.69,3.25));
 const walk=1-blend(t,2.58,2.88);
 const energy=1-blend(t,6,9);
 const pressure=(.09*blend(t,5.7,6.5)+.23*blend(t,8.75,9.75)+.25*blend(t,12.25,13.2)+.24*blend(t,15.75,17.2)+.19*blend(t,19.75,21))*(1-relief);
 const breathe=(1.3+pressure*.9)*Math.sin(t*(2.05+pressure*.65));
 const landing=bump(t,3.8,4.5)*7;
 const bodyY=128*seated-6*(walkLiftL+walkLiftR)/30+landing+pressure*15+breathe;
 const hipY=654+126*seated+landing+pressure*4;
 const headY=375+bodyY;
 const headTilt=mix(-5,0,blend(t,2.65,4.5))+Math.sin(t*1.7)*.5+pressure*3-relief*2;
 const lookTurns=[{at:4.25,x:.08,y:.65},{at:5.72,x:.9,y:-.48},{at:8.73,x:-.95,y:-.5},{at:12.24,x:.95,y:.42},{at:15.76,x:-.92,y:.52},{at:19.73,x:0,y:-.92},{at:21.1,x:.8,y:.25},{at:21.85,x:-.72,y:.25},{at:22.7,x:.16,y:.62}];
 let gx=.58,gy=-.04;
 for(const g of lookTurns){const q=blend(t,g.at,g.at+.48);gx=mix(gx,g.x,q);gy=mix(gy,g.y,q);}
 gx=lookX??mix(gx,.1,relief);gy=lookY??mix(gy,.55,relief);
 const headX=gx*5*(1-walk);
 const blinkTimes=[.32,2.83,4.22,7.2,8.66,11.2,12.17,15.66,18.3,19.63,21.83,23.5,25.5,28.2];
 let eyeOpen=1;for(const bt of blinkTimes)eyeOpen*=1-.94*bump(t,bt,bt+.17);
 const eyeY=6+gy*2;
 const typing=blend(t,4.7,5.1)*(1-blend(t,8.5,9.3))*(1-relief)+relief*.45;
 const typeL=Math.sin(t*14)*2.3*typing,typeR=Math.sin(t*14+2)*2.3*typing;
 const temple=blend(t,15.95,16.85)*(1-blend(t,18.2,19.15))*(1-relief);
 const laptopGesture=blend(t,3.9,4.23)*(1-blend(t,4.45,4.8));
 const settleHand=blend(t,22,22.5)*(1-relief);
 const armSwing=(walkLiftL-walkLiftR)*.8*walk;
 const shoulderY=504+bodyY-pressure*10;
 const leftElbow={x:mix(-83,-149,seated)-pressure*5,y:mix(613+armSwing,703+pressure*8,seated)};
 const rightElbow={x:mix(91,147,seated)+temple*25,y:mix(614-armSwing,703+pressure*6,seated)-temple*108};
 const leftWrist={x:mix(-87,-132,seated),y:mix(711+armSwing,761+typeL-settleHand*3,seated)};
 const rightWrist={x:mix(99,127,seated)-temple*48-laptopGesture*45,y:mix(708-armSwing,758+typeR,seated)-temple*260-laptopGesture*51};
 const bodyLean=walk*4+pressure*3-relief*1.5;
 const feet=[{left:true,world:walkLeft,lift:walkLiftL},{left:false,world:walkRight,lift:walkLiftR}];
 const chairShift=22*blend(t,2.0,2.75)*(1-blend(t,3.05,4.0));
 const open=.08+.92*blend(t,3.95,4.62);
 return <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position:'absolute',inset:0,pointerEvents:'none',overflow:'visible'}}>
  <defs>
   <linearGradient id="employee06-shirt" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#e9b18d"/><stop offset="1" stopColor="#cd8767"/></linearGradient>
   <linearGradient id="employee06-chair" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#426e66"/><stop offset="1" stopColor="#264f49"/></linearGradient>
   <linearGradient id="employee06-screen" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#cadfdc"/><stop offset="1" stopColor="#87aaa9"/></linearGradient>
  </defs>
  <ellipse cx="966" cy="939" rx="316" ry="20" fill="#24473c" opacity=".065"/>
  <g transform={`translate(${966+chairShift} 0)`}>
   <path d="M-127 779V658q0-40 42-40H88q42 0 42 40v121" fill="url(#employee06-chair)" stroke={ink} strokeWidth="3"/>
   <path d="M-104 648h209m-209 17h209m-209 17h209" stroke="#71a196" opacity=".18" strokeWidth="3"/>
   <rect x="-138" y="777" width="276" height="28" rx="14" fill="#284e48" stroke={ink} strokeWidth="3"/>
   <path d="M0 803v108m-80 17 80-17 89 17" fill="none" stroke="#45615b" strokeWidth="9" strokeLinecap="round"/>
   <ellipse cx="-82" cy="931" rx="13" ry="7" fill={ink}/><ellipse cx="90" cy="931" rx="13" ry="7" fill={ink}/>
  </g>
  <path d="M677 807h22l-16 125h-21Zm550 0h22l15 125h-21Z" fill="#bca283" stroke={ink} strokeWidth="3.2"/>
  <g transform={`translate(${center} 0)`}>
   <ellipse cx="0" cy="937" rx={97+walk*23} ry="12" fill="#264039" opacity=".08"/>
   {feet.map(f=>{const side=f.left?-1:1;const fx=mix(f.world-center,side*(f.left?78:87),seated),fy=930-f.lift*walk;const kx=mix((fx+side*39)*.5+side*12,side*74,seated),ky=mix(792-f.lift*.2,842,seated);return <g key={side}>
    <path d={`M${side*45} ${hipY}Q${side*55} ${hipY+80} ${kx} ${ky}L${fx} ${fy-21}`} fill="none" stroke={ink} strokeWidth="52" strokeLinecap="round" strokeLinejoin="round"/>
    <path d={`M${side*45} ${hipY}Q${side*55} ${hipY+80} ${kx} ${ky}L${fx} ${fy-21}`} fill="none" stroke={f.left?'#344f57':'#3f5e63'} strokeWidth="45" strokeLinecap="round" strokeLinejoin="round"/>
    <g transform={`translate(${fx} ${fy-18}) rotate(${f.left?-5:4})`}><path d="M-22-8h34l21 10q18 4 18 17h-77q-5-11 4-27Z" fill="#f1ecda" stroke={ink} strokeWidth="3.2"/><path d="M-25 13h75M-7-2l19 5m-22 2 18 4" stroke="#b2b6a7" strokeWidth="2.4" strokeLinecap="round"/></g>
   </g>;})}
   <g transform={`rotate(${bodyLean} 0 ${hipY})`}>
    {[{s:-1,e:leftElbow},{s:1,e:rightElbow}].map(a=><g key={a.s}>
     <path d={`M${a.s*91} ${shoulderY+24}Q${a.s*121} ${shoulderY+68} ${a.e.x} ${a.e.y}`} fill="none" stroke={ink} strokeWidth="48" strokeLinecap="round"/>
     <path d={`M${a.s*91} ${shoulderY+24}Q${a.s*121} ${shoulderY+68} ${a.e.x} ${a.e.y}`} fill="none" stroke={a.s<0?'#dfa07c':sleeve} strokeWidth="42" strokeLinecap="round"/>
    </g>)}
    <path d={`M-63 ${shoulderY-4}Q-111 ${shoulderY-1} -112 ${shoulderY+50}L-97 ${hipY+4}Q0 ${hipY+24} 100 ${hipY+3}L109 ${shoulderY+56}Q112 ${shoulderY-1} 65 ${shoulderY-4}Z`} fill="url(#employee06-shirt)" stroke={ink} strokeWidth="3.3"/>
    <path d={`M-30 ${headY+70}V${shoulderY+2}q31 22 63 0V${headY+71}`} fill={skin} stroke={ink} strokeWidth="3.1"/>
    <path d={`M-48 ${shoulderY-7}Q0 ${shoulderY+38} 49 ${shoulderY-7}`} fill="none" stroke="#f0debb" strokeWidth="9"/>
    <path d={`M-56 ${shoulderY-4}Q0 ${shoulderY+50} 58 ${shoulderY-4}M-74 ${shoulderY+49}l-2 79m149-78-1 80M-85 ${hipY-11}q84 16 174 0`} stroke="#b3775d" strokeWidth="3" fill="none" strokeLinecap="round" opacity=".7"/>
    {[{s:-1,e:leftElbow,w:leftWrist},{s:1,e:rightElbow,w:rightWrist}].map(a=><g key={a.s}>
     <path d={`M${a.e.x} ${a.e.y}Q${(a.e.x+a.w.x)/2+a.s*4} ${(a.e.y+a.w.y)/2} ${a.w.x} ${a.w.y}`} fill="none" stroke={ink} strokeWidth="32" strokeLinecap="round"/>
     <path d={`M${a.e.x} ${a.e.y}Q${(a.e.x+a.w.x)/2+a.s*4} ${(a.e.y+a.w.y)/2} ${a.w.x} ${a.w.y}`} fill="none" stroke={skin} strokeWidth="26" strokeLinecap="round"/>
     <g transform={`translate(${a.w.x} ${a.w.y}) rotate(${a.s===1?-temple*64:0})`}><ellipse rx="20" ry="13" fill={skin} stroke={ink} strokeWidth="2.8"/><path d="M-6-4l13 5m-15 1 12 5" stroke="#a97357" strokeWidth="2" strokeLinecap="round"/></g>
    </g>)}
   </g>
   <g transform={`translate(${headX} ${headY}) rotate(${headTilt+gx*2} 0 70) scale(.92)`}>
    <path d="M-72 45q-43-80-9-121 17-45 72-43 74-10 92 55 27 40-6 103Z" fill={hair} stroke={ink} strokeWidth="3.4"/>
    <path d="M-69 4q-28-20-29 8 1 25 30 28m137-38q29-18 29 9-2 26-28 30" fill={skin} stroke={ink} strokeWidth="3.2"/>
    <path d="M-72-44q21-9 28-32 49 26 108-1 20 15 17 55l-6 66Q67 90 6 105-55 101-69 48Z" fill={skin} stroke={ink} strokeWidth="3.4"/>
    <path d="M-83-33q9-59 57-68 65-18 109 28-40 34-88 19-27-8-43-20-7 30-35 41Z" fill={hair}/>
    <path d="M-57-74q43-26 88-13" fill="none" stroke="#637166" strokeWidth="5" strokeLinecap="round" opacity=".55"/>
    <g transform={`translate(${gx*3} ${gy*1.6})`}>
     <path d={`M-57 ${-12+pressure*8}Q-39 ${-24-pressure*8} -22 ${-12-pressure*11}M25 ${-12-pressure*11}Q43 ${-24-pressure*8} 60 ${-10+pressure*8}`} stroke={hair} strokeWidth="5" fill="none" strokeLinecap="round"/>
     {[-39,43].map(x=><g key={x} transform={`translate(${x} ${eyeY}) scale(1 ${Math.max(.06,eyeOpen)*(1-pressure*.08)})`}><ellipse rx="18" ry={12+pressure*.8} fill="#fffdf2"/><circle cx={gx*7} cy={gy*3} r="6.6" fill="#344d44"/><circle cx={gx*7+1.5} cy={gy*3-2} r="1.9" fill="#fff"/><path d="M-18-2Q0-17 18-2" fill="none" stroke={ink} strokeWidth="2.7" strokeLinecap="round"/></g>)}
     <path d={`M${4+gx*2} 15l-7 22q7 6 17 0`} fill="none" stroke="#aa7057" strokeWidth="3" strokeLinecap="round"/>
     <path d={`M-22 ${65-pressure*5}Q3 ${89-pressure*44} 30 ${63-pressure*3}`} fill="none" stroke={ink} strokeWidth="3.6" strokeLinecap="round"/>
     <path d="M-21 65q25 13 49-1-10 20-25 20-16 0-24-19" fill="#fff4dd" opacity={(1-pressure)*energy*.75}/>
     <path d="M-57 44l-4 4m9 3-2 3m61-9 4 4m-10 2 3 4" stroke="#b2765a" strokeWidth="2.7" strokeLinecap="round" opacity=".7"/>
     <path d="M-56 23q17 9 31 0m51 0q17 9 31 0" fill="none" stroke="#a97761" strokeWidth="2.2" opacity={pressure*.32}/>
    </g>
   </g>
  </g>
  <path d="M650 799h625v24H650Z" fill="#e1ccaa" stroke={ink} strokeWidth="3.2" strokeLinejoin="round"/>
  <path d="M657 801h610" stroke="#f5e4c6" strokeWidth="4"/>
  <g transform={`translate(966 791) scale(1 ${open}) translate(-966 -791)`}>
   <path d="M833 698h243q9 0 12 12l19 81H829l-17-79q-3-14 21-14Z" fill="url(#employee06-screen)" stroke={ink} strokeWidth="3.2" strokeLinejoin="round"/>
   <path d="m830 709 16 73h247" fill="none" stroke="#e6efdd" strokeWidth="4"/>
   <path d="m954 743 11 13 11-13" fill="none" stroke="#6e9692" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
  </g>
  <path d="M819 790h298q9 0 9 8H810q0-8 9-8Z" fill="#789998" stroke={ink} strokeWidth="2.7"/>
  <path d="M1181 744h37v43q0 10-19 10-18 0-18-10Z" fill="#f3dec0" stroke={ink} strokeWidth="3"/><path d="M1219 752q28-3 20 18-4 10-20 4" fill="none" stroke={ink} strokeWidth="3"/>
  <path d={`M1192 ${736-Math.sin(t*1.5)*3}q-7-12 1-20m13 20q-7-12 0-20`} fill="none" stroke="#9dae9c" strokeWidth="2.5" opacity=".38" strokeLinecap="round"/>
  <rect x="699" y="782" width="65" height="11" rx="4" fill="#bb7964" stroke={ink} strokeWidth="2.4"/><path d="m710 779 43-6" stroke="#e2cfa5" strokeWidth="4" strokeLinecap="round"/>
 </svg>;
}
