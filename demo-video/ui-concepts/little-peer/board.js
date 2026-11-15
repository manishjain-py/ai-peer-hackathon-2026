// The board: the Peer pins four brief cards on it at the end of setup (small, beside the
// notebook); then it comes forward as "Your brief", newest at the top, and the Peer slaps a
// yellow "Next" sticky on each card. Every card keeps its source and date.
import { el, prog, ease, clamp, pulse, spring } from "../shared/kit.js";
import { brief, sourceById } from "../shared/data.js";
import { sourceIcon } from "../shared/icons.js";
import { BOARD, S4, BRIEF, LEARN } from "./tl.js";
import { DEEP, TINT } from "./widgets.js";

export const CARD = (i) => ({ x: 60, y: 140 + i * 152, w: 1030, h: 136 });
export const STICKY = (i) => ({ x: 1118, y: 144 + i * 152, w: 316, h: 128 });
const TILT = [-0.6, 0.5, -0.35, 0.55];
const STILT = [2.2, -1.8, 1.4, -2.4];

const CSS = `
.lpb { position: absolute; width: ${BOARD.w}px; height: ${BOARD.h}px; transform-origin: 0 0; }
.lpb-frame { position: absolute; inset: 0; border-radius: 26px; background: linear-gradient(135deg, #d9a56e, #b77d48 60%, #a96f3d);
  box-shadow: 0 46px 90px -30px rgba(110,55,15,.55), 0 12px 26px -10px rgba(110,55,15,.35), inset 0 2px 0 rgba(255,230,190,.6); }
.lpb-felt { position: absolute; inset: 16px; border-radius: 16px; background-color: #ecd4ad;
  background-image: radial-gradient(rgba(150,100,50,.17) 1.2px, transparent 1.7px), radial-gradient(rgba(255,255,255,.22) 1px, transparent 1.5px);
  background-size: 14px 14px, 9px 9px; background-position: 0 0, 4px 5px; box-shadow: inset 0 5px 16px rgba(100,60,20,.28); }
.lpb-head { position: absolute; left: 60px; top: 36px; }
.lpb-title { font: 400 46px/1 "Instrument Serif", serif; color: #2b1d10; letter-spacing: -0.01em; }
.lpb-lead { margin-top: 10px; font: 500 20px/1.2 "Inter", sans-serif; color: #5a4633; }
.lpb-order { position: absolute; right: 64px; top: 60px; display: flex; align-items: center; gap: 8px; font: 800 14.5px/1 "Manrope", sans-serif;
  letter-spacing: .12em; text-transform: uppercase; color: #7a5a3a; }
.lpb-card { position: absolute; left: 0; top: 0; width: 1030px; height: 136px; border-radius: 12px; background: #fffdf8; padding: 18px 26px 0 32px;
  box-shadow: 0 14px 24px -12px rgba(90,50,15,.5), 0 0 0 1px rgba(120,80,40,.1); transform-origin: 50% 0; }
.lpb-card::before { content: ""; position: absolute; left: 0; top: 16px; bottom: 16px; width: 6px; border-radius: 0 4px 4px 0; background: var(--hue); }
.lpb-pin { position: absolute; left: 12px; top: -11px; width: 26px; height: 26px; border-radius: 50%;
  background: radial-gradient(circle at 35% 30%, #fff3b0, #f2b632 50%, #b77812); box-shadow: 0 5px 7px -2px rgba(0,0,0,.35); }
.lpb-ct { font: 700 24px/1.2 "Inter", sans-serif; color: #1a1f24; letter-spacing: -0.01em; white-space: nowrap; }
.lpb-cw { margin-top: 7px; font: 450 18.5px/1.3 "Inter", sans-serif; color: #5a544c; white-space: nowrap; }
.lpb-cf { position: absolute; left: 32px; bottom: 14px; display: flex; align-items: center; gap: 8px; font: 750 16.5px/1 "Manrope", sans-serif; color: var(--deep); }
.lpb-cf svg { width: 18px; height: 18px; }
.lpb-cf .dt { color: #7d7368; }
.lpb-new { position: absolute; right: 20px; top: 18px; padding: 6px 11px; border-radius: 8px; background: #167353; color: #effff5; font: 800 13.5px/1 "Manrope", sans-serif; letter-spacing: .08em; }
.lpb-sticky { position: absolute; left: 0; top: 0; width: 316px; height: 128px; padding: 14px 18px; border-radius: 3px 3px 16px 3px;
  background: linear-gradient(160deg, #fff3a8, #ffe36b 58%, #f8d24a); box-shadow: 0 16px 22px -12px rgba(90,60,0,.5), inset 0 -10px 16px -12px rgba(150,100,0,.35); transform-origin: 50% 8%; }
.lpb-sticky b { display: block; font: 800 14px/1 "Manrope", sans-serif; letter-spacing: .14em; text-transform: uppercase; color: #8a6a10; }
.lpb-sticky div { margin-top: 7px; font: 700 27px/1.04 "Caveat", cursive; color: #3a2c08; }
`;

export function buildBoard(parent) {
  el("style", null, document.head, CSS);
  const root = el("div", "lpb", parent);
  root.style.left = `${BOARD.x}px`; root.style.top = `${BOARD.y}px`;
  el("div", "lpb-frame", root);
  el("div", "lpb-felt", root);
  el("div", "lpb-head", root, `<div class="lpb-title">Your brief · Sunday, Nov 15</div><div class="lpb-lead">${brief.lead}</div>`);
  el("div", "lpb-order", root, `Newest first <span style="font-size:18px">↓</span>`);
  const cards = brief.items.map((b, i) => {
    const c = el("div", "lpb-card", root);
    const s = sourceById[b.source];
    c.style.setProperty("--hue", s.hue); c.style.setProperty("--deep", DEEP[b.source]);
    c.innerHTML = `<i class="lpb-pin"></i><div class="lpb-ct">${b.title}</div><div class="lpb-cw">${b.why}</div>
      <div class="lpb-cf">${sourceIcon(b.source)}${s.name} · ${b.ref} <span class="dt">· ${b.date}</span></div>${i === 0 ? '<span class="lpb-new">NEW</span>' : ""}`;
    return { c, pin: c.querySelector(".lpb-pin") };
  });
  const stickies = brief.items.map((b) => el("div", "lpb-sticky", root, `<b>Next</b><div>${b.next}</div>`));
  return { root, cards, stickies };
}

// The board's placement (world): small during setup, big for "Your brief".
export function boardPlace(t) {
  const sm = BOARD.small;
  const kin = ease.inOutCubic(prog(t, BRIEF.boardIn[0], BRIEF.boardIn[1]));
  const lift = Math.sin(kin * Math.PI) * 40;
  const s = sm.s + (1 - sm.s) * kin;
  const x = (sm.x - BOARD.x) * (1 - kin), y = (sm.y - BOARD.y) * (1 - kin) - lift;
  const ko = ease.inBack(prog(t, BRIEF.out[0], BRIEF.out[1]), 1.4);
  return { x, y: y - ko * 1100, s, rot: -ko * 7, kin };
}
// A board-local point in world pixels at time t.
export function boardToWorld(t, p) {
  const b = boardPlace(t);
  return [BOARD.x + b.x + p[0] * b.s, BOARD.y + b.y + p[1] * b.s];
}

export function renderBoard(B, t, hand) {
  const on = t > S4.boardIn && t < BRIEF.out[1];
  B.root.style.display = on ? "" : "none";
  if (!on) return;
  const b = boardPlace(t);
  const pop = ease.outBack(prog(t, S4.boardIn, S4.boardIn + 0.45), 1.5);
  const dim = prog(t, LEARN.boardOut[0], LEARN.boardOut[1] - 0.15) * (1 - prog(t, BRIEF.boardIn[0], BRIEF.boardIn[0] + 0.25));
  B.root.style.opacity = String(clamp(pop * 1.6) * (1 - dim));
  const sc = b.s * (0.75 + 0.25 * pop);
  B.root.style.transform = `translate(${b.x.toFixed(1)}px, ${(b.y + (1 - pop) * 40).toFixed(1)}px) rotate(${b.rot.toFixed(2)}deg) scale(${sc.toFixed(4)})`;
  B.cards.forEach((c, i) => {
    const a = S4.slaps[i];
    const k = spring(t, a, 3.2, 0.42);
    const p = CARD(i);
    c.c.style.opacity = t >= a ? "1" : "0";
    const squash = 1 + (1 - k) * 0.25;
    c.c.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${TILT[i]}deg) scale(${squash.toFixed(3)}, ${(2 - squash).toFixed(3)})`;
    const kp = ease.outBack(prog(t, a + 0.08, a + 0.3), 2.4);
    c.pin.style.transform = `translateY(${((1 - kp) * -26).toFixed(1)}px) scale(${(0.4 + 0.6 * kp).toFixed(3)})`;
    c.pin.style.opacity = String(clamp(kp * 2));
  });
  B.stickies.forEach((s, i) => {
    const a = BRIEF.stickies[i];
    const p = STICKY(i);
    const held = t >= a - 0.55 && t < a;
    const placed = t >= a;
    s.style.display = held || placed ? "" : "none";
    if (!held && !placed) return;
    if (held) {
      // In the Peer's hand: hand (world) -> board-local.
      const lx = (hand[0] - BOARD.x - b.x) / b.s - p.w * 0.25, ly = (hand[1] - BOARD.y - b.y) / b.s - p.h * 0.2;
      const kg = ease.outBack(prog(t, a - 0.55, a - 0.4), 2);
      s.style.transform = `translate(${lx.toFixed(1)}px, ${ly.toFixed(1)}px) rotate(${(-8 + 4 * Math.sin(t * 9)).toFixed(2)}deg) scale(${(0.5 * kg).toFixed(3)})`;
    } else {
      const k = spring(t, a, 3.4, 0.4);
      const wig = pulse(t, BRIEF.glow + i * 0.55, BRIEF.glow + i * 0.55 + 0.6, 0.2);
      const sq = 1 + (1 - k) * 0.22;
      s.style.transform = `translate(${p.x}px, ${p.y}px) rotate(${(STILT[i] + wig * 3 * Math.sin(t * 20)).toFixed(2)}deg) scale(${(sq * (1 + wig * 0.05)).toFixed(3)}, ${((2 - sq) * (1 + wig * 0.05)).toFixed(3)})`;
    }
  });
}
