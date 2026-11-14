// mix: the film's sound, built by ffmpeg from the timeline. No session can hear, so the mix
// is made by rule and checked by measurement (loudness, the voice against the music) and by
// speech-to-text on the finished track (tools/stt_check.py film).
//
// Buses:  voice  = the spoken lines, each brought to one level, placed at its film time
//         scene  = sound that belongs to a picture (a recording's own audio)
//         music  = the bed, pushed down whenever voice or scene sound plays
//         sfx    = short effects
// The sum is brought to the target loudness (-14 LUFS) under a true-peak ceiling.
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const SR = 48000;

function run(args, { capture = false } = {}) {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostdin", "-y", ...args], { encoding: "utf8", maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error("ffmpeg failed:\n" + (r.stderr || "").split("\n").slice(-12).join("\n"));
  return capture ? r.stderr : "";
}

/** Integrated loudness (LUFS), loudness range and true peak of a file, or of a window of it. */
export function measure(file, { from, to } = {}) {
  const window = from != null ? ["-ss", String(from), "-t", String(to - from)] : [];
  const out = run([...window, "-i", file, "-vn", "-af", "ebur128=peak=true", "-f", "null", "-"], { capture: true });
  const tail = out.slice(out.lastIndexOf("Summary:"));
  const num = (re) => {
    const m = tail.match(re);
    return m ? parseFloat(m[1]) : null;
  };
  return { lufs: num(/I:\s+(-?[\d.]+|-inf) LUFS/), lra: num(/LRA:\s+(-?[\d.]+) LU/), true_peak: num(/Peak:\s+(-?[\d.]+|-inf) dBFS/) };
}

/** RMS level (dBFS) of a window of a file. */
export function rms(file, from, to) {
  const out = run(["-ss", String(from), "-t", String(Math.max(0.05, to - from)), "-i", file, "-vn",
    "-af", "astats=measure_perchannel=none:measure_overall=RMS_level", "-f", "null", "-"], { capture: true });
  const m = out.match(/RMS level dB:\s+(-?[\d.]+|-inf)/);
  return m && m[1] !== "-inf" ? parseFloat(m[1]) : -120;
}

const db = (x) => Math.pow(10, x / 20);
const ms = (s) => Math.round(s * 1000);

/**
 * Build the mix. `plan` = { seconds, lines:[{id,file,start,seconds,rms_dbfs}], sound:[{file,start,length,in,gain_db}],
 * music:{file,gain_db,fade_in,fade_out,duck_db}, sfx:[{file,at,gain_db}] }
 * Writes <dir>/mix.wav and the stems voice.wav, scene.wav, music.wav (after ducking), sfx.wav.
 */
export function mix(plan, dir, { target = -14, ceiling = -1.5, voiceRms = -20 } = {}) {
  fs.mkdirSync(dir, { recursive: true });
  const D = plan.seconds;
  const inputs = [];
  const f = [];
  const add = (file) => {
    inputs.push("-i", file);
    return inputs.length / 2 - 1;
  };
  const silence = (label) => f.push(`anullsrc=r=${SR}:cl=stereo,atrim=0:${D}[${label}]`);

  // voice: every line to the same level, then gentle compression so no word is lost
  const v = plan.lines.map((l, i) => {
    const n = add(l.file);
    const gain = voiceRms - l.rms_dbfs;
    f.push(`[${n}:a]aresample=${SR},aformat=channel_layouts=stereo,volume=${db(gain).toFixed(4)},adelay=${ms(l.start)}:all=1[v${i}]`);
    return `[v${i}]`;
  });
  if (v.length) {
    f.push(`${v.join("")}amix=inputs=${v.length}:normalize=0:dropout_transition=0,` +
      `acompressor=threshold=${db(-22).toFixed(4)}:ratio=2.5:attack=8:release=160:makeup=1.6,apad,atrim=0:${D}[voice]`);
  } else silence("voice");

  // scene sound: a recording's own audio, cut to its beats
  const s = (plan.sound || []).map((c, i) => {
    const n = add(c.file);
    const fade = Math.min(0.08, c.length / 4);
    f.push(`[${n}:a]atrim=${c.in}:${c.in + c.length},asetpts=PTS-STARTPTS,aresample=${SR},aformat=channel_layouts=stereo,` +
      `volume=${db(c.gain_db || 0).toFixed(4)},afade=t=in:d=${fade},afade=t=out:st=${(c.length - fade).toFixed(3)}:d=${fade},adelay=${ms(c.start)}:all=1[s${i}]`);
    return `[s${i}]`;
  });
  if (s.length) f.push(`${s.join("")}amix=inputs=${s.length}:normalize=0:dropout_transition=0,apad,atrim=0:${D}[scene]`);
  else silence("scene");

  // the key that pushes the music down: voice and scene sound together
  f.push(`[voice]asplit=2[voice_o][voice_k]`, `[scene]asplit=2[scene_o][scene_k]`,
    `[voice_k][scene_k]amix=inputs=2:normalize=0[key]`);

  if (plan.music && plan.music.file) {
    const m = plan.music;
    const n = add(m.file);
    const fo = m.fade_out ?? 1.2;
    f.push(`[${n}:a]aresample=${SR},aformat=channel_layouts=stereo,atrim=${m.in || 0}:${(m.in || 0) + D},asetpts=PTS-STARTPTS,` +
      `volume=${db(m.gain_db ?? -6).toFixed(4)},afade=t=in:d=${m.fade_in ?? 0.25},afade=t=out:st=${(D - fo).toFixed(3)}:d=${fo},apad,atrim=0:${D}[music_raw]`,
      // threshold low, so speech at any level opens the duck; ratio and makeup set its depth
      `[music_raw][key]sidechaincompress=threshold=${db(-38).toFixed(5)}:ratio=${m.duck_ratio ?? 6}:attack=${m.duck_attack ?? 60}:release=${m.duck_release ?? 420}:knee=4[music]`);
  } else {
    f.push(`[key]anullsink`);
    silence("music");
  }

  const x = (plan.sfx || []).map((e, i) => {
    const n = add(e.file);
    f.push(`[${n}:a]aresample=${SR},aformat=channel_layouts=stereo,volume=${db(e.gain_db ?? -8).toFixed(4)},adelay=${ms(e.at)}:all=1[x${i}]`);
    return `[x${i}]`;
  });
  if (x.length) f.push(`${x.join("")}amix=inputs=${x.length}:normalize=0:dropout_transition=0,apad,atrim=0:${D}[sfx]`);
  else silence("sfx");

  f.push(`[music]asplit=2[music_o][music_m]`, `[sfx]asplit=2[sfx_o][sfx_m]`,
    `[voice_o]asplit=2[voice_s][voice_m]`, `[scene_o]asplit=2[scene_s][scene_m]`,
    `[voice_m][scene_m][music_m][sfx_m]amix=inputs=4:normalize=0:dropout_transition=0[pre]`);

  const stem = (n) => path.join(dir, `${n}.wav`);
  const pcm = ["-c:a", "pcm_s24le", "-ar", String(SR)];
  if (!inputs.length) inputs.push("-f", "lavfi", "-i", `anullsrc=r=${SR}:cl=stereo`);
  run([...inputs, "-filter_complex", f.join(";"),
    "-map", "[pre]", ...pcm, stem("pre"),
    "-map", "[voice_s]", ...pcm, stem("voice"),
    "-map", "[scene_s]", ...pcm, stem("scene"),
    "-map", "[music_o]", ...pcm, stem("music"),
    "-map", "[sfx_o]", ...pcm, stem("sfx")]);

  // master: one fixed gain to the target loudness, then a true-peak limiter; measure again
  const before = measure(stem("pre"));
  let gain = before.lufs == null ? 0 : target - before.lufs;
  let after;
  for (let pass = 0; pass < 3; pass++) {
    run(["-i", stem("pre"), "-af",
      `volume=${db(gain).toFixed(5)},alimiter=limit=${db(ceiling - 0.3).toFixed(5)}:attack=4:release=60:level=0,aresample=${SR}`,
      ...pcm, stem("mix")]);
    after = measure(stem("mix"));
    if (after.lufs == null || Math.abs(after.lufs - target) <= 0.3) break;
    gain += target - after.lufs;
  }
  return { file: stem("mix"), stems: { voice: stem("voice"), scene: stem("scene"), music: stem("music"), sfx: stem("sfx") }, before, after, gain_db: gain };
}

/** Per spoken line: how far the voice stands above the music under it (dB). */
export function voiceOverMusic(plan, stems) {
  if (!plan.music || !plan.music.file) return null;
  return plan.lines.map((l) => {
    const a = l.start + 0.05;
    const b = l.start + l.seconds - 0.05;
    const voice = rms(stems.voice, a, b);
    const music = rms(stems.music, a, b);
    return { id: l.id, voice_db: voice, music_db: music, above_db: Math.round((voice - music) * 10) / 10 };
  });
}

export function ffprobe(file) {
  const out = execFileSync("ffprobe", ["-v", "error", "-show_entries",
    "format=duration,size:stream=codec_type,codec_name,width,height,r_frame_rate,nb_frames,sample_rate,channels",
    "-of", "json", file], { encoding: "utf8" });
  return JSON.parse(out);
}
