// An AI shot: the clip fills the frame. The build wrote its <video> tag; the renderer puts
// the right frame in it. A draft-grade clip carries a small note, so nobody takes a cheap test
// take for the final shot.
//
// WP7, the blended videos (this copy lies over src/scenes/clip.js in a cut's build only), adds two
// things a slot may ask for: "mascot" (the version's mascot drawn over the shot by code,
// src/mascot/engine.js) and "push" ({ to_scale, fx, fy }: a slow, even move in on a still plate,
// about the point fx, fy as fractions of the frame). The mascot lies inside the shot's node, so
// the shot's camera carries it. Everything else is the film's own clip scene, unchanged.
import { el, ramp, ease } from "../lib.js";
import { cameraAt, cameraTransform } from "../camera.js";
import { createMascot } from "../mascot/engine.js";

export async function create(slot, film) {
  const host = document.getElementById("host-" + slot.video.id);
  if (!host) throw new Error(`no video ${slot.video.id} on the page`);
  const node = el("div.scene.clipshot", {}, host);
  if (slot.grade === "draft") node.append(el("div.draftnote", { text: "Draft shot" }));
  const fade = slot.dissolve_in || 0;   // this shot dissolves in over the tail of the one before
  if (slot.camera || slot.push) node.style.transformOrigin = "0 0";   // it moves in (src/camera.js, or "push")
  const mascot = slot.mascot ? await createMascot(slot, film) : null;
  if (mascot) node.append(mascot.el);
  return {
    el: node,
    to: slot.start + slot.length + (slot.tail || 0),
    render(t) {
      if (fade) node.style.opacity = ease.inOut(ramp(t, slot.start, slot.start + fade));
      const cam = cameraAt(slot, film, t);
      if (cam) node.style.transform = cameraTransform(cam);
      else if (slot.push) {
        const u = Math.min(1, Math.max(0, (t - slot.start) / slot.length));
        const s = Math.exp(Math.log(slot.push.to_scale) * u);
        const F = [slot.push.fx * film.width, slot.push.fy * film.height];
        node.style.transform = cameraTransform({ F, s });
      }
      if (mascot) mascot.render(t);
    },
  };
}
