// The pen of light (the Peer: "AI" glows on its barrel) and Ram's own blue ballpoint. Both are drawn
// in screen space over the 3D desk: each frame the pen's nib is put on a point of the page, found by
// projecting that point through the camera (a tiny marker read with getBoundingClientRect).
import { el, clamp, lerp, ease, prog, noise } from "../shared/kit.js";
import { css } from "./book.js";
import { revealX } from "./ink.js";

// The Peer's pen, nib at (0, 0), the barrel along +y (the pen is turned about -32 deg on screen).
const PEN_SHAPES = `
  <defs>
    <linearGradient id="pnGold" x1="0" x2="1"><stop offset="0" stop-color="#8d7440"/><stop offset=".38" stop-color="#f4e6bb"/><stop offset=".62" stop-color="#d8c08a"/><stop offset="1" stop-color="#7a6334"/></linearGradient>
    <linearGradient id="pnLac" x1="0" x2="1"><stop offset="0" stop-color="#06140f"/><stop offset=".22" stop-color="#2f6a55"/><stop offset=".34" stop-color="#a8d9c4"/><stop offset=".44" stop-color="#1f4a3c"/><stop offset=".8" stop-color="#0b241b"/><stop offset="1" stop-color="#3c8c70"/></linearGradient>
    <linearGradient id="pnGlass" x1="0" x2="1"><stop offset="0" stop-color="#2c8e68"/><stop offset=".35" stop-color="#e9fff3"/><stop offset=".55" stop-color="#9df0c6"/><stop offset="1" stop-color="#2f9b72"/></linearGradient>
    <radialGradient id="pnTip"><stop offset="0" stop-color="#ffffff"/><stop offset=".35" stop-color="#d6ffe9"/><stop offset="1" stop-color="#7ff0b8" stop-opacity="0"/></radialGradient>
  </defs>
  <path d="M0 0 C-2 7 -8 19 -9.5 30 L-10.5 42 L10.5 42 L9.5 30 C8 19 2 7 0 0 Z" fill="url(#pnGold)"/>
  <path d="M0 5 L0 27" stroke="#5b4722" stroke-width="1.1"/><circle cx="0" cy="29" r="2.1" fill="#5b4722"/>
  <path d="M-10.5 42 L-12.6 112 L12.6 112 L10.5 42 Z" fill="url(#pnGlass)" opacity=".96"/>
  <path d="M-6 46 L-7.2 108" stroke="#ffffff" stroke-width="2.2" opacity=".7" stroke-linecap="round"/>
  <rect x="-13.4" y="111" width="26.8" height="8" rx="1.5" fill="url(#pnGold)"/>
  <path d="M-13.2 119 L-14.6 362 L14.6 362 L13.2 119 Z" fill="url(#pnLac)"/>
  <text x="0" y="163" text-anchor="middle" font-family="Manrope" font-weight="800" font-size="19" letter-spacing="1" fill="#c9ffe4" class="pn-ai">AI</text>
  <rect x="-14.8" y="360" width="29.6" height="17" rx="2" fill="url(#pnGold)"/>
  <path d="M-14.6 377 L-13.4 452 Q0 470 13.4 452 L14.6 377 Z" fill="url(#pnLac)"/>
  <path d="M5 378 L12 383 L12.5 462 Q9.5 470 6 463 Z" fill="url(#pnGold)"/>`;
const PEN_SVG = `<svg viewBox="-40 -12 80 500" width="80" height="500">${PEN_SHAPES}</svg>`;
const PEN_SIL = `<svg viewBox="-40 -12 80 500" width="80" height="500"><path d="M0 0 C-2 7 -8 19 -9.5 30 L-10.5 42 L-12.6 112 L-13.2 119 L-14.6 362 L-14.8 377 L-13.4 452 Q0 470 13.4 452 L14.8 377 L14.6 362 L13.2 119 L12.6 112 L10.5 42 L9.5 30 C8 19 2 7 0 0 Z" fill="#1f1206"/></svg>`;

// Ram's ballpoint: a clear hexagonal barrel and a blue cap. No "AI": it is his.
const BALL_SVG = `<svg viewBox="-40 -12 80 500" width="80" height="500">
  <defs><linearGradient id="bpBody" x1="0" x2="1"><stop offset="0" stop-color="#b9c4cc" stop-opacity=".75"/><stop offset=".4" stop-color="#ffffff" stop-opacity=".9"/><stop offset=".6" stop-color="#dfe7ec" stop-opacity=".7"/><stop offset="1" stop-color="#8f9ca6" stop-opacity=".8"/></linearGradient>
  <linearGradient id="bpBlue" x1="0" x2="1"><stop offset="0" stop-color="#132a78"/><stop offset=".4" stop-color="#4f74e0"/><stop offset="1" stop-color="#10236a"/></linearGradient></defs>
  <path d="M0 0 L-3 10 L-6 34 L6 34 L3 10 Z" fill="#c9ccd0"/><circle cx="0" cy="1.5" r="1.6" fill="#333"/>
  <path d="M-6 34 L-9 70 L-9.5 380 L9.5 380 L9 70 L6 34 Z" fill="url(#bpBody)"/>
  <path d="M-1.6 40 L-1.6 372" stroke="#2448a8" stroke-width="3"/>
  <path d="M-9.5 380 L-9 452 Q0 462 9 452 L9.5 380 Z" fill="url(#bpBlue)"/>
  <path d="M3 386 L8 390 L8 452 L4 452 Z" fill="url(#bpBlue)" opacity=".9"/></svg>`;

export function makePen(stage, ballpoint = false) {
  const root = el("div", "pen" + (ballpoint ? " ball" : ""), stage);
  const sh = el("div", "pen-sh", root, PEN_SIL);
  const body = el("div", "pen-b", root, ballpoint ? BALL_SVG : PEN_SVG);
  const halo = ballpoint ? null : el("div", "pen-halo", stage);
  const tip = ballpoint ? null : el("div", "pen-tip", stage);
  return { root, sh, body, halo, tip };
}

// A marker per box (page, card, sticky): projects a point of that box to the screen.
const markers = new Map();
export function proj(box, x, y) {
  let m = markers.get(box);
  if (!m) { m = el("div", "mk", box); markers.set(box, m); }
  if (m.parentNode !== box) box.appendChild(m);
  m.style.left = `${x}px`;
  m.style.top = `${y}px`;
  const r = m.getBoundingClientRect();
  if (r.width === 0 && r.height === 0) return null;
  return [r.left + r.width / 2, r.top + r.height / 2];
}

// The pen's track: segments in time order.
//   { a, b, line: L }                 write one line, the nib on its reveal edge
//   { a, b, lines: [L, ...] }         a cascade: the pen sweeps along the newest line, just above it
//   { a, b, box, x, y, lift }         hover over a point of a box
//   { a, b, sx, sy, lift }            a point on the screen
function segPoint(s, t) {
  if (s.line) {
    const L = s.line;
    const X = clamp(revealX(L, t), 0, L.w) + 4;
    const w = Math.sin(t * Math.PI * 2 * 8.5) * 5.5 + noise(t * 13, 3) * 2.5;
    const p = proj(L.box, L.x + X + noise(t * 9, 5) * 2, L.y + L.lh * L.nib - 5 + w);
    return p && { p, lift: 1.2 + 1.6 * (0.5 + 0.5 * Math.sin(t * Math.PI * 2 * 3.1)), writing: 1 };
  }
  if (s.lines) {
    let L = s.lines[0];
    for (const q of s.lines) if (q.t0 <= t) L = q;
    const X = clamp(revealX(L, t), 0, L.w);
    const p = proj(L.box, L.x + X, L.y + L.lh * 0.55);
    return p && { p, lift: 12, writing: 0.6 };
  }
  if (s.box) {
    const p = proj(s.box, s.x + noise(t * 0.7, 11) * 6, s.y + noise(t * 0.6, 12) * 5);
    return p && { p, lift: s.lift, writing: 0 };
  }
  return { p: [s.sx + noise(t * 0.7, 11) * 6, s.sy + noise(t * 0.6, 12) * 5], lift: s.lift, writing: 0 };
}

export function penAt(segs, t) {
  let i = segs.findIndex((s) => t < s.b);
  if (i === -1) i = segs.length;
  const cur = segs[i];
  if (cur && t >= cur.a) {
    if (cur.lines) {
      // smooth the cascade's jumps from line to line over a short window
      let x = 0, y = 0, n = 0, lift = 0;
      for (let k = 0; k < 6; k++) {
        const q = segPoint(cur, Math.max(cur.a, t - k * 0.035));
        if (q) { x += q.p[0]; y += q.p[1]; lift += q.lift; n++; }
      }
      if (n) return { p: [x / n, y / n], lift: lift / n, writing: 0.6 };
    }
    const q = segPoint(cur, t);
    if (q) return q;
  }
  const prev = segs[i - 1], next = cur;
  if (!prev) return next ? segPoint(next, next.a) : null;
  if (!next) return segPoint(prev, prev.b);
  // between two segments: hover, then fly in an arc
  const A = segPoint(prev, prev.b), Bq = segPoint(next, next.a);
  if (!A || !Bq) return A || Bq;
  const gap = next.a - prev.b;
  const fly = Math.min(gap, gap > 1.1 ? 0.85 : gap);
  const t0 = next.a - fly;
  if (t < t0) {
    const h = ease.outCubic(prog(t, prev.b, prev.b + 0.4));
    return { p: [A.p[0] + noise(t * 0.8, 21) * 5 * h, A.p[1] - 8 * h + noise(t * 0.7, 22) * 4 * h], lift: lerp(A.lift, 22, h), writing: 0 };
  }
  const k = prog(t, t0, next.a);
  const e = ease.inOutCubic(k);
  const dx = Bq.p[0] - A.p[0], dy = Bq.p[1] - A.p[1];
  const d = Math.hypot(dx, dy) || 1;
  const arc = Math.sin(Math.PI * k) * Math.min(110, d * 0.16);
  const start = gap > 1.1 ? [A.p[0], A.p[1] - 8] : A.p;
  return {
    p: [lerp(start[0], Bq.p[0], e) + (dy / d) * arc, lerp(start[1], Bq.p[1], e) - (dx / d) * arc * 0.6 - Math.sin(Math.PI * k) * 20],
    lift: lerp(gap > 1.1 ? 22 : A.lift, Bq.lift, e) + Math.sin(Math.PI * k) * (18 + Math.min(50, d * 0.05)),
    writing: 0,
  };
}

// Pose the pen: nib at p, lifted by `lift` (px above the paper), scaled with the camera.
export function posePen(P, q, q2, zoom, angle, vis, glow = 1) {
  css(P.root, "display", vis > 0.001 && q ? "block" : "none");
  if (P.halo) { css(P.halo, "display", vis > 0.001 && q ? "block" : "none"); css(P.tip, "display", vis > 0.001 && q ? "block" : "none"); }
  if (!q || vis <= 0.001) return;
  const [x, y] = q.p;
  const vx = q2 ? x - q2.p[0] : 0;
  const lean = clamp(vx * 0.12, -7, 7);
  const a = angle + lean;
  const s = zoom * (1 + q.lift * 0.0016);
  css(P.root, "transform", `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${a.toFixed(2)}deg) scale(${s.toFixed(4)})`);
  css(P.root, "opacity", vis.toFixed(3));
  // The shadow falls away from the window (down and right on screen), farther as the pen lifts.
  const sx = 6 + q.lift * 0.7, sy = 9 + q.lift * 0.9;
  const r = (-a * Math.PI) / 180;
  const lx = sx * Math.cos(r) - sy * Math.sin(r), ly = sx * Math.sin(r) + sy * Math.cos(r);
  css(P.sh, "transform", `translate(${(lx / s).toFixed(1)}px, ${(ly / s).toFixed(1)}px) rotate(-7deg) scale(1.03, 1.08)`);
  css(P.sh, "filter", `blur(${(3 + q.lift * 0.18).toFixed(1)}px)`);
  css(P.sh, "opacity", (0.42 - Math.min(0.2, q.lift * 0.004)).toFixed(3));
  if (P.halo) {
    const w = q.writing;
    const g = glow * vis * (0.55 + 0.45 * w) * (1 - Math.min(0.5, q.lift * 0.008));
    css(P.halo, "transform", `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${(zoom * (0.85 + 0.3 * w)).toFixed(3)})`);
    css(P.halo, "opacity", g.toFixed(3));
    css(P.tip, "transform", `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${(zoom * (0.8 + 0.4 * w + 0.15 * Math.sin(x * 0.05))).toFixed(3)})`);
    css(P.tip, "opacity", (vis * (0.7 + 0.3 * w)).toFixed(3));
  }
}
