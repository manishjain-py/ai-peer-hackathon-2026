// The overview picture: the five concepts on one 1920 x 1080 still, in the worker's order of
// preference. tiles.js (made at delivery) lists each concept's key frame, name, line and change.
import { el, image } from "../shared/kit.js";
import tiles from "./tiles.js";

export default {
  async init(stage) {
    const ov = el("div", "ov", stage);
    el("div", "ov-h", ov, "AI Peer: five wow concepts for its own screens");
    el("div", "ov-s", ov, "Same functions as today · made-up data · each a 64 to 70 s walkthrough · numbered in order of preference");
    const grid = el("div", "ov-grid", ov);
    for (const [i, t] of tiles.entries()) {
      const tile = el("div", "ov-t" + (i === 3 ? " b1" : i === 4 ? " b2" : ""), grid);
      const box = el("div", "ov-img", tile);
      const img = await image(t.frame);
      box.appendChild(img);
      el("div", "ov-n", box, String(i + 1));
      el("div", "ov-name", tile, t.title);
      el("div", "ov-line", tile, t.line);
      el("div", "ov-chg", tile, t.change ? "Function change: " + t.change : "No function change");
    }
  },
  render() {},
};
