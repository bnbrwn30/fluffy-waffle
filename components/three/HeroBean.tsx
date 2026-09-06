"use client";

import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { DUR } from "@/lib/motion";

/**
 * The hero: a green coffee bean that turns slowly and leans toward the cursor,
 * with two smaller beans drifting behind it to give the group depth.
 *
 * The mesh is modelled in Blender (`blender/scripts/bean.py`) rather than
 * generated here. An earlier procedural version deformed a sphere and looked
 * like one — a real bean needs a genuinely flat face, a domed back, a rim
 * where they meet, and a fissure that runs in an S-curve, and that is far
 * easier to get right somewhere you can render a preview and look at it.
 */

const MODEL = "/models/bean.glb";

/**
 * glTF is Y-up where Blender is Z-up, so the exported bean arrives lying flat
 * with its face pointing at the sky. A quarter turn about X stands it up
 * facing camera.
 */
const UPRIGHT: [number, number, number] = [Math.PI / 2, 0, 0];

/**
 * Pulls the geometry AND the material out of the model.
 *
 * The material matters as much as the mesh here: it carries the base colour,
 * roughness and normal maps that came with the asset, and the normal map is
 * what actually makes the surface look like a seed rather than a shape. An
 * earlier version replaced it with a flat colour and threw all of that away.
 */
function useBean() {
  const { scene } = useGLTF(MODEL);
  return useMemo(() => {
    // Collected into arrays rather than nullable locals: TypeScript narrows a
    // `let x: T | null = null` to `never` inside the traverse closure.
    const geos: THREE.BufferGeometry[] = [];
    const mats: THREE.Material[] = [];
    scene.traverse((o) => {
      const mesh = o as THREE.Mesh;
      if (!mesh.isMesh) return;
      geos.push(mesh.geometry as THREE.BufferGeometry);
      mats.push(mesh.material as THREE.Material);
    });
    const material = mats[0] ?? null;

    // Push the asset's own maps harder than it shipped them. The model was
    // authored for a dark roast under studio lighting; on a pale bean against
    // pale paper the same settings read as washed out.
    if (material && (material as THREE.MeshStandardMaterial).isMeshStandardMaterial) {
      const m = material as THREE.MeshStandardMaterial;
      // Relief is dialled DOWN, not up. The source is a roasted bean and its
      // normal map has the wide sprung-open fissure that roasting produces;
      // green coffee is dense with a tight thin crease. Since the mesh is only
      // 651 vertices, that crease lives almost entirely in the normal map, so
      // softening the map is the only lever that narrows it. The fine surface
      // mottling survives at this strength; the canyon does not.
      m.normalScale = new THREE.Vector2(0.85, 0.85);
      // Let the environment reflect properly — the source had this at 1.
      m.envMapIntensity = 1.5;
      m.needsUpdate = true;
    }

    return { geometry: geos[0] ?? null, material };
  }, [scene]);
}

/**
 * A lightened copy of the model's material for the background beans.
 *
 * They need to go *lighter* to recede into the paper ground, and tinting
 * cannot do that — a material colour multiplies its texture and so only ever
 * darkens. Transparency blends them toward the page instead.
 */
function useDimmed(material: THREE.Material | null, dim: number) {
  return useMemo(() => {
    if (!material) return null;
    const m = material.clone();
    m.transparent = true;
    m.opacity = 1 - dim * 0.72;
    m.depthWrite = false;
    return m;
  }, [material, dim]);
}

export default function HeroBean() {
  const hero = useRef<THREE.Group>(null);
  const backA = useRef<THREE.Group>(null);
  const backB = useRef<THREE.Group>(null);

  const { geometry, material } = useBean();
  const dimA = useDimmed(material, 0.45);
  const dimB = useDimmed(material, 0.62);
  const { viewport } = useThree();
  const target = useRef({ x: 0, y: 0 });

  // Centre the model on its own bounding box, so rotation happens about the
  // bean rather than about wherever Blender's origin happened to sit.
  useLayoutEffect(() => {
    if (geometry) geometry.center();
  }, [geometry]);

  useFrame((state, delta) => {
    const t = state.clock.elapsedTime;

    if (hero.current) {
      // A slow drift, not a spin. A full rotation would hide the fissure —
      // the one feature that makes the shape legible — most of the time.
      target.current.x = Math.sin(t * 0.17 + 1.1) * 0.1 + state.pointer.y * 0.2;
      target.current.y = Math.sin(t * 0.22) * 0.34 + state.pointer.x * 0.3;

      // Critically-damped follow. `1 - exp(-k*dt)` is frame-rate independent,
      // unlike a raw lerp factor.
      const k = 1 - Math.exp((-delta * 1) / (DUR.base * 0.5));
      hero.current.rotation.x += (target.current.x - hero.current.rotation.x) * k;
      hero.current.rotation.y += (target.current.y - hero.current.rotation.y) * k;
      hero.current.position.y = Math.sin(t * 0.5) * 0.06 - viewport.height * 0.02;
    }

    // The background pair run on their own clocks and lag the pointer, so the
    // group reads as depth rather than as one rigid object.
    if (backA.current) {
      backA.current.rotation.y = Math.sin(t * 0.15 + 2.0) * 0.5 + state.pointer.x * 0.12;
      backA.current.rotation.x = Math.sin(t * 0.13) * 0.3;
      backA.current.position.y = 0.9 + Math.sin(t * 0.37 + 1.0) * 0.1;
    }
    if (backB.current) {
      backB.current.rotation.y = Math.sin(t * 0.11 + 4.0) * 0.6 - state.pointer.x * 0.1;
      backB.current.rotation.x = Math.sin(t * 0.19 + 2.5) * 0.35;
      backB.current.position.y = -1.1 + Math.sin(t * 0.31 + 2.2) * 0.12;
    }
  });

  if (!geometry || !material) return null;

  // Sized off height alone: tying it to width made the bean swallow the
  // headline on wide screens. Sits right of centre, clear of the copy.
  const scale = viewport.height * 0.19;
  const x = viewport.width * 0.29;

  return (
    <group position={[x, 0, 0]}>
      <group ref={hero} rotation={[0.2, 0, 0.35]}>
        <mesh geometry={geometry} material={material} scale={scale} rotation={UPRIGHT} />
      </group>

      {/* Pushed back in Z and tinted toward the paper ground, which reads as
          aerial perspective without paying for a depth-of-field pass. */}
      <group ref={backA} position={[-0.85, 0.9, -1.6]}>
        <mesh
          geometry={geometry}
          material={dimA ?? material}
          scale={scale * 0.42}
          rotation={[UPRIGHT[0], 0.6, UPRIGHT[2] - 0.5]}
        />
      </group>
      <group ref={backB} position={[0.95, -1.1, -2.4]}>
        <mesh
          geometry={geometry}
          material={dimB ?? material}
          scale={scale * 0.3}
          rotation={[UPRIGHT[0], -0.4, UPRIGHT[2] + 0.8]}
        />
      </group>
    </group>
  );
}

useGLTF.preload(MODEL);
