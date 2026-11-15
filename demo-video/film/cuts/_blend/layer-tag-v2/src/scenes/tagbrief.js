// WP7 v2 (Tag): the morning brief on Ram's laptop, in the tag's own look. A stand-in until the scene
// is written: the paper background and the greeting only.
import { el } from "../lib.js";

export async function create(slot) {
  const b = slot.brief || {};
  const words = el("div", { text: b.greeting || "Good morning" });
  Object.assign(words.style, { position: "absolute", left: "160px", top: "160px", font: "600 72px Manrope", color: "#1f5b43" });
  const node = el("div.scene", {}, words);
  node.style.background = "#f4f0e6";
  return { el: node, render() {} };
}
