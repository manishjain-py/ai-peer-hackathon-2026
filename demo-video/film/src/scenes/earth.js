// The closing shot (108.0 to 120.0): out of one lit window, over the city, up to the Earth from
// space; mint lights come on across the night side; then the planet settles low as a lit horizon
// under the end card.
//
// Everything is a pure function of the film time t. One camera flies in one vertical plane the
// whole way (out of the window, up, then back down toward the horizon). The planet is ray-traced
// per pixel in a local frame whose origin is the street under the window (x east, y north, z up,
// metres), so one shader holds from a few hundred metres to 30,000 km without losing float
// precision. Near the ground a small city is added: his building and its neighbours as boxes,
// street lamps as points, and a painted map of his streets from above. Higher up, the city is a
// carpet of lamp points worked out per pixel, as dense as NASA's real night-lights map says,
// and then that map itself.
// Textures: NASA Black Marble 2016 (night lights) and Blue Marble Next Generation (land, ocean);
// see assets/earth/SOURCE.md.
import * as THREE from "../../vendor/three.module.min.js";
import { el, prng, clamp, lerp } from "../lib.js";

const DEV = { show: "", top: false, debug: false }; // development switches: all off in the film

const W = 1920;
const H = 1080;
const DEG = Math.PI / 180;
const RE = 6371000; // Earth radius, metres
const T_START = 108.0;
const T_END = 120.0;

// ---- where on Earth -------------------------------------------------------------------------------
const LAT0 = 12.9708 * DEG; // the window's city (Bengaluru), the centre of the 500 m night-lights crop
const LON0 = 77.5917 * DEG;
const HEADING = -20 * DEG; // compass direction that is "up" on screen once the camera looks down
const WIDE_BOX = { lon0: 8614 / 37.5 - 180, latTop: 90 - 1601 / 37.5, span: 2048 / 37.5 }; // lights_india_3km.jpg
const CITY_BOX = { lon0: 17598 / 240, latTop: 90 - 17463 / 240, span: 2048 / 240 }; // lights_city_500m.jpg

// ---- his building ---------------------------------------------------------------------------------
const BAY = 3.4; // metres from window to window
const FLOOR = 3.15; // metres from floor to floor
const GROUND = 3.2; // height of the ground floor
const WIN = { w: 1.5, h: 1.75, sill: 0.92 };
const TILE = { bays: 4, floors: 3 }; // the painted facade repeats every 4 x 3 windows
const HERO_CELL = { bay: 5, floor: 7 }; // his window, counted from the left end of his building: tile cell (1, 1)
const HERO_BAYS = 13;
const HERO_FLOORS = 14;
const HERO_DEPTH = 5 * BAY;
const WIN_Z = GROUND + HERO_CELL.floor * FLOOR + WIN.sill + WIN.h / 2; // height of the window's centre
// The painted map of his streets from above: half-width in metres, 4096 pixels square.
const MAP = 4096;
const L1_HALF = 1230;
const NEAR_LIGHT = 0.085; // how bright a dense city reads once the camera is close (mean, linear light)

// ---- camera -------------------------------------------------------------------------------------
const FOV_Y = 32 * DEG;
const TAN_Y = Math.tan(FOV_Y / 2);
const TAN_X = TAN_Y * (W / H);
const FOCAL = H / 2 / TAN_Y; // pixels

// ---- small vector kit (plain arrays, double precision) ----------------------------------------------
const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
const len = (a) => Math.sqrt(dot(a, a));
const norm = (a) => mul(a, 1 / len(a));
/** Rotate v about the unit axis k by ang (right-handed). */
function rot(v, k, ang) {
  const c = Math.cos(ang);
  const s = Math.sin(ang);
  const kv = cross(k, v);
  const kd = dot(k, v) * (1 - c);
  return [v[0] * c + kv[0] * s + k[0] * kd, v[1] * c + kv[1] * s + k[1] * kd, v[2] * c + kv[2] * s + k[2] * kd];
}
const smooth = (a, b, x) => {
  const k = clamp((x - a) / (b - a));
  return k * k * (3 - 2 * k);
};

/** A smooth curve through keys [[x, y], ...]: monotone cubic, flat at both ends, held outside. */
function curve(keys) {
  const n = keys.length;
  const x = keys.map((k) => k[0]);
  const y = keys.map((k) => k[1]);
  const h = [];
  const dl = [];
  for (let i = 0; i < n - 1; i++) {
    h.push(x[i + 1] - x[i]);
    dl.push((y[i + 1] - y[i]) / h[i]);
  }
  const m = new Array(n).fill(0);
  for (let i = 1; i < n - 1; i++) {
    if (dl[i - 1] * dl[i] > 0) {
      const w1 = 2 * h[i] + h[i - 1];
      const w2 = h[i] + 2 * h[i - 1];
      m[i] = (w1 + w2) / (w1 / dl[i - 1] + w2 / dl[i]);
    }
  }
  return (t) => {
    if (t <= x[0]) return y[0];
    if (t >= x[n - 1]) return y[n - 1];
    let i = 0;
    while (x[i + 1] < t) i++;
    const k = (t - x[i]) / h[i];
    const k2 = k * k;
    const k3 = k2 * k;
    return (2 * k3 - 3 * k2 + 1) * y[i] + (k3 - 2 * k2 + k) * h[i] * m[i] + (-2 * k3 + 3 * k2) * y[i + 1] + (k3 - k2) * h[i] * m[i + 1];
  };
}

// ---- the move ---------------------------------------------------------------------------------------
// s = log10 of the camera's distance from the window (later: its height), in metres.
// Pull-out: the zoom rate eases in, holds at a constant rate (an exponential zoom), eases out at the top.
const S0 = Math.log10(5.5);
const S_APEX = Math.log10(3.7 * RE);
const PULL = { r0: 0.35, a: 0.75, t2: 1.55, t3: 2.5 };
PULL.rp = (S_APEX - S0 - (PULL.r0 * PULL.a) / 2) / (PULL.a / 2 + (PULL.t2 - PULL.a) + (PULL.t3 - PULL.t2) / 2);
const T_APEX = T_START + PULL.t3;
const sFar = curve([[T_APEX, S_APEX], [114.4, 7.335], [115.6, 6.47], [117.2, 6.455], [121.5, 6.42]]);
function sAt(t) {
  const { r0, rp, a, t2, t3 } = PULL;
  const tau = t - T_START;
  const part = (x) => x * x * x - (x * x * x * x) / 2;
  if (tau <= a) return S0 + r0 * tau + (rp - r0) * a * part(tau / a);
  const sa = S0 + r0 * a + ((rp - r0) * a) / 2;
  if (tau <= t2) return sa + rp * (tau - a);
  const s2 = sa + rp * (t2 - a);
  if (tau <= t3) return s2 + rp * (tau - t2 - (t3 - t2) * part((tau - t2) / (t3 - t2)));
  return sFar(t);
}
// How high the camera sits as seen from the window (degrees above level), by s.
const elevAt = curve([[0.74, 9], [0.92, 13], [1.45, 26], [2.35, 45], [3.3, 65], [4.3, 82], [5.3, 90]]);
// A little off to one side at the start, so the window has depth.
const sideAt = curve([[0.74, 11], [3.0, 0]]);
// Far phase: where the camera hangs over the globe (degrees along / across the flight plane),
// and how the frame sits: `mode` 0 = the globe's centre is held at screen y `cy`,
// 1 = the horizon is held at screen y `hy`.
const betaAt = curve([[109.6, 0], [110.5, 9], [112.0, 12.5], [114.4, 14], [115.6, -27], [117.2, -27.5], [121.5, -28.4]]);
const etaAt = curve([[109.8, 0], [110.6, -1.2], [114.4, 2.6], [115.6, 1.2], [117.2, 1.5], [121.5, 2.3]]);
const modeAt = curve([[114.4, 0], [115.6, 1]]);
const cyAt = curve([[109.6, 540], [110.6, 486], [114.4, 484]]);
const hyAt = curve([[115.6, 806], [121.5, 796]]);
// The sun, as an angle from the point under the camera (so the lit limb stays where we want it).
const sunAt = curve([[114.4, 151.5], [115.6, 139.5], [121.5, 137.5]]);
const sunTurnAt = curve([[114.4, 38], [115.6, 26], [121.5, 22]]);

const AX_H = [Math.sin(HEADING), Math.cos(HEADING), 0]; // level, "forward" (screen-up when looking down)
const AX_U = [0, 0, 1];
const AX_R = cross(AX_H, AX_U); // level, to the right
const CENTRE = [0, 0, -RE];

function cameraAt(t) {
  const s = sAt(t);
  const d = Math.pow(10, s);
  const elev = elevAt(s) * DEG;
  const side = sideAt(s) * DEG;
  // Near: the camera backs out of the window along `away`.
  const away = add(mul(add(mul(AX_H, -Math.cos(side)), mul(AX_R, Math.sin(side))), Math.cos(elev)), mul(AX_U, Math.sin(elev)));
  const fromCentre = add([0, 0, RE + WIN_Z], mul(away, d));
  // Far: swing that whole picture round the Earth's centre.
  const beta = betaAt(t) * DEG;
  const eta = etaAt(t) * DEG;
  const swing = (v) => rot(rot(v, mul(AX_R, -1), beta), rot(AX_H, mul(AX_R, -1), beta), eta);
  const pos = add(CENTRE, swing(fromCentre));
  const rho = len(fromCentre);
  // Where it looks: at the window, then pitched for the framing.
  const m = modeAt(t);
  const alpha = Math.asin(Math.min(1, RE / rho));
  const gammaCentre = -Math.atan((540 - cyAt(t)) / FOCAL);
  const gammaHorizon = alpha + Math.atan((hyAt(t) - 540) / FOCAL);
  const gamma = t < 109.6 ? 0 : lerp(gammaCentre, gammaHorizon, m);
  const fwd = norm(swing(rot(mul(away, -1), AX_R, gamma)));
  const r = swing(AX_R);
  const right = norm(sub(r, mul(fwd, dot(r, fwd))));
  const up = cross(right, fwd);
  // The sun.
  const nc = norm(swing(AX_U));
  const hc = norm(swing(AX_H));
  const rc = norm(swing(AX_R));
  const turn = sunTurnAt(t) * DEG;
  const toward = add(mul(hc, Math.cos(turn)), mul(rc, Math.sin(turn)));
  const sunAng = sunAt(t) * DEG;
  const sun = norm(add(mul(nc, Math.cos(sunAng)), mul(toward, Math.sin(sunAng))));
  return { pos, right, up, fwd, sun, s, d, rho, alt: rho - RE };
}

// ---- painting ---------------------------------------------------------------------------------------
function makeCanvas(w, h) {
  const c = document.createElement("canvas");
  c.width = Math.round(w);
  c.height = Math.round(h);
  return c;
}
const srgbToLinear = (hex) => {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255].map((v) => {
    const c = v / 255;
    return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
};
/** A CSS colour from linear light (the shaders read the painted maps back with a 2.2 gamma). */
const css = (r, g, b, k = 1) => `rgb(${[r, g, b].map((v) => Math.round(255 * Math.pow(clamp(v * k), 1 / 2.2))).join(",")})`;

function noiseCanvas(seed, n) {
  const c = makeCanvas(n, n);
  const x = c.getContext("2d");
  const im = x.createImageData(n, n);
  const r = prng(seed);
  for (let i = 0; i < n * n; i++) {
    const v = Math.floor(r() * 256);
    im.data[i * 4] = im.data[i * 4 + 1] = im.data[i * 4 + 2] = v;
    im.data[i * 4 + 3] = 255;
  }
  x.putImageData(im, 0, 0);
  return c;
}

// What each window of the tile looks like when dark, and which have an air-conditioner under them.
const WIN_KIND = [[2, 0, 1, 3], [0, 2, 2, 1], [3, 2, 0, 2]];
const WIN_AC = [[0, 1, 0, 0], [1, 1, 0, 1], [0, 0, 1, 0]];

/**
 * Paint a piece of the facade tile: metres [a0, a1] x [z0, z1] (z up), at S pixels per metre.
 * With `lit`, cell (1, 1) is the one warm window: its glass is left to the shader (a small lit
 * room is traced there), and the light it throws on its sill is painted here.
 */
function paintFacade(ctx, a0, z0, a1, z1, S, lit) {
  const X = (a) => (a - a0) * S;
  const Y = (z) => (z1 - z) * S;
  const tw = TILE.bays * BAY;
  const th = TILE.floors * FLOOR;
  const fill = (color, a, z, w, h) => {
    ctx.fillStyle = color;
    ctx.fillRect(X(a), Y(z + h), w * S, h * S);
  };
  const vgrad = (zTop, zBot, stops) => {
    const g = ctx.createLinearGradient(0, Y(zTop), 0, Y(zBot));
    stops.forEach(([k, c]) => g.addColorStop(k, c));
    return g;
  };
  ctx.save();
  // the wall: plaster in night light, with stains
  ctx.fillStyle = "#1e343a";
  ctx.fillRect(0, 0, (a1 - a0) * S, (z1 - z0) * S);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.globalCompositeOperation = "overlay";
  for (const [seed, n, alpha] of [[11, 5, 0.13], [12, 13, 0.11], [13, 44, 0.10], [14, 150, 0.08]]) {
    ctx.globalAlpha = alpha;
    ctx.drawImage(noiseCanvas(seed, n), X(0), Y(th), tw * S, th * S);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  // hairline cracks
  const rk = prng(77);
  ctx.strokeStyle = "rgba(0,0,0,0.22)";
  ctx.lineWidth = Math.max(1, 0.004 * S);
  for (let i = 0; i < 9; i++) {
    let a = rk() * tw;
    let z = rk() * th;
    ctx.beginPath();
    ctx.moveTo(X(a), Y(z));
    for (let j = 0; j < 14; j++) {
      a += (rk() - 0.5) * 0.16;
      z -= 0.03 + rk() * 0.12;
      ctx.lineTo(X(a), Y(z));
    }
    ctx.stroke();
  }

  // the slab edge at every floor: a lighter band with a thin shadow under it
  for (let k = 0; k <= TILE.floors; k++) {
    const z = k * FLOOR;
    fill("rgba(190, 226, 230, 0.055)", 0, z - 0.11, tw, 0.22);
    fill("rgba(210, 240, 240, 0.05)", 0, z + 0.095, tw, 0.015);
    ctx.fillStyle = vgrad(z - 0.11, z - 0.30, [[0, "rgba(0,0,0,0.34)"], [1, "rgba(0,0,0,0)"]]);
    ctx.fillRect(X(0), Y(z - 0.11), tw * S, 0.19 * S);
  }
  // a drain pipe down the left edge of the tile
  fill("rgba(0,0,0,0.30)", 0.265, 0, 0.07, th);
  const pg = ctx.createLinearGradient(X(0.16), 0, X(0.265), 0);
  pg.addColorStop(0, "#182a2f");
  pg.addColorStop(0.45, "#33525a");
  pg.addColorStop(1, "#1b3036");
  ctx.fillStyle = pg;
  ctx.fillRect(X(0.16), Y(th), 0.105 * S, th * S);
  for (let k = 0; k < TILE.floors; k++) fill("#14252a", 0.145, k * FLOOR + 1.2, 0.135, 0.05);

  for (let row = 0; row < TILE.floors; row++) {
    for (let col = 0; col < TILE.bays; col++) {
      const x0 = col * BAY + (BAY - WIN.w) / 2;
      const zb = row * FLOOR + WIN.sill;
      const isLit = lit && col === 1 && row === 1;
      const rnd = prng(900 + row * 17 + col * 5);
      const wx = X(x0);
      const wy = Y(zb + WIN.h);
      const ww = WIN.w * S;
      const wh = WIN.h * S;
      const f = 0.055 * S; // frame
      const m = 0.048 * S; // bars
      const tz = 0.37; // the cross bar, from the top

      // rain streaks under the sill
      for (let i = 0; i < 7; i++) {
        const sx = x0 - 0.06 + rnd() * (WIN.w + 0.12);
        const lenS = 0.5 + rnd() * 1.3;
        const wS = 0.025 + rnd() * 0.07;
        ctx.fillStyle = vgrad(zb - 0.08, zb - 0.08 - lenS, [[0, `rgba(0,0,0,${(0.10 + rnd() * 0.10).toFixed(3)})`], [1, "rgba(0,0,0,0)"]]);
        ctx.fillRect(X(sx), Y(zb - 0.08), wS * S, lenS * S);
      }
      // the frame, the glass, the bars (the shader sets them back into the wall)
      ctx.fillStyle = "#0c181c";
      ctx.fillRect(wx, wy, ww, wh);
      const gx = wx + f;
      const gy = wy + f;
      const gw = ww - 2 * f;
      const gh = wh - 2 * f;
      ctx.save();
      ctx.beginPath();
      ctx.rect(gx, gy, gw, gh);
      ctx.clip();
      const gg = ctx.createLinearGradient(0, gy, 0, gy + gh);
      gg.addColorStop(0, "#223d45");
      gg.addColorStop(0.4, "#152a30");
      gg.addColorStop(1, "#0c1a1f");
      ctx.fillStyle = gg;
      ctx.fillRect(gx, gy, gw, gh);
      const kind = WIN_KIND[row][col];
      if (kind === 0 || kind === 3) {
        // curtains drawn behind the glass
        const k1 = 26 + rnd() * 20;
        const k2 = 60 + rnd() * 50;
        const p1 = rnd() * 6.28;
        const p2 = rnd() * 6.28;
        const end = kind === 3 ? gx + gw * (0.38 + rnd() * 0.2) : gx + gw;
        for (let x = Math.floor(gx); x < end; x++) {
          const mm = (x - gx) / S;
          const b = clamp(0.5 + 0.32 * Math.sin(mm * k1 + p1) + 0.18 * Math.sin(mm * k2 + p2));
          ctx.fillStyle = `rgba(168, 204, 206, ${(0.025 + 0.075 * b).toFixed(3)})`;
          ctx.fillRect(x, gy, 1, gh);
        }
      } else if (kind === 1) {
        // a blind, part of the way down
        const drop = gh * (0.5 + rnd() * 0.35);
        ctx.fillStyle = "rgba(160, 196, 198, 0.07)";
        ctx.fillRect(gx, gy, gw, drop);
        ctx.fillStyle = "rgba(4, 10, 12, 0.34)";
        for (let y = gy; y < gy + drop; y += 0.034 * S) ctx.fillRect(gx, y, gw, Math.max(1, 0.008 * S));
        ctx.fillStyle = "rgba(190, 220, 222, 0.13)";
        ctx.fillRect(gx, gy + drop - 0.022 * S, gw, 0.022 * S);
      }
      ctx.restore();
      ctx.fillStyle = "#0c181c";
      ctx.fillRect(wx + ww / 2 - m / 2, wy, m, wh);
      ctx.fillRect(wx, wy + wh * tz - m / 2, ww, m);
      const lw = Math.max(1, 0.007 * S);
      ctx.fillStyle = "rgba(150, 196, 202, 0.16)";
      ctx.fillRect(wx, wy + wh - lw, ww, lw);
      ctx.fillRect(wx + ww / 2 - m / 2, wy + f, lw, gh);
      ctx.fillRect(wx, wy + wh * tz - m / 2, ww, lw);

      // the sill: a stone ledge, seen a little from above
      const sillA = x0 - 0.09;
      const sillW = WIN.w + 0.18;
      ctx.fillStyle = vgrad(zb - 0.085, zb - 0.42, [[0, "rgba(0,0,0,0.5)"], [1, "rgba(0,0,0,0)"]]);
      ctx.fillRect(X(sillA), Y(zb - 0.085), sillW * S, 0.335 * S);
      fill(isLit ? "#4a443c" : "#2f4b52", sillA, zb - 0.085, sillW, 0.085);
      if (isLit) {
        // the room's light falls on the ledge, brightest under the lamp
        const wgl = ctx.createLinearGradient(X(sillA), 0, X(sillA + sillW), 0);
        wgl.addColorStop(0, "#8a6038");
        wgl.addColorStop(0.42, "#e9aa66");
        wgl.addColorStop(0.62, "#ffc98a");
        wgl.addColorStop(1, "#946638");
        ctx.fillStyle = wgl;
        ctx.fillRect(X(sillA), Y(zb), sillW * S, 0.03 * S);
        ctx.fillStyle = vgrad(zb - 0.03, zb - 0.085, [[0, "rgba(255,170,90,0.22)"], [1, "rgba(255,170,90,0.04)"]]);
        ctx.fillRect(X(sillA), Y(zb - 0.03), sillW * S, 0.055 * S);
      } else {
        fill("#375a62", sillA, zb - 0.022, sillW, 0.022);
      }

      // an air-conditioner under some windows
      if (WIN_AC[row][col]) {
        const ax = x0 + 0.70;
        const az = zb - 0.085 - 0.17 - 0.50;
        ctx.fillStyle = vgrad(az, az - 0.3, [[0, "rgba(0,0,0,0.5)"], [1, "rgba(0,0,0,0)"]]);
        ctx.fillRect(X(ax - 0.02), Y(az), 0.84 * S, 0.3 * S);
        fill("rgba(0,0,0,0.35)", ax + 0.80, az, 0.05, 0.5);
        const bg = ctx.createLinearGradient(0, Y(az + 0.5), 0, Y(az));
        bg.addColorStop(0, isLit ? "#3c3a34" : "#27434a");
        bg.addColorStop(0.12, "#213a40");
        bg.addColorStop(1, "#1a2f35");
        ctx.fillStyle = bg;
        ctx.fillRect(X(ax), Y(az + 0.5), 0.8 * S, 0.5 * S);
        fill(isLit ? "rgba(255,190,110,0.38)" : "rgba(150,196,202,0.10)", ax, az + 0.488, 0.8, 0.012);
        ctx.fillStyle = "#13242a";
        ctx.beginPath();
        ctx.arc(X(ax + 0.30), Y(az + 0.25), 0.19 * S, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = "rgba(120,165,172,0.07)";
        ctx.lineWidth = Math.max(1, 0.006 * S);
        for (const rr of [0.19, 0.13, 0.07]) {
          ctx.beginPath();
          ctx.arc(X(ax + 0.30), Y(az + 0.25), rr * S, 0, Math.PI * 2);
          ctx.stroke();
        }
        for (let i = 0; i < 6; i++) fill("rgba(8,16,18,0.3)", ax + 0.58, az + 0.08 + i * 0.06, 0.16, 0.022);
        // its pipe, up beside the window and into the wall
        fill("#101d21", ax + 0.86, az + 0.36, 0.028, zb + 0.45 - (az + 0.36));
        fill("#101d21", ax + 0.80, az + 0.36, 0.06, 0.028);
      }
    }
  }
  // fine grain, so nothing is perfectly flat
  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = 0.085;
  ctx.fillStyle = ctx.createPattern(noiseCanvas(15, 256), "repeat");
  ctx.fillRect(0, 0, (a1 - a0) * S, (z1 - z0) * S);
  ctx.restore();
}

/**
 * The streets and buildings round his building, in "city" coordinates: a to the right and b up
 * the screen once the camera looks down; his window faces -b. Everything comes from one seed.
 */
function layoutCity() {
  const r = prng(4242);
  const lim = L1_HALF + 80;
  const width = () => (r() < 0.16 ? 22 : [10, 12, 14][Math.floor(r() * 3)]);
  const bs = [{ c: -13, w: 18 }]; // streets that run along a
  for (let c = -13; c < lim; ) {
    c += 70 + r() * 34;
    bs.push({ c, w: width() });
  }
  for (let c = -13; c > -lim; ) {
    c -= 70 + r() * 34;
    bs.unshift({ c, w: width() });
  }
  const as = [{ c: -66, w: 14 }, { c: 72, w: 14 }]; // streets that run along b
  for (let c = 72; c < lim; ) {
    c += 96 + r() * 44;
    as.push({ c, w: width() });
  }
  for (let c = -66; c > -lim; ) {
    c -= 96 + r() * 44;
    as.unshift({ c, w: width() });
  }
  const hero = {
    a0: -(HERO_CELL.bay + 0.5) * BAY, a1: (HERO_BAYS - HERO_CELL.bay - 0.5) * BAY, b0: 0, b1: HERO_DEPTH,
    n: HERO_FLOORS, lit: 0, kind: 1, seed: 0.37, tone: 1.0,
  };
  const buildings = [];
  const parks = [];
  for (let i = 0; i < bs.length - 1; i++) {
    for (let j = 0; j < as.length - 1; j++) {
      const a0 = as[j].c + as[j].w / 2 + 2.5;
      const a1 = as[j + 1].c - as[j + 1].w / 2 - 2.5;
      const b0 = bs[i].c + bs[i].w / 2 + 2.5;
      const b1 = bs[i + 1].c - bs[i + 1].w / 2 - 2.5;
      const home = a0 < 0 && a1 > 0 && b0 < 8 && b1 > 8;
      if (!home && r() < 0.05) {
        parks.push({ a0, a1, b0, b1 });
        continue;
      }
      const depth = b1 - b0;
      const rows = depth > 46 ? [[b0, 1], [b1, -1]] : [[b0, 1]];
      for (const [edge, dir] of rows) {
        let a = a0 + r() * 3;
        while (a < a1 - 4 * BAY) {
          const nb = Math.min(4 + Math.floor(r() * 7), Math.floor((a1 - a) / BAY));
          const w = nb * BAY;
          const dp = Math.min((4 + Math.floor(r() * 2)) * BAY, Math.floor(depth / BAY) * BAY);
          let n = 3 + Math.floor(Math.pow(r(), 1.7) * 9);
          if (r() < 0.06) n = 12 + Math.floor(r() * 6);
          const rect = { a0: a, a1: a + w, b0: dir > 0 ? edge : edge - dp, b1: dir > 0 ? edge + dp : edge };
          const empty = r() < 0.07;
          const seed = r();
          const tone = 0.7 + 0.6 * r();
          const lit = 0.012 + 0.05 * r() * r();
          a += w + 2.5 + r() * 4;
          if (empty) continue;
          if (rect.a1 > hero.a0 - 4 && rect.a0 < hero.a1 + 4 && rect.b1 > hero.b0 - 4 && rect.b0 < hero.b1 + 4) continue;
          // nothing tall in front of his window: the camera backs out that way
          if (rect.b1 <= -4 && rect.a1 > -42 && rect.a0 < 48) n = Math.min(n, Math.floor((13 + 0.42 * -rect.b1 - GROUND - 1) / FLOOR));
          if (n < 2) continue;
          buildings.push({ ...rect, n, lit, kind: 0, seed, tone });
        }
      }
    }
  }
  buildings.push(hero);
  for (const b of buildings) b.h = GROUND + b.n * FLOOR + 1.0;

  // street lamps, trees and parked cars along the kerbs
  const lamps = [];
  const trees = [];
  const cars = [];
  const kerb = (street, alongA) => {
    const green = r() < 0.5;
    const off = r() * 31;
    // a lane with no lamps, a street lit down one side only, or a street lit properly
    const how = street.w > 16 ? 1 : r();
    const step = how < 0.12 ? 0 : how < 0.36 ? 58 : 31;
    for (let k = 0, p = -lim + off; step && p < lim; p += step, k++) {
      const q = street.c + (step > 40 || k % 2 ? 1 : -1) * (street.w / 2 - 1.2);
      if (r() < 0.06) continue;
      lamps.push(alongA ? [p, q] : [q, p]);
    }
    for (const sgn of [-1, 1]) {
      const q = street.c + sgn * (street.w / 2 + 0.6);
      if (green) {
        for (let p = -lim + r() * 12; p < lim; p += 8 + r() * 6) {
          if (r() < 0.25) continue;
          const tr = 2.2 + r() * 2.0;
          trees.push(alongA ? [p, q, tr] : [q, p, tr]);
        }
      }
      const qc = street.c + sgn * (street.w / 2 - 2.6);
      for (let p = -lim + r() * 5; p < lim; p += 5.6) {
        const tone = r();
        if (r() < 0.5) continue;
        cars.push(alongA ? [p, qc, 1, tone] : [qc, p, 0, tone]);
      }
    }
  };
  for (const st of bs) kerb(st, true);
  for (const st of as) kerb(st, false);
  for (const p of parks) {
    const n = Math.floor(((p.a1 - p.a0) * (p.b1 - p.b0)) / 70);
    for (let i = 0; i < n; i++) trees.push([p.a0 + r() * (p.a1 - p.a0), p.b0 + r() * (p.b1 - p.b0), 2.5 + r() * 3.5]);
  }
  return { bs, as, buildings, parks, lamps, trees, cars, hero };
}

/** The nearest map: 2.5 km of streets seen from straight above at night (a picture, sRGB). */
function paintL1(ctx, city) {
  const mpp = (2 * L1_HALF) / MAP;
  const X = (a) => (a + L1_HALF) / mpp;
  const Y = (b) => (L1_HALF - b) / mpp;
  const rect = (a0, b0, a1, b1) => ctx.fillRect(X(a0), Y(b1), (a1 - a0) / mpp, (b1 - b0) / mpp);
  const r = prng(99);
  ctx.fillStyle = css(0.0026, 0.0085, 0.0108); // yards, lanes
  ctx.fillRect(0, 0, MAP, MAP);
  ctx.imageSmoothingEnabled = true;
  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = 0.35;
  ctx.drawImage(noiseCanvas(31, 90), 0, 0, MAP, MAP);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  // pavements, then the road
  for (const pass of [0, 1]) {
    ctx.fillStyle = pass === 0 ? css(0.0062, 0.0168, 0.0205) : css(0.0040, 0.0110, 0.0138);
    const inset = pass === 0 ? 0 : 2.2;
    for (const st of city.bs) rect(-L1_HALF, st.c - st.w / 2 + inset, L1_HALF, st.c + st.w / 2 - inset);
    for (const st of city.as) rect(st.c - st.w / 2 + inset, -L1_HALF, st.c + st.w / 2 - inset, L1_HALF);
  }
  // lane dashes on the wider streets
  ctx.fillStyle = "rgba(190, 215, 218, 0.10)";
  for (const st of city.bs) if (st.w >= 14) for (let a = -L1_HALF; a < L1_HALF; a += 9) rect(a, st.c - 0.12, a + 4, st.c + 0.12);
  for (const st of city.as) if (st.w >= 14) for (let b = -L1_HALF; b < L1_HALF; b += 9) rect(st.c - 0.12, b, st.c + 0.12, b + 4);
  for (const p of city.parks) {
    ctx.fillStyle = css(0.0020, 0.0075, 0.0075);
    rect(p.a0, p.b0, p.a1, p.b1);
  }
  // soft shadows round the buildings, drawn small and scaled up
  const sh = makeCanvas(MAP / 4, MAP / 4);
  const sx = sh.getContext("2d");
  sx.fillStyle = "#000";
  for (const b of city.buildings) {
    const k = 0.10 * Math.min(b.h, 40);
    sx.fillRect(X(b.a0 - 2 - k * 0.3) / 4, Y(b.b1 + 2 + k) / 4, (b.a1 - b.a0 + 4 + k * 0.6) / mpp / 4, (b.b1 - b.b0 + 4 + k * 1.3) / mpp / 4);
  }
  ctx.globalAlpha = 0.5;
  ctx.filter = "blur(5px)";
  ctx.drawImage(sh, 0, 0, MAP, MAP);
  ctx.filter = "none";
  ctx.globalAlpha = 1;
  // roofs
  for (const b of city.buildings) {
    ctx.fillStyle = css(0.0150, 0.0400, 0.0480, b.tone * 0.36);
    rect(b.a0, b.b0, b.a1, b.b1);
    ctx.fillStyle = "rgba(0,0,0,0.28)";
    rect(b.a0 + 0.5, b.b0 + 0.5, b.a1 - 0.5, b.b1 - 0.5);
    ctx.fillStyle = css(0.0150, 0.0400, 0.0480, b.tone * 0.32);
    rect(b.a0 + 1.1, b.b0 + 1.1, b.a1 - 1.1, b.b1 - 1.1);
    const n = 1 + Math.floor(r() * 4);
    for (let i = 0; i < n; i++) {
      const w = 2 + r() * 4;
      const d = 2 + r() * 3;
      const a = b.a0 + 2 + r() * Math.max(1, b.a1 - b.a0 - 4 - w);
      const q = b.b0 + 2 + r() * Math.max(1, b.b1 - b.b0 - 4 - d);
      ctx.fillStyle = r() < 0.5 ? "rgba(0,0,0,0.42)" : "rgba(170,210,214,0.10)";
      rect(a, q, a + w, q + d);
    }
  }
  // parked cars
  for (const [a, b, alongA, tone] of city.cars) {
    const v = tone > 0.82 ? 0.05 + (tone - 0.82) * 0.5 : 0.004 + tone * 0.012;
    ctx.fillStyle = css(v * 0.8, v, v * 1.05);
    if (alongA) rect(a, b - 0.9, a + 4.3, b + 0.9);
    else rect(a - 0.9, b, a + 0.9, b + 4.3);
  }
  // pools of lamp light on the road
  const pool = makeCanvas(96, 96);
  const px = pool.getContext("2d");
  const pgr = px.createRadialGradient(48, 48, 0, 48, 48, 48);
  pgr.addColorStop(0, "rgba(255, 178, 100, 0.74)");
  pgr.addColorStop(0.25, "rgba(255, 166, 88, 0.42)");
  pgr.addColorStop(0.6, "rgba(255, 150, 76, 0.13)");
  pgr.addColorStop(1, "rgba(255, 150, 76, 0)");
  px.fillStyle = pgr;
  px.fillRect(0, 0, 96, 96);
  ctx.globalCompositeOperation = "lighter";
  for (const [a, b] of city.lamps) {
    const rad = (17 + r() * 5) / mpp;
    ctx.globalAlpha = 0.75 + r() * 0.25;
    ctx.drawImage(pool, X(a) - rad, Y(b) - rad, rad * 2, rad * 2);
  }
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
  // trees: dark crowns that hide part of the light
  const crown = makeCanvas(64, 64);
  const cxx = crown.getContext("2d");
  const cg = cxx.createRadialGradient(30, 30, 4, 32, 32, 32);
  cg.addColorStop(0, "rgba(14, 30, 26, 0.95)");
  cg.addColorStop(0.7, "rgba(7, 18, 17, 0.93)");
  cg.addColorStop(1, "rgba(5, 14, 14, 0)");
  cxx.fillStyle = cg;
  cxx.fillRect(0, 0, 64, 64);
  for (const [a, b, tr] of city.trees) ctx.drawImage(crown, X(a - tr), Y(b + tr), (2 * tr) / mpp, (2 * tr) / mpp);
  // fine grain
  ctx.globalCompositeOperation = "overlay";
  ctx.globalAlpha = 0.10;
  ctx.fillStyle = ctx.createPattern(noiseCanvas(33, 256), "repeat");
  ctx.fillRect(0, 0, MAP, MAP);
  ctx.globalAlpha = 1;
  ctx.globalCompositeOperation = "source-over";
}

// ---- shaders ------------------------------------------------------------------------------------------
const f4 = (x) => x.toFixed(4);
const VS_SCREEN = /* glsl */ `
in vec3 position;
out vec2 vNdc;
out vec2 vUv;
void main() {
  vNdc = position.xy;
  vUv = position.xy * 0.5 + 0.5;
  gl_Position = vec4(position.xy, 0.0, 1.0);
}`;

const VS_PLANET = /* glsl */ `
in vec3 position;
out vec2 vNdc;
void main() {
  vNdc = position.xy;
  gl_Position = vec4(position.xy, 1.0, 1.0);
}`;

const GLSL_COMMON = /* glsl */ `
precision highp float;
precision highp sampler2D;
const float R = 6371000.0;
const float PI = 3.141592653589793;
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
// When the mint wave reaches a place at angle theta (radians) from the first city.
uniform vec3 uWave; // start time, duration, reach (radians)
float waveOn(float theta) {
  return uWave.x + uWave.y * (1.0 - pow(1.0 - min(theta / uWave.z, 0.999), 0.625));
}`;

const FS_PLANET = /* glsl */ `
${GLSL_COMMON}
in vec2 vNdc;
out vec4 fragColor;
uniform vec3 uCam, uRight, uUp, uFwd, uSun;
uniform vec2 uTan;
uniform float uPix, uT;
uniform mat3 uL2G;
uniform sampler2D tDay, tLights, tWide, tCity, tL1;
uniform vec4 uWideBox, uCityBox;
uniform float uUseWide, uUseCity, uNear;
uniform vec2 uAxA, uAxB;
uniform float uL1Half, uCarpet;
uniform vec3 uNightA, uNightB, uAtmoCool, uAtmoWarm, uGlowCol, uMintCol;
uniform float uWarm, uMint, uLGamma, uMGamma, uAtmoK, uGlow, uDayGain, uAirBase;

float inBox(vec2 p, float halfW) {
  vec2 e = 1.0 - abs(p) / halfW;
  return smoothstep(0.0, 0.07, min(e.x, e.y));
}
float vnoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash12(i), hash12(i + vec2(1.0, 0.0)), f.x), mix(hash12(i + vec2(0.0, 1.0)), hash12(i + vec2(1.0, 1.0)), f.x), f.y);
}
// A city's lamps from high up: points of light on the ground, in octaves, so that there is
// always a sparkle of them a few pixels apart however far the camera is. Most are faint, a
// few are bright. They crowd along main roads and thin out in quiet districts.
vec3 carpet(vec2 st, float foot, float dens) {
  vec2 wp = st + 1100.0 * vec2(vnoise(st / 2900.0 + 3.1), vnoise(st / 2900.0 + 7.7));
  float district = 0.22 + 0.95 * smoothstep(0.2, 0.8, vnoise(wp / 2100.0 + 11.0));
  vec2 gr = abs(fract(wp / 1700.0 + vec2(0.31, 0.17)) - 0.5);
  float road = smoothstep(0.03 + foot / 900.0, 0.0, min(gr.x, gr.y)) * smoothstep(900.0, 60.0, foot);
  float D = clamp(dens * (district + 1.8 * road), 0.0, 1.0);
  float lod = log2(max(foot, 0.02) * 11.0);
  float l0 = floor(lod);
  float fr = lod - l0;
  vec3 sum = vec3(0.0);
  for (int j = 0; j < 3; j++) {
    float lj = l0 + float(j);
    float c = exp2(lj);
    float w = j == 0 ? 1.0 - fr : j == 2 ? fr : 1.0;
    vec2 q = st / c;
    vec2 base = floor(q - 0.5);
    for (int k = 0; k < 4; k++) {
      vec2 id = base + vec2(float(k & 1), float(k >> 1));
      vec2 hid = id + lj * 17.31;
      float h = hash12(hid);
      vec2 pos = id + vec2(hash12(hid + 31.7), hash12(hid + 71.3));
      float bright = 0.22 + 10.0 * pow(hash12(hid * 1.37 + 5.5), 7.0);
      float r = (1.15 + 0.85 * hash12(hid + 2.2)) * foot / c;
      vec2 dq = q - pos;
      vec3 tint = mix(vec3(1.0, 0.47, 0.15), vec3(1.0, 0.80, 0.56), step(0.78, hash12(hid + 9.9)));
      sum += w * step(h, D * 0.85) * bright * tint * exp(-dot(dq, dq) / (r * r));
    }
  }
  return sum + vec3(1.0, 0.50, 0.18) * 0.02 * D;
}

void main() {
  vec3 d = normalize(uFwd + vNdc.x * uTan.x * uRight + vNdc.y * uTan.y * uUp);
  // Ray against the sphere, in a form that stays exact near the ground.
  float B = dot(uCam, d) + R * d.z;
  float C = dot(uCam, uCam) + 2.0 * R * uCam.z;
  float disc = B * B - C;
  float toward = step(B, 0.0);
  float hit = step(0.0, disc);
  float sq = sqrt(max(disc, 0.0));
  float sSurf = hit > 0.5 ? C / max(sq - B, 1e-3) : -B;        // to the ground, or to the closest point
  float ht = -disc / (sqrt(max(R * R - disc, 0.0)) + R);        // how high the ray passes (>0: it misses)
  float mpp = max(-B, 1.0) * uPix;                               // metres per pixel out at the limb
  float cover = clamp(0.5 - ht / mpp, 0.0, 1.0) * toward;

  vec3 P = uCam + sSurf * d;
  vec3 nl = normalize(vec3(P.xy, P.z + R));
  vec3 g = uL2G * nl;
  vec2 ll = vec2(atan(-g.z, g.x), asin(clamp(g.y, -1.0, 1.0))) * (180.0 / PI);
  vec2 uv = vec2(ll.x / 360.0 + 0.5, ll.y / 180.0 + 0.5);
  vec2 gx = dFdx(uv);
  vec2 gy = dFdy(uv);
  gx.x -= floor(gx.x + 0.5);
  gy.x -= floor(gy.x + 0.5);
  // the same point in street coordinates (metres), for the painted maps near the window
  vec2 st = vec2(dot(P.xy, uAxA), dot(P.xy, uAxB));
  vec2 sx = dFdx(st);
  vec2 sy = dFdy(st);
  float foot = max(length(sx), length(sy));                      // metres of ground per pixel

  vec3 col = vec3(0.0);
  float alpha = 0.0;
  if (toward > 0.5 && ht < 4.0e5) {
    float cs = dot(nl, uSun);
    float mu = max(dot(nl, -d), 0.0);

    // ---- the ground ----
    vec3 body = vec3(0.0);
    if (cover > 0.0) {
      vec3 dayS = textureGrad(tDay, uv, gx, gy).rgb;
      vec3 dayc = dayS * dayS;
      float L = textureGrad(tLights, uv, gx, gy).g;
      if (uUseWide > 0.0) {
        vec2 uw = (ll - uWideBox.xy) * uWideBox.zw;
        vec2 e = min(uw, 1.0 - uw);
        float w = smoothstep(0.0, 0.06, min(e.x, e.y)) * uUseWide;
        if (w > 0.0) L = mix(L, textureGrad(tWide, uw, gx * 360.0 * uWideBox.zw, gy * vec2(360.0, 180.0) * uWideBox.zw).g, w);
      }
      if (uUseCity > 0.0) {
        vec2 uc = (ll - uCityBox.xy) * uCityBox.zw;
        vec2 e = min(uc, 1.0 - uc);
        float w = smoothstep(0.0, 0.06, min(e.x, e.y)) * uUseCity;
        if (w > 0.0) L = mix(L, textureGrad(tCity, uc, gx * 360.0 * uCityBox.zw, gy * vec2(360.0, 180.0) * uCityBox.zw).g, w);
      }
      float dayL = smoothstep(-0.04, 0.30, cs);
      float night = 1.0 - smoothstep(-0.22, 0.02, cs);
      float lumD = dot(dayc, vec3(0.25, 0.60, 0.15));
      vec3 surfNight = uNightA + pow(lumD, 0.85) * uNightB;
      vec3 surfDay = dayc * (pow(max(cs, 0.0), 0.75) + 0.03) * uDayGain;
      vec3 surf = mix(surfNight, surfDay, dayL);
      // the Peer's lights: mint, coming on as the wave passes
      float theta = acos(clamp(nl.z, -1.0, 1.0));
      float dt = uT - waveOn(theta) - hash12(floor(ll * 6.0)) * 0.22;
      float on = smoothstep(0.0, 0.14, dt);
      float flash = on * exp(-max(dt, 0.0) / 0.32);
      // people's lights: dim, warm
      vec3 warm = mix(vec3(1.0, 0.42, 0.13), vec3(1.0, 0.70, 0.40), L) * pow(L, uLGamma) * uWarm * night * (1.0 - 0.86 * on);
      vec3 mint = uMintCol * pow(L, uMGamma) * uMint * on * (1.0 + 1.6 * flash) * night;
      if (uNear > 0.0) {
        // close to the city: a carpet of lamps, as dense as the real map says; closer still, his own streets
        float wc = (1.0 - smoothstep(450.0, 1500.0, foot)) * uNear;
        if (wc > 0.0) warm = mix(warm, carpet(st, foot, pow(L, 1.35)) * uCarpet, wc);
        float w1 = inBox(st, uL1Half) * (1.0 - smoothstep(2.6, 6.0, foot)) * uNear;
        if (w1 > 0.0) {
          vec3 t1 = textureGrad(tL1, st / (2.0 * uL1Half) + 0.5, sx / (2.0 * uL1Half), sy / (2.0 * uL1Half)).rgb;
          surf = mix(surf, pow(t1, vec3(2.2)), w1);
          warm *= 1.0 - w1;
        }
      }
      body = surf + warm + mint;
    }

    // ---- the air: a thin shell, lit only where the sun still reaches it ----
    const float HA = 22000.0;
    float chap = sqrt(PI * R / (2.0 * HA));
    float colOn = 1.0 / (mu + 1.0 / chap);
    float hOff = max(ht, 0.0);
    float colOff = 2.0 * chap * exp(-hOff / HA);
    float fwdS = 1.0 + 2.0 * pow(max(dot(d, uSun), 0.0), 8.0);
    // on the disc: a haze toward the limb on the side the sun is coming from
    float litOn = smoothstep(-0.13, 0.02, cs);
    vec3 cOn = mix(uAtmoWarm, uAtmoCool, smoothstep(-0.09, 0.03, cs));
    vec3 sOn = (cOn * litOn * fwdS + uAtmoCool * uAirBase) * (1.0 - exp(-uAtmoK * colOn));
    // beyond the limb: low air goes warm and dark first, high air stays cool and lit longer
    float csHigh = cs + 0.9 * sqrt(2.0 * hOff / R);
    float litOff = smoothstep(-0.07, 0.07, csHigh);
    vec3 cOff = mix(uAtmoWarm, uAtmoCool, smoothstep(3.0e3, 2.6e4, hOff) * 0.85 + 0.15 * smoothstep(-0.05, 0.10, cs));
    vec3 sOff = (cOff * litOff * fwdS + uAtmoCool * uAirBase) * (1.0 - exp(-uAtmoK * colOff));
    // airglow: a hairline of green light about 95 km up, and a breath of it below
    const float ZG = 95000.0;
    float wl = max(7000.0, mpp * 0.9);
    float line = exp(-pow((hOff - ZG) / wl, 2.0));
    float fill = 1.0 - smoothstep(0.0, ZG, hOff);
    vec3 glowOff = uGlowCol * uGlow * (line + 0.16 * fill);
    vec3 glowOn = uGlowCol * uGlow * 0.16 * pow(1.0 - mu, 5.0);

    body *= exp(-0.03 * colOn);
    col = (body + sOn + glowOn) * cover + (sOff + glowOff) * (1.0 - cover);
    alpha = cover;
  }
  fragColor = vec4(col, alpha);
}`;

const VS_STARS = /* glsl */ `
precision highp float;
in vec3 position;
in vec3 aStar; // brightness, size in pixels, tint
uniform vec3 uCam, uRight, uUp, uFwd;
uniform vec2 uTan;
uniform float uFade;
out float vB;
out float vTint;
const float R = 6371000.0;
void main() {
  vec3 pc = vec3(dot(position, uRight), dot(position, uUp), dot(position, uFwd));
  float B = dot(uCam, position) + R * position.z;
  float C = dot(uCam, uCam) + 2.0 * R * uCam.z;
  float disc = B * B - C;
  float ht = -disc / (sqrt(max(R * R - disc, 0.0)) + R);
  float vis = B < 0.0 ? smoothstep(40000.0, 190000.0, ht) : 1.0;
  vB = aStar.x * vis * uFade;
  vTint = aStar.z;
  gl_PointSize = aStar.y;
  gl_Position = (pc.z > 0.01 && vB > 0.0004) ? vec4(pc.x / uTan.x, pc.y / uTan.y, 0.0, pc.z) : vec4(2.0, 2.0, 2.0, 1.0);
}`;

const FS_STARS = /* glsl */ `
precision highp float;
in float vB;
in float vTint;
out vec4 fragColor;
void main() {
  vec2 q = gl_PointCoord * 2.0 - 1.0;
  float a = exp(-dot(q, q) * 4.5);
  vec3 c = mix(vec3(0.78, 0.92, 1.0), vec3(1.0, 0.90, 0.76), vTint);
  fragColor = vec4(c * vB * a, 0.0);
}`;

const VS_MINT = /* glsl */ `
${GLSL_COMMON}
in vec3 position; // unit vector from the Earth's centre, local frame
in vec3 aCity;    // brightness 0..1, random 0..1, random 0..1
uniform vec3 uCam, uRight, uUp, uFwd, uSun;
uniform vec2 uTan;
uniform float uT, uFocal, uGain;
out float vI;
void main() {
  vec3 P = position * R - vec3(0.0, 0.0, R);
  vec3 rel = P - uCam;
  float dist = length(rel);
  float mu = dot(position, -rel) / dist;
  vec3 pc = vec3(dot(rel, uRight), dot(rel, uUp), dot(rel, uFwd));
  float theta = acos(clamp(position.z, -1.0, 1.0));
  float dt = uT - waveOn(theta) - aCity.y * 0.25;
  float on = smoothstep(0.0, 0.12, dt);
  float flash = exp(-max(dt, 0.0) / 0.30);
  float breathe = 1.0 + 0.10 * sin(uT * (1.1 + aCity.z * 1.7) + aCity.y * 40.0);
  float night = 1.0 - smoothstep(-0.22, 0.02, dot(position, uSun));
  float limb = smoothstep(0.0, 0.22, mu);
  float px = max(2.6 + 2.4 * aCity.x, (16000.0 + 36000.0 * aCity.x) * uFocal / dist);
  vI = uGain * (0.35 + 0.65 * aCity.x) * on * (1.0 + 2.2 * flash) * breathe * night * limb;
  gl_PointSize = px * (1.0 + 0.5 * flash * on);
  gl_Position = (pc.z > 1.0 && mu > 0.0 && vI > 0.001) ? vec4(pc.x / uTan.x, pc.y / uTan.y, 0.0, pc.z) : vec4(2.0, 2.0, 2.0, 1.0);
}`;

const FS_MINT = /* glsl */ `
precision highp float;
in float vI;
out vec4 fragColor;
uniform vec3 uMintCol;
void main() {
  vec2 q = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(q, q);
  float a = exp(-r2 * 9.0) + 0.22 * exp(-r2 * 2.6);
  a *= smoothstep(1.0, 0.7, r2);
  fragColor = vec4(uMintCol * vI * a, 0.0);
}`;

// ---- the buildings: boxes, with the facade worked out per pixel ----
const VS_BOX = /* glsl */ `
precision highp float;
in vec3 position; // unit box: x, y in -0.5..0.5, z in 0..1
in vec3 normal;
in vec4 iRect;    // centre a, centre b, width (along a), depth (along b)
in vec4 iInfo;    // height, seed, share of lit windows, kind (0 a building, 1 his, 2 a box on a roof)
in vec2 iMore;    // base height, tone
uniform vec3 uCam, uRight, uUp, uFwd, uAxA, uAxB;
uniform vec2 uTan, uNF;
uniform float uFlatten;
out vec3 vP;
out vec3 vN;
out vec4 vRect;
out vec4 vInfo;
out vec2 vMore;
out float vZ;
void main() {
  vZ = iMore.x + position.z * iInfo.x;
  vP = vec3(iRect.xy + position.xy * iRect.zw, vZ * uFlatten);
  vN = normal;
  vRect = iRect;
  vInfo = iInfo;
  vMore = iMore;
  vec3 world = uAxA * vP.x + uAxB * vP.y + vec3(0.0, 0.0, vP.z);
  vec3 rel = world - uCam;
  vec3 v = vec3(dot(rel, uRight), dot(rel, uUp), dot(rel, uFwd));
  gl_Position = vec4(v.x / uTan.x, v.y / uTan.y, (uNF.y + uNF.x) / (uNF.y - uNF.x) * v.z - 2.0 * uNF.y * uNF.x / (uNF.y - uNF.x), v.z);
}`;

const FS_BOX = /* glsl */ `
precision highp float;
precision highp sampler2D;
in vec3 vP;
in vec3 vN;
in vec4 vRect;
in vec4 vInfo;
in vec2 vMore;
in float vZ;
out vec4 fragColor;
uniform vec3 uCamCity, uFog;
uniform sampler2D tTile, tHero;
uniform float uPix, uFlatten, uAmb;
const float BAY = ${f4(BAY)};
const float FLOOR = ${f4(FLOOR)};
const float GROUND = ${f4(GROUND)};
const vec2 WIN = vec2(${f4(WIN.w)}, ${f4(WIN.h)});
const float SILL = ${f4(WIN.sill)};
const float RECESS = 0.16;
const vec2 HERO = vec2(${f4(HERO_CELL.bay)}, ${f4(HERO_CELL.floor)});
const vec3 MOON = vec3(-0.4500, -0.5500, 0.7036);

float h11(float p) {
  p = fract(p * 0.1031);
  p *= p + 33.33;
  p *= p + p;
  return fract(p);
}
float h21(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}

// What a pane of glass shows of the night outside (r: x right, y up, z into the wall).
vec3 nightEnv(vec3 r) {
  vec3 sky = vec3(0.010, 0.026, 0.032) * (0.5 + 1.0 * smoothstep(-0.2, 0.9, r.y));
  vec2 q = vec2(atan(r.x, -r.z), r.y) * 13.0;
  vec2 id = floor(q);
  vec2 f = fract(q) - 0.5;
  float h = h21(id);
  vec2 o = (vec2(h21(id + 3.1), h21(id + 7.7)) - 0.5) * 0.6;
  float lamp = smoothstep(0.17, 0.02, length(f + o)) * step(0.80, h) * smoothstep(0.22, -0.05, r.y) * smoothstep(-0.9, -0.25, r.y);
  return sky + vec3(1.0, 0.60, 0.28) * lamp * 0.45;
}

// ---- the one lit window: a small room, traced ----
// Window frame: x right, y up, z into the building, origin at the middle of the opening in the wall.
const vec3 LAMP = vec3(0.30, -0.40, 1.15);
const vec3 LAMPC = vec3(1.0, 0.68, 0.38);
const float LAMPI = 7.0;
const vec3 ROOM0 = vec3(-1.7, -1.795, 0.215);
const vec3 ROOM1 = vec3(2.4, 0.955, 3.8);
const float CURTAIN = 0.36;
const int NBOX = 14;
const vec3 B0[NBOX] = vec3[NBOX](
  vec3(-0.75, -0.875, 0.16), vec3(0.695, -0.875, 0.16), vec3(-0.75, -0.875, 0.16), vec3(-0.75, 0.82, 0.16),
  vec3(-0.024, -0.875, 0.16), vec3(-0.75, 0.2035, 0.16),
  vec3(-0.45, -1.075, 0.55), vec3(1.01, -1.795, 0.55), vec3(-0.12, -1.04, 0.80), vec3(-0.12, -1.04, 0.812),
  vec3(-0.18, -1.30, 1.62), vec3(0.75, 0.02, 3.52), vec3(0.85, 0.05, 3.58), vec3(0.288, -1.04, 1.138));
const vec3 B1[NBOX] = vec3[NBOX](
  vec3(-0.695, 0.875, 0.215), vec3(0.75, 0.875, 0.215), vec3(0.75, -0.82, 0.215), vec3(0.75, 0.875, 0.215),
  vec3(0.024, 0.875, 0.215), vec3(0.75, 0.2515, 0.215),
  vec3(1.05, -1.04, 1.30), vec3(1.05, -1.075, 1.30), vec3(0.22, -0.80, 0.812), vec3(0.22, -1.025, 1.05),
  vec3(0.28, -0.78, 1.67), vec3(2.1, 0.05, 3.8), vec3(1.6, 0.30, 3.76), vec3(0.312, -0.485, 1.162));

vec2 boxHit(vec3 ro, vec3 rd, vec3 b0, vec3 b1, out vec3 n) {
  vec3 inv = 1.0 / rd;
  vec3 ta = (b0 - ro) * inv;
  vec3 tb = (b1 - ro) * inv;
  vec3 t0 = min(ta, tb);
  vec3 t1 = max(ta, tb);
  float tn = max(max(t0.x, t0.y), t0.z);
  float tf = min(min(t1.x, t1.y), t1.z);
  n = -sign(rd) * step(t0.yzx, t0.xyz) * step(t0.zxy, t0.xyz);
  return vec2(tn, tf);
}
float lampShadow(vec3 p) {
  vec3 l = LAMP - p;
  float dist = length(l);
  vec3 rd = l / dist;
  vec3 n;
  for (int i = 6; i < 11; i++) {
    vec2 h = boxHit(p, rd, B0[i], B1[i], n);
    if (h.x < h.y && h.y > 0.004 && h.x < dist) return 0.22;
  }
  return 1.0;
}
vec3 lampLight(vec3 p, vec3 n, float sh) {
  vec3 l = LAMP - p;
  float d2 = dot(l, l);
  float ndl = max(dot(n, l) * inversesqrt(d2), 0.0);
  return LAMPC * LAMPI * (ndl * sh + 0.035) / (d2 + 0.25) + vec3(1.0, 0.66, 0.38) * 0.035;
}
vec3 heroWindow(vec2 p0, vec3 rd, float blurM) {
  rd = normalize(rd + vec3(1e-5, 1e-5, 0.0));
  vec2 hw = WIN * 0.5;
  // the wall is thick: the sides of the opening catch the room's light
  vec2 p1 = p0 + rd.xy / rd.z * RECESS;
  if (abs(p1.x) > hw.x || abs(p1.y) > hw.y) {
    vec2 tt = (sign(rd.xy) * hw - p0) / rd.xy;
    float t = min(tt.x, tt.y);
    vec3 p = vec3(p0, 0.0) + rd * t;
    vec3 n = tt.x < tt.y ? vec3(-sign(rd.x), 0.0, 0.0) : vec3(0.0, -sign(rd.y), 0.0);
    vec3 alb = n.y > 0.5 ? vec3(0.42, 0.42, 0.40) : vec3(0.40, 0.44, 0.44);
    vec3 l = LAMP - p;
    float d2 = dot(l, l);
    float ndl = max(dot(n, l) * inversesqrt(d2), 0.0);
    float deep = smoothstep(0.0, RECESS, p.z);
    return alb * (LAMPC * LAMPI * (ndl * 0.75 + 0.05) / (d2 + 0.25) * (0.35 + 0.65 * deep) + vec3(0.012, 0.030, 0.036));
  }
  vec3 ro = vec3(p1, RECESS);
  float tBest = 1e9;
  int id = -1;
  vec3 nBest = vec3(0.0);
  for (int i = 0; i < NBOX; i++) {
    vec3 n;
    vec2 h = boxHit(ro, rd, B0[i], B1[i], n);
    if (h.x < h.y && h.x > -1e-4 && h.x < tBest) {
      tBest = h.x;
      id = i;
      nBest = n;
    }
  }
  // the lamp shade: a short upright tube, open at the top, the bulb inside it
  vec3 oc = ro - LAMP;
  float ca = dot(rd.xz, rd.xz);
  float cb = dot(oc.xz, rd.xz);
  float cd = cb * cb - ca * (dot(oc.xz, oc.xz) - 0.105 * 0.105);
  float tS = -1.0;
  vec3 shade = vec3(0.0);
  if (cd > 0.0) {
    float t0 = (-cb - sqrt(cd)) / ca;
    float y0 = oc.y + rd.y * t0;
    float tTop = (0.085 - oc.y) / rd.y;
    vec2 pt = oc.xz + rd.xz * tTop;
    if (t0 > 0.0 && abs(y0) < 0.085) {
      tS = t0;
      shade = vec3(8.5, 5.9, 3.1) * (0.55 + 0.45 * cos(y0 / 0.085 * 1.3));
    } else if (tTop > 0.0 && rd.y < 0.0 && dot(pt, pt) < 0.105 * 0.105) {
      tS = tTop;
      shade = mix(vec3(34.0, 27.0, 17.0), vec3(9.0, 6.0, 3.0), smoothstep(0.03, 0.10, length(pt)));
    }
  }
  vec3 col;
  float tHit;
  if (tS > 0.0 && tS < tBest) {
    col = shade;
    tHit = tS;
    id = -2;
  } else if (id >= 0) {
    vec3 p = ro + rd * tBest;
    tHit = tBest;
    if (id < 6) {
      // the window frame and its bars: dark outside, warm where they turn to the room
      col = nBest.z < -0.5 ? vec3(0.004, 0.008, 0.010) : vec3(0.10, 0.10, 0.10) * lampLight(p, nBest, 1.0);
    } else {
      vec3 alb = id < 8 ? vec3(0.20, 0.12, 0.07) : id < 10 ? vec3(0.045, 0.045, 0.05) : id == 10 ? vec3(0.045, 0.036, 0.03) : id == 11 ? vec3(0.22, 0.14, 0.08)
        : id == 12 ? mix(vec3(0.30, 0.10, 0.06), vec3(0.10, 0.20, 0.24), step(0.5, fract(p.x * 9.0))) : vec3(0.08, 0.07, 0.06);
      col = alb * lampLight(p, nBest, lampShadow(p + nBest * 0.003));
    }
  } else {
    // the room itself
    vec3 te = (mix(ROOM0, ROOM1, step(0.0, rd)) - ro) / rd;
    float t = min(min(te.x, te.y), te.z);
    vec3 n = -sign(rd) * step(te.xyz, te.yzx) * step(te.xyz, te.zxy);
    vec3 p = ro + rd * t;
    tHit = t;
    vec3 alb = vec3(0.70, 0.64, 0.55);
    if (n.y > 0.5) alb = vec3(0.34, 0.20, 0.11) * (0.86 + 0.14 * step(0.08, fract(p.x / 0.14)));
    else if (n.y < -0.5) alb = vec3(0.80, 0.77, 0.70);
    else if (n.z < -0.5) {
      // a picture on the far wall
      vec2 q = abs(p.xy - vec2(-0.75, 0.10)) - vec2(0.36, 0.30);
      float fr = max(q.x, q.y);
      alb = fr < 0.0 ? mix(vec3(0.30, 0.32, 0.30), vec3(0.10, 0.07, 0.05), step(-0.035, fr)) : vec3(0.72, 0.66, 0.56);
    }
    col = alb * lampLight(p, n, lampShadow(p + n * 0.003));
  }
  bool frame = id >= 0 && id < 6;
  if (!frame) {
    // sheer curtains, glowing with the lamp behind them: a wide one on the left, a narrow one on the right
    float tc = (CURTAIN - ro.z) / rd.z;
    vec3 pc = ro + rd * tc;
    float edge = min(min(pc.x + 0.72, -0.16 - pc.x), 1.0);
    edge = max(edge, min(pc.x - 0.50, 0.72 - pc.x));
    if (tc < tHit && edge > 0.0) {
      float x = pc.x;
      float fold = clamp(0.52 + 0.30 * sin(x * 31.0 + 1.3) + 0.14 * sin(x * 77.0 + 4.1) + 0.10 * sin(x * 9.0 + 0.4), 0.0, 1.0);
      vec3 l = LAMP - pc;
      float e = LAMPI / (dot(l, l) + 0.30);
      vec3 cc = mix(vec3(1.0, 0.46, 0.17), vec3(1.0, 0.78, 0.50), fold) * e * (0.09 + 0.23 * fold);
      cc *= 1.0 - 0.6 * smoothstep(0.74, 0.86, pc.y);
      col = mix(col, cc, 0.90 * smoothstep(0.0, 0.012, edge));
    }
    // the glass
    vec3 rr = reflect(rd, vec3(0.0, 0.0, -1.0));
    float fres = 0.04 + 0.96 * pow(1.0 - rd.z, 5.0);
    col = col * 0.94 + nightEnv(rr) * fres * 1.5;
  }
  // from far away the window is one warm light
  return mix(col, vec3(1.7, 1.02, 0.46), smoothstep(0.03, 0.14, blurM));
}

vec3 roof() {
  vec2 q = vP.xy - vRect.xy;
  vec2 hs = vRect.zw * 0.5;
  float edge = min(hs.x - abs(q.x), hs.y - abs(q.y));
  vec3 c = vec3(0.0150, 0.0400, 0.0480) * vMore.y;
  if (vInfo.w < 1.5) {
    // a low wall round the edge, things left on the roof, a water tank or two
    c *= 1.0 + 0.45 * smoothstep(0.50, 0.38, edge);
    c *= 1.0 - 0.42 * smoothstep(1.5, 0.5, edge) * step(0.5, edge);
    vec2 gq = (vP.xy + vInfo.y * 57.0) / 2.6;
    float hsh = h21(floor(gq) + vInfo.y * 13.0);
    vec2 f = fract(gq);
    float m = step(0.84, hsh) * step(0.12, f.x) * step(f.x, 0.88) * step(0.16, f.y) * step(f.y, 0.84) * step(1.8, edge);
    c = mix(c, c * (hsh > 0.92 ? 1.8 : 0.42), m);
    for (int i = 0; i < 2; i++) {
      vec2 tc = (vec2(h11(vInfo.y * 7.0 + float(i) * 3.1), h11(vInfo.y * 11.0 + float(i) * 5.3)) - 0.5) * (vRect.zw - 5.0);
      float dd = length(q - tc);
      c = mix(c, vec3(0.0035, 0.0065, 0.0075) + vec3(0.012, 0.024, 0.028) * smoothstep(1.1, 0.2, length(q - tc + vec2(0.35, 0.45))), smoothstep(1.22, 1.08, dd));
    }
  }
  return c * 1.05;
}

void main() {
  vec3 N = normalize(vN);
  vec3 toP = vP - uCamCity;
  float dist = length(toP);
  vec3 vd = toP / dist;
  float blurM = dist * uPix;                      // metres one pixel covers here
  vec3 T = vec3(-N.y, N.x, 0.0);
  float extent = abs(T.x) * vRect.z + abs(T.y) * vRect.w;
  float along = dot(vP.xy - vRect.xy, T.xy) + extent * 0.5;
  vec2 bf = vec2(along / BAY, (vZ - GROUND) / FLOOR);
  vec2 gxb = dFdx(bf);
  vec2 gyb = dFdy(bf);
  vec3 col;
  float glow = 0.0;
  if (N.z > 0.5) {
    col = roof();
  } else {
    float floors = floor((vInfo.x - GROUND - 0.6) / FLOOR);
    float shade = 0.55 + 0.75 * max(dot(N, MOON), 0.0);
    float tint = 0.74 + 0.52 * h11(vInfo.y * 91.7);
    vec3 wallFlat = vec3(0.0129, 0.0343, 0.0423);
    if (vInfo.w > 1.5) {
      col = wallFlat * tint * shade * 0.9;
    } else if (bf.y < 0.0) {
      // the ground floor: shutters, a few shops still lit
      vec2 c = vec2(floor(bf.x), 0.0);
      float fx = fract(bf.x);
      float open = step(h21(c + vInfo.y * 31.0), 0.10 * step(vInfo.w, 0.5));
      float door = step(0.08, fx) * step(fx, 0.92) * step(vZ, 2.75);
      col = mix(wallFlat * tint * 0.8, vec3(0.0045, 0.0105, 0.0125), door) * shade;
      col += open * door * mix(vec3(1.0, 0.62, 0.30), vec3(0.85, 0.92, 1.0), step(0.6, h21(c + 4.4))) * (0.5 + 0.9 * smoothstep(2.75, 0.4, vZ));
      glow = open * door;
    } else if (bf.y >= floors) {
      col = wallFlat * tint * shade;
    } else {
      vec2 cell = floor(bf);
      vec2 loc = fract(bf) * vec2(BAY, FLOOR);
      vec2 o = loc - vec2((BAY - WIN.x) * 0.5, SILL);          // from the corner of the window opening
      bool inWin = o.x > 0.0 && o.y > 0.0 && o.x < WIN.x && o.y < WIN.y;
      vec3 rdF = vec3(dot(vd, T), vd.z, -dot(vd, N));         // the view ray in the wall's own frame
      bool hero = vInfo.w > 0.5 && N.y < -0.5 && cell == HERO;
      vec2 tileOff = vInfo.w > 0.5 ? vec2(0.0) : floor(vec2(h11(vInfo.y * 3.7) * 4.0, h11(vInfo.y * 5.9) * 3.0));
      vec2 bfs = bf;
      float reveal = 0.0;
      vec2 o2 = o;
      if (inWin) {
        // every window is set back into the wall
        o2 = o + rdF.xy / max(rdF.z, 0.08) * RECESS;
        if (o2.x < 0.0 || o2.y < 0.0 || o2.x > WIN.x || o2.y > WIN.y) reveal = 1.0;
        else bfs = cell + (o2 + vec2((BAY - WIN.x) * 0.5, SILL)) / vec2(BAY, FLOOR);
      }
      vec3 tex = textureGrad(tTile, (bfs + tileOff) / vec2(4.0, 3.0), gxb / vec2(4.0, 3.0), gyb / vec2(4.0, 3.0)).rgb;
      if (vInfo.w > 0.5 && N.y < -0.5) {
        // his own windows, painted finer
        vec2 hu = (bfs - vec2(HERO.x - 1.0, HERO.y - 0.5)) / vec2(3.0, 2.0);
        vec2 e = min(hu, 1.0 - hu);
        float w = smoothstep(0.0, 0.035, min(e.x, e.y));
        if (w > 0.0) tex = mix(tex, textureGrad(tHero, hu, gxb / vec2(3.0, 2.0), gyb / vec2(3.0, 2.0)).rgb, w);
      }
      col = pow(tex, vec3(2.2)) * tint * shade;
      if (hero && inWin) {
        col = heroWindow(o - WIN * 0.5, rdF, blurM);
        glow = 1.0;
      } else if (inWin && reveal > 0.5) {
        col = wallFlat * tint * shade * (o2.y > WIN.y ? 0.38 : o2.y < 0.0 ? 1.25 : 0.62);
      } else if (inWin) {
        // glass: a little of the night in it, and in a few of them a light left on
        vec2 gl = o2 / WIN;
        float bars = step(0.035, gl.x) * step(gl.x, 0.965) * step(0.03, gl.y) * step(gl.y, 0.97) * step(0.017, abs(gl.x - 0.5)) * step(0.014, abs(gl.y - 0.63));
        col += nightEnv(reflect(rdF, vec3(0.0, 0.0, -1.0))) * bars * (0.05 + 0.95 * pow(1.0 - rdF.z, 5.0)) * 1.4;
        float hc = h21(cell + vInfo.y * 77.0);
        if (hc < vInfo.z) {
          float k = h21(cell + 9.3);
          vec3 lit = mix(vec3(1.0, 0.56, 0.24), vec3(1.0, 0.78, 0.50), k) * (0.5 + 1.6 * h21(cell + 2.1));
          lit *= 0.55 + 0.45 * sin(gl.x * (20.0 + 30.0 * k) + k * 6.0) * step(k, 0.6) + 0.3 * gl.y;
          glow = bars * (0.55 + 0.45 * step(blurM, 0.2));
          col = mix(col, lit, glow);
        }
      }
    }
    // the street lamps wash the bottom of the walls
    col += vec3(1.0, 0.55, 0.24) * 0.010 * exp(-vZ / 5.0) * tint;
    col *= mix(0.72, 1.0, smoothstep(0.0, 16.0, vZ));
  }
  col *= mix(uAmb, 1.0, glow);
  col = mix(col, uFog * uAmb, 1.0 - exp(-dist / 5200.0));
  fragColor = vec4(col, 1.0);
}`;

const VS_LAMP = /* glsl */ `
precision highp float;
in vec3 position; // a, b, height
in float aSeed;
uniform vec3 uCam, uRight, uUp, uFwd, uAxA, uAxB;
uniform vec2 uTan, uNF;
uniform float uFocal, uFade;
out float vI;
out float vSeed;
out float vPx;
void main() {
  vec3 world = uAxA * position.x + uAxB * position.y + vec3(0.0, 0.0, position.z);
  vec3 rel = world - uCam;
  float dist = length(rel);
  vec3 v = vec3(dot(rel, uRight), dot(rel, uUp), dot(rel, uFwd));
  float want = 3.4 * uFocal / dist;
  float px = clamp(want, 3.0, 240.0);
  vI = uFade * min(1.0, pow(want / px, 1.1)) * (0.8 + 0.4 * aSeed);
  vSeed = aSeed;
  vPx = px;
  gl_PointSize = px;
  gl_Position = (v.z > uNF.x && vI > 0.002) ? vec4(v.x / uTan.x, v.y / uTan.y, (uNF.y + uNF.x) / (uNF.y - uNF.x) * v.z - 2.0 * uNF.y * uNF.x / (uNF.y - uNF.x), v.z) : vec4(2.0, 2.0, 2.0, 1.0);
}`;

const FS_LAMP = /* glsl */ `
precision highp float;
in float vI;
in float vSeed;
in float vPx;
out vec4 fragColor;
void main() {
  vec2 q = gl_PointCoord * 2.0 - 1.0;
  float r2 = dot(q, q);
  float a = mix(6.0 * exp(-r2 * 3.2), 5.5 * exp(-r2 * 70.0) + 0.30 * exp(-r2 * 11.0) + 0.02 * exp(-r2 * 2.6), smoothstep(5.0, 18.0, vPx));
  a *= smoothstep(1.0, 0.6, r2);
  vec3 c = mix(vec3(1.0, 0.56, 0.24), vec3(1.0, 0.80, 0.56), step(0.72, vSeed));
  fragColor = vec4(c * vI * a, 0.0);
}`;

// ---- after the picture: motion blur, bloom, grade, grain ----
// Motion blur: every pixel is smeared along its own path through the shutter. The path comes as
// two maps of the frame: where a point of this frame sat when the shutter opened, and where
// when it closed. A zoom is the case where both are scalings about the middle. Run twice, it
// is smooth.
const FS_MOVE = /* glsl */ `
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D tSrc;
uniform mat3 uA, uB;
uniform vec2 uSize;
uniform float uFrame, uKind;
uniform int uTaps;
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
void main() {
  vec3 p = vec3((vUv - 0.5) * uSize, 1.0);
  vec2 pa = (uA * p).xy;
  vec2 pb = (uB * p).xy;
  vec2 g = gl_FragCoord.xy + vec2(uFrame * 5.588238, uFrame * 3.1415);
  float n = uKind < 0.5 ? hash12(g) : fract(52.9829189 * fract(0.06711056 * g.x + 0.00583715 * g.y));
  vec4 acc = vec4(0.0);
  for (int i = 0; i < uTaps; i++) {
    acc += texture(tSrc, mix(pa, pb, (float(i) + n) / float(uTaps)) / uSize + 0.5);
  }
  fragColor = acc / float(uTaps);
}`;

const FS_DOWN = /* glsl */ `
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D tSrc;
uniform vec2 uTexel;
uniform float uThr;
vec3 s(float x, float y) { return texture(tSrc, vUv + vec2(x, y) * uTexel).rgb; }
void main() {
  vec3 a = s(-2.0, 2.0), b = s(0.0, 2.0), c = s(2.0, 2.0);
  vec3 d = s(-2.0, 0.0), e = s(0.0, 0.0), f = s(2.0, 0.0);
  vec3 g = s(-2.0, -2.0), h = s(0.0, -2.0), i = s(2.0, -2.0);
  vec3 j = s(-1.0, 1.0), k = s(1.0, 1.0), l = s(-1.0, -1.0), m = s(1.0, -1.0);
  vec3 o = e * 0.125 + (a + c + g + i) * 0.03125 + (b + d + f + h) * 0.0625 + (j + k + l + m) * 0.125;
  float br = max(o.r, max(o.g, o.b));
  o *= smoothstep(uThr, uThr * 4.0 + 1e-5, br);
  fragColor = vec4(o, 1.0);
}`;

const FS_UP = /* glsl */ `
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D tSrc, tAdd;
uniform vec2 uTexel;
uniform float uMix;
vec3 s(float x, float y) { return texture(tSrc, vUv + vec2(x, y) * uTexel).rgb; }
void main() {
  vec3 o = s(0.0, 0.0) * 4.0 + (s(-1.0, 0.0) + s(1.0, 0.0) + s(0.0, -1.0) + s(0.0, 1.0)) * 2.0
    + s(-1.0, -1.0) + s(1.0, -1.0) + s(-1.0, 1.0) + s(1.0, 1.0);
  fragColor = vec4(o / 16.0 * uMix + texture(tAdd, vUv).rgb, 1.0);
}`;

const FS_FINAL = /* glsl */ `
precision highp float;
in vec2 vUv;
out vec4 fragColor;
uniform sampler2D tScene, tBloom;
uniform vec3 uSky;
uniform float uBloom, uFrame, uExposure, uOver;
float hash12(vec2 p) {
  vec3 p3 = fract(vec3(p.xyx) * 0.1031);
  p3 += dot(p3, p3.yzx + 33.33);
  return fract((p3.x + p3.y) * p3.z);
}
vec3 toSrgb(vec3 c) {
  return mix(c * 12.92, 1.055 * pow(max(c, vec3(0.0)), vec3(1.0 / 2.4)) - 0.055, step(vec3(0.0031308), c));
}
void main() {
  vec2 uvS = 0.5 + (vUv - 0.5) / uOver;
  vec4 sc = texture(tScene, uvS);
  vec2 q = vUv - 0.5;
  float vig = 1.0 - 0.34 * smoothstep(0.25, 0.95, length(q * vec2(1.0, 0.72)) * 1.35);
  vec3 col = sc.rgb + uSky * (1.0 - sc.a) * (0.80 + 0.20 * vig);
  col += texture(tBloom, uvS).rgb * uBloom;
  col *= uExposure * vig;
  // highlight roll-off that keeps the hue, then lets the very brightest go white
  float m = max(col.r, max(col.g, col.b));
  float mt = 1.0 - exp(-m);
  col *= mt / max(m, 1e-5);
  col = mix(col, vec3(mt), smoothstep(1.6, 7.0, m) * 0.85);
  vec3 o = toSrgb(col);
  // fine grain: hides banding in the dark gradients
  vec2 px = gl_FragCoord.xy;
  float n1 = hash12(px + vec2(uFrame * 17.0, uFrame * 31.0));
  float n2 = hash12(px + vec2(uFrame * 53.0 + 11.0, uFrame * 7.0 + 5.0));
  float tri = n1 + n2 - 1.0;
  float lum = dot(o, vec3(0.3, 0.59, 0.11));
  o += tri * (1.6 + 2.4 * smoothstep(0.0, 0.5, lum) * (1.0 - smoothstep(0.6, 1.0, lum))) / 255.0;
  fragColor = vec4(o, 1.0);
}`;

function screenTriangle() {
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 3, -1, 0, -1, 3, 0]), 3));
  return geo;
}

/** A unit box without a floor: x, y in -0.5..0.5, z in 0..1, with flat normals. */
function boxGeometry() {
  const faces = [
    [[0, 0, 1], [-0.5, -0.5, 1], [0.5, -0.5, 1], [0.5, 0.5, 1], [-0.5, 0.5, 1]],
    [[0, -1, 0], [-0.5, -0.5, 0], [0.5, -0.5, 0], [0.5, -0.5, 1], [-0.5, -0.5, 1]],
    [[1, 0, 0], [0.5, -0.5, 0], [0.5, 0.5, 0], [0.5, 0.5, 1], [0.5, -0.5, 1]],
    [[0, 1, 0], [0.5, 0.5, 0], [-0.5, 0.5, 0], [-0.5, 0.5, 1], [0.5, 0.5, 1]],
    [[-1, 0, 0], [-0.5, 0.5, 0], [-0.5, -0.5, 0], [-0.5, -0.5, 1], [-0.5, 0.5, 1]],
  ];
  const pos = [];
  const nor = [];
  const idx = [];
  faces.forEach(([n, ...vs], f) => {
    vs.forEach((v) => {
      pos.push(...v);
      nor.push(...n);
    });
    idx.push(f * 4, f * 4 + 1, f * 4 + 2, f * 4, f * 4 + 2, f * 4 + 3);
  });
  const geo = new THREE.InstancedBufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(pos), 3));
  geo.setAttribute("normal", new THREE.BufferAttribute(new Float32Array(nor), 3));
  geo.setIndex(idx);
  return geo;
}

export async function create(slot, film) {
  if (!DEV.debug) return build(slot, film);
  try {
    return await build(slot, film);
  } catch (err) {
    const node = el("div.scene", { style: { background: "#400", color: "#fff", font: "500 22px/1.3 monospace", padding: "30px", whiteSpace: "pre-wrap", zIndex: "9" } });
    node.textContent = String(err && err.stack ? err.stack : err).slice(0, 3000);
    return { el: node, from: T_START, to: T_END, render() {} };
  }
}

async function build(slot, film) {
  const node = el("div.scene", { style: { background: "#152b31" } });
  if (DEV.top) node.style.zIndex = "5";

  // ---- the painted things ----
  const city = layoutCity();
  const heroS = 400;
  const heroCv = makeCanvas(3 * BAY * heroS, 2 * FLOOR * heroS);
  paintFacade(heroCv.getContext("2d"), (HERO_CELL.bay % TILE.bays - 1) * BAY, (HERO_CELL.floor % TILE.floors - 0.5) * FLOOR, (HERO_CELL.bay % TILE.bays + 2) * BAY, (HERO_CELL.floor % TILE.floors + 1.5) * FLOOR, heroS, true);
  const tileS = 80;
  const tileCv = makeCanvas(TILE.bays * BAY * tileS, TILE.floors * FLOOR * tileS);
  paintFacade(tileCv.getContext("2d"), 0, 0, TILE.bays * BAY, TILE.floors * FLOOR, tileS, false);
  const l1Cv = makeCanvas(MAP, MAP);
  paintL1(l1Cv.getContext("2d"), city);

  if (DEV.show) {
    const pick = { hero: heroCv, tile: tileCv, l1: l1Cv }[DEV.show.split(":")[0]];
    const zoom = Number(DEV.show.split(":")[1] || 0);
    pick.style.cssText = zoom
      ? `position:absolute;left:${960 - (pick.width / 2) * zoom}px;top:${540 - (pick.height / 2) * zoom}px;width:${pick.width * zoom}px;height:${pick.height * zoom}px;image-rendering:pixelated`
      : "position:absolute;left:0;top:0;height:1080px;width:auto";
    node.append(pick);
    return { el: node, from: T_START, to: T_END, render() {} };
  }

  const canvas = makeCanvas(W, H);
  canvas.style.cssText = `position:absolute;left:0;top:0;width:${W}px;height:${H}px;display:block`;
  node.append(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, depth: false, stencil: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  renderer.autoClear = false;
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
  renderer.setClearColor(0x000000, 0);
  // a shader that does not compile must stop the render, not draw nothing
  renderer.debug.onShaderError = (gl, program, vs, fs) => {
    const log = [gl.getShaderInfoLog(vs), gl.getShaderInfoLog(fs), gl.getProgramInfoLog(program)].filter(Boolean).join(" | ");
    throw new Error("earth shader: " + log.slice(0, 700));
  };

  // ---- textures ----
  const loader = new THREE.TextureLoader();
  const url = (name) => new URL(`../../assets/earth/${name}`, import.meta.url).href;
  const [tDay, tLights, tWide, tCity] = await Promise.all(
    ["day_global_4096.jpg", "lights_global_4096.jpg", "lights_india_3km.jpg", "lights_city_500m.jpg"].map((n) => loader.loadAsync(url(n))),
  );
  const [tHero, tTile, tL1] = [heroCv, tileCv, l1Cv].map((c) => new THREE.CanvasTexture(c));
  for (const tx of [tDay, tLights, tWide, tCity, tHero, tTile, tL1]) {
    tx.colorSpace = THREE.NoColorSpace;
    tx.generateMipmaps = true;
    tx.minFilter = THREE.LinearMipmapLinearFilter;
    tx.magFilter = THREE.LinearFilter;
    tx.wrapS = tx === tDay || tx === tLights || tx === tTile ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
    tx.wrapT = tx === tTile ? THREE.RepeatWrapping : THREE.ClampToEdgeWrapping;
    tx.needsUpdate = true;
    renderer.initTexture(tx);
  }

  // local frame -> Earth frame (x through 0N 0E, y through the north pole)
  const cl = Math.cos(LAT0), sl = Math.sin(LAT0), co = Math.cos(LON0), so = Math.sin(LON0);
  const gE = [-so, 0, -co];
  const gN = [-sl * co, cl, sl * so];
  const gU = [cl * co, sl, -cl * so];
  const l2g = new THREE.Matrix3().set(gE[0], gN[0], gU[0], gE[1], gN[1], gU[1], gE[2], gN[2], gU[2]);
  const toLocal = (p) => [dot(p, gE), dot(p, gN), dot(p, gU)];

  const mintLin = srgbToLinear("#b7f4cf");
  const skyLin = srgbToLinear("#152b31");
  const box = (b) => new THREE.Vector4(b.lon0, b.latTop - b.span, 1 / b.span, 1 / b.span);
  const camU = () => ({ uCam: { value: new THREE.Vector3() }, uRight: { value: new THREE.Vector3() }, uUp: { value: new THREE.Vector3() }, uFwd: { value: new THREE.Vector3() }, uTan: { value: new THREE.Vector2(TAN_X, TAN_Y) } });
  const cityU = () => ({ uAxA: { value: new THREE.Vector3(...AX_R) }, uAxB: { value: new THREE.Vector3(...AX_H) }, uNF: { value: new THREE.Vector2(1, 1000) } });
  const waveU = { value: new THREE.Vector3(112.4, 2.2, 100 * DEG) };

  // ---- the planet ----
  const planetMat = new THREE.RawShaderMaterial({
    glslVersion: THREE.GLSL3,
    vertexShader: VS_PLANET,
    fragmentShader: FS_PLANET,
    depthTest: true,
    depthWrite: false,
    uniforms: {
      ...camU(),
      uSun: { value: new THREE.Vector3() },
      uPix: { value: (2 * TAN_Y) / H },
      uT: { value: 0 },
      uWave: waveU,
      uL2G: { value: l2g },
      tDay: { value: tDay }, tLights: { value: tLights }, tWide: { value: tWide }, tCity: { value: tCity },
      tL1: { value: tL1 },
      uWideBox: { value: box(WIDE_BOX) }, uCityBox: { value: box(CITY_BOX) },
      uUseWide: { value: 0 }, uUseCity: { value: 0 }, uNear: { value: 0 },
      uAxA: { value: new THREE.Vector2(AX_R[0], AX_R[1]) }, uAxB: { value: new THREE.Vector2(AX_H[0], AX_H[1]) },
      uL1Half: { value: L1_HALF }, uCarpet: { value: 1 },
      uNightA: { value: new THREE.Vector3(0.0017, 0.0052, 0.0068) },
      uNightB: { value: new THREE.Vector3(0.019, 0.045, 0.052) },
      uAtmoCool: { value: new THREE.Vector3(0.22, 0.66, 0.72) },
      uAtmoWarm: { value: new THREE.Vector3(1.0, 0.60, 0.36) },
      uGlowCol: { value: new THREE.Vector3(0.30, 1.0, 0.55) },
      uMintCol: { value: new THREE.Vector3(...mintLin) },
      uWarm: { value: 1.15 }, uMint: { value: 3.6 }, uLGamma: { value: 1.5 }, uMGamma: { value: 1.35 },
      uAtmoK: { value: 0.05 }, uGlow: { value: 0.11 }, uDayGain: { value: 1.4 }, uAirBase: { value: 0.045 },
    },
  });
  const tri = screenTriangle();
  const planet = new THREE.Mesh(tri, planetMat);
  planet.frustumCulled = false;
  const planetScene = new THREE.Scene();
  planetScene.add(planet);
  const dummyCam = new THREE.Camera();

  // ---- the buildings near his ----
  const near3d = city.buildings.filter((b) => Math.hypot((b.a0 + b.a1) / 2, (b.b0 + b.b1) / 2 - 60) < 640);
  const rb = prng(808);
  const inst = [];
  for (const b of near3d) {
    inst.push({ rect: [(b.a0 + b.a1) / 2, (b.b0 + b.b1) / 2, b.a1 - b.a0, b.b1 - b.b0], info: [b.h, b.seed, b.lit, b.kind], more: [0, b.tone] });
    // the stair head on the roof
    const w = 3.5 + rb() * 3;
    const d = 3 + rb() * 2.5;
    const ca = b.a0 + 2.5 + w / 2 + rb() * Math.max(0.1, b.a1 - b.a0 - 5 - w);
    const cb = b.b0 + 2.5 + d / 2 + rb() * Math.max(0.1, b.b1 - b.b0 - 5 - d);
    inst.push({ rect: [ca, cb, w, d], info: [2.4 + rb() * 0.9, b.seed, 0, 2], more: [b.h, b.tone * 0.9] });
  }
  const boxGeo = boxGeometry();
  boxGeo.setAttribute("iRect", new THREE.InstancedBufferAttribute(new Float32Array(inst.flatMap((i) => i.rect)), 4));
  boxGeo.setAttribute("iInfo", new THREE.InstancedBufferAttribute(new Float32Array(inst.flatMap((i) => i.info)), 4));
  boxGeo.setAttribute("iMore", new THREE.InstancedBufferAttribute(new Float32Array(inst.flatMap((i) => i.more)), 2));
  boxGeo.instanceCount = inst.length;
  const boxMat = new THREE.RawShaderMaterial({
    glslVersion: THREE.GLSL3, vertexShader: VS_BOX, fragmentShader: FS_BOX, depthTest: true, depthWrite: true,
    uniforms: {
      ...camU(), ...cityU(), uFlatten: { value: 1 }, uAmb: { value: 1 }, uCamCity: { value: new THREE.Vector3() },
      uFog: { value: new THREE.Vector3(skyLin[0] * 0.8, skyLin[1] * 0.8, skyLin[2] * 0.8) },
      tTile: { value: tTile }, tHero: { value: tHero }, uPix: { value: (2 * TAN_Y) / H },
    },
  });
  const boxes = new THREE.Mesh(boxGeo, boxMat);
  boxes.frustumCulled = false;
  const boxScene = new THREE.Scene();
  boxScene.add(boxes);

  // ---- street lamps ----
  const additive = { blending: THREE.CustomBlending, blendEquation: THREE.AddEquation, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor, blendSrcAlpha: THREE.ZeroFactor, blendDstAlpha: THREE.OneFactor, depthWrite: false, transparent: true };
  const rl = prng(313);
  const lampGeo = new THREE.BufferGeometry();
  lampGeo.setAttribute("position", new THREE.BufferAttribute(new Float32Array(city.lamps.flatMap(([a, b]) => [a, b, 8.5])), 3));
  lampGeo.setAttribute("aSeed", new THREE.BufferAttribute(new Float32Array(city.lamps.map(() => rl())), 1));
  const lampMat = new THREE.RawShaderMaterial({
    glslVersion: THREE.GLSL3, vertexShader: VS_LAMP, fragmentShader: FS_LAMP,
    uniforms: { ...camU(), ...cityU(), uFocal: { value: FOCAL }, uFade: { value: 1 } }, ...additive, depthTest: true,
  });
  const lampPts = new THREE.Points(lampGeo, lampMat);
  lampPts.frustumCulled = false;
  const lampScene = new THREE.Scene();
  lampScene.add(lampPts);

  // ---- stars ----
  const rs = prng(20261114);
  const NSTAR = 4200;
  const starPos = new Float32Array(NSTAR * 3);
  const starDat = new Float32Array(NSTAR * 3);
  for (let i = 0; i < NSTAR; i++) {
    const z = rs() * 2 - 1;
    const a = rs() * Math.PI * 2;
    const r = Math.sqrt(1 - z * z);
    starPos.set([r * Math.cos(a), r * Math.sin(a), z], i * 3);
    const mag = Math.pow(rs(), 7);
    starDat.set([0.02 + 0.7 * mag, 2.6 + 3.4 * Math.sqrt(mag), rs()], i * 3);
  }
  const starGeo = new THREE.BufferGeometry();
  starGeo.setAttribute("position", new THREE.BufferAttribute(starPos, 3));
  starGeo.setAttribute("aStar", new THREE.BufferAttribute(starDat, 3));
  const starMat = new THREE.RawShaderMaterial({ glslVersion: THREE.GLSL3, vertexShader: VS_STARS, fragmentShader: FS_STARS, uniforms: { ...camU(), uFade: { value: 1 } }, ...additive, depthTest: false });
  const stars = new THREE.Points(starGeo, starMat);
  stars.frustumCulled = false;
  const starScene = new THREE.Scene();
  starScene.add(stars);

  // ---- the Peer's lights: one per bright place in the night-lights map ----
  const CW = 2048, CH = 1024;
  const cv = makeCanvas(CW, CH);
  const cx = cv.getContext("2d", { willReadFrequently: true });
  cx.drawImage(tLights.image, 0, 0, CW, CH);
  const lp = cx.getImageData(0, 0, CW, CH).data;
  const at = (x, y) => lp[4 * (y * CW + ((x + CW) % CW)) + 1];
  const found = [];
  for (let y = 1; y < CH - 1; y++) {
    for (let x = 0; x < CW; x++) {
      const v = at(x, y);
      if (v < 26) continue;
      if (v < at(x - 1, y) || v < at(x - 1, y - 1) || v < at(x, y - 1) || v < at(x + 1, y - 1)) continue;
      if (v <= at(x + 1, y) || v <= at(x + 1, y + 1) || v <= at(x, y + 1) || v <= at(x - 1, y + 1)) continue;
      let sx = 0, sy = 0, sw = 0;
      for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
        const w = at(x + i, y + j);
        sx += i * w; sy += j * w; sw += w;
      }
      found.push([x + 0.5 + sx / sw, y + 0.5 + sy / sw, v / 255]);
    }
  }
  found.sort((a, b) => b[2] - a[2] || a[1] - b[1] || a[0] - b[0]);
  const cities = found.slice(0, 22000);
  const rc = prng(77);
  const cityPos = new Float32Array(cities.length * 3);
  const cityDat = new Float32Array(cities.length * 3);
  cities.forEach(([x, y, v], i) => {
    const lon = (x / CW - 0.5) * 2 * Math.PI;
    const lat = (0.5 - y / CH) * Math.PI;
    const p = toLocal([Math.cos(lat) * Math.cos(lon), Math.sin(lat), -Math.cos(lat) * Math.sin(lon)]);
    cityPos.set(p, i * 3);
    cityDat.set([v, rc(), rc()], i * 3);
  });
  const cityGeo = new THREE.BufferGeometry();
  cityGeo.setAttribute("position", new THREE.BufferAttribute(cityPos, 3));
  cityGeo.setAttribute("aCity", new THREE.BufferAttribute(cityDat, 3));
  const mintMat = new THREE.RawShaderMaterial({
    glslVersion: THREE.GLSL3, vertexShader: VS_MINT, fragmentShader: FS_MINT,
    uniforms: { ...camU(), uSun: { value: new THREE.Vector3() }, uT: { value: 0 }, uWave: waveU, uFocal: { value: FOCAL }, uGain: { value: 1.3 }, uMintCol: { value: new THREE.Vector3(...mintLin) } },
    ...additive, depthTest: false,
  });
  const mintPoints = new THREE.Points(cityGeo, mintMat);
  mintPoints.frustumCulled = false;
  const mintScene = new THREE.Scene();
  mintScene.add(mintPoints);

  // the painting canvases are in the GPU now: let their memory go
  for (const c of [heroCv, tileCv, l1Cv, cv]) c.width = c.height = 1;

  // ---- render targets and the post chain ----
  const rtOpts = { type: THREE.HalfFloatType, format: THREE.RGBAFormat, depthBuffer: false, stencilBuffer: false, minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, generateMipmaps: false };
  const sceneRT = new THREE.WebGLRenderTarget(W, H, { ...rtOpts, depthBuffer: true });
  const workRT = new THREE.WebGLRenderTarget(W, H, rtOpts);
  const LEVELS = 6;
  const down = [];
  const up = [];
  for (let i = 0, w = W, h = H; i < LEVELS; i++) {
    w = Math.max(2, Math.round(w / 2));
    h = Math.max(2, Math.round(h / 2));
    down.push(new THREE.WebGLRenderTarget(w, h, rtOpts));
    up.push(new THREE.WebGLRenderTarget(w, h, rtOpts));
  }
  const post = (fs, uniforms, extra = {}) => new THREE.RawShaderMaterial({ glslVersion: THREE.GLSL3, vertexShader: VS_SCREEN, fragmentShader: fs, uniforms, depthTest: false, depthWrite: false, ...extra });
  const downMat = post(FS_DOWN, { tSrc: { value: null }, uTexel: { value: new THREE.Vector2() }, uThr: { value: 0 } });
  const upMat = post(FS_UP, { tSrc: { value: null }, tAdd: { value: null }, uTexel: { value: new THREE.Vector2() }, uMix: { value: 1 } });
  const moveMat = post(FS_MOVE, { tSrc: { value: null }, uA: { value: new THREE.Matrix3() }, uB: { value: new THREE.Matrix3() }, uSize: { value: new THREE.Vector2(W, H) }, uFrame: { value: 0 }, uKind: { value: 0 }, uTaps: { value: 8 } });
  const finalMat = post(FS_FINAL, { tScene: { value: null }, tBloom: { value: null }, uSky: { value: new THREE.Vector3(...skyLin) }, uBloom: { value: 0.44 }, uFrame: { value: 0 }, uExposure: { value: 1 }, uOver: { value: 1 } });
  const postMesh = new THREE.Mesh(tri, downMat);
  postMesh.frustumCulled = false;
  const postScene = new THREE.Scene();
  postScene.add(postMesh);
  const pass = (mat, target) => {
    postMesh.material = mat;
    renderer.setRenderTarget(target);
    renderer.render(postScene, dummyCam);
  };
  const BLOOM_W = [1.0, 0.8, 0.6, 0.42, 0.28, 0.18];

  const setCam = (u, c, over) => {
    u.uCam.value.set(c.pos[0], c.pos[1], c.pos[2]);
    u.uRight.value.set(c.right[0], c.right[1], c.right[2]);
    u.uUp.value.set(c.up[0], c.up[1], c.up[2]);
    u.uFwd.value.set(c.fwd[0], c.fwd[1], c.fwd[2]);
    u.uTan.value.set(TAN_X * over, TAN_Y * over);
  };

  /** The part of the frame the planet and its air can reach, as a scissor box, or null for all of it. */
  function planetBox(c, over) {
    const v = sub(CENTRE, c.pos);
    const reach = RE + 4.2e5;
    const cz = dot(v, c.fwd);
    if (cz - reach < 1) return null; // the ball comes level with the camera: no box holds it
    // the two planes through the eye that touch the ball, seen along one axis of the frame
    const span = (cx) => {
      const psi = Math.atan2(cz, cx);
      const del = Math.acos(reach / Math.hypot(cx, cz));
      const a = -Math.tan(psi + del);
      const b = -Math.tan(psi - del);
      return [Math.min(a, b), Math.max(a, b)];
    };
    const f = FOCAL / over;
    const [xa, xb] = span(dot(v, c.right));
    const [ya, yb] = span(dot(v, c.up));
    const x0 = Math.max(0, Math.floor(W / 2 + xa * f) - 3);
    const y0 = Math.max(0, Math.floor(H / 2 + ya * f) - 3);
    const x1 = Math.min(W, Math.ceil(W / 2 + xb * f) + 3);
    const y1 = Math.min(H, Math.ceil(H / 2 + yb * f) + 3);
    if (x1 <= x0 || y1 <= y0 || (x1 - x0) * (y1 - y0) > 0.85 * W * H) return null;
    return [x0, y0, x1 - x0, y1 - y0];
  }

  /** The scene at time t, into sceneRT. `over` widens the view (the zoom blur needs a margin). */
  function expose(t, over) {
    const c = cameraAt(t);
    const pix = (2 * TAN_Y * over) / H;
    const nf = [Math.max(0.3, c.d * 0.03), c.d * 14 + 3000];
    renderer.setRenderTarget(sceneRT);
    renderer.clear(true, true, false);

    // the buildings first: the ground is then only worked out where they leave it showing
    const flatten = 1 - smooth(3.05, 3.7, c.s);
    const amb = lerp(1, 0.32, smooth(2.0, 3.2, c.s));
    if (flatten > 0.002) {
      const bu = boxMat.uniforms;
      setCam(bu, c, over);
      bu.uNF.value.set(nf[0], nf[1]);
      bu.uFlatten.value = flatten;
      bu.uAmb.value = amb;
      bu.uCamCity.value.set(dot(c.pos, AX_R), dot(c.pos, AX_H), c.pos[2]);
      bu.uPix.value = pix;
      renderer.render(boxScene, dummyCam);
    }

    const pu = planetMat.uniforms;
    setCam(pu, c, over);
    pu.uSun.value.set(c.sun[0], c.sun[1], c.sun[2]);
    pu.uT.value = t;
    pu.uPix.value = pix;
    pu.uUseWide.value = smooth(7.25, 6.9, c.s);
    pu.uUseCity.value = smooth(6.3, 5.9, c.s);
    pu.uNear.value = smooth(6.5, 6.1, c.s);
    // close in, the city's light is spread over many lamps: turn the far map's blaze down to match
    const open = lerp(1, 1.15 / NEAR_LIGHT, smooth(4.9, 6.6, c.s));
    pu.uWarm.value = NEAR_LIGHT * open;
    pu.uCarpet.value = 0.62 * open;
    const sbox = planetBox(c, over);
    if (sbox) {
      sceneRT.scissor.set(sbox[0], sbox[1], sbox[2], sbox[3]);
      sceneRT.scissorTest = true;
      renderer.setRenderTarget(sceneRT);
    }
    renderer.render(planetScene, dummyCam);
    if (sbox) {
      sceneRT.scissorTest = false;
      renderer.setRenderTarget(sceneRT);
    }

    const lampFade = 1 - smooth(2.6, 6.0, c.d * pix);
    if (lampFade > 0.002) {
      const lu = lampMat.uniforms;
      setCam(lu, c, over);
      lu.uNF.value.set(nf[0], nf[1]);
      lu.uFocal.value = FOCAL / over;
      lu.uFade.value = lampFade;
      renderer.render(lampScene, dummyCam);
    }
    const starFade = smooth(6.2, 6.9, c.s);
    if (starFade > 0) {
      setCam(starMat.uniforms, c, over);
      starMat.uniforms.uFade.value = starFade;
      renderer.render(starScene, dummyCam);
    }
    if (t > waveU.value.x - 0.05) {
      const mu = mintMat.uniforms;
      setCam(mu, c, over);
      mu.uSun.value.set(c.sun[0], c.sun[1], c.sun[2]);
      mu.uT.value = t;
      mu.uFocal.value = FOCAL / over;
      renderer.render(mintScene, dummyCam);
    }
  }

  const SHUTTER = 0.36; // of a frame
  /**
   * Where the picture sits when the shutter opens and when it closes, as two maps of the frame
   * (pixels from the middle, y up), fitted to three points of the ground under the camera.
   */
  function shutterMaps(t) {
    const h = SHUTTER / 30 / 2;
    const c0 = cameraAt(t);
    const src = [[0, -140], [-620, -400], [620, -400]];
    const world = src.map(([x, y]) => {
      const dir = norm(add(add(c0.fwd, mul(c0.right, x / FOCAL)), mul(c0.up, y / FOCAL)));
      const oc = sub(c0.pos, CENTRE);
      const b = dot(oc, dir);
      const disc = b * b - (dot(oc, oc) - RE * RE);
      return add(c0.pos, mul(dir, disc > 0 && b < 0 ? -b - Math.sqrt(disc) : 1e13));
    });
    const fit = (cam) => {
      const d = world.map((X) => {
        const v = sub(X, cam.pos);
        const z = dot(v, cam.fwd);
        return [(FOCAL * dot(v, cam.right)) / z, (FOCAL * dot(v, cam.up)) / z];
      });
      const [[x0, y0], [x1, y1], [x2, y2]] = src;
      const det = x0 * (y1 - y2) - y0 * (x1 - x2) + (x1 * y2 - x2 * y1);
      const row = (u0, u1, u2) => [
        (u0 * (y1 - y2) - y0 * (u1 - u2) + (u1 * y2 - u2 * y1)) / det,
        (x0 * (u1 - u2) - u0 * (x1 - x2) + (x1 * u2 - x2 * u1)) / det,
        (x0 * (y1 * u2 - y2 * u1) - y0 * (x1 * u2 - x2 * u1) + u0 * (x1 * y2 - x2 * y1)) / det,
      ];
      return [row(d[0][0], d[1][0], d[2][0]), row(d[0][1], d[1][1], d[2][1])];
    };
    return [fit(cameraAt(t - h)), fit(cameraAt(t + h))];
  }
  const applyMap = (m, x, y) => [m[0][0] * x + m[0][1] * y + m[0][2], m[1][0] * x + m[1][1] * y + m[1][2]];

  function draw(t) {
    const frame = Math.round(t * 30) % 1024;
    // The pull-out is a pure zoom about the middle, and wants a margin round the frame to blur from.
    const rate = (sAt(t + 1 / 120) - sAt(t - 1 / 120)) * 60;
    let zoomK = t < T_APEX + 0.2 ? Math.abs(rate) * Math.LN10 * (SHUTTER / 30) * 0.5 : 0;
    if (zoomK < 0.0015) zoomK = 0;
    const over = 1 + zoomK * 1.02;
    expose(t, over);

    const maps = zoomK > 0 ? [[[1 - zoomK, 0, 0], [0, 1 - zoomK, 0]], [[1 + zoomK, 0, 0], [0, 1 + zoomK, 0]]] : shutterMaps(t);
    let reach = 0;
    for (const [x, y] of [[-960, -540], [960, -540], [-960, 540], [960, 540], [0, 0]]) {
      const a = applyMap(maps[0], x, y);
      const b = applyMap(maps[1], x, y);
      reach = Math.max(reach, Math.hypot(a[0] - b[0], a[1] - b[1]));
    }
    if (reach > 0.8) {
      // two passes of a little over half the smear each
      const part = (m) => new THREE.Matrix3().set(1 + 0.58 * (m[0][0] - 1), 0.58 * m[0][1], 0.58 * m[0][2], 0.58 * m[1][0], 1 + 0.58 * (m[1][1] - 1), 0.58 * m[1][2], 0, 0, 1);
      const mv = moveMat.uniforms;
      mv.uA.value.copy(part(maps[0]));
      mv.uB.value.copy(part(maps[1]));
      mv.uTaps.value = clamp(Math.ceil((reach * 0.58) / 2.2), 3, 16);
      mv.tSrc.value = sceneRT.texture;
      mv.uFrame.value = frame;
      mv.uKind.value = 0;
      pass(moveMat, workRT);
      mv.tSrc.value = workRT.texture;
      mv.uFrame.value = frame + 37;
      mv.uKind.value = 1;
      pass(moveMat, sceneRT);
    }

    // bloom
    let src = sceneRT;
    for (let i = 0; i < LEVELS; i++) {
      downMat.uniforms.tSrc.value = src.texture;
      downMat.uniforms.uTexel.value.set(1 / src.width, 1 / src.height);
      downMat.uniforms.uThr.value = i === 0 ? 0.03 : 0;
      pass(downMat, down[i]);
      src = down[i];
    }
    let acc = down[LEVELS - 1];
    for (let i = LEVELS - 2; i >= 0; i--) {
      upMat.uniforms.tSrc.value = acc.texture;
      upMat.uniforms.tAdd.value = down[i].texture;
      upMat.uniforms.uTexel.value.set(1 / acc.width, 1 / acc.height);
      upMat.uniforms.uMix.value = BLOOM_W[i + 1];
      pass(upMat, up[i]);
      acc = up[i];
    }
    finalMat.uniforms.tScene.value = sceneRT.texture;
    finalMat.uniforms.tBloom.value = acc.texture;
    finalMat.uniforms.uFrame.value = frame;
    finalMat.uniforms.uOver.value = over;
    finalMat.uniforms.uBloom.value = lerp(0.32, 0.50, smooth(5.0, 6.6, sAt(t)));
    pass(finalMat, null);
  }

  // Compile and upload everything now: frames are captured out of order by several workers.
  for (const t of [T_START, 113.3, 115.1]) draw(t);

  return { el: node, from: T_START, to: T_END, render: draw };
}
