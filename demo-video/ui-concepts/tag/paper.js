// Tag: the calm paper page. The rail (with the tag's home at its foot), the landing ("Hello,
// Ram."), and the product page: the sources line, What I learned, the brief and Ask your Peer.
// Built once in page px; render(t) sets every moving style from t.
import { el } from "../shared/kit.js";
import { page, person, learned, brief, ask, sources, sourceById } from "../shared/data.js";
import { icons, sourceIcon } from "../shared/icons.js";
import { X, GAVE, shortName } from "./data-extra.js";
import { RAIL_W, SPOT, HERO, HEAD, CHIPS, LEARN, BRIEF, ASKP, CLICK, ROOM_IN, MORPH, LEARNED, BRIEFT, ASK, RET, S4 } from "./tl.js";
import { put, css, txt, cls, tr, io, win, pop, wob, prog, clamp, lerp, ease } from "./u.js";

const at = (e, x, y, w, h) => {
  e.style.left = `${x}px`; e.style.top = `${y}px`;
  if (w != null) e.style.width = `${w}px`;
  if (h != null) e.style.height = `${h}px`;
  return e;
};

export function chipRect(i) {
  const w = (CHIPS.w - CHIPS.gap * 5) / 6;
  return { x: CHIPS.x + i * (w + CHIPS.gap), y: CHIPS.y, w, h: CHIPS.h };
}
export const factRect = (i) => ({ x: LEARN.x, y: LEARN.factY + i * LEARN.row, w: LEARN.w, h: LEARN.row });

export function buildPaper(parent) {
  const P = {};
  P.layer = el("div", "tg-layer", parent);
  P.bg = el("div", "tg-pagebg", P.layer);
  P.main = el("div", "tg-layer", P.layer);              // scrolls
  P.railEl = el("div", "tg-layer", P.layer);            // fixed beside the scroll

  // ---- the rail
  const rail = el("div", "tg-rail", P.railEl);
  P.rail = rail;
  el("div", "tg-logo", P.railEl, page.product);
  el("div", "tg-logo-sub", P.railEl, X.railSub);
  const nav = el("div", "tg-nav", P.railEl);
  const navIcons = [icons.spark, icons.book, icons.home, icons.ask, icons.shield];
  P.nav = page.nav.map((n, i) => el("div", "tg-nav-i", nav, `${navIcons[i]}${n}`));
  P.spot = at(el("div", "tg-spot", P.railEl), SPOT.x, SPOT.y, SPOT.w, SPOT.h);
  P.spotT = el("span", "", P.spot, X.spotAway);
  P.railLine = at(el("div", "tg-railline", P.railEl), 0, SPOT.y + SPOT.h + 22);
  P.railLine.textContent = X.railLine;

  // ---- the landing
  const H = (P.hero = {});
  H.k = at(el("div", "tg-hero-k", P.main), HERO.x + 2, HERO.kickerY);
  H.k.textContent = page.signedIn;
  H.hello = at(el("div", "tg-hello", P.main), HERO.x - 6, HERO.helloY);
  H.hello.textContent = "Hello, Ram.";
  H.lead = at(el("div", "tg-lead", P.main), HERO.x, HERO.leadY);
  H.lead.textContent = page.lead;
  H.btn = at(el("div", "tg-btn", P.main), HERO.btn.x, HERO.btn.y, HERO.btn.w, HERO.btn.h);
  H.btn.innerHTML = `${page.button}<i>&rarr;</i>`;
  H.ripple = at(el("div", "tg-ripple", P.main), HERO.btn.x, HERO.btn.y, HERO.btn.w, HERO.btn.h);
  H.forgot = at(el("div", "tg-forgot", P.main), HERO.btn.x + 4, HERO.btn.y + HERO.btn.h + 34);
  H.forgot.textContent = X.forgotten;

  // ---- the product page: header
  P.head = at(el("div", "tg-head", P.main), 400, HEAD.y);
  el("b", "", P.head, page.hello);
  P.headSub = el("span", "", P.head, X.updated);
  P.hbtns = [];
  let bx = 1860;
  [...X.buttons].reverse().forEach((label) => {
    const b = el("div", "tg-hbtn", P.main, label);
    P.hbtns.unshift(b);
    b._label = label;
  });
  P._placeHbtns = () => {
    let x = 1860;
    for (let i = P.hbtns.length - 1; i >= 0; i--) {
      const b = P.hbtns[i];
      const w = b.getBoundingClientRect().width;
      x -= w;
      at(b, x, HEAD.btnY);
      b._rect = { x, y: HEAD.btnY, w, h: HEAD.btnH };
      x -= 12;
    }
  };

  // ---- the sources line
  P.chips = sources.map((s, i) => {
    const r = chipRect(i);
    const c = at(el("div", "tg-chip", P.main), r.x, r.y, r.w, r.h);
    el("div", "tg-chip-n", c, `${s.short}<em>&#10003;</em>`);
    el("div", "tg-chip-s", c, GAVE[s.id].count);
    el("div", "tg-chip-k", c, GAVE[s.id].key);
    const ring = at(el("div", "tg-ring", P.main), r.x - 3, r.y - 3, r.w + 6, r.h + 6);
    return { id: s.id, el: c, ring, r };
  });

  // ---- What I learned
  P.lh = at(el("div", "tg-lh", P.main), LEARN.x, LEARN.headY);
  el("b", "", P.lh, "What I learned");
  el("span", "", P.lh, learned.asOf);
  P.sum = at(el("div", "tg-sum", P.main), LEARN.x, LEARN.sumY, LEARN.w);
  P.sum.textContent = learned.summary;
  P.tags = at(el("div", "tg-tags", P.main), LEARN.x, LEARN.tagsY);
  learned.tags.forEach((g) => el("div", "tg-tag", P.tags, g));
  P.facts = learned.facts.map((f, i) => {
    const r = factRect(i);
    const row = at(el("div", "tg-fact", P.main), r.x, r.y, r.w, r.h);
    const hl = el("div", "tg-fact-hl", row);
    el("div", "tg-fact-n", row, String(i + 1).padStart(2, "0"));
    el("div", "tg-fact-t", row, f.title);
    const pill = el("div", "tg-pill", row, `${shortName[f.source]} · ${f.date}`);
    const popEl = el("div", "tg-pop", P.main, `${icons.link}${sourceById[f.source].name} · ${f.ref} · ${f.date}`);
    return { el: row, hl, pill, pop: popEl, r, f };
  });

  // ---- the brief
  const B = (P.brief = {});
  B.el = at(el("div", "tg-brief", P.main), BRIEF.x, BRIEF.y, BRIEF.w);
  B.head = el("div", "tg-brief-h", B.el, X.briefHead);
  B.lead = el("div", "tg-brief-l", B.el, brief.lead);
  B.items = brief.items.map((it) => {
    const e = el("div", "tg-bi", B.el);
    el("div", "tg-bi-t", e, it.title);
    const next = el("div", "tg-bi-n", e, `<b>${X.next.replace(":", "")}</b><span>${it.next}</span>`);
    const p = el("div", "tg-bi-p", e, `<div class="tg-pill">${shortName[it.source]} · ${it.date}</div><span>${it.ref}</span>`);
    return { el: e, next, p, it };
  });

  // ---- ask your Peer
  const A = (P.ask = {});
  A.h = at(el("div", "tg-ah", P.main), ASKP.input.x, ASKP.headY);
  A.h.textContent = page.nav[3];
  const I = ASKP.input;
  A.input = at(el("div", "tg-input", P.main), I.x, I.y, I.w, I.h);
  A.ph = el("div", "tg-input-p", A.input, X.placeholder);
  A.typed = el("div", "tg-input-t", A.input);
  A.caret = el("div", "tg-caret", A.input);
  const Bn = ASKP.btn;
  A.btn = at(el("div", "tg-askbtn", P.main), Bn.x, Bn.y, Bn.w, Bn.h);
  A.btn.textContent = X.askBtn;
  A.exs = at(el("div", "tg-exs", P.main), I.x, ASKP.exY);
  A.ex = ask.examples.map((q) => el("div", "tg-ex", A.exs, q));
  const R = ASKP.answer;
  A.card = at(el("div", "tg-ans", P.main), R.x, R.y, R.w, R.h);
  A.think = el("div", "tg-think", A.card, `<b>${X.thinking}</b><span>${X.thinkingSub}</span>`);
  A.thinkB = A.think.querySelector("b");
  A.thinkC = el("div", "tg-think-c", A.think);
  A.tchips = ask.sources.map((s) => {
    const c = el("div", "tg-tc", A.thinkC, `<span class="tg-tc-i">${sourceIcon(s.source)}</span>${s.ref}`);
    return { el: c, icon: c.querySelector(".tg-tc-i") };
  });
  A.head = el("div", "tg-ans-h", A.card, X.answerHead);
  A.text = el("div", "tg-ans-t", A.card);
  A.conf = el("div", "tg-conf", A.card);
  el("b", "", A.conf, X.confidence);
  const bar = el("div", "tg-bar", A.conf);
  A.barF = el("i", "", bar);
  A.hi = el("span", "tg-hi", A.conf, X.confLevel);
  A.stamp = el("div", "tg-stamp", A.conf, ask.asOf);
  el("span", "tg-srcl", A.conf, X.sourcesLabel);
  A.srcs = ask.sources.map((s) => el("div", "tg-pill", A.conf, s.ref));
  A.full = ask.answer.map((a) => a.text).join(" ");

  return P;
}

// Measure what depends on laid-out text (call in init, at rest).
export function measurePaper(P) {
  P._placeHbtns();
  const B = P.brief;
  B.items.forEach((b) => {
    b.next.style.display = "none";
    b.h0 = b.el.offsetHeight;
    b.next.style.display = "";
    b.h1 = b.el.offsetHeight;
  });
  B.leadH = B.lead.offsetHeight;
  P.facts.forEach((f) => {
    const pr = f.pill.getBoundingClientRect();
    f.pillX = pr.left; f.pillW = pr.width;
    f.popW = f.pop.getBoundingClientRect().width;
  });
  // The caret's place after each typed character.
  const A = P.ask;
  A.typed.textContent = ask.question;
  A.qW = A.typed.getBoundingClientRect().width;
  A.typed.textContent = "";
  return P;
}

// The brief card's layout at t: item tops and heights, and the card's height (page px).
export function briefLayout(P, t) {
  const B = P.brief;
  const top = 52 + B.leadH + 20;
  let y = top;
  const items = B.items.map((b, i) => {
    const k = ease.inOutCubic(prog(t, BRIEFT.items[i], BRIEFT.items[i] + 0.5));
    const h = lerp(b.h0, b.h1, k);
    const r = { y, h, k };
    y += h + 10;
    return r;
  });
  return { items, h: y - 10 + 20 };
}

// The page's paper and rail: there for the landing, gone in the room, back as setup ends.
export const pageBgK = (t) => (t < 15 ? 1 - ease.inOutCubic(prog(t, ROOM_IN[0], ROOM_IN[1] - 0.1)) : ease.inOutCubic(prog(t, MORPH[0], MORPH[1] - 0.1)));
// Forget clears the page piece by piece: k for a piece that starts clearing at `d` after forget.
const clearK = (t, d) => 1 - ease.inOutCubic(prog(t, RET.clear[0] + d, RET.clear[0] + d + 0.42));
// In with the page at the morph (header, What I learned), d seconds late.
const morphIn = (t, d) => ease.outCubic(prog(t, MORPH[0] + 0.12 + d, MORPH[1] - 0.12 + d));
// The sources line arrives in step 4 (the room's cards compact into it); the brief rises in step 4.
export const chipsK = (t) => ease.inOutCubic(prog(t, S4.compact[0] + 0.12, S4.compact[1] + 0.08));
export const briefRise = (t) => ease.outBack(prog(t, S4.briefIn[0], S4.briefIn[1]), 1.15);

export function renderPaper(P, t, S) {
  // S: { scroll, active (nav index), chipRing(i), factHl(i), factPop(i), briefAct(i), tagAway }
  css(P.main, "transform", `translateY(${(-S.scroll).toFixed(1)}px)`);
  const bg = pageBgK(t);
  put(P.bg, bg);
  // The rail slides away with the landing and back in at the morph.
  const railX = t < 15 ? -60 * (1 - bg) : -340 * (1 - ease.outCubic(prog(t, MORPH[0] + 0.1, MORPH[1])));
  put(P.railEl, t < 15 ? bg : ease.outCubic(prog(t, MORPH[0] + 0.1, MORPH[1] - 0.2)), tr(railX, 0));

  // ---- rail
  P.nav.forEach((n, i) => cls(n, "on", i === S.active));
  put(P.spotT, S.tagAway ? 1 : 0);

  // ---- the landing hero: out as the room comes in, back after the erase.
  const H = P.hero;
  const early = t < 30;
  const heroOut = ease.inOutCubic(prog(t, ROOM_IN[0] - 0.05, ROOM_IN[0] + 0.4));
  [H.k, H.hello, H.lead].forEach((e, i) => {
    const k = early ? 1 - heroOut : ease.outCubic(prog(t, RET.heroIn[0] + i * 0.1, RET.heroIn[1] + i * 0.1));
    put(e, k, tr(0, (1 - k) * (early ? -12 : 24)));
  });
  const press = Math.max(0, 1 - Math.abs(t - CLICK - 0.03) / 0.09);
  const bs = 1 - 0.045 * press + wob(t, CLICK + 0.1, 0.03, 3.4, 8);
  const bk = early ? 1 - heroOut : ease.outCubic(prog(t, RET.heroIn[0] + 0.3, RET.heroIn[1] + 0.3));
  put(H.btn, bk, `translateY(${((1 - bk) * (early ? -12 : 24)).toFixed(1)}px) scale(${bs.toFixed(4)})`);
  const rk = prog(t, CLICK, CLICK + 0.55);
  put(H.ripple, t > CLICK && rk < 1 ? (1 - rk) * 0.9 : 0, `scale(${(1 + rk * 0.22).toFixed(3)}, ${(1 + rk * 0.7).toFixed(3)})`);
  const fk = ease.outCubic(prog(t, RET.heroIn[1] - 0.1, RET.heroIn[1] + 0.45));
  put(H.forgot, early ? 0 : fk, tr(0, (1 - fk) * 10));

  // ---- header
  const hk = Math.min(morphIn(t, 0.1), clearK(t, 0.32));
  put(P.head, hk, tr(0, (1 - morphIn(t, 0.1)) * -14));
  txt(P.headSub, t >= RET.restack[0] ? X.updatedNext : X.updated);
  P.hbtns.forEach((b, i) => {
    const pressed = i === 0 ? Math.max(0, 1 - Math.abs(t - RET.refresh) / 0.09) : i === 2 ? Math.max(0, 1 - Math.abs(t - RET.forget) / 0.09) : 0;
    put(b, Math.min(morphIn(t, 0.15 + i * 0.05), clearK(t, 0.35)), `scale(${(1 - 0.06 * pressed).toFixed(3)})`);
  });

  // ---- the sources line, with rings for its sweeps
  const ck = chipsK(t);
  P.chips.forEach((c, i) => {
    const k = Math.min(ck, clearK(t, 0.16 + i * 0.03));
    put(c.el, k, tr(0, (1 - ck) * 26 + (1 - clearK(t, 0.16 + i * 0.03)) * 12, 0.94 + 0.06 * ck));
    const ring = S.chipRing(i);
    put(c.ring, ring, `scale(${(1 + 0.05 * (1 - ring)).toFixed(3)})`);
  });

  // ---- What I learned
  const lk = Math.min(morphIn(t, 0.2), clearK(t, 0.0));
  put(P.lh, lk, tr(0, (1 - lk) * 16));
  const sk = Math.min(morphIn(t, 0.3), clearK(t, 0.03));
  put(P.sum, sk, tr(0, (1 - sk) * 16));
  const gk = Math.min(morphIn(t, 0.38), clearK(t, 0.06));
  put(P.tags, gk, tr(0, (1 - gk) * 16));
  P.facts.forEach((f, i) => {
    const k = Math.min(morphIn(t, 0.32 + i * 0.05), clearK(t, 0.06 + i * 0.03));
    put(f.el, k, tr(0, (1 - k) * 18));
    const hl = S.factHl(i);
    put(f.hl, hl, `scaleX(${(0.96 + 0.04 * hl).toFixed(3)})`);
    const pk = S.factPop(i);
    const px = f.r.x + f.r.w - f.popW + 6, py = f.r.y - 46;
    put(f.pop, pk, tr(px, py + (1 - clamp(pk)) * 8, 0.86 + 0.14 * ease.outBack(clamp(pk))));
  });

  // ---- the brief: rises in step 4, the tag on its top edge; items drop in, then open their next steps.
  const B = P.brief;
  const bl = briefLayout(P, t);
  const rise = briefRise(t);
  const clr = clearK(t, 0.46);
  css(B.el, "height", `${bl.h.toFixed(1)}px`);
  put(B.el, Math.min(clamp(rise * 3), clr), tr(0, (1 - rise) * 560 + (1 - clr) * 20));
  txt(B.head, t >= RET.restack[0] ? X.briefHeadNext : X.briefHead);
  // The lead is written word by word.
  const words = brief.lead.split(" ");
  const nw = Math.floor(clamp(prog(t, S4.lead[0], S4.lead[1])) * words.length + 1e-6);
  const leadText = t >= S4.lead[1] ? brief.lead : words.slice(0, nw).join(" ");
  txt(B.lead, leadText);
  B.items.forEach((b, i) => {
    const r = bl.items[i];
    css(b.el, "top", `${r.y.toFixed(1)}px`);
    css(b.el, "height", `${r.h.toFixed(1)}px`);
    put(b.next, r.k > 0.02 ? ease.outCubic(prog(t, BRIEFT.items[i] + 0.15, BRIEFT.items[i] + 0.5)) : 0);
    const act = S.briefAct(i);
    css(b.el, "borderColor", act > 0.5 ? "#d9a54c" : "");
    css(b.el, "background", act > 0.5 ? "#fbf1db" : "");
    css(b.el, "borderStyle", act > 0.5 ? "solid" : "");
    const drop = ease.outBack(prog(t, S4.items[i], S4.items[i] + 0.38), 1.6);
    const rf = win(t, RET.restack[0] + i * 0.1, RET.restack[0] + i * 0.1 + 0.4, 0.15, 0.25);
    put(b.el, clamp(prog(t, S4.items[i], S4.items[i] + 0.15)), tr(rf * 6, (1 - drop) * -34));
  });

  // ---- ask your Peer
  const A = P.ask;
  const q = ask.question;
  const n = Math.max(0, Math.min(q.length, Math.floor((t - ASK.type) * ASK.cps)));
  txt(A.typed, q.slice(0, n));
  put(A.ph, n === 0 && t < ASK.click + 0.05 ? 1 : 0);
  const focused = t >= ASK.click && t < ASK.askClick + 0.1;
  const blinkOn = n >= q.length ? Math.floor((t - ASK.type) * 2.2) % 2 === 0 : true;
  put(A.caret, focused && blinkOn ? 1 : 0);
  css(A.input, "borderColor", focused ? "#7fa892" : "");
  css(A.input, "boxShadow", focused ? "0 0 0 5px rgba(31, 91, 67, 0.12)" : "");
  const ap = Math.max(0, 1 - Math.abs(t - ASK.askClick) / 0.09);
  put(A.btn, 1, `scale(${(1 - 0.06 * ap + wob(t, ASK.askClick + 0.08, 0.025, 3.5, 9)).toFixed(4)})`);
  const cardK = ease.outCubic(prog(t, ASK.think[0], ASK.think[0] + 0.4));
  const stampHit = wob(t, ASK.stamp, 3.5, 6, 11);
  put(A.card, cardK, tr(0, (1 - cardK) * 22 + stampHit * 0.6));
  const thinkK = 1 - ease.inOutCubic(prog(t, ASK.think[1] - 0.15, ASK.think[1] + 0.15));
  put(A.think, thinkK);
  const dots = ".".repeat(1 + (Math.max(0, Math.floor((t - ASK.think[0]) * 4)) % 3));
  txt(A.thinkB, X.thinking + dots);
  A.tchips.forEach((c, i) => {
    const k = pop(t, ASK.chips[i], 0.3);
    put(c.el, k, tr(0, (1 - clamp(k)) * 10, 0.9 + 0.1 * k));
    const done = t > ASK.chips[i] + 0.38;
    if (c._done !== done) { c.icon.innerHTML = done ? icons.check : sourceIcon(ask.sources[i].source); c._done = done; }
  });
  const ansK = ease.outCubic(prog(t, ASK.answer - 0.1, ASK.answer + 0.25));
  put(A.head, ansK);
  const nn = Math.max(0, Math.min(A.full.length, Math.floor((t - ASK.answer) * ASK.cps2)));
  let shown = A.full.slice(0, nn);
  if (nn < A.full.length) { const sp = shown.lastIndexOf(" "); shown = sp > 0 ? shown.slice(0, sp) : ""; }
  txt(A.text, shown);
  put(A.text, ansK);
  const ck2 = ease.outCubic(prog(t, ASK.conf[0] - 0.25, ASK.conf[0] + 0.1));
  put(A.conf, ck2, tr(0, (1 - ck2) * 10));
  css(A.barF, "width", `${(92 * ease.outCubic(prog(t, ASK.conf[0], ASK.conf[1]))).toFixed(1)}%`);
  put(A.hi, ease.outCubic(prog(t, ASK.conf[1] - 0.15, ASK.conf[1] + 0.1)));
  const sk2 = prog(t, ASK.stamp - 0.16, ASK.stamp);
  const sScale = t < ASK.stamp ? 1.9 - 0.9 * ease.inCubic(sk2) : 1 + wob(t, ASK.stamp, 0.06, 5, 12);
  put(A.stamp, t < ASK.stamp - 0.16 ? 0 : clamp(sk2 * 1.6), `scale(${sScale.toFixed(3)}) rotate(-3deg)`);
  A.srcs.forEach((e, i) => {
    const k = pop(t, ASK.srcs + i * 0.1, 0.32);
    put(e, k, tr(0, (1 - clamp(k)) * 8, 0.85 + 0.15 * k));
  });
}
