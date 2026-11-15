// Small helpers for drawing a frame from the time t. All pure: nothing here keeps state.

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, k) => a + (b - a) * k;
export const mix = lerp;
// Progress 0..1 of t through [a, b].
export const prog = (t, a, b) => (b <= a ? (t >= b ? 1 : 0) : clamp((t - a) / (b - a)));
export const smoothstep = (a, b, x) => { const k = prog(x, a, b); return k * k * (3 - 2 * k); };
// 0 -> 1 -> 0 over [a, b], with soft edges of length e at each end.
export const pulse = (t, a, b, e = 0.25) => Math.min(prog(t, a, a + e), 1 - prog(t, b - e, b));

export const ease = {
  linear: (k) => k,
  inQuad: (k) => k * k,
  outQuad: (k) => 1 - (1 - k) * (1 - k),
  inOutQuad: (k) => (k < 0.5 ? 2 * k * k : 1 - Math.pow(-2 * k + 2, 2) / 2),
  inCubic: (k) => k * k * k,
  outCubic: (k) => 1 - Math.pow(1 - k, 3),
  inOutCubic: (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
  outQuart: (k) => 1 - Math.pow(1 - k, 4),
  inOutQuart: (k) => (k < 0.5 ? 8 * k ** 4 : 1 - Math.pow(-2 * k + 2, 4) / 2),
  outQuint: (k) => 1 - Math.pow(1 - k, 5),
  outExpo: (k) => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k)),
  inOutExpo: (k) => (k <= 0 ? 0 : k >= 1 ? 1 : k < 0.5 ? Math.pow(2, 20 * k - 10) / 2 : (2 - Math.pow(2, -20 * k + 10)) / 2),
  inOutSine: (k) => -(Math.cos(Math.PI * k) - 1) / 2,
  outSine: (k) => Math.sin((k * Math.PI) / 2),
  // Overshoots a little, then settles: for things that pop into place.
  outBack: (k, s = 1.70158) => 1 + (s + 1) * Math.pow(k - 1, 3) + s * Math.pow(k - 1, 2),
  inBack: (k, s = 1.70158) => (s + 1) * k * k * k - s * k * k,
};

// A spring from 0 to 1 that starts at t0, as a closed form (so any frame can be drawn alone).
// freq: oscillations per second; damp: 0..1 (higher settles sooner).
export function spring(t, t0, freq = 2.2, damp = 0.32) {
  const x = t - t0;
  if (x <= 0) return 0;
  const w = 2 * Math.PI * freq;
  const z = clamp(damp, 0.01, 0.99);
  const wd = w * Math.sqrt(1 - z * z);
  return 1 - Math.exp(-z * w * x) * (Math.cos(wd * x) + ((z * w) / wd) * Math.sin(wd * x));
}

// Tween a number from `from` to `to` over [a, b] with an easing.
export const tween = (t, a, b, from, to, e = ease.inOutCubic) => lerp(from, to, e(prog(t, a, b)));

// Keyframes: [[t0, v0], [t1, v1], ...] with numbers or arrays of numbers; eased between keys.
export function keys(t, list, e = ease.inOutCubic) {
  if (t <= list[0][0]) return list[0][1];
  for (let i = 0; i < list.length - 1; i++) {
    const [ta, va] = list[i], [tb, vb] = list[i + 1];
    if (t <= tb) {
      const k = e(prog(t, ta, tb));
      return Array.isArray(va) ? va.map((v, j) => lerp(v, vb[j], k)) : lerp(va, vb, k);
    }
  }
  return list[list.length - 1][1];
}

// Stagger: the progress (0..1) of item i of a list that starts at a, one item every `step`
// seconds, each taking `dur`.
export const stagger = (t, a, i, step, dur, e = ease.outCubic) => e(prog(t, a + i * step, a + i * step + dur));

// Text typed at `cps` characters a second from a (whole characters only).
export const typed = (text, t, a, cps = 28) => text.slice(0, Math.max(0, Math.floor((t - a) * cps)));
// The time typing of `text` at `cps` ends, if it starts at a.
export const typedEnd = (text, a, cps = 28) => a + text.length / cps;

// Seeded random (mulberry32): rng(seed)() gives the same numbers on every frame and every run.
export function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let x = s;
    x = Math.imul(x ^ (x >>> 15), x | 1);
    x ^= x + Math.imul(x ^ (x >>> 7), x | 61);
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}

// Smooth 1D value noise in [-1, 1]: for idle bobbing, drift, flicker. Same value for the same x.
export function noise(x, seed = 1) {
  const h = (n) => {
    const s = Math.sin(n * 127.1 + seed * 311.7) * 43758.5453;
    return s - Math.floor(s);
  };
  const i = Math.floor(x), f = x - i;
  const u = f * f * (3 - 2 * f);
  return lerp(h(i), h(i + 1), u) * 2 - 1;
}

// Points on curves.
export const bezier = (p0, p1, p2, p3, k) => {
  const m = 1 - k;
  return p0.map((_, j) => m * m * m * p0[j] + 3 * m * m * k * p1[j] + 3 * m * k * k * p2[j] + k * k * k * p3[j]);
};
// Catmull-Rom through a list of points ([x, y] or [x, y, z]); k in 0..1 along the whole path.
export function path(points, k) {
  const n = points.length - 1;
  const f = clamp(k) * n;
  const i = Math.min(n - 1, Math.floor(f));
  const u = f - i;
  const p0 = points[Math.max(0, i - 1)], p1 = points[i], p2 = points[i + 1], p3 = points[Math.min(n, i + 2)];
  return p1.map((_, j) => {
    const a = p0[j], b = p1[j], c = p2[j], d = p3[j];
    return 0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u * u + (-a + 3 * b - 3 * c + d) * u * u * u);
  });
}

// DOM helpers.
export function el(tag, cls, parent, html) {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (html != null) e.innerHTML = html;
  if (parent) parent.appendChild(e);
  return e;
}
export const css = (e, styles) => Object.assign(e.style, styles);
// Show or hide without layout cost when hidden.
export const show = (e, on) => { const v = on ? "" : "none"; if (e.style.display !== v) e.style.display = v; };
// Set text only when it changes (cheaper on long frames).
export const text = (e, s) => { if (e.textContent !== s) e.textContent = s; };

// Load and decode an image (call in init, never in render).
export async function image(src) {
  const img = new Image();
  img.src = src;
  await img.decode();
  return img;
}

// Format seconds as the product shows step times: "6.4 s".
export const secs = (s) => `${s.toFixed(1)} s`;
