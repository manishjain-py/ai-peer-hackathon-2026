// The "AI Peer" tag on the double's chest: the film's own label that the double is an AI.
// A small pill (the mark and the words, mint glow) that sits on the chest light and moves
// with it. Where the chest is comes from WP3's track of the clip (one entry per clip frame),
// or, until a track exists, from a few keys set by hand in shots.json. When the tag is on
// screen is an edit decision, also in shots.json ("show").
import { el, show, ramp, ease, lerp, clamp, envelope, px } from "../lib.js";
import { markSvg } from "../mark.js";
import { cameraAt } from "../camera.js";

const REACH = 3;        // clip frames each side that a tracked position is averaged over
const SHARE = 0.7;      // the pill's width as a share of the shoulders' width
const WIDTH = [124, 190]; // and its limits in pixels, so it always reads

/**
 * The chest from WP3's track at a time of the slot, averaged over a few frames. `seen` is the
 * share of those frames where the track says the chest is in view; with `any` the place is
 * taken from every frame (the track goes on following the upper body when he is side-on).
 */
function fromTrack(track, local, any) {
  const f = (track.from + local * (track.rate || 1)) * track.fps;
  let x = 0, y = 0, w = 0, n = 0, on = 0, all = 0;
  for (let i = Math.floor(f) - REACH; i <= Math.ceil(f) + REACH; i++) {
    const weight = 1 - Math.abs(i - f) / (REACH + 1);
    if (weight <= 0) continue;
    all += weight;
    const e = track.frames[clamp(i, 0, track.frames.length - 1)];
    if (!e) continue;
    if (e[3]) on += weight;
    if (!e[3] && !any) continue;
    x += e[0] * weight; y += e[1] * weight; w += e[2] * weight; n += weight;
  }
  return n ? { x: x / n, y: y / n, w: w / n, seen: any ? 1 : on / all } : null;
}

/** The chest from hand-set keys [{t, x, y, w}]: a smooth curve through them, held outside. */
function fromKeys(keys, local) {
  if (local <= keys[0].t) return { ...keys[0], seen: 1 };
  const last = keys[keys.length - 1];
  if (local >= last.t) return { ...last, seen: 1 };
  let i = 0;
  while (keys[i + 1].t <= local) i++;
  const a = keys[i], b = keys[i + 1], before = keys[i - 1] || a, after = keys[i + 2] || b;
  const h = b.t - a.t;
  const k = (local - a.t) / h;
  const out = { seen: 1 };
  for (const key of ["x", "y", "w"]) {
    const ma = before === a ? (b[key] - a[key]) / h : (b[key] - before[key]) / (b.t - before.t);
    const mb = after === b ? (b[key] - a[key]) / h : (after[key] - a[key]) / (after.t - a.t);
    out[key] = (2 * k ** 3 - 3 * k ** 2 + 1) * a[key] + (k ** 3 - 2 * k ** 2 + k) * h * ma +
      (-2 * k ** 3 + 3 * k ** 2) * b[key] + (k ** 3 - k ** 2) * h * mb;
  }
  return out;
}

export async function create(film) {
  const layer = el("div.layer.pass", { id: "tag" });
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.font = "800 100px Manrope";
  ctx.letterSpacing = "1px";
  // the pill's width in ems: mark, gaps, padding and border as film.css sets them, plus the words
  const TEXT = (film.names && film.names.peer) || "AI Peer";   // "Ram's AI Peer" (shots.json names)
  const ems = 0.36 + 1.2 + 0.36 + ctx.measureText(TEXT).width / 100 + 0.62 + 0.15;

  // the Peer's one face (V20: Ram's portrait with the mark as a badge), else the mark
  const loads = [];
  const face = () => {
    const src = film.names && film.names.peer_face;
    if (!src) return el("span", { html: markSvg({ size: 100 }) });
    const img = new Image();
    img.src = src;
    loads.push(img.decode());
    return img;
  };
  const tags = film.slots.filter((s) => s.use === "clip" && (s.tagTrack || s.tagKeys)).map((slot) => {
    const pill = el("div.tagpill", {}, el("span.tmk", {}, face()), el("span", { text: TEXT }));
    layer.append(pill);
    const windows = slot.tagShow || [{ from: 0, to: slot.length, in: 0.3, out: 0.25 }];
    return { slot, pill, windows };
  });

  await Promise.all(loads);
  return {
    el: layer,
    render(t) {
      for (const { slot, pill, windows } of tags) {
        const local = t - slot.start;
        const inSlot = local >= 0 && local < slot.length;
        let seen = 0, born = 0, win = null;
        if (inSlot) {
          for (const w of windows) {
            const e = envelope(local, w.from, w.to, w.in ?? 0.4, w.out ?? 0.3, ease.out, ease.inOut);
            if (e > seen) { seen = e; win = w; born = w.in ? ramp(local, w.from, w.from + w.in) : 1; }
          }
        }
        // "force": show the tag in this window though the track calls the chest out of view
        const at = win ? (slot.tagTrack ? fromTrack(slot.tagTrack, local, !!win.force) : fromKeys(slot.tagKeys, local)) : null;
        if (at) seen *= ease.inOut(ramp(at.seen, 0.35, 0.9));
        else seen = 0;
        show(pill, seen > 0.003);
        if (seen <= 0.003) continue;
        // a shot that moves in carries the tag with it (src/camera.js)
        const cam = cameraAt(slot, film, t);
        const zoom = cam ? cam.s : 1;
        const cx = at.x * film.width, cy = at.y * film.height;
        const x = cam ? cam.F[0] + zoom * (cx - cam.F[0]) : cx, y = cam ? cam.F[1] + zoom * (cy - cam.F[1]) : cy;
        const size = clamp(SHARE * at.w * film.width * zoom, WIDTH[0], WIDTH[1]) / ems;
        pill.style.fontSize = px(size);
        pill.style.opacity = seen;
        // it lands with a small settle and a flare of its glow, then breathes very slightly
        const pop = lerp(0.84, 1, ease.outBack(born));
        const flare = 1 - ease.out(born);
        const glow = 0.5 + 0.5 * flare + 0.06 * Math.sin(t * 2.1);
        pill.style.boxShadow = `0 0 ${(1.3 + 1.6 * flare).toFixed(2)}em rgba(183,244,207,${glow.toFixed(3)}), 0 0.2em 0.7em rgba(0,0,0,0.4)`;
        pill.style.transform = `translate(${px(x)}, ${px(y)}) translate(-50%, -50%) scale(${pop.toFixed(4)})`;
      }
    },
  };
}
