// Tag: the few words this concept needs beyond shared/data.js. All made up, in our own words,
// consistent with data.js (Ram, Host Payouts, Payments, Dublin, Nov 15). Everything else on
// screen comes from data.js.
import { person, learned, sources } from "../shared/data.js";

export const X = {
  // The rail and the tag's home in it.
  railSub: person.team,
  spotAway: "out reading as ram",
  railLine: "always labelled as AI · it only reads",
  // Setup.
  topPill: "Reading as ram · read-only",
  sourceOf: (i, n) => `Source ${i} of ${n} · read-only`,
  statusReading: "reading…",
  statusConnect: "needs sign-in",
  statusRead: "read",
  readingAs: "Reading as Ram…",
  notesTitle: "Notes",
  notesSub: "it only reads · nothing is changed",
  entryMeta: "1 entry · read as Ram",
  connectTitle: "Needs your sign-in",
  connectBtn: (name) => `Connect ${name}`,
  connectSub: "Connect once, with your own sign-in",
  sheetTitle: "Signed in as ram",
  sheetSub: "read-only · private to you",
  more: (n) => `and ${n} more`,
  skipChip: "not shared with Ram",
  skipped: (n) => `${n} skipped, never opened`,
  // The page.
  updated: `${learned.asOf.split(" · ")[0]} · kept in your browser`,
  buttons: ["Catch me up", "Change sources", "Erase it all"],
  briefHead: "Your brief · Nov 15",
  next: "Next:",
  // Ask.
  placeholder: "Type a question about your work",
  askBtn: "Ask",
  thinking: "Thinking",
  thinkingSub: "Reading your sources again, as Ram",
  answerHead: "Ram's AI Peer",
  confidence: "Confidence",
  confLevel: "High",
  sourcesLabel: "Sources",
  // The rules card: the back of the tag.
  rulesHead: "Ram's AI Peer · how it works",
  // The next day.
  nextDay: "Mon, Nov 16 · 8:40 AM",
  updatedNext: "Updated Nov 16, 8:41 AM · kept in your browser",
  briefHeadNext: "Your brief · Nov 16 · refreshed",
  forgotten: "Erased from this browser. Nothing is kept.",
  // Captions in our own words (the rest are data.js captionWords).
  capCalm: "It suggests, and you choose",
  capNextDay: "The next day, your Peer is still here, kept in this browser",
  capRefresh: "Catch me up reads your sources again, as you",
  capForget: "Erase it all, and the tag is a plain label again",
};

// What each source gave: its count split for the cards ("24 docs" / "latest Nov 13"), and the
// line the Peer keeps from it (from data.js reads).
export const GAVE = {
  directory: { count: "Your entry", sub: X.entryMeta, key: "Staff Engineer · Host Payouts", more: 0 },
  docs: { count: "24 docs", sub: "latest Nov 13", key: "Payout retry v2 · design doc", more: 20 },
  slack: { count: "31 messages", sub: "in 14 days", key: "Retry v2 is live for 10% of payouts in Mexico", more: 28 },
  code: { count: "5 pull requests", sub: "latest Nov 13", key: "PR #4182 · Retry limit per market", more: 3 },
  tickets: { count: "4 tickets", sub: "latest Nov 14", key: "INC-20431 · Partner bank outage, Brazil", more: 2 },
  mail: { count: "12 threads", sub: "latest Nov 14", key: "Brazil fraud threshold drops on Thursday", more: 10 },
};
// Which line of each card's list is the key line.
export const KEY_ROW = { directory: 0, docs: 0, slack: 2, code: 0, tickets: 0, mail: 0 };

export const shortName = Object.fromEntries(sources.map((s) => [s.id, s.short]));
