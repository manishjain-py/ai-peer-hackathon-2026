// The big world of information (DESIGN V20), drawn by code with the made-up data of world.json.
// While Ram sleeps, thousands of emails, Slack messages, tickets, code changes, docs, meetings and
// pages from the web outside fly through one deep space. His AI Peer listens, draws all of it in,
// picks out the one change that touches his work, says why it matters, and files it in his
// morning brief; the rest is left out.
//
// Every frame is a pure function of the film time: the world is laid out once from a fixed seed,
// and each frame works out where everything is at that moment (no timer, no state, no clock).
// Two canvases draw the flood, behind and in front of the Peer; the Peer, the counters, the chosen
// change and the brief are a few DOM nodes over them.
import { el, ramp, ease, lerp, clamp, envelope, prng, px } from "../lib.js";
import { markSvg } from "../mark.js";

const FW = 1920, FH = 1080, FOCAL = 1150;
const PEER = [0, -40, 0];   // the Peer sits at the middle of the world
const FACE = 230;           // its face, in world units across
const smooth = (k) => k * k * (3 - 2 * k);
const frac = (x) => x - Math.floor(x);
const fmt = (n) => Math.round(n).toLocaleString("en-US");

// What each kind of thing looks like: its tag, its pill and its light.
const LOOK = {
  email: { tag: "EMAIL", hue: "#f6f4ee", pill: "#e9e4d8" },
  slack: { tag: "SLACK", hue: "#f0c6ea", pill: "#a24fa3" },
  ticket: { tag: "TICKET", hue: "#a9c9ff", pill: "#2f7fd8" },
  code: { tag: "CODE", hue: "#c3b8ff", pill: "#6e5bd6" },
  doc: { tag: "DOC", hue: "#93e6c0", pill: "#18936b" },
  cal: { tag: "MEETING", hue: "#9fe3ec", pill: "#1f8fa3" },
  alert: { tag: "ALERT", hue: "#ffc896", pill: "#c2571a" },
  dash: { tag: "DASH", hue: "#b7f4cf", pill: "#167353" },
  web: { tag: "WEB", hue: "#bcd6f2", pill: "#4f7fb8" },
};

// ---- the pictures of the flood, drawn once ------------------------------------------------------
function rr(g, x, y, w, h, r) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function fit(g, text, max) {
  if (g.measureText(text).width <= max) return text;
  let s = text;
  while (s.length > 1 && g.measureText(s + "…").width > max) s = s.slice(0, -1);
  return s.trimEnd() + "…";
}

function wrap(g, text, max, n) {
  const words = text.split(" ");
  const lines = [];
  let cur = "";
  for (const w of words) {
    const next = cur ? cur + " " + w : w;
    if (g.measureText(next).width > max && cur) { lines.push(cur); cur = w; } else cur = next;
  }
  if (cur) lines.push(cur);
  if (lines.length > n) { lines.length = n; lines[n - 1] = fit(g, lines[n - 1] + "…", max); }
  return lines;
}

/** One picture of a thing in the flood, drawn three times: sharp for the near, smaller for the far. */
function sprite(kind, w, h, draw) {
  const lv = [1.5, 0.6, 0.25].map((sc) => {
    const c = document.createElement("canvas");
    c.width = Math.max(1, Math.ceil(w * sc));
    c.height = Math.max(1, Math.ceil(h * sc));
    const g = c.getContext("2d");
    g.scale(sc, sc);
    draw(g);
    return c;
  });
  return { kind, w, h, lv };
}

function emailCard(from, subject) {
  return sprite("email", 290, 58, (g) => {
    rr(g, 0.5, 0.5, 289, 57, 11);
    g.fillStyle = "rgba(246,244,238,0.96)";
    g.fill();
    g.strokeStyle = "#2a4248";
    g.lineWidth = 1.7;
    rr(g, 13, 19, 25, 19, 3.5);
    g.stroke();
    g.beginPath(); g.moveTo(14.5, 21); g.lineTo(25.5, 30); g.lineTo(36.5, 21); g.stroke();
    g.font = "800 12.5px Manrope"; g.fillStyle = "#167353"; g.fillText(fit(g, from, 226), 50, 24);
    g.font = "650 14px Manrope"; g.fillStyle = "#152b31"; g.fillText(fit(g, subject, 226), 50, 43);
  });
}

function slackCard(channel, who, text, tint) {
  return sprite("slack", 286, 64, (g) => {
    rr(g, 0.5, 0.5, 285, 63, 13);
    g.fillStyle = "rgba(66,16,68,0.95)";
    g.fill();
    g.strokeStyle = "rgba(240,198,234,0.42)"; g.lineWidth = 1; g.stroke();
    rr(g, 12, 16, 32, 32, 8); g.fillStyle = tint; g.fill();
    g.font = "800 16px Manrope"; g.fillStyle = "#fff"; g.textAlign = "center"; g.fillText(who[0], 28, 38); g.textAlign = "left";
    g.font = "800 12.5px Manrope"; g.fillStyle = "#f0c6ea"; g.fillText(fit(g, `#${channel}  ${who}`, 220), 55, 26);
    g.font = "600 14px Manrope"; g.fillStyle = "#ffffff"; g.fillText(fit(g, text, 220), 55, 46);
  });
}

function toolCard(kind, who, text) {
  const L = LOOK[kind];
  return sprite(kind, 304, 56, (g) => {
    rr(g, 0.5, 0.5, 303, 55, 11);
    g.fillStyle = "rgba(14,34,40,0.95)";
    g.fill();
    g.strokeStyle = "rgba(246,244,238,0.2)"; g.lineWidth = 1; g.stroke();
    rr(g, 11, 17, 68, 22, 6); g.fillStyle = L.pill; g.fill();
    g.font = "800 10.5px Manrope"; g.fillStyle = "#fff"; g.textAlign = "center"; g.fillText(L.tag, 45, 32); g.textAlign = "left";
    g.font = "800 12.5px Manrope"; g.fillStyle = L.hue; g.fillText(fit(g, who, 203), 90, 23);
    g.font = "650 14px Manrope"; g.fillStyle = "#f6f4ee"; g.fillText(fit(g, text, 203), 90, 42);
  });
}

function dashCard(title, value, seed) {
  const r = prng(seed);
  const pts = Array.from({ length: 13 }, () => r());
  return sprite("dash", 214, 118, (g) => {
    rr(g, 0.5, 0.5, 213, 117, 13);
    g.fillStyle = "rgba(14,34,40,0.95)";
    g.fill();
    g.strokeStyle = "rgba(183,244,207,0.3)"; g.lineWidth = 1; g.stroke();
    g.font = "700 12.5px Manrope"; g.fillStyle = "#9fbcb3"; g.fillText(title, 15, 25);
    g.font = "800 27px Manrope"; g.fillStyle = "#b7f4cf"; g.fillText(value, 15, 58);
    g.beginPath();
    pts.forEach((v, i) => { const x = 15 + i * 15.3, y = 102 - 26 * v; if (i) g.lineTo(x, y); else g.moveTo(x, y); });
    g.strokeStyle = "#b7f4cf"; g.lineWidth = 2.2; g.lineJoin = "round"; g.stroke();
  });
}

function webCard(kind, site, headline) {
  const badge = { NEWS: "#4f7fb8", STATUS: /normal/i.test(headline) ? "#2e8b62" : "#b7791f", NOTICE: "#8a6bc4" }[kind] || "#4f7fb8";
  // a page in a browser window: light, with a blue title bar, so the web reads apart from the company
  return sprite("web", 348, 156, (g) => {
    rr(g, 0.5, 0.5, 347, 155, 13);
    g.fillStyle = "rgba(226,236,248,0.96)";
    g.fill();
    g.save(); g.clip(); g.fillStyle = "#3f6fa6"; g.fillRect(0, 0, 348, 30); g.restore();
    rr(g, 0.5, 0.5, 347, 155, 13);
    g.strokeStyle = "rgba(160,196,236,0.7)"; g.lineWidth = 1; g.stroke();
    for (let i = 0; i < 3; i++) { g.beginPath(); g.arc(16 + i * 12, 15, 3.6, 0, Math.PI * 2); g.fillStyle = "rgba(255,255,255,0.75)"; g.fill(); }
    g.font = "700 12px Manrope"; g.fillStyle = "#eef5fd"; g.fillText(fit(g, site, 200), 56, 19.5);
    g.font = "800 10px Manrope";
    const bw = g.measureText(kind).width + 14;
    rr(g, 348 - 12 - bw, 7, bw, 17, 5); g.fillStyle = "rgba(255,255,255,0.94)"; g.fill();
    g.fillStyle = badge; g.textAlign = "center"; g.fillText(kind, 348 - 12 - bw / 2, 19.5); g.textAlign = "left";
    g.font = "800 17px Manrope"; g.fillStyle = "#15263d";
    wrap(g, headline, 316, 2).forEach((line, i) => g.fillText(line, 16, 58 + i * 22));
    g.fillStyle = "rgba(63,111,166,0.22)";
    rr(g, 16, 112, 300, 8, 4); g.fill();
    rr(g, 16, 128, 220, 8, 4); g.fill();
  });
}

function channelTag(name) {
  return sprite("slack", 250, 34, (g) => {
    g.beginPath(); g.arc(12, 17, 6, 0, Math.PI * 2); g.fillStyle = "#f0c6ea"; g.fill();
    g.font = "800 17px Manrope"; g.fillStyle = "rgba(240,198,234,0.95)"; g.fillText(`#${name}`, 26, 23);
  });
}

// ---- time ------------------------------------------------------------------------------------
/** How fast the flood moves: full speed, slower once the one change is found, slow at the end. */
function speed(local, B) {
  const a = lerp(1, 0.36, smooth(ramp(local, B.pick, B.pick + 1.1)));
  return lerp(a, 0.2, smooth(ramp(local, B.brief[0], B.brief[1] + 1)));
}

/** The flood's own clock: the sum of its speed from the slot's start (fixed steps, so every worker agrees). */
function flowTime(local, B) {
  const dt = 1 / 120;
  let tau = 0, s = 0;
  while (s + dt <= local) { tau += speed(s + dt / 2, B) * dt; s += dt; }
  return tau + speed((s + local) / 2, B) * Math.max(0, local - s);
}

/** The camera: it glides into the world, then turns to make room for what the Peer found. */
function cameraAt(local, B) {
  const z = -2650 + 1350 * ease.inOut(ramp(local, 0, 7.6)) + 16 * Math.max(0, local - 7.6);
  const x = 470 * ease.inOut(ramp(local, B.open[0] - 0.3, B.open[1] + 0.4)) + 5 * Math.max(0, local - B.open[1]);
  const yaw = -0.085 + 0.011 * local;
  return { x, y: -10, z, cy: Math.cos(yaw), sy: Math.sin(yaw), yaw };
}

function project(cam, x, y, z, o) {
  const xr = x * cam.cy - z * cam.sy;
  const zr = x * cam.sy + z * cam.cy;
  const dz = zr - cam.z;
  if (dz < 60) return false;
  const k = FOCAL / dz;
  o.x = FW / 2 + (xr - cam.x) * k;
  o.y = FH / 2 + (y - cam.y) * k;
  o.k = k; o.dz = dz; o.zr = zr;
  return true;
}

// ---- the world, laid out once ---------------------------------------------------------------
function layout(S) {
  const rnd = prng(S.seed || 20261106);
  const R = (a, b) => a + (b - a) * rnd();
  const pickOf = (arr) => arr[Math.floor(rnd() * arr.length)];
  const jit = (p, j) => [p[0] + R(-j, j), p[1] + R(-j, j) * 0.8, p[2] + R(-j, j)];
  const items = [];
  const add = (A, C, Bp, sp, dur, size) => {
    // the path the Peer draws it along: from where it starts, curling into the Peer like water into a drain
    const dx = PEER[0] - A[0], dy = PEER[1] - A[1], dz = PEER[2] - A[2];
    const C2 = [(A[0] + PEER[0]) / 2 - dy * 0.62, (A[1] + PEER[1]) / 2 + dx * 0.62, (A[2] + PEER[2]) / 2];
    const far = Math.hypot(dx, dy, dz);
    items.push({ A, C, B: Bp, C2, sp, hue: LOOK[sp.kind].hue, dur, size, phase: rnd(), delay: 0.85 * clamp(far / 7500) + R(0, 0.25),
      fog: sp.kind === "web" ? 0.42 : 0.12 });
  };

  const mails = S.emails.map(([f, s]) => emailCard(f, s));
  const tints = ["#e8912d", "#2eb67d", "#36c5f0", "#e01e5a", "#ecb22e", "#7c5cff", "#16a3a3"];
  const chats = S.slack.map(([c, w, t], i) => slackCard(c, w, t, tints[i % tints.length]));
  const tools = S.tools.map(([k, w, t]) => toolCard(k, w, t));
  const dashes = S.dashboards.map(([t, v], i) => dashCard(t, v, 77 + i));
  const webs = S.web.map(([k, s, h]) => webCard(k, s, h));

  // a river is a ribbon: its things share one path, give or take, and it snakes as it goes
  const river = (n, A, C, Bp, j, pool, dur, size, wob) => {
    for (let i = 0; i < n; i++) {
      add(jit(A, j), jit(C, j * 1.3), jit(Bp, j), pickOf(pool), R(dur[0], dur[1]), size * R(0.85, 1.15));
      items[items.length - 1].wob = wob;
    }
  };
  // email in two rivers, one each way across the frame; the work tools in two more
  river(150, [-4800, -200, 4800], [-1000, 380, 1900], [2900, 760, -700], 420, mails, [2.4, 3.6], 1, [380, 260, 9.0, 0.4]);
  river(130, [4600, -1300, 5200], [1300, -1100, 2200], [-2900, -800, -600], 420, mails, [2.6, 3.8], 1, [340, 300, 7.5, 2.1]);
  river(90, [3800, 1500, 5000], [1000, 900, 2200], [-2500, 1150, -500], 450, tools, [3.0, 4.6], 1, [300, 240, 8.0, 4.0]);
  river(80, [-4000, -1500, 5600], [-1300, -450, 2600], [2700, 250, -500], 450, tools, [3.2, 4.8], 1, [320, 200, 6.5, 5.2]);

  // Slack: channels that keep sending messages out in every direction
  const nodes = [[-1500, -600, 1400], [-600, -950, 2400], [500, -1000, 1800], [1500, -700, 2800], [2000, -100, 1600],
    [-2200, 200, 2600], [-1200, 700, 1900], [1300, 650, 2300], [300, 1000, 3200]];
  const tags = nodes.map((N, i) => ({ N, sp: channelTag(S.channels[i % S.channels.length]) }));
  nodes.forEach((N) => {
    for (let i = 0; i < 16; i++) {
      const a = rnd() * Math.PI * 2, r = R(700, 1300);
      const d = [Math.cos(a), Math.sin(a) * 0.75, R(-0.5, 0.3)];
      const Bp = [N[0] + d[0] * r, N[1] + d[1] * r, N[2] + d[2] * r];
      const C = [N[0] + d[0] * r * 0.45, N[1] + d[1] * r * 0.45 - 160, N[2] + d[2] * r * 0.45];
      add(jit(N, 60), C, Bp, pickOf(chats), R(1.9, 3.2), R(0.85, 1.1));
    }
  });

  // a few things close by, gliding out past the camera on both sides: the space is deep
  const near = [...mails, ...chats, ...tools];
  for (let i = 0; i < 26; i++) {
    const side = i % 2 ? 1 : -1;
    const A = [side * R(700, 1500), R(-800, 800), R(1400, 2200)];
    const Bp = [side * R(2200, 3000), A[1] * 1.6, R(-1300, -900)];
    add(A, [(A[0] + Bp[0]) / 2, (A[1] + Bp[1]) / 2, (A[2] + Bp[2]) / 2], Bp, pickOf(near), R(2.6, 3.6), R(1.1, 1.35));
  }

  // dashboards drifting slowly in the middle distance
  for (let i = 0; i < 30; i++) {
    const A = [R(-2800, 2800), R(-1500, 1500), R(900, 3800)];
    const d = [R(-500, 500), R(-300, 300), R(-600, 200)];
    add(A, [A[0] + d[0] / 2, A[1] + d[1] / 2 - 80, A[2] + d[2] / 2], [A[0] + d[0], A[1] + d[1], A[2] + d[2]], pickOf(dashes), R(4.5, 7), R(0.9, 1.15));
  }

  // the web outside the company: pages on a far shell around everything, turning slowly
  for (let i = 0; i < 110; i++) {
    const th = rnd() * Math.PI * 2, d = R(0.22, 0.45) * (rnd() < 0.5 ? -1 : 1);
    const r = R(2600, 5800), z = R(2600, 6200);
    const at = (a, rad) => [Math.cos(a) * rad, Math.sin(a) * rad * 0.62, z];
    add(at(th, r), at(th + d / 2, r * 1.06), at(th + d, r), pickOf(webs), R(6, 10), R(1.5, 2.0));
  }

  // the web's own wiring, far behind, and dust for depth
  const net = Array.from({ length: 130 }, () => {
    const th = rnd() * Math.PI * 2, r = R(1800, 9500);
    return [Math.cos(th) * r, Math.sin(th) * r * 0.62, R(6500, 9800)];
  });
  const edges = [];
  net.forEach((p, i) => {
    const near = net.map((q, j) => [j, (q[0] - p[0]) ** 2 + (q[1] - p[1]) ** 2 + (q[2] - p[2]) ** 2])
      .filter(([j]) => j !== i).sort((a, b) => a[1] - b[1]).slice(0, 2);
    for (const [j] of near) if (!edges.some(([a, b]) => (a === i && b === j) || (a === j && b === i))) edges.push([i, j, rnd(), R(0.25, 0.6)]);
  });
  const fibres = Array.from({ length: 18 }, () => [Math.floor(rnd() * net.length), rnd(), R(0.3, 0.55)]);
  const dust = Array.from({ length: 1500 }, () => [R(-5200, 5200), R(-3200, 3200), R(-1200, 9000), R(0.6, 1.8), rnd() * 6.283, R(0.4, 1.6)]);
  // a few pages of the web, nearer and larger, drifting in from the left and right edges, so the
  // web outside the company reads as clearly as its own streams (wp2-6). Made last, so their random
  // numbers leave everything above where it was.
  for (let i = 0; i < 10; i++) {
    const side = i % 2 ? 1 : -1;
    const y = R(-900, 700), z = R(500, 1500);
    const A = [side * R(2300, 2900), y, z];
    const Bp = [side * R(1100, 1600), y + R(-150, 150), z - R(150, 450)];
    add(A, [(A[0] + Bp[0]) / 2, (A[1] + Bp[1]) / 2 - 70, (A[2] + Bp[2]) / 2], Bp, pickOf(webs), R(6.5, 9.5), R(1.2, 1.5));
    items[items.length - 1].fog = 0.6;
  }
  return { items, tags, net, edges, fibres, dust };
}

// ---- the scene ---------------------------------------------------------------------------------
export function world(S, film, slot) {
  const peerName = (film.names && film.names.peer) || "AI Peer";
  const B = S.beats;
  const chapter = S.chapter ? S.chapter.length : 0;
  const W = layout(S);

  const back = el("canvas.wcv");
  const front = el("canvas.wcv");
  const DPR=Math.min(2,window.devicePixelRatio||1);
  for (const c of [back, front]) { c.width = FW*DPR; c.height = FH*DPR; }
  const gb = back.getContext("2d");
  const gf = front.getContext("2d");
  gb.scale(DPR,DPR); gf.scale(DPR,DPR);

  // the Peer: its face, a glow, and rings that go out while it listens
  const glow = el("div.wpglow");
  const rings = [0, 1, 2].map(() => el("div.wpring"));
  const face = el("div.wpface", { style: { backgroundImage: `url("${S.peer_face}")` } });
  const peer = el("div.wpeer", {}, glow, ...rings, face);
  const tag = el("div.wptag", {}, el("span", { text: peerName }));

  // what is coming in, counted
  const counters = S.counters.map((c) => {
    const num = el("b.wnum");
    const chip = el("div.wchip", {}, el("i", { style: { background: LOOK[c.kind].pill } }), el("div", {}, num, el("span.wlab", { text: c.label })));
    return { c, num, chip };
  });
  const hud = el("div.whud", {}, counters.map((x) => x.chip));

  // the one change: a chip in the flood, then lifted out and opened
  const P0 = S.pick;
  const ping = el("div.wping");
  const chip = el("div.wpick", {}, el("span.wtag", { text: P0.tag }),
    el("div.wpx", {}, el("div.wpw", { text: P0.team }), el("div.wpt", { text: `${P0.title}: ${P0.from} to ${P0.to} ${P0.when}` })), ping);
  const arrow = '<svg width="44" height="30" viewBox="0 0 44 30"><path d="M3 15h34M27 5l10 10-10 10" fill="none" stroke="#167353" stroke-width="4.5" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  const why = el("div.wcw", {}, el("b", { text: "Why it matters" }), el("span", { text: P0.why }));
  const one = el("div.wone", {}, el("span", { html: markSvg({ size: 30 }) }), el("span", { text: P0.one }));
  const card = el("div.wcard", {},
    el("div.wch", {}, el("span.wtag", { text: P0.tag }), el("span", { text: `${P0.team} · ${P0.time}` })),
    el("div.wct", { text: P0.title }),
    el("div.wcn", {}, el("span.wold", { text: P0.from }), el("span.warr", { html: arrow }), el("span.wnew", { text: P0.to }), el("span.wwhen", { text: P0.when })),
    why);
  const open = el("div.wopen", {}, one, card);
  const OPEN = { x: 896, y: 262, w: 688 };

  // the morning brief, in its own look
  const Bf = S.brief;
  const leftNum = el("b");
  const left = el("div.wbleft", {}, leftNum, el("span", { text: Bf.left_text }));
  const slotCard = el("div.wbcard", {}, el("div.wbcat", { text: Bf.card.cat }), el("div.wbtit", { text: Bf.card.title }),
    el("div.wbwhy", {}, el("b", { text: "Why it matters" }), el("span", { text: Bf.card.why })));
  const brief = el("div.wbrief", {},
    el("div.wbh", {}, el("span", { html: markSvg({ size: 46 }) }), el("div", {}, el("div.wbt", { text: Bf.title }), el("div.wbsub", { text: Bf.sub }))),
    el("div.wbsec.acc-green", { style: { top: "128px" } }, el("i"), el("span", { text: "What I did" })),
    ...Bf.did.map(([when, what], i) => el("div.wbmini", { style: { top: `${170 + i * 60}px` } }, el("span", { text: when }), el("span", { text: what }))),
    el("div.wbsec.acc-blue", { style: { top: "302px" } }, el("i"), el("span", { text: "What I learned" })),
    slotCard, left);
  const SLOT = { x: 860 + 36, y: 140 + 344, w: 688 };

  const warm = el("div.wwarm");
  const dim = el("div.wdim");
  const node = el("div.world", {}, back, peer, front, tag, warm, hud, brief, chip, open, dim);
  const boxes = { why, left };

  const TA = flowTime(3.3, B), TB = flowTime(B.open[0], B);
  const P = { x: 0, y: 0, k: 1, dz: 1, zr: 0 };
  const o = { x: 0, y: 0, k: 1, dz: 1, zr: 0 };
  const q = [0, 0, 0];

  function where(it, u, b, out) {
    const v = 1 - u, a = v * v, m = 2 * v * u, c = u * u;
    for (let i = 0; i < 3; i++) {
      const f = a * it.A[i] + m * it.C[i] + c * it.B[i];
      out[i] = b > 0 ? f + (a * it.A[i] + m * it.C2[i] + c * PEER[i] - f) * b : f;
    }
    if (it.wob) {
      // the river's own bends (up and down, in and out), gone once the Peer draws it in
      const [ay, az, fq, ph] = it.wob, k = 1 - b;
      out[1] += ay * Math.sin(u * fq + ph) * k;
      out[2] += az * Math.cos(u * fq * 0.7 + ph) * k;
    }
  }

  function render(local) {
    const cam = cameraAt(local, B);
    const tau = flowTime(local, B);
    const spd = speed(local, B);
    project(cam, PEER[0], PEER[1], PEER[2], P);
    const fade = smooth(ramp(local, B.fade[0], B.fade[1]));
    const warmK = smooth(ramp(local, B.warm[0], B.warm[1]));
    const found = smooth(ramp(local, B.pick, B.pick + 0.9));
    const flood = (1 - 0.35 * found) * lerp(1, 0.1, fade);
    const rk = ramp(local, B.listen, B.listen + 1.6);
    const rippleR = lerp(30, 1800, ease.out(rk));
    const rippleA = rk > 0 && rk < 1 ? 1 - rk : 0;

    // -- the sky: deep teal night, a little warmer at the end
    const mix = (a, b2) => `rgb(${a.map((v, i) => Math.round(lerp(v, b2[i], warmK))).join(",")})`;
    // the light sits on the Peer, then moves over to the brief as morning comes
    const sx = lerp(P.x, 1240, warmK), sy = lerp(P.y, 470, warmK);
    const sky = gb.createRadialGradient(sx, sy, 0, sx, sy, lerp(1500, 1700, warmK));
    sky.addColorStop(0, mix([26, 58, 66], [74, 108, 106]));
    sky.addColorStop(0.45, mix([12, 31, 37], [38, 72, 76]));
    sky.addColorStop(1, mix([5, 13, 17], [17, 38, 43]));
    gb.globalCompositeOperation = "source-over";
    gb.globalAlpha = 1;
    gb.fillStyle = sky;
    gb.fillRect(0, 0, FW, FH);
    const drift = -cam.x * 0.12 - cam.yaw * 700;
    for (const [nx, ny, nr, col] of [[300, 260, 760, "47,98,108,0.30"], [1620, 300, 680, "64,86,150,0.20"], [1300, 900, 820, "47,98,108,0.22"], [520, 860, 620, "183,244,207,0.05"]]) {
      const cx = nx + drift, g = gb.createRadialGradient(cx, ny, 0, cx, ny, nr);
      g.addColorStop(0, `rgba(${col})`);
      g.addColorStop(1, "rgba(0,0,0,0)");
      gb.fillStyle = g;
      gb.fillRect(cx - nr, ny - nr, nr * 2, nr * 2);
    }
    gf.clearRect(0, 0, FW, FH);

    // -- dust and the web's wiring, far behind (light adds up)
    gb.globalCompositeOperation = "lighter";
    gb.fillStyle = warmK > 0 ? mix([170, 215, 205], [255, 214, 170]) : "rgb(170,215,205)";
    for (const d of W.dust) {
      if (!project(cam, d[0], d[1], d[2], o)) continue;
      if (o.x < -4 || o.x > FW + 4 || o.y < -4 || o.y > FH + 4) continue;
      const s = Math.max(0.7, d[3] * o.k * 2.2);
      gb.globalAlpha = clamp(1.1 - o.dz / 9000, 0.08, 0.7) * (0.55 + 0.45 * Math.sin(local * d[5] + d[4])) * ramp(o.dz, 80, 400) * lerp(1, 0.6, fade);
      gb.fillRect(o.x - s / 2, o.y - s / 2, s, s);
    }
    const npos = W.net.map((p) => (project(cam, p[0], p[1], p[2], o) ? [o.x, o.y, o.k] : null));
    gb.lineWidth = 1;
    gb.strokeStyle = "#8fb3d9";
    gb.globalAlpha = 0.18 * lerp(1, 0.4, fade);
    gb.beginPath();
    for (const [i, j] of W.edges) { const a = npos[i], b2 = npos[j]; if (a && b2) { gb.moveTo(a[0], a[1]); gb.lineTo(b2[0], b2[1]); } }
    gb.stroke();
    gb.fillStyle = "#d6e8ff";
    for (const [i, j, ph, sp] of W.edges) {
      const a = npos[i], b2 = npos[j];
      if (!a || !b2) continue;
      const k = frac(ph + tau * sp);
      gb.globalAlpha = 0.55 * Math.sin(Math.PI * k) * lerp(1, 0.3, fade);
      gb.fillRect(lerp(a[0], b2[0], k) - 1.5, lerp(a[1], b2[1], k) - 1.5, 3, 3);
    }
    // once the Peer listens, the web's wires run into it too
    const wired = smooth(ramp(local, B.pull[0], B.pull[1] + 0.6)) * lerp(1, 0.25, fade);
    if (wired > 0) {
      for (const [i, ph, sp] of W.fibres) {
        const a = npos[i];
        if (!a) continue;
        const mx = (a[0] + P.x) / 2 + (P.y - a[1]) * 0.25, my = (a[1] + P.y) / 2 - (P.x - a[0]) * 0.25;
        gb.globalAlpha = 0.16 * wired;
        gb.strokeStyle = "#9fd8c4";
        gb.beginPath(); gb.moveTo(a[0], a[1]); gb.quadraticCurveTo(mx, my, P.x, P.y); gb.stroke();
        for (let n = 0; n < 2; n++) {
          const k = frac(ph + n / 2 + tau * sp), w1 = (1 - k) * (1 - k), w2 = 2 * (1 - k) * k, w3 = k * k;
          gb.globalAlpha = 0.8 * wired * Math.sin(Math.PI * k);
          gb.fillStyle = "#c8f7df";
          gb.fillRect(w1 * a[0] + w2 * mx + w3 * P.x - 2, w1 * a[1] + w2 * my + w3 * P.y - 2, 4, 4);
        }
      }
    }

    // -- the flood: where every thing is now, nearest drawn last
    const list = [];
    for (const it of W.items) {
      const u = frac(it.phase + tau / it.dur);
      const b = smooth(ramp(local, B.pull[0] + it.delay, B.pull[1] + it.delay));
      const envFree = smooth(ramp(u, 0, 0.1)) * (1 - smooth(ramp(u, 0.86, 1)));
      const envIn = smooth(ramp(u, 0, 0.1)) * (1 - smooth(ramp(u, 0.9, 0.995)));
      const env = lerp(envFree, envIn, b);
      if (env <= 0.004) continue;
      const shrink = lerp(1, lerp(1, 0.3, smooth(ramp(u, 0.5, 1))), b);
      // near the Peer a thing turns into mint light: heard, and understood
      const mint = b * smooth(ramp(u, 0.36, 0.76));
      where(it, u, b, q);
      if (!project(cam, q[0], q[1], q[2], o)) continue;
      const s = o.k * it.size * shrink;
      const w = it.sp.w * s, h = it.sp.h * s;
      if (o.x + w / 2 < 0 || o.x - w / 2 > FW || o.y + h / 2 < 0 || o.y - h / 2 > FH) continue;
      let al = env * clamp(1.25 - o.dz / 8000, it.fog, 1) * ramp(o.dz, 140, 520) * lerp(flood, Math.max(flood, 0.85 * lerp(1, 0.25, fade)), mint);
      if (rippleA > 0) {
        const dd = Math.hypot(o.x - P.x, o.y - P.y) - rippleR;
        al *= 1 + 0.9 * rippleA * Math.exp(-(dd * dd) / (120 * 120));
      }
      al = clamp(al);
      if (al <= 0.01) continue;
      // a short streak behind it, as far as it went in the last moment
      const up = u - (0.16 * spd * lerp(1, 2.4, b)) / it.dur;
      let tx = NaN, ty = NaN;
      if (up > 0) {
        where(it, up, b, q);
        const x0 = o.x, y0 = o.y, k0 = o.k, dz0 = o.dz, zr0 = o.zr;
        if (project(cam, q[0], q[1], q[2], o)) { tx = o.x; ty = o.y; }
        o.x = x0; o.y = y0; o.k = k0; o.dz = dz0; o.zr = zr0;
      }
      list.push({ it, x: o.x, y: o.y, w, h, s, al, mint, dz: o.dz, front: o.zr < 0, tx, ty });
    }
    list.sort((a, b) => b.dz - a.dz);
    for (const g of [gb, gf]) {
      // light first (streaks, and the mint of things the Peer is taking in), then the things themselves
      g.globalCompositeOperation = "lighter";
      g.lineCap = "round";
      const inFront = g === gf;
      for (const d of list) {
        if (d.front !== inFront) continue;
        if (!Number.isNaN(d.tx)) {
          g.globalAlpha = d.al * lerp(0.34, 0.6, d.mint);
          g.strokeStyle = d.mint > 0.5 ? "#b7f4cf" : d.it.hue;
          g.lineWidth = Math.max(0.8, Math.min(d.h * 0.09, 3.2)) * lerp(1, 1.6, d.mint);
          g.beginPath(); g.moveTo(d.tx, d.ty); g.lineTo(d.x, d.y); g.stroke();
        }
        if (d.mint > 0.02) {
          g.globalAlpha = d.al * d.mint;
          g.fillStyle = "#b7f4cf";
          g.beginPath(); g.arc(d.x, d.y, Math.max(1.6, Math.min(d.w * 0.05, 9)), 0, Math.PI * 2); g.fill();
        }
      }
      g.globalCompositeOperation = "source-over";
      for (const d of list) {
        if (d.front !== inFront) continue;
        const a = d.al * (1 - d.mint);
        if (a <= 0.01) continue;
        g.globalAlpha = a;
        if (d.w < 6) { g.fillStyle = d.it.hue; g.fillRect(d.x - d.w / 2, d.y - d.h / 2, Math.max(1, d.w), Math.max(1, d.h)); continue; }
        const lv = d.s > 0.7 ? 0 : d.s > 0.28 ? 1 : 2;
        g.drawImage(d.it.sp.lv[lv], d.x - d.w / 2, d.y - d.h / 2, d.w, d.h);
      }
    }
    // the Slack channels' names, where their messages come from
    gb.globalCompositeOperation = "source-over";
    for (const t of W.tags) {
      if (!project(cam, t.N[0], t.N[1], t.N[2], o)) continue;
      const s = o.k * 1.25;
      gb.globalAlpha = 0.85 * clamp(1.25 - o.dz / 8000, 0.14, 1) * lerp(1, 0.15, smooth(ramp(local, B.pull[0], B.pull[1] + 0.5)));
      if (gb.globalAlpha < 0.01) continue;
      gb.drawImage(t.sp.lv[s > 0.7 ? 0 : 1], o.x - 12 * s, o.y - 17 * s, t.sp.w * s, t.sp.h * s);
    }

    // -- the moment the Peer starts to listen: a wave goes out through everything
    gf.globalCompositeOperation = "source-over";
    for (const [lag, a0] of [[0, 0.6], [0.32, 0.3]]) {
      const k = ramp(local, B.listen + lag, B.listen + lag + 1.6);
      if (k <= 0 || k >= 1) continue;
      gf.globalAlpha = a0 * (1 - k);
      gf.strokeStyle = "#b7f4cf";
      gf.lineWidth = lerp(7, 2, k);
      gf.beginPath(); gf.arc(P.x, P.y, lerp(30, 1800, ease.out(k)), 0, Math.PI * 2); gf.stroke();
    }

    // -- the Peer
    const wake = ease.out(ramp(local, B.listen - 0.05, B.listen + 0.55));
    const intake = smooth(ramp(local, B.pull[0], B.pull[1] + 0.4)) * lerp(1, 0.45, fade);
    peer.style.transform = `translate(${px(P.x)}, ${px(P.y)}) scale(${P.k.toFixed(4)})`;
    face.style.opacity = wake.toFixed(3);
    face.style.transform = `scale(${lerp(0.55, 1, ease.outBack(ramp(local, B.listen, B.listen + 0.65))).toFixed(4)})`;
    glow.style.opacity = (0.3 + 0.4 * wake + 0.3 * intake).toFixed(3);
    glow.style.transform = `scale(${(0.55 + 0.35 * wake + 0.35 * intake + 0.03 * Math.sin(local * 4.4)).toFixed(4)})`;
    const listening = wake * lerp(1, 0.35, fade);
    rings.forEach((r, i) => {
      const ph = frac(local * 0.55 + i / 3);
      r.style.transform = `scale(${(1.02 + ph * 1.5).toFixed(4)})`;
      r.style.opacity = ((1 - ph) * (1 - ph) * 0.7 * listening).toFixed(3);
    });
    tag.style.opacity = (ease.out(ramp(local, B.listen + 0.3, B.listen + 0.8)) * lerp(1, 0.75, fade)).toFixed(3);
    tag.style.transform = `translate(${px(P.x)}, ${px(P.y + (FACE / 2) * P.k + 26)}) translateX(-50%)`;

    // -- the counters, while the flood is the story
    const hv = Math.min(1, 1 - smooth(ramp(local, B.open[0] + 0.7, B.open[1] + 0.5)));
    hud.style.opacity = hv.toFixed(3);
    hud.style.transform = `translateX(-50%) translateY(${lerp(-10, 0, hv).toFixed(1)}px)`;
    for (const x of counters) x.num.textContent = fmt(x.c.from + x.c.per_s * local);

    // -- the one change: in the flood, lit when the Peer hears it, then lifted out and opened
    const p = clamp((tau - TA) / (TB - TA));
    const cs = lerp(0.78, 1.0, p);
    let x = lerp(1660, 1360, p) - 180 * cs, y = lerp(650, 600, p) - 36 * cs, wd = 360 * cs;
    const ok = ease.inOut(ramp(local, B.open[0], B.open[1]));
    x = lerp(x, OPEN.x, ok); y = lerp(y, OPEN.y, ok); wd = lerp(wd, OPEN.w, ok);
    const lit = ease.out(ramp(local, B.pick - 0.1, B.pick + 0.35));
    chip.style.opacity = (Math.min(ease.out(ramp(local, 3.3, 3.8)), 1 - ramp(ok, 0.15, 0.5))).toFixed(3);
    chip.style.transform = `translate(${px(x)}, ${px(y)}) scale(${(wd / 360).toFixed(4)})`;
    chip.style.borderColor = `rgba(183,244,207,${lerp(0.18, 1, lit).toFixed(3)})`;
    chip.style.boxShadow = `0 0 ${Math.round(40 * lit)}px rgba(183,244,207,${(0.75 * lit).toFixed(3)}), 0 0 0 ${(2 * lit).toFixed(2)}px rgba(183,244,207,${lit.toFixed(3)})`;
    const pk = ramp(local, B.pick, B.pick + 0.9);
    ping.style.opacity = (pk > 0 && pk < 1 ? 0.9 * (1 - pk) : 0).toFixed(3);
    ping.style.transform = `scale(${lerp(1, 1.9, ease.out(pk)).toFixed(4)})`;

    // into the brief: the open card slides down into its place and becomes the brief's own card
    const ib = ease.inOut(ramp(local, B.brief[0] + 0.3, B.brief[1]));
    const ox = lerp(x, SLOT.x, ib), oy = lerp(y, SLOT.y, ib), ow = lerp(wd, SLOT.w, ib);
    open.style.transform = `translate(${px(ox)}, ${px(oy)}) scale(${(ow / OPEN.w).toFixed(4)})`;
    // it stays solid while it drops, and gives way to the brief's own card only once they lie on
    // top of each other (wp2-6: an earlier fade showed its text over the brief's list)
    open.style.opacity = (ramp(ok, 0.2, 0.62) * (1 - ramp(ib, 0.84, 0.99))).toFixed(3);
    one.style.opacity = (ease.out(ramp(local, B.open[1] + 0.05, B.open[1] + 0.45)) * (1 - ramp(local, B.brief[0] - 0.2, B.brief[0] + 0.3))).toFixed(3);
    const bin = ease.out(ramp(local, B.brief[0], B.brief[0] + 0.8));
    brief.style.opacity = bin.toFixed(3);
    brief.style.transform = `translateX(${lerp(80, 0, bin).toFixed(1)}px) scale(${(lerp(0.97, 1, bin) * lerp(1, 1.03, smooth(ramp(local, B.brief[1], 18)))).toFixed(4)})`;
    slotCard.style.opacity = ramp(ib, 0.8, 0.97).toFixed(3);
    left.style.opacity = ease.out(ramp(local, B.brief[1] - 0.2, B.brief[1] + 0.3)).toFixed(3);
    leftNum.textContent = fmt(Bf.left_out * ease.out(ramp(local, B.brief[1] - 0.2, B.brief[1] + 0.6)));

    // a thread of light from the Peer to what it found, while it explains it and files it
    const th = envelope(local, B.open[0] + 0.2, B.brief[1] + 0.2, 0.5, 0.5);
    if (th > 0) {
      const ax = P.x + (FACE / 2) * P.k * 0.98, ay = P.y;
      const bx = ox, by = oy + 44 * (ow / OPEN.w);
      const mx = (ax + bx) / 2, my = Math.min(ay, by) - 60;
      gf.globalCompositeOperation = "lighter";
      gf.globalAlpha = 0.45 * th;
      gf.strokeStyle = "#b7f4cf";
      gf.lineWidth = 2.5;
      gf.beginPath(); gf.moveTo(ax, ay); gf.quadraticCurveTo(mx, my, bx, by); gf.stroke();
      gf.fillStyle = "#e6fff0";
      for (let n = 0; n < 3; n++) {
        const k = frac(local * 0.7 + n / 3), w1 = (1 - k) * (1 - k), w2 = 2 * (1 - k) * k, w3 = k * k;
        gf.globalAlpha = th * Math.sin(Math.PI * k);
        gf.beginPath(); gf.arc(w1 * ax + w2 * mx + w3 * bx, w1 * ay + w2 * my + w3 * by, 3.2, 0, Math.PI * 2); gf.fill();
      }
      gf.globalCompositeOperation = "source-over";
    }

    for (const lab of S.labels || []) {
      const box = boxes[lab.box];
      if (!box) continue;
      const e = envelope(local, lab.at - 0.1, lab.at + lab.length, 0.35, 0.3);
      box.style.boxShadow = `0 0 0 3px rgba(22,115,83,${(0.9 * e).toFixed(3)}), 0 0 26px rgba(183,244,207,${(0.8 * e).toFixed(3)})`;
      box.style.backgroundColor = `rgba(183,244,207,${(0.28 * e).toFixed(3)})`;
    }

    warm.style.opacity = warmK.toFixed(3);
    // dark under the chapter card, lifting as the card leaves (as windowDim does for a window)
    dim.style.opacity = (chapter ? 0.62 * (1 - ease.inOut(ramp(local, chapter - 0.45, chapter))) : 0).toFixed(3);
  }
  return { node, render, full: true };
}
