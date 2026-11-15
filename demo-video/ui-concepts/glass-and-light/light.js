// The light of Glass & Light, drawn on 2D canvases from t: the Peer (an orb with a white core, a
// mint-aqua aura and a slow inner swirl), its reading beam, the trails of chips, the threads that
// tie a sentence to its source, and the glow along the screen's edges while it works.
// `onLight` (0..1) says how light the background is: on the dark aurora light adds up
// ("lighter"); on the pearl page it is drawn as tinted glow so it still reads.
import { rng, noise, clamp } from "../shared/kit.js";

function radial(ctx, x, y, r, stops) {
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  for (const [o, c] of stops) g.addColorStop(o, c);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

const SPARK = (() => { const r = rng(77); return Array.from({ length: 9 }, () => [r(), r(), r(), r()]); })();

// The orb at screen (x, y) with core radius r. diffuse (0..1): seen through frosted glass.
export function drawOrb(ctx, x, y, r, t, { onLight = 0, alpha = 1, diffuse = 0, pulse = 0 } = {}) {
  if (alpha <= 0.002) return;
  const dark = 1 - onLight;
  const big = 1 + diffuse * 1.4;
  const coreA = alpha * (1 - diffuse * 0.75);
  ctx.save();
  // Dark ground: light adds up.
  if (dark > 0.01) {
    ctx.globalCompositeOperation = "lighter";
    const a = alpha * dark;
    radial(ctx, x, y, r * 9.5 * big * (1 + pulse * 0.25), [[0, `rgba(60,215,195,${0.3 * a})`], [0.45, `rgba(60,170,210,${0.11 * a})`], [1, "rgba(60,170,210,0)"]]);
    radial(ctx, x, y, r * 3.6 * big, [[0, `rgba(130,248,225,${0.75 * a})`], [1, "rgba(130,248,225,0)"]]);
    // Anamorphic streak.
    ctx.save();
    ctx.translate(x, y);
    ctx.scale(1, 0.07);
    radial(ctx, 0, 0, r * 11 * big, [[0, `rgba(190,255,240,${0.32 * a * (1 - diffuse)})`], [1, "rgba(190,255,240,0)"]]);
    ctx.restore();
  }
  // Light ground: a tinted glow that reads on white.
  if (onLight > 0.01) {
    ctx.globalCompositeOperation = "source-over";
    const a = alpha * onLight;
    radial(ctx, x, y + r * 1.1, r * 2.8, [[0, `rgba(8,60,55,${0.12 * a * (1 - diffuse)})`], [1, "rgba(8,60,55,0)"]]);
    radial(ctx, x, y, r * 7.5 * big * (1 + pulse * 0.25), [[0, `rgba(20,184,166,${0.3 * a})`], [0.5, `rgba(45,170,210,${0.1 * a})`], [1, "rgba(45,170,210,0)"]]);
    radial(ctx, x, y, r * 2.7 * big, [[0, `rgba(30,205,180,${0.75 * a})`], [0.65, `rgba(45,212,191,${0.25 * a})`], [1, "rgba(45,212,191,0)"]]);
  }
  // The core and its swirl.
  ctx.globalCompositeOperation = "source-over";
  radial(ctx, x, y, r * 1.35 * big, [[0, `rgba(255,255,255,${coreA})`], [0.5, `rgba(236,255,250,${coreA})`], [0.78, `rgba(130,240,218,${0.95 * coreA})`], [1, `rgba(40,195,172,0)`]]);
  if (diffuse < 0.9) {
    ctx.lineCap = "round";
    for (let k = 0; k < 3; k++) {
      const a0 = t * (1.5 + k * 0.35) + k * 2.1;
      ctx.strokeStyle = onLight > 0.5 ? `rgba(40,190,170,${0.32 * coreA})` : `rgba(90,230,205,${0.55 * coreA})`;
      ctx.lineWidth = Math.max(1, r * 0.09);
      ctx.beginPath();
      ctx.ellipse(x, y, r * (0.95 - k * 0.18), r * (0.55 - k * 0.1), a0 * 0.6, a0, a0 + 2.1);
      ctx.stroke();
    }
    radial(ctx, x - r * 0.25, y - r * 0.3, r * 0.55, [[0, `rgba(255,255,255,${coreA})`], [1, "rgba(255,255,255,0)"]]);
  }
  // Sparkles that orbit and twinkle.
  if (diffuse < 0.6) {
    ctx.globalCompositeOperation = onLight > 0.5 ? "source-over" : "lighter";
    for (const [p, q, s, w] of SPARK) {
      const ang = p * 6.283 + t * (0.4 + q * 0.5);
      const rad = r * (2.2 + q * 2.6);
      const tw = clamp(0.5 + 0.5 * noise(t * (1.2 + s) + p * 10, 5));
      const sx = x + Math.cos(ang) * rad, sy = y + Math.sin(ang) * rad * 0.8;
      const sz = r * (0.12 + w * 0.18) * tw;
      ctx.fillStyle = onLight > 0.5 ? `rgba(13,148,136,${0.7 * tw * alpha})` : `rgba(210,255,245,${0.9 * tw * alpha})`;
      ctx.beginPath();
      ctx.moveTo(sx, sy - sz * 2.4); ctx.lineTo(sx + sz * 0.5, sy); ctx.lineTo(sx, sy + sz * 2.4); ctx.lineTo(sx - sz * 0.5, sy); ctx.closePath();
      ctx.moveTo(sx - sz * 2.4, sy); ctx.lineTo(sx, sy + sz * 0.5); ctx.lineTo(sx + sz * 2.4, sy); ctx.lineTo(sx, sy - sz * 0.5); ctx.closePath();
      ctx.fill();
    }
  }
  ctx.restore();
}

// The reading beam: a fan of light from the orb o to a line [a, b] on what it reads.
export function drawFan(ctx, o, a, b, k, onLight = 0) {
  if (k <= 0.002) return;
  ctx.save();
  ctx.globalCompositeOperation = onLight > 0.5 ? "source-over" : "lighter";
  const mx = (a[0] + b[0]) / 2, my = (a[1] + b[1]) / 2;
  const g = ctx.createLinearGradient(o[0], o[1], mx, my);
  const c = onLight > 0.5 ? "45,200,180" : "120,245,220";
  g.addColorStop(0, `rgba(${c},${0.42 * k})`);
  g.addColorStop(1, `rgba(${c},${0.1 * k})`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(o[0], o[1]);
  ctx.lineTo(a[0], a[1]);
  ctx.lineTo(b[0], b[1]);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

// A comet trail through screen points (newest first).
export function drawTrail(ctx, pts, k, color = "150,250,225", onLight = 0) {
  if (pts.length < 2 || k <= 0.002) return;
  ctx.save();
  ctx.globalCompositeOperation = onLight > 0.5 ? "source-over" : "lighter";
  ctx.lineCap = "round";
  for (let i = 0; i < pts.length - 1; i++) {
    const f = 1 - i / (pts.length - 1);
    ctx.strokeStyle = `rgba(${color},${0.55 * f * k})`;
    ctx.lineWidth = Math.max(0.5, pts[i][2] * 7 * f);
    ctx.beginPath();
    ctx.moveTo(pts[i][0], pts[i][1]);
    ctx.lineTo(pts[i + 1][0], pts[i + 1][1]);
    ctx.stroke();
  }
  ctx.restore();
}

// A thread of light along a cubic Bezier p0..p3, drawn from 0 to `draw` (0..1), with a pulse that
// travels along it. Colours for a light page (dark teal) or the dark aurora (mint).
export function drawThread(ctx, p0, p1, p2, p3, draw, t, { alpha = 1, onLight = 1, width = 2.2, hue = null, seed = 0 } = {}) {
  if (draw <= 0.002 || alpha <= 0.002) return;
  const N = 48;
  const pt = (u) => {
    const m = 1 - u;
    return [
      m * m * m * p0[0] + 3 * m * m * u * p1[0] + 3 * m * u * u * p2[0] + u * u * u * p3[0],
      m * m * m * p0[1] + 3 * m * m * u * p1[1] + 3 * m * u * u * p2[1] + u * u * u * p3[1],
    ];
  };
  const n = Math.max(2, Math.round(N * draw));
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalCompositeOperation = onLight > 0.5 ? "source-over" : "lighter";
  const glowC = onLight > 0.5 ? "45,212,191" : "120,245,220";
  const coreC = onLight > 0.5 ? (hue || "15,140,120") : "230,255,250";
  for (const [w, a, c] of [[width * 5, 0.16, glowC], [width * 2.2, 0.32, glowC], [width, 0.95, coreC]]) {
    ctx.strokeStyle = `rgba(${c},${a * alpha})`;
    ctx.lineWidth = w;
    ctx.beginPath();
    for (let i = 0; i <= n; i++) {
      const p = pt((i / n) * draw);
      if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
    }
    ctx.stroke();
  }
  // The travelling pulse, and a bright head while it draws.
  const head = pt(draw);
  radial(ctx, head[0], head[1], width * 6, [[0, `rgba(${onLight > 0.5 ? "20,180,160" : "220,255,250"},${0.8 * alpha * (draw < 1 ? 1 : 0)})`], [1, "rgba(255,255,255,0)"]]);
  if (draw >= 1) {
    const u = (t * 0.55 + seed) % 1;
    const p = pt(u);
    radial(ctx, p[0], p[1], width * 5, [[0, `rgba(${onLight > 0.5 ? "20,190,170" : "230,255,250"},${0.85 * alpha})`], [1, "rgba(255,255,255,0)"]]);
  }
  ctx.restore();
}

// The glow along the screen's edges: a soft gradient that moves around the frame.
export function drawEdgeGlow(ctx, t, k) {
  if (k <= 0.002) return;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const g = ctx.createConicGradient(t * 0.55, 960, 540);
  const stops = [[0, "110,240,205"], [0.22, "90,200,255"], [0.45, "170,140,255"], [0.62, "110,240,205"], [0.8, "120,170,255"], [1, "110,240,205"]];
  for (const [w, a] of [[110, 0.05], [64, 0.09], [34, 0.16], [14, 0.32], [5, 0.55]]) {
    const gg = ctx.createConicGradient(t * 0.55, 960, 540);
    for (const [o, c] of stops) gg.addColorStop(o, `rgba(${c},${a * k})`);
    ctx.strokeStyle = gg;
    ctx.lineWidth = w;
    ctx.beginPath();
    ctx.roundRect(3, 3, 1914, 1074, 40);
    ctx.stroke();
  }
  ctx.restore();
  return g;
}

// A ring of light that spreads from a point (the click).
export function drawRipple(ctx, x, y, k, onLight = 1, size = 260) {
  if (k <= 0 || k >= 1) return;
  ctx.save();
  ctx.globalCompositeOperation = onLight > 0.5 ? "source-over" : "lighter";
  const r = 20 * (size / 260) + size * k;
  ctx.strokeStyle = `rgba(${onLight > 0.5 ? "22,160,120" : "140,250,225"},${0.6 * (1 - k)})`;
  ctx.lineWidth = 3 + 10 * (1 - k);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

// The moment the light is born at the button: a soft burst and a four-point star.
export function drawIgnite(ctx, x, y, k) {
  if (k <= 0 || k >= 1) return;
  ctx.save();
  const a = Math.sin(Math.PI * Math.min(1, k * 1.6)) * (1 - k);
  radial(ctx, x, y, 60 + 300 * k, [[0, `rgba(255,255,255,${0.95 * a})`], [0.25, `rgba(150,248,225,${0.7 * a})`], [1, "rgba(120,240,215,0)"]]);
  ctx.translate(x, y);
  ctx.rotate(k * 0.6);
  for (const [sx, sy] of [[1, 0.035], [0.035, 1]]) {
    ctx.save();
    ctx.scale(sx, sy);
    radial(ctx, 0, 0, 120 + 420 * k, [[0, `rgba(255,255,255,${0.9 * a})`], [0.4, `rgba(160,250,230,${0.4 * a})`], [1, "rgba(160,250,230,0)"]]);
    ctx.restore();
  }
  ctx.restore();
}

// A trail of fading light behind the Peer as it moves (screen points, newest first).
export function drawOrbTrail(ctx, pts, onLight = 0) {
  if (pts.length < 2) return;
  ctx.save();
  ctx.globalCompositeOperation = onLight > 0.5 ? "source-over" : "lighter";
  for (let i = 1; i < pts.length; i++) {
    const [x, y, r] = pts[i];
    const f = 1 - i / pts.length;
    const c = onLight > 0.5 ? "30,200,175" : "140,250,228";
    radial(ctx, x, y, r * (1.6 + 1.4 * f), [[0, `rgba(${c},${0.32 * f * f})`], [1, `rgba(${c},0)`]]);
  }
  ctx.restore();
}
