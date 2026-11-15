// Constellation's WebGL: the renderer and its post (bloom at quarter size, a grade with vignette
// and grain), instanced light sprites, the baked nebula sky, the dust, soft light lines, and the
// page that crumbles into stars. WebGL here is drawn in software, so: no multisampling (every
// sprite and line is soft by construction), bloom at quarter size, one baked sky texture.
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { ShaderPass } from "three/addons/postprocessing/ShaderPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { Line2 } from "three/addons/lines/Line2.js";
import { LineGeometry } from "three/addons/lines/LineGeometry.js";
import { LineMaterial } from "three/addons/lines/LineMaterial.js";
import { rng } from "../shared/kit.js";

export { THREE };

// sRGB hex -> linear [r, g, b] (what the shaders add up).
export function lin(hex, k = 1) {
  const c = new THREE.Color(hex);
  return [c.r * k, c.g * k, c.b * k];
}

export function initGL(canvas) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(1);
  renderer.setSize(1920, 1080, false);
  renderer.setClearColor(0x000000, 1);
  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1920 / 1080, 0.1, 3000);
  const composer = new EffectComposer(renderer);
  composer.addPass(new RenderPass(scene, camera));
  const bloom = new UnrealBloomPass(new THREE.Vector2(960, 540), 0.9, 0.55, 0.2);
  composer.addPass(bloom);
  bloom.setSize(960, 540); // addPass sized it to the full frame; a quarter is plenty for space
  const grade = new ShaderPass({
    uniforms: { tDiffuse: { value: null }, uFrame: { value: 0 }, uVig: { value: 0.32 }, uGrain: { value: 0.022 } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `
      uniform sampler2D tDiffuse; uniform float uFrame, uVig, uGrain; varying vec2 vUv;
      float h(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233)) + uFrame * 0.6180339) * 43758.5453); }
      void main(){
        vec3 c = texture2D(tDiffuse, vUv).rgb;
        vec2 q = vUv - 0.5; q.x *= 1.25;
        float v = 1.0 - uVig * smoothstep(0.18, 0.78, dot(q, q) * 1.9);
        c *= v;
        // a cool lift in the shadows, filmic grain (a pure function of the frame number)
        c += vec3(0.0016, 0.0024, 0.0052);
        c += (h(vUv * 1920.0) - 0.5) * uGrain * (0.35 + 0.65 * smoothstep(0.0, 0.25, c.g));
        gl_FragColor = vec4(c, 1.0);
      }`,
  });
  composer.addPass(grade);
  composer.addPass(new OutputPass());
  return { renderer, scene, camera, composer, bloom, grade };
}

// ---------------------------------------------------------------------------------------------
// Instanced light sprites: one draw call, any size, soft edges. kind: 0 soft glow, 1 star (core and
// halo), 2 star with spikes, 3 thin ring, 4 hot flare. Tiny ones are kept at least uMinPx wide and
// dimmed by area instead, so a far star never shimmers.
const SPRITE_VS = `
  attribute vec3 iPos; attribute vec4 iCol; attribute vec2 iSize;
  #ifdef TWINKLE
  attribute vec3 iTw; uniform float uTime;
  #endif
  uniform float uPx, uMinPx;
  varying vec2 vUv; varying vec4 vCol; varying float vKind;
  void main(){
    vec4 mv = modelViewMatrix * vec4(iPos, 1.0);
    float depth = max(-mv.z, 0.001);
    float s = iSize.x, a = iCol.a;
    float px = s * uPx / depth;
    if (px < uMinPx) { float r = px / uMinPx; s *= 1.0 / max(r, 0.0001); a *= r * r; }
    #ifdef TWINKLE
    a *= 1.0 - iTw.y * (0.5 + 0.5 * sin(uTime * iTw.x + iTw.z));
    #endif
    if (mv.z > -0.05) a = 0.0;
    mv.xy += position.xy * s * 0.5;
    gl_Position = projectionMatrix * mv;
    vUv = position.xy; vCol = vec4(iCol.rgb, a); vKind = iSize.y;
  }`;
const SPRITE_FS = `
  varying vec2 vUv; varying vec4 vCol; varying float vKind;
  void main(){
    float r2 = dot(vUv, vUv);
    if (r2 > 1.0 || vCol.a <= 0.0) discard;
    float a;
    if (vKind < 0.5) a = exp(-r2 * 4.5) * (1.0 - r2);
    else if (vKind < 1.5) a = exp(-r2 * 60.0) * 1.3 + exp(-r2 * 9.0) * 0.2 * (1.0 - r2);
    else if (vKind < 2.5) {
      a = exp(-r2 * 70.0) * 1.4 + exp(-r2 * 10.0) * 0.22 * (1.0 - r2);
      float sx = exp(-abs(vUv.y) * 90.0) * exp(-abs(vUv.x) * 3.2);
      float sy = exp(-abs(vUv.x) * 90.0) * exp(-abs(vUv.y) * 3.2);
      a += (sx + sy) * 0.55 * (1.0 - r2);
    } else if (vKind < 3.5) {
      float r = sqrt(r2);
      a = exp(-pow((r - 0.86) / 0.035, 2.0)) * 0.9 + exp(-pow((r - 0.86) / 0.16, 2.0)) * 0.18;
    } else a = exp(-r2 * 14.0) * 1.2 + exp(-r2 * 3.0) * 0.3 * (1.0 - r2);
    gl_FragColor = vec4(vCol.rgb * vCol.a * a, 1.0);
  }`;

export class Sprites {
  constructor(scene, cap, { twinkle = false, order = 0 } = {}) {
    const g = new THREE.InstancedBufferGeometry();
    g.setAttribute("position", new THREE.Float32BufferAttribute([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0], 3));
    g.setIndex([0, 1, 2, 0, 2, 3]);
    this.pos = new Float32Array(cap * 3);
    this.col = new Float32Array(cap * 4);
    this.siz = new Float32Array(cap * 2);
    this.aPos = new THREE.InstancedBufferAttribute(this.pos, 3).setUsage(THREE.DynamicDrawUsage);
    this.aCol = new THREE.InstancedBufferAttribute(this.col, 4).setUsage(THREE.DynamicDrawUsage);
    this.aSiz = new THREE.InstancedBufferAttribute(this.siz, 2).setUsage(THREE.DynamicDrawUsage);
    g.setAttribute("iPos", this.aPos);
    g.setAttribute("iCol", this.aCol);
    g.setAttribute("iSize", this.aSiz);
    if (twinkle) {
      this.tw = new Float32Array(cap * 3);
      g.setAttribute("iTw", new THREE.InstancedBufferAttribute(this.tw, 3));
    }
    g.instanceCount = 0;
    this.mat = new THREE.ShaderMaterial({
      uniforms: { uPx: { value: 1568 }, uMinPx: { value: 1.7 }, uTime: { value: 0 } },
      vertexShader: SPRITE_VS, fragmentShader: SPRITE_FS, defines: twinkle ? { TWINKLE: 1 } : {},
      transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending,
    });
    this.mesh = new THREE.Mesh(g, this.mat);
    this.mesh.frustumCulled = false;
    this.mesh.renderOrder = order;
    scene.add(this.mesh);
    this.g = g; this.cap = cap; this.n = 0;
  }
  begin() { this.n = 0; }
  // p: [x, y, z]; size: world diameter; c: linear [r, g, b]; a: alpha (may exceed 1 for HDR).
  add(p, size, c, a, kind = 1) {
    if (a <= 0.0005 || size <= 0 || this.n >= this.cap) return;
    const i = this.n++;
    this.pos[i * 3] = p[0]; this.pos[i * 3 + 1] = p[1]; this.pos[i * 3 + 2] = p[2];
    this.col[i * 4] = c[0]; this.col[i * 4 + 1] = c[1]; this.col[i * 4 + 2] = c[2]; this.col[i * 4 + 3] = a;
    this.siz[i * 2] = size; this.siz[i * 2 + 1] = kind;
  }
  end() {
    this.g.instanceCount = this.n;
    this.aPos.needsUpdate = true; this.aCol.needsUpdate = true; this.aSiz.needsUpdate = true;
  }
  setPx(px) { this.mat.uniforms.uPx.value = px; }
}

// ---------------------------------------------------------------------------------------------
// Value noise for the baked sky.
function makeNoise(seed) {
  const R = rng(seed), P = new Uint8Array(512), perm = [...Array(256).keys()];
  for (let i = 255; i > 0; i--) { const j = Math.floor(R() * (i + 1)); [perm[i], perm[j]] = [perm[j], perm[i]]; }
  for (let i = 0; i < 512; i++) P[i] = perm[i & 255];
  const V = new Float32Array(256).map(() => R());
  const f = (t) => t * t * (3 - 2 * t);
  return (x, y, z) => {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z);
    const xf = x - xi, yf = y - yi, zf = z - zi, u = f(xf), v = f(yf), w = f(zf);
    const X = xi & 255, Y = yi & 255, Z = zi & 255;
    const h = (a, b, c) => V[P[P[P[a] + b] + c]];
    const l = (a, b, k) => a + (b - a) * k;
    return l(
      l(l(h(X, Y, Z), h(X + 1, Y, Z), u), l(h(X, Y + 1, Z), h(X + 1, Y + 1, Z), u), v),
      l(l(h(X, Y, Z + 1), h(X + 1, Y, Z + 1), u), l(h(X, Y + 1, Z + 1), h(X + 1, Y + 1, Z + 1), u), v), w);
  };
}

// The sky: deep navy to black with faint nebula colour, baked once on a canvas (equirectangular,
// the same mapping as three's SphereGeometry), drawn on a far sphere.
export function makeSky(scene) {
  const Wd = 1280, Ht = 640;
  const cv = document.createElement("canvas");
  cv.width = Wd; cv.height = Ht;
  const cx = cv.getContext("2d");
  const img = cx.createImageData(Wd, Ht);
  const n1 = makeNoise(7), n2 = makeNoise(19), n3 = makeNoise(31);
  const fbm = (n, x, y, z) => { let s = 0, a = 0.5, f = 1; for (let o = 0; o < 4; o++) { s += a * n(x * f, y * f, z * f); f *= 2.03; a *= 0.5; } return s; };
  const R = rng(5);
  const band = [0.42, 0.82, -0.38]; // the normal of a faint galactic band
  for (let j = 0; j < Ht; j++) {
    const v = 1 - (j + 0.5) / Ht, th = (1 - v) * Math.PI;
    for (let i = 0; i < Wd; i++) {
      const u = (i + 0.5) / Wd, ph = u * Math.PI * 2;
      const dx = -Math.cos(ph) * Math.sin(th), dy = Math.cos(th), dz = Math.sin(ph) * Math.sin(th);
      const a = fbm(n1, dx * 2.1 + 5, dy * 2.1 + 5, dz * 2.1 + 5);
      const b = fbm(n2, dx * 3.2 + 9, dy * 3.2 + 9, dz * 3.2 + 9);
      const c = fbm(n3, dx * 6.0 + 2, dy * 6.0 + 2, dz * 6.0 + 2);
      const bd = Math.exp(-Math.pow((dx * band[0] + dy * band[1] + dz * band[2]) / 0.28, 2));
      // base: navy at the horizon, near black above and below
      let r = 5 + 4 * (1 - Math.abs(dy)), g = 8 + 6 * (1 - Math.abs(dy)), bl = 18 + 12 * (1 - Math.abs(dy));
      const neb = Math.max(0, a - 0.46) * 2.4;
      const vio = Math.max(0, b - 0.5) * 2.6;
      const dust = bd * (0.55 + 0.9 * Math.max(0, c - 0.4));
      r += neb * 10 + vio * 34 + dust * 16;
      g += neb * 40 + vio * 10 + dust * 18;
      bl += neb * 52 + vio * 52 + dust * 26;
      const dith = (R() - 0.5) * 1.6;
      const k = (j * Wd + i) * 4;
      img.data[k] = Math.min(255, r + dith); img.data[k + 1] = Math.min(255, g + dith); img.data[k + 2] = Math.min(255, bl + dith); img.data[k + 3] = 255;
    }
  }
  cx.putImageData(img, 0, 0);
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.wrapS = THREE.RepeatWrapping;
  tex.generateMipmaps = false;
  tex.minFilter = THREE.LinearFilter;
  const mat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide, depthWrite: false, depthTest: false, transparent: true, opacity: 1 });
  const sky = new THREE.Mesh(new THREE.SphereGeometry(1500, 48, 24), mat);
  sky.renderOrder = -10;
  sky.frustumCulled = false;
  scene.add(sky);
  return sky;
}

// The dust: far stars on a shell, mid dust around the constellation, a few near motes that drift
// past the lens. Static, twinkling in the shader from the time.
export function makeDust(scene) {
  const R = rng(77);
  const far = 4200, mid = 2600, near = 170;
  const sp = new Sprites(scene, far + mid + near, { twinkle: true, order: -5 });
  const tint = () => {
    const k = R();
    return k < 0.6 ? [0.75, 0.82, 1.0] : k < 0.85 ? [1.0, 0.92, 0.82] : [0.7, 0.95, 1.0];
  };
  const put = (p, size, c, a, kind, tw) => {
    const i = sp.n;
    sp.add(p, size, c, a, kind);
    if (sp.n > i) { sp.tw[i * 3] = tw[0]; sp.tw[i * 3 + 1] = tw[1]; sp.tw[i * 3 + 2] = tw[2]; }
  };
  for (let i = 0; i < far; i++) {
    const u = R() * 2 - 1, ph = R() * Math.PI * 2, rad = 600 + R() * 500, s = Math.sqrt(1 - u * u);
    const p = [Math.cos(ph) * s * rad, u * rad, Math.sin(ph) * s * rad];
    const b = Math.pow(R(), 3.2);
    put(p, (1.1 + 3.2 * b) * rad / 600, tint(), 0.35 + 2.4 * b, b > 0.55 ? 2 : 1, [0.6 + R() * 2.2, 0.15 + 0.35 * R(), R() * 6.28]);
  }
  for (let i = 0; i < mid; i++) {
    const p = [(R() * 2 - 1) * 90, (R() * 2 - 1) * 55, -70 + R() * 150];
    const b = Math.pow(R(), 2.6);
    put(p, 0.05 + 0.1 * b, tint(), 0.25 + 1.4 * b, 1, [0.8 + R() * 2.5, 0.2 + 0.4 * R(), R() * 6.28]);
  }
  for (let i = 0; i < near; i++) {
    const p = [(R() * 2 - 1) * 40, (R() * 2 - 1) * 24, -20 + R() * 95];
    put(p, 0.12 + 0.22 * R(), [0.6, 0.85, 1.0], 0.05 + 0.08 * R(), 0, [0.5 + R(), 0.3, R() * 6.28]);
  }
  sp.end();
  return sp;
}

// ---------------------------------------------------------------------------------------------
// A soft light line through world points (thick lines from the add-ons, with a soft cross profile
// so it needs no multisampling). set(k, alpha): drawn from the start up to k (0..1).
export function lightLine(scene, points, colors, width = 2.6) {
  const g = new LineGeometry();
  g.setPositions(points.flat());
  g.setColors(colors.flat());
  const m = new LineMaterial({ color: 0xffffff, linewidth: width, vertexColors: true, transparent: true, depthTest: false, depthWrite: false, worldUnits: false });
  m.blending = THREE.AdditiveBlending;
  m.resolution.set(1920, 1080);
  m.onBeforeCompile = (sh) => {
    sh.fragmentShader = sh.fragmentShader.replace(
      "gl_FragColor = vec4( diffuseColor.rgb, alpha );",
      "gl_FragColor = vec4( diffuseColor.rgb, alpha * exp( -2.6 * vUv.x * vUv.x ) );");
  };
  const line = new Line2(g, m);
  line.frustumCulled = false;
  line.renderOrder = 2;
  scene.add(line);
  const nseg = points.length - 1;
  return {
    line, points,
    set(k, alpha, w) {
      const on = k > 0.001 && alpha > 0.002;
      line.visible = on;
      g.instanceCount = on ? Math.max(1, Math.round(k * nseg)) : 0;
      m.opacity = alpha;
      if (w != null) m.linewidth = w;
    },
  };
}

// Points on a quadratic arc from a to b, lifted by `lift` (world) along `up`.
export function arc(a, b, lift, up = [0, 1, 0.35], n = 48) {
  const m = a.map((v, i) => (v + b[i]) / 2 + up[i] * lift);
  const out = [];
  for (let i = 0; i <= n; i++) {
    const k = i / n, u = 1 - k;
    out.push(a.map((v, j) => u * u * v + 2 * u * k * m[j] + k * k * b[j]));
  }
  return out;
}
export function at(points, k) {
  const f = Math.min(points.length - 1.0001, Math.max(0, k) * (points.length - 1));
  const i = Math.floor(f), u = f - i, a = points[i], b = points[i + 1];
  return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u, a[2] + (b[2] - a[2]) * u];
}

// ---------------------------------------------------------------------------------------------
// Today's page as particles: a grid of square points in the page's own colours that tiles the
// screen exactly at the start, then crumbles from the button outward and falls away into stars.
export function makePageDust(scene, pageCanvas, cell, btnPx, frame) {
  const W = 1920, H = 1080, nx = W / cell, ny = H / cell;
  const ctx = pageCanvas.getContext("2d");
  const data = ctx.getImageData(0, 0, W, H).data;
  const n = nx * ny;
  const home = new Float32Array(n * 2), col = new Float32Array(n * 3), rnd = new Float32Array(n * 4);
  const R = rng(4242);
  const toLin = (v) => { v /= 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); };
  let i = 0;
  for (let y = 0; y < ny; y++) {
    for (let x = 0; x < nx; x++, i++) {
      let r = 0, g = 0, b = 0;
      for (let yy = 0; yy < cell; yy++) for (let xx = 0; xx < cell; xx++) {
        const k = ((y * cell + yy) * W + (x * cell + xx)) * 4;
        r += data[k]; g += data[k + 1]; b += data[k + 2];
      }
      const q = cell * cell;
      home[i * 2] = x * cell + cell / 2; home[i * 2 + 1] = y * cell + cell / 2;
      col[i * 3] = toLin(r / q); col[i * 3 + 1] = toLin(g / q); col[i * 3 + 2] = toLin(b / q);
      rnd[i * 4] = R(); rnd[i * 4 + 1] = R(); rnd[i * 4 + 2] = R(); rnd[i * 4 + 3] = R();
    }
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.BufferAttribute(new Float32Array(n * 3), 3));
  g.setAttribute("aHome", new THREE.BufferAttribute(home, 2));
  g.setAttribute("aCol", new THREE.BufferAttribute(col, 3));
  g.setAttribute("aRnd", new THREE.BufferAttribute(rnd, 4));
  const m = new THREE.ShaderMaterial({
    uniforms: {
      uT: { value: -1 }, uBtn: { value: new THREE.Vector2(btnPx[0], btnPx[1]) }, uCell: { value: cell },
      uO: { value: new THREE.Vector3(...frame.origin) }, uR: { value: new THREE.Vector3(...frame.right) },
      uU: { value: new THREE.Vector3(...frame.up) }, uF: { value: new THREE.Vector3(...frame.fwd) },
      uHW: { value: frame.hw }, uHH: { value: frame.hh }, uDP: { value: frame.dp },
    },
    vertexShader: `
      attribute vec2 aHome; attribute vec3 aCol; attribute vec4 aRnd;
      uniform float uT, uCell, uHW, uHH, uDP; uniform vec2 uBtn; uniform vec3 uO, uR, uU, uF;
      varying vec3 vCol; varying float vA; varying float vSq;
      void main(){
        vec2 ndc = vec2(aHome.x / 1920.0 * 2.0 - 1.0, 1.0 - aHome.y / 1080.0 * 2.0);
        vec3 home = uO + uF * uDP + uR * ndc.x * uHW + uU * ndc.y * uHH;
        // The whole sheet tips back about its bottom edge and sinks away (eased in).
        float tip = smoothstep(0.0, 1.5, uT); tip *= tip;
        float ang = 0.62 * tip;
        vec3 pivot = uO + uF * uDP - uU * uHH;
        vec3 rel = home - pivot;
        float rr = dot(rel, uR), ru = dot(rel, uU), rf = dot(rel, uF);
        vec3 sheet = pivot + uR * rr + uU * (ru * cos(ang)) + uF * (rf + ru * sin(ang) + tip * 5.0);
        // The burning front: from the button outward, with an organic edge.
        vec2 dv = aHome - uBtn;
        float dist = length(dv);
        float wob = sin(aHome.x * 0.0061 + aHome.y * 0.0043) * 0.07 + sin(aHome.x * 0.0131 - aHome.y * 0.0107) * 0.05;
        float tf = dist / 1750.0 + wob + aRnd.w * 0.06;
        float age = uT - tf;
        vec3 p = sheet;
        float sizePx = uCell, a = 1.0, sq = 1.0;
        vec3 col = aCol;
        if (age > 0.0) {
          vec2 dir = dist > 0.5 ? dv / dist : vec2(0.0);
          vec3 out3 = uR * dir.x - uU * dir.y;
          float e = 1.0 - exp(-age * 1.5);
          vec3 swirl = uR * sin(aRnd.x * 6.283 + age * 2.1) + uU * cos(aRnd.y * 6.283 + age * 1.7);
          p = sheet + out3 * e * (0.5 + 2.6 * aRnd.x) + uF * e * (1.5 + 10.0 * aRnd.y) + (uU * 0.7 + swirl * 0.8) * e * aRnd.z;
          float hot = exp(-age * 12.0);
          bool keep = aRnd.y > 0.95;
          vec3 star = mix(vec3(0.72, 0.84, 1.0), vec3(0.8, 1.0, 0.9), aRnd.x) * (keep ? 1.5 : 0.7);
          col = mix(star, vec3(1.0, 1.6, 1.25), hot);
          sq = 1.0 - smoothstep(0.0, 0.09, age);
          sizePx = mix(keep ? 2.2 + 1.6 * aRnd.z : 1.3 + 1.1 * aRnd.z, uCell, sq);
          float life = keep ? 2.4 : 0.28 + 0.34 * aRnd.z;
          a = (1.0 - smoothstep(life * 0.3, life, age)) * (keep ? 1.0 : 0.75);
        }
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_Position = projectionMatrix * mv;
        gl_PointSize = sizePx * uDP / max(-mv.z, 0.01);
        vSq = sq;
        vCol = col;
        vA = uT < 0.0 ? 0.0 : a;
      }
      `,
    fragmentShader: `
      varying vec3 vCol; varying float vA; varying float vSq;
      void main(){
        vec2 q = gl_PointCoord * 2.0 - 1.0;
        float r2 = dot(q, q);
        float soft = exp(-r2 * 3.0) * (1.0 - smoothstep(0.7, 1.0, r2));
        float a = mix(soft, 1.0, vSq);
        if (a <= 0.003 || vA <= 0.0) discard;
        gl_FragColor = vec4(vCol * vA * a, 1.0);
      }`,
    transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const pts = new THREE.Points(g, m);
  pts.frustumCulled = false;
  pts.renderOrder = 5;
  scene.add(pts);
  return { pts, set(tSince) { m.uniforms.uT.value = tSince; pts.visible = tSince > -0.5 && tSince < 4.0; } };
}

// Paint today's page (the DOM made by shared/page.js) onto a canvas, so its particles carry its
// colours: backgrounds, borders, text by word, and icons. `skip` is left out (the button).
export async function paintPage(root, skip) {
  const cv = document.createElement("canvas");
  cv.width = 1920; cv.height = 1080;
  const c = cv.getContext("2d");
  const rr = (x, y, w, h, r) => { c.beginPath(); c.roundRect(x, y, w, h, Math.min(r, w / 2, h / 2)); };
  const walk = async (e) => {
    if (e === skip) return;
    const cs = getComputedStyle(e);
    const b = e.getBoundingClientRect();
    const rad = parseFloat(cs.borderTopLeftRadius) || 0;
    if (cs.backgroundColor && cs.backgroundColor !== "rgba(0, 0, 0, 0)" && b.width > 0) {
      c.fillStyle = cs.backgroundColor; rr(b.left, b.top, b.width, b.height, rad); c.fill();
    }
    const bw = parseFloat(cs.borderRightWidth) || 0;
    if (bw > 0 && cs.borderRightStyle !== "none") {
      c.fillStyle = cs.borderRightColor;
      if (parseFloat(cs.borderTopWidth) > 0) { c.strokeStyle = cs.borderTopColor; c.lineWidth = bw; rr(b.left + 0.5, b.top + 0.5, b.width - 1, b.height - 1, rad); c.stroke(); }
      else c.fillRect(b.right - bw, b.top, bw, b.height);
    }
    if (e.tagName.toLowerCase() === "svg") {
      const s = new XMLSerializer().serializeToString(e).replaceAll("currentColor", cs.color);
      const img = new Image();
      img.src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(s.includes("xmlns") ? s : s.replace("<svg", '<svg xmlns="http://www.w3.org/2000/svg"'));
      try { await img.decode(); c.drawImage(img, b.left, b.top, b.width, b.height); } catch (err) { /* an icon is optional */ }
      return;
    }
    for (const nd of e.childNodes) {
      if (nd.nodeType === 3 && nd.textContent.trim()) {
        c.font = `${cs.fontStyle} ${cs.fontWeight} ${cs.fontSize} ${cs.fontFamily}`;
        c.fillStyle = cs.color;
        c.letterSpacing = cs.letterSpacing === "normal" ? "0px" : cs.letterSpacing;
        const txt = nd.textContent, up = cs.textTransform === "uppercase";
        const re = /\S+/g;
        let m;
        while ((m = re.exec(txt))) {
          const range = document.createRange();
          range.setStart(nd, m.index); range.setEnd(nd, m.index + m[0].length);
          const r = range.getBoundingClientRect();
          const word = up ? m[0].toUpperCase() : m[0];
          const mt = c.measureText(word);
          c.fillText(word, r.left, r.top + (r.height + mt.fontBoundingBoxAscent - mt.fontBoundingBoxDescent) / 2);
        }
      } else if (nd.nodeType === 1) await walk(nd);
    }
  };
  await walk(root);
  return cv;
}
