// The setup card, top left in screen space: the four steps ticking with their times, and under
// it the sources list (each source with a tick and what it gave), which the widgets fold into.
import { el, prog, ease, clamp, secs } from "../shared/kit.js";
import { steps, sources } from "../shared/data.js";
import { icons, sourceIcon } from "../shared/icons.js";
import { STEP_START, STEP_TICK, SRC_IN, FOLD, LEARN } from "./tl.js";
import { DEEP, TINT } from "./widgets.js";

const CSS = `
.lph { position: absolute; left: 28px; top: 24px; width: 640px; z-index: 30; }
.lph-card { position: absolute; left: 0; width: 640px; border-radius: 22px; background: rgba(255,253,249,.94); padding: 15px 20px 14px;
  box-shadow: 0 0 0 1px rgba(150,110,70,.12), 0 22px 46px -20px rgba(120,60,20,.42), 0 6px 14px -8px rgba(120,60,20,.2); }
.lph-h { display: flex; align-items: center; gap: 10px; font: 800 14px/1 "Manrope", sans-serif; letter-spacing: .13em; text-transform: uppercase; color: #8d7f6e; margin-bottom: 9px; }
.lph-h .lp-ai { height: 22px; font-size: 12.5px; padding: 0 7px; }
.lph-step { position: relative; display: flex; align-items: center; gap: 12px; height: 37px; font: 500 18px/1 "Inter", sans-serif; color: #a39789; white-space: nowrap; }
.lph-step b { margin-left: auto; font: 800 18px/1 "Manrope", sans-serif; color: #167353; }
.lph-st { position: relative; width: 26px; height: 26px; flex: none; }
.lph-st svg { position: absolute; inset: 0; width: 26px; height: 26px; }
.lph-ok { position: absolute; inset: 0; border-radius: 50%; background: #1f8a5f; color: #fff; display: grid; place-items: center; }
.lph-ok svg { position: static; width: 15px; height: 15px; }
.lph-src { display: flex; align-items: center; gap: 12px; height: 46px; white-space: nowrap; transform-origin: 0 50%; }
.lph-src .ic { width: 32px; height: 32px; border-radius: 10px; display: grid; place-items: center; flex: none; }
.lph-src .ic svg { width: 19px; height: 19px; }
.lph-src b { font: 700 18px/1 "Inter", sans-serif; color: #1f2329; width: 168px; }
.lph-src small { font: 650 17px/1 "Manrope", sans-serif; color: #6f665c; }
.lph-src .ok { margin-left: auto; width: 24px; height: 24px; border-radius: 50%; background: #1f8a5f; color: #fff; display: grid; place-items: center; flex: none; }
.lph-src .ok svg { width: 14px; height: 14px; }
`;

export function buildHud(parent) {
  el("style", null, document.head, CSS);
  const root = el("div", "lph", parent);
  const card = el("div", "lph-card", root);
  el("div", "lph-h", card, `Setting up · Ram's AI Peer <span class="lp-ai">AI</span>`);
  const rows = steps.map((s) => {
    const r = el("div", "lph-step", card);
    const st = el("i", "lph-st", r, `<svg viewBox="0 0 26 26"><circle cx="13" cy="13" r="10.5" fill="none" stroke="#e5ddd2" stroke-width="2.6"/>
      <circle class="arc" cx="13" cy="13" r="10.5" fill="none" stroke="#1f8a5f" stroke-width="2.8" stroke-linecap="round" stroke-dasharray="18 60"/></svg>
      <span class="lph-ok">${icons.check}</span>`);
    const txt = el("span", null, r, s.text);
    const time = el("b", null, r, secs(s.time));
    return { r, arc: st.querySelector(".arc"), svg: st.querySelector("svg"), ok: st.querySelector(".lph-ok"), txt, time };
  });
  const src = el("div", "lph-card", root);
  src.style.top = "236px";
  el("div", "lph-h", src, `Sources · read as ram, read-only`);
  const srcRows = sources.map((s) => el("div", "lph-src", src,
    `<span class="ic" style="background:${TINT[s.id]};color:${DEEP[s.id]}">${sourceIcon(s.id)}</span><b>${s.name}</b><small>${s.found}</small><i class="ok">${icons.check}</i>`));
  return { root, card, rows, src, srcRows };
}

// The screen point a source row sits at (for the widgets to fold toward).
export function hudRowCentres(H) {
  return H.srcRows.map((r) => { const b = r.getBoundingClientRect(); return [b.left + 110, b.top + b.height / 2]; });
}

export function renderHud(H, t) {
  const kin = ease.outBack(prog(t, 5.85, 6.35), 1.4);
  const kout = ease.inCubic(prog(t, LEARN.hudOut[0], LEARN.hudOut[1]));
  const on = t > 5.85 && t < LEARN.hudOut[1];
  H.root.style.display = on ? "" : "none";
  if (!on) return;
  H.card.style.opacity = String(clamp(kin * 1.5));
  H.card.style.transform = `translate(${(-700 * kout).toFixed(1)}px, ${((1 - kin) * -40).toFixed(1)}px)`;
  H.rows.forEach((r, i) => {
    const a = STEP_START[i], d = STEP_TICK[i];
    const active = t >= a && t < d, done = t >= d;
    r.txt.style.color = done ? "#2c2620" : active ? "#15120f" : "#a39789";
    r.txt.style.fontWeight = active ? "700" : "500";
    r.svg.style.opacity = done ? "0" : "1";
    r.arc.style.opacity = active ? "1" : "0";
    r.svg.style.transform = `rotate(${((t * 380) % 360).toFixed(1)}deg)`;
    const k = ease.outBack(prog(t, d, d + 0.32), 2.4);
    r.ok.style.opacity = done ? "1" : "0";
    r.ok.style.transform = `scale(${(done ? k : 0).toFixed(3)})`;
    const kt = ease.outCubic(prog(t, d + 0.05, d + 0.4));
    r.time.style.opacity = kt.toFixed(3);
    r.time.style.transform = `translateX(${((1 - kt) * 16).toFixed(1)}px)`;
    // A soft wash behind the step that is running.
    r.r.style.background = active ? `linear-gradient(90deg, rgba(183,244,207,${(0.35 + 0.15 * Math.sin(t * 5)).toFixed(3)}), rgba(183,244,207,0))` : "none";
    r.r.style.borderRadius = "10px";
    r.r.style.margin = "0 -10px"; r.r.style.padding = "0 10px";
  });
  const ks = ease.outBack(prog(t, SRC_IN, SRC_IN + 0.4), 1.3);
  const sOn = t > SRC_IN;
  H.src.style.display = sOn ? "" : "none";
  H.src.style.opacity = String(clamp(ks * 1.4));
  H.src.style.transform = `translate(${(-700 * kout).toFixed(1)}px, ${((1 - ks) * -30).toFixed(1)}px)`;
  H.srcRows.forEach((r, i) => {
    const at = FOLD + i * 0.08 + 0.36;
    const k = ease.outBack(prog(t, at, at + 0.3), 2.0);
    r.style.opacity = String(clamp(k * 1.5));
    r.style.transform = `scale(${(0.7 + 0.3 * k).toFixed(3)})`;
    const ok = r.querySelector(".ok");
    const ko = ease.outBack(prog(t, at + 0.12, at + 0.4), 2.6);
    ok.style.transform = `scale(${ko.toFixed(3)})`;
  });
}
