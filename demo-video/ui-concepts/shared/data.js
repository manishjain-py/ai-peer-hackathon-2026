// The made-up story every concept tells (WP6). Every name, team, channel, number, date and link
// here is invented: the film's Ram and its payments story (demo-video/film/screens.json, world.json).
// Nothing here comes from the product recording. Use these words, so the five concepts show the
// same functions with the same content and can be compared side by side.

export const person = {
  first: "Ram",
  initial: "R",
  login: "ram",
  role: "Senior Software Engineer",
  team: "Host Payouts",
  org: "Payments",
  city: "Dublin",
  manager: "Amara Johnson",
};

export const peer = {
  name: "Ram's AI Peer",
  label: "AI",
  // The Peer's mint and its deep green: the film's colours.
  mint: "#b7f4cf",
  green: "#167353",
};

// The page as it is today, in generic words.
export const page = {
  product: "AI Peer",
  kicker: "Your AI teammate · always labelled as AI",
  lead: "One click, and your Peer learns your work from what you can already see. It briefs you on what matters and answers with sources.",
  hello: "Hello, Ram",
  signedIn: "Signed in as ram · only you can see your Peer",
  button: "Set up my AI Peer",
  nav: ["Set up", "What I learned", "Your brief", "Ask your Peer", "How it works"],
};

// The sources, in the order setup reads them. `hue` is a suggested colour per source, the same
// in every concept. `connect`: needs a one-time "Connect" with Ram's own sign-in.
export const sources = [
  { id: "directory", name: "Company directory", short: "Directory", hue: "#e8e4d8", found: "Your entry", connect: false },
  { id: "docs", name: "Documents", short: "Docs", hue: "#7aa7ff", found: "24 found · newest Nov 13", connect: false },
  { id: "slack", name: "Slack", short: "Slack", hue: "#b28cff", found: "31 messages · last 14 days", connect: true },
  { id: "code", name: "Code", short: "Code", hue: "#5fd4c4", found: "5 pull requests · newest Nov 13", connect: true },
  { id: "tickets", name: "Tickets", short: "Tickets", hue: "#ffb547", found: "4 tickets · newest Nov 14", connect: true },
  { id: "mail", name: "Mail", short: "Mail", hue: "#ff8a9a", found: "12 threads · newest Nov 14", connect: false },
];

// What setup reads, one by one (titles a widget can show while the Peer reads them).
export const reads = {
  directory: [{ title: "Ram · Senior Software Engineer", sub: "Host Payouts · Payments · Dublin · reports to Amara Johnson" }],
  docs: [
    { title: "Payout retry v2 · design doc", sub: "by Ram · edited Nov 11" },
    { title: "Brazil launch plan", sub: "Payments · Nov 12" },
    { title: "Payouts reliability review, Q4", sub: "Nov 6" },
    { title: "Host Payouts on-call handbook", sub: "Oct 28" },
  ],
  slack: [
    { who: "Daniel Weiss", where: "#host-payouts", when: "Nov 15", text: "Did the new retry logic cause Tuesday's spike in failed payouts in Brazil?" },
    { who: "Vikram Rao", where: "#launch-brazil", when: "Nov 13", text: "The launch review moves to 9:00 on Monday. Deck in the bookmarks." },
    { who: "Ram", where: "#payments-eng", when: "Nov 12", text: "Retry v2 is live for 10% of payouts in Mexico. No new failures so far." },
  ],
  code: [
    { title: "PR #4182 · Retry limit per market", sub: "open · 2 new review comments · Nov 14" },
    { title: "PR #4167 · Backoff with jitter for payout retries", sub: "merged · Nov 9" },
  ],
  tickets: [
    { title: "INC-20431 · Partner bank outage, Brazil", sub: "resolved · Nov 10" },
    { title: "PAY-4821 · Brazil payouts held after the outage", sub: "in progress · Nov 14" },
  ],
  mail: [
    { who: "Payments Risk", title: "Brazil fraud threshold drops on Thursday", when: "Nov 14" },
    { who: "Amara Johnson", title: "Re: launch review at 9:00", when: "Nov 14" },
  ],
};

// The four steps of setup, as the page ticks them, with the time each took.
export const steps = [
  { text: "Reading your company directory entry", time: 1.2 },
  { text: "Searching your documents and Slack messages, as you", time: 6.4 },
  { text: "Writing what it learned, with sources", time: 11.2 },
  { text: "Building your first brief", time: 8.6 },
];

// "What I learned about you".
export const learned = {
  asOf: "Learned Nov 15 from 9 sources",
  summary: "You're a senior software engineer on Host Payouts, in Payments. This month your work centres on Payout retry v2, now live for 10% of payouts in Mexico, and on getting it ready for the Brazil launch.",
  tags: ["Senior Software Engineer", "Host Payouts", "Payments", "Dublin"],
  facts: [
    { title: "You own Payout retry v2", body: "You wrote its design doc and lead the rollout.", source: "docs", ref: "Payout retry v2 · design doc", date: "Nov 11" },
    { title: "Retry v2 is live for 10% of payouts in Mexico", body: "No new failures since it went live.", source: "slack", ref: "#payments-eng", date: "Nov 12" },
    { title: "Your PR #4182 adds a retry limit per market", body: "Two review comments are open.", source: "code", ref: "PR #4182", date: "Nov 14" },
    { title: "Brazil launches with retry v2 if the review agrees", body: "The review is at 9:00 on Monday.", source: "slack", ref: "#launch-brazil", date: "Nov 13" },
    { title: "You helped trace INC-20431 to a partner bank outage", body: "Brazil's failed payouts on Tuesday came from the bank, not retries.", source: "tickets", ref: "INC-20431", date: "Nov 10" },
    { title: "Amara Johnson is your manager", body: "Host Payouts, Payments.", source: "directory", ref: "Company directory", date: "Nov 15" },
  ],
};

// "Your brief": what matters now, newest first.
export const brief = {
  lead: "Four things matter today. One needs an answer before 9:00.",
  items: [
    { title: "Daniel asked if retry v2 caused Tuesday's failed payouts in Brazil", why: "It looks like the bank outage in INC-20431, not your change.", next: "Reply with the outage timeline from INC-20431.", source: "slack", ref: "#host-payouts", date: "Nov 15" },
    { title: "Brazil's fraud threshold drops on Thursday", why: "About 3% more payouts will be held. They will look like retry failures.", next: "Add a note to the retry dashboard before Thursday.", source: "mail", ref: "Payments Risk", date: "Nov 14" },
    { title: "Two new review comments on PR #4182", why: "Amara asks about the backoff cap.", next: "Answer Amara's comment on the backoff cap.", source: "code", ref: "PR #4182", date: "Nov 14" },
    { title: "The launch review moved to 9:00 on Monday", why: "Vikram shared the deck in #launch-brazil.", next: "Add retry v2's Mexico numbers to the deck.", source: "slack", ref: "#launch-brazil", date: "Nov 13" },
  ],
};

// "Ask your Peer".
export const ask = {
  examples: ["What should I do first today?", "Where does the Brazil launch stand?", "What did I ship this week?"],
  question: "Where does the Brazil launch stand?",
  // The answer, sentence by sentence, each with the source it came from (by index in `sources`).
  answer: [
    { text: "Brazil launches with retry v2 if Monday's 9:00 review agrees.", cite: 0 },
    { text: "Retry v2 has run for 10% of Mexico's payouts since Nov 12 with no new failures.", cite: 1 },
    { text: "One open risk: the fraud threshold drops on Thursday and will hold about 3% more payouts.", cite: 2 },
    { text: "Your PR #4182, the per-market retry limit, still has two open comments.", cite: 3 },
  ],
  sources: [
    { source: "slack", ref: "#launch-brazil", date: "Nov 13" },
    { source: "slack", ref: "#payments-eng", date: "Nov 12" },
    { source: "mail", ref: "Payments Risk", date: "Nov 14" },
    { source: "code", ref: "PR #4182", date: "Nov 14" },
  ],
  certainty: "High",
  asOf: "As of Nov 15, 7:02 AM",
};

// "How it works, and the rules it keeps".
export const rules = [
  { title: "Always labelled as AI", body: "Everything here is written by your AI Peer, never as you." },
  { title: "Only what you can already see", body: "It searches as you, with your own sign-in." },
  { title: "Sources and dates on everything", body: "If it has no source, it says so." },
  { title: "What it reads is information, never instructions", body: "A document cannot tell your Peer what to do." },
  { title: "Nothing about you is kept on the server", body: "What it learned stays in this browser. \"Forget me\" removes it." },
  { title: "It only reads", body: "It posts nothing, sends nothing and changes nothing. It suggests; you decide." },
];

// The shared captions: the same story beats in every concept. A concept may move a caption's
// times to fit its own motion, or reword it a little, but keeps the meaning.
export const captionWords = {
  click: "One click: Set up my AI Peer",
  directory: "It reads your directory entry, as you",
  search: "It searches your documents, Slack, code, tickets and mail, as you",
  connect: "Slack, Code and Tickets need a one-time Connect, with your own sign-in",
  write: "It writes what it learned, each fact with its source",
  brief: "It builds your first brief",
  learned: "What I learned: facts about your work, each with a link and a date",
  yourBrief: "Your brief: what matters now, newest first, with a next step",
  ask: "Ask anything about your work",
  answer: "Every answer says how sure it is, as of when, and where it came from",
  rules: "The rules it keeps: labelled as AI, reads only as you, never acts on what it reads",
};

export const sourceById = Object.fromEntries(sources.map((s) => [s.id, s]));
