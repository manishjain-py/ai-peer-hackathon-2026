// Constellation: the layout of the star map, the timeline, and the camera and comet paths.
// Pure data and functions (no DOM, no three.js), so a node script can import this file and check
// the framing of any moment by numbers. World units; Ram's star at the origin, y up; the camera
// starts on +z looking toward -z, at today's page.
import { rng } from "../shared/kit.js";

export const S = 70;            // seconds
export const FOV0 = 38;         // vertical field of view at the start (degrees)
export const C0 = [0, 1.5, 70]; // the camera while today's page shows
export const DP = 16;           // the page plane's distance in front of C0
export const PAGE_HH = DP * Math.tan((FOV0 / 2) * Math.PI / 180);
export const PAGE_HW = PAGE_HH * 16 / 9;

// A screen pixel of today's page -> its point on the page plane (world).
export const pagePoint = (px, py) => [
  (px / 1920 - 0.5) * 2 * PAGE_HW,
  C0[1] + (0.5 - py / 1080) * 2 * PAGE_HH,
  C0[2] - DP,
];

export const RAM = [0, 0, 0];

// The source clusters: centre, spread, how many stars light when read (the count it found).
export const CL = {
  directory: { c: [-9.5, 6.2, 4.0], r: 2.9, n: 1 },
  docs: { c: [-16.5, -1.0, -5.0], r: 2.3, n: 24 },
  slack: { c: [-6.5, -8.6, -11.0], r: 2.6, n: 31 },
  code: { c: [9.8, -7.6, -8.0], r: 1.7, n: 5 },
  tickets: { c: [16.6, 1.6, -4.0], r: 1.6, n: 4 },
  mail: { c: [7.6, 8.6, 1.5], r: 2.1, n: 12 },
};
export const ORDER = ["directory", "docs", "slack", "code", "tickets", "mail"];

// The named items each source gives (from shared/data.js `reads`), as stars at an offset from the
// cluster's centre. `side`: which side of its star the title sits (1 right, -1 left).
export const ITEMS = [
  { id: "ram", src: "directory", off: [0.9, -0.5, 1.0], title: "Ram · Senior Software Engineer", sub: "Host Payouts · Payments · Dublin", side: 1 },
  { id: "amara", src: "directory", off: [-1.1, 1.0, 0.2], title: "Amara Johnson · your manager", sub: "Host Payouts · Payments", side: 1 },
  { id: "d1", src: "docs", off: [1.0, 0.9, 1.0], title: "Payout retry v2 · design doc", sub: "by Ram · edited Nov 11", side: 1 },
  { id: "d2", src: "docs", off: [-1.0, 1.5, 0.2], title: "Brazil launch plan", sub: "Payments · Nov 12", side: 1 },
  { id: "d3", src: "docs", off: [-0.8, -1.4, 0.6], title: "Payouts reliability review, Q4", sub: "Nov 6", side: 1 },
  { id: "d4", src: "docs", off: [1.4, -0.6, -0.4], title: "Host Payouts on-call handbook", sub: "Oct 28", side: 1 },
  { id: "s1", src: "slack", off: [1.2, 1.1, 0.8], title: "#host-payouts · Daniel Weiss", sub: "Nov 15", side: 1 },
  { id: "s2", src: "slack", off: [-1.3, 0.3, 1.0], title: "#launch-brazil · Vikram Rao", sub: "Nov 13", side: 1 },
  { id: "s3", src: "slack", off: [0.5, -1.4, 0.9], title: "#payments-eng · Ram", sub: "Nov 12", side: 1 },
  { id: "c1", src: "code", off: [0.7, 0.6, 0.5], title: "PR #4182 · Retry limit per market", sub: "open · Nov 14", side: 1 },
  { id: "c2", src: "code", off: [-0.8, -0.5, 0.3], title: "PR #4167 · Backoff with jitter", sub: "merged · Nov 9", side: 1 },
  { id: "t1", src: "tickets", off: [0.6, 0.6, 0.4], title: "INC-20431 · Partner bank outage, Brazil", sub: "resolved · Nov 10", side: 1 },
  { id: "t2", src: "tickets", off: [-0.6, -0.6, 0.2], title: "PAY-4821 · Brazil payouts held", sub: "in progress · Nov 14", side: 1 },
  { id: "m1", src: "mail", off: [0.8, 0.5, 0.6], title: "Payments Risk · Brazil fraud threshold", sub: "Nov 14", side: 1 },
  { id: "m2", src: "mail", off: [-0.9, -0.4, 0.4], title: "Amara Johnson · Re: launch review", sub: "Nov 14", side: 1 },
];
export const itemById = Object.fromEntries(ITEMS.map((x) => [x.id, x]));
export const itemPos = (id) => {
  const it = itemById[id], c = CL[it.src].c;
  return [c[0] + it.off[0], c[1] + it.off[1], c[2] + it.off[2]];
};

// The knowledge stars near Ram: six facts (learned.facts by index) and four brief items
// (brief.items by index), each born from one item. `topic` groups the shape of Ram's work.
export const KNOW = [
  { id: "F1", kind: "fact", i: 0, item: "d1", pos: [-4.6, 2.5, 0.6], topic: "retry" },
  { id: "F2", kind: "fact", i: 1, item: "s3", pos: [-1.4, 4.5, -0.8], topic: "retry" },
  { id: "F3", kind: "fact", i: 2, item: "c1", pos: [-5.0, -1.5, -0.4], topic: "retry" },
  { id: "F4", kind: "fact", i: 3, item: "s2", pos: [3.3, 3.3, 0.6], topic: "brazil" },
  { id: "F5", kind: "fact", i: 4, item: "t1", pos: [1.6, -4.4, 0.4], topic: "inc" },
  { id: "F6", kind: "fact", i: 5, item: "amara", pos: [-1.6, -2.2, 2.6], topic: null },
  { id: "B1", kind: "brief", i: 0, item: "s1", pos: [4.4, -1.9, 1.6], topic: "inc" },
  { id: "B2", kind: "brief", i: 1, item: "m1", pos: [5.8, 1.1, -1.0], topic: "brazil" },
  { id: "B3", kind: "brief", i: 2, item: "c1", pos: [-3.1, -3.6, 1.8], topic: "retry" },
  { id: "B4", kind: "brief", i: 3, item: "s2", pos: [1.9, 1.4, 2.6], topic: "brazil" },
];
export const knowById = Object.fromEntries(KNOW.map((k) => [k.id, k]));
// Constellation lines between related knowledge (the shape of Ram's work).
export const EDGES = [
  ["F1", "F2"], ["F1", "F3"], ["F3", "B3"], ["F2", "F4"], ["F4", "B4"], ["F4", "B2"], ["B4", "B2"],
  ["F5", "B1"], ["B1", "B4"], ["F6", "F1"],
];
export const TOPICS = [
  { id: "retry", name: "Payout retry v2", at: [-4.2, 4.6, 0.2] },
  { id: "brazil", name: "Brazil launch", at: [5.0, 4.4, 0.4] },
  { id: "inc", name: "INC-20431", at: [-0.2, -6.3, 1.0] },
];
// The answer's four citations -> the star whose light flows into each sentence.
export const CITE_STARS = ["F4", "F2", "B2", "F3"];

// ---------------------------------------------------------------------------------------------
// The timeline (seconds).
export const T = {
  click: 4.4,
  point0: 4.55, point1: 4.95,     // the button collapses into a point of light
  fall0: 4.95, fall1: 7.6,        // today's page falls away into stars
  hud0: 6.3,                      // the step panel slides in
  clusters0: 5.9,                 // the source clusters fade in
  visit: {
    directory: { arrive: 6.85, r0: 6.95, r1: 7.75, done: 8.0, s0: 7.55 },
    docs: { arrive: 9.15, r0: 9.2, r1: 10.65, done: 10.8, s0: 10.6 },
    slack: { arrive: 11.75, button: 11.5, click: 12.85, r0: 13.55, r1: 14.85, done: 15.0, s0: 14.85 },
    code: { arrive: 15.85, button: 15.1, click: 15.9, r0: 16.2, r1: 17.0, done: 17.15, s0: 17.0 },
    tickets: { arrive: 17.85, button: 17.05, click: 17.9, r0: 18.15, r1: 18.85, done: 19.0, s0: 18.85 },
    mail: { arrive: 19.55, r0: 19.6, r1: 20.4, done: 20.55, s0: 20.4 },
  },
  ramIgnite: 8.25,
  stepStart: [5.8, 8.6, 21.2, 25.4],
  stepDone: [8.6, 21.2, 25.4, 27.6],
  lines0: 21.7, related0: 22.9, topics0: 23.5, srcLine: 21.3,
  briefLift0: 25.6,
  hudOut: 28.3,
  learned0: 28.5, summary0: 28.9, cards0: 30.7, glide0: 34.6, cardBloom: 35.4, trace0: 35.9, trace1: 37.0, learned1: 38.2,
  col0: 38.3, colCards0: 39.2, colLines0: 40.1, col1: 46.1,
  ask0: 46.7, type0: 47.9, enter: 49.45, wave0: 49.5, search0: 49.6, light0: 51.5, answer0: 52.6, sentence: 1.0,
  ring0: 56.4, asOf: 56.9, chips: 57.1, ask1: 60.3,
  rules0: 60.4, rulesRing0: 60.9, gather0: 65.0, end: 66.4,
};

// When each knowledge star's light leaves its item, and when it arrives (is born).
const STREAM_LEN = 0.85;
export const KNOW_TIMES = (() => {
  const out = {};
  const bySrc = {};
  for (const k of KNOW) {
    const src = itemById[k.item].src;
    (bySrc[src] = bySrc[src] || []).push(k);
  }
  for (const src of ORDER) {
    (bySrc[src] || []).forEach((k, j) => {
      const leave = T.visit[src].s0 + j * 0.16;
      out[k.id] = { leave, born: leave + STREAM_LEN };
    });
  }
  return out;
})();
export const STREAM_TIME = STREAM_LEN;

// ---------------------------------------------------------------------------------------------
// Smooth paths through timed keys: a cubic in time per component with monotone (Fritsch-Carlson)
// tangents, so a path never overshoots its keys. keys: [[t, [v0, v1, ...]], ...], times rising.
export function track(keys) {
  const n = keys.length, dim = keys[0][1].length;
  const tan = keys.map(() => new Array(dim).fill(0));
  for (let j = 0; j < dim; j++) {
    const d = [];
    for (let i = 0; i < n - 1; i++) d.push((keys[i + 1][1][j] - keys[i][1][j]) / (keys[i + 1][0] - keys[i][0]));
    for (let i = 1; i < n - 1; i++) {
      if (keys[i][2] === "hold" || d[i - 1] * d[i] <= 0) { tan[i][j] = 0; continue; }
      const m = (d[i - 1] + d[i]) / 2;
      const lim = 3 * Math.min(Math.abs(d[i - 1]), Math.abs(d[i]));
      tan[i][j] = Math.sign(m) * Math.min(Math.abs(m), lim);
    }
  }
  return (t) => {
    if (t <= keys[0][0]) return keys[0][1].slice();
    if (t >= keys[n - 1][0]) return keys[n - 1][1].slice();
    let i = 0;
    while (t > keys[i + 1][0]) i++;
    const [ta, pa] = keys[i], [tb, pb] = keys[i + 1];
    const h = tb - ta, s = (t - ta) / h, s2 = s * s, s3 = s2 * s;
    const h00 = 2 * s3 - 3 * s2 + 1, h10 = s3 - 2 * s2 + s, h01 = -2 * s3 + 3 * s2, h11 = s3 - s2;
    return pa.map((v, j) => h00 * v + h10 * h * tan[i][j] + h01 * pb[j] + h11 * h * tan[i + 1][j]);
  };
}

const add = (a, b) => a.map((v, i) => v + b[i]);
const sub = (a, b) => a.map((v, i) => v - b[i]);
const scl = (a, k) => a.map((v) => v * k);
const norm = (a) => { const l = Math.hypot(...a) || 1; return a.map((v) => v / l); };
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
export const V = { add, sub, scl, norm, cross, lerp: (a, b, k) => a.map((v, i) => v + (b[i] - v) * k), dist: (a, b) => Math.hypot(...sub(a, b)) };

// Keys on a loop around a centre, in a plane facing roughly +z (the camera's side), from t0 to t1.
function loopKeys(c, r, t0, t1, turns, phase, n, tilt = [0.25, 0.35, 1]) {
  const nz = norm(tilt);
  const ux = norm(cross([0, 1, 0], nz)), uy = cross(nz, ux);
  const out = [];
  for (let i = 0; i <= n; i++) {
    const k = i / n, a = phase + k * turns * Math.PI * 2;
    out.push([t0 + (t1 - t0) * k, add(c, add(scl(ux, Math.cos(a) * r), scl(uy, Math.sin(a) * r)))]);
  }
  return out;
}

// The comet (the Peer). `btn` is the button's point on the page plane, where it is born.
export function cometTrack(btn) {
  const v = T.visit, c = (id) => CL[id].c;
  const ringAt = (id, d) => add(c(id), scl(norm(sub([0, 0, 8], c(id))), d)); // waits at a ring's edge
  const keys = [
    [0, btn], [T.point1 + 0.05, btn],
    [T.point1 + 0.45, add(btn, [0.15, 0.25, 1.4])],            // anticipation: it eases back a little
    [T.point1 + 1.05, [-6.0, 4.5, 26]],
    ...loopKeys(c("directory"), 1.9, v.directory.arrive, v.directory.r1 + 0.15, 0.85, 0.3, 4),
    ...loopKeys(c("docs"), 2.0, v.docs.arrive, v.docs.r1 + 0.1, 0.9, 0.6, 5),
    [v.slack.arrive - 0.35, add(c("slack"), [-4.6, 0.9, 0.9])],
    [v.slack.arrive, add(c("slack"), [-3.25, 0.45, 0.6])],
    [v.slack.arrive + 0.3, add(c("slack"), [-3.75, 0.6, 0.7])],      // bumps against the ring
    [v.slack.click + 0.35, add(c("slack"), [-3.45, 0.5, 0.6])],
    ...loopKeys(c("slack"), 2.1, v.slack.r0 - 0.1, v.slack.r1 + 0.1, 0.9, 1.9, 5),
    [v.code.arrive, ringAt("code", 2.6)],
    ...loopKeys(c("code"), 1.5, v.code.r0, v.code.r1 + 0.1, 0.8, 1.2, 4),
    [v.tickets.arrive, ringAt("tickets", 2.5)],
    ...loopKeys(c("tickets"), 1.4, v.tickets.r0, v.tickets.r1 + 0.1, 0.8, 0.8, 4),
    ...loopKeys(c("mail"), 1.8, v.mail.arrive, v.mail.r1 + 0.1, 0.8, 0.2, 4),
    // Home: a slow orbit around Ram while it writes and builds the brief.
    ...loopKeys(RAM, 2.9, 21.6, 34.4, 1.8, 0.9, 14, [0.1, 1, 0.35]),
    // What I learned: it leads the camera to the first fact, then points along its light.
    [35.4, add(knowById.F1.pos, [0.9, 0.9, 0.9])],
    [37.2, add(knowById.F1.pos, [1.1, 1.0, 0.7])],
    [38.0, [-1.5, 2.6, 3.2]],
    // Your brief: it rides at the top of the column (set by the scene); here a placeholder.
    [46.4, [-1.2, 2.8, 3.0]],
    // Ask: a fast loop through Slack, Mail and Code (it searches again), then home.
    [T.search0, [-0.8, 2.4, 2.6]],
    [T.search0 + 0.55, add(c("slack"), [1.2, 1.6, 2.6])],
    [T.search0 + 1.15, add(c("mail"), [-1.4, -1.4, 1.8])],
    [T.search0 + 1.7, add(c("code"), [-1.6, 1.4, 2.2])],
    [T.search0 + 2.35, [1.8, -1.0, 3.4]],
    ...loopKeys(RAM, 3.0, T.search0 + 2.7, T.gather0, 1.3, 5.2, 14, [0.1, 1, 0.35]),
    [T.end - 0.25, [0, 0.4, 2.0]],
    [S, [0, 0.4, 2.0]],
  ];
  return track(keys);
}

// The camera: [px, py, pz, tx, ty, tz, fov, roll(deg)].
const CAM = [
  [0, [...C0, 0, 1.5, 0, FOV0, 0]],
  [T.point1, [...C0, 0, 1.5, 0, FOV0, 0]],
  [5.5, [-0.2, 1.7, 66, -0.3, 1.6, 0, FOV0, -0.3]],
  [6.3, [-2.0, 4.0, 38, -3.6, 3.0, 2, 40, -2]],
  [7.0, [-3.4, 6.2, 24.5, -6.2, 3.7, 1.6, 38, -1.5]],
  [8.5, [-3.0, 6.0, 23.0, -6.0, 3.5, 1.2, 38, -0.5]],
  [9.3, [-9.0, 2.6, 14.0, -14.6, -0.4, -4.2, 38, 1.5]],
  [10.8, [-9.6, 2.4, 13.0, -15.0, -0.6, -4.6, 38, 1]],
  [11.8, [-3.4, -3.6, 4.6, -6.4, -7.9, -9.6, 38, -1.5]],
  [15.0, [-3.0, -3.9, 4.0, -6.2, -8.0, -9.9, 38, -0.5]],
  [16.0, [5.6, -3.0, 6.2, 9.0, -7.1, -7.4, 38, 2]],
  [17.15, [5.8, -3.2, 5.6, 9.2, -7.2, -7.6, 38, 1.5]],
  [18.0, [11.6, 4.0, 9.5, 15.6, 1.3, -3.4, 38, -1]],
  [19.05, [11.4, 4.2, 9.0, 15.8, 1.4, -3.6, 38, -0.5]],
  [19.7, [5.0, 9.4, 15.6, 7.2, 7.9, 1.2, 38, 1]],
  [20.6, [4.8, 9.2, 15.0, 7.0, 7.9, 1.0, 38, 0.5]],
  [22.6, [-7.0, 7.0, 54, -8.6, 0.2, -2, 38, 0]],
  [28.3, [-12.5, 5.5, 50, -10.6, 0.0, -2, 38, 0]],
  [30.3, [-16.0, 5.0, 48, -10.5, 0.2, -2, 38, 0]],
  [31.9, [-4.6, 2.6, 27.5, -1.6, 0.2, -0.2, 38, 0]],
  [34.5, [-3.6, 2.8, 26.0, -1.4, 0.2, -0.2, 38, 0]],
  [35.9, [-2.2, 4.2, 16.5, -7.0, 1.0, -2.0, 38, 0]],
  [38.0, [-1.4, 3.8, 15.5, -7.4, 0.8, -2.4, 38, 0]],
  [39.7, [7.0, 2.0, 24, 4.0, 0.2, -1.0, 38, 0]],
  [45.9, [6.4, 2.2, 22.5, 3.8, 0.2, -1.0, 38, 0]],
  [47.4, [0.6, 5.2, 34, 0.6, -1.4, -1.5, 38, 0]],
  [51.4, [0.4, 4.6, 31, 0.4, -1.6, -1.5, 38, 0]],
  [53.0, [3.0, 3.0, 25, 7.2, 0.6, -0.6, 38, 0]],
  [60.2, [2.4, 3.2, 23.5, 6.8, 0.6, -0.6, 38, 0]],
];
export const camKeys = CAM;
// The rules: an orbit, then the end. Computed, appended to the track below.
export const RULES = { r: 20, tilt: 0.1, y: -0.5, spin: -1.25 };
export function cameraAt(track0, t) {
  if (t <= T.rules0) return track0(t);
  // A slow orbit above the constellation while the ring of rules turns past the front.
  const a = keysAt(t);
  return a;
}
function keysAt(t) {
  const k0 = T.rules0, k1 = S;
  const from = CAM[CAM.length - 1][1];
  const yaw = -0.3 + 0.9 * easeInOut(Math.min(1, (t - k0) / (T.end - k0)));
  const dist = 47 - 5 * easeInOut(Math.min(1, (t - k0) / (T.end - k0)));
  const orbit = [Math.sin(yaw) * dist, 12.5, Math.cos(yaw) * dist, 0, -2.2, 0, 38, 0];
  const k = easeInOut(Math.min(1, (t - k0) / 1.6));
  return from.map((v, i) => v + (orbit[i] - v) * k);
}
const easeInOut = (k) => (k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2);
export const cameraTrack = () => {
  const tr = track(CAM);
  return (t) => cameraAt(tr, t);
};

// Project a world point with a camera array (for node checks; the page uses three.js, same maths).
export function project(cam, p) {
  const pos = cam.slice(0, 3), tgt = cam.slice(3, 6), fov = cam[6], roll = -(cam[7] || 0) * Math.PI / 180;
  const f = norm(sub(tgt, pos));
  const r = norm(cross(f, [0, 1, 0]));
  const u = cross(r, f);
  const d = sub(p, pos);
  const x = d[0] * r[0] + d[1] * r[1] + d[2] * r[2];
  const y = d[0] * u[0] + d[1] * u[1] + d[2] * u[2];
  const z = d[0] * f[0] + d[1] * f[1] + d[2] * f[2];
  const k = 540 / Math.tan((fov / 2) * Math.PI / 180);
  let sx = (x / z) * k, sy = (y / z) * k;
  const c = Math.cos(roll), s = Math.sin(roll);
  [sx, sy] = [sx * c - sy * s, sx * s + sy * c];
  return [960 + sx, 540 - sy, z];
}

// The anonymous stars of each cluster (seeded): [x, y, z, size, twinklePhase].
export function clusterStars(id) {
  const cl = CL[id], R = rng(1000 + ORDER.indexOf(id) * 97);
  const g = () => { let s = 0; for (let i = 0; i < 4; i++) s += R(); return (s - 2) / 1.2; };
  const count = id === "directory" ? 230 : Math.max(cl.n + 26, 40);
  const out = [];
  for (let i = 0; i < count; i++) {
    const p = [g() * cl.r * 0.62, g() * cl.r * 0.52, g() * cl.r * 0.62];
    out.push([cl.c[0] + p[0], cl.c[1] + p[1], cl.c[2] + p[2], 0.05 + 0.09 * R() * R(), R() * 6.28]);
  }
  return out;
}
