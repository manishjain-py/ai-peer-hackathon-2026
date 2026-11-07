import React from 'react';
import {AbsoluteFill} from 'remotion';
import script from '../../public/draft06/script.json';
import timing from '../../public/draft06/audio/timing.json';
import {Peer} from '../draft02/Shared';

/** Authored Zoom reconstruction. Real team/project context; simulated interactions. */
const c = {mint: '#A8F0C6', green: '#36D471', ink: '#14232A', blue: '#0B5CFF'};
const clamp = (x: number) => Math.max(0, Math.min(1, x));
const ease = (x: number) => {const v=clamp(x);return v*v*v*(v*(v*6-15)+10);};
const p = (t: number, a: number, d=0.7) => ease((t-a)/d);
const lerp = (a: number, b: number, v: number) => a+(b-a)*v;
const sceneStart=script.scenes.find(s=>s.id==='zoom')?.start??142;
const cue = (id: string) => (script.lines.find(l=>l.id===id)?.start ?? sceneStart)-sceneStart;
type TimedLine={id:string;speaker:string;start:number;end:number;words?:{start:number;end:number}[]};
type Speaker='alex'|'sarah'|'maya'|'peer'|string;
type IconName='mic'|'video'|'people'|'chat'|'share'|'record'|'reaction'|'more'|'shield'|'grid'|'chevron'|'clock'|'check'|'doc'|'link';

const Icon:React.FC<{name:IconName;size?:number;color?:string;muted?:boolean}>=({name,size=28,color='currentColor',muted=false})=>{
 const parts:Record<IconName,React.ReactNode>={
  mic:<><rect x="9" y="2" width="6" height="13" rx="3"/><path d="M5 10v2a7 7 0 0 0 14 0v-2M12 19v3m-4 0h8"/></>,
  video:<><rect x="2" y="5" width="13" height="14" rx="3"/><path d="m15 9 7-4v14l-7-4"/></>,
  people:<><circle cx="9" cy="7" r="4"/><path d="M1 21v-3a8 8 0 0 1 16 0v3M17 3a4 4 0 0 1 0 8m3 3a6 6 0 0 1 3 5v2"/></>,
  chat:<path d="M21 4H3v14h5l-1 4 7-4h7Z"/>,
  share:<><rect x="2" y="4" width="20" height="16" rx="3"/><path d="M12 17V7m-4 4 4-4 4 4"/></>,
  record:<><circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="3" fill={color}/></>,
  reaction:<><circle cx="12" cy="12" r="9"/><path d="M7 14a5 5 0 0 0 10 0M8 8v2m8-2v2"/></>,
  more:<><circle cx="4" cy="12" r="1.5" fill={color}/><circle cx="12" cy="12" r="1.5" fill={color}/><circle cx="20" cy="12" r="1.5" fill={color}/></>,
  shield:<><path d="m12 2 9 4v6c0 6-9 10-9 10S3 18 3 12V6Z"/><path d="m7 11 3 3 7-7"/></>,
  grid:<><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
  chevron:<path d="m6 9 6 6 6-6"/>,
  clock:<><circle cx="12" cy="12" r="9"/><path d="M12 6v6l4 2"/></>,
  check:<path d="m5 12 4 4L20 5"/>,
  doc:<><path d="M5 2h10l4 4v16H5Z"/><path d="M15 2v5h4M9 12h6m-6 4h6"/></>,
  link:<><path d="m9 14 6-6M8 16l-2 2a4 4 0 0 1-6-6l5-5a4 4 0 0 1 6 0m2 2 2-2a4 4 0 0 1 6 6l-5 5a4 4 0 0 1-6 0" transform="translate(2 -1)"/></>,
 };
 return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{parts[name]}{muted&&<path d="M2 2 22 22" stroke="#F77777" strokeWidth="2.3"/>}</svg>;
};

const PeerGlyph:React.FC<{size:number;t:number;active?:boolean}>=({size,t,active=false})=><div style={{width:size,height:size,position:'relative',transform:`rotate(${Math.sin(t*.45)*2}deg)`}}>
 <div style={{position:'absolute',inset:-size*.23,border:`1px solid ${c.mint}22`,borderRadius:'50%',transform:`scale(${active?1+Math.sin(t*3)*.04:1})`}}/>
 <div style={{position:'absolute',inset:-size*.43,border:`1px solid ${c.mint}10`,borderRadius:'50%'}}/>
 <Peer size={size} pulse={active?(1+Math.sin(t*8))*.5:0} dark/>
 </div>;

const Wave:React.FC<{t:number;active:boolean}>=({t,active})=><div style={{height:26,display:'flex',alignItems:'center',gap:4}}>{[0,1,2,3,4].map(i=><div key={i} style={{width:4,borderRadius:4,background:c.mint,height:active?8+Math.abs(Math.sin(t*10+i*1.2))*18:4}}/>)}</div>;

const Toolbar=()=> <div style={{position:'absolute',left:0,right:0,bottom:0,height:83,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 28px',background:'linear-gradient(#202124,#18191B)',borderTop:'1px solid #35363A'}}>
 <div style={{display:'flex',gap:31}}>{([{name:'mic',label:'Unmute',muted:true},{name:'video',label:'Start video',muted:true}] as const).map(i=><div key={i.name} style={{width:100,textAlign:'center',fontSize:15,color:'#ECEDEE'}}><div style={{display:'flex',justifyContent:'center',alignItems:'center',gap:18,height:33}}><Icon name={i.name} muted={i.muted}/><Icon name="chevron" size={13}/></div><div style={{marginTop:7}}>{i.label}</div></div>)}</div>
 <div style={{display:'flex',gap:38,alignItems:'center'}}>{([{name:'shield',label:'Security'},{name:'people',label:'Participants'},{name:'chat',label:'Chat'},{name:'share',label:'Share screen'},{name:'record',label:'Record'},{name:'reaction',label:'Reactions'},{name:'more',label:'More'}] as const).map(i=><div key={i.name} style={{minWidth:81,textAlign:'center',fontSize:15,color:i.name==='share'?'#39CB70':'#EBECEF',position:'relative'}}><Icon name={i.name}/>{i.name==='people'&&<span style={{position:'absolute',top:-3,right:18,fontSize:13}}>4</span>}<div style={{marginTop:8}}>{i.label}</div></div>)}</div>
 <div style={{background:'#B72E31',border:'1px solid #D54448',borderRadius:8,padding:'10px 24px',color:'white',fontSize:18,fontWeight:600}}>Leave</div>
 </div>;

type Rect={x:number;y:number;w:number;h:number};
const Participant:React.FC<{id:Speaker;name:string;index:number;t:number;active:boolean;share:number}>=({id,name,index,t,active,share})=>{
 const initial:Rect={x:142+(index%2)*754,y:85+Math.floor(index/2)*340,w:740,h:326};
 const target:Rect={x:1483,y:93+index*159,w:269,h:151};
 const r={x:lerp(initial.x,target.x,share),y:lerp(initial.y,target.y,share),w:lerp(initial.w,target.w,share),h:lerp(initial.h,target.h,share)};
 const peer=id==='peer';
 return <div style={{position:'absolute',left:r.x,top:r.y,width:r.w,height:r.h,overflow:'hidden',borderRadius:6,background:peer?'#152B2B':'#171719',boxShadow:`0 0 0 ${active?3:1}px ${active?'#59D549':'#313439'}`,zIndex:3}}>
  {!peer&&<AbsoluteFill style={{background:'radial-gradient(ellipse at 50% 40%,#323941,#181c22)',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{textAlign:'center'}}><div style={{width:lerp(116,65,share),height:lerp(116,65,share),margin:'0 auto',borderRadius:'50%',overflow:'hidden',boxShadow:'0 0 0 5px #ffffff0b'}}><div style={{width:'100%',height:'100%',background:index===0?'#b4c1b7':index===1?'#9fabb9':'#b4a6b7',color:'#28353b',fontSize:lerp(46,25,share),fontWeight:600,display:'flex',alignItems:'center',justifyContent:'center'}}>{name.split(' ').map(n=>n[0]).join('')}</div></div><div style={{fontSize:28,marginTop:18,color:'#e1e6e9',opacity:1-share}}>{name}</div><div style={{fontSize:16,marginTop:7,color:'#99a3ad',opacity:1-share}}>Camera off</div></div><div style={{position:'absolute',right:20,bottom:14}}><Wave t={t} active={active}/></div></AbsoluteFill>}
  {peer&&<AbsoluteFill style={{background:'radial-gradient(ellipse at 50% 33%,#214E43 0%,#142D2D 52%,#101D25 100%)',display:'flex',alignItems:'center',justifyContent:'center'}}><div style={{display:'flex',alignItems:'center',flexDirection:'column',gap:lerp(20,5,share),transform:`translateY(${lerp(-10,-3,share)}px)`}}><PeerGlyph size={lerp(105,55,share)} t={t} active={active}/><div style={{fontSize:lerp(30,17,share),fontWeight:650,color:'#EDF9F3',opacity:1-share}}>Manish’s AI Peer</div><div style={{fontSize:18,color:'#AACABC',opacity:1-share,marginTop:-10}}>Manish’s delegated AI teammate</div></div><div style={{position:'absolute',right:18,top:16,padding:'5px 10px',background:'#A8F0C615',border:'1px solid #A8F0C648',borderRadius:5,color:c.mint,fontSize:lerp(16,12,share),letterSpacing:1.4,fontWeight:700}}>AI</div><div style={{position:'absolute',right:18,bottom:14}}><Wave t={t} active={active}/></div></AbsoluteFill>}
  <div style={{position:'absolute',left:0,bottom:0,display:'flex',alignItems:'center',gap:8,background:'#0009',padding:share>.6?'6px 8px':'8px 12px',color:'#FFF',fontSize:lerp(21,14,share),fontWeight:500,whiteSpace:'nowrap'}}><Icon name="mic" size={lerp(18,13,share)} muted={!active}/>{name}</div>
  {active&&<div style={{position:'absolute',top:12,left:12,width:7,height:7,borderRadius:'50%',background:c.green,boxShadow:'0 0 12px #5FD34B'}}/>}
 </div>;
};

const Source:React.FC<{label:string;meta:string;slack?:boolean}>=({label,meta,slack=false})=><div style={{display:'flex',alignItems:'center',gap:13,color:'#63747A',fontSize:18}}><div style={{height:35,width:35,background:slack?'#F1E9F2':'#E8EEF3',borderRadius:7,display:'flex',alignItems:'center',justifyContent:'center',color:slack?'#67296B':'#426684'}}>{slack?<span style={{fontSize:25,fontWeight:800}}>#</span>:<Icon name="doc" size={21}/>}</div><span style={{color:'#3E6074',fontWeight:700}}>{label}</span><span>· {meta}</span></div>;

const SharedEvidence:React.FC<{t:number;share:number}>=({t,share})=>{
 const draftReveal=p(t,cue('zoom_update')+1.6,.5);
 const nextReveal=p(t,cue('zoom_source'),.45);
 const ownerReveal=p(t,cue('zoom_sarah')+.7,.5);
 const approval=p(t,cue('zoom_boundary'),.5);
 return <div style={{position:'absolute',left:28,top:85,width:1429,height:664,opacity:share,transform:`translateY(${30*(1-share)}px) scale(${.97+.03*share})`,transformOrigin:'50% 50%',borderRadius:6,background:'#F6F8F9',overflow:'hidden',zIndex:2}}>
  <div style={{height:49,background:'#FFF',display:'flex',alignItems:'center',padding:'0 30px',borderBottom:'1px solid #DCE3E6',gap:12,fontSize:18,color:'#6B777F'}}><Icon name="doc" size={20}/><span>Manish’s project handoff</span><span style={{margin:'0 10px',color:'#A9B4BA'}}>/</span><span style={{fontWeight:600,color:'#263D48'}}>Premium chargebacks</span><span style={{marginLeft:'auto',fontSize:15,color:'#6C797D'}}>Shared by Manish’s AI Peer</span></div>
  <div style={{position:'absolute',left:42,top:76,right:42}}>
   <div style={{fontSize:15,color:'#5B7281',fontWeight:800,letterSpacing:2}}>RISK PARTNER SYSTEMS · RECORDED PROJECT STATE</div>
   <div style={{fontSize:42,letterSpacing:-1.3,fontWeight:750,color:c.ink,marginTop:10}}>Contract merged. Implementation in draft.</div>
   <div style={{marginTop:15}}><Source label="Project handoff" meta="19 Sep 2026"/></div>
   <div style={{display:'flex',gap:18,marginTop:21}}>
    <div style={{width:420,height:153,border:'1px solid #BCE4CF',borderRadius:12,background:'#ECF8F0',padding:21,boxSizing:'border-box'}}><div style={{display:'flex',gap:10,alignItems:'center',fontSize:16,color:'#37785A',fontWeight:750}}><Icon name="check" size={22}/> MERGED</div><div style={{fontSize:31,fontWeight:740,color:'#204E38',marginTop:14}}>D-REX data contract</div><div style={{fontSize:26,color:'#567262',marginTop:7}}>Schema + producer changes</div></div>
    <div style={{flex:1,height:153,border:'1px solid #E5D4AD',borderRadius:12,background:'#FFF9E9',padding:21,boxSizing:'border-box',opacity:draftReveal,transform:`translateX(${30*(1-draftReveal)}px)`}}><div style={{display:'flex',gap:10,alignItems:'center',fontSize:16,color:'#957022',fontWeight:750}}><Icon name="clock" size={21}/> STILL IN DRAFT</div><div style={{display:'flex',gap:27,marginTop:14}}>{[{title:'Dispute-breakdown UI',sub:'Pineapple · 307733'},{title:'Policy fields + UI',sub:'Treehouse + Pineapple'}].map(i=><div key={i.title} style={{flex:1}}><div style={{fontSize:28,fontWeight:750,color:'#5E4B21'}}>{i.title}</div><div style={{fontSize:19,color:'#857347',marginTop:8}}>{i.sub}</div></div>)}</div></div>
   </div>
   <div style={{marginTop:18,border:'1px solid #D9D8E8',background:'#FFF',borderRadius:12,padding:'18px 22px',opacity:nextReveal,transform:`translateY(${25*(1-nextReveal)}px)`}}>
    <div style={{display:'flex',alignItems:'center',gap:13,fontSize:29,fontWeight:750,color:'#343448'}}><Icon name="share" size={26} color="#497480"/>Deploy the backend → Validate a fresh case in production</div>
    <div style={{marginTop:12,fontSize:26,color:'#56636A'}}>A newly populated D-REX → DCQ case is still unverified.</div>
    <div style={{marginTop:16}}><Source label="Recorded project handoff" meta="Next validation step" slack/></div>
   </div>
   <div style={{marginTop:17,fontSize:26,fontWeight:600,color:'#386C55',opacity:ownerReveal*(1-approval),display:'flex',alignItems:'center',gap:10}}><Icon name="people" size={24}/>Carlos offered to coordinate the example case.</div>
  </div>
  <div style={{position:'absolute',left:32,right:32,top:257,bottom:20,border:'1px solid #E8C17D',borderRadius:16,background:'#FFF8E9',boxShadow:'0 -20px 70px #E8ECEEA0',opacity:approval,transform:`translateY(${90*(1-approval)}px)`,padding:'28px 34px',boxSizing:'border-box'}}>
   <div style={{display:'flex',gap:12,alignItems:'center',color:'#9B6B1B',fontSize:18,fontWeight:800,letterSpacing:1.3}}><Icon name="shield" size={24}/> A DECISION FOR MANISH</div>
   <div style={{fontSize:43,letterSpacing:-1.2,fontWeight:750,color:'#44351B',marginTop:17}}>Launch needs Manish’s review.</div>
   <div style={{fontSize:29,color:'#7C6B4D',marginTop:13}}>Review validation before committing to a date.</div>
   <div style={{display:'flex',gap:18,marginTop:26}}><div style={{flex:1,background:'#FFF',border:'1px solid #E7DDC9',borderRadius:9,padding:'17px 21px'}}><div style={{fontSize:16,color:'#807255'}}>NEXT STEP</div><div style={{marginTop:9,fontSize:26,lineHeight:1.25,fontWeight:700,color:'#4A4334'}}>Confirm deployment.<br/>Validate a fresh dispute case.</div></div><div style={{flex:1,background:'#FFF',border:'1px solid #E7DDC9',borderRadius:9,padding:'17px 21px'}}><div style={{fontSize:16,color:'#A27328'}}>NEEDS MANISH</div><div style={{marginTop:9,fontSize:29,fontWeight:700,color:'#4A4334'}}>Decide when to launch.</div><div style={{marginTop:8,fontSize:23,color:'#7C6B4D'}}>The Peer keeps this decision with you.</div></div></div>
  </div>
 </div>;
};

export const ZoomScene:React.FC<{t:number;speaker?:Speaker|null;timingLines?:TimedLine[]}>=({t,speaker,timingLines})=>{
 const lines:TimedLine[]=timingLines??timing.lines;
 const current=lines.find(l=>{const first=l.words?.[0],last=l.words?.[l.words.length-1];return l.id.startsWith('zoom')&&t+sceneStart>=(first?.start??l.start)&&t+sceneStart<(last?.end??l.end)+.12;});
 const active=speaker===undefined?current?.speaker:speaker;
 const share=p(t,cue('zoom_update')-.35,.65);
 const enter=p(t,0,.7);
 const elapsed=10+Math.floor(t);
 const elapsedLabel=`${String(Math.floor(elapsed/60)).padStart(2,'0')}:${String(elapsed%60).padStart(2,'0')}`;
 return <AbsoluteFill style={{background:'radial-gradient(ellipse at 52% 45%,#233A52 0%,#142235 55%,#0C1523 100%)',fontFamily:'Arial, Helvetica, sans-serif',color:'#F4F6F8'}}>
  <div style={{position:'absolute',left:72,top:25,fontSize:21,fontWeight:500,letterSpacing:.2,color:'#B7C6D9',display:'flex',gap:15,alignItems:'center'}}><span style={{fontWeight:750,color:'#FFF'}}>Zoom</span><span style={{opacity:.5}}>/</span><span>Risk Partner Systems / Premium chargebacks sync</span></div>
  <div style={{position:'absolute',left:70,top:72,width:1780,height:844,border:'1px solid #526171',boxSizing:'border-box',borderRadius:13,overflow:'hidden',background:'#111214',boxShadow:'0 35px 100px #0008',opacity:enter,transform:`translateY(${36*(1-enter)}px) scale(${.98+.02*enter})`}}>
   <div style={{height:39,background:'#292B2F',display:'flex',alignItems:'center',justifyContent:'center',borderBottom:'1px solid #141518',color:'#D5D7D9',fontSize:15,fontWeight:500}}><div style={{position:'absolute',left:17,display:'flex',gap:9}}>{['#FF625A','#FFBE45','#27C840'].map(col=><span key={col} style={{width:12,height:12,borderRadius:'50%',background:col}}/>)}</div>Zoom Meeting</div>
   <div style={{height:39,display:'flex',alignItems:'center',justifyContent:'space-between',padding:'0 21px',color:'#CED2D8',fontSize:16}}><div style={{display:'flex',gap:11,alignItems:'center'}}><Icon name="shield" size={19} color="#65D39A"/><span>Premium chargebacks sync</span><span style={{color:'#777D85',marginLeft:13}}>{elapsedLabel}</span></div><div style={{display:'flex',gap:8,alignItems:'center',border:'1px solid #4B4D54',padding:'4px 9px',borderRadius:5}}><Icon name="grid" size={14}/><span>View</span></div></div>
   <div style={{position:'absolute',left:585,top:42,height:29,display:'flex',alignItems:'center',padding:'0 19px',borderRadius:'0 0 5px 5px',background:'#277544',color:'#FFF',fontSize:15,opacity:share,zIndex:6}}>You are viewing Manish’s AI Peer’s screen<span style={{marginLeft:27,paddingLeft:16,borderLeft:'1px solid #FFFFFF40'}}>View options⌄</span></div>
   <SharedEvidence t={t} share={share}/>
   <Participant id="sarah" name="Carlos Baker" index={0} t={t} active={active==='sarah'} share={share}/>
   <Participant id="alex" name="Noah James" index={1} t={t} active={active==='alex'} share={share}/>
   <Participant id="maya" name="Adam Stone" index={2} t={t} active={active==='maya'} share={share}/>
   <Participant id="peer" name="Manish’s AI Peer" index={3} t={t} active={active==='peer'} share={share}/>
   <Toolbar/>
  </div>
  <div style={{position:'absolute',top:938,left:100,right:100,textAlign:'center',fontSize:27,color:'#c6dfd0',opacity:p(t,cue('zoom_boundary'),.4)}}>Status shared. Manish keeps the launch decision.</div>
 </AbsoluteFill>;
};
