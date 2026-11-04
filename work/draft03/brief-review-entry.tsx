import React from '../../video/node_modules/react';
import {Composition,registerRoot,useCurrentFrame} from '../../video/node_modules/remotion';
import {PersonalBrief,UpdatedBrief} from '../../video/src/draft03/PersonalBrief';
import '../../video/node_modules/@fontsource-variable/manrope';
const View=()=> <PersonalBrief t={useCurrentFrame()/30}/>;
const ReturnView=()=> <UpdatedBrief t={useCurrentFrame()/30}/>;
const Root=()=> <><Composition id="BriefQA" component={View} width={1920} height={1080} fps={30} durationInFrames={1200}/><Composition id="ReturnQA" component={ReturnView} width={1920} height={1080} fps={30} durationInFrames={600}/></>;
registerRoot(Root);
