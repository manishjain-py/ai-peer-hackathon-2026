import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C,Peer,Icon,ease,fade} from '../draft02/Shared';
import {SeatedEmployee} from './SeatedEmployee';
const palette={paper:'#f6f4ee',ink:'#203b38',muted:'#71827b',warm:'#f6aa80',purple:'#744270',blue:'#467bbe',amber:'#d99342'};
const smooth=(t:number,a:number,b:number)=>{const k=Math.max(0,Math.min(1,(t-a)/(b-a)));return k*k*(3-2*k);};
const mix=(a:number,b:number,k:number)=>a+(b-a)*k;

const sourceNodes=[{x:1320,y:303,at:1.5,color:palette.purple},{x:583,y:307,at:4.5,color:palette.blue},{x:1510,y:633,at:8,color:palette.purple},{x:513,y:711,at:11.5,color:palette.amber},{x:960,y:173,at:15.5,color:'#d1715d'}];
const cardStyle:React.CSSProperties={position:'absolute',background:'#fffdfa',border:'2px solid #dce2d9',borderRadius:21,boxShadow:'0 14px 32px #183b2e0e',boxSizing:'border-box',color:palette.ink};
function CardMotion({t,at,x,y,width,children,tilt=0,height,release=0}:{t:number;at:number;x:number;y:number;width:number;children:React.ReactNode;tilt?:number;height?:number;release?:number}){
 const p=ease(t,at,.65),active=1-smooth(t,at+4,at+4.6),travel=smooth(release,at*.009,.66+at*.009);
 return <div style={{...cardStyle,left:mix(x,1356-width/2,travel),top:mix(y,354,travel)-Math.sin(travel*Math.PI)*70,width,height,opacity:fade(t,at,.23)*(1-smooth(travel,.88,1)),transform:`translateY(${30*(1-p)}px) rotate(${tilt*(1-p)+travel*5}deg) scale(${(.87+.13*p)*(1-travel*.91)})`,transformOrigin:'center',boxShadow:`0 ${14+active*7}px ${32+active*12}px #183b2e12`}}>{children}</div>;
}
function SourceIcon({kind,color}:{kind:'slack'|'mail'|'calendar'|'review';color:string}){return <div style={{width:43,height:43,borderRadius:11,background:color+'14',display:'flex',alignItems:'center',justifyContent:'center',color,flexShrink:0}}>{kind==='slack'?<span style={{fontSize:35,fontWeight:850,lineHeight:1}}>#</span>:<Icon type={kind==='mail'?'message':kind==='calendar'?'clock':'file'} size={29}/>}</div>}
function SourceHeader({kind,title,color}:{kind:'slack'|'mail'|'calendar'|'review';title:string;color:string}){return <div style={{display:'flex',gap:13,alignItems:'center',fontSize:28,fontWeight:750,color}}><SourceIcon kind={kind} color={color}/>{title}</div>}

export function PressureSources07({t,release=0}:{t:number;release?:number}){
 const count=Math.min(150,Math.round(38+112*ease(t,5,1.15))),pings=Math.min(10,Math.max(1,Math.floor(1+(t-8.35)*4.5)));
 const pingTravel=smooth(release,.072,.732);
 return <div style={{position:'absolute',inset:0}}>
  <CardMotion t={t} at={1.5} x={1270} y={221} width={487} tilt={3} release={release}>
   <div style={{padding:'23px 27px'}}><SourceHeader kind="slack" title="Slack · RPS" color={palette.purple}/><div style={{height:1,background:'#e8e5e1',margin:'18px 0'}}/><div style={{display:'flex',gap:14,alignItems:'flex-start'}}><div style={{background:'#cedcc6',borderRadius:10,width:43,height:43,display:'flex',alignItems:'center',justifyContent:'center',fontSize:23,fontWeight:800,flexShrink:0}}>C</div><div><div style={{fontSize:24,color:'#718078'}}>Carlos <span style={{fontWeight:400,marginLeft:7}}>just now</span></div><div style={{fontSize:31,fontWeight:730,letterSpacing:-.6,lineHeight:1.32,marginTop:7}}>Where’s the runbook?</div></div></div></div>
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

export function Orbit07({t,release=0}:{t:number;release?:number}){
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

/** 24-second photographic opening. The employee is already seated and happy at frame zero. */
export function OverloadScene({t}:{t:number}){
 const clock=t-4,pressure=ease(t,8.5,13.5),hush=1-.1*ease(t,23.35,.6);
 return <AbsoluteFill style={{background:palette.paper,color:palette.ink,overflow:'hidden'}}>
  <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 48% 44%, #fffdf0 0%, #f6f4ee 68%)'}}/>
  <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% 49%, #d9e2df 0%, #e9ece7 80%)',opacity:pressure*.18}}/>
  <div style={{position:'absolute',left:89,top:54,fontSize:24,letterSpacing:2.2,fontWeight:750,color:'#6b8376'}}>A VERY NORMAL WORKDAY</div>
  <div style={{position:'absolute',left:0,right:0,top:135,textAlign:'center',fontSize:64,fontWeight:800,letterSpacing:-2.1,opacity:fade(t,.2,.6)*(1-fade(t,4.1,.7)),transform:`translateY(${14*(1-ease(t,.2,.8))}px)`}}>New day. Clear mind.</div>
  <div style={{position:'absolute',inset:0,opacity:hush}}><Orbit07 t={clock}/><SeatedEmployee t={t}/><PressureSources07 t={clock}/></div>
  <div style={{position:'absolute',left:633,top:951,width:660,textAlign:'center',fontSize:31,fontWeight:760,color:'#7b644e',opacity:fade(t,21.9,.55)*(1-fade(t,23.4,.4)),letterSpacing:-.4}}>Your attention can’t be everywhere.</div>
 </AbsoluteFill>;
}

/** Six-second continuation. Use directly after the opening, with local t reset to zero. */
export function ReliefScene({t}:{t:number}){
 const relief=ease(t,.3,2.5),shift=ease(t,.25,2.4),route=smooth(t,.1,1.65);
 return <AbsoluteFill style={{background:palette.paper,color:palette.ink,overflow:'hidden'}}>
  <div style={{position:'absolute',inset:0,background:'radial-gradient(ellipse at 50% 48%, #fffdf4 0%, #f6f4ee 68%)'}}/>
  <div style={{position:'absolute',left:89,top:54,fontSize:24,letterSpacing:2.2,fontWeight:750,color:'#6b8376',opacity:1-ease(t,0,1)}}>A VERY NORMAL WORKDAY</div>
  <Orbit07 t={19.95} release={relief}/>
  <svg width="1920" height="1080" style={{position:'absolute',inset:0}}><path d="M960 182C1570 120 1700 654 1296 680" fill="none" stroke="#b0d7bd" strokeWidth="3" strokeDasharray="6 11" pathLength="1000" opacity={route*.8}/><path d="M960 182C1570 120 1700 654 1296 680" fill="none" stroke="#488a66" strokeWidth="5" strokeDasharray="90 1010" strokeDashoffset={-route*1050} opacity={route*(1-ease(t,4,1))}/></svg>
  <PressureSources07 t={19.95} release={route}/>
  <SeatedEmployee t={23.95+t} relief={relief} shift={shift}/>
  <div style={{position:'absolute',left:1115,top:357,opacity:fade(t,.8,.5),transform:`translateY(${25*(1-ease(t,.8,.9))}px) scale(${.88+.12*ease(t,.8,.8)})`,textAlign:'center',width:500}}>
   <div style={{position:'relative',display:'inline-flex'}}><div style={{position:'absolute',inset:-14,border:'2px solid #98d6ad',borderRadius:53,transform:`scale(${1+.12*Math.sin(t*2)})`,opacity:(1-smooth(t,3.6,4.8))*.65}}/><Peer size={141}/></div>
   <div style={{fontSize:60,fontWeight:800,letterSpacing:-2,marginTop:24,opacity:fade(t,1.1,.3)}}>AI Peer.</div><div style={{fontSize:29,color:C.green,marginTop:9,opacity:fade(t,1.3,.35)}}>Focus where you’re needed most.</div>
  </div>
  <div style={{...cardStyle,left:438,top:805,width:586,padding:'18px 25px',opacity:fade(t,2.45,.55),transform:`translateY(${20*(1-ease(t,2.45,.7))}px)`}}><div style={{fontSize:25,color:C.green,fontWeight:800,letterSpacing:1}}>YOUR FOCUS</div><div style={{fontSize:31,fontWeight:750,marginTop:6}}>The work that needs you.</div></div>
  <div style={{position:'absolute',left:1197,top:703,width:369,opacity:fade(t,3.1,.6),transform:`translateY(${17*(1-ease(t,3.1,.7))}px)`}}>{[{icon:'message',text:'Routine questions'},{icon:'search',text:'What matters to you'}].map((x,i)=><div key={x.text} style={{display:'flex',alignItems:'center',gap:13,fontSize:28,padding:'14px 18px',marginBottom:10,background:i?'#eff4e8':'#e5f3e7',border:'1px solid #c8dfcc',borderRadius:12,color:'#366a4c',opacity:fade(t,3.1+i*.25,.4)}}><Icon type={x.icon} size={27}/>{x.text}</div>)}</div>
 </AbsoluteFill>;
}
