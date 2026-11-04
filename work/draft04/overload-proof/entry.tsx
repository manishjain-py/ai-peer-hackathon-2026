import React from '../../../video/node_modules/react';
import {registerRoot,Composition,useCurrentFrame} from '../../../video/node_modules/remotion';
import '../../../video/node_modules/@fontsource-variable/manrope';
import {OverloadScene,ReliefScene} from '../../../video/src/draft04/OverloadScene';
const Film=()=>{const t=useCurrentFrame()/30;return <div style={{fontFamily:'Manrope Variable'}}>{t<20?<OverloadScene t={t}/>:<ReliefScene t={t-20}/>}</div>};
registerRoot(()=> <Composition id="OverloadProof" component={Film} width={1920} height={1080} fps={30} durationInFrames={780}/>);
