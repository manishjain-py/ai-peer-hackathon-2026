// The runtime of a concept page. The picture is a pure function of the time t (seconds): the
// renderer seeks each frame on its own ("hf-seek"), often out of order and in several browsers at
// once, so a scene keeps no state between frames, uses no timer or animation loop, never reads the
// clock, and uses no unseeded random. It draws everything from t.
//
// A scene module (scene.js in the concept folder) exports, as default:
//   captions: [{ at, to, text }]      the short plain captions (seconds of the video)
//   async init(stage, ctx)            build the DOM / canvas / three.js once; preload and decode
//                                     every image here; ctx = { meta, root, stage, W, H, fps }
//   render(t)                         draw the frame at t; may return a promise the frame waits for
//
// The runtime adds the series framing on top (title card, a small corner tag, the end card) and
// the captions. Preview in a normal browser over http: index.html?t=12.5 draws that moment.
import { el, clamp, ease, prog } from "./kit.js";

const W = 1920, H = 1080;

function fail(err) {
  const box = document.getElementById("boot-error");
  const msg = (err && (err.stack || err.message)) || String(err);
  if (box) { box.textContent = "Concept error: " + msg; box.style.display = "block"; }
  console.error("concept error: " + msg);
}

// The title card, the corner tag and the end card: the same for every concept, so the five read
// as one series.
function framing(root, meta) {
  const total = meta.of || 5;
  // meta.kicker (WP7): the title card's first line, for a concept outside the five (the tag base).
  const kicker = meta.kicker || `AI Peer &middot; wow concept ${meta.number} of ${total}`;
  const veil = el("div", "fr-veil", root);
  const title = el("div", "fr-title", root);
  title.innerHTML = `
    <div class="fr-kicker">${kicker}</div>
    <div class="fr-name">${meta.title}</div>
    <div class="fr-line">${meta.line}</div>
    <div class="fr-foot">Same functions as today &middot; made-up data</div>`;
  const parts = [...title.children];
  const tag = el("div", "fr-tag", root);
  tag.textContent = `Concept ${meta.number} · ${meta.title} · made-up data`;
  const end = el("div", "fr-end", root);
  end.innerHTML = `
    <div class="fr-kicker">${kicker}</div>
    <div class="fr-name">${meta.title}</div>
    <div class="fr-line">${meta.line}</div>
    <div class="fr-foot">${meta.change ? "Function change: " + meta.change : "No change in function"}</div>`;
  const endParts = [...end.children];
  const S = meta.seconds;
  const endAt = S - 3.6;
  return {
    render(t) {
      // Title: in over the first second, out by 3.0 s.
      const vIn = 1 - prog(t, 2.5, 3.2);
      const vOut = prog(t, endAt, endAt + 0.7);
      veil.style.opacity = String(Math.max(vIn, vOut));
      const tOut = 1 - prog(t, 2.35, 2.9);
      title.style.display = t < 3.0 ? "flex" : "none";
      parts.forEach((p, i) => {
        const k = ease.outCubic(prog(t, 0.12 + i * 0.16, 0.8 + i * 0.16));
        p.style.opacity = String(k * tOut);
        p.style.transform = `translateY(${(1 - k) * 26}px)`;
        p.style.filter = `blur(${(1 - k) * 8}px)`;
      });
      end.style.display = t >= endAt ? "flex" : "none";
      endParts.forEach((p, i) => {
        const k = ease.outCubic(prog(t, endAt + 0.35 + i * 0.16, endAt + 1.0 + i * 0.16));
        p.style.opacity = String(k);
        p.style.transform = `translateY(${(1 - k) * 26}px)`;
        p.style.filter = `blur(${(1 - k) * 8}px)`;
      });
      const tagK = prog(t, 3.2, 3.8) * (1 - prog(t, endAt - 0.4, endAt));
      tag.style.opacity = String(0.85 * tagK);
    },
  };
}

// Captions: one at a time, bottom centre, a short fade in and out.
function captionsLayer(root, list) {
  const box = el("div", "cap", root);
  const text = el("span", "cap-text", box);
  return {
    render(t) {
      const c = list.find((x) => t >= x.at && t < x.to);
      if (!c) { box.style.opacity = "0"; return; }
      const k = Math.min(prog(t, c.at, c.at + 0.25), 1 - prog(t, c.to - 0.25, c.to));
      if (text.textContent !== c.text) text.textContent = c.text;
      box.style.opacity = String(ease.outQuad(clamp(k)));
      box.style.transform = `translateX(-50%) translateY(${(1 - ease.outQuad(clamp(k))) * 10}px)`;
    },
  };
}

async function start() {
  const root = document.getElementById("root");
  const stage = document.getElementById("stage");
  try {
    const meta = (await import("../concept-meta.js")).default;
    const scene = (await import("../scene/scene.js")).default;
    // Load every font the shared stylesheet declares before the first frame, so no frame falls
    // back to another face.
    await Promise.all([...document.fonts].map((f) => f.load().catch(() => null)));
    await document.fonts.ready;
    const ctx = { meta, root, stage, W, H, fps: 30 };
    if (scene.init) await scene.init(stage, ctx);
    // meta.framing === false: no title card, corner tag, end card or captions (for stills such as the overview).
    const off = meta.framing === false;
    const fr = off ? { render() {} } : framing(root, meta);
    const caps = off ? { render() {} } : captionsLayer(root, scene.captions || []);
    const renderAt = (t) => {
      const wait = scene.render(t);
      caps.render(t);
      fr.render(t);
      return wait;
    };
    window.addEventListener("hf-seek", (e) => {
      try {
        const wait = renderAt(e.detail.time);
        if (wait && e.detail.waitUntil) e.detail.waitUntil(wait);
      } catch (err) {
        fail(err);
      }
    });
    window.__concept = { renderAt, meta };
    const q = new URLSearchParams(location.search);
    await renderAt(q.has("t") ? Number(q.get("t")) : 0);
    document.getElementById("boot-error").style.display = "none";
  } catch (err) {
    fail(err);
  }
  if (window.__conceptReady) window.__conceptReady();
}

start();
