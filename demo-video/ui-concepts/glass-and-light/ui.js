// The DOM of Glass & Light: glass panels, the six source windows with their mini UIs, the
// workbench, the page (rail and main panel with its sections), the floating cards, the chips and
// the HUD. Builders only; scene.js moves everything from t.
import { el } from "../shared/kit.js";
import { icons, sourceIcon } from "../shared/icons.js";
import { person, page, sources, reads, steps, learned, brief, ask, rules, sourceById } from "../shared/data.js";
import { WIN, BENCH, MAIN, RAIL, BRIEF_ROWS } from "./plan.js";

const tint = (hex, a) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
};
export const hueOf = (id) => sourceById[id].hue;
const icChip = (id, size = 36) =>
  `<span class="ic" style="width:${size}px;height:${size}px;background:${tint(hueOf(id), id === "directory" ? 0.9 : 0.32)}">${sourceIcon(id)}</span>`;
export const aiBadge = (cls = "") => `<span class="ai ${cls}">AI</span>`;

// The offset of an element inside an ancestor, in layout px (ignores transforms).
export function offsetIn(e, anc) {
  let x = 0, y = 0, n = e;
  while (n && n !== anc) { x += n.offsetLeft; y += n.offsetTop; n = n.offsetParent; }
  return [x, y, e.offsetWidth, e.offsetHeight];
}

// A glass panel: a 3D item with a sheen, a frost grain and a content box.
export function glass(parent, cls, w, h) {
  const root = el("div", `g3 glass ${cls}`, parent);
  root.style.width = w + "px";
  root.style.height = h + "px";
  el("div", "grain", root);
  const sheen = el("div", "sheen", root, "<i></i>");
  const c = el("div", "c", root);
  return { el: root, sheen: sheen.firstChild, c, w, h };
}
// The glass's thickness: a faint rim drawn a few px behind a panel.
export function edge(parent, w, h, radius = 28) {
  const e = el("div", "g3 edge", parent);
  e.style.width = w + "px";
  e.style.height = h + "px";
  e.style.borderRadius = radius + "px";
  return e;
}

// ------------------------------------------------------------------ the source windows

function winBody(id) {
  if (id === "directory") {
    return `
      <div class="dir-card row key" data-k="0">
        <div class="dir-av">R</div>
        <div><b>${person.first}</b><span>${person.role}</span></div>
      </div>
      <div class="dir-f row"><i>Team</i>${person.team} · ${person.org}</div>
      <div class="dir-f row"><i>Location</i>${person.city}</div>
      <div class="dir-f row"><i>Manager</i><span class="mini-av">AJ</span>${person.manager}</div>`;
  }
  if (id === "docs") {
    return `
      <div class="search">${icons.search}<span>Search documents, as ram</span></div>
      ${reads.docs.map((d, k) => `
        <div class="doc row${k === 0 ? " key" : ""}" data-k="${k === 0 ? 0 : ""}">
          <span class="doc-ic">${icons.docs}</span>
          <div><b>${d.title}</b><span>${d.sub}</span></div>
          ${k === 0 ? `<em class="open">${icons.link}Open</em>` : ""}
        </div>`).join("")}`;
  }
  if (id === "slack") {
    const ini = { "Daniel Weiss": "DW", "Vikram Rao": "VR", Ram: "R" };
    return reads.slack.map((m, k) => `
      <div class="msg row key" data-k="${k}">
        <span class="msg-av">${ini[m.who]}</span>
        <div><b>${m.who}<i>${m.where} · ${m.when}</i></b><span>${m.text}</span></div>
      </div>`).join("");
  }
  if (id === "code") {
    const pr = reads.code[0], old = reads.code[1];
    return `
      <div class="pr row key" data-k="0">
        <div class="pr-t"><b>${pr.title}</b><em class="pill open-pill">Open</em></div>
        <span>2 new review comments · Nov 14</span>
      </div>
      <div class="diff">
        <div class="del">- const maxRetries = 3;</div>
        <div class="add">+ const maxRetries = limitFor(market);</div>
        <div class="add">+ if (attempt > maxRetries) return hold(payout);</div>
      </div>
      <div class="pr row"><div class="pr-t"><b>${old.title}</b><em class="pill merged">Merged</em></div><span>Nov 9</span></div>`;
  }
  if (id === "tickets") {
    const st = ["Resolved", "In progress"];
    return reads.tickets.map((tk, k) => {
      const [code, ...rest] = tk.title.split(" · ");
      return `
      <div class="tk row${k === 0 ? " key" : ""}" data-k="${k === 0 ? 0 : ""}">
        <div class="tk-top"><b>${code}</b><em class="pill ${k === 0 ? "done" : "prog"}">${st[k]}</em></div>
        <span>${rest.join(" · ")}</span>
        <i>${tk.sub.split(" · ").pop()}</i>
      </div>`;
    }).join("");
  }
  // mail
  const ini = { "Payments Risk": "PR", "Amara Johnson": "AJ" };
  return `
    <div class="inbox">Inbox · as ram</div>
    ${reads.mail.map((m, k) => `
      <div class="mail row${k === 0 ? " key" : ""}" data-k="${k === 0 ? 0 : ""}">
        <span class="msg-av">${ini[m.who]}</span>
        <div><b>${m.who}<i>${m.when}</i></b><span>${m.title}</span></div>
      </div>`).join("")}
    <div class="mail row ghost-row"><span class="msg-av">…</span><div><b>10 more threads<i>Nov 1 to 13</i></b><span>Read as ram, nothing sent</span></div></div>`;
}

export function sourceWindow(parent, src, i) {
  const g = glass(parent, `win win-${src.id}`, WIN.w, WIN.h);
  const hd = el("div", "hd", g.c, `${icChip(src.id, 36)}<b>${src.name}</b>`);
  const status = el("div", "st", hd);
  const bd = el("div", "bd", g.c);
  const body = winBody(src.id);
  const frost = el("div", "layer frost", bd, body);
  const sharp = el("div", "layer sharp", bd, body);
  const veil = el("div", "veil", bd);
  const band = el("div", "band", bd);
  const scan = el("div", "scan", bd);
  const keys = [...sharp.querySelectorAll(".row.key")].sort((a, b) => Number(a.dataset.k) - Number(b.dataset.k));
  const keyBox = keys.map((k) => offsetIn(k, g.el));
  const open = sharp.querySelector(".open");
  let connect = null, toast = null;
  if (src.connect) {
    connect = el("div", "connect", g.c, `
      <div class="cn-t">${icons.lock}<span>${src.name} needs a one-time Connect</span></div>
      <div class="cn-b">${sourceIcon(src.id)}Connect</div>
      <div class="cn-s">With your own sign-in · read-only</div>`);
    toast = el("div", "toast", g.c, `${icons.key}<span>Signed in as ram · read-only</span>`);
  }
  return { ...g, src, i, status, bd, frost, sharp, veil, band, scan, keys, keyBox, open, connect, toast,
    connectBtn: connect && connect.querySelector(".cn-b") };
}

// ------------------------------------------------------------------ the workbench

// What lands on the bench: a chip per key line, the raw line, and the sentence it becomes.
export const BENCH_ROWS = [
  { src: "directory", ref: "Company directory", date: "Nov 15", raw: "Ram · Staff Engineer · Host Payouts · reports to Amara Johnson", sen: learned.facts[5].title },
  { src: "docs", ref: "Payout retry v2 · design doc", date: "Nov 11", raw: "Payout retry v2 · design doc · by Ram · edited Nov 11", sen: learned.facts[0].title },
  { src: "slack", ref: "#host-payouts", date: "Nov 15", raw: `Daniel Weiss: "${reads.slack[0].text}"`, sen: brief.items[0].title },
  { src: "slack", ref: "#payments-eng", date: "Nov 12", raw: `Ram: "${reads.slack[2].text}"`, sen: learned.facts[1].title },
  { src: "slack", ref: "#launch-brazil", date: "Nov 13", raw: `Vikram Rao: "${reads.slack[1].text}"`, sen: learned.facts[3].title },
  { src: "code", ref: "PR #4182", date: "Nov 14", raw: "PR #4182 · Retry limit per market · 2 new review comments", sen: learned.facts[2].title },
  { src: "tickets", ref: "INC-20431", date: "Nov 10", raw: "INC-20431 · Partner bank outage, Brazil · resolved", sen: learned.facts[4].title },
  { src: "mail", ref: "Payments Risk", date: "Nov 14", raw: `Payments Risk: "${reads.mail[0].title}"`, sen: brief.items[1].title },
];
export const benchRowPos = (k) => [64 + (k >= 4 ? 676 : 0), 168 + (k % 4) * 162];
export const CHIP = { w: 340, h: 50 };

export function chipHTML(r, cls = "") {
  return `${icChip(r.src, 36)}<b>${r.ref}</b><i class="d">${r.date}</i>`;
}

export function benchPanel(parent) {
  const g = glass(parent, "bench", BENCH.w, BENCH.h);
  const title = el("div", "b-title", g.c, `<span class="a">What I'm learning</span><span class="b">What I learned</span>`);
  el("div", "b-who", g.c, `<span>Ram's AI Peer</span>${aiBadge()}`);
  const count = el("div", "b-count", g.c, "");
  const rows = BENCH_ROWS.map((r, k) => {
    const [x, y] = benchRowPos(k);
    const row = el("div", "b-row", g.c);
    row.style.left = x + "px";
    row.style.top = y + "px";
    el("div", "slot", row);
    const chip = el("div", "chip", row, chipHTML(r));
    const raw = el("div", "raw", row, r.raw);
    const sen = el("div", "sen", row, r.sen);
    const sweep = el("div", "sweep", row);
    return { row, chip, raw, sen, sweep, x, y };
  });
  return { ...g, title, count, rows, titleA: title.children[0], titleB: title.children[1] };
}

// ------------------------------------------------------------------ chips that fly
export function flyChip(parent, r, cls = "") {
  const c = el("div", `g3 chip fly ${cls}`, parent, chipHTML(r));
  c.style.width = CHIP.w + "px";
  c.style.height = CHIP.h + "px";
  return c;
}

// ------------------------------------------------------------------ the page: rail
export function railPanel(parent) {
  const g = glass(parent, "rail", RAIL.w, RAIL.h);
  el("div", "r-logo", g.c, `<i>AI</i>${page.product}`);
  el("div", "r-h", g.c, "Your Peer");
  const nav = el("div", "r-nav", g.c);
  const hl = el("div", "hl", nav);
  const navIcons = [icons.spark, icons.book, icons.home, icons.ask, icons.shield];
  const navItems = page.nav.map((n, k) => el("div", "it", nav, `${navIcons[k]}<span>${n}</span>`));
  el("div", "r-h", g.c, "Sources");
  const src = el("div", "r-src", g.c);
  const srcItems = sources.map((s) => {
    const it = el("div", "it", src, `${sourceIcon(s.id)}<span>${s.short}</span>`);
    const tick = el("b", "tick", it, icons.check);
    return { it, tick };
  });
  el("div", "r-me", g.c, `<div class="av">${person.initial}</div><div><b>${person.first}</b><span>Signed in as ram</span></div>`);
  return { ...g, hl, navItems, srcItems };
}

// ------------------------------------------------------------------ the page: main panel
export function mainPanel(parent) {
  const g = glass(parent, "main", MAIN.w, MAIN.h);
  const sec = (name) => el("div", `sec sec-${name}`, g.c);

  // Setup, then "ready".
  const su = sec("setup");
  const suKick = el("div", "kicker", su, "Set up");
  const suHead = el("div", "display", su, `<span class="a">${page.hello}</span><span class="b">Your AI Peer is ready</span>`);
  const suSub = el("div", "sub", su, `<span class="a">Your Peer is learning your work, as you. It only reads.</span><span class="b">Set up in 27.4 s. It read your work as you, read-only.</span>`);
  const stepList = el("div", "steps", su);
  const stepRows = steps.map((s) => {
    const r = el("div", "step", stepList, `<span class="ring"><i></i>${icons.check}</span><span class="tx">${s.text}</span><b class="tm">${s.time.toFixed(1)} s</b>`);
    return { r, ring: r.querySelector(".ring"), fill: r.querySelector(".ring i"), tm: r.querySelector(".tm") };
  });
  el("div", "kicker gave", su, "What each source gave");
  const gave = el("div", "gave", su);
  const gaveItems = sources.map((s) => el("div", "gv", gave, `${icChip(s.id, 34)}<div><b>${s.name}<em>${icons.check}</em></b><span>${s.found}</span></div>`));
  const bfH = el("div", "bf-h", su, `Your first brief<span>${aiBadge()}</span>`);
  const slots = [0, 1, 2, 3].map((k) => {
    const s = el("div", "bslot", su);
    s.style.top = 290 + k * 116 + "px";
    const slot = el("div", "slot", s);
    const chip = el("div", "chip amber", s, chipHTML(BENCH_ROWS[BRIEF_ROWS[k]]));
    const t = el("div", "bt", s, brief.items[k].title);
    return { s, slot, chip, t };
  });

  // What I learned.
  const le = sec("learned");
  el("div", "kicker", le, `What I learned<span class="by">${aiBadge()} Written by Ram's AI Peer</span>`);
  el("div", "display", le, "What I learned about you");
  el("div", "asof", le, learned.asOf);
  const summary = el("div", "summary", le);
  const words = learned.summary.split(" ").map((w) => el("span", "w", summary, w + " "));
  const tagBox = el("div", "tags", le);
  const tags = learned.tags.map((tg) => el("span", "tag", tagBox, tg));

  // Your brief.
  const br = sec("brief");
  el("div", "kicker", br, "Your brief · Sunday, Nov 15 · newest first");
  el("div", "display", br, "Your brief");
  el("div", "lead", br, brief.lead);

  // Ask.
  const as = sec("ask");
  el("div", "kicker", as, "Ask your Peer");
  el("div", "display", as, "Ask your Peer");
  const exBox = el("div", "examples", as);
  const examples = ask.examples.map((q) => el("span", "ex", exBox, q));
  const status = el("div", "status", as, `<span class="dot"></span><span class="a">Searching again, as ram</span><span class="b">Searched again just now, as ram · 4 sources</span>`);
  const found = el("div", "found", as);
  const foundChips = ask.sources.map((s) => el("span", "fchip", found, `${icChip(s.source, 26)}${s.ref}`));

  // How it works.
  const ru = sec("rules");
  el("div", "kicker", ru, `How it works<span class="by">${aiBadge()} Always labelled as AI</span>`);
  el("div", "display", ru, "The rules your Peer keeps");

  return {
    ...g, secs: { setup: su, learned: le, brief: br, ask: as, rules: ru },
    suHead, suSub, suKick, stepRows, gave, gaveItems, bfH, slots,
    summary, words, tags, examples, status, found, foundChips,
  };
}

// ------------------------------------------------------------------ floating cards
export function factCard(parent, f, k) {
  const g = glass(parent, "card fact", 476, 196);
  el("div", "t", g.c, f.title);
  el("div", "b", g.c, f.body);
  const ft = el("div", "ft", g.c);
  const chip = el("span", "src-chip", ft, `${icChip(f.source, 26)}${f.ref}`);
  el("span", "date", ft, f.date);
  el("span", "lnk", ft, icons.link);
  return { ...g, chip };
}

export function briefCard(parent, it, k) {
  const g = glass(parent, "card bcard", 1452, 140);
  el("div", "bc-l", g.c, `<b>${it.date}</b>${icChip(it.source, 40)}`);
  const mid = el("div", "bc-m", g.c);
  el("div", "t", mid, `${it.title}${k === 0 ? '<em class="new">New</em>' : ""}`);
  el("div", "y", mid, it.why);
  const next = el("div", "next", mid, `<i>Next</i>${it.next}`);
  el("div", "bc-r", g.c, `<span class="src-chip">${icChip(it.source, 26)}${it.ref}</span><span class="date">${it.date}</span>`);
  return { ...g, next };
}

export function askBox(parent) {
  const g = glass(parent, "card askbox", 1112, 84);
  el("span", "q-ic", g.c, icons.search);
  const q = el("span", "q", g.c, "");
  const caret = el("span", "caret", g.c, "");
  const ph = el("span", "ph", g.c, "Ask anything about your work");
  const btn = el("span", "go", g.c, `Ask${icons.spark}`);
  const ring = el("div", "edge-glow", g.el);
  return { ...g, q, caret, ph, btn, ring };
}

export function answerCard(parent) {
  const g = glass(parent, "card answer", 1468, 470);
  el("div", "an-h", g.c, `${aiBadge()}<b>Ram's AI Peer</b><span>answers from what it found, with sources</span>`);
  const sens = ask.answer.map((a, k) => {
    const s = el("div", "an-s", g.c, `${a.text}<sup class="cite" style="--h:${hueOf(ask.sources[a.cite].source)}">${a.cite + 1}</sup>`);
    return s;
  });
  el("div", "an-srch", g.c, "Sources");
  const srcs = ask.sources.map((s, k) => el("div", "an-src", g.c, `<em>${k + 1}</em>${icChip(s.source, 30)}<div><b>${s.ref}</b><span>${sourceById[s.source].name} · ${s.date}</span></div>`));
  const foot = el("div", "an-f", g.c);
  const gauge = el("div", "gauge", foot, `<i></i><b>High</b>`);
  el("div", "cert", foot, `<b>Confidence: ${ask.certainty}</b><span>${ask.asOf}</span>`);
  return { ...g, sens, srcs, gauge, gaugeFill: gauge.querySelector("i"), foot };
}

const RULE_ICONS = [null, icons.key, icons.link, icons.docs, icons.lock, icons.eye];
export function ruleTile(parent, r, k) {
  const g = glass(parent, "card rule", 476, 250);
  el("div", "ru-ic", g.c, k === 0 ? "<b>AI</b>" : RULE_ICONS[k]);
  el("div", "ru-ai", g.c, aiBadge());
  el("div", "t", g.c, r.title);
  el("div", "b", g.c, r.body);
  return g;
}

// ------------------------------------------------------------------ screen-space pieces
export function hud(parent) {
  const h = el("div", "hud", parent);
  const orb = el("span", "h-orb", h);
  const n = el("span", "h-n", h, "1 / 4");
  const txt = el("span", "h-txt", h);
  const lines = steps.map((s) => el("span", "", txt, s.text));
  const box = el("span", "h-steps", h);
  const marks = steps.map((s, k) => {
    const m = el("span", "h-st", box, `<span class="ring"><i></i>${icons.check}</span><b>${s.time.toFixed(1)} s</b>`);
    return { m, ring: m.querySelector(".ring"), fill: m.querySelector(".ring i"), tm: m.querySelector("b") };
  });
  return { el: h, n, lines, marks };
}

export function orbLabel(parent) {
  const l = el("div", "orb-label", parent, `<b>AI</b><span>Ram's AI Peer</span>`);
  return { el: l, long: l.querySelector("span") };
}
