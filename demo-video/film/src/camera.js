// One straight camera line from a shot through the laptop's screen into what follows it. The
// push-in (src/scenes/pushin.js) flies along it; a shot before the push-in may already move in
// along it slowly ("camera": {"to_scale": 1.3} in shots.json), and the push-in then carries on
// from that scale and speed, so the two read as one move.

export const centre = (q) => [q.reduce((a, p) => a + p[0], 0) / q.length, q.reduce((a, p) => a + p[1], 0) / q.length];
/** Area of a polygon given as points in order. */
export function area(q) {
  let a = 0;
  q.forEach((p, i) => {
    const n = q[(i + 1) % q.length];
    a += p[0] * n[1] - n[0] * p[1];
  });
  return Math.abs(a) / 2;
}

/**
 * The push-in's line, from its data (P.quad: the screen's corners as fractions of the frame;
 * P.window: where the screen lands): the screen in pixels, its target, the zoom S that brings
 * the screen to the size of where it lands, and the one point F that a straight push leaves in place.
 */
export function pushLine(P, W, H) {
  const q0 = P.quad.map(([x, y]) => [x * W, y * H]);
  const win = P.window;
  const target = [[win.x, win.y], [win.x + win.w, win.y], [win.x + win.w, win.y + win.h], [win.x, win.y + win.h]];
  const c0 = centre(q0), cT = centre(target);
  const S = Math.sqrt((win.w * win.h) / area(q0));
  const F = [c0[0] + (cT[0] - c0[0]) / (1 - S), c0[1] + (cT[1] - c0[1]) / (1 - S)];
  return { q0, target, S, F };
}

/**
 * Where the camera of a shot is at film time t: scale s about the point F, or null when the shot
 * does not move. It moves in at an even pace (even in the log of the scale) from 1 at its start
 * to camera.to_scale at its end, toward the push-in that follows it.
 */
export function cameraAt(slot, film, t) {
  if (!slot.camera || !(slot.camera.to_scale > 1)) return null;
  const next = film.slots[film.slots.findIndex((x) => x.id === slot.id) + 1];
  if (!next || !next.pushin) return null;
  const { F } = pushLine(next.pushin, film.width, film.height);
  const u = Math.min(1, Math.max(0, (t - slot.start) / slot.length));
  return { F, s: Math.exp(Math.log(slot.camera.to_scale) * u) };
}

/** The CSS transform of a camera (with transform-origin 0 0). */
export const cameraTransform = ({ F, s }) =>
  `translate(${(F[0] * (1 - s)).toFixed(2)}px, ${(F[1] * (1 - s)).toFixed(2)}px) scale(${s.toFixed(5)})`;
