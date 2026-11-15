// The Peer: a glossy mint gumdrop with big oval eyes, a small mouth, two floating round hands,
// a sprout that sways, and an "AI" badge on its chest at all times. Drawn in SVG, in world
// pixels; draw(pose) sets every moving attribute on every frame.
const NS = "http://www.w3.org/2000/svg";
export function S(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
const set = (e, k, v) => e.setAttribute(k, v);
const f1 = (v) => (Math.round(v * 10) / 10).toString();

// The body: a gumdrop, base centre at (0, 0), 164 wide and 128 tall.
const BODY = "M -66 0 C -80 0 -84 -10 -82 -24 C -78 -80 -50 -128 0 -128 C 50 -128 78 -80 82 -24 C 84 -10 80 0 66 0 Z";
const EYE = { y: -78, dx: 25, rx: 17, ry: 22 };

export function defs(svg) {
  const d = S("defs", {}, svg);
  d.innerHTML = `
  <linearGradient id="lpBody" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#dcfde9"/><stop offset="0.42" stop-color="#a2f0c6"/>
    <stop offset="0.82" stop-color="#5cc596"/><stop offset="1" stop-color="#2e9a6c"/></linearGradient>
  <radialGradient id="lpGloss" cx="0.34" cy="0.24" r="0.6">
    <stop offset="0" stop-color="#fff" stop-opacity="0.95"/><stop offset="0.3" stop-color="#fff" stop-opacity="0.38"/>
    <stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
  <linearGradient id="lpRim" x1="0" y1="0" x2="1" y2="0.3">
    <stop offset="0.58" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#fffbe8" stop-opacity="0.95"/></linearGradient>
  <radialGradient id="lpHand" cx="0.36" cy="0.3" r="0.75">
    <stop offset="0" stop-color="#f0fff6"/><stop offset="0.5" stop-color="#a9f2ca"/><stop offset="1" stop-color="#47b283"/></radialGradient>
  <radialGradient id="lpEyeW" cx="0.5" cy="0.32" r="0.75">
    <stop offset="0" stop-color="#ffffff"/><stop offset="0.8" stop-color="#f1f5f4"/><stop offset="1" stop-color="#dce7e3"/></radialGradient>
  <radialGradient id="lpShadow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#5a3216" stop-opacity="0.34"/><stop offset="0.6" stop-color="#5a3216" stop-opacity="0.16"/>
    <stop offset="1" stop-color="#5a3216" stop-opacity="0"/></radialGradient>
  <radialGradient id="lpGlow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#d9ffe9" stop-opacity="0.9"/><stop offset="1" stop-color="#b7f4cf" stop-opacity="0"/></radialGradient>
  <clipPath id="lpEyeL"><ellipse cx="${-EYE.dx}" cy="${EYE.y}" rx="${EYE.rx}" ry="${EYE.ry}"/></clipPath>
  <clipPath id="lpEyeR"><ellipse cx="${EYE.dx}" cy="${EYE.y}" rx="${EYE.rx}" ry="${EYE.ry}"/></clipPath>
  <clipPath id="lpMouth"><path id="lpMouthClip" d="M -10 -44 Q 0 -40 10 -44 Q 0 -36 -10 -44 Z"/></clipPath>
  <filter id="lpBlur4" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="4"/></filter>`;
  return d;
}

export function buildPeer(svg) {
  const root = S("g", { class: "lp-peer" }, svg);
  const shadow = S("ellipse", { rx: 66, ry: 13, fill: "url(#lpShadow)" }, root);
  const aura = S("ellipse", { rx: 120, ry: 110, fill: "url(#lpGlow)", opacity: 0 }, root);
  // Smears: faint copies of the body along a fast move, like the in-betweens of a cartoon.
  const ghosts = [0, 1, 2].map(() => S("path", { d: BODY, fill: "#b4f3d2", opacity: 0 }, root));
  const body = S("g", {}, root);
  // The sprout on top, which sways behind the motion.
  const sprout = S("g", {}, body);
  S("path", { d: "M 0 -126 C 0 -134 1 -141 4 -147", stroke: "#2f9a6a", "stroke-width": 4.2, fill: "none", "stroke-linecap": "round" }, sprout);
  S("path", { d: "M 4 -147 C 10 -159 25 -160 31 -151 C 23 -144 12 -142 4 -147 Z", fill: "#62cf98" }, sprout);
  S("path", { d: "M 7 -148 C 14 -152 21 -153 27 -151", stroke: "#bff5d6", "stroke-width": 1.6, fill: "none", "stroke-linecap": "round" }, sprout);
  S("path", { d: "M 2 -140 C -4 -149 -15 -150 -19 -144 C -13 -139 -6 -137 2 -140 Z", fill: "#7bdcaa" }, sprout);
  // Body: gradient fill, gloss, rim light, a soft highlight and a glint.
  S("path", { d: BODY, fill: "url(#lpBody)" }, body);
  S("path", { d: BODY, fill: "url(#lpGloss)" }, body);
  S("path", { d: BODY, fill: "none", stroke: "url(#lpRim)", "stroke-width": 5 }, body);
  S("path", { d: BODY, fill: "none", stroke: "#1f7a55", "stroke-opacity": 0.22, "stroke-width": 1.5 }, body);
  S("ellipse", { cx: -34, cy: -100, rx: 17, ry: 9, fill: "#fff", opacity: 0.7, transform: "rotate(-32 -34 -100)" }, body);
  S("circle", { cx: -50, cy: -84, r: 3.2, fill: "#fff", opacity: 0.85 }, body);
  // The face moves a little toward where it looks: a head turn.
  const face = S("g", {}, body);
  const cheeks = [-1, 1].map((s) => S("ellipse", { cx: s * 46, cy: -50, rx: 11, ry: 6.5, fill: "#ff8e86", opacity: 0.42 }, face));
  const eyes = [-1, 1].map((s) => {
    const cx = s * EYE.dx;
    const g = S("g", { "clip-path": `url(#${s < 0 ? "lpEyeL" : "lpEyeR"})` }, face);
    S("ellipse", { cx, cy: EYE.y, rx: EYE.rx, ry: EYE.ry, fill: "url(#lpEyeW)" }, g);
    const pupil = S("g", {}, g);
    S("circle", { cx, cy: EYE.y, r: 11, fill: "#13232b" }, pupil);
    S("circle", { cx, cy: EYE.y, r: 7.2, fill: "#20343e" }, pupil);
    S("circle", { cx: cx + 4.2, cy: EYE.y - 5, r: 4.4, fill: "#fff" }, pupil);
    S("circle", { cx: cx - 3.6, cy: EYE.y + 4.6, r: 1.9, fill: "#fff", opacity: 0.9 }, pupil);
    const lid = S("rect", { x: cx - 22, y: EYE.y - EYE.ry - 4, width: 44, height: 0, fill: "#a4efc6" }, g);
    const lash = S("rect", { x: cx - 22, y: EYE.y - EYE.ry - 4, width: 44, height: 2.6, fill: "#2b6a50" }, g);
    const low = S("ellipse", { cx, cy: EYE.y + 40, rx: 26, ry: 21, fill: "#9eedc2" }, g);
    S("ellipse", { cx, cy: EYE.y, rx: EYE.rx, ry: EYE.ry, fill: "none", stroke: "#215c45", "stroke-opacity": 0.32, "stroke-width": 1.4 }, face);
    return { cx, pupil, lid, lash, low };
  });
  const brows = [-1, 1].map((s) => S("path", {
    d: `M ${s * 36} -106 Q ${s * 25} -112 ${s * 14} -107`, stroke: "#1d4636", "stroke-width": 4, fill: "none", "stroke-linecap": "round",
  }, face));
  const mouth = S("path", { fill: "#1d3b30" }, face);
  const tongueG = S("g", { "clip-path": "url(#lpMouth)" }, face);
  const tongue = S("ellipse", { cx: 0, cy: -34, rx: 9, ry: 6, fill: "#ff8f8f" }, tongueG);
  const mouthClip = svg.querySelector("#lpMouthClip");
  // The AI badge on its chest.
  const badge = S("g", {}, body);
  const badgeGlow = S("rect", { x: -31, y: -37, width: 62, height: 35, rx: 13, fill: "#fff6b8", opacity: 0, filter: "url(#lpBlur4)" }, badge);
  S("rect", { x: -25, y: -31.5, width: 50, height: 27, rx: 9.5, fill: "#ffffff", stroke: "#167353", "stroke-width": 2 }, badge);
  S("text", { x: 0.5, y: -11.6, "text-anchor": "middle", fill: "#167353", style: "font: 800 18px Manrope, sans-serif; letter-spacing: 0.05em" }, badge).textContent = "AI";
  // Hands.
  const hands = [0, 1].map(() => {
    const g = S("g", {}, root);
    S("circle", { r: 15.5, fill: "url(#lpHand)", stroke: "#1f7a55", "stroke-opacity": 0.28, "stroke-width": 1.2 }, g);
    S("ellipse", { cx: -5, cy: -6, rx: 5.5, ry: 3.8, fill: "#fff", opacity: 0.75, transform: "rotate(-30 -5 -6)" }, g);
    return g;
  });
  const handsLayer = root;           // props go between the body and the hands
  const propsLayer = S("g", {}, root);
  root.insertBefore(propsLayer, hands[0]);

  function draw(p) {
    const show = p.alpha > 0.001;
    root.style.display = show ? "" : "none";
    if (!show) return;
    root.setAttribute("opacity", f1(p.alpha));
    const sc = p.s ?? 1;
    // Shadow on the ground under it.
    const [shx, shy, shs, sho] = p.shadow;
    set(shadow, "cx", f1(shx)); set(shadow, "cy", f1(shy));
    set(shadow, "rx", f1(66 * shs * sc)); set(shadow, "ry", f1(13 * shs * sc)); set(shadow, "opacity", f1(sho));
    set(aura, "cx", f1(p.x)); set(aura, "cy", f1(p.y - 64 * sc)); set(aura, "opacity", f1(p.aura || 0));
    set(body, "transform", `translate(${f1(p.x)} ${f1(p.y)}) rotate(${f1(p.rot || 0)}) scale(${(p.sx * sc).toFixed(3)} ${(p.sy * sc).toFixed(3)})`);
    ghosts.forEach((gh, i) => {
      const q = p.ghosts && p.ghosts[i];
      if (!q || q.a < 0.01) { set(gh, "opacity", "0"); return; }
      set(gh, "opacity", q.a.toFixed(3));
      set(gh, "transform", `translate(${f1(q.x)} ${f1(q.y)}) rotate(${f1(q.rot)}) scale(${(q.sx * q.s).toFixed(3)} ${(q.sy * q.s).toFixed(3)})`);
    });
    set(sprout, "transform", `rotate(${f1(p.sway || 0)} 0 -126)`);
    const [lx, ly] = p.look;
    set(face, "transform", `translate(${f1(lx * 7)} ${f1(ly * 4)})`);
    const blink = Math.max(p.lid || 0, p.blink || 0);
    const pup = p.pupil ?? 1;
    eyes.forEach((e) => {
      const px = lx * 6.2, py = ly * 6.8;
      set(e.pupil, "transform", `translate(${f1(px + e.cx * (1 - pup))} ${f1(py + EYE.y * (1 - pup))}) scale(${pup.toFixed(3)})`);
      const h = blink * (EYE.ry * 2 + 6);
      set(e.lid, "height", f1(h));
      set(e.lash, "y", f1(EYE.y - EYE.ry - 4 + h - 1.3));
      set(e.lash, "opacity", blink > 0.06 ? "1" : "0");
      set(e.low, "cy", f1(EYE.y + 40 - (p.happy || 0) * 27));
    });
    const [bl, bt] = p.brow || [0, 0];
    brows.forEach((b, i) => {
      const s = i === 0 ? -1 : 1;
      set(b, "transform", `translate(0 ${f1(-bl)}) rotate(${f1(-s * bt)} ${s * 25} -108)`);
    });
    const [w, top, bot] = p.mouth;
    const d = `M ${f1(-w)} -44 Q 0 ${f1(-44 + top)} ${f1(w)} -44 Q 0 ${f1(-44 + bot)} ${f1(-w)} -44 Z`;
    set(mouth, "d", d);
    mouthClip.setAttribute("d", d);
    set(tongue, "cy", f1(-44 + bot * 0.42));
    set(tongue, "opacity", bot > 11 ? "1" : "0");
    cheeks.forEach((c) => set(c, "opacity", f1(0.38 + 0.35 * (p.cheek || 0))));
    set(badgeGlow, "opacity", f1(p.badge || 0));
    [p.handL, p.handR].forEach((h, i) => {
      set(hands[i], "transform", `translate(${f1(h[0])} ${f1(h[1])}) scale(${((h[2] ?? 1) * sc).toFixed(3)})`);
      set(hands[i], "opacity", f1(h[3] ?? 1));
    });
  }
  return { root, draw, propsLayer, handsLayer };
}
