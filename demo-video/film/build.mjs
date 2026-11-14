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
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const FILM = path.dirname(fileURLToPath(import.meta.url));
export const PRIVATE = path.join(os.homedir(), ".ai-peer", "demo-video-private");
const REPO = path.resolve(FILM, "..", "..");
const MARK = ".film-build";

const readJson = (p) => JSON.parse(fs.readFileSync(p, "utf8"));
const home = (p) => (p.startsWith("~/") ? path.join(os.homedir(), p.slice(2)) : p.startsWith("repo:") ? path.join(REPO, p.slice(5)) : p);
const onGrid = (x, fps) => Math.abs(x * fps - Math.round(x * fps)) < 1e-6;
const r3 = (x) => Math.round(x * 1000) / 1000;

/** Where a run keeps its files. A lane gives a helper its own folders, so two runs never share a build. */
export function runHome(variant, lane) {
  if (variant === "private") return PRIVATE;
  return lane ? path.join(FILM, ".build", "lanes", lane) : path.join(FILM, ".build");
}
export function buildDir(variant, lane) {
  return path.join(runHome(variant, lane), variant === "private" ? "build" : lane ? "project" : "public");
}

/** Loudness of a piece of a file's sound: overall RMS (dBFS) and a 0..1 level per film frame. */
function listen(file, start, length, fps) {
  const raw = execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-nostdin", "-ss", String(start), "-t", String(length),
    "-i", file, "-vn", "-ac", "1", "-ar", "8000", "-f", "f32le", "-"], { maxBuffer: 1 << 28 });
  const x = new Float32Array(raw.buffer, raw.byteOffset, Math.floor(raw.byteLength / 4));
  const step = 8000 / fps;
  const values = [];
  let total = 0;
  for (let i = 0; i * step < x.length; i++) {
    let sum = 0, n = 0;
    for (let j = Math.floor(i * step); j < Math.min(x.length, Math.floor((i + 1) * step)); j++) { sum += x[j] * x[j]; n++; }
    values.push(Math.sqrt(sum / Math.max(1, n)));
  }
  for (const v of x) total += v * v;
  const peak = Math.max(1e-6, ...values);
  return { rms_dbfs: 20 * Math.log10(Math.max(1e-6, Math.sqrt(total / Math.max(1, x.length)))), levels: values.map((v) => Math.round((v / peak) * 100) / 100) };
}

/** A sharper copy of a screenshot at twice the size (made once, kept in the private cache). */
function enlarged(file, name) {
  const dir = path.join(PRIVATE, "cache", "img");
  const out = path.join(dir, `${name}@2x.png`);
  if (!fs.existsSync(out) || fs.statSync(out).mtimeMs < fs.statSync(file).mtimeMs) {
    fs.mkdirSync(dir, { recursive: true });
    execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-nostdin", "-y", "-i", file,
      "-vf", "scale=iw*2:ih*2:flags=lanczos,unsharp=5:5:0.5:5:5:0", "-update", "1", out]);
  }
  return out;
}

/** One frame of a clip as a PNG, made once and kept in the build cache (AI clips are not private). */
function frameOf(clip, seconds) {
  const info = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-select_streams", "v:0", "-show_entries",
    "stream=nb_frames,r_frame_rate", "-of", "json", clip], { encoding: "utf8" })).streams[0];
  const [a, b] = info.r_frame_rate.split("/").map(Number);
  const frame = Math.max(0, Math.min(Number(info.nb_frames) - 1, Math.round(seconds * (a / b))));
  const dir = path.join(FILM, ".build", "cache", "stills");
  const stat = fs.statSync(clip);
  const out = path.join(dir, `${path.basename(clip, path.extname(clip))}-f${frame}-${stat.size}.png`);
  if (!fs.existsSync(out)) {
    fs.mkdirSync(dir, { recursive: true });
    const tmp = `${out}.${process.pid}.tmp.png`;
    // bt709 in, as the browser reads an untagged HD clip: the still must match the clip it follows
    execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-nostdin", "-y", "-i", clip,
      "-vf", `select=eq(n\\,${frame}),scale=in_color_matrix=bt709:in_range=tv:out_range=pc,format=rgb24`, "-frames:v", "1", "-update", "1", tmp]);
    fs.renameSync(tmp, out);
  }
  return { file: out, frame };
}

/** Mean colour [r, g, b] of a box (fractions of the picture) of an image file. */
function meanColour(file, x, y, w, h) {
  const raw = execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-nostdin", "-i", file,
    "-vf", `crop=iw*${w}:ih*${h}:iw*${x}:ih*${y},scale=1:1:flags=area,format=rgb24`, "-frames:v", "1", "-f", "rawvideo", "-"]);
  return [raw[0], raw[1], raw[2]];
}

/** Read the film and resolve what every slot shows. Throws on a timeline that does not hold. */
export function readFilm({ variant = "public", withScenes = [] } = {}) {
  const shots = readJson(path.join(FILM, "shots.json"));
  const narration = readJson(path.join(FILM, "audio", "narration.json"));
  const productPath = path.join(FILM, "product.json");
  const product = fs.existsSync(productPath) ? readJson(productPath) : { sources: {}, slots: {} };
  const { fps, seconds } = shots;
  // What tools/pull_shots.mjs brought from WP3 is laid over each slot.
  const pulledPath = path.join(FILM, "shots.pulled.json");
  const pulled = fs.existsSync(pulledPath) ? readJson(pulledPath).slots : {};
  shots.slots = shots.slots.map((s) => (s.clip && pulled[s.id] ? { ...s, ...pulled[s.id] } : s));
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
  const labels = [];  // what-happens labels on the product screens
  const chapters = []; // the opening card of each proof, with the night clock's hour
  const sceneLines = []; // captions of speech inside a recording (private build only)
  const privPath = path.join(PRIVATE, "product-private.json");
  const priv = variant === "private" && fs.existsSync(privPath) ? readJson(privPath) : {};
  const slots = shots.slots.map((s) => {
    const slot = { ...s, use: "slate" };
    delete slot.clip;
    if (s.kind === "ai") {
      if (s.clip) {
        const src = path.join(FILM, s.clip);
        if (!fs.existsSync(src)) problems.push(`slot ${s.id}: the clip ${s.clip} is missing`);
        if (s.clip_seconds && s.clip_seconds < (s.use_from_s || 0) + s.length - 0.05) problems.push(`slot ${s.id}: the clip is ${s.clip_seconds} s, too short for ${s.length} s from ${s.use_from_s || 0} s`);
        const to = `assets/shots/${path.basename(s.clip)}`;
        copies.push({ from: src, to });
        slot.use = "clip";
        // If the next shot dissolves in, this clip plays on under it for that long (as far as it has frames).
        const next = shots.slots[shots.slots.indexOf(s) + 1];
        const spare = s.clip_seconds ? s.clip_seconds - (s.use_from_s || 0) - s.length - 0.05 : 0;
        const tail = next && next.dissolve_in && next.part === s.part ? Math.max(0, Math.min(next.dissolve_in, Math.floor(spare * fps) / fps)) : 0;
        slot.tail = tail;
        slot.video = { id: `v-${s.id}`, src: to, start: s.start, length: r3(s.length + tail), mediaStart: s.use_from_s || 0, rate: 1 };
        media.push(slot.video);
      }
    } else if (s.kind === "code") {
      // A scene by code is used once it is listed as ready in shots.json (or asked for with --with).
      const ready = (shots.scenes_ready || []).includes(s.scene) || withScenes.includes(s.scene);
      if (ready && fs.existsSync(path.join(FILM, "src", "scenes", `${s.scene}.js`))) slot.use = "scene";
    } else if (s.kind === "product") {
      const cut = product.slots[s.id];
      slot.slateNote = "<b>Product screen.</b> A real recording, kept on this Mac only: the private render shows it.";
      if (variant === "private" && cut) {
        const missing = [...cut.pictures, ...(cut.sound || [])].map((x) => x.source).filter(Boolean)
          .filter((name) => !product.sources[name] || !fs.existsSync(home(product.sources[name].file)));
        if (missing.length) {
          notes.push(`slot ${s.id}: "${missing[0]}" is not on this Mac, so it stays a slate`);
        } else {
          slot.use = "scene";
          slot.window = product.window;
          slot.chapter = cut.chapter || null;
          slot.pictures = cut.pictures.map((pic, pi) => {
            const out = { ...pic };
            const src = pic.source ? product.sources[pic.source] : null;
            if (pic.type === "video") {
              const to = `assets/private/${pic.source}${path.extname(src.file)}`;
              if (!copies.some((c) => c.to === to)) copies.push({ from: home(src.file), to });
              out.width = src.width; out.height = src.height;
              out.frameWidth = src.frame_width || src.width; out.frameHeight = src.frame_height || src.height;
              out.videos = pic.beats.map((bt, bi) => {
                const v = { id: `v-${s.id}-${pi}-${bi}`, src: to, start: r3(s.start + bt.at), length: bt.length, mediaStart: bt.in, rate: bt.rate || 1 };
                media.push(v);
                return v;
              });
            } else if (pic.type === "image") {
              const to = `assets/private/${pic.source}@2x.png`;
              if (!copies.some((c) => c.to === to)) copies.push({ from: enlarged(home(src.file), pic.source), to });
              out.src = to; out.width = src.width; out.height = src.height;
            } else if (pic.type === "tile") {
              out.name = priv.tile_name || "AI Peer";
            }
            return out;
          });
          slot.levels = [];
          for (const c of cut.sound || []) {
            const file = home(product.sources[c.source].file);
            const heard = listen(file, c.in, c.length, fps);
            sound.push({ id: c.id, file, start: r3(s.start + c.at), length: c.length, in: c.in, gain_db: Math.round((-20 - heard.rms_dbfs) * 10) / 10 });
            slot.levels.push({ at: c.at, length: c.length, values: heard.levels });
            const text = (priv.captions || {})[c.id];
            if (text) {
              const words = text.split(/\s+/);
              const span = c.length - 0.3;
              sceneLines.push({ id: c.id, part: s.part, speaker: "product", text, start: r3(s.start + c.at + 0.12), seconds: r3(span),
                words: words.map((w, i) => ({ w, s: r3((i * span) / words.length), e: r3(((i + 1) * span) / words.length) })), file: null });
            }
          }
          for (const l of cut.labels || []) labels.push({ slot: s.id, start: r3(s.start + l.at), length: l.length, text: l.text });
          if (cut.chapter) chapters.push({ slot: s.id, start: s.start, length: cut.chapter.length, hour: cut.chapter.hour, text: cut.chapter.text });
        }
      } else if (variant === "private") {
        slot.slateNote = "<b>Product screen.</b> No recording of this yet.";
      }
    }
    return slot;
  });

  // ---- the push-in: out of the shot before it, through the laptop's screen, into what follows ---
  slots.forEach((slot, i) => {
    if (slot.use !== "scene" || slot.scene !== "pushin") return;
    const before = shots.slots[i - 1];
    const after = slots[i + 1];
    const clip = before && before.clip ? path.join(FILM, before.clip) : null;
    const hand = clip ? (slot.hand_quads || {})[path.basename(clip)] : null;
    const quad = (before && before.screen_quad) || hand;
    if (!clip || !fs.existsSync(clip) || !quad || !after) {
      slot.use = "slate";
      notes.push(`slot ${slot.id}: ${!clip ? "the shot before it has no clip" : !quad ? `no screen corners for ${path.basename(clip)}` : "nothing follows it"}, so it stays a slate`);
      return;
    }
    if (quad.length !== 4 || quad.some((c) => c.length !== 2 || c.some((v) => !(v >= 0 && v <= 1)))) {
      problems.push(`slot ${slot.id}: the screen corners must be four [x, y] pairs as fractions of the frame`);
      return;
    }
    const still = frameOf(clip, (before.use_from_s || 0) + before.length);
    const to = `assets/gen/${path.basename(still.file)}`;
    copies.push({ from: still.file, to });
    const xs = quad.map((c) => c[0]), ys = quad.map((c) => c[1]);
    const bx = Math.min(...xs), by = Math.min(...ys), bw = Math.max(...xs) - bx, bh = Math.max(...ys) - by;
    const lands = after.use === "scene" && after.scene === "product" ? "product" : "slate";
    slot.pushin = {
      still: to, quad, lands,
      sharp: before.last_still || null,   // WP3's sharper still of the same frame, if it gave one
      tint: meanColour(still.file, bx + bw * 0.35, by + bh * 0.35, bw * 0.3, bh * 0.3),
      window: lands === "product" ? after.window : { x: 0, y: 0, w: shots.width, h: shots.height },
      draft: before.grade === "draft",
    };
    if (lands === "product") after.landed = true;   // its window is already there: no arrival
    if (!before.screen_quad) notes.push(`slot ${slot.id}: screen corners set by hand for ${path.basename(clip)} (WP3 gave none)`);
  });

  // ---- the "AI Peer" tag on the double: WP3's track of the chest, or keys set by hand ----------
  slots.forEach((slot, i) => {
    const s = shots.slots[i];
    if (!s.tag || slot.use !== "clip") return;
    const name = path.basename(s.clip);
    const hand = s.tag_keys && s.tag_keys.for === name ? s.tag_keys : null;
    if (s.tag_keys && s.tag_keys.for && !hand) notes.push(`slot ${s.id}: its hand-set tag keys are for ${s.tag_keys.for}, not ${name}: not used`);
    // a track made on this Mac from the hand-set keys (tools/tag_track.py), in WP3's format
    const own = path.join(FILM, "assets", "tags", `${path.basename(name, path.extname(name))}.tag.json`);
    const useTrack = (file) => {
      const track = readJson(file);
      const frames = [];
      for (const e of Array.isArray(track) ? track : track.frames || []) frames[e.f] = [e.x, e.y, e.w, e.on ? 1 : 0];
      for (let f = 0; f < frames.length; f++) if (!frames[f]) frames[f] = [0, 0, 0, 0];
      if (!frames.length) problems.push(`slot ${s.id}: the tag track ${path.relative(FILM, file)} is empty`);
      slot.tagTrack = { fps: s.clip_fps || 24, from: s.use_from_s || 0, frames };
    };
    if (s.tag_track) {
      useTrack(path.join(FILM, s.tag_track));
    } else if (hand && fs.existsSync(own)) {
      useTrack(own);
      notes.push(`slot ${s.id}: the tag follows a track made here from hand-set keys (WP3 gave none)`);
    } else if (hand) {
      slot.tagKeys = hand.keys;
      notes.push(`slot ${s.id}: the tag is placed by hand-set keys (WP3 gave no track)`);
    } else {
      notes.push(`slot ${s.id}: no tag track and no keys for ${name}: no tag on the double`);
    }
    // When the tag shows is an edit decision that follows the narration: it holds for any clip.
    if (s.tag_keys && s.tag_keys.show) slot.tagShow = s.tag_keys.show;
    delete slot.tag_keys;
  });
  for (const slot of slots) { delete slot.hand_quads; delete slot.tag_keys; }

  // ---- the spoken lines --------------------------------------------------------------------------
  const lines = narration.lines.map((n) => {
    let start = shots.narration[n.id];
    if (start == null) problems.push(`line ${n.id} has no start time in shots.json`);
    const slot = shots.slots.find((s) => s.line === n.id);
    if (slot && slot.clip && slot.line_at_s != null) start = r3(slot.start + slot.line_at_s - (slot.use_from_s || 0));
    return { id: n.id, part: n.part, speaker: n.speaker, text: n.text, start, seconds: n.seconds, words: n.words, rms_dbfs: n.rms_dbfs, file: path.join(FILM, n.file) };
  });
  lines.push(...sceneLines);
  lines.sort((a, b) => a.start - b.start);
  lines.forEach((l, i) => {
    const part = shots.parts.find((p) => p.id === l.part);
    const end = l.start + l.seconds;
    if (l.start < part.start || end > part.start + part.length) problems.push(`line ${l.id} (${r3(l.start)} to ${r3(end)}) leaves its part ${part.id}`);
    const slot = shots.slots.find((s) => s.line === l.id);
    if (slot && (l.start < slot.start || end > slot.start + slot.length)) problems.push(`line ${l.id} (${r3(l.start)} to ${r3(end)}) leaves its shot ${slot.id}`);
    const next = lines[i + 1];
    if (next && next.start < end + 0.1) problems.push(`line ${next.id} starts ${r3(next.start - end)} s after ${l.id} ends: they touch`);
    if (l.file && !fs.existsSync(l.file)) problems.push(`line ${l.id}: ${l.file} is missing (run tools/voice.py, or git lfs pull)`);
    // One text at a time: a label or a chapter card never shares the screen with a spoken line.
    for (const x of [...labels, ...chapters]) {
      if (l.start - 0.05 < x.start + x.length && x.start < end + 0.05) problems.push(`"${x.text}" (${x.start} to ${r3(x.start + x.length)}) is on screen while line ${l.id} is spoken (${r3(l.start)} to ${r3(end)})`);
    }
  });

  if (problems.length) throw new Error("The film does not hold together:\n  - " + problems.join("\n  - "));

  const overlays = [...new Set([...(shots.overlays_ready || []), ...withScenes])]
    .filter((n) => fs.existsSync(path.join(FILM, "src", "overlays", `${n}.js`)));
  const film = {
    variant, fps, seconds, width: shots.width, height: shots.height, bpm: shots.bpm,
    parts: shots.parts, slots, overlays, labels, chapters,
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
export function build({ variant = "public", lane, withScenes = [], out = buildDir(variant, lane) } = {}) {
  const read = readFilm({ variant, withScenes });
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
  // A slot may name the file its scene is drawn with ("scene_file"): it takes the scene's place
  // in the build. Used to pin a draft to a snapshot while the scene itself is still being made.
  for (const slot of read.film.slots) {
    if (slot.use === "scene" && slot.scene_file) fs.copyFileSync(path.join(FILM, slot.scene_file), path.join(out, "src", "scenes", `${slot.scene}.js`));
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
