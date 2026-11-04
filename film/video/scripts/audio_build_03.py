#!/usr/bin/env python3
"""Draft 03: directed local Qwen3 voices and original 124 BPM electro-pop score.

Uses stock and text-designed synthetic voices, no recordings or voice clones. Build with
work/draft03/audio-venv/bin/python video/scripts/audio_build_03.py --asr
"""
from __future__ import annotations

import argparse
from difflib import SequenceMatcher
from functools import lru_cache
import gc
import hashlib
import json
import math
import re
from pathlib import Path

import numpy as np
import soundfile as sf
from scipy import signal

import audio_build_02 as common

ROOT = Path(__file__).resolve().parents[2]
OUT = ROOT / "video/public/draft03/audio"
WORK = ROOT / "work/draft03/audio-clips"
QA = ROOT / "work/draft03/audio-qa"
SR = 48000
BPM = 124
MODEL = "mlx-community/Qwen3-TTS-12Hz-1.7B-CustomVoice-4bit"
DESIGN_MODEL = "mlx-community/Qwen3-TTS-12Hz-1.7B-VoiceDesign-4bit"
VOICES = {"narrator": "Authored American English presenter", "alex": "Ryan", "sarah": "Authored American English colleague", "peer": "Aiden"}
TAKE_SEEDS = {"brief_opportunity": 47, "slack_peer": 29, "zoom_ask": 19, "slack_reply": 19, "slack_sarah": 21}
DIRECTIONS = {
    "narrator": "A native American English female voice in her early thirties. Warm midrange pitch, clear smooth timbre, lively and confident. Natural conversational delivery with crisp diction and quick connected phrasing, like an engaging premium product commercial. Speak briskly with short pauses.",
    "alex": "Speak naturally in fluent American English. A relaxed male colleague in a live video meeting, asking a quick practical question. Casual, friendly and direct, brisk conversational pace, connected words, rising inflection on questions. Not an announcer and not a formal reading.",
    "sarah": "A female native American English speaker in her thirties with a lower middle register, warm slightly textured voice. Conversational office video call, casual and direct. Natural question intonation, quick connected phrasing with short pauses.",
    "peer": "Speak naturally in fluent American English. A helpful male colleague giving a concise update on a video call. Calm, warm, practical and confident. Brisk, connected, conversational phrasing with varied natural inflection and short pauses. No robot voice, no announcer voice, no dramatic emphasis.",
}
common.OUT, common.WORK, common.QA = OUT, WORK, QA
command, env, stereo_add = common.command, common.env, common.stereo_add


def normalize_text(text):
    text = text.lower().replace("’", "'")
    text = text.replace("a.i.", "ai").replace("a.m.", "am")
    return re.sub(r"[^a-z0-9]", "", text)


def synthesize(script, only=None):
    """Generate immutable request-addressed clips, then release GPU memory."""
    import mlx.core as mx
    from mlx_audio.tts.utils import load_model
    model = None
    active_model = None
    records = []
    # Generate each model's cast together, releasing it before the other loads.
    generation_order = sorted(script["lines"], key=lambda r:r["speaker"] in ("narrator","sarah"))
    for row in generation_order:
        if only and row["id"] not in only:
            continue
        direction = row.get("direction", DIRECTIONS[row["speaker"]])
        if row["id"] == "slack_peer":
            direction = "Speak quickly and smoothly in conversational American English, like a helpful male colleague answering a question. Warm and clear. Connected flowing phrasing, with only very short pauses between sentences."
        if row["id"] == "slack_sarah":
            direction += " Ask a question contrasting two options. Clearly stress OR between the options, with a questioning rise."
        if "Manish" in row["text"]:
            direction += " Pronounce the name Manish as muh-NEESH."
        spoken_text = row["text"].replace("I'm", "I am", 1) if row["id"] == "slack_peer" else row["text"]
        model_id = DESIGN_MODEL if row["speaker"] in ("narrator","sarah") else MODEL
        request = {"model": model_id, "speaker": VOICES[row["speaker"]], "text": spoken_text,
                   "instruct": direction, "seed": row.get("seed", TAKE_SEEDS.get(row["id"],43)), "temperature": .7}
        key = hashlib.sha256(json.dumps(request, sort_keys=True).encode()).hexdigest()[:16]
        path = WORK / f"{row['id']}-{key}.wav"
        req_path = path.with_suffix(".request.json")
        if not path.exists():
            if model is None or active_model != model_id:
                del model
                gc.collect()
                mx.clear_cache()
                model = load_model(model_id)
                active_model = model_id
            mx.random.seed(request["seed"])
            kwargs = dict(text=spoken_text, language="English", instruct=direction, temperature=.7,
                          max_tokens=max(512, len(row["text"].split()) * 18))
            if model_id == DESIGN_MODEL:
                results = list(model.generate_voice_design(**kwargs))
            else:
                results = list(model.generate_custom_voice(speaker=request["speaker"], **kwargs))
            a = np.concatenate([np.array(x.audio) for x in results])
            rate = results[0].sample_rate
            assert a.size > rate * .15 and np.isfinite(a).all()
            sf.write(path, a, rate, subtype="PCM_24")
            req_path.write_text(json.dumps(request, indent=2) + "\n")
        a, rate = sf.read(path, dtype="float32")
        duration = len(a) / rate
        record = {**row, "source_path": str(path.relative_to(ROOT)), "source_duration": duration,
                  "voice": request["speaker"], "voice_engine": model_id, "direction": direction,
                  "seed": request["seed"], "spoken_text": spoken_text}
        records.append(record)
        print(f"SYNTH {row['id']}: {duration:.2f}s for {row['limit']-row['start']:.2f}s window ({request['speaker']})", flush=True)
    del model
    gc.collect()
    mx.clear_cache()
    order={r["id"]:i for i,r in enumerate(script["lines"])}
    records.sort(key=lambda r:order[r["id"]])
    (QA / "source-clips.json").write_text(json.dumps(records, indent=2) + "\n")
    return records


def align_original(text, asr_words, duration):
    """Map ASR word boundaries to exact scripted copy, disclosing interpolation."""
    original = text.split()
    if not asr_words:
        raise RuntimeError("ASR returned no words; review this clip")
    src = [normalize_text(x) for x in original]
    recognized = [normalize_text(x["word"]) for x in asr_words]
    matcher = SequenceMatcher(None, src, recognized, autojunk=False)
    anchors = {}
    for block in matcher.get_matching_blocks():
        for j in range(block.size):
            w = asr_words[block.b+j]
            anchors[block.a+j] = [float(w["start"]), float(w["end"])]
    ratio = matcher.ratio()
    # Interpolate only unmatched tokens using neighboring recognized anchors.
    for i in range(len(original)):
        if i in anchors:
            continue
        left = max((j for j in anchors if j < i), default=-1)
        right = min((j for j in anchors if j > i), default=len(original))
        a = anchors[left][1] if left >= 0 else 0
        b = anchors[right][0] if right < len(original) else duration
        piece = (b-a) / (right-left-1)
        anchors[i] = [a+piece*(i-left-1), a+piece*(i-left)]
    words = [{"text": w, "start": round(anchors[i][0],4), "end": round(anchors[i][1],4)} for i,w in enumerate(original)]
    return words, ratio


def narration(script, records):
    from faster_whisper import WhisperModel
    asr = WhisperModel("base.en", device="cpu", compute_type="int8", cpu_threads=4,
                       download_root=str(ROOT / "work/audio-models"))
    voice = np.zeros(round(script["duration"] * SR), dtype=np.float32)
    timeline, transcript, failures = [], [], []
    for row in records:
        path = ROOT / row["source_path"]
        wav = WORK / f"{row['id']}-48k.wav"
        command(["ffmpeg","-y","-v","error","-i",str(path),"-ar",str(SR),"-ac","1",str(wav)])
        a, _ = sf.read(wav,dtype="float32")
        raw_length = len(a)
        # Remove only waveform-silent edge padding, preserving 80ms/140ms handles.
        active = np.flatnonzero(np.abs(a) > .0018)
        trim_start = max(0,int(active[0]) - round(.08*SR)) if active.size else 0
        trim_end = min(len(a),int(active[-1])+round(.14*SR)) if active.size else len(a)
        a = a[trim_start:trim_end]
        original_duration = len(a)/SR
        available = row["limit"]-row["start"]
        speed = max(1., (original_duration+.035)/available)
        if speed > 1.10:
            failures.append({"id":row["id"],"duration":original_duration,"window":available,
                             "minimum_limit":round(row["start"]+original_duration/1.10+.05,3)})
            continue
        sf.write(wav,a,SR,subtype="PCM_24")
        if speed > 1:
            fitted = WORK / f"{row['id']}-fit.wav"
            command(["ffmpeg","-y","-v","error","-i",str(wav),"-af",f"atempo={speed:.8f}",str(fitted)])
            a,_=sf.read(fitted,dtype="float32")
        a *= env(len(a),.004,.012)
        # Gentle voiced-RMS levelling avoids turning up long silences.
        voiced = a[np.abs(a)>.012]
        rms = float(np.sqrt(np.mean(voiced*voiced))) if len(voiced) else .1
        a *= min(.13/max(rms,1e-6),.68/max(float(np.max(np.abs(a))),1e-6))
        a=(.82*np.tanh(a/.82)).astype(np.float32)
        final = WORK / f"{row['id']}-final.wav"
        sf.write(final,a,SR,subtype="PCM_24")
        cache = final.with_suffix(".asr.json")
        digest = hashlib.sha256(final.read_bytes()).hexdigest()
        if cache.exists() and json.loads(cache.read_text()).get("sha256")==digest:
            recognition = json.loads(cache.read_text())
        else:
            segments,_=asr.transcribe(str(final),language="en",beam_size=5,word_timestamps=True,
                                      vad_filter=False,condition_on_previous_text=False)
            segments=list(segments)
            recognition={"sha256":digest,"text":" ".join(s.text.strip() for s in segments),
                         "words":[{"word":w.word,"start":w.start,"end":w.end,"probability":w.probability} for s in segments for w in s.words or []]}
            cache.write_text(json.dumps(recognition,indent=2)+"\n")
        words,match=align_original(row["text"],recognition["words"],len(a)/SR)
        end=row["start"]+len(a)/SR
        assert end<=row["limit"], f"Clip overflows: {row['id']}"
        for w in words:
            w["start"]=round(w["start"]+row["start"],4)
            w["end"]=round(min(end,w["end"]+row["start"]),4)
        result={**row,"end":round(end,4),"duration":round(len(a)/SR,4),"original_duration":original_duration,
                "edge_silence_trim_seconds":[trim_start/SR,(raw_length-trim_end)/SR],
                "time_stretch":round(speed,6),"tts_rate":"instructed brisk", "fit":True,
                "words":words,"asr_match_ratio":round(match,4),"asr_text":recognition["text"]}
        timeline.append(result)
        transcript.append({"id":row["id"],"script":row["text"],"recognized":recognition["text"],"match":match})
        s=round(row["start"]*SR)
        voice[s:s+len(a)]+=a
        print(f"FIT {row['id']}: {row['start']:.2f}–{end:.2f}, {speed:.3f}x; ASR={match:.3f}: {recognition['text']}",flush=True)
    (QA / "speech-fitting.json").write_text(json.dumps(timeline,indent=2)+"\n")
    (QA / "asr-clips.json").write_text(json.dumps(transcript,indent=2)+"\n")
    (QA / "fit-failures.json").write_text(json.dumps(failures,indent=2)+"\n")
    if failures:
        raise RuntimeError("Adjust copy/windows; no voiced samples cut: "+json.dumps(failures))
    assert all(a["end"] < b["start"] for a,b in zip(timeline,timeline[1:])),"Speech overlap"
    del asr
    return voice,timeline


@lru_cache(maxsize=256)
def tone(pitch,duration,kind="pluck"):
    t=np.arange(round(duration*SR),dtype=np.float32)/SR
    f=440*2**((pitch-69)/12)
    if kind=="bass":
        a=np.sin(2*np.pi*f*t)+.22*np.sin(4*np.pi*f*t)+.1*np.sin(6*np.pi*f*t)
        a*=np.exp(-t*2.1)*env(len(t),.006,.09)
    elif kind=="keys":
        a=np.sin(2*np.pi*f*t+1.4*np.sin(2*np.pi*f*2*t)*np.exp(-t*6))
        a+=.2*np.sin(2*np.pi*f*3*t)*np.exp(-t*9)
        a*=np.exp(-t*2.3)*env(len(t),.005,.18)
    elif kind=="chord":
        a=sum(np.sin(2*np.pi*f*k*t)/k**1.6 for k in range(1,7))
        a*=np.exp(-t*4.4)*env(len(t),.005,.13)
    else:
        a=np.sin(2*np.pi*f*t+.8*np.sin(2*np.pi*f*2*t)*np.exp(-t*7))
        a*=np.exp(-t*3.7)*env(len(t),.003,.12)
    return a.astype(np.float32)


def make_music(script):
    """Original electro-pop groove with arrangement changes, breaks and hook."""
    duration=script["duration"]
    music=np.zeros((round(duration*SR),2),dtype=np.float32)
    rng=np.random.default_rng(2026091803)
    beat=60/BPM
    bar=4*beat
    origin=script.get("beatOrigin",next((s["start"] for s in script["scenes"] if s["id"] in ("reveal","context")),16))
    chords=[([57,61,64,71],33),([54,57,61,64],30),([50,54,57,64],26),([52,56,59,62],28)]
    t=np.arange(round(.32*SR))/SR
    kick=(np.sin(2*np.pi*(49*t+60*.025*(1-np.exp(-t/.025))))*np.exp(-t*15)*env(len(t),.002,.07)).astype(np.float32)
    clap=rng.normal(0,1,round(.18*SR))
    clap=signal.sosfilt(signal.butter(2,[1100,7200],btype="bandpass",fs=SR,output="sos"),clap)
    ct=np.arange(len(clap))/SR
    clap*=np.exp(-ct*30)*(1+.5*np.sin(2*np.pi*85*ct))*env(len(clap),.002,.045)
    hat=rng.normal(0,1,round(.072*SR))
    hat=signal.sosfilt(signal.butter(2,[6500,15500],btype="bandpass",fs=SR,output="sos"),hat)
    hat*=np.exp(-np.arange(len(hat))/SR*70)*env(len(hat),.001,.018)
    shaker=rng.normal(0,1,round(.09*SR))
    shaker=signal.sosfilt(signal.butter(2,[5000,11500],btype="bandpass",fs=SR,output="sos"),shaker)*env(len(shaker),.012,.05)

    def scene_at(at):
        return next((s["id"] for s in script["scenes"] if s["start"]<=at<s["end"]),"close")

    # Opening: impatient pulse and syncopated question-mark notes; a stopped
    # beat opens a 600ms breath before the product reveal.
    for k,at in enumerate(np.arange(0,max(0,origin-.9),beat)):
        stereo_add(music,kick,at,.045)
        if k%2==1:
            stereo_add(music,hat,at,.018,(-1)**k*.25)
        if k%4==0:
            stereo_add(music,tone([73,76,71,68][k//4%4],.55),at,.026,(-1)**(k//4)*.4)
    # Main groove starts with the AI Peer reveal. Each new scene naturally
    # changes the arrangement, while the same musical pulse joins the tools.
    bar_index=0
    grid=[]
    for segment in script["scenes"]:
        start=max(origin,segment["start"])
        end=min(duration-1.8,segment["end"])
        if end<=start:
            continue
        grid.extend(np.arange(start,end,bar).tolist())
    for at in grid:
        scene=scene_at(at)
        notes,root=chords[bar_index%4]
        quiet=scene in ("zoom","meeting")
        lift=scene in ("reveal","context","handoff","close","usecases","possibilities","montage")
        intensity=.50 if quiet else (1.0 if lift else .78)
        # Danceable four-on-floor kick, clap backbeat and swung 16th hats.
        for k in range(4):
            if not quiet or k%2==0:
                stereo_add(music,kick,at+k*beat,.15*intensity)
            if k in (1,3) and not quiet:
                stereo_add(music,clap.astype(np.float32),at+k*beat,.065*intensity,.05)
        for k in range(8):
            if quiet and k%2==0:
                continue
            swing=.017 if k%2 else 0
            stereo_add(music,hat.astype(np.float32),at+k*beat/2+swing,.034*intensity*(1 if k%2 else .65),-.25 if k%2 else .25)
            if lift and bar_index%4 in (2,3):
                stereo_add(music,shaker.astype(np.float32),at+k*beat/2+beat*.25,.010*intensity,(-1)**k*.55)
        # Bass has syncopation, octave pickups and a fifth at phrase ends.
        for k,(offset,length,pitch) in enumerate([(0,.65,root),(1.5,.37,root),(2,.62,root+12),(3.5,.35,root+7 if bar_index%4==3 else root)]):
            stereo_add(music,tone(pitch,length*beat,"bass"),at+offset*beat,.115*intensity)
        # Bright clipped chord voicings rather than a slow sine pad.
        for pos in ([.5,2.5] if quiet else [.5,1.75,2.5,3.5]):
            for j,pitch in enumerate(notes):
                stereo_add(music,tone(pitch,beat*.92,"chord"),at+pos*beat+j*.006,.023*intensity,(j-1.5)*.23)
        # Hook appears at the reveal and act transitions, then leaves room
        # for actual conversation. A delay tail creates width and motion.
        if lift or (not quiet and bar_index%4==0):
            melody=[(0,76),(.75,73),(1.5,71),(2.75,73)] if bar_index%2==0 else [(0,76),(.75,78),(1.5,76),(3,73)]
            for k,(pos,pitch) in enumerate(melody):
                a=tone(pitch,1.0,"keys")
                pan=(-1)**k*.4
                stereo_add(music,a,at+pos*beat,.043*intensity,pan)
                stereo_add(music,a,at+(pos+.75)*beat,.010*intensity,-pan)
        # Small final-bar drum fill marks each 8-bar section.
        if bar_index%8==7 and not quiet:
            for k in range(4):
                stereo_add(music,clap.astype(np.float32),at+(3+k*.25)*beat,.018*(k+1)*intensity,(-1)**k*.16)
        bar_index+=1
    # Final optimistic major-nine resolution, not an abrupt loop fade.
    close=next((s["start"] for s in script["scenes"] if s["id"]=="close"),duration-7)
    for j,pitch in enumerate([45,57,61,64,71,76]):
        stereo_add(music,tone(pitch,min(3.3,duration-close),"keys"),close+j*.025,.049,(j-2.5)*.2)
    music*=env(len(music),.03,1.2)[:,None]
    music=signal.sosfilt(signal.butter(2,15000,fs=SR,output="sos"),music,axis=0).astype(np.float32)
    music*=.65/max(float(np.max(np.abs(music))),1e-6)
    return music


def make_effects(script):
    effects=np.zeros((round(script["duration"]*SR),2),dtype=np.float32)
    rng=np.random.default_rng(303)
    cues=script.get("effects",[{"time":s["start"],"kind":"transition"} for s in script["scenes"] if s["start"]>0])
    for cue in cues:
        at,kind=cue["time"],cue["kind"]
        if kind == "riser":
            duration=.5
            t=np.arange(round(duration*SR))/SR
            a=rng.normal(0,1,len(t))
            a=signal.sosfilt(signal.butter(2,[700,5800],btype="bandpass",fs=SR,output="sos"),a)
            a*=np.linspace(0,1,len(t))**2*env(len(t),.03,.025)
            stereo_add(effects,a.astype(np.float32),at,.042)
        elif kind in ("transition","reveal"):
            duration=.42
            t=np.arange(round(duration*SR))/SR
            a=rng.normal(0,1,len(t))
            a=signal.sosfilt(signal.butter(2,[600,4500],btype="bandpass",fs=SR,output="sos"),a)
            a*=np.sin(np.pi*t/duration)**2
            stereo_add(effects,a.astype(np.float32),at-.30,.035)
            stereo_add(effects,tone(81,.45),at,.031)
        elif kind in ("message","join","connect","success"):
            for j,pitch in enumerate([76,81] if kind in ("join","success") else [81,76]):
                stereo_add(effects,tone(pitch,.3),at+j*.055,.022,-.15+j*.3)
    effects*=env(len(effects),.01,.4)[:,None]
    return effects,cues


def main():
    parser=argparse.ArgumentParser()
    parser.add_argument("--script",type=Path,default=ROOT/"video/public/draft03/script.json")
    parser.add_argument("--synth-only",action="store_true")
    parser.add_argument("--only",nargs="*")
    parser.add_argument("--asr",action="store_true")
    args=parser.parse_args()
    for path in (OUT,WORK,QA):
        path.mkdir(parents=True,exist_ok=True)
    script_bytes=args.script.read_bytes()
    script=json.loads(script_bytes)
    records=synthesize(script,args.only)
    if args.synth_only:
        return
    assert args.only is None,"--only requires --synth-only"
    voice,timeline=narration(script,records)
    music=make_music(script)
    effects,cues_sfx=make_effects(script)
    # Audible upbeat bed with gentle speech ducking. Zoom has a lighter
    # arrangement, keeping the human turns foregrounded without going flat.
    gain=np.full(len(voice),.54,dtype=np.float32)
    for row in timeline:
        s=round(max(0,row["start"]-.10)*SR)
        a=round(row["start"]*SR)
        b=round(row["end"]*SR)
        e=min(len(gain),b+round(.24*SR))
        low=.17 if row["speaker"]=="narrator" else .14
        gain[s:a]=np.minimum(gain[s:a],np.linspace(.54,low,a-s))
        gain[a:b]=np.minimum(gain[a:b],low)
        gain[b:e]=np.minimum(gain[b:e],np.linspace(low,.54,e-b))
    ducked=music*gain[:,None]
    stereo_voice=np.column_stack([voice,voice])
    mixed=stereo_voice+ducked+effects
    temp=QA/"premaster.wav"
    sf.write(temp,mixed,SR,subtype="FLOAT")
    measured=common.loudness(temp,"premaster-loudness.txt")
    master_gain=min(10**((-16-measured["integrated_lufs"])/20),10**((-1.7-measured["true_peak_dbfs"])/20))
    stems={"narration":stereo_voice*master_gain,"music":ducked*master_gain,"effects":effects*master_gain,"mixed":mixed*master_gain}
    for name,data in stems.items():
        sf.write(OUT/f"{name}.wav",data,SR,subtype="PCM_24")
    sf.write(OUT/"music-unducked.wav",music*master_gain,SR,subtype="PCM_24")
    metadata={"title":"AI Peer — Draft 03 illustrative concept film","duration":script["duration"],"sample_rate":SR,
              "bpm":BPM,"beat_origin":script.get("beatOrigin",16),"script_sha256":hashlib.sha256(script_bytes).hexdigest(),
              "voices":VOICES,"voice_engine":[MODEL,DESIGN_MODEL],"voice_disclosure":"Two stock male speakers and two text-designed fictional female voices. Performance directed by text. No recordings or real voice cloning.",
              "music":"Original 124 BPM electro-pop score, all sounds synthesized from oscillators and filtered noise. No third-party recording or samples.",
              "notes":"Directed natural conversational phrasing. Only silent edge padding trimmed. At most 1.10x pitch-preserving time fit. Exact caption copy mapped to Whisper word boundaries; unmatched tokens interpolated.",
              "master_gain_db":round(20*math.log10(master_gain),4),"scenes":script["scenes"],"lines":timeline,"effects":cues_sfx,
              "stats":{name:common.stats(data) for name,data in stems.items()}}
    (OUT/"timing.json").write_text(json.dumps(metadata,indent=2,ensure_ascii=False)+"\n")
    captions=common.write_captions(timeline)
    report=common.validate(script,timeline,captions,stems)
    report["voice_engine"]=[MODEL,DESIGN_MODEL]
    report["bpm"]=BPM
    report["asr_clip_match_minimum"]=min(x["asr_match_ratio"] for x in timeline)
    (OUT/"validation.json").write_text(json.dumps(report,indent=2)+"\n")
    print(json.dumps({"validation":report["validation"],"loudness":report["loudness"],"duration":script["duration"]},indent=2),flush=True)
    if args.asr:
        common.run_asr(report)
        report["asr"]["transcript"]="../../../../work/draft03/audio-qa/asr.json"
        (OUT/"validation.json").write_text(json.dumps(report,indent=2)+"\n")


if __name__=="__main__":
    main()
