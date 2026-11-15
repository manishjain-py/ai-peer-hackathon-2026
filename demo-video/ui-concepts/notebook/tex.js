// Textures drawn in code, once, in init: the oak desk, cream paper with faint rules, the green
// cloth of the cover, an ink grain for rubber stamps, a film grain, and the morning window light
// with its leaf shadows. Each becomes a blob URL whose image is decoded before the first frame.
import { rng } from "../shared/kit.js";

const keep = [];

// Seeded 2D value noise in 0..1.
function noise2(seed) {
  const r = rng(seed);
  const p = [];
  const vals = new Float32Array(256);
  for (let i = 0; i < 256; i++) { p.push(i); vals[i] = r(); }
  for (let i = 255; i > 0; i--) { const j = Math.floor(r() * (i + 1)); const s = p[i]; p[i] = p[j]; p[j] = s; }
  const perm = new Uint16Array(512);
  for (let i = 0; i < 512; i++) perm[i] = p[i & 255];
  return (x, y) => {
    const xi = Math.floor(x), yi = Math.floor(y);
    const xf = x - xi, yf = y - yi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
    const X = xi & 255, Y = yi & 255;
    const a = vals[perm[perm[X] + Y]], b = vals[perm[perm[X + 1] + Y]];
    const c = vals[perm[perm[X] + Y + 1]], d = vals[perm[perm[X + 1] + Y + 1]];
    const top = a + (b - a) * u, bot = c + (d - c) * u;
    return top + (bot - top) * v;
  };
}

function cv(w, h) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  return c;
}

async function toUrl(c, type = "image/png", q = 0.92) {
  const blob = await new Promise((res) => c.toBlob(res, type, q));
  const u = URL.createObjectURL(blob);
  const img = new Image();
  img.src = u;
  await img.decode();
  keep.push(img);
  return u;
}

// Honey oak, planks running left to right, with grain lines, fibres and seams. Drawn at half the
// desk's size (it is shown at 2x, a little soft, like a shallow depth of field).
function oak(w, h, seed) {
  const c = cv(w, h), g = c.getContext("2d");
  const d = g.createImageData(w, h), px = d.data;
  const n1 = noise2(seed), n2 = noise2(seed + 1), n3 = noise2(seed + 2), n4 = noise2(seed + 3);
  const plank = 262;
  for (let y = 0; y < h; y++) {
    const pi = Math.floor(y / plank), py = y - pi * plank;
    const off = pi * 173.7;
    for (let x = 0; x < w; x++) {
      const X = x + off * 5.3, Y = y + off;
      const warp = n1(X * 0.0032, Y * 0.02) * 2.6 + n2(X * 0.0008, Y * 0.0055) * 6.0;
      const ring = Y * 0.048 + warp;
      const band = 0.5 + 0.5 * Math.sin(ring * Math.PI * 2);
      const line = Math.pow(band, 7);
      const fib = n3(X * 0.22, Y * 0.85) - 0.5;
      const low = n4(X * 0.0018, Y * 0.0042) - 0.5;
      const k = 0.2 * line + 0.1 * band * band + 0.09 * fib + 0.16 * low;
      let R = 192 - 74 * k, G = 150 - 64 * k, B = 110 - 48 * k;
      if (py < 2) { R *= 0.6; G *= 0.57; B *= 0.55; }
      else if (py < 5) { R *= 0.86; G *= 0.85; B *= 0.84; }
      else if (py > plank - 3) { R *= 1.06; G *= 1.05; B *= 1.04; }
      const i = (y * w + x) * 4;
      px[i] = R; px[i + 1] = G; px[i + 2] = B; px[i + 3] = 255;
    }
  }
  g.putImageData(d, 0, 0);
  return c;
}

// Cream paper: soft mottling, a fine grain, a few fibres, and optionally faint ruled lines.
export const RULE_TOP = 112, RULE_GAP = 38;
function paper(w, h, seed, base, ruled) {
  const c = cv(w, h), g = c.getContext("2d");
  const d = g.createImageData(w, h), px = d.data;
  const n1 = noise2(seed), n2 = noise2(seed + 7);
  const r = rng(seed + 11);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const mott = (n1(x * 0.011, y * 0.011) - 0.5) * 0.04 + (n2(x * 0.06, y * 0.06) - 0.5) * 0.02;
    const f = 1 + mott + (r() - 0.5) * 0.04;
    const i = (y * w + x) * 4;
    px[i] = base[0] * f; px[i + 1] = base[1] * f; px[i + 2] = base[2] * f; px[i + 3] = 255;
  }
  g.putImageData(d, 0, 0);
  g.lineCap = "round";
  for (let k = 0; k < 120; k++) {
    const x = r() * w, y = r() * h, a = r() * Math.PI, l = 5 + r() * 15;
    g.strokeStyle = `rgba(120, 100, 70, ${0.04 + r() * 0.05})`;
    g.lineWidth = 0.5 + r() * 0.5;
    g.beginPath();
    g.moveTo(x, y);
    g.quadraticCurveTo(x + Math.cos(a) * l * 0.5 + (r() - 0.5) * 5, y + Math.sin(a) * l * 0.5 + (r() - 0.5) * 5, x + Math.cos(a) * l, y + Math.sin(a) * l);
    g.stroke();
  }
  if (ruled) {
    for (let y = RULE_TOP; y < h - 40; y += RULE_GAP) {
      g.fillStyle = "rgba(92, 118, 150, 0.16)";
      g.fillRect(0, y, w, 1);
      g.fillStyle = "rgba(92, 118, 150, 0.05)";
      g.fillRect(0, y + 1, w, 1);
    }
  }
  return c;
}

// Deep green bookcloth: a linen weave of fine threads.
function cloth(w, h, seed) {
  const c = cv(w, h), g = c.getContext("2d");
  const d = g.createImageData(w, h), px = d.data;
  const n1 = noise2(seed), n2 = noise2(seed + 1), n3 = noise2(seed + 2);
  const r = rng(seed + 3);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    const warp = (n1(x * 0.9, y * 0.06) - 0.5) * 0.14;
    const weft = (n2(x * 0.06, y * 0.9) - 0.5) * 0.14;
    const low = (n3(x * 0.008, y * 0.008) - 0.5) * 0.1;
    const f = 1 + warp + weft + low + (r() - 0.5) * 0.06;
    const i = (y * w + x) * 4;
    px[i] = 29 * f; px[i + 1] = 72 * f; px[i + 2] = 57 * f; px[i + 3] = 255;
  }
  g.putImageData(d, 0, 0);
  return c;
}

// A white mask with holes and speckles: rubber-stamp ink never lands evenly.
function inkGrain(w, h, seed) {
  const c = cv(w, h), g = c.getContext("2d");
  const d = g.createImageData(w, h), px = d.data;
  const n1 = noise2(seed), n2 = noise2(seed + 1);
  const r = rng(seed + 2);
  for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
    let a = 0.9 + (n1(x * 0.06, y * 0.06) - 0.5) * 0.55 + (n2(x * 0.3, y * 0.3) - 0.5) * 0.35 + (r() - 0.5) * 0.35;
    if (a < 0.5) a *= 0.25;
    a = Math.max(0, Math.min(1, a));
    const i = (y * w + x) * 4;
    px[i] = 255; px[i + 1] = 255; px[i + 2] = 255; px[i + 3] = a * 255;
  }
  g.putImageData(d, 0, 0);
  return c;
}

// Film grain: grey noise around the middle, shown at a low opacity, moved every frame.
function filmGrain(w, h, seed) {
  const c = cv(w, h), g = c.getContext("2d");
  const d = g.createImageData(w, h), px = d.data;
  const r = rng(seed);
  for (let i = 0; i < w * h; i++) {
    const v = 128 + (r() - 0.5) * 255;
    px[i * 4] = v; px[i * 4 + 1] = v; px[i * 4 + 2] = v; px[i * 4 + 3] = 255;
  }
  g.putImageData(d, 0, 0);
  return c;
}

// The window: four panes of morning light falling across the desk at an angle.
function panes(g, w, h, fill) {
  g.save();
  g.translate(w * 0.43, h * 0.47);
  g.rotate(-0.2);
  g.transform(1, 0, -0.32, 1, 0, 0);
  g.fillStyle = fill;
  const pw = 330, ph = 250, m = 26;
  for (let i = 0; i < 2; i++) for (let j = 0; j < 2; j++) {
    g.fillRect(-pw - m / 2 + i * (pw + m), -ph - m / 2 + j * (ph + m), pw, ph);
  }
  g.restore();
}
function windowShade(w, h) {
  const c = cv(w, h), g = c.getContext("2d");
  g.fillStyle = "rgb(207, 198, 188)";
  g.fillRect(0, 0, w, h);
  g.filter = "blur(30px)";
  panes(g, w, h, "rgb(255, 255, 255)");
  g.filter = "none";
  return c;
}
function windowLight(w, h) {
  const c = cv(w, h), g = c.getContext("2d");
  g.fillStyle = "rgb(0, 0, 0)";
  g.fillRect(0, 0, w, h);
  g.filter = "blur(36px)";
  panes(g, w, h, "rgb(255, 236, 205)");
  g.filter = "blur(120px)";
  g.fillStyle = "rgba(255, 226, 180, 0.4)";
  g.beginPath();
  g.ellipse(w * 0.3, h * 0.35, w * 0.3, h * 0.32, -0.3, 0, Math.PI * 2);
  g.fill();
  g.filter = "none";
  return c;
}

// A sprig of leaves outside the window, as soft shadows.
function leafShadows(w, h, seed) {
  const c = cv(w, h), g = c.getContext("2d");
  const r = rng(seed);
  g.filter = "blur(9px)";
  g.fillStyle = "rgb(58, 66, 46)";
  g.strokeStyle = "rgb(58, 66, 46)";
  g.lineWidth = 7;
  g.beginPath();
  g.moveTo(w * 0.02, h * 0.08);
  g.bezierCurveTo(w * 0.3, h * 0.25, w * 0.45, h * 0.4, w * 0.72, h * 0.8);
  g.stroke();
  for (let k = 0; k < 14; k++) {
    const s = k / 13;
    const x = w * (0.04 + 0.66 * s) + (r() - 0.5) * 40, y = h * (0.1 + 0.68 * s * s * 0.9 + 0.1 * s) + (r() - 0.5) * 40;
    const side = k % 2 ? 1 : -1;
    const a = 0.55 + side * (0.75 + r() * 0.4);
    const L = 70 + r() * 50, W = 22 + r() * 12;
    g.save();
    g.translate(x, y);
    g.rotate(a);
    g.beginPath();
    g.moveTo(0, 0);
    g.quadraticCurveTo(L * 0.5, -W, L, 0);
    g.quadraticCurveTo(L * 0.5, W, 0, 0);
    g.fill();
    g.restore();
  }
  g.filter = "none";
  return c;
}

export async function makeTextures() {
  const T = {};
  T.oak = await toUrl(oak(1700, 1060, 11), "image/jpeg", 0.9);
  T.paper = await toUrl(paper(640, 820, 21, [249, 246, 237], true), "image/jpeg", 0.93);
  T.plain = await toUrl(paper(640, 820, 22, [249, 246, 237], false), "image/jpeg", 0.93);
  T.card = await toUrl(paper(400, 800, 23, [251, 248, 239], false), "image/jpeg", 0.93);
  T.clip = await toUrl(paper(480, 300, 24, [253, 252, 248], false), "image/jpeg", 0.93);
  T.end = await toUrl(paper(640, 820, 25, [237, 241, 230], false), "image/jpeg", 0.93);
  T.sticky = await toUrl(paper(420, 280, 26, [255, 231, 128], false), "image/jpeg", 0.93);
  T.cloth = await toUrl(cloth(680, 860, 31), "image/jpeg", 0.9);
  T.grain = await toUrl(inkGrain(320, 320, 41));
  T.film = await toUrl(filmGrain(256, 256, 51));
  T.shade = await toUrl(windowShade(1400, 900), "image/jpeg", 0.9);
  T.light = await toUrl(windowLight(1400, 900), "image/jpeg", 0.9);
  T.leaves = await toUrl(leafShadows(900, 700, 71));
  return T;
}
