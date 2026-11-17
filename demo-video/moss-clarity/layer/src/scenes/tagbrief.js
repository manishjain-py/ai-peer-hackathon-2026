// WP7 v2 (Tag): the morning brief on Ram's laptop, full frame, in the tag concept's own look (the
// walkthrough's app: demo-video/ui-concepts/tag/ style.css, paper.js, motion.js, tl.js): cream paper,
// the left rail with "Your brief" active, serif headings, thin rules, the dark green tag, an amber
// marker on the key line. Data: slot.brief (Draft 3's morning brief); slot.click: Ram's click on the
// decision's first button, in slot seconds.
//
// Beats (slot seconds, for a 5.4 s slot with the click at 4.2):
//   0      a calm page: the rail (the tag asleep in its home as a plain label), the greeting, the lead
//   0.1    the sections arrive one after another; the decision card rises last, settled by about 1.5
//   0.34   the tag wakes (its eyes pop), then glides like a paper card across the page (idea C's move)
//   1.75   it lands on the decision card's top edge and stands up
//   2.0    its line reaches the question; the card lights up amber; the marker runs along the question
//   1.9    the camera moves in on the decision card (the spoken line, about 1.6 to 4.3, is about it)
//   3.1    the pointer comes in; the tag watches it; at the click: a press, a ripple, a check, "Done"
//   to the end: a calm hold, the camera still drifting in
// Every frame is a pure function of t (styles are cached only to skip writing the same value twice).
// Nothing is claimed beyond the brief's data: the added words are the walkthrough's own app chrome
// and "Done". The bottom 230 px carry nothing that matters (the film's caption chips live there).
import { el } from "../lib.js";
import { buildTag, W as TW, H as TH, LEG } from "../mascot/tag/mascot.js";

// ------------------------------------------------------------------ small pure helpers
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
const lerp = (a, b, k) => a + (b - a) * k;
const prog = (t, a, b) => (b <= a ? (t >= b ? 1 : 0) : clamp((t - a) / (b - a)));
const E = {
  outCubic: (k) => 1 - Math.pow(1 - k, 3),
  inCubic: (k) => k * k * k,
  inOutCubic: (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
  inOutSine: (k) => -(Math.cos(Math.PI * k) - 1) / 2,
  outBack: (k, s = 1.70158) => 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2),
};
const wob = (t, t0, a = 1, f = 3.2, k = 7) => (t < t0 ? 0 : a * Math.exp(-k * (t - t0)) * Math.sin(2 * Math.PI * f * (t - t0)));
const f1 = (v) => (Math.round(v * 10) / 10).toString();
const f3 = (v) => (Math.round(v * 1000) / 1000).toString();
const tr = (x, y, s = 1) => `translate(${f1(x)}px, ${f1(y)}px)` + (s !== 1 ? ` scale(${f3(s)})` : "");

// Show with an opacity and a transform; hidden (display none) below a hair of opacity.
function put(e, o = 1, tf = "") {
  const d = o > 0.003 ? "" : "none";
  if (e._d !== d) { e.style.display = d; e._d = d; }
  if (d) return;
  const os = o >= 0.999 ? "1" : o.toFixed(3);
  if (e._o !== os) { e.style.opacity = os; e._o = os; }
  if (e._t !== tf) { e.style.transform = tf; e._t = tf; }
}
// The same for an element in the page's flow: opacity only, so it keeps its place while unseen.
function fade(e, o = 1, tf = "") {
  const os = o >= 0.999 ? "1" : o <= 0.001 ? "0" : o.toFixed(3);
  if (e._o !== os) { e.style.opacity = os; e._o = os; }
  if (e._t !== tf) { e.style.transform = tf; e._t = tf; }
}
function css(e, k, v) {
  const key = "_c" + k;
  if (e[key] !== v) { e.style[k] = v; e[key] = v; }
}
function attr(e, k, v) {
  const key = "_a" + k;
  if (e[key] !== v) { e.setAttribute(k, v); e[key] = v; }
}

// ------------------------------------------------------------------ fonts: the tag concept's own
const FONTS = [
  ["TGB Serif", "InstrumentSerif-Regular.ttf", { style: "normal", weight: "400" }],
  ["TGB Sans", "Inter.ttf", { weight: "100 900" }],
  ["TGB Mono", "JetBrainsMono.ttf", { weight: "100 800" }],
];
let fontsReady = null;
function loadFonts() {
  if (!fontsReady) {
    fontsReady = Promise.all(FONTS.map(async ([family, file, desc]) => {
      const url = new URL(`../../assets/fonts/tag/${file}`, import.meta.url).href;
      const face = new FontFace(family, `url("${url}")`, { display: "block", ...desc });
      await face.load();
      document.fonts.add(face);
    })).then(() => Promise.all(['400 52px "TGB Serif"', '600 24px "TGB Sans"', '500 16px "TGB Mono"'].map((f) => document.fonts.load(f))));
  }
  return fontsReady;
}

// ------------------------------------------------------------------ icons (shared/icons.js, line icons)
const svgI = (body, sw = 1.8) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;
const ICON = {
  spark: svgI('<path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z"/><path d="M18.5 16l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>', 1.6),
  book: svgI('<path d="M4.5 5.5c2.5-1 5-1 7.5.5 2.5-1.5 5-1.5 7.5-.5v13c-2.5-1-5-1-7.5.5-2.5-1.5-5-1.5-7.5-.5z"/><path d="M12 6v13"/>'),
  home: svgI('<path d="M4 11l8-6.5 8 6.5"/><path d="M6.5 9.5v9h11v-9"/>'),
  ask: svgI('<path d="M4.5 6.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H11l-4 3.5v-3.5H6.5a2 2 0 0 1-2-2z"/><path d="M10 8.8a2 2 0 1 1 2.7 1.9c-.5.2-.7.6-.7 1.1v.4M12 14.2v.1"/>'),
  shield: svgI('<path d="M12 3.5l7 2.8v5.2c0 4.3-3 7.7-7 9-4-1.3-7-4.7-7-9V6.3z"/><path d="M9 12l2.2 2.2L15.5 10"/>'),
  check: svgI('<path d="M5 12.5l4.2 4.2L19 7"/>', 2.6),
};
const CHECK_LEN = 20;   // the check path's length (5.9 + 13.8)
const POINTER = `<svg viewBox="0 0 24 24" width="38" height="38"><path d="M5 3.2l13.2 8.4-5.9 1.3 3.4 6.4-2.6 1.4-3.4-6.5L5.2 18z" fill="#111" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>`;

// The walkthrough's app chrome (demo-video/ui-concepts/shared/data.js page.nav, tag/data-extra.js):
// shown earlier in this film, so nothing here is new.
const CHROME = {
  product: "AI Peer", team: "Host Payouts", nav: ["Set up", "What I learned", "Your brief", "Ask your Peer", "How it works"],
  navIcons: ["spark", "book", "home", "ask", "shield"], active: 2, buttons: ["Catch me up", "Change sources", "Erase it all"],
  railLine: "Your sources. Your choices.", kicker: "Your brief", label: "Ram's AI Peer", done: "Done",
};

// ------------------------------------------------------------------ the look (tag/style.css, prefixed tgb-)
const CSS = `
.tgb { background: #f4f3eb; color: #1d2420; font-family: "TGB Sans", sans-serif; -webkit-font-smoothing: antialiased; }
.tgb * { box-sizing: border-box; }
.tgb-cam { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; transform-origin: 0 0; }
.tgb-paper { position: absolute; left: -2000px; top: -2000px; width: 6000px; height: 6000px; background: #f4f3eb; }
.tgb-g { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; }
.tgb-railbg { position: absolute; left: -1000px; top: -1000px; width: 1330px; height: 3200px; background: #eeebdf; border-right: 1.5px solid #e0dbca; }
.tgb-logo { position: absolute; left: 40px; top: 44px; font: 700 32px/1 "TGB Sans"; letter-spacing: -0.02em; color: #1f5b43; white-space: nowrap; }
.tgb-logosub { position: absolute; left: 41px; top: 90px; font: 500 14px/1 "TGB Mono"; letter-spacing: 0.14em; text-transform: uppercase; color: #7b7f74; white-space: nowrap; }
.tgb-nav { position: absolute; left: 26px; top: 160px; width: 278px; display: flex; flex-direction: column; gap: 4px; }
.tgb-navi { display: flex; align-items: center; gap: 14px; height: 54px; padding: 0 18px; border-radius: 14px; font: 500 21px/1 "TGB Sans"; color: #41463e; white-space: nowrap; }
.tgb-navi svg { width: 22px; height: 22px; flex: none; color: #6f746a; }
.tgb-navi.on { background: #e3dfcc; color: #1d2420; font-weight: 600; }
.tgb-navi.on svg { color: #1f5b43; }
.tgb-spot { position: absolute; left: 40px; top: 902px; width: 250px; height: 70px; border: 2px dashed #c8c2ad; border-radius: 999px; }
.tgb-railline { position: absolute; left: 0; top: 994px; width: 330px; text-align: center; font: 500 13.5px/1 "TGB Mono"; color: #7b7f74; white-space: nowrap; }

.tgb-kick { position: absolute; left: 402px; top: 58px; display: flex; align-items: center; gap: 12px; font: 500 17px/1 "TGB Mono"; letter-spacing: 0.15em; text-transform: uppercase; color: #7b7f74; white-space: nowrap; }
.tgb-kick i { width: 9px; height: 9px; border-radius: 50%; background: #2a6b51; box-shadow: 0 0 0 4px rgba(42, 107, 81, 0.14); }
.tgb-hbtns { position: absolute; right: 60px; top: 46px; display: flex; gap: 12px; }
.tgb-hbtn { height: 46px; padding: 0 22px; border-radius: 999px; border: 1.5px solid #d6d0bd; background: #fbfaf4; display: flex; align-items: center; font: 600 17.5px/1 "TGB Sans"; color: #2c312a; white-space: nowrap; }
.tgb-hello { position: absolute; left: 392px; top: 86px; font: 400 126px/1 "TGB Serif"; letter-spacing: -0.016em; color: #1d2420; white-space: nowrap; }
.tgb-lead { position: absolute; left: 400px; top: 230px; font: 400 31px/1.4 "TGB Sans"; color: #4c5148; white-space: nowrap; }
.tgb-lead span { display: block; }
.tgb-lead b { display: block; font-weight: 600; color: #7a4c0c; }

.tgb-col { position: absolute; left: 400px; top: 360px; width: 742px; --fs: 1; }
.tgb-sec + .tgb-sec { margin-top: calc(26px * var(--fs)); }
.tgb-sh { display: flex; align-items: center; gap: 14px; height: calc(62px * var(--fs)); padding-bottom: 8px; }
.tgb-sh i { flex: none; width: 12px; height: 12px; border-radius: 50%; background: var(--ac); box-shadow: 0 0 0 4px var(--ach); }
.tgb-sh b { font: 400 calc(52px * var(--fs))/1 "TGB Serif"; font-weight: 400; color: #1d2420; white-space: nowrap; }
.tgb-row { position: relative; border-top: 1.5px solid #e0dbca; padding: calc(15px * var(--fs)) 2px calc(16px * var(--fs)); }
.tgb-row.last { border-bottom: 1.5px solid #e0dbca; }
.tgb-rt { display: flex; align-items: center; gap: 16px; }
.tgb-rt b { flex: 1; min-width: 0; font: 600 calc(25.5px * var(--fs))/1.25 "TGB Sans"; letter-spacing: -0.008em; color: #262b24; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.tgb-pill { flex: none; padding: 7px 12px; border-radius: 999px; border: 1.5px solid #b9cbbd; background: #f1f5ee; font: 600 calc(14.5px * var(--fs))/1 "TGB Mono"; color: #2a5a43; white-space: nowrap; }
.tgb-acc-blue .tgb-pill { border-color: #c4d3de; background: #eef3f6; color: #355a72; }
.tgb-rw { margin-top: 7px; font: 400 calc(20.5px * var(--fs))/1.38 "TGB Sans"; color: #4f544b; }
.tgb-acc-green { --ac: #2a6b51; --ach: rgba(42, 107, 81, 0.15); } .tgb-acc-blue { --ac: #4a7898; --ach: rgba(74, 120, 152, 0.15); }
.tgb-acc-amber { --ac: #eba844; --ach: rgba(235, 168, 68, 0.2); }

.tgb-glow { position: absolute; border-radius: 50%; pointer-events: none;
  background: radial-gradient(closest-side, rgba(245, 190, 95, 0.42), rgba(245, 190, 95, 0.16) 55%, rgba(245, 190, 95, 0) 100%); }
.tgb-dwrap { position: absolute; left: 1196px; top: 360px; width: 664px; }
.tgb-ring { position: absolute; left: -8px; top: -8px; right: -8px; bottom: -8px; border-radius: 32px; border: 3px solid #eba844;
  box-shadow: 0 0 0 6px rgba(235, 168, 68, 0.16), 0 0 40px rgba(235, 168, 68, 0.4); }
.tgb-ring.ok { border-color: rgba(42, 107, 81, 0.5); box-shadow: 0 0 0 6px rgba(42, 107, 81, 0.07), 0 0 30px rgba(42, 107, 81, 0.14); }
.tgb-dc { position: relative; border-radius: 24px; background: #fbfaf4; border: 1.5px solid #e0dbca; overflow: hidden;
  box-shadow: 0 2px 3px rgba(60, 50, 20, 0.05), 0 34px 64px -38px rgba(60, 50, 20, 0.55); }
.tgb-dbar { position: absolute; left: 0; top: 0; height: 9px; z-index: 2; width: 0; }
.tgb-dbar.a { background: #eba844; } .tgb-dbar.g { background: #2a6b51; }
.tgb-dhead { position: relative; height: 102px; background: #eff1e7; border-bottom: 1.5px solid #e0dbca; display: flex; align-items: center; padding: 8px 32px 0; }
.tgb-dtint { position: absolute; left: 0; top: 0; right: 0; bottom: 0; }
.tgb-dtint.a { background: #fbf0d6; } .tgb-dtint.g { background: #e9f1e6; }
.tgb-dhead b { position: relative; font: 400 54px/1 "TGB Serif"; font-weight: 400; color: #1d2420; white-space: nowrap; }
.tgb-dlab { position: relative; margin-left: auto; font: 600 14.5px/1 "TGB Mono"; letter-spacing: 0.12em; text-transform: uppercase; color: #8d8f83; white-space: nowrap; }
.tgb-ddone { position: absolute; right: 28px; top: 50%; margin-top: -16px; height: 42px; padding: 0 17px 0 12px; border-radius: 999px; border: 1.5px solid #9fc0ab; background: #f0f6ef;
  display: flex; align-items: center; gap: 8px; font: 700 16px/1 "TGB Mono"; letter-spacing: 0.08em; text-transform: uppercase; color: #1f5b43; white-space: nowrap; transform-origin: 85% 50%; }
.tgb-ddone svg { width: 21px; height: 21px; }
.tgb-dbody { padding: 30px 34px 34px; }
.tgb-dq { font: 400 59px/1.06 "TGB Serif"; letter-spacing: -0.008em; color: #1d2420; }
.tgb-dq span { background-image: linear-gradient(rgba(245, 196, 106, 0) 54%, rgba(245, 196, 106, 0.9) 54%, rgba(245, 196, 106, 0.9) 90%, rgba(245, 196, 106, 0) 90%);
  background-repeat: no-repeat; background-size: 0% 100%; -webkit-box-decoration-break: slice; box-decoration-break: slice; }
.tgb-dw { margin-top: 16px; font: 400 24px/1.4 "TGB Sans"; color: #4f544b; }
.tgb-dacts { margin-top: 26px; display: flex; gap: 14px; align-items: center; }
.tgb-yes { position: relative; height: 68px; padding: 0 33px; border-radius: 999px; background: #1f5b43; color: #fff; display: flex; align-items: center;
  font: 700 25px/1 "TGB Sans"; letter-spacing: -0.01em; white-space: nowrap; transform-origin: 50% 50%; }
.tgb-yes .tgb-ck { display: flex; flex: none; overflow: hidden; width: 0; height: 28px; }
.tgb-yes .tgb-ck svg { flex: none; width: 28px; height: 28px; }
.tgb-rip { position: absolute; left: 0; top: 0; right: 0; bottom: 0; border-radius: 999px; border: 3px solid rgba(31, 91, 67, 0.5); }
.tgb-no { height: 68px; padding: 0 31px; border-radius: 999px; border: 1.5px solid #d6d0bd; background: #fbfaf4; color: #2c312a; display: flex; align-items: center;
  font: 600 25px/1 "TGB Sans"; white-space: nowrap; }

.tgb-svg { position: absolute; left: 0; top: 0; overflow: visible; pointer-events: none; }
.tgb-ptr { position: absolute; left: 0; top: 0; width: 38px; height: 38px; transform-origin: 6px 4px; filter: drop-shadow(0 3px 5px rgba(0, 0, 0, 0.3)); }
.tgb-sun { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; pointer-events: none;
  background: radial-gradient(1400px 980px at 96% -10%, rgba(255, 208, 146, 0.36), rgba(255, 208, 146, 0.13) 44%, rgba(255, 208, 146, 0) 76%); }
.tgb-vig { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; pointer-events: none;
  background: radial-gradient(125% 118% at 52% 44%, rgba(60, 50, 20, 0) 60%, rgba(60, 50, 20, 0.11) 100%); }
`;
function injectCss() {
  if (document.getElementById("tgb-style")) return;
  const s = document.createElement("style");
  s.id = "tgb-style";
  s.textContent = CSS;
  document.head.appendChild(s);
}

// ------------------------------------------------------------------ geometry and times
const HOME = [165, 963, 0.92];       // the tag's home at the rail's foot (feet, scale): tl.js SPOT
const PERCH_S = 0.95;                // its scale on the decision card
const T = {
  first: 0.06, step: 0.22, headLead: 0.08, rowIn: 0.5, cardRise: 0.58,
  eyes: [0.34, 0.68], glide: [0.84, 1.74], legs: [1.7, 1.98], glideH: 130,
  line: [1.98, 2.32], light: [2.16, 2.56], marker: [2.34, 2.98],
  push: [1.9, 3.25], dim: [2.1, 2.75],
};

// An orthogonal polyline with rounded corners (tag/scene.js), and its length.
function pathL(pts, r = 18) {
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
}
const plen = (pts) => pts.slice(1).reduce((s, p, i) => s + Math.hypot(p[0] - pts[i][0], p[1] - pts[i][1]), 0);
const lookDir = (from, to, reach = 200) => {
  const dx = to[0] - from[0], dy = to[1] - from[1];
  const len = Math.hypot(dx, dy) || 1;
  const m = Math.min(1, len / reach);
  return [(dx / len) * m, (dy / len) * m * 0.95];
};

// The mascot's gradients and clips carry fixed ids ("tgBody", ...), the same in every copy of it on
// the page; a reference resolves to the first in the document, which may sit in a hidden shot. This
// copy's get their own names, so its fills always come from its own definitions.
function ownIds(svg) {
  svg.querySelectorAll("defs [id]").forEach((d) => { if (d.id.startsWith("tg")) d.id = "tgbr-" + d.id; });
  svg.querySelectorAll("*").forEach((e) => {
    for (const a of ["fill", "stroke", "clip-path", "filter", "mask"]) {
      const v = e.getAttribute(a);
      if (v && v.includes("url(#tg")) e.setAttribute(a, v.replace(/url\(#(tg[A-Za-z]+)\)/g, "url(#tgbr-$1)"));
    }
  });
}

export async function create(slot, film) {
  const b = slot.brief || {};
  await loadFonts();
  injectCss();
  const LEN = slot.length;
  const CLICK = slot.click ?? Math.max(0, LEN - 1.2);
  const NS = "http://www.w3.org/2000/svg";
  const S = (tag, attrs, parent) => {
    const e = document.createElementNS(NS, tag);
    for (const k in attrs) e.setAttribute(k, attrs[k]);
    if (parent) parent.appendChild(e);
    return e;
  };

  // ---------------------------------------------------------------- the page
  const node = el("div.scene.tgb");
  const cam = el("div.tgb-cam");
  node.append(cam, el("div.tgb-sun"), el("div.tgb-vig"));
  cam.append(el("div.tgb-paper"));

  // the rail
  const railG = el("div.tgb-g");
  railG.append(el("div.tgb-railbg"), el("div.tgb-logo", { text: CHROME.product }), el("div.tgb-logosub", { text: CHROME.team }));
  const nav = el("div.tgb-nav");
  CHROME.nav.forEach((n, i) => nav.append(el(`div.tgb-navi${i === CHROME.active ? ".on" : ""}`, { html: `${ICON[CHROME.navIcons[i]]}<span></span>` })));
  [...nav.children].forEach((c, i) => { c.lastChild.textContent = CHROME.nav[i]; });
  railG.append(nav, el("div.tgb-spot"), el("div.tgb-railline", { text: CHROME.railLine }));

  // the header: kicker, buttons, greeting, lead
  const headG = el("div.tgb-g");
  const time = b.time ? (/[ap]m/i.test(b.time) ? b.time : `${b.time} AM`) : "";
  const kick = el("div.tgb-kick", {}, el("i"), el("span", { text: time ? `${CHROME.kicker} · ${time}` : CHROME.kicker }));
  const hbtns = el("div.tgb-hbtns", {}, CHROME.buttons.map((x) => el("div.tgb-hbtn", { text: x })));
  const hello = el("div.tgb-hello", { text: b.greeting || "Good morning" });
  const sentences = String(b.lead || "").split(/(?<=[.!?])\s+/).filter(Boolean);
  const lead = el("div.tgb-lead", {}, sentences.map((s, i) => el(i === sentences.length - 1 && sentences.length > 1 ? "b" : "span", { text: s })));
  headG.append(kick, hbtns, hello, lead);

  // the sections: everything but the decision on the left, as rows under thin rules
  const sections = b.sections || [];
  let dSec = null, dCard = null;
  for (const s of sections) for (const c of s.cards || []) if (c.decision && !dCard) { dCard = c; dSec = s; }
  const colG = el("div.tgb-col");
  const reveals = [];   // [{ e, at, dy, dur }]
  let at = T.first;
  sections.forEach((s) => {
    const cards = (s.cards || []).filter((c) => c !== dCard);
    if (!cards.length) return;
    const sec = el(`div.tgb-sec.tgb-acc-${s.accent || "green"}`);
    const head = el("div.tgb-sh", {}, el("i"), el("b", { text: s.title }));
    sec.append(head);
    reveals.push({ e: head, at, dy: 14, dur: 0.4 });
    at += T.headLead;
    cards.forEach((c, i) => {
      const row = el(`div.tgb-row${i === cards.length - 1 ? ".last" : ""}`, {},
        el("div.tgb-rt", {}, el("b", { text: c.title }), c.cat ? el("span.tgb-pill", { text: c.cat }) : null),
        c.why ? el("div.tgb-rw", { text: c.why }) : null);
      sec.append(row);
      reveals.push({ e: row, at, dy: -26, dur: T.rowIn });
      at += T.step;
    });
    colG.append(sec);
  });
  const CARD_IN = Math.min(1.1, Math.max(0.9, at + 0.02));

  // the decision card: its section's title in the head strip, the question with the marker, the buttons
  const D = {};
  if (dCard) {
    D.wrap = el("div.tgb-dwrap");
    D.ring = el("div.tgb-ring");
    D.ringOk = el("div.tgb-ring.ok");
    D.card = el("div.tgb-dc");
    D.barA = el("div.tgb-dbar.a");
    D.barG = el("div.tgb-dbar.g");
    D.tintA = el("div.tgb-dtint.a");
    D.tintG = el("div.tgb-dtint.g");
    D.lab = el("span.tgb-dlab", { text: dCard.cat || "" });
    D.done = el("div.tgb-ddone", { html: `${ICON.check}<span></span>` });
    D.done.lastChild.textContent = CHROME.done;
    const head = el("div.tgb-dhead", {}, D.tintA, D.tintG, el("b", { text: (dSec && dSec.title) || "" }), D.lab, D.done);
    D.qText = el("span", { text: dCard.title || "" });
    D.q = el("div.tgb-dq", {}, D.qText);
    const why = dCard.why ? el("div.tgb-dw", { text: dCard.why }) : null;
    const [yesL, noL] = dCard.buttons || [];
    D.ck = el("span.tgb-ck", { html: ICON.check });
    D.ckPath = D.ck.querySelector("path");
    D.ckPath.setAttribute("stroke-dasharray", `${CHECK_LEN} ${CHECK_LEN}`);
    D.rip = el("div.tgb-rip");
    D.yes = yesL ? el("div.tgb-yes", {}, D.ck, el("span", { text: yesL }), D.rip) : null;
    D.no = noL ? el("div.tgb-no", { text: noL }) : null;
    const acts = D.yes || D.no ? el("div.tgb-dacts", {}, D.yes, D.no) : null;
    D.card.append(D.barA, D.barG, head, el("div.tgb-dbody", {}, D.q, why, acts));
    D.wrap.append(D.ring, D.ringOk, D.card);
  }

  // the tag, its line and the pointer, in page px over the page
  const svg = S("svg", { class: "tgb-svg", width: 1920, height: 1080, viewBox: "0 0 1920 1080" });
  const lineG = S("g", {}, svg);
  // the dotted path its glide leaves on the paper, fading once it has landed
  const trail = S("path", { fill: "none", stroke: "#2b6a50", "stroke-width": 5, "stroke-linecap": "round", "stroke-dasharray": "0.1 15", opacity: 0 }, lineG);
  const line = S("path", { fill: "none", stroke: "#2b6a50", "stroke-width": 3.8, "stroke-linecap": "round", "stroke-linejoin": "round" }, lineG);
  const dot = S("circle", { r: 7.5, fill: "#eba844", stroke: "#fffaf0", "stroke-width": 2.6 }, lineG);
  // a small burst of amber strokes around the button at the click
  const burstG = S("g", { opacity: 0 }, svg);
  const BURST = 10;
  const bursts = Array.from({ length: BURST }, () => S("path", { fill: "none", stroke: "#eba844", "stroke-width": 4.5, "stroke-linecap": "round" }, burstG));
  const tag = buildTag(svg, { label: CHROME.label });
  ownIds(svg);
  const ptr = el("div.tgb-ptr", { html: POINTER });
  const glow = el("div.tgb-glow");

  cam.append(railG, headG, colG, glow, ...(D.wrap ? [D.wrap] : []));
  cam.append(svg, ptr);

  // ---------------------------------------------------------------- measure the page at rest
  const host = document.getElementById("root") || document.body;
  node.style.visibility = "hidden";
  host.append(node);
  const base = cam.getBoundingClientRect();
  const rect = (e) => { const r = e.getBoundingClientRect(); return { x: r.left - base.left, y: r.top - base.top, w: r.width, h: r.height }; };
  // Everything that matters stays above the caption chips' band: the left column shrinks a step
  // at a time if its text runs long (the same data always gives the same size).
  const FLOOR = 838;
  for (let fs = 1, i = 0; i < 6; i++) {
    const r = rect(colG);
    if (r.y + r.h <= FLOOR) break;
    fs = Math.round((fs - 0.04) * 100) / 100;
    colG.style.setProperty("--fs", String(fs));
  }
  const M = {};
  if (dCard) {
    for (let f = 1, i = 0; i < 5; i++) {
      const r = rect(D.wrap);
      if (r.y + r.h <= FLOOR) break;
      f = Math.round((f - 0.05) * 100) / 100;
      D.q.style.fontSize = `${(59 * f).toFixed(1)}px`;
    }
    M.card = rect(D.wrap);
    M.yes = D.yes ? rect(D.yes) : null;
    const range = document.createRange();
    range.selectNodeContents(D.qText);
    M.qLines = [...range.getClientRects()].map((r) => ({ x0: r.left - base.left, x1: r.right - base.left, y: (r.top + r.bottom) / 2 - base.top }));
    M.qTotal = M.qLines.reduce((s, l) => s + (l.x1 - l.x0), 0) || 1;
  }
  host.removeChild(node);
  node.style.visibility = "";

  // ---------------------------------------------------------------- places from the measures
  const C = M.card || { x: 1180, y: 352, w: 680, h: 400 };
  const PERCH = [C.x + C.w - 168, C.y, PERCH_S];
  const q0 = M.qLines && M.qLines.length ? M.qLines[0] : { x0: C.x + 34, x1: C.x + 600, y: C.y + 150 };
  const LINE_END = [C.x + 16, q0.y];
  const gutterX = C.x - 26;
  const markerAt = (k) => {
    if (!M.qLines || !M.qLines.length) return [q0.x0, q0.y];
    let d = clamp(k) * M.qTotal;
    for (const l of M.qLines) {
      const w = l.x1 - l.x0;
      if (d <= w) return [l.x0 + d, l.y];
      d -= w;
    }
    const l = M.qLines[M.qLines.length - 1];
    return [l.x1, l.y];
  };
  // the camera's aim on the decision card: the tag (with its jump) and the card in the frame, the
  // card's foot clear of the caption chips
  const topY = PERCH[1] - PERCH_S * (LEG + TH + 20) - 34;
  const botY = C.y + C.h;
  const FS = clamp(Math.min(1.2, 690 / Math.max(1, botY - topY)), 1, 1.2);
  const FOCUS = [C.x + C.w / 2, (topY + botY) / 2 + (540 - 466) / FS, FS];
  const camAt = (u) => {
    const drift = 1 + 0.018 * E.inOutSine(prog(u, 0, T.push[0]));
    const k = E.inOutCubic(prog(u, T.push[0], T.push[1]));
    const after = 0.022 * prog(u, T.push[1], LEN + 0.2);
    return [lerp(960, FOCUS[0], k), lerp(540, FOCUS[1], k), lerp(drift, FOCUS[2], k) + after];
  };
  const camT = (c) => `translate(960px, 540px) scale(${c[2].toFixed(5)}) translate(${(-c[0]).toFixed(2)}px, ${(-c[1]).toFixed(2)}px)`;

  // the warm light under the decision card when it lights up
  Object.assign(glow.style, { left: `${f1(C.x - 170)}px`, top: `${f1(C.y - 150)}px`, width: `${f1(C.w + 340)}px`, height: `${f1(C.h + 300)}px` });
  // the burst's strokes, on an oval round the first button
  const BC = M.yes ? [M.yes.x + M.yes.w / 2, M.yes.y + M.yes.h / 2] : null;
  const burstAt = (k) => bursts.map((p, i) => {
    const a = (i / BURST) * 2 * Math.PI + 0.3;
    const rx = M.yes.w / 2 + 16, ry = M.yes.h / 2 + 14;
    const r0 = lerp(1.0, 1.28, E.outCubic(k)), r1 = lerp(1.06, 1.5, E.outCubic(Math.min(1, k * 1.25)));
    const c = Math.cos(a), s = Math.sin(a);
    return `M ${f1(BC[0] + c * rx * r0)} ${f1(BC[1] + s * ry * r0)} L ${f1(BC[0] + c * rx * r1)} ${f1(BC[1] + s * ry * r1)}`;
  });

  // the pointer (page px; its tip): in from the lower right, to the first button, a click, away
  const PT = { in: Math.max(T.push[1] - 0.2, CLICK - 1.1), at: CLICK - 0.27, hold: CLICK + 0.14, away: CLICK + 0.62 };
  const BTN = M.yes ? [M.yes.x + M.yes.w * 0.42, M.yes.y + M.yes.h * 0.56] : [C.x + 160, C.y + C.h - 70];
  const P0 = [C.x + C.w + 170, C.y + C.h + 300];
  const ctrl = [BTN[0] + 340, BTN[1] + 40];
  const pointerAt = (u) => {
    if (u <= PT.at) {
      const k = E.inOutCubic(prog(u, PT.in, PT.at));
      const a = (1 - k) * (1 - k), m = 2 * k * (1 - k), c = k * k;
      return [a * P0[0] + m * ctrl[0] + c * BTN[0], a * P0[1] + m * ctrl[1] + c * BTN[1]];
    }
    const k = E.inOutCubic(prog(u, PT.hold, PT.away));
    return [BTN[0] + 118 * k, BTN[1] + 92 * k];
  };

  // ---------------------------------------------------------------- the tag's pose (page px)
  const BLINKS = [2.66, 3.6, CLICK + 0.95];
  const eyeOf = (p) => [p.x, p.y - p.s * (LEG * (p.legs ?? 1) + (p.lift || 0) + TH + 4)];
  // the glide: a soft arc from its home to the card, eased; [x, y (feet), s] at k in 0..1
  const glideAt = (k) => {
    const e = E.inOutSine(k);
    const sw = Math.sin(Math.PI * k);
    return [lerp(HOME[0], PERCH[0], e), lerp(HOME[1], PERCH[1], e) - T.glideH * 4 * e * (1 - e), lerp(HOME[2], PERCH[2], e) * (1 + 0.1 * sw)];
  };
  function tagPose(u) {
    const p = { x: HOME[0], y: HOME[1], s: HOME[2], legs: 0, eyes: 1, look: [0, 0] };
    const legs = u < T.legs[0] ? 0 : E.outBack(prog(u, T.legs[0], T.legs[1]), 1.8);
    if (u < T.glide[0]) {
      // asleep in its home as a plain label; it wakes, looks round, gets ready
      p.eyes = E.outBack(prog(u, T.eyes[0], T.eyes[1]), 2.2);
      p.look = u < T.eyes[0] + 0.3 ? [0.3, -0.55] : [0.95, -0.5];
      p.wide = 0.6 * Math.sin(Math.PI * prog(u, T.eyes[0] + 0.05, T.eyes[0] + 0.5));
      const pre = E.inOutSine(prog(u, T.glide[0] - 0.16, T.glide[0]));
      p.sy = 1 - 0.07 * pre;
      p.sx = 1 + 0.045 * pre;
      p.happy = 0.35 * prog(u, T.eyes[1], T.eyes[1] + 0.12);
    } else if (u < T.glide[1]) {
      // it glides like a paper card (idea C's move): legs tucked, a soft float, a little nearer midway
      const k = prog(u, T.glide[0], T.glide[1]);
      const sw = Math.sin(Math.PI * k);
      [p.x, p.y, p.s] = glideAt(k);
      p.legs = legs;
      p.rot = -7 * sw + 4.5 * sw * Math.sin(2 * Math.PI * 1.35 * (u - T.glide[0]) + 0.4);
      p.shadow = 1 - 0.95 * Math.sin(Math.PI * Math.min(1, k * 1.12));
      p.look = [0.9, lerp(-0.55, 0.35, k)];
      p.happy = 0.55 * sw;
      p.air = true;
    } else {
      // on the decision card
      p.x = PERCH[0]; p.y = PERCH[1]; p.s = PERCH[2]; p.legs = legs;
      const e = eyeOf(p);
      let look;
      if (u < T.line[0]) look = [-0.55, 0.65];
      else if (u < T.marker[0]) look = lookDir(e, LINE_END, 220);
      else if (u < T.marker[1] + 0.12) look = lookDir(e, markerAt(prog(u, T.marker[0], T.marker[1])), 260);
      else if (u < PT.in + 0.1) look = [0.12, 0.28];
      else if (u < CLICK + 0.55) look = lookDir(e, pointerAt(u), 240);
      else look = [0.1, 0.22];
      p.look = look;
      p.wide = Math.max(0.55 * Math.sin(Math.PI * prog(u, T.light[0] - 0.06, T.light[0] + 0.36)), 0.95 * Math.max(0, 1 - Math.abs(u - CLICK) / 0.2));
      p.happy = Math.max(0.6 * Math.sin(Math.PI * prog(u, T.legs[0] + 0.05, T.legs[1] + 0.35)), 0.9 * E.inOutSine(prog(u, CLICK + 0.1, CLICK + 0.32)));
      // a little jump of joy after the click
      p.lift = 26 * Math.sin(Math.PI * prog(u, CLICK + 0.18, CLICK + 0.5));
      if (p.lift > 0.01) p.air = true;
      p.glow = Math.sin(Math.PI * prog(u, CLICK + 0.2, CLICK + 1.0));
      // the stand-up and the jump settle with a squash
      const q1 = u > T.legs[1] ? 0.06 * Math.exp(-(u - T.legs[1]) * 8) * Math.cos((u - T.legs[1]) * 20) : 0;
      const d2 = u - (CLICK + 0.5);
      const q2 = d2 > 0 ? 0.16 * Math.exp(-d2 * 8.5) * Math.cos(d2 * 21) : 0;
      const pre = u < CLICK + 0.18 ? E.inOutSine(prog(u, CLICK + 0.04, CLICK + 0.18)) * 0.1 : 0;
      p.sy = 1 - q1 - q2 - pre;
      p.sx = 1 + 0.7 * (q1 + q2) + 0.7 * pre;
    }
    // breathing while it stands, and its blinks
    if (!p.air && p.legs > 0.5) {
      const br = Math.sin(u * 2 * Math.PI * 0.7);
      p.sy = (p.sy ?? 1) + 0.012 * br;
      p.sx = (p.sx ?? 1) - 0.008 * br;
    }
    let bl = 0;
    for (const tb of BLINKS) { const d = Math.abs(u - tb); if (d < 0.085) bl = Math.max(bl, 1 - d / 0.085); }
    p.blink = bl;
    return p;
  }
  const boxOf = (p) => {
    const s = p.s, bottom = p.y - s * (LEG * (p.legs ?? 1) + (p.lift || 0));
    return { x0: p.x - (s * TW) / 2, x1: p.x + (s * TW) / 2, top: bottom - s * TH, bottom };
  };

  // ---------------------------------------------------------------- one frame
  function render(t) {
    const raw=t-slot.start; const u=raw+.7*(1-E.inOutCubic(prog(raw,0,1.5)));
    css(cam, "transform", camT(camAt(u)));

    // the page arrives: the header is there from the first frame; the sections come in turn, each
    // heading rising into place, each row dropped onto the paper like a card
    for (const r of reveals) {
      const p = prog(u, r.at, r.at + r.dur);
      const k = r.dy < 0 ? E.outBack(p, 1.5) : E.outCubic(p);
      fade(r.e, clamp(p * 2.2), tr(0, (1 - k) * r.dy));
    }
    // the rest of the page steps back, out of focus, while the decision is the star
    const dk = E.inOutSine(prog(u, T.dim[0], T.dim[1]));
    const blur = dk > 0.01 ? `blur(${(2.6 * dk).toFixed(2)}px)` : "none";
    for (const g of [railG, headG, colG]) {
      put(g, lerp(1, 0.34, dk));
      css(g, "filter", blur);
    }

    if (D.wrap) {
      const rise = E.outBack(prog(u, CARD_IN, CARD_IN + T.cardRise), 1.2);
      put(D.wrap, clamp(prog(u, CARD_IN, CARD_IN + 0.2)), tr(0, (1 - rise) * 76, lerp(0.965, 1, clamp(rise))));
      // it lights up: the amber ring, the amber bar over its top, a warm head
      const lit = E.outCubic(prog(u, T.light[0], T.light[1]));
      const ok = E.inOutSine(prog(u, CLICK + 0.22, CLICK + 0.62));
      put(glow, lit * (1 - 0.45 * ok), `scale(${f3(lerp(0.86, 1, lit))})`);
      put(D.ring, lit * (1 - ok), `scale(${f3(lerp(1.03, 1, lit))})`);
      put(D.ringOk, ok);
      css(D.barA, "width", `${(100 * E.inOutCubic(prog(u, T.light[0], T.light[1] + 0.12))).toFixed(2)}%`);
      css(D.barG, "width", `${(100 * E.inOutCubic(prog(u, CLICK + 0.2, CLICK + 0.62))).toFixed(2)}%`);
      put(D.tintA, lit * (1 - ok));
      put(D.tintG, ok);
      // the marker runs along the question
      css(D.qText, "backgroundSize", `${(100 * E.inOutSine(prog(u, T.marker[0], T.marker[1]))).toFixed(2)}% 100%`);
      // the button: hovered, pressed, a ripple, a check; "Not yet" steps back; the head says Done
      if (D.yes) {
        const hover = prog(u, PT.at - 0.16, PT.at + 0.02) * (1 - prog(u, CLICK + 0.3, CLICK + 0.7));
        const press = Math.max(0, 1 - Math.abs(u - CLICK - 0.03) / 0.09);
        const sc = 1 - 0.05 * press + wob(u, CLICK + 0.1, 0.028, 3.4, 8);
        put(D.yes, 1, `translateY(${f1(-2.5 * hover)}px) scale(${sc.toFixed(4)})`);
        css(D.yes, "boxShadow", `0 ${f1(10 + 6 * hover)}px ${f1(24 + 10 * hover)}px -8px rgba(23, 70, 50, ${(0.55 + 0.15 * hover).toFixed(3)}), 0 2px 0 rgba(0, 0, 0, 0.05)`);
        css(D.yes, "background", hover > 0.01 && u < CLICK ? `rgb(${Math.round(lerp(31, 38, hover))}, ${Math.round(lerp(91, 108, hover))}, ${Math.round(lerp(67, 80, hover))})` : "#1f5b43");
        const rk = prog(u, CLICK, CLICK + 0.55);
        put(D.rip, u > CLICK && rk < 1 ? (1 - rk) * 0.9 : 0, `scale(${f3(1 + rk * 0.16)}, ${f3(1 + rk * 0.6)})`);
        const ckw = E.outCubic(prog(u, CLICK + 0.04, CLICK + 0.24));
        css(D.ck, "width", `${f1(38 * ckw)}px`);
        attr(D.ckPath, "stroke-dashoffset", f1(CHECK_LEN * (1 - E.outCubic(prog(u, CLICK + 0.1, CLICK + 0.36)))));
      }
      if (D.no) fade(D.no, lerp(1, 0.38, E.inOutSine(prog(u, CLICK + 0.1, CLICK + 0.42))), tr(4 * prog(u, CLICK + 0.1, CLICK + 0.42), 0));
      fade(D.lab, 1 - prog(u, CLICK + 0.12, CLICK + 0.26));
      const dk = prog(u, CLICK + 0.22, CLICK + 0.52);
      put(D.done, clamp(prog(u, CLICK + 0.22, CLICK + 0.32)), `scale(${f3(lerp(0.6, 1, E.outBack(dk, 2.2)))})`);
    }

    // the tag, and the dotted path of its glide
    const pose = tagPose(u);
    tag.draw(pose);
    const gk = prog(u, T.glide[0], T.glide[1]);
    const to = 0.4 * (1 - E.inOutSine(prog(u, T.glide[1] + 0.05, T.glide[1] + 0.7)));
    if (gk > 0.01 && to > 0.003) {
      // fixed sample points (so its dots stay put on the paper), up to where the tag is now
      const pts = [];
      const addPt = (k) => { const [x, y, s] = glideAt(k); pts.push(`${f1(x)} ${f1(y - (s * TH) / 2)}`); };
      for (let i = 0; i / 60 < gk; i++) addPt(i / 60);
      addPt(gk);
      attr(trail, "d", "M " + pts.join(" L "));
      attr(trail, "opacity", to.toFixed(3));
      trail.style.display = "";
    } else trail.style.display = "none";

    // the burst round the button at the click
    const bk = prog(u, CLICK + 0.02, CLICK + 0.44);
    if (BC && bk > 0 && bk < 1) {
      burstG.style.display = "";
      attr(burstG, "opacity", (1 - E.inCubic(bk)).toFixed(3));
      burstAt(bk).forEach((d, i) => attr(bursts[i], "d", d));
    } else burstG.style.display = "none";

    // its line: from its body to the question, then the amber dot; it lets go after the click
    const lk = E.outCubic(prog(u, T.line[0], T.line[1])) * (1 - E.inOutSine(prog(u, CLICK + 0.2, CLICK + 0.5)));
    if (D.wrap && lk > 0.002) {
      const bx = boxOf(pose);
      const sy = (bx.top + bx.bottom) / 2;
      const pts = [[bx.x0 + 10, sy], [gutterX, sy], [gutterX, LINE_END[1]], LINE_END];
      const L = plen(pts);
      line.style.display = "";
      attr(line, "d", pathL(pts, 18));
      attr(line, "stroke-dasharray", `${f1(L)} ${f1(L)}`);
      attr(line, "stroke-dashoffset", f1(L * (1 - lk)));
      const dk = lk > 0.97 ? 1 : 0;
      dot.style.display = dk ? "" : "none";
      attr(dot, "cx", f1(LINE_END[0]));
      attr(dot, "cy", f1(LINE_END[1]));
    } else {
      line.style.display = "none";
      dot.style.display = "none";
    }

    // the pointer
    const [px, py] = pointerAt(u);
    const po = Math.min(prog(u, PT.in, PT.in + 0.18), 1 - prog(u, PT.away - 0.12, PT.away + 0.28));
    const down = Math.max(0, 1 - Math.abs(u - CLICK) / 0.1);
    put(ptr, po, `translate(${f1(px - 6)}px, ${f1(py - 4)}px) scale(${f3(1 - 0.12 * down)})`);
  }

  return { el: node, render };
}
