import React from 'react';
import {Img,staticFile} from 'remotion';
import {ease} from '../draft02/Shared';

/** Generated fictional employee; three locked-camera photographic expression states.
 * Keep the base body/desk fixed, and dissolve only the head region of the edits.
 * No likeness, webcam claim, walking, lip sync or procedural puppet motion.
 */
export function SeatedEmployee({t,relief=0,shift=0}:{t:number;relief?:number;shift?:number}){
 const recovery=ease(relief,.48,.42);
 const attentive=ease(t,8.68,.28)*(1-recovery);
 const concerned=ease(t,12.85,.28)*(1-recovery);
 const push=1+.014*ease(Math.min(t,24),0,24);
 const faceMask='radial-gradient(ellipse 28% 27% at 50% 24%, #000 0%, #000 69%, transparent 100%)';
 const frame:React.CSSProperties={position:'absolute',inset:0,width:'100%',height:'100%',objectFit:'fill'};
 return <div style={{position:'absolute',left:650,top:295,width:620,height:661.37,transform:`translateX(${-230*shift}px) scale(${push})`,transformOrigin:'50% 100%',filter:'drop-shadow(0 12px 18px #193a3010)',pointerEvents:'none'}}>
  <Img src={staticFile('draft07/opening/employee-happy.png')} style={frame}/>
  <Img src={staticFile('draft07/opening/employee-neutral.png')} style={{...frame,opacity:attentive,maskImage:faceMask,WebkitMaskImage:faceMask}}/>
  <Img src={staticFile('draft07/opening/employee-concerned.png')} style={{...frame,opacity:concerned,maskImage:faceMask,WebkitMaskImage:faceMask}}/>
 </div>;
}
