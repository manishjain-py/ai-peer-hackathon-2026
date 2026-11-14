// The film. One page whose picture is a pure function of the film time: the renderer seeks
// each frame on its own ("hf-seek"), often out of order, so nothing here keeps state between
// frames, uses a timer, or reads the clock.
import film from "../film-data.js";
import { el, show, prng } from "./lib.js";
import { createSlate } from "./scenes/slate.js";
import { createCaptions } from "./overlays/captions.js";

const root = document.getElementById("root");
const bootError = document.getElementById("boot-error");

function fail(message) {
  bootError.textContent = "Film error: " + message;
  bootError.style.display = "flex";
  console.error("[film] " + message);
}
window.addEventListener("error", (e) => fail(e.message || "script error"));
window.addEventListener("unhandledrejection", (e) => fail(String(e.reason && e.reason.message ? e.reason.message : e.reason)));

// Scenes made by code register here by the name a slot gives in shots.json ("scene").
const makers = {};

async function loadMakers() {
  const wanted = new Set(film.slots.filter((s) => s.use === "scene").map((s) => s.scene));
  if (film.slots.some((s) => s.use === "clip")) wanted.add("clip");
  for (const name of wanted) {
    const mod = await import(`./scenes/${name}.js`);
    makers[name] = mod.create;
  }
}

async function start() {
  // Fonts first: captions and titles measure their text.
  await Promise.all(["500", "600", "650", "700", "800"].map((w) => document.fonts.load(`${w} 40px Manrope`)));
  await document.fonts.ready;
  if (!document.fonts.check("600 40px Manrope")) throw new Error("the Manrope font did not load");
  await loadMakers();
  const shots = el("div.layer", { id: "shots" });
  const over = el("div.layer.pass", { id: "over" });
  root.append(shots, over);

  // One scene per slot: the clip if there is one, the code scene if it is built, else a slate.
  const scenes = [];
  for (const slot of film.slots) {
    let scene;
    if (slot.use === "clip") scene = await makers.clip(slot, film);
    else if (slot.use === "scene") scene = await makers[slot.scene](slot, film);
    else scene = createSlate(slot, film, slot.slateNote);
    scene.from = scene.from ?? slot.start;
    scene.to = scene.to ?? slot.start + slot.length;
    shots.append(scene.el);
    scenes.push(scene);
  }

  // Things that sit over the shots.
  const overlays = [];
  for (const name of film.overlays || []) {
    const mod = await import(`./overlays/${name}.js`);
    const o = await mod.create(film);
    over.append(o.el);
    overlays.push(o);
  }
  const captions = createCaptions(film);
  root.append(captions.el);

  // Fine grain over everything, moved every frame by a fixed rule: it hides the banding that
  // H.264 gives dark gradients.
  const tile = document.createElement("canvas");
  tile.width = tile.height = 256;
  const g = tile.getContext("2d");
  const noise = g.createImageData(256, 256);
  const rnd = prng(20261114);
  for (let i = 0; i < noise.data.length; i += 4) {
    const v = Math.floor(rnd() * 256);
    noise.data[i] = noise.data[i + 1] = noise.data[i + 2] = v;
    noise.data[i + 3] = 255;
  }
  g.putImageData(noise, 0, 0);
  const grain = el("div", { id: "grain" });
  grain.style.backgroundImage = `url(${tile.toDataURL()})`;
  root.append(grain);

  function renderAt(t) {
    for (const s of scenes) {
      const on = t >= s.from && t < s.to;
      show(s.el, on);
      if (on) s.render(t);
    }
    for (const o of overlays) o.render(t);
    captions.render(t);
    const frame = Math.round(t * film.fps);
    grain.style.backgroundPosition = `${(frame * 73) % 256}px ${(frame * 151) % 256}px`;
  }

  window.addEventListener("hf-seek", (e) => {
    try {
      const wait = renderAt(e.detail.time);
      if (wait && e.detail.waitUntil) e.detail.waitUntil(wait);
    } catch (err) {
      fail(err.message);
    }
  });
  window.__film = { renderAt, film };
  renderAt(0);
  bootError.style.display = "none";
}

start().then(
  () => window.__filmReady && window.__filmReady(),
  (err) => {
    fail(err.message);
    window.__filmReady && window.__filmReady();
  },
);
