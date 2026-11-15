// The six source widgets on the desk, each a clean mini UI in its own hue: a company-portal
// people card, Documents, a Slack channel, a Code pull request, a Tickets board, a Mail inbox.
// Locked until the Peer opens it as Ram; Slack, Code and Tickets first need a one-time Connect.
import { el, prog, ease, spring, pulse, clamp } from "../shared/kit.js";
import { person, reads, sources, sourceById } from "../shared/data.js";
import { icons, sourceIcon } from "../shared/icons.js";
import { WIDS, WPOS, WW, WH, R, STAGE_IN, FOLD, ASK } from "./tl.js";

export const DEEP = { directory: "#8a7c5e", docs: "#3567c9", slack: "#7448d6", code: "#178f80", tickets: "#c27a12", mail: "#cf4560" };
export const TINT = { directory: "#f1ede2", docs: "#e3ecff", slack: "#efe6ff", code: "#dcf6f2", tickets: "#fff0d8", mail: "#ffe6ea" };
const NAME = { directory: ["Company portal", "People"], docs: ["Documents", "Shared with Ram"], slack: ["Slack", "Ram's channels"],
  code: ["Code", "Pull requests"], tickets: ["Tickets", "Board"], mail: ["Mail", "Inbox"] };

const CSS = `
.lpw { position: absolute; width: ${WW}px; height: ${WH}px; }
.lpw-shadow { position: absolute; width: ${WW - 60}px; height: 46px; border-radius: 50%; background: radial-gradient(closest-side, rgba(130,64,18,.30), rgba(130,64,18,.12) 60%, rgba(130,64,18,0)); }
.lpw-glow { position: absolute; inset: -7px; border-radius: 29px; opacity: 0; }
.lpw-card { position: absolute; inset: 0; border-radius: 22px; background: #fffdf9; overflow: hidden;
  box-shadow: inset 0 1px 0 rgba(255,255,255,.9), 0 0 0 1px rgba(150,110,70,.10), 0 24px 46px -18px rgba(130,70,25,.36), 0 6px 14px -6px rgba(130,70,25,.16); }
.lpw-head { position: absolute; left: 16px; top: 13px; display: flex; align-items: center; gap: 11px; }
.lpw-ic { width: 34px; height: 34px; border-radius: 11px; display: grid; place-items: center; }
.lpw-ic svg { width: 20px; height: 20px; }
.lpw-tt b { display: block; font: 750 19px/1.05 "Inter", sans-serif; color: #1f2329; letter-spacing: -0.01em; }
.lpw-tt small { display: block; margin-top: 3px; font: 600 13.5px/1 "Manrope", sans-serif; color: #9a8f80; }
.lpw-state { position: absolute; right: 14px; top: 15px; width: 160px; height: 32px; }
.lpw-pill { position: absolute; right: 0; top: 0; height: 31px; padding: 0 12px; border-radius: 16px; display: inline-flex; align-items: center;
  gap: 6px; font: 750 15px/1 "Manrope", sans-serif; white-space: nowrap; transform-origin: 100% 50%; }
.lpw-pill svg { width: 16px; height: 16px; }
.lpw-pill.lock { background: #f3ede4; color: #85776a; }
.lpw-pill.as { background: #dcf4e6; color: #10603f; box-shadow: 0 0 0 1.5px #bfe8d0; }
.lpw-connect { position: absolute; right: 0; top: -2px; height: 35px; padding: 0 17px; border-radius: 18px; color: #fff; white-space: nowrap;
  font: 750 16.5px/35px "Manrope", sans-serif; transform-origin: 50% 50%; }
.lpw-ripple { position: absolute; right: 34px; top: 1px; width: 30px; height: 30px; border-radius: 50%; border: 3px solid #167353; opacity: 0; }
.lpw-body { position: absolute; left: 16px; right: 16px; top: 60px; bottom: 40px; }
.lpw-veil { position: absolute; left: 16px; right: 16px; top: 66px; display: flex; flex-direction: column; gap: 14px; }
.lpw-veil i { display: block; height: 15px; border-radius: 8px; background: #f0e9df; }
.lpw-note { position: absolute; left: 16px; right: 16px; bottom: 48px; font: 700 15.5px/1.3 "Manrope", sans-serif; }
.lpw-foot { position: absolute; left: 0; right: 0; bottom: 0; height: 40px; padding: 0 16px; display: flex; align-items: center; gap: 9px;
  background: linear-gradient(#f1fbf5, #e5f6ec); border-top: 1px solid #d5eedf; font: 750 17px/1 "Manrope", sans-serif; color: #11603f; }
.lpw-foot i { width: 21px; height: 21px; border-radius: 50%; background: #1f8a5f; color: #fff; display: grid; place-items: center; flex: none; }
.lpw-foot i svg { width: 13px; height: 13px; }
.lpw-row { position: relative; z-index: 0; }
.lpw-hl { position: absolute; z-index: -1; left: -6px; top: -2px; bottom: -2px; width: 0; border-radius: 6px;
  background: linear-gradient(90deg, rgba(255,222,98,.9), rgba(255,236,150,.85)); }
.lpw-scan { position: absolute; left: 0; right: 0; top: 0; height: 70px; opacity: 0; }
.lpw-sheen { position: absolute; top: -40px; bottom: -40px; left: 0; width: 160px; opacity: 0; background: linear-gradient(100deg, rgba(255,255,255,0), rgba(255,255,255,.85) 50%, rgba(255,255,255,0)); }
.lpw-sheet { position: absolute; left: 20px; right: 20px; top: 60px; height: 124px; border-radius: 16px; background: #fff; padding: 15px 18px;
  box-shadow: 0 16px 34px -10px rgba(40,30,80,.4), 0 0 0 1px rgba(110,80,200,.16); opacity: 0; transform-origin: 50% 0; }
.lpw-sheet .sh-h { display: flex; align-items: center; gap: 12px; font: 750 20px/1.1 "Inter", sans-serif; color: #1b2027; }
.lpw-sheet .sh-av { width: 38px; height: 38px; border-radius: 50%; background: #dff5e8; color: #12563f; display: grid; place-items: center; font: 800 17px/1 "Inter", sans-serif; }
.lpw-sheet .sh-ok { margin-left: auto; width: 28px; height: 28px; border-radius: 50%; background: #1f8a5f; color: #fff; display: grid; place-items: center; }
.lpw-sheet .sh-ok svg { width: 17px; height: 17px; }
.lpw-sheet .sh-s { margin-top: 12px; font: 600 16.5px/1.35 "Manrope", sans-serif; color: #5d5750; }
/* contents */
.lpw-person { display: flex; gap: 15px; align-items: flex-start; padding-top: 8px; }
.lpw-av { width: 64px; height: 64px; flex: none; border-radius: 50%; background: linear-gradient(#e8f9ef, #c6eed7); color: #12563f;
  display: grid; place-items: center; font: 800 27px/1 "Inter", sans-serif; box-shadow: inset 0 0 0 3px #fff, 0 0 0 1px #cfe9da; }
.lpw-pinfo b { display: block; font: 800 23px/1.1 "Inter", sans-serif; color: #1b2027; }
.lpw-pinfo .lpw-row { display: inline-block; margin-top: 6px; font: 700 18.5px/1.25 "Inter", sans-serif; color: #1d6a4d; }
.lpw-pinfo span { display: block; margin-top: 6px; font: 500 16.5px/1.25 "Inter", sans-serif; color: #5f5a52; }
.lpw-doc { display: flex; gap: 10px; align-items: flex-start; padding: 5px 0 6px; border-bottom: 1px solid #f2ece3; }
.lpw-doc:last-child { border-bottom: 0; }
.lpw-dic { width: 24px; height: 26px; flex: none; color: #3567c9; margin-top: 1px; }
.lpw-dic svg { width: 22px; height: 22px; }
.lpw-doc .lpw-row { display: inline-block; font: 650 18px/1.2 "Inter", sans-serif; color: #1f2329; }
.lpw-doc small { display: block; margin-top: 3px; font: 500 15px/1.2 "Inter", sans-serif; color: #8b8378; }
.lpw-msg { display: flex; gap: 10px; padding: 2px 0 7px; }
.lpw-mav { width: 31px; height: 31px; flex: none; border-radius: 9px; color: #fff; font: 800 14px/31px "Inter", sans-serif; text-align: center; }
.lpw-mh b { font: 750 16.5px/1.2 "Inter", sans-serif; color: #1f2329; }
.lpw-mh small { margin-left: 7px; font: 600 13.5px/1 "Manrope", sans-serif; color: #9a8f80; }
.lpw-mt { margin-top: 2px; font: 500 17px/1.28 "Inter", sans-serif; color: #3c3833; }
.lpw-mt.clamp { display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
.lpw-pr { display: flex; align-items: center; gap: 9px; }
.lpw-pr .lpw-row { font: 650 18px/1.2 "Inter", sans-serif; color: #1f2329; }
.lpw-open { padding: 4px 9px; border-radius: 8px; background: #dcf6f1; color: #12806f; font: 750 13px/1 "Manrope", sans-serif; }
.lpw-sub { display: block; margin-top: 5px; font: 500 14.5px/1.2 "Inter", sans-serif; color: #8b8378; }
.lpw-diff { margin-top: 9px; border-radius: 10px; overflow: hidden; border: 1px solid #ece6dc; font: 500 14px/1.6 "JetBrains Mono", monospace; }
.lpw-diff div { padding: 0 10px; white-space: nowrap; }
.lpw-diff .del { background: #fdeced; color: #a2343a; }
.lpw-diff .add { background: #e4f6ec; color: #1b6e46; }
.lpw-cols { display: flex; gap: 10px; }
.lpw-col { flex: 1; background: #f8f4ee; border-radius: 12px; padding: 8px; }
.lpw-col h6 { font: 800 12.5px/1 "Manrope", sans-serif; letter-spacing: .08em; text-transform: uppercase; color: #9a8f80; margin: 1px 0 8px 2px; }
.lpw-tk { background: #fff; border-radius: 9px; padding: 8px 10px 9px; box-shadow: 0 1px 2px rgba(80,50,20,.08), 0 0 0 1px rgba(120,90,50,.06); }
.lpw-tk code { font: 650 13.5px/1 "JetBrains Mono", monospace; color: #c27a12; }
.lpw-tk div { margin-top: 4px; font: 650 15.5px/1.25 "Inter", sans-serif; color: #1f2329; }
.lpw-tk small { display: block; margin-top: 5px; font: 600 13px/1 "Manrope", sans-serif; color: #9a8f80; }
.lpw-mail { display: flex; gap: 10px; align-items: flex-start; padding: 6px 0 8px; border-bottom: 1px solid #f2ece3; }
.lpw-mail:last-child { border-bottom: 0; }
.lpw-dot { width: 9px; height: 9px; margin-top: 7px; border-radius: 50%; flex: none; }
.lpw-mail .lpw-mh { display: flex; justify-content: space-between; width: 330px; }
.lpw-ms { display: inline-block; margin-top: 3px; font: 550 17px/1.25 "Inter", sans-serif; color: #2e2a26; }
`;

function body(id) {
  const r = reads;
  const hl = '<i class="lpw-hl"></i>';
  if (id === "directory") {
    return `<div class="lpw-person"><div class="lpw-av">${person.initial}</div><div class="lpw-pinfo"><b>${person.first}</b>
      <div class="lpw-row">${person.role}${hl}</div><span>${person.team} · ${person.org} · ${person.city}</span>
      <span>Reports to ${person.manager}</span></div></div>`;
  }
  if (id === "docs") {
    return r.docs.slice(0, 3).map((d, i) => `<div class="lpw-doc"><span class="lpw-dic">${icons.docs}</span><div>
      <div class="lpw-row${i ? " x" : ""}">${d.title}${i ? "" : hl}</div><small>${d.sub}</small></div></div>`).join("");
  }
  if (id === "slack") {
    const m = [r.slack[0], r.slack[2]];
    const col = ["#c0703c", "#1f8a5f"];
    return m.map((x, i) => `<div class="lpw-msg"><span class="lpw-mav" style="background:${col[i]}">${x.who[0]}</span><div>
      <div class="lpw-mh"><b>${x.who}</b><small>${x.where} · ${x.when}</small></div>
      <div class="lpw-mt${i ? " lpw-row" : " clamp"}">${x.text}${i ? hl : ""}</div></div></div>`).join("");
  }
  if (id === "code") {
    const [a, b] = r.code;
    const [num, name] = a.title.split(" · ");
    return `<div class="lpw-pr"><div class="lpw-row"><b>${num}</b> · ${name}${hl}</div><span class="lpw-open">open</span></div>
      <span class="lpw-sub">2 new review comments · Nov 14</span>
      <div class="lpw-diff"><div class="del">-  const MAX_RETRIES = 5;</div><div class="add">+  const max = retryLimit(market);</div>
      <div class="add">+  if (attempt &gt; max) holdPayout(p);</div></div>
      <span class="lpw-sub">${b.title.split(" for ")[0]} · merged</span>`;
  }
  if (id === "tickets") {
    const [inc, pay] = r.tickets;
    const card = (x, on) => {
      const [code, title] = x.title.split(" · ");
      return `<div class="lpw-tk${on ? " lpw-row" : ""}"><code>${code}</code><div>${title}</div><small>${x.sub.split(" · ")[1]}</small>${on ? hl : ""}</div>`;
    };
    return `<div class="lpw-cols"><div class="lpw-col"><h6>In progress</h6>${card(pay, false)}</div>
      <div class="lpw-col"><h6>Resolved</h6>${card(inc, true)}</div></div>`;
  }
  return r.mail.map((m, i) => `<div class="lpw-mail"><i class="lpw-dot" style="background:${i ? "#d8cfc3" : DEEP.mail}"></i><div>
    <div class="lpw-mh"><b>${m.who}</b><small>${m.when}</small></div><div class="lpw-ms${i ? "" : " lpw-row"}">${m.title}${i ? "" : hl}</div></div></div>`).join("");
}

export function buildWidgets(parent) {
  el("style", null, document.head, CSS);
  const W = {};
  WIDS.forEach((id) => {
    const src = sourceById[id];
    const [x, y] = WPOS[id];
    const sh = el("div", "lpw-shadow", parent);
    sh.style.left = `${x + 30}px`; sh.style.top = `${y + WH + 14}px`;
    const root = el("div", "lpw", parent);
    root.style.left = `${x}px`; root.style.top = `${y}px`;
    const glow = el("div", "lpw-glow", root);
    glow.style.boxShadow = `0 0 0 4px ${src.hue}, 0 0 46px 8px ${src.hue}`;
    const card = el("div", "lpw-card", root);
    const head = el("div", "lpw-head", card,
      `<span class="lpw-ic" style="background:${TINT[id]};color:${DEEP[id]}">${sourceIcon(id)}</span><div class="lpw-tt"><b>${NAME[id][0]}</b><small>${NAME[id][1]}</small></div>`);
    const state = el("div", "lpw-state", card);
    const ripple = el("div", "lpw-ripple", state);
    const lock = el("span", "lpw-pill lock", state, `${icons.lock}Locked`);
    const as = el("span", "lpw-pill as", state, `${icons.key}as ${person.login}`);
    let connect = null, note = null, sheet = null;
    if (src.connect) {
      connect = el("span", "lpw-connect", state, "Connect");
      connect.style.background = DEEP[id];
      connect.style.boxShadow = `0 7px 16px -5px ${DEEP[id]}`;
      note = el("div", "lpw-note", card, "Connect once, with your own sign-in");
      note.style.color = DEEP[id];
    }
    const veil = el("div", "lpw-veil", card, "<i style='width:86%'></i><i style='width:64%'></i><i style='width:92%'></i><i style='width:52%'></i>");
    const bodyEl = el("div", "lpw-body", card, body(id));
    const scan = el("div", "lpw-scan", card);
    const sheen = el("div", "lpw-sheen", card);
    scan.style.background = `linear-gradient(180deg, transparent, ${src.hue}55 55%, ${src.hue}aa 92%, transparent)`;
    if (src.connect) {
      sheet = el("div", "lpw-sheet", card, `<div class="sh-h"><span class="sh-av">${person.initial}</span>Signed in as ${person.login}<span class="sh-ok">${icons.check}</span></div>
        <div class="sh-s">${src.name} · read-only · your own sign-in, once</div>`);
    }
    const foot = el("div", "lpw-foot", card, `<i>${icons.check}</i>${src.found}`);
    const row = card.querySelector(".lpw-row:not(.x)");
    const hl = card.querySelector(".lpw-hl");
    const kids = [...bodyEl.children];
    W[id] = { id, sheen, sh, root, glow, card, head, state, ripple, lock, as, connect, note, veil, bodyEl, scan, sheet, foot, row, hl, kids, x, y };
  });
  return W;
}

// Geometry (world px), measured once at rest: the key row, the lock and the Connect button.
export function measureWidgets(W) {
  const g = {};
  const rect = (e) => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
  WIDS.forEach((id) => {
    const w = W[id];
    const lr = rect(w.lock), cr = w.connect ? rect(w.connect) : lr;
    g[id] = { row: rect(w.row), lock: [lr.x + lr.w / 2, lr.y + lr.h / 2], connect: [cr.x + cr.w / 2, cr.y + cr.h / 2], card: rect(w.card) };
  });
  return g;
}

// One frame. foldTo(id) gives the world point a widget folds toward (the sources list).
// When the Peer lands on each widget (its weight makes the widget dip).
const LANDS = Object.fromEntries(WIDS.map((id) => [id, [R[id].hop[1]]]));
LANDS.slack.push(15.86);
LANDS.docs.push(ASK.hopTo[1], 48.82);
ASK.stops.forEach((s) => LANDS[s.w].push(s.at[1]));
// Rack focus: while the camera is close on one widget, the others go soft.
const FOCUS = [[13.45, 16.85, "slack"]];

export function renderWidgets(W, t, foldTo, cam) {
  WIDS.forEach((id, i) => {
    const w = W[id], r = R[id];
    const t0 = STAGE_IN + i * 0.07;
    let op, sc, dx = 0, dy = 0, rot, blur = 0, sat = 1;
    let bob = Math.sin(t * 2 * Math.PI * 0.21 + i * 1.7) * 4;
    // The widget gives a little under the Peer's weight when it lands on it.
    for (const tl of LANDS[id]) { const d = t - tl; if (d > 0 && d < 1.2) bob += 9 * Math.exp(-5.5 * d) * Math.sin(d * 17); }
    rot = Math.sin(t * 2 * Math.PI * 0.15 + i * 2.1) * 0.45;
    if (t < ASK.widgetsIn) {
      const k = spring(t, t0, 1.9, 0.42);
      const kf = ease.inOutCubic(prog(t, FOLD + i * 0.08, FOLD + i * 0.08 + 0.46));
      op = prog(t, t0, t0 + 0.18) * (1 - prog(t, FOLD + i * 0.08 + 0.3, FOLD + i * 0.08 + 0.46));
      sc = (0.62 + 0.38 * k) * (1 - 0.84 * kf);
      dy = (1 - k) * 70 + bob * (1 - kf);
      const [fx, fy] = foldTo(id);
      dx += (fx - (w.x + WW / 2)) * kf;
      dy += (fy - (w.y + WH / 2)) * kf;
      rot = rot * (1 - kf) + kf * -6;
    } else {
      const ta = ASK.widgetsIn + i * 0.06;
      const k = spring(t, ta, 1.7, 0.5);
      const kout = ease.inCubic(prog(t, ASK.out[0] + i * 0.03, ASK.out[0] + 0.42 + i * 0.03));
      const dim = ease.inOutCubic(prog(t, ASK.unfold[0] - 0.25, ASK.unfold[0] + 0.45));
      op = prog(t, ta, ta + 0.2) * (1 - kout) * (1 - 0.35 * dim);
      sc = (0.8 + 0.2 * k) * (1 - 0.06 * dim);
      dy = (1 - k) * 90 + bob + kout * 80;
      blur = dim * 4.5;
      sat = 1 - 0.35 * dim;
    }
    // Depth: each widget turns a little toward the camera's centre, like a card floating in 3D.
    const [ccx, ccy, cs] = cam;
    const scx = (w.x + WW / 2 + dx - ccx) * cs + 960, scy = (w.y + WH / 2 + dy - ccy) * cs + 540;
    const ry = -((scx - 960) / 960) * 10, rx = ((scy - 540) / 540) * 7;
    for (const [a, b, fid] of FOCUS) {
      if (fid !== id) blur = Math.max(blur, 2.6 * Math.min(ease.inOutSine(prog(t, a, a + 0.6)), 1 - ease.inOutSine(prog(t, b - 0.6, b))));
    }
    w.root.style.display = op > 0.002 ? "" : "none";
    w.root.style.opacity = op.toFixed(3);
    w.root.style.transform = `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) perspective(1500px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(4)})`;
    w.root.style.filter = blur > 0.05 ? `blur(${blur.toFixed(2)}px) saturate(${sat.toFixed(2)})` : "none";
    w.sh.style.display = w.root.style.display;
    w.sh.style.opacity = (op * (0.85 - bob * 0.04)).toFixed(3);
    w.sh.style.transform = `translate(${dx.toFixed(1)}px, ${(dy * 0.25).toFixed(1)}px) scale(${(sc * (1 - bob * 0.015)).toFixed(4)})`;
    w.sh.style.filter = w.root.style.filter;
    if (op <= 0.002) return;

    // Lock, Connect, the "as ram" pill.
    const c = r.connect;
    const open = ease.outCubic(prog(t, r.open, r.open + 0.34));
    const asK = ease.outBack(prog(t, r.open, r.open + 0.3));
    const bonk = t > r.tap && t < r.tap + 0.34 ? Math.sin((t - r.tap) * 46) * 6 * (1 - prog(t, r.tap, r.tap + 0.34)) : 0;
    const tapPop = 1 + 0.12 * pulse(t, r.tap - 0.02, r.tap + 0.2, 0.09);
    const lockEnd = c ? c.show : r.open;
    w.lock.style.opacity = String(1 - prog(t, lockEnd - 0.06, lockEnd));
    w.lock.style.transform = `translateX(${bonk.toFixed(1)}px) scale(${(c ? 1 : tapPop).toFixed(3)})`;
    w.as.style.opacity = String(clamp(asK * 1.2));
    w.as.style.transform = `scale(${(0.5 + 0.5 * asK).toFixed(3)})`;
    const rip = prog(t, r.tap, r.tap + 0.5);
    w.ripple.style.opacity = rip > 0 && rip < 1 ? String(0.8 * (1 - rip)) : "0";
    w.ripple.style.transform = `scale(${(0.6 + 1.9 * ease.outCubic(rip)).toFixed(3)})`;
    if (c) {
      const kc = ease.outBack(prog(t, c.show, c.show + 0.3), 2.2);
      const press = 1 - 0.12 * pulse(t, c.click - 0.06, c.click + 0.14, 0.07);
      const gone = prog(t, r.open - 0.12, r.open + 0.08);
      w.connect.style.opacity = String(clamp(kc * 1.3) * (1 - gone));
      w.connect.style.transform = `scale(${((0.4 + 0.6 * kc) * press).toFixed(3)})`;
      w.note.style.opacity = String(clamp(kc) * (1 - prog(t, c.click, c.click + 0.25)));
      const sh = Math.min(ease.outBack(prog(t, c.sheet[0], c.sheet[0] + 0.24)), 1 - ease.inCubic(prog(t, c.sheet[1] - 0.2, c.sheet[1])));
      w.sheet.style.opacity = String(clamp(sh * 1.4));
      w.sheet.style.transform = `translateY(${((1 - sh) * -16).toFixed(1)}px) scale(${(0.86 + 0.14 * sh).toFixed(3)})`;
    }
    // The contents appear as it opens, row by row.
    w.veil.style.opacity = String(1 - open);
    w.kids.forEach((k, j) => {
      const kk = ease.outCubic(prog(t, r.open + 0.05 + j * 0.06, r.open + 0.32 + j * 0.06));
      k.style.opacity = kk.toFixed(3);
      k.style.transform = `translateY(${((1 - kk) * 10).toFixed(1)}px)`;
    });
    // The highlighter over the key line.
    const h = ease.inOutQuad(prog(t, r.hl[0], r.hl[1]));
    w.hl.style.width = `calc(${(h * 100).toFixed(1)}% + 12px)`;
    w.hl.style.opacity = h > 0 ? String(1 - 0.45 * prog(t, r.done + 0.6, r.done + 1.2)) : "0";
    // A sheen of light sweeps across as it opens.
    const ksh = prog(t, r.open - 0.05, r.open + 0.5);
    w.sheen.style.opacity = ksh > 0 && ksh < 1 ? String(Math.sin(ksh * Math.PI)) : "0";
    w.sheen.style.transform = `translateX(${(-200 + ease.inOutSine(ksh) * 640).toFixed(1)}px) skewX(-14deg)`;
    // The tick and the count.
    const kd = ease.outBack(prog(t, r.done, r.done + 0.36));
    w.foot.style.transform = `translateY(${((1 - kd) * 42).toFixed(1)}px)`;
    w.foot.style.opacity = t < r.done ? "0" : "1";
    // In "Ask": the search glows over the widgets it visits.
    let gl = 0, sc2 = 0;
    ASK.stops.forEach((s) => {
      if (s.w !== id) return;
      gl = Math.max(gl, pulse(t, s.at[0] - 0.05, s.chip + 0.45, 0.16));
      sc2 = Math.max(sc2, t >= s.at[0] && t <= s.chip + 0.3 ? prog(t, s.at[0], s.chip + 0.3) : 0);
    });
    w.glow.style.opacity = gl.toFixed(3);
    w.scan.style.opacity = sc2 > 0 && sc2 < 1 ? "1" : "0";
    w.scan.style.transform = `translateY(${(-70 + ease.inOutQuad(sc2) * (WH + 70)).toFixed(1)}px)`;
  });
}
