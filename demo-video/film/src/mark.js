// The AI Peer mark: a mint rounded square with two arches and two dots.
// Same geometry as the product's own (peer/web/layout.py) and the September film's.
import { INK, MINT } from "./lib.js";

export function markSvg({ size = 96, bg = MINT, fg = INK, glow = 0 } = {}) {
  const shadow = glow > 0 ? ` style="filter: drop-shadow(0 0 ${Math.round(size * 0.35 * glow)}px rgba(183,244,207,${(0.55 * glow).toFixed(3)}))"` : "";
  return (
    `<svg width="${size}" height="${size}" viewBox="0 0 100 100" aria-hidden="true"${shadow}>` +
    `<rect x="2" y="2" width="96" height="96" rx="31" fill="${bg}"/>` +
    `<path d="M28 58V42a13 13 0 0 1 26 0v16M46 58V42a13 13 0 0 1 26 0v16" fill="none" stroke="${fg}" stroke-width="9" stroke-linecap="round"/>` +
    `<circle cx="35" cy="72" r="3" fill="${fg}"/><circle cx="65" cy="72" r="3" fill="${fg}"/></svg>`
  );
}
