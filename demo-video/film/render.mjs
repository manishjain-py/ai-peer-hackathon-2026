#!/usr/bin/env node
// render: the one command that makes the film.
//
//   node demo-video/film/render.mjs                    the whole film, product screens as slates
//   node demo-video/film/render.mjs --part reveal      one part (hook, reveal, proof, morning, close)
//   node demo-video/film/render.mjs --from 30 --to 40  any window, in film seconds
//   node demo-video/film/render.mjs --private          the full film with the product recordings;
//                                                      everything it writes stays under
//                                                      ~/.ai-peer/demo-video-private/
//   options: --name NAME (file name)  --quality draft|looks|delivery  --workers N  --no-check
//
// Steps: build the project (build.mjs) -> check that the page runs -> capture the picture with
// HyperFrames (pinned) -> mix the sound with ffmpeg -> join -> probe and measure the result.
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { build, FILM, PRIVATE } from "./build.mjs";
import { ffprobe, measure, mix, voiceOverMusic } from "./tools/mix.mjs";

const HYPERFRAMES = "hyperframes@0.9.45";

function parse(argv) {
  const a = { quality: "looks" };
  for (let i = 0; i < argv.length; i++) {
    const k = argv[i];
    if (k === "--private") a.private = true;
    else if (k === "--no-check") a.noCheck = true;
    else if (k === "--no-sound") a.noSound = true;
    else if (["--part", "--from", "--to", "--name", "--quality", "--workers"].includes(k)) a[k.slice(2)] = argv[++i];
    else throw new Error(`unknown option ${k}`);
  }
  return a;
}

/** Run the pinned HyperFrames CLI with an environment that holds no key and sends no telemetry. */
function hyperframes(args, { cwd, tmp, capture = false }) {
  const env = {
    PATH: process.env.PATH, HOME: os.homedir(), LANG: process.env.LANG || "en_US.UTF-8",
    TMPDIR: tmp || process.env.TMPDIR || os.tmpdir(),
    DO_NOT_TRACK: "1", HYPERFRAMES_NO_TELEMETRY: "1", HYPERFRAMES_SKIP_SKILLS: "1",
  };
  const r = spawnSync("npx", ["--yes", HYPERFRAMES, ...args], {
    cwd, env, encoding: "utf8", maxBuffer: 1 << 28, stdio: capture ? ["ignore", "pipe", "pipe"] : ["ignore", "inherit", "inherit"],
  });
  return r;
}

function preflight(project, tmp, seconds) {
  // The renderer exits 0 even when the page's script is dead (seen in the trial: a missing
  // file gave a full-length render of nothing). So ask the checker first and stop on any
  // error the page throws or any file it cannot load.
  const r = hyperframes(["check", "--json", "--no-craft", "--no-contrast", "--no-cache", "--samples", "8"], { cwd: project, tmp, capture: true });
  const text = r.stdout || "";
  let report;
  try {
    report = JSON.parse(text.slice(text.indexOf("{")));
  } catch {
    throw new Error("the page check gave no report:\n" + (text + (r.stderr || "")).split("\n").slice(-15).join("\n"));
  }
  const runtime = report.runtime || {};
  if (runtime.errorCount > 0) {
    const lines = (runtime.findings || []).map((x) => `  - ${x.message || x.code || JSON.stringify(x).slice(0, 200)}`);
    throw new Error(`the film page has ${runtime.errorCount} error(s):\n${lines.join("\n")}`);
  }
  const lint = report.lint || {};
  return { runtimeErrors: 0, lintErrors: lint.errorCount || 0, lintWarnings: lint.warningCount || 0,
    lintFindings: (lint.findings || []).map((x) => `${x.severity || ""} ${x.code || x.rule || ""}: ${(x.message || "").slice(0, 140)}`) };
}

function main() {
  const args = parse(process.argv.slice(2));
  const variant = args.private ? "private" : "public";
  const t0 = Date.now();
  const b = build({ variant });
  const { film } = b;
  const home = variant === "private" ? PRIVATE : path.join(FILM, ".build");
  const work = path.join(home, "work");
  const tmp = variant === "private" ? path.join(PRIVATE, "tmp") : undefined;
  const renders = variant === "private" ? path.join(PRIVATE, "renders") : path.join(FILM, "renders");
  for (const d of [work, renders, tmp].filter(Boolean)) fs.mkdirSync(d, { recursive: true });

  let from = 0, to = film.seconds, label = "";
  if (args.part) {
    const p = film.parts.find((x) => x.id === args.part);
    if (!p) throw new Error(`no part "${args.part}": ${film.parts.map((x) => x.id).join(", ")}`);
    from = p.start; to = p.start + p.length; label = `-${p.id}`;
  } else if (args.from != null || args.to != null) {
    from = Number(args.from ?? 0); to = Number(args.to ?? film.seconds); label = `-${from}-${to}`;
  }
  const name = (args.name || (variant === "private" ? "film" : "film-slates")) + label;
  const count = (u) => film.slots.filter((s) => s.use === u).length;
  console.log(`film: ${film.seconds} s, ${film.slots.length} slots (${count("clip")} clips, ${count("scene")} by code, ${count("slate")} slates), ${b.lines.length} spoken lines, ${variant}`);
  for (const n of b.notes) console.log("note: " + n);

  if (!args.noCheck) {
    const pre = preflight(b.out, tmp, film.seconds);
    console.log(`page check: no errors on the page (lint: ${pre.lintErrors} errors, ${pre.lintWarnings} warnings)`);
    for (const x of pre.lintFindings.slice(0, 8)) console.log("  lint " + x);
  }

  // ---- the picture ---------------------------------------------------------------------------------
  const picture = path.join(work, `${name}.picture.mp4`);
  const rargs = ["render", "-o", picture, "--fps", String(film.fps), "--quality", args.quality, "--quiet"];
  if (from > 0 || to < film.seconds) rargs.push("--start", String(from), "--end", String(to));
  if (args.workers) rargs.push("--workers", String(args.workers));
  if (variant === "private") rargs.push("--frames-cache-dir", path.join(PRIVATE, "cache"));
  fs.rmSync(picture, { force: true });
  const r = hyperframes(rargs, { cwd: b.out, tmp, capture: true });
  if (r.status !== 0 || !fs.existsSync(picture)) {
    throw new Error("the picture did not render:\n" + ((r.stdout || "") + (r.stderr || "")).split("\n").slice(-25).join("\n"));
  }

  // ---- the sound -----------------------------------------------------------------------------------
  const mixPath = path.join(FILM, "audio", "mix.json");
  const cfg = fs.existsSync(mixPath) ? JSON.parse(fs.readFileSync(mixPath, "utf8")) : {};
  const abs = (p) => (path.isAbsolute(p) ? p : path.join(FILM, p));
  const plan = {
    seconds: film.seconds,
    lines: b.lines.map((l) => ({ id: l.id, file: l.file, start: l.start, seconds: l.seconds, rms_dbfs: l.rms_dbfs })),
    sound: b.sound,
    music: cfg.music && fs.existsSync(abs(cfg.music.file)) ? { ...cfg.music, file: abs(cfg.music.file) } : null,
    sfx: (cfg.sfx || []).filter((e) => fs.existsSync(abs(e.file))).map((e) => ({ ...e, file: abs(e.file) })),
  };
  const out = path.join(renders, `${name}.mp4`);
  let sound = null;
  if (args.noSound) {
    fs.copyFileSync(picture, out);
  } else {
    sound = mix(plan, path.join(work, `${name}.sound`), cfg.master || {});
    const cut = from > 0 || to < film.seconds ? ["-ss", String(from), "-t", String(to - from)] : [];
    execFileSync("ffmpeg", ["-hide_banner", "-nostdin", "-loglevel", "error", "-y", "-i", picture, ...cut, "-i", sound.file,
      "-map", "0:v", "-map", "1:a", "-c:v", "copy", "-c:a", "aac", "-b:a", "256k", "-ar", "48000",
      "-t", String(to - from), "-movflags", "+faststart", out]);
  }

  // ---- what came out -------------------------------------------------------------------------------
  const probe = ffprobe(out);
  const v = probe.streams.find((s) => s.codec_type === "video");
  const seconds = Number(probe.format.duration);
  const report = {
    file: out, variant, window: [from, to], seconds, frames: Number(v.nb_frames), size: `${v.width}x${v.height}`, fps: v.r_frame_rate,
    megabytes: Math.round(Number(probe.format.size) / 1e5) / 10,
    slots: { clips: count("clip"), by_code: count("scene"), slates: count("slate") },
    took_s: Math.round((Date.now() - t0) / 1000),
  };
  if (sound) {
    report.loudness = { before_master: sound.before, mix: sound.after, in_file: measure(out) };
    report.voice_over_music_db = voiceOverMusic(plan, sound.stems);
    report.sound_work = path.dirname(sound.file);
  }
  fs.writeFileSync(path.join(work, `${name}.report.json`), JSON.stringify(report, null, 1) + "\n");
  console.log(JSON.stringify(report, null, 1));
  const problems = [];
  if (seconds > to - from + 0.001) problems.push(`it runs ${seconds} s, the window is ${to - from} s`);
  if (v.width !== film.width || v.height !== film.height) problems.push(`it is ${v.width}x${v.height}`);
  if (v.r_frame_rate !== `${film.fps}/1`) problems.push(`its frame rate is ${v.r_frame_rate}`);
  if (problems.length) throw new Error("the render is not right: " + problems.join("; "));
  console.log(`done: ${out}`);
}

try {
  main();
} catch (e) {
  console.error("render failed: " + e.message);
  process.exit(1);
}
