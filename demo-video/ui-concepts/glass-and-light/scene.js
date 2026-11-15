// Glass & Light: today's page in 3D glass, read by a living light. The click lifts the page and
// explodes it into layers (Ram's page, the Peer's workbench, six frosted source windows on an
// arc); the light reads each window as Ram, lines lift off as glass chips into the workbench, they
// become sentences with sources, four rise as the brief, and everything folds back into a calm
// glass page: What I learned, Your brief, Ask (it dives behind the glass and searches again), and
// the rules. Every pixel is drawn from t (see shared/runtime.js).
import { el, prog, ease, clamp, lerp, spring, noise, typed, path as crPath } from "../shared/kit.js";
import { todayPage, pointer, centre } from "../shared/page.js";
import { sources, steps, learned, brief, ask, rules, captionWords } from "../shared/data.js";
import { icons } from "../shared/icons.js";
import * as R from "./rig.js";
import * as PL from "./plan.js";
import * as UI from "./ui.js";
import * as L from "./light.js";
import { makeAurora } from "./aurora.js";

const { WIN, BENCH, MAIN, RAIL, CHIPS, FLY, READ, BRIEF_ROWS, BRIEF_RISE, RISE, ASK_VISITS, span, hold } = PL;
const d2r = Math.PI / 180;
const S = {};
const items = [];

// Floating cards on the page (page px, top-left) and their sizes.
const FACT_AT = (k) => [388 + (k % 3) * 496, 444 + Math.floor(k / 3) * 208];
const BRIEF_AT = (k) => [388, 290 + k * 152];
const RULE_AT = (k) => [388 + (k % 3) * 496, 236 + Math.floor(k / 3) * 262];
const ASKBOX_AT = [388, 196], ANSWER_AT = [388, 398];
const SENT_AT = (k) => 50.55 + k * 0.82;
const REWRITE = (k) => 17.45 + k * 0.42;

// ------------------------------------------------------------------ the item list
function item(e, w, h, opts = {}) {
  const it = { el: e, w, h, last: {}, visible: false, depth: 0, m: null, ...opts };
  items.push(it);
  return it;
}
function setDisp(it, on) {
  const v = on ? "" : "none";
  if (it.last.disp !== v) { it.el.style.display = v; it.last.disp = v; }
}
function put(it, model, alpha, cam) {
  if (!(alpha > 0.003)) { setDisp(it, false); it.visible = false; return false; }
  const pl = R.placement(cam, model, it.w, it.h);
  if (pl.near > R.P - 30) { setDisp(it, false); it.visible = false; return false; }
  setDisp(it, true);
  it.visible = true;
  it.depth = pl.depth + (it.bias || 0);
  it.m = pl.m;
  it.scale = pl.centre[2];
  if (it.last.css !== pl.css) { it.el.style.transform = pl.css; it.last.css = pl.css; }
  const op = alpha >= 0.999 ? "1" : alpha.toFixed(3);
  if (it.last.op !== op) { it.el.style.opacity = op; it.last.op = op; }
  return true;
}
// A point on an item (its local px) -> screen [x, y, scale].
const onItem = (it, u, v, z = 0) => R.persp(...R.apply(it.m, u, v, z));
const css = (e, k, v) => { if (e.style[k] !== v) e.style[k] = v; };
const op = (e, a) => css(e, "opacity", a >= 0.999 ? "1" : a <= 0.001 ? "0" : a.toFixed(3));
const shown = (e, on) => css(e, "display", on ? "" : "none");

// ------------------------------------------------------------------ init
export default {
  captions: [
    { at: 3.1, to: 5.5, text: captionWords.click },
    { at: 5.7, to: 8.3, text: captionWords.directory },
    { at: 8.4, to: 10.8, text: captionWords.search },
    { at: 10.9, to: 14.6, text: captionWords.connect },
    { at: 16.5, to: 20.5, text: captionWords.write },
    { at: 21.2, to: 24.6, text: captionWords.brief },
    { at: 28.8, to: 32.8, text: captionWords.learned },
    { at: 36.3, to: 40.3, text: captionWords.yourBrief },
    { at: 44.3, to: 47.3, text: captionWords.ask },
    { at: 50.6, to: 54.6, text: captionWords.answer },
    { at: 56.7, to: 60.3, text: captionWords.rules },
  ],

  async init(stage) {
    const scene = el("div", "gl-scene", stage);
    S.aur = makeAurora(scene);
    const world = el("div", "gl-world", scene);
    S.world = world;

    // Today's page, as the first incarnation of the page layer.
    const todayEl = el("div", "g3 today", world);
    S.pg = todayPage(todayEl);
    S.btnAt = centre(S.pg.button);
    S.today = item(todayEl, 1920, 1080, { bias: 260 });

    // The page: rail and main panel, with their glass rims.
    // Big panels sort as if a little farther, so their own cards and landing chips stay in front.
    S.railEdge = item(UI.edge(world, RAIL.w, RAIL.h, 28), RAIL.w, RAIL.h, { bias: 262 });
    S.mainEdge = item(UI.edge(world, MAIN.w, MAIN.h, 34), MAIN.w, MAIN.h, { bias: 262 });
    S.rail = UI.railPanel(world);
    S.railIt = item(S.rail.el, RAIL.w, RAIL.h, { bias: 260 });
    S.main = UI.mainPanel(world);
    S.mainIt = item(S.main.el, MAIN.w, MAIN.h, { bias: 260 });

    // The workbench and the six source windows.
    S.benchEdge = item(UI.edge(world, BENCH.w, BENCH.h, 36), BENCH.w, BENCH.h, { bias: 152 });
    S.bench = UI.benchPanel(world);
    S.benchIt = item(S.bench.el, BENCH.w, BENCH.h, { bias: 150 });
    S.winEdges = sources.map(() => item(UI.edge(world, WIN.w, WIN.h, 24), WIN.w, WIN.h, { bias: 62 }));
    S.wins = sources.map((s, i) => UI.sourceWindow(world, s, i));
    S.winIts = S.wins.map((w) => item(w.el, WIN.w, WIN.h, { bias: 60 }));
    S.connectAt = S.wins.map((w) => {
      if (!w.connectBtn) return null;
      const [x, y, bw, bh] = UI.offsetIn(w.connectBtn, w.el);
      return [x + bw / 2, y + bh / 2];
    });

    // Chips that fly: eight in setup, four amber ones for the brief, four in Ask.
    S.chips = UI.BENCH_ROWS.map((r) => item(UI.flyChip(world, r), UI.CHIP.w, UI.CHIP.h, { bias: -2 }));
    S.amber = BRIEF_ROWS.map((k) => item(UI.flyChip(world, UI.BENCH_ROWS[k], "amber"), UI.CHIP.w, UI.CHIP.h, { bias: -2 }));
    S.askChips = ask.sources.map((s) => item(UI.flyChip(world, { src: s.source, ref: s.ref, date: s.date }), UI.CHIP.w, UI.CHIP.h, { bias: -2 }));

    // Floating cards on the calm page.
    S.facts = learned.facts.map((f, k) => UI.factCard(world, f, k));
    S.factIts = S.facts.map((c) => item(c.el, 476, 196));
    S.briefs = brief.items.map((b, k) => UI.briefCard(world, b, k));
    S.briefIts = S.briefs.map((c) => item(c.el, 1452, 140));
    S.askBox = UI.askBox(world);
    S.askBoxIt = item(S.askBox.el, 1112, 84);
    S.answer = UI.answerCard(world);
    S.answerIt = item(S.answer.el, 1468, 470);
    S.rules = rules.map((r, k) => UI.ruleTile(world, r, k));
    S.ruleIts = S.rules.map((c) => item(c.el, 476, 250));

    // The light: a canvas sorted among the glass (so glass in front blurs it), and one on top.
    S.lightCv = el("canvas", "gl-light", world);
    S.lightCv.width = 1920; S.lightCv.height = 1080;
    S.lctx = S.lightCv.getContext("2d");
    S.lightIt = item(S.lightCv, 1920, 1080, { canvas: true });
    S.fxCv = el("canvas", "gl-fx", world);
    S.fxCv.width = 1920; S.fxCv.height = 1080;
    S.fx = S.fxCv.getContext("2d");

    // Screen-space: the steps pill, the light's AI label, the pointer.
    S.hud = UI.hud(scene);
    S.label = UI.orbLabel(scene);
    S.ptr = pointer(scene);

    // Measured layout (page px) for the light's path and the threads.
    const mainPt = (e) => { const [x, y, w, h] = UI.offsetIn(e, S.main.el); return [MAIN.x + x, MAIN.y + y, w, h]; };
    S.words = S.main.words.map(mainPt);
    S.fchipAt = S.main.foundChips.map(mainPt);
    S.factChipAt = S.facts.map((c) => UI.offsetIn(c.chip, c.el));
    S.nextAt = S.briefs.map((c) => UI.offsetIn(c.next, c.el));
    S.citeAt = S.answer.sens.map((s) => UI.offsetIn(s.querySelector(".cite"), S.answer.el));
    S.srcAt = S.answer.srcs.map((s) => UI.offsetIn(s, S.answer.el));
    S.sentTop = [];
    let y = 82;
    S.answer.sens.forEach((s) => { s.style.top = y + "px"; S.sentTop.push(y); y += s.offsetHeight + 16; });
    S.citeAt = S.answer.sens.map((s) => UI.offsetIn(s.querySelector(".cite"), S.answer.el));
    S.answer.srcs.forEach((s, k) => { s.style.top = 74 + k * 76 + "px"; });
    S.srcAt = S.answer.srcs.map((s) => UI.offsetIn(s, S.answer.el));
  },

  render(t) {
    const cam = PL.cameraAt(t);
    const calm = span(t, 24.6, 26.4) * (1 - 0.8 * hold(t, 46.4, 47.2, 49.9, 50.6));
    S.calm = calm;
    S.aur.render(t, {
      calm,
      lift: 0.85 * hold(t, 4.42, 4.62, 4.8, 5.9, ease.outCubic),
      flare: [S.btnAt[0] / 1920, S.btnAt[1] / 1080],
    });

    drawPage(t, cam);
    drawBench(t, cam);
    drawWindows(t, cam);
    drawChips(t, cam);
    drawCards(t, cam);
    const orb = drawOrbItem(t, cam);

    // Paint order: farthest first.
    const vis = items.filter((it) => it.visible);
    vis.sort((a, b) => b.depth - a.depth);
    vis.forEach((it, k) => { const z = String(10 + k); if (it.last.z !== z) { it.el.style.zIndex = z; it.last.z = z; } });

    drawLight(t, cam, orb);
    drawHud(t);
    drawPointer(t);
  },
};

// ------------------------------------------------------------------ the page
function drawPage(t, cam) {
  const pm = PL.pageModel(t);
  S.pm = pm;
  const tilt = clamp(Math.abs(PL.camParams(t)[4]) / 14);
  // Today's page, then its glass self.
  put(S.today, pm, 1 - span(t, 4.75, 5.55), cam);
  const down = Math.max(0, 1 - Math.abs(t - 4.44) / 0.1);
  const pop = spring(t, 4.5, 2.6, 0.38);
  css(S.pg.button, "transform", `scale(${(1 - 0.06 * down + 0.05 * (t > 4.5 ? pop - 1 : 0)).toFixed(4)})`);
  const glow = hold(t, 4.42, 4.55, 4.7, 5.3);
  css(S.pg.button, "boxShadow", glow > 0.001 ? `0 6px 18px rgba(22,115,83,.28), 0 0 ${(60 * glow).toFixed(0)}px ${(18 * glow).toFixed(0)}px rgba(120,245,215,${(0.85 * glow).toFixed(3)})` : "");

  const glassIn = span(t, 4.6, 5.4);
  put(S.railEdge, R.mul(pm, R.T(RAIL.x, RAIL.y, -16)), glassIn * tilt, cam);
  put(S.mainEdge, R.mul(pm, R.T(MAIN.x, MAIN.y, -16)), glassIn * tilt, cam);
  put(S.railIt, R.mul(pm, R.T(RAIL.x, RAIL.y, 0)), glassIn, cam);
  put(S.mainIt, R.mul(pm, R.T(MAIN.x, MAIN.y, 0)), glassIn, cam);

  // The glass clears while a fact is traced to its source behind it.
  const clr = hold(t, 32.2, 32.9, 34.3, 35.0);
  const m = S.main.el;
  if (clr > 0.001) {
    css(m, "backdropFilter", `blur(${(26 * (1 - clr)).toFixed(1)}px) saturate(${(1.75 - 0.5 * clr).toFixed(2)})`);
    css(m, "background", `linear-gradient(158deg, rgba(255,255,255,${(0.88 - 0.66 * clr).toFixed(3)}) 0%, rgba(255,255,255,${(0.66 - 0.5 * clr).toFixed(3)}) 46%, rgba(255,255,255,${(0.74 - 0.56 * clr).toFixed(3)}) 100%)`);
  } else {
    css(m, "backdropFilter", "");
    css(m, "background", "");
  }

  // A light sweep crosses the page as it settles, and again while the summary writes itself in.
  const u1 = prog(t, 26.2, 27.4), u2 = prog(t, 27.9, 29.9);
  if (u2 > 0) sheen(S.main.sheen, u2, 0.55 * Math.sin(Math.PI * u2));
  else sheen(S.main.sheen, u1, 0.5 * Math.sin(Math.PI * u1));
  // Rail: the highlight follows the section; each source ticks once read.
  const idx = span(t, 27.35, 27.8) + span(t, 35.45, 35.9) + span(t, 43.95, 44.4) + span(t, 56.45, 56.9);
  css(S.rail.hl, "transform", `translateY(${(idx * 48).toFixed(2)}px)`);
  S.rail.srcItems.forEach((s, k) => {
    const done = READ[k].scan[1];
    const p = clamp(spring(t, done, 2.4, 0.42));
    op(s.tick, Math.min(1, (t - done) * 6));
    css(s.tick, "transform", `scale(${(0.4 + 0.6 * p).toFixed(3)})`);
  });

  // Main panel sections.
  const secs = S.main.secs;
  const secK = {
    setup: 1 - span(t, 27.3, 27.75),
    learned: Math.min(span(t, 27.55, 28.1), 1 - span(t, 35.3, 35.75)),
    brief: Math.min(span(t, 35.65, 36.2), 1 - span(t, 43.85, 44.25)),
    ask: Math.min(span(t, 44.15, 44.6), 1 - span(t, 56.3, 56.7)),
    rules: span(t, 56.65, 57.1),
  };
  for (const [name, k] of Object.entries(secK)) {
    shown(secs[name], k > 0.001);
    op(secs[name], k);
    css(secs[name], "transform", `translateY(${((1 - k) * 14).toFixed(2)}px)`);
  }
  drawSetupSection(t);
  drawLearnedSection(t);
  drawAskSection(t);
}

function stepState(t, s) {
  const [a, b] = PL.B.steps[s];
  return { k: prog(t, a, b), done: t >= b, at: b };
}
function ringStyle(ring, fill, k, done) {
  css(fill, "background", done ? "#167353" : `conic-gradient(#1aa37a ${(k * 360).toFixed(1)}deg, rgba(15,30,50,.13) 0)`);
  css(fill, "webkitMask", done ? "none" : "radial-gradient(circle, transparent 10px, #000 10.5px)");
  css(fill, "mask", done ? "none" : "radial-gradient(circle, transparent 10px, #000 10.5px)");
  op(ring.querySelector("svg"), done ? 1 : 0);
}

function drawSetupSection(t) {
  const M = S.main;
  const rd = span(t, 25.0, 25.6);
  op(M.suHead.children[0], 1 - rd);
  op(M.suHead.children[1], span(t, 25.2, 25.85));
  css(M.suHead.children[1], "transform", `translateY(${((1 - span(t, 25.2, 25.85)) * 16).toFixed(2)}px)`);
  op(M.suSub.children[0], 1 - rd);
  op(M.suSub.children[1], span(t, 25.3, 25.9));
  M.stepRows.forEach((r, s) => {
    const st = stepState(t, s);
    ringStyle(r.ring, r.fill, st.k, st.done);
    const p = clamp(spring(t, st.at, 2.4, 0.42));
    op(r.tm, st.done ? 1 : 0);
    css(r.tm, "transform", `scale(${(0.6 + 0.4 * p).toFixed(3)})`);
    op(r.r, 0.45 + 0.55 * clamp(st.k * 4 + (st.done ? 1 : 0)));
  });
  M.gaveItems.forEach((g, k) => {
    const p = clamp(spring(t, 25.7 + k * 0.1, 2.2, 0.45), 0, 1.2);
    op(g, Math.min(1, Math.max(0, (t - 25.7 - k * 0.1) * 5)));
    css(g, "transform", `translateY(${((1 - Math.min(1, p)) * 14).toFixed(2)}px) scale(${(0.94 + 0.06 * p).toFixed(3)})`);
  });
  const bfk = span(t, 21.0, 21.5);
  op(M.bfH, bfk);
  M.slots.forEach((s, k) => {
    const land = BRIEF_RISE(k) + RISE;
    op(s.s, bfk);
    op(s.slot, t < land ? 1 : 0);
    const p = clamp(spring(t, land, 2.6, 0.4), 0, 1.3);
    op(s.chip, t >= land ? 1 : 0);
    css(s.chip, "transform", `scale(${(1 + 0.08 * Math.sin(Math.min(1, (t - land) / 0.35) * Math.PI) * (t >= land ? 1 : 0)).toFixed(4)})`);
    op(s.t, span(t, land + 0.05, land + 0.45));
  });
}

function drawLearnedSection(t) {
  const M = S.main;
  const n = M.words.length;
  M.words.forEach((w, i) => {
    const a = 28.05 + (i / n) * 1.7;
    const k = span(t, a, a + 0.22, ease.outCubic);
    op(w, k);
    css(w, "filter", k < 0.999 && k > 0.001 ? `blur(${((1 - k) * 4).toFixed(2)}px)` : "");
  });
  M.tags.forEach((g, k) => {
    const p = clamp(spring(t, 29.55 + k * 0.1, 2.4, 0.42), 0, 1.25);
    op(g, Math.min(1, Math.max(0, (t - 29.55 - k * 0.1) * 6)));
    css(g, "transform", `scale(${(0.82 + 0.18 * p).toFixed(3)})`);
  });
}

function drawAskSection(t) {
  const M = S.main;
  M.examples.forEach((e, k) => {
    const p = clamp(spring(t, 44.55 + k * 0.1, 2.4, 0.45), 0, 1.2);
    op(e, Math.min(1, Math.max(0, (t - 44.55 - k * 0.1) * 6)));
    css(e, "transform", `translateY(${((1 - Math.min(1, p)) * 10).toFixed(2)}px)`);
  });
  const sa = hold(t, 46.35, 46.6, 49.8, 50.1), sb = span(t, 50.0, 50.4);
  op(M.status, Math.max(sa, sb));
  op(M.status.children[1], sa);
  op(M.status.children[2], sb);
  op(M.status.children[0], 0.55 + 0.45 * Math.sin(t * 9) * sa + 0.45 * sb);
  M.foundChips.forEach((c, k) => {
    const land = ASK_VISITS[k].at + 0.3 + 0.85;
    op(c, t >= land ? 1 : 0);
    const p = clamp(spring(t, land, 2.6, 0.4), 0, 1.3);
    css(c, "transform", `scale(${(0.85 + 0.15 * p).toFixed(3)})`);
  });
}

// ------------------------------------------------------------------ the workbench
function drawBench(t, cam) {
  const bm = PL.benchModel(t);
  const a = PL.benchAlpha(t);
  const tilt = clamp(Math.abs(PL.camParams(t)[4]) / 14);
  put(S.benchEdge, R.mul(bm, R.T(0, 0, -16)), a * tilt, cam);
  put(S.benchIt, bm, a, cam);
  if (!S.benchIt.visible) return;
  const B = S.bench;
  const tl = span(t, 20.4, 20.9);
  op(B.titleA, 1 - tl);
  op(B.titleB, tl);
  let landed = 0;
  B.rows.forEach((r, k) => {
    const land = CHIPS[k].at + FLY;
    if (t >= land) landed++;
    op(r.row.firstChild, t < land ? 1 : 0);
    const p = clamp(spring(t, land, 2.6, 0.4), 0, 1.3);
    op(r.chip, t >= land ? 1 : 0);
    css(r.chip, "transform", `scale(${(t >= land ? 0.92 + 0.08 * p : 1).toFixed(4)})`);
    const w = prog(t, REWRITE(k), REWRITE(k) + 0.75);
    op(r.raw, span(t, land + 0.05, land + 0.45) * (1 - span(t, REWRITE(k) + 0.05, REWRITE(k) + 0.5)));
    css(r.sen, "clipPath", `inset(0 ${((1 - ease.inOutSine(w)) * 100).toFixed(2)}% 0 0)`);
    op(r.sen, w > 0 ? 1 : 0);
    css(r.sweep, "transform", `translateX(${(-140 + ease.inOutSine(w) * 760).toFixed(1)}px)`);
    op(r.sweep, Math.sin(Math.PI * w));
    // Step 4: the brief rows glow amber.
    const bi = BRIEF_ROWS.indexOf(k);
    const amb = bi >= 0 ? hold(t, 21.25 + bi * 0.12, 21.6 + bi * 0.12, 24.0, 24.6) : 0;
    css(r.chip, "boxShadow", amb > 0.001 ? `inset 0 0 0 1.5px rgba(242,165,49,${(0.8 * amb).toFixed(3)}), 0 0 ${(30 * amb).toFixed(0)}px rgba(242,165,49,${(0.6 * amb).toFixed(3)}), 0 6px 18px rgba(8,18,38,.16)` : "");
    css(r.chip, "background", amb > 0.001 ? `rgba(255,${(255 - 8 * amb).toFixed(0)},${(255 - 23 * amb).toFixed(0)},.95)` : "");
  });
  const txt = t < 20.9 ? (landed ? `Read as ram · ${landed} item${landed > 1 ? "s" : ""}` : "Read as ram · nothing yet") : "8 items, each with its source and date";
  if (B.count.textContent !== txt) B.count.textContent = txt;
  // A sheen that moves with the camera's turn.
  sheen(B.sheen, 0.5 + PL.camParams(t)[3] / 60 + (t - 17) * 0.04, 0.3);
}

function sheen(i, u, a) {
  css(i, "transform", `translateX(${((u * 3.2 - 1.2) * 100).toFixed(1)}%) skewX(-20deg)`);
  op(i, a);
}

// ------------------------------------------------------------------ the source windows
const STATUS = {
  idle: [icons.lock, "Not read yet", "rgba(15,30,50,.06)", "#5b6676"],
  need: [icons.lock, "Needs Connect", "rgba(242,165,49,.18)", "#8a560a"],
  read: [icons.key, "Reading as ram", "rgba(45,212,191,.2)", "#0d6b5c"],
};
function drawWindows(t, cam) {
  const yaw = PL.camParams(t)[3];
  S.wins.forEach((w, i) => {
    const pose = PL.winPose(i, t);
    const model = PL.winModel(i, t, pose);
    put(S.winEdges[i], R.mul(model, R.T(0, 0, -14)), pose.alpha * 0.9, cam);
    if (!put(S.winIts[i], model, pose.alpha, cam)) return;
    const rd = READ[i];
    const scanK = prog(t, rd.scan[0], rd.scan[1]);
    // Depth of field in the close-ups: the windows around the one being read go soft.
    const close = hold(t, 6.9, 7.35, 12.85, 13.35);
    const FOC = [[7.3, 8.2], [8.75, 9.7], [10.4, 12.85]];
    const foc = i < 3 ? hold(t, FOC[i][0] - 0.45, FOC[i][0], FOC[i][1], FOC[i][1] + 0.4) : 0;
    const dof = 2.8 * close * (1 - foc);
    css(w.c, "filter", dof > 0.05 ? `blur(${dof.toFixed(2)}px)` : "");
    // Clearing: from frosted to sharp, as Ram.
    if (rd.connect == null) {
      const rev = ease.inOutSine(scanK);
      css(w.sharp, "clipPath", `inset(0 0 ${((1 - rev) * 100).toFixed(2)}% 0)`);
      css(w.frost, "clipPath", `inset(${(rev * 100).toFixed(2)}% 0 0 0)`);
      css(w.veil, "clipPath", `inset(${(rev * 100).toFixed(2)}% 0 0 0)`);
      css(w.sharp, "filter", "");
      op(w.sharp, 1); op(w.frost, 1); op(w.veil, rev < 1 ? 1 : 0);
    } else {
      const fp = span(t, rd.connect + 0.12, rd.connect + 0.8, ease.outCubic);
      css(w.sharp, "clipPath", "");
      css(w.frost, "clipPath", "");
      css(w.veil, "clipPath", "");
      op(w.sharp, fp);
      css(w.sharp, "filter", fp > 0.001 && fp < 0.999 ? `blur(${((1 - fp) * 10).toFixed(2)}px)` : "");
      op(w.frost, 1 - fp);
      op(w.veil, 1 - fp);
      // The Connect card, pressed, then gone; the "signed in" toast.
      const press = Math.max(0, 1 - Math.abs(t - rd.connect) / 0.09);
      const gone = span(t, rd.connect + 0.1, rd.connect + 0.45);
      op(w.connect, 1 - gone);
      shown(w.connect, gone < 0.999);
      css(w.connect, "transform", `scale(${(1 - 0.03 * press + 0.05 * gone).toFixed(4)})`);
      css(w.connectBtn, "transform", `scale(${(1 - 0.07 * press).toFixed(4)})`);
      const ts = hold(t, rd.connect + 0.15, rd.connect + 0.4, rd.connect + 1.15, rd.connect + 1.45);
      op(w.toast, ts);
      css(w.toast, "transform", `translateY(${((1 - ts) * -12).toFixed(2)}px)`);
    }
    // The window being read glows mint.
    const g0 = rd.connect != null ? rd.connect - 0.05 : rd.scan[0] - 0.35;
    let glowK = hold(t, g0, g0 + 0.3, rd.scan[1], rd.scan[1] + 0.5);
    const av = ASK_VISITS.filter((x) => x.win === i);
    for (const v of av) glowK = Math.max(glowK, 0.8 * hold(t, v.at - 0.15, v.at + 0.1, v.at + 0.45, v.at + 0.75));
    if (i === 1) glowK = Math.max(glowK, 0.7 * hold(t, 33.0, 33.4, 34.3, 34.8));
    css(w.el, "boxShadow", glowK > 0.001
      ? `inset 0 0 0 1px rgba(255,255,255,.5), 0 0 0 ${(2.5 * glowK).toFixed(2)}px rgba(130,250,225,${(0.85 * glowK).toFixed(3)}), 0 0 ${(80 * glowK).toFixed(0)}px rgba(70,235,205,${(0.6 * glowK).toFixed(3)}), 0 34px 80px -26px rgba(8,18,38,.45)`
      : "");
    // The beam's line, washing down the rows.
    const bodyH = WIN.h - 64;
    const sy = 8 + scanK * (bodyH - 16);
    const scanOn = scanK > 0 && scanK < 1 ? Math.min(1, Math.sin(Math.PI * scanK) * 3) : 0;
    css(w.scan, "transform", `translateY(${sy.toFixed(1)}px)`);
    op(w.scan, scanOn);
    css(w.band, "transform", `translateY(${(sy - 90).toFixed(1)}px)`);
    op(w.band, scanOn * 0.9);
    // Key lines glow as the beam passes, stay lit until they lift off, then rest softly.
    w.keys.forEach((kr, k) => {
      const [, ky, , kh] = w.keyBox[k];
      const passAt = rd.scan[0] + clamp((ky - 64 + kh / 2 - 8) / (bodyH - 16)) * (rd.scan[1] - rd.scan[0]);
      const chip = CHIPS.find((c) => c.win === i && c.key === k);
      const liftAt = chip ? chip.at : passAt + 0.4;
      let hot = span(t, passAt - 0.05, passAt + 0.15) * (1 - 0.7 * span(t, liftAt + 0.1, liftAt + 0.6));
      const v = ASK_VISITS.find((x) => x.win === i && x.key === k);
      if (v) hot = Math.max(hot, hold(t, v.at - 0.05, v.at + 0.12, v.at + 0.5, v.at + 0.8));
      if (i === 1 && k === 0) hot = Math.max(hot, hold(t, 33.0, 33.3, 34.4, 34.9));
      css(kr, "background", hot > 0.001 ? `rgba(120,240,215,${(0.3 * hot).toFixed(3)})` : "");
      css(kr, "boxShadow", hot > 0.001 ? `inset 0 0 0 1.5px rgba(30,190,160,${(0.6 * hot).toFixed(3)}), 0 0 26px rgba(80,230,200,${(0.45 * hot).toFixed(3)})` : "");
    });
    if (w.open) op(w.open, hold(t, 33.1, 33.5, 34.4, 34.9));
    // The status pill.
    const begin = rd.connect != null ? rd.connect + 0.15 : rd.scan[0] - 0.25;
    let key;
    if (t >= rd.scan[1]) key = "done";
    else if (t >= begin) key = "read";
    else if (rd.connect != null && t >= READ[i].arrive - 1.2) key = "need";
    else key = "idle";
    if (w.status.dataset.k !== key) {
      w.status.dataset.k = key;
      if (key === "done") {
        w.status.innerHTML = `${icons.check}<span>${w.src.found}</span>`;
        w.status.style.background = "#167353";
        w.status.style.color = "#fff";
      } else {
        const [ic, tx, bg, fg] = STATUS[key];
        w.status.innerHTML = `${ic}<span>${tx}</span>`;
        w.status.style.background = bg;
        w.status.style.color = fg;
      }
    }
    // A sheen that slides as the camera turns past.
    const wy = -pose.rot / d2r;
    sheen(w.sheen, 0.5 + (yaw - wy) / 70, 0.32 * clamp(1 - Math.abs(yaw - wy) / 80));
  });
}

// ------------------------------------------------------------------ chips in flight
function bez(p0, p1, p2, p3, k) {
  const m = 1 - k;
  return p0.map((_, j) => m * m * m * p0[j] + 3 * m * m * k * p1[j] + 3 * m * k * k * p2[j] + k * k * k * p3[j]);
}
const add = (a, b, s = 1) => a.map((v, j) => v + b[j] * s);

function chipFlight(c, t) {
  const kb = S.wins[c.win].keyBox[c.key];
  const sx = clamp(kb[0] + 10 + UI.CHIP.w / 2, UI.CHIP.w / 2 + 8, WIN.w - UI.CHIP.w / 2 - 8);
  const sy = kb[1] + Math.min(kb[3], 70) / 2;
  const p0 = PL.winPt(c.win, t, sx, sy, 24);
  const n = PL.winNormal(c.win, t);
  const pose = PL.winPose(c.win, t);
  return { p0, n, rot: pose.rot, tilt: pose.tilt };
}
function flyModel(pos, rot, tilt, sc) {
  return R.chain(R.T(...pos), R.RZ(rot), R.RX(-tilt), R.S(sc, sc, 1), R.T(-UI.CHIP.w / 2, -UI.CHIP.h / 2, 0));
}
function drawChips(t, cam) {
  S.trails = [];
  // Setup: from each window's key line up into its bench row.
  CHIPS.forEach((c, k) => {
    const f = prog(t, c.at, c.at + FLY);
    const it = S.chips[k];
    if (f <= 0 || f >= 1) { put(it, null, 0, cam); return; }
    const st = chipFlight(c, t);
    const [rx, ry] = UI.benchRowPos(k);
    const end = PL.benchPt(t, rx + UI.CHIP.w / 2, ry + UI.CHIP.h / 2, 2);
    const pts = [st.p0, add(add(st.p0, st.n, 60), [0, 0, 380]), add(end, [0, 0, 460]), end];
    const at = (u) => bez(...pts, ease.inOutCubic(u));
    const e = ease.inOutCubic(f);
    put(it, flyModel(at(f), lerp(st.rot, 0, e), lerp(st.tilt, 0, e), 1 + 0.14 * Math.sin(Math.PI * f)), Math.min(1, f * 7), cam);
    S.trails.push({ at, f, k: 1 - f * 0.6 });
  });
  // Step 4: four rows rise to the page as the brief.
  BRIEF_ROWS.forEach((row, k) => {
    const t0 = BRIEF_RISE(k);
    const f = prog(t, t0, t0 + RISE);
    const it = S.amber[k];
    if (f <= 0 || f >= 1) { put(it, null, 0, cam); return; }
    const [rx, ry] = UI.benchRowPos(row);
    const p0 = PL.benchPt(t, rx + UI.CHIP.w / 2, ry + UI.CHIP.h / 2, 4);
    const end = PL.pagePt(t, MAIN.x + 980 + UI.CHIP.w / 2, MAIN.y + 290 + k * 116 + UI.CHIP.h / 2, 3);
    const pts = [p0, add(p0, [0, 60, 520]), add(end, [0, 80, 340]), end];
    const at = (u) => bez(...pts, ease.inOutCubic(u));
    put(it, flyModel(at(f), 0, 0, 1 + 0.12 * Math.sin(Math.PI * f)), Math.min(1, f * 7), cam);
    S.trails.push({ at, f, k: 1 - f * 0.6, amber: true });
  });
  // Ask: a line from each visited window rises into the page.
  ASK_VISITS.forEach((v, k) => {
    const t0 = v.at + 0.3;
    const f = prog(t, t0, t0 + 0.85);
    const it = S.askChips[k];
    if (f <= 0 || f >= 1) { put(it, null, 0, cam); return; }
    const st = chipFlight(v, t);
    const [fx, fy, fw, fh] = S.fchipAt[k];
    const end = PL.pagePt(t, fx + fw / 2, fy + fh / 2, 4);
    const pts = [st.p0, add(add(st.p0, st.n, 50), [0, 0, 330]), add(end, [0, 140, 260]), end];
    const at = (u) => bez(...pts, ease.inOutCubic(u));
    const e = ease.inOutCubic(f);
    put(it, flyModel(at(f), lerp(st.rot, 0, e), lerp(st.tilt, 0, e), lerp(1, 0.62, e) + 0.1 * Math.sin(Math.PI * f)), Math.min(1, f * 7), cam);
    S.trails.push({ at, f, k: 1 - f * 0.6 });
  });
}

// ------------------------------------------------------------------ floating cards
function cardModel(x, y, w, h, z, extra = R.ident()) {
  return R.chain(S.pm, R.T(x + w / 2, y + h / 2, z), extra, R.T(-w / 2, -h / 2, 0));
}
function drawCards(t, cam) {
  // What I learned: the facts cascade in with a 3D tilt; during the trace, all but the first step back.
  const trace = hold(t, 32.0, 32.6, 34.4, 35.0);
  S.facts.forEach((c, k) => {
    const a = 30.0 + k * 0.16;
    const e = prog(t, a, a + 0.85);
    const out = span(t, 35.25, 35.7);
    const dim = k === 0 ? 0 : trace;
    const [x, y] = FACT_AT(k);
    const ang = (1 - ease.outBack(e, 1.5)) * 72 * d2r;
    const z = 34 - 300 * (1 - ease.outCubic(e)) - 70 * dim - 120 * out;
    put(S.factIts[k], cardModel(x, y + 70 * (1 - ease.outCubic(e)), 476, 196, z, R.RX(ang)), Math.min(1, e * 3) * (1 - out) * (1 - 0.9 * dim), cam);
    const u = prog(t, a + 0.3, a + 1.3);
    sheen(c.sheen, u, 0.8 * Math.sin(Math.PI * u));
    const lit = k === 0 ? hold(t, 31.9, 32.15, 34.4, 34.9) : 0;
    css(c.chip, "boxShadow", lit > 0.001 ? `inset 0 0 0 2px rgba(30,190,160,${(0.8 * lit).toFixed(3)}), 0 0 ${(26 * lit).toFixed(0)}px rgba(60,220,190,${(0.7 * lit).toFixed(3)})` : "");
    css(c.chip, "background", lit > 0.001 ? `rgba(${(255 - 60 * lit).toFixed(0)},255,${(255 - 25 * lit).toFixed(0)},.95)` : "");
  });

  // Your brief: a 3D stack arrives, newest on top, then fans out into the list.
  const s = clamp(spring(t, 35.95, 1.5, 0.6), 0, 1.15);
  const sOut = span(t, 43.8, 44.2);
  S.briefs.forEach((c, k) => {
    const [x, y] = BRIEF_AT(k);
    const f = ease.inOutCubic(prog(t, 37.0 + k * 0.14, 37.8 + k * 0.14));
    const stack = { y: 520 + k * 12, z: 34 + 40 + (3 - k) * 22, rz: (k - 1.5) * 1.6 * d2r };
    const yy = lerp(stack.y, y, f);
    const zz = lerp(stack.z, 34, f) + 70 * Math.sin(Math.PI * f) - 900 * (1 - s) - 100 * sOut;
    const rx = (1 - s) * 50 * d2r + Math.sin(Math.PI * f) * 8 * d2r;
    const rz = lerp(stack.rz, 0, f);
    put(S.briefIts[k], cardModel(x, yy, 1452, 140, zz, R.mul(R.RZ(rz), R.RX(rx))), Math.min(1, Math.max(0, (t - 35.95) * 3)) * (1 - sOut), cam);
    const ga = 38.6 + k * 0.75;
    const g = Math.max(0.4 * span(t, ga, ga + 0.4), hold(t, ga, ga + 0.25, ga + 0.6, ga + 1.1));
    css(c.next, "boxShadow", g > 0.001 ? `inset 0 0 0 ${(1 + g).toFixed(2)}px rgba(22,140,100,${(0.25 + 0.5 * g).toFixed(3)}), 0 0 ${(30 * g).toFixed(0)}px rgba(45,212,170,${(0.75 * g).toFixed(3)})` : "");
    css(c.next, "background", g > 0.001 ? `rgba(${(183 - 50 * g).toFixed(0)},${(244 - 4 * g).toFixed(0)},${(207 - 20 * g).toFixed(0)},${(0.55 + 0.35 * g).toFixed(3)})` : "");
    const su = t < 42 ? prog(t, 37.3 + k * 0.14, 38.4 + k * 0.14) : prog(t, 42.3 + k * 0.16, 43.3 + k * 0.16);
    sheen(c.sheen, su, 0.7 * Math.sin(Math.PI * su));
  });

  // Ask: the box (with its edge glow while you type), then the answer.
  const ab = span(t, 44.1, 44.7, ease.outCubic), abOut = span(t, 56.25, 56.65);
  put(S.askBoxIt, cardModel(...ASKBOX_AT, 1112, 84, 34 - 120 * (1 - ab) - 100 * abOut), ab * (1 - abOut), cam);
  const A = S.askBox;
  const eg = hold(t, 44.45, 44.9, 46.45, 47.0);
  op(A.ring, eg);
  css(A.ring, "background", `conic-gradient(from ${(t * 140) % 360}deg, #57eec9, #6fb4ff, #b79cff, #ffc38a, #57eec9)`);
  css(A.el, "boxShadow", eg > 0.001 ? `inset 0 1.5px 0 #fff, 0 0 ${(40 * eg).toFixed(0)}px rgba(90,220,230,${(0.55 * eg).toFixed(3)}), 0 30px 70px -26px rgba(8,18,38,.4)` : "");
  const q = typed(ask.question, t, 45.05, 27);
  if (A.q.textContent !== q) A.q.textContent = q;
  op(A.ph, t < 45.02 ? 1 : 0);
  op(A.caret, t > 44.9 && t < 46.7 && (t * 2.2) % 1 < 0.6 ? 1 : 0);
  const press = Math.max(0, 1 - Math.abs(t - 46.32) / 0.1);
  css(A.btn, "transform", `scale(${(1 - 0.06 * press).toFixed(4)})`);
  sheen(A.sheen, prog(t, 44.3, 45.2), 0.6 * Math.sin(Math.PI * prog(t, 44.3, 45.2)));

  const an = span(t, 50.2, 50.85, ease.outCubic);
  put(S.answerIt, cardModel(...ANSWER_AT, 1468, 470, 34 - 160 * (1 - an) - 100 * abOut, R.RX((1 - an) * 16 * d2r)), an * (1 - abOut), cam);
  S.answer.sens.forEach((sn, k) => {
    const u = span(t, SENT_AT(k), SENT_AT(k) + 0.6, ease.outCubic);
    op(sn, u);
    css(sn, "transform", `translateY(${((1 - u) * 10).toFixed(2)}px)`);
    css(sn, "filter", u > 0.001 && u < 0.999 ? `blur(${((1 - u) * 5).toFixed(2)}px)` : "");
  });
  S.answer.srcs.forEach((sr, k) => {
    const u = span(t, SENT_AT(k) + 0.45, SENT_AT(k) + 0.85, ease.outCubic);
    op(sr, u);
    css(sr, "transform", `translateX(${((1 - u) * 16).toFixed(2)}px)`);
  });
  const gf = span(t, 53.6, 54.7, ease.outCubic) * 0.86;
  css(S.answer.gaugeFill, "background", `conic-gradient(#1aa37a ${(gf * 360).toFixed(1)}deg, rgba(15,30,50,.1) 0)`);
  css(S.answer.gaugeFill, "webkitMask", "radial-gradient(circle, transparent 28px, #000 29px)");
  css(S.answer.gaugeFill, "mask", "radial-gradient(circle, transparent 28px, #000 29px)");
  op(S.answer.foot, span(t, 53.45, 53.8));
  op(S.answer.foot.children[1], span(t, 54.2, 54.7));
  op(S.answer.gauge.querySelector("b"), span(t, 54.3, 54.6));

  // How it works: six tiles turn in.
  S.rules.forEach((c, k) => {
    const a = 56.85 + k * 0.12;
    const e = prog(t, a, a + 0.85);
    const [x, y] = RULE_AT(k);
    const ang = (1 - ease.outBack(e, 1.4)) * -96 * d2r;
    put(S.ruleIts[k], cardModel(x, y, 476, 250, 34 - 140 * (1 - ease.outCubic(e)), R.RY(ang)), Math.min(1, e * 3), cam);
    const u = prog(t, 58.4 + k * 0.16, 59.3 + k * 0.16);
    sheen(c.sheen, u, 0.75 * Math.sin(Math.PI * u));
  });
}

// ------------------------------------------------------------------ the light's path
function seq(t, list) {
  for (let i = 0; i < list.length; i++) {
    const s = list[i];
    if (t < s[1] || i === list.length - 1) {
      if (s.length === 3) return s[2](t);
      const k = ease.inOutCubic(prog(t, s[0], s[1]));
      const a = s[2](t), b = s[3](t);
      const arc = (s[4] || 0) * Math.sin(Math.PI * k);
      return [lerp(a[0], b[0], k), lerp(a[1], b[1], k), lerp(a[2], b[2], k) + arc];
    }
  }
  return [0, 0, 0];
}
const bob = (p, t, a = 10) => [p[0] + a * noise(t * 0.7, 11), p[1] + a * noise(t * 0.6, 12), p[2] + a * 0.8 * noise(t * 0.8, 13)];

function orbWorld(t) {
  const P = PL.pagePt, W = PL.winPt;
  const btn = (tt) => P(tt, S.btnAt[0], S.btnAt[1], 30);
  const above = (tt) => P(tt, 1010, 660, 120);
  const hover = (i) => (tt) => W(i, tt, WIN.w / 2, -50, 120);
  const scanHover = (i) => (tt) => {
    const k = prog(tt, READ[i].scan[0], READ[i].scan[1]);
    return bob(W(i, tt, WIN.w / 2 + 150 * Math.sin(k * Math.PI * 2), -50 + 40 * Math.sin(k * Math.PI), 120), tt, 5);
  };
  const waitConnect = (i) => (tt) => { const c = S.connectAt[i]; return bob(W(i, tt, c[0] + 250, c[1] - 120, 110), tt, 8); };
  const benchRowsPath = S.benchPath || (S.benchPath = UI.BENCH_ROWS.map((r, k) => { const [x, y] = UI.benchRowPos(k); return [x + 330, y + 96]; }));
  const benchSweep = (tt) => {
    const [x, y] = crPath(benchRowsPath, prog(tt, 17.55, 20.75));
    return PL.benchPt(tt, x, y, 120);
  };
  const benchHigh = (tt) => PL.benchPt(tt, BENCH.w / 2, BENCH.h / 2 - 40, 260);
  const pageBrief = (tt) => P(tt, MAIN.x + 980 + 470, MAIN.y + 250, 110);
  const restReady = (tt) => bob(P(tt, MAIN.x + 760, MAIN.y + 120, 90), tt, 8);
  const word = (i) => (tt) => { const w = S.words[Math.max(0, Math.min(S.words.length - 1, i))]; return P(tt, w[0] + w[2] / 2, w[1] - 4, 70); };
  const wordLead = (tt) => {
    const n = S.words.length;
    const f = clamp((tt - 28.05) / 1.7) * (n - 1);
    const i = Math.floor(f), u = f - i;
    const a = S.words[i], b = S.words[Math.min(n - 1, i + 1)];
    const sameLine = Math.abs(a[1] - b[1]) < 5;
    const x = sameLine ? lerp(a[0] + a[2], b[0] + b[2], u) : (u < 0.5 ? a[0] + a[2] : b[0] + b[2]);
    const y = sameLine ? a[1] : (u < 0.5 ? a[1] : b[1]);
    return P(tt, x + 6, y + 6, 60);
  };
  const restLearned = (tt) => bob(P(tt, MAIN.x + 930, MAIN.y + 118, 80), tt, 8);
  const chip0 = (tt) => { const c = S.factChipAt[0], [x, y] = FACT_AT(0); return P(tt, x + c[0] + c[2] + 40, y + c[1] - 6, 110); };
  const ghost = (tt) => W(1, tt, WIN.w / 2 + 120, S.wins[1].keyBox[0][1] - 10, 70);
  const restBrief = (tt) => bob(P(tt, MAIN.x + 620, MAIN.y + 118, 80), tt, 8);
  const nextPill = (k) => (tt) => { const n = S.nextAt[k], [x, y] = BRIEF_AT(k); return P(tt, x + n[0] + n[2] + 26, y + n[1] + n[3] / 2, 90); };
  const boxEnd = (tt) => bob(P(tt, ASKBOX_AT[0] + 1112 + 60, ASKBOX_AT[1] + 30, 80), tt, 6);
  const askHover = (k) => (tt) => { const v = ASK_VISITS[k]; const kb = S.wins[v.win].keyBox[v.key]; return W(v.win, tt, WIN.w / 2 + 150, kb[1] - 28, 110); };
  const sentEnd = (k) => (tt) => { const c = S.citeAt[k]; return P(tt, ANSWER_AT[0] + c[0] + c[2] + 30, ANSWER_AT[1] + c[1] + 6, 110); };
  const gaugeSide = (tt) => bob(P(tt, ANSWER_AT[0] + 560, ANSWER_AT[1] + 420, 100), tt, 7);
  const restRules = (tt) => bob(P(tt, MAIN.x + 1100, MAIN.y + 118, 90), tt, 9);

  const list = [
    [0, 4.45, btn],
    [4.45, 4.8, btn],
    [4.8, 6.0, btn, above, 160],
    [6.0, 6.5, (tt) => bob(above(tt), tt, 10)],
    [6.5, 7.3, above, hover(0), -80],
    [7.3, 8.15, scanHover(0)],
    [8.15, 8.75, scanHover(0), hover(1), 160],
    [8.75, 9.7, scanHover(1)],
    [9.7, 10.4, scanHover(1), waitConnect(2), 160],
    [10.4, 11.15, waitConnect(2)],
    [11.15, 11.85, waitConnect(2), hover(2), 0],
    [11.85, 12.85, scanHover(2)],
    [12.85, 13.55, scanHover(2), hover(3), 220],
    [13.55, 14.4, scanHover(3)],
    [14.4, 14.65, scanHover(3), hover(4), 120],
    [14.65, 15.3, scanHover(4)],
    [15.3, 15.5, scanHover(4), hover(5), 120],
    [15.5, 16.15, scanHover(5)],
    [16.15, 17.4, scanHover(5), benchSweep, 320],
    [17.4, 20.85, benchSweep],
    [20.85, 21.9, benchSweep, benchHigh, 0],
    [21.9, 23.4, benchHigh, pageBrief, 220],
    [23.4, 24.2, (tt) => bob(pageBrief(tt), tt, 8)],
    [24.2, 25.9, pageBrief, restReady, 0],
    [25.9, 27.5, restReady],
    [27.5, 28.05, restReady, word(0), 0],
    [28.05, 29.8, wordLead],
    [29.8, 30.4, wordLead, restLearned, 0],
    [30.4, 31.55, restLearned],
    [31.55, 32.1, restLearned, chip0, 0],
    [32.1, 33.2, chip0, ghost, 0],
    [33.2, 34.4, (tt) => bob(ghost(tt), tt, 6)],
    [34.4, 35.3, ghost, restLearned, 0],
    [35.3, 36.0, restLearned, restBrief, 0],
    [36.0, 38.35, restBrief],
    [38.35, 38.6, restBrief, nextPill(0), 0],
    [38.6, 39.1, nextPill(0)],
    [39.1, 39.35, nextPill(0), nextPill(1), 0],
    [39.35, 39.85, nextPill(1)],
    [39.85, 40.1, nextPill(1), nextPill(2), 0],
    [40.1, 40.6, nextPill(2)],
    [40.6, 40.85, nextPill(2), nextPill(3), 0],
    [40.85, 41.6, nextPill(3)],
    [41.6, 42.4, nextPill(3), restBrief, 0],
    [42.4, 44.1, restBrief],
    [44.1, 44.9, restBrief, boxEnd, 0],
    [44.9, 46.45, boxEnd],
    [46.45, 47.15, boxEnd, askHover(0), -60],
    [47.15, 47.75, askHover(0)],
    [47.75, 47.95, askHover(0), askHover(1), 40],
    [47.95, 48.35, askHover(1)],
    [48.35, 48.6, askHover(1), askHover(2), 80],
    [48.6, 49.0, askHover(2)],
    [49.0, 49.25, askHover(2), askHover(3), 80],
    [49.25, 49.85, askHover(3)],
    [49.85, 50.55, askHover(3), sentEnd(0), 120],
    [50.55, 51.25, sentEnd(0)],
    [51.25, 51.45, sentEnd(0), sentEnd(1), 0],
    [51.45, 52.1, sentEnd(1)],
    [52.1, 52.3, sentEnd(1), sentEnd(2), 0],
    [52.3, 52.9, sentEnd(2)],
    [52.9, 53.1, sentEnd(2), sentEnd(3), 0],
    [53.1, 53.6, sentEnd(3)],
    [53.6, 54.2, sentEnd(3), gaugeSide, 0],
    [54.2, 56.5, gaugeSide],
    [56.5, 57.2, gaugeSide, restRules, 0],
    [57.2, 64, restRules],
  ];
  return seq(t, list);
}

function drawOrbItem(t, cam) {
  const w = orbWorld(t);
  const born = span(t, 4.45, 4.85, ease.outCubic);
  const v = R.apply(cam.view, ...w);
  const sp = R.persp(...v);
  const it = S.lightIt;
  it.visible = true;
  it.depth = Math.hypot(v[0] - R.CX, v[1] - R.CY, v[2] - R.P);
  setDisp(it, true);
  const r = clamp(17 * sp[2], 10, 30) * (0.3 + 0.7 * born);
  return { w, x: sp[0], y: sp[1], r, s: sp[2], alpha: born * (v[2] < R.P - 60 ? 1 : 0) };
}

// ------------------------------------------------------------------ light: draw
function drawLight(t, cam, orb) {
  const ctx = S.lctx, fx = S.fx;
  ctx.clearRect(0, 0, 1920, 1080);
  fx.clearRect(0, 0, 1920, 1080);
  const onLight = clamp(S.calm * 1.15);

  // The reading beam: from the light to the line it reads.
  READ.forEach((rd, i) => {
    const k = prog(t, rd.scan[0], rd.scan[1]);
    const it = S.winIts[i];
    if (k <= 0 || k >= 1 || !it.visible) return;
    const y = 64 + 8 + k * (WIN.h - 64 - 16);
    L.drawFan(ctx, [orb.x, orb.y], onItem(it, 26, y), onItem(it, WIN.w - 26, y), Math.min(1, Math.sin(Math.PI * k) * 2.5), onLight);
  });
  ASK_VISITS.forEach((v) => {
    const k = hold(t, v.at - 0.08, v.at + 0.08, v.at + 0.4, v.at + 0.6);
    const it = S.winIts[v.win];
    if (k <= 0.001 || !it.visible) return;
    const kb = S.wins[v.win].keyBox[v.key];
    L.drawFan(ctx, [orb.x, orb.y], onItem(it, kb[0] + 6, kb[1] + kb[3] / 2), onItem(it, kb[0] + kb[2] - 6, kb[1] + kb[3] / 2), k, onLight * 0.6);
  });
  const tk = hold(t, 33.15, 33.4, 34.3, 34.6);
  if (tk > 0.001 && S.winIts[1].visible) {
    const kb = S.wins[1].keyBox[0];
    L.drawFan(ctx, [orb.x, orb.y], onItem(S.winIts[1], kb[0] + 6, kb[1] + kb[3] / 2), onItem(S.winIts[1], kb[0] + kb[2] - 6, kb[1] + kb[3] / 2), tk, 0);
  }
  const pulseK = hold(t, 10.4, 10.6, 11.0, 11.2) * (0.5 + 0.5 * Math.sin(t * 8));
  if (orb.alpha > 0.01) {
    const trail = [];
    for (let j = 0; j < 14; j++) {
      const tt = t - j * 0.035;
      if (tt < 4.5) break;
      const p = R.project(cam, orbWorld(tt));
      trail.push([p[0], p[1], orb.r * 0.9]);
    }
    L.drawOrbTrail(ctx, trail, onLight);
  }
  L.drawOrb(ctx, orb.x, orb.y, orb.r, t, { onLight, alpha: orb.alpha, pulse: pulseK });

  // On top: the screen's edges glow while it works.
  L.drawEdgeGlow(fx, t, hold(t, 4.5, 5.3, 24.8, 26.0) + 0.8 * hold(t, 46.4, 47.0, 49.9, 50.6));
  // Trails behind chips in flight.
  for (const tr of S.trails) {
    const pts = [];
    for (let j = 0; j < 10; j++) {
      const u = tr.f - j * 0.028;
      if (u < 0) break;
      pts.push(R.project(cam, tr.at(u)));
    }
    L.drawTrail(fx, pts, tr.k, tr.amber ? "255,196,110" : "150,250,225", onLight > 0.5 ? 1 : 0);
  }
  // The click and the Connect clicks ripple.
  const bp = S.today.visible && S.today.m ? onItem(S.today, S.btnAt[0], S.btnAt[1]) : S.btnAt;
  L.drawRipple(fx, bp[0], bp[1], prog(t, 4.42, 5.2), 1);
  L.drawIgnite(fx, bp[0], bp[1], prog(t, 4.42, 5.15));
  // A small flash where each chip lands.
  CHIPS.forEach((c, k) => {
    const land = c.at + FLY;
    if (t < land || t > land + 0.5 || !S.benchIt.visible) return;
    const [rx, ry] = UI.benchRowPos(k);
    const p = onItem(S.benchIt, rx + UI.CHIP.w / 2, ry + UI.CHIP.h / 2);
    L.drawRipple(fx, p[0], p[1], prog(t, land, land + 0.5), onLight > 0.5 ? 1 : 0, 90 * p[2]);
  });
  BRIEF_ROWS.forEach((row, k) => {
    const land = BRIEF_RISE(k) + RISE;
    if (t < land || t > land + 0.5 || !S.mainIt.visible) return;
    const p = onItem(S.mainIt, 980 + UI.CHIP.w / 2, 290 + k * 116 + UI.CHIP.h / 2);
    L.drawRipple(fx, p[0], p[1], prog(t, land, land + 0.5), 0, 90 * p[2]);
  });
  for (const i of [2, 3, 4]) {
    const c = READ[i].connect;
    const it = S.winIts[i];
    if (!it.visible || t < c || t > c + 0.8) continue;
    const p = onItem(it, ...S.connectAt[i]);
    L.drawRipple(fx, p[0], p[1], prog(t, c, c + 0.8) * 0.5, 0);
  }
  // What I learned: a thread of light from the fact's source chip down through the glass.
  const th = span(t, 32.45, 33.25);
  if (th > 0.001 && S.factIts[0].visible && S.winIts[1].visible) {
    const c = S.factChipAt[0];
    const a = onItem(S.factIts[0], c[0] + c[2] / 2, c[1] + c[3]);
    const kb = S.wins[1].keyBox[0];
    const b = onItem(S.winIts[1], kb[0] + 30, kb[1] + kb[3] / 2);
    const fade = 1 - span(t, 34.5, 35.0);
    L.drawThread(fx, a, [a[0], a[1] + 120], [b[0] - 160, b[1]], b, th, t, { alpha: fade, onLight: 1, width: 2.6 });
  }
  // Ask: each sentence is tied by a thread to its source.
  if (S.answerIt.visible) {
    const out = 1 - span(t, 56.2, 56.6);
    ask.answer.forEach((a, k) => {
      const d = span(t, SENT_AT(k) + 0.3, SENT_AT(k) + 0.85);
      const c = S.citeAt[k], s = S.srcAt[a.cite];
      const p0 = onItem(S.answerIt, c[0] + c[2] + 4, c[1] + c[3] / 2);
      const p3 = onItem(S.answerIt, s[0] - 2, s[1] + s[3] / 2);
      const dx = (p3[0] - p0[0]) * 0.45;
      L.drawThread(fx, p0, [p0[0] + dx, p0[1]], [p3[0] - dx, p3[1]], p3, d, t, { alpha: out, onLight: 1, width: 2, seed: k * 0.27 });
    });
  }

  // The light's AI label rides beside it.
  const lab = S.label;
  const la = orb.alpha;
  op(lab.el, la);
  const longK = hold(t, 4.9, 5.4, 7.6, 8.1) + hold(t, 25.9, 26.3, 27.3, 27.7);
  css(lab.long, "maxWidth", `${(130 * clamp(longK)).toFixed(1)}px`);
  op(lab.long, clamp(longK));
  const ls = clamp(0.82 + 0.2 * orb.s, 0.85, 1.08);
  css(lab.el, "transform", `translate(${(orb.x + orb.r * 1.3 + 8).toFixed(1)}px, ${(orb.y - orb.r * 1.3 - 30).toFixed(1)}px) scale(${ls.toFixed(3)})`);
}

// ------------------------------------------------------------------ the steps pill
function drawHud(t) {
  const H = S.hud;
  const k = hold(t, 6.0, 6.5, 24.95, 25.45, ease.outCubic);
  op(H.el, k);
  shown(H.el, k > 0.001);
  if (k <= 0.001) return;
  css(H.el, "transform", `translateY(${((1 - k) * -26).toFixed(2)}px)`);
  const BS = PL.B.steps;
  let cur = 0;
  for (let s = 0; s < 4; s++) if (t >= BS[s][0]) cur = s;
  const n = `${cur + 1} / 4`;
  if (H.n.textContent !== n) H.n.textContent = n;
  H.lines.forEach((ln, s) => {
    const a = s === 0 ? 1 : span(t, BS[s][0] - 0.1, BS[s][0] + 0.25);
    const b = s === 3 ? 0 : span(t, BS[s + 1][0] - 0.1, BS[s + 1][0] + 0.15);
    const v = Math.min(a, 1 - b);
    op(ln, v);
    css(ln, "transform", `translateY(${((1 - a) * 12 - b * 12).toFixed(2)}px)`);
  });
  H.marks.forEach((m, s) => {
    const st = stepState(t, s);
    ringStyle(m.ring, m.fill, st.k, st.done);
    const p = clamp(spring(t, st.at, 2.4, 0.42), 0, 1.3);
    op(m.tm, st.done ? 1 : 0.0);
    css(m.ring, "transform", `scale(${(st.done ? 0.85 + 0.15 * p : 1).toFixed(3)})`);
  });
}

// ------------------------------------------------------------------ the pointer
function drawPointer(t) {
  const P = S.ptr;
  const conn = (i) => {
    const it = S.winIts[i];
    if (!it.visible || !it.m) return [1500, 1000];
    const p = onItem(it, ...S.connectAt[i]);
    return [p[0], p[1]];
  };
  let x = 1500, y = 1000, down = 0, a = 0;
  const go = (from, to, a0, a1) => { const k = ease.inOutCubic(prog(t, a0, a1)); return [lerp(from[0], to[0], k), lerp(from[1], to[1], k)]; };
  const press = (c) => Math.max(0, 1 - Math.abs(t - c) / 0.09);
  if (t < 5.0) {
    [x, y] = t < 4.6 ? go([1500, 900], S.btnAt, 3.2, 4.2) : go(S.btnAt, [S.btnAt[0] + 70, S.btnAt[1] + 90], 4.6, 5.0);
    down = press(4.42);
    a = span(t, 3.1, 3.35) * (1 - span(t, 4.65, 4.95));
  } else if (t > 10.1 && t < 12.0) {
    const c = conn(2);
    [x, y] = t < 11.3 ? go([1480, 1010], c, 10.25, 10.95) : go(c, [c[0] + 60, c[1] + 80], 11.3, 11.8);
    down = press(READ[2].connect);
    a = span(t, 10.2, 10.45) * (1 - span(t, 11.45, 11.75));
  } else if (t > 13.0 && t < 15.2) {
    const c3 = conn(3), c4 = conn(4);
    [x, y] = t < 13.7 ? go([1480, 1000], c3, 13.1, 13.52) : t < 14.7 ? go(c3, c4, 13.85, 14.5) : go(c4, [c4[0] + 50, c4[1] + 70], 14.7, 15.1);
    down = Math.max(press(READ[3].connect), press(READ[4].connect));
    a = span(t, 13.05, 13.25) * (1 - span(t, 14.8, 15.05));
  } else if (t > 44.4 && t < 45.4) {
    const target = [ASKBOX_AT[0] + 300, ASKBOX_AT[1] + 44];
    [x, y] = go([target[0] + 260, target[1] + 300], target, 44.45, 44.85);
    down = press(44.92);
    a = span(t, 44.4, 44.6) * (1 - span(t, 45.05, 45.3));
  }
  P.at(x, y, down, a);
}
