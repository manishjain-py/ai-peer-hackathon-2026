// Draft 3's product screens (DESIGN V19), drawn by code with the made-up data of screens.json:
// a Zoom meeting at night, a Slack reply, one change from across the company, and the morning
// brief on Ram's phone. The public film shows these where the private film shows the real
// recordings (product.js). Every frame is a pure function of the film time: no timer, no state.
// The Peer's face is one picture (screens.json "peer_face"), so a new face drops in everywhere.
import { el, show, ramp, ease, lerp, clamp, keyframes, envelope, px } from "../lib.js";
import { markSvg } from "../mark.js";
import {buildTag} from "../mascot/tag/mascot.js";
import {filmActing} from "../mascot/tag/acting.js";

let sparkles = 0;   // counts the sparkle icons made, at build time only (never per frame)
const ICON = {
  shield: '<svg viewBox="0 0 24 24" width="16" height="16"><path d="M12 2l8 3v6c0 5-3.4 9.4-8 11-4.6-1.6-8-6-8-11V5z" fill="#2fbf5b"/><path d="M8 12l3 3 5-6" fill="none" stroke="#fff" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  // a new gradient id at each use: the push-in draws a second Zoom window, and a gradient whose
  // first copy sits in a hidden scene would leave this icon blank
  get sparkle() {
    const id = `zsg${++sparkles}`;
    return `<svg viewBox="0 0 24 24" width="18" height="18"><defs><linearGradient id="${id}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8fb8ff"/><stop offset="1" stop-color="#b98cff"/></linearGradient></defs><path d="M12 1.5c.7 5.3 2.9 7.8 9 8.9-6.1 1.1-8.3 3.6-9 9.1-.7-5.5-2.9-8-9-9.1 6.1-1.1 8.3-3.6 9-8.9z" fill="url(#${id})"/></svg>`;
  },
  grid: '<svg viewBox="0 0 24 24" width="16" height="16" fill="#d9d9d9"><rect x="3" y="3" width="8" height="8" rx="1.5"/><rect x="13" y="3" width="8" height="8" rx="1.5"/><rect x="3" y="13" width="8" height="8" rx="1.5"/><rect x="13" y="13" width="8" height="8" rx="1.5"/></svg>',
  mic: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#e8e8e8" stroke-width="1.8" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>',
  micOff: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#ff5b5b" stroke-width="2.2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21M4 4l16 16"/></svg>',
  micOn: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="#ffffff" stroke-width="2.2" stroke-linecap="round"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21"/></svg>',
  video: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#e8e8e8" stroke-width="1.8" stroke-linejoin="round"><rect x="3" y="6" width="12" height="12" rx="2.5"/><path d="M15 10.5l6-3.5v10l-6-3.5z"/></svg>',
  people: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#e8e8e8" stroke-width="1.8"><circle cx="9" cy="8" r="3.5"/><path d="M2.5 20c.6-3.7 3.2-6 6.5-6s5.9 2.3 6.5 6"/><circle cx="17" cy="9" r="2.6"/><path d="M16.5 14c2.6.2 4.4 2.2 5 5"/></svg>',
  chat: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#e8e8e8" stroke-width="1.8" stroke-linejoin="round"><path d="M4 5h16v11H9l-5 4z"/></svg>',
  share: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="13" rx="2.5"/><path d="M12 15V9M9 11.5L12 8.5l3 3"/></svg>',
  rec: '<svg viewBox="0 0 24 24" width="22" height="22"><circle cx="12" cy="12" r="8" fill="none" stroke="#e8e8e8" stroke-width="1.8"/><circle cx="12" cy="12" r="3.6" fill="#e8e8e8"/></svg>',
  smile: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="#e8e8e8" stroke-width="1.8" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M8.5 14.5c1.9 2 5.1 2 7 0M9 9.5h.01M15 9.5h.01"/></svg>',
  link: '<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="#1264a3" stroke-width="2" stroke-linecap="round"><path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1"/></svg>',
  hash: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"><path d="M9 3L7 21M17 3l-2 18M4 8.5h17M3 15.5h17"/></svg>',
};
const SOURCE = { Code: "#6e5bd6", Ticket: "#2f7fd8", Post: "#d0476f", Config: "#c27a12", Doc: "#18936b" };

const fmt = (n) => n.toLocaleString("en-US");

/** A round picture (a face), as a div with a background image. */
function pic(src, size, cls = "spic") {
  const n = el(`div.${cls}`);
  Object.assign(n.style, { width: px(size), height: px(size), backgroundImage: `url("${src}")` });
  return n;
}

/** The spoken lines of the film by id (start and word timings come from the build). */
function linesById(film) {
  const m = {};
  for (const l of film.lines) m[l.id] = l;
  return m;
}

/** 0..1: how much a line is speaking at film time t, from its word timings (a soft gate). */
function speaking(line, t) {
  if (!line) return 0;
  const k = t - line.start;
  if (k < -0.1 || k > line.seconds + 0.15) return 0;
  let best = 0;
  for (const w of line.words || []) {
    const d = k < w.s ? w.s - k : k > w.e ? k - w.e : 0;
    best = Math.max(best, 1 - clamp(d / 0.12));
  }
  return best;
}

/** The words of a line said by film time t, for live captions. */
function wordsSaid(line, t) {
  const k = t - line.start;
  return (line.words || []).filter((w) => w.s <= k + 0.04).map((w) => w.w).join(" ");
}

// ---- 1. Zoom: a gallery of four, the Peer as a labelled AI tile, live captions ------------------
function zoom(S, film, slot, opts = {}) {
  const L = linesById(film);
  const peerName = (film.names && film.names.peer) || "AI Peer";
  const node = el("div.zoom");
  const aiChip = el("span.zai", {}, el("span", { html: ICON.sparkle }), el("span.zaitxt", { text: "AI Companion · 1 AI agent" }));
  const top = el("div.ztop", {}, el("span.zshield", { html: ICON.shield }), el("span.ztopic", { text: S.topic }), el("span.zgap"), aiChip,
    el("span.zview", { html: `${ICON.grid}<span>View</span>` }));
  const W = slot.window;
  const topH = 40, barH = 74, gap = 8;
  const th = Math.floor((W.h - topH - barH - gap * 3) / 2), tw = Math.round(th * 16 / 9);
  const left = Math.round((W.w - tw * 2 - gap) / 2);
  const tiles = [];
  S.tiles.forEach((id, i) => {
    const x = left + (i % 2) * (tw + gap), y = topH + gap + Math.floor(i / 2) * (th + gap);
    let tile;
    if (id === "peer") {
      const rings = [0, 1, 2].map(() => el("div.zring"));
      const f = document.createElementNS("http://www.w3.org/2000/svg","svg");
      f.setAttribute("width",tw);f.setAttribute("height",th);f.setAttribute("viewBox",`0 0 ${tw} ${th}`);
      Object.assign(f.style,{position:"absolute",left:`${64-tw/2}px`,top:`${64-th*.45}px`,overflow:"visible"});
      const moss=buildTag(f,{height:220});
      tile = el("div.ztile.zpeer", {}, el("div.zpglow"), el("div.zpc", {}, rings, f),
        el("div.zname", {}, el("span", { html: ICON.micOn }), el("span", { text: peerName }), el("b.zaib", { text: "AI" })));
      tiles.push({ id, tile, rings, f, moss });
    } else {
      const p = S.people[id];
      const img = el("div.zimg", { style: { backgroundImage: `url("${p.tile}")` } });
      // the person's clips over the still while each plays (listening loops and a lip-synced line,
      // each starting on the still's own frame); the push-in's copy of this window goes without them
      const clips = opts.copy ? [] : (S.clips || []).filter((c) => c.who === id);
      const hosts = clips.map((c) => {
        const host = document.getElementById("host-" + c.video);
        if (!host) throw new Error(`no video ${c.video} on the page`);
        img.append(host);
        return host;
      });
      const mic = el("span", { html: ICON.micOff });
      tile = el("div.ztile", {}, img, el("div.zname", {}, mic, el("span", { text: p.name })));
      tiles.push({ id, tile, img, mic, i, clips, hosts });
    }
    Object.assign(tile.style, { left: px(x), top: px(y), width: px(tw), height: px(th) });
    tile.append(el("div.zactive"));
  });
  const toast = el("div.ztoast", {}, pic(S.peer_face, 30, "zface"), el("span", { html: `<b>${peerName}</b> joined · an AI, here for Ram` }));
  const capWho = el("b"), capText = el("span");
  const cap = el("div.zcap", {}, capWho, capText);
  const btn = (icon, label, cls = "") => el(`div.zbtn${cls}`, {}, el("span", { html: icon }), el("span", { text: label }));
  const bar = el("div.zbar", {}, btn(ICON.mic, "Mute"), btn(ICON.video, "Stop Video"), el("span.zgap"),
    btn(ICON.people, "Participants"), btn(ICON.chat, "Chat"), btn(ICON.share, "Share", ".zgreen"), btn(ICON.rec, "Record"),
    btn(ICON.sparkle, "AI Companion"), btn(ICON.smile, "Reactions"), el("span.zgap"), el("div.zend", { text: "End" }));
  node.append(top, ...tiles.map((t) => t.tile), toast, cap, bar);

  const lineIds = Object.keys(S.speakers);
  function render(local, t) {
    for (const T of tiles) {
      const on = lineIds.filter((id) => S.speakers[id] === T.id).reduce((m, id) => Math.max(m, speaking(L[id], t)), 0);
      const lit = lineIds.filter((id) => S.speakers[id] === T.id).some((id) => L[id] && t >= L[id].start - 0.15 && t <= L[id].start + L[id].seconds + 0.5);
      T.tile.lastChild.style.opacity = lit ? 1 : 0;
      if (T.id === "peer") {
        T.tile.style.opacity = ease.out(ramp(local, S.join_at, S.join_at + 0.5));
        T.rings.forEach((r, i) => {
          const k = clamp(on * (1.1 - i * 0.2) + 0.05 * (0.5 + 0.5 * Math.sin(local * 1.7 + i)));
          r.style.transform = `scale(${1 + (0.28 + i * 0.26) * k + i * 0.14})`;
          r.style.opacity = (0.14 + 0.55 * k) * (1 - i * 0.25);
        });
        const line = ['m1','m2','m4b'].map(id=>L[id]).find(l=>l&&t>=l.start&&t<l.start+l.seconds);
        const act = line ? {action:'speak-'+line.id,actionTime:t-line.start+.3} : filmActing(t+2.8);
        T.moss.draw({x:tw/2,y:th-82,s:1,label:false,...act});
      } else {
        const s = 1.035 + 0.012 * Math.sin(local * 0.31 + T.i * 1.9);
        T.img.style.transform = `scale(${s.toFixed(4)}) translate(${(3 * Math.sin(local * 0.23 + T.i)).toFixed(2)}px, ${(2 * Math.cos(local * 0.19 + T.i * 2)).toFixed(2)}px)`;
        T.mic.innerHTML = lit ? ICON.micOn : ICON.micOff;
        T.clips.forEach((c, ci) => {
          const v = envelope(t, c.start, c.start + c.length, 0.12, 0.3, ease.inOut, ease.inOut);
          show(T.hosts[ci], v > 0);
          T.hosts[ci].style.opacity = v.toFixed(3);
        });
      }
    }
    const tv = envelope(local, S.join_at, S.join_at + 4.4, 0.35, 0.4);
    toast.style.opacity = tv;
    toast.style.transform = `translate(-50%, ${lerp(-14, 0, ease.out(ramp(local, S.join_at, S.join_at + 0.4)))}px)`;
    aiChip.style.opacity = local >= S.join_at ? 1 : 0.35;
    // live captions: the line being said, word by word, held a moment after it ends
    const cur = lineIds.map((id) => L[id]).filter(Boolean).find((l) => t >= l.start - 0.05 && t < l.start + l.seconds + 0.7);
    show(cap, !!cur);
    if (cur) {
      const who = S.speakers[cur.id];
      capWho.textContent = (who === "peer" ? peerName : S.people[who].name) + ": ";
      capText.textContent = wordsSaid(cur, t);
    }
  }
  return { node, render };
}

// ---- 2. Slack: the question at 4 AM, the Peer's reply with sources and no promise ---------------
function slack(S,film,slot){
 const peerName=film.names.peer;
 const node=el('div.slack',{style:{background:'#fff'}});
 const css=el('style',{text:`.mv3-side{position:absolute;left:0;top:70px;bottom:0;width:300px;background:#3d173f;color:#e7dfe8;padding:30px;font:24px Manrope}.mv3-side b{font-size:32px}.mv3-side p{padding:9px 0;margin:8px 0}.mv3-thread{position:absolute;left:370px;top:80px;width:1450px;transform-origin:700px 510px}.mv3-q{position:absolute;left:15px;top:140px;width:1390px}.mv3-name{font:700 25px Manrope;color:#1f2327;display:flex;gap:16px;align-items:center}.mv3-name small{font:500 20px Manrope;color:#737b80}.mv3-bubble{font:500 33px/1.35 Manrope;color:#22282a;padding:15px 0}.mv3-q .mv3-bubble{max-width:1190px}.mv3-reply{position:absolute;left:15px;top:370px;width:1390px;padding:24px 28px 27px;border:2px solid #c3d9cb;border-radius:20px;background:#f5faf6;box-shadow:0 12px 34px #204a3512}.mv3-reply .mv3-bubble{font-size:42px;line-height:1.35}.mv3-reply strong{font-weight:750;color:#154c37}.mv3-sources{font:600 25px Manrope;color:#247053;margin:16px 0}.mv3-boundary{font:600 29px Manrope;color:#625431;border-top:1px solid #d4dfd5;padding-top:16px}.mv3-app{background:#e2e5e3;color:#424b46;font:700 17px Manrope;padding:3px 7px;border-radius:5px}.mv3-compose{position:absolute;left:390px;right:70px;bottom:240px;border:2px solid #b9bfc3;border-radius:13px;padding:19px 24px;height:90px;font:25px Manrope;color:#333b3e;background:#fff}.mv3-send{position:absolute;right:20px;top:17px;background:#16704b;color:white;padding:12px 20px;border-radius:10px;font:700 23px Manrope}.mv3-status{position:absolute;left:390px;bottom:350px;font:600 24px Manrope;color:#44624e}.mv3-await{font:600 23px Manrope;color:#997030}.mv3-tag{color:#13699c;background:#e3f1fb;border-radius:5px;padding:1px 5px}.mv3-seen{font:500 19px Manrope;color:#777f7a;margin-top:13px}`});
 const side=el('div.mv3-side',{html:`<b>Workspace</b><p>⌂ Home</p><p>Threads</p><p>Channels</p><p style="background:#704275;border-radius:8px"># host-payouts</p><p># payments-eng</p><p># launch-brazil</p><p style="margin-top:50px">Direct messages</p><p>Daniel</p><p>Amara</p>`});
 const top=el('div',{text:'⌕  Search workspace',style:{position:'absolute',left:'0',top:'0',width:'1920px',height:'70px',background:'#2c102d',color:'#ece6ed',font:'500 24px Manrope',padding:'17px 410px'}});
 const q=el('div.mv3-q',{},el('div.mv3-name',{html:'Daniel <small>4:02 AM</small>'}),el('div.mv3-bubble',{html:'<span class="mv3-tag">@Ram</span> did the retry logic cause Tuesday’s failed payouts in Brazil?'}));
 const waiting=el('div.mv3-await',{text:'Ram is away · waiting for a reply'});q.append(waiting);
 const reply=el('div.mv3-reply',{},el('div.mv3-name',{},pic(S.peer_face,43,'sav'),el('b',{text:peerName}),el('span.mv3-app',{text:'AI'}),el('small',{text:'4:03 AM · answering while Ram sleeps'})),el('div.mv3-bubble',{html:'<strong>It was a partner bank outage, not retry logic.</strong><br>Retries recovered <strong>92%</strong> of the payouts within 6 hours.'}),el('div.mv3-sources',{text:'↗ INC-20431 · Brazil bank outage     ↗ Payout retries dashboard'}),el('div.mv3-boundary',{text:'Changing retry limits is Ram’s call. Added to his morning brief.'}),el('div.mv3-seen',{text:'AI-generated reply · sources included'}));
 const thread=el('div.mv3-thread',{},el('div',{text:'# host-payouts',style:{font:'700 34px Manrope',borderBottom:'2px solid #ececec',padding:'20px 0'}}),q,reply);
 const typed=el('span'),send=el('span.mv3-send',{text:'Send ↑'}),compose=el('div.mv3-compose',{},typed,send),status=el('div.mv3-status');
 const svg=document.createElementNS('http://www.w3.org/2000/svg','svg');svg.setAttribute('viewBox','0 0 1920 1080');Object.assign(svg.style,{position:'absolute',inset:'0',width:'1920px',height:'1080px',pointerEvents:'none'});const moss=buildTag(svg,{height:270});
 node.append(css,top,side,thread,status,compose,svg);
 return{node,render(u,t){const intro=ease.inOut(ramp(u,.35,1.15)),read=ease.inOut(ramp(u,1.4,2.1)),sent=ease.out(ramp(u,4.3,4.55)),close=ease.inOut(ramp(u,4.55,5.2));
  q.style.opacity=ease.out(ramp(u,.5,.8));waiting.style.opacity=ease.out(ramp(u,.8,1.2))*(1-sent);
  thread.style.transform=`translate(${lerp(0,-95,close)}px,${lerp(0,-145,close)}px) scale(${lerp(1,1.05,close)})`;
  side.style.opacity=1-close*.6;q.style.opacity*=1-close;reply.style.opacity=sent;reply.style.transform=`translateY(${(1-sent)*18}px)`;
  compose.style.opacity=1-close;status.style.opacity=1-close;status.textContent=u<2.1?'Reading Daniel’s question…':u<3?'Checking the sources…':'Ram’s AI Peer is typing…';status.style.display=u<1.4?'none':'';
  const draft='It was a partner bank outage, not retry logic.';typed.textContent=u<3?'Message #host-payouts':draft.slice(0,Math.floor(ramp(u,3,4.2)*draft.length));send.style.opacity=u<3?.3:1;
  const x=lerp(2020,1730,read),y=840;const a=(1-ease.inOut(ramp(u,4.3,4.8)))*read;
  moss.draw({x,y,s:1,alpha:a,shadow:.4,action:u<2.1?'listen':u<3?'attentive':'type',actionTime:u<2.1?1.2:u<3?2+(u-2.1):1.5+(u-3)*1.4});
 }};
}


// ---- 3. The change: the night's flood of changes, the one that touches Ram, and why -------------
function change(S, film, slot) {
  const peerName = (film.names && film.names.peer) || "AI Peer";
  const node = el("div.chg");
  const ROW = 62, N = S.feed.length, target = 2 * N + S.the_one;
  const rows = [];
  for (let k = 0; k < 3 * N + 4; k++) {
    const [src, team, title, time] = S.feed[k % N];
    const r = el("div.chrow", {}, el("span.chsrc", { text: src, style: { background: SOURCE[src] || "#557" } }),
      el("span.chteam", { text: team }), el("span.chtitle", { text: title }), el("span.chtime", { text: time }));
    r.style.top = px(k * ROW);
    rows.push(r);
  }
  const counter = el("span.chnum");
  const listRows = el("div.chrows", {}, rows);
  const listWrap = el("div.chlist", {}, listRows, el("div.chfade.top"), el("div.chfade.bot"));
  const leftNote = el("div.chleft", { text: S.message.left_out });
  const leftPane = el("div.chl", {}, el("div.chhead", {}, pic(S.peer_face, 34, "chface"), el("div", {},
    el("div.chh1", { text: "Across the company tonight" }), el("div.chh2", {}, counter, el("span", { text: ` changes heard by ${peerName}` })))), listWrap, leftNote);
  const M = S.message;
  const why = el("div.chwhy", {}, el("b", { text: "Why it matters" }), el("span", { text: M.why }));
  const card = el("div.chcard", {}, el("div.chcardh", {}, pic(S.peer_face, 40, "chface"), el("div", {}, el("b", { text: peerName }),
    el("span.chto", { text: ` to Ram · ${M.time}` }))), el("div.chct", { text: M.title }), el("div.chcb", { text: M.body }), why,
    el("div.chnext", {}, el("b", { text: "Next step " }), el("span", { text: M.next })));
  node.append(leftPane, el("div.chr", {}, card));
  const boxes = { why, left: leftNote };
  const listH = 765 - 118 - 70;
  const D = target * ROW - (listH / 2 - ROW / 2);
  function render(local) {
    const k = ease.out(ramp(local, S.scroll[0], S.scroll[1]));
    listRows.style.transform = `translateY(${(-D * k).toFixed(1)}px)`;
    counter.textContent = fmt(Math.round(S.count * ease.out(ramp(local, S.scroll[0] - 0.3, S.scroll[1]))));
    const lock = ease.out(ramp(local, S.scroll[1] - 0.1, S.scroll[1] + 0.5));
    const dim = ease.inOut(ramp(local, S.scroll[1] + 0.3, S.scroll[1] + 1.3));
    rows.forEach((r, i) => {
      const one = i === target;
      r.classList.toggle("one", one && lock > 0.01);
      r.style.opacity = one ? 1 : (1 - 0.78 * dim).toFixed(3);
      if (one) r.style.boxShadow = `0 0 0 ${(3 * lock).toFixed(2)}px rgba(22,115,83,${lock.toFixed(3)}), 0 0 30px rgba(183,244,207,${(0.9 * lock).toFixed(3)})`;
    });
    const a = ease.out(ramp(local, M.at, M.at + 0.5));
    card.style.opacity = a;
    card.style.transform = `translateX(${lerp(40, 0, a).toFixed(1)}px)`;
    leftNote.style.opacity = ease.out(ramp(local, S.labels[1].at - 0.6, S.labels[1].at));
    for (const lab of S.labels) {
      const e = envelope(local, lab.at - 0.1, lab.at + lab.length, 0.35, 0.3);
      boxes[lab.box].style.boxShadow = `0 0 0 3px rgba(22,115,83,${(0.9 * e).toFixed(3)}), 0 0 26px rgba(183,244,207,${(0.8 * e).toFixed(3)})`;
    }
  }
  return { node, render };
}

// ---- 4. The morning brief on Ram's phone: what it did, what it learned, the one decision ---------
// The phone at 0.9 of its drawn size, centred at 41.1% of the frame's height (screens.css), in the
// room above a one-line caption (96 px up, 95 px tall): about 40 px clear above it and below it.
const PHONE = 0.9;
function brief(S, film, slot) {
  const peerName = (film.names && film.names.peer) || "AI Peer";
  const node = el("div.mbrief");
  let decision = null;
  const sections = S.sections.map((sec) => el(`div.bsec.acc-${sec.accent}`, {}, el("h2", {}, el("i"), el("span", { text: sec.title })),
    ...sec.cards.map((c, i) => {
      const card = el("div.bcard", {}, el("div.bcat", { text: c.cat }), el("div.btitle", { text: c.title }),
        el("div.bwhy", {}, el("b", { text: "Why it matters" }), el("span", { text: c.why })),
        ...(c.buttons ? [el("div.bacts", {}, ...c.buttons.map((b, j) => el(`span.bbtn${j === 0 ? ".solid" : ""}`, { text: b })))] : []));
      if (c.decision) decision = card;
      return card;
    })));
  const page = el("div.bpage", {}, el("div.bcrumb", { text: "Your space / For you" }), el("h1", { text: S.greeting }),
    el("span.bpill", {}, el("i"), el("span", { text: "New since last night" })), el("p.blead", { text: S.lead }), ...sections,
    el("div.bfoot", {}, el("span", { html: markSvg({ size: 30 }) }), el("span", { text: `Your priorities. Your choice. ${peerName} acts only when you tap.` })));
  const screen = el("div.pscreen", {}, el("div.pstatus", {}, el("b", { text: S.time }), el("span", { text: "▮▮▮ ◔" })), page);
  const phone = el("div.phone", {}, screen);
  node.append(el("div.mglow"), phone);
  function render(local) {
    const y = keyframes(S.scroll, local).y || 0;
    page.style.transform = `translateY(${(-y).toFixed(1)}px)`;
    const a = ease.out(ramp(local, 0, 0.45));
    phone.style.opacity = a;
    phone.style.transform = `translate(-50%, -50%) translateY(${lerp(30, 0, a).toFixed(1)}px) scale(${(PHONE * lerp(0.97, 1, a)).toFixed(4)})`;
    const e = envelope(local, S.highlight[0], S.highlight[1] + 1, 0.35, 0.3);
    if (decision) decision.style.boxShadow = `0 0 0 ${(3 * e).toFixed(2)}px rgba(22,115,83,${e.toFixed(3)}), 0 0 30px rgba(183,244,207,${(0.9 * e).toFixed(3)})`;
  }
  return { node, render, full: true };
}

const BUILD = { zoom, slack, change, brief };
const FULL = new Set(["brief"]);   // drawn over the whole frame, not in a window (or a screen's "full": true)

/** Waits for the pictures a node shows as backgrounds: nothing may load while frames are captured. */
function picturesReady(node) {
  return Promise.all([...node.querySelectorAll("*")].map((n) => n.style.backgroundImage).filter((b) => b && b.startsWith("url"))
    .map((b) => new Promise((ok) => { const i = new Image(); i.onload = i.onerror = ok; i.src = b.slice(5, -2); })));
}

/**
 * How dark a window is, by the slot's local time: 0.62 under its chapter card, lifting as the
 * card leaves. The window the push-in lands on arrives lit, so there the dark comes up with the
 * card; the push-in draws the same curve before the cut (at negative local times), so the two
 * scenes meet on the same frame.
 */
export function windowDim(S, local, landed) {
  const chapter = S.chapter ? S.chapter.length : 0;
  const under = chapter ? 0.62 * (1 - ease.inOut(ramp(local, chapter - 0.45, chapter))) : 0;
  return landed ? under * ease.inOut(ramp(local, -0.5, 0.4)) : under;
}

/**
 * The picture inside a screen's window: the screen drawn by code, under its slow camera. The
 * scene shows it in its window; the push-in shows a second one in the laptop's screen and lands
 * on it. render(t) takes the film time; before the slot starts it draws the slot's first moments
 * (nobody speaks yet, the Peer has not joined). opts.copy: a second copy, which leaves the
 * page's video clips to the scene itself (a clip's <video> can live in one place only).
 */
export async function windowContent(slot, film, opts = {}) {
  const S = slot.screen, W = slot.window;
  const built = BUILD[S.kind](S, film, slot, opts);
  const cam = el("div.scam", {}, built.node);
  Object.assign(cam.style, { width: px(W.w), height: px(W.h) });
  await picturesReady(cam);
  return {
    node: cam,
    render(t) {
      const local = t - slot.start;
      const c = keyframes(S.camera || [{ t: 0, s: 1, fx: 0.5, fy: 0.5 }], local);
      cam.style.transformOrigin = `${(c.fx * 100).toFixed(2)}% ${(c.fy * 100).toFixed(2)}%`;
      cam.style.transform = `scale(${c.s.toFixed(4)})`;
      built.render(local, t);
    },
  };
}

export async function create(slot, film) {
  const S = slot.screen;
  const W = slot.window;
  const start = slot.start, length = slot.length;
  // the big world of information (world.js, V20) loads only when a slot draws it
  if (S.kind === "world" && !BUILD.world) BUILD.world = (await import("./world.js")).world;
  if (FULL.has(S.kind) || S.full === true) {
    const built = BUILD[S.kind](S, film, slot);
    await picturesReady(built.node);
    const node = el(`div.scene.screens.${S.kind === "brief" ? "morning" : "full"}`, {}, built.node);
    return { el: node, render: (t) => built.render(t - start, t) };
  }
  const landed = !!slot.landed;
  const content = await windowContent(slot, film);
  const glowA = el("div.pglow.a"), glowB = el("div.pglow.b");
  const dim = el("div.pdim");
  const win = el("div.pwin.swin", {}, content.node, dim);
  Object.assign(win.style, { left: px(W.x), top: px(W.y), width: px(W.w), height: px(W.h) });
  const node = el("div.scene.product.screens", {}, glowA, glowB, win);
  function render(t) {
    const local = t - start;
    glowA.style.transform = `translate(${lerp(-60, 90, local / length)}px, ${lerp(0, 50, local / length)}px)`;
    glowB.style.transform = `translate(${lerp(40, -70, local / length)}px, ${lerp(20, -30, local / length)}px)`;
    const a = landed ? 1 : ease.out(ramp(local, 0, 0.5));
    const out = ease.in(ramp(local, length - 0.22, length));
    win.style.opacity = Math.min(a, 1 - out);
    win.style.transform = `translateY(${lerp(28, 0, a)}px) scale(${lerp(0.965, 1, a) + 0.012 * out})`;
    dim.style.opacity = windowDim(S, local, landed);
    content.render(t);
  }
  return { el: node, render };
}
