// The tiny company: a floating island with its buildings, trees, paths, clouds, sky and light.
// Built once in init; scene.js moves things from t. Everything is seeded, nothing is random.
import * as THREE from "three";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { rng } from "../shared/kit.js";

export const ISL = { A: 8, B: 4.5, R: 1.15 }; // the island top is today's page: 16 x 9 units
export const BS = 0.9; // building scale

export const SITES = {
  house: { x: 0.25, z: 0.05, yaw: 0.45 },
  directory: { x: -5.45, z: -0.9, yaw: 0.9 },
  docs: { x: -2.15, z: -2.85, yaw: 0.35 },
  slack: { x: 2.75, z: -2.85, yaw: -0.15 },
  code: { x: 5.8, z: -0.75, yaw: -0.55 },
  tickets: { x: 5.1, z: 2.75, yaw: -0.6 },
  mail: { x: -2.75, z: 2.75, yaw: 0.62 },
  vault: { x: -6.25, z: 2.95, yaw: 0.85 },
  billboard: { x: 0.5, z: -3.75, yaw: 0.22 },
};

// Source hues (data.js), with a deeper sand for the directory so its pins read on paper.
export const HUE = { directory: "#d9c38f", docs: "#7aa7ff", slack: "#b28cff", code: "#5fd4c4", tickets: "#ffb547", mail: "#ff8a9a" };

const cache = new Map();
export function mat(hex) {
  if (!cache.has(hex)) cache.set(hex, new THREE.MeshLambertMaterial({ color: hex, flatShading: true }));
  return cache.get(hex);
}
export const umat = (hex, o = {}) => new THREE.MeshLambertMaterial({ color: hex, flatShading: true, ...o });
export function M(geo, m, parent, x = 0, y = 0, z = 0, cast = true) {
  const o = new THREE.Mesh(geo, m);
  o.position.set(x, y, z);
  o.castShadow = cast;
  o.receiveShadow = true;
  parent.add(o);
  return o;
}
export const rbox = (w, h, d, r = 0.05, s = 2) => new RoundedBoxGeometry(w, h, d, s, Math.min(r, w / 2 - 0.002, h / 2 - 0.002, d / 2 - 0.002));
const cyl = (rt, rb, h, n = 12) => new THREE.CylinderGeometry(rt, rb, h, n);
const sph = (r, a = 12, b = 8) => new THREE.SphereGeometry(r, a, b);

// A gable roof: a triangular prism, ridge along z (gable ends at front and back) unless alongX.
function gable(len, height, width, alongX = false) {
  const s = new THREE.Shape();
  s.moveTo(-width / 2, 0); s.lineTo(width / 2, 0); s.lineTo(0, height); s.closePath();
  const g = new THREE.ExtrudeGeometry(s, { depth: len, bevelEnabled: false });
  g.translate(0, 0, -len / 2);
  if (alongX) g.rotateY(Math.PI / 2);
  return g;
}
// A hip (pyramid) roof over a w x d box, base at y = 0.
function hip(w, d, h) {
  const g = new THREE.ConeGeometry(1, h, 4, 1);
  g.rotateY(Math.PI / 4);
  g.scale(w / Math.SQRT2, 1, d / Math.SQRT2);
  g.translate(0, h / 2, 0);
  return g;
}

// Canvas textures.
export function canvasTex(w, h, draw, renderer) {
  const c = document.createElement("canvas");
  c.width = w; c.height = h;
  const g = c.getContext("2d");
  draw(g, w, h);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = renderer ? Math.min(8, renderer.capabilities.getMaxAnisotropy()) : 4;
  return t;
}
function rr(g, x, y, w, h, r) {
  g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath();
}

// World point of a local point of a site (rotate by yaw, scale, add the site).
export function toWorld(site, lx, ly, lz, s = BS) {
  const c = Math.cos(site.yaw), n = Math.sin(site.yaw);
  return new THREE.Vector3(site.x + (lx * c + lz * n) * s, ly * s, site.z + (-lx * n + lz * c) * s);
}

// ---------------------------------------------------------------- pieces
function windowPane(parent, x, y, z, w, h, frame = "#ffffff", round = false) {
  const pm = umat("#b9d6e8", { emissive: new THREE.Color("#ffc46b"), emissiveIntensity: 0 });
  if (round) {
    const f = M(new THREE.CylinderGeometry(w / 2 + 0.04, w / 2 + 0.04, 0.04, 20), mat(frame), parent, x, y, z - 0.005);
    f.rotation.x = Math.PI / 2;
    const p = M(new THREE.CylinderGeometry(w / 2, w / 2, 0.05, 20), pm, parent, x, y, z + 0.005, false);
    p.rotation.x = Math.PI / 2;
  } else {
    M(rbox(w + 0.08, h + 0.08, 0.04, 0.015), mat(frame), parent, x, y, z - 0.005);
    M(new THREE.BoxGeometry(w, h, 0.05), pm, parent, x, y, z + 0.005, false);
    M(new THREE.BoxGeometry(w, 0.025, 0.06), mat(frame), parent, x, y, z + 0.01, false);
  }
  return pm;
}
// A door on a hinge, with a warm doorway behind it that glows when it opens.
function door(parent, x, y0, zf, w, h, color, dbl = false) {
  const inner = new THREE.MeshBasicMaterial({ color: "#3b2a22" });
  M(new THREE.PlaneGeometry(w, h), inner, parent, x, y0 + h / 2, zf + 0.004, false);
  for (const s of [-1, 1]) M(new THREE.BoxGeometry(0.05, h + 0.05, 0.05), mat("#ffffff"), parent, x + s * (w / 2 + 0.025), y0 + h / 2 + 0.012, zf + 0.012);
  M(new THREE.BoxGeometry(w + 0.1, 0.05, 0.05), mat("#ffffff"), parent, x, y0 + h + 0.025, zf + 0.012);
  const z = zf + 0.032;
  const leaves = [];
  const n = dbl ? 2 : 1, lw = w / n;
  for (let i = 0; i < n; i++) {
    const side = dbl ? (i === 0 ? -1 : 1) : -1;
    const pivot = new THREE.Group();
    pivot.position.set(x + side * w / 2, y0, z);
    parent.add(pivot);
    const leaf = M(rbox(lw - 0.006, h, 0.04, 0.012), mat(color), pivot, -side * lw / 2, h / 2, 0);
    M(sph(0.022, 6, 4), mat("#f6d27a"), leaf, -side * (lw / 2 - 0.06), -0.02, 0.03, false);
    leaves.push({ pivot, side });
  }
  const lightM = new THREE.MeshBasicMaterial({ color: "#ff6b6b" });
  M(sph(0.045, 10, 8), lightM, parent, x, y0 + h + 0.15, zf + 0.03, false);
  return { leaves, inner, lightM };
}
function plinth(parent, w, d, color = "#efe8dc") {
  M(rbox(w, 0.14, d, 0.05), mat(color), parent, 0, 0.07, 0);
}
function steps(parent, z, w) {
  for (let i = 0; i < 2; i++) M(rbox(w - i * 0.12, 0.06, 0.16, 0.02), mat("#f4efe6"), parent, 0, 0.14 + 0.03 + i * 0.06, z + 0.12 - i * 0.1);
}

// ---------------------------------------------------------------- buildings
function townHall(g, tex) {
  plinth(g, 3.1, 2.3, "#efe7d6");
  M(rbox(2.5, 1.15, 1.45, 0.05), mat("#fbf1dc"), g, 0, 0.14 + 0.575, -0.1);
  M(rbox(2.66, 0.12, 1.6, 0.04), mat("#ffffff"), g, 0, 1.35, -0.1);
  M(hip(2.6, 1.55, 0.36), mat("#e7cf9c"), g, 0, 1.41, -0.1);
  // portico: columns, slab, pediment
  for (const cx of [-0.78, -0.3, 0.3, 0.78]) {
    M(cyl(0.062, 0.07, 0.95, 10), mat("#ffffff"), g, cx, 0.14 + 0.475, 0.86);
    M(rbox(0.17, 0.06, 0.17, 0.02), mat("#f3ead8"), g, cx, 0.17, 0.86);
  }
  M(rbox(1.95, 0.1, 0.55, 0.03), mat("#ffffff"), g, 0, 1.14, 0.84);
  M(gable(0.5, 0.3, 1.95, true), mat("#efdcb5"), g, 0, 1.19, 0.84);
  // tower, dome, clock, flag
  M(rbox(0.72, 0.6, 0.72, 0.04), mat("#fbf1dc"), g, 0, 1.45 + 0.3, -0.15);
  const dome = new THREE.SphereGeometry(0.42, 10, 5, 0, Math.PI * 2, 0, Math.PI / 2);
  M(dome, mat("#e9c584"), g, 0, 2.05, -0.15);
  const clock = M(cyl(0.2, 0.2, 0.03, 20), mat("#ffffff"), g, 0, 1.76, 0.215, false);
  clock.rotation.x = Math.PI / 2;
  const handA = M(new THREE.BoxGeometry(0.02, 0.13, 0.01), mat("#4b4b55"), g, 0, 1.8, 0.235, false);
  const handB = M(new THREE.BoxGeometry(0.02, 0.09, 0.01), mat("#4b4b55"), g, 0.03, 1.76, 0.235, false);
  handB.rotation.z = -1.2;
  M(cyl(0.016, 0.016, 0.95, 6), mat("#d9b45f"), g, 0, 2.45 + 0.47, -0.15);
  M(sph(0.035, 8, 6), mat("#f0c75e"), g, 0, 3.4, -0.15, false);
  const flagGeo = new THREE.PlaneGeometry(0.95, 0.5, 10, 2);
  flagGeo.translate(0.475, 0, 0);
  const flag = M(flagGeo, new THREE.MeshLambertMaterial({ map: tex.flag, side: THREE.DoubleSide }), g, 0.0, 3.1, -0.15);
  const d = door(g, 0, 0.14, 0.625, 0.5, 0.58, "#c48a58", true);
  const wins = [];
  for (const y of [0.52, 0.98]) for (const x of [-1.0, -0.62, 0.62, 1.0]) wins.push(windowPane(g, x, y, 0.632, 0.2, 0.28));
  steps(g, 0.98, 1.1);
  return { door: d, wins, flag, flagBase: flagGeo.attributes.position.array.slice(), hands: [handA, handB], front: 1.15, top: 3.0 };
}

function library(g) {
  plinth(g, 2.7, 2.1, "#e8edf6");
  M(rbox(2.2, 1.35, 1.5, 0.05), mat("#e7efff"), g, 0, 0.14 + 0.675, -0.05);
  M(rbox(2.36, 0.1, 1.66, 0.03), mat("#ffffff"), g, 0, 1.52, -0.05);
  M(hip(2.42, 1.72, 0.62), mat("#8db1ff"), g, 0, 1.56, -0.05);
  M(rbox(0.5, 0.35, 0.5, 0.04), mat("#e7efff"), g, 0.55, 2.0, -0.3); // a little reading-room turret
  M(hip(0.62, 0.62, 0.32), mat("#7aa2f5"), g, 0.55, 2.17, -0.3);
  const d = door(g, 0, 0.14, 0.7, 0.4, 0.58, "#5b84e0");
  const wins = [];
  wins.push(windowPane(g, 0, 1.12, 0.705, 0.42, 0.42, "#ffffff", true));
  for (const y of [0.55, 1.08]) for (const x of [-0.72, 0.72]) wins.push(windowPane(g, x, y, 0.705, 0.24, 0.3));
  // an open book on a pedestal
  M(rbox(0.22, 0.3, 0.22, 0.03), mat("#dfe7f5"), g, -1.02, 0.29, 0.78);
  for (const s of [-1, 1]) {
    const p = M(new THREE.BoxGeometry(0.2, 0.015, 0.26), mat("#ffffff"), g, -1.02 + s * 0.1, 0.48, 0.78);
    p.rotation.z = s * 0.28;
  }
  M(new THREE.BoxGeometry(0.03, 0.02, 0.27), mat("#7aa7ff"), g, -1.02, 0.465, 0.78, false);
  steps(g, 0.9, 0.9);
  return { door: d, wins, front: 1.05, top: 2.4 };
}

function bubbleGeo(w, h, flip = false) {
  const s = new THREE.Shape();
  const r = h * 0.42, x0 = -w / 2, y0 = 0;
  s.moveTo(x0 + r, y0); s.lineTo(x0 + w * (flip ? 0.75 : 0.25) - 0.05, y0);
  s.lineTo(x0 + w * (flip ? 0.85 : 0.15), y0 - 0.14); s.lineTo(x0 + w * (flip ? 0.75 : 0.25) + 0.07, y0);
  s.lineTo(x0 + w - r, y0); s.quadraticCurveTo(x0 + w, y0, x0 + w, y0 + r);
  s.lineTo(x0 + w, y0 + h - r); s.quadraticCurveTo(x0 + w, y0 + h, x0 + w - r, y0 + h);
  s.lineTo(x0 + r, y0 + h); s.quadraticCurveTo(x0, y0 + h, x0, y0 + h - r);
  s.lineTo(x0, y0 + r); s.quadraticCurveTo(x0, y0, x0 + r, y0);
  const g = new THREE.ExtrudeGeometry(s, { depth: 0.1, bevelEnabled: true, bevelThickness: 0.03, bevelSize: 0.03, bevelSegments: 2, curveSegments: 6 });
  g.translate(0, 0, -0.05);
  return g;
}
function plaza(g) {
  const R = 1.2;
  M(cyl(R + 0.05, R + 0.1, 0.12, 32), mat("#efe6ff"), g, 0, 0.06, 0);
  M(cyl(0.72, 0.72, 0.124, 32), mat("#e2d2ff"), g, 0, 0.062, 0, false);
  // fence: posts around, a gap at the front for the gate
  const gate = 0.36; // half angle of the gate gap
  const posts = [];
  for (let i = 0; i < 18; i++) {
    const a = Math.PI / 2 + gate + (i / 17) * (Math.PI * 2 - 2 * gate);
    posts.push([Math.cos(a) * R, Math.sin(a) * R]);
  }
  posts.forEach(([x, z], i) => {
    M(cyl(0.03, 0.03, 0.44, 6), mat("#ffffff"), g, x, 0.12 + 0.22, z);
    if (i < posts.length - 1) {
      const [x2, z2] = posts[i + 1];
      const len = Math.hypot(x2 - x, z2 - z);
      for (const y of [0.24, 0.42]) {
        const r = M(new THREE.BoxGeometry(len, 0.035, 0.03), mat("#ffffff"), g, (x + x2) / 2, y, (z + z2) / 2);
        r.rotation.y = -Math.atan2(z2 - z, x2 - x);
      }
    }
  });
  // gate posts and two gate leaves (hinged at the posts, swing inward)
  const gx = Math.sin(gate) * R, gz = Math.cos(gate) * R;
  for (const s of [-1, 1]) {
    M(cyl(0.05, 0.05, 0.7, 8), mat("#ffffff"), g, s * gx, 0.12 + 0.35, gz);
    M(sph(0.075, 10, 8), mat("#c9adff"), g, s * gx, 0.86, gz, false);
  }
  const leaves = [];
  for (const s of [-1, 1]) {
    const pivot = new THREE.Group();
    pivot.position.set(s * gx, 0.12, gz);
    g.add(pivot);
    const lw = gx - 0.03;
    M(rbox(lw, 0.05, 0.035, 0.012), mat("#d7c3ff"), pivot, -s * lw / 2, 0.14, 0);
    M(rbox(lw, 0.05, 0.035, 0.012), mat("#d7c3ff"), pivot, -s * lw / 2, 0.47, 0);
    for (let k = 0; k < 4; k++) M(new THREE.BoxGeometry(0.025, 0.36, 0.025), mat("#e8dcff"), pivot, -s * (0.05 + k * (lw - 0.1) / 3), 0.3, 0);
    leaves.push({ pivot, side: s });
  }
  const lightM = new THREE.MeshBasicMaterial({ color: "#ff6b6b" });
  M(sph(0.05, 10, 8), lightM, g, gx + 0.0, 0.98, gz, false);
  // three chat bubbles on poles and two benches
  const bub = [];
  [[-0.42, 1.15, -0.15, 0.62, "#c4a3ff", false], [0.38, 0.92, -0.35, 0.56, "#ffffff", true], [0.02, 1.52, -0.55, 0.5, "#e6d8ff", false]].forEach(([x, y, z, w, c, f]) => {
    M(cyl(0.022, 0.022, y - 0.1, 6), mat("#d8cdf0"), g, x, 0.12 + (y - 0.1) / 2, z);
    const m = umat(c, { emissive: new THREE.Color("#b28cff"), emissiveIntensity: 0 });
    const b = M(bubbleGeo(w, w * 0.62, f), m, g, x, y, z);
    b.rotation.y = 0.12 * (f ? -1 : 1);
    for (let k = 0; k < 3; k++) M(sph(0.035, 8, 6), mat(c === "#ffffff" ? "#b28cff" : "#ffffff"), b, -0.13 + k * 0.13, w * 0.31, 0.09, false);
    bub.push({ mesh: b, m, y });
  });
  for (const [x, z, r] of [[-0.8, 0.25, 0.9], [0.8, 0.3, -0.9]]) {
    const b = new THREE.Group();
    b.position.set(x, 0.12, z); b.rotation.y = r; g.add(b);
    M(rbox(0.42, 0.05, 0.14, 0.02), mat("#c99566"), b, 0, 0.17, 0);
    M(rbox(0.42, 0.12, 0.035, 0.015), mat("#c99566"), b, 0, 0.27, -0.07);
    for (const s of [-1, 1]) M(new THREE.BoxGeometry(0.03, 0.15, 0.12), mat("#8a6a52"), b, s * 0.17, 0.075, 0);
  }
  return { gate: leaves, lightM, bub, wins: bub.map((b) => b.m), front: R, top: 2.0, gatePos: [0, 0.6, gz] };
}

function workshop(g, tex) {
  plinth(g, 2.6, 2.1, "#e2efeb");
  M(rbox(2.1, 1.2, 1.55, 0.05), mat("#d8f4ee"), g, 0, 0.14 + 0.6, -0.05);
  // saw-tooth roof: three teeth
  for (let i = 0; i < 3; i++) {
    const s = new THREE.Shape();
    s.moveTo(0, 0); s.lineTo(0.517, 0); s.lineTo(0, 0.42); s.closePath();
    const geo = new THREE.ExtrudeGeometry(s, { depth: 2.18, bevelEnabled: false });
    geo.translate(0, 0, -1.09); geo.rotateY(Math.PI / 2);
    const zp = -0.825 + (i + 1) * 0.517;
    M(geo, mat("#67cfbf"), g, 0, 1.34, zp);
    M(new THREE.BoxGeometry(2.1, 0.3, 0.02), mat("#c6f1ff"), g, 0, 1.34 + 0.2, zp + 0.004, false);
  }
  // the gear on the front, which turns while it reads
  const gear = new THREE.Group();
  gear.position.set(-0.55, 0.95, 0.74);
  g.add(gear);
  const disk = M(cyl(0.26, 0.26, 0.07, 18), mat("#3fae9f"), gear, 0, 0, 0);
  disk.rotation.x = Math.PI / 2;
  for (let k = 0; k < 10; k++) {
    const a = (k / 10) * Math.PI * 2;
    const t = M(new THREE.BoxGeometry(0.1, 0.1, 0.07), mat("#3fae9f"), gear, Math.cos(a) * 0.3, Math.sin(a) * 0.3, 0);
    t.rotation.z = a;
  }
  const hub = M(cyl(0.08, 0.08, 0.1, 12), mat("#bff2e8"), gear, 0, 0, 0.02);
  hub.rotation.x = Math.PI / 2;
  const d = door(g, 0.45, 0.14, 0.725, 0.46, 0.62, "#3aa596");
  const wins = [windowPane(g, -0.75, 0.48, 0.73, 0.24, 0.24), windowPane(g, -0.35, 0.48, 0.73, 0.24, 0.24), windowPane(g, 0.62, 1.05, 0.73, 0.5, 0.2)];
  M(new THREE.PlaneGeometry(0.46, 0.2), new THREE.MeshLambertMaterial({ map: tex.code }), g, 0.45, 0.94, 0.735, false);
  M(cyl(0.08, 0.09, 0.5, 10), mat("#a9b8b5"), g, 0.72, 1.7, -0.55);
  return { door: d, wins, gear, chimney: [0.72, 2.0, -0.55], front: 1.05, top: 2.1 };
}

function ticketOffice(g, tex) {
  plinth(g, 2.2, 1.95, "#f2ebdf");
  M(rbox(1.7, 1.1, 1.35, 0.05), mat("#fff0d4"), g, 0, 0.14 + 0.55, -0.05);
  M(rbox(1.86, 0.1, 1.5, 0.03), mat("#ffffff"), g, 0, 1.28, -0.05);
  M(hip(1.9, 1.56, 0.7), mat("#ffbe62"), g, 0, 1.32, -0.05);
  const wins = [windowPane(g, -0.36, 0.75, 0.625, 0.56, 0.3), windowPane(g, 0.62, 0.95, 0.625, 0.2, 0.2)];
  M(rbox(0.66, 0.05, 0.14, 0.015), mat("#ffffff"), g, -0.36, 0.57, 0.68);
  const aw = M(new THREE.PlaneGeometry(0.8, 0.34), new THREE.MeshLambertMaterial({ map: tex.awning, side: THREE.DoubleSide }), g, -0.36, 1.03, 0.76, false);
  aw.rotation.x = -0.9;
  const d = door(g, 0.42, 0.14, 0.625, 0.36, 0.56, "#e3922f");
  // a big ticket on a post on the roof
  M(cyl(0.02, 0.02, 0.45, 6), mat("#ffffff"), g, 0, 2.05, -0.05);
  const tk = M(new THREE.PlaneGeometry(0.92, 0.46), new THREE.MeshLambertMaterial({ map: tex.ticket, transparent: true, alphaTest: 0.5, side: THREE.DoubleSide }), g, 0, 2.38, -0.04);
  return { door: d, wins, sign: tk, front: 0.98, top: 2.7 };
}

function postOffice(g, tex) {
  plinth(g, 2.6, 2.1, "#f6eaea");
  M(rbox(2.05, 1.25, 1.45, 0.05), mat("#ffe8eb"), g, 0, 0.14 + 0.625, -0.05);
  M(gable(2.3, 0.62, 1.78, true), mat("#ff9aa8"), g, 0, 1.39, -0.05);
  M(new THREE.PlaneGeometry(0.56, 0.36), new THREE.MeshLambertMaterial({ map: tex.envelope }), g, 0, 1.08, 0.68, false);
  const d = door(g, 0, 0.14, 0.675, 0.38, 0.56, "#e35d74");
  const wins = [windowPane(g, -0.66, 0.62, 0.677, 0.26, 0.3), windowPane(g, 0.66, 0.62, 0.677, 0.26, 0.3)];
  // the mailbox out front
  M(cyl(0.025, 0.025, 0.3, 6), mat("#8a6a52"), g, 0.92, 0.29, 0.9);
  M(rbox(0.22, 0.2, 0.3, 0.06), mat("#ff7b8f"), g, 0.92, 0.52, 0.9);
  M(new THREE.BoxGeometry(0.12, 0.015, 0.02), mat("#5a2a35"), g, 0.92, 0.56, 1.055, false);
  return { door: d, wins, front: 1.05, top: 2.2 };
}

function vault(g) {
  plinth(g, 2.4, 2.0, "#dfe2e8");
  M(rbox(1.9, 1.1, 1.5, 0.05), mat("#a6afbf"), g, 0, 0.14 + 0.55, -0.05);
  M(rbox(2.06, 0.16, 1.66, 0.04), mat("#8b95a7"), g, 0, 1.3, -0.05);
  M(rbox(1.7, 0.1, 1.3, 0.03), mat("#97a1b2"), g, 0, 1.42, -0.05);
  const vd = new THREE.Group();
  vd.position.set(0, 0.6, 0.71);
  g.add(vd);
  const disk = M(cyl(0.36, 0.36, 0.08, 24), mat("#cdd3dd"), vd, 0, 0, 0);
  disk.rotation.x = Math.PI / 2;
  const ring = M(new THREE.TorusGeometry(0.36, 0.035, 6, 24), mat("#8e98a8"), vd, 0, 0, 0.04);
  for (let k = 0; k < 3; k++) {
    const sp = M(new THREE.BoxGeometry(0.46, 0.035, 0.03), mat("#7e889a"), vd, 0, 0, 0.06);
    sp.rotation.z = (k / 3) * Math.PI;
  }
  const lightM = new THREE.MeshBasicMaterial({ color: "#ff5f5f" });
  M(sph(0.05, 10, 8), lightM, g, 0, 1.08, 0.72, false);
  const wins = [];
  for (const x of [-0.68, 0.68]) {
    const w = windowPane(g, x, 0.75, 0.7, 0.2, 0.22, "#8b95a7");
    w.color.set("#5b6476");
    wins.push(w);
    for (let k = 0; k < 3; k++) M(new THREE.BoxGeometry(0.018, 0.22, 0.02), mat("#59616f"), g, x - 0.06 + k * 0.06, 0.75, 0.735, false);
  }
  return { lightM, vdoor: vd, wins, front: 1.0, top: 1.6 };
}

function billboard(g, tex) {
  for (const x of [-0.85, 0.85]) M(cyl(0.05, 0.06, 1.25, 8), mat("#a27f61"), g, x, 0.62, 0);
  M(rbox(2.3, 1.14, 0.1, 0.04), mat("#ffffff"), g, 0, 1.55, 0);
  const day = M(new THREE.PlaneGeometry(2.14, 0.98), new THREE.MeshLambertMaterial({ map: tex.adDay }), g, 0, 1.55, 0.052, false);
  const nightM = new THREE.MeshBasicMaterial({ map: tex.adNight, transparent: true, opacity: 0 });
  const night = M(new THREE.PlaneGeometry(2.14, 0.98), nightM, g, 0, 1.55, 0.056, false);
  for (const x of [-0.6, 0.6]) {
    M(new THREE.BoxGeometry(0.04, 0.04, 0.22), mat("#59616f"), g, x, 2.16, 0.1);
    M(sph(0.05, 8, 6), new THREE.MeshBasicMaterial({ color: "#fff3cf" }), g, x, 2.14, 0.22, false);
  }
  return { day, nightM, front: 0.3, top: 2.2 };
}

function house(g, tex) {
  plinth(g, 3.2, 2.5, "#eee8dc");
  // main block, gable roof facing front, chimney
  M(rbox(1.7, 1.18, 1.55, 0.06), mat("#fffaf1"), g, -0.48, 0.14 + 0.59, -0.05);
  M(gable(1.9, 0.78, 2.0), mat("#7ad9ad"), g, -0.48, 1.32, -0.05);
  M(rbox(0.22, 0.55, 0.22, 0.03), mat("#f0a28c"), g, -0.9, 1.7, -0.42);
  const d = door(g, -0.48, 0.14, 0.725, 0.38, 0.6, "#167353");
  const wins = [windowPane(g, -0.98, 0.84, 0.73, 0.28, 0.3), windowPane(g, 0.02, 0.84, 0.73, 0.28, 0.3), windowPane(g, -0.48, 1.6, 0.9, 0.3, 0.3, "#ffffff", true)];
  for (const x of [-0.98, 0.02]) {
    M(rbox(0.36, 0.08, 0.12, 0.02), mat("#c99566"), g, x, 0.64, 0.8);
    for (let k = 0; k < 4; k++) M(sph(0.035, 6, 4), mat(["#ff9db0", "#ffd36b", "#ffffff", "#c7a8ff"][k]), g, x - 0.12 + k * 0.08, 0.7, 0.8, false);
  }
  M(new THREE.PlaneGeometry(0.42, 0.26), mat("#d9926c"), g, -0.48, 0.142, 1.0, false).rotation.x = -Math.PI / 2;
  // the annex with its roof terrace (the notice board) and a porch with the little press
  M(rbox(1.2, 0.92, 1.45, 0.05), mat("#f0faf4"), g, 1.0, 0.14 + 0.46, -0.1);
  M(rbox(1.3, 0.08, 1.55, 0.03), mat("#dcefe5"), g, 1.0, 1.1, -0.1);
  const pm = umat("#b9d6e8", { emissive: new THREE.Color("#ffc46b"), emissiveIntensity: 0 });
  M(rbox(0.74, 0.34, 0.04, 0.015), mat("#ffffff"), g, 1.0, 0.78, 0.63);
  M(new THREE.BoxGeometry(0.66, 0.26, 0.05), pm, g, 1.0, 0.78, 0.645, false);
  wins.push(pm);
  for (const [x, z, w, dd] of [[1.0, 0.64, 1.3, 0.03], [1.0, -0.84, 1.3, 0.03], [1.64, -0.1, 0.03, 1.5]]) {
    M(new THREE.BoxGeometry(w, 0.03, dd), mat("#ffffff"), g, x, 1.3, z, false);
    const n = Math.round(Math.max(w, dd) / 0.25);
    for (let k = 0; k <= n; k++) {
      const f = k / n - 0.5;
      M(new THREE.BoxGeometry(0.025, 0.18, 0.025), mat("#ffffff"), g, x + (w > dd ? f * w : 0), 1.22, z + (dd > w ? f * dd : 0), false);
    }
  }
  // roof hatch for the courier
  const hatch = new THREE.Group();
  hatch.position.set(1.28, 1.145, 0.12);
  g.add(hatch);
  M(rbox(0.36, 0.03, 0.36, 0.01), mat("#9fdcbf"), hatch, 0, 0.015, 0.18);
  M(new THREE.PlaneGeometry(0.34, 0.34), new THREE.MeshBasicMaterial({ color: "#2c3b35" }), g, 1.28, 1.143, 0.3, false).rotation.x = -Math.PI / 2;
  // the notice board, facing front
  const board = new THREE.Group();
  board.position.set(0.86, 1.14, -0.42);
  board.rotation.x = -0.1;
  g.add(board);
  for (const x of [-0.42, 0.42]) M(new THREE.BoxGeometry(0.05, 0.5, 0.05), mat("#9c6b4b"), board, x, 0.25, 0);
  M(rbox(1.04, 0.66, 0.06, 0.02), mat("#b78056"), board, 0, 0.72, 0);
  M(new THREE.BoxGeometry(0.94, 0.56, 0.02), mat("#e4b27f"), board, 0, 0.72, 0.03, false);
  const notes = [];
  for (let i = 0; i < 6; i++) {
    const nx = -0.3 + (i % 3) * 0.3, ny = 0.86 - Math.floor(i / 3) * 0.28;
    const n = new THREE.Group();
    n.position.set(nx, ny, 0.045);
    n.rotation.z = [0.05, -0.04, 0.03, -0.05, 0.04, -0.03][i];
    board.add(n);
    M(new THREE.PlaneGeometry(0.24, 0.18), new THREE.MeshLambertMaterial({ map: tex.note }), n, 0, 0, 0, false);
    const pinM = new THREE.MeshBasicMaterial({ color: "#ffffff" });
    M(sph(0.026, 10, 8), pinM, n, 0, 0.065, 0.02, false);
    notes.push({ n, pinM });
  }
  // porch, awning, press
  M(rbox(1.2, 0.05, 0.5, 0.02), mat("#e2b789"), g, 1.0, 0.165, 0.92);
  const aw = M(new THREE.PlaneGeometry(1.22, 0.36), new THREE.MeshLambertMaterial({ map: tex.awningMint, side: THREE.DoubleSide }), g, 1.0, 0.96, 0.86, false);
  aw.rotation.x = -1.0;
  const press = new THREE.Group();
  press.position.set(1.0, 0.19, 0.86);
  g.add(press);
  M(rbox(0.46, 0.26, 0.26, 0.03), mat("#8fa7c4"), press, 0, 0.13, -0.05);
  M(rbox(0.5, 0.05, 0.3, 0.02), mat("#6f86a3"), press, 0, 0.28, -0.05);
  const rollers = [];
  for (const z of [-0.1, 0.02]) {
    const r = M(cyl(0.045, 0.045, 0.4, 10), mat("#3f4c5f"), press, 0, 0.34, z);
    r.rotation.z = Math.PI / 2;
    rollers.push(r);
  }
  M(new THREE.BoxGeometry(0.4, 0.015, 0.22), mat("#d7dde6"), press, 0, 0.17, 0.17, false);
  const sheetGeo = new THREE.PlaneGeometry(0.32, 0.4);
  sheetGeo.translate(0, 0.2, 0);
  const sheet = M(sheetGeo, new THREE.MeshLambertMaterial({ map: tex.sheet, side: THREE.DoubleSide, emissive: new THREE.Color("#ffffff"), emissiveIntensity: 0.15 }), press, 0, 0.3, -0.04, false);
  const roll = new THREE.Group();
  press.add(roll);
  const rollMesh = M(cyl(0.05, 0.05, 0.34, 14), new THREE.MeshLambertMaterial({ map: tex.roll }), roll, 0, 0, 0);
  rollMesh.rotation.z = Math.PI / 2;
  return { door: d, wins, hatch, board, notes, press, rollers, sheet, roll, rollMesh, front: 1.25, top: 2.3 };
}

// ---------------------------------------------------------------- textures drawn in code
export function makeTextures(renderer) {
  const T = {};
  T.flag = canvasTex(512, 270, (g, w, h) => {
    g.fillStyle = "#f6cf6a"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#fbe3a2"; g.fillRect(0, h - 26, w, 26);
    g.fillStyle = "#3b2f16"; g.font = "800 66px Manrope"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText("Company", w / 2, h * 0.34); g.fillText("portal", w / 2, h * 0.68);
  }, renderer);
  T.code = canvasTex(256, 112, (g, w, h) => {
    g.fillStyle = "#2f8f83"; rr(g, 0, 0, w, h, 22); g.fill();
    g.fillStyle = "#e9fffb"; g.font = "700 74px JetBrains Mono"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("</>", w / 2, h / 2 + 4);
  }, renderer);
  const stripes = (a, b) => (g, w, h) => {
    for (let i = 0; i < 8; i++) { g.fillStyle = i % 2 ? b : a; g.fillRect((i * w) / 8, 0, w / 8 + 1, h); }
    g.fillStyle = "rgba(0,0,0,0.08)"; g.fillRect(0, h - 10, w, 10);
  };
  T.awning = canvasTex(256, 96, stripes("#ffb547", "#fff6e6"), renderer);
  T.awningMint = canvasTex(256, 96, stripes("#7ad9ad", "#f4fff8"), renderer);
  T.ticket = canvasTex(512, 256, (g, w, h) => {
    g.clearRect(0, 0, w, h);
    g.fillStyle = "#ffb547"; rr(g, 8, 18, w - 16, h - 36, 26); g.fill();
    g.globalCompositeOperation = "destination-out";
    for (const x of [8, w - 8]) { g.beginPath(); g.arc(x, h / 2, 34, 0, 7); g.fill(); }
    g.globalCompositeOperation = "source-over";
    g.strokeStyle = "#fff4dc"; g.lineWidth = 7; g.setLineDash([14, 12]);
    g.beginPath(); g.moveTo(w * 0.72, 34); g.lineTo(w * 0.72, h - 34); g.stroke();
    g.setLineDash([]);
    g.fillStyle = "#6b3e06"; g.font = "800 64px Manrope"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("TICKETS", w * 0.38, h / 2 + 3);
  }, renderer);
  T.envelope = canvasTex(256, 164, (g, w, h) => {
    g.fillStyle = "#ffffff"; rr(g, 6, 6, w - 12, h - 12, 14); g.fill();
    g.strokeStyle = "#ff7b8f"; g.lineWidth = 9; g.lineJoin = "round";
    g.beginPath(); g.moveTo(18, 22); g.lineTo(w / 2, h * 0.6); g.lineTo(w - 18, 22); g.stroke();
    rr(g, 6, 6, w - 12, h - 12, 14); g.stroke();
  }, renderer);
  T.adDay = canvasTex(1024, 468, (g, w, h) => {
    const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, "#d7f3ff"); gr.addColorStop(1, "#ffe6f0");
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
    g.fillStyle = "#ffffff"; for (const [x, y, r] of [[160, 300, 110], [300, 330, 80], [800, 120, 70]]) { g.beginPath(); g.arc(x, y, r, 0, 7); g.fill(); }
    g.fillStyle = "#2a4a5c"; g.font = "800 92px Manrope"; g.textAlign = "left"; g.textBaseline = "alphabetic";
    g.fillText("Company portal", 380, 200); g.font = "600 56px Manrope"; g.fillStyle = "#5b7686"; g.fillText("Lunch & learn on Thursday", 380, 290);
  }, renderer);
  T.adNight = canvasTex(1024, 468, (g, w, h) => {
    g.fillStyle = "#2b2140"; g.fillRect(0, 0, w, h);
    g.strokeStyle = "#ff7fa3"; g.lineWidth = 10; rr(g, 26, 26, w - 52, h - 52, 30); g.stroke();
    g.fillStyle = "#ffe3ec"; g.font = "800 98px Manrope"; g.textAlign = "center"; g.textBaseline = "middle";
    g.fillText("Courier:", w / 2, h * 0.34); g.fillStyle = "#ffd36b"; g.fillText("email everyone!", w / 2, h * 0.66);
  }, renderer);
  T.keycard = canvasTex(320, 200, (g, w, h) => {
    g.fillStyle = "#ffffff"; rr(g, 4, 4, w - 8, h - 8, 26); g.fill();
    g.fillStyle = "#167353"; rr(g, 4, 4, w - 8, 56, 26); g.fill(); g.fillRect(4, 34, w - 8, 26);
    g.fillStyle = "#b7f4cf"; g.font = "800 34px Manrope"; g.textBaseline = "middle"; g.fillText("KEYCARD", 26, 33);
    g.fillStyle = "#dff5e8"; g.beginPath(); g.arc(70, 130, 40, 0, 7); g.fill();
    g.fillStyle = "#12563f"; g.font = "800 44px Inter"; g.textAlign = "center"; g.fillText("R", 70, 132);
    g.textAlign = "left"; g.fillStyle = "#1b2027"; g.font = "800 50px Manrope"; g.fillText("ram", 128, 124);
    g.fillStyle = "#6b7480"; g.font = "600 24px Manrope"; g.fillText("as you", 130, 164);
    g.fillStyle = "#f3cf72"; rr(g, 246, 98, 46, 36, 6); g.fill();
  }, renderer);
  T.pennant = canvasTex(160, 100, (g, w, h) => {
    g.fillStyle = "#167353"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#b7f4cf"; g.font = "800 64px Manrope"; g.textAlign = "center"; g.textBaseline = "middle"; g.fillText("AI", w * 0.44, h / 2 + 3);
  }, renderer);
  T.sheet = canvasTex(320, 420, (g, w, h) => {
    g.fillStyle = "#fffdf6"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#1f2a2e"; g.font = "400 62px Instrument Serif"; g.textAlign = "center"; g.fillText("Your brief", w / 2, 74);
    g.fillStyle = "#167353"; g.fillRect(24, 96, w - 48, 5);
    for (let i = 0; i < 4; i++) {
      g.fillStyle = ["#b28cff", "#ff8a9a", "#5fd4c4", "#b28cff"][i]; g.beginPath(); g.arc(38, 140 + i * 72, 11, 0, 7); g.fill();
      g.fillStyle = "#c9cdd1"; g.fillRect(60, 130 + i * 72, w - 90, 12); g.fillRect(60, 152 + i * 72, (w - 90) * 0.7, 10);
    }
  }, renderer);
  T.note = canvasTex(128, 96, (g, w, h) => {
    g.fillStyle = "#fffdf4"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#c9cdd1"; for (let i = 0; i < 4; i++) g.fillRect(16, 30 + i * 15, (w - 32) * (i === 3 ? 0.6 : 1), 6);
  }, renderer);
  T.blob = canvasTex(128, 128, (g, w, h) => {
    const gr = g.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, w / 2);
    gr.addColorStop(0, "rgba(0,0,0,0.75)"); gr.addColorStop(0.55, "rgba(0,0,0,0.35)"); gr.addColorStop(1, "rgba(0,0,0,0)");
    g.fillStyle = gr; g.fillRect(0, 0, w, h);
  }, renderer);
  T.blob.colorSpace = THREE.NoColorSpace;
  T.roll = canvasTex(256, 64, (g, w, h) => {
    g.fillStyle = "#fbf7ec"; g.fillRect(0, 0, w, h);
    g.fillStyle = "#d9dcd8"; for (let i = 0; i < 9; i++) g.fillRect(8 + i * 28, 10, 16, h - 20);
    g.fillStyle = "#7ad9ad"; g.fillRect(w * 0.45, 0, 26, h);
  }, renderer);
  return T;
}

// ---------------------------------------------------------------- the ground
function roundedRectPoints(a, b, r, n) {
  // points around a rounded rectangle (half sizes a, b), counter-clockwise from +x
  const pts = [];
  const per = 4 * (a - r) + 4 * (b - r) + 2 * Math.PI * r;
  for (let i = 0; i < n; i++) {
    let s = (i / n) * per;
    const segs = [
      [2 * (b - r), (u) => [a, -(b - r) + u]],
      [Math.PI * r / 2, (u) => { const q = u / r; return [a - r + r * Math.cos(q), b - r + r * Math.sin(q)]; }],
      [2 * (a - r), (u) => [a - r - u, b]],
      [Math.PI * r / 2, (u) => { const q = Math.PI / 2 + u / r; return [-a + r + r * Math.cos(q), b - r + r * Math.sin(q)]; }],
      [2 * (b - r), (u) => [-a, b - r - u]],
      [Math.PI * r / 2, (u) => { const q = Math.PI + u / r; return [-a + r + r * Math.cos(q), -b + r + r * Math.sin(q)]; }],
      [2 * (a - r), (u) => [-a + r + u, -b]],
      [Math.PI * r / 2, (u) => { const q = 1.5 * Math.PI + u / r; return [a - r + r * Math.cos(q), -b + r + r * Math.sin(q)]; }],
    ];
    for (const [len, f] of segs) {
      if (s <= len) { pts.push(f(s)); break; }
      s -= len;
    }
    if (pts.length < i + 1) pts.push([a, -(b - r)]);
  }
  return pts;
}

// The island's sides and rocky underside: rings that taper to a point, flat-shaded.
function islandBase() {
  const N = 112;
  const P = roundedRectPoints(ISL.A, ISL.B, ISL.R, N);
  const r = rng(11);
  const levels = [
    { y: -0.001, s: 1.0, c: "#97d07f", j: 0 },
    { y: -0.24, s: 1.0, c: "#97d07f", j: 0 },
    { y: -0.3, s: 0.994, c: "#e8c58f", j: 0 },
    { y: -0.78, s: 0.975, c: "#dfb27c", j: 0.02 },
    { y: -1.55, s: 0.87, c: "#cdb39b", j: 0.05 },
    { y: -2.45, s: 0.68, c: "#bba18b", j: 0.07 },
    { y: -3.35, s: 0.45, c: "#a98f7c", j: 0.08 },
    { y: -4.15, s: 0.22, c: "#988070", j: 0.08 },
  ];
  const ring = levels.map((L, li) => P.map(([x, z], i) => {
    const k = 1 + L.j * (r() * 2 - 1);
    const dy = li > 2 ? (r() * 2 - 1) * 0.14 : 0;
    return [x * L.s * k, L.y + dy, z * L.s * k];
  }));
  const tip = [0.4, -4.9, 0.2];
  const pos = [], col = [];
  const C = new THREE.Color();
  const push = (p, c) => { pos.push(p[0], p[1], p[2]); col.push(c.r, c.g, c.b); };
  for (let li = 0; li < levels.length - 1; li++) {
    for (let i = 0; i < N; i++) {
      const a = ring[li][i], b = ring[li][(i + 1) % N], c = ring[li + 1][(i + 1) % N], d = ring[li + 1][i];
      C.set(levels[li + 1].c).offsetHSL(0, 0, (r() - 0.5) * 0.05);
      push(a, C); push(c, C); push(d, C);
      push(a, C); push(b, C); push(c, C);
    }
  }
  for (let i = 0; i < N; i++) {
    const a = ring[levels.length - 1][i], b = ring[levels.length - 1][(i + 1) % N];
    C.set("#8d7667").offsetHSL(0, 0, (r() - 0.5) * 0.05);
    push(a, C); push(b, C); push(tip, C);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setAttribute("color", new THREE.Float32BufferAttribute(col, 3));
  g.computeVertexNormals();
  return g;
}

export function doorPoint(id) { // the ground point in front of each building's door
  const s = SITES[id];
  const f = { directory: 1.55, docs: 1.45, slack: 1.6, code: 1.45, tickets: 1.4, mail: 1.45, vault: 1.4, house: 1.55, billboard: 0.6 }[id];
  const lx = id === "house" ? -0.48 : 0;
  const v = toWorld(s, lx, 0, f);
  return [v.x, v.z];
}

// The paths, as lists of [x, z] points (Catmull-Rom).
export function pathList() {
  const D = (id) => doorPoint(id);
  const hub = [1.05, 2.35];
  return [
    [D("house"), [0.62, 1.95], hub],
    [hub, [-0.5, 3.0], [-1.25, 3.45], D("mail")],
    [D("mail"), [-3.6, 4.05], D("vault")],
    [hub, [2.6, 3.0], D("tickets")],
    [hub, [2.6, 1.6], [3.35, 0.6], D("code")],
    [[3.35, 0.6], [3.25, -0.4], D("slack")],
    [hub, [-0.9, 2.05], [-2.0, 1.35], [-2.9, 0.65], D("directory")],
    [[-2.6, 0.95], [-1.95, -0.2], D("docs")],
    [D("docs"), [0.2, -1.7], [1.35, -1.6], D("slack")],
  ];
}
export function sample(points, n = 40) {
  const out = [];
  const m = points.length - 1;
  for (let i = 0; i <= n; i++) {
    const f = (i / n) * m, k = Math.min(m - 1, Math.floor(f)), u = f - k;
    const p0 = points[Math.max(0, k - 1)], p1 = points[k], p2 = points[k + 1], p3 = points[Math.min(m, k + 2)];
    out.push([0, 1].map((j) => 0.5 * (2 * p1[j] + (-p0[j] + p2[j]) * u + (2 * p0[j] - 5 * p1[j] + 4 * p2[j] - p3[j]) * u * u + (-p0[j] + 3 * p1[j] - 3 * p2[j] + p3[j]) * u * u * u)));
  }
  return out;
}
export const POND = { x: -6.25, z: -3.3, rx: 0.95, rz: 0.6 };

function groundTexture(renderer) {
  const Wc = 2048, Hc = 1152, U = Wc / 16;
  const X = (x) => ((x + ISL.A) / (2 * ISL.A)) * Wc, Z = (z) => ((z + ISL.B) / (2 * ISL.B)) * Hc;
  return canvasTex(Wc, Hc, (g) => {
    g.fillStyle = "#bfe4a4"; g.fillRect(0, 0, Wc, Hc);
    const r = rng(7);
    for (let i = 0; i < 300; i++) {
      const x = r() * Wc, y = r() * Hc, rad = 30 + r() * 110, light = r() < 0.5;
      const gr = g.createRadialGradient(x, y, 0, x, y, rad);
      gr.addColorStop(0, light ? "rgba(222,244,196,0.5)" : "rgba(156,209,134,0.4)"); gr.addColorStop(1, "rgba(0,0,0,0)");
      g.fillStyle = gr; g.beginPath(); g.arc(x, y, rad, 0, 7); g.fill();
    }
    for (let i = 0; i < 5000; i++) {
      g.fillStyle = r() < 0.5 ? "rgba(140,198,120,0.35)" : "rgba(235,250,215,0.35)";
      g.fillRect(r() * Wc, r() * Hc, 2 + r() * 3, 2 + r() * 3);
    }
    // paths: a soft edge, then the light sand
    g.lineCap = "round"; g.lineJoin = "round";
    const draw = (w, c) => {
      g.strokeStyle = c; g.lineWidth = w * U;
      for (const p of pathList()) {
        const s = sample(p, 60);
        g.beginPath(); s.forEach(([x, z], i) => (i ? g.lineTo(X(x), Z(z)) : g.moveTo(X(x), Z(z)))); g.stroke();
      }
    };
    draw(0.56, "rgba(170,150,110,0.25)");
    draw(0.48, "#eadcbc");
    draw(0.4, "#f8efda");
    // stepping stones on the paths
    for (const p of pathList()) for (const [x, z] of sample(p, 14).slice(1, -1)) {
      g.fillStyle = "rgba(225,210,178,0.8)"; g.beginPath(); g.ellipse(X(x), Z(z), 0.09 * U, 0.06 * U, 0, 0, 7); g.fill();
    }
    // the pond
    g.fillStyle = "#e7dcc0"; g.beginPath(); g.ellipse(X(POND.x), Z(POND.z), (POND.rx + 0.12) * U, (POND.rz + 0.12) * U, 0.2, 0, 7); g.fill();
    const pg = g.createRadialGradient(X(POND.x), Z(POND.z), 0, X(POND.x), Z(POND.z), POND.rx * U);
    pg.addColorStop(0, "#7cc7e6"); pg.addColorStop(1, "#a9def0");
    g.fillStyle = pg; g.beginPath(); g.ellipse(X(POND.x), Z(POND.z), POND.rx * U, POND.rz * U, 0.2, 0, 7); g.fill();
    g.strokeStyle = "rgba(255,255,255,0.7)"; g.lineWidth = 5;
    for (const k of [0.45, 0.7]) { g.beginPath(); g.ellipse(X(POND.x) - 20, Z(POND.z) - 10, POND.rx * U * k, POND.rz * U * k * 0.5, 0.2, 3.6, 4.6); g.stroke(); }
    // a soft darker rim near the island's edge
    const eg = g.createLinearGradient(0, 0, 0, Hc);
    eg.addColorStop(0, "rgba(120,180,100,0.18)"); eg.addColorStop(0.06, "rgba(0,0,0,0)"); eg.addColorStop(0.94, "rgba(0,0,0,0)"); eg.addColorStop(1, "rgba(120,180,100,0.2)");
    g.fillStyle = eg; g.fillRect(0, 0, Wc, Hc);
  }, renderer);
}

// ---------------------------------------------------------------- trees, bushes, flowers, clouds
function tree(parent, x, z, s, kind, r) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  g.rotation.y = r() * 6.28;
  parent.add(g);
  const leaf = ["#3fb58f", "#36a984", "#4cbf97", "#2f9c79"][Math.floor(r() * 4)];
  const top = ["#6fd3aa", "#79d8b0", "#5fcaa0"][Math.floor(r() * 3)];
  M(cyl(0.05 * s, 0.07 * s, 0.42 * s, 6), mat("#9b6b4b"), g, 0, 0.21 * s, 0);
  if (kind === 0) {
    M(new THREE.IcosahedronGeometry(0.4 * s, 0), mat(leaf), g, 0, 0.66 * s, 0);
    M(new THREE.IcosahedronGeometry(0.24 * s, 0), mat(top), g, 0.08 * s, 0.94 * s, 0.05 * s);
  } else {
    M(new THREE.ConeGeometry(0.4 * s, 0.6 * s, 7), mat(leaf), g, 0, 0.6 * s, 0);
    M(new THREE.ConeGeometry(0.31 * s, 0.5 * s, 7), mat(leaf), g, 0, 0.92 * s, 0);
    M(new THREE.ConeGeometry(0.2 * s, 0.38 * s, 7), mat(top), g, 0, 1.2 * s, 0);
  }
  return g;
}

function cloud(parent, x, y, z, s, r) {
  const g = new THREE.Group();
  g.position.set(x, y, z);
  parent.add(g);
  const m = umat("#ffffff", { emissive: new THREE.Color("#eef4ff"), emissiveIntensity: 0.55 });
  const n = 4 + Math.floor(r() * 3);
  for (let i = 0; i < n; i++) {
    const rad = (0.55 + r() * 0.6) * s;
    const o = M(new THREE.IcosahedronGeometry(rad, 1), m, g, (i - n / 2) * 0.7 * s + r() * 0.3, r() * 0.35 * s, (r() - 0.5) * 0.7 * s, false);
    o.receiveShadow = false;
    o.scale.y = 0.75;
  }
  return { g, m, x, y, z };
}

// ---------------------------------------------------------------- build it all
export function buildWorld(renderer) {
  const scene = new THREE.Scene();
  const tex = makeTextures(renderer);
  const W = { scene, tex, pops: [], b: {}, trees: [], clouds: [], signs: [], lamps: [] };

  // sky: a full-screen gradient drawn first
  const skyU = {
    uTop: { value: new THREE.Color("#a7d6f2") }, uBot: { value: new THREE.Color("#f7e7da") },
    uGlow: { value: new THREE.Color("#fff3da") }, uGlowPos: { value: new THREE.Vector2(0.18, 0.92) }, uGlowAmt: { value: 0.7 },
  };
  const sky = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms: skyU, depthWrite: false, depthTest: false,
    vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.9999, 1.0); }",
    fragmentShader: `uniform vec3 uTop; uniform vec3 uBot; uniform vec3 uGlow; uniform vec2 uGlowPos; uniform float uGlowAmt; varying vec2 vUv;
      void main(){ vec3 c = mix(uBot, uTop, smoothstep(0.0, 1.0, vUv.y));
        float d = length((vUv - uGlowPos) * vec2(1.6, 1.0)); c = mix(c, uGlow, uGlowAmt * smoothstep(0.75, 0.0, d));
        gl_FragColor = vec4(c, 1.0); }`,
  }));
  sky.frustumCulled = false;
  sky.renderOrder = -100;
  scene.add(sky);
  W.skyU = skyU;
  scene.fog = new THREE.Fog("#e9eef0", 40, 95);

  // lights
  W.hemi = new THREE.HemisphereLight("#e6f3ff", "#f4dcc4", 1.7);
  scene.add(W.hemi);
  W.sun = new THREE.DirectionalLight("#fff0d6", 3.4);
  W.sun.position.set(-10, 8.5, 7);
  W.sun.castShadow = true;
  W.sun.shadow.mapSize.set(2048, 2048);
  Object.assign(W.sun.shadow.camera, { left: -12, right: 12, top: 9, bottom: -9, near: 1, far: 40 });
  W.sun.shadow.bias = -0.0006;
  W.sun.shadow.normalBias = 0.025;
  scene.add(W.sun);
  scene.add(W.sun.target);
  W.fill = new THREE.DirectionalLight("#cfe0ff", 0.7);
  W.fill.position.set(10, 4, -3);
  scene.add(W.fill);

  // the island
  const island = new THREE.Group();
  scene.add(island);
  W.island = island;
  const base = new THREE.Mesh(islandBase(), new THREE.MeshLambertMaterial({ vertexColors: true, flatShading: true }));
  base.receiveShadow = true;
  island.add(base);
  const shape = new THREE.Shape();
  const P = roundedRectPoints(ISL.A, ISL.B, ISL.R, 112);
  P.forEach(([x, z], i) => (i ? shape.lineTo(x, -z) : shape.moveTo(x, -z)));
  const topGeo = new THREE.ShapeGeometry(shape, 8);
  topGeo.rotateX(-Math.PI / 2);
  const pa = topGeo.attributes.position, uv = topGeo.attributes.uv;
  for (let i = 0; i < pa.count; i++) uv.setXY(i, (pa.getX(i) + ISL.A) / (2 * ISL.A), 1 - (pa.getZ(i) + ISL.B) / (2 * ISL.B));
  const groundMat = new THREE.MeshLambertMaterial({ map: groundTexture(renderer) });
  groundMat.userData.pale = { value: 1 };
  groundMat.onBeforeCompile = (sh) => {
    sh.uniforms.uPale = groundMat.userData.pale;
    sh.fragmentShader = "uniform float uPale;\n" + sh.fragmentShader.replace("#include <map_fragment>",
      "#include <map_fragment>\n diffuseColor.rgb = mix(diffuseColor.rgb, vec3(0.92, 0.93, 0.91), uPale);");
  };
  const top = new THREE.Mesh(topGeo, groundMat);
  top.receiveShadow = true;
  island.add(top);
  W.groundMat = groundMat;

  // buildings
  const builders = { house, directory: townHall, docs: library, slack: plaza, code: workshop, tickets: ticketOffice, mail: postOffice, vault, billboard };
  for (const [id, fn] of Object.entries(builders)) {
    const site = SITES[id];
    const g = new THREE.Group();
    g.position.set(site.x, 0, site.z);
    g.rotation.y = site.yaw;
    island.add(g);
    const inner = new THREE.Group();
    inner.scale.setScalar(BS);
    g.add(inner);
    const parts = fn(inner, tex);
    // a soft contact shadow under each building
    const blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tex.blob, transparent: true, depthWrite: false, color: "#3d4a3a", opacity: 0.32 }));
    blob.rotation.x = -Math.PI / 2;
    blob.position.y = 0.012;
    blob.scale.set(3.4 * BS, 2.8 * BS, 1);
    blob.renderOrder = 1;
    g.add(blob);
    const b = { id, site, g, inner, ...parts };
    b.label = toWorld(site, 0, (parts.top || 2) + 0.25, 0);
    W.b[id] = b;
  }

  // a few lily pads on the pond
  for (const [dx, dz] of [[0.3, 0.1], [-0.35, -0.15], [0.05, 0.3]]) {
    const p = M(cyl(0.12, 0.12, 0.02, 10), mat("#5fbf8a"), island, POND.x + dx, 0.012, POND.z + dz, false);
    p.scale.z = 0.8;
  }

  // signposts (six rules) and lamps
  const signAt = [[-0.65, 3.1], [-4.55, 2.15], [-0.95, -1.45], [1.75, -2.55], [2.55, 3.55], [3.4, 0.2]];
  signAt.forEach(([x, z], i) => {
    const g = new THREE.Group();
    g.position.set(x, 0, z); g.rotation.y = 0.4 + i * 0.3;
    island.add(g);
    M(cyl(0.035, 0.04, 0.72, 6), mat("#a27f61"), g, 0, 0.36, 0);
    M(rbox(0.46, 0.2, 0.04, 0.015), mat("#d8ad7c"), g, 0.12, 0.56, 0.03);
    const lm = new THREE.MeshBasicMaterial({ color: "#6d6a63" });
    M(sph(0.065, 10, 8), lm, g, 0, 0.8, 0, false);
    M(cyl(0.05, 0.07, 0.04, 8), mat("#59616f"), g, 0, 0.88, 0, false);
    W.signs.push({ g, lm, p: new THREE.Vector3(x, 0.95, z) });
  });
  const lampAt = [[-1.35, 2.35], [2.05, 2.05], [2.95, -0.55], [-3.3, 0.15], [-3.5, 3.9], [4.0, 4.0], [-0.1, -1.9]];
  lampAt.forEach(([x, z]) => {
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    island.add(g);
    M(cyl(0.025, 0.035, 0.66, 6), mat("#3d6b5c"), g, 0, 0.33, 0);
    const lm = new THREE.MeshBasicMaterial({ color: "#f3ecd8" });
    M(sph(0.07, 10, 8), lm, g, 0, 0.72, 0, false);
    W.lamps.push({ g, lm });
  });

  // trees and bushes: seeded, kept off buildings, paths, pond, signs and lamps
  const r = rng(23);
  const keepOut = [];
  for (const id of Object.keys(SITES)) {
    const s = SITES[id];
    const rad = { house: 2.05, directory: 1.85, docs: 1.55, slack: 1.45, code: 1.6, tickets: 1.4, mail: 1.55, vault: 1.4, billboard: 1.25 }[id];
    keepOut.push([s.x, s.z, rad]);
  }
  keepOut.push([POND.x, POND.z, 1.15]);
  for (const [x, z] of [...signAt, ...lampAt]) keepOut.push([x, z, 0.4]);
  const pathPts = pathList().flatMap((p) => sample(p, 40));
  const free = (x, z, pad) => {
    if (Math.abs(x) > ISL.A - 0.55 || Math.abs(z) > ISL.B - 0.5) return false;
    const cx = Math.max(Math.abs(x) - (ISL.A - ISL.R), 0), cz = Math.max(Math.abs(z) - (ISL.B - ISL.R), 0);
    if (Math.hypot(cx, cz) > ISL.R - 0.5) return false;
    for (const [kx, kz, kr] of keepOut) if (Math.hypot(x - kx, z - kz) < kr + pad) return false;
    for (const [px, pz] of pathPts) if (Math.hypot(x - px, z - pz) < 0.42 + pad) return false;
    return true;
  };
  const placed = [];
  for (let i = 0; i < 900 && placed.length < 46; i++) {
    const x = (r() * 2 - 1) * ISL.A, z = (r() * 2 - 1) * ISL.B;
    const s = 0.7 + r() * 0.55;
    if (!free(x, z, 0.12 * s)) continue;
    if (placed.some(([px, pz]) => Math.hypot(x - px, z - pz) < 0.62)) continue;
    placed.push([x, z]);
    const t = tree(island, x, z, s, r() < 0.55 ? 0 : 1, r);
    const blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: tex.blob, transparent: true, depthWrite: false, color: "#2f4a35", opacity: 0.3 }));
    blob.rotation.x = -Math.PI / 2; blob.position.y = 0.01; blob.scale.set(0.95 * s, 0.95 * s, 1); blob.renderOrder = 1;
    t.add(blob);
    W.trees.push({ g: t, x, z, s, seed: i });
  }
  for (let i = 0; i < 400 && W.trees.length + keepOut.length < 200; i++) {
    const x = (r() * 2 - 1) * ISL.A, z = (r() * 2 - 1) * ISL.B;
    if (!free(x, z, -0.15)) continue;
    if (placed.some(([px, pz]) => Math.hypot(x - px, z - pz) < 0.35)) continue;
    placed.push([x, z]);
    const g = new THREE.Group();
    g.position.set(x, 0, z);
    island.add(g);
    const s = 0.6 + r() * 0.6;
    M(new THREE.IcosahedronGeometry(0.2 * s, 0), mat(["#57c79c", "#4dbb91", "#6cd2a7"][Math.floor(r() * 3)]), g, 0, 0.12 * s, 0);
    if (r() < 0.6) M(new THREE.IcosahedronGeometry(0.14 * s, 0), mat("#62cba1"), g, 0.18 * s, 0.08 * s, 0.05, false);
    W.trees.push({ g, x, z, s: s * 0.6, seed: 1000 + i, bush: true });
    if (W.trees.length > 70) break;
  }
  // flowers: one instanced mesh
  const fl = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(0.04, 0), new THREE.MeshLambertMaterial({ flatShading: true }), 220);
  const mtx = new THREE.Matrix4(), fc = new THREE.Color();
  let nf = 0;
  for (let i = 0; i < 3000 && nf < 220; i++) {
    const x = (r() * 2 - 1) * ISL.A, z = (r() * 2 - 1) * ISL.B;
    if (!free(x, z, -0.25)) continue;
    mtx.makeTranslation(x, 0.03, z);
    fl.setMatrixAt(nf, mtx);
    fl.setColorAt(nf, fc.set(["#ff9db0", "#ffd36b", "#ffffff", "#c7a8ff", "#ffb08a"][Math.floor(r() * 5)]));
    nf++;
  }
  fl.count = nf;
  island.add(fl);
  W.flowers = fl;

  // clouds around and below
  const rc = rng(5);
  for (const [x, y, z, s] of [[-13, -2.6, -2, 1.5], [11, -3.4, 1, 1.7], [-6, -5.2, 6, 1.6], [7, -5.8, -6, 1.8], [2, 1.2, -12, 1.9], [-10, 0.8, -10, 1.6], [14, 0.4, -8, 1.4], [-2, -6.2, -3, 2.0], [10, -1.2, 8, 1.2], [-14, -1.0, 6, 1.3]]) {
    W.clouds.push(cloud(scene, x, y, z, s, rc));
  }
  return W;
}
