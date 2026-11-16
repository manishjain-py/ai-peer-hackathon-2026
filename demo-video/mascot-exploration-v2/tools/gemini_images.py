#!/usr/bin/env python3
"""Original generic mascot art through the user's explicitly requested Gemini API.

Request shape follows the inspected GeminiImageClient / sticker_gen implementation;
this independent tool never imports or runs the other repository's application.
Secrets are parsed into memory only and never written into requests or responses.
"""
import argparse,base64,datetime,fcntl,json,os,time,urllib.request,urllib.error
from pathlib import Path
BASE='https://generativelanguage.googleapis.com/v1beta'
HERE=Path(__file__).resolve().parents[1]
def key(env_file):
    value=os.getenv('GEMINI_API_KEY','').strip()
    if not value and env_file:
        for raw in Path(env_file).read_text().splitlines():
            k,sep,v=raw.strip().removeprefix('export ').partition('=')
            if k.strip()=='GEMINI_API_KEY' and sep:
                v=v.strip();value=v[1:v.find(v[0],1)] if v[:1] in ('"',"'") and v.find(v[0],1)>0 else v.split(' #',1)[0].strip()
    if not value or not all(33<=ord(c)<=126 for c in value):raise SystemExit('Gemini key unavailable or invalid format; value withheld')
    return value

def call(url,secret,body=None):
    data=json.dumps(body).encode() if body else None
    req=urllib.request.Request(url,data=data,headers={'x-goog-api-key':secret,'Content-Type':'application/json'})
    try:
        with urllib.request.urlopen(req,timeout=240) as r:return r.status,json.loads(r.read())
    except urllib.error.HTTPError as e:
        raw=e.read().decode(errors='replace').replace(secret,'[redacted]')
        try:payload=json.loads(raw)
        except ValueError:payload={'error':{'message':'Non-JSON provider response'}}
        return e.code,payload
    except Exception as e:raise RuntimeError(type(e).__name__+' contacting Gemini; credential withheld') from None

def main():
    p=argparse.ArgumentParser();p.add_argument('request',nargs='?');p.add_argument('--env-file');p.add_argument('--probe-model');p.add_argument('--cap',type=float,default=15);a=p.parse_args();secret=key(a.env_file)
    if a.probe_model:
        status,j=call(BASE+'/models/'+a.probe_model,secret)
        print(json.dumps({'status':status,'name':j.get('name'),'supportedGenerationMethods':j.get('supportedGenerationMethods'),'error_status':j.get('error',{}).get('status')}));return
    request=Path(a.request).resolve();spec=json.loads(request.read_text());model=spec['model'];assert model=='gemini-nano-banana-2.1', 'This budgeted runner only prices the verified model';price=float(spec['reserve_usd']);out=HERE/spec['output'];out.parent.mkdir(parents=True,exist_ok=True)
    if out.exists():raise SystemExit('Output exists; refusing overwrite')
    ledger=HERE/'ledger/gemini.jsonl';lock=HERE/'ledger/.gemini.lock';lock.parent.mkdir(parents=True,exist_ok=True)
    with lock.open('w') as fh:
        fcntl.flock(fh,fcntl.LOCK_EX)
        rows=[json.loads(l) for l in ledger.read_text().splitlines()] if ledger.exists() else []
        total=sum(float(r['cost_usd']) for r in rows)
        if total+price>a.cap:raise SystemExit('Budget cap would be exceeded')
        # No auto-retry: uncertain or failed requests remain charged at the reservation.
        row={'time_utc':datetime.datetime.now(datetime.timezone.utc).isoformat(),'provider':'Google Gemini API','model':model,'request':str(request.relative_to(HERE)),'output':spec['output'],'cost_usd':price,'cost_basis':'conservative reservation, not invoice','status':'reserved'}
        with ledger.open('a') as f:f.write(json.dumps(row)+'\n')
    started=time.time();status,response=call(BASE+'/models/'+model+':generateContent',secret,spec['body'])
    img=None;mime=None
    for c in response.get('candidates',[]):
        for part in c.get('content',{}).get('parts',[]):
            d=part.get('inlineData') or part.get('inline_data')
            if d and d.get('data'):img=base64.b64decode(d['data']);mime=d.get('mimeType');break
        if img:break
    info={'model':model,'http_status':status,'elapsed_seconds':round(time.time()-started,2),'usage':response.get('usageMetadata'),'modelVersion':response.get('modelVersion'),'responseId':response.get('responseId'),'image_mime':mime,'error_status':response.get('error',{}).get('status'),'finishReasons':[c.get('finishReason') for c in response.get('candidates',[])]}
    if img:out.write_bytes(img)
    usage=info.get('usage') or {}
    image_tokens=sum(x.get('tokenCount',0) for x in usage.get('candidatesTokensDetails',[]) if x.get('modality')=='IMAGE')
    if img and image_tokens:
        text_tokens=max(0,usage.get('candidatesTokenCount',0)-image_tokens)+usage.get('thoughtsTokenCount',0)
        estimated=usage.get('promptTokenCount',0)*1.5/1e6+text_tokens*7.5/1e6+image_tokens*30/1e6
        row.update(cost_usd=round(estimated,6),cost_basis='Provider token usage x official Google standard pricing; estimate, not invoice',status='completed',reserved_usd=price)
        with lock.open('w') as fh:
            fcntl.flock(fh,fcntl.LOCK_EX)
            rows=[json.loads(l) for l in ledger.read_text().splitlines()]
            for i,r in enumerate(rows):
                if r['request']==row['request']:rows[i]=row
            ledger.write_text(''.join(json.dumps(r)+'\n' for r in rows))
    (HERE/'evidence'/f'{out.stem}-generation.json').write_text(json.dumps(info,indent=2)+'\n')
    print(json.dumps({'file':str(out) if img else None,'status':status,'bytes':len(img) if img else 0,'reserved_usd':price,'usage':info['usage'],'error_status':info['error_status']}))
    if not img:raise SystemExit(1)
if __name__=='__main__':main()
