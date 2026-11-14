#!/usr/bin/env node
// pull_shots: bring WP3's current best clip of each AI shot into this project (SHOTS.md).
//
//   node demo-video/film/tools/pull_shots.mjs          copy what the manifest lists
//   node demo-video/film/tools/pull_shots.mjs --check  only say what would change
//
// Reads the manifest named in shots.json ("wp3_manifest"), copies each listed clip (and its
// tag track, its last still) into assets/shots/, sets that slot's "clip" in shots.json, and
// writes the other fields to shots.pulled.json, which build.mjs lays over the slot. It never
// writes in WP3's worktree. A slot missing from the manifest keeps its slate.
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const FILM = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const shotsPath = path.join(FILM, "shots.json");
const pulledPath = path.join(FILM, "shots.pulled.json");
const check = process.argv.includes("--check");

const shotsText = fs.readFileSync(shotsPath, "utf8");
const shots = JSON.parse(shotsText);
if (!fs.existsSync(shots.wp3_manifest)) {
  console.log(`no manifest at ${shots.wp3_manifest}: nothing to pull`);
  process.exit(0);
}
const manifest = JSON.parse(fs.readFileSync(shots.wp3_manifest, "utf8"));
const root = path.resolve(path.dirname(shots.wp3_manifest), "..", "..");   // WP3's worktree root
const pulled = { about: "Made by tools/pull_shots.mjs from WP3's manifest. Do not edit by hand.", manifest_updated_utc: manifest.updated_utc, slots: {} };
let text = shotsText;
const dest = path.join(FILM, "assets", "shots");
if (!check) fs.mkdirSync(dest, { recursive: true });

function bring(rel, id) {
  const from = path.join(root, rel);
  if (!fs.existsSync(from)) throw new Error(`the manifest names ${rel}, which is not there`);
  // Two slots may name their side files alike (tag-track.json): the copy carries the slot's id.
  const name = path.basename(rel).startsWith(id) ? path.basename(rel) : `${id}-${path.basename(rel)}`;
  const to = path.join(dest, name);
  if (!check && (!fs.existsSync(to) || fs.statSync(to).size !== fs.statSync(from).size || fs.statSync(to).mtimeMs < fs.statSync(from).mtimeMs)) {
    fs.copyFileSync(from, to);
  }
  return `assets/shots/${name}`;
}

for (const [id, m] of Object.entries(manifest.slots || {})) {
  const slot = shots.slots.find((s) => s.id === id);
  if (!slot) { console.log(`manifest slot ${id} is not in shots.json: skipped`); continue; }
  const clip = bring(m.clip, id);
  const extra = { grade: m.grade, clip_seconds: m.seconds, clip_fps: m.fps, use_from_s: m.use_from_s || 0, audio: m.audio || "none", note: m.note || "" };
  if (m.line_at_s != null) extra.line_at_s = m.line_at_s;
  if (m.tag_track) extra.tag_track = bring(m.tag_track, id);
  if (m.last_still) extra.last_still = bring(m.last_still, id);
  if (m.screen_quad) extra.screen_quad = m.screen_quad;
  pulled.slots[id] = extra;
  // set this slot's "clip" in shots.json without reflowing the file
  const at = text.indexOf(`"id": "${id}"`);
  const re = /"clip":\s*(null|"[^"]*")/g;
  re.lastIndex = at;
  const hit = re.exec(text);
  if (at < 0 || !hit) throw new Error(`could not find the clip field of ${id} in shots.json`);
  text = text.slice(0, hit.index) + `"clip": "${clip}"` + text.slice(hit.index + hit[0].length);
  console.log(`${id}: ${path.basename(m.clip)} (${m.grade}, ${m.seconds} s at ${m.fps} fps, from ${extra.use_from_s} s, sound: ${extra.audio})`);
}
if (!check) {
  fs.writeFileSync(shotsPath, text);
  fs.writeFileSync(pulledPath, JSON.stringify(pulled, null, 1) + "\n");
}
console.log(`${Object.keys(pulled.slots).length} of ${shots.slots.filter((s) => s.kind === "ai").length} AI shots have a clip${check ? " (check only, nothing written)" : ""}`);
