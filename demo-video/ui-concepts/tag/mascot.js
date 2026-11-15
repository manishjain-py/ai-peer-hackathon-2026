// The tag: a dark green name tag ("Ram's AI Peer" and a light "AI" pill) with two googly eyes
// standing on its top edge, four short rubber-hose legs with shoes (a near and a far leg at each
// end), and a soft shadow. Self-contained (no imports), plain SVG, every id prefixed "tg".
//
//   defs(svg)                                      gradients, clip paths, filters into <defs>
//   buildTag(svg, { label })                       -> { root, draw(pose) }
//
// draw(pose) sets every moving attribute on every frame: the same pose gives the same picture.
// The origin is the point between its feet on the ground; at s = 1 the tag is 260 px wide.
// Pose fields (all optional, defaults in brackets):
//   x, y [0, 0]      where the feet are, in px        s [1]        scale
//   alpha [1]        opacity                            rot [0]      degrees about the feet
//   sx, sy [1, 1]    squash and stretch about the feet  walk [0]     step phase, in steps
//   stride [1 if walk is given, else 0]   how big the steps are (0: standing, every foot down)
//   dir [1]          which way the shoes point (1 right, -1 left); the label always reads
//   legs [1]         0 tucked in (a plain flat tag) to 1    lift [0]  px the body rises (a hop)
//   look [0, 0]      pupils, each -1..1                 blink [0]    0 open to 1 shut
//   eyes [1]         0 hidden (a plain tag) to 1; above 1 they pop bigger
//   happy [0]        smiling eyes                       glow [0]     the AI pill's glow
//   shadow [1]       the shadow's strength              bob [1]      how much the walk bobs and rocks
//   idea [0]         an amber bulb on a stalk pops up over its head
//   zz [0, 0]        sleeping Zs: [alpha, phase in seconds]
//   wide [0]         eyes wide open (surprise), 0..1    squint [0]   eyes narrowed, 0..1
//   wink [0]         -1..1: above 0 shuts the right eye, below 0 the left (on top of blink)
//   card [260, 78]   the body's size in tag units: it grows into a big card (the back of the tag)
//   back [0]         0 its front (label and AI pill), 1 its back (plain green)

const NS = "http://www.w3.org/2000/svg";
function S(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
}
const set = (e, k, v) => e.setAttribute(k, v);
const f2 = (v) => (Math.round(v * 100) / 100).toString();
const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));

// Geometry at s = 1.
export const W = 260;          // body width
export const H = 78;           // body height (a stadium: fully round ends)
export const LEG = 50;         // hips to ground with legs = 1
export const STRIDE = 48;      // px the tag moves per step at s = 1 (feet do not slide)
const R = H / 2;
const EYE = { dx: 25, rx: 15.5, ry: 14.5, up: 5 };   // eye centres sit `up` px above the top edge
const PUP = 6.4;
const SWING = 30 * Math.PI / 180;                       // leg swing amplitude
const LIFT = 15;                                        // foot lift at mid-swing
const FOOT = { back: 5, front: 15, w: 12.5 };
// The four legs: hip x, near (drawn lighter, in front) or far, and the phase of its swing.
const LEGS = [
  { x: -64, near: false, ph: Math.PI },
  { x: 88, near: false, ph: 0 },
  { x: -88, near: true, ph: 0 },
  { x: 64, near: true, ph: Math.PI },
];

export const colors = {
  body: "#1f5b43", bodyTop: "#246a4f", bodyLow: "#1a4f3a", edge: "#123b2a",
  hi: "#3f8467", lo: "#123d2b", legNear: "#25634a", legFar: "#163f2f",
  pill: "#f6f3ea", pillText: "#1f5b43", label: "#ffffff",
  eye: "#fbfdf8", eyeLine: "#14231b", pupil: "#17221c", amber: "#efa53c",
};

export function defs(svg) {
  let d = svg.querySelector("defs");
  if (!d) d = S("defs", {}, svg);
  if (d.querySelector("#tgBody")) return d;
  const frag = document.createElementNS(NS, "g");
  frag.innerHTML = `
  <linearGradient id="tgBody" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="${colors.bodyTop}"/><stop offset="0.55" stop-color="${colors.body}"/><stop offset="1" stop-color="${colors.bodyLow}"/></linearGradient>
  <radialGradient id="tgShadow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#3b3626" stop-opacity="0.42"/><stop offset="0.55" stop-color="#3b3626" stop-opacity="0.2"/>
    <stop offset="1" stop-color="#3b3626" stop-opacity="0"/></radialGradient>
  <radialGradient id="tgGlow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#fff6cf" stop-opacity="0.95"/><stop offset="0.45" stop-color="#ffe7a3" stop-opacity="0.55"/>
    <stop offset="1" stop-color="#ffe7a3" stop-opacity="0"/></radialGradient>
  <radialGradient id="tgBulb" cx="0.38" cy="0.32" r="0.7">
    <stop offset="0" stop-color="#fff3d2"/><stop offset="0.45" stop-color="#f6b955"/><stop offset="1" stop-color="#d98a1f"/></radialGradient>
  <radialGradient id="tgBulbGlow" cx="0.5" cy="0.5" r="0.5">
    <stop offset="0" stop-color="#ffd27a" stop-opacity="0.75"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>
  <clipPath id="tgEyeL"><ellipse class="tg-eclip" cx="0" cy="0" rx="${EYE.rx}" ry="${EYE.ry}"/></clipPath>
  <clipPath id="tgEyeR"><ellipse class="tg-eclip" cx="0" cy="0" rx="${EYE.rx}" ry="${EYE.ry}"/></clipPath>`;
  while (frag.firstChild) d.appendChild(frag.firstChild);
  return d;
}

// A stadium (pill) path, bottom centre at (0, 0).
const pill = (w, h) => {
  const r = h / 2, x0 = -w / 2 + r, x1 = w / 2 - r;
  return `M ${x0} 0 L ${x1} 0 A ${r} ${r} 0 0 0 ${x1} ${-h} L ${x0} ${-h} A ${r} ${r} 0 0 0 ${x0} 0 Z`;
};

let count = 0;

export function buildTag(svg, { label = "Ram's AI Peer" } = {}) {
  defs(svg);
  const id = ++count;
  const root = S("g", { class: "tg-tag" }, svg);
  const shadow = S("ellipse", { cx: 0, cy: 0, rx: 150, ry: 12, fill: "url(#tgShadow)" }, root);
  const fig = S("g", {}, root);                      // rotates and squashes about the feet

  // Legs (behind the body): far legs first, then near.
  const legEls = LEGS.map((L) => {
    const g = S("g", {}, fig);
    const col = L.near ? colors.legNear : colors.legFar;
    const leg = S("path", { fill: "none", stroke: col, "stroke-width": 13, "stroke-linecap": "round" }, g);
    const foot = S("path", { fill: "none", stroke: col, "stroke-width": FOOT.w, "stroke-linecap": "round" }, g);
    const sole = S("path", { fill: "none", stroke: "#0e2c20", "stroke-opacity": 0.35, "stroke-width": 3, "stroke-linecap": "round" }, g);
    return { ...L, g, leg, foot, sole };
  });
  // Far legs are drawn before near legs.
  legEls.filter((l) => l.near).forEach((l) => fig.appendChild(l.g));

  const bodyG = S("g", {}, fig);                     // translated to the body's bottom centre
  const bodyP = S("path", { d: pill(W, H), fill: `url(#tgBody)`, stroke: colors.edge, "stroke-width": 1.6, "stroke-opacity": 0.7 }, bodyG);
  const hiP = S("path", { d: `M ${-W / 2 + 24} ${-H + 7} L ${W / 2 - 24} ${-H + 7}`, stroke: colors.hi, "stroke-width": 3, "stroke-linecap": "round", opacity: 0.6, fill: "none" }, bodyG);
  const loP = S("path", { d: `M ${-W / 2 + 26} -7.5 L ${W / 2 - 26} -7.5`, stroke: colors.lo, "stroke-width": 4.5, "stroke-linecap": "round", opacity: 0.5, fill: "none" }, bodyG);
  const front = S("g", {}, bodyG);                   // the label side
  const text = S("text", { x: -W / 2 + 26, y: -H / 2 + 7.4, fill: colors.label,
    style: "font: 800 20.5px 'Manrope', sans-serif; letter-spacing: -0.1px" }, front);
  text.textContent = label;
  const glow = S("ellipse", { cx: W / 2 - 46, cy: -H / 2, rx: 54, ry: 38, fill: "url(#tgGlow)", opacity: 0 }, front);
  const pillG = S("g", { transform: `translate(${W / 2 - 46} ${-H / 2})` }, front);
  const pillRing = S("rect", { x: -29, y: -19, width: 58, height: 38, rx: 19, fill: "none", stroke: "#fff4c8", "stroke-width": 3, opacity: 0 }, pillG);
  S("rect", { x: -25, y: -15.5, width: 50, height: 31, rx: 15.5, fill: colors.pill }, pillG);
  S("text", { x: 0, y: 6.4, "text-anchor": "middle", fill: colors.pillText, style: "font: 800 17.5px 'Manrope', sans-serif; letter-spacing: 0.4px" }, pillG).textContent = "AI";

  // The idea bulb (behind the eyes, on a stalk from the top edge).
  const ideaG = S("g", {}, fig);
  const stalk = S("path", { fill: "none", stroke: colors.body, "stroke-width": 4, "stroke-linecap": "round" }, ideaG);
  const bulbGlow = S("circle", { r: 26, fill: "url(#tgBulbGlow)" }, ideaG);
  const bulb = S("circle", { r: 10.5, fill: "url(#tgBulb)", stroke: "#c47a14", "stroke-width": 1.2 }, ideaG);

  // Eyes, standing on the top edge.
  const eyesG = S("g", {}, fig);
  const eyes = [-1, 1].map((sd) => {
    const g = S("g", {}, eyesG);                   // at the eye's bottom point
    const inner = S("g", {}, g);                     // scaled about that point for pop and blink
    const white = S("ellipse", { cx: 0, cy: 0, rx: EYE.rx, ry: EYE.ry, fill: colors.eye }, inner);
    const clip = S("g", { "clip-path": `url(#tgEye${sd < 0 ? "L" : "R"})` }, inner);
    const pupil = S("g", {}, clip);
    S("circle", { cx: 0, cy: 0, r: PUP, fill: colors.pupil }, pupil);
    S("circle", { cx: -2.1, cy: -2.3, r: 1.9, fill: "#ffffff" }, pupil);
    const cheek = S("ellipse", { cx: 0, cy: EYE.ry * 2, rx: EYE.rx * 1.5, ry: EYE.ry * 1.05, fill: colors.body }, clip);
    const ring = S("ellipse", { cx: 0, cy: 0, rx: EYE.rx, ry: EYE.ry, fill: "none", stroke: colors.eyeLine, "stroke-width": 2.4 }, inner);
    // A shut eye: a crisp dark line, drawn outside the squashed eye so it keeps its weight.
    const lash = S("path", { fill: "none", stroke: colors.eyeLine, "stroke-width": 3, "stroke-linecap": "round" }, g);
    return { sd, g, inner, white, pupil, cheek, ring, lash };
  });

  // Sleeping Zs.
  const zG = S("g", {}, root);
  const zs = [0, 1, 2].map(() => {
    const t = S("text", { "text-anchor": "middle", fill: colors.body, style: "font: 800 30px 'Manrope', sans-serif" }, zG);
    t.textContent = "z";
    return t;
  });

  // Fit the label to the room left of the AI pill.
  let fitted = false;
  const fit = () => {
    if (fitted) return;
    try {
      const len = text.getComputedTextLength();
      if (len > 0) {
        fitted = true;
        const room = W - 26 - 82;
        if (len > room) { set(text, "textLength", f2(room)); set(text, "lengthAdjust", "spacingAndGlyphs"); }
      }
    } catch { /* not laid out yet */ }
  };

  function draw(p = {}) {
    fit();
    const alpha = p.alpha ?? 1;
    root.style.display = alpha > 0.002 ? "" : "none";
    set(root, "opacity", f2(clamp(alpha)));
    const x = p.x ?? 0, y = p.y ?? 0, s = p.s ?? 1;
    const legs = clamp(p.legs ?? 1, 0, 1.2);
    const lift = p.lift ?? 0;
    const walk = p.walk ?? 0, stride = clamp(p.stride ?? (p.walk == null ? 0 : 1), 0, 1.4), bobK = p.bob ?? 1;
    const dir = (p.dir ?? 1) < 0 ? -1 : 1;
    const eyesK = Math.max(0, p.eyes ?? 1);
    const blink = clamp(p.blink ?? 0);
    const [lx, ly] = p.look || [0, 0];
    const happy = clamp(p.happy ?? 0), wide = clamp(p.wide ?? 0), squint = clamp(p.squint ?? 0);

    // The walk: a bob (high when the legs pass under the hips) and a small rock, per step.
    const ph = Math.PI * walk;
    const bob = -4.5 * stride * bobK * legs * Math.abs(Math.cos(ph));
    const rock = 2.4 * stride * bobK * legs * Math.sin(ph) * dir;
    const legLen = LEG * legs;
    const bottom = -legLen - lift + bob;             // body bottom, in tag units, above the feet

    // Shadow on the ground: tighter when the legs are in (a tag lying flat), fainter in the air.
    const air = Math.max(0, lift - bob * 0.2);
    const shK = 1 / (1 + air / 90);
    set(shadow, "cx", f2(x)); set(shadow, "cy", f2(y));
    set(shadow, "rx", f2(s * ((p.card ? p.card[0] : W) * 0.5 + 18 * legs) * shK));
    set(shadow, "ry", f2(s * (7 + 6 * legs) * shK));
    set(shadow, "opacity", f2(clamp((p.shadow ?? 1) * (0.55 + 0.45 * shK))));

    // The body's size: a stadium at rest, a rounded card as it grows.
    const [cw, ch] = p.card || [W, H];
    const big = cw !== W || ch !== H;
    if (big || bodyP._big) {
      const rr = Math.min(ch / 2, H / 2 - Math.min(13, Math.max(0, ch - H) * 0.05));
      const x0 = -cw / 2, x1 = cw / 2;
      set(bodyP, "d", `M ${f2(x0 + rr)} 0 L ${f2(x1 - rr)} 0 A ${f2(rr)} ${f2(rr)} 0 0 0 ${f2(x1)} ${f2(-rr)} L ${f2(x1)} ${f2(-ch + rr)} A ${f2(rr)} ${f2(rr)} 0 0 0 ${f2(x1 - rr)} ${f2(-ch)} L ${f2(x0 + rr)} ${f2(-ch)} A ${f2(rr)} ${f2(rr)} 0 0 0 ${f2(x0)} ${f2(-ch + rr)} L ${f2(x0)} ${f2(-rr)} A ${f2(rr)} ${f2(rr)} 0 0 0 ${f2(x0 + rr)} 0 Z`);
      set(hiP, "d", `M ${f2(x0 + 24)} ${f2(-ch + 7)} L ${f2(x1 - 24)} ${f2(-ch + 7)}`);
      set(loP, "d", `M ${f2(x0 + 26)} -7.5 L ${f2(x1 - 26)} -7.5`);
      bodyP._big = big;
    }
    const backK = clamp(p.back ?? 0);
    set(front, "opacity", f2(1 - backK));
    front.style.display = backK > 0.995 ? "none" : "";

    const rot = (p.rot ?? 0) + rock;
    set(fig, "transform", `translate(${f2(x)} ${f2(y)}) rotate(${f2(rot)}) scale(${f2((p.sx ?? 1) * s)} ${f2((p.sy ?? 1) * s)})`);
    set(bodyG, "transform", `translate(0 ${f2(bottom)})`);

    // Legs: a pendulum swing from each hip, the foot lifted through the forward swing; the knee
    // bends forward (a rubber-hose curve) when the foot is lifted.
    legEls.forEach((L) => {
      const on = legs > 0.02;
      L.g.style.display = on ? "" : "none";
      if (!on) return;
      const a = SWING * stride * Math.sin(ph + L.ph);
      const swingFwd = Math.cos(ph + L.ph) > 0 ? Math.cos(ph + L.ph) : 0;
      const lifted = LIFT * stride * legs * swingFwd;
      const hipX = Math.sign(L.x) * (Math.abs(L.x) + (cw - W) * 0.36), hipY = bottom - 8;
      const len = legLen + 8 - FOOT.w / 2;
      const ax = hipX + dir * len * Math.sin(a);
      const ay = Math.min(-FOOT.w / 2, hipY + len * Math.cos(a)) - lifted;
      const dx = ax - hipX, dy = ay - hipY;
      const d = Math.hypot(dx, dy) || 1;
      const bend = Math.sqrt(Math.max(0, len * len - d * d)) * 0.62;
      const kx = hipX + dx / 2 + dir * bend, ky = hipY + dy / 2;
      set(L.leg, "d", `M ${f2(hipX)} ${f2(hipY)} Q ${f2(kx)} ${f2(ky)} ${f2(ax)} ${f2(ay)}`);
      // The shoe: toe down as it lifts off, level on the ground.
      const toe = -dir * (0.45 * swingFwd * stride) + 0.12 * a * dir;
      const fb = FOOT.back * legs, ff = FOOT.front * legs;
      const c = Math.cos(toe), sn = Math.sin(toe);
      const bx = ax - dir * fb * c, by = ay - fb * sn * dir;
      const fx = ax + dir * ff * c, fy = ay + ff * sn * dir;
      set(L.foot, "d", `M ${f2(bx)} ${f2(by)} L ${f2(fx)} ${f2(fy)}`);
      set(L.foot, "stroke-width", f2(FOOT.w * Math.min(1, 0.4 + 0.6 * legs)));
      set(L.sole, "d", `M ${f2(bx)} ${f2(by + 5)} L ${f2(fx)} ${f2(fy + 5)}`);
      set(L.sole, "opacity", f2(0.8 * legs * (1 - swingFwd * stride)));
    });

    // The AI pill's glow.
    const glowK = clamp(p.glow ?? 0);
    set(glow, "opacity", f2(glowK));
    set(pillRing, "opacity", f2(glowK * 0.9));

    // The idea bulb.
    const idea = clamp(p.idea ?? 0, 0, 1.3);
    ideaG.style.display = idea > 0.01 ? "" : "none";
    if (idea > 0.01) {
      const bx = -cw / 2 + 62, by0 = bottom - ch + 2;
      const top = by0 - 44 * Math.min(1, idea);
      set(stalk, "d", `M ${bx} ${f2(by0)} Q ${bx + 3} ${f2((by0 + top) / 2)} ${bx} ${f2(top + 9)}`);
      set(bulb, "cx", f2(bx)); set(bulb, "cy", f2(top));
      set(bulb, "r", f2(10.5 * idea));
      set(bulbGlow, "cx", f2(bx)); set(bulbGlow, "cy", f2(top));
      set(bulbGlow, "opacity", f2(clamp(idea)));
    }

    // Eyes: they stand on the top edge, slide a little toward where they look (a head turn),
    // scale up from nothing as they pop, squash flat as they blink.
    const eyeShow = eyesK > 0.01;
    eyesG.style.display = eyeShow ? "" : "none";
    if (eyeShow) {
      const top = bottom - ch;
      set(eyesG, "transform", `translate(${f2(lx * 6)} ${f2(top + EYE.ry - EYE.up + ly * 1.5)})`);
      const shut = Math.max(blink, squint * 0.55);
      const ryK = Math.max(0.08, 1 - shut * 0.92) * (1 + 0.14 * wide);
      const wink = p.wink ?? 0;
      eyes.forEach((e) => {
        const ex = e.sd * EYE.dx;
        const shutE = Math.max(shut, e.sd > 0 ? clamp(wink) : clamp(-wink));
        const ryE = Math.max(0.08, 1 - shutE * 0.92) * (1 + 0.14 * wide);
        const closed = clamp((shutE - 0.55) / 0.3);
        const kx = eyesK * (1 + 0.08 * wide), ky = eyesK * ryE;
        set(e.g, "transform", `translate(${ex} 0)`);
        set(e.inner, "transform", `scale(${f2(kx)} ${f2(ky)}) translate(0 ${-EYE.ry})`);
        set(e.inner, "opacity", f2(1 - 0.85 * closed));
        const px = lx * (EYE.rx - PUP - 2.2), py = ly * (EYE.ry - PUP - 2) - happy * 3;
        set(e.pupil, "transform", `translate(${f2(px)} ${f2(py)}) scale(${f2(1 - 0.25 * wide)})`);
        set(e.cheek, "cy", f2(EYE.ry * 2 - happy * EYE.ry * 1.05));
        const hw = EYE.rx * kx * 0.92, ly0 = -EYE.ry * ky;
        set(e.lash, "d", `M ${f2(-hw)} ${f2(ly0 - 1)} Q 0 ${f2(ly0 + 5 * eyesK)} ${f2(hw)} ${f2(ly0 - 1)}`);
        set(e.lash, "opacity", f2(closed));
      });
    }

    // Sleeping Zs drift up and to the right from the top-right of the body.
    const [za, zph] = p.zz || [0, 0];
    zG.style.display = za > 0.01 ? "" : "none";
    if (za > 0.01) {
      const ox = x + s * (cw / 2 - 18), oy = y + s * (bottom - ch - 6);
      zs.forEach((z, i) => {
        const k = ((zph * 0.55 + i / 3) % 1 + 1) % 1;
        const a = Math.sin(Math.PI * k);
        const zx = ox + s * (8 + k * 34 + Math.sin(k * 6 + i) * 4), zy = oy - s * (k * 70);
        const sz = s * (0.55 + k * 0.7);
        set(z, "transform", `translate(${f2(zx)} ${f2(zy)}) scale(${f2(sz)})`);
        set(z, "opacity", f2(za * a));
      });
    }
  }

  return { root, draw, id };
}
