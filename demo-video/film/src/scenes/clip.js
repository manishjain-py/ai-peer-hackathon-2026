// An AI shot: the clip fills the frame. The build wrote its <video> tag; the renderer puts
// the right frame in it. A draft-grade clip carries a small note, so nobody takes a cheap test
// take for the final shot.
import { el } from "../lib.js";

export async function create(slot) {
  const host = document.getElementById("host-" + slot.video.id);
  if (!host) throw new Error(`no video ${slot.video.id} on the page`);
  const node = el("div.scene.clipshot", {}, host);
  if (slot.grade === "draft") node.append(el("div.draftnote", { text: "Draft shot" }));
  return { el: node, render() {} };
}
