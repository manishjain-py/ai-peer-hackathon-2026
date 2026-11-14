// Small helpers shared by every scene. Everything here is a pure function of its inputs:
// the film is drawn frame by frame, out of order, so nothing may remember the previous frame.

export const INK = "#152b31";
export const PAPER = "#f6f4ee";
export const MINT = "#b7f4cf";
export const GREEN = "#167353";

export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, k) => a + (b - a) * k;
/** 0 before a, 1 after b, linear between. */
export const ramp = (t, a, b) => (b === a ? (t >= b ? 1 : 0) : clamp((t - a) / (b - a)));

export const ease = {
  linear: (k) => k,
  out: (k) => 1 - Math.pow(1 - k, 3),
  outQuint: (k) => 1 - Math.pow(1 - k, 5),
  in: (k) => k * k * k,
  inOut: (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2),
  outBack: (k) => 1 + 2.2 * Math.pow(k - 1, 3) + 1.2 * Math.pow(k - 1, 2),
  expoOut: (k) => (k >= 1 ? 1 : 1 - Math.pow(2, -10 * k)),
};

/** Eased 0..1 over [a, b]. */
export const tween = (t, a, b, fn = ease.out) => fn(ramp(t, a, b));

/** In over `inS` after `start`, out over `outS` before `end`: the envelope of a thing on screen. */
export function envelope(t, start, end, inS = 0.3, outS = 0.25, fnIn = ease.out, fnOut = ease.in) {
  if (t < start || t >= end) return 0;
  return Math.min(fnIn(ramp(t, start, start + inS)), 1 - fnOut(ramp(t, end - outS, end)));
}

/** Deterministic random numbers: the same seed gives the same film on every render worker. */
export function prng(seed) {
  let a = seed >>> 0;
  return () => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Keyframes: [{t, ...numbers}] sorted by t. Returns the values at time t, eased between
 * neighbours (smooth by default), held before the first and after the last.
 */
export function keyframes(frames, t, fn = ease.inOut) {
  if (!frames.length) return {};
  if (t <= frames[0].t) return frames[0];
  const last = frames[frames.length - 1];
  if (t >= last.t) return last;
  let i = 1;
  while (frames[i].t < t) i++;
  const a = frames[i - 1];
  const b = frames[i];
  const k = (b.ease ? ease[b.ease] : fn)(ramp(t, a.t, b.t));
  const out = { t };
  for (const key of Object.keys(b)) {
    if (key === "t" || key === "ease") continue;
    out[key] = typeof b[key] === "number" && typeof a[key] === "number" ? lerp(a[key], b[key], k) : k < 1 ? a[key] : b[key];
  }
  return out;
}

/** Make an element. el("div.card.big", {text, html, style, attrs}, ...children) */
export function el(spec, props = {}, ...children) {
  const [tag, ...classes] = spec.split(".");
  const node = document.createElement(tag || "div");
  if (classes.length) node.className = classes.join(" ");
  if (props.text != null) node.textContent = props.text;
  if (props.html != null) node.innerHTML = props.html;
  if (props.id) node.id = props.id;
  if (props.style) Object.assign(node.style, props.style);
  if (props.attrs) for (const [k, v] of Object.entries(props.attrs)) node.setAttribute(k, v);
  for (const c of children.flat()) if (c) node.append(c);
  return node;
}

/** Show or hide without touching layout of the others. */
export function show(node, on) {
  const want = on ? "" : "none";
  if (node.style.display !== want) node.style.display = want;
}

export const px = (n) => `${Math.round(n * 100) / 100}px`;

/** 0:07.4 style clock of a film time. */
export function clock(t) {
  const m = Math.floor(t / 60);
  const s = t - m * 60;
  return `${m}:${s.toFixed(1).padStart(4, "0")}`;
}
