// The pages of the notebook, the clippings, the rubber stamps and the setup card. A page builder runs
// live once (its parts animate from t) and again for every strip of a turning leaf (a still copy:
// each part simply shows once it exists). Positions are in page pixels (640 x 820).
import { el, clamp, prog, ease, spring, rng } from "../shared/kit.js";
import { person, peer, page, sourceById, reads, steps, learned, brief, ask, rules, captionWords } from "../shared/data.js";
import { icons, sourceIcon } from "../shared/icons.js";
import { PW, PH, BO, css } from "./book.js";
import { SRC, STEP_START, STEP_DONE, LEARN, BRIEF, ASK, RULES, SRC_ORDER } from "./tl.js";
import { ink, para, LINES } from "./ink.js";

export const STAMPS = [];      // impact times: the camera feels each stamp land
export const HOOKS = {};       // live parts the scene needs (stickers, the footnote that opens, ...)
export const ANIMS = {};       // page id -> render functions of its live parts

const hue = (id) => sourceById[id].hue;
const nm = (id) => sourceById[id].name;
const AS = `as ${person.login}`;
const seedOf = (s) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);
let mc = null;
function textW(s, font, ls = 0) {
  if (!mc) mc = document.createElement("canvas").getContext("2d");
  mc.font = font;
  mc.letterSpacing = `${ls}px`;
  return mc.measureText(s).width;
}

function anim(ctx, fn) {
  if (!ctx.live) return;
  (ANIMS[ctx.page] = ANIMS[ctx.page] || []).push(fn);
}
function timed(ctx, e, vis) { if (!ctx.live) ctx.timed.push([e, vis]); }

// Torn or cut paper edges, as a clip-path polygon (seeded, so it never wobbles).
function tornPoly(w, h, seed, edges) {
  const r = rng(seed);
  const pts = [];
  const side = (x0, y0, x1, y1, torn, nx, ny) => {
    const len = Math.hypot(x1 - x0, y1 - y0);
    const n = Math.max(2, Math.round(len / (torn ? 6 : 34)));
    for (let i = 0; i < n; i++) {
      const k = i / n;
      const j = torn ? 1.2 + r() * 4.8 : r() * 0.9;
      pts.push([x0 + (x1 - x0) * k + nx * j, y0 + (y1 - y0) * k + ny * j]);
    }
  };
  side(0, 0, w, 0, edges.includes("t"), 0, 1);
  side(w, 0, w, h, edges.includes("r"), -1, 0);
  side(w, h, 0, h, edges.includes("b"), 0, -1);
  side(0, h, 0, 0, edges.includes("l"), 1, 0);
  return `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(",")})`;
}
function tapeEnds(w, h, seed) {
  const r = rng(seed);
  const pts = [];
  const teeth = 5;
  pts.push([3 + r() * 3, 0], [w - 3 - r() * 3, 0]);
  for (let i = 1; i < teeth; i++) pts.push([w - (i % 2 ? 0 : 4 + r() * 3), (h * i) / teeth]);
  pts.push([w - 3 - r() * 3, h], [3 + r() * 3, h]);
  for (let i = teeth - 1; i > 0; i--) pts.push([i % 2 ? 0 : 4 + r() * 3, (h * i) / teeth]);
  return `polygon(${pts.map(([x, y]) => `${x.toFixed(1)}px ${y.toFixed(1)}px`).join(",")})`;
}

// Washi tape, pressed on at `at`.
function tape(ctx, parent, x, y, w, rot, color, at, seed) {
  const tp = el("div", "tape", parent);
  tp.style.cssText = `left:${x}px;top:${y}px;width:${w}px;--tc:${color};`;
  tp.style.clipPath = tapeEnds(w, 30, seed);
  if (!ctx.live) { tp.style.transform = `rotate(${rot}deg)`; timed(ctx, tp, (t) => t >= at); return tp; }
  anim(ctx, (t) => {
    if (t < at) { css(tp, "visibility", "hidden"); return; }
    css(tp, "visibility", "visible");
    const k = ease.outCubic(prog(t, at, at + 0.16));
    css(tp, "transform", `rotate(${rot}deg) scale(${(0.35 + 0.65 * k).toFixed(3)}, ${(1.25 - 0.25 * k).toFixed(3)})`);
    css(tp, "opacity", (0.3 + 0.7 * k).toFixed(3));
  });
  return tp;
}

const SHADOW_LANDED = "drop-shadow(1.2px 2px 1.6px rgba(48,30,12,.26)) drop-shadow(5px 9px 12px rgba(48,30,12,.12))";
function shadowAir(h) {
  return `drop-shadow(${(1.2 + 14 * h).toFixed(1)}px ${(2 + 22 * h).toFixed(1)}px ${(1.6 + 16 * h).toFixed(1)}px rgba(48,30,12,${(0.26 - 0.1 * h).toFixed(3)})) drop-shadow(${(5 + 12 * h).toFixed(1)}px ${(9 + 18 * h).toFixed(1)}px ${(12 + 18 * h).toFixed(1)}px rgba(48,30,12,.12))`;
}

// The clippings, as real-looking mini pages of each source (made-up data).
const CLIPS = {
  directory: () => `
    <div class="ck-band" style="--h:${hue("directory")}">${icons.directory}<b>${nm("directory")}</b><i>read ${AS}</i></div>
    <div class="ck-id"><div class="ck-av">R</div><div class="ck-who"><b>${person.first}</b><span class="hlw">${person.role}</span></div></div>
    <div class="ck-meta">${person.team} · ${person.org} · ${person.city}</div>
    <div class="ck-meta">Reports to ${person.manager}</div>`,
  docs: () => `
    <div class="ck-band" style="--h:${hue("docs")}">${icons.docs}<b>${nm("docs")}</b><i>searched ${AS}</i></div>
    ${reads.docs.map((d, i) => `<div class="ck-doc"><b${i === 0 ? ' class="hlw"' : ""}>${d.title}</b><span>${d.sub}</span></div>`).join("")}`,
  slack: () => `
    <div class="ck-band" style="--h:${hue("slack")}">${icons.slack}<b>${nm("slack")}</b><i>read ${AS}</i></div>
    ${reads.slack.map((m, i) => `<div class="ck-msg"><div class="ck-av s">${m.who[0]}</div><div class="ck-mb"><div class="ck-mh"><b>${m.who}</b>${m.where} · ${m.when}</div><div class="ck-mt"><span class="${i === 0 ? "hlw" : "hlw fl"}"${i === 1 ? ' data-fl="0"' : i === 2 ? ' data-fl="1"' : ""}>${m.text}</span></div></div></div>`).join("")}`,
  code: () => `
    <div class="ck-band" style="--h:${hue("code")}">${icons.code}<b>${nm("code")}</b><i>read ${AS}</i></div>
    <div class="ck-pr"><span class="hlw fl" data-fl="3">${reads.code[0].title}</span></div>
    <div class="ck-sub">${reads.code[0].sub}</div>
    <div class="ck-diff"><div class="m">-  retries = RETRY_MAX</div><div class="p">+  retries = limitFor(market)</div></div>
    <div class="ck-pr2">${reads.code[1].title}<em> · merged · Nov 9</em></div>`,
  tickets: () => `
    <div class="ck-band" style="--h:${hue("tickets")}">${icons.tickets}<b>${nm("tickets")}</b><i>read ${AS}</i></div>
    <div class="ck-tk"><span class="hlw">${reads.tickets[0].title}</span></div>
    <div class="ck-sub">${reads.tickets[0].sub}</div>
    <div class="ck-tk2">${reads.tickets[1].title}</div>`,
  mail: () => `
    <svg class="ck-flap" viewBox="0 0 262 160" preserveAspectRatio="none"><path d="M2 2 L131 70 L260 2" fill="none" stroke="rgba(120,90,80,.22)" stroke-width="1.5"/></svg>
    <div class="ck-band" style="--h:${hue("mail")}">${icons.mail}<b>${nm("mail")}</b><i>read ${AS}</i></div>
    <div class="ck-from">${reads.mail[0].who} · ${reads.mail[0].when}</div>
    <div class="ck-subj"><span class="hlw fl" data-fl="2">${reads.mail[0].title}</span></div>
    <div class="ck-sub">${reads.mail[1].who} · ${reads.mail[1].title}</div>
    <svg class="ck-pm" viewBox="0 0 80 80"><circle cx="40" cy="40" r="34" fill="none" stroke="currentColor" stroke-width="2.4"/><circle cx="40" cy="40" r="25" fill="none" stroke="currentColor" stroke-width="1.2"/><text x="40" y="37" text-anchor="middle">READ AS</text><text x="40" y="51" text-anchor="middle">${person.login.toUpperCase()}</text></svg>`,
};

// A clipping: flies in, lands with a settle, gets taped down; its key line is highlighted.
// o: { key, x, y, w, h, rot, from: [dx, dy, drot], tapes: [[x, y, w, rot]], edges, seal }
function clipping(ctx, parent, o) {
  const S = SRC[o.key];
  const wrap = el("div", `cl cl-${o.key}`, parent);
  wrap.style.cssText = `left:${o.x}px;top:${o.y}px;width:${o.w}px;height:${o.h}px;`;
  const paper = el("div", "cl-p", wrap);
  paper.style.clipPath = tornPoly(o.w, o.h, seedOf(o.key), o.edges || "t");
  el("div", "cl-c", paper, CLIPS[o.key]());
  const hls = [...paper.querySelectorAll(".hlw")];
  // a clone is the still copy at its final state: setup's highlight shown, flashes not
  const flHide = (h, i) => i > 0 && h.dataset.fl != null;
  let seal = null, stk = null, slip = null;
  if (o.seal) {
    seal = el("div", "seal", paper, `<div class="seal-t">${icons.lock}<span>Sealed. Connect<br/>to open it</span></div>`);
    stk = el("div", "stk", wrap, `${icons.lock}<b>Connect</b>`);
    stk.style.setProperty("--h", hue(o.key));
    stk.style.left = `${o.w / 2 - 62}px`;
    stk.style.top = `${o.h / 2 - 34}px`;
    if (o.slip) slip = el("div", "slip", wrap, `${icons.key}<span><b>Connected as ${person.login}</b>read-only</span>`);
  }
  const tapes = (o.tapes || []).map(([x, y, w, r], i) => tape(ctx, wrap, x, y, w, r, hue(o.key), S.tape + i * 0.07, seedOf(o.key) + i));
  if (!ctx.live) {
    wrap.style.transform = `rotate(${o.rot}deg)`;
    wrap.style.filter = SHADOW_LANDED;
    timed(ctx, wrap, (t) => t >= S.in[1]);
    hls.forEach((h, i) => {
      h.style.backgroundSize = "100% 78%";
      if (flHide(h, i)) ctx.timed.push([h, (t) => t >= ASK.flash[Number(h.dataset.fl)], "backgroundSize", "100% 78%", "0% 78%"]);
    });
    if (seal) { timed(ctx, seal, (t) => t < S.open[0]); timed(ctx, stk, (t) => t < S.open[0]); }
    if (slip) slip.style.display = "none";
    return wrap;
  }
  HOOKS[`clip.${o.key}`] = wrap;
  if (stk) HOOKS[`stk.${o.key}`] = stk;
  const fl = hls.filter((h) => h.dataset.fl != null);
  anim(ctx, (t) => {
    if (t < S.in[0]) { css(wrap, "visibility", "hidden"); return; }
    css(wrap, "visibility", "visible");
    const k = prog(t, S.in[0], S.in[1]);
    const e = ease.outCubic(k);
    const air = 1 - ease.inOutQuad(k);
    const settle = t > S.in[1] ? 1 - spring(t, S.in[1], 3.4, 0.42) : 0;
    const [fx, fy, fr] = o.from;
    const dx = fx * (1 - e), dy = fy * (1 - e) - Math.sin(Math.PI * k) * 46;
    const r = o.rot + fr * (1 - e) + settle * 1.6;
    const s = 1 + 0.09 * air - settle * 0.012;
    css(wrap, "transform", `translate(${dx.toFixed(1)}px, ${dy.toFixed(1)}px) rotate(${r.toFixed(2)}deg) scale(${s.toFixed(4)})`);
    css(wrap, "filter", k >= 1 ? SHADOW_LANDED : shadowAir(air));
    // The highlighter: one sweep while setup reads it; a flash when the Peer searches again.
    hls.forEach((h, hi) => {
      const f = h.dataset.fl != null ? Number(h.dataset.fl) : -1;
      // the clipping's first highlight is swept at setup; the others only when it searches again
      let pct = hi === 0 ? 100 * ease.inOutSine(prog(t, S.hi[0], S.hi[1])) : 0;
      let bright = 0;
      if (f >= 0) {
        const at = ASK.flash[f];
        if (t >= at) { pct = Math.max(pct, 100 * ease.outCubic(prog(t, at, at + 0.24))); bright = Math.max(0, 1 - Math.abs(t - at - 0.2) / 0.55); }
      }
      css(h, "backgroundSize", `${pct.toFixed(1)}% 78%`);
      css(h, "boxShadow", bright > 0.01 ? `0 0 ${(18 * bright).toFixed(1)}px rgba(120,240,180,${(0.85 * bright).toFixed(3)})` : "none");
    });
    if (seal) {
      const ok = t >= S.open[0];
      const k2 = prog(t, S.open[0], S.open[1]);
      css(seal, "opacity", ok ? (1 - ease.inCubic(k2)).toFixed(3) : "1");
      css(seal, "transform", `translateY(${(ease.inCubic(k2) * 40).toFixed(1)}px)`);
      const press = Math.max(0, 1 - Math.abs(t - S.click) / 0.09);
      const peel = ease.inOutCubic(prog(t, S.click + 0.08, S.click + 0.5));
      css(stk, "visibility", peel >= 1 ? "hidden" : "visible");
      css(stk, "transform", `translate(${(peel * 70).toFixed(1)}px, ${(-peel * 90).toFixed(1)}px) rotate(${(-6 - peel * 38).toFixed(1)}deg) scale(${(1 - 0.08 * press + 0.12 * peel).toFixed(3)})`);
      css(stk, "opacity", (1 - peel).toFixed(3));
      if (slip) {
        const a = prog(t, S.slip[0], S.slip[0] + 0.3), b = prog(t, S.slip[1] - 0.3, S.slip[1]);
        const v = ease.outBack(a) * (1 - ease.inCubic(b));
        css(slip, "visibility", v > 0.001 ? "visible" : "hidden");
        css(slip, "transform", `translate(${(-30 + 30 * v).toFixed(1)}px, ${(30 - 60 * v).toFixed(1)}px) rotate(${(-4 + 2 * v).toFixed(2)}deg)`);
        css(slip, "opacity", clamp(v * 1.3).toFixed(3));
      }
    }
  });
  return wrap;
}

// A rubber stamp mark, landing at `at` with a press.
function stamp(ctx, parent, x, y, rot, html, cls, at) {
  const s = el("div", `stamp ${cls}`, parent, html);
  s.style.left = `${x}px`;
  s.style.top = `${y}px`;
  s.style.webkitMaskImage = `url(${ctx.T.grain})`;
  if (!ctx.live) { s.style.transform = `rotate(${rot}deg)`; timed(ctx, s, (t) => t >= at); return s; }
  STAMPS.push(at);
  anim(ctx, (t) => {
    if (t < at) { css(s, "visibility", "hidden"); return; }
    css(s, "visibility", "visible");
    const k = prog(t, at, at + 0.12);
    const sc = 1 + 0.42 * (1 - ease.outCubic(k)) - 0.025 * Math.max(0, 1 - Math.abs(t - at - 0.15) / 0.08);
    css(s, "transform", `rotate(${rot}deg) scale(${sc.toFixed(4)})`);
    css(s, "opacity", (0.1 + 0.9 * ease.outQuad(k)).toFixed(3));
  });
  return s;
}

// A drawn tick (an SVG path revealed by its dash).
function tick(ctx, parent, x, y, at, size = 30, cls = "") {
  const d = el("div", `tick ${cls}`, parent, `<svg viewBox="0 0 30 30"><path pathLength="1" d="M4 16 C7 18 9 21 11.5 24 C15 16 19 10 27 4"/></svg>`);
  d.style.left = `${x}px`;
  d.style.top = `${y}px`;
  d.style.width = d.style.height = `${size}px`;
  const p = d.querySelector("path");
  if (!ctx.live) { p.style.strokeDashoffset = "0"; timed(ctx, d, (t) => t >= at + 0.3); return d; }
  anim(ctx, (t) => {
    const k = ease.inOutSine(prog(t, at, at + 0.28));
    css(d, "visibility", t >= at ? "visible" : "hidden");
    css(p, "strokeDashoffset", (1 - k).toFixed(3));
    const g = Math.max(0, 1 - Math.abs(t - at - 0.25) / 0.5);
    css(d, "filter", g > 0.01 ? `drop-shadow(0 0 ${(8 * g).toFixed(1)}px rgba(120,240,180,${(0.9 * g).toFixed(2)}))` : "none");
  });
  return d;
}

// ---- the pages ----

function fact(c, p, i, x, y) {
  const f = learned.facts[i];
  ink(c, p, `F${i}.n`, `${i + 1}.`, "hand", x, y, "num");
  let yy = para(c, p, `F${i}.t`, `${f.title}{${i + 1}}`, "hand", x + 36, y, 480).y;
  yy = para(c, p, `F${i}.b`, f.body, "hands", x + 36, yy - 2, 480).y;
  return yy;
}
function footnotes(c, p, key, idx, x, y) {
  el("div", "fn-rule", p).style.cssText = `left:${x}px;top:${y - 12}px;`;
  idx.forEach((i, j) => {
    const f = learned.facts[i];
    const s = sourceById[f.source];
    const e = ink(c, p, `${key}.${j}`, `<sup class="fn">${i + 1}</sup><i class="fi" style="--h:${s.hue}">${sourceIcon(f.source)}</i>${s.name} · ${f.ref} · ${f.date}<i class="lk">${icons.link}</i>`, "foot", x, y + j * 25);
    if (c.live && i === 1) HOOKS.footnote2 = e;
  });
}

export function buildL1(p, ctx) {
  const c = { ...ctx, page: "L1" };
  el("div", "prn own", p, "This notebook belongs to");
  el("div", "own-rule", p);
  ink(c, p, "L1.name", "Ram", "handxl", 70, 50);
  el("div", "prn ailine", p, `<b class="aib">${peer.label}</b>Written by ${peer.name} · ${rules[0].title}`);
  clipping(c, p, { key: "directory", x: 46, y: 182, w: 436, h: 168, rot: -1.8, from: [-260, -420, -12], edges: "b", tapes: [[-22, -8, 108, -33], [356, -10, 108, 31]] });
  para(c, p, "L1.dir", `${person.role} · ${person.team}{1}`, "hand", 58, 360, 530);
  clipping(c, p, { key: "slack", x: 38, y: 420, w: 476, h: 276, rot: 1.1, from: [-200, 520, 10], edges: "tb", seal: true, slip: true, tapes: [[-20, -12, 112, -30], [390, 230, 112, -34]] });
  para(c, p, "L1.slack", "Daniel asks: did retry v2 cause Tuesday's spike?{3}", "hand", 58, 706, 530);
}

export function buildR1(p, ctx) {
  const c = { ...ctx, page: "R1" };
  clipping(c, p, { key: "docs", x: 70, y: 34, w: 474, h: 172, rot: -1.2, from: [620, -260, 14], edges: "rb", tapes: [[-20, -9, 104, -31], [400, 132, 104, -30]] });
  para(c, p, "R1.docs", "Owns Payout retry v2, wrote its design doc{2}", "hand", 80, 212, 500);
  clipping(c, p, { key: "code", x: 68, y: 280, w: 414, h: 172, rot: 1.5, from: [640, 60, -14], edges: "tr", seal: true, tapes: [[-18, 130, 100, 32], [340, -12, 100, 28]] });
  para(c, p, "R1.code", "PR #4182 adds a retry limit per market{4}", "hand", 80, 456, 500);
  clipping(c, p, { key: "tickets", x: 56, y: 520, w: 274, h: 150, rot: -2.4, from: [560, 380, 16], edges: "r", seal: true, tapes: [[180, -12, 96, 24]] });
  clipping(c, p, { key: "mail", x: 342, y: 512, w: 266, h: 170, rot: 2.2, from: [420, 440, -12], edges: "", tapes: [[-16, 120, 92, 38]] });
  para(c, p, "R1.tix", "The spike came from the bank outage{5}", "hand", 64, 692, 264);
  para(c, p, "R1.mail", "Fraud threshold drops on Thursday{6}", "hand", 352, 692, 252);
}

function tags(c, p, x, y) {
  const at = LEARN.stamps;
  let cx = x, cy = y;
  learned.tags.forEach((tg, i) => {
    const w = textW(tg.toUpperCase(), "800 17px Manrope", 1.6) + 38;
    if (cx + w > 590) { cx = x; cy += 56; }
    stamp(c, p, cx, cy, [-2.2, 1.6, -1, 2.4][i], `<span>${tg}</span>`, "st-tag", at[i]);
    cx += w + 18;
  });
  return cy + 56;
}

export function buildL2(p, ctx) {
  const c = { ...ctx, page: "L2" };
  ink(c, p, "L2.h", page.nav[1], "head", 52, 24);
  ink(c, p, "L2.asof", learned.asOf, "hands", 60, 100);
  const y = para(c, p, "L2.sum", learned.summary, "hand", 56, 146, 530).y;
  const y2 = tags(c, p, 56, y + 16);
  const y3 = fact(c, p, 0, 56, y2 + 10);
  fact(c, p, 1, 56, y3 + 12);
  footnotes(c, p, "L2.fn", [0, 1], 58, 730);
}

export function buildR2(p, ctx) {
  const c = { ...ctx, page: "R2" };
  let y = 36;
  for (const i of [2, 3, 4, 5]) y = fact(c, p, i, 66, y) + 16;
  footnotes(c, p, "R2.fn", [2, 3, 4, 5], 68, 664);
}

function item(c, p, i, x, y) {
  const b = brief.items[i];
  const s = sourceById[b.source];
  ink(c, p, `B${i}.n`, `${i + 1}`, "head", x - 6, y - 24, "bnum");
  let yy = para(c, p, `B${i}.t`, b.title, "hand", x + 40, y, 486).y;
  yy = para(c, p, `B${i}.w`, b.why, "hands", x + 40, yy - 2, 486).y;
  const nx = para(c, p, `B${i}.x`, `Next: ${b.next}`, "next", x + 40, yy + 2, 486, 36, "nextl");
  // the Next line gets a mint highlighter, and its source a washi tab, when the brief is read
  const at = BRIEF.items[i];
  nx.keys.forEach((k, j) => {
    const hl = el("div", "hlbar", p);
    hl.style.cssText = `left:${x + 34}px;top:${yy + 8 + j * 36}px;`;
    const L = LINES.get(k);
    if (c.live) {
      anim(c, (t) => {
        const w = (L.w + 14) * ease.inOutSine(prog(t, at + j * 0.18, at + 0.32 + j * 0.18));
        css(hl, "width", `${w.toFixed(1)}px`);
      });
    } else {
      hl.style.width = `${(L ? L.w : 300) + 14}px`;
      c.timed.push([hl, (t) => t >= at + 0.5]);
    }
  });
  yy = nx.y + 4;
  tape(c, p, x + 34, yy - 2, textW(`${s.name} · ${b.ref} · ${b.date}`, "600 18px Manrope") + 74, -0.8, s.hue, at + 0.42, seedOf(b.ref) + i);
  ink(c, p, `B${i}.s`, `<i class="fi" style="--h:${s.hue}">${sourceIcon(b.source)}</i>${s.name} · ${b.ref} · ${b.date}<i class="lk">${icons.link}</i>`, "foot", x + 46, yy + 2, "src");
  if (i === 0) stamp(c, p, 474, y - 34, 8, "<span>New</span>", "st-new", BRIEF.stamp);
  return yy + 40;
}

export function buildL3(p, ctx) {
  const c = { ...ctx, page: "L3" };
  ink(c, p, "L3.h", page.nav[2], "head", 52, 24);
  ink(c, p, "L3.d", "Sunday, Nov 15", "sub", 60, 96, "date");
  const y = para(c, p, "L3.lead", brief.lead, "hand", 56, 146, 530).y;
  const y2 = item(c, p, 0, 56, y + 44);
  item(c, p, 1, 56, y2 + 30);
}

export function buildR3(p, ctx) {
  const c = { ...ctx, page: "R3" };
  const y = item(c, p, 2, 66, 64);
  const y2 = item(c, p, 3, 66, y + 30);
  ink(c, p, "R3.hint", `${captionWords.ask}.`, "hands", 106, Math.max(y2 + 40, 640), "hint");
}

export function buildL4(p, ctx) {
  const c = { ...ctx, page: "L4" };
  ink(c, p, "L4.h", page.nav[3], "head", 52, 24);
  ink(c, p, "L4.try", "Try asking:", "hands", 60, 100);
  ask.examples.forEach((q, i) => ink(c, p, `L4.ex.${i}`, `· ${q}`, "hands", 74, 132 + i * 31));
  // Ram's sticky note, pressed onto the page; his question in blue ballpoint, in his own hand.
  const st = el("div", "sticky", p, `<div class="sticky-h">${page.nav[3]}</div>`);
  st.style.backgroundImage = `url(${ctx.T.sticky})`;
  const cs = { ...c, space: "sticky" };
  const words = ask.question.split(" ");
  ink(cs, st, "Q.0", words.slice(0, 3).join(" "), "ram", 30, 58);
  ink(cs, st, "Q.1", words.slice(3).join(" "), "ram", 30, 112);
  ink(cs, st, "Q.sig", "— Ram", "rams", 250, 188);
  if (c.live) {
    HOOKS.sticky = st;
    anim(c, (t) => {
      const [a, b] = ASK.sticky;
      if (t < a) { css(st, "visibility", "hidden"); return; }
      css(st, "visibility", "visible");
      const k = prog(t, a, b);
      const e = ease.outCubic(k);
      const press = t > b ? Math.max(0, 1 - (t - b) / 0.25) : 0;
      const air = 1 - ease.inOutQuad(k);
      css(st, "transform", `translate(${(-380 * (1 - e)).toFixed(1)}px, ${(260 * (1 - e) - Math.sin(Math.PI * k) * 40).toFixed(1)}px) rotate(${(-2.4 - 9 * (1 - e)).toFixed(2)}deg) scale(${(1 + 0.08 * air - 0.02 * press).toFixed(4)})`);
      css(st, "filter", k >= 1 ? `drop-shadow(1px 3px 2px rgba(60,40,10,.22)) drop-shadow(6px 12px 14px rgba(60,40,10,.14))` : shadowAir(air));
    });
  } else {
    st.style.transform = "rotate(-2.4deg)";
    st.style.filter = `drop-shadow(1px 3px 2px rgba(60,40,10,.22)) drop-shadow(6px 12px 14px rgba(60,40,10,.14))`;
    ctx.timed.push([st, (t) => t >= ASK.sticky[1]]);
  }
  ink(c, p, "L4.s", `Searching again, ${AS}:`, "hand", 60, 578);
  ask.sources.forEach((s, i) => {
    const src = sourceById[s.source];
    const x = 62 + (i % 2) * 262, y = 626 + Math.floor(i / 2) * 50;
    const chip = el("div", "chip", p, `<i class="fi" style="--h:${src.hue}">${sourceIcon(s.source)}</i>${src.short} · ${s.ref}`);
    chip.style.cssText = `left:${x}px;top:${y}px;--h:${src.hue};`;
    tick(c, p, x + 226, y + 4, ASK.chips[i] + 0.35, 26);
    if (c.live) {
      anim(c, (t) => {
        const at = ASK.chips[i];
        const k = ease.outBack(prog(t, at, at + 0.3));
        css(chip, "visibility", t >= at ? "visible" : "hidden");
        css(chip, "transform", `translateY(${(10 * (1 - k)).toFixed(1)}px) scale(${(0.9 + 0.1 * k).toFixed(3)})`);
        css(chip, "opacity", clamp(k * 1.5).toFixed(3));
        const g = Math.max(0, 1 - Math.abs(t - at - 0.3) / 0.6);
        css(chip, "boxShadow", `0 0 ${(16 * g).toFixed(1)}px rgba(120,240,180,${(0.8 * g).toFixed(2)})`);
      });
    } else ctx.timed.push([chip, (t) => t >= ASK.chips[i]]);
  });
}

export function buildR4(p, ctx) {
  const c = { ...ctx, page: "R4" };
  ink(c, p, "R4.h", "Answer", "heads", 64, 28);
  ink(c, p, "R4.q", ask.question, "hands", 216, 44, "echo");
  const hues = ask.sources.map((s) => sourceById[s.source].hue);
  const text = ask.answer.map((a) => `${a.text}{${a.cite + 1}:${hues[a.cite]}}`).join(" ");
  const y = para(c, p, "R4.a", text, "hand", 66, 104, 520).y;
  el("div", "fn-rule", p).style.cssText = `left:68px;top:${y + 16}px;`;
  ask.sources.forEach((s, j) => {
    const src = sourceById[s.source];
    ink(c, p, `R4.fn.${j}`, `<sup class="cite" style="--c:${hues[j]}">${j + 1}</sup><i class="fi" style="--h:${src.hue}">${sourceIcon(s.source)}</i>${src.name} · ${s.ref} · ${s.date}<i class="lk">${icons.link}</i>`, "foot", 68, y + 28 + j * 25);
  });
  stamp(c, p, 92, Math.max(y + 150, 610), -3.5, `<b>Confidence: ${ask.certainty}</b><span>${ask.asOf}</span>`, "st-cert", ASK.stamp);
}

const DOODLE = [icons.spark, icons.eye, icons.link, icons.shield, icons.lock, icons.book];
export function buildL5(p, ctx) {
  const c = { ...ctx, page: "L5" };
  const seal = stamp(c, p, 170, 120, -6, `<svg viewBox="0 0 300 300"><defs><path id="sealRing" d="M150,150 m-108,0 a108,108 0 1,1 216,0 a108,108 0 1,1 -216,0"/></defs>
    <circle cx="150" cy="150" r="140" fill="none" stroke="currentColor" stroke-width="6"/><circle cx="150" cy="150" r="128" fill="none" stroke="currentColor" stroke-width="2"/>
    <circle cx="150" cy="150" r="84" fill="none" stroke="currentColor" stroke-width="2.5"/>
    <text font-family="Manrope" font-weight="800" font-size="19" letter-spacing="3.2" fill="currentColor"><textPath href="#sealRing" textLength="664" lengthAdjust="spacing">${peer.name.toUpperCase()} · ${rules[0].title.toUpperCase()} · READS ${AS.toUpperCase()} ·</textPath></text>
    <text x="150" y="182" text-anchor="middle" font-family="Instrument Serif" font-size="104" fill="currentColor">${peer.label}</text></svg>`, "st-seal", RULES.seal);
  void seal;
  ink(c, p, "L5.n.0", `Kept by ${peer.name},`, "hand", 320, 470, "mid");
  ink(c, p, "L5.n.1", `${rules[0].title.toLowerCase()}.`, "hand", 320, 508, "mid");
}

export function buildR5(p, ctx) {
  const c = { ...ctx, page: "R5" };
  ink(c, p, "R5.h", "House rules", "head", 60, 24);
  ink(c, p, "R5.sub", page.nav[4], "hands", 64, 100);
  let y = 150;
  rules.forEach((r, i) => {
    const d = el("div", "doodle", p, DOODLE[i].replace(/<(path|rect|circle)/g, '<$1 pathLength="1"'));
    d.style.cssText = `left:62px;top:${y + 2}px;`;
    const parts = [...d.querySelectorAll("path,rect,circle")];
    const at = RULES.doodles + i * 0.28;
    if (c.live) {
      anim(c, (t) => {
        const k = ease.inOutSine(prog(t, at, at + 0.5));
        parts.forEach((q) => css(q, "strokeDashoffset", (1 - k).toFixed(3)));
        const g = Math.max(0, 1 - Math.abs(t - at - 0.4) / 0.6);
        css(d, "filter", g > 0.01 ? `drop-shadow(0 0 ${(9 * g).toFixed(1)}px rgba(120,240,180,${g.toFixed(2)}))` : "none");
      });
    } else parts.forEach((q) => { q.style.strokeDashoffset = "0"; });
    const tl = para(c, p, `R5.r${i}.t`, r.title, "hand", 124, y, 470);
    if (c.live) {
      tl.keys.forEach((k, j) => {
        const hl = el("div", "hlbar", p);
        hl.style.cssText = `left:${118}px;top:${y + 7 + j * 38}px;`;
        const L = LINES.get(k), a = RULES.lit + i * 0.36 + j * 0.12;
        anim(c, (t) => css(hl, "width", `${((L.w + 14) * ease.inOutSine(prog(t, a, a + 0.34))).toFixed(1)}px`));
      });
    }
    let yy = tl.y;
    yy = para(c, p, `R5.r${i}.b`, r.body, "hands", 124, yy - 4, 470).y;
    y = yy + 12;
  });
}

export function buildBlank() {}

// The cover: green bookcloth, the title in gold foil, a blind-embossed "AI".
export function buildCover(p, ctx) {
  p.innerHTML = `
    <div class="cv-frame"></div>
    <div class="cv-tile"><span>${peer.label}</span></div>
    <div class="cv-title">${peer.name}</div>
    <div class="cv-notes">notes</div>
    <div class="cv-rule"></div>
    <div class="cv-line">${rules[0].title}</div>
    <div class="cv-band"></div>`;
  p.style.backgroundImage = `url(${ctx.T.cloth})`;
  if (ctx.live) HOOKS.coverFoil = [...p.querySelectorAll(".cv-title, .cv-notes, .cv-line")];
}

// ---- the setup card, on the desk beside the notebook ----
export function buildCard(world, T) {
  const card = el("div", "card", world);
  card.style.backgroundImage = `url(${T.card})`;
  const c = { live: true, page: "card", T, timed: [] };
  el("div", "card-h", card, `<span>Setting up</span><i>${peer.name}</i>`);
  el("div", "card-rule", card);
  let y = 94;
  steps.forEach((s, i) => {
    el("div", "box", card).style.top = `${y + 4}px`;
    const r = para(c, card, `C.s${i}`, s.text, "cline", 62, y, 262);
    tick(c, card, 22, y - 2, STEP_DONE[i], 34, "ctick");
    ink(c, card, `C.t${i}`, `${s.time.toFixed(1)} s`, "ctime", 326, y);
    y = r.y + 12;
  });
  el("div", "card-rule2", card).style.top = `${y + 6}px`;
  el("div", "card-h2", card, `Sources, read ${AS}`).style.top = `${y + 18}px`;
  y += 62;
  SRC_ORDER.forEach((id, i) => {
    const s = sourceById[id];
    const sw = el("div", "swatch", card);
    sw.style.cssText = `top:${y + 6}px;--tc:${s.hue};`;
    sw.style.clipPath = tapeEnds(46, 22, seedOf(id));
    ink(c, card, `C.r${i}`, s.short, "cline", 82, y);
    tick(c, card, 82 + textW(s.short, "600 28px Caveat") + 10, y + 1, SRC[id].row + 0.25, 26, "rtick");
    ink(c, card, `C.f${i}`, s.found, "cfound", 84, y + 33);
    if (c.live) {
      anim(c, (t) => {
        const at = SRC[id].row - 0.05;
        const k = ease.outBack(prog(t, at, at + 0.25));
        css(sw, "visibility", t >= at ? "visible" : "hidden");
        css(sw, "transform", `rotate(-3deg) scaleX(${(0.3 + 0.7 * k).toFixed(3)})`);
      });
    }
    y += 58;
  });
  return { card, anims: ANIMS.card };
}
