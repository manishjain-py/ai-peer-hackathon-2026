// Warm daylight: cream and apricot, soft blurred shapes at three depths that move with the camera
// at different rates (parallax), slow light shafts from the top left, a warm vignette.
import { el, prog, ease, noise, rng } from "../shared/kit.js";

const CSS = `
.lpg { position: absolute; inset: 0; overflow: hidden; }
.lpg-base { position: absolute; inset: 0;
  background: radial-gradient(130% 100% at 18% 8%, #fffbf3 0%, #fff2e2 38%, #ffe4c8 72%, #ffd6b3 100%); }
.lpg-layer { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; transform-origin: 960px 540px; }
.lpg-blob { position: absolute; border-radius: 50%; }
.lpg-shaft { position: absolute; left: -300px; top: -400px; width: 420px; height: 2200px; transform-origin: 50% 0;
  background: linear-gradient(90deg, rgba(255,255,255,0), rgba(255,253,245,.42) 50%, rgba(255,255,255,0)); }
.lpg-floor { position: absolute; left: -200px; right: -200px; top: 640px; height: 700px; border-radius: 50%;
  background: radial-gradient(60% 55% at 50% 40%, rgba(255,250,240,.7), rgba(255,240,220,0) 70%); }
.lpg-mote { position: absolute; left: 0; top: 0; border-radius: 50%; background: radial-gradient(circle, #fffef4 0 35%, rgba(255,250,225,.6) 55%, rgba(255,250,225,0) 75%); }
.lpg-sun { position: absolute; left: -520px; top: -640px; width: 1500px; height: 1300px; border-radius: 50%; background: radial-gradient(closest-side, rgba(255,253,240,.95), rgba(255,246,222,.55) 45%, rgba(255,240,210,0)); }
.lpg-vig { position: absolute; inset: 0; pointer-events: none;
  background: radial-gradient(120% 95% at 50% 45%, rgba(255,255,255,0) 55%, rgba(170,90,30,.14) 85%, rgba(150,70,20,.26) 100%); }
`;

const blob = (layer, x, y, r, c, a) => {
  const b = el("div", "lpg-blob", layer);
  b.style.left = `${x - r}px`; b.style.top = `${y - r}px`;
  b.style.width = b.style.height = `${2 * r}px`;
  b.style.background = `radial-gradient(circle, ${c} 0%, ${c.replace(/[\d.]+\)$/, `${(a * 0.45).toFixed(2)})`)} 42%, rgba(255,255,255,0) 70%)`;
  return b;
};

export function buildBg(back, front) {
  el("style", null, document.head, CSS);
  const g = el("div", "lpg", back);
  el("div", "lpg-base", g);
  const sun = el("div", "lpg-sun", g);
  const shafts = [0, 1, 2].map((i) => {
    const s = el("div", "lpg-shaft", g);
    s.style.width = `${[420, 260, 520][i]}px`;
    return s;
  });
  const far = el("div", "lpg-layer", g);
  const mid = el("div", "lpg-layer", g);
  el("div", "lpg-floor", g);
  const r = rng(7);
  const FAR = ["rgba(255,196,150,.75)", "rgba(255,214,170,.8)", "rgba(196,240,214,.6)", "rgba(255,226,150,.65)", "rgba(255,180,160,.5)", "rgba(206,232,255,.45)"];
  const farB = FAR.map((c, i) => blob(far, 160 + i * 330 + r() * 120, 120 + r() * 820, 380 + r() * 260, c, 0.75));
  const MID = ["rgba(255,186,140,.55)", "rgba(183,244,207,.55)", "rgba(255,220,140,.5)", "rgba(255,170,150,.42)", "rgba(190,215,255,.4)", "rgba(255,205,160,.5)", "rgba(183,244,207,.45)"];
  const midB = MID.map((c, i) => blob(mid, 80 + i * 300 + r() * 140, 80 + r() * 900, 140 + r() * 120, c, 0.55));
  const near = el("div", "lpg-layer", front);
  const NEAR = [[60, 980, 150, "rgba(255,190,150,.5)"], [1860, 940, 120, "rgba(183,244,207,.42)"], [1880, 140, 90, "rgba(255,222,160,.35)"],
    [40, 120, 110, "rgba(255,210,180,.32)"], [980, 1060, 110, "rgba(255,200,160,.3)"]];
  const nearB = NEAR.map(([x, y, rr, c]) => blob(near, x, y, rr, c, 0.45));
  const motes = el("div", "lpg-layer", front);
  const r2 = rng(23);
  const moteList = Array.from({ length: 42 }, () => {
    const m = el("div", "lpg-mote", motes);
    const sz = 3 + r2() * 6;
    m.style.width = m.style.height = `${sz.toFixed(1)}px`;
    return { m, x: r2() * 1920, y: r2() * 1080, ph: r2() * 6.28, sp: 0.6 + r2() * 0.8 };
  });
  el("div", "lpg-vig", front);
  return { g, far, mid, near, farB, midB, nearB, shafts, sun, motes, moteList };
}

// cam = [cx, cy, s]; t for the slow drift; bloom 0..1 as the stage appears.
export function renderBg(B, t, cam) {
  const [cx, cy, s] = cam;
  const bloom = ease.outCubic(prog(t, 5.2, 6.6));
  const lay = (e, f, extraS = 0) => {
    const k = 1 + (s - 1) * f;
    e.style.transform = `translate(${(-(cx - 960) * f).toFixed(1)}px, ${(-(cy - 540) * f).toFixed(1)}px) scale(${(k * (0.86 + 0.14 * bloom + extraS)).toFixed(4)})`;
  };
  lay(B.far, 0.12);
  lay(B.mid, 0.42);
  lay(B.near, 1.35, 0.04);
  B.far.style.opacity = bloom.toFixed(3);
  B.mid.style.opacity = bloom.toFixed(3);
  B.near.style.opacity = bloom.toFixed(3);
  B.farB.forEach((b, i) => (b.style.transform = `translate(${(noise(t * 0.08, i + 1) * 60).toFixed(1)}px, ${(noise(t * 0.07, i + 11) * 40).toFixed(1)}px)`));
  B.midB.forEach((b, i) => (b.style.transform = `translate(${(noise(t * 0.12, i + 21) * 50).toFixed(1)}px, ${(noise(t * 0.1, i + 31) * 40).toFixed(1)}px)`));
  B.nearB.forEach((b, i) => (b.style.transform = `translate(${(noise(t * 0.15, i + 41) * 30).toFixed(1)}px, ${(noise(t * 0.13, i + 51) * 24).toFixed(1)}px)`));
  B.sun.style.opacity = (0.75 + 0.2 * Math.sin(t * 0.4)).toFixed(3);
  B.sun.style.transform = `translate(${(-(cx - 960) * 0.08).toFixed(1)}px, ${(-(cy - 540) * 0.08).toFixed(1)}px)`;
  B.motes.style.opacity = bloom.toFixed(3);
  B.moteList.forEach((o, i) => {
    let x = o.x + noise(t * 0.06 * o.sp, i + 61) * 90 + t * 9 * o.sp - (cx - 960) * 1.15 * s;
    let y = o.y + noise(t * 0.05 * o.sp, i + 71) * 70 - t * 4 * o.sp - (cy - 540) * 1.15 * s;
    x = ((x % 2000) + 2000) % 2000 - 40; y = ((y % 1160) + 1160) % 1160 - 40;
    const tw = 0.25 + 0.45 * (0.5 + 0.5 * Math.sin(t * 1.4 * o.sp + o.ph));
    const lit = 1 - Math.min(1, Math.hypot(x - 300, y - 160) / 1500);
    o.m.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px)`;
    o.m.style.opacity = (tw * (0.35 + 0.65 * lit)).toFixed(3);
  });
  B.shafts.forEach((sh, i) => {
    const x = [-120, 260, 620][i] + Math.sin(t * 0.11 + i * 2) * 60 - (cx - 960) * 0.2;
    sh.style.transform = `translateX(${x.toFixed(1)}px) rotate(${(-28 + i * 3).toFixed(1)}deg)`;
    sh.style.opacity = ((0.75 + 0.25 * Math.sin(t * 0.3 + i * 1.7)) * bloom).toFixed(3);
  });
}
