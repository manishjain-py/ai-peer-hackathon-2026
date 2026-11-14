// Captions for every spoken line. One line on screen at a time; each word lights up as it is
// said. The Peer's own lines carry its mark and a mint edge; colleagues' lines are plain.
// Call after the fonts have loaded: the line breaks are measured.
import { el, ramp, ease, lerp, show } from "../lib.js";
import { markSvg } from "../mark.js";

const LEAD = 0.14;   // a caption arrives this long before its first word
const HOLD = 0.34;   // and stays this long after its last
const GAP = 0.06;    // two captions never touch
const SIZE = 46;
const MAX = 1380;    // widest line of text, inside the title-safe area

/** Break the words into one or two lines of even width, preferring a break after punctuation. */
function breakLines(words, measure) {
  const widths = words.map((w) => measure(w + " "));
  const total = widths.reduce((a, b) => a + b, 0);
  if (total <= MAX) return [words.length];
  let best = null;
  let left = 0;
  for (let i = 1; i < words.length; i++) {
    left += widths[i - 1];
    const longest = Math.max(left, total - left);
    if (longest > MAX) continue;
    const score = longest * (/[,.;:?!]$/.test(words[i - 1]) ? 0.76 : 1);
    if (!best || score < best.score) best = { i, score };
  }
  if (best) return [best.i, words.length - best.i];
  // Longer than two lines: fill line by line.
  const rows = [];
  let n = 0;
  let w = 0;
  widths.forEach((x) => {
    if (w + x > MAX && n) { rows.push(n); n = 0; w = 0; }
    n++; w += x;
  });
  rows.push(n);
  return rows;
}

export function createCaptions(film) {
  const layer = el("div.layer.pass", { id: "captions" });
  const ctx = document.createElement("canvas").getContext("2d");
  ctx.font = `650 ${SIZE}px Manrope`;
  ctx.letterSpacing = `${-0.012 * SIZE}px`;
  const measure = (text) => ctx.measureText(text).width;
  const blocks = [...(film.labels || []), ...(film.chapters || [])];

  // A line said inside a product screen (caption "screen") is captioned by that screen, as the app would.
  const said = film.lines.filter((l) => l.caption !== "screen");
  const lines = said.map((line, i) => {
    const next = said[i + 1];
    const from = line.start - LEAD;
    let to = line.start + line.seconds + HOLD;
    if (next) to = Math.min(to, next.start - LEAD - GAP);
    // A label or a title card owns the screen while it is up: the caption gives way.
    let begin = from;
    for (const b of blocks) {
      const end = b.start + b.length;
      if (end <= line.start + 0.3 && end + GAP > begin) begin = end + GAP;
      if (b.start >= line.start + line.seconds - 0.3 && b.start - GAP < to) to = b.start - GAP;
    }
    const spans = line.words.map((w) => el("span", { text: w.w + " " }));
    const rows = [];
    let k = 0;
    for (const n of breakLines(line.words.map((w) => w.w), measure)) {
      rows.push(el("div.ln", {}, spans.slice(k, k + n)));
      k += n;
    }
    const peer = line.speaker === "peer" || line.speaker === "product";
    const box = el("div.box", {},
      peer ? el("div.who", { html: markSvg({ size: 42 }) }) : null,
      el("div.words", {}, rows));
    const node = el(`div.cap${peer ? ".peer" : ""}`, {}, box);
    layer.append(node);
    return { line, from: begin, to, node, spans };
  });

  return {
    el: layer,
    render(t) {
      for (const c of lines) {
        const on = t >= c.from && t < c.to;
        show(c.node, on);
        if (!on) continue;
        const a = Math.min(ease.out(ramp(t, c.from, c.from + 0.2)), 1 - ease.in(ramp(t, c.to - 0.18, c.to)));
        c.node.style.opacity = a;
        c.node.style.transform = `translateY(${lerp(10, 0, a)}px)`;
        const local = t - c.line.start;
        c.line.words.forEach((w, i) => {
          c.spans[i].style.opacity = lerp(0.4, 1, ramp(local, w.s - 0.07, w.s + 0.07));
        });
      }
    },
  };
}
