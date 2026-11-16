// Tag: where the tag is and what it does at every moment (frame px), as pure functions of t.
// Walks keep the feet planted (the step phase follows the distance), hops have anticipation,
// a stretch on take-off and a squash that settles; the eyes look where it is going or at what
// it reads, a beat before the body moves.
import { rng } from "../shared/kit.js";
import { STRIDE, W as TW, H as TH, LEG } from "./mascot.js";
import { CARD, ROOM, PANEL, SPOT, BRIEF, ASKP, READ, SRC, S3, S4, MORPH, LEARNED, BRIEFT, ASK, RULES, RET, CLICK, BTN_C } from "./tl.js";
import { panK, rideX, RIDE, keyRowAt, cardRect } from "./room.js";
import { briefRise } from "./paper.js";
import { prog, clamp, lerp, ease, toScreen, wob } from "./u.js";

const lookDir = (from, to, reach = 160) => {
  const dx = to[0] - from[0], dy = to[1] - from[1];
  const len = Math.hypot(dx, dy) || 1;
  const m = Math.min(1, len / reach);
  return [(dx / len) * m, (dy / len) * m * 0.95];
};
const mixL = (a, b, k) => [lerp(a[0], b[0], k), lerp(a[1], b[1], k)];

export function buildMotion(ctx) {
  const { cam, scroll, room } = ctx;
  const S = (p, t, scrolled = true) => toScreen(cam(t), [p[0], p[1] - (scrolled ? scroll(t) : 0)]);
  const spot = (t) => { const [x, y] = S([SPOT.cx, SPOT.feet], t, false); return [x, y, 0.92 * cam(t)[2]]; };
  const briefTop = (t) => {
    const y = BRIEF.y + (1 - briefRise(t)) * 560;
    const [x, yy] = S([BRIEF.x + BRIEF.w - 235, y], t);
    return [x, yy, 1.08 * cam(t)[2]];
  };
  const inputTop = (t, dx = 0) => { const [x, y] = S([1450 + dx, ASKP.input.y], t); return [x, y, 1.1 * cam(t)[2]]; };
  const roomX0 = CARD.cx + ROOM.dx;
  const BY_BTN = [1090, 850, 1.4];
  const ANS_FLOOR = [1706, 1014, 1.2];
  const RS = [RULES.spot.x, RULES.spot.feet, RULES.spot.s];

  // ---------------------------------------------------------------- hops (frame px)
  // from / to: [x, y, s] or functions of t; h: the arc's height; ground: whether the shadow
  // travels with it (false when it hops between levels).
  const HOPS = [
    { a: 2.32, b: 2.78, from: () => [SPOT.cx, SPOT.feet, 0.92], to: () => [780, 960, 1.15], h: 120, amp: 0.2 },
    { a: 4.66, b: 5.22, from: () => BY_BTN, to: () => [roomX0, ROOM.feet, ROOM.s], h: 300, amp: 0.26, level: true },
    { a: S3.hop[0], b: S3.hop[1], from: () => [roomX0, ROOM.feet, ROOM.s], to: () => [RIDE.x0, PANEL.railY, 1.15], h: 170, amp: 0.2, level: true },
    { a: S4.hop[0], b: S4.hop[1], from: () => [RIDE.x1, PANEL.railY, 1.15], to: (t) => briefTop(t), h: 150, amp: 0.22, level: true },
    { a: ASK.hop[0], b: ASK.hop[1], from: (t) => briefTop(ASK.hop[0]), to: (t) => inputTop(t), h: 130, amp: 0.2, level: true },
    { a: ASK.jump[0], b: ASK.jump[1], from: (t) => inputTop(t, ASK.pace.reduce((s, p) => s + p[2], 0)), to: () => ANS_FLOOR, h: 110, amp: 0.24, level: true },
    { a: 50.12, b: 50.75, from: () => ANS_FLOOR, to: () => RS, h: 230, amp: 0.24 },
    { a: RET.hop[0], b: RET.hop[1], from: (t) => spot(t), to: (t) => briefTop(t), h: 330, amp: 0.24, level: true },
    { a: RET.hopHome[0], b: RET.hopHome[1], from: (t) => briefTop(t), to: (t) => spot(t), h: 260, amp: 0.2, level: true },
  ];
  const hopAt = (t) => HOPS.find((h) => t >= h.a && t <= h.b);

  function hopPose(t, H) {
    const k = prog(t, H.a, H.b);
    const A = H.from(t), B = H.to(t);
    const kx = lerp(k, ease.inOutSine(k), 0.5);
    const x = lerp(A[0], B[0], kx), s = lerp(A[2], B[2], k);
    const ground = lerp(A[1], B[1], k);
    const arc = H.h * 4 * k * (1 - k);
    // Between levels the arc rides above the straight line; the shadow fades in the air.
    const up = 1 - ease.outQuad(clamp(k / 0.32));
    const fall = prog(k, 0.7, 1);
    const dir = Math.sign(B[0] - A[0]) || 1;
    return {
      x, y: ground, s, lift: arc / s, sy: 1 + 0.2 * up + 0.08 * fall, sx: 1 - 0.12 * up - 0.05 * fall,
      rot: clamp((B[0] - A[0]) / 500, -1, 1) * 9 * Math.sin(Math.PI * k), legs: 1, stride: 0.55 * Math.sin(Math.PI * k), walk: 0.5 + k * 0.6,
      dir, shadow: H.level ? 1 - 0.85 * Math.sin(Math.PI * Math.min(1, k * 1.2)) : 1, air: true, look: [dir * 0.7, 0.35 * (B[1] > A[1] ? 1 : -1)],
    };
  }
  // Squash on landing, anticipation before take-off.
  function squash(t) {
    let sx = 0, sy = 0;
    for (const H of HOPS) {
      const d = t - H.b;
      if (d >= 0 && d < 0.8) { const q = H.amp * Math.exp(-d * 8.5) * Math.cos(d * 21); sy -= q; sx += q * 0.7; }
      const pre = prog(t, H.a - 0.17, H.a);
      if (t < H.a && pre > 0) { const a = ease.inOutSine(pre); sy -= 0.17 * a; sx += 0.11 * a; }
    }
    return [sx, sy];
  }

  // ---------------------------------------------------------------- blinks
  const BL = [];
  { const r = rng(17); for (let t = 1.9; t < 71; t += 2.4 + r() * 1.5) BL.push(t); }
  [4.42, 7.62, 11.12, 21.8, 24.32, 27.1, 33.0, 42.98, 48.5, 54.45, 56.55, 63.98, 65.62].forEach((x) => BL.push(x));
  const blinkAt = (t) => {
    let b = 0;
    for (const tb of BL) { const d = Math.abs(t - tb); if (d < 0.085) b = Math.max(b, 1 - d / 0.085); }
    return b;
  };

  // ---------------------------------------------------------------- the room walk in step 2
  // The tag walks to each card with the pan, a little ahead of it.
  const tagK = (t) => {
    let k = 0;
    SRC.forEach((id, i) => { if (i > 0) k += ease.inOutCubic(prog(t, READ[id].pan[0] + 0.02, READ[id].pan[1] - 0.03)); });
    return k;
  };
  const roomX = (t) => roomX0 + (tagK(t) - panK(t)) * CARD.gap;
  // The pans are quicker than any walk, so it scurries at a steady 7.5 steps a second.
  const roomWalk = (t) => {
    let w = 0;
    SRC.forEach((id, i) => { if (i > 0) { const [a, b] = READ[id].pan; w += 7.5 * clamp(t - a, 0, b - a); } });
    return w;
  };
  const roomStride = (t) => {
    let st = 0;
    SRC.forEach((id, i) => { if (i > 0) { const [a, b] = READ[id].pan; st = Math.max(st, Math.min(prog(t, a, a + 0.12), 1 - prog(t, b - 0.18, b - 0.02))); } });
    return st;
  };

  // The eye point (frame px) of a pose, for looks.
  const eyeOf = (p) => [p.x, p.y - p.s * (LEG * (p.legs ?? 1) + TH + 4)];

  function base(t) {
    const p = { x: 0, y: 0, s: 1, legs: 1, eyes: 1, look: [0, 0] };
    const H = hopAt(t);
    if (H) return Object.assign(p, hopPose(t, H));

    // ---- the landing: a plain label in the rail wakes, stands, hops out, walks to the button.
    if (t < 2.32) {
      const [x, y, s] = spot(t);
      const eyes = t < 0.75 ? 0 : ease.outBack(prog(t, 0.75, 1.15), 2.2);
      const legs = ease.outBack(prog(t, 2.0, 2.3), 1.8);
      return Object.assign(p, { x, y, s, legs, eyes, look: t < 1.4 ? [0.2, -0.4] : t < 1.75 ? [-0.5, -0.2] : [0.9, -0.3], wide: 0.5 * Math.sin(Math.PI * prog(t, 0.95, 1.5)) });
    }
    if (t < 3.86) {
      const k = ease.inOutSine(prog(t, 2.78, 3.86));
      const A = [780, 960, 1.15], B = BY_BTN;
      const x = lerp(A[0], B[0], k), y = lerp(A[1], B[1], k), s = lerp(A[2], B[2], k);
      const dist = Math.hypot(B[0] - A[0], B[1] - A[1]) * k;
      const st = Math.min(prog(t, 2.78, 2.9), 1 - prog(t, 3.66, 3.86));
      return Object.assign(p, { x, y, s, walk: dist / (STRIDE * 1.3), stride: st, look: t < 3.5 ? [0.8, -0.35] : [-0.9, -0.1] });
    }
    if (t < 4.66) {
      // By the button: looks at it, at the pointer coming in, at the click: surprise, joy.
      const [x, y, s] = BY_BTN;
      const ptr = ctx.pointerAt(t);
      const e = [x, y - s * (LEG + TH + 4)];
      let look = t < 4.0 ? [-1, 0.25] : lookDir(e, ptr, 200);
      const wide = Math.sin(Math.PI * prog(t, CLICK, CLICK + 0.35));
      return Object.assign(p, { x, y, s, look, wide, happy: prog(t, CLICK + 0.05, CLICK + 0.2) });
    }
    // ---- step 1 and 2: in the room
    if (t < S3.hop[0]) {
      const x = roomX(t), y = ROOM.feet, s = ROOM.s;
      const st = roomStride(t);
      const pose = Object.assign(p, { x, y, s, walk: roomWalk(t), stride: st, rot: 5 * st, bob: 1.3 });
      const e = eyeOf(pose);
      // What it looks at: the card it reads, the key line, the fly chips, the pointer.
      const i = Math.min(5, Math.round(panK(t)));
      const id = SRC[i], rd = READ[id];
      const kr = keyRowAt(room, i, t);
      const cr = cardRect(i, panK(t));
      let look = lookDir(e, [cr.x + cr.w / 2, cr.y + 300], 220);
      if (t >= rd.read[0] && t < rd.hl) {
        // Scanning the lines: quick saccades left and right.
        const ph = Math.floor((t - rd.read[0]) / 0.16);
        look = lookDir(e, [cr.x + 120 + (ph % 2) * 380, cr.y + 330 + (ph % 3) * 50], 220);
      }
      if (t >= rd.hl - 0.05) look = lookDir(e, [kr.x + kr.w * 0.6, kr.y], 220);
      if (t >= rd.chip[0] && t < rd.chip[1] + 0.1) look = mixL(look, [-1, -0.5], ease.inOutSine(prog(t, rd.chip[0], rd.chip[0] + 0.25)));
      // The next card: eyes lead the walk.
      const nx = SRC[i + 1] ? READ[SRC[i + 1]].pan : null;
      if (nx && t > nx[0] - 0.25 && t < nx[1]) look = mixL(look, [1, -0.15], ease.inOutSine(prog(t, nx[0] - 0.25, nx[0] + 0.05)));
      if (rd.connect) {
        const c = rd.connect;
        const sq = Math.min(ease.inOutSine(prog(t, c.show + 0.05, c.show + 0.3)), 1 - ease.outBack(prog(t, c.sheet[1] - 0.15, c.sheet[1] + 0.15)));
        pose.legs = 1 - 0.45 * clamp(sq);
        if (t >= c.show && t < c.sheet[0]) look = lookDir(e, ctx.pointerAt(t), 240);
        if (t >= c.sheet[0] && t < c.sheet[1]) { look = [0.4, -0.85]; pose.happy = 0.8; }
        pose.glow = Math.sin(Math.PI * clamp(prog(t, c.sheet[0], c.sheet[1] + 0.2)));
        pose.wide = Math.max(0, 1 - Math.abs(t - c.click) / 0.18) * 0.9;
      }
      if (t >= rd.done && t < rd.done + 0.5) pose.happy = Math.max(pose.happy || 0, Math.sin(Math.PI * prog(t, rd.done, rd.done + 0.5)));
      pose.look = look;
      return pose;
    }
    // ---- step 3: it rides the rail and writes each line as it passes.
    if (t < S4.hop[0]) {
      const x = t < S3.ride[0] ? RIDE.x0 : rideX(t);
      const ride = Math.min(prog(t, S3.ride[0] - 0.05, S3.ride[0] + 0.15), 1 - prog(t, S3.ride[1] - 0.1, S3.ride[1] + 0.1));
      const settle = wob(t, S3.ride[1], 5, 2.6, 6);
      return Object.assign(p, {
        x: x + settle, y: PANEL.railY, s: 1.15, legs: 1 - 0.55 * ride, walk: 7 * Math.max(0, t - S3.ride[0]), stride: 0.45 * ride,
        rot: 4 * ride - settle * 0.5, look: t < S3.ride[0] ? [0.2, -1] : [0.15, -1], happy: 0.3 * ride,
      });
    }
    // ---- step 4 and the page: standing on the brief card.
    if (t < ASK.hop[0]) {
      const [x, y, s] = briefTop(t);
      const pose = Object.assign(p, { x, y, s });
      const e = eyeOf(pose);
      let look = [-0.6, 0.85];
      if (t < MORPH[0]) {
        const i = S4.items.findIndex((a, j) => t >= a - 0.1 && (j === 3 || t < S4.items[j + 1] - 0.1));
        if (t < S4.items[0] - 0.1) look = lookDir(e, ctx.toS([BRIEF.x + 200, BRIEF.y + 70], t), 200);
        else if (i >= 0) look = lookDir(e, ctx.briefItemAt(i, t), 200);
      } else if (t < LEARNED.sweep[1]) {
        const k = prog(t, LEARNED.sweep[0], LEARNED.sweep[1]);
        look = lookDir(e, ctx.toS([400 + k * 1460, 205], t), 220);
      } else if (t < BRIEFT.items[0] - 0.2) {
        const th = LEARNED.threads.find(([a, b]) => t >= a - 0.1 && t < b);
        if (th) look = lookDir(e, ctx.factAt(th[2], t), 220);
      } else {
        const i = BRIEFT.items.findIndex((a, j) => t >= a - 0.15 && (j === 3 || t < BRIEFT.items[j + 1] - 0.15));
        if (i >= 0) look = lookDir(e, ctx.briefItemAt(i, t), 200);
        if (t > 38.6) look = [0.3, 0.6];
      }
      pose.look = look;
      if (t > 24.1 && t < 24.7) pose.happy = Math.sin(Math.PI * prog(t, 24.1, 24.7));
      // Now and then a small shift of weight: two quick steps on the spot.
      for (const f0 of [30.95, 34.95, 38.1]) {
        const k = prog(t, f0, f0 + 0.42);
        if (k > 0 && k < 1) { pose.walk = 2 * k; pose.stride = 0.5 * Math.sin(Math.PI * k); }
      }
      return pose;
    }
    // ---- ask: on the input, then on the floor by the answer.
    if (t < ASK.jump[0]) {
      let dx = 0, walk = 0, stride = 0, dir = 1;
      let acc = 0;
      for (const [a, b, d] of ASK.pace) {
        const k = ease.inOutSine(prog(t, a, b));
        if (t >= a) { dx += d * k; walk += (Math.abs(d) * k) / (STRIDE * 1.1); }
        if (t >= a && t <= b) { stride = Math.min(prog(t, a, a + 0.1), 1 - prog(t, b - 0.12, b)); dir = d < 0 ? -1 : 1; }
        if (t > b && d) dir = d < 0 ? -1 : 1;
        acc += d;
      }
      if (t > ASK.pace[2][0]) dir = 1;
      const [x, y, s] = inputTop(t, dx);
      const pose = Object.assign(p, { x, y, s, walk, stride, dir });
      const e = eyeOf(pose);
      let look = lookDir(e, ctx.pointerAt(t), 240);
      if (t >= ASK.type - 0.1 && t < ASK.ptrBtn[0]) look = lookDir(e, ctx.caretAt(t), 260);
      if (t >= ASK.think[0]) {
        const i = ASK.chips.findIndex((a, j) => t >= a - 0.1 && (j === 3 || t < ASK.chips[j + 1] - 0.1));
        look = i >= 0 ? lookDir(e, ctx.thinkChipAt(i, t), 260) : [0, 1];
        if (stride > 0.2) look = [dir * 0.85, 0.4];
      }
      pose.wide = Math.max(0, 1 - Math.abs(t - ASK.askClick) / 0.2) * 0.8;
      pose.look = look;
      return pose;
    }
    if (t < 50.12) {
      const [x, y, s] = ANS_FLOOR;
      const pose = Object.assign(p, { x, y, s });
      const e = eyeOf(pose);
      pose.idea = Math.min(ease.outBack(prog(t, ASK.jump[1] + 0.05, ASK.jump[1] + 0.4), 2), 1 - ease.inCubic(prog(t, 48.8, 49.1)));
      pose.look = t < ASK.conf[0] ? lookDir(e, ctx.answerFront(t), 260) : t < 49.3 ? lookDir(e, ctx.stampAt(), 260) : [0, 0.2];
      // The stamp lands: a little jump.
      const hit = prog(t, ASK.stamp, ASK.stamp + 0.3);
      pose.lift = 22 * Math.sin(Math.PI * hit);
      pose.wide = Math.sin(Math.PI * prog(t, ASK.stamp - 0.05, ASK.stamp + 0.4));
      pose.happy = ease.inOutSine(prog(t, 48.75, 49.1)) * (1 - prog(t, 49.85, 50.1));
      return pose;
    }
    // ---- Moss introduces the same rules card, then returns to the centre.
    if (t < RET.cut[0] + 0.22) {
      const [x, y, s] = RS;
      const side = ease.inOutCubic(prog(t, 50.9, 51.7)) * (1 - ease.inOutCubic(prog(t, 55.0, 55.75)));
      return Object.assign(p, { x: x + 635 * side, y: y - 80 * side - 120 * ease.inOutCubic(prog(t, 55.0, 55.75)), s: s * (1 - .12 * side),
        action: 'present', actionTime: Math.min(4.8, Math.max(0, (t - 50.75) * .85)),
        alpha: 1 - prog(t, RET.cut[0], RET.cut[0] + .2) });
    }
    // ---- the return: asleep in the rail as a label, wakes, hops to the brief, back home.
    if (t < RET.hop[0]) {
      const [x, y, s] = spot(t);
      const pose = Object.assign(p, { x, y, s, legs: ease.outBack(prog(t, RET.stand[0], RET.stand[1]), 1.8) });
      const awake = prog(t, RET.wink, RET.wink + 0.12);
      pose.eyes = lerp(0.62, 1, ease.outBack(prog(t, RET.both, RET.both + 0.3), 2.2));
      pose.blink = 1 - awake;
      pose.wink = t < RET.both ? 1 : 1 - prog(t, RET.both, RET.both + 0.1);
      pose.zz = [1 - prog(t, RET.wink - 0.3, RET.wink), t];
      pose.sy = 1 + 0.025 * Math.sin(t * 2 * Math.PI * 0.4) * (1 - awake);
      pose.look = t < RET.both ? [0.5, 0.3] : t < 59.75 ? [1, -0.2] : t < 60.2 ? [-0.3, -0.6] : [0.9, -0.6];
      pose.wide = Math.sin(Math.PI * prog(t, RET.both, RET.both + 0.45)) * 0.8;
      pose.alpha = prog(t, RET.cut[0] + 0.22, RET.cut[0] + 0.45);
      return pose;
    }
    if (t < RET.hopHome[0]) {
      const [x, y, s] = briefTop(t);
      const pose = Object.assign(p, { x, y, s });
      const e = eyeOf(pose);
      let look = lookDir(e, ctx.pointerAt(t), 240);
      if (t > RET.sweep - 0.1 && t < RET.restack[0]) look = lookDir(e, ctx.toS([400 + prog(t, RET.sweep, RET.sweep + 1.2) * 1460, 205], t), 220);
      else if (t >= RET.restack[0] && t < RET.ptrForget[0]) look = [-0.6, 0.85];
      pose.look = look;
      pose.wide = Math.sin(Math.PI * prog(t, RET.forget - 0.05, RET.forget + 0.35));
      return pose;
    }
    {
      const [x, y, s] = spot(t);
      const sit = ease.inOutSine(prog(t, RET.sit[0], RET.sit[1]));
      const plain = ease.inBack(prog(t, RET.plain[0] + 0.2, RET.plain[1]), 1.4);
      return Object.assign(p, {
        x, y, s, legs: 1 - sit, eyes: 1 - clamp(plain), look: t < RET.plain[0] ? [0.6, -0.3] : [0, 0.1],
        happy: Math.sin(Math.PI * prog(t, RET.plain[0] - 0.2, RET.plain[0] + 0.3)),
      });
    }
  }

  function poseAt(t) {
    const p = base(t);
    // Purposeful character acting: greet once, scan sources, think during Ask, present the brief.
    if (!p.action) {
      if (t < 5.5) { p.action = 'wave'; p.actionTime = Math.max(0, t - 2.8); }
      else if (t < 22) { p.action = 'attentive'; p.actionTime = 1.0 + (3.8 - Math.abs(((t - 5.5) % 7.6) - 3.8)); }
      else if (t < 39.5) { p.action = 'present'; p.actionTime = 1.0 + (3.8 - Math.abs(((t - 22) % 7.6) - 3.8)); }
      else if (t < 45.8) { p.action = 'attentive'; p.actionTime = Math.min(4.8, .8 + (t - 39.5) * .7); }
      else if (t < 50.12) { p.action = 'present'; p.actionTime = Math.min(4.8, (t - 45.8) * 1.1); }
      else { p.action = 'wave'; p.actionTime = Math.min(4.8, Math.max(0, t - 55.5)); }
    }
    const [qx, qy] = squash(t);
    p.sx = (p.sx ?? 1) + qx;
    p.sy = (p.sy ?? 1) + qy;
    // Breathing while it stands.
    if (!p.air && !(p.stride > 0.05)) { const br = Math.sin(t * 2 * Math.PI * 0.7); p.sy += 0.012 * br; p.sx -= 0.008 * br; }
    p.blink = Math.max(p.blink ?? 0, blinkAt(t));
    return p;
  }

  // The body's box (frame px) of a pose, ignoring rotation: for the lines that start at the tag.
  function boxOf(p) {
    const s = p.s ?? 1, bottom = p.y - s * (p.lift || 0);
    return { x0:p.x - 65*s, x1:p.x + 65*s, top:bottom - 150*s, bottom };
  }

  return { poseAt, boxOf };
}
