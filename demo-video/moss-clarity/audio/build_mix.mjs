#!/usr/bin/env node
import fs from 'node:fs';import path from 'node:path';import {fileURLToPath} from 'node:url';import {spawnSync} from 'node:child_process';
import {mix,measure,voiceOverMusic} from '../../film/tools/mix.mjs';
const here=path.dirname(fileURLToPath(import.meta.url)),demo=path.resolve(here,'../..'),film=path.join(demo,'film'),cut=path.join(film,'cuts/blended-moss-v6');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),shots=read(path.join(cut,'shots.json')),narration=read(path.join(cut,'narration.json')),cfg=read(path.join(cut,'mix.json'));
const lines=narration.lines.map(l=>({id:l.id,file:path.resolve(film,l.file),start:shots.narration[l.id],seconds:l.seconds,rms_dbfs:l.rms_dbfs,call:/^m\d/.test(l.id)}));
if(lines.some(l=>['p02','n07','p05'].includes(l.id)))throw Error('Removed voice present');
const plan={seconds:shots.seconds,lines,sound:[],music:{...cfg.music,file:path.resolve(film,cfg.music.file)},sfx:cfg.sfx.map(e=>({...e,file:path.resolve(film,e.file)}))};
function python(name){const r=spawnSync('uv',['run','--quiet','--with','numpy','python',path.join(here,name)],{stdio:'inherit'});if(r.status)throw Error(name+' failed');}
python('build_bed.py');const candidate=mix(plan,path.resolve(here,'../.build/audio/stems'),cfg.master);
// The final cadence must recover promptly after p12; earlier speech retains its established duck release.
mix({...plan,music:{...plan.music,duck_release:180}},path.resolve(here,'../.build/audio/finale'),cfg.master);python('splice_mix.py');
const report={seconds:shots.seconds,lines:lines.map(({file,...l})=>({...l,file:path.relative(demo,file)})),after:measure(path.join(here,'mix.wav')),voice_over_music:voiceOverMusic(plan,candidate.stems),note:'V41 clean Chris hook; p05 removed; original M1 trimmed after Peer; M2/M3/M4b moved3s earlier; ocean88.4; p12 114.4 ahead of uninterrupted final cadence116. Local STT and provider audio review supplement measurements; direct human listening not claimed.'};
fs.writeFileSync(path.join(here,'mix-report.json'),JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify(report.after));
