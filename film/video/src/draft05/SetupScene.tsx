import React from 'react';
import {AbsoluteFill} from 'remotion';
import {C,Peer,Person,Icon,Check,ease,fade,enter,Label} from '../draft02/Shared';

const stroke='#d8e2dc';
const AIRCHAT_AT=17;
const ACCESS_AT=29;
const READY_AT=33;
const SourcePill=({children,color=C.green}:{children:React.ReactNode;color?:string})=><span style={{display:'inline-flex',alignItems:'center',gap:8,fontSize:17,fontWeight:650,padding:'7px 11px',borderRadius:7,background:color+'12',color}}><Icon type="file" size={17}/>{children}</span>;

function Cursor({x,y,click=false}:{x:number;y:number;click?:boolean}){return <div style={{position:'absolute',left:x,top:y,zIndex:20,transform:`scale(${click?.88:1})`}}>{click&&<div style={{position:'absolute',left:-17,top:-17,width:47,height:47,borderRadius:50,border:'3px solid #5dbb91',opacity:.65}}/>}<svg width="37" height="47" viewBox="0 0 37 47"><path d="M4 3 31 25 19 27 14 40Z" fill="#183d33" stroke="white" strokeWidth="3" strokeLinejoin="round"/></svg></div>}

function Chrome({title,children,brand='#48697e',note='ILLUSTRATIVE SETUP'}:{title:string;children:React.ReactNode;brand?:string;note?:string}){return <div style={{height:'100%',background:'white',border:'1px solid '+stroke,borderRadius:17,overflow:'hidden',boxShadow:'0 18px 40px #18382c09'}}><div style={{height:51,boxSizing:'border-box',background:'#f0f3ef',borderBottom:'1px solid '+stroke,display:'flex',alignItems:'center',gap:9,padding:'0 18px'}}>{['#fc7667','#eabd58','#70bf86'].map(col=><span key={col} style={{width:10,height:10,borderRadius:10,background:col}}/>)}<span style={{fontSize:18,color:brand,fontWeight:650,marginLeft:15}}>{title}</span><span style={{fontSize:13,color:'#80918c',marginLeft:'auto'}}>{note}</span></div>{children}</div>}

function Profile({t}:{t:number}){return <Chrome title="OneAirbnb / People" brand="#bf4a54" note="PROFILE: AUG 2026 · ILLUSTRATIVE UI">
  <div style={{padding:'22px 30px',borderBottom:'1px solid #eee',display:'flex',alignItems:'center',gap:28}}><span style={{fontSize:30,color:'#cd535d',fontWeight:800}}>OneAirbnb</span><span style={{fontSize:17,color:'#5e6e73'}}>People　 Teams　 Projects</span><div style={{fontSize:17,marginLeft:'auto',padding:'10px 14px',background:'#f5f5f5',borderRadius:8,color:'#858e91'}}>Search people and teams</div></div>
  <div style={{padding:'27px 31px'}}>
    <div style={{display:'flex',gap:23,alignItems:'center'}}><Person name="Manish" size={83}/><div><div style={{fontSize:35,fontWeight:800}}>Manish Jain</div><div style={{fontSize:23,color:C.muted,marginTop:5}}>Senior Software Engineer · Payments</div></div><div style={{marginLeft:'auto',...enter(t,.3)}}><SourcePill>Profile selected</SourcePill></div></div>
    <div style={{display:'flex',gap:17,marginTop:27}}>{[{label:'TEAM',value:'Risk Partner Systems',d:.7},{label:'CURRENT PROJECT',value:'Premium chargebacks',d:1.4}].map(x=><div key={x.label} style={{flex:1,minWidth:0,padding:22,border:'1px solid #d6e4da',borderRadius:11,background:'#f2f7f1',...enter(t,x.d,12)}}><div style={{fontSize:16,color:C.green,fontWeight:750,letterSpacing:1}}>{x.label}</div><div style={{fontSize:28,fontWeight:750,marginTop:9,whiteSpace:'nowrap'}}>{x.value}</div></div>)}</div>
    <div style={{borderTop:'1px solid #e5ebe5',paddingTop:20,marginTop:24,...enter(t,2)}}><div style={{fontSize:19,color:'#5b7b69',fontWeight:700}}>WHAT YOUR TEAM BUILDS</div><div style={{fontSize:27,marginTop:9}}>Tools for Payments Risk investigations</div><div style={{fontSize:22,color:C.muted,marginTop:9}}>Atrium investigation UI · Case routing · Risk workflows</div></div>
    <div style={{marginTop:21,...enter(t,3)}}><SourcePill>Current work: SC / CFAR policy results</SourcePill></div>
  </div>
</Chrome>}

function GitHubWork({t}:{t:number}){return <Chrome title="GitHub Enterprise / Your work" brand="#30363d" note="STATUS RECORDED 19 SEP 2026">
  <div style={{padding:'18px 30px',borderBottom:'1px solid #e1e6e9'}}><div style={{display:'flex',alignItems:'center',gap:14}}><span style={{fontSize:29,fontWeight:800}}>GitHub</span><span style={{fontSize:24,color:'#2465a0',fontWeight:650}}>airbnb / pineapple + treehouse</span><span style={{fontSize:14,padding:'4px 9px',border:'1px solid #c9d0d7',borderRadius:20,color:'#66717b',marginLeft:'auto'}}>Private</span></div><div style={{fontSize:19,color:'#52606d',marginTop:16}}>〈〉 Code　　Pull requests　　Owners　　Activity</div></div>
  <div style={{padding:'19px 30px'}}>
    <div style={{fontSize:28,fontWeight:750}}>Your versioned work</div><div style={{fontSize:18,color:C.muted,marginTop:5}}>Premium chargebacks · Changes, reviews and ownership</div>
    {[{name:'D-REX dispute-data contract',detail:'Schema + producer changes',status:'Merged',color:'#7c55a0'},{name:'Dispute-breakdown UI',detail:'Pineapple · nova-disputes',status:'Draft',color:'#916b26'},{name:'SC / CFAR policy results',detail:'Treehouse fields + Pineapple UI',status:'Draft',color:'#916b26'}].map((x,i)=><div key={x.name} style={{padding:'10px 3px',borderBottom:'1px solid #e7e9ec',display:'flex',alignItems:'center',gap:15,...enter(t,.15+i*.2,10)}}><span style={{color:x.color,fontSize:23}}>●</span><div><div style={{fontSize:24,fontWeight:650}}>{x.name}</div><div style={{fontSize:17,color:'#6b7883',marginTop:3}}>{x.detail}</div></div><span style={{marginLeft:'auto',fontSize:18,color:x.color,background:x.color+'10',borderRadius:20,padding:'6px 12px'}}>{x.status}</span></div>)}
    <div style={{fontSize:14,fontWeight:750,color:'#668071',letterSpacing:1,marginTop:14}}>RPS CODE AREAS · FROM OWNERS FILES</div><div style={{display:'flex',gap:9,marginTop:8}}><SourcePill>Pennyworth</SourcePill><SourcePill>nova-disputes</SourcePill><SourcePill>Compass / risktooling</SourcePill></div>
  </div>
</Chrome>}

function AirChatWork({t}:{t:number}){
  const installed=t>=.8;
  const work=ease(t,4.2,.45);
  const synced=ease(t,8.3,.5);
  return <Chrome title="AirChat / AI Peer plugin" brand="#654c96" note="PLUGIN CONCEPT · ILLUSTRATIVE LOCAL STATE">
    <div style={{display:'flex',alignItems:'center',gap:15,padding:'22px 29px',borderBottom:'1px solid #e4ddec',background:'#faf8ff'}}><div style={{width:47,height:47,borderRadius:12,background:'#ede5fa',color:'#7856a4',display:'flex',alignItems:'center',justifyContent:'center',fontSize:26,fontWeight:800}}>A</div><div><div style={{fontSize:29,fontWeight:800}}>AirChat</div><div style={{fontSize:18,color:'#7f7192',marginTop:2}}>Your coding workspace</div></div><span style={{marginLeft:'auto',fontSize:20,fontWeight:700,color:'#77578d'}}>Local projects</span></div>
    <div style={{padding:'23px 29px'}}>
      <div style={{padding:'17px 20px',display:'flex',alignItems:'center',gap:18,border:'1px solid #d9cde6',borderRadius:13,background:'#fbf8ff'}}><Peer size={57}/><div><div style={{fontSize:28,fontWeight:800}}>AI Peer</div><div style={{fontSize:20,color:'#796b88',marginTop:5}}>Keep your Peer current as you code</div></div><div style={{marginLeft:'auto',padding:'12px 20px',borderRadius:9,fontSize:22,fontWeight:750,background:installed?'#e4f0e6':'#72519d',color:installed?C.green:'white',display:'flex',alignItems:'center',gap:9}}>{installed&&<Check size={21}/>} {installed?'Enabled':'Install plugin'}</div></div>
      <div style={{position:'relative',marginTop:20,height:326}}>
        <div style={{position:'absolute',inset:0,opacity:fade(t,1.2,.3)*(1-work),transform:`translateY(${-20*work}px)`}}>
          <div style={{fontSize:26,fontWeight:750}}>Choose local workspaces</div><div style={{fontSize:18,color:C.muted,marginTop:5}}>Give AI Peer context from the work you select.</div>
          {[{name:'Pineapple',scope:'nova-disputes · Premium chargebacks',at:1.75},{name:'Treehouse',scope:'Premium-policy backend fields',at:2.5}].map(x=><div key={x.name} style={{display:'flex',alignItems:'center',gap:17,padding:'14px 18px',border:'1px solid #ddd4e5',background:'#fcfaff',borderRadius:10,marginTop:12}}><span style={{width:29,height:29,borderRadius:7,border:'1px solid #b2a2c7',background:t>=x.at?'#72519d':'white',color:'white',display:'flex',alignItems:'center',justifyContent:'center'}}>{t>=x.at&&<Check size={22}/>}</span><div style={{fontSize:24,fontWeight:750}}>{x.name}<div style={{fontSize:18,fontWeight:500,color:C.muted,marginTop:3}}>{x.scope}</div></div></div>)}
          <div style={{display:'flex',alignItems:'center',gap:10,color:C.green,fontSize:21,fontWeight:700,marginTop:18,...enter(t,3.15,8)}}><Check size={21}/>2 local workspaces selected</div>
        </div>
        <div style={{position:'absolute',inset:0,opacity:work,transform:`translateY(${18*(1-work)}px)`}}>
          <div style={{display:'flex',alignItems:'center',gap:10,fontSize:18,fontWeight:750,color:'#796040'}}><span style={{width:9,height:9,background:'#d6a952',borderRadius:10}}/>EXAMPLE LOCAL SESSION<span style={{marginLeft:'auto',fontSize:16,padding:'5px 9px',borderRadius:6,background:'#fff1d5',border:'1px solid #ead3a7'}}>UNCOMMITTED</span></div>
          <div style={{marginTop:13,padding:'16px 20px',border:'1px solid #dbdce3',borderRadius:11,background:'#f8f9fc'}}><div style={{fontSize:28,fontWeight:750}}>Premium chargebacks</div><div style={{fontSize:18,color:'#6c7385',marginTop:4}}>Pineapple / nova-disputes · Local workspace</div><div style={{display:'flex',gap:13,marginTop:17,alignItems:'center'}}><span style={{fontFamily:'monospace',fontSize:20,padding:'5px 9px',background:'#fff0cf',color:'#8a641a',borderRadius:5}}>M</span><span style={{fontSize:25,fontWeight:650}}>SC / CFAR policy UI</span><span style={{fontSize:18,color:'#8a6c30',marginLeft:'auto'}}>Not yet committed</span></div></div>
          <div style={{display:'flex',alignItems:'center',gap:11,fontSize:21,color:'#61716e',marginTop:15,...enter(t,5.8,8)}}><Icon type="file" size={20}/><span>Current task: refine the policy view</span></div>
          <div style={{marginTop:15,padding:'12px 15px',borderRadius:9,background:synced>.5?'#e7f2e8':'#f1edf8',display:'flex',alignItems:'center',gap:11,color:synced>.5?C.green:'#796992',fontSize:22,fontWeight:750,...enter(t,7.15,8)}}>{synced>.5?<Check size={23}/>:<Peer size={25}/>} {synced>.5?'Project, task and local changes → understood':'Updating your Peer’s current context…'}</div>
        </div>
      </div>
    </div>
    {t<1.05&&<Cursor x={914} y={209} click={t>=.8}/>} 
  </Chrome>;
}

function WorkSources({t}:{t:number}){
  const local=t-(AIRCHAT_AT-11),air=fade(local,0,.34);
  return <div style={{height:'100%',position:'relative'}}><div style={{position:'absolute',inset:0,opacity:1-air,transform:`translateX(${-25*air}px)`}}><GitHubWork t={t}/></div><div style={{position:'absolute',inset:0,opacity:air,transform:`translateX(${24*(1-air)}px)`}}><AirChatWork t={local}/></div></div>;
}

function Permissions({t}:{t:number}){const slack=ease(t,.55,.3),zoom=ease(t,1.6,.3);return <Chrome title="AI Peer / Choose access"><div style={{padding:'25px 31px'}}><div style={{fontSize:36,fontWeight:800}}>Where can your Peer help?</div><div style={{fontSize:24,color:C.muted,marginTop:7}}>You choose the access. You keep the decisions.</div>{[{name:'Slack',sub:'Read and reply in selected project channels',value:slack,color:'#6c2b70'},{name:'Zoom',sub:'Join meetings you delegate · Identify as AI',value:zoom,color:'#2970ed'}].map((x,i)=><div key={x.name} style={{padding:'23px 24px',marginTop:19,border:'1px solid #d9e2dc',borderRadius:13,display:'flex',gap:20,alignItems:'center',background:i?'#f5f8ff':'#fcf8fd'}}><div style={{width:64,height:64,borderRadius:13,background:x.color+'16',color:x.color,fontSize:39,display:'flex',justifyContent:'center',alignItems:'center',fontWeight:800}}>{i?<Icon type="message" size={34}/>:'#'}</div><div><div style={{fontSize:29,fontWeight:750}}>{x.name}</div><div style={{fontSize:21,color:C.muted,marginTop:7}}>{x.sub}</div></div><div style={{marginLeft:'auto',width:72,height:39,borderRadius:30,background:x.value>.5?C.green:'#cbd5d0',padding:4,boxSizing:'border-box'}}><div style={{width:31,height:31,borderRadius:20,background:'white',transform:`translateX(${33*x.value}px)`,boxShadow:'0 2px 6px #0002'}}/></div></div>)}<div style={{display:'flex',alignItems:'center',gap:10,fontSize:21,color:'#64806e',marginTop:20}}><Check size={22}/>Approved email & company events <span style={{marginLeft:'auto',fontSize:17}}>Read only</span></div><div style={{background:'#fff6e3',border:'1px solid #e8d5b1',borderRadius:10,padding:'16px 21px',fontSize:23,fontWeight:700,color:'#876626',marginTop:20,...enter(t,2.35,9)}}>Ask me before commitments or changes.</div></div>{t<2.15&&<Cursor x={979} y={t<1.15?238:367} click={(t>.55&&t<.8)||(t>1.6&&t<1.85)}/>}</Chrome>}

function Understanding({t}:{t:number}){
  const local=t>AIRCHAT_AT+8.55;
  const rows=[
    {label:'YOU',value:'Manish Jain',detail:'Senior Software Engineer · Payments',at:4.5},
    {label:'YOUR TEAM',value:'Risk Partner Systems',detail:'Payments Risk investigation tools',at:5.2},
    {label:'CURRENT PROJECT',value:'Premium chargebacks',detail:'SC / CFAR policy results',at:6.1},
    {label:local?'VERSIONED + LOCAL WORK':'YOUR VERSIONED WORK',value:local?'GitHub + AirChat':'Pineapple + Treehouse',detail:local?'Reviews, current task and uncommitted changes':'Code, reviews and scoped ownership',at:11.7},
  ];
  return <div style={{height:'100%',border:'1px solid #cce0d1',borderRadius:18,background:'#edf5ec',padding:'24px 26px',boxSizing:'border-box'}}>
    <div style={{display:'flex',alignItems:'center',gap:14}}><Peer size={58}/><div><div style={{fontSize:28,fontWeight:800}}>Your Peer is learning</div><div style={{fontSize:18,color:'#6a8771',marginTop:5}}>One connected picture of your work</div></div></div>
    <div style={{marginTop:21}}>{rows.map((x,i)=><div key={i} style={{display:'flex',gap:15,marginBottom:10,...enter(t,x.at,13)}}><div style={{width:12,display:'flex',flexDirection:'column',alignItems:'center'}}><div style={{width:10,height:10,background:C.green,borderRadius:8,marginTop:10}}/>{i<3&&<div style={{width:2,background:'#b4d5bf',flex:1,marginTop:7}}/>}</div><div style={{flex:1,minWidth:0,border:'1px solid #d9e7d8',borderRadius:10,padding:'11px 16px',background:'#ffffffe0'}}><div style={{fontSize:13,letterSpacing:1.3,color:'#668a73',fontWeight:750}}>{x.label}</div><div style={{fontSize:27,fontWeight:750,marginTop:4,whiteSpace:'nowrap'}}>{x.value}</div><div style={{fontSize:17,color:C.muted,marginTop:4}}>{x.detail}</div></div></div>)}</div>
    <div style={{display:'flex',gap:8,flexWrap:'wrap',...enter(t,AIRCHAT_AT+8.7,8)}}><SourcePill>Before the next commit</SourcePill><SourcePill>With chosen access</SourcePill></div>
  </div>;
}

export function SetupScene({t}:{t:number}){
  const start=ease(t,3.45,.6),ready=ease(t,READY_AT,.65);
  const stage=t<4?0:t<11?1:t<ACCESS_AT?2:t<READY_AT?3:4;
  return <AbsoluteFill style={{background:C.paper,color:C.ink,overflow:'hidden'}}>
    <div style={{position:'absolute',left:92,top:67,display:'flex',alignItems:'center',gap:13}}><Peer size={43}/><b style={{fontSize:25}}>AI Peer</b></div>
    <div style={{position:'absolute',top:143,left:92,right:92,display:'flex',alignItems:'center',gap:15,opacity:1-ready}}>{['Create','Know you','Know your work','Choose access','Ready'].map((label,i)=><React.Fragment key={label}><div style={{display:'flex',gap:12,alignItems:'center',fontSize:23,color:i<=stage?C.green:'#8f9d94',fontWeight:i===stage?750:550}}><span style={{display:'flex',alignItems:'center',justifyContent:'center',width:29,height:29,borderRadius:20,background:i<=stage?'#d9eddd':'#e9eee8',fontSize:16}}>{i<stage?'✓':i+1}</span>{label}</div>{i<4&&<div style={{height:1,width:80,background:'#cbd9cf'}}/>}</React.Fragment>)}</div>
    <div style={{position:'absolute',left:0,right:0,top:270,textAlign:'center',opacity:1-start,transform:`scale(${1+.08*start})`}}><Label>Make a little room for yourself</Label><div style={{fontSize:79,fontWeight:800,letterSpacing:-3,marginTop:21}}>Start with your Peer.</div><div style={{display:'inline-flex',alignItems:'center',gap:24,marginTop:60,padding:'29px 44px',borderRadius:17,background:C.green,color:'white',fontSize:38,fontWeight:750,boxShadow:'0 17px 50px #226c4d25',transform:`scale(${1-.025*fade(t,2.55,.08)*(1-fade(t,2.9,.1))})`}}><Peer size={62}/>Create my AI Peer<Icon type="arrow" size={35}/></div><div style={{fontSize:24,color:C.muted,marginTop:25}}>A personal teammate, built around your work.</div></div>
    {t<3.5&&<Cursor x={1380-210*ease(t,.9,1.6)} y={795-237*ease(t,.9,1.6)} click={t>2.55&&t<2.8}/>}
    <div style={{position:'absolute',left:91,top:225,width:1090,height:657,opacity:start*(1-ready),transform:`translateY(${25*(1-start)}px)`}}>{t<11?<Profile t={t-4}/>:t<ACCESS_AT?<WorkSources t={t-11}/>:<Permissions t={t-ACCESS_AT}/>}</div>
    <div style={{position:'absolute',left:1210,top:225,width:620,height:657,opacity:start*(1-ready),transform:`translateX(${35*(1-start)}px)`}}><Understanding t={t}/></div>
    <div style={{position:'absolute',top:903,left:92,right:92,fontSize:22,color:'#67826e',textAlign:'center',opacity:start*(1-ready)}}>{stage===1?'Profile → team → current projects':stage===2?(t<AIRCHAT_AT?'GitHub → versioned work and ownership':'AirChat + AI Peer plugin → local work, before it is committed'):stage===3?'Chosen access → clear boundaries':'Your context is taking shape'}</div>
    <div style={{position:'absolute',inset:0,display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',opacity:ready,transform:`scale(${.92+.08*ready})`,paddingBottom:70}}><Peer size={133}/><div style={{fontSize:86,fontWeight:800,letterSpacing:-4,marginTop:31}}>Your Peer is ready.</div><div style={{fontSize:32,color:C.green,marginTop:18}}>Your work, in progress. Your choices, always.</div><div style={{display:'flex',gap:17,marginTop:37}}>{['Personal brief','Project conversations','Delegated meetings'].map(x=><div key={x} style={{fontSize:23,padding:'14px 20px',borderRadius:11,background:'white',border:'1px solid #d1e1d5',display:'flex',gap:10,alignItems:'center'}}><span style={{color:C.green}}><Check/></span>{x}</div>)}</div></div>
  </AbsoluteFill>;
}
