// The notebook: during setup, "Ram's AI Peer · notes" on the desk, where each fact is written in
// handwriting with a coloured source tag and date. Then it comes forward and its page turns: the
// back of the page is "What I learned" (summary, tags); under it, the fact cards, each with its
// link and date; one fact is traced back to its source by a thread.
import { el, prog, ease, clamp, pulse } from "../shared/kit.js";
import { learned, sourceById, reads } from "../shared/data.js";
import { icons, sourceIcon } from "../shared/icons.js";
import { NB, SPREAD, R, S3, LEARN, BRIEF } from "./tl.js";
import { DEEP, TINT } from "./widgets.js";

export const NOTES = [
  { text: "Staff Engineer, Host Payouts", src: "directory", date: "Nov 15" },
  { text: "You own Payout retry v2", src: "docs", date: "Nov 11" },
  { text: "Retry v2 is live for 10% in Mexico", src: "slack", date: "Nov 12" },
  { text: "PR #4182: retry limit per market", src: "code", date: "Nov 14" },
  { text: "INC-20431 was a bank outage", src: "tickets", date: "Nov 10" },
  { text: "Fraud threshold drops on Thursday", src: "mail", date: "Nov 14" },
];
export const SUM = ["This month: Payout retry v2,", "live in Mexico, next stop Brazil."];
const WRITE = ["directory", "docs", "slack", "code", "tickets", "mail"].map((id) => R[id].write);

const CSS = `
.lpn { position: absolute; width: ${NB.w}px; height: ${NB.h}px; transform-origin: 50% 50%; }
.lpn-cover { position: absolute; left: -12px; top: -10px; right: -16px; bottom: -14px; border-radius: 20px;
  background: linear-gradient(135deg, #2a7d5f, #175c45); box-shadow: 0 40px 70px -26px rgba(110,55,15,.5), 0 10px 22px -8px rgba(110,55,15,.3); }
.lpn-page { position: absolute; inset: 0; border-radius: 12px; overflow: hidden; background-color: #fffaf0;
  background-image: linear-gradient(90deg, transparent 46px, rgba(236,120,110,.32) 46px, rgba(236,120,110,.32) 48px, transparent 48px),
    repeating-linear-gradient(180deg, transparent 0 39px, rgba(120,160,205,.24) 39px 40px);
  background-position: 0 0, 0 30px; box-shadow: inset -8px 0 18px -10px rgba(120,80,30,.25); }
.lpn-head { position: absolute; left: 62px; top: 22px; right: 26px; display: flex; align-items: center; gap: 12px; }
.lpn-title { font: italic 400 33px/1 "Instrument Serif", serif; color: #1c3a2f; letter-spacing: -0.005em; }
.lp-ai { display: inline-grid; place-items: center; height: 26px; padding: 0 9px; border-radius: 8px; background: #167353; color: #e9fff2;
  font: 800 14.5px/1 "Manrope", sans-serif; letter-spacing: .05em; box-shadow: 0 2px 6px rgba(22,115,83,.3); }
.lpn-ink { position: absolute; left: 62px; white-space: nowrap; font: 600 31px/40px "Caveat", cursive; color: #17604a; }
.lpn-tag { position: absolute; left: 62px; display: inline-flex; align-items: center; gap: 7px; height: 26px; padding: 0 10px; border-radius: 13px;
  font: 750 16px/1 "Manrope", sans-serif; white-space: nowrap; transform-origin: 0 50%; }
.lpn-tag i { width: 9px; height: 9px; border-radius: 50%; }
.lpn-nib { position: absolute; width: 16px; height: 16px; margin: -8px 0 0 -8px; border-radius: 50%;
  background: radial-gradient(circle, #ffffff 0 22%, rgba(183,244,207,.95) 40%, rgba(183,244,207,0) 72%); }
.lpn-band { position: absolute; right: 40px; top: -10px; bottom: -14px; width: 12px; background: linear-gradient(90deg, #12493a, #1d6b53, #12493a); opacity: .9; }
.lpn-ribbon { position: absolute; left: 120px; bottom: -58px; width: 18px; height: 70px; background: linear-gradient(90deg, #e0a73a, #f4c35a);
  clip-path: polygon(0 0, 100% 0, 100% 100%, 50% 80%, 0 100%); }
/* the spread */
.lps { position: absolute; width: ${SPREAD.w}px; height: ${SPREAD.h}px; perspective: 2600px; transform-origin: 0 0; }
.lps-cover { position: absolute; top: -14px; bottom: -18px; width: ${SPREAD.w / 2 + 16}px; border-radius: 22px 0 0 22px; left: -16px; transform-origin: 100% 50%;
  background: linear-gradient(135deg, #2a7d5f, #175c45); box-shadow: 0 50px 90px -30px rgba(110,55,15,.55), 0 12px 26px -8px rgba(110,55,15,.3); }
.lps-pg { position: absolute; top: 0; bottom: 0; width: ${SPREAD.w / 2}px; background: #fffaf0; overflow: hidden; }
.lps-pg.l { left: 0; border-radius: 12px 0 0 12px; box-shadow: inset -26px 0 34px -22px rgba(120,80,30,.35); }
.lps-pg.r { left: ${SPREAD.w / 2}px; border-radius: 0 12px 12px 0; box-shadow: inset 26px 0 34px -22px rgba(120,80,30,.35); }
.lps-turn { position: absolute; left: ${SPREAD.w / 2}px; top: 0; bottom: 0; width: ${SPREAD.w / 2}px; transform-origin: 0 50%; transform-style: preserve-3d; }
.lps-face { position: absolute; inset: 0; backface-visibility: hidden; -webkit-backface-visibility: hidden; background: #fffaf0; overflow: hidden; }
.lps-face.front { border-radius: 0 12px 12px 0; }
.lps-face.back { transform: rotateY(180deg); border-radius: 12px 0 0 12px; box-shadow: inset -26px 0 34px -22px rgba(120,80,30,.35); }
.lps-shade { position: absolute; inset: 0; pointer-events: none; }
.lps-clone { position: absolute; top: 0; transform-origin: 0 0; }
.lps-k { position: absolute; left: 64px; top: 52px; font: 400 54px/1 "Instrument Serif", serif; color: #182a23; letter-spacing: -0.01em; }
.lps-asof { position: absolute; left: 66px; top: 122px; display: flex; align-items: center; gap: 10px; font: 750 18px/1 "Manrope", sans-serif; color: #8a7f72; }
.lps-sl { position: absolute; left: 64px; white-space: nowrap; font: 600 35px/46px "Caveat", cursive; color: #17604a; }
.lps-tags { position: absolute; left: 60px; top: 418px; width: 670px; display: flex; flex-wrap: wrap; gap: 12px 12px; }
.lps-tag { padding: 11px 18px; border-radius: 14px; font: 800 19px/1 "Manrope", sans-serif; color: #1f2a25; border: 3px solid #fff;
  box-shadow: 0 6px 14px -6px rgba(90,50,20,.45); transform-origin: 50% 50%; }
.lps-rh { position: absolute; left: 50px; top: 26px; font: 800 14px/1 "Manrope", sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #a0937f; }
.lps-card { position: absolute; width: 350px; height: 214px; border-radius: 14px; background: #fff; padding: 16px 18px 0 22px;
  box-shadow: 0 1px 0 rgba(255,255,255,.9) inset, 0 0 0 1px rgba(150,110,70,.12), 0 14px 26px -14px rgba(110,60,20,.4); transform-origin: 50% 0; }
.lps-card::before { content: ""; position: absolute; left: 0; top: 14px; bottom: 14px; width: 5px; border-radius: 0 4px 4px 0; background: var(--hue); }
.lps-ct { font: 700 22px/1.22 "Inter", sans-serif; color: #1a1f24; letter-spacing: -0.01em; }
.lps-cb { margin-top: 7px; font: 450 17.5px/1.36 "Inter", sans-serif; color: #5a544c; }
.lps-cf { position: absolute; left: 22px; right: 16px; bottom: 14px; height: 30px; display: flex; align-items: center; gap: 7px;
  font: 750 16px/1 "Manrope", sans-serif; color: var(--deep); white-space: nowrap; }
.lps-cf svg { width: 17px; height: 17px; flex: none; }
.lps-cf .lk { text-decoration: underline; text-decoration-thickness: 1.5px; text-underline-offset: 3px; overflow: hidden; text-overflow: ellipsis; }
.lps-cf .dt { margin-left: auto; color: #7d7368; flex: none; }
.lps-cf .gl { position: absolute; left: -8px; right: -8px; top: -2px; bottom: -2px; border-radius: 9px; background: var(--tint); opacity: 0; z-index: -1; }
.lps-pop { position: absolute; width: 430px; border-radius: 16px; background: #fff; padding: 16px 18px 15px; transform-origin: 0 100%;
  box-shadow: 0 22px 44px -14px rgba(50,40,90,.45), 0 0 0 1.5px #a9c4ff; }
.lps-pop .ph { display: flex; align-items: center; gap: 9px; font: 800 14px/1 "Manrope", sans-serif; letter-spacing: .1em; text-transform: uppercase; color: #3567c9; }
.lps-pop .ph svg { width: 18px; height: 18px; }
.lps-pop .pl { margin-top: 10px; display: flex; align-items: center; gap: 8px; font: 750 21px/1.2 "Inter", sans-serif; color: #234fb0;
  text-decoration: underline; text-underline-offset: 4px; }
.lps-pop .pl svg { width: 20px; height: 20px; flex: none; }
.lps-pop .pd { margin-top: 7px; font: 600 17px/1.3 "Manrope", sans-serif; color: #5d5750; }
.lps-doc { position: absolute; left: 60px; top: 560px; width: 520px; height: 168px; border-radius: 18px; background: #fffdf9; padding: 14px 18px;
  box-shadow: 0 18px 36px -14px rgba(110,60,20,.4), 0 0 0 1px rgba(150,110,70,.12); }
.lps-doc .dh { display: flex; align-items: center; gap: 10px; font: 750 18px/1 "Inter", sans-serif; color: #1f2329; }
.lps-doc .dh span { width: 30px; height: 30px; border-radius: 9px; background: #e3ecff; color: #3567c9; display: grid; place-items: center; }
.lps-doc .dh svg { width: 18px; height: 18px; }
.lps-doc .dr { position: relative; margin-top: 12px; padding: 9px 12px; border-radius: 10px; }
.lps-doc .dr b { display: block; font: 700 19px/1.2 "Inter", sans-serif; color: #1f2329; }
.lps-doc .dr small { display: block; margin-top: 4px; font: 500 15.5px/1.2 "Inter", sans-serif; color: #7b7368; }
.lps-doc .dg { position: absolute; inset: 0; border-radius: 10px; background: linear-gradient(90deg, rgba(255,222,98,.85), rgba(255,236,150,.6)); z-index: -1; }
.lps-thread { position: absolute; left: 0; top: 0; overflow: visible; pointer-events: none; }
`;

const tagHTML = (n) => {
  const s = sourceById[n.src];
  return `<i style="background:${DEEP[n.src]}"></i>${s.short} · ${n.date}`;
};

export function buildNotebook(parent) {
  el("style", null, document.head, CSS);
  // ---- the notebook on the desk
  const nb = el("div", "lpn", parent);
  nb.style.left = `${NB.x}px`; nb.style.top = `${NB.y}px`;
  el("div", "lpn-cover", nb);
  el("div", "lpn-band", nb);
  el("div", "lpn-ribbon", nb);
  const page = el("div", "lpn-page", nb);
  el("div", "lpn-head", page, `<span class="lpn-title">Ram's AI Peer · notes</span><span class="lp-ai">AI</span>`);
  const sum = SUM.map((s, i) => { const e = el("div", "lpn-ink", page, s); e.style.top = `${84 + i * 42}px`; return e; });
  const lines = NOTES.map((n, i) => {
    const ink = el("div", "lpn-ink", page, n.text);
    ink.style.top = `${188 + i * 80}px`;
    const tag = el("span", "lpn-tag", page, tagHTML(n));
    tag.style.top = `${229 + i * 80}px`;
    tag.style.background = TINT[n.src]; tag.style.color = DEEP[n.src];
    return { ink, tag };
  });
  const nib = el("div", "lpn-nib", page);

  // ---- the spread
  const sp = el("div", "lps", parent);
  sp.style.left = `${SPREAD.x}px`; sp.style.top = `${SPREAD.y}px`;
  const coverL = el("div", "lps-cover", sp);
  const coverR = el("div", "lps-cover", sp);
  coverR.style.left = `${SPREAD.w / 2}px`; coverR.style.borderRadius = "0 22px 22px 0";
  const pl = el("div", "lps-pg l", sp);
  pl.style.transformOrigin = "100% 50%";
  const pr = el("div", "lps-pg r", sp);
  el("div", "lps-rh", pr, "Facts · each with its link and date");
  const cards = learned.facts.map((f, i) => {
    const c = el("div", "lps-card", pr);
    c.style.left = `${50 + (i % 2) * 370}px`; c.style.top = `${62 + Math.floor(i / 2) * 230}px`;
    c.style.setProperty("--hue", sourceById[f.source].hue);
    c.style.setProperty("--deep", DEEP[f.source]);
    c.style.setProperty("--tint", TINT[f.source]);
    c.innerHTML = `<div class="lps-ct">${f.title}</div><div class="lps-cb">${f.body}</div>
      <div class="lps-cf"><span class="gl"></span>${sourceIcon(f.source)}<span class="lk">${f.ref}</span><span class="dt">${f.date}</span></div>`;
    return c;
  });
  const turn = el("div", "lps-turn", sp);
  const front = el("div", "lps-face front", turn);
  const clone = page.cloneNode(true);
  clone.classList.add("lps-clone");
  clone.querySelector(".lpn-nib").remove();
  front.appendChild(clone);
  const back = el("div", "lps-face back", turn);
  el("div", "lps-k", back, "What I learned about you");
  el("div", "lps-asof", back, `${learned.asOf} <span class="lp-ai">AI</span>`);
  const sumBox = el("div", null, back);
  const tagsBox = el("div", "lps-tags", back);
  const COLS = ["#bff0d4", "#cfe0ff", "#ffe0c2", "#fff0a8"];
  const tags = learned.tags.map((g, i) => {
    const e = el("span", "lps-tag", tagsBox, g);
    e.style.background = COLS[i];
    return e;
  });
  const doc = el("div", "lps-doc", back, `<div class="dh"><span>${icons.docs}</span>Documents<small style="margin-left:auto;font:700 14px Manrope;color:#9a8f80">as ram</small></div>
    <div class="dr"><i class="dg"></i><b>${reads.docs[0].title}</b><small>${reads.docs[0].sub}</small></div>`);
  const docGlow = doc.querySelector(".dg");
  const shadeF = el("div", "lps-shade", front);
  const shadeB = el("div", "lps-shade", back);
  const shadeR = el("div", "lps-shade", pr);
  const pop = el("div", "lps-pop", sp, `<div class="ph">${icons.docs}Documents · the source</div>
    <div class="pl">${icons.link}${learned.facts[0].ref}</div><div class="pd">by Ram · edited ${learned.facts[0].date} · opens in Documents</div>`);
  const thread = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  thread.setAttribute("class", "lps-thread");
  thread.setAttribute("width", SPREAD.w); thread.setAttribute("height", SPREAD.h);
  thread.innerHTML = `<path d="" fill="none" stroke="#3567c9" stroke-width="3.2" stroke-dasharray="2 9" stroke-linecap="round"/>
    <circle r="6" fill="#3567c9"/><circle r="6" fill="#3567c9"/>`;
  sp.appendChild(thread);
  const [thPath, thA, thB] = thread.children;
  return { nb, page, sum, lines, nib, sp, coverL, pl, pr, cards, turn, front, back, clone, sumBox, tags, doc, docGlow, pop,
    thPath, thA, thB, shadeF, shadeB, shadeR, summaryLines: [] };
}

// Measure, and split the long summary into lines (after fonts are loaded).
export function measureNotebook(N) {
  const g = { lines: [], sum: [] };
  const box = (e) => { const r = e.getBoundingClientRect(); return { x: r.left, y: r.top, w: r.width, h: r.height }; };
  N.lines.forEach((l) => g.lines.push(box(l.ink)));
  N.sum.forEach((s) => g.sum.push(box(s)));
  // Fit the cloned notes page onto the turning page.
  const sc = SPREAD.h / NB.h;
  N.clone.style.transform = `scale(${sc})`;
  N.clone.style.left = `${(SPREAD.w / 2 - NB.w * sc) / 2}px`;
  N.clone.style.width = `${NB.w}px`; N.clone.style.height = `${NB.h}px`;
  // Summary lines: lay the words out at the page's width, then group by line.
  const probe = el("div", "lps-sl", N.back);
  probe.style.whiteSpace = "normal"; probe.style.width = "660px"; probe.style.top = "170px";
  probe.innerHTML = learned.summary.split(" ").map((w) => `<span>${w} </span>`).join("");
  const rows = [];
  [...probe.children].forEach((s) => {
    const top = s.offsetTop;
    let row = rows.find((r) => Math.abs(r.top - top) < 4);
    if (!row) rows.push((row = { top, words: [] }));
    row.words.push(s.textContent);
  });
  probe.remove();
  N.summaryLines = rows.map((r, i) => {
    const e = el("div", "lps-sl", N.sumBox, r.words.join("").trim());
    e.style.top = `${170 + i * 46}px`;
    return e;
  });
  // The traced fact's tag and the source row, in spread pixels.
  const sr = N.sp.getBoundingClientRect();
  const cf = N.cards[0].querySelector(".lps-cf").getBoundingClientRect();
  const dr = N.doc.querySelector(".dr").getBoundingClientRect();
  g.tag = [cf.left - sr.left + 10, cf.top - sr.top + cf.height / 2];
  g.tagWorld = [cf.left + 12, cf.top + cf.height / 2];
  g.docRow = [dr.left - sr.left + dr.width - 30, dr.top - sr.top + dr.height / 2];
  g.docRowWorld = [dr.left + dr.width - 30, dr.top + dr.height / 2];
  g.cardFoot = N.cards.map((c) => { const r = c.querySelector(".lps-cf").getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height / 2]; });
  N.pop.style.left = `${g.tag[0] + 6}px`;
  N.pop.style.top = `${g.tag[1] - 150}px`;
  return g;
}

// How far a written line is, 0..1 (the same numbers the Peer's pencil follows).
export const writeK = (i, t) => ease.inOutSine(prog(t, WRITE[i][0], WRITE[i][1]));
export const sumK = (i, t) => ease.inOutSine(prog(t, S3.lines[i][0], S3.lines[i][1]));

const reveal = (e, k) => {
  e.style.clipPath = `inset(-14px ${((1 - k) * 100).toFixed(2)}% -14px -14px)`;
  e.style.opacity = k > 0 ? "1" : "0";
};

export function renderNotebook(N, G, t, peer) {
  // ---- the desk notebook: in from 5.5 s, out as the spread takes over.
  const kin = ease.outBack(prog(t, 5.55, 6.25), 1.3);
  const kout = ease.inOutCubic(prog(t, LEARN.fly[0], LEARN.fly[1]));
  const nbOn = t < LEARN.fly[1] + 0.05;
  N.nb.style.display = nbOn ? "" : "none";
  if (nbOn) {
    const bob = Math.sin(t * 2 * Math.PI * 0.18) * 3;
    N.nb.style.opacity = String(clamp(prog(t, 5.55, 5.8)) * (1 - prog(t, LEARN.fly[0] + 0.06, LEARN.fly[0] + 0.16)));
    const dx = -240 * kout, dy = 12 * kout;
    N.nb.style.transform = `translate(${(dx + (1 - kin) * 120).toFixed(1)}px, ${(dy + bob * (1 - kout)).toFixed(1)}px) perspective(2000px) rotateY(${(-7 * (1 - kout)).toFixed(2)}deg) rotateX(${(2.5 * (1 - kout)).toFixed(2)}deg) rotate(${(-1.4 + 1.4 * kout + (1 - kin) * 6).toFixed(2)}deg) scale(${(0.9 + 0.1 * kin).toFixed(3)})`;
    let nibAt = null;
    N.lines.forEach((l, i) => {
      const k = writeK(i, t);
      reveal(l.ink, k);
      const kt = ease.outBack(prog(t, WRITE[i][1] - 0.08, WRITE[i][1] + 0.28), 2.0);
      l.tag.style.opacity = String(clamp(kt * 1.5));
      l.tag.style.transform = `scale(${(0.4 + 0.6 * kt).toFixed(3)}) rotate(${((1 - kt) * -8).toFixed(1)}deg)`;
      if (k > 0 && k < 1) nibAt = [62 + G.lines[i].w * k, 188 + i * 80 + 24];
    });
    N.sum.forEach((s, i) => reveal(s, sumK(i, t)));
    N.nib.style.opacity = nibAt ? "1" : "0";
    if (nibAt) N.nib.style.transform = `translate(${nibAt[0].toFixed(1)}px, ${nibAt[1].toFixed(1)}px)`;
  }

  // ---- the spread
  const spOn = t > LEARN.fly[0] && t < BRIEF.close[1] + 0.1;
  N.sp.style.display = spOn ? "" : "none";
  if (!spOn) return;
  const kf = ease.inOutCubic(prog(t, LEARN.fly[0], LEARN.fly[1]));
  const kc = ease.inCubic(prog(t, BRIEF.close[0], BRIEF.close[1]));
  // From the notebook's place on the desk to the middle of the stage.
  const s0 = 0.96, tx0 = 304, ty0 = 5;
  const s = s0 + (1 - s0) * kf;
  N.sp.style.opacity = String(clamp(prog(t, LEARN.fly[0], LEARN.fly[0] + 0.1)) * (1 - prog(t, BRIEF.close[1] - 0.25, BRIEF.close[1])));
  N.sp.style.transform = `translate(${(tx0 * (1 - kf) + kc * 260).toFixed(1)}px, ${(ty0 * (1 - kf) + kc * 520).toFixed(1)}px) rotate(${(kc * 7).toFixed(2)}deg) scale(${(s * (1 - 0.3 * kc)).toFixed(4)})`;
  // The page turns: 0 (lying on the right) to 180 degrees (lying on the left).
  const kt = ease.inOutCubic(prog(t, LEARN.open[0], LEARN.open[1]));
  const ang = -180 * kt;
  N.turn.style.transform = `rotateY(${ang.toFixed(2)}deg)`;
  const mid = Math.sin(kt * Math.PI);
  const kl = ease.outCubic(clamp(kt * 2.2));
  N.pl.style.transform = `scaleX(${kl.toFixed(4)})`;
  N.coverL.style.transform = `scaleX(${kl.toFixed(4)})`;
  N.pl.style.opacity = N.coverL.style.opacity = kl > 0.01 ? "1" : "0";
  N.shadeF.style.background = `linear-gradient(90deg, rgba(90,50,20,${(0.35 * mid).toFixed(3)}), rgba(255,255,255,${(0.25 * mid).toFixed(3)}) 60%, rgba(90,50,20,${(0.12 * mid).toFixed(3)}))`;
  N.shadeB.style.background = `linear-gradient(270deg, rgba(90,50,20,${(0.35 * mid).toFixed(3)}), rgba(255,255,255,0) 70%)`;
  N.shadeR.style.background = `linear-gradient(90deg, rgba(90,50,20,${(0.4 * mid * (kt < 0.5 ? 1 : 0.6)).toFixed(3)}), rgba(90,50,20,0) ${(30 + 60 * kt).toFixed(0)}%)`;
  // The fact cards drop in, one by one.
  N.cards.forEach((c, i) => {
    const k = ease.outBack(prog(t, LEARN.cards + i * 0.14, LEARN.cards + i * 0.14 + 0.45), 1.4);
    c.style.opacity = String(clamp(k * 1.6));
    c.style.transform = `translateY(${((1 - k) * -26).toFixed(1)}px) rotateX(${((1 - k) * 28).toFixed(1)}deg) rotate(${(((i * 37) % 5) - 2) * 0.25}deg)`;
    // Each card's link and date glows in turn (and the traced one first).
    const sw = LEARN.sweep + i * 0.34;
    const g = Math.max(pulse(t, sw, sw + 0.7, 0.2), i === 0 ? pulse(t, LEARN.tap - 0.05, LEARN.sweep, 0.2) : 0);
    c.querySelector(".gl").style.opacity = g.toFixed(3);
  });
  // The summary writes itself on the left page, then the tags are stuck on.
  const n = N.summaryLines.length;
  N.summaryLines.forEach((e, i) => {
    const a = LEARN.summary[0] + ((LEARN.summary[1] - LEARN.summary[0]) / n) * i;
    reveal(e, ease.inOutSine(prog(t, a, a + (LEARN.summary[1] - LEARN.summary[0]) / n)));
  });
  N.tags.forEach((e, i) => {
    const k = ease.outBack(prog(t, LEARN.tags + i * 0.13, LEARN.tags + i * 0.13 + 0.34), 2.2);
    e.style.opacity = String(clamp(k * 2));
    e.style.transform = `scale(${(1.5 - 0.5 * k).toFixed(3)}) rotate(${(((i % 2) ? 2.2 : -2.4) + (1 - k) * 10).toFixed(2)}deg)`;
  });
  // The traced fact: its tag opens to the link and date, a thread runs back to the source.
  const kp = ease.outBack(prog(t, LEARN.tagOpen[0], LEARN.tagOpen[1]), 1.6);
  const kpOut = prog(t, LEARN.closeAt - 0.4, LEARN.closeAt);
  N.pop.style.opacity = String(clamp(kp * 1.4) * (1 - kpOut));
  N.pop.style.transform = `scale(${(0.3 + 0.7 * kp).toFixed(3)})`;
  const kd = ease.outBack(prog(t, LEARN.docIn[0], LEARN.docIn[1]), 1.3);
  N.doc.style.opacity = String(clamp(kd * 1.5));
  N.doc.style.transform = `translateY(${((1 - kd) * 60).toFixed(1)}px) rotate(${((1 - kd) * -4 - 0.8).toFixed(2)}deg)`;
  N.docGlow.style.opacity = String(ease.outCubic(prog(t, LEARN.plug, LEARN.plug + 0.3)));
  // The thread: from the tag to the Peer's hand while it pulls, then plugged into the row.
  const kth = prog(t, LEARN.thread[0], LEARN.thread[0] + 0.05);
  const show = kth > 0 && t < LEARN.closeAt;
  [N.thPath, N.thA, N.thB].forEach((e) => (e.style.display = show ? "" : "none"));
  if (show) {
    const a = G.tag;
    const toW = t < LEARN.plug ? peer.handL : [G.docRowWorld[0], G.docRowWorld[1]];
    // world -> spread pixels (the spread is at rest by now)
    const b = [toW[0] - SPREAD.x, toW[1] - SPREAD.y];
    const mx = (a[0] + b[0]) / 2, my = Math.min(a[1], b[1]) - 120;
    N.thPath.setAttribute("d", `M ${a[0].toFixed(1)} ${a[1].toFixed(1)} Q ${mx.toFixed(1)} ${my.toFixed(1)} ${b[0].toFixed(1)} ${b[1].toFixed(1)}`);
    N.thPath.setAttribute("stroke-dashoffset", (-t * 30).toFixed(1));
    N.thA.setAttribute("cx", a[0].toFixed(1)); N.thA.setAttribute("cy", a[1].toFixed(1));
    N.thB.setAttribute("cx", b[0].toFixed(1)); N.thB.setAttribute("cy", b[1].toFixed(1));
  }
}
