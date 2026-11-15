// The Peer as a courier: a small glowing mint drone with an "AI" pennant, a basket for copies and
// Ram's keycard. Built once; scene.js poses it from t.
import * as THREE from "three";
import { HUE } from "./world.js";

const glowTex = (() => {
  let t = null;
  return () => {
    if (t) return t;
    const c = document.createElement("canvas");
    c.width = c.height = 128;
    const g = c.getContext("2d");
    const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64);
    gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.25, "rgba(255,255,255,0.55)"); gr.addColorStop(1, "rgba(255,255,255,0)");
    g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
    t = new THREE.CanvasTexture(c);
    return t;
  };
})();
export { glowTex };

export function buildCourier(tex) {
  const L = (c, o = {}) => new THREE.MeshLambertMaterial({ color: c, ...o });
  const root = new THREE.Group();
  const body = new THREE.Group();
  root.add(body);
  const add = (geo, m, x = 0, y = 0, z = 0, p = body) => { const o = new THREE.Mesh(geo, m); o.position.set(x, y, z); o.castShadow = true; p.add(o); return o; };

  const shellM = L("#b7f4cf", { emissive: new THREE.Color("#58e0a4"), emissiveIntensity: 0.6 });
  const shell = add(new THREE.SphereGeometry(0.26, 28, 18), shellM);
  shell.scale.set(1, 0.8, 1);
  add(new THREE.SphereGeometry(0.1, 16, 10), L("#ffffff", { emissive: new THREE.Color("#ffffff"), emissiveIntensity: 0.6 }), -0.08, 0.13, 0.08).scale.set(1, 0.5, 1);
  const band = add(new THREE.TorusGeometry(0.262, 0.034, 8, 40), L("#167353"));
  band.rotation.x = Math.PI / 2;
  // the face: a dark visor with two bright eyes
  const visor = add(new THREE.SphereGeometry(0.15, 22, 14), L("#173a31", { emissive: new THREE.Color("#0b2a20"), emissiveIntensity: 0.6 }), 0, 0.02, 0.17);
  visor.scale.set(1.35, 0.72, 0.62);
  const eyeM = new THREE.MeshBasicMaterial({ color: new THREE.Color("#e9fff3").multiplyScalar(1.6) });
  const eyes = [-0.062, 0.062].map((x) => { const e = add(new THREE.SphereGeometry(0.03, 12, 8), eyeM, x, 0.025, 0.255); e.scale.set(1, 1.35, 0.5); e.castShadow = false; return e; });
  // four arms with rotors
  const rotors = [];
  for (let i = 0; i < 4; i++) {
    const a = Math.PI / 4 + (i * Math.PI) / 2;
    const ax = Math.cos(a), az = Math.sin(a);
    const arm = add(new THREE.CylinderGeometry(0.018, 0.018, 0.2, 6), L("#167353"), ax * 0.3, 0.06, az * 0.3);
    arm.rotation.z = Math.PI / 2;
    arm.rotation.y = -a;
    add(new THREE.CylinderGeometry(0.032, 0.032, 0.06, 10), L("#0f4d38"), ax * 0.41, 0.09, az * 0.41);
    const disc = add(new THREE.CylinderGeometry(0.14, 0.14, 0.006, 24), new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.28, depthWrite: false }), ax * 0.41, 0.125, az * 0.41);
    disc.castShadow = false;
    const blades = new THREE.Group();
    blades.position.set(ax * 0.41, 0.13, az * 0.41);
    body.add(blades);
    add(new THREE.BoxGeometry(0.25, 0.008, 0.035), L("#e6fff1"), 0, 0, 0, blades);
    rotors.push(blades);
  }
  // antenna and the "AI" pennant
  add(new THREE.CylinderGeometry(0.01, 0.01, 0.26, 6), L("#0f4d38"), 0, 0.31, -0.02);
  add(new THREE.SphereGeometry(0.022, 8, 6), L("#b7f4cf", { emissive: new THREE.Color("#b7f4cf"), emissiveIntensity: 1 }), 0, 0.445, -0.02);
  const pennantGeo = new THREE.PlaneGeometry(0.2, 0.125);
  pennantGeo.translate(0.1, 0, 0);
  const pennant = add(pennantGeo, new THREE.MeshLambertMaterial({ map: tex.pennant, side: THREE.DoubleSide, emissive: new THREE.Color("#167353"), emissiveIntensity: 0.25 }), 0.008, 0.38, -0.02);
  pennant.castShadow = false;
  // the basket, hanging below, and the copies it carries (one per source)
  const basket = new THREE.Group();
  basket.position.set(0, -0.33, 0);
  body.add(basket);
  const wick = L("#f1d3a0"), rim = L("#d8a86e");
  add(new THREE.BoxGeometry(0.3, 0.02, 0.22), wick, 0, -0.05, 0, basket);
  for (const [x, z, w, d] of [[0, 0.11, 0.3, 0.02], [0, -0.11, 0.3, 0.02], [0.15, 0, 0.02, 0.22], [-0.15, 0, 0.02, 0.22]]) add(new THREE.BoxGeometry(w, 0.1, d), wick, x, 0, z, basket);
  add(new THREE.BoxGeometry(0.32, 0.02, 0.24), rim, 0, 0.05, 0, basket).scale.set(1, 1, 1);
  for (const x of [-0.12, 0.12]) add(new THREE.CylinderGeometry(0.006, 0.006, 0.2, 4), L("#0f4d38"), x, -0.2, 0);
  const items = ["directory", "docs", "slack", "code", "tickets", "mail"].map((id, i) => {
    const m = new THREE.MeshBasicMaterial({ color: new THREE.Color(HUE[id]).multiplyScalar(1.25) });
    const o = add(new THREE.BoxGeometry(0.2, 0.022, 0.15), m, (i % 2 ? 0.02 : -0.02), -0.03 + i * 0.024, 0, basket);
    o.rotation.y = (i % 3 - 1) * 0.25;
    o.castShadow = false;
    return o;
  });
  // the camera lens under the face (it copies, with a small flash)
  const lens = add(new THREE.CylinderGeometry(0.035, 0.035, 0.05, 12), L("#2b3a36"), 0, -0.14, 0.2);
  lens.rotation.x = Math.PI / 2;
  // Ram's keycard on a lanyard
  const card = new THREE.Group();
  root.add(card);
  const cardMesh = add(new THREE.PlaneGeometry(0.26, 0.163), new THREE.MeshLambertMaterial({ map: tex.keycard, side: THREE.DoubleSide, emissive: new THREE.Color("#ffffff"), emissiveIntensity: 0.25 }), 0, 0, 0, card);
  cardMesh.castShadow = false;
  // glow: a halo sprite and a small mint light
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: new THREE.Color("#7ff0bd"), transparent: true, opacity: 0.55, depthWrite: false, blending: THREE.AdditiveBlending }));
  halo.scale.setScalar(1.05);
  root.add(halo);
  const flash = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: new THREE.Color("#ffffff"), transparent: true, opacity: 0, depthWrite: false, blending: THREE.AdditiveBlending }));
  root.add(flash);
  const light = new THREE.PointLight("#8ff5c6", 2.2, 2.6, 2);
  light.position.set(0, 0.1, 0.2);
  root.add(light);
  return { root, body, eyes, rotors, pennant, basket, items, card, halo, flash, light, shellM };
}
