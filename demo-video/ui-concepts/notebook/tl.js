// Every time in the film, in one place (seconds of the video). 70 s in all.
export const SECONDS = 70;
export const CLICK = 4.4;

// Today's page shrinks onto the desk, folds shut like a book, becomes the cover, and the cover opens.
export const SHEET = { shrink: [4.55, 5.95], fold: [5.85, 6.65], morph: [6.5, 7.1], open: [7.1, 8.25] };
export const CARD_IN = [7.2, 8.05];

// The four steps: when each starts (its line is written on the card) and when it ticks.
export const STEP_START = [8.05, 10.2, 20.1, 23.85];
export const STEP_DONE = [10.15, 20.05, 23.8, 26.6];

// Setup, source by source. in = the clipping flies in and lands; tape = washi strips pressed on;
// hi = the highlighter sweep; note = the pen starts its note; row = the card's row and the edge tab.
// Slack, Code and Tickets arrive sealed: ptr = the pointer on screen, click = Connect, open = the seal comes off.
export const SRC = {
  directory: { in: [8.3, 8.85], tape: 8.9, hi: [9.0, 9.3], note: 9.36, row: 10.1 },
  docs: { in: [10.3, 10.75], tape: 10.8, hi: [10.9, 11.2], note: 11.24, row: 12.0 },
  slack: { in: [12.0, 12.5], tape: 12.55, ptr: [12.45, 13.75], click: 13.12, slip: [13.2, 14.3], open: [13.32, 13.9], hi: [14.0, 14.36], note: 14.42, row: 15.3 },
  code: { in: [15.3, 15.72], tape: 15.75, ptr: [15.55, 16.45], click: 15.98, open: [16.04, 16.4], hi: [16.4, 16.62], note: 16.66, row: 17.4 },
  tickets: { in: [17.3, 17.68], tape: 17.7, ptr: [17.5, 18.35], click: 17.9, open: [17.96, 18.3], hi: [18.28, 18.48], note: 18.52, row: 19.2 },
  mail: { in: [18.9, 19.28], tape: 19.3, hi: [19.33, 19.52], note: 19.55, row: 20.05 },
};
export const SRC_ORDER = ["directory", "docs", "slack", "code", "tickets", "mail"];

// Page turns: leaf index, start, end, direction (+1 to the left, -1 back to the right).
export const TURNS = [
  { leaf: 0, a: 7.1, b: 8.25, dir: 1, rigid: true },          // the cover opens
  { leaf: 1, a: 20.2, b: 21.35, dir: 1 },                     // step 3: to "What I learned"
  { leaf: 2, a: 23.9, b: 24.7, dir: 1 },                      // step 4: to "Your brief"
  { leaf: 2, a: 28.55, b: 29.55, dir: -1 },                   // back to "What I learned"
  { leaf: 2, a: 37.0, b: 38.0, dir: 1 },                      // on to "Your brief"
  { leaf: 3, a: 45.35, b: 46.35, dir: 1 },                    // to a fresh page: "Ask your Peer"
  // it searches again: the pages riffle back to the sources, then forward again
  { leaf: 3, a: 50.45, b: 51.0, dir: -1 },
  { leaf: 2, a: 50.62, b: 51.17, dir: -1 },
  { leaf: 1, a: 50.79, b: 51.4, dir: -1 },
  { leaf: 1, a: 52.25, b: 52.8, dir: 1 },
  { leaf: 2, a: 52.42, b: 52.97, dir: 1 },
  { leaf: 3, a: 52.59, b: 53.15, dir: 1 },
  // the rules: riffle to the inside back cover
  { leaf: 4, a: 59.5, b: 60.1, dir: 1 },
  { leaf: 5, a: 59.62, b: 60.2, dir: 1 },
  { leaf: 6, a: 59.73, b: 60.3, dir: 1 },
  { leaf: 7, a: 59.84, b: 60.4, dir: 1 },
  { leaf: 8, a: 59.95, b: 60.55, dir: 1 },
];
export const CLOSE = [64.65, 65.75];                         // the notebook closes

// What I learned
export const LEARN = { stamps: [29.85, 30.15, 30.45, 30.75], glow: 32.2, tip: [32.55, 33.3], fold: [35.05, 35.6] };
// Your brief
export const BRIEF = { stamp: 38.55, items: [39.1, 40.6, 42.1, 43.6] };
// Ask your Peer
export const ASK = {
  head: 46.42, sticky: [46.95, 47.45], write: 47.6, penOut: [49.45, 49.9], search: 49.7,
  chips: [50.05, 50.13, 50.21, 50.29], flash: [51.48, 51.65, 51.82, 51.99], answer: 53.25, stamp: 57.5,
};
// The rules
export const RULES = { seal: 61.0, doodles: 60.75, lit: 62.05 };
export const END = SECONDS - 3.6;
