// The mascot over the film's plates (WP7, the blended videos). The version's mascot is drawn by
// its own code (Little Peer: demo-video/ui-concepts/little-peer/peer.js; the tag:
// demo-video/ui-concepts/tag/mascot.js, both copied in by the cut) and moved by the keys in a
// slot's "mascot" field, in slot seconds and in pixels of the clip's 1920x1080 frame. It lies
// inside the clip's own node, so a camera move of the shot carries it too. A pure function of
// the film time: no state between frames, no timer, no clock.
//
// slot.mascot = {
//   s: base scale (1 = the mascot's natural size),
//   anchor: [[u, [x, y, scale]], ...]  a point of the plate that moves (a slow push in the clip):
//           every position below is measured on the frame of the first key and follows it,
//   start: [x, y, g]  where it stands at the slot's start (g: how far above its ground it floats),
//   moves: [{ t0, t1, to: [x, y, g], h, kind: "hop" | "zip" | "glide" }]  (motion-core's makeBody),
//   pop:  { at, dur, from: [x, y] }   it grows out of a point (the phone), with a burst,
//   dive: { at, dur, to: [x, y] }     it shrinks into a point (the phone, the screen), with a flash,
//   enter: u   it is not there before u (for one that hops in from outside the frame),
//   look: [[u, [lx, ly]], ...], happy: [[u, v]], badge: [[u, v]], wave: [[a, b], ...],
//   blinks: [u, ...], trail: [[t0, t1], ...], glow: aura 0..1, light: light spill 0..1,
//   flip: [[u, -1 | 1]] which way it faces (the tag walks; Little Peer only leans)
// }
import { clamp, lerp, prog, ease } from "./shared/kit.js";
import { makeBody, blinkAt, trail, burst } from "./little-peer/motion-core.js";

const NS = "http://www.w3.org/2000/svg";
const S = (tag, attrs, parent) => {
  const e = document.createElementNS(NS, tag);
  for (const k in attrs) e.setAttribute(k, attrs[k]);
  if (parent) parent.appendChild(e);
  return e;
};

/** Piecewise keys [[u, value]] with an easing; a value is a number or an array. */
export function keyed(list, u, e = ease.inOutSine) {
  if (!list || !list.length) return null;
  if (u <= list[0][0]) return list[0][1];
  for (let i = 1; i < list.length; i++) {
    const [t1, v1] = list[i], [t0, v0] = list[i - 1];
    if (u <= t1) {
      const k = e(prog(u, t0, t1));
      return Array.isArray(v0) ? v0.map((v, j) => lerp(v, v1[j], k)) : lerp(v0, v1, k);
    }
  }
  return list[list.length - 1][1];
}

/** A star-shaped sparkle path of radius 1, drawn scaled. */
const STAR = "M 0 -1 C 0.12 -0.12 0.12 -0.12 1 0 C 0.12 0.12 0.12 0.12 0 1 C -0.12 0.12 -0.12 0.12 -1 0 C -0.12 -0.12 -0.12 -0.12 0 -1 Z";

// The two mascots, behind one small face: build(svg) -> draw(pose). A pose here is generic; each
// adapter turns it into its mascot's own fields.
async function loadMascot(name) {
  if (name === "tag") {
    const m = await import("./tag/mascot.js");
    return {
      height: 200,   // about how tall it stands at s = 1 (for the light and the bursts)
      build(svg) {
        m.defs(svg);
        const t = m.buildTag(svg, { label: "Ram's AI Peer" });
        return (p) => t.draw({
          x: p.x, y: p.y, s: p.s, alpha: p.alpha, sx: p.sx, sy: p.sy,
          // it has no arms: its wave is a happy rock about its feet
          rot: p.rot + 7 * (p.wave || 0) * Math.sin(p.u * 2 * Math.PI * 1.7),
          walk: p.stride && p.base ? p.dist / (m.STRIDE * p.base) : p.walk, stride: p.stride ?? 0, legs: p.legs ?? 1, lift: 0, look: p.look, blink: p.blink, eyes: p.eyes ?? 1,
          happy: p.happy, glow: p.badge, shadow: p.shadowOpacity,
        });
      },
    };
  }
  const m = await import("./little-peer/peer.js");
  return {
    height: 160,
    build(svg) {
      m.defs(svg);
      const peer = m.buildPeer(svg);
      return (p) => {
        const sc = p.s;
        // hands at rest beside the body; the right one waves when asked
        const rest = (side) => [p.x + side * 86 * sc * p.sx, p.y - 34 * sc, 1, 1];
        const handL = rest(-1);
        let handR = rest(1);
        if (p.wave > 0) {
          const up = [p.x + 98 * sc, p.y - 132 * sc + Math.sin(p.u * 2 * Math.PI * 2.6) * 7 * sc, 1, 1];
          up[0] += Math.sin(p.u * 2 * Math.PI * 2.6) * 16 * sc;
          handR = handR.map((v, i) => lerp(v, up[i], ease.inOutSine(p.wave)));
        }
        const h = p.happy || 0;
        peer.draw({
          x: p.x, y: p.y, s: sc, alpha: p.alpha, rot: p.rot, sx: p.sx, sy: p.sy,
          sway: p.sway, look: p.look, blink: p.blink, pupil: 1, happy: h, brow: [h * 3, 0],
          mouth: [lerp(9, 13, h), lerp(2, 2, h), lerp(5, 13, h)], cheek: h, badge: p.badge,
          handL, handR, aura: p.aura,
          shadow: [p.x, p.ground, 1 - 0.35 * clamp(p.air / 120), p.shadowOpacity],
        });
      };
    },
  };
}

export async function createMascot(slot, film) {
  const M = slot.mascot;
  const kind = (film.names && film.names.mascot) || "little-peer";
  const mascot = await loadMascot(kind);

  const layer = document.createElement("div");
  Object.assign(layer.style, { position: "absolute", left: "0", top: "0", width: "1920px", height: "1080px", pointerEvents: "none", overflow: "hidden" });
  // the light it gives off, on the plate around it (a light being in a dark room)
  const spill = document.createElement("div");
  Object.assign(spill.style, { position: "absolute", left: "0", top: "0", width: "1000px", height: "1000px", borderRadius: "50%",
    background: "radial-gradient(closest-side, rgba(200,255,225,0.55), rgba(183,244,207,0.22) 45%, rgba(183,244,207,0) 100%)",
    mixBlendMode: "screen", transformOrigin: "0 0", opacity: "0" });
  layer.append(spill);
  const svg = S("svg", { width: 1920, height: 1080, viewBox: "0 0 1920 1080", style: "position:absolute;left:0;top:0;overflow:visible" });
  layer.append(svg);
  // WP7 v2, the transition ideas (all opt-in; a slot without these keys draws as before). Behind the
  // mascot: the screen it wakes ("wake") and the ribbon of light it rides ("ribbon"). The mascot in
  // its own group, which a screen can clip ("clip": a polygon of plate pixels). In front of it: the
  // glowing message it folds into ("msg"), which may unfold onto a screen.
  const underG = S("g", {}, svg);
  const wakeDark = S("polygon", { fill: "#050c0d", opacity: 0 }, underG);
  const wakeGlow = S("polygon", { fill: "#dffcef", opacity: 0, style: "mix-blend-mode:screen", filter: "blur(12px)" }, underG);
  const ribbonGlow = S("path", { fill: "none", stroke: "#8ff0c4", "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0, style: "mix-blend-mode:screen", filter: "blur(9px)" }, underG);
  const ribbonCore = S("path", { fill: "none", stroke: "#f2fff8", "stroke-linecap": "round", "stroke-linejoin": "round", opacity: 0 }, underG);
  const bodyG = S("g", {}, svg);
  let clipPoly = null;
  if (M.clip) {
    const cp = S("clipPath", { id: `mclip-${slot.id}` }, svg);
    clipPoly = S("polygon", {}, cp);
    bodyG.setAttribute("clip-path", `url(#mclip-${slot.id})`);
  }
  const sparkG = S("g", {}, svg);
  const sparks = Array.from({ length: 90 }, () => S("path", { d: STAR, opacity: 0 }, sparkG));
  const flash = S("circle", { r: 1, fill: "#e9fff2", opacity: 0, style: "mix-blend-mode:screen" }, svg);
  const draw = mascot.build(bodyG);
  // sparkles in front of the body
  svg.appendChild(sparkG);
  svg.appendChild(flash);
  const cardG = S("g", { opacity: 0, style: "filter: drop-shadow(0 0 16px rgba(170,255,215,0.9))" }, svg);
  const cardBody = S("polygon", { fill: "#effff7", stroke: "#a9efcd", "stroke-width": 2, "stroke-linejoin": "round" }, cardG);
  const cardFold = S("polyline", { fill: "none", stroke: "#6fcfa4", "stroke-width": 3, "stroke-linejoin": "round", "stroke-linecap": "round" }, cardG);
  const pts = (P) => P.map((p) => `${p[0].toFixed(1)},${p[1].toFixed(1)}`).join(" ");

  const body = makeBody(M.start, (M.moves || []).map((m) => ({ ...m })));
  const base = M.s ?? 1;
  const a0 = M.anchor ? M.anchor[0][1] : null;
  // a point measured on the anchor's first frame, where it is at slot time u
  const place = (u, x, y) => {
    if (!a0) return [x, y, 1];
    const a = keyed(M.anchor, u, (k) => k);
    const r = a[2] / a0[2];
    return [a[0] + (x - a0[0]) * r, a[1] + (y - a0[1]) * r, r];
  };

  // the tag's feet step on a glide unless the move says "step": false (it surfs or glides like a card)
  const stepping = (u) => {
    const mv = (M.moves || []).find((m) => u >= m.t0 && u <= m.t1);
    return mv && mv.kind === "glide" && mv.step !== false ? 1 : 0;
  };

  function render(t) {
    const u = t - slot.start;
    const out = [];   // sparkles this frame
    let alpha = 1, grow = 1, x, y, ground, sx = 1, sy = 1, rot = 0, air = 0;
    const b = body(u);
    ({ x, y, sx, sy, rot } = b);
    ground = b.ground != null ? b.ground : y;
    air = Math.max(0, ground - y);

    // it grows out of a point: rises from it, a little stretch, a settle with overshoot
    if (M.pop) {
      const { at, dur = 0.45, from } = M.pop;
      if (u < at) alpha = 0;
      else if (u < at + dur) {
        const k = prog(u, at, at + dur);
        grow = ease.outBack ? ease.outBack(k) : 1 - Math.pow(1 - k, 3);
        x = lerp(from[0], x, ease.outCubic(k));
        y = lerp(from[1], y, ease.outCubic(k));
        sy *= 1 + 0.25 * Math.sin(Math.PI * k);
        sx *= 1 - 0.15 * Math.sin(Math.PI * k);
      }
      burst(out, u, at + 0.05, [from[0], from[1] - 10], { n: 18, speed: 210, size: 13, seed: 41 });
    }
    if (M.enter != null && u < M.enter) alpha = 0;
    // it shrinks into a point, with a flash there
    let flashA = 0, flashAt = null;
    if (M.dive) {
      const { at, dur = 0.4, to } = M.dive;
      if (u >= at) {
        const k = prog(u, at, at + dur);
        const e = ease.inCubic ? ease.inCubic(k) : k * k * k;
        x = lerp(x, to[0], ease.inOutSine(k));
        y = lerp(y, to[1], ease.inOutSine(k));
        grow *= 1 - 0.95 * e;
        sy *= 1 + 0.35 * Math.sin(Math.PI * k);
        sx *= 1 - 0.2 * Math.sin(Math.PI * k);
        if (k >= 1) alpha = 0;
        flashAt = to;
        flashA = Math.sin(Math.PI * prog(u, at + dur * 0.6, at + dur + 0.45));
        burst(out, u, at + dur * 0.85, to, { n: 16, speed: 160, size: 11, seed: 77 });
      }
    }
    if (M.fade) alpha *= keyed(M.fade, u) ?? 1;
    // it folds into a glowing message (a card with an envelope's fold), which may unfold onto a screen
    let cardA = 0, cardPts = null, foldA = 0;
    if (M.msg && u >= M.msg.at) {
      const { at, dur = 0.35, w = 150, h = 96, unfold, quad } = M.msg;
      const k = prog(u, at, at + dur);
      alpha *= 1 - ease.inOutSine(k);
      sx *= 1 + 0.4 * k; sy *= 1 - 0.6 * k;
      cardA = ease.outCubic(k);
      const g = (0.35 + 0.65 * ease.outCubic(k)) * base;
      const cx = x, cy = y - 60 * base;
      cardPts = [[cx - (w * g) / 2, cy - (h * g) / 2], [cx + (w * g) / 2, cy - (h * g) / 2], [cx + (w * g) / 2, cy + (h * g) / 2], [cx - (w * g) / 2, cy + (h * g) / 2]];
      foldA = 1;
      if (unfold && quad) {
        const q = ease.inOutSine(prog(u, unfold[0], unfold[1]));
        cardPts = cardPts.map((p, i) => [lerp(p[0], quad[i][0], q), lerp(p[1], quad[i][1], q)]);
        foldA = 1 - q;
        cardA *= 1 - prog(u, unfold[1], unfold[1] + 0.4);
      }
    }
    for (const [t0, t1] of M.trail || []) {
      trail(out, u, t0, t1, (tb) => { const q = body(tb); return [q.x, q.y - 50 * base]; }, { rate: 40, life: 0.6, size: 9 * Math.max(0.6, base), spread: 26 * base, seed: 5 });
    }

    const [px, py, r] = place(u, x, y);
    const [, gy] = place(u, x, ground);
    const s = base * r * grow;
    const look = keyed(M.look, u) || [0, 0];
    const happy = keyed(M.happy, u) || 0;
    const badge = keyed(M.badge, u) || 0;
    let wave = 0;
    for (const [a, w1] of M.wave || []) wave = Math.max(wave, Math.min(prog(u, a, a + 0.25), 1 - prog(u, w1 - 0.25, w1)));
    const blink = blinkAt(u, M.blinks || []);
    const sway = Math.sin(u * 2 * Math.PI * 0.6) * 4 + rot * 0.6;

    draw({
      u, x: px, y: py, s, alpha, rot, sx, sy, sway, look, blink, happy, badge, wave,
      aura: (M.glow ?? 0.55) * alpha, ground: gy, air: air * r, shadowOpacity: (M.shadow ?? 0.45) * alpha * (grow > 0.3 ? 1 : 0),
      // the tag's feet step only on a glide; legs and eyes are keyed (0: a plain flat tag), else 1
      walk: u * 2.2, stride: stepping(u), dist: Math.abs(x - (M.start ? M.start[0] : x)), base, legs: keyed(M.legs, u) ?? 1, eyes: keyed(M.eyes, u) ?? 1,
    });

    // WP7 v2: the screen it wakes, the ribbon it rides, the screen that clips it, its message
    if (M.wake) {
      const { at, dur = 0.5, quad, dark = true } = M.wake;
      const k = prog(u, at, at + dur);
      const P = pts(quad.map((p) => place(u, p[0], p[1])));
      wakeDark.setAttribute("points", P); wakeGlow.setAttribute("points", P);
      wakeDark.setAttribute("opacity", dark ? (0.94 * (1 - ease.inOutSine(k))).toFixed(3) : "0");
      wakeGlow.setAttribute("opacity", (0.8 * Math.sin(Math.PI * prog(u, at, at + dur * 1.8))).toFixed(3));
    }
    if (M.ribbon) {
      const { t0, t1, lead = 0.3, fade = 0.7, lift = 0 } = M.ribbon;
      const end = Math.min(t1, u + lead);
      const a = u < t0 - lead ? 0 : 1 - prog(u, t1, t1 + fade);
      if (a > 0.001 && end > t0) {
        const P = [];
        for (let tb = t0; tb < end; tb += 1 / 60) {
          const q = body(tb);
          P.push(place(u, q.x, q.y - mascot.height * lift * base));
        }
        const q = body(end);
        P.push(place(u, q.x, q.y - mascot.height * lift * base));
        const d = "M" + P.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L");
        ribbonGlow.setAttribute("d", d); ribbonCore.setAttribute("d", d);
        ribbonGlow.setAttribute("stroke-width", (30 * Math.max(0.5, base)).toFixed(1));
        ribbonCore.setAttribute("stroke-width", (8 * Math.max(0.5, base)).toFixed(1));
        ribbonGlow.setAttribute("opacity", (0.85 * a).toFixed(3));
        ribbonCore.setAttribute("opacity", (0.95 * a).toFixed(3));
      } else { ribbonGlow.setAttribute("opacity", "0"); ribbonCore.setAttribute("opacity", "0"); }
    }
    if (clipPoly) clipPoly.setAttribute("points", pts(M.clip.map((p) => place(u, p[0], p[1]))));
    if (cardPts && cardA > 0.001) {
      const P = cardPts.map((p) => place(u, p[0], p[1]));
      cardBody.setAttribute("points", pts(P));
      const mid = [(P[0][0] + P[1][0] + P[2][0] + P[3][0]) / 4, 0.45 * (P[0][1] + P[1][1]) / 2 + 0.55 * (P[2][1] + P[3][1]) / 2];
      cardFold.setAttribute("points", pts([P[0], mid, P[1]]));
      cardFold.setAttribute("opacity", foldA.toFixed(3));
      cardG.setAttribute("opacity", cardA.toFixed(3));
    } else cardG.setAttribute("opacity", "0");

    // the light it gives off
    const L = (M.light ?? 0.5) * alpha * Math.min(1, grow + 0.2);
    const R = 260 * s + 120;
    spill.style.opacity = L.toFixed(3);
    spill.style.transform = `translate(${(px - R).toFixed(1)}px, ${(py - mascot.height * 0.45 * s - R).toFixed(1)}px) scale(${((2 * R) / 1000).toFixed(4)})`;

    // the flash where it dives in
    if (flashAt && flashA > 0.001) {
      const [fx, fy, fr] = place(u, flashAt[0], flashAt[1]);
      flash.setAttribute("cx", fx.toFixed(1)); flash.setAttribute("cy", fy.toFixed(1));
      flash.setAttribute("r", (70 * fr * (0.6 + flashA)).toFixed(1));
      flash.setAttribute("opacity", (0.85 * flashA).toFixed(3));
      flash.setAttribute("filter", "blur(1px)");
    } else flash.setAttribute("opacity", "0");

    // the sparkles, placed through the anchor too
    sparks.forEach((e, i) => {
      const q = out[i];
      if (!q) { if (e.getAttribute("opacity") !== "0") e.setAttribute("opacity", "0"); return; }
      const [qx, qy, qr] = place(u, q.x, q.y);
      e.setAttribute("transform", `translate(${qx.toFixed(1)} ${qy.toFixed(1)}) rotate(${q.r.toFixed(1)}) scale(${(q.s * qr * Math.max(0.5, base)).toFixed(2)})`);
      e.setAttribute("fill", q.c);
      e.setAttribute("opacity", q.a.toFixed(3));
    });
  }
  return { el: layer, render };
}
