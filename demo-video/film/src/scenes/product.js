// A product screen, polished by code: a rounded window on a soft night background, a camera
// that moves slowly to where the action is, a clear cursor, a mint outline on the thing that
// matters. The cut (which seconds, where the camera goes) comes from product.json through the
// build; the recordings themselves exist only in a private build.
import { el, show, ramp, ease, lerp, clamp, keyframes, envelope, px } from "../lib.js";
import { markSvg } from "../mark.js";

const CURSOR =
  '<svg width="44" height="44" viewBox="0 0 24 24"><path d="M5 3l14 8.2-6.3 1.5-3 6.1z" fill="#fff" stroke="#0d1c21" stroke-width="1.4" stroke-linejoin="round"/></svg>';

/** The sound level (0..1) at a local time, smoothed over a few frames. */
function levelAt(levels, local, fps) {
  let best = 0;
  for (const seg of levels || []) {
    const i = (local - seg.at) * fps;
    if (i < -3 || i > seg.values.length + 3) continue;
    let sum = 0;
    let n = 0;
    for (let k = -3; k <= 3; k++) {
      const v = seg.values[Math.round(i) + k];
      const w = 4 - Math.abs(k);
      sum += (v || 0) * w;
      n += w;
    }
    best = Math.max(best, sum / n);
  }
  return best;
}

function makeTile(pic, W) {
  const rings = [0, 1, 2].map(() => el("div.ring"));
  const mark = el("div.tmark", { html: markSvg({ size: 190 }) });
  const node = el("div.ptile", {},
    el("div.tglow"),
    el("div.tcentre", {}, rings, mark),
    el("div.tname", {}, el("span.tdot", { html: markSvg({ size: 40 }) }), el("span", { text: pic.name }), el("b", { text: "AI" })),
    el("div.tnote", { text: "Real sound from a live test meeting" }));
  node.style.width = px(W.w);
  node.style.height = px(W.h);
  return { node, rings, mark };
}

export async function create(slot, film) {
  const W = slot.window;
  const start = slot.start;
  const length = slot.length;
  const chapter = slot.chapter ? slot.chapter.length : 0;
  const landed = !!slot.landed;   // the push-in before this slot ends on this window, dark: no arrival
  const glowA = el("div.pglow.a");
  const glowB = el("div.pglow.b");
  const win = el("div.pwin");
  Object.assign(win.style, { left: px(W.x), top: px(W.y), width: px(W.w), height: px(W.h) });
  const dim = el("div.pdim");
  const node = el("div.scene.product", {}, glowA, glowB, win);

  const pics = [];
  for (const pic of slot.pictures) {
    const layer = el("div.ppic");
    const content = el("div.pcontent");
    const p = { pic, layer, content, cursor: null, ripple: null, highlights: [], tile: null };
    if (pic.type === "tile") {
      p.tile = makeTile(pic, W);
      content.append(p.tile.node);
      p.w = W.w; p.h = W.h;
    } else {
      p.w = pic.width; p.h = pic.height;
      if (pic.type === "video") {
        for (const v of pic.videos) {
          const host = document.getElementById("host-" + v.id);
          if (!host) throw new Error(`no video ${v.id} on the page`);
          Object.assign(host.style, { inset: "auto", left: "0", top: "0", width: px(pic.frameWidth || pic.width), height: px(pic.frameHeight || pic.height) });
          host.querySelector("video").style.objectFit = "fill";
          content.append(host);
        }
      } else {
        const img = new Image();
        img.src = pic.src;
        await img.decode();
        Object.assign(img.style, { position: "absolute", left: "0", top: "0", width: px(pic.width), height: px(pic.height) });
        content.append(img);
      }
      for (const h of pic.highlights || []) {
        const box = el("div.phl");
        Object.assign(box.style, { left: px(h.x), top: px(h.y), width: px(h.w), height: px(h.h) });
        content.append(box);
        p.highlights.push({ h, box });
      }
      if (pic.cursor && pic.cursor.length) {
        p.ripple = el("div.pripple");
        p.cursor = el("div.pcursor", { html: CURSOR });
        content.append(p.ripple, p.cursor);
      }
    }
    Object.assign(content.style, { width: px(p.w), height: px(p.h) });
    layer.append(content);
    win.append(layer);
    pics.push(p);
  }
  win.append(dim);

  function render(t) {
    const local = t - start;
    // the night behind the window drifts, so the frame is never still
    glowA.style.transform = `translate(${lerp(-60, 90, local / length)}px, ${lerp(0, 50, local / length)}px)`;
    glowB.style.transform = `translate(${lerp(40, -70, local / length)}px, ${lerp(20, -30, local / length)}px)`;
    // the window arrives, settles, and leaves
    const a = landed ? 1 : ease.out(ramp(local, 0, 0.5));
    const out = ease.in(ramp(local, length - 0.22, length));
    win.style.opacity = Math.min(a, 1 - out);
    win.style.transform = `translateY(${lerp(28, 0, a)}px) scale(${lerp(0.965, 1, a) + 0.012 * out})`;
    // under the chapter card the screen waits in the dark
    const under = chapter ? 0.62 * (1 - ease.inOut(ramp(local, chapter - 0.45, chapter))) : 0;
    dim.style.opacity = landed ? lerp(1, under, ease.out(ramp(local, 0, 0.45))) : under;

    for (const p of pics) {
      const { pic } = p;
      const on = local >= pic.at - 0.001 && local < pic.at + pic.length;
      show(p.layer, on);
      if (!on) continue;
      p.layer.style.opacity = pic.at > 0 ? ease.out(ramp(local, pic.at, pic.at + 0.3)) : 1;
      if (p.tile) {
        const L = levelAt(slot.levels, local, film.fps);
        const breathe = 0.5 + 0.5 * Math.sin(local * 1.7);
        p.tile.rings.forEach((r, i) => {
          const k = clamp(L * (1.25 - i * 0.22) + 0.05 * breathe);
          r.style.transform = `scale(${1 + (0.34 + i * 0.3) * k + i * 0.16})`;
          r.style.opacity = (0.16 + 0.5 * k) * (1 - i * 0.26);
        });
        p.tile.mark.style.transform = `scale(${1 + 0.045 * L})`;
        p.tile.mark.style.filter = `drop-shadow(0 0 ${Math.round(26 + 60 * L)}px rgba(183,244,207,${(0.35 + 0.45 * L).toFixed(3)}))`;
        continue;
      }
      // the camera: the visible part of the source, given as x, y and width
      const cam = keyframes(pic.camera || [{ t: 0, x: 0, y: 0, w: p.w }], local);
      const w = clamp(cam.w, 120, p.w);
      const s = W.w / w;
      const x = clamp(cam.x, 0, p.w - w);
      const y = clamp(cam.y, 0, Math.max(0, p.h - W.h / s));
      p.content.style.transform = `translate(${-x * s}px, ${-y * s}px) scale(${s})`;
      for (const { h, box } of p.highlights) {
        const e = envelope(local, h.from, h.to, 0.35, 0.3);
        box.style.opacity = e;
        box.style.borderWidth = px(3.5 / s);
        box.style.borderRadius = px(12 / s);
        box.style.boxShadow = `0 0 ${px(26 / s)} rgba(183,244,207,${(0.55 * e).toFixed(3)}), inset 0 0 ${px(18 / s)} rgba(183,244,207,${(0.22 * e).toFixed(3)})`;
        box.style.transform = `scale(${lerp(1.06, 1, ease.out(ramp(local, h.from, h.from + 0.4)))})`;
      }
      if (p.cursor) {
        const c = pic.cursor;
        const pos = keyframes(c, local);
        const seen = envelope(local, c[0].t - 0.25, c[c.length - 1].t + 0.9, 0.25, 0.3);
        let press = 0;
        let ring = 0;
        let rx = 0;
        let ry = 0;
        for (const k of c) {
          if (!k.click) continue;
          const d = local - k.t;
          if (d >= 0 && d < 0.7) { ring = d / 0.7; rx = k.x; ry = k.y; }
          if (d >= -0.04 && d < 0.16) press = 1;
        }
        p.cursor.style.opacity = seen;
        p.cursor.style.transform = `translate(${pos.x}px, ${pos.y}px) scale(${(press ? 0.86 : 1) / s})`;
        p.ripple.style.opacity = ring ? 0.85 * (1 - ring) : 0;
        p.ripple.style.transform = `translate(${rx}px, ${ry}px) scale(${(0.3 + 1.5 * ease.out(ring)) / s})`;
      }
    }
  }
  return { el: node, render };
}
