#!/usr/bin/env node
// Audio-only build from the new cut's saved narration and explicit timeline.
// No visual renderer, private source, generation or voice recreation is needed.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {mix, voiceOverMusic, measure} from '../../film/tools/mix.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const demo=path.resolve(here,'../..'),film=path.join(demo,'film');
const cut=path.join(film,'cuts/blended-moss-v3');
const read=file=>JSON.parse(fs.readFileSync(file,'utf8'));
const shots=read(path.join(cut,'shots.json')),narration=read(path.join(cut,'narration.json'));
const script=read(path.join(cut,'script.json')),cfg=read(path.join(cut,'mix.json'));
const captions=Object.fromEntries(script.lines.map(l=>[l.id,l.caption]));
if(narration.lines.some(l=>l.id==='n07'))throw Error('Removed n07 still in narration');
const run=spawnSync('uv',['run','--quiet','--with','numpy','python',path.join(here,'build_bed.py')],{stdio:'inherit'});
if(run.status!==0)throw Error('Music assembly failed');
const abs=p=>path.resolve(film,p);
const lines=narration.lines.map(l=>({id:l.id,file:abs(l.file),start:shots.narration[l.id],seconds:l.seconds,rms_dbfs:l.rms_dbfs,call:captions[l.id]==='screen'}));
const plan={seconds:shots.seconds,lines,sound:[],music:{...cfg.music,file:abs(cfg.music.file)},sfx:cfg.sfx.map(e=>({...e,file:abs(e.file)}))};
const result=mix(plan,path.resolve(here,'../.build/audio/stems'),cfg.master);
fs.copyFileSync(result.file,path.join(here,'mix.wav'));
const voice=voiceOverMusic(plan,result.stems);
const report={seconds:shots.seconds,removed_line:'n07',original_voice_takes_reused:true,
  lines:lines.map(({file,...l})=>({...l,file:path.relative(demo,file)})),
  before:result.before,after:result.after,master_gain_db:result.gain_db,
  voice_over_music:voice,ending:measure(result.file,{from:114,to:119.6}),
  note:'Measured and source-verified; direct human listening is not claimed. Saved voice sources and cue positions are unchanged except V36 edits.'};
fs.writeFileSync(path.join(here,'mix-report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({seconds:shots.seconds,loudness:result.after,min_voice_over_music_db:Math.min(...voice.map(x=>x.above_db))},null,2));
