import * as THREE from "three";
import type { TravelPoint, ZoneDef } from "@moon/shared";
import { toonMaterial } from "./materials.js";

export interface WorldScene {
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  renderer: THREE.WebGLRenderer;
  resize(): void;
  /** Tears down the previous zone's ground/scenery/travel markers and builds the new one. */
  loadZone(zone: ZoneDef): void;
}

function buildGround(zone: ZoneDef): THREE.Mesh {
  const geo = new THREE.CircleGeometry(zone.radius + 6, 96);
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
  const base = new THREE.Color(zone.groundColor);
  const highlight = new THREE.Color(zone.groundHighlight);
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

function hashSeed(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (Math.imul(h, 31) + id.charCodeAt(i)) | 0;
  return h;
}

function buildTree(dead: boolean): THREE.Group {
  const group = new THREE.Group();
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.28, 2.2, 6), toonMaterial(dead ? "#392e24" : "#4a3524"));
  trunk.position.y = 1.1;
  trunk.castShadow = true;
  group.add(trunk);
  if (dead) {
    for (let i = 0; i < 3; i++) {
      const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.09, 1.0 + i * 0.15, 5), toonMaterial("#2c231c"));
      branch.position.set((Math.random() - 0.5) * 0.6, 1.9 + i * 0.4, (Math.random() - 0.5) * 0.6);
      branch.rotation.z = (Math.random() - 0.5) * 1.3;
      branch.rotation.x = (Math.random() - 0.5) * 0.6;
      branch.castShadow = true;
      group.add(branch);
    }
  } else {
    const foliageColors = ["#2f5d3f", "#356847", "#3d7250"];
    for (let i = 0; i < 3; i++) {
      const s = 1.5 - i * 0.32;
      const foliage = new THREE.Mesh(new THREE.IcosahedronGeometry(s, 0), toonMaterial(foliageColors[i % foliageColors.length]));
      foliage.position.y = 2.1 + i * 1.05;
      foliage.rotation.y = i * 1.3;
      foliage.castShadow = true;
      group.add(foliage);
    }
  }
  return group;
}

function buildRock(rand: () => number): THREE.Mesh {
  const geo = new THREE.IcosahedronGeometry(0.5 + rand() * 0.6, 0);
  const rock = new THREE.Mesh(geo, toonMaterial("#5f6470"));
  rock.castShadow = true;
  rock.receiveShadow = true;
  return rock;
}

function buildTravelMarker(tp: TravelPoint): THREE.Group {
  const group = new THREE.Group();
  const ring = new THREE.Mesh(new THREE.TorusGeometry(tp.radius, 0.15, 8, 32), new THREE.MeshBasicMaterial({ color: "#8fe3ff" }));
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.05;
  group.add(ring);

  const beam = new THREE.Mesh(
    new THREE.CylinderGeometry(tp.radius * 0.6, tp.radius * 0.6, 5, 24, 1, true),
    new THREE.MeshBasicMaterial({ color: "#8fe3ff", transparent: true, opacity: 0.16, side: THREE.DoubleSide })
  );
  beam.position.y = 2.4;
  group.add(beam);

  const glow = new THREE.PointLight("#8fe3ff", 1.3, 14, 2);
  glow.position.y = 1.6;
  group.add(glow);

  group.position.set(tp.pos.x, 0, tp.pos.z);
  group.name = `travelPoint:${tp.id}`;
  return group;
}

interface ThemeVisuals {
  deadTrees: boolean;
  treeCount: number;
  rockCount: number;
  moteCount: number;
  moteColor: string;
  moteName: string;
  moteHeight: number;
}

const THEME_VISUALS: Record<ZoneDef["theme"], ThemeVisuals> = {
  verdant: { deadTrees: false, treeCount: 140, rockCount: 70, moteCount: 60, moteColor: "#bff3a8", moteName: "fireflies", moteHeight: 2.4 },
  ashen: { deadTrees: true, treeCount: 22, rockCount: 130, moteCount: 40, moteColor: "#ff9a52", moteName: "embers", moteHeight: 4.5 },
  coastal: { deadTrees: false, treeCount: 40, rockCount: 100, moteCount: 50, moteColor: "#8fe3ff", moteName: "sea-glow", moteHeight: 3.0 },
  highland: { deadTrees: true, treeCount: 10, rockCount: 150, moteCount: 30, moteColor: "#c9c3d6", moteName: "mist-wisps", moteHeight: 3.6 },
  arcane: { deadTrees: true, treeCount: 5, rockCount: 60, moteCount: 70, moteColor: "#9fd0ff", moteName: "arcane-motes", moteHeight: 3.2 },
  fractured: { deadTrees: true, treeCount: 15, rockCount: 160, moteCount: 45, moteColor: "#ff6b8f", moteName: "rift-motes", moteHeight: 4.8 },
  // The Moonthread itself: no trees at all, just stone and the moon's own light given form.
  lunar: { deadTrees: true, treeCount: 0, rockCount: 90, moteCount: 90, moteColor: "#e8ecff", moteName: "moonlight", moteHeight: 5.5 }
};

function scatterScenery(target: THREE.Group, zone: ZoneDef) {
  const rand = mulberry32(hashSeed(zone.id));
  const visuals = THEME_VISUALS[zone.theme];

  for (let i = 0; i < visuals.treeCount; i++) {
    const angle = rand() * Math.PI * 2;
    const radius = 14 + rand() * (zone.radius - 6);
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    const tree = buildTree(visuals.deadTrees);
    tree.position.set(x, 0, z);
    const s = 0.8 + rand() * 0.6;
    tree.scale.setScalar(s);
    tree.rotation.y = rand() * Math.PI * 2;
    target.add(tree);
  }

  for (let i = 0; i < visuals.rockCount; i++) {
    const angle = rand() * Math.PI * 2;
    const radius = rand() * (zone.radius + 4);
    const rock = buildRock(rand);
    rock.position.set(Math.cos(angle) * radius, 0.2, Math.sin(angle) * radius);
    rock.rotation.set(rand() * Math.PI, rand() * Math.PI, rand() * Math.PI);
    target.add(rock);
  }

  const motePositions = new Float32Array(visuals.moteCount * 3);
  for (let i = 0; i < visuals.moteCount; i++) {
    const angle = rand() * Math.PI * 2;
    const radius = rand() * zone.radius;
    motePositions[i * 3] = Math.cos(angle) * radius;
    motePositions[i * 3 + 1] = 0.6 + rand() * visuals.moteHeight;
    motePositions[i * 3 + 2] = Math.sin(angle) * radius;
  }
  const moteGeo = new THREE.BufferGeometry();
  moteGeo.setAttribute("position", new THREE.BufferAttribute(motePositions, 3));
  const moteMat = new THREE.PointsMaterial({
    color: visuals.moteColor,
    size: visuals.deadTrees ? 0.28 : 0.22,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.85
  });
  const motes = new THREE.Points(moteGeo, moteMat);
  motes.name = visuals.moteName;
  target.add(motes);

  for (const tp of zone.travelPoints) target.add(buildTravelMarker(tp));
}

function disposeObject(obj: THREE.Object3D) {
  obj.traverse((child) => {
    const mesh = child as THREE.Mesh;
    if (mesh.geometry) mesh.geometry.dispose();
    const mat = (mesh as unknown as { material?: THREE.Material | THREE.Material[] }).material;
    if (Array.isArray(mat)) mat.forEach((m) => m.dispose());
    else mat?.dispose();
  });
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

  const zoneGroup = new THREE.Group();
  zoneGroup.name = "zoneGroup";
  scene.add(zoneGroup);

  function resize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  }
  window.addEventListener("resize", resize);

  function loadZone(zone: ZoneDef) {
    for (const child of [...zoneGroup.children]) {
      zoneGroup.remove(child);
      disposeObject(child);
    }
    zoneGroup.add(buildGround(zone));
    scatterScenery(zoneGroup, zone);
    scene.background = new THREE.Color(zone.backgroundColor);
    scene.fog = new THREE.FogExp2(zone.fogColor, 0.012);
  }

  return { scene, camera, renderer, resize, loadZone };
}
