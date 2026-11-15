// Every time in the film, in one place (seconds of the video). 70 s in all.
export const CLICK = 4.4;
export const FOLD = { a: 4.55, land: 5.42, settle: 5.8 };
export const WIPE = { a: 5.42, b: 6.3 };
export const OUT = 6.95; // the courier rises out of the roof hatch

// Setup: each source's visit. show = keycard up; green = door light turns green (as you);
// read = windows light; flash = camera flash (a copy); copy = copies fly into the basket;
// count = the count floats up; leave = it flies on.
export const V = {
  directory: { arrive: 8.0, show: 8.0, green: 8.28, read: [8.3, 9.0], card: [8.45, 9.5], copy: [9.18, 9.58], count: 9.45, leave: 9.62 },
  docs: { arrive: 10.2, show: 10.2, green: 10.45, read: [10.5, 11.3], list: [10.45, 11.35], flash: 10.98, copy: [10.98, 11.5], count: 11.3, leave: 11.62 },
  slack: { arrive: 12.2, show: 12.24, look: [12.5, 13.3], click: 13.2, sheet: [13.25, 14.45], green: 13.5, gate: 13.5, inside: 14.25, read: [14.3, 15.0], list: [14.28, 15.05], flash: 14.58, copy: [14.58, 15.12], count: 15.0, leave: 15.22 },
  code: { arrive: 15.66, click: 15.76, green: 15.9, read: [15.92, 16.5], flash: 16.1, copy: [16.1, 16.5], count: 16.38, leave: 16.56 },
  tickets: { arrive: 17.0, click: 17.1, green: 17.22, read: [17.24, 17.7], flash: 17.36, copy: [17.36, 17.72], count: 17.64, leave: 17.78 },
  mail: { arrive: 18.32, show: 18.32, green: 18.55, read: [18.57, 19.08], flash: 18.68, copy: [18.68, 19.12], count: 18.98, leave: 19.22 },
};
export const HOME = 19.98;
export const PIN = [20.2, 20.65, 21.1, 21.55, 22.0, 22.45]; // the six notes pinned on the roof board
export const STEP_DONE = [9.62, 19.25, 23.2, 25.95];
export const STEP_START = [5.95, 9.62, 19.25, 23.2];
export const PRESS = { a: 23.35, out: [23.7, 24.7], roll: [24.7, 25.4], b: 25.6 };
export const SRCLINE = [25.95, 28.1];

export const LEARN = { cam: 27.3, morph: [27.85, 28.75], items: 28.5, trace: [30.9, 33.9], back: [34.75, 35.4] };
export const BRIEF = { grab: 35.55, drop: 36.3, land: 36.62, unroll: [37.0, 37.95], items: 37.75, roll: [43.25, 43.95] };
export const ASK = {
  rise: [44.35, 45.1], type: 45.4, send: 47.2, pill: [47.25, 47.75],
  loop: [47.5, 51.6], stops: { docs: 48.2, slack: 49.0, code: 49.8, mail: 50.65 }, home: 51.6,
  answer: [51.95, 52.85], sentences: 52.7, sources: 54.4, gauge: [54.6, 55.5], asOf: 55.3, away: [56.3, 56.9],
};
export const RULES = { dusk: [56.4, 58.6], panel: [56.9, 57.5], on: [57.6, 58.5, 59.7, 60.7, 61.9, 62.9], vault: [58.5, 59.65], billboard: [60.6, 61.8], home: [61.9, 62.85], copy: [62.9, 63.8], pull: [63.6, 70] };
export const END = 66.4;
