#!/usr/bin/env python3
"""Technical integrity checks for completed Draft 04 exports, never mutates media."""
from concurrent.futures import ThreadPoolExecutor
from fractions import Fraction
from pathlib import Path
import hashlib,json,re,struct,subprocess

ROOT=Path(__file__).resolve().parents[2]
WORK=ROOT/'work/draft04'
SCRIPT=ROOT/'video/public/draft04/script.json'
AUDIO=ROOT/'video/public/draft04/audio'
script=json.loads(SCRIPT.read_text())
expected_duration=script['duration']
expected_frames=round(expected_duration*30)
script_hash=hashlib.sha256(SCRIPT.read_bytes()).hexdigest()
assert script_hash==json.loads((AUDIO/'timing.json').read_text())['script_sha256']


def command(argv):
    result=subprocess.run(argv,capture_output=True,text=True)
    assert result.returncode==0,(argv,result.stderr[-3000:])
    return result


def atoms(path):
    result=[]
    length=path.stat().st_size
    with path.open('rb') as file:
        while file.tell()<length:
            start=file.tell()
            head=file.read(8)
            assert len(head)==8,(path,start)
            size,kind=struct.unpack('>I4s',head)
            header=8
            if size==1:
                size=struct.unpack('>Q',file.read(8))[0]
                header=16
            elif size==0:
                size=length-start
            assert size>=header and start+size<=length,(kind,start,size)
            result.append({'type':kind.decode('ascii'),'offset':start,'bytes':size})
            file.seek(start+size)
    return result


def captions(path):
    data=path.read_bytes()
    assert data==(AUDIO/'captions.srt').read_bytes()
    matches=re.findall(r'(?m)^(\d\d):(\d\d):(\d\d),(\d\d\d) --> (\d\d):(\d\d):(\d\d),(\d\d\d)$',data.decode())
    def stamp(fields):
        h,m,s,ms=map(int,fields)
        return h*3600+m*60+s+ms/1000
    cues=[(stamp(fields[:4]),stamp(fields[4:])) for fields in matches]
    assert len(cues)==60
    assert all(0<=a<b<=expected_duration for a,b in cues)
    assert all(a[1]<=b[0] for a,b in zip(cues,cues[1:]))
    return {'count':len(cues),'non_overlapping':True,'within_video':True,'matches_source_bytes':True,
            'first_start':cues[0][0],'last_end':cues[-1][1],'sha256':hashlib.sha256(data).hexdigest()}


def check(args):
    relative,width,height=args
    path=ROOT/relative
    before=path.stat()
    probe=json.loads(command(['ffprobe','-v','error','-show_streams','-show_format','-of','json',str(path)]).stdout)
    video=[s for s in probe['streams'] if s['codec_type']=='video']
    audio=[s for s in probe['streams'] if s['codec_type']=='audio']
    subtitles=[s for s in probe['streams'] if s['codec_type']=='subtitle']
    assert len(video)==1 and len(audio)==1 and len(subtitles)==0
    video,audio=video[0],audio[0]
    assert video['codec_name']=='h264' and (video['width'],video['height'])==(width,height)
    assert Fraction(video['r_frame_rate'])==30 and Fraction(video['avg_frame_rate'])==30
    assert int(video['nb_frames'])==expected_frames
    assert abs(float(video['duration'])-expected_duration)<.001
    assert audio['codec_name']=='aac' and audio['profile']=='LC'
    assert audio['sample_rate']=='48000' and audio['channels']==2 and audio['channel_layout']=='stereo'
    assert abs(float(audio['duration'])-expected_duration)<.001
    assert abs(float(probe['format']['duration'])-expected_duration)<.001
    # Decode all video and audio packets. The audio filter measures decoded AAC,
    # and -xerror makes corrupted media fail rather than silently continuing.
    decoded=command(['ffmpeg','-hide_banner','-xerror','-i',str(path),'-map','0:v:0','-map','0:a:0',
                     '-af','ebur128=peak=true:framelog=verbose','-progress','pipe:1','-nostats','-f','null','-'])
    (WORK/(path.stem+'-decode-loudness.log')).write_text(decoded.stderr)
    (WORK/(path.stem+'-decode-progress.txt')).write_text(decoded.stdout)
    frames=int(re.findall(r'(?m)^frame=(\d+)$',decoded.stdout)[-1])
    assert frames==expected_frames
    assert 'progress=end' in decoded.stdout
    summary=decoded.stderr.split('Summary:')[-1]
    integrated=float(re.search(r'I:\s*(-?[\d.]+) LUFS',summary)[1])
    peak=float(re.search(r'Peak:\s*(-?[\d.]+) dBFS',summary)[1])
    lra=float(re.search(r'LRA:\s*([\d.]+) LU',summary)[1])
    assert -16.5<=integrated<=-15.5 and peak<=-1.0,(integrated,peak)
    boxes=atoms(path)
    box_types=[x['type'] for x in boxes]
    assert box_types.index('moov')<box_types.index('mdat')
    cap=captions(path.with_suffix('.srt'))
    digest=hashlib.sha256(path.read_bytes()).hexdigest()
    after=path.stat()
    assert before.st_size==after.st_size and before.st_mtime_ns==after.st_mtime_ns,'Export changed during QA'
    return {'path':relative,'bytes':after.st_size,'sha256':digest,
            'video':{'codec':video['codec_name'],'width':width,'height':height,'fps':30,
                     'metadata_frames':int(video['nb_frames']),'decoded_frames':frames,
                     'duration':float(video['duration']),'pixel_format':video['pix_fmt']},
            'audio':{'codec':audio['codec_name'],'profile':audio['profile'],'sample_rate':int(audio['sample_rate']),
                     'channels':audio['channels'],'channel_layout':audio['channel_layout'],'duration':float(audio['duration']),
                     'bit_rate':int(audio['bit_rate']),'integrated_lufs':integrated,'true_peak_dbfs':peak,'loudness_range_lu':lra},
            'full_decode':{'result':'PASS','actual_video_frames':frames,'errors':0,'log':str((WORK/(path.stem+'-decode-loudness.log')).relative_to(ROOT))},
            'subtitle_streams':len(subtitles),'no_additional_subtitle_stream':True,'fast_start':True,
            'top_level_atoms':boxes,'captions':cap}


if __name__=='__main__':
    targets=[('renders/ai-peer-draft-04.mp4',1920,1080),('renders/ai-peer-draft-04-preview.mp4',960,540)]
    with ThreadPoolExecutor(max_workers=2) as pool:
        exports=list(pool.map(check,targets))
    report={'status':'PASS','duration_seconds':expected_duration,'expected_frames':expected_frames,
            'script_sha256':script_hash,'exports':exports,'direct_listening_performed':False,
            'visual_review_scope':'Performed separately by root and independent creative reviewer; this report covers technical export integrity.'}
    (WORK/'final-technical-qa.json').write_text(json.dumps(report,indent=2)+'\n')
    print(json.dumps({'status':report['status'],'duration_seconds':expected_duration,'expected_frames':expected_frames,
                      'exports':[{'path':x['path'],'audio':x['audio'],'bytes':x['bytes']} for x in exports]},indent=2))
