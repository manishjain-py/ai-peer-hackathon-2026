"""WP3 (S2): the brief page (/brief) in the concept film's look: "Good morning, Manish." and short
numbered cards, each with why it matters and one action. The page's buttons run the same code as
the Slack buttons (brief.do_action): a reply is drafted or an invite accepted only on a tap, a
send asks again, and the google adapter's hard block keeps every act on seeded test items until
the owner lifts it. A test owner's dry-run brief: /brief?dry=1.
"""
from __future__ import annotations

import html
import json
import threading
from datetime import datetime
from types import SimpleNamespace
from zoneinfo import ZoneInfo

import yaml
from fastapi import Body
from fastapi.responses import HTMLResponse, JSONResponse

from .. import brief as B
from ..activity import ActivityLog
from ..settings import DEFAULTS_FILE, get_settings
from ..store import Store
from .app import FILTERS, KIND_LABEL, app
from .layout import NAV, icon, page, peer_mark

E = html.escape
NAV.insert(0, ("/brief", "Your brief", "home"))
KIND_LABEL.update({"brief_sent": "Sent your brief", "email_drafted": "Drafted an email", "email_sent": "Sent after your OK",
                   "invite_accepted": "Accepted after your OK", "blocked": "Blocked (test guard)"})
FILTERS["brief"] = ("Brief, mail and invites", {"brief_sent", "email_drafted", "email_sent", "invite_accepted", "blocked"})

CSS = """
.bf-top{display:flex;justify-content:space-between;align-items:center;gap:12px;border-bottom:1px solid var(--line);padding-bottom:15px;
margin-bottom:24px;color:var(--muted);font-size:14px;flex-wrap:wrap}
.bf-top span{display:inline-flex;align-items:center;gap:8px}.bf-top b{color:var(--ink)}
.bf-head{display:flex;justify-content:space-between;align-items:center;gap:16px;flex-wrap:wrap}
.bf-head h1{font-size:42px;letter-spacing:-1.7px;margin:0;font-weight:800}
.gdot{width:7px;height:7px;border-radius:4px;background:#6d9866;display:inline-block}
.bf-lead{color:var(--muted);font-size:19px;margin:8px 0 6px}
.bf-tools{display:flex;gap:12px;align-items:center;flex-wrap:wrap;margin:14px 0 4px}
.bf-sec h2{display:flex;align-items:center;gap:9px}
.bf-sec h2 i{width:8px;height:8px;border-radius:5px;background:var(--ac)}
.bf-card{display:flex;gap:18px;align-items:flex-start;background:#fff;border:1px solid var(--cardline);border-radius:19px;
padding:18px 22px;margin:0 0 12px;box-shadow:0 4px 13px #203c2510}
.bf-num{width:46px;height:46px;border-radius:15px;display:flex;align-items:center;justify-content:center;font-weight:800;
font-size:19px;flex-shrink:0;color:var(--ac);background:var(--pl)}
.bf-body{flex:1;min-width:0}
.bf-cat{font-size:13px;font-weight:750;margin-bottom:3px;color:var(--ac)}
.bf-title{font-size:20px;font-weight:750;letter-spacing:-.45px;line-height:1.3}
.bf-title a{color:var(--ink);text-decoration:none}.bf-title a:hover{text-decoration:underline}
.bf-why{color:#53665d;margin-top:7px;font-size:15px;line-height:1.5}
.bf-why b{color:var(--green);font-size:11px;letter-spacing:1.4px;text-transform:uppercase;margin-right:7px;font-weight:800}
.bf-act{flex-shrink:0;text-align:right;min-width:150px;display:flex;flex-direction:column;gap:8px;align-items:flex-end}
.bf-pill{display:inline-flex;align-items:center;gap:8px;padding:10px 15px;border-radius:12px;font:inherit;font-weight:700;font-size:14px;
border:0;cursor:pointer;text-decoration:none;color:var(--ac);background:var(--pl)}
.bf-pill.solid{background:var(--green);color:#fff}.bf-pill.plain{background:#eef1e9;color:var(--muted)}
.bf-pill:disabled{opacity:.6;cursor:default}
.bf-state{margin-top:10px;font-size:14px;font-weight:650;color:var(--green)}.bf-state.warn{color:var(--amber)}
.bf-draft{margin-top:10px;background:#f4f7f1;border:1px solid #dfe8dc;border-radius:12px;padding:12px 14px;white-space:pre-wrap;
font-size:14px;color:#2d4339}
.bf-note{margin-top:8px;font-size:13px;color:var(--amber)}
.bf-left{margin-top:8px;font-size:14px;color:var(--muted)}.bf-left li{margin:3px 0}
.bf-foot{margin-top:30px;display:flex;align-items:center;gap:11px;color:var(--muted);font-size:15px;flex-wrap:wrap}
.acc-green{--ac:#167353;--pl:#e2f0df}.acc-blue{--ac:#2b62c9;--pl:#e7effc}.acc-plum{--ac:#7a3f7c;--pl:#f3e8f3}
.acc-amber{--ac:#876626;--pl:#fff3dc}
@media (max-width:820px){.bf-card{flex-wrap:wrap}.bf-act{align-items:flex-start;min-width:0}}
"""

JS = """
async function bfAct(brief, item, action, btn){
  if(action==='send_email' && !confirm('Send this reply from your Gmail?')) return;
  btn.disabled=true; btn.textContent='Working…';
  const r=await fetch('/api/brief/act',{method:'POST',headers:{'Content-Type':'application/json'},
    body:JSON.stringify({brief:brief,item:item,action:action})});
  await r.json(); location.reload();
}
async function bfNow(dry){
  const b=document.getElementById('bfnow'); b.disabled=true; b.textContent='Building your brief (about a minute)…';
  const before=(await (await fetch('/api/brief/latest?dry='+dry)).json()).id;
  await fetch('/api/brief/now?dry='+dry,{method:'POST'});
  for(let i=0;i<120;i++){await new Promise(r=>setTimeout(r,3000));
    const d=await (await fetch('/api/brief/latest?dry='+dry)).json(); if(d.id&&d.id!==before){location.reload();return;}}
  b.textContent='Still working; refresh in a minute';
}
"""

STATE = {"drafted": ("Draft saved in your Gmail drafts. Check it, then send.", ""),
         "sent": ("✓ Sent from your Gmail after your OK", ""), "discarded": ("Draft discarded", ""),
         "accepted": ("✓ Accepted; the organizer gets your reply", ""),
         "blocked": ("Not done: the test guard allows this only on seeded test items", "warn"),
         "failed": ("That didn't work", "warn")}


def _card(b: dict, it: dict, n: int, accent: str) -> str:
    u = it.get("url") or ""
    title = f'<a href="{E(u)}" target="_blank">{E(it["title"])}</a>' if u.startswith("http") else E(it["title"])
    s = it.get("state") or {}
    acts: list[str] = []
    kind = it["action"]["kind"]
    if s.get("status") == "drafted":
        acts.append(f'<button class="bf-pill solid" onclick="bfAct(\'{b["id"]}\',\'{it["id"]}\',\'send_email\',this)">Send email {icon("arrow", 16)}</button>')
        acts.append(f'<button class="bf-pill plain" onclick="bfAct(\'{b["id"]}\',\'{it["id"]}\',\'discard_draft\',this)">Discard</button>')
    elif kind in B.BUTTONS and not s.get("status") in ("sent", "accepted", "discarded", "blocked"):
        label = B.BUTTONS[kind][1]
        acts.append(f'<button class="bf-pill" onclick="bfAct(\'{b["id"]}\',\'{it["id"]}\',\'{kind}\',this)">{E(label)} {icon("arrow", 16)}</button>')
    if u.startswith("http") and (kind == "open" or s.get("status")):
        acts.append(f'<a class="bf-pill {"plain" if kind != "open" else ""}" href="{E(u)}" target="_blank">Open {icon("arrow", 16)}</a>')
    extra = ""
    if s.get("status"):
        text, cls = STATE.get(s["status"], (s["status"], ""))
        if s["status"] == "failed" and s.get("why"):
            text += f": {s['why'][:120]}"
        extra += f'<div class="bf-state {cls}">{E(text)}</div>'
        if s.get("body") and s["status"] in ("drafted", "sent"):
            extra += f'<div class="bf-draft">{E(s["body"])}</div>'
        if s.get("note") and s["status"] == "drafted":
            extra += f'<div class="bf-note">Before sending: {E(s["note"])}</div>'
    return (f'<div class="bf-card acc-{accent}" id="it-{E(it["id"])}"><div class="bf-num">{n}</div><div class="bf-body">'
            f'<div class="bf-cat">{E(it["category"])}</div><div class="bf-title">{title}</div>'
            f'<div class="bf-why"><b>Why it matters</b>{E(it["why"])}</div>{extra}</div>'
            f'<div class="bf-act">{"".join(acts)}</div></div>')


@app.get("/brief", response_class=HTMLResponse)
def brief_page(dry: int = 0, id: str = ""):   # noqa: A002  (?id=<brief id>: an earlier brief)
    st = get_settings()
    p = B.profile(st)
    tz = p.get("tz", "UTC")
    now = datetime.now(ZoneInfo(tz))
    b = B.load_brief(st, id or None, dry=bool(dry)) if not id or id.startswith("b") and id[1:].replace("T", "").replace("Z", "").isdigit() else None
    top = (f'<div class="bf-top"><span>{icon("home", 18)} Your space <span style="color:#b4bfb5">/</span> <b>For you</b></span>'
           f'<span>{icon("clock", 18)} {now.strftime("%-I:%M %p")} · {E(p.get("location", tz))}</span></div>')
    now_btn = f'<button class="btn ghost" id="bfnow" onclick="bfNow({int(bool(dry))})">Brief me now</button>'
    if not b:
        first = p.get("preferred_name") or p["name"].split()[0]
        body = (top + f'<div class="bf-head"><h1>{E(B.greeting(now, first))}</h1></div>'
                '<p class="bf-lead">No brief yet. It comes every working morning, and whenever you say <b>brief me</b> in Slack.</p>'
                f'<div class="bf-tools">{now_btn}</div>')
        return page("Your brief", f"<style>{CSS}</style>{body}", active="/brief", script=JS)
    built = datetime.fromisoformat(b["at"]).astimezone(ZoneInfo(tz)).strftime("%-I:%M %p, %a %-d %b")
    head = (top + f'<div class="bf-head"><h1>{E(b["greeting"])}</h1><span class="pill"><i class="gdot"></i> New since your last check</span></div>'
            f'<p class="bf-lead">{E(b["headline"])}</p>'
            f'<div class="bf-tools">{now_btn}<span class="muted small">Built {E(built)} · from Gmail, Calendar, GitHub and Slack'
            f'{" · dry run" if b.get("dry") else ""}</span></div>')
    parts, n = [head], 0
    for sec in b["sections"]:
        if not sec["items"]:
            continue
        cards = []
        for it in sec["items"]:
            n += 1
            cards.append(_card(b, it, n, sec["accent"]))
        parts.append(f'<div class="bf-sec acc-{sec["accent"]}"><h2><i></i>{E(sec["title"])}</h2>{"".join(cards)}</div>')
    if n == 0:
        parts.append('<div class="card">Nothing needs you right now. I\'ll tell you at once if something urgent comes in.</div>')
    if b.get("left_out"):
        lis = "".join(f'<li><b>{E(x["title"])}</b>: {E(x["reason"])}</li>' for x in b["left_out"][:6])
        parts.append(f'<h2>Left out</h2><ul class="bf-left">{lis}</ul>')
    hidden = (b.get("counts") or {}).get("hidden_real")
    note = (f'<span class="small">Seeded-only view: {hidden} real Google items counted, not shown.</span>'
            if b.get("seeded_only") and hidden else "")
    parts.append(f'<div class="bf-foot">{peer_mark(28)}<span>Your priorities. Your choice. I draft or accept only when you tap; '
                 f'sending asks again.</span>{note}</div>')
    return page("Your brief", f"<style>{CSS}</style>" + "".join(parts), active="/brief", script=JS)


def _live_owner(st) -> bool:
    return st.owner == yaml.safe_load(DEFAULTS_FILE.read_text())["owner"]["id"]


@app.post("/api/brief/act")
def brief_act(d: dict = Body(...)):   # a plain def: FastAPI runs it in a worker thread (a draft takes about a minute)
    st = get_settings()
    b = B.load_brief(st, d.get("brief"))
    chat = None
    if b and b.get("dm") and not b.get("dry") and _live_owner(st):   # keep the DM in step (Web API only)
        try:
            from ..adapters.slack import SlackAdapter
            chat = SlackAdapter()
        except Exception:  # noqa: BLE001
            chat = None
    who = B.profile(st).get("preferred_name") or "the owner"
    r = B.do_action(st, d.get("brief", ""), d.get("item", ""), d.get("action", ""), chat=chat, who=who, via="page")
    return JSONResponse({k: v for k, v in r.items() if k != "item"} | {"state": (r.get("item") or {}).get("state")})


@app.post("/api/brief/now")
def brief_now(dry: int = 0):
    st = get_settings()
    db, logp = B._paths(st, bool(dry))
    p = B.profile(st)
    ctx = SimpleNamespace(st=st, store=Store(db), activity=ActivityLog(logp), dry_run=bool(dry), chat=None, owner_chat_id=None,
                          owner={"first": p.get("preferred_name") or p["name"].split()[0], "name": p["name"]})
    threading.Thread(target=lambda: B.run_brief(ctx, why="page", post=False), daemon=True, name="brief-now").start()
    return JSONResponse({"started": True})


@app.get("/api/brief/latest")
def brief_latest(dry: int = 0):
    b = B.load_brief(get_settings(), dry=bool(dry))
    return JSONResponse({"id": (b or {}).get("id"), "headline": (b or {}).get("headline")})
