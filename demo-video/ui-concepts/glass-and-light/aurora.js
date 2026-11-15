// The aurora behind the glass: one full-frame shader, drawn at 768 x 432 and scaled up by CSS
// (it is soft by nature, and the renderer's WebGL runs on the CPU). Two moods, mixed by `calm`:
// deep (an ink-blue night with ribbons of mint, aqua, sky and lilac light, while the Peer works)
// and calm (pearl daylight with pastel light, once the page has settled).
import * as THREE from "three";

const VERT = `
varying vec2 vUv;
void main() { vUv = uv; gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

const FRAG = `
precision highp float;
varying vec2 vUv;
uniform float uT;
uniform float uCalm;
uniform float uLift;
uniform float uDim;
uniform vec2 uFlare;

float hash12(vec2 p) { vec3 p3 = fract(vec3(p.xyx) * .1031); p3 += dot(p3, p3.yzx + 33.33); return fract((p3.x + p3.y) * p3.z); }
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  vec2 u = f * f * (3. - 2. * f);
  float a = hash12(i), b = hash12(i + vec2(1., 0.)), c = hash12(i + vec2(0., 1.)), d = hash12(i + vec2(1., 1.));
  return mix(mix(a, b, u.x), mix(c, d, u.x), u.y);
}
float fbm(vec2 p) {
  float v = 0., a = .5;
  mat2 r = mat2(.8, .6, -.6, .8);
  for (int i = 0; i < 4; i++) { v += a * vnoise(p); p = r * p * 2.03 + 17.; a *= .5; }
  return v;
}
float fbm3(vec2 p) {
  float v = 0., a = .5;
  mat2 r = mat2(.8, .6, -.6, .8);
  for (int i = 0; i < 3; i++) { v += a * vnoise(p); p = r * p * 2.03 + 17.; a *= .5; }
  return v;
}

void main() {
  vec2 uv = vUv;
  vec2 p = vec2(uv.x * 1.7778, uv.y);
  float t = uT;
  vec2 q = vec2(fbm(p * 1.1 + vec2(0., t * .035)), fbm(p * 1.1 + vec2(3.7, -t * .03)));
  float f = fbm(p * 1.3 + q * 1.6 + vec2(t * .02, -t * .01));

  vec3 mint = vec3(.36, .93, .76), aqua = vec3(.20, .74, .90), sky = vec3(.40, .52, 1.), lilac = vec3(.63, .52, .98);

  // Deep: night with ribbons of light.
  vec3 deep = mix(vec3(.018, .036, .078), vec3(.040, .080, .135), smoothstep(0., 1., uv.y));
  float y1 = uv.y - (.66 + .09 * sin(p.x * 1.4 + t * .12) + .12 * (q.x - .5));
  float y2 = uv.y - (.38 + .07 * sin(p.x * 1.9 - t * .10 + 1.3) + .14 * (q.y - .5));
  float y3 = uv.y - (.84 + .05 * sin(p.x * 2.3 + t * .08 + 2.1) + .08 * (q.y - .5));
  float r1 = exp(-y1 * y1 * 46.) * (.45 + .55 * fbm3(vec2(p.x * 6.5, t * .08)));
  float r2 = exp(-y2 * y2 * 34.) * (.45 + .55 * fbm3(vec2(p.x * 5.5 + 9., t * .07)));
  float r3 = exp(-y3 * y3 * 90.) * (.35 + .65 * fbm3(vec2(p.x * 8. + 4., t * .09)));
  vec3 c1 = mix(mint, aqua, smoothstep(.15, .95, uv.x + .25 * q.y));
  vec3 c2 = mix(lilac, sky, smoothstep(.05, .85, uv.x - .25 * q.x));
  vec3 c3 = mix(sky, mint, smoothstep(.2, .9, uv.x));
  deep += c1 * r1 * .62 + c2 * r2 * .5 + c3 * r3 * .3;
  deep += mix(aqua, lilac, f) * smoothstep(.48, .92, f) * .2;
  deep += mint * .12 * exp(-pow(length((uv - vec2(.5, .02)) * vec2(1.6, 3.2)), 2.));
  deep *= 1. - .22 * pow(length((uv - .5) * vec2(1.05, 1.25)), 2.);

  // Calm: pearl daylight.
  vec3 calm = mix(vec3(.895, .918, .942), vec3(.955, .964, .977), smoothstep(0., 1., uv.y));
  calm = mix(calm, vec3(.66, .93, .82), .72 * smoothstep(.40, .90, fbm(p * 1.0 + q + vec2(t * .02, 0.))));
  calm = mix(calm, vec3(.72, .82, 1.), .62 * smoothstep(.38, .86, q.x));
  calm = mix(calm, vec3(.85, .77, 1.), .56 * smoothstep(.42, .92, q.y));
  calm = mix(calm, vec3(1., .87, .82), .26 * smoothstep(.55, .95, f));

  vec3 col = mix(deep, calm, uCalm);
  col *= 1. - uDim * .35;
  float fl = exp(-pow(length((uv - uFlare) * vec2(1.7778, 1.)), 2.) * 9.);
  col += uLift * fl * vec3(.45, .95, .82);
  col += (hash12(gl_FragCoord.xy + fract(t * 7.) * 113.) - .5) / 110.;
  gl_FragColor = vec4(col, 1.);
}
`;

export function makeAurora(parent, cls = "gl-aurora") {
  const canvas = document.createElement("canvas");
  canvas.className = cls;
  canvas.width = 768;
  canvas.height = 432;
  parent.appendChild(canvas);
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: false, preserveDrawingBuffer: true });
  renderer.setPixelRatio(1);
  renderer.setSize(768, 432, false);
  const scene = new THREE.Scene();
  const cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const uniforms = {
    uT: { value: 0 }, uCalm: { value: 0 }, uLift: { value: 0 }, uDim: { value: 0 },
    uFlare: { value: new THREE.Vector2(0.5, 0.5) },
  };
  const mat = new THREE.ShaderMaterial({ uniforms, vertexShader: VERT, fragmentShader: FRAG, depthTest: false, depthWrite: false });
  scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), mat));
  return {
    canvas,
    // flare: [x, y] in 0..1 of the frame (y down), where the click's light blooms.
    render(t, { calm = 0, lift = 0, dim = 0, flare = [0.5, 0.5] } = {}) {
      uniforms.uT.value = t;
      uniforms.uCalm.value = calm;
      uniforms.uLift.value = lift;
      uniforms.uDim.value = dim;
      uniforms.uFlare.value.set(flare[0], 1 - flare[1]);
      renderer.render(scene, cam);
    },
  };
}
