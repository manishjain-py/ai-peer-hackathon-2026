// Tag: a walking name tag does the work on a calm paper page. Rebuilt by code from Manish's
// walkthrough (its paper look, the tag, every step), with the film's made-up story (Ram).
// Landing -> setup in a paper room (four steps) -> What I learned -> the brief -> Ask -> the
// rules on the back of the tag -> the next day: refresh, then forget, and it is a plain label.
import { el, keys } from "../shared/kit.js";
import { pointer } from "../shared/page.js";
import { learned, brief, rules as allRules, sources } from "../shared/data.js";
import { defs, buildTag, LEG } from "./mascot.js";
import { X } from "./data-extra.js";
import {
  CAPTIONS, PCAM, SCROLL, SPOT, BRIEF, ASKP, CARD, PANEL, SRC, READ, S3, S4, MORPH, LEARNED, BRIEFT, ASK, RULES, RET,
  CLICK, BTN_C, ROOM_IN, SECTION,
} from "./tl.js";
import { buildPaper, measurePaper, renderPaper, chipRect, factRect, briefLayout, briefRise, pageBgK } from "./paper.js";
import { buildRoom, measureRoom, renderRoom, panK, cardRect, keyRowAt, wfPill, factPillAt } from "./room.js";
import { buildMotion } from "./motion.js";
import { put, css, txt, camT, toScreen, drawPath, win, prog, clamp, lerp, ease, f1 } from "./u.js";

const NS = "http://www.w3.org/2000/svg";
const S = (tag, attrs, parent) => {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
};

const cam = (t) => keys(t, PCAM, ease.inOutCubic);
const scroll = (t) => keys(t, SCROLL, ease.inOutCubic);
const srcIndex = Object.fromEntries(sources.map((s, i) => [s.id, i]));

const rules = allRules.slice(0,3);
let confidenceSeal;
let P, R, svg, lines, tag, motion, ptr, veil, rulesCard, rulesBox, ruleEls, rulesHead, calm, day, capEl, caps;

// ---------------------------------------------------------------- the pointer
let PTR;
function pointerKeys() {
  const btnRel = R.cards.map((c) => c.btnRel);
  const connectAt = (id) => { const i = srcIndex[id]; const r = cardRect(i, i); return [r.x + btnRel[i][0], r.y + btnRel[i][1] + 6]; };
  const hb = (i) => { const r = P.hbtns[i]._rect; return [r.x + r.w / 2 + 6, r.y + r.h / 2 + 4]; };
  const inputAt = [ASKP.input.x + 120, ASKP.input.y + 52 - ASKP.scroll];
  const askAt = [ASKP.btn.x + ASKP.btn.w / 2 + 8, ASKP.btn.y + ASKP.btn.h / 2 + 6 - ASKP.scroll];
  const k = [
    [0, [1580, 1040]], [3.2, [1560, 1000]], [4.22, [BTN_C[0] + 6, BTN_C[1] + 4]], [4.55, [BTN_C[0] + 6, BTN_C[1] + 4]], [5.25, [BTN_C[0] + 170, BTN_C[1] + 140]],
  ];
  const conn = (id, from) => {
    const c = READ[id].connect, p = connectAt(id);
    k.push([c.show - 0.05, from], [c.click - 0.12, p], [c.click + 0.12, p], [c.click + 0.5, [p[0] + 150, p[1] + 120]]);
  };
  conn("slack", [1720, 1060]);
  conn("code", [1720, 1060]);
  conn("tickets", [1720, 1060]);
  k.push([40.4, [1540, 1060]], [40.92, inputAt], [41.1, inputAt], [41.5, [inputAt[0] + 60, inputAt[1] + 110]],
    [ASK.ptrBtn[0], [inputAt[0] + 60, inputAt[1] + 110]], [ASK.ptrBtn[1], askAt], [ASK.askClick + 0.12, askAt], [43.6, [askAt[0] + 40, askAt[1] + 260]]);
  k.push([RET.ptrRefresh[0], [1560, 1000]], [RET.ptrRefresh[1], hb(0)], [RET.refresh + 0.15, hb(0)], [RET.ptrForget[0], [hb(0)[0] + 30, hb(0)[1] + 90]],
    [RET.ptrForget[1], hb(2)], [RET.forget + 0.14, hb(2)], [64.75, [hb(2)[0] + 110, hb(2)[1] + 150]]);
  k.sort((a, b) => a[0] - b[0]);
  const clicks = [CLICK, READ.slack.connect.click, READ.code.connect.click, READ.tickets.connect.click, ASK.click, ASK.askClick, RET.refresh, RET.forget];
  const vis = [[3.15, 3.35, 4.95, 5.3], ...["slack", "code", "tickets"].map((id) => { const c = READ[id].connect; return [c.show - 0.05, c.show + 0.12, c.click + 0.3, c.click + 0.5]; }),
    [40.4, 40.55, 43.35, 43.6], [RET.ptrRefresh[0], RET.ptrRefresh[0] + 0.15, 64.45, 64.75]];
  return { k, clicks, vis };
}
const pointerAt = (t) => keys(t, PTR.k, ease.inOutCubic);

// ---------------------------------------------------------------- lines (frame px)
const pathL = (pts, r = 16) => {
  // An orthogonal polyline with rounded corners.
  let d = `M ${f1(pts[0][0])} ${f1(pts[0][1])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [px, py] = pts[i - 1], [x, y] = pts[i], [nx, ny] = pts[i + 1];
    const d1 = Math.hypot(x - px, y - py), d2 = Math.hypot(nx - x, ny - y);
    const rr = Math.min(r, d1 / 2, d2 / 2);
    const ax = x - ((x - px) / (d1 || 1)) * rr, ay = y - ((y - py) / (d1 || 1)) * rr;
    const bx = x + ((nx - x) / (d2 || 1)) * rr, by = y + ((ny - y) / (d2 || 1)) * rr;
    d += ` L ${f1(ax)} ${f1(ay)} Q ${f1(x)} ${f1(y)} ${f1(bx)} ${f1(by)}`;
  }
  const e = pts[pts.length - 1];
  return d + ` L ${f1(e[0])} ${f1(e[1])}`;
};
const plen = (pts) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);

function setLine(L, d, len, k, o) {
  if (o <= 0.003 || k <= 0) { L.p.style.display = "none"; if (L.dot) L.dot.style.display = "none"; return; }
  L.p.style.display = "";
  L.p.setAttribute("d", d);
  L.p.setAttribute("opacity", o.toFixed(3));
  drawPath(L.p, k, len);
}

export default {
  captions: CAPTIONS,

  async init(stage) {
    const roomBack = el("div", "tg-layer", stage);
    P = buildPaper(stage);
    const roomFront = el("div", "tg-layer", stage);
    R = buildRoom(roomBack, roomFront);
    veil = el("div", "tg-veil", stage);
    svg = S("svg", { class: "tg-svg", width: 1920, height: 1080, viewBox: "0 0 1920 1080" }, stage);
    defs(svg);
    const lineG = S("g", {}, svg);
    const mk = (stroke, w, extra = {}) => ({ p: S("path", { fill: "none", stroke, "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round", ...extra }, lineG) });
    lines = {
      read: mk("#2b6a50", 4),
      readDot: S("circle", { r: 7, fill: "#eba844", stroke: "#fffaf0", "stroke-width": 2.5 }, lineG),
      threads: learned.facts.map(() => mk("#eba844", 2.8)),
      page: mk("#eba844", 3.2),
      pageDot: S("circle", { r: 6.5, fill: "#eba844", stroke: "#fffaf0", "stroke-width": 2.5 }, lineG),
      brief: mk("#2b6a50", 3.6),
    };
    confidenceSeal=el("div","tg-confidence-seal",stage,"<i>✓</i><b>HIGH</b><span>CONFIDENCE</span>");stage.insertBefore(confidenceSeal,svg);
    rulesCard = S("rect", { x:0, y:0, width:0, height:0, rx:28, fill:"#1f5b43", stroke:"#123b2a", "stroke-width":2 }, svg);
    tag = buildTag(svg, { label: "Ram's AI Peer", height:150 });

    // The rules: the back of the tag.
    rulesBox = el("div", "tg-rules", stage);
    rulesHead = el("div", "tg-rules-h", rulesBox, X.rulesHead);
    ruleEls = rules.map((r, i) => {
      const e = el("div", "tg-rule", rulesBox, `<div class="tg-rule-n">${String(i + 1).padStart(2, "0")}</div><div><div class="tg-rule-t">${r.title}</div><div class="tg-rule-b">${r.body}</div></div>`);
      e.style.top = `${72 + i * 88}px`;
      return e;
    });
    calm = el("div", "tg-calm", stage, X.railLine);
    day = el("div", "tg-day", stage, X.nextDay);
    ptr = pointer(stage);

    measurePaper(P);
    measureRoom(R);
    // The Connect button's centre on its card (cards sit at 0, 0 before the first frame).
    R.cards.forEach((c) => {
      if (!c.cxBtn) { c.btnRel = [CARD.w / 2, 500]; return; }
      const b = c.cxBtn.getBoundingClientRect(), a = c.el.getBoundingClientRect();
      c.btnRel = [b.left - a.left + b.width / 2, b.top - a.top + b.height / 2];
    });
    PTR = pointerKeys();

    const toS = (p, t) => toScreen(cam(t), [p[0], p[1] - scroll(t)]);
    motion = buildMotion({
      cam, scroll, room: R, pointerAt, toS,
      briefItemAt: (i, t) => {
        const bl = briefLayout(P, t);
        const top = BRIEF.y + (1 - briefRise(t)) * 560;
        return toS([BRIEF.x + 40, top + bl.items[i].y + bl.items[i].h / 2], t);
      },
      factAt: (i, t) => { const f = P.facts[i]; return toS([f.r.x + f.r.w - 70, f.r.y + f.r.h / 2], t); },
      caretAt: (t) => {
        const n = clamp((t - ASK.type) * ASK.cps / 35);
        return toS([ASKP.input.x + 36 + P.ask.qW * n, ASKP.input.y + 44], t);
      },
      thinkChipAt: (i, t) => toS([ASKP.answer.x + ASKP.answer.w / 2 + (i - 1.5) * 200, ASKP.answer.y + ASKP.answer.h / 2 + 60], t),
      answerFront: (t) => {
        const k = clamp((t - ASK.answer) * ASK.cps2 / P.ask.full.length);
        return toS([ASKP.answer.x + 120 + 1200 * ((k * 3) % 1), ASKP.answer.y + 100 + 46 * Math.floor(k * 2.99)], t);
      },
      stampAt: () => toScreen([960, 540, 1], [ASKP.answer.x + 560, ASKP.answer.y + ASKP.answer.h - 50 - ASKP.scroll]),
    });
  },

  render(t) {
    window.__mascotTime = t;
    const c = cam(t);
    const sc = scroll(t);
    const pan = panK(t);

    // ---- section state for the page
    const active = t < SECTION.learned ? 0 : t < SECTION.brief ? 1 : t < SECTION.ask ? 2 : t < SECTION.rules ? 3 : t < SECTION.ret ? 4 : t < RET.forget ? 2 : 0;
    const chipRing = (i) => {
      let r = win(t, LEARNED.sweep[0] + i * 0.22, LEARNED.sweep[0] + i * 0.22 + 0.5, 0.12, 0.25);
      r = Math.max(r, win(t, RET.sweep + i * 0.2, RET.sweep + i * 0.2 + 0.55, 0.12, 0.3));
      LEARNED.threads.forEach(([a, b, fi]) => { if (srcIndex[learned.facts[fi].source] === i) r = Math.max(r, win(t, a + 0.6, b, 0.2, 0.3)); });
      S4.items.forEach((a, j) => { if (srcIndex[brief.items[j].source] === i) r = Math.max(r, win(t, a, a + 0.6, 0.1, 0.35)); });
      return r;
    };
    const factHl = (i) => Math.max(0, ...LEARNED.threads.map(([a, b, fi]) => (fi === i ? win(t, a, b, 0.25, 0.3) : 0)));
    const factPop = (i) => Math.max(0, ...LEARNED.threads.map(([a, b, fi]) => (fi === i ? win(t, a + 0.7, b - 0.05, 0.2, 0.25) : 0)));
    const briefAct = (i) => (t >= BRIEFT.items[i] && t < BRIEFT.items[i] + 1.3 ? 1 : 0);
    const tagAway = (t > 2.4 && t < 57.6) || (t > RET.hop[0] + 0.1 && t < RET.hopHome[1]);

    // ---- the page, under its camera; the room around it during setup
    css(P.layer, "transform", camT(c));
    renderPaper(P, t, { scroll: sc, active, chipRing, factHl, factPop, briefAct, tagAway });
    const roomK = clamp(Math.min(ease.inOutCubic(prog(t, ROOM_IN[0], ROOM_IN[1])), 1 - prog(t, MORPH[1], MORPH[1] + 0.05)));
    renderRoom(R, t, { roomK, pan });
    put(R.front, t < ROOM_IN[0] || t > MORPH[1] + 0.05 ? 0 : 1);

    // ---- the tag
    const pose = motion.poseAt(t);
    // The original layout/time stays fixed. Moss presents a separate rules card beside him.
    const grow = ease.inOutCubic(prog(t, RULES.grow[0], RULES.grow[1])) * (1 - ease.inOutCubic(prog(t, RULES.back[0] - 0.05, RULES.back[0] + 0.45)));
    const cardW = RULES.card.w * RULES.spot.s * grow;
    const cardH = RULES.card.h * RULES.spot.s * grow;
    rulesCard.setAttribute("x", RULES.spot.x - cardW / 2);
    rulesCard.setAttribute("y", RULES.spot.feet - LEG * RULES.spot.s - cardH);
    rulesCard.setAttribute("width", cardW); rulesCard.setAttribute("height", cardH);
    rulesCard.setAttribute("opacity", grow > 0.001 ? 1 : 0);
    if(t>=46.4&&t<50.12){
      const a=ease.inOutCubic(prog(t,46.4,47.3)),out=ease.inOutCubic(prog(t,48.55,49.25));
      Object.assign(pose,{x:1706-51*a+150*out,y:1014-329*a+160*out,s:1.22,lift:0,rot:0,sx:1,sy:1,label:false,action:'stamp',actionTime:Math.min(4.75,(t-46.4)*1.6667+.04)});
    }
    tag.draw(pose);
    const sealOn=t>=ASK.stamp&&t<50.12;const sealPop=ease.outCubic(prog(t,ASK.stamp,ASK.stamp+.16));
    put(confidenceSeal,sealOn?1:0,`scale(${.9+.1*sealPop}) rotate(-11deg)`);
    const box = motion.boxOf(pose);

    // ---- the tag's reading line in the room (steps 1 and 2)
    let readOn = false;
    for (let i = 0; i < SRC.length && t < S3.hop[0]; i++) {
      const rd = READ[SRC[i]];
      if (t < rd.hl - 0.04 || t > rd.chip[0] + 0.32) continue;
      const kr = keyRowAt(R, i, t);
      const x0 = Math.max(box.x0 + 26, kr.x - 34);
      const yb = kr.y + kr.h + 9;
      const pts = [[x0, box.top + 14], [x0, yb], [kr.x + kr.w - 4, yb]];
      const k = ease.outCubic(prog(t, rd.hl - 0.04, rd.hl + 0.26));
      const o = 1 - prog(t, rd.chip[0] + 0.1, rd.chip[0] + 0.32);
      setLine(lines.read, pathL(pts, 18), plen(pts), k, o);
      lines.readDot.style.display = k > 0.98 ? "" : "none";
      lines.readDot.setAttribute("cx", f1(kr.x + kr.w - 4)); lines.readDot.setAttribute("cy", f1(yb));
      lines.readDot.setAttribute("opacity", o.toFixed(3));
      readOn = true;
    }
    if (!readOn) { setLine(lines.read, "", 1, 0, 0); lines.readDot.style.display = "none"; }

    // ---- step 3: orange threads from each source card to the facts it gave
    const lanes = { directory: 0, docs: 1, slack: 2, code: 3, tickets: 4, mail: 5 };
    const thrOut = 1 - prog(t, S4.compact[0], S4.compact[0] + 0.3);
    learned.facts.forEach((f, i) => {
      const L = lines.threads[i];
      const w = R.wf[i];
      const a = factPillAt(w);
      if (t < a || thrOut <= 0) { setLine(L, "", 1, 0, 0); return; }
      const m = R.minis[srcIndex[f.source]];
      const ln = lanes[f.source];
      const pp = wfPill(R, i, t);
      const laneX = PANEL.x + PANEL.w - 18 - ln * 11, busY = 356 + ln * 11, rowY = pp.y + 16;
      const pts = [m.dotAt, [m.dotAt[0] + 10, m.dotAt[1]], [m.dotAt[0] + 10, busY], [laneX, busY], [laneX, rowY], [pp.x + pp.w + 3, rowY]];
      setLine(L, pathL(pts, 12), plen(pts), ease.inOutSine(prog(t, a, a + S3.threads)), 0.95 * thrOut);
    });

    // ---- the page: a fact's thread back to its source, and the tag's line to a brief item
    const toS = (p) => toScreen(c, [p[0], p[1] - sc]);
    const th = LEARNED.threads.find(([a, b]) => t >= a + 0.2 && t < b);
    if (th) {
      const [a, b, fi] = th;
      const f = P.facts[fi];
      const ch = chipRect(srcIndex[learned.facts[fi].source]);
      const gapX = (f.r.x + f.r.w + BRIEF.x) / 2, laneY = ch.y + ch.h + 13;
      const pts = [[f.r.x + f.r.w + 4, f.r.y + f.r.h / 2], [gapX, f.r.y + f.r.h / 2], [gapX, laneY], [ch.x + ch.w / 2, laneY]].map(toS);
      const q = [pts[0], pts[pts.length - 1], pts[pts.length - 1], pts[pts.length - 1]];
      const d = pathL(pts, 16);
      const len = plen(pts);
      const k = ease.inOutSine(prog(t, a + 0.25, a + 0.8));
      const o = 1 - prog(t, b - 0.3, b);
      setLine(lines.page, d, len, k, o);
      lines.pageDot.style.display = k > 0.98 ? "" : "none";
      lines.pageDot.setAttribute("cx", f1(q[3][0])); lines.pageDot.setAttribute("cy", f1(q[3][1]));
      lines.pageDot.setAttribute("opacity", o.toFixed(3));
    } else { setLine(lines.page, "", 1, 0, 0); lines.pageDot.style.display = "none"; }
    const bi = BRIEFT.items.findIndex((a) => t >= a && t < a + 1.3);
    if (bi >= 0) {
      const a = BRIEFT.items[bi];
      const bl = briefLayout(P, t);
      const it = bl.items[bi];
      const ex = toS([BRIEF.x - 20, 0])[0];
      const iy = toS([0, BRIEF.y + it.y + it.h / 2])[1];
      const ix = toS([BRIEF.x + 18, 0])[0];
      const sy = box.top + (box.bottom - box.top) * 0.5;
      const pts = [[box.x0 + 10, sy], [ex, sy], [ex, iy], [ix, iy]];
      setLine(lines.brief, pathL(pts, 18), plen(pts), ease.outCubic(prog(t, a, a + 0.35)), 1 - prog(t, a + 1.05, a + 1.3));
    } else setLine(lines.brief, "", 1, 0, 0);

    // ---- the rules: a veil over the page, the rules on the back of the tag, a calm label
    const vk = Math.min(ease.inOutSine(prog(t, RULES.veil[0], RULES.veil[1])), 1 - prog(t, RET.cut[0], RET.cut[0] + 0.45));
    put(veil, vk);
    const s1 = RULES.spot.s;
    const cw = RULES.card.w * s1, chh = RULES.card.h * s1;
    const top = RULES.spot.feet - LEG * s1 - chh;
    rulesBox.style.left = `${f1(RULES.spot.x - cw / 2)}px`; rulesBox.style.top = `${f1(top)}px`;
    rulesBox.style.width = `${f1(cw)}px`; rulesBox.style.height = `${f1(chh)}px`;
    const rOut = 1 - prog(t, RULES.back[0] - 0.2, RULES.back[0] + 0.05);
    put(rulesBox, t > RULES.head - 0.1 && t < RULES.back[0] + 0.1 ? 1 : 0);
    put(rulesHead, ease.outCubic(prog(t, RULES.head, RULES.head + 0.3)) * rOut);
    ruleEls.forEach((e, i) => {
      const k = ease.outCubic(prog(t, RULES.first + i * RULES.step, RULES.first + i * RULES.step + 0.35));
      put(e, k * rOut, `translateY(${((1 - k) * 14).toFixed(1)}px)`);
    });
    const lk = ease.outCubic(prog(t, RULES.label[0], RULES.label[1])) * (1 - prog(t, RET.cut[0], RET.cut[0] + 0.25));
    calm.style.top = `${RULES.spot.feet - 60}px`;
    put(calm, lk, `translateY(${((1 - lk) * 10).toFixed(1)}px)`);

    // ---- the next day: a small note while it sleeps
    const dk = Math.min(ease.outCubic(prog(t, RET.note[0], RET.note[1])), 1 - prog(t, RET.zoomOut[0] + 0.2, RET.zoomOut[0] + 0.6));
    day.style.left = "64px"; day.style.top = "52px";
    put(day, dk, `translateY(${((1 - dk) * -10).toFixed(1)}px)`);

    // ---- the pointer
    const [px, py] = pointerAt(t);
    let po = 0;
    for (const [a, b, c2, d2] of PTR.vis) po = Math.max(po, Math.min(prog(t, a, b), 1 - prog(t, c2, d2)));
    let down = 0;
    for (const ck of PTR.clicks) down = Math.max(down, 1 - Math.abs(t - ck) / 0.1);
    ptr.at(px, py, down, po);

    // ---- his kind of caption: a small kicker before the words
    if (!capEl) capEl = document.querySelector(".cap");
    if (capEl) {
      const cap = CAPTIONS.find((x) => t >= x.at && t < x.to);
      const k = cap ? cap.kicker : "";
      if (capEl.getAttribute("data-k") !== k) capEl.setAttribute("data-k", k);
    }
  },
};
