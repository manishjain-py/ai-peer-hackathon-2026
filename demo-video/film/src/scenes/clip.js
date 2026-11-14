// An AI shot: the clip fills the frame. The build wrote its <video> tag; the renderer puts
// the right frame in it. A draft-grade clip carries a small note, so nobody takes a cheap test
// take for the final shot.
import { el, ramp, ease } from "../lib.js";
import { cameraAt, cameraTransform } from "../camera.js";

export async function create(slot, film) {
  const host = document.getElementById("host-" + slot.video.id);
  if (!host) throw new Error(`no video ${slot.video.id} on the page`);
  const node = el("div.scene.clipshot", {}, host);
  if (slot.grade === "draft") node.append(el("div.draftnote", { text: "Draft shot" }));
  const fade = slot.dissolve_in || 0;   // this shot dissolves in over the tail of the one before
  if (slot.camera) node.style.transformOrigin = "0 0";   // it moves in toward the push-in (src/camera.js)
  return {
    el: node,
    to: slot.start + slot.length + (slot.tail || 0),
    render(t) {
      if (fade) node.style.opacity = ease.inOut(ramp(t, slot.start, slot.start + fade));
      const cam = cameraAt(slot, film, t);
      if (cam) node.style.transform = cameraTransform(cam);
    },
  };
}
