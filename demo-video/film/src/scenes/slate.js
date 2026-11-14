// A labelled slate: what a missing shot will show, who makes it, how long it runs.
// It keeps moving (a drifting glow, a slow light sweep, a progress line) so no frame is frozen.
import { el, lerp, clock, ease, ramp } from "../lib.js";

const MAKERS = {
  ai: "<b>Shot to come.</b> Real-looking footage of invented people, made by AI.",
  product: "<b>Product screen.</b> A real recording, kept on this Mac only.",
  code: "<b>Made by code.</b>",
};

export function createSlate(slot, film, note) {
  const part = film.parts.find((p) => p.id === slot.part);
  const glow = el("div.glow");
  const sweep = el("div.sweep");
  const body = el("div.body", {}, el("div.id", { text: slot.id }), el("div.shows", { text: slot.shows }));
  const fill = el("i");
  const node = el(
    "div.scene.slate",
    {},
    glow,
    sweep,
    el("div.corner.tl"), el("div.corner.tr"), el("div.corner.bl"), el("div.corner.br"),
    el("div.top", {},
      el("div.pill", { text: slot.kind === "product" ? "Product screen" : slot.kind === "code" ? "Made by code" : "Shot to come" }),
      el("div.where", { text: `${part.title}  ·  ${clock(slot.start)} to ${clock(slot.start + slot.length)}` })),
    body,
    el("div.maker", { html: note || MAKERS[slot.kind] }),
    el("div.bar", {}, fill),
  );
  return {
    el: node,
    render(t) {
      const local = t - slot.start;
      const k = local / slot.length;
      glow.style.transform = `translate(${lerp(0, 260, k)}px, ${lerp(0, 120, k)}px)`;
      sweep.style.transform = `translateX(${lerp(-900, 2100, k)}px) rotate(14deg)`;
      const a = ease.out(ramp(local, 0, 0.35));
      body.style.transform = `translateY(${lerp(18, 0, a)}px) scale(${lerp(1, 1.018, k)})`;
      body.style.opacity = a;
      fill.style.transform = `scaleX(${k})`;
    },
  };
}
