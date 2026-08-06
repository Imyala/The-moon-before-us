import * as THREE from "three";
import type { PlayerClassId } from "@moon/shared";
import { toonGradientMap } from "./materials.js";

function freshToon(color: string): THREE.MeshToonMaterial {
  return new THREE.MeshToonMaterial({ color: new THREE.Color(color), gradientMap: toonGradientMap() });
}

export interface Avatar {
  group: THREE.Group;
  body: THREE.MeshToonMaterial;
  parts: { torso: THREE.Object3D; head: THREE.Object3D; armL: THREE.Object3D; armR: THREE.Object3D; legL: THREE.Object3D; legR: THREE.Object3D; weapon?: THREE.Object3D };
  flashUntil: number;
  attackPulse: number;
  nameTag?: string;
}

const WEAPON_BY_CLASS: Record<PlayerClassId, "sword" | "bow" | "orb"> = {
  warden: "sword",
  ranger: "bow",
  mystic: "orb",
  duskblade: "sword"
};

function buildWeapon(kind: "sword" | "bow" | "orb"): THREE.Object3D {
  if (kind === "sword") {
    const g = new THREE.Group();
    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.08, 0.9, 0.16), freshToon("#d7dde6"));
    blade.position.y = 0.55;
    const hilt = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.25, 0.12), freshToon("#4a3524"));
    g.add(blade, hilt);
    return g;
  }
  if (kind === "bow") {
    const torus = new THREE.Mesh(new THREE.TorusGeometry(0.42, 0.035, 6, 12, Math.PI), freshToon("#7a5a34"));
    torus.rotation.z = Math.PI / 2;
    return torus;
  }
  const orb = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 1), new THREE.MeshBasicMaterial({ color: "#c9b6ff" }));
  return orb;
}

function buildHumanoid(color: string, weaponKind: "sword" | "bow" | "orb"): Avatar {
  const group = new THREE.Group();
  const body = freshToon(color);
  const skin = freshToon("#e6c9a8");

  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.28, 0.55, 4, 8), body);
  torso.position.y = 1.05;
  torso.castShadow = true;
  group.add(torso);

  const head = new THREE.Mesh(new THREE.SphereGeometry(0.24, 12, 10), skin);
  head.position.y = 1.62;
  head.castShadow = true;
  group.add(head);

  const armGeo = new THREE.CapsuleGeometry(0.09, 0.5, 3, 6);
  const armL = new THREE.Mesh(armGeo, body);
  armL.position.set(0.38, 1.1, 0);
  armL.castShadow = true;
  const armR = new THREE.Mesh(armGeo, body);
  armR.position.set(-0.38, 1.1, 0);
  armR.castShadow = true;
  group.add(armL, armR);

  const legGeo = new THREE.CapsuleGeometry(0.11, 0.55, 3, 6);
  const legL = new THREE.Mesh(legGeo, freshToon("#2c2a33"));
  legL.position.set(0.14, 0.42, 0);
  legL.castShadow = true;
  const legR = new THREE.Mesh(legGeo, freshToon("#2c2a33"));
  legR.position.set(-0.14, 0.42, 0);
  legR.castShadow = true;
  group.add(legL, legR);

  const weapon = buildWeapon(weaponKind);
  weapon.position.set(-0.5, 1.15, 0.1);
  armR.add(weapon);
  weapon.position.set(0, -0.35, 0.15);

  return { group, body, parts: { torso, head, armL, armR, legL, legR, weapon }, flashUntil: 0, attackPulse: 0 };
}

export function buildPlayerAvatar(classId: PlayerClassId, color: string): Avatar {
  return buildHumanoid(color, WEAPON_BY_CLASS[classId]);
}

export function buildNpcAvatar(color: string): Avatar {
  const avatar = buildHumanoid(color, "orb");
  avatar.parts.weapon?.removeFromParent();
  return avatar;
}

export function buildEnemyAvatar(defId: string, color: string, scale: number): Avatar {
  let avatar: Avatar;
  if (defId === "moonlit_wolf") {
    avatar = buildQuadruped(color);
  } else if (defId === "husk" || defId === "stone_sentinel") {
    avatar = buildHumanoid(color, "sword");
    avatar.parts.weapon?.removeFromParent();
  } else if (defId === "bramble_stalker") {
    avatar = buildSpiky(color);
  } else {
    avatar = buildWraith(color);
  }
  avatar.group.scale.setScalar(scale);
  return avatar;
}

function buildQuadruped(color: string): Avatar {
  const group = new THREE.Group();
  const body = freshToon(color);
  const torso = new THREE.Mesh(new THREE.CapsuleGeometry(0.32, 0.7, 4, 8), body);
  torso.rotation.z = Math.PI / 2;
  torso.position.y = 0.55;
  torso.castShadow = true;
  group.add(torso);
  const head = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.5, 8), body);
  head.rotation.z = -Math.PI / 2;
  head.position.set(0.65, 0.62, 0);
  head.castShadow = true;
  group.add(head);
  const legGeo = new THREE.CylinderGeometry(0.07, 0.07, 0.55, 6);
  const legPositions: [number, number][] = [
    [0.32, 0.22],
    [0.32, -0.22],
    [-0.32, 0.22],
    [-0.32, -0.22]
  ];
  const legs: THREE.Object3D[] = [];
  for (const [x, z] of legPositions) {
    const leg = new THREE.Mesh(legGeo, body);
    leg.position.set(x, 0.27, z);
    leg.castShadow = true;
    group.add(leg);
    legs.push(leg);
  }
  const tail = new THREE.Mesh(new THREE.ConeGeometry(0.1, 0.4, 6), body);
  tail.rotation.z = Math.PI / 2.4;
  tail.position.set(-0.62, 0.68, 0);
  group.add(tail);
  return {
    group,
    body,
    parts: { torso, head, armL: legs[0], armR: legs[1], legL: legs[2], legR: legs[3] },
    flashUntil: 0,
    attackPulse: 0
  };
}

function buildSpiky(color: string): Avatar {
  const group = new THREE.Group();
  const body = freshToon(color);
  const torso = new THREE.Mesh(new THREE.IcosahedronGeometry(0.5, 0), body);
  torso.position.y = 0.9;
  torso.castShadow = true;
  group.add(torso);
  const spikeMat = freshToon("#26361e");
  const spikes: THREE.Object3D[] = [];
  for (let i = 0; i < 6; i++) {
    const spike = new THREE.Mesh(new THREE.ConeGeometry(0.09, 0.35, 5), spikeMat);
    const angle = (i / 6) * Math.PI * 2;
    spike.position.set(Math.cos(angle) * 0.42, 0.9 + Math.sin(angle * 2) * 0.15, Math.sin(angle) * 0.42);
    spike.lookAt(spike.position.clone().multiplyScalar(2));
    spike.rotateX(Math.PI / 2);
    group.add(spike);
    spikes.push(spike);
  }
  const head = torso;
  return {
    group,
    body,
    parts: { torso, head, armL: spikes[0], armR: spikes[1], legL: spikes[2], legR: spikes[3] },
    flashUntil: 0,
    attackPulse: 0
  };
}

function buildWraith(color: string): Avatar {
  const group = new THREE.Group();
  const body = freshToon(color);
  const robe = new THREE.Mesh(new THREE.ConeGeometry(0.65, 1.9, 8, 1, true), body);
  robe.position.y = 1.1;
  robe.castShadow = true;
  group.add(robe);
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.28, 10, 8), body);
  head.position.y = 2.05;
  group.add(head);
  const eyeMat = new THREE.MeshBasicMaterial({ color: "#ffe27a" });
  const eyeL = new THREE.Mesh(new THREE.SphereGeometry(0.045, 6, 6), eyeMat);
  eyeL.position.set(0.1, 2.05, 0.24);
  const eyeR = eyeL.clone();
  eyeR.position.x = -0.1;
  group.add(eyeL, eyeR);
  const armGeo = new THREE.CapsuleGeometry(0.07, 0.6, 3, 6);
  const armL = new THREE.Mesh(armGeo, body);
  armL.position.set(0.5, 1.3, 0);
  armL.rotation.z = 0.4;
  const armR = new THREE.Mesh(armGeo, body);
  armR.position.set(-0.5, 1.3, 0);
  armR.rotation.z = -0.4;
  group.add(armL, armR);
  return { group, body, parts: { torso: robe, head, armL, armR, legL: robe, legR: robe }, flashUntil: 0, attackPulse: 0 };
}

export function animateAvatar(avatar: Avatar, t: number, moving: boolean, now: number) {
  const { parts } = avatar;
  const bob = Math.sin(t * (moving ? 9 : 2.2)) * (moving ? 0.05 : 0.03);
  parts.torso.position.y = (parts.torso.userData.baseY ??= parts.torso.position.y) + bob;

  if (moving) {
    const swing = Math.sin(t * 9) * 0.5;
    parts.legL.rotation.x = swing;
    parts.legR.rotation.x = -swing;
    parts.armL.rotation.x = -swing * 0.8;
    parts.armR.rotation.x = swing * 0.8;
  } else {
    parts.legL.rotation.x = THREE.MathUtils.lerp(parts.legL.rotation.x, 0, 0.15);
    parts.legR.rotation.x = THREE.MathUtils.lerp(parts.legR.rotation.x, 0, 0.15);
    parts.armL.rotation.x = THREE.MathUtils.lerp(parts.armL.rotation.x, 0, 0.15);
    parts.armR.rotation.x = THREE.MathUtils.lerp(parts.armR.rotation.x, 0, 0.15);
  }

  if (avatar.attackPulse > 0) {
    const p = avatar.attackPulse;
    parts.armR.rotation.x = -1.4 * Math.sin(p * Math.PI);
    avatar.attackPulse = Math.max(0, p - 0.06);
  }

  if (avatar.flashUntil > now) {
    avatar.body.emissive.setHex(0xffffff);
    avatar.body.emissiveIntensity = 0.6;
  } else {
    avatar.body.emissiveIntensity = 0;
  }
}
