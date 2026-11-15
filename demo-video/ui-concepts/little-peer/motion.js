// The Peer's choreography: where it is, what its hands do, where it looks and how it feels, at
// every moment. Built once from the measured geometry; poseAt(t) is a pure function of t.
import { clamp, lerp, prog, ease, pulse, noise, bezier } from "../shared/kit.js";
import { R, WIDS, perch, POP, WAVE, NB, S3, S4, LEARN, BRIEF, ASK, ASKBOX, RULES, END, CAB } from "./tl.js";
import { makeBody, track, blinkAt, blinkTimes, handAt, lookToward, trail, burst } from "./motion-core.js";
import { boardToWorld, CARD, STICKY } from "./board.js";

const M = {
  smile: [12, 4, 16], o: [6.5, -9, 9], open: [12, 2, 23], grin: [15, 1, 20], flat: [9, 0.5, 3],
  neutral: [10, 2, 8], tiny: [7, 1, 5], hum: [8, 1, 4],
};

export function buildMotion(geo) {
  const W = geo.w, NBg = geo.nb, L = geo.learn;
  const P = Object.fromEntries(WIDS.map((id) => [id, [...perch(id), 0]]));
  const lineC = (i) => [NBg.lines[i].x + NBg.lines[i].w / 2, NBg.lines[i].y + NBg.lines[i].h / 2];
  const rowEnd = (id) => [W[id].row.x + W[id].row.w - 6, W[id].row.y + W[id].row.h / 2];
  // Step 3: the pencil tip runs along each summary line.
  const sumTip = (i, t) => {
    const s = NBg.sum[i];
    const k = ease.inOutSine(prog(t, S3.lines[i][0], S3.lines[i][1]));
    return [s.x + s.w * k, s.y + s.h * 0.78];
  };
  const slot4 = (i) => { const c = CARD(i); return boardToWorld(26, [c.x + c.w / 2, c.y + c.h / 2]); };
  const stickyHand = (i) => { const s = STICKY(i); return [210 + s.x + s.w * 0.25, 130 + s.y + s.h * 0.2]; };
  const DOCK = [1420, 140, 0];          // the answer card's top edge, right side
  const STAMPAT = [1376, 479];          // where the stamp lands on the answer card
  const CABTOP = [CAB.x + 220, CAB.y, 0];

  // ---------------------------------------------------------------- body
  const moves = [
    { t0: POP.out, t1: POP.land, to: [...POP.to, 0], h: 300, kind: "hop", spin: 1 },
    { t0: R.directory.hop[0], t1: R.directory.hop[1], to: P.directory, h: 190, kind: "hop" },
    { t0: R.docs.hop[0], t1: R.docs.hop[1], to: P.docs, h: 110, kind: "hop" },
    { t0: R.docs.carry[0], t1: R.docs.carry[1], to: [lineC(1)[0], lineC(1)[1] + 190, 34], h: 90, kind: "hop" },
    { t0: R.slack.hop[0], t1: R.slack.hop[1], to: P.slack, h: 120, kind: "hop" },
    { t0: 15.55, t1: 15.86, to: P.slack, h: 46, kind: "hop" },
    { t0: R.code.hop[0], t1: R.code.hop[1], to: P.code, h: 70, kind: "zip" },
    { t0: R.tickets.hop[0], t1: R.tickets.hop[1], to: P.tickets, h: 60, kind: "zip" },
    { t0: R.mail.hop[0], t1: R.mail.hop[1], to: P.mail, h: 60, kind: "zip" },
    { t0: S3.zip[0], t1: S3.zip[1], to: [NBg.sum[0].x + 75, NB.y, 0], h: 90, kind: "zip" },
    { t0: S3.lines[0][0], t1: S3.lines[0][1], kind: "follow", fn: (t) => [sumTip(0, t)[0] + 75, NB.y, 0] },
    { t0: S3.back[0], t1: S3.back[1], to: [NBg.sum[1].x + 75, NB.y, 0], h: 26, kind: "hop" },
    { t0: S3.lines[1][0], t1: S3.lines[1][1], kind: "follow", fn: (t) => [sumTip(1, t)[0] + 75, NB.y, 0] },
    { t0: S4.hop[0], t1: S4.hop[1], to: [1200, slot4(0)[1] + 68, 22], h: 150, kind: "hop" },
    ...[1, 2, 3].map((i) => ({ t0: S4.slaps[i] - 0.3, t1: S4.slaps[i] - 0.08, to: [1200, slot4(i)[1] + 68, 22], h: 14, kind: "glide" })),
    { t0: LEARN.peerHop[0], t1: LEARN.peerHop[1], to: [960, 140, 0], h: 200, kind: "hop" },
    { t0: LEARN.tapHop[0], t1: LEARN.tapHop[1], to: [955, 470, 0], h: 60, kind: "hop" },
    { t0: 32.52, t1: 33.0, to: [840, 880, 0], h: 90, kind: "hop" },
    { t0: BRIEF.peerIn[0], t1: BRIEF.peerIn[1], to: [1530, 410, 30], h: 170, kind: "hop" },
    ...[1, 2, 3].map((i) => ({ t0: BRIEF.stickies[i] - 0.52, t1: BRIEF.stickies[i] - 0.14, to: [1530, 410 + 152 * i, 30], h: 18, kind: "glide" })),
    { t0: BRIEF.perch[0], t1: BRIEF.perch[1], to: [1350, 130, 0], h: 150, kind: "hop" },
    { t0: ASK.hopTo[0], t1: ASK.hopTo[1], to: P.docs, h: 160, kind: "hop" },
    { t0: 48.6, t1: 48.82, to: P.docs, h: 34, kind: "hop" },
    { t0: ASK.stops[0].at[0], t1: ASK.stops[0].at[1], to: P.slack, h: 60, kind: "zip" },
    { t0: ASK.stops[1].at[0], t1: ASK.stops[1].at[1], to: [P.slack[0] - 150, P.slack[1], 0], h: 30, kind: "zip" },
    { t0: ASK.stops[2].at[0], t1: ASK.stops[2].at[1], to: P.mail, h: 60, kind: "zip" },
    { t0: ASK.stops[3].at[0], t1: ASK.stops[3].at[1], to: P.code, h: 60, kind: "zip" },
    { t0: ASK.back[0], t1: ASK.back[1], to: [980, 610, 60], h: 80, kind: "zip" },
    { t0: 53.05, t1: 53.45, to: DOCK, h: 100, kind: "hop" },
    { t0: 54.25, t1: 54.55, to: [1510, 470, 40], h: 40, kind: "hop" },
    { t0: 55.62, t1: 56.02, to: DOCK, h: 90, kind: "hop" },
    { t0: RULES.peerHop[0], t1: RULES.peerHop[1], to: CABTOP, h: 160, kind: "hop" },
    { t0: END.hop[0], t1: END.hop[1], to: [geo.btn[0], geo.btn[1] + 20, 0], h: 260, kind: "hop" },
  ];
  const bodyAt = makeBody([geo.btn[0], geo.btn[1] + 20, 0], moves);

  // Overall scale and presence: pops out of the button, dives back into it.
  const scaleAt = (t) => {
    const pop = ease.outBack(prog(t, POP.out, POP.out + 0.3), 1.6);
    const dive = ease.inCubic(prog(t, END.hop[0] + (END.hop[1] - END.hop[0]) * 0.55, END.hop[1]));
    return (0.28 + 0.72 * pop) * (1 - 0.85 * dive);
  };
  const alphaAt = (t) => (t < POP.out ? 0 : t > END.gone ? 0 : clamp(prog(t, POP.out, POP.out + 0.08)) * (1 - prog(t, END.hop[1] - 0.04, END.gone)));

  // ---------------------------------------------------------------- hands
  const above = (dx, dy) => (t, b) => [b.x + dx, b.y + dy];
  const at = (p) => () => p;
  const handsR = [], handsL = [];
  // The wave on landing.
  handsR.push({ a: WAVE[0], b: WAVE[1], fn: (t, b) => [b.x + 96 + Math.sin((t - WAVE[0]) * 15) * 16, b.y - 150 - Math.cos((t - WAVE[0]) * 15) * 6] });
  // Each read: keycard to the lock, then the strip pulled out of the key line.
  WIDS.forEach((id) => {
    const r = R[id];
    const lk = [W[id].lock[0] - 22, W[id].lock[1] + 4];
    handsR.push({ a: r.tap - 0.22, b: r.tap + 0.26, in: 0.2, out: 0.2, fn: at(lk) });
    if (r.connect) handsR.push({ a: r.connect.click - 0.55, b: r.connect.click + 0.25, fn: above(90, -118) });
    const end = rowEnd(id);
    const ph = r.flick ?? r.carry[0];
    handsL.push({ a: r.pull[0] - 0.2, b: ph + 0.24, in: 0.18, out: 0.2, fn: (t, b) => {
      const k1 = ease.inOutSine(prog(t, r.pull[0], r.pull[1]));
      let p = [lerp(end[0], b.x - 46, k1), lerp(end[1], b.y - 172, k1)];
      if (r.flick) {
        const wind = ease.inOutSine(prog(t, r.pull[1], r.flick));
        const snap = ease.outCubic(prog(t, r.flick, r.flick + 0.12));
        p = [p[0] + 30 * wind + 80 * snap, p[1] - 22 * wind + 30 * snap];
      }
      return p;
    } });
    if (r.carry) {
      const lc = lineC(1);
      const hold = (dx) => (t, b) => {
        const kp = ease.inOutSine(prog(t, r.carry[1], r.write[0]));
        return [lerp(b.x + dx, lc[0] + dx * 0.9, kp), lerp(b.y - 168, lc[1] + 6, kp)];
      };
      handsL.push({ a: r.carry[0] - 0.08, b: r.write[0] + 0.25, fn: hold(-42) });
      handsR.push({ a: r.carry[0] - 0.08, b: r.write[0] + 0.25, fn: hold(42) });
    }
  });
  // The shrug while Slack waits for Connect.
  handsL.push({ a: 14.05, b: 14.85, fn: above(-104, -96) });
  handsR.push({ a: 14.05, b: 14.85, fn: above(104, -96) });
  // Step 3: the pencil in the left hand, tip on the line.
  const pencilGrip = (t) => {
    const i = t < S3.back[1] ? 0 : 1;
    const [x, y] = sumTip(i, Math.min(t, S3.lines[i][1]));
    const scrib = Math.sin(t * 38) * 2.2 * (t > S3.lines[i][0] && t < S3.lines[i][1] ? 1 : 0);
    return [x + 30, y - 53 + scrib];
  };
  handsL.push({ a: S3.pencil, b: S3.away, fn: (t) => pencilGrip(t) });
  // Step 4: the stack of cards in both hands, slapped on one by one.
  handsL.push({ a: S4.grab - 0.1, b: S4.slaps[3] + 0.25, fn: (t, b) => {
    const i = S4.slaps.findIndex((s) => t < s + 0.12);
    const s = slot4(Math.max(0, i));
    const slap = i >= 0 ? pulse(t, S4.slaps[i] - 0.16, S4.slaps[i] + 0.1, 0.08) : 0;
    return [lerp(b.x - 50, s[0] + 120, slap), lerp(b.y - 70, s[1], slap)];
  } });
  handsR.push({ a: S4.grab - 0.1, b: S4.slaps[3] + 0.25, fn: (t, b) => [b.x - 6, b.y - 60] });
  // The bow at the end of setup: hands together.
  handsL.push({ a: S4.bow[0], b: S4.bow[1], fn: above(-30, -20) });
  handsR.push({ a: S4.bow[0], b: S4.bow[1], fn: above(30, -20) });
  // What I learned: tap the traced tag, pull the thread back to its source.
  handsR.push({ a: LEARN.tap - 0.2, b: LEARN.tap + 0.3, fn: at([L.tagWorld[0] + 6, L.tagWorld[1]]) });
  handsL.push({ a: LEARN.thread[0] - 0.2, b: LEARN.plug + 0.3, in: 0.2, fn: (t, b) => {
    if (t < 32.5) return L.tagWorld;
    if (t < 33.0) return [b.x - 70, b.y - 110];
    return [lerp(b.x - 70, L.docRowWorld[0], ease.inOutSine(prog(t, 33.0, LEARN.plug))), lerp(b.y - 110, L.docRowWorld[1], ease.inOutSine(prog(t, 33.0, LEARN.plug)))];
  } });
  // Your brief: each sticky in the right hand, slapped on.
  BRIEF.stickies.forEach((a, i) => {
    const sh = stickyHand(i);
    handsR.push({ a: a - 0.6, b: a + 0.22, fn: (t, b) => {
      const k = ease.inCubic(prog(t, a - 0.16, a));
      return [lerp(b.x - 40, sh[0], k), lerp(b.y - 120, sh[1], k)];
    } });
  });
  // Ask: catch the plane and hold it up through the search.
  handsR.push({ a: ASK.catch - 0.25, b: ASK.unfold[0] + 0.1, fn: above(26, -176) });
  handsL.push({ a: ASK.catch - 0.25, b: ASK.catch + 0.35, fn: above(-30, -168) });
  // The stamp: both hands on its handle; lift, slam, lift away.
  const stampY = (t) => {
    const up = ease.inOutSine(prog(t, ASK.stampLift, ASK.stamp - 0.12));
    const slam = ease.inCubic(prog(t, ASK.stamp - 0.12, ASK.stamp));
    const off = ease.inOutSine(prog(t, ASK.stamp + 0.18, ASK.stamp + 0.42));
    return STAMPAT[1] - 60 - 90 * up + 150 * slam - 120 * off;
  };
  const stampPos = (t) => [STAMPAT[0], Math.min(STAMPAT[1], stampY(t))];
  handsL.push({ a: ASK.stampLift - 0.1, b: ASK.stamp + 0.5, fn: (t) => [stampPos(t)[0] - 20, stampPos(t)[1] - 74] });
  handsR.push({ a: ASK.stampLift - 0.1, b: ASK.stamp + 0.5, fn: (t) => [stampPos(t)[0] + 20, stampPos(t)[1] - 80] });
  // Rules: tap the badge, show the keycard, hold up a source tag, grab the document, file it.
  handsR.push({ a: RULES.badgeTap - 0.2, b: RULES.badgeTap + 0.3, fn: above(8, -26) });
  handsR.push({ a: RULES.card[0], b: RULES.card[1], fn: above(84, -150) });
  handsL.push({ a: RULES.tagShow[0], b: RULES.tagShow[1], fn: above(-92, -140) });
  const fileHand = (dx) => (t) => {
    const k = ease.inOutCubic(prog(t, RULES.file[0], RULES.file[1]));
    return [lerp(1470 + dx, CAB.x + 145 + dx * 0.6, k), lerp(452, CAB.y + 52, k)];
  };
  handsL.push({ a: RULES.grab - 0.2, b: RULES.file[1] + 0.15, fn: fileHand(-30) });
  handsR.push({ a: RULES.grab - 0.2, b: RULES.file[1] + 0.15, fn: fileHand(30) });
  handsR.push({ a: RULES.wave[0], b: RULES.wave[1], fn: (t, b) => [b.x + 96 + Math.sin((t - RULES.wave[0]) * 15) * 16, b.y - 150] });
  // The goodbye wave during the hop home is the left hand.
  handsL.push({ a: END.hop[0] - 0.2, b: END.hop[1], fn: above(-92, -132) });

  // ---------------------------------------------------------------- eyes and face
  const cam = "cam";
  const looks = [
    [0, cam], [4.7, [1700, 200]], [5.12, cam], [6.05, P.directory],
  ];
  const scanRows = (id, a, b) => (t) => {
    const c = W[id].card, k = prog(t, a, b);
    const row = Math.floor(k * 3), u = (k * 3) % 1;
    return [c.x + 40 + (c.w - 120) * ease.inOutQuad(u), c.y + 80 + row * 46];
  };
  WIDS.forEach((id) => {
    const r = R[id];
    looks.push([r.hop[1] - 0.1, W[id].lock]);
    looks.push([r.scan[0], scanRows(id, r.scan[0], r.scan[1])]);
    looks.push([r.hl[0], (t) => [W[id].row.x + W[id].row.w * ease.inOutQuad(prog(t, r.hl[0], r.hl[1])), W[id].row.y]]);
    looks.push([r.pull[1] - 0.1, r.flick ? lineC(r.line) : [lineC(1)[0], lineC(1)[1]]]);
  });
  looks.push([13.9, cam], [14.85, W.slack.connect], [15.12, [W.slack.card.x + 200, W.slack.card.y + 110]], [15.5, cam]);
  looks.push([18.15, W.code.connect], [19.85, W.tickets.connect]);
  looks.sort((a, b) => a[0] - b[0]);
  const later = [
    [22.4, [1500, 200]], [S3.lines[0][0], (t) => sumTip(0, t)], [S3.back[0], (t) => sumTip(1, t)], [S3.away, [900, 500]],
    [S4.hop[1], (t) => slot4(Math.max(0, S4.slaps.findIndex((s) => t < s + 0.1)))], [27.5, cam],
    [28.6, [960, 380]], [29.3, [1200, 400]], [29.7, [500, 330]], [30.9, [420, 560]], [31.4, L.tagWorld], [32.2, cam],
    [32.45, (t) => [L.docRowWorld[0], L.docRowWorld[1]]], [33.35, cam],
    ...[0, 1, 2, 3, 4, 5].map((i) => [LEARN.sweep + i * 0.34, L.cardFoot[i]]), [36.0, cam],
    [36.6, [1500, 330]], ...BRIEF.stickies.map((a, i) => [a - 0.5, [1480, 338 + 152 * i]]), [41.2, cam],
    ...[0, 1, 2, 3].map((i) => [BRIEF.glow + i * 0.55, [1480, 338 + 152 * i]]), [44.4, cam],
    [45.6, [ASKBOX.x + 200, ASKBOX.y + 120]], [ASK.plane[0], (t) => planeAt(t)], [ASK.catch, cam],
    ...ASK.stops.map((s) => [s.at[1] - 0.1, [(s.w === "slack" ? 1100 : s.w === "mail" ? 1100 : 240) + (s.dx || 0), (s.w === "code" || s.w === "mail" ? 780 : 470)]]),
    [52.0, [980, 330]], [53.0, [900, 300]], [ASK.sentences, (t) => [500 + 260 * ((t - ASK.sentences) % 0.42) / 0.42 * 2, 260 + 45 * Math.min(3, Math.floor((t - ASK.sentences) / 0.42))]],
    [54.4, STAMPAT], [55.3, cam], [55.7, [900, 620]], [56.6, cam],
    [58.3, cam], [58.55, [CABTOP[0], CABTOP[1] - 40]], [58.8, cam], [60.35, [CABTOP[0] - 92, CABTOP[1] - 180]], [60.7, [1540, 360]],
    [61.5, (t) => [1490 + 90 * (((t - 61.5) * 2.4) % 1), 300 + 60 * Math.floor((t - 61.5) * 2.4)]], [62.0, cam], [62.66, [1500, 420]],
    [62.9, [CAB.x + 145, CAB.y + 60]], [63.5, cam], [65.4, geo.btn], [66.0, cam],
  ];
  // Eyes lead: a glance at where it is going, just before each hop.
  const ahead = moves.filter((m) => m.kind === "hop" || m.kind === "zip").filter((m) => m.t0 > 5.5 && m.t0 < END.hop[0] - 0.1)
    .map((m) => [m.t0 - 0.24, [m.to[0], m.to[1] - 70]]);
  const lookList = looks.concat(later, ahead).sort((a, b) => a[0] - b[0]);

  const mouthKeys = [
    [0, M.smile], [POP.out, M.o], [4.86, M.open], [5.3, M.grin], [6.1, M.smile],
    ...WIDS.flatMap((id) => [[R[id].scan[0], M.tiny], [R[id].hl[0], M.o], [R[id].pull[0], M.smile]]),
    [13.66, M.o], [14.0, M.flat], [14.95, M.o], [15.55, M.open], [15.95, M.smile],
    [22.9, M.hum], [25.2, M.smile], [27.6, M.grin], [28.4, M.smile], [31.7, M.o], [32.2, M.smile], [33.2, M.grin], [33.8, M.smile],
    [38.0, M.grin], [38.4, M.smile], [41.9, M.grin], [42.6, M.smile], [47.7, M.o], [48.82, M.open], [49.3, M.smile],
    [52.3, M.o], [52.9, M.grin], [53.4, M.smile], [54.6, M.tiny], [ASK.stamp, M.open], [55.4, M.grin], [56.2, M.smile],
    [58.62, M.grin], [59.5, M.smile], [61.4, M.o], [61.9, M.flat], [63.4, M.smile], [64.05, M.open], [64.9, M.smile], [65.5, M.open],
  ].sort((a, b) => a[0] - b[0]);
  const browKeys = [
    [0, [0, 0]], [POP.out, [6, -6]], [5.2, [2, -2]], [13.64, [8, -10]], [14.1, [6, -12]], [15.55, [4, -4]], [16.2, [0, 0]],
    [31.6, [5, -6]], [32.4, [0, 0]], [47.6, [5, -6]], [49.0, [0, 0]], [54.6, [-2, 8]], [55.3, [2, -2]],
    [61.5, [-1, 6]], [62.0, [-3, 12]], [63.2, [2, -4]], [64.0, [3, -3]],
  ].sort((a, b) => a[0] - b[0]);
  const lidKeys = [
    [0, 0], ...WIDS.flatMap((id) => [[R[id].scan[0], 0.22], [R[id].pull[0], 0]]), [23.2, 0.2], [25.2, 0], [61.55, 0.28], [62.0, 0.38], [63.3, 0],
  ].sort((a, b) => a[0] - b[0]);
  const happyKeys = [
    [0, 0], [5.25, 0.9], [6.0, 0], [15.6, 0.85], [16.0, 0], [27.62, 0.9], [28.3, 0], [33.25, 0.8], [33.8, 0], [41.9, 0.85], [42.5, 0],
    [55.05, 0.9], [55.6, 0], [58.62, 0.7], [59.1, 0], [63.45, 0.8], [64.0, 0.6], [65.0, 0.9],
  ];
  const blinks = blinkTimes(4.9, 66, 17, [5.14, 9.32, 13.5, 21.4, 29.15, 37.4, 45.55, 53.5, 58.4]);
  const planeFrom = [ASKBOX.x + ASKBOX.w / 2, ASKBOX.y + ASKBOX.h / 2];
  function planeAt(t) {
    const k = ease.inOutSine(prog(t, ASK.plane[0], ASK.plane[1]));
    const b = bodyAt(ASK.catch);
    const to = [b.x + 26, b.y - 196];
    return bezier(planeFrom, [planeFrom[0] - 120, planeFrom[1] - 160], [to[0] + 200, to[1] - 200], to, k);
  }

  // ---------------------------------------------------------------- the pose
  function poseAt(t) {
    const b = bodyAt(t);
    const lag = bodyAt(t - 0.05);
    const s = scaleAt(t);
    let rot = b.rot;
    // Head shake and the nods.
    rot += 10 * Math.sin((t - RULES.shake[0]) * 2 * Math.PI * 3.1) * pulse(t, RULES.shake[0], RULES.shake[1], 0.1);
    let sy = b.sy, sx = b.sx;
    const nod = (a) => Math.sin(clamp((t - a) / 0.5) * Math.PI) ;
    const bow = Math.sin(clamp((t - S4.bow[0]) / (S4.bow[1] - S4.bow[0])) * Math.PI);
    sy -= 0.08 * bow; sx += 0.05 * bow;
    for (const a of [12.3, 33.5, 42.0, 56.3, 63.6]) { const n = nod(a); sy -= 0.05 * n; sx += 0.03 * n; }
    // Rest positions of the hands follow the body with a little lag (they float).
    const restL = [lag.x - 80 * s + Math.sin(t * 5.6) * 2, lag.y - 52 * s + Math.sin(t * 5.6 + 0.6) * 4];
    const restR = [lag.x + 80 * s + Math.sin(t * 5.6 + 2) * 2, lag.y - 52 * s + Math.sin(t * 5.6 + 2.7) * 4];
    const hb = { ...b, x: b.x, y: b.y };
    const handL = handAt(restL, handsL, t, hb);
    const handR = handAt(restR, handsR, t, hb);
    // Where it looks.
    const eye = [b.x, b.y - 78 * s];
    let look = [0, 0];
    let i = 0;
    while (i + 1 < lookList.length && lookList[i + 1][0] <= t) i++;
    const dirOf = (k, tt) => {
      const v = lookList[k][1];
      if (v === "cam") return [noise(tt * 0.7, 3) * 0.12, noise(tt * 0.6, 5) * 0.1];
      const p = typeof v === "function" ? v(tt) : v;
      return lookToward(eye, p);
    };
    const cur = dirOf(i, t);
    if (i > 0 && t < lookList[i][0] + 0.12) {
      const prev = dirOf(i - 1, t);
      const k = ease.inOutQuad(prog(t, lookList[i][0], lookList[i][0] + 0.12));
      look = [lerp(prev[0], cur[0], k), lerp(prev[1], cur[1], k)];
    } else look = cur;
    const camLook = lookList[i][1] === "cam";
    const shadowH = Math.max(0, b.ground - b.y);
    // Smears on fast moves.
    const ghosts = [1, 2, 3].map((k) => {
      const g0 = bodyAt(t - k * 0.026), g1 = bodyAt(t - (k - 1) * 0.026);
      const v = Math.hypot(g1.x - g0.x, g1.y - g0.y);
      return { x: g0.x, y: g0.y, sx: g0.sx, sy: g0.sy, rot: g0.rot, s: scaleAt(t - k * 0.026), a: clamp((v - 9) / 30) * [0.34, 0.2, 0.1][k - 1] * alphaAt(t) };
    });
    const vx = (b.x - lag.x) / 0.05;
    return {
      x: b.x, y: b.y, sx, sy, rot, s, alpha: alphaAt(t),
      look, pupil: camLook ? 1.08 : 1,
      blink: blinkAt(t, blinks), lid: track(lidKeys, t, 0.12),
      happy: track(happyKeys, t, 0.14), brow: track(browKeys, t, 0.12), mouth: track(mouthKeys, t, 0.1),
      cheek: track(happyKeys, t, 0.2),
      handL, handR,
      sway: clamp(-vx * 0.03, -28, 28) + Math.sin(t * 2.3) * 4 - rot * 0.6,
      badge: Math.max(pulse(t, RULES.badgeTap - 0.05, RULES.badgeTap + 0.6, 0.15), pulse(t, 3.2, 3.2, 0.1)),
      aura: 0.5 * pulse(t, POP.out, POP.out + 0.5, 0.15) + 0.4 * pulse(t, ASK.catch - 0.1, ASK.catch + 0.4, 0.12),
      shadow: [b.x, b.ground, clamp(1 - shadowH / 280, 0.32, 1) * (b.g > 2 ? 0.75 : 1), clamp(1 - shadowH / 330, 0.2, 1) * (b.g > 2 ? 0.55 : 1)],
      air: b.air, ghosts,
    };
  }

  // ---------------------------------------------------------------- props
  function propsAt(t, p) {
    const out = {};
    // Ram's keycard through setup, held in the right hand; shown big under the rules.
    const keyOn = t > 6.0 && t < 22.35;
    const kk = ease.outBack(prog(t, 6.0, 6.25), 2) * (1 - ease.inCubic(prog(t, 22.15, 22.35)));
    out.key = keyOn ? [p.handR[0] + 22, p.handR[1] - 14, -8 + Math.sin(t * 3) * 3, kk, 1] : null;
    if (t > RULES.card[0] && t < RULES.card[1]) {
      const kc = ease.outBack(prog(t, RULES.card[0], RULES.card[0] + 0.3), 1.8) * (1 - ease.inCubic(prog(t, RULES.card[1] - 0.2, RULES.card[1])));
      out.key = [p.handR[0] + 40, p.handR[1] - 48, -6, 0.4 + 1.8 * kc, clamp(kc * 2)];
    }
    out.pencil = t > S3.pencil && t < S3.away ? (() => {
      const g = p.handL;
      const k = ease.outBack(prog(t, S3.pencil, S3.pencil + 0.25), 2) * (1 - prog(t, S3.away - 0.15, S3.away));
      return [g[0], g[1], 120, k];
    })() : null;
    if (t > S4.grab && t < S4.slaps[3] + 0.05) {
      const n = 4 - S4.slaps.filter((s) => t >= s).length;
      out.stack = [p.handL[0] + 26, p.handL[1] - 6, -6, n, ease.outBack(prog(t, S4.grab, S4.grab + 0.25), 2)];
    }
    if (t > ASK.plane[0] && t < ASK.unfold[0] + 0.12) {
      const flying = t < ASK.catch;
      const pp = flying ? planeAt(t) : [p.handR[0], p.handR[1] - 20];
      const wob = flying ? Math.sin(t * 7) * 8 : Math.sin(t * 4) * 4;
      const ku = 1 - prog(t, ASK.unfold[0] - 0.05, ASK.unfold[0] + 0.12);
      out.plane = [pp[0], pp[1], (flying ? 200 : -12) + wob, 0.9 + 0.1 * Math.sin(t * 3), ku];
    }
    if (t > ASK.stampLift - 0.1 && t < ASK.stamp + 0.6) {
      const k = ease.outBack(prog(t, ASK.stampLift - 0.1, ASK.stampLift + 0.15), 2) * (1 - prog(t, ASK.stamp + 0.45, ASK.stamp + 0.6));
      out.stamp = [stampPos(t)[0], stampPos(t)[1], 0, k];
    }
    if (t > RULES.tagShow[0] && t < RULES.tagShow[1]) {
      const k = ease.outBack(prog(t, RULES.tagShow[0], RULES.tagShow[0] + 0.25), 2) * (1 - prog(t, RULES.tagShow[1] - 0.15, RULES.tagShow[1]));
      out.tag = [p.handL[0] - 10, p.handL[1] - 42, -6, 1.3 * k, clamp(k * 2)];
    }
    return out;
  }

  // ---------------------------------------------------------------- glowing strips (setup)
  function stripAt(id, t, p) {
    const r = R[id];
    if (t < r.pull[0]) return null;
    const lc = lineC(r.line);
    const endW = r.write[0] + 0.3;
    if (t > endW) return null;
    const melt = 1 - prog(t, r.write[0], endW);
    if (r.flick) {
      if (t < r.flick) {
        const k = ease.outBack(prog(t, r.pull[0], r.pull[0] + 0.2), 1.8);
        return { x: p.handL[0], y: p.handL[1] - 24, rot: -6 + 6 * Math.sin(t * 9), s: 0.8 + 0.2 * k, a: 1 };
      }
      const rel = releaseAt(id);
      const k = ease.inOutSine(prog(t, r.fly[0], r.fly[1]));
      const c1 = [rel[0] + 160, rel[1] - 260], c2 = [lc[0] - 40, lc[1] - 220];
      const q = bezier(rel, c1, c2, lc, k);
      return { x: q[0], y: q[1], rot: -6 + 360 * ease.inOutCubic(k) * 0 + Math.sin(k * Math.PI) * 14, s: (1 - 0.15 * k) * (0.3 + 0.7 * melt), a: melt };
    }
    // Carried: held above the head with both hands, then pressed onto the line.
    if (t < r.carry[0]) return { x: p.handL[0], y: p.handL[1] - 24, rot: -4, s: 1, a: 1 };
    const mx = (p.handL[0] + p.handR[0]) / 2, my = (p.handL[1] + p.handR[1]) / 2 - 22;
    return { x: mx, y: my, rot: Math.sin(t * 6) * 3 * (1 - prog(t, r.carry[1], r.write[0])), s: 0.3 + 0.7 * melt, a: melt };
  }
  const relCache = {};
  function releaseAt(id) {
    if (!relCache[id]) { const pp = poseAt(R[id].flick); relCache[id] = [pp.handL[0], pp.handL[1] - 24]; }
    return relCache[id];
  }

  // ---------------------------------------------------------------- sparkles
  function sparklesAt(t, p) {
    const out = [];
    const bAt = (tt) => { const b = bodyAt(tt); return [b.x, b.y - 60]; };
    trail(out, t, POP.out, POP.land, bAt, { seed: 1, rate: 70, size: 11 });
    for (const m of moves) {
      if (m.kind === "zip") trail(out, t, m.t0, m.t1 + 0.02, bAt, { seed: Math.round(m.t0 * 10), rate: 60, size: 10, spread: 40 });
    }
    trail(out, t, R.directory.hop[0], R.directory.hop[1], bAt, { seed: 5, rate: 40, size: 8 });
    WIDS.forEach((id, i) => {
      const r = R[id];
      if (r.fly) trail(out, t, r.fly[0], r.fly[1], (tt) => { const s = stripAt(id, tt, poseAt(tt)); return s ? [s.x, s.y] : [-999, -999]; },
        { seed: 40 + i, rate: 50, size: 8, colors: ["#fffbe0", "#d9ffe9", "#ffffff"] });
      burst(out, t, r.open, [W[id].lock[0], W[id].lock[1]], { seed: 60 + i, n: 10, speed: 110, size: 8, life: 0.45 });
      burst(out, t, r.done, [W[id].card.x + 30, W[id].card.y + W[id].card.h - 20], { seed: 70 + i, n: 9, speed: 120, size: 8, life: 0.5, colors: ["#bff5d6", "#ffffff", "#7fe0aa"] });
      burst(out, t, r.pull[0] + 0.05, rowEnd(id), { seed: 90 + i, n: 8, speed: 90, size: 7, life: 0.4, colors: ["#fff3b0", "#ffffff"] });
      burst(out, t, r.write[1], [lineC(r.line)[0] + 120, lineC(r.line)[1] + 30], { seed: 100 + i, n: 8, speed: 100, size: 7, life: 0.45 });
    });
    burst(out, t, ASK.catch, [p.handR[0], p.handR[1] - 20], { seed: 81, n: 14, speed: 150 });
    burst(out, t, ASK.stamp, STAMPAT, { seed: 82, n: 18, speed: 220, colors: ["#bff5d6", "#ffffff", "#167353"] });
    burst(out, t, RULES.badgeTap, [p.x, p.y - 26], { seed: 83, n: 12, speed: 120 });
    burst(out, t, END.hop[1], [geo.btn[0], geo.btn[1]], { seed: 84, n: 22, speed: 240, life: 0.7 });
    burst(out, t, POP.out, [geo.btn[0], geo.btn[1]], { seed: 85, n: 18, speed: 200, life: 0.6 });
    // Setup done: a little confetti in the source colours.
    burst(out, t, 27.64, [p.x, p.y - 150], { seed: 86, n: 26, speed: 260, life: 0.9, size: 12, colors: ["#7aa7ff", "#b28cff", "#5fd4c4", "#ffb547", "#ff8a9a", "#ffffff"] });
    return out;
  }

  return { poseAt, propsAt, stripAt, sparklesAt, bodyAt, planeAt, stampPos };
}
