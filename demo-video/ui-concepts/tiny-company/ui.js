// The HTML layer of the diorama: labels pinned to 3D points, the steps, the cards, the rules.
// Built once in init; renderUI(t, C) sets every moving style from t (C holds the frame's
// projected points from scene.js).
import { el, prog, ease, clamp, spring, typed, text, show, lerp } from "../shared/kit.js";
import * as D from "../shared/data.js";
import { icons, sourceIcon } from "../shared/icons.js";
import { HUE } from "./world.js";
import * as TL from "./timeline.js";

const sv = (b, sw = 1.9) => `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${b}</svg>`;
const CAM = sv('<path d="M4 8.5h3.2l1.5-2.4h6.6l1.5 2.4H20v10H4z"/><circle cx="12" cy="13.2" r="3.3"/>');
const SEND = sv('<path d="M5 12h13M13 6.5L18.5 12 13 17.5"/>', 2.4);
const CLOCK = sv('<circle cx="12" cy="12" r="8.5"/><path d="M12 7.5V12l3 2"/>');
const SPIN = '<svg class="tc-spin" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" stroke-opacity=".22" stroke-width="3"/><path d="M12 3.5a8.5 8.5 0 0 1 8.5 8.5" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"/></svg>';
const ORDER = ["directory", "docs", "slack", "code", "tickets", "mail"];

export const win = (t, a, b, i = 0.3, o = 0.3) => Math.max(0, Math.min(prog(t, a, a + i), 1 - prog(t, b - o, b)));
const pop = (t, t0, f = 2.6, d = 0.48) => spring(t, t0, f, d);

function pinned(parent, cls, html) {
  const o = el("div", "tc-at " + cls, parent);
  const i = el("div", "in", o, html);
  return { o, i };
}
// Put a pinned element's bottom centre at (x, y), with opacity k and scale s.
function setPin(p, xy, k, s = 1, dx = 0, dy = 0, extra = "") {
  const on = k > 0.002 && xy;
  show(p.o, on);
  if (!on) return;
  p.o.style.transform = `translate(${(xy[0] + dx).toFixed(1)}px, ${(xy[1] + dy).toFixed(1)}px)`;
  p.i.style.transform = `translate(-50%, -100%) scale(${s.toFixed(4)}) ${extra}`;
  p.o.style.opacity = k.toFixed(3);
}
const fade = (e, k, tf = "") => { show(e, k > 0.002); if (k > 0.002) { e.style.opacity = k.toFixed(3); e.style.transform = tf; } };

export function buildUI(stage) {
  const lab = el("div", "tc-lab", stage);
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("class", "tc-svg");
  svg.setAttribute("viewBox", "0 0 1920 1080");
  stage.appendChild(svg);
  const ui = el("div", "tc-ui", stage);
  const U = { lab, svg, ui };

  // building labels
  U.bl = {};
  for (const s of D.sources) {
    const p = pinned(lab, "tc-bl", `<div class="pill"><span class="tc-ic" style="--h:${HUE[s.id]}">${sourceIcon(s.id)}</span>${s.name}</div><div class="sub"></div><div class="stem"></div>`);
    p.sub = p.i.querySelector(".sub");
    p.state = "";
    U.bl[s.id] = p;
  }
  // the courier's AI tag
  U.ai = pinned(lab, "tc-ai", `<div class="tag"><i>AI</i><span class="nm"><span>${D.peer.name}</span></span></div><div class="stem"></div>`);
  U.ai.nm = U.ai.i.querySelector(".nm");
  // callouts
  const call = (cls, ic, b, small, h = "#dff5e8") => pinned(lab, "", `<div class="tc-call ${cls}"><span class="tc-ic" style="--h:${h}">${ic}</span><div>${b}<small>${small}</small></div></div>`);
  U.keyCall = call("ok", icons.key, "Ram's keycard", "it reads as Ram, nothing more");
  U.copyCall = call("ok", CAM, "Copies only", "never takes or changes a thing");
  U.pressCall = call("ok", icons.spark, "Printing your first brief", "four things, newest first");
  U.vaultCall = call("red", icons.lock, "Finance vault", "Ram has no access, so it stays shut");
  U.homeCall = call("ok", icons.home, "Notes stay in Ram's house", "kept in his browser; Forget me clears them");
  U.copyCall2 = call("ok", CAM, "It only reads", "posts nothing, sends nothing, changes nothing");
  U.stamp = pinned(lab, "", `<div class="tc-stamp">Just information<small>not an instruction · ignored</small></div>`);
  // connect signs and the sign-in sheet
  U.conn = ["slack", "code", "tickets"].map((id) => {
    const p = pinned(lab, "", `<div class="tc-conn">${icons.lock}<span>Connect</span></div>`);
    p.box = p.i.firstChild; p.id = id; p.state = "";
    return p;
  });
  U.sheet = pinned(lab, "", `<div class="tc-sheet"><div class="hd"><span class="tc-ic" style="--h:${HUE.slack}">${icons.slack}</span>Connect Slack</div>
    <div class="who"><span class="av">R</span>Signed in as ram${icons.check}</div><div class="nt">One time, with Ram's own sign-in. Read-only.</div></div>`);
  // the ID card from the directory, and the lists being read
  U.id = pinned(lab, "", `<div class="tc-card tc-id"><div class="av">R</div><div><b>${D.person.first} · ${D.person.role}</b><span>${D.person.team} · ${D.person.org} · ${D.person.city}</span><span>Reports to ${D.person.manager}</span></div></div>`);
  const listHtml = (id, title, rows) => `<div class="tc-card tc-list" style="--h:${HUE[id]}"><div class="hd"><span class="tc-ic" style="--h:${HUE[id]}">${sourceIcon(id)}</span>${title}<em>as ram</em></div>` +
    rows.map((r) => `<div class="li"><div class="bar"></div><b>${r[0]}</b><span>${r[1]}</span></div>`).join("") + "</div>";
  U.lists = {
    docs: pinned(lab, "", listHtml("docs", "Reading Documents", D.reads.docs.map((r) => [r.title, r.sub]))),
    slack: pinned(lab, "", listHtml("slack", "Reading Slack", D.reads.slack.map((r) => [`${r.who}: ${r.text}`, `${r.where} · ${r.when}`]))),
  };
  for (const k of Object.keys(U.lists)) { U.lists[k].rows = [...U.lists[k].i.querySelectorAll(".li")]; U.lists[k].bars = [...U.lists[k].i.querySelectorAll(".bar")]; }

  // nav and steps
  U.nav = el("div", "tc-nav", ui, `<div class="lg"><i>AI</i>${D.peer.name}</div><div class="hl"></div>` + D.page.nav.map((n) => `<span class="it">${n}</span>`).join(""));
  U.navIt = [...U.nav.querySelectorAll(".it")];
  U.navHl = U.nav.querySelector(".hl");
  U.steps = el("div", "tc-steps", ui, `<div class="hd">${icons.spark}Setting up your AI Peer<span>as ram · read-only</span></div>` +
    D.steps.map((s) => `<div class="row"><div class="st"><div class="ring"></div>${SPIN}<div class="done">${icons.check}</div></div><span class="tx">${s.text}</span><em class="tm">${s.time.toFixed(1)} s</em></div>`).join(""));
  U.stepRows = [...U.steps.querySelectorAll(".row")].map((r) => ({ r, ring: r.querySelector(".ring"), spin: r.querySelector(".tc-spin"), done: r.querySelector(".done"), tx: r.querySelector(".tx"), tm: r.querySelector(".tm") }));
  // the facts being written (step 3)
  U.write = el("div", "tc-big tc-card tc-write", ui, `<div class="hd">${icons.book}Writing what it learned, with sources</div>` +
    D.learned.facts.map((f) => `<div class="li"><i class="tc-dot" style="--h:${HUE[f.source]}"></i><div><b>${f.title}</b><span>${D.sourceById[f.source].name} · ${f.ref} · ${f.date}</span></div></div>`).join(""));
  U.writeRows = [...U.write.querySelectorAll(".li")];
  // the sources line
  U.srcLine = el("div", "tc-srcline", ui, D.sources.map((s) => `<div class="tc-sc"><span class="tc-ic" style="--h:${HUE[s.id]}">${sourceIcon(s.id)}</span><div><b>${s.name}</b><span>${s.found}</span></div><i class="ok">${icons.check}</i></div>`).join(""));
  U.srcChips = [...U.srcLine.children];

  // what I learned
  U.learn = el("div", "tc-big tc-card tc-learn", ui, `<div class="tc-k">${icons.book}What I learned</div><div class="tc-h1">What I learned about you</div><div class="tc-meta">${D.learned.asOf}</div>
    <p class="sum">${D.learned.summary}</p><div class="tc-tags">${D.learned.tags.map((x) => `<span>${x}</span>`).join("")}</div>
    <div class="tc-facts">${D.learned.facts.map((f) => `<div class="tc-fact"><div class="glow"></div><i class="tc-dot" style="--h:${HUE[f.source]}"></i><b>${f.title}</b><p>${f.body}</p>
      <div class="tc-src">${sourceIcon(f.source)}${f.ref} · ${f.date}<span class="lk">${icons.link}</span></div></div>`).join("")}</div>`);
  U.learnParts = { sum: U.learn.querySelector(".sum"), tags: [...U.learn.querySelectorAll(".tc-tags span")], facts: [...U.learn.querySelectorAll(".tc-fact")] };
  U.factGlow = U.learnParts.facts[0].querySelector(".glow");
  U.chip = pinned(lab, "", `<div class="tc-chip"><span class="tc-ic" style="--h:${HUE.docs}">${icons.docs}</span><div><b>${D.learned.facts[0].ref}</b><span>Documents · edited ${D.learned.facts[0].date}</span></div>${icons.link}</div>`);
  U.dots = [];
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  svg.appendChild(g);
  for (let i = 0; i < 34; i++) {
    const c = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c.setAttribute("r", "5.5");
    g.appendChild(c);
    U.dots.push(c);
  }

  // your brief
  U.brief = el("div", "tc-big tc-card tc-brief", ui, `<div class="tc-mast"><div class="t">Your brief</div><div class="d">Sunday, Nov 15<br>newest first</div></div>
    <div class="tc-lead">${D.brief.lead}</div>` + D.brief.items.map((b, i) => `<div class="tc-bi">${i === 0 ? '<span class="new">NEW</span>' : ""}<span class="n" style="--h:${HUE[b.source]}">${i + 1}</span>
      <div class="c"><b>${b.title}</b><p>${b.why}</p><div class="tc-next"><i>Next</i>${b.next}</div></div>
      <div class="s"><div>${sourceIcon(b.source)}${D.sourceById[b.source].name}</div>${b.ref}<br>${b.date}</div></div>`).join(""));
  U.briefItems = [...U.brief.querySelectorAll(".tc-bi")];
  U.briefNew = U.brief.querySelector(".new");
  U.rollBar = el("div", "tc-big", ui);
  U.rollBar.style.cssText = "height:26px;border-radius:13px;background:linear-gradient(#fffdf6,#e9e1cc 45%,#fbf7ec 60%,#d8cfb8);box-shadow:0 10px 18px -8px rgba(60,40,10,.5);";

  // ask: the bubble, the pill while it searches, the answer
  U.ask = pinned(ui, "", `<div class="tc-card tc-ask"><div class="hd">${icons.ask}Ask your Peer</div>
    <div class="box"><div class="q"></div><div class="go">${SEND}</div></div>
    <div class="ex">${D.ask.examples.map((x) => `<span>${x}</span>`).join("")}</div><div class="tail"></div></div>`);
  U.askQ = U.ask.i.querySelector(".q");
  U.askGo = U.ask.i.querySelector(".go");
  U.askEx = [...U.ask.i.querySelectorAll(".ex span")];
  const stops = ["docs", "slack", "code", "mail"];
  U.qpill = pinned(ui, "", `<div class="tc-qpill"><span class="tc-ic" style="--h:#dff5e8">${icons.search}</span><div><b>${D.ask.question}</b>
    <span>Searching again, as you${stops.map((id) => `<i class="mini" data-id="${id}">${sourceIcon(id)}</i>`).join("")}</span></div></div>`);
  U.qMini = [...U.qpill.i.querySelectorAll(".mini")];
  U.ans = el("div", "tc-big tc-card tc-ans", ui, `<div class="tc-k">${icons.ask}Ask your Peer</div><div class="qq">“${D.ask.question}”</div>
    <div class="tc-sents">${D.ask.answer.map((a) => `<p>${a.text}<span class="tc-cite" style="--h:${HUE[D.ask.sources[a.cite].source]}">${a.cite + 1}</span></p>`).join("")}</div>
    <div class="tc-srcs">${D.ask.sources.map((s, i) => `<div><span class="tc-cite" style="--h:${HUE[s.source]}">${i + 1}</span>${sourceIcon(s.source)}${s.ref}<span>· ${s.date}</span></div>`).join("")}</div>
    <div class="tc-foot"><div class="tc-gauge"><svg viewBox="0 0 96 56"><path d="M8 50a40 40 0 0 1 80 0" fill="none" stroke="#cfe5d8" stroke-width="10" stroke-linecap="round"/>
      <path class="arc" d="M8 50a40 40 0 0 1 80 0" fill="none" stroke="#167353" stroke-width="10" stroke-linecap="round" stroke-dasharray="126" stroke-dashoffset="126"/>
      <g class="needle"><path d="M48 50L48 18" stroke="#1c2a2b" stroke-width="4" stroke-linecap="round"/><circle cx="48" cy="50" r="6" fill="#1c2a2b"/></g></svg>
      <div><b>Certainty: ${D.ask.certainty}</b><span>how sure it is</span></div></div>
      <div class="tc-asof">${CLOCK}${D.ask.asOf}</div><div class="tc-ai-mark"><i>AI</i>written by ${D.peer.name}</div></div>`);
  U.ansParts = { q: U.ans.querySelector(".qq"), sents: [...U.ans.querySelectorAll(".tc-sents p")], srcs: [...U.ans.querySelectorAll(".tc-srcs > div")], foot: U.ans.querySelector(".tc-foot"),
    arc: U.ans.querySelector(".arc"), needle: U.ans.querySelector(".needle"), asof: U.ans.querySelector(".tc-asof") };

  // the rules
  U.rules = el("div", "tc-big tc-card tc-rules", ui, `<div class="tc-k">${icons.shield}How it works</div><div class="tc-h1">The rules it keeps</div><div style="height:12px"></div>` +
    D.rules.map((r, i) => `<div class="tc-rule"><div class="bg"></div><span class="rn">${i + 1}</span><div class="tx"><b>${r.title}</b><p>${r.body}</p></div></div>`).join(""));
  U.ruleRows = [...U.rules.querySelectorAll(".tc-rule")].map((r) => ({ r, bg: r.querySelector(".bg"), rn: r.querySelector(".rn") }));
  U.nums = D.rules.map((_, i) => { const p = pinned(lab, "", `<div class="tc-num">${i + 1}</div>`); p.n = p.i.firstChild; return p; });

  // measure what later frames need (layout is fixed): nav items, the fact pins, card sizes
  const nr = U.nav.getBoundingClientRect();
  U.navPos = U.navIt.map((e) => { const r = e.getBoundingClientRect(); return [r.left - nr.left, r.width]; });
  const pr = U.learnParts.facts[0].querySelector(".tc-dot").getBoundingClientRect();
  U.factPin = [pr.left + pr.width / 2, pr.top + pr.height / 2];
  U.learnRect = U.learn.getBoundingClientRect();
  U.briefRect = U.brief.getBoundingClientRect();
  const R = (e) => { const b = e.getBoundingClientRect(); return [b.left - 12, b.top - 12, b.right + 12, b.bottom + 12]; };
  U.rects = { steps: R(U.steps), nav: R(U.nav), srcLine: R(U.srcLine) };
  const wr = U.write.getBoundingClientRect();
  U.writeSize = [wr.width, wr.height];
  for (const e of [U.write, U.srcLine, U.learn, U.brief, U.ans, U.rules, U.rollBar, U.steps]) show(e, false);
  return U;
}

// ---------------------------------------------------------------- per frame
export function renderUI(U, t, C) {
  // nav: which screen we are on
  const navK = win(t, 5.9, TL.END + 0.3, 0.5, 0.4);
  fade(U.nav, navK, `translateY(${((1 - ease.outCubic(navK)) * -18).toFixed(1)}px)`);
  if (navK > 0) {
    const ch = [27.3, 35.45, 44.0, 56.4];
    let x = U.navPos[0][0], w = U.navPos[0][1], idx = 0;
    ch.forEach((c, j) => { const k = ease.inOutCubic(prog(t, c, c + 0.45)); x = lerp(x, U.navPos[j + 1][0], k); w = lerp(w, U.navPos[j + 1][1], k); if (k > 0.5) idx = j + 1; });
    U.navHl.style.transform = `translateX(${x.toFixed(1)}px)`;
    U.navHl.style.width = `${w.toFixed(1)}px`;
    U.navIt.forEach((e, i) => { e.style.color = i === idx ? "#0f5a40" : "#5b6965"; });
  }

  // the four steps
  const stK = win(t, 5.95, 27.75, 0.5, 0.45);
  fade(U.steps, stK, `translateX(${((1 - ease.outCubic(stK)) * -50).toFixed(1)}px)`);
  if (stK > 0) U.stepRows.forEach((s, i) => {
    const a = TL.STEP_START[i], b = TL.STEP_DONE[i];
    const active = t >= a && t < b, done = t >= b;
    s.ring.style.opacity = done || active ? "0" : "1";
    s.spin.style.opacity = active ? "1" : "0";
    s.spin.style.color = "#167353";
    s.spin.style.transform = `rotate(${(t * 400) % 360}deg)`;
    const pk = done ? pop(t, b, 3, 0.45) : 0;
    s.done.style.opacity = done ? "1" : "0";
    s.done.style.transform = `scale(${pk.toFixed(3)})`;
    s.tx.style.color = done ? "#2b3438" : active ? "#0f2a22" : "#98a09c";
    s.tx.style.fontWeight = active ? "600" : "500";
    const tk = done ? ease.outCubic(prog(t, b + 0.05, b + 0.4)) : 0;
    s.tm.style.opacity = tk.toFixed(3);
    s.tm.style.transform = `translateX(${((1 - tk) * 14).toFixed(1)}px)`;
  });

  // building labels (kept clear of the panels, the corner tag and the frame's edges)
  const wK0 = win(t, 20.0, 23.75, 0.35, 0.4), slK0 = win(t, TL.SRCLINE[0], TL.SRCLINE[1], 0.3, 0.35);
  const avoid = [[1450, 0, 1920, 95]];
  if (navK > 0.05) avoid.push(U.rects.nav);
  if (stK > 0.05) avoid.push(U.rects.steps);
  if (slK0 > 0.05) avoid.push(U.rects.srcLine);
  if (wK0 > 0.05) avoid.push([C.writeAt[0] - 12, C.writeAt[1] - 12, C.writeAt[0] + U.writeSize[0] + 12, C.writeAt[1] + U.writeSize[1] + 12]);
  const clear = (xy) => {
    if (!xy) return 0;
    const bx0 = xy[0] - 145, bx1 = xy[0] + 145, by0 = xy[1] - 100, by1 = xy[1];
    let f = 1;
    for (const r of avoid) {
      const w = Math.min(bx1, r[2]) - Math.max(bx0, r[0]), h = Math.min(by1, r[3]) - Math.max(by0, r[1]);
      if (w > 0 && h > 0) f = Math.min(f, 1 - clamp((w * h) / (290 * 100) * 9));
    }
    return f * clamp(1 + Math.min(bx0 - 24, 1896 - bx1, by0 - 24, 900 - by1) / 36);
  };
  for (const id of ORDER) {
    const p = U.bl[id], v = TL.V[id];
    const t0 = C.popT[id] + 0.35;
    let k = win(t, t0, 27.4, 0.35, 0.4);
    const askK = win(t, 47.2, 52.0, 0.35, 0.4);
    let s = 0.55 + 0.45 * pop(t, t0, 2.6, 0.5);
    if (t > 40) { k = win(t, 47.75, 52.0, 0.3, 0.4); s = 0.55 + 0.45 * pop(t, 47.75, 2.6, 0.5); }
    // what the sub line says
    let st = "", html = "";
    if (t < 40) {
      if (t >= v.arrive - 0.25) {
        if ((id === "slack" || id === "code" || id === "tickets") && t < v.click + 0.15) { st = "wait"; html = `${icons.lock}Needs a one-time Connect`; }
        else if (t < v.count) { st = "read"; html = `${SPIN}Reading as you`; }
        else { st = "done"; html = `${icons.check}${D.sourceById[id].found}`; }
      }
    } else if (TL.ASK.stops[id]) {
      const a = TL.ASK.stops[id];
      if (t > a - 0.45 && t < a + 0.55) { st = "read"; html = `${SPIN}Searching again`; }
      else if (t >= a + 0.55) { st = "done"; html = `${icons.check}Searched`; }
    }
    if (p.state !== st) { p.state = st; p.sub.className = "sub " + st; p.sub.innerHTML = html; }
    show(p.sub, st !== "");
    if (st === "read") { const sp = p.sub.querySelector(".tc-spin"); if (sp) sp.style.transform = `rotate(${(t * 400) % 360}deg)`; }
    // hide the label while the ID card or a list sits on it
    if (id === "directory") k *= 1 - win(t, v.card[0], v.card[1], 0.2, 0.2);
    if (U.lists[id]) k *= 1 - win(t, v.list[0], v.list[1], 0.2, 0.2);
    setPin(p, C.lab[id], k * clear(C.lab[id]), s);
  }

  // the courier's AI tag (always with the courier)
  const nmK = Math.max(win(t, 7.2, 8.05, 0.4, 0.3), win(t, 57.45, 58.6, 0.4, 0.4));
  U.ai.nm.style.maxWidth = `${(ease.inOutCubic(nmK) * 170).toFixed(1)}px`;
  const aiS = 1 + 0.22 * Math.max(0, Math.sin(Math.PI * prog(t, 57.6, 58.2)));
  setPin(U.ai, C.flag, C.courierOn ? win(t, 7.05, 99, 0.25, 0.1) : 0, aiS, 8, -4);

  // callouts
  setPin(U.keyCall, C.card, win(t, 8.08, 9.25, 0.25, 0.3), 0.8 + 0.2 * pop(t, 8.08), 30, 215);
  setPin(U.copyCall, C.courier, win(t, 11.0, 12.05, 0.25, 0.3), 0.8 + 0.2 * pop(t, 11.0), 215, 10);
  setPin(U.pressCall, C.press, win(t, 23.5, 26.1, 0.3, 0.35), 0.8 + 0.2 * pop(t, 23.5), 0, -46);
  setPin(U.vaultCall, C.vault, win(t, 58.75, 60.75, 0.3, 0.35), 0.8 + 0.2 * pop(t, 58.75), 60, -14);
  setPin(U.homeCall, C.house, win(t, 62.0, 63.05, 0.3, 0.3), 0.8 + 0.2 * pop(t, 62.0), -40, -40);
  setPin(U.copyCall2, C.house, win(t, 63.05, 66.0, 0.3, 0.4), 0.8 + 0.2 * pop(t, 63.05), -40, -40);
  setPin(U.stamp, C.billboard, win(t, 61.05, 63.0, 0.2, 0.35), 1.6 - 0.6 * ease.outBack(prog(t, 61.05, 61.4)), 0, -6, "rotate(-7deg)");

  // connect signs
  const cw = { slack: [11.7, 14.25], code: [15.1, 16.35], tickets: [16.55, 17.65] };
  for (const p of U.conn) {
    const v = TL.V[p.id], [a, b] = cw[p.id];
    const done = t >= v.click;
    const st = done ? "done" : "wait";
    if (p.state !== st) { p.state = st; p.box.className = "tc-conn" + (done ? " done" : ""); p.box.innerHTML = done ? `${icons.check}<span>Connected</span>` : `${icons.lock}<span>Connect</span>`; }
    const press = Math.max(0, 1 - Math.abs(t - v.click) / 0.12);
    setPin(p, C.conn[p.id], win(t, a, b, 0.3, 0.35), (0.7 + 0.3 * pop(t, a)) * (1 - 0.08 * press) + (done ? 0.08 * (1 - pop(t, v.click, 3, 0.4)) : 0), 0, -8);
  }
  setPin(U.sheet, C.conn.slack, win(t, TL.V.slack.sheet[0], TL.V.slack.sheet[1], 0.25, 0.35), 0.75 + 0.25 * pop(t, TL.V.slack.sheet[0]), 240, 40);

  // the directory's ID card: pops above the town hall, then flies into the basket
  {
    const v = TL.V.directory;
    const k = win(t, v.card[0], v.card[1], 0.25, 0.15);
    const fly = ease.inOutCubic(prog(t, v.copy[0], v.copy[1]));
    const from = C.lab.directory, to = C.courier;
    const xy = from && to ? [lerp(from[0], to[0], fly), lerp(from[1] - 10, to[1] + 40, fly)] : from;
    setPin(U.id, xy, k * (1 - fly * 0.7), (0.6 + 0.4 * pop(t, v.card[0])) * (1 - 0.8 * fly), 175 * (1 - fly), 0);
  }
  // the lists being read (docs, slack): a highlight runs down the rows, then they fly to the basket
  for (const id of ["docs", "slack"]) {
    const v = TL.V[id], L = U.lists[id];
    const k = win(t, v.list[0], v.list[1], 0.22, 0.15);
    const fly = ease.inOutCubic(prog(t, v.list[1] - 0.32, v.list[1]));
    const from = C.lab[id], to = C.courier;
    const xy = from && to ? [lerp(from[0], to[0], fly), lerp(from[1] + 20, to[1] + 40, fly)] : from;
    setPin(L, xy, k, (0.6 + 0.4 * pop(t, v.list[0])) * (1 - 0.75 * fly));
    const n = L.rows.length, span = (v.list[1] - 0.35 - (v.list[0] + 0.2)) / n;
    L.bars.forEach((b, i) => {
      const a = v.list[0] + 0.2 + i * span;
      const hk = win(t, a, a + span + 0.1, 0.08, 0.12);
      b.style.height = "100%";
      b.style.opacity = hk.toFixed(3);
      L.rows[i].style.opacity = (t < a ? 0.55 : 1).toFixed(2);
    });
  }

  // the facts being written (step 3)
  const wK = win(t, 20.0, 23.75, 0.35, 0.4);
  fade(U.write, wK, `translate(${C.writeAt[0].toFixed(1)}px, ${(C.writeAt[1] + (1 - ease.outCubic(wK)) * 20).toFixed(1)}px)`);
  U.writeRows.forEach((r, i) => {
    const k = ease.outCubic(prog(t, TL.PIN[i] + 0.05, TL.PIN[i] + 0.4));
    r.style.opacity = k.toFixed(3);
    r.style.transform = `translateX(${((1 - k) * 18).toFixed(1)}px)`;
  });

  // the sources line
  const slK = win(t, TL.SRCLINE[0], TL.SRCLINE[1], 0.3, 0.35);
  fade(U.srcLine, slK);
  U.srcChips.forEach((c, i) => {
    const k = pop(t, TL.SRCLINE[0] + i * 0.08, 2.4, 0.5);
    c.style.transform = `translateY(${((1 - k) * 40).toFixed(1)}px) scale(${(0.9 + 0.1 * k).toFixed(3)})`;
    c.style.opacity = clamp(k * 1.5).toFixed(3);
  });

  // what I learned: the roof board grows into the big card
  {
    const L = TL.LEARN, R = U.learnRect;
    const kin = ease.inOutCubic(prog(t, L.morph[0], L.morph[1]));
    const kout = ease.inOutCubic(prog(t, L.back[0], L.back[1]));
    const k = kin * (1 - kout);
    const on = t > L.morph[0] && t < L.back[1];
    show(U.learn, on);
    if (on) {
      const b = C.board;
      const sx = lerp((b.x1 - b.x0) / R.width, 1, k), sy = lerp((b.y1 - b.y0) / R.height, 1, k);
      const tx = lerp(b.x0 - R.left, 0, k), ty = lerp(b.y0 - R.top, 0, k);
      U.learn.style.transform = `translate(${tx.toFixed(1)}px, ${ty.toFixed(1)}px) scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`;
      U.learn.style.opacity = clamp(k * 3).toFixed(3);
      const ck = (a) => ease.outCubic(prog(t, a, a + 0.45)) * (1 - kout);
      U.learnParts.sum.style.opacity = ck(L.items).toFixed(3);
      U.learnParts.tags.forEach((e, i) => { const q = pop(t, L.items + 0.2 + i * 0.07, 2.6, 0.5); e.style.transform = `scale(${q.toFixed(3)})`; e.style.opacity = clamp(q * 2).toFixed(3); });
      U.learnParts.facts.forEach((e, i) => {
        const q = pop(t, L.items + 0.45 + i * 0.12, 2.3, 0.55);
        e.style.transform = `translateY(${((1 - q) * 26).toFixed(1)}px) rotate(${((1 - q) * (i % 2 ? 2 : -2)).toFixed(2)}deg)`;
        e.style.opacity = clamp(q * 1.6).toFixed(3);
      });
      U.factGlow.style.opacity = win(t, L.trace[0], L.trace[1] + 0.6, 0.3, 0.4).toFixed(3);
    }
    // the dotted path from the fact back to the library
    const tk = win(t, L.trace[0] + 0.2, L.back[0], 0.01, 0.35);
    const lib = C.lab.docs;
    U.dots.forEach((c, i) => {
      const f = i / (U.dots.length - 1);
      if (tk <= 0 || !lib) { c.setAttribute("opacity", "0"); return; }
      const [x0, y0] = U.factPin, [x1, y1] = [lib[0], lib[1] + 30];
      const mx = (x0 + x1) / 2, my = Math.min(y0, y1) - 160;
      const u = 1 - f;
      const x = u * u * x0 + 2 * u * f * mx + f * f * x1, y = u * u * y0 + 2 * u * f * my + f * f * y1;
      const lit = clamp((t - (L.trace[0] + 0.25) - f * 1.1) / 0.12);
      c.setAttribute("cx", x.toFixed(1)); c.setAttribute("cy", y.toFixed(1));
      c.setAttribute("fill", lit > 0.5 ? "#5b8cff" : "#ffffff");
      c.setAttribute("r", (4 + 2.5 * lit).toFixed(2));
      c.setAttribute("opacity", (tk * (0.45 + 0.55 * lit)).toFixed(3));
    });
    setPin(U.chip, C.lab.docs, win(t, L.trace[0] + 1.35, L.back[0] + 0.2, 0.25, 0.4), 0.7 + 0.3 * pop(t, L.trace[0] + 1.35), 0, 6);
  }

  // your brief: the roll on the doorstep unrolls into the paper
  {
    const B = TL.BRIEF, R = U.briefRect;
    const fly = ease.inOutCubic(prog(t, B.unroll[0] - 0.3, B.unroll[0]));
    const un = ease.inOutCubic(prog(t, B.unroll[0], B.unroll[1]));
    const re = ease.inOutCubic(prog(t, B.roll[0], B.roll[1]));
    const open = un * (1 - re);
    const barOn = t > B.unroll[0] - 0.3 && t < B.roll[1];
    show(U.rollBar, barOn);
    if (barOn) {
      const r = C.roll;
      const x = lerp(r[0] - 60, R.left - 6, fly), w = lerp(120, R.width + 12, fly);
      const y = lerp(r[1] - 13, R.top - 13, fly) + open * R.height;
      U.rollBar.style.left = "0px"; U.rollBar.style.top = "0px";
      U.rollBar.style.width = `${w.toFixed(1)}px`;
      U.rollBar.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
      U.rollBar.style.opacity = (1 - prog(t, B.roll[1] - 0.25, B.roll[1])).toFixed(3);
    }
    const on = open > 0.001;
    show(U.brief, on);
    if (on) {
      U.brief.style.clipPath = `inset(0 0 ${((1 - open) * 100).toFixed(2)}% 0 round 20px)`;
      U.brief.style.opacity = "1";
      U.briefItems.forEach((e, i) => {
        const q = ease.outCubic(prog(t, B.items + i * 0.32, B.items + i * 0.32 + 0.45));
        e.style.opacity = q.toFixed(3);
        e.style.transform = `translateY(${((1 - q) * 16).toFixed(1)}px)`;
        const hk = win(t, 39.6 + i * 0.85, 39.6 + (i + 1) * 0.85 + 0.2, 0.3, 0.35);
        e.style.background = `rgba(255, 234, 160, ${(0.5 * hk).toFixed(3)})`;
      });
      const nk = pop(t, B.items + 0.5, 3, 0.4);
      U.briefNew.style.transform = `rotate(-8deg) scale(${nk.toFixed(3)})`;
    }
  }

  // ask: the bubble rises from the house, the question is typed, it shrinks to a pill
  {
    const A = TL.ASK;
    const rise = pop(t, A.rise[0], 2.2, 0.55);
    const k = win(t, A.rise[0], A.pill[1], 0.25, 0.3);
    const shrink = ease.inOutCubic(prog(t, A.pill[0], A.pill[1]));
    setPin(U.ask, C.house, k, (0.35 + 0.65 * rise) * (1 - 0.4 * shrink), 0, -30 - 50 * rise);
    if (k > 0) {
      const q = typed(D.ask.question, t, A.type, 21);
      const caret = t < A.send + 0.05 ? '<span class="caret"></span>' : "";
      const html = q.length ? q + caret : `<span class="ph">Ask about your work…</span>${caret}`;
      if (U.askQ.dataset.h !== html) { U.askQ.dataset.h = html; U.askQ.innerHTML = html; }
      const pr = Math.max(0, 1 - Math.abs(t - A.send) / 0.12);
      U.askGo.style.transform = `scale(${(1 - 0.12 * pr).toFixed(3)})`;
      U.askGo.style.background = t > A.send ? "#0f5a40" : "#167353";
      U.askEx.forEach((e, i) => { const q2 = ease.outCubic(prog(t, A.rise[0] + 0.4 + i * 0.1, A.rise[0] + 0.75 + i * 0.1)); e.style.opacity = q2.toFixed(3); e.style.transform = `translateY(${((1 - q2) * 8).toFixed(1)}px)`; });
    }
    const pk = win(t, A.pill[0] + 0.15, A.answer[0] + 0.4, 0.3, 0.3);
    setPin(U.qpill, C.house, pk, 0.8 + 0.2 * pop(t, A.pill[0] + 0.15), 0, -40);
    U.qMini.forEach((m) => {
      const a = A.stops[m.dataset.id];
      const on2 = t > a + 0.25;
      m.style.background = on2 ? "#167353" : "#eceae3";
      m.style.color = on2 ? "#ffffff" : "#8a948f";
      m.style.transform = `scale(${(on2 ? 0.85 + 0.15 * pop(t, a + 0.25, 3, 0.4) : 1).toFixed(3)})`;
    });
    // the answer card unfolds
    const un = spring(t, A.answer[0], 1.4, 0.55);
    const out = ease.inOutCubic(prog(t, A.away[0], A.away[1]));
    const on = t > A.answer[0] && t < A.away[1];
    show(U.ans, on);
    if (on) {
      U.ans.style.transform = `perspective(1600px) rotateX(${((1 - un) * -88 + out * 70).toFixed(2)}deg) translateY(${(out * -30).toFixed(1)}px)`;
      U.ans.style.opacity = (clamp(un * 2.5) * (1 - out)).toFixed(3);
      const P = U.ansParts;
      P.q.style.opacity = ease.outCubic(prog(t, A.answer[0] + 0.35, A.answer[0] + 0.8)).toFixed(3);
      P.sents.forEach((e, i) => { const q = ease.outCubic(prog(t, A.sentences + i * 0.42, A.sentences + i * 0.42 + 0.45)); e.style.opacity = q.toFixed(3); e.style.transform = `translateY(${((1 - q) * 12).toFixed(1)}px)`; });
      P.srcs.forEach((e, i) => { const q = pop(t, A.sources + i * 0.09, 2.6, 0.5); e.style.opacity = clamp(q * 1.6).toFixed(3); e.style.transform = `scale(${(0.85 + 0.15 * q).toFixed(3)})`; });
      const fk = ease.outCubic(prog(t, A.gauge[0] - 0.2, A.gauge[0] + 0.2));
      P.foot.style.opacity = fk.toFixed(3);
      const gk = spring(t, A.gauge[0], 1.5, 0.45);
      P.arc.setAttribute("stroke-dashoffset", (126 * (1 - 0.82 * clamp(gk, 0, 1.08))).toFixed(1));
      P.needle.setAttribute("transform", `rotate(${(-90 + 148 * gk).toFixed(1)} 48 50)`);
      P.asof.style.opacity = ease.outCubic(prog(t, A.asOf, A.asOf + 0.4)).toFixed(3);
    }
  }

  // the rules
  {
    const R = TL.RULES;
    const k = spring(t, R.panel[0], 1.6, 0.6);
    const on = t > R.panel[0];
    show(U.rules, on);
    if (on) {
      U.rules.style.transform = `translateX(${((1 - k) * -680).toFixed(1)}px)`;
      U.rules.style.opacity = clamp(k * 2).toFixed(3);
    }
    U.ruleRows.forEach((r, i) => {
      const lit = ease.outCubic(prog(t, R.on[i], R.on[i] + 0.35));
      const now = win(t, R.on[i], (R.on[i + 1] || R.on[i] + 1.2) + 0.1, 0.25, 0.3);
      r.bg.style.opacity = (0.35 * lit + 0.65 * now).toFixed(3);
      r.rn.style.background = lit > 0.5 ? "#167353" : "#ffffff";
      r.rn.style.color = lit > 0.5 ? "#ffffff" : "#7b8580";
      r.rn.style.borderColor = lit > 0.5 ? "#b7f4cf" : "#d9d5cc";
      r.rn.style.transform = `scale(${(1 + 0.25 * Math.sin(Math.PI * prog(t, R.on[i], R.on[i] + 0.4))).toFixed(3)})`;
    });
    U.nums.forEach((p, i) => {
      const lit = t > R.on[i];
      p.n.style.background = lit ? "#167353" : "#ffffff";
      p.n.style.color = lit ? "#ffffff" : "#6b7672";
      p.n.style.borderColor = lit ? "#b7f4cf" : "#e9e4da";
      const s = (0.6 + 0.4 * pop(t, 57.0 + i * 0.08)) * (1 + 0.3 * Math.sin(Math.PI * prog(t, R.on[i], R.on[i] + 0.45)));
      setPin(p, C.signs[i], win(t, 57.0 + i * 0.08, TL.END + 0.4, 0.25, 0.3), s, 0, -6);
    });
  }
}
