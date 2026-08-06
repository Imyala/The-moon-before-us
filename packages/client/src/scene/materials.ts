import * as THREE from "three";

let gradientMap: THREE.DataTexture | null = null;

export function toonGradientMap(): THREE.DataTexture {
  if (gradientMap) return gradientMap;
  const steps = 4;
  const data = new Uint8Array(steps);
  for (let i = 0; i < steps; i++) data[i] = Math.round((i / (steps - 1)) * 255);
  const tex = new THREE.DataTexture(data, steps, 1, THREE.RedFormat);
  tex.needsUpdate = true;
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  gradientMap = tex;
  return tex;
}

const cache = new Map<string, THREE.MeshToonMaterial>();

export function toonMaterial(color: string, emissive = "#000000", emissiveIntensity = 0): THREE.MeshToonMaterial {
  const key = `${color}|${emissive}|${emissiveIntensity}`;
  let mat = cache.get(key);
  if (!mat) {
    mat = new THREE.MeshToonMaterial({
      color: new THREE.Color(color),
      emissive: new THREE.Color(emissive),
      emissiveIntensity,
      gradientMap: toonGradientMap()
    });
    cache.set(key, mat);
  }
  return mat;
}
