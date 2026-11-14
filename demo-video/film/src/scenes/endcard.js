// The end card: the AI Peer mark and name, the line, and the sign-off. One thing arrives at a
// time. It sits over the Earth when that scene is on, and on its own night background when not.
import { el, ramp, ease, lerp } from "../lib.js";
import { markSvg } from "../mark.js";

const LINE = "More room for your best work.";
const SIGN = "Built for real this week";
// NASA asks to be named as the source of its imagery (assets/earth/SOURCE.md); the line is small
// and plain, so it reads as a source note, never as NASA backing the product.
const CREDIT = "Earth imagery: NASA Earth Observatory (Black Marble 2016; Blue Marble: Next Generation)";

export async function create(slot, film) {
  const overEarth = film.slots.some((s) => s.scene === "earth" && s.use === "scene");
  const mark = el("div.emark", { html: markSvg({ size: 132 }) });
  const name = el("div.ename", { text: "AI Peer" });
  const words = LINE.split(" ").map((w) => el("span", { text: w }));
  const line = el("div.eline", {}, words.flatMap((w, i) => (i ? [document.createTextNode(" "), w] : [w])));
  const sign = el("div.esign", { text: SIGN });
  const shade = el("div.eshade");
  const credit = overEarth ? el("div.ecredit", { text: CREDIT }) : null;
  const node = el(`div.scene.endcard${overEarth ? ".over" : ""}`, {}, shade, el("div.ebox", {}, el("div.elock", {}, mark, name), line, sign), ...(credit ? [credit] : []));
  const lead = 0.5;   // the shade starts before the card's own slot, so the Earth dims gently
  return {
    el: node,
    from: slot.start - lead,
    render(t) {
      const local = t - slot.start;
      shade.style.opacity = ease.inOut(ramp(local, -lead, 0.6));
      const a = ease.out(ramp(local, 0, 0.55));
      mark.style.opacity = a;
      mark.style.transform = `scale(${lerp(0.7, 1, ease.outBack(ramp(local, 0, 0.6)))})`;
      mark.style.filter = `drop-shadow(0 0 ${Math.round(lerp(0, 46, a) + 10 * Math.sin(local * 1.6))}px rgba(183,244,207,${(0.5 * a).toFixed(3)}))`;
      const n = ease.out(ramp(local, 0.25, 0.75));
      name.style.opacity = n;
      name.style.transform = `translateX(${lerp(-18, 0, n)}px)`;
      words.forEach((w, i) => {
        const k = ease.out(ramp(local, 0.7 + i * 0.09, 1.15 + i * 0.09));
        w.style.opacity = k;
        w.style.transform = `translateY(${lerp(22, 0, k)}px)`;
      });
      const s = ease.out(ramp(local, 1.9, 2.4));
      sign.style.opacity = s;
      sign.style.letterSpacing = `${lerp(0.22, 0.12, s)}em`;
      if (credit) credit.style.opacity = ease.out(ramp(local, 2.0, 2.5));
      // the whole card breathes in very slowly, so the last seconds are not a still
      node.querySelector(".ebox").style.transform = `scale(${lerp(1, 1.022, ramp(local, 0, slot.length))})`;
    },
  };
}
