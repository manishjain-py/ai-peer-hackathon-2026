#!/usr/bin/env python3
"""Read-only verification of finalized Draft03 exports; run only after mux completes."""
import concurrent.futures,hashlib,json,re,struct,subprocess
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
QA=ROOT/'work/draft03'
EXPECTED=166.5

def run(args):
 return subprocess.run(args,capture_output=True,text=True,check=True)

def stamp(s):
 h,m,sec=s.split(':'); sec,ms=sec.split(',')
 return int(h)*3600+int(m)*60+int(sec)+int(ms)/1000

def verify_captions(path):
 text=path.read_text()
 blocks=re.split(r'\n\s*\n',text.strip())
 cues=[]
 for i,b in enumerate(blocks,1):
  lines=b.splitlines(); assert int(lines[0])==i
  a,z=lines[1].split(' --> ')
  a,z=stamp(a),stamp(z)
  assert 0<=a<z<=EXPECTED and len(lines)>=3
  cues.append({'start':a,'end':z,'text':' '.join(lines[2:])})
 assert len(cues)==54
 assert all(a['end']<=b['start'] for a,b in zip(cues,cues[1:]))
 source=ROOT/'video/public/draft03/audio/captions.srt'
 assert path.read_bytes()==source.read_bytes()
 return {'count':len(cues),'non_overlapping':True,'within_video':True,'matches_source_bytes':True,'first_start':cues[0]['start'],'last_end':cues[-1]['end'],'sha256':hashlib.sha256(path.read_bytes()).hexdigest()}

def atoms(path):
 result=[]; filesize=path.stat().st_size
 with path.open('rb') as f:
  while f.tell()<filesize:
   offset=f.tell(); header=f.read(8)
   assert len(header)==8
   size,kind=struct.unpack('>I4s',header)
   if size==1:size=struct.unpack('>Q',f.read(8))[0]
   if size==0:size=filesize-offset
   assert size>=8 and offset+size<=filesize
   result.append({'type':kind.decode('ascii'),'offset':offset,'bytes':size})
   f.seek(offset+size)
 return result

def inspect(path,width,height):
 assert path.exists() and path.stat().st_size>10000
 info=json.loads(run(['ffprobe','-v','error','-show_format','-show_streams','-of','json',str(path)]).stdout)
 videos=[s for s in info['streams'] if s['codec_type']=='video']
 audios=[s for s in info['streams'] if s['codec_type']=='audio']
 subs=[s for s in info['streams'] if s['codec_type']=='subtitle']
 assert len(videos)==len(audios)==1 and not subs
 v,a=videos[0],audios[0]
 assert v['width']==width and v['height']==height and v['codec_name']=='h264'
 assert v['avg_frame_rate']=='30/1' and v['pix_fmt'] in ('yuv420p','yuvj420p')
 assert int(v['nb_frames'])==4995
 assert a['codec_name']=='aac' and a['profile']=='LC' and a['channels']==2 and int(a['sample_rate'])==48000
 assert abs(float(v['duration'])-EXPECTED)<.001 and abs(float(a['duration'])-EXPECTED)<.025
 assert abs(float(info['format']['duration'])-EXPECTED)<.025
 atom_list=atoms(path); names=[x['type'] for x in atom_list]
 assert names.index('moov')<names.index('mdat')
 # One complete decode supplies both actual decoded video count and corruption checking.
 jobs={}
 with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
  jobs['decode']=pool.submit(run,['ffmpeg','-hide_banner','-v','error','-xerror','-err_detect','explode','-i',str(path),'-map','0:v:0','-map','0:a:0','-progress','pipe:1','-nostats','-f','null','-'])
  jobs['loudness']=pool.submit(run,['ffmpeg','-hide_banner','-i',str(path),'-map','0:a:0','-af','ebur128=peak=true:framelog=verbose','-f','null','-'])
  results={key:future.result() for key,future in jobs.items()}
 decode=results['decode']; loud=results['loudness']
 (QA/(path.stem+'-decode.log')).write_text(decode.stdout+decode.stderr)
 (QA/(path.stem+'-aac-loudness.log')).write_text(loud.stderr)
 frames=[int(x) for x in re.findall(r'^frame=(\d+)$',decode.stdout,re.M)]
 assert frames and frames[-1]==4995 and 'progress=end' in decode.stdout
 assert not decode.stderr.strip()
 summary=loud.stderr.split('Summary:')[-1].split('[out#')[0].strip()
 lufs=float(re.search(r'I:\s*(-?[\d.]+) LUFS',summary)[1])
 peak=float(re.search(r'Peak:\s*(-?[\d.]+) dBFS',summary)[1])
 lra=float(re.search(r'LRA:\s*([\d.]+) LU',summary)[1])
 assert -17<=lufs<=-15 and peak<=-.5
 return {'path':str(path.relative_to(ROOT)),'bytes':path.stat().st_size,'sha256':hashlib.sha256(path.read_bytes()).hexdigest(),'video':{'codec':v['codec_name'],'width':width,'height':height,'fps':30,'metadata_frames':int(v['nb_frames']),'decoded_frames':frames[-1],'duration':float(v['duration']),'pixel_format':v['pix_fmt']},'audio':{'codec':a['codec_name'],'profile':a['profile'],'sample_rate':int(a['sample_rate']),'channels':a['channels'],'channel_layout':a.get('channel_layout'),'duration':float(a['duration']),'bit_rate':int(a['bit_rate']),'integrated_lufs':lufs,'true_peak_dbfs':peak,'loudness_range_lu':lra},'full_decode':{'result':'PASS','stderr':'','actual_video_frames':frames[-1]},'subtitle_streams':len(subs),'no_additional_subtitle_stream':True,'fast_start':True,'top_level_atoms':atom_list,'captions':verify_captions(path.with_suffix('.srt'))}

if __name__=='__main__':
 results=[]
 for suffix,width,height in [('',1920,1080),('-preview',960,540)]:
  p=ROOT/'renders'/f'ai-peer-draft-03{suffix}.mp4'
  result=inspect(p,width,height)
  results.append(result)
  print(json.dumps({'path':result['path'],'decode':result['full_decode'],'audio':result['audio'],'fast_start':True}),flush=True)
 script=(ROOT/'video/public/draft03/script.json').read_bytes()
 timing=json.loads((ROOT/'video/public/draft03/audio/timing.json').read_text())
 assert timing['script_sha256']==hashlib.sha256(script).hexdigest()
 output={'status':'PASS','duration_seconds':EXPECTED,'expected_frames':4995,'script_sha256':timing['script_sha256'],'exports':results,'direct_listening_performed':False,'visual_review_scope':'Performed separately by root and creative reviewer; this report covers technical export integrity.'}
 (QA/'final-technical-qa.json').write_text(json.dumps(output,indent=2)+'\n')
 print('SAVED work/draft03/final-technical-qa.json',flush=True)
