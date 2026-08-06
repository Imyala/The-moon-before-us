import * as THREE from "three";
import type { ResourceNodeType } from "@moon/shared";
import { toonMaterial } from "./materials.js";

export function buildNodeMesh(type: ResourceNodeType, color: string): THREE.Group {
  const group = new THREE.Group();
  switch (type) {
    case "ore": {
      const base = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55, 0), toonMaterial("#5f6470"));
      base.position.y = 0.3;
      group.add(base);
      for (let i = 0; i < 3; i++) {
        const shard = new THREE.Mesh(new THREE.OctahedronGeometry(0.16, 0), toonMaterial(color, color, 0.4));
        shard.position.set((i - 1) * 0.22, 0.62 + i * 0.06, 0.1 * i);
        shard.rotation.set(Math.random(), Math.random(), Math.random());
        group.add(shard);
      }
      break;
    }
    case "tree": {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.16, 0.24, 1.6, 6), toonMaterial("#4a3524"));
      trunk.position.y = 0.8;
      group.add(trunk);
      const foliage = new THREE.Mesh(new THREE.IcosahedronGeometry(1.0, 0), toonMaterial(color));
      foliage.position.y = 1.7;
      group.add(foliage);
      break;
    }
    case "herb": {
      for (let i = 0; i < 5; i++) {
        const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(0.16, 0), toonMaterial(color, color, 0.25));
        const angle = (i / 5) * Math.PI * 2;
        leaf.position.set(Math.cos(angle) * 0.22, 0.15 + Math.random() * 0.1, Math.sin(angle) * 0.22);
        group.add(leaf);
      }
      break;
    }
    case "crystal": {
      const crystal = new THREE.Mesh(new THREE.OctahedronGeometry(0.5, 0), toonMaterial(color, color, 0.6));
      crystal.position.y = 0.9;
      group.add(crystal);
      group.userData.spin = crystal;
      break;
    }
  }
  group.traverse((obj) => {
    if (obj instanceof THREE.Mesh) {
      obj.castShadow = true;
      obj.receiveShadow = true;
    }
  });
  return group;
}
