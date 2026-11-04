import React from 'react';
export {C,Peer,Icon,Check,ease,fade,enter,Label} from '../draft02/Shared';
/** Initial avatars avoid implying a generated photograph is a real colleague. */
export function Person({name,size=50}:{name:string;size?:number}){const initials=name.startsWith('D-REX')?'DX':name.split(' ').map(x=>x[0]).slice(0,2).join('');return <div style={{width:size,height:size,borderRadius:size*.2,background:name.startsWith('D-REX')?'#d1dce9':name.startsWith('Neel')?'#d2dfd5':'#ded4c7',color:'#263c37',fontSize:size*.36,fontWeight:750,display:'flex',justifyContent:'center',alignItems:'center',flexShrink:0}}>{initials}</div>}
