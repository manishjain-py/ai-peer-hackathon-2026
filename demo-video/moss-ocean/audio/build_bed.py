#!/usr/bin/env python3
"""Keep the original music samples except the requested scene cues and ending.

Run through uv with numpy. The existing composer makes the candidate from the saved
take; this assembly keeps unrelated original cues sample-identical. No paid calls.
"""
from pathlib import Path
import hashlib
import json
import subprocess
import numpy as np

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[2]
SR = 48000
DURATION = 119.6

def decode(path):
    raw = subprocess.check_output(['ffmpeg', '-v', 'error', '-i', str(path), '-ac', '2',
                                   '-ar', str(SR), '-f', 'f32le', '-'])
    return np.frombuffer(raw, dtype=np.float32).reshape(-1, 2).copy()

subprocess.run(['uv', 'run', '--quiet', str(ROOT / 'demo-video/film/audio/music/tools/make_bed.py'),
                str(HERE / 'bed-moss-v5.edl.json')], check=True)
original = decode(ROOT / 'demo-video/moss-refinement/audio/bed-moss-v3.wav')
candidate = decode(HERE.parent / '.build/audio/bed-candidate.wav')
out = original[:round(DURATION * SR)].copy()
spans = [(57.9, 99.9)]
for start, end in spans:
    a, b = round(start * SR), round(end * SR)
    blend = np.ones(b - a, dtype=np.float32)
    n = round(.05 * SR)
    blend[:n] = np.linspace(0, 1, n)
    if end < DURATION:
        blend[-n:] = np.linspace(1, 0, n)
    out[a:b] = original[a:b] * (1 - blend[:, None]) + candidate[a:b] * blend[:, None]
dest = HERE / 'bed-moss-v5.wav'
subprocess.run(['ffmpeg', '-v', 'error', '-y', '-f', 'f32le', '-ar', str(SR), '-ac', '2',
                '-i', '-', '-c:a', 'pcm_s24le', str(dest)], input=out.tobytes(), check=True)
decoded = decode(dest)
preserved = []
for a, b in [(0, 57.9), (99.9, DURATION)]:
    old = original[round(a * SR):round(b * SR)]
    new = decoded[round(a * SR):round(b * SR)]
    assert np.array_equal(old, new), (a, b)
    preserved.append({'from': a, 'to': b, 'decoded_samples_identical': True,
                      'sha256': hashlib.sha256(new.tobytes()).hexdigest()})
def rms(a, b):
    x = decoded[round(a * SR):round(b * SR)]
    return round(float(20 * np.log10(np.sqrt(np.mean(x * x)) + 1e-12)), 2)
report = {'seconds': len(decoded) / SR, 'sample_rate': SR, 'changed_spans': spans,
          'preserved_spans': preserved, 'same_source_take': 'lyria35-b2.mp3',
          'ending': {'final_downbeat_s': 116.0, 'no_intro_restart': True,
                     'half_second_rms_dbfs': [{'at': float(t), 'rms': rms(t, min(t+.5, DURATION))}
                                             for t in np.arange(115, 119.6, .5)]}}
(HERE / 'bed-verification.json').write_text(json.dumps(report, indent=2)+'\n')
print(json.dumps(report, indent=2))
