import React from 'react';
import {C, Peer, Icon, ease, enter} from '../draft02/Shared';

// Local scene time 0–40s. Authored concept UI: sources, relevance and actions
// remain separate so a prepared artifact cannot read as a completed task.
const ink = '#18312e';
const muted = '#71817b';
const border = '#dde5de';
const green = '#23664b';
const font = 'Manrope Variable, Manrope, sans-serif';
const lerp = (a:number,b:number,p:number)=>a+(b-a)*p;
const clamp = (v:number)=>Math.max(0,Math.min(1,v));
const fadeOut = (t:number,end:number)=>1-ease(t,end-.28,.28);

type Item = {
  number:string; category:string; title:string; detail:string; accent:string;
  pale:string; source:string; sourceTime:string; subject:string; author:string;
  before:string; highlight:string; after:string; chip:string; whyTitle:string;
  why:string; anchor:string; artifactTitle:string; artifact:string; action:string;
};
const items:Item[] = [
  {number:'01',category:'Needs attention',title:'A change to your dispute feed',
    detail:'Chargebacks uses the current mapping. Review the migration.',accent:'#ab682b',pale:'#fff1dd',
    source:'Email',sourceTime:'8:42 AM',subject:'Dispute feed migration',author:'Data Platform → service owners',
    before:'The dispute feed schema changes Friday.',highlight:'The existing outcome field is being retired.',
    after:'Review your mapper against the migration guide before switching.',chip:'Dispute feed · migration',
    whyTitle:'This affects your service.',why:'Your Chargebacks mapper still uses the current outcome field.',
    anchor:'Chargebacks  /  event-mapper.ts',artifactTitle:'Ready to review',
    artifact:'Migration guide + affected code',action:'Review migration'},
  {number:'02',category:'Worth joining',title:'The right conversation, today',
    detail:'Data office hours cover your open late-reversal check.',accent:'#4d68a9',pale:'#edf1ff',
    source:'Team events',sourceTime:'8:51 AM',subject:'Data office hours',author:'Today · 3:00 PM · Data Platform',
    before:'Bring your questions about dispute events.',highlight:'Today: late reversals and replay examples.',
    after:'We will walk through results that change after the first event.',chip:'Office hours · late reversals',
    whyTitle:'One of your open checks.',why:'Your test plan still needs an example of a result changing later.',
    anchor:'Chargebacks  /  validation plan',artifactTitle:'Your question, prepared',
    artifact:'“How should we verify late outcome changes?”',action:'Review question'},
  {number:'03',category:'Worth exploring',title:'An opportunity for your idea',
    detail:'The company hackathon has an agent track. Your idea fits.',accent:'#8a5c92',pale:'#f7ecfa',
    source:'Company events',sourceTime:'8:56 AM',subject:'Company hackathon',author:'Sign-ups open Friday',
    before:'Bring the idea you have been thinking about.',highlight:'Agent track: build a teammate for better work.',
    after:'Explore a new approach. Team up. Make a working demo.',chip:'Hackathon · agent track',
    whyTitle:'You already have a starting point.',why:'Your saved idea: an agent that makes project handoffs easier.',
    anchor:'Your saved ideas  /  smarter handoffs',artifactTitle:'Draft pitch',
    artifact:'“A personal agent that turns scattered project updates into a useful handoff.”',action:'Save for later'},
];

function Pill({children,color=green,bg='#edf4ee',size=21}:{children:React.ReactNode;color?:string;bg?:string;size?:number}){
  return <span style={{display:'inline-flex',alignItems:'center',gap:9,padding:'9px 14px',borderRadius:12,background:bg,color,fontSize:size,fontWeight:650,lineHeight:1.25}}>{children}</span>;
}
function Arrow({size=25}:{size?:number}){return <Icon type="arrow" size={size}/>;}
function Cursor({x,y,click=0}:{x:number,y:number,click?:number}){
  return <div style={{position:'absolute',left:x,top:y,transform:`scale(${1-.11*click})`,transformOrigin:'0 0',filter:'drop-shadow(0 3px 3px #0004)',zIndex:20}}><svg width="34" height="44" viewBox="0 0 34 44"><path d="M3 2v33l9-9 7 15 7-3-8-14 13-1Z" fill="white" stroke={ink} strokeWidth="2.5"/></svg></div>;
}
function Sidebar({t}:{t:number}){
  const sourceIndex = t < 14.6 ? 0 : 3;
  return <div style={{position:'absolute',left:0,top:0,bottom:0,width:258,background:'#f1f4ed',borderRight:`1px solid ${border}`,padding:'31px 24px'}}>
    <div style={{display:'flex',alignItems:'center',gap:13}}><Peer size={47}/><span style={{fontSize:28,fontWeight:800,letterSpacing:-.8}}>AI Peer</span></div>
    <div style={{marginTop:49,fontSize:15,fontWeight:750,color:muted,letterSpacing:2}}>YOUR WORKSPACE</div>
    {[['home','For you'],['message','Conversations'],['file','Your context']].map(([icon,label],i)=><div key={label} style={{display:'flex',alignItems:'center',gap:13,padding:'15px 13px',marginTop:10,borderRadius:12,background:i===0?'#deebdd':'transparent',fontSize:23,fontWeight:i===0?750:550,color:i===0?green:muted}}><span style={{display:'flex',flexShrink:0}}><Icon type={icon} size={25}/></span>{label}</div>)}
    <div style={{marginTop:48,paddingTop:26,borderTop:`1px solid ${border}`}}>
      <div style={{fontSize:15,fontWeight:750,color:muted,letterSpacing:1.5}}>APPROVED SOURCES</div>
      {['Email','Slack','Docs','Company events'].map((s,i)=><div key={s} style={{marginTop:19,display:'flex',alignItems:'center',gap:9,color:i===sourceIndex&&t>5&&t<35.6?green:muted,fontSize:20,fontWeight:580}}><span style={{height:7,width:7,borderRadius:4,background:i===sourceIndex&&t>5&&t<35.6?'#5c9c6d':'#a2b6a5'}}/>{s}</div>)}
      <div style={{marginTop:27,fontSize:17,color:muted,lineHeight:1.6}}>Last checked<br/><strong style={{fontWeight:700,color:ink}}>Today, 8:59 AM</strong></div>
    </div>
    <div style={{position:'absolute',bottom:27,left:25,display:'flex',alignItems:'center',gap:11}}><div style={{width:39,height:39,borderRadius:13,background:'#d5e3e8',display:'flex',alignItems:'center',justifyContent:'center',fontSize:21,fontWeight:750}}>M</div><div style={{fontSize:19,fontWeight:700}}>Manish<span style={{display:'block',fontSize:14,fontWeight:500,color:muted}}>Personal workspace</span></div></div>
  </div>;
}
function Overview({t,final=false}:{t:number,final?:boolean}){
  return <div style={{position:'absolute',left:305,top:245,right:50}}>
    {items.map((item,i)=><div key={item.title} style={{...enter(t,final?0:i*.13,15),height:147,marginBottom:17,background:'#fff',border:`1px solid ${border}`,borderRadius:19,padding:'23px 27px',display:'flex',alignItems:'center',gap:23,boxShadow:'0 4px 13px #203c2510'}}>
      <div style={{fontSize:24,fontWeight:800,color:item.accent,background:item.pale,width:57,height:57,borderRadius:17,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>{item.number}</div>
      <div style={{flex:1,minWidth:0}}><div style={{fontSize:18,color:item.accent,fontWeight:750,marginBottom:5}}>{item.category}</div><div style={{fontSize:32,fontWeight:750,letterSpacing:-.75}}>{item.title}</div><div style={{fontSize:25,color:muted,marginTop:5}}>{item.detail}</div></div>
      <div style={{minWidth:205,textAlign:'right'}}><Pill color={i===2&&final?green:item.accent} bg={i===2&&final?'#e2f0df':item.pale} size={20}>{i===2&&final?'✓ Saved for later':item.action}<Arrow size={20}/></Pill></div>
    </div>)}
    <div style={{...enter(t,final?.3:.75,10),marginTop:22,color:muted,fontSize:21,display:'flex',alignItems:'center',gap:10}}><Peer size={28}/>{final?'Your priorities. Your choice.':'Source → relevance → a useful next step.'}</div>
  </div>;
}
function Focus({item,t,index}:{item:Item;t:number;index:number}){
  const sourceIn=ease(t,0,.45);
  const link=ease(t,.72,.78);
  const why=ease(t,1.1,.58);
  const next=ease(t,2.15,.5);
  const save=index===2&&t>=9;
  const click=index===2?Math.sin(clamp((t-8.82)/.32)*Math.PI):0;
  return <div style={{position:'absolute',left:305,top:245,right:50,opacity:sourceIn,transform:`translateY(${12*(1-sourceIn)}px)`}}>
    <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:22}}><Pill color={item.accent} bg={item.pale} size={20}>{item.number} / {item.category}</Pill><div style={{fontSize:29,fontWeight:750,letterSpacing:-.5}}>{item.title}</div></div>
    <div style={{position:'relative',height:390,display:'grid',gridTemplateColumns:'1fr 70px 1fr'}}>
      <div style={{border:`1px solid ${border}`,background:'#fff',borderRadius:20,overflow:'hidden',boxShadow:'0 9px 22px #203c250a'}}>
        <div style={{padding:'18px 24px',display:'flex',alignItems:'center',justifyContent:'space-between',borderBottom:`1px solid ${border}`,color:muted,fontSize:18}}><div style={{display:'flex',alignItems:'center',gap:9}}><Icon type={index===0?'message':'file'} size={23}/>{item.source}</div>{item.sourceTime}</div>
        <div style={{padding:'22px 26px'}}><div style={{fontSize:30,fontWeight:750,letterSpacing:-.5}}>{item.subject}</div><div style={{fontSize:19,color:muted,marginTop:7}}>{item.author}</div>
          <div style={{marginTop:25,fontSize:28,lineHeight:1.48,color:'#42564f'}}>{item.before}<br/><span style={{background:`linear-gradient(90deg,${item.pale} ${100*ease(t,.45,.65)}%,transparent ${100*ease(t,.45,.65)}%)`,color:ink,fontWeight:720,boxDecorationBreak:'clone',WebkitBoxDecorationBreak:'clone',padding:'2px 3px'}}>{item.highlight}</span><div style={{marginTop:13,fontSize:24,color:muted,lineHeight:1.45}}>{item.after}</div></div>
        </div>
      </div>
      <div style={{display:'flex',alignItems:'center',justifyContent:'center',color:item.accent,opacity:link}}><Arrow size={35}/></div>
      <div style={{border:`1px solid ${border}`,borderRadius:20,background:'#fbfcf8',padding:'25px 28px',opacity:why,transform:`translateX(${16*(1-why)}px)`}}>
        <div style={{display:'flex',alignItems:'center',gap:9,color:green,fontSize:17,fontWeight:800,letterSpacing:1.5}}><Peer size={27}/> WHY IT MATTERS TO YOU</div>
        <div style={{fontSize:33,fontWeight:780,letterSpacing:-.8,marginTop:19,lineHeight:1.25}}>{item.whyTitle}</div>
        <div style={{fontSize:28,color:'#53665d',lineHeight:1.48,marginTop:17}}>{item.why}</div>
        <div style={{fontSize:19,color:muted,marginTop:24,padding:'12px 14px',borderRadius:11,background:'#eef1e9',display:'flex',gap:8,alignItems:'center'}}><Icon type="file" size={21}/>{item.anchor}</div>
        {index===0&&<div style={{marginTop:17,fontSize:22,color:'#7e6340',fontFamily:'ui-monospace, SFMono-Regular, monospace'}}>mapper ← event.outcome</div>}
        {index===1&&<div style={{marginTop:17,fontSize:22,color:'#5f75a4'}}>Open check · late outcome changes</div>}
        {index===2&&<div style={{marginTop:17,fontSize:22,color:'#8a5c92'}}>Saved by you · earlier this week</div>}
      </div>
      {link>0&&link<1&&<div style={{position:'absolute',left:lerp(155,795,link),top:lerp(184,327,link),zIndex:5,opacity:Math.sin(link*Math.PI),transform:`scale(${.91+.09*Math.sin(link*Math.PI)})`}}><Pill color={item.accent} bg={item.pale}>{item.chip}</Pill></div>}
    </div>
    <div style={{position:'relative',opacity:next,transform:`translateY(${15*(1-next)}px)`,marginTop:18,minHeight:121,background:save?'#e4efdd':item.pale,borderRadius:17,padding:'20px 24px',display:'flex',alignItems:'center',gap:24}}>
      <div style={{flex:1}}><div style={{fontSize:17,fontWeight:800,letterSpacing:1.3,color:item.accent,marginBottom:6}}>{item.artifactTitle.toUpperCase()}</div><div style={{fontSize:index===2?28:29,fontWeight:650,lineHeight:1.35,letterSpacing:-.3}}>{item.artifact}</div></div>
      <div style={{background:save?'#487143':ink,color:'white',fontSize:23,fontWeight:700,padding:'17px 21px',borderRadius:12,display:'flex',alignItems:'center',gap:14,whiteSpace:'nowrap',transform:`scale(${1-click*.04})`}}>{save?'✓ Saved for later':item.action}{!save&&<Arrow size={23}/>}</div>
    </div>
    {index===2&&t>7.8&&t<10.4&&<div style={{opacity:Math.min(ease(t,7.8,.22),1-ease(t,10,.3))}}><Cursor x={lerp(1260,1187,ease(t,7.8,.7))} y={lerp(611,542,ease(t,7.8,.7))} click={click}/></div>}
  </div>;
}

export function PersonalBrief({t}:{t:number}){
  const opening=t<5;
  const final=t>=35.6;
  const index=t<14.6?0:t<24.5?1:2;
  const start=[5,14.6,24.5][index];
  const end=[14.6,24.5,35.6][index];
  const f=clamp(t);
  return <div style={{position:'absolute',inset:0,background:'#edf1e9',color:ink,fontFamily:font,overflow:'hidden'}}>
    <div style={{position:'absolute',width:850,height:850,borderRadius:'50%',background:'radial-gradient(circle,#d5e7cd80,transparent 68%)',right:-270,top:-340}}/>
    <div style={{position:'absolute',left:89,top:78,width:1742,height:861,borderRadius:27,background:'#f9faf6',border:'1px solid #cfdbcf',boxShadow:'0 28px 75px #253b3522',overflow:'hidden',transform:`translateY(${15*(1-ease(t,0,.65))}px) scale(${.988+.012*ease(t,0,.65)})`,opacity:f}}>
      <Sidebar t={t}/>
      <div style={{position:'absolute',left:305,top:35,right:50,display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:`1px solid ${border}`,paddingBottom:21}}><div style={{display:'flex',alignItems:'center',gap:10,fontSize:20,color:muted}}><Icon type="home" size={22}/> Your space <span style={{color:'#b4bfb5'}}> / </span><span style={{color:ink,fontWeight:750}}>For you</span></div><div style={{fontSize:18,color:muted,display:'flex',alignItems:'center',gap:8}}><Icon type="clock" size={21}/> 9:00 AM · Bengaluru</div></div>
      <div style={{position:'absolute',left:305,top:116,right:50}}><div style={{display:'flex',alignItems:'center',justifyContent:'space-between'}}><div style={{fontSize:44,fontWeight:800,letterSpacing:-1.7}}>{final?'A clear next move.':'Good morning, Manish.'}</div><Pill bg="#e8eee3" size={18}><span style={{width:7,height:7,borderRadius:4,background:'#6d9866'}}/> New since your last check</Pill></div><div style={{fontSize:26,color:muted,marginTop:10}}>{final?'Relevant changes. Useful opportunities. Ready for you.':'Three things worth your time.'}</div></div>
      {opening&&<div style={{opacity:fadeOut(t,5)}}><Overview t={t}/></div>}
      {!opening&&!final&&<div style={{opacity:fadeOut(t,end)}}><Focus key={index} item={items[index]} index={index} t={t-start}/></div>}
      {final&&<Overview final t={t-35.6}/>}
    </div>
  </div>;
}

export function UpdatedBrief({t}:{t:number}) {
  const rows=[
    {title:'Field mapping received',body:'Sarah shared the new mapping for Dispute Events.',source:'Sarah · Slack',icon:'message',color:'#397e58',pale:'#e8f2e4'},
    {title:'Test examples offered',body:'Sarah will send examples for both open checks.',source:'Sarah · Zoom',icon:'file',color:'#4e6dab',pale:'#edf1fb'},
    {title:'One decision needs you',body:'Follow up on validation, then decide about Friday.',source:'Manish · decision pending',icon:'arrow',color:'#97652c',pale:'#fff1dc'},
    {title:'Hackathon pitch',body:'Your handoff idea is ready to pick up when you are.',source:'Saved for later',icon:'file',color:'#82518a',pale:'#f4ebf7'},
  ];
  return <div style={{position:'absolute',inset:0,background:'#edf1e9',color:ink,fontFamily:font,overflow:'hidden'}}>
    <div style={{position:'absolute',left:89,top:78,width:1742,height:861,borderRadius:27,background:'#f9faf6',border:'1px solid #cfdbcf',boxShadow:'0 28px 75px #253b3522',overflow:'hidden',...enter(t,0,14)}}>
      <Sidebar t={38}/>
      <div style={{position:'absolute',left:305,top:35,right:50,display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:`1px solid ${border}`,paddingBottom:21}}><div style={{display:'flex',alignItems:'center',gap:10,fontSize:20,color:muted}}><Icon type="home" size={22}/> Your space <span style={{color:'#b4bfb5'}}> / </span><span style={{color:ink,fontWeight:750}}>For you</span></div><div style={{fontSize:18,color:muted}}>Next morning · 9:00 AM</div></div>
      <div style={{position:'absolute',left:305,top:115,right:50}}><div style={{fontSize:43,fontWeight:800,letterSpacing:-1.6}}>New since your last brief.</div><div style={{fontSize:26,color:muted,marginTop:11}}>The conversations moved forward. Your priorities moved with them.</div></div>
      <div style={{position:'absolute',left:305,top:241,right:50}}>
        {rows.map((row,i)=><div key={row.title} style={{...enter(t,.3+i*.13,12),height:i===2?129:114,padding:'19px 24px',marginBottom:13,borderRadius:18,border:`1px solid ${i===2?'#d7bd91':border}`,background:i===2?'#fff9ed':'#fff',display:'flex',gap:20,alignItems:'center',boxShadow:i===2?`0 0 0 ${4*ease(t,7.2,.6)}px #f6e7cc`:'0 3px 10px #21392505'}}>
          <div style={{width:52,height:52,borderRadius:15,background:row.pale,color:row.color,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}><Icon type={row.icon} size={27}/></div>
          <div style={{flex:1}}><div style={{fontSize:31,fontWeight:780,letterSpacing:-.7}}>{row.title}</div><div style={{fontSize:28,color:muted,marginTop:6,lineHeight:1.3}}>{row.body}</div></div>
          <Pill color={row.color} bg={row.pale} size={19}>{row.source}</Pill>
        </div>)}
        <div style={{marginTop:21,display:'flex',justifyContent:'space-between',alignItems:'center',...enter(t,8.2,12)}}><div style={{fontSize:22,color:muted,display:'flex',gap:10,alignItems:'center'}}><Peer size={28}/> Prepared for your judgment.</div><div style={{background:ink,color:'white',padding:'16px 23px',fontSize:24,fontWeight:700,borderRadius:13,display:'flex',gap:18,alignItems:'center'}}>Review validation plan <Arrow size={26}/></div></div>
      </div>
    </div>
  </div>;
}
