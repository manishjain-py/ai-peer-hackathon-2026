#!/usr/bin/env python3
"""Bounded generation of the separately prompted concepts; no application imports."""
from concurrent.futures import ThreadPoolExecutor,as_completed
from pathlib import Path
import json,subprocess,sys
HERE=Path(__file__).resolve().parents[1]
ENV_FILE=sys.argv[1]
concepts=json.loads((HERE/'concepts.json').read_text())[:-1]
def run(c):
    stem=f"{c['number']:02d}-{c['id']}"
    if (HERE/'images'/f'{stem}.png').exists():return stem+' already exists'
    print('Generating '+stem,flush=True)
    cmd=[sys.executable,str(HERE/'tools/gemini_images.py'),str(HERE/'requests'/f'{stem}.json'),'--env-file',ENV_FILE,'--cap','5']
    p=subprocess.run(cmd,capture_output=True,text=True)
    (HERE/'.build'/f'{stem}-generation.log').write_text(p.stdout+p.stderr)
    if p.returncode:raise RuntimeError(stem+' failed; safe response metadata saved')
    return stem+' generated'
with ThreadPoolExecutor(max_workers=3) as pool:
    jobs=[pool.submit(run,c) for c in concepts]
    for j in as_completed(jobs): print(j.result(),flush=True)
print('All 24 new masters generated; Moss retained as bonus25',flush=True)
