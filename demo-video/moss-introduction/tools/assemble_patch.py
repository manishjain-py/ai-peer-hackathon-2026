#!/usr/bin/env python3
"""Re-encode only changed scenes plus bridges to existing IDR boundaries.

Unchanged GOPs are stream-copied. Bridges reuse decoded V3 pictures (no new scene render).
The portable H.264 High profile is retained; no lossless-profile switching is used.
"""
from pathlib import Path
import subprocess,json,hashlib
P=Path(__file__).resolve().parents[1];D=P.parent;B=P/'.build';OUT=D/'film/renders'
BASE=OUT/'blended-moss-v3.mp4';MIX=P/'audio/mix.wav';FPS=30
SEG=B/'segments';SEG.mkdir(exist_ok=True)
def run(a):subprocess.run(a,check=True)
def ff(a):run(['ffmpeg','-v','error','-y',*map(str,a)])
def sha(p):
 h=hashlib.sha256()
 with p.open('rb') as f:
  while b:=f.read(1<<20):h.update(b)
 return h.hexdigest()
assert sha(BASE)=='e1dd89b0d0fbc99d544fdc69ae16539d53acf00ba83c981f567388311ec50841','Unexpected V3 baseline'
# Every cut here is an IDR from the saved V3 master. Segment muxer never re-encodes.
ff(['-i',BASE,'-map','0:v:0','-an','-c:v','copy','-f','segment','-segment_times','14,28.566667,100,113.633333','-segment_time_delta','0.016667','-reset_timestamps','1',SEG/'base-%02d.mp4'])
blocks=[(420,738,857),(3000,3168,3409)]
for i,(a,b,end) in enumerate(blocks):
 changed=B/f'changed-{i}.mp4';assert changed.exists()
 graph=f'[0:v]setpts=PTS-STARTPTS[p];[1:v]trim=start_frame={b}:end_frame={end},setpts=PTS-STARTPTS[b];[p][b]concat=n=2:v=1:a=0[v]'
 ff(['-i',changed,'-i',BASE,'-filter_complex',graph,'-map','[v]','-an','-c:v','libx264','-preset','slow','-crf','22','-profile:v','high','-pix_fmt','yuv420p','-r',str(FPS),'-video_track_timescale','15360','-movflags','+faststart',SEG/f'changed-{i}.mp4'])
lengths=[420,437,2143,409,179];parts=[SEG/'base-00.mp4',SEG/'changed-0.mp4',SEG/'base-02.mp4',SEG/'changed-1.mp4',SEG/'base-04.mp4']
listing=B/'assembled-concat.txt';listing.write_text(''.join(f"file '{p}'\nduration {n/FPS:.9f}\n" for p,n in zip(parts,lengths)))
master=OUT/'blended-moss-v4.mp4';small=OUT/'blended-moss-v4-720p.mp4'
ff(['-f','concat','-safe','0','-i',listing,'-i',MIX,'-map','0:v:0','-map','1:a:0','-c:v','copy','-c:a','aac','-b:a','192k','-movflags','+faststart',master])
ff(['-i',master,'-vf','scale=1280:720','-c:v','libx264','-preset','slow','-crf','23','-c:a','copy','-movflags','+faststart',small])
report={'baseline':'film/renders/blended-moss-v3.mp4','baseline_sha256':sha(BASE),'fps':30,'actual_new_scene_frames':[[420,738],[3000,3168]],'baseline_picture_bridges':[[738,857],[3168,3409]],'encoded_patch_gops':[[420,857],[3000,3409]],'stream_copied_ranges':[[0,420],[857,3000],[3409,3588]],'frame_total':sum(lengths),'note':'High-profile H.264 throughout. GOP bridges change compression only; their scene pictures come from V3. Full-render route remains available. Exact unchanged-range frame hashes are checked by verify.py.'}
(P/'evidence/assembly.json').write_text(json.dumps(report,indent=2)+'\n');print('V4 patched master and720p ready',flush=True)
