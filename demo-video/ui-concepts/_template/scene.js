// The template: proves the pipeline end to end and shows the pattern a concept follows.
// Today's page, the pointer clicks "Set up my AI Peer", the page gives way to a dark scene with a
// glowing three.js shape (bloom from the vendored add-ons) and cards that pop in, with captions.
import * as THREE from "three";
import { EffectComposer } from "three/addons/postprocessing/EffectComposer.js";
import { RenderPass } from "three/addons/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/addons/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/addons/postprocessing/OutputPass.js";
import { el, prog, ease, keys, spring, stagger } from "../shared/kit.js";
import { todayPage, pointer, centre } from "../shared/page.js";
import { learned, captionWords, sourceById } from "../shared/data.js";

let pg, ptr, btnAt, gl, cards = [];
let renderer, scene, camera, composer, mesh;

export default {
  captions: [
    { at: 3.1, to: 5.2, text: captionWords.click },
    { at: 5.4, to: 8.3, text: captionWords.learned },
  ],

  async init(stage) {
    pg = todayPage(stage);
    btnAt = centre(pg.button);

    // A WebGL layer: preserveDrawingBuffer so the renderer's capture sees each frame.
    gl = el("canvas", "tpl-gl", stage);
    gl.width = 1920; gl.height = 1080;
    renderer = new THREE.WebGLRenderer({ canvas: gl, antialias: true, preserveDrawingBuffer: true });
    renderer.setPixelRatio(1);
    renderer.setSize(1920, 1080, false);
    scene = new THREE.Scene();
    scene.background = new THREE.Color("#070b12");
    camera = new THREE.PerspectiveCamera(40, 1920 / 1080, 0.1, 100);
    camera.position.set(0, 0, 9);
    mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.6, 1), new THREE.MeshBasicMaterial({ color: "#b7f4cf", wireframe: true }));
    mesh.position.x = -2.6;
    scene.add(mesh);
    composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));
    composer.addPass(new UnrealBloomPass(new THREE.Vector2(1920, 1080), 1.1, 0.6, 0.0));
    composer.addPass(new OutputPass());

    const box = el("div", "tpl-cards", stage);
    cards = learned.facts.slice(0, 3).map((f) =>
      el("div", "tpl-card", box, `${f.title}<small>${sourceById[f.source].name} · ${f.ref} · ${f.date}</small>`));

    ptr = pointer(stage);
  },

  render(t) {
    // 0 to 5.4 s: today's page; the pointer glides to the button and clicks at 4.4 s.
    const [x, y] = keys(t, [[3.2, [1500, 900]], [4.2, btnAt], [6, btnAt]]);
    const down = Math.max(0, 1 - Math.abs(t - 4.45) / 0.12);
    ptr.at(x, y, down, 1 - prog(t, 5.0, 5.3));
    pg.button.style.transform = `scale(${1 - 0.05 * down + 0.04 * (spring(t, 4.5, 3, 0.4) - (t > 4.5 ? 1 : 0))})`;
    // 4.6 to 5.4 s: the page gives way to the dark scene.
    const away = ease.inOutCubic(prog(t, 4.6, 5.4));
    pg.root.style.opacity = String(1 - away);
    pg.root.style.transform = `scale(${1 - 0.06 * away})`;
    gl.style.opacity = String(away);

    // The glowing shape turns with t (never with a clock).
    mesh.rotation.set(t * 0.5, t * 0.8, 0);
    mesh.scale.setScalar(0.6 + 0.4 * spring(t, 5.0, 1.6, 0.35));
    composer.render();

    // Cards pop in one by one from 5.6 s.
    cards.forEach((c, i) => {
      const k = stagger(t, 5.6, i, 0.35, 0.6, ease.outBack);
      c.style.opacity = String(Math.min(1, k * 1.4));
      c.style.transform = `translateX(${(1 - k) * 60}px) scale(${0.9 + 0.1 * k})`;
    });
  },
};
