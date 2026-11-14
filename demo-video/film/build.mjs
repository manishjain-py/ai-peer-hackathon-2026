#!/usr/bin/env node
// build: shots.json + audio/narration.json (+ product.json in a private build) -> one
// self-contained HyperFrames project folder that render.mjs captures.
//
//   node demo-video/film/build.mjs                 the public film: product screens are slates
//   node demo-video/film/build.mjs --private       the full film, built under ~/.ai-peer/demo-video-private/
//
// A public build never reads a product recording. A private build puts every file that holds
// one (the build, the frame cache, the render) under ~/.ai-peer/demo-video-private/, outside
// every git checkout (DESIGN C8).
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const FILM = path.dirname(fileURLToPath(import.meta.url));
export const PRIVATE = path.join(os.homedir(), ".ai-peer", "demo-video-private");
const MARK = ".film-build";

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const home = (p) => (p.startsWith("~/") ? path.join(os.homedir(), p.slice(2)) : p);
const onGrid = (x, fps) => Math.abs(x * fps - Math.round(x * fps)) < 1e-6;
const r3 = (x) => Math.round(x * 1000) / 1000;

export function buildDir(variant) {
  return variant === "private" ? path.join(PRIVATE, "build") : path.join(FILM, ".build", "public");
}

/** Read the film and resolve what every slot shows. Throws on a timeline that does not hold. */
export function readFilm({ variant = "public" } = {}) {
  const shots = readJson(path.join(FILM, "shots.json"));
  const narration = readJson(path.join(FILM, "audio", "narration.json"));
  const productPath = path.join(FILM, "product.json");
  const product = fs.existsSync(productPath) ? readJson(productPath) : { sources: {}, slots: {} };
  const { fps, seconds } = shots;
  const problems = [];
  const notes = [];

  // ---- the timeline must tile: parts cover the film, slots cover each part -----------------
  let at = 0;
  for (const p of shots.parts) {
    if (Math.abs(p.start - at) > 1e-6) problems.push(`part ${p.id} starts at ${p.start}, expected ${at}`);
    at = p.start + p.length;
  }
  if (Math.abs(at - seconds) > 1e-6) problems.push(`the parts end at ${at}, the film is ${seconds} s`);
  if (seconds > 120) problems.push(`the film is ${seconds} s: the limit is 120`);
  for (const p of shots.parts) {
    let t = p.start;
    for (const s of shots.slots.filter((x) => x.part === p.id)) {
      if (Math.abs(s.start - t) > 1e-6) problems.push(`slot ${s.id} starts at ${s.start}, expected ${t}`);
      if (!onGrid(s.start, fps) || !onGrid(s.length, fps)) problems.push(`slot ${s.id} is not on the ${fps} fps frame grid`);
      t = s.start + s.length;
    }
    if (Math.abs(t - (p.start + p.length)) > 1e-6) problems.push(`the slots of part ${p.id} end at ${t}, the part ends at ${p.start + p.length}`);
  }
  const ids = new Set();
  for (const s of shots.slots) {
    if (ids.has(s.id)) problems.push(`slot id ${s.id} is used twice`);
    ids.add(s.id);
  }

  // ---- what each slot shows ---------------------------------------------------------------------
  const media = [];   // <video> tags the page needs
  const copies = [];  // files to place in the build: {from, to}
  const sound = [];   // sound that belongs to the picture (a recording's own audio)
  const slots = shots.slots.map((s) => {
    const slot = { ...s, use: "slate" };
    delete slot.clip;
    if (s.kind === "ai") {
      if (s.clip) {
        const src = path.join(FILM, s.clip);
        if (!fs.existsSync(src)) problems.push(`slot ${s.id}: the clip ${s.clip} is missing`);
        const to = `assets/shots/${path.basename(s.clip)}`;
        copies.push({ from: src, to });
        slot.use = "clip";
        slot.video = { id: `v-${s.id}`, src: to, start: s.start, length: s.length, mediaStart: s.use_from_s || 0, rate: 1 };
        media.push(slot.video);
      }
    } else if (s.kind === "code") {
      if (fs.existsSync(path.join(FILM, "src", "scenes", `${s.scene}.js`))) slot.use = "scene";
    } else if (s.kind === "product") {
      const cut = product.slots[s.id];
      slot.slateNote = "<b>Product screen.</b> A real recording, kept on this Mac only: the private render shows it.";
      if (variant === "private" && cut) {
        const from = home(product.sources[cut.source] || "");
        if (!from || !fs.existsSync(from)) {
          notes.push(`slot ${s.id}: the recording "${cut.source}" is not on this Mac, so it stays a slate`);
        } else {
          const to = `assets/private/${cut.source}${path.extname(from)}`;
          if (!copies.some((c) => c.to === to)) copies.push({ from, to, link: true });
          slot.use = "scene";
          slot.cut = cut;
          slot.videos = cut.beats.map((b, i) => {
            const v = { id: `v-${s.id}-${i}`, src: to, start: r3(s.start + b.at), length: b.length, mediaStart: b.in, rate: b.rate || 1 };
            media.push(v);
            if (b.sound) sound.push({ id: `${s.id}-${i}`, file: from, start: v.start, length: b.length, in: b.in, gain_db: b.sound_gain_db ?? 0 });
            return v;
          });
        }
      } else if (variant === "private") {
        slot.slateNote = "<b>Product screen.</b> No recording of this yet.";
      }
    }
    return slot;
  });

  // ---- the spoken lines --------------------------------------------------------------------------
  const lines = narration.lines.map((n) => {
    let start = shots.narration[n.id];
    if (start == null) problems.push(`line ${n.id} has no start time in shots.json`);
    const slot = shots.slots.find((s) => s.line === n.id);
    if (slot && slot.clip && slot.line_at_s != null) start = r3(slot.start + slot.line_at_s - (slot.use_from_s || 0));
    return { id: n.id, part: n.part, speaker: n.speaker, text: n.text, start, seconds: n.seconds, words: n.words, rms_dbfs: n.rms_dbfs, file: path.join(FILM, n.file) };
  });
  lines.sort((a, b) => a.start - b.start);
  lines.forEach((l, i) => {
    const part = shots.parts.find((p) => p.id === l.part);
    const end = l.start + l.seconds;
    if (l.start < part.start || end > part.start + part.length) problems.push(`line ${l.id} (${r3(l.start)} to ${r3(end)}) leaves its part ${part.id}`);
    const slot = shots.slots.find((s) => s.line === l.id);
    if (slot && (l.start < slot.start || end > slot.start + slot.length)) problems.push(`line ${l.id} (${r3(l.start)} to ${r3(end)}) leaves its shot ${slot.id}`);
    const next = lines[i + 1];
    if (next && next.start < end + 0.1) problems.push(`line ${next.id} starts ${r3(next.start - end)} s after ${l.id} ends: they touch`);
    if (!fs.existsSync(l.file)) problems.push(`line ${l.id}: ${l.file} is missing (run tools/voice.py, or git lfs pull)`);
  });

  if (problems.length) throw new Error("The film does not hold together:\n  - " + problems.join("\n  - "));

  const overlays = ["clock", "chips", "tag"].filter((n) => fs.existsSync(path.join(FILM, "src", "overlays", `${n}.js`)));
  const film = {
    variant, fps, seconds, width: shots.width, height: shots.height, bpm: shots.bpm,
    parts: shots.parts, slots, overlays,
    lines: lines.map(({ file, rms_dbfs, ...rest }) => rest),
  };
  return { film, lines, media, copies, sound, notes };
}

function videoTag(v) {
  const attrs = [
    `id="${v.id}"`, `class="clip"`, `data-start="${v.start}"`, `data-duration="${v.length}"`,
    `data-media-start="${v.mediaStart}"`, v.rate !== 1 ? `data-playback-rate="${v.rate}"` : "",
    `data-track-index="1"`, `src="${v.src}"`, "muted", "playsinline",
  ].filter(Boolean).join(" ");
  return `<div class="vhost" id="host-${v.id}"><video ${attrs}></video></div>`;
}

/** Write the project folder. Returns what was built. */
export function build({ variant = "public", out = buildDir(variant) } = {}) {
  const read = readFilm({ variant });
  if (variant !== "private" && read.copies.some((c) => c.to.startsWith("assets/private/"))) {
    throw new Error("a public build tried to use a private recording");
  }
  if (variant === "private" && !path.resolve(out).startsWith(PRIVATE + path.sep)) {
    throw new Error(`a private build must stay under ${PRIVATE}`);
  }
  // Clear only a folder this script made.
  if (fs.existsSync(out)) {
    if (fs.readdirSync(out).length && !fs.existsSync(path.join(out, MARK))) {
      throw new Error(`${out} exists and was not made by build.mjs: not touching it`);
    }
    fs.rmSync(out, { recursive: true, force: true });
  }
  fs.mkdirSync(out, { recursive: true });
  fs.writeFileSync(path.join(out, MARK), `made by build.mjs, variant ${variant}\n`);

  for (const dir of ["src", "vendor", "assets"]) {
    fs.cpSync(path.join(FILM, dir), path.join(out, dir), { recursive: true });
  }
  for (const c of read.copies) {
    const to = path.join(out, c.to);
    fs.mkdirSync(path.dirname(to), { recursive: true });
    if (!fs.existsSync(to)) fs.copyFileSync(c.from, to);
  }
  const template = fs.readFileSync(path.join(FILM, "src", "index.template.html"), "utf8");
  const html = template
    .replace("{{SECONDS}}", String(read.film.seconds))
    .replace("{{MEDIA}}", "\n        " + read.media.map(videoTag).join("\n        ") + "\n      ");
  fs.writeFileSync(path.join(out, "index.html"), html);
  fs.writeFileSync(path.join(out, "film-data.js"), "export default " + JSON.stringify(read.film, null, 1) + ";\n");
  fs.writeFileSync(path.join(out, "hyperframes.json"), JSON.stringify({ paths: { assets: "assets" }, media: { autoProxy: true } }, null, 2) + "\n");
  fs.writeFileSync(path.join(out, "meta.json"), JSON.stringify({ id: "ai-peer-film", name: "ai-peer-film" }) + "\n");
  return { out, ...read };
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const variant = process.argv.includes("--private") ? "private" : "public";
  try {
    const b = build({ variant });
    const count = (u) => b.film.slots.filter((s) => s.use === u).length;
    console.log(`built ${b.out}`);
    console.log(`  ${b.film.slots.length} slots: ${count("clip")} clips, ${count("scene")} scenes by code, ${count("slate")} slates; ${b.lines.length} spoken lines`);
    for (const n of b.notes) console.log("  note: " + n);
  } catch (e) {
    console.error(e.message);
    process.exit(1);
  }
}
