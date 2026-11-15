#!/usr/bin/env node
// Renders one UI concept to an mp4, frame by frame, with the film's pinned renderer.
//
//   node demo-video/ui-concepts/render.mjs <concept-folder> [options]
//
//   --from S --to S     render only this span (seconds); the file is named <name>-S-S.mp4
//   --quality Q         draft (fast, for looking) | looks (default) | delivery (packed for sending)
//   --name NAME         file name (default: the concept folder's name)
//   --sheet N           also write <name>-sheet.png: N frames spread over the render, 320 px wide
//   --at a,b,c          also write <name>-at.png: the frames at these seconds of the render, 320 px wide
//   --workers N         renderer workers (default 4, so three renders can run side by side)
//   --no-check          skip the page check (not advised: the renderer exits 0 on a dead page)
//
// A concept folder holds concept.json ({ number, title, line, change, seconds }), scene.js (the
// scene module, see shared/runtime.js) and anything else it needs (style.css, assets). The build
// goes to .build/<concept>/ (never committed); the render to renders/ (committed by name only,
// with git add -f, like the film's renders).
import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { spawnSync, execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const HERE = path.dirname(fileURLToPath(import.meta.url));
const HYPERFRAMES = "hyperframes@0.9.45";

function parse(argv) {
  const a = { _: [] };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === "--no-check") a.noCheck = true;
    else if (["--from", "--to", "--quality", "--name", "--sheet", "--at", "--workers"].includes(k)) a[k.slice(2)] = argv[++i];
    else if (k.startsWith("--")) throw new Error(`unknown option ${k}`);
    else a._.push(k);
  }
  return a;
}

function hyperframes(args, cwd, tmp, capture) {
  const env = {
    PATH: process.env.PATH, HOME: os.homedir(), LANG: process.env.LANG || "en_US.UTF-8", TMPDIR: tmp,
    DO_NOT_TRACK: "1", HYPERFRAMES_NO_TELEMETRY: "1", HYPERFRAMES_SKIP_SKILLS: "1",
    // Up to three concept renders may run at once; each uses few workers, so they do not starve.
    HYPERFRAMES_RENDER_LOCK: "off",
  };
  return spawnSync("npx", ["--yes", HYPERFRAMES, ...args], {
    cwd, env, encoding: "utf8", maxBuffer: 1 << 28, stdio: capture ? ["ignore", "pipe", "pipe"] : ["ignore", "inherit", "inherit"],
  });
}

// The renderer exits 0 even when the page's script is dead, so ask its checker first and stop on
// any error the page throws or any file it cannot load (the film's lesson).
function preflight(project, tmp) {
  const r = hyperframes(["check", "--json", "--no-craft", "--no-contrast", "--no-cache", "--samples", "6"], project, tmp, true);
  const text = r.stdout || "";
  let report;
  try {
    report = JSON.parse(text.slice(text.indexOf("{")));
  } catch {
    throw new Error("the page check gave no report:\n" + (text + (r.stderr || "")).split("\n").slice(-15).join("\n"));
  }
  const runtime = report.runtime || {};
  if (runtime.errorCount > 0) {
    const lines = (runtime.findings || []).map((x) => `  - ${x.message || x.code || JSON.stringify(x).slice(0, 300)}`);
    throw new Error(`the concept page has ${runtime.errorCount} error(s):\n${lines.join("\n")}`);
  }
}

function build(concept) {
  const src = path.join(HERE, concept);
  const meta = JSON.parse(fs.readFileSync(path.join(src, "concept.json"), "utf8"));
  for (const k of ["number", "title", "line", "seconds"]) if (meta[k] == null) throw new Error(`concept.json needs "${k}"`);
  if (!fs.existsSync(path.join(src, "scene.js"))) throw new Error(`${concept}/scene.js is missing`);
  const out = path.join(HERE, ".build", concept);
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out, { recursive: true });
  fs.cpSync(path.join(HERE, "shared"), path.join(out, "shared"), { recursive: true });
  fs.cpSync(src, path.join(out, "scene"), { recursive: true });
  const css = fs.existsSync(path.join(src, "style.css")) ? '\n    <link rel="stylesheet" href="scene/style.css" />' : "";
  const html = fs.readFileSync(path.join(HERE, "shared", "index.template.html"), "utf8")
    .replaceAll("{{TITLE}}", `AI Peer concept ${meta.number}: ${meta.title}`)
    .replaceAll("{{SECONDS}}", String(meta.seconds))
    .replace("{{SCENE_CSS}}", css);
  fs.writeFileSync(path.join(out, "index.html"), html);
  fs.writeFileSync(path.join(out, "concept-meta.js"), "export default " + JSON.stringify(meta, null, 1) + ";\n");
  fs.writeFileSync(path.join(out, "hyperframes.json"), JSON.stringify({ paths: { assets: "scene" } }, null, 2) + "\n");
  fs.writeFileSync(path.join(out, "meta.json"), JSON.stringify({ id: `ui-concept-${concept}`, name: `ui-concept-${concept}` }) + "\n");
  return { out, meta };
}

function probe(file) {
  const j = JSON.parse(execFileSync("ffprobe", ["-v", "error", "-show_entries", "format=duration,size:stream=width,height,r_frame_rate",
    "-of", "json", file], { encoding: "utf8" }));
  const s = j.streams[0];
  return { seconds: Number(j.format.duration), mb: Number(j.format.size) / 1e6, w: s.width, h: s.height, fps: s.r_frame_rate };
}

// A sheet: frames at the given seconds of the video, 320 px wide, four to a row.
function sheet(video, times, file, tmp) {
  const dir = fs.mkdtempSync(path.join(tmp, "sheet-"));
  times.forEach((t, i) => {
    execFileSync("ffmpeg", ["-hide_banner", "-nostdin", "-loglevel", "error", "-y", "-ss", t.toFixed(3), "-i", video,
      "-frames:v", "1", "-vf", "scale=320:-2", path.join(dir, `f${String(i).padStart(3, "0")}.png`)]);
  });
  const cols = Math.min(4, times.length), rows = Math.ceil(times.length / cols);
  execFileSync("ffmpeg", ["-hide_banner", "-nostdin", "-loglevel", "error", "-y", "-framerate", "1", "-i", path.join(dir, "f%03d.png"),
    "-vf", `tile=${cols}x${rows}:padding=4:color=white`, "-frames:v", "1", file]);
  fs.rmSync(dir, { recursive: true, force: true });
  return file;
}

function main() {
  const args = parse(process.argv.slice(2));
  const concept = (args._[0] || "").replace(/\/+$/, "");
  if (!concept || !fs.existsSync(path.join(HERE, concept))) throw new Error(`name a concept folder in ${HERE}`);
  const { out, meta } = build(concept);
  const tmp = path.join(HERE, ".build", `${concept}-tmp`);
  fs.rmSync(tmp, { recursive: true, force: true });
  fs.mkdirSync(tmp, { recursive: true });
  if (!args.noCheck) preflight(out, tmp);

  const from = args.from != null ? Number(args.from) : 0;
  const to = args.to != null ? Number(args.to) : meta.seconds;
  const span = from > 0 || to < meta.seconds;
  const name = (args.name || concept) + (span ? `-${from}-${to}` : "");
  const renders = path.join(HERE, "renders");
  fs.mkdirSync(renders, { recursive: true });
  const quality = args.quality || "looks";
  const raw = path.join(tmp, `${name}.raw.mp4`);
  const rargs = ["render", "-o", raw, "--fps", "30", "--quality", quality === "delivery" ? "looks" : quality, "--quiet",
    "--workers", String(args.workers || 4)];
  if (span) rargs.push("--start", String(from), "--end", String(to));
  const t0 = Date.now();
  const r = hyperframes(rargs, out, tmp, true);
  if (r.status !== 0 || !fs.existsSync(raw)) {
    throw new Error("the renderer failed:\n" + ((r.stdout || "") + (r.stderr || "")).split("\n").slice(-25).join("\n"));
  }
  // Every render is packed to H.264 yuv420p with fast start, so it plays everywhere; delivery is packed harder.
  const file = path.join(renders, `${name}.mp4`);
  const crf = quality === "delivery" ? "20" : quality === "draft" ? "28" : "23";
  execFileSync("ffmpeg", ["-hide_banner", "-nostdin", "-loglevel", "error", "-y", "-i", raw, "-c:v", "libx264", "-preset", "slow",
    "-crf", crf, "-pix_fmt", "yuv420p", "-profile:v", "high", "-movflags", "+faststart", "-an", file]);
  fs.rmSync(raw, { force: true });
  const p = probe(file);
  const problems = [];
  if (Math.abs(p.seconds - (to - from)) > 0.1) problems.push(`length ${p.seconds.toFixed(2)} s, not ${to - from}`);
  if (p.w !== 1920 || p.h !== 1080) problems.push(`size ${p.w}x${p.h}`);
  if (p.fps !== "30/1") problems.push(`frame rate ${p.fps}`);
  console.log(`${file}\n  ${p.seconds.toFixed(2)} s, ${p.w}x${p.h}, ${p.fps}, ${p.mb.toFixed(1)} MB, rendered in ${((Date.now() - t0) / 1000).toFixed(0)} s`);
  if (args.sheet) {
    const n = Number(args.sheet);
    const len = p.seconds;
    const times = Array.from({ length: n }, (_, i) => Math.min(len - 0.05, (i + 0.5) * (len / n)));
    console.log(`  sheet: ${sheet(file, times, path.join(renders, `${name}-sheet.png`), tmp)}\n  at (s of this file): ${times.map((t) => t.toFixed(1)).join(", ")}`);
  }
  if (args.at) {
    const times = args.at.split(",").map(Number).map((t) => t - from);
    console.log(`  frames: ${sheet(file, times, path.join(renders, `${name}-at.png`), tmp)}`);
  }
  fs.rmSync(tmp, { recursive: true, force: true });
  if (problems.length) throw new Error("the render is not right: " + problems.join("; "));
}

try {
  main();
} catch (e) {
  console.error("render failed: " + e.message);
  process.exit(1);
}
