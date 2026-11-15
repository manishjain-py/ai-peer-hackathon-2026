#!/usr/bin/env node
// make-face: the Peer's face for one blended video (WP7): the version's mascot, drawn by its own
// code on a round mint background, captured by headless Chrome. The film shows this picture on the
// hook's cards, the Zoom tile and the Slack avatar (names.peer_face, screens.json peer_face).
//
//   node demo-video/film/cuts/_blend/faces/make-face.mjs little-peer   -> ../layer/assets/screens/peer-face-little-peer.png
//   node demo-video/film/cuts/_blend/faces/make-face.mjs tag           -> ../layer/assets/screens/peer-face-tag.png
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const FILM = path.resolve(HERE, "..", "..", "..");
const KIT = path.resolve(FILM, "..", "ui-concepts");
const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const which = process.argv[2] || "little-peer";
const SIZE = 512;

const work = path.join(FILM, ".build", "faces", which);
fs.rmSync(work, { recursive: true, force: true });
fs.mkdirSync(work, { recursive: true });
fs.copyFileSync(path.join(KIT, "shared", "fonts", "Manrope.ttf"), path.join(work, "Manrope.ttf"));
fs.copyFileSync(path.join(KIT, "shared", "fonts", "Inter.ttf"), path.join(work, "Inter.ttf"));
const mod = which === "tag" ? path.join(KIT, "tag", "mascot.js") : path.join(KIT, "little-peer", "peer.js");
fs.copyFileSync(mod, path.join(work, "mascot.js"));

// The pose: front on, happy, eyes a little up toward the viewer.
const drawCall = which === "tag"
  ? `const m = await import("./mascot.js"); m.defs(svg); const t = m.buildTag(svg, { label: "Ram's AI Peer" });
     t.draw({ x: 256, y: 420, s: 1.62, alpha: 1, rot: 0, sx: 1, sy: 1, walk: 0, legs: 1, lift: 0, look: [0, -0.1], blink: 0, eyes: 1, happy: 0.8, glow: 0.25, shadow: 0.35 });`
  : `const m = await import("./mascot.js"); m.defs(svg); const p = m.buildPeer(svg);
     const s = 2.15, x = 256, y = 438;
     p.draw({ x, y, s, alpha: 1, rot: 0, sx: 1, sy: 1, sway: -4, look: [0, -0.15], blink: 0, pupil: 1, happy: 0.35, brow: [2.4, 0],
       mouth: [12.2, 2, 11.4], cheek: 0.8, badge: 0.2, aura: 0, handL: [x - 92 * s, y - 30 * s, 1, 1], handR: [x + 92 * s, y - 30 * s, 1, 1],
       shadow: [x, y, 0.8, 0.25] });`;

fs.writeFileSync(path.join(work, "face.html"), `<!doctype html>
<html><head><meta charset="utf-8"><style>
@font-face { font-family: Manrope; src: url(Manrope.ttf); font-weight: 200 800; }
@font-face { font-family: Inter; src: url(Inter.ttf); font-weight: 100 900; }
html, body { margin: 0; width: ${SIZE}px; height: ${SIZE}px; overflow: hidden; background: #0e3a2c; }
</style></head><body>
<svg id="s" width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}">
  <defs><radialGradient id="bg" cx="0.5" cy="0.38" r="0.75">
    <stop offset="0" stop-color="#eafff2"/><stop offset="0.55" stop-color="#b7f4cf"/><stop offset="1" stop-color="#5cc596"/></radialGradient></defs>
  <rect width="${SIZE}" height="${SIZE}" fill="url(#bg)"/>
</svg>
<script type="module">
  const svg = document.getElementById("s");
  await document.fonts.load("800 18px Manrope");
  await document.fonts.load("700 18px Inter");
  ${drawCall}
  document.title = "ready";
</script></body></html>
`);

const out = path.join(HERE, "..", "layer", "assets", "screens", `peer-face-${which}.png`);
fs.mkdirSync(path.dirname(out), { recursive: true });
execFileSync(CHROME, ["--headless=new", "--disable-gpu", "--allow-file-access-from-files", "--hide-scrollbars",
  `--window-size=${SIZE},${SIZE}`, "--virtual-time-budget=4000", "--force-device-scale-factor=1",
  `--screenshot=${out}`, `file://${path.join(work, "face.html")}`], { stdio: ["ignore", "ignore", "pipe"] });
console.log(out);
