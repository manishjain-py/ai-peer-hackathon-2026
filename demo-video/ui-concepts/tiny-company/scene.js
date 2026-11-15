// Tiny Company: your company as a living miniature. Today's page folds down and becomes the
// ground of a floating island; the buildings pop up (one per source); a little courier with
// Ram's keycard visits each one, copies what matters and brings it home. Everything is drawn
// from t: no clock, no loop, no unseeded random.
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { Pass, FullScreenQuad } from "three/addons/postprocessing/Pass.js";
import { FXAAShader } from "three/addons/shaders/FXAAShader.js";
import { CSS3DRenderer, CSS3DObject } from "three/addons/renderers/CSS3DRenderer.js";
import { el, prog, ease, clamp, lerp, spring, noise } from "../shared/kit.js";
import { todayPage, pointer, centre } from "../shared/page.js";
import * as D from "../shared/data.js";
import { buildWorld, SITES, HUE, toWorld, ISL, pathList, sample, POND } from "./world.js";
import { buildCourier } from "./courier.js";
import { buildUI, renderUI, win } from "./ui.js";
import * as TL from "./timeline.js";

const W = 1920, H = 1080, FOV = 24, CS = 1.25; // CS: the courier's size
const V3 = (x, y, z) => new THREE.Vector3(x, y, z);
const ORDER = ["directory", "docs", "slack", "code", "tickets", "mail"];
const CW = D.captionWords;

// ---------------------------------------------------------------- the camera's path
// [t, target x, y, z, azimuth deg, elevation deg, distance, screen shift x, y]
const CAM = [
  [0, 0, 4.5, 4.5, 0, 0, 21.17, 0, 0],
  [4.55, 0, 4.5, 4.5, 0, 0, 21.17, 0, 0],
  [6.45, 0.2, -0.9, 0.2, 30, 31, 39.0, 110, 10],
  [7.0, 0.0, -0.6, 0.0, 31, 32, 37.5, 120, 20],
  [8.0, -1.2, 0.3, -0.3, 31, 35, 27.5, 160, 30],
  [9.3, -2.4, 0.5, -0.6, 29, 37, 23.0, 170, 40],
  [10.9, -1.6, 0.5, -1.5, 30, 37, 22.5, 170, 40],
  [12.8, 0.9, 0.5, -1.7, 33, 37, 21.5, 140, 40],
  [14.8, 1.3, 0.5, -1.6, 34, 37, 22.0, 140, 40],
  [16.2, 3.0, 0.5, -0.4, 36, 36, 23.0, 110, 40],
  [17.4, 2.8, 0.5, 1.0, 36, 36, 23.5, 110, 30],
  [18.8, -0.8, 0.5, 1.4, 33, 36, 23.5, 220, 30],
  [20.4, 0.6, 1.0, 0.0, 33, 34, 17.0, -80, 20],
  [23.1, 0.8, 1.1, 0.1, 35, 33, 15.5, -100, 20],
  [24.6, 1.0, 0.6, 0.7, 38, 29, 11.5, 0, 40],
  [25.6, 1.0, 0.6, 0.7, 38, 29, 11.5, 0, 40],
  [26.7, 0.3, 0.3, 0.0, 33, 35, 28.5, 0, -60],
  [27.3, 0.3, 0.3, 0.0, 33, 35, 28.5, 0, -60],
  [28.5, -0.6, 0.9, -0.7, 31, 33, 17.0, -470, 20],
  [34.7, -0.6, 0.9, -0.7, 28, 33, 16.4, -470, 20],
  [36.1, 0.0, 0.6, 0.7, 24, 26, 12.0, -480, 60],
  [43.4, 0.0, 0.6, 0.7, 22, 27, 11.8, -480, 60],
  [44.9, 0.3, 0.4, 0.0, 32, 37, 27.5, 0, 40],
  [51.3, 0.3, 0.4, 0.0, 35, 37, 27.5, 0, 40],
  [52.5, 0.0, 0.8, 0.0, 32, 35, 20.0, -440, 40],
  [56.3, 0.0, 0.8, 0.0, 30, 35, 20.0, -440, 40],
  [57.7, -0.8, 0.4, 0.5, 36, 37, 30.0, 390, 40],
  [63.6, -0.6, 0.4, 0.3, 44, 37, 29.5, 390, 40],
  [70.0, 0.0, -0.5, 0.0, 50, 56, 40.0, 0, 60],
];
// Monotone cubic through keys (no overshoot; flat at holds).
function smooth(t, K, j) {
  const n = K.length;
  if (t <= K[0][0]) return K[0][j];
  if (t >= K[n - 1][0]) return K[n - 1][j];
  let i = 0;
  while (t > K[i + 1][0]) i++;
  const d = (q) => (K[q + 1][j] - K[q][j]) / (K[q + 1][0] - K[q][0]);
  const m = (q) => {
    if (q <= 0 || q >= n - 1) return 0;
    const a = d(q - 1), b = d(q);
    return a * b <= 0 ? 0 : (2 * a * b) / (a + b);
  };
  const h = K[i + 1][0] - K[i][0], s = (t - K[i][0]) / h;
  const s2 = s * s, s3 = s2 * s;
  return (2 * s3 - 3 * s2 + 1) * K[i][j] + (s3 - 2 * s2 + s) * h * m(i) + (-2 * s3 + 3 * s2) * K[i + 1][j] + (s3 - s2) * h * m(i + 1);
}

// ---------------------------------------------------------------- post: tilt-shift + vignette
// The miniature look: the frame is sharp in a band across the middle and blurs toward the top and
// bottom. The blur runs at half size (cheap in software GL) and is mixed over the sharp frame.
const VS = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }";
const MASK = "float tiltMask(float y, float f, float b, float r){ return smoothstep(b, b + r, abs(y - f)); }";
class TiltPass extends Pass {
  constructor() {
    super();
    const o = { type: THREE.HalfFloatType };
    this.a = new THREE.WebGLRenderTarget(W / 2, H / 2, o);
    this.b = new THREE.WebGLRenderTarget(W / 2, H / 2, o);
    this.u = { uFocus: { value: 0.52 }, uBand: { value: 0.16 }, uRamp: { value: 0.34 }, uAmt: { value: 1.2 }, uVig: { value: 0.0 }, uSat: { value: 1.0 } };
    this.down = new THREE.ShaderMaterial({ uniforms: { tDiffuse: { value: null }, uPx: { value: new THREE.Vector2(1 / W, 1 / H) } }, vertexShader: VS,
      fragmentShader: "uniform sampler2D tDiffuse; uniform vec2 uPx; varying vec2 vUv; void main(){ vec4 c = texture2D(tDiffuse, vUv + uPx * vec2(-0.5, -0.5)) + texture2D(tDiffuse, vUv + uPx * vec2(0.5, -0.5)) + texture2D(tDiffuse, vUv + uPx * vec2(-0.5, 0.5)) + texture2D(tDiffuse, vUv + uPx * vec2(0.5, 0.5)); gl_FragColor = c * 0.25; }" });
    this.blur = new THREE.ShaderMaterial({ uniforms: { tDiffuse: { value: null }, uDir: { value: new THREE.Vector2(1, 0) }, uRes: { value: new THREE.Vector2(W / 2, H / 2) }, ...this.u }, vertexShader: VS,
      fragmentShader: `uniform sampler2D tDiffuse; uniform vec2 uDir; uniform vec2 uRes; uniform float uFocus; uniform float uBand; uniform float uRamp; uniform float uAmt; varying vec2 vUv; ${MASK}
        void main(){ float r = uAmt * (0.25 + 0.75 * tiltMask(vUv.y, uFocus, uBand * 0.6, uRamp)); vec4 s = vec4(0.0); float ws = 0.0;
          for (int i = -6; i <= 6; i++) { float f = float(i); float w = exp(-f * f / 16.0); s += texture2D(tDiffuse, vUv + uDir * (f * r) / uRes) * w; ws += w; }
          gl_FragColor = s / ws; }` });
    this.comp = new THREE.ShaderMaterial({ uniforms: { tDiffuse: { value: null }, tBlur: { value: null }, ...this.u }, vertexShader: VS,
      fragmentShader: `uniform sampler2D tDiffuse; uniform sampler2D tBlur; uniform float uFocus; uniform float uBand; uniform float uRamp; uniform float uAmt; uniform float uVig; uniform float uSat; varying vec2 vUv; ${MASK}
        void main(){ float k = tiltMask(vUv.y, uFocus, uBand, uRamp) * step(0.001, uAmt); vec4 c = mix(texture2D(tDiffuse, vUv), texture2D(tBlur, vUv), k);
          float l = dot(c.rgb, vec3(0.2126, 0.7152, 0.0722)); c.rgb = mix(vec3(l), c.rgb, uSat) * mix(vec3(1.0), vec3(1.025, 1.0, 0.965), uSat - 1.0 > 0.0 ? 1.0 : 0.0);
          vec2 q = (vUv - 0.5) * vec2(1.0, 0.85); c.rgb *= mix(1.0, smoothstep(0.92, 0.22, length(q)), uVig); gl_FragColor = c; }` });
    this.fsq = new FullScreenQuad();
  }
  render(renderer, writeBuffer, readBuffer) {
    const q = this.fsq;
    q.material = this.down; this.down.uniforms.tDiffuse.value = readBuffer.texture;
    renderer.setRenderTarget(this.a); q.render(renderer);
    q.material = this.blur; this.blur.uniforms.tDiffuse.value = this.a.texture; this.blur.uniforms.uDir.value.set(1, 0);
    renderer.setRenderTarget(this.b); q.render(renderer);
    this.blur.uniforms.tDiffuse.value = this.b.texture; this.blur.uniforms.uDir.value.set(0, 1);
    renderer.setRenderTarget(this.a); q.render(renderer);
    q.material = this.comp; this.comp.uniforms.tDiffuse.value = readBuffer.texture; this.comp.uniforms.tBlur.value = this.a.texture;
    renderer.setRenderTarget(this.renderToScreen ? null : writeBuffer); q.render(renderer);
  }
}

// ---------------------------------------------------------------- soft particles
class Sprites {
  constructor(n, additive) {
    this.n = n;
    this.pos = new Float32Array(n * 3); this.col = new Float32Array(n * 4); this.size = new Float32Array(n);
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.BufferAttribute(this.pos, 3));
    g.setAttribute("aColor", new THREE.BufferAttribute(this.col, 4));
    g.setAttribute("aSize", new THREE.BufferAttribute(this.size, 1));
    this.g = g;
    const m = new THREE.ShaderMaterial({
      uniforms: { uScale: { value: (H / 2) / Math.tan((FOV / 2) * Math.PI / 180) } },
      vertexShader: "attribute vec4 aColor; attribute float aSize; uniform float uScale; varying vec4 vC; void main(){ vC = aColor; vec4 mv = modelViewMatrix * vec4(position, 1.0); gl_PointSize = aSize * uScale / -mv.z; gl_Position = projectionMatrix * mv; }",
      fragmentShader: "varying vec4 vC; void main(){ float d = length(gl_PointCoord - 0.5) * 2.0; float a = 1.0 - smoothstep(0.0, 1.0, d); a *= a; gl_FragColor = vec4(vC.rgb, vC.a * a); }",
      transparent: true, depthWrite: false, blending: additive ? THREE.AdditiveBlending : THREE.NormalBlending,
    });
    this.points = new THREE.Points(g, m);
    this.points.frustumCulled = false;
    this.points.renderOrder = 5;
    this.i = 0;
    this.c = new THREE.Color();
  }
  begin() { this.i = 0; }
  add(x, y, z, size, hex, a) {
    if (this.i >= this.n || a <= 0.003) return;
    const i = this.i++;
    this.pos[i * 3] = x; this.pos[i * 3 + 1] = y; this.pos[i * 3 + 2] = z;
    this.c.set(hex);
    this.col[i * 4] = this.c.r; this.col[i * 4 + 1] = this.c.g; this.col[i * 4 + 2] = this.c.b; this.col[i * 4 + 3] = a;
    this.size[i] = size;
  }
  end() {
    this.g.setDrawRange(0, this.i);
    for (const k of ["position", "aColor", "aSize"]) this.g.attributes[k].needsUpdate = true;
  }
}
const h01 = (i, s = 1) => { const x = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return x - Math.floor(x); };

// ---------------------------------------------------------------- state built in init
let renderer, composer, bloom, tilt, fxaa, camera, Wd, cour, css3d, cssScene, hinge, wrap, wrapIn, shade, ring;
let walkers = [], pageShadow, pageA, pgA, pgB, ptr, btnAt, U, fx, glow, PLAN, ST, A = {}, popT = {}, ribbon, ribbonU, rings = [], copies = [], proxies = [], dome, domeM;
const camState = { az: 0, el: 0 };

function poseCamera(t) {
  const g = (j) => smooth(t, CAM, j);
  const drift = prog(t, 6.6, 8.5);
  let az = g(4) + drift * 0.7 * noise(t * 0.16, 2);
  let el = g(5) + drift * 0.35 * noise(t * 0.13, 7);
  const d = g(6);
  const tx = g(1), ty = g(2), tz = g(3);
  camState.az = az * Math.PI / 180;
  const a = az * Math.PI / 180, e = el * Math.PI / 180;
  camera.position.set(tx + d * Math.sin(a) * Math.cos(e), ty + d * Math.sin(e), tz + d * Math.cos(a) * Math.cos(e));
  camera.lookAt(tx, ty, tz);
  let oy = g(8);
  if (t > TL.FOLD.land) { const q = t - TL.FOLD.land; oy += 7 * Math.exp(-q * 9) * Math.sin(q * 42); }
  camera.setViewOffset(W, H, -g(7), -oy, W, H);
  camera.updateMatrixWorld();
}

// ---------------------------------------------------------------- the courier's flight
function catmull(P, k) {
  const n = P.length - 1, f = clamp(k) * n, i = Math.min(n - 1, Math.floor(f)), u = f - i;
  const p0 = P[Math.max(0, i - 1)], p1 = P[i], p2 = P[i + 1], p3 = P[Math.min(n, i + 2)];
  const c = (a, b, cc, dd) => 0.5 * (2 * b + (-a + cc) * u + (2 * a - 5 * b + 4 * cc - dd) * u * u + (-a + 3 * b - 3 * cc + dd) * u * u * u);
  return V3(c(p0.x, p1.x, p2.x, p3.x), c(p0.y, p1.y, p2.y, p3.y), c(p0.z, p1.z, p2.z, p3.z));
}
const hold = (t0, t1, p, yaw = null) => ({ k: "h", t0, t1, p, yaw });
const fly = (t0, t1, pts, arc = null) => ({ k: "f", t0, t1, pts, arc });
function seg(t) {
  for (const s of PLAN) if (t <= s.t1) return s;
  return PLAN[PLAN.length - 1];
}
function rawPos(t) {
  const s = seg(t);
  if (s.k === "h") return s.p.clone();
  const e = ease.inOutCubic(prog(t, s.t0, s.t1));
  if (s.pts.length === 2) {
    const [a, b] = s.pts;
    const lift = s.arc ?? Math.min(1.3, 0.2 + 0.1 * a.distanceTo(b));
    return a.clone().lerp(b, e).add(V3(0, lift * Math.sin(Math.PI * e), 0));
  }
  return catmull(s.pts, e);
}
function courierPos(t) {
  const p = rawPos(t), s = seg(t);
  if (s.k === "h" && s.prev && s.prev.k === "f") {
    const dt = t - s.t0;
    if (dt < 1) p.addScaledVector(s.prev.dir, 0.1 * Math.exp(-6 * dt) * Math.sin(12 * dt));
  }
  p.y += 0.045 * Math.sin(t * 5.0) + 0.02 * noise(t * 1.3, 3);
  return p;
}
const angLerp = (a, b, k) => { let d = ((b - a + Math.PI) % (2 * Math.PI) + 2 * Math.PI) % (2 * Math.PI) - Math.PI; return a + d * k; };
function courierYaw(t) {
  const s = seg(t);
  const a = rawPos(t - 0.034), b = rawPos(t + 0.034);
  const vx = (b.x - a.x) / 0.068, vz = (b.z - a.z) / 0.068, sp = Math.hypot(vx, vz);
  const e = s.k === "f" ? ease.inOutCubic(prog(t, s.t0, s.t1)) : 0;
  let rest = angLerp(s.yawA, s.yawB, e);
  if (t > TL.V.slack.look[0] && t < TL.V.slack.look[1] + 0.4) rest = angLerp(rest, camState.az, win(t, TL.V.slack.look[0], TL.V.slack.look[1] + 0.4, 0.3, 0.35));
  const w = clamp(sp / 1.4);
  const travel = Math.atan2(vx, vz);
  return { yaw: angLerp(rest, travel, w), sp };
}

// ---------------------------------------------------------------- init
async function init(stage) {
  // WebGL
  const canvas = el("canvas", "tc-gl", stage);
  canvas.width = W; canvas.height = H;
  renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(1);
  renderer.setSize(W, H, false);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.toneMapping = THREE.NeutralToneMapping;
  renderer.toneMappingExposure = 1.0;
  Wd = buildWorld(renderer);
  camera = new THREE.PerspectiveCamera(FOV, W / H, 0.5, 220);
  cour = buildCourier(Wd.tex);
  cour.body.rotation.order = "YXZ";
  cour.root.scale.setScalar(CS);
  Wd.scene.add(cour.root);
  const blob = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: Wd.tex.blob, transparent: true, depthWrite: false, color: "#1f3a2c", opacity: 0.3 }));
  blob.rotation.x = -Math.PI / 2;
  blob.renderOrder = 2;
  Wd.scene.add(blob);
  cour.blob = blob;

  const rt = new THREE.WebGLRenderTarget(W, H, { type: THREE.HalfFloatType });
  composer = new EffectComposer(renderer, rt);
  composer.setPixelRatio(1);
  composer.setSize(W, H);
  composer.addPass(new RenderPass(Wd.scene, camera));
  bloom = new UnrealBloomPass(new THREE.Vector2(W / 2, H / 2), 0.35, 0.55, 1.0);
  composer.addPass(bloom);
  tilt = new TiltPass();
  composer.addPass(tilt);
  composer.addPass(new OutputPass());
  fxaa = new ShaderPass(FXAAShader);
  fxaa.uniforms.resolution.value.set(1 / W, 1 / H);
  composer.addPass(fxaa);

  // effects in the world
  fx = new Sprites(700, false);
  glow = new Sprites(500, true);
  Wd.scene.add(fx.points, glow.points);
  for (let i = 0; i < 22; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(i === 0 ? 0.34 : 0.2, i === 0 ? 0.22 : 0.14), new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, depthWrite: false }));
    m.renderOrder = 6;
    Wd.scene.add(m);
    copies.push(m);
  }
  for (let i = 0; i < 6; i++) {
    const m = new THREE.Mesh(new THREE.PlaneGeometry(0.24, 0.18), new THREE.MeshLambertMaterial({ map: Wd.tex.note, side: THREE.DoubleSide, emissive: new THREE.Color(HUE[D.learned.facts[i].source]), emissiveIntensity: 0.35 }));
    Wd.scene.add(m);
    proxies.push(m);
  }
  for (let i = 0; i < 4; i++) {
    const m = new THREE.Mesh(new THREE.RingGeometry(0.85, 1.0, 48), new THREE.MeshBasicMaterial({ color: new THREE.Color("#7ff0bd").multiplyScalar(1.8), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide }));
    m.rotation.x = -Math.PI / 2;
    m.renderOrder = 4;
    Wd.scene.add(m);
    rings.push(m);
  }
  domeM = new THREE.MeshBasicMaterial({ color: new THREE.Color("#9ff7cf"), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide });
  dome = new THREE.Mesh(new THREE.SphereGeometry(2.0, 32, 16, 0, Math.PI * 2, 0, Math.PI / 2), domeM);
  dome.position.set(SITES.house.x + 0.2, 0, SITES.house.z);
  dome.scale.set(1.15, 1.0, 1.0);
  dome.renderOrder = 7;
  Wd.scene.add(dome);

  // tiny people walking the paths: the company is alive
  {
    const shirts = ["#ff9db0", "#7aa7ff", "#ffd36b", "#b28cff", "#5fd4c4", "#ffb08a", "#f4f4f4", "#8fd18a"];
    const skins = ["#f2c9a8", "#c98f6a", "#8d5a3b", "#f6d7bd", "#a86f4c"];
    const paths = pathList();
    [1, 3, 4, 6, 7, 8, 2, 5].forEach((pi, i) => {
      const pts = sample(paths[pi], 60);
      const cum = [0];
      for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
      const g = new THREE.Group();
      const body = new THREE.Mesh(new THREE.CylinderGeometry(0.045, 0.06, 0.17, 8), new THREE.MeshLambertMaterial({ color: shirts[i % shirts.length], flatShading: true }));
      body.position.y = 0.1; body.castShadow = true; g.add(body);
      const head = new THREE.Mesh(new THREE.SphereGeometry(0.048, 10, 8), new THREE.MeshLambertMaterial({ color: skins[i % skins.length] }));
      head.position.y = 0.23; head.castShadow = true; g.add(head);
      const hair = new THREE.Mesh(new THREE.SphereGeometry(0.05, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2.2), new THREE.MeshLambertMaterial({ color: ["#3b2a22", "#6b4a2f", "#1f1f24", "#c58b4a"][i % 4] }));
      hair.position.y = 0.235; g.add(hair);
      g.scale.setScalar(1.15);
      Wd.island.add(g);
      walkers.push({ g, pts, cum, L: cum[cum.length - 1], speed: 0.28 + 0.06 * (i % 3), off: i * 1.7 });
    });
  }
  Wd.scene.updateMatrixWorld(true);
  const B = Wd.b;
  // anchors (world)
  const front = { directory: 1.15, docs: 1.05, slack: 1.45, code: 1.05, tickets: 0.98, mail: 1.05, vault: 1.0 };
  ST = {};
  for (const id of [...ORDER, "vault"]) ST[id] = toWorld(SITES[id], id === "slack" ? 1.0 : 0.35, 1.0, front[id] + 0.6);
  ST.slackIn = toWorld(SITES.slack, 0, 1.05, 0.15);
  const hs = SITES.house;
  ST.in = toWorld(hs, 1.28, 0.75, 0.3); ST.out = toWorld(hs, 1.28, 1.95, 0.3);
  ST.board = toWorld(hs, 1.25, 2.0, 0.2); ST.press = toWorld(hs, 1.95, 1.45, 1.25); ST.grab = toWorld(hs, 1.0, 1.2, 0.95);
  ST.door = toWorld(hs, -0.48, 1.15, 1.45); ST.side = toWorld(hs, 0.35, 1.35, 1.75);
  ST.home = toWorld(hs, 0.55, 3.0, 0.45); ST.ai = toWorld(hs, 0.9, 3.0, 1.5); ST.askSide = toWorld(hs, 2.75, 1.5, 0.9); ST.ansSide = toWorld(hs, -1.9, 1.7, 1.2); ST.ruleSide = toWorld(hs, 2.9, 2.6, 0.6);
  ST.bbA = toWorld(SITES.billboard, -1.6, 1.45, 1.0); ST.bbB = toWorld(SITES.billboard, 1.5, 1.5, 1.05);
  const faceDoor = (id) => SITES[id].yaw + Math.PI + 0.55;
  const camYaw = 0.56;
  const S = ST;
  PLAN = [
    hold(0, TL.OUT, S.in, camYaw), fly(TL.OUT, 7.25, [S.in, S.out], 0), hold(7.25, 7.4, S.out, camYaw),
    fly(7.4, 8.0, [S.out, S.directory]), hold(8.0, 9.62, S.directory, faceDoor("directory")),
    fly(9.62, 10.2, [S.directory, S.docs]), hold(10.2, 11.62, S.docs, faceDoor("docs")),
    fly(11.62, 12.2, [S.docs, S.slack]), hold(12.2, 13.95, S.slack, faceDoor("slack")),
    fly(13.95, 14.25, [S.slack, S.slackIn], 0.15), hold(14.25, 15.22, S.slackIn, faceDoor("slack")),
    fly(15.22, 15.66, [S.slackIn, S.code]), hold(15.66, 16.56, S.code, faceDoor("code")),
    fly(16.56, 17.0, [S.code, S.tickets]), hold(17.0, 17.78, S.tickets, faceDoor("tickets")),
    fly(17.78, 18.32, [S.tickets, S.mail]), hold(18.32, 19.22, S.mail, faceDoor("mail")),
    fly(19.22, 19.98, [S.mail, S.board]), hold(19.98, 23.2, S.board, hs.yaw + Math.PI + 0.3),
    fly(23.2, 23.55, [S.board, S.press], 0.1), hold(23.55, 25.9, S.press, hs.yaw - 1.2),
    fly(25.9, 26.6, [S.press, S.home]), hold(26.6, 35.25, S.home, camYaw),
    fly(35.25, 35.55, [S.home, S.grab], 0.05), hold(35.55, 35.75, S.grab, hs.yaw + Math.PI),
    fly(35.75, 36.15, [S.grab, S.door], 0.12), hold(36.15, 36.4, S.door, camYaw),
    fly(36.4, 36.9, [S.door, S.side], 0.1), hold(36.9, 43.9, S.side, camYaw),
    fly(43.9, 44.5, [S.side, S.askSide]), hold(44.5, 47.5, S.askSide, camYaw),
    fly(47.5, 48.05, [S.askSide, S.docs]), hold(48.05, 48.35, S.docs, faceDoor("docs")),
    fly(48.35, 48.85, [S.docs, S.slackIn]), hold(48.85, 49.15, S.slackIn, faceDoor("slack")),
    fly(49.15, 49.65, [S.slackIn, S.code]), hold(49.65, 49.95, S.code, faceDoor("code")),
    fly(49.95, 50.5, [S.code, S.mail]), hold(50.5, 50.8, S.mail, faceDoor("mail")),
    fly(50.8, 51.6, [S.mail, S.ansSide]), hold(51.6, 57.2, S.ansSide, camYaw),
    fly(57.2, 57.6, [S.ansSide, S.ai], 0.1), hold(57.6, 58.1, S.ai, camYaw),
    fly(58.1, 58.9, [S.ai, S.vault]), hold(58.9, 59.65, S.vault, faceDoor("vault")),
    fly(59.65, 61.55, [S.vault, V3(-3.2, 2.6, 0.6), S.bbA, S.bbB]), fly(61.55, 62.2, [S.bbB, S.ruleSide]),
    hold(62.2, 64.2, S.ruleSide, camYaw),
    fly(64.2, 70, [S.ruleSide, S.home, toWorld(hs, 1.6, 3.4, -0.6), toWorld(hs, 0.3, 3.6, -1.6), toWorld(hs, -1.1, 3.4, -0.4), toWorld(hs, 0.2, 3.3, 1.2), toWorld(hs, 1.5, 3.4, 0.2)]),
  ];
  // link the plan: yaws at each end, the arrival direction
  PLAN.forEach((s, i) => {
    s.prev = PLAN[i - 1];
    if (s.k === "f") { const a = s.pts[s.pts.length - 2], b = s.pts[s.pts.length - 1]; s.dir = V3(b.x - a.x, 0, b.z - a.z).normalize(); }
  });
  PLAN.forEach((s, i) => {
    if (s.k === "h") { s.yawA = s.yawB = s.yaw ?? (s.prev && s.prev.dir ? Math.atan2(s.prev.dir.x, s.prev.dir.z) : camYaw); }
  });
  PLAN.forEach((s, i) => {
    if (s.k === "f") { s.yawA = PLAN[i - 1] ? PLAN[i - 1].yawB : camYaw; s.yawB = PLAN[i + 1] ? PLAN[i + 1].yawA ?? camYaw : camYaw; }
  });

  // pop times: the page dissolves from the middle out, and each thing pops just after
  const reveal = (x, z) => { const r = Math.hypot(x, z) / 9.6; return TL.WIPE.a + (1 - Math.cbrt(Math.max(0, 1 - r))) * (TL.WIPE.b - TL.WIPE.a); };
  for (const id of Object.keys(SITES)) popT[id] = reveal(SITES[id].x, SITES[id].z) + 0.16 + (id === "house" ? 0 : 0.06);
  Wd.trees.forEach((tr) => { tr.pop = reveal(tr.x, tr.z) + 0.12 + 0.25 * h01(tr.seed); });
  Wd.signs.forEach((s) => { s.pop = reveal(s.p.x, s.p.z) + 0.3; });
  Wd.lamps.forEach((l) => { l.pop = reveal(l.g.position.x, l.g.position.z) + 0.3; });

  // anchors for labels
  A.lab = {};
  for (const id of ORDER) A.lab[id] = B[id].label;
  A.gate = toWorld(SITES.slack, 0, 1.0, 1.15);
  A.codeDoor = toWorld(SITES.code, 0.45, 0.98, 0.75);
  A.ticketsDoor = toWorld(SITES.tickets, 0.42, 0.92, 0.65);
  A.signs = Wd.signs.map((s) => s.p);
  A.vault = toWorld(SITES.vault, 0, 1.85, 0.2);
  A.billboard = toWorld(SITES.billboard, 0, 2.35, 0.1);
  A.house = toWorld(hs, 0.1, 2.55, 0.1);
  const bw = new THREE.Vector3();
  A.boardC = [[-0.52, 0.39], [0.52, 0.39], [-0.52, 1.05], [0.52, 1.05]].map(([x, y]) => B.house.board.localToWorld(V3(x, y, 0.04)));
  A.notes = B.house.notes.map((n) => n.n.getWorldPosition(new THREE.Vector3()));
  A.noteQ = B.house.board.getWorldQuaternion(new THREE.Quaternion());
  A.pressTop = B.house.press.localToWorld(V3(0, 0.34, -0.04));
  A.mat = toWorld(hs, -0.48, 0.2, 1.0);
  A.chimneys = [toWorld(hs, -0.9, 2.05, -0.42), toWorld(SITES.code, 0.72, 2.0, -0.55)];
  A.flash = {};
  for (const id of ORDER) A.flash[id] = toWorld(SITES[id], 0, 0.85, front[id] - 0.1);
  // the roll lives in the world (it leaves the press with the courier)
  const roll = B.house.roll;
  roll.parent.remove(roll);
  Wd.scene.add(roll);
  roll.scale.setScalar(0.9);

  // the search loop's glowing trail on the ground (follows the courier's track)
  {
    const pts = [], us = [];
    const [t0, t1] = TL.ASK.loop;
    for (let i = 0; i <= 260; i++) {
      const tt = t0 + (i / 260) * (t1 - t0);
      const p = rawPos(tt);
      if (pts.length && Math.hypot(p.x - pts[pts.length - 1].x, p.z - pts[pts.length - 1].z) < 0.03) continue;
      pts.push(p); us.push(i / 260);
    }
    const pos = [], uv = [], idx = [];
    pts.forEach((p, i) => {
      const a = pts[Math.max(0, i - 1)], b = pts[Math.min(pts.length - 1, i + 1)];
      let tx = b.x - a.x, tz = b.z - a.z; const l = Math.hypot(tx, tz) || 1; tx /= l; tz /= l;
      const nx = -tz * 0.09, nz = tx * 0.09;
      pos.push(p.x + nx, 0.035, p.z + nz, p.x - nx, 0.035, p.z - nz);
      uv.push(us[i], 0, us[i], 1);
      if (i) { const k = i * 2; idx.push(k - 2, k - 1, k, k - 1, k + 1, k); }
    });
    const g = new THREE.BufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
    g.setAttribute("uv", new THREE.Float32BufferAttribute(uv, 2));
    g.setIndex(idx);
    ribbonU = { uProg: { value: 0 }, uFade: { value: 0 }, uCol: { value: new THREE.Color("#8ff5c6").multiplyScalar(2.2) } };
    ribbon = new THREE.Mesh(g, new THREE.ShaderMaterial({
      uniforms: ribbonU, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform float uProg; uniform float uFade; uniform vec3 uCol; varying vec2 vUv;
        void main(){ float on = step(vUv.x, uProg); float head = smoothstep(uProg - 0.18, uProg, vUv.x);
          float dash = 0.55 + 0.45 * step(0.45, fract(vUv.x * 70.0)); float edge = 1.0 - abs(vUv.y - 0.5) * 2.0;
          gl_FragColor = vec4(uCol, on * (0.35 + 0.65 * head) * dash * smoothstep(0.0, 0.5, edge) * uFade); }`,
    }));
    ribbon.renderOrder = 3;
    ribbon.frustumCulled = false;
    Wd.scene.add(ribbon);
  }

  // today's page: a flat copy for the opening (crisp), and the one that folds down (CSS3D)
  css3d = new CSS3DRenderer();
  css3d.setSize(W, H);
  css3d.domElement.className = "tc-css3d";
  stage.appendChild(css3d.domElement);
  cssScene = new THREE.Scene();
  wrap = el("div", "tc-wrap");
  wrapIn = el("div", "", wrap);
  wrapIn.style.cssText = "position:absolute;inset:0;";
  pgB = todayPage(wrapIn);
  shade = el("div", "tc-shade", wrapIn);
  ring = el("div", "tc-ring", wrap);
  const obj = new CSS3DObject(wrap);
  obj.scale.setScalar((2 * ISL.A) / W);
  obj.position.set(0, ISL.B, 0);
  hinge = new THREE.Group();
  hinge.position.set(0, 0, ISL.B);
  hinge.add(obj);
  cssScene.add(hinge);
  {
    const c = document.createElement("canvas");
    c.width = 256; c.height = 144;
    const g = c.getContext("2d");
    g.filter = "blur(9px)"; g.fillStyle = "#000"; g.fillRect(14, 14, 228, 116);
    const tx = new THREE.CanvasTexture(c);
    const geo = new THREE.PlaneGeometry(2 * ISL.A, 2 * ISL.B);
    geo.translate(0, ISL.B, 0);
    geo.rotateX(-Math.PI / 2);
    pageShadow = new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ map: tx, color: "#203029", transparent: true, opacity: 0, depthWrite: false }));
    pageShadow.position.set(0, 0.006, ISL.B);
    pageShadow.renderOrder = 2;
    Wd.scene.add(pageShadow);
  }

  U = buildUI(stage);
  pageA = el("div", "tc-page0", stage);
  pgA = todayPage(pageA);
  btnAt = centre(pgA.button);
  ptr = pointer(stage);
  const ir = U.ask.i.getBoundingClientRect(), gr = U.ask.i.querySelector(".go").getBoundingClientRect();
  U.goOff = [gr.left + gr.width / 2 - ir.left - ir.width / 2, gr.top + gr.height / 2 - ir.top - ir.height];
}

// ---------------------------------------------------------------- per frame
const P = new THREE.Vector3();
function proj(v) {
  P.copy(v).project(camera);
  if (P.z > 1) return null;
  return [(P.x + 1) * W / 2, (1 - P.y) * H / 2];
}
const C1 = new THREE.Color(), C2 = new THREE.Color();
const mixHex = (a, b, k, out) => out.set(a).lerp(C2.set(b), k);
const blinkAt = [8.6, 12.95, 17.45, 21.8, 26.1, 30.2, 34.0, 38.5, 42.2, 46.0, 50.2, 55.0, 59.0, 63.2, 67.0];

function render(t) {
  poseCamera(t);
  const B = Wd.b, dusk = ease.inOutSine(prog(t, TL.RULES.dusk[0], TL.RULES.dusk[1]));

  // ---- light and sky
  Wd.sun.color.copy(mixHex("#fff0d6", "#ffb27a", dusk, C1));
  Wd.sun.intensity = lerp(3.4, 1.9, dusk);
  Wd.sun.position.set(lerp(-10, -11, dusk), lerp(8.5, 3.4, dusk), lerp(7, 8.5, dusk));
  Wd.hemi.color.copy(mixHex("#e6f3ff", "#9b93d8", dusk, C1));
  Wd.hemi.groundColor.copy(mixHex("#f4dcc4", "#c08e8e", dusk, C1));
  Wd.hemi.intensity = lerp(1.7, 1.2, dusk);
  Wd.fill.intensity = lerp(0.7, 0.55, dusk);
  Wd.fill.color.copy(mixHex("#cfe0ff", "#a3a8ff", dusk, C1));
  const su = Wd.skyU;
  su.uTop.value.copy(mixHex("#a7d6f2", "#45508f", dusk, C1));
  su.uBot.value.copy(mixHex("#f7e7da", "#f4a983", dusk, C1));
  su.uGlow.value.copy(mixHex("#fff3da", "#ffc68f", dusk, C1));
  su.uGlowPos.value.set(lerp(0.18, 0.12, dusk), lerp(0.92, 0.3, dusk));
  su.uGlowAmt.value = lerp(0.7, 0.85, dusk);
  Wd.scene.fog.color.copy(mixHex("#e9eef0", "#c7a9c4", dusk, C1));
  bloom.strength = lerp(0.32, 0.85, dusk);
  bloom.threshold = lerp(1.0, 0.7, dusk);
  bloom.radius = 0.55;
  renderer.toneMappingExposure = lerp(1.0, 1.02, dusk);
  for (const c of Wd.clouds) {
    c.m.emissiveIntensity = lerp(0.55, 0.3, dusk);
    c.m.emissive.copy(mixHex("#eef4ff", "#ffc6c9", dusk, C1));
    const span = 40, x = ((c.x + 0.12 * t + 20) % span + span) % span - 20;
    c.g.position.set(x, c.y + 0.15 * Math.sin(t * 0.3 + c.z), c.z);
  }

  // ---- the falling page's shadow grows on the island until it lands
  {
    const k = prog(t, TL.FOLD.a, TL.FOLD.land);
    const a = (Math.PI / 2) * ease.inQuad(k);
    pageShadow.visible = t > TL.FOLD.a && t < TL.FOLD.land + 0.05;
    pageShadow.scale.set(1, 1, Math.max(0.001, Math.sin(a)));
    pageShadow.material.opacity = 0.42 * Math.sin(a);
  }
  // ---- the ground: pale like the page until the page lands on it
  Wd.groundMat.userData.pale.value = t < TL.FOLD.land ? 1 : 0;
  const land = t - TL.FOLD.land;
  Wd.island.scale.y = land > 0 ? 1 - 0.035 * Math.exp(-land * 8) * Math.cos(land * 26) : 1;

  // ---- pops
  const popS = (g, t0, f = 2.1, d = 0.4, base = 1) => {
    const k = spring(t, t0, f, d);
    g.visible = k > 0.002;
    g.scale.set(base * (1 + 0.3 * (1 - k)), base * Math.max(0.002, k), base * (1 + 0.3 * (1 - k)));
    return k;
  };
  for (const id of Object.keys(SITES)) {
    const b = B[id];
    popS(b.g, popT[id]);
    // a small bounce when reading starts (and when the trace reaches the library)
    const v = TL.V[id];
    let bump = 0;
    if (v) bump += Math.exp(-(t - v.read[0]) * 7) * Math.sin((t - v.read[0]) * 18) * (t > v.read[0] ? 1 : 0);
    if (id === "docs") { const q = t - (TL.LEARN.trace[0] + 1.3); if (q > 0) bump += Math.exp(-q * 6) * Math.sin(q * 16); }
    if (t > popT[id] + 1.2) b.g.scale.set(1 - 0.03 * bump, 1 + 0.06 * bump, 1 - 0.03 * bump);
  }
  for (const tr of Wd.trees) {
    popS(tr.g, tr.pop, 2.6, 0.38);
    if (t > tr.pop + 1) tr.g.scale.setScalar(1);
    tr.g.rotation.z = (tr.bush ? 0.01 : 0.025) * noise(t * 0.6 + tr.seed, 5);
  }
  Wd.signs.forEach((s, i) => {
    popS(s.g, s.pop, 2.6, 0.4);
    const on = ease.outCubic(prog(t, TL.RULES.on[i], TL.RULES.on[i] + 0.3));
    s.lm.color.copy(mixHex("#6d6a63", "#ffd98a", on, C1)).multiplyScalar(1 + 2.2 * on);
  });
  Wd.lamps.forEach((l) => {
    popS(l.g, l.pop, 2.6, 0.4);
    const on = ease.inOutSine(prog(t, 56.8, 58.2));
    l.lm.color.copy(mixHex("#f3ecd8", "#ffd98a", on, C1)).multiplyScalar(1 + 2.4 * on);
  });
  walkers.forEach((w, i) => {
    let d = (w.off + w.speed * t) % (2 * w.L);
    const back = d > w.L;
    if (back) d = 2 * w.L - d;
    let k = 1;
    while (k < w.cum.length - 1 && w.cum[k] < d) k++;
    const u = (d - w.cum[k - 1]) / Math.max(1e-4, w.cum[k] - w.cum[k - 1]);
    const [x0, z0] = w.pts[k - 1], [x1, z1] = w.pts[k];
    const side = 0.09 * (back ? -1 : 1);
    const dx = x1 - x0, dz = z1 - z0, l = Math.hypot(dx, dz) || 1;
    w.g.position.set(lerp(x0, x1, u) - (dz / l) * side, 0.02 + 0.012 * Math.abs(Math.sin(t * 9 + i)), lerp(z0, z1, u) + (dx / l) * side);
    w.g.rotation.y = Math.atan2(dx, dz) + (back ? Math.PI : 0);
    const pk = spring(t, TL.WIPE.b + 0.1 + i * 0.07, 2.6, 0.45);
    w.g.visible = pk > 0.01;
    w.g.scale.setScalar(1.15 * Math.max(0.01, pk));
  });
  Wd.flowers.visible = t > TL.WIPE.a + 0.25;
  Wd.flowers.scale.set(1, clamp(prog(t, TL.WIPE.a + 0.25, TL.WIPE.b + 0.3)), 1);

  // ---- doors, lights, windows
  const RED = "#ff5f5f", GREEN = "#38e88f";
  for (const id of ORDER) {
    const b = B[id], v = TL.V[id];
    const g = t >= v.green ? 1 : 0;
    const lk = g ? 1 + 0.8 * Math.exp(-(t - v.green) * 5) : 1;
    const lm = b.door ? b.door.lightM : b.lightM;
    lm.color.copy(mixHex(RED, GREEN, g, C1)).multiplyScalar(lerp(1.3, 2.4, dusk) * lk);
    const open = id === "slack" ? 0 : spring(t, v.green + 0.05, 1.8, 0.5) * (1 - ease.inOutCubic(prog(t, v.leave + 0.1, v.leave + 0.6)));
    if (b.door) {
      for (const L of b.door.leaves) L.pivot.rotation.y = L.side * 1.55 * clamp(open, 0, 1.15);
      b.door.inner.color.copy(mixHex("#3b2a22", "#ffd7a1", clamp(open), C1)).multiplyScalar(1 + 0.6 * clamp(open));
    }
    // windows light up one by one while it reads; at dusk every window glows
    const n = b.wins.length, [r0, r1] = v.read;
    b.wins.forEach((m, j) => {
      const on = ease.outCubic(prog(t, r0 + (j / n) * (r1 - r0), r0 + (j / n) * (r1 - r0) + 0.18));
      const off = ease.inOutCubic(prog(t, v.leave + 0.4, v.leave + 1.4));
      let e = on * (1 - off) * 1.7 + on * off * 0.0;
      const st = TL.ASK.stops[id];
      if (st) e += 1.6 * win(t, st - 0.2, st + 0.5, 0.12, 0.3);
      if (id === "docs") e += 1.6 * win(t, TL.LEARN.trace[0] + 1.25, TL.LEARN.back[0], 0.2, 0.4);
      e = Math.max(e, 1.5 * dusk);
      if (id === "slack") m.emissiveIntensity = e * 0.55;
      else m.emissiveIntensity = e;
    });
  }
  // the house's own windows glow at dusk; the vault stays dark
  B.house.wins.forEach((m) => { m.emissiveIntensity = 1.7 * dusk + 1.2 * win(t, TL.RULES.home[0], 99, 0.3, 0.1) * dusk; });
  B.house.door.lightM.color.set(GREEN).multiplyScalar(lerp(1.2, 2.2, dusk));
  B.vault.lightM.color.set(RED).multiplyScalar(lerp(1.2, 2.4, dusk) * (1 + 1.0 * win(t, 58.95, 59.7, 0.15, 0.3) * (0.7 + 0.3 * Math.sin(t * 9))));
  B.vault.vdoor.rotation.z = 0.06 * win(t, 59.0, 59.6, 0.05, 0.2) * Math.sin(t * 40);
  B.vault.wins.forEach((m) => { m.emissiveIntensity = 0; });
  // the plaza's gate (opens after Connect), bubbles bob while it reads
  {
    const v = TL.V.slack;
    const open = spring(t, v.gate, 1.5, 0.42) * (1 - ease.inOutCubic(prog(t, v.leave + 0.2, v.leave + 0.9)));
    for (const L of B.slack.gate) L.pivot.rotation.y = -L.side * 1.45 * open;
    B.slack.bub.forEach((bb, i) => {
      const r = win(t, v.read[0] - 0.1, v.leave, 0.2, 0.3);
      bb.mesh.position.y = bb.y + 0.05 * Math.sin(t * 2.2 + i * 2) + 0.12 * r * Math.abs(Math.sin(t * 9 + i * 1.7));
    });
  }
  // the gear turns while code is read, the flag waves, the clock moves
  {
    const v = TL.V.code;
    B.code.gear.rotation.z = -(0.1 * t + 7 * (clamp(t, v.read[0], v.read[1] + 0.3) - v.read[0]) + 3 * Math.max(0, Math.min(t, 49.95) - 49.65));
    const f = B.directory.flag.geometry.attributes.position, base = B.directory.flagBase;
    for (let i = 0; i < f.count; i++) {
      const x = base[i * 3];
      f.setZ(i, (x / 0.95) * 0.09 * Math.sin(x * 7 - t * 6.5) + (x / 0.95) * 0.03 * Math.sin(t * 2.1));
    }
    f.needsUpdate = true;
    B.directory.hands[0].rotation.z = -t * 0.4;
  }
  // the house: hatch, notes on the board, the press
  {
    const h = B.house;
    h.hatch.rotation.x = -1.9 * spring(t, TL.OUT - 0.25, 1.8, 0.45) * (1 - ease.inOutCubic(prog(t, 7.45, 7.9)));
    h.notes.forEach((nt, i) => {
      const k = spring(t, TL.PIN[i], 2.4, 0.45);
      nt.n.visible = t > TL.PIN[i];
      nt.n.scale.setScalar(Math.max(0.001, k));
      nt.pinM.color.set(HUE[D.learned.facts[i].source]).multiplyScalar(1.1 + 1.2 * win(t, TL.RULES.on[2], TL.RULES.on[3] + 0.3, 0.2, 0.3) + 0.8 * dusk);
    });
    const pr = TL.PRESS;
    const turn = clamp(t, pr.a, pr.roll[1]) - pr.a;
    h.rollers.forEach((r, i) => { r.rotation.x = (i ? -1 : 1) * turn * 9; });
    h.press.position.y = 0.19 + 0.012 * win(t, pr.a, pr.roll[1], 0.2, 0.2) * Math.abs(Math.sin(t * 14));
    const up = ease.outCubic(prog(t, pr.out[0], pr.out[1]));
    const rk = ease.inOutCubic(prog(t, pr.roll[0], pr.roll[1]));
    h.sheet.visible = t > pr.out[0] && t < pr.roll[1];
    h.sheet.position.y = 0.3 - 0.4 * (1 - up);
    h.sheet.scale.y = Math.max(0.001, 1 - rk);
    // the roll: rolls down the sheet, rests on the press, goes with the courier, drops at the door
    const roll = h.roll;
    const Bf = TL.BRIEF;
    roll.visible = t > pr.roll[0] && t < Bf.unroll[0] - 0.28;
    if (roll.visible) {
      let p, spin = 0;
      if (t < Bf.grab) {
        h.press.updateWorldMatrix(true, false);
        const y = 0.3 + 0.4 * (1 - rk);
        p = h.press.localToWorld(V3(0, y + 0.04, -0.04));
        spin = rk * 9;
        if (t < pr.roll[1]) roll.scale.setScalar(0.9 * (0.6 + 0.4 * rk));
        else roll.scale.setScalar(0.9);
      } else if (t < Bf.drop) {
        p = courierPos(t).add(V3(0, -0.42 * CS, 0));
        roll.scale.setScalar(0.9);
      } else {
        const top = courierPos(Bf.drop).add(V3(0, -0.42 * CS, 0));
        const q = t - Bf.drop, fall = Bf.land - Bf.drop;
        p = A.mat.clone();
        if (q < fall) { const k = q / fall; p.lerp(top, 1 - k * k); }
        else { const b = q - fall; p.y += 0.12 * Math.abs(Math.sin(b * 11)) * Math.exp(-b * 7); p.x += 0.05 * (1 - Math.exp(-b * 5)); }
        spin = q * 6;
      }
      roll.position.copy(p);
      roll.rotation.set(0, SITES.house.yaw, 0);
      h.rollMesh.rotation.x = spin;
    }
  }
  // the billboard lights up at dusk with its message
  {
    const on = ease.outCubic(prog(t, TL.RULES.on[3] - 0.25, TL.RULES.on[3] + 0.25));
    B.billboard.nightM.opacity = on;
    B.billboard.nightM.color.setScalar(1 + 0.5 * on);
  }
  // the glass dome over Ram's house: what it learned stays there
  {
    const k = spring(t, TL.RULES.home[0], 1.6, 0.5);
    dome.visible = k > 0.003;
    dome.scale.set(1.15 * Math.max(0.001, k), Math.max(0.001, k), Math.max(0.001, k));
    domeM.opacity = 0.16 * clamp(k) * (1 - 0.3 * prog(t, 64, 66));
  }

  // ---- the courier
  const cp = courierPos(t);
  const { yaw, sp } = courierYaw(t);
  cour.root.visible = t > TL.OUT - 0.05;
  cour.root.position.copy(cp);
  cour.body.rotation.set(0.32 * clamp(sp / 5), yaw, 0.04 * Math.sin(t * 1.7));
  {
    // squash as it lands, stretch as it takes off
    const sg = seg(t);
    let sq = 0;
    if (sg.k === "h" && sg.prev && sg.prev.k === "f") { const dt = t - sg.t0; if (dt < 0.8) sq = 0.14 * Math.exp(-7 * dt) * Math.cos(15 * dt); }
    if (sg.k === "f") { const k = prog(t, sg.t0, sg.t1); if (k < 0.3) sq = -0.1 * Math.sin((Math.PI * k) / 0.3); }
    cour.body.scale.set(1 + sq, 1 - sq, 1 + sq);
  }
  cour.rotors.forEach((r, i) => { r.rotation.y = t * 37 + i * 1.3; });
  const bl = blinkAt.some((b) => Math.abs(t - b) < 0.07);
  cour.eyes.forEach((e) => { e.scale.y = bl ? 0.2 : 1.35; });
  cour.pennant.rotation.y = 0.35 * Math.sin(t * 7) - 0.25 * clamp(sp / 4);
  cour.light.intensity = t > TL.OUT + 0.1 ? 2.2 : 0;
  cour.halo.material.opacity = 0.36 + 0.08 * Math.sin(t * 3) + 0.25 * dusk;
  // its basket: one glowing copy per source it has read, until it pins them on the board
  ORDER.forEach((id, i) => {
    const got = t > TL.V[id].copy[1] - 0.05;
    const gone = t > TL.PIN[i] - 0.3;
    cour.items[i].visible = got && !gone;
  });
  // the keycard: hangs in front, held up at each door
  const shows = [[TL.V.directory.show, 0.6], [TL.V.docs.show, 0.45], [TL.V.slack.show, 0.5], [TL.V.code.arrive, 0.35], [TL.V.tickets.arrive, 0.35], [TL.V.mail.show, 0.45], [58.95, 0.65]];
  let sk = 0;
  for (const [a, d] of shows) sk = Math.max(sk, win(t, a, a + d + 0.25, 0.18, 0.22));
  const skE = ease.inOutCubic(sk);
  const yawQ = new THREE.Quaternion().setFromEuler(new THREE.Euler(0.5, yaw, 0, "YXZ"));
  const rest = V3(0, -0.2, 0.25).applyQuaternion(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0)));
  const up = V3(0, 0.56, 0);
  cour.card.position.copy(rest.lerp(up, skE));
  cour.card.quaternion.copy(yawQ).slerp(camera.quaternion, skE);
  cour.card.scale.setScalar(1 + 0.35 * skE + 0.1 * Math.sin(Math.PI * clamp(sk * 1.2)));
  // the camera flash (a copy, never taking anything)
  let fl = 0;
  for (const id of ["docs", "slack", "code", "tickets", "mail"]) { const f = TL.V[id].flash; fl = Math.max(fl, Math.exp(-Math.abs(t - f) * 14) * (t > f - 0.05 ? 1 : 0)); }
  fl = Math.max(fl, Math.exp(-Math.abs(t - 63.1) * 12) * (t > 63.05 ? 1 : 0));
  cour.flash.position.set(0, -0.14, 0.28).applyQuaternion(new THREE.Quaternion().setFromEuler(new THREE.Euler(0, yaw, 0)));
  cour.flash.scale.setScalar(0.25 + 0.9 * fl);
  cour.flash.material.opacity = fl * 0.95;
  // its shadow blob on the ground
  const gy = 0.02;
  cour.blob.position.set(cp.x, gy, cp.z);
  const hgt = Math.max(0.2, cp.y);
  cour.blob.scale.setScalar(0.45 + 0.12 * hgt);
  cour.blob.material.opacity = cour.root.visible ? clamp(0.34 - 0.05 * hgt, 0.08, 0.3) : 0;

  // ---- copies flying into the basket
  let ci = 0;
  const basket = cp.clone().add(V3(0, -0.36 * CS, 0));
  const flyCopy = (from, a, b, hex, big) => {
    const m = copies[ci++];
    const k = prog(t, a, b);
    if (!m || k <= 0 || k >= 1) { if (m) m.visible = false; return; }
    const e = ease.inOutCubic(k);
    const mid = from.clone().lerp(basket, 0.5).add(V3(0, 0.7, 0));
    const u = 1 - e;
    m.position.set(u * u * from.x + 2 * u * e * mid.x + e * e * basket.x, u * u * from.y + 2 * u * e * mid.y + e * e * basket.y, u * u * from.z + 2 * u * e * mid.z + e * e * basket.z);
    m.quaternion.copy(camera.quaternion);
    m.rotateZ(Math.sin(k * 6) * 0.4);
    m.scale.setScalar((big ? 1 : 1) * (1 - 0.6 * e) * Math.min(1, k * 6));
    m.material.color.set(hex).lerp(C2.set("#ffffff"), 0.45).multiplyScalar(1.7);
    m.material.opacity = 1;
    m.visible = true;
  };
  {
    const v = TL.V.directory;
    flyCopy(A.lab.directory.clone().add(V3(0, 0.2, 0)), v.copy[0], v.copy[1], "#fff2c7", true);
  }
  for (const id of ["docs", "slack", "code", "tickets", "mail"]) {
    const v = TL.V[id];
    for (let j = 0; j < 4; j++) {
      const span = v.copy[1] - v.copy[0];
      const a = v.copy[0] + j * span * 0.16;
      const from = A.flash[id].clone().add(V3((h01(j, 3) - 0.5) * 0.9, 0.2 + h01(j, 5) * 0.7, (h01(j, 9) - 0.5) * 0.3));
      flyCopy(from, a, a + span * 0.52, HUE[id], false);
    }
  }
  for (; ci < copies.length; ci++) copies[ci].visible = false;
  // notes fly from the basket to the board
  proxies.forEach((m, i) => {
    const k = prog(t, TL.PIN[i] - 0.32, TL.PIN[i]);
    m.visible = k > 0 && k < 1;
    if (!m.visible) return;
    const e = ease.inOutCubic(k);
    const from = basket, to = A.notes[i];
    const mid = from.clone().lerp(to, 0.5).add(V3(0, 0.35, 0));
    const u = 1 - e;
    m.position.set(u * u * from.x + 2 * u * e * mid.x + e * e * to.x, u * u * from.y + 2 * u * e * mid.y + e * e * to.y, u * u * from.z + 2 * u * e * mid.z + e * e * to.z);
    m.quaternion.copy(A.noteQ);
    m.rotateZ((1 - e) * 1.2);
    m.scale.setScalar(0.5 + 0.5 * e);
  });

  // ---- the search loop: glowing trail and ring pulses
  {
    const [a, b] = TL.ASK.loop;
    ribbonU.uProg.value = prog(t, a, b);
    ribbonU.uFade.value = win(t, a, b + 1.2, 0.2, 0.9);
    ribbon.visible = ribbonU.uFade.value > 0.002;
    ["docs", "slack", "code", "mail"].forEach((id, i) => {
      const s = TL.ASK.stops[id];
      const k = prog(t, s - 0.05, s + 0.75);
      const m = rings[i];
      m.visible = k > 0 && k < 1;
      if (!m.visible) return;
      const c = id === "slack" ? toWorld(SITES.slack, 0, 0, 0) : A.flash[id];
      m.position.set(c.x, 0.05, c.z);
      m.scale.setScalar(0.4 + 1.6 * ease.outCubic(k));
      m.material.opacity = (1 - k) * 0.9;
    });
  }

  // ---- particles
  fx.begin(); glow.begin();
  // dust as each building lands
  for (const id of Object.keys(SITES)) {
    const q = t - popT[id];
    if (q > 0 && q < 0.9) for (let j = 0; j < 12; j++) {
      const a = (j / 12) * Math.PI * 2 + h01(j, 2);
      const r = 0.9 + 1.4 * ease.outCubic(q / 0.9);
      fx.add(SITES[id].x + Math.cos(a) * r, 0.1 + 0.3 * q, SITES[id].z + Math.sin(a) * r * 0.85, 0.45 + 0.4 * q, "#fff9ee", 0.55 * (1 - q / 0.9));
    }
  }
  // the page lands: a puff along its edges
  if (land > 0 && land < 1.2) for (let j = 0; j < 60; j++) {
    const f = j / 60, s = f * 4;
    const side = Math.floor(s), u = s - side;
    const ex = [[-8 + 16 * u, 4.5], [8, 4.5 - 9 * u], [8 - 16 * u, -4.5], [-8, -4.5 + 9 * u]][side];
    const out = 0.3 + 0.9 * ease.outCubic(land / 1.2);
    const nx = side === 1 ? 1 : side === 3 ? -1 : 0, nz = side === 0 ? 1 : side === 2 ? -1 : 0;
    fx.add(ex[0] + nx * out, 0.15 + 0.4 * land * h01(j, 4), ex[1] + nz * out, 0.7 + 0.6 * land, "#fffdf7", 0.6 * (1 - land / 1.2));
  }
  // sparkles on the dissolving edge of the page
  if (t > TL.WIPE.a && t < TL.WIPE.b + 0.3) {
    const R = 9.6 * ease.outCubic(prog(t, TL.WIPE.a, TL.WIPE.b));
    for (let j = 0; j < 70; j++) {
      const a = (j / 70) * Math.PI * 2;
      const x = Math.cos(a) * R, z = Math.sin(a) * R;
      if (Math.abs(x) > 8 || Math.abs(z) > 4.5) continue;
      glow.add(x, 0.08 + 0.25 * h01(j, 8), z, 0.22, "#9ff7cf", 0.9 * (1 - prog(t, TL.WIPE.b - 0.1, TL.WIPE.b + 0.3)));
    }
  }
  // chimney smoke
  A.chimneys.forEach((c, ii) => {
    if (t < 6.5) return;
    for (let j = 0; j < 7; j++) {
      const ph = ((t * 0.32 + j / 7 + ii * 0.13) % 1 + 1) % 1;
      fx.add(c.x + 0.25 * ph + 0.05 * Math.sin(t + j), c.y + 1.3 * ph, c.z - 0.15 * ph, 0.22 + 0.5 * ph, "#ffffff", 0.5 * Math.sin(Math.PI * ph) * (1 - 0.4 * dusk));
    }
  });
  // the courier's sparkle trail
  if (cour.root.visible) for (let j = 1; j <= 14; j++) {
    const q = courierPos(t - j * 0.05);
    const s = courierYaw(t - j * 0.05).sp;
    glow.add(q.x + 0.04 * Math.sin(j * 3.1), q.y - 0.05, q.z + 0.04 * Math.cos(j * 2.3), 0.16 * (1 - j / 15), "#a8ffd6", clamp(s / 3) * 0.75 * (1 - j / 15));
  }
  // glints on the keycard when it is shown
  if (sk > 0.05) {
    const cw = cour.card.getWorldPosition(new THREE.Vector3());
    for (let j = 0; j < 6; j++) {
      const a = t * 2.5 + j * 1.05;
      glow.add(cw.x + Math.cos(a) * 0.25, cw.y + Math.sin(a * 1.3) * 0.16, cw.z + Math.sin(a) * 0.25, 0.09 + 0.06 * Math.sin(t * 9 + j), "#fff6c9", sk * 0.9);
    }
  }
  // little glints on the pond
  if (t > 6.2) for (let j = 0; j < 7; j++) {
    const ph = ((t * 0.5 + j / 7) % 1 + 1) % 1;
    glow.add(POND.x + (h01(j, 21) - 0.5) * 1.3, 0.03, POND.z + (h01(j, 23) - 0.5) * 0.8, 0.13, "#ffffff", 0.7 * Math.sin(Math.PI * ph) * (1 - 0.6 * dusk));
  }
  // fireflies at dusk
  if (dusk > 0) for (let j = 0; j < 44; j++) {
    const x = (h01(j, 11) * 2 - 1) * 7.2, z = (h01(j, 13) * 2 - 1) * 4;
    glow.add(x + 0.3 * Math.sin(t * 0.7 + j), 0.25 + 0.35 * h01(j, 17) + 0.12 * Math.sin(t * 1.3 + j * 2), z + 0.3 * Math.cos(t * 0.6 + j), 0.11, "#ffe39a", dusk * (0.4 + 0.4 * Math.sin(t * 2 + j * 1.7)));
  }
  fx.end(); glow.end();

  // ---- post: tilt-shift strength (off while today's page is up)
  const tiltK = prog(t, 5.0, 6.6);
  tilt.u.uAmt.value = 1.25 * tiltK;
  const cs = proj(cp);
  const fw = cs && cour.root.visible ? Math.max(win(t, 7.2, 27.0, 0.5, 0.6), win(t, 47.3, 51.9, 0.4, 0.5), win(t, 57.4, 64.5, 0.5, 0.6)) : 0;
  tilt.u.uFocus.value = 0.52 + fw * (clamp(1 - (cs ? cs[1] : 540) / H, 0.34, 0.68) - 0.52);
  tilt.u.uVig.value = 0.28 * tiltK;
  tilt.u.uSat.value = 1 + 0.1 * tiltK;
  composer.render();

  // ---- today's page and its fold
  const foldOn = t >= TL.FOLD.a - 0.01 && t < TL.WIPE.b + 0.1;
  show(css3d.domElement, foldOn);
  show(pageA, t < TL.FOLD.a + 0.02);
  const press = Math.max(0, 1 - Math.abs(t - (TL.CLICK + 0.02)) / 0.12);
  const btnS = `scale(${(1 - 0.05 * press + 0.035 * (spring(t, TL.CLICK + 0.1, 3, 0.4) - (t > TL.CLICK + 0.1 ? 1 : 0))).toFixed(4)})`;
  pgA.button.style.transform = btnS;
  pgB.button.style.transform = btnS;
  if (foldOn) {
    const k = prog(t, TL.FOLD.a, TL.FOLD.land);
    let th = -(Math.PI / 2) * ease.inQuad(k);
    if (t > TL.FOLD.land) { const q = t - TL.FOLD.land; th = -Math.PI / 2 + 0.07 * Math.exp(-q * 7) * Math.abs(Math.sin(q * 13)); }
    hinge.rotation.x = th;
    const rr = 138 * ease.outCubic(prog(t, TL.FOLD.a, TL.FOLD.land));
    wrap.style.setProperty("--r", `${rr.toFixed(1)}px`);
    shade.style.background = `rgba(30, 44, 38, ${(0.22 * Math.sin(Math.PI * k)).toFixed(3)})`;
    const R = 1150 * ease.outCubic(prog(t, TL.WIPE.a, TL.WIPE.b));
    const mask = t > TL.WIPE.a ? `radial-gradient(circle at 50% 50%, transparent ${R.toFixed(0)}px, #000 ${(R + 90).toFixed(0)}px)` : "none";
    wrapIn.style.maskImage = mask;
    wrapIn.style.webkitMaskImage = mask;
    const ringK = win(t, TL.WIPE.a, TL.WIPE.b + 0.05, 0.1, 0.3);
    ring.style.opacity = ringK.toFixed(3);
    ring.style.background = `radial-gradient(circle at 50% 50%, rgba(183,244,207,0) ${(R - 30).toFixed(0)}px, rgba(214,255,232,0.95) ${(R + 30).toFixed(0)}px, rgba(183,244,207,0) ${(R + 110).toFixed(0)}px)`;
    css3d.render(cssScene, camera);
  }

  const ctx = buildC(t, cp);
  // ---- the pointer
  {
    let x = 1500, y = 900, down = 0, op = 0;
    const conn = (id) => proj(id === "slack" ? A.gate : id === "code" ? A.codeDoor : A.ticketsDoor) || [0, 0];
    if (t < 5.2) {
      const k = ease.inOutCubic(prog(t, 3.25, 4.25));
      x = lerp(1520, btnAt[0], k); y = lerp(930, btnAt[1], k);
      if (t > 4.55) { const q = ease.inOutCubic(prog(t, 4.55, 5.1)); x += 60 * q; y += 40 * q; }
      down = Math.max(0, 1 - Math.abs(t - TL.CLICK) / 0.1);
      op = win(t, 3.1, 5.1, 0.3, 0.4);
    } else if (t > 12.3 && t < 17.8) {
      const s = conn("slack"), c = conn("code"), k2 = conn("tickets");
      const sP = [s[0] + 4, s[1] - 22], cP = [c[0] + 4, c[1] - 22], kP = [k2[0] + 4, k2[1] - 22];
      const pts = [[12.4, [1700, 820]], [13.08, sP], [13.4, sP], [15.62, cP], [15.9, cP], [16.98, kP], [17.25, kP], [17.75, [kP[0] + 120, kP[1] + 110]]];
      let i = 0; while (i < pts.length - 2 && t > pts[i + 1][0]) i++;
      const [ta, pa] = pts[i], [tb, pb] = pts[i + 1];
      const e = ease.inOutCubic(prog(t, ta, tb));
      x = lerp(pa[0], pb[0], e); y = lerp(pa[1], pb[1], e);
      down = Math.max(0, ...[TL.V.slack.click, TL.V.code.click, TL.V.tickets.click].map((c2) => 1 - Math.abs(t - c2) / 0.1));
      op = win(t, 12.35, 17.75, 0.3, 0.4) * (1 - win(t, 13.75, 15.35, 0.3, 0.3));
    } else if (t > 46.4 && t < 47.8) {
      const g = ctx.askGo || [1200, 400];
      const k = ease.inOutCubic(prog(t, 46.5, 47.1));
      x = lerp(1560, g[0] + 4, k); y = lerp(860, g[1] - 4, k);
      down = Math.max(0, 1 - Math.abs(t - TL.ASK.send) / 0.1);
      op = win(t, 46.45, 47.75, 0.25, 0.35);
    }
    ptr.at(x, y, down, op);
  }

  // ---- the HTML layer
  renderUI(U, t, ctx);
}

const C = {};
function buildC(t, cp) {
  C.lab = {};
  for (const id of ORDER) C.lab[id] = proj(A.lab[id]);
  C.popT = popT;
  C.courier = proj(cp);
  C.flag = proj(cp.clone().add(V3(0.02, 0.52 * CS, 0)));
  C.card = proj(cour.card.getWorldPosition(new THREE.Vector3()).add(V3(0, 0.1, 0)));
  C.courierOn = cour.root.visible;
  C.conn = { slack: proj(A.gate), code: proj(A.codeDoor), tickets: proj(A.ticketsDoor) };
  const bc = A.boardC.map(proj).filter(Boolean);
  C.board = bc.length ? { x0: Math.min(...bc.map((p) => p[0])), x1: Math.max(...bc.map((p) => p[0])), y0: Math.min(...bc.map((p) => p[1])), y1: Math.max(...bc.map((p) => p[1])) } : { x0: 900, x1: 960, y0: 500, y1: 540 };
  C.roll = proj(Wd.b.house.roll.position) || [600, 700];
  C.press = proj(A.pressTop.clone().add(V3(0, 0.25, 0)));
  C.signs = A.signs.map(proj);
  C.vault = proj(A.vault);
  C.billboard = proj(A.billboard);
  C.house = proj(A.house);
  C.writeAt = [1250, 150];
  const hb = C.house;
  if (hb && U) {
    const rise = spring(t, TL.ASK.rise[0], 2.2, 0.55);
    const s = 0.35 + 0.65 * rise;
    C.askGo = [hb[0] + U.goOff[0] * s, hb[1] - 30 - 50 * rise + U.goOff[1] * s];
  }
  return C;
}
const show = (e, on) => { const v = on ? "" : "none"; if (e.style.display !== v) e.style.display = v; };

export default {
  captions: [
    { at: 3.2, to: 5.4, text: CW.click },
    { at: 6.8, to: 9.6, text: CW.directory },
    { at: 9.8, to: 12.3, text: CW.search },
    { at: 12.45, to: 16.35, text: CW.connect },
    { at: 16.55, to: 19.45, text: "Then code, tickets and mail, each read as you" },
    { at: 19.75, to: 23.45, text: CW.write },
    { at: 23.65, to: 26.65, text: CW.brief },
    { at: 28.9, to: 32.9, text: CW.learned },
    { at: 37.4, to: 41.4, text: CW.yourBrief },
    { at: 44.6, to: 47.6, text: CW.ask },
    { at: 52.6, to: 56.4, text: CW.answer },
    { at: 57.2, to: 61.0, text: "The rules it keeps: labelled as AI, and it reads only as you" },
    { at: 61.2, to: 65.0, text: "It never acts on what it reads. It only reads, and sends nothing" },
  ],
  init,
  render,
};
