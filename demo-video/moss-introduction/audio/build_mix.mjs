#!/usr/bin/env node
// New introduction only; exact V3 soundtrack is retained outside the changed opening.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {mix, voiceOverMusic, measure} from '../../film/tools/mix.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),demo=path.resolve(here,'../..'),film=path.join(demo,'film');
const cut=path.join(film,'cuts/blended-moss-v4'),read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const shots=read(path.join(cut,'shots.json')),narration=read(path.join(cut,'narration.json'));
const script=read(path.join(cut,'script.json')),cfg=read(path.join(cut,'mix.json'));
const captions=Object.fromEntries(script.lines.map(l=>[l.id,l.caption]));
const abs=p=>path.resolve(film,p);
const lines=narration.lines.map(l=>({id:l.id,file:abs(l.file),start:shots.narration[l.id],seconds:l.seconds,rms_dbfs:l.rms_dbfs,call:captions[l.id]==='screen'}));
if(lines.some(l=>['p02','n07'].includes(l.id)))throw Error('Superseded voice line present');
const plan={seconds:shots.seconds,lines,sound:[],music:{...cfg.music,file:abs(cfg.music.file)},sfx:cfg.sfx.map(e=>({...e,file:abs(e.file)}))};
const candidate=mix(plan,path.resolve(here,'../.build/audio/stems'),cfg.master);
const run=spawnSync('uv',['run','--quiet','--with','numpy','python',path.join(here,'splice_mix.py')],{stdio:'inherit'});
if(run.status!==0)throw Error('PCM assembly failed');
const separation=voiceOverMusic(plan,candidate.stems);
const report={seconds:shots.seconds,new_line:'p02v4',new_line_start:15.0,
 lines:lines.map(({file,...l})=>({...l,file:path.relative(demo,file)})),
 retained_voice_lines:21,music_bed:'moss-refinement/audio/bed-moss-v3.wav',music_unchanged:true,
 after:measure(path.join(here,'mix.wav')),voice_over_music:separation,
 note:'Exact V3 mixed PCM retained outside14–24.6; old introduction replaced using sameMatilda/Multilingualv2. Final AAC checked separately. Direct listening not claimed.'};
fs.writeFileSync(path.join(here,'mix-report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({loudness:report.after,intro:separation.find(l=>l.id==='p02v4')},null,2));
