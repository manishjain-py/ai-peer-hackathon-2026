// Tag: small helpers for drawing a frame. Every value is computed from t on every frame; the
// cached values below only skip writing a style that is already the same.
import { clamp, lerp, ease, prog } from "../shared/kit.js";

// Show an element with an opacity and a transform (hidden below a hair of opacity).
export function put(e, o = 1, tf = "") {
  const on = o > 0.003;
  const d = on ? "" : "none";
  if (e._d !== d) { e.style.display = d; e._d = d; }
  if (!on) return;
  const os = o >= 0.999 ? "1" : o.toFixed(3);
  if (e._o !== os) { e.style.opacity = os; e._o = os; }
  if (e._t !== tf) { e.style.transform = tf; e._t = tf; }
}
export function css(e, k, v) {
  const key = "_c" + k;
  if (e[key] !== v) { e.style[k] = v; e[key] = v; }
}
export function txt(e, s) { if (e.textContent !== s) e.textContent = s; }
export function cls(e, name, on) { if (e.classList.contains(name) !== !!on) e.classList.toggle(name, !!on); }

export const f1 = (v) => (Math.round(v * 10) / 10).toString();
export const f3 = (v) => (Math.round(v * 1000) / 1000).toString();
export const tr = (x, y, s = 1, r = 0) =>
  `translate(${f1(x)}px, ${f1(y)}px)` + (s !== 1 ? ` scale(${f3(s)})` : "") + (r ? ` rotate(${f3(r)}deg)` : "");

// 0 -> 1 eased over [a, b].
export const io = (t, a, b, e = ease.inOutCubic) => e(prog(t, a, b));
// In over [a, a + d], out over [b - d, b].
export const win = (t, a, b, din = 0.25, dout = din) => Math.min(prog(t, a, a + din), 1 - prog(t, b - dout, b));
// A pop: 0 -> overshoot -> 1 (outBack), from a over d.
export const pop = (t, a, d = 0.35, s = 1.8) => (t <= a ? 0 : t >= a + d ? 1 : ease.outBack(prog(t, a, a + d), s));
// A damped wobble after t0 (for settles): amplitude a, frequency f, decay k.
export const wob = (t, t0, a = 1, f = 3.2, k = 7) => (t < t0 ? 0 : a * Math.exp(-k * (t - t0)) * Math.sin(2 * Math.PI * f * (t - t0)));

// A rectangle tween: from {x, y, w, h} to {x, y, w, h}.
export const rlerp = (a, b, k) => ({ x: lerp(a.x, b.x, k), y: lerp(a.y, b.y, k), w: lerp(a.w, b.w, k), h: lerp(a.h, b.h, k) });
// The transform that draws an element laid out at `base` (x, y, w, h) at the rectangle `r`
// (origin top-left; uniform scale by width, centred vertically on the target).
export function fit(base, r) {
  const s = r.w / base.w;
  const y = r.y + (r.h - base.h * s) / 2;
  return `translate(${f1(r.x - base.x)}px, ${f1(y - base.y)}px) scale(${f3(s)})`;
}

// A path drawn from 0 to k of its length with a dash (len: its length, measured once in init).
export function drawPath(p, k, len) {
  const L = len || 4000;
  p.setAttribute("stroke-dasharray", `${f1(L)} ${f1(L)}`);
  p.setAttribute("stroke-dashoffset", f1(L * (1 - clamp(k))));
}

// The camera: [cx, cy, s] -> a function from page px to frame px, and its CSS transform.
export const camT = (c) => `translate(960px, 540px) scale(${c[2].toFixed(5)}) translate(${(-c[0]).toFixed(2)}px, ${(-c[1]).toFixed(2)}px)`;
export const toScreen = (c, p) => [(p[0] - c[0]) * c[2] + 960, (p[1] - c[1]) * c[2] + 540];

// Seconds since a moment, as a 0..1 decay (for little reactions).
export const since = (t, t0, d) => clamp((t - t0) / d);

export { clamp, lerp, ease, prog };
