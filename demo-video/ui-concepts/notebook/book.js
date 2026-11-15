// The notebook in CSS 3D: two boards, the page blocks, a static page on each side, and leaves that
// turn. A turning leaf is a chain of narrow strips, each nested in the one before and turned a
// little more, so the paper bends: the free edge lifts first and floats down last. Every strip holds
// a clipped copy of its page, on the front and (mirrored) on the back, and is shaded from its angle.
import { el, clamp, ease, path, prog } from "../shared/kit.js";
import { TURNS, CLOSE } from "./tl.js";

export const PW = 640, PH = 820, BO = 12;

// The angle (degrees) at the spine and at the free edge, by turn progress u (0..1).
const SPINE = [[0], [-14], [-72], [-160], [-180]];
const EDGE = [[0], [-74], [-130], [-152], [-180]];

// Light, pointing toward the window (upper left, high): x right, z toward the camera.
const LX = -0.42, LZ = 0.9;

function anglesAt(u, n, bend, dir, rigid) {
  const out = new Array(n);
  if (rigid) {
    const th = -180 * u;
    for (let i = 0; i <= n; i++) out[i] = dir > 0 ? th : -180 - th;
    return out;
  }
  const s0 = path(SPINE, u)[0], s1 = path(EDGE, u)[0];
  for (let i = 0; i <= n; i++) {
    const s = i / n;
    let phi = s0 + (s1 - s0) * Math.pow(s, 1.35) * bend;
    phi = clamp(phi, -180, 0);
    out[i] = dir > 0 ? phi : -180 - phi;
  }
  return out;
}

const shadeOf = (deg, back) => {
  const p = (deg * Math.PI) / 180;
  let d = Math.sin(p) * LX + Math.cos(p) * LZ;
  if (back) d = -d;
  // flat: 0; turned away: darker (> 0); turned toward the window: a sheen (< 0).
  return clamp((LZ - Math.max(0, d)) * 0.42, -0.3, 0.36) - Math.max(0, d - LZ) * 1.6;
};
const tone = (v) => (v >= 0 ? `rgba(38,26,14,${v.toFixed(3)})` : `rgba(255,250,238,${Math.min(0.32, -v).toFixed(3)})`);

const cache = new WeakMap();
// Write a style only when it changes (the frame is the same either way).
export function css(e, prop, v) {
  let m = cache.get(e);
  if (!m) { m = {}; cache.set(e, m); }
  if (m[prop] !== v) { m[prop] = v; e.style[prop] = v; }
}

export function makeBook(world, { sx, ty }) {
  const root = el("div", "nb-book", world);
  root.style.left = `${sx - PW}px`;
  root.style.top = `${ty}px`;
  const B = { root, sx, ty, leaves: [], pages: {} };
  B.shR = el("div", "nb-dsh nb-dsh-r", root);
  B.shL = el("div", "nb-dsh nb-dsh-l", root);
  B.boardR = el("div", "nb-board nb-board-r", root);
  B.boardL = el("div", "nb-board nb-board-l", root);
  B.edgeR = el("div", "nb-edge nb-edge-r", root);
  B.edgeL = el("div", "nb-edge nb-edge-l", root);
  B.slotL = el("div", "nb-slot nb-slot-l", root);
  B.slotR = el("div", "nb-slot nb-slot-r", root);
  B.gutL = el("div", "nb-gut nb-gut-l", root);
  B.gutR = el("div", "nb-gut nb-gut-r", root);
  B.curlL = el("div", "nb-curl nb-curl-l", root);
  B.curlR = el("div", "nb-curl nb-curl-r", root);
  B.over = el("div", "nb-over", root); // things above the pages (the tip-in, the pen's marks)
  return B;
}

// A page shown statically on one side. build(container) fills it.
export function addPage(B, id, side, cls, build) {
  const slot = side === "L" ? B.slotL : B.slotR;
  const p = el("div", `pg ${cls}`, slot);
  build(p);
  B.pages[id] = p;
  return p;
}

// A leaf: n strips; fill(container, side, i) fills one face of strip i ("F" front, "B" back).
// opts.board: faces are the cover board's size (the cover leaf and the closing block).
export function makeLeaf(B, { n, fill, rigid = false, board = false, bend = 1 }) {
  const root = el("div", "lf", B.root);
  const w = PW / n;
  const strips = [];
  const timed = [];
  let parent = root;
  for (let i = 0; i < n; i++) {
    const s = el("div", "lf-s", parent);
    s.style.width = `${w}px`;
    const f = el("div", "lf-f", s), b = el("div", "lf-f lf-b", s);
    if (board) {
      for (const face of [f, b]) {
        face.style.top = `${-BO}px`;
        face.style.width = `${PW + BO}px`;
        face.style.height = `${PH + 2 * BO}px`;
      }
    }
    const fi = el("div", "lf-in", f), bi = el("div", "lf-in", b);
    if (!board) {
      fi.style.left = `${-i * w}px`;
      bi.style.left = `${-(PW - (i + 1) * w)}px`;
    }
    fill(fi, "F", i, timed);
    fill(bi, "B", i, timed);
    const fs = el("div", "lf-sh", f), bs = el("div", "lf-sh", b);
    strips.push({ s, fs, bs });
    parent = s;
  }
  const L = { root, strips, n, w, rigid, bend, timed };
  B.leaves.push(L);
  return L;
}

function poseLeaf(L, u, dir) {
  const ph = anglesAt(u, L.n, L.bend, dir, L.rigid);
  let prev = 0;
  for (let i = 0; i < L.n; i++) {
    const mid = L.rigid ? ph[0] : (ph[i] + ph[i + 1]) / 2;
    const { s, fs, bs } = L.strips[i];
    css(s, "transform", i === 0 ? `rotateY(${mid.toFixed(2)}deg)` : `translateX(${L.w}px) rotateY(${(mid - prev).toFixed(2)}deg)`);
    prev = mid;
    const a0 = shadeOf(L.rigid ? mid : ph[i], false), a1 = shadeOf(L.rigid ? mid : ph[i + 1], false);
    const b0 = shadeOf(L.rigid ? mid : ph[i], true), b1 = shadeOf(L.rigid ? mid : ph[i + 1], true);
    css(fs, "background", `linear-gradient(90deg, ${tone(a0)}, ${tone(a1)})`);
    css(bs, "background", `linear-gradient(90deg, ${tone(b1)}, ${tone(b0)})`);
  }
  // Where the leaf sits over the page, and how high: for the shadow it casts.
  let x = 0, z = 0, minX = 0, maxX = 0;
  for (let i = 0; i < L.n; i++) {
    const mid = (L.rigid ? ph[0] : (ph[i] + ph[i + 1]) / 2) * Math.PI / 180;
    x += L.w * Math.cos(mid);
    z += -L.w * Math.sin(mid);
    const sx = x + z * 0.47;
    minX = Math.min(minX, sx);
    maxX = Math.max(maxX, sx);
  }
  return { minX, maxX };
}

// Which leaves are where at t. a: 0 on the right, 1 on the left.
export function leafState(t, count) {
  const a = new Array(count).fill(0), mov = new Array(count).fill(null);
  for (const tr of TURNS) {
    if (t < tr.a) continue;
    if (t >= tr.b) { a[tr.leaf] = tr.dir > 0 ? 1 : 0; mov[tr.leaf] = null; continue; }
    const k = prog(t, tr.a, tr.b);
    const u = tr.rigid ? ease.inOutCubic(k) : ease.inOutSine(k);
    a[tr.leaf] = tr.dir > 0 ? u : 1 - u;
    mov[tr.leaf] = { u, dir: tr.dir, k };
  }
  return { a, mov };
}

// Draw the book at t. leafPages[i] = { front, back } page ids; inside = the inside back cover id.
// closer: the rigid block (front cover outside, last page) that closes the book at the end.
export function renderBook(B, t, { leafPages, inside, closer, coverFade }) {
  const n = leafPages.length;
  const { a, mov } = leafState(t, n);
  const closing = t >= CLOSE[0];
  let left = null, right = null;
  if (!closing) {
    for (let i = 0; i < n; i++) if (a[i] === 1 && !mov[i]) left = leafPages[i].back;
    for (let i = n - 1; i >= 0; i--) if (a[i] === 0 && !mov[i]) right = leafPages[i].front;
    if (right == null) right = inside;
  } else {
    right = t >= CLOSE[1] ? "cover" : inside;
  }
  for (const [id, p] of Object.entries(B.pages)) css(p, "display", id === left || id === right ? "block" : "none");
  const open = !closing && a[0] === 1 && !mov[0];
  css(B.boardL, "display", open ? "block" : "none");
  css(B.edgeL, "display", open ? "block" : "none");
  css(B.shL, "display", (open || mov[0] || (closing && t < CLOSE[1])) ? "block" : "none");
  css(B.gutL, "display", open ? "block" : "none");
  css(B.gutR, "display", right !== "cover" ? "block" : "none");
  // While the cover forms, the closed book fades in.
  const f = String(coverFade);
  for (const e of [B.boardR, B.edgeR, B.shR]) css(e, "opacity", f);
  if (B.pages.cover) css(B.pages.cover, "opacity", f);

  let cr = 0, crW = 0, cl = 0, clW = 0;
  B.leaves.forEach((L, i) => {
    let m = i < n ? mov[i] : null;
    if (i === n) m = closing && t < CLOSE[1] ? { u: ease.inOutCubic(prog(t, CLOSE[0], CLOSE[1])), dir: -1 } : null;
    if (closing && i < n) m = null;
    css(L.root, "display", m ? "block" : "none");
    if (!m) return;
    const ext = poseLeaf(L, m.u, m.dir);
    const s = Math.sin(Math.PI * m.u);
    if (ext.maxX > 0) { cr = Math.max(cr, s); crW = Math.max(crW, ext.maxX); }
    if (ext.minX < 0) { cl = Math.max(cl, s); clW = Math.max(clW, -ext.minX); }
    for (const [e, vis, prop = "visibility", on = "visible", off = "hidden"] of L.timed) css(e, prop, vis(t) ? on : off);
  });
  css(B.curlR, "opacity", cr.toFixed(3));
  css(B.curlR, "width", `${Math.min(PW, crW + 70).toFixed(1)}px`);
  css(B.curlL, "opacity", cl.toFixed(3));
  css(B.curlL, "width", `${Math.min(PW, clW + 50).toFixed(1)}px`);
  return { left, right, a, mov, closing };
}
