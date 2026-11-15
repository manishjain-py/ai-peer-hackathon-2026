// The Notebook. Today's page folds shut like a book and becomes a cloth-bound notebook on a sunlit
// oak desk. Its pen of light (the Peer, "AI" glowing on its barrel) reads Ram's sources as him,
// pastes in clippings, highlights the key line and writes what it learned, his brief and its answers
// in light ink, each fact with a footnote to its source. Every frame is drawn from t alone.
import { el, clamp, lerp, prog, ease, keys, spring, noise } from "../shared/kit.js";
import { todayPage, pointer, centre } from "../shared/page.js";
import { captionWords, reads, sourceById } from "../shared/data.js";
import { icons, sourceIcon } from "../shared/icons.js";
import { makeTextures } from "./tex.js";
import { PW, PH, BO, css, makeBook, addPage, makeLeaf, renderBook } from "./book.js";
import { LINES, measureLines, write, preset, renderInk } from "./ink.js";
import * as P from "./pages.js";
import { makePen, penAt, posePen, proj } from "./pen.js";
import { makeLight, renderLight, renderTrail } from "./fx.js";
import { SHEET, CARD_IN, STEP_START, STEP_DONE, SRC, SRC_ORDER, CLOSE, LEARN, BRIEF, ASK, RULES, CLICK } from "./tl.js";

const SX = 1152, TY = 128; // the spine and the top of the pages, in desk pixels

// The leaves, front and back: the cover, four written leaves, blank leaves, and the last page.
const LEAF_PAGES = [
  { front: "cover", back: "L1" }, { front: "R1", back: "L2" }, { front: "R2", back: "L3" }, { front: "R3", back: "L4" },
  { front: "R4", back: "blankL" }, { front: "blankR", back: "blankL" }, { front: "blankR", back: "blankL" },
  { front: "blankR", back: "blankL" }, { front: "blankR", back: "L5" },
];
const BUILD = {
  cover: P.buildCover, L1: P.buildL1, R1: P.buildR1, L2: P.buildL2, R2: P.buildR2, L3: P.buildL3, R3: P.buildR3,
  L4: P.buildL4, R4: P.buildR4, L5: P.buildL5, R5: P.buildR5, blankL: P.buildBlank, blankR: P.buildBlank,
};
const KIND = { cover: "cover", L1: "pg-end", R5: "pg-end", L5: "pg-plain" };
const kindOf = (id) => KIND[id] || "pg-ruled";

// The camera: the desk point at the centre of the screen, zoom, tilt (deg, top away), roll (deg).
const CAM = [
  [0, [960, 540, 1, 0, 0]],
  [4.55, [960, 540, 1, 0, 0]],
  [6.45, [1474, 536, 1.1, 7, -1.2]],
  [7.15, [1466, 538, 1.08, 8, -0.8]],
  [8.45, [962, 540, 1.0, 8, 0]],
  [11.7, [972, 540, 1.01, 8, 0.15]],
  [12.5, [900, 590, 1.07, 9, 0]],
  [14.9, [910, 585, 1.065, 9, -0.2]],
  [15.7, [1000, 545, 1.02, 8, 0]],
  [19.7, [990, 545, 1.02, 8, 0]],
  [20.5, [1000, 530, 0.99, 11, 0]],
  [21.6, [990, 532, 1.0, 9, 0]],
  [23.8, [985, 535, 1.0, 9, 0]],
  [24.4, [1000, 530, 0.99, 10, 0]],
  [26.7, [962, 540, 0.985, 8, 0]],
  [28.3, [966, 538, 0.985, 8, 0]],
  [29.45, [1152, 534, 1.03, 9, 0]],
  [30.5, [862, 430, 1.22, 7, 0]],
  [31.5, [862, 600, 1.22, 7, 0]],
  [32.35, [820, 700, 1.3, 6, 0]],
  [33.4, [820, 650, 1.42, 6, 0]],
  [35.05, [826, 650, 1.4, 6, 0]],
  [36.5, [1470, 420, 1.18, 7, 0]],
  [37.45, [1152, 534, 1.03, 9, 0]],
  [38.6, [862, 400, 1.2, 7, 0]],
  [40.3, [862, 560, 1.2, 7, 0]],
  [41.8, [862, 740, 1.2, 7, 0]],
  [43.2, [1470, 320, 1.2, 7, 0]],
  [44.7, [1470, 470, 1.2, 7, 0]],
  [45.75, [1152, 534, 1.03, 9, 0]],
  [46.8, [850, 420, 1.2, 7, 0]],
  [49.6, [850, 540, 1.18, 7, 0]],
  [50.5, [1152, 545, 1.0, 10, 0]],
  [53.15, [1152, 545, 1.0, 10, 0]],
  [53.9, [1470, 400, 1.2, 7, 0]],
  [56.6, [1470, 540, 1.2, 7, 0]],
  [57.9, [1450, 640, 1.26, 7, 0]],
  [59.35, [1440, 620, 1.22, 7, 0]],
  [60.2, [1152, 534, 1.0, 10, 0]],
  [61.3, [1152, 530, 1.02, 8, 0]],
  [63.6, [1300, 520, 1.06, 8, 0]],
  [65.9, [1478, 540, 0.98, 5, 0]],
  [70, [1478, 540, 0.93, 4, -1]],
];

let T, B, world, sheet, pg, ptr, btnAt, cardEl, pen, ball, FX, segs, ballSegs, tipEl, tipHl, cover, tabs;
const TABS_AT = 26.72;

function camAt(t) {
  const [cx, cy, zoom, tilt, roll] = keys(t, CAM, ease.inOutSine);
  const live = clamp((t - 4.6) / 1.5);
  let bump = 0;
  for (const s of P.STAMPS) { const d = t - s; if (d >= 0 && d < 0.5) bump += Math.exp(-d * 11) * Math.sin(d * 70) * 2.2; }
  return {
    cx: cx + noise(t * 0.17, 1) * 7 * live, cy: cy + noise(t * 0.15, 2) * 5 * live + bump,
    zoom: zoom * (1 + 0.003 * bump / 2.2), tilt, roll: roll + noise(t * 0.11, 3) * 0.25 * live,
  };
}

function makeSheet() {
  const root = el("div", "sheet", world);
  const r = el("div", "sh-half sh-r", root), l = el("div", "sh-half sh-l", root);
  const fR = el("div", "sh-face", r), fL = el("div", "sh-face", l), bL = el("div", "sh-face sh-back", l);
  const wR = el("div", "sh-full", fR), wL = el("div", "sh-full", fL);
  wR.style.left = "-960px";
  todayPage(wR);
  pg = todayPage(wL);
  const pR = el("div", "sh-paper", fR), pL = el("div", "sh-paper", fL);
  pR.style.backgroundImage = pL.style.backgroundImage = `url(${T.plain})`;
  bL.style.backgroundImage = `url(${T.plain})`;
  const shR = el("div", "sh-shade sh-shade-r", fR), shL = el("div", "sh-shade sh-shade-l", fL), shB = el("div", "sh-shade sh-shade-b", bL);
  return { root, r, l, fR, fL, bL, pR, pL, shR, shL, shB };
}

function makeProps() {
  const cup = el("div", "cup", world, `<div class="cup-saucer"></div><div class="cup-body"><div class="cup-coffee"></div></div><div class="cup-handle"></div>`);
  cup.style.cssText = "left:30px;top:880px;";
  [["#7aa7ff", 640, -6], ["#b28cff", 790, -22], ["#ffb547", 934, -2]].forEach(([c, x, y], i) => {
    const r = el("div", "roll", world, `<div class="roll-core"></div>`);
    r.style.cssText = `left:${x}px;top:${y}px;--tc:${c};transform:rotate(${[12, -20, 34][i]}deg);`;
  });
  const clip = el("div", "pclip", world, `<svg viewBox="0 0 30 80"><path d="M9 70 L9 14 a6 6 0 0 1 12 0 L21 62 a9 9 0 0 1 -18 0 L3 20" fill="none" stroke="#b9c0c7" stroke-width="2.4" stroke-linecap="round"/></svg>`);
  clip.style.cssText = "left:1720px;top:-30px;transform:rotate(38deg);";
}

function makeTabs() {
  return SRC_ORDER.map((id, i) => {
    const tab = el("div", "etab", B.root, `<i>${sourceIcon(id)}</i><svg viewBox="0 0 30 30"><path d="M5 16 L12 23 L26 6"/></svg>`);
    tab.style.cssText = `top:${70 + i * 98}px;--tc:${sourceById[id].hue};`;
    return tab;
  });
}

function makeTip() {
  // The footnote's source, as a tip-in slip hinged on footnote 2: it flips up to show the line it came from.
  const m = reads.slack[2];
  tipEl = el("div", "tip", B.over);
  const face = el("div", "tip-face", tipEl, `
    <div class="tip-h"><i class="fi" style="--h:#b28cff">${icons.slack}</i><b>${sourceById.slack.name}</b><span>${m.where} · ${m.when}</span><em>Open in ${sourceById.slack.name} ${icons.link}</em></div>
    <div class="tip-m"><div class="ck-av s">R</div><div><b>${m.who}</b><p><span class="hlw tip-hl">${m.text.split(". ")[0]}.</span> ${m.text.split(". ").slice(1).join(". ")}</p></div></div>
    <div class="tip-f"><sup class="fn">2</sup> the line this fact came from</div>`);
  tipHl = face.querySelector(".tip-hl");
  const back = el("div", "tip-back", tipEl);
  back.style.backgroundImage = `url(${T.clip})`;
  face.style.backgroundImage = `url(${T.clip})`;
  return { face, back };
}

// When every line is written, and how.
const CASCADES = [];
const K = (pre) => [...LINES.keys()].filter((k) => k === pre || k.startsWith(pre + "."));
function cascade(keys, start, opt) { const end = write(keys, start, { mode: "cascade", ...opt }); CASCADES.push(keys.map((k) => LINES.get(k))); return end; }
function seq(keys, start, opt) { const end = write(keys, start, { mode: "pen", ...opt }); keys.forEach((k) => { LINES.get(k).mode = "seq"; }); return end; }

function schedule() {
  // the card: each step's line at its start, its time when it ticks; each source's row when read
  STEP_START.forEach((a, i) => seq(K(`C.s${i}`), a, { cps: 80, gap: 0.04 }));
  STEP_DONE.forEach((a, i) => seq(K(`C.t${i}`), a + 0.12, { cps: 22 }));
  SRC_ORDER.forEach((id, i) => { const e = seq(K(`C.r${i}`), SRC[id].row - 0.05, { cps: 40 }); seq(K(`C.f${i}`), e, { cps: 90 }); });
  // setup notes, under the pen
  write(K("L1.name"), 8.42, { cps: 9 });
  write(K("L1.dir"), SRC.directory.note, { cps: 64 });
  write(K("R1.docs"), SRC.docs.note, { cps: 64 });
  write(K("L1.slack"), SRC.slack.note, { cps: 62 });
  write(K("R1.code"), SRC.code.note, { cps: 66 });
  write(K("R1.tix"), SRC.tickets.note, { cps: 66, gap: 0.05 });
  write(K("R1.mail"), SRC.mail.note, { cps: 72, gap: 0.05 });
  // step 3: "What I learned", written fast
  let e = write(K("L2.h"), 21.42, { cps: 42 });
  cascade([...K("L2.asof"), ...K("L2.sum"), ...K("F0"), ...K("F1"), ...K("L2.fn")], e + 0.02, { stagger: 0.07, dur: 0.32 });
  cascade([...K("F2"), ...K("F3"), ...K("F4"), ...K("F5"), ...K("R2.fn")], 22.2, { stagger: 0.064, dur: 0.3 });
  // step 4: "Your brief"
  e = write(K("L3.h"), 24.78, { cps: 40 });
  cascade([...K("L3.d"), ...K("L3.lead"), ...K("B0"), ...K("B1")], e - 0.02, { stagger: 0.056, dur: 0.3 });
  cascade([...K("B2"), ...K("B3"), ...K("R3.hint")], 25.35, { stagger: 0.056, dur: 0.3 });
  // Ask your Peer
  e = write(K("L4.h"), ASK.head, { cps: 40 });
  cascade([...K("L4.try"), ...K("L4.ex")], e + 0.02, { stagger: 0.1, dur: 0.34 });
  write([...K("Q.0"), ...K("Q.1"), ...K("Q.sig")], ASK.write, { cps: 24, gap: 0.1 });
  write(K("L4.s"), ASK.search, { cps: 72 });
  e = write(K("R4.h"), ASK.answer, { cps: 30 });
  cascade(K("R4.q"), e, { dur: 0.35 });
  e = write(K("R4.a"), e + 0.08, { cps: 132, gap: 0.05 });
  cascade(K("R4.fn"), e + 0.05, { stagger: 0.09, dur: 0.3 });
  // the house rules and the last page are already written
  preset([...K("R5"), ...K("L5")]);
}

function buildSegs() {
  const S = [];
  for (const L of LINES.values()) if (L.mode === "pen" && !L.key.startsWith("Q.")) S.push({ a: L.t0, b: L.t1, line: L });
  for (const lines of CASCADES) S.push({ a: Math.min(...lines.map((l) => l.t0)), b: Math.max(...lines.map((l) => l.t1)), lines });
  const R = B.root;
  const at = (k, dx, dy, side) => { const L = LINES.get(k); return { x: L.x + (side === "R" ? PW : 0) + dx, y: L.y + dy }; };
  const up = (a, b) => ({ a, b, box: R, x: 470, y: -40, lift: 90 });
  const n2 = at("L2.fn.1", 0, 0, "L");
  const lastA = Math.max(...K("R4.fn").map((k) => LINES.get(k).t1));
  const parks = [
    { a: -10, b: 7.95, sx: 2300, sy: 240, lift: 80 },
    { a: 12.55, b: 13.95, box: R, x: 540, y: 520, lift: 34 },
    { a: 15.78, b: 16.45, box: R, x: PW + 540, y: 300, lift: 30 },
    { a: 17.72, b: 18.35, box: R, x: PW + 380, y: 560, lift: 30 },
    up(20.12, 21.28), up(23.84, 24.62),
    { a: 26.75, b: 28.3, box: cardEl, x: 340, y: 520, lift: 40 },
    up(28.45, 29.6),
    { a: 29.7, b: 31.0, box: R, x: 540, y: 400, lift: 26 },
    { a: 31.1, b: 31.6, box: R, x: 560, y: 600, lift: 24 },
    { a: 31.7, b: 32.5, box: R, x: n2.x + 26, y: n2.y + 8, lift: 10 },
    { a: 32.6, b: 35.0, box: R, x: 590, y: 470, lift: 46 },
    { a: 35.6, b: 36.85, box: R, x: PW + 570, y: 300, lift: 30 },
    up(36.98, 38.02),
    { a: 38.25, b: 38.9, box: R, x: 600, y: 230, lift: 30 },
    ...BRIEF.items.map((a, i) => {
      const k = K(`B${i}.x`).slice(-1)[0];
      if (!k) throw new Error(`no Next line for item ${i}`);
      const p = at(k, 0, 0, i < 2 ? "L" : "R");
      return { a: a - 0.05, b: a + 1.15, box: R, x: p.x + LINES.get(k).w + 36, y: p.y + 22, lift: 20 };
    }),
    up(45.3, 46.32),
    { a: 47.3, b: 49.6, box: R, x: 600, y: 330, lift: 44 },
    { ...up(50.35, 53.12), y: -90, lift: 100 },
    { a: lastA + 0.1, b: 59.4, box: R, x: PW + 560, y: 640, lift: 30 },
    { ...up(59.45, 60.6), y: -90, lift: 100 },
    { a: 60.7, b: 61.6, box: R, x: 540, y: 190, lift: 30 },
    { a: 61.8, b: 64.6, box: R, x: PW + 590, y: 420, lift: 30 },
    { a: 64.65, b: 65.8, box: R, x: 1180, y: 120, lift: 110 },
    { a: 66.1, b: 99, box: R, x: PW + 410, y: 650, lift: 0 },
  ];
  S.push(...parks);
  S.sort((x, y) => x.a - y.a);
  // no two at once: a later segment starts when the one before ends (or is dropped if covered)
  const out = [];
  for (const s of S) {
    const prev = out[out.length - 1];
    if (prev && s.a < prev.b + 0.02) {
      if (s.b <= prev.b + 0.1) continue;
      s.a = prev.b + 0.02;
    }
    out.push(s);
  }
  return out;
}
function buildBallSegs() {
  const S = [{ a: -10, b: 47.25, sx: 160, sy: 1400, lift: 70 }];
  for (const k of ["Q.0", "Q.1", "Q.sig"]) { const L = LINES.get(k); S.push({ a: L.t0, b: L.t1, line: L }); }
  S.push({ a: 50.05, b: 99, sx: 120, sy: 1450, lift: 80 });
  return S;
}

function pointerAt(t) {
  if (t < 5.3) {
    const [x, y] = keys(t, [[3.1, [1500, 960]], [4.25, btnAt], [5.3, btnAt]]);
    const down = Math.max(0, 1 - Math.abs(t - CLICK) / 0.12);
    return { x, y, down, op: (t < 3.0 ? 0 : 1) * (1 - prog(t, 4.75, 5.15)) };
  }
  for (const id of ["slack", "code", "tickets"]) {
    const S = SRC[id];
    if (t < S.ptr[0] || t > S.ptr[1]) continue;
    const stk = P.HOOKS[`stk.${id}`], wrap = P.HOOKS[`clip.${id}`];
    const c = proj(wrap, stk.offsetLeft + 62, stk.offsetTop + 34);
    if (!c) return null;
    const a = [c[0] + 210, 1180], b = [c[0] + 300, 1200];
    const p = t < S.click ? keys(t, [[S.ptr[0], a], [S.click - 0.12, c]], ease.outCubic) : keys(t, [[S.click + 0.12, c], [S.ptr[1], b]], ease.inCubic);
    const down = Math.max(0, 1 - Math.abs(t - S.click) / 0.1);
    return { x: p[0], y: p[1], down, op: Math.min(prog(t, S.ptr[0], S.ptr[0] + 0.15), 1 - prog(t, S.ptr[1] - 0.15, S.ptr[1])) };
  }
  return null;
}

export default {
  captions: [
    { at: 3.1, to: 5.4, text: captionWords.click },
    { at: 7.75, to: 10.1, text: captionWords.directory },
    { at: 10.2, to: 12.7, text: captionWords.search },
    { at: 12.8, to: 16.6, text: captionWords.connect },
    { at: 20.2, to: 23.6, text: captionWords.write },
    { at: 23.8, to: 26.5, text: captionWords.brief },
    { at: 28.9, to: 32.7, text: captionWords.learned },
    { at: 38.3, to: 42.1, text: captionWords.yourBrief },
    { at: 45.6, to: 49.4, text: captionWords.ask },
    { at: 53.8, to: 57.6, text: captionWords.answer },
    { at: 60.8, to: 64.6, text: captionWords.rules },
  ],

  async init(stage) {
    T = await makeTextures();
    const camEl = el("div", "nb-cam", stage);
    world = el("div", "nb-world", camEl);
    el("div", "nb-desk", world).style.backgroundImage = `url(${T.oak})`;
    makeProps();
    sheet = makeSheet();
    btnAt = centre(pg.button);
    cardEl = P.buildCard(world, T).card;
    B = makeBook(world, { sx: SX, ty: TY });
    B.boardR.style.backgroundImage = B.boardL.style.backgroundImage = `url(${T.cloth})`;
    for (const id of Object.keys(BUILD)) {
      const side = id === "cover" || id.startsWith("R") || id === "blankR" ? "R" : "L";
      addPage(B, id, side, kindOf(id), (p) => {
        if (kindOf(id) !== "cover") p.style.backgroundImage = `url(${id === "L1" || id === "R5" ? T.end : id === "L5" ? T.plain : T.paper})`;
        BUILD[id](p, { live: true, T, page: id, timed: [] });
      });
    }
    cover = B.pages.cover;
    measureLines();
    schedule();
    // the leaves: still copies of their pages on narrow strips, built once the lines are measured
    const fillFor = (front, back, board) => (c, side, i, timed) => {
      const id = side === "F" ? front : back;
      const ctx = { live: false, T, page: id, timed };
      if (board) {
        c.style.width = `${PW + BO}px`;
        c.style.height = `${PH + 2 * BO}px`;
        if (id === "cover") { const p = el("div", "pg cover in-leaf", c); P.buildCover(p, ctx); return; }
        const b = el("div", "board-in", c);
        b.style.backgroundImage = `url(${T.cloth})`;
        const p = el("div", `pg ${kindOf(id)} in-board`, b);
        p.style.backgroundImage = `url(${id === "L1" ? T.end : T.plain})`;
        BUILD[id](p, ctx);
        return;
      }
      const p = el("div", `pg ${kindOf(id)}`, c);
      p.style.backgroundImage = `url(${id === "L1" || id === "R5" ? T.end : id === "L5" ? T.plain : T.paper})`;
      BUILD[id](p, ctx);
    };
    LEAF_PAGES.forEach((lp, i) => {
      const board = i === 0;
      makeLeaf(B, { n: board ? 1 : i <= 4 ? 14 : 6, rigid: board, board, bend: i >= 5 ? 0.85 : 1, fill: fillFor(lp.front, lp.back, board) });
    });
    makeLeaf(B, { n: 1, rigid: true, board: true, fill: fillFor("cover", "L5", true) });
    makeTip();
    tabs = makeTabs();
    pen = makePen(stage);
    ball = makePen(stage, true);
    FX = makeLight(stage, T);
    ptr = pointer(stage);
    segs = buildSegs();
    ballSegs = buildBallSegs();
    window.__nb = { LINES, segs, B, P, camAt };
  },

  render(t) {
    const cam = camAt(t);
    css(world, "transform", `translate(960px, 540px) rotateX(${cam.tilt.toFixed(3)}deg) rotateZ(${cam.roll.toFixed(3)}deg) scale(${cam.zoom.toFixed(4)}) translate(${(-cam.cx).toFixed(2)}px, ${(-cam.cy).toFixed(2)}px)`);

    // Today's page: shrinks onto the desk, turns to paper, folds shut, becomes the cover.
    const sOn = t < SHEET.morph[1] + 0.05;
    css(sheet.root, "display", sOn ? "block" : "none");
    if (sOn) {
      const k = ease.inOutCubic(prog(t, SHEET.shrink[0], SHEET.shrink[1]));
      const sc = 1 - k / 3;
      const m = ease.inOutSine(prog(t, SHEET.morph[0], SHEET.morph[1]));
      const sy = 1 + 0.172 * m;
      css(sheet.root, "transform", `translate(${(512 * k).toFixed(2)}px, ${(178 * k + 540 * sc * (1 - sy)).toFixed(2)}px) scale(${sc.toFixed(4)}, ${(sc * sy).toFixed(4)})`);
      const f = ease.inOutSine(prog(t, SHEET.fold[0], SHEET.fold[1]));
      css(sheet.l, "transform", `translateZ(0.6px) rotateY(${(180 * f).toFixed(2)}deg)`);
      const paper = 0.5 * ease.inOutSine(prog(t, SHEET.shrink[0] + 0.3, SHEET.shrink[1]));
      css(sheet.pR, "opacity", paper.toFixed(3));
      css(sheet.pL, "opacity", paper.toFixed(3));
      // as it becomes paper it lies on the desk: a soft shadow under it
      const sh = `${(16 * k).toFixed(1)}px ${(24 * k).toFixed(1)}px ${(30 * k).toFixed(1)}px rgba(50, 30, 10, ${(0.4 * k).toFixed(3)})`;
      css(sheet.fR, "boxShadow", sh);
      css(sheet.fL, "boxShadow", sh);
      const fs = Math.sin(Math.PI * f);
      css(sheet.shR, "opacity", (0.38 * fs).toFixed(3));
      css(sheet.shL, "opacity", (0.3 * clamp(f * 2)).toFixed(3));
      css(sheet.shB, "opacity", (0.25 * fs).toFixed(3));
      for (const e of [sheet.fR, sheet.fL, sheet.bL]) css(e, "opacity", (1 - m).toFixed(3));
      const down = Math.max(0, 1 - Math.abs(t - CLICK) / 0.12);
      css(pg.button, "transform", `scale(${(1 - 0.05 * down + 0.04 * (spring(t, 4.5, 3, 0.4) - (t > 4.5 ? 1 : 0))).toFixed(4)})`);
    }

    // The setup card slides onto the desk.
    {
      const k = prog(t, CARD_IN[0], CARD_IN[1]);
      css(cardEl, "visibility", t >= CARD_IN[0] ? "visible" : "hidden");
      const e = ease.outCubic(k), air = 1 - ease.inOutQuad(k);
      const settle = t > CARD_IN[1] ? 1 - spring(t, CARD_IN[1], 3, 0.45) : 0;
      const off = ease.inOutCubic(prog(t, 28.45, 29.4));
      css(cardEl, "display", off >= 1 ? "none" : "block");
      css(cardEl, "transform", `translate(${(-620 * (1 - e) - 640 * off).toFixed(1)}px, ${(90 * (1 - e) - Math.sin(Math.PI * k) * 36 + 50 * off).toFixed(1)}px) rotate(${(-1.6 - 11 * (1 - e) + settle * 1.2 - 7 * off).toFixed(2)}deg) scale(${(1 + 0.07 * air).toFixed(4)})`);
      css(cardEl, "filter", `drop-shadow(${(1.5 + 16 * air).toFixed(1)}px ${(2.5 + 24 * air).toFixed(1)}px ${(2 + 18 * air).toFixed(1)}px rgba(48,30,12,.28)) drop-shadow(${(6 + 10 * air).toFixed(1)}px ${(10 + 14 * air).toFixed(1)}px ${(14 + 14 * air).toFixed(1)}px rgba(48,30,12,.13))`);
    }

    // The notebook.
    const coverFade = ease.inOutSine(prog(t, SHEET.morph[0], SHEET.morph[0] + 0.5));
    const st = renderBook(B, t, { leafPages: LEAF_PAGES, inside: "R5", coverFade });
    const shown = (id) => id === st.left || id === st.right || id === "card";
    renderInk(t, shown);
    for (const [id, fns] of Object.entries(P.ANIMS)) if (shown(id)) for (const f of fns) f(t);

    // The sources line: each source's washi tab slides out of the fore-edge, ticked.
    tabs.forEach((tb, i) => {
      const a = TABS_AT + i * 0.15;
      const k = t < a ? 0 : spring(t, a, 2.4, 0.5);
      css(tb, "visibility", t >= a && t < CLOSE[0] + 99 ? "visible" : "hidden");
      css(tb, "transform", `translateZ(0.3px) translateX(${(-74 * (1 - Math.min(1.08, k))).toFixed(1)}px)`);
    });

    // The gold foil catches the light as the cover forms, and again when it closes.
    if (P.HOOKS.coverFoil && st.right === "cover") {
      const sh = Math.max(prog(t, 6.62, 7.15), prog(t, CLOSE[1] + 0.05, CLOSE[1] + 0.9));
      for (const e of P.HOOKS.coverFoil) css(e, "backgroundPosition", `${(100 - 100 * ease.inOutSine(sh)).toFixed(1)}% 0`);
    }

    // The trace: footnote 2 glows, and its source flips up from the page.
    {
      const fn = P.HOOKS.footnote2;
      const g = Math.min(prog(t, LEARN.glow, LEARN.glow + 0.3), 1 - prog(t, LEARN.fold[1], LEARN.fold[1] + 0.4));
      css(fn, "background", g > 0.01 ? `rgba(160, 245, 200, ${(0.55 * g).toFixed(3)})` : "transparent");
      css(fn, "boxShadow", g > 0.01 ? `0 0 ${(22 * g).toFixed(1)}px rgba(120, 240, 180, ${(0.7 * g).toFixed(3)})` : "none");
      const open = ease.inOutCubic(prog(t, LEARN.tip[0], LEARN.tip[1])) * (1 - ease.inOutCubic(prog(t, LEARN.fold[0], LEARN.fold[1])));
      const vis = st.left === "L2" && open > 0.001;
      css(tipEl, "display", vis ? "block" : "none");
      if (vis) css(tipEl, "transform", `translateZ(${(4 + 16 * Math.sin(Math.PI * Math.min(1, open))).toFixed(2)}px) rotateX(${(-180 + 180 * open).toFixed(2)}deg)`);
      css(tipHl, "backgroundSize", `${(100 * ease.inOutSine(prog(t, LEARN.tip[1] + 0.1, LEARN.tip[1] + 0.75))).toFixed(1)}% 78%`);
    }

    // The pen of light.
    const q = penAt(segs, t), q2 = penAt(segs, t - 1 / 30);
    posePen(pen, q, q2, cam.zoom, -32, t < 7.9 ? 0 : 1);
    const trail = [];
    if (q && t > 7.9) for (let i = 0; i < 12; i++) { const s = penAt(segs, t - i * 0.022); if (s) trail.push(s.p); }
    const speed = q && q2 ? Math.hypot(q.p[0] - q2.p[0], q.p[1] - q2.p[1]) : 0;
    renderTrail(FX, trail, clamp((speed - 8) / 30));
    // Ram's own ballpoint, only while he writes his question.
    const bq = penAt(ballSegs, t), bq2 = penAt(ballSegs, t - 1 / 30);
    posePen(ball, bq, bq2, cam.zoom, -24, t > 47.2 && t < 50.1 ? 1 : 0);

    // The mouse pointer: the first click, and each Connect.
    const pp = pointerAt(t);
    if (pp) ptr.at(pp.x, pp.y, pp.down, pp.op);
    else ptr.at(-100, -100, 0, 0);

    const sun = t * 3.2 + 170 * ease.inOutSine(prog(t, 20.3, 26.6));
    renderLight(FX, t, cam, sun, ease.inOutSine(prog(t, 4.7, 6.0)));
  },
};
