"""The owner's web page (D10), in the concept film's look: one-click setup (F1), what I learned
(F2), roles and settings (F3), the activity log (F4).

Run: .venv/bin/python -m peer web   ->  http://127.0.0.1:8787   (a test owner: AI_PEER_OWNER=<id> ... --port 8788)
Other packages add pages with @app.get(...) plus layout.NAV (additive).
"""
from __future__ import annotations

import html
import json
import re
from datetime import datetime
from zoneinfo import ZoneInfo

from fastapi import FastAPI, Request
from fastapi.responses import HTMLResponse, JSONResponse, RedirectResponse

from ..activity import ActivityLog
from ..settings import get_settings
from .layout import first_name, icon, page, peer_mark, profile

app = FastAPI(title="AI Peer")

LINK = re.compile(r"<(https?://[^|>]+)\|([^>]+)>")
MDLINK = re.compile(r"\[([^\]]+)\]\((https?://[^)]+)\)")
BOLD = re.compile(r"\*([^*\n]+)\*")
ITAL = re.compile(r"(?<![\w])_([^_\n]+)_(?![\w])")
E = html.escape

KIND_LABEL = {
    "answered_in_thread": "Answered for you", "answered_follow_up": "Answered a follow-up",
    "drafted_for_owner": "Draft for you", "sent_after_approval": "Sent after your OK",
    "skipped_by_owner": "You skipped", "stood_down": "Stood down", "noticed": "Noticed",
    "owner_instruction": "Your instruction", "failed": "Problem", "started": "Started", "resolved": "Resolved",
    "setup": "Set up your Peer", "owner_correction": "You corrected a fact", "settings_changed": "You changed a setting",
    "memory_updated": "Memory updated", "tuned": "Learned from your feedback", "held_back": "Held back (your rule)",
    "told_owner": "Told you", "local_work": "Local work noted", "nightly": "Nightly refresh",
}
FILTERS = {
    "": ("Everything", None),
    "review": ("Needs your review", None),
    "answers": ("Answers and drafts", {"answered_in_thread", "answered_follow_up", "drafted_for_owner", "sent_after_approval", "skipped_by_owner", "stood_down"}),
    "you": ("Your instructions", {"owner_instruction", "owner_correction", "settings_changed", "tuned"}),
    "memory": ("Memory", {"memory_updated", "nightly", "local_work", "setup"}),
    "told": ("Told you or held back", {"told_owner", "held_back"}),
}

ROLES = [
    ("watch_my_work", "Watch my work", "Reads the Slack channels you're in and your repos (read-only), and brings you what matters.",
     "Slack channels I'm in; my GitHub repos and their trackers"),
    ("stand_in_when_away", "Stand in when I'm away", "When you're away, answers questions about your work in the thread, as your labelled AI Peer, with sources and dates. Never commits you.",
     "Questions about my projects and services"),
    ("find_opportunities", "Find opportunities", "Spots events, asks and changes that fit your interests, for your brief.",
     "My interests from the directory"),
    ("cover_meetings", "Cover meetings", "Joins the meetings you hand it as your labelled AI Peer, plays the update you approved, and briefs you after.",
     "Only meetings I mark \"cover for me\""),
    ("daily_brief", "Daily brief", "A short brief each morning, in your Slack DM and here: what happened, what waits on you.",
     "Every working morning"),
]


def mrkdwn(text: str | None) -> str:
    if not text:
        return ""
    t = E(text, quote=False)
    t = LINK.sub(lambda m: f'<a href="{E(m.group(1))}" target="_blank">{m.group(2)}</a>', t)
    t = MDLINK.sub(lambda m: f'<a href="{E(m.group(2))}" target="_blank">{m.group(1)}</a>', t)
    t = re.sub(r"&lt;(https?://[^&]+)&gt;", lambda m: f'<a href="{m.group(1)}" target="_blank">{m.group(1)}</a>', t)
    t = BOLD.sub(r"<b>\1</b>", t)
    t = ITAL.sub(r"<i>\1</i>", t)
    t = t.replace(":robot_face:", "🤖")
    t = re.sub(r":[a-z_]+:", "", t)
    return t.replace("\n", "<br>")


def nice_date(s: str | None) -> str:
    m = re.search(r"(\d{4})-(\d{2})-(\d{2})", s or "")
    if not m:
        return s or ""
    return datetime(int(m.group(1)), int(m.group(2)), int(m.group(3))).strftime("%-d %b %Y")


def _local(iso: str, tz: str) -> str:
    try:
        return datetime.fromisoformat(iso).astimezone(ZoneInfo(tz)).strftime("%-d %b, %-I:%M %p")
    except Exception:  # noqa: BLE001
        return iso


def _has_memory() -> bool:
    return (get_settings().owner_dir / "me.md").exists()


@app.get("/")
def root():
    return RedirectResponse("/learned" if _has_memory() else "/setup")


# == F1 one-click setup ===============================================================================
def profile_card(p: dict) -> str:
    owns = p.get("owns", {})
    repos = "".join(f'<li><b>{E(r["repo"].split("/")[-1])}</b> <span class="muted">· {E(r["what"][:90])}</span></li>' for r in owns.get("repos", []))
    svcs = " ".join(f'<span class="pill grey">{E(s["name"])}</span>' for s in owns.get("services", []))
    ints = " ".join(f'<span class="pill">{E(i)}</span>' for i in p.get("interests", []))
    wh = p.get("working_hours") or {}
    return f"""<div class="dir"><div class="dirbar"><span class="dots"><i></i><i></i><i></i></span><b>Company directory</b> · People
<span class="muted small" style="margin-left:auto">stand-in for your company's directory</span></div>
<div class="dirbody"><div style="display:flex;gap:16px;align-items:center"><div class="bigav">{E(p.get('name', '?')[:1])}</div>
<div><div style="font-size:26px;font-weight:800">{E(p.get('name', ''))}</div><div class="muted" style="font-size:17px">{E(p.get('title', ''))} · {E(p.get('company', ''))}</div></div></div>
<div class="facts2"><div class="fbox"><div class="label">Team</div><div class="fv">{E(p.get('team', ''))}</div></div>
<div class="fbox"><div class="label">Where</div><div class="fv">{E(p.get('location', ''))}</div><div class="muted small">{E(p.get('tz', ''))} · {E(wh.get('start', ''))} to {E(wh.get('end', ''))}</div></div></div>
<div class="label" style="margin-top:16px">What you own</div><ul class="owns">{repos}</ul><div>{svcs}</div>
<div class="label" style="margin-top:16px">Interests</div><div style="display:flex;gap:6px;flex-wrap:wrap;margin-top:6px">{ints}</div></div></div>"""


SETUP_CSS = """
.stepper{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:6px 0 24px}
.stg{display:flex;gap:9px;align-items:center;font-weight:600;color:#8f9d94}.stg.on{color:var(--green);font-weight:750}
.stg span{display:flex;align-items:center;justify-content:center;width:26px;height:26px;border-radius:20px;background:#e9eee8;font-size:13px}
.stg.on span{background:#d9eddd}.bar{height:1px;width:38px;background:#cbd9cf}
.hero{text-align:center;padding:26px 0 8px}.hero h1{font-size:54px;letter-spacing:-2.5px;margin:12px 0 28px}
.grid{display:grid;grid-template-columns:minmax(0,1.25fr) minmax(0,1fr);gap:22px;align-items:start}
@media (max-width:980px){.grid{grid-template-columns:1fr}}
.dir{background:#fff;border:1px solid #d8e2dc;border-radius:17px;overflow:hidden;box-shadow:0 18px 40px #18382c09}
.dirbar{display:flex;align-items:center;gap:9px;padding:11px 16px;background:#f0f3ef;border-bottom:1px solid #d8e2dc;color:#48697e}
.dots{display:flex;gap:6px;margin-right:6px}.dots i{width:9px;height:9px;border-radius:9px;background:#fc7667}.dots i:nth-child(2){background:#eabd58}.dots i:nth-child(3){background:#70bf86}
.dirbody{padding:20px 22px}.bigav{width:64px;height:64px;border-radius:15px;background:#bdcfdf;display:flex;align-items:center;justify-content:center;font-size:27px;font-weight:750}
.facts2{display:flex;gap:12px;margin-top:18px}.fbox{flex:1;padding:14px 16px;border:1px solid #d6e4da;border-radius:11px;background:#f2f7f1}.fv{font-size:19px;font-weight:750;margin-top:4px}
.owns{margin:8px 0 10px;padding-left:18px}.owns li{margin:3px 0}
.steps .st{display:flex;gap:12px;padding:12px 4px;border-bottom:1px solid #e7ece6}.steps .st:last-child{border:0}
.sic{width:28px;height:28px;border-radius:20px;display:flex;align-items:center;justify-content:center;flex-shrink:0;background:#e9eee8;color:#8f9d94;font-size:13px;font-weight:750}
.st.done .sic{background:#d9eddd;color:var(--green)}.st.running .sic{background:var(--mint);color:#173c33}.st.not_connected .sic,.st.failed .sic{background:var(--amberbg);color:var(--amber)}
.st b{display:block}.st .lines{font-size:13px;color:var(--muted);margin-top:3px}.st .lines div{margin:1px 0}
.st.running b::after{content:" · learning";color:var(--green);font-weight:600;animation:blink 1.2s infinite}@keyframes blink{50%{opacity:.35}}
.learn{border:1px solid #cce0d1;border-radius:18px;background:var(--soft);padding:20px 22px}
.lrow{display:flex;gap:12px;margin-top:10px}.lrow .ln{width:10px;display:flex;flex-direction:column;align-items:center}
.lrow .ln i{width:9px;height:9px;border-radius:8px;background:var(--green);margin-top:12px}.lrow .lb{flex:1;min-width:0;border:1px solid #d9e7d8;border-radius:10px;padding:9px 13px;background:#ffffffe0}
.lrow .k{font-size:11px;letter-spacing:1.3px;color:#668a73;font-weight:750;text-transform:uppercase}.lrow .v{font-size:17px;font-weight:750;margin-top:2px}
.ready{text-align:center;padding:30px 0}.ready h1{font-size:56px;letter-spacing:-2.5px;margin:16px 0 6px}
.chips{display:flex;gap:12px;justify-content:center;flex-wrap:wrap;margin-top:22px}
.chip{display:flex;gap:9px;align-items:center;padding:12px 18px;border-radius:11px;background:#fff;border:1px solid #d1e1d5;text-decoration:none;color:var(--ink);font-weight:650}
"""

SETUP_JS = """
const STAGES=['Create','Know you','Know your work','Choose access','Ready'];
const ICON={waiting:'·',running:'…',done:'✓',not_connected:'–',failed:'!'};
const NOTE={not_connected:'Not connected yet',failed:'Problem'};
let timer=null;
function esc(s){return (s||'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))}
function stage(d){if(!d)return 0;if(d.state==='done')return 5;const done=k=>d.steps.find(s=>s.key===k&&s.status!=='waiting'&&s.status!=='running');
 if(done('people'))return 2;if(done('team'))return 2;return 1}
function stepper(n){return STAGES.map((l,i)=>`<div class="stg ${i<=n?'on':''}"><span>${i<n?'✓':i+1}</span>${l}</div>`+(i<4?'<div class="bar"></div>':'')).join('')}
function render(d){
 document.getElementById('stepper').innerHTML=stepper(stage(d));
 if(!d||d.state==='idle'){return}
 document.getElementById('start').style.display='none';
 if(d.state==='done'){document.getElementById('live').style.display='none';document.getElementById('ready').style.display='block';
   document.getElementById('summary').innerHTML=d.steps.filter(s=>s.key!=='finish').map(s=>`<div class="st ${s.status}"><div class="sic">${ICON[s.status]||'·'}</div><div><b>${esc(s.label)}</b><div class="lines">${esc(NOTE[s.status]||s.detail)}</div></div></div>`).join('');
   if(timer){clearInterval(timer);timer=null}return}
 document.getElementById('live').style.display='grid';
 document.getElementById('steps').innerHTML=d.steps.filter(s=>s.key!=='finish').map(s=>{
   const lines=(s.status==='running'?s.lines.slice(-4):s.lines.slice(-2)).map(l=>`<div>${esc(l)}</div>`).join('');
   const note=NOTE[s.status]?`<div class="lines">${NOTE[s.status]}: ${esc(s.detail)}</div>`:'';
   return `<div class="st ${s.status}"><div class="sic">${ICON[s.status]||'·'}</div><div><b>${esc(s.label)}</b>${note}<div class="lines">${s.status==='waiting'?'':lines}</div></div></div>`}).join('');
 document.getElementById('learned').innerHTML=d.learned.map(x=>`<div class="lrow"><div class="ln"><i></i></div><div class="lb"><div class="k">${esc(x.label)}</div><div class="v">${esc(x.value)}</div><div class="muted small">${esc(x.detail)}</div><div class="small" style="color:#668a73;margin-top:3px">from ${esc(x.source)}</div></div></div>`).join('');
}
async function poll(){try{const r=await fetch('/api/setup/progress');render(await r.json())}catch(e){}}
async function go(){const b=document.getElementById('go');b.disabled=true;b.lastChild.textContent=' Starting…';
 await fetch('/api/setup/start',{method:'POST'});poll();timer=setInterval(poll,1000)}
poll().then(()=>{fetch('/api/setup/progress').then(r=>r.json()).then(d=>{if(d&&d.state==='running')timer=setInterval(poll,1000)})});
"""


@app.get("/setup", response_class=HTMLResponse)
def setup_page():
    p = profile()
    name = first_name(p)
    body = f"""<style>{SETUP_CSS}</style>
<div class="stepper" id="stepper"></div>
<div id="start"><div class="grid"><div>{profile_card(p)}</div>
<div class="card" style="text-align:center;padding:34px 24px"><div class="label">Make a little room for yourself</div>
<h1 style="font-size:40px;letter-spacing:-1.5px;margin:12px 0 22px">Start with your Peer.</h1>
<button class="btn big" id="go" onclick="go()">{peer_mark(40)}<span> Create my AI Peer</span></button>
<p class="muted" style="margin-top:18px">A personal teammate, built around your work. It reads your profile, your repos and your
Slack channels (read-only), then shows you what it learned. You choose the access. You keep the decisions.</p>
<p class="ai">🤖 Your Peer is an AI. It always says so.</p></div></div></div>
<div id="live" class="grid" style="display:none"><div class="card steps"><div class="label">Getting to know your work</div><div id="steps"></div></div>
<div class="learn"><div style="display:flex;gap:12px;align-items:center">{peer_mark(46)}<div><div style="font-size:21px;font-weight:800">Your Peer is learning</div>
<div class="muted small">One connected picture of your work</div></div></div><div id="learned"></div></div></div>
<div id="ready" style="display:none"><div class="ready">{peer_mark(96)}<h1>Your Peer is ready.</h1>
<div style="font-size:21px;color:var(--green)">Your work, in progress. Your choices, always.</div>
<div class="chips"><a class="chip" href="/learned">{icon('file')} See what I learned</a><a class="chip" href="/settings">{icon('switch')} Choose roles and access</a>
<a class="chip" href="/activity">{icon('clock')} Activity</a></div></div>
<div class="card steps" style="max-width:720px;margin:10px auto 0"><div class="label">What setup did</div><div id="summary"></div>
<div style="margin-top:12px"><button class="btn ghost" onclick="go()">Run setup again</button></div></div></div>"""
    return page(f"Create {name}'s AI Peer", body, active="/setup", script=SETUP_JS)


@app.post("/api/setup/start")
def setup_start():
    from ..memory.discovery import discover_in_background
    started = discover_in_background(get_settings())
    return JSONResponse({"started": started})


@app.get("/api/setup/progress")
def setup_progress():
    from ..memory.discovery import setup_state
    st = get_settings()
    d = setup_state(st)
    if d is None:
        d = {"state": "done" if _has_memory() else "idle", "steps": [], "learned": []}
    return JSONResponse(d)


# == F2 what I learned ====================================================================================
LEARN_CSS = """
.fact{display:flex;gap:10px;align-items:flex-start;padding:7px 0;border-top:1px solid #eef2ec}.fact:first-of-type{border-top:0}
.fact .t{flex:1;min-width:0;overflow-wrap:anywhere}.fact .t.c{color:var(--green)}.fact .t.c::after{content:" · your correction";font-size:12px;color:var(--amber);font-weight:650}
.fix{border:0;background:transparent;color:var(--muted);cursor:pointer;font:inherit;font-size:13px;padding:2px 6px;border-radius:7px}.fix:hover{background:#eef3ec;color:var(--green)}
.srcl{font-size:12px;color:var(--muted);margin-top:6px}.srcl a{color:var(--muted)}
.edit{display:flex;gap:8px;margin:6px 0}.cols{display:grid;grid-template-columns:repeat(auto-fill,minmax(300px,1fr));gap:12px}
.ftitle{font-weight:800;font-size:17px}.fsum{color:var(--muted);font-size:14px;margin:2px 0 6px}
"""

LEARN_JS = """
function fix(btn){const f=btn.closest('.fact');if(f.querySelector('.edit'))return;const t=f.querySelector('.t');
 const e=document.createElement('div');e.className='edit';e.innerHTML='<input type="text"><button class="btn" style="padding:7px 14px">Save</button><button class="btn ghost" style="padding:7px 12px">Cancel</button>';
 e.querySelector('input').value=t.dataset.text;f.querySelector('.t').after(e);e.querySelector('input').focus();
 e.querySelector('.ghost').onclick=()=>e.remove();
 e.querySelector('.btn').onclick=async()=>{const r=await fetch('/api/correct',{method:'POST',headers:{'Content-Type':'application/json'},
   body:JSON.stringify({rel:f.dataset.rel,id:f.dataset.id,text:e.querySelector('input').value})});const j=await r.json();
   if(j.ok){location.reload()}else{alert(j.error||'Could not save')}}}
"""


def _src(src: dict, corrected: bool = False) -> str:
    if not src:
        return ""
    url, title = src.get("url", ""), src.get("title", "source")
    t = f'<a href="{E(url)}" target="_blank">{E(title)}</a>' if url.startswith("http") else E(title)
    return f'<div class="srcl">Source: {t}{" · " + nice_date(src.get("date")) if src.get("date") else ""}</div>'


def fact_rows(f: dict, limit: int | None = None) -> str:
    rows = []
    for x in f["facts"][:limit]:
        corr = next((c for c in f.get("corrections", []) if (c.get("now") or "").lstrip("- ").strip() == x["text"]), None) if x["corrected"] else None
        when = f' <span class="small muted">(you, {nice_date(corr.get("date"))})</span>' if corr else ""
        rows.append(f'<div class="fact" data-rel="{E(f["rel"])}" data-id="{x["id"]}"><div class="t {"c" if x["corrected"] else ""}" '
                    f'data-text="{E(x["text"])}">{mrkdwn(x["text"])}{when}</div><button class="fix" onclick="fix(this)" title="Correct this">✎ Correct</button></div>')
    return "".join(rows)


def fact_card(f: dict, title: str | None = None, limit: int | None = None) -> str:
    return (f'<div class="card"><div class="ftitle">{E(title or f["title"])}</div>'
            + (f'<div class="fsum">{E(f["summary"])}</div>' if f.get("summary") and not title else "")
            + fact_rows(f, limit) + _src(f["source"]) + "</div>")


@app.get("/learned", response_class=HTMLResponse)
def learned_page():
    from ..memory.facts import learned
    st = get_settings()
    name = first_name()
    if not _has_memory():
        return page("What I learned", '<div class="label">What I learned about you</div><h1>Nothing yet.</h1>'
                    '<p class="lead">Create your Peer first: it reads your profile and work, then shows you everything here.</p>'
                    '<a class="btn" href="/setup">Create my AI Peer</a>', active="/learned")
    d = learned(st)
    me = d["me"]
    parts = [f'<div class="label">What I learned about you</div><h1>Here is what I know, {E(name)}.</h1>'
             '<p class="lead">Every fact shows where it came from and when. If something is wrong, correct it: I change my memory at once, and my next answer uses your words.</p>']
    parts.append('<h2>You</h2><div class="cols">' + fact_card(me, "Role, team and hours") + fact_card(d["interests"], "Interests") + "</div>")
    if d["owns"]:
        parts.append('<h2>What you own</h2><div class="cols">' + "".join(fact_card(f, limit=4) for f in d["owns"]) + "</div>")
    if d["projects"]:
        parts.append('<h2>Projects and their status</h2><div class="cols">' + "".join(fact_card(f) for f in d["projects"]) + "</div>")
    if d["people"]:
        parts.append('<h2>People you work with</h2><div class="cols">' + "".join(fact_card(f) for f in d["people"]) + "</div>")
    if d["channels"]:
        parts.append('<h2>Your Slack channels</h2><div class="cols">' + "".join(fact_card(f) for f in d["channels"]) + "</div>")
    parts.append('<h2>Your local work</h2>' + ('<div class="cols">' + "".join(fact_card(f) for f in d["local"]) + "</div>" if d["local"] else
                 '<div class="card muted">Nothing recorded yet. When you allow it (Roles and settings), I note the repo, branch and unpushed '
                 'changes when a coding session ends, and scan your chosen folders hourly. Summaries only, never code.</div>'))
    return page("What I learned", f"<style>{LEARN_CSS}</style>" + "".join(parts), active="/learned", script=LEARN_JS)


@app.post("/api/correct")
async def api_correct(req: Request):
    from ..memory.facts import correct
    b = await req.json()
    try:
        out = correct(get_settings(), b["rel"], b["id"], b.get("text", ""), who=first_name())
        return JSONResponse({"ok": True, **out})
    except (KeyError, ValueError) as e:
        return JSONResponse({"ok": False, "error": str(e)}, status_code=400)


# == F3 roles and settings =================================================================================
SETTINGS_JS = """
async function save(key,value){const r=await fetch('/api/settings',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key,value})});
 const j=await r.json();if(!j.ok){alert(j.error||'Could not save')}return j}
async function flip(b){const on=!b.classList.contains('on');b.classList.toggle('on',on);await save(b.dataset.key,b.dataset.on&&on?b.dataset.on:(b.dataset.off&&!on?b.dataset.off:on));
 const s=document.getElementById('st-'+b.dataset.key.replace('.','-'));if(s)s.textContent=on?'On':'Off'}
async function scope(i){await save(i.dataset.key,i.value);i.style.borderColor='#5c9c6d';setTimeout(()=>i.style.borderColor='',900)}
"""


def toggle(key: str, on: bool, on_val: str = "", off_val: str = "") -> str:
    extra = (f' data-on="{on_val}"' if on_val else "") + (f' data-off="{off_val}"' if off_val else "")
    return f'<button class="toggle {"on" if on else ""}" data-key="{key}"{extra} onclick="flip(this)" aria-label="{key}"><i></i></button>'


@app.get("/settings", response_class=HTMLResponse)
def settings_page():
    from ..presence import Presence
    st = get_settings()
    p = profile()
    name = first_name(p)
    pres = Presence(st, None, None, p).state(fresh=True)
    manual = str(st.get("presence.manual", "auto"))
    rows = []
    for key, label, what, scope_default in ROLES:
        on = bool(st.get(f"roles.{key}", True))
        scope_val = st.get(f"scope.{key}") or scope_default
        rows.append(f"""<div class="card" style="display:flex;gap:18px;align-items:flex-start"><div style="flex:1;min-width:0">
<div style="font-size:19px;font-weight:800">{E(label)} <span class="pill {'' if on else 'grey'}" id="st-roles-{key}">{'On' if on else 'Off'}</span></div>
<div class="muted" style="margin:4px 0 10px">{E(what)}</div>
<label class="small muted">Scope, in plain English</label><input type="text" data-key="scope.{key}" value="{E(scope_val)}" onchange="scope(this)"></div>
{toggle(f'roles.{key}', on)}</div>""")
    away_on = manual == "away"
    backend = st.get("brain.backend", "claude")
    body = f"""<div class="label">Roles and settings</div><h1>Where can your Peer help?</h1>
<p class="lead">You choose the access. You keep the decisions.</p>
<div class="card" style="display:flex;gap:18px;align-items:center;border-color:#cce0d1;background:var(--soft)">
<div style="flex:1"><div style="font-size:19px;font-weight:800">I'm away</div>
<div class="muted">On: your Peer treats you as away and stands in now. Off: it goes by your Slack presence and working hours.
Right now you count as <b>{E(pres['status'])}</b> ({E(pres['reason'])}; {E(pres['local_time'])} in {E(pres['where'])}).</div></div>
{toggle('presence.manual', away_on, 'away', 'auto')}</div>
{''.join(rows)}
<div class="note" style="margin:16px 0">Ask me before commitments or changes. Emails, invites and anything that commits you always wait for your OK.</div>
<h2>Brain</h2><div class="card" style="display:flex;gap:18px;align-items:center"><div style="flex:1"><b>Which AI thinks for your Peer</b>
<div class="muted">One setting: Claude Code or Codex. Now: <b>{E(backend)}</b>.</div></div>
<button class="btn {'ghost' if backend != 'claude' else ''}" onclick="save('brain.backend','claude').then(()=>location.reload())">Claude</button>
<button class="btn {'ghost' if backend != 'codex' else ''}" onclick="save('brain.backend','codex').then(()=>location.reload())">Codex</button></div>
<h2>Your rules</h2><div class="card"><div class="muted small">What you told your Peer (in your DM or here). It follows these on every run.</div>
<pre style="white-space:pre-wrap;font:inherit;margin:8px 0 0">{E(_rules_text(st))}</pre></div>"""
    return page("Roles and settings", body, active="/settings", script=SETTINGS_JS)


def _rules_text(st) -> str:
    p = st.owner_dir / "rules.md"
    return p.read_text() if p.exists() else "No rules yet: create your Peer first."


ALLOWED = re.compile(r"^(roles\.(watch_my_work|stand_in_when_away|find_opportunities|cover_meetings|daily_brief)|"
                     r"scope\.(watch_my_work|stand_in_when_away|find_opportunities|cover_meetings|daily_brief)|presence\.manual|brain\.backend)$")


@app.post("/api/settings")
async def api_settings(req: Request):
    b = await req.json()
    key, value = b.get("key", ""), b.get("value")
    if not ALLOWED.match(key):
        return JSONResponse({"ok": False, "error": "that setting cannot be changed here"}, status_code=400)
    if key == "presence.manual" and value not in ("away", "auto", "online"):
        return JSONResponse({"ok": False, "error": "bad value"}, status_code=400)
    if key == "brain.backend" and value not in ("claude", "codex"):
        return JSONResponse({"ok": False, "error": "bad value"}, status_code=400)
    if key.startswith("roles."):
        value = bool(value)
    if key.startswith("scope."):
        value = str(value)[:300]
    st = get_settings()
    st.set(key, value)
    if key.startswith(("scope.", "roles.")):
        from ..tuning import sync_scope
        sync_scope(st)
    label = {"presence.manual": "the away switch", "brain.backend": "the brain"}.get(key, key.split(".", 1)[1].replace("_", " "))
    ActivityLog(st.log_path).add("settings_changed", f"{first_name()} set {label} to {value if not isinstance(value, bool) else ('on' if value else 'off')}",
                                 who_asked=first_name(), where="Roles and settings page", outcome="done", extra={"key": key, "value": value})
    return JSONResponse({"ok": True, "key": key, "value": value})


# == F4 activity log ========================================================================================
ACT_CSS = """
.card.open{border-color:var(--warn);box-shadow:0 0 0 2px #ab682b22}
.top{display:flex;gap:10px;align-items:center;font-size:13px;flex-wrap:wrap}.kind{font-weight:750;color:var(--green)}
.badge{margin-left:auto;font-size:12px;padding:2px 9px;border-radius:99px;background:#eceee9;color:var(--muted)}.badge.waiting-for-you{background:var(--warn);color:#fff}
.sum{margin:6px 0 2px;font-weight:650;font-size:16px}.meta{color:var(--muted);font-size:13px}
.q{margin:8px 0;padding-left:10px;border-left:3px solid var(--line);color:var(--muted)}.needs{margin:8px 0;color:var(--amber);font-weight:650}
details{margin-top:8px}summary{cursor:pointer;color:var(--green);font-size:14px;font-weight:650}
.said{margin-top:8px;padding:10px 12px;background:var(--paper);border-radius:10px;font-size:14px}.srcs{margin:8px 0 0;padding-left:18px;font-size:13px}
.filters{display:flex;gap:8px;flex-wrap:wrap;margin:4px 0 6px}.filters a{padding:6px 12px;border-radius:9px;border:1px solid var(--cardline);text-decoration:none;color:var(--muted);font-weight:650;font-size:14px;background:#fffef9}
.filters a.on{background:#deebdd;color:var(--green);border-color:#cce0d1}
"""


def _entries(dry: int = 0) -> list[dict]:
    st = get_settings()
    path = st.owner_dir / "dryrun" / "log.jsonl" if dry else st.log_path   # dry=1: the dry-run walks' own log
    entries = ActivityLog(path).entries(limit=2000)
    closed = {e["ref"] for e in entries if e["kind"] in ("sent_after_approval", "skipped_by_owner", "resolved") and e.get("ref")}
    for e in entries:
        e["open"] = e.get("outcome") == "pending_approval" and e.get("ref") not in closed
    return entries


@app.get("/api/activity")
def api_activity():
    return JSONResponse(_entries())


@app.get("/activity", response_class=HTMLResponse)
def activity(all: int = 0, f: str = "", dry: int = 0):
    p = profile()
    tz = p.get("tz", "UTC")
    entries = [e for e in _entries(dry) if all or e["kind"] not in ("noticed", "started")]
    entries.reverse()
    review = [e for e in entries if e["open"] or (e.get("needs_review") and e["kind"] != "drafted_for_owner")]
    kinds = FILTERS.get(f, FILTERS[""])[1]
    rest = [e for e in entries if e not in review and (kinds is None or e["kind"] in kinds)]

    def card(e: dict) -> str:
        srcs = "".join(f'<li>{(chr(60) + "a href=" + chr(34) + E(s.get("url", "")) + chr(34) + " target=_blank>" + E(s.get("title", "source")) + "</a>") if str(s.get("url", "")).startswith("http") else E(s.get("title", "source"))}'
                       f'<span class="muted"> {E(nice_date(s.get("date", "")))}</span></li>' for s in e.get("sources", []))
        said = f'<details><summary>What the Peer said or did</summary><div class="said">{mrkdwn(e.get("said"))}</div></details>' if e.get("said") else ""
        q = (e.get("extra") or {}).get("question")
        question = f'<div class="q">“{E(q)}”</div>' if q else ""
        note = (e.get("extra") or {}).get("owner_note")
        needs = f'<div class="needs">✋ {E(note)}</div>' if note and e.get("needs_review") else ""
        link = f' · <a href="{E(e["url"])}" target="_blank">open in Slack</a>' if str(e.get("url") or "").startswith("http") else ""
        outcome = "waiting for you" if e["open"] else ("handled" if e.get("outcome") == "pending_approval" else e.get("outcome", ""))
        return (f'<div class="card {"open" if e["open"] else ""}"><div class="top"><span class="kind">{KIND_LABEL.get(e["kind"], e["kind"])}</span>'
                f'<span class="muted">{_local(e["at"], tz)}</span><span class="badge {E(outcome.replace(" ", "-"))}">{E(outcome)}</span></div>'
                f'<div class="sum">{E(e["summary"])}</div>'
                f'<div class="meta">Asked by {E(e.get("who_asked") or "the Peer itself")} · {E(e.get("where") or "-")}{link}</div>'
                f'{question}{needs}{said}{("<ul class=srcs>" + srcs + "</ul>") if srcs else ""}</div>')

    chips = "".join(f'<a href="?f={k}{"&dry=1" if dry else ""}" class="{"on" if k == f else ""}">{E(v[0])}</a>' for k, v in FILTERS.items() if k != "review")
    body = (f'<div class="label">Activity</div><h1>Everything your Peer did.</h1><p class="lead">Each action: who asked, what it said or did, '
            f'its sources and the outcome. Items that need you come first. <a href="?all=1">Show background events too</a>.'
            + (' <span class="pill amber">Dry-run walks (fake Slack)</span>' if dry else '') + '</p>')
    body += '<h2>Needs your review</h2>' + ("".join(card(e) for e in review) or '<div class="card muted">Nothing waits on you.</div>')
    body += f'<h2>History</h2><div class="filters">{chips}</div>' + ("".join(card(e) for e in rest) or '<div class="card muted">Nothing here yet.</div>')
    return page("Activity", f"<style>{ACT_CSS}</style>" + body, active="/activity", refresh=20)
