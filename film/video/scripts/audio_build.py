#!/usr/bin/env python3
"""Build original AI Peer concept-demo audio. Needs edge-tts, numpy, scipy, soundfile, ffmpeg.

All copy is fictional demonstration material. Two stock synthetic voices, no cloning.
Outputs exactly 120 seconds at 48 kHz, plus actual speech timings and captions.
"""
from __future__ import annotations
import argparse, asyncio, json, math, subprocess
from pathlib import Path
import numpy as np
from scipy import signal
import soundfile as sf

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / 'video/public/audio'
WORK = ROOT / 'work/audio-clips'
SR = 48000
DURATION = 120.0
BPM = 116
LINES = [
    (1.0, 8.8, 'narrator', 'A ten-minute question can cost a whole day, when the person with the context is asleep.'),
    (10.0, 16.8, 'narrator', 'Meet AI Peer. An always-on teammate that knows your work, even when you are offline.'),
    (18.0, 30.7, 'narrator', 'Create your Peer. It starts with your profile, then connects your projects, conversations, documents, and code. A living picture of your work takes shape.'),
    (32.0, 41.7, 'narrator', 'Ask what is blocking Premium Chargebacks. Your Peer connects the requirement to the data dependency, the owning team, and the source.'),
    (43.0, 51.7, 'narrator', 'And it stays current. When a decision changes, your Peer updates its understanding, with the source and the latest timestamp.'),
    (53.0, 59.7, 'narrator', 'Now it is two A M. You are offline. A teammate in another timezone needs more context.'),
    (61.0, 75.4, 'peer', 'I am Manish’s AI Peer. He is offline. Premium Chargebacks needs the dispute outcome before reconciliation. Which dataset is authoritative? Here is the requirement and latest project context.'),
    (77.0, 86.7, 'narrator', 'The owning team has what it needs. The answer arrives, and the dependency moves forward before your next working day begins.'),
    (88.0, 94.7, 'narrator', 'Cannot make the project sync? Your Peer can join, identify itself, and share grounded updates.'),
    (95.2, 103.7, 'peer', 'I am Manish’s AI Peer. Development is complete. Validation is in progress. The launch date still needs his confirmation.'),
    (105.0, 113.7, 'narrator', 'When you return, review every answer, source, and follow-up. Routine context keeps moving. Important decisions stay with you.'),
    (115.0, 119.45, 'narrator', 'Your work has a timezone. Your Peer does not.'),
]
VOICES = {'narrator': 'en-US-AriaNeural', 'peer': 'en-US-GuyNeural'}

def command(args):
    return subprocess.run(args, check=True, capture_output=True, text=True).stdout

def read_mono(path):
    a, sr = sf.read(path, dtype='float32')
    assert sr == SR
    return a.mean(axis=1) if a.ndim > 1 else a

async def synthesize_one(index, item, semaphore):
    import edge_tts
    start, limit, speaker, text = item
    async with semaphore:
        stem = WORK / f'{index:02d}-{speaker}'
        mp3 = stem.with_suffix('.mp3')
        metadata = stem.with_suffix('.jsonl')
        raw = stem.with_suffix('.wav')
        rate = '+5%' if speaker == 'narrator' else ('+12%' if index == 10 else '+2%')
        rate_file=stem.with_suffix('.rate')
        request_file=stem.with_suffix('.request.json')
        request=json.dumps({'text':text,'voice':VOICES[speaker],'rate':rate},ensure_ascii=False,sort_keys=True)
        if not (mp3.exists() and metadata.exists() and request_file.exists() and request_file.read_text()==request):
            await edge_tts.Communicate(text, VOICES[speaker], rate=rate, boundary='WordBoundary').save(mp3, metadata)
            rate_file.write_text(rate)
            request_file.write_text(request)
        command(['ffmpeg', '-y', '-v', 'error', '-i', str(mp3), '-ac', '1', '-ar', str(SR), str(raw)])
        a = read_mono(raw)
        # Retain the complete synthesis including natural word-level gaps.
        original_duration = len(a) / SR
        available = limit - start
        speed = max(1.0, original_duration / available)
        if speed > 1.20:
            raise RuntimeError(f'Line {index} needs editorial adjustment: {original_duration:.2f}s / {available:.2f}s')
        if speed > 1.0:
            fit = stem.with_name(stem.name + '-fit').with_suffix('.wav')
            command(['ffmpeg','-y','-v','error','-i',str(raw),'-af',f'atempo={speed:.8f}','-ar',str(SR),str(fit)])
            a = read_mono(fit)
        # Remove any rounding beyond the silent endpoint, never cut a voiced syllable.
        a = a[:round(available * SR)]
        fade = min(round(.012 * SR), len(a)//2)
        a[:fade] *= np.linspace(0,1,fade)
        a[-fade:] *= np.linspace(1,0,fade)
        rms = math.sqrt(float(np.mean(a*a)))
        a *= min(.105 / max(rms,1e-6), .82 / max(float(np.max(np.abs(a))),1e-6))
        boundaries = [json.loads(x) for x in metadata.read_text().splitlines() if x]
        words = [{'text': b['text'], 'start': round(start+b['offset']/1e7/speed, 4),
                  'end': round(start+(b['offset']+b['duration'])/1e7/speed, 4)} for b in boundaries]
        original_words=text.split()
        if len(original_words)==len(words):
            for word,original in zip(words,original_words): word['text']=original
        result = {'id':index,'speaker':speaker,'voice':VOICES[speaker], 'text':text,
                  'start':start,'end':round(start+len(a)/SR,4),'duration':round(len(a)/SR,4),
                  'scene_limit':limit,'tts_rate':rate,'time_stretch':round(speed,6),
                  'original_duration':round(original_duration,4),'words':words}
        sf.write(stem.with_name(stem.name+'-final').with_suffix('.wav'),a,SR,subtype='PCM_24')
        print(f"{index:02d} {speaker}: {start:.2f}–{result['end']:.2f}, speed {speed:.3f}", flush=True)
        return result, a

async def narration():
    semaphore=asyncio.Semaphore(3)
    results = await asyncio.gather(*(synthesize_one(i+1,line,semaphore) for i,line in enumerate(LINES)))
    audio = np.zeros(round(DURATION*SR),dtype=np.float32)
    timeline = []
    for row,a in results:
        s=round(row['start']*SR)
        audio[s:s+len(a)] += a
        timeline.append(row)
    return audio,timeline

def midi(n): return 440*2**((n-69)/12)

def envelope(n, attack=.02, release=.2):
    env=np.ones(n,dtype=np.float32)
    a=min(n//2,round(attack*SR)); r=min(n//2,round(release*SR))
    if a: env[:a]=np.sin(np.linspace(0,np.pi/2,a))**2
    if r: env[-r:]=np.cos(np.linspace(0,np.pi/2,r))**2
    return env

def stereo_add(dest, a, start, gain=1.0, pan=0.0):
    s=round(start*SR)
    if s>=len(dest): return
    if s<0: a=a[-s:]; s=0
    a=a[:len(dest)-s]
    angle=(pan+1)*np.pi/4
    dest[s:s+len(a),0] += a*gain*np.cos(angle)
    dest[s:s+len(a),1] += a*gain*np.sin(angle)

def note(n, duration, kind='pad'):
    t=np.arange(round(duration*SR),dtype=np.float32)/SR
    f=midi(n)
    if kind=='pad':
        a=(np.sin(2*np.pi*f*t)+.20*np.sin(2*np.pi*(f*1.002)*t)+.16*np.sin(2*np.pi*2*f*t)+.045*np.sin(2*np.pi*3*f*t))
        a *= envelope(len(t),.45,.6)
    elif kind=='pluck':
        a=(np.sin(2*np.pi*f*t)+.22*np.sin(2*np.pi*2*f*t)+.07*np.sin(2*np.pi*3*f*t))*np.exp(-t*3.0)
        a *= envelope(len(t),.012,.25)
    else:
        a=(np.sin(2*np.pi*f*t)+.15*np.sin(2*np.pi*2*f*t))*envelope(len(t),.025,.15)
    return a.astype(np.float32)

def make_music():
    rng=np.random.default_rng(20260918)
    music=np.zeros((round(DURATION*SR),2),dtype=np.float32)
    beat=60/BPM; bar=4*beat
    # Original progression: Dmaj9 / Bm7 / Gmaj9 / Asus4 to A.
    chords=[([50,57,61,64,66],38),([47,54,57,62,66],35),([43,50,54,57,62],31),([45,52,57,62,64],33)]
    for b in range(58):
        start=b*bar
        chord,root=chords[(b//2)%4]
        if b>=54: chord,root=chords[0]
        strength=.65 if start<9 else (1 if start<52 else (.58 if start<60 else (.95 if start<104 else .75)))
        for j,n in enumerate(chord):
            stereo_add(music,note(n,bar+.55),start,.040*strength,(j-2)*.25)
        if b>=4 and b<55:
            stereo_add(music,note(root,beat*1.65,'bass'),start,.10*strength,0)
            stereo_add(music,note(root,beat*1.40,'bass'),start+beat*2,.075*strength,0)
        # Leave many bars empty of melody so the voice has space.
        if b%4 in (0,1) and b<55:
            melody=[chord[-2]+12,chord[-1]+12,chord[-3]+12]
            positions=[.5,2.0,3.25] if b%4==0 else [1.0,3.0]
            for j,pos in enumerate(positions):
                a=note(melody[j%len(melody)],1.5,'pluck')
                stereo_add(music,a,start+pos*beat,.055*strength,-.28 if j%2 else .28)
                stereo_add(music,a,start+pos*beat+beat*.75,.014*strength,.40 if j%2 else -.40)
        percussion=(b>=4 and b<54 and not (52<=start<60))
        if percussion:
            for k in (0,2):
                t=np.arange(round(.25*SR))/SR
                # Soft low kick with no piercing transient.
                phase=2*np.pi*(48*t+45*.03*(1-np.exp(-t/.03)))
                kick=np.sin(phase)*np.exp(-t*18)*envelope(len(t),.003,.035)
                stereo_add(music,kick,start+k*beat,.15*strength)
            for k in (1,3):
                n=rng.normal(0,1,round(.13*SR))
                n=signal.sosfilt(signal.butter(2,[900,4800],btype='bandpass',fs=SR,output='sos'),n)
                n*=np.exp(-np.arange(len(n))/SR*35)*envelope(len(n),.006,.03)
                stereo_add(music,n.astype(np.float32),start+k*beat,.055*strength,.1)
            for k in range(8):
                n=rng.normal(0,1,round(.055*SR))
                n=signal.sosfilt(signal.butter(2,[4500,9000],btype='bandpass',fs=SR,output='sos'),n)
                n*=envelope(len(n),.007,.040)
                stereo_add(music,n.astype(np.float32),start+k*beat/2,.013*strength*(-.08+1),-.4 if k%2 else .4)
    # Finishing tonic: lower octave, soft and sparse, with a long release.
    for j,n in enumerate([50,57,62,66,69]):
        stereo_add(music,note(n,3.3,'pluck'),116.0+j*.045,.055,(j-2)*.18)
    music*=envelope(len(music),2.2,3.0)[:,None]
    # Gentle low-pass removes synthetic upper-edge harshness.
    music=signal.sosfilt(signal.butter(2,11000,fs=SR,output='sos'),music,axis=0).astype(np.float32)
    music*=.30/max(float(np.max(np.abs(music))),1e-6)
    return music

SFX_CUES=[
    (9.0,'reveal'),(17.0,'transition'),(22.0,'connect'),(25.8,'connect'),
    (31.0,'transition'),(34.0,'click'),(37.6,'connect'),(42.0,'transition'),
    (46.5,'connect'),(52.0,'soft'),(60.0,'reveal'),(76.0,'success'),
    (87.0,'transition'),(90.2,'click'),(95.0,'soft'),(104.0,'transition'),
    (108.7,'connect'),(114.0,'reveal'),
]
def make_effects():
    rng=np.random.default_rng(801)
    effects=np.zeros((round(DURATION*SR),2),dtype=np.float32)
    for at,kind in SFX_CUES:
        if kind in ('transition','reveal'):
            dur=.42 if kind=='transition' else .7
            t=np.arange(round(dur*SR))/SR
            n=rng.normal(0,1,len(t))
            a=signal.sosfilt(signal.butter(2,[350,2700],btype='bandpass',fs=SR,output='sos'),n)
            a*=np.sin(np.pi*t/dur)**2
            stereo_add(effects,a.astype(np.float32),at-.16,.035,0)
            if kind=='reveal':
                stereo_add(effects,note(74,.85,'pluck'),at,.055,-.2)
                stereo_add(effects,note(81,.85,'pluck'),at+.08,.026,.2)
        elif kind=='click':
            t=np.arange(round(.055*SR))/SR
            a=(np.sin(2*np.pi*610*t)+.2*rng.normal(0,1,len(t)))*np.exp(-t*120)*envelope(len(t),.003,.012)
            stereo_add(effects,a.astype(np.float32),at,.06)
        elif kind=='success':
            for j,n in enumerate([69,74,78]):
                stereo_add(effects,note(n,1.0,'pluck'),at+j*.10,.040,(j-1)*.25)
        elif kind=='soft':
            stereo_add(effects,note(62,.85,'pluck'),at,.034)
        else:
            stereo_add(effects,note(74,.5,'pluck'),at,.025,.1)
    return effects

def srt_stamp(t):
    ms=round(t*1000); h,ms=divmod(ms,3600000); m,ms=divmod(ms,60000); s,ms=divmod(ms,1000)
    return f'{h:02}:{m:02}:{s:02},{ms:03}'

def captions(timeline):
    cues=[]
    for row in timeline:
        chunk=[]
        for i,w in enumerate(row['words']):
            chunk.append(w)
            last=i==len(row['words'])-1
            punctuation=w['text'].endswith(('.', '?', '!'))
            # Avoid stranded one/two-word captions at the end of a sentence.
            upcoming=row['words'][i+1:i+3]
            short_tail=any(x['text'].endswith(('.', '?', '!')) for x in upcoming)
            if (len(chunk)>=8 and not short_tail) or punctuation or last:
                text=' '.join(x['text'] for x in chunk)
                label='AI PEER: ' if row['speaker']=='peer' else ''
                start=max(row['start'],chunk[0]['start']-.02)
                end=min(row['end'],chunk[-1]['end']+.10)
                cues.append({'start':start,'end':end,'text':label+text})
                chunk=[]
    for i in range(len(cues)-1):
        cues[i]['end']=min(cues[i]['end'],cues[i+1]['start']-.012)
    blocks=[f"{i+1}\n{srt_stamp(c['start'])} --> {srt_stamp(c['end'])}\n{c['text']}\n" for i,c in enumerate(cues)]
    (OUT/'captions.srt').write_text('\n'.join(blocks)+'\n')

def stats(a):
    peak=float(np.max(np.abs(a))); rms=float(np.sqrt(np.mean(a.astype(np.float64)**2)))
    return {'duration':len(a)/SR,'sample_rate':SR,'peak_dbfs':round(20*np.log10(max(peak,1e-12)),3),'rms_dbfs':round(20*np.log10(max(rms,1e-12)),3),'clipped_samples':int(np.sum(np.abs(a)>=1))}

async def main():
    OUT.mkdir(parents=True,exist_ok=True);WORK.mkdir(parents=True,exist_ok=True)
    voice,timeline=await narration()
    music=make_music(); effects=make_effects()
    # Duck against utterance windows, with a gentle pre-roll and release.
    gain=np.ones(len(voice),dtype=np.float32)*.56
    for row in timeline:
        s=round(max(0,row['start']-.18)*SR); a=round(row['start']*SR)
        b=round(row['end']*SR); e=min(len(gain),b+round(.35*SR))
        gain[s:a]=np.minimum(gain[s:a],np.linspace(.56,.17,a-s))
        gain[a:b]=np.minimum(gain[a:b],.17)
        gain[b:e]=np.minimum(gain[b:e],np.linspace(.17,.56,e-b))
    music_ducked=music*gain[:,None]
    # No harsh compression: the mix has ample headroom. A single global trim
    # guarantees a peak below -1.5 dBFS while keeping exact stem additivity.
    stereo_voice=np.column_stack([voice,voice])
    mixed=stereo_voice+music_ducked+effects
    trim=min(1.0,10**(-1.5/20)/max(float(np.max(np.abs(mixed))),1e-6))
    stems={'narration':stereo_voice*trim,'music':music_ducked*trim,'effects':effects*trim,'mixed':mixed*trim}
    for name,data in stems.items(): sf.write(OUT/f'{name}.wav',data,SR,subtype='PCM_24')
    sf.write(OUT/'music-unducked.wav',music*trim,SR,subtype='PCM_24')
    metadata={'title':'AI Peer — fictional concept demo','duration':DURATION,'sample_rate':SR,'bpm':BPM,
              'voices':VOICES,'voice_disclosure':'Both voices are stock synthetic voices. No voice cloning. The Peer identifies itself in each spoken appearance.',
              'music':'Original procedural composition for this demo, composed from synthesized oscillators and noise; no samples or third-party recording.',
              'notes':'All narration lines preserved from brief. atempo used only where needed to fit scene windows. SRT times derive from synthesis word boundaries, scaled to actual clip timing.',
              'lines':timeline,'effects':[{'time':t,'kind':k} for t,k in SFX_CUES],
              'stats':{name:stats(data) for name,data in stems.items()}}
    (OUT/'timing.json').write_text(json.dumps(metadata,indent=2,ensure_ascii=False)+'\n')
    captions(timeline)
    print(json.dumps(metadata['stats'],indent=2),flush=True)

if __name__=='__main__': asyncio.run(main())
