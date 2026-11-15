// Light ink. Every written line is a block revealed left to right by a soft mask: under the pen
// ("pen"), in a fast cascade the pen sweeps over ("cascade"), or by itself ("self"). The fresh
// ink glows mint just behind the reveal and cools to deep green within a second.
import { el, clamp } from "../shared/kit.js";
import { css } from "./book.js";

export const LINES = new Map();

// Canvas fonts for wrapping, one per ink class (the same faces and sizes as style.css).
const FONTS = {
  hand: "600 31px Caveat",
  hands: "500 27px Caveat",
  handxl: "700 54px Caveat",
  next: "700 30px Caveat",
  head: "italic 400 66px 'Instrument Serif'",
  heads: "italic 400 48px 'Instrument Serif'",
  sub: "400 34px 'Instrument Serif'",
  ram: "500 44px Caveat",
  rams: "500 34px Caveat",
  foot: "600 18px Manrope",
  cline: "600 28px Caveat",
  ctime: "700 28px Caveat",
  cfound: "600 18px Manrope",
};
const LH = { hand: 38, hands: 31, handxl: 60, next: 36, head: 74, heads: 56, sub: 44, ram: 50, rams: 40, foot: 25, cline: 33, ctime: 33, cfound: 22 };
// Where the nib sits on a line, as a share of its height.
const NIB = { hand: 0.7, hands: 0.7, handxl: 0.72, next: 0.7, head: 0.7, heads: 0.7, sub: 0.7, ram: 0.72, rams: 0.72, foot: 0.68, cline: 0.7, ctime: 0.7, cfound: 0.68 };

let mctx = null;
function measure(text, cls) {
  if (!mctx) mctx = document.createElement("canvas").getContext("2d");
  mctx.font = FONTS[cls];
  return mctx.measureText(text).width;
}

// "{3}" becomes a superscript footnote number; "{3:#b28cff}" one in a source's colour.
export function marks(s) {
  return s.replace(/\{(\d+)(?::(#[0-9a-fA-F]{6}))?\}/g, (_, n, c) =>
    c ? `<sup class="cite" style="--c:${c}">${n}</sup>` : `<sup class="fn">${n}</sup>`);
}
const plain = (s) => s.replace(/\{(\d+)(?::#[0-9a-fA-F]{6})?\}/g, "$1");

// One line of ink at (x, y) in its parent. ctx.live registers it for the schedule and the pen;
// a copy (on a turning leaf) only shows once the line is fully written.
export function ink(ctx, parent, key, text, cls, x, y, extra = "") {
  const e = el("div", `ink ${cls} ${extra}`, parent);
  e.style.left = `${x}px`;
  e.style.top = `${y}px`;
  const html = marks(text);
  el("span", "ink-b", e, html);
  const glow = ctx.live ? el("span", "ink-g", e, html) : null;
  if (ctx.live) {
    if (LINES.has(key)) throw new Error(`ink key twice: ${key}`);
    LINES.set(key, { key, e, glow, cls, x, y, lh: LH[cls], nib: NIB[cls], page: ctx.page, box: parent,
      chars: plain(text.replace(/<[^>]+>/g, "")).length, t0: 0, t1: 0, mode: "self", w: 0 });
  } else {
    ctx.timed.push([e, (t) => { const L = LINES.get(key); return L && t >= L.t1; }]);
  }
  return e;
}

// Wrap text to maxW and write it as lines key.0, key.1, ... Returns the y below it.
export function para(ctx, parent, key, text, cls, x, y, maxW, lh = LH[cls], extra = "") {
  const words = text.split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    const tryS = cur ? `${cur} ${w}` : w;
    if (cur && measure(plain(tryS), cls) + (/\{/.test(tryS) ? 10 : 0) > maxW) { lines.push(cur); cur = w; }
    else cur = tryS;
  }
  if (cur) lines.push(cur);
  lines.forEach((s, i) => ink(ctx, parent, `${key}.${i}`, s, cls, x, y + i * lh, extra));
  return { y: y + lines.length * lh, n: lines.length, keys: lines.map((_, i) => `${key}.${i}`) };
}

// Measure every live line (after layout).
export function measureLines() {
  for (const L of LINES.values()) L.w = L.e.offsetWidth;
}

// The schedule. keys: line keys in writing order. Returns the time the last line ends.
export function write(keys, start, { mode = "pen", cps = 58, gap = 0.1, stagger = 0.1, dur = null, min = 0.16 } = {}) {
  let cur = start, end = start;
  keys.forEach((k, i) => {
    const L = LINES.get(k);
    if (!L) throw new Error(`no ink line ${k}`);
    const d = dur != null ? dur : Math.max(min, L.chars / cps);
    if (mode === "pen") { L.t0 = cur; L.t1 = cur + d; cur = L.t1 + gap; }
    else { L.t0 = start + i * stagger; L.t1 = L.t0 + d; }
    L.mode = mode;
    end = Math.max(end, L.t1);
  });
  return end;
}
// Lines shown from the start, already written (printed in ink).
export function preset(keys) {
  for (const k of keys) { const L = LINES.get(k); L.t0 = -2; L.t1 = -1; L.mode = "self"; }
}

const FEATHER = 16;
// The reveal edge in px at t (with a writer's uneven pace).
export function revealX(L, t) {
  if (t <= L.t0) return -FEATHER;
  if (t >= L.t1) return L.w + FEATHER;
  const k = (t - L.t0) / (L.t1 - L.t0);
  const e = 0.55 * k + 0.45 * (0.5 - 0.5 * Math.cos(Math.PI * k));
  return -FEATHER + (L.w + 2 * FEATHER) * e;
}

export function renderInk(t, shown) {
  for (const L of LINES.values()) {
    if (!shown(L.page)) continue;
    if (t < L.t0) { css(L.e, "opacity", "0"); continue; }
    css(L.e, "opacity", "1");
    const X = revealX(L, t);
    if (t >= L.t1) css(L.e, "webkitMaskImage", "none");
    else css(L.e, "webkitMaskImage", `linear-gradient(90deg, #000 ${X.toFixed(1)}px, transparent ${(X + FEATHER).toFixed(1)}px)`);
    if (L.glow) {
      const g = t < L.t1 ? 1 : 1 - clamp((t - L.t1) / 0.8);
      css(L.glow, "opacity", g.toFixed(3));
      if (g > 0) {
        const gx = Math.min(X, L.w + FEATHER);
        css(L.glow, "webkitMaskImage", `linear-gradient(90deg, transparent ${(gx - 190).toFixed(1)}px, #000 ${(gx - 40).toFixed(1)}px, #000 ${gx.toFixed(1)}px, transparent ${(gx + FEATHER).toFixed(1)}px)`);
      }
    }
  }
}
