import React from 'react';
import {registerRoot, Composition} from 'remotion';
import {AIPeerFilm} from './Film';
import {AIPeerDraft02} from './draft02/Film02';
import {AIPeerDraft03} from './draft03/Film03';
import script03 from '../public/draft03/script.json';
import {AIPeerDraft04} from './draft04/Film04';
import script04 from '../public/draft04/script.json';
import {AIPeerDraft05} from './draft05/Film05';
import script05 from '../public/draft05/script.json';
import {AIPeerDraft06} from './draft06/Film06';
import script06 from '../public/draft06/script.json';
import {AIPeerDraft07} from './draft07/Film07';
import script07 from '../public/draft07/script.json';
import '@fontsource-variable/manrope';

const Root: React.FC = () => <><Composition id="AIPeerDraft01" component={AIPeerFilm} width={1920} height={1080} fps={30} durationInFrames={3600}/><Composition id="AIPeerDraft02" component={AIPeerDraft02} width={1920} height={1080} fps={30} durationInFrames={6723}/><Composition id="AIPeerDraft03" component={AIPeerDraft03} width={1920} height={1080} fps={30} durationInFrames={Math.round(script03.duration*30)}/><Composition id="AIPeerDraft04" component={AIPeerDraft04} width={1920} height={1080} fps={30} durationInFrames={Math.round(script04.duration*30)}/><Composition id="AIPeerDraft05" component={AIPeerDraft05} width={1920} height={1080} fps={30} durationInFrames={Math.round(script05.duration*30)}/><Composition id="AIPeerDraft06" component={AIPeerDraft06} width={1920} height={1080} fps={30} durationInFrames={Math.round(script06.duration*30)}/><Composition id="AIPeerDraft07" component={AIPeerDraft07} width={1920} height={1080} fps={30} durationInFrames={Math.round(script07.duration*30)}/></>;
registerRoot(Root);
