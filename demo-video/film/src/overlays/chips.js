// The night clock, the title card of each proof, and the labels that name what happens.
// One text at a time: the build refuses a label or a card that would share the screen with a
// spoken line, and labels sit where captions sit, so the eye stays in one place.
import { el, show, ramp, ease, lerp, envelope } from "../lib.js";

/** A clock face as SVG; the hands are turned by render(). */
function dial(size) {
  const ticks = Array.from({ length: 12 }, (_, i) => {
    const a = (i * Math.PI) / 6;
    const r1 = i % 3 === 0 ? 37 : 41;
    return `<line x1="${50 + r1 * Math.sin(a)}" y1="${50 - r1 * Math.cos(a)}" x2="${50 + 45 * Math.sin(a)}" y2="${50 - 45 * Math.cos(a)}" stroke="rgba(246,244,238,${i % 3 === 0 ? 0.75 : 0.32})" stroke-width="${i % 3 === 0 ? 2.4 : 1.6}" stroke-linecap="round"/>`;
  }).join("");
  const node = el("div.dial", {
    html:
      `<svg width="${size}" height="${size}" viewBox="0 0 100 100">` +
      `<circle cx="50" cy="50" r="48" fill="rgba(10,23,27,0.72)" stroke="rgba(183,244,207,0.55)" stroke-width="1.6"/>${ticks}` +
      `<line class="m" x1="50" y1="50" x2="50" y2="16" stroke="#f6f4ee" stroke-width="2.6" stroke-linecap="round"/>` +
      `<line class="h" x1="50" y1="50" x2="50" y2="27" stroke="#b7f4cf" stroke-width="4.4" stroke-linecap="round"/>` +
      `<circle cx="50" cy="50" r="3.4" fill="#b7f4cf"/></svg>`,
  });
  const m = node.querySelector(".m");
  const h = node.querySelector(".h");
  return {
    node,
    set(minutes) {
      m.setAttribute("transform", `rotate(${(minutes % 60) * 6} 50 50)`);
      h.setAttribute("transform", `rotate(${((minutes / 60) % 12) * 30} 50 50)`);
    },
  };
}

const stamp = (minutes) => {
  const total = Math.floor(minutes);
  const h = Math.floor(total / 60) % 12 || 12;
  return `${h}:${String(total % 60).padStart(2, "0")} AM`;
};

export async function create(film) {
  const layer = el("div.layer.pass", { id: "chips" });
  const chapters = film.chapters || [];
  const labels = film.labels || [];

  // Night time as a function of film time: each proof starts on its hour and then runs one
  // minute a second; a new card spins the clock forward to the next hour.
  function minutesAt(t) {
    let m = null;
    chapters.forEach((c, i) => {
      if (t < c.start) return;
      const base = c.hour * 60;
      const prev = chapters[i - 1];
      const from = prev ? prev.hour * 60 + (c.start - prev.start - prev.length) : base - 22;
      const spin = ease.inOut(ramp(t, c.start, c.start + 0.9));
      m = t < c.start + c.length ? lerp(from, base, spin) : base + (t - c.start - c.length);
    });
    return m;
  }

  // the title card of a proof: the clock, the hour, one line
  const big = dial(190);
  const bigTime = el("div.ctime");
  const bigText = el("div.ctext");
  const card = el("div.chapter", {}, big.node, el("div.cwords", {}, bigTime, bigText));
  // the small clock that stays in the margin while the proof plays
  const small = dial(120);
  const smallTime = el("div.dtime");
  const dock = el("div.dock", {}, small.node, smallTime);
  layer.append(card, dock);

  const lane = labels.map((l) => {
    const node = el("div.label", {}, el("div.lbox", {}, el("i"), el("span", { text: l.text })));
    layer.append(node);
    return { l, node, line: node.querySelector("i") };
  });
  const lastEnd = chapters.length ? Math.max(...chapters.map((c) => film.slots.find((s) => s.id === c.slot)).map((s) => s.start + s.length)) : 0;

  return {
    el: layer,
    render(t) {
      const minutes = minutesAt(t);
      const c = chapters.find((x) => t >= x.start && t < x.start + x.length);
      show(card, !!c);
      if (c) {
        const local = t - c.start;
        const a = Math.min(ease.out(ramp(local, 0.05, 0.4)), 1 - ease.in(ramp(local, c.length - 0.3, c.length)));
        card.style.opacity = a;
        card.style.transform = `translate(-50%, -50%) scale(${lerp(0.94, 1, ease.out(ramp(local, 0.05, 0.5)))})`;
        big.set(minutes);
        bigTime.textContent = stamp(minutes);
        bigText.textContent = c.text;
        bigText.style.opacity = ease.out(ramp(local, 0.45, 0.8));
        bigText.style.transform = `translateY(${lerp(14, 0, ease.out(ramp(local, 0.45, 0.85)))}px)`;
      }
      const docked = minutes != null && !c && t < lastEnd;
      show(dock, docked);
      if (docked) {
        const cur = [...chapters].reverse().find((x) => t >= x.start + x.length);
        const slot = film.slots.find((s) => s.id === cur.slot);
        dock.style.opacity = envelope(t, cur.start + cur.length, slot.start + slot.length, 0.4, 0.25);
        small.set(minutes);
        smallTime.textContent = stamp(minutes);
      }
      for (const x of lane) {
        const on = t >= x.l.start && t < x.l.start + x.l.length;
        show(x.node, on);
        if (!on) continue;
        const local = t - x.l.start;
        const a = envelope(t, x.l.start, x.l.start + x.l.length, 0.28, 0.22);
        x.node.style.opacity = a;
        x.node.style.transform = `translateY(${lerp(12, 0, ease.out(ramp(local, 0, 0.3)))}px)`;
        x.line.style.transform = `scaleX(${ease.out(ramp(local, 0.12, 0.7))})`;
      }
    },
  };
}
