// The push-in: the camera leaves the night room through the laptop's screen and lands in the
// product. It is made from one still (the last frame of the shot before it) and the four
// corners of the laptop's screen in that frame. The room rushes past with the blur of a real
// camera move, the screen's light blooms, and the screen turns to face us: it becomes the
// product's window, dark, where the next scene picks it up. In a build without recordings the
// screen opens onto the slate that follows instead.
import { el, show, ramp, ease, lerp, px } from "../lib.js";
import { markSvg } from "../mark.js";
import { createSlate } from "./slate.js";

const COPIES = 9;         // exposures inside one frame's shutter: the blur of the move
const SHUTTER = 1 / 50;   // seconds the shutter is open
// The beats, in seconds of the slot. The push runs almost the whole slot at an even glide; the
// screen turns to face us late, the room gives way under the bloom, and the light settles last,
// so the landing is never a held, empty frame.
const MOVE = [0.05, 1.7];
const TURN = [0.95, 1.72];
const ROOM_OUT = [1.05, 1.5];
const SETTLE = [1.5, 1.93];

const centre = (q) => [q.reduce((a, p) => a + p[0], 0) / q.length, q.reduce((a, p) => a + p[1], 0) / q.length];
/** Area of a polygon given as points in order. */
function area(q) {
  let a = 0;
  q.forEach((p, i) => {
    const n = q[(i + 1) % q.length];
    a += p[0] * n[1] - n[0] * p[1];
  });
  return Math.abs(a) / 2;
}

/**
 * The CSS matrix that lays a w x h box (origin at its top left) onto four points, given
 * clockwise from the top left: a view in perspective of a flat screen.
 */
function onto(q, w, h) {
  const [[x0, y0], [x1, y1], [x2, y2], [x3, y3]] = q;
  const dx1 = x1 - x2, dx2 = x3 - x2, sx = x0 - x1 + x2 - x3;
  const dy1 = y1 - y2, dy2 = y3 - y2, sy = y0 - y1 + y2 - y3;
  const den = dx1 * dy2 - dx2 * dy1;
  const g = (sx * dy2 - dx2 * sy) / den;
  const k = (dx1 * sy - sx * dy1) / den;
  const a = x1 - x0 + g * x1, b = x3 - x0 + k * x3;
  const d = y1 - y0 + g * y1, e = y3 - y0 + k * y3;
  const n = (v) => +v.toFixed(8);
  return `matrix3d(${n(a / w)},${n(d / w)},0,${n(g / w)},${n(b / h)},${n(e / h)},0,${n(k / h)},0,0,1,0,${n(x0)},${n(y0)},0,1)`;
}

export async function create(slot, film) {
  const P = slot.pushin;
  const W = film.width, H = film.height;
  const next = film.slots[film.slots.findIndex((s) => s.id === slot.id) + 1];
  const product = P.lands === "product";
  const win = P.window;
  const q0 = P.quad.map(([x, y]) => [x * W, y * H]);
  const target = [[win.x, win.y], [win.x + win.w, win.y], [win.x + win.w, win.y + win.h], [win.x, win.y + win.h]];
  const c0 = centre(q0), cT = centre(target);
  // The zoom that brings the screen to the size of where it lands, and the one point of the
  // picture that a straight push toward it leaves in place.
  const S = Math.sqrt((win.w * win.h) / area(q0));
  const LNS = Math.log(S);
  const F = [c0[0] + (cT[0] - c0[0]) / (1 - S), c0[1] + (cT[1] - c0[1]) / (1 - S)];
  const move = (u) => 0.5 - 0.5 * Math.cos(Math.PI * ramp(u, MOVE[0], MOVE[1]));

  // 1. where it lands: the product's night stage, or the slate that follows
  let stage;
  if (product) {
    const a = el("div.pglow.a"), b = el("div.pglow.b");
    a.style.transform = "translate(-60px, 0px)";   // as product.js draws them at its first frame
    b.style.transform = "translate(40px, 20px)";
    stage = el("div.scene.product", {}, a, b);
  } else {
    const slate = createSlate(next, film, next.slateNote);
    slate.render(next.start);
    stage = slate.el;
  }

  // 2. the room: the still, drawn several times across the shutter
  const load = async (src) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    return img;
  };
  const room = el("div.proom");
  const copies = [];
  for (let i = 0; i < COPIES; i++) {
    const img = await load(P.sharp || P.still);
    img.style.opacity = String(1 / (i + 1));   // stacked, each exposure weighs the same
    room.append(img);
    copies.push(img);
  }
  // A sharper still from WP3 may differ a little from the clip's own last frame: start on the
  // clip's frame and let it give way as the camera begins to move.
  const first = P.sharp ? await load(P.still) : null;
  if (first) room.append(first);

  // 3. the light of the screen, spilling
  const bloom = el("div.pbloom");

  // 4. the screen itself
  // On the product's window the Peer's mark waits where its call tile will show it.
  const light = el("div.plight");
  const mark = product ? el("div.pmark", { html: markSvg({ size: 190 }) }) : null;
  const ember = product ? el("div.pember") : null;   // mint in the glass while the light goes down, so it never reads grey
  const screen = el(`div.pscreen${product ? ".pwin" : ""}`, {}, product ? el("div.pdim") : null, ember, light, mark);
  Object.assign(screen.style, { left: "0", top: "0", width: px(win.w), height: px(win.h) });
  const [r0, g0, b0] = P.tint;

  const note = P.draft ? el("div.draftnote", { text: "Draft shot" }) : null;
  const node = el("div.scene.pushin", {}, stage, room, bloom, screen, note);

  function render(t) {
    const u = t - slot.start;
    const k = move(u);
    const speed = ((move(u + 0.004) - move(u - 0.004)) / 0.008) * LNS;   // e-folds of zoom a second
    const s = Math.exp(k * LNS);

    // the room rushes past, then gives way to where we land
    const seen = 1 - ease.inOut(ramp(u, ROOM_OUT[0], ROOM_OUT[1]));
    show(room, seen > 0.002);
    room.style.opacity = seen;
    const at = (scale) => `translate(${px(F[0] * (1 - scale))}, ${px(F[1] * (1 - scale))}) scale(${scale.toFixed(5)})`;
    copies.forEach((img, i) => {
      img.style.transform = at(s * Math.exp(speed * SHUTTER * (i / (COPIES - 1) - 0.5)));
    });
    // a little softness joins the exposures into one streak
    const soft = Math.min(7, (speed * SHUTTER * 520) / COPIES);
    room.style.filter = soft > 0.25 ? `blur(${soft.toFixed(2)}px)` : "none";
    if (first) {
      first.style.transform = at(s);
      first.style.opacity = 1 - ease.inOut(ramp(u, 0, 0.32));
    }

    // the screen: it rides the push, then turns to face us and fills its window
    const turn = ease.inOut(ramp(u, TURN[0], TURN[1]));
    const q = q0.map((p, i) => [
      lerp(F[0] + s * (p[0] - F[0]), target[i][0], turn),
      lerp(F[1] + s * (p[1] - F[1]), target[i][1], turn),
    ]);
    screen.style.transform = onto(q, win.w, win.h);
    const warm = ease.out(ramp(u, 0.2, 1.1));   // from the clip's own screen colour to the Peer's mint-white
    light.style.background = `radial-gradient(120% 120% at 50% 45%, rgb(${Math.round(lerp(r0, 244, warm))},${Math.round(lerp(g0, 255, warm))},${Math.round(lerp(b0, 249, warm))}) 0%, ` +
      `rgb(${Math.round(lerp(r0, 214, warm))},${Math.round(lerp(g0, 248, warm))},${Math.round(lerp(b0, 229, warm))}) 100%)`;
    if (product) {
      // the light settles as the window lands: the dark glass stays, the mark glows a moment
      const lit = 1 - ease.inOut(ramp(u, SETTLE[0], SETTLE[1]));
      light.style.opacity = lit;
      ember.style.opacity = 0.55 * Math.sin(Math.PI * ramp(u, SETTLE[0], SETTLE[1] + 0.05));
      const m = ease.out(ramp(u, TURN[0] + 0.1, TURN[0] + 0.5)) * (1 - ease.in(ramp(u, 1.84, 2)));
      mark.style.opacity = m;
      mark.style.filter = `drop-shadow(0 0 ${Math.round(40 * (1 - lit))}px rgba(183,244,207,${(0.5 * (1 - lit)).toFixed(3)}))`;
    } else {
      // with no recording the screen opens onto the slate: it thins as it grows, never a white frame
      screen.style.opacity = 1 - ease.inOut(ramp(u, TURN[0] + 0.15, TURN[1]));
    }

    // the bloom follows the screen and swells with it, then clears as we land
    const c = centre(q);
    const size = Math.min(2000, Math.sqrt(area(q)) * 3.4);
    bloom.style.transform = `translate(${px(c[0] - size / 2)}, ${px(c[1] - size / 2)}) scale(${(size / 1000).toFixed(5)})`;
    bloom.style.opacity = 0.9 * ease.out(ramp(u, 0.1, 1.05)) * (1 - ease.inOut(ramp(u, 1.3, 1.82)));

    if (note) note.style.opacity = 1 - ramp(u, 0, 0.3);
  }
  return { el: node, render };
}
