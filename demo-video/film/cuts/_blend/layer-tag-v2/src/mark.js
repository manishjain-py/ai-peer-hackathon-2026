// WP7 v2 (Tag): the AI Peer mark is the tag itself (Manish's ruling): the dark green name tag with
// its light "AI" pill and two googly eyes on its top edge, no legs, on the film's mint rounded tile
// (so it reads on the dark caption chips and on light screens alike). Lies over the film's src/mark.js
// in this cut only, with the same signature. The tag's colours are mascot.js's.
//
// Self-contained SVG: flat shapes only, no ids (the mascot's "tg" ids can never clash with it), so
// any number of copies can sit anywhere on the page. Two levels of detail by size: below 64 px it
// is drawn bolder (bigger eyes, no lettering) so it still reads at 30 to 42 px; from 64 px up it
// gets the "AI" lettering, eye shines, the tag's light and dark edges and a soft shadow.
import { INK, MINT } from "./lib.js";

const TAG = { body: "#1f5b43", edge: "#123b2a", hi: "#3f8467", lo: "#123d2b", pill: "#f6f3ea", pillText: "#1f5b43", eye: "#fbfdf8" };

const r2 = (v) => Math.round(v * 100) / 100;
// A stadium (fully round ends) as a rect.
const stadium = (x0, y0, w, h, fill, extra = "") =>
  `<rect x="${r2(x0)}" y="${r2(y0)}" width="${r2(w)}" height="${r2(h)}" rx="${r2(h / 2)}" fill="${fill}"${extra}/>`;

export function markSvg({ size = 96, bg = MINT, fg = INK, glow = 0 } = {}) {
  const shadow = glow > 0 ? ` style="filter: drop-shadow(0 0 ${Math.round(size * 0.35 * glow)}px rgba(183,244,207,${(0.55 * glow).toFixed(3)}))"` : "";
  const big = size >= 64;
  // Geometry in the 100-unit box: the body, the eyes standing on its top edge, the AI pill.
  // (the pill sits about a quarter of the body's height in from its right end, as on the mascot)
  const G = big
    ? { bx: 11, by: 43, bw: 78, bh: 30, ex: 14.2, ey: 39.5, rx: 10.6, ry: 10.1, pr: 4.4, px: 70.5, pw: 22.5, ph: 14.6 }
    : { bx: 8, by: 42.5, bw: 84, bh: 33, ex: 14.6, ey: 38.5, rx: 12.2, ry: 11.6, pr: 5.4, px: 71, pw: 22, ph: 14.5 };
  const cy = G.by + G.bh / 2;
  const parts = [];
  parts.push(`<rect x="2" y="2" width="96" height="96" rx="30" fill="${bg}"/>`);
  if (big) parts.push(`<ellipse cx="50" cy="${r2(G.by + G.bh + 3.4)}" rx="34" ry="3.1" fill="${TAG.lo}" opacity="0.16"/>`);
  // the body
  parts.push(stadium(G.bx, G.by, G.bw, G.bh, TAG.body, big ? ` stroke="${TAG.edge}" stroke-width="0.9" stroke-opacity="0.7"` : ""));
  if (big) {
    parts.push(`<path d="M ${G.bx + 11} ${r2(G.by + 2.6)} H ${G.bx + G.bw - 11}" stroke="${TAG.hi}" stroke-width="1.6" stroke-linecap="round" opacity="0.6"/>`);
    parts.push(`<path d="M ${G.bx + 12} ${r2(G.by + G.bh - 3.2)} H ${G.bx + G.bw - 12}" stroke="${TAG.lo}" stroke-width="2.2" stroke-linecap="round" opacity="0.5"/>`);
  }
  // the AI pill on its right end
  parts.push(stadium(G.px - G.pw / 2, cy - G.ph / 2, G.pw, G.ph, TAG.pill));
  if (big) {
    parts.push(`<text x="${G.px}" y="${r2(cy + 3.75)}" text-anchor="middle" fill="${TAG.pillText}" ` +
      `style="font: 800 10.6px 'Manrope', sans-serif; letter-spacing: 0.2px">AI</text>`);
  }
  // the eyes, on the top edge, a little toward the pill: friendly, looking out
  for (const sd of [-1, 1]) {
    const x = 50 + sd * G.ex;
    parts.push(`<ellipse cx="${r2(x)}" cy="${G.ey}" rx="${G.rx}" ry="${G.ry}" fill="${TAG.eye}" stroke="${fg}" stroke-width="${big ? 2.1 : 2.6}"/>`);
    parts.push(`<circle cx="${r2(x + G.rx * 0.2)}" cy="${r2(G.ey + G.ry * 0.16)}" r="${G.pr}" fill="${fg}"/>`);
    if (big) parts.push(`<circle cx="${r2(x + G.rx * 0.2 - 1.45)}" cy="${r2(G.ey + G.ry * 0.16 - 1.6)}" r="1.35" fill="#ffffff"/>`);
  }
  return `<svg width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true"${shadow}>${parts.join("")}</svg>`;
}
