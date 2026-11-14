// SPIKE (temporary): how fast is the software GL of the capture? Wall-clock a render with MODE/K changed.
import * as THREE from "../../vendor/three.module.min.js";
import { el } from "../lib.js";

const MODE = "taps13"; // none | copy | taps13 | sphere
const K = 20;

export async function create(slot, film) {
  const node = el("div.scene", { style: { background: "#152b31", zIndex: 5 } });
  const canvas = document.createElement("canvas");
  canvas.width = 1920;
  canvas.height = 1080;
  canvas.style.cssText = "position:absolute;left:0;top:0;width:1920px;height:1080px";
  node.append(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, preserveDrawingBuffer: true, powerPreference: "high-performance" });
  renderer.setPixelRatio(1);
  renderer.setSize(1920, 1080, false);
  const gl = renderer.getContext();
  const rtA = new THREE.WebGLRenderTarget(1920, 1080, { type: THREE.HalfFloatType, depthBuffer: false });
  const rtB = new THREE.WebGLRenderTarget(1920, 1080, { type: THREE.HalfFloatType, depthBuffer: false });
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const vs = "varying vec2 vUv; void main(){ vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }";
  const copy = new THREE.ShaderMaterial({
    uniforms: { map: { value: null }, k: { value: 0 } },
    vertexShader: vs,
    fragmentShader: "varying vec2 vUv; uniform sampler2D map; uniform float k; void main(){ gl_FragColor = texture2D(map, vUv) * 0.98 + vec4(vUv, k, 1.0) * 0.02; }",
  });
  const taps = new THREE.ShaderMaterial({
    uniforms: { map: { value: null }, k: { value: 0 } },
    vertexShader: vs,
    fragmentShader: `varying vec2 vUv; uniform sampler2D map; uniform float k;
      void main(){ vec4 a = vec4(0.0); for (int i = -6; i <= 6; i++) { a += texture2D(map, vUv + vec2(float(i) / 1920.0, 0.0)); } gl_FragColor = a / 13.0 * 0.98 + vec4(vUv, k, 1.0) * 0.02; }`,
  });
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), copy);
  const scene = new THREE.Scene();
  scene.add(quad);
  const px = new Uint8Array(4);

  function frame(t) {
    if (MODE === "none") {
      quad.material = copy;
      copy.uniforms.map.value = rtA.texture;
      copy.uniforms.k.value = t % 1;
      renderer.setRenderTarget(null);
      renderer.render(scene, cam);
      return;
    }
    const m = MODE === "taps13" ? taps : copy;
    quad.material = m;
    let a = rtA, b = rtB;
    for (let i = 0; i < K; i++) {
      m.uniforms.map.value = a.texture;
      m.uniforms.k.value = (t + i * 0.1) % 1;
      renderer.setRenderTarget(b);
      renderer.render(scene, cam);
      const s = a; a = b; b = s;
    }
    quad.material = copy;
    copy.uniforms.map.value = a.texture;
    renderer.setRenderTarget(null);
    renderer.render(scene, cam);
    gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px);
  }
  frame(108);

  return { el: node, from: 108.0, to: 120.0, render: frame };
}
