// Today's page, in generic words, as the opening of every concept: the left rail, "Hello, Ram"
// and the "Set up my AI Peer" button. A concept starts from it, then turns it into its own idea,
// so every video shows the same starting point. Also a pointer (the mouse) to click with.
import { el } from "./kit.js";
import { page, person, sources } from "./data.js";
import { icons, sourceIcon } from "./icons.js";

const CSS = `
.tp { position: absolute; inset: 0; background: #f6f7f5; color: #1b2027; font-family: "Inter", sans-serif; display: flex; }
.tp-rail { width: 288px; height: 100%; background: #fbfbfa; border-right: 1px solid #e6e8e4; padding: 34px 26px; display: flex; flex-direction: column; }
.tp-logo { display: flex; align-items: center; gap: 12px; font: 700 23px/1 "Inter", sans-serif; letter-spacing: -0.01em; }
.tp-logo i { width: 34px; height: 34px; border-radius: 10px; background: #167353; color: #b7f4cf; display: grid; place-items: center; font: 800 14px/1 "Manrope", sans-serif; font-style: normal; }
.tp-h { margin: 38px 0 12px; font: 700 12.5px/1 "Inter", sans-serif; letter-spacing: 0.14em; color: #8a929c; text-transform: uppercase; }
.tp-nav { display: flex; flex-direction: column; gap: 4px; }
.tp-nav div { display: flex; align-items: center; gap: 12px; padding: 10px 12px; border-radius: 10px; font: 500 17px/1 "Inter", sans-serif; color: #3b434d; }
.tp-nav div.on { background: #e7f3ec; color: #12563f; font-weight: 600; }
.tp-nav svg, .tp-src svg { width: 20px; height: 20px; flex: none; }
.tp-src { display: flex; flex-direction: column; gap: 2px; }
.tp-src div { display: flex; align-items: center; gap: 12px; padding: 8px 12px; font: 500 15.5px/1.2 "Inter", sans-serif; color: #5a636e; }
.tp-me { margin-top: auto; display: flex; align-items: center; gap: 12px; font: 600 16px/1 "Inter", sans-serif; color: #3b434d; }
.tp-av { width: 38px; height: 38px; border-radius: 50%; background: #dfeee5; color: #12563f; display: grid; place-items: center; font: 700 16px/1 "Inter", sans-serif; }
.tp-main { flex: 1; padding: 72px 110px; position: relative; }
.tp-kicker { font: 700 14px/1 "Inter", sans-serif; letter-spacing: 0.16em; text-transform: uppercase; color: #167353; }
.tp-title { margin-top: 18px; font: 700 64px/1.05 "Inter", sans-serif; letter-spacing: -0.03em; color: #10151b; }
.tp-lead { margin-top: 18px; max-width: 900px; font: 400 23px/1.5 "Inter", sans-serif; color: #59626d; }
.tp-card { margin-top: 44px; width: 980px; padding: 34px 36px; border-radius: 22px; background: #fff; border: 1px solid #e3e6e1; box-shadow: 0 1px 2px rgba(16,24,40,.04), 0 12px 32px rgba(16,24,40,.06); }
.tp-hello { display: flex; align-items: center; gap: 18px; }
.tp-hello .tp-av { width: 58px; height: 58px; font-size: 22px; }
.tp-hello b { display: block; font: 700 27px/1.2 "Inter", sans-serif; letter-spacing: -0.01em; }
.tp-hello span { display: block; margin-top: 6px; font: 400 17px/1.3 "Inter", sans-serif; color: #6b7480; }
.tp-btn { margin-top: 30px; display: inline-flex; align-items: center; gap: 12px; padding: 18px 30px; border-radius: 14px; background: #167353; color: #fff; font: 600 21px/1 "Inter", sans-serif; box-shadow: 0 6px 18px rgba(22,115,83,.28); transform-origin: 50% 50%; }
.tp-btn svg { width: 22px; height: 22px; }
.tp-ghost { margin-top: 40px; width: 980px; display: flex; flex-direction: column; gap: 14px; }
.tp-ghost div { height: 18px; border-radius: 9px; background: #eceeea; }
.tp-cursor { position: absolute; left: 0; top: 0; width: 38px; height: 38px; z-index: 30; pointer-events: none; filter: drop-shadow(0 3px 5px rgba(0,0,0,.3)); transform-origin: 6px 4px; }
`;

let styled = false;

export function todayPage(parent) {
  if (!styled) {
    el("style", null, document.head, CSS);
    styled = true;
  }
  const root = el("div", "tp", parent);
  const rail = el("div", "tp-rail", root);
  el("div", "tp-logo", rail, `<i>AI</i>${page.product}`);
  el("div", "tp-h", rail, "Your Peer");
  const nav = el("div", "tp-nav", rail);
  const navIcons = [icons.spark, icons.book, icons.home, icons.ask, icons.shield];
  page.nav.forEach((n, i) => el("div", i === 0 ? "on" : "", nav, `${navIcons[i]}${n}`));
  el("div", "tp-h", rail, "Sources");
  const src = el("div", "tp-src", rail);
  sources.forEach((s) => el("div", "", src, `${sourceIcon(s.id)}${s.name}`));
  el("div", "tp-me", rail, `<div class="tp-av">${person.initial}</div>${person.first}`);

  const main = el("div", "tp-main", root);
  el("div", "tp-kicker", main, page.kicker);
  el("div", "tp-title", main, page.product);
  el("div", "tp-lead", main, page.lead);
  const card = el("div", "tp-card", main);
  el("div", "tp-hello", card, `<div class="tp-av">${person.initial}</div><div><b>${page.hello}</b><span>${page.signedIn}</span></div>`);
  const button = el("div", "tp-btn", card, `${icons.spark}${page.button}`);
  const ghost = el("div", "tp-ghost", main);
  [100, 92, 96, 70].forEach((w) => el("div", "", ghost).style.width = `${w}%`);

  return { root, rail, main, card, button, ghost };
}

// A mouse pointer. pointer.at(x, y, down) puts its tip at (x, y) in the parent's pixels; down
// (0..1) presses it a little.
export function pointer(parent) {
  const p = el("div", "tp-cursor", parent,
    `<svg viewBox="0 0 24 24" width="38" height="38"><path d="M5 3.2l13.2 8.4-5.9 1.3 3.4 6.4-2.6 1.4-3.4-6.5L5.2 18z" fill="#111" stroke="#fff" stroke-width="1.4" stroke-linejoin="round"/></svg>`);
  return {
    el: p,
    at(x, y, down = 0, opacity = 1) {
      p.style.transform = `translate(${x - 6}px, ${y - 4}px) scale(${1 - 0.12 * down})`;
      p.style.opacity = String(opacity);
    },
  };
}

// The centre of an element in the stage's pixels (call in init, after layout; the stage is
// 1920 x 1080 at the page's origin).
export function centre(e) {
  const r = e.getBoundingClientRect();
  return [r.left + r.width / 2, r.top + r.height / 2];
}
