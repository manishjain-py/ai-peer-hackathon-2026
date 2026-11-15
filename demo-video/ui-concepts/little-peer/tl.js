// Little Peer: every time (seconds) and every place (world pixels) in one file, so the modules
// agree. World pixels equal stage pixels when the camera is at rest (centre 960,540, scale 1).
import { captionWords as CW } from "../shared/data.js";

export const T = 70;

// ---------------------------------------------------------------- layout (world px)
export const WW = 400, WH = 260;                       // a source widget
export const WIDS = ["directory", "docs", "slack", "code", "tickets", "mail"];
export const WPOS = {
  directory: [40, 360], docs: [470, 360], slack: [900, 360],
  code: [40, 660], tickets: [470, 660], mail: [900, 660],
};
// Where the Peer perches on a widget (its base on the widget's top edge, right side).
export const perch = (id) => [WPOS[id][0] + 300, WPOS[id][1]];

export const NB = { x: 1360, y: 120, w: 520, h: 780 };   // the notebook on the desk
export const BOARD = { x: 210, y: 130, w: 1500, h: 770, small: { x: 700, y: 362, s: 0.42 } };
export const SPREAD = { x: 150, y: 140, w: 1620, h: 760 };
export const ASKBOX = { x: 1270, y: 124, w: 620, h: 236 };
export const ANSWER = { x: 340, y: 140, w: 1240, h: 400 };
export const SIGN = { x: 240, y: 96, w: 860, h: 650 };
export const CAB = { x: 1180, y: 600, w: 290, h: 250 };

// ---------------------------------------------------------------- the opening
export const CLICK = 4.4;
export const POP = { out: 4.56, land: 5.1, to: [1210, 700] };
export const WAVE = [5.3, 6.0];
export const PAGE_AWAY = [5.15, 6.15];
export const STAGE_IN = 5.35;          // widgets spring in from here, staggered

// ---------------------------------------------------------------- setup: one read per source
// hop: the Peer travels to the widget; tap: the keycard touches the lock; open: the widget opens
// as Ram; scan: eyes over the rows; hl: the highlighter runs over the key line; pull: the line
// lifts out as a glowing strip; done: the widget's tick and count; flick + fly: the strip flies
// to the notebook (or carry: the Peer carries it); write: the fact is written in the notebook.
export const R = {
  directory: { hop: [6.2, 6.72], tap: 6.98, open: 7.04, scan: [7.3, 7.8], hl: [7.6, 7.95], pull: [7.98, 8.26], done: 8.25,
    flick: 8.44, fly: [8.44, 9.02], write: [9.02, 9.72], line: 0 },
  docs: { hop: [8.72, 9.28], tap: 9.52, open: 9.58, scan: [9.84, 10.5], hl: [10.46, 10.82], pull: [10.86, 11.12], done: 11.1,
    carry: [11.2, 11.88], write: [12.0, 12.66], line: 1 },
  slack: { hop: [12.84, 13.42], tap: 13.64, connect: { show: 13.74, click: 15.05, sheet: [15.1, 15.86] }, open: 15.55,
    scan: [15.92, 16.4], hl: [16.34, 16.7], pull: [16.72, 16.98], done: 16.95, flick: 17.1, fly: [17.1, 17.64], write: [17.64, 18.28], line: 2 },
  code: { hop: [17.55, 17.94], zip: true, connect: { show: 17.9, click: 18.24, sheet: [18.27, 18.74] }, tap: 18.5, open: 18.55,
    scan: [18.6, 18.84], hl: [18.74, 18.98], pull: [19.0, 19.15], done: 19.12, flick: 19.22, fly: [19.22, 19.68], write: [19.68, 20.2], line: 3 },
  tickets: { hop: [19.3, 19.66], zip: true, connect: { show: 19.62, click: 19.92, sheet: [19.95, 20.4] }, tap: 20.12, open: 20.17,
    scan: [20.2, 20.42], hl: [20.36, 20.6], pull: [20.62, 20.77], done: 20.74, flick: 20.84, fly: [20.84, 21.3], write: [21.3, 21.82], line: 4 },
  mail: { hop: [20.92, 21.28], zip: true, tap: 21.46, open: 21.51, scan: [21.54, 21.76], hl: [21.7, 21.94], pull: [21.96, 22.1],
    done: 22.08, flick: 22.18, fly: [22.18, 22.64], write: [22.64, 23.16], line: 5 },
};

export const STEP_START = [6.1, 8.3, 22.42, 25.3];
export const STEP_TICK = [8.26, 22.42, 25.3, 27.62];
export const FOLD = 22.5;              // the widgets fold into the sources list, one every 0.08 s
export const SRC_IN = 22.42;           // the sources card appears

// Step 3: the Peer perches on the notebook's top edge and writes the summary, two lines.
export const S3 = { zip: [22.5, 22.98], pencil: 23.1, lines: [[23.3, 24.08], [24.36, 25.06]], back: [24.1, 24.32], away: 25.18 };
// Step 4: it takes four cards from the notebook and pins them on a small board.
export const S4 = { boardIn: 25.25, grab: 25.36, hop: [25.44, 25.96], slaps: [26.14, 26.52, 26.9, 27.28], bow: [27.7, 28.2] };

// ---------------------------------------------------------------- what I learned
export const LEARN = {
  hudOut: [28.0, 28.6], boardOut: [28.05, 28.6], fly: [28.2, 29.0], open: [28.85, 29.55],
  peerHop: [28.5, 29.1],                 // the Peer hops onto the spread's top edge
  cards: 29.25, summary: [29.5, 31.1], tags: 30.9,
  tapHop: [31.15, 31.6], tap: 31.72, tagOpen: [31.8, 32.35],
  thread: [32.3, 33.25], docIn: [32.2, 32.8], plug: 33.2, rest: [33.3, 33.8],
  sweep: 33.9,                           // each fact's link and date glows in turn
  closeAt: 36.25,
};

// ---------------------------------------------------------------- your brief
export const BRIEF = {
  close: [36.25, 36.85], boardIn: [36.45, 37.35], expand: [37.1, 37.7],
  peerIn: [36.7, 37.3], stickies: [38.0, 38.95, 39.9, 40.85], perch: [41.45, 41.95],
  glow: 42.2, out: [44.6, 45.3],
};

// ---------------------------------------------------------------- ask your Peer
export const ASK = {
  widgetsIn: 45.0, boxIn: [45.3, 45.9], hopTo: [45.0, 45.5],
  type: 46.0,                            // typing starts; 26 characters a second
  fold: [47.62, 48.3], plane: [48.3, 48.8], catch: 48.82,
  stops: [                               // the search: four places, each glows
    { w: "slack", at: [49.05, 49.38], chip: 49.42 },
    { w: "slack", at: [49.7, 49.92], chip: 49.98, dx: -150 },
    { w: "mail", at: [50.28, 50.62], chip: 50.68 },
    { w: "code", at: [50.98, 51.46], chip: 51.52 },
  ],
  back: [51.85, 52.35], unfold: [52.3, 53.0], sentences: 52.9, stampLift: 54.55, stamp: 55.02,
  hang: 55.3, out: [57.4, 57.95],
};

// ---------------------------------------------------------------- how it works: the rules
export const RULES = {
  signIn: [57.85, 58.5], cabIn: [57.95, 58.6], peerHop: [57.8, 58.35],
  lit: [58.75, 59.65, 60.35, 63.3, 63.62, 63.94],
  badgeTap: 58.62, card: [59.45, 60.25], tagShow: [60.3, 60.9],
  docIn: [60.7, 61.5], whisper: [61.0, 62.3], read: [61.5, 62.0], camLook: 62.0, shake: [62.12, 62.62],
  grab: 62.68, drawer: [62.7, 63.0, 63.42, 63.62], file: [62.8, 63.32], wave: [64.05, 64.95],
};

// ---------------------------------------------------------------- the end: home into the button
export const END = { pageIn: [64.7, 65.45], hop: [65.5, 66.08], gone: 66.12 };

// ---------------------------------------------------------------- the camera: [t, [cx, cy, scale]]
export const CAM = [
  [0, [960, 540, 1]], [5.7, [960, 540, 1]],
  [6.75, [760, 482, 1.1]], [8.35, [790, 486, 1.1]],
  [9.45, [1000, 492, 1.06]], [11.1, [1012, 496, 1.06]], [11.95, [1180, 500, 1.08]], [12.6, [1170, 500, 1.08]],
  [13.55, [1105, 485, 1.18]], [14.35, [1110, 472, 1.32]], [16.75, [1112, 474, 1.32]],
  [17.75, [960, 540, 1.0]], [22.45, [962, 540, 1.0]],
  [23.25, [1560, 430, 1.14]], [25.1, [1575, 438, 1.14]],
  [25.95, [1000, 522, 1.0]], [27.95, [1004, 524, 1.0]],
  [28.75, [960, 540, 1.0]], [33.6, [960, 540, 1.0]],
  [34.6, [1180, 530, 1.1]], [36.0, [1196, 540, 1.1]],
  [36.75, [960, 540, 1.0]], [42.0, [960, 540, 1.0]],
  [43.2, [990, 528, 1.05]], [44.6, [996, 530, 1.05]],
  [45.4, [960, 540, 1.0]], [45.85, [1000, 520, 1.03]], [46.6, [1330, 372, 1.24]], [47.7, [1336, 376, 1.24]],
  [48.55, [960, 540, 1.0]], [55.4, [960, 540, 1.0]], [57.4, [990, 420, 1.06]],
  [58.3, [960, 540, 1.0]], [70, [960, 540, 1.0]],
];

// ---------------------------------------------------------------- captions
export const CAPTIONS = [
  { at: 3.1, to: 5.4, text: CW.click },
  { at: 6.1, to: 8.9, text: CW.directory },
  { at: 9.1, to: 12.9, text: CW.search },
  { at: 13.7, to: 17.7, text: CW.connect },
  { at: 22.7, to: 25.5, text: CW.write },
  { at: 25.6, to: 28.3, text: CW.brief },
  { at: 28.9, to: 32.9, text: CW.learned },
  { at: 37.2, to: 41.2, text: CW.yourBrief },
  { at: 45.6, to: 48.4, text: CW.ask },
  { at: 52.9, to: 56.9, text: CW.answer },
  { at: 58.4, to: 62.4, text: CW.rules },
];
