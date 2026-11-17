#!/usr/bin/env node
// V39: retimed middle with the original introduction, morning and ending PCM retained.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {spawnSync} from 'node:child_process';
import {mix, voiceOverMusic, measure} from '../../film/tools/mix.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),demo=path.resolve(here,'../..'),film=path.join(demo,'film');
const cut=path.join(film,'cuts/blended-moss-v5'),read=p=>JSON.parse(fs.readFileSync(p,'utf8'));
const shots=read(path.join(cut,'shots.json')),narration=read(path.join(cut,'narration.json'));
const script=read(path.join(cut,'script.json')),cfg=read(path.join(cut,'mix.json'));
const captions=Object.fromEntries(script.lines.map(l=>[l.id,l.caption]));
const abs=p=>path.resolve(film,p);
const lines=narration.lines.map(l=>({id:l.id,file:abs(l.file),start:shots.narration[l.id],seconds:l.seconds,rms_dbfs:l.rms_dbfs,call:captions[l.id]==='screen'}));
if(lines.some(l=>['p02','n07'].includes(l.id)))throw Error('Superseded voice line present');
const plan={seconds:shots.seconds,lines,sound:[],music:{...cfg.music,file:abs(cfg.music.file)},sfx:cfg.sfx.map(e=>({...e,file:abs(e.file)}))};
const bed=spawnSync('uv',['run','--quiet','--with','numpy','python',path.join(here,'build_bed.py')],{stdio:'inherit'});
if(bed.status!==0)throw Error('Music bed assembly failed');
const candidate=mix(plan,path.resolve(here,'../.build/audio/stems'),cfg.master);
const run=spawnSync('uv',['run','--quiet','--with','numpy','python',path.join(here,'splice_mix.py')],{stdio:'inherit'});
if(run.status!==0)throw Error('PCM assembly failed');
const separation=voiceOverMusic(plan,candidate.stems);
const report={seconds:shots.seconds,new_line:'p07v5',new_line_start:90.4,
 lines:lines.map(({file,...l})=>({...l,file:path.relative(demo,file)})),
 retained_voice_lines:22,music_bed:'moss-ocean/audio/bed-moss-v5.wav',
 after:measure(path.join(here,'mix.wav')),voice_over_music:separation,
 note:'Exact V4 mixed PCM retained0–24.6 and99.9–119.6; original intro/morning/globe/ending unchanged. Middle retimed, same composition on bar-aligned joins. New Matilda ocean voice. Final AAC checked separately. Direct listening not claimed.'};
fs.writeFileSync(path.join(here,'mix-report.json'),JSON.stringify(report,null,2)+'\n');
console.log(JSON.stringify({loudness:report.after,ocean:separation.find(l=>l.id==='p07v5')},null,2));
