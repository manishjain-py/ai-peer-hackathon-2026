// Little Peer: a friendly little character does the work in front of you. Today's page, a click,
// the Peer pops out of the button and reads each source as Ram, writes its notes, builds the
// brief, answers a question and shows its rules, then hops home into the button.
import { el, prog, ease, keys, clamp, spring, pulse, noise } from "../shared/kit.js";
import { todayPage, pointer, centre } from "../shared/page.js";
import { sourceIcon } from "../shared/icons.js";
import { CAM, CAPTIONS, CLICK, POP, PAGE_AWAY, R, WIDS, FOLD, END, ASK } from "./tl.js";
import { defs, buildPeer } from "./peer.js";
import { buildProps } from "./props.js";
import { buildWidgets, measureWidgets, renderWidgets, DEEP } from "./widgets.js";
import { buildNotebook, measureNotebook, renderNotebook } from "./notebook.js";
import { buildHud, hudRowCentres, renderHud } from "./hud.js";
import { buildBoard, renderBoard } from "./board.js";
import { buildAsk, renderAsk } from "./ask.js";
import { buildRules, renderRules } from "./rules.js";
import { buildBg, renderBg } from "./bg.js";
import { buildMotion } from "./motion.js";

const STRIP = {
  directory: "Ram · Staff Engineer · Host Payouts",
  docs: "Payout retry v2 · design doc · by Ram",
  slack: "Retry v2 is live for 10% of payouts in Mexico",
  code: "PR #4182 · Retry limit per market",
  tickets: "INC-20431 · Partner bank outage, Brazil",
  mail: "Brazil fraud threshold drops on Thursday",
};

const CSS = `
.lp-layer { position: absolute; left: 0; top: 0; width: 1920px; height: 1080px; transform-origin: 0 0; }
.lp-actor svg { position: absolute; left: 0; top: 0; overflow: visible; }
.lp-strip { position: absolute; left: 0; top: 0; display: flex; align-items: center; gap: 8px; padding: 9px 14px 9px 11px; border-radius: 11px;
  background: #fffef4; font: 650 17px/1 "Inter", sans-serif; color: #1d2a24; white-space: nowrap; transform-origin: 50% 50%;
  box-shadow: 0 0 0 2px rgba(183,244,207,.95), 0 0 28px 6px rgba(140,235,180,.62), 0 12px 20px -10px rgba(0,0,0,.28); }
.lp-strip svg { width: 17px; height: 17px; flex: none; }
.lp-pagewrap { position: absolute; inset: 0; transform-origin: 50% 46%; }
`;

let GW, pg, ptr, btnAt, bg, world, back, front, actor, svg, peer, props, W, N, G, H, B, A, RU, motion, strips = [], hudFold = {}, vig;

const camAt = (t) => {
  const [cx, cy, s] = keys(t, CAM, ease.inOutSine);
  // A slow handheld drift, and a small shake when the stamp lands.
  const sh = t > ASK.stamp ? Math.exp(-14 * (t - ASK.stamp)) * Math.sin((t - ASK.stamp) * 70) * 6 : 0;
  return [cx + noise(t * 0.22, 7) * 5 + sh, cy + noise(t * 0.19, 9) * 4 - sh * 0.6, s * (1 + noise(t * 0.15, 13) * 0.003), rollAt(t) + sh * 0.05];
};
// A small camera roll that follows the pans, like a hand-held camera.
const rollAt = (t) => {
  const a = keys(t - 0.08, CAM, ease.inOutSine), b = keys(t + 0.08, CAM, ease.inOutSine);
  return Math.max(-1.1, Math.min(1.1, -((b[0] - a[0]) / 0.16) * 0.0011 * a[2]));
};
const toScreen = (p, c) => {
  const r = ((c[3] || 0) * Math.PI) / 180;
  const x = (p[0] - c[0]) * c[2], y = (p[1] - c[1]) * c[2];
  return [x * Math.cos(r) - y * Math.sin(r) + 960, x * Math.sin(r) + y * Math.cos(r) + 540];
};
const toWorld = (p, c) => [(p[0] - 960) / c[2] + c[0], (p[1] - 540) / c[2] + c[1]];

export default {
  captions: CAPTIONS,

  async init(stage) {
    el("style", null, document.head, CSS);
    const bgBack = el("div", "lp-layer", stage);
    world = el("div", "lp-layer", stage);
    back = el("div", "lp-layer", world);
    front = el("div", "lp-layer", world);
    const pageWrap = el("div", "lp-pagewrap", stage);
    pg = todayPage(pageWrap);
    pg.wrap = pageWrap;
    actor = el("div", "lp-layer lp-actor", stage);
    const bgFront = el("div", "lp-layer", stage);
    const hud = el("div", "lp-layer", stage);
    bg = buildBg(bgBack, bgFront);
    vig = bgFront.lastChild;
    W = buildWidgets(back);
    B = buildBoard(front);
    N = buildNotebook(front);
    A = buildAsk(front);
    RU = buildRules(front);
    H = buildHud(hud);

    svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    svg.setAttribute("width", "2400"); svg.setAttribute("height", "1400");
    actor.appendChild(svg);
    defs(svg);
    peer = buildPeer(svg);
    const top = document.createElementNS("http://www.w3.org/2000/svg", "g");
    svg.appendChild(top);
    props = buildProps(peer.propsLayer, top);
    strips = WIDS.map((id) => {
      const s = el("div", "lp-strip", actor, `<span style="color:${DEEP[id]}">${sourceIcon(id)}</span>${STRIP[id]}`);
      return { id, el: s };
    });
    ptr = pointer(stage);

    // Measure at rest (no transforms yet), then build the choreography from the geometry.
    btnAt = centre(pg.button);
    const gw = measureWidgets(W);
    GW = gw;
    N.turn.style.transform = "rotateY(-180deg)";
    G = measureNotebook(N);
    N.turn.style.transform = "";
    const rows = hudRowCentres(H);
    const c = camAt(FOLD + 0.3);
    WIDS.forEach((id, i) => (hudFold[id] = toWorld(rows[i], c)));
    strips.forEach((s) => { const r = s.el.getBoundingClientRect(); s.w = r.width; s.h = r.height; });
    motion = buildMotion({ w: gw, nb: { lines: G.lines, sum: G.sum }, learn: G, btn: btnAt });
  },

  render(t) {
    const c = camAt(t);
    const [cx, cy, s, roll] = c;
    const camT = `translate(960px, 540px) rotate(${roll.toFixed(3)}deg) scale(${s.toFixed(5)}) translate(${(-cx).toFixed(2)}px, ${(-cy).toFixed(2)}px)`;
    world.style.transform = camT;
    actor.style.transform = camT;
    renderBg(bg, t, c);
    vig.style.opacity = ease.outCubic(prog(t, 5.2, 6.6)).toFixed(3);

    // ---- today's page: the click, the button squash, the page slides back into the stage.
    const away = ease.inOutCubic(prog(t, PAGE_AWAY[0], PAGE_AWAY[1]));
    const back2 = ease.outCubic(prog(t, END.pageIn[0], END.pageIn[1]));
    const pageK = t < END.pageIn[0] ? away : 1 - back2;
    pg.wrap.style.display = pageK < 0.999 ? "" : "none";
    pg.wrap.style.opacity = String(1 - pageK);
    pg.wrap.style.transform = `perspective(1800px) translateY(${(pageK * 60).toFixed(1)}px) rotateX(${(pageK * 16).toFixed(2)}deg) scale(${(1 - 0.3 * pageK).toFixed(4)})`;
    pg.wrap.style.filter = pageK > 0.01 ? `blur(${(pageK * 6).toFixed(2)}px)` : "none";
    const down = Math.max(0, 1 - Math.abs(t - CLICK) / 0.1);
    const press = pulse(t, CLICK - 0.04, POP.out, 0.06);
    const bulge = pulse(t, POP.out - 0.04, POP.out + 0.2, 0.08);
    const settle = t > POP.out + 0.12 ? Math.exp(-7 * (t - POP.out - 0.12)) * Math.sin((t - POP.out - 0.12) * 26) * 0.05 : 0;
    const home = t > END.hop[1] - 0.04 ? Math.exp(-6 * (t - END.hop[1] + 0.04)) * Math.sin((t - END.hop[1] + 0.04) * 24) * 0.12 : 0;
    const bx = 1 + 0.06 * press - 0.04 * bulge + settle - home * 0.6, by = 1 - 0.14 * press + 0.1 * bulge - settle + home;
    pg.button.style.transform = `scale(${bx.toFixed(4)}, ${by.toFixed(4)})`;
    pg.button.style.boxShadow = `0 6px 18px rgba(22,115,83,.28), 0 0 ${(40 * (bulge + Math.abs(home) * 4)).toFixed(1)}px ${(10 * (bulge + Math.abs(home) * 3)).toFixed(1)}px rgba(183,244,207,.8)`;

    // ---- the pointer: the click, then Connect for Slack, Code and Tickets.
    const sc = (id) => toScreen(GW[id].connect, c);
    let px = 1500, py = 900, pd = 0, po = 0;
    if (t < 5.4) {
      const k = ease.inOutCubic(prog(t, 3.1, 4.25));
      px = 1500 + (btnAt[0] - 1500) * k; py = 900 + (btnAt[1] - 900) * k;
      const k2 = ease.inOutSine(prog(t, 4.6, 5.3));
      px += 160 * k2; py += 120 * k2;
      pd = down; po = clamp(prog(t, 3.0, 3.2)) * (1 - prog(t, 4.9, 5.3));
    } else if (t < 16.0) {
      const [tx, ty] = sc("slack");
      const k = ease.inOutCubic(prog(t, 14.3, 14.98));
      px = 1760 + (tx - 1760) * k; py = 1010 + (ty - 1010) * k;
      const k2 = ease.inOutSine(prog(t, 15.25, 15.9));
      px += 120 * k2; py += 90 * k2;
      pd = Math.max(0, 1 - Math.abs(t - R.slack.connect.click) / 0.1);
      po = clamp(prog(t, 14.3, 14.5)) * (1 - prog(t, 15.6, 15.95));
    } else {
      const [ax, ay] = sc("code"), [bx2, by2] = sc("tickets");
      const k1 = ease.inOutCubic(prog(t, 17.8, 18.18));
      const k2 = ease.inOutCubic(prog(t, 18.55, 19.86));
      px = 700 + (ax - 700) * k1 + (bx2 - ax) * k2; py = 1040 + (ay - 1040) * k1 + (by2 - ay) * k2;
      const k3 = ease.inOutSine(prog(t, 20.05, 20.6));
      px += 140 * k3; py += 100 * k3;
      pd = Math.max(0, 1 - Math.abs(t - R.code.connect.click) / 0.1, 1 - Math.abs(t - R.tickets.connect.click) / 0.1);
      po = clamp(prog(t, 17.8, 17.98)) * (1 - prog(t, 20.3, 20.6));
    }
    ptr.at(px, py, pd, po);

    // ---- the world
    renderWidgets(W, t, (id) => hudFold[id], c);
    const pose = motion.poseAt(t);
    renderBoard(B, t, pose.handR);
    renderNotebook(N, G, t, pose);
    renderAsk(A, t, pose);
    renderRules(RU, t, pose);
    renderHud(H, t);

    // ---- the Peer, its props, the strips and sparkles
    peer.draw(pose);
    const pr = motion.propsAt(t, pose);
    pr.key ? props.key(...pr.key) : props.key(0, 0, 0, 1, 0);
    if (pr.pencil) {
      const r = (pr.pencil[2] * Math.PI) / 180;
      props.pencil(pr.pencil[0] - Math.cos(r) * 30, pr.pencil[1] - Math.sin(r) * 30, pr.pencil[2], pr.pencil[3]);
    } else props.pencil(0, 0, 0, 0);
    pr.stack ? props.stack(...pr.stack) : props.stack(0, 0, 0, 0, 0);
    pr.plane ? props.plane(...pr.plane) : props.plane(0, 0, 0, 1, 0);
    pr.stamp ? props.stamp(...pr.stamp) : props.stamp(0, 0, 0, 0);
    pr.tag ? props.tag(...pr.tag) : props.tag(0, 0, 0, 1, 0);
    strips.forEach((st) => {
      const q = motion.stripAt(st.id, t, pose);
      if (!q || q.a <= 0.01) { st.el.style.display = "none"; return; }
      st.el.style.display = "";
      st.el.style.opacity = q.a.toFixed(3);
      st.el.style.transform = `translate(${(q.x - st.w / 2).toFixed(1)}px, ${(q.y - st.h / 2).toFixed(1)}px) rotate(${q.rot.toFixed(2)}deg) scale(${q.s.toFixed(3)})`;
    });
    props.sparkles(motion.sparklesAt(t, pose));
  },
};

