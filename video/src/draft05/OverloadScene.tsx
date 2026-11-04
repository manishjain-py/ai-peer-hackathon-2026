import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C,Peer,Icon,ease,fade} from '../draft02/Shared';

const palette={paper:'#f6f4ee',ink:'#203b38',muted:'#71827b',warm:'#f6aa80',purple:'#744270',blue:'#467bbe',amber:'#d99342'};
const smooth=(t:number,a:number,b:number)=>{const k=Math.max(0,Math.min(1,(t-a)/(b-a)));return k*k*(3-2*k);};
const mix=(a:number,b:number,k:number)=>a+(b-a)*k;
const turns=[{at:0,x:0,y:.2},{at:1.65,x:1,y:-.55},{at:4.65,x:-1,y:-.65},{at:8.15,x:1,y:.45},{at:11.65,x:-1,y:.55},{at:15.65,x:0,y:-1},{at:17.3,x:1,y:.3},{at:18.1,x:-1,y:.45},{at:19.25,x:0,y:.1}];
function gazeAt(t:number){let x=0,y=.2;for(const turn of turns){const p=smooth(t,turn.at,turn.at+.65);x=mix(x,turn.x,p);y=mix(y,turn.y,p);}return{x,y};}

/** Original, fictional employee. Deterministic cel animation, driven only by scene time. */
export function Employee04({t,relief=0,lookX,lookY}:{t:number;relief?:number;lookX?:number;lookY?:number}){
 const gaze=gazeAt(t),gx=lookX??gaze.x,gy=lookY??gaze.y;
 const strain=(.22*smooth(t,4.5,5.5)+.24*smooth(t,8,9)+.28*smooth(t,11.5,12.5)+.26*smooth(t,15.5,17.5))*(1-relief);
 const recoil=Math.sin(Math.PI*smooth(t,11.75,13.1))*9*(1-relief);
 const handUp=smooth(t,11.7,12.7)*(1-smooth(t,15.1,16))*(1-relief);
 const breath=Math.sin(t*2.1)*1.2;
 const slouch=strain*11;const blink=(t%4.7>4.47&&t%4.7<4.63)?Math.abs((t%4.7-4.55)/.08):1;
 const headTurn=gx*3.2;const bob=breath+slouch-recoil;
 const skin='#d99b77',outline='#2a3532',hair='#35302f';
 return <svg width="1920" height="1080" viewBox="0 0 1920 1080" style={{position:'absolute',inset:0,pointerEvents:'none',overflow:'visible'}}>
  <defs><linearGradient id="employee04-sweater" x1="0" y1="0" x2="1" y2="1"><stop stopColor="#e7a47f"/><stop offset="1" stopColor="#ca836a"/></linearGradient></defs>
  <g transform="translate(645 268)">
   <ellipse cx="317" cy="659" rx="287" ry="25" fill="#1d5349" opacity=".08"/>
   <path d="M225 525 213 631Q213 653 247 652L277 648 299 542M339 542 363 647 410 651Q433 650 425 633L395 522" fill="#324d50" stroke={outline} strokeWidth="4"/>
   <path d="m212 630 36 5 25 12-1 13h-88q-9-21 28-30M367 635l38-4q49 11 44 31h-83Z" fill="#eee8d7" stroke={outline} strokeWidth="4" strokeLinejoin="round"/>
   <path d="m194 607 1-202q-2-61 58-62h121q65 0 63 62l-1 202" fill="#426b64" stroke={outline} strokeWidth="4"/>
   <path d="M308 537v104m-74 4h151" fill="none" stroke={outline} strokeWidth="10" strokeLinecap="round"/>
   <g transform={`translate(0 ${breath})`}>
    <path d={`M240 ${293-strain*9}Q202 ${292-strain*8} 183 336L166 431q-5 40 30 55l57 21h117l66-34q21-15 12-43l-19-94q-12-42-54-43Z`} fill="url(#employee04-sweater)" stroke={outline} strokeWidth="4" strokeLinejoin="round"/>
    <path d="M257 489h121l19 67H231Z" fill="#cf8c70" stroke={outline} strokeWidth="4"/>
    <path d={`M284 ${247+bob}v48q30 27 58 0v-${48+bob}`} fill={skin} stroke={outline} strokeWidth="4"/>
    <path d={`m267 289 43 34 45-34M252 311l-6 85m126-85 7 83`} fill="none" stroke="#9f6958" strokeWidth="4" strokeLinecap="round"/>
    <path d="M280 290q29 36 64 0" fill="none" stroke="#efe1bd" strokeWidth="10" strokeLinecap="round"/>
    <path d={`M207 386 220 433 266 450 254 479 188 457q-16-11-17-29l9-34`} fill="#dc9776" stroke={outline} strokeWidth="4"/>
    <path d="M252 451q21-11 31-3l15 9 25 5q8 7-2 12l-42-1-26 6q-18-6-12-17Z" fill={skin} stroke={outline} strokeWidth="4"/>
    <path d="m282 457 26 10m-39-4 23 9" stroke="#94644f" strokeWidth="2.5" strokeLinecap="round"/>
    <g transform={`rotate(${handUp*98} 411 403)`}>
     <path d="m403 367 31 16 7 54q-2 20-23 24l-49 13-10-25 42-21Z" fill="#dc9776" stroke={outline} strokeWidth="4"/>
     <path d="m368 448-18-6-13 10-22 8q-8 9 3 13l39-2 14 4q14-11 9-21Z" fill={skin} stroke={outline} strokeWidth="4"/>
     <path d="m343 455-16 11m26-6-13 9" stroke="#94644f" strokeWidth="2.5" strokeLinecap="round"/>
    </g>
   </g>
   <g transform={`translate(${gx*7} ${bob}) rotate(${headTurn} 312 240)`}>
    <path d="M256 196q-39-51-9-89 9-50 62-54 53-15 81 33 27 28 6 79l-17 69Z" fill={hair} stroke={outline} strokeWidth="4"/>
    <path d="M258 173q-23-18-25 6-1 26 26 32m113-40q24-19 27 5 4 27-23 34" fill={skin} stroke={outline} strokeWidth="4"/>
    <path d="M256 139q17-8 23-28 43 20 88-2 18 12 17 49l-7 60q-6 42-59 51-47-6-58-46Z" fill={skin} stroke={outline} strokeWidth="4"/>
    <path d="M260 119q16-61 79-43 25 9 38 25-38 45-93 10-5 22-29 35Z" fill={hair}/>
    <path d="M271 102q39-23 77-9" fill="none" stroke="#635044" strokeWidth="5" strokeLinecap="round"/>
    <g transform={`translate(${gx*3.4} ${gy*1.5})`}>
     <path d={`M270 ${156+strain*4}q17 ${-8-strain*10} 32 ${-2-strain*9}m24 ${-strain*7}q18 ${-8+strain*7} 32 ${3+strain*10}`} fill="none" stroke={hair} strokeWidth="5.5" strokeLinecap="round"/>
     <g transform={`translate(0 ${176*(1-blink)}) scale(1 ${Math.max(.08,blink)})`}>
      <ellipse cx="287" cy="176" rx="16" ry={11+strain*2} fill="#fffaf0"/>
      <ellipse cx="342" cy="176" rx="16" ry={11+strain*2} fill="#fffaf0"/>
      <circle cx={287+gx*7} cy={176+gy*4} r="5.8" fill={outline}/><circle cx={342+gx*7} cy={176+gy*4} r="5.8" fill={outline}/>
      <circle cx={285+gx*7} cy={174+gy*4} r="1.7" fill="#fff"/><circle cx={340+gx*7} cy={174+gy*4} r="1.7" fill="#fff"/>
      <path d="M271 173q15-12 31 0m24 0q15-12 31 0" fill="none" stroke={outline} strokeWidth="3" strokeLinecap="round"/>
     </g>
     <path d={`M${313+gx*2} 180l-5 20q7 6 15 0`} fill="none" stroke="#9a604c" strokeWidth="3" strokeLinecap="round"/>
     <path d={`M295 ${226-strain*2}q20 ${15-Math.sqrt(strain)*28} 39 ${-1+strain*2}`} fill="none" stroke={outline} strokeWidth="3.5" strokeLinecap="round"/>
     <path d="M278 210l-4 4m7 2-2 3m64-7 3 4m-6 1 2 3" fill="none" stroke="#a96953" strokeWidth="2.6" strokeLinecap="round" opacity=".7"/>
    </g>
   </g>
   <path d="M60 539h528v28H60Z" fill="#dfc398" stroke={outline} strokeWidth="4" strokeLinejoin="round"/>
   <path d="M79 567h24l-7 87H75Zm465 0h22l6 87h-22Z" fill="#bf9e79" stroke={outline} strokeWidth="4"/>
   <path d="M195 421h235q8 0 10 9l23 104H190l-17-98q-2-15 22-15Z" fill="#acc7cf" stroke={outline} strokeWidth="4" strokeLinejoin="round"/>
   <path d="m191 428 17 99h245" fill="none" stroke="#d9e5e0" strokeWidth="4"/>
   <path d="M183 530h292q7 0 7 7H176q0-7 7-7Z" fill="#789b9f" stroke={outline} strokeWidth="3"/>
   <path d="m316 468 10 18 10-18" fill="none" stroke="#6f959c" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"/>
   <path d="M110 483h40v47q-1 9-20 9-20 0-20-9Z" fill="#f8edc8" stroke={outline} strokeWidth="3.5"/>
   <path d="M151 491q28-4 20 19-5 10-20 4" fill="none" stroke={outline} strokeWidth="4"/>
   <path d={`M126 473q-9-12 0-22m14 22q-9-12 0-22`} fill="none" stroke="#c1c4b6" strokeWidth="3" strokeLinecap="round" opacity={.5+.2*Math.sin(t*1.8)}/>
   <rect x="500" y="526" width="54" height="9" rx="4" fill="#d58469" stroke={outline} strokeWidth="2.5"/>
   <path d="m509 524 37-8" stroke="#ece2c7" strokeWidth="5" strokeLinecap="round"/>
  </g>
 </svg>;
}

const sourceNodes=[{x:1320,y:303,at:1.5,color:palette.purple},{x:583,y:307,at:4.5,color:palette.blue},{x:1510,y:633,at:8,color:palette.purple},{x:513,y:711,at:11.5,color:palette.amber},{x:960,y:173,at:15.5,color:'#d1715d'}];
const cardStyle:React.CSSProperties={position:'absolute',background:'#fffdfa',border:'2px solid #dce2d9',borderRadius:21,boxShadow:'0 14px 32px #183b2e0e',boxSizing:'border-box',color:palette.ink};
function CardMotion({t,at,x,y,width,children,tilt=0,height,release=0}:{t:number;at:number;x:number;y:number;width:number;children:React.ReactNode;tilt?:number;height?:number;release?:number}){
 const p=ease(t,at,.65),active=1-smooth(t,at+4,at+4.6),travel=smooth(release,at*.009,.66+at*.009);
 return <div style={{...cardStyle,left:mix(x,1356-width/2,travel),top:mix(y,354,travel)-Math.sin(travel*Math.PI)*70,width,height,opacity:fade(t,at,.23)*(1-smooth(travel,.88,1)),transform:`translateY(${30*(1-p)}px) rotate(${tilt*(1-p)+travel*5}deg) scale(${(.87+.13*p)*(1-travel*.91)})`,transformOrigin:'center',boxShadow:`0 ${14+active*7}px ${32+active*12}px #183b2e12`}}>{children}</div>;
}
function SourceIcon({kind,color}:{kind:'slack'|'mail'|'calendar'|'review';color:string}){return <div style={{width:43,height:43,borderRadius:11,background:color+'14',display:'flex',alignItems:'center',justifyContent:'center',color,flexShrink:0}}>{kind==='slack'?<span style={{fontSize:35,fontWeight:850,lineHeight:1}}>#</span>:<Icon type={kind==='mail'?'message':kind==='calendar'?'clock':'file'} size={29}/>}</div>}
function SourceHeader({kind,title,color}:{kind:'slack'|'mail'|'calendar'|'review';title:string;color:string}){return <div style={{display:'flex',gap:13,alignItems:'center',fontSize:28,fontWeight:750,color}}><SourceIcon kind={kind} color={color}/>{title}</div>}

export function PressureSources04({t,release=0}:{t:number;release?:number}){
 const count=Math.min(150,Math.round(38+112*ease(t,5,1.15))),pings=Math.min(10,Math.max(1,Math.floor(1+(t-8.35)*4.5)));
 const pingTravel=smooth(release,.072,.732);
 return <div style={{position:'absolute',inset:0}}>
  <CardMotion t={t} at={1.5} x={1270} y={221} width={487} tilt={3} release={release}>
   <div style={{padding:'23px 27px'}}><SourceHeader kind="slack" title="Slack · RPS" color={palette.purple}/><div style={{height:1,background:'#e8e5e1',margin:'18px 0'}}/><div style={{display:'flex',gap:14,alignItems:'flex-start'}}><div style={{background:'#cedcc6',borderRadius:10,width:43,height:43,display:'flex',alignItems:'center',justifyContent:'center',fontSize:23,fontWeight:800,flexShrink:0}}>C</div><div><div style={{fontSize:24,color:'#718078'}}>Charan <span style={{fontWeight:400,marginLeft:7}}>just now</span></div><div style={{fontSize:31,fontWeight:730,letterSpacing:-.6,lineHeight:1.32,marginTop:7}}>Where’s the runbook?</div></div></div></div>
  </CardMotion>
  <CardMotion t={t} at={4.5} x={159} y={211} width={453} tilt={-3} release={release}>
   <div style={{padding:'23px 28px'}}><SourceHeader kind="mail" title="Your inbox" color={palette.blue}/><div style={{display:'flex',gap:20,alignItems:'baseline',marginTop:12}}><span style={{fontSize:83,fontWeight:790,letterSpacing:-5,lineHeight:1.15,fontVariantNumeric:'tabular-nums'}}>{count}</span><span style={{fontSize:33,color:'#617770'}}>unread</span></div><div style={{display:'flex',gap:7,marginTop:13}}>{[110,92,130].map((w,i)=><div key={i} style={{height:7,width:w,background:i===0?'#b4c9e4':'#e1e8eb',borderRadius:5}}/>)}</div></div>
  </CardMotion>
  <div style={{position:'absolute',left:mix(1302,1136,pingTravel),top:mix(565,354,pingTravel)-Math.sin(pingTravel*Math.PI)*55,opacity:fade(t,8,.3)*(1-smooth(pingTravel,.88,1)),width:440,height:201,transformOrigin:'center',transform:`translateY(${25*(1-ease(t,8,.6))}px) scale(${1-pingTravel*.91})`}}>
   {[2,1].map((k)=><div key={k} style={{...cardStyle,width:440,height:184,top:-k*14,left:k*14,transform:`rotate(${k*1.4}deg)`,opacity:fade(t,8.4+k*.32,.25),background:k===2?'#eee3ec':'#f7eef4'}}/>)}
   <div style={{...cardStyle,width:440,minHeight:201,padding:'24px 26px'}}><SourceHeader kind="slack" title="Slack · Messages" color={palette.purple}/><div style={{display:'flex',alignItems:'baseline',gap:16,marginTop:9}}><div style={{fontSize:65,fontWeight:800,letterSpacing:-3,fontVariantNumeric:'tabular-nums',lineHeight:1.1}}>{pings}</div><div style={{fontSize:31}}>pings. And counting.</div></div><div style={{display:'flex',gap:8,marginTop:20}}>{Array.from({length:10},(_,i)=><div key={i} style={{width:27,height:8,borderRadius:9,background:palette.purple,opacity:fade(t,8.3+i*.22,.14)}}/>)}</div></div>
  </div>
  <CardMotion t={t} at={11.5} x={149} y={621} width={445} tilt={-3} release={release}>
   <div style={{padding:'22px 27px'}}><SourceHeader kind="calendar" title="3 meeting invites" color={palette.amber}/><div style={{display:'flex',gap:10,marginTop:19}}>{[{time:'1:00 AM',night:true},{time:'2:30 AM',night:true}].map((x,i)=><div key={x.time} style={{background:'#293f4f',borderRadius:11,padding:'11px 14px',color:'#f8f0d1',opacity:fade(t,12.15+i*.35,.25),transform:`translateY(${12*(1-ease(t,12.15+i*.35,.4))}px)`}}><div style={{fontSize:28,fontWeight:750,letterSpacing:-.8}}>☾ {x.time}</div></div>)}</div><div style={{fontSize:29,color:'#886533',fontWeight:700,marginTop:15}}>Two during your night.</div></div>
  </CardMotion>
  <CardMotion t={t} at={15.5} x={754} y={91} width={430} tilt={2} release={release}>
   <div style={{padding:'20px 25px'}}><SourceHeader kind="review" title="Project review" color="#b56955"/><div style={{fontSize:31,fontWeight:760,lineHeight:1.3,marginTop:12,letterSpacing:-.5}}>Can you check this, too?</div><div style={{fontSize:28,color:'#8e7163',marginTop:7}}>Waiting on your context.</div></div>
  </CardMotion>
 </div>;
}

export function Orbit04({t,release=0}:{t:number;release?:number}){
 const ring=.19*ease(t,1.7,1.5)+.2*ease(t,4.9,1.4)+.22*ease(t,8.4,1.4)+.22*ease(t,11.9,1.5)+.17*ease(t,15.9,1.6);
 return <svg width="1920" height="1080" style={{position:'absolute',inset:0,pointerEvents:'none'}}>
  <ellipse cx="960" cy="529" rx="687" ry="348" fill="none" stroke="#d6dbce" strokeWidth="2" strokeDasharray="3 11" opacity={.37*ease(t,1.7,2)*(1-release)}/>
  <ellipse cx="960" cy="529" rx="687" ry="348" fill="none" stroke={t>15.5?'#cba98d':'#b7c2ae'} strokeWidth="3" pathLength="1000" strokeDasharray={`${ring*1000*(1-release*.76)} 1000`} strokeDashoffset={140-release*130} opacity={(1-release)*.9} transform="rotate(-19 960 529)"/>
  {sourceNodes.map((n,i)=>{const p=ease(t,n.at+.22,.65);return <g key={i} opacity={p*(1-release)}>
   <path d={`M${n.x} ${n.y} Q${mix(n.x,960,.48)} ${mix(n.y,480,.4)-25} ${mix(n.x,960,.78)} ${mix(n.y,480,.8)}`} stroke={n.color} strokeWidth="2" fill="none" strokeDasharray="5 9" opacity={.16+.18*(1-smooth(t,n.at+3,n.at+4))}/>
   <circle cx={n.x} cy={n.y} r={10+7*(1-p)} fill={palette.paper} stroke={n.color} strokeWidth="3"/>
   <circle cx={n.x} cy={n.y} r="4" fill={n.color}/>
  </g>})}
  <path d="M146 927h1628" stroke="#d3daca" strokeWidth="2" opacity=".35"/>
 </svg>;
}

export function OverloadScene({t}:{t:number}){
 const hush=1-.15*ease(t,19.3,.65);
 return <AbsoluteFill style={{background:palette.paper,color:palette.ink,overflow:'hidden'}}>
  <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% 48%, #fffdf4 0%, #f6f4ee 68%)'}}/>
  <div style={{position:'absolute',left:89,top:54,fontSize:24,letterSpacing:2.2,fontWeight:750,color:'#6b8376'}}>A VERY NORMAL WORKDAY</div>
  <div style={{position:'absolute',left:0,right:0,top:130,textAlign:'center',fontSize:68,fontWeight:800,letterSpacing:-3,opacity:(1-fade(t,1.15,.65))*fade(t,.1,.5),transform:`translateY(${15*(1-ease(t,.1,.8))}px)`}}>One person.</div>
  <div style={{position:'absolute',inset:0,opacity:hush}}><Orbit04 t={t}/><PressureSources04 t={t}/><Employee04 t={t}/></div>
  <div style={{position:'absolute',left:653,top:944,width:615,textAlign:'center',fontSize:31,fontWeight:760,color:'#7b644e',opacity:fade(t,17.8,.5)*(1-fade(t,19.3,.5)),letterSpacing:-.4}}>Your attention can’t be everywhere.</div>
 </AbsoluteFill>;
}

/** Optional continuity beat: the very same employee breathes out as their Peer takes the inbound requests. */
export function ReliefScene({t}:{t:number}){
 const relief=ease(t,.35,2.4),shift=ease(t,.2,2.4),route=smooth(t,.2,3.4);
 return <AbsoluteFill style={{background:palette.paper,color:palette.ink,overflow:'hidden'}}>
  <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% 48%, #fffdf4 0%, #f6f4ee 68%)'}}/>
  <div style={{position:'absolute',left:89,top:54,fontSize:24,letterSpacing:2.2,fontWeight:750,color:'#6b8376',opacity:1-ease(t,0,1)}}>A VERY NORMAL WORKDAY</div>
  <Orbit04 t={19.95} release={relief}/>
  <svg width="1920" height="1080" style={{position:'absolute',inset:0}}>
   <path d="M960 182C1570 120 1700 654 1296 680" fill="none" stroke="#b0d7bd" strokeWidth="3" strokeDasharray="6 11" pathLength="1000" opacity={route*.8}/>
   <path d="M960 182C1570 120 1700 654 1296 680" fill="none" stroke="#488a66" strokeWidth="5" strokeDasharray="90 1010" strokeDashoffset={-route*1050} opacity={route*(1-ease(t,4,1))}/>
  </svg>
  <div style={{position:'absolute',inset:0,transform:`translateX(${-230*shift}px)`}}><Employee04 t={19.95+t} relief={relief} lookX={.55*smooth(t,0,.45)*(1-relief)} lookY={.12}/></div>
  <PressureSources04 t={19.95} release={route}/>
  <div style={{position:'absolute',left:1115,top:357,opacity:fade(t,.8,.5),transform:`translateY(${25*(1-ease(t,.8,.9))}px) scale(${.88+.12*ease(t,.8,.8)})`,textAlign:'center',width:500}}>
   <div style={{position:'relative',display:'inline-flex'}}><div style={{position:'absolute',inset:-14,border:'2px solid #98d6ad',borderRadius:53,transform:`scale(${1+.12*Math.sin(t*2)})`,opacity:(1-smooth(t,3.6,4.8))*.65}}/><Peer size={141}/></div>
   <div style={{fontSize:60,fontWeight:800,letterSpacing:-2,marginTop:24}}>AI Peer.</div>
   <div style={{fontSize:29,color:C.green,marginTop:9}}>Focus where you’re needed most.</div>
  </div>
  <div style={{...cardStyle,left:493,top:798,width:498,padding:'18px 25px',opacity:fade(t,2.45,.55),transform:`translateY(${20*(1-ease(t,2.45,.7))}px)`}}><div style={{fontSize:25,color:C.green,fontWeight:800,letterSpacing:1}}>YOUR FOCUS</div><div style={{fontSize:31,fontWeight:750,marginTop:6}}>The work that needs you.</div></div>
  <div style={{position:'absolute',left:1197,top:703,width:369,opacity:fade(t,3.1,.6),transform:`translateY(${17*(1-ease(t,3.1,.7))}px)`}}>
   {[{icon:'message',text:'Routine questions'},{icon:'search',text:'What matters to you'}].map((x,i)=><div key={x.text} style={{display:'flex',alignItems:'center',gap:13,fontSize:28,padding:'14px 18px',marginBottom:10,background:i?'#eff4e8':'#e5f3e7',border:'1px solid #c8dfcc',borderRadius:12,color:'#366a4c',opacity:fade(t,3.1+i*.25,.4)}}><Icon type={x.icon} size={27}/>{x.text}</div>)}
  </div>
 </AbsoluteFill>;
}
