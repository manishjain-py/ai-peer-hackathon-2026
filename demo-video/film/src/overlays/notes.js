// Small things on screen that tell the story, all by code (Draft 2, DESIGN V17). In the hook: a
// message card from the Peer beside each colleague who speaks (a slot's "card" in shots.json) and
// the sleeper's name with his night time (a slot's "sleeper_label"). In the proof: one quiet note
// on the product screens, which are the builder's own recordings and so name him, not the film's
// employee. The names come from "names" in shots.json.
import { el, show, ramp, ease, lerp } from "../lib.js";
import { markSvg } from "../mark.js";

export async function create(film) {
  const names = film.names || {};
  // the Peer's one face (V20: Ram's portrait with the mark as a badge), else the mark
  const loads = [];
  const face = () => {
    if (!names.peer_face) return el("span", { html: markSvg({ size: 100 }) });
    const img = new Image();
    img.src = names.peer_face;
    loads.push(img.decode());
    return img;
  };
  const layer = el("div.layer.pass", { id: "notes" });
  const items = [];
  for (const slot of film.slots) {
    if (slot.card && slot.use === "clip") {
      const card = el(`div.ncard.${slot.card.side || "left"}`, {},
        el("div.nhead", {}, el("span.nmark", {}, face()),
          el("span.nfrom", { text: names.peer || "AI Peer" }), el("span.nwhen", { text: "now" })),
        el("div.ntext", { text: slot.card.text }));
      layer.append(card);
      items.push({ node: card, from: slot.start + (slot.card.at ?? 0.9), to: slot.start + slot.length, rise: 28 });
    }
    if (slot.sleeper_label && slot.use === "clip") {
      const label = el("div.nsleep", {}, el("span.nname", { text: names.employee || "" }), el("span.ntime", { text: names.night_time || "" }));
      layer.append(label);
      items.push({ node: label, from: slot.start + 0.4, to: slot.start + slot.length, rise: 0 });
    }
    if (slot.use === "scene" && slot.scene === "screens") {
      const note = el("div.nreal", { text: (slot.screen && slot.screen.note) || "Made-up data" });
      layer.append(note);
      items.push({ node: note, from: slot.start + 0.6, to: slot.start + slot.length, rise: 0 });
    }
    if (slot.use === "scene" && slot.scene === "product") {
      const note = el("div.nreal", { text: "Real recordings: the builder's own AI Peer at work" });
      layer.append(note);
      items.push({ node: note, from: slot.start + 0.6, to: slot.start + slot.length, rise: 0 });
    }
  }
  await Promise.all(loads);
  return {
    el: layer,
    render(t) {
      for (const it of items) {
        const on = t >= it.from && t < it.to;
        show(it.node, on);
        if (!on) continue;
        const a = ease.out(ramp(t, it.from, it.from + 0.45));
        const gone = ease.inOut(ramp(t, it.to - 0.25, it.to));   // away by the cut
        it.node.style.opacity = (a * (1 - gone)).toFixed(3);
        if (it.rise) it.node.style.transform = `translateY(${lerp(it.rise, 0, a).toFixed(1)}px)`;
      }
    },
  };
}
