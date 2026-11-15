// Morning light over the desk, in screen space above the 3D world: the window's panes of warm light
// and the shade around them (blended onto everything below, the pen included), leaf shadows that
// sway, dust motes drifting in the beam, a fine film grain, and the pen's trail of light.
import { el, clamp, ease, prog, noise, rng } from "../shared/kit.js";
import { css } from "./book.js";

export function makeLight(stage, T) {
  const L = {};
  L.shade = el("div", "fx fx-shade", stage);
  L.shade.style.backgroundImage = `url(${T.shade})`;
  L.light = el("div", "fx fx-light", stage);
  L.light.style.backgroundImage = `url(${T.light})`;
  L.leaves = el("div", "fx fx-leaves", stage);
  L.leaves.style.backgroundImage = `url(${T.leaves})`;
  L.vig = el("div", "fx fx-vig", stage);
  L.trail = el("canvas", "fx fx-trail", stage);
  L.trail.width = 1920; L.trail.height = 1080;
  L.tctx = L.trail.getContext("2d");
  L.dust = el("canvas", "fx fx-dust", stage);
  L.dust.width = 1920; L.dust.height = 1080;
  L.dctx = L.dust.getContext("2d");
  L.film = el("div", "fx fx-film", stage);
  L.film.style.backgroundImage = `url(${T.film})`;
  const r = rng(808);
  L.motes = Array.from({ length: 70 }, () => ({ x: r() * 2200 - 140, y: r() * 1200 - 60, s: 0.6 + r() * 2.2, v: 4 + r() * 10, ph: r() * 100, a: 0.25 + r() * 0.6 }));
  return L;
}

// cam: { cx, cy, zoom }: the desk point at the screen centre and the zoom. sun: how far the light
// has travelled across the desk (desk px). fade: 0 before the desk appears.
export function renderLight(L, t, cam, sun, fade) {
  const z = cam.zoom;
  const toS = (x, y) => [960 + (x - cam.cx) * z, 540 + (y - cam.cy) * z];
  const [sx, sy] = toS(-520 + sun, -420 + sun * 0.18);
  const tr = `translate(${sx.toFixed(1)}px, ${sy.toFixed(1)}px) scale(${(2.15 * z).toFixed(4)})`;
  css(L.shade, "transform", tr);
  css(L.light, "transform", tr);
  css(L.shade, "opacity", (0.95 * fade).toFixed(3));
  css(L.light, "opacity", (0.7 * fade).toFixed(3));
  const [lx, ly] = toS(-180 + sun * 0.8 + noise(t * 0.35, 4) * 14, -230 + noise(t * 0.3, 5) * 10);
  css(L.leaves, "transform", `translate(${lx.toFixed(1)}px, ${ly.toFixed(1)}px) rotate(${(noise(t * 0.4, 6) * 2.2).toFixed(2)}deg) scale(${(1.9 * z).toFixed(4)})`);
  css(L.leaves, "opacity", (0.2 * fade).toFixed(3));
  css(L.vig, "opacity", fade.toFixed(3));
  // film grain: a new offset every frame (from t, never a clock)
  const f = Math.floor(t * 30);
  css(L.film, "backgroundPosition", `${(f * 73) % 256}px ${(f * 151) % 256}px`);
  css(L.film, "opacity", (0.055 * fade).toFixed(3));
  // dust in the beam
  const g = L.dctx;
  g.clearRect(0, 0, 1920, 1080);
  if (fade > 0.01) {
    for (const m of L.motes) {
      const x = ((m.x + t * m.v + noise(t * 0.2 + m.ph, 7) * 40) % 2200 + 2200) % 2200 - 140;
      const y = m.y + Math.sin(t * 0.3 + m.ph) * 30 + noise(t * 0.25 + m.ph, 8) * 26 - t * 2.2;
      const yy = ((y % 1200) + 1200) % 1200 - 60;
      // brightest inside the window light (upper left to centre)
      const inBeam = clamp(1 - Math.hypot((x - 760) / 900, (yy - 420) / 520));
      const tw = 0.5 + 0.5 * noise(t * 1.3 + m.ph, 9);
      const a = m.a * inBeam * tw * fade;
      if (a < 0.02) continue;
      g.fillStyle = `rgba(255, 244, 220, ${a.toFixed(3)})`;
      g.beginPath();
      g.arc(x, yy, m.s * z, 0, Math.PI * 2);
      g.fill();
    }
  }
}

// The pen's trail: a fading streak through its recent positions (sampled from t back).
export function renderTrail(L, pts, strength) {
  const g = L.tctx;
  g.clearRect(0, 0, 1920, 1080);
  if (strength < 0.02 || pts.length < 2) return;
  g.lineCap = "round";
  g.lineJoin = "round";
  for (let i = 1; i < pts.length; i++) {
    const k = 1 - i / pts.length;
    g.strokeStyle = `rgba(170, 255, 214, ${(0.55 * k * strength).toFixed(3)})`;
    g.lineWidth = 1 + 7 * k;
    g.shadowColor = "rgba(120, 240, 180, 0.9)";
    g.shadowBlur = 14 * k;
    g.beginPath();
    g.moveTo(pts[i - 1][0], pts[i - 1][1]);
    g.lineTo(pts[i][0], pts[i][1]);
    g.stroke();
  }
  g.shadowBlur = 0;
}
