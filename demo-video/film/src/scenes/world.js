// The big world of information (DESIGN V20), drawn by code with the made-up data of world.json.
// A placeholder until it is built: a builder world(S, film, slot) returns { node, render(local, t) }
// (and full: true to draw over the whole frame). Every frame is a pure function of the film time.
import { el } from "../lib.js";

export function world(S, film, slot) {
  const node = el("div.zoom", {}, el("div", { text: "The big world of information (being built)" }));
  return { node, render() {} };
}
