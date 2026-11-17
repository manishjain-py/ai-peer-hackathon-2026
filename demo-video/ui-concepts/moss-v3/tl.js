// Tag: every time (concept seconds) and every place (px) in one file, so the modules agree.
// The film plays concept seconds 3.0 to 57.5 and lays its own narration on these sections, so
// each section keeps its start and end:
//   0-3 title card · 3-5.5 landing · 5.5-8 step 1 · 8-19 step 2 · 19-22 step 3 · 22-25 step 4
//   25-32 What I learned · 32-39.5 the brief · 39.5-50 Ask · 50-57.5 the rules · 57.5-67.5 the
//   return · 67.5-71 end card.
// Page places are in page px (the page at rest is the 1920 x 1080 frame); room places are in
// frame px.
import { captionWords as CW } from "../shared/data.js";
import { X } from "./data-extra.js";

export const T = 71;
export const SECTION = { landing: 3.0, step1: 5.5, step2: 8.0, step3: 19.0, step4: 22.0, learned: 25.0, brief: 32.0, ask: 39.5, rules: 50.0, ret: 57.5, end: 67.5 };

// ------------------------------------------------------------------ the page (page px)
export const RAIL_W = 330;
export const SPOT = { x: 40, y: 902, w: 250, h: 70, cx: 165, feet: 965 };       // the tag's home in the rail
export const HERO = { x: 494, kickerY: 282, helloY: 312, leadY: 476, btn: { x: 494, y: 650, w: 380, h: 86 } };
export const BTN_C = [HERO.btn.x + HERO.btn.w / 2, HERO.btn.y + HERO.btn.h / 2];
export const HEAD = { y: 64, btnY: 76, btnH: 46 };
export const CHIPS = { x: 400, y: 150, w: 1460, h: 112, gap: 14 };
export const LEARN = { x: 400, w: 730, headY: 286, sumY: 350, tagsY: 476, factY: 540, row: 56 };
export const BRIEF = { x: 1180, y: 434, w: 680 };
export const ASKP = {
  scroll: 1100, headY: 1286,
  input: { x: 400, y: 1362, w: 1240, h: 88 }, btn: { x: 1660, y: 1362, w: 200, h: 88 },
  exY: 1474, answer: { x: 400, y: 1556, w: 1460, h: 360 },
};

// ------------------------------------------------------------------ the room (frame px)
export const HORIZON = 905;
export const TOPBAR = { y: 30, h: 46 };
export const NOTES = { x: 40, y: 118, w: 380, h: 812 };
export const CARD = { cx: 1150, w: 740, y: 104, h: 776, gap: 1000 };
export const ROOM = { feet: 975, s: 1.5, dx: -205 };     // the tag stands left of the card's centre
export const MINI = { x: 170, y: 112, w: 250, h: 218, gap: 16 };
export const COMPACT = { x: 170, y: 112, w: 250, h: 112, gap: 16 };
export const PANEL = { x: 170, y: 420, w: 1580, h: 520, factY: 548, row: 58, railY: 924, narrowW: 960 };
export const RBRIEF = { x: 1290, y: 446, w: 520 };

// ------------------------------------------------------------------ the landing
export const CLICK = 4.4;
export const ROOM_IN = [4.62, 5.35];       // the page fades into the room

// ------------------------------------------------------------------ setup: steps 1 and 2
export const SRC = ["directory", "docs", "slack", "code", "tickets", "mail"];
// pan: the room pans to this source's card (the tag walks with it); connect: the card asks for a
// one-time Connect, the pointer clicks it, a small sheet shows the sign-in; read: "reading" lines;
// list: the result; hl: the key line is marked and the tag's line reaches it; chip: the key line
// flies into the Notes; done: the card's tick.
export const READ = {
  directory: { pan: [4.9, 5.45], read: [5.55, 6.2], list: 6.2, hl: 6.75, chip: [7.1, 7.7], done: 7.6 },
  docs: { pan: [7.95, 8.7], read: [8.5, 8.95], list: 8.95, hl: 9.3, chip: [9.55, 10.1], done: 9.85 },
  slack: { pan: [9.95, 10.6], connect: { show: 10.42, click: 11.02, sheet: [11.08, 11.72] }, read: [11.66, 11.98], list: 11.98, hl: 12.28, chip: [12.48, 13.02], done: 12.78 },
  code: { pan: [12.85, 13.45], connect: { show: 13.3, click: 13.74, sheet: [13.8, 14.32] }, read: [14.26, 14.5], list: 14.5, hl: 14.76, chip: [14.96, 15.46], done: 15.22 },
  tickets: { pan: [15.18, 15.72], connect: { show: 15.58, click: 15.98, sheet: [16.04, 16.54] }, read: [16.48, 16.72], list: 16.72, hl: 16.98, chip: [17.16, 17.66], done: 17.42 },
  mail: { pan: [17.38, 17.92], read: [17.82, 18.1], list: 18.1, hl: 18.34, chip: [18.5, 19.0], done: 18.76 },
};
export const STEP_AT = [5.4, 8.0, 19.0, 22.0];
export const STEP_DONE = [7.9, 18.92, 21.92, 24.42];

// ------------------------------------------------------------------ setup: steps 3 and 4
export const S3 = { notesOut: [19.0, 19.5], fly: [19.02, 19.8], panelIn: [19.22, 19.92], hop: [19.5, 19.98], ride: [20.0, 21.72], threads: 0.32 };
export const S4 = { compact: [22.0, 22.5], briefIn: [21.95, 22.5], hop: [22.05, 22.62], lead: [22.7, 23.25], items: [23.05, 23.4, 23.75, 24.1] };
export const MORPH = [24.4, 25.25];        // the room becomes the page

// ------------------------------------------------------------------ the page: what I learned and the brief
export const LEARNED = { sweep: [25.55, 27.0], threads: [[27.0, 28.55, 0], [28.55, 30.1, 2], [30.1, 31.75, 4]] };
export const BRIEFT = { cam: [31.75, 32.75], items: [32.95, 34.35, 35.75, 37.15], hold: 38.5 };

// ------------------------------------------------------------------ ask your Peer
export const ASK = {
  scroll: [39.45, 40.4], hop: [39.78, 40.42], ptrIn: [40.45, 40.95], click: 41.02, type: 41.12, cps: 26,
  ptrBtn: [42.5, 42.86], askClick: 42.96, think: [43.02, 45.3], chips: [43.4, 43.88, 44.36, 44.84],
  pace: [[43.1, 43.8, 150], [43.95, 44.85, -260], [44.95, 45.15, 0]], jump: [45.25, 45.78],
  answer: 45.5, cps2: 112, conf: [47.4, 47.7], stamp: 47.9, srcs: 47.6,
};

// ------------------------------------------------------------------ the rules (how it works)
export const RULES = {
  veil: [49.95, 50.6], walk: [50.05, 50.95], turn: [50.95, 51.5], grow: [51.08, 51.75],
  head: 51.62, first: 51.86, step: 0.4, back: [55.0, 55.75], label: [55.85, 56.5],
  spot: { x: 960, feet: 880, s: 1.6 }, card: { w: 620, h: 394 },      // tag units at s = 1.6
};

// ------------------------------------------------------------------ the return (the next day)
export const RET = {
  cut: [57.5, 58.05], note: [58.0, 58.5], wink: 58.98, both: 59.32, zoomOut: [59.45, 60.45],
  stand: [60.1, 60.5], hop: [60.52, 61.22], ptrRefresh: [61.3, 61.78], refresh: 61.85, sweep: 61.95,
  restack: [62.95, 63.4], ptrForget: [63.45, 63.96], forget: 64.06, clear: [64.12, 64.95],
  hopHome: [64.5, 65.12], sit: [65.12, 65.48], plain: [65.6, 66.1], heroIn: [64.85, 65.7],
};

// ------------------------------------------------------------------ the page camera: [t, [cx, cy, s]]
export const PCAM = [
  [0, [960, 540, 1]], [24.4, [960, 540, 1]], [25.25, [960, 540, 1]],
  [26.0, [960, 540, 1]], [31.6, [985, 548, 1.03]],
  [32.6, [1047, 606, 1.1]], [38.9, [1047, 610, 1.1]],
  [40.1, [960, 540, 1]], [57.5, [960, 540, 1]],
  [57.5001, [402, 846, 2.3]], [59.45, [406, 846, 2.3]], [60.45, [960, 540, 1]], [71, [960, 540, 1]],
];
// The page scroll (page px the main column has moved up).
export const SCROLL = [[0, 0], [39.45, 0], [40.4, ASKP.scroll], [57.5, ASKP.scroll], [57.5001, 0], [71, 0]];

// ------------------------------------------------------------------ captions (with his kind of kicker)
export const CAPTIONS = [
  { at: 3.1, to: 5.35, text: CW.click, kicker: "Start" },
  { at: 5.55, to: 7.95, text: CW.directory, kicker: "Setup 1/4" },
  { at: 8.1, to: 10.45, text: CW.search, kicker: "Setup 2/4" },
  { at: 10.6, to: 14.6, text: CW.connect, kicker: "Setup 2/4" },
  { at: 19.1, to: 21.9, text: CW.write, kicker: "Setup 3/4" },
  { at: 22.1, to: 24.95, text: CW.brief, kicker: "Setup 4/4" },
  { at: 25.4, to: 29.4, text: CW.learned, kicker: "What I learned" },
  { at: 32.3, to: 36.3, text: CW.yourBrief, kicker: "Your brief" },
  { at: 39.9, to: 42.7, text: CW.ask, kicker: "Ask your Peer" },
  { at: 45.6, to: 49.6, text: CW.answer, kicker: "Ask your Peer" },
  { at: 50.3, to: 54.3, text: "Always labelled as AI. Your sources, your choices.", kicker: "How it works" },
  { at: 54.5, to: 57.35, text: X.capCalm, kicker: "How it works" },
  { at: 58.05, to: 60.7, text: X.capNextDay, kicker: "Next day" },
  { at: 60.9, to: 63.6, text: X.capRefresh, kicker: "Next day" },
  { at: 63.8, to: 67.35, text: X.capForget, kicker: "Next day" },
];
