// WP7 v2 (Tag): Draft 3's globe on v2's close. earth-d3.js is a copy of the film's own
// src/scenes/earth.js (placed by the cut's "copies"); it runs on Draft 3's film seconds, 108.0 to
// 120.0. The slot's "warp" maps v2's film seconds onto them, piecewise linear, so the pull-out, the
// lights coming on and the lit horizon under the end card keep their order and their look. The
// slot's scene is still "earth", so the end card knows it sits over the globe (and shows the credit).
import { create as createD3 } from "./earth-d3.js";

export async function create(slot, film) {
  const inner = await createD3(slot, film);
  const pts = (slot.warp && slot.warp.points) || [[slot.start, 108.0], [slot.start + 12.0, 120.0]];
  const map = (t) => {
    if (t <= pts[0][0]) return pts[0][1] + (t - pts[0][0]);
    for (let i = 1; i < pts.length; i++) {
      const [a, A] = pts[i - 1];
      const [b, B] = pts[i];
      if (t <= b) return A + ((t - a) * (B - A)) / (b - a);
    }
    const [b, B] = pts[pts.length - 1];
    return B + (t - b);
  };
  return { ...inner, from: slot.start, to: pts[pts.length - 1][0], render: (t) => inner.render(map(t)) };
}
