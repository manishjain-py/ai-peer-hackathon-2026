// The choreography of Glass & Light: the beats, where every layer and window is at time t, the
// camera, and the path of the light. Pure functions of t (no DOM), shared by scene.js and by the
// node checks that print the framing of a moment.
import { prog, ease, clamp, lerp, noise } from "../shared/kit.js";
import * as R from "./rig.js";

const d2r = Math.PI / 180;
export const PAGE = { w: 1920, h: 1080 };
export const WIN = { w: 540, h: 400 };
export const BENCH = { w: 1440, h: 860 };
// The main glass panel of the page, in page px.
export const MAIN = { x: 324, y: 24, w: 1572, h: 1032 };
export const RAIL = { x: 24, y: 24, w: 276, h: 1032 };

// ---------------------------------------------------------------- the beats (seconds)
export const B = {
  click: 4.4,
  steps: [[6.5, 8.15], [8.15, 16.3], [16.3, 21.1], [21.1, 23.8]],
  fold: [24.15, 25.9],
  ready: [25.5, 27.5],
  learned: [27.4, 35.5],
  brief: [35.5, 44.0],
  ask: [44.0, 56.5],
  rules: [56.5, 64],
  trace: [31.9, 35.2],
  search: [46.4, 50.6],
};

// The six source windows (order of sources in data.js), the setup reading schedule, and the
// arc they stand on during setup. `lift` are the times key lines lift off as chips.
export const ARC = { r: 1270, step: 26, z: -1040, alpha: 50 };
export const phiSetup = (i) => (-65 + ARC.step * i) * d2r;
export const READ = [
  { i: 0, arrive: 7.3, scan: [7.35, 8.0], lift: [7.9], connect: null },
  { i: 1, arrive: 8.75, scan: [8.85, 9.6], lift: [9.42], connect: null },
  { i: 2, arrive: 10.4, scan: [11.9, 12.75], lift: [12.12, 12.4, 12.68], connect: 11.05 },
  { i: 3, arrive: 13.5, scan: [13.85, 14.3], lift: [14.15], connect: 13.62 },
  { i: 4, arrive: 14.5, scan: [14.85, 15.3], lift: [15.15], connect: 14.62 },
  { i: 5, arrive: 15.45, scan: [15.5, 16.05], lift: [15.92], connect: null },
];
// Each chip: which window and which key line it lifts from, and its bench slot (= its index).
export const CHIPS = [
  { win: 0, key: 0, at: 7.9 },
  { win: 1, key: 0, at: 9.42 },
  { win: 2, key: 0, at: 12.12 },
  { win: 2, key: 2, at: 12.68 },
  { win: 2, key: 1, at: 12.4 },
  { win: 3, key: 0, at: 14.15 },
  { win: 4, key: 0, at: 15.15 },
  { win: 5, key: 0, at: 15.92 },
];
export const FLY = 0.95; // seconds a chip flies
// Step 4: these bench rows become the brief (newest first) and rise to the page.
export const BRIEF_ROWS = [2, 7, 5, 4];
export const BRIEF_RISE = (k) => 22.0 + k * 0.22;
export const RISE = 1.15;
// Ask: the windows the light visits (window, key line, time) and the arc they rise onto.
export const ASK_VISITS = [
  { win: 2, key: 1, at: 47.35 },
  { win: 2, key: 2, at: 47.95 },
  { win: 5, key: 0, at: 48.6 },
  { win: 3, key: 0, at: 49.25 },
];
export const ASK_ARC = { 2: -44, 5: 0, 3: 44 };

// ---------------------------------------------------------------- small helpers
const e3 = ease.inOutCubic;
export const span = (t, a, b, e = e3) => e(prog(t, a, b));
// 0 -> 1 over [a, b], back to 0 over [c, d].
export const hold = (t, a, b, c, d, e = e3) => Math.min(span(t, a, b, e), 1 - span(t, c, d, e));
const mixv = (a, b, k) => a.map((v, j) => lerp(v, b[j], k));

// ---------------------------------------------------------------- the layers

// How far the setup has exploded the page (0 = one flat page, 1 = full exploded view).
export const explode = (t) => hold(t, 4.85, 6.35, 24.25, 25.55);

// The page layer: its height over the stack, and a model matrix for page px.
export function pageZ(t) {
  const lift = 60 * hold(t, 4.5, 5.2, 24.4, 25.3);
  const step3 = 640 * hold(t, 16.15, 17.2, 21.0, 22.2) + 300 * hold(t, 21.0, 22.2, 24.25, 25.3);
  return lift + step3;
}
export function pageModel(t) {
  return R.T(-PAGE.w / 2, -PAGE.h / 2, pageZ(t));
}
// A point in page px (z above the page) -> world.
export const pagePt = (t, x, y, z = 0) => [x - PAGE.w / 2, y - PAGE.h / 2, pageZ(t) + z];

// The workbench: below the page.
export function benchZ(t) {
  return lerp(-24, -520, explode(t));
}
export const benchAlpha = (t) => hold(t, 4.95, 5.6, 24.85, 25.4);
export function benchModel(t) {
  return R.T(-BENCH.w / 2, -BENCH.h / 2 + 10, benchZ(t));
}
export const benchPt = (t, x, y, z = 0) => [x - BENCH.w / 2, y - BENCH.h / 2 + 10, benchZ(t) + z];

// The source windows. Each has a pose: position of its bottom-centre, its turn about the stack
// axis, its tilt up from the plane, and an opacity.
const foldPos = (i) => [(i % 3 - 1) * 560, (Math.floor(i / 3) - 0.5) * 420 + 190, -40];
function arcPose(i, phiDeg, r, z, alphaDeg) {
  const p = phiDeg * d2r;
  return { pos: [r * Math.sin(p), r * Math.cos(p), z], rot: -p, tilt: alphaDeg * d2r };
}
export function winPose(i, t) {
  // Setup: unfold from under the page into the arc, then fold back.
  const a = ease.inOutCubic(prog(t, 4.95 + i * 0.07, 6.3 + i * 0.07));
  const b = ease.inOutCubic(prog(t, 24.15 + (5 - i) * 0.05, 25.25 + (5 - i) * 0.05));
  const k = Math.min(a, 1 - b);
  const arc = arcPose(i, -65 + ARC.step * i, ARC.r, ARC.z, ARC.alpha);
  const folded = { pos: foldPos(i), rot: 0, tilt: 0 };
  // The tilt overshoots a little as it unfolds, then settles (outBack), and folds flat at the end.
  const tiltK = ease.outBack(prog(t, 5.1 + i * 0.07, 6.5 + i * 0.07), 1.3) * (1 - b);
  let pose = {
    pos: mixv(folded.pos, arc.pos, k),
    rot: lerp(folded.rot, arc.rot, k),
    tilt: arc.tilt * tiltK,
    alpha: Math.min(span(t, 4.95 + i * 0.07, 5.5 + i * 0.07), 1 - span(t, 24.7, 25.3)),
  };
  // What I learned: the Documents window ghosts in behind the glass, under the traced fact.
  if (i === 1 && t > 30) {
    const g = hold(t, 32.15, 32.95, 34.35, 35.15);
    pose = {
      pos: [-20, 360, -430 + 60 * (1 - g)],
      rot: 0,
      tilt: 0,
      alpha: g * 0.97,
    };
  }
  // Ask: three windows rise below the page, the light visits them.
  if (t > 44 && ASK_ARC[i] != null) {
    const g = hold(t, 46.45 + (ASK_ARC[i] + 44) * 0.0025, 47.25 + (ASK_ARC[i] + 44) * 0.0025, 49.85, 50.55);
    const arcA = arcPose(i, ASK_ARC[i], 880, -700, 40);
    const low = { pos: [arcA.pos[0] * 0.7, arcA.pos[1] * 0.5, -900], rot: arcA.rot, tilt: 0 };
    pose = {
      pos: mixv(low.pos, arcA.pos, g),
      rot: arcA.rot,
      tilt: lerp(0, arcA.tilt, g),
      alpha: g,
    };
  }
  return pose;
}
export function winModel(i, t, pose = winPose(i, t)) {
  return R.chain(R.T(...pose.pos), R.RZ(pose.rot), R.RX(-pose.tilt), R.T(-WIN.w / 2, -WIN.h, 0));
}
// A point in window px (z out of its face) -> world.
export function winPt(i, t, x, y, z = 0) {
  return R.apply(winModel(i, t), x, y, z);
}
// The window's outward normal (unit) in world.
export function winNormal(i, t) {
  const m = winModel(i, t);
  const a = R.apply(m, 0, 0, 0), b = R.apply(m, 0, 0, 1);
  return [b[0] - a[0], b[1] - a[1], b[2] - a[2]];
}

// ---------------------------------------------------------------- the camera

const FACE = { target: [0, 0, 0], yaw: 0, pitch: 0, turn: 0, dist: R.P };
function winCam(i, t, dist, extra = {}) {
  const pose = winPose(i, 7.0);
  const c = winPt(i, 7.0, WIN.w / 2, WIN.h / 2 - 10, 0);
  return { target: c, yaw: -pose.rot * (180 / Math.PI), pitch: ARC.alpha, turn: 0, dist, ...extra };
}
function camKeys() {
  const winMid = (a, b) => {
    const p = winPt(a, 7.0, WIN.w / 2, WIN.h / 2, 0), q = winPt(b, 7.0, WIN.w / 2, WIN.h / 2, 0);
    return [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2, (p[2] + q[2]) / 2];
  };
  return [
    [0, FACE, 1],
    [4.55, FACE, 1],
    [6.45, { target: [0, 470, -600], yaw: -10, pitch: 57, turn: 0, dist: 3500 }],
    [7.4, winCam(0, 7, 1330), 1],
    [8.1, winCam(0, 7, 1270)],
    [8.85, winCam(1, 7, 1310), 1],
    [9.65, winCam(1, 7, 1250)],
    [10.45, winCam(2, 7, 1330), 1],
    [11.1, winCam(2, 7, 1300)],
    [11.85, winCam(2, 7, 1200)],
    [12.75, winCam(2, 7, 1180)],
    [13.5, { target: winMid(3, 5), yaw: 40, pitch: 55, turn: 0, dist: 2350 }, 1],
    [16.15, { target: winMid(3, 5), yaw: 50, pitch: 55, turn: 0, dist: 2250 }],
    [17.35, { target: [0, 40, -520], yaw: 0, pitch: 44, turn: 0, dist: 1600 }, 1],
    [20.95, { target: [0, 40, -520], yaw: -4, pitch: 44, turn: 0, dist: 1500 }],
    [22.4, { target: [0, 120, -150], yaw: -12, pitch: 52, turn: 0, dist: 2650 }, 1],
    [24.15, { target: [0, 120, -150], yaw: -17, pitch: 52, turn: 0, dist: 2550 }],
    [25.95, FACE, 1],
    [31.95, FACE, 1],
    [32.95, { target: [0, 110, -180], yaw: 0, pitch: 15, turn: 7, dist: 1760 }, 1],
    [34.3, { target: [0, 110, -180], yaw: 0, pitch: 16, turn: 6, dist: 1730 }, 1],
    [35.25, FACE, 1],
    [46.45, FACE, 1],
    [47.35, { target: [0, 640, -560], yaw: 0, pitch: 42, turn: 0, dist: 1950 }, 1],
    [49.8, { target: [0, 640, -560], yaw: 3, pitch: 43, turn: 0, dist: 1900 }, 1],
    [50.65, FACE, 1],
    [64, FACE, 1],
  ];
}
let KEYS = null;
const PARAMS = (c) => [c.target[0], c.target[1], c.target[2], c.yaw, c.pitch, c.dist, c.turn];

// Cubic Hermite through the keys with Catmull-Rom tangents; keys marked 1 stop (zero tangent).
export function camParams(t) {
  if (!KEYS) KEYS = camKeys().map(([kt, c, stop]) => ({ t: kt, v: PARAMS(c), stop: !!stop }));
  const K = KEYS;
  if (t <= K[0].t) return K[0].v;
  if (t >= K[K.length - 1].t) return K[K.length - 1].v;
  let i = 0;
  while (i < K.length - 2 && t > K[i + 1].t) i++;
  const a = K[i], b = K[i + 1];
  const h = b.t - a.t;
  const u = (t - a.t) / h;
  const tan = (j) => {
    const k = K[j];
    if (k.stop || j === 0 || j === K.length - 1) return k.v.map(() => 0);
    const p = K[j - 1], n = K[j + 1];
    return k.v.map((_, m) => (n.v[m] - p.v[m]) / (n.t - p.t));
  };
  const ma = tan(i), mb = tan(i + 1);
  const u2 = u * u, u3 = u2 * u;
  const h00 = 2 * u3 - 3 * u2 + 1, h10 = u3 - 2 * u2 + u, h01 = -2 * u3 + 3 * u2, h11 = u3 - u2;
  return a.v.map((v, m) => h00 * v + h10 * h * ma[m] + h01 * b.v[m] + h11 * h * mb[m]);
}
export function cameraAt(t) {
  const [x, y, z, yaw, pitch, dist, turn] = camParams(t);
  // A slow breath of the camera while the Peer works (never on the calm page, so text stays crisp).
  const work = hold(t, 4.8, 6.0, 24.6, 25.8) + hold(t, 46.6, 47.4, 49.8, 50.5);
  const by = work * 0.8 * noise(t * 0.35, 3);
  const bp = work * 0.6 * noise(t * 0.3, 7);
  return R.camera({ target: [x, y, z], yaw: (yaw + by) * d2r, pitch: (pitch + bp) * d2r, turn: turn * d2r, dist });
}
