// The things the Peer holds, drawn in SVG in world pixels: Ram's keycard, a pencil, a rubber
// stamp, a paper plane, a stack of brief cards, a source tag; and a pool of sparkles.
import { S } from "./peer.js";
import { sources } from "../shared/data.js";

const f1 = (v) => (Math.round(v * 10) / 10).toString();
const place = (g, x, y, rot, s, a) => {
  if (a <= 0.001) { g.style.display = "none"; return; }
  g.style.display = "";
  g.setAttribute("transform", `translate(${f1(x)} ${f1(y)}) rotate(${f1(rot)}) scale(${s.toFixed(3)})`);
  g.setAttribute("opacity", a.toFixed(3));
};

export function buildProps(layer, top) {
  // Ram's keycard: "as you".
  const key = S("g", {}, layer);
  S("rect", { x: -36, y: -24, width: 72, height: 48, rx: 8, fill: "#ffffff", stroke: "#167353", "stroke-width": 1.8 }, key);
  S("path", { d: "M -36 -14 V -16 A 8 8 0 0 1 -28 -24 H 28 A 8 8 0 0 1 36 -16 V -14 Z", fill: "#167353" }, key);
  S("circle", { cx: -19, cy: 4, r: 10, fill: "#dff5e8", stroke: "#167353", "stroke-width": 1.2 }, key);
  S("text", { x: -19, y: 8.6, "text-anchor": "middle", fill: "#12563f", style: "font: 800 12.5px Inter, sans-serif" }, key).textContent = "R";
  S("text", { x: -5, y: 3, fill: "#13241d", style: "font: 800 13.5px Manrope, sans-serif" }, key).textContent = "ram";
  S("text", { x: -5, y: 15.5, fill: "#167353", style: "font: 700 9.6px Manrope, sans-serif" }, key).textContent = "read-only";
  S("rect", { x: 22, y: -9, width: 9, height: 7, rx: 1.5, fill: "#f2c94c" }, key);

  // A pencil along +x: eraser, ferrule, yellow body, wood, graphite. Gripped at x = 30.
  const pencil = S("g", {}, layer);
  S("rect", { x: 0, y: -5.5, width: 11, height: 11, rx: 3, fill: "#ff9aa8" }, pencil);
  S("rect", { x: 10, y: -5.5, width: 8, height: 11, fill: "#cbc4b8" }, pencil);
  S("rect", { x: 17, y: -5.5, width: 56, height: 11, fill: "#ffcb45" }, pencil);
  S("rect", { x: 17, y: -1.2, width: 56, height: 2.4, fill: "#f0a92e" }, pencil);
  S("path", { d: "M 73 -5.5 L 87 -1.4 L 87 1.4 L 73 5.5 Z", fill: "#f3d3a5" }, pencil);
  S("path", { d: "M 84 -2.3 L 91 0 L 84 2.3 Z", fill: "#2f2f2f" }, pencil);

  // A rubber stamp; origin at the middle of the rubber face.
  const stamp = S("g", {}, layer);
  S("circle", { cx: 0, cy: -76, r: 19, fill: "#b06d3c" }, stamp);
  S("circle", { cx: -6, cy: -82, r: 6, fill: "#e3a574", opacity: 0.8 }, stamp);
  S("rect", { x: -10, y: -62, width: 20, height: 34, rx: 5, fill: "#94582f" }, stamp);
  S("rect", { x: -82, y: -30, width: 164, height: 24, rx: 7, fill: "#7a4826" }, stamp);
  S("rect", { x: -82, y: -30, width: 164, height: 7, rx: 3, fill: "#a2663a" }, stamp);
  S("rect", { x: -78, y: -7, width: 156, height: 8, rx: 2, fill: "#1f6e50" }, stamp);

  // A paper plane, nose to +x.
  const plane = S("g", {}, layer);
  S("path", { d: "M 64 0 L -46 -34 L -22 -2 Z", fill: "#ffffff", stroke: "#a9dcc3", "stroke-width": 1.4, "stroke-linejoin": "round" }, plane);
  S("path", { d: "M 64 0 L -22 -2 L -34 14 Z", fill: "#d6ece2", stroke: "#a9dcc3", "stroke-width": 1.2, "stroke-linejoin": "round" }, plane);
  S("path", { d: "M 64 0 L -34 14 L -40 30 Z", fill: "#f2faf6", stroke: "#a9dcc3", "stroke-width": 1.2, "stroke-linejoin": "round" }, plane);
  S("path", { d: "M 12 -14 L 30 -9", stroke: "#7aa7ff", "stroke-width": 2, "stroke-linecap": "round", opacity: 0.6 }, plane);

  // A small stack of four brief cards, edges in the source colours.
  const stack = S("g", {}, layer);
  const stackCards = ["slack", "mail", "code", "slack"].map((id, i) => {
    const g = S("g", { transform: `translate(${i * 2.5} ${-i * 4}) rotate(${(i % 2 ? 2 : -2)})` }, stack);
    S("rect", { x: -34, y: -22, width: 68, height: 44, rx: 6, fill: "#fffdf8", stroke: "#d9cbb6", "stroke-width": 1 }, g);
    S("rect", { x: -34, y: -22, width: 6, height: 44, rx: 3, fill: sources.find((s) => s.id === id).hue }, g);
    S("rect", { x: -22, y: -12, width: 44, height: 5, rx: 2.5, fill: "#cfc3b2" }, g);
    S("rect", { x: -22, y: -2, width: 34, height: 4, rx: 2, fill: "#e3d9cb" }, g);
    S("rect", { x: -22, y: 7, width: 38, height: 4, rx: 2, fill: "#e3d9cb" }, g);
    return g;
  });

  // A source tag (for "sources and dates on everything").
  const tag = S("g", {}, layer);
  S("path", { d: "M -46 -17 H 34 L 50 0 L 34 17 H -46 A 6 6 0 0 1 -52 11 V -11 A 6 6 0 0 1 -46 -17 Z", fill: "#fffdf6", stroke: "#7aa7ff", "stroke-width": 2 }, tag);
  S("circle", { cx: 36, cy: 0, r: 4, fill: "#f6efe3", stroke: "#7aa7ff", "stroke-width": 1.5 }, tag);
  S("text", { x: -40, y: 5.5, fill: "#2a4d8f", style: "font: 800 14px Manrope, sans-serif" }, tag).textContent = "Docs · Nov 11";

  // Sparkles: a pool of four-point stars on top of everything.
  const STAR = "M 0 -1 L 0.24 -0.24 L 1 0 L 0.24 0.24 L 0 1 L -0.24 0.24 L -1 0 L -0.24 -0.24 Z";
  const pool = Array.from({ length: 110 }, () => S("path", { d: STAR, fill: "#ffffff" }, top));

  return {
    key: (x, y, rot, s, a) => place(key, x, y, rot, s, a),
    pencil: (x, y, rot, a) => place(pencil, x, y, rot, 1, a),
    // Where the pencil's tip is when gripped at (x, y) at angle rot (degrees).
    pencilTip: (x, y, rot) => {
      const r = (rot * Math.PI) / 180;
      return [x + Math.cos(r) * 61, y + Math.sin(r) * 61];
    },
    pencilAt: (tipX, tipY, rot, a) => {
      const r = (rot * Math.PI) / 180;
      place(pencil, tipX - Math.cos(r) * 91, tipY - Math.sin(r) * 91, rot, 1, a);
    },
    stamp: (x, y, rot, a) => place(stamp, x, y, rot, 1, a),
    plane: (x, y, rot, s, a) => place(plane, x, y, rot, s, a),
    stack: (x, y, rot, n, a) => {
      place(stack, x, y, rot, 1, n > 0 ? a : 0);
      stackCards.forEach((c, i) => (c.style.display = i < n ? "" : "none"));
    },
    tag: (x, y, rot, s, a) => place(tag, x, y, rot, s, a),
    sparkles(list) {
      pool.forEach((p, i) => {
        const q = list[i];
        if (!q) { p.style.display = "none"; return; }
        p.style.display = "";
        p.setAttribute("transform", `translate(${f1(q.x)} ${f1(q.y)}) rotate(${f1(q.r)}) scale(${q.s.toFixed(2)})`);
        p.setAttribute("opacity", q.a.toFixed(3));
        p.setAttribute("fill", q.c || "#ffffff");
      });
    },
  };
}
