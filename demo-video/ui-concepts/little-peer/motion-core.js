// The motion engine for the Peer, all pure functions of t: hops and zips with anticipation,
// take-off stretch, an arc, a landing squash that settles; hands that blend between rest and
// actions; quick eye saccades; face tracks; sparkle trails and bursts.
import { clamp, lerp, prog, ease, rng } from "../shared/kit.js";

const mixv = (a, b, k) => a.map((v, i) => lerp(v, b[i], k));

// A place is [x, y, g]: the base point, and how far it hovers above its ground (for the shadow).
// moves: [{ t0, t1, to: [x, y, g], h, kind: "hop" | "zip" | "glide" | "follow", fn }]
export function makeBody(start, moves) {
  const ms = moves.slice().sort((a, b) => a.t0 - b.t0);
  let p = start;
  ms.forEach((m) => { m.from = p; p = m.kind === "follow" ? m.fn(m.t1) : m.to; m.end = p; });

  function air(t, m) {
    const k = prog(t, m.t0, m.t1);
    const a = m.from, b = m.kind === "follow" ? m.fn(t) : m.to;
    const dx = b[0] - a[0];
    const dir = clamp(dx / 260, -1, 1);
    let x, y, g, sx = 1, sy = 1, rot = 0;
    if (m.kind === "follow") {
      [x, y, g] = b;
      rot = 0;
    } else if (m.kind === "glide") {
      const e = ease.inOutSine(k);
      x = lerp(a[0], b[0], e); y = lerp(a[1], b[1], e) - (m.h || 0) * 4 * e * (1 - e); g = lerp(a[2], b[2], e);
      rot = dir * 6 * Math.sin(Math.PI * k);
    } else if (m.kind === "zip") {
      const e = ease.inOutCubic(k);
      x = lerp(a[0], b[0], e); y = lerp(a[1], b[1], e) - (m.h ?? 50) * 4 * e * (1 - e); g = lerp(a[2], b[2], e);
      const sp = Math.sin(Math.PI * k);
      rot = dir * 18 * sp;
      sx = 1 + 0.12 * sp; sy = 1 - 0.1 * sp;
    } else {
      const kx = lerp(k, ease.inOutSine(k), 0.4);
      x = lerp(a[0], b[0], kx);
      y = lerp(a[1], b[1], k) - (m.h ?? 120) * 4 * k * (1 - k);
      g = lerp(a[2], b[2], k);
      const st = 1 - ease.outQuad(clamp(k / 0.32));
      const fall = prog(k, 0.72, 1) * 0.08;
      sy = 1 + 0.22 * st + fall; sx = 1 - 0.13 * st - fall * 0.6;
      rot = dir * 9 * Math.sin(Math.PI * k) + (m.spin || 0) * 360 * ease.inOutCubic(k);
    }
    return { x, y, g, ground: lerp(a[1] + a[2], b[1] + b[2], k), sx, sy, rot, air: true, kind: m.kind };
  }

  return function bodyAt(t) {
    let from = start, prev = null, next = null;
    for (const m of ms) {
      if (t < m.t0) { next = m; break; }
      if (t <= m.t1) return air(t, m);
      prev = m; from = m.end;
    }
    let [x, y, g] = from;
    let sx = 1, sy = 1, rot = 0;
    // Landing: squash, then a damped settle.
    if (prev && (prev.kind === "hop" || prev.kind === "zip")) {
      const d = t - prev.t1;
      if (d < 0.8) {
        const amp = prev.kind === "zip" ? 0.14 : 0.23;
        const q = amp * Math.exp(-d * 9) * Math.cos(d * 23);
        sy -= q; sx += q * 0.75;
      }
    }
    // Anticipation before the next hop.
    if (next && (next.kind === "hop" || next.kind === "zip")) {
      const A = next.kind === "zip" ? 0.1 : 0.17;
      const a = ease.inOutSine(prog(t, next.t0 - A, next.t0));
      sy -= 0.16 * a; sx += 0.13 * a;
      const dir = clamp((next.to[0] - x) / 260, -1, 1);
      rot -= dir * 6 * a;
    }
    // Breathing, and a hover bob when it floats.
    const br = Math.sin(t * 2 * Math.PI * 0.75);
    sy += 0.018 * br; sx -= 0.012 * br;
    if (g > 2) y += Math.sin(t * 2 * Math.PI * 0.55) * Math.min(6, g * 0.15);
    return { x, y, g, ground: from[1] + from[2], sx, sy, rot, air: false };
  };
}

// A step track: [[t, value], ...]; each key blends in from the previous value over `dur`.
export function track(list, t, dur = 0.14, e = ease.inOutSine) {
  if (!list.length) return 0;
  if (t <= list[0][0]) return list[0][1];
  let i = 0;
  while (i + 1 < list.length && list[i + 1][0] <= t) i++;
  const [ti, vi] = list[i];
  if (i === 0) return vi;
  const vp = list[i - 1][1];
  const k = e(prog(t, ti, ti + dur));
  return Array.isArray(vi) ? mixv(vp, vi, k) : lerp(vp, vi, k);
}

// Blinks: each a 0.16 s close-and-open.
export function blinkAt(t, times) {
  let b = 0;
  for (const tb of times) {
    const d = Math.abs(t - tb);
    if (d < 0.08) b = Math.max(b, 1 - d / 0.08);
  }
  return b;
}
export function blinkTimes(from, to, seed, extra = []) {
  const r = rng(seed);
  const out = [];
  for (let t = from + 1.2; t < to; t += 2.4 + r() * 1.6) out.push(t);
  return out.concat(extra).sort((a, b) => a - b);
}

// Hands: rest point plus actions [{ a, b, fn(t, body) -> [x, y, s?], in, out }], blended in order.
export function handAt(rest, actions, t, body) {
  let p = rest.slice();
  for (const ac of actions) {
    if (t < ac.a || t > ac.b) continue;
    const wi = ac.in ?? 0.14, wo = ac.out ?? 0.16;
    const w = Math.min(ease.inOutSine(prog(t, ac.a, ac.a + wi)), 1 - ease.inOutSine(prog(t, ac.b - wo, ac.b)));
    const q = ac.fn(t, body);
    p = [lerp(p[0], q[0], w), lerp(p[1], q[1], w), lerp(p[2] ?? 1, q[2] ?? 1, w)];
  }
  return p;
}

// The direction the eyes look, -1..1 each way, toward a world point.
export function lookToward(eye, target) {
  const dx = target[0] - eye[0], dy = target[1] - eye[1];
  const len = Math.hypot(dx, dy) || 1;
  const m = Math.min(1, len / 140);
  return [(dx / len) * m, (dy / len) * m * 0.9];
}

// Sparkles: a trail along pos(t) between t0 and t1, and bursts at a point.
export function trail(out, t, t0, t1, pos, o = {}) {
  const rate = o.rate ?? 55, life = o.life ?? 0.55, size = o.size ?? 9, seed = o.seed ?? 3;
  const n0 = Math.max(0, Math.floor((t - life - t0) * rate)), n1 = Math.floor((Math.min(t, t1) - t0) * rate);
  for (let j = n0; j <= n1; j++) {
    const tb = t0 + j / rate;
    const age = t - tb;
    if (age < 0 || age > life || tb > t1) continue;
    const r = rng(seed * 1000 + j);
    const [x, y] = pos(tb);
    const k = age / life;
    out.push({
      x: x + (r() - 0.5) * (o.spread ?? 34) + (r() - 0.5) * 40 * age,
      y: y + (r() - 0.5) * (o.spread ?? 34) - 30 * age + (o.fallY ?? 0) * age,
      s: size * (0.5 + r()) * (1 - k * 0.7), r: r() * 90 + age * 200, a: (1 - k) * (o.alpha ?? 0.95),
      c: (o.colors || ["#ffffff", "#d9ffe9", "#fff3b0"])[j % (o.colors ? o.colors.length : 3)],
    });
  }
}
export function burst(out, t, at, p, o = {}) {
  const n = o.n ?? 16, life = o.life ?? 0.6, speed = o.speed ?? 170;
  const age = t - at;
  if (age < 0 || age > life) return;
  const r = rng(o.seed ?? 9);
  const k = age / life;
  for (let i = 0; i < n; i++) {
    const ang = (i / n) * Math.PI * 2 + r() * 0.5;
    const v = speed * (0.6 + 0.6 * r());
    const d = v * ease.outCubic(k) * life;
    out.push({ x: p[0] + Math.cos(ang) * d, y: p[1] + Math.sin(ang) * d * 0.8 - 20 * k, s: (o.size ?? 11) * (0.6 + 0.7 * r()) * (1 - k * 0.8),
      r: r() * 90 + k * 160, a: (1 - k) * 0.95, c: (o.colors || ["#ffffff", "#d9ffe9", "#fff3b0"])[i % (o.colors ? o.colors.length : 3)] });
  }
}
