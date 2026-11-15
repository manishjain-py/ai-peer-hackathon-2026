// Constellation: your work becomes a living star map; every fact is a star tied to its source by
// light. Today's page crumbles into stars from the button outward; the Peer, a mint comet labelled
// AI, reads each source cluster as Ram (Slack, Code and Tickets after a one-time Connect), streams
// what matters back as fact stars, draws the lines to their sources, and builds the brief. Then:
// what it learned (one fact traced back by light), the brief (four stars become cards, still tied
// to their sources), an answer whose sentences take their light from four stars, and a ring of
// rules. Everything is a pure function of t.
import { THREE, initGL, Sprites, makeSky, makeDust, lightLine, arc, at, makePageDust, paintPage, lin } from "./gfx.js";
import * as W from "./world.js";
import { el, prog, ease, clamp, lerp, keys, spring, typed, noise, rng, secs, pulse, smoothstep, text } from "../shared/kit.js";
import { todayPage, pointer, centre } from "../shared/page.js";
import { person, peer, sources, sourceById, steps, learned, brief, ask, rules, captionWords } from "../shared/data.js";
import { icons, sourceIcon } from "../shared/icons.js";

const { T, V, CL, ORDER, KNOW, knowById, itemById, itemPos, KNOW_TIMES } = W;
const MINT = lin("#b7f4cf"), WHITE = [1, 1, 1], WARM = lin("#ffe9c9");
const HUE = Object.fromEntries(sources.map((s) => [s.id, lin(s.hue)]));
const HUEX = Object.fromEntries(sources.map((s) => [s.id, s.hue]));
const mixc = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
const E = ease;
const P = (t, a, b) => prog(t, a, b);
const io = (t, a, b) => E.inOutCubic(P(t, a, b));
const oc = (t, a, b) => E.outCubic(P(t, a, b));
const win = (t, a, b, e1 = 0.4, e2 = 0.4) => Math.min(E.outCubic(P(t, a, a + e1)), 1 - E.inCubic(P(t, b - e2, b)));

// ---------------------------------------------------------------------------------------------
class Tag {
  constructor(parent, cls, html) {
    this.el = el("div", "cs-at " + cls, parent);
    this.in = el("div", "in", this.el, html);
    this.tr = ""; this.op = ""; this.dp = "x";
  }
  measure() {
    const r = this.in.getBoundingClientRect();
    this.box = [r.left, r.top, r.right, r.bottom];
    return this;
  }
  // Fade out where it would run into a panel, the caption band, the corner tag or the frame edge.
  safe(x, y, o, s = 1, dx = 0) {
    if (o > 0.004 && this.box) {
      const b = [x + dx + this.box[0] * s, y + this.box[1] * s, x + dx + this.box[2] * s, y + this.box[3] * s];
      o *= clearOf(b);
    }
    this.place(x + dx, y, o, s);
  }
  place(x, y, o, s = 1) {
    const vis = o > 0.004;
    const d = vis ? "" : "none";
    if (d !== this.dp) { this.el.style.display = d; this.dp = d; }
    if (!vis) return;
    const tr = `translate3d(${x.toFixed(1)}px,${y.toFixed(1)}px,0)` + (Math.abs(s - 1) > 0.0005 ? ` scale(${s.toFixed(4)})` : "");
    if (tr !== this.tr) { this.el.style.transform = tr; this.tr = tr; }
    const op = Math.min(1, o).toFixed(3);
    if (op !== this.op) { this.el.style.opacity = op; this.op = op; }
  }
}
let ZONES = [];
function clearOf(b) {
  let f = smoothstep(-6, 16, Math.min(b[0], b[1], 1920 - b[2], 1080 - b[3]));
  for (const z of ZONES) {
    const ox = Math.min(b[2], z[2]) - Math.max(b[0], z[0]);
    const oy = Math.min(b[3], z[3]) - Math.max(b[1], z[1]);
    if (ox > 0 && oy > 0) f = Math.min(f, 1 - smoothstep(0, 30, Math.min(ox, oy)));
  }
  return f;
}
const setStyle = (e, k, v) => { if (e.style[k] !== v) e.style[k] = v; };
const cls = (e, c, on) => { if (e.classList.contains(c) !== on) e.classList.toggle(c, on); };
const html = (e, h) => { if (e.__h !== h) { e.innerHTML = h; e.__h = h; } };

// ---------------------------------------------------------------------------------------------
let G, SP, sky, dust, PD, pg, ptr, btnPx, cam, cometBase, fx, fxc, labels, ui, top;
let kLines = {}, eLines = [], colLines = [], ringLine;
let clusterStars = {}, foundOrder = {}, itemIgnite = {}, foundCount = {};
let T_cl = {}, T_items = {}, T_orb = [], T_ram, T_ai, T_topics = [], T_facts = [], T_trace, T_conn = {}, T_signed, T_cites = [], T_bcards = [], T_rules = [];
let flist, fcards = [], hud, hudSteps = [], hudSrcs = {}, sumP, bhead, askP, ansP, rhead, askQ, askCaret, askSt, askEx, ansWords = [], ansDots = [], ringFill, ansFoot, ansChips;
let colPos = [], connOff = {}, dotOff = [], briefHome = [0, 0, 0];
let srcP, hudH = 300, srcH = 300, sumH = 400, listH = 700, askH = 220, ansH = 520;
const PANEL = {};
const v3 = new THREE.Vector3();
let camNow = null;

function proj(p) {
  v3.set(p[0], p[1], p[2]).project(G.camera);
  const front = v3.z > -1 && v3.z < 1;
  const d = V.dist(p, camNow.slice(0, 3));
  return [(v3.x + 1) * 960, (1 - v3.y) * 540, front, d];
}
const onScreen = (s, m = 40) => s[2] && s[0] > -m && s[0] < 1920 + m && s[1] > -m && s[1] < 1080 + m;
const pxPerUnit = (d) => (540 / Math.tan((camNow[6] / 2) * Math.PI / 180)) / Math.max(0.1, d);

// The world point that shows at screen (sx, sy), `dist` in front of the camera array `c`.
function unproject(c, sx, sy, dist) {
  const pos = c.slice(0, 3), f = V.norm(V.sub(c.slice(3, 6), pos));
  const r = V.norm(V.cross(f, [0, 1, 0])), u = V.cross(r, f);
  const k = Math.tan((c[6] / 2) * Math.PI / 180);
  const x = ((sx - 960) / 540) * k * dist, y = ((540 - sy) / 540) * k * dist;
  return V.add(pos, V.add(V.scl(f, dist), V.add(V.scl(r, x), V.scl(u, y))));
}

const CAPTIONS = [
    { at: 3.1, to: 5.6, text: captionWords.click },
    { at: 5.9, to: 8.8, text: captionWords.directory },
    { at: 9.0, to: 12.4, text: captionWords.search },
    { at: 12.5, to: 16.4, text: captionWords.connect },
    { at: 21.5, to: 25.2, text: captionWords.write },
    { at: 25.5, to: 28.3, text: captionWords.brief },
    { at: 30.6, to: 34.5, text: captionWords.learned },
    { at: 38.9, to: 42.7, text: captionWords.yourBrief },
    { at: 47.0, to: 50.0, text: captionWords.ask },
    { at: 55.8, to: 59.8, text: captionWords.answer },
    { at: 60.9, to: 64.9, text: captionWords.rules },
];
const ANS_Y = 300;

// ---------------------------------------------------------------------------------------------
export default {
  captions: CAPTIONS,

  async init(stage) {
    pg = todayPage(stage);
    btnPx = centre(pg.button);
    const glc = el("canvas", "cs-gl", stage);
    glc.width = 1920; glc.height = 1080;
    fx = el("canvas", "cs-fx", stage);
    fx.width = 1920; fx.height = 1080;
    fxc = fx.getContext("2d");
    labels = el("div", "cs-layer", stage);
    ui = el("div", "cs-layer", stage);
    stage.appendChild(pg.root); // today's page stays on top until it crumbles
    top = el("div", "cs-layer", stage); // the AI label rides above everything, the page included
    ptr = pointer(stage);
    this.glc = glc;

    G = initGL(glc);
    sky = makeSky(G.scene);
    dust = makeDust(G.scene);
    SP = new Sprites(G.scene, 6000, { order: 3 });
    cam = W.cameraTrack();
    camNow = cam(0);
    cometBase = W.cometTrack(W.pagePoint(btnPx[0], btnPx[1]));

    // Today's page as particles (painted from its own DOM, without the button).
    const pageCv = await paintPage(pg.root, pg.button);
    PD = makePageDust(G.scene, pageCv, 5, btnPx, {
      origin: W.C0, right: [1, 0, 0], up: [0, 1, 0], fwd: [0, 0, -1], hw: W.PAGE_HW, hh: W.PAGE_HH, dp: W.DP,
    });

    // The stars of each cluster, and the order they light in when read (nearest the comet first).
    for (const id of ORDER) {
      const st = W.clusterStars(id);
      clusterStars[id] = st;
      const v = T.visit[id];
      const entry = cometBase(v.r0);
      const named = W.ITEMS.filter((x) => x.src === id);
      const nAnon = Math.max(0, CL[id].n - named.length);
      const ord = st.map((s, i) => [i, V.dist(s, entry)]).sort((a, b) => a[1] - b[1]).slice(0, nAnon).map((x) => x[0]);
      foundOrder[id] = {};
      const n = ord.length + named.length;
      // everything found, in light order; the named items at fixed beats inside the read window
      const span = v.r1 - v.r0;
      ord.forEach((si, j) => { foundOrder[id][si] = v.r0 + span * (0.08 + 0.86 * (j / Math.max(1, ord.length - 1))) ; });
      named.forEach((it, j) => { itemIgnite[it.id] = v.r0 + span * (named.length === 1 ? 0.35 : 0.12 + 0.72 * (j / (named.length - 1))); });
      foundCount[id] = { n, times: [...Object.values(foundOrder[id]), ...named.map((it) => itemIgnite[it.id])].sort((a, b) => a - b) };
    }

    // Light lines: each knowledge star to the item it came from; related knowledge to each other.
    KNOW.forEach((k) => {
      const ip = itemPos(k.item), src = itemById[k.item].src;
      const pts = arc(ip, k.pos, V.dist(ip, k.pos) * 0.16, [0.1, 1, 0.25], 56);
      const cols = pts.map((_, i) => mixc(HUE[src], [0.85, 0.92, 1], i / (pts.length - 1)).map((x) => x * 1.6));
      kLines[k.id] = lightLine(G.scene, pts, cols, 2.6);
    });
    W.EDGES.forEach(([a, b]) => {
      const pa = knowById[a].pos, pb = knowById[b].pos;
      const pts = arc(pa, pb, V.dist(pa, pb) * 0.04, [0, 1, 0], 24);
      eLines.push({ a, b, line: lightLine(G.scene, pts, pts.map(() => [0.9, 0.95, 1.1]), 1.8) });
    });
    // Your brief: the column the four stars move into, in front of the brief camera.
    const cb = cam(41.5);
    const ys = [306, 472, 638, 804];
    colPos = ys.map((y) => unproject(cb, 104, y, 10.5));
    brief.items.forEach((b, i) => {
      const k = KNOW.find((x) => x.kind === "brief" && x.i === i);
      const ip = itemPos(k.item);
      const pts = arc(colPos[i], ip, V.dist(colPos[i], ip) * 0.1, [0, 1, 0.2], 72);
      const cols = pts.map((_, j) => mixc([0.85, 1.0, 0.92], HUE[b.source], j / (pts.length - 1)).map((x) => x * 1.5));
      colLines.push(lightLine(G.scene, pts, cols, 2.4));
    });
    // The ring of rules.
    {
      const pts = [];
      for (let i = 0; i <= 180; i++) {
        const a = (i / 180) * Math.PI * 2;
        pts.push(ringPoint(a));
      }
      ringLine = lightLine(G.scene, pts, pts.map(() => [0.55, 1.1, 0.8]), 2.2);
    }

    buildLabels();
    buildPanels();
    for (const s0 of sources) { html(T_cl[s0.id].small, `<b>✓</b>${s0.found}`); T_cl[s0.id].measure(); html(T_cl[s0.id].small, ""); }
    [...Object.values(T_items), ...T_orb, ...T_topics, ...T_facts, ...T_cites, ...T_bcards, T_ram, T_ai, T_trace, T_signed, ...Object.values(T_conn)].forEach((tg) => tg.measure());
    hudH = hud.getBoundingClientRect().height;
    srcP.style.top = `${40 + hudH + 14}px`;
    srcH = srcP.getBoundingClientRect().height;
    sumH = sumP.getBoundingClientRect().height;
    listH = flist.getBoundingClientRect().height;
    askH = askP.getBoundingClientRect().height;
    ansH = ansP.getBoundingClientRect().height;
    // Where each Connect button's centre sits from its label's anchor (measured once, at 0,0).
    for (const id of ["slack", "code", "tickets"]) {
      const r = T_conn[id].btn.getBoundingClientRect();
      connOff[id] = [r.left + r.width / 2, r.top + r.height / 2];
    }
    briefHome = unproject(cam(41.5), 1004, 236, 17);
    window.__cs = { ready: true };
  },

  render(t) {
    renderAt(t);
  },
};

function ringPoint(a) {
  const R = W.RULES.r, tl = W.RULES.tilt;
  const x = Math.sin(a) * R, z = Math.cos(a) * R;
  return [x, W.RULES.y + z * Math.sin(tl), z * Math.cos(tl)];
}

// ---------------------------------------------------------------------------------------------
function buildLabels() {
  for (const s of sources) {
    T_cl[s.id] = new Tag(labels, "cs-cl", `<div class="ic" style="color:${s.hue}">${sourceIcon(s.id)}</div><div><b>${s.name}</b><small></small></div>`);
    T_cl[s.id].small = T_cl[s.id].in.querySelector("small");
  }
  for (const it of W.ITEMS) {
    T_items[it.id] = new Tag(labels, "cs-it", `<b>${it.title}</b><small>${it.sub}</small>`);
    T_items[it.id].in.style.setProperty("--hue", HUEX[it.src]);
  }
  T_ram = new Tag(labels, "cs-ram", `<b>${person.first}</b><small>you</small>`);
  [person.role, person.team, person.org, person.city].forEach((s) => T_orb.push(new Tag(labels, "cs-orb", s)));
  for (const tp of W.TOPICS) T_topics.push(new Tag(labels, "cs-topic", tp.name));
  learned.facts.forEach((f, i) => {
    const tg = new Tag(labels, "cs-num", `${i + 1}`);
    tg.in.style.setProperty("--hue", sourceById[f.source].hue);
    T_facts.push(tg);
  });
  {
    const f = learned.facts[0];
    T_trace = new Tag(labels, "cs-trace", "");
    T_trace.in.className = "in glass";
    T_trace.in.innerHTML = `<div class="kick">Fact · traced to its source</div><b>${f.title}</b><p>${f.body}</p>
      <div class="link">${icons.docs}<u>${f.ref}</u><em>${f.date}</em>${icons.link}</div>`;
  }
  for (const id of ["slack", "code", "tickets"]) {
    const s = sourceById[id];
    const tg = new Tag(labels, "cs-connect", "");
    tg.in.className = "in glass";
    tg.in.innerHTML = `<div class="btn">${icons.lock}<span>Connect ${s.name}</span></div><small>One time · your own sign-in<br>read-only</small>`;
    tg.btn = tg.in.querySelector(".btn");
    tg.btnText = tg.in.querySelector(".btn span");
    tg.btnIcon = tg.in.querySelector(".btn svg");
    T_conn[id] = tg;
  }
  T_signed = new Tag(labels, "cs-signed", "");
  T_signed.in.className = "in glass";
  T_signed.in.innerHTML = `${icons.check}<span>Signed in as ${person.login} · Slack · read-only</span>`;
  ask.sources.forEach((c, i) => {
    const s = sourceById[c.source];
    const tg = new Tag(labels, "cs-cite", `<span class="n" style="--hue:${s.hue}">${i + 1}</span>${c.ref} · ${c.date}`);
    T_cites.push(tg);
  });
  brief.items.forEach((b, i) => {
    const s = sourceById[b.source];
    const tg = new Tag(labels, "cs-bcard", "");
    tg.in.className = "in glass";
    tg.in.innerHTML = `<b>${b.title}</b><div class="why">${b.why}</div>
      <div class="next"><i>Next</i><span>${b.next}</span></div>
      <div class="src"><span style="color:${s.hue};display:inline-flex">${sourceIcon(s.id)}</span>${s.name} · ${b.ref} · ${b.date}${i === 0 ? '<span class="new">NEWEST</span>' : ""}</div>`;
    T_bcards.push(tg);
  });
  const ruleIcons = [icons.spark, icons.eye, icons.link, icons.shield, icons.lock, icons.book];
  rules.forEach((r, i) => {
    const tg = new Tag(labels, "cs-rule", "");
    tg.in.className = "in glass";
    tg.in.innerHTML = `<div class="h"><i>${ruleIcons[i]}</i><b>${r.title}</b></div><p>${r.body}</p>`;
    tg.p = tg.in.querySelector("p");
    T_rules.push(tg);
  });
  T_ai = new Tag(top, "cs-ai", `<span class="ai-pill">AI</span><span>${peer.name}</span>`);
}

function buildPanels() {
  // The step panel: four steps and the sources line.
  hud = el("div", "cs-hud glass", ui);
  hud.innerHTML = `<div class="cs-hud-head"><span class="ai-pill">AI</span><div><b>Setting up ${peer.name}</b><small>Reads as ${person.login}, with his own sign-in · read-only</small></div></div>
    <div class="cs-steps"></div>`;
  srcP = el("div", "cs-srcp glass", ui);
  srcP.innerHTML = `<div class="kick">Sources · what each one gave</div><div class="cs-srcs"></div>`;
  const stEl = hud.querySelector(".cs-steps");
  steps.forEach((s) => {
    const r = el("div", "cs-step", stEl, `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="10" fill="none" stroke="rgba(255,255,255,.24)" stroke-width="1.8"/>
      <path class="arc" d="M12 2 a10 10 0 0 1 10 10" fill="none" stroke="#b7f4cf" stroke-width="2.4" stroke-linecap="round"/>
      <circle class="dn" cx="12" cy="12" r="11.5" fill="#b7f4cf"/>
      <path class="ck" d="M7 12.4l3.3 3.3L17.2 8.8" fill="none" stroke="#0b3b2b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="16" stroke-dashoffset="16"/></svg>
      <span>${s.text}</span><em></em>`);
    hudSteps.push({ r, arc: r.querySelector(".arc"), dn: r.querySelector(".dn"), ck: r.querySelector(".ck"), em: r.querySelector("em") });
  });
  const srEl = srcP.querySelector(".cs-srcs");
  sources.forEach((s) => {
    const r = el("div", "cs-src", srEl, `<span style="color:${s.hue};display:inline-flex">${sourceIcon(s.id)}</span><span>${s.name}</span><em></em>`);
    hudSrcs[s.id] = { r, em: r.querySelector("em") };
  });

  // What I learned: summary and tags.
  sumP = el("div", "cs-sum glass", ui);
  sumP.innerHTML = `<div class="kick">What I learned about you</div><h2>${person.first}'s work, as a star map</h2>
    <div class="asof">${learned.asOf} · each fact a star, tied to its source</div><p>${learned.summary}</p>
    <div class="cs-tags">${learned.tags.map((x) => `<span>${x}</span>`).join("")}</div>`;
  sumP.parts = [...sumP.children];

  // What I learned: the facts, numbered like their stars, each with its source, link and date.
  flist = el("div", "cs-flist", ui);
  learned.facts.forEach((f, i) => {
    const s = sourceById[f.source];
    const c = el("div", "cs-fcard glass", flist, `<span class="num" style="--hue:${s.hue}">${i + 1}</span><b>${f.title}</b>
      <div class="meta"><span style="color:${s.hue};display:inline-flex">${sourceIcon(s.id)}</span>${s.short} · ${f.ref} · ${f.date}${icons.link}</div>`);
    fcards.push(c);
  });

  // Your brief: the heading over the column.
  bhead = el("div", "cs-bhead", ui);
  bhead.innerHTML = `<div class="kick">Your brief · Sunday, Nov 15</div><h2>What matters now</h2><p>${brief.lead} Newest first.</p>`;

  // Ask your Peer.
  askP = el("div", "cs-ask glass", ui);
  askP.innerHTML = `<div class="kick">Ask your Peer</div><div class="row">${icons.search}<div class="q"><span class="qt"></span><span class="caret"></span></div></div>
    <div class="ex">${ask.examples.map((x) => `<span>${x}</span>`).join("")}</div>
    <div class="st">${icons.search}<span>Searching again, as ${person.login}: Slack · Mail · Code</span></div>`;
  askQ = askP.querySelector(".qt"); askCaret = askP.querySelector(".caret"); askEx = askP.querySelector(".ex"); askSt = askP.querySelector(".st");

  ansP = el("div", "cs-ans glass", ui);
  ansP.innerHTML = `<div class="kick">Answer · with its sources</div><div class="sents"></div>
    <div class="foot"><svg class="ring" viewBox="0 0 58 58"><circle cx="29" cy="29" r="24" fill="none" stroke="rgba(255,255,255,.13)" stroke-width="5"/>
      <circle class="fill" cx="29" cy="29" r="24" fill="none" stroke="#b7f4cf" stroke-width="5" stroke-linecap="round" transform="rotate(-90 29 29)" stroke-dasharray="150.8" stroke-dashoffset="150.8"/>
      <circle cx="29" cy="29" r="6" fill="#b7f4cf" class="core"/></svg>
      <div class="cert"><b>Confidence: ${ask.certainty}</b><span>${ask.asOf}</span></div></div>
    <div class="chips">${ask.sources.map((c, i) => { const s = sourceById[c.source]; return `<span><i style="--hue:${s.hue}">${i + 1}</i><b style="color:${s.hue};display:inline-flex">${sourceIcon(s.id)}</b>${s.name} · ${c.ref} · ${c.date}</span>`; }).join("")}</div>`;
  const sEl = ansP.querySelector(".sents");
  ask.answer.forEach((a, i) => {
    const s = sourceById[ask.sources[a.cite].source];
    const row = el("div", "s", sEl);
    const dot = el("span", "cd", row, String(a.cite + 1));
    dot.style.setProperty("--hue", s.hue);
    ansDots.push(dot);
    const words = a.text.split(" ").map((w, j, arr) => el("span", "w", row, w + (j < arr.length - 1 ? " " : "")));
    ansWords.push(words);
  });
  ringFill = ansP.querySelector(".fill");
  ansFoot = ansP.querySelector(".foot");
  ansChips = ansP.querySelector(".chips");
  // Where each citation dot sits inside the answer panel (for the streams of light).
  ansP.style.transform = "translate(0px, 0px)";
  const pr = ansP.getBoundingClientRect();
  dotOff = ansDots.map((d) => { const r = d.getBoundingClientRect(); return [r.left + r.width / 2 - pr.left, r.top + r.height / 2 - pr.top]; });

  rhead = el("div", "cs-rhead", ui);
  rhead.innerHTML = `<div class="kick">How it works</div><h2>The rules it keeps</h2><p><span class="ai-pill">AI</span>Always labelled as AI · it reads as you, and only reads</p>`;
}

// ---------------------------------------------------------------------------------------------
// The comet's position, with the beats where the scene steers it.
function cometAt(t) {
  let p = cometBase(t);
  const kb = io(t, 37.9, 39.0) * (1 - io(t, 45.9, 46.9));
  if (kb > 0) {
    const bob = [Math.sin(t * 1.3) * 0.08, Math.cos(t * 1.1) * 0.08, 0];
    p = V.lerp(p, V.add(briefHome, bob), kb);
  }
  return p;
}

// The clusters' visibility through the film (1 = full).
function clusterVis(id, t) {
  const i = ORDER.indexOf(id);
  const k = oc(t, T.clusters0 + i * 0.16, T.clusters0 + 1.3 + i * 0.16);
  const dimBrief = 1 - 0.35 * win(t, 38.0, 46.4, 0.8, 0.6);
  const dimEnd = 1 - io(t, T.gather0, T.gather0 + 1.2);
  return k * dimBrief * dimEnd;
}
const readState = (id, t) => {
  const v = T.visit[id];
  return { reading: t >= v.r0 - 0.15 && t < v.done, done: t >= v.done, v };
};
const connected = (id, t) => !T.visit[id].click || t >= T.visit[id].click + 0.12;

// The knowledge star's position (it lifts in step 4, rides into the brief column, comes home).
function knowPos(k, t) {
  let p = k.pos;
  if (k.kind === "brief") {
    const lift = io(t, 25.8, 27.6) * (1 - io(t, 37.8, 38.6));
    p = V.add(p, V.scl([0.2, 0.5, 3.4], lift));
    const i = k.i;
    const go = E.inOutQuart(P(t, T.col0 + i * 0.14, T.col0 + 1.3 + i * 0.14));
    const back = E.inOutCubic(P(t, T.col1 + 0.1 + (3 - i) * 0.08, T.col1 + 0.95 + (3 - i) * 0.08));
    if (go > 0 && back < 1) {
      const mid = V.add(V.lerp(p, colPos[i], 0.5), [0, 1.2, 0]);
      const k1 = go * (1 - back);
      // a curved flight: a quadratic through a lifted midpoint
      const a = V.lerp(p, mid, k1), b = V.lerp(mid, colPos[i], k1);
      p = V.lerp(a, b, k1);
    }
  }
  return p;
}

// ---------------------------------------------------------------------------------------------
function renderAt(t) {
  // Camera.
  const c = cam(t);
  camNow = c;
  G.camera.position.set(c[0], c[1], c[2]);
  G.camera.up.set(0, 1, 0);
  G.camera.lookAt(c[3], c[4], c[5]);
  G.camera.rotateZ(((c[7] || 0) * Math.PI) / 180);
  if (G.camera.fov !== c[6]) { G.camera.fov = c[6]; G.camera.updateProjectionMatrix(); }
  G.camera.updateMatrixWorld(true);
  G.scene.updateMatrixWorld(true);
  const pxk = 540 / Math.tan((c[6] / 2) * Math.PI / 180);
  SP.setPx(pxk); dust.setPx(pxk);
  dust.mat.uniforms.uTime.value = t;

  const live = t >= T.point1 - 0.02; // the space shows from the point of light on
  setStyle(G.renderer.domElement, "display", live ? "" : "none");

  const comet = cometAt(t);
  const gatherK = P(t, T.gather0, T.gather0 + 1.25);

  SP.begin();
  const cx = c[0], cy = c[1], cz = c[2];
  const put = (p, size, col, a, kind = 1) => {
    if (kind !== 1 && kind !== 2) {
      const px = (size * pxk) / Math.max(0.3, Math.hypot(p[0] - cx, p[1] - cy, p[2] - cz));
      const cap = kind === 0 ? 560 : kind === 4 ? 240 : 1300;
      if (px > cap) size *= cap / px;
    }
    if (gatherK > 0) {
      const h = Math.abs(Math.sin(p[0] * 12.9898 + p[1] * 78.233 + p[2] * 37.719) * 43758.5453) % 1;
      const kOf = (g) => E.inOutCubic(clamp((g - h * 0.4) / 0.6));
      const k = kOf(gatherK);
      if (k > 0 && k < 1 && kind !== 0 && kind !== 3) {
        // a short streak behind each light as it is drawn in
        for (let j = 1; j <= 3; j++) {
          const kj = kOf(gatherK - j * 0.018);
          SP.add(V.lerp(p, comet, kj), size * (1 - j * 0.2), col, a * (1 - j * 0.28) * (1 - kj * 0.5), 1);
        }
      }
      p = V.lerp(p, comet, k);
      a *= 1 - 0.7 * k * k * k;
      if (kind === 0 || kind === 3) a *= 1 - k;
    }
    SP.add(p, size, col, a, kind);
  };

  if (live) {
    drawClusters(t, put, comet);
    drawRam(t, put);
    drawKnowledge(t, put);
    drawComet(t, put, comet);
    drawWaves(t, put, comet);
  }
  SP.end();
  setLines(t);

  // Page particles, sky and post.
  PD.set(t - T.fall0);
  sky.material.opacity = 0.15 + 0.85 * io(t, 5.0, 6.6);
  G.bloom.strength = 0.9;
  G.bloom.threshold = lerp(1.05, 0.2, io(t, 5.6, 6.6));
  G.grade.uniforms.uVig.value = 0.34 * io(t, 4.95, 6.2);
  G.grade.uniforms.uGrain.value = 0.022 * io(t, 4.95, 6.2);
  G.grade.uniforms.uFrame.value = Math.round(t * 30);
  if (live) G.composer.render();

  drawPage(t);
  drawPanels(t);
  drawLabels(t, comet);
  drawFx(t);
}

// ---------------------------------------------------------------------------------------------
function drawPage(t) {
  // 3.2 to 4.4 s: the pointer glides to the button and clicks; the button squashes, then
  // collapses into a point of light; the page crumbles from there (the particles take over).
  const down = Math.max(0, 1 - Math.abs(t - 4.45) / 0.12);
  const k = E.inCubic(P(t, T.point0, T.point1));
  const sq = 1 - 0.06 * down + 0.04 * (spring(t, 4.5, 3, 0.4) - (t > 4.5 ? 1 : 0));
  const sx = sq * (1 - 0.86 * k), sy = sq * (1 - 0.62 * k);
  pg.button.style.transform = `scale(${sx.toFixed(4)}, ${sy.toFixed(4)})`;
  pg.button.style.background = k > 0 ? `rgb(${Math.round(22 + 210 * k)}, ${Math.round(115 + 135 * k)}, ${Math.round(83 + 150 * k)})` : "";
  pg.button.style.color = `rgba(255,255,255,${(1 - Math.min(1, k * 2.5)).toFixed(3)})`;
  pg.button.style.borderRadius = `${(14 + 40 * k).toFixed(1)}px`;
  pg.button.style.boxShadow = k > 0 ? `0 0 ${(20 + 70 * k).toFixed(0)}px ${(4 + 18 * k).toFixed(0)}px rgba(183,244,207,${(0.35 + 0.6 * k).toFixed(2)})` : "";
  const fade = P(t, T.point1, T.point1 + 0.28);
  setStyle(pg.root, "opacity", (1 - fade).toFixed(3));
  setStyle(pg.root, "display", fade >= 1 ? "none" : "");
  // The pointer: the page click, then the three Connect clicks.
  const [px, py, pd, po] = pointerAt(t);
  ptr.at(px, py, pd, po);
}

function connBtnCentre(id, t) {
  const s = proj(CL[id].c);
  const rpx = CL[id].r * 1.15 * pxPerUnit(s[3]);
  return [s[0] + rpx + 40 + connOff[id][0], s[1] + connOff[id][1]];
}
function pointerAt(t) {
  if (t < 6) {
    const [x, y] = keys(t, [[3.2, [1500, 900]], [4.2, btnPx], [6, btnPx]]);
    const down = Math.max(0, 1 - Math.abs(t - 4.45) / 0.12);
    return [x, y, down, 1 - P(t, 4.8, 5.15)];
  }
  const vs = T.visit.slack, vc = T.visit.code, vt = T.visit.tickets;
  if (t < 11.2 || t > 19.2) return [1700, 1000, 0, 0];
  const bs = connBtnCentre("slack", t), bc = connBtnCentre("code", t), bt = connBtnCentre("tickets", t);
  let p;
  if (t < vs.click + 0.4) p = V.lerp([1720, 1010], bs, E.inOutCubic(P(t, 11.6, vs.click - 0.22)));
  else if (t < vc.click + 0.3) p = V.lerp(bs, bc, E.inOutCubic(P(t, vs.click + 0.6, vc.click - 0.16)));
  else if (t < vt.click + 0.3) p = V.lerp(bc, bt, E.inOutCubic(P(t, vc.click + 0.35, vt.click - 0.16)));
  else p = V.lerp(bt, [bt[0] + 260, bt[1] + 300], E.inOutCubic(P(t, vt.click + 0.4, vt.click + 1.2)));
  const d = Math.max(0, 1 - Math.abs(t - vs.click) / 0.12, 1 - Math.abs(t - vc.click) / 0.1, 1 - Math.abs(t - vt.click) / 0.1);
  const o = P(t, 11.4, 11.8) * (1 - P(t, vt.click + 0.6, vt.click + 1.1));
  return [p[0] + 8, p[1] + 6, d, o];
}

// ---------------------------------------------------------------------------------------------
function drawClusters(t, put, comet) {
  for (const id of ORDER) {
    const cl = CL[id], vis = clusterVis(id, t);
    if (vis <= 0.001) continue;
    const { reading, done, v } = readState(id, t);
    const hue = HUE[id];
    const conn = connected(id, t);
    const readK = oc(t, v.r0, v.r1 + 0.3);
    const flare = pulse(t, v.r0 - 0.1, v.r1 + 0.6, 0.35);
    // the nebula: soft puffs in the source's hue, brighter once read
    const base = (0.06 + 0.07 * readK + 0.12 * flare) * vis * (conn ? 1 : 0.6);
    put(cl.c, cl.r * 3.4, hue, base * 0.8, 0);
    put(V.add(cl.c, [cl.r * 0.35, cl.r * 0.2, -0.3]), cl.r * 2.2, hue, base, 0);
    put(V.add(cl.c, [-cl.r * 0.3, -cl.r * 0.15, 0.2]), cl.r * 1.5, mixc(hue, WHITE, 0.3), base * 0.9, 0);
    // the stars: dim until read; the found ones light one by one, nearest the comet first
    const st = clusterStars[id];
    const fo = foundOrder[id];
    for (let i = 0; i < st.length; i++) {
      const s = st[i];
      const tw = 0.85 + 0.15 * Math.sin(t * 1.7 + s[4]);
      const ti = fo[i];
      let a = (id === "directory" ? 0.34 : 0.3) * tw, size = s[3] * (id === "directory" ? 2.6 : 3.2);
      let col = mixc(WHITE, hue, id === "directory" ? 0.2 : 0.55);
      if (!conn) a *= 0.55;
      if (ti != null && t >= ti) {
        const ig = t - ti;
        a = 0.95 * tw + 2.6 * Math.exp(-ig * 6);
        size = s[3] * 4.4 + 0.35 * Math.exp(-ig * 5);
        col = mixc(WHITE, hue, 0.4);
      }
      put([s[0], s[1], s[2]], size, col, a * vis, 1);
    }
    // the named items
    for (const it of W.ITEMS) {
      if (it.src !== id) continue;
      const p = itemPos(it.id), ti = itemIgnite[it.id];
      let a = 0.35 * (conn ? 1 : 0.55), size = 0.3, kind = 1;
      if (t >= ti) {
        const ig = t - ti;
        a = 1.25 + 3.2 * Math.exp(-ig * 5);
        size = 0.62 + 0.5 * Math.exp(-ig * 4);
        kind = 2;
        put(p, 1.6, hue, (0.3 + 0.7 * Math.exp(-ig * 3)) * vis, 0);
      }
      // the traced fact (What I learned): its source lights again
      const tr = it.id === "d1" ? pulse(t, T.trace1 - 0.15, T.learned1, 0.3) : 0;
      if (tr > 0) put(p, 3.2, hue, 0.8 * tr, 4);
      put(p, size, mixc(WHITE, hue, 0.3), a * vis, kind);
    }
    // the scan: a ring of light from the comet as it reads
    if (reading && t >= v.r0) {
      const k = P(t, v.r0, v.r1);
      for (let w = 0; w < 2; w++) {
        const kk = (k * 1.6 + w * 0.5) % 1;
        put(V.lerp(comet, cl.c, 0.5), cl.r * (0.6 + 2.6 * kk), mixc(hue, WHITE, 0.4), 0.32 * (1 - kk) * (1 - kk) * (k < 1 ? 1 : 0) * vis, 3);
      }
    }
    // the one-time Connect: a faint ring that keeps the comet out, until Ram signs in
    if (v.click) {
      const kd = P(t, v.click + 0.05, v.click + 0.75);
      const near = 0.12 + 0.88 * oc(t, v.arrive - 1.4, v.arrive - 0.3);
      const ringA = (0.5 + 0.1 * Math.sin(t * 3)) * near * (1 - kd) * vis;
      put(cl.c, cl.r * 2.3 * (1 + 0.5 * E.outCubic(kd)), mixc(hue, WHITE, 0.25), ringA, 3);
      put(cl.c, cl.r * 2.3, hue, 0.05 * (1 - kd) * vis, 0);
      if (kd > 0 && kd < 1) {
        const Rb = rng(500 + ORDER.indexOf(id));
        for (let j = 0; j < 48; j++) {
          const a = Rb() * Math.PI * 2, sp = 0.6 + Rb() * 0.9;
          const r0 = cl.r * 1.15 * (1 + kd * sp * 0.9);
          const p = V.add(cl.c, [Math.cos(a) * r0, Math.sin(a) * r0, (Rb() - 0.5) * 0.6]);
          put(p, 0.16, mixc(hue, WHITE, 0.5), 1.4 * (1 - kd) * vis, 1);
        }
      }
    }
  }
}

function drawRam(t, put) {
  // Ram's entry streams from the directory to the centre and ignites as his star.
  const it = itemPos("ram"), v = T.visit.directory;
  const leave = itemIgnite.ram + 0.25, arrive = T.ramIgnite;
  if (t >= leave && t < arrive + 0.05) {
    const k = E.inOutCubic(P(t, leave, arrive));
    const path = arcPt(it, W.RAM, k, 1.6);
    for (let j = 0; j < 7; j++) {
      const kk = Math.max(0, k - j * 0.025);
      put(arcPt(it, W.RAM, kk, 1.6), 0.5 - j * 0.05, WARM, 1.8 - j * 0.22, 1);
    }
    put(path, 1.4, WARM, 0.6, 0);
  }
  if (t < arrive) return;
  const ig = t - arrive;
  const fl = Math.exp(-ig * 2.2);
  const RAMC = lin("#ffd9a0");
  put(W.RAM, 0.95 + 0.45 * fl, mixc(WARM, WHITE, 0.3), 1.15 + 1.3 * fl, 2);
  put(W.RAM, 2.3 + 1.0 * fl, RAMC, 0.2 + 0.26 * fl, 0);
  put(W.RAM, 7, MINT, 0.03 + 0.04 * fl, 0);
  if (ig < 1.4) put(W.RAM, 2 + ig * 8, mixc(WARM, WHITE, 0.3), 0.55 * Math.pow(1 - ig / 1.4, 1.5), 3);
}
const arcPt = (a, b, k, lift) => {
  const m = V.add(V.lerp(a, b, 0.5), [0, lift, lift * 0.4]);
  const u = 1 - k;
  return a.map((v, i) => u * u * v + 2 * u * k * m[i] + k * k * b[i]);
};

function drawKnowledge(t, put) {
  for (const k of KNOW) {
    const kt = KNOW_TIMES[k.id];
    const src = itemById[k.item].src;
    const hue = HUE[src];
    const from = itemPos(k.item);
    // its light streams from the item to its place near Ram
    if (t >= kt.leave && t < kt.born + 0.05) {
      const kk = E.inOutCubic(P(t, kt.leave, kt.born));
      const lift = V.dist(from, k.pos) * 0.22;
      for (let j = 0; j < 9; j++) {
        const q = Math.max(0, kk - j * 0.02);
        put(arcPt(from, k.pos, q, lift), 0.42 - j * 0.035, mixc(hue, WHITE, 0.5), 2.0 - j * 0.2, 1);
      }
      put(arcPt(from, k.pos, kk, lift), 1.3, hue, 0.5, 0);
    }
    if (t < kt.born) continue;
    const ig = t - kt.born;
    const p = knowPos(k, t);
    let bright = 1 + 2.4 * Math.exp(-ig * 4);
    // near the camera (in the brief column) a star needs less size to read as a bright point
    const near = k.kind === "brief" ? win(t, T.col0 + 0.4, T.col1 + 0.9, 0.9, 0.8) : 0;
    let size = (0.5 + 0.4 * Math.exp(-ig * 4)) * (1 - 0.55 * near);
    let col = mixc(WHITE, hue, 0.25), halo = hue;
    if (k.kind === "brief") {
      const b = io(t, T.briefLift0, T.briefLift0 + 0.8) * (1 - io(t, T.col1 + 0.6, T.col1 + 1.4));
      bright *= 1 + 0.9 * b;
      size *= 1 + 0.7 * b;
      col = mixc(col, [0.9, 1.0, 0.95], b);
      halo = mixc(hue, MINT, b);
      if (b > 0.01) put(p, 2.6 * (1 - 0.6 * near), MINT, 0.32 * b, 0);
    }
    // ask: the four cited stars flare; every star brightens as the search wave passes
    const ci = W.CITE_STARS.indexOf(k.id);
    if (ci >= 0) {
      const lit = oc(t, T.light0 + ci * 0.18, T.light0 + 0.5 + ci * 0.18) * (1 - io(t, T.ask1, T.ask1 + 0.6));
      bright *= 1 + 1.6 * lit;
      size *= 1 + 0.6 * lit;
      if (lit > 0) put(p, 3.4, hue, 0.45 * lit, 0);
    }
    const waveR = 34 * E.outQuad(P(t, T.wave0, T.wave0 + 2.0));
    const wv = t > T.wave0 && t < T.wave0 + 2.2 ? Math.exp(-Math.pow((V.dist(p, W.RAM) - waveR) / 1.4, 2)) : 0;
    bright *= 1 + 1.5 * wv;
    // the traced fact glows while it is traced
    if (k.id === "F1") { const tr = pulse(t, T.glide0 + 0.6, T.learned1, 0.4); bright *= 1 + 0.8 * tr; if (tr > 0) put(p, 3.2, MINT, 0.3 * tr, 0); }
    put(p, size, col, bright, 2);
    put(p, 1.5 * (1 - 0.6 * near), halo, 0.22 + 0.3 * Math.exp(-ig * 3), 0);
  }
}

function drawComet(t, put, P0) {
  if (t < T.point1 - 0.02) return;
  const shrink = 1 - 0.55 * io(t, T.gather0 + 0.6, T.end + 0.4);
  const born = oc(t, T.point1 - 0.02, T.point1 + 0.35);
  // tail: where it was a moment ago (longer when it moves fast)
  // the soft outer tail (a few wide glows) and a dense bright core, so it stays one streak at speed;
  // a slow comet shows little tail (its samples would pile up on one spot)
  const TEAL = lin("#5fd4c4");
  const speed = V.dist(P0, cometAt(t - 0.12)) / 0.12;
  const tailK = smoothstep(0.6, 5, speed);
  for (let i = 24; i >= 1; i--) {
    const q = cometAt(t - i * 0.024), k = i / 24;
    const col = mixc(mixc(WHITE, MINT, Math.min(1, k * 2)), TEAL, Math.max(0, k * 1.4 - 0.4));
    const uq = Math.max(0.5, V.dist(q, camNow.slice(0, 3))) / pxPerUnit(1);
    put(q, Math.min((1.8 - 1.3 * k) * shrink, 160 * uq), col, 0.34 * Math.pow(1 - k, 1.6) * born * tailK, 0);
  }
  for (let i = 72; i >= 1; i--) {
    const q = cometAt(t - i * 0.0085), k = i / 72;
    put(q, (0.4 - 0.28 * k) * shrink, mixc(WHITE, MINT, k), 0.75 * Math.pow(1 - k, 2.0) * born * (0.15 + 0.85 * tailK), 1);
  }
  // sparkles shed from the tail (each respawns on its own clock: a pure function of t)
  for (let j = 0; j < 30; j++) {
    const life = 0.9, ph = (t / life + j * 0.6180339) % 1, born_t = t - ph * life;
    const idx = Math.floor(t / life + j * 0.6180339);
    const Rr = rng(j * 7919 + idx * 104729);
    const dir = V.norm([Rr() - 0.5, Rr() - 0.5, Rr() - 0.5]);
    const q = V.add(cometAt(born_t), V.scl(dir, ph * (0.4 + Rr() * 0.8)));
    put(q, 0.14 * shrink, mixc(MINT, WHITE, Rr()), 1.1 * (1 - ph) * (1 - ph) * born, 1);
  }
  // head: a white core in a mint aura (capped in pixels, so a close camera is not swamped)
  const flareEnd = pulse(t, T.gather0 + 0.8, T.end + 0.3, 0.3);
  const breathe = (1 + 0.06 * Math.sin(t * 4.1)) * (1 + 0.8 * flareEnd);
  const d = Math.max(0.5, V.dist(P0, camNow.slice(0, 3))), u = d / pxPerUnit(1);
  put(P0, Math.min(0.95 * shrink * breathe, 120 * u), WHITE, 2.4 * born, 4);
  put(P0, Math.min(2.6 * shrink, 220 * u), MINT, 0.6 * born, 0);
  put(P0, Math.min(7 * shrink, 420 * u), MINT, (0.1 + 0.25 * flareEnd) * born, 0);
  // at the end it settles as a small avatar: a thin mint ring round the light
  const av = oc(t, T.end - 0.3, T.end + 0.4);
  if (av > 0) put(P0, 74 * u, MINT, 0.9 * av, 3);
}

function drawWaves(t, put, comet) {
  // Ask: a pulse runs out through the constellation from Ram.
  if (t > T.wave0 && t < T.wave0 + 2.2) {
    const k = P(t, T.wave0, T.wave0 + 2.0), r = 34 * E.outQuad(k);
    const fade = (1 - k) * (1 - k);
    for (let ring = 0; ring < 2; ring++) {
      const tl = ring ? 1.1 : 0.12;
      for (let j = 0; j < 150; j++) {
        const a = (j / 150) * Math.PI * 2 + ring * 0.7;
        const x = Math.sin(a) * r, z = Math.cos(a) * r;
        const p = [x, z * Math.sin(tl), z * Math.cos(tl)];
        put(p, 0.22 + 0.25 * k, mixc(MINT, WHITE, 0.5), 1.5 * fade * (ring ? 0.55 : 1), 1);
      }
    }
  }
  // Enter: the question leaves as a spark from the ask box (it is the comet's cue).
  // Line heads: a bright bead where each line is being drawn.
  KNOW.forEach((k, i) => {
    const a = T.lines0 + i * 0.14;
    if (t > a && t < a + 1.15) {
      const kk = E.inOutCubic(P(t, a, a + 1.1));
      put(at(kLines[k.id].points, kk), 0.45, WHITE, 2.2, 1);
    }
  });
  // Light that flows along the lines (from the source to the star) while it matters.
  const flowOn = (id) => {
    const ci = W.CITE_STARS.indexOf(id);
    const ask = ci >= 0 ? pulse(t, T.light0 + ci * 0.18, T.ask1, 0.4) : 0;
    const trace = id === "F1" ? pulse(t, T.trace0, T.learned1, 0.3) : 0;
    return Math.max(ask, trace);
  };
  for (const k of KNOW) {
    const on = flowOn(k.id);
    if (on <= 0) continue;
    const pts = kLines[k.id].points, hue = HUE[itemById[k.item].src];
    // the trace runs the other way: from the fact back to its source
    const back = k.id === "F1" && t < T.ask0;
    for (let j = 0; j < 7; j++) {
      let u = (t * 0.55 + j / 7) % 1;
      if (back) u = 1 - u;
      put(at(pts, u), 0.3, mixc(hue, WHITE, 0.5), 1.6 * on, 1);
    }
  }
  // The trace: one bright bead runs from the fact back to its source.
  if (t > T.trace0 && t < T.trace1 + 0.2) {
    const kk = E.inOutCubic(P(t, T.trace0, T.trace1));
    const pts = kLines.F1.points;
    put(at(pts, 1 - kk), 0.7, WHITE, 3, 4);
    put(at(pts, 1 - kk), 2.2, HUE.docs, 0.5, 0);
  }
  // Your brief: light runs from each source to its card's star.
  colLines.forEach((ln, i) => {
    const on = pulse(t, T.colLines0 + i * 0.2 + 0.7, T.col1, 0.3);
    if (on <= 0) return;
    const hue = HUE[brief.items[i].source];
    for (let j = 0; j < 6; j++) {
      const u = 1 - ((t * 0.32 + j / 6) % 1);
      put(at(ln.points, u), 0.18, mixc(hue, WHITE, 0.5), 1.4 * on, 1);
    }
  });
}

function setLines(t) {
  const vis = 1 - io(t, T.gather0, T.gather0 + 1.0);
  const dimB = 1 - 0.6 * win(t, 38.0, 46.4, 0.8, 0.6);
  KNOW.forEach((k, i) => {
    const a = T.lines0 + i * 0.14;
    const kk = E.inOutCubic(P(t, a, a + 1.1));
    const ci = W.CITE_STARS.indexOf(k.id);
    const lit = ci >= 0 ? pulse(t, T.light0 + ci * 0.18, T.ask1, 0.4) : 0;
    const tr = k.id === "F1" ? pulse(t, T.trace0, T.learned1, 0.3) : 0;
    const alpha = (0.42 + 0.5 * Math.max(lit, tr)) * dimB * vis;
    kLines[k.id].set(kk, alpha, 2.4 + 1.6 * Math.max(lit, tr));
  });
  eLines.forEach((e, i) => {
    const a = T.related0 + i * 0.12;
    e.line.set(E.inOutCubic(P(t, a, a + 0.7)), 0.3 * dimB * vis);
  });
  colLines.forEach((ln, i) => {
    const a = T.colLines0 + i * 0.2;
    const k = E.inOutCubic(P(t, a, a + 0.9)) * (1 - io(t, T.col1, T.col1 + 0.5));
    ln.set(k, 0.5);
  });
  const rk = E.inOutCubic(P(t, T.rulesRing0, T.rulesRing0 + 1.3));
  ringLine.set(rk, 0.55 * vis);
}

// ---------------------------------------------------------------------------------------------
function focusAt(t) {
  for (const id of ORDER) {
    const v = T.visit[id];
    if (t >= v.arrive - 0.9 && t < v.done + 0.35) return CL[id].c;
  }
  if (t >= T.glide0 && t < T.learned1) return V.add(knowById.F1.pos, [4, 0, 0]);
  return W.RAM;
}

function drawLabels(t, comet) {
  const live = t >= T.point1;
  // Source clusters: icon, name and what reading it gave, above each cluster.
  for (const s of sources) {
    const id = s.id, cl = CL[id], tg = T_cl[id];
    const vis = clusterVis(id, t) * (live ? 1 : 0);
    const sp = proj(cl.c);
    if (!sp[2] || vis <= 0) { tg.place(0, 0, 0); continue; }
    const rpx = cl.r * 0.78 * pxPerUnit(sp[3]);
    const { reading, done } = readState(id, t);
    const conn = connected(id, t);
    let h = "";
    if (done) h = `<b>✓</b>${s.found}`;
    else if (reading && conn) {
      const n = foundCount[id].times.filter((x) => x <= t).length;
      h = `<span class="key">${icons.key}reading as ${person.login}${id === "directory" ? "" : ` · ${n} found`}</span>`;
    } else if (!conn) h = `<span class="key" style="color:#d9c6ff">${icons.lock}needs a one-time Connect</span>`;
    html(tg.small, h);
    const near = clamp((sp[3] - 4) / 8);
    const quiet = (1 - win(t, 28.6, 38.2, 0.6, 0.6) * 0.3) * (1 - win(t, 46.6, 60.4, 0.6, 0.6) * 0.45) * (1 - io(t, T.rules0, T.rules0 + 0.6));
    tg.safe(sp[0], sp[1] - rpx - 4, vis * near * quiet);
  }
  // Items: their titles flicker in beside their stars as it reads, then fade when it moves on.
  for (const it of W.ITEMS) {
    const tg = T_items[it.id], ti = itemIgnite[it.id];
    const v = T.visit[it.src];
    let o = win(t, ti, v.done + 1.0, 0.22, 0.45);
    if (it.id === "d1") o = Math.max(o, win(t, T.trace1 - 0.1, T.learned1, 0.35, 0.4));
    const sp = proj(itemPos(it.id));
    const slide = (1 - oc(t, ti, ti + 0.3)) * -10;
    tg.safe(sp[0] + slide, sp[1], sp[2] ? o * (live ? 1 : 0) : 0);
  }
  // Ram, and his directory entry orbiting in small type.
  {
    const sp = proj(W.RAM);
    const o = oc(t, T.ramIgnite + 0.1, T.ramIgnite + 0.6) * (1 - io(t, T.gather0, T.gather0 + 0.8));
    const s = 0.8 + 0.2 * spring(t, T.ramIgnite + 0.1, 2.2, 0.45);
    T_ram.safe(sp[0], sp[1], sp[2] ? o * (1 - 0.4 * win(t, 46.6, 60.4)) * (1 - io(t, T.rules0, T.rules0 + 0.6)) : 0, s);
    const ux = [1, 0, 0], uz = V.norm([0, 0.42, 1]);
    T_orb.forEach((tg, i) => {
      const a = i * (Math.PI / 2) + (t - T.ramIgnite) * 0.5 + 0.6;
      const p = V.add(W.RAM, V.add(V.scl(ux, Math.cos(a) * 3.6), V.scl(uz, Math.sin(a) * 2.4)));
      const q = proj(p);
      const o2 = win(t, T.ramIgnite + 0.3 + i * 0.12, 10.9, 0.4, 0.6);
      tg.safe(q[0], q[1], q[2] ? o2 : 0, 0.9 + 0.1 * Math.sin(a));
    });
  }
  // Topics: the shape of Ram's work.
  W.TOPICS.forEach((tp, i) => {
    const q = proj(tp.at);
    const o = win(t, T.topics0 + i * 0.3, T.glide0 - 0.2, 0.6, 0.5);
    T_topics[i].safe(q[0], q[1], q[2] ? o : 0, 0.92 + 0.08 * oc(t, T.topics0 + i * 0.3, T.topics0 + i * 0.3 + 0.6));
  });
  // What I learned: each fact star carries its number (the list on the right has the words).
  learned.facts.forEach((f, i) => {
    const k = KNOW.find((x) => x.kind === "fact" && x.i === i);
    const q = proj(knowPos(k, t));
    const a = T.cards0 + i * 0.16;
    const o = win(t, a, T.glide0 + 0.3, 0.3, 0.4);
    T_facts[i].safe(q[0], q[1], q[2] ? o : 0, 0.6 + 0.4 * E.outBack(P(t, a, a + 0.45)));
  });
  // The one-time Connect buttons (Slack, Code, Tickets), to the right of each veiled cluster.
  for (const id of ["slack", "code", "tickets"]) {
    const v = T.visit[id], tg = T_conn[id];
    const sp = proj(CL[id].c);
    const rpx = CL[id].r * 1.15 * pxPerUnit(sp[3]);
    const ok = t >= v.click + 0.08;
    cls(tg.el, "ok", ok);
    html(tg.btn, ok ? `${icons.check}<span>Connected as ${person.login}</span>` : `${icons.lock}<span>Connect ${sourceById[id].name}</span>`);
    const press = Math.max(0, 1 - Math.abs(t - v.click) / 0.12);
    const o = win(t, v.button, v.click + (id === "slack" ? 0.95 : 0.55), 0.35, 0.3);
    tg.safe(sp[0] + rpx + 30, sp[1], sp[2] ? o : 0, (0.96 + 0.04 * oc(t, v.button, v.button + 0.4)) * (1 - 0.04 * press));
  }
  {
    const v = T.visit.slack, sp = proj(CL.slack.c);
    const rpx = CL.slack.r * 1.15 * pxPerUnit(sp[3]);
    const o = win(t, v.click + 0.15, v.click + 1.5, 0.3, 0.35);
    T_signed.safe(sp[0] + rpx + 30, sp[1], sp[2] ? o : 0);
  }
  // Ask: the four stars whose light the answer takes.
  W.CITE_STARS.forEach((id, i) => {
    const q = proj(knowPos(knowById[id], t));
    const o = win(t, T.light0 + i * 0.18 + 0.1, T.ask1, 0.4, 0.4);
    T_cites[i].safe(q[0], q[1], q[2] ? o : 0, 0.9 + 0.1 * oc(t, T.light0 + i * 0.18, T.light0 + 0.5 + i * 0.18));
  });
  // How it works: the six rules ride a ring round the constellation; the one in front lights.
  const spin = W.RULES.spin * E.inOutSine(P(t, T.rules0, T.end));
  rules.forEach((r, i) => {
    const a = -(i / 6) * Math.PI * 2 + 0.5 + spin;
    const p = ringPoint(a);
    const q = proj(p);
    const front = clamp(1 - (q[3] - 22) / 26);
    const o = win(t, T.rulesRing0 + 0.4 + i * 0.12, T.gather0 + 0.6, 0.45, 0.5);
    const lit = smoothstep(0.62, 0.92, front);
    T_rules[i].place(q[0], q[1], q[2] ? o * (0.55 + 0.45 * lit) : 0, 0.86 + 0.16 * lit);
    setStyle(T_rules[i].p, "maxHeight", `${(60 * lit).toFixed(1)}px`);
    setStyle(T_rules[i].p, "opacity", lit.toFixed(3));
  });
  // The comet's AI label: always beside it when it is on screen, on the side away from what it reads.
  {
    const q = proj(comet), f = proj(focusAt(t));
    const sm = smoothstep(-70, 70, q[0] - f[0]);
    const w = T_ai.box[2] - T_ai.box[0];
    const dx = lerp(-w - 24, 22, sm);
    const o = oc(t, T.point0 + 0.25, T.point1 + 0.1) * (onScreen(q, -20) ? 1 : 0);
    T_ai.place(q[0] + dx, q[1], o);
  }
}

function drawPanels(t) {
  ZONES = [[1480, -200, 2200, 72]];
  if (CAPTIONS.some((c) => t >= c.at && t < c.to)) ZONES.push([-100, 922, 2100, 1300]);
  const zone = (o, r) => { if (o > 0.12) ZONES.push(r); };
  const show = (e, o) => { setStyle(e, "display", o > 0.003 ? "" : "none"); setStyle(e, "opacity", o.toFixed(3)); };
  // Step panel.
  {
    const o = oc(t, T.hud0, T.hud0 + 0.6) * (1 - io(t, T.hudOut, T.hudOut + 0.5));
    show(hud, o);
    setStyle(hud, "transform", `translateX(${((1 - o) * -40).toFixed(1)}px)`);
    zone(o, [40, 40, 600, 40 + hudH]);
    steps.forEach((s, i) => {
      const h = hudSteps[i], a = T.stepStart[i], d = T.stepDone[i];
      const on = t >= a && t < d, done = t >= d;
      cls(h.r, "on", on); cls(h.r, "done", done);
      h.arc.setAttribute("opacity", on ? "1" : "0");
      h.arc.setAttribute("transform", `rotate(${((t * 360 * 1.2) % 360).toFixed(1)} 12 12)`);
      const pop = E.outBack(P(t, d, d + 0.35));
      h.dn.setAttribute("opacity", done ? "1" : "0");
      h.dn.setAttribute("r", (11.5 * (0.4 + 0.6 * pop)).toFixed(2));
      h.ck.setAttribute("stroke-dashoffset", (16 * (1 - E.outCubic(P(t, d + 0.08, d + 0.4)))).toFixed(2));
      text(h.em, done ? secs(s.time) : "");
      setStyle(h.em, "opacity", oc(t, d + 0.1, d + 0.4).toFixed(3));
    });
  }
  // The sources line: each source with its tick and what it gave (end of setup).
  {
    const o = oc(t, T.srcLine, T.srcLine + 0.5) * (1 - io(t, T.hudOut, T.hudOut + 0.5));
    show(srcP, o);
    setStyle(srcP, "transform", `translateX(${((1 - o) * -40).toFixed(1)}px)`);
    zone(o, [40, 54 + hudH, 600, 54 + hudH + srcH]);
    sources.forEach((s, i) => {
      const r = hudSrcs[s.id];
      const k = oc(t, T.srcLine + 0.15 + i * 0.09, T.srcLine + 0.5 + i * 0.09);
      cls(r.r, "done", k > 0.5);
      html(r.em, `<b>✓</b>${s.found}`);
      setStyle(r.r, "opacity", (0.25 + 0.75 * k).toFixed(3));
      setStyle(r.r, "transform", `translateX(${((1 - k) * 14).toFixed(1)}px)`);
    });
  }
  // What I learned: the summary.
  {
    const o = oc(t, T.summary0, T.summary0 + 0.6) * (1 - io(t, T.glide0, T.glide0 + 0.5));
    show(sumP, o);
    setStyle(sumP, "transform", `translateX(${((1 - oc(t, T.summary0, T.summary0 + 0.7)) * -50).toFixed(1)}px)`);
    zone(o, [48, 96, 688, 96 + sumH]);
    sumP.parts.forEach((p, i) => {
      const k = oc(t, T.summary0 + 0.1 + i * 0.14, T.summary0 + 0.7 + i * 0.14);
      setStyle(p, "opacity", k.toFixed(3));
      setStyle(p, "transform", `translateY(${((1 - k) * 14).toFixed(1)}px)`);
    });
  }
  // What I learned: the fact list.
  {
    const o = win(t, T.cards0 - 0.1, T.glide0 + 0.3, 0.3, 0.45);
    show(flist, o);
    zone(o, [1410, 104, 1862, 104 + listH]);
    fcards.forEach((c, i) => {
      const k = oc(t, T.cards0 + i * 0.16, T.cards0 + 0.55 + i * 0.16);
      setStyle(c, "opacity", k.toFixed(3));
      setStyle(c, "transform", `translateX(${((1 - k) * 46).toFixed(1)}px)`);
    });
  }
  // Your brief: each of the four stars becomes a card, newest at the top (a zone for labels).
  brief.items.forEach((b, i) => {
    const k = KNOW.find((x) => x.kind === "brief" && x.i === i);
    const q = proj(knowPos(k, t));
    const a = T.colCards0 + i * 0.22;
    const o = win(t, a, T.col1 + 0.25 - (3 - i) * 0.04, 0.45, 0.35);
    const sc = Math.min(1.02, 0.55 + 0.45 * E.outBack(P(t, a, a + 0.6), 1.2));
    T_bcards[i].place(q[0], q[1], o, sc);
    const bx = T_bcards[i].box;
    zone(o, [q[0] + bx[0] * sc, q[1] + bx[1] * sc, q[0] + bx[2] * sc, q[1] + bx[3] * sc]);
  });
  // What I learned: the traced fact's card blooms beside its star (a zone for labels).
  {
    const q = proj(knowById.F1.pos);
    const o = win(t, T.cardBloom, T.learned1, 0.5, 0.5);
    const sc = 0.86 + 0.14 * E.outBack(P(t, T.cardBloom, T.cardBloom + 0.6));
    T_trace.place(q[0], q[1], q[2] ? o : 0, sc);
    const bx = T_trace.box;
    zone(o, [q[0] + bx[0] * sc, q[1] + bx[1] * sc, q[0] + bx[2] * sc, q[1] + bx[3] * sc]);
  }
  // Your brief: the heading.
  {
    const o = win(t, T.colCards0 - 0.3, T.col1 + 0.5, 0.6, 0.5);
    show(bhead, o);
    setStyle(bhead, "transform", `translateY(${((1 - oc(t, T.colCards0 - 0.3, T.colCards0 + 0.4)) * 16).toFixed(1)}px)`);
    zone(o, [132, 92, 892, 212]);
  }
  // Ask: the box (top centre, then the top of the right column) and the answer.
  {
    const o = win(t, T.ask0, T.ask1 + 0.5, 0.6, 0.5);
    show(askP, o);
    const mv = io(t, 51.7, 52.7);
    const x = lerp(530, 1012, mv), y = lerp(92, 84, mv) + (1 - oc(t, T.ask0, T.ask0 + 0.6)) * 18;
    setStyle(askP, "transform", `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`);
    const q = typed(ask.question, t, T.type0, 26);
    text(askQ, q);
    const typing = t >= T.type0 && t < T.enter;
    setStyle(askCaret, "opacity", typing || (t < T.type0 && Math.floor(t * 2) % 2 === 0) ? "1" : "0");
    const exO = 1 - io(t, T.enter, T.enter + 0.4);
    setStyle(askEx, "opacity", exO.toFixed(3));
    setStyle(askEx, "display", exO > 0.003 ? "" : "none");
    const stO = win(t, T.enter + 0.05, 52.4, 0.3, 0.4);
    setStyle(askSt, "opacity", stO.toFixed(3));
    setStyle(askSt, "display", stO > 0.003 ? "" : "none");
    zone(o, [x, y, x + 860, y + askH]);
    const glow = pulse(t, T.enter - 0.05, T.enter + 0.9, 0.3);
    setStyle(askP, "boxShadow", glow > 0 ? `inset 0 1px 0 rgba(255,255,255,.1), 0 0 ${(60 * glow).toFixed(0)}px rgba(183,244,207,${(0.45 * glow).toFixed(2)}), 0 24px 70px rgba(0,0,0,.45)` : "");

    const ao = win(t, 51.9, T.ask1 + 0.5, 0.6, 0.5);
    show(ansP, ao);
    const ay = ANS_Y + (1 - oc(t, 51.9, 52.7)) * 30;
    setStyle(ansP, "transform", `translate(1012px, ${ay.toFixed(1)}px)`);
    zone(ao, [1012, ay, 1872, ay + ansH]);
    ansWords.forEach((ws, i) => {
      const a = T.answer0 + i * T.sentence;
      ws.forEach((w, j) => {
        const k = oc(t, a + j * 0.045, a + 0.35 + j * 0.045);
        setStyle(w, "opacity", k.toFixed(3));
        setStyle(w, "transform", `translateY(${((1 - k) * 8).toFixed(1)}px)`);
        setStyle(w, "filter", k < 1 ? `blur(${((1 - k) * 4).toFixed(1)}px)` : "");
      });
      const dk = E.outBack(P(t, a - 0.12, a + 0.25));
      setStyle(ansDots[i], "transform", `scale(${dk.toFixed(3)})`);
      setStyle(ansDots[i], "opacity", P(t, a - 0.12, a).toFixed(3));
    });
    const rk = E.inOutCubic(P(t, T.ring0, T.ring0 + 1.0));
    ringFill.setAttribute("stroke-dashoffset", (150.8 * (1 - 0.9 * rk)).toFixed(2));
    setStyle(ansFoot, "opacity", oc(t, T.ring0 - 0.2, T.ring0 + 0.3).toFixed(3));
    const ck = oc(t, T.chips, T.chips + 0.5);
    setStyle(ansChips, "opacity", ck.toFixed(3));
    setStyle(ansChips, "transform", `translateY(${((1 - ck) * 10).toFixed(1)}px)`);
  }
  // How it works: the heading.
  {
    const o = win(t, T.rules0 + 0.3, T.gather0 + 0.7, 0.6, 0.5);
    show(rhead, o);
    setStyle(rhead, "transform", `translateY(${((1 - oc(t, T.rules0 + 0.3, T.rules0 + 1.0)) * 16).toFixed(1)}px)`);
    zone(o, [56, 64, 640, 200]);
  }
}

// The 2D layer: streams of light from the four cited stars into their sentences' dots.
function drawFx(t) {
  fxc.clearRect(0, 0, 1920, 1080);
  if (t < T.light0 || t > T.ask1 + 0.6) return;
  const fade = 1 - P(t, T.ask1, T.ask1 + 0.5);
  const ay = ANS_Y + (1 - oc(t, 51.9, 52.7)) * 30;
  fxc.globalCompositeOperation = "lighter";
  W.CITE_STARS.forEach((id, i) => {
    const a = T.answer0 + i * T.sentence - 0.7;
    if (t < a) return;
    const s = proj(knowPos(knowById[id], t));
    const d = [1012 + dotOff[i][0], ay + dotOff[i][1]];
    const hue = HUEX[ask.sources[i].source];
    const c1 = [s[0] + (d[0] - s[0]) * 0.45, s[1] - 120], c2 = [d[0] - 160, d[1]];
    const bz = (k) => {
      const u = 1 - k;
      return [u * u * u * s[0] + 3 * u * u * k * c1[0] + 3 * u * k * k * c2[0] + k * k * k * d[0],
        u * u * u * s[1] + 3 * u * u * k * c1[1] + 3 * u * k * k * c2[1] + k * k * k * d[1]];
    };
    const draw = E.inOutCubic(P(t, a, a + 0.7));
    fxc.lineWidth = 1.6;
    fxc.strokeStyle = hue;
    fxc.globalAlpha = 0.45 * fade;
    fxc.beginPath();
    for (let j = 0; j <= 40; j++) { const p = bz((j / 40) * draw); j ? fxc.lineTo(p[0], p[1]) : fxc.moveTo(p[0], p[1]); }
    fxc.stroke();
    for (let j = 0; j < 9; j++) {
      const u = ((t - a) * 0.7 + j / 9) % 1;
      if (u > draw) continue;
      const p = bz(u);
      const g = fxc.createRadialGradient(p[0], p[1], 0, p[0], p[1], 9);
      g.addColorStop(0, "rgba(255,255,255,0.95)");
      g.addColorStop(0.35, hue);
      g.addColorStop(1, "rgba(0,0,0,0)");
      fxc.globalAlpha = 0.85 * fade;
      fxc.fillStyle = g;
      fxc.fillRect(p[0] - 9, p[1] - 9, 18, 18);
    }
  });
  fxc.globalAlpha = 1;
  fxc.globalCompositeOperation = "source-over";
}
