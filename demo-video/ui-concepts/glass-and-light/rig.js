// The 3D math of Glass & Light: 4x4 matrices in the CSS convention (x right, y down, z toward the
// viewer, column-major like matrix3d), an orbit camera, and the projection that matches CSS
// `perspective` on the world container. Pure functions only (no DOM), so a node script can import
// this file to check the framing of any moment numerically.

export const P = 1500;            // CSS perspective of the world container (px)
export const CX = 960, CY = 540;  // perspective origin: the centre of the 1920 x 1080 frame

export function ident() {
  const m = new Float64Array(16);
  m[0] = m[5] = m[10] = m[15] = 1;
  return m;
}
// a * b (apply b first, then a)
export function mul(a, b) {
  const o = new Float64Array(16);
  for (let c = 0; c < 4; c++) {
    for (let r = 0; r < 4; r++) {
      o[c * 4 + r] = a[r] * b[c * 4] + a[4 + r] * b[c * 4 + 1] + a[8 + r] * b[c * 4 + 2] + a[12 + r] * b[c * 4 + 3];
    }
  }
  return o;
}
export const chain = (...ms) => ms.reduce((a, b) => mul(a, b));
export function T(x, y, z = 0) { const m = ident(); m[12] = x; m[13] = y; m[14] = z; return m; }
export function S(x, y = x, z = 1) { const m = ident(); m[0] = x; m[5] = y; m[10] = z; return m; }
// CSS rotateX: the top edge goes away from the viewer for a > 0.
export function RX(a) { const c = Math.cos(a), s = Math.sin(a), m = ident(); m[5] = c; m[6] = s; m[9] = -s; m[10] = c; return m; }
// CSS rotateY: the right edge goes away from the viewer for a > 0.
export function RY(a) { const c = Math.cos(a), s = Math.sin(a), m = ident(); m[0] = c; m[2] = -s; m[8] = s; m[10] = c; return m; }
// CSS rotateZ: clockwise on screen for a > 0.
export function RZ(a) { const c = Math.cos(a), s = Math.sin(a), m = ident(); m[0] = c; m[1] = s; m[4] = -s; m[5] = c; return m; }
export const rad = (d) => (d * Math.PI) / 180;

export function apply(m, x, y, z = 0) {
  return [
    m[0] * x + m[4] * y + m[8] * z + m[12],
    m[1] * x + m[5] * y + m[9] * z + m[13],
    m[2] * x + m[6] * y + m[10] * z + m[14],
  ];
}
// The rotation part, transposed (the inverse of a pure rotation).
function rotT(m) {
  const o = ident();
  o[0] = m[0]; o[1] = m[4]; o[2] = m[8];
  o[4] = m[1]; o[5] = m[5]; o[6] = m[9];
  o[8] = m[2]; o[9] = m[6]; o[10] = m[10];
  return o;
}

// The camera: it looks at `target` (world px) from `dist` px away. yaw spins the world about its
// z axis (the stack's axis), pitch tilts it back, turn swings it about the screen's vertical.
// dist = P draws the z = 0 plane at exactly 1:1 when the angles are zero.
export function camera({ target = [0, 0, 0], yaw = 0, pitch = 0, turn = 0, roll = 0, dist = P }) {
  const R = chain(RZ(roll), RY(turn), RX(pitch), RZ(yaw));
  // world -> container: v = R (w - target) + (0, 0, P - dist), then + (CX, CY)
  const view = chain(T(CX, CY, P - dist), R, T(-target[0], -target[1], -target[2]));
  const eyeW = apply(rotT(R), 0, 0, dist);
  const eye = [eyeW[0] + target[0], eyeW[1] + target[1], eyeW[2] + target[2]];
  return { view, eye, R, dist, target };
}

// Container point -> screen point (what CSS perspective does).
export function persp(X, Y, Z) {
  const k = P / Math.max(1e-3, P - Z);
  return [CX + (X - CX) * k, CY + (Y - CY) * k, k, Z];
}
// World point -> screen [x, y, scale, viewZ].
export function project(cam, w) {
  const v = apply(cam.view, w[0], w[1], w[2]);
  return persp(v[0], v[1], v[2]);
}

// The CSS transform for an element whose local px (origin top-left) map to world by `model`.
// Returns { css, depth, near } where depth is the distance from the eye to the element's centre
// (paint far ones first) and near is the largest view z of its corners (hide if close to P).
export function placement(cam, model, w, h) {
  const m = mul(cam.view, model);
  const c = apply(m, w / 2, h / 2, 0);
  let near = -1e9;
  for (const [u, v] of [[0, 0], [w, 0], [0, h], [w, h]]) near = Math.max(near, apply(m, u, v, 0)[2]);
  const depth = Math.hypot(c[0] - CX, c[1] - CY, c[2] - P);
  return { m, css: cssMatrix(m), depth, near, centre: persp(c[0], c[1], c[2]) };
}

// A 2D-equivalent matrix is written as a plain translate/scale, so text stays pixel-crisp when
// the camera is square on.
export function cssMatrix(m) {
  const flat = Math.abs(m[2]) < 1e-9 && Math.abs(m[3]) < 1e-9 && Math.abs(m[6]) < 1e-9 && Math.abs(m[7]) < 1e-9 &&
    Math.abs(m[8]) < 1e-9 && Math.abs(m[9]) < 1e-9 && Math.abs(m[11]) < 1e-9 && Math.abs(m[14]) < 1e-6 &&
    Math.abs(m[1]) < 1e-9 && Math.abs(m[4]) < 1e-9 && Math.abs(m[0] - 1) < 1e-9 && Math.abs(m[5] - 1) < 1e-9;
  if (flat) return `translate(${Math.round(m[12])}px, ${Math.round(m[13])}px)`;
  let s = "matrix3d(";
  for (let i = 0; i < 16; i++) s += (i ? "," : "") + (Math.abs(m[i]) < 1e-12 ? 0 : +m[i].toPrecision(10));
  return s + ")";
}

// A model matrix: put the element's centre at world point c, rotated by R (a matrix), for an
// element of w x h px.
export const centred = (c, R, w, h) => chain(T(c[0], c[1], c[2]), R, T(-w / 2, -h / 2, 0));
