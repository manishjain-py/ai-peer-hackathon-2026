// "Ask your Peer": the question is typed, the box folds into a paper plane the Peer catches; it
// visits four sources (each glows) and collects a result chip at each; back home the plane
// unfolds into the answer card; the Peer stamps "Confidence: High"; "As of" and the four source
// chips hang below on strings and swing.
import { el, prog, ease, clamp, typed } from "../shared/kit.js";
import { ask, sourceById } from "../shared/data.js";
import { icons, sourceIcon } from "../shared/icons.js";
import { ASKBOX, ANSWER, ASK, RULES, WPOS, WW } from "./tl.js";
import { DEEP, TINT } from "./widgets.js";

const CSS = `
.lpa-box { position: absolute; width: ${ASKBOX.w}px; height: ${ASKBOX.h}px; border-radius: 24px; background: #fffdf9; padding: 20px 22px;
  box-shadow: 0 0 0 1px rgba(150,110,70,.12), 0 28px 56px -22px rgba(120,60,20,.45), 0 8px 16px -8px rgba(120,60,20,.2); transform-origin: 50% 50%; }
.lpa-h { display: flex; align-items: center; gap: 10px; font: 800 15px/1 "Manrope", sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #6b5f52; }
.lpa-h svg { width: 22px; height: 22px; color: #167353; }
.lpa-in { margin-top: 14px; height: 56px; border-radius: 16px; border: 2.5px solid #9fe2bd; background: #fff; display: flex; align-items: center; padding: 0 16px;
  font: 550 22px/1 "Inter", sans-serif; color: #1b2027; box-shadow: 0 0 0 5px rgba(183,244,207,.35); }
.lpa-caret { width: 2.5px; height: 28px; background: #167353; margin-left: 2px; border-radius: 2px; }
.lpa-go { margin-left: auto; width: 38px; height: 38px; border-radius: 12px; background: #167353; color: #fff; display: grid; place-items: center; font: 800 20px/1 Inter; }
.lpa-ex { margin-top: 14px; display: flex; flex-wrap: wrap; gap: 9px 10px; }
.lpa-ex span { padding: 8px 13px; border-radius: 13px; background: #f4efe7; color: #5b5045; font: 650 16px/1 "Manrope", sans-serif; }
.lpa-ex span.on { background: #dcf4e6; color: #12603f; box-shadow: 0 0 0 1.5px #a9e3c4; }
.lpa-chip { position: absolute; left: 0; top: 0; width: 224px; border-radius: 12px; background: #fffdf8; padding: 10px 12px 10px 12px; transform-origin: 50% 0;
  box-shadow: 0 12px 22px -10px rgba(80,50,20,.45), 0 0 0 1.5px var(--hue); }
.lpa-chip .c1 { display: flex; align-items: center; gap: 8px; font: 800 16px/1 "Manrope", sans-serif; color: var(--deep); }
.lpa-chip .c1 svg { width: 17px; height: 17px; }
.lpa-chip .n { width: 22px; height: 22px; border-radius: 7px; background: var(--deep); color: #fff; display: grid; place-items: center; font: 800 13px/1 "Manrope", sans-serif; }
.lpa-chip .c2 { margin-top: 6px; font: 650 17px/1.2 "Inter", sans-serif; color: #2e2a26; white-space: nowrap; }
.lpa-chip .hole, .lpa-asof .hole { position: absolute; left: 50%; top: -6px; width: 12px; height: 12px; margin-left: -6px; border-radius: 50%; background: #fffdf8; box-shadow: inset 0 0 0 2.5px #b9a98f; }
.lpa-ans { position: absolute; width: ${ANSWER.w}px; height: ${ANSWER.h}px; border-radius: 26px; background: #fffdf9; padding: 30px 46px;
  box-shadow: 0 0 0 1px rgba(150,110,70,.12), 0 40px 80px -30px rgba(120,60,20,.5), 0 10px 22px -10px rgba(120,60,20,.25); transform-origin: 50% 50%; }
.lpa-you { font: 800 14px/1 "Manrope", sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #9a8f80; }
.lpa-q2 { margin-top: 10px; font: italic 400 38px/1.05 "Instrument Serif", serif; color: #1b2a23; }
.lpa-by { position: absolute; right: 40px; top: 28px; display: flex; align-items: center; gap: 9px; font: 750 16px/1 "Manrope", sans-serif; color: #5d5750; }
.lpa-ss { margin-top: 20px; display: flex; flex-direction: column; gap: 9px; }
.lpa-s { display: flex; align-items: center; gap: 10px; font: 500 22px/1.38 "Inter", sans-serif; color: #24282d; white-space: nowrap; }
.lpa-s sup { display: inline-grid; place-items: center; width: 26px; height: 26px; border-radius: 8px; color: #fff; font: 800 14px/1 "Manrope", sans-serif; vertical-align: 0; flex: none; }
.lpa-stamp { position: absolute; right: 54px; bottom: 26px; padding: 12px 22px; border: 4px double #167353; border-radius: 14px; color: #167353;
  font: 800 30px/1 "Manrope", sans-serif; letter-spacing: .04em; text-transform: uppercase; mix-blend-mode: multiply; transform-origin: 50% 50%; }
.lpa-asof { position: absolute; left: 0; top: 0; width: 236px; text-align: center; padding: 13px 14px 12px; border-radius: 12px; background: #fff7d6; color: #5a4214; transform-origin: 50% 0;
  font: 800 18px/1 "Manrope", sans-serif; white-space: nowrap; box-shadow: 0 12px 22px -10px rgba(90,60,10,.45), 0 0 0 1.5px #ecd48a; }
.lpa-asof small { display: block; margin-bottom: 6px; font: 800 12.5px/1 "Manrope", sans-serif; letter-spacing: .12em; text-transform: uppercase; color: #a3842f; }
.lpa-strings { position: absolute; left: 0; top: 0; overflow: visible; pointer-events: none; }
`;

// Where each hanging item hangs from (world), in order: "As of", then the four chips.
const HANG = [470, 790, 1030, 1270, 1500].map((x) => [x, ANSWER.y + ANSWER.h]);
const STR = [44, 40, 58, 40, 58];

export function buildAsk(parent) {
  el("style", null, document.head, CSS);
  const box = el("div", "lpa-box", parent);
  box.style.left = `${ASKBOX.x}px`; box.style.top = `${ASKBOX.y}px`;
  box.innerHTML = `<div class="lpa-h">${icons.ask}Ask your Peer <span class="lp-ai">AI</span></div>
    <div class="lpa-in"><span class="lpa-q"></span><i class="lpa-caret"></i><span class="lpa-go">→</span></div>
    <div class="lpa-ex">${ask.examples.map((q) => `<span${q === ask.question ? ' class="on"' : ""}>${q}</span>`).join("")}</div>`;
  const q = box.querySelector(".lpa-q");
  const ans = el("div", "lpa-ans", parent);
  ans.style.left = `${ANSWER.x}px`; ans.style.top = `${ANSWER.y}px`;
  ans.innerHTML = `<div class="lpa-you">You asked</div><div class="lpa-q2">“${ask.question}”</div>
    <div class="lpa-by">Ram's AI Peer <span class="lp-ai">AI</span></div>
    <div class="lpa-ss">${ask.answer.map((a, i) => {
      const s = ask.sources[a.cite];
      return `<div class="lpa-s"><span>${a.text}</span><sup style="background:${DEEP[s.source]}">${i + 1}</sup></div>`;
    }).join("")}</div><div class="lpa-stamp">Confidence: ${ask.certainty}</div>`;
  const sentences = [...ans.querySelectorAll(".lpa-s")];
  const stamp = ans.querySelector(".lpa-stamp");
  const strings = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  strings.setAttribute("class", "lpa-strings");
  strings.setAttribute("width", "1920"); strings.setAttribute("height", "1080");
  strings.innerHTML = HANG.map(() => `<line stroke="#b9a98f" stroke-width="2.2" stroke-linecap="round"/>`).join("");
  parent.appendChild(strings);
  const lines = [...strings.children];
  const asof = el("div", "lpa-asof", parent, `<i class="hole"></i><small>As of</small>${ask.asOf.replace("As of ", "")}`);
  const chips = ask.sources.map((s, i) => {
    const src = sourceById[s.source];
    const c = el("div", "lpa-chip", parent, `<i class="hole"></i><div class="c1"><span class="n">${i + 1}</span>${sourceIcon(s.source)}${src.name}</div><div class="c2">${s.ref} · ${s.date}</div>`);
    c.style.setProperty("--hue", src.hue); c.style.setProperty("--deep", DEEP[s.source]);
    return c;
  });
  return { box, q, ans, sentences, stamp, lines, asof, chips };
}

// A swing that dies down: degrees, from when an item arrives.
const swing = (t, t0, amp, ph = 0) => (t < t0 ? 0 : amp * Math.exp(-2.1 * (t - t0)) * Math.sin(2 * Math.PI * 1.15 * (t - t0) + ph));

export function renderAsk(A, t, peer) {
  // ---- the box
  const kin = ease.outBack(prog(t, ASK.boxIn[0], ASK.boxIn[1]), 1.5);
  const k1 = ease.inOutCubic(prog(t, ASK.fold[0], ASK.fold[0] + 0.34));
  const k2 = ease.inCubic(prog(t, ASK.fold[0] + 0.3, ASK.fold[1]));
  const bOn = t > ASK.boxIn[0] && t < ASK.fold[1];
  A.box.style.display = bOn ? "" : "none";
  if (bOn) {
    A.box.style.opacity = String(clamp(kin * 1.6) * (1 - k2));
    A.box.style.transform = `translateY(${((1 - kin) * -60).toFixed(1)}px) perspective(1200px) rotateX(${(k1 * 70).toFixed(1)}deg) scale(${(1 - 0.75 * k2).toFixed(3)}, ${(1 - 0.5 * k1).toFixed(3)}) rotate(${(-k2 * 16).toFixed(1)}deg)`;
    A.q.textContent = typed(ask.question, t, ASK.type, 26);
  }
  // ---- the result chips: pop out of a source, ride with the Peer, then hang under the answer.
  const unfold0 = ASK.unfold[0];
  ASK.stops.forEach((s, i) => {
    const c = A.chips[i];
    const on = t > s.chip && t < ASK.out[1];
    c.style.display = on ? "" : "none";
    if (!on) return;
    const [wx, wy] = WPOS[s.w];
    const p0 = [wx + WW / 2 + (s.dx || 0) - 112, wy - 30];
    const kp = ease.outBack(prog(t, s.chip, s.chip + 0.22), 2);
    const kfly = ease.inOutCubic(prog(t, s.chip + 0.22, s.chip + 0.5));
    const bundle = [peer.x - 112 + (i - 1.5) * 10, peer.y - 250 - i * 14];
    const kh = ease.inOutCubic(prog(t, unfold0 + 0.35 + i * 0.08, unfold0 + 0.85 + i * 0.08));
    const [hx, hy] = HANG[i + 1];
    const hang = [hx - 112, hy + STR[i + 1]];
    let x = p0[0] + (bundle[0] - p0[0]) * kfly, y = p0[1] - 30 * kp + (bundle[1] - p0[1] + 30) * kfly;
    let sc = (0.3 + 0.7 * kp) * (1 - 0.45 * kfly);
    x += (hang[0] - x) * kh; y += (hang[1] - y) * kh; sc += (1 - sc) * kh;
    const rot = kh >= 1 ? swing(t, unfold0 + 0.85 + i * 0.08, 13, i) : (1 - kh) * (8 - i * 4) * kfly;
    const kout = ease.inCubic(prog(t, ASK.out[0], ASK.out[1]));
    c.style.opacity = String(clamp(kp * 2) * (1 - kout));
    c.style.transform = `translate(${x.toFixed(1)}px, ${(y + kout * 80).toFixed(1)}px) rotate(${rot.toFixed(2)}deg) scale(${sc.toFixed(3)})`;
    const L = A.lines[i + 1];
    const showL = kh >= 1;
    L.style.display = showL ? "" : "none";
    if (showL) {
      const r = (rot * Math.PI) / 180;
      L.setAttribute("x1", hx); L.setAttribute("y1", hy);
      L.setAttribute("x2", (hx + Math.sin(-r) * STR[i + 1] * 0.1).toFixed(1)); L.setAttribute("y2", (hy + STR[i + 1] + 2).toFixed(1));
      L.style.opacity = String(1 - kout);
    }
  });
  // ---- the answer card unfolds from the plane, sentence by sentence.
  const aOn = t > unfold0 && t < ASK.out[1];
  A.ans.style.display = aOn ? "" : "none";
  if (aOn) {
    const ka = ease.outCubic(prog(t, unfold0, unfold0 + 0.32));
    const kb = ease.outBack(prog(t, unfold0 + 0.25, ASK.unfold[1]), 1.2);
    const kout = ease.inCubic(prog(t, ASK.out[0], ASK.out[1]));
    A.ans.style.opacity = String(clamp(ka * 2) * (1 - kout));
    A.ans.style.transform = `translateY(${(kout * 90).toFixed(1)}px) perspective(1600px) rotateX(${((1 - kb) * 75).toFixed(1)}deg) scale(${(0.3 + 0.7 * ka).toFixed(3)}, ${(0.08 + 0.92 * kb).toFixed(3)})`;
    A.sentences.forEach((s, i) => {
      const k = ease.outCubic(prog(t, ASK.sentences + i * 0.42, ASK.sentences + i * 0.42 + 0.4));
      s.style.opacity = k.toFixed(3);
      s.style.transform = `translateX(${((1 - k) * 26).toFixed(1)}px)`;
      s.style.filter = k < 1 ? `blur(${((1 - k) * 5).toFixed(2)}px)` : "none";
    });
    const ks = prog(t, ASK.stamp, ASK.stamp + 0.22);
    A.stamp.style.opacity = t >= ASK.stamp ? String(0.94) : "0";
    A.stamp.style.transform = `rotate(-6deg) scale(${(1.25 - 0.25 * ease.outCubic(ks)).toFixed(3)})`;
  }
  // ---- "As of" hangs below too.
  const ko = ease.outBack(prog(t, ASK.hang, ASK.hang + 0.4), 1.6);
  const kout = ease.inCubic(prog(t, ASK.out[0], ASK.out[1]));
  const asOn = t > ASK.hang && t < ASK.out[1];
  A.asof.style.display = asOn ? "" : "none";
  A.lines[0].style.display = asOn ? "" : "none";
  if (asOn) {
    const [hx, hy] = HANG[0];
    const rot = swing(t, ASK.hang + 0.25, 16, 0.5);
    A.asof.style.opacity = String(clamp(ko * 2) * (1 - kout));
    A.asof.style.transform = `translate(${(hx - 118).toFixed(1)}px, ${(hy + STR[0] - (1 - ko) * 50 + kout * 80).toFixed(1)}px) rotate(${rot.toFixed(2)}deg)`;
    A.lines[0].setAttribute("x1", hx); A.lines[0].setAttribute("y1", hy);
    A.lines[0].setAttribute("x2", hx); A.lines[0].setAttribute("y2", (hy + STR[0] - (1 - ko) * 50 + 2).toFixed(1));
    A.lines[0].style.opacity = String(clamp(ko) * (1 - kout));
  }
}
