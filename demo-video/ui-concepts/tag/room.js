// Tag: the paper room where setup happens. A wall and a floor, a top bar with the four steps,
// the Notes panel on the left, one tall paper card per source (the room pans from one to the
// next as the tag walks), then the cards fly up into a row and the tag writes What I learned
// along a rail. Frame px; render(t) sets every moving style from t.
import { el } from "../shared/kit.js";
import { steps, sources, reads, learned, person } from "../shared/data.js";
import { icons, sourceIcon } from "../shared/icons.js";
import { X, GAVE, KEY_ROW, shortName } from "./data-extra.js";
import { HORIZON, TOPBAR, NOTES, CARD, MINI, PANEL, SRC, READ, STEP_AT, STEP_DONE, S3, S4, MORPH, ROOM_IN } from "./tl.js";
import { put, css, txt, cls, tr, io, win, pop, fit, rlerp, prog, clamp, lerp, ease } from "./u.js";

const at = (e, x, y, w, h) => {
  e.style.left = `${x}px`; e.style.top = `${y}px`;
  if (w != null) e.style.width = `${w}px`;
  if (h != null) e.style.height = `${h}px`;
  return e;
};

// The pan: which card is in front (0 = directory ... 5 = mail), eased between them.
export function panK(t) {
  let k = 0;
  SRC.forEach((id, i) => { if (i > 0) k += ease.inOutCubic(prog(t, READ[id].pan[0] + 0.05, READ[id].pan[1])); });
  return k;
}
// The big card i's rectangle (frame px) at pan k.
export const cardRect = (i, k) => ({ x: CARD.cx + (i - k) * CARD.gap - CARD.w / 2, y: CARD.y, w: CARD.w, h: CARD.h });
export const miniRect = (i) => ({ x: MINI.x + i * (MINI.w + MINI.gap), y: MINI.y, w: MINI.w, h: MINI.h });
// The writing panel's width (it narrows for step 4) and the tag's x as it rides the rail.
export const panelW = (t) => lerp(PANEL.w, PANEL.narrowW, ease.inOutCubic(prog(t, S4.compact[0], S4.compact[1])));
export const RIDE = { x0: 300, x1: 1640 };
export const rideX = (t) => lerp(RIDE.x0, RIDE.x1, ease.inOutSine(prog(t, S3.ride[0], S3.ride[1])));
// Notes targets (frame px): the directory chips and one section per later source.
const NCHIP = [[30, 146], [196, 146], [30, 190]];
export const noteSecY = (j) => NOTES.y + 252 + j * 104;

// Rows of each card's list: what they say.
function rowsFor(id) {
  if (id === "docs") return reads.docs.map((r) => ({ t: r.title, s: r.sub }));
  if (id === "slack") return reads.slack.map((r) => ({ t: r.text, s: `${r.where} · ${r.who} · ${r.when}`, wrap: true }));
  if (id === "code") return reads.code.map((r) => ({ t: r.title, s: r.sub }));
  if (id === "tickets") return reads.tickets.map((r) => ({ t: r.title, s: r.sub }));
  if (id === "mail") return reads.mail.map((r) => ({ t: r.title, s: `${r.who} · ${r.when}` }));
  return [];
}
const KV = [["Role", person.role], ["Team", person.team], ["Org", person.org], ["City", person.city], ["Manager", person.manager]];

export function buildRoom(back, front) {
  const R = { back, front };
  // ---- wall and floor
  el("div", "tg-wall", back);
  el("div", "tg-wallshade", back);
  R.floor = at(el("div", "tg-floor", back), 0, HORIZON, 1920, 1080 - HORIZON + 4);
  R.seams = el("div", "tg-seams", R.floor);
  el("div", "tg-floorshine", R.floor);

  // ---- top bar
  R.top = el("div", "tg-layer", front);
  R.pill = at(el("div", "tg-toppill", R.top), 40, TOPBAR.y);
  R.pill.textContent = X.topPill;
  R.dashes = at(el("div", "tg-dashes", R.top), 470, TOPBAR.y + 19);
  R.dash = steps.map((s) => {
    const d = el("div", "tg-dash", R.dashes);
    const fill = el("i", "", d);
    const lab = el("div", "tg-dash-l", R.dashes);
    lab.textContent = `${s.time.toFixed(1)} s`;
    return { d, fill, lab };
  });
  R.stepT = at(el("div", "tg-stept", R.top), 664, TOPBAR.y + 12);
  R.stepTexts = steps.map((s, i) => `Step ${i + 1} of 4 <span>· ${s.text}</span>`);
  R.srcChip = el("div", "tg-srcchip", R.top);

  // ---- the Notes panel
  R.notes = at(el("div", "tg-notes", front), NOTES.x, NOTES.y, NOTES.w, NOTES.h);
  el("div", "tg-notes-h", R.notes, X.notesTitle);
  el("div", "tg-notes-s", R.notes, X.notesSub);
  el("div", "tg-notes-r", R.notes);
  const dirChips = [person.role, person.team, person.city];
  R.nchips = dirChips.map((c, i) => at(el("div", "tg-nchip", R.notes, c), NCHIP[i][0], NCHIP[i][1]));
  R.nsec = SRC.slice(1).map((id, j) => {
    const s = at(el("div", "tg-nsec", R.notes), 30, noteSecY(j) - NOTES.y);
    el("div", "tg-nsec-h", s, `${shortName[id]} <em>&#10003;</em><span style="margin-left:auto;font:500 13.5px/1 var(--mono);color:var(--mute)">${GAVE[id].count}</span>`);
    const k = el("div", "tg-nsec-k", s, GAVE[id].key);
    el("div", "tg-nsec-r", s);
    return { el: s, key: k };
  });

  // ---- the big source cards
  R.cards = SRC.map((id, i) => {
    const src = sources[i];
    const c = { id, i };
    c.el = el("div", "tg-bc", front);
    at(el("div", "tg-bc-sheet", c.el), 16, 14).style.cssText += "right:-16px;bottom:-14px;left:16px;top:14px;";
    at(el("div", "tg-bc-sheet", c.el), 8, 7).style.cssText += "right:-8px;bottom:-7px;left:8px;top:7px;";
    const m = (c.main = el("div", "tg-bc-main", c.el));
    const head = el("div", "tg-bc-head", m);
    el("div", "tg-bc-icon", head, sourceIcon(id));
    el("div", "tg-bc-title", head, src.name);
    el("div", "tg-bc-lab", head, X.sourceOf(i + 1, SRC.length));
    c.st = el("div", "tg-bc-st", head);
    c.bar = el("div", "tg-bc-bar", m);
    const body = (c.body = el("div", "tg-bc-body", m));
    // Reading: a line and shimmering bars.
    c.read = el("div", "tg-abs", body);
    c.read.style.cssText = "left:0;top:0;right:0;bottom:0;";
    el("div", "tg-bc-read", c.read, X.readingAs);
    c.skel = [0.86, 0.72, 0.8, 0.56, 0.66].map((w, j) => {
      const b = at(el("div", "tg-skel", c.read), 36, 92 + j * 54, Math.round(660 * w), 20);
      return { b, i: el("i", "", b), w: 660 * w };
    });
    // The result: a count, then rows.
    c.list = el("div", "tg-abs", body);
    c.list.style.cssText = "left:0;top:0;right:0;bottom:0;";
    const cnt = el("div", "tg-bc-count", c.list, `<b>${GAVE[id].count}</b><span>${GAVE[id].sub}</span>`);
    c.cnt = cnt;
    c.rows = [];
    if (id === "directory") {
      const en = el("div", "tg-entry", c.list, `<div class="tg-av">R</div><div><b>${person.first}</b><span>${person.login} · ${person.city}</span></div>`);
      c.rows.push({ el: en, y: 112, h: 58, dir: true });
      KV.forEach(([k, v], j) => {
        const r = at(el("div", "tg-kv", c.list), 30, 196 + j * 62);
        r.innerHTML = `<span>${k}</span><b>${v}</b>`;
        c.rows.push({ el: r, y: 196 + j * 62, h: 62, text: v });
      });
      c.keyRows = [1, 2, 4];             // Role, Team, City (of c.rows; 0 is the entry)
    } else {
      let y = 112;
      rowsFor(id).forEach((rw) => {
        const r = at(el("div", "tg-row", c.list), 30, y);
        el("div", "tg-row-t" + (rw.wrap ? " wrap" : ""), r, rw.t);
        el("div", "tg-row-s", r, rw.s);
        const h = rw.wrap ? 104 : 82;
        c.rows.push({ el: r, y, h, text: rw.t });
        y += h;
      });
      c.more = at(el("div", "tg-more", c.list), 40, y + 22);
      c.more.textContent = X.more(GAVE[id].more);
      c.keyRows = [KEY_ROW[id]];
    }
    // The key line's marker (amber, lifts a little) and its tab.
    c.hl = c.keyRows.map((rIdx) => {
      const r = c.rows[rIdx];
      const label = id === "directory" ? r.text : GAVE[id].key;
      const dx = id === "directory" ? 172 : 26;
      const bar = at(el("div", "tg-hlbar", c.list), dx, r.y + 6, 0, r.h - 10);
      const sp = el("span", "", bar, label);
      if (id === "directory") sp.style.cssText = "left: 8px; font: 600 25px/1 var(--sans);";
      const tab = at(el("div", "tg-tab", c.list), 0, r.y + r.h / 2 - 10);
      return { bar, tab, r, label, dx };
    });
    // Documents: items Ram cannot see are skipped, never opened.
    if (id === "docs") {
      c.skip = at(el("div", "tg-skip", c.el), CARD.w + 30, 340);
      c.skc = [0, 1, 2].map((j) => at(el("div", "tg-skc", c.skip, `${icons.lock}${X.skipChip}`), j * 7, j * 38));
      c.skl = el("div", "tg-skip-l", c.skip, X.skipped(3));
    }
    // Connect once (Slack, Code, Tickets), and the sign-in sheet.
    if (READ[id].connect) {
      c.cx = el("div", "tg-cx", body);
      el("div", "tg-cx-plug", c.cx, icons.key);
      el("div", "tg-cx-t", c.cx, X.connectTitle);
      c.cxBtn = el("div", "tg-cx-btn", c.cx, X.connectBtn(src.short));
      el("div", "tg-cx-s", c.cx, X.connectSub);
      c.sheet = el("div", "tg-sheet", body, `<div class="tg-sheet-i">${icons.user}</div><div><b>${X.sheetTitle}</b><span>${X.sheetSub}</span></div><em>${icons.check}</em>`);
    }
    return c;
  });

  // ---- the flying key lines (directory: three chips; others: one)
  R.flies = [];
  R.cards.forEach((c) => {
    c.hl.forEach((h, j) => {
      const label = c.id === "directory" ? [person.role, person.team, person.city][j] : GAVE[c.id].key;
      const f = el("div", "tg-fly", front, label);
      R.flies.push({ el: f, card: c, j, label });
    });
  });

  // ---- step 3: the mini cards and the writing panel
  R.minis = SRC.map((id, i) => {
    const r = miniRect(i);
    const m = at(el("div", "tg-mc", front), r.x, r.y, r.w, r.h);
    el("div", "tg-mc-h", m, `${sourceIcon(id)}${shortName[id]}<em>${icons.check}</em>`);
    el("div", "tg-mc-c", m, GAVE[id].count);
    el("div", "tg-mc-s", m, GAVE[id].sub);
    el("div", "tg-mc-k", m, GAVE[id].key);
    const dot = at(el("div", "tg-mc-d", front), r.x + r.w - 9, r.y + 146);
    return { el: m, dot, r, dotAt: [r.x + r.w - 2.5, r.y + 152.5] };
  });
  R.wp = at(el("div", "tg-wp", front), PANEL.x, PANEL.y, PANEL.w, PANEL.h);
  R.wpH = el("div", "tg-wp-h", R.wp, `<b>What I learned</b>`);
  learned.tags.slice(0, 3).forEach((g) => el("div", "tg-tag", R.wpH, g));
  el("div", "tg-wp-s", R.wp, learned.asOf);
  R.wf = learned.facts.map((f, i) => {
    const y = PANEL.factY - PANEL.y + i * PANEL.row;
    const row = at(el("div", "tg-wf", R.wp), 70, y, PANEL.w - 140, PANEL.row);
    el("div", "tg-wf-n", row, String(i + 1).padStart(2, "0"));
    const tw = el("div", "tg-wf-t", row, f.title);
    const ink = el("div", "tg-wf-ink", row);
    const pill = el("div", "tg-pill", row, `${shortName[f.source]} · ${f.date}`);
    return { row, tw, ink, pill, f, i, y: PANEL.y + y };
  });
  R.rail = el("div", "tg-wrail", front);
  R.capL = el("div", "tg-wrail-cap", front);
  R.capR = el("div", "tg-wrail-cap", front);
  return R;
}

export function measureRoom(R) {
  R.stepW = R.stepTexts.map((h) => { R.stepT.innerHTML = h; return R.stepT.getBoundingClientRect().width; });
  R.wf.forEach((w) => {
    w.textW = w.tw.getBoundingClientRect().width;
    w.textX = 70 + 50;                   // row-relative x where the text starts
    w.pillW = w.pill.getBoundingClientRect().width;
  });
  R.flies.forEach((f) => { const b = f.el.getBoundingClientRect(); f.w = b.width; f.h = b.height; });
  R.cards.forEach((c) => c.hl.forEach((h) => {
    const s = h.bar.querySelector("span");
    h.w = Math.min(CARD.w - 74 - (h.dx - 26), s.getBoundingClientRect().width + (h.dx > 26 ? 18 : 34));
  }));
  return R;
}

// Where the key line of source i sits (frame px) at t: for the tag's line and the fly chip.
export function keyRowAt(R, i, t, j = 0) {
  const c = R.cards[i];
  const r = cardRect(i, panK(t));
  const row = c.rows[c.keyRows[j]];
  return { x: r.x + c.hl[j].dx, y: r.y + 130 + row.y + 6, w: c.hl[j].w, h: row.h - 10 };
}
// The Notes target of a fly chip.
function flyTarget(f) {
  if (f.card.id === "directory") return [NOTES.x + NCHIP[f.j][0], NOTES.y + NCHIP[f.j][1]];
  const j = f.card.i - 1;
  return [NOTES.x + 30, noteSecY(j) + 28];
}
// The pill of fact i in the writing panel (frame px).
export function wfPill(R, i, t) {
  const w = R.wf[i];
  const pw = panelW(t);
  const x = PANEL.x + 70 + Math.min(w.textX - 70 + w.textW + 26, pw - 140 - w.pillW);
  return { x, y: w.y + PANEL.row / 2 - 16, w: w.pillW, h: 32 };
}

export function renderRoom(R, t, S) {
  // S: { roomK (the room's visibility), frontK, pan }
  const roomK = S.roomK;
  put(R.back, roomK);
  css(R.seams, "backgroundPosition", `${(-S.pan * CARD.gap * 0.9).toFixed(1)}px 0`);

  // ---- top bar
  const topK = Math.min(ease.outCubic(prog(t, ROOM_IN[0] + 0.3, ROOM_IN[1] + 0.3)), 1 - ease.inOutCubic(prog(t, MORPH[0], MORPH[0] + 0.5)));
  put(R.top, topK, tr(0, (1 - topK) * -16));
  let step = 0;
  for (let i = 0; i < 4; i++) if (t >= STEP_AT[i]) step = i;
  R.dash.forEach((d, i) => {
    const k = t >= STEP_DONE[i] ? 1 : t >= STEP_AT[i] ? 0.25 + 0.5 * prog(t, STEP_AT[i], STEP_DONE[i]) : 0;
    css(d.fill, "width", `${(k * 100).toFixed(1)}%`);
    put(d.lab, ease.outCubic(prog(t, STEP_DONE[i], STEP_DONE[i] + 0.3)));
    css(d.lab, "left", `${i * 46}px`);
  });
  if (R._step !== step) { R.stepT.innerHTML = R.stepTexts[step]; R._step = step; }
  const sIn = ease.outCubic(prog(t, STEP_AT[step], STEP_AT[step] + 0.35));
  put(R.stepT, 1, tr((1 - sIn) * 18, 0));
  // The source being read now, after the step text (step 2 only).
  const curSrc = Math.min(5, Math.max(1, Math.round(S.pan)));
  const srcOn = step === 1 && t < STEP_DONE[1] ? 1 : 0;
  if (R._src !== curSrc) { R.srcChip.innerHTML = `${sourceIcon(SRC[curSrc])}${sources[curSrc].name}`; R._src = curSrc; }
  at(R.srcChip, 664 + R.stepW[1] + 18, TOPBAR.y + 5);
  put(R.srcChip, srcOn * sIn, tr(0, 0, 1 + 0.06 * (1 - ease.outCubic(prog(t, READ[SRC[curSrc]].pan[1] - 0.2, READ[SRC[curSrc]].pan[1] + 0.15)))));

  // ---- Notes: slides in with the room, out as the cards fly up.
  const nIn = ease.outCubic(prog(t, ROOM_IN[0] + 0.25, ROOM_IN[1] + 0.35));
  const nOut = ease.inCubic(prog(t, S3.notesOut[0], S3.notesOut[1]));
  put(R.notes, Math.min(nIn, 1 - nOut), tr(-(1 - nIn) * 120 - nOut * 460, 0));
  R.nchips.forEach((c, j) => {
    const land = READ.directory.chip[0] + 0.32 + j * 0.12;
    const k = prog(t, land, land + 0.12);
    put(c, k, `scale(${(1 + 0.12 * Math.sin(Math.PI * prog(t, land, land + 0.3))).toFixed(3)})`);
  });
  R.nsec.forEach((s, j) => {
    const id = SRC[j + 1];
    const land = READ[id].chip[1] - 0.06;
    const k = ease.outCubic(prog(t, land - 0.1, land + 0.12));
    put(s.el, k, tr(0, (1 - k) * 8));
    put(s.key, prog(t, land, land + 0.08), `scale(${(1 + 0.1 * Math.sin(Math.PI * prog(t, land, land + 0.3))).toFixed(3)})`);
  });

  // ---- the big cards
  const flyK = ease.inOutCubic(prog(t, S3.fly[0], S3.fly[1]));
  R.cards.forEach((c, i) => {
    const id = c.id, rd = READ[id];
    const r = cardRect(i, S.pan);
    const d = i - S.pan;
    let o = d < 0 ? clamp(1 + d * 1.6) : d <= 1 ? 1 - 0.18 * d : clamp(1 - (d - 1) * 1.6) * 0.82;
    // The directory card rises out of the floor as the room comes in.
    const rise = i === 0 ? 1 - ease.outBack(prog(t, rd.pan[0], rd.pan[1]), 1.2) : 0;
    const appear = i === 0 ? clamp(prog(t, rd.pan[0], rd.pan[0] + 0.2)) : clamp(prog(t, READ[SRC[i - 1]].pan[0], READ[SRC[i - 1]].pan[0] + 0.3));
    o *= appear;
    let tf = `translate(${r.x.toFixed(1)}px, ${(r.y + rise * 860).toFixed(1)}px) perspective(2200px) rotateY(${(clamp(d, -1.5, 1.5) * -16).toFixed(2)}deg)`;
    if (flyK > 0) {
      // Fly up into the row of mini cards.
      const m = miniRect(i);
      const k = ease.inOutCubic(prog(t, S3.fly[0] + (5 - i) * 0.03, S3.fly[1] - i * 0.0));
      const cur = rlerp(r, m, k);
      const s = cur.w / CARD.w;
      // The card scales about its bottom centre (its transform origin).
      const ox = CARD.w / 2, oy = CARD.h;
      tf = `translate(${(cur.x - ox * (1 - s)).toFixed(1)}px, ${(cur.y + (cur.h - CARD.h * s) / 2 - oy * (1 - s)).toFixed(1)}px) scale(${s.toFixed(4)})`;
      o = Math.max(o * (1 - k), 0) + (1 - prog(k, 0.6, 0.95)) * k * 1.0;
      o = Math.min(1, o) * (1 - prog(k, 0.7, 1));
    }
    put(c.el, o, tf);
    if (o <= 0.003) return;

    // The body's state.
    const conn = rd.connect;
    const readA = rd.read[0];
    const startBar = conn ? conn.sheet[1] - 0.1 : readA;
    css(c.bar, "width", `${(100 * ease.inOutSine(prog(t, startBar, rd.done))).toFixed(1)}%`);
    const done = t >= rd.done;
    const status = done ? `${icons.check.replace("<svg", '<svg width="16" height="16"')}${X.statusRead}` : conn && t < conn.sheet[1] - 0.1 ? X.statusConnect : X.statusReading;
    if (c._st !== status) { c.st.innerHTML = status; c._st = status; }
    cls(c.st, "ok", done);
    put(c.st, 1, `scale(${(1 + 0.12 * Math.sin(Math.PI * prog(t, rd.done, rd.done + 0.3))).toFixed(3)})`);
    // Connect once.
    if (conn) {
      const cxK = 1 - ease.inOutCubic(prog(t, conn.sheet[1] - 0.2, conn.sheet[1] + 0.05));
      const under = ease.inOutSine(prog(t, conn.sheet[0] - 0.02, conn.sheet[0] + 0.18));
      put(c.cx, cxK * (1 - 0.82 * under));
      const press = Math.max(0, 1 - Math.abs(t - conn.click) / 0.09);
      put(c.cxBtn, 1, `scale(${(1 - 0.07 * press).toFixed(3)})`);
      const shK = pop(t, conn.sheet[0], 0.32) * (1 - ease.inCubic(prog(t, conn.sheet[1] - 0.14, conn.sheet[1] + 0.04)));
      put(c.sheet, shK, `translateY(${((1 - clamp(shK)) * 26).toFixed(1)}px) scale(${(0.9 + 0.1 * shK).toFixed(3)})`);
    }
    // Reading: shimmer over the bars.
    const readK = win(t, readA, rd.list + 0.1, 0.15, 0.2);
    put(c.read, readK);
    if (readK > 0) c.skel.forEach((s, j) => {
      const ph = ((t - readA) * 1.6 + j * 0.13) % 1.2;
      css(s.i, "transform", `translateX(${(-160 + ph / 1.2 * (s.w + 320)).toFixed(1)}px)`);
    });
    // The result.
    const listK = ease.outCubic(prog(t, rd.list, rd.list + 0.25));
    put(c.list, listK);
    if (listK > 0) {
      put(c.cnt, 1, tr(0, (1 - listK) * 12));
      c.rows.forEach((rw, j) => {
        const k = ease.outCubic(prog(t, rd.list + 0.05 + j * 0.05, rd.list + 0.3 + j * 0.05));
        put(rw.el, k, tr(0, (1 - k) * 14));
      });
      if (c.more) put(c.more, ease.outCubic(prog(t, rd.list + 0.3, rd.list + 0.5)));
      if (c.skc) {
        c.skc.forEach((e, j) => { const k = pop(t, rd.list + 0.3 + j * 0.09, 0.3); put(e, clamp(k * 1.3), tr(0, (1 - clamp(k)) * 14, 0.9 + 0.1 * k)); });
        const lk = ease.outCubic(prog(t, rd.list + 0.6, rd.list + 0.85));
        put(c.skl, lk, tr(0, (1 - lk) * 8));
      }
      c.hl.forEach((h, j) => {
        const a = rd.hl + j * 0.12;
        const k = ease.outCubic(prog(t, a, a + 0.24));
        const lift = ease.outBack(prog(t, rd.chip[0] - 0.1, rd.chip[0] + 0.15));
        css(h.bar, "width", `${h.w}px`);
        put(h.bar, k > 0 ? 1 : 0, `translateY(${(-4 * lift).toFixed(1)}px) rotate(${(-0.8 * lift).toFixed(2)}deg) scaleX(${k.toFixed(3)})`);
        put(h.tab, j === 0 && k > 0.9 ? 1 : 0, tr(h.dx + h.w - 6, -4 * lift));
      });
    }
  });

  // ---- the flying key lines: from the card's key row into the Notes.
  R.flies.forEach((f) => {
    const rd = READ[f.card.id];
    const a = rd.chip[0] + f.j * 0.12, b = rd.chip[1] - 0.1 + f.j * 0.12;
    if (t < a || t > b + 0.05) { put(f.el, 0); return; }
    const k = ease.inOutCubic(prog(t, a, b));
    const src = keyRowAt(R, f.card.i, a, f.j);
    const p0 = [src.x + 14, src.y + src.h / 2 - f.h / 2];
    const p1 = flyTarget(f);
    const x = lerp(p0[0], p1[0], k), y = lerp(p0[1], p1[1], k) - 150 * Math.sin(Math.PI * k);
    const s = lerp(1.25, 0.95, k);
    put(f.el, 1 - prog(t, b - 0.02, b + 0.05), `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) rotate(${(-6 * Math.sin(Math.PI * k)).toFixed(2)}deg) scale(${s.toFixed(3)})`);
  });

  // ---- step 3: mini cards, writing panel, the rail
  const compactK = ease.inOutCubic(prog(t, S4.compact[0], S4.compact[1]));
  R.minis.forEach((m, i) => {
    const k = prog(t, S3.fly[0] + 0.45 + (5 - i) * 0.03, S3.fly[1] + 0.05);
    const o = Math.min(k * 1.4, 1) * (1 - compactK);
    put(m.el, o, `translateY(${(-compactK * 40).toFixed(1)}px) scale(${(1 - 0.06 * compactK).toFixed(3)})`);
    put(m.dot, o * ease.outBack(prog(t, S3.fly[1], S3.fly[1] + 0.25)));
  });
  const pin = ease.outCubic(prog(t, S3.panelIn[0], S3.panelIn[1]));
  const pOut = ease.inOutCubic(prog(t, MORPH[0], MORPH[1] - 0.25));
  const pw = panelW(t);
  css(R.wp, "width", `${pw.toFixed(1)}px`);
  // At the morph the panel moves and shrinks toward the page's What I learned, fading.
  const pRect = { x: PANEL.x, y: PANEL.y + (1 - pin) * 640, w: pw, h: PANEL.h };
  const goal = { x: 400, y: 286, w: 730, h: PANEL.h * (730 / pw) };
  const cur = rlerp(pRect, goal, pOut);
  put(R.wp, Math.min(pin * 1.5, 1) * (1 - prog(pOut, 0.6, 1)), fit({ x: PANEL.x, y: PANEL.y, w: pw, h: PANEL.h }, cur));
  R.wf.forEach((w) => {
    css(w.row, "width", `${(pw - 140).toFixed(1)}px`);
    // Each line is written as the tag passes: its front follows the tag, a little behind per line.
    const front = rideX(t) - PANEL.x - 70 - w.i * 26;
    const k = t < S3.ride[0] ? 0 : t > S3.ride[1] + 0.4 ? 1 : clamp((front - (w.textX - 70)) / w.textW);
    css(w.tw, "clipPath", k >= 1 ? "none" : `inset(-4px ${((1 - k) * 100).toFixed(2)}% -4px 0)`);
    // When the panel narrows, a long line ends with an ellipsis before its pill.
    const room = wfPill(R, w.i, t).x - (PANEL.x + w.textX) - 14;
    const cut = room < w.textW - 1;
    css(w.tw, "maxWidth", cut ? `${room.toFixed(1)}px` : "none");
    css(w.tw, "overflow", cut ? "hidden" : "visible");
    css(w.tw, "textOverflow", cut ? "ellipsis" : "clip");
    put(w.ink, k > 0 && k < 1 ? 1 : 0, tr(w.textX - 70 + w.textW * k - 40, 0));
    const pk = pop(t, factPillAt(w), 0.3);
    const pp = wfPill(R, w.i, t);
    put(w.pill, pk, `translateX(${(pp.x - PANEL.x - 70).toFixed(1)}px) scale(${(0.8 + 0.2 * pk).toFixed(3)})`);
  });
  const railK = Math.min(pin, 1 - pOut);
  const rx0 = PANEL.x + 30, rx1 = PANEL.x + pw - 30;
  const ry = PANEL.railY + (1 - pin) * 640;
  at(R.rail, rx0, ry - 6, rx1 - rx0, 12);
  put(R.rail, railK);
  at(R.capL, rx0 - 7, ry - 17); at(R.capR, rx1 - 7, ry - 17);
  put(R.capL, railK); put(R.capR, railK);
}

// When the line of fact w is complete (its pill pops then): the tag passes its end.
export function factPillAt(w) {
  const need = PANEL.x + 70 + w.textX - 70 + w.textW + w.i * 26;
  const k = clamp((need - RIDE.x0) / (RIDE.x1 - RIDE.x0));
  // Invert the ride's inOutSine easing.
  const u = Math.acos(1 - 2 * k) / Math.PI;
  return lerp(S3.ride[0], S3.ride[1], u) + 0.05;
}
