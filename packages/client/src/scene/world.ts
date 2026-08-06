import * as THREE from "three";
import { WORLD_RADIUS } from "@moon/shared";
import { toonMaterial } from "./materials.js";

export interface WorldScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  resize(): void;
}

function buildGround(): THREE.Mesh {
  const geo = new THREE.CircleGeometry(WORLD_RADIUS + 6, 96);
  geo.rotateX(-Math.PI / 2);
  const pos = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const d = Math.sqrt(x * x + z * z);
    const bump = Math.sin(x * 0.09) * Math.cos(z * 0.11) * 0.5 + Math.sin(d * 0.05) * 0.3;
    pos.setY(i, bump);
  }
  geo.computeVertexNormals();

  const colors = new Float32Array(pos.count * 3);
  const base = new THREE.Color("#2c4a3e");
  const highlight = new THREE.Color("#3f6b52");
  for (let i = 0; i < pos.count; i++) {
    const y = pos.getY(i);
    const t = THREE.MathUtils.clamp((y + 1) / 2, 0, 1);
    const c = base.clone().lerp(highlight, t);
    colors[i * 3] = c.r;
    colors[i * 3 + 1] = c.g;
    colors[i * 3 + 2] = c.b;
  }
  geo.setAttribute("color", new THREE.BufferAttribute(colors, 3));

  const mat = new THREE.MeshToonMaterial({ vertexColors: true, gradientMap: toonMaterial("#ffffff").gradientMap });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.receiveShadow = true;
  return mesh;
}

function buildStars(): THREE.Points {
  const count = 1400;
  const positions = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    const r = 200 + Math.random() * 150;
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(Math.random() * 0.9);
    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 20;
    positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
  const mat = new THREE.PointsMaterial({ color: "#cfe0ff", size: 0.9, sizeAttenuation: true });
  return new THREE.Points(geo, mat);
}

function buildMoon(): THREE.Mesh {
  const geo = new THREE.IcosahedronGeometry(14, 2);
  const mat = new THREE.MeshBasicMaterial({ color: "#f4f1e2" });
  const moon = new THREE.Mesh(geo, mat);
  moon.position.set(-90, 70, -160);
  return moon;
}

function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function buildTree(): THREE.Group {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 2.2, 6), toonMaterial("#4a3524"));
  trunk.position.y = 1.1;
  trunk.castShadow = true;
  group.add(trunk);
  const foliageColors = ["#2f5d3f", "#356847", "#3d7250"];
  for (let i = 0; i < 3; i++) {
    const s = 1.5 - i * 0.32;
    const foliage = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), toonMaterial(foliageColors[i % foliageColors.length]));
    foliage.position.y = 2.1 + i * 1.05;
    foliage.rotation.y = i * 1.3;
    foliage.castShadow = true;
    group.add(foliage);
  }
  return group;
}

function buildRock(): THREE.Mesh {
  const geo = new THREE.IcosahedronGeometry(0.5 + Math.random() * 0.6, 0);
  const rock = new THREE.Mesh(geo, toonMaterial("#5f6470"));
  rock.castShadow = true;
  rock.receiveShadow = true;
  return rock;
}

function scatterScenery(scene: THREE.Scene) {
  const rand = mulberry32(1337);
  const treeCount = 140;
  const rockCount = 70;

  for (let i = 0; i < treeCount; i++) {
    const angle = rand() * Math.PI * 2;
    const radius = 14 + rand() * (WORLD_RADIUS - 6);
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const tree = buildTree();
    tree.position.set(x, 0, z);
    const s = 0.8 + rand() * 0.6;
    tree.scale.setScalar(s);
    tree.rotation.y = rand() * Math.PI * 2;
    scene.add(tree);
  }

  for (let i = 0; i < rockCount; i++) {
    const angle = rand() * Math.PI * 2;
    const radius = rand() * (WORLD_RADIUS + 4);
    const rock = buildRock();
    rock.position.set(Math.cos(angle) * radius, 0.2, Math.sin(angle) * radius);
    rock.rotation.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI);
    scene.add(rock);
  }

  // fireflies
  const fireflyCount = 60;
  const fpos = new Float32Array(fireflyCount * 3);
  for (let i = 0; i < fireflyCount; i++) {
    const angle = rand() * Math.PI * 2;
    const radius = rand() * WORLD_RADIUS;
    fpos[i * 3] = Math.cos(angle) * radius;
    fpos[i * 3 + 1] = 0.6 + rand() * 2.4;
    fpos[i * 3 + 2] = Math.sin(angle) * radius;
  }
  const fgeo = new THREE.BufferGeometry();
  fgeo.setAttribute("position", new THREE.BufferAttribute(fpos, 3));
  const fmat = new THREE.PointsMaterial({ color: "#bff3a8", size: 0.22, sizeAttenuation: true, transparent: true, opacity: 0.85 });
  const fireflies = new THREE.Points(fgeo, fmat);
  fireflies.name = "fireflies";
  scene.add(fireflies);
}

export function createWorld(canvas: HTMLCanvasElement): WorldScene {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color("#0c1220");
  scene.fog = new THREE.FogExp2("#0c1220", 0.012);

  const camera = new THREE.PerspectiveCamera(58, window.innerWidth / window.innerHeight, 0.1, 500);

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(2, window.devicePixelRatio));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  const hemi = new THREE.HemisphereLight("#7a8dc9", "#1a2233", 0.85);
  scene.add(hemi);

  const moonLight = new THREE.DirectionalLight("#aac3ff", 1.1);
  moonLight.position.set(-40, 60, -30);
  moonLight.castShadow = true;
  moonLight.shadow.mapSize.set(2048, 2048);
  moonLight.shadow.camera.left = -70;
  moonLight.shadow.camera.right = 70;
  moonLight.shadow.camera.top = 70;
  moonLight.shadow.camera.bottom = -70;
  moonLight.shadow.camera.far = 220;
  scene.add(moonLight);

  const fillLight = new THREE.PointLight("#ffb37a", 0.6, 40, 2);
  fillLight.position.set(0, 6, 6);
  scene.add(fillLight);

  scene.add(buildStars());
  scene.add(buildMoon());
  scene.add(buildGround());
  scatterScenery(scene);

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener("resize", resize);

  return { scene, camera, renderer, resize };
}
