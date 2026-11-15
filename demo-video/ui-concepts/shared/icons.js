// Generic line icons (24 x 24, stroke = currentColor), one per source and a few for the page.
// No brand logos: "Slack" is a name here, drawn as a plain chat icon.
const svg = (body, sw = 1.8) =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${sw}" stroke-linecap="round" stroke-linejoin="round">${body}</svg>`;

export const icons = {
  directory: svg('<rect x="3.5" y="4.5" width="17" height="15" rx="2.5"/><circle cx="9.5" cy="11" r="2.6"/><path d="M5.8 17.2c.8-2 2.2-3 3.7-3s2.9 1 3.7 3"/><path d="M15 9.5h3M15 12.5h3"/>'),
  docs: svg('<path d="M7 3.5h7l4.5 4.5v11.5a1.5 1.5 0 0 1-1.5 1.5H7a1.5 1.5 0 0 1-1.5-1.5v-14A1.5 1.5 0 0 1 7 3.5z"/><path d="M14 3.5V8h4.5"/><path d="M8.5 12.5h7M8.5 15.5h7M8.5 18h4"/>'),
  slack: svg('<path d="M4.5 6.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H11l-4 3.5v-3.5H6.5a2 2 0 0 1-2-2z"/><path d="M10 8.2l-1 6M14 8.2l-1 6M8.4 10.3h7M8 12.6h7"/>'),
  code: svg('<path d="M8.5 7.5L4 12l4.5 4.5M15.5 7.5L20 12l-4.5 4.5M13.5 5.5l-3 13"/>'),
  tickets: svg('<path d="M4 7.5a1.5 1.5 0 0 1 1.5-1.5h13A1.5 1.5 0 0 1 20 7.5V10a2 2 0 0 0 0 4v2.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 16.5V14a2 2 0 0 0 0-4z"/><path d="M14.5 6.5v11" stroke-dasharray="1.6 2"/>'),
  mail: svg('<rect x="3.5" y="5.5" width="17" height="13" rx="2"/><path d="M4.5 7l7.5 6 7.5-6"/>'),
  calendar: svg('<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 9.5h16M8.5 3.5v3M15.5 3.5v3"/>'),
  check: svg('<path d="M5 12.5l4.2 4.2L19 7"/>', 2.4),
  lock: svg('<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 8 0v2.5"/>'),
  unlock: svg('<rect x="5" y="10.5" width="14" height="10" rx="2"/><path d="M8 10.5V8a4 4 0 0 1 7.6-1.7"/>'),
  key: svg('<circle cx="8" cy="12" r="3.5"/><path d="M11.5 12H20M17 12v3M19.5 12v2"/>'),
  link: svg('<path d="M10 14l4-4"/><path d="M8.5 11.5l-2 2a3 3 0 0 0 4.2 4.2l2-2"/><path d="M15.5 12.5l2-2a3 3 0 0 0-4.2-4.2l-2 2"/>'),
  spark: svg('<path d="M12 3.5l1.9 5.1 5.1 1.9-5.1 1.9L12 17.5l-1.9-5.1L5 10.5l5.1-1.9z"/><path d="M18.5 16l.7 1.8 1.8.7-1.8.7-.7 1.8-.7-1.8-1.8-.7 1.8-.7z"/>', 1.6),
  search: svg('<circle cx="10.5" cy="10.5" r="5.5"/><path d="M15 15l4.5 4.5"/>'),
  shield: svg('<path d="M12 3.5l7 2.8v5.2c0 4.3-3 7.7-7 9-4-1.3-7-4.7-7-9V6.3z"/><path d="M9 12l2.2 2.2L15.5 10"/>'),
  eye: svg('<path d="M2.5 12s3.5-6.5 9.5-6.5S21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="2.8"/>'),
  user: svg('<circle cx="12" cy="8.5" r="3.6"/><path d="M5 19.5c1.2-3.3 3.8-5 7-5s5.8 1.7 7 5"/>'),
  home: svg('<path d="M4 11l8-6.5 8 6.5"/><path d="M6.5 9.5v9h11v-9"/>'),
  book: svg('<path d="M4.5 5.5c2.5-1 5-1 7.5.5 2.5-1.5 5-1.5 7.5-.5v13c-2.5-1-5-1-7.5.5-2.5-1.5-5-1.5-7.5-.5z"/><path d="M12 6v13"/>'),
  ask: svg('<path d="M4.5 6.5a2 2 0 0 1 2-2h11a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H11l-4 3.5v-3.5H6.5a2 2 0 0 1-2-2z"/><path d="M10 8.8a2 2 0 1 1 2.7 1.9c-.5.2-.7.6-.7 1.1v.4M12 14.2v.1"/>'),
  rules: svg('<path d="M12 3.5l7 2.8v5.2c0 4.3-3 7.7-7 9-4-1.3-7-4.7-7-9V6.3z"/>'),
};

export const sourceIcon = (id) => icons[id] || icons.docs;
